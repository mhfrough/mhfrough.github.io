import { ChangeDetectionStrategy, Component, DestroyRef, afterNextRender, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { phosphorArrowRight, phosphorArrowUpRight, phosphorRobot, phosphorTreeStructure, phosphorUsersThree } from '@ng-icons/phosphor-icons/regular';
import { SITE } from '../../core/site.config';
import { Logo } from '../../shared/ui/logo';

interface Original {
  name: string;
  mark: string;
  /** Internal case study, or an external link when there is none yet. */
  href: string;
  external?: boolean;
}

/** My Originals as one static dock, in the /work shelf order (TOOL_ORDER). */
const ORIGINALS: Original[] = [
  { name: 'Quorum', mark: '/images/quorum/favicon.svg', href: '/work/quorum' },
  { name: 'Jot', mark: '/images/jot/jot-mark.svg', href: 'https://mhfrough.github.io/jot/', external: true },
  { name: 'Flick', mark: '/images/flick/flick-mark.svg', href: '/work/flick' },
  { name: 'Pinch', mark: '/images/pinch/pinch-mark.svg', href: '/work/pinch' },
  { name: 'Scrawl', mark: '/images/scrawl/scrawl-mark.svg', href: '/work/scrawl' },
  { name: 'Sizzle', mark: '/images/sizzle/sizzle-mark.svg', href: '/work/sizzle' },
  { name: 'Swoop', mark: '/images/swoop/swoop-mark.svg', href: '/work/swoop' },
];

const ROLES = [
  { icon: 'phosphorTreeStructure', k: 'Architect', v: 'Multi-tenant SaaS, micro-frontends, fintech' },
  { icon: 'phosphorUsersThree', k: 'Lead developer', v: 'A team of 7+ across three live platforms' },
  { icon: 'phosphorRobot', k: 'AI-first', v: 'Agentic workflows in Claude Code, plan to test' },
];

/**
 * Home hero, right column: a "now" card, the pattern many developer portfolios use instead of a project carousel.
 * Who I am and the time in Karāchi, what I am building right now (Little Surprises, my startup), the three roles
 * I work in, and a still dock of my Originals. Nothing rotates. The clock is browser-only: a prerendered time
 * would be wrong, so the server renders a placeholder.
 */
@Component({
  selector: 'mh-hero-card',
  imports: [RouterLink, NgIcon, Logo],
  viewProviders: [provideIcons({ phosphorArrowRight, phosphorArrowUpRight, phosphorRobot, phosphorTreeStructure, phosphorUsersThree })],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="stack">
      <article class="card card--lift now" aria-labelledby="now-title">
        <header class="who">
          <span class="mark" aria-hidden="true"><mh-logo [size]="26" /></span>
          <div class="id">
            <p class="name">{{ name }}</p>
            <p class="role">{{ role }}</p>
          </div>
          <p class="clock mono">
            {{ city }} <time [attr.datetime]="iso()">{{ time() || '--:--' }}</time>
          </p>
        </header>

        <a class="build" routerLink="/work/little-surprises">
          <div class="build-copy">
            <div class="build-top">
              <span class="tag">Now building</span>
              <span class="live mono"><span class="blip is-on" aria-hidden="true"></span>Live</span>
            </div>
            <div class="build-id">
              <span class="icon-tile icon-tile--fav" aria-hidden="true">
                <img src="/images/little-surprises/little-surprises-mark.webp" width="28" height="28" alt="" decoding="async" />
              </span>
              <div>
                <h2 id="now-title" class="build-name">Little Surprises</h2>
                <p class="build-line">My gift-basket startup with my wife. Built online, wrapped by hand.</p>
              </div>
            </div>
            <span class="more">Read the case study <ng-icon name="phosphorArrowRight" aria-hidden="true" /></span>
          </div>
          <span class="shot">
            <img
              src="/images/little-surprises/site-home-640.webp"
              srcset="/images/little-surprises/site-home-640.webp 640w, /images/little-surprises/site-home-960.webp 960w"
              sizes="(max-width: 1040px) 60vw, 260px"
              width="640"
              height="400"
              alt="The littlesurprises.shop home page: Wrapped by hand, for you, beside a basket of wrapped treats."
              decoding="async"
            />
          </span>
        </a>

        <ul class="roles" role="list">
          @for (r of roles; track r.k) {
            <li>
              <span class="icon-well" aria-hidden="true"><ng-icon [name]="r.icon" /></span>
              <span><b>{{ r.k }}</b><span class="v">{{ r.v }}</span></span>
            </li>
          }
        </ul>

        <footer class="dock">
          <p class="dock-label mono">Originals</p>
          <ul class="dock-list" role="list" aria-label="Originals, my own products">
            @for (o of originals; track o.name) {
              <li>
                @if (o.external) {
                  <a [href]="o.href" target="_blank" rel="noopener" [attr.aria-label]="o.name + ' (opens in a new tab)'" [title]="o.name">
                    <img [src]="o.mark" width="26" height="26" alt="" loading="lazy" decoding="async" />
                  </a>
                } @else {
                  <a [routerLink]="o.href" [attr.aria-label]="o.name" [title]="o.name">
                    <img [src]="o.mark" width="26" height="26" alt="" loading="lazy" decoding="async" />
                  </a>
                }
              </li>
            }
          </ul>
        </footer>
      </article>
    </div>
  `,
  styles: `
    :host {
      display: block;
      min-width: 0;
    }
    /* A second, offset card behind the panel for depth (same as the Quorum builder) */
    .stack {
      position: relative;
      padding-top: 18px;
    }
    .stack::before {
      content: '';
      position: absolute;
      left: 6%;
      right: 6%;
      top: 0;
      height: 60px;
      border-radius: var(--r-card);
      background: var(--surface-2);
      border: 1px solid var(--line);
    }
    .now {
      position: relative;
      display: grid;
      gap: 14px;
      padding: 18px;
    }

    /* Identity row */
    .who {
      display: grid;
      grid-template-columns: auto minmax(0, 1fr) auto;
      align-items: center;
      gap: 12px;
    }
    .mark {
      display: grid;
      place-items: center;
      width: 40px;
      height: 40px;
      border-radius: var(--r-inner);
      background: var(--surface-2);
      box-shadow: inset 0 0 0 1px var(--line);
      color: var(--ink);
    }
    .name {
      font-weight: 600;
      font-size: 15px;
      letter-spacing: -0.01em;
      line-height: 1.25;
    }
    .role {
      color: var(--muted);
      font-size: 13px;
      line-height: 1.3;
    }
    .clock {
      font-size: 12px;
      color: var(--muted);
      white-space: nowrap;

      time {
        color: var(--ink);
        font-variant-numeric: tabular-nums;
      }
    }

    /* Now building */
    .build {
      display: grid;
      grid-template-columns: minmax(0, 1fr) minmax(0, 0.9fr);
      gap: 14px;
      align-items: center;
      padding: 14px;
      border-radius: var(--r-inner);
      background: var(--surface-2);
      box-shadow: inset 0 0 0 1px var(--line);
      color: inherit;
      transition: box-shadow 0.2s var(--ease);

      &:hover {
        box-shadow: inset 0 0 0 1px var(--line-strong, var(--line)), var(--shadow);
      }
      &:hover .shot img {
        transform: scale(1.03);
      }
    }
    .build-copy {
      display: grid;
      gap: 12px;
      min-width: 0;
    }
    .build-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
    }
    .live {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      font-size: 12px;
      color: var(--ink-2);
    }
    .build-id {
      display: grid;
      grid-template-columns: auto minmax(0, 1fr);
      gap: 10px;
      align-items: start;
    }
    .build-name {
      font-size: 16px;
      font-weight: 600;
      letter-spacing: -0.015em;
      line-height: 1.25;
    }
    .build-line {
      display: block;
      margin-top: 2px;
      font-size: 13px;
      line-height: 1.4;
      color: var(--ink-2);
    }
    .more {
      font-size: 13px;
    }
    .shot {
      display: block;
      overflow: hidden;
      border-radius: 10px;
      box-shadow: 0 0 0 1px var(--line), var(--shadow);
      background: var(--surface);

      img {
        display: block;
        width: 100%;
        height: auto;
        transition: transform 0.5s var(--ease);
      }
    }

    /* Roles */
    .roles {
      display: grid;
      gap: 2px;

      li {
        display: grid;
        grid-template-columns: auto minmax(0, 1fr);
        gap: 12px;
        align-items: center;
        padding: 6px 2px;
      }
      b {
        display: block;
        font-size: 14px;
        font-weight: 600;
        line-height: 1.3;
      }
      .v {
        display: block;
        font-size: 13px;
        color: var(--muted);
        line-height: 1.35;
      }
      .icon-well {
        width: 34px;
        height: 34px;
        font-size: 17px;
      }
    }

    /* Originals dock */
    .dock {
      display: flex;
      align-items: center;
      gap: 12px;
      padding-top: 12px;
      border-top: 1px solid var(--line);
    }
    .dock-label {
      font-size: 12px;
      color: var(--muted);
    }
    .dock-list {
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      gap: 2px;
      flex: 1;

      a {
        display: grid;
        place-items: center;
        width: 44px;
        height: 44px;
        border-radius: 12px;
        transition: background-color 0.2s var(--ease), transform 0.2s var(--ease);

        &:hover {
          background: var(--surface-2);
          transform: translateY(-2px);
        }
      }
      img {
        width: 26px;
        height: 26px;
        border-radius: 7px;
      }
    }
    @media (max-width: 520px) {
      .build {
        grid-template-columns: 1fr;
      }
      .shot {
        order: -1;
      }
      .who {
        grid-template-columns: auto minmax(0, 1fr);
      }
      .clock {
        grid-column: 1 / -1;
      }
      .dock {
        flex-wrap: wrap;
      }
      .dock-label {
        flex-basis: 100%;
      }
      .now {
        padding: 14px;
      }
      /* Seven equal columns, so the dock never wraps to a lonely second row on a phone. */
      .dock-list {
        display: grid;
        grid-template-columns: repeat(7, minmax(0, 1fr));
        gap: 0;

        a {
          width: 100%;
        }
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .shot img,
      .dock-list a {
        transition: none;
      }
      .build:hover .shot img,
      .dock-list a:hover {
        transform: none;
      }
    }
  `,
})
export class HeroCard {
  protected readonly name = SITE.name;
  protected readonly role = SITE.role;
  protected readonly city = SITE.localityLabel;
  protected readonly roles = ROLES;
  protected readonly originals = ORIGINALS;
  protected readonly time = signal('');
  protected readonly iso = signal<string | null>(null);

  constructor() {
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      const fmt = new Intl.DateTimeFormat('en-GB', { timeZone: SITE.timeZone, hour: '2-digit', minute: '2-digit', hour12: false });
      const tick = () => {
        const now = new Date();
        this.time.set(fmt.format(now));
        this.iso.set(now.toISOString());
      };
      tick();
      const id = setInterval(tick, 20_000);
      destroyRef.onDestroy(() => clearInterval(id));
    });
  }
}
