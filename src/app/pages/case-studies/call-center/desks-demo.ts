import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { phosphorArrowCounterClockwise, phosphorBell, phosphorPhoneCall } from '@ng-icons/phosphor-icons/regular';
import { ORDERS, Order, RESTAURANTS, STATUSES, Status, money, restaurantName, totals } from './call-center.data';

/**
 * One login, three desks (my own redraw). The menu per role is the real sidebar's: admins get restaurants, staff
 * and settings; the call center gets categories, products and orders; a restaurant gets only its own orders. The
 * call center sees every restaurant's orders, the restaurant only its own, and both move an order through the five
 * real statuses. A new phone order also shows in the restaurant's notification bell, like the header bell of the
 * real portal. Notification wording is mine.
 * Sample restaurants and orders.
 */
type Role = 'admin' | 'center' | 'restaurant';

const MENU: { t: string; roles: Role[] }[] = [
  { t: 'Dashboard', roles: ['admin', 'center', 'restaurant'] },
  { t: 'Restaurants', roles: ['admin'] },
  { t: 'Staff', roles: ['admin'] },
  { t: 'Settings', roles: ['admin'] },
  { t: 'Categories', roles: ['center'] },
  { t: 'Products', roles: ['center'] },
  { t: 'Orders', roles: ['center', 'restaurant'] },
];

/** The restaurant this demo signs in as. */
const HOME = 1;

const STAFF: Record<number, number> = { 1: 3, 2: 2, 3: 2 };

const CALL: Omit<Order, 'no'> = {
  restaurant: HOME,
  customer: 'Sample caller E',
  phone: '0700 555 0199',
  address: '7 Canal Walk, Northtown',
  date: '14 Mar 2023, 19:20',
  status: 'Pending',
  lines: [
    { product: 'Margherita', size: '32 cm', qty: 1, price: 9.9 },
    { product: 'Lemonade', size: '0.33 l', qty: 1, price: 2.5 },
  ],
};

interface Note {
  id: number;
  text: string;
}

