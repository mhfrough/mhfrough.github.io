import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  phosphorArrowCounterClockwise,
  phosphorArrowRight,
  phosphorCheck,
  phosphorPlus,
  phosphorPrinter,
  phosphorX,
} from '@ng-icons/phosphor-icons/regular';
import { ROUTES, VEHICLES, VehicleId, eur, fare, hm, route, vehicle } from './malik-transport.data';

/**
 * The order desk, redrawn (my own mockup, not a screenshot). One portal, three roles, and each role gets its own
 * lists, as in the real sidebar: the customer books and follows Pending, Accepted, Closed and Rejected; the office
 * accepts or rejects new orders with a remark, assigns a driver and watches Running; a driver sees only the jobs
 * assigned to them, accepts or declines, and opens the delivery note of a running job. The note has the fields the
 * printed one had: order number, QR code, both addresses with coordinates, distance, time, fare and waiting
 * charge. Sample orders; customers and drivers are numbered, never named. Closing happened outside these screens,
 * so closed orders are seeded.
 */
type Role = 'customer' | 'office' | 'driver';
type Status = 'new' | 'accepted' | 'assigned' | 'declined' | 'running' | 'closed' | 'rejected';

interface Order {
  no: number;
  customer: string;
  vehicle: VehicleId;
  route: string;
  status: Status;
  driver?: string;
  remark?: string;
}

const ME_CUSTOMER = 'Customer 14';
const ME_DRIVER = 'Driver 2';
const DRIVERS = ['Driver 1', 'Driver 2', 'Driver 3'];

const SEED: Order[] = [
  { no: 1043, customer: 'Customer 14', vehicle: 'transporter', route: 'wi', status: 'new' },
  { no: 1042, customer: 'Customer 22', vehicle: 'truck75', route: 'mz', status: 'new' },
  { no: 1041, customer: 'Customer 14', vehicle: 'wagon', route: 'ffm', status: 'accepted' },
  { no: 1040, customer: 'Customer 31', vehicle: 'truck12', route: 'ko', status: 'assigned', driver: 'Driver 2' },
  { no: 1039, customer: 'Customer 22', vehicle: 'transporter', route: 'mz', status: 'running', driver: 'Driver 1' },
  { no: 1038, customer: 'Customer 14', vehicle: 'truck75', route: 'wi', status: 'closed', driver: 'Driver 2' },
  { no: 1037, customer: 'Customer 31', vehicle: 'wagon', route: 'ham', status: 'rejected', remark: 'Outside the requested pickup window' },
];

interface ListDef {
  id: string;
  t: string;
  has: (o: Order) => boolean;
}

const LISTS: Record<Role, ListDef[]> = {
  customer: [
    { id: 'pending', t: 'Pending', has: (o) => o.customer === ME_CUSTOMER && o.status === 'new' },
    { id: 'accepted', t: 'Accepted', has: (o) => o.customer === ME_CUSTOMER && ['accepted', 'assigned', 'declined', 'running'].includes(o.status) },
    { id: 'closed', t: 'Closed', has: (o) => o.customer === ME_CUSTOMER && o.status === 'closed' },
    { id: 'rejected', t: 'Rejected', has: (o) => o.customer === ME_CUSTOMER && o.status === 'rejected' },
  ],
  office: [
    { id: 'new', t: 'New', has: (o) => o.status === 'new' },
    { id: 'accepted', t: 'Accepted', has: (o) => o.status === 'accepted' || o.status === 'declined' },
    { id: 'running', t: 'Running', has: (o) => o.status === 'assigned' || o.status === 'running' },
    { id: 'closed', t: 'Closed', has: (o) => o.status === 'closed' },
    { id: 'rejected', t: 'Rejected', has: (o) => o.status === 'rejected' },
  ],
  driver: [
    { id: 'new', t: 'New', has: (o) => o.driver === ME_DRIVER && o.status === 'assigned' },
    { id: 'running', t: 'Running', has: (o) => o.driver === ME_DRIVER && o.status === 'running' },
    { id: 'closed', t: 'Closed', has: (o) => o.driver === ME_DRIVER && o.status === 'closed' },
  ],
};

