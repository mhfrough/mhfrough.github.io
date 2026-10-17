import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { phosphorArrowRight } from '@ng-icons/phosphor-icons/regular';
import { Reveal } from '../../shared/directives/reveal.directive';
import { Logo } from '../../shared/ui/logo';
import { ABOUT_COPY } from '../about/about.copy';

/** Three animated icons from the weather set (animated SVGs stop themselves under reduced motion). */
const ICONS = [
  { id: 'partly-sunny', name: 'Partly sunny' },
  { id: 'rainy', name: 'Rainy' },
  { id: 'clear-night', name: 'Clear night' },
];

const COPY = {
  title: 'The person and the craft',
  sub: 'Who I am, how this site is put together, and the icons I draw when I am not shipping.',
  about: {
    tag: 'About',
    cta: 'About me',
  },
  brand: {
    tag: 'Brand system',
    title: 'The hamza mark, documented live',
    body: 'Tokens, type, shape, motion and every component on this site, rendered from the same code.',
    cta: 'View the brand system',
  },
  icons: {
    tag: 'Icon design',
    title: 'Weather icons',
    body: '25 colorful icons, drawn in Adobe XD, now static and animated with SVG downloads.',
    cta: 'See the icons',
  },
} as const;

/**
 * Home band that points to /about, /brand and the weather icons on /work: an about card (wide) and two
 * smaller cards with a live specimen each (the brand tile, three animated icons).
 */
@Component({
  selector: 'mh-home-more',
  imports: [RouterLink, NgIcon, Reveal, Logo],
  viewProviders: [provideIcons({ phosphorArrowRight })],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="section" id="more" aria-labelledby="more-title">
      <div class="wrap">
        <header class="split-head" mhReveal>
          <h2 id="more-title" class="title">{{ t.title }}</h2>
          <p class="sub">{{ t.sub }}</p>
        </header>

        <ul class="more-grid" role="list">
          <li class="card card--hover tile about" mhReveal>
            <div class="body">
              <span class="badge">{{ t.about.tag }}</span>
              <h3>{{ a.profile.name }}</h3>
              <p class="role mono">{{ a.profile.role }}, {{ a.profile.facts[0].v }}</p>
              <p>{{ a.hero.lede }}</p>
              <ul class="badges" role="list" aria-label="Personality">
                @for (tr of a.profile.traits; track tr) {
                  <li class="tag">{{ tr }}</li>
                }
              </ul>
              <a class="more stretch" routerLink="/about">{{ t.about.cta }} <ng-icon name="phosphorArrowRight" aria-hidden="true" /></a>
            </div>
          </li>

          <li class="card card--hover tile" mhReveal [revealIndex]="1">
            <div class="specimen"><span class="brand-mark"><mh-logo [size]="38" /></span></div>
            <span class="badge">{{ t.brand.tag }}</span>
            <h3>{{ t.brand.title }}</h3>
            <p>{{ t.brand.body }}</p>
            <a class="more stretch" routerLink="/brand">{{ t.brand.cta }} <ng-icon name="phosphorArrowRight" aria-hidden="true" /></a>
          </li>

          <li class="card card--hover tile" mhReveal [revealIndex]="2">
            <div class="specimen icons">
              @for (i of icons; track i.id) {
                <img [src]="'/images/weather-icons/animated/' + i.id + '.svg'" width="146" height="146" [alt]="i.name + ' icon'" loading="lazy" decoding="async" />
              }
            </div>
            <span class="badge">{{ t.icons.tag }}</span>
            <h3>{{ t.icons.title }}</h3>
            <p>{{ t.icons.body }}</p>
            <a class="more stretch" routerLink="/work" fragment="weather-icons">{{ t.icons.cta }} <ng-icon name="phosphorArrowRight" aria-hidden="true" /></a>
          </li>
        </ul>
      </div>
    </section>
  `,
  styles: `
    :host {
      display: block;
    }
    .split-head {
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 16px 40px;
      margin-bottom: 36px;
    }
    .split-head > .title {
      flex: 1 1 320px;
      margin: 0;
    }
    .split-head > .sub {
      flex: 0 1 46ch;
      margin: 0;
      color: var(--muted);
    }
    .more-grid {
      display: grid;
      grid-template-columns: minmax(0, 1.5fr) repeat(2, minmax(0, 1fr));
      gap: 12px;
      margin: 0;
      padding: 0;
      list-style: none;
    }
    .tile {
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 10px;
    }
    .tile h3 {
      margin: 4px 0 0;
      font-size: 1.15rem;
      line-height: 1.25;
      letter-spacing: -0.02em;
      font-weight: 600;
    }
    .tile p {
      margin: 0;
      color: var(--ink-2);
      font-size: 15px;
    }
    .about {
      flex-direction: row;
      align-items: stretch;
      gap: 22px;
    }
    .body {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 10px;
      min-inline-size: 0;
    }
    .role {
      font-size: 12.5px;
      color: var(--muted) !important;
    }
    .specimen {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 4px;
      inline-size: 100%;
      block-size: 112px;
      margin-bottom: 6px;
      border-radius: var(--r-inner);
      border: 1px solid var(--line);
      background:
        radial-gradient(circle, var(--line-strong) 1px, transparent 1.2px) center / 16px 16px,
        var(--bg);
    }
    .specimen .brand-mark {
      --tile: 64px;
      border-radius: 50%;
    }
    .specimen.icons img {
      inline-size: 84px;
      block-size: auto;
    }
    .more {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      margin-top: auto;
      padding-top: 6px;
      min-block-size: 44px;
      font-size: 14.5px;
      font-weight: 500;
      color: var(--ink);
    }
    /* The whole card is clickable through its one link. */
    .stretch::after {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: var(--r-card);
    }
    @media (max-width: 1000px) {
      .more-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
      .about {
        grid-column: 1 / -1;
      }
    }
    @media (max-width: 640px) {
      .more-grid {
        grid-template-columns: minmax(0, 1fr);
      }
      .about {
        flex-direction: column;
      }
    }
  `,
})
export class HomeMore {
  protected readonly t = COPY;
  protected readonly a = ABOUT_COPY;
  protected readonly icons = ICONS;
}
