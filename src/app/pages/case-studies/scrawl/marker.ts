// The Scrawl marker look, ported line for line from scene.js in the Scrawl repo (D:\workspace-personal\mhfrough_projects
// \scrawl, read only) for the demos on this page. Pure functions over numbers and strings: no DOM, no canvas, no
// randomness beyond a seeded generator, so the server renders exactly the paths the browser will, and hydration
// finds the same SVG it left. Scrawl itself feeds these paths to Path2D (editor, PNG) and to <path d> (SVG export);
// the demos here use the SVG side only.

export type ShapeType = 'rect' | 'ellipse' | 'diamond';
export type ElType = ShapeType | 'arrow' | 'line' | 'draw';
export type FillStyle = 'offset' | 'solid' | 'dots';
export type Rough = 0 | 1 | 2;
export type Point = [number, number];

/** One element, in the same field names Scrawl saves (a subset). Points are relative to x, y. */
export interface El {
  id: string;
  type: ElType;
  x: number;
  y: number;
  w: number;
  h: number;
  points?: Point[];
  stroke: string;
  bg: string; // 'transparent' or a hex colour
  fill: FillStyle;
  width: 1 | 2 | 4;
  rough: Rough;
  seed: number;
  round?: boolean;
  dash?: 'solid' | 'dashed' | 'dotted';
  end?: 'none' | 'arrow' | 'triangle' | 'dot';
  label?: string; // demo only: Scrawl keeps labels as separate text elements
}

export interface Drawn {
  fills: { d: string; color: string }[];
  strokes: { d: string; color: string; width: number; dash: string; cap?: 'round' | 'square'; alpha?: number }[];
}

/** Scrawl's marker inks and fill tints (app.js STROKES and FILLS), and its two papers (scene.js PAPER). */
export const STROKES = ['#1d1d1b', '#0078bf', '#ff48b0', '#00a95c', '#ff6c2f', '#e3342f'] as const;
export const FILLS = ['#ffe14a', '#ffb3dd', '#a6d3f2', '#9fe0bd', '#ffc49e'] as const;
export const PAPER = { light: '#f7f6f1', dark: '#161614' } as const;
export const DOT = { light: 'rgba(29,29,27,.2)', dark: 'rgba(238,237,230,.16)' } as const;

// ---------- small maths ----------

/** mulberry32, as in scene.js: the same seed always gives the same wobble. */
export function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Deterministic seeds for shapes drawn in the demos (Scrawl uses crypto.getRandomValues; SSR needs repeatable). */
export const seedFor = (n: number): number => Math.imul(n + 1, 2654435761) >>> 0;

const r2 = (n: number) => Math.round(n * 100) / 100;

