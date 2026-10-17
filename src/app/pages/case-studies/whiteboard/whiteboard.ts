import { ChangeDetectionStrategy, Component, afterNextRender, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  phosphorArrowRight,
  phosphorCheckCircle,
  phosphorCircleDashed,
  phosphorCube,
  phosphorHandPointing,
  phosphorImage,
  phosphorPlugs,
} from '@ng-icons/phosphor-icons/regular';
import { PERSON_ID, Seo, abs } from '../../../core/seo/seo.service';
import { Reveal } from '../../../shared/directives/reveal.directive';
import { TechPills } from '../stack/tech-pills';
import { WhiteboardBoardDemo } from './board-demo';
import { COPY } from './whiteboard.copy';
import { WhiteboardTheme } from './whiteboard-theme';

const PATH = '/work/whiteboard';
const OG_IMAGE = '/og/og-whiteboard.jpg';

/**
 * Whiteboard case study: the infinite-canvas board the owner built inside his previous (archived) site, shown as
 * its own project. The route wears the board's warm charcoal and indigo via <html data-theme="whiteboard">.
 * Screenshots come from the original build run locally (scripts/whiteboard-shots.mjs); the hero holds a small
 * working board written for this page.
 */
@Component({
  selector: 'mh-page-whiteboard',
  imports: [RouterLink, NgIcon, Reveal, WhiteboardTheme, WhiteboardBoardDemo, TechPills],
  viewProviders: [
    provideIcons({
      phosphorArrowRight,
      phosphorCheckCircle,
      phosphorCircleDashed,
      phosphorCube,
      phosphorHandPointing,
      phosphorImage,
      phosphorPlugs,
    }),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './whiteboard.html',
  styleUrl: './whiteboard.scss',
})
export class WhiteboardCaseStudy {
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
        { name: 'Whiteboard', path: PATH },
      ],
      jsonLd: [
        {
          '@type': 'CreativeWork',
          '@id': url + '#work',
          name: 'Whiteboard',
          headline: 'Whiteboard: an infinite canvas, built on signals',
          description: COPY.seo.description,
          inLanguage: 'en',
          dateCreated: '2026-07',
          image: abs(OG_IMAGE),
          author: { '@id': PERSON_ID },
          creator: { '@id': PERSON_ID },
          mainEntityOfPage: { '@id': url + '#webpage' },
          keywords: ['Angular', 'Angular signals', 'NestJS', 'socket.io', 'TypeORM', 'PostgreSQL', 'SVG', 'whiteboard', 'infinite canvas', 'real-time collaboration'],
          about: {
            '@type': 'SoftwareApplication',
            name: 'Whiteboard',
            applicationCategory: 'DesignApplication',
            operatingSystem: 'Web',
          },
        },
      ],
    });

    afterNextRender(() => requestAnimationFrame(() => this.ready.set(true)));
  }

  /** Grid lines for a collaboration step: each lane spans two of six columns, arrows run lane centre to centre. */
  protected span(from: number, to: number): string {
    return `${Math.min(from, to) * 2 + 2} / ${Math.max(from, to) * 2 + 2}`;
  }
}
