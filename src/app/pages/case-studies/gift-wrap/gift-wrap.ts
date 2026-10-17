import { ChangeDetectionStrategy, Component, afterNextRender, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  phosphorArrowRight,
  phosphorCalculator,
  phosphorDatabase,
  phosphorDeviceMobile,
  phosphorFlask,
  phosphorGauge,
  phosphorGift,
  phosphorHouse,
  phosphorMagnifyingGlass,
  phosphorPackage,
  phosphorPlugs,
  phosphorShoppingBag,
} from '@ng-icons/phosphor-icons/regular';
import { PERSON_ID, Seo, abs } from '../../../core/seo/seo.service';
import { Reveal } from '../../../shared/directives/reveal.directive';
import { TechPills } from '../stack/tech-pills';
import { GiftWrapBuilderDemo } from './builder-demo';
import { COPY } from './gift-wrap.copy';
import { GiftWrapTheme } from './gift-wrap-theme';

const PATH = '/work/gift-wrap';
const OG_IMAGE = '/og/og-gift-wrap.jpg';

/**
 * Gift Wrap case study: a thesis project, an Angular storefront where buyers build their own gift basket. The
 * route wears the storefront's rose and wine via <html data-theme="gift-wrap">. Screens are the original build
 * rendered locally with its sample catalogue; the hero studio is my own working component.
 */
@Component({
  selector: 'mh-page-gift-wrap',
  imports: [RouterLink, NgIcon, Reveal, GiftWrapTheme, GiftWrapBuilderDemo, TechPills],
  viewProviders: [
    provideIcons({
      phosphorArrowRight,
      phosphorCalculator,
      phosphorDatabase,
      phosphorDeviceMobile,
      phosphorFlask,
      phosphorGauge,
      phosphorGift,
      phosphorHouse,
      phosphorMagnifyingGlass,
      phosphorPackage,
      phosphorPlugs,
      phosphorShoppingBag,
    }),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './gift-wrap.html',
  styleUrl: './gift-wrap.scss',
})
export class GiftWrapCaseStudy {
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
        { name: 'Gift Wrap', path: PATH },
      ],
      jsonLd: [
        {
          '@type': 'CreativeWork',
          '@id': url + '#work',
          name: 'Gift Wrap',
          alternativeHeadline: 'Choose. Customize. Deliver happiness.',
          description: COPY.seo.description,
          genre: 'Thesis project',
          inLanguage: 'en',
          image: abs(OG_IMAGE),
          creator: { '@id': PERSON_ID },
          mainEntityOfPage: { '@id': url + '#webpage' },
          keywords: ['Angular 17', 'signals', 'e-commerce', 'gift basket builder', 'Bootstrap 5', 'PWA', 'Netlify', 'thesis project'],
        },
      ],
    });

    afterNextRender(() => requestAnimationFrame(() => this.ready.set(true)));
  }
}
