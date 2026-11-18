import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { phosphorArrowCounterClockwise, phosphorCheck, phosphorHandPalm } from '@ng-icons/phosphor-icons/regular';

type Who = 'agent' | 'ask' | 'gate';
type Status = 'idle' | 'working' | 'waiting' | 'done';

interface Step {
  n: string;
  name: string;
  who: Who;
  badge: string;
  does: string;
}

interface Choice {
  label: string;
  primary?: boolean;
  act: () => void;
}

interface Line {
  id: number;
  from: 'you' | 'agent';
  text: string;
}

// The nine steps of skills/sizzle/SKILL.md (v3), in its own words, shortened.
const STEPS: readonly Step[] = [
  { n: '01', name: 'Brief', who: 'agent', badge: 'Agent', does: 'Reads the README, HTML, stylesheet and code. Notes the promise, real features, allowed claims and brand.' },
  { n: '02', name: 'Concepts', who: 'ask', badge: 'You pick', does: 'Three different ideas, checked against recent reels.' },
  { n: '03', name: 'Script', who: 'gate', badge: 'Gate 1', does: 'Beats, on-screen words and sound, with a claims check. Nothing is built before this yes.' },
  { n: '04', name: 'Direction', who: 'agent', badge: 'Agent', does: 'Format, palette, type, motion, camera and sound, checked against every earlier reel.' },
  { n: '05', name: 'Build', who: 'agent', badge: 'Agent', does: 'The reel as an HTML page on the bare engine, every time in one CUES object.' },
  { n: '06', name: 'Self-check', who: 'agent', badge: 'Agent', does: 'Key frames to a contact sheet: early elements, clipped text, contrast, console errors.' },
  { n: '07', name: 'Picture', who: 'gate', badge: 'Gate 2', does: 'You watch the preview and the contact sheet. Changes go back to the build.' },
  { n: '08', name: 'Sound', who: 'ask', badge: 'You pick', does: 'A free track (asked before downloading) or a bed made on your machine, plus sound effects.' },
  { n: '09', name: 'Render', who: 'agent', badge: 'Agent', does: 'Frames, then an MP4 at -14 LUFS and a poster. The reel is recorded so the next one differs.' },
];

// Concept types from references/concepts.md.
const CONCEPTS = [
  { k: 'A', type: 'problem-solution', fmt: '9:16, 25 s', line: 'Pain, turn, the product fixing it, the ask.' },
  { k: 'B', type: 'ui-pov', fmt: '4:5, 15 s', line: 'The whole reel is the screen, in one take.' },
  { k: 'C', type: 'kinetic-poem', fmt: '1:1, 8 s', line: 'Pure type, a few words a beat, the product at the end.' },
];

const T = {
  label: 'Simulation of the Sizzle workflow',
  steps: 'The nine steps',
  monitor: 'Agent',
  start: 'Ask for a reel',
  ask: 'make a promo reel for this app',
  reset: 'Start again',
  frames: '4K frames rendered',
  downloads: 'Files downloaded',
  your: 'Your turn',
  working: 'Working',
  done: 'Done',
  pending: 'Next',
  idle: 'The agent waits for a request. Nothing has been read, built, downloaded or rendered.',
};

const WORK_MS = 1100;

/**
 * The workflow demo: Sizzle's nine steps with the four places it stops for a person. Agent steps run on timers; the
 * concept pick, script gate, picture gate and music pick wait for a button. "Ask for changes" on the picture goes back
 * to the build, as the skill does. Two counters show that no 4K frame is rendered and nothing is downloaded until the
 * gates are passed. Timers only (no motion), cleared on destroy; the render counter steps, it does not animate.
 */
