import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { phosphorArrowCounterClockwise } from '@ng-icons/phosphor-icons/regular';
import { EnTxStrip, IDLE, Tx, fakeHash, txTimers } from './tx';

/**
 * Mockup of the EthicalNode admin portal's Chain Management screen (my own redraw). Each chain row carries the
 * fields of the 2023 chain registry contract: staking contract, coin APY, commission, withdrawal (unbonding) days
 * and a compliance rating of Comfortable, Not comfortable or Questionable. Add, update, enable and disable are
 * registry calls on the admin network; approving an investor's unstake request is `approve(index)` on that chain's
 * own staking contract, so the wallet switches network first, as the portal did. Sample chains, investors and
 * hashes; APYs are placeholders.
 */
type Tab = 'chains' | 'requests';
type Status = 'enabled' | 'disabled' | 'unknown';
type Compliance = 'Comfortable' | 'Not comfortable' | 'Questionable';

interface Chain {
  sym: string;
  net: string;
  contract: string;
  status: Status;
  apy: number;
  fee: number;
  days: number;
  compliance: Compliance;
}

interface Request {
  id: number;
  investor: string;
  sym: string;
  amount: number;
  day: number;
  approved: boolean;
}

const ADMIN_NET = 'Polygon Mumbai';
const COMPLIANCE: Compliance[] = ['Comfortable', 'Not comfortable', 'Questionable'];
const STATUS: Record<Status, string> = { enabled: 'Enabled', disabled: 'Disabled', unknown: 'Not added' };

const CHAINS: Chain[] = [
  { sym: 'MATIC', net: 'Polygon Mumbai', contract: '0x1111…aaaa', status: 'enabled', apy: 7, fee: 5, days: 3, compliance: 'Comfortable' },
  { sym: 'ETH', net: 'Goerli', contract: '0x2222…bbbb', status: 'enabled', apy: 4, fee: 5, days: 7, compliance: 'Comfortable' },
  { sym: 'AVAX', net: 'Avalanche Fuji', contract: '0x3333…cccc', status: 'disabled', apy: 6, fee: 4, days: 2, compliance: 'Questionable' },
  { sym: 'CELO', net: 'Celo Alfajores', contract: '', status: 'unknown', apy: 0, fee: 0, days: 0, compliance: 'Comfortable' },
];

const REQUESTS: Request[] = [
  { id: 1, investor: '0xab12…9f0e', sym: 'MATIC', amount: 25, day: 3, approved: false },
  { id: 2, investor: '0xcd34…7a1b', sym: 'ETH', amount: 0.8, day: 5, approved: false },
  { id: 3, investor: '0xef56…3c2d', sym: 'MATIC', amount: 140, day: 1, approved: false },
];

