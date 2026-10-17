import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { phosphorArrowCounterClockwise, phosphorPlus, phosphorX } from '@ng-icons/phosphor-icons/regular';
import { money, parseAmount, toWords } from './books';

/**
 * Invoice builder and its three printed layouts (my own redraw of the app's templates, not a screenshot):
 * the default layout, the government-standard one with the sales tax broken out per line and the CNIC/NTN of both
 * sides, and a boxed style with a signature line. All three print the total in words, the way the app did with
 * the number-to-words package. Recording a payment lowers the amount due. Sample business, customers and figures.
 */
type Layout = 'default' | 'gov' | 'custom';

interface Item {
  name: string;
  desc: string;
  amt: number;
}

interface Tax {
  id: string;
  name: string;
  abbr: string;
  rate: number;
}

const TAXES: Tax[] = [
  { id: 'sst', name: 'Sindh Sales Tax', abbr: 'SST', rate: 13 },
  { id: 'gst', name: 'Sales Tax', abbr: 'GST', rate: 17 },
  { id: 'none', name: 'No tax', abbr: 'Tax', rate: 0 },
];

const CUSTOMERS = [
  { id: 1, name: 'Noor Bakers', address: 'Shop 3, Gulshan Market, Karāchi', ntn: '7654321-0', email: 'orders@noorbakers.example' },
  { id: 2, name: 'Indus Tutors', address: 'Plot 18, Model Town, Lahore', ntn: '2468135-7', email: 'office@industutors.example' },
  { id: 3, name: 'Saffron Textiles', address: 'Unit 5, SITE Area, Hyderabad', ntn: '1357924-6', email: 'accounts@saffron.example' },
];

const FROM = { name: 'Tabeer Studio', address: 'Office 12, Main Boulevard, Karāchi', ntn: '1234567-8', email: 'accounts@tabeer.example' };

const SEED: Item[] = [
  { name: 'Brand identity', desc: 'Logo, colours and type', amt: 180000 },
  { name: 'Packaging design', desc: 'Two box sizes, print ready', amt: 120000 },
];

const LAYOUTS: { id: Layout; label: string }[] = [
  { id: 'default', label: 'Default' },
  { id: 'gov', label: 'Gov. standard' },
  { id: 'custom', label: 'Custom style' },
];

