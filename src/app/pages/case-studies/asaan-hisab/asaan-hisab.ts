import { ChangeDetectionStrategy, Component, afterNextRender, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  phosphorArrowDownLeft,
  phosphorArrowRight,
  phosphorArrowUpRight,
  phosphorArrowsSplit,
  phosphorChartBar,
  phosphorFilePdf,
  phosphorHandCoins,
  phosphorInvoice,
  phosphorLockSimple,
  phosphorMagnifyingGlass,
  phosphorScales,
  phosphorTable,
} from '@ng-icons/phosphor-icons/regular';
import { PERSON_ID, Seo, abs } from '../../../core/seo/seo.service';
import { Reveal } from '../../../shared/directives/reveal.directive';
import { TechPills } from '../stack/tech-pills';
import { COPY, LIVE_URL } from './asaan-hisab.copy';
import { AsaanHisabTheme } from './asaan-hisab-theme';
import { HEADS } from './books';
import { AsaanHisabInvoiceDemo } from './invoice-demo';
import { AsaanHisabJournalDemo } from './journal-demo';
import { AsaanHisabReportsDemo } from './reports-demo';

const PATH = '/work/asaan-hisab';
const OG_IMAGE = '/og/og-asaan-hisab.jpg';

/**
 * Asaan Hisab case study: free accounting and invoicing for small businesses, the owner's first production
 * project (2020). The route wears the app's blue and cool greys via <html data-theme="asaan-hisab">. Only the
 * public sign-up page appears as screenshots; the accounting app behind sign-in is shown as my own working mockups
 * over one invented set of books (books.ts), so the hero, the invoice and the reports agree with each other.
 */
@Component({
  selector: 'mh-page-asaan-hisab',
  imports: [RouterLink, NgIcon, Reveal, AsaanHisabTheme, AsaanHisabJournalDemo, AsaanHisabInvoiceDemo, AsaanHisabReportsDemo, TechPills],
  viewProviders: [
    provideIcons({
      phosphorArrowDownLeft,
      phosphorArrowRight,
      phosphorArrowUpRight,
      phosphorArrowsSplit,
      phosphorChartBar,
      phosphorFilePdf,
      phosphorHandCoins,
      phosphorInvoice,
      phosphorLockSimple,
      phosphorMagnifyingGlass,
      phosphorScales,
      phosphorTable,
    }),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './asaan-hisab.html',
  styleUrl: './asaan-hisab.scss',
})
export class AsaanHisabCaseStudy {
  protected readonly c = COPY;
  protected readonly live = LIVE_URL;
  /** The chart of accounts' five heads, listed inside the architecture core. */
  protected readonly heads = HEADS.map((h) => `${h.code} ${h.name}`);
  protected readonly ready = signal(false);

  constructor() {
    const url = abs(PATH);
    inject(Seo).set({
      title: COPY.seo.title,
      description: COPY.seo.description,
      path: PATH,
      type: 'article',
      image: OG_IMAGE,
      imageAlt: COPY.seo.imageAlt,
      breadcrumbs: [
        { name: 'Work', path: '/work' },
        { name: 'Asaan Hisab', path: PATH },
      ],
      jsonLd: [
        {
          '@type': 'Article',
          '@id': url + '#article',
          headline: 'Asaan Hisab: bookkeeping, in plain words',
          description: COPY.seo.description,
          inLanguage: 'en',
          image: abs(OG_IMAGE),
          author: { '@id': PERSON_ID },
          publisher: { '@id': PERSON_ID },
          mainEntityOfPage: { '@id': url + '#webpage' },
          about: { '@type': 'SoftwareApplication', name: 'Asaan Hisab', url: LIVE_URL, applicationCategory: 'BusinessApplication' },
          keywords: ['Angular', 'accounting', 'double-entry bookkeeping', 'invoicing', 'sales tax', 'financial reports', 'ag-Grid', 'SME'],
        },
      ],
    });

    afterNextRender(() => requestAnimationFrame(() => this.ready.set(true)));
  }
}
