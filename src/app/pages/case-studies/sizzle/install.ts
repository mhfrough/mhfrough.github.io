import { ChangeDetectionStrategy, Component, DestroyRef, afterNextRender, computed, inject, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { phosphorCheck, phosphorCopy } from '@ng-icons/phosphor-icons/regular';
import { COPY } from './sizzle.copy';

type Agent = 'any' | 'claude' | 'cursor';
type Os = 'unix' | 'win';

// The install lines, exactly as the README and the Sizzle page print them.
const CMD: Record<Agent, Record<Os, string>> = {
  any: { unix: 'npx skills add mhfrough/sizzle', win: 'npx skills add mhfrough/sizzle' },
  claude: {
    unix: 'curl -fsSL https://mhfrough.github.io/sizzle/install.sh | sh',
    win: 'irm https://mhfrough.github.io/sizzle/install.ps1 | iex',
  },
  cursor: {
    unix: 'curl -fsSL https://mhfrough.github.io/sizzle/install.sh | sh -s -- cursor',
    win: "$env:SIZZLE_AGENT='cursor'; irm https://mhfrough.github.io/sizzle/install.ps1 | iex",
  },
};

/**
 * Sizzle's install line: pick the agent (any agent through the skills tool, Claude Code or Cursor), then the OS for
 * the two installers. The OS is guessed after hydration (macOS / Linux is the prerendered default). Copy button with
 * a polite live confirmation.
 */
@Component({
  selector: 'mh-sz-install',
  imports: [NgIcon],
  viewProviders: [provideIcons({ phosphorCopy, phosphorCheck })],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="row">
      <div class="seg" role="group" [attr.aria-label]="t.tabs">
        @for (a of t.agents; track a.id) {
          <button type="button" [attr.aria-pressed]="agent() === a.id" (click)="agent.set(a.id)">{{ a.label }}</button>
        }
      </div>
      @if (agent() !== 'any') {
        <div class="seg" role="group" [attr.aria-label]="t.os">
          <button type="button" [attr.aria-pressed]="os() === 'unix'" (click)="os.set('unix')">{{ t.unix }}</button>
          <button type="button" [attr.aria-pressed]="os() === 'win'" (click)="os.set('win')">{{ t.win }}</button>
        </div>
      }
    </div>
    <div class="cmd">
      <span class="prompt" aria-hidden="true">{{ agent() !== 'any' && os() === 'win' ? 'PS>' : '$' }}</span>
      <code>{{ command() }}</code>
      <button type="button" class="cp" [attr.aria-label]="t.copy" (click)="copy()">
        <ng-icon [name]="copied() ? 'phosphorCheck' : 'phosphorCopy'" aria-hidden="true" />
      </button>
    </div>
    <p class="note">{{ note() }}</p>
    <p class="sr-only" aria-live="polite">{{ copied() ? t.copied : '' }}</p>
  `,
  styles: `
    :host {
      display: grid;
      grid-template-columns: minmax(0, 1fr);
      gap: 12px;
    }
    .row {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
    .seg {
      max-width: 100%;
      overflow-x: auto;
      scrollbar-width: none;
    }
    .seg button {
      height: 36px;
      white-space: nowrap;
    }
    .cmd {
      max-width: none;
      min-height: 50px;
      padding: 6px 6px 6px 18px;
      font-size: 13px;
    }
    .cp {
      display: grid;
      place-items: center;
      flex-shrink: 0;
      width: 40px;
      height: 40px;
      border-radius: 999px;
      background: color-mix(in oklab, var(--solid-ink) 12%, transparent);
      transition: background var(--t-base) var(--ease), transform var(--t-fast) var(--ease);
    }
    .cp:hover {
      background: color-mix(in oklab, var(--solid-ink) 20%, transparent);
    }
    .cp:active {
      transform: scale(0.94);
    }
    .cp ng-icon {
      font-size: 16px;
    }
    .note {
      margin: 0;
      font-size: 13.5px;
      color: var(--ink-2);
    }
    @media (max-width: 560px) {
      .cmd {
        border-radius: var(--r-inner);
        padding-block: 8px;
      }
      .cmd code {
        white-space: normal;
        overflow-wrap: anywhere;
        line-height: 1.5;
      }
    }
  `,
})
export class SizzleInstall {
  protected readonly t = COPY.install;
  protected readonly agent = signal<Agent>('any');
  protected readonly os = signal<Os>('unix');
  protected readonly copied = signal(false);
  protected readonly command = computed(() => CMD[this.agent()][this.os()]);
  protected readonly note = computed(() => this.t.agents.find((a) => a.id === this.agent())?.note ?? '');
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
