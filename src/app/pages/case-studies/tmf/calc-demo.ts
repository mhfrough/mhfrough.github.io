import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { phosphorArrowCounterClockwise, phosphorWarningCircle } from '@ng-icons/phosphor-icons/regular';

/**
 * The loan calculator, redrawn as my own mockup. It keeps the real screen's chain of choices: a product brings
 * its repayment types, its due-date window and its fees; a repayment type brings its tenure bands; a band sets
 * the allowed tenure, the amount range and the markup rate. Fees are taken from the cheque, so the borrower
 * receives the amount less the fees. The real app asks the server for the schedule; this one works it out in the
 * page with equal instalments and markup on the falling balance. Products, rates, fees and dates are samples.
 */
interface Band {
  id: string;
  label: string;
  minT: number;
  maxT: number;
  minA: number;
  maxA: number;
  /** Sample yearly markup, percent. */
  rate: number;
}

interface Repay {
  id: string;
  name: string;
  /** Months between instalments. */
  every: number;
  bands: Band[];
}

interface Fee {
  id: string;
  name: string;
  amount: number;
}

interface Product {
  id: string;
  name: string;
  dueFrom: number;
  dueTo: number;
  fees: Fee[];
  repay: Repay[];
}

const FEES: Fee[] = [
  { id: 'proc', name: 'Processing fee', amount: 500 },
  { id: 'ins', name: 'Insurance fee', amount: 300 },
];

const PRODUCTS: Product[] = [
  {
    id: 'agri',
    name: 'Agriculture',
    dueFrom: 1,
    dueTo: 10,
    fees: FEES,
    repay: [
      {
        id: 'm',
        name: 'Monthly',
        every: 1,
        bands: [
          { id: 'a1', label: '6 to 12 months', minT: 6, maxT: 12, minA: 20_000, maxA: 100_000, rate: 26 },
          { id: 'a2', label: '13 to 24 months', minT: 13, maxT: 24, minA: 50_000, maxA: 200_000, rate: 28 },
        ],
      },
      {
        id: 'h',
        name: 'Six-monthly',
        every: 6,
        bands: [{ id: 'a3', label: '6 to 18 months', minT: 6, maxT: 18, minA: 20_000, maxA: 150_000, rate: 24 }],
      },
    ],
  },
  {
    id: 'live',
    name: 'Livestock',
    dueFrom: 5,
    dueTo: 15,
    fees: FEES,
    repay: [
      {
        id: 'm',
        name: 'Monthly',
        every: 1,
        bands: [{ id: 'l1', label: '6 to 18 months', minT: 6, maxT: 18, minA: 30_000, maxA: 150_000, rate: 27 }],
      },
    ],
  },
  {
    id: 'ent',
    name: 'Small enterprise',
    dueFrom: 1,
    dueTo: 5,
    fees: [FEES[0]],
    repay: [
      {
        id: 'm',
        name: 'Monthly',
        every: 1,
        bands: [{ id: 'e1', label: '12 to 36 months', minT: 12, maxT: 36, minA: 50_000, maxA: 500_000, rate: 29 }],
      },
    ],
  },
];

/** Sample cheque date, fixed so the server render and the browser agree. */
const CHEQUE = { y: 2024, m: 1 }; // February 2024 (month index)
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

interface Row {
  no: number;
  date: string;
  pay: number;
  markup: number;
  principal: number;
  balance: number;
}

const pkr = new Intl.NumberFormat('en-PK', { maximumFractionDigits: 0 });
const digits = (v: string): number => Number(v.replace(/[^0-9]/g, '') || 0);

