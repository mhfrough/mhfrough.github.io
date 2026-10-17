import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { phosphorArrowCounterClockwise } from '@ng-icons/phosphor-icons/regular';

/**
 * Role editor and back-office menu as my own working mockup. In the original, a role is a list of API endpoint keys
 * ("GET::assign") and a structural directive, `*permission="['GET::assign']"`, renders a menu item or tab only when
 * the signed-in user holds one of its keys. The keys below are the app's own; the three presets are illustrative,
 * since admins built roles themselves.
 */
type Preset = 'admin' | 'supervisor' | 'consultant';

interface Key {
  key: string;
  group: string;
}

const KEYS: Key[] = [
  { key: 'POST::admin/dashboard', group: 'Overview' },
  { key: 'GET::company-registration/new', group: 'Queues' },
  { key: 'GET::company-registration/pending', group: 'Queues' },
  { key: 'GET::company-registration/complete', group: 'Queues' },
  { key: 'GET::mailing-address/pending', group: 'Queues' },
  { key: 'GET::assign', group: 'Team' },
  { key: 'GET::supervisor/consultant', group: 'Team' },
  { key: 'POST::report/payment', group: 'Money' },
  { key: 'POST::ticker/alerts', group: 'Content' },
  { key: 'POST::user/sessions', group: 'Security' },
  { key: 'GET::role', group: 'Security' },
];

/** Menu items as the back office draws them, each behind one or more keys. Tabs belong to their parent. */
const MENU: { t: string; keys: string[]; tabs?: { t: string; key: string }[] }[] = [
  { t: 'Dashboard', keys: ['POST::admin/dashboard'] },
  {
    t: 'Company registration',
    keys: ['GET::company-registration/new', 'GET::company-registration/pending', 'GET::company-registration/complete'],
    tabs: [
      { t: 'New', key: 'GET::company-registration/new' },
      { t: 'Pending', key: 'GET::company-registration/pending' },
      { t: 'Complete', key: 'GET::company-registration/complete' },
    ],
  },
  { t: 'Mailing address', keys: ['GET::mailing-address/pending'] },
  { t: 'Assign', keys: ['GET::assign'] },
  { t: 'Consultants', keys: ['GET::supervisor/consultant'] },
  { t: 'Payment report', keys: ['POST::report/payment'] },
  { t: 'Ticker', keys: ['POST::ticker/alerts'] },
  { t: 'Sessions', keys: ['POST::user/sessions'] },
  { t: 'Roles', keys: ['GET::role'] },
];

const PRESETS: Record<Preset, string[]> = {
  admin: KEYS.map((k) => k.key),
  supervisor: [
    'POST::admin/dashboard',
    'GET::company-registration/new',
    'GET::company-registration/pending',
    'GET::company-registration/complete',
    'GET::mailing-address/pending',
    'GET::assign',
    'GET::supervisor/consultant',
  ],
  consultant: ['GET::company-registration/pending', 'GET::company-registration/complete', 'GET::mailing-address/pending'],
};

const GROUPS = [...new Set(KEYS.map((k) => k.group))];

