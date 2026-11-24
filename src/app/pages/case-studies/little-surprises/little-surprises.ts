import { ChangeDetectionStrategy, Component, afterNextRender, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  phosphorArrowRight,
  phosphorArrowUpRight,
  phosphorCalculator,
  phosphorChatCircleText,
  phosphorCloud,
  phosphorDatabase,
  phosphorDeviceMobile,
  phosphorEnvelope,
  phosphorGauge,
  phosphorGift,
  phosphorHouse,
  phosphorPackage,
  phosphorShoppingBag,
} from '@ng-icons/phosphor-icons/regular';
import { PERSON_ID, Seo, abs } from '../../../core/seo/seo.service';
import { Reveal } from '../../../shared/directives/reveal.directive';
import { TechPills } from '../stack/tech-pills';
import { LittleSurprisesBuilderDemo } from './builder-demo';
import { COPY } from './little-surprises.copy';
import { LittleSurprisesTheme } from './little-surprises-theme';

const PATH = '/work/little-surprises';
const OG_IMAGE = '/og/og-little-surprises.jpg';

/**
 * Little Surprises case study: my own gift shop (with my wife), live at littlesurprises.shop. The route wears the
 * storefront's plum and rose via <html data-theme="little-surprises">. Screens are the live public shop; the hero
 * builder is my own working component with the shop's prices.
 */
@Component({
  selector: 'mh-page-little-surprises',
  imports: [RouterLink, NgIcon, Reveal, LittleSurprisesTheme, LittleSurprisesBuilderDemo, TechPills],
  viewProviders: [
    provideIcons({
      phosphorArrowRight,
      phosphorArrowUpRight,
      phosphorCalculator,
      phosphorChatCircleText,
      phosphorCloud,
      phosphorDatabase,
      phosphorDeviceMobile,
      phosphorEnvelope,
      phosphorGauge,
      phosphorGift,
      phosphorHouse,
      phosphorPackage,
      phosphorShoppingBag,
    }),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './little-surprises.html',
  styleUrl: './little-surprises.scss',
})
export class LittleSurprisesCaseStudy {
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
        { name: 'Little Surprises', path: PATH },
      ],
      jsonLd: [
        {
          '@type': 'CreativeWork',
          '@id': url + '#work',
          name: 'Little Surprises',
          alternativeHeadline: 'Choose, customize, deliver happiness.',
          url: COPY.hero.liveUrl,
          description: COPY.seo.description,
          genre: 'E-commerce startup',
          inLanguage: 'en',
          image: abs(OG_IMAGE),
          creator: { '@id': PERSON_ID },
          mainEntityOfPage: { '@id': url + '#webpage' },
          keywords: ['Angular 21', 'SSR prerender', 'NestJS', 'PostgreSQL', 'e-commerce', 'gift basket builder', 'Pakistan', 'WhatsApp ordering'],
        },
      ],
    });

    afterNextRender(() => requestAnimationFrame(() => this.ready.set(true)));
  }
}
