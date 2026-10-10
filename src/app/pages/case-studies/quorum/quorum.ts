import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  phosphorArrowLeft,
  phosphorArrowUpRight,
  phosphorArrowsDownUp,
  phosphorCube,
  phosphorGauge,
  phosphorGithubLogo,
  phosphorGlobe,
  phosphorHand,
  phosphorPackage,
  phosphorScales,
  phosphorShieldCheck,
  phosphorSignpost,
  phosphorUsersThree,
} from '@ng-icons/phosphor-icons/regular';
import { PERSON_ID, Seo, abs } from '../../../core/seo/seo.service';
import { Reveal } from '../../../shared/directives/reveal.directive';
import { Skeleton } from '../../../shared/ui/skeleton';
import { QuorumCouncil } from './council';
import { QuorumInstall } from './install-line';
import { COPY, LIVE_URL, REPO_URL } from './quorum.copy';
import { QuorumTheme } from './quorum-theme';
import { QuorumVoteDemo } from './vote-demo';

const PATH = '/work/quorum';
const APP_ID = 'https://mhfrough.github.io/quorum/#app';
const OG_IMAGE = 'https://mhfrough.github.io/quorum/assets/og-image.jpg';

/**
 * Quorum case study. The whole route (nav + footer included) wears Quorum's own theme via
 * <html data-theme="quorum"> (route data) + the token overrides loaded by <mh-quorum-theme>.
 */
@Component({
  selector: 'mh-page-quorum',
  imports: [RouterLink, NgIcon, Reveal, Skeleton, QuorumTheme, QuorumCouncil, QuorumVoteDemo, QuorumInstall],
  viewProviders: [
    provideIcons({
      phosphorArrowUpRight,
      phosphorArrowLeft,
      phosphorGithubLogo,
      phosphorSignpost,
      phosphorUsersThree,
      phosphorArrowsDownUp,
      phosphorScales,
      phosphorHand,
      phosphorPackage,
      phosphorGlobe,
      phosphorShieldCheck,
      phosphorGauge,
      phosphorCube,
    }),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './quorum.html',
  styleUrl: './quorum.scss',
})
export class QuorumCaseStudy {
  protected readonly c = COPY;
  protected readonly live = LIVE_URL;
  protected readonly repo = REPO_URL;

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
        { name: 'Quorum', path: PATH },
      ],
      jsonLd: [
        {
          '@type': 'Article',
          '@id': url + '#article',
          headline: 'Quorum: a council of seven minds for Claude Code',
          description: COPY.seo.description,
          inLanguage: 'en',
          image: OG_IMAGE,
          author: { '@id': PERSON_ID },
          publisher: { '@id': PERSON_ID },
          mainEntityOfPage: { '@id': url + '#webpage' },
          about: { '@id': APP_ID },
          keywords: ['Claude Code', 'Claude Code skill', 'multi-agent', 'sub-agents', 'decision making', 'three.js'],
        },
        {
          '@type': 'SoftwareApplication',
          '@id': APP_ID,
          name: 'Quorum',
          alternateName: '/quorum',
          description:
            'A Claude Code skill for hard decisions. Seven personality sub-agents debate a decision, vote up or down, and return a clear YES or NO with next steps.',
          applicationCategory: 'DeveloperApplication',
          applicationSubCategory: 'Claude Code skill',
          operatingSystem: 'macOS, Linux, Windows',
          url: LIVE_URL,
          downloadUrl: REPO_URL,
          installUrl: LIVE_URL + '#install',
          codeRepository: REPO_URL,
          image: OG_IMAGE,
          license: 'https://opensource.org/licenses/MIT',
          isAccessibleForFree: true,
          offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
          author: { '@id': PERSON_ID },
        },
        {
          '@type': 'VideoObject',
          name: 'The board',
          description: 'The seven council members on a 3D board: ask them anything, and keep poking to see who snaps first.',
          thumbnailUrl: 'https://mhfrough.github.io/quorum/videos/quorum-board-reel.webp',
          contentUrl: 'https://mhfrough.github.io/quorum/videos/quorum-board-reel.mp4',
          uploadDate: '2026-10-08T12:00:00+05:00',
          duration: 'PT26S',
          author: { '@id': PERSON_ID },
        },
        {
          '@type': 'VideoObject',
          name: 'Meet the Quorum',
          description: 'Seven minds, one decision: a 23-second intro to the Quorum skill for Claude Code.',
          thumbnailUrl: 'https://mhfrough.github.io/quorum/videos/quorum-reel.webp',
          contentUrl: 'https://mhfrough.github.io/quorum/videos/quorum-reel.mp4',
          uploadDate: '2026-10-08T12:00:00+05:00',
          duration: 'PT23S',
          author: { '@id': PERSON_ID },
        },
      ],
    });
  }

  /** One reel plays at a time. */
  protected onPlay(e: Event): void {
    const target = e.target as HTMLVideoElement;
    target.closest('.reels')?.querySelectorAll('video').forEach((v) => v !== target && v.pause());
  }
}
