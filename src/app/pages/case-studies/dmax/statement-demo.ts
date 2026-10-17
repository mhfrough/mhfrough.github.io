import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  phosphorArrowCounterClockwise,
  phosphorDownloadSimple,
  phosphorPaperPlaneTilt,
  phosphorReceipt,
} from '@ng-icons/phosphor-icons/regular';
import { int, saveText } from './dmax.data';

/**
 * The statements app, as my own mockup with an invented account. It follows the real screens: one account looked up
 * by account number, old account number or IBAN over a date range, opening and closing balances with debit and
 * credit totals, a screen that stops at 1,000 entries while the file carries all of them; and bulk statements, where
 * a list of accounts is submitted, the page checks the status every 15 seconds and the file downloads once it is
 * ready. The bulk wait is sped up here, and the downloads are CSV made in the browser from invented entries.
 */
type Tab = 'one' | 'bulk';
type IdType = 'account' | 'old' | 'iban';
type BulkState = 'idle' | 'working' | 'ready';

interface Entry {
  date: string;
  text: string;
  debit: number;
  credit: number;
  balance: number;
}

const ID_TYPES: { id: IdType; label: string; sample: string }[] = [
  { id: 'account', label: 'Account number', sample: '1029384756' },
  { id: 'old', label: 'Old account', sample: '0042-118203-01' },
  { id: 'iban', label: 'IBAN', sample: 'PK00DEMO0000001029384756' },
];

const TEXTS = ['Salary credit', 'Utility bill', 'Card purchase', 'Branch cash', 'Online transfer', 'Cheque deposit'];
const OPENING = 248_350.75;
const SCREEN_CAP = 1000;
const SHOWN_ROWS = 6;
const MIN_DATE = '2023-01-01';
const MAX_DATE = '2026-09-30';
const DAY = 86_400_000;
// Nine months by default: just over 1,000 entries, so the screen cap shows on first sight.
const FROM_DEFAULT = '2026-01-01';
const TO_DEFAULT = '2026-09-30';
const BULK_ACCOUNTS = ['1029384756', '1029384811', '1029385020', '1029385347', '1029386102'].join('\n');
/** Real interval between status checks, and the sped-up one this sample uses. */
const CHECK_EVERY = 15;
const DEMO_TICK_MS = 250;

const utc = (d: string) => Date.parse(d + 'T00:00:00Z');
const iso = (t: number) => new Date(t).toISOString().slice(0, 10);
const money = (n: number) => n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** Invented entries for every day in the range: two to six a day, debits and credits mixed, a running balance. */
function entries(from: string, to: string): Entry[] {
  const out: Entry[] = [];
  let balance = OPENING;
  for (let t = utc(from), d = 0; t <= utc(to); t += DAY, d++) {
    const count = 2 + ((d * 7) % 5);
    for (let k = 0; k < count; k++) {
      const n = d * 31 + k * 17;
      const amount = ((n * 48271) % 1_800_000) / 100 + 150;
      const credit = n % 2 === 0;
      balance += credit ? amount : -amount;
      out.push({ date: iso(t), text: TEXTS[n % TEXTS.length], debit: credit ? 0 : amount, credit: credit ? amount : 0, balance });
    }
  }
  return out;
}

