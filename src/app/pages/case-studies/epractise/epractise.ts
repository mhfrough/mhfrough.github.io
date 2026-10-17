import { ChangeDetectionStrategy, Component, afterNextRender, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  phosphorArrowRight,
  phosphorBellRinging,
  phosphorCreditCard,
  phosphorEnvelopeSimple,
  phosphorIdentificationCard,
  phosphorStack,
  phosphorTag,
  phosphorUserCircle,
  phosphorUsersThree,
} from '@ng-icons/phosphor-icons/regular';
import { PERSON_ID, Seo, abs } from '../../../core/seo/seo.service';
import { Reveal } from '../../../shared/directives/reveal.directive';
import { TechPills } from '../stack/tech-pills';
import { COPY } from './epractise.copy';
import { EpractiseTheme } from './epractise-theme';
import { EpractiseInvoiceDemo } from './invoice-demo';
import { EpractiseOrganizerDemo } from './organizer-demo';
import { EpractisePipelineDemo } from './pipeline-demo';
import { EpractisePortalDemo } from './portal-demo';
import { EpractiseProvisionDemo } from './provision-demo';

const PATH = '/work/epractise';
const OG_IMAGE = '/og/og-epractise.jpg';

/**
 * ePractise case study: practice-management software for tax and accounting firms. The route wears the product's
 * blue via <html data-theme="epractise">. The public site appears as screenshots of epractise.com; tenant
 * management, the firm workspace and the client portal are behind sign-in and are shown as my own working mockups.
 */
@Component({
  selector: 'mh-page-epractise',
  imports: [
    RouterLink,
    NgIcon,
    Reveal,
    EpractiseTheme,
    EpractiseProvisionDemo,
    EpractisePipelineDemo,
    EpractiseOrganizerDemo,
    EpractisePortalDemo,
    EpractiseInvoiceDemo,
    TechPills,
  ],
  viewProviders: [
    provideIcons({
      phosphorArrowRight,
      phosphorBellRinging,
      phosphorCreditCard,
      phosphorEnvelopeSimple,
      phosphorIdentificationCard,
      phosphorStack,
      phosphorTag,
      phosphorUserCircle,
      phosphorUsersThree,
    }),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './epractise.html',
  styleUrl: './epractise.scss',
})
export class EpractiseCaseStudy {
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
        { name: 'ePractise', path: PATH },
      ],
      jsonLd: [
        {
          '@type': 'Article',
          '@id': url + '#article',
          headline: 'ePractise: a tax firm, run from one workspace',
          description: COPY.seo.description,
          inLanguage: 'en',
          image: abs(OG_IMAGE),
          author: { '@id': PERSON_ID },
          publisher: { '@id': PERSON_ID },
          mainEntityOfPage: { '@id': url + '#webpage' },
          keywords: ['Angular', 'multi-tenant SaaS', 'tenant provisioning', 'practice management', 'tax firms', 'client portal', 'PrimeNG', 'Firebase'],
        },
      ],
    });

    afterNextRender(() => requestAnimationFrame(() => this.ready.set(true)));
  }
}
