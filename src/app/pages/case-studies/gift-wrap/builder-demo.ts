import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { phosphorCheck, phosphorMinus, phosphorPlus, phosphorTruck } from '@ng-icons/phosphor-icons/regular';
import { COPY } from './gift-wrap.copy';

interface Base {
  id: 'kraft' | 'box' | 'hamper';
  name: string;
  short: string;
  price: number;
}

interface Wrap {
  id: string;
  name: string;
  from: string;
  to: string;
  price: number;
}

interface Ribbon {
  id: string;
  name: string;
  hex: string;
}

interface Treat {
  id: string;
  name: string;
  price: number;
}

// Options and prices are the build's own sample catalogue (data.service.ts): every base and wrap, every ribbon,
// and four of its basket-eligible treats. Swatch colours are the storefront's own wrap gradients.
const BASES: Base[] = [
  { id: 'kraft', name: 'Kraft Weave Basket', short: 'Kraft basket', price: 14 },
  { id: 'box', name: 'Signature Gift Box', short: 'Gift box', price: 18 },
  { id: 'hamper', name: 'Keepsake Hamper', short: 'Hamper', price: 26 },
];

const WRAPS: Wrap[] = [
  { id: 'blush', name: 'Blush Tissue', from: '#f7e8ec', to: '#e89cb3', price: 0 },
  { id: 'kraft', name: 'Kraft and Twine', from: '#e8d6c3', to: '#c9a37a', price: 4 },
  { id: 'satin', name: 'Rose Satin', from: '#e89cb3', to: '#d86b8a', price: 6 },
  { id: 'velvet', name: 'Velvet Wine', from: '#a13a5e', to: '#7a0f3d', price: 8 },
];

const RIBBONS: Ribbon[] = [
  { id: 'rose', name: 'Rose Pink', hex: '#d86b8a' },
  { id: 'wine', name: 'Wine', hex: '#7a0f3d' },
  { id: 'blush', name: 'Blush', hex: '#e89cb3' },
  { id: 'sage', name: 'Sage', hex: '#7b7a5c' },
  { id: 'cream', name: 'Cream', hex: '#f2e7d8' },
];

const TREATS: Treat[] = [
  { id: 'truffle', name: 'Belgian Truffle Box', price: 32 },
  { id: 'candle', name: 'Vanilla Amber Soy Candle', price: 22 },
  { id: 'tea', name: 'Botanical Tea Collection', price: 25 },
  { id: 'macaron', name: 'French Macaron Tin', price: 28 },
];

const usd = (n: number) => '$' + n.toFixed(2);

/**
 * The Gift Wrap build studio, redrawn small as my own working component: base, wrap, ribbon and treats, with the
 * same pricing rules as the storefront (base + wrap + treats; free shipping from $75, else a flat $6.95) and a
 * drawn preview that takes the wrap and ribbon colours. Nothing is sent anywhere.
 */
