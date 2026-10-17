import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { phosphorArrowCounterClockwise, phosphorCheckCircle, phosphorWarning } from '@ng-icons/phosphor-icons/regular';

/**
 * Hero mockup of the Emlaak invest panel (my own design, not a screenshot). It follows the real app's rules:
 * the catalogue filters by Shariah or conventional, the return calculator works over 6 months, 9 months or a
 * year, and a fund riskier than the investor's band shows a warning that needs a ticked disclaimer before the
 * request can go. A sent request starts at "In review", as on the real dashboard. Sample funds and rates; the
 * real figures come from the fund houses.
 */
type Filter = 'all' | 'shariah' | 'conventional';

interface Fund {
  id: string;
  name: string;
  cat: string;
  shariah: boolean;
  /** 0 Very Low .. 4 High, the app's five bands. */
  risk: number;
  /** Sample annual rate, percent. */
  rate: number;
}

export const BANDS = ['Very Low', 'Low', 'Moderate', 'Medium', 'High'] as const;

const FUNDS: Fund[] = [
  { id: 'imm', name: 'Islamic Money Market', cat: 'Money market', shariah: true, risk: 0, rate: 10.8 },
  { id: 'mm', name: 'Money Market', cat: 'Money market', shariah: false, risk: 0, rate: 11.4 },
  { id: 'ii', name: 'Islamic Income', cat: 'Income', shariah: true, risk: 1, rate: 11.9 },
  { id: 'aa', name: 'Asset Allocation', cat: 'Balanced', shariah: false, risk: 3, rate: 15.2 },
  { id: 'ie', name: 'Islamic Equity', cat: 'Equity', shariah: true, risk: 4, rate: 23.8 },
  { id: 'eq', name: 'Equity', cat: 'Equity', shariah: false, risk: 4, rate: 26.5 },
];

const PERIODS = [
  { months: 6, label: '6 months' },
  { months: 9, label: '9 months' },
  { months: 12, label: '1 year' },
];

/** The sample investor's band, as their risk profile left it. */
const MY_BAND = 2;
const MIN = 5_000;
const pkr = new Intl.NumberFormat('en-PK', { maximumFractionDigits: 0 });

