import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  phosphorArrowLeft,
  phosphorArrowRight,
  phosphorArrowUp,
  phosphorArrowUpRight,
  phosphorBriefcase,
  phosphorCheck,
  phosphorCopy,
  phosphorCube,
  phosphorDribbbleLogo,
  phosphorGauge,
  phosphorGithubLogo,
  phosphorLinkedinLogo,
  phosphorList,
  phosphorScales,
  phosphorShieldCheck,
  phosphorSignpost,
  phosphorUsersThree,
  phosphorX,
} from '@ng-icons/phosphor-icons/regular';
import { Reveal } from '../../../shared/directives/reveal.directive';
import { COPY } from '../brand.copy';
import { ICONS, ICON_SIZES } from '../brand.data';

const USAGE = `import { NgIcon, provideIcons } from '@ng-icons/core';
import { phosphorArrowRight } from '@ng-icons/phosphor-icons/regular';

@Component({
  imports: [NgIcon],
  viewProviders: [provideIcons({ phosphorArrowRight })],
  template: \`<a class="btn btn-solid" routerLink="/work">
    View work<ng-icon name="phosphorArrowRight" aria-hidden="true" />
  </a>\`,
})`;

/** Iconography: the Phosphor regular set in use, the size ladder, usage and rules. */
@Component({
  selector: 'mh-brand-icons',
  imports: [Reveal, NgIcon],
  viewProviders: [
    provideIcons({
      phosphorArrowRight,
      phosphorArrowUpRight,
      phosphorArrowUp,
      phosphorArrowLeft,
      phosphorList,
      phosphorX,
      phosphorCopy,
      phosphorCheck,
      phosphorGithubLogo,
      phosphorLinkedinLogo,
      phosphorDribbbleLogo,
      phosphorUsersThree,
      phosphorSignpost,
      phosphorScales,
      phosphorShieldCheck,
      phosphorGauge,
      phosphorCube,
      phosphorBriefcase,
    }),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="bp-head" mhReveal>
      <h2 class="title" id="icons-title">{{ t.title }}</h2>
      <p class="sub">{{ t.sub }}</p>
    </header>

    <ul class="grid card" role="list">
      @for (i of icons; track i.key) {
        <li>
          <ng-icon [name]="i.key" aria-hidden="true" />
          <code>{{ i.label }}</code>
        </li>
      }
    </ul>

    <div class="bp-subhead">
      <h3 class="h3">{{ t.sizes }}</h3>
      <p>Set by the component, never per icon. The 24px grid of Phosphor stays crisp at each step.</p>
    </div>
    <ul class="sizes card" role="list">
      @for (s of sizes; track s.px) {
        <li>
          <ng-icon name="phosphorUsersThree" [style.font-size.px]="s.px" aria-hidden="true" />
          <code>{{ s.px }}px</code>
          <span>{{ s.where }}</span>
        </li>
      }
    </ul>

    <div class="bp-subhead">
      <h3 class="h3">{{ t.usage }}</h3>
    </div>
    <div class="bp-grid">
      <div class="code span-all">
        <pre>{{ usage }}</pre>
      </div>
      <div class="card span-all">
        <ul class="bp-list" role="list">
          @for (r of t.rules; track r) {
            <li>{{ r }}</li>
          }
        </ul>
      </div>
    </div>
  `,
  styles: `
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(116px, 1fr));
      gap: 6px;
      padding: 14px;
    }
    .grid li {
      display: grid;
      justify-items: center;
      gap: 12px;
      padding: 22px 8px 16px;
      border-radius: var(--r-inner);
      transition: background var(--t-base) var(--ease);
    }
    .grid li:hover {
      background: var(--surface-2);
    }
    .grid ng-icon {
      font-size: 26px;
    }
    .grid code {
      font-size: 11.5px;
      color: var(--muted);
      text-align: center;
    }
    .sizes {
      padding: 26px;
      display: flex;
      flex-wrap: wrap;
      align-items: flex-end;
      gap: 24px 40px;
    }
    .sizes li {
      display: grid;
      justify-items: start;
      gap: 6px;
    }
    .sizes code {
      font-size: 12.5px;
      color: var(--ink);
    }
    .sizes span {
      font-size: 13px;
      color: var(--muted);
    }
    .code pre {
      font-size: 12.5px;
    }
  `,
})
export class BrandIcons {
  protected readonly t = COPY.icons;
  protected readonly icons = ICONS;
  protected readonly sizes = ICON_SIZES;
  protected readonly usage = USAGE;
}