@Component({
  selector: 'mh-en-chains',
  imports: [NgIcon, EnTxStrip],
  viewProviders: [provideIcons({ phosphorArrowCounterClockwise })],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="chains card">
      <header class="c-head">
        <div>
          <h3>Chain management</h3>
          <p>Wallet on <span class="mono">{{ network() }}</span></p>
        </div>
        <button type="button" class="reset" aria-label="Reset the sample chains" (click)="reset()">
          <ng-icon name="phosphorArrowCounterClockwise" aria-hidden="true" />
        </button>
      </header>

      <div class="seg" role="group" aria-label="Chain lists">
        <button type="button" [attr.aria-pressed]="tab() === 'chains'" (click)="tab.set('chains')">Chains</button>
        <button type="button" [attr.aria-pressed]="tab() === 'requests'" (click)="tab.set('requests')">Unstake requests {{ open() }}</button>
      </div>

      @if (tab() === 'chains') {
        <ul class="rows" role="list">
          @for (c of chains(); track c.sym) {
            <li [attr.data-s]="c.status">
              <span class="coin mono" [attr.data-c]="c.sym" aria-hidden="true">{{ c.sym.slice(0, 1) }}</span>
              <div class="r-txt">
                <b>{{ c.net }} <span class="mono">{{ c.sym }}</span></b>
                @if (c.status === 'unknown') {
                  <span>Listed by the API, not yet in the registry</span>
                } @else {
                  <span>APY {{ c.apy }}%, commission {{ c.fee }}%, {{ c.days }} day unbonding</span>
                }
              </div>
              <div class="pills">
                <span class="st">{{ status[c.status] }}</span>
                @if (c.status !== 'unknown') {
                  <span class="comp" [attr.data-q]="c.compliance">{{ c.compliance }}</span>
                }
              </div>
              <div class="acts">
                @if (c.status === 'enabled') {
                  <button type="button" class="btn btn-ghost btn-sm" [disabled]="busy()" (click)="toggle(c)">Disable</button>
                } @else if (c.status === 'disabled') {
                  <button type="button" class="btn btn-ghost btn-sm" [disabled]="busy()" (click)="toggle(c)">Enable</button>
                }
                <button type="button" class="btn btn-ghost btn-sm" [disabled]="busy()" [attr.aria-expanded]="editing() === c.sym" (click)="edit(c)">
                  {{ c.status === 'unknown' ? 'Add' : 'Update' }}
                </button>
              </div>
            </li>
            @if (editing() === c.sym) {
              <li class="form">
                <div class="fields">
                  <div class="f">
                    <label [for]="'en-apy-' + c.sym">Coin APY, %</label>
                    <input [id]="'en-apy-' + c.sym" class="input" type="number" min="0" max="100" [value]="draft().apy" (input)="set('apy', $event)" />
                  </div>
                  <div class="f">
                    <label [for]="'en-fee-' + c.sym">Commission, %</label>
                    <input [id]="'en-fee-' + c.sym" class="input" type="number" min="0" max="100" [value]="draft().fee" (input)="set('fee', $event)" />
                  </div>
                  <div class="f">
                    <label [for]="'en-days-' + c.sym">Unbonding days</label>
                    <input [id]="'en-days-' + c.sym" class="input" type="number" min="1" max="60" [value]="draft().days" (input)="set('days', $event)" />
                  </div>
                  <div class="f">
                    <label [for]="'en-comp-' + c.sym">Compliance</label>
                    <select [id]="'en-comp-' + c.sym" class="select" [value]="draft().compliance" (change)="setCompliance($event)">
                      @for (o of compliance; track o) {
                        <option [value]="o">{{ o }}</option>
                      }
                    </select>
                  </div>
                </div>
                <div class="f-foot">
                  <p class="err" [id]="'en-ch-e-' + c.sym">{{ invalid() }}</p>
                  <button type="button" class="btn btn-solid btn-sm" [disabled]="!!invalid() || busy()" [attr.aria-describedby]="'en-ch-e-' + c.sym" (click)="save(c)">
                    {{ c.status === 'unknown' ? 'Add chain' : 'Update chain' }}
                  </button>
                </div>
              </li>
            }
          }
        </ul>
      } @else {
        <ul class="rows" role="list">
          @for (r of requests(); track r.id) {
            <li [attr.data-s]="r.approved ? 'enabled' : 'pending'">
              <span class="coin mono" [attr.data-c]="r.sym" aria-hidden="true">{{ r.sym.slice(0, 1) }}</span>
              <div class="r-txt">
                <b>{{ r.amount }} <span class="mono">{{ r.sym }}</span></b>
                <span>Investor <span class="mono">{{ r.investor }}</span>, unbonding day {{ r.day }} of {{ days(r.sym) }}</span>
              </div>
              @if (r.approved) {
                <span class="st">Approved</span>
              } @else {
                <button type="button" class="btn btn-solid btn-sm" [disabled]="busy()" (click)="approve(r)">Approve</button>
              }
            </li>
          }
        </ul>
      }

      @if (tx().phase !== 'idle') {
        <mh-en-tx [tx]="tx()" [network]="true" />
      }
      <p class="mono sample" aria-live="polite">{{ note() }}</p>
    </div>
  `,
  styles: `
    :host {
      display: block;
    }
    .chains {
      display: grid;
      gap: 12px;
      padding: 20px;
    }
    .c-head {
      display: flex;
      align-items: center;
      gap: 12px;
      padding-bottom: 12px;
      border-bottom: 1px solid var(--line);

      div {
        flex: 1;
      }
      h3 {
        font-size: 16px;
      }
      p {
        font-size: 12.5px;
        color: var(--muted);
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
      justify-self: start;
      max-width: 100%;
      flex-wrap: wrap;

      button {
        height: 30px;
        padding: 0 12px;
        font-size: 12.5px;
      }
    }
    .rows {
      display: grid;
      gap: 6px;

      > li:not(.form) {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 8px 12px;
        min-height: 60px;
        padding: 8px 10px;
        border-radius: var(--r-inner);
        border: 1px solid var(--line);
      }
      > li[data-s='disabled'] {
        background: var(--en-red-soft);
        border-color: transparent;
      }
    }
    .coin {
      width: 30px;
      height: 30px;
      flex-shrink: 0;
      display: grid;
      place-items: center;
      border-radius: 50%;
      font-size: 12px;
      font-weight: 600;
      color: #fff;
      background: var(--en-matic);

      &[data-c='ETH'] {
        background: var(--en-eth);
      }
      &[data-c='AVAX'] {
        background: var(--en-avax);
      }
      &[data-c='CELO'] {
        background: var(--en-green-text);
      }
    }
    .r-txt {
      flex: 1 1 200px;
      min-width: 0;

      b {
        display: block;
        font-size: 13.5px;
        font-weight: 600;
      }
      .mono {
        font-size: 12px;
        font-weight: 400;
        color: var(--muted);
      }
      > span {
        font-size: 12px;
        color: var(--muted);
      }
    }
    .pills {
      display: flex;
      gap: 4px;
      flex-wrap: wrap;
    }
    .st,
    .comp {
      font-size: 12px;
      font-weight: 500;
      padding: 2px 9px;
      border-radius: 999px;
      white-space: nowrap;
    }
    .st {
      background: var(--en-blue-soft);
      color: var(--en-blue-text);
    }
    [data-s='disabled'] .st {
      background: var(--surface);
      color: var(--en-red-text);
    }
    [data-s='unknown'] .st {
      background: var(--surface-2);
      color: var(--muted);
    }
    .comp {
      background: var(--en-green-soft);
      color: var(--en-green-text);

      &[data-q='Questionable'] {
        background: var(--en-amber-soft);
        color: var(--en-amber-text);
      }
      &[data-q='Not comfortable'] {
        background: var(--surface);
        color: var(--en-red-text);
      }
    }
    .acts {
      display: flex;
      gap: 6px;
      margin-left: auto;
    }
    .btn-sm {
      height: 36px;
      padding: 0 13px;
      font-size: 13px;
    }
    .btn[disabled] {
      opacity: 0.45;
      cursor: not-allowed;
    }
    .form {
      display: grid;
      gap: 10px;
      padding: 12px;
      border-radius: var(--r-inner);
      background: var(--surface-2);
    }
    .fields {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 10px;
    }
    .f {
      display: grid;
      gap: 5px;

      label {
        font-size: 12.5px;
        font-weight: 500;
        color: var(--ink-2);
      }
      .input,
      .select {
        height: 44px;
        font-size: 14px;
        background: var(--surface);
      }
    }
    .f-foot {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
    }
    .err {
      font-size: 12px;
      color: var(--en-red-text);
    }
    .sample {
      font-size: 12px;
      color: var(--muted);
      min-height: 14px;
    }
    @media (max-width: 760px) {
      .fields {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
    }
    @media (max-width: 460px) {
      .chains {
        padding: 14px;
      }
      .acts {
        margin-left: 0;
      }
    }
  `,
})
export class EthicalNodeChainsDemo {
  protected readonly compliance = COMPLIANCE;
  protected readonly status = STATUS;
  private readonly later = txTimers();

  protected readonly tab = signal<Tab>('chains');
  protected readonly network = signal(ADMIN_NET);
  protected readonly chains = signal<Chain[]>(CHAINS);
  protected readonly requests = signal<Request[]>(REQUESTS);
  protected readonly editing = signal<string | null>(null);
  protected readonly draft = signal({ apy: 0, fee: 0, days: 0, compliance: 'Comfortable' as Compliance });
  protected readonly tx = signal<Tx>(IDLE);
  protected readonly note = signal('Sample chains. Disable one, or approve an unstake request.');

  protected readonly busy = computed(() => !['idle', 'confirmed', 'rejected'].includes(this.tx().phase));
  protected readonly open = computed(() => this.requests().filter((r) => !r.approved).length);
  protected readonly invalid = computed(() => {
    const d = this.draft();
    if (!(d.apy >= 0 && d.apy <= 100) || !(d.fee >= 0 && d.fee <= 100)) return 'APY and commission run from 0 to 100.';
    if (!(d.days >= 1)) return 'Unbonding needs at least one day.';
    return '';
  });

  protected days(sym: string): number {
    return this.chains().find((c) => c.sym === sym)?.days ?? 0;
  }

  protected edit(c: Chain): void {
    this.editing.set(this.editing() === c.sym ? null : c.sym);
    this.draft.set(c.status === 'unknown' ? { apy: 5, fee: 5, days: 3, compliance: 'Comfortable' } : { apy: c.apy, fee: c.fee, days: c.days, compliance: c.compliance });
  }

  protected set(k: 'apy' | 'fee' | 'days', e: Event): void {
    const v = Number((e.target as HTMLInputElement).value);
    this.draft.update((d) => ({ ...d, [k]: v }));
  }

  protected setCompliance(e: Event): void {
    const v = (e.target as HTMLSelectElement).value as Compliance;
    this.draft.update((d) => ({ ...d, compliance: v }));
  }

  protected save(c: Chain): void {
    const d = this.draft();
    const adding = c.status === 'unknown';
    this.run(`${adding ? 'addChain' : 'updateChain'}(${c.sym}, …) on the registry`, ADMIN_NET, () => {
      this.chains.update((l) =>
        l.map((x) => (x.sym === c.sym ? { ...x, ...d, status: adding ? 'enabled' : x.status, contract: x.contract || '0x4444…dddd' } : x)),
      );
      this.editing.set(null);
      this.note.set(`${c.net} ${adding ? 'added and enabled' : 'updated'} in the registry.`);
    });
  }

  protected toggle(c: Chain): void {
    const off = c.status === 'enabled';
    this.run(`${off ? 'disableChain' : 'enableChain'}(${c.sym}) on the registry`, ADMIN_NET, () => {
      this.chains.update((l) => l.map((x) => (x.sym === c.sym ? { ...x, status: off ? 'disabled' : 'enabled' } : x)));
      this.note.set(`${c.net} ${off ? 'disabled: rewards and approvals pause until it is enabled' : 'enabled again'}.`);
    });
  }

  protected approve(r: Request): void {
    const net = this.chains().find((c) => c.sym === r.sym)?.net ?? ADMIN_NET;
    this.run(`approve(${r.id}) on the ${r.sym} staking contract`, net, () => {
      this.requests.update((l) => l.map((x) => (x.id === r.id ? { ...x, approved: true } : x)));
      this.note.set(`Request ${r.id} approved. The investor can withdraw ${r.amount} ${r.sym}.`);
    });
  }

  protected reset(): void {
    this.tab.set('chains');
    this.network.set(ADMIN_NET);
    this.chains.set(CHAINS);
    this.requests.set(REQUESTS);
    this.editing.set(null);
    this.tx.set(IDLE);
    this.note.set('Sample chains reset.');
  }

  /** Switch the wallet to the contract's network if needed, wait for the wallet, wait for the receipt, apply. */
  private run(call: string, net: string, apply: () => void): void {
    const hash = fakeHash();
    const switching = this.network() !== net;
    this.tx.set({ phase: switching ? 'switch' : 'wallet', call, hash: '' });
    const t0 = switching ? 800 : 0;
    this.later(() => {
      this.network.set(net);
      this.tx.set({ phase: 'wallet', call, hash: '' });
    }, t0);
    this.later(() => this.tx.set({ phase: 'pending', call, hash }), t0 + 700);
    this.later(() => {
      this.tx.set({ phase: 'confirmed', call, hash });
      apply();
    }, t0 + 2000);
  }
}