@Component({
  selector: 'mh-emlaak-invest',
  imports: [NgIcon],
  viewProviders: [provideIcons({ phosphorArrowCounterClockwise, phosphorCheckCircle, phosphorWarning })],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="inv card card--lift">
      <header class="inv-head">
        <img src="/images/emlaak/emlaak-mark.webp" width="42" height="23" alt="" />
        <div>
          <h2>Invest</h2>
          <p>Your risk band: <b>{{ bands[myBand] }}</b></p>
        </div>
        <button type="button" class="reset" aria-label="Reset the sample investment" (click)="reset()">
          <ng-icon name="phosphorArrowCounterClockwise" aria-hidden="true" />
        </button>
      </header>

      <div class="seg filter" role="group" aria-label="Fund type">
        @for (f of filters; track f.id) {
          <button type="button" [attr.aria-pressed]="filter() === f.id" (click)="setFilter(f.id)">{{ f.label }}</button>
        }
      </div>

      <ul class="funds" role="list" aria-label="Sample funds">
        @for (f of shown(); track f.id) {
          <li>
            <button
              type="button"
              class="fund"
              [attr.aria-pressed]="fund().id === f.id"
              [attr.aria-label]="f.name + ', ' + f.cat + (f.shariah ? ', Shariah' : '') + ', ' + bands[f.risk] + ' risk, ' + f.rate.toFixed(1) + '% a year'"
              (click)="pick(f)"
            >
              <span class="fund-txt">
                <b>{{ f.name }}</b>
                <span>{{ f.cat }}{{ f.shariah ? ', Shariah' : '' }}</span>
              </span>
              <span class="risk" [attr.data-r]="f.risk">{{ bands[f.risk] }}</span>
              <span class="rate mono">{{ f.rate.toFixed(1) }}%</span>
            </button>
          </li>
        }
      </ul>

      <div class="calc">
        <div class="field amt">
          <label for="em-amt">Amount, PKR</label>
          <input
            id="em-amt"
            class="input mono"
            inputmode="numeric"
            autocomplete="off"
            [value]="amountText()"
            (input)="onAmount($any($event.target))"
            [attr.aria-describedby]="amount() < min ? 'em-amt-err' : null"
          />
        </div>
        <div class="field">
          <span class="field__label" id="em-per">Period</span>
          <div class="seg" role="group" aria-labelledby="em-per">
            @for (p of periods; track p.months) {
              <button type="button" [attr.aria-pressed]="months() === p.months" (click)="months.set(p.months)">{{ p.label }}</button>
            }
          </div>
        </div>
      </div>
      @if (amount() < min) {
        <p class="err" id="em-amt-err">The minimum is Rs {{ fmt(min) }}.</p>
      }

      <dl class="out">
        <div><dt>Total</dt><dd class="mono">Rs {{ fmt(total()) }}</dd></div>
        <div><dt>Profit</dt><dd class="mono up">+Rs {{ fmt(profit()) }}</dd></div>
        <div><dt>Return</dt><dd class="mono">{{ ret().toFixed(2) }}%</dd></div>
      </dl>

      @if (riskier()) {
        <div class="warn">
          <ng-icon name="phosphorWarning" aria-hidden="true" />
          <div>
            <p>{{ fund().name }} is <b>{{ bands[fund().risk] }}</b> risk, above your {{ bands[myBand] }} band.</p>
            <label class="check">
              <input type="checkbox" [checked]="agreed()" (change)="agreed.set($any($event.target).checked)" />
              <span>I understand the risk and want to go ahead.</span>
            </label>
          </div>
        </div>
      }

      <footer class="inv-foot">
        @if (sent()) {
          <p class="sent" aria-live="polite">
            <ng-icon name="phosphorCheckCircle" aria-hidden="true" /> Sent. Status: <b>In review</b>
          </p>
        } @else {
          <button type="button" class="btn btn-solid" [disabled]="!canSend()" (click)="sent.set(true)">
            Invest Rs {{ fmt(amount()) }}
          </button>
        }
        <span class="mono sample">Sample funds and rates</span>
      </footer>
    </div>
  `,
  styles: `
    :host {
      display: block;
    }
    .inv {
      padding: 18px;
    }
    .inv-head {
      display: flex;
      align-items: center;
      gap: 12px;
      padding-bottom: 12px;
      margin-bottom: 12px;
      border-bottom: 1px solid var(--line);

      h2 {
        font-size: 16px;
      }
      p {
        font-size: 12.5px;
        color: var(--muted);
      }
      b {
        color: var(--e-blue);
        font-weight: 600;
      }
      div {
        flex: 1;
      }
    }
    .reset {
      width: 44px;
      height: 44px;
      display: grid;
      place-items: center;
      border-radius: 999px;
      border: 1px solid var(--line);
      color: var(--ink-2);
      font-size: 17px;
      transition: background var(--t-fast) var(--ease);

      &:hover {
        background: var(--surface-2);
      }
    }
    .filter {
      margin-bottom: 10px;

      button {
        height: 30px;
        font-size: 13px;
      }
    }
    .funds {
      display: grid;
      gap: 4px;
    }
    .fund {
      width: 100%;
      display: flex;
      align-items: center;
      gap: 10px;
      min-height: 44px;
      padding: 4px 12px;
      border-radius: var(--r-inner);
      border: 1px solid transparent;
      text-align: left;
      transition:
        background var(--t-fast) var(--ease),
        border-color var(--t-fast) var(--ease);

      &:hover {
        background: var(--e-blue-tint);
      }
      &[aria-pressed='true'] {
        background: var(--e-blue-tint);
        border-color: var(--e-blue);
      }
    }
    .fund-txt {
      flex: 1;
      min-width: 0;

      b {
        font-size: 13.5px;
        font-weight: 600;
      }
      span {
        font-size: 12px;
        color: var(--muted);
        margin-left: 6px;
      }
    }
    .risk {
      font-size: 12px;
      font-weight: 500;
      padding: 2px 8px;
      border-radius: 999px;
      white-space: nowrap;
      background: var(--e-green-soft);
      color: var(--e-green-text);

      &[data-r='2'],
      &[data-r='3'] {
        background: var(--e-blue-soft);
        color: var(--e-blue);
      }
      &[data-r='4'] {
        background: var(--e-orange-soft);
        color: var(--e-orange-text);
      }
    }
    .rate {
      width: 46px;
      text-align: right;
      font-size: 12.5px;
      color: var(--ink);
    }
    .calc {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      gap: 12px;
      align-items: end;
      margin-top: 12px;
      padding-top: 12px;
      border-top: 1px solid var(--line);

      .seg button {
        height: 36px;
        padding: 0 11px;
        font-size: 13px;
      }
    }
    .err {
      margin-top: 6px;
      font-size: 12.5px;
      color: var(--e-orange-text);
    }
    .out {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 8px;
      margin: 12px 0 0;

      div {
        padding: 8px 12px;
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
    .warn {
      display: flex;
      gap: 10px;
      margin-top: 12px;
      padding: 12px 14px;
      border-radius: var(--r-inner);
      background: var(--e-orange-soft);
      color: var(--ink);
      font-size: 13px;

      > ng-icon {
        flex-shrink: 0;
        font-size: 18px;
        color: var(--e-orange-text);
        margin-top: 1px;
      }
      .check {
        margin-top: 8px;
        font-size: 13px;
        color: var(--ink);
        min-height: 24px;

        input {
          accent-color: var(--e-blue);
          margin-top: 1px;
        }
      }
    }
    .inv-foot {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      margin-top: 12px;

      .btn[disabled] {
        opacity: 0.45;
        cursor: not-allowed;
      }
    }
    .sent {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      min-height: 46px;
      font-size: 14px;
      color: var(--ink-2);

      ng-icon {
        font-size: 19px;
        color: var(--e-green-text);
      }
    }
    .sample {
      font-size: 12px;
      color: var(--muted);
      text-align: right;
    }
    @media (prefers-reduced-motion: no-preference) {
      .warn,
      .sent {
        animation: in 0.35s var(--ease) both;
      }
    }
    @keyframes in {
      from {
        opacity: 0;
        transform: translateY(-4px);
      }
    }
    @media (max-width: 460px) {
      .inv {
        padding: 14px;
      }
      .calc {
        grid-template-columns: 1fr;
      }
      .fund-txt span {
        display: none;
      }
      .out dd {
        font-size: 12.5px;
      }
    }
  `,
})
export class EmlaakInvestDemo {
  protected readonly bands = BANDS;
  protected readonly myBand = MY_BAND;
  protected readonly min = MIN;
  protected readonly periods = PERIODS;
  protected readonly filters: { id: Filter; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'shariah', label: 'Shariah' },
    { id: 'conventional', label: 'Conventional' },
  ];

  protected readonly filter = signal<Filter>('all');
  protected readonly fund = signal<Fund>(FUNDS[3]);
  protected readonly amount = signal(250_000);
  protected readonly months = signal(12);
  protected readonly agreed = signal(false);
  protected readonly sent = signal(false);

  protected readonly shown = computed(() => {
    const f = this.filter();
    return FUNDS.filter((x) => f === 'all' || (f === 'shariah') === x.shariah);
  });

  protected readonly amountText = computed(() => pkr.format(this.amount()));
  protected readonly profit = computed(() => Math.round((this.amount() * this.fund().rate * this.months()) / 1200));
  protected readonly total = computed(() => this.amount() + this.profit());
  protected readonly ret = computed(() => (this.amount() ? (this.profit() / this.amount()) * 100 : 0));
  protected readonly riskier = computed(() => this.fund().risk > MY_BAND);
  protected readonly canSend = computed(() => this.amount() >= MIN && (!this.riskier() || this.agreed()));

  protected fmt(n: number): string {
    return pkr.format(n);
  }

  protected setFilter(f: Filter): void {
    this.filter.set(f);
    const list = this.shown();
    if (!list.some((x) => x.id === this.fund().id)) this.pick(list[0]);
  }

  protected pick(f: Fund): void {
    this.fund.set(f);
    this.agreed.set(false);
    this.sent.set(false);
  }

  /** Digits only, capped at 10 million, reformatted with separators as you type. */
  protected onAmount(el: HTMLInputElement): void {
    const n = Math.min(Number(el.value.replace(/\D/g, '') || 0), 10_000_000);
    this.amount.set(n);
    this.sent.set(false);
    el.value = pkr.format(n);
  }

  protected reset(): void {
    this.filter.set('all');
    this.fund.set(FUNDS[3]);
    this.amount.set(250_000);
    this.months.set(12);
    this.agreed.set(false);
    this.sent.set(false);
  }
}
