import { ChangeDetectionStrategy, Component, afterNextRender, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  phosphorArrowRight,
  phosphorBookOpen,
  phosphorCalculator,
  phosphorIdentificationCard,
  phosphorMapPin,
  phosphorMoney,
  phosphorSlidersHorizontal,
  phosphorStack,
} from '@ng-icons/phosphor-icons/regular';
import { PERSON_ID, Seo, abs } from '../../../core/seo/seo.service';
import { Reveal } from '../../../shared/directives/reveal.directive';
import { TechPills } from '../stack/tech-pills';
import { TmfCalcDemo } from './calc-demo';
import { TmfChainDemo } from './chain-demo';
import { TmfLimitsDemo } from './limits-demo';
import { COPY } from './tmf.copy';
import { TmfTheme } from './tmf-theme';

const PATH = '/work/tmf';
const OG_IMAGE = '/og/og-tmf.jpg';

/**
 * TMF case study: the loan-management platform of Thardeep Microfinance Foundation, a microfinance foundation in
 * Pakistan, named with the owner's approval. The route wears the app's sand and leaf green via <html data-theme="tmf">.
 * The app is staff-only and has no public site, so there are no screenshots: the approval chain, the calculator
 * and the role limits screen are my own working mockups with sample data.
 */
@Component({
  selector: 'mh-page-tmf',
  imports: [RouterLink, NgIcon, Reveal, TmfTheme, TmfChainDemo, TmfCalcDemo, TmfLimitsDemo, TechPills],
  viewProviders: [
    provideIcons({
      phosphorArrowRight,
      phosphorBookOpen,
      phosphorCalculator,
      phosphorIdentificationCard,
      phosphorMapPin,
      phosphorMoney,
      phosphorSlidersHorizontal,
      phosphorStack,
    }),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './tmf.html',
  styleUrl: './tmf.scss',
})
export class TmfCaseStudy {
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
        { name: 'TMF', path: PATH },
      ],
      jsonLd: [
        {
          '@type': 'Article',
          '@id': url + '#article',
          headline: 'Thardeep Microfinance Foundation: nine desks between a loan and its cheque',
          description: COPY.seo.description,
          inLanguage: 'en',
          image: abs(OG_IMAGE),
          author: { '@id': PERSON_ID },
          publisher: { '@id': PERSON_ID },
          mainEntityOfPage: { '@id': url + '#webpage' },
          keywords: ['Thardeep Microfinance Foundation', 'Angular', 'Angular Material', 'microfinance', 'loan management', 'approval workflow', 'role-based access', 'EMI schedule'],
        },
      ],
    });

    afterNextRender(() => requestAnimationFrame(() => this.ready.set(true)));
  }
}
