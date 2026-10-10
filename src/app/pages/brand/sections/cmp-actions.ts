import { ChangeDetectionStrategy, Component, ElementRef, signal, viewChildren } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  phosphorArrowRight,
  phosphorArrowUp,
  phosphorArrowUpRight,
  phosphorCheck,
  phosphorCopy,
  phosphorGithubLogo,
  phosphorList,
  phosphorShieldCheck,
} from '@ng-icons/phosphor-icons/regular';
import { COPY } from '../brand.copy';
import { copyText } from '../brand.util';
import { Spec } from './spec';

const STACK = ['Angular', 'NestJS', 'PostgreSQL', 'Flutter', 'Firebase'];
const TABS = [
  { id: 'use', label: 'Use', body: 'Tabs switch views of the same thing. Two to four labels, one word each.' },
  { id: 'keys', label: 'Keys', body: 'Arrow keys move between tabs, Home and End jump to the ends. Only the active tab is in the tab order.' },
  { id: 'aria', label: 'ARIA', body: 'role="tablist", role="tab" with aria-selected and aria-controls, role="tabpanel" with aria-labelledby.' },
];
const CMD = 'git clone https://github.com/mhfrough/quorum';
const CODE = `.card {
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: var(--r-card);
  padding: 26px;
}`;

/** Components, part 1: actions, chips and labels, commands and code. Server-rendered, all interactive. */
@Component({
  selector: 'mh-brand-cmp-actions',
  imports: [Spec, NgIcon, RouterLink],
  viewProviders: [
    provideIcons({
      phosphorArrowRight,
      phosphorArrowUpRight,
      phosphorArrowUp,
      phosphorGithubLogo,
      phosphorList,
      phosphorCopy,
      phosphorCheck,
      phosphorShieldCheck,
    }),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="bp-subhead">
      <h3 class="h3">{{ g.actions.title }}</h3>
      <p>{{ g.actions.sub }}</p>
    </div>
    <div class="bp-grid">
      <mh-spec name="Buttons" cls=".btn .btn-solid | .btn-ghost | .btn--quiet" class="span-all">
        <a class="btn btn-solid" routerLink="/work">View work<ng-icon name="phosphorArrowRight" aria-hidden="true" /></a>
        <a class="btn btn-ghost" routerLink="/contact">Get in touch</a>
        <button type="button" class="btn btn--quiet">Cancel</button>
        <a class="btn btn-ghost" href="https://github.com/mhfrough" target="_blank" rel="noopener"><ng-icon name="phosphorGithubLogo" aria-hidden="true" />GitHub</a>
      </mh-spec>
      <mh-spec name="Small and disabled" cls=".btn-sm | [disabled]">
        <a class="btn btn-solid btn-sm" routerLink="/hire">Hire me</a>
        <button type="button" class="btn btn-ghost btn-sm">Ghost</button>
        <button type="button" class="btn btn-solid" disabled>Send message</button>
      </mh-spec>
      <mh-spec name="Icon buttons" cls=".icon-btn + aria-label">
        <button type="button" class="icon-btn" aria-label="Open menu"><ng-icon name="phosphorList" aria-hidden="true" /></button>
        <a class="icon-btn" href="https://github.com/mhfrough" target="_blank" rel="noopener" aria-label="GitHub profile"><ng-icon name="phosphorGithubLogo" aria-hidden="true" /></a>
        <button type="button" class="icon-btn" aria-label="Back to top"><ng-icon name="phosphorArrowUp" aria-hidden="true" /></button>
      </mh-spec>
      <mh-spec name="Pill link" cls=".pill-link > b" class="span-all">
        <a class="pill-link" routerLink="/work/quorum"><b>7 agents</b>A skill for Claude Code<ng-icon name="phosphorArrowRight" aria-hidden="true" /></a>
        <p class="note">Press any button: it drops 1px and scales to 0.98 while held.</p>
      </mh-spec>
    </div>

    <div class="bp-subhead">
      <h3 class="h3">{{ g.pills.title }}</h3>
      <p>{{ g.pills.sub }}</p>
    </div>
    <div class="bp-grid">
      <mh-spec name="Chips" cls=".chip[aria-pressed]" class="span-all">
        <div class="row" role="group" aria-label="Stack filter">
          @for (s of stack; track s) {
            <button type="button" class="chip" [attr.aria-pressed]="picked().includes(s)" (click)="pick(s)">{{ s }}</button>
          }
        </div>
      </mh-spec>
      <mh-spec name="Badges" cls=".badges > .badge">
        <ul class="badges" role="list">
          <li class="badge"><ng-icon name="phosphorShieldCheck" aria-hidden="true" />WCAG 2.1 AA</li>
          <li class="badge">Open source</li>
          <li class="badge">MIT</li>
        </ul>
      </mh-spec>
      <mh-spec name="Tags" cls=".tag-list > .tag">
        <ul class="tag-list" role="list">
          <li class="tag">angular&#64;21</li>
          <li class="tag">nestjs</li>
          <li class="tag">v1.0.0</li>
        </ul>
      </mh-spec>
      <mh-spec name="Segmented tabs" cls=".seg [role=tablist]" layout="col" class="span-all">
        <div class="seg" role="tablist" aria-label="Tabs guide" (keydown)="onKey($event)">
          @for (tb of tabs; track tb.id) {
            <button
              #tabEl
              type="button"
              role="tab"
              [id]="'seg-tab-' + tb.id"
              [attr.aria-selected]="tab() === tb.id"
              [attr.aria-controls]="'seg-panel-' + tb.id"
              [attr.tabindex]="tab() === tb.id ? 0 : -1"
              (click)="tab.set(tb.id)"
            >
              {{ tb.label }}
            </button>
          }
        </div>
        @for (tb of tabs; track tb.id) {
          <p class="panel-text" role="tabpanel" [id]="'seg-panel-' + tb.id" [attr.aria-labelledby]="'seg-tab-' + tb.id" [hidden]="tab() !== tb.id">
            {{ tb.body }}
          </p>
        }
      </mh-spec>
    </div>

    <div class="bp-subhead">
      <h3 class="h3">{{ g.code.title }}</h3>
      <p>{{ g.code.sub }}</p>
    </div>
    <div class="bp-grid">
      <mh-spec name="Command bar" cls=".cmd > .prompt + code + .copy" class="span-all">
        <div class="cmd">
          <span class="prompt" aria-hidden="true">$</span>
          <code>{{ cmd }}</code>
          <button type="button" class="copy" (click)="copy('cmd', cmd)" aria-label="Copy command">
            <ng-icon [name]="done() === 'cmd' ? 'phosphorCheck' : 'phosphorCopy'" aria-hidden="true" />{{ done() === 'cmd' ? 'Copied' : 'Copy' }}
          </button>
        </div>
      </mh-spec>
      <mh-spec name="Code block" cls=".code > pre + .copy" layout="col" class="span-all">
        <div class="code">
          <pre>{{ code }}</pre>
          <button type="button" class="copy" (click)="copy('code', code)" aria-label="Copy code">
            <ng-icon [name]="done() === 'code' ? 'phosphorCheck' : 'phosphorCopy'" aria-hidden="true" />{{ done() === 'code' ? 'Copied' : 'Copy' }}
          </button>
        </div>
      </mh-spec>
    </div>
    <p class="sr-only" aria-live="polite">{{ done() ? 'Copied to clipboard' : '' }}</p>
  `,
  styles: `
    .row {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }
    .note {
      flex-basis: 100%;
      font-size: 13.5px;
      color: var(--muted);
    }
    .seg {
      align-self: flex-start;
      max-width: 100%;
    }
    .panel-text {
      font-size: 14.5px;
      color: var(--ink-2);
      max-width: 60ch;
      min-height: 3.2em;
    }
    .cmd {
      flex: 1 1 100%;
      min-width: 0;
      max-width: 544px;
    }
    .code pre {
      padding-right: 96px;
    }
    .code .copy {
      position: absolute;
      top: 12px;
      right: 12px;
    }
  `,
})
export class BrandCmpActions {
  protected readonly g = COPY.components.groups;
  protected readonly stack = STACK;
  protected readonly tabs = TABS;
  protected readonly cmd = CMD;
  protected readonly code = CODE;
  protected readonly picked = signal<string[]>(['Angular', 'NestJS']);
  protected readonly tab = signal(TABS[0].id);
  protected readonly done = signal<'cmd' | 'code' | null>(null);
  private readonly tabEls = viewChildren<ElementRef<HTMLButtonElement>>('tabEl');
  private timer: ReturnType<typeof setTimeout> | undefined;

  protected pick(s: string): void {
    this.picked.update((p) => (p.includes(s) ? p.filter((x) => x !== s) : [...p, s]));
  }

  protected onKey(e: KeyboardEvent): void {
    const i = TABS.findIndex((t) => t.id === this.tab());
    const n = TABS.length;
    const keys: Record<string, number> = { ArrowRight: (i + 1) % n, ArrowLeft: (i - 1 + n) % n, Home: 0, End: n - 1 };
    const next = keys[e.key];
    if (next === undefined) return;
    e.preventDefault();
    this.tab.set(TABS[next].id);
    this.tabEls()[next]?.nativeElement.focus();
  }

  protected async copy(which: 'cmd' | 'code', text: string): Promise<void> {
    if (!(await copyText(text))) return;
    this.done.set(which);
    clearTimeout(this.timer);
    this.timer = setTimeout(() => this.done.set(null), 1600);
  }
}
