import { ChangeDetectionStrategy, Component, afterNextRender, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  phosphorArrowRight,
  phosphorChartBar,
  phosphorCreditCard,
  phosphorFileArrowDown,
  phosphorGlobe,
  phosphorKey,
  phosphorListNumbers,
  phosphorTray,
  phosphorUserSwitch,
} from '@ng-icons/phosphor-icons/regular';
import { PERSON_ID, Seo, abs } from '../../../core/seo/seo.service';
import { Reveal } from '../../../shared/directives/reveal.directive';
import { TechPills } from '../stack/tech-pills';
import { FincloreAccessDemo } from './access-demo';
import { COPY } from './finclore.copy';
import { FincloreTheme } from './finclore-theme';
import { FincloreMark } from './mark';
import { FincloreMembersDemo } from './members-demo';
import { FincloreOrderDemo } from './order-demo';

const PATH = '/work/finclore';
const OG_IMAGE = '/og/og-finclore.jpg';

/**
 * Finclore case study: US company formation for founders abroad. The route wears the logo's navy and red via
 * <html data-theme="finclore">. The public site appears as screenshots of the original build rendered against a
 * sample API; the logo gets its own section (the owner designed it); the customer portal and back office are
 * shown as my own working mockups.
 */
@Component({
  selector: 'mh-page-finclore',
  imports: [
    RouterLink,
    NgIcon,
    Reveal,
    FincloreTheme,
    FincloreOrderDemo,
    FincloreMark,
    FincloreMembersDemo,
    FincloreAccessDemo,
    TechPills,
  ],
  viewProviders: [
    provideIcons({
      phosphorArrowRight,
      phosphorChartBar,
      phosphorCreditCard,
      phosphorFileArrowDown,
      phosphorGlobe,
      phosphorKey,
      phosphorListNumbers,
      phosphorTray,
      phosphorUserSwitch,
    }),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './finclore.html',
  styleUrl: './finclore.scss',
})
export class FincloreCaseStudy {
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
        { name: 'Finclore', path: PATH },
      ],
      jsonLd: [
        {
          '@type': 'Article',
          '@id': url + '#article',
          headline: 'Finclore: a US company, formed from anywhere',
          description: COPY.seo.description,
          inLanguage: 'en',
          image: abs(OG_IMAGE),
          author: { '@id': PERSON_ID },
          publisher: { '@id': PERSON_ID },
          mainEntityOfPage: { '@id': url + '#webpage' },
          keywords: ['Angular', 'Angular Universal', 'PWA', 'company formation', 'multi-step wizard', 'role-based access', 'logo design'],
        },
      ],
    });

    afterNextRender(() => requestAnimationFrame(() => this.ready.set(true)));
  }
}
