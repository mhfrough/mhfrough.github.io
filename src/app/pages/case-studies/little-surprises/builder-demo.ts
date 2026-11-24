import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { phosphorArrowLeft, phosphorArrowRight, phosphorCheck, phosphorMinus, phosphorPlus, phosphorShoppingBag } from '@ng-icons/phosphor-icons/regular';
import { COPY } from './little-surprises.copy';

interface Base {
  id: string;
  name: string;
  price: number;
  img: string;
}

interface Part {
  id: string;
  name: string;
  price: number;
}

interface Item extends Part {
  img: string;
}

const IMG = '/images/little-surprises/parts/';

// The shop's own parts and prices, read from its live API (GET api.littlesurprises.shop/v1/catalog/basket-parts,
// 24 Nov 2026) and its catalogue; photos are the shop's own. Every basket holds up to 6 items.
const BASES: Base[] = [
  { id: 'wooden', name: 'Wooden basket with handle', price: 799, img: IMG + 'wooden-basket.webp' },
  { id: 'clear', name: 'Clear gift box', price: 1150, img: IMG + 'clear-gift-box.webp' },
  { id: 'rope', name: 'Handmade rope basket, white and gold', price: 1400, img: IMG + 'rope-basket-gold.webp' },
];

const WRAPS: Part[] = [
  { id: 'shred', name: 'Colored paper shred', price: 100 },
  { id: 'kraft', name: 'Kraft paper sheets', price: 100 },
  { id: 'net', name: 'Wrapping net', price: 150 },
];

const RIBBONS: Part[] = [
  { id: 'bows', name: 'Ribbon pull bows', price: 40 },
  { id: 'satin', name: 'Satin ribbon roll', price: 250 },
];

const ITEMS: Item[] = [
  { id: 'roses', name: 'Forever red roses', price: 999, img: IMG + 'forever-red-roses.webp' },
  { id: 'lilies', name: 'Pure grace lilies', price: 999, img: IMG + 'pure-grace-lilies.webp' },
  { id: 'lily-key', name: 'Pink lily keychain', price: 299, img: IMG + 'pink-lily-keychain.webp' },
  { id: 'sun-key', name: 'Sunflower keychain', price: 299, img: IMG + 'sunflower-keychain.webp' },
  { id: 'card', name: 'Saalgirah Mubarak card', price: 299, img: IMG + 'card-saalgirah-mubarak-1.webp' },
  { id: 'popper', name: 'Party popper', price: 230, img: IMG + 'party-popper.webp' },
];

const CAPACITY = 6;
const NOTE_MAX = 120;
const rs = (n: number) => 'Rs ' + n.toLocaleString('en-US');

type Step = 0 | 1 | 2;

/**
 * The Little Surprises basket builder, redrawn small as my own working component with the shop's real photos and
 * prices: the same three steps as the live builder (basket, fill it, note), the basket's 6-item limit, and the
 * note on the shop's signature "For you" tag. Nothing is sent anywhere.
 */