@Component({
  selector: 'mh-tmf-calc',
  imports: [NgIcon],
  viewProviders: [provideIcons({ phosphorArrowCounterClockwise, phosphorWarningCircle })],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="calc card card--lift">
      <form class="form" (submit)="$event.preventDefault()" aria-label="Loan calculator">
        <div class="field">
          <label for="tc-prod">Product</label>
          <select id="tc-prod" class="select" [value]="product().id" (change)="setProduct($any($event.target).value)">
            @for (p of products; track p.id) {
              <option [value]="p.id">{{ p.name }}</option>
            }
          </select>
        </div>

        <div class="field">
          <span class="field__label" id="tc-rep">Repayment type</span>
          <div class="seg" role="group" aria-labelledby="tc-rep">
            @for (r of product().repay; track r.id) {
              <button type="button" [attr.aria-pressed]="repay().id === r.id" (click)="setRepay(r)">{{ r.name }}</button>
            }
          </div>
        </div>

        <div class="field">
          <label for="tc-band">Tenure band</label>
          <select id="tc-band" class="select" [value]="band().id" (change)="setBand($any($event.target).value)">
            @for (b of repay().bands; track b.id) {
              <option [value]="b.id">{{ b.label }}</option>
            }
          </select>
          <span class="field__hint">Markup <b class="mono">{{ band().rate }}%</b> a year</span>
        </div>

        <div class="two">
          <div class="field">
            <label for="tc-ten">Tenure, months</label>
            <input
              id="tc-ten"
              class="input mono"
              inputmode="numeric"
              autocomplete="off"
              [value]="tenure()"
              (input)="tenure.set(num($any($event.target)))"
              [attr.aria-invalid]="!!tenureErr()"
              [attr.aria-describedby]="tenureErr() ? 'tc-ten-e' : 'tc-ten-h'"
            />
            @if (tenureErr(); as e) {
              <span class="field__error" id="tc-ten-e"><ng-icon name="phosphorWarningCircle" aria-hidden="true" /> {{ e }}</span>
            } @else {
              <span class="field__hint" id="tc-ten-h">{{ band().minT }} to {{ band().maxT }}</span>
            }
          </div>
          <div class="field">
            <label for="tc-due">Due-date day</label>
            <input
              id="tc-due"
              class="input mono"
              inputmode="numeric"
              autocomplete="off"
              [value]="due()"
              (input)="due.set(num($any($event.target)))"
              [attr.aria-invalid]="!!dueErr()"
              [attr.aria-describedby]="dueErr() ? 'tc-due-e' : 'tc-due-h'"
            />
            @if (dueErr(); as e) {
              <span class="field__error" id="tc-due-e"><ng-icon name="phosphorWarningCircle" aria-hidden="true" /> {{ e }}</span>
            } @else {
              <span class="field__hint" id="tc-due-h">{{ product().dueFrom }} to {{ product().dueTo }} of the month</span>
            }
          </div>
        </div>

        <div class="field">
          <label for="tc-amt">Amount, Rs</label>
          <input
            id="tc-amt"
            class="input mono"
            inputmode="numeric"
            autocomplete="off"
            [value]="fmt(amount())"
            (input)="amount.set(num($any($event.target)))"
            [attr.aria-invalid]="!!amountErr()"
            [attr.aria-describedby]="amountErr() ? 'tc-amt-e' : 'tc-amt-h'"
          />
          @if (amountErr(); as e) {
            <span class="field__error" id="tc-amt-e"><ng-icon name="phosphorWarningCircle" aria-hidden="true" /> {{ e }}</span>
          } @else {
            <span class="field__hint" id="tc-amt-h">Rs {{ fmt(band().minA) }} to {{ fmt(band().maxA) }}</span>
          }
        </div>

        <fieldset class="fees">
          <legend class="field__label">Fees</legend>
          @for (f of product().fees; track f.id) {
            <label class="check">
              <input type="checkbox" [checked]="feeIds().includes(f.id)" (change)="toggleFee(f.id)" />
              <span>{{ f.name }}, Rs {{ fmt(f.amount) }}</span>
            </label>
          }
        </fieldset>
      </form>

      <div class="out">
        <div class="out-head">
          <h3>Repayment schedule</h3>
          <button type="button" class="reset" aria-label="Reset the calculator" (click)="reset()">
            <ng-icon name="phosphorArrowCounterClockwise" aria-hidden="true" />
          </button>
        </div>

        @if (valid()) {
          <dl class="sum">
            <div><dt>Instalment</dt><dd class="mono">Rs {{ fmt(rows()[0].pay) }}</dd></div>
            <div><dt>Total markup</dt><dd class="mono">Rs {{ fmt(totalMarkup()) }}</dd></div>
            <div><dt>Fees</dt><dd class="mono">Rs {{ fmt(fees()) }}</dd></div>
            <div><dt>Cheque</dt><dd class="mono strong">Rs {{ fmt(amount() - fees()) }}</dd></div>
          </dl>
          <div class="tbl-wrap" tabindex="0" role="region" aria-label="Instalments">
            <table>
              <caption class="sr-only">{{ rows().length }} instalments of a Rs {{ fmt(amount()) }} {{ product().name }} loan</caption>
              <thead>
                <tr>
                  <th scope="col" class="n">#</th>
                  <th scope="col">Due</th>
                  <th scope="col" class="n">Instalment</th>
                  <th scope="col" class="n">Markup</th>
                  <th scope="col" class="n">Principal</th>
                  <th scope="col" class="n">Balance</th>
                </tr>
              </thead>
              <tbody>
                @for (r of rows(); track r.no) {
                  <tr>
                    <td class="n mono">{{ r.no }}</td>
                    <td class="mono">{{ r.date }}</td>
                    <td class="n mono">{{ fmt(r.pay) }}</td>
                    <td class="n mono">{{ fmt(r.markup) }}</td>
                    <td class="n mono">{{ fmt(r.principal) }}</td>
                    <td class="n mono">{{ fmt(r.balance) }}</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        } @else {
          <p class="blocked">Fix the highlighted fields and the schedule appears.</p>
        }
        <p class="mono sample">Sample products, rates and fees; cheque dated 12 Feb 2024</p>
      </div>
    </div>
  `,
  styles: `
    :host {
      display: block;
    }
    .calc {
      display: grid;
      grid-template-columns: minmax(0, 340px) minmax(0, 1fr);
      gap: 28px;
      padding: 22px;
    }
    .form {
      display: grid;
      gap: 14px;
      align-content: start;

      .input,
      .select {
        height: 44px;
        font-size: 14px;
      }
      .seg button {
        height: 30px;
        padding: 0 12px;
        font-size: 13px;
      }
      .field__hint b {
        color: var(--t-sand-text);
        font-weight: 600;
      }
      .field__error {
        color: var(--t-red-text);
      }
      .input[aria-invalid='true'] {
        border-color: var(--t-red-text);
      }
    }
    .two {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
    }
    .fees {
      display: grid;
      gap: 8px;
      border: 0;
      padding: 0;
      margin: 0;

      legend {
        margin-bottom: 8px;
        padding: 0;
      }
      .check {
        font-size: 13.5px;
        align-items: center;
        min-height: 32px;
        cursor: pointer;
      }
      .check input {
        margin: 0;
        accent-color: var(--t-sand-text);
      }
    }
    .out {
      display: grid;
      gap: 14px;
      align-content: start;
      min-width: 0;
    }
    .out-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;

      h3 {
        font-size: 15px;
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

      &:hover {
        background: var(--surface-2);
      }
    }
    .sum {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 8px;
      margin: 0;

      div {
        padding: 10px 12px;
        border-radius: var(--r-inner);
        background: var(--bg);
        border: 1px solid var(--line);
      }
      dt {
        font-size: 12px;
        color: var(--muted);
      }
      dd {
        margin: 2px 0 0;
        font-size: 14px;
        font-weight: 500;
        color: var(--ink);
      }
      .strong {
        color: var(--t-green-text);
        font-weight: 600;
      }
    }
    .tbl-wrap {
      max-height: 300px;
      overflow: auto;
      border-radius: var(--r-inner);
      border: 1px solid var(--line);
      /* Scroll shadows: an edge darkens only while more columns sit past it */
      background:
        linear-gradient(to right, var(--surface), transparent) left / 24px 100% no-repeat local,
        linear-gradient(to left, var(--surface), transparent) right / 24px 100% no-repeat local,
        radial-gradient(farthest-side at 0 50%, rgb(0 0 0 / 0.16), transparent) left / 12px 100% no-repeat scroll,
        radial-gradient(farthest-side at 100% 50%, rgb(0 0 0 / 0.16), transparent) right / 12px 100% no-repeat scroll;

      &:focus-visible {
        outline: 2px solid var(--focus);
        outline-offset: 2px;
      }
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 13px;
    }
    th,
    td {
      padding: 8px 12px;
      text-align: left;
      white-space: nowrap;
      border-bottom: 1px solid var(--line);
    }
    thead th {
      position: sticky;
      top: 0;
      background: var(--surface-2);
      font-size: 12px;
      font-weight: 500;
      color: var(--ink-2);
    }
    tbody tr:last-child td {
      border-bottom: 0;
    }
    .n {
      text-align: right;
    }
    .blocked {
      padding: 22px;
      border-radius: var(--r-inner);
      background: var(--t-red-soft);
      color: var(--t-red-text);
      font-size: 14px;
    }
    .sample {
      font-size: 12px;
      color: var(--muted);
    }
    @media (max-width: 900px) {
      .calc {
        grid-template-columns: 1fr;
      }
    }
    @media (max-width: 520px) {
      th,
      td {
        padding: 7px 8px;
      }
      table {
        font-size: 12.5px;
      }
    }
    @media (max-width: 560px) {
      .calc {
        padding: 16px;
      }
      .sum {
        grid-template-columns: 1fr 1fr;
      }
    }
  `,
})
export class TmfCalcDemo {
  protected readonly products = PRODUCTS;
  protected readonly product = signal<Product>(PRODUCTS[0]);
  protected readonly repay = signal<Repay>(PRODUCTS[0].repay[0]);
  protected readonly band = signal<Band>(PRODUCTS[0].repay[0].bands[0]);
  protected readonly tenure = signal(12);
  protected readonly amount = signal(60_000);
  protected readonly due = signal(5);
  protected readonly feeIds = signal<string[]>(['proc', 'ins']);

  protected readonly tenureErr = computed(() => {
    const t = this.tenure();
    const b = this.band();
    const every = this.repay().every;
    if (t < b.minT || t > b.maxT) return `Between ${b.minT} and ${b.maxT} months.`;
    if (t % every) return `A multiple of ${every} for ${this.repay().name.toLowerCase()} repayment.`;
    return '';
  });
  protected readonly amountErr = computed(() => {
    const a = this.amount();
    const b = this.band();
    return a < b.minA || a > b.maxA ? `Between Rs ${this.fmt(b.minA)} and Rs ${this.fmt(b.maxA)}.` : '';
  });
  protected readonly dueErr = computed(() => {
    const d = this.due();
    const p = this.product();
    return d < p.dueFrom || d > p.dueTo ? `Between ${p.dueFrom} and ${p.dueTo}.` : '';
  });
  protected readonly valid = computed(() => !this.tenureErr() && !this.amountErr() && !this.dueErr());

  protected readonly fees = computed(() =>
    this.product()
      .fees.filter((f) => this.feeIds().includes(f.id))
      .reduce((s, f) => s + f.amount, 0),
  );

  /** Equal instalments, markup on the falling balance; the last one absorbs the rounding. */
  protected readonly rows = computed<Row[]>(() => {
    if (!this.valid()) return [];
    const every = this.repay().every;
    const n = this.tenure() / every;
    const r = (this.band().rate / 100) * (every / 12);
    const p = this.amount();
    const pay = Math.round((p * r) / (1 - Math.pow(1 + r, -n)));
    const out: Row[] = [];
    let bal = p;
    for (let i = 1; i <= n; i++) {
      const markup = Math.round(bal * r);
      const principal = i === n ? bal : pay - markup;
      bal -= principal;
      const m = CHEQUE.m + i * every;
      out.push({
        no: i,
        date: `${String(this.due()).padStart(2, '0')} ${MONTHS[m % 12]} ${CHEQUE.y + Math.floor(m / 12)}`,
        pay: principal + markup,
        markup,
        principal,
        balance: bal,
      });
    }
    return out;
  });
  protected readonly totalMarkup = computed(() => this.rows().reduce((s, r) => s + r.markup, 0));

  protected fmt(n: number): string {
    return pkr.format(n);
  }

  protected num(el: HTMLInputElement): number {
    return digits(el.value);
  }

  protected setProduct(id: string): void {
    const p = PRODUCTS.find((x) => x.id === id) ?? PRODUCTS[0];
    this.product.set(p);
    this.feeIds.set(p.fees.map((f) => f.id));
    this.due.set(p.dueFrom);
    this.setRepay(p.repay[0]);
  }

  protected setRepay(r: Repay): void {
    this.repay.set(r);
    this.applyBand(r.bands[0]);
  }

  protected setBand(id: string): void {
    this.applyBand(this.repay().bands.find((b) => b.id === id) ?? this.repay().bands[0]);
  }

  protected toggleFee(id: string): void {
    this.feeIds.update((f) => (f.includes(id) ? f.filter((x) => x !== id) : [...f, id]));
  }

  protected reset(): void {
    this.setProduct(PRODUCTS[0].id);
    this.due.set(5);
  }

  /** A new band resets the tenure and amount to values inside it, as the real form resets its fields. */
  private applyBand(b: Band): void {
    this.band.set(b);
    this.tenure.set(Math.min(b.maxT, Math.max(b.minT, 12)));
    this.amount.set(Math.round((b.minA + b.maxA) / 2 / 5_000) * 5_000);
  }
}
