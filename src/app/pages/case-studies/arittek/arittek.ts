import { ChangeDetectionStrategy, Component, afterNextRender, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  phosphorArrowRight,
  phosphorArrowUpRight,
  phosphorArticle,
  phosphorBrowser,
  phosphorChatCircleText,
  phosphorClockCounterClockwise,
  phosphorEnvelopeSimple,
  phosphorFileHtml,
  phosphorLockKey,
  phosphorMegaphone,
  phosphorTray,
  phosphorUsersThree,
} from '@ng-icons/phosphor-icons/regular';
import { PERSON_ID, Seo, abs } from '../../../core/seo/seo.service';
import { Reveal } from '../../../shared/directives/reveal.directive';
import { TechPills } from '../stack/tech-pills';
import { COPY, LIVE_URL } from './arittek.copy';
import { ArittekTheme } from './arittek-theme';
import { ArittekCampaignDemo } from './campaign-demo';
import { ArittekEditorDemo } from './editor-demo';
import { ArittekRolesDemo } from './roles-demo';

const PATH = '/work/arittek';
const OG_IMAGE = '/og/og-arittek.jpg';

/**
 * Arittek case study: the company's prerendered Angular site and the PHP back office behind it. The route wears
 * arittek.com's navy, gold and cream via <html data-theme="arittek">. The public site appears as screenshots of
 * the live pages (cropped so no bank logos or people's names are in a frame); the back office is shown as my own
 * working mockups with sample data.
 */
@Component({
  selector: 'mh-page-arittek',
  imports: [RouterLink, NgIcon, Reveal, ArittekTheme, ArittekEditorDemo, ArittekCampaignDemo, ArittekRolesDemo, TechPills],
  viewProviders: [
    provideIcons({
      phosphorArrowRight,
      phosphorArrowUpRight,
      phosphorArticle,
      phosphorBrowser,
      phosphorChatCircleText,
      phosphorClockCounterClockwise,
      phosphorEnvelopeSimple,
      phosphorFileHtml,
      phosphorLockKey,
      phosphorMegaphone,
      phosphorTray,
      phosphorUsersThree,
    }),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './arittek.html',
  styleUrl: './arittek.scss',
})
export class ArittekCaseStudy {
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
        { name: 'Arittek', path: PATH },
      ],
      jsonLd: [
        {
          '@type': 'Article',
          '@id': url + '#article',
          headline: 'Arittek: a company site with its own back office',
          description: COPY.seo.description,
          inLanguage: 'en',
          image: abs(OG_IMAGE),
          author: { '@id': PERSON_ID },
          publisher: { '@id': PERSON_ID },
          mainEntityOfPage: { '@id': url + '#webpage' },
          keywords: ['Angular', 'Angular Universal', 'prerendering', 'PHP', 'MySQL', 'CMS', 'role-based access', 'technical SEO', 'Karachi'],
          about: {
            '@type': 'WebSite',
            name: 'Arittek',
            url: LIVE_URL,
          },
        },
      ],
    });

    afterNextRender(() => requestAnimationFrame(() => this.ready.set(true)));
  }
}