@Component({
  selector: 'mh-sz-gates',
  imports: [NgIcon],
  viewProviders: [provideIcons({ phosphorCheck, phosphorHandPalm, phosphorArrowCounterClockwise })],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { role: 'group', '[attr.aria-label]': 'T.label' },
  template: `
    <ol class="steps" role="list" [attr.aria-label]="T.steps">
      @for (s of steps; track s.n; let i = $index) {
        <li [class]="'st st--' + state(i)" [class.is-gate]="s.who !== 'agent'" [attr.aria-current]="i === at() && status() !== 'done' && status() !== 'idle' ? 'step' : null">
          <span class="dot" aria-hidden="true">
            @if (state(i) === 'done') {
              <ng-icon name="phosphorCheck" />
            } @else if (state(i) === 'waiting') {
              <ng-icon name="phosphorHandPalm" />
            } @else {
              {{ s.n }}
            }
          </span>
          <span class="txt">
            <b>{{ s.name }}</b>
            <span>{{ s.does }}</span>
          </span>
          <span class="who" [class.who--you]="s.who !== 'agent'">{{ s.badge }}</span>
          <span class="sr-only">, {{ stateLabel(i) }}</span>
        </li>
      }
    </ol>

    <div class="monitor">
      <div class="m-head">
        <span class="mono">{{ T.monitor }}</span>
        @if (status() !== 'idle') {
          <button type="button" class="reset" (click)="reset()">
            <ng-icon name="phosphorArrowCounterClockwise" aria-hidden="true" />{{ T.reset }}
          </button>
        }
      </div>

      <ol class="log" role="list">
        @if (status() === 'idle') {
          <li class="ln ln--agent">{{ T.idle }}</li>
        }
        @for (l of log(); track l.id) {
          <li class="ln" [class.ln--you]="l.from === 'you'" [class.ln--agent]="l.from === 'agent'">
            <span class="from mono">{{ l.from === 'you' ? 'You' : 'Agent' }}</span>
            <span>{{ l.text }}</span>
          </li>
        }
        @if (status() === 'working') {
          <li class="ln ln--agent ln--busy" aria-hidden="true"><span class="from mono">Agent</span><span class="busy"><i></i><i></i><i></i></span></li>
        }
      </ol>

      @if (rendering()) {
        <div class="meter" aria-hidden="true">
          <span class="mono">frame {{ pad(frames()) }} / 750</span>
          <span class="track"><i [style.width.%]="(frames() / 750) * 100"></i></span>
        </div>
      }

      <div class="choices">
        @if (status() === 'idle') {
          <button type="button" class="btn btn-solid btn-sm" (click)="start()">{{ T.start }}</button>
        }
        @if (status() === 'waiting') {
          @for (c of choices(); track c.label) {
            <button type="button" class="btn btn-sm" [class.btn-solid]="c.primary" [class.btn-ghost]="!c.primary" (click)="c.act()">{{ c.label }}</button>
          }
        }
      </div>

      <dl class="counters">
        <div [class.lit]="frames() > 0">
          <dt>{{ T.frames }}</dt>
          <dd class="mono">{{ frames() }}</dd>
        </div>
        <div [class.lit]="downloads() > 0">
          <dt>{{ T.downloads }}</dt>
          <dd class="mono">{{ downloads() }}</dd>
        </div>
      </dl>
      <p class="sr-only" aria-live="polite">{{ live() }}</p>
    </div>
  `,
  styles: `
    :host {
      display: grid;
      grid-template-columns: minmax(0, 1.05fr) minmax(0, 0.95fr);
      gap: 16px;
      align-items: start;
    }
    p, dl, dd, ol {
      margin: 0;
    }
    ol {
      padding: 0;
      list-style: none;
    }
    .steps {
      display: grid;
      gap: 6px;
    }
    .st {
      display: grid;
      grid-template-columns: 32px minmax(0, 1fr) auto;
      gap: 12px;
      align-items: center;
      padding: 10px 14px 10px 10px;
      border-radius: var(--r-inner);
      background: var(--surface);
      border: 1px solid var(--line);
      transition: border-color var(--t-base) var(--ease), background var(--t-base) var(--ease), opacity var(--t-base) var(--ease);
    }
    .st--pending {
      opacity: 0.62;
    }
    .st--working {
      border-color: var(--line-strong);
      background: var(--surface-2);
    }
    .st--waiting {
      border-color: var(--sz-bronze);
      background: var(--sz-bronze-soft);
    }
    .dot {
      display: grid;
      place-items: center;
      width: 32px;
      height: 32px;
      border-radius: 999px;
      background: var(--surface-2);
      font-family: var(--font-mono);
      font-size: 11.5px;
      color: var(--muted);
    }
    .dot ng-icon {
      font-size: 16px;
    }
    .st--done .dot {
      background: var(--surface-2);
      color: var(--sz-bronze-hi);
    }
    .st--working .dot {
      color: var(--ink);
      box-shadow: inset 0 0 0 1px var(--sz-bronze);
    }
    .st--waiting .dot {
      background: var(--sz-bronze);
      color: var(--sz-bronze-ink);
    }
    .txt {
      display: grid;
      gap: 2px;
      min-width: 0;
    }
    .txt b {
      font-size: 14.5px;
      font-weight: 600;
      color: var(--ink);
    }
    .txt span {
      font-size: 13px;
      line-height: 1.45;
      color: var(--ink-2);
    }
    .who {
      font-family: var(--font-mono);
      font-size: 11px;
      padding: 3px 9px;
      border-radius: 999px;
      background: var(--surface-2);
      color: var(--muted);
      white-space: nowrap;
    }
    .who--you {
      background: var(--sz-bronze-soft);
      color: var(--sz-bronze-hi);
      box-shadow: inset 0 0 0 1px var(--sz-bronze-line);
    }
    .monitor {
      position: sticky;
      top: calc(var(--nav-h) + 32px);
      display: grid;
      gap: 14px;
      padding: 18px;
      border-radius: var(--r-card);
      background: var(--surface);
      border: 1px solid var(--line);
      box-shadow: var(--shadow);
    }
    .m-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      min-height: 36px;
    }
    .m-head .mono {
      font-size: 12px;
      color: var(--muted);
    }
    .reset {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      height: 36px;
      padding: 0 12px;
      border-radius: 999px;
      font-size: 13px;
      color: var(--ink-2);
      transition: background var(--t-base) var(--ease), color var(--t-base) var(--ease);
    }
    .reset:hover {
      background: var(--surface-2);
      color: var(--ink);
    }
    .log {
      display: grid;
      gap: 8px;
      align-content: start;
      min-height: 220px;
      padding: 12px;
      border-radius: var(--r-inner);
      background: var(--bg);
      border: 1px solid var(--line);
    }
    .ln {
      display: grid;
      gap: 2px;
      font-size: 13.5px;
      line-height: 1.5;
      color: var(--ink-2);
    }
    .ln--you {
      justify-self: end;
      max-width: 85%;
      padding: 8px 12px;
      border-radius: var(--r-inner);
      background: var(--sz-bronze-soft);
      color: var(--ink);
      box-shadow: inset 0 0 0 1px var(--sz-bronze-line);
    }
    .from {
      font-size: 11px;
      color: var(--muted);
    }
    .ln--you .from {
      color: var(--sz-bronze-hi);
    }
    .busy {
      display: inline-flex;
      gap: 4px;
      padding: 6px 0;
    }
    .busy i {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: var(--muted);
    }
    @media (prefers-reduced-motion: no-preference) {
      .busy i {
        animation: blink 1s var(--ease-in-out) infinite;
      }
      .busy i:nth-child(2) {
        animation-delay: 0.15s;
      }
      .busy i:nth-child(3) {
        animation-delay: 0.3s;
      }
    }
    @keyframes blink {
      50% {
        opacity: 0.25;
      }
    }
    .meter {
      display: grid;
      gap: 6px;
    }
    .meter .mono {
      font-size: 12px;
      color: var(--ink-2);
      font-variant-numeric: tabular-nums;
    }
    .track {
      height: 6px;
      border-radius: 999px;
      background: var(--surface-2);
      overflow: hidden;
    }
    .track i {
      display: block;
      height: 100%;
      background: var(--sz-bronze);
    }
    .choices {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
    .choices:empty {
      display: none;
    }
    .btn-sm {
      height: 44px;
      padding: 0 16px;
      font-size: 14px;
    }
    .counters {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 8px;
    }
    .counters div {
      padding: 10px 12px;
      border-radius: var(--r-inner);
      background: var(--surface-2);
    }
    .counters dt {
      font-size: 12px;
      color: var(--muted);
    }
    .counters dd {
      font-size: 1.35rem;
      color: var(--ink);
      font-variant-numeric: tabular-nums;
    }
    .counters .lit dd {
      color: var(--sz-bronze-hi);
    }
    @media (max-width: 900px) {
      :host {
        grid-template-columns: 1fr;
      }
      .monitor {
        position: static;
        order: -1;
      }
      .log {
        min-height: 120px;
      }
    }
    @media (max-width: 480px) {
      .st {
        grid-template-columns: 32px minmax(0, 1fr);
      }
      .who {
        grid-column: 2;
        justify-self: start;
      }
    }
  `,
})
export class SizzleGatesDemo {
  protected readonly T = T;
  protected readonly steps = STEPS;
  protected readonly pad = (n: number) => String(n).padStart(3, '0');

