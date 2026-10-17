import { ChangeDetectionStrategy, Component, afterNextRender, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  phosphorArrowRight,
  phosphorBellRinging,
  phosphorClock,
  phosphorCreditCard,
  phosphorDeviceMobile,
  phosphorMapPin,
  phosphorMoney,
  phosphorPalette,
  phosphorPlugs,
  phosphorReceipt,
  phosphorStorefront,
  phosphorTextAa,
  phosphorUsersThree,
} from '@ng-icons/phosphor-icons/regular';
import { PERSON_ID, Seo, abs } from '../../../core/seo/seo.service';
import { Reveal } from '../../../shared/directives/reveal.directive';
import { TechPills } from '../stack/tech-pills';
import { BRANDS } from './brands';
import { COPY } from './pizzerias.copy';
import { PizzeriasTheme } from './pizzerias-theme';
import { SHOTS } from './shots';
import { PizzeriasStorefrontDemo } from './storefront-demo';
import { PizzeriasTrackerDemo } from './tracker-demo';

const PATH = '/work/pizzerias';
const OG_IMAGE = '/og/og-pizzerias.jpg';

/**
 * Pizzerias case study: one storefront template across seven brands. The route wears the template's tomato,
 * cheese and basil via <html data-theme="pizzerias"> + the token overrides loaded by <mh-pizzerias-theme>.
 * The live sites are offline: the screenshots are the original builds rendered against a sample API, and the
 * demos are my own redraws with sample menus.
 */
@Component({
  selector: 'mh-page-pizzerias',
  imports: [RouterLink, NgIcon, Reveal, PizzeriasTheme, PizzeriasStorefrontDemo, PizzeriasTrackerDemo, TechPills],
  viewProviders: [
    provideIcons({
      phosphorArrowRight,
      phosphorBellRinging,
      phosphorClock,
      phosphorCreditCard,
      phosphorDeviceMobile,
      phosphorMapPin,
      phosphorMoney,
      phosphorPalette,
      phosphorPlugs,
      phosphorReceipt,
      phosphorStorefront,
      phosphorTextAa,
      phosphorUsersThree,
    }),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './pizzerias.html',
  styleUrl: './pizzerias.scss',
})
export class PizzeriasCaseStudy {
  protected readonly c = COPY;
  protected readonly shots = SHOTS;
  /** Every storefront, in launch order of the template generations: the first Roma design, then the rest. */
  protected readonly stores = [COPY.brands.classic, ...[...BRANDS].sort((a, b) => a.gen - b.gen)];
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
        { name: 'Pizzerias', path: PATH },
      ],
      jsonLd: [
        {
          '@type': 'Article',
          '@id': url + '#article',
          headline: 'Seven pizzerias, one storefront template',
          description: COPY.seo.description,
          inLanguage: 'en',
          image: abs(OG_IMAGE),
          author: { '@id': PERSON_ID },
          publisher: { '@id': PERSON_ID },
          mainEntityOfPage: { '@id': url + '#webpage' },
          keywords: ['Angular', 'food ordering', 'multi-brand', 'white label', 'PayPal', 'OTP', 'order tracking', 'Germany'],
        },
      ],
    });

    afterNextRender(() => requestAnimationFrame(() => this.ready.set(true)));
  }
}
