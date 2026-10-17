import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { DOT, type El, FILLS, type FillStyle, PAPER, type ShapeType, build, halftoneGrid, ink, offsetShift } from './marker';

const FILL_NAMES = ['Yellow', 'Pink', 'Blue', 'Green', 'Peach'];
const STROKE_FOR: Record<string, string> = {
  '#ffe14a': '#1d1d1b',
  '#ffb3dd': '#ff48b0',
  '#a6d3f2': '#0078bf',
  '#9fe0bd': '#00a95c',
  '#ffc49e': '#ff6c2f',
};

/**
 * The three print fills side by side: Offset (the tint printed a few pixels off the outline, like a risograph out of
 * register), Solid (right inside it) and Dots (a halftone screen). Shape, pen width, tint and paper are live, and the
 * numbers under each panel are the ones scene.js computes for that shape. Same seed in all three panels, so only the
 * fill changes. Pure SVG; renders on the server.
 */
@Component({
  selector: 'mh-scrawl-fills',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="spec card">
      <div class="ctrls">
        <div class="opt" role="group" aria-labelledby="scf-shape">
          <span id="scf-shape" class="mono k">Shape</span>
          <div class="seg">
            @for (s of shapes; track s.v) {
              <button type="button" [attr.aria-pressed]="shape() === s.v" (click)="shape.set(s.v)">{{ s.label }}</button>
            }
          </div>
        </div>
        <div class="opt" role="group" aria-labelledby="scf-width">
          <span id="scf-width" class="mono k">Pen</span>
          <div class="seg">
            @for (w of widths; track w.v) {
              <button type="button" [attr.aria-pressed]="width() === w.v" (click)="width.set(w.v)">{{ w.label }}</button>
            }
          </div>
        </div>
        <div class="opt" role="group" aria-labelledby="scf-tint">
          <span id="scf-tint" class="mono k">Tint</span>
          <div class="swatches">
            @for (c of tints; track c; let i = $index) {
              <button type="button" class="sw" [attr.aria-pressed]="tint() === c" (click)="tint.set(c)" [attr.aria-label]="names[i]" [title]="names[i]">
                <i [style.background]="ink(c, dark())"></i>
              </button>
            }
          </div>
        </div>
        <div class="opt" role="group" aria-labelledby="scf-paper">
          <span id="scf-paper" class="mono k">Paper</span>
          <div class="seg">
            <button type="button" [attr.aria-pressed]="!dark()" (click)="dark.set(false)">Light</button>
            <button type="button" [attr.aria-pressed]="dark()" (click)="dark.set(true)">Dark</button>
          </div>
        </div>
      </div>

      <ul class="panels" role="list">
        @for (p of panels(); track p.fill) {
          <li class="panel">
            <svg viewBox="0 0 240 170" role="img" [attr.aria-label]="p.name + ' fill on a ' + shapeName() + ', ' + p.metric">
              <defs>
                <pattern [attr.id]="'scf-dots-' + p.fill" width="24" height="24" patternUnits="userSpaceOnUse">
                  <circle cx="12" cy="12" r="1.1" [attr.fill]="dark() ? dotDark : dotLight" />
                </pattern>
              </defs>
              <rect width="240" height="170" [attr.fill]="paper()" />
              <rect width="240" height="170" [attr.fill]="'url(#scf-dots-' + p.fill + ')'" />
              @for (f of p.fills; track $index) {
                <path [attr.d]="f.d" [attr.fill]="f.color" />
              }
              @for (k of p.strokes; track $index) {
                <path [attr.d]="k.d" fill="none" [attr.stroke]="k.color" [attr.stroke-width]="k.width" stroke-linecap="round" stroke-linejoin="round" />
              }
            </svg>
            <div class="cap">
              <b>{{ p.name }}</b>
              <span class="mono">{{ p.metric }}</span>
            </div>
          </li>
        }
      </ul>
    </div>
  `,
  styles: `
    :host {
      display: block;
      min-width: 0;
    }
    .spec {
      padding: 0;
      overflow: hidden;
    }
    .ctrls {
      display: flex;
      flex-wrap: wrap;
      gap: 8px 18px;
      padding: 12px 14px;
      border-bottom: 1px solid var(--line);
    }
    .opt {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .k {
      font-size: 11px;
      color: var(--muted);
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
      }
      &[aria-pressed='true'] i {
        box-shadow:
          0 0 0 2px var(--surface),
          0 0 0 4px var(--cta);
      }
    }
    .panels {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 12px;
      padding: 14px;
      margin: 0;
      list-style: none;
    }
    .panel svg {
      display: block;
      width: 100%;
      height: auto;
      border-radius: var(--r-inner);
      border: 1px solid var(--line);
    }
    .cap {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      gap: 8px;
      padding: 10px 4px 0;

      b {
        font-size: 14px;
        font-weight: 600;
      }
      span {
        font-size: 11.5px;
        color: var(--muted);
        text-align: right;
      }
    }
    @media (max-width: 640px) {
      .panels {
        gap: 8px;
        padding: 10px;
      }
      .cap {
        flex-direction: column;
        gap: 2px;
        padding-top: 8px;

        span {
          text-align: left;
          font-size: 10.5px;
        }
      }
    }
  `,
})
export class ScrawlFillDemo {
  protected readonly shapes: { v: ShapeType; label: string }[] = [
    { v: 'rect', label: 'Box' },
    { v: 'ellipse', label: 'Circle' },
    { v: 'diamond', label: 'Diamond' },
  ];
  protected readonly widths: { v: 1 | 2 | 4; label: string }[] = [
    { v: 1, label: 'Fine' },
    { v: 2, label: 'Medium' },
    { v: 4, label: 'Broad' },
  ];
  protected readonly tints = FILLS;
  protected readonly names = FILL_NAMES;
  protected readonly dotDark = DOT.dark;
  protected readonly dotLight = DOT.light;
  protected readonly ink = ink;

  protected readonly shape = signal<ShapeType>('rect');
  protected readonly width = signal<1 | 2 | 4>(2);
  protected readonly tint = signal<string>(FILLS[0]);
  protected readonly dark = signal(false);

  protected readonly paper = computed(() => (this.dark() ? PAPER.dark : PAPER.light));
  protected readonly shapeName = computed(() => this.shapes.find((s) => s.v === this.shape())?.label.toLowerCase() ?? '');

  protected readonly panels = computed(() => {
    const type = this.shape();
    const sw = this.width();
    const bg = this.tint();
    const dark = this.dark();
    const box = type === 'rect' ? { x: 40, y: 32, w: 150, h: 100 } : type === 'ellipse' ? { x: 36, y: 28, w: 160, h: 108 } : { x: 36, y: 20, w: 162, h: 126 };
    const fills: { fill: FillStyle; name: string }[] = [
      { fill: 'offset', name: 'Offset' },
      { fill: 'solid', name: 'Solid' },
      { fill: 'dots', name: 'Dots' },
    ];
    const poly: [number, number][] = [[box.x, box.y], [box.x + box.w, box.y + box.h]];
    const grid = halftoneGrid(poly, sw);
    return fills.map(({ fill, name }) => {
      const el: El = { id: fill, type, ...box, stroke: STROKE_FOR[bg] ?? '#1d1d1b', bg, fill, width: sw, rough: 1, seed: 2026 };
      const d = build(el);
      const metric =
        fill === 'offset'
          ? `shifted ${offsetShift(sw)} px`
          : fill === 'solid'
            ? 'shifted 0 px'
            : `step ${round1(grid.step)} px, dot ${round1(grid.r)} px`;
      return {
        fill,
        name,
        metric,
        fills: d.fills.map((f) => ({ d: f.d, color: ink(f.color, dark) })),
        strokes: d.strokes.map((k) => ({ d: k.d, color: ink(k.color, dark), width: k.width })),
      };
    });
  });
}

const round1 = (n: number) => Math.round(n * 10) / 10;
