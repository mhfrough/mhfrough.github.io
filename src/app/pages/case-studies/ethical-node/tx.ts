import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, input } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { phosphorCheck, phosphorCircleNotch, phosphorWallet, phosphorX } from '@ng-icons/phosphor-icons/regular';

/**
 * The transaction lifecycle the three EthicalNode mockups share. The real portals sent every write from the
 * wallet with ethers and waited for the receipt (`await transaction.wait()`) before changing the screen, switching
 * the wallet's network first when the contract lived on another chain. These helpers play that out with timers:
 * nothing touches a chain, every hash and address is an obviously fake sample.
 */
export type TxPhase = 'idle' | 'switch' | 'wallet' | 'pending' | 'confirmed' | 'rejected';

export interface Tx {
  phase: TxPhase;
  /** Contract call in words, e.g. 'stake() on Polygon Mumbai'. */
  call: string;
  hash: string;
}

export const IDLE: Tx = { phase: 'idle', call: '', hash: '' };

/** Sample hashes: a counter spread over hex, cut like a block explorer would. Never a real transaction. */
let seq = 0x5a17;
export function fakeHash(): string {
  seq = (seq * 1103515245 + 12345) & 0x7fffffff;
  const hex = seq.toString(16).padStart(8, '0');
  return `0x${hex.slice(0, 4)}…${hex.slice(4, 8)}`;
}

/** Timers that die with the component, so a half-played transaction never fires after navigation. */
export function txTimers(): (fn: () => void, ms: number) => void {
  const ids = new Set<ReturnType<typeof setTimeout>>();
  inject(DestroyRef).onDestroy(() => ids.forEach(clearTimeout));
  return (fn, ms) => {
    const id = setTimeout(() => {
      ids.delete(id);
      fn();
    }, ms);
    ids.add(id);
  };
}

const STEPS: { phase: TxPhase; label: string }[] = [
  { phase: 'switch', label: 'Network' },
  { phase: 'wallet', label: 'Wallet' },
  { phase: 'pending', label: 'Pending' },
  { phase: 'confirmed', label: 'Confirmed' },
];

/** A compact status strip for one transaction: network switch, wallet, pending with its hash, confirmed. */
@Component({
  selector: 'mh-en-tx',
  imports: [NgIcon],
  viewProviders: [provideIcons({ phosphorCheck, phosphorCircleNotch, phosphorWallet, phosphorX })],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="tx" [attr.data-p]="tx().phase">
      <p class="call">
        <span class="mono">{{ tx().call }}</span>
        @if (tx().hash) {
          <span class="mono hash">{{ tx().hash }}</span>
        }
      </p>
      @if (tx().phase === 'rejected') {
        <p class="rej"><ng-icon name="phosphorX" aria-hidden="true" /> Rejected in the wallet. Nothing changed.</p>
      } @else {
        <ol class="steps" role="list">
          @for (s of steps(); track s.phase; let i = $index) {
            <li [class.done]="i < at()" [class.now]="i === at()">
              <span class="ic" aria-hidden="true">
                @if (i < at() || tx().phase === 'confirmed') {
                  <ng-icon name="phosphorCheck" />
                } @else if (i === at()) {
                  <ng-icon name="phosphorCircleNotch" class="spin" />
                }
              </span>
              {{ s.label }}
            </li>
          }
        </ol>
      }
      <p class="sr-only" aria-live="polite">{{ spoken() }}</p>
    </div>
  `,
  styles: `
    :host {
      display: block;
    }
    .tx {
      display: grid;
      gap: 8px;
      padding: 10px 12px;
      border-radius: var(--r-inner);
      background: var(--surface-2);
      border: 1px solid var(--line);
    }
    .call {
      display: flex;
      justify-content: space-between;
      gap: 10px;
      flex-wrap: wrap;
      font-size: 12px;
      color: var(--ink-2);
    }
    .hash {
      color: var(--en-blue-text);
    }
    .steps {
      display: flex;
      flex-wrap: wrap;
      gap: 4px 12px;

      li {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        font-size: 12px;
        color: var(--muted);
      }
      .done,
      .now {
        color: var(--ink);
        font-weight: 500;
      }
    }
    .ic {
      width: 16px;
      height: 16px;
      display: grid;
      place-items: center;
      border-radius: 50%;
      border: 1px solid var(--line-strong);
      font-size: 12px;
    }
    .done .ic,
    [data-p='confirmed'] .ic {
      background: var(--en-green-text);
      border-color: var(--en-green-text);
      color: #fff;
    }
    .now .ic {
      border-color: var(--en-blue-text);
      color: var(--en-blue-text);
    }
    .rej {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 12.5px;
      color: var(--en-red-text);
    }
    @media (prefers-reduced-motion: no-preference) {
      .spin {
        animation: spin 0.9s linear infinite;
      }
    }
    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }
  `,
})
export class EnTxStrip {
  readonly tx = input.required<Tx>();
  /** Show the network step only for calls that may need the wallet on another chain. */
  readonly network = input(false);

  protected readonly steps = computed(() => (this.network() ? STEPS : STEPS.slice(1)));
  protected readonly at = computed(() => {
    const p = this.tx().phase;
    const i = this.steps().findIndex((s) => s.phase === p);
    return p === 'confirmed' ? this.steps().length : Math.max(i, 0);
  });
  protected readonly spoken = computed(() => {
    const t = this.tx();
    switch (t.phase) {
      case 'switch':
        return 'Switching the wallet network.';
      case 'wallet':
        return 'Waiting for the wallet.';
      case 'pending':
        return `Transaction pending, ${t.hash}.`;
      case 'confirmed':
        return `Confirmed: ${t.call}.`;
      case 'rejected':
        return 'Rejected in the wallet. Nothing changed.';
      default:
        return '';
    }
  });
}