const STATUS: Record<Status, string> = {
  new: 'New',
  accepted: 'Needs a driver',
  assigned: 'Waiting for driver',
  declined: 'Driver declined',
  running: 'Running',
  closed: 'Closed',
  rejected: 'Rejected',
};

// Places for the delivery note: public points in each town, rounded coordinates.
const POINTS: Record<string, { name: string; lat: string; lng: string }> = {
  'Rüdesheim am Rhein': { name: 'Bahnhof, Rüdesheim am Rhein', lat: '49.979', lng: '7.924' },
  Wiesbaden: { name: 'Hauptbahnhof, Wiesbaden', lat: '50.070', lng: '8.244' },
  Mainz: { name: 'Rathaus, Mainz', lat: '50.000', lng: '8.275' },
  Koblenz: { name: 'Hauptbahnhof, Koblenz', lat: '50.351', lng: '7.589' },
  'Frankfurt am Main': { name: 'Messe, Frankfurt am Main', lat: '50.112', lng: '8.651' },
  Hamburg: { name: 'Hafen, Hamburg', lat: '53.544', lng: '9.966' },
};

/** A deterministic 11 x 11 pattern standing in for the invoice QR code (decorative): three solid corner blocks
 * and pseudo-random cells seeded by the order number. */
function qrCells(seed: number): { x: number; y: number }[] {
  const cells: { x: number; y: number }[] = [];
  let s = seed;
  for (let y = 0; y < 11; y++) {
    for (let x = 0; x < 11; x++) {
      const corner = (x < 3 && y < 3) || (x > 7 && y < 3) || (x < 3 && y > 7);
      const gap = (x === 3 && (y < 4 || y > 6)) || (y === 3 && (x < 4 || x > 6)) || (x === 7 && y < 4) || (y === 7 && x < 4);
      s = (s * 9301 + 49297) % 233280;
      if (corner || (!gap && s / 233280 > 0.52)) cells.push({ x, y });
    }
  }
  return cells;
}

