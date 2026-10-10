import { ChangeDetectionStrategy, Component, DestroyRef, afterNextRender, computed, inject, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { phosphorCheck, phosphorCopy } from '@ng-icons/phosphor-icons/regular';
import { COPY, INSTALL_UNIX, INSTALL_WIN } from './quorum.copy';

type Os = 'unix' | 'win';

/**
 * Quorum's hero install line, rebuilt: detects the visitor's OS after hydration (macOS / Linux is the
 * prerendered default, as on the Quorum site), with a pill switch and a copy button.
 */
@Component({
  selector: 'mh-quorum-install',
  imports: [NgIcon],
  viewProviders: [provideIcons({ phosphorCopy, phosphorCheck })],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="switch" role="group" [attr.aria-label]="t.installTabs">
      <button type="button" [attr.aria-pressed]="os() === 'unix'" (click)="os.set('unix')">{{ t.unix }}</button>
      <button type="button" [attr.aria-pressed]="os() === 'win'" (click)="os.set('win')">{{ t.win }}</button>
    </div>
    <div class="cmd">
      <span class="prompt" aria-hidden="true">{{ os() === 'win' ? 'PS>' : '$' }}</span>
      <code>{{ command() }}</code>
      <button type="button" class="copy" [attr.aria-label]="t.copy" (click)="copy()">
        <ng-icon [name]="copied() ? 'phosphorCheck' : 'phosphorCopy'" aria-hidden="true" />
      </button>
    </div>
    <p class="sr-only" aria-live="polite">{{ copied() ? t.copied : '' }}</p>
  `,
  styles: `
    :host {
      display: grid;
      grid-template-columns: minmax(0, 1fr);
      gap: 12px;
    }
    .switch {
      justify-self: start;
      display: inline-flex;
      gap: 4px;
      padding: 4px;
      border-radius: 999px;
      background: var(--surface-2);
      border: 1px solid var(--line);
    }
    .switch button {
      block-size: 32px;
      padding-inline: 14px;
      border-radius: 999px;
      font-size: 13.5px;
      font-weight: 500;
      color: var(--muted);
      transition:
        background-color 0.25s var(--ease),
        color 0.25s var(--ease);
    }
    .switch button:hover {
      color: var(--ink);
    }
    .switch button[aria-pressed='true'] {
      background: var(--surface);
      color: var(--ink);
      box-shadow: 0 1px 2px rgb(0 0 0 / 0.3);
    }
    .cmd {
      display: flex;
      align-items: center;
      gap: 10px;
      inline-size: 100%;
      min-block-size: 48px;
      padding: 6px 6px 6px 18px;
      border-radius: 999px;
      background: var(--q-solid, var(--surface-2));
      color: var(--q-solid-ink, var(--ink));
      border: 1px solid var(--q-solid-edge, var(--line));
      font-family: var(--font-mono);
      font-size: 12.5px;
    }
    .prompt {
      opacity: 0.55;
      flex-shrink: 0;
    }
    code {
      flex: 1;
      min-inline-size: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      font-size: inherit;
    }
    .copy {
      display: grid;
      place-items: center;
      flex-shrink: 0;
      inline-size: 36px;
      block-size: 36px;
      border-radius: 999px;
      background: color-mix(in oklab, var(--q-solid-ink, var(--ink)) 12%, transparent);
      transition:
        background-color 0.25s var(--ease),
        transform 0.2s var(--ease);
    }
    .copy:hover {
      background: color-mix(in oklab, var(--q-solid-ink, var(--ink)) 20%, transparent);
    }
    .copy:active {
      transform: scale(0.94);
    }
    .copy ng-icon {
      font-size: 16px;
    }
    /* Long one-liners wrap at any character on phones (they are URLs) instead of hiding behind an ellipsis */
    @media (max-width: 520px) {
      .cmd {
        border-radius: var(--r-inner, 14px);
        padding-block: 8px;
      }
      code {
        white-space: normal;
        overflow-wrap: anywhere;
        line-height: 1.5;
      }
    }
  `,
})
export class QuorumInstall {
  protected readonly t = COPY.design;
  protected readonly os = signal<Os>('unix');
  protected readonly copied = signal(false);
  protected readonly command = computed(() => (this.os() === 'win' ? INSTALL_WIN : INSTALL_UNIX));
  private timer: ReturnType<typeof setTimeout> | undefined;

  constructor() {
    inject(DestroyRef).onDestroy(() => clearTimeout(this.timer));
    afterNextRender(() => {
      const nav = navigator as Navigator & { userAgentData?: { platform?: string } };
      const plat = nav.userAgentData?.platform || navigator.platform || navigator.userAgent || '';
      if (/\bwin/i.test(plat)) this.os.set('win');
    });
  }

  protected copy(): void {
    navigator.clipboard
      ?.writeText(this.command())
      .then(() => {
        this.copied.set(true);
        clearTimeout(this.timer);
        this.timer = setTimeout(() => this.copied.set(false), 1600);
      })
      .catch(() => undefined);
  }
}
