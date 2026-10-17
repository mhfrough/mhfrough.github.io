import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  phosphorArrowCounterClockwise,
  phosphorArrowRight,
  phosphorCheck,
  phosphorPause,
  phosphorPlay,
} from '@ng-icons/phosphor-icons/regular';

/**
 * Hero mockup of the approval chain (my own redraw, not a screenshot). It follows the real desks' rules: a loan
 * climbs nine desks in the real order; at each desk Approve appears only when the amount fits under that role's
 * limit for the product (set on the role limits screen), otherwise the desk forwards it up; a held loan waits on
 * the desk's Hold tab until it is resumed; and no decision goes without a comment. Sample loans and limits;
 * borrowers are numbered, never named.
 */
interface Desk {
  id: string;
  /** Short label for the rail. */
  ab: string;
  t: string;
  /** Sample approval ceiling in rupees; 0 means this desk forwards only. */
  limit: number;
}

const DESKS: Desk[] = [
  { id: 'lo', ab: 'LO', t: 'Loan officer', limit: 0 },
  { id: 'bm', ab: 'BM', t: 'Branch manager', limit: 0 },
  { id: 'vo', ab: 'VO', t: 'Verification officer', limit: 30_000 },
  { id: 'co', ab: 'CO', t: 'Compliance', limit: 0 },
  { id: 'am', ab: 'AM', t: 'Area manager', limit: 60_000 },
  { id: 'rm', ab: 'RM', t: 'Regional manager', limit: 100_000 },
  { id: 'hopd', ab: 'HOPD', t: 'HOPD', limit: 150_000 },
  { id: 'gm', ab: 'GM', t: 'General manager', limit: 250_000 },
  { id: 'ceo', ab: 'CEO', t: 'CEO', limit: 500_000 },
];

interface Loan {
  id: string;
  no: string;
  kind: string;
  product: string;
  amount: number;
  tenure: string;
}

const LOANS: Loan[] = [
  { id: 's', no: 'L-2316', kind: 'Individual', product: 'Livestock', amount: 25_000, tenure: '12 months' },
  { id: 'm', no: 'L-2317', kind: 'Group of 5', product: 'Agriculture', amount: 90_000, tenure: '12 months' },
  { id: 'l', no: 'L-2318', kind: 'Individual', product: 'Small enterprise', amount: 220_000, tenure: '24 months' },
];

const REMARKS = ['Documents checked', 'Guarantors met', 'Within policy'];

type State = 'desk' | 'held' | 'approved';

interface LogLine {
  who: string;
  what: string;
  note: string;
}

const pkr = new Intl.NumberFormat('en-PK', { maximumFractionDigits: 0 });