@Component({
  selector: 'mh-mt-dispatch',
  imports: [NgIcon],
  viewProviders: [
    provideIcons({ phosphorArrowCounterClockwise, phosphorArrowRight, phosphorCheck, phosphorPlus, phosphorPrinter, phosphorX }),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./mini-btn.scss'],
  template: `
    <div class="desk card">
      <div class="top">
        <div class="roles">
          <span class="mono lbl" id="mt-role">Signed in as</span>
          <div class="seg" role="group" aria-labelledby="mt-role">
            <button type="button" [attr.aria-pressed]="role() === 'customer'" (click)="setRole('customer')">{{ meCustomer }}</button>
            <button type="button" [attr.aria-pressed]="role() === 'office'" (click)="setRole('office')">Office</button>
            <button type="button" [attr.aria-pressed]="role() === 'driver'" (click)="setRole('driver')">{{ meDriver }}</button>
          </div>
        </div>
        <button type="button" class="reset" aria-label="Reset the sample orders" (click)="reset()">
          <ng-icon name="phosphorArrowCounterClockwise" aria-hidden="true" />
        </button>
      </div>

      <div class="lists" role="group" aria-label="Order lists for this role">
        @for (l of lists(); track l.id) {
          <button type="button" class="tab" [attr.aria-pressed]="listId() === l.id" (click)="setList(l.id)">
            {{ l.t }} <span class="mono n">{{ count(l) }}</span>
          </button>
        }
        @if (role() === 'customer') {
          <button type="button" class="mini-btn is-primary new-order" (click)="book()">
            <ng-icon name="phosphorPlus" aria-hidden="true" /> New order
          </button>
        }
      </div>

      <ul class="rows" role="list">
        @for (o of shown(); track o.no) {
          <li class="row" [attr.data-s]="o.status">
            <div class="o-main">
              <p class="o-title">
                <span class="mono">MTS-{{ o.no }}</span>
                <b>{{ r(o).from === 'Rüdesheim am Rhein' ? 'Rüdesheim' : r(o).from }} <ng-icon name="phosphorArrowRight" aria-hidden="true" /><span class="sr-only"> to </span> {{ r(o).to }}</b>
              </p>
              <p class="o-sub">{{ sub(o) }}</p>
              @if (o.remark) {
                <p class="o-rem">Remark: {{ o.remark }}</p>
              }
            </div>
            <span class="st">{{ statusLabel(o) }}</span>

            <div class="acts">
              @if (role() === 'office' && o.status === 'new') {
                <button type="button" class="mini-btn is-primary" (click)="accept(o.no)"><ng-icon name="phosphorCheck" aria-hidden="true" /> Accept</button>
                <button type="button" class="mini-btn is-danger" [attr.aria-expanded]="rejecting() === o.no" (click)="startReject(o.no)"><ng-icon name="phosphorX" aria-hidden="true" /> Reject</button>
              }
              @if (role() === 'office' && (o.status === 'accepted' || o.status === 'declined')) {
                <span class="drv" role="group" [attr.aria-label]="'Driver for MTS-' + o.no">
                  @for (d of drivers; track d) {
                    <button type="button" class="mini-btn" [attr.aria-pressed]="d === driverFor(o.no)" (click)="pickDriver(o.no, d)">{{ d }}</button>
                  }
                </span>
                <button type="button" class="mini-btn is-primary" (click)="assign(o.no)">Assign</button>
              }
              @if (role() === 'driver' && o.status === 'assigned') {
                <button type="button" class="mini-btn is-primary" (click)="driverAccept(o.no)"><ng-icon name="phosphorCheck" aria-hidden="true" /> Accept</button>
                <button type="button" class="mini-btn is-danger" (click)="driverDecline(o.no)">Decline</button>
              }
              @if (role() !== 'customer' && o.status === 'running') {
                <button type="button" class="mini-btn" [attr.aria-expanded]="noteFor() === o.no" (click)="toggleNote(o.no)">
                  <ng-icon name="phosphorPrinter" aria-hidden="true" /> Delivery note
                </button>
              }
            </div>
          </li>

          @if (rejecting() === o.no) {
            <li class="reject">
              <label [for]="'mt-rej-' + o.no">Reason for the customer</label>
              <div class="rj-row">
                <input
                  class="input"
                  [id]="'mt-rej-' + o.no"
                  maxlength="120"
                  [value]="remark()"
                  (input)="remark.set($any($event.target).value)"
                  [attr.aria-describedby]="'mt-rej-h-' + o.no"
                />
                <button type="button" class="mini-btn is-primary" [disabled]="remark().trim().length < 4" (click)="reject(o.no)">Send</button>
              </div>
              <span class="mono hint" [id]="'mt-rej-h-' + o.no">Shown to the customer in Rejected.</span>
            </li>
          }

          @if (noteFor() === o.no) {
            <li class="dn" [attr.aria-label]="'Delivery note for MTS-' + o.no">
              <div class="dn-head">
                <div class="dn-brand">
                  <img src="/images/malik-transport/malik-transport-mark.webp" width="41" height="32" alt="" />
                  <b>Delivery note</b>
                </div>
                <svg class="qr" viewBox="0 0 11 11" width="56" height="56" aria-hidden="true">
                  @for (c of qr(o.no); track $index) {
                    <rect [attr.x]="c.x" [attr.y]="c.y" width="1" height="1" />
                  }
                </svg>
              </div>
              <dl class="dn-meta">
                <div><dt>Order</dt><dd class="mono">MTS-{{ o.no }}</dd></div>
                <div><dt>Vehicle</dt><dd>{{ v(o).name }}</dd></div>
                <div><dt>Pickup</dt><dd>{{ pt(r(o).from).name }} <span class="mono">({{ pt(r(o).from).lat }}, {{ pt(r(o).from).lng }})</span></dd></div>
                <div><dt>Drop</dt><dd>{{ pt(r(o).to).name }} <span class="mono">({{ pt(r(o).to).lat }}, {{ pt(r(o).to).lng }})</span></dd></div>
              </dl>
              <table class="dn-t">
                <thead>
                  <tr><th scope="col">Distance</th><th scope="col">Time</th><th scope="col">Fare</th><th scope="col">Waiting</th></tr>
                </thead>
                <tbody>
                  <tr>
                    <td class="mono">{{ r(o).km }} km</td>
                    <td class="mono">{{ hm(r(o).min) }}</td>
                    <td class="mono">{{ eur(fareOf(o)) }}</td>
                    <td class="mono">{{ eur(v(o).wait) }} / 30 min</td>
                  </tr>
                </tbody>
              </table>
            </li>
          }
        } @empty {
          <li class="empty">Nothing in this list. {{ emptyHint() }}</li>
        }
      </ul>

      <p class="mono sample" aria-live="polite">{{ note() }}</p>
    </div>
  `,
  styles: `
    :host {
      display: block;
    }
    .desk {
      display: grid;
      gap: 12px;
      padding: 18px;
    }
    .top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
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
        height: 32px;
        padding: 0 12px;
        font-size: 13px;
      }
    }
    .reset {
      width: 44px;
      height: 44px;
      flex-shrink: 0;
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
    .lists {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 6px;
      padding-bottom: 12px;
      border-bottom: 1px solid var(--line);
    }
    .tab {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      height: 32px;
      padding: 0 12px;
      border-radius: 999px;
      border: 1px solid var(--line);
      font-size: 13px;
      font-weight: 500;
      color: var(--ink-2);
      position: relative;

      &::before {
        content: '';
        position: absolute;
        inset: -6px -2px;
      }
      .n {
        font-size: 12px;
        min-width: 18px;
        padding: 1px 5px;
        border-radius: 999px;
        background: var(--surface-2);
        color: var(--ink-2);
        text-align: center;
      }
      &:hover {
        border-color: var(--line-strong);
      }
      &[aria-pressed='true'] {
        border-color: var(--mt-blue);
        background: var(--mt-blue-soft);
        color: var(--mt-blue-text);

        .n {
          background: var(--surface);
          color: var(--mt-blue-text);
        }
      }
      &:focus-visible {
        outline: 2px solid var(--focus);
        outline-offset: 2px;
      }
    }
    .new-order {
      margin-left: auto;
    }
    .rows {
      display: grid;
      gap: 6px;
      min-height: 236px;
      align-content: start;
    }
    .row {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      gap: 6px 12px;
      align-items: center;
      padding: 10px 12px;
      border-radius: var(--r-inner);
      border: 1px solid var(--line);
      background: var(--surface);
    }
    .o-main {
      min-width: 0;
    }
    .o-title {
      display: flex;
      align-items: baseline;
      gap: 8px;
      flex-wrap: wrap;
      font-size: 13.5px;

      .mono {
        font-size: 12px;
        color: var(--muted);
      }
      b {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        font-weight: 600;
      }
      ng-icon {
        font-size: 12px;
        color: var(--muted);
      }
    }
    .o-sub {
      font-size: 12px;
      color: var(--muted);
    }
    .o-rem {
      margin-top: 2px;
      font-size: 12px;
      color: var(--mt-red-text);
    }
    .st {
      justify-self: end;
      font-size: 12px;
      font-weight: 500;
      padding: 2px 9px;
      border-radius: 999px;
      white-space: nowrap;
      background: var(--mt-amber-soft);
      color: var(--mt-amber-text);
    }
    [data-s='accepted'] .st,
    [data-s='assigned'] .st {
      background: var(--mt-blue-soft);
      color: var(--mt-blue-text);
    }
    [data-s='running'] .st {
      background: var(--mt-cyan-soft);
      color: var(--mt-cyan-text);
    }
    [data-s='closed'] .st {
      background: var(--mt-green-soft);
      color: var(--mt-green-text);
    }
    [data-s='rejected'] .st,
    [data-s='declined'] .st {
      background: var(--mt-red-soft);
      color: var(--mt-red-text);
    }
    .acts {
      grid-column: 1 / -1;
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      align-items: center;

      &:empty {
        display: none;
      }
    }
    .drv {
      display: inline-flex;
      flex-wrap: wrap;
      gap: 4px;

      .mini-btn[aria-pressed='true'] {
        border-color: var(--mt-blue);
        background: var(--mt-blue-soft);
        color: var(--mt-blue-text);
      }
    }
    .reject {
      display: grid;
      gap: 6px;
      padding: 10px 12px;
      border-radius: var(--r-inner);
      background: var(--mt-red-soft);

      label {
        font-size: 12.5px;
        font-weight: 500;
        color: var(--ink);
      }
      .input {
        height: 44px;
        font-size: 13.5px;
        background: var(--surface);
      }
      .hint {
        font-size: 12px;
        color: var(--ink-2);
      }
    }
    .rj-row {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      gap: 8px;
      align-items: center;
    }
    .dn {
      display: grid;
      gap: 10px;
      padding: 14px;
      border-radius: var(--r-inner);
      border: 1px dashed var(--line-strong);
      background: var(--surface);
    }
    .dn-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
    }
    .dn-brand {
      display: flex;
      align-items: center;
      gap: 10px;

      img {
        width: 30px;
        height: auto;
      }
      b {
        font-size: 14px;
      }
    }
    .qr {
      flex-shrink: 0;
      fill: var(--ink);
      shape-rendering: crispEdges;
    }
    .dn-meta {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 8px 16px;
      margin: 0;

      dt {
        font-size: 12px;
        color: var(--muted);
      }
      dd {
        margin: 0;
        font-size: 12.5px;
        color: var(--ink);

        .mono {
          font-size: 12px;
          color: var(--muted);
        }
      }
    }
    .dn-t {
      width: 100%;
      border-collapse: collapse;
      font-size: 12px;

      th {
        text-align: left;
        font-weight: 500;
        color: var(--ink-2);
        background: var(--surface-2);
        padding: 6px 8px;
      }
      td {
        padding: 6px 8px;
        border-bottom: 1px solid var(--line);
        color: var(--ink);
      }
    }
    .empty {
      padding: 18px 12px;
      border-radius: var(--r-inner);
      background: var(--bg);
      font-size: 13px;
      color: var(--muted);
      text-align: center;
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
      .top {
        align-items: flex-start;
      }
      .dn-meta {
        grid-template-columns: 1fr;
      }
      .dn-t {
        font-size: 12px;
      }
      .dn-t th,
      .dn-t td {
        padding: 5px 4px;
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
export class MalikTransportDispatchDemo {
  protected readonly meCustomer = ME_CUSTOMER;
  protected readonly meDriver = ME_DRIVER;
  protected readonly drivers = DRIVERS;
  protected readonly eur = eur;
  protected readonly hm = hm;

  protected readonly role = signal<Role>('office');
  protected readonly listId = signal('new');
  protected readonly orders = signal<Order[]>(SEED);
  protected readonly rejecting = signal<number | null>(null);
  protected readonly remark = signal('');
  protected readonly noteFor = signal<number | null>(null);
  protected readonly picks = signal<Record<number, string>>({});
  protected readonly note = signal('Sample orders. Accept one, then assign a driver under Accepted.');
  private nextNo = 1044;
  private bookIdx = 0;

  protected readonly lists = computed(() => LISTS[this.role()]);
  protected readonly current = computed(() => this.lists().find((l) => l.id === this.listId()) ?? this.lists()[0]);
  protected readonly shown = computed(() => this.orders().filter(this.current().has));
  protected readonly emptyHint = computed(() => {
    const r = this.role();
    if (r === 'customer') return 'Book one with New order.';
    if (r === 'driver') return 'The office assigns jobs from its Accepted list.';
    return 'Customers book from the portal or the price calculator.';
  });

  protected r = (o: Order) => route(o.route);
  protected v = (o: Order) => vehicle(o.vehicle);
  protected pt = (town: string) => POINTS[town];
  protected fareOf = (o: Order) => fare(vehicle(o.vehicle), route(o.route)).total;
  protected qr = (no: number) => qrCells(no);

  protected sub(o: Order): string {
    const parts = [this.v(o).name, this.r(o).km + ' km', eur(this.fareOf(o))];
    if (this.role() === 'office') parts.push(o.customer);
    if (o.driver && this.role() !== 'driver') parts.push(o.driver);
    return parts.join(', ');
  }

  protected count(l: ListDef): number {
    return this.orders().filter(l.has).length;
  }

  protected statusLabel(o: Order): string {
    if (this.role() === 'customer' && o.status === 'new') return 'Pending';
    if (o.status === 'assigned' && this.role() === 'driver') return 'Assigned to you';
    return STATUS[o.status];
  }

  protected driverFor(no: number): string {
    return this.picks()[no] ?? DRIVERS[1];
  }

  protected setRole(r: Role): void {
    this.role.set(r);
    this.listId.set(LISTS[r][0].id);
    this.rejecting.set(null);
    this.noteFor.set(null);
    this.note.set(
      r === 'customer'
        ? `Signed in as ${ME_CUSTOMER}: only their own orders.`
        : r === 'driver'
          ? `Signed in as ${ME_DRIVER}: only jobs assigned to them.`
          : 'The office sees every order.',
    );
  }

  protected setList(id: string): void {
    this.listId.set(id);
    this.rejecting.set(null);
    this.noteFor.set(null);
  }

  private patch(no: number, p: Partial<Order>): void {
    this.orders.update((l) => l.map((o) => (o.no === no ? { ...o, ...p } : o)));
  }

  protected book(): void {
    const r = ROUTES[this.bookIdx % 4];
    const v = VEHICLES[(this.bookIdx + 1) % 4];
    this.bookIdx++;
    const no = this.nextNo++;
    this.orders.update((l) => [{ no, customer: ME_CUSTOMER, vehicle: v.id, route: r.id, status: 'new' as const }, ...l]);
    this.listId.set('pending');
    this.note.set(`MTS-${no} booked at ${eur(fare(v, r).total)}. The office sees it under New.`);
  }

  protected accept(no: number): void {
    this.patch(no, { status: 'accepted' });
    this.rejecting.set(null);
    this.note.set(`MTS-${no} accepted. It now waits under Accepted for a driver.`);
  }

  protected startReject(no: number): void {
    this.rejecting.set(this.rejecting() === no ? null : no);
    this.remark.set('');
  }

  protected reject(no: number): void {
    this.patch(no, { status: 'rejected', remark: this.remark().trim() });
    this.rejecting.set(null);
    this.note.set(`MTS-${no} rejected. The customer sees the reason.`);
  }

  protected pickDriver(no: number, d: string): void {
    this.picks.update((p) => ({ ...p, [no]: d }));
  }

  protected assign(no: number): void {
    const d = this.driverFor(no);
    this.patch(no, { status: 'assigned', driver: d, remark: undefined });
    this.note.set(`MTS-${no} assigned to ${d}.${d === ME_DRIVER ? ' Switch to ' + ME_DRIVER + ' to accept it.' : ''}`);
  }

  protected driverAccept(no: number): void {
    this.patch(no, { status: 'running' });
    this.note.set(`MTS-${no} is running. Its delivery note is under Running.`);
  }

  protected driverDecline(no: number): void {
    this.patch(no, { status: 'declined' });
    this.note.set(`MTS-${no} declined. It is back with the office to assign again.`);
  }

  protected toggleNote(no: number): void {
    this.noteFor.set(this.noteFor() === no ? null : no);
  }

  protected reset(): void {
    this.orders.set(SEED);
    this.picks.set({});
    this.rejecting.set(null);
    this.noteFor.set(null);
    this.nextNo = 1044;
    this.bookIdx = 0;
    this.listId.set(LISTS[this.role()][0].id);
    this.note.set('Sample orders reset.');
  }
}