@Component({
  selector: 'mh-ls-builder',
  imports: [NgIcon],
  viewProviders: [provideIcons({ phosphorArrowLeft, phosphorArrowRight, phosphorCheck, phosphorMinus, phosphorPlus, phosphorShoppingBag })],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="card card--lift studio" role="group" [attr.aria-label]="d.label">
      <header class="top">
        <b>{{ d.label }}</b>
        <span class="mono">{{ d.sample }}</span>
      </header>

      <!-- The basket as it stands: photo, what is inside, the tag, and the bill -->
      <div class="stage">
        <figure class="shot">
          <img [src]="base().img" width="400" height="400" [alt]="base().name" decoding="async" />
          @if (inside().length) {
            <ul class="inside" role="list" [attr.aria-label]="d.inside">
              @for (it of inside(); track $index) {
                <li><img [src]="it.img" width="400" height="400" [alt]="it.name" decoding="async" /></li>
              }
            </ul>
          }
          <figcaption class="note-tag" [class.empty]="!note().trim()">
            <span class="tag-for mono">{{ d.forYou }}</span>
            <span class="tag-note">{{ note().trim() || d.notePlaceholder }}</span>
          </figcaption>
        </figure>

        <div class="bill">
          <dl>
            <div><dt>{{ d.base }}</dt><dd>{{ rs(base().price) }}</dd></div>
            <div><dt>{{ d.wrap }}</dt><dd>{{ rs(wrap().price) }}</dd></div>
            <div><dt>{{ d.ribbon }}</dt><dd>{{ rs(ribbon().price) }}</dd></div>
            <div><dt>{{ d.items }} ({{ count() }})</dt><dd>{{ rs(itemsTotal()) }}</dd></div>
            <div class="total"><dt>{{ d.total }}</dt><dd>{{ rs(total()) }}</dd></div>
          </dl>
          <div class="cap">
            <p class="mono">{{ count() }} / {{ capacity }} <span>{{ d.capacityLabel }}</span></p>
            <span class="bar" aria-hidden="true">
              @for (s of slots; track s) {
                <i [class.on]="s < count()"></i>
              }
            </span>
          </div>
        </div>
      </div>

      <!-- Steps, like the live builder -->
      <div class="seg steps" role="group" [attr.aria-label]="d.stepsLabel">
        @for (s of d.steps; track s; let i = $index) {
          <button type="button" [attr.aria-pressed]="step() === i" (click)="go(i)">
            <span class="n mono" aria-hidden="true">{{ i + 1 }}</span>{{ s }}
          </button>
        }
      </div>

      <div class="pane">
        @switch (step()) {
          @case (0) {
            <ul class="bases" role="list" [attr.aria-label]="d.base">
              @for (b of bases; track b.id) {
                <li>
                  <button type="button" class="pick" [attr.aria-pressed]="b.id === baseId()" (click)="baseId.set(b.id); added.set(null)">
                    <img [src]="b.img" width="400" height="400" alt="" loading="lazy" decoding="async" />
                    <span class="pick-name">{{ b.name }}</span>
                    <span class="pick-meta mono">{{ rs(b.price) }} · {{ d.holds }}</span>
                    @if (b.id === baseId()) {
                      <span class="tick" aria-hidden="true"><ng-icon name="phosphorCheck" /></span>
                    }
                  </button>
                </li>
              }
            </ul>
            <div class="row" role="group" [attr.aria-label]="d.wrap">
              <span class="lab">{{ d.wrap }}</span>
              <div class="chips">
                @for (w of wraps; track w.id) {
                  <button type="button" class="chip" [attr.aria-pressed]="w.id === wrapId()" (click)="wrapId.set(w.id); added.set(null)">
                    {{ w.name }} <span class="mono">{{ w.price }}</span>
                  </button>
                }
              </div>
            </div>
            <div class="row" role="group" [attr.aria-label]="d.ribbon">
              <span class="lab">{{ d.ribbon }}</span>
              <div class="chips">
                @for (r of ribbons; track r.id) {
                  <button type="button" class="chip" [attr.aria-pressed]="r.id === ribbonId()" (click)="ribbonId.set(r.id); added.set(null)">
                    {{ r.name }} <span class="mono">{{ r.price }}</span>
                  </button>
                }
              </div>
            </div>
          }
          @case (1) {
            <ul class="items" role="list" [attr.aria-label]="d.items">
              @for (it of items; track it.id) {
                <li class="item" [class.in]="qty(it.id) > 0">
                  <img [src]="it.img" width="400" height="400" alt="" loading="lazy" decoding="async" />
                  <span class="item-name">{{ it.name }}</span>
                  <span class="item-foot">
                    <span class="mono">{{ rs(it.price) }}</span>
                    <span class="step-ctl">
                      <button type="button" class="icon-btn sm" [disabled]="!qty(it.id)" (click)="change(it.id, -1)" [attr.aria-label]="d.removeOne + ' ' + it.name">
                        <ng-icon name="phosphorMinus" aria-hidden="true" />
                      </button>
                      <span class="q mono">{{ qty(it.id) }}</span>
                      <button type="button" class="icon-btn sm" [disabled]="room() === 0" (click)="change(it.id, 1)" [attr.aria-label]="d.addOne + ' ' + it.name">
                        <ng-icon name="phosphorPlus" aria-hidden="true" />
                      </button>
                    </span>
                  </span>
                </li>
              }
            </ul>
            <p class="hint" aria-live="polite">{{ room() === 0 ? d.full : d.room(room()) }}</p>
          }
          @case (2) {
            <label class="field">
              <span class="field__label">{{ d.noteLabel }}</span>
              <textarea
                class="textarea"
                rows="3"
                [attr.maxlength]="noteMax"
                [value]="note()"
                (input)="setNote($event)"
                aria-describedby="ls-note-count"
              ></textarea>
              <span class="field__hint mono" id="ls-note-count">{{ note().length }} / {{ noteMax }}</span>
            </label>
          }
        }
      </div>

      <footer class="foot">
        @if (step() > 0) {
          <button type="button" class="btn btn-ghost" (click)="go(step() - 1)">
            <ng-icon name="phosphorArrowLeft" aria-hidden="true" /> {{ d.back }}
          </button>
        }
        @if (step() < 2) {
          <button type="button" class="btn btn-solid" (click)="go(step() + 1)">
            {{ d.next }} <ng-icon name="phosphorArrowRight" aria-hidden="true" />
          </button>
        } @else {
          <button type="button" class="btn btn-solid" [disabled]="!count()" (click)="addToBag()">
            <ng-icon name="phosphorShoppingBag" aria-hidden="true" /> {{ d.add }}
          </button>
        }
        <p class="status" role="status">
          @if (added(); as a) {
            <ng-icon name="phosphorCheck" aria-hidden="true" /> {{ a }}
          } @else if (!count()) {
            {{ d.needOne }}
          }
        </p>
      </footer>
    </div>
  `,
  styles: `
    :host {
      display: block;
      min-width: 0;
    }
    .studio {
      display: grid;
      gap: 14px;
      padding: 16px;
    }
    .top {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      gap: 12px;

      b {
        font-size: 15px;
        font-weight: 600;
      }
      .mono {
        font-size: 12px;
        color: var(--muted);
      }
    }

    /* Stage: the basket photo with what is inside and the tag, beside the bill */
    .stage {
      display: grid;
      grid-template-columns: minmax(0, 1.05fr) minmax(0, 1fr);
      gap: 14px;
      align-items: stretch;
    }
    .shot {
      position: relative;
      margin: 0;
      aspect-ratio: 1;
      border-radius: var(--r-inner);
      overflow: hidden;
      background: var(--surface-2);
      box-shadow: inset 0 0 0 1px var(--line);

      > img {
        display: block;
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }
    .inside {
      position: absolute;
      left: 10px;
      bottom: 10px;
      display: flex;
      margin: 0;
      padding: 0;
      list-style: none;

      li + li {
        margin-left: -10px;
      }
      img {
        display: block;
        width: 34px;
        height: 34px;
        border-radius: 50%;
        object-fit: cover;
        border: 2px solid #fff;
        box-shadow: 0 2px 6px rgb(0 0 0 / 0.18);
        animation: drop 0.35s var(--ease) both;
      }
    }
    /* The shop's signature: the note on a "For you" tag, hung by a plum string */
    .note-tag {
      position: absolute;
      display: block;
      top: 12px;
      right: 10px;
      width: min(62%, 150px);
      padding: 9px 11px 10px;
      border-radius: 8px 8px 8px 2px;
      background: #fff;
      color: #1f1a1c;
      box-shadow: 0 6px 16px rgb(43 13 27 / 0.16);
      transform: rotate(3deg);
      transform-origin: top center;

      &::before {
        content: '';
        position: absolute;
        top: -9px;
        left: 14px;
        width: 2px;
        height: 12px;
        border-radius: 2px;
        background: var(--accent);
      }
    }
    .tag-for {
      display: block;
      font-size: 10px;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--accent);
    }
    .tag-note {
      display: -webkit-box;
      -webkit-line-clamp: 4;
      -webkit-box-orient: vertical;
      overflow: hidden;
      margin-top: 3px;
      font-size: 12.5px;
      line-height: 1.35;
      font-style: italic;
      overflow-wrap: anywhere;
    }
    .note-tag.empty .tag-note {
      color: #7a5a6a;
    }

    .bill {
      display: grid;
      align-content: space-between;
      gap: 12px;
      padding: 12px 14px;
      border-radius: var(--r-inner);
      background: var(--surface-2);
      box-shadow: inset 0 0 0 1px var(--line);

      dl {
        display: grid;
        gap: 6px;
        margin: 0;
      }
      dl > div {
        display: flex;
        justify-content: space-between;
        gap: 8px;
        font-size: 13px;
      }
      dt {
        color: var(--ink-2);
      }
      dd {
        margin: 0;
        font-family: var(--font-mono);
        font-size: 12px;
        white-space: nowrap;
      }
      .total {
        margin-top: 4px;
        padding-top: 8px;
        border-top: 1px solid var(--line);

        dt {
          color: var(--ink);
          font-weight: 600;
        }
        dd {
          font-size: 15px;
          font-weight: 600;
          color: var(--accent);
        }
      }
    }
    .cap {
      display: grid;
      gap: 6px;

      p {
        font-size: 12px;

        span {
          color: var(--muted);
        }
      }
    }
    .bar {
      display: grid;
      grid-template-columns: repeat(6, 1fr);
      gap: 4px;

      i {
        height: 6px;
        border-radius: 999px;
        background: var(--line);
        transition: background-color 0.25s var(--ease);
      }
      i.on {
        background: var(--accent);
      }
    }

    /* Steps */
    .steps {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));

      button {
        justify-content: center;
        gap: 6px;
      }
      .n {
        font-size: 11px;
        opacity: 0.7;
      }
    }

    .pane {
      display: grid;
      gap: 12px;
      min-height: 196px;
      align-content: start;
    }

    /* Step 1: baskets with their photos, then wrap and ribbon */
    .bases {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 8px;
      margin: 0;
      padding: 0;
      list-style: none;
    }
    .pick {
      position: relative;
      display: grid;
      gap: 4px;
      width: 100%;
      height: 100%;
      padding: 6px 6px 8px;
      border: 1px solid var(--line);
      border-radius: var(--r-inner);
      background: var(--surface);
      color: inherit;
      text-align: left;
      font: inherit;
      cursor: pointer;
      transition: border-color 0.2s var(--ease), box-shadow 0.2s var(--ease);

      img {
        display: block;
        width: 100%;
        aspect-ratio: 4 / 3;
        object-fit: cover;
        border-radius: 8px;
      }
      &:hover {
        border-color: var(--line-strong, var(--line));
      }
      &[aria-pressed='true'] {
        border-color: var(--accent);
        box-shadow: 0 0 0 1px var(--accent);
      }
    }
    .pick-name {
      font-size: 12.5px;
      font-weight: 500;
      line-height: 1.25;
    }
    .pick-meta {
      font-size: 11px;
      color: var(--muted);
    }
    .tick {
      position: absolute;
      top: 10px;
      right: 10px;
      display: grid;
      place-items: center;
      width: 22px;
      height: 22px;
      border-radius: 50%;
      background: var(--accent);
      color: var(--accent-ink);
      font-size: 12px;
    }
    .row {
      display: grid;
      grid-template-columns: 54px minmax(0, 1fr);
      gap: 10px;
      align-items: center;
    }
    .lab {
      font-size: 12px;
      color: var(--muted);
    }
    .chips {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;

      .chip {
        font-size: 12.5px;
      }
      .mono {
        margin-left: 4px;
        font-size: 11px;
        opacity: 0.75;
      }
    }

    /* Step 2: items to fill it with */
    .items {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 8px;
      margin: 0;
      padding: 0;
      list-style: none;
    }
    .item {
      display: grid;
      gap: 5px;
      padding: 6px;
      border: 1px solid var(--line);
      border-radius: var(--r-inner);
      background: var(--surface);
      transition: border-color 0.2s var(--ease);

      img {
        display: block;
        width: 100%;
        aspect-ratio: 4 / 3;
        object-fit: cover;
        border-radius: 8px;
      }
      &.in {
        border-color: var(--accent);
      }
    }
    .item-name {
      font-size: 12px;
      font-weight: 500;
      line-height: 1.25;
      min-height: 2.5em;
    }
    .item-foot {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 4px;

      > .mono {
        font-size: 11px;
        color: var(--muted);
      }
    }
    .step-ctl {
      display: inline-flex;
      align-items: center;
      gap: 2px;

      .q {
        min-width: 14px;
        text-align: center;
        font-size: 12px;
      }
    }
    .icon-btn.sm {
      position: relative;
      width: 24px;
      height: 24px;
      font-size: 12px;

      /* 44px hit area */
      &::before {
        content: '';
        position: absolute;
        inset: -10px;
      }
    }
    .hint {
      font-size: 12px;
      color: var(--muted);
    }

    /* Step 3: the note */
    .field {
      display: grid;
      gap: 6px;
    }
    .textarea {
      resize: none;
    }

    .foot {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 8px;
    }
    .status {
      flex: 1 1 160px;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 12.5px;
      color: var(--ink-2);
    }

    @keyframes drop {
      from {
        opacity: 0;
        transform: translateY(-8px) scale(0.8);
      }
    }

    @media (max-width: 520px) {
      .stage {
        grid-template-columns: 1fr;
      }
      .items {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .inside img {
        animation: none;
      }
      .bar i,
      .pick,
      .item {
        transition: none;
      }
    }
  `,
})
export class LittleSurprisesBuilderDemo {
  protected readonly d = COPY.demo;
  protected readonly bases = BASES;
  protected readonly wraps = WRAPS;
  protected readonly ribbons = RIBBONS;
  protected readonly items = ITEMS;
  protected readonly capacity = CAPACITY;
  protected readonly noteMax = NOTE_MAX;
  protected readonly slots = Array.from({ length: CAPACITY }, (_, i) => i);
  protected readonly rs = rs;

  protected readonly step = signal<Step>(0);
  protected readonly baseId = signal('wooden');
  protected readonly wrapId = signal('shred');
  protected readonly ribbonId = signal('satin');
  private readonly qtys = signal<Record<string, number>>({ roses: 1, 'lily-key': 1, card: 1 });
  protected readonly note = signal<string>(COPY.demo.noteDefault);
  protected readonly added = signal<string | null>(null);

  protected readonly base = computed(() => BASES.find((b) => b.id === this.baseId())!);
  protected readonly wrap = computed(() => WRAPS.find((w) => w.id === this.wrapId())!);
  protected readonly ribbon = computed(() => RIBBONS.find((r) => r.id === this.ribbonId())!);
  protected readonly count = computed(() => Object.values(this.qtys()).reduce((n, q) => n + q, 0));
  protected readonly room = computed(() => Math.max(0, CAPACITY - this.count()));
  protected readonly itemsTotal = computed(() => ITEMS.reduce((s, it) => s + it.price * (this.qtys()[it.id] ?? 0), 0));
  protected readonly total = computed(() => this.base().price + this.wrap().price + this.ribbon().price + this.itemsTotal());
  /** One thumbnail per unit, in the order of the list, for the stack on the basket photo. */
  protected readonly inside = computed(() => ITEMS.flatMap((it) => Array.from({ length: this.qtys()[it.id] ?? 0 }, () => it)));

  protected qty(id: string): number {
    return this.qtys()[id] ?? 0;
  }

  protected go(i: number): void {
    this.step.set(Math.max(0, Math.min(2, i)) as Step);
  }

  protected change(id: string, by: number): void {
    if (by > 0 && this.room() === 0) return;
    this.qtys.update((q) => ({ ...q, [id]: Math.max(0, (q[id] ?? 0) + by) }));
    this.added.set(null);
  }

  protected setNote(e: Event): void {
    this.note.set((e.target as HTMLTextAreaElement).value.slice(0, NOTE_MAX));
    this.added.set(null);
  }

  /** The line the shop writes on the bag: basket, item count and total. */
  protected addToBag(): void {
    const n = this.count();
    if (!n) return;
    this.added.set(`${this.d.added}: ${this.base().name}, ${n} item${n === 1 ? '' : 's'}, ${rs(this.total())}`);
  }
}
