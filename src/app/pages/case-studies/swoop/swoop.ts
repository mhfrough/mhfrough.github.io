import { ChangeDetectionStrategy, Component, afterNextRender, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  phosphorArrowRight,
  phosphorArrowUpRight,
  phosphorBrowser,
  phosphorCheckCircle,
  phosphorCircleDashed,
  phosphorCode,
  phosphorEyeSlash,
  phosphorGithubLogo,
  phosphorLinkBreak,
  phosphorLock,
  phosphorMonitor,
} from '@ng-icons/phosphor-icons/regular';
import { PERSON_ID, Seo, abs } from '../../../core/seo/seo.service';
import { Reveal } from '../../../shared/directives/reveal.directive';
import { TechPills } from '../stack/tech-pills';
import { SwoopDoc, SwoopMarkupDemo } from './markup-demo';
import { SwoopStitchDemo } from './stitch-demo';
import { COPY, LIVE_URL, RELEASES_URL, REPO_URL } from './swoop.copy';
import { SwoopTheme } from './swoop-theme';

const PATH = '/work/swoop';
const OG_IMAGE = '/og/og-swoop.jpg';
const APP_ID = LIVE_URL + '#app';

/**
 * Swoop case study: the owner's open-source screenshot tool (MIT, October 2026), a Chrome extension and a Windows
 * tray app sharing one editor. The route wears Swoop's dark ground and orange via <html data-theme="swoop">. The hero
 * holds a markup editor written for this page on Swoop's shape model (markup-demo.ts), whose marks also feed the
 * document panel; the scroll-and-stitch section holds a capture simulation (stitch-demo.ts). Screenshots come from
 * the repo served locally (scripts/swoop-shots.mjs).
 */
@Component({
  selector: 'mh-page-swoop',
  imports: [RouterLink, NgIcon, Reveal, TechPills, SwoopTheme, SwoopMarkupDemo, SwoopStitchDemo],
  providers: [SwoopDoc],
  viewProviders: [
    provideIcons({
      phosphorArrowRight,
      phosphorArrowUpRight,
      phosphorBrowser,
      phosphorCheckCircle,
      phosphorCircleDashed,
      phosphorCode,
      phosphorEyeSlash,
      phosphorGithubLogo,
      phosphorLinkBreak,
      phosphorLock,
      phosphorMonitor,
    }),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './swoop.html',
  styleUrl: './swoop.scss',
})
export class SwoopCaseStudy {
  protected readonly c = COPY;
  protected readonly live = LIVE_URL;
  protected readonly repo = REPO_URL;
  protected readonly ready = signal(false);
  protected readonly doc = inject(SwoopDoc);
  protected readonly icons: Record<string, string> = {
    chrome: 'phosphorBrowser',
    desktop: 'phosphorMonitor',
    lock: 'phosphorLock',
    link: 'phosphorLinkBreak',
    eye: 'phosphorEyeSlash',
    code: 'phosphorCode',
  };

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
        { name: 'Swoop', path: PATH },
      ],
      jsonLd: [
        {
          '@type': 'Article',
          '@id': url + '#article',
          headline: 'Swoop: screenshots that stay on your computer',
          description: COPY.seo.description,
          inLanguage: 'en',
          datePublished: '2026-10-22',
          image: abs(OG_IMAGE),
          author: { '@id': PERSON_ID },
          publisher: { '@id': PERSON_ID },
          mainEntityOfPage: { '@id': url + '#webpage' },
          about: { '@id': APP_ID },
          keywords: [
            'screenshot tool',
            'full page screenshot',
            'Chrome extension',
            'Manifest V3',
            'Print Screen',
            'Tauri',
            'Rust',
            'Canvas 2D',
            'annotation',
            'privacy',
          ],
        },
        {
          '@type': 'SoftwareApplication',
          '@id': APP_ID,
          name: 'Swoop',
          description:
            'Screenshots that stay on your computer: a full-page capture extension for Chrome and a Print Screen app for Windows, sharing one free editor with arrows, boxes, text, numbered steps, blur and crop. Nothing is uploaded.',
          applicationCategory: 'UtilitiesApplication',
          applicationSubCategory: 'Screenshot tool',
          operatingSystem: 'Chrome, Microsoft Edge, Windows 10, Windows 11',
          softwareVersion: '0.1.3',
          url: LIVE_URL,
          downloadUrl: RELEASES_URL,
          codeRepository: REPO_URL,
          image: abs(OG_IMAGE),
          license: 'https://opensource.org/licenses/MIT',
          isAccessibleForFree: true,
          offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
          author: { '@id': PERSON_ID },
        },
      ],
    });

    afterNextRender(() => requestAnimationFrame(() => this.ready.set(true)));
  }
}
