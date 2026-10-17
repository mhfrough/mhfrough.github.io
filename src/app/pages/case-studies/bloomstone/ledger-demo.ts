import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { phosphorArrowCounterClockwise, phosphorFilePdf } from '@ng-icons/phosphor-icons/regular';

/**
 * The admin's payment ledger for one booking, redrawn as my own mockup. Same model as the real one: every
 * payment is a signed entry, refunds and deposit returns are negative, and the balance is the charge minus
 * the net received. Returning the deposit is one more row, and the balance settles to zero. Sample figures.
 */
interface Entry {
  type: string;
  method: string;
  amount: number;
}

const CHARGED = 135_000; // 10-hour slot, weekend rate
const SEED: Entry[] = [
  { type: 'Booking fee', method: 'Bank transfer', amount: 50_000 },
  { type: 'Booking fee', method: 'Cash', amount: 85_000 },
  { type: 'Deposit', method: 'Cash', amount: 30_000 },
];
const RETURN: Entry = { type: 'Deposit return', method: 'Cash', amount: -30_000 };

const pkr = new Intl.NumberFormat('en-PK', { maximumFractionDigits: 0 });

@Component({
  selector: 'mh-bloomstone-ledger',
  imports: [NgIcon],
  viewProviders: [provideIcons({ phosphorArrowCounterClockwise, phosphorFilePdf })],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="card card--lift led">
      <div class="led-head">
        <div>
          <h3>{{ title() }}</h3>
          <p class="mono">BLM-2026-0142, Day slot</p>
        </div>
        <span class="state" [class.done]="returned()">{{ returned() ? 'Settled' : 'Deposit held' }}</span>
      </div>

      <ul class="rows" role="list">
        @for (e of entries(); track $index) {
          <li [class.neg]="e.amount < 0">
            <div>
              <b>{{ e.type }}</b>
              <span>{{ e.method }}</span>
            </div>
            <span class="amt mono">{{ e.amount < 0 ? '-' : '+' }}Rs {{ fmt(abs(e.amount)) }}</span>
            <ng-icon name="phosphorFilePdf" class="pdf" aria-hidden="true" />
          </li>
        }
      </ul>

      <dl class="sum">
        <div><dt>Charged</dt><dd class="mono">Rs {{ fmt(charged) }}</dd></div>
        <div><dt>Received</dt><dd class="mono">Rs {{ fmt(received()) }}</dd></div>
        <div><dt>Refunded</dt><dd class="mono">Rs {{ fmt(refunded()) }}</dd></div>
        <div class="bal"><dt>Balance</dt><dd class="mono">{{ balance() < 0 ? '-' : '' }}Rs {{ fmt(abs(balance())) }}</dd></div>
      </dl>

      <div class="acts">
        @if (!returned()) {
          <button type="button" class="btn btn-solid btn-sm" (click)="returnDeposit()">Return deposit</button>
        } @else {
          <button type="button" class="btn btn-ghost btn-sm" (click)="reset()">
            <ng-icon name="phosphorArrowCounterClockwise" aria-hidden="true" /> Reset
          </button>
        }
        <span class="mono sample">Sample figures</span>
      </div>
      <p class="sr-only" aria-live="polite">{{ returned() ? 'Deposit returned. Balance settled.' : '' }}</p>
    </div>
  `,
  styles: `
    :host {
      display: block;
    }
    .led {
      padding: 18px 20px;
    }
    .led-head {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 12px;
      margin-bottom: 12px;

      h3 {
        font-size: 15px;
      }
      p {
        font-size: 12px;
        color: var(--muted);
        margin-top: 2px;
      }
    }
    .state {
      font-size: 12px;
      font-weight: 500;
      padding: 3px 10px;
      border-radius: 999px;
      background: var(--b-bronze-soft, var(--accent-soft));
      color: var(--b-bronze, var(--ink));
      white-space: nowrap;

      &.done {
        background: var(--b-olive-soft, var(--accent-soft));
        color: var(--b-olive, var(--ink));
      }
    }
    .rows {
      display: grid;
      border-top: 1px solid var(--line);

      li {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 9px 0;
        border-bottom: 1px solid var(--line);

        div {
          flex: 1;
        }
        b {
          display: block;
          font-size: 13.5px;
          font-weight: 600;
        }
        span {
          font-size: 12px;
          color: var(--muted);
        }
      }
    }
    @media (prefers-reduced-motion: no-preference) {
      .rows li:last-child {
        animation: row-in 0.4s var(--ease) both;
      }
    }
    @keyframes row-in {
      from {
        opacity: 0;
        transform: translateY(-4px);
      }
    }
    .amt {
      font-size: 12.5px !important;
      color: var(--ink) !important;
    }
    .neg .amt {
      color: var(--b-bronze, var(--ink)) !important;
    }
    .pdf {
      font-size: 16px;
      color: var(--muted);
    }
    .sum {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px 16px;
      margin: 14px 0;

      dt {
        font-size: 12px;
        color: var(--muted);
      }
      dd {
        margin: 1px 0 0;
        font-size: 13px;
      }
      .bal dd {
        font-weight: 600;
        color: var(--b-olive, var(--ink));
      }
    }
    .acts {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
    }
    .sample {
      font-size: 12px;
      color: var(--muted);
    }
  `,
})
export class BloomstoneLedgerDemo {
  readonly title = input('Payments');
  protected readonly charged = CHARGED;
  protected readonly returned = signal(false);
  protected readonly entries = computed(() => (this.returned() ? [...SEED, RETURN] : SEED));
  protected readonly received = computed(() => this.entries().reduce((t, e) => t + Math.max(e.amount, 0), 0));
  protected readonly refunded = computed(() => this.entries().reduce((t, e) => t + Math.max(-e.amount, 0), 0));
  protected readonly balance = computed(() => CHARGED - (this.received() - this.refunded()));

  protected fmt(n: number): string {
    return pkr.format(n);
  }

  protected abs(n: number): number {
    return Math.abs(n);
  }

  protected returnDeposit(): void {
    this.returned.set(true);
  }

  protected reset(): void {
    this.returned.set(false);
  }
}
