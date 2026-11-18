import { ChangeDetectionStrategy, Component, ElementRef, Injectable, computed, inject, signal, viewChild } from '@angular/core';

// ---------- Swoop's editor model, from shared/editor/editor.js ----------

export type ToolId = 'rect' | 'ellipse' | 'arrow' | 'line' | 'pen' | 'marker' | 'step' | 'blur';
type Size = 's' | 'm' | 'l';

/** One mark, in Swoop's own field names (editor.js onDown): two corners, a point list, or a centre and radius. */
export interface Shape {
  id: number;
  type: ToolId;
  color: string;
  lw: number;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  pts?: number[];
  r?: number;
  block?: number;
}

/** editor.js COLORS, in its order. */
const COLORS = [
  { value: '#ff3b30', name: 'Red' },
  { value: '#ff9500', name: 'Orange' },
  { value: '#ffd60a', name: 'Yellow' },
  { value: '#30d158', name: 'Green' },
  { value: '#0a84ff', name: 'Blue' },
  { value: '#ff2d92', name: 'Pink' },
  { value: '#16161a', name: 'Black' },
  { value: '#ffffff', name: 'White' },
];

/** editor.js METRICS (CSS px at the source size), times 2: the sample is drawn as a 2x capture, as on a 2x screen. */
const METRICS: Record<Size, { stroke: number; radius: number; marker: number; block: number }> = {
  s: { stroke: 5, radius: 22, marker: 24, block: 16 },
  m: { stroke: 8, radius: 28, marker: 36, block: 24 },
  l: { stroke: 14, radius: 38, marker: 56, block: 36 },
};

/** editor.js ICONS: 20 px grid, 1.5 px stroke, currentColor. */
const ICONS: Record<string, string> = {
  rect: 'M5 4.75h10a1.75 1.75 0 0 1 1.75 1.75v7a1.75 1.75 0 0 1-1.75 1.75H5a1.75 1.75 0 0 1-1.75-1.75v-7A1.75 1.75 0 0 1 5 4.75z',
  ellipse: 'M16.75 10a6.75 5.25 0 1 1-13.5 0a6.75 5.25 0 1 1 13.5 0z',
  arrow: 'M4.5 15.5 15 5M8.25 4.75H15.25V11.75',
  line: 'M4.5 15.5 15.5 4.5',
  pen: 'm3.75 16.25.9-3.6 8.6-8.6a1.5 1.5 0 0 1 2.1 0l.6.6a1.5 1.5 0 0 1 0 2.1l-8.6 8.6zm8-10.75 2.75 2.75',
  marker: 'm7.25 14.75-2-2 7.9-7.9a1.4 1.4 0 0 1 2 0l0 0a1.4 1.4 0 0 1 0 2zM5.25 12.75 3.5 16.5h3.75l0-1.75M10.5 16.5h6',
  step: 'M16.75 10a6.75 6.75 0 1 1-13.5 0a6.75 6.75 0 1 1 13.5 0zM8.75 8 10.5 7v6',
  blur: 'M3.5 3.5h4v4h-4zM12.5 3.5h4v4h-4zM8 8h4v4H8zM3.5 12.5h4v4h-4zM12.5 12.5h4v4h-4z',
  undo: 'M7.25 4.5 3.75 8l3.5 3.5M3.75 8h8a4.25 4.25 0 0 1 0 8.5H9.5',
  redo: 'm12.75 4.5 3.5 3.5-3.5 3.5M16.25 8h-8a4.25 4.25 0 0 0 0 8.5h2.25',
  trash: 'M4 6h12M8.25 6V4.5h3.5V6M5.75 6l.75 10h7l.75-10',
};

const W = 1200;
const H = 760;
const MIN_SHAPE = 6; // drags shorter than this are clicks, not shapes (editor.js MIN_SHAPE, at 2x)
const HISTORY = 60;

const s0 = (o: Partial<Shape> & Pick<Shape, 'id' | 'type'>): Shape => ({ color: COLORS[0].value, lw: METRICS.m.stroke, x1: 0, y1: 0, x2: 0, y2: 0, ...o });

