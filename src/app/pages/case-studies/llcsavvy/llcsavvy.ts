import { ChangeDetectionStrategy, Component, afterNextRender, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  phosphorArrowRight,
  phosphorBank,
  phosphorCurrencyDollar,
  phosphorGlobe,
  phosphorKey,
  phosphorListNumbers,
  phosphorReceipt,
  phosphorTag,
  phosphorTray,
} from '@ng-icons/phosphor-icons/regular';
import { PERSON_ID, Seo, abs } from '../../../core/seo/seo.service';
import { Reveal } from '../../../shared/directives/reveal.directive';
import { TechPills } from '../stack/tech-pills';
import { LlcsavvyCheckoutDemo } from './checkout-demo';
import { COPY } from './llcsavvy.copy';
import { LlcsavvyTheme } from './llcsavvy-theme';
import { LlcsavvyPayDemo } from './pay-demo';
import { LlcsavvyPromoDemo } from './promo-demo';
import { LlcsavvySister } from './sister';

const PATH = '/work/llcsavvy';
const OG_IMAGE = '/og/og-llcsavvy.jpg';

/**
 * LLC SAVVY case study: US company formation for founders in Pakistan, Finclore's sister on the same Angular base.
 * The route wears the product's navy, red and crescent green via <html data-theme="llcsavvy">. Same template as
 * the Finclore page; where Finclore shows its logo, this page shows what the sister kept and changed. The public
 * site appears as screenshots of the original build rendered against a sample API; the checkout, the two payment
 * flows and the promo codes are my own working mockups.
 */
@Component({
  selector: 'mh-page-llcsavvy',
  imports: [
    RouterLink,
    NgIcon,
    Reveal,
    LlcsavvyTheme,
    LlcsavvyCheckoutDemo,
    LlcsavvySister,
    LlcsavvyPayDemo,
    LlcsavvyPromoDemo,
    TechPills,
  ],
  viewProviders: [
    provideIcons({
      phosphorArrowRight,
      phosphorBank,
      phosphorCurrencyDollar,
      phosphorGlobe,
      phosphorKey,
      phosphorListNumbers,
      phosphorReceipt,
      phosphorTag,
      phosphorTray,
    }),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './llcsavvy.html',
  styleUrl: './llcsavvy.scss',
})
export class LlcsavvyCaseStudy {
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
        { name: 'LLC SAVVY', path: PATH },
      ],
      jsonLd: [
        {
          '@type': 'Article',
          '@id': url + '#article',
          headline: 'LLC SAVVY: a US company, paid for in rupees',
          description: COPY.seo.description,
          inLanguage: 'en',
          image: abs(OG_IMAGE),
          author: { '@id': PERSON_ID },
          publisher: { '@id': PERSON_ID },
          mainEntityOfPage: { '@id': url + '#webpage' },
          keywords: ['Angular', 'Angular Universal', 'checkout', 'direct debit', 'one-time password', 'promo codes', 'company formation'],
        },
      ],
    });

    afterNextRender(() => requestAnimationFrame(() => this.ready.set(true)));
  }
}
