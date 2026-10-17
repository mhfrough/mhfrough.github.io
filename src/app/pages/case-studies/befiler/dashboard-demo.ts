import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  phosphorBell,
  phosphorCheck,
  phosphorFileText,
  phosphorFolder,
  phosphorHouse,
  phosphorReceipt,
  phosphorSquaresFour,
  phosphorUploadSimple,
} from '@ng-icons/phosphor-icons/regular';

/**
 * The customer dashboard, redrawn as my own mockup (never a screenshot). One account holds every service a
 * customer buys: pick a service on the left and its stages and next action show on the right.
 * The customer and figures are invented; the services and stage names follow the real dashboard.
 */
type Tone = 'done' | 'work' | 'wait';

const SERVICES: readonly {
  id: string;
  t: string;
  s: string;
  tone: Tone;
  badge: string;
  steps: readonly string[];
  at: number;
  next: string;
  action?: string;
}[] = [
  {
    id: 'itr',
    t: 'Income tax return 2026',
    s: 'Essential filing',
    tone: 'work',
    badge: 'In review',
    steps: ['Paid', 'Case in queue', 'Lawyer review', 'Submitted to FBR', 'Closed'],
    at: 2,
    next: 'Your consultant is checking the wealth statement. You will get a push when it is filed.',
  },
  {
    id: 'stx',
    t: 'Sales tax return',
    s: 'Monthly, September',
    tone: 'wait',
    badge: 'Needs you',
    steps: ['Invoices', 'Reconciliation', 'Challan', 'Filed'],
    at: 0,
    next: 'Upload this month’s sales and purchase invoices so the team can reconcile them.',
    action: 'Upload invoices',
  },
  {
    id: 'ntn',
    t: 'NTN registration',
    s: 'Individual',
    tone: 'done',
    badge: 'Complete',
    steps: ['Documents', 'Submitted', 'NTN issued'],
    at: 3,
    next: 'Your NTN certificate is saved in Documents.',
  },
  {
    id: 'usa',
    t: 'USA LLC formation',
    s: 'Complete package',
    tone: 'wait',
    badge: 'Needs you',
    steps: ['Details', 'State filing', 'EIN', 'Bank account'],
    at: 0,
    next: 'Add a passport copy and the member details to start the state filing.',
    action: 'Add documents',
  },
];

const NAV = [
  { icon: 'phosphorHouse', t: 'Overview' },
  { icon: 'phosphorSquaresFour', t: 'Services' },
  { icon: 'phosphorFolder', t: 'Documents' },
  { icon: 'phosphorReceipt', t: 'Payments' },
  { icon: 'phosphorBell', t: 'Alerts' },
] as const;

