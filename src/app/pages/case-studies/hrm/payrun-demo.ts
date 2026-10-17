import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  phosphorArrowCounterClockwise,
  phosphorArrowsClockwise,
  phosphorCalculator,
  phosphorCheck,
  phosphorLock,
  phosphorPaperPlaneTilt,
  phosphorProhibit,
  phosphorSealCheck,
  phosphorWarning,
  phosphorWarningOctagon,
} from '@ng-icons/phosphor-icons/regular';

/**
 * A September pay run, stage by stage, with HRM Suite's own rules (hrm_frontend payroll handlers and engine):
 * six stages; validation raises blockers (missing IBAN, filer without NTN) and warnings (unpaid absences, a loan
 * instalment above the 30% of basic recovery cap); the run can't be calculated until every blocker is resolved
 * or the employee is excluded; the approval chain (HR, Finance, Management, Bank) is signed in order and never by
 * the submitter; publishing sends the payslips; locking makes the period read only.
 * My own rebuild of the flow. Headcount, gross and net are the demo company's September run; people are from its
 * seed; per-person amounts are samples.
 */
type Stage = 'sync' | 'validate' | 'calculate' | 'approve' | 'publish' | 'lock';
type ExState = 'open' | 'resolved' | 'excluded';

interface Ex {
  id: number;
  who: string;
  net: number;
  severity: 'blocker' | 'warning';
  msg: string;
  fix: string;
  state: ExState;
}

const STAGES: { id: Stage; label: string }[] = [
  { id: 'sync', label: 'Sync' },
  { id: 'validate', label: 'Validate' },
  { id: 'calculate', label: 'Calculate' },
  { id: 'approve', label: 'Approve' },
  { id: 'publish', label: 'Publish' },
  { id: 'lock', label: 'Lock' },
];

const ROLES = ['HR', 'Finance', 'Management', 'Bank'];
const HEADCOUNT = 46;
const GROSS = 9_018_900;
const NET = 7_801_348;

const EXCEPTIONS: Ex[] = [
  { id: 1, who: 'Waqas Ahmed', net: 118_420, severity: 'blocker', msg: 'IBAN missing: the bank file can’t be generated.', fix: 'IBAN added', state: 'open' },
  { id: 2, who: 'Fatima Noor', net: 205_161, severity: 'blocker', msg: 'Marked as a filer but no NTN is on record.', fix: 'NTN added', state: 'open' },
  { id: 3, who: 'Junaid Baig', net: 0, severity: 'warning', msg: '2 unpaid absences in this period.', fix: '', state: 'open' },
  { id: 4, who: 'Imran Qadir', net: 0, severity: 'warning', msg: 'Loan instalment exceeds the 30% of basic recovery cap.', fix: '', state: 'open' },
];

const pkr = (n: number) => 'PKR ' + n.toLocaleString('en-US');

