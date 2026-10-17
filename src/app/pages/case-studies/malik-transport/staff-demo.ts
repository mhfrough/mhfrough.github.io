import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { phosphorCheck, phosphorFilePdf, phosphorQrCode, phosphorUploadSimple, phosphorX } from '@ng-icons/phosphor-icons/regular';

/**
 * The staff side, redrawn from a driver's seat (my own mockup). Shifts are logged two ways, as in the portal: on
 * the road a driver starts and ends a shift with the time and where they are; at the depot staff punch in with
 * the QR code. Leave is asked for with dates and a reason against a yearly allowance, and the office approves or
 * rejects it with a reason. Payslips arrive as PDFs the office shares each month. The office buttons sit inline
 * so the whole loop fits in one card. Sample data; nobody is named.
 */
type Tab = 'shifts' | 'leave' | 'slips';
type Mode = 'road' | 'depot';

interface Shift {
  id: number;
  day: string;
  time: string;
  kind: 'Start' | 'End';
  where: string;
}

interface Leave {
  id: number;
  from: string;
  to: string;
  days: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
}

interface Slip {
  month: string;
  shared: string;
}

const ALLOWANCE = 20;

const SHIFTS: Shift[] = [
  { id: 2, day: 'Fri 18 Aug', time: '16:41', kind: 'End', where: 'Koblenz, Hauptbahnhof' },
  { id: 1, day: 'Fri 18 Aug', time: '07:02', kind: 'Start', where: 'Depot QR' },
];

const LEAVES: Leave[] = [{ id: 1, from: '2023-07-03', to: '2023-07-07', days: 5, reason: 'Family visit', status: 'approved' }];

const SLIPS: Slip[] = [
  { month: 'July 2023', shared: 'Shared 1 Aug' },
  { month: 'June 2023', shared: 'Shared 3 Jul' },
];

// Sample clock for new log lines (Mon 21 Aug).
const TIMES = ['06:58', '15:47', '17:05', '18:20', '19:02', '20:15'];

const fmt = (iso: string) =>
  new Date(iso + 'T12:00:00Z').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' });

