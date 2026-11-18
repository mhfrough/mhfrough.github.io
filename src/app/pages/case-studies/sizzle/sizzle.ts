import { ChangeDetectionStrategy, Component, afterNextRender, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  phosphorArrowRight,
  phosphorArrowUpRight,
  phosphorCheckCircle,
  phosphorCircleDashed,
  phosphorGithubLogo,
} from '@ng-icons/phosphor-icons/regular';
import { PERSON_ID, Seo, abs } from '../../../core/seo/seo.service';
import { Reveal } from '../../../shared/directives/reveal.directive';
import { TechPills } from '../stack/tech-pills';
import { SizzleGatesDemo } from './gates-demo';
import { SizzleInstall } from './install';
import { SizzleScrubber } from './scrubber';
import { COPY, LIVE_URL, REEL, REPO_URL } from './sizzle.copy';
import { SizzleTheme } from './sizzle-theme';
import { SizzleTrailer } from './trailer';

const PATH = '/work/sizzle';
const OG_IMAGE = '/og/og-sizzle.jpg';
const APP_ID = LIVE_URL + '#app';

/**
 * Sizzle case study: the owner's open-source skill for AI agents that makes promo reels (MIT, October 2026). The
 * route wears Sizzle's soft black and bronze via <html data-theme="sizzle">. The hero holds a storyboard of the
 * trailer Sizzle made about itself (stills from its 4K render, scripts/sizzle-shots.mjs); further down, the trailer
 * itself, a simulation of the workflow and its approval gates, and the install line. Screenshots come from the live
 * site.
 */
@Component({
  selector: 'mh-page-sizzle',
  imports: [RouterLink, NgIcon, Reveal, TechPills, SizzleTheme, SizzleScrubber, SizzleTrailer, SizzleGatesDemo, SizzleInstall],
  viewProviders: [
    provideIcons({
      phosphorArrowRight,
      phosphorArrowUpRight,
      phosphorCheckCircle,
      phosphorCircleDashed,
      phosphorGithubLogo,
    }),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './sizzle.html',
  styleUrl: './sizzle.scss',
})
export class SizzleCaseStudy {
  protected readonly c = COPY;
  protected readonly live = LIVE_URL;
  protected readonly repo = REPO_URL;
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
        { name: 'Sizzle', path: PATH },
      ],
      jsonLd: [
        {
          '@type': 'Article',
          '@id': url + '#article',
          headline: 'Sizzle: promo reels, cut by your agent',
          description: COPY.seo.description,
          inLanguage: 'en',
          datePublished: '2026-10-23',
          image: abs(OG_IMAGE),
          author: { '@id': PERSON_ID },
          publisher: { '@id': PERSON_ID },
          mainEntityOfPage: { '@id': url + '#webpage' },
          about: { '@id': APP_ID },
          video: { '@id': url + '#trailer' },
          keywords: ['agent skill', 'Claude Code', 'Cursor', 'AI agents', 'promo video', 'sizzle reel', 'Playwright', 'PyAV', 'HTML animation', 'frame-exact rendering'],
        },
        {
          '@type': 'SoftwareApplication',
          '@id': APP_ID,
          name: 'Sizzle',
          description:
            'A skill for AI agents that turns a software product into a short promo reel, built as HTML from its real interface, approved by you, then rendered to 4K video with music.',
          applicationCategory: 'DeveloperApplication',
          operatingSystem: 'macOS, Linux, Windows',
          url: LIVE_URL,
          codeRepository: REPO_URL,
          image: abs(OG_IMAGE),
          license: 'https://opensource.org/licenses/MIT',
          isAccessibleForFree: true,
          offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
          author: { '@id': PERSON_ID },
        },
        {
          '@type': 'VideoObject',
          '@id': url + '#trailer',
          name: 'Sizzle: your app, now showing',
          description: 'The 25-second trailer for Sizzle, made by Sizzle: the same skill and the same steps, pointed at its own repository.',
          thumbnailUrl: abs(REEL.poster),
          contentUrl: abs(REEL.src),
          uploadDate: '2026-10-15',
          duration: 'PT25S',
          width: 720,
          height: 1280,
          creator: { '@id': PERSON_ID },
        },
      ],
    });

    afterNextRender(() => requestAnimationFrame(() => this.ready.set(true)));
  }
}
