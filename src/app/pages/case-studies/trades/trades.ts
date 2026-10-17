import { ChangeDetectionStrategy, Component, afterNextRender, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  phosphorArrowRight,
  phosphorArrowUpRight,
  phosphorClock,
  phosphorEnvelopeSimple,
  phosphorStar,
  phosphorWhatsappLogo,
} from '@ng-icons/phosphor-icons/regular';
import { PERSON_ID, Seo, abs } from '../../../core/seo/seo.service';
import { Reveal } from '../../../shared/directives/reveal.directive';
import { TechPills } from '../stack/tech-pills';
import { TradesCalloutDemo } from './callout-demo';
import { TradesExplorerDemo } from './trades-demo';
import { COPY, LIVE_URL } from './trades.copy';
import { TradesTheme } from './trades-theme';

const PATH = '/work/trades';
const OG_IMAGE = '/og/og-trades.jpg';

/** Screenshots from scripts/trades-shots.mjs: SOS24's original build served locally, AK's live site. */
const SHOTS = {
  homes: [
    {
      url: COPY.site.sosUrl,
      src: '/images/trades/sos24-home.webp',
      alt: 'SOS24 home page: the coloured SOS24 logo, a navy menu, and a photo slider of an electrician at work captioned "Electrician Services".',
    },
    {
      url: COPY.site.akUrl,
      src: '/images/trades/ak-home.webp',
      alt: 'AK Heating and Plumbing home page: "Heating and plumbing services" in amber over a dark photo of ducting, with an amber Contact Us button for WhatsApp.',
    },
  ],
  details: [
    {
      src: '/images/trades/sos24-service.webp',
      alt: 'SOS24 plumbing page: "Plumbing services" banner, an introduction, why choose our emergency plumbers, and the list of common emergency jobs.',
      cap: 'SOS24, one page per trade',
    },
    {
      src: '/images/trades/ak-services.webp',
      alt: 'AK services page: cards for plumber, gas engineer, electrician, combi boiler switch, heat pump, boiler service, cylinders and range cookers.',
      cap: 'AK, ten heating and gas services',
    },
    {
      src: '/images/trades/ak-reviews.webp',
      alt: 'AK review form: a five-star rating, a feedback box, name and email fields and a Submit button.',
      cap: 'AK, the review form',
    },
  ],
};

/**
 * Trades case study: SOS24 and AK Heating and Plumbing, two Nottingham call-out businesses on one Angular
 * template. The route wears the template's navy and AK's amber via <html data-theme="trades">.
 */
@Component({
  selector: 'mh-page-trades',
  imports: [RouterLink, NgIcon, Reveal, TradesTheme, TradesCalloutDemo, TradesExplorerDemo, TechPills],
  viewProviders: [
    provideIcons({ phosphorArrowRight, phosphorArrowUpRight, phosphorClock, phosphorEnvelopeSimple, phosphorStar, phosphorWhatsappLogo }),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './trades.html',
  styleUrl: './trades.scss',
})
export class TradesCaseStudy {
  protected readonly c = COPY;
  protected readonly live = LIVE_URL;
  protected readonly shots = SHOTS;
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
        { name: 'Trades sites', path: PATH },
      ],
      jsonLd: [
        {
          '@type': 'Article',
          '@id': url + '#article',
          headline: 'Two call-out services, one Angular template',
          description: COPY.seo.description,
          inLanguage: 'en',
          image: abs(OG_IMAGE),
          author: { '@id': PERSON_ID },
          publisher: { '@id': PERSON_ID },
          mainEntityOfPage: { '@id': url + '#webpage' },
          keywords: ['Angular', 'Angular SSR', 'Firebase Hosting', 'local business', 'trades', 'lead capture', 'Nottingham'],
        },
      ],
    });

    afterNextRender(() => requestAnimationFrame(() => this.ready.set(true)));
  }
}
