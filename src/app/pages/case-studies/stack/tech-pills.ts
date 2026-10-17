import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  phosphorBell,
  phosphorBroadcast,
  phosphorChartLineUp,
  phosphorCloudArrowUp,
  phosphorCode,
  phosphorCreditCard,
  phosphorGauge,
  phosphorFilePdf,
  phosphorLock,
  phosphorPackage,
  phosphorPlugs,
  phosphorShareNetwork,
  phosphorShieldCheck,
  phosphorTranslate,
} from '@ng-icons/phosphor-icons/regular';
import { TECH_LOGOS } from './tech-logos';

/** One technology. `logo` is a Simple Icons slug from tech-logos.ts; `icon` a Phosphor fallback for the rest. */
export interface Tech {
  name: string;
  logo?: string;
  icon?: string;
}

/**
 * Technology pills for case-study stack sections: the site's mono `.tag` pill with the brand logo in a small
 * circle at the start, the same shape as the hobby pills on /about. Logos are decorative (the name is the text).
 * Shared by the case studies; lives here, not in shared/, per the page-folder rule in CLAUDE.md.
 */
@Component({
  selector: 'mh-tech-pills',
  imports: [NgIcon],
  viewProviders: [
    provideIcons({
      phosphorBell,
      phosphorBroadcast,
      phosphorChartLineUp,
      phosphorCloudArrowUp,
      phosphorCode,
      phosphorCreditCard,
      phosphorGauge,
      phosphorFilePdf,
      phosphorLock,
      phosphorPackage,
      phosphorPlugs,
      phosphorShareNetwork,
      phosphorShieldCheck,
      phosphorTranslate,
    }),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ul class="badges" role="list">
      @for (t of items(); track t.name) {
        <li class="tag tag--logo">
          @if (t.logo && logos[t.logo]; as l) {
            <span class="logo" [class.dark]="l.dark" aria-hidden="true">
              <img [src]="l.src" alt="" width="14" height="14" loading="lazy" decoding="async" />
            </span>
          } @else {
            <span class="logo logo--icon" aria-hidden="true"><ng-icon [name]="t.icon ?? 'phosphorCode'" /></span>
          }
          {{ t.name }}
        </li>
      }
    </ul>
  `,
  styles: `
    :host {
      display: block;
    }

    .tag--logo {
      height: auto;
      min-height: 28px;
      max-width: 100%;
      padding-top: 2px;
      padding-bottom: 2px;
      white-space: normal; // a long pill wraps inside its card on a 320px phone instead of sticking out
      padding-left: 3px;
      gap: 7px;
      background: var(--surface);
      border: 1px solid var(--line);
      color: var(--ink);
    }

    // White circle so every brand colour reads, with a hairline ring like the /about covers.
    .logo {
      flex: none;
      width: 22px;
      height: 22px;
      display: grid;
      place-items: center;
      border-radius: 50%;
      background: #fff;
      box-shadow: 0 0 0 1px var(--line);

      img {
        width: 13px;
        height: 13px;
      }

      &.dark {
        background: #1d1d1d;
        box-shadow: none;
      }
    }

    .logo--icon {
      background: var(--surface-2);
      color: var(--ink-2);
      font-size: 13px;
    }
  `,
})
export class TechPills {
  readonly items = input.required<readonly Tech[]>();
  protected readonly logos = TECH_LOGOS;
}
