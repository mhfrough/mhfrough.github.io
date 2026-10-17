import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  phosphorArrowCounterClockwise,
  phosphorBellRinging,
  phosphorCheck,
  phosphorCookingPot,
  phosphorHourglass,
  phosphorMoped,
} from '@ng-icons/phosphor-icons/regular';

/**
 * The order desk and the customer's tracker, redrawn as my own mockup. Staff move an order along in the back
 * office; the customer's tracker does not hear it at once. It asks the API every 10 seconds, as the real one
 * does, so the change lands on the next check, together with a push notification. The status names and the
 * tracker's messages are the real ones. Sample orders. The countdown runs only while the two sides differ,
 * so nothing ticks while the demo is idle.
 */
const STEPS = [
  { id: 'pending', label: 'Received', icon: 'phosphorHourglass', msg: 'Hang on, we are processing your order.', eta: '' },
  { id: 'processing', label: 'Preparing', icon: 'phosphorCookingPot', msg: 'Our chefs are preparing your food.', eta: '20 to 30 min' },
  { id: 'in-transit', label: 'On the way', icon: 'phosphorMoped', msg: 'Your rider is on the way.', eta: '10 to 20 min' },
  { id: 'delivered', label: 'Delivered', icon: 'phosphorCheck', msg: 'Delivered. Enjoy your meal.', eta: '' },
];
const ACTIONS = ['Accept', 'Send out', 'Mark delivered'];
const PUSH = ['', 'Your order is being prepared.', 'Your order is on its way.', 'Your order has arrived.'];
const POLL = 10;

interface Order {
  no: string;
  what: string;
  step: number;
  tracked?: boolean;
}

const SEED: Order[] = [
  { no: 'PR-1042', what: '2x Margherita 32 cm, Cola', step: 0, tracked: true },
  { no: 'PR-1041', what: 'Döner Plate, Ayran', step: 2 },
  { no: 'PR-1040', what: 'Quattro Formaggi 26 cm', step: 1 },
];

