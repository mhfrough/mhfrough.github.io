import { ChangeDetectionStrategy, Component, input, signal } from '@angular/core';

/** The copy this section needs, passed in from finclore.copy.ts (COPY.logo). */
export interface MarkCopy {
  readonly show: string;
  readonly ground: string;
  readonly figTitle: string;
  readonly rules: readonly { readonly k: string; readonly v: string }[];
  readonly layers: readonly { readonly id: string; readonly label: string }[];
  readonly onLight: string;
  readonly onDark: string;
  readonly sizes: string;
  readonly sizesNote: string;
}

type Layer = 'grid' | 'measure';
type Ground = 'light' | 'dark';

const GRID = Array.from({ length: 31 }, (_, i) => (i + 1) * 4).filter((v) => v % 16 !== 0);
const MAJOR = [16, 32, 48, 64, 80, 96, 112];

/**
 * The Finclore logo section: the F. monogram redrawn on the favicon's 128 unit grid with switchable construction
 * layers, the wordmark on the light header and the dark footer exactly as shipped, and the favicon's own 16, 32 and
 * 48 px sizes drawn from the vector mark at actual size, so they stay sharp on any screen. The geometry was measured from the original favicon.ico.
 */
@Component({
  selector: 'mh-finclore-mark',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="build card">
      <div class="fig">
        <div class="ctrls">
          <div class="chips" role="group" [attr.aria-label]="c().show">
            @for (l of c().layers; track l.id) {
              <button type="button" class="chip" [attr.aria-pressed]="on(l.id)" (click)="toggle(l.id)">{{ l.label }}</button>
            }
          </div>
          <div class="seg" role="group" [attr.aria-label]="c().ground">
            <button type="button" [attr.aria-pressed]="ground() === 'light'" (click)="ground.set('light')">Light</button>
            <button type="button" [attr.aria-pressed]="ground() === 'dark'" (click)="ground.set('dark')">Dark</button>
          </div>
        </div>
        <svg class="mk" [class.dark]="ground() === 'dark'" viewBox="0 0 128 128" role="img" aria-labelledby="fm-geo">
          <title id="fm-geo">{{ c().figTitle }}</title>
          <defs>
            <clipPath id="fm-tile"><rect x="0.5" y="0.5" width="127" height="127" rx="32" /></clipPath>
          </defs>
          <rect class="tile" x="0.5" y="0.5" width="127" height="127" rx="32" />
          @if (layers().grid) {
            <g class="g-fine" clip-path="url(#fm-tile)">
              @for (v of grid; track v) {
                <line [attr.x1]="v" y1="0" [attr.x2]="v" y2="128" />
                <line x1="0" [attr.y1]="v" x2="128" [attr.y2]="v" />
              }
            </g>
            <g class="g-major" clip-path="url(#fm-tile)">
              @for (v of major; track v) {
                <line [attr.x1]="v" y1="0" [attr.x2]="v" y2="128" />
                <line x1="0" [attr.y1]="v" x2="128" [attr.y2]="v" />
              }
            </g>
          }
          <path class="f" d="M34 28H76V42H50V58H74V70H50V100H34Z" />
          <circle class="dot" cx="85" cy="91" r="9" />
          @if (layers().measure) {
            <g class="g-guide">
              <line x1="8" y1="100" x2="120" y2="100" />
              <line x1="8" y1="28" x2="120" y2="28" />
              <line class="key" x1="76" y1="16" x2="76" y2="104" />
            </g>
            <g class="g-dim">
              <path d="M34 108V112M50 108V112M34 110H50" />
              <path d="M24 28H28M24 42H28M26 28V42" />
              <path d="M24 58H28M24 70H28M26 58V70" />
              <path d="M76 80V76M94 80V76M76 78H94" />
            </g>
            <g class="g-txt">
              <text x="42" y="118" text-anchor="middle">16</text>
              <text x="21" y="37" text-anchor="end">14</text>
              <text x="21" y="66" text-anchor="end">12</text>
              <text x="85" y="73" text-anchor="middle">18</text>
              <text x="120" y="97" text-anchor="end">baseline</text>
              <text x="120" y="25" text-anchor="end">cap</text>
              <text x="74" y="22" text-anchor="end">arm end = dot start</text>
            </g>
          }
        </svg>
      </div>
      <dl class="rules">
        @for (r of c().rules; track r.k) {
          <div>
            <dt>{{ r.k }}</dt>
            <dd>{{ r.v }}</dd>
          </div>
        }
      </dl>
    </div>

    <div class="uses">
      <figure class="card wm">
        <div class="wm-ground">
          <img src="/images/finclore/finclore-wordmark.webp" width="433" height="88" alt="The Finclore wordmark in navy with a red full stop" loading="lazy" decoding="async" />
        </div>
        <figcaption>{{ c().onLight }}</figcaption>
      </figure>
      <figure class="card wm">
        <div class="wm-ground night">
          <img src="/images/finclore/finclore-wordmark-light.webp" width="433" height="88" alt="The Finclore wordmark in light grey on a dark ground" loading="lazy" decoding="async" />
        </div>
        <figcaption>{{ c().onDark }}</figcaption>
      </figure>
      <figure class="card sizes">
        <ul role="list">
          @for (s of sizes; track s) {
            <li>
              <span class="px">
                <img src="/images/finclore/finclore-mark.svg" [width]="s" [height]="s" [alt]="'The F. mark at ' + s + ' pixels'" loading="lazy" decoding="async" />
              </span>
              <span class="mono">{{ s }} px</span>
            </li>
          }
        </ul>
        <figcaption>
          <b>{{ c().sizes }}</b>
          <span>{{ c().sizesNote }}</span>
        </figcaption>
      </figure>
    </div>
  `,
  styles: `
    :host {
      display: grid;
      gap: 16px;
    }
    .build {
      display: grid;
      grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
      gap: 32px;
      align-items: center;
      padding: 22px;
    }
    .fig {
      display: grid;
      gap: 14px;
      justify-items: center;
    }
    .ctrls {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 10px;
      width: 100%;

      .chips {
        display: flex;
        gap: 6px;
      }
      .seg button {
        height: 32px;
        padding: 0 14px;
        font-size: 13px;
      }
    }
    .mk {
      width: 100%;
      max-width: 400px;
      height: auto;
      overflow: visible;

      .tile {
        fill: var(--surface);
        stroke: var(--line);
        stroke-width: 1;
        transition: fill var(--t-base) var(--ease);
      }
      .f {
        fill: var(--f-navy);
        transition: fill var(--t-base) var(--ease);
      }
      .dot {
        fill: var(--f-red);
        transition: fill var(--t-base) var(--ease);
      }
      .g-fine line {
        stroke: var(--line);
        stroke-width: 0.25;
      }
      .g-major line {
        stroke: var(--line-strong);
        stroke-width: 0.4;
      }
      .g-guide line {
        stroke: var(--muted);
        stroke-width: 0.35;
        stroke-dasharray: 1.5 1.5;

        &.key {
          stroke: var(--f-red);
          stroke-width: 0.5;
        }
      }
      .g-dim path {
        fill: none;
        stroke: var(--ink-2);
        stroke-width: 0.5;
      }
      .g-txt text {
        font-family: var(--font-mono);
        font-size: 4.4px;
        fill: var(--ink-2);
      }

      &.dark {
        .tile {
          fill: var(--f-night);
          stroke: var(--f-night);
        }
        .f,
        .dot {
          fill: var(--f-footer-ink);
        }
        .g-fine line {
          stroke: var(--f-night-line);
        }
        .g-major line {
          stroke: var(--f-night-line-strong);
        }
        .g-guide line {
          stroke: var(--n-muted);
        }
        .g-dim path {
          stroke: var(--n-ink);
        }
        .g-txt text {
          fill: var(--n-ink);
        }
      }
    }
    .rules {
      display: grid;
      gap: 0;
      margin: 0;

      div {
        padding: 14px 0;
        border-top: 1px solid var(--line);
      }
      div:first-child {
        border-top: 0;
        padding-top: 0;
      }
      dt {
        font-size: 12px;
        font-family: var(--font-mono);
        color: var(--f-red);
      }
      dd {
        margin: 4px 0 0;
        font-size: 14.5px;
        color: var(--ink-2);
      }
    }
    .uses {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 16px;
    }
    figure {
      margin: 0;
    }
    .wm {
      display: grid;
      gap: 0;
      padding: 10px;
    }
    .wm-ground {
      display: grid;
      place-items: center;
      min-height: 150px;
      padding: 24px;
      border-radius: var(--r-inner);
      background: var(--surface-2);

      &.night {
        background: var(--f-night);
      }
      img {
        width: min(100%, 216px);
        height: auto;
      }
    }
    figcaption {
      padding: 10px 6px 2px;
      font-size: 13px;
      font-weight: 500;
      color: var(--ink-2);
    }
    .sizes {
      display: grid;
      align-content: space-between;
      gap: 10px;
      padding: 16px;

      ul {
        display: flex;
        align-items: end;
        justify-content: space-around;
        gap: 10px;
        min-height: 124px;
      }
      li {
        display: grid;
        justify-items: center;
        gap: 6px;
      }
      .px {
        display: grid;
        place-items: center;
        width: 72px;
        height: 72px;
        border-radius: var(--r-inner);
        box-shadow: 0 0 0 1px var(--line);
        background: #fff;
      }
      .mono {
        font-size: 12px;
        color: var(--muted);
      }
      figcaption {
        display: grid;
        gap: 2px;
        padding: 0;

        span {
          font-weight: 400;
          font-size: 12.5px;
          color: var(--muted);
        }
      }
    }
    @media (max-width: 900px) {
      .build {
        grid-template-columns: 1fr;
        gap: 22px;
      }
      .uses {
        grid-template-columns: 1fr;
      }
    }
    @media (max-width: 420px) {
      .build {
        padding: 16px;
      }
      .sizes .px {
        width: 60px;
        height: 60px;
      }
    }
  `,
})
export class FincloreMark {
  readonly c = input.required<MarkCopy>();
  protected readonly grid = GRID;
  protected readonly major = MAJOR;
  protected readonly sizes = [16, 32, 48];
  protected readonly layers = signal<Record<Layer, boolean>>({ grid: true, measure: true });
  protected readonly ground = signal<Ground>('light');

  protected on(id: string): boolean {
    return this.layers()[id as Layer];
  }

  protected toggle(id: string): void {
    const key = id as Layer;
    this.layers.update((l) => ({ ...l, [key]: !l[key] }));
  }
}