  protected readonly at = signal(0);
  protected readonly status = signal<Status>('idle');
  protected readonly log = signal<Line[]>([]);
  protected readonly frames = signal(0);
  protected readonly downloads = signal(0);
  protected readonly rendering = signal(false);
  protected readonly live = signal('');
  protected readonly choices = signal<Choice[]>([]);

  private concept = CONCEPTS[0];
  private scriptRev = 1;
  private cut = 1;
  private id = 0;
  private timers: ReturnType<typeof setTimeout>[] = [];

  protected readonly state = (i: number): 'done' | 'working' | 'waiting' | 'pending' => {
    const s = this.status();
    if (s === 'idle') return 'pending';
    if (s === 'done' || i < this.at()) return 'done';
    if (i > this.at()) return 'pending';
    return s === 'waiting' ? 'waiting' : 'working';
  };
  protected readonly stateLabel = (i: number) =>
    ({ done: T.done, working: T.working, waiting: T.your, pending: T.pending })[this.state(i)];

  private readonly current = computed(() => STEPS[this.at()]);

  constructor() {
    inject(DestroyRef).onDestroy(() => this.clear());
  }

  protected start(): void {
    this.say('you', T.ask);
    this.run(0);
  }

  protected reset(): void {
    this.clear();
    this.at.set(0);
    this.status.set('idle');
    this.log.set([]);
    this.frames.set(0);
    this.downloads.set(0);
    this.rendering.set(false);
    this.choices.set([]);
    this.concept = CONCEPTS[0];
    this.scriptRev = 1;
    this.cut = 1;
    this.live.set('');
  }

