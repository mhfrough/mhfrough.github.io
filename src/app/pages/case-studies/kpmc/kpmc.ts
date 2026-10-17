import { ChangeDetectionStrategy, Component, afterNextRender, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  phosphorArrowRight,
  phosphorBellRinging,
  phosphorFilePdf,
  phosphorIdentificationCard,
  phosphorListChecks,
  phosphorMapPin,
  phosphorNewspaper,
  phosphorStar,
} from '@ng-icons/phosphor-icons/regular';
import { PERSON_ID, Seo, abs } from '../../../core/seo/seo.service';
import { Reveal } from '../../../shared/directives/reveal.directive';
import { TechPills } from '../stack/tech-pills';
import { KpmcDeskDemo } from './desk-demo';
import { COPY } from './kpmc.copy';
import { KpmcTheme } from './kpmc-theme';
import { KpmcPushDemo } from './push-demo';
import { KpmcReportDemo } from './report-demo';

const PATH = '/work/kpmc';
const OG_IMAGE = '/og/og-kpmc.jpg';

/**
 * KPMC case study: Khairpur Municipal Committee's public site and staff back office. The route wears the
 * portal's green and slate via <html data-theme="kpmc">. The public site appears as screenshots of the original
 * build rendered against a sample API; the back office is shown as my own working mockups.
 */
@Component({
  selector: 'mh-page-kpmc',
  imports: [RouterLink, NgIcon, Reveal, KpmcTheme, KpmcDeskDemo, KpmcReportDemo, KpmcPushDemo, TechPills],
  viewProviders: [
    provideIcons({
      phosphorArrowRight,
      phosphorBellRinging,
      phosphorFilePdf,
      phosphorIdentificationCard,
      phosphorListChecks,
      phosphorMapPin,
      phosphorNewspaper,
      phosphorStar,
    }),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './kpmc.html',
  styleUrl: './kpmc.scss',
})
export class KpmcCaseStudy {
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
        { name: 'KPMC', path: PATH },
      ],
      jsonLd: [
        {
          '@type': 'Article',
          '@id': url + '#article',
          headline: 'Khairpur Municipal Committee: a city’s complaints, handled in one place',
          description: COPY.seo.description,
          inLanguage: 'en',
          image: abs(OG_IMAGE),
          author: { '@id': PERSON_ID },
          publisher: { '@id': PERSON_ID },
          mainEntityOfPage: { '@id': url + '#webpage' },
          keywords: ['Angular', 'Angular Universal', 'e-government', 'complaint management', 'role-based access', 'Firebase Cloud Messaging', 'Sindh'],
        },
      ],
    });

    afterNextRender(() => requestAnimationFrame(() => this.ready.set(true)));
  }
}
