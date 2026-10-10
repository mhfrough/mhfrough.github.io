import { ChangeDetectionStrategy, Component, ElementRef, inject, signal, viewChild } from '@angular/core';
import { NavigationStart, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { phosphorList, phosphorX } from '@ng-icons/phosphor-icons/regular';
import { I18n, LocPipe } from '../core/i18n/i18n.service';
import { Logo } from '../shared/ui/logo';
import { LAYOUT_COPY } from './layout.copy';

/**
 * Floating nav: a 56px bar that hovers over content with a small radius and a glass fill
 * (solid fallback for no backdrop-filter / reduced transparency). One line at every width.
 * Below 760px the links fold into a disclosure panel anchored to the bar.
 */
@Component({
  selector: 'mh-nav',
  imports: [RouterLink, RouterLinkActive, NgIcon, Logo, LocPipe],
  viewProviders: [provideIcons({ phosphorList, phosphorX })],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '(document:keydown.escape)': 'close()' },
  template: `
    <header class="nav" role="banner">
      <nav class="bar" [attr.aria-label]="'Primary'">
        <a class="home" [routerLink]="'/' | loc" [attr.aria-label]="t().homeLabel">
          <mh-logo [size]="28" [wordmark]="true" />
        </a>

        <ul class="links" role="list">
          @for (l of links; track l.path) {
            <li>
              <a [routerLink]="l.path | loc" routerLinkActive="is-active" ariaCurrentWhenActive="page">{{ t().nav[l.key] }}</a>
            </li>
          }
        </ul>

        <div class="end">
          <a class="lang" [routerLink]="i18n.alternateHref()" [attr.hreflang]="i18n.other()" [attr.lang]="i18n.other()" [attr.aria-label]="t().langSwitchLabel">{{ t().langSwitch }}</a>
          <a class="btn btn--primary btn--sm cta" [routerLink]="'/hire' | loc">{{ t().hire }}</a>
          <button
            #toggle
            type="button"
            class="icon-btn menu-btn"
            [attr.aria-expanded]="open()"
            aria-controls="mobile-menu"
            [attr.aria-label]="open() ? t().close : t().menu"
            (click)="open.set(!open())"
          >
            <ng-icon [name]="open() ? 'phosphorX' : 'phosphorList'" aria-hidden="true" />
          </button>
        </div>
      </nav>

      <div id="mobile-menu" class="panel" [hidden]="!open()">
        <ul role="list">
          @for (l of links; track l.path) {
            <li><a [routerLink]="l.path | loc" routerLinkActive="is-active" ariaCurrentWhenActive="page">{{ t().nav[l.key] }}</a></li>
          }
          <li><a [routerLink]="'/hire' | loc">{{ t().hire }}</a></li>
        </ul>
      </div>
    </header>
  `,
  styles: `
    :host {
      position: sticky;
      inset-block-start: var(--nav-top);
      z-index: var(--z-nav);
      display: block;
      padding-inline: var(--gutter);
      margin-block-start: var(--nav-top);
      pointer-events: none;
    }
    .nav {
      position: relative;
      max-inline-size: 960px;
      margin-inline: auto;
      pointer-events: auto;
    }
    .bar {
      display: flex;
      align-items: center;
      gap: var(--s-5);
      block-size: var(--nav-h);
      padding-inline: var(--s-4) var(--s-2);
      border-radius: var(--r-2);
      border: 1px solid color-mix(in oklab, var(--line-strong) 80%, transparent);
      background: color-mix(in oklab, var(--bg-raise) 72%, transparent);
      -webkit-backdrop-filter: blur(16px) saturate(1.4);
      backdrop-filter: blur(16px) saturate(1.4);
      box-shadow:
        inset 0 1px 0 color-mix(in oklab, var(--ink) 6%, transparent),
        0 12px 32px -16px rgb(0 0 0 / 0.7);
    }
    @supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))) {
      .bar {
        background: var(--bg-raise);
      }
    }
    @media (prefers-reduced-transparency: reduce) {
      .bar {
        background: var(--bg-raise);
        backdrop-filter: none;
        -webkit-backdrop-filter: none;
      }
    }
    .home {
      display: inline-flex;
      border-radius: var(--r-1);
    }
    .links {
      display: flex;
      gap: var(--s-1);
      margin-inline-start: auto;
    }
    .links a {
      display: inline-flex;
      align-items: center;
      block-size: 36px;
      padding-inline: var(--s-3);
      border-radius: var(--r-1);
      font-size: var(--fs-14);
      color: var(--ink-2);
      transition:
        color var(--t-fast) var(--ease),
        background-color var(--t-fast) var(--ease);
    }
    .links a:hover {
      color: var(--ink);
    }
    .links a.is-active {
      color: var(--ink);
      background: var(--surface-2);
    }
    .end {
      display: flex;
      align-items: center;
      gap: var(--s-2);
    }
    .lang {
      display: inline-flex;
      align-items: center;
      block-size: 36px;
      padding-inline: var(--s-3);
      border-radius: var(--r-1);
      font-size: var(--fs-14);
      color: var(--ink-2);
    }
    .lang:hover {
      color: var(--ink);
    }
    .lang:lang(ur) {
      font-family: var(--font-urdu);
      font-size: var(--fs-16);
      line-height: 1;
      padding-block-end: 4px;
    }
    .lang:lang(en) {
      font-family: var(--font-sans);
    }
    .menu-btn {
      display: none;
    }
    .panel {
      position: absolute;
      inset-inline: 0;
      inset-block-start: calc(100% + var(--s-2));
      padding: var(--s-2);
      border-radius: var(--r-2);
      border: 1px solid var(--line-strong);
      background: var(--bg-raise);
      box-shadow: 0 24px 48px -24px rgb(0 0 0 / 0.8);
    }
    .panel ul {
      display: grid;
      gap: 2px;
      list-style: none;
      margin: 0;
      padding: 0;
    }
    .panel a {
      display: flex;
      align-items: center;
      block-size: 48px;
      padding-inline: var(--s-4);
      border-radius: var(--r-1);
      font-size: var(--fs-18);
    }
    .panel a:hover,
    .panel a.is-active {
      background: var(--surface-2);
    }
    @media (max-width: 760px) {
      .links,
      .cta {
        display: none;
      }
      .end {
        margin-inline-start: auto;
      }
      .menu-btn {
        display: inline-grid;
      }
    }
    @media (min-width: 761px) {
      .panel {
        display: none;
      }
    }
  `,
})
export class Nav {
  protected readonly i18n = inject(I18n);
  protected readonly t = this.i18n.select(LAYOUT_COPY);
  protected readonly open = signal(false);
  private readonly toggle = viewChild<ElementRef<HTMLButtonElement>>('toggle');
  protected readonly links = [
    { key: 'work', path: '/work' },
    { key: 'brand', path: '/brand' },
    { key: 'contact', path: '/contact' },
  ] as const;

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