@Component({
  selector: 'mh-dmax-statement',
  imports: [NgIcon],
  viewProviders: [provideIcons({ phosphorArrowCounterClockwise, phosphorDownloadSimple, phosphorPaperPlaneTilt, phosphorReceipt })],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="stmt card">
      <div class="bar">
        <div class="seg" role="group" aria-label="Statement type">
          <button type="button" [attr.aria-pressed]="tab() === 'one'" (click)="tab.set('one')">One account</button>
          <button type="button" [attr.aria-pressed]="tab() === 'bulk'" (click)="tab.set('bulk')">Bulk list</button>
        </div>
        <button type="button" class="icon-btn" aria-label="Reset the sample statements" (click)="reset()">
          <ng-icon name="phosphorArrowCounterClockwise" aria-hidden="true" />
        </button>
      </div>

      @if (tab() === 'one') {
        <form class="form" (submit)="$event.preventDefault(); generate()">
          <div class="field">
            <span class="field__label" id="dx-idtype">Look up by</span>
            <div class="seg ids" role="group" aria-labelledby="dx-idtype">
              @for (t of idTypes; track t.id) {
                <button type="button" [attr.aria-pressed]="idType() === t.id" (click)="pickId(t.id)">{{ t.label }}</button>
              }
            </div>
          </div>
          <div class="field">
            <label for="dx-acc">{{ idLabel() }}</label>
            <input id="dx-acc" class="input mono" [value]="accountNo()" autocomplete="off" spellcheck="false"
              [attr.aria-invalid]="!accountNo().trim()" [attr.aria-describedby]="!accountNo().trim() ? 'dx-acc-err' : null"
              (input)="accountNo.set($any($event.target).value)" />
            @if (!accountNo().trim()) {
              <span class="field__error" id="dx-acc-err">Enter the {{ idLabel().toLowerCase() }}.</span>
            }
          </div>
          <div class="dates">
            <div class="field">
              <label for="dx-from">From</label>
              <input id="dx-from" type="date" class="input" [min]="minDate" [max]="maxDate" [value]="from()"
                (change)="from.set($any($event.target).value)" />
            </div>
            <div class="field">
              <label for="dx-to">To</label>
              <input id="dx-to" type="date" class="input" [min]="minDate" [max]="maxDate" [value]="to()"
                [attr.aria-invalid]="!!rangeError()" [attr.aria-describedby]="rangeError() ? 'dx-range-err' : null"
                (change)="to.set($any($event.target).value)" />
            </div>
          </div>
          @if (rangeError(); as e) {
            <span class="field__error" id="dx-range-err">{{ e }}</span>
          }
          <button type="submit" class="btn btn-solid" [disabled]="!!rangeError() || !accountNo().trim()">
            <ng-icon name="phosphorReceipt" aria-hidden="true" /> Generate statement
          </button>
        </form>

        @if (result(); as r) {
          <section class="paper" aria-label="Sample statement">
            <header class="p-head">
              <div>
                <h3>Sample Trading Co</h3>
                <p class="mono">{{ r.label }} {{ r.id }} · PKR · {{ r.from }} to {{ r.to }}</p>
              </div>
              <button type="button" class="btn btn-ghost btn-sm" (click)="downloadOne()">
                <ng-icon name="phosphorDownloadSimple" aria-hidden="true" /> CSV, {{ int(r.rows.length) }} rows
              </button>
            </header>
            <dl class="sum">
              <div><dt>Opening</dt><dd class="mono">{{ money(opening) }}</dd></div>
              <div><dt>Debits, {{ int(r.debits) }}</dt><dd class="mono">{{ money(r.debitTotal) }}</dd></div>
              <div><dt>Credits, {{ int(r.credits) }}</dt><dd class="mono">{{ money(r.creditTotal) }}</dd></div>
              <div><dt>Closing</dt><dd class="mono">{{ money(r.closing) }}</dd></div>
            </dl>
            <div class="scroll" tabindex="0" role="region" aria-label="First statement entries">
              <table class="tbl">
                <caption class="sr-only">First {{ shownRows }} entries of the sample statement</caption>
                <thead>
                  <tr>
                    <th scope="col">Date</th>
                    <th scope="col">Particulars</th>
                    <th scope="col" class="num">Debit</th>
                    <th scope="col" class="num">Credit</th>
                    <th scope="col" class="num">Balance</th>
                  </tr>
                </thead>
                <tbody>
                  @for (e of r.rows.slice(0, shownRows); track $index) {
                    <tr>
                      <td class="mono">{{ e.date }}</td>
                      <td>{{ e.text }}</td>
                      <td class="num mono">{{ e.debit ? money(e.debit) : '' }}</td>
                      <td class="num mono cr">{{ e.credit ? money(e.credit) : '' }}</td>
                      <td class="num mono">{{ money(e.balance) }}</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
            @if (r.rows.length > cap) {
              <p class="cap" role="status">
                Showing the first {{ int(cap) }} of {{ int(r.rows.length) }} entries on screen. The PDF and CSV carry every one.
              </p>
            } @else {
              <p class="cap ok" role="status">All {{ int(r.rows.length) }} entries fit on screen.</p>
            }
          </section>
        }
      } @else {
        <form class="form" (submit)="$event.preventDefault(); submitBulk()">
          <div class="field">
            <label for="dx-list">Accounts, one per line</label>
            <textarea id="dx-list" class="textarea mono" rows="5" spellcheck="false" [value]="bulkList()"
              aria-describedby="dx-list-hint" (input)="bulkList.set($any($event.target).value)"></textarea>
            <span class="field__hint" id="dx-list-hint">
              {{ bulkCount() }} accounts, {{ from() }} to {{ to() }}. The real app takes the list as an uploaded text file.
            </span>
          </div>
          <button type="submit" class="btn btn-solid" [disabled]="bulk() === 'working' || !bulkCount() || !!rangeError()">
            <ng-icon name="phosphorPaperPlaneTilt" aria-hidden="true" /> Submit bulk request
          </button>
        </form>

        <div class="status" [attr.data-s]="bulk()" role="status">
          @switch (bulk()) {
            @case ('idle') {
              <p>No bulk request running. Submit the list to start one.</p>
            }
            @case ('working') {
              <p>Processing, please wait. Status check {{ checks() + 1 }}, next in {{ nextCheck() }} s.</p>
              <span class="track" aria-hidden="true"><i [style.width.%]="(checks() / 3) * 100"></i></span>
            }
            @case ('ready') {
              <p>Download ready: {{ bulkCount() }} statements in one file.</p>
              <button type="button" class="btn btn-solid btn-sm" (click)="downloadBulk()">
                <ng-icon name="phosphorDownloadSimple" aria-hidden="true" /> Download file
              </button>
            }
          }
        </div>
        <p class="mono foot">The app checks every {{ checkEvery }} s and downloads the file by itself, once. Sped up here.</p>
      }
    </div>
  `,
  styles: `
    :host {
      display: block;
    }
    .stmt {
      display: grid;
      gap: 14px;
      padding: 16px;
      background: var(--d-card);
    }
    .bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;

      .seg {
        background: var(--bg);
      }
      .seg button {
        height: 34px;
        font-size: 13px;
      }
      .seg [aria-pressed='true'] {
        background: var(--surface-2);
      }
      .icon-btn {
        width: 44px;
        height: 44px;
        background: var(--bg);
        font-size: 17px;
      }
    }
    .form {
      display: grid;
      gap: 12px;

      .input,
      .textarea {
        background: var(--bg);
      }
      .textarea {
        min-height: 120px;
        font-size: 13px;
      }
      .input[aria-invalid='true'] {
        border-color: var(--d-red-text);
      }
      .field__error {
        color: var(--d-red-text);
      }
      > .btn {
        justify-self: start;
      }
    }
    .ids {
      background: var(--bg);
      max-width: 100%;
      overflow-x: auto;

      button {
        height: 34px;
        font-size: 13px;
        white-space: nowrap;
      }
      [aria-pressed='true'] {
        background: var(--surface-2);
      }
    }
    .dates {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 10px;

      .input {
        padding: 0 14px;
        font-size: 14px;
        color-scheme: dark;
      }
    }
    .paper {
      display: grid;
      gap: 12px;
      padding: 14px;
      border-radius: var(--r-inner);
      background: var(--bg);
      border: 1px solid var(--line);
      min-width: 0;
    }
    .p-head {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 10px;

      h3 {
        font-size: 15px;
      }
      p {
        margin-top: 2px;
        font-size: 12px;
        color: var(--muted);
        overflow-wrap: anywhere;
      }
      .btn-sm {
        height: 44px;
      }
    }
    .sum {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 6px;
      margin: 0;

      div {
        padding: 8px 10px;
        border-radius: 10px;
        background: var(--surface);
        min-width: 0;
      }
      dt {
        font-size: 12px;
        color: var(--muted);
      }
      dd {
        margin: 2px 0 0;
        font-size: 13px;
        font-weight: 500;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }
    .scroll {
      overflow-x: auto;
      /* Scroll shadows: an edge darkens only while more columns sit past it */
      background:
        linear-gradient(to right, var(--bg), transparent) left / 24px 100% no-repeat local,
        linear-gradient(to left, var(--bg), transparent) right / 24px 100% no-repeat local,
        radial-gradient(farthest-side at 0 50%, rgb(0 0 0 / 0.5), transparent) left / 12px 100% no-repeat scroll,
        radial-gradient(farthest-side at 100% 50%, rgb(0 0 0 / 0.5), transparent) right / 12px 100% no-repeat scroll;

      &:focus-visible {
        outline: 2px solid var(--focus);
        outline-offset: 2px;
      }
    }
    .tbl {
      width: 100%;
      min-width: 480px;
      border-collapse: collapse;
      font-size: 12.5px;

      th,
      td {
        padding: 7px 6px;
        border-top: 1px solid var(--line);
        text-align: left;
        white-space: nowrap;
      }
      thead th {
        border-top: 0;
        font-size: 12px;
        font-weight: 400;
        color: var(--muted);
      }
      .mono {
        font-size: 12px;
      }
      .num {
        text-align: right;
      }
      .cr {
        color: var(--d-green-text);
      }
    }
    .cap {
      padding: 8px 12px;
      border-radius: 10px;
      font-size: 12.5px;
      background: var(--d-amber-soft);
      color: var(--d-amber-text);

      &.ok {
        background: var(--d-green-soft);
        color: var(--d-green-text);
      }
    }
    .status {
      display: grid;
      gap: 10px;
      padding: 12px 14px;
      border-radius: var(--r-inner);
      background: var(--bg);
      border: 1px solid var(--line);
      font-size: 13.5px;

      &[data-s='working'] {
        border-color: var(--d-blue);
      }
      &[data-s='ready'] {
        border-color: var(--d-green);
      }
      .btn-sm {
        justify-self: start;
        height: 44px;
      }
    }
    .track {
      display: block;
      height: 4px;
      border-radius: 2px;
      background: var(--surface-2);
      overflow: hidden;

      i {
        display: block;
        height: 100%;
        background: var(--d-gradient);
      }
    }
    @media (prefers-reduced-motion: no-preference) {
      .track i {
        transition: width 0.4s var(--ease);
      }
    }
    .foot {
      font-size: 12px;
      color: var(--muted);
    }
    @media (max-width: 560px) {
      .stmt {
        padding: 12px;
      }
      .sum {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
      .dates {
        grid-template-columns: 1fr;
      }
    }
    /* Smallest phones: full figures, never an ellipsis on money */
    @media (max-width: 374px) {
      .sum {
        div {
          padding: 8px;
        }
        dd {
          font-size: 12.5px;
          white-space: normal;
          overflow-wrap: anywhere;
        }
      }
    }
  `,
})
export class DmaxStatementDemo {
  protected readonly idTypes = ID_TYPES;
  protected readonly int = int;
  protected readonly money = money;
  protected readonly opening = OPENING;
  protected readonly cap = SCREEN_CAP;
  protected readonly shownRows = SHOWN_ROWS;
  protected readonly minDate = MIN_DATE;
  protected readonly maxDate = MAX_DATE;
  protected readonly checkEvery = CHECK_EVERY;

  protected readonly tab = signal<Tab>('one');
  protected readonly idType = signal<IdType>('account');
  protected readonly accountNo = signal(ID_TYPES[0].sample);
  protected readonly from = signal(FROM_DEFAULT);
  protected readonly to = signal(TO_DEFAULT);
  protected readonly bulkList = signal(BULK_ACCOUNTS);
  protected readonly bulk = signal<BulkState>('idle');
  protected readonly checks = signal(0);
  protected readonly nextCheck = signal(CHECK_EVERY);
  protected readonly result = signal<{
    id: string;
    label: string;
    from: string;
    to: string;
    rows: Entry[];
    debits: number;
    credits: number;
    debitTotal: number;
    creditTotal: number;
    closing: number;
  } | null>(null);

  protected readonly idLabel = computed(() => ID_TYPES.find((t) => t.id === this.idType())?.label ?? '');
  protected readonly bulkCount = computed(() => this.bulkList().split(/\s+/).filter(Boolean).length);
  protected readonly rangeError = computed(() => {
    const from = this.from();
    const to = this.to();
    if (!from || !to) return 'Pick both dates.';
    if (utc(to) < utc(from)) return 'The end date is before the start date.';
    return '';
  });

  private timer: ReturnType<typeof setInterval> | undefined;

  constructor() {
    inject(DestroyRef).onDestroy(() => clearInterval(this.timer));
    this.generate();
  }

  protected pickId(id: IdType): void {
    this.idType.set(id);
    this.accountNo.set(ID_TYPES.find((t) => t.id === id)?.sample ?? '');
  }

  protected generate(): void {
    if (this.rangeError() || !this.accountNo().trim()) return;
    const rows = entries(this.from(), this.to());
    const debit = rows.filter((e) => e.debit);
    const credit = rows.filter((e) => e.credit);
    this.result.set({
      id: this.accountNo().trim(),
      label: this.idLabel(),
      from: this.from(),
      to: this.to(),
      rows,
      debits: debit.length,
      credits: credit.length,
      debitTotal: debit.reduce((s, e) => s + e.debit, 0),
      creditTotal: credit.reduce((s, e) => s + e.credit, 0),
      closing: rows.length ? rows[rows.length - 1].balance : OPENING,
    });
  }

  protected downloadOne(): void {
    const r = this.result();
    if (!r) return;
    const lines = ['DATE,PARTICULARS,DEBIT,CREDIT,BALANCE'];
    for (const e of r.rows) lines.push([e.date, e.text, e.debit.toFixed(2), e.credit.toFixed(2), e.balance.toFixed(2)].join(','));
    saveText(`dmax-sample-statement-${r.from}-to-${r.to}.csv`, lines.join('\n') + '\n');
  }

  protected submitBulk(): void {
    if (this.bulk() === 'working') return;
    clearInterval(this.timer);
    this.bulk.set('working');
    this.checks.set(0);
    this.nextCheck.set(CHECK_EVERY);
    // Each sample tick stands for one second of the real 15 s wait; the third status check comes back ready.
    this.timer = setInterval(() => {
      if (this.nextCheck() > 1) {
        this.nextCheck.update((n) => n - 1);
        return;
      }
      this.checks.update((c) => c + 1);
      this.nextCheck.set(CHECK_EVERY);
      if (this.checks() >= 3) {
        clearInterval(this.timer);
        this.bulk.set('ready');
      }
    }, DEMO_TICK_MS);
  }

  protected downloadBulk(): void {
    const accounts = this.bulkList().split(/\s+/).filter(Boolean);
    const lines = ['ACCOUNT_NO,FROM,TO,OPENING,CLOSING,ENTRIES'];
    accounts.forEach((a, i) => {
      const rows = entries(this.from(), this.to());
      const closing = rows.length ? rows[rows.length - 1].balance + i * 1250 : OPENING;
      lines.push([a, this.from(), this.to(), (OPENING + i * 1250).toFixed(2), closing.toFixed(2), rows.length].join(','));
    });
    saveText(`dmax-sample-bulk-statement.txt`, lines.join('\n') + '\n', 'text/plain');
  }

  protected reset(): void {
    clearInterval(this.timer);
    this.tab.set('one');
    this.idType.set('account');
    this.accountNo.set(ID_TYPES[0].sample);
    this.from.set(FROM_DEFAULT);
    this.to.set(TO_DEFAULT);
    this.bulkList.set(BULK_ACCOUNTS);
    this.bulk.set('idle');
    this.checks.set(0);
    this.generate();
  }
}
