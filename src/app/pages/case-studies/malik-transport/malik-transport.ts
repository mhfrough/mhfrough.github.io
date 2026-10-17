import { ChangeDetectionStrategy, Component, afterNextRender, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  phosphorArrowRight,
  phosphorBuildingOffice,
  phosphorCalculator,
  phosphorClipboardText,
  phosphorSteeringWheel,
  phosphorTruck,
  phosphorUserCircle,
} from '@ng-icons/phosphor-icons/regular';
import { PERSON_ID, Seo, abs } from '../../../core/seo/seo.service';
import { Reveal } from '../../../shared/directives/reveal.directive';
import { TechPills } from '../stack/tech-pills';
import { MalikTransportDispatchDemo } from './dispatch-demo';
import { MalikTransportFareDemo } from './fare-demo';
import { COPY } from './malik-transport.copy';
import { MalikTransportTheme } from './malik-transport-theme';
import { MalikTransportStaffDemo } from './staff-demo';

const PATH = '/work/malik-transport';
const OG_IMAGE = '/og/og-malik-transport.jpg';

/**
 * Malik Transport Solutions case study: a courier and transport company's public site with a fare calculator,
 * and the one portal its customers, office and drivers share. The route wears the company's blue and navy via
 * <html data-theme="malik-transport">. The public site appears as screenshots of the original build rendered
 * against a sample API; the portal is shown as my own working mockups with sample data.
 */
@Component({
  selector: 'mh-page-malik-transport',
  imports: [RouterLink, NgIcon, Reveal, MalikTransportTheme, MalikTransportFareDemo, MalikTransportDispatchDemo, MalikTransportStaffDemo, TechPills],
  viewProviders: [
    provideIcons({
      phosphorArrowRight,
      phosphorBuildingOffice,
      phosphorCalculator,
      phosphorClipboardText,
      phosphorSteeringWheel,
      phosphorTruck,
      phosphorUserCircle,
    }),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './malik-transport.html',
  styleUrl: './malik-transport.scss',
})
export class MalikTransportCaseStudy {
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
        { name: 'Malik Transport Solutions', path: PATH },
      ],
      jsonLd: [
        {
          '@type': 'Article',
          '@id': url + '#article',
          headline: 'Malik Transport Solutions: a price before the call, a driver after it',
          description: COPY.seo.description,
          inLanguage: 'en',
          image: abs(OG_IMAGE),
          author: { '@id': PERSON_ID },
          publisher: { '@id': PERSON_ID },
          mainEntityOfPage: { '@id': url + '#webpage' },
          keywords: ['Angular', 'Angular Universal', 'logistics', 'courier', 'fare calculator', 'dispatch', 'role-based access', 'PWA'],
        },
      ],
    });

    afterNextRender(() => requestAnimationFrame(() => this.ready.set(true)));
  }
}
