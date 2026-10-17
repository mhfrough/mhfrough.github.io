import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { phosphorArrowCounterClockwise, phosphorCheck, phosphorLockSimple } from '@ng-icons/phosphor-icons/regular';
import { ACCOUNTS, ENTRIES, Entry, HEADS, Head, Line, account, balance, debitNormal, money } from './books';

/**
 * The four reports I built for the app (my own redraw, not a screenshot): profit and loss, balance sheet, trial
 * balance and the ledger of one account, all worked out live from the same sample entries. "Close the period"
 * runs the app's closure: income and expense accounts are emptied into retained earnings by one closing entry,
 * so the balance sheet keeps balancing and next period starts from zero. Sample business and figures.
 */
type Report = 'pl' | 'bs' | 'tb' | 'gl';

const REPORTS: { id: Report; label: string; title: string }[] = [
  { id: 'pl', label: 'Profit and loss', title: 'Profit and Loss' },
  { id: 'bs', label: 'Balance sheet', title: 'Balance Sheet' },
  { id: 'tb', label: 'Trial balance', title: 'Trial Balance' },
  { id: 'gl', label: 'Ledger', title: 'Account Transactions' },
];

const RETAINED = 3101;

/** The closing entry: Dr every income account, Cr every expense account, the difference to retained earnings. */
function closingEntry(): Entry {
  const lines: Line[] = [];
  let net = 0;
  for (const a of ACCOUNTS) {
    const b = balance(a.code);
    if (!b) continue;
    if (a.head === 'income') {
      lines.push({ code: a.code, dr: b });
      net += b;
    } else if (a.head === 'expense') {
      lines.push({ code: a.code, cr: b });
      net -= b;
    }
  }
  lines.push(net >= 0 ? { code: RETAINED, cr: net } : { code: RETAINED, dr: -net });
  return { date: '30 Jun 2020', ref: 'CLS-001', text: 'Closure into retained earnings', lines };
}

