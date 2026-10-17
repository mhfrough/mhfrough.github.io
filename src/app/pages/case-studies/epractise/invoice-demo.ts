import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  phosphorArrowCounterClockwise,
  phosphorBell,
  phosphorCheck,
  phosphorPaperPlaneTilt,
  phosphorPlus,
  phosphorReceipt,
  phosphorTrash,
  phosphorX,
} from '@ng-icons/phosphor-icons/regular';

/**
 * A firm's invoices (my own redraw, not a screenshot), true to the real invoicing screens:
 *  - an invoice is one-time or recurring (recurring needs a period), numbered INV- plus five digits, built from the
 *    firm's services, with the invoice-wide discount and the tax as lines of their own;
 *  - totals follow the real model: tax is a rate on the items' total, the discount a percentage of it, and the total
 *    is items plus tax minus discount;
 *  - it is emailed to the client now or scheduled for a send date, with "Thank you for your business!" as the
 *    default footer;
 *  - the list shows Scheduled, Unpaid, Overdue and Paid; a scheduled one can be sent now, an open one gets a reminder
 *    by email, push notification or SMS, and when the client uploads proof of payment the firm confirms it (paid)
 *    or discards it;
 *  - three counters on top: total invoiced, received, remaining.
 * Invented clients, services, amounts and tax rate.
 */
type Status = 'scheduled' | 'unpaid' | 'overdue' | 'paid';
type Kind = 'one-time' | 'recurring';

interface Line {
  id: number;
  service: string;
  amount: number;
}

interface Invoice {
  no: string;
  account: string;
  total: number;
  status: Status;
  kind: Kind;
  proof?: boolean;
  reminded?: string;
}

const ACCOUNTS = ['Castillo household', 'Maple Row Bakery', 'Northgate Dental'];
const SERVICES: { t: string; amount: number }[] = [
  { t: 'Individual return (1040)', amount: 450 },
  { t: 'State return', amount: 150 },
  { t: 'Bookkeeping, monthly', amount: 300 },
  { t: 'Payroll filing', amount: 120 },
  { t: 'Tax planning session', amount: 200 },
];
const PERIODS = ['Monthly', 'Quarterly', 'Yearly'];
const TAX = { label: 'Sales tax (ST) 8%', rate: 8 };
const CHANNELS = ['Email', 'Push notification', 'SMS'] as const;

const SEED: Invoice[] = [
  { no: 'INV-30412', account: 'Maple Row Bakery', total: 1296, status: 'paid', kind: 'recurring' },
  { no: 'INV-30388', account: 'Northgate Dental', total: 640, status: 'overdue', kind: 'one-time' },
  { no: 'INV-30431', account: 'Castillo household', total: 380, status: 'unpaid', kind: 'one-time', proof: true },
  { no: 'INV-30447', account: 'Maple Row Bakery', total: 324, status: 'scheduled', kind: 'recurring' },
];
const SEED_LINES: Line[] = [
  { id: 1, service: SERVICES[0].t, amount: SERVICES[0].amount },
  { id: 2, service: SERVICES[1].t, amount: SERVICES[1].amount },
];

const LABEL: Record<Status, string> = { scheduled: 'Scheduled', unpaid: 'Unpaid', overdue: 'Overdue', paid: 'Paid' };
const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 });

