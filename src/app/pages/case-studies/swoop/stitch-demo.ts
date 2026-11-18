import { ChangeDetectionStrategy, Component, DestroyRef, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

// A made-up long page, 240 x 800 CSS px, seen through a 200 px tall window: four screens, like background.js
// positions (0, 200, 400, then total minus one screen).
const PW = 240;
const PH = 800;
const VH = 200;
const POSITIONS = [0, 200, 400, 600];

// background.js and capture.js timings (DEFAULTS and the constants), in ms.
const CAPTURE_GAP = 550;
const SETTLE = 250;
const PRE_DELAY = 120;
const PRE_END = 350;
const PRE_BACK = 400;
const PRE_STEP = Math.round(VH * 0.85);
/** After the first pass, capture.js waits for images (up to 2.5 s); here they are in after this long. */
const IMG_WAIT = 350;
/** How long a lazy image takes to arrive here once it scrolls into view: longer than one screen's settle. */
const LOAD_MS = 700;

interface Img {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  color: string;
}

const IMAGES: Img[] = [
  { id: 'a', x: 16, y: 136, w: 208, h: 52, color: '#ffd6a5' },
  { id: 'b', x: 16, y: 300, w: 208, h: 80, color: '#a0c4ff' },
  { id: 'c', x: 16, y: 438, w: 100, h: 92, color: '#caffbf' },
  { id: 'd', x: 124, y: 438, w: 100, h: 92, color: '#ffc6ff' },
  { id: 'e', x: 16, y: 612, w: 208, h: 88, color: '#bdb2ff' },
];

/** Static page blocks (cards and text bars), drawn the same in every view. */
const BLOCKS: { x: number; y: number; w: number; h: number; fill: string; rx: number }[] = [
  { x: 16, y: 40, w: 150, h: 12, fill: '#16161a', rx: 3 },
  { x: 16, y: 58, w: 104, h: 12, fill: '#16161a', rx: 3 },
  { x: 16, y: 80, w: 180, h: 5, fill: '#c9c6c0', rx: 2.5 },
  { x: 16, y: 90, w: 140, h: 5, fill: '#c9c6c0', rx: 2.5 },
  { x: 16, y: 106, w: 56, h: 16, fill: '#ff5a1f', rx: 8 },
  { x: 16, y: 206, w: 100, h: 74, fill: '#ffffff', rx: 8 },
  { x: 124, y: 206, w: 100, h: 74, fill: '#ffffff', rx: 8 },
  { x: 26, y: 218, w: 60, h: 6, fill: '#16161a', rx: 3 },
  { x: 26, y: 232, w: 76, h: 4, fill: '#c9c6c0', rx: 2 },
  { x: 26, y: 241, w: 64, h: 4, fill: '#c9c6c0', rx: 2 },
  { x: 134, y: 218, w: 52, h: 6, fill: '#16161a', rx: 3 },
  { x: 134, y: 232, w: 76, h: 4, fill: '#c9c6c0', rx: 2 },
  { x: 134, y: 241, w: 58, h: 4, fill: '#c9c6c0', rx: 2 },
  { x: 16, y: 394, w: 196, h: 5, fill: '#c9c6c0', rx: 2.5 },
  { x: 16, y: 404, w: 170, h: 5, fill: '#c9c6c0', rx: 2.5 },
  { x: 16, y: 414, w: 120, h: 5, fill: '#c9c6c0', rx: 2.5 },
  { x: 16, y: 548, w: 208, h: 44, fill: '#ffffff', rx: 8 },
  { x: 28, y: 562, w: 90, h: 6, fill: '#16161a', rx: 3 },
  { x: 28, y: 575, w: 150, h: 4, fill: '#c9c6c0', rx: 2 },
  { x: 0, y: 716, w: 240, h: 84, fill: '#e7e5df', rx: 0 },
  { x: 16, y: 736, w: 64, h: 6, fill: '#8a8780', rx: 3 },
  { x: 16, y: 750, w: 120, h: 4, fill: '#b5b2ab', rx: 2 },
  { x: 16, y: 760, w: 96, h: 4, fill: '#b5b2ab', rx: 2 },
];

/** Images fully inside the first screen load with the page; the rest are lazy. */
const EAGER = new Set(IMAGES.filter((i) => i.y + i.h <= VH).map((i) => i.id));

interface Strip {
  y: number;
  header: boolean;
  bar: boolean;
  loaded: string[];
}

const showHeader = (i: number, once: boolean) => !once || i === 0;
const showBar = (i: number, once: boolean) => !once || i === POSITIONS.length - 1;

/** What a capture with these settings produces, screen by screen (the model the animation plays out). */
function result(pre: boolean, once: boolean): Strip[] {
  const all = IMAGES.map((i) => i.id);
  return POSITIONS.map((y, i) => ({
    y,
    header: showHeader(i, once),
    bar: showBar(i, once),
    // Without the first pass, a lazy image only starts loading when its screen arrives, and is still on its way when
    // that screen is taken. Images above the screen were seen by earlier screens, but that is not what this strip shows.
    loaded: pre ? all : all.filter((id) => EAGER.has(id)),
  }));
}

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

/**
 * Scroll and stitch, simulated: a long page with a fixed header, a fixed cookie bar and lazy images, captured one
 * screen at a time with Swoop's timings. The two switches are Swoop's own options ("scroll the page first", "show
 * fixed headers once"). The stitched picture renders on the server for the default settings; Capture plays it out.
 */
@Component({
  selector: 'mh-swoop-stitch',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="sim card">
      <div class="ctrls">
        <div class="opts" role="group" aria-label="Capture settings">
          <button type="button" class="chip" [attr.aria-pressed]="pre()" (click)="toggle('pre')" [disabled]="running()">Scroll the page first</button>
          <button type="button" class="chip" [attr.aria-pressed]="once()" (click)="toggle('once')" [disabled]="running()">Show fixed bars once</button>
        </div>
        <button type="button" class="btn btn-solid btn-sm" (click)="run()" [disabled]="running()">{{ running() ? 'Capturing' : 'Capture the page' }}</button>
      </div>

      <div class="views">
        <figure class="tab">
          <figcaption class="cap"><span class="mono k">Tab</span><span class="mono v">scrollY {{ y() }}</span></figcaption>
          <div class="win">
            <div class="win-bar" aria-hidden="true"><span class="dots"><i></i><i></i><i></i></span></div>
            <svg viewBox="0 0 240 200" role="img" [attr.aria-label]="tabLabel()">
              <g class="scroller" [style.transform]="'translateY(' + -y() + 'px)'">
                <rect width="240" height="800" fill="#f5f4f0" />
                @for (b of blocks; track $index) {
                  <rect [attr.x]="b.x" [attr.y]="b.y" [attr.width]="b.w" [attr.height]="b.h" [attr.rx]="b.rx" [attr.fill]="b.fill" />
                }
                @for (im of images; track im.id) {
                  <rect [attr.x]="im.x" [attr.y]="im.y" [attr.width]="im.w" [attr.height]="im.h" rx="6" [attr.fill]="tabLoaded().includes(im.id) ? im.color : '#e7e5df'" />
                  @if (!tabLoaded().includes(im.id)) {
                    <circle [attr.cx]="im.x + im.w / 2" [attr.cy]="im.y + im.h / 2" r="7" fill="none" stroke="#b5b2ab" stroke-width="2" stroke-dasharray="11 33" />
                  }
                }
              </g>
              @if (tabHeader()) {
                <g>
                  <rect width="240" height="24" fill="#16161a" />
                  <circle cx="14" cy="12" r="5" fill="#ff5a1f" />
                  <rect x="150" y="10" width="20" height="4" rx="2" fill="#5c5a55" />
                  <rect x="178" y="10" width="20" height="4" rx="2" fill="#5c5a55" />
                  <rect x="206" y="10" width="20" height="4" rx="2" fill="#5c5a55" />
                </g>
              }
              @if (tabBar()) {
                <g>
                  <rect x="8" y="166" width="224" height="28" rx="8" fill="#ffffff" stroke="#e7e5df" />
                  <rect x="18" y="178" width="120" height="4" rx="2" fill="#b5b2ab" />
                  <rect x="190" y="172" width="32" height="16" rx="8" fill="#ff5a1f" />
                </g>
              }
              @if (scrollbar()) {
                <rect x="234" [attr.y]="2 + (y() / 600) * 146" width="4" height="50" rx="2" fill="#8a8780" opacity="0.7" />
              }
            </svg>
          </div>
        </figure>

        <figure class="out">
          <figcaption class="cap"><span class="mono k">Picture</span><span class="mono v">{{ strips().length }}/4</span></figcaption>
          <svg class="pic" viewBox="0 0 240 800" role="img" [attr.aria-label]="picLabel()">
            <rect width="240" height="800" class="ground" />
            @for (s of strips(); track $index; let i = $index) {
              <svg [attr.y]="s.y" width="240" height="200" [attr.viewBox]="'0 ' + s.y + ' 240 200'">
                <rect width="240" height="800" fill="#f5f4f0" />
                @for (b of blocks; track $index) {
                  <rect [attr.x]="b.x" [attr.y]="b.y" [attr.width]="b.w" [attr.height]="b.h" [attr.rx]="b.rx" [attr.fill]="b.fill" />
                }
                @for (im of images; track im.id) {
                  <rect [attr.x]="im.x" [attr.y]="im.y" [attr.width]="im.w" [attr.height]="im.h" rx="6" [attr.fill]="s.loaded.includes(im.id) ? im.color : '#e7e5df'" />
                }
                @if (s.header) {
                  <g [attr.transform]="'translate(0 ' + s.y + ')'">
                    <rect width="240" height="24" fill="#16161a" />
                    <circle cx="14" cy="12" r="5" fill="#ff5a1f" />
                    <rect x="150" y="10" width="20" height="4" rx="2" fill="#5c5a55" />
                    <rect x="178" y="10" width="20" height="4" rx="2" fill="#5c5a55" />
                    <rect x="206" y="10" width="20" height="4" rx="2" fill="#5c5a55" />
                  </g>
                }
                @if (s.bar) {
                  <g [attr.transform]="'translate(0 ' + s.y + ')'">
                    <rect x="8" y="166" width="224" height="28" rx="8" fill="#ffffff" stroke="#e7e5df" />
                    <rect x="18" y="178" width="120" height="4" rx="2" fill="#b5b2ab" />
                    <rect x="190" y="172" width="32" height="16" rx="8" fill="#ff5a1f" />
                  </g>
                }
              </svg>
              @if (i > 0) {
                <line x1="0" x2="240" [attr.y1]="s.y" [attr.y2]="s.y" class="seam" />
              }
            }
          </svg>
        </figure>
      </div>

      <dl class="tally">
        <div [class.bad]="headerCount() > 1">
          <dt>Header</dt>
          <dd class="mono">{{ headerCount() }}×</dd>
        </div>
        <div [class.bad]="barCount() > 1">
          <dt>Cookie bar</dt>
          <dd class="mono">{{ barCount() }}×</dd>
        </div>
        <div [class.bad]="blankCount() > 0">
          <dt>Blank images</dt>
          <dd class="mono">{{ blankCount() }}</dd>
        </div>
        <div>
          <dt>Time</dt>
          <dd class="mono">{{ time() }}</dd>
        </div>
      </dl>
      <p class="mono status" aria-live="polite">{{ status() }}</p>
    </div>
  `,
  styles: `
    :host {
      display: block;
      min-width: 0;
    }
    .sim {
      padding: 0;
      overflow: hidden;
    }
    .ctrls {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 10px 16px;
      padding: 12px 14px;
      border-bottom: 1px solid var(--line);
    }
    .opts {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
    .chip[aria-pressed='true'] {
      background: var(--sw-orange-soft);
      border-color: var(--sw-orange-line);
      color: var(--ink);
    }
    .chip:disabled,
    .btn:disabled {
      opacity: 0.6;
      cursor: default;
    }
    .views {
      display: grid;
      grid-template-columns: minmax(0, 1fr) minmax(120px, 190px);
      gap: 24px;
      align-items: start;
      padding: 18px;
      background: var(--sw-stage);
    }
    figure {
      margin: 0;
      min-width: 0;
    }
    .cap {
      display: flex;
      justify-content: space-between;
      gap: 8px;
      margin-bottom: 8px;
      font-size: 11.5px;

      .k {
        color: var(--ink-2);
      }
      .v {
        color: var(--muted);
      }
    }
    .win {
      border-radius: 10px;
      overflow: hidden;
      border: 1px solid var(--line-strong);
      box-shadow: var(--shadow);

      svg {
        display: block;
        width: 100%;
        height: auto;
        aspect-ratio: 240 / 200;
      }
    }
    .win-bar {
      height: 24px;
      display: flex;
      align-items: center;
      padding: 0 10px;
      background: var(--surface-2);
      border-bottom: 1px solid var(--line);

      .dots {
        display: flex;
        gap: 5px;
      }
      i {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: var(--line-strong);
      }
    }
    .scroller {
      transition: transform 110ms var(--ease);
    }
    .pic {
      display: block;
      width: 100%;
      height: auto;
      aspect-ratio: 240 / 800;
      border-radius: 6px;
      border: 1px solid var(--line-strong);
    }
    .ground {
      fill: var(--sw-stage);
    }
    .seam {
      stroke: var(--sw-orange);
      stroke-width: 1.5;
      stroke-dasharray: 4 4;
    }
    .tally {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      margin: 0;
      border-top: 1px solid var(--line);

      div {
        padding: 12px 16px;

        & + div {
          border-left: 1px solid var(--line);
        }
      }
      dt {
        font-size: 12px;
        color: var(--muted);
      }
      dd {
        margin: 2px 0 0;
        font-size: 15px;
        color: var(--ink);
      }
      .bad dd {
        color: var(--sw-orange-text);
      }
    }
    .status {
      margin: 0;
      padding: 10px 16px 12px;
      border-top: 1px solid var(--line);
      font-size: 12px;
      color: var(--muted);
    }
    @media (max-width: 560px) {
      .views {
        grid-template-columns: minmax(0, 1fr) 104px;
        gap: 14px;
        padding: 12px;
      }
      .tally {
        grid-template-columns: repeat(2, minmax(0, 1fr));

        div:nth-child(3) {
          border-left: 0;
        }
        div:nth-child(n + 3) {
          border-top: 1px solid var(--line);
        }
      }
    }
    @media (prefers-reduced-motion: reduce) {
      .scroller {
        transition: none;
      }
    }
  `,
})
export class SwoopStitchDemo {
  protected readonly blocks = BLOCKS;
  protected readonly images = IMAGES;

  protected readonly pre = signal(true);
  protected readonly once = signal(true);
  protected readonly running = signal(false);
  protected readonly strips = signal<Strip[]>(result(true, true));
  protected readonly status = signal('Ready. Turn a setting off, then capture the page again.');
  protected readonly elapsed = signal<number | null>(null);

  // The live tab
  protected readonly y = signal(0);
  protected readonly tabHeader = signal(true);
  protected readonly tabBar = signal(true);
  protected readonly scrollbar = signal(true);
  protected readonly tabLoaded = signal<string[]>([...EAGER]);

  protected readonly headerCount = computed(() => this.strips().filter((s) => s.header).length);
  protected readonly barCount = computed(() => this.strips().filter((s) => s.bar).length);
  protected readonly blankCount = computed(() => {
    // An image counts as blank when any screen that shows part of it took it before it arrived.
    const blank = new Set<string>();
    for (const s of this.strips())
      for (const im of IMAGES) if (im.y < s.y + VH && im.y + im.h > s.y && !s.loaded.includes(im.id)) blank.add(im.id);
    return blank.size;
  });
  /** Simulated time: the first pass (when on), then one screen per CAPTURE_GAP. */
  protected readonly time = computed(() => {
    const e = this.elapsed();
    if (e !== null) return (e / 1000).toFixed(1) + ' s';
    const passes = Math.ceil((PH - VH) / PRE_STEP);
    const pre = this.pre() ? passes * PRE_DELAY + PRE_END + PRE_BACK + IMG_WAIT : 0;
    return 'about ' + ((pre + SETTLE + (POSITIONS.length - 1) * CAPTURE_GAP) / 1000).toFixed(1) + ' s';
  });
  protected readonly tabLabel = computed(
    () => `A long page in a browser tab, scrolled to ${this.y()} of 600 pixels, ${this.tabHeader() ? 'with' : 'without'} its fixed header and ${this.tabBar() ? 'with' : 'without'} its cookie bar`,
  );
  protected readonly picLabel = computed(
    () =>
      `The stitched picture, ${this.strips().length} of 4 screens: the header appears ${this.headerCount()} times, the cookie bar ${this.barCount()} times, and ${this.blankCount()} images are blank`,
  );

  private readonly browser = isPlatformBrowser(inject(PLATFORM_ID));
  private run_ = 0;

  constructor() {
    inject(DestroyRef).onDestroy(() => this.run_++);
  }

  protected toggle(which: 'pre' | 'once'): void {
    (which === 'pre' ? this.pre : this.once).update((v) => !v);
    this.elapsed.set(null);
    this.strips.set(result(this.pre(), this.once()));
    this.status.set(
      `${which === 'pre' ? 'Scroll the page first' : 'Show fixed bars once'} is ${(which === 'pre' ? this.pre() : this.once()) ? 'on' : 'off'}. The picture shows the result; capture to watch it happen.`,
    );
  }

  protected async run(): Promise<void> {
    if (this.running() || !this.browser) return;
    const token = ++this.run_;
    const live = () => token === this.run_;
    const pre = this.pre();
    const once = this.once();
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      this.strips.set(result(pre, once));
      this.elapsed.set(null);
      this.status.set(`Captured 4 screens. ${this.summary()}`);
      return;
    }

    this.running.set(true);
    this.strips.set([]);
    this.tabLoaded.set([...EAGER]);
    this.y.set(0);
    const t0 = performance.now();
    const loading = new Map<string, ReturnType<typeof setTimeout>>();
    const see = () => {
      const top = this.y();
      for (const im of IMAGES) {
        if (im.y < top + VH && im.y + im.h > top && !this.tabLoaded().includes(im.id) && !loading.has(im.id)) {
          loading.set(im.id, setTimeout(() => live() && this.tabLoaded.update((l) => [...l, im.id]), LOAD_MS));
        }
      }
    };

    try {
      // prepare: hide scroll bars, then the first pass that wakes lazy images up
      this.scrollbar.set(false);
      if (pre) {
        this.status.set('Scrolling through once, so lazy images start loading');
        for (let y = PRE_STEP; ; y += PRE_STEP) {
          this.y.set(Math.min(y, PH - VH));
          see();
          await sleep(PRE_DELAY);
          if (!live()) return;
          if (y >= PH - VH) break;
        }
        await sleep(PRE_END);
        this.y.set(0);
        await sleep(PRE_BACK);
        this.status.set('Back at the top, waiting for images and fonts');
        await sleep(IMG_WAIT);
        if (!live()) return;
      }

      let last = 0;
      for (let i = 0; i < POSITIONS.length; i++) {
        this.y.set(POSITIONS[i]);
        this.tabHeader.set(showHeader(i, once));
        this.tabBar.set(showBar(i, once));
        see();
        this.status.set(`Screen ${i + 1} of 4: waiting for it to settle`);
        await sleep(SETTLE);
        const wait = last + CAPTURE_GAP - performance.now();
        if (i > 0 && wait > 0) {
          this.status.set(`Screen ${i + 1} of 4: Chrome allows two captures a second`);
          await sleep(wait);
        }
        if (!live()) return;
        last = performance.now();
        this.strips.update((s) => [...s, { y: POSITIONS[i], header: this.tabHeader(), bar: this.tabBar(), loaded: [...this.tabLoaded()] }]);
      }
      this.elapsed.set(performance.now() - t0);
      this.status.set(`Done: 4 screens joined into one picture. ${this.summary()}`);
    } finally {
      if (live()) {
        // restore: the page goes back exactly as it was
        this.y.set(0);
        this.tabHeader.set(true);
        this.tabBar.set(true);
        this.scrollbar.set(true);
        this.running.set(false);
      }
      for (const t of loading.values()) clearTimeout(t);
    }
  }

  private summary(): string {
    const h = this.headerCount();
    const b = this.barCount();
    const n = this.blankCount();
    return `Header ${h === 1 ? 'once' : h + ' times'}, cookie bar ${b === 1 ? 'once' : b + ' times'}, ${n === 0 ? 'no blank images' : n + (n === 1 ? ' blank image' : ' blank images')}.`;
  }
}
