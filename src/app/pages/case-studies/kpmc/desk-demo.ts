import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { phosphorArrowCounterClockwise, phosphorCheck, phosphorMapPin } from '@ng-icons/phosphor-icons/regular';

/**
 * Hero mockup of the KPMC complaint desk (my own redraw, not a screenshot). The role switch follows the real
 * permission rules: agents see the complaint list only; supervisors and admins also get assigning, closing and
 * the rest of the menu; only the admin supervisor sees login settings. Closing needs a remark (up to 256
 * characters) and attaches the confirmation photo, as the real close form does. Sample complaints; agents are
 * numbered, never named.
 */
type Role = 'admin_supervisor' | 'supervisor' | 'agent';
type Status = 'unassigned' | 'assigned' | 'closed';

interface Complaint {
  no: number;
  cat: string;
  ward: string;
  status: Status;
  agent?: string;
}

const MENU: { t: string; roles: Role[] }[] = [
  { t: 'Complaints', roles: ['admin_supervisor', 'supervisor', 'agent'] },
  { t: 'Assign', roles: ['admin_supervisor', 'supervisor'] },
  { t: 'Reports', roles: ['admin_supervisor', 'supervisor'] },
  { t: 'Notifications', roles: ['admin_supervisor', 'supervisor'] },
  { t: 'News and tenders', roles: ['admin_supervisor', 'supervisor'] },
  { t: 'Accounts', roles: ['admin_supervisor', 'supervisor'] },
  { t: 'Login settings', roles: ['admin_supervisor'] },
];

const AGENTS = ['Field agent 1', 'Field agent 2', 'Field agent 3'];

const SEED: Complaint[] = [
  { no: 2041, cat: 'Sanitation, blocked drain', ward: 'Ward 7', status: 'unassigned' },
  { no: 2040, cat: 'Drinking water, pipe leak', ward: 'Ward 3', status: 'unassigned' },
  { no: 2039, cat: 'Anti encroachment, footpath', ward: 'Ward 12', status: 'assigned', agent: AGENTS[1] },
  { no: 2038, cat: 'Infrastructure, street light', ward: 'Ward 7', status: 'closed', agent: AGENTS[0] },
];

const LABEL: Record<Status, string> = { unassigned: 'Unassigned', assigned: 'Assigned', closed: 'Closed' };

