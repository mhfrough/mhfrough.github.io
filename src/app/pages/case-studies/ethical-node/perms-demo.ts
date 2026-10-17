import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { phosphorArrowCounterClockwise, phosphorPlus, phosphorWallet } from '@ng-icons/phosphor-icons/regular';
import { fakeHash, txTimers } from './tx';

/**
 * Mockup of the EthicalNode admin portal's Admin Management screen (my own redraw). The rules are the 2023
 * AdminControl contract's: a super admin adds admins and grants or revokes four permissions, and every change is a
 * contract call (`grantChainManagement(address)` and so on). The wallet asks first; the row shows pending until the
 * receipt arrives and only then flips, the way the portal awaited `transaction.wait()` with a loading state per row
 * and permission. A new admin is listed as pending until its own transaction confirms. Admins are numbered, never
 * named; addresses and hashes are obviously fake samples.
 */
type Perm = 'investors' | 'chains' | 'deposit' | 'withdraw';
type Phase = 'pending' | 'confirmed' | 'rejected';

interface Admin {
  n: number;
  addr: string;
  onChain: 'pending' | 'confirmed';
  perms: Record<Perm, boolean>;
}

interface Logged {
  id: number;
  call: string;
  hash: string;
  phase: Phase;
}

interface Request {
  call: string;
  apply: () => void;
  start?: () => void;
  key?: string;
}

const PERMS: { id: Perm; label: string; fn: string }[] = [
  { id: 'investors', label: 'Investors', fn: 'InvestorManagement' },
  { id: 'chains', label: 'Chains', fn: 'ChainManagement' },
  { id: 'deposit', label: 'Deposits', fn: 'CanDeposit' },
  { id: 'withdraw', label: 'Withdrawals', fn: 'CanWithdraw' },
];

const SEED: Admin[] = [
  { n: 1, addr: '0x5678…ef01', onChain: 'confirmed', perms: { investors: true, chains: true, deposit: false, withdraw: false } },
  { n: 2, addr: '0x9abc…2345', onChain: 'confirmed', perms: { investors: true, chains: false, deposit: true, withdraw: false } },
];

const PHASE: Record<Phase, string> = { pending: 'Pending', confirmed: 'Confirmed', rejected: 'Rejected' };

