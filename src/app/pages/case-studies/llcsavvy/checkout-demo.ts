import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { phosphorArrowCounterClockwise, phosphorArrowLeft, phosphorCheck, phosphorX } from '@ng-icons/phosphor-icons/regular';

/**
 * Hero mockup of the LLC SAVVY checkout (my own redraw, not a screenshot). It follows the original's three screens
 * and rules: the cart groups lines by company, each line is the service price plus its state fee in dollars, every
 * subtotal and the total add their rupee amount at the day's rate, a promo code is sent to the server which answers
 * with repriced lines, the direct debit asks for bank, account, mobile, email and the national ID (masked
 * 00000-0000000-0), and a one-time password with a 60 second timer follows only when the chosen bank asks for one.
 * Companies, banks, the rate, the promo code and its prices are invented; the $102 is the public site's own price.
 */
interface Line {
  id: number;
  product: string;
  amount: number;
  fee: number;
  /** The sample promo code's price for this product, when it covers it. */
  promo?: number;
}

interface Group {
  company: string;
  state: string;
  lines: Line[];
}

const SEED: Group[] = [
  {
    company: 'Sample Labs LLC',
    state: 'Wyoming',
    lines: [
      { id: 1, product: 'Company formation', amount: 102, fee: 100, promo: 82 },
      { id: 2, product: 'EIN', amount: 99, fee: 0, promo: 79 },
    ],
  },
  {
    company: 'Second Sample LLC',
    state: 'New Mexico',
    lines: [
      { id: 3, product: 'Company formation', amount: 102, fee: 50, promo: 82 },
      { id: 4, product: 'US mailing address', amount: 49, fee: 0 },
    ],
  },
];

const BANKS = [
  { id: 'a', name: 'Sample Bank A, asks for an OTP', otp: true },
  { id: 'b', name: 'Sample Bank B, no OTP', otp: false },
];

const RATE = 278.4; // sample PKR per USD
const CODE = 'SAVVY24';
const SCREENS = ['Cart', 'Bank details', 'One-time password'];
const OTP_SECONDS = 60;

const usd = (n: number) => '$' + n.toLocaleString('en-US');
const pkr = (n: number) => 'Rs ' + Math.round(n * RATE).toLocaleString('en-US');