@Component({
  selector: 'mh-ah-reports',
  imports: [NgIcon],
  viewProviders: [provideIcons({ phosphorArrowCounterClockwise, phosphorCheck, phosphorLockSimple })],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="rep card">
      <div class="bar">
        <div class="seg" role="group" aria-label="Report">
          @for (r of reports; track r.id) {
            <button type="button" [attr.aria-pressed]="report() === r.id" (click)="report.set(r.id)">{{ r.label }}</button>
          }
        </div>
        <button type="button" class="btn btn-sm" [class.btn-solid]="!closed()" [class.btn-ghost]="closed()" (click)="toggleClose()">
          <ng-icon [name]="closed() ? 'phosphorArrowCounterClockwise' : 'phosphorLockSimple'" aria-hidden="true" />
          {{ closed() ? 'Reopen the period' : 'Close the period' }}
        </button>
      </div>

      @if (report() === 'gl') {
        <div class="gl-pick">
          <label for="ah-gl-acc">Account</label>
          <select id="ah-gl-acc" class="select" (change)="glCode.set(+$any($event.target).value)">
            @for (h of heads; track h.id) {
              <optgroup [label]="h.code + ' ' + h.name">
                @for (a of accountsBy(h.id); track a.code) {
                  <option [value]="a.code" [selected]="a.code === glCode()">{{ a.code }} {{ a.name }}</option>
                }
              </optgroup>
            }
          </select>
        </div>
      }

      <section class="sheet" [attr.aria-label]="current().title">
        <header class="sh-head">
          <p>Tabeer Studio</p>
          <h3>{{ current().title }}</h3>
          <p class="mono">{{ report() === 'bs' || report() === 'tb' ? 'As of 30 Jun 2020' : '1 Mar to 30 Jun 2020' }}</p>
        </header>

        @switch (report()) {
          @case ('pl') {
            <table class="t">
              <tbody>
                <tr class="grp"><th colspan="2" scope="rowgroup">Income</th></tr>
                @for (a of pl().income; track a.code) {
                  <tr><td>{{ a.name }}</td><td class="r mono">{{ fmt(a.bal) }}</td></tr>
                }
                <tr class="subt"><td>Total income</td><td class="r mono">{{ fmt(pl().income_) }}</td></tr>
                <tr class="grp"><th colspan="2" scope="rowgroup">Expenses</th></tr>
                @for (a of pl().expense; track a.code) {
                  <tr><td>{{ a.name }}</td><td class="r mono">{{ fmt(a.bal) }}</td></tr>
                }
                <tr class="subt"><td>Total expenses</td><td class="r mono">{{ fmt(pl().expense_) }}</td></tr>
                <tr class="tot"><td>Net income</td><td class="r mono">{{ fmt(pl().net) }}</td></tr>
              </tbody>
            </table>
          }
          @case ('bs') {
            <table class="t">
              <tbody>
                @for (g of bs().groups; track g.name) {
                  <tr class="grp"><th colspan="2" scope="rowgroup">{{ g.name }}</th></tr>
                  @for (a of g.rows; track a.name) {
                    <tr [class.new]="a.flag"><td>{{ a.name }}</td><td class="r mono">{{ fmt(a.bal) }}</td></tr>
                  }
                  <tr class="subt"><td>Total {{ g.name.toLowerCase() }}</td><td class="r mono">{{ fmt(g.total) }}</td></tr>
                }
                <tr class="tot"><td>Liabilities and equity</td><td class="r mono">{{ fmt(bs().le) }}</td></tr>
              </tbody>
            </table>
          }
          @case ('tb') {
            <table class="t">
              <thead>
                <tr><th scope="col">Account</th><th scope="col" class="r">Debit</th><th scope="col" class="r">Credit</th></tr>
              </thead>
              <tbody>
                @for (r of tb().rows; track r.code) {
                  <tr><td><span class="mono acc-code">{{ r.code }}</span> {{ r.name }}</td><td class="r mono">{{ r.dr ? fmt(r.dr) : '' }}</td><td class="r mono">{{ r.cr ? fmt(r.cr) : '' }}</td></tr>
                }
                <tr class="tot"><td>Total</td><td class="r mono">{{ fmt(tb().dr) }}</td><td class="r mono">{{ fmt(tb().cr) }}</td></tr>
              </tbody>
            </table>
          }
          @case ('gl') {
            <table class="t gl">
              <thead>
                <tr><th scope="col">Date</th><th scope="col">Description</th><th scope="col" class="r">Debit</th><th scope="col" class="r">Credit</th><th scope="col" class="r">Balance</th></tr>
              </thead>
              <tbody>
                @for (r of gl(); track r.ref) {
                  <tr [class.new]="r.ref === 'CLS-001'">
                    <td class="mono nw">{{ r.date }}</td>
                    <td>{{ r.text }}<br /><span class="mono acc-code">{{ r.ref }}</span></td>
                    <td class="r mono">{{ r.dr ? fmt(r.dr) : '' }}</td>
                    <td class="r mono">{{ r.cr ? fmt(r.cr) : '' }}</td>
                    <td class="r mono">{{ fmt(r.bal) }}</td>
                  </tr>
                } @empty {
                  <tr><td colspan="5" class="empty">No transactions on this account yet.</td></tr>
                }
              </tbody>
            </table>
          }
        }
      </section>

      <p class="verdict" role="status">
        <ng-icon name="phosphorCheck" aria-hidden="true" />
        {{ check() }}
      </p>
    </div>
  `,
  styles: `
    :host {
      display: block;
    }
    .rep {
      display: grid;
      gap: 14px;
      padding: 18px;
    }
    .bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 10px;

      .seg {
        flex-wrap: wrap;
      }
      .seg button {
        height: 34px;
        padding: 0 12px;
        font-size: 13px;
      }
      .btn {
        height: 44px;
        gap: 6px;
      }
    }
    .gl-pick {
      display: grid;
      gap: 6px;
      max-width: 340px;

      label {
        font-size: 12.5px;
        font-weight: 500;
        color: var(--ink-2);
      }
      .select {
        height: 44px;
        font-size: 14px;
      }
    }
    .sheet {
      padding: 22px 24px;
      border-radius: var(--r-inner);
      background: var(--bg);
      border: 1px solid var(--line);
      min-width: 0;
    }
    .sh-head {
      text-align: center;
      margin-bottom: 16px;

      p {
        font-size: 12.5px;
        color: var(--muted);
      }
      h3 {
        font-size: 17px;
        margin: 2px 0;
      }
    }
    .t {
      width: 100%;
      border-collapse: collapse;
      font-size: 13.5px;

      th,
      td {
        padding: 7px 8px;
        text-align: left;
        border-bottom: 1px solid var(--line);
        vertical-align: top;
      }
      thead th {
        font-size: 12px;
        font-weight: 500;
        color: var(--muted);
      }
      .r {
        text-align: right;
        white-space: nowrap;
      }
      .mono {
        font-size: 12.5px;
      }
      .acc-code {
        font-size: 12px;
        color: var(--muted);
      }
      .nw {
        white-space: nowrap;
      }
      .grp th {
        padding-top: 14px;
        font-size: 12px;
        font-weight: 600;
        color: var(--a-blue-text);
        letter-spacing: 0.02em;
        text-transform: uppercase;
      }
      .subt td {
        font-weight: 600;
      }
      .tot td {
        font-weight: 700;
        border-top: 2px solid var(--ink);
        border-bottom: 3px double var(--ink);
      }
      .new td {
        background: var(--a-blue-soft);
      }
      .empty {
        color: var(--muted);
        text-align: center;
        padding: 18px;
      }
    }
    .verdict {
      display: flex;
      align-items: center;
      gap: 8px;
      min-height: 40px;
      padding: 8px 12px;
      border-radius: var(--r-inner);
      background: var(--a-green-soft);
      color: var(--a-green-text);
      font-size: 13px;
      font-weight: 500;

      ng-icon {
        font-size: 17px;
        flex-shrink: 0;
      }
    }
    @media (max-width: 560px) {
      .rep {
        padding: 14px;
      }
      .sheet {
        padding: 16px 10px;
      }
      .t {
        font-size: 12.5px;

        th,
        td {
          padding: 6px 4px;
        }
        .mono {
          font-size: 12px;
        }
      }
      .gl .nw {
        white-space: normal;
      }
    }
    /* Four reports do not fit one row on a phone: two even rows instead of a ragged wrap */
    @media (max-width: 480px) {
      .seg {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        width: 100%;
        border-radius: 20px;
      }
      .seg button {
        justify-content: center;
      }
    }
  `,
})
export class AsaanHisabReportsDemo {
  protected readonly reports = REPORTS;
  protected readonly heads = HEADS;
  protected readonly fmt = money;

  protected readonly report = signal<Report>('bs');
  protected readonly closed = signal(false);
  protected readonly glCode = signal(1002);

  protected readonly current = computed(() => REPORTS.find((r) => r.id === this.report())!);
  protected readonly entries = computed(() => (this.closed() ? [...ENTRIES, closingEntry()] : ENTRIES));

  protected accountsBy(h: Head) {
    return ACCOUNTS.filter((a) => a.head === h);
  }

  /** Profit and loss always reads the period's own entries, before any closing entry. */
  protected readonly pl = computed(() => {
    const rows = (h: Head) => ACCOUNTS.filter((a) => a.head === h).map((a) => ({ ...a, bal: balance(a.code) })).filter((a) => a.bal);
    const income = rows('income');
    const expense = rows('expense');
    const income_ = income.reduce((s, a) => s + a.bal, 0);
    const expense_ = expense.reduce((s, a) => s + a.bal, 0);
    return { income, expense, income_, expense_, net: income_ - expense_ };
  });

  protected readonly bs = computed(() => {
    const es = this.entries();
    const rows = (h: Head) => ACCOUNTS.filter((a) => a.head === h).map((a) => ({ name: a.name, bal: balance(a.code, es), flag: false })).filter((a) => a.bal);
    const open = ACCOUNTS.filter((a) => a.head === 'income' || a.head === 'expense').reduce((s, a) => s + (a.head === 'income' ? 1 : -1) * balance(a.code, es), 0);
    const assets = rows('asset');
    const liabilities = rows('liability');
    const equity = rows('equity').map((r) => ({ ...r, flag: this.closed() && r.name === account(RETAINED).name }));
    if (open) equity.push({ name: 'Net income, not yet closed', bal: open, flag: true });
    const total = (rs: { bal: number }[]) => rs.reduce((s, r) => s + r.bal, 0);
    const groups = [
      { name: 'Assets', rows: assets, total: total(assets) },
      { name: 'Liabilities', rows: liabilities, total: total(liabilities) },
      { name: 'Equity', rows: equity, total: total(equity) },
    ];
    return { groups, assets: groups[0].total, le: groups[1].total + groups[2].total };
  });

  protected readonly tb = computed(() => {
    const es = this.entries();
    const rows = ACCOUNTS.map((a) => {
      const b = balance(a.code, es);
      const onDebit = debitNormal(a.head) ? b >= 0 : b < 0;
      return { code: a.code, name: a.name, dr: b && onDebit ? Math.abs(b) : 0, cr: b && !onDebit ? Math.abs(b) : 0 };
    }).filter((r) => r.dr || r.cr);
    return { rows, dr: rows.reduce((s, r) => s + r.dr, 0), cr: rows.reduce((s, r) => s + r.cr, 0) };
  });

  /** One account's lines with a running balance on its normal side. */
  protected readonly gl = computed(() => {
    const code = this.glCode();
    const sign = debitNormal(account(code).head) ? 1 : -1;
    let bal = 0;
    const out = [];
    for (const e of this.entries()) {
      for (const l of e.lines) {
        if (l.code !== code) continue;
        bal += sign * ((l.dr ?? 0) - (l.cr ?? 0));
        out.push({ date: e.date, ref: e.ref, text: e.text, dr: l.dr ?? 0, cr: l.cr ?? 0, bal });
      }
    }
    return out;
  });

  protected readonly check = computed(() => {
    switch (this.report()) {
      case 'pl':
        return this.closed()
          ? `Period closed: Rs ${money(this.pl().net)} moved to retained earnings, income and expenses start again at zero.`
          : `Net income of Rs ${money(this.pl().net)} for the period, still open.`;
      case 'bs':
        return `Assets Rs ${money(this.bs().assets)} = liabilities and equity Rs ${money(this.bs().le)}.`;
      case 'tb':
        return `Debits Rs ${money(this.tb().dr)} = credits Rs ${money(this.tb().cr)}.`;
      default: {
        const rows = this.gl();
        return `${rows.length} line${rows.length === 1 ? '' : 's'}, closing balance Rs ${money(rows.at(-1)?.bal ?? 0)}.`;
      }
    }
  });

  protected toggleClose(): void {
    this.closed.update((c) => !c);
  }
}
