import { ChangeDetectionStrategy, Component, DestroyRef, afterNextRender, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { phosphorArrowUp, phosphorDribbbleLogo, phosphorGithubLogo, phosphorLinkedinLogo } from '@ng-icons/phosphor-icons/regular';
import { SITE } from '../core/site.config';
import { Logo } from '../shared/ui/logo';
import { LAYOUT_COPY } from './layout.copy';

/**
 * Short footer, two rows. Top: identity, availability (with the live blip) and social icons.
 * Bottom (mono): copyright, Karachi local time, Privacy, Sitemap and Back to top. Other legal pages link from /privacy.
 * No big CTA, no vertical rules, no link columns: the nav already lists the pages.
 */
@Component({
  selector: 'mh-footer',
  imports: [RouterLink, NgIcon, Logo],
  viewProviders: [provideIcons({ phosphorGithubLogo, phosphorLinkedinLogo, phosphorDribbbleLogo, phosphorArrowUp })],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <footer class="footer" role="contentinfo">
      <div class="wrap top">
        <a routerLink="/" class="home" [attr.aria-label]="t.homeLabel">
          <span class="brand-mark"><mh-logo [size]="18" /></span>
          <span class="name" translate="no">{{ t.brand }}</span>
        </a>
        <p class="blurb">{{ t.footer.blurb }}</p>
        <div class="right">
          <a class="status-pill" routerLink="/hire">
            <span class="blip" [class.is-on]="available" aria-hidden="true"></span>
            {{ available ? t.footer.available : t.footer.unavailable }}
          </a>
          <ul class="social" role="list">
            <li><a class="icon-btn" [href]="social.github" rel="me noopener" target="_blank" aria-label="GitHub"><ng-icon name="phosphorGithubLogo" aria-hidden="true" /></a></li>
            <li><a class="icon-btn" [href]="social.linkedin" rel="me noopener" target="_blank" aria-label="LinkedIn"><ng-icon name="phosphorLinkedinLogo" aria-hidden="true" /></a></li>
            <li><a class="icon-btn" [href]="social.dribbble" rel="me noopener" target="_blank" aria-label="Dribbble"><ng-icon name="phosphorDribbbleLogo" aria-hidden="true" /></a></li>
          </ul>
        </div>
      </div>

      <div class="wrap meta mono">
        <span>&copy; {{ year }} Mohammad Hamza</span>
        <span class="time">
          {{ t.footer.localTime }}
          <time [attr.datetime]="timeIso()" dir="ltr">{{ time() || '--:--' }}</time>
          <span class="muted" dir="ltr">UTC+5</span>
        </span>
        <span class="end">
          <a routerLink="/privacy">{{ t.footer.privacy }}</a>
          <a routerLink="/sitemap">{{ t.footer.sitemap }}</a>
          <a href="#top" (click)="toTop($event)">{{ t.footer.top }} <ng-icon name="phosphorArrowUp" aria-hidden="true" /></a>
        </span>
      </div>
    </footer>
  `,
  styles: `
    .footer {
      border-top: 1px solid var(--line);
      margin-top: 24px;
      padding: 28px 0 22px;
      font-size: 14px;
    }
    .top {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 14px 20px;
    }
    .home {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      font-weight: 600;
      letter-spacing: -0.02em;
      border-radius: 999px;
    }
    .brand-mark {
      --tile: 30px;
      border-radius: 999px;
    }
    .blurb {
      color: var(--muted);
      font-size: 13.5px;
      max-width: 52ch;
    }
    .right {
      display: flex;
      align-items: center;
      gap: 14px;
      margin-left: auto;
    }
    .social {
      display: flex;
      gap: 4px;
    }
    .social .icon-btn {
      width: 36px;
      height: 36px;
      border-color: transparent;
      background: transparent;
      color: var(--ink-2);
    }
    .social .icon-btn:hover {
      background: var(--surface);
      color: var(--ink);
    }
    .meta {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 8px 24px;
      margin-top: 22px;
      padding-top: 16px;
      border-top: 1px solid var(--line);
      color: var(--muted);
      font-size: 12px;
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
      gap: 20px;
      margin-left: auto;
    }
    .end a {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      min-height: 24px;
      color: var(--ink-2);
      transition: color var(--t-fast) var(--ease);
    }
    .end a:hover {
      color: var(--ink);
    }
    @media (max-width: 900px) {
      .blurb {
        display: none;
      }
    }
    @media (max-width: 560px) {
      .right {
        margin-left: 0;
        width: 100%;
        flex-wrap: wrap;
        justify-content: space-between;
        gap: 8px 14px;
      }
      /* Touch: the icons are borderless, so a 44px box adds hit area without changing the look. */
      .social {
        gap: 0;
        margin-right: -4px;
      }
      .social .icon-btn {
        width: 44px;
        height: 44px;
      }
      .meta {
        row-gap: 0;
      }
      .end {
        margin-left: 0;
        gap: 4px 20px;
        flex-wrap: wrap;
      }
      .end a {
        min-height: 44px;
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
