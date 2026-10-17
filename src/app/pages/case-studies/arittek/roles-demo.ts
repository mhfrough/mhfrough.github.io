import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { phosphorArrowCounterClockwise, phosphorLock, phosphorPaperPlaneTilt } from '@ng-icons/phosphor-icons/regular';

/**
 * The role editor, redrawn as my own mockup: the real permission catalog (eight modules, each with create, read,
 * update and delete), a locked system role that holds every permission, and two sample roles to edit. The menu
 * preview shows what the screen hides for the role; "Send" plays the server's side, which answers 403 with the
 * same sentence the real endpoint uses. Role names other than Super Admin are samples.
 */
type Action = 'create' | 'read' | 'update' | 'delete';
type Matrix = Record<string, Action[]>;

const MODULES = [
  { v: 'blogs', t: 'Blogs' },
  { v: 'comments', t: 'Comments' },
  { v: 'inquiries', t: 'Inquiries' },
  { v: 'campaigns', t: 'Campaigns' },
  { v: 'audience', t: 'Audience' },
  { v: 'users', t: 'Users' },
  { v: 'roles', t: 'Roles' },
  { v: 'settings', t: 'Settings' },
];
const ACTIONS: Action[] = ['create', 'read', 'update', 'delete'];
const ALL: Action[] = [...ACTIONS];

interface Role {
  id: string;
  name: string;
  system: boolean;
  m: Matrix;
}

const SEED: Role[] = [
  { id: 'super', name: 'Super Admin', system: true, m: Object.fromEntries(MODULES.map((x) => [x.v, ALL])) },
  {
    id: 'editor',
    name: 'Editor',
    system: false,
    m: { blogs: ALL, comments: ['read', 'update', 'delete'], inquiries: ['read'] },
  },
  {
    id: 'marketing',
    name: 'Marketing',
    system: false,
    m: { blogs: ['read'], inquiries: ['read', 'update'], campaigns: ALL, audience: ALL },
  },
];

const clone = (r: Role[]): Role[] => r.map((x) => ({ ...x, m: Object.fromEntries(Object.entries(x.m).map(([k, v]) => [k, [...v]])) }));

