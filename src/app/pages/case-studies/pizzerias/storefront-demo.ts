import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { phosphorArrowCounterClockwise, phosphorMinus, phosphorPlus } from '@ng-icons/phosphor-icons/regular';
import { AREAS, BRANDS, Brand, Item, eur } from './brands';

/**
 * Hero mockup of the shared storefront (my own redraw, not a screenshot). One template, seven brands: picking a
 * brand swaps the logo, colours and menu and keeps every rule, as the real forks did. The rules are the real
 * ones: pizzas are priced by size, delivery areas each carry a fee and a minimum order, pickup has no minimum,
 * and checkout stays shut until the minimum is met. Sample menus and prices.
 */
interface Line {
  key: string;
  name: string;
  size?: 0 | 1;
  unit: number;
  qty: number;
}

const SIZES = ['26 cm', '32 cm'];

@Component({
  selector: 'mh-pizzerias-storefront',
  imports: [NgIcon],
  viewProviders: [provideIcons({ phosphorArrowCounterClockwise, phosphorMinus, phosphorPlus })],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[style.--sf-fill]': 'brand().fill',
    '[style.--sf-on]': 'brand().onFill',
    '[style.--sf-text]': 'brand().text',
  },
  template: `
    <div class="sf card card--lift">
      <div class="brands" role="group" aria-label="Brand">
        @for (b of brands; track b.id) {
          <button type="button" class="bchip" [attr.aria-pressed]="brand().id === b.id" [attr.aria-label]="b.name" [title]="b.name" (click)="pickBrand(b)">
            <img [src]="b.logo" alt="" width="30" height="22" decoding="async" />
          </button>
        }
        <button type="button" class="reset" aria-label="Empty the sample cart" (click)="reset()">
          <ng-icon name="phosphorArrowCounterClockwise" aria-hidden="true" />
        </button>
      </div>

      <header class="sf-head">
        <img [src]="brand().logo" alt="" width="44" height="44" />
        <div>
          <h2>{{ brand().name }}</h2>
          <p><span class="open" aria-hidden="true"></span>Open until 22:30{{ brand().town ? ', ' + brand().town : '' }}</p>
        </div>
        <div class="seg mode" role="group" aria-label="Order type">
          <button type="button" [attr.aria-pressed]="mode() === 'delivery'" (click)="mode.set('delivery')">Delivery</button>
          <button type="button" [attr.aria-pressed]="mode() === 'pickup'" (click)="mode.set('pickup')">Pickup</button>
        </div>
      </header>

      <div class="tabs" role="group" aria-label="Menu category">
        @for (c of brand().menu; track c.name; let i = $index) {
          <button type="button" [attr.aria-pressed]="cat() === i" (click)="cat.set(i)">{{ c.name }}</button>
        }
      </div>

      <ul class="items" role="list">
        @for (it of items(); track it.name) {
          <li>
            <div class="it-txt">
              <b>{{ it.name }}</b>
              <span>{{ it.desc }}</span>
            </div>
            @if (sized(it)) {
              <div class="sizes" role="group" [attr.aria-label]="'Size of ' + it.name">
                @for (s of sizes; track s; let si = $index) {
                  <button type="button" [attr.aria-pressed]="sizeOf(it) === si" (click)="setSize(it, si)">{{ s }}</button>
                }
              </div>
            }
            <span class="price mono">{{ fmt(priceOf(it)) }}</span>
            <button type="button" class="add" [attr.aria-label]="'Add ' + it.name + ' to the cart'" (click)="add(it)">
              <ng-icon name="phosphorPlus" aria-hidden="true" />
            </button>
          </li>
        }
      </ul>

      <footer class="cart">
        @if (lines().length) {
          <ul class="lines" role="list" aria-label="Cart">
            @for (l of lines(); track l.key) {
              <li>
                <button type="button" class="qty" [attr.aria-label]="'Remove one ' + l.name" (click)="dec(l.key)">
                  <ng-icon name="phosphorMinus" aria-hidden="true" />
                </button>
                <span class="mono q">{{ l.qty }}x</span>
                <span class="ln">{{ l.name }}{{ l.size !== undefined ? ', ' + sizes[l.size] : '' }}</span>
                <span class="mono">{{ fmt(l.unit * l.qty) }}</span>
              </li>
            }
          </ul>
        } @else {
          <p class="empty">Your cart is empty. Add something with +.</p>
        }

        @if (mode() === 'delivery') {
          <div class="area">
            <label for="pz-area">Delivery area</label>
            <select id="pz-area" class="select" [value]="area().id" (change)="pickArea($any($event.target).value)">
              @for (a of areas; track a.id) {
                <option [value]="a.id">{{ a.label }}, {{ a.fee ? fmt(a.fee) : 'free' }}, min. {{ fmt(a.min) }}</option>
              }
            </select>
          </div>
        }

        <dl class="sum">
          <div><dt>Subtotal</dt><dd class="mono">{{ fmt(subtotal()) }}</dd></div>
          <div><dt>Delivery</dt><dd class="mono">{{ fee() ? fmt(fee()) : 'Free' }}</dd></div>
          <div class="tot"><dt>Total</dt><dd class="mono">{{ fmt(subtotal() + fee()) }}</dd></div>
        </dl>

        @if (short() > 0) {
          <div class="min" aria-live="polite">
            <span class="bar" aria-hidden="true"><i [style.width.%]="progress()"></i></span>
            <p>Add <b class="mono">{{ fmt(short()) }}</b> more for delivery to {{ area().label.split(',')[0] }}.</p>
          </div>
        }
        <div class="go">
          <button type="button" class="btn checkout" [disabled]="!lines().length || short() > 0">Checkout</button>
          <span class="mono sample">Sample menu and prices</span>
        </div>
      </footer>
    </div>
  `,
  styles: `
    :host {
      display: block;
    }
    .sf {
      padding: 14px 16px 16px;
    }
    .brands {
      display: flex;
      align-items: center;
      gap: 6px;
      // overflow-x clips on both axes, so 4px of room (cancelled by the negative margin) keeps the selected ring and
      // the focus ring whole.
      margin: -4px -4px 0;
      padding: 4px 4px 12px;
      border-bottom: 1px solid var(--line);
      overflow-x: auto;
      scrollbar-width: none;
    }
    .bchip {
      flex: none;
      width: 44px;
      height: 44px;
      display: grid;
      place-items: center;
      border-radius: 999px;
      border: 1px solid var(--line);
      background: #fff;
      transition:
        border-color var(--t-fast) var(--ease),
        box-shadow var(--t-fast) var(--ease);

      overflow: hidden;

      // A 30 x 22 box keeps every corner of the logo ~19px from the centre, inside the 22px circle with room to
      // spare: wide wordmarks keep their width, square badges shrink to 22px instead of touching the rim.
      img {
        width: 30px;
        height: 22px;
        object-fit: contain;
      }
      &:hover {
        border-color: var(--line-strong);
      }
      &[aria-pressed='true'] {
        border-color: var(--sf-fill);
        box-shadow: 0 0 0 2px var(--sf-fill);
      }
    }
    .reset {
      flex: none;
      margin-left: auto;
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
    .sf-head {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 0;

      > img {
        width: 44px;
        height: 44px;
        object-fit: contain;
        border-radius: 12px;
        background: #fff;
        border: 1px solid var(--line);
        padding: 3px;
      }
      > div:first-of-type {
        flex: 1;
        min-width: 0;
      }
      h2 {
        font-size: 16px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      p {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 12.5px;
        color: var(--muted);
      }
    }
    .open {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: var(--p-green, #00a850);
    }
    .mode button {
      height: 30px;
      padding: 0 11px;
      font-size: 12.5px;
    }
    .tabs {
      display: flex;
      gap: 4px;
      overflow-x: auto;
      scrollbar-width: none;

      button {
        flex: none;
        height: 34px;
        padding: 0 13px;
        border-radius: 999px;
        font-size: 13px;
        font-weight: 500;
        color: var(--muted);
        transition:
          background var(--t-fast) var(--ease),
          color var(--t-fast) var(--ease);

        &:hover {
          color: var(--ink);
        }
        &[aria-pressed='true'] {
          background: var(--sf-fill);
          color: var(--sf-on);
        }
      }
    }
    .items {
      display: grid;
      grid-template-columns: minmax(0, 1fr);
      margin-top: 8px;

      li {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 7px 0;
        border-bottom: 1px solid var(--line);
      }
    }
    .it-txt {
      flex: 1;
      min-width: 0;

      b {
        display: block;
        font-size: 13.5px;
        font-weight: 600;
      }
      span {
        display: block;
        font-size: 12px;
        color: var(--muted);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }
    .sizes {
      display: flex;
      flex: none;
      padding: 2px;
      border-radius: 999px;
      background: var(--surface-2);

      button {
        height: 26px;
        padding: 0 8px;
        border-radius: 999px;
        font-size: 12px;
        color: var(--muted);

        &[aria-pressed='true'] {
          background: var(--surface);
          color: var(--ink);
          box-shadow: 0 1px 2px rgb(0 0 0 / 0.12);
        }
      }
    }
    .price {
      flex: none;
      width: 62px;
      text-align: right;
      font-size: 12.5px;
      font-weight: 600;
      color: var(--sf-text);
    }
    .add {
      flex: none;
      width: 44px;
      height: 44px;
      display: grid;
      place-items: center;
      border-radius: 999px;
      background: var(--sf-fill);
      color: var(--sf-on);
      font-size: 16px;
      transition: transform var(--t-fast) var(--ease);

      &:active {
        transform: scale(0.94);
      }
    }
    .cart {
      margin-top: 12px;
    }
    .lines {
      display: grid;
      gap: 2px;
      max-height: 116px;
      overflow-y: auto;

      li {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 12.5px;
      }
      .q {
        width: 22px;
        font-size: 12px;
        color: var(--muted);
      }
      .ln {
        flex: 1;
        min-width: 0;
      }
      .mono:last-child {
        font-size: 12px;
      }
    }
    .qty {
      width: 28px;
      height: 28px;
      display: grid;
      place-items: center;
      border-radius: 999px;
      border: 1px solid var(--line);
      font-size: 12px;
      color: var(--ink-2);

      &:hover {
        background: var(--surface-2);
      }
    }
    .empty {
      font-size: 12.5px;
      color: var(--muted);
    }
    .area {
      display: grid;
      gap: 4px;
      margin-top: 10px;

      label {
        font-size: 12px;
        font-weight: 500;
        color: var(--ink-2);
      }
      .select {
        height: 40px;
        font-size: 13px;
        padding: 0 14px;
      }
    }
    .sum {
      display: flex;
      flex-wrap: wrap;
      gap: 4px 16px;
      margin: 10px 0 0;

      div {
        display: flex;
        gap: 6px;
        align-items: baseline;
      }
      dt {
        font-size: 12px;
        color: var(--muted);
      }
      dd {
        margin: 0;
        font-size: 12.5px;
      }
      .tot {
        margin-left: auto;

        dd {
          font-size: 14px;
          font-weight: 600;
        }
      }
    }
    .min {
      margin-top: 10px;

      .bar {
        display: block;
        height: 6px;
        border-radius: 999px;
        background: var(--surface-2);
        overflow: hidden;
      }
      i {
        display: block;
        height: 100%;
        border-radius: 999px;
        background: var(--sf-fill);
        transition: width 0.4s var(--ease);
      }
      p {
        margin-top: 6px;
        font-size: 12.5px;
        color: var(--ink-2);
      }
    }
    .go {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      margin-top: 12px;
    }
    .checkout {
      background: var(--sf-fill);
      color: var(--sf-on);

      &[disabled] {
        opacity: 0.4;
        cursor: not-allowed;
      }
    }
    .sample {
      font-size: 12px;
      color: var(--muted);
    }
    @media (prefers-reduced-motion: reduce) {
      .min i {
        transition: none;
      }
    }
    @media (max-width: 460px) {
      .sf {
        padding: 12px;
      }
      .it-txt span {
        display: none;
      }
      .mode {
        display: none;
      }
    }
    /* Smallest phones: the name keeps the full first line, the size switch sits under it */
    @media (max-width: 374px) {
      .items li {
        display: grid;
        grid-template-columns: minmax(0, 1fr) auto 44px;
        grid-template-areas:
          'txt price add'
          'sizes price add';
        gap: 4px 8px;
      }
      .it-txt {
        grid-area: txt;
      }
      .sizes {
        grid-area: sizes;
        justify-self: start;
      }
      .price {
        grid-area: price;
        width: auto;
      }
      .add {
        grid-area: add;
      }
    }
  `,
})
export class PizzeriasStorefrontDemo {
  protected readonly brands = BRANDS;
  protected readonly areas = AREAS;
  protected readonly sizes = SIZES;

