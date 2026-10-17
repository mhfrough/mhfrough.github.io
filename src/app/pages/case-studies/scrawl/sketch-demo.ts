import { ChangeDetectionStrategy, Component, ElementRef, Injectable, computed, inject, signal, viewChild } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  phosphorArrowCounterClockwise,
  phosphorArrowUpRight,
  phosphorCircle,
  phosphorDiamond,
  phosphorMoon,
  phosphorPencilSimple,
  phosphorSquare,
  phosphorSun,
  phosphorTrash,
} from '@ng-icons/phosphor-icons/regular';
import { DOT, type El, FILLS, type FillStyle, PAPER, type Point, type Rough, STROKES, bounds, build, dashFor, ink, seedFor } from './marker';

type Tool = 'rect' | 'ellipse' | 'diamond' | 'arrow' | 'draw';
type FillChoice = FillStyle | 'none';

const W = 560;
const H = 360;
const HISTORY_LIMIT = 60;
const MIN = 8;

/** Each marker ink gets a matching tint when it fills a shape (a pairing chosen for this demo). */
const TINT: Record<string, string> = {
  '#1d1d1b': FILLS[0],
  '#0078bf': FILLS[2],
  '#ff48b0': FILLS[1],
  '#00a95c': FILLS[3],
  '#ff6c2f': FILLS[4],
  '#e3342f': FILLS[1],
};
const INK_NAMES = ['Black', 'Blue', 'Pink', 'Green', 'Orange', 'Red'];

const base = (o: Partial<El> & Pick<El, 'id' | 'type' | 'x' | 'y' | 'w' | 'h'>, n: number): El => ({
  stroke: STROKES[0],
  bg: 'transparent',
  fill: 'offset',
  width: 2,
  rough: 1,
  seed: seedFor(n),
  ...o,
});

/** Idea, sketch, ship: the flow on Scrawl's own share card. */
const SEED: El[] = [
  base({ id: 's1', type: 'rect', x: 40, y: 58, w: 140, h: 84, bg: FILLS[0], label: 'idea' }, 1),
  base({ id: 's2', type: 'arrow', x: 194, y: 100, w: 0, h: 0, points: [[0, 0], [72, 0]] }, 2),
  base({ id: 's3', type: 'diamond', x: 278, y: 36, w: 156, h: 128, stroke: STROKES[1], bg: FILLS[2], label: 'sketch' }, 3),
  base({ id: 's4', type: 'arrow', x: 356, y: 176, w: 0, h: 0, points: [[0, 0], [0, 56]], stroke: STROKES[1] }, 4),
  base({ id: 's5', type: 'ellipse', x: 266, y: 242, w: 180, h: 88, stroke: STROKES[3], bg: FILLS[3], label: 'ship' }, 5),
  base(
    { id: 's6', type: 'draw', x: 462, y: 282, w: 0, h: 0, stroke: STROKES[3], points: [[0, 0], [5, 6], [10, 12], [16, 6], [24, -4], [32, -14], [40, -24]] },
    6,
  ),
];

/**
 * The drawing shared by the hero sketchpad and the ".scrawl file" panel further down the page, provided by the page
 * component. Hand and fill restyle every shape (that is the point of the demo); ink applies to what is drawn next.
 */
@Injectable()
export class ScrawlSketch {
  readonly elements = signal<El[]>(SEED);
  readonly rough = signal<Rough>(1);
  readonly fill = signal<FillChoice>('offset');
  readonly dark = signal(true);

  /** The elements as they are drawn: the global hand and fill applied. */
  readonly effective = computed<El[]>(() => {
    const rough = this.rough();
    const fill = this.fill();
    return this.elements().map((el) =>
      el.type === 'rect' || el.type === 'ellipse' || el.type === 'diamond'
        ? { ...el, rough, fill: fill === 'none' ? 'offset' : fill, bg: fill === 'none' ? 'transparent' : el.bg }
        : el.type === 'arrow' || el.type === 'line'
          ? { ...el, rough }
          : el,
    );
  });

