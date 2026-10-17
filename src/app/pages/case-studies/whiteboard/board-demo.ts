import { ChangeDetectionStrategy, Component, ElementRef, computed, signal, viewChild } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  phosphorArrowClockwise,
  phosphorArrowCounterClockwise,
  phosphorArrowUpRight,
  phosphorCircle,
  phosphorCursor,
  phosphorMagnet,
  phosphorSquare,
  phosphorTrash,
} from '@ng-icons/phosphor-icons/regular';

type Tool = 'select' | 'rect' | 'ellipse' | 'arrow';
type Kind = Exclude<Tool, 'select'>;
type Handle = 'nw' | 'ne' | 'sw' | 'se' | 'p1' | 'p2';

/** One shape. Rect and ellipse: x, y, w, h. Arrow: start (x, y), vector (w, h), which may be negative. */
interface Shape {
  id: number;
  kind: Kind;
  x: number;
  y: number;
  w: number;
  h: number;
  label?: string;
}

interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface Guide {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

const W = 560;
const H = 360;
const GRID = 12;
const GUIDE_SNAP = 6;
const HISTORY_LIMIT = 100;
const MIN = 8;

const SEED: Shape[] = [
  { id: 1, kind: 'rect', x: 48, y: 48, w: 156, h: 84, label: 'idea' },
  { id: 2, kind: 'ellipse', x: 336, y: 48, w: 168, h: 84, label: 'review' },
  { id: 3, kind: 'rect', x: 48, y: 228, w: 156, h: 84, label: 'ship' },
  { id: 4, kind: 'arrow', x: 204, y: 90, w: 132, h: 0 },
  { id: 5, kind: 'arrow', x: 126, y: 132, w: 0, h: 96 },
];

const TOOLS: { id: Tool; label: string; key: string; icon: string }[] = [
  { id: 'select', label: 'Select', key: 'V', icon: 'phosphorCursor' },
  { id: 'rect', label: 'Rectangle', key: 'R', icon: 'phosphorSquare' },
  { id: 'ellipse', label: 'Ellipse', key: 'O', icon: 'phosphorCircle' },
  { id: 'arrow', label: 'Arrow', key: 'A', icon: 'phosphorArrowUpRight' },
];

/**
 * A working miniature of the Whiteboard, written for this page. Same ideas as the real board at a smaller scale:
 * one SVG in world units, shapes as plain immutable records in a signal, grid snap, smart alignment guides while
 * dragging, and undo/redo over whole-scene snapshots committed at the end of each gesture. Pointer events cover
 * mouse, pen and touch; the keyboard covers the rest (tools, add, select, nudge, delete, undo). Renders its seed
 * scene on the server; nothing touches the DOM until an event fires in the browser.
 */
@Component({
  selector: 'mh-wb-board-demo',
  imports: [NgIcon],
  viewProviders: [
    provideIcons({
      phosphorArrowClockwise,
      phosphorArrowCounterClockwise,
      phosphorArrowUpRight,
      phosphorCircle,
      phosphorCursor,
      phosphorMagnet,
      phosphorSquare,
      phosphorTrash,
    }),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="board card card--lift">
      <div class="bar" role="toolbar" aria-label="Board tools" aria-controls="wb-demo-canvas">
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
          <button type="button" class="tb" (click)="redo()" [disabled]="!canRedo()" aria-label="Redo (Ctrl+Shift+Z)" title="Redo (Ctrl+Shift+Z)">
            <ng-icon name="phosphorArrowClockwise" aria-hidden="true" />
          </button>
          <button type="button" class="tb" (click)="remove()" [disabled]="selectedId() === null" aria-label="Delete selected (Delete)" title="Delete selected (Delete)">
            <ng-icon name="phosphorTrash" aria-hidden="true" />
          </button>
          <button type="button" class="tb" [attr.aria-pressed]="snap()" (click)="toggleSnap()" aria-label="Snap to grid" title="Snap to grid">
            <ng-icon name="phosphorMagnet" aria-hidden="true" />
          </button>
        </div>
      </div>

      <svg
        #svg
        id="wb-demo-canvas"
        class="canvas"
        [class.drawing]="tool() !== 'select'"
        viewBox="0 0 560 360"
        role="application"
        tabindex="0"
        aria-roledescription="whiteboard"
        aria-label="Mini whiteboard"
        aria-describedby="wb-demo-help"
        (pointerdown)="down($event)"
        (pointermove)="move($event)"
        (pointerup)="up()"
        (pointercancel)="up()"
        (keydown)="key($event)"
      >
        <defs>
          <pattern id="wb-demo-dots" [attr.width]="grid" [attr.height]="grid" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="1" class="dot" />
          </pattern>
          <marker id="wb-demo-head" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M0 0 L10 5 L0 10 z" class="head" />
          </marker>
        </defs>
        <rect class="paper" x="0" y="0" [attr.width]="w" [attr.height]="h" />
        <rect x="0" y="0" [attr.width]="w" [attr.height]="h" fill="url(#wb-demo-dots)" />

        @for (s of shapes(); track s.id) {
          <g class="shape" [attr.data-kind]="s.kind">
            @switch (s.kind) {
              @case ('rect') {
                <rect [attr.x]="s.x" [attr.y]="s.y" [attr.width]="s.w" [attr.height]="s.h" rx="6" />
              }
              @case ('ellipse') {
                <ellipse [attr.cx]="s.x + s.w / 2" [attr.cy]="s.y + s.h / 2" [attr.rx]="s.w / 2" [attr.ry]="s.h / 2" />
              }
              @case ('arrow') {
                <line [attr.x1]="s.x" [attr.y1]="s.y" [attr.x2]="s.x + s.w" [attr.y2]="s.y + s.h" marker-end="url(#wb-demo-head)" />
              }
            }
            @if (s.label) {
              <text [attr.x]="s.x + s.w / 2" [attr.y]="s.y + s.h / 2" dominant-baseline="central" text-anchor="middle">{{ s.label }}</text>
            }
          </g>
        }

        @if (draft(); as d) {
          <g class="shape draft" [attr.data-kind]="d.kind">
            @switch (d.kind) {
              @case ('rect') {
                <rect [attr.x]="d.x" [attr.y]="d.y" [attr.width]="d.w" [attr.height]="d.h" rx="6" />
              }
              @case ('ellipse') {
                <ellipse [attr.cx]="d.x + d.w / 2" [attr.cy]="d.y + d.h / 2" [attr.rx]="d.w / 2" [attr.ry]="d.h / 2" />
              }
              @case ('arrow') {
                <line [attr.x1]="d.x" [attr.y1]="d.y" [attr.x2]="d.x + d.w" [attr.y2]="d.y + d.h" marker-end="url(#wb-demo-head)" />
              }
            }
          </g>
        }

        @for (g of guides(); track $index) {
          <line class="guide" [attr.x1]="g.x1" [attr.y1]="g.y1" [attr.x2]="g.x2" [attr.y2]="g.y2" />
        }

        @if (selected(); as s) {
          @if (s.kind === 'arrow') {
            <line class="sel-line" [attr.x1]="s.x" [attr.y1]="s.y" [attr.x2]="s.x + s.w" [attr.y2]="s.y + s.h" />
            <g class="handle" data-handle="p1" [attr.transform]="'translate(' + s.x + ' ' + s.y + ')'">
              <circle r="12" class="hit" /><rect x="-4.5" y="-4.5" width="9" height="9" />
            </g>
            <g class="handle" data-handle="p2" [attr.transform]="'translate(' + (s.x + s.w) + ' ' + (s.y + s.h) + ')'">
              <circle r="12" class="hit" /><rect x="-4.5" y="-4.5" width="9" height="9" />
            </g>
          } @else {
            <rect class="sel" [attr.x]="s.x - 4" [attr.y]="s.y - 4" [attr.width]="s.w + 8" [attr.height]="s.h + 8" />
            @for (c of corners(s); track c.h) {
              <g class="handle" [attr.data-handle]="c.h" [attr.transform]="'translate(' + c.x + ' ' + c.y + ')'">
                <circle r="12" class="hit" /><rect x="-4.5" y="-4.5" width="9" height="9" />
              </g>
            }
          }
        }
      </svg>

      <div class="foot">
        <p class="mono status" aria-hidden="true">
          {{ shapes().length }} shapes · {{ pastCount() }} undo · {{ hint() }}
        </p>
        <p id="wb-demo-help" class="sr-only">
          Tools: V select, R rectangle, O ellipse, A arrow. With a drawing tool, drag on the canvas or press Enter to add a
          shape in the middle. With the select tool, press Enter to select the next shape, arrow keys to move it (Shift for
          larger steps), Delete to remove it. Control Z undoes, Control Shift Z redoes, Escape clears the selection.
        </p>
        <p class="sr-only" aria-live="polite">{{ announce() }}</p>
      </div>
    </div>
  `,
  styles: `
    :host {
      display: block;
      min-width: 0;
    }
    .board {
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
        background: var(--wb-indigo);
        color: #fff;
      }

      &:disabled {
        color: var(--faint);
        cursor: default;
      }
    }
    .canvas {
      display: block;
      width: 100%;
      height: auto;
      aspect-ratio: 560 / 360;
      touch-action: none;
      cursor: default;
      user-select: none;
      -webkit-user-select: none;

      &.drawing {
        cursor: crosshair;
      }

      &:focus:not(:focus-visible) {
        outline: none;
      }

      &:focus-visible {
        outline: 2px solid var(--focus);
        outline-offset: -2px;
      }
    }
    .paper {
      fill: var(--bg);
    }
    .dot {
      fill: var(--wb-dot);
    }
    .shape {
      rect,
      ellipse,
      line {
        fill: none;
        stroke-width: 2;
        vector-effect: non-scaling-stroke;
      }
      &[data-kind='rect'] rect {
        stroke: var(--wb-indigo-text);
      }
      &[data-kind='ellipse'] ellipse {
        stroke: var(--wb-green);
      }
      &[data-kind='arrow'] line {
        stroke: var(--ink);
      }
      text {
        fill: var(--ink);
        font-family: var(--font-mono);
        font-size: 14px;
        pointer-events: none;
      }
    }
    .draft {
      opacity: 0.75;
    }
    .head {
      fill: var(--ink);
    }
    .guide {
      stroke: var(--wb-amber);
      stroke-width: 1;
      vector-effect: non-scaling-stroke;
    }
    .sel,
    .sel-line {
      fill: none;
      stroke: var(--wb-indigo-text);
      stroke-width: 1;
      stroke-dasharray: 4 3;
      vector-effect: non-scaling-stroke;
    }
    .sel-line {
      stroke-width: 8;
      stroke-dasharray: none;
      stroke-opacity: 0.18;
    }
    .handle {
      cursor: grab;

      rect {
        fill: var(--bg);
        stroke: var(--wb-indigo-text);
        stroke-width: 1.5;
        vector-effect: non-scaling-stroke;
      }
      .hit {
        fill: transparent;
      }
    }
    .foot {
      padding: 10px 14px;
      border-top: 1px solid var(--line);
    }
    .status {
      font-size: 12px;
      color: var(--muted);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;

      /* Phones: let the hint wrap instead of losing its end */
      @media (max-width: 480px) {
        white-space: normal;
        line-height: 1.5;
      }
    }
    @media (prefers-reduced-motion: no-preference) {
      .tb {
        transition:
          background var(--t-fast) var(--ease),
          color var(--t-fast) var(--ease);
      }
    }
  `,
})
export class WhiteboardBoardDemo {
  protected readonly w = W;
  protected readonly h = H;
  protected readonly grid = GRID;
  protected readonly tools = TOOLS;

  protected readonly shapes = signal<Shape[]>(SEED);
  protected readonly tool = signal<Tool>('select');
  protected readonly selectedId = signal<number | null>(null);
  protected readonly draft = signal<Shape | null>(null);
  protected readonly guides = signal<Guide[]>([]);
  protected readonly snap = signal(true);
  protected readonly announce = signal('');

  // Undo/redo over whole-scene snapshots, like the real HistoryService: commit at gesture boundaries only.
  private past: Shape[][] = [];
  private future: Shape[][] = [];
  private baseline: Shape[] = SEED;
  protected readonly pastCount = signal(0);
  protected readonly futureCount = signal(0);
  protected readonly canUndo = computed(() => this.pastCount() > 0);
  protected readonly canRedo = computed(() => this.futureCount() > 0);

  protected readonly selected = computed(() => this.shapes().find((s) => s.id === this.selectedId()) ?? null);
  protected readonly hint = computed(() => {
    const t = this.tool();
    if (t !== 'select') return 'drag to draw, Shift to constrain';
    return this.selectedId() === null ? 'click a shape to select it' : 'drag to move, corners to resize';
  });

  private readonly svg = viewChild.required<ElementRef<SVGSVGElement>>('svg');
  private nextId = SEED.length + 1;
  private gesture: { mode: 'draw' | 'move' | 'resize'; start: { x: number; y: number }; orig?: Shape; handle?: Handle } | null = null;

  // ---------- Tools ----------
  protected setTool(t: Tool): void {
    this.tool.set(t);
    if (t !== 'select') this.selectedId.set(null);
    this.say(`${TOOLS.find((x) => x.id === t)?.label} tool`);
  }

  protected toggleSnap(): void {
    this.snap.update((v) => !v);
    this.say(this.snap() ? 'Snap on' : 'Snap off');
  }

  // ---------- Pointer ----------
  protected down(e: PointerEvent): void {
    if (e.button !== 0) return;
    const svg = this.svg().nativeElement;
    svg.focus({ preventScroll: true });
    const p = this.point(e);
    const t = this.tool();

    if (t !== 'select') {
      const s = this.snapPoint(p);
      this.draft.set({ id: this.nextId, kind: t, x: s.x, y: s.y, w: 0, h: 0 });
      this.gesture = { mode: 'draw', start: s };
    } else {
      const handle = (e.target as Element).closest?.('[data-handle]')?.getAttribute('data-handle') as Handle | null;
      const sel = this.selected();
      if (handle && sel) {
        this.gesture = { mode: 'resize', start: p, orig: sel, handle };
      } else {
        const hit = this.hitTest(p);
        this.selectedId.set(hit?.id ?? null);
        if (hit) this.gesture = { mode: 'move', start: p, orig: hit };
      }
    }
    if (this.gesture) {
      svg.setPointerCapture(e.pointerId);
      e.preventDefault();
    }
  }

  protected move(e: PointerEvent): void {
    const g = this.gesture;
    if (!g) return;
    const p = this.point(e);

    if (g.mode === 'draw') {
      const d = this.draft();
      if (!d) return;
      let q = this.snapPoint(p);
      if (d.kind === 'arrow') {
        if (e.shiftKey) q = snapAngle(g.start, q);
        this.draft.set({ ...d, w: q.x - g.start.x, h: q.y - g.start.y });
      } else {
        let dx = q.x - g.start.x;
        let dy = q.y - g.start.y;
        if (e.shiftKey) {
          const size = Math.max(Math.abs(dx), Math.abs(dy));
          dx = Math.sign(dx || 1) * size;
          dy = Math.sign(dy || 1) * size;
        }
        this.draft.set({ ...d, x: dx < 0 ? g.start.x + dx : g.start.x, y: dy < 0 ? g.start.y + dy : g.start.y, w: Math.abs(dx), h: Math.abs(dy) });
      }
      return;
    }

    const o = g.orig!;
    if (g.mode === 'move') {
      const moved = { ...o, x: o.x + p.x - g.start.x, y: o.y + p.y - g.start.y };
      const { shape, guides } = this.align(moved);
      this.guides.set(guides);
      this.replace(shape);
      return;
    }

    // Resize: the opposite corner (or the other arrow end) stays put.
    const q = this.snapPoint(p);
    if (o.kind === 'arrow') {
      const end = { x: o.x + o.w, y: o.y + o.h };
      this.replace(g.handle === 'p1' ? { ...o, x: q.x, y: q.y, w: end.x - q.x, h: end.y - q.y } : { ...o, w: q.x - o.x, h: q.y - o.y });
      return;
    }
    const fx = g.handle!.includes('w') ? o.x + o.w : o.x;
    const fy = g.handle!.includes('n') ? o.y + o.h : o.y;
    const x = Math.min(fx, q.x);
    const y = Math.min(fy, q.y);
    this.replace({ ...o, x, y, w: Math.max(MIN, Math.abs(q.x - fx)), h: Math.max(MIN, Math.abs(q.y - fy)) });
  }

  protected up(): void {
    const g = this.gesture;
    this.gesture = null;
    this.guides.set([]);
    if (!g) return;
    if (g.mode === 'draw') {
      const d = this.draft();
      this.draft.set(null);
      if (!d || Math.hypot(d.w, d.h) < MIN) return;
      this.add(d);
      return;
    }
    if (this.commit()) this.say(g.mode === 'move' ? 'Moved' : 'Resized');
  }

  // ---------- Keyboard ----------
  protected key(e: KeyboardEvent): void {
    const mod = e.ctrlKey || e.metaKey;
    const k = e.key.toLowerCase();
    if (mod && k === 'z') {
      e.preventDefault();
      if (e.shiftKey) this.redo();
      else this.undo();
      return;
    }
    if (mod && k === 'y') {
      e.preventDefault();
      this.redo();
      return;
    }
    if (mod || e.altKey) return;

    const tool = TOOLS.find((t) => t.key.toLowerCase() === k);
    if (tool) {
      e.preventDefault();
      this.setTool(tool.id);
      return;
    }

    const sel = this.selected();
    switch (e.key) {
      case 'Enter':
      case ' ': {
        e.preventDefault();
        const t = this.tool();
        if (t !== 'select') {
          const c = this.snapPoint({ x: W / 2 - 60, y: H / 2 - 36 });
          this.add(t === 'arrow' ? { id: this.nextId, kind: t, x: c.x, y: c.y + 36, w: 120, h: 0 } : { id: this.nextId, kind: t, x: c.x, y: c.y, w: 120, h: 72 });
        } else {
          const list = this.shapes();
          if (!list.length) return;
          const i = list.findIndex((s) => s.id === this.selectedId());
          const next = list[(i + 1) % list.length];
          this.selectedId.set(next.id);
          this.say(`${describe(next)} selected`);
        }
        return;
      }
      case 'ArrowLeft':
      case 'ArrowRight':
      case 'ArrowUp':
      case 'ArrowDown': {
        if (!sel) return;
        e.preventDefault();
        const step = e.shiftKey ? GRID * 2 : 4;
        const dx = e.key === 'ArrowLeft' ? -step : e.key === 'ArrowRight' ? step : 0;
        const dy = e.key === 'ArrowUp' ? -step : e.key === 'ArrowDown' ? step : 0;
        this.replace(this.clamp({ ...sel, x: sel.x + dx, y: sel.y + dy }));
        this.commit();
        return;
      }
      case 'Delete':
      case 'Backspace':
        if (!sel) return;
        e.preventDefault();
        this.remove();
        return;
      case 'Escape':
        this.selectedId.set(null);
        this.tool.set('select');
        return;
    }
  }

  // ---------- Scene ops ----------
  protected remove(): void {
    const sel = this.selected();
    if (!sel) return;
    this.shapes.update((list) => list.filter((s) => s.id !== sel.id));
    this.selectedId.set(null);
    this.commit();
    this.say(`${describe(sel)} deleted`);
  }

  protected undo(): void {
    if (!this.past.length) return;
    this.future.push(this.baseline);
    this.baseline = this.past.pop()!;
    this.restore('Undone');
  }

  protected redo(): void {
    if (!this.future.length) return;
    this.past.push(this.baseline);
    this.baseline = this.future.pop()!;
    this.restore('Redone');
  }

  private add(s: Shape): void {
    const shape = { ...s, id: this.nextId++ };
    this.shapes.update((list) => [...list, shape]);
    this.selectedId.set(shape.id);
    this.tool.set('select');
    this.commit();
    this.say(`${describe(shape)} added`);
  }

  private replace(s: Shape): void {
    this.shapes.update((list) => list.map((x) => (x.id === s.id ? s : x)));
  }

  private restore(msg: string): void {
    this.shapes.set(this.baseline);
    if (!this.baseline.some((s) => s.id === this.selectedId())) this.selectedId.set(null);
    this.sync();
    this.say(msg);
  }

  /** Records the current scene as one undo step. No-op if nothing changed (a click without a drag). */
  private commit(): boolean {
    const now = this.shapes();
    if (JSON.stringify(now) === JSON.stringify(this.baseline)) return false;
    this.past.push(this.baseline);
    if (this.past.length > HISTORY_LIMIT) this.past.shift();
    this.baseline = now;
    this.future = [];
    this.sync();
    return true;
  }

  private sync(): void {
    this.pastCount.set(this.past.length);
    this.futureCount.set(this.future.length);
  }

  // ---------- Geometry ----------
  protected corners(s: Shape): { h: Handle; x: number; y: number }[] {
    return [
      { h: 'nw', x: s.x - 4, y: s.y - 4 },
      { h: 'ne', x: s.x + s.w + 4, y: s.y - 4 },
      { h: 'sw', x: s.x - 4, y: s.y + s.h + 4 },
      { h: 'se', x: s.x + s.w + 4, y: s.y + s.h + 4 },
    ];
  }

  /** Client point to world (viewBox) units through the SVG's own screen matrix. */
  private point(e: PointerEvent): { x: number; y: number } {
    const ctm = this.svg().nativeElement.getScreenCTM();
    if (!ctm) return { x: 0, y: 0 };
    const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(ctm.inverse());
    return { x: clamp(p.x, 0, W), y: clamp(p.y, 0, H) };
  }

  private snapPoint(p: { x: number; y: number }): { x: number; y: number } {
    if (!this.snap()) return p;
    return { x: Math.round(p.x / GRID) * GRID, y: Math.round(p.y / GRID) * GRID };
  }

  /** Topmost first: walk the list backwards, like the real board's hitTestTopmost. */
  private hitTest(p: { x: number; y: number }): Shape | null {
    const list = this.shapes();
    for (let i = list.length - 1; i >= 0; i--) {
      const s = list[i];
      if (s.kind === 'arrow') {
        if (segDist(p, { x: s.x, y: s.y }, { x: s.x + s.w, y: s.y + s.h }) <= 8) return s;
      } else if (s.kind === 'ellipse') {
        const rx = s.w / 2 + 6;
        const ry = s.h / 2 + 6;
        const dx = p.x - (s.x + s.w / 2);
        const dy = p.y - (s.y + s.h / 2);
        if ((dx * dx) / (rx * rx) + (dy * dy) / (ry * ry) <= 1) return s;
      } else if (p.x >= s.x - 6 && p.x <= s.x + s.w + 6 && p.y >= s.y - 6 && p.y <= s.y + s.h + 6) {
        return s;
      }
    }
    return null;
  }

  /**
   * Smart guides: compare the moving box's left, centre and right (and top, middle, bottom) with every other
   * shape's; the closest within a few units snaps exactly and draws a line across both. Without a match, grid snap.
   */
  private align(s: Shape): { shape: Shape; guides: Guide[] } {
    const others = this.shapes().filter((o) => o.id !== s.id);
    let b = box(s);
    let bestX: { d: number } | null = null;
    let bestY: { d: number } | null = null;
    for (const o of others) {
      const ob = box(o);
      for (const m of stops(b.x, b.w)) for (const t of stops(ob.x, ob.w)) if (Math.abs(t - m) <= GUIDE_SNAP && (!bestX || Math.abs(t - m) < Math.abs(bestX.d))) bestX = { d: t - m };
      for (const m of stops(b.y, b.h)) for (const t of stops(ob.y, ob.h)) if (Math.abs(t - m) <= GUIDE_SNAP && (!bestY || Math.abs(t - m) < Math.abs(bestY.d))) bestY = { d: t - m };
    }
    const dx = bestX ? bestX.d : this.snap() ? Math.round(b.x / GRID) * GRID - b.x : 0;
    const dy = bestY ? bestY.d : this.snap() ? Math.round(b.y / GRID) * GRID - b.y : 0;
    const shape = this.clamp({ ...s, x: s.x + dx, y: s.y + dy });
    b = box(shape);

    const guides: Guide[] = [];
    const seen = new Set<string>();
    for (const o of others) {
      const ob = box(o);
      for (const m of stops(b.x, b.w))
        for (const t of stops(ob.x, ob.w))
          if (Math.abs(t - m) < 0.5 && !seen.has('v' + t)) {
            seen.add('v' + t);
            guides.push({ x1: t, x2: t, y1: Math.min(b.y, ob.y) - 8, y2: Math.max(b.y + b.h, ob.y + ob.h) + 8 });
          }
      for (const m of stops(b.y, b.h))
        for (const t of stops(ob.y, ob.h))
          if (Math.abs(t - m) < 0.5 && !seen.has('h' + t)) {
            seen.add('h' + t);
            guides.push({ y1: t, y2: t, x1: Math.min(b.x, ob.x) - 8, x2: Math.max(b.x + b.w, ob.x + ob.w) + 8 });
          }
    }
    return { shape, guides: guides.slice(0, 6) };
  }

  /** Keep a shape's box inside the board. */
  private clamp(s: Shape): Shape {
    const b = box(s);
    const dx = b.x < 0 ? -b.x : b.x + b.w > W ? W - b.x - b.w : 0;
    const dy = b.y < 0 ? -b.y : b.y + b.h > H ? H - b.y - b.h : 0;
    return dx || dy ? { ...s, x: s.x + dx, y: s.y + dy } : s;
  }

  private say(msg: string): void {
    // Re-announce identical messages (two undos in a row) by clearing first.
    this.announce.set('');
    queueMicrotask(() => this.announce.set(msg));
  }
}

function box(s: Shape): Box {
  if (s.kind !== 'arrow') return { x: s.x, y: s.y, w: s.w, h: s.h };
  return { x: Math.min(s.x, s.x + s.w), y: Math.min(s.y, s.y + s.h), w: Math.abs(s.w), h: Math.abs(s.h) };
}

function stops(start: number, size: number): [number, number, number] {
  return [start, start + size / 2, start + size];
}

function clamp(v: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, v));
}

function segDist(p: { x: number; y: number }, a: { x: number; y: number }, b: { x: number; y: number }): number {
  const vx = b.x - a.x;
  const vy = b.y - a.y;
  const len = vx * vx + vy * vy;
  const t = len ? clamp(((p.x - a.x) * vx + (p.y - a.y) * vy) / len, 0, 1) : 0;
  return Math.hypot(p.x - (a.x + t * vx), p.y - (a.y + t * vy));
}

/** Shift on an arrow: round its angle to 15 degree steps, as the real board does. */
function snapAngle(o: { x: number; y: number }, p: { x: number; y: number }): { x: number; y: number } {
  const dist = Math.hypot(p.x - o.x, p.y - o.y);
  const a = Math.round(Math.atan2(p.y - o.y, p.x - o.x) / (Math.PI / 12)) * (Math.PI / 12);
  return { x: o.x + Math.cos(a) * dist, y: o.y + Math.sin(a) * dist };
}

function describe(s: Shape): string {
  const name = s.kind === 'rect' ? 'Rectangle' : s.kind === 'ellipse' ? 'Ellipse' : 'Arrow';
  return s.label ? `${name} ${s.label}` : name;
}
