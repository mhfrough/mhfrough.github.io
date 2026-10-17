import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  phosphorArrowCounterClockwise,
  phosphorBroadcast,
  phosphorCheck,
  phosphorMoon,
  phosphorPlus,
  phosphorSun,
  phosphorSunHorizon,
} from '@ng-icons/phosphor-icons/regular';

/**
 * Hero mockup of the Bloomstone slot desk (my own design, not a screenshot). It runs the same rules as the
 * real API: requests never block, a slot closes only when staff confirm, and confirming cancels every request
 * that clashes. The guest side (request) and the staff side (confirm) share one card. Sample data, two fixed
 * weeks, so the prerendered HTML never depends on today's date.
 */
type Slot = 'day' | 'night' | 'full';
type Status = 'available' | 'limited' | 'booked';
type ReqStatus = 'pending' | 'confirmed' | 'cancelled';

interface Req {
  id: number;
  date: number;
  slot: Slot;
  guests: number;
  status: ReqStatus;
}

const SLOTS: { id: Slot; label: string; icon: string; meta: string }[] = [
  { id: 'day', label: 'Day slot', icon: 'phosphorSun', meta: '10 hours, Rs 30,000 deposit' },
  { id: 'night', label: 'Night slot', icon: 'phosphorMoon', meta: '10 hours, Rs 30,000 deposit' },
  { id: 'full', label: 'Full day', icon: 'phosphorSunHorizon', meta: '20 hours, Rs 50,000 deposit' },
];

const LABEL: Record<Status, string> = { available: 'Available', limited: 'Limited', booked: 'Booked' };
const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
// 12 October 2026 is a Monday: two weeks, 12 to 25.
const DATES = Array.from({ length: 14 }, (_, i) => 12 + i);

const SEED: Req[] = [
  { id: 1, date: 14, slot: 'full', guests: 18, status: 'confirmed' },
  { id: 2, date: 16, slot: 'day', guests: 12, status: 'pending' },
  { id: 3, date: 16, slot: 'full', guests: 20, status: 'pending' },
  { id: 4, date: 16, slot: 'night', guests: 9, status: 'pending' },
  { id: 5, date: 17, slot: 'night', guests: 15, status: 'confirmed' },
  { id: 6, date: 17, slot: 'day', guests: 10, status: 'pending' },
  { id: 7, date: 20, slot: 'night', guests: 8, status: 'pending' },
  { id: 8, date: 23, slot: 'day', guests: 14, status: 'confirmed' },
  { id: 9, date: 23, slot: 'night', guests: 16, status: 'confirmed' },
  { id: 10, date: 24, slot: 'full', guests: 20, status: 'pending' },
];

/** Does `a` take the same hours as `b`? A full day overlaps everything; Day and Night only themselves. */
const clashes = (a: Slot, b: Slot) => a === 'full' || b === 'full' || a === b;

/** Slot status for one date, as the API's month view works it out: confirmed beats pending beats free. */
function statusOf(reqs: Req[], slot: Slot): Status {
  const live = reqs.filter((r) => r.status !== 'cancelled' && clashes(r.slot, slot));
  if (live.some((r) => r.status === 'confirmed')) return 'booked';
  if (live.length) return 'limited';
  return 'available';
}

