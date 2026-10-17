import { ChangeDetectionStrategy, Component, afterNextRender, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  phosphorForkKnife,
  phosphorGift,
  phosphorHeadset,
  phosphorPencilSimpleLine,
  phosphorTruck,
  phosphorWrench,
} from '@ng-icons/phosphor-icons/regular';
import { TkPipe } from './tk.pipe';
import { Reveal } from '../../../shared/directives/reveal.directive';
import { COPY } from '../brand.copy';
import { CASE_THEMES, COLOR_GROUPS, ColorToken, SHADOWS } from '../brand.data';
import { Grade, Rgba, contrast, describeColor, grade, over, parseColor, ratioLabel, readVar, resolveColor } from '../brand.util';

interface Row {
  tk: ColorToken;
  value: string;
  ratio: string;
  grade: Grade;
}

const ALL = COLOR_GROUPS.flatMap((g) => g.tokens);

/** Color: every token as a live swatch with value, role, contrast and WCAG grade. */
@Component({
  selector: 'mh-brand-color',
  imports: [Reveal, RouterLink, TkPipe, NgIcon],
  // Only the themes without a mark of their own need an icon.
  viewProviders: [provideIcons({ phosphorForkKnife, phosphorGift, phosphorHeadset, phosphorPencilSimpleLine, phosphorTruck, phosphorWrench })],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="bp-head" mhReveal>
      <h2 class="title" id="color-title">{{ t.title }}</h2>
      <p class="sub">{{ t.sub }}</p>
    </header>

    <div class="groups">
      @for (g of groups(); track g.id) {
        <section class="card grp" [class.grp--wide]="g.rows.length > 4" [attr.aria-labelledby]="'cg-' + g.id">
          <h3 class="bp-card-title" [id]="'cg-' + g.id">{{ g.label }}</h3>
          <p class="bp-card-note" [innerHTML]="g.note | tk"></p>
          <ul class="rows" role="list">
            @for (r of g.rows; track r.tk.name) {
              <li class="row">
                <span class="sw" [style.background]="'var(' + r.tk.name + ')'" aria-hidden="true">
                  @if (r.tk.kind === 'text') {
                    <span [style.color]="'var(' + r.tk.fg + ')'" [style.background]="'var(' + r.tk.bg + ')'">Aa</span>
                  }
                </span>
                <span class="row__t">
                  <code class="row__name">{{ r.tk.name }}</code>
                  <span class="row__role" [innerHTML]="r.tk.role | tk"></span>
                </span>
                <span class="row__v">
                  <code>{{ r.value }}</code>
                  <span class="row__ratio">
                    <span class="mono">{{ r.ratio }}</span>
                    <span class="tag" [class]="'tag bp-grade--' + r.grade.split(' ')[0]">{{ r.grade }}</span>
                  </span>
                </span>
              </li>
            }
          </ul>
        </section>
      }

      <section class="card grp grp--wide" aria-labelledby="cg-shadow">
        <h3 class="bp-card-title" id="cg-shadow">{{ t.shadows }}</h3>
        <p class="bp-card-note">Black only, two layers each: a contact shadow and a long soft one.</p>
        <ul class="shadows" role="list">
          @for (s of shadows; track s.name) {
            <li>
              <span class="shadow-tile" [style.box-shadow]="'var(' + s.name + ')'" aria-hidden="true"></span>
              <code class="row__name">{{ s.name }}</code>
              <span class="row__role" [innerHTML]="s.role | tk"></span>
            </li>
          }
        </ul>
      </section>
    </div>

    <p class="bp-callout">{{ t.live }}</p>

    <section class="card grp themes-card" aria-labelledby="cg-themes">
      <h3 class="bp-card-title" id="cg-themes">{{ t.themes.title }}</h3>
      <p class="bp-card-note" [innerHTML]="t.themes.note | tk"></p>
      <ul class="themes" role="list">
        @for (th of themes; track th.slug) {
          <li>
            <a class="theme" [routerLink]="th.href">
              <span class="theme__sw" [style.background]="th.bg" [style.color]="th.ink" aria-hidden="true">
                <span class="theme__aa">Aa</span>
                <span class="theme__dot" [style.background]="th.accent"></span>
                <span class="theme__cta" [style.background]="th.cta" [style.color]="th.ctaInk">{{ t.themes.cta }}</span>
              </span>
              <span class="theme__name">
                @if (th.mark) {
                  <span class="theme__mark fav"><img [src]="th.mark" width="16" height="16" alt="" loading="lazy" decoding="async" /></span>
                } @else {
                  <span class="theme__mark"><ng-icon [name]="th.icon" aria-hidden="true" /></span>
                }
                <span>{{ th.name }}<span class="sr-only"> {{ t.themes.open }}</span></span>
              </span>
              <span class="theme__meta mono">
                <span>{{ t.themes.text }} {{ th.text }}</span>
                <span>{{ t.themes.cta }} {{ th.ctaRatio }}</span>
              </span>
            </a>
          </li>
        }
      </ul>
    </section>
  `,
  styles: `
    .groups {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 12px;
      align-items: start;
    }
    .grp--wide {
      grid-column: 1 / -1;
    }
    .grp--wide .rows {
      grid-template-columns: repeat(2, minmax(0, 1fr));
      column-gap: 32px;
    }
    .rows {
      display: grid;
    }
    .row {
      display: grid;
      grid-template-columns: 44px minmax(0, 1fr) auto;
      align-items: center;
      gap: 14px;
      padding: 12px 0;
      border-top: 1px solid var(--line);
    }
    .sw {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      box-shadow: inset 0 0 0 1px var(--line-strong);
      display: grid;
      place-items: end;
      overflow: hidden;
    }
    .sw span {
      font-size: 11px;
      font-weight: 600;
      line-height: 1;
      padding: 3px 4px;
      border-top-left-radius: 6px;
    }
    .row__t,
    .row__v {
      display: grid;
      min-width: 0;
      line-height: 1.35;
    }
    .row__v {
      justify-items: end;
      text-align: right;
      gap: 4px;
    }
    .row__name {
      font-size: 13px;
      color: var(--ink);
    }
    .row__role {
      font-size: 13.5px;
      color: var(--muted);
    }
    .row__v code {
      font-size: 12px;
      color: var(--ink-2);
      white-space: nowrap;
    }
    .row__ratio {
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }
    .row__ratio .mono {
      font-size: 12px;
      color: var(--muted);
      font-variant-numeric: tabular-nums;
    }
    .row__ratio .tag {
      height: 22px;
      font-size: 11px;
      padding: 0 8px;
    }
    .shadows {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 14px 24px;
      padding-top: 6px;
    }
    .shadows li {
      display: grid;
      gap: 4px;
    }
    .shadow-tile {
      height: 84px;
      margin-bottom: 14px;
      border-radius: var(--r-inner);
      background: var(--surface-2);
      border: 1px solid var(--line);
    }
    .themes-card {
      margin-top: 12px;
    }
    .themes {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
      gap: 10px;
    }
    .theme {
      display: grid;
      gap: 10px;
      padding: 8px 8px 12px;
      border-radius: var(--r-inner);
      border: 1px solid var(--line);
      background: var(--bg);
      color: var(--ink);
      transition:
        border-color var(--t-base) var(--ease),
        transform var(--t-base) var(--ease);
    }
    .theme:hover {
      border-color: var(--line-strong);
      transform: translateY(-2px);
    }
    .theme__sw {
      position: relative;
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
      gap: 8px;
      block-size: 72px;
      padding: 10px;
      border-radius: 8px;
      box-shadow: inset 0 0 0 1px var(--line-strong);
    }
    .theme__aa {
      font-size: 1.35rem;
      font-weight: 600;
      letter-spacing: -0.03em;
      line-height: 1;
    }
    .theme__dot {
      position: absolute;
      top: 10px;
      right: 10px;
      inline-size: 10px;
      block-size: 10px;
      border-radius: 50%;
    }
    .theme__cta {
      display: inline-flex;
      align-items: center;
      block-size: 22px;
      padding: 0 9px;
      border-radius: 999px;
      font-size: 11px;
      font-weight: 600;
    }
    .theme__name {
      display: flex;
      align-items: center;
      gap: 8px;
      min-inline-size: 0;
      padding: 0 4px;
      font-size: 14px;
      font-weight: 500;
      line-height: 1.25;
    }
    .theme__mark {
      inline-size: 24px;
      block-size: 24px;
      flex-shrink: 0;
      border-radius: 999px;
      display: grid;
      place-items: center;
      background: var(--surface-2);
      font-size: 13px;
    }
    .theme__mark.fav {
      background: var(--cta);
      padding: 4px;
    }
    .theme__mark img {
      inline-size: 100%;
      block-size: 100%;
      object-fit: contain;
    }
    .theme__meta {
      display: flex;
      flex-wrap: wrap;
      gap: 2px 10px;
      padding: 0 4px;
      font-size: 11.5px;
      color: var(--muted);
      font-variant-numeric: tabular-nums;
    }
    @media (prefers-reduced-motion: reduce) {
      .theme:hover {
        transform: none;
      }
    }
    @media (max-width: 1240px) {
      .grp--wide .rows {
        grid-template-columns: minmax(0, 1fr);
      }
    }
    @media (max-width: 760px) {
      .groups {
        grid-template-columns: minmax(0, 1fr);
      }
    }
    @media (max-width: 420px) {
      .row {
        grid-template-columns: 40px minmax(0, 1fr);
      }
      .sw {
        width: 40px;
        height: 40px;
      }
      .row__v {
        grid-column: 2;
        justify-items: start;
        text-align: left;
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 6px 10px;
      }
    }
  `,
})
export class BrandColor {
  protected readonly t = COPY.color;
  protected readonly shadows = SHADOWS;
  /** Theme swatches with their two ratios: ink on the page, and the CTA label on its fill. */
  protected readonly themes = CASE_THEMES.map((th) => {
    const ratio = (fg: string, bg: string) => {
      const f = parseColor(fg);
      const b = parseColor(bg);
      return f && b ? ratioLabel(contrast(f, b)) : '';
    };
    return { ...th, text: ratio(th.ink, th.bg), ctaRatio: ratio(th.ctaInk, th.cta) };
  });
  /** Live values once rendered; literal fallbacks during prerender. */
  private readonly live = signal<Record<string, string>>({});

  protected readonly groups = computed(() => {
    const live = this.live();
    const browser = Object.keys(live).length > 0;
    const color = (name: string): Rgba | null => {
      const raw = live[name] || ALL.find((x) => x.name === name)?.value || '';
      return browser ? resolveColor(raw) : parseColor(raw);
    };
    return COLOR_GROUPS.map((g) => ({
      ...g,
      rows: g.tokens.map((tk): Row => {
        const c = color(tk.name);
        const fg = color(tk.fg);
        const bg = color(tk.bg);
        const ratio = fg && bg ? contrast(over(fg, bg), bg) : 0;
        return { tk, value: c ? describeColor(c) : tk.value, ratio: ratioLabel(ratio), grade: grade(ratio, tk.kind) };
      }),
    }));
  });

  constructor() {
    afterNextRender(() => {
      const all: Record<string, string> = {};
      for (const tk of ALL) all[tk.name] = readVar(tk.name);
      this.live.set(all);
    });
  }
}
