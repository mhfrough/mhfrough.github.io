import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { phosphorArrowCounterClockwise, phosphorCheck } from '@ng-icons/phosphor-icons/regular';

/**
 * Hero mockup of the Finclore formation wizard's first step and its order summary (my own redraw, not a
 * screenshot). It follows the real rules: the entity type moves the recommendation (Wyoming for an LLC, Delaware
 * for a C-Corp), every line is the service price plus the state's filing fee, the registered agent for the first
 * year is included, and "Save and continue" stores the step so the order reopens where it was left. The $120
 * starting price is the public site's own; state fees and add-on prices are samples.
 */
type Entity = 'llc' | 'corp';
type AddOn = 'ein' | 'mail' | 'logo';

interface State {
  id: string;
  name: string;
  fee: Record<Entity, number>;
  best?: Entity;
}

const STATES: State[] = [
  { id: 'wy', name: 'Wyoming', fee: { llc: 100, corp: 100 }, best: 'llc' },
  { id: 'de', name: 'Delaware', fee: { llc: 110, corp: 109 }, best: 'corp' },
  { id: 'fl', name: 'Florida', fee: { llc: 125, corp: 70 } },
  { id: 'tx', name: 'Texas', fee: { llc: 300, corp: 300 } },
];

const ADD_ONS: { id: AddOn; t: string; price: number }[] = [
  { id: 'ein', t: 'EIN from the IRS', price: 99 },
  { id: 'mail', t: 'US mailing address', price: 49 },
  { id: 'logo', t: 'Logo design', price: 79 },
];

const STEPS = ['State', 'Company', 'Members', 'Agent', 'EIN', 'Services', 'Summary'];
const BASE = 120;