@Component({
  selector: 'mh-mt-staff',
  imports: [NgIcon],
  viewProviders: [provideIcons({ phosphorCheck, phosphorFilePdf, phosphorQrCode, phosphorUploadSimple, phosphorX })],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./mini-btn.scss'],
  template: `
    <div class="staff card">
      <div class="s-top">
        <p class="who"><b>Driver 2</b><span class="mono">signed in</span></p>
        <div class="seg" role="group" aria-label="Section">
          <button type="button" [attr.aria-pressed]="tab() === 'shifts'" (click)="tab.set('shifts')">Shifts</button>
          <button type="button" [attr.aria-pressed]="tab() === 'leave'" (click)="tab.set('leave')">Leave</button>
          <button type="button" [attr.aria-pressed]="tab() === 'slips'" (click)="tab.set('slips')">Payslips</button>
        </div>
      </div>

      @switch (tab()) {
        @case ('shifts') {
          <div class="pane">
            <div class="modes" role="group" aria-label="Where the shift starts">
              <button type="button" class="mode" [attr.aria-pressed]="mode() === 'road'" (click)="mode.set('road')">
                <b>On the road</b><span>Time and location</span>
              </button>
              <button type="button" class="mode" [attr.aria-pressed]="mode() === 'depot'" (click)="mode.set('depot')">
                <b>At the depot</b><span>Scan the QR code</span>
              </button>
            </div>

            @if (mode() === 'road') {
              <div class="road">
                <div class="field">
                  <label for="mt-loc">Location</label>
                  <input id="mt-loc" class="input" maxlength="60" [value]="loc()" (input)="loc.set($any($event.target).value)" />
                </div>
                <button type="button" class="mini-btn is-primary" [disabled]="loc().trim().length < 3" (click)="log(loc().trim())">
                  {{ onShift() ? 'End shift' : 'Start shift' }}
                </button>
              </div>
            } @else {
              <div class="depot">
                <span class="qr" aria-hidden="true"><ng-icon name="phosphorQrCode" /></span>
                <p>The depot shows a QR code. Scanning it marks the shift without typing.</p>
                <button type="button" class="mini-btn is-primary" (click)="log('Depot QR')">Scan to punch {{ onShift() ? 'out' : 'in' }}</button>
              </div>
            }

            <ul class="log" role="list" aria-label="Shift log">
              @for (s of shifts(); track s.id) {
                <li>
                  <span class="mono t">{{ s.day }}, {{ s.time }}</span>
                  <span class="kind" [attr.data-k]="s.kind">{{ s.kind }}</span>
                  <span class="where">{{ s.where }}</span>
                </li>
              }
            </ul>
          </div>
        }
        @case ('leave') {
          <div class="pane">
            <div class="quota">
              <p><b>{{ left() }}</b> of {{ allowance }} days left this year</p>
              <span class="bar" aria-hidden="true"><i [style.width.%]="(taken() / allowance) * 100"></i></span>
            </div>

            <div class="lv-form">
              <div class="field">
                <label for="mt-from">From</label>
                <input id="mt-from" type="date" class="input" min="2023-08-21" max="2023-12-31" [value]="from()" (input)="setFrom($any($event.target).value)" />
              </div>
              <div class="field">
                <label for="mt-to">To</label>
                <input id="mt-to" type="date" class="input" [min]="from()" max="2023-12-31" [value]="to()" (input)="to.set($any($event.target).value)" />
              </div>
              <div class="field wide">
                <label for="mt-why">Reason</label>
                <input id="mt-why" class="input" maxlength="60" [value]="why()" (input)="why.set($any($event.target).value)" [attr.aria-describedby]="'mt-days'" />
              </div>
              <div class="lv-foot wide">
                <span class="mono" id="mt-days">{{ days() > 0 ? days() + (days() === 1 ? ' day' : ' days') : 'Pick the dates' }}{{ days() > left() ? ', more than is left' : '' }}{{ overlaps() ? ', already asked for' : '' }}</span>
                <button type="button" class="mini-btn is-primary" [disabled]="!canAsk()" (click)="ask()">Ask for leave</button>
              </div>
            </div>

            <ul class="lv" role="list" aria-label="Leave requests">
              @for (l of leaves(); track l.id) {
                <li [attr.data-s]="l.status">
                  <div>
                    <b>{{ fmt(l.from) }} to {{ fmt(l.to) }}</b>
                    <span>{{ l.days }} {{ l.days === 1 ? 'day' : 'days' }}, {{ l.reason }}</span>
                  </div>
                  @if (l.status === 'pending') {
                    <span class="office">
                      <span class="mono">Office</span>
                      <button type="button" class="mini-btn is-primary" (click)="decide(l.id, 'approved')"><ng-icon name="phosphorCheck" aria-hidden="true" /> Approve</button>
                      <button type="button" class="mini-btn is-danger" (click)="decide(l.id, 'rejected')"><ng-icon name="phosphorX" aria-hidden="true" /> Reject</button>
                    </span>
                  } @else {
                    <span class="st">{{ l.status === 'approved' ? 'Approved' : 'Rejected' }}</span>
                  }
                </li>
              }
            </ul>
          </div>
        }
        @case ('slips') {
          <div class="pane">
            <ul class="slips" role="list" aria-label="Payslips">
              @for (s of slips(); track s.month) {
                <li>
                  <span class="pdf"><ng-icon name="phosphorFilePdf" aria-hidden="true" /></span>
                  <div>
                    <b>{{ s.month }}</b>
                    <span class="mono">{{ s.shared }}, PDF</span>
                  </div>
                </li>
              }
            </ul>
            <div class="office-row">
              <span class="mono">Office</span>
              <button type="button" class="mini-btn" [disabled]="slips().length > 2" (click)="share()">
                <ng-icon name="phosphorUploadSimple" aria-hidden="true" /> Share August 2023
              </button>
            </div>
          </div>
        }
      }

      <p class="mono sample" aria-live="polite">{{ note() }}</p>
    </div>
  `,
  styles: `
    :host {
      display: block;
    }
    .staff {
      display: grid;
      gap: 14px;
      padding: 18px;
    }
    .s-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 10px;
      padding-bottom: 12px;
      border-bottom: 1px solid var(--line);

      .seg button {
        height: 32px;
        padding: 0 12px;
        font-size: 13px;
      }
    }
    .who {
      display: flex;
      align-items: baseline;
      gap: 6px;
      font-size: 14px;

      .mono {
        font-size: 12px;
        color: var(--muted);
      }
    }
    .pane {
      display: grid;
      gap: 12px;
      min-height: 290px;
      align-content: start;
    }
    .modes {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
    }
    .mode {
      display: grid;
      gap: 2px;
      padding: 10px 12px;
      border-radius: var(--r-inner);
      border: 1px solid var(--line);
      text-align: left;

      b {
        font-size: 13.5px;
        font-weight: 600;
        color: var(--ink);
      }
      span {
        font-size: 12px;
        color: var(--muted);
      }
      &:hover {
        border-color: var(--line-strong);
      }
      &[aria-pressed='true'] {
        border-color: var(--mt-blue);
        background: var(--mt-blue-soft);

        span {
          color: var(--mt-blue-text);
        }
      }
      &:focus-visible {
        outline: 2px solid var(--focus);
        outline-offset: 2px;
      }
    }
    .field {
      label {
        font-size: 12.5px;
      }
      .input {
        height: 44px;
        font-size: 14px;
      }
    }
    .road {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      gap: 10px;
      align-items: end;

      .mini-btn {
        margin-bottom: 7px;
      }

      /* Small phones: the place gets the full width, the button sits under it */
      @media (max-width: 360px) {
        grid-template-columns: minmax(0, 1fr);
        justify-items: start;

        .mini-btn {
          margin-bottom: 0;
        }
      }
    }
    .depot {
      display: grid;
      grid-template-columns: auto minmax(0, 1fr) auto;
      gap: 12px;
      align-items: center;
      padding: 10px 12px;
      border-radius: var(--r-inner);
      background: var(--bg);
      border: 1px solid var(--line);

      p {
        font-size: 13px;
        color: var(--ink-2);
      }
    }
    .qr {
      width: 48px;
      height: 48px;
      display: grid;
      place-items: center;
      border-radius: 10px;
      background: var(--surface);
      border: 1px solid var(--line);
      font-size: 30px;
      color: var(--ink);
    }
    .log {
      display: grid;
      gap: 4px;

      li {
        display: grid;
        grid-template-columns: 128px 52px minmax(0, 1fr);
        gap: 10px;
        align-items: center;
        padding: 8px 10px;
        border-radius: 10px;
        background: var(--bg);
        font-size: 12.5px;
      }
      .t {
        font-size: 12px;
        color: var(--ink-2);
      }
      .kind {
        justify-self: start;
        padding: 1px 8px;
        border-radius: 999px;
        font-size: 12px;
        font-weight: 500;
        background: var(--mt-green-soft);
        color: var(--mt-green-text);

        &[data-k='End'] {
          background: var(--surface-2);
          color: var(--ink-2);
        }
      }
      .where {
        color: var(--ink);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }
    .quota {
      display: grid;
      gap: 6px;

      p {
        font-size: 13px;
        color: var(--ink-2);
      }
      b {
        color: var(--mt-blue-text);
        font-size: 15px;
      }
    }
    .bar {
      display: block;
      height: 8px;
      border-radius: 999px;
      background: var(--surface-2);
      overflow: hidden;

      i {
        display: block;
        height: 100%;
        border-radius: 999px;
        background: var(--mt-blue);
        transition: width var(--t-base) var(--ease);
      }
    }
    .lv-form {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;

      .wide {
        grid-column: 1 / -1;
      }
    }
    .lv-foot {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;

      .mono {
        font-size: 12px;
        color: var(--ink-2);
      }
    }
    .lv,
    .slips {
      display: grid;
      gap: 6px;

      li {
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: 8px 12px;
        padding: 10px 12px;
        border-radius: var(--r-inner);
        border: 1px solid var(--line);
      }
      b {
        display: block;
        font-size: 13px;
        font-weight: 600;
      }
      span {
        font-size: 12px;
        color: var(--muted);
      }
    }
    .office {
      display: inline-flex;
      align-items: center;
      gap: 6px;

      .mono {
        font-size: 12px;
        color: var(--muted);
      }
    }
    .lv .st {
      padding: 2px 9px;
      border-radius: 999px;
      font-size: 12px;
      font-weight: 500;
      background: var(--mt-green-soft);
      color: var(--mt-green-text);
    }
    .lv [data-s='rejected'] .st {
      background: var(--mt-red-soft);
      color: var(--mt-red-text);
    }
    .slips li {
      justify-content: flex-start;
    }
    .pdf {
      width: 36px;
      height: 36px;
      display: grid;
      place-items: center;
      border-radius: 10px;
      background: var(--mt-red-soft);
      color: var(--mt-red-text);
      font-size: 18px;
    }
    .slips .pdf {
      color: var(--mt-red-text);
    }
    .office-row {
      display: flex;
      align-items: center;
      gap: 10px;

      .mono {
        font-size: 12px;
        color: var(--muted);
      }
    }
    .sample {
      font-size: 12px;
      color: var(--muted);
      min-height: 14px;
    }
    @media (max-width: 520px) {
      .staff {
        padding: 14px;
      }
      .depot {
        grid-template-columns: auto minmax(0, 1fr);

        .mini-btn {
          grid-column: 1 / -1;
          justify-self: start;
        }
      }
      .log li {
        grid-template-columns: 1fr auto;

        .where {
          grid-column: 1 / -1;
        }
      }
    }
  `,
})
export class MalikTransportStaffDemo {
  protected readonly allowance = ALLOWANCE;
  protected readonly fmt = fmt;

