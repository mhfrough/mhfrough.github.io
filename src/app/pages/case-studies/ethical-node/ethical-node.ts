import { ChangeDetectionStrategy, Component, afterNextRender, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  phosphorArrowRight,
  phosphorCube,
  phosphorGlobe,
  phosphorKey,
  phosphorListChecks,
  phosphorShareNetwork,
  phosphorShieldCheck,
  phosphorWallet,
} from '@ng-icons/phosphor-icons/regular';
import { PERSON_ID, Seo, abs } from '../../../core/seo/seo.service';
import { Reveal } from '../../../shared/directives/reveal.directive';
import { TechPills } from '../stack/tech-pills';
import { EthicalNodeChainsDemo } from './chains-demo';
import { COPY } from './ethical-node.copy';
import { EthicalNodeTheme } from './ethical-node-theme';
import { EthicalNodePermsDemo } from './perms-demo';
import { EthicalNodeStakeDemo } from './stake-demo';

const PATH = '/work/ethical-node';
const OG_IMAGE = '/og/og-ethical-node.jpg';

/**
 * EthicalNode case study: a Shariah-screened crypto staking platform with an admin portal and an investor portal
 * over smart contracts. The route wears the 2023 portals' blue and navy with the crescent's teal via
 * <html data-theme="ethical-node">. The live site is a newer build by others, so there are no screenshots: both
 * portals are shown as my own working mockups with sample data on testnets.
 */
@Component({
  selector: 'mh-page-ethical-node',
  imports: [RouterLink, NgIcon, Reveal, EthicalNodeTheme, EthicalNodeStakeDemo, EthicalNodePermsDemo, EthicalNodeChainsDemo, TechPills],
  viewProviders: [
    provideIcons({
      phosphorArrowRight,
      phosphorCube,
      phosphorGlobe,
      phosphorKey,
      phosphorListChecks,
      phosphorShareNetwork,
      phosphorShieldCheck,
      phosphorWallet,
    }),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './ethical-node.html',
  styleUrl: './ethical-node.scss',
})
export class EthicalNodeCaseStudy {
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
        { name: 'EthicalNode', path: PATH },
      ],
      jsonLd: [
        {
          '@type': 'Article',
          '@id': url + '#article',
          headline: 'EthicalNode: Shariah-screened staking, run on chain',
          description: COPY.seo.description,
          inLanguage: 'en',
          image: abs(OG_IMAGE),
          author: { '@id': PERSON_ID },
          publisher: { '@id': PERSON_ID },
          mainEntityOfPage: { '@id': url + '#webpage' },
          keywords: ['React', 'TypeScript', 'ethers.js', 'wagmi', 'Web3Auth', 'smart contracts', 'staking', 'wallet sign-in', 'Shariah-compliant'],
        },
      ],
    });

    afterNextRender(() => requestAnimationFrame(() => this.ready.set(true)));
  }
}