@Component({
  selector: 'mh-ah-invoice',
  imports: [NgIcon],
  viewProviders: [provideIcons({ phosphorArrowCounterClockwise, phosphorPlus, phosphorX })],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="inv card">
      <div class="editor">
        <div class="ed-head">
          <h3>Invoice <span class="mono">INV-0041</span></h3>
          <span class="badge-st" [attr.data-s]="status()">{{ statusLabel() }}</span>
          <button type="button" class="reset" aria-label="Reset the sample invoice" (click)="reset()">
            <ng-icon name="phosphorArrowCounterClockwise" aria-hidden="true" />
          </button>
        </div>

        <div class="grp">
          <span class="lbl" id="ah-inv-layout">Template</span>
          <div class="seg" role="group" aria-labelledby="ah-inv-layout">
            @for (l of layouts; track l.id) {
              <button type="button" [attr.aria-pressed]="layout() === l.id" (click)="layout.set(l.id)">{{ l.label }}</button>
            }
          </div>
        </div>

        <div class="field">
          <label for="ah-inv-cust">Customer</label>
          <select id="ah-inv-cust" class="select" (change)="cust.set(+$any($event.target).value)">
            @for (c of customers; track c.id) {
              <option [value]="c.id" [selected]="c.id === cust()">{{ c.name }}</option>
            }
          </select>
        </div>

        <fieldset class="items">
          <legend>Items</legend>
          @for (it of items(); track $index; let i = $index) {
            <div class="item">
              <input class="input" maxlength="40" [attr.aria-label]="'Item ' + (i + 1)" [value]="it.name" (input)="setName(i, $event)" />
              <input class="input amt mono" inputmode="numeric" [attr.aria-label]="'Price of item ' + (i + 1)" [value]="fmt(it.amt)" (input)="setAmt(i, $event)" />
              <button type="button" class="rm" [disabled]="items().length === 1" [attr.aria-label]="'Remove item ' + (i + 1)" (click)="remove(i)">
                <ng-icon name="phosphorX" aria-hidden="true" />
              </button>
            </div>
          }
          <button type="button" class="add" [disabled]="items().length >= 4" (click)="add()"><ng-icon name="phosphorPlus" aria-hidden="true" /> Add an item</button>
        </fieldset>

        <div class="field">
          <label for="ah-inv-tax">Tax on every line</label>
          <select id="ah-inv-tax" class="select" (change)="taxId.set($any($event.target).value)">
            @for (t of taxes; track t.id) {
              <option [value]="t.id" [selected]="t.id === taxId()">{{ t.rate ? t.name + ' (' + t.abbr + ') ' + t.rate + '%' : t.name }}</option>
            }
          </select>
        </div>

        <div class="pay">
          <label for="ah-inv-pay">Record a payment</label>
          <div class="pay-row">
            <input id="ah-inv-pay" class="input amt mono" inputmode="numeric" [value]="fmt(payInput())" (input)="setPay($event)" />
            <button type="button" class="btn btn-solid btn-sm" [disabled]="!payInput() || !due()" (click)="pay()">Record</button>
          </div>
        </div>
      </div>

      <!-- The printed page -->
      <div class="paper-wrap">
        <article class="paper" [attr.data-layout]="layout()" aria-label="Invoice preview">
          @switch (layout()) {
            @case ('default') {
              <header class="p-top">
                <div class="p-brand">
                  <img src="/images/asaan-hisab/asaan-hisab-mark.webp" width="25" height="24" alt="" />
                  <b>{{ from.name }}</b>
                </div>
                <div class="p-right">
                  <p class="p-title">INVOICE</p>
                  <p>{{ from.address }}</p>
                  <p>{{ from.email }}</p>
                </div>
              </header>
              <div class="p-meta">
                <div>
                  <p class="p-k">Bill to</p>
                  <p><b>{{ customer().name }}</b></p>
                  <p>{{ customer().address }}</p>
                  <p>{{ customer().email }}</p>
                </div>
                <dl class="p-dl">
                  <dt>Invoice Number</dt><dd>INV-0041</dd>
                  <dt>Invoice Date</dt><dd>18 Apr 2020</dd>
                  <dt class="hi">Amount Due</dt><dd class="hi">Rs {{ fmt(due()) }}</dd>
                </dl>
              </div>
              <table class="p-table band">
                <thead><tr><th>Items</th><th class="r">Amount</th></tr></thead>
                <tbody>
                  @for (it of items(); track $index) {
                    <tr><td><b>{{ it.name || 'Item' }}</b>@if (it.desc) {<br /><span>{{ it.desc }}</span>}</td><td class="r">{{ fmt(it.amt) }}</td></tr>
                  }
                </tbody>
              </table>
              <dl class="p-sum">
                <dt>Subtotal</dt><dd>Rs {{ fmt(subtotal()) }}</dd>
                @if (tax().rate) {
                  <dt>{{ tax().name }} {{ tax().rate }}%</dt><dd>Rs {{ fmt(taxAmt()) }}</dd>
                }
                <dt class="tot">Total</dt><dd class="tot">Rs {{ fmt(total()) }}</dd>
                @if (paid()) {
                  <dt>Paid</dt><dd>Rs {{ fmt(paid()) }}</dd>
                }
                <dt class="tot">Amount Due</dt><dd class="tot">Rs {{ fmt(due()) }}</dd>
              </dl>
              <p class="p-words">{{ words() }}</p>
            }
            @case ('gov') {
              <p class="p-title c">INVOICE</p>
              <div class="p-gov-head">
                <b>ORIGINAL</b>
                <dl class="p-dl">
                  <dt>Invoice Number:</dt><dd><u>INV-0041</u></dd>
                  <dt>Invoice Date:</dt><dd><u>18 Apr 2020</u></dd>
                </dl>
              </div>
              <div class="p-boxes">
                <table class="p-table grid">
                  <tbody>
                    <tr><td>Client Name</td><td>{{ customer().name }}</td></tr>
                    <tr><td>Address</td><td>{{ customer().address }}</td></tr>
                    <tr><td>CNIC / NTN</td><td>{{ customer().ntn }}</td></tr>
                  </tbody>
                </table>
                <table class="p-table grid">
                  <tbody>
                    <tr><td>From</td><td>{{ from.name }}</td></tr>
                    <tr><td>Address</td><td>{{ from.address }}</td></tr>
                    <tr><td>CNIC / NTN</td><td>{{ from.ntn }}</td></tr>
                  </tbody>
                </table>
              </div>
              <table class="p-table grid cols">
                <thead>
                  <tr><th>Description</th><th class="r">Amount</th><th class="r">Rate of {{ tax().abbr }}</th><th class="r">{{ tax().abbr }} Rs.</th><th class="r">Value incl. {{ tax().abbr }} (Rs)</th></tr>
                </thead>
                <tbody>
                  @for (it of items(); track $index) {
                    <tr>
                      <td><b>{{ it.name || 'Item' }}</b></td>
                      <td class="r">{{ fmt(it.amt) }}</td>
                      <td class="r">{{ tax().rate }}%</td>
                      <td class="r">{{ fmt(lineTax(it.amt)) }}</td>
                      <td class="r">{{ fmt(it.amt + lineTax(it.amt)) }}</td>
                    </tr>
                  }
                </tbody>
              </table>
              <table class="p-table grid p-amount">
                <tbody><tr><td>Invoice Amount PKR</td><td class="r">{{ fmt(total()) }}</td></tr></tbody>
              </table>
              <p class="p-words up">Total amount &nbsp; {{ words() }}</p>
            }
            @case ('custom') {
              <p class="p-title c">INVOICE</p>
              <div class="p-boxes">
                <div class="p-box">
                  <p><b>Client Name:</b> {{ customer().name }}</p>
                  <p><b>Address:</b> {{ customer().address }}</p>
                  <p><b>NTN:</b> {{ customer().ntn }}</p>
                </div>
                <div class="p-box">
                  <p><b>Invoice No.:</b> INV-0041</p>
                  <p><b>Date:</b> 18 Apr 2020</p>
                  <p><b>NTN:</b> {{ from.ntn }}</p>
                </div>
              </div>
              <table class="p-table grid">
                <thead><tr><th>Description</th><th class="r">PKR</th></tr></thead>
                <tbody>
                  @for (it of items(); track $index) {
                    <tr><td><b>{{ it.name || 'Item' }}</b>@if (it.desc) {<br /><span>{{ it.desc }}</span>}</td><td class="r">{{ fmt(it.amt) }}</td></tr>
                  }
                  <tr><td><b>Sub-total</b></td><td class="r"><b>{{ fmt(subtotal()) }}</b></td></tr>
                  @if (tax().rate) {
                    <tr><td>{{ tax().name }}</td><td class="r">{{ fmt(taxAmt()) }}</td></tr>
                  }
                  <tr><td><b>Grand Total</b></td><td class="r"><b>{{ fmt(total()) }}</b></td></tr>
                </tbody>
              </table>
              <p class="p-words up">{{ words() }}</p>
              <div class="p-sign">
                <p>Yours truly,</p>
                <span aria-hidden="true"></span>
                <b>{{ from.name }}</b>
              </div>
            }
          }
          @if (status() === 'paid') {
            <span class="stamp" aria-hidden="true">PAID</span>
          }
        </article>
      </div>
      <p class="mono sample" aria-live="polite">{{ note() }}</p>
    </div>
  `,
  styles: `
    :host {
      display: block;
    }
    .inv {
      display: grid;
      grid-template-columns: minmax(0, 320px) minmax(0, 1fr);
      gap: 20px;
      padding: 18px;
    }
    .editor {
      display: grid;
      gap: 14px;
      align-content: start;
    }
    .ed-head {
      display: flex;
      align-items: center;
      gap: 10px;

      h3 {
        flex: 1;
        font-size: 16px;
      }
      .mono {
        font-size: 13px;
        color: var(--muted);
        font-weight: 400;
      }
    }
    .badge-st {
      padding: 2px 10px;
      border-radius: 999px;
      font-size: 12px;
      font-weight: 500;
      background: var(--a-amber-soft);
      color: var(--a-amber-text);

      &[data-s='partial'] {
        background: var(--a-blue-soft);
        color: var(--a-blue-text);
      }
      &[data-s='paid'] {
        background: var(--a-green-soft);
        color: var(--a-green-text);
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
    .grp {
      display: grid;
      gap: 6px;
    }
    .lbl,
    legend,
    .field label,
    .pay label {
      font-size: 12.5px;
      font-weight: 500;
      color: var(--ink-2);
    }
    .seg {
      flex-wrap: wrap;
      justify-self: start;

      button {
        height: 34px;
        padding: 0 12px;
        font-size: 13px;
      }
    }
    .input,
    .select {
      height: 44px;
      font-size: 14px;
    }
    .field,
    .pay {
      display: grid;
      gap: 6px;
    }
    fieldset {
      margin: 0;
      padding: 0;
      border: 0;
      min-width: 0;
    }
    legend {
      padding: 0;
      margin-bottom: 6px;
    }
    .items {
      display: grid;
      gap: 6px;
    }
    .item {
      display: grid;
      grid-template-columns: minmax(0, 1fr) 104px 32px;
      gap: 6px;
      align-items: center;

      .input {
        padding: 0 14px;
        font-size: 13.5px;
      }
    }
    .amt {
      text-align: right;
    }
    .rm {
      width: 32px;
      height: 32px;
      display: grid;
      place-items: center;
      border-radius: 999px;
      color: var(--muted);

      &:hover:not([disabled]) {
        background: var(--surface-2);
        color: var(--ink);
      }
      &[disabled] {
        opacity: 0.35;
      }
    }
    .add {
      justify-self: start;
      display: inline-flex;
      align-items: center;
      gap: 5px;
      min-height: 32px;
      padding: 0 12px;
      border-radius: 999px;
      background: var(--a-blue-soft);
      color: var(--a-blue-text);
      font-size: 12.5px;
      font-weight: 500;

      &[disabled] {
        opacity: 0.45;
        cursor: not-allowed;
      }
    }
    .pay-row {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      gap: 8px;

      .btn {
        height: 44px;
      }
      .btn[disabled] {
        opacity: 0.45;
        cursor: not-allowed;
      }
    }

    // ---------- The page ----------
    .paper-wrap {
      min-width: 0;
      padding: 16px;
      border-radius: var(--r-inner);
      background: var(--surface-2);
    }
    .paper {
      position: relative;
      display: grid;
      gap: 14px;
      align-content: start;
      min-height: 100%;
      padding: 24px 22px;
      border-radius: 4px;
      background: #fff;
      color: #1c2733;
      box-shadow: 0 1px 3px rgb(28 39 51 / 0.12), 0 12px 28px -14px rgb(21 60 110 / 0.25);
      font-size: 12px;
      line-height: 1.45;
      overflow: hidden;

      p {
        margin: 0;
      }
      b {
        font-weight: 600;
      }
    }
    .p-top {
      display: flex;
      justify-content: space-between;
      gap: 12px;
      padding-bottom: 12px;
      border-bottom: 1px solid #dbe2ea;
    }
    .p-brand {
      display: flex;
      align-items: center;
      gap: 8px;
      flex: none;
      align-self: start;
      font-size: 12.5px;
    }
    .p-right {
      min-width: 0;
      overflow-wrap: anywhere;
      text-align: right;
      color: #586575;
    }
    .p-title {
      font-size: 22px;
      font-weight: 500;
      letter-spacing: 0.02em;
      color: #1c2733;

      &.c {
        text-align: center;
        font-size: 15px;
        font-weight: 700;
      }
    }
    .p-meta {
      display: flex;
      justify-content: space-between;
      gap: 16px;
      flex-wrap: wrap;
    }
    .p-k {
      color: #586575;
    }
    .p-dl {
      display: grid;
      grid-template-columns: auto auto;
      gap: 2px 10px;
      margin: 0;
      align-self: start;

      dt {
        font-weight: 600;
        text-align: right;
      }
      dd {
        margin: 0;
      }
      .hi {
        padding: 3px 0;
        background: #ebeff4;
      }
      dt.hi {
        padding-left: 8px;
      }
      dd.hi {
        padding-right: 8px;
        font-weight: 600;
      }
    }
    .p-table {
      width: 100%;
      border-collapse: collapse;

      th,
      td {
        padding: 6px 8px;
        text-align: left;
        vertical-align: top;
      }
      .r {
        text-align: right;
        white-space: nowrap;
      }
      td span {
        color: #586575;
      }
    }
    .band {
      th {
        background: var(--a-blue);
        color: #fff;
        font-weight: 600;
      }
      td {
        border-bottom: 1px solid #dbe2ea;
      }
    }
    .grid {
      th,
      td {
        border: 1px solid #4d5866;
        padding: 4px 6px;
      }
      th {
        background: #ebeff4;
        font-weight: 600;
        text-align: center;
      }
    }
    .cols th {
      font-size: 12px;
    }
    .p-sum {
      display: grid;
      grid-template-columns: auto auto;
      justify-content: end;
      gap: 3px 18px;
      margin: 0;

      dt {
        text-align: right;
        font-weight: 600;
      }
      dd {
        margin: 0;
        text-align: right;
      }
      .tot {
        padding-top: 4px;
        border-top: 1px solid #dbe2ea;
      }
    }
    .p-words {
      color: #3d5166;

      &::first-letter {
        text-transform: uppercase;
      }
      &.up {
        text-transform: uppercase;
        color: #1c2733;
      }
    }
    .p-gov-head {
      display: flex;
      justify-content: space-between;
      align-items: end;
      gap: 12px;
    }
    .p-boxes {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      align-items: start;

      .grid td:first-child {
        width: 38%;
      }
    }
    .p-box {
      padding: 6px 8px;
      border: 1px solid #4d5866;
    }
    .p-amount {
      width: auto;
      margin-left: auto;
    }
    .p-sign {
      display: grid;
      gap: 6px;
      justify-items: start;

      span {
        width: 160px;
        height: 22px;
        border-bottom: 1px solid #1c2733;
      }
    }
    .stamp {
      position: absolute;
      top: 46%;
      right: 12%;
      padding: 4px 14px;
      border: 3px solid var(--a-green-text);
      border-radius: 6px;
      color: var(--a-green-text);
      font-size: 22px;
      font-weight: 700;
      letter-spacing: 0.12em;
      opacity: 0.55;
      transform: rotate(-12deg);
    }
    .sample {
      grid-column: 1 / -1;
      font-size: 12px;
      color: var(--muted);
      min-height: 14px;
    }
    @media (max-width: 860px) {
      .inv {
        grid-template-columns: 1fr;
      }
    }
    @media (max-width: 520px) {
      .inv {
        padding: 14px;
      }
      .paper-wrap {
        padding: 8px;
      }
      .paper {
        padding: 16px 12px;
        font-size: 12px;
      }
      .p-boxes {
        grid-template-columns: 1fr;
      }
      .cols th,
      .cols td {
        font-size: 12px;
        padding: 3px;
      }
      .item {
        grid-template-columns: minmax(0, 1fr) 92px 32px;
      }
    }
  `,
})
export class AsaanHisabInvoiceDemo {
  protected readonly layouts = LAYOUTS;
  protected readonly taxes = TAXES;
  protected readonly customers = CUSTOMERS;
  protected readonly from = FROM;
  protected readonly fmt = money;

  protected readonly layout = signal<Layout>('default');
  protected readonly cust = signal(1);
  protected readonly items = signal<Item[]>(SEED);
  protected readonly taxId = signal('sst');
  protected readonly paid = signal(0);
  protected readonly payInput = signal(226000);
  protected readonly note = signal('Sample invoice. Switch the template, edit a line, record a payment.');

  protected readonly customer = computed(() => CUSTOMERS.find((c) => c.id === this.cust())!);
  protected readonly tax = computed(() => TAXES.find((t) => t.id === this.taxId())!);
  protected readonly subtotal = computed(() => this.items().reduce((s, i) => s + i.amt, 0));
  protected readonly taxAmt = computed(() => this.items().reduce((s, i) => s + this.lineTax(i.amt), 0));
  protected readonly total = computed(() => this.subtotal() + this.taxAmt());
  protected readonly due = computed(() => Math.max(0, this.total() - this.paid()));
  protected readonly status = computed(() => (this.paid() === 0 ? 'unpaid' : this.due() === 0 ? 'paid' : 'partial'));
  protected readonly statusLabel = computed(() => ({ unpaid: 'Unpaid', partial: 'Partly paid', paid: 'Paid' })[this.status()]);
  protected readonly words = computed(() => `${toWords(this.total())} rupees only`);

  /** Tax is worked out per line and rounded per line, as each line carries its own rate on the government layout. */
  protected lineTax(amt: number): number {
    return Math.round((amt * this.tax().rate) / 100);
  }

  protected setName(i: number, ev: Event): void {
    const name = (ev.target as HTMLInputElement).value;
    this.items.update((l) => l.map((it, j) => (j === i ? { ...it, name } : it)));
  }

  protected setAmt(i: number, ev: Event): void {
    const el = ev.target as HTMLInputElement;
    const amt = parseAmount(el.value);
    el.value = amt ? money(amt) : '';
    this.items.update((l) => l.map((it, j) => (j === i ? { ...it, amt } : it)));
  }

  protected setPay(ev: Event): void {
    const el = ev.target as HTMLInputElement;
    const v = parseAmount(el.value);
    el.value = v ? money(v) : '';
    this.payInput.set(v);
  }

  protected add(): void {
    this.items.update((l) => (l.length < 4 ? [...l, { name: 'Social media kit', desc: '', amt: 45000 }] : l));
  }

  protected remove(i: number): void {
    this.items.update((l) => (l.length > 1 ? l.filter((_, j) => j !== i) : l));
  }

  protected pay(): void {
    const amt = Math.min(this.payInput(), this.due());
    this.paid.update((p) => p + amt);
    this.payInput.set(this.due());
    this.note.set(this.due() ? `Rs ${money(amt)} recorded. Rs ${money(this.due())} still due.` : `Rs ${money(amt)} recorded. Paid in full.`);
  }

  protected reset(): void {
    this.layout.set('default');
    this.cust.set(1);
    this.items.set(SEED);
    this.taxId.set('sst');
    this.paid.set(0);
    this.payInput.set(226000);
    this.note.set('Sample invoice reset.');
  }
}