  /** Runs step i: agent steps finish on a timer and move on; the four stops wait for a choice. */
  private run(i: number): void {
    this.at.set(i);
    this.status.set('working');
    this.choices.set([]);
    this.live.set(`${STEPS[i].name}: ${T.working}`);

    switch (i) {
      case 0:
        return this.after(() => {
          this.say('agent', 'Read README.md, index.html, the stylesheet and the app code. Brief written: audience, format, one message, allowed claims.');
          this.run(1);
        });
      case 1:
        return this.after(() => {
          this.say('agent', 'Checked recent reels with fingerprint.py fresh. Three concepts, each different. Which one?');
          this.wait(
            CONCEPTS.map((c) => ({
              label: `${c.k}. ${c.type}, ${c.fmt}`,
              primary: c.k === 'A',
              act: () => {
                this.concept = c;
                this.say('you', `${c.k}. ${c.line}`);
                this.run(2);
              },
            })),
          );
        });
      case 2:
        return this.after(() => {
          this.say('agent', `Script v${this.scriptRev}: ${this.concept.type}, ${this.concept.fmt}. Beats, words and sound, every claim with a source. Approve it, or tell me what to change?`);
          this.wait([
            { label: 'Approve the script', primary: true, act: () => (this.say('you', 'Approved.'), this.run(3)) },
            {
              label: 'Change a line',
              act: () => {
                this.scriptRev++;
                this.say('you', 'Shorter hook, please.');
                this.run(2);
              },
            },
          ]);
        });
      case 3:
        return this.after(() => {
          this.say('agent', 'Direction written: palette, type, motion, camera, music and SFX. fingerprint.py check: PASS.');
          this.run(4);
        });
      case 4:
        return this.after(() => {
          this.say('agent', `Cut ${this.cut} built from scratch on the bare engine. Every time is in CUES.`);
          this.run(5);
        });
      case 5:
        return this.after(() => {
          this.say('agent', 'Key frames rendered to a contact sheet and checked: nothing early, nothing clipped. fingerprint.py look: PASS.');
          this.run(6);
        });
      case 6:
        return this.after(() => {
          this.say('agent', `Cut ${this.cut} is ready. Preview at localhost:8123/promo/your-app-reel.html, key frames in stills/sheet.jpg. Approve it, or tell me what to change?`);
          this.wait([
            { label: 'Approve the picture', primary: true, act: () => (this.say('you', 'Approved. Lock it.'), this.run(7)) },
            {
              label: 'Ask for changes',
              act: () => {
                this.cut++;
                this.say('you', 'Hold the end card a little longer.');
                this.run(4);
              },
            },
          ]);
        }, 600);
      case 7:
        return this.after(() => {
          this.say('agent', 'Picture locked. Music next: a free track I shortlist, or a bed made on your machine?');
          this.wait([
            {
              label: 'Make a bed',
              primary: true,
              act: () => {
                this.say('you', 'Make a bed.');
                this.say('agent', 'synth.py bed: its downbeat lands on the drop, offset 0. Sound effects placed on the cues. Nothing downloaded.');
                this.run(8);
              },
            },
            {
              label: 'Find a track',
              act: () => {
                this.say('you', 'Find a track.');
                this.say('agent', 'Shortlist of three, free for commercial use, no Content ID. Download your-app-bgm.mp3 from cdn.pixabay.com, about 2.5 MB?');
                this.say('you', 'Yes, the first one.');
                this.downloads.set(1);
                this.say('agent', 'music_sync.py: the drop lands on the reveal. Sound effects placed on the cues.');
                this.run(8);
              },
            },
          ]);
        }, 600);
      case 8:
        return this.render();
    }
  }

  private render(): void {
    this.rendering.set(true);
    const total = 750;
    const tick = (n: number) => {
      this.frames.set(n);
      if (n < total) this.timers.push(setTimeout(() => tick(Math.min(total, n + 25)), 60));
      else
        this.after(() => {
          this.rendering.set(false);
          this.say('agent', 'videos/your-app-reel.mp4: 750 frames, H.264 High, -14 LUFS, peak under -1 dBTP, and a .webp poster. Recorded with fingerprint.py, so the next reel stays different.');
          this.status.set('done');
          this.live.set('Reel rendered.');
        }, 400);
    };
    tick(0);
  }

  private wait(choices: Choice[]): void {
    this.status.set('waiting');
    this.choices.set(choices);
    this.live.set(`${this.current().name}: ${T.your}`);
  }

  private say(from: Line['from'], text: string): void {
    this.log.update((l) => [...l, { id: ++this.id, from, text }].slice(-6));
  }

  private after(fn: () => void, ms = WORK_MS): void {
    this.timers.push(setTimeout(fn, ms));
  }

  private clear(): void {
    this.timers.forEach(clearTimeout);
    this.timers = [];
  }
}
