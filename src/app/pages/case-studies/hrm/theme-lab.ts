import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { phosphorArrowCounterClockwise, phosphorCheck, phosphorMoon, phosphorSun, phosphorX } from '@ng-icons/phosphor-icons/regular';

/**
 * Hero demo: a small HRM Suite screen (a leave approval queue) wired to the product's three theme switches.
 * My own rebuild, not a screenshot. The values are HRM Suite's own (hrm-tokens.css): light and dark semantic
 * roles, the eight accent ramps (600 fill, 700 hover, 50 soft, 300 text on dark, 500 for the dark soft wash) and
 * the three densities (control and row heights). Shapes are the product's too: 4px controls, 8px panels.
 * Approve and Reject work. Sample people from the product's seeded demo company; no dates depend on today.
 */
type Mode = 'light' | 'dark';
type Density = 'compact' | 'default' | 'comfortable';
type Status = 'pending' | 'approved' | 'rejected';

interface Accent {
  id: string;
  label: string;
  a50: string;
  a300: string;
  a500: string;
  a600: string;
  a700: string;
}

const ACCENTS: Accent[] = [
  { id: 'blue', label: 'Blue', a50: '#eef4ff', a300: '#9dbcff', a500: '#3b77f0', a600: '#2563eb', a700: '#1d4ed8' },
  { id: 'indigo', label: 'Indigo', a50: '#eef0ff', a300: '#a5acfc', a500: '#6366f1', a600: '#4f46e5', a700: '#4338ca' },
  { id: 'violet', label: 'Violet', a50: '#f2efff', a300: '#bcaaff', a500: '#8360ff', a600: '#6d4aff', a700: '#5b34ea' },
  { id: 'teal', label: 'Teal', a50: '#edfcfa', a300: '#5ed6cb', a500: '#13a39a', a600: '#087f78', a700: '#0f6964' },
  { id: 'green', label: 'Green', a50: '#eaf8f2', a300: '#8dd5b8', a500: '#1f9e74', a600: '#087f5b', a700: '#06684b' },
  { id: 'orange', label: 'Orange', a50: '#fff5ed', a300: '#fdab74', a500: '#f0661f', a600: '#ca3f03', a700: '#b43c10' },
  { id: 'pink', label: 'Pink', a50: '#fff0f6', a300: '#fc96c2', a500: '#e03a86', a600: '#c8246e', a700: '#a61a59' },
  { id: 'red', label: 'Red', a50: '#fff1f1', a300: '#e89595', a500: '#d64343', a600: '#c92a2a', a700: '#a92020' },
];

const DENSITY: Record<Density, { label: string; control: number; small: number; row: number }> = {
  compact: { label: 'Compact', control: 30, small: 26, row: 46 },
  default: { label: 'Default', control: 34, small: 29, row: 58 },
  comfortable: { label: 'Comfortable', control: 38, small: 32, row: 64 },
};

interface Req {
  id: number;
  name: string;
  initials: string;
  tone: 'blue' | 'green' | 'purple';
  type: string;
  when: string;
  days: number;
  status: Status;
}

const SEED: Req[] = [
  { id: 1, name: 'Hina Raza', initials: 'HR', tone: 'purple', type: 'Annual leave', when: '14 to 16 Oct', days: 3, status: 'pending' },
  { id: 2, name: 'Bilal Sheikh', initials: 'BS', tone: 'green', type: 'Sick leave', when: '13 Oct', days: 1, status: 'pending' },
  { id: 3, name: 'Sadia Iqbal', initials: 'SI', tone: 'blue', type: 'Casual leave', when: '20 to 21 Oct', days: 2, status: 'approved' },
];

const STATUS_LABEL: Record<Status, string> = { pending: 'Pending', approved: 'Approved', rejected: 'Rejected' };

