import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { BANDS } from './invest-demo';

/**
 * The Emlaak risk profile, redrawn as my own mockup. Same six questions, same points and the same bands as the
 * real app (the real one asks with picture cards, one per answer). The result sits on a riskometer like the
 * app's gauge, and the sample funds below it show which ones need the disclaimer for this band.
 */
interface Question {
  q: string;
  a: { t: string; p: number }[];
}

const QUESTIONS: Question[] = [
  {
    q: 'Your age',
    a: [
      { t: '18 to 30', p: 5 },
      { t: '31 to 40', p: 4 },
      { t: '41 to 50', p: 3 },
      { t: '51 to 60', p: 2 },
      { t: '61 or over', p: 1 },
    ],
  },
  {
    q: 'How well you know investing',
    a: [
      { t: 'Not at all', p: 0 },
      { t: 'A little', p: 1 },
      { t: 'Average', p: 2 },
      { t: 'Well', p: 3 },
      { t: 'Very well', p: 4 },
    ],
  },
  {
    q: 'Share of monthly income you save',
    a: [
      { t: 'Under 10%', p: 1 },
      { t: 'Up to 20%', p: 2 },
      { t: 'Up to 30%', p: 3 },
      { t: 'Up to 40%', p: 4 },
      { t: 'Up to 50%', p: 5 },
    ],
  },
  {
    q: 'How long you can stay invested',
    a: [
      { t: 'Under 6 months', p: 0 },
      { t: 'Up to 1 year', p: 1 },
      { t: 'Up to 2 years', p: 2 },
      { t: 'Up to 3 years', p: 3 },
      { t: 'Over 5 years', p: 4 },
    ],
  },
  {
    q: 'What the money is for',
    a: [
      { t: 'Keep it safe', p: 0 },
      { t: 'Income', p: 1 },
      { t: 'Income and growth', p: 2 },
      { t: 'Growth', p: 3 },
    ],
  },
  {
    q: 'How much risk you can take',
    a: [
      { t: 'Very little', p: 1 },
      { t: 'Low', p: 2 },
      { t: 'Medium', p: 3 },
      { t: 'High', p: 4 },
    ],
  },
];

/** Score ranges per band, lowest first. The top of the scale is 25. */
const RANGES: [number, number][] = [
  [0, 4],
  [5, 10],
  [11, 14],
  [15, 18],
  [19, 25],
];

const SAMPLE_FUNDS = [
  { name: 'Money Market', risk: 0 },
  { name: 'Islamic Income', risk: 1 },
  { name: 'Asset Allocation', risk: 3 },
  { name: 'Equity', risk: 4 },
];

// Starts at a Moderate profile: 4 + 1 + 2 + 2 + 2 + 3 = 14.
const START = [1, 1, 1, 2, 2, 2];

/** Gauge geometry: a half ring of five equal arcs, centre (110, 104), radius 84. */
const CX = 110;
const CY = 104;
const R = 84;
const point = (deg: number, r = R) => {
  const a = (Math.PI * (180 - deg)) / 180;
  return `${(CX + r * Math.cos(a)).toFixed(1)} ${(CY - r * Math.sin(a)).toFixed(1)}`;
};
const ARCS = BANDS.map((_, i) => `M ${point(i * 36 + 1.5)} A ${R} ${R} 0 0 1 ${point((i + 1) * 36 - 1.5)}`);