@Component({
  selector: 'mh-tmf-chain',
  imports: [NgIcon],
  viewProviders: [
    provideIcons({
      phosphorArrowCounterClockwise,
      phosphorArrowRight,
      phosphorCheck,
      phosphorPause,
      phosphorPlay,
    }),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="chain card card--lift">
      <header class="ch-head">
        <img src="/images/tmf/tmf-mark.webp" width="33" height="32" alt="" />
        <div>
          <h2>Loan <span class="mono">{{ loan().no }}</span></h2>
          <p>{{ loan().kind }}, {{ loan().product }}, {{ loan().tenure }}</p>
        </div>
        <button type="button" class="reset" aria-label="Reset the sample loan" (click)="reset()">
          <ng-icon name="phosphorArrowCounterClockwise" aria-hidden="true" />
        </button>
      </header>

      <div class="pick">
        <span class="mono lbl" id="tm-amt">Requested</span>
        <div class="seg" role="group" aria-labelledby="tm-amt">
          @for (l of loans; track l.id) {
            <button type="button" [attr.aria-pressed]="loan().id === l.id" (click)="pickLoan(l)">Rs {{ fmt(l.amount) }}</button>
          }
        </div>
      </div>

      <ol class="rail" role="list" aria-label="Approval chain">
        @for (d of desks; track d.id; let i = $index) {
          <li
            [class.done]="i < at() || (state() === 'approved' && i === at())"
            [class.now]="i === at() && state() !== 'approved'"
            [attr.aria-current]="i === at() ? 'step' : null"
          >
            <span class="dot" aria-hidden="true"></span>
            <span class="ab mono" aria-hidden="true">{{ d.ab }}</span>
            <span class="sr-only">{{ d.t }}{{ i < at() ? ', passed' : '' }}</span>
          </li>
        }
      </ol>

      @if (state() === 'approved') {
        <div class="done-box">
          <ng-icon name="phosphorCheck" aria-hidden="true" />
          <div>
            <b>Approved by the {{ desk().t.toLowerCase() }}</b>
            <p>Rs {{ fmt(loan().amount) }} goes to the disbursement desk for a cheque, then to finance.</p>
          </div>
        </div>
      } @else {
        <div class="desk" [class.held]="state() === 'held'">
          <div class="desk-top">
            <p class="mono lbl">Desk {{ at() + 1 }} of {{ desks.length }}</p>
            <h3>{{ desk().t }}</h3>
            <p class="limit" [attr.data-k]="limitKind()">{{ limitText() }}</p>
          </div>

          @if (state() === 'held') {
            <p class="hold-note">On this desk’s Hold tab. Resume it to decide.</p>
            <button type="button" class="btn btn-ghost btn-sm" (click)="resume()">
              <ng-icon name="phosphorPlay" aria-hidden="true" /> Resume
            </button>
          } @else {
            <div class="field note-f">
              <label for="tm-note">Comment</label>
              <input
                id="tm-note"
                class="input"
                autocomplete="off"
                maxlength="80"
                [value]="note()"
                (input)="note.set($any($event.target).value)"
                aria-describedby="tm-note-h"
              />
              <span class="chips" id="tm-note-h">
                @for (r of remarks; track r) {
                  <button type="button" class="chip-s" (click)="note.set(r)">{{ r }}</button>
                }
              </span>
            </div>
            <div class="acts">
              @if (canApprove()) {
                <button type="button" class="btn btn-solid btn-sm" [disabled]="!hasNote()" (click)="approve()">
                  <ng-icon name="phosphorCheck" aria-hidden="true" /> Approve
                </button>
              }
              @if (next(); as n) {
                <button type="button" class="btn btn-sm" [class.btn-solid]="!canApprove()" [class.btn-ghost]="canApprove()" [disabled]="!hasNote()" (click)="forward()">
                  Forward to {{ n.ab }} <ng-icon name="phosphorArrowRight" aria-hidden="true" />
                </button>
              }
              <button type="button" class="btn btn-ghost btn-sm" [disabled]="!hasNote()" (click)="hold()">
                <ng-icon name="phosphorPause" aria-hidden="true" /> Hold
              </button>
            </div>
          }
        </div>
      }

      <ol class="log" role="list" aria-label="Comments so far">
        @for (l of log().slice(0, 3); track $index) {
          <li><b class="mono">{{ l.who }}</b> {{ l.what }}<span>“{{ l.note }}”</span></li>
        } @empty {
          <li class="empty">No comments yet. Every decision leaves one.</li>
        }
      </ol>
      <p class="mono sample" aria-live="polite">{{ status() }}</p>
    </div>
  `,
  styles: `
    :host {
      display: block;
    }
    .chain {
      display: grid;
      gap: 14px;
      padding: 18px;
    }
    .ch-head {
      display: flex;
      align-items: center;
      gap: 12px;
      padding-bottom: 12px;
      border-bottom: 1px solid var(--line);

      img {
        flex-shrink: 0;
      }
      div {
        flex: 1;
        min-width: 0;
      }
      h2 {
        font-size: 16px;
      }
      h2 .mono {
        font-size: 14px;
        font-weight: 500;
      }
      p {
        font-size: 12.5px;
        color: var(--muted);
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
    .pick {
      display: flex;
      align-items: center;
      gap: 10px;
      flex-wrap: wrap;

      .seg {
        flex-wrap: wrap;
      }
      .seg button {
        height: 30px;
        padding: 0 11px;
        font-size: 12.5px;
        font-family: var(--font-mono);
      }

      /* Phones: three equal amounts on one full-width row instead of a wrapped pill */
      @media (max-width: 520px) {
        .seg {
          width: 100%;
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
        }
        .seg button {
          height: auto;
          min-height: 32px;
          padding: 2px 4px;
          justify-content: center;
          text-align: center;
          font-size: 12px;
          line-height: 1.2;
        }
      }
    }
    .lbl {
      font-size: 12px;
      color: var(--muted);
    }

    /* Rail: one dot per desk, joined by a line that fills sand as the loan climbs. */
    .rail {
      display: grid;
      grid-template-columns: repeat(9, minmax(0, 1fr));
      padding: 4px 0 0;

      li {
        position: relative;
        display: grid;
        justify-items: center;
        gap: 6px;

        &:not(:last-child)::before {
          content: '';
          position: absolute;
          top: 6px;
          left: 50%;
          width: 100%;
          height: 2px;
          background: var(--line-strong);
        }
        &.done:not(:last-child)::before {
          background: var(--t-sand);
        }
      }
      .dot {
        position: relative;
        width: 14px;
        height: 14px;
        border-radius: 50%;
        background: var(--surface);
        border: 2px solid var(--line-strong);
        transition:
          background var(--t-base) var(--ease),
          border-color var(--t-base) var(--ease);
      }
      .done .dot {
        background: var(--t-sand);
        border-color: var(--t-sand);
      }
      .now .dot {
        border-color: var(--t-sand-text);
        background: var(--surface);
        box-shadow: 0 0 0 4px var(--t-sand-soft);
      }
      .ab {
        font-size: 12px;
        color: var(--muted);
        white-space: nowrap;
      }
      .now .ab {
        color: var(--ink);
        font-weight: 600;
      }
    }
    .desk {
      display: grid;
      gap: 12px;
      padding: 14px;
      border-radius: var(--r-inner);
      background: var(--bg);
      border: 1px solid var(--line);

      &.held {
        background: var(--t-sand-soft);
      }
      h3 {
        font-size: 15px;
        margin-top: 2px;
      }
    }
    .limit {
      margin-top: 4px;
      font-size: 12.5px;
      color: var(--ink-2);

      &[data-k='fits'] {
        color: var(--t-green-text);
      }
      &[data-k='over'] {
        color: var(--t-sand-text);
      }
    }
    .hold-note {
      font-size: 13px;
      color: var(--ink-2);
    }
    .note-f {
      gap: 6px;

      .input {
        height: 44px;
        font-size: 14px;
        background: var(--surface);
      }
    }
    .chips {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
    }
    .chip-s {
      min-height: 28px;
      padding: 0 10px;
      border-radius: 999px;
      border: 1px solid var(--line);
      background: var(--surface);
      font-size: 12px;
      color: var(--ink-2);

      &:hover {
        border-color: var(--line-strong);
      }
    }
    .acts {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;

      .btn {
        min-height: 40px;
      }
      .btn[disabled] {
        opacity: 0.45;
        cursor: not-allowed;
      }
    }
    .done-box {
      display: flex;
      gap: 12px;
      padding: 14px;
      border-radius: var(--r-inner);
      background: var(--t-green-soft);
      color: var(--t-green-text);

      ng-icon {
        font-size: 20px;
        flex-shrink: 0;
        margin-top: 1px;
      }
      b {
        font-size: 14px;
      }
      p {
        font-size: 13px;
        color: var(--ink-2);
        margin-top: 2px;
      }
    }
    .log {
      display: grid;
      gap: 4px;

      li {
        font-size: 12.5px;
        color: var(--ink-2);
        display: flex;
        flex-wrap: wrap;
        gap: 4px 6px;
      }
      b {
        font-size: 12px;
        padding: 1px 7px;
        border-radius: 999px;
        background: var(--surface-2);
        color: var(--ink);
        font-weight: 500;
      }
      span {
        color: var(--muted);
      }
      .empty {
        color: var(--muted);
      }
    }
    .sample {
      font-size: 12px;
      color: var(--muted);
      min-height: 14px;
    }
    @media (max-width: 460px) {
      .chain {
        padding: 14px;
      }
    }
    /* Narrowest phones: nine labels no longer fit, so only the current desk keeps its label */
    @media (max-width: 340px) {
      .rail li:not(.now) .ab {
        visibility: hidden;
      }
    }
  `,
})
export class TmfChainDemo {
  protected readonly desks = DESKS;
  protected readonly loans = LOANS;
  protected readonly remarks = REMARKS;
  protected readonly loan = signal<Loan>(LOANS[1]);
  protected readonly at = signal(1);
  protected readonly state = signal<State>('desk');
  protected readonly note = signal('');
  protected readonly log = signal<LogLine[]>([{ who: 'LO', what: 'forwarded', note: 'Application complete' }]);
  protected readonly status = signal('Sample loan and limits. Comment, then decide.');

  protected readonly desk = computed(() => DESKS[this.at()]);
  protected readonly next = computed<Desk | null>(() => DESKS[this.at() + 1] ?? null);
  protected readonly hasNote = computed(() => this.note().trim().length >= 3);
  protected readonly canApprove = computed(() => {
    const d = this.desk();
    return d.limit > 0 && this.loan().amount <= d.limit;
  });
  protected readonly limitKind = computed(() => (this.desk().limit === 0 ? 'none' : this.canApprove() ? 'fits' : 'over'));
  protected readonly limitText = computed(() => {
    const d = this.desk();
    if (d.limit === 0) return 'This desk checks and forwards; it has no approval limit.';
    return this.canApprove()
      ? `Limit Rs ${this.fmt(d.limit)}: this loan fits, so Approve appears.`
      : `Limit Rs ${this.fmt(d.limit)}: above it, so the loan goes up.`;
  });

  protected fmt(n: number): string {
    return pkr.format(n);
  }

  protected pickLoan(l: Loan): void {
    this.loan.set(l);
    this.restart(`Sample loan of Rs ${this.fmt(l.amount)}. Comment, then decide.`);
  }

  protected approve(): void {
    this.write('approved');
    this.state.set('approved');
    this.status.set(`Approved at desk ${this.at() + 1} of ${DESKS.length}.`);
  }

  protected forward(): void {
    const n = this.next();
    if (!n) return;
    this.write('forwarded');
    this.at.update((i) => i + 1);
    this.status.set(`Forwarded to the ${n.t.toLowerCase()}.`);
  }

  protected hold(): void {
    this.write('held');
    this.state.set('held');
    this.status.set(`Held by the ${this.desk().t.toLowerCase()}.`);
  }

  protected resume(): void {
    this.state.set('desk');
    this.status.set('Resumed. Back on the desk’s queue.');
  }

  protected reset(): void {
    this.loan.set(LOANS[1]);
    this.restart('Sample loan reset.');
  }

  private restart(msg: string): void {
    this.at.set(1);
    this.state.set('desk');
    this.note.set('');
    this.log.set([{ who: 'LO', what: 'forwarded', note: 'Application complete' }]);
    this.status.set(msg);
  }

  private write(what: string): void {
    const line = { who: this.desk().ab, what, note: this.note().trim() };
    this.log.update((l) => [line, ...l]);
    this.note.set('');
  }
}
