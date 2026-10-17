import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { phosphorArrowsClockwise, phosphorBank, phosphorCreditCard, phosphorPlugs } from '@ng-icons/phosphor-icons/regular';

/**
 * One payment request and every way money can arrive for it, redrawn as my own mockup of the reconciliation I
 * wrote. The app's card payment records the payment at once, so the driver sees "Payment complete" without waiting
 * for Stripe; the webhook that follows finds the request already paid and does nothing. A bank transfer waits for
 * staff. The request is marked paid before the receipt PDF is emailed, so a mail failure can never leave it open
 * for a second charge. Sample figures, nothing is charged.
 */
type Status = 'pending' | 'awaiting_bank_confirmation' | 'paid';

interface Log {
  id: number;
  src: string;
  text: string;
  kind: 'rec' | 'noop' | 'wait' | 'warn';
}

const STATUS_LABEL: Record<Status, string> = {
  pending: 'Pending',
  awaiting_bank_confirmation: 'Awaiting bank confirmation',
  paid: 'Paid',
};

@Component({
  selector: 'mh-fleet-payment',
  imports: [NgIcon],
  viewProviders: [provideIcons({ phosphorArrowsClockwise, phosphorBank, phosphorCreditCard, phosphorPlugs })],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="pay">
      <div class="card card--lift req">
        <div class="head">
          <div>
            <p class="mono ref">DRV-4F2A91</p>
            <h3>Weekly hire</h3>
          </div>
          <span class="st" [attr.data-s]="status()">{{ statusLabel[status()] }}</span>
        </div>
        <p class="amt">£210.00</p>

        <div class="ways">
          <button type="button" class="way" (click)="card()" [disabled]="status() === 'awaiting_bank_confirmation'">
            <ng-icon name="phosphorCreditCard" aria-hidden="true" />
            <span><b>Pay with saved card</b><small>Driver app, Stripe PaymentIntent</small></span>
          </button>
          <button type="button" class="way" (click)="webhook()">
            <ng-icon name="phosphorPlugs" aria-hidden="true" />
            <span><b>Stripe webhook arrives</b><small>Signed with this company’s own secret</small></span>
          </button>
          @if (status() === 'awaiting_bank_confirmation') {
            <button type="button" class="way" (click)="confirmBank()">
              <ng-icon name="phosphorBank" aria-hidden="true" />
              <span><b>Staff confirm the transfer</b><small>Admin, after matching the reference</small></span>
            </button>
          } @else {
            <button type="button" class="way" (click)="bank()" [disabled]="status() === 'paid'">
              <ng-icon name="phosphorBank" aria-hidden="true" />
              <span><b>Upload a bank receipt</b><small>Driver app, file checked and scanned</small></span>
            </button>
          }
        </div>

        <label class="check mail">
          <input type="checkbox" [checked]="mailDown()" (change)="mailDown.set(!mailDown())" />
          <span>Mail server is down</span>
        </label>
      </div>

      <div class="log">
        <div class="log-head">
          <p class="mono">Payments recorded: <b>{{ recorded() }}</b></p>
          <button type="button" class="reset" (click)="reset()" aria-label="Reset the sample payment">
            <ng-icon name="phosphorArrowsClockwise" aria-hidden="true" />
          </button>
        </div>
        <ol role="list" aria-live="polite">
          @for (l of logs(); track l.id) {
            <li [attr.data-k]="l.kind">
              <span class="mono src">{{ l.src }}</span>
              <span>{{ l.text }}</span>
            </li>
          } @empty {
            <li class="idle">Try paying by card, then let the webhook arrive. Or send it twice.</li>
          }
        </ol>
        <p class="mono sample">Sample figures, nothing is charged</p>
      </div>
    </div>
  `,
  styles: `
    :host {
      display: block;
    }
    .pay {
      display: grid;
      grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
      gap: 16px;
      align-items: stretch;
    }
    .req {
      display: grid;
      gap: 12px;
      align-content: start;
      padding: 20px;
    }
    .head {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 12px;

      h3 {
        font-size: 16px;
      }
    }
    .ref {
      font-size: 12px;
      color: var(--muted);
    }
    .st {
      padding: 3px 10px;
      border-radius: 99px;
      font-size: 12px;
      font-weight: 500;
      text-align: center;
      background: var(--surface-2);
      color: var(--ink-2);

      &[data-s='awaiting_bank_confirmation'] {
        background: var(--f-amber-soft);
        color: var(--f-amber);
      }
      &[data-s='paid'] {
        background: var(--f-teal-soft);
        color: var(--f-teal);
      }
    }
    .amt {
      font-size: 30px;
      font-weight: 600;
      letter-spacing: -0.03em;
      line-height: 1;
    }
    .ways {
      display: grid;
      gap: 6px;
    }
    .way {
      display: flex;
      align-items: center;
      gap: 12px;
      min-height: 52px;
      padding: 8px 12px;
      border-radius: 12px;
      border: 1px solid var(--line);
      background: var(--bg);
      text-align: left;
      transition: border-color var(--t-fast), background var(--t-fast);

      ng-icon {
        flex: none;
        font-size: 19px;
        color: var(--f-teal);
      }
      b {
        display: block;
        font-size: 13.5px;
        font-weight: 600;
      }
      small {
        display: block;
        font-size: 12px;
        color: var(--muted);
      }
      &:hover:not(:disabled) {
        border-color: var(--f-teal-2);
        background: var(--surface);
      }
      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    }
    .check {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      min-height: 44px;
      font-size: 13.5px;
    }
    .log {
      display: flex;
      flex-direction: column;
      gap: 10px;
      padding: 20px;
      border-radius: var(--r-card);
      background: var(--f-night);
      color: var(--n-ink);
      min-width: 0;
    }
    .log-head {
      display: flex;
      align-items: center;
      justify-content: space-between;

      p {
        font-size: 12px;
        color: var(--n-muted);
      }
      b {
        color: var(--n-teal);
        font-weight: 600;
      }
    }
    .reset {
      display: grid;
      place-items: center;
      width: 44px;
      height: 44px;
      margin: -10px -10px -10px 0;
      border-radius: 50%;
      color: var(--n-muted);
      font-size: 16px;

      &:hover {
        color: var(--n-ink);
        background: var(--f-night-3);
      }
    }
    ol {
      display: grid;
      gap: 6px;
      align-content: start;
    }
    li {
      display: grid;
      gap: 2px;
      padding: 8px 10px;
      border-radius: 10px;
      background: var(--f-night-2);
      border: 1px solid var(--n-muted);
      font-size: 13px;
      line-height: 1.45;

      &[data-k='rec'] {
        border-color: var(--n-teal);
      }
      &[data-k='wait'],
      &[data-k='warn'] {
        border-color: var(--n-amber);
      }
      &.idle {
        border-color: transparent;
        color: var(--n-muted);
      }
    }
    @media (prefers-reduced-motion: no-preference) {
      li:last-child:not(.idle) {
        animation: row-in 0.35s var(--ease) both;
      }
    }
    @keyframes row-in {
      from {
        opacity: 0;
        transform: translateY(-4px);
      }
    }
    .src {
      font-size: 12px;
      color: var(--n-muted);
    }
    .sample {
      margin-top: auto;
      font-size: 12px;
      color: var(--n-muted);
    }
    @media (max-width: 860px) {
      .pay {
        grid-template-columns: 1fr;
      }
    }
  `,
})
export class FleetPaymentDemo {
  protected readonly statusLabel = STATUS_LABEL;
  protected readonly status = signal<Status>('pending');
  protected readonly mailDown = signal(false);
  protected readonly logs = signal<Log[]>([]);
  protected readonly recorded = signal(0);
  private seq = 0;
  private invoice = 41;

  protected card(): void {
    if (this.status() === 'paid') {
      this.log('Driver app', 'Request already paid. Nothing to charge.', 'noop');
      return;
    }
    this.log('Driver app', 'Card charged. Recorded at once, so the driver sees "Payment complete".', 'rec');
    this.settle();
  }

  protected webhook(): void {
    if (this.status() === 'paid') {
      this.log('Webhook', 'Signature checked. Request already paid: no-op, no second record.', 'noop');
      return;
    }
    if (this.status() === 'awaiting_bank_confirmation') {
      this.log('Webhook', 'No card payment for this request. Waiting on staff.', 'noop');
      return;
    }
    this.log('Webhook', 'Signature checked. Payment succeeded: recorded.', 'rec');
    this.settle();
  }

  protected bank(): void {
    this.status.set('awaiting_bank_confirmation');
    this.log('Driver app', 'Receipt uploaded and scanned. Status: awaiting bank confirmation.', 'wait');
  }

  protected confirmBank(): void {
    this.log('Admin', 'Transfer matched to the reference and confirmed: recorded.', 'rec');
    this.settle();
  }

  protected reset(): void {
    this.status.set('pending');
    this.mailDown.set(false);
    this.logs.set([]);
    this.recorded.set(0);
    this.invoice = 41;
  }

  /** Marked paid first, then the receipt: a failed email never reopens the request. */
  private settle(): void {
    this.status.set('paid');
    this.invoice++;
    if (this.mailDown()) {
      this.log('Receipt', `Invoice INV-${this.invoice} saved. Email failed and was logged; the request stays paid.`, 'warn');
    } else {
      this.log('Receipt', `Invoice INV-${this.invoice} drawn as a PDF and emailed to the driver.`, 'noop');
    }
  }

  private log(src: string, text: string, kind: Log['kind']): void {
    if (kind === 'rec') this.recorded.update((n) => n + 1);
    this.logs.update((l) => [...l.slice(-5), { id: ++this.seq, src, text, kind }]);
  }
}