  protected readonly brand = signal<Brand>(BRANDS[2]);
  protected readonly cat = signal(0);
  protected readonly mode = signal<'delivery' | 'pickup'>('delivery');
  protected readonly area = signal(AREAS[1]);
  protected readonly lines = signal<Line[]>([]);
  /** Picked size per pizza, by name; large by default. */
  private readonly picked = signal<Record<string, 0 | 1>>({});

  constructor() {
    this.seed();
  }

  protected readonly items = computed(() => this.brand().menu[this.cat()]?.items ?? []);
  protected readonly subtotal = computed(() => this.lines().reduce((t, l) => t + l.unit * l.qty, 0));
  protected readonly fee = computed(() => (this.mode() === 'delivery' ? this.area().fee : 0));
  protected readonly short = computed(() => (this.mode() === 'delivery' ? Math.max(0, this.area().min - this.subtotal()) : 0));
  protected readonly progress = computed(() => Math.min(100, (this.subtotal() / this.area().min) * 100));

  protected fmt(n: number): string {
    return eur.format(n);
  }

  protected sized(it: Item): boolean {
    return Array.isArray(it.price);
  }

  protected sizeOf(it: Item): 0 | 1 {
    return this.picked()[it.name] ?? 1;
  }

  protected setSize(it: Item, s: number): void {
    this.picked.update((m) => ({ ...m, [it.name]: s as 0 | 1 }));
  }

