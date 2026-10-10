import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { phosphorDownloadSimple } from '@ng-icons/phosphor-icons/regular';
import { Reveal } from '../../../shared/directives/reveal.directive';
import { Logo, MARK_ARC, MARK_BAR } from '../../../shared/ui/logo';
import { COPY } from '../brand.copy';
import { Spec } from './spec';
import { TkPipe } from './tk.pipe';

const SIZES = [64, 48, 34, 24, 16];
const TILE_MARKUP = `<span class="brand-mark"><mh-logo [size]="22" /></span>`;
const LOCKUP_MARKUP = `<a class="brand" routerLink="/" aria-label="Mohammad Hamza, home">
  <span class="brand-mark"><mh-logo [size]="22" /></span>
  <span class="brand-text">Mohammad Hamza</span>
</a>`;

/** Logo: the ء mark on its tile, sizes, lockups, the construction view and downloads. */
@Component({
  selector: 'mh-brand-logo',
  imports: [Logo, Spec, Reveal, NgIcon, TkPipe],
  viewProviders: [provideIcons({ phosphorDownloadSimple })],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="bp-head" mhReveal>
      <h2 class="title" id="logo-title">{{ t.title }}</h2>
      <p class="sub" [innerHTML]="t.sub | tk"></p>
    </header>

    <div class="bp-grid">
      <mh-spec [name]="t.sizes" cls=".brand-mark + mh-logo" layout="center" [markup]="tileMarkup" class="span-all">
        @for (s of sizes; track s) {
          <figure class="size">
            <span class="tile" [style.--tile.px]="s"><mh-logo [size]="mark(s)" /></span>
            <figcaption class="mono">{{ s }}</figcaption>
          </figure>
        }
      </mh-spec>

      <mh-spec [name]="t.lockup" cls=".brand .brand-mark .brand-text" layout="center" [markup]="lockupMarkup">
        <span class="lockup">
          <span class="tile" style="--tile: 40px"><mh-logo [size]="26" /></span>
          <span class="lockup__t"><b>Mohammad Hamza</b><span class="mono">@mhfrough</span></span>
        </span>
      </mh-spec>

      <mh-spec [name]="t.lockup + ', inverted'" cls="on --cta" layout="center sunk" [markup]="lockupMarkup">
        <span class="lockup lockup--inv">
          <span class="tile" style="--tile: 40px"><mh-logo [size]="26" /></span>
          <span class="lockup__t"><b>Mohammad Hamza</b><span class="mono">@mhfrough</span></span>
        </span>
      </mh-spec>
    </div>

    <div class="bp-subhead">
      <h3 class="h3">{{ t.construction }}</h3>
      <p>{{ t.constructionNote }}</p>
    </div>

    <div class="build card">
      <div class="build__fig">
        <div class="build__layers" role="group" [attr.aria-label]="t.show">
          @for (l of layerList; track l.id) {
            <button type="button" class="chip" [attr.aria-pressed]="layers()[l.id]" (click)="toggle(l.id)">{{ l.label }}</button>
          }
        </div>
        <svg class="build__svg" [class.is-geo]="layers().geo" viewBox="-1 -1 50 50" role="img" aria-labelledby="mark-geo">
          <title id="mark-geo">Construction of the hamza mark on a 48 unit grid</title>
          @if (layers().grid) {
            <g class="g-fine">
              @for (i of grid; track i) {
                <line [attr.x1]="i" y1="0" [attr.x2]="i" y2="48" />
                <line x1="0" [attr.y1]="i" x2="48" [attr.y2]="i" />
              }
            </g>
            <g class="g-major">
              @for (i of major; track i) {
                <line [attr.x1]="i" y1="0" [attr.x2]="i" y2="48" />
                <line x1="0" [attr.y1]="i" x2="48" [attr.y2]="i" />
              }
            </g>
          }
          @if (layers().space) {
            <rect class="g-space" x="2" y="0" width="45" height="45" />
            <rect class="g-bounds" x="12" y="10" width="25" height="25" />
          }
          <g class="g-mark">
            <path [attr.d]="arc" fill="none" stroke-width="5" />
            <rect [attr.x]="bar.x" [attr.y]="bar.y" [attr.width]="bar.w" [attr.height]="bar.h" />
          </g>
          @if (layers().geo) {
            <g class="g-geo">
              <circle cx="24" cy="21.5" r="9" class="g-circle" />
              <line x1="24" y1="21.5" x2="30.36" y2="15.14" />
              <line x1="24" y1="21.5" x2="24" y2="30.5" />
              <circle cx="24" cy="21.5" r="0.7" class="g-dot" />
              <circle cx="30.36" cy="15.14" r="0.7" class="g-dot" />
              <circle cx="24" cy="30.5" r="0.7" class="g-dot" />
              <text x="21.4" y="21.9">c</text>
              <text x="24.4" y="17.4">r 9</text>
              <text x="31.6" y="14.6">-45</text>
              <text x="25.2" y="29.4">90</text>
              <text x="12" y="38.8">x 12, y 30, 25 x 5</text>
            </g>
          }
        </svg>
      </div>
      <dl class="bp-kv build__rules">
        @for (r of t.rules; track r.k) {
          <div>
            <dt>{{ r.k }}</dt>
            <dd>{{ r.v }}</dd>
          </div>
        }
      </dl>
    </div>

    <div class="bp-subhead">
      <h3 class="h3">{{ t.downloads }}</h3>
      <p>{{ t.downloadsNote }} {{ t.min }}</p>
    </div>
    <ul class="files" role="list">
      @for (f of t.files; track f.href) {
        <li>
          <a class="file card card--hover" [href]="f.href" [attr.download]="'mhfrough-' + f.name">
            <img [src]="f.href" alt="" width="44" height="44" loading="lazy" decoding="async" [class.on-light]="f.name === 'mark.svg'" />
            <span class="file__t"><code>{{ f.name }}</code><span>{{ f.note }}</span></span>
            <ng-icon name="phosphorDownloadSimple" aria-hidden="true" />
          </a>
        </li>
      }
    </ul>
  `,
  styles: `
    .tile {
      --tile: 34px;
      width: var(--tile);
      height: var(--tile);
      border-radius: calc(var(--tile) * 10 / 34);
      background: var(--cta);
      color: var(--cta-ink);
      display: grid;
      place-items: center;
      flex-shrink: 0;
    }
    .size {
      display: grid;
      justify-items: center;
      align-content: end;
      gap: 12px;
      margin: 0 14px;
      min-height: 96px;
    }
    .size figcaption {
      color: var(--muted);
      font-size: 12px;
    }
    .lockup {
      display: inline-flex;
      align-items: center;
      gap: 12px;
    }
    .lockup__t {
      display: grid;
      line-height: 1.2;
    }
    .lockup__t b {
      font-weight: 600;
      font-size: 17px;
      letter-spacing: -0.01em;
    }
    .lockup__t .mono {
      font-size: 12.5px;
      color: var(--muted);
    }
    .lockup--inv {
      padding: 18px 22px;
      border-radius: var(--r-inner);
      background: var(--cta);
      color: var(--cta-ink);
    }
    .lockup--inv .tile {
      background: var(--cta-ink);
      color: var(--cta);
    }
    .lockup--inv .mono {
      color: color-mix(in oklab, var(--cta-ink) 70%, transparent);
    }
    .build {
      display: grid;
      grid-template-columns: minmax(0, 1.15fr) minmax(0, 1fr);
      gap: 32px;
      align-items: center;
    }
    .build__fig {
      display: grid;
      gap: 16px;
    }
    .build__layers {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }
    .build__svg {
      width: 100%;
      height: auto;
      border-radius: var(--r-inner);
      background: var(--bg);
      overflow: visible;
    }
    .g-fine line {
      stroke: var(--line);
      stroke-width: 0.06;
    }
    .g-major line {
      stroke: var(--line-strong);
      stroke-width: 0.12;
    }
    .g-mark {
      color: var(--ink);
      transition: color var(--t-base) var(--ease);
    }
    .is-geo .g-mark {
      color: var(--line-strong);
    }
    .g-mark path {
      stroke: currentColor;
    }
    .g-mark rect {
      fill: currentColor;
    }
    .g-space,
    .g-bounds {
      fill: none;
      stroke: var(--muted);
      stroke-width: 0.12;
      stroke-dasharray: 0.6 0.5;
    }
    .g-bounds {
      stroke: var(--ink-2);
    }
    .g-geo line,
    .g-circle {
      fill: none;
      stroke: var(--ink);
      stroke-width: 0.14;
    }
    .g-circle {
      stroke-dasharray: 0.5 0.4;
    }
    .g-dot {
      fill: var(--ink);
    }
    .g-geo text {
      font-family: var(--font-mono);
      font-size: 1.5px;
      fill: var(--ink-2);
    }
    .files {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 12px;
    }
    .file {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 16px 20px 16px 16px;
    }
    .file img {
      border-radius: 12px;
      flex-shrink: 0;
    }
    .file img.on-light {
      background: var(--cta);
    }
    .file__t {
      flex: 1;
      min-width: 0;
      display: grid;
      line-height: 1.35;
    }
    .file__t code {
      font-size: 13.5px;
      color: var(--ink);
    }
    .file__t span {
      font-size: 13.5px;
      color: var(--muted);
    }
    .file ng-icon {
      font-size: 20px;
      color: var(--muted);
    }
    @media (max-width: 860px) {
      .build {
        grid-template-columns: minmax(0, 1fr);
      }
    }
    @media (max-width: 640px) {
      .files {
        grid-template-columns: minmax(0, 1fr);
      }
      .size {
        margin: 0 2px;
      }
    }
  `,
})
export class BrandLogo {
  protected readonly t = COPY.logo;
  protected readonly sizes = SIZES;
  protected readonly arc = MARK_ARC;
  protected readonly bar = MARK_BAR;
  protected readonly tileMarkup = TILE_MARKUP;
  protected readonly lockupMarkup = LOCKUP_MARKUP;
  protected readonly grid = Array.from({ length: 49 }, (_, i) => i).filter((i) => i % 12);
  protected readonly major = [0, 12, 24, 36, 48];
  protected readonly layerList = [
    { id: 'grid', label: 'Grid' },
    { id: 'geo', label: 'Geometry' },
    { id: 'space', label: 'Clear space' },
  ] as const;
  protected readonly layers = signal<Record<'grid' | 'geo' | 'space', boolean>>({ grid: true, geo: true, space: true });

  protected mark(tile: number): number {
    return Math.round((tile * 22) / 34);
  }

  protected toggle(id: 'grid' | 'geo' | 'space'): void {
    this.layers.update((l) => ({ ...l, [id]: !l[id] }));
  }
}
