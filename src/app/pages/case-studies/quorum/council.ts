import { ChangeDetectionStrategy, Component, ElementRef, signal, viewChildren } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  phosphorAnchor,
  phosphorBone,
  phosphorChatCircle,
  phosphorCompass,
  phosphorCpu,
  phosphorEyeSlash,
  phosphorFire,
  phosphorHandHeart,
  phosphorMoon,
  phosphorSunHorizon,
} from '@ng-icons/phosphor-icons/regular';
import { COPY, MEMBERS } from './quorum.copy';

/**
 * The seven, as a roster + detail panel (WAI-ARIA tabs). Every panel is server-rendered (inactive ones are
 * [hidden]), so all seven members stay in the prerendered HTML for crawlers.
 * Below 900px the roster becomes a horizontal, snap-scrolling row of pills above the panel.
 */
@Component({
  selector: 'mh-quorum-council',
  imports: [NgIcon],
  viewProviders: [
    provideIcons({
      phosphorAnchor,
      phosphorSunHorizon,
      phosphorHandHeart,
      phosphorFire,
      phosphorMoon,
      phosphorCompass,
      phosphorBone,
      phosphorCpu,
      phosphorChatCircle,
      phosphorEyeSlash,
    }),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="council">
      <div class="roster" role="tablist" [attr.aria-label]="t.tablist" aria-orientation="vertical" (keydown)="onKey($event)">
        @for (m of members; track m.id; let i = $index) {
          <button
            #tab
            type="button"
            role="tab"
            class="tab"
            [id]="'qm-tab-' + m.id"
            [attr.aria-selected]="active() === i"
            [attr.aria-controls]="'qm-panel-' + m.id"
            [tabIndex]="active() === i ? 0 : -1"
            (click)="active.set(i)"
          >
            <span class="tab__icon" aria-hidden="true"><ng-icon [name]="m.icon" /></span>
            <span class="tab__text">
              <span class="tab__name">{{ m.name }}</span>
              <span class="tab__role">{{ m.role }}</span>
            </span>
            <span class="tab__model">{{ m.model }}</span>
          </button>
        }
      </div>

      @for (m of members; track m.id; let i = $index) {
        <article
          class="panel"
          role="tabpanel"
          [id]="'qm-panel-' + m.id"
          [attr.aria-labelledby]="'qm-tab-' + m.id"
          [hidden]="active() !== i"
          tabindex="0"
        >
          <header class="panel__head">
            <span class="panel__icon" aria-hidden="true"><ng-icon [name]="m.icon" /></span>
            <div>
              <h3 class="panel__name">{{ m.name }}</h3>
              <p class="panel__role">{{ m.role }}</p>
            </div>
          </header>

          <div class="method">
            <p class="kicker">{{ t.method }}</p>
            <p class="method__name">{{ m.method }}</p>
            <p class="method__body">{{ m.methodBody }}</p>
          </div>

          <ul class="badges" role="list">
            <li class="badge"><ng-icon name="phosphorCpu" aria-hidden="true" />{{ m.model }}</li>
            <li class="badge"><ng-icon name="phosphorChatCircle" aria-hidden="true" />{{ m.voice }}</li>
            <li class="badge">{{ m.swearing }}</li>
          </ul>

          <figure class="says">
            <figcaption class="kicker">{{ t.says }}</figcaption>
            <blockquote lang="en">
              “@for (r of m.says; track $index) {@if (r.em) {<em>{{ r.t }}</em>} @else {<ng-container>{{ r.t }}</ng-container>}}”
            </blockquote>
          </figure>

          <dl class="facts">
            <div>
              <dt class="kicker">{{ t.blind }}</dt>
              <dd><ng-icon name="phosphorEyeSlash" aria-hidden="true" />{{ m.blind }}</dd>
            </div>
            <div>
              <dt class="kicker">{{ t.board }}</dt>
              <dd>{{ m.move }}</dd>
            </div>
            <div class="facts__traits">
              <dt class="kicker">{{ t.traits }}</dt>
              <dd>
                <ul class="traits" role="list">
                  @for (tr of m.traits; track tr) {
                    <li>{{ tr }}</li>
                  }
                </ul>
              </dd>
            </div>
          </dl>
        </article>
      }
    </div>
  `,
  styleUrl: './council.scss',
})
export class QuorumCouncil {
  protected readonly t = COPY.council;
  protected readonly members = MEMBERS;
  protected readonly active = signal(0);
  private readonly tabs = viewChildren<ElementRef<HTMLButtonElement>>('tab');

  protected onKey(e: KeyboardEvent): void {
    const n = this.members.length;
    const i = this.active();
    const next =
      e.key === 'ArrowDown' || e.key === 'ArrowRight'
        ? (i + 1) % n
        : e.key === 'ArrowUp' || e.key === 'ArrowLeft'
          ? (i - 1 + n) % n
          : e.key === 'Home'
            ? 0
            : e.key === 'End'
              ? n - 1
              : -1;
    if (next < 0) return;
    e.preventDefault();
    this.active.set(next);
    this.tabs()[next]?.nativeElement.focus();
  }
}