@Component({
  selector: 'mh-kpmc-desk',
  imports: [NgIcon],
  viewProviders: [provideIcons({ phosphorArrowCounterClockwise, phosphorCheck, phosphorMapPin })],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="desk card card--lift">
      <header class="desk-head">
        <img src="/images/kpmc/kpmc-logo.webp" width="30" height="32" alt="" />
        <div>
          <h2>Complaints</h2>
          <p><b class="mono">{{ open() }}</b> open, <b class="mono">{{ closed() }}</b> closed</p>
        </div>
        <button type="button" class="reset" aria-label="Reset the sample complaints" (click)="reset()">
          <ng-icon name="phosphorArrowCounterClockwise" aria-hidden="true" />
        </button>
      </header>

      <div class="roles">
        <span class="mono lbl" id="kp-role">Signed in as</span>
        <div class="seg" role="group" aria-labelledby="kp-role">
          <button type="button" [attr.aria-pressed]="role() === 'admin_supervisor'" (click)="setRole('admin_supervisor')">Admin supervisor</button>
          <button type="button" [attr.aria-pressed]="role() === 'supervisor'" (click)="setRole('supervisor')">Supervisor</button>
          <button type="button" [attr.aria-pressed]="role() === 'agent'" (click)="setRole('agent')">Agent</button>
        </div>
      </div>
      <ul class="menu" role="list" aria-label="Menu for this role">
        @for (m of menu; track m.t) {
          <li [class.off]="!m.roles.includes(role())">
            {{ m.t }}<span class="sr-only">{{ m.roles.includes(role()) ? '' : ', hidden for this role' }}</span>
          </li>
        }
      </ul>

      <ul class="list" role="list">
        @for (c of list(); track c.no) {
          <li [attr.data-s]="c.status">
            @if (staff() && c.status === 'unassigned') {
              <input type="checkbox" class="pick" [checked]="picked().includes(c.no)" (change)="toggle(c.no)" [attr.aria-label]="'Select complaint ' + c.no" />
            } @else {
              <span class="pick-sp" aria-hidden="true"></span>
            }
            <div class="c-txt">
              <b><span class="mono">#{{ c.no }}</span> {{ c.cat }}</b>
              <span><ng-icon name="phosphorMapPin" aria-hidden="true" /> {{ c.ward }}, Khairpur{{ c.agent ? ', ' + c.agent : '' }}</span>
            </div>
            <span class="st">{{ label[c.status] }}</span>
            @if (staff() && c.status === 'assigned') {
              <button type="button" class="btn btn-ghost btn-sm" (click)="startClose(c.no)">Close</button>
            }
          </li>
          @if (closing() === c.no) {
            <li class="close-form">
              <label [for]="'kp-rem-' + c.no">Closing remarks</label>
              <textarea
                [id]="'kp-rem-' + c.no"
                class="textarea"
                rows="2"
                maxlength="256"
                [value]="remark()"
                (input)="remark.set($any($event.target).value)"
                [attr.aria-describedby]="'kp-rem-n-' + c.no"
              ></textarea>
              <div class="cf-foot">
                <span class="mono" [id]="'kp-rem-n-' + c.no">{{ remark().length }}/256, photo attached</span>
                <button type="button" class="btn btn-solid btn-sm" [disabled]="remark().trim().length < 5" (click)="close(c.no)">
                  <ng-icon name="phosphorCheck" aria-hidden="true" /> Close complaint
                </button>
              </div>
            </li>
          }
        }
      </ul>

      @if (staff()) {
        <div class="assign">
          <label for="kp-agent" class="sr-only">Agent</label>
          <select id="kp-agent" class="select" [value]="agent()" (change)="agent.set($any($event.target).value)">
            @for (a of agents; track a) {
              <option [value]="a">{{ a }}</option>
            }
          </select>
          <button type="button" class="btn btn-solid" [disabled]="!picked().length" (click)="assign()">Assign {{ picked().length || '' }}</button>
        </div>
      } @else {
        <p class="agent-note">Agents see the list. Assigning and closing belong to supervisors.</p>
      }
      <p class="mono sample" aria-live="polite">{{ note() }}</p>
    </div>
  `,
  styles: `
    :host {
      display: block;
    }
    .desk {
      display: grid;
      grid-template-columns: minmax(0, 1fr);
      gap: 12px;
      padding: 18px;
    }
    .desk-head {
      display: flex;
      align-items: center;
      gap: 12px;
      padding-bottom: 12px;
      border-bottom: 1px solid var(--line);

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
        background: var(--k-green-soft);
        color: var(--k-green-text);
        transition: opacity var(--t-base) var(--ease);

        &.off {
          background: var(--surface-2);
          color: var(--muted);
          text-decoration: line-through;
          opacity: 0.7;
        }
      }
    }
    .list {
      display: grid;
      grid-template-columns: minmax(0, 1fr);
      gap: 6px;

      > li:not(.close-form) {
        display: flex;
        align-items: center;
        gap: 10px;
        min-height: 54px;
        padding: 6px 8px 6px 10px;
        border-radius: var(--r-inner);
        border: 1px solid var(--line);
      }
    }
    .pick {
      width: 18px;
      height: 18px;
      margin: 0;
      flex-shrink: 0;
      accent-color: var(--k-green-dark);
    }
    .pick-sp {
      width: 18px;
      flex-shrink: 0;
    }
    .c-txt {
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
      .mono {
        font-size: 12px;
        color: var(--muted);
        font-weight: 400;
      }
      > span {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 12px;
        color: var(--muted);
      }
    }
    .st {
      font-size: 12px;
      font-weight: 500;
      padding: 2px 9px;
      border-radius: 999px;
      white-space: nowrap;
      background: var(--k-amber-soft);
      color: var(--k-amber-text);
    }
    [data-s='assigned'] .st {
      background: var(--surface-2);
      color: var(--ink-2);
    }
    [data-s='closed'] .st {
      background: var(--k-green-soft);
      color: var(--k-green-text);
    }
    .close-form {
      display: grid;
      gap: 6px;
      padding: 10px 12px;
      border-radius: var(--r-inner);
      background: var(--surface-2);

      label {
        font-size: 12.5px;
        font-weight: 500;
        color: var(--ink-2);
      }
      .textarea {
        min-height: 64px;
        font-size: 13.5px;
        background: var(--surface);
      }
    }
    .cf-foot {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;

      .mono {
        font-size: 12px;
        color: var(--muted);
      }
      .btn[disabled] {
        opacity: 0.45;
        cursor: not-allowed;
      }
    }
    .assign {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      gap: 8px;

      .select {
        height: 44px;
        font-size: 14px;
      }
      .btn[disabled] {
        opacity: 0.45;
        cursor: not-allowed;
      }
    }
    .agent-note {
      min-height: 44px;
      display: flex;
      align-items: center;
      font-size: 13px;
      color: var(--muted);
    }
    .sample {
      font-size: 12px;
      color: var(--muted);
      min-height: 14px;
    }
    @media (max-width: 460px) {
      .desk {
        padding: 14px;
      }
      .c-txt b {
        white-space: normal;
      }
    }
    /* Phones: the status pill and Close drop under the complaint so the text keeps a readable measure */
    @media (max-width: 400px) {
      .list > li:not(.close-form) {
        flex-wrap: wrap;
        row-gap: 6px;
        padding: 8px 10px;
      }
      .c-txt {
        flex: 1 1 calc(100% - 40px);
      }
      .st {
        margin-left: 28px;
      }
      .list .btn-sm {
        margin-left: auto;
      }
      .cf-foot {
        flex-wrap: wrap;
      }
    }
  `,
})
export class KpmcDeskDemo {
  protected readonly menu = MENU;
  protected readonly agents = AGENTS;
  protected readonly label = LABEL;
  protected readonly role = signal<Role>('supervisor');
  protected readonly list = signal<Complaint[]>(SEED);
  protected readonly picked = signal<number[]>([2041]);
  protected readonly agent = signal(AGENTS[2]);
  protected readonly closing = signal<number | null>(null);
  protected readonly remark = signal('');
  protected readonly note = signal('Sample complaints. Tick, pick an agent, assign.');

  protected readonly staff = computed(() => this.role() !== 'agent');
  protected readonly open = computed(() => this.list().filter((c) => c.status !== 'closed').length);
  protected readonly closed = computed(() => this.list().filter((c) => c.status === 'closed').length);

  protected setRole(r: Role): void {
    this.role.set(r);
    this.closing.set(null);
    this.note.set(r === 'agent' ? 'Signed in as an agent: the menu and actions above are hidden.' : 'Sample complaints. Tick, pick an agent, assign.');
  }

  protected toggle(no: number): void {
    this.picked.update((p) => (p.includes(no) ? p.filter((x) => x !== no) : [...p, no]));
  }

  protected assign(): void {
    const ids = this.picked();
    const who = this.agent();
    this.list.update((l) => l.map((c) => (ids.includes(c.no) ? { ...c, status: 'assigned' as const, agent: who } : c)));
    this.picked.set([]);
    this.note.set(`${ids.length} assigned to ${who}.`);
  }

  protected startClose(no: number): void {
    this.closing.set(this.closing() === no ? null : no);
    this.remark.set('');
  }

  protected close(no: number): void {
    this.list.update((l) => l.map((c) => (c.no === no ? { ...c, status: 'closed' as const } : c)));
    this.closing.set(null);
    this.note.set(`#${no} closed with remarks and a photo. Waiting for the citizen’s rating.`);
  }

  protected reset(): void {
    this.list.set(SEED);
    this.picked.set([2041]);
    this.closing.set(null);
    this.note.set('Sample complaints reset.');
  }
}
