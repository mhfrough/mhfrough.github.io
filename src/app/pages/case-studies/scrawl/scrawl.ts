import { ChangeDetectionStrategy, Component, afterNextRender, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  phosphorArrowRight,
  phosphorArrowUpRight,
  phosphorArrowsClockwise,
  phosphorCheckCircle,
  phosphorCircleDashed,
  phosphorDeviceMobile,
  phosphorGithubLogo,
  phosphorHighlighter,
  phosphorImage,
  phosphorLock,
  phosphorPencilSimple,
  phosphorTextAa,
} from '@ng-icons/phosphor-icons/regular';
import { PERSON_ID, Seo, abs } from '../../../core/seo/seo.service';
import { Reveal } from '../../../shared/directives/reveal.directive';
import { TechPills } from '../stack/tech-pills';
import { ScrawlFillDemo } from './fill-demo';
import { ScrawlInkDemo } from './ink-demo';
import { type El, type Rough, STROKES, build, ink } from './marker';
import { COPY } from './scrawl.copy';
import { ScrawlTheme } from './scrawl-theme';
import { ScrawlSketch, ScrawlSketchDemo } from './sketch-demo';

const PATH = '/work/scrawl';
const OG_IMAGE = '/og/og-scrawl.jpg';
const LIVE_URL = 'https://mhfrough.github.io/scrawl/';
const REPO_URL = 'https://github.com/mhfrough/scrawl';
const APP_ID = LIVE_URL + '#app';

/**
 * Scrawl case study: the owner's open-source sketchbook (MIT, October 2026). The route wears Scrawl's dark paper and
 * highlighter yellow via <html data-theme="scrawl">. The three demos run Scrawl's own marker maths (marker.ts, ported
 * from scene.js) as SVG, so they render on the server and stay identical after hydration. Screenshots come from the
 * repo served locally (scripts/scrawl-shots.mjs).
 */
@Component({
  selector: 'mh-page-scrawl',
  imports: [RouterLink, NgIcon, Reveal, ScrawlTheme, ScrawlSketchDemo, ScrawlFillDemo, ScrawlInkDemo, TechPills],
  providers: [ScrawlSketch],
  viewProviders: [
    provideIcons({
      phosphorArrowRight,
      phosphorArrowUpRight,
      phosphorArrowsClockwise,
      phosphorCheckCircle,
      phosphorCircleDashed,
      phosphorDeviceMobile,
      phosphorGithubLogo,
      phosphorHighlighter,
      phosphorImage,
      phosphorLock,
      phosphorPencilSimple,
      phosphorTextAa,
    }),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './scrawl.html',
  styleUrl: './scrawl.scss',
})
export class ScrawlCaseStudy {
  protected readonly c = COPY;
  protected readonly live = LIVE_URL;
  protected readonly repo = REPO_URL;
  protected readonly ready = signal(false);
  protected readonly sketch = inject(ScrawlSketch);

  /** The .scrawl file of the hero sketch and its size against the ~5 MB localStorage budget. */
  protected readonly fileSize = computed(() => {
    const bytes = this.sketch.file().length;
    return bytes < 1024 ? `${bytes} bytes` : `${(bytes / 1024).toFixed(1)} KB`;
  });

  // ---------- Hand specimen: the same four shapes at Steady, Loose and Wild ----------
  protected readonly salt = signal(0);
  protected readonly seedLabel = computed(() => '0x' + this.seedAt(0).toString(16).padStart(8, '0'));
  protected readonly specimen = computed(() => {
    const hands: Rough[] = [0, 1, 2];
    const color = ink(STROKES[0], true);
    return hands.map((rough, i) => {
      const els: El[] = [
        { id: 'r', type: 'rect', x: 20, y: 18, w: 104, h: 64, stroke: STROKES[0], bg: 'transparent', fill: 'offset', width: 2, rough, seed: this.seedAt(1) },
        { id: 'e', type: 'ellipse', x: 150, y: 16, w: 104, h: 68, stroke: STROKES[0], bg: 'transparent', fill: 'offset', width: 2, rough, seed: this.seedAt(2) },
        { id: 'd', type: 'diamond', x: 282, y: 10, w: 104, h: 80, stroke: STROKES[0], bg: 'transparent', fill: 'offset', width: 2, rough, seed: this.seedAt(3) },
        { id: 'a', type: 'arrow', x: 414, y: 50, w: 0, h: 0, points: [[0, 0], [116, 0]], stroke: STROKES[0], bg: 'transparent', fill: 'offset', width: 2, rough, seed: this.seedAt(4) },
      ];
      const fills: string[] = [];
      const strokes: string[] = [];
      for (const el of els) {
        const d = build(el);
        for (const f of d.fills) fills.push(f.d);
        for (const k of d.strokes) strokes.push(k.d);
      }
      return { name: COPY.marker.hands[i], fills, strokes, color };
    });
  });

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
        { name: 'Scrawl', path: PATH },
      ],
      jsonLd: [
        {
          '@type': 'Article',
          '@id': url + '#article',
          headline: 'Scrawl: felt-tip diagrams on dotted paper',
          description: COPY.seo.description,
          inLanguage: 'en',
          datePublished: '2026-10-14',
          image: abs(OG_IMAGE),
          author: { '@id': PERSON_ID },
          publisher: { '@id': PERSON_ID },
          mainEntityOfPage: { '@id': url + '#webpage' },
          about: { '@id': APP_ID },
          keywords: ['sketchbook', 'whiteboard', 'hand-drawn diagrams', 'Canvas 2D', 'SVG', 'vanilla JavaScript', 'local first', 'IndexedDB', 'risograph'],
        },
        {
          '@type': 'SoftwareApplication',
          '@id': APP_ID,
          name: 'Scrawl',
          description:
            'A sketchbook in the browser. Felt-tip diagrams, flows and wireframes on dotted paper, with no account and no server. It saves on your device.',
          applicationCategory: 'DesignApplication',
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

  protected reseed(): void {
    this.salt.update((n) => n + 1);
  }

  private seedAt(i: number): number {
    return Math.imul(this.salt() * 5 + i + 11, 2654435761) >>> 0;
  }
}
