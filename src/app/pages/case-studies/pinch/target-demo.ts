import { ChangeDetectionStrategy, Component, DestroyRef, afterNextRender, computed, inject, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { phosphorArrowCounterClockwise, phosphorPlay } from '@ng-icons/phosphor-icons/regular';
import { MEASURED, SAMPLES, type Sample, bytes } from './pinch.samples';

type Fmt = 'image/jpeg' | 'image/webp';
interface Attempt {
  n: number;
  w: number;
  h: number;
  q: number;
  bytes: number;
  fits: boolean;
}

// Pinch's own numbers (engine.js fitTarget and app.js targetBytes): start at the chosen quality, search down to
// quality 30 in at most 7 halving steps (5 for AVIF), then shrink the picture by 0.85 x 0.85 steps and search again.
const STEP = 0.85;
const LOW_Q = 30;
const ITERS = 7;
const START_Q = 80; // Pinch's default quality
const TARGETS = [50, 100, 200];
const PAUSE_MS = 140;

/**
 * Pinch's target-size search, run live. It is the same loop as fitTarget() in Pinch's engine.js, ported line for
 * line, but it encodes with this browser's own canvas encoder instead of MozJPEG and libwebp: try the starting
 * quality; if the file is too big, halve the quality range until the highest quality that fits is found; if even
 * quality 30 is too big, make the picture smaller by as many 0.85 x 0.85 steps as the size ratio suggests and search
 * again. Every attempt is listed as it happens. Targets are in kilobytes of 1,000 bytes, as in Pinch. Only a click
 * starts it; the 2400 x 1600 sample is fetched from this site on that click, and nothing leaves the tab.
 */
@Component({
  selector: 'mh-pn-target',
  imports: [NgIcon],
  viewProviders: [provideIcons({ phosphorArrowCounterClockwise, phosphorPlay })],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="tg card">
      <div class="controls">
        <div class="opt" role="group" aria-labelledby="pnt-photo">
          <span id="pnt-photo" class="k mono">Photo</span>
          <div class="seg">
            @for (s of samples; track s.id) {
              <button type="button" [attr.aria-pressed]="sample().id === s.id" (click)="setSample(s)">{{ s.name }}</button>
            }
          </div>
        </div>
        <div class="opt" role="group" aria-labelledby="pnt-under">
          <span id="pnt-under" class="k mono">Fit under</span>
          <div class="seg">
            @for (t of targets; track t) {
              <button type="button" [attr.aria-pressed]="target() === t" (click)="setTarget(t)">{{ t }} KB</button>
            }
          </div>
        </div>
        <div class="opt" role="group" aria-labelledby="pnt-as">
          <span id="pnt-as" class="k mono">Save as</span>
          <div class="seg">
            @for (f of fmts(); track f) {
              <button type="button" [attr.aria-pressed]="fmt() === f" (click)="setFmt(f)">{{ f === 'image/jpeg' ? 'JPG' : 'WebP' }}</button>
            }
          </div>
        </div>
        <span class="grow"></span>
        <button type="button" class="btn btn-solid btn-sm" (click)="start()" [disabled]="running()">
          <ng-icon [name]="attempts().length && !running() ? 'phosphorArrowCounterClockwise' : 'phosphorPlay'" aria-hidden="true" />{{ running() ? 'Searching' : attempts().length ? 'Run again' : 'Find the size' }}
        </button>
      </div>

      <div class="body">
        <ol class="log" role="list" aria-label="Attempts">
          @for (a of attempts(); track a.n) {
            <li [class.fit]="a.fits">
              <span class="mono n">{{ a.n }}</span>
              <span class="mono what">q {{ a.q }} · {{ a.w }} × {{ a.h }}</span>
              <span class="bar" aria-hidden="true">
                <i [style.transform]="'scaleX(' + share(a.bytes) + ')'"></i>
                <b [style.left.%]="share(targetBytes()) * 100"></b>
              </span>
              <span class="mono size">{{ bytesOf(a.bytes) }}</span>
              <span class="mono verdict">{{ a.fits ? 'fits' : 'over' }}</span>
            </li>
          } @empty {
            <li class="empty">
              {{ loading() ? 'Loading the ' + sample().name.toLowerCase() + ' photo, ' + bytesOf(sample().fullBytes) + '...' : 'Press Find the size. Each attempt appears here: quality, pixel size, and the file it made.' }}
            </li>
          }
        </ol>

        <aside class="sum" aria-live="polite">
          <p class="k mono">Fit under {{ target() }} KB</p>
          @if (result(); as r) {
            <p class="big">{{ bytesOf(r.bytes) }}</p>
            <p class="line">{{ r.fits ? 'Quality ' + r.q + ' fits' : 'The smallest it could make' }}{{ r.w < 2400 ? ', at ' + r.w + ' × ' + r.h : ', full size' }}. {{ attempts().length }} encodes.</p>
          } @else {
            <p class="big muted">{{ running() ? '...' : 'Not run yet' }}</p>
            <p class="line">From {{ bytesOf(sample().fullBytes) }}, 2400 × 1600, starting at quality {{ startQ }}.</p>
          }
          @if (pinch(); as m) {
            <div class="ref">
              <p class="k mono">Pinch, with MozJPEG</p>
              <p class="line"><b>{{ bytesOf(m.bytes) }}</b> at quality {{ m.q }}{{ m.w < 2400 ? ', ' + m.w + ' × ' + m.h : ', full size' }}</p>
            </div>
          }
        </aside>
      </div>
      <p class="note">Same search as Pinch, encoded by this browser's canvas, so sizes differ from the app.@if (fmt() === 'image/jpeg' && sample().id !== 'hills') { Pick Hills to see Pinch's own measured result next to it.}</p>
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
    .tg {
      display: grid;
      gap: 16px;
      min-width: 0;
    }
    .controls {
      display: flex;
      flex-wrap: wrap;
      align-items: flex-end;
      gap: 12px;
    }
    .opt {
      display: grid;
      gap: 6px;
    }
    .k {
      font-size: 11.5px;
      color: var(--muted);
    }
    .grow {
      flex: 1;
    }
    .seg button {
      height: 34px;
      padding: 0 12px;
    }
    .body {
      display: grid;
      grid-template-columns: minmax(0, 1fr) 240px;
      gap: 16px;
      align-items: start;
    }
    .log {
      display: grid;
      gap: 4px;
      margin: 0;
      padding: 10px;
      list-style: none;
      min-height: 230px;
      align-content: start;
      border-radius: var(--r-inner);
      background: var(--bg-2);
      border: 1px solid var(--line);

      li {
        display: grid;
        grid-template-columns: 22px 150px minmax(40px, 1fr) 64px 38px;
        align-items: center;
        gap: 10px;
        padding: 5px 8px;
        border-radius: 8px;
        font-size: 12.5px;
        color: var(--ink-2);
      }
      li.fit {
        background: var(--pn-good-soft, var(--surface));
      }
      .n {
        color: var(--muted);
      }
      .what {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .size {
        text-align: right;
        color: var(--ink);
      }
      .verdict {
        color: var(--muted);
      }
      .fit .verdict {
        color: var(--pn-good, var(--ink));
      }
      .empty {
        display: block;
        padding: 8px;
        font-size: 13.5px;
        color: var(--muted);
      }
    }
    .bar {
      position: relative;
      height: 8px;
      border-radius: 999px;
      background: var(--surface-2);

      i {
        position: absolute;
        inset: 0;
        border-radius: 999px;
        background: var(--muted);
        transform-origin: left;
      }
      b {
        position: absolute;
        top: -4px;
        bottom: -4px;
        width: 2px;
        margin-left: -1px;
        background: var(--pn-blue, var(--ink));
      }
    }
    .fit .bar i {
      background: var(--pn-good, var(--ink));
    }
    .sum {
      display: grid;
      gap: 6px;
      padding: 16px;
      border-radius: var(--r-inner);
      background: var(--surface-2);
    }
    .big {
      font-size: 1.9rem;
      font-weight: 600;
      letter-spacing: -0.035em;
      line-height: 1.1;
      font-variant-numeric: tabular-nums;
      color: var(--ink);
    }
    .big.muted {
      font-size: 1.1rem;
      letter-spacing: -0.01em;
      color: var(--muted);
    }
    .line {
      font-size: 13px;
      color: var(--ink-2);

      b {
        color: var(--ink);
        font-weight: 600;
      }
    }
    .ref {
      display: grid;
      gap: 4px;
      margin-top: 8px;
      padding-top: 12px;
      border-top: 1px solid var(--line-strong);
    }
    .note {
      font-size: 12.5px;
      color: var(--muted);
    }
    @media (max-width: 860px) {
      .body {
        grid-template-columns: 1fr;
      }
    }
    @media (max-width: 560px) {
      .log li {
        grid-template-columns: 16px minmax(0, 1fr) auto auto;
        gap: 8px;
        padding: 5px 6px;
        font-size: 12px;
      }
      .log .bar {
        display: none;
      }
    }
  `,
})
export class PinchTargetDemo {
  protected readonly samples = SAMPLES;
  protected readonly targets = TARGETS;
  protected readonly startQ = START_Q;
  protected readonly bytesOf = bytes;

  protected readonly sample = signal<Sample>(SAMPLES[3]);
  protected readonly target = signal(100);
  protected readonly fmt = signal<Fmt>('image/jpeg');
  protected readonly fmts = signal<Fmt[]>(['image/jpeg']);
  protected readonly attempts = signal<Attempt[]>([]);
  protected readonly running = signal(false);
  protected readonly loading = signal(false);
  protected readonly result = signal<Attempt | null>(null);

  protected readonly targetBytes = computed(() => this.target() * 1000);
  private readonly maxBytes = computed(() => Math.max(this.targetBytes() * 1.25, ...this.attempts().map((a) => a.bytes)));
  /** Pinch's measured result, shown only where one exists: hills.jpg as JPG. */
  protected readonly pinch = computed(() => (this.sample().id === 'hills' && this.fmt() === 'image/jpeg' ? MEASURED.target[this.target()] : null));

  private run = 0;
  private photo: { src: string; img: HTMLImageElement } | null = null;

  constructor() {
    inject(DestroyRef).onDestroy(() => this.run++);
    afterNextRender(() => {
      const c = document.createElement('canvas');
      c.width = c.height = 1;
      if (c.toDataURL('image/webp').startsWith('data:image/webp')) this.fmts.set(['image/jpeg', 'image/webp']);
    });
  }

  protected share(n: number): number {
    return Math.min(1, n / this.maxBytes());
  }

  protected setSample(s: Sample): void {
    this.clear(() => this.sample.set(s));
  }

  protected setTarget(t: number): void {
    this.clear(() => this.target.set(t));
  }

  protected setFmt(f: Fmt): void {
    this.clear(() => this.fmt.set(f));
  }

  /** Any change of photo, target or format clears the log, so a result never sits next to settings it did not use. */
  private clear(fn: () => void): void {
    this.run++;
    fn();
    this.running.set(false);
    this.loading.set(false);
    this.attempts.set([]);
    this.result.set(null);
  }

  protected async start(): Promise<void> {
    const id = ++this.run;
    const s = this.sample();
    const fmt = this.fmt();
    const target = this.targetBytes();
    this.attempts.set([]);
    this.result.set(null);
    this.running.set(true);
    const alive = () => id === this.run;

    try {
      if (this.photo?.src !== s.full) {
        this.loading.set(true);
        const img = new Image();
        img.src = s.full;
        await img.decode();
        this.loading.set(false);
        if (!alive()) return;
        this.photo = { src: s.full, img };
      }
      const img = this.photo.img;
      const W = img.naturalWidth;
      const H = img.naturalHeight;
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      ctx.imageSmoothingQuality = 'high';
      let n = 0;

      const encode = async (w: number, h: number, q: number): Promise<Attempt> => {
        if (canvas.width !== w || canvas.height !== h) {
          canvas.width = w;
          canvas.height = h;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, w, h);
        }
        const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, fmt, q / 100));
        const a: Attempt = { n: ++n, w, h, q, bytes: blob?.size ?? Infinity, fits: (blob?.size ?? Infinity) <= target };
        if (alive()) this.attempts.update((l) => [...l, a]);
        await new Promise((r) => setTimeout(r, PAUSE_MS));
        return a;
      };

      // fitTarget(), lossy branch.
      const hiQ = START_Q;
      const loQ = Math.min(LOW_Q, hiQ);
      let scale = 1;
      let smallest: Attempt | null = null;
      for (let round = 0; round < 30 && alive(); round++) {
        const w = Math.max(1, Math.round(W * scale));
        const h = Math.max(1, Math.round(H * scale));
        let best: Attempt | null = null;
        let atScale = await encode(w, h, hiQ);
        if (atScale.fits) best = atScale;
        else {
          let lo = loQ;
          let hi = hiQ - 1;
          let iters = ITERS;
          while (lo <= hi && iters-- > 0 && alive()) {
            const mid = Math.round((lo + hi) / 2);
            const o = await encode(w, h, mid);
            if (o.fits) {
              best = o;
              lo = mid + 1;
            } else {
              if (o.bytes < atScale.bytes) atScale = o;
              hi = mid - 1;
            }
          }
          if (!best && atScale.q !== loQ && alive()) {
            const o = await encode(w, h, loQ);
            if (o.fits) best = o;
            else atScale = o;
          }
        }
        if (best) {
          this.finish(id, best);
          return;
        }
        if (!smallest || atScale.bytes < smallest.bytes) smallest = atScale;
        const ratio = target / atScale.bytes;
        const steps = Math.max(1, Math.ceil(Math.log(ratio) / Math.log(STEP * STEP)));
        scale *= Math.pow(STEP, steps);
        if (W * scale < 8 || H * scale < 8) break;
      }
      if (smallest) this.finish(id, smallest);
    } catch {
      if (alive()) this.running.set(false);
    } finally {
      if (alive()) {
        this.loading.set(false);
        this.running.set(false);
      }
    }
  }

  private finish(id: number, a: Attempt): void {
    if (id !== this.run) return;
    this.result.set(a);
    this.running.set(false);
  }
}