/** The marks on Swoop's own store screenshot: the tracking card boxed, two steps, an arrow, the address blurred. */
const SEED: Shape[] = [
  s0({ id: 1, type: 'rect', x1: 64, y1: 200, x2: 764, y2: 450 }),
  s0({ id: 2, type: 'step', x1: 66, y1: 202, x2: 66, y2: 202, r: METRICS.m.radius }),
  s0({ id: 3, type: 'step', x1: 798, y1: 202, x2: 798, y2: 202, r: METRICS.m.radius }),
  s0({ id: 4, type: 'blur', color: '', lw: 0, x1: 822, y1: 258, x2: 1104, y2: 398, block: METRICS.m.block }),
  s0({ id: 5, type: 'arrow', x1: 560, y1: 640, x2: 424, y2: 322 }),
];

const r1 = (n: number) => Math.round(n);

/**
 * The marks on the hero sample, shared by the markup demo and the "document" panel further down the page, provided
 * by the page component.
 */
@Injectable()
export class SwoopDoc {
  readonly shapes = signal<Shape[]>(SEED);

  /** The same marks the way editor.js keeps them: the picture's size, the shape list and the crop box. */
  readonly json = computed(() => {
    const rows = this.shapes().map((s) => {
      const out: Record<string, unknown> =
        s.type === 'step'
          ? { id: s.id, type: s.type, color: s.color, x: r1(s.x1), y: r1(s.y1), r: s.r }
          : s.type === 'blur'
            ? { id: s.id, type: s.type, block: s.block, x1: r1(s.x1), y1: r1(s.y1), x2: r1(s.x2), y2: r1(s.y2) }
            : s.type === 'pen' || s.type === 'marker'
              ? { id: s.id, type: s.type, color: s.color, lw: s.lw, pts: (s.pts ?? []).map(r1) }
              : { id: s.id, type: s.type, color: s.color, lw: s.lw, x1: r1(s.x1), y1: r1(s.y1), x2: r1(s.x2), y2: r1(s.y2) };
      // One shape per block, its fields wrapped at about 50 characters so the panel never scrolls sideways.
      // A pen's point list is broken into rows of eight numbers.
      const pad = '\n        ';
      const fields = Object.entries(out).map(([k, v]) => {
        if (!Array.isArray(v)) return `"${k}": ${JSON.stringify(v)}`;
        const rows: string[] = [];
        for (let i = 0; i < v.length; i += 8) rows.push(v.slice(i, i + 8).join(', '));
        return rows.length > 1 ? `"${k}": [${pad}  ${rows.join(',' + pad + '  ')}${pad}]` : `"${k}": [${rows[0] ?? ''}]`;
      });
      const lines: string[] = [];
      let line = '';
      for (const f of fields) {
        if (line && (line.length + f.length > 48 || f.includes('\n'))) {
          lines.push(line + ',');
          line = f;
        } else line = line ? `${line}, ${f}` : f;
      }
      lines.push(line);
      return `{ ${lines.join(pad)} }`;
    });
    const list = rows.length ? `[\n    ${rows.join(',\n    ')}\n  ]` : '[]';
    return `{\n  "base": { "w": ${W}, "h": ${H} },\n  "shapes": ${list},\n  "crop": null\n}`;
  });
}

// ---------- drawing, ported from editor.js (drawShape, drawArrow, drawStep, tracePath) ----------

interface Drawn {
  id: number;
  kind: 'rect' | 'ellipse' | 'line' | 'arrow' | 'path' | 'marker' | 'step' | 'blur';
  color: string;
  lw: number;
  x?: number;
  y?: number;
  w?: number;
  h?: number;
  rx?: number;
  d?: string;
  head?: string;
  headW?: number;
  n?: number;
  r?: number;
  ink?: string;
  ring?: number;
  font?: number;
  block?: number;
}

const norm = (s: Shape) => ({ x: Math.min(s.x1, s.x2), y: Math.min(s.y1, s.y2), w: Math.abs(s.x2 - s.x1), h: Math.abs(s.y2 - s.y1) });

function luminance(hex: string): number {
  const v = parseInt(hex.slice(1), 16);
  return (0.299 * ((v >> 16) & 255) + 0.587 * ((v >> 8) & 255) + 0.114 * (v & 255)) / 255;
}