@Component({
  selector: 'mh-finclore-order',
  imports: [NgIcon],
  viewProviders: [provideIcons({ phosphorArrowCounterClockwise, phosphorCheck })],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="order card card--lift">
      <header class="o-head">
        <img src="/images/finclore/finclore-mark.svg" width="32" height="32" alt="" />
        <div>
          <h2>Form your company</h2>
          <p>Step <b class="mono">{{ step() + 1 }}</b> of 7, {{ steps[step()] }}</p>
        </div>
        <button type="button" class="reset" aria-label="Reset the sample order" (click)="reset()">
          <ng-icon name="phosphorArrowCounterClockwise" aria-hidden="true" />
        </button>
      </header>

      <ol class="bar" role="list" aria-label="Wizard progress">
        @for (s of steps; track s; let i = $index) {
          <li [class.done]="i < step()" [class.now]="i === step()">
            <span class="sr-only">{{ s }}{{ i < step() ? ', saved' : i === step() ? ', current' : '' }}</span>
          </li>
        }
      </ol>

      <div class="row">
        <span class="mono lbl" id="fc-entity">Entity type</span>
        <div class="seg" role="group" aria-labelledby="fc-entity">
          <button type="button" [attr.aria-pressed]="entity() === 'llc'" (click)="entity.set('llc')">LLC</button>
          <button type="button" [attr.aria-pressed]="entity() === 'corp'" (click)="entity.set('corp')">C-Corp</button>
        </div>
      </div>

      <fieldset class="states">
        <legend class="mono lbl">Where do you want to form it?</legend>
        <div class="st-grid">
          @for (s of states; track s.id) {
            <label class="st" [class.on]="state() === s.id">
              <input type="radio" name="fc-state" [value]="s.id" [checked]="state() === s.id" (change)="state.set(s.id)" />
              <span class="st-name">{{ s.name }}</span>
              <span class="st-fee mono">\${{ s.fee[entity()] }} state fee</span>
              @if (s.best === entity()) {
                <span class="best">Recommended</span>
              }
            </label>
          }
        </div>
      </fieldset>

      <div class="adds" role="group" aria-labelledby="fc-adds">
        <span class="mono lbl" id="fc-adds">Add to the order</span>
        <div class="chips">
          @for (a of addOns; track a.id) {
            <button type="button" class="chip" [attr.aria-pressed]="picked().includes(a.id)" (click)="toggle(a.id)">
              {{ a.t }} <span class="mono">+\${{ a.price }}</span>
            </button>
          }
        </div>
      </div>

      <div class="sum">
        <ul role="list">
          <li>
            <span>Company formation, {{ entity() === 'llc' ? 'LLC' : 'C-Corp' }}</span>
            <b class="mono">\${{ base }}</b>
          </li>
          <li class="fee">
            <span>{{ current().name }} filing fee</span>
            <b class="mono">\${{ current().fee[entity()] }}</b>
          </li>
          <li class="fee">
            <span>Registered agent, first year</span>
            <b class="mono">Included</b>
          </li>
          @for (a of chosen(); track a.id) {
            <li>
              <span>{{ a.t }}</span>
              <b class="mono">\${{ a.price }}</b>
            </li>
          }
        </ul>
        <div class="total">
          <span>Total</span>
          <b class="mono">\${{ total() }}</b>
        </div>
      </div>

      <button type="button" class="btn btn-solid go" (click)="save()">
        <ng-icon name="phosphorCheck" aria-hidden="true" /> Save and continue
      </button>
      <p class="mono sample" aria-live="polite">{{ note() }}</p>
    </div>
  `,
  styles: `
    :host {
      display: block;
    }
    .order {
      display: grid;
      gap: 14px;
      padding: 18px;
    }
    .o-head {
      display: flex;
      align-items: center;
      gap: 12px;

      img {
        width: 40px;
        height: 40px;
        padding: 5px;
        border-radius: 11px;
        background: var(--surface);
        border: 1px solid var(--line);
      }
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
    .bar {
      display: grid;
      grid-template-columns: repeat(7, minmax(0, 1fr));
      gap: 4px;

      li {
        height: 4px;
        border-radius: 2px;
        background: var(--surface-2);
        transition: background-color var(--t-base) var(--ease);

        &.done {
          background: var(--f-navy);
        }
        &.now {
          background: var(--f-red);
        }
      }
    }
    .lbl {
      display: block;
      font-size: 12px;
      color: var(--muted);
    }
    .row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      flex-wrap: wrap;

      .seg button {
        height: 32px;
        padding: 0 14px;
        font-size: 13px;
      }
    }
    .states {
      margin: 0;
      padding: 0;
      border: 0;
      min-width: 0;

      legend {
        padding: 0;
        margin-bottom: 8px;
      }
    }
    .st-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 6px;
    }
    .st {
      position: relative;
      display: grid;
      gap: 1px;
      min-height: 54px;
      padding: 8px 12px;
      border-radius: var(--r-inner);
      border: 1px solid var(--line);
      background: var(--surface);
      cursor: pointer;
      transition:
        border-color var(--t-base) var(--ease),
        background-color var(--t-base) var(--ease);

      &:hover {
        border-color: var(--line-strong);
      }
      &.on {
        border-color: var(--f-navy);
        background: var(--f-navy-soft);
      }
      &:has(input:focus-visible) {
        outline: 2px solid var(--focus);
        outline-offset: 2px;
      }
      input {
        position: absolute;
        opacity: 0;
        pointer-events: none;
      }
    }
    .st-name {
      font-size: 13.5px;
      font-weight: 600;
    }
    .st-fee {
      font-size: 12px;
      color: var(--muted);
    }
    .best {
      position: absolute;
      top: 8px;
      right: 8px;
      padding: 1px 7px;
      border-radius: 999px;
      font-size: 12px;
      font-weight: 500;
      background: var(--f-red-soft);
      color: var(--f-red);
    }
    .adds .lbl {
      margin-bottom: 8px;
    }
    .chips {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;

      .chip {
        min-height: 36px;
        font-size: 12.5px;
      }
      .mono {
        font-size: 12px;
        opacity: 0.75;
      }
    }
    .sum {
      padding: 10px 12px;
      border-radius: var(--r-inner);
      background: var(--surface-2);

      ul {
        display: grid;
        gap: 4px;
      }
      li,
      .total {
        display: flex;
        justify-content: space-between;
        gap: 12px;
        font-size: 12.5px;
      }
      li.fee {
        color: var(--muted);
      }
      b {
        font-weight: 500;
        white-space: nowrap;
      }
      .total {
        margin-top: 8px;
        padding-top: 8px;
        border-top: 1px solid var(--line-strong);
        font-size: 14px;
        font-weight: 600;

        b {
          font-weight: 600;
          color: var(--f-navy);
        }
      }
    }
    .go {
      justify-content: center;
    }
    .sample {
      font-size: 12px;
      color: var(--muted);
      min-height: 14px;
    }
    @media (max-width: 460px) {
      .order {
        padding: 14px;
      }
      .st-grid {
        grid-template-columns: 1fr;
      }
    }
  `,
})
export class FincloreOrderDemo {
  protected readonly states = STATES;
  protected readonly addOns = ADD_ONS;
  protected readonly steps = STEPS;
  protected readonly base = BASE;
  protected readonly entity = signal<Entity>('llc');
  protected readonly state = signal('wy');
  protected readonly picked = signal<AddOn[]>(['ein']);
  protected readonly step = signal(0);
  protected readonly note = signal('Sample prices. Pick a state, add a service, save.');

  protected readonly current = computed(() => STATES.find((s) => s.id === this.state()) ?? STATES[0]);
  protected readonly chosen = computed(() => ADD_ONS.filter((a) => this.picked().includes(a.id)));
  protected readonly total = computed(
    () => BASE + this.current().fee[this.entity()] + this.chosen().reduce((sum, a) => sum + a.price, 0),
  );

  protected toggle(id: AddOn): void {
    this.picked.update((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));
  }

  protected save(): void {
    const next = Math.min(this.step() + 1, STEPS.length - 1);
    this.step.set(next);
    this.note.set(
      next === STEPS.length - 1
        ? 'Every step saved. The summary is ready for payment.'
        : `Saved. Close the tab and this order reopens on step ${next + 1}, ${STEPS[next]}.`,
    );
  }

  protected reset(): void {
    this.entity.set('llc');
    this.state.set('wy');
    this.picked.set(['ein']);
    this.step.set(0);
    this.note.set('Sample order reset.');
  }
}
