import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  phosphorArrowCounterClockwise,
  phosphorCheck,
  phosphorHeadset,
  phosphorMinus,
  phosphorPlus,
  phosphorTrash,
} from '@ng-icons/phosphor-icons/regular';
import { CALLERS, Line, MENUS, Product, RESTAURANTS, digits, money, totals } from './call-center.data';

/**
 * Hero mockup of the call center's order form (my own redraw, not a screenshot). Two steps, as in the real form:
 * the caller's details, then the items. Typing a returning caller's number fills in their name, address and
 * restaurant, the way the real form searched past orders by phone once more than four digits were typed. Each
 * product has a price per size; picking the size sets the line price. Sample restaurants, menus and callers.
 */
type Step = 'caller' | 'items';

interface Draft extends Line {
  key: number;
  productId: string;
}

@Component({
  selector: 'mh-cc-order',
  imports: [NgIcon],
  viewProviders: [
    provideIcons({ phosphorArrowCounterClockwise, phosphorCheck, phosphorHeadset, phosphorMinus, phosphorPlus, phosphorTrash }),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./mini-btn.scss'],
  template: `
    <div class="ord card card--lift">
      <header class="ord-head">
        <span class="ic" aria-hidden="true"><ng-icon name="phosphorHeadset" /></span>
        <div>
          <h2>New phone order</h2>
          <p>Call center, sample data</p>
        </div>
        <button type="button" class="mini-btn mini-btn--icon" aria-label="Start over with an empty order" (click)="reset()">
          <ng-icon name="phosphorArrowCounterClockwise" aria-hidden="true" />
        </button>
      </header>

      @if (placed(); as p) {
        <div class="done">
          <span class="done-ic" aria-hidden="true"><ng-icon name="phosphorCheck" /></span>
          <p>
            <b>Order <span class="mono">#{{ p.no }}</span> placed</b>
            <span>{{ p.restaurant }} finds it in its list as Pending. Total <span class="mono">€{{ p.total }}</span>.</span>
          </p>
          <button type="button" class="mini-btn is-primary" (click)="reset()">Take the next call</button>
        </div>
      } @else {
        <div class="seg steps" role="group" aria-label="Order steps">
          <button type="button" [attr.aria-pressed]="step() === 'caller'" (click)="step.set('caller')">1 Caller</button>
          <button type="button" [attr.aria-pressed]="step() === 'items'" [disabled]="!callerOk()" (click)="goItems()">2 Items</button>
        </div>

        @if (step() === 'caller') {
          <div class="grid">
            <div class="field span">
              <label for="cc-phone">Phone</label>
              <input
                id="cc-phone"
                class="input"
                type="tel"
                inputmode="tel"
                autocomplete="off"
                [value]="phone()"
                (input)="onPhone($any($event.target).value)"
                aria-describedby="cc-phone-hint"
              />
              <span class="field__hint" id="cc-phone-hint" aria-live="polite">{{ lookup() }}</span>
            </div>
            <div class="field">
              <label for="cc-name">Name</label>
              <input id="cc-name" class="input" autocomplete="off" [value]="name()" (input)="name.set($any($event.target).value)" />
            </div>
            <div class="field">
              <label for="cc-rest">Restaurant</label>
              <select id="cc-rest" class="select" (change)="setRestaurant(+$any($event.target).value)">
                <option value="0" [selected]="restaurant() === 0">Pick one</option>
                @for (r of restaurants; track r.id) {
                  <option [value]="r.id" [selected]="restaurant() === r.id">{{ r.name }}</option>
                }
              </select>
            </div>
            <div class="field span">
              <label for="cc-addr">Delivery address</label>
              <input id="cc-addr" class="input" autocomplete="off" [value]="address()" (input)="address.set($any($event.target).value)" />
            </div>
          </div>
          <div class="foot">
            <span class="mono small">{{ callerOk() ? 'Ready for items' : 'Phone, name, restaurant, address' }}</span>
            <button type="button" class="mini-btn is-primary" [disabled]="!callerOk()" (click)="goItems()">Next: items</button>
          </div>
        } @else {
          <ul class="lines" role="list" aria-label="Items in this order">
            @for (l of lines(); track l.key; let i = $index) {
              <li>
                <label class="sr-only" [for]="'cc-prod-' + l.key">Product {{ i + 1 }}</label>
                <select [id]="'cc-prod-' + l.key" class="select sel" (change)="setProduct(l.key, $any($event.target).value)">
                  @for (p of menu(); track p.id) {
                    <option [value]="p.id" [selected]="l.productId === p.id">{{ p.name }}</option>
                  }
                </select>
                <div class="line-row">
                  <div class="sizes" role="group" [attr.aria-label]="'Size of ' + l.product">
                    @for (s of sizesOf(l.productId); track s.size) {
                      <button type="button" [attr.aria-pressed]="l.size === s.size" (click)="setSize(l.key, s.size)">{{ s.size }}</button>
                    }
                  </div>
                  <div class="qty">
                    <button type="button" class="mini-btn mini-btn--icon" [attr.aria-label]="'One less ' + l.product" [disabled]="l.qty < 2" (click)="bump(l.key, -1)">
                      <ng-icon name="phosphorMinus" aria-hidden="true" />
                    </button>
                    <span class="mono"><span class="sr-only">Quantity </span>{{ l.qty }}</span>
                    <button type="button" class="mini-btn mini-btn--icon" [attr.aria-label]="'One more ' + l.product" (click)="bump(l.key, 1)">
                      <ng-icon name="phosphorPlus" aria-hidden="true" />
                    </button>
                  </div>
                  <span class="mono price">€{{ money(l.price * l.qty) }}</span>
                  <button type="button" class="mini-btn mini-btn--icon" [attr.aria-label]="'Remove ' + l.product" (click)="remove(l.key)">
                    <ng-icon name="phosphorTrash" aria-hidden="true" />
                  </button>
                </div>
              </li>
            } @empty {
              <li class="empty">No items yet.</li>
            }
          </ul>
          <button type="button" class="mini-btn add" (click)="add()"><ng-icon name="phosphorPlus" aria-hidden="true" /> Add item</button>

          <dl class="sum">
            <div><dt>Subtotal</dt><dd class="mono">€{{ money(t().sub) }}</dd></div>
            <div><dt>Delivery</dt><dd class="mono">€{{ money(t().delivery) }}</dd></div>
            <div><dt>Tax, sample 7%</dt><dd class="mono">€{{ money(t().tax) }}</dd></div>
            <div class="tot"><dt>Total</dt><dd class="mono">€{{ money(t().total) }}</dd></div>
          </dl>
          <div class="foot">
            <span class="mono small">{{ restaurantName() }}</span>
            <button type="button" class="mini-btn is-primary" [disabled]="!lines().length" (click)="place()">Place order</button>
          </div>
        }
      }
    </div>
  `,
  styles: `
    :host {
      display: block;
    }
    .ord {
      display: grid;
      gap: 14px;
      padding: 18px;
    }
    .ord-head {
      display: flex;
      align-items: center;
      gap: 12px;
      padding-bottom: 12px;
      border-bottom: 1px solid var(--line);

      div {
        flex: 1;
        min-width: 0;
      }
      h2 {
        font-size: 16px;
      }
      p {
        font-size: 12.5px;
        color: var(--muted);
      }
    }
    .ic {
      width: 36px;
      height: 36px;
      display: grid;
      place-items: center;
      border-radius: 10px;
      background: var(--c-blue-soft);
      color: var(--c-blue-text);
      font-size: 19px;
    }
    .steps {
      justify-self: start;

      button {
        height: 30px;
        padding: 0 12px;
        font-size: 13px;
      }
      button[disabled] {
        cursor: not-allowed;
      }
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 10px 12px;

      .span {
        grid-column: 1 / -1;
      }
    }
    .field {
      gap: 5px;
    }
    .input,
    .select {
      height: 44px;
      font-size: 14px;
      background-color: var(--bg);
    }
    .field__hint {
      min-height: 18px;
      font-size: 12.5px;
    }
    .foot {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      padding-top: 12px;
      border-top: 1px solid var(--line);
    }
    .small {
      font-size: 12px;
      color: var(--muted);
    }
    .lines {
      display: grid;
      gap: 8px;

      > li:not(.empty) {
        display: grid;
        gap: 8px;
        padding: 10px;
        border-radius: var(--r-inner);
        border: 1px solid var(--line);
        background: var(--bg);
      }
    }
    .sel {
      height: 40px;
      background-color: var(--surface);
    }
    .empty {
      font-size: 13px;
      color: var(--muted);
      padding: 10px 2px;
    }
    .line-row {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
    }
    .sizes {
      display: inline-flex;
      gap: 4px;
      flex: 1 1 auto;

      button {
        position: relative;
        height: 30px;
        padding: 0 10px;
        border-radius: 999px;
        border: 1px solid var(--line-strong);
        background: var(--surface);
        font-size: 12px;
        color: var(--ink-2);
        white-space: nowrap;

        &::before {
          content: '';
          position: absolute;
          inset: -7px -2px;
        }
      }
      [aria-pressed='true'] {
        background: var(--c-blue-soft);
        border-color: var(--c-indigo);
        color: var(--c-blue-text);
        font-weight: 600;
      }
    }
    .qty {
      display: inline-flex;
      align-items: center;
      gap: 6px;

      .mono {
        min-width: 16px;
        text-align: center;
        font-size: 13px;
      }
    }
    .price {
      min-width: 58px;
      text-align: right;
      font-size: 13px;
      font-weight: 600;
    }
    .add {
      justify-self: start;
    }
    .sum {
      display: grid;
      gap: 4px;
      margin: 0;
      padding: 10px 12px;
      border-radius: var(--r-inner);
      background: var(--surface-2);

      div {
        display: flex;
        justify-content: space-between;
        font-size: 13px;
      }
      dt {
        color: var(--muted);
      }
      dd {
        margin: 0;
      }
      .tot {
        padding-top: 4px;
        font-weight: 600;

        dt {
          color: var(--ink);
        }
      }
    }
    .done {
      display: grid;
      justify-items: start;
      gap: 12px;
      padding: 16px;
      border-radius: var(--r-inner);
      background: var(--c-green-soft);

      p {
        display: grid;
        gap: 4px;
        font-size: 13.5px;
        color: var(--ink);
      }
      b {
        font-size: 15px;
        color: var(--c-green-text);
      }
    }
    .done-ic {
      width: 34px;
      height: 34px;
      display: grid;
      place-items: center;
      border-radius: 50%;
      background: var(--c-green-text);
      color: #fff;
      font-size: 18px;
    }
    @media (max-width: 460px) {
      .ord {
        padding: 14px;
      }
      .grid {
        grid-template-columns: 1fr;
      }
      .sizes {
        flex-basis: 100%;
      }
      .price {
        margin-left: auto;
      }
    }
  `,
})
export class CallCenterOrderDemo {
  protected readonly restaurants = RESTAURANTS;
  protected readonly money = money;

  protected readonly step = signal<Step>('caller');
  protected readonly phone = signal('');
  protected readonly name = signal('');
  protected readonly address = signal('');
  protected readonly restaurant = signal(0);
  protected readonly lookup = signal('Try 0700 555 0142, a returning caller.');
  protected readonly lines = signal<Draft[]>([]);
  protected readonly placed = signal<{ no: number; restaurant: string; total: string } | null>(null);
  private key = 0;
  private nextNo = 1047;

  protected readonly menu = computed<readonly Product[]>(() => MENUS[this.restaurant()] ?? []);
  protected readonly restaurantName = computed(() => RESTAURANTS.find((r) => r.id === this.restaurant())?.name ?? '');
  protected readonly callerOk = computed(
    () => digits(this.phone()).length >= 6 && !!this.name().trim() && !!this.address().trim() && this.restaurant() > 0,
  );
  protected readonly t = computed(() => totals(this.lines()));

  protected onPhone(v: string): void {
    this.phone.set(v);
    const d = digits(v);
    if (d.length <= 4) {
      this.lookup.set('Try 0700 555 0142, a returning caller.');
      return;
    }
    const hit = CALLERS.find((c) => digits(c.phone) === d);
    if (hit) {
      this.name.set(hit.name);
      this.address.set(hit.address);
      this.setRestaurant(hit.restaurant);
      this.lookup.set('Returning caller: details filled in from the last order.');
    } else {
      this.lookup.set(d.length >= 11 ? 'New caller: no past orders for this number.' : 'Searching past orders by phone.');
    }
  }

  protected setRestaurant(id: number): void {
    if (id === this.restaurant()) return;
    this.restaurant.set(id);
    // A new restaurant means a new menu: lines from the old one no longer apply.
    this.lines.set([]);
  }

  protected goItems(): void {
    if (!this.callerOk()) return;
    if (!this.lines().length) this.add();
    this.step.set('items');
  }

  protected sizesOf(productId: string): Product['sizes'] {
    return this.menu().find((p) => p.id === productId)?.sizes ?? [];
  }

  protected add(): void {
    const p = this.menu()[0];
    if (!p) return;
    this.lines.update((l) => [...l, this.draft(p)]);
  }

  protected setProduct(key: number, productId: string): void {
    const p = this.menu().find((m) => m.id === productId);
    if (!p) return;
    this.lines.update((l) => l.map((d) => (d.key === key ? { ...this.draft(p), key, qty: d.qty } : d)));
  }

  protected setSize(key: number, size: string): void {
    this.lines.update((l) =>
      l.map((d) => (d.key === key ? { ...d, size, price: this.sizesOf(d.productId).find((s) => s.size === size)?.price ?? d.price } : d)),
    );
  }

  protected bump(key: number, by: number): void {
    this.lines.update((l) => l.map((d) => (d.key === key ? { ...d, qty: Math.max(1, d.qty + by) } : d)));
  }

  protected remove(key: number): void {
    this.lines.update((l) => l.filter((d) => d.key !== key));
  }

  protected place(): void {
    if (!this.lines().length) return;
    this.placed.set({ no: this.nextNo++, restaurant: this.restaurantName(), total: money(this.t().total) });
  }

  protected reset(): void {
    this.step.set('caller');
    this.phone.set('');
    this.name.set('');
    this.address.set('');
    this.restaurant.set(0);
    this.lines.set([]);
    this.placed.set(null);
    this.lookup.set('Try 0700 555 0142, a returning caller.');
  }

  private draft(p: Product): Draft {
    const s = p.sizes[p.sizes.length - 1];
    return { key: ++this.key, productId: p.id, product: p.name, size: s.size, price: s.price, qty: 1 };
  }
}