/** tracePath: smooth through the midpoints. */
function tracePath(p: number[]): string {
  if (p.length < 4) return `M${p[0]} ${p[1]}h0.01`;
  let d = `M${p[0]} ${p[1]}`;
  for (let i = 2; i < p.length - 2; i += 2) {
    const mx = (p[i] + p[i + 2]) / 2;
    const my = (p[i + 1] + p[i + 3]) / 2;
    d += `Q${p[i]} ${p[i + 1]} ${mx} ${my}`;
  }
  return d + `L${p[p.length - 2]} ${p[p.length - 1]}`;
}

function draw(s: Shape, steps: Map<number, number>): Drawn | null {
  switch (s.type) {
    case 'rect': {
      const r = norm(s);
      return { id: s.id, kind: 'rect', color: s.color, lw: s.lw, ...r, rx: Math.min(s.lw * 1.2, r.w / 2, r.h / 2) };
    }
    case 'ellipse': {
      const r = norm(s);
      return { id: s.id, kind: 'ellipse', color: s.color, lw: s.lw, x: r.x + r.w / 2, y: r.y + r.h / 2, w: r.w / 2, h: r.h / 2 };
    }
    case 'line':
      return { id: s.id, kind: 'line', color: s.color, lw: s.lw, d: `M${s.x1} ${s.y1}L${s.x2} ${s.y2}` };
    case 'arrow': {
      const dx = s.x2 - s.x1;
      const dy = s.y2 - s.y1;
      const len = Math.hypot(dx, dy);
      if (len < 0.5) return null;
      const ux = dx / len;
      const uy = dy / len;
      const head = Math.min(len * 0.55, s.lw * 3.2 + 8);
      const half = head * 0.62;
      const bx = s.x2 - ux * head;
      const by = s.y2 - uy * head;
      return {
        id: s.id,
        kind: 'arrow',
        color: s.color,
        lw: s.lw,
        d: `M${s.x1} ${s.y1}L${s.x2 - ux * head * 0.6} ${s.y2 - uy * head * 0.6}`,
        head: `${s.x2},${s.y2} ${bx - uy * half},${by + ux * half} ${bx + uy * half},${by - ux * half}`,
        headW: Math.max(1, s.lw * 0.5),
      };
    }
    case 'pen':
      return { id: s.id, kind: 'path', color: s.color, lw: s.lw, d: tracePath(s.pts ?? []) };
    case 'marker':
      return { id: s.id, kind: 'marker', color: s.color, lw: s.lw, d: tracePath(s.pts ?? []) };
    case 'step': {
      const n = steps.get(s.id) ?? 1;
      const r = s.r ?? METRICS.m.radius;
      return {
        id: s.id,
        kind: 'step',
        color: s.color,
        lw: 0,
        x: s.x1,
        y: s.y1,
        r,
        n,
        ring: Math.max(1.5, r * 0.14),
        ink: luminance(s.color) > 0.55 ? '#16161a' : '#ffffff',
        font: Math.round(r * (n > 9 ? 0.95 : 1.15)),
      };
    }
    case 'blur': {
      const r = norm(s);
      return { id: s.id, kind: 'blur', color: '', lw: 0, ...r, block: s.block ?? METRICS.m.block };
    }
  }
}

const TOOLS: { id: ToolId; name: string; key: string }[] = [
  { id: 'rect', name: 'Rectangle', key: 'R' },
  { id: 'ellipse', name: 'Ellipse', key: 'O' },
  { id: 'arrow', name: 'Arrow', key: 'A' },
  { id: 'line', name: 'Line', key: 'L' },
  { id: 'pen', name: 'Pen', key: 'P' },
  { id: 'marker', name: 'Highlighter', key: 'H' },
  { id: 'step', name: 'Numbered step', key: 'N' },
  { id: 'blur', name: 'Blur', key: 'B' },
];

/**
 * The hero: a small markup editor on Swoop's own sample order page (site.js samplePage, redrawn as SVG). Eight of
 * Swoop's tools with its colours, sizes, arrowheads, numbered steps and pixelate blur, plus undo and redo. SVG, so it
 * renders on the server with the seed marks; pointer and keyboard input start once it hydrates. Text and crop are
 * left to the real editor.
 */
