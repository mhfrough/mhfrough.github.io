import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { phosphorArrowCounterClockwise, phosphorArrowRight, phosphorCheck, phosphorCircleNotch } from '@ng-icons/phosphor-icons/regular';

/**
 * Hero mockup of a new firm signing up (my own redraw, not a screenshot). It follows the real tenant-management
 * flow: register the firm (firm name, owner, time zone), verify the email with a code, pick a plan (a trial, or a
 * paid plan through a hosted checkout), then cross into the firm's own workspace with a one-time token, where the
 * first sign-in asks about the firm. Prices are the public ones on epractise.com; the firm is invented and the
 * code is shown on screen because no email is sent.
 */
type Step = 0 | 1 | 2 | 3;
type Plan = 'trial' | 'growth' | 'pro';

const STEPS = ['Firm', 'Verify', 'Plan', 'Workspace'];
const ZONES = ['Eastern (US)', 'Central (US)', 'Mountain (US)', 'Pacific (US)'];
const CODE = '482913';
const PLANS: { id: Plan; t: string; price: string; s: string }[] = [
  { id: 'trial', t: 'Free trial', price: '$0', s: 'No card needed' },
  { id: 'growth', t: 'Growth', price: '$10', s: 'Per month' },
  { id: 'pro', t: 'Pro', price: '$11', s: 'Per month, pipelines' },
];
const TASKS = ['Subscription started', 'Workspace created for the firm', 'Signed in with a one-time token', 'First sign-in: about your firm'];
const MENU = ['Clients', 'Workflow', 'Documents', 'Organizers', 'Invoices', 'Templates'];

