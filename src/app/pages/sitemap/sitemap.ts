import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  afterNextRender,
  inject,
  viewChild,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { phosphorArrowRight, phosphorFileCode } from '@ng-icons/phosphor-icons/regular';
import { Seo } from '../../core/seo/seo.service';
import { Reveal } from '../../shared/directives/reveal.directive';
import { SITEMAP_COPY as COPY } from './sitemap.copy';
import { SITEMAP_ENTRIES, type SitemapEntry } from './sitemap.data';

const PATH = '/sitemap';

interface Group {
  readonly id: string;
  readonly title: string;
  readonly note: string;
  readonly prefix: string | null;
  readonly paths: readonly string[];
}

interface Row extends SitemapEntry {
  readonly label: string;
}

const GROUPS: readonly Group[] = COPY.groups;

/** '/work/new-thing' -> 'New thing case study', '/uses' -> 'Uses'. */
function labelFor(path: string): string {
  const known = COPY.labels[path];
  if (known) return known;
  const last = path.split('/').filter(Boolean).pop() ?? '';
  const name = last.charAt(0).toUpperCase() + last.slice(1).replace(/[-_]+/g, ' ');
  return path.startsWith('/work/') ? `${name} ${COPY.caseStudy}` : name || path;
}

/** Display order: the order of COPY.labels, then unknown paths A to Z. */
const ORDER = Object.keys(COPY.labels);
function byOrder(a: Row, b: Row): number {
  const ia = ORDER.indexOf(a.path);
  const ib = ORDER.indexOf(b.path);
  if (ia !== -1 || ib !== -1) return (ia === -1 ? Infinity : ia) - (ib === -1 ? Infinity : ib) || 0;
  return a.label.localeCompare(b.label);
}

function groupOf(path: string): string {
  const hit = GROUPS.find(
    (g) =>
      g.paths.includes(path) ||
      (g.prefix && (path === g.prefix || path.startsWith(g.prefix + '/'))),
  );
  return (hit ?? GROUPS[0]).id;
}

/**
 * Human-readable sitemap. The list is SITEMAP_ENTRIES, which scripts/sitemap.mjs parses out of the
 * sitemap.xml it writes, so this page and /sitemap.xml always list the same URLs. Everything is static
 * data: the full list is in the prerendered HTML and needs no JavaScript.
 */