@Component({
  selector: 'mh-arittek-roles',
  imports: [NgIcon],
  viewProviders: [provideIcons({ phosphorArrowCounterClockwise, phosphorLock, phosphorPaperPlaneTilt })],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="roles card card--lift">
      <div class="r-head">
        <div class="seg" role="group" aria-label="Role">
          @for (r of roles(); track r.id) {
            <button type="button" [attr.aria-pressed]="sel() === r.id" (click)="pick(r.id)">{{ r.name }}</button>
          }
        </div>
        <button type="button" class="reset" aria-label="Reset the sample roles" (click)="reset()">
          <ng-icon name="phosphorArrowCounterClockwise" aria-hidden="true" />
        </button>
      </div>
      @if (role().system) {
        <p class="sys"><ng-icon name="phosphorLock" aria-hidden="true" /> System role: every permission, and it can’t be edited.</p>
      }

      <div class="grid">
        <div class="tbl-wrap" tabindex="0" role="region" aria-label="Permission matrix, scrolls sideways on small screens">
          <table>
            <caption class="sr-only">Permissions for {{ role().name }}</caption>
            <thead>
              <tr>
                <th scope="col">Module</th>
                @for (a of actions; track a) {
                  <th scope="col" class="c">{{ a }}</th>
                }
              </tr>
            </thead>
            <tbody>
              @for (m of modules; track m.v) {
                <tr>
                  <th scope="row">{{ m.t }}</th>
                  @for (a of actions; track a) {
                    <td class="c">
                      <input
                        type="checkbox"
                        [checked]="has(m.v, a)"
                        [disabled]="role().system"
                        (change)="flip(m.v, a)"
                        [attr.aria-label]="a + ' ' + m.t"
                      />
                    </td>
                  }
                </tr>
              }
            </tbody>
          </table>
        </div>

        <div class="side">
          <p class="mini">Menu for this role</p>
          <ul class="menu" role="list">
            @for (m of modules; track m.v) {
              <li [class.off]="!has(m.v, 'read')">
                {{ m.t }}<span class="sr-only">{{ has(m.v, 'read') ? '' : ', hidden' }}</span>
              </li>
            }
          </ul>

          <p class="mini">Try a request</p>
          <div class="req">
            <label for="arr-act" class="sr-only">Action</label>
            <select id="arr-act" class="select" [value]="act()" (change)="act.set($any($event.target).value)">
              @for (a of actions; track a) {
                <option [value]="a">{{ a }}</option>
              }
            </select>
            <label for="arr-mod" class="sr-only">Module</label>
            <select id="arr-mod" class="select" [value]="mod()" (change)="mod.set($any($event.target).value)">
              @for (m of modules; track m.v) {
                <option [value]="m.v">{{ m.v }}</option>
              }
            </select>
            <button type="button" class="btn btn-solid btn-sm" (click)="send()"><ng-icon name="phosphorPaperPlaneTilt" aria-hidden="true" /> Send</button>
          </div>
          <p class="res mono" [attr.data-ok]="res()?.ok" aria-live="polite">{{ res()?.text ?? 'POST as ' + role().name }}</p>
        </div>
      </div>
      <p class="mono sample">{{ count() }} of 32 permissions. Sample roles.</p>
    </div>
  `,
  styles: `
    :host {
      display: block;
    }
    .roles {
      padding: 20px 22px;
    }
    .r-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;

      .seg {
        flex-wrap: wrap;
      }
      .seg button {
        height: 32px;
        font-size: 13.5px;
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
    .sys {
      display: flex;
      align-items: center;
      gap: 6px;
      margin-top: 10px;
      font-size: 13px;
      color: var(--a-gold-text);
    }
    .grid {
      display: grid;
      grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr);
      gap: 28px;
      margin-top: 16px;
    }
    .tbl-wrap {
      position: relative;
      overflow-x: auto;
      /* Scroll shadows: an edge darkens only while more columns sit past it */
      background:
        linear-gradient(to right, var(--surface), transparent) left / 24px 100% no-repeat local,
        linear-gradient(to left, var(--surface), transparent) right / 24px 100% no-repeat local,
        radial-gradient(farthest-side at 0 50%, rgb(0 0 0 / 0.16), transparent) left / 12px 100% no-repeat scroll,
        radial-gradient(farthest-side at 100% 50%, rgb(0 0 0 / 0.16), transparent) right / 12px 100% no-repeat scroll;

      &:focus-visible {
        outline: 2px solid var(--focus);
        outline-offset: 2px;
      }
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 13.5px;
    }
    th,
    td {
      padding: 6px 8px;
      border-bottom: 1px solid var(--line);
      text-align: left;
      white-space: nowrap;
    }
    thead th {
      font-size: 12px;
      font-weight: 500;
      color: var(--muted);
      text-transform: capitalize;
    }
    tbody th {
      font-weight: 600;
    }
    .c {
      text-align: center;
    }
    td input {
      width: 18px;
      height: 18px;
      margin: 7px;
      accent-color: var(--a-navy);
      vertical-align: middle;

      &:disabled {
        opacity: 0.6;
      }
    }
    .mini {
      font-size: 13px;
      font-weight: 600;
      color: var(--muted);
      margin-bottom: 8px;
    }
    .menu {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
      margin-bottom: 20px;

      li {
        padding: 3px 10px;
        border-radius: 999px;
        font-size: 12px;
        background: var(--a-gold-soft);
        color: var(--a-gold-text);

        &.off {
          background: var(--surface-2);
          color: var(--muted);
          text-decoration: line-through;
        }
      }
    }
    .req {
      display: grid;
      grid-template-columns: minmax(0, 1fr) minmax(0, 1.2fr) auto;
      gap: 6px;

      .select {
        height: 44px;
        font-size: 13.5px;
        padding-left: 14px;
      }
      .btn {
        height: 44px;
      }
    }
    .res {
      margin-top: 10px;
      min-height: 40px;
      padding: 10px 12px;
      border-radius: var(--r-inner);
      background: var(--surface-2);
      font-size: 12px;
      color: var(--ink-2);
      overflow-wrap: anywhere;

      &[data-ok='true'] {
        background: var(--a-forest-soft);
        color: var(--a-forest-text);
      }
      &[data-ok='false'] {
        background: var(--a-red-soft);
        color: var(--a-red-text);
      }
    }
    .sample {
      margin-top: 12px;
      font-size: 12px;
      color: var(--muted);
    }
    @media (max-width: 860px) {
      .grid {
        grid-template-columns: minmax(0, 1fr);
      }
    }
    @media (max-width: 374px) {
      .roles .r-head .seg button {
        padding: 0 7px;
      }
      th,
      td {
        padding: 6px 4px;
      }
      tbody th {
        font-size: 12.5px;
      }
    }
    @media (max-width: 460px) {
      .roles {
        padding: 16px;
      }
      .r-head .seg {
        flex-wrap: nowrap;
      }
      .r-head .seg button {
        padding: 0 9px;
        font-size: 12.5px;
      }
      .req {
        grid-template-columns: 1fr 1fr;

        .btn {
          grid-column: 1 / -1;
        }
      }
    }
  `,
})
export class ArittekRolesDemo {
  protected readonly modules = MODULES;
  protected readonly actions = ACTIONS;
  protected readonly roles = signal<Role[]>(clone(SEED));
  protected readonly sel = signal('editor');
  protected readonly act = signal<Action>('delete');
  protected readonly mod = signal('campaigns');
  protected readonly res = signal<{ ok: boolean; text: string } | null>(null);

  protected readonly role = computed(() => this.roles().find((r) => r.id === this.sel()) ?? this.roles()[0]);
  protected readonly count = computed(() => Object.values(this.role().m).reduce((n, a) => n + a.length, 0));

  protected pick(id: string): void {
    this.sel.set(id);
    this.res.set(null);
  }

  protected has(m: string, a: Action): boolean {
    return (this.role().m[m] ?? []).includes(a);
  }

  protected flip(m: string, a: Action): void {
    const id = this.sel();
    this.roles.update((rs) =>
      rs.map((r) => {
        if (r.id !== id || r.system) return r;
        const cur = r.m[m] ?? [];
        const next = cur.includes(a) ? cur.filter((x) => x !== a) : ACTIONS.filter((x) => x === a || cur.includes(x));
        return { ...r, m: { ...r.m, [m]: next } };
      }),
    );
    this.res.set(null);
  }

  protected send(): void {
    const a = this.act();
    const m = this.mod();
    this.res.set(
      this.has(m, a)
        ? { ok: true, text: `200 OK: ${a} ${m} done, and written to the activity log.` }
        : { ok: false, text: `403: You don't have permission to ${a} ${m}.` },
    );
  }

  protected reset(): void {
    this.roles.set(clone(SEED));
    this.sel.set('editor');
    this.res.set(null);
  }
}
