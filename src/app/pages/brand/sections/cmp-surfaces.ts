import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { phosphorBriefcase, phosphorCube, phosphorGauge, phosphorSignpost, phosphorUsersThree } from '@ng-icons/phosphor-icons/regular';
import { COPY } from '../brand.copy';
import { Spec } from './spec';

/** Components, part 2: cards, icon wells and a bento grid. Server-rendered. */
@Component({
  selector: 'mh-brand-cmp-surfaces',
  imports: [Spec, NgIcon],
  viewProviders: [provideIcons({ phosphorSignpost, phosphorUsersThree, phosphorCube, phosphorGauge, phosphorBriefcase })],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="bp-subhead">
      <h3 class="h3">{{ g.title }}</h3>
      <p>{{ g.sub }}</p>
    </div>
    <div class="bp-grid">
      <mh-spec name="Card" cls=".card" layout="sunk">
        <article class="card">
          <h4 class="h3">Frame</h4>
          <p>Surface, 1px line, 16px radius, 22px padding.</p>
        </article>
      </mh-spec>
      <mh-spec name="Hover card" cls=".card.card--hover" layout="sunk">
        <article class="card card--hover">
          <h4 class="h3">Debate</h4>
          <p>Lifts 2px and gains a shadow on hover.</p>
        </article>
      </mh-spec>
      <mh-spec name="Solid card" cls=".card.card--solid" layout="sunk">
        <article class="card card--solid">
          <h4 class="h3">Vote</h4>
          <p>The featured cell. One or two per grid.</p>
        </article>
      </mh-spec>
      <mh-spec name="Lifted card" cls=".card.card--lift" layout="sunk">
        <article class="card card--lift">
          <h4 class="h3">Count</h4>
          <p>Hero cards and working demos.</p>
        </article>
      </mh-spec>
      <mh-spec name="Icon well and tile" cls=".icon-well | .icon-tile" class="span-all">
        <span class="icon-well"><ng-icon name="phosphorSignpost" aria-hidden="true" /></span>
        <span class="icon-well"><ng-icon name="phosphorUsersThree" aria-hidden="true" /></span>
        <span class="icon-tile"><ng-icon name="phosphorCube" aria-hidden="true" /></span>
        <span class="icon-tile"><ng-icon name="phosphorGauge" aria-hidden="true" /></span>
      </mh-spec>
      <mh-spec name="Project mark tile" cls=".icon-tile.icon-tile--fav" class="span-all">
        @for (m of marks; track m.src) {
          <span class="icon-tile icon-tile--fav"><img [src]="m.src" width="28" height="28" [alt]="m.alt" loading="lazy" decoding="async" /></span>
        }
      </mh-spec>
      <mh-spec name="Bento" cls=".bento > .card.wide | .card--solid" layout="col sunk" class="span-all">
        <div class="bento">
          <article class="card card--hover wide">
            <span class="icon-tile"><ng-icon name="phosphorBriefcase" aria-hidden="true" /></span>
            <h4 class="h3">30+ products</h4>
            <p>Banking, tax, investment and fleet management, shipped to production.</p>
          </article>
          <article class="card card--solid">
            <p class="big">7</p>
            <p>Years building production SaaS.</p>
          </article>
          <article class="card card--hover">
            <p class="big">6</p>
            <p>Banking apps embed one tax-filing flow.</p>
          </article>
          <article class="card card--hover">
            <p class="big">4</p>
            <p>Angular apps in one micro-frontend platform.</p>
          </article>
          <article class="card card--hover">
            <p class="big">3</p>
            <p>Production platforms deployed at once.</p>
          </article>
        </div>
      </mh-spec>
    </div>
  `,
  styles: `
    .card {
      width: 100%;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .card p {
      color: var(--ink-2);
      font-size: 15px;
    }
    .card--solid p {
      color: color-mix(in oklab, var(--solid-ink) 72%, transparent);
    }
    .bento {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 12px;
    }
    .bento .card {
      gap: 10px;
    }
    .bento .wide {
      grid-column: span 2;
    }
    .bento .icon-tile {
      margin-bottom: 6px;
    }
    .bento .big {
      font-size: 2.6rem;
      line-height: 1;
      font-weight: 600;
      letter-spacing: -0.04em;
      color: inherit;
      font-variant-numeric: tabular-nums;
    }
    .card--solid .big {
      color: var(--solid-ink);
    }
    @media (max-width: 760px) {
      .bento {
        grid-template-columns: minmax(0, 1fr);
      }
      .bento .wide {
        grid-column: auto;
      }
    }
  `,
})
export class BrandCmpSurfaces {
  protected readonly g = COPY.components.groups.surfaces;
  /** A few real project marks, as the home bento and /work cards show them. */
  protected readonly marks = [
    { src: '/images/o2chat/o2chat-mark.webp', alt: 'O2Chat' },
    { src: '/images/epractise/epractise-mark.webp', alt: 'ePractise' },
    { src: '/images/dmax/dmax-mark.webp', alt: 'DMAX' },
    { src: '/images/tmf/tmf-mark.webp', alt: 'TMF' },
    { src: '/images/finclore/finclore-mark.svg', alt: 'Finclore' },
    { src: '/images/malik-transport/malik-transport-mark.webp', alt: 'Malik Transport' },
  ];
}
