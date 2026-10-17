import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';

/**
 * The Emlaak portfolio page, redrawn as my own mockup: the four headline figures, the value graph, the
 * category and fund-house breakdowns, and the request status list (In review, Sent to fund house, Complete),
 * the same pieces as the real dashboard. Sample figures; fund houses are lettered, never named.
 */
type View = 'category' | 'house';

const MONTHS = ['Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'];
// Portfolio value in thousands of rupees, month end. Deposits in Jan and May, a redemption in Aug.
const VALUE = [400, 405, 512, 519, 527, 534, 645, 654, 663, 621, 630, 639];
const INVESTED = 600_000;
const WITHDRAWN = 50_000;

const SPLITS: Record<View, { t: string; v: number }[]> = {
  category: [
    { t: 'Money market', v: 38 },
    { t: 'Income', v: 27 },
    { t: 'Balanced', v: 21 },
    { t: 'Equity', v: 14 },
  ],
  house: [
    { t: 'Fund house A', v: 46 },
    { t: 'Fund house B', v: 33 },
    { t: 'Fund house C', v: 21 },
  ],
};

const REQUESTS = [
  { t: 'Invest, Islamic Income', amt: 75_000, st: 0 },
  { t: 'Convert to Asset Allocation', amt: 40_000, st: 1 },
  { t: 'Redeem, Money Market', amt: 50_000, st: 2 },
];
const STATUS = ['In review', 'Sent to fund house', 'Complete'];

// Chart box 0..440 x 0..120 (about its rendered size, so labels stay at their font size), values scaled
// between 360k and 680k.
const W = 440;
const H = 120;
const LO = 360;
const HI = 680;
const xy = (v: number, i: number) => [(i / (VALUE.length - 1)) * W, H - ((v - LO) / (HI - LO)) * H] as const;
const LINE = VALUE.map((v, i) => xy(v, i).map((n) => n.toFixed(1)).join(' ')).join(' L ');
const pkr = new Intl.NumberFormat('en-PK', { maximumFractionDigits: 0 });