@Component({
  selector: 'mh-pizzerias-tracker',
  imports: [NgIcon],
  viewProviders: [
    provideIcons({
      phosphorArrowCounterClockwise,
      phosphorBellRinging,
      phosphorCheck,
      phosphorCookingPot,
      phosphorHourglass,
      phosphorMoped,
    }),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="desk card card--lift">
      <section class="board" aria-labelledby="pz-board">
        <header>
          <h3 id="pz-board">Orders, back office</h3>
          <button type="button" class="reset" aria-label="Reset the sample orders" (click)="reset()">
            <ng-icon name="phosphorArrowCounterClockwise" aria-hidden="true" />
          </button>
        </header>
        <ul role="list">
          @for (o of orders(); track o.no) {
            <li [class.tracked]="o.tracked">
              <div class="o-txt">
                <b class="mono">{{ o.no }}</b>
                <span>{{ o.what }}</span>
              </div>
              <span class="st" [attr.data-s]="o.step">{{ steps[o.step].id }}</span>
              @if (o.step < 3) {
                <button type="button" class="btn btn-ghost btn-sm act" (click)="advance(o.no)">{{ actions[o.step] }}</button>
              } @else {
                <span class="done">Done</span>
              }
            </li>
          }
        </ul>
        <p class="hint">PR-1042 is the order on the phone. Move it along and watch the tracker.</p>
      </section>

      <section class="phone" aria-labelledby="pz-phone">
        <div class="screen">
          @if (push()) {
            <div class="push" role="status">
              <ng-icon name="phosphorBellRinging" aria-hidden="true" />
              <span>{{ push() }}</span>
            </div>
          }
          <p class="mono ord">Order PR-1042</p>
          <h3 id="pz-phone">{{ steps[seen()].label }}</h3>
          <p class="msg">{{ steps[seen()].msg }}</p>
          @if (steps[seen()].eta) {
            <p class="eta mono">{{ steps[seen()].eta }}</p>
          }
          <ol class="track" role="list">
            @for (s of steps; track s.id; let i = $index) {
              <li [class.on]="i <= seen()">
                <span class="ic"><ng-icon [name]="s.icon" aria-hidden="true" /></span>
                <span class="lb">{{ s.label }}</span>
              </li>
            }
          </ol>
          <p class="poll mono" aria-live="off">
            @if (countdown() > 0) {
              Next check in {{ countdown() }} s
            } @else {
              Up to date. Checks every {{ poll }} s
            }
          </p>
        </div>
      </section>
    </div>
  `,
  styles: `
    :host {
      display: block;
    }
    .desk {
      display: grid;
      grid-template-columns: minmax(0, 1fr) 260px;
      gap: 20px;
      padding: 20px;
      align-items: start;

      > * {
        min-width: 0;
      }
    }
    .board {
      header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 10px;
      }
      h3 {
        font-size: 15px;
      }
      ul {
        display: grid;
        gap: 6px;
      }
      li {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 8px 8px 8px 12px;
        border-radius: var(--r-inner);
        border: 1px solid var(--line);
        background: var(--surface);

        &.tracked {
          border-color: var(--p-red, var(--accent));
          box-shadow: 0 0 0 3px var(--p-red-soft, var(--accent-soft));
        }
      }
    }
    .o-txt {
      flex: 1;
      min-width: 0;

      b {
        display: block;
        font-size: 12.5px;
        font-weight: 600;
      }
      span {
        display: block;
        font-size: 12.5px;
        color: var(--muted);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }
    .st {
      font-family: var(--font-mono);
      font-size: 12px;
      padding: 2px 8px;
      border-radius: 999px;
      background: var(--surface-2);
      color: var(--ink-2);
      white-space: nowrap;

      &[data-s='1'] {
        background: var(--p-yellow-soft, var(--surface-2));
        color: var(--p-yellow-text, var(--ink));
      }
      &[data-s='2'] {
        background: var(--p-red-soft, var(--surface-2));
        color: var(--p-red-text, var(--ink));
      }
      &[data-s='3'] {
        background: var(--p-green-soft, var(--surface-2));
        color: var(--p-green-text, var(--ink));
      }
    }
    .act {
      min-width: 112px;
      min-height: 36px;
      justify-content: center;
    }
    .done {
      min-width: 112px;
      text-align: center;
      font-size: 12.5px;
      color: var(--muted);
    }
    .hint {
      margin-top: 10px;
      font-size: 12.5px;
      color: var(--muted);
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
    .phone {
      padding: 8px;
      border-radius: 34px;
      background: var(--p-night, #1f1a16);
      box-shadow: var(--shadow-lg);
    }
    .screen {
      position: relative;
      min-height: 400px;
      padding: 40px 16px 16px;
      border-radius: 27px;
      background: var(--surface);
      overflow: hidden;

      h3 {
        font-size: 20px;
        letter-spacing: -0.02em;
      }
    }
    .push {
      position: absolute;
      top: 8px;
      left: 8px;
      right: 8px;
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 9px 12px;
      border-radius: 14px;
      background: var(--p-night, #1f1a16);
      color: var(--n-ink, #fff);
      font-size: 12px;
      box-shadow: var(--shadow);

      ng-icon {
        font-size: 15px;
        color: var(--p-yellow, #fccc4c);
      }
    }
    @media (prefers-reduced-motion: no-preference) {
      .push {
        animation: drop 0.4s var(--ease) both;
      }
    }
    @keyframes drop {
      from {
        opacity: 0;
        transform: translateY(-12px);
      }
    }
    .ord {
      font-size: 12px;
      color: var(--muted);
      margin-bottom: 4px;
    }
    .msg {
      margin-top: 4px;
      font-size: 13.5px;
      color: var(--ink-2);
    }
    .eta {
      margin-top: 6px;
      font-size: 12px;
      color: var(--p-red-text, var(--ink));
    }
    .track {
      display: grid;
      gap: 0;
      margin-top: 16px;

      li {
        position: relative;
        display: flex;
        align-items: center;
        gap: 10px;
        min-height: 44px;
        color: var(--muted);
        font-size: 13px;

        &:not(:last-child)::after {
          content: '';
          position: absolute;
          left: 15px;
          top: 36px;
          width: 2px;
          height: 16px;
          background: var(--line-strong);
        }
        &.on {
          color: var(--ink);
          font-weight: 500;
        }
        &.on:not(:last-child)::after {
          background: var(--p-red, var(--accent));
        }
      }
      .ic {
        width: 32px;
        height: 32px;
        display: grid;
        place-items: center;
        border-radius: 50%;
        border: 1.5px solid var(--line-strong);
        background: var(--surface);
        font-size: 15px;
        transition:
          background var(--t-base) var(--ease),
          color var(--t-base) var(--ease);
      }
      .on .ic {
        border-color: var(--p-red, var(--accent));
        background: var(--p-red-dark, var(--accent));
        color: #fff;
      }
    }
    .poll {
      margin-top: 12px;
      font-size: 12px;
      color: var(--muted);
    }
    @media (max-width: 760px) {
      .desk {
        grid-template-columns: 1fr;
      }
      .phone {
        max-width: 300px;
        justify-self: center;
        width: 100%;
      }
    }
    @media (max-width: 460px) {
      .desk {
        padding: 14px;
      }
      .board li {
        flex-wrap: wrap;
      }
      .o-txt {
        flex-basis: 100%;
      }
      .act,
      .done {
        min-width: 0;
        margin-left: auto;
      }
    }
  `,
})
export class PizzeriasTrackerDemo {
  protected readonly steps = STEPS;
  protected readonly actions = ACTIONS;
  protected readonly poll = POLL;
  protected readonly orders = signal<Order[]>(SEED);
  /** What the customer's tracker last fetched. */
  protected readonly seen = signal(0);
  protected readonly countdown = signal(0);
  protected readonly push = signal('');

  private readonly tracked = computed(() => this.orders().find((o) => o.tracked)!.step);
  private timer: ReturnType<typeof setInterval> | undefined;
  private pushTimer: ReturnType<typeof setTimeout> | undefined;
  private polls = 0;

  constructor() {
    inject(DestroyRef).onDestroy(() => this.stop());
  }

  protected advance(no: string): void {
    this.orders.update((os) => os.map((o) => (o.no === no && o.step < 3 ? { ...o, step: o.step + 1 } : o)));
    if (this.tracked() !== this.seen() && !this.timer) this.startPoll();
  }

  protected reset(): void {
    this.stop();
    this.orders.set(SEED);
    this.seen.set(0);
    this.countdown.set(0);
    this.push.set('');
  }

  /** The next check is somewhere inside the 10 s window; count down to it, then fetch. */
  private startPoll(): void {
    this.countdown.set(3 + ((this.polls++ * 4) % 7));
    this.timer = setInterval(() => {
      const left = this.countdown() - 1;
      if (left > 0) {
        this.countdown.set(left);
        return;
      }
      clearInterval(this.timer);
      this.timer = undefined;
      this.countdown.set(0);
      this.seen.set(this.tracked());
      this.notify(PUSH[this.seen()]);
    }, 1000);
  }

  private notify(text: string): void {
    clearTimeout(this.pushTimer);
    this.push.set(text);
    this.pushTimer = setTimeout(() => this.push.set(''), 4000);
  }

  private stop(): void {
    clearInterval(this.timer);
    this.timer = undefined;
    clearTimeout(this.pushTimer);
  }
}
