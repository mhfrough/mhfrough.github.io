import { NgTemplateOutlet } from '@angular/common';
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
  phosphorCaretLeft,
  phosphorCaretRight,
  phosphorChartLineUp,
  phosphorChatsCircle,
  phosphorDatabase,
  phosphorFilmSlate,
  phosphorForkKnife,
  phosphorGift,
  phosphorGlobe,
  phosphorHandCoins,
  phosphorHeadset,
  phosphorHouseLine,
  phosphorIdentificationBadge,
  phosphorImage,
  phosphorInvoice,
  phosphorPackage,
  phosphorPenNib,
  phosphorPencilSimpleLine,
  phosphorReceipt,
  phosphorTreePalm,
  phosphorTruck,
  phosphorWrench,
} from '@ng-icons/phosphor-icons/regular';
import { PERSON_ID, Seo, abs } from '../../core/seo/seo.service';
import { Reveal } from '../../shared/directives/reveal.directive';
import { COPY } from './work.copy';
import { FaaaCard } from './faaa/faaa';
import { StarRatingPkg } from './star-rating/star-rating';
import { WeatherIcons } from './weather-icons/weather-icons';
import { CardDeck } from './card-deck';
import { CardSlider } from './card-slider';
import { ShelfLoop } from './shelf-loop';
import { CARD_SHOTS, CATEGORIES, FEATURED, PROJECTS, TOOL_ORDER, WorkCategory, WorkProject } from './work.data';
import { CARD_THUMBS } from './work.thumbs';

/**
 * CARD_SHOTS mapped to their exact 16:10 thumbnails (scripts/work-thumbs.mjs, re-run after adding shots), so the
 * 16:10 card frames never crop text at the sides. A shot without a thumb yet falls back to the original. Built once
 * so the card components get stable arrays.
 */
const THUMB_SHOTS: Readonly<Record<string, readonly string[]>> = Object.fromEntries(
  Object.entries(CARD_SHOTS).map(([id, list]) => [id, list.map((src) => CARD_THUMBS[src] ?? src)]),
);
const FIRST_SHOTS: Readonly<Record<string, readonly string[]>> = Object.fromEntries(
  Object.entries(THUMB_SHOTS).map(([id, list]) => [id, list.slice(0, 3)]),
);

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
        // A triple, a pair and one more card (6) end as three zigzag pairs, so the tail keeps its wide cells.
        const triple = rows[rows.length - 2];
        if (prev && prev.length === 2 && triple && triple.length === 3) {
          const before = rows[rows.length - 3];
          const zig: (1 | 2)[][] = before && before[1] === 2 ? [[2, 1], [1, 2], [2, 1]] : [[1, 2], [2, 1], [1, 2]];
          rows.splice(rows.length - 2, 2, ...zig);
          used += 1;
          break;
        }
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

/** The weather icon set is the one design piece; it sits under its own filter. */
const ICON_SET: WorkCategory[] = ['design'];
/** Side projects under the weather icons: the npm package and the Faaa VS Code extension (own products). */
const PACKAGE: WorkCategory[] = ['own'];

