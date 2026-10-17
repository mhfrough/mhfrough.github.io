import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { phosphorArrowCounterClockwise, phosphorGoogleLogo, phosphorSignOut, phosphorWallet } from '@ng-icons/phosphor-icons/regular';
import { EnTxStrip, IDLE, Tx, fakeHash, txTimers } from './tx';

/**
 * Hero mockup of the EthicalNode investor portal (my own redraw, not a screenshot). It follows the screens I built
 * in 2023: two ways in (an own wallet that signs a one-time message, or a Web3Auth social login that creates the
 * wallet), then Available, Staked and Unbonding assets. Stake, claim rewards, unstake and withdraw are the staking
 * contract's own calls; an unstake waits in an unbonding queue until an admin approves it, then the investor
 * withdraws. The wallet switches network when the asset's contract lives on another chain. Testnet sample data:
 * the address and every hash are obviously fake, the APYs are placeholders, nothing touches a chain.
 */
type Tab = 'available' | 'staked' | 'unbonding';
type Way = 'wallet' | 'social';

interface Asset {
  sym: string;
  name: string;
  net: string;
  apy: number;
  days: number;
  compliance: 'Comfortable' | 'Questionable';
}

interface Staked {
  sym: string;
  amount: number;
  reward: number;
}

interface Unbonding {
  id: number;
  sym: string;
  amount: number;
  approved: boolean;
}

const ASSETS: Asset[] = [
  { sym: 'MATIC', name: 'Polygon', net: 'Polygon Mumbai', apy: 7, days: 3, compliance: 'Comfortable' },
  { sym: 'ETH', name: 'Ethereum', net: 'Goerli', apy: 4, days: 7, compliance: 'Comfortable' },
  { sym: 'AVAX', name: 'Avalanche', net: 'Avalanche Fuji', apy: 6, days: 2, compliance: 'Questionable' },
];

const BALANCE: Record<string, number> = { MATIC: 120, ETH: 2.5, AVAX: 30 };
const STAKED: Staked[] = [{ sym: 'MATIC', amount: 40, reward: 0.84 }];

const fmt = (n: number) => (Math.round(n * 100) / 100).toString();

