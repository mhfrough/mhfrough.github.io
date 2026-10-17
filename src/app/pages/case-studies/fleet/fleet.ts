import { ChangeDetectionStrategy, Component, afterNextRender, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  phosphorArrowRight,
  phosphorBroadcast,
  phosphorChatCircleDots,
  phosphorChatsCircle,
  phosphorCloudArrowUp,
  phosphorCreditCard,
  phosphorDesktop,
  phosphorDeviceMobile,
  phosphorDeviceTablet,
  phosphorEnvelopeSimple,
  phosphorFilePdf,
  phosphorFingerprint,
  phosphorReceipt,
  phosphorSquaresFour,
  phosphorTreeStructure,
} from '@ng-icons/phosphor-icons/regular';
import { PERSON_ID, Seo, abs } from '../../../core/seo/seo.service';
import { Reveal } from '../../../shared/directives/reveal.directive';
import { TechPills } from '../stack/tech-pills';
import { FleetCardDemo } from './card-demo';
import { COPY } from './fleet.copy';
import { FleetPaymentDemo } from './payment-demo';
import { FleetTheme } from './fleet-theme';
import { FleetWalkaroundDemo } from './walkaround-demo';

const PATH = '/work/fleet';
const OG_IMAGE = '/og/og-fleet.jpg';

/**
 * Fleet and driver management SaaS case study, anonymized: the client, its brand and region are never named.
 * The whole route wears a neutral "depot" theme of my own (<html data-theme="fleet">, loaded by <mh-fleet-theme>).
 * Admin screenshots are the real build rendered against invented data; the driver app is shown as my own mockups.
 */
@Component({
  selector: 'mh-page-fleet',
  imports: [RouterLink, NgIcon, Reveal, FleetTheme, FleetCardDemo, FleetWalkaroundDemo, FleetPaymentDemo, TechPills],
  viewProviders: [
    provideIcons({
      phosphorArrowRight,
      phosphorBroadcast,
      phosphorChatCircleDots,
      phosphorChatsCircle,
      phosphorCloudArrowUp,
      phosphorCreditCard,
      phosphorDesktop,
      phosphorDeviceMobile,
      phosphorDeviceTablet,
      phosphorEnvelopeSimple,
      phosphorFilePdf,
      phosphorFingerprint,
      phosphorReceipt,
      phosphorSquaresFour,
      phosphorTreeStructure,
    }),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './fleet.html',
  styleUrl: './fleet.scss',
})
export class FleetCaseStudy {
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
        { name: 'Fleet and driver SaaS', path: PATH },
      ],
      jsonLd: [
        {
          '@type': 'CreativeWork',
          '@id': url + '#work',
          name: 'Fleet and driver management SaaS',
          headline: 'Fleet and driver SaaS: one API for the office, the depot and the driver',
          description: COPY.seo.description,
          inLanguage: 'en',
          image: abs(OG_IMAGE),
          dateCreated: '2026',
          creator: { '@id': PERSON_ID },
          author: { '@id': PERSON_ID },
          mainEntityOfPage: { '@id': url + '#webpage' },
          genre: 'Case study',
          keywords: [
            'Angular',
            'NestJS',
            'PostgreSQL',
            'Flutter',
            'multi-tenant SaaS',
            'WebAuthn passkeys',
            'Stripe',
            'Socket.IO',
            'fleet management',
          ],
        },
      ],
    });

    afterNextRender(() => requestAnimationFrame(() => this.ready.set(true)));
  }
}
