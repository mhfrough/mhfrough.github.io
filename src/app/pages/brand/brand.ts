import { ChangeDetectionStrategy, Component, ViewEncapsulation, afterNextRender, inject, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { phosphorArrowDown, phosphorArrowRight, phosphorDownloadSimple } from '@ng-icons/phosphor-icons/regular';
import { PERSON_ID, Seo, abs } from '../../core/seo/seo.service';
import { COPY, PATH } from './brand.copy';
import { BrandA11y } from './sections/a11y';
import { BrandColor } from './sections/color';
import { BrandComponents } from './sections/components';
import { BrandIcons } from './sections/icons';
import { BrandInspector } from './sections/inspector';
import { BrandLogo } from './sections/logo';
import { BrandMotion } from './sections/motion';
import { BrandShape } from './sections/shape';
import { BrandToc } from './sections/toc';
import { BrandType } from './sections/type';
import { BrandVoice } from './sections/voice';

/**
 * /brand: the self-documenting design system. Quorum's system in black and white, rendered from the live
 * tokens, classes and components, so this page cannot drift from the code it documents.
 */
@Component({
  selector: 'mh-page-brand',
  imports: [
    NgIcon,
    BrandInspector,
    BrandToc,
    BrandLogo,
    BrandColor,
    BrandType,
    BrandShape,
    BrandComponents,
    BrandMotion,
    BrandIcons,
    BrandVoice,
    BrandA11y,
  ],
  viewProviders: [provideIcons({ phosphorArrowRight, phosphorArrowDown, phosphorDownloadSimple })],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: { class: 'bp' },
  styleUrl: './brand.scss',
  template: `
    <section class="page-head glow bp-hero hero-anim" [class.ready]="ready()" aria-labelledby="bp-title">
      <div class="wrap bp-hero__grid">
        <div>
          <a class="pill-link rise" href="#components">
            <b>{{ c.hero.tag }}</b>{{ c.hero.pill }}<ng-icon name="phosphorArrowRight" aria-hidden="true" />
          </a>
          <h1 id="bp-title" class="display">
            <span class="line"><span>{{ c.hero.line1 }}</span></span>
            <span class="line"><span class="soft">{{ c.hero.line2 }}</span></span>
          </h1>
          <p class="lede rise d2">{{ c.hero.lede }}</p>
          <div class="bp-actions rise d4">
            <a class="btn btn-solid" href="#components">{{ c.hero.browse }}<ng-icon name="phosphorArrowDown" aria-hidden="true" /></a>
            <a class="btn btn-ghost" href="/images/brand/mark-tile.svg" download="mhfrough-mark-tile.svg">
              <ng-icon name="phosphorDownloadSimple" aria-hidden="true" />{{ c.hero.download }}
            </a>
          </div>
        </div>
        <div class="rise d4">
          <mh-brand-inspector />
        </div>
      </div>
    </section>

    <div class="wrap bp-docs">
      <mh-brand-toc />
      <div class="bp-main">
        <section class="bp-sec" id="logo" aria-labelledby="logo-title"><mh-brand-logo /></section>
        <section class="bp-sec" id="color" aria-labelledby="color-title"><mh-brand-color /></section>
        <section class="bp-sec" id="type" aria-labelledby="type-title"><mh-brand-type /></section>
        <section class="bp-sec" id="shape" aria-labelledby="shape-title"><mh-brand-shape /></section>
        <section class="bp-sec" id="components" aria-labelledby="components-title"><mh-brand-components /></section>
        <section class="bp-sec" id="motion" aria-labelledby="motion-title"><mh-brand-motion /></section>
        <section class="bp-sec" id="icons" aria-labelledby="icons-title"><mh-brand-icons /></section>
        <section class="bp-sec" id="voice" aria-labelledby="voice-title"><mh-brand-voice /></section>
        <section class="bp-sec" id="a11y" aria-labelledby="a11y-title"><mh-brand-a11y /></section>
      </div>
    </div>
  `,
})
export class Brand {
  protected readonly c = COPY;
  protected readonly ready = signal(false);

  constructor() {
    const url = abs(PATH);
    inject(Seo).set({
      title: COPY.seo.title,
      description: COPY.seo.description,
      path: PATH,
      image: '/og/og-brand.jpg',
      imageAlt: 'The mhfrough design system: the hamza mark on a light tile, in black and white',
      breadcrumbs: [{ name: 'Brand', path: PATH }],
      jsonLd: [
        {
          '@type': 'CreativeWork',
          '@id': url + '#design-system',
          name: 'mhfrough design system',
          alternateName: 'Quorum, in black and white',
          description: COPY.seo.description,
          url,
          inLanguage: 'en',
          genre: 'Design system',
          image: abs('/images/brand/mark-tile.svg'),
          author: { '@id': PERSON_ID },
          creator: { '@id': PERSON_ID },
          copyrightHolder: { '@id': PERSON_ID },
          isBasedOn: 'https://mhfrough.github.io/quorum/',
          mainEntityOfPage: { '@id': url + '#webpage' },
          dateModified: '2026-10-10',
          keywords: ['design system', 'design tokens', 'monochrome', 'dark mode', 'Geist', 'Angular', 'WCAG 2.1 AA'],
          hasPart: [
            { '@type': 'CreativeWork', name: 'Logo', url: url + '#logo' },
            { '@type': 'CreativeWork', name: 'Color tokens', url: url + '#color' },
            { '@type': 'CreativeWork', name: 'Typography', url: url + '#type' },
            { '@type': 'CreativeWork', name: 'Components', url: url + '#components' },
            { '@type': 'CreativeWork', name: 'Motion', url: url + '#motion' },
          ],
        },
      ],
    });

    afterNextRender(() => requestAnimationFrame(() => this.ready.set(true)));
  }
}
