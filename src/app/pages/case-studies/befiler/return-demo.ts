import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { phosphorArrowLeft, phosphorArrowRight, phosphorCheck, phosphorCheckCircle, phosphorSealCheck } from '@ng-icons/phosphor-icons/regular';

/**
 * Hero mockup of a Befiler return (my own design, not a screenshot). Shows the idea that made the real flow
 * work: the steps are computed from what the customer earns. Toggle income sources and the step list rebuilds.
 * Figures are samples, not tax advice or a calculation.
 */
type SourceId = 'salary' | 'rent' | 'freelance' | 'savings';

interface Source {
  id: SourceId;
  label: string;
  rows: { k: string; v: number }[];
}

const SOURCES: Source[] = [
  {
    id: 'salary',
    label: 'Salary',
    rows: [
      { k: 'Annual salary', v: 2_400_000 },
      { k: 'Tax deducted by employer', v: 165_000 },
    ],
  },
  { id: 'rent', label: 'Rent', rows: [{ k: 'Annual rent received', v: 600_000 }] },
  { id: 'freelance', label: 'Freelance', rows: [{ k: 'Foreign remittances', v: 1_200_000 }] },
  { id: 'savings', label: 'Profit on savings', rows: [{ k: 'Profit on deposits', v: 85_000 }] },
];

type Step = { kind: 'personal' | 'sources' | 'wealth' | 'review' | 'done' } | { kind: 'income'; source: Source };

const pkr = new Intl.NumberFormat('en-PK', { maximumFractionDigits: 0 });

