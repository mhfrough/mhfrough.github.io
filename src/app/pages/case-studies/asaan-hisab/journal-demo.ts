import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { phosphorArrowCounterClockwise, phosphorCheck, phosphorPlus, phosphorWarningCircle, phosphorX } from '@ng-icons/phosphor-icons/regular';
import { ACCOUNTS, account, accountsOf, money, parseAmount } from './books';

/**
 * Hero mockup of the Asaan Hisab transactions panel (my own redraw, not a screenshot). It keeps the app's two
 * ideas: an owner records income or an expense in plain words, split across categories if needed, and the app
 * posts the debits and credits underneath; an accountant can write the journal entry by hand, and it only saves
 * when debits equal credits. Amounts group thousands as you type, like the app's masked fields. Sample accounts.
 */
type Mode = 'income' | 'expense' | 'journal';

interface Row {
  code: number;
  amt: number;
}

const SEED: Record<Mode, { acc: number; rows: Row[]; credits?: Row[]; text: string }> = {
  income: { acc: 1002, rows: [{ code: 4001, amt: 30000 }, { code: 4002, amt: 15000 }], text: 'Logo design and a workshop' },
  expense: { acc: 1001, rows: [{ code: 5003, amt: 12500 }], text: 'Electricity bill' },
  journal: { acc: 0, rows: [{ code: 2001, amt: 24000 }], credits: [{ code: 1002, amt: 20000 }], text: 'Supplier paid from the bank' },
};

const MAX_ROWS = 3;