@Component({
  selector: 'mh-finclore-access',
  imports: [NgIcon],
  viewProviders: [provideIcons({ phosphorArrowCounterClockwise })],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="acc">
      <div class="card editor">
        <div class="ed-head">
          <span class="mono lbl" id="fa-role">Role</span>
          <div class="seg" role="group" aria-labelledby="fa-role">
            <button type="button" [attr.aria-pressed]="preset() === 'admin'" (click)="apply('admin')">Admin</button>
            <button type="button" [attr.aria-pressed]="preset() === 'supervisor'" (click)="apply('supervisor')">Supervisor</button>
            <button type="button" [attr.aria-pressed]="preset() === 'consultant'" (click)="apply('consultant')">Consultant</button>
          </div>
          <button type="button" class="reset" aria-label="Reset to the supervisor role" (click)="apply('supervisor')">
            <ng-icon name="phosphorArrowCounterClockwise" aria-hidden="true" />
          </button>
        </div>
        @for (g of groups; track g) {
          <fieldset>
            <legend class="mono lbl">{{ g }}</legend>
            @for (k of keysIn(g); track k.key) {
              <label class="check-row">
                <input type="checkbox" [checked]="granted().includes(k.key)" (change)="toggle(k.key)" />
                <code>{{ k.key }}</code>
              </label>
            }
          </fieldset>
        }
      </div>

      <div class="panel">
        <div class="p-head">
          <img src="/images/finclore/finclore-wordmark-light.webp" width="108" height="22" alt="Finclore" />
          <span class="mono">{{ visible() }} of {{ menu.length }} items</span>
        </div>
        <ul class="menu" role="list" aria-label="Back office menu for this role" aria-live="polite">
          @for (m of menu; track m.t) {
            @if (shows(m.keys)) {
              <li>
                <span class="m-t">{{ m.t }}</span>
                @if (m.tabs) {
                  <span class="tabs">
                    @for (t of m.tabs; track t.key) {
                      @if (granted().includes(t.key)) {
                        <span class="tab">{{ t.t }}</span>
                      }
                    }
                  </span>
                }
              </li>
            }
          }
          @if (!visible()) {
            <li class="empty">Nothing to show. This role can sign in and see an empty office.</li>
          }
        </ul>
        <p class="code mono" aria-hidden="true">
          &lt;a <span class="dir">*permission</span>="['<span class="k">{{ last() }}</span>']"&gt;
          <span class="res" [class.off]="!granted().includes(last())">{{ granted().includes(last()) ? 'rendered' : 'removed' }}</span>
        </p>
      </div>
    </div>
  `,
  styles: `
    :host {
      display: block;
    }
    .acc {
      display: grid;
      grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr);
      gap: 16px;
      align-items: start;
    }
    .editor {
      display: grid;
      gap: 12px;
      padding: 18px;
    }
    .ed-head {
      display: flex;
      align-items: center;
      gap: 10px;
      flex-wrap: wrap;

      .seg {
        flex-wrap: wrap;
      }
      .seg button {
        height: 32px;
        padding: 0 12px;
        font-size: 12.5px;
      }
    }
    .lbl {
      font-size: 12px;
      color: var(--muted);
    }
    .reset {
      width: 44px;
      height: 44px;
      margin-left: auto;
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
    fieldset {
      margin: 0;
      padding: 0;
      border: 0;
      min-width: 0;
      display: grid;
      gap: 2px;

      legend {
        padding: 0;
        margin-bottom: 4px;
      }
    }
    .check-row {
      display: flex;
      align-items: center;
      gap: 10px;
      min-height: 36px;
      padding: 0 8px;
      border-radius: 10px;
      cursor: pointer;

      &:hover {
        background: var(--surface-2);
      }
      input {
        width: 18px;
        height: 18px;
        flex-shrink: 0;
        accent-color: var(--f-navy);
      }
      code {
        font-family: var(--font-mono);
        font-size: 12px;
        color: var(--ink-2);
        overflow-wrap: anywhere;
      }
    }
    .panel {
      position: sticky;
      top: calc(var(--nav-h, 52px) + 24px);
      display: grid;
      gap: 14px;
      padding: 18px;
      border-radius: var(--r-card);
      background: var(--f-night);
      color: var(--n-ink);
      box-shadow: var(--shadow-lg);
    }
    .p-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      padding-bottom: 12px;
      border-bottom: 1px solid var(--f-night-line);

      img {
        height: 18px;
        width: auto;
      }
      .mono {
        font-size: 12px;
        color: var(--n-muted);
      }
    }
    .menu {
      display: grid;
      gap: 4px;
      min-height: 200px;
      align-content: start;

      li {
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: 6px 10px;
        min-height: 38px;
        padding: 6px 12px;
        border-radius: 10px;
        background: var(--f-night-2);
        font-size: 13.5px;
        font-weight: 500;
      }
      .empty {
        background: transparent;
        border: 1px dashed var(--f-night-line);
        color: var(--n-muted);
        font-weight: 400;
      }
    }
    @media (prefers-reduced-motion: no-preference) {
      .menu li {
        animation: item-in 0.25s var(--ease) both;
      }
    }
    @keyframes item-in {
      from {
        opacity: 0;
        transform: translateX(-6px);
      }
    }
    .tabs {
      display: flex;
      gap: 4px;
    }
    .tab {
      padding: 1px 8px;
      border-radius: 999px;
      font-size: 12px;
      font-weight: 500;
      background: var(--f-night-line);
      color: var(--n-ink);
    }
    .code {
      padding: 10px 12px;
      border-radius: 10px;
      border: 1px solid var(--f-night-line);
      font-size: 12px;
      line-height: 1.6;
      color: var(--n-muted);
      overflow-wrap: anywhere;

      .dir {
        color: var(--n-ink);
      }
      .k {
        color: var(--n-ink);
        font-weight: 600;
      }
      .res {
        display: inline-block;
        margin-left: 6px;
        padding: 0 8px;
        border-radius: 999px;
        background: var(--f-green-soft);
        color: var(--f-green-text);
        font-size: 12px;

        &.off {
          background: var(--f-red-soft);
          color: var(--f-red);
        }
      }
    }
    @media (max-width: 860px) {
      .acc {
        grid-template-columns: 1fr;
      }
      .panel {
        position: static;
      }
    }
  `,
})
export class FincloreAccessDemo {
  protected readonly menu = MENU;
  protected readonly groups = GROUPS;
  protected readonly preset = signal<Preset | null>('supervisor');
  protected readonly granted = signal<string[]>(PRESETS.supervisor);
  protected readonly last = signal('GET::assign');

  protected readonly visible = computed(() => MENU.filter((m) => this.shows(m.keys)).length);

  protected keysIn(group: string): Key[] {
    return KEYS.filter((k) => k.group === group);
  }

  /** The directive's rule: render when the user holds any one of the listed keys. */
  protected shows(keys: string[]): boolean {
    const g = this.granted();
    return keys.some((k) => g.includes(k));
  }

  protected toggle(key: string): void {
    this.granted.update((g) => (g.includes(key) ? g.filter((k) => k !== key) : [...g, key]));
    this.last.set(key);
    this.preset.set(null);
  }

  protected apply(p: Preset): void {
    this.granted.set(PRESETS[p]);
    this.preset.set(p);
    this.last.set(p === 'consultant' ? 'GET::assign' : 'GET::company-registration/new');
  }
}
