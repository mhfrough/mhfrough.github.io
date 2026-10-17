import { ChangeDetectionStrategy, Component, afterNextRender, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  phosphorArrowRight,
  phosphorArrowUpRight,
  phosphorBank,
  phosphorBellRinging,
  phosphorBrowser,
  phosphorBriefcase,
  phosphorBuildings,
  phosphorCalculator,
  phosphorChartBar,
  phosphorChartLine,
  phosphorChatCircleDots,
  phosphorCreditCard,
  phosphorGlobe,
  phosphorMegaphone,
  phosphorReceipt,
  phosphorScales,
  phosphorSealCheck,
  phosphorShieldCheck,
  phosphorSignIn,
  phosphorSquaresFour,
  phosphorStack,
  phosphorStorefront,
  phosphorTray,
  phosphorUserCircleCheck,
  phosphorUserGear,
  phosphorUserSwitch,
  phosphorUsers,
  phosphorUsersThree,
  phosphorWallet,
  phosphorWhatsappLogo,
} from '@ng-icons/phosphor-icons/regular';
import { PERSON_ID, Seo, abs } from '../../../core/seo/seo.service';
import { Reveal } from '../../../shared/directives/reveal.directive';
import { COLLAB, COPY, EMBEDDED, LIVE_URL, PAYMENTS } from './befiler.copy';
import { TechPills } from '../stack/tech-pills';
import { BefilerTheme } from './befiler-theme';
import { BefilerDashboardDemo } from './dashboard-demo';
import { BefilerPartnerDemo } from './partner-demo';
import { BefilerReturnDemo } from './return-demo';
import { BefilerTrackerDemo } from './tracker-demo';

const PATH = '/work/befiler';
const OG_IMAGE = '/og/og-befiler.jpg';

/**
 * Befiler case study. The whole route (nav + footer included) wears befiler.com's own light theme via
 * <html data-theme="befiler"> (route data) + the token overrides loaded by <mh-befiler-theme>.
 * Only the public marketing site appears as screenshots; the apps are shown as my own working mockups.
 */
@Component({
  selector: 'mh-page-befiler',
  imports: [RouterLink, NgIcon, Reveal, BefilerTheme, BefilerReturnDemo, BefilerPartnerDemo, BefilerDashboardDemo, BefilerTrackerDemo, TechPills],
  viewProviders: [
    provideIcons({
      phosphorArrowRight,
      phosphorArrowUpRight,
      phosphorBank,
      phosphorBellRinging,
      phosphorBrowser,
      phosphorBriefcase,
      phosphorBuildings,
      phosphorCalculator,
      phosphorChartBar,
      phosphorChartLine,
      phosphorChatCircleDots,
      phosphorCreditCard,
      phosphorGlobe,
      phosphorMegaphone,
      phosphorReceipt,
      phosphorScales,
      phosphorSealCheck,
      phosphorShieldCheck,
      phosphorSignIn,
      phosphorSquaresFour,
      phosphorStack,
      phosphorStorefront,
      phosphorTray,
      phosphorUserCircleCheck,
      phosphorUserGear,
      phosphorUserSwitch,
      phosphorUsers,
      phosphorUsersThree,
      phosphorWallet,
      phosphorWhatsappLogo,
    }),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './befiler.html',
  styleUrl: './befiler.scss',
})
export class BefilerCaseStudy {
  protected readonly c = COPY;
  protected readonly live = LIVE_URL;
  protected readonly embedded = EMBEDDED;
  protected readonly payments = PAYMENTS;
  protected readonly collab = COLLAB;
  protected readonly flowTab = signal<'portal' | 'widget'>('portal');
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
        { name: 'Befiler', path: PATH },
      ],
      jsonLd: [
        {
          '@type': 'Article',
          '@id': url + '#article',
          headline: 'Befiler: tax returns, filed from any app',
          description: COPY.seo.description,
          inLanguage: 'en',
          image: abs(OG_IMAGE),
          author: { '@id': PERSON_ID },
          publisher: { '@id': PERSON_ID },
          mainEntityOfPage: { '@id': url + '#webpage' },
          keywords: ['Angular', 'micro-frontends', 'embeddable widget', 'fintech', 'tax filing', 'sales tax', 'USA LLC', 'admin portal', 'Pakistan', 'Urdu RTL'],
          about: {
            '@type': 'WebApplication',
            name: 'Befiler',
            url: LIVE_URL,
            applicationCategory: 'FinanceApplication',
            operatingSystem: 'Web, Android, iOS',
          },
        },
      ],
    });

    afterNextRender(() => requestAnimationFrame(() => this.ready.set(true)));
  }

  protected onFlowKey(e: KeyboardEvent): void {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    e.preventDefault();
    const next = this.flowTab() === 'portal' ? 'widget' : 'portal';
    this.flowTab.set(next);
    document.getElementById('flow-tab-' + next)?.focus();
  }
}