@Component({
  selector: 'mh-ah-journal',
  imports: [NgIcon],
  viewProviders: [provideIcons({ phosphorArrowCounterClockwise, phosphorCheck, phosphorPlus, phosphorWarningCircle, phosphorX })],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="tx card card--lift">
      <header class="tx-head">
        <img src="/images/asaan-hisab/asaan-hisab-mark.webp" width="34" height="32" alt="" />
        <div>
          <h2>Transactions</h2>
          <p><b class="mono">{{ saved() }}</b> entries saved, books in balance</p>
        </div>
        <button type="button" class="reset" aria-label="Reset the sample transaction" (click)="reset()">
          <ng-icon name="phosphorArrowCounterClockwise" aria-hidden="true" />
        </button>
      </header>

      <div class="seg" role="group" aria-label="Transaction type">
        <button type="button" [attr.aria-pressed]="mode() === 'income'" (click)="setMode('income')">Add income</button>
        <button type="button" [attr.aria-pressed]="mode() === 'expense'" (click)="setMode('expense')">Add expense</button>
        <button type="button" [attr.aria-pressed]="mode() === 'journal'" (click)="setMode('journal')">Journal entry</button>
      </div>

      <div class="field">
        <label for="ah-tx-text">Description</label>
        <input id="ah-tx-text" class="input" maxlength="60" [value]="text()" (input)="text.set($any($event.target).value)" />
      </div>

      @if (mode() !== 'journal') {
        <div class="field">
          <label for="ah-tx-acc">{{ mode() === 'income' ? 'Deposit to' : 'Paid from' }}</label>
          <select id="ah-tx-acc" class="select" (change)="acc.set(+$any($event.target).value)">
            @for (a of moneyAccounts; track a.code) {
              <option [value]="a.code" [selected]="a.code === acc()">{{ a.name }}</option>
            }
          </select>
        </div>

        <fieldset class="rows">
          <legend>{{ rows().length > 1 ? 'Split across categories' : 'Category' }}</legend>
          @for (r of rows(); track $index; let i = $index) {
            <div class="row">
              <select class="select" [attr.aria-label]="'Category ' + (i + 1)" (change)="setRow('rows', i, 'code', $event)">
                @for (a of categories(); track a.code) {
                  <option [value]="a.code" [selected]="a.code === r.code">{{ a.name }}</option>
                }
              </select>
              <input class="input amt mono" inputmode="numeric" [attr.aria-label]="'Amount for category ' + (i + 1)" [value]="fmt(r.amt)" (input)="setRow('rows', i, 'amt', $event)" />
              @if (rows().length > 1) {
                <button type="button" class="rm" [attr.aria-label]="'Remove category ' + (i + 1)" (click)="remove('rows', i)"><ng-icon name="phosphorX" aria-hidden="true" /></button>
              }
            </div>
          }
          <div class="row-foot">
            <button type="button" class="add" [disabled]="rows().length >= max" (click)="add('rows')"><ng-icon name="phosphorPlus" aria-hidden="true" /> Split</button>
            <span>Total <b class="mono">Rs {{ fmt(debitTotal()) }}</b></span>
          </div>
        </fieldset>

        <div class="posted" aria-label="Posted to the ledger as">
          <p class="mono lbl">Posted as</p>
          @for (l of posting(); track $index) {
            <p class="mono line" [class.cr]="l.side === 'Cr'">
              <span>{{ l.side }}</span><span class="nm">{{ l.code }} {{ l.name }}</span><span>{{ fmt(l.amt) }}</span>
            </p>
          }
        </div>
      } @else {
        @for (side of sides; track side.key) {
          <fieldset class="rows">
            <legend>{{ side.label }}</legend>
            @for (r of side.key === 'rows' ? rows() : credits(); track $index; let i = $index) {
              <div class="row">
                <select class="select" [attr.aria-label]="side.one + ' account ' + (i + 1)" (change)="setRow(side.key, i, 'code', $event)">
                  @for (a of all; track a.code) {
                    <option [value]="a.code" [selected]="a.code === r.code">{{ a.code }} {{ a.name }}</option>
                  }
                </select>
                <input class="input amt mono" inputmode="numeric" [attr.aria-label]="side.one + ' amount ' + (i + 1)" [value]="fmt(r.amt)" (input)="setRow(side.key, i, 'amt', $event)" />
                @if ((side.key === 'rows' ? rows() : credits()).length > 1) {
                  <button type="button" class="rm" [attr.aria-label]="'Remove ' + side.one.toLowerCase() + ' ' + (i + 1)" (click)="remove(side.key, i)"><ng-icon name="phosphorX" aria-hidden="true" /></button>
                }
              </div>
            }
            <div class="row-foot">
              <button type="button" class="add" [disabled]="(side.key === 'rows' ? rows() : credits()).length >= max" (click)="add(side.key)">
                <ng-icon name="phosphorPlus" aria-hidden="true" /> Add {{ side.one.toLowerCase() }}
              </button>
              <span>Total <b class="mono">{{ fmt(side.key === 'rows' ? debitTotal() : creditTotal()) }}</b></span>
            </div>
          </fieldset>
        }
        <p class="status" [class.ok]="balanced()" role="status">
          <ng-icon [name]="balanced() ? 'phosphorCheck' : 'phosphorWarningCircle'" aria-hidden="true" />
          @if (balanced()) {
            Balanced at Rs {{ fmt(debitTotal()) }}
          } @else {
            Out by Rs {{ fmt(gap()) }}: debits and credits must match
          }
        </p>
      }

      <button type="button" class="btn btn-solid save" [disabled]="!canSave()" (click)="save()">Save transaction</button>
      <p class="mono sample" aria-live="polite">{{ note() }}</p>
    </div>
  `,
  styles: `
    :host {
      display: block;
    }
    .tx {
      display: grid;
      gap: 12px;
      padding: 18px;
    }
    .tx-head {
      display: flex;
      align-items: center;
      gap: 12px;
      padding-bottom: 12px;
      border-bottom: 1px solid var(--line);

      div {
        flex: 1;
      }
      h2 {
        font-size: 16px;
      }
      p {
        font-size: 12.5px;
        color: var(--muted);
      }
      b {
        color: var(--ink);
        font-weight: 600;
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
    .seg {
      flex-wrap: wrap;
      justify-self: start;

      button {
        height: 34px;
        padding: 0 12px;
        font-size: 13px;
      }
    }
    .field label,
    legend {
      font-size: 12.5px;
      font-weight: 500;
      color: var(--ink-2);
    }
    .field .input,
    .field .select {
      height: 44px;
      font-size: 14px;
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
    .rows {
      display: grid;
      gap: 6px;
    }
    .row {
      display: grid;
      grid-template-columns: minmax(0, 1fr) 112px 32px;
      gap: 6px;
      align-items: center;

      .select,
      .input {
        height: 44px;
        font-size: 13.5px;
        padding-left: 14px;
      }
      .select {
        padding-right: 36px;
        background-position:
          calc(100% - 18px) 50%,
          calc(100% - 13px) 50%;
      }
    }
    .amt {
      text-align: right;
      padding-right: 14px;
    }
    .rm {
      width: 32px;
      height: 32px;
      display: grid;
      place-items: center;
      border-radius: 999px;
      color: var(--muted);

      &:hover {
        background: var(--surface-2);
        color: var(--ink);
      }
    }
    .row-foot {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      padding-right: 38px;
      font-size: 12.5px;
      color: var(--muted);

      b {
        color: var(--ink);
        font-weight: 600;
        margin-left: 4px;
      }
    }
    .add {
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
    .posted {
      display: grid;
      gap: 2px;
      padding: 10px 12px;
      border-radius: var(--r-inner);
      background: var(--a-night);
      color: var(--n-ink);

      .lbl {
        font-size: 12px;
        color: var(--n-muted);
        margin-bottom: 4px;
      }
    }
    .line {
      display: grid;
      grid-template-columns: 26px minmax(0, 1fr) auto;
      gap: 8px;
      font-size: 12px;

      &.cr .nm {
        padding-left: 14px;
      }
      .nm {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      > :first-child {
        color: var(--a-sky);
      }
    }
    .status {
      display: flex;
      align-items: center;
      gap: 8px;
      min-height: 40px;
      padding: 8px 12px;
      border-radius: var(--r-inner);
      background: var(--a-red-soft);
      color: var(--a-red-text);
      font-size: 13px;
      font-weight: 500;

      &.ok {
        background: var(--a-green-soft);
        color: var(--a-green-text);
      }
      ng-icon {
        font-size: 17px;
        flex-shrink: 0;
      }
    }
    .save {
      height: 44px;
      width: 100%;
      justify-content: center;

      &[disabled] {
        opacity: 0.45;
        cursor: not-allowed;
      }
    }
    .sample {
      font-size: 12px;
      color: var(--muted);
      min-height: 14px;
    }
    @media (max-width: 460px) {
      .tx {
        padding: 14px;
      }
      .row {
        grid-template-columns: minmax(0, 1fr) 96px 32px;
      }
    }
  `,
})
export class AsaanHisabJournalDemo {
  protected readonly max = MAX_ROWS;
  protected readonly all = ACCOUNTS;
  protected readonly moneyAccounts = accountsOf('asset').filter((a) => a.code < 1100);
  protected readonly sides = [
    { key: 'rows' as const, label: 'Debits', one: 'Debit' },
    { key: 'credits' as const, label: 'Credits', one: 'Credit' },
  ];
  protected readonly fmt = money;

  protected readonly mode = signal<Mode>('income');
  protected readonly acc = signal(SEED.income.acc);
  protected readonly text = signal(SEED.income.text);
  /** Categories (income or expense), or the debit lines of a journal entry. */
  protected readonly rows = signal<Row[]>(SEED.income.rows);
  /** Credit lines of a journal entry. */
  protected readonly credits = signal<Row[]>([]);
  protected readonly saved = signal(41);
  protected readonly note = signal('Sample entry. Change an amount, split it, switch the type.');

  protected readonly categories = computed(() => accountsOf(this.mode() === 'expense' ? 'expense' : 'income'));
  protected readonly debitTotal = computed(() => this.rows().reduce((s, r) => s + r.amt, 0));
  protected readonly creditTotal = computed(() => this.credits().reduce((s, r) => s + r.amt, 0));
  protected readonly gap = computed(() => Math.abs(this.debitTotal() - this.creditTotal()));
  protected readonly balanced = computed(() => this.debitTotal() > 0 && this.gap() === 0);
  protected readonly canSave = computed(() => (this.mode() === 'journal' ? this.balanced() : this.debitTotal() > 0));

  /** Income: Dr the money account, Cr each income category. Expense: the other way round. */
  protected readonly posting = computed(() => {
    const money = { code: this.acc(), name: account(this.acc()).name, amt: this.debitTotal() };
    const cats = this.rows()
      .filter((r) => r.amt > 0)
      .map((r) => ({ code: r.code, name: account(r.code).name, amt: r.amt }));
    return this.mode() === 'income'
      ? [{ side: 'Dr', ...money }, ...cats.map((c) => ({ side: 'Cr', ...c }))]
      : [...cats.map((c) => ({ side: 'Dr', ...c })), { side: 'Cr', ...money }];
  });

  protected setMode(m: Mode): void {
    if (m === this.mode()) return;
    this.mode.set(m);
    this.load(m);
    this.note.set(m === 'journal' ? 'A hand-written entry. It saves only when it balances.' : 'Plain words in, double entry out.');
  }

  protected setRow(side: 'rows' | 'credits', i: number, key: 'code' | 'amt', ev: Event): void {
    const el = ev.target as HTMLInputElement | HTMLSelectElement;
    const value = key === 'code' ? +el.value : parseAmount(el.value);
    if (key === 'amt') el.value = value ? money(value) : '';
    this[side].update((rs) => rs.map((r, j) => (j === i ? { ...r, [key]: value } : r)));
  }

  protected add(side: 'rows' | 'credits'): void {
    const pool = this.mode() === 'journal' ? this.all : this.categories();
    const used = this[side]().map((r) => r.code);
    const next = pool.find((a) => !used.includes(a.code)) ?? pool[0];
    this[side].update((rs) => (rs.length < MAX_ROWS ? [...rs, { code: next.code, amt: 0 }] : rs));
  }

  protected remove(side: 'rows' | 'credits', i: number): void {
    this[side].update((rs) => rs.filter((_, j) => j !== i));
  }

  protected save(): void {
    const n = this.saved() + 1;
    const total = money(this.debitTotal());
    this.saved.set(n);
    const m = this.mode();
    if (m === 'journal') this.note.set(`JV-${String(n).padStart(3, '0')} saved: Rs ${total} on each side.`);
    else {
      const split = this.rows().length > 1 ? `, split across ${this.rows().length} categories` : '';
      this.note.set(`${m === 'income' ? 'Income' : 'Expense'} of Rs ${total} saved${split}.`);
    }
  }

  protected reset(): void {
    this.mode.set('income');
    this.load('income');
    this.saved.set(41);
    this.note.set('Sample entry reset.');
  }

  private load(m: Mode): void {
    const s = SEED[m];
    this.acc.set(s.acc || 1002);
    this.text.set(s.text);
    this.rows.set(s.rows);
    this.credits.set(s.credits ?? []);
  }
}
