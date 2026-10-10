import { ChangeDetectionStrategy, Component, afterNextRender, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TkPipe } from './tk.pipe';
import { Reveal } from '../../../shared/directives/reveal.directive';
import { COPY } from '../brand.copy';
import { COLOR_GROUPS, ColorToken, SHADOWS } from '../brand.data';
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
  imports: [Reveal, RouterLink, TkPipe],
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

    <p class="bp-callout">
      <span [innerHTML]="t.themeNote | tk"></span>&ngsp;<a class="link" routerLink="/work/quorum">{{ t.themeLink }}</a> {{ t.themeTail }}
      <span class="muted"> {{ t.live }}</span>
    </p>
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