@Component({
  selector: 'mh-hrm-theme-lab',
  imports: [NgIcon],
  viewProviders: [provideIcons({ phosphorArrowCounterClockwise, phosphorCheck, phosphorMoon, phosphorSun, phosphorX })],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="lab">
      <div class="controls">
        <div class="ctl">
          <span class="ctl-label" id="lab-theme">Theme</span>
          <div class="seg" role="group" aria-labelledby="lab-theme">
            <button type="button" [attr.aria-pressed]="mode() === 'light'" (click)="mode.set('light')">
              <ng-icon name="phosphorSun" aria-hidden="true" /> Light
            </button>
            <button type="button" [attr.aria-pressed]="mode() === 'dark'" (click)="mode.set('dark')">
              <ng-icon name="phosphorMoon" aria-hidden="true" /> Dark
            </button>
          </div>
        </div>
        <div class="ctl">
          <span class="ctl-label" id="lab-density">Density</span>
          <div class="seg" role="group" aria-labelledby="lab-density">
            @for (d of densities; track d) {
              <button type="button" [attr.aria-pressed]="density() === d" (click)="density.set(d)">{{ densityLabel(d) }}</button>
            }
          </div>
        </div>
        <div class="ctl ctl-wide">
          <span class="ctl-label" id="lab-accent">Accent</span>
          <div class="swatches" role="group" aria-labelledby="lab-accent">
            @for (a of accents; track a.id) {
              <button
                type="button"
                class="swatch"
                [style.--sw]="a.a600"
                [attr.aria-pressed]="accent().id === a.id"
                [attr.aria-label]="a.label"
                [attr.title]="a.label"
                (click)="accentId.set(a.id)"
              ></button>
            }
          </div>
        </div>
      </div>

      <section
        class="app"
        [class.dark]="mode() === 'dark'"
        [style.--a50]="accent().a50"
        [style.--a300]="accent().a300"
        [style.--a500]="accent().a500"
        [style.--a600]="accent().a600"
        [style.--a700]="accent().a700"
        [style.--control-h.px]="dims().control"
        [style.--control-h-sm.px]="dims().small"
        [style.--row-h.px]="dims().row"
        aria-label="HRM Suite leave approvals, sample"
      >
        <header class="app-head">
          <img src="/images/hrm/hrm-mark.svg" width="26" height="26" alt="" />
          <div class="app-title">
            <h2>Leave requests</h2>
            <p>Approval center, October 2026</p>
          </div>
          <button type="button" class="icon" aria-label="Reset the sample requests" (click)="reset()">
            <ng-icon name="phosphorArrowCounterClockwise" aria-hidden="true" />
          </button>
        </header>

        <dl class="kpis">
          <div><dt>Pending</dt><dd>{{ counts().pending }}</dd></div>
          <div><dt>Approved</dt><dd>{{ counts().approved }}</dd></div>
          <div><dt>Days off approved</dt><dd>{{ counts().days }}</dd></div>
        </dl>

        <ul class="rows" role="list">
          @for (r of reqs(); track r.id) {
            <li class="row">
              <span class="avatar" [class]="'avatar t-' + r.tone" aria-hidden="true">{{ r.initials }}</span>
              <span class="who">
                <b>{{ r.name }}</b>
                <small>{{ r.type }}, {{ r.when }}, {{ r.days }} {{ r.days === 1 ? 'day' : 'days' }}</small>
              </span>
              @if (r.status === 'pending') {
                <span class="acts">
                  <button type="button" class="btn-p" [attr.aria-label]="'Approve ' + r.name" (click)="decide(r.id, 'approved')">
                    <ng-icon name="phosphorCheck" aria-hidden="true" /> Approve
                  </button>
                  <button type="button" class="btn-s" [attr.aria-label]="'Reject ' + r.name" (click)="decide(r.id, 'rejected')">
                    <ng-icon name="phosphorX" aria-hidden="true" />
                  </button>
                </span>
              } @else {
                <span class="st-badge" [class]="'st-badge b-' + r.status">{{ statusLabel[r.status] }}</span>
              }
            </li>
          }
        </ul>

        <footer class="tokens mono" aria-label="Token values in use">
          <span>--c-primary <b>{{ accent().a600 }}</b></span>
          <span>--control-h <b>{{ dims().control }}px</b></span>
          <span>--row-h <b>{{ dims().row }}px</b></span>
        </footer>
      </section>

      <p class="sr-only" aria-live="polite">{{ note() }}</p>
    </div>
  `,
  styles: `
    :host {
      display: block;
    }

    .lab {
      padding: 16px;
      border-radius: var(--r-card);
      background: var(--surface);
      border: 1px solid var(--line);
      box-shadow: var(--shadow-lg);
    }

    // ---------- Site-side controls ----------
    .controls {
      display: flex;
      flex-wrap: wrap;
      gap: 12px 16px;
      margin-bottom: 14px;
    }

    .ctl {
      display: grid;
      gap: 6px;
    }

    .ctl-wide {
      flex-basis: 100%;
    }

    .ctl-label {
      font-family: var(--font-mono);
      font-size: 12px;
      color: var(--muted);
    }

    .seg {
      padding: 3px;
      gap: 2px;

      button {
        height: 30px;
        padding: 0 12px;
        gap: 6px;
        font-size: 13px;
      }

      ng-icon {
        font-size: 15px;
      }
    }

    .swatches {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .swatch {
      position: relative;
      width: 30px;
      height: 30px;
      border-radius: 50%;
      background: var(--sw);
      box-shadow: inset 0 0 0 1px rgb(255 255 255 / 0.18);
      transition: transform var(--t-fast) var(--ease);

      &:hover {
        transform: scale(1.08);
      }

      &[aria-pressed='true']::after {
        content: '';
        position: absolute;
        inset: -4px;
        border-radius: 50%;
        border: 2px solid var(--ink);
      }
    }

    // ---------- The product preview: HRM Suite's own tokens ----------
    .app {
      --c-bg: #f7f8fa;
      --c-surface: #ffffff;
      --c-muted: #f2f4f7;
      --c-text: #172033;
      --c-text-2: #465268;
      --c-text-3: #556276;
      --c-border: #e2e6ec;
      --c-primary-soft: var(--a50);
      --c-primary-text: var(--a600);
      --ok: #087f5b;
      --ok-soft: #eaf8f2;
      --ok-line: #bfe7d7;
      --no: #c92a2a;
      --no-soft: #fff1f1;
      --no-line: #f0bebe;
      --av-blue: #eaf0ff;
      --av-blue-fg: #2563eb;
      --av-green: #e8f7f0;
      --av-green-fg: #087f5b;
      --av-purple: #efebff;
      --av-purple-fg: #6946fb;
      --shadow-1: 0 1px 2px rgb(16 24 40 / 0.04);

      padding: 14px;
      border-radius: 8px;
      background: var(--c-bg);
      color: var(--c-text);
      border: 1px solid var(--c-border);
      transition:
        background var(--t-base) var(--ease),
        color var(--t-base) var(--ease);

      &.dark {
        --c-bg: #0b0f17;
        --c-surface: #131a26;
        --c-muted: #1a2231;
        --c-text: #e7ecf4;
        --c-text-2: #b3bfd1;
        --c-text-3: #8794a9;
        --c-border: #243044;
        --c-primary-soft: color-mix(in srgb, var(--a500) 16%, transparent);
        --c-primary-text: var(--a300);
        --ok: #4fbb92;
        --ok-soft: rgb(31 158 116 / 0.14);
        --ok-line: rgb(79 187 146 / 0.34);
        --no: #f07a7a;
        --no-soft: rgb(214 67 67 / 0.15);
        --no-line: rgb(240 122 122 / 0.34);
        --av-blue: rgb(59 119 240 / 0.18);
        --av-blue-fg: #9dbcff;
        --av-green: rgb(79 187 146 / 0.18);
        --av-green-fg: #8dd5b8;
        --av-purple: rgb(157 128 255 / 0.2);
        --av-purple-fg: #bcaaff;
        --shadow-1: 0 1px 2px rgb(0 0 0 / 0.35);
      }
    }

    .app-head {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 12px;

      img {
        border-radius: 6px;
      }
    }

    .app-title {
      flex: 1;
      min-width: 0;

      h2 {
        font-size: 15px;
        font-weight: 700;
        letter-spacing: -0.015em;
        color: var(--c-text);
      }

      p {
        font-size: 12px;
        color: var(--c-text-3);
      }
    }

    .icon {
      width: var(--control-h);
      height: var(--control-h);
      display: grid;
      place-items: center;
      border-radius: 4px;
      border: 1px solid var(--c-border);
      background: var(--c-surface);
      color: var(--c-text-2);
      font-size: 15px;

      &:hover {
        color: var(--c-text);
      }
    }

    .kpis {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 8px;
      margin: 0 0 10px;

      div {
        padding: 9px 11px;
        border-radius: 8px;
        background: var(--c-surface);
        border: 1px solid var(--c-border);
        box-shadow: var(--shadow-1);
      }

      dt {
        font-size: 12px;
        font-weight: 600;
        color: var(--c-text-3);
      }

      dd {
        margin: 2px 0 0;
        font-size: 20px;
        font-weight: 700;
        letter-spacing: -0.03em;
        color: var(--c-text);
      }
    }

    .rows {
      border-radius: 8px;
      background: var(--c-surface);
      border: 1px solid var(--c-border);
      overflow: hidden;
    }

    .row {
      display: flex;
      align-items: center;
      gap: 10px;
      min-height: var(--row-h);
      padding: 6px 12px;
      transition: min-height var(--t-base) var(--ease);

      & + .row {
        border-top: 1px solid var(--c-border);
      }
    }

    .avatar {
      width: 30px;
      height: 30px;
      flex-shrink: 0;
      display: grid;
      place-items: center;
      border-radius: 50%;
      font-size: 12px;
      font-weight: 700;

      &.t-blue {
        background: var(--av-blue);
        color: var(--av-blue-fg);
      }

      &.t-green {
        background: var(--av-green);
        color: var(--av-green-fg);
      }

      &.t-purple {
        background: var(--av-purple);
        color: var(--av-purple-fg);
      }
    }

    .who {
      flex: 1;
      min-width: 0;

      b {
        display: block;
        font-size: 13.5px;
        font-weight: 600;
        color: var(--c-text);
      }

      small {
        display: block;
        font-size: 12px;
        color: var(--c-text-3);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }

    .acts {
      display: flex;
      gap: 6px;
      flex-shrink: 0;
    }

    /* Phones: the request keeps its full line; actions drop under it, aligned with the name */
    @media (max-width: 480px) {
      .row {
        flex-wrap: wrap;
        row-gap: 6px;
        padding-block: 8px;
      }
      .who {
        flex-basis: calc(100% - 40px);
      }
      .who small {
        white-space: normal;
      }
      .acts,
      .st-badge {
        margin-left: 40px;
      }
    }

    .btn-p,
    .btn-s {
      height: var(--control-h-sm);
      min-width: 26px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 5px;
      border-radius: 4px;
      font-size: 12.5px;
      font-weight: 700;
      transition:
        background var(--t-fast) var(--ease),
        height var(--t-base) var(--ease);

      ng-icon {
        font-size: 14px;
      }
    }

    .btn-p {
      padding: 0 10px;
      background: var(--a600);
      color: #fff;

      &:hover {
        background: var(--a700);
      }
    }

    .btn-s {
      width: var(--control-h-sm);
      background: var(--c-surface);
      border: 1px solid var(--c-border);
      color: var(--c-text-2);

      &:hover {
        background: var(--c-muted);
      }
    }

    .st-badge {
      flex-shrink: 0;
      height: 22px;
      padding: 0 8px;
      display: inline-flex;
      align-items: center;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 700;
      border: 1px solid;

      &.b-approved {
        background: var(--ok-soft);
        color: var(--ok);
        border-color: var(--ok-line);
      }

      &.b-rejected {
        background: var(--no-soft);
        color: var(--no);
        border-color: var(--no-line);
      }
    }

    .tokens {
      display: flex;
      flex-wrap: wrap;
      gap: 4px 14px;
      margin-top: 10px;
      padding: 8px 10px;
      border-radius: 4px;
      background: var(--c-primary-soft);
      font-size: 12px;
      color: var(--c-text-2);

      b {
        font-weight: 600;
        color: var(--c-primary-text);
      }
    }

    @media (max-width: 420px) {
      .lab {
        padding: 12px;
      }

      .app {
        padding: 10px;
      }

      .kpis dt {
        font-size: 12px;
      }

      .btn-p {
        padding: 0 8px;
      }
    }
  `,
})
export class HrmThemeLab {
  protected readonly accents = ACCENTS;
  protected readonly densities: Density[] = ['compact', 'default', 'comfortable'];
  protected readonly statusLabel = STATUS_LABEL;

  protected readonly mode = signal<Mode>('dark');
  protected readonly accentId = signal('blue');
  protected readonly density = signal<Density>('default');
  protected readonly reqs = signal<Req[]>(SEED.map((r) => ({ ...r })));
  protected readonly note = signal('');

  protected readonly accent = computed(() => ACCENTS.find((a) => a.id === this.accentId()) ?? ACCENTS[0]);
  protected readonly dims = computed(() => DENSITY[this.density()]);
  protected readonly counts = computed(() => {
    const list = this.reqs();
    const approved = list.filter((r) => r.status === 'approved');
    return {
      pending: list.filter((r) => r.status === 'pending').length,
      approved: approved.length,
      days: approved.reduce((n, r) => n + r.days, 0),
    };
  });

  protected densityLabel(d: Density): string {
    return DENSITY[d].label;
  }

  protected decide(id: number, status: Status): void {
    const r = this.reqs().find((x) => x.id === id);
    if (!r) return;
    this.reqs.update((list) => list.map((x) => (x.id === id ? { ...x, status } : x)));
    this.note.set(`${r.name}: ${r.type.toLowerCase()} ${status}.`);
  }

  protected reset(): void {
    this.reqs.set(SEED.map((r) => ({ ...r })));
    this.note.set('Sample requests reset.');
  }
}
