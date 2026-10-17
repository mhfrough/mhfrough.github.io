import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { DOT, type El, FILLS, PAPER, STROKES, build, flipL, ink, seedFor, toHsl } from './marker';

const NAMES: Record<string, string> = {
  '#1d1d1b': 'Black',
  '#0078bf': 'Blue',
  '#ff48b0': 'Pink',
  '#00a95c': 'Green',
  '#ff6c2f': 'Orange',
  '#e3342f': 'Red',
  '#ffe14a': 'Yellow tint',
  '#ffb3dd': 'Pink tint',
  '#a6d3f2': 'Blue tint',
  '#9fe0bd': 'Green tint',
  '#ffc49e': 'Peach tint',
};

/** hsl (degrees, 0..1, 0..1) to [r, g, b] in 0..1. */
function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return [f(0), f(8), f(4)];
}
const hexToRgb = (hex: string): [number, number, number] => [0, 2, 4].map((i) => parseInt(hex.slice(1 + i, 3 + i), 16) / 255) as [number, number, number];
const lum = ([r, g, b]: [number, number, number]) => {
  const c = (v: number) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
  return 0.2126 * c(r) + 0.7152 * c(g) + 0.0722 * c(b);
};
const ratio = (a: [number, number, number], b: [number, number, number]) => {
  const x = lum(a);
  const y = lum(b);
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
};

/**
 * Dark paper, same drawing: pick any of Scrawl's inks and tints (or any colour) and see the one drawing on both
 * papers. On dark paper Scrawl keeps the hue and saturation and flips the lightness, l' = 0.08 + (1 - l) * 0.84,
 * so a black marker turns into a light grey one and a pale tint into a deep one. The readout shows the numbers and
 * the contrast each version gets against its paper. Pure SVG; the colour input only exists for the visitor's choice.
 */