@Component({
  selector: 'mh-llcsavvy-checkout',
  imports: [NgIcon],
  viewProviders: [provideIcons({ phosphorArrowCounterClockwise, phosphorArrowLeft, phosphorCheck, phosphorX })],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="co card card--lift">
      <header class="c-head">
        <img src="/images/llcsavvy/llcsavvy-mark.webp" width="32" height="32" alt="" />
        <div>
          <h2>Checkout</h2>
          <p>
            @if (screen() < 3) {
              Screen <b class="mono">{{ screen() + 1 }}</b> of 3, {{ screens[screen()] }}
            } @else {
              Paid
            }
          </p>
        </div>
        <button type="button" class="reset" aria-label="Reset the sample checkout" (click)="reset()">
          <ng-icon name="phosphorArrowCounterClockwise" aria-hidden="true" />
        </button>
      </header>

      <ol class="bar" role="list" aria-label="Checkout progress">
        @for (s of screens; track s; let i = $index) {
          <li [class.done]="i < screen()" [class.now]="i === screen()">
            <span class="sr-only">{{ s }}{{ i < screen() ? ', done' : i === screen() ? ', current' : '' }}</span>
          </li>
        }
      </ol>

      @switch (screen()) {
        @case (0) {
          @if (groups().length) {
            <div class="cart">
              @for (g of groups(); track g.company) {
                <div class="grp">
                  <p class="co-name"><b>{{ g.company }}</b> <span class="mono">{{ g.state }}</span></p>
                  <ul role="list">
                    @for (l of g.lines; track l.id) {
                      <li class="line">
                        <span class="p">{{ l.product }}</span>
                        <span class="amt">
                          @if (applied() && l.promo !== undefined) {
                            <s class="mono">{{ usd(l.amount) }}</s>
                          }
                          <b class="mono">{{ usd(price(l)) }}</b>
                          @if (l.fee) {
                            <small class="mono">+ {{ usd(l.fee) }} state fee</small>
                          }
                        </span>
                        <button type="button" class="del" [attr.aria-label]="'Remove ' + l.product + ' for ' + g.company" (click)="remove(l.id)">
                          <ng-icon name="phosphorX" aria-hidden="true" />
                        </button>
                      </li>
                    }
                  </ul>
                  <p class="sub">
                    <span>Subtotal</span>
                    <span class="mono"><b>{{ usd(sub(g)) }}</b> <small>{{ pkr(sub(g)) }}</small></span>
                  </p>
                </div>
              }
            </div>

            <div class="promo">
              <p class="rate mono">PKR {{ rate }} per dollar, sample rate</p>
              @if (!promoOpen()) {
                <button type="button" class="link" (click)="promoOpen.set(true)">Promo code</button>
              }
            </div>
            @if (promoOpen()) {
              <div class="promo-row">
                <label class="sr-only" for="ls-promo">Promo code</label>
                <input
                  id="ls-promo"
                  class="input mono"
                  [value]="code()"
                  placeholder="Try {{ sampleCode }}"
                  autocomplete="off"
                  aria-describedby="ls-promo-note"
                  (input)="code.set($any($event.target).value)"
                  (keydown.enter)="apply()"
                />
                <button type="button" class="btn btn-ghost btn-sm" (click)="apply()">Apply</button>
              </div>
            }

            <div class="total">
              <span>Total</span>
              <span class="mono"><b>{{ usd(total()) }}</b> <small>{{ pkr(total()) }}</small></span>
            </div>
            <button type="button" class="btn btn-solid go" (click)="screen.set(1); note.set('Sample details are filled in. Change any field, or continue.')">
              Proceed to payment
            </button>
          } @else {
            <p class="empty">The cart is empty. Reset to bring the sample back.</p>
          }
        }
        @case (1) {
          <div class="form">
            <div class="field wide">
              <label class="field__label" for="ls-bank">Bank</label>
              <select id="ls-bank" class="select" (change)="bank.set($any($event.target).value)">
                @for (b of banks; track b.id) {
                  <option [value]="b.id" [selected]="b.id === bank()">{{ b.name }}</option>
                }
              </select>
            </div>
            <div class="field">
              <label class="field__label" for="ls-acc">Account no.</label>
              <input id="ls-acc" class="input mono" inputmode="numeric" [value]="acc()" [attr.aria-invalid]="shown() && !accOk()" [attr.aria-describedby]="shown() && !accOk() ? 'ls-acc-e' : null" (input)="acc.set(digits($any($event.target).value, 20))" />
              @if (shown() && !accOk()) {
                <span class="field__error" id="ls-acc-e">At least 8 digits</span>
              }
            </div>
            <div class="field">
              <label class="field__label" for="ls-mob">Mobile no.</label>
              <input id="ls-mob" class="input mono" type="tel" [value]="mob()" [attr.aria-invalid]="shown() && !mobOk()" [attr.aria-describedby]="shown() && !mobOk() ? 'ls-mob-e' : null" (input)="mob.set(digits($any($event.target).value, 13))" />
              @if (shown() && !mobOk()) {
                <span class="field__error" id="ls-mob-e">11 to 13 digits</span>
              }
            </div>
            <div class="field">
              <label class="field__label" for="ls-mail">Email address</label>
              <input id="ls-mail" class="input" type="email" [value]="mail()" [attr.aria-invalid]="shown() && !mailOk()" [attr.aria-describedby]="shown() && !mailOk() ? 'ls-mail-e' : null" (input)="mail.set($any($event.target).value)" />
              @if (shown() && !mailOk()) {
                <span class="field__error" id="ls-mail-e">A valid email</span>
              }
            </div>
            <div class="field">
              <label class="field__label" for="ls-id">National ID</label>
              <input
                id="ls-id"
                class="input mono"
                inputmode="numeric"
                placeholder="00000-0000000-0"
                [value]="idNo()"
                [attr.aria-invalid]="shown() && !idOk()"
                [attr.aria-describedby]="shown() && !idOk() ? 'ls-id-e' : 'ls-id-h'"
                (input)="setId($any($event.target))"
              />
              @if (shown() && !idOk()) {
                <span class="field__error" id="ls-id-e">13 digits</span>
              } @else {
                <span class="field__hint sr-only" id="ls-id-h">Masked as 00000-0000000-0 while you type</span>
              }
            </div>
          </div>
          <div class="acts">
            <button type="button" class="btn btn-ghost btn-sm" (click)="screen.set(0)">
              <ng-icon name="phosphorArrowLeft" aria-hidden="true" /> Cart
            </button>
            <button type="button" class="btn btn-solid" (click)="submit()">Continue, {{ pkr(total()) }}</button>
          </div>
        }
        @case (2) {
          <div class="otp">
            <p class="otp-t">Enter the one-time password your bank sent to your phone or email.</p>
            <label class="field__label" for="ls-otp">One-time password</label>
            <input
              id="ls-otp"
              class="input mono otp-in"
              inputmode="numeric"
              autocomplete="one-time-code"
              [value]="otp()"
              [attr.aria-invalid]="otpError()"
              aria-describedby="ls-otp-h"
              (input)="otp.set(digits($any($event.target).value, 6)); otpError.set(false)"
              (keydown.enter)="verify()"
            />
            <p class="otp-h mono" id="ls-otp-h">
              @if (left() > 0) {
                {{ left() }} s left. Any six digits work here.
              } @else {
                Time is up. Resend for a new code.
              }
            </p>
          </div>
          <div class="acts">
            <button type="button" class="btn btn-ghost btn-sm" (click)="resend()">Resend</button>
            <button type="button" class="btn btn-solid" (click)="verify()">Verify</button>
          </div>
        }
        @default {
          <div class="paid">
            <span class="ok" aria-hidden="true"><ng-icon name="phosphorCheck" /></span>
            <p><b>{{ pkr(total()) }} debited</b> for {{ usd(total()) }}.</p>
            <p class="muted">The order moves from Payment to New in the back office.</p>
          </div>
          <button type="button" class="btn btn-ghost go" (click)="reset()">Start over</button>
        }
      }

      <p class="mono sample" id="ls-promo-note" aria-live="polite">{{ note() }}</p>
    </div>
  `,
  styles: `
    :host {
      display: block;
    }
    .co {
      display: grid;
      gap: 12px;
      padding: 18px;
    }
    .c-head {
      display: flex;
      align-items: center;
      gap: 12px;

      img {
        width: 40px;
        height: 40px;
        padding: 4px;
        border-radius: 11px;
        background: var(--surface);
        border: 1px solid var(--line);
      }
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
    .reset,
    .del {
      width: 44px;
      height: 44px;
      flex-shrink: 0;
      display: grid;
      place-items: center;
      border-radius: 999px;
      color: var(--ink-2);
      font-size: 17px;
    }
    .reset {
      border: 1px solid var(--line);

      &:hover {
        background: var(--surface-2);
      }
    }
    .del {
      width: 36px;
      height: 36px;
      font-size: 14px;
      color: var(--muted);
      margin: -4px -6px -4px 0;

      &:hover {
        background: var(--l-red-soft);
        color: var(--l-red);
      }
    }
    .bar {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 4px;

      li {
        height: 4px;
        border-radius: 2px;
        background: var(--surface-2);
        transition: background-color var(--t-base) var(--ease);

        &.done {
          background: var(--l-navy);
        }
        &.now {
          background: var(--l-green);
        }
      }
    }
    .cart {
      display: grid;
      gap: 8px;
    }
    .grp {
      padding: 10px 12px;
      border-radius: var(--r-inner);
      border: 1px solid var(--line);
      background: var(--surface);

      ul {
        display: grid;
        gap: 2px;
        margin: 4px 0 6px;
      }
    }
    .co-name {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      gap: 8px;
      font-size: 13.5px;

      b {
        font-weight: 600;
      }
      .mono {
        font-size: 12px;
        color: var(--muted);
      }
    }
    .line {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto auto;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      color: var(--ink-2);
    }
    .amt {
      display: flex;
      align-items: baseline;
      flex-wrap: wrap;
      justify-content: flex-end;
      gap: 0 6px;
      text-align: right;

      s {
        font-size: 12px;
        color: var(--muted);
      }
      b {
        font-weight: 500;
        color: var(--ink);
      }
      small {
        flex-basis: 100%;
        font-size: 12px;
        color: var(--muted);
      }
    }
    .sub,
    .total {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      gap: 12px;

      small {
        display: block;
        text-align: right;
        font-size: 12px;
        color: var(--l-green-text);
      }
    }
    .sub {
      padding-top: 6px;
      border-top: 1px dashed var(--line);
      font-size: 12.5px;
      color: var(--muted);

      b {
        color: var(--ink);
        font-weight: 600;
      }
    }
    .promo {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      min-height: 24px;
    }
    .rate {
      font-size: 12px;
      color: var(--muted);
    }
    .link {
      min-height: 32px;
      padding: 0 4px;
      font-size: 13px;
      font-weight: 500;
      color: var(--l-red);

      &:hover {
        text-decoration: underline;
      }
    }
    .promo-row {
      display: flex;
      gap: 8px;

      .input {
        flex: 1;
        min-width: 0;
        height: 44px;
        font-size: 13px;
        text-transform: uppercase;
      }
      .btn {
        height: 44px;
      }
    }
    .total {
      padding: 10px 12px;
      border-radius: var(--r-inner);
      background: var(--surface-2);
      font-size: 14px;
      font-weight: 600;

      b {
        color: var(--l-navy);
        font-weight: 600;
      }
    }
    .go {
      justify-content: center;
    }
    .empty {
      padding: 28px 12px;
      text-align: center;
      font-size: 13.5px;
      color: var(--muted);
      border: 1px dashed var(--line-strong);
      border-radius: var(--r-inner);
    }
    .form {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 10px;

      .wide {
        grid-column: 1 / -1;
      }
    }
    .field {
      display: grid;
      gap: 4px;
      min-width: 0;
      align-content: start;

      .input,
      .select {
        height: 44px;
        font-size: 13.5px;
        background: var(--surface);
      }
    }
    .field__error {
      font-size: 12px;
      color: var(--l-red);
    }
    .acts {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 10px;
      flex-wrap: wrap;
    }
    .otp {
      display: grid;
      gap: 6px;
      padding: 14px;
      border-radius: var(--r-inner);
      background: var(--surface-2);
    }
    .otp-t {
      font-size: 13px;
      color: var(--ink-2);
      margin-bottom: 4px;
    }
    .otp-in {
      height: 48px;
      font-size: 20px;
      letter-spacing: 0.4em;
      text-align: center;
      background: var(--surface);
    }
    .otp-h {
      font-size: 12px;
      color: var(--muted);
    }
    .paid {
      display: grid;
      justify-items: center;
      gap: 4px;
      padding: 22px 12px;
      text-align: center;
      border-radius: var(--r-inner);
      background: var(--l-green-soft);
      color: var(--l-green-text);
      font-size: 14px;

      b {
        font-weight: 600;
      }
      .muted {
        font-size: 12.5px;
      }
    }
    .ok {
      display: grid;
      place-items: center;
      width: 40px;
      height: 40px;
      margin-bottom: 4px;
      border-radius: 50%;
      background: var(--l-green-text);
      color: #fff;
      font-size: 20px;
    }
    .sample {
      font-size: 12px;
      color: var(--muted);
      min-height: 14px;
    }
    @media (max-width: 460px) {
      .co {
        padding: 14px;
      }
      .form {
        grid-template-columns: 1fr;
      }
    }
  `,
})
export class LlcsavvyCheckoutDemo {
  protected readonly screens = SCREENS;
  protected readonly banks = BANKS;
  protected readonly rate = RATE;
  protected readonly sampleCode = CODE;
  protected readonly usd = usd;
  protected readonly pkr = pkr;

  protected readonly screen = signal(0);
  protected readonly groups = signal<Group[]>(SEED);
  protected readonly promoOpen = signal(false);
  protected readonly code = signal('');
  protected readonly applied = signal(false);
  protected readonly note = signal(`Sample cart. Remove a line, or try the code ${CODE}.`);

  protected readonly bank = signal('a');
  protected readonly acc = signal('0123456789');
  protected readonly mob = signal('03000000000');
  protected readonly mail = signal('founder@example.com');
  protected readonly idNo = signal('12345-6789012-3');
  protected readonly shown = signal(false);

  protected readonly otp = signal('');
  protected readonly otpError = signal(false);
  protected readonly left = signal(OTP_SECONDS);
  private timer: ReturnType<typeof setInterval> | undefined;

  protected readonly total = computed(() => this.groups().reduce((sum, g) => sum + this.sub(g), 0));
  protected readonly accOk = computed(() => this.acc().length >= 8);
  protected readonly mobOk = computed(() => this.mob().length >= 11 && this.mob().length <= 13);
  protected readonly mailOk = computed(() => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(this.mail()));
  protected readonly idOk = computed(() => this.idNo().replace(/\D/g, '').length === 13);

  constructor() {
    inject(DestroyRef).onDestroy(() => this.stop());
  }

  protected price(l: Line): number {
    return this.applied() && l.promo !== undefined ? l.promo : l.amount;
  }

  protected sub(g: Group): number {
    return g.lines.reduce((sum, l) => sum + this.price(l) + l.fee, 0);
  }

  protected remove(id: number): void {
    this.groups.update((gs) => gs.map((g) => ({ ...g, lines: g.lines.filter((l) => l.id !== id) })).filter((g) => g.lines.length));
    this.note.set(this.groups().length ? 'Removed. The subtotals and the rupee amounts follow.' : 'Cart emptied.');
  }

  /** As the original: the code goes to the server, which answers with the repriced lines. */
  protected apply(): void {
    if (this.code().trim().toUpperCase() === CODE) {
      this.applied.set(true);
      this.promoOpen.set(false);
      this.note.set(`${CODE} applied. The server sent back its own price for each product it covers.`);
    } else {
      this.note.set('That code is not active. Try ' + CODE + '.');
    }
  }

  protected digits(v: string, max: number): string {
    return v.replace(/\D/g, '').slice(0, max);
  }

  /** The national ID mask, 00000-0000000-0, applied while typing. */
  protected setId(el: HTMLInputElement): void {
    const d = this.digits(el.value, 13);
    const masked = [d.slice(0, 5), d.slice(5, 12), d.slice(12)].filter(Boolean).join('-');
    el.value = masked;
    this.idNo.set(masked);
  }

  protected submit(): void {
    if (!(this.accOk() && this.mobOk() && this.mailOk() && this.idOk())) {
      this.shown.set(true);
      this.note.set('Fix the marked fields to continue.');
      return;
    }
    this.shown.set(false);
    if (BANKS.find((b) => b.id === this.bank())?.otp) {
      this.screen.set(2);
      this.otp.set('');
      this.start();
      this.note.set('The gateway validated the customer. This bank asks for a one-time password.');
    } else {
      this.screen.set(3);
      this.note.set('This bank needs no OTP: the gateway validated the customer and started the payment.');
    }
  }

  protected resend(): void {
    this.start();
    this.note.set('A new code is on its way. The timer starts again.');
  }

  protected verify(): void {
    if (this.otp().length !== 6) {
      this.otpError.set(true);
      this.note.set('The code has six digits.');
      return;
    }
    this.stop();
    this.screen.set(3);
    this.note.set('Verified. The payment started and the cart cleared.');
  }

  protected reset(): void {
    this.stop();
    this.screen.set(0);
    this.groups.set(SEED);
    this.promoOpen.set(false);
    this.code.set('');
    this.applied.set(false);
    this.bank.set('a');
    this.acc.set('0123456789');
    this.mob.set('03000000000');
    this.mail.set('founder@example.com');
    this.idNo.set('12345-6789012-3');
    this.shown.set(false);
    this.note.set('Sample checkout reset.');
  }

  private start(): void {
    this.stop();
    this.left.set(OTP_SECONDS);
    this.timer = setInterval(() => {
      const n = this.left() - 1;
      this.left.set(Math.max(0, n));
      if (n <= 0) this.stop(false);
    }, 1000);
  }

  private stop(resetLeft = true): void {
    if (this.timer) clearInterval(this.timer);
    this.timer = undefined;
    if (resetLeft && this.screen() !== 2) this.left.set(OTP_SECONDS);
  }
}