@Component({
  selector: 'mh-hrm-payrun',
  imports: [NgIcon],
  viewProviders: [
    provideIcons({
      phosphorArrowCounterClockwise,
      phosphorArrowsClockwise,
      phosphorCalculator,
      phosphorCheck,
      phosphorLock,
      phosphorPaperPlaneTilt,
      phosphorProhibit,
      phosphorSealCheck,
      phosphorWarning,
      phosphorWarningOctagon,
    }),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="run card">
      <header class="run-head">
        <div>
          <h3>September 2026 pay run</h3>
          <p class="mono">Monthly, cut-off 25 Sep, submitted by Sana Tariq (Payroll)</p>
        </div>
        <span class="state" [class]="'state s-' + stage()">{{ stateLabel() }}</span>
        <button type="button" class="reset" aria-label="Start the sample run again" (click)="reset()">
          <ng-icon name="phosphorArrowCounterClockwise" aria-hidden="true" />
        </button>
      </header>

      <ol class="rail" role="list" aria-label="Pay run stages">
        @for (s of stages; track s.id; let i = $index) {
          <li [class.done]="i < index()" [class.now]="i === index()" [attr.aria-current]="i === index() ? 'step' : null">
            <span class="dot mono" aria-hidden="true">
              @if (i < index() || locked()) {
                <ng-icon name="phosphorCheck" />
              } @else {
                {{ i + 1 }}
              }
            </span>
            <span class="lbl">{{ s.label }}</span>
          </li>
        }
      </ol>

      <div class="run-body">
        <div class="stage-panel">
          @switch (stage()) {
            @case ('sync') {
              <h4>Pull this month’s inputs</h4>
              <p>Attendance, unpaid leave, loan instalments, approved claims and variable inputs for every active employee.</p>
              <button type="button" class="btn btn-solid go" (click)="sync()">
                <ng-icon name="phosphorArrowsClockwise" aria-hidden="true" /> Sync inputs
              </button>
            }
            @case ('validate') {
              <h4>Exceptions</h4>
              <ul class="exs" role="list">
                @for (x of exs(); track x.id) {
                  <li [class]="'ex ' + x.severity + ' ' + x.state">
                    <ng-icon [name]="x.severity === 'blocker' ? 'phosphorWarningOctagon' : 'phosphorWarning'" aria-hidden="true" />
                    <span class="ex-txt">
                      <b>{{ x.who }}</b>
                      <small>
                        <span class="sev">{{ x.severity === 'blocker' ? 'Blocker' : 'Warning' }}:</span>
                        @if (x.state === 'resolved') { {{ x.fix }}, resolved. }
                        @else if (x.state === 'excluded') { excluded from this run. }
                        @else { {{ x.msg }} }
                      </small>
                    </span>
                    @if (x.severity === 'blocker' && x.state === 'open') {
                      <span class="ex-acts">
                        <button type="button" class="mini" (click)="setEx(x.id, 'resolved')" [attr.aria-label]="'Resolve: ' + x.who">Resolve</button>
                        <button type="button" class="mini ghost" (click)="setEx(x.id, 'excluded')" [attr.aria-label]="'Exclude ' + x.who + ' from the run'">
                          Exclude
                        </button>
                      </span>
                    }
                  </li>
                }
              </ul>
              <div class="gate">
                <button type="button" class="btn btn-solid go" [disabled]="blockers() > 0" (click)="validated()">
                  <ng-icon name="phosphorSealCheck" aria-hidden="true" /> Sign off validation
                </button>
                @if (blockers() > 0) {
                  <p class="why">Resolve or exclude {{ blockers() }} blocking {{ blockers() === 1 ? 'exception' : 'exceptions' }} before continuing.</p>
                } @else {
                  <p class="why ok">Warnings stay on the run for the approvers to see.</p>
                }
              </div>
            }
            @case ('calculate') {
              <h4>Calculate</h4>
              <p>Proration for joiners and leavers, unpaid absence, loan recovery, salary tax on annualised pay by slab, filer or non-filer rates, employer contributions.</p>
              <button type="button" class="btn btn-solid go" (click)="calculate()">
                <ng-icon name="phosphorCalculator" aria-hidden="true" /> Run payroll
              </button>
            }
            @case ('approve') {
              <h4>Approval chain</h4>
              <ul class="chain" role="list">
                @for (r of roles; track r; let i = $index) {
                  <li [class.signed]="i < signed()" [class.next]="i === signed()">
                    <span class="mono">{{ i + 1 }}</span>
                    <b>{{ r }}</b>
                    @if (i < signed()) {
                      <span class="ok-tag">Signed</span>
                    } @else if (i === signed()) {
                      <button type="button" class="mini" (click)="sign()">Sign as {{ r }}</button>
                    } @else {
                      <span class="wait">Waiting</span>
                    }
                  </li>
                }
              </ul>
              <p class="why">Sana Tariq submitted the run, so she can’t sign any step of it.</p>
            }
            @case ('publish') {
              <h4>Publish payslips</h4>
              <p>Every employee in the run gets a payslip in self service and in the phone inbox, with a push notification.</p>
              <button type="button" class="btn btn-solid go" (click)="publish()">
                <ng-icon name="phosphorPaperPlaneTilt" aria-hidden="true" /> Publish {{ headcount() }} payslips
              </button>
            }
            @case ('lock') {
              @if (locked()) {
                <h4>Period locked</h4>
                <p>September is read only now. Corrections go into an off-cycle run or next month’s inputs, never into a published payslip.</p>
              } @else {
                <h4>Lock the period</h4>
                <p>Locking freezes the run, its lines and its payslips.</p>
                <button type="button" class="btn btn-solid go" (click)="lock()">
                  <ng-icon name="phosphorLock" aria-hidden="true" /> Lock September
                </button>
              }
            }
          }
        </div>

        <aside class="side" aria-label="Run summary">
          <dl class="sum">
            <div><dt>Employees</dt><dd>{{ headcount() }}</dd></div>
            <div><dt>Gross</dt><dd>{{ calculated() ? fmt(gross()) : 'Not run' }}</dd></div>
            <div><dt>Net pay</dt><dd>{{ calculated() ? fmt(net()) : 'Not run' }}</dd></div>
            <div><dt>Open blockers</dt><dd [class.bad]="blockers() > 0">{{ blockers() }}</dd></div>
          </dl>
          <p class="log-title mono">Activity</p>
          <ol class="log" role="list" aria-live="polite">
            @for (e of log(); track e.n) {
              <li>{{ e.t }}</li>
            }
          </ol>
        </aside>
      </div>
      <p class="sample mono">Sample run: headcount and totals from the demo company, people from its seed.</p>
    </div>
  `,
  styles: `
    :host {
      display: block;
    }

    .run {
      padding: 0;
      overflow: hidden;
    }

    .run-head {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 18px 20px;
      border-bottom: 1px solid var(--line);

      > div {
        flex: 1;
        min-width: 0;
      }

      h3 {
        font-size: 16px;
      }

      p {
        font-size: 12px;
        color: var(--muted);
      }
    }

    .state {
      flex-shrink: 0;
      padding: 4px 10px;
      border-radius: 999px;
      font-size: 12px;
      font-weight: 600;
      background: var(--h-amber-soft);
      color: var(--h-amber-text);

      &.s-approve {
        background: var(--h-blue-soft);
        color: var(--h-blue-text);
      }

      &.s-publish,
      &.s-lock {
        background: var(--h-green-soft);
        color: var(--h-green-text);
      }
    }

    .reset {
      width: 36px;
      height: 36px;
      flex-shrink: 0;
      display: grid;
      place-items: center;
      border-radius: 50%;
      border: 1px solid var(--line);
      color: var(--ink-2);
      font-size: 16px;

      &:hover {
        color: var(--ink);
        border-color: var(--line-strong);
      }
    }

    // Stage rail
    .rail {
      display: grid;
      grid-template-columns: repeat(6, minmax(0, 1fr));
      padding: 16px 20px;
      border-bottom: 1px solid var(--line);
      background: var(--bg-2);

      li {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 13px;
        font-weight: 600;
        color: var(--muted);

        &:not(:last-child)::after {
          content: '';
          flex: 1;
          min-width: 8px;
          height: 2px;
          margin-right: 8px;
          border-radius: 2px;
          background: var(--line-strong);
        }

        &.done::after {
          background: var(--h-blue);
        }

        &.done,
        &.now {
          color: var(--ink);
        }
      }

      .dot {
        width: 26px;
        height: 26px;
        flex-shrink: 0;
        display: grid;
        place-items: center;
        border-radius: 50%;
        border: 1px solid var(--line-strong);
        font-size: 12px;
      }

      .done .dot {
        background: var(--h-blue);
        border-color: var(--h-blue);
        color: #fff;
      }

      .now .dot {
        border-color: var(--h-blue-text);
        color: var(--h-blue-text);
        box-shadow: 0 0 0 4px var(--h-blue-soft);
      }
    }

    // Body
    .run-body {
      display: grid;
      grid-template-columns: minmax(0, 1fr) 280px;
    }

    .stage-panel {
      padding: 20px;
      min-height: 300px;

      h4 {
        font-size: 15px;
        margin-bottom: 6px;
      }

      > p {
        font-size: 14px;
        color: var(--ink-2);
        max-width: 52ch;
      }
    }

    .go {
      margin-top: 16px;
      gap: 8px;

      &:disabled {
        opacity: 0.45;
        cursor: not-allowed;
      }
    }

    .exs {
      display: grid;
      gap: 8px;
      margin-top: 8px;
    }

    .ex {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 12px;
      border-radius: var(--r-inner);
      border: 1px solid var(--line);
      background: var(--bg-2);

      > ng-icon {
        font-size: 18px;
        flex-shrink: 0;
      }

      &.blocker > ng-icon {
        color: var(--h-red-text);
      }

      &.warning > ng-icon {
        color: var(--h-amber-text);
      }

      &.blocker.open {
        border-color: rgb(240 122 122 / 0.35);
        background: var(--h-red-soft);
      }

      &.resolved > ng-icon,
      &.excluded > ng-icon {
        color: var(--muted);
      }

      &.resolved b,
      &.excluded b {
        color: var(--ink-2);
      }
    }

    .ex-txt {
      flex: 1;
      min-width: 0;

      b {
        display: block;
        font-size: 13.5px;
      }

      small {
        font-size: 12.5px;
        color: var(--ink-2);
      }

      .sev {
        font-weight: 600;
      }
    }

    .ex-acts {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      flex-shrink: 0;
    }

    .mini {
      height: 32px;
      padding: 0 12px;
      border-radius: 999px;
      font-size: 12.5px;
      font-weight: 600;
      background: var(--cta);
      color: var(--cta-ink);

      &:hover {
        background: var(--h-blue-dark);
      }

      &.ghost {
        background: transparent;
        border: 1px solid var(--line-strong);
        color: var(--ink);

        &:hover {
          border-color: var(--ink-2);
        }
      }
    }

    .gate {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 0 14px;

      .why {
        margin-top: 16px;
      }
    }

    .why {
      font-size: 13px;
      color: var(--h-red-text);

      &.ok {
        color: var(--muted);
      }
    }

    .chain {
      display: grid;
      gap: 8px;
      margin: 10px 0 12px;

      li {
        display: flex;
        align-items: center;
        gap: 12px;
        min-height: 48px;
        padding: 6px 8px 6px 14px;
        border-radius: var(--r-inner);
        border: 1px solid var(--line);

        &.next {
          border-color: var(--h-blue-text);
        }

        &.signed {
          background: var(--h-green-soft);
          border-color: transparent;
        }
      }

      .mono {
        font-size: 12px;
        color: var(--muted);
      }

      b {
        flex: 1;
        font-size: 14px;
      }

      .ok-tag {
        font-size: 12.5px;
        font-weight: 600;
        color: var(--h-green-text);
        padding-right: 6px;
      }

      .wait {
        font-size: 12.5px;
        color: var(--muted);
        padding-right: 6px;
      }
    }

    .chain + .why {
      color: var(--muted);
    }

    // Summary
    .side {
      padding: 20px;
      border-left: 1px solid var(--line);
      background: var(--bg-2);
    }

    .sum {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      margin: 0 0 18px;

      dt {
        font-size: 12px;
        color: var(--muted);
      }

      dd {
        margin: 2px 0 0;
        font-size: 15px;
        font-weight: 600;
        letter-spacing: -0.01em;
        font-variant-numeric: tabular-nums;

        &.bad {
          color: var(--h-red-text);
        }
      }
    }

    .log-title {
      font-size: 12px;
      color: var(--muted);
      margin-bottom: 8px;
    }

    .log {
      display: grid;
      gap: 8px;

      li {
        position: relative;
        padding-left: 16px;
        font-size: 13px;
        color: var(--ink-2);

        &::before {
          content: '';
          position: absolute;
          left: 2px;
          top: 7px;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--h-blue-text);
        }

        &:not(:first-child)::before {
          background: var(--line-strong);
        }
      }
    }

    .sample {
      padding: 10px 20px;
      border-top: 1px solid var(--line);
      font-size: 12px;
      color: var(--muted);
    }

    @media (max-width: 860px) {
      .run-body {
        grid-template-columns: 1fr;
      }

      .stage-panel {
        min-height: 0;
      }

      .side {
        border-left: 0;
        border-top: 1px solid var(--line);
      }

      .rail {
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 12px 8px;

        li::after {
          display: none;
        }
      }
    }

    @media (max-width: 480px) {
      .ex {
        flex-wrap: wrap;
      }

      .ex-acts {
        width: 100%;
        padding-left: 28px;
      }
    }
  `,
})
export class HrmPayrunDemo {
  protected readonly stages = STAGES;
  protected readonly roles = ROLES;

  private readonly at = signal(0);
  protected readonly exs = signal<Ex[]>(EXCEPTIONS.map((x) => ({ ...x })));
  protected readonly signed = signal(0);
  protected readonly calculated = signal(false);
  protected readonly locked = signal(false);
  private n = 0;
  protected readonly log = signal<{ n: number; t: string }[]>([{ n: 0, t: 'Run created for 46 active employees.' }]);

  protected readonly index = computed(() => this.at());
  protected readonly stage = computed(() => STAGES[this.at()].id);
  protected readonly blockers = computed(() => this.exs().filter((x) => x.severity === 'blocker' && x.state === 'open').length);
  private readonly excluded = computed(() => this.exs().filter((x) => x.state === 'excluded'));
  protected readonly headcount = computed(() => HEADCOUNT - this.excluded().length);
  protected readonly net = computed(() => NET - this.excluded().reduce((s, x) => s + x.net, 0));
  // Gross scales with the excluded people's share of net (sample figures).
  protected readonly gross = computed(() => Math.round((GROSS * this.net()) / NET));
  protected readonly stateLabel = computed(() => {
    if (this.locked()) return 'Locked';
    return { sync: 'Draft', validate: 'Validating', calculate: 'Validated', approve: 'Pending approval', publish: 'Approved', lock: 'Published' }[
      this.stage()
    ];
  });

  protected fmt = pkr;

  private push(t: string): void {
    this.log.update((l) => [{ n: ++this.n, t }, ...l].slice(0, 5));
  }

  protected sync(): void {
    this.at.set(1);
    const b = EXCEPTIONS.filter((x) => x.severity === 'blocker').length;
    this.push(`Inputs synced and validated: ${HEADCOUNT} employees, ${EXCEPTIONS.length} exceptions, ${b} blockers.`);
  }

  protected setEx(id: number, state: ExState): void {
    const x = this.exs().find((e) => e.id === id);
    if (!x) return;
    this.exs.update((list) => list.map((e) => (e.id === id ? { ...e, state } : e)));
    this.push(state === 'resolved' ? `${x.who}: ${x.fix}.` : `${x.who} excluded from this run.`);
  }

  protected validated(): void {
    if (this.blockers() > 0) return;
    this.at.set(2);
    this.push('Validation signed off.');
  }

  protected calculate(): void {
    this.calculated.set(true);
    this.at.set(3);
    this.push(`Payroll calculated: ${this.headcount()} employees, net ${pkr(this.net())}.`);
  }

  protected sign(): void {
    const i = this.signed();
    if (i >= ROLES.length) return;
    this.signed.set(i + 1);
    this.push(`${ROLES[i]} signed the run.`);
    if (i + 1 === ROLES.length) {
      this.at.set(4);
      this.push('Approval chain complete.');
    }
  }

  protected publish(): void {
    this.at.set(5);
    this.push(`${this.headcount()} payslips published.`);
  }

  protected lock(): void {
    this.locked.set(true);
    this.push('Period locked.');
  }

  protected reset(): void {
    this.at.set(0);
    this.exs.set(EXCEPTIONS.map((x) => ({ ...x })));
    this.signed.set(0);
    this.calculated.set(false);
    this.locked.set(false);
    this.n = 0;
    this.log.set([{ n: 0, t: 'Run created for 46 active employees.' }]);
  }
}