function pointInPolygon(x: number, y: number, poly: Point[]): boolean {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i];
    const [xj, yj] = poly[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

class Path {
  private readonly d: string[] = [];
  M(x: number, y: number) {
    this.d.push(`M${r2(x)} ${r2(y)}`);
  }
  L(x: number, y: number) {
    this.d.push(`L${r2(x)} ${r2(y)}`);
  }
  Q(a: number, b: number, x: number, y: number) {
    this.d.push(`Q${r2(a)} ${r2(b)} ${r2(x)} ${r2(y)}`);
  }
  C(a: number, b: number, c: number, d: number, x: number, y: number) {
    this.d.push(`C${r2(a)} ${r2(b)} ${r2(c)} ${r2(d)} ${r2(x)} ${r2(y)}`);
  }
  dot(x: number, y: number, r: number) {
    this.d.push(`M${r2(x - r)} ${r2(y)}a${r2(r)} ${r2(r)} 0 1 0 ${r2(r * 2)} 0a${r2(r)} ${r2(r)} 0 1 0 ${r2(-r * 2)} 0`);
  }
  Z() {
    this.d.push('Z');
  }
  toString() {
    return this.d.join('');
  }
}

// ---------- path building (scene.js) ----------

/** One felt-tip stroke: a gently bowed curve with a slight wobble. `over` lets it run past both ends. */
function markerLine(p: Path, x1: number, y1: number, x2: number, y2: number, rough: number, rand: () => number, over = 0) {
  const len = Math.hypot(x2 - x1, y2 - y1) || 1;
  const ux = (x2 - x1) / len;
  const uy = (y2 - y1) / len;
  if (over) {
    const a = over * (0.4 + rand() * 0.8);
    const b = over * (0.4 + rand() * 0.8);
    x1 -= ux * a;
    y1 -= uy * a;
    x2 += ux * b;
    y2 += uy * b;
  }
  if (!rough) {
    p.M(x1, y1);
    p.L(x2, y2);
    return;
  }
  const j = () => (rand() - 0.5) * 2 * Math.min(1.2 * rough, len / 12);
  const bow = (rand() - 0.5) * Math.min(len / 24, 7) * rough;
  const nx = -uy;
  const ny = ux;
  const t1 = 0.25 + rand() * 0.15;
  const t2 = 0.6 + rand() * 0.15;
  p.M(x1 + j(), y1 + j());
  p.C(
    x1 + (x2 - x1) * t1 + nx * bow,
    y1 + (y2 - y1) * t1 + ny * bow,
    x1 + (x2 - x1) * t2 + nx * bow * 0.8,
    y1 + (y2 - y1) * t2 + ny * bow * 0.8,
    x2 + j(),
    y2 + j(),
  );
}

/** Smooth curve through points (Catmull-Rom as cubic Beziers). */
function curveThrough(p: Path, pts: Point[], closed: boolean) {
  const n = pts.length;
  if (n < 2) return;
  const at = (i: number) => (closed ? pts[(i + n) % n] : pts[Math.max(0, Math.min(n - 1, i))]);
  p.M(pts[0][0], pts[0][1]);
  const segs = closed ? n : n - 1;
  for (let i = 0; i < segs; i++) {
    const a = at(i - 1);
    const b = at(i);
    const c = at(i + 1);
    const d = at(i + 2);
    p.C(b[0] + (c[0] - a[0]) / 6, b[1] + (c[1] - a[1]) / 6, c[0] - (d[0] - b[0]) / 6, c[1] - (d[1] - b[1]) / 6, c[0], c[1]);
  }
  if (closed) p.Z();
}

/** A closed loop drawn in one go: it wobbles, and the pen carries on past where it started. */
function markerLoop(p: Path, pts: Point[], rough: number, rand: () => number) {
  if (!rough) {
    curveThrough(p, pts, true);
    return;
  }
  const o = rough * 1.6;
  const q: Point[] = pts.map(([x, y]) => [x + (rand() - 0.5) * 2 * o, y + (rand() - 0.5) * 2 * o]);
  const run = 1 + Math.floor(rand() * 2);
  for (let i = 0; i < run; i++) q.push([q[i][0] + (rand() - 0.5) * 3 * rough, q[i][1] + (rand() - 0.5) * 3 * rough]);
  curveThrough(p, q, false);
}

function ellipsePoints(cx: number, cy: number, rx: number, ry: number, n: number, start = 0, rand: (() => number) | null = null, jitter = 0): Point[] {
  const pts: Point[] = [];
  for (let i = 0; i < n; i++) {
    const a = start + (i / n) * Math.PI * 2;
    const k = rand ? 1 + (rand() - 0.5) * jitter : 1;
    pts.push([cx + rx * k * Math.cos(a), cy + ry * k * Math.sin(a)]);
  }
  return pts;
}

function polygonFor(el: { type: ElType; x: number; y: number; w: number; h: number }): Point[] {
  const { x, y, w, h } = el;
  return el.type === 'rect'
    ? [[x, y], [x + w, y], [x + w, y + h], [x, y + h]]
    : [[x + w / 2, y], [x + w, y + h / 2], [x + w / 2, y + h], [x, y + h / 2]];
}

const cornerRadius = (el: El) => Math.min(28, Math.min(Math.abs(el.w), Math.abs(el.h)) * (el.type === 'rect' ? 0.2 : 0.12));
const toward = (a: Point, b: Point, d: number): Point => {
  const len = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
  return [a[0] + ((b[0] - a[0]) / len) * d, a[1] + ((b[1] - a[1]) / len) * d];
};

/** Points along a polygon with rounded corners, close enough together to keep the sides straight. */
function roundedPoints(verts: Point[], r: number): Point[] {
  const out: Point[] = [];
  const n = verts.length;
  for (let i = 0; i < n; i++) {
    const prev = verts[(i - 1 + n) % n];
    const cur = verts[i];
    const next = verts[(i + 1) % n];
    const rr = Math.min(r, Math.hypot(cur[0] - prev[0], cur[1] - prev[1]) / 2, Math.hypot(next[0] - cur[0], next[1] - cur[1]) / 2);
    const a = toward(cur, prev, rr);
    const b = toward(cur, next, rr);
    for (let k = 0; k <= 4; k++) {
      const t = k / 4;
      const u = 1 - t;
      out.push([u * u * a[0] + 2 * u * t * cur[0] + t * t * b[0], u * u * a[1] + 2 * u * t * cur[1] + t * t * b[1]]);
    }
    const nb = toward(next, cur, Math.min(r, Math.hypot(next[0] - cur[0], next[1] - cur[1]) / 2));
    const steps = Math.floor(Math.hypot(nb[0] - b[0], nb[1] - b[1]) / 70);
    for (let k = 1; k <= steps; k++) out.push([b[0] + ((nb[0] - b[0]) * k) / (steps + 1), b[1] + ((nb[1] - b[1]) * k) / (steps + 1)]);
  }
  return out;
}

function roundedPath(p: Path, verts: Point[], r: number) {
  const n = verts.length;
  for (let i = 0; i < n; i++) {
    const prev = verts[(i - 1 + n) % n];
    const cur = verts[i];
    const next = verts[(i + 1) % n];
    const rr = Math.min(r, Math.hypot(cur[0] - prev[0], cur[1] - prev[1]) / 2, Math.hypot(next[0] - cur[0], next[1] - cur[1]) / 2);
    const a = toward(cur, prev, rr);
    const b = toward(cur, next, rr);
    if (i === 0) p.M(a[0], a[1]);
    else p.L(a[0], a[1]);
    p.Q(cur[0], cur[1], b[0], b[1]);
  }
  p.Z();
}

function polyPath(p: Path, pts: Point[]) {
  p.M(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) p.L(pts[i][0], pts[i][1]);
  p.Z();
}

/** Pen: a filled outline that swells with slow strokes and tapers at both ends. */
function penOutline(p: Path, pts: Point[], base: number) {
  const n = pts.length;
  const widths = pts.map((_, i) => {
    const prev = pts[Math.max(0, i - 1)];
    const next = pts[Math.min(n - 1, i + 1)];
    const speed = Math.hypot(next[0] - prev[0], next[1] - prev[1]);
    const ends = Math.min(1, (i + 1) / 5, (n - i) / 5);
    return base * (0.55 + 0.45 * ends) * (1.15 - Math.min(speed / 60, 0.45));
  });
  const left: Point[] = [];
  const right: Point[] = [];
  for (let i = 0; i < n; i++) {
    const prev = pts[Math.max(0, i - 1)];
    const next = pts[Math.min(n - 1, i + 1)];
    let dx = next[0] - prev[0];
    let dy = next[1] - prev[1];
    const len = Math.hypot(dx, dy) || 1;
    dx /= len;
    dy /= len;
    const w = widths[i] / 2;
    left.push([pts[i][0] - dy * w, pts[i][1] + dx * w]);
    right.push([pts[i][0] + dy * w, pts[i][1] - dx * w]);
  }
  curveThrough(p, [...left, ...right.reverse()], true);
  p.dot(pts[0][0], pts[0][1], widths[0] / 2);
  p.dot(pts[n - 1][0], pts[n - 1][1], widths[n - 1] / 2);
}

/** Halftone grid for a polygon: the step and dot radius Scrawl uses, exposed for the fill specimen. */
export function halftoneGrid(poly: Point[], sw: number): { step: number; r: number } {
  let x1 = Infinity;
  let y1 = Infinity;
  let x2 = -Infinity;
  let y2 = -Infinity;
  for (const [x, y] of poly) {
    x1 = Math.min(x1, x);
    y1 = Math.min(y1, y);
    x2 = Math.max(x2, x);
    y2 = Math.max(y2, y);
  }
  const step = Math.max(6 + sw, Math.sqrt(((x2 - x1) * (y2 - y1)) / 5000));
  return { step, r: step * 0.24 };
}

/** Halftone dots inside a polygon, like a screen-printed tint. */
function halftone(p: Path, poly: Point[], sw: number) {
  let x1 = Infinity;
  let y1 = Infinity;
  let x2 = -Infinity;
  let y2 = -Infinity;
  for (const [x, y] of poly) {
    x1 = Math.min(x1, x);
    y1 = Math.min(y1, y);
    x2 = Math.max(x2, x);
    y2 = Math.max(y2, y);
  }
  const { step, r } = halftoneGrid(poly, sw);
  let row = 0;
  for (let y = y1 + step / 2; y < y2; y += step * 0.87, row++) {
    for (let x = x1 + step / 2 + (row % 2 ? step / 2 : 0); x < x2; x += step) if (pointInPolygon(x, y, poly)) p.dot(x, y, r);
  }
}

/** Offset shift for a stroke width: how far Offset prints the colour off the outline (Solid: 0). */
export const offsetShift = (sw: number) => 4 + sw * 1.5;

// ---------- geometry per element (scene.js build) ----------

export function build(el: El): Drawn {
  const rand = rng(el.seed || 1);
  const out: Drawn = { fills: [], strokes: [] };
  const sw = el.width || 2;
  const rough = el.rough ?? 1;
  const dash = el.dash ?? 'solid';

  if (el.type === 'rect' || el.type === 'ellipse' || el.type === 'diamond') {
    const { x, y, w, h } = el;
    const sp = new Path();
    let outline: Point[];
    let curved = false;
    if (el.type === 'ellipse') {
      const cx = x + w / 2;
      const cy = y + h / 2;
      const rx = Math.abs(w / 2);
      const ry = Math.abs(h / 2);
      outline = ellipsePoints(cx, cy, rx, ry, 40);
      curved = true;
      if (rough) markerLoop(sp, ellipsePoints(cx, cy, rx, ry, 12, rand() * Math.PI * 2, rand, 0.06 * rough), rough, rand);
      else curveThrough(sp, outline, true);
    } else {
      const verts = polygonFor(el);
      if (el.round) {
        const r = cornerRadius(el);
        outline = roundedPoints(verts, r);
        curved = true;
        if (rough) markerLoop(sp, outline, rough, rand);
        else roundedPath(sp, verts, r);
      } else {
        outline = verts;
        if (rough) {
          const over = Math.min(9, Math.min(Math.abs(w), Math.abs(h)) * 0.08) * rough * (el.type === 'diamond' ? 0.45 : 1);
          for (let i = 0; i < 4; i++) markerLine(sp, ...verts[i], ...verts[(i + 1) % 4], rough, rand, over);
        } else polyPath(sp, verts);
      }
    }
    if (el.bg && el.bg !== 'transparent') {
      const fp = new Path();
      if (el.fill === 'dots') {
        halftone(fp, outline, sw);
      } else {
        // "offset" prints the colour a few pixels off the outline; "solid" sits right inside it.
        const shift = el.fill === 'offset' ? offsetShift(sw) : 0;
        const pts: Point[] = outline.map(([px, py]) => [px + shift, py + shift]);
        if (curved) curveThrough(fp, pts, true);
        else polyPath(fp, pts);
      }
      out.fills.push({ d: String(fp), color: el.bg });
    }
    out.strokes.push({ d: String(sp), color: el.stroke, width: sw, dash });
  } else if (el.type === 'line' || el.type === 'arrow') {
    const pts: Point[] = (el.points ?? []).map(([px, py]) => [el.x + px, el.y + py]);
    const lp = new Path();
    for (let i = 0; i + 1 < pts.length; i++) markerLine(lp, ...pts[i], ...pts[i + 1], rough, rand);
    out.strokes.push({ d: String(lp), color: el.stroke, width: sw, dash });
    const kind = el.end ?? 'triangle';
    const tip = pts[pts.length - 1];
    const from = pts[pts.length - 2];
    if (el.type === 'arrow' && kind !== 'none' && from) {
      const len = Math.hypot(tip[0] - from[0], tip[1] - from[1]);
      if (len >= 1) {
        const ang = Math.atan2(tip[1] - from[1], tip[0] - from[0]);
        const hl = Math.min(len * 0.45, 10 + sw * 4);
        const hp = new Path();
        const wing = (s: number): Point => [tip[0] - hl * Math.cos(ang + s * 0.42), tip[1] - hl * Math.sin(ang + s * 0.42)];
        if (kind === 'dot') {
          hp.dot(tip[0], tip[1], 2.5 + sw);
          out.fills.push({ d: String(hp), color: el.stroke });
        } else if (kind === 'triangle') {
          const back: Point = [tip[0] - hl * 0.7 * Math.cos(ang), tip[1] - hl * 0.7 * Math.sin(ang)];
          hp.M(...tip);
          hp.L(...wing(1));
          hp.Q(back[0], back[1], ...wing(-1));
          hp.Z();
          out.fills.push({ d: String(hp), color: el.stroke });
        } else {
          const wp = new Path();
          markerLine(wp, ...wing(1), ...tip, rough, rand);
          markerLine(wp, ...wing(-1), ...tip, rough, rand);
          out.strokes.push({ d: String(wp), color: el.stroke, width: sw, dash: 'solid' });
        }
      }
    }
  } else if (el.type === 'draw') {
    const pts: Point[] = (el.points ?? []).map(([px, py]) => [el.x + px, el.y + py]);
    const p = new Path();
    if (pts.length === 1) p.dot(pts[0][0], pts[0][1], Math.max(1.2, sw * 0.9));
    else if (pts.length > 1) penOutline(p, pts, sw * 1.9);
    out.fills.push({ d: String(p), color: el.stroke });
  }
  return out;
}

export function dashFor(dash: string, width: number): string | null {
  if (dash === 'dashed') return `${width * 4 + 5} ${width * 3 + 5}`;
  if (dash === 'dotted') return `0.1 ${width * 3 + 3}`;
  return null;
}

// ---------- colour for the dark page (scene.js ink) ----------
// Dark mode flips lightness and keeps hue, so a drawing reads the same on either paper.

export interface Hsl {
  h: number;
  s: number;
  l: number;
}

export function toHsl(color: string): Hsl {
  let hex = color.replace('#', '');
  if (hex.length === 3) hex = hex.split('').map((c) => c + c).join('');
  const r = parseInt(hex.slice(0, 2), 16) / 255;
  const g = parseInt(hex.slice(2, 4), 16) / 255;
  const b = parseInt(hex.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let hue = 0;
  let sat = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    sat = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    hue = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
    hue *= 60;
  }
  return { h: hue, s: sat, l };
}

/** The flipped lightness Scrawl uses on dark paper: 0.08 + (1 - l) * 0.84. */
export const flipL = (l: number) => 0.08 + (1 - l) * 0.84;

const themed = new Map<string, string>();
export function ink(color: string, dark: boolean): string {
  if (!dark || !color || color === 'transparent') return color;
  const hit = themed.get(color);
  if (hit) return hit;
  const { h, s, l } = toHsl(color);
  const out = `hsl(${Math.round(h)} ${Math.round(s * 100)}% ${Math.round(flipL(l) * 100)}%)`;
  themed.set(color, out);
  return out;
}

/** Bounding box of an element in page units. */
export function bounds(el: El): { x: number; y: number; w: number; h: number } {
  if (el.points) {
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    for (const [px, py] of el.points) {
      minX = Math.min(minX, px);
      minY = Math.min(minY, py);
      maxX = Math.max(maxX, px);
      maxY = Math.max(maxY, py);
    }
    return { x: el.x + minX, y: el.y + minY, w: maxX - minX, h: maxY - minY };
  }
  return { x: Math.min(el.x, el.x + el.w), y: Math.min(el.y, el.y + el.h), w: Math.abs(el.w), h: Math.abs(el.h) };
}