@Component({
  selector: 'mh-en-stake',
  imports: [NgIcon, EnTxStrip],
  viewProviders: [provideIcons({ phosphorArrowCounterClockwise, phosphorGoogleLogo, phosphorSignOut, phosphorWallet })],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="stake card card--lift">
      <header class="st-head">
        <span class="mark"><img src="/images/ethical-node/ethical-node-mark.webp" width="26" height="26" alt="" /></span>
        <div>
          <h2>My assets</h2>
          <p>Investor portal, testnet sample</p>
        </div>
        <button type="button" class="reset" aria-label="Reset the sample portfolio" (click)="reset()">
          <ng-icon name="phosphorArrowCounterClockwise" aria-hidden="true" />
        </button>
      </header>

      @if (!way()) {
        <div class="connect">
          <p class="lbl mono">Sign in</p>
          <button type="button" class="way" [disabled]="signing()" (click)="connect('wallet')">
            <span class="way-ic"><ng-icon name="phosphorWallet" aria-hidden="true" /></span>
            <span><b>Own wallet</b><small>MetaMask or WalletConnect, then sign a one-time message</small></span>
          </button>
          <button type="button" class="way" [disabled]="signing()" (click)="connect('social')">
            <span class="way-ic"><ng-icon name="phosphorGoogleLogo" aria-hidden="true" /></span>
            <span><b>Social login</b><small>Web3Auth creates the wallet, no seed phrase to keep</small></span>
          </button>
          <p class="signing mono" aria-live="polite">{{ signing() ? 'Waiting for the signature…' : '' }}</p>
        </div>
      } @else {
        <div class="who">
          <span class="addr mono"><i aria-hidden="true"></i>{{ way() === 'wallet' ? '0x1234…abcd' : '0xabcd…1234' }}</span>
          <span class="net mono">{{ network() }}</span>
          <button type="button" class="out" [disabled]="busy()" (click)="signOut()">
            <ng-icon name="phosphorSignOut" aria-hidden="true" /> Sign out
          </button>
        </div>

        <div class="seg" role="group" aria-label="Asset lists">
          <button type="button" [attr.aria-pressed]="tab() === 'available'" (click)="show('available')">Available</button>
          <button type="button" [attr.aria-pressed]="tab() === 'staked'" (click)="show('staked')">Staked {{ staked().length }}</button>
          <button type="button" [attr.aria-pressed]="tab() === 'unbonding'" (click)="show('unbonding')">Unbonding {{ unbonding().length }}</button>
        </div>

        <ul class="rows" role="list">
          @switch (tab()) {
            @case ('available') {
              @for (a of assets; track a.sym) {
                <li>
                  <span class="coin mono" [attr.data-c]="a.sym" aria-hidden="true">{{ a.sym.slice(0, 1) }}</span>
                  <div class="r-txt">
                    <b>{{ a.name }} <span class="mono">{{ a.sym }}</span></b>
                    <span>APY {{ a.apy }}%, {{ a.days }} day unbonding, wallet {{ bal(a.sym) }}</span>
                  </div>
                  <span class="comp" [attr.data-q]="a.compliance">{{ a.compliance }}</span>
                  <button type="button" class="btn btn-ghost btn-sm" [disabled]="busy()" [attr.aria-expanded]="picking() === a.sym" (click)="pick(a.sym)">Stake</button>
                </li>
                @if (picking() === a.sym) {
                  <li class="form">
                    <label [for]="'en-amt-' + a.sym">Amount to stake, {{ a.sym }}</label>
                    <div class="amt">
                      <input
                        [id]="'en-amt-' + a.sym"
                        class="input"
                        type="number"
                        inputmode="decimal"
                        min="0"
                        step="any"
                        [value]="amount()"
                        (input)="amount.set($any($event.target).value)"
                        [attr.aria-invalid]="!!error() || null"
                        [attr.aria-describedby]="'en-amt-e-' + a.sym"
                      />
                      <button type="button" class="btn btn-ghost btn-sm" (click)="amount.set(bal(a.sym).toString())">Max</button>
                      <button type="button" class="btn btn-solid btn-sm" [disabled]="!!error() || busy()" (click)="stake(a)">Stake</button>
                    </div>
                    <p class="err" [id]="'en-amt-e-' + a.sym">{{ error() }}</p>
                  </li>
                }
              }
            }
            @case ('staked') {
              @for (s of staked(); track s.sym) {
                <li>
                  <span class="coin mono" [attr.data-c]="s.sym" aria-hidden="true">{{ s.sym.slice(0, 1) }}</span>
                  <div class="r-txt">
                    <b>{{ fmt(s.amount) }} <span class="mono">{{ s.sym }}</span></b>
                    <span>Rewards {{ fmt(s.reward) }} {{ s.sym }}</span>
                  </div>
                  <div class="acts">
                    <button type="button" class="btn btn-ghost btn-sm" [disabled]="busy() || !s.reward" (click)="claim(s)">Claim</button>
                    <button type="button" class="btn btn-ghost btn-sm" [disabled]="busy()" (click)="unstake(s)">Unstake</button>
                  </div>
                </li>
              } @empty {
                <li class="empty">Nothing staked yet. Pick an asset under Available.</li>
              }
            }
            @case ('unbonding') {
              @for (u of unbonding(); track u.id) {
                <li>
                  <span class="coin mono" [attr.data-c]="u.sym" aria-hidden="true">{{ u.sym.slice(0, 1) }}</span>
                  <div class="r-txt">
                    <b>{{ fmt(u.amount) }} <span class="mono">{{ u.sym }}</span></b>
                    <span>{{ u.approved ? 'Approved, ready to withdraw' : 'Unbonding ' + days(u.sym) + ' days, awaiting admin approval' }}</span>
                  </div>
                  <div class="acts">
                    @if (!u.approved) {
                      <button type="button" class="btn btn-ghost btn-sm" [disabled]="busy()" (click)="approve(u)">Approve as admin</button>
                    } @else {
                      <button type="button" class="btn btn-solid btn-sm" [disabled]="busy()" (click)="withdraw(u)">Withdraw</button>
                    }
                  </div>
                </li>
              } @empty {
                <li class="empty">No unstake requests. Unstake from the Staked list.</li>
              }
            }
          }
        </ul>

        @if (tx().phase !== 'idle') {
          <mh-en-tx [tx]="tx()" [network]="true" />
        }
      }
      <p class="mono sample" aria-live="polite">{{ note() }}</p>
    </div>
  `,
  styles: `
    :host {
      display: block;
    }
    .stake {
      display: grid;
      gap: 12px;
      padding: 18px;
    }
    .st-head {
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
    }
    .mark {
      width: 36px;
      height: 36px;
      display: grid;
      place-items: center;
      border-radius: 10px;
      background: var(--en-night);
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
    .connect {
      display: grid;
      gap: 8px;

      .lbl {
        font-size: 12px;
        color: var(--muted);
      }
    }
    .way {
      display: flex;
      align-items: center;
      gap: 12px;
      min-height: 64px;
      padding: 10px 14px 10px 10px;
      border-radius: var(--r-inner);
      border: 1px solid var(--line);
      background: var(--surface);
      text-align: left;
      transition: border-color var(--t-base) var(--ease);

      &:hover:not([disabled]) {
        border-color: var(--en-blue-text);
      }
      &[disabled] {
        opacity: 0.6;
      }
      b {
        display: block;
        font-size: 14px;
        font-weight: 600;
        color: var(--ink);
      }
      small {
        font-size: 12.5px;
        color: var(--muted);
      }
    }
    .way-ic {
      width: 40px;
      height: 40px;
      flex-shrink: 0;
      display: grid;
      place-items: center;
      border-radius: 10px;
      background: var(--en-blue-soft);
      color: var(--en-blue-text);
      font-size: 20px;
    }
    .signing {
      min-height: 16px;
      font-size: 12px;
      color: var(--en-blue-text);
    }
    .who {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
    }
    .addr,
    .net {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      height: 28px;
      padding: 0 11px;
      border-radius: 999px;
      font-size: 12px;
      background: var(--surface-2);
      border: 1px solid var(--line);
      color: var(--ink-2);

      i {
        width: 7px;
        height: 7px;
        border-radius: 50%;
        background: var(--en-green);
      }
    }
    .net {
      background: var(--en-teal-soft);
      border-color: transparent;
      color: var(--en-teal-text);
    }
    .out {
      margin-left: auto;
      display: inline-flex;
      align-items: center;
      gap: 5px;
      min-height: 44px;
      padding: 0 6px;
      font-size: 12.5px;
      color: var(--muted);

      &:hover:not([disabled]) {
        color: var(--ink);
      }
    }
    .seg {
      align-self: start;
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

      > li:not(.form):not(.empty) {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 8px 10px;
        min-height: 58px;
        padding: 8px 8px 8px 10px;
        border-radius: var(--r-inner);
        border: 1px solid var(--line);
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
    }
    .r-txt {
      flex: 1 1 150px;
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
    .comp {
      font-size: 12px;
      font-weight: 500;
      padding: 2px 9px;
      border-radius: 999px;
      white-space: nowrap;
      background: var(--en-green-soft);
      color: var(--en-green-text);

      &[data-q='Questionable'] {
        background: var(--en-amber-soft);
        color: var(--en-amber-text);
      }
    }
    .acts {
      display: flex;
      gap: 6px;
      flex-wrap: wrap;
    }
    .btn-sm {
      height: 36px;
      min-height: 36px;
      padding: 0 13px;
      font-size: 13px;
    }
    .btn[disabled] {
      opacity: 0.45;
      cursor: not-allowed;
    }
    .form {
      display: grid;
      gap: 6px;
      padding: 10px 12px;
      border-radius: var(--r-inner);
      background: var(--surface-2);

      label {
        font-size: 12.5px;
        font-weight: 500;
        color: var(--ink-2);
      }
    }
    .amt {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto auto;
      gap: 6px;

      .input {
        height: 40px;
        font-size: 14px;
        background: var(--surface);
      }
    }
    .err {
      min-height: 15px;
      font-size: 12px;
      color: var(--en-red-text);
    }
    .empty {
      padding: 16px 12px;
      border-radius: var(--r-inner);
      border: 1px dashed var(--line-strong);
      font-size: 13px;
      color: var(--muted);
    }
    .sample {
      font-size: 12px;
      color: var(--muted);
      min-height: 14px;
    }
    @media (max-width: 460px) {
      .stake {
        padding: 14px;
      }
      .amt {
        grid-template-columns: minmax(0, 1fr) auto;

        .btn-solid {
          grid-column: 1 / -1;
        }
      }
    }
    /* Narrow phones: the segmented control takes a full row of equal cells instead of wrapping into a blob */
    @media (max-width: 360px) {
      .seg {
        justify-self: stretch;
        width: 100%;
        display: grid;
        grid-auto-flow: column;
        grid-auto-columns: minmax(0, 1fr);
        border-radius: 18px;
      }
      .seg button {
        height: auto;
        min-height: 36px;
        padding: 4px 6px;
        justify-content: center;
        text-align: center;
        line-height: 1.2;
      }
    }
  `,
})
export class EthicalNodeStakeDemo {
  protected readonly assets = ASSETS;
  protected readonly fmt = fmt;
  private readonly later = txTimers();
  private nextId = 1;

  protected readonly way = signal<Way | null>('wallet');
  protected readonly signing = signal(false);
  protected readonly network = signal('Polygon Mumbai');
  protected readonly tab = signal<Tab>('available');
  protected readonly balance = signal<Record<string, number>>({ ...BALANCE });
  protected readonly staked = signal<Staked[]>(STAKED);
  protected readonly unbonding = signal<Unbonding[]>([]);
  protected readonly picking = signal<string | null>(null);
  protected readonly amount = signal('10');
  protected readonly tx = signal<Tx>(IDLE);
  protected readonly note = signal('Sample data on testnets. Stake an asset, or sign out to see both ways in.');

  protected readonly busy = computed(() => !['idle', 'confirmed', 'rejected'].includes(this.tx().phase));
  protected readonly error = computed(() => {
    const sym = this.picking();
    if (!sym) return '';
    const n = Number(this.amount());
    if (!this.amount() || !(n > 0)) return 'Enter an amount above zero.';
    if (n > this.bal(sym)) return `Your wallet holds ${this.bal(sym)} ${sym}.`;
    return '';
  });

  protected bal(sym: string): number {
    return Math.round((this.balance()[sym] ?? 0) * 100) / 100;
  }

  protected days(sym: string): number {
    return ASSETS.find((a) => a.sym === sym)?.days ?? 0;
  }

  protected connect(w: Way): void {
    this.signing.set(true);
    this.note.set(w === 'wallet' ? 'The wallet signs a one-time message; the API checks the signature.' : 'Web3Auth returns an ID token; the API verifies it.');
    this.later(() => {
      this.signing.set(false);
      this.way.set(w);
      this.note.set('Signed in. Stake from Available, or manage what is staked.');
    }, 900);
  }

  protected signOut(): void {
    this.way.set(null);
    this.tx.set(IDLE);
    this.picking.set(null);
    this.note.set('Signed out. The session is dropped, the wallet disconnected.');
  }

  protected show(t: Tab): void {
    this.tab.set(t);
    this.picking.set(null);
  }

  protected pick(sym: string): void {
    this.picking.set(this.picking() === sym ? null : sym);
    this.amount.set('10');
  }

  protected stake(a: Asset): void {
    const n = Number(this.amount());
    this.run(`stake() on ${a.net}`, a.net, () => {
      this.balance.update((b) => ({ ...b, [a.sym]: b[a.sym] - n }));
      this.staked.update((l) =>
        l.some((s) => s.sym === a.sym) ? l.map((s) => (s.sym === a.sym ? { ...s, amount: s.amount + n } : s)) : [...l, { sym: a.sym, amount: n, reward: 0 }],
      );
      this.picking.set(null);
      this.tab.set('staked');
      this.note.set(`${fmt(n)} ${a.sym} staked. The list changed after the receipt, not before.`);
    });
  }

  protected claim(s: Staked): void {
    this.run(`claimRewards() on ${this.net(s.sym)}`, this.net(s.sym), () => {
      this.balance.update((b) => ({ ...b, [s.sym]: b[s.sym] + s.reward }));
      this.staked.update((l) => l.map((x) => (x.sym === s.sym ? { ...x, reward: 0 } : x)));
      this.note.set(`${fmt(s.reward)} ${s.sym} in rewards sent to the wallet.`);
    });
  }

  protected unstake(s: Staked): void {
    this.run(`unstake(${fmt(s.amount)}) on ${this.net(s.sym)}`, this.net(s.sym), () => {
      this.staked.update((l) => l.filter((x) => x.sym !== s.sym));
      this.unbonding.update((l) => [...l, { id: this.nextId++, sym: s.sym, amount: s.amount + s.reward, approved: false }]);
      this.tab.set('unbonding');
      this.note.set(`Unstake requested. It waits ${this.days(s.sym)} days and needs an admin’s approval.`);
    });
  }

  protected approve(u: Unbonding): void {
    this.unbonding.update((l) => l.map((x) => (x.id === u.id ? { ...x, approved: true } : x)));
    this.tx.set(IDLE);
    this.note.set('Approved from the admin portal (skipping the wait for the demo).');
  }

  protected withdraw(u: Unbonding): void {
    this.run(`withdraw() on ${this.net(u.sym)}`, this.net(u.sym), () => {
      this.balance.update((b) => ({ ...b, [u.sym]: b[u.sym] + u.amount }));
      this.unbonding.update((l) => l.filter((x) => x.id !== u.id));
      this.note.set(`${fmt(u.amount)} ${u.sym} back in the wallet.`);
    });
  }

  protected reset(): void {
    this.way.set('wallet');
    this.signing.set(false);
    this.network.set('Polygon Mumbai');
    this.tab.set('available');
    this.balance.set({ ...BALANCE });
    this.staked.set(STAKED);
    this.unbonding.set([]);
    this.picking.set(null);
    this.tx.set(IDLE);
    this.note.set('Sample portfolio reset.');
  }

  private net(sym: string): string {
    return ASSETS.find((a) => a.sym === sym)?.net ?? '';
  }

  /** Switch network if needed, wait for the wallet, wait for the receipt, then apply. */
  private run(call: string, net: string, apply: () => void): void {
    const hash = fakeHash();
    const switching = this.network() !== net;
    this.tx.set({ phase: switching ? 'switch' : 'wallet', call, hash: '' });
    const t0 = switching ? 800 : 0;
    this.later(() => {
      this.network.set(net);
      this.tx.set({ phase: 'wallet', call, hash: '' });
    }, t0);
    this.later(() => this.tx.set({ phase: 'pending', call, hash }), t0 + 800);
    this.later(() => {
      this.tx.set({ phase: 'confirmed', call, hash });
      apply();
    }, t0 + 2200);
  }
}