  protected priceOf(it: Item): number {
    return Array.isArray(it.price) ? it.price[this.sizeOf(it)] : it.price;
  }

  protected add(it: Item): void {
    const size = this.sized(it) ? this.sizeOf(it) : undefined;
    const key = `${it.name}|${size ?? ''}`;
    const unit = this.priceOf(it);
    this.lines.update((ls) =>
      ls.some((l) => l.key === key)
        ? ls.map((l) => (l.key === key ? { ...l, qty: l.qty + 1 } : l))
        : [...ls, { key, name: it.name, size, unit, qty: 1 }],
    );
  }

  protected dec(key: string): void {
    this.lines.update((ls) => ls.flatMap((l) => (l.key !== key ? [l] : l.qty > 1 ? [{ ...l, qty: l.qty - 1 }] : [])));
  }

  protected pickArea(id: string): void {
    this.area.set(AREAS.find((a) => a.id === id) ?? AREAS[0]);
  }

  /** A new brand is a new restaurant: its own menu, so the cart starts again with one of its first items. */
  protected pickBrand(b: Brand): void {
    if (b.id === this.brand().id) return;
    this.brand.set(b);
    this.cat.set(0);
    this.picked.set({});
    this.seed();
  }

  protected reset(): void {
    this.lines.set([]);
    this.picked.set({});
    this.mode.set('delivery');
    this.area.set(AREAS[1]);
  }

  /** One large first item in the cart, so the minimum-order rule shows from the start. */
  private seed(): void {
    this.lines.set([]);
    this.add(this.brand().menu[0].items[0]);
  }
}
