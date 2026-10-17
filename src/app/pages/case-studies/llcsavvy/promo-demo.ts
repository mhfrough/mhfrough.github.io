import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { phosphorArrowCounterClockwise } from '@ng-icons/phosphor-icons/regular';

/**
 * The back office's promo code form and the cart it changes, as my own working mockup. Same shape as the original:
 * a code, an active date and an expiry date (each date input bounded by the other), an on/off status, and a table
 * of products where each ticked product gets its own promo price. The customer's cart sends only the code; the
 * server answers with the repriced lines, which the right-hand panel stands in for. The code, dates, prices and
 * the rupee rate are invented; the original's promo types came from the API and are left out.
 */
interface Product {
  id: string;
  name: string;
  base: number;
  fee: number;
  inCart: boolean;
}

const PRODUCTS: Product[] = [
  { id: 'llc', name: 'Company formation', base: 102, fee: 100, inCart: true },
  { id: 'ein', name: 'EIN', base: 99, fee: 0, inCart: true },
  { id: 'mail', name: 'US mailing address', base: 49, fee: 0, inCart: true },
  { id: 'annual', name: 'Annual report filing', base: 49, fee: 0, inCart: false },
];

const SEED = {
  code: 'SAVVY24',
  active: '2024-07-01',
  expire: '2024-07-31',
  on: true,
  today: '2024-07-24',
  picked: { llc: true, ein: true, mail: false, annual: false } as Record<string, boolean>,
  price: { llc: 82, ein: 79, mail: 39, annual: 39 } as Record<string, number>,
};

const RATE = 278.4; // sample PKR per USD

const fmtDate = (iso: string) => {
  const [y, m, d] = iso.split('-').map(Number);
  if (!y || !m || !d) return iso;
  return `${d} ${['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][m - 1]} ${y}`;
};

