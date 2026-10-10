import { ChangeDetectionStrategy, Component, DestroyRef, afterNextRender, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { phosphorArrowUp, phosphorDribbbleLogo, phosphorGithubLogo, phosphorLinkedinLogo } from '@ng-icons/phosphor-icons/regular';
import { I18n, LocPipe } from '../core/i18n/i18n.service';
import { SITE } from '../core/site.config';
import { Logo } from '../shared/ui/logo';
import { LAYOUT_COPY } from './layout.copy';

/**
 * Small but complete footer: identity + availability, three link groups, and a mono
 * meta row (year, Karachi local time, language, back to top). No big CTA, no vertical rules.
 */
@Component({
  selector: 'mh-footer',
  imports: [RouterLink, NgIcon, Logo, LocPipe],
  viewProviders: [provideIcons({ phosphorGithubLogo, phosphorLinkedinLogo, phosphorDribbbleLogo, phosphorArrowUp })],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <footer class="footer" role="contentinfo">
      <div class="container grid">
        <div class="id">
          <a [routerLink]="'/' | loc" class="home" [attr.aria-label]="t().homeLabel"><mh-logo [size]="28" [wordmark]="true" /></a>
          <p class="blurb">{{ t().footer.blurb }}</p>
          <a class="status" [routerLink]="'/hire' | loc">
            <span class="status__mark" [class.is-on]="available" aria-hidden="true"></span>
            {{ available ? t().footer.available : t().footer.unavailable }}
          </a>
        </div>

        <nav class="col" [attr.aria-label]="t().footer.pages">
          <h2 class="label">{{ t().footer.pages }}</h2>
          <ul role="list">
            <li><a [routerLink]="'/work' | loc">{{ t().nav.work }}</a></li>
            <li><a [routerLink]="'/hire' | loc">{{ t().footer.hireLink }}</a></li>
            <li><a [routerLink]="'/brand' | loc">{{ t().nav.brand }}</a></li>
            <li><a [routerLink]="'/contact' | loc">{{ t().nav.contact }}</a></li>
          </ul>
        </nav>

        <nav class="col" [attr.aria-label]="t().footer.elsewhere">
          <h2 class="label">{{ t().footer.elsewhere }}</h2>
          <ul role="list">
            <li><a [href]="social.github" rel="me noopener" target="_blank"><ng-icon name="phosphorGithubLogo" aria-hidden="true" /> GitHub</a></li>
            <li><a [href]="social.linkedin" rel="me noopener" target="_blank"><ng-icon name="phosphorLinkedinLogo" aria-hidden="true" /> LinkedIn</a></li>
            <li><a [href]="social.dribbble" rel="me noopener" target="_blank"><ng-icon name="phosphorDribbbleLogo" aria-hidden="true" /> Dribbble</a></li>
          </ul>
        </nav>

        <nav class="col" [attr.aria-label]="t().footer.legal">
          <h2 class="label">{{ t().footer.legal }}</h2>
          <ul role="list">
            <li><a [routerLink]="'/privacy' | loc">{{ t().footer.privacy }}</a></li>
            <li><a [routerLink]="'/terms' | loc">{{ t().footer.terms }}</a></li>
            <li><a [routerLink]="'/cookies' | loc">{{ t().footer.cookies }}</a></li>
            <li><a [routerLink]="'/accessibility' | loc">{{ t().footer.accessibility }}</a></li>
          </ul>
        </nav>
      </div>

      <div class="container meta mono">
        <span>&copy; {{ year }} {{ t().footer.rights }}</span>
        <span class="time">
          {{ t().footer.localTime }}
          <time [attr.datetime]="timeIso()" dir="ltr">{{ time() || '--:--' }}</time>
          <span class="muted" dir="ltr">UTC+5</span>
        </span>
        <span class="end">
          <a [routerLink]="i18n.alternateHref()" [attr.hreflang]="i18n.other()" [attr.lang]="i18n.other()" class="lang">{{ t().langSwitch }}</a>
          <a href="#top" class="top" (click)="toTop($event)">{{ t().footer.top }} <ng-icon name="phosphorArrowUp" aria-hidden="true" /></a>
        </span>
      </div>
    </footer>
  `,
  styles: `
    .footer {
      border-block-start: 1px solid var(--line);
      margin-block-start: var(--s-9);
      padding-block: var(--s-7) var(--s-5);
      font-size: var(--fs-14);
    }
    .grid {
      display: grid;
      grid-template-columns: minmax(0, 2fr) repeat(3, minmax(0, 1fr));
      gap: var(--s-6) var(--s-5);
    }
    .id {
      display: grid;
      gap: var(--s-3);
      align-content: start;
      justify-items: start;
    }
    .blurb {
      color: var(--muted);
      max-inline-size: 38ch;
    }
    .status {
      display: inline-flex;
      align-items: center;
      gap: var(--s-2);
      color: var(--ink-2);
      font-size: var(--fs-13);
    }
    .status:hover {
      color: var(--ink);
    }
    .status__mark {
      inline-size: 8px;
      block-size: 8px;
      border: 1px solid var(--ink-2);
    }
    .status__mark.is-on {
      background: var(--ink);
      border-color: var(--ink);
    }
    @media (prefers-reduced-motion: no-preference) {
      .status__mark.is-on {
        animation: pulse 2.4s var(--ease-in-out) infinite;
      }
    }
    @keyframes pulse {
      50% {
        opacity: 0.35;
      }
    }
    .col h2 {
      margin-block-end: var(--s-3);
      font-weight: 400;
    }
    .col ul {
      display: grid;
      gap: var(--s-2);
    }
    .col a {
      display: inline-flex;
      align-items: center;
      gap: var(--s-2);
      color: var(--ink-2);
      transition: color var(--t-fast) var(--ease);
    }
    .col a:hover {
      color: var(--ink);
    }
    .meta {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: var(--s-3) var(--s-5);
      margin-block-start: var(--s-7);
      padding-block-start: var(--s-4);
      border-block-start: 1px solid var(--line);
      color: var(--muted);
      font-size: var(--fs-12);
    }
    .time {
      display: inline-flex;
      gap: var(--s-2);
    }
    .time time {
      color: var(--ink-2);
      font-variant-numeric: tabular-nums;
    }
    .end {
      display: inline-flex;
      gap: var(--s-4);
      margin-inline-start: auto;
    }
    .end a {
      display: inline-flex;
      align-items: center;
      gap: var(--s-1);
      color: var(--ink-2);
    }
    .end a:hover {
      color: var(--ink);
    }
    .lang:lang(ur) {
      font-family: var(--font-urdu);
    }
    .lang:lang(en) {
      font-family: var(--font-mono);
    }
    @media (max-width: 860px) {
      .grid {
        grid-template-columns: repeat(3, minmax(0, 1fr));
      }
      .id {
        grid-column: 1 / -1;
      }
    }
    @media (max-width: 480px) {
      .grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
      .end {
        margin-inline-start: 0;
      }
    }
  `,
})
export class Footer {
  protected readonly i18n = inject(I18n);
  protected readonly t = this.i18n.select(LAYOUT_COPY);
  protected readonly social = SITE.social;
  protected readonly available = SITE.availableForWork;
  protected readonly year = new Date().getFullYear();
  protected readonly time = signal('');
  protected readonly timeIso = signal('');

  constructor() {
    const destroyRef = inject(DestroyRef);
    // Local time is browser-only: a prerendered timestamp would be wrong for every visitor.
    afterNextRender(() => {
      const fmt = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: SITE.timeZone });
      const tick = () => {
        const now = new Date();
        this.time.set(fmt.format(now));
        this.timeIso.set(now.toISOString());
      };
      tick();
      const id = setInterval(tick, 30_000);
      destroyRef.onDestroy(() => clearInterval(id));
    });
  }

  protected toTop(e: Event): void {
    e.preventDefault();
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
    document.getElementById('main')?.focus({ preventScroll: true });
  }
}
