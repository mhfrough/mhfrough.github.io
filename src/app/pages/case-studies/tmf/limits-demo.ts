import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { phosphorArrowCounterClockwise, phosphorArrowUp, phosphorCheckCircle, phosphorWarningCircle } from '@ng-icons/phosphor-icons/regular';

/**
 * The role limits screen, redrawn as my own mockup. As in the real settings: a role is assigned the loan
 * products it may sign, and for each one an amount that has to sit inside the product's own minimum and maximum.
 * The test line below runs the rule the approval desks use: assigned and within the amount, the desk shows
 * Approve; otherwise the loan goes up the chain. Sample roles, products and amounts.
 */
interface Product {
  id: string;
  name: string;
  min: number;
  max: number;
}

interface Grant {
  on: boolean;
  limit: number;
}

type RoleId = 'vo' | 'am' | 'rm' | 'gm';

const PRODUCTS: Product[] = [
  { id: 'agri', name: 'Agriculture', min: 20_000, max: 200_000 },
  { id: 'live', name: 'Livestock', min: 30_000, max: 150_000 },
  { id: 'ent', name: 'Small enterprise', min: 50_000, max: 500_000 },
];

const ROLES: { id: RoleId; t: string }[] = [
  { id: 'vo', t: 'Verification officer' },
  { id: 'am', t: 'Area manager' },
  { id: 'rm', t: 'Regional manager' },
  { id: 'gm', t: 'General manager' },
];

type Grants = Record<RoleId, Record<string, Grant>>;

const SEED: Grants = {
  vo: { agri: { on: true, limit: 30_000 }, live: { on: true, limit: 30_000 }, ent: { on: false, limit: 50_000 } },
  am: { agri: { on: true, limit: 60_000 }, live: { on: true, limit: 60_000 }, ent: { on: false, limit: 50_000 } },
  rm: { agri: { on: true, limit: 100_000 }, live: { on: true, limit: 100_000 }, ent: { on: true, limit: 100_000 } },
  gm: { agri: { on: true, limit: 200_000 }, live: { on: true, limit: 150_000 }, ent: { on: true, limit: 250_000 } },
};

const pkr = new Intl.NumberFormat('en-PK', { maximumFractionDigits: 0 });
const digits = (v: string): number => Number(v.replace(/[^0-9]/g, '') || 0);
const clone = (g: Grants): Grants => JSON.parse(JSON.stringify(g)) as Grants;