@Component({
  selector: 'mh-emlaak-portfolio',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="pf card card--lift">
      <dl class="heads">
        <div><dt>Portfolio value</dt><dd class="mono">Rs {{ fmt(value) }}</dd></div>
        <div><dt>Investment</dt><dd class="mono">Rs {{ fmt(invested) }}</dd></div>
        <div><dt>Gross profit</dt><dd class="mono up">+Rs {{ fmt(profit) }}</dd></div>
        <div><dt>Withdrawn</dt><dd class="mono">Rs {{ fmt(withdrawn) }}</dd></div>
      </dl>

      <figure class="chart">
        <svg [attr.viewBox]="'-4 -6 ' + (w + 8) + ' ' + (h + 26)" role="img" aria-label="Portfolio value over twelve months, from Rs 400,000 to Rs 639,000, with deposits in January and May and a redemption in August.">
          <defs>
            <linearGradient id="em-fill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stop-color="var(--e-blue)" stop-opacity="0.18" />
              <stop offset="1" stop-color="var(--e-blue)" stop-opacity="0" />
            </linearGradient>
          </defs>
          @for (g of grid; track g) {
            <line class="grid" x1="0" [attr.x2]="w" [attr.y1]="g" [attr.y2]="g" />
          }
          <path [attr.d]="area" fill="url(#em-fill)" />
          <path [attr.d]="line" class="line" />
          @for (m of months; track m; let i = $index) {
            @if (i % 2 === 0) {
              <text [attr.x]="(i / 11) * w" [attr.y]="h + 17" class="mono">{{ m }}</text>
            }
          }
        </svg>
      </figure>

      <div class="lower">
        <div>
          <div class="seg" role="group" aria-label="Breakdown">
            <button type="button" [attr.aria-pressed]="view() === 'category'" (click)="view.set('category')">Category</button>
            <button type="button" [attr.aria-pressed]="view() === 'house'" (click)="view.set('house')">Fund house</button>
          </div>
          <ul class="bars" role="list">
            @for (s of split(); track s.t) {
              <li>
                <span class="bt">{{ s.t }}</span>
                <span class="track" aria-hidden="true"><i [style.width.%]="s.v"></i></span>
                <span class="mono pc">{{ s.v }}%</span>
              </li>
            }
          </ul>
        </div>
        <div>
          <p class="mono label">Requests</p>
          <ul class="reqs" role="list">
            @for (r of requests; track r.t) {
              <li>
                <div>
                  <b>{{ r.t }}</b>
                  <span class="mono">Rs {{ fmt(r.amt) }}</span>
                </div>
                <span class="st" [attr.data-st]="r.st">{{ status[r.st] }}</span>
              </li>
            }
          </ul>
        </div>
      </div>
      <p class="mono sample">Sample figures</p>
    </div>
  `,
  styles: `
    :host {
      display: block;
    }
    .pf {
      padding: 20px 22px;
    }
    .heads {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 8px;
      margin: 0;

      div {
        padding: 10px 12px;
        border-radius: var(--r-inner);
        background: var(--surface-2);
      }
      dt {
        font-size: 12px;
        color: var(--muted);
      }
      dd {
        margin: 2px 0 0;
        font-size: 14px;
        font-weight: 600;
      }
      .up {
        color: var(--e-green-text);
      }
    }
    .chart {
      margin: 16px 0 6px;

      svg {
        display: block;
        width: 100%;
        height: auto;
        overflow: visible;
      }
      .grid {
        stroke: var(--line);
        stroke-width: 1;
      }
      .line {
        fill: none;
        stroke: var(--e-blue);
        stroke-width: 2.25;
        stroke-linejoin: round;
      }
      text {
        font-size: 12px;
        fill: var(--muted);
        text-anchor: middle;
      }
    }
    .lower {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 22px;
      padding-top: 14px;
      border-top: 1px solid var(--line);

      .seg button {
        height: 30px;
        font-size: 13px;
      }
    }
    .bars {
      display: grid;
      gap: 8px;
      margin-top: 12px;

      li {
        display: grid;
        grid-template-columns: 96px minmax(0, 1fr) 36px;
        align-items: center;
        gap: 10px;
        font-size: 13px;
      }
      .track {
        height: 8px;
        border-radius: 999px;
        background: var(--surface-2);
        overflow: hidden;
      }
      i {
        display: block;
        height: 100%;
        border-radius: 999px;
        background: linear-gradient(90deg, var(--e-green), var(--e-blue));
        transition: width 0.5s var(--ease);
      }
      .pc {
        font-size: 12px;
        text-align: right;
        color: var(--ink-2);
      }
    }
    .label {
      font-size: 12px;
      color: var(--muted);
      min-height: 30px;
      display: flex;
      align-items: center;
    }
    .reqs {
      display: grid;
      gap: 6px;
      margin-top: 12px;

      li {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
      }
      b {
        display: block;
        font-size: 13px;
        font-weight: 600;
      }
      .mono {
        font-size: 12px;
        color: var(--muted);
      }
    }
    .st {
      font-size: 12px;
      font-weight: 500;
      padding: 2px 9px;
      border-radius: 999px;
      white-space: nowrap;
      background: var(--e-orange-soft);
      color: var(--e-orange-text);

      &[data-st='1'] {
        background: var(--e-blue-soft);
        color: var(--e-blue);
      }
      &[data-st='2'] {
        background: var(--e-green-soft);
        color: var(--e-green-text);
      }
    }
    .sample {
      margin-top: 14px;
      font-size: 12px;
      color: var(--muted);
    }
    @media (prefers-reduced-motion: reduce) {
      .bars i {
        transition: none;
      }
    }
    @media (max-width: 640px) {
      .pf {
        padding: 16px;
      }
      .heads {
        grid-template-columns: 1fr 1fr;
      }
      .lower {
        grid-template-columns: 1fr;
      }
    }
  `,
})
export class EmlaakPortfolioDemo {
  protected readonly view = signal<View>('category');
  protected readonly split = computed(() => SPLITS[this.view()]);
  protected readonly months = MONTHS;
  protected readonly requests = REQUESTS;
  protected readonly status = STATUS;
  protected readonly w = W;
  protected readonly h = H;
  protected readonly grid = [0, H / 2, H];
  protected readonly line = 'M ' + LINE;
  protected readonly area = `M 0 ${H} L ${LINE} L ${W} ${H} Z`;
  protected readonly value = VALUE[VALUE.length - 1] * 1000;
  protected readonly invested = INVESTED;
  protected readonly withdrawn = WITHDRAWN;
  /** Value plus what came out, minus what went in. */
  protected readonly profit = this.value + WITHDRAWN - INVESTED;

  protected fmt(n: number): string {
    return pkr.format(n);
  }
}