@Component({
  selector: 'mh-gw-builder',
  imports: [NgIcon],
  viewProviders: [provideIcons({ phosphorCheck, phosphorMinus, phosphorPlus, phosphorTruck })],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="card card--lift studio" role="group" [attr.aria-label]="d.label">
      <header class="top">
        <b>{{ d.label }}</b>
        <span class="mono">{{ d.sample }}</span>
      </header>

      <div class="stage">
        <svg class="art" viewBox="0 0 200 170" role="img" [attr.aria-label]="artLabel()">
          <defs>
            <linearGradient id="gw-wrap-fill" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" [attr.stop-color]="wrap().from" />
              <stop offset="1" [attr.stop-color]="wrap().to" />
            </linearGradient>
          </defs>
          <ellipse cx="100" cy="162" rx="78" ry="6" class="shadow" />
          @switch (base().id) {
            @case ('kraft') {
              <path d="M52 92 Q100 14 148 92" class="handle" fill="none" />
              <path d="M34 90 H166 L150 160 H50 Z" fill="url(#gw-wrap-fill)" class="body" />
              <path d="M40 112 H160 M44 134 H156" class="weave" fill="none" />
              <rect x="93" y="90" width="14" height="70" [attr.fill]="ribbon().hex" class="band" />
              <g [attr.fill]="ribbon().hex" class="bow" transform="translate(100 88)">
                <ellipse cx="-13" cy="-6" rx="13" ry="7" transform="rotate(-24 -13 -6)" />
                <ellipse cx="13" cy="-6" rx="13" ry="7" transform="rotate(24 13 -6)" />
                <circle r="6" />
              </g>
            }
            @default {
              @let wide = base().id === 'hamper';
              <rect [attr.x]="wide ? 26 : 42" y="84" [attr.width]="wide ? 148 : 116" height="76" rx="5" fill="url(#gw-wrap-fill)" class="body" />
              <rect [attr.x]="wide ? 18 : 34" y="64" [attr.width]="wide ? 164 : 132" height="24" rx="5" fill="url(#gw-wrap-fill)" class="lid" />
              <rect x="93" y="64" width="14" height="96" [attr.fill]="ribbon().hex" class="band" />
              <rect [attr.x]="wide ? 26 : 42" y="114" [attr.width]="wide ? 148 : 116" height="12" [attr.fill]="ribbon().hex" class="band" />
              <g [attr.fill]="ribbon().hex" class="bow" transform="translate(100 62)">
                <ellipse cx="-15" cy="-8" rx="15" ry="8" transform="rotate(-24 -15 -8)" />
                <ellipse cx="15" cy="-8" rx="15" ry="8" transform="rotate(24 15 -8)" />
                <circle r="7" />
              </g>
            }
          }
          <g class="tag" transform="translate(140 98)">
            <path d="M0 0 L-12 -16" class="string" fill="none" />
            <rect x="-2" y="-2" width="60" height="24" rx="5" />
            <text x="28" y="14" text-anchor="middle">{{ count() }} {{ count() === 1 ? 'treat' : 'treats' }}</text>
          </g>
        </svg>

        <dl class="sum">
          <div><dt>{{ d.base }}</dt><dd>{{ base().name }}<span class="mono">{{ usd(base().price) }}</span></dd></div>
          <div><dt>{{ d.wrap }}</dt><dd>{{ wrap().name }}<span class="mono">{{ wrap().price ? usd(wrap().price) : 'Free' }}</span></dd></div>
          <div><dt>{{ d.treats }} ({{ count() }})</dt><dd><span class="mono">{{ usd(treatsTotal()) }}</span></dd></div>
          <div class="total"><dt>{{ d.total }}</dt><dd class="mono">{{ usd(total()) }}</dd></div>
        </dl>
      </div>

      <div class="opts">
        <div class="row" role="group" [attr.aria-label]="d.base">
          <span class="lab">{{ d.base }}</span>
          <div class="chips">
            @for (b of bases; track b.id) {
              <button type="button" class="chip" [attr.aria-pressed]="b.id === base().id" (click)="baseId.set(b.id); added.set(null)">
                {{ b.short }} <span class="mono">{{ usd(b.price) }}</span>
              </button>
            }
          </div>
        </div>

        <div class="row" role="group" [attr.aria-label]="d.wrap">
          <span class="lab">{{ d.wrap }}</span>
          <div class="swatches">
            @for (w of wraps; track w.id) {
              <button
                type="button"
                class="sw"
                [style.background]="'linear-gradient(135deg,' + w.from + ',' + w.to + ')'"
                [attr.aria-pressed]="w.id === wrap().id"
                [attr.aria-label]="w.name + (w.price ? ', plus ' + usd(w.price) : ', included')"
                [title]="w.name"
                (click)="wrapId.set(w.id); added.set(null)"
              >
                @if (w.id === wrap().id) {
                  <ng-icon name="phosphorCheck" aria-hidden="true" />
                }
              </button>
            }
          </div>
        </div>

        <div class="row" role="group" [attr.aria-label]="d.ribbon">
          <span class="lab">{{ d.ribbon }}</span>
          <div class="swatches">
            @for (r of ribbons; track r.id) {
              <button
                type="button"
                class="dot"
                [class.light]="r.id === 'cream'"
                [style.background]="r.hex"
                [attr.aria-pressed]="r.id === ribbon().id"
                [attr.aria-label]="r.name"
                [title]="r.name"
                (click)="ribbonId.set(r.id); added.set(null)"
              >
                @if (r.id === ribbon().id) {
                  <ng-icon name="phosphorCheck" aria-hidden="true" />
                }
              </button>
            }
            <span class="rname">{{ ribbon().name }}</span>
          </div>
        </div>

        <ul class="treats" role="list" [attr.aria-label]="d.treats">
          @for (t of treats; track t.id) {
            <li [class.in]="qty(t.id) > 0">
              <span class="tname">{{ t.name }}<small class="mono">{{ usd(t.price) }}</small></span>
              <span class="step">
                <button type="button" class="icon-btn sm" [disabled]="!qty(t.id)" (click)="change(t.id, -1)" [attr.aria-label]="'Remove one ' + t.name">
                  <ng-icon name="phosphorMinus" aria-hidden="true" />
                </button>
                <span class="mono q" aria-live="polite">{{ qty(t.id) }}</span>
                <button type="button" class="icon-btn sm" [disabled]="qty(t.id) >= 5" (click)="change(t.id, 1)" [attr.aria-label]="'Add one ' + t.name">
                  <ng-icon name="phosphorPlus" aria-hidden="true" />
                </button>
              </span>
            </li>
          }
        </ul>
      </div>

      <div class="ship" [class.free]="freeLeft() === 0">
        <p>
          <ng-icon name="phosphorTruck" aria-hidden="true" />
          @if (freeLeft() === 0) {
            Free shipping unlocked
          } @else {
            {{ usd(freeLeft()) }} away from free shipping, else {{ usd(d.shipping) }}
          }
        </p>
        <span class="bar" aria-hidden="true"><i [style.transform]="'scaleX(' + progress() + ')'"></i></span>
      </div>

      <div class="foot">
        <button type="button" class="btn btn-solid" [disabled]="!count()" (click)="addToCart()">{{ d.add }}</button>
        <p class="status" role="status">
          @if (added(); as a) {
            <ng-icon name="phosphorCheck" aria-hidden="true" /> {{ d.added }}: {{ a }}
          } @else if (!count()) {
            {{ d.needOne }}
          }
        </p>
      </div>
    </div>
  `,
  styles: `
    :host {
      display: block;
    }
    .studio {
      display: grid;
      gap: 14px;
      padding: 18px 20px 20px;
    }
    .top {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      gap: 12px;
      flex-wrap: wrap;

      b {
        font-size: 15px;
        font-weight: 600;
      }
      .mono {
        font-size: 12px;
        color: var(--muted);
      }
    }
    .stage {
      display: grid;
      grid-template-columns: 170px minmax(0, 1fr);
      gap: 16px;
      align-items: center;
      padding: 10px 14px;
      border-radius: var(--r-inner);
      background: var(--bg);
      border: 1px solid var(--line);
    }
    .art {
      width: 100%;
      height: auto;
      overflow: visible;
    }
    .shadow {
      fill: rgb(122 15 61 / 0.1);
    }
    .handle {
      stroke: #b88a5c;
      stroke-width: 6;
      stroke-linecap: round;
    }
    .body,
    .lid {
      stroke: rgb(58 35 48 / 0.18);
      stroke-width: 1;
    }
    .weave {
      stroke: rgb(58 35 48 / 0.14);
      stroke-width: 2;
    }
    .tag {
      rect {
        fill: #fff;
        stroke: var(--g-rose);
        stroke-width: 1.2;
      }
      .string {
        stroke: var(--g-rose);
        stroke-width: 1;
      }
      text {
        font-family: var(--font-mono);
        font-size: 12px;
        fill: var(--g-wine);
      }
    }
    @media (prefers-reduced-motion: no-preference) {
      .body,
      .lid,
      .band,
      .bow,
      stop {
        transition:
          fill var(--t-base) var(--ease),
          stop-color var(--t-base) var(--ease);
      }
    }
    .sum {
      display: grid;
      gap: 6px;
      margin: 0;
      font-size: 13px;

      div {
        display: grid;
        gap: 1px;
      }
      dt {
        font-size: 12px;
        color: var(--muted);
      }
      dd {
        margin: 0;
        display: flex;
        justify-content: space-between;
        gap: 8px;
        font-weight: 500;
        color: var(--ink);
      }
      .mono {
        font-size: 12px;
        color: var(--ink-2);
      }
      .total {
        grid-template-columns: 1fr auto;
        align-items: baseline;
        padding-top: 6px;
        border-top: 1px solid var(--line);

        dt {
          font-size: 13px;
          font-weight: 600;
          color: var(--ink);
        }
        dd {
          font-size: 17px;
          font-weight: 600;
          color: var(--g-wine);
        }
      }
    }
    .opts {
      display: grid;
      gap: 10px;
    }
    .row {
      display: grid;
      grid-template-columns: 54px minmax(0, 1fr);
      align-items: center;
      gap: 10px;
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
        height: 30px;
        padding: 0 11px;
        font-size: 12.5px;
      }
      .mono {
        font-size: 12px;
        opacity: 0.8;
      }
    }
    .swatches {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 8px;
    }
    // 30px visual, 44px hit area via the transparent outline-offset ring below.
    .sw,
    .dot {
      position: relative;
      display: grid;
      place-items: center;
      height: 30px;
      border: 1px solid rgb(58 35 48 / 0.12);
      color: #fff;
      cursor: pointer;

      &::after {
        content: '';
        position: absolute;
        inset: -7px;
      }
      &[aria-pressed='true'] {
        box-shadow:
          0 0 0 2px var(--surface),
          0 0 0 4px var(--g-wine);
      }
      ng-icon {
        font-size: 15px;
        filter: drop-shadow(0 1px 1px rgb(0 0 0 / 0.35));
      }
    }
    .sw {
      width: 46px;
      border-radius: 9px;
    }
    .dot {
      width: 30px;
      border-radius: 50%;

      &.light {
        color: var(--g-wine);

        ng-icon {
          filter: none;
        }
      }
    }
    .rname {
      font-size: 12.5px;
      color: var(--ink-2);
      margin-left: 4px;
    }
    .treats {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 6px;
      margin-top: 2px;

      li {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        padding: 6px 6px 6px 12px;
        border-radius: 12px;
        border: 1px solid var(--line);
        background: var(--surface);
        transition: border-color var(--t-base) var(--ease);

        &.in {
          border-color: var(--g-blush);
          background: var(--g-rose-soft);
        }
      }
    }
    .tname {
      display: grid;
      font-size: 12.5px;
      font-weight: 500;
      line-height: 1.3;
      min-width: 0;

      small {
        font-size: 12px;
        font-weight: 400;
        color: var(--muted);
      }
    }
    .step {
      display: flex;
      align-items: center;
      gap: 2px;
      flex-shrink: 0;
    }
    .icon-btn.sm {
      width: 30px;
      height: 30px;
      position: relative;

      &::after {
        content: '';
        position: absolute;
        inset: -7px -2px;
      }
      &:disabled {
        opacity: 0.4;
        cursor: default;
      }
      ng-icon {
        font-size: 14px;
      }
    }
    .q {
      width: 16px;
      text-align: center;
      font-size: 13px;
    }
    .ship {
      display: grid;
      gap: 6px;

      p {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 12.5px;
        color: var(--ink-2);
      }
      &.free p {
        color: var(--g-sage-text);
        font-weight: 500;
      }
      .bar {
        display: block;
        height: 6px;
        border-radius: 999px;
        background: var(--surface-2);
        overflow: hidden;
      }
      i {
        display: block;
        height: 100%;
        border-radius: inherit;
        background: linear-gradient(90deg, var(--g-blush), var(--g-rose));
        transform-origin: left;
      }
    }
    @media (prefers-reduced-motion: no-preference) {
      .ship i {
        transition: transform var(--t-slow, 0.4s) var(--ease);
      }
    }
    .foot {
      display: flex;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;

      .btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    }
    .status {
      flex: 1 1 180px;
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 12.5px;
      color: var(--ink-2);
      min-height: 1.4em;
    }
    @media (max-width: 520px) {
      .studio {
        padding: 16px 14px 18px;
      }
      .stage {
        grid-template-columns: 1fr;
        justify-items: center;
      }
      .art {
        max-width: 190px;
      }
      .sum {
        width: 100%;
      }
      .row {
        grid-template-columns: 1fr;
        gap: 6px;
      }
      .treats {
        grid-template-columns: 1fr;
      }
    }
  `,
})
export class GiftWrapBuilderDemo {
  protected readonly d = COPY.demo;
  protected readonly bases = BASES;
  protected readonly wraps = WRAPS;
  protected readonly ribbons = RIBBONS;
  protected readonly treats = TREATS;
  protected readonly usd = usd;

  protected readonly baseId = signal<Base['id']>('box');
  protected readonly wrapId = signal('satin');
  protected readonly ribbonId = signal('wine');
  private readonly qtys = signal<Record<string, number>>({ truffle: 1, macaron: 1 });
  protected readonly added = signal<string | null>(null);

  protected readonly base = computed(() => BASES.find((b) => b.id === this.baseId())!);
  protected readonly wrap = computed(() => WRAPS.find((w) => w.id === this.wrapId())!);
  protected readonly ribbon = computed(() => RIBBONS.find((r) => r.id === this.ribbonId())!);
  protected readonly count = computed(() => Object.values(this.qtys()).reduce((n, q) => n + q, 0));
  protected readonly treatsTotal = computed(() => TREATS.reduce((s, t) => s + t.price * (this.qtys()[t.id] ?? 0), 0));
  protected readonly total = computed(() => this.base().price + this.wrap().price + this.treatsTotal());
  protected readonly freeLeft = computed(() => Math.max(0, this.d.freeAt - this.total()));
  protected readonly progress = computed(() => Math.min(1, this.total() / this.d.freeAt));
  protected readonly artLabel = computed(
    () => `${this.base().name} in ${this.wrap().name} with a ${this.ribbon().name} ribbon, ${this.count()} treats`,
  );

  protected qty(id: string): number {
    return this.qtys()[id] ?? 0;
  }

  protected change(id: string, by: number): void {
    this.qtys.update((q) => ({ ...q, [id]: Math.max(0, Math.min(5, (q[id] ?? 0) + by)) }));
    this.added.set(null);
  }

  /** Same summary line the storefront writes on the cart line: base, wrap, ribbon, item count, price. */
  protected addToCart(): void {
    if (!this.count()) return;
    const n = this.count();
    this.added.set(`${this.base().short}, ${this.wrap().name}, ${this.ribbon().name}, ${n} item${n === 1 ? '' : 's'}, ${usd(this.total())}`);
  }
}
