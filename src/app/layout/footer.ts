import { ChangeDetectionStrategy, Component, DestroyRef, afterNextRender, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { phosphorArrowUp, phosphorDribbbleLogo, phosphorGithubLogo, phosphorLinkedinLogo } from '@ng-icons/phosphor-icons/regular';
import { SITE } from '../core/site.config';
import { Logo } from '../shared/ui/logo';
import { LAYOUT_COPY } from './layout.copy';

/**
 * Small but complete footer: identity + availability, three link groups, and a mono
 * meta row (year, Karachi local time, back to top). No big CTA, no vertical rules.
 */
@Component({
  selector: 'mh-footer',
  imports: [RouterLink, NgIcon, Logo],
  viewProviders: [provideIcons({ phosphorGithubLogo, phosphorLinkedinLogo, phosphorDribbbleLogo, phosphorArrowUp })],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <footer class="footer" role="contentinfo">
      <div class="wrap grid">
        <div class="id">
          <a routerLink="/" class="home" [attr.aria-label]="t.homeLabel"><span class="brand-mark"><mh-logo [size]="20" /></span><span class="name">Mohammad Hamza</span><span class="handle mono">@mhfrough</span></a>
          <p class="blurb">{{ t.footer.blurb }}</p>
          <a class="status" routerLink="/hire">
            <span class="status__mark" [class.is-on]="available" aria-hidden="true"></span>
            {{ available ? t.footer.available : t.footer.unavailable }}
          </a>
        </div>

        <nav class="col" [attr.aria-label]="t.footer.pages">
          <h2 class="label">{{ t.footer.pages }}</h2>
          <ul role="list">
            <li><a routerLink="/work">{{ t.nav.work }}</a></li>
            <li><a routerLink="/hire">Hire</a></li>
            <li><a routerLink="/brand">{{ t.nav.brand }}</a></li>
            <li><a routerLink="/contact">{{ t.nav.contact }}</a></li>
          </ul>
        </nav>

        <nav class="col" [attr.aria-label]="t.footer.elsewhere">
          <h2 class="label">{{ t.footer.elsewhere }}</h2>
          <ul role="list">
            <li><a [href]="social.github" rel="me noopener" target="_blank"><ng-icon name="phosphorGithubLogo" aria-hidden="true" /> GitHub</a></li>
            <li><a [href]="social.linkedin" rel="me noopener" target="_blank"><ng-icon name="phosphorLinkedinLogo" aria-hidden="true" /> LinkedIn</a></li>
            <li><a [href]="social.dribbble" rel="me noopener" target="_blank"><ng-icon name="phosphorDribbbleLogo" aria-hidden="true" /> Dribbble</a></li>
          </ul>
        </nav>

        <nav class="col" [attr.aria-label]="t.footer.legal">
          <h2 class="label">{{ t.footer.legal }}</h2>
          <ul role="list">
            <li><a routerLink="/privacy">{{ t.footer.privacy }}</a></li>
            <li><a routerLink="/terms">{{ t.footer.terms }}</a></li>
            <li><a routerLink="/cookies">{{ t.footer.cookies }}</a></li>
            <li><a routerLink="/accessibility">{{ t.footer.accessibility }}</a></li>
          </ul>
        </nav>
      </div>

      <div class="wrap meta mono">
        <span>&copy; {{ year }} Mohammad Hamza</span>
        <span class="time">
          {{ t.footer.localTime }}
          <time [attr.datetime]="timeIso()" dir="ltr">{{ time() || '--:--' }}</time>
          <span class="muted" dir="ltr">UTC+5</span>
        </span>
        <span class="end">
          <a href="#top" class="top" (click)="toTop($event)">{{ t.footer.top }} <ng-icon name="phosphorArrowUp" aria-hidden="true" /></a>
        </span>
      </div>
    </footer>
  `,
  styles: `
    .footer {
      border-top: 1px solid var(--line);
      margin-top: 40px;
      padding: 56px 0 32px;
      font-size: 14px;
    }
    .grid {
      display: grid;
      grid-template-columns: minmax(0, 1.6fr) repeat(3, minmax(0, 1fr));
      gap: 32px 24px;
    }
    .id {
      display: grid;
      gap: 14px;
      align-content: start;
      justify-items: start;
    }
    .home {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      font-weight: 600;
      letter-spacing: -0.01em;
      border-radius: 999px;
    }
    .brand-mark {
      width: 30px;
      height: 30px;
      border-radius: 9px;
      background: var(--cta);
      color: var(--cta-ink);
      display: grid;
      place-items: center;
    }
    .handle {
      color: var(--muted);
      font-weight: 400;
      font-size: 12.5px;
    }
    .blurb {
      color: var(--muted);
      max-width: 40ch;
    }
    .status {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      height: 32px;
      padding: 0 14px 0 12px;
      border-radius: 999px;
      background: var(--surface);
      border: 1px solid var(--line);
      color: var(--ink-2);
      font-size: 13px;
      font-weight: 500;
      transition: border-color var(--t-base) var(--ease);
    }
    .status:hover {
      border-color: color-mix(in oklab, var(--line) 50%, var(--ink));
    }
    .status__mark {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      border: 1px solid var(--muted);
    }
    .status__mark.is-on {
      background: var(--ink);
      border-color: var(--ink);
      box-shadow: 0 0 0 3px rgb(255 255 255 / 0.12);
    }
    .col h2 {
      font-size: 13px;
      font-weight: 500;
      color: var(--muted);
      margin-bottom: 12px;
    }
    .col ul {
      display: grid;
      gap: 8px;
    }
    .col a {
      display: inline-flex;
      align-items: center;
      gap: 8px;
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
      gap: 10px 24px;
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid var(--line);
      color: var(--muted);
      font-size: 12.5px;
    }
    .time {
      display: inline-flex;
      gap: 8px;
    }
    .time time {
      color: var(--ink-2);
      font-variant-numeric: tabular-nums;
    }
    .end {
      display: inline-flex;
      gap: 16px;
      margin-left: auto;
    }
    .end a {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      color: var(--ink-2);
    }
    .end a:hover {
      color: var(--ink);
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
        margin-left: 0;
      }
    }
  `,
})
export class Footer {
  protected readonly t = LAYOUT_COPY;
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
