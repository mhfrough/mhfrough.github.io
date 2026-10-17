import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  phosphorArrowCounterClockwise,
  phosphorArrowLeft,
  phosphorArrowRight,
  phosphorBank,
  phosphorCheck,
  phosphorImage,
  phosphorUploadSimple,
} from '@ng-icons/phosphor-icons/regular';

/**
 * The two payment flows LLC SAVVY had, as my own walk-through mockup. Bank transfer (from Jan 2024): the customer
 * uploads a receipt (compressed in the browser first) and staff confirm or delete the request after looking at it.
 * Direct debit (from Jun 2024): the gateway validates the customer with their bank and asks for a one-time password
 * only when that bank does. Who acts at each step and what they decide follow the original code; every name,
 * number and amount is invented, and no account details are shown.
 */
type Mode = 'transfer' | 'debit';
type Actor = 'Customer' | 'Staff' | 'Gateway';

interface Step {
  id: string;
  actor: Actor;
  t: string;
  s: string;
}

const FLOWS: Record<Mode, Step[]> = {
  transfer: [
    { id: 'cart', actor: 'Customer', t: 'Choose bank transfer', s: 'The cart shows the rupee total and the account to send it to.' },
    { id: 'receipt', actor: 'Customer', t: 'Upload the receipt', s: 'A photo of the transfer slip, compressed in the browser before it is sent.' },
    { id: 'review', actor: 'Staff', t: 'Review the request', s: 'The customer, their ID number, the cart lines and the receipt, side by side.' },
    { id: 'done', actor: 'Staff', t: 'Confirm or delete', s: 'A confirmed request moves the order to New; a deleted one leaves the cart waiting.' },
  ],
  debit: [
    { id: 'details', actor: 'Customer', t: 'Enter bank details', s: 'Bank, account, mobile, email and national ID, masked as it is typed.' },
    { id: 'validate', actor: 'Gateway', t: 'Validate with the bank', s: 'The bank answers whether this customer needs a one-time password.' },
    { id: 'otp', actor: 'Customer', t: 'Type the OTP', s: 'Six digits from the bank, with a 60 second timer and a resend link.' },
    { id: 'done', actor: 'Gateway', t: 'Start the payment', s: 'The debit starts and the order moves to New. Nobody checks a picture.' },
  ],
};