@Component({
  selector: 'mh-page-sitemap',
  imports: [RouterLink, NgIcon, Reveal],
  viewProviders: [provideIcons({ phosphorArrowRight, phosphorFileCode })],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="page-head glow head" aria-labelledby="sitemap-title">
      <div #hero class="wrap hero-anim head__row">
        <div class="head__copy">
          <p class="kicker mono rise">
            {{ c.kicker }}<span class="dot" aria-hidden="true"></span>{{ total }}
            {{ c.stats.pages }}
            @if (latest) {
              <span class="dot" aria-hidden="true"></span>{{ c.stats.updated }}
              <time [attr.datetime]="latest">{{ latest }}</time>
            }
          </p>
          <h1 id="sitemap-title" class="title rise">{{ c.title }}</h1>
          <p class="sub rise d2">{{ c.sub }}</p>
        </div>
        <a class="btn btn-ghost btn-sm xml rise d2" href="/sitemap.xml" type="application/xml"
          ><ng-icon name="phosphorFileCode" aria-hidden="true" />{{ c.xml }}</a
        >
      </div>
    </section>

    <div class="wrap groups">
      @for (g of groups; track g.id; let gi = $index) {
        <section class="group" [attr.aria-labelledby]="'sm-' + g.id" mhReveal [revealIndex]="gi">
          <header class="group__head">
            <h2 [id]="'sm-' + g.id" class="group__title">{{ g.title }}</h2>
            <p class="group__note">{{ g.note }}</p>
            <p class="group__count mono">{{ g.rows.length < 10 ? '0' : '' }}{{ g.rows.length }}</p>
          </header>

          <div class="card list">
            <div class="legend mono" aria-hidden="true">
              <span>{{ c.legend.lastmod }}</span>
              <span>{{ c.legend.changefreq }}</span>
              <span>{{ c.legend.priority }}</span>
            </div>
            <ul role="list">
              @for (r of g.rows; track r.loc) {
                <li class="row">
                  <a class="row__link" [routerLink]="r.path">
                    <span class="row__title">{{ r.label }}</span>
                    <span class="row__path mono" translate="no">{{ r.path }}</span>
                  </a>
                  <span class="row__meta mono">
                    <span class="cell">
                      <span class="sr-only">{{ c.columns.lastmod }}: </span>
                      @if (r.lastmod) {
                        <time [attr.datetime]="r.lastmod">{{ r.lastmod }}</time>
                      } @else {
                        <span aria-hidden="true">--</span>
                      }
                    </span>
                    <span class="cell"
                      ><span class="sr-only">{{ c.columns.changefreq }}: </span
                      >{{ r.changefreq ?? '--' }}</span
                    >
                    <span class="cell"
                      ><span class="sr-only">{{ c.columns.priority }}: </span
                      >{{ r.priority ?? '--' }}</span
                    >
                  </span>
                  <ng-icon class="row__arrow" name="phosphorArrowRight" aria-hidden="true" />
                </li>
              }
            </ul>
          </div>
        </section>
      }
    </div>
  `,
  styles: `
    :host {
      display: block;
      padding-bottom: 88px;
      --cols: 84px 80px 56px;
    }
    .head {
      padding-bottom: 40px;
    }
    .head::before {
      mask-image: linear-gradient(to bottom, black 55%, transparent);
    }
    .head__row {
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 20px 32px;
    }
    .kicker {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 4px 10px;
      color: var(--muted);
      font-size: 12px;
      margin-bottom: 14px;
    }
    .kicker time {
      color: var(--ink-2);
    }
    .dot {
      width: 3px;
      height: 3px;
      border-radius: 50%;
      background: var(--faint);
    }
    .title {
      max-width: 18ch;
    }
    .sub {
      color: var(--ink-2);
    }
    .xml {
      flex-shrink: 0;
    }
    .xml ng-icon {
      font-size: 16px;
    }

    .groups {
      display: grid;
      gap: 44px;
    }
    .group {
      display: grid;
      grid-template-columns: minmax(0, 260px) minmax(0, 1fr);
      gap: 20px 40px;
      align-items: start;
    }
    .group__head {
      padding-top: 6px;
    }
    .group__title {
      font-size: 1.1rem;
      line-height: 1.3;
      letter-spacing: -0.02em;
      font-weight: 600;
      margin-bottom: 6px;
    }
    .group__note {
      color: var(--muted);
      font-size: 14px;
      line-height: 1.55;
      max-width: 32ch;
    }
    .group__count {
      margin-top: 14px;
      color: var(--ink-2);
      font-size: 12px;
    }

    .list {
      padding: 6px;
    }
    .legend,
    .row {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      align-items: center;
      gap: 16px;
    }
    .legend {
      grid-template-columns: var(--cols) 18px;
      justify-content: end;
      padding: 8px 14px 6px;
      color: var(--muted);
      font-size: 11px;
    }
    .legend span:last-child {
      grid-column: span 2;
    }
    .row {
      position: relative;
      grid-template-columns: minmax(0, 1fr) auto 18px;
      min-height: 56px;
      padding: 8px 14px;
      border-radius: var(--r-inner);
      transition: background var(--t-fast) var(--ease);
    }
    .row + .row::before {
      content: '';
      position: absolute;
      top: 0;
      left: 14px;
      right: 14px;
      height: 1px;
      background: var(--line);
    }
    .row:hover,
    .row:focus-within {
      background: var(--surface-2);
    }
    .row:hover::before,
    .row:hover + .row::before,
    .row:focus-within::before,
    .row:focus-within + .row::before {
      opacity: 0;
    }
    .row__link {
      display: grid;
      gap: 2px;
      min-width: 0;
      border-radius: var(--r-inner);
    }
    /* The whole row is the target; the accessible name stays the page title and path. */
    .row__link::after {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: var(--r-inner);
    }
    .row__link:focus-visible {
      outline: none;
    }
    .row__link:focus-visible::after {
      outline: 2px solid var(--focus);
      outline-offset: 2px;
    }
    .row__title {
      color: var(--ink);
      font-weight: 500;
      font-size: 15px;
      line-height: 1.35;
    }
    .row__path {
      color: var(--muted);
      font-size: 12px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .row__meta {
      display: grid;
      grid-template-columns: var(--cols);
      gap: 16px;
      color: var(--ink-2);
      font-size: 12px;
      font-variant-numeric: tabular-nums;
    }
    .row__arrow {
      font-size: 16px;
      color: var(--muted);
      transition:
        transform var(--t-fast) var(--ease),
        color var(--t-fast) var(--ease);
    }
    .row:hover .row__arrow,
    .row:focus-within .row__arrow {
      color: var(--ink);
      transform: translateX(2px);
    }

    @media (max-width: 900px) {
      .group {
        grid-template-columns: minmax(0, 1fr);
      }
      .group__note {
        max-width: 56ch;
      }
      .group__count {
        display: none;
      }
    }
    @media (max-width: 640px) {
      :host {
        padding-bottom: 64px;
      }
      .head {
        padding-bottom: 28px;
      }
      .groups {
        gap: 36px;
      }
      .legend {
        display: none;
      }
      .row {
        grid-template-columns: minmax(0, 1fr) 18px;
        gap: 6px 12px;
        padding: 12px;
      }
      .row + .row::before {
        left: 12px;
        right: 12px;
      }
      .row__meta {
        grid-row: 2;
        display: flex;
        flex-wrap: wrap;
        gap: 4px 14px;
        font-size: 11.5px;
        color: var(--muted);
      }
      .row__arrow {
        grid-row: 1;
        grid-column: 2;
      }
    }
    @media (prefers-reduced-motion: reduce) {
      .row__arrow {
        transition: none;
      }
      .row:hover .row__arrow,
      .row:focus-within .row__arrow {
        transform: none;
      }
    }
  `,
})
export class Sitemap {
  protected readonly c = COPY;
  protected readonly total = SITEMAP_ENTRIES.length;
  protected readonly latest = SITEMAP_ENTRIES.reduce(
    (max, e) => (e.lastmod && e.lastmod > max ? e.lastmod : max),
    '',
  );
  protected readonly groups = GROUPS.map((g) => ({
    ...g,
    rows: SITEMAP_ENTRIES.filter((e) => groupOf(e.path) === g.id)
      .map((e): Row => ({ ...e, label: labelFor(e.path) }))
      .sort(byOrder),
  })).filter((g) => g.rows.length > 0);

  private readonly hero = viewChild.required<ElementRef<HTMLElement>>('hero');

  constructor() {
    inject(Seo).set({
      title: COPY.seo.title,
      description: COPY.seo.description,
      path: PATH,
      breadcrumbs: [{ name: COPY.crumb, path: PATH }],
      jsonLd: [
        {
          '@type': 'ItemList',
          name: COPY.seo.title,
          numberOfItems: SITEMAP_ENTRIES.length,
          itemListElement: SITEMAP_ENTRIES.map((e, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            name: labelFor(e.path),
            url: e.loc,
          })),
        },
      ],
    });
    afterNextRender(() => this.hero().nativeElement.classList.add('ready'));
  }
}