@Component({
  selector: 'mh-befiler-dashboard',
  imports: [NgIcon],
  viewProviders: [
    provideIcons({
      phosphorBell,
      phosphorCheck,
      phosphorFileText,
      phosphorFolder,
      phosphorHouse,
      phosphorReceipt,
      phosphorSquaresFour,
      phosphorUploadSimple,
    }),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <figure class="browser">
      <div class="browser-bar" aria-hidden="true">
        <span class="dots"><i></i><i></i><i></i></span>
        <span class="url">Customer dashboard</span>
      </div>
      <div class="app">
        <nav class="rail" aria-label="Dashboard sections (mockup)">
          <img src="/images/befiler/befiler-icon.webp" width="28" height="28" alt="" />
          @for (n of nav; track n.t; let i = $index) {
            <span class="rail-i" [class.on]="i === 1" [attr.aria-current]="i === 1 ? 'page' : null">
              <ng-icon [name]="n.icon" aria-hidden="true" />
              <small>{{ n.t }}</small>
            </span>
          }
        </nav>

        <div class="main">
          <div class="hello">
            <div>
              <p class="hi">Welcome back, Ayesha</p>
              <p class="muted">4 services on one account</p>
            </div>
            <span class="avatar" aria-hidden="true">A</span>
          </div>

          <div class="cols">
            <ul class="list" role="listbox" aria-label="Your services" (keydown)="onKey($event)">
              @for (s of services; track s.id) {
                <li
                  role="option"
                  [attr.aria-selected]="s.id === id()"
                  [attr.tabindex]="s.id === id() ? 0 : -1"
                  [class.on]="s.id === id()"
                  (click)="id.set(s.id)"
                >
                  <span class="ic" aria-hidden="true"><ng-icon name="phosphorFileText" /></span>
                  <span class="txt"><b>{{ s.t }}</b><small>{{ s.s }}</small></span>
                  <em class="badge-s" [attr.data-tone]="s.tone">{{ s.badge }}</em>
                </li>
              }
            </ul>

            @for (k of [sel()]; track k.id) {
              <div class="detail" aria-live="polite">
                <p class="d-title">{{ k.t }}</p>
                <ol class="steps" role="list">
                  @for (st of k.steps; track st; let i = $index) {
                    <li [class.done]="i < k.at" [class.now]="i === k.at">
                      <span class="dot" aria-hidden="true">
                        @if (i < k.at) {
                          <ng-icon name="phosphorCheck" />
                        }
                      </span>
                      {{ st }}
                      <span class="sr-only">{{ i < k.at ? '(done)' : i === k.at ? '(current)' : '' }}</span>
                    </li>
                  }
                </ol>
                <p class="next">{{ k.next }}</p>
                @if (k.action) {
                  <span class="d-btn"><ng-icon name="phosphorUploadSimple" aria-hidden="true" />{{ k.action }}</span>
                }
              </div>
            }
          </div>
        </div>
      </div>
    </figure>
  `,
  styles: `
    :host {
      display: block;
    }
    .browser {
      margin: 0;
      border-radius: var(--r-card);
      overflow: hidden;
      border: 1px solid var(--line);
      background: var(--surface);
      box-shadow: var(--shadow-lg);
    }
    .browser-bar {
      display: flex;
      align-items: center;
      gap: 14px;
      height: 36px;
      padding: 0 14px;
      border-bottom: 1px solid var(--line);
      background: var(--surface-2);
    }
    .dots {
      display: flex;
      gap: 6px;
    }
    .dots i {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: var(--line-strong);
    }
    .url {
      flex: 1;
      max-width: 320px;
      margin: 0 auto;
      padding: 3px 12px;
      border-radius: var(--r-pill);
      background: var(--surface);
      font-size: 12px;
      color: var(--muted);
      text-align: center;
    }
    .app {
      display: grid;
      grid-template-columns: 76px minmax(0, 1fr);
      min-height: 380px;
    }
    .rail {
      display: grid;
      align-content: start;
      justify-items: center;
      gap: 6px;
      padding: 16px 6px;
      border-right: 1px solid var(--line);
      background: var(--bg);
    }
    .rail img {
      margin-bottom: 10px;
      border-radius: 8px;
    }
    .rail-i {
      display: grid;
      justify-items: center;
      gap: 2px;
      width: 100%;
      padding: 8px 0;
      border-radius: var(--r-inner);
      color: var(--muted);
      font-size: 18px;
    }
    .rail-i small {
      font-size: 12px;
    }
    .rail-i.on {
      background: var(--b-red-soft);
      color: var(--b-red-text);
    }
    .main {
      padding: 18px 20px 20px;
    }
    .hello {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 16px;
    }
    .hi {
      font-weight: 700;
      font-size: 16px;
    }
    .muted {
      font-size: 12.5px;
      color: var(--muted);
    }
    .avatar {
      width: 34px;
      height: 34px;
      border-radius: 50%;
      display: grid;
      place-items: center;
      background: var(--ink);
      color: var(--surface);
      font-weight: 600;
      font-size: 13px;
    }
    .cols {
      display: grid;
      grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr);
      gap: 14px;
    }
    ul,
    ol {
      margin: 0;
      padding: 0;
      list-style: none;
    }
    .list {
      display: grid;
      gap: 8px;
      align-content: start;
    }
    .list li {
      display: flex;
      align-items: center;
      gap: 10px;
      min-height: 44px;
      padding: 10px 12px;
      border-radius: var(--r-inner);
      border: 1px solid var(--line);
      background: var(--surface);
      cursor: pointer;
      transition:
        border-color 0.2s var(--ease),
        box-shadow 0.2s var(--ease);
    }
    .list li:hover {
      border-color: var(--line-strong);
    }
    .list li.on {
      border-color: var(--b-red);
      box-shadow: 0 0 0 3px var(--b-red-soft);
    }
    .list li:focus-visible {
      outline: 2px solid var(--focus, var(--b-red));
      outline-offset: 2px;
    }
    .ic {
      width: 30px;
      height: 30px;
      flex-shrink: 0;
      border-radius: var(--r-pill);
      display: grid;
      place-items: center;
      background: var(--surface-2);
      color: var(--ink-2);
      font-size: 16px;
    }
    .txt {
      display: grid;
      min-width: 0;
    }
    .txt b {
      font-size: 13px;
      font-weight: 600;
      line-height: 1.3;
    }
    .txt small {
      font-size: 12px;
      color: var(--muted);
    }
    .badge-s {
      margin-left: auto;
      flex-shrink: 0;
      padding: 3px 8px;
      border-radius: 999px;
      font-style: normal;
      font-size: 12px;
      font-weight: 600;
      background: var(--surface-2);
      color: var(--ink-2);
    }
    .badge-s[data-tone='work'] {
      background: var(--b-red-soft);
      color: var(--b-red-text);
    }
    .badge-s[data-tone='done'] {
      background: #e3f3e7;
      color: #1d6b34;
    }
    .detail {
      padding: 16px;
      border-radius: var(--r-inner);
      background: var(--bg);
      border: 1px solid var(--line);
      display: grid;
      align-content: start;
      gap: 12px;
    }
    .d-title {
      font-weight: 600;
      font-size: 14px;
    }
    .steps {
      display: grid;
      gap: 8px;
      font-size: 12.5px;
      color: var(--muted);
    }
    .steps li {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .steps .done,
    .steps .now {
      color: var(--ink);
    }
    .steps .now {
      font-weight: 600;
    }
    .dot {
      width: 18px;
      height: 18px;
      flex-shrink: 0;
      border-radius: 50%;
      border: 1.5px solid var(--line-strong);
      display: grid;
      place-items: center;
      font-size: 12px;
      color: #fff;
      background: var(--surface);
    }
    .done .dot {
      background: var(--b-red);
      border-color: var(--b-red);
    }
    .now .dot {
      border-color: var(--b-red);
      box-shadow: 0 0 0 3px var(--b-red-soft);
    }
    .next {
      font-size: 12.5px;
      color: var(--ink-2);
      padding-top: 10px;
      border-top: 1px solid var(--line);
    }
    .d-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      height: 40px;
      border-radius: var(--r-pill);
      background: var(--b-red);
      color: #fff;
      font-size: 13px;
      font-weight: 600;
    }
    @media (prefers-reduced-motion: no-preference) {
      .detail {
        animation: in 0.35s var(--ease) both;
      }
    }
    @keyframes in {
      from {
        opacity: 0;
        transform: translateY(6px);
      }
    }
    @media (max-width: 700px) {
      .app {
        grid-template-columns: 1fr;
      }
      .rail {
        display: none;
      }
      .cols {
        grid-template-columns: 1fr;
      }
    }
  `,
})
export class BefilerDashboardDemo {
  protected readonly services = SERVICES;
  protected readonly nav = NAV;
  protected readonly id = signal(SERVICES[0].id);
  protected readonly sel = computed(() => SERVICES.find((s) => s.id === this.id())!);

  protected onKey(e: KeyboardEvent): void {
    const i = SERVICES.findIndex((s) => s.id === this.id());
    let n = i;
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') n = (i + 1) % SERVICES.length;
    else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') n = (i - 1 + SERVICES.length) % SERVICES.length;
    else if (e.key === 'Home') n = 0;
    else if (e.key === 'End') n = SERVICES.length - 1;
    else return;
    e.preventDefault();
    this.id.set(SERVICES[n].id);
    const list = e.currentTarget as HTMLElement;
    (list.children[n] as HTMLElement | undefined)?.focus();
  }
}
