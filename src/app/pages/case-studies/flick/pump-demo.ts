import { ChangeDetectionStrategy, Component, DestroyRef, ElementRef, afterNextRender, computed, inject, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { phosphorArrowCounterClockwise, phosphorPause, phosphorPlay } from '@ng-icons/phosphor-icons/regular';

const KB = 1024;
const MB = 1024 * KB;
// Flick's own numbers (app.js and net.js).
const CHUNK = 64 * KB;
const READ_BLOCK = 4 * MB;
const HIGH_WATER = 8 * MB;
const LOW = 1 * MB; // bufferedAmountLowThreshold
const FOLD = 64; // receiver folds parts into a Blob every 64 chunks

// The simulation: a 240 MB file, a sender that can hand over 6 MB per step, and a link that drains less.
const FILE = 240 * MB;
const SENDER = 6 * MB;
const TICK_MS = 40;
const LINKS = {
  fast: { label: 'Quiet Wi-Fi', drain: 2 * MB },
  slow: { label: 'Busy Wi-Fi', drain: 0.9 * MB },
} as const;
type Link = keyof typeof LINKS;
type Phase = 'offer' | 'sending' | 'flushing' | 'done';

const W = 600;
const H = 150;
const PAD = 6;

const mb = (n: number): string => (n >= 100 * MB ? `${Math.round(n / MB)} MB` : `${(n / MB).toFixed(1)} MB`);

/**
 * Back-pressure, simulated. Flick's send loop (pump() in app.js) reads the file 4 MB at a time and sends 64 KB
 * pieces; before each piece, if the data channel's bufferedAmount is above 8 MB it waits for the browser's
 * "bufferedamountlow" event, which fires at 1 MB. This runs the same rule against a pretend link so the buffer can be
 * watched: a saw-tooth between 1 and 8 MB with the wait on, a mountain without it. Only a click starts it; it pauses
 * while scrolled out of view and stops on destroy. Numbers update as text; no motion beyond the chart redrawing.
 */
@Component({
  selector: 'mh-fl-pump',
  imports: [NgIcon],
  viewProviders: [provideIcons({ phosphorArrowCounterClockwise, phosphorPause, phosphorPlay })],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="pump card">
      <div class="controls">
        <div class="seg" role="group" aria-label="Link">
          @for (l of linkIds; track l) {
            <button type="button" [attr.aria-pressed]="link() === l" (click)="setLink(l)">{{ links[l].label }}</button>
          }
        </div>
        <button type="button" class="chip" [attr.aria-pressed]="wait()" (click)="toggleWait()">
          Wait for buffer low: {{ wait() ? 'on' : 'off' }}
        </button>
        <span class="grow"></span>
        <button type="button" class="btn btn-solid btn-sm" (click)="toggle()" [disabled]="phase() === 'done'">
          <ng-icon [name]="running() ? 'phosphorPause' : 'phosphorPlay'" aria-hidden="true" />{{ running() ? 'Pause' : sent() ? 'Resume' : 'Send 240 MB' }}
        </button>
        <button type="button" class="btn btn-ghost btn-sm" (click)="reset()" [disabled]="!sent()">
          <ng-icon name="phosphorArrowCounterClockwise" aria-hidden="true" />Reset
        </button>
      </div>

      <ol class="phases" role="list" aria-label="Transfer status">
        @for (p of phases; track p.id) {
          <li [class.on]="phase() === p.id" [class.past]="phaseIndex() > $index">{{ p.label }}</li>
        }
      </ol>

      <figure class="chart">
        <svg [attr.viewBox]="'0 0 ' + w + ' ' + h" preserveAspectRatio="none" role="img" [attr.aria-label]="chartLabel()">
          <rect class="zone" x="0" [attr.y]="y(highWater)" [attr.width]="w" [attr.height]="y(low) - y(highWater)" />
          <line class="hw" x1="0" [attr.x2]="w" [attr.y1]="y(highWater)" [attr.y2]="y(highWater)" />
          <line class="lw" x1="0" [attr.x2]="w" [attr.y1]="y(low)" [attr.y2]="y(low)" />
          <polyline class="buf" [attr.points]="points()" />
        </svg>
        <figcaption class="legend mono">
          <span><i class="k-buf"></i>bufferedAmount</span>
          <span><i class="k-hw"></i>8 MB: stop sending</span>
          <span><i class="k-lw"></i>1 MB: buffer low, carry on</span>
        </figcaption>
      </figure>

      <dl class="stats">
        <div>
          <dt>Read from the file</dt>
          <dd class="mono">block {{ block() }} of {{ blocks }}</dd>
        </div>
        <div>
          <dt>Handed to the channel</dt>
          <dd class="mono">{{ mbf(sent()) }} · {{ chunksSent() }} chunks</dd>
        </div>
        <div>
          <dt>Arrived</dt>
          <dd class="mono">{{ mbf(received()) }} · {{ folded() }} Blobs folded</dd>
        </div>
        <div>
          <dt>In the buffer now</dt>
          <dd class="mono" [class.hot]="buffered() > highWater + chunk">{{ mbf(buffered()) }}{{ paused() ? ' · waiting' : '' }}</dd>
        </div>
        <div>
          <dt>Peak buffer</dt>
          <dd class="mono" [class.hot]="peak() > highWater + chunk">{{ mbf(peak()) }}</dd>
        </div>
      </dl>

      <div class="bars" aria-hidden="true">
        <div class="bar"><span>Sent</span><b><i [style.transform]="'scaleX(' + sent() / file + ')'"></i></b></div>
        <div class="bar"><span>Arrived</span><b><i class="arr" [style.transform]="'scaleX(' + received() / file + ')'"></i></b></div>
      </div>

      <p class="sr-only" aria-live="polite">{{ announce() }}</p>
    </div>
  `,
  styles: `
    :host {
      display: block;
      min-width: 0;
    }
    p {
      margin: 0;
    }
    .pump {
      display: grid;
      gap: 16px;
      min-width: 0;
    }
    .controls {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 8px;
    }
    .grow {
      flex: 1;
    }
    .seg button {
      height: 34px;
    }
    .chip {
      height: 40px;
      padding: 0 14px;
      cursor: pointer;
    }
    .btn-sm {
      height: 40px;
      padding: 0 16px;
      font-size: 14px;
    }
    .phases {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin: 0;
      padding: 0;
      list-style: none;

      li {
        padding: 4px 12px;
        border-radius: 999px;
        border: 1px solid var(--line);
        font-family: var(--font-mono);
        font-size: 12px;
        color: var(--muted);
      }
      .past {
        color: var(--ink-2);
      }
      .on {
        background: var(--fl-lime, var(--cta));
        border-color: var(--fl-lime, var(--cta));
        color: var(--fl-lime-ink, var(--cta-ink));
      }
    }
    .chart {
      margin: 0;
      display: grid;
      gap: 8px;

      svg {
        display: block;
        width: 100%;
        height: 150px;
        border-radius: var(--r-inner);
        background: var(--bg-2, var(--bg));
      }
    }
    .zone {
      fill: var(--fl-lime-soft, var(--accent-soft));
      opacity: 0.6;
    }
    .hw,
    .lw {
      stroke-width: 1;
      vector-effect: non-scaling-stroke;
      stroke-dasharray: 4 4;
    }
    .hw {
      stroke: var(--fl-danger, var(--ink-2));
    }
    .lw {
      stroke: var(--muted);
    }
    .buf {
      fill: none;
      stroke: var(--fl-lime, var(--ink));
      stroke-width: 2;
      stroke-linejoin: round;
      vector-effect: non-scaling-stroke;
    }
    .legend {
      display: flex;
      flex-wrap: wrap;
      gap: 6px 16px;
      font-size: 11.5px;
      color: var(--muted);

      span {
        display: inline-flex;
        align-items: center;
        gap: 6px;
      }
      i {
        width: 14px;
        height: 0;
        border-top: 2px solid var(--fl-lime, var(--ink));
      }
      .k-hw {
        border-top: 1px dashed var(--fl-danger, var(--ink-2));
      }
      .k-lw {
        border-top: 1px dashed var(--muted);
      }
    }
    .stats {
      display: grid;
      grid-template-columns: repeat(5, minmax(0, 1fr));
      gap: 12px;
      margin: 0;

      dt {
        font-size: 12px;
        color: var(--muted);
      }
      dd {
        margin: 2px 0 0;
        font-size: 13px;
        color: var(--ink);
      }
      .hot {
        color: var(--fl-danger, var(--ink));
      }
    }
    .bars {
      display: grid;
      gap: 8px;
    }
    .bar {
      display: grid;
      grid-template-columns: 64px minmax(0, 1fr);
      align-items: center;
      gap: 10px;

      span {
        font-size: 12px;
        color: var(--muted);
      }
      b {
        display: block;
        height: 6px;
        border-radius: 999px;
        background: var(--bg-2, var(--bg));
        overflow: hidden;
      }
      i {
        display: block;
        height: 100%;
        background: var(--ink-2);
        transform-origin: left;
        transform: scaleX(0);
      }
      .arr {
        background: var(--fl-lime, var(--ink));
      }
    }

    @media (max-width: 900px) {
      .stats {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
    }
  `,
})
export class FlickPumpDemo {
  protected readonly links = LINKS;
  protected readonly linkIds = Object.keys(LINKS) as Link[];
  protected readonly w = W;
  protected readonly h = H;
  protected readonly file = FILE;
  protected readonly highWater = HIGH_WATER;
  protected readonly low = LOW;
  protected readonly chunk = CHUNK;
  protected readonly blocks = Math.ceil(FILE / READ_BLOCK);
  protected readonly mbf = mb;
  protected readonly phases: { id: Phase; label: string }[] = [
    { id: 'offer', label: 'offer, accepted' },
    { id: 'sending', label: 'sending' },
    { id: 'flushing', label: 'flushing, waiting for got' },
    { id: 'done', label: 'done' },
  ];

  protected readonly link = signal<Link>('slow');
  protected readonly wait = signal(true);
  protected readonly running = signal(false);
  protected readonly sent = signal(0);
  protected readonly received = signal(0);
  protected readonly paused = signal(false);
  protected readonly peak = signal(0);
  protected readonly history = signal<number[]>([]);
  protected readonly announce = signal('');

  protected readonly buffered = computed(() => this.sent() - this.received());
  protected readonly chunksSent = computed(() => Math.ceil(this.sent() / CHUNK).toLocaleString('en-US'));
  protected readonly folded = computed(() => Math.floor(Math.floor(this.received() / CHUNK) / FOLD));
  protected readonly block = computed(() => Math.min(this.blocks, Math.ceil(this.sent() / READ_BLOCK)));
  protected readonly phase = computed<Phase>(() =>
    this.received() >= FILE ? 'done' : this.sent() >= FILE ? 'flushing' : this.sent() > 0 ? 'sending' : 'offer',
  );
  protected readonly phaseIndex = computed(() => this.phases.findIndex((p) => p.id === this.phase()));

  private readonly yMax = computed(() => Math.max(12 * MB, this.peak() * 1.1));
  private readonly expected = computed(() => Math.ceil(FILE / LINKS[this.link()].drain) + 4);

  protected readonly points = computed(() => {
    const hist = this.history();
    const n = Math.max(this.expected(), hist.length);
    return hist.map((b, i) => `${((i / n) * W).toFixed(1)},${this.y(b).toFixed(1)}`).join(' ');
  });

  protected readonly chartLabel = computed(
    () =>
      `Bytes waiting in the data channel buffer over time. Peak so far ${mb(this.peak())}; the wait keeps it between 1 and 8 MB.`,
  );

  private timer: ReturnType<typeof setInterval> | null = null;
  private visible = true;

  constructor() {
    const host = inject<ElementRef<HTMLElement>>(ElementRef);
    const destroy = inject(DestroyRef);
    destroy.onDestroy(() => this.stopTimer());
    afterNextRender(() => {
      if (typeof IntersectionObserver === 'undefined') return;
      const io = new IntersectionObserver(([e]) => (this.visible = e.isIntersecting));
      io.observe(host.nativeElement);
      destroy.onDestroy(() => io.disconnect());
    });
  }

  protected y(bytes: number): number {
    return H - PAD - (Math.min(bytes, this.yMax()) / this.yMax()) * (H - 2 * PAD);
  }

  protected setLink(l: Link): void {
    this.link.set(l);
    this.reset();
  }

  protected toggleWait(): void {
    this.wait.update((v) => !v);
    this.reset();
  }

  protected toggle(): void {
    if (this.running()) {
      this.stopTimer();
      this.running.set(false);
      return;
    }
    this.running.set(true);
    this.timer = setInterval(() => this.tick(), TICK_MS);
    if (!this.sent()) this.announce.set(`Accepted. Sending 240 MB over ${LINKS[this.link()].label.toLowerCase()}.`);
  }

  protected reset(): void {
    this.stopTimer();
    this.running.set(false);
    this.sent.set(0);
    this.received.set(0);
    this.paused.set(false);
    this.peak.set(0);
    this.history.set([]);
  }

  private stopTimer(): void {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
  }

  /** One step: the link drains, the buffer-low event may fire, then the sender sends as far as the rule allows. */
  private tick(): void {
    if (!this.visible) return;
    const drain = Math.min(this.buffered(), LINKS[this.link()].drain);
    let received = this.received() + drain;
    let sent = this.sent();
    let paused = this.paused();
    const buffered = () => sent - received;

    if (paused && buffered() <= LOW) paused = false; // bufferedamountlow fired
    if (!paused && sent < FILE) {
      let budget = SENDER;
      while (budget > 0 && sent < FILE) {
        if (this.wait() && buffered() > HIGH_WATER) {
          paused = true;
          break;
        }
        const piece = Math.min(CHUNK, FILE - sent);
        sent += piece;
        budget -= piece;
      }
    }
    received = Math.min(received, sent);

    this.sent.set(sent);
    this.received.set(received);
    this.paused.set(paused && sent < FILE);
    this.peak.update((p) => Math.max(p, sent - received));
    this.history.update((h) => [...h, sent - received]);

    if (received >= FILE) {
      this.stopTimer();
      this.running.set(false);
      this.announce.set(`Done. The buffer peaked at ${mb(this.peak())}.`);
    }
  }
}