@Component({
  selector: 'mh-emlaak-risk',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="risk">
      <ol class="qs card" role="list">
        @for (q of questions; track q.q; let qi = $index) {
          <li>
            <p class="q" [id]="'em-q' + qi"><span class="mono">0{{ qi + 1 }}</span> {{ q.q }}</p>
            <div class="opts" role="group" [attr.aria-labelledby]="'em-q' + qi">
              @for (a of q.a; track a.t; let ai = $index) {
                <button type="button" class="chip" [attr.aria-pressed]="answers()[qi] === ai" (click)="answer(qi, ai)">
                  {{ a.t }}
                </button>
              }
            </div>
          </li>
        }
      </ol>

      <div class="res card card--lift">
        <p class="mono label">Riskometer</p>
        <svg viewBox="0 0 220 120" class="gauge" role="img" [attr.aria-label]="'Score ' + score() + ' of 25: ' + bands[band()] + ' risk'">
          @for (d of arcs; track $index) {
            <path [attr.d]="d" [class]="'arc a' + $index" [class.on]="$index === band()" />
          }
          <g class="needle" [style.transform]="'rotate(' + angle() + 'deg)'">
            <line [attr.x1]="cx" [attr.y1]="cy" [attr.x2]="cx - 66" [attr.y2]="cy" />
          </g>
          <circle [attr.cx]="cx" [attr.cy]="cy" r="7" class="hub" />
        </svg>
        <p class="band" aria-live="polite"><b>{{ bands[band()] }}</b> <span class="mono">{{ score() }} / 25</span></p>
        <ul class="fit" role="list">
          @for (f of funds; track f.name) {
            <li [class.over]="f.risk > band()">
              <span>{{ f.name }}</span>
              <span class="mono">{{ f.risk > band() ? 'Disclaimer' : 'Fits' }}</span>
            </li>
          }
        </ul>
        <p class="mono sample">Real questions and points, sample funds</p>
      </div>
    </div>
  `,
  styles: `
    :host {
      display: block;
    }
    .risk {
      display: grid;
      grid-template-columns: minmax(0, 1fr) 300px;
      gap: 16px;
      align-items: start;
    }
    .qs {
      display: grid;
      gap: 14px;
      padding: 20px 22px;

      li + li {
        padding-top: 14px;
        border-top: 1px solid var(--line);
      }
    }
    .q {
      font-size: 14px;
      font-weight: 600;
      margin-bottom: 8px;

      .mono {
        font-size: 12px;
        font-weight: 400;
        color: var(--e-blue);
        margin-right: 6px;
      }
    }
    .opts {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;

      .chip {
        min-height: 36px;
        font-size: 13px;
      }
      .chip[aria-pressed='true'] {
        background: var(--e-blue);
        border-color: var(--e-blue);
        color: #fff;
      }
    }
    .res {
      position: sticky;
      top: calc(var(--nav-h) + var(--nav-top) + 24px);
      padding: 18px 20px;
      text-align: center;
    }
    .label {
      font-size: 12px;
      color: var(--muted);
      text-align: left;
    }
    .gauge {
      display: block;
      width: 100%;
      max-width: 240px;
      margin: 6px auto 0;
    }
    .arc {
      fill: none;
      stroke-width: 18;
      opacity: 0.35;
      transition: opacity var(--t-base) var(--ease);

      &.on {
        opacity: 1;
      }
    }
    .a0 {
      stroke: var(--e-green);
    }
    .a1 {
      stroke: #8ccf6e;
    }
    .a2 {
      stroke: var(--e-blue);
    }
    .a3 {
      stroke: #e9a23b;
    }
    .a4 {
      stroke: var(--e-orange);
    }
    .needle {
      transform-origin: 110px 104px;
      transition: transform 0.6s var(--ease);

      line {
        stroke: var(--ink);
        stroke-width: 4;
        stroke-linecap: round;
      }
    }
    .hub {
      fill: var(--ink);
    }
    @media (prefers-reduced-motion: reduce) {
      .needle {
        transition: none;
      }
    }
    .band {
      margin-top: 4px;

      b {
        font-size: 20px;
        font-weight: 600;
        letter-spacing: -0.02em;
      }
      .mono {
        font-size: 12px;
        color: var(--muted);
        margin-left: 6px;
      }
    }
    .fit {
      display: grid;
      gap: 4px;
      margin-top: 14px;
      text-align: left;

      li {
        display: flex;
        justify-content: space-between;
        padding: 8px 12px;
        border-radius: 10px;
        background: var(--e-green-soft);
        font-size: 13px;

        .mono {
          font-size: 12px;
          color: var(--e-green-text);
        }
        &.over {
          background: var(--e-orange-soft);

          .mono {
            color: var(--e-orange-text);
          }
        }
      }
    }
    .sample {
      margin-top: 12px;
      font-size: 12px;
      color: var(--muted);
    }
    @media (max-width: 900px) {
      .risk {
        grid-template-columns: 1fr;
      }
      .res {
        position: static;
        order: -1;
      }
    }
  `,
})
export class EmlaakRiskDemo {
  protected readonly questions = QUESTIONS;
  protected readonly bands = BANDS;
  protected readonly arcs = ARCS;
  protected readonly funds = SAMPLE_FUNDS;
  protected readonly cx = CX;
  protected readonly cy = CY;
  protected readonly answers = signal<number[]>(START);

  protected readonly score = computed(() => this.answers().reduce((t, a, i) => t + QUESTIONS[i].a[a].p, 0));
  protected readonly band = computed(() => RANGES.findIndex(([, hi]) => this.score() <= hi));

  /** Needle: 0deg points left (lowest), 180deg right. It sits inside the band's arc, placed by the score. */
  protected readonly angle = computed(() => {
    const b = this.band();
    const [lo, hi] = RANGES[b];
    const frac = (this.score() - lo + 0.5) / (hi - lo + 1);
    return (b + frac) * 36;
  });

  protected answer(q: number, a: number): void {
    this.answers.update((list) => list.map((v, i) => (i === q ? a : v)));
  }
}