@Component({
  selector: 'mh-page-work',
  imports: [NgTemplateOutlet, RouterLink, NgIcon, Reveal, WeatherIcons, StarRatingPkg, FaaaCard, CardSlider, CardDeck, ShelfLoop],
  viewProviders: [
    provideIcons({
      phosphorArrowRight,
      phosphorArrowUpRight,
      phosphorBriefcase,
      phosphorBrowser,
      phosphorBuildingOffice,
      phosphorBuildings,
      phosphorCalendarCheck,
      phosphorCaretLeft,
      phosphorCaretRight,
      phosphorChartLineUp,
      phosphorChatsCircle,
      phosphorDatabase,
      phosphorFilmSlate,
      phosphorForkKnife,
      phosphorGift,
      phosphorGlobe,
      phosphorHandCoins,
      phosphorHeadset,
      phosphorHouseLine,
      phosphorIdentificationBadge,
      phosphorImage,
      phosphorInvoice,
      phosphorPackage,
      phosphorPenNib,
      phosphorPencilSimpleLine,
      phosphorReceipt,
      phosphorTreePalm,
      phosphorTruck,
      phosphorWrench,
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
      PROJECTS.filter((p) => matches(p.categories, c.id)).length +
      (matches(FEATURED.categories, c.id) ? 1 : 0) +
      (matches(ICON_SET, c.id) ? 1 : 0) +
      (matches(PACKAGE, c.id) ? 2 : 0),
  })).filter((c) => c.count > 0);

  protected readonly filter = signal<Filter>('all');
  protected readonly announcement = signal('');
  protected readonly ready = signal(false);
  /** Originals shelf: one set on the server, the set plus its looping copy in the browser. */
  protected readonly copies = signal<number[]>([0]);

  protected readonly showFeatured = computed(() => matches(FEATURED.categories, this.filter()));
  protected readonly showIcons = computed(() => matches(ICON_SET, this.filter()));
  protected readonly showPackage = computed(() => matches(PACKAGE, this.filter()));
  private readonly filtered = computed(() => PROJECTS.filter((p) => matches(p.categories, this.filter())));
  /** My Originals get their own shelf before client work, in TOOL_ORDER. */
  protected readonly tools = computed(() =>
    this.filtered()
      .filter((p) => p.tool)
      .sort((a, b) => TOOL_ORDER.indexOf(a.id) - TOOL_ORDER.indexOf(b.id)),
  );
  /** Case studies fill the bento; smaller work without one sits after it as a compact row. */
  protected readonly cells = computed(() => bento(this.filtered().filter((p) => p.caseStudy && !p.tool)));
  protected readonly minor = computed(() => this.filtered().filter((p) => !p.caseStudy && !p.tool));

  constructor() {
    afterNextRender(() => {
      this.ready.set(true);
      this.copies.set([0, 1]);
    });
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

  /** The card's screenshots in order: home, sales page, portal (see CARD_SHOTS). Wide cards get them all. */
  protected shots(p: WorkProject): readonly string[] | null {
    return THUMB_SHOTS[p.id] ?? null;
  }

  /** Single cards: the first three only (home, sales page, portal). */
  protected firstShots(p: WorkProject): readonly string[] | null {
    return FIRST_SHOTS[p.id] ?? null;
  }


  /** The product name alone (titles read "Flick, nearby sharing in the browser"). */
  protected name(p: WorkProject): string {
    return p.title.split(',')[0];
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
  const icons = {
    '@type': 'CreativeWork',
    name: 'Weather icons',
    description: COPY.icons.note,
    genre: 'Icon design',
    keywords: 'Icon set, Weather, SVG, Adobe XD',
    dateCreated: '2022-07-06',
    image: abs('/images/weather-icons/partly-sunny.svg'),
    url: COPY.icons.dribbbleUrl,
    author: { '@id': PERSON_ID },
  };
  const pkg = {
    '@type': 'SoftwareSourceCode',
    name: '@mhfrough/star-rating',
    description: 'Tiny, dependency-free function that turns a number from 0 to 5 into a star string with half stars.',
    codeRepository: 'https://github.com/mhfrough/star-rating',
    url: 'https://www.npmjs.com/package/@mhfrough/star-rating',
    programmingLanguage: 'JavaScript',
    license: 'https://opensource.org/licenses/MIT',
    dateCreated: '2025-07-20',
    author: { '@id': PERSON_ID },
  };
  return {
    '@type': 'ItemList',
    '@id': abs('/work') + '#projects',
    name: 'Selected work',
    numberOfItems: rest.length + 3,
    itemListElement: [featured, ...rest, icons, pkg].map((item, i) => ({ '@type': 'ListItem', position: i + 1, item })),
  };
}