@Component({
  selector: 'mh-epractise-invoice',
  imports: [NgIcon],
  viewProviders: [
    provideIcons({ phosphorArrowCounterClockwise, phosphorBell, phosphorCheck, phosphorPaperPlaneTilt, phosphorPlus, phosphorReceipt, phosphorTrash, phosphorX }),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./mini-btn.scss'],
  template: `
    <div class="inv card">
      <header class="i-head">
        <div>
          <p class="mono lbl">Billing</p>
          <h3>Invoices</h3>
        </div>
        <dl class="counters">
          <div><dt>Total invoiced</dt><dd class="mono">{{ fmt(totals().all) }}</dd></div>
          <div class="rec"><dt>Received</dt><dd class="mono">{{ fmt(totals().paid) }}</dd></div>
          <div class="rem"><dt>Remaining</dt><dd class="mono">{{ fmt(totals().open) }}</dd></div>
        </dl>
        <button type="button" class="reset" aria-label="Reset the sample invoices" (click)="reset()">
          <ng-icon name="phosphorArrowCounterClockwise" aria-hidden="true" />
        </button>
      </header>

      <div class="cols">
        <!-- New invoice -->
        <form class="new" (submit)="create($event)" aria-labelledby="ep-inv-new">
          <div class="new-top">
            <h4 id="ep-inv-new">New invoice <span class="mono no">{{ nextNo() }}</span></h4>
            <div class="seg" role="group" aria-label="Invoice type">
              <button type="button" [attr.aria-pressed]="kind() === 'one-time'" (click)="kind.set('one-time')">One-time</button>
              <button type="button" [attr.aria-pressed]="kind() === 'recurring'" (click)="kind.set('recurring')">Recurring</button>
            </div>
          </div>

          <div class="row2">
            <div class="field">
              <label class="field__label" for="ep-inv-acc">Account</label>
              <select id="ep-inv-acc" class="select" [value]="account()" (change)="account.set($any($event.target).value)">
                @for (a of accounts; track a) {
                  <option [value]="a">{{ a }}</option>
                }
              </select>
            </div>
            @if (kind() === 'recurring') {
              <div class="field">
                <label class="field__label" for="ep-inv-per">Invoice period</label>
                <select id="ep-inv-per" class="select" [value]="period()" (change)="period.set($any($event.target).value)">
                  @for (p of periods; track p) {
                    <option [value]="p">{{ p }}</option>
                  }
                </select>
              </div>
            }
          </div>

          <table class="items">
            <caption class="sr-only">Line items</caption>
            <thead>
              <tr>
                <th scope="col">Product or service</th>
                <th scope="col">Type</th>
                <th scope="col" class="r">Amount</th>
                <th scope="col"><span class="sr-only">Remove</span></th>
              </tr>
            </thead>
            <tbody>
              @for (l of lines(); track l.id) {
                <tr>
                  <td>{{ l.service }}</td>
                  <td><span class="ty">Service</span></td>
                  <td class="r">
                    <label class="sr-only" [for]="'ep-inv-amt-' + l.id">Amount for {{ l.service }}</label>
                    <input
                      class="amt mono"
                      type="number"
                      min="0"
                      step="10"
                      inputmode="decimal"
                      [id]="'ep-inv-amt-' + l.id"
                      [value]="l.amount"
                      (input)="setAmount(l.id, $any($event.target).value)"
                    />
                  </td>
                  <td>
                    <button type="button" class="icon-x" (click)="removeLine(l.id)" [attr.aria-label]="'Remove ' + l.service" [disabled]="lines().length === 1">
                      <ng-icon name="phosphorTrash" aria-hidden="true" />
                    </button>
                  </td>
                </tr>
              }
              @if (discountPct() > 0) {
                <tr class="sys">
                  <td>Discount {{ discountPct() }}%</td>
                  <td><span class="ty ty-d">Discount</span></td>
                  <td class="r mono">-{{ fmt(discount()) }}</td>
                  <td></td>
                </tr>
              }
              @if (taxOn()) {
                <tr class="sys">
                  <td>{{ tax.label }}</td>
                  <td><span class="ty ty-t">Tax</span></td>
                  <td class="r mono">{{ fmt(taxAmount()) }}</td>
                  <td></td>
                </tr>
              }
            </tbody>
          </table>

          <div class="adders">
            <div class="add-svc">
              <label class="sr-only" for="ep-inv-svc">Service to add</label>
              <select id="ep-inv-svc" class="select" [value]="pick()" (change)="pick.set($any($event.target).value)">
                @for (s of services; track s.t) {
                  <option [value]="s.t">{{ s.t }}</option>
                }
              </select>
              <button type="button" class="mini-btn" (click)="addLine()"><ng-icon name="phosphorPlus" aria-hidden="true" /> Add service</button>
            </div>
            <div class="add-opts">
              <label class="pct" for="ep-inv-disc">Discount %
                <input id="ep-inv-disc" class="amt mono" type="number" min="0" max="50" step="5" [value]="discountPct()" (input)="setDiscount($any($event.target).value)" />
              </label>
              <label class="check"><input type="checkbox" [checked]="taxOn()" (change)="taxOn.set($any($event.target).checked)" /> Add tax</label>
            </div>
          </div>

          <dl class="sum">
            <div><dt>Subtotal</dt><dd class="mono">{{ fmt(subtotal()) }}</dd></div>
            <div><dt>Discount</dt><dd class="mono">-{{ fmt(discount()) }}</dd></div>
            <div><dt>Tax</dt><dd class="mono">{{ fmt(taxAmount()) }}</dd></div>
            <div class="tot"><dt>Total</dt><dd class="mono">{{ fmt(total()) }}</dd></div>
          </dl>

          <div class="send">
            <label class="check"><input type="checkbox" [checked]="email()" (change)="email.set($any($event.target).checked)" /> Email invoice to client</label>
            <label class="check"><input type="checkbox" [checked]="schedule()" (change)="schedule.set($any($event.target).checked)" /> Schedule it</label>
            @if (schedule()) {
              <div class="field date">
                <label class="field__label" for="ep-inv-date">Send date</label>
                <input id="ep-inv-date" class="input mono" type="date" [value]="sendDate()" (input)="sendDate.set($any($event.target).value)" />
              </div>
            }
            <p class="foot">Footer: Thank you for your business!</p>
            <button type="submit" class="btn btn-solid">
              <ng-icon [name]="schedule() ? 'phosphorReceipt' : 'phosphorPaperPlaneTilt'" aria-hidden="true" />
              {{ schedule() ? 'Schedule invoice' : 'Create and send' }}
            </button>
          </div>
        </form>

        <!-- The list -->
        <div class="list">
          <h4>All invoices</h4>
          <ul role="list">
            @for (v of invoices(); track v.no) {
              <li [attr.data-s]="v.status">
                <div class="v-top">
                  <span class="v-id">
                    <b class="mono">{{ v.no }}</b>
                    <span>{{ v.account }}{{ v.kind === 'recurring' ? ', recurring' : '' }}</span>
                  </span>
                  <span class="v-amt mono">{{ fmt(v.total) }}</span>
                  <span class="st">{{ label[v.status] }}</span>
                </div>
                @if (v.proof && v.status !== 'paid') {
                  <p class="proof">Proof of payment uploaded by the client</p>
                }
                @if (v.reminded) {
                  <p class="reminded"><ng-icon name="phosphorBell" aria-hidden="true" /> Reminder set: {{ v.reminded }}</p>
                }
                @if (v.status !== 'paid') {
                  <div class="v-acts">
                    @if (v.status === 'scheduled') {
                      <button type="button" class="mini-btn is-primary" (click)="sendNow(v.no)" [attr.aria-label]="'Send ' + v.no + ' now'">
                        <ng-icon name="phosphorPaperPlaneTilt" aria-hidden="true" /> Send now
                      </button>
                    } @else if (v.proof) {
                      <button type="button" class="mini-btn is-primary" (click)="confirm(v.no)" [attr.aria-label]="'Confirm payment proof for ' + v.no">
                        <ng-icon name="phosphorCheck" aria-hidden="true" /> Confirm
                      </button>
                      <button type="button" class="mini-btn" (click)="discard(v.no)" [attr.aria-label]="'Discard payment proof for ' + v.no">
                        <ng-icon name="phosphorX" aria-hidden="true" /> Discard
                      </button>
                    } @else {
                      <button type="button" class="mini-btn" (click)="toggleRemind(v.no)" [attr.aria-expanded]="reminding() === v.no" [attr.aria-label]="'Set a reminder for ' + v.no">
                        <ng-icon name="phosphorBell" aria-hidden="true" /> Remind
                      </button>
                      <button type="button" class="mini-btn" (click)="clientProof(v.no)" [attr.aria-label]="'Client uploads proof of payment for ' + v.no">Client sends proof</button>
                    }
                  </div>
                }
                @if (reminding() === v.no) {
                  <fieldset class="remind">
                    <legend>Remind the client by</legend>
                    @for (ch of channels; track ch) {
                      <label class="check"><input type="checkbox" [checked]="via().includes(ch)" (change)="toggleVia(ch)" /> {{ ch }}</label>
                    }
                    <button type="button" class="mini-btn is-primary" [disabled]="!via().length" (click)="setReminder(v.no)">Set reminder</button>
                  </fieldset>
                }
              </li>
            }
          </ul>
        </div>
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
      gap: 16px;
      padding: 18px;
    }
    .lbl {
      font-size: 12px;
      color: var(--muted);
    }
    .i-head {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 12px 18px;

      > div:first-child {
        flex: 1;
        min-width: 140px;
      }
      h3 {
        font-size: 16px;
      }
    }
    .counters {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin: 0;

      div {
        padding: 6px 12px;
        border-radius: 10px;
        background: var(--bg);
        border: 1px solid var(--line);
      }
      dt {
        font-size: 12px;
        color: var(--muted);
      }
      dd {
        margin: 0;
        font-size: 14px;
        font-weight: 600;
        color: var(--ink);
      }
      .rec dd {
        color: var(--e-green-text);
      }
      .rem dd {
        color: var(--e-red-text);
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
    .cols {
      display: grid;
      grid-template-columns: minmax(0, 1.15fr) minmax(0, 1fr);
      gap: 16px;
      align-items: start;
    }
    h4 {
      font-size: 14px;
    }
    .new {
      display: grid;
      gap: 12px;
      padding: 14px;
      border-radius: var(--r-inner);
      border: 1px solid var(--line);
      background: var(--bg);
    }
    .new-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 8px;

      .no {
        margin-left: 6px;
        font-size: 12px;
        font-weight: 400;
        color: var(--muted);
      }
      .seg button {
        height: 30px;
        font-size: 12.5px;
        padding: 0 11px;
      }
    }
    .row2 {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
      gap: 10px;

      .select {
        height: 44px;
        font-size: 14px;
        background-color: var(--surface);
      }
    }
    .items {
      width: 100%;
      border-collapse: collapse;
      font-size: 13px;

      th {
        padding: 6px 6px;
        font-size: 12px;
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        color: var(--muted);
        text-align: left;
        border-bottom: 1px solid var(--line);
      }
      td {
        padding: 6px 6px;
        border-bottom: 1px solid var(--line);
        vertical-align: middle;
      }
      .r {
        text-align: right;
      }
      .sys td {
        color: var(--ink-2);
      }
    }
    .ty {
      padding: 1px 8px;
      border-radius: 999px;
      font-size: 12px;
      background: var(--surface-2);
      color: var(--ink-2);
      white-space: nowrap;
    }
    .ty-d {
      background: var(--e-green-soft);
      color: var(--e-green-text);
    }
    .ty-t {
      background: var(--e-amber-soft);
      color: var(--e-amber-text);
    }
    .amt {
      width: 92px;
      height: 32px;
      padding: 0 8px;
      border-radius: 8px;
      border: 1px solid var(--line);
      background: var(--surface);
      text-align: right;
      font-size: 13px;
      color: var(--ink);

      &:focus-visible {
        outline: 2px solid var(--focus);
        outline-offset: 1px;
      }
    }
    .icon-x {
      position: relative;
      display: grid;
      place-items: center;
      width: 30px;
      height: 30px;
      border-radius: 8px;
      color: var(--muted);
      font-size: 14px;

      &::before {
        content: '';
        position: absolute;
        inset: -7px;
      }
      &:hover:not([disabled]) {
        background: var(--e-red-soft);
        color: var(--e-red-text);
      }
      &[disabled] {
        opacity: 0.35;
        cursor: not-allowed;
      }
    }
    .adders {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 10px 16px;
    }
    .add-svc {
      display: flex;
      align-items: center;
      gap: 8px;
      flex: 1 1 240px;

      .select {
        height: 36px;
        font-size: 13px;
        padding-left: 14px;
        background-color: var(--surface);
      }
    }
    .add-opts {
      display: flex;
      align-items: center;
      gap: 14px;

      .check {
        align-items: center;
        min-height: 44px;
        font-size: 13px;

        input {
          margin: 0;
          accent-color: var(--e-blue);
        }
      }
    }
    .pct {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      color: var(--ink-2);

      .amt {
        width: 64px;
      }
    }
    .sum {
      display: grid;
      gap: 4px;
      margin: 0;
      padding-top: 8px;
      border-top: 1px dashed var(--line-strong);

      div {
        display: flex;
        justify-content: space-between;
        font-size: 13px;
        color: var(--ink-2);
      }
      dd {
        margin: 0;
      }
      .tot {
        padding-top: 4px;
        font-size: 15px;
        font-weight: 600;
        color: var(--ink);
      }
    }
    .send {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 6px 16px;

      .check {
        align-items: center;
        min-height: 44px;
        font-size: 13px;

        input {
          margin: 0;
          accent-color: var(--e-blue);
        }
      }
      .date {
        flex: 1 1 100%;
        max-width: 220px;

        .input {
          height: 40px;
          font-size: 13px;
          background: var(--surface);
        }
      }
      .foot {
        flex: 1 1 100%;
        font-size: 12px;
        color: var(--muted);
      }
    }
    .list {
      display: grid;
      gap: 10px;

      ul {
        display: grid;
        gap: 8px;
      }
      li {
        display: grid;
        gap: 8px;
        padding: 12px;
        border-radius: var(--r-inner);
        border: 1px solid var(--line);
        background: var(--surface);
      }
    }
    .v-top {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .v-id {
      flex: 1;
      min-width: 0;
      display: grid;

      b {
        font-size: 12.5px;
      }
      span {
        font-size: 12.5px;
        color: var(--muted);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;

        /* Phones: wrap the account name rather than cut it */
        @media (max-width: 480px) {
          white-space: normal;
        }
      }
    }
    .v-amt {
      font-size: 13.5px;
      font-weight: 600;
    }
    .st {
      padding: 2px 9px;
      border-radius: 999px;
      font-size: 12px;
      font-weight: 500;
      white-space: nowrap;
      background: var(--surface-2);
      color: var(--ink-2);
    }
    [data-s='paid'] .st {
      background: var(--e-green-soft);
      color: var(--e-green-text);
    }
    [data-s='unpaid'] .st {
      background: var(--e-amber-soft);
      color: var(--e-amber-text);
    }
    [data-s='overdue'] .st {
      background: var(--e-red-soft);
      color: var(--e-red-text);
    }
    [data-s='scheduled'] .st {
      background: var(--e-blue-soft);
      color: var(--e-blue-text);
    }
    .proof,
    .reminded {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      color: var(--ink-2);
    }
    .proof::before {
      content: '';
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: var(--e-blue);
    }
    .v-acts {
      display: flex;
      flex-wrap: wrap;
      justify-content: flex-end;
      gap: 8px;
    }
    .remind {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 4px 14px;
      margin: 0;
      padding: 10px 12px;
      border: 0;
      border-radius: 10px;
      background: var(--surface-2);

      legend {
        float: left;
        width: 100%;
        font-size: 12px;
        font-weight: 500;
        color: var(--ink-2);
      }
      .check {
        align-items: center;
        min-height: 36px;
        font-size: 12.5px;

        input {
          margin: 0;
          accent-color: var(--e-blue);
        }
      }
    }
    .sample {
      font-size: 12px;
      color: var(--muted);
      min-height: 14px;
    }
    @media (max-width: 900px) {
      .cols {
        grid-template-columns: 1fr;
      }
    }
    // Phones: the counters take their own row, three across, under the title and reset.
    @media (max-width: 640px) {
      .counters {
        order: 3;
        flex: 1 1 100%;
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));

        div {
          padding: 6px 8px;
        }
        dd {
          font-size: 12.5px;
        }
      }
    }
    @media (max-width: 460px) {
      .inv {
        padding: 14px;
      }
      .new {
        padding: 12px;
      }
      .items th:nth-child(2),
      .items td:nth-child(2) {
        display: none;
      }
      .amt {
        width: 78px;
      }
    }
  `,
})
export class EpractiseInvoiceDemo {
  protected readonly accounts = ACCOUNTS;
  protected readonly services = SERVICES;
  protected readonly periods = PERIODS;
  protected readonly channels = CHANNELS;
  protected readonly tax = TAX;
  protected readonly label = LABEL;

  protected readonly invoices = signal<Invoice[]>(SEED);
  protected readonly lines = signal<Line[]>(SEED_LINES);
  protected readonly kind = signal<Kind>('one-time');
  protected readonly account = signal(ACCOUNTS[0]);
  protected readonly period = signal(PERIODS[0]);
  protected readonly pick = signal(SERVICES[2].t);
  protected readonly discountPct = signal(10);
  protected readonly taxOn = signal(true);
  protected readonly email = signal(true);
  protected readonly schedule = signal(false);
  protected readonly sendDate = signal('2026-11-02');
  protected readonly reminding = signal<string | null>(null);
  protected readonly via = signal<string[]>(['Email', 'Push notification']);
  protected readonly note = signal('Sample invoices. Build one, or act on the list.');
  private seq = 30458;
  private lineId = 3;

  protected readonly nextNo = computed(() => `INV-${this.seq + this.invoices().length - SEED.length}`);
  // The real model: items total, discount as a share of it, tax as a rate on it, total = items + tax - discount.
  protected readonly subtotal = computed(() => this.lines().reduce((a, l) => a + l.amount, 0));
  protected readonly discount = computed(() => (this.subtotal() * this.discountPct()) / 100);
  protected readonly taxAmount = computed(() => (this.taxOn() ? (this.subtotal() * TAX.rate) / 100 : 0));
  protected readonly total = computed(() => this.subtotal() + this.taxAmount() - this.discount());
  protected readonly totals = computed(() => {
    const l = this.invoices();
    const sum = (f: (v: Invoice) => boolean) => l.filter(f).reduce((a, v) => a + v.total, 0);
    return { all: sum(() => true), paid: sum((v) => v.status === 'paid'), open: sum((v) => v.status !== 'paid') };
  });

  protected fmt(n: number): string {
    return money.format(Math.round(n * 100) / 100);
  }

  protected setAmount(id: number, raw: string): void {
    const amount = Math.max(0, Number(raw) || 0);
    this.lines.update((l) => l.map((x) => (x.id === id ? { ...x, amount } : x)));
  }

  protected setDiscount(raw: string): void {
    this.discountPct.set(Math.min(50, Math.max(0, Number(raw) || 0)));
  }

  protected addLine(): void {
    const s = SERVICES.find((x) => x.t === this.pick()) ?? SERVICES[0];
    this.lines.update((l) => [...l, { id: this.lineId++, service: s.t, amount: s.amount }]);
    this.note.set(`${s.t} added at ${this.fmt(s.amount)}. Discount and tax follow.`);
  }

  protected removeLine(id: number): void {
    if (this.lines().length === 1) return;
    this.lines.update((l) => l.filter((x) => x.id !== id));
  }

  protected create(e: Event): void {
    e.preventDefault();
    const no = this.nextNo();
    const scheduled = this.schedule();
    const inv: Invoice = { no, account: this.account(), total: Math.round(this.total() * 100) / 100, status: scheduled ? 'scheduled' : 'unpaid', kind: this.kind() };
    this.invoices.update((l) => [inv, ...l]);
    const how = scheduled ? `scheduled for ${this.sendDate()}` : this.email() ? 'sent and emailed to the client' : 'created, waiting in the portal';
    this.note.set(`${no} for ${inv.account}, ${this.fmt(inv.total)}${this.kind() === 'recurring' ? `, ${this.period().toLowerCase()}` : ''}: ${how}.`);
    this.lines.set(SEED_LINES);
  }

  private patch(no: string, p: Partial<Invoice>): void {
    this.invoices.update((l) => l.map((v) => (v.no === no ? { ...v, ...p } : v)));
  }

  protected sendNow(no: string): void {
    this.patch(no, { status: 'unpaid' });
    this.note.set(`${no} sent now. It shows as unpaid until the client pays.`);
  }

  protected clientProof(no: string): void {
    this.patch(no, { proof: true });
    this.reminding.set(null);
    this.note.set(`The client uploaded proof of payment for ${no}. Confirm or discard it.`);
  }

  protected confirm(no: string): void {
    this.patch(no, { status: 'paid', proof: false, reminded: undefined });
    this.note.set(`Proof confirmed: ${no} is paid and moves to received.`);
  }

  protected discard(no: string): void {
    this.patch(no, { proof: false });
    this.note.set(`Proof for ${no} discarded. The invoice stays open.`);
  }

  protected toggleRemind(no: string): void {
    this.reminding.set(this.reminding() === no ? null : no);
  }

  protected toggleVia(ch: string): void {
    this.via.update((v) => (v.includes(ch) ? v.filter((x) => x !== ch) : [...v, ch]));
  }

  protected setReminder(no: string): void {
    const via = CHANNELS.filter((c) => this.via().includes(c)).join(', ').toLowerCase();
    this.patch(no, { reminded: via });
    this.reminding.set(null);
    this.note.set(`Reminder for ${no} set by ${via}.`);
  }

  protected reset(): void {
    this.invoices.set(SEED);
    this.lines.set(SEED_LINES);
    this.kind.set('one-time');
    this.account.set(ACCOUNTS[0]);
    this.period.set(PERIODS[0]);
    this.discountPct.set(10);
    this.taxOn.set(true);
    this.email.set(true);
    this.schedule.set(false);
    this.reminding.set(null);
    this.via.set(['Email', 'Push notification']);
    this.note.set('Sample invoices reset.');
  }
}