@Component({
  selector: 'mh-scrawl-ink',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="ink card">
      <div class="pick">
        <div role="group" aria-labelledby="sci-inks" class="row">
          <span id="sci-inks" class="mono k">Inks</span>
          <div class="swatches">
            @for (c of strokes; track c) {
              <button type="button" class="sw" [attr.aria-pressed]="color() === c" (click)="color.set(c)" [attr.aria-label]="names[c]" [title]="names[c]">
                <i [style.background]="c"></i>
              </button>
            }
          </div>
        </div>
        <div role="group" aria-labelledby="sci-tints" class="row">
          <span id="sci-tints" class="mono k">Tints</span>
          <div class="swatches">
            @for (c of tints; track c) {
              <button type="button" class="sw" [attr.aria-pressed]="color() === c" (click)="color.set(c)" [attr.aria-label]="names[c]" [title]="names[c]">
                <i [style.background]="c"></i>
              </button>
            }
          </div>
        </div>
        <div class="row any">
          <label class="mono k" for="sci-any">Any</label>
          <input id="sci-any" type="color" [value]="color()" (input)="pick($event)" />
          <span class="mono hex">{{ color() }}</span>
        </div>
      </div>

      <div class="papers">
        @for (p of papers(); track p.key) {
          <figure class="paper">
            <svg viewBox="0 0 260 150" role="img" [attr.aria-label]="'The drawing on ' + p.key + ' paper in ' + p.css">
              <defs>
                <pattern [attr.id]="'sci-dots-' + p.key" width="24" height="24" patternUnits="userSpaceOnUse">
                  <circle cx="12" cy="12" r="1.1" [attr.fill]="p.dot" />
                </pattern>
              </defs>
              <rect width="260" height="150" [attr.fill]="p.bg" />
              <rect width="260" height="150" [attr.fill]="'url(#sci-dots-' + p.key + ')'" />
              @for (f of p.fills; track $index) {
                <path [attr.d]="f" [attr.fill]="p.css" />
              }
              @for (k of p.strokes; track $index) {
                <path [attr.d]="k" fill="none" [attr.stroke]="p.css" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              }
            </svg>
            <figcaption>
              <b>{{ p.key === 'light' ? 'Light paper' : 'Dark paper' }}</b>
              <span class="mono">{{ p.css }} · {{ p.contrast }}:1</span>
            </figcaption>
          </figure>
        }
      </div>

      <p class="read mono" aria-live="polite">
        H {{ hsl().h }} · S {{ hsl().s }}% · L {{ hsl().l }}% <span aria-hidden="true">→</span><span class="sr-only">becomes</span> L {{ hsl().flipped }}%
        <span class="formula">l' = 0.08 + (1 - l) × 0.84</span>
      </p>
    </div>
  `,
  styles: `
    :host {
      display: block;
      min-width: 0;
    }
    .ink {
      padding: 0;
      overflow: hidden;
    }
    .pick {
      display: flex;
      flex-wrap: wrap;
      gap: 6px 22px;
      padding: 12px 14px;
      border-bottom: 1px solid var(--line);
    }
    .row {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .k {
      font-size: 11px;
      color: var(--muted);
    }
    .swatches {
      display: flex;
      flex-wrap: wrap;
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
    .any input {
      width: 44px;
      height: 40px;
      padding: 4px;
      border-radius: 999px;
      border: 1px solid var(--line);
      background: var(--surface-2);
      cursor: pointer;

      &:focus-visible {
        outline: 2px solid var(--focus);
        outline-offset: 2px;
      }
    }
    .hex {
      font-size: 12px;
      color: var(--ink-2);
    }
    .papers {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 12px;
      padding: 14px 14px 0;
    }
    .paper {
      margin: 0;

      svg {
        display: block;
        width: 100%;
        height: auto;
        border-radius: var(--r-inner);
        border: 1px solid var(--line);
      }
      figcaption {
        display: flex;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: 4px 8px;
        padding: 10px 4px 0;
        font-size: 14px;

        b {
          font-weight: 600;
        }
        span {
          font-size: 11.5px;
          color: var(--muted);
        }
      }
    }
    .read {
      margin: 0;
      padding: 14px;
      font-size: 12px;
      color: var(--ink-2);
      display: flex;
      flex-wrap: wrap;
      gap: 4px 10px;
    }
    .formula {
      color: var(--muted);
      margin-left: auto;
    }
    @media (max-width: 560px) {
      .papers {
        grid-template-columns: 1fr;
      }
      .formula {
        margin-left: 0;
      }
    }
  `,
})
export class ScrawlInkDemo {
  protected readonly strokes = STROKES;
  protected readonly tints = FILLS;
  protected readonly names = NAMES;
  protected readonly color = signal<string>(STROKES[1]);

  private readonly drawing = (() => {
    const els: El[] = [
      { id: 'a', type: 'rect', x: 24, y: 30, w: 86, h: 60, stroke: '#000', bg: '#000', fill: 'offset', width: 2, rough: 1, seed: seedFor(40) },
      { id: 'b', type: 'arrow', x: 120, y: 60, w: 0, h: 0, points: [[0, 0], [40, 0]], stroke: '#000', bg: 'transparent', fill: 'offset', width: 2, rough: 1, seed: seedFor(41) },
      { id: 'c', type: 'ellipse', x: 170, y: 26, w: 70, h: 70, stroke: '#000', bg: 'transparent', fill: 'offset', width: 2, rough: 1, seed: seedFor(42) },
      {
        id: 'd',
        type: 'draw',
        x: 30,
        y: 118,
        w: 0,
        h: 0,
        points: Array.from({ length: 30 }, (_, i): [number, number] => [i * 7, Math.sin(i * 0.7) * 5]),
        stroke: '#000',
        bg: 'transparent',
        fill: 'offset',
        width: 2,
        rough: 1,
        seed: seedFor(43),
      },
    ];
    const fills: string[] = [];
    const strokes: string[] = [];
    for (const el of els) {
      const d = build(el);
      // The pen is a filled outline; shape fills are tints. Both take the picked colour here.
      for (const f of d.fills) fills.push(f.d);
      for (const k of d.strokes) strokes.push(k.d);
    }
    return { fills, strokes };
  })();

  protected readonly hsl = computed(() => {
    const { h, s, l } = toHsl(this.color());
    return { h: Math.round(h), s: Math.round(s * 100), l: Math.round(l * 100), flipped: Math.round(flipL(l) * 100) };
  });

  protected readonly papers = computed(() => {
    const c = this.color();
    const { h, s, l } = toHsl(c);
    const dark = hslToRgb(h, Math.round(s * 100) / 100, Math.round(flipL(l) * 100) / 100);
    return [
      { key: 'light', bg: PAPER.light, dot: DOT.light, css: c, contrast: ratio(hexToRgb(c), hexToRgb(PAPER.light)).toFixed(1), ...this.drawing },
      { key: 'dark', bg: PAPER.dark, dot: DOT.dark, css: ink(c, true), contrast: ratio(dark, hexToRgb(PAPER.dark)).toFixed(1), ...this.drawing },
    ];
  });

  protected pick(e: Event): void {
    const v = (e.target as HTMLInputElement).value;
    if (/^#[0-9a-f]{6}$/i.test(v)) this.color.set(v.toLowerCase());
  }
}
