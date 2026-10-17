import { ChangeDetectionStrategy, Component, DestroyRef, ElementRef, afterNextRender, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { phosphorCookie, phosphorX } from '@ng-icons/phosphor-icons/regular';
import { LAYOUT_COPY } from './layout.copy';

const KEY = 'mh:cookie-notice';

/**
 * Cookie notice, laid out like the befiler.com banner (icon, title, text with policy links, actions, close)
 * in this site's glass style. The site sets no cookies, so this informs rather than asks: one "Got it" and a
 * link to the policy, no fake Accept / Decline. Closing it stores one local-storage flag (named in /cookies).
 * Browser-only: nothing is prerendered, so it never flashes for visitors who already closed it.
 */
@Component({
  selector: 'mh-cookie-notice',
  imports: [RouterLink, NgIcon],
  viewProviders: [provideIcons({ phosphorCookie, phosphorX })],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (shown()) {
      <section
        class="notice"
        [class.out]="leaving()"
        aria-labelledby="cookie-title"
        aria-describedby="cookie-text"
        (keydown.escape)="dismiss()"
      >
        <span class="icon-tile" aria-hidden="true"><ng-icon name="phosphorCookie" /></span>
        <div class="body">
          <h2 id="cookie-title">{{ t.title }}</h2>
          <p id="cookie-text">
            {{ t.text }} <a class="link" routerLink="/privacy">{{ t.privacy }}</a> and
            <a class="link" routerLink="/cookies">{{ t.cookies }}</a>.
          </p>
          <div class="actions">
            <button type="button" class="btn btn-solid btn-sm" (click)="dismiss()">{{ t.ok }}</button>
            <a class="btn btn--quiet btn-sm" routerLink="/cookies" (click)="dismiss()">{{ t.more }}</a>
          </div>
        </div>
        <button type="button" class="icon-btn close" [attr.aria-label]="t.close" (click)="dismiss()">
          <ng-icon name="phosphorX" aria-hidden="true" />
        </button>
      </section>
    }
  `,
  styles: `
    :host {
      position: fixed;
      left: var(--gutter);
      right: var(--gutter);
      bottom: 16px;
      z-index: var(--z-overlay);
      display: flex;
      justify-content: center;
      pointer-events: none;
    }
    .notice {
      pointer-events: auto;
      position: relative;
      display: flex;
      gap: 14px;
      width: min(560px, 100%);
      padding: 16px 16px 16px 16px;
      border-radius: var(--r-card);
      background: color-mix(in oklab, var(--surface) 82%, transparent);
      -webkit-backdrop-filter: blur(18px) saturate(1.6);
      backdrop-filter: blur(18px) saturate(1.6);
      border: 1px solid var(--glass-edge);
      box-shadow:
        inset 0 1px 0 var(--glass-hi),
        var(--shadow-lg);
    }
    @media (prefers-reduced-transparency: reduce) {
      .notice {
        background: var(--surface);
        backdrop-filter: none;
        -webkit-backdrop-filter: none;
      }
    }
    @media (prefers-reduced-motion: no-preference) {
      .notice {
        animation: up 0.6s var(--ease) both;
      }
      .notice.out {
        animation: down 0.3s var(--ease) both;
      }
    }
    @keyframes up {
      from {
        opacity: 0;
        transform: translateY(16px);
      }
    }
    @keyframes down {
      to {
        opacity: 0;
        transform: translateY(12px);
      }
    }
    .icon-tile {
      width: 38px;
      height: 38px;
      border-radius: 999px;
    }
    .icon-tile ng-icon {
      font-size: 19px;
    }
    .body {
      min-width: 0;
      padding-right: 28px;
    }
    h2 {
      font-size: 14.5px;
      letter-spacing: -0.01em;
      line-height: 1.3;
      margin: 2px 0 4px;
    }
    p {
      font-size: 13.5px;
      line-height: 1.55;
      color: var(--ink-2);
    }
    .actions {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin-top: 12px;
    }
    .actions .btn {
      height: 36px;
      font-size: 13.5px;
    }
    .close {
      position: absolute;
      top: 10px;
      right: 10px;
      width: 32px;
      height: 32px;
      border-color: transparent;
      background: transparent;
      color: var(--muted);
    }
    .close:hover {
      color: var(--ink);
      background: var(--surface-2);
    }
    @media (max-width: 480px) {
      :host {
        bottom: 10px;
      }
      .icon-tile {
        display: none;
      }
      /* Touch: same look, bigger hit areas (the close button is borderless). */
      .close {
        top: 4px;
        right: 4px;
        width: 44px;
        height: 44px;
      }
      .actions .btn {
        height: 40px;
      }
    }
  `,
})
export class CookieNotice {
  protected readonly t = LAYOUT_COPY.cookie;
  protected readonly shown = signal(false);
  protected readonly leaving = signal(false);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  constructor() {
    const destroyRef = inject(DestroyRef);
    let timer: ReturnType<typeof setTimeout> | undefined;
    destroyRef.onDestroy(() => clearTimeout(timer));
    afterNextRender(() => {
      if (read()) return;
      // Let the hero land first; the notice is secondary.
      timer = setTimeout(() => this.shown.set(true), 1400);
    });
  }

  protected dismiss(): void {
    if (this.leaving()) return;
    write();
    // Keyboard users would otherwise lose focus with the removed button; hand it back to the page.
    if (this.host.nativeElement.contains(document.activeElement)) document.getElementById('main')?.focus({ preventScroll: true });
    this.leaving.set(true);
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    setTimeout(() => this.shown.set(false), reduce ? 0 : 280);
  }
}

function read(): boolean {
  try {
    return localStorage.getItem(KEY) === 'closed';
  } catch {
    return false;
  }
}

function write(): void {
  try {
    localStorage.setItem(KEY, 'closed');
  } catch {
    // Storage blocked: the notice simply comes back next visit.
  }
}
