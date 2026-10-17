import { ChangeDetectionStrategy, Component, afterNextRender, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  phosphorArrowRight,
  phosphorArrowsClockwise,
  phosphorBellRinging,
  phosphorForkKnife,
  phosphorGearSix,
  phosphorHeadset,
  phosphorListChecks,
  phosphorPhoneCall,
  phosphorPrinter,
} from '@ng-icons/phosphor-icons/regular';
import { PERSON_ID, Seo, abs } from '../../../core/seo/seo.service';
import { Reveal } from '../../../shared/directives/reveal.directive';
import { TechPills } from '../stack/tech-pills';
import { COPY } from './call-center.copy';
import { CallCenterTheme } from './call-center-theme';
import { CallCenterDesksDemo } from './desks-demo';
import { CallCenterOrderDemo } from './order-demo';
import { CallCenterReceiptDemo } from './receipt-demo';

const PATH = '/work/call-center';
const OG_IMAGE = '/og/og-call-center.jpg';

/**
 * Call center case study: the Angular portal where a central call center takes phone orders for several
 * restaurants. The route wears the portal's periwinkle, indigo and navy via <html data-theme="call-center">. There
 * is no public site, so every screen is my own working mockup with invented data.
 */
@Component({
  selector: 'mh-page-call-center',
  imports: [RouterLink, NgIcon, Reveal, CallCenterTheme, CallCenterOrderDemo, CallCenterDesksDemo, CallCenterReceiptDemo, TechPills],
  viewProviders: [
    provideIcons({
      phosphorArrowRight,
      phosphorArrowsClockwise,
      phosphorBellRinging,
      phosphorForkKnife,
      phosphorGearSix,
      phosphorHeadset,
      phosphorListChecks,
      phosphorPhoneCall,
      phosphorPrinter,
    }),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './call-center.html',
  styleUrl: './call-center.scss',
})
export class CallCenterCaseStudy {
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
        { name: 'Call center portal', path: PATH },
      ],
      jsonLd: [
        {
          '@type': 'Article',
          '@id': url + '#article',
          headline: 'A call center for restaurants: phone orders, typed once',
          description: COPY.seo.description,
          inLanguage: 'en',
          image: abs(OG_IMAGE),
          author: { '@id': PERSON_ID },
          publisher: { '@id': PERSON_ID },
          mainEntityOfPage: { '@id': url + '#webpage' },
          keywords: ['Angular', 'call center', 'restaurant ordering', 'role-based access', 'Firebase Cloud Messaging', 'jsPDF'],
        },
      ],
    });

    afterNextRender(() => requestAnimationFrame(() => this.ready.set(true)));
  }
}
