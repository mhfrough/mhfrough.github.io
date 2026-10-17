import { ChangeDetectionStrategy, Component, DestroyRef, afterNextRender, inject, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { phosphorMoonStars, phosphorSunHorizon } from '@ng-icons/phosphor-icons/regular';
import { SITE } from '../../core/site.config';
import { Logo } from '../../shared/ui/logo';
import { ABOUT_COPY } from './about.copy';

/**
 * Hero card: the ء mark, name, traits, a few facts, and a live Karachi clock that says which mode I'm in
 * (weekdays early bird, weekends night owl). The clock is browser-only: a prerendered time would be wrong.
 * No photo of the owner, by choice: the slot always shows the mark.
 */
@Component({
  selector: 'mh-profile-card',
  imports: [NgIcon, Logo],
  viewProviders: [provideIcons({ phosphorMoonStars, phosphorSunHorizon })],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'card card--lift profile' },
  template: `
    <div class="top">
      <figure class="photo">
        <span class="photo-mark" role="img" [attr.aria-label]="t.name"><mh-logo [size]="72" /></span>
      </figure>
      <div class="who">
        <p class="name">{{ t.name }}</p>
        <p class="handle mono" translate="no">{{ t.handle }}</p>
        <p class="role">{{ t.role }}</p>
        <ul class="traits" role="list" aria-label="Personality">
          @for (tr of t.traits; track tr) {
            <li class="badge">{{ tr }}</li>
          }
        </ul>
      </div>
    </div>

    <dl class="facts">
      @for (f of t.facts; track f.k) {
        <div>
          <dt>{{ f.k }}</dt>
          <dd>{{ f.v }}</dd>
        </div>
      }
    </dl>

    <div class="now">
      <span class="icon-well" aria-hidden="true"><ng-icon [name]="weekend() ? 'phosphorMoonStars' : 'phosphorSunHorizon'" /></span>
      <div>
        <p class="now-label mono">
          {{ t.clockLabel }} <time [attr.datetime]="iso()">{{ time() || '--:--' }}</time>
        </p>
        <p class="now-mode">{{ weekend() ? t.weekend : t.weekday }}</p>
      </div>
    </div>
  `,
  styles: `
    :host {
      display: grid;
      gap: 18px;
      padding: 18px;
    }
    .top {
      display: grid;
      grid-template-columns: 148px minmax(0, 1fr);
      gap: 18px;
      align-items: center;
    }
    .photo {
      margin: 0;
      aspect-ratio: 4 / 5;
      border-radius: var(--r-inner);
      overflow: hidden;
      background: var(--surface-2);
      box-shadow: inset 0 0 0 1px var(--line);
    }
    .photo-mark {
      display: grid;
      place-items: center;
      block-size: 100%;
      color: var(--ink-2);
    }
    .who {
      display: grid;
      gap: 2px;
      justify-items: start;
    }
    .name {
      font-size: 1.3rem;
      font-weight: 600;
      letter-spacing: -0.025em;
      line-height: 1.2;
    }
    .handle {
      color: var(--muted);
      font-size: 12.5px;
    }
    .role {
      margin-top: 8px;
      color: var(--ink-2);
      font-size: 14.5px;
    }
    .traits {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin: 12px 0 0;
      padding: 0;
      list-style: none;
    }
    .traits .badge {
      height: 28px;
      padding: 0 11px;
      font-size: 12.5px;
      background: var(--surface-2);
      border: 1px solid var(--line);
    }
    .facts {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 14px 18px;
      margin: 0;
      padding: 16px 4px 0;
      border-top: 1px solid var(--line);
    }
    .facts div {
      display: grid;
      gap: 2px;
    }
    .facts dt {
      font-size: 12.5px;
      color: var(--muted);
    }
    .facts dd {
      margin: 0;
      font-size: 14.5px;
      color: var(--ink);
    }
    .now {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 12px 14px;
      border-radius: var(--r-inner);
      background: var(--surface-2);
      border: 1px solid var(--line);
    }
    .now-label {
      font-size: 12px;
      color: var(--muted);
    }
    .now-label time {
      color: var(--ink);
    }
    .now-mode {
      font-size: 14.5px;
      color: var(--ink);
    }
    @media (max-width: 480px) {
      .top {
        grid-template-columns: 112px minmax(0, 1fr);
        gap: 14px;
      }
      .name {
        font-size: 1.15rem;
      }
      .facts {
        grid-template-columns: 1fr;
      }
    }
    /* Smallest phones: a smaller mark tile leaves the name and role room to sit on one line. */
    @media (max-width: 360px) {
      .top {
        grid-template-columns: 84px minmax(0, 1fr);
      }
    }
  `,
})
export class ProfileCard {
  protected readonly t = ABOUT_COPY.profile;
  protected readonly time = signal('');
  protected readonly iso = signal('');
  protected readonly weekend = signal(false);

  constructor() {
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      const clock = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: SITE.timeZone });
      const day = new Intl.DateTimeFormat('en-GB', { weekday: 'short', timeZone: SITE.timeZone });
      const tick = () => {
        const now = new Date();
        this.time.set(clock.format(now));
        this.iso.set(now.toISOString());
        this.weekend.set(['Sat', 'Sun'].includes(day.format(now)));
      };
      tick();
      const id = setInterval(tick, 30_000);
      destroyRef.onDestroy(() => clearInterval(id));
    });
  }
}
