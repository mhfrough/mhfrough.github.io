import { ChangeDetectionStrategy, Component, afterNextRender, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  phosphorArrowRight,
  phosphorColumns,
  phosphorDatabase,
  phosphorFilePdf,
  phosphorFiles,
  phosphorReceipt,
  phosphorStack,
  phosphorTreeStructure,
  phosphorUserCheck,
} from '@ng-icons/phosphor-icons/regular';
import { PERSON_ID, Seo, abs } from '../../../core/seo/seo.service';
import { Reveal } from '../../../shared/directives/reveal.directive';
import { TechPills } from '../stack/tech-pills';
import { DmaxColumnsDemo } from './columns-demo';
import { COPY } from './dmax.copy';
import { DmaxTheme } from './dmax-theme';
import { DmaxJobDemo } from './job-demo';
import { DmaxQueueDemo } from './queue-demo';
import { DmaxStatementDemo } from './statement-demo';

const PATH = '/work/dmax';
const OG_IMAGE = '/og/og-dmax.jpg';

/**
 * DMAX case study: a banking data-extraction product with three extraction consoles (DB2, flat files, MongoDB) and a
 * statements app. The route wears the product's navy, green and blue via <html data-theme="dmax">. DMAX is internal,
 * so there are no screenshots: the console, headers and statements are my own working mockups with invented data.
 * The company behind the product and its client banks are never named.
 */
@Component({
  selector: 'mh-page-dmax',
  imports: [
    RouterLink,
    NgIcon,
    Reveal,
    DmaxTheme,
    DmaxJobDemo,
    DmaxQueueDemo,
    DmaxColumnsDemo,
    DmaxStatementDemo,
    TechPills,
  ],
  viewProviders: [
    provideIcons({
      phosphorArrowRight,
      phosphorColumns,
      phosphorDatabase,
      phosphorFilePdf,
      phosphorFiles,
      phosphorReceipt,
      phosphorStack,
      phosphorTreeStructure,
      phosphorUserCheck,
    }),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './dmax.html',
  styleUrl: './dmax.scss',
})
export class DmaxCaseStudy {
  protected readonly c = COPY;
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
        { name: 'DMAX', path: PATH },
      ],
      jsonLd: [
        {
          '@type': 'Article',
          '@id': url + '#article',
          headline: 'DMAX: core banking data, extracted and accounted for',
          description: COPY.seo.description,
          inLanguage: 'en',
          image: abs(OG_IMAGE),
          author: { '@id': PERSON_ID },
          publisher: { '@id': PERSON_ID },
          mainEntityOfPage: { '@id': url + '#webpage' },
          keywords: ['Angular', 'data extraction', 'banking', 'DB2', 'MongoDB', 'job monitoring', 'customer statements', 'jsPDF'],
        },
      ],
    });

    afterNextRender(() => requestAnimationFrame(() => this.ready.set(true)));
  }
}
