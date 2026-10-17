import { ChangeDetectionStrategy, Component, afterNextRender, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  phosphorArrowRight,
  phosphorArrowUpRight,
  phosphorBellRinging,
  phosphorCalendarCheck,
  phosphorCalendarDots,
  phosphorChartBar,
  phosphorClipboardText,
  phosphorFilePdf,
  phosphorImages,
  phosphorMagnifyingGlass,
  phosphorPaperPlaneTilt,
  phosphorReceipt,
  phosphorSquaresFour,
  phosphorStar,
  phosphorUsersThree,
} from '@ng-icons/phosphor-icons/regular';
import { PERSON_ID, Seo, abs } from '../../../core/seo/seo.service';
import { Reveal } from '../../../shared/directives/reveal.directive';
import { COPY, LIVE_URL } from './bloomstone.copy';
import { TechPills } from '../stack/tech-pills';
import { BloomstoneTheme } from './bloomstone-theme';
import { BloomstoneLedgerDemo } from './ledger-demo';
import { BloomstonePhotoSlider } from './photo-slider';
import { BloomstoneSlotDemo } from './slot-demo';

const PATH = '/work/bloomstone';
const OG_IMAGE = '/og/og-bloomstone.jpg';

/**
 * Bloomstone case study. The whole route (nav + footer included) wears bloomstone.pk's own cream and olive
 * theme via <html data-theme="bloomstone"> (route data) + the token overrides loaded by <mh-bloomstone-theme>.
 * Only the public site appears as screenshots; the admin is shown as my own working mockups.
 */
@Component({
  selector: 'mh-page-bloomstone',
  imports: [RouterLink, NgIcon, Reveal, BloomstoneTheme, BloomstoneSlotDemo, BloomstoneLedgerDemo, BloomstonePhotoSlider, TechPills],
  viewProviders: [
    provideIcons({
      phosphorArrowRight,
      phosphorArrowUpRight,
      phosphorBellRinging,
      phosphorCalendarCheck,
      phosphorCalendarDots,
      phosphorChartBar,
      phosphorClipboardText,
      phosphorFilePdf,
      phosphorImages,
      phosphorMagnifyingGlass,
      phosphorPaperPlaneTilt,
      phosphorReceipt,
      phosphorSquaresFour,
      phosphorStar,
      phosphorUsersThree,
    }),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './bloomstone.html',
  styleUrl: './bloomstone.scss',
})
export class BloomstoneCaseStudy {
  protected readonly c = COPY;
  protected readonly live = LIVE_URL;
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
        { name: 'Bloomstone', path: PATH },
      ],
      jsonLd: [
        {
          '@type': 'Article',
          '@id': url + '#article',
          headline: 'Bloomstone: a private resort, booked by the slot',
          description: COPY.seo.description,
          inLanguage: 'en',
          image: abs(OG_IMAGE),
          author: { '@id': PERSON_ID },
          publisher: { '@id': PERSON_ID },
          mainEntityOfPage: { '@id': url + '#webpage' },
          keywords: ['Angular', 'NestJS', 'PostgreSQL', 'Socket.io', 'booking system', 'availability calendar', 'hospitality', 'Pakistan'],
          about: {
            '@type': 'WebApplication',
            name: 'Bloomstone Private Resort',
            url: LIVE_URL,
            applicationCategory: 'TravelApplication',
            operatingSystem: 'Web',
          },
        },
      ],
    });

    afterNextRender(() => requestAnimationFrame(() => this.ready.set(true)));
  }
}