@Component({
  selector: 'mh-en-perms',
  imports: [NgIcon],
  viewProviders: [provideIcons({ phosphorArrowCounterClockwise, phosphorPlus, phosphorWallet })],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="perms card">
      <header class="p-head">
        <div>
          <h3>Admins</h3>
          <p>Signed in as super admin <span class="mono">0x1234…abcd</span>, Polygon Mumbai</p>
        </div>
        <button type="button" class="reset" aria-label="Reset the sample admins" (click)="reset()">
          <ng-icon name="phosphorArrowCounterClockwise" aria-hidden="true" />
        </button>
      </header>

      <div class="grid">
        <div class="left">
          <ul class="admins" role="list">
            @for (a of admins(); track a.n) {
              <li [attr.data-s]="a.onChain">
                <div class="a-head">
                  <b>Admin {{ a.n }}</b>
                  <span class="mono addr">{{ a.addr }}</span>
                  <span class="st">{{ a.onChain === 'pending' ? 'Pending on chain' : 'Confirmed' }}</span>
                </div>
                <div class="sws">
                  @for (p of perms; track p.id) {
                    <button
                      type="button"
                      role="switch"
                      class="sw"
                      [class.busy]="busy().includes(a.n + p.id)"
                      [attr.aria-checked]="a.perms[p.id]"
                      [attr.aria-busy]="busy().includes(a.n + p.id) || null"
                      [attr.aria-label]="p.label + ' for Admin ' + a.n"
                      [disabled]="!!request() || a.onChain === 'pending' || busy().includes(a.n + p.id)"
                      (click)="flip(a, p.id)"
                    >
                      <i aria-hidden="true"></i>{{ p.label }}
                    </button>
                  }
                </div>
              </li>
            }
          </ul>
          <button type="button" class="btn btn-ghost btn-sm add" [disabled]="!!request() || admins().length >= 4" (click)="add()">
            <ng-icon name="phosphorPlus" aria-hidden="true" /> Add admin
          </button>
        </div>

        <aside class="side" aria-label="Wallet and transactions">
          @if (request(); as r) {
            <div class="wallet" role="group" aria-labelledby="en-w-t">
              <p id="en-w-t" class="w-t"><ng-icon name="phosphorWallet" aria-hidden="true" /> Wallet request</p>
              <p class="mono w-call">{{ r.call }}</p>
              <p class="w-net">AdminControl on Polygon Mumbai, sample gas</p>
              <div class="w-acts">
                <button type="button" class="btn btn-ghost btn-sm" (click)="answer(false)">Reject</button>
                <button type="button" class="btn btn-solid btn-sm" (click)="answer(true)">Confirm</button>
              </div>
            </div>
          } @else {
            <p class="hint">Flip a permission or add an admin. The wallet asks before anything changes.</p>
          }
          <p class="lbl mono">Transactions</p>
          <ol class="log" role="list">
            @for (l of log(); track l.id) {
              <li [attr.data-p]="l.phase">
                <span class="mono l-call">{{ l.call }}</span>
                <span class="mono l-hash">{{ l.hash }}</span>
                <span class="l-st">{{ phase[l.phase] }}</span>
              </li>
            } @empty {
              <li class="none">None yet.</li>
            }
          </ol>
        </aside>
      </div>
      <p class="mono sample" aria-live="polite">{{ note() }}</p>
    </div>
  `,
  styles: `
    :host {
      display: block;
    }
    .perms {
      display: grid;
      gap: 14px;
      padding: 20px;
    }
    .p-head {
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
    .grid {
      display: grid;
      grid-template-columns: minmax(0, 1.35fr) minmax(0, 1fr);
      gap: 16px;
      align-items: start;
    }
    .left {
      display: grid;
      gap: 10px;
      justify-items: start;
    }
    .admins {
      display: grid;
      gap: 8px;
      width: 100%;

      > li {
        display: grid;
        gap: 10px;
        padding: 12px;
        border-radius: var(--r-inner);
        border: 1px solid var(--line);
      }
    }
    .a-head {
      display: flex;
      align-items: center;
      gap: 6px 10px;
      flex-wrap: wrap;

      b {
        font-size: 14px;
        font-weight: 600;
      }
      .addr {
        font-size: 12px;
        color: var(--muted);
      }
    }
    .st {
      margin-left: auto;
      font-size: 12px;
      font-weight: 500;
      padding: 2px 9px;
      border-radius: 999px;
      background: var(--en-green-soft);
      color: var(--en-green-text);
    }
    [data-s='pending'] .st {
      background: var(--en-amber-soft);
      color: var(--en-amber-text);
    }
    .sws {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }
    .sw {
      display: inline-flex;
      align-items: center;
      gap: 7px;
      min-height: 44px;
      padding: 0 12px 0 8px;
      border-radius: 999px;
      border: 1px solid var(--line);
      background: var(--surface);
      font-size: 12.5px;
      font-weight: 500;
      color: var(--ink-2);
      transition: border-color var(--t-base) var(--ease);

      i {
        position: relative;
        width: 26px;
        height: 16px;
        border-radius: 999px;
        background: var(--line-strong);
        transition: background var(--t-base) var(--ease);

        &::after {
          content: '';
          position: absolute;
          top: 2px;
          left: 2px;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #fff;
          transition: transform var(--t-base) var(--ease);
        }
      }
      &[aria-checked='true'] i {
        background: var(--en-blue-text);

        &::after {
          transform: translateX(10px);
        }
      }
      &.busy {
        border-color: var(--en-amber);
        border-style: dashed;
      }
      &:hover:not([disabled]) {
        border-color: var(--en-blue-text);
      }
      &[disabled]:not(.busy) {
        opacity: 0.55;
        cursor: not-allowed;
      }
    }
    .btn-sm {
      height: 40px;
      font-size: 13px;
    }
    .btn[disabled] {
      opacity: 0.45;
      cursor: not-allowed;
    }
    .side {
      display: grid;
      gap: 10px;
      padding: 14px;
      border-radius: var(--r-inner);
      background: var(--surface-2);
    }
    .hint {
      min-height: 64px;
      font-size: 13px;
      color: var(--muted);
    }
    .wallet {
      display: grid;
      gap: 6px;
      padding: 12px;
      border-radius: var(--r-inner);
      background: var(--en-night);
      color: var(--n-ink);

      .w-t {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 13px;
        font-weight: 600;
      }
      .w-call {
        font-size: 12px;
        color: var(--en-teal);
        word-break: break-all;
      }
      .w-net {
        font-size: 12px;
        color: var(--n-muted);
      }
    }
    .w-acts {
      display: flex;
      gap: 6px;
      justify-content: flex-end;

      .btn-ghost {
        background: transparent;
        border-color: rgb(242 246 253 / 0.3);
        color: var(--n-ink);
      }
      .btn-solid {
        background: var(--n-ink);
        color: var(--en-night);
      }
    }
    .lbl {
      font-size: 12px;
      color: var(--muted);
    }
    .log {
      display: grid;
      gap: 6px;

      li {
        display: grid;
        grid-template-columns: minmax(0, 1fr) auto;
        gap: 2px 8px;
        padding: 8px 10px;
        border-radius: 10px;
        background: var(--surface);
        border: 1px solid var(--line);
      }
      .none {
        display: block;
        font-size: 12.5px;
        color: var(--muted);
      }
    }
    .l-call {
      font-size: 12px;
      color: var(--ink);
      word-break: break-all;
    }
    .l-hash {
      grid-row: 2;
      font-size: 12px;
      color: var(--en-blue-text);
    }
    .l-st {
      grid-row: span 2;
      align-self: center;
      font-size: 12px;
      font-weight: 500;
      padding: 2px 8px;
      border-radius: 999px;
      background: var(--en-amber-soft);
      color: var(--en-amber-text);
    }
    [data-p='confirmed'] .l-st {
      background: var(--en-green-soft);
      color: var(--en-green-text);
    }
    [data-p='rejected'] .l-st {
      background: var(--en-red-soft);
      color: var(--en-red-text);
    }
    .sample {
      font-size: 12px;
      color: var(--muted);
      min-height: 14px;
    }
    @media (max-width: 860px) {
      .grid {
        grid-template-columns: 1fr;
      }
    }
    @media (max-width: 460px) {
      .perms {
        padding: 14px;
      }
    }
  `,
})
export class EthicalNodePermsDemo {
  protected readonly perms = PERMS;
  protected readonly phase = PHASE;
  private readonly later = txTimers();
  private nextLog = 1;

  protected readonly admins = signal<Admin[]>(SEED);
  protected readonly log = signal<Logged[]>([]);
  protected readonly busy = signal<string[]>([]);
  protected readonly request = signal<Request | null>(null);
  protected readonly note = signal('Sample admins. Every switch is a contract call.');

  protected readonly count = computed(() => this.admins().length);

  protected flip(a: Admin, p: Perm): void {
    const on = a.perms[p];
    const fn = (on ? 'revoke' : 'grant') + PERMS.find((x) => x.id === p)!.fn;
    const key = a.n + p;
    this.request.set({
      call: `${fn}(${a.addr})`,
      key,
      apply: () => {
        this.admins.update((l) => l.map((x) => (x.n === a.n ? { ...x, perms: { ...x.perms, [p]: !on } } : x)));
        this.note.set(`Admin ${a.n} ${on ? 'lost' : 'gained'} ${PERMS.find((x) => x.id === p)!.label.toLowerCase()}. Their next sign-in reads it from the contract.`);
      },
    });
    this.note.set('The wallet is asking. Confirm or reject.');
  }

  protected add(): void {
    const n = this.count() + 1;
    const addr = ['0xdef0…6789', '0x2468…ace0'][n - 3] ?? '0x1357…bdf9';
    this.request.set({
      call: `addAdmin(${addr})`,
      start: () => {
        this.admins.update((l) => [...l, { n, addr, onChain: 'pending', perms: { investors: false, chains: false, deposit: false, withdraw: false } }]);
      },
      apply: () => {
        this.admins.update((l) => l.map((x) => (x.n === n ? { ...x, onChain: 'confirmed' } : x)));
        this.note.set(`Admin ${n} confirmed on chain, with no permissions until granted.`);
      },
    });
    this.note.set('The API checked the details first. Now the wallet is asking.');
  }

  protected answer(ok: boolean): void {
    const r = this.request();
    if (!r) return;
    this.request.set(null);
    const id = this.nextLog++;
    const hash = ok ? fakeHash() : 'no hash';
    this.log.update((l) => [{ id, call: r.call, hash, phase: ok ? 'pending' : 'rejected' } as Logged, ...l].slice(0, 4));
    if (!ok) {
      this.note.set('Rejected in the wallet. The table did not change.');
      return;
    }
    r.start?.();
    if (r.key) this.busy.update((b) => [...b, r.key!]);
    this.note.set(`Pending, ${hash}. The switch waits for the receipt.`);
    this.later(() => {
      this.log.update((l) => l.map((x) => (x.id === id ? { ...x, phase: 'confirmed' } : x)));
      if (r.key) this.busy.update((b) => b.filter((k) => k !== r.key));
      r.apply();
    }, 1800);
  }

  protected reset(): void {
    this.admins.set(SEED);
    this.log.set([]);
    this.busy.set([]);
    this.request.set(null);
    this.note.set('Sample admins reset.');
  }
}