@Component({
  selector: 'mh-bloomstone-slots',
  imports: [NgIcon],
  viewProviders: [
    provideIcons({
      phosphorArrowCounterClockwise,
      phosphorBroadcast,
      phosphorCheck,
      phosphorMoon,
      phosphorPlus,
      phosphorSun,
      phosphorSunHorizon,
    }),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="desk">
      <header class="desk-head">
        <img src="/images/bloomstone/bloomstone-mark.webp" width="28" height="33" alt="" />
        <div>
          <h2>Availability</h2>
          <p>October 2026</p>
        </div>
        <button type="button" class="reset" aria-label="Reset the sample bookings" (click)="reset()">
          <ng-icon name="phosphorArrowCounterClockwise" aria-hidden="true" />
        </button>
      </header>

      <ul class="legend" role="list">
        <li><i class="s-available"></i>Available</li>
        <li><i class="s-limited"></i>Limited</li>
        <li><i class="s-booked"></i>Booked</li>
      </ul>

      <div class="cal" role="group" aria-label="Pick a date">
        @for (w of weekdays; track w) {
          <span class="wd" aria-hidden="true">{{ w }}</span>
        }
        @for (d of days(); track d.date) {
          <button
            type="button"
            class="day"
            [class.full]="d.day === 'booked' && d.night === 'booked'"
            [attr.aria-pressed]="d.date === picked()"
            [attr.aria-label]="d.aria"
            (click)="picked.set(d.date)"
          >
            <span class="n">{{ d.date }}</span>
            <span class="dots" aria-hidden="true"><i [class]="'s-' + d.day"></i><i [class]="'s-' + d.night"></i></span>
          </button>
        }
      </div>

      <div class="day-panel">
        <h3>{{ pickedLabel() }}</h3>
        <ul class="slots" role="list">
          @for (s of slotRows(); track s.id) {
            <li>
              <ng-icon [name]="s.icon" aria-hidden="true" />
              <div class="slot-txt">
                <b>{{ s.label }}</b>
                <span>{{ s.meta }}</span>
              </div>
              <span class="pill" [class]="'pill s-' + s.status">{{ s.statusLabel }}</span>
              <button
                type="button"
                class="act"
                [disabled]="s.status === 'booked'"
                [attr.aria-label]="'Request the ' + s.label + ' on ' + pickedLabel()"
                (click)="request(s.id)"
              >
                <ng-icon name="phosphorPlus" aria-hidden="true" />
              </button>
            </li>
          }
        </ul>

        <p class="reqs-label">Requests, staff view</p>
        @if (pickedReqs().length) {
          <ul class="reqs" role="list">
            @for (r of pickedReqs(); track r.id) {
              <li [class]="'r-' + r.status">
                <span class="ref mono">BLM-{{ 140 + r.id }}</span>
                <span class="who">{{ slotName(r.slot) }}, {{ r.guests }} guests</span>
                @if (r.status === 'pending') {
                  <button type="button" class="confirm" (click)="confirm(r.id)">
                    <ng-icon name="phosphorCheck" aria-hidden="true" /> Confirm
                  </button>
                } @else {
                  <span class="st">{{ r.status === 'confirmed' ? 'Confirmed' : 'Auto-cancelled' }}</span>
                }
              </li>
            }
          </ul>
        } @else {
          <p class="empty">No requests yet. Use + to send one.</p>
        }
      </div>

      <footer class="desk-foot">
        <!-- Keyed on pulse(): a fresh element per broadcast, so the ping animation runs again. -->
        @for (p of [pulse()]; track p) {
          <span class="live" [class.on]="p > 0" aria-hidden="true"><ng-icon name="phosphorBroadcast" /></span>
        }
        <p aria-live="polite">{{ note() }}</p>
        <span class="mono sample">Sample data</span>
      </footer>
    </div>
  `,
  styles: `
    :host {
      display: block;
    }
    .desk {
      --ok: #9cbf73;
      --mid: #e0b252;
      --no: #e58a7a;
      padding: 18px;
      border-radius: var(--r-card);
      background: linear-gradient(180deg, var(--b-night-2), var(--b-night));
      color: var(--n-ink);
      box-shadow: var(--shadow-lg);
      border: 1px solid rgb(0 0 0 / 0.2);
    }
    .desk-head {
      display: flex;
      align-items: center;
      gap: 12px;
      padding-bottom: 14px;
      border-bottom: 1px solid var(--b-night-line);

      h2 {
        font-size: 16px;
        color: var(--n-ink);
      }
      p {
        font-size: 12.5px;
        color: var(--n-muted);
      }
      div {
        flex: 1;
      }
    }
    .reset {
      width: 44px;
      height: 44px;
      display: grid;
      place-items: center;
      border-radius: 999px;
      border: 1px solid var(--b-night-line);
      color: var(--n-ink);
      font-size: 17px;
      transition: background var(--t-fast) var(--ease);

      &:hover {
        background: rgb(240 234 220 / 0.08);
      }
    }
    .legend {
      display: flex;
      flex-wrap: wrap;
      gap: 6px 16px;
      margin: 12px 0 10px;
      font-size: 12px;
      color: var(--n-muted);

      li {
        display: inline-flex;
        align-items: center;
        gap: 6px;
      }
      i {
        width: 9px;
        height: 9px;
        border-radius: 2px;
      }
    }
    .s-available {
      background: var(--ok);
    }
    .s-limited {
      background: var(--mid);
    }
    .s-booked {
      background: var(--no);
    }
    .cal {
      display: grid;
      grid-template-columns: repeat(7, minmax(0, 1fr));
      gap: 4px;
    }
    .wd {
      font-family: var(--font-mono);
      font-size: 12px;
      color: var(--n-muted);
      text-align: center;
      padding-bottom: 2px;
    }
    .day {
      display: grid;
      justify-items: center;
      gap: 4px;
      min-height: 44px;
      padding: 7px 0 6px;
      border-radius: 10px;
      border: 1px solid var(--b-night-line);
      background: rgb(240 234 220 / 0.03);
      color: var(--n-ink);
      transition:
        background var(--t-fast) var(--ease),
        border-color var(--t-fast) var(--ease);

      &:hover {
        background: rgb(240 234 220 / 0.08);
      }
      &.full {
        background: rgb(229 138 122 / 0.12);
        border-color: rgb(229 138 122 / 0.35);
      }
      &[aria-pressed='true'] {
        border-color: var(--n-ink);
        box-shadow: inset 0 0 0 1px var(--n-ink);
      }
      .n {
        font-size: 13.5px;
        font-weight: 600;
        line-height: 1;
      }
    }
    .dots {
      display: flex;
      gap: 3px;

      i {
        width: 6px;
        height: 6px;
        border-radius: 50%;
      }
    }
    .day-panel {
      margin-top: 14px;
      padding-top: 14px;
      border-top: 1px solid var(--b-night-line);

      h3 {
        font-size: 14.5px;
        color: var(--n-ink);
        margin-bottom: 8px;
      }
    }
    .slots {
      display: grid;
      gap: 6px;

      li {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 6px 6px 6px 12px;
        border-radius: var(--r-inner);
        background: rgb(240 234 220 / 0.04);
        border: 1px solid var(--b-night-line);

        > ng-icon {
          font-size: 17px;
          color: var(--n-muted);
          flex-shrink: 0;
        }
      }
    }
    .slot-txt {
      flex: 1;
      min-width: 0;

      b {
        display: block;
        font-size: 13px;
        font-weight: 600;
      }
      span {
        font-size: 12px;
        color: var(--n-muted);
      }
    }
    .pill {
      font-size: 12px;
      font-weight: 500;
      padding: 2px 9px;
      border-radius: 999px;
      background: transparent !important;
      border: 1px solid currentColor;

      &.s-available {
        color: var(--ok);
      }
      &.s-limited {
        color: var(--mid);
      }
      &.s-booked {
        color: var(--no);
      }
    }
    .act {
      width: 44px;
      height: 44px;
      flex-shrink: 0;
      display: grid;
      place-items: center;
      border-radius: 999px;
      background: var(--b-olive);
      color: #fff;
      font-size: 16px;
      transition: background var(--t-fast) var(--ease);

      &:hover {
        background: #687236;
      }
      &[disabled] {
        opacity: 0.35;
        cursor: not-allowed;
      }
    }
    .reqs-label {
      margin: 12px 0 6px;
      font-family: var(--font-mono);
      font-size: 12px;
      color: var(--n-muted);
    }
    .reqs {
      display: grid;
      gap: 4px;

      li {
        display: flex;
        align-items: center;
        gap: 10px;
        min-height: 40px;
        font-size: 12.5px;
      }
    }
    .ref {
      font-size: 12px;
      color: var(--n-muted);
    }
    .who {
      flex: 1;
    }
    .r-cancelled .who {
      text-decoration: line-through;
      color: var(--n-muted);
    }
    .st {
      font-size: 12px;
      color: var(--n-muted);
    }
    .r-confirmed .st {
      color: var(--ok);
    }
    .confirm {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      height: 32px;
      padding: 0 12px;
      border-radius: 999px;
      border: 1px solid rgb(156 191 115 / 0.5);
      color: var(--ok);
      font-size: 12.5px;
      font-weight: 500;
      transition: background var(--t-fast) var(--ease);

      &:hover {
        background: rgb(156 191 115 / 0.12);
      }
    }
    .empty {
      font-size: 12.5px;
      color: var(--n-muted);
      min-height: 40px;
    }
    .desk-foot {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-top: 12px;
      padding-top: 12px;
      border-top: 1px solid var(--b-night-line);

      p {
        flex: 1;
        font-size: 12px;
        color: var(--n-muted);
      }
    }
    .live {
      display: grid;
      place-items: center;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      color: var(--n-muted);
      font-size: 14px;

      &.on {
        color: var(--ok);
      }
    }
    @media (prefers-reduced-motion: no-preference) {
      .live.on {
        animation: ping 0.9s var(--ease);
      }
    }
    @keyframes ping {
      40% {
        transform: scale(1.25);
      }
    }
    .sample {
      font-size: 12px;
      color: var(--n-muted);
    }
    @media (max-width: 420px) {
      .desk {
        padding: 14px;
      }
      .slot-txt span {
        display: none;
      }
      .ref {
        display: none;
      }
    }
  `,
})
export class BloomstoneSlotDemo {
  protected readonly weekdays = WEEKDAYS;
  protected readonly reqs = signal<Req[]>(SEED);
  protected readonly picked = signal(16);
  protected readonly note = signal('Pick a date. + sends a guest request, Confirm is the staff side.');
  /** Bumped on every broadcast, so the live icon re-runs its ping. */
  protected readonly pulse = signal(0);
  private nextId = SEED.length + 1;

  protected readonly days = computed(() =>
    DATES.map((date, i) => {
      const on = this.reqs().filter((r) => r.date === date);
      const day = statusOf(on, 'day');
      const night = statusOf(on, 'night');
      return {
        date,
        day,
        night,
        aria: `${DAY_NAMES[i % 7]} ${date} October: Day slot ${LABEL[day].toLowerCase()}, Night slot ${LABEL[night].toLowerCase()}`,
      };
    }),
  );

  protected readonly pickedLabel = computed(() => `${DAY_NAMES[(this.picked() - 12) % 7]}, ${this.picked()} October`);

  protected readonly pickedReqs = computed(() => this.reqs().filter((r) => r.date === this.picked()));

  protected readonly slotRows = computed(() => {
    const on = this.pickedReqs();
    return SLOTS.map((s) => {
      const status = statusOf(on, s.id);
      return { ...s, status, statusLabel: LABEL[status] };
    });
  });

  protected slotName(s: Slot): string {
    return SLOTS.find((x) => x.id === s)!.label;
  }

  /** Guest side: a request never blocks; it only marks the slot as limited. */
  protected request(slot: Slot): void {
    const date = this.picked();
    if (statusOf(this.pickedReqs(), slot) === 'booked') return;
    const guests = 8 + ((this.nextId * 5) % 13);
    this.reqs.update((list) => [...list, { id: this.nextId++, date, slot, guests, status: 'pending' }]);
    this.note.set(`${this.slotName(slot)} requested for ${date} October. It shows as limited until staff confirm.`);
    this.pulse.update((n) => n + 1);
  }

  /** Staff side: confirming closes the slot and cancels every pending request that clashes with it. */
  protected confirm(id: number): void {
    const target = this.reqs().find((r) => r.id === id);
    if (!target || target.status !== 'pending') return;
    let cancelled = 0;
    this.reqs.update((list) =>
      list.map((r) => {
        if (r.id === id) return { ...r, status: 'confirmed' as const };
        if (r.date === target.date && r.status === 'pending' && clashes(r.slot, target.slot)) {
          cancelled++;
          return { ...r, status: 'cancelled' as const };
        }
        return r;
      }),
    );
    this.note.set(
      `Confirmed. ${cancelled ? `${cancelled} clashing ${cancelled === 1 ? 'request' : 'requests'} cancelled. ` : ''}Every open calendar updated.`,
    );
    this.pulse.update((n) => n + 1);
  }

  protected reset(): void {
    this.reqs.set(SEED);
    this.nextId = SEED.length + 1;
    this.picked.set(16);
    this.note.set('Sample bookings reset.');
  }
}