@Component({
  selector: 'mh-llcsavvy-pay',
  imports: [NgIcon],
  viewProviders: [
    provideIcons({
      phosphorArrowCounterClockwise,
      phosphorArrowLeft,
      phosphorArrowRight,
      phosphorBank,
      phosphorCheck,
      phosphorImage,
      phosphorUploadSimple,
    }),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="pay card">
      <div class="p-head">
        <span class="mono lbl" id="lp-mode">Flow</span>
        <div class="seg" role="group" aria-labelledby="lp-mode">
          <button type="button" [attr.aria-pressed]="mode() === 'transfer'" (click)="setMode('transfer')">
            Bank transfer <span class="mono when">Jan 2024</span>
          </button>
          <button type="button" [attr.aria-pressed]="mode() === 'debit'" (click)="setMode('debit')">
            Direct debit <span class="mono when">Jun 2024</span>
          </button>
        </div>
        <button type="button" class="reset" aria-label="Start this flow again" (click)="restart()">
          <ng-icon name="phosphorArrowCounterClockwise" aria-hidden="true" />
        </button>
      </div>

      <div class="body">
        <ol class="steps" role="list">
          @for (s of steps(); track s.id; let i = $index) {
            <li [class.now]="i === at()" [class.past]="i < at()" [class.skip]="skipped(s.id)">
              <span class="num mono" aria-hidden="true">
                @if (i < at() && !skipped(s.id)) {
                  <ng-icon name="phosphorCheck" />
                } @else {
                  {{ i + 1 }}
                }
              </span>
              <div>
                <p class="who"><span [class]="'actor actor--' + s.actor.toLowerCase()">{{ s.actor }}</span></p>
                <h3>
                  {{ s.t }}
                  @if (skipped(s.id)) {
                    <span class="sr-only">, skipped</span>
                  }
                  @if (i === at()) {
                    <span class="sr-only">, current step</span>
                  }
                </h3>
                <p>{{ skipped(s.id) ? 'Skipped: this bank needs no one-time password.' : s.s }}</p>
              </div>
            </li>
          }
        </ol>

        <div class="screen" aria-live="polite">
          @switch (current().id) {
            @case ('cart') {
              <p class="mono cap">Customer, cart</p>
              <div class="tile">
                <span class="row"><span>Total</span><b class="mono">$301</b></span>
                <span class="row green"><span>In rupees</span><b class="mono">Rs 83,798</b></span>
              </div>
              <div class="tile dashed">
                <ng-icon name="phosphorBank" aria-hidden="true" />
                <span>Account details for the transfer appear here</span>
              </div>
            }
            @case ('receipt') {
              <p class="mono cap">Customer, receipt</p>
              <div class="tile up">
                <span class="thumb" aria-hidden="true"><ng-icon name="phosphorImage" /></span>
                <span class="grow"><b>transfer-slip.jpg</b><small class="mono">compressed, then sent as base64</small></span>
                <ng-icon name="phosphorUploadSimple" aria-hidden="true" />
              </div>
              <p class="hint">The request waits in the staff queue, with the cart attached.</p>
            }
            @case ('review') {
              <p class="mono cap">Staff, transfer request</p>
              <dl class="req">
                <div><dt>Customer</dt><dd>Founder A</dd></div>
                <div><dt>National ID</dt><dd class="mono">•••••-•••••••-3</dd></div>
                <div><dt>Cart</dt><dd>Formation and EIN, Wyoming</dd></div>
                <div><dt>Receipt</dt><dd class="mono">transfer-slip.jpg</dd></div>
              </dl>
              <div class="two">
                <button type="button" class="btn btn-ghost btn-sm del" (click)="decide('delete')">Delete</button>
                <button type="button" class="btn btn-solid btn-sm" (click)="decide('confirm')">Confirm</button>
              </div>
            }
            @case ('details') {
              <p class="mono cap">Customer, bank details</p>
              <div class="tile mini">
                <span class="row"><span>Bank</span><b>Sample Bank A</b></span>
                <span class="row"><span>Account</span><b class="mono">••••••7890</b></span>
                <span class="row"><span>National ID</span><b class="mono">12345-6789012-3</b></span>
              </div>
            }
            @case ('validate') {
              <p class="mono cap">Gateway, validation</p>
              <label class="check-row">
                <input type="checkbox" [checked]="otpNeeded()" (change)="otpNeeded.set($any($event.target).checked)" />
                <span>This bank asks for a one-time password</span>
              </label>
              <p class="hint">{{ otpNeeded() ? 'Next: the OTP screen and its 60 second timer.' : 'Next: straight to the payment, no OTP screen.' }}</p>
            }
            @case ('otp') {
              <p class="mono cap">Customer, one-time password</p>
              <div class="boxes mono" aria-label="Six digit code, sample">
                @for (d of otpDigits; track $index) {
                  <span>{{ d }}</span>
                }
              </div>
              <p class="hint mono">0:42 left · Resend</p>
            }
            @default {
              @if (mode() === 'transfer' && decision() === 'delete') {
                <div class="end warn">
                  <b>Request deleted</b>
                  <span>The order stays at Payment and the cart waits for a new transfer.</span>
                </div>
              } @else {
                <div class="end">
                  <span class="ok" aria-hidden="true"><ng-icon name="phosphorCheck" /></span>
                  <b>Order moved to New</b>
                  <span>{{ mode() === 'transfer' ? 'After a person looked at the receipt.' : 'Confirmed by the bank itself.' }}</span>
                </div>
              }
            }
          }
        </div>
      </div>

      <div class="foot">
        <button type="button" class="btn btn-ghost btn-sm" [disabled]="at() === 0" (click)="back()">
          <ng-icon name="phosphorArrowLeft" aria-hidden="true" /> Back
        </button>
        <p class="mono people">{{ mode() === 'transfer' ? 'A person checks every payment' : 'No person in the loop' }}</p>
        <button type="button" class="btn btn-solid btn-sm" [disabled]="!canNext()" (click)="next()">
          Next <ng-icon name="phosphorArrowRight" aria-hidden="true" />
        </button>
      </div>
    </div>
  `,
  styles: `
    :host {
      display: block;
    }
    .pay {
      display: grid;
      gap: 16px;
      padding: 20px;
    }
    .p-head {
      display: flex;
      align-items: center;
      gap: 10px;
      flex-wrap: wrap;

      .seg {
        flex-wrap: wrap;
      }
      .seg button {
        height: 36px;
        padding: 0 14px;
        font-size: 13px;
      }
      .when {
        margin-left: 6px;
        font-size: 12px;
      }

      /* Phones: the two flows share one full-width row, each date under its name */
      @media (max-width: 520px) {
        .seg {
          order: 3;
          width: 100%;
          display: grid;
          grid-template-columns: 1fr 1fr;
        }
        .seg button {
          height: auto;
          min-height: 44px;
          padding: 4px 8px;
          flex-direction: column;
          justify-content: center;
          line-height: 1.25;
        }
        .when {
          margin-left: 0;
        }
      }
    }
    .lbl {
      font-size: 12px;
      color: var(--muted);
    }
    .reset {
      width: 44px;
      height: 44px;
      margin-left: auto;
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
    .body {
      display: grid;
      grid-template-columns: minmax(0, 1.15fr) minmax(0, 1fr);
      gap: 16px;
      align-items: start;
    }
    .steps {
      display: grid;
      gap: 6px;

      li {
        display: grid;
        grid-template-columns: 30px minmax(0, 1fr);
        gap: 12px;
        padding: 10px 12px;
        border-radius: var(--r-inner);
        border: 1px solid var(--line);
        background: var(--bg);
        transition:
          border-color var(--t-base) var(--ease),
          background-color var(--t-base) var(--ease);

        &.now {
          border-color: var(--l-navy);
          background: var(--surface);
          box-shadow: var(--shadow);
        }
        &.skip {
          opacity: 0.6;

          h3 {
            text-decoration: line-through;
          }
        }
      }
      h3 {
        font-size: 14px;
        font-weight: 600;
      }
      p {
        font-size: 13px;
        color: var(--ink-2);
      }
    }
    .num {
      display: grid;
      place-items: center;
      width: 30px;
      height: 30px;
      border-radius: 50%;
      background: var(--surface);
      box-shadow: inset 0 0 0 2px var(--line-strong);
      color: var(--muted);
      font-size: 12px;
    }
    .now .num {
      background: var(--l-navy);
      box-shadow: none;
      color: #fff;
    }
    .past:not(.skip) .num {
      background: var(--l-green-soft);
      box-shadow: none;
      color: var(--l-green-text);
    }
    .who {
      margin-bottom: 2px;
    }
    .actor {
      display: inline-block;
      padding: 1px 8px;
      border-radius: 999px;
      font-size: 12px;
      font-weight: 500;
    }
    .actor--customer {
      background: var(--l-navy-soft);
      color: var(--l-navy);
    }
    .actor--staff {
      background: var(--l-amber-soft);
      color: var(--l-amber-text);
    }
    .actor--gateway {
      background: var(--l-green-soft);
      color: var(--l-green-text);
    }
    .screen {
      position: sticky;
      top: calc(var(--nav-h, 52px) + 24px);
      display: grid;
      gap: 10px;
      align-content: start;
      min-height: 250px;
      padding: 16px;
      border-radius: var(--r-card);
      background: var(--l-night);
      color: var(--n-ink);
      box-shadow: var(--shadow-lg);
    }
    .cap {
      font-size: 12px;
      color: var(--n-muted);
    }
    .tile {
      display: grid;
      gap: 6px;
      padding: 12px;
      border-radius: var(--r-inner);
      background: var(--l-night-2);
      font-size: 13px;

      &.dashed {
        display: flex;
        align-items: center;
        gap: 10px;
        background: transparent;
        border: 1px dashed var(--l-night-line-strong);
        color: var(--n-muted);

        ng-icon {
          font-size: 20px;
        }
      }
      &.up {
        display: flex;
        align-items: center;
        gap: 10px;

        ng-icon {
          font-size: 18px;
          color: var(--n-green);
        }
      }
    }
    .row {
      display: flex;
      justify-content: space-between;
      gap: 10px;

      span {
        color: var(--n-muted);
      }
      b {
        font-weight: 500;
      }
      &.green b {
        color: var(--n-green);
      }
    }
    .thumb {
      display: grid;
      place-items: center;
      width: 40px;
      height: 40px;
      border-radius: 8px;
      background: var(--l-night-line);
      color: var(--n-muted);
    }
    .grow {
      flex: 1;
      display: grid;
      min-width: 0;

      b {
        font-weight: 500;
      }
      small {
        font-size: 12px;
        color: var(--n-muted);
      }
    }
    .hint {
      font-size: 12px;
      color: var(--n-muted);
    }
    .req {
      display: grid;
      gap: 4px;
      margin: 0;
      padding: 12px;
      border-radius: var(--r-inner);
      background: var(--l-night-2);

      div {
        display: flex;
        justify-content: space-between;
        gap: 10px;
        font-size: 12.5px;
      }
      dt {
        color: var(--n-muted);
      }
      dd {
        margin: 0;
        text-align: right;
      }
    }
    .two {
      display: flex;
      justify-content: flex-end;
      gap: 8px;

      .del {
        background: transparent;
        border-color: var(--l-night-line-strong);
        color: var(--n-ink);
      }
    }
    .check-row {
      display: flex;
      align-items: center;
      gap: 10px;
      min-height: 44px;
      padding: 0 12px;
      border-radius: var(--r-inner);
      background: var(--l-night-2);
      font-size: 13px;
      cursor: pointer;

      input {
        width: 18px;
        height: 18px;
        accent-color: var(--n-green);
      }
    }
    .boxes {
      display: grid;
      grid-template-columns: repeat(6, minmax(0, 1fr));
      gap: 6px;

      span {
        display: grid;
        place-items: center;
        height: 42px;
        border-radius: 8px;
        background: var(--l-night-2);
        border: 1px solid var(--l-night-line-strong);
        font-size: 18px;
      }
    }
    .end {
      display: grid;
      justify-items: center;
      gap: 4px;
      padding: 20px 10px;
      text-align: center;
      font-size: 13px;
      color: var(--n-muted);

      b {
        font-size: 15px;
        font-weight: 600;
        color: var(--n-ink);
      }
      &.warn b {
        color: var(--n-amber);
      }
    }
    .ok {
      display: grid;
      place-items: center;
      width: 40px;
      height: 40px;
      margin-bottom: 4px;
      border-radius: 50%;
      background: var(--n-green);
      color: var(--l-night);
      font-size: 20px;
    }
    .foot {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      flex-wrap: wrap;

      .btn[disabled] {
        opacity: 0.45;
        cursor: not-allowed;
      }
    }
    .people {
      font-size: 12px;
      color: var(--muted);
    }
    @media (max-width: 820px) {
      .body {
        grid-template-columns: 1fr;
      }
      .screen {
        position: static;
        min-height: 0;
      }
    }
    @media (max-width: 460px) {
      .pay {
        padding: 14px;
      }
      .people {
        order: 3;
        flex-basis: 100%;
        text-align: center;
      }
    }
  `,
})
export class LlcsavvyPayDemo {
  protected readonly mode = signal<Mode>('transfer');
  protected readonly at = signal(0);
  protected readonly decision = signal<'confirm' | 'delete' | null>(null);
  protected readonly otpNeeded = signal(true);
  protected readonly otpDigits = ['4', '0', '9', '2', '1', '7'];

  protected readonly steps = computed(() => FLOWS[this.mode()]);
  protected readonly current = computed(() => this.steps()[this.at()]);
  /** On the review step the staff decision is the way forward, so Next waits for it. */
  protected readonly canNext = computed(() => {
    if (this.at() >= this.steps().length - 1) return false;
    return this.current().id !== 'review' || this.decision() !== null;
  });

  protected skipped(id: string): boolean {
    return this.mode() === 'debit' && id === 'otp' && !this.otpNeeded();
  }

  protected setMode(m: Mode): void {
    this.mode.set(m);
    this.restart();
  }

  protected restart(): void {
    this.at.set(0);
    this.decision.set(null);
    this.otpNeeded.set(true);
  }

  protected next(): void {
    let i = this.at() + 1;
    if (this.skipped(this.steps()[i]?.id)) i++;
    this.at.set(Math.min(i, this.steps().length - 1));
  }

  protected back(): void {
    let i = this.at() - 1;
    if (this.skipped(this.steps()[i]?.id)) i--;
    this.at.set(Math.max(0, i));
    if (this.current().id === 'review') this.decision.set(null);
  }

  protected decide(d: 'confirm' | 'delete'): void {
    this.decision.set(d);
    this.at.set(this.steps().length - 1);
  }
}
