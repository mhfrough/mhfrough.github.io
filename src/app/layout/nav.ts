import { ChangeDetectionStrategy, Component, ElementRef, inject, signal, viewChild } from '@angular/core';
import { NavigationStart, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { phosphorGithubLogo, phosphorList, phosphorX } from '@ng-icons/phosphor-icons/regular';
import { SITE } from '../core/site.config';
import { Logo } from '../shared/ui/logo';
import { LAYOUT_COPY } from './layout.copy';

/**
 * Floating glass nav split in two: an identity pill (round ء tile + handle) on the left and a pill with the links and
 * actions on the right, with the page showing through between them. Max-width matches .wrap.
 * Active link gets a dot underneath. Below 820px the links fold into a dropdown card.
 */
@Component({
  selector: 'mh-nav',
  imports: [RouterLink, RouterLinkActive, NgIcon, Logo],
  viewProviders: [provideIcons({ phosphorList, phosphorX, phosphorGithubLogo })],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '(document:keydown.escape)': 'close()' },
  template: `
    <header class="nav">
      <nav class="nav-inner" aria-label="Primary">
        <a class="pill brand" routerLink="/" [attr.aria-label]="t.homeLabel">
          <span class="brand-mark"><mh-logo [size]="22" /></span>
          <span class="brand-text" translate="no">{{ t.brand }}</span>
        </a>

        <div class="pill actions">
          <ul class="nav-links" role="list">
            @for (l of links; track l.path) {
              <li>
                <a [routerLink]="l.path" routerLinkActive="active" ariaCurrentWhenActive="page">{{ l.label }}</a>
              </li>
            }
          </ul>
          <span class="sep" aria-hidden="true"></span>
          <a class="icon-btn gh" [href]="github" target="_blank" rel="me noopener" aria-label="GitHub profile">
            <ng-icon name="phosphorGithubLogo" aria-hidden="true" />
          </a>
          <a class="btn btn-solid btn-sm cta" routerLink="/hire">{{ t.hire }}</a>
          <button
            #toggle
            type="button"
            class="icon-btn menu-btn"
            [attr.aria-expanded]="open()"
            aria-controls="nav-menu"
            [attr.aria-label]="open() ? t.close : t.menu"
            (click)="open.set(!open())"
          >
            <ng-icon [name]="open() ? 'phosphorX' : 'phosphorList'" aria-hidden="true" />
          </button>
        </div>
      </nav>

      <div id="nav-menu" class="menu" [hidden]="!open()">
        <ul role="list">
          @for (l of links; track l.path) {
            <li><a [routerLink]="l.path" routerLinkActive="active" ariaCurrentWhenActive="page">{{ l.label }}</a></li>
          }
          <li><a routerLink="/hire" routerLinkActive="active">{{ t.hire }}</a></li>
        </ul>
      </div>
    </header>
  `,
  styles: `
    :host {
      position: sticky;
      top: var(--nav-top);
      z-index: var(--z-nav);
      display: block;
      padding: var(--nav-top) var(--gutter) 0;
      pointer-events: none;
    }
    .nav {
      position: relative;
      max-width: calc(var(--max) - 48px);
      margin: 0 auto;
    }
    /* Two separate glass pills: identity on the left, navigation and actions on the right. */
    .nav-inner {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
    }
    .pill {
      pointer-events: auto;
      height: var(--nav-h);
      border-radius: 999px;
      display: flex;
      align-items: center;
      background: color-mix(in oklab, var(--surface) 62%, transparent);
      -webkit-backdrop-filter: blur(18px) saturate(1.6);
      backdrop-filter: blur(18px) saturate(1.6);
      border: 1px solid var(--glass-edge);
      box-shadow:
        inset 0 1px 0 var(--glass-hi),
        0 8px 24px -12px rgb(0 0 0 / 0.5);
    }
    @supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))) {
      .pill {
        background: var(--surface);
      }
    }
    @media (prefers-reduced-transparency: reduce) {
      .pill {
        background: var(--surface);
        backdrop-filter: none;
        -webkit-backdrop-filter: none;
      }
    }
    .brand {
      gap: 10px;
      padding: 0 16px 0 8px;
      font-weight: 600;
      font-size: 15px;
      letter-spacing: -0.02em;
      white-space: nowrap;
      transition: border-color var(--t-base) var(--ease);
    }
    .brand .brand-mark {
      --tile: 36px;
      border-radius: 50%;
    }
    .brand:hover {
      border-color: var(--line-strong);
    }
    .actions {
      gap: 6px;
      padding: 0 7px 0 22px;
    }
    .nav-links {
      display: flex;
      align-items: center;
      gap: 22px;
      font-size: 14px;
      color: var(--ink-2);
    }
    .nav-links a {
      position: relative;
      display: inline-flex;
      align-items: center;
      min-height: 36px;
      transition: color var(--t-fast) var(--ease);
    }
    .nav-links a:hover,
    .nav-links a.active {
      color: var(--ink);
    }
    .nav-links a::after {
      content: '';
      position: absolute;
      left: 50%;
      bottom: 1px;
      width: 4px;
      height: 4px;
      border-radius: 50%;
      background: currentColor;
      transform: translateX(-50%) scale(0);
      transition: transform var(--t-base) var(--ease);
    }
    .nav-links a.active::after {
      transform: translateX(-50%) scale(1);
    }
    .sep {
      width: 1px;
      height: 18px;
      margin: 0 10px 0 16px;
      background: var(--line-strong);
    }
    .icon-btn {
      width: 36px;
      height: 36px;
      border-color: transparent;
      background: transparent;
    }
    .icon-btn:hover {
      background: var(--surface-2);
    }
    .cta {
      height: 36px;
      padding-inline: 16px;
      font-size: 13.5px;
    }
    .menu-btn {
      display: none;
    }
    .menu {
      pointer-events: auto;
      position: absolute;
      right: 0;
      width: min(280px, 100%);
      top: calc(100% + 8px);
      padding: 6px;
      border-radius: var(--r-card);
      border: 1px solid var(--line);
      background: var(--surface);
      box-shadow: var(--shadow-lg);
    }
    @media (prefers-reduced-motion: no-preference) {
      .menu:not([hidden]) {
        animation: drop 0.22s var(--ease);
      }
    }
    @keyframes drop {
      from {
        opacity: 0;
        transform: translateY(-4px) scale(0.98);
      }
    }
    .menu ul {
      display: grid;
      gap: 2px;
      list-style: none;
      margin: 0;
      padding: 0;
    }
    .menu a {
      display: flex;
      align-items: center;
      min-height: 46px;
      padding: 0 16px;
      border-radius: var(--r-inner);
      font-size: 15px;
      color: var(--ink-2);
    }
    .menu a:hover,
    .menu a.active {
      background: var(--surface-2);
      color: var(--ink);
    }
    @media (max-width: 820px) {
      .nav-links,
      .sep {
        display: none;
      }
      .actions {
        padding-left: 7px;
      }
      .menu-btn {
        display: inline-grid;
      }
      /* Touch sizes: both buttons are borderless, so 44px fills the 52px pill without looking heavier. */
      .actions {
        gap: 2px;
        padding: 0 4px;
      }
      .icon-btn {
        width: 44px;
        height: 44px;
      }
    }
    @media (min-width: 821px) {
      .menu {
        display: none;
      }
    }
    @media (max-width: 640px) {
      .cta {
        display: none;
      }
    }
  `,
})
export class Nav {
  protected readonly t = LAYOUT_COPY;
  protected readonly github = SITE.social.github;
  protected readonly open = signal(false);
  private readonly toggle = viewChild<ElementRef<HTMLButtonElement>>('toggle');
  protected readonly links = [
    { label: LAYOUT_COPY.nav.work, path: '/work' },
    { label: LAYOUT_COPY.nav.about, path: '/about' },
    { label: LAYOUT_COPY.nav.brand, path: '/brand' },
    { label: LAYOUT_COPY.nav.contact, path: '/contact' },
  ];

  constructor() {
    inject(Router).events.subscribe((e) => {
      if (e instanceof NavigationStart) this.open.set(false);
    });
  }

  protected close(): void {
    if (!this.open()) return;
    this.open.set(false);
    this.toggle()?.nativeElement.focus();
  }
}