@Component({
  selector: 'mh-cc-desks',
  imports: [NgIcon, NgTemplateOutlet],
  viewProviders: [provideIcons({ phosphorArrowCounterClockwise, phosphorBell, phosphorPhoneCall })],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./mini-btn.scss'],
  template: `
    <div class="desk card card--lift">
      <div class="top">
        <div class="roles">
          <span class="mono lbl" id="cc-role">Signed in as</span>
          <div class="seg" role="group" aria-labelledby="cc-role">
            <button type="button" [attr.aria-pressed]="role() === 'admin'" (click)="setRole('admin')">Admin</button>
            <button type="button" [attr.aria-pressed]="role() === 'center'" (click)="setRole('center')">Call center</button>
            <button type="button" [attr.aria-pressed]="role() === 'restaurant'" (click)="setRole('restaurant')">{{ home }}</button>
          </div>
        </div>
        <button type="button" class="mini-btn mini-btn--icon" aria-label="Reset the sample orders" (click)="reset()">
          <ng-icon name="phosphorArrowCounterClockwise" aria-hidden="true" />
        </button>
      </div>

      <ul class="menu" role="list" aria-label="Menu for this role">
        @for (m of menu; track m.t) {
          <li [class.off]="!m.roles.includes(role())">
            {{ m.t }}<span class="sr-only">{{ m.roles.includes(role()) ? '' : ', hidden for this role' }}</span>
          </li>
        }
      </ul>

      @switch (role()) {
        @case ('admin') {
          <div class="bar">
            <h3>Restaurants</h3>
            <span class="mono small">{{ restaurants.length }} on the portal</span>
          </div>
          <ul class="rows" role="list">
            @for (r of restaurants; track r.id) {
              <li>
                <div class="txt">
                  <b>{{ r.name }}</b>
                  <span>{{ r.city }}, {{ staff[r.id] }} staff logins</span>
                </div>
                <span class="chip-st" data-s="Completed">Active</span>
              </li>
            }
          </ul>
          <p class="note">Admins set up restaurants, staff logins and the portal’s settings. Orders are for the call center and the kitchens.</p>
        }
        @case ('center') {
          <div class="bar">
            <h3>Orders, all restaurants</h3>
            <button type="button" class="mini-btn is-primary" [disabled]="called()" (click)="call()">
              <ng-icon name="phosphorPhoneCall" aria-hidden="true" /> Take a call
            </button>
          </div>
          <ng-container *ngTemplateOutlet="list; context: { $implicit: orders() }" />
        }
        @case ('restaurant') {
          <div class="bar">
            <h3>Orders, {{ home }}</h3>
            <button
              type="button"
              class="mini-btn mini-btn--icon bell"
              [attr.aria-label]="'Notifications, ' + notes().length + ' unread'"
              [attr.aria-expanded]="bellOpen()"
              aria-controls="cc-notes"
              (click)="bellOpen.set(!bellOpen())"
            >
              <ng-icon name="phosphorBell" aria-hidden="true" />
              @if (notes().length) {
                <span class="count mono" aria-hidden="true">{{ notes().length }}</span>
              }
            </button>
          </div>
          @if (bellOpen()) {
            <ul class="notes" id="cc-notes" role="list" aria-label="Notifications">
              @for (n of notes(); track n.id) {
                <li>
                  <span>{{ n.text }}</span>
                  <button type="button" class="mini-btn" (click)="read(n.id)">Mark read</button>
                </li>
              } @empty {
                <li class="none">No unread notifications.</li>
              }
            </ul>
          }
          <ng-container *ngTemplateOutlet="list; context: { $implicit: mine() }" />
        }
      }
      <p class="mono sample" aria-live="polite">{{ msg() }}</p>
    </div>

    <ng-template #list let-orders>
      <ul class="rows" role="list">
        @for (o of orders; track o.no) {
          <li>
            <div class="txt">
              <b><span class="mono">#{{ o.no }}</span> {{ o.customer }}</b>
              <span>{{ role() === 'center' ? name(o.restaurant) + ', ' : '' }}<span class="mono">€{{ total(o) }}</span>, {{ o.date.split(', ')[1] }}</span>
            </div>
            <label class="sr-only" [for]="'cc-st-' + o.no">Status of order {{ o.no }}</label>
            <select [id]="'cc-st-' + o.no" class="st" [attr.data-s]="o.status" (change)="setStatus(o.no, $any($event.target).value)">
              @for (s of statuses; track s) {
                <option [value]="s" [selected]="o.status === s">{{ s }}</option>
              }
            </select>
          </li>
        }
      </ul>
    </ng-template>
  `,
  styles: `
    :host {
      display: block;
    }
    .desk {
      display: grid;
      gap: 12px;
      padding: 18px;
      max-width: 760px;
      margin-inline: auto;
    }
    .top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
    }
    .roles {
      display: flex;
      align-items: center;
      gap: 10px;
      flex-wrap: wrap;

      .lbl {
        font-size: 12px;
        color: var(--muted);
      }
      .seg {
        flex-wrap: wrap;
      }
      .seg button {
        height: 30px;
        padding: 0 11px;
        font-size: 12.5px;
      }
    }
    .menu {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;

      li {
        padding: 3px 9px;
        border-radius: 999px;
        font-size: 12px;
        background: var(--c-blue-soft);
        color: var(--c-blue-text);

        &.off {
          background: var(--surface-2);
          color: var(--muted);
          text-decoration: line-through;
        }
      }
    }
    .bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      min-height: 32px;
      padding-top: 4px;

      h3 {
        font-size: 14.5px;
      }
    }
    .small {
      font-size: 12px;
      color: var(--muted);
    }
    .rows {
      display: grid;
      gap: 6px;

      li {
        display: flex;
        align-items: center;
        gap: 10px;
        min-height: 56px;
        padding: 6px 8px 6px 12px;
        border-radius: var(--r-inner);
        border: 1px solid var(--line);
      }
    }
    .txt {
      flex: 1;
      min-width: 0;

      b {
        display: block;
        font-size: 13px;
        font-weight: 600;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      b .mono {
        font-size: 12px;
        font-weight: 400;
        color: var(--muted);
      }
      > span {
        font-size: 12px;
        color: var(--muted);
      }
    }
    .st,
    .chip-st {
      font-size: 12px;
      font-weight: 500;
      border-radius: 999px;
      border: 1px solid transparent;
      background: var(--c-amber-soft);
      color: var(--c-amber-text);
    }
    .chip-st {
      padding: 3px 10px;
    }
    .st {
      appearance: none;
      height: 40px;
      min-width: 112px;
      padding: 0 28px 0 12px;
      cursor: pointer;
      background-image:
        linear-gradient(45deg, transparent 50%, currentColor 50%), linear-gradient(135deg, currentColor 50%, transparent 50%);
      background-position:
        calc(100% - 15px) 50%,
        calc(100% - 11px) 50%;
      background-size: 4px 4px;
      background-repeat: no-repeat;

      &:focus-visible {
        outline: 2px solid var(--focus);
        outline-offset: 2px;
      }
    }
    [data-s='Processing'] {
      background-color: var(--c-blue-soft);
      color: var(--c-blue-text);
    }
    [data-s='Delivered'] {
      background-color: var(--surface-2);
      color: var(--ink-2);
    }
    [data-s='Completed'] {
      background-color: var(--c-green-soft);
      color: var(--c-green-text);
    }
    [data-s='Cancelled'] {
      background-color: var(--c-red-soft);
      color: var(--c-red-text);
    }
    .st option {
      background: var(--surface);
      color: var(--ink);
    }
    .bell {
      position: relative;
    }
    .count {
      position: absolute;
      top: -6px;
      right: -6px;
      min-width: 18px;
      height: 18px;
      padding: 0 4px;
      display: grid;
      place-items: center;
      border-radius: 999px;
      background: var(--c-red-text);
      color: #fff;
      font-size: 12px;
    }
    .notes {
      display: grid;
      gap: 6px;
      padding: 8px;
      border-radius: var(--r-inner);
      background: var(--surface-2);

      li {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        padding: 6px 6px 6px 10px;
        border-radius: 10px;
        background: var(--surface);
        font-size: 12.5px;
      }
      .none {
        background: transparent;
        color: var(--muted);
      }
    }
    .note {
      font-size: 12.5px;
      color: var(--muted);
    }
    .sample {
      font-size: 12px;
      color: var(--muted);
      min-height: 14px;
    }
    @media (max-width: 520px) {
      .desk {
        padding: 14px;
      }
      .rows li {
        flex-wrap: wrap;
      }
      .txt b {
        white-space: normal;
      }
    }
    /* Narrow phones: the segmented control takes a full row of equal cells instead of wrapping into a blob */
    @media (max-width: 360px) {
      .roles {
        flex: 1;
        min-width: 0;
      }
      .roles .seg {
        width: 100%;
        display: grid;
        grid-auto-flow: column;
        grid-auto-columns: minmax(0, 1fr);
        border-radius: 18px;
      }
      .roles .seg button {
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
export class CallCenterDesksDemo {
  protected readonly menu = MENU;
  protected readonly statuses = STATUSES;
  protected readonly restaurants = RESTAURANTS;
  protected readonly staff = STAFF;
  protected readonly home = restaurantName(HOME);
  protected readonly name = restaurantName;

  protected readonly role = signal<Role>('center');
  protected readonly orders = signal<Order[]>([...ORDERS]);
  protected readonly notes = signal<Note[]>([]);
  protected readonly bellOpen = signal(false);
  protected readonly called = signal(false);
  protected readonly msg = signal('Sample orders. Change a status, or take a call.');

  protected readonly mine = computed(() => this.orders().filter((o) => o.restaurant === HOME));

  protected total(o: Order): string {
    return money(totals(o.lines).total);
  }

  protected setRole(r: Role): void {
    this.role.set(r);
    this.bellOpen.set(false);
    this.msg.set(
      r === 'admin'
        ? 'Admin: restaurants, staff and settings. No orders menu.'
        : r === 'restaurant'
          ? `Signed in as ${this.home}: only its own orders.`
          : 'Call center: every restaurant’s orders.',
    );
  }

  protected setStatus(no: number, status: Status): void {
    this.orders.update((l) => l.map((o) => (o.no === no ? { ...o, status } : o)));
    this.msg.set(`#${no} is now ${status}.`);
  }

  protected call(): void {
    const no = 1047;
    this.orders.update((l) => [{ ...CALL, no }, ...l]);
    this.notes.update((n) => [{ id: no, text: `New order #${no} from the call center.` }, ...n]);
    this.called.set(true);
    this.msg.set(`#${no} placed for ${this.home}. Switch to ${this.home} to see the bell.`);
  }

  protected read(id: number): void {
    this.notes.update((n) => n.filter((x) => x.id !== id));
  }

  protected reset(): void {
    this.orders.set([...ORDERS]);
    this.notes.set([]);
    this.called.set(false);
    this.bellOpen.set(false);
    this.msg.set('Sample orders reset.');
  }
}
