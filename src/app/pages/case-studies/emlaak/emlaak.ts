import { ChangeDetectionStrategy, Component, afterNextRender, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  phosphorArrowRight,
  phosphorArrowUpRight,
  phosphorArrowsLeftRight,
  phosphorBank,
  phosphorBuildings,
  phosphorChartLineUp,
  phosphorChartPieSlice,
  phosphorCheck,
  phosphorFilePdf,
  phosphorGauge,
  phosphorIdentificationCard,
  phosphorListChecks,
  phosphorScales,
} from '@ng-icons/phosphor-icons/regular';
import { PERSON_ID, Seo, abs } from '../../../core/seo/seo.service';
import { Reveal } from '../../../shared/directives/reveal.directive';
import { TechPills } from '../stack/tech-pills';
import { COPY, LIVE_URL } from './emlaak.copy';
import { EmlaakTheme } from './emlaak-theme';
import { EmlaakInvestDemo } from './invest-demo';
import { EmlaakMasksDemo } from './masks-demo';
import { EmlaakPortfolioDemo } from './portfolio-demo';
import { EmlaakRiskDemo } from './risk-demo';

const PATH = '/work/emlaak';
const OG_IMAGE = '/og/og-emlaak.jpg';

/**
 * Emlaak Financials case study. The whole route (nav + footer included) wears Emlaak's blue and green via
 * <html data-theme="emlaak"> (route data) + the token overrides loaded by <mh-emlaak-theme>.
 * Only the public site appears as screenshots; the investor app is shown as my own working mockups.
 */
@Component({
  selector: 'mh-page-emlaak',
  imports: [
    RouterLink,
    NgIcon,
    Reveal,
    EmlaakTheme,
    EmlaakInvestDemo,
    EmlaakMasksDemo,
    EmlaakRiskDemo,
    EmlaakPortfolioDemo,
    TechPills,
  ],
  viewProviders: [
    provideIcons({
      phosphorArrowRight,
      phosphorArrowUpRight,
      phosphorArrowsLeftRight,
      phosphorBank,
      phosphorBuildings,
      phosphorChartLineUp,
      phosphorChartPieSlice,
      phosphorCheck,
      phosphorFilePdf,
      phosphorGauge,
      phosphorIdentificationCard,
      phosphorListChecks,
      phosphorScales,
    }),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './emlaak.html',
  styleUrl: './emlaak.scss',
})
export class EmlaakCaseStudy {
  protected readonly c = COPY;
  protected readonly live = LIVE_URL;
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
        { name: 'Emlaak Financials', path: PATH },
      ],
      jsonLd: [
        {
          '@type': 'Article',
          '@id': url + '#article',
          headline: 'Emlaak Financials: every mutual fund, one account',
          description: COPY.seo.description,
          inLanguage: 'en',
          image: abs(OG_IMAGE),
          author: { '@id': PERSON_ID },
          publisher: { '@id': PERSON_ID },
          mainEntityOfPage: { '@id': url + '#webpage' },
          keywords: ['Angular', 'Angular Material', 'ngx-charts', 'fintech', 'mutual funds', 'digital KYC', 'risk profiling', 'Pakistan'],
          about: {
            '@type': 'WebApplication',
            name: 'Emlaak Financials',
            url: LIVE_URL,
            applicationCategory: 'FinanceApplication',
            operatingSystem: 'Web',
          },
        },
      ],
    });

    afterNextRender(() => requestAnimationFrame(() => this.ready.set(true)));
  }
}
