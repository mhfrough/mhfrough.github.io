import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  afterNextRender,
  inject,
  viewChild,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  phosphorArrowRight,
  phosphorCalendarBlank,
  phosphorChatCircleText,
  phosphorCheck,
  phosphorCube,
  phosphorGlobe,
  phosphorHammer,
  phosphorKey,
  phosphorLifebuoy,
  phosphorMagnifyingGlass,
  phosphorPlus,
  phosphorRocket,
  phosphorSignpost,
  phosphorTestTube,
  phosphorTreeStructure,
  phosphorWheelchair,
} from '@ng-icons/phosphor-icons/regular';
import { PERSON_ID, Seo, abs } from '../../core/seo/seo.service';
import { SITE } from '../../core/site.config';
import { Reveal } from '../../shared/directives/reveal.directive';
import { HIRE_COPY } from './hire.copy';
import { ScopeBuilder } from './scope-builder';

const PATH = '/hire';

@Component({
  selector: 'mh-page-hire',
  imports: [RouterLink, NgIcon, Reveal, ScopeBuilder],
  viewProviders: [
    provideIcons({
      phosphorArrowRight,
      phosphorCalendarBlank,
      phosphorChatCircleText,
      phosphorCheck,
      phosphorCube,
      phosphorGlobe,
      phosphorHammer,
      phosphorKey,
      phosphorLifebuoy,
      phosphorMagnifyingGlass,
      phosphorPlus,
      phosphorRocket,
      phosphorSignpost,
      phosphorTestTube,
      phosphorTreeStructure,
      phosphorWheelchair,
    }),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './hire.html',
  styleUrl: './hire.scss',
})
export class Hire {
  protected readonly c = HIRE_COPY;
  protected readonly available = SITE.availableForWork;
  private readonly hero = viewChild.required<ElementRef<HTMLElement>>('hero');

  constructor() {
    const url = abs(PATH);
    inject(Seo).set({
      title: HIRE_COPY.seo.title,
      description: HIRE_COPY.seo.description,
      path: PATH,
      image: '/og/og-hire.jpg',
      imageAlt: HIRE_COPY.seo.imageAlt,
      breadcrumbs: [{ name: 'Hire', path: PATH }],
      jsonLd: [
        {
          '@type': 'ProfessionalService',
          '@id': url + '#service',
          name: `${SITE.name}, ${SITE.role}`,
          url,
          description: HIRE_COPY.seo.description,
          image: abs('/og/og-hire.jpg'),
          provider: { '@id': PERSON_ID },
          founder: { '@id': PERSON_ID },
          email: SITE.email,
          address: {
            '@type': 'PostalAddress',
            addressLocality: SITE.locality,
            addressCountry: SITE.countryCode,
          },
          areaServed: { '@type': 'Place', name: 'Worldwide' },
          availableLanguage: ['en', 'ur'],
          serviceType: [
            'Software architecture',
            'Angular development',
            'Micro-frontend architecture',
            'Multi-tenant SaaS development',
            'Frontend rescue and modernisation',
            'Architecture and code review',
            'Web accessibility (WCAG 2.1 AA)',
            'Technical SEO',
            'NestJS and PostgreSQL API development',
          ],
          hasOfferCatalog: {
            '@type': 'OfferCatalog',
            name: 'Ways to work together',
            itemListElement: HIRE_COPY.ways.items.map((w) => ({
              '@type': 'Offer',
              itemOffered: { '@type': 'Service', name: w.title, description: w.body },
            })),
          },
        },
        {
          '@type': 'FAQPage',
          '@id': url + '#faq',
          mainEntity: HIRE_COPY.faq.items.map((f) => ({
            '@type': 'Question',
            name: f.q,
            acceptedAnswer: { '@type': 'Answer', text: f.a },
          })),
        },
      ],
    });

    afterNextRender(() => this.hero().nativeElement.classList.add('ready'));
  }
}