@Component({
  selector: 'mh-befiler-return',
  imports: [NgIcon],
  viewProviders: [provideIcons({ phosphorArrowLeft, phosphorArrowRight, phosphorCheck, phosphorCheckCircle, phosphorSealCheck })],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="card card--lift ret">
      <header class="ret-head">
        <img src="/images/befiler/befiler-icon.webp" width="36" height="36" alt="" />
        <div>
          <h2>Tax return 2026</h2>
          <p>Sample taxpayer, resident</p>
        </div>
        <span class="state" [class.filed]="isDone()">{{ isDone() ? 'Filed' : 'Draft' }}</span>
      </header>

      <div class="ret-body">
        <ol class="steps" role="list" aria-label="Return steps">
          @for (s of steps(); track label(s); let i = $index) {
            <li>
              <button
                type="button"
                [class.done]="i < at()"
                [attr.aria-current]="i === at() ? 'step' : null"
                (click)="at.set(i)"
              >
                <span class="tick" aria-hidden="true">
                  @if (i < at()) {
                    <ng-icon name="phosphorCheck" />
                  }
                </span>
                {{ label(s) }}
              </button>
            </li>
          }
        </ol>

        <div class="panel" aria-live="polite">
          @let s = current();
          <h3>{{ label(s) }}</h3>
          @switch (s.kind) {
            @case ('personal') {
              <dl class="rows">
                <div><dt>CNIC</dt><dd class="mono">42101 0000000 0</dd></div>
                <div><dt>Residency</dt><dd>Resident</dd></div>
                <div><dt>Occupation</dt><dd>Salaried</dd></div>
              </dl>
            }
            @case ('sources') {
              <p class="hint">Pick what you earned. The steps on the left follow.</p>
              <div class="chips" role="group" aria-label="Income sources">
                @for (src of sources; track src.id) {
                  <button type="button" class="chip" [attr.aria-pressed]="picked().has(src.id)" (click)="toggle(src.id)">
                    {{ src.label }}
                  </button>
                }
              </div>
            }
            @case ('income') {
              @if (s.kind === 'income') {
                <dl class="rows">
                  @for (r of s.source.rows; track r.k) {
                    <div><dt>{{ r.k }}</dt><dd class="mono">Rs. {{ fmt(r.v) }}</dd></div>
                  }
                </dl>
              }
            }
            @case ('wealth') {
              <dl class="rows">
                <div><dt>Property</dt><dd>1 house</dd></div>
                <div><dt>Vehicles</dt><dd>1 car</dd></div>
                <div><dt>Bank accounts</dt><dd>2 accounts</dd></div>
                <div><dt>Opening vs closing wealth</dt><dd class="ok"><ng-icon name="phosphorCheckCircle" aria-hidden="true" /> Reconciled</dd></div>
              </dl>
            }
            @case ('review') {
              <dl class="rows">
                <div><dt>Income sources</dt><dd>{{ picked().size }}</dd></div>
                <div><dt>Total declared</dt><dd class="mono">Rs. {{ fmt(total()) }}</dd></div>
                <div><dt>Wealth statement</dt><dd class="ok"><ng-icon name="phosphorCheckCircle" aria-hidden="true" /> Complete</dd></div>
              </dl>
            }
            @case ('done') {
              <div class="done-state">
                <span class="seal" aria-hidden="true"><ng-icon name="phosphorSealCheck" /></span>
                <p><b>Submitted for filing</b></p>
                <p class="mono small">Case in queue, lawyer review next</p>
              </div>
            }
          }
          <p class="sample mono">Sample figures</p>
        </div>
      </div>

      <footer class="ret-foot">
        <div class="bar" aria-hidden="true"><i [style.transform]="'scaleX(' + progress() + ')'"></i></div>
        <div class="acts">
          <button type="button" class="btn btn-ghost btn-sm" [disabled]="at() === 0" (click)="at.set(at() - 1)">
            <ng-icon name="phosphorArrowLeft" aria-hidden="true" /> Back
          </button>
          <button type="button" class="btn btn-solid btn-sm" (click)="next()">
            {{ isDone() ? 'Start over' : current().kind === 'review' ? 'Submit return' : 'Next' }}
            @if (!isDone()) {
              <ng-icon name="phosphorArrowRight" aria-hidden="true" />
            }
          </button>
        </div>
      </footer>
    </div>
  `,
  styles: `
    :host {
      display: block;
    }
    .ret {
      padding: 0;
      overflow: hidden;
    }
    .ret-head {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px 18px;
      border-bottom: 1px solid var(--line);
    }
    .ret-head img {
      border-radius: 10px;
    }
    h2 {
      font-size: 15px;
      line-height: 1.3;
      letter-spacing: -0.01em;
    }
    .ret-head p {
      font-size: 12.5px;
      color: var(--muted);
    }
    .state {
      margin-left: auto;
      padding: 3px 10px;
      border-radius: 999px;
      font-size: 12px;
      font-weight: 600;
      background: var(--surface-2);
      color: var(--ink-2);
    }
    .state.filed {
      background: var(--accent-soft);
      color: var(--b-red-text, var(--accent));
    }
    .ret-body {
      display: grid;
      grid-template-columns: 172px minmax(0, 1fr);
      min-height: 268px;
    }
    .steps {
      padding: 10px 8px;
      border-right: 1px solid var(--line);
      background: var(--bg);
      display: grid;
      align-content: start;
      gap: 2px;
    }
    .steps button {
      width: 100%;
      display: flex;
      align-items: center;
      gap: 8px;
      min-height: 30px;
      padding: 4px 10px;
      border-radius: var(--r-pill);
      font-size: 12.5px;
      text-align: left;
      color: var(--muted);
      transition:
        background var(--t-fast) var(--ease),
        color var(--t-fast) var(--ease);
    }
    .steps button:hover {
      color: var(--ink);
    }
    .steps button.done {
      color: var(--ink-2);
    }
    .steps button[aria-current] {
      background: var(--surface);
      color: var(--ink);
      font-weight: 600;
      box-shadow: 0 1px 3px rgb(0 0 0 / 0.08);
    }
    .tick {
      width: 16px;
      height: 16px;
      flex-shrink: 0;
      border-radius: 50%;
      border: 1.5px solid var(--line-strong);
      display: grid;
      place-items: center;
      font-size: 12px;
    }
    .done .tick {
      background: var(--b-red, var(--accent));
      border-color: var(--b-red, var(--accent));
      color: #fff;
    }
    [aria-current] .tick {
      border-color: var(--b-red, var(--accent));
    }
    .panel {
      position: relative;
      padding: 16px 18px 30px;
    }
    h3 {
      font-size: 15px;
      margin-bottom: 12px;
      letter-spacing: -0.01em;
    }
    .hint {
      font-size: 13px;
      color: var(--ink-2);
      margin-bottom: 12px;
    }
    .chips {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }
    .chip[aria-pressed='true'] {
      background: var(--b-red, var(--cta));
      border-color: var(--b-red, var(--cta));
      color: #fff;
    }
    .rows {
      display: grid;
      gap: 8px;
      margin: 0;
    }
    .rows div {
      display: flex;
      justify-content: space-between;
      gap: 12px;
      padding: 9px 12px;
      border-radius: var(--r-inner);
      background: var(--surface-2);
      font-size: 13px;
    }
    dt {
      color: var(--muted);
    }
    dd {
      margin: 0;
      color: var(--ink);
      font-weight: 500;
      text-align: right;
    }
    dd.mono {
      font-size: 12.5px;
    }
    .ok {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      color: #137a3a;
    }
    .done-state {
      display: grid;
      justify-items: center;
      text-align: center;
      gap: 4px;
      padding-top: 18px;
    }
    .seal {
      width: 52px;
      height: 52px;
      border-radius: 50%;
      display: grid;
      place-items: center;
      font-size: 28px;
      background: var(--accent-soft);
      color: var(--b-red-text, var(--accent));
      margin-bottom: 6px;
    }
    @media (prefers-reduced-motion: no-preference) {
      .seal {
        animation: seal 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
      }
    }
    @keyframes seal {
      from {
        transform: scale(0.4);
        opacity: 0;
      }
    }
    .small {
      font-size: 12px;
      color: var(--muted);
    }
    .sample {
      position: absolute;
      right: 18px;
      bottom: 10px;
      font-size: 12px;
      color: var(--muted);
    }
    .ret-foot {
      padding: 0 18px 16px;
    }
    .bar {
      height: 4px;
      border-radius: 999px;
      background: var(--surface-2);
      overflow: hidden;
      margin-bottom: 14px;
    }
    .bar i {
      display: block;
      height: 100%;
      background: var(--b-red, var(--accent));
      transform-origin: left;
      transition: transform 0.5s var(--ease);
    }
    .acts {
      display: flex;
      justify-content: space-between;
      gap: 8px;
    }
    @media (max-width: 520px) {
      .ret-body {
        grid-template-columns: 1fr;
      }
      .steps {
        display: flex;
        overflow-x: auto;
        border-right: 0;
        border-bottom: 1px solid var(--line);
        scrollbar-width: none;
      }
      .steps li {
        flex-shrink: 0;
      }
      .steps button {
        white-space: nowrap;
      }
    }
  `,
})
export class BefilerReturnDemo {
  protected readonly sources = SOURCES;
  protected readonly picked = signal<ReadonlySet<SourceId>>(new Set<SourceId>(['salary', 'rent']));
  protected readonly at = signal(1);

  protected readonly steps = computed<Step[]>(() => [
    { kind: 'personal' },
    { kind: 'sources' },
    ...SOURCES.filter((s) => this.picked().has(s.id)).map((source) => ({ kind: 'income' as const, source })),
    { kind: 'wealth' },
    { kind: 'review' },
    { kind: 'done' },
  ]);
  protected readonly current = computed(() => this.steps()[Math.min(this.at(), this.steps().length - 1)]);
  protected readonly isDone = computed(() => this.current().kind === 'done');
  protected readonly progress = computed(() => this.at() / (this.steps().length - 1));
  protected readonly total = computed(() =>
    SOURCES.filter((s) => this.picked().has(s.id)).reduce((sum, s) => sum + s.rows[0].v, 0),
  );

  protected label(s: Step): string {
    switch (s.kind) {
      case 'personal':
        return 'Personal info';
      case 'sources':
        return 'Income sources';
      case 'income':
        return s.source.label;
      case 'wealth':
        return 'Wealth statement';
      case 'review':
        return 'Review';
      case 'done':
        return 'Submitted';
    }
  }

  protected toggle(id: SourceId): void {
    const next = new Set(this.picked());
    if (next.has(id)) {
      if (next.size === 1) return; // a return needs at least one source
      next.delete(id);
    } else next.add(id);
    this.picked.set(next);
  }

  protected next(): void {
    if (this.isDone()) this.at.set(0);
    else this.at.set(this.at() + 1);
  }

  protected fmt(v: number): string {
    return pkr.format(v);
  }
}