@Component({
  selector: 'mh-tmf-limits',
  imports: [NgIcon],
  viewProviders: [provideIcons({ phosphorArrowCounterClockwise, phosphorArrowUp, phosphorCheckCircle, phosphorWarningCircle })],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="lim card card--lift">
      <div class="lim-head">
        <span class="mono lbl head-lbl" aria-hidden="true">Role</span>
        <div class="seg" role="group" aria-label="Role">
          @for (r of roles; track r.id) {
            <button type="button" [attr.aria-pressed]="role() === r.id" (click)="role.set(r.id)">{{ r.t }}</button>
          }
        </div>
        <button type="button" class="reset" aria-label="Reset the sample limits" (click)="reset()">
          <ng-icon name="phosphorArrowCounterClockwise" aria-hidden="true" />
        </button>
      </div>

      <ul class="rows" role="list" [attr.aria-label]="'Products for the ' + roleName().toLowerCase()">
        @for (p of products; track p.id) {
          @let g = grants()[role()][p.id];
          @let err = errOf(p, g);
          <li [class.off]="!g.on">
            <label class="check">
              <input type="checkbox" [checked]="g.on" (change)="setOn(p.id, $any($event.target).checked)" />
              <span><b>{{ p.name }}</b><small class="mono">Rs {{ fmt(p.min) }} to {{ fmt(p.max) }}</small></span>
            </label>
            <div class="amt">
              <label class="sr-only" [for]="'tl-' + p.id">Limit for {{ p.name }}, Rs</label>
              <span class="pre mono" aria-hidden="true">Rs</span>
              <input
                [id]="'tl-' + p.id"
                class="input mono"
                inputmode="numeric"
                autocomplete="off"
                [disabled]="!g.on"
                [value]="fmt(g.limit)"
                (input)="setLimit(p.id, $any($event.target).value)"
                [attr.aria-invalid]="!!err"
                [attr.aria-describedby]="err ? 'tl-e-' + p.id : null"
              />
            </div>
            @if (err) {
              <p class="err" [id]="'tl-e-' + p.id"><ng-icon name="phosphorWarningCircle" aria-hidden="true" /> {{ err }}</p>
            }
          </li>
        }
      </ul>

      <div class="test">
        <p class="mono lbl">Try a loan at this desk</p>
        <div class="test-row">
          <div class="field">
            <label for="tl-tp">Product</label>
            <select id="tl-tp" class="select" [value]="testProduct()" (change)="testProduct.set($any($event.target).value)">
              @for (p of products; track p.id) {
                <option [value]="p.id">{{ p.name }}</option>
              }
            </select>
          </div>
          <div class="field">
            <label for="tl-ta">Amount, Rs</label>
            <input id="tl-ta" class="input mono" inputmode="numeric" autocomplete="off" [value]="fmt(testAmount())" (input)="testAmount.set(num($any($event.target).value))" />
          </div>
        </div>
        <p class="verdict" [attr.data-ok]="verdict().ok" aria-live="polite">
          <ng-icon [name]="verdict().ok ? 'phosphorCheckCircle' : 'phosphorArrowUp'" aria-hidden="true" />
          <span>{{ verdict().text }}</span>
        </p>
      </div>
    </div>
  `,
  styles: `
    :host {
      display: block;
    }
    .lim {
      display: grid;
      gap: 16px;
      padding: 22px;
    }
    .lim-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;

      .seg {
        flex-wrap: wrap;
        border-radius: 22px;
      }
      .seg button {
        height: 34px;
        padding: 0 13px;
        font-size: 13px;
      }
      .head-lbl {
        display: none;
      }

      /* Phones: four roles in a two by two grid on their own row, under a label and the reset */
      @media (max-width: 520px) {
        flex-wrap: wrap;

        .head-lbl {
          display: block;
          font-size: 12px;
          color: var(--muted);
        }
        .seg {
          order: 3;
          width: 100%;
          display: grid;
          grid-template-columns: 1fr 1fr;
          border-radius: 18px;
        }
        .seg button {
          height: auto;
          min-height: 40px;
          padding: 4px 8px;
          justify-content: center;
          text-align: center;
          line-height: 1.2;
          border-radius: 14px;
        }
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
    .rows {
      display: grid;
      gap: 8px;

      li {
        display: grid;
        grid-template-columns: minmax(0, 1fr) 200px;
        align-items: center;
        gap: 6px 16px;
        padding: 10px 12px 10px 14px;
        border-radius: var(--r-inner);
        border: 1px solid var(--line);
        background: var(--surface);
        transition: background var(--t-base) var(--ease);

        &.off {
          background: var(--bg);
        }
      }
      .check {
        align-items: center;
        min-height: 44px;

        input {
          margin: 0;
          accent-color: var(--t-sand-text);
        }
        b {
          display: block;
          font-size: 14px;
          font-weight: 600;
          color: var(--ink);
        }
        small {
          font-size: 12px;
          color: var(--muted);
        }
      }
      .off .check b {
        color: var(--muted);
      }
    }
    .amt {
      position: relative;

      .pre {
        position: absolute;
        left: 16px;
        top: 50%;
        transform: translateY(-50%);
        font-size: 12px;
        color: var(--muted);
        pointer-events: none;
      }
      .input {
        height: 44px;
        padding-left: 42px;
        font-size: 14px;
        text-align: right;
      }
      .input:disabled {
        opacity: 0.55;
        cursor: not-allowed;
      }
      .input[aria-invalid='true'] {
        border-color: var(--t-red-text);
      }
    }
    .err {
      grid-column: 1 / -1;
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 12.5px;
      color: var(--t-red-text);
    }
    .test {
      display: grid;
      gap: 10px;
      padding: 14px;
      border-radius: var(--r-inner);
      background: var(--surface-2);
    }
    .lbl {
      font-size: 12px;
      color: var(--muted);
    }
    .test-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;

      .input,
      .select {
        height: 44px;
        font-size: 14px;
        background: var(--surface);
      }
    }
    .verdict {
      display: flex;
      align-items: flex-start;
      gap: 8px;
      font-size: 14px;
      font-weight: 500;
      color: var(--t-sand-text);

      &[data-ok='true'] {
        color: var(--t-green-text);
      }
      ng-icon {
        font-size: 18px;
        flex-shrink: 0;
        margin-top: 1px;
      }
    }
    @media (max-width: 640px) {
      .lim {
        padding: 16px;
      }
      .rows li {
        grid-template-columns: 1fr;
      }
      .test-row {
        grid-template-columns: 1fr;
      }
    }
  `,
})
export class TmfLimitsDemo {
  protected readonly products = PRODUCTS;
  protected readonly roles = ROLES;
  protected readonly role = signal<RoleId>('am');
  protected readonly grants = signal<Grants>(clone(SEED));
  protected readonly testProduct = signal('agri');
  protected readonly testAmount = signal(80_000);

  protected readonly roleName = computed(() => ROLES.find((r) => r.id === this.role())!.t);

  protected readonly verdict = computed(() => {
    const p = PRODUCTS.find((x) => x.id === this.testProduct())!;
    const g = this.grants()[this.role()][p.id];
    const who = 'The ' + this.roleName().toLowerCase();
    const amt = this.testAmount();
    if (amt < p.min || amt > p.max) return { ok: false, text: `${p.name} lends Rs ${this.fmt(p.min)} to ${this.fmt(p.max)}; the calculator would stop this quote first.` };
    if (!g.on) return { ok: false, text: `${p.name} is not assigned to this role, so the loan goes up the chain.` };
    if (this.errOf(p, g)) return { ok: false, text: 'Fix the limit above first.' };
    if (amt > g.limit) return { ok: false, text: `Above the Rs ${this.fmt(g.limit)} limit. ${who} forwards it up.` };
    return { ok: true, text: `Within Rs ${this.fmt(g.limit)}. ${who} sees Approve.` };
  });

  protected fmt(n: number): string {
    return pkr.format(n);
  }

  protected num(v: string): number {
    return digits(v);
  }

  protected errOf(p: Product, g: Grant): string {
    if (!g.on) return '';
    return g.limit < p.min || g.limit > p.max ? `Between Rs ${this.fmt(p.min)} and Rs ${this.fmt(p.max)}.` : '';
  }

  protected setOn(id: string, on: boolean): void {
    const role = this.role();
    this.grants.update((g) => ({ ...g, [role]: { ...g[role], [id]: { ...g[role][id], on } } }));
  }

  protected setLimit(id: string, v: string): void {
    const role = this.role();
    const limit = digits(v);
    this.grants.update((g) => ({ ...g, [role]: { ...g[role], [id]: { ...g[role][id], limit } } }));
  }

  protected reset(): void {
    this.grants.set(clone(SEED));
    this.role.set('am');
    this.testProduct.set('agri');
    this.testAmount.set(80_000);
  }
}
