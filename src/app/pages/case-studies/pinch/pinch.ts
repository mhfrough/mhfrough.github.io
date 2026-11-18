import { ChangeDetectionStrategy, Component, afterNextRender, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  phosphorAppWindow,
  phosphorArrowRight,
  phosphorArrowUpRight,
  phosphorCheckCircle,
  phosphorCircleDashed,
  phosphorDiamond,
  phosphorEnvelope,
  phosphorGithubLogo,
  phosphorGlobe,
  phosphorUsersThree,
} from '@ng-icons/phosphor-icons/regular';
import { PERSON_ID, Seo, abs } from '../../../core/seo/seo.service';
import { Reveal } from '../../../shared/directives/reveal.directive';
import { TechPills } from '../stack/tech-pills';
import { PinchCurveDemo } from './curve-demo';
import { COPY, LIVE_URL, REPO_URL } from './pinch.copy';
import { PinchTheme } from './pinch-theme';
import { PinchStudioDemo } from './studio-demo';
import { PinchTargetDemo } from './target-demo';
import { PinchUpscaleDemo } from './upscale-demo';

const PATH = '/work/pinch';
const OG_IMAGE = '/og/og-pinch.jpg';
const APP_ID = LIVE_URL + '#app';
const MAX_TILE = Math.max(...COPY.upscale.times.map((t) => t.v));

/**
 * Pinch case study: the owner's open-source image studio that compresses, converts and upscales in the browser with
 * nothing uploaded. The route wears Pinch's dark neutrals and signal blue via <html data-theme="pinch">. The hero holds
 * a working compare written for this page (the browser re-encodes a Pinch sample live); further down, Pinch's own
 * measured sizes as a chart, its target-size search run live, and its Smooth and AI upscales side by side.
 * Screenshots come from the live site (scripts/pinch-shots.mjs).
 */
@Component({
  selector: 'mh-page-pinch',
  imports: [RouterLink, NgIcon, Reveal, TechPills, PinchTheme, PinchStudioDemo, PinchCurveDemo, PinchTargetDemo, PinchUpscaleDemo],
  viewProviders: [
    provideIcons({
      phosphorAppWindow,
      phosphorArrowRight,
      phosphorArrowUpRight,
      phosphorCheckCircle,
      phosphorCircleDashed,
      phosphorDiamond,
      phosphorEnvelope,
      phosphorGithubLogo,
      phosphorGlobe,
      phosphorUsersThree,
    }),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './pinch.html',
  styleUrl: './pinch.scss',
})
export class PinchCaseStudy {
  protected readonly c = COPY;
  protected readonly live = LIVE_URL;
  protected readonly repo = REPO_URL;
  protected readonly ready = signal(false);
  protected readonly tileShare = (v: number) => v / MAX_TILE;

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
        { name: 'Pinch', path: PATH },
      ],
      jsonLd: [
        {
          '@type': 'Article',
          '@id': url + '#article',
          headline: 'Pinch: lighter images, never uploaded',
          description: COPY.seo.description,
          inLanguage: 'en',
          datePublished: '2026-10-16',
          image: abs(OG_IMAGE),
          author: { '@id': PERSON_ID },
          publisher: { '@id': PERSON_ID },
          mainEntityOfPage: { '@id': url + '#webpage' },
          about: { '@id': APP_ID },
          keywords: [
            'image compression',
            'WebAssembly',
            'Web Workers',
            'MozJPEG',
            'WebP',
            'AVIF',
            'HEIC',
            'Real-ESRGAN',
            'ONNX Runtime Web',
            'WebGPU',
            'privacy',
            'frontend only',
          ],
        },
        {
          '@type': 'SoftwareApplication',
          '@id': APP_ID,
          name: 'Pinch',
          description: 'Compress, convert and upscale images in your browser. Nothing is uploaded.',
          applicationCategory: 'MultimediaApplication',
          operatingSystem: 'Any (runs in a web browser)',
          url: LIVE_URL,
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