  protected readonly tab = signal<Tab>('shifts');
  protected readonly mode = signal<Mode>('road');
  protected readonly loc = signal('Wiesbaden, Hauptbahnhof');
  protected readonly shifts = signal<Shift[]>(SHIFTS);
  protected readonly leaves = signal<Leave[]>(LEAVES);
  protected readonly slips = signal<Slip[]>(SLIPS);
  protected readonly from = signal('2023-09-11');
  protected readonly to = signal('2023-09-13');
  protected readonly why = signal('Moving house');
  protected readonly note = signal('Sample shifts, leave and payslips for one driver.');
  private nextId = 10;
  private tick = 0;

  protected readonly onShift = computed(() => this.shifts()[0]?.kind === 'Start');
  protected readonly taken = computed(() => this.leaves().filter((l) => l.status === 'approved').reduce((n, l) => n + l.days, 0));
  protected readonly left = computed(() => ALLOWANCE - this.taken());
  protected readonly days = computed(() => {
    const a = Date.parse(this.from());
    const b = Date.parse(this.to());
    if (Number.isNaN(a) || Number.isNaN(b) || b < a) return 0;
    return Math.round((b - a) / 86_400_000) + 1;
  });
  protected readonly overlaps = computed(() =>
    this.leaves().some((l) => l.status !== 'rejected' && l.from <= this.to() && l.to >= this.from()),
  );
  protected readonly canAsk = computed(
    () => this.days() > 0 &&
      this.days() <= this.left() &&
      this.why().trim().length >= 3 &&
      !this.leaves().some((l) => l.status === 'pending') &&
      !this.overlaps(),
  );

