import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Reveal } from '../../../shared/directives/reveal.directive';
import { Skeleton } from '../../../shared/ui/skeleton';
import { COPY } from '../brand.copy';
import { BrandCmpActions } from './cmp-actions';
import { BrandCmpForms } from './cmp-forms';
import { BrandCmpStatus } from './cmp-status';
import { BrandCmpSurfaces } from './cmp-surfaces';

/**
 * Components. Actions and cards are cheap HTML and stay server-rendered; forms and media (images, observers)
 * are deferred until they scroll near, with skeletons in the same shape. Group heads stay in the prerender.
 */
@Component({
  selector: 'mh-brand-components',
  imports: [Reveal, Skeleton, BrandCmpActions, BrandCmpSurfaces, BrandCmpForms, BrandCmpStatus],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="bp-head" mhReveal>
      <h2 class="title" id="components-title">{{ t.title }}</h2>
      <p class="sub">{{ t.sub }}</p>
    </header>

    <mh-brand-cmp-actions />
    <mh-brand-cmp-surfaces />

    <div class="bp-subhead">
      <h3 class="h3">{{ g.forms.title }}</h3>
      <p>{{ g.forms.sub }}</p>
    </div>
    @defer (on viewport) {
      <mh-brand-cmp-forms />
    } @placeholder (minimum 300ms) {
      <div class="bp-grid" aria-hidden="true">
        <mh-skeleton shape="block" height="300px" class="bp-skel span-all" />
        @for (i of cells; track i) {
          <mh-skeleton shape="block" height="236px" class="bp-skel" />
        }
      </div>
    }

    <div class="bp-subhead">
      <h3 class="h3">{{ g.status.title }}</h3>
      <p>{{ g.status.sub }}</p>
    </div>
    @defer (on viewport) {
      <mh-brand-cmp-status />
    } @placeholder (minimum 300ms) {
      <div class="bp-grid" aria-hidden="true">
        <mh-skeleton shape="block" height="220px" class="bp-skel" />
        <mh-skeleton shape="block" height="220px" class="bp-skel" />
        <mh-skeleton shape="block" height="420px" class="bp-skel span-all" />
      </div>
    }
  `,
  styles: `
    :host {
      display: block;
    }
  `,
})
export class BrandComponents {
  protected readonly t = COPY.components;
  protected readonly g = COPY.components.groups;
  protected readonly cells = [0, 1, 2];
}