  /** The same drawing as a .scrawl file: { type, version, name, elements, files }, one element per line. */
  readonly file = computed(() => {
    const els: string[] = [];
    for (const el of this.effective()) {
      const { label, points, end } = el;
      const r = (n: number) => Math.round(n * 100) / 100;
      // Field order as Scrawl writes them (scene.js sanitize).
      const out: Record<string, unknown> = {
        id: el.id,
        type: el.type,
        x: r(el.x),
        y: r(el.y),
        w: r(el.w),
        h: r(el.h),
        stroke: el.stroke,
        bg: el.bg,
        fill: el.fill,
        width: el.width,
        dash: 'solid',
        rough: el.rough,
        round: false,
        opacity: 1,
        seed: el.seed,
      };
      if (points) out['points'] = points.map(([x, y]) => [Math.round(x), Math.round(y)]);
      if (el.type === 'arrow') Object.assign(out, { start: 'none', end: end ?? 'triangle' });
      els.push(JSON.stringify(out));
      if (label) {
        const b = bounds(el);
        els.push(
          JSON.stringify({
            id: el.id + 't',
            type: 'text',
            x: Math.round(b.x + b.w / 2 - label.length * 5.5),
            y: Math.round(b.y + b.h / 2 - 14),
            stroke: el.stroke,
            text: label,
            fontSize: 22,
            font: 'hand',
            align: 'center',
          }),
        );
      }
    }
    return `{\n  "type": "scrawl",\n  "version": 1,\n  "name": "Idea to ship",\n  "elements": [\n    ${els.join(',\n    ')}\n  ],\n  "files": {}\n}`;
  });
}

interface Rendered {
  id: string;
  fills: { d: string; color: string }[];
  strokes: { d: string; color: string; width: number; dash: string | null }[];
  label?: { text: string; x: number; y: number; color: string };
}

/**
 * The hero sketchpad: draw boxes, circles, diamonds, arrows and pen lines with Scrawl's own marker maths (marker.ts),
 * then switch the hand (Steady, Loose, Wild), the print fill and the paper. Every shape keeps its seed, so a shape
 * looks the same while you drag it out, after you let go, and after any restyle. SVG only, rendered on the server
 * with the seed drawing; pointer and keyboard input start once it hydrates.
 */
