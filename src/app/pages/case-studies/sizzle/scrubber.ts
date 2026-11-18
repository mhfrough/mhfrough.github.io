import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  computed,
  inject,
  signal,
} from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { phosphorPause, phosphorPlay, phosphorSkipBack, phosphorSkipForward } from '@ng-icons/phosphor-icons/regular';
import { COPY, CUES, REEL } from './sizzle.copy';

const FRAMES = REEL.duration * REEL.fps; // 750
const START = Math.round(4 * REEL.fps); // opens on the reveal, the bronze poster

const pad = (n: number, w = 2) => String(n).padStart(w, '0');
/** SMPTE-style timecode, HH:MM:SS:FF at the reel's 30 fps, as the Sizzle page and the reel itself print it. */
export const timecode = (frame: number) => {
  const s = Math.floor(frame / REEL.fps);
  return `00:${pad(Math.floor(s / 60))}:${pad(s % 60)}:${pad(frame % REEL.fps)}`;
};

/**
 * Hero demo: a storyboard of the Sizzle trailer. The timeline is the trailer's real cue list (sizzle-reel.json) laid
 * out over 25 seconds; the frame shows one still per cue, taken from the 4K render. Drag the playhead (a range input,
 * so arrows step one frame and Page Up/Down jump), skip cue to cue, or play it in real time. Playback runs on
 * requestAnimationFrame only while the card is on screen and the tab is visible. Renders on the server at the reveal.
 */
@Component({
  selector: 'mh-sz-scrubber',
  imports: [NgIcon],
  viewProviders: [provideIcons({ phosphorPlay, phosphorPause, phosphorSkipBack, phosphorSkipForward })],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { role: 'group', '[attr.aria-label]': 't.label' },
  template: `
    <div class="bar">
      <span class="file"><i aria-hidden="true"></i>{{ t.file }}</span>
      <span class="spec">{{ t.spec }}</span>
    </div>

    <div class="body">
      <div class="frame" [class.zones]="safe()">
        <img
          [src]="'/images/sizzle/still-' + cue().still + '.webp'"
          [alt]="cue().alt"
          width="432"
          height="768"
          fetchpriority="high"
          decoding="async"
        />
        <span class="zone zone--top" aria-hidden="true">{{ t.zoneTop }}</span>
        <span class="zone zone--bottom" aria-hidden="true">{{ t.zoneBottom }}</span>
      </div>

      <div class="info">
        <p class="count mono">{{ t.cueOf }} {{ pad(index() + 1) }} {{ t.of }} {{ cues.length }}</p>
        <p class="name">{{ cue().name }}</p>
        <p class="note">{{ cue().note }}</p>
        <dl class="clock mono">
          <div>
            <dt class="sr-only">Timecode</dt>
            <dd class="tc">{{ tc() }}</dd>
          </div>
          <div>
            <dt>{{ t.frame }}</dt>
            <dd>{{ pad(frame(), 3) }} / {{ total }}</dd>
          </div>
        </dl>
        <button type="button" class="chip" [attr.aria-pressed]="safe()" (click)="safe.set(!safe())">{{ t.safe }}</button>
        @if (safe()) {
          <p class="safe-note">{{ t.safeNote }}</p>
        }
      </div>
    </div>

    <div class="transport">
      <div class="btns">
        <button type="button" class="tb" [attr.aria-label]="t.prev" (click)="step(-1)">
          <ng-icon name="phosphorSkipBack" aria-hidden="true" />
        </button>
        <button type="button" class="tb tb--play" [attr.aria-label]="playing() ? t.pause : t.play" (click)="toggle()">
          <ng-icon [name]="playing() ? 'phosphorPause' : 'phosphorPlay'" aria-hidden="true" />
        </button>
        <button type="button" class="tb" [attr.aria-label]="t.next" (click)="step(1)">
          <ng-icon name="phosphorSkipForward" aria-hidden="true" />
        </button>
      </div>

      <div class="lane">
        <div class="blocks" aria-hidden="true">
          @for (b of blocks; track b.name; let i = $index) {
            <span class="block" [class.on]="i === index()" [style.left.%]="b.left" [style.width.%]="b.width">
              @if (b.width > 6) {
                <b>{{ b.name }}</b>
              }
            </span>
          }
        </div>
        <span class="head" aria-hidden="true" [style.left.%]="(frame() / (total - 1)) * 100"></span>
        <input
          type="range"
          min="0"
          [max]="total - 1"
          step="1"
          [value]="frame()"
          [attr.aria-label]="t.playhead"
          [attr.aria-valuetext]="tc() + ', ' + cue().name"
          (input)="seek($event)"
        />
      </div>
    </div>
  `,
  styleUrl: './scrubber.scss',
})
export class SizzleScrubber {
  protected readonly t = COPY.scrubber;
  protected readonly cues = CUES;
  protected readonly total = FRAMES;
  protected readonly pad = pad;