@Component({
  selector: 'mh-swoop-markup',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="ed card card--lift">
      <div class="bar" role="toolbar" aria-label="Markup tools" aria-controls="swm-stage">
        <div class="grp" role="group" aria-label="Tools">
          @for (t of tools; track t.id) {
            <button type="button" class="tb" [attr.aria-pressed]="tool() === t.id" (click)="setTool(t.id)" [attr.aria-label]="t.name + ' (' + t.key + ')'" [title]="t.name + ' (' + t.key + ')'">
              <svg viewBox="0 0 20 20" aria-hidden="true"><path [attr.d]="icons[t.id]" /></svg>
            </button>
          }
        </div>
        <div class="grp" role="group" aria-label="History">
          <button type="button" class="tb" (click)="undo()" [disabled]="!past().length" aria-label="Undo (Ctrl+Z)" title="Undo (Ctrl+Z)">
            <svg viewBox="0 0 20 20" aria-hidden="true"><path [attr.d]="icons['undo']" /></svg>
          </button>
          <button type="button" class="tb" (click)="redo()" [disabled]="!future().length" aria-label="Redo (Ctrl+Shift+Z)" title="Redo (Ctrl+Shift+Z)">
            <svg viewBox="0 0 20 20" aria-hidden="true"><path [attr.d]="icons['redo']" /></svg>
          </button>
          <button type="button" class="tb" (click)="clear()" [disabled]="!doc.shapes().length" aria-label="Remove every mark" title="Remove every mark">
            <svg viewBox="0 0 20 20" aria-hidden="true"><path [attr.d]="icons['trash']" /></svg>
          </button>
        </div>
      </div>

      <div class="stage">
        <svg
          #svg
          id="swm-stage"
          class="pic"
          viewBox="0 0 1200 760"
          role="application"
          tabindex="0"
          aria-roledescription="screenshot editor"
          aria-label="Sample order page to mark up"
          aria-describedby="swm-help"
          [class.is-step]="tool() === 'step'"
          (pointerdown)="down($event)"
          (pointermove)="move($event)"
          (pointerup)="up()"
          (pointercancel)="up()"
          (keydown)="key($event)"
        >
          <defs>
            @for (b of blocks; track b) {
              <filter [attr.id]="'swm-pix-' + b" x="0" y="0" width="1200" height="760" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
                <feGaussianBlur in="SourceGraphic" [attr.stdDeviation]="b / 3" result="soft" />
                <feFlood [attr.x]="b / 2 - 1" [attr.y]="b / 2 - 1" width="2" height="2" flood-color="#000" result="dot" />
                <feComposite in="dot" in2="dot" x="0" y="0" [attr.width]="b" [attr.height]="b" result="cell" />
                <feTile in="cell" result="grid" />
                <feComposite in="soft" in2="grid" operator="in" result="seeds" />
                <feMorphology in="seeds" operator="dilate" [attr.radius]="b / 2 - 0.5" />
              </filter>
            }
            @for (b of blurs(); track b.id) {
              <clipPath [attr.id]="'swm-clip-' + b.id"><rect [attr.x]="b.x" [attr.y]="b.y" [attr.width]="b.w" [attr.height]="b.h" /></clipPath>
            }
            <g id="swm-art" class="art">
              <rect width="1200" height="760" fill="#f5f4f0" />
              <rect width="1200" height="64" fill="#ffffff" />
              <rect y="64" width="1200" height="1" fill="#e7e5df" />
              <rect x="32" y="18" width="28" height="28" rx="8" fill="#2f6bff" />
              <text x="72" y="39" class="t" font-size="18" font-weight="650">Parcelly</text>
              <text x="820" y="38" class="t2" font-size="14" font-weight="500">Orders</text>
              <text x="916" y="38" class="t2" font-size="14" font-weight="500">Returns</text>
              <text x="1012" y="38" class="t2" font-size="14" font-weight="500">Help</text>
              <rect x="1100" y="16" width="68" height="32" rx="16" fill="#16161a" />
              <text x="1109" y="37" fill="#ffffff" font-size="13" font-weight="550">Sign out</text>

              <text x="64" y="136" class="t" font-size="34" font-weight="650">Your order is on its way</text>
              <text x="64" y="168" class="t2" font-size="16">Order 48213-QX · placed on 14 October</text>

              <rect x="64" y="200" width="700" height="250" rx="16" fill="#ffffff" />
              <text x="96" y="240" class="t" font-size="18" font-weight="600">Tracking</text>
              <rect x="112" y="300" width="600" height="4" fill="#e7e5df" />
              <rect x="112" y="300" width="300" height="4" fill="#2f6bff" />
              @for (s of stops; track s; let i = $index) {
                <circle [attr.cx]="112 + i * 150" cy="302" r="10" [attr.fill]="i <= 2 ? '#2f6bff' : '#e7e5df'" />
                <text [attr.x]="112 + i * 150" y="340" text-anchor="middle" font-size="13" [attr.font-weight]="i === 2 ? 600 : 450" [attr.fill]="i <= 2 ? '#16161a' : '#8a8780'">{{ s }}</text>
              }
              <text x="96" y="396" class="t2" font-size="15">Expected on Thursday, 23 October, between 10:00 and 14:00.</text>
              <text x="96" y="422" class="t2" font-size="15">Something wrong? You can change the delivery day until 8 pm.</text>

              <rect x="796" y="200" width="340" height="250" rx="16" fill="#ffffff" />
              <text x="828" y="240" class="t" font-size="18" font-weight="600">Delivering to</text>
              @for (a of address; track a; let i = $index) {
                <text x="828" [attr.y]="280 + i * 28" class="t" font-size="15" font-weight="450">{{ a }}</text>
              }
              <rect x="828" y="408" width="120" height="28" rx="14" fill="#eef3ff" />
              <text x="840" y="427" fill="#2f6bff" font-size="13" font-weight="550">Change address</text>

              <rect x="64" y="482" width="1072" height="230" rx="16" fill="#ffffff" />
              <text x="96" y="522" class="t" font-size="18" font-weight="600">In this parcel</text>
              @for (it of items; track it.name; let i = $index) {
                <rect x="96" [attr.y]="548 + i * 52" width="40" height="40" rx="8" [attr.fill]="it.color" />
                <text x="152" [attr.y]="573 + i * 52" class="t" font-size="15" font-weight="500">{{ it.name }}</text>
                <text x="1104" [attr.y]="573 + i * 52" class="t2" font-size="15" font-weight="500" text-anchor="end">{{ it.price }}</text>
              }
            </g>
          </defs>

          <use href="#swm-art" aria-hidden="true" />
          <g aria-hidden="true">
            @for (d of drawn(); track d.id) {
              @switch (d.kind) {
                @case ('blur') {
                  <g [attr.clip-path]="'url(#swm-clip-' + d.id + ')'"><use href="#swm-art" [attr.filter]="'url(#swm-pix-' + d.block + ')'" /></g>
                }
                @case ('rect') {
                  <rect [attr.x]="d.x" [attr.y]="d.y" [attr.width]="d.w" [attr.height]="d.h" [attr.rx]="d.rx" fill="none" [attr.stroke]="d.color" [attr.stroke-width]="d.lw" />
                }
                @case ('ellipse') {
                  <ellipse [attr.cx]="d.x" [attr.cy]="d.y" [attr.rx]="d.w" [attr.ry]="d.h" fill="none" [attr.stroke]="d.color" [attr.stroke-width]="d.lw" />
                }
                @case ('arrow') {
                  <path [attr.d]="d.d" fill="none" [attr.stroke]="d.color" [attr.stroke-width]="d.lw" stroke-linecap="round" />
                  <polygon [attr.points]="d.head" [attr.fill]="d.color" [attr.stroke]="d.color" [attr.stroke-width]="d.headW" stroke-linejoin="round" />
                }
                @case ('marker') {
                  <path class="hl" [attr.d]="d.d" fill="none" [attr.stroke]="d.color" [attr.stroke-width]="d.lw" stroke-linecap="butt" stroke-linejoin="round" />
                }
                @case ('step') {
                  <circle [attr.cx]="d.x" [attr.cy]="d.y" [attr.r]="d.r" [attr.fill]="d.color" stroke="rgb(255 255 255 / 0.92)" [attr.stroke-width]="d.ring" />
                  <text class="num" [attr.x]="d.x" [attr.y]="d.y! + d.r! * 0.06" [attr.fill]="d.ink" [attr.font-size]="d.font" text-anchor="middle" dominant-baseline="central">{{ d.n }}</text>
                }
                @default {
                  <path [attr.d]="d.d" fill="none" [attr.stroke]="d.color" [attr.stroke-width]="d.lw" stroke-linecap="round" stroke-linejoin="round" />
                }
              }
            }
          </g>
        </svg>
      </div>

      <div class="opts">
        <div class="swatches" role="group" aria-label="Colour">
          @for (c of colors; track c.value) {
            <button type="button" class="sw" [attr.aria-pressed]="color() === c.value" (click)="setColor(c.value, c.name)" [attr.aria-label]="c.name" [title]="c.name">
              <i [style.background]="c.value"></i>
            </button>
          }
        </div>
        <div class="seg sizes" role="group" aria-label="Size">
          @for (z of sizes; track z.v) {
            <button type="button" [attr.aria-pressed]="size() === z.v" (click)="setSize(z.v, z.name)" [attr.aria-label]="z.name" [title]="z.name">
              <span [class]="'dot dot-' + z.v"></span>
            </button>
          }
        </div>
      </div>

      <p class="mono status" aria-hidden="true">{{ doc.shapes().length }} marks · {{ stepCount() }} steps · {{ hint() }}</p>
      <p id="swm-help" class="sr-only">
        Keys: R rectangle, O ellipse, A arrow, L line, P pen, H highlighter, N numbered step, B blur. Drag on the picture
        to draw, or press Enter to add a mark with the current tool. Delete removes the last mark, Control Z undoes,
        Control Shift Z redoes.
      </p>
      <p class="sr-only" aria-live="polite">{{ announce() }}</p>
    </div>
  `,
  styles: `
    :host {
      display: block;
      min-width: 0;
    }
    .ed {
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
      flex-wrap: wrap;
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

      svg {
        width: 20px;
        height: 20px;
        fill: none;
        stroke: currentColor;
        stroke-width: 1.5;
        stroke-linecap: round;
        stroke-linejoin: round;
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
    .stage {
      padding: 14px;
      background: var(--sw-stage);
    }
    .pic {
      display: block;
      width: 100%;
      height: auto;
      aspect-ratio: 1200 / 760;
      border-radius: 6px;
      box-shadow: 0 10px 30px -12px rgb(0 0 0 / 0.7);
      font-family: var(--font-sans);
      touch-action: none;
      cursor: crosshair;
      user-select: none;
      -webkit-user-select: none;
      isolation: isolate;

      &:focus:not(:focus-visible) {
        outline: none;
      }
      &:focus-visible {
        outline: 2px solid var(--focus);
        outline-offset: 3px;
        border-radius: 6px;
      }
    }
    .t {
      fill: #16161a;
    }
    .t2 {
      fill: #5c5a55;
    }
    .hl {
      opacity: 0.5;
      mix-blend-mode: multiply;
    }
    .num {
      font-weight: 700;
      pointer-events: none;
    }
    .opts {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 8px 16px;
      padding: 10px 12px 2px;
      border-top: 1px solid var(--line);
    }
    .swatches {
      display: flex;
      flex-wrap: wrap;
    }
    .sw {
      width: 32px;
      height: 40px;
      display: grid;
      place-items: center;
      border-radius: 999px;

      i {
        width: 18px;
        height: 18px;
        border-radius: 50%;
        box-shadow: 0 0 0 1px var(--line-strong);
        transition: transform var(--t-fast) var(--ease);
      }
      &[aria-pressed='true'] i {
        box-shadow:
          0 0 0 2px var(--surface),
          0 0 0 4px var(--sw-orange);
      }
      &:hover i {
        transform: scale(1.12);
      }
    }
    .sizes {
      padding: 3px;
      gap: 2px;

      button {
        width: 40px;
        height: 34px;
        padding: 0;
        justify-content: center;
      }
    }
    .dot {
      display: block;
      border-radius: 50%;
      background: currentColor;
    }
    .dot-s {
      width: 4px;
      height: 4px;
    }
    .dot-m {
      width: 7px;
      height: 7px;
    }
    .dot-l {
      width: 11px;
      height: 11px;
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
        width: 36px;
        height: 36px;
      }
      .stage {
        padding: 8px;
      }
      .sw {
        width: 30px;
      }
    }
    @media (prefers-reduced-motion: reduce) {
      .sw i {
        transition: none;
      }
    }
  `,
})
export class SwoopMarkupDemo {
  protected readonly doc = inject(SwoopDoc);
  protected readonly tools = TOOLS;
  protected readonly colors = COLORS;
  protected readonly icons = ICONS;
  protected readonly sizes: { v: Size; name: string }[] = [
    { v: 's', name: 'Thin' },
    { v: 'm', name: 'Medium' },
    { v: 'l', name: 'Thick' },
  ];
  protected readonly blocks = [METRICS.s.block, METRICS.m.block, METRICS.l.block];
  protected readonly stops = ['Ordered', 'Packed', 'Shipped', 'Out for delivery', 'Delivered'];
  protected readonly address = ['Anna Kowalski', '27 Willow Lane, Flat 4', 'Bristol BS1 6QT', 'anna.kowalski@example.com', '+44 7700 900461'];
  protected readonly items = [
    { color: '#ffd6a5', name: 'Ceramic pour-over set', price: '£34.00' },
    { color: '#caffbf', name: 'Paper filters, 100 pack', price: '£6.50' },
    { color: '#a0c4ff', name: 'Linen tea towel', price: '£12.00' },
  ];

  protected readonly tool = signal<ToolId>('arrow');
  protected readonly color = signal(COLORS[0].value);
  protected readonly size = signal<Size>('m');
  protected readonly announce = signal('');
  protected readonly past = signal<Shape[][]>([]);
  protected readonly future = signal<Shape[][]>([]);
  private readonly draft = signal<Shape | null>(null);

  /** Steps are numbered by their order in the list, like editor.js stepNumber. */
  private readonly stepNumbers = computed(() => {
    const m = new Map<number, number>();
    let n = 0;
    for (const s of this.doc.shapes()) if (s.type === 'step') m.set(s.id, ++n);
    return m;
  });
  protected readonly stepCount = computed(() => this.stepNumbers().size);

  protected readonly drawn = computed(() => {
    const steps = this.stepNumbers();
    const list = this.doc.shapes().map((s) => draw(s, steps));
    const d = this.draft();
    if (d) list.push(draw(d, steps));
    return list.filter((x): x is Drawn => !!x);
  });
  protected readonly blurs = computed(() => this.drawn().filter((d) => d.kind === 'blur'));
  protected readonly hint = computed(() => {
    const t = this.tool();
    return t === 'step' ? 'click to drop the next number' : t === 'blur' ? 'drag over the address to hide it' : 'drag on the picture';
  });

  private readonly svg = viewChild.required<ElementRef<SVGSVGElement>>('svg');
  private uid = SEED.length;
  private slot = 0;
  private start: { x: number; y: number } | null = null;

  protected setTool(t: ToolId): void {
    this.tool.set(t);
    this.say(`${TOOLS.find((x) => x.id === t)?.name}`);
  }

  protected setColor(c: string, name: string): void {
    this.color.set(c);
    this.say(name);
  }

  protected setSize(z: Size, name: string): void {
    this.size.set(z);
    this.say(name);
  }

  // ---------- history: every change is one step ----------
  private commit(next: Shape[]): void {
    this.past.update((p) => [...p.slice(-HISTORY + 1), this.doc.shapes()]);
    this.future.set([]);
    this.doc.shapes.set(next);
  }

  protected undo(): void {
    const p = this.past();
    if (!p.length) return;
    this.future.update((f) => [...f, this.doc.shapes()]);
    this.doc.shapes.set(p[p.length - 1]);
    this.past.set(p.slice(0, -1));
    this.say('Undone');
  }

  protected redo(): void {
    const f = this.future();
    if (!f.length) return;
    this.past.update((p) => [...p, this.doc.shapes()]);
    this.doc.shapes.set(f[f.length - 1]);
    this.future.set(f.slice(0, -1));
    this.say('Redone');
  }

  protected clear(): void {
    if (!this.doc.shapes().length) return;
    this.commit([]);
    this.say('Every mark removed. Control Z brings them back.');
  }

  private make(x: number, y: number): Shape {
    const t = this.tool();
    const m = METRICS[this.size()];
    const base: Shape = { id: ++this.uid, type: t, color: this.color(), lw: m.stroke, x1: x, y1: y, x2: x, y2: y };
    if (t === 'pen' || t === 'marker') return { ...base, lw: t === 'marker' ? m.marker : m.stroke, pts: [x, y] };
    if (t === 'step') return { ...base, lw: 0, r: m.radius };
    if (t === 'blur') return { ...base, color: '', lw: 0, block: m.block };
    return base;
  }

  private add(s: Shape): void {
    this.commit([...this.doc.shapes(), s]);
    const name = TOOLS.find((t) => t.id === s.type)?.name ?? 'Mark';
    this.say(s.type === 'step' ? `Step ${this.stepNumbers().get(s.id)} added` : `${name} added`);
  }

  // ---------- pointer ----------
  protected down(e: PointerEvent): void {
    if (e.button !== 0) return;
    const svg = this.svg().nativeElement;
    svg.focus({ preventScroll: true });
    const p = this.point(e);
    e.preventDefault();
    if (this.tool() === 'step') {
      this.add(this.make(p.x, p.y));
      return;
    }
    this.start = p;
    this.draft.set(this.make(p.x, p.y));
    svg.setPointerCapture(e.pointerId);
  }

  protected move(e: PointerEvent): void {
    const d = this.draft();
    if (!d || !this.start) return;
    const p = this.point(e);
    if (d.type === 'pen' || d.type === 'marker') {
      const pts = d.pts ?? [];
      if (Math.hypot(p.x - pts[pts.length - 2], p.y - pts[pts.length - 1]) < 4) return;
      this.draft.set({ ...d, pts: [...pts, p.x, p.y] });
    } else {
      let { x, y } = p;
      if (e.shiftKey && (d.type === 'rect' || d.type === 'ellipse' || d.type === 'blur')) {
        const size = Math.max(Math.abs(x - this.start.x), Math.abs(y - this.start.y));
        x = this.start.x + Math.sign(x - this.start.x || 1) * size;
        y = this.start.y + Math.sign(y - this.start.y || 1) * size;
      }
      this.draft.set({ ...d, x2: x, y2: y });
    }
  }

  protected up(): void {
    const d = this.draft();
    this.draft.set(null);
    this.start = null;
    if (!d) return;
    const long = d.type === 'pen' || d.type === 'marker' ? (d.pts?.length ?? 0) >= 4 : Math.hypot(d.x2 - d.x1, d.y2 - d.y1) >= MIN_SHAPE;
    if (long) this.add(d);
  }

  // ---------- keyboard ----------
  protected key(e: KeyboardEvent): void {
    const mod = e.ctrlKey || e.metaKey;
    const k = e.key.toLowerCase();
    if (mod && (k === 'z' || k === 'y')) {
      e.preventDefault();
      if (k === 'y' || e.shiftKey) this.redo();
      else this.undo();
      return;
    }
    if (mod || e.altKey) return;
    const t = TOOLS.find((x) => x.key.toLowerCase() === k);
    if (t) {
      e.preventDefault();
      this.setTool(t.id);
      return;
    }
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      this.addAtSlot();
    } else if (e.key === 'Delete' || e.key === 'Backspace') {
      e.preventDefault();
      const list = this.doc.shapes();
      if (!list.length) return;
      this.commit(list.slice(0, -1));
      this.say('Last mark removed');
    }
  }

  /** Keyboard drawing: drops a mark with the current tool on the next of six spots on the sample. */
  private addAtSlot(): void {
    const spots: [number, number][] = [
      [96, 548],
      [62, 92],
      [820, 400],
      [600, 520],
      [380, 120],
      [140, 640],
    ];
    const [x, y] = spots[this.slot++ % spots.length];
    const s = this.make(x, y);
    if (s.type === 'pen' || s.type === 'marker') s.pts = Array.from({ length: 16 }, (_, i) => [x + i * 14, y + 12 + Math.sin(i * 0.7) * 6]).flat();
    else if (s.type === 'arrow' || s.type === 'line') Object.assign(s, { x2: x + 160, y2: y - 40 });
    else if (s.type !== 'step') Object.assign(s, { x2: x + 220, y2: y + 60 });
    this.add(s);
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
