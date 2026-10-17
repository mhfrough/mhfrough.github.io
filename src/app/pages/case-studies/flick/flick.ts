import { ChangeDetectionStrategy, Component, afterNextRender, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  phosphorArrowRight,
  phosphorArrowUpRight,
  phosphorCheckCircle,
  phosphorCircleDashed,
  phosphorDeviceMobile,
  phosphorGithubLogo,
  phosphorQrCode,
  phosphorUsersThree,
} from '@ng-icons/phosphor-icons/regular';
import { PERSON_ID, Seo, abs } from '../../../core/seo/seo.service';
import { Reveal } from '../../../shared/directives/reveal.directive';
import { TechPills } from '../stack/tech-pills';
import { COPY, LIVE_URL, REPO_URL } from './flick.copy';
import { FlickTheme } from './flick-theme';
import { FlickHandshakeDemo } from './handshake-demo';
import { FlickNearbyDemo } from './nearby-demo';
import { FlickPumpDemo } from './pump-demo';

const PATH = '/work/flick';
const OG_IMAGE = '/og/og-flick.jpg';
const APP_ID = LIVE_URL + '#app';

/**
 * Flick case study: the owner's open-source, frontend-only tool for sharing files and text between nearby devices.
 * The route wears Flick's dark ground and lime via <html data-theme="flick">. The hero holds a simulation of the app
 * written for this page; the handshake and back-pressure sections hold two more. Screenshots come from the live
 * site with two real browsers (scripts/flick-shots.mjs).
 */
@Component({
  selector: 'mh-page-flick',
  imports: [RouterLink, NgIcon, Reveal, TechPills, FlickTheme, FlickNearbyDemo, FlickHandshakeDemo, FlickPumpDemo],
  viewProviders: [
    provideIcons({
      phosphorArrowRight,
      phosphorArrowUpRight,
      phosphorCheckCircle,
      phosphorCircleDashed,
      phosphorDeviceMobile,
      phosphorGithubLogo,
      phosphorQrCode,
      phosphorUsersThree,
    }),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './flick.html',
  styleUrl: './flick.scss',
})
export class FlickCaseStudy {
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
        { name: 'Flick', path: PATH },
      ],
      jsonLd: [
        {
          '@type': 'Article',
          '@id': url + '#article',
          headline: 'Flick: files to the next screen, with no server',
          description: COPY.seo.description,
          inLanguage: 'en',
          datePublished: '2026-10-14',
          image: abs(OG_IMAGE),
          author: { '@id': PERSON_ID },
          publisher: { '@id': PERSON_ID },
          mainEntityOfPage: { '@id': url + '#webpage' },
          about: { '@id': APP_ID },
          keywords: ['WebRTC', 'RTCDataChannel', 'MQTT', 'Web Crypto', 'AES-GCM', 'peer to peer', 'file sharing', 'AirDrop alternative', 'frontend only'],
        },
        {
          '@type': 'SoftwareApplication',
          '@id': APP_ID,
          name: 'Flick',
          description:
            'Share files and text between phones and computers on the same Wi-Fi, straight from the browser. No sign-up, no codes, nothing stored on a server.',
          applicationCategory: 'UtilitiesApplication',
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
