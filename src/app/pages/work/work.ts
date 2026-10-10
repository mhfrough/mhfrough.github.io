import { ChangeDetectionStrategy, Component, afterNextRender, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  phosphorArrowRight,
  phosphorArrowUpRight,
  phosphorBriefcase,
  phosphorBrowser,
  phosphorBuildingOffice,
  phosphorBuildings,
  phosphorCalendarCheck,
  phosphorChartLineUp,
  phosphorChatsCircle,
  phosphorDatabase,
  phosphorForkKnife,
  phosphorGlobe,
  phosphorHandCoins,
  phosphorHouseLine,
  phosphorInvoice,
  phosphorPackage,
  phosphorPenNib,
  phosphorReceipt,
  phosphorTreePalm,
  phosphorTruck,
} from '@ng-icons/phosphor-icons/regular';
import { PERSON_ID, Seo, abs } from '../../core/seo/seo.service';
import { Reveal } from '../../shared/directives/reveal.directive';
import { COPY } from './work.copy';
import { CATEGORIES, FEATURED, PROJECTS, WorkCategory, WorkProject } from './work.data';

type Filter = 'all' | WorkCategory;

/** One bento cell: span 1 (single), 2 (wide) or 3 (full row, only when a filter leaves one card alone). */
interface Cell {
  p: WorkProject;
  span: 1 | 2 | 3;
  solid: boolean;
}

/**
 * Bento rhythm, after Quorum's "Meet the seven": rows cycle [wide, one] / [one, one, one] / [one, wide] /
 * [one, one, one]. The middle cell of every other triple row is inverted (.card--solid). Computed from the
 * filtered list so every filter still fills its rows with no holes.
 */
function bento(items: WorkProject[]): Cell[] {
  const patterns: (1 | 2)[][] = [[2, 1], [1, 1, 1], [1, 2], [1, 1, 1]];
  const rows: (1 | 2 | 3)[][] = [];
  let used = 0;
  for (let r = 0; used < items.length; r++) {
    const left = items.length - used;
    let row: (1 | 2 | 3)[] = [...patterns[r % 4]];
    if (left < row.length) {
      if (left === 1) {
        const prev = rows[rows.length - 1];
        // Fold a lone last card into the previous row by splitting its wide cell.
        if (prev && prev.length === 2) {
          rows[rows.length - 1] = [1, 1, 1];
          used += 1;
          break;
        }
        // Or turn a closing triple + 1 into two zigzag pairs.
        if (prev && prev.length === 3) {
          const before = rows[rows.length - 2];
          const zig: (1 | 2)[][] = before && before[1] === 2 ? [[2, 1], [1, 2]] : [[1, 2], [2, 1]];
          rows.splice(rows.length - 1, 1, ...zig);
          used += 1;
          break;
        }
        row = [3];
      } else {
        row = r % 4 === 2 ? [1, 2] : [2, 1];
      }
    }
    rows.push(row);
    used += row.length;
  }

  const cells: Cell[] = [];
  let i = 0;
  let triples = 0;
  for (const row of rows) {
    const isTriple = row.length === 3 && row.every((s) => s === 1);
    row.forEach((span, k) => {
      cells.push({ p: items[i++], span, solid: isTriple && k === 1 && triples % 2 === 0 });
    });
    if (isTriple) triples++;
  }
  return cells;
}

const matches = (cats: WorkCategory[], f: Filter) => f === 'all' || cats.includes(f);

@Component({
  selector: 'mh-page-work',
  imports: [RouterLink, NgIcon, Reveal],
  viewProviders: [
    provideIcons({
      phosphorArrowRight,
      phosphorArrowUpRight,
      phosphorBriefcase,
      phosphorBrowser,
      phosphorBuildingOffice,
      phosphorBuildings,
      phosphorCalendarCheck,
      phosphorChartLineUp,
      phosphorChatsCircle,
      phosphorDatabase,
      phosphorForkKnife,
      phosphorGlobe,
      phosphorHandCoins,
      phosphorHouseLine,
      phosphorInvoice,
      phosphorPackage,
      phosphorPenNib,
      phosphorReceipt,
      phosphorTreePalm,
      phosphorTruck,
    }),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './work.html',
  styleUrl: './work.scss',
})
export class Work {
  protected readonly t = COPY;
  protected readonly featured = FEATURED;
  protected readonly filters = CATEGORIES.map((c) => ({
    ...c,
    count:
      PROJECTS.filter((p) => matches(p.categories, c.id)).length + (matches(FEATURED.categories, c.id) ? 1 : 0),
  })).filter((c) => c.count > 0);

  protected readonly filter = signal<Filter>('all');
  protected readonly announcement = signal('');
  protected readonly ready = signal(false);

  protected readonly showFeatured = computed(() => matches(FEATURED.categories, this.filter()));
  protected readonly cells = computed(() => bento(PROJECTS.filter((p) => matches(p.categories, this.filter()))));

  constructor() {
    afterNextRender(() => this.ready.set(true));
    inject(Seo).set({
      title: COPY.seo.title,
      description: COPY.seo.description,
      path: '/work',
      breadcrumbs: [{ name: 'Work', path: '/work' }],
      image: '/og/og-work.jpg',
      imageAlt: 'Selected work by Mohammad Hamza',
      jsonLd: [itemList()],
    });
  }

  protected select(id: Filter): void {
    if (id === this.filter()) return;
    this.filter.set(id);
    const f = this.filters.find((x) => x.id === id);
    if (f) this.announcement.set(COPY.filter.announce(f.count, f.label));
  }

  protected meta(p: WorkProject): string[] {
    return [p.domain, p.years, p.where].filter((x): x is string => !!x);
  }
}

/** ItemList of CreativeWork for the whole index. Domains only, no employer or client names. */
function itemList(): Record<string, unknown> {
  const featured = {
    '@type': 'CreativeWork',
    '@id': abs(FEATURED.path) + '#work',
    name: FEATURED.title,
    description: FEATURED.oneLiner,
    url: abs(FEATURED.path),
    image: abs(FEATURED.cover.src),
    dateCreated: String(FEATURED.startYear),
    genre: FEATURED.domain,
    keywords: FEATURED.stack.join(', '),
    sameAs: [FEATURED.liveUrl, FEATURED.repoUrl],
    author: { '@id': PERSON_ID },
  };
  const rest = PROJECTS.map((p) => ({
    '@type': 'CreativeWork',
    name: p.title,
    description: p.outcome,
    genre: p.domain,
    keywords: p.stack.join(', '),
    ...(p.startYear ? { dateCreated: String(p.startYear) } : {}),
    author: { '@id': PERSON_ID },
  }));
  return {
    '@type': 'ItemList',
    '@id': abs('/work') + '#projects',
    name: 'Selected work',
    numberOfItems: rest.length + 1,
    itemListElement: [featured, ...rest].map((item, i) => ({ '@type': 'ListItem', position: i + 1, item })),
  };
}