@Component({
  selector: 'mh-scrawl-sketch',
  imports: [NgIcon],
  viewProviders: [
    provideIcons({
      phosphorArrowCounterClockwise,
      phosphorArrowUpRight,
      phosphorCircle,
      phosphorDiamond,
      phosphorMoon,
      phosphorPencilSimple,
      phosphorSquare,
      phosphorSun,
      phosphorTrash,
    }),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="pad card card--lift">
      <div class="bar" role="toolbar" aria-label="Sketch tools" aria-controls="sc-sketch-page">
        <div class="grp">
          @for (t of tools; track t.id) {
            <button type="button" class="tb" [attr.aria-pressed]="tool() === t.id" (click)="setTool(t.id)" [attr.aria-label]="t.label + ' (' + t.key + ')'" [title]="t.label + ' (' + t.key + ')'">
              <ng-icon [name]="t.icon" aria-hidden="true" />
            </button>
          }
        </div>
        <div class="grp">
          <button type="button" class="tb" (click)="undo()" [disabled]="!canUndo()" aria-label="Undo (Ctrl+Z)" title="Undo (Ctrl+Z)">
            <ng-icon name="phosphorArrowCounterClockwise" aria-hidden="true" />
          </button>
          <button type="button" class="tb" (click)="clear()" [disabled]="!s.elements().length" aria-label="Clear the page" title="Clear the page">
            <ng-icon name="phosphorTrash" aria-hidden="true" />
          </button>
          <button type="button" class="tb" [attr.aria-pressed]="s.dark()" (click)="toggleDark()" aria-label="Dark paper" title="Dark paper">
            <ng-icon [name]="s.dark() ? 'phosphorMoon' : 'phosphorSun'" aria-hidden="true" />
          </button>
        </div>
      </div>

      <svg
        #svg
        id="sc-sketch-page"
        class="page"
        viewBox="0 0 560 360"
        role="application"
        tabindex="0"
        aria-roledescription="sketchbook page"
        aria-label="Sketchpad"
        aria-describedby="sc-sketch-help"
        (pointerdown)="down($event)"
        (pointermove)="move($event)"
        (pointerup)="up()"
        (pointercancel)="up()"
        (keydown)="key($event)"
      >
        <defs>
          <pattern id="sc-sketch-dots" width="24" height="24" patternUnits="userSpaceOnUse">
            <circle cx="12" cy="12" r="1.1" [attr.fill]="dot()" />
          </pattern>
        </defs>
        <rect x="0" y="0" width="560" height="360" [attr.fill]="paper()" />
        <rect x="0" y="0" width="560" height="360" fill="url(#sc-sketch-dots)" />

        @for (r of rendered(); track r.id) {
          <g>
            @for (f of r.fills; track $index) {
              <path [attr.d]="f.d" [attr.fill]="f.color" />
            }
            @for (k of r.strokes; track $index) {
              <path [attr.d]="k.d" fill="none" [attr.stroke]="k.color" [attr.stroke-width]="k.width" [attr.stroke-dasharray]="k.dash" stroke-linecap="round" stroke-linejoin="round" />
            }
            @if (r.label; as l) {
              <text class="hand" [attr.x]="l.x" [attr.y]="l.y" [attr.fill]="l.color" text-anchor="middle" dominant-baseline="central">{{ l.text }}</text>
            }
          </g>
        }
        @if (draftRendered(); as r) {
          <g>
            @for (f of r.fills; track $index) {
              <path [attr.d]="f.d" [attr.fill]="f.color" />
            }
            @for (k of r.strokes; track $index) {
              <path [attr.d]="k.d" fill="none" [attr.stroke]="k.color" [attr.stroke-width]="k.width" stroke-linecap="round" stroke-linejoin="round" />
            }
          </g>
        }
      </svg>

      <div class="opts">
        <div class="opt" role="group" aria-labelledby="sc-hand-l">
          <span id="sc-hand-l" class="mono k">Hand</span>
          <div class="seg">
            @for (h of hands; track h.v) {
              <button type="button" [attr.aria-pressed]="s.rough() === h.v" (click)="setRough(h.v)">{{ h.label }}</button>
            }
          </div>
        </div>
        <div class="opt" role="group" aria-labelledby="sc-fill-l">
          <span id="sc-fill-l" class="mono k">Fill</span>
          <div class="seg">
            @for (f of fills; track f.v) {
              <button type="button" [attr.aria-pressed]="s.fill() === f.v" (click)="setFill(f.v)">{{ f.label }}</button>
            }
          </div>
        </div>
        <div class="opt" role="group" aria-labelledby="sc-ink-l">
          <span id="sc-ink-l" class="mono k">Ink</span>
          <div class="swatches">
            @for (c of inks; track c; let i = $index) {
              <button type="button" class="sw" [attr.aria-pressed]="stroke() === c" (click)="setInk(c, i)" [attr.aria-label]="inkNames[i]" [title]="inkNames[i]">
                <i [style.background]="inkOn(c)"></i>
              </button>
            }
          </div>
        </div>
      </div>

      <p class="mono status" aria-hidden="true">{{ s.elements().length }} marks · seed {{ lastSeed() }} · {{ hint() }}</p>
      <p id="sc-sketch-help" class="sr-only">
        Keys: R box, O circle, D diamond, A arrow, P pen. Drag on the page to draw, or press Enter to add a shape with the
        current tool. Delete removes the last mark, Control Z undoes. Hand, fill and paper restyle the whole page; ink applies
        to what you draw next.
      </p>
      <p class="sr-only" aria-live="polite">{{ announce() }}</p>
    </div>
  `,
  styles: `
    @font-face {
      font-family: 'Shantell Sans';
      src: url('/images/scrawl/fonts/ShantellSans-Variable.woff2') format('woff2');
      font-weight: 300 800;
      font-display: swap;
    }
    :host {
      display: block;
      min-width: 0;
    }
    .pad {
      padding: 0;
      overflow: hidden;
      background: var(--surface);
    }
    .bar {
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      gap: 6px;
      padding: 8px;
      border-bottom: 1px solid var(--line);
    }
    .grp {
      display: flex;
      gap: 2px;
      padding: 2px;
      border-radius: 999px;
      background: var(--surface-2);
      border: 1px solid var(--line);
    }
    .tb {
      width: 40px;
      height: 40px;
      border-radius: 999px;
      display: grid;
      place-items: center;
      color: var(--ink-2);

      ng-icon {
        font-size: 18px;
      }
      &:hover:not(:disabled) {
        color: var(--ink);
        background: var(--surface);
      }
      &[aria-pressed='true'] {
        background: var(--cta);
        color: var(--cta-ink);
      }
      &:disabled {
        color: var(--faint);
        cursor: default;
      }
    }
    .page {
      display: block;
      width: 100%;
      height: auto;
      aspect-ratio: 560 / 360;
      touch-action: none;
      cursor: crosshair;
      user-select: none;
      -webkit-user-select: none;

      &:focus:not(:focus-visible) {
        outline: none;
      }
      &:focus-visible {
        outline: 2px solid var(--focus);
        outline-offset: -2px;
      }
    }
    .hand {
      font-family: 'Shantell Sans', 'Segoe Print', 'Comic Sans MS', cursive;
      font-size: 22px;
      font-weight: 500;
      pointer-events: none;
    }
    .opts {
      display: flex;
      flex-wrap: wrap;
      gap: 8px 18px;
      padding: 10px 12px 4px;
      border-top: 1px solid var(--line);
    }
    .opt {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .k {
      font-size: 11px;
      color: var(--muted);
      min-width: 30px;
    }
    .seg {
      padding: 3px;
      gap: 2px;

      button {
        height: 34px;
        padding: 0 11px;
        font-size: 13px;
      }
    }
    .swatches {
      display: flex;
      gap: 0;
    }
    .sw {
      width: 34px;
      height: 40px;
      display: grid;
      place-items: center;
      border-radius: 999px;

      i {
        width: 20px;
        height: 20px;
        border-radius: 50%;
        box-shadow: 0 0 0 1px var(--line-strong);
        transition: transform var(--t-fast) var(--ease);
      }
      &[aria-pressed='true'] i {
        box-shadow:
          0 0 0 2px var(--surface),
          0 0 0 4px var(--cta);
      }
      &:hover i {
        transform: scale(1.12);
      }
    }
    .status {
      margin: 0;
      padding: 4px 14px 10px;
      font-size: 11.5px;
      color: var(--muted);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    @media (max-width: 520px) {
      .tb {
        width: 38px;
        height: 38px;
      }
      .seg button {
        padding: 0 9px;
      }
    }
    @media (prefers-reduced-motion: reduce) {
      .sw i {
        transition: none;
      }
    }
  `,
})
export class ScrawlSketchDemo {
  protected readonly s = inject(ScrawlSketch);

  protected readonly tools: { id: Tool; label: string; key: string; icon: string }[] = [
    { id: 'rect', label: 'Box', key: 'R', icon: 'phosphorSquare' },
    { id: 'ellipse', label: 'Circle', key: 'O', icon: 'phosphorCircle' },
    { id: 'diamond', label: 'Diamond', key: 'D', icon: 'phosphorDiamond' },
    { id: 'arrow', label: 'Arrow', key: 'A', icon: 'phosphorArrowUpRight' },
    { id: 'draw', label: 'Pen', key: 'P', icon: 'phosphorPencilSimple' },
  ];
  protected readonly hands: { v: Rough; label: string }[] = [
    { v: 0, label: 'Steady' },
    { v: 1, label: 'Loose' },
    { v: 2, label: 'Wild' },
  ];
  protected readonly fills: { v: FillChoice; label: string }[] = [
    { v: 'none', label: 'None' },
    { v: 'offset', label: 'Offset' },
    { v: 'solid', label: 'Solid' },
    { v: 'dots', label: 'Dots' },
  ];
  protected readonly inks = STROKES;
  protected readonly inkNames = INK_NAMES;

  protected readonly tool = signal<Tool>('rect');
  protected readonly stroke = signal<string>(STROKES[0]);
  protected readonly announce = signal('');
  private readonly draft = signal<El | null>(null);
  private readonly past = signal<El[][]>([]);
  protected readonly canUndo = computed(() => this.past().length > 0);

  protected readonly paper = computed(() => (this.s.dark() ? PAPER.dark : PAPER.light));
  protected readonly dot = computed(() => (this.s.dark() ? DOT.dark : DOT.light));
  protected readonly rendered = computed(() => {
    const dark = this.s.dark();
    return this.s.effective().map((el) => this.render(el, dark));
  });
  protected readonly draftRendered = computed(() => {
    const d = this.draft();
    if (!d) return null;
    const rough = this.s.rough();
    const fill = this.s.fill();
    const el: El =
      d.type === 'draw'
        ? d
        : { ...d, rough, fill: fill === 'none' ? 'offset' : fill, bg: fill === 'none' || d.type === 'arrow' ? 'transparent' : d.bg };
    return this.render(el, this.s.dark());
  });
  protected readonly lastSeed = computed(() => {
    const list = this.s.elements();
    const last = list[list.length - 1];
    return last ? '0x' + last.seed.toString(16).padStart(8, '0') : 'none';
  });
  protected readonly hint = computed(() => (this.tool() === 'draw' ? 'drag to write with the pen' : 'drag on the page to draw'));

  private readonly svg = viewChild.required<ElementRef<SVGSVGElement>>('svg');
  private counter = SEED.length + 1;
  private slot = 0;
  private gesture: { start: { x: number; y: number }; last: { x: number; y: number } } | null = null;

  protected inkOn(c: string): string {
    return ink(c, this.s.dark());
  }

  private render(el: El, dark: boolean): Rendered {
    const d = build(el);
    const b = bounds(el);
    return {
      id: el.id,
      fills: d.fills.map((f) => ({ d: f.d, color: ink(f.color, dark) })),
      strokes: d.strokes.map((k) => ({ d: k.d, color: ink(k.color, dark), width: k.width, dash: dashFor(k.dash, k.width) })),
      label: el.label ? { text: el.label, x: b.x + b.w / 2, y: b.y + b.h / 2, color: ink(el.stroke, dark) } : undefined,
    };
  }

  // ---------- options ----------
  protected setTool(t: Tool): void {
    this.tool.set(t);
    this.say(`${this.tools.find((x) => x.id === t)?.label} tool`);
  }

  protected setRough(v: Rough): void {
    this.s.rough.set(v);
    this.say(`Hand: ${this.hands.find((h) => h.v === v)?.label}`);
  }

  protected setFill(v: FillChoice): void {
    this.s.fill.set(v);
    this.say(`Fill: ${this.fills.find((f) => f.v === v)?.label}`);
  }

  protected setInk(c: string, i: number): void {
    this.stroke.set(c);
    this.say(`${INK_NAMES[i]} ink`);
  }

  protected toggleDark(): void {
    this.s.dark.update((v) => !v);
    this.say(this.s.dark() ? 'Dark paper' : 'Light paper');
  }

  // ---------- history ----------
  private commit(next: El[]): void {
    this.past.update((p) => [...p.slice(-HISTORY_LIMIT + 1), this.s.elements()]);
    this.s.elements.set(next);
  }

  protected undo(): void {
    const p = this.past();
    if (!p.length) return;
    this.s.elements.set(p[p.length - 1]);
    this.past.set(p.slice(0, -1));
    this.say('Undone');
  }

  protected clear(): void {
    if (!this.s.elements().length) return;
    this.commit([]);
    this.say('Page cleared. Control Z brings it back.');
  }

  private newEl(type: Tool, x: number, y: number): El {
    const n = this.counter;
    const stroke = this.stroke();
    return {
      id: 'm' + n,
      type,
      x,
      y,
      w: 0,
      h: 0,
      points: type === 'arrow' || type === 'draw' ? [[0, 0]] : undefined,
      stroke,
      bg: type === 'arrow' || type === 'draw' ? 'transparent' : (TINT[stroke] ?? FILLS[0]),
      fill: 'offset',
      width: 2,
      rough: this.s.rough(),
      seed: seedFor(n),
    };
  }

  private add(el: El): void {
    this.counter++;
    this.commit([...this.s.elements(), el]);
    this.say(`${this.tools.find((t) => t.id === el.type)?.label} added`);
  }

  // ---------- pointer ----------
  protected down(e: PointerEvent): void {
    if (e.button !== 0) return;
    const svg = this.svg().nativeElement;
    svg.focus({ preventScroll: true });
    const p = this.point(e);
    this.gesture = { start: p, last: p };
    this.draft.set(this.newEl(this.tool(), p.x, p.y));
    svg.setPointerCapture(e.pointerId);
    e.preventDefault();
  }

  protected move(e: PointerEvent): void {
    const g = this.gesture;
    const d = this.draft();
    if (!g || !d) return;
    const p = this.point(e);
    if (d.type === 'draw') {
      if (Math.hypot(p.x - g.last.x, p.y - g.last.y) < 3) return;
      g.last = p;
      this.draft.set({ ...d, points: [...(d.points ?? []), [p.x - d.x, p.y - d.y]] });
    } else if (d.type === 'arrow') {
      this.draft.set({ ...d, points: [[0, 0], [p.x - g.start.x, p.y - g.start.y]] });
    } else {
      let dx = p.x - g.start.x;
      let dy = p.y - g.start.y;
      if (e.shiftKey) {
        const size = Math.max(Math.abs(dx), Math.abs(dy));
        dx = Math.sign(dx || 1) * size;
        dy = Math.sign(dy || 1) * size;
      }
      this.draft.set({ ...d, x: dx < 0 ? g.start.x + dx : g.start.x, y: dy < 0 ? g.start.y + dy : g.start.y, w: Math.abs(dx), h: Math.abs(dy) });
    }
  }

  protected up(): void {
    const g = this.gesture;
    const d = this.draft();
    this.gesture = null;
    this.draft.set(null);
    if (!g || !d) return;
    const b = bounds(d);
    if (d.type === 'draw' ? (d.points?.length ?? 0) < 2 : Math.hypot(b.w, b.h) < MIN) return;
    this.add(d);
  }

  // ---------- keyboard ----------
  protected key(e: KeyboardEvent): void {
    const mod = e.ctrlKey || e.metaKey;
    const k = e.key.toLowerCase();
    if (mod && k === 'z') {
      e.preventDefault();
      this.undo();
      return;
    }
    if (mod || e.altKey) return;
    const tool = this.tools.find((t) => t.key.toLowerCase() === k);
    if (tool) {
      e.preventDefault();
      this.setTool(tool.id);
      return;
    }
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      this.addAtSlot();
    } else if (e.key === 'Delete' || e.key === 'Backspace') {
      e.preventDefault();
      const list = this.s.elements();
      if (!list.length) return;
      this.commit(list.slice(0, -1));
      this.say('Last mark removed');
    }
  }

  /** Keyboard drawing: drops a shape with the current tool into the next of six free-ish spots. */
  private addAtSlot(): void {
    const spots: Point[] = [[40, 196], [470, 40], [40, 286], [470, 150], [150, 196], [150, 290]];
    const [x, y] = spots[this.slot++ % spots.length];
    const el = this.newEl(this.tool(), x, y);
    const t = this.tool();
    if (t === 'arrow') el.points = [[0, 0], [70, 0]];
    else if (t === 'draw') el.points = Array.from({ length: 16 }, (_, i): Point => [i * 5, Math.sin(i * 0.8) * 6]);
    else Object.assign(el, { w: 70, h: 52 });
    this.add(el);
  }

  private point(e: PointerEvent): { x: number; y: number } {
    const ctm = this.svg().nativeElement.getScreenCTM();
    if (!ctm) return { x: 0, y: 0 };
    const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(ctm.inverse());
    return { x: Math.max(0, Math.min(W, p.x)), y: Math.max(0, Math.min(H, p.y)) };
  }

  private say(msg: string): void {
    this.announce.set(msg);
  }
}