  protected log(where: string): void {
    const kind: Shift['kind'] = this.onShift() ? 'End' : 'Start';
    const time = TIMES[this.tick++ % TIMES.length];
    this.shifts.update((s) => [{ id: this.nextId++, day: 'Mon 21 Aug', time, kind, where }, ...s].slice(0, 5));
    this.note.set(`Shift ${kind === 'Start' ? 'started' : 'ended'} at ${time}, ${where}. The office sees it under attendance.`);
  }

  protected setFrom(v: string): void {
    this.from.set(v);
    if (this.to() < v) this.to.set(v);
  }

  protected ask(): void {
    this.leaves.update((l) => [
      { id: this.nextId++, from: this.from(), to: this.to(), days: this.days(), reason: this.why().trim(), status: 'pending' as const },
      ...l,
    ]);
    this.note.set('Leave requested. It waits for the office.');
  }

  protected decide(id: number, status: 'approved' | 'rejected'): void {
    this.leaves.update((l) => l.map((x) => (x.id === id ? { ...x, status } : x)));
    this.note.set(status === 'approved' ? 'Approved: the days come off the allowance.' : 'Rejected: the allowance is untouched.');
  }

  protected share(): void {
    this.slips.update((s) => [{ month: 'August 2023', shared: 'Shared just now' }, ...s]);
    this.note.set('The office shared the August payslip. The driver sees it here.');
  }
}