  protected readonly frame = signal(START);
  protected readonly playing = signal(false);
  protected readonly safe = signal(false);

  protected readonly index = computed(() => {
    const s = this.frame() / REEL.fps;
    let i = 0;
    for (let k = 0; k < CUES.length; k++) if (CUES[k].t <= s) i = k;
    return i;
  });
  protected readonly cue = computed(() => CUES[this.index()]);
  protected readonly tc = computed(() => timecode(this.frame()));

  /** Cue blocks over the 25 s timeline; the first starts at 0 so the lane has no gap. */
  protected readonly blocks = CUES.map((c, i) => {
    const a = i === 0 ? 0 : c.t;
    const b = i + 1 < CUES.length ? CUES[i + 1].t : REEL.duration;
    return { name: c.name, left: (a / REEL.duration) * 100, width: ((b - a) / REEL.duration) * 100 };
  });

  private raf = 0;
  private last = 0;
  private pos = START; // fractional frame while playing
  private visible = true;

  constructor() {
    const host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    const destroy = inject(DestroyRef);
    afterNextRender(() => {
      // Warm the other stills so scrubbing never shows a blank frame.
      for (const c of CUES) new Image().src = `/images/sizzle/still-${c.still}.webp`;
      const io = new IntersectionObserver(([e]) => {
        this.visible = e.isIntersecting;
        if (!this.visible) this.stop();
      });
      io.observe(host);
      const onHide = () => document.hidden && this.stop();
      document.addEventListener('visibilitychange', onHide);
      destroy.onDestroy(() => {
        io.disconnect();
        document.removeEventListener('visibilitychange', onHide);
        cancelAnimationFrame(this.raf);
      });
    });
  }

  protected seek(e: Event): void {
    this.stop();
    this.frame.set(+(e.target as HTMLInputElement).value);
  }

  protected step(dir: 1 | -1): void {
    this.stop();
    const i = this.index();
    const atStart = this.frame() > Math.round(CUES[i].t * REEL.fps) + 6; // back from mid-cue goes to its start
    const to = dir < 0 ? (atStart ? i : Math.max(0, i - 1)) : Math.min(CUES.length - 1, i + 1);
    this.frame.set(to === 0 ? 0 : Math.round(CUES[to].t * REEL.fps));
  }

  protected toggle(): void {
    if (this.playing()) return this.stop();
    if (!this.visible) return;
    if (this.frame() >= FRAMES - 1) this.frame.set(0);
    this.pos = this.frame();
    this.playing.set(true);
    this.last = performance.now();
    const tick = (now: number) => {
      this.pos += ((now - this.last) / 1000) * REEL.fps;
      this.last = now;
      if (this.pos >= FRAMES - 1) {
        this.frame.set(FRAMES - 1);
        return this.stop();
      }
      this.frame.set(Math.floor(this.pos));
      this.raf = requestAnimationFrame(tick);
    };
    this.raf = requestAnimationFrame(tick);
  }

  private stop(): void {
    cancelAnimationFrame(this.raf);
    this.playing.set(false);
  }
}