@Component({
  selector: 'mh-llcsavvy-promo',
  imports: [NgIcon],
  viewProviders: [provideIcons({ phosphorArrowCounterClockwise })],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="pr">
      <form class="card editor" (submit)="$event.preventDefault()" aria-labelledby="lpr-t">
        <div class="ed-head">
          <h3 id="lpr-t">Promo code</h3>
          <button
            type="button"
            class="status"
            [class.off]="!on()"
            [attr.aria-pressed]="on()"
            (click)="on.set(!on())"
          >
            {{ on() ? 'Active' : 'Inactive' }}
          </button>
          <button type="button" class="reset" aria-label="Reset the sample promo code" (click)="reset()">
            <ng-icon name="phosphorArrowCounterClockwise" aria-hidden="true" />
          </button>
        </div>

        <div class="grid">
          <div class="field wide">
            <label class="field__label" for="lpr-code">Code</label>
            <input id="lpr-code" class="input mono up" [value]="code()" (input)="setCode($any($event.target))" />
          </div>
          <div class="field">
            <label class="field__label" for="lpr-a">Active from</label>
            <input id="lpr-a" class="input mono" type="date" [value]="active()" [max]="expire()" (input)="active.set($any($event.target).value)" />
          </div>
          <div class="field">
            <label class="field__label" for="lpr-e">Expires</label>
            <input
              id="lpr-e"
              class="input mono"
              type="date"
              [value]="expire()"
              [min]="active()"
              [attr.aria-invalid]="!datesOk()"
              [attr.aria-describedby]="datesOk() ? null : 'lpr-e-err'"
              (input)="expire.set($any($event.target).value)"
            />
            @if (!datesOk()) {
              <span class="field__error" id="lpr-e-err">Must be on or after the active date</span>
            }
          </div>
        </div>

        <table class="prods">
          <caption class="sr-only">Products this code covers, with their promo prices</caption>
          <thead>
            <tr>
              <th scope="col">Product</th>
              <th scope="col" class="r">Price</th>
              <th scope="col" class="r">Promo price</th>
            </tr>
          </thead>
          <tbody>
            @for (p of products; track p.id) {
              <tr [class.on]="picked()[p.id]">
                <td>
                  <label class="pick">
                    <input type="checkbox" [checked]="picked()[p.id]" (change)="toggle(p.id)" />
                    <span>{{ p.name }}</span>
                  </label>
                </td>
                <td class="r mono muted">\${{ p.base }}</td>
                <td class="r">
                  <label class="sr-only" [for]="'lpr-p-' + p.id">Promo price for {{ p.name }}</label>
                  <input
                    class="input mono amt"
                    type="number"
                    min="0"
                    inputmode="numeric"
                    [id]="'lpr-p-' + p.id"
                    [value]="price()[p.id]"
                    [disabled]="!picked()[p.id]"
                    (input)="setPrice(p.id, $any($event.target).value)"
                  />
                </td>
              </tr>
            }
          </tbody>
        </table>
      </form>

      <div class="panel">
        <div class="p-head">
          <span class="mono">Customer cart</span>
          <label class="today">
            <span class="mono">Cart date</span>
            <input class="mono" type="date" [value]="today()" (input)="today.set($any($event.target).value)" />
          </label>
        </div>

        <p class="sent mono">PUT cart · {{ '{' }} promoCode: "{{ code() || '…' }}" {{ '}' }}</p>

        <ul class="lines" role="list">
          @for (l of lines(); track l.id) {
            <li>
              <span class="n">{{ l.name }}@if (l.fee) {<small class="mono">+ \${{ l.fee }} state fee</small>}</span>
              <span class="v mono">
                @if (l.now !== l.base) {
                  <s>\${{ l.base }}</s>
                }
                <b [class.cut]="l.now !== l.base">\${{ l.now }}</b>
              </span>
            </li>
          }
        </ul>

        <div class="tot">
          <span>Total</span>
          <span class="mono"><b>\${{ total() }}</b><small>Rs {{ rupees() }}</small></span>
        </div>

        <p class="verdict mono" [class.good]="result().ok" aria-live="polite">{{ result().msg }}</p>
      </div>
    </div>
  `,
  styles: `
    :host {
      display: block;
    }
    .pr {
      display: grid;
      grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr);
      gap: 16px;
      align-items: start;
    }
    .editor {
      display: grid;
      gap: 14px;
      padding: 18px;
    }
    .ed-head {
      display: flex;
      align-items: center;
      gap: 10px;

      h3 {
        flex: 1;
        font-size: 15px;
      }
    }
    .status {
      min-height: 32px;
      padding: 0 14px;
      border-radius: 999px;
      font-size: 12.5px;
      font-weight: 500;
      background: var(--l-green-soft);
      color: var(--l-green-text);

      &.off {
        background: var(--l-red-soft);
        color: var(--l-red);
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
    .grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 10px;

      .wide {
        grid-column: 1 / -1;
      }
    }
    .field {
      display: grid;
      gap: 4px;
      min-width: 0;
      align-content: start;

      .input {
        height: 44px;
        font-size: 13.5px;
        background: var(--surface);
        min-width: 0;
      }
    }
    .up {
      text-transform: uppercase;
      letter-spacing: 0.06em;
    }
    .field__error {
      font-size: 12px;
      color: var(--l-red);
    }
    .prods {
      width: 100%;
      border-collapse: collapse;
      font-size: 13px;

      th {
        padding: 0 4px 6px;
        font-size: 12px;
        font-weight: 500;
        color: var(--muted);
        text-align: left;
        border-bottom: 1px solid var(--line);
      }
      td {
        padding: 4px;
        border-bottom: 1px solid var(--line);
      }
      tr.on td {
        background: var(--l-navy-soft);
      }
      tr.on td:first-child {
        border-radius: 10px 0 0 10px;
      }
      tr.on td:last-child {
        border-radius: 0 10px 10px 0;
      }
      .r {
        text-align: right;
      }
      .muted {
        color: var(--muted);
      }
    }
    .pick {
      display: flex;
      align-items: center;
      gap: 10px;
      min-height: 44px;
      padding-left: 6px;
      cursor: pointer;

      input {
        width: 18px;
        height: 18px;
        flex-shrink: 0;
        accent-color: var(--l-navy);
      }
    }
    .amt {
      width: 84px;
      height: 40px;
      padding: 0 12px;
      font-size: 13px;
      text-align: right;
      background: var(--surface);

      &[disabled] {
        opacity: 0.45;
      }
    }
    .panel {
      position: sticky;
      top: calc(var(--nav-h, 52px) + 24px);
      display: grid;
      gap: 12px;
      padding: 18px;
      border-radius: var(--r-card);
      background: var(--l-night);
      color: var(--n-ink);
      box-shadow: var(--shadow-lg);
    }
    .p-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      flex-wrap: wrap;
      padding-bottom: 12px;
      border-bottom: 1px solid var(--l-night-line);

      > .mono {
        font-size: 12px;
        color: var(--n-muted);
      }
    }
    .today {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 12px;
      color: var(--n-muted);

      input {
        height: 36px;
        padding: 0 10px;
        border-radius: 999px;
        border: 1px solid var(--l-night-line-strong);
        background: var(--l-night-2);
        color: var(--n-ink);
        color-scheme: dark;
        font-size: 12px;
      }
    }
    .sent {
      padding: 8px 10px;
      border-radius: 10px;
      border: 1px solid var(--l-night-line);
      font-size: 12px;
      color: var(--n-muted);
      overflow-wrap: anywhere;
    }
    .lines {
      display: grid;
      gap: 4px;

      li {
        display: flex;
        justify-content: space-between;
        align-items: baseline;
        gap: 10px;
        min-height: 38px;
        padding: 8px 12px;
        border-radius: 10px;
        background: var(--l-night-2);
        font-size: 13px;
      }
    }
    .n small {
      display: block;
      font-size: 12px;
      color: var(--n-muted);
    }
    .v {
      display: flex;
      gap: 8px;
      align-items: baseline;
      white-space: nowrap;

      s {
        font-size: 12px;
        color: var(--n-muted);
      }
      b {
        font-weight: 500;
      }
      .cut {
        color: var(--n-green);
      }
    }
    .tot {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      gap: 10px;
      padding-top: 10px;
      border-top: 1px solid var(--l-night-line-strong);
      font-weight: 600;

      b {
        display: block;
        text-align: right;
      }
      small {
        display: block;
        text-align: right;
        font-size: 12px;
        font-weight: 400;
        color: var(--n-green);
      }
    }
    .verdict {
      font-size: 12px;
      color: var(--n-amber);

      &.good {
        color: var(--n-green);
      }
    }
    @media (max-width: 860px) {
      .pr {
        grid-template-columns: 1fr;
      }
      .panel {
        position: static;
      }
    }
    @media (max-width: 460px) {
      .editor {
        padding: 14px;
      }
      .grid {
        grid-template-columns: 1fr;
      }
      .amt {
        width: 70px;
      }
    }
  `,
})
export class LlcsavvyPromoDemo {
  protected readonly products = PRODUCTS;
  protected readonly code = signal(SEED.code);
  protected readonly active = signal(SEED.active);
  protected readonly expire = signal(SEED.expire);
  protected readonly on = signal(SEED.on);
  protected readonly today = signal(SEED.today);
  protected readonly picked = signal<Record<string, boolean>>({ ...SEED.picked });
  protected readonly price = signal<Record<string, number>>({ ...SEED.price });

  protected readonly datesOk = computed(() => !this.active() || !this.expire() || this.expire() >= this.active());

  /** What the server decides: whether the code applies on the cart date at all. ISO dates compare as strings. */
  private readonly live = computed<boolean>(
    () => !!this.code() && this.on() && this.datesOk() && this.today() >= this.active() && this.today() <= this.expire(),
  );

  protected readonly lines = computed<{ id: string; name: string; fee: number; base: number; now: number }[]>(() => {
    const live = this.live();
    return PRODUCTS.filter((p) => p.inCart).map((p) => ({
      id: p.id,
      name: p.name,
      fee: p.fee,
      base: p.base,
      now: live && this.picked()[p.id] ? this.price()[p.id] : p.base,
    }));
  });

  private readonly base = computed<number>(() => PRODUCTS.filter((p) => p.inCart).reduce((s, p) => s + p.base + p.fee, 0));
  protected readonly total = computed<number>(() => this.lines().reduce((s, l) => s + l.now + l.fee, 0));

  protected readonly result = computed<{ ok: boolean; msg: string }>(() => {
    const code = this.code();
    if (!code) return { ok: false, msg: 'No code entered.' };
    if (!this.on()) return { ok: false, msg: `${code} is inactive. The cart keeps its prices.` };
    if (!this.datesOk()) return { ok: false, msg: 'The dates are the wrong way round. Nothing applies.' };
    if (this.today() < this.active()) return { ok: false, msg: `${code} is not active until ${fmtDate(this.active())}.` };
    if (this.today() > this.expire()) return { ok: false, msg: `${code} expired on ${fmtDate(this.expire())}.` };
    const hits = PRODUCTS.filter((p) => p.inCart && this.picked()[p.id]).length;
    if (!hits) return { ok: false, msg: `${code} covers nothing in this cart.` };
    const saved = this.base() - this.total();
    return {
      ok: true,
      msg: `${code} applied to ${hits} line${hits > 1 ? 's' : ''}. ${saved >= 0 ? 'Saves' : 'Adds'} $${Math.abs(saved)}.`,
    };
  });

  protected readonly rupees = computed(() => Math.round(this.total() * RATE).toLocaleString('en-US'));

  protected setCode(el: HTMLInputElement): void {
    const v = el.value.toUpperCase().replace(/\s/g, '');
    el.value = v;
    this.code.set(v);
  }

  protected toggle(id: string): void {
    this.picked.update((p) => ({ ...p, [id]: !p[id] }));
  }

  protected setPrice(id: string, v: string): void {
    const n = Math.max(0, Math.floor(Number(v) || 0));
    this.price.update((p) => ({ ...p, [id]: n }));
  }

  protected reset(): void {
    this.code.set(SEED.code);
    this.active.set(SEED.active);
    this.expire.set(SEED.expire);
    this.on.set(SEED.on);
    this.today.set(SEED.today);
    this.picked.set({ ...SEED.picked });
    this.price.set({ ...SEED.price });
  }
}