@Component({
  selector: 'mh-epractise-provision',
  imports: [NgIcon],
  viewProviders: [provideIcons({ phosphorArrowCounterClockwise, phosphorArrowRight, phosphorCheck, phosphorCircleNotch })],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="prov card card--lift">
      <header class="p-head">
        <img src="/images/epractise/epractise-mark.webp" width="32" height="32" alt="" />
        <div>
          <h2>New firm workspace</h2>
          <p class="mono">Step {{ step() + 1 }} of 4</p>
        </div>
        <button type="button" class="reset" aria-label="Start the sign-up again" (click)="reset()">
          <ng-icon name="phosphorArrowCounterClockwise" aria-hidden="true" />
        </button>
      </header>

      <ol class="steps" role="list" aria-label="Sign-up steps">
        @for (s of steps; track s; let i = $index) {
          <li [class.on]="i === step()" [class.done]="i < step()" [attr.aria-current]="i === step() ? 'step' : null">
            <span class="n mono" aria-hidden="true">
              @if (i < step()) { <ng-icon name="phosphorCheck" /> } @else { {{ i + 1 }} }
            </span>
            {{ s }}
          </li>
        }
      </ol>

      @switch (step()) {
        @case (0) {
          <form class="pane" (submit)="register($event)" novalidate>
            <div class="field">
              <label class="field__label" for="ep-firm">Firm name</label>
              <input
                id="ep-firm"
                class="input"
                autocomplete="off"
                [value]="firm()"
                (input)="firm.set($any($event.target).value)"
                [attr.aria-invalid]="firmError() ? 'true' : null"
                [attr.aria-describedby]="firmError() ? 'ep-firm-err' : null"
              />
              @if (firmError()) {
                <p class="field__error" id="ep-firm-err">Enter the firm’s name, at least 2 letters.</p>
              }
            </div>
            <div class="field">
              <label class="field__label" for="ep-zone">Time zone</label>
              <select id="ep-zone" class="select" [value]="zone()" (change)="zone.set($any($event.target).value)">
                @for (z of zones; track z) {
                  <option [value]="z">{{ z }}</option>
                }
              </select>
            </div>
            <button type="submit" class="btn btn-solid">Create account <ng-icon name="phosphorArrowRight" aria-hidden="true" /></button>
          </form>
        }
        @case (1) {
          <form class="pane" (submit)="verify($event)" novalidate>
            <div class="field">
              <label class="field__label" for="ep-code">Code from your email</label>
              <input
                id="ep-code"
                class="input mono code"
                inputmode="numeric"
                maxlength="6"
                autocomplete="one-time-code"
                [value]="code()"
                (input)="code.set($any($event.target).value)"
                [attr.aria-invalid]="codeError() ? 'true' : null"
                aria-describedby="ep-code-hint"
              />
              <p class="field__hint" id="ep-code-hint">
                @if (codeError()) {
                  <span class="err">That code does not match.</span>
                }
                Sample code: <b class="mono">{{ sample }}</b>
                <button type="button" class="link" (click)="code.set(sample)">Fill it in</button>
              </p>
            </div>
            <button type="submit" class="btn btn-solid">Verify email <ng-icon name="phosphorArrowRight" aria-hidden="true" /></button>
          </form>
        }
        @case (2) {
          <div class="pane">
            <div class="plans" role="radiogroup" aria-label="Plan">
              @for (p of plans; track p.id) {
                <button type="button" role="radio" class="plan" [attr.aria-checked]="plan() === p.id" (click)="plan.set(p.id)">
                  <b>{{ p.t }}</b>
                  <span class="price">{{ p.price }}</span>
                  <small>{{ p.s }}</small>
                </button>
              }
            </div>
            <p class="small">
              {{ plan() === 'trial' ? 'The trial starts at once, no checkout.' : 'A paid plan goes through a hosted checkout, then comes back here.' }}
            </p>
            <button type="button" class="btn btn-solid" (click)="provision()">
              {{ plan() === 'trial' ? 'Start free trial' : 'Continue to checkout' }} <ng-icon name="phosphorArrowRight" aria-hidden="true" />
            </button>
          </div>
        }
        @case (3) {
          <div class="pane">
            <ul class="tasks" role="list">
              @for (t of tasks; track t; let i = $index) {
                <li [class.done]="i < doneCount()" [class.run]="i === doneCount()">
                  <span class="ic" aria-hidden="true">
                    @if (i < doneCount()) { <ng-icon name="phosphorCheck" /> } @else if (i === doneCount()) { <ng-icon name="phosphorCircleNotch" class="spin" /> }
                  </span>
                  {{ t }}
                </li>
              }
            </ul>
            @if (ready()) {
              <div class="ws">
                <div class="ws-top">
                  <span class="ws-mark mono" aria-hidden="true">{{ initials() }}</span>
                  <b>{{ firmName() }}</b>
                  <span class="status mono">{{ plan() === 'trial' ? 'In trial' : 'Active' }}</span>
                </div>
                <ul class="ws-menu" role="list" aria-label="Workspace menu">
                  @for (m of menu; track m) {
                    <li>{{ m }}</li>
                  }
                </ul>
              </div>
            }
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
    .prov {
      display: grid;
      gap: 14px;
      padding: 18px;
    }
    .p-head {
      display: flex;
      align-items: center;
      gap: 12px;
      padding-bottom: 12px;
      border-bottom: 1px solid var(--line);

      img {
        border-radius: 8px;
      }
      div {
        flex: 1;
      }
      h2 {
        font-size: 16px;
      }
      p {
        font-size: 12px;
        color: var(--muted);
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
    .steps {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 6px;

      li {
        display: flex;
        align-items: center;
        gap: 7px;
        min-width: 0;
        font-size: 12.5px;
        font-weight: 500;
        color: var(--muted);
      }
      .n {
        display: grid;
        place-items: center;
        width: 24px;
        height: 24px;
        flex-shrink: 0;
        border-radius: 50%;
        border: 1px solid var(--line-strong);
        font-size: 12px;
      }
      .on {
        color: var(--ink);
      }
      .on .n {
        background: var(--e-blue);
        border-color: var(--e-blue);
        color: #fff;
      }
      .done .n {
        background: var(--e-blue-soft);
        border-color: var(--e-blue-soft);
        color: var(--e-blue-text);
      }
    }
    .pane {
      display: grid;
      gap: 12px;
      min-height: 232px;
      align-content: start;

      > .btn {
        justify-self: start;
      }
    }
    .code {
      letter-spacing: 0.3em;
      max-width: 220px;
    }
    .field__hint {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 4px 8px;

      .err {
        width: 100%;
        color: var(--e-red-text);
      }
    }
    .link {
      min-height: 32px;
      color: var(--e-blue-text);
      font-weight: 500;
      text-decoration: underline;
      text-underline-offset: 2px;
    }
    .plans {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 8px;
    }
    .plan {
      display: grid;
      gap: 2px;
      justify-items: start;
      padding: 12px;
      border-radius: var(--r-inner);
      border: 1px solid var(--line);
      background: var(--surface);
      text-align: left;
      transition: border-color var(--t-base) var(--ease);

      b {
        font-size: 13.5px;
      }
      .price {
        font-size: 22px;
        font-weight: 600;
        letter-spacing: -0.03em;
      }
      small {
        font-size: 12px;
        color: var(--muted);
      }
      &[aria-checked='true'] {
        border-color: var(--e-blue);
        box-shadow: 0 0 0 1px var(--e-blue);
        background: var(--e-blue-soft);
      }
    }
    .small {
      font-size: 13px;
      color: var(--muted);
    }
    .tasks {
      display: grid;
      gap: 8px;

      li {
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: 13.5px;
        color: var(--muted);
      }
      .ic {
        display: grid;
        place-items: center;
        width: 22px;
        height: 22px;
        flex-shrink: 0;
        border-radius: 50%;
        border: 1px solid var(--line);
        font-size: 13px;
      }
      .done {
        color: var(--ink);
      }
      .done .ic {
        background: var(--e-green-soft);
        border-color: var(--e-green-soft);
        color: var(--e-green-text);
      }
      .run .ic {
        border-color: var(--e-blue);
        color: var(--e-blue-text);
      }
    }
    @media (prefers-reduced-motion: no-preference) {
      .spin {
        animation: spin 0.9s linear infinite;
      }
    }
    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }
    .ws {
      display: grid;
      gap: 10px;
      padding: 12px;
      border-radius: var(--r-inner);
      background: var(--e-night);
      color: var(--n-ink);
    }
    .ws-top {
      display: flex;
      align-items: center;
      gap: 10px;

      b {
        flex: 1;
        min-width: 0;
        font-size: 14px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }
    .ws-mark {
      display: grid;
      place-items: center;
      width: 28px;
      height: 28px;
      border-radius: 8px;
      background: var(--e-blue);
      color: #fff;
      font-size: 12px;
    }
    .status {
      padding: 2px 9px;
      border-radius: 999px;
      background: var(--e-green-soft);
      color: var(--e-green-text);
      font-size: 12px;
    }
    .ws-menu {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;

      li {
        padding: 3px 9px;
        border-radius: 999px;
        border: 1px solid var(--e-night-line);
        font-size: 12px;
        color: var(--n-muted);
      }
    }
    .sample {
      font-size: 12px;
      color: var(--muted);
      min-height: 14px;
    }
    @media (max-width: 460px) {
      .prov {
        padding: 14px;
      }
      .steps {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
      .plans {
        grid-template-columns: 1fr;
      }
    }
  `,
})
export class EpractiseProvisionDemo {
  protected readonly steps = STEPS;
  protected readonly zones = ZONES;
  protected readonly plans = PLANS;
  protected readonly tasks = TASKS;
  protected readonly menu = MENU;
  protected readonly sample = CODE;

  protected readonly step = signal<Step>(0);
  protected readonly firm = signal('Harbor Lane Tax');
  protected readonly zone = signal(ZONES[0]);
  protected readonly code = signal('');
  protected readonly plan = signal<Plan>('trial');
  protected readonly firmError = signal(false);
  protected readonly codeError = signal(false);
  protected readonly doneCount = signal(0);
  protected readonly note = signal('Sample sign-up. Nothing is sent.');

  protected readonly firmName = computed(() => this.firm().trim() || 'Your firm');
  protected readonly initials = computed(() =>
    this.firmName()
      .split(/\s+/)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase() ?? '')
      .join(''),
  );
  protected readonly ready = computed(() => this.doneCount() >= TASKS.length);

  private timer: ReturnType<typeof setTimeout> | undefined;

  constructor() {
    inject(DestroyRef).onDestroy(() => clearTimeout(this.timer));
  }

  protected register(e: Event): void {
    e.preventDefault();
    const ok = this.firm().trim().length >= 2;
    this.firmError.set(!ok);
    if (!ok) return;
    this.step.set(1);
    this.note.set(`Account created for ${this.firmName()}, ${this.zone()}. A code is on its way.`);
  }

  protected verify(e: Event): void {
    e.preventDefault();
    const ok = this.code().replace(/\s/g, '') === CODE;
    this.codeError.set(!ok);
    if (!ok) return;
    this.step.set(2);
    this.note.set('Email verified. Pick a plan.');
  }

  /** Ticks the provisioning list one task at a time; all at once when the visitor prefers reduced motion. */
  protected provision(): void {
    this.step.set(3);
    this.doneCount.set(0);
    this.note.set(this.plan() === 'trial' ? 'Starting the trial.' : 'Back from checkout. Setting up.');
    const instant = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (instant) return this.finish();
    const tick = () => {
      this.doneCount.update((n) => n + 1);
      if (this.doneCount() < TASKS.length) this.timer = setTimeout(tick, 650);
      else this.finish();
    };
    this.timer = setTimeout(tick, 650);
  }

  private finish(): void {
    this.doneCount.set(TASKS.length);
    this.note.set(`${this.firmName()} has its own workspace. Its first client is next.`);
  }

  protected reset(): void {
    clearTimeout(this.timer);
    this.step.set(0);
    this.firm.set('Harbor Lane Tax');
    this.zone.set(ZONES[0]);
    this.code.set('');
    this.plan.set('trial');
    this.firmError.set(false);
    this.codeError.set(false);
    this.doneCount.set(0);
    this.note.set('Sample sign-up reset.');
  }
}
