import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { phosphorArrowCounterClockwise, phosphorChatCircleDots, phosphorCheck, phosphorCopy, phosphorPaperPlaneRight, phosphorX } from '@ng-icons/phosphor-icons/regular';

/**
 * The widget's customisation screen as my own working mockup: the same fields the agent portal saves per channel
 * (heading, subheading, header and bubble colours, corner radius, font size, O2Chat branding), a live preview on a
 * sample host page, and the two ways the chat gets onto a site: the loader's script tag (with the per-platform
 * attributes for Shopify and WordPress that pass a signed-in customer's name and email) or, in an Angular host, the
 * chat mounted as a component. The text colour is picked for contrast, so no swatch can make the header
 * unreadable. Sample hosts and channel id; nothing here talks to a server.
 */
type Platform = 'site' | 'shopify' | 'wordpress';
type View = 'script' | 'angular' | 'json';

const SWATCHES = [
  { v: '#0a58ca', t: 'O2Chat blue' },
  { v: '#0a1733', t: 'Night' },
  { v: '#0f7a43', t: 'Green' },
  { v: '#6d3fd1', t: 'Violet' },
  { v: '#b4235f', t: 'Berry' },
  { v: '#f2c94c', t: 'Sun' },
];

const CHANNEL = '7f3a9c2e';
const PLATFORMS: { v: Platform; t: string }[] = [
  { v: 'site', t: 'Any site' },
  { v: 'shopify', t: 'Shopify' },
  { v: 'wordpress', t: 'WordPress' },
];

const lum = (hex: string) => {
  const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
};
/** White or ink, whichever reads better on the chosen colour (WCAG relative luminance). */
const onColour = (hex: string) => ((1.05 / (lum(hex) + 0.05)) >= (lum(hex) + 0.05) / 0.0599 ? '#ffffff' : '#111a2e');

interface Line {
  from: 'bot' | 'visitor' | 'agent';
  text: string;
}
const SEED: Line[] = [
  { from: 'bot', text: 'Hi there. Ask us anything about your order.' },
  { from: 'visitor', text: 'Do you ship abroad?' },
  { from: 'agent', text: 'We do, to 30 countries. Where to?' },
];

@Component({
  selector: 'mh-o2chat-widget',
  imports: [NgIcon],
  viewProviders: [provideIcons({ phosphorArrowCounterClockwise, phosphorChatCircleDots, phosphorCheck, phosphorCopy, phosphorPaperPlaneRight, phosphorX })],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="lab card">
      <form class="controls" (submit)="$event.preventDefault()" aria-label="Widget settings">
        <div class="head-row">
          <h3>Customise channel</h3>
          <button type="button" class="reset" aria-label="Reset the widget settings" (click)="reset()">
            <ng-icon name="phosphorArrowCounterClockwise" aria-hidden="true" />
          </button>
        </div>

        <div class="field">
          <label class="field__label" for="o2w-h">Heading</label>
          <input id="o2w-h" class="input" maxlength="32" [value]="heading()" (input)="heading.set($any($event.target).value)" />
        </div>
        <div class="field">
          <label class="field__label" for="o2w-s">Subheading</label>
          <input id="o2w-s" class="input" maxlength="48" [value]="sub()" (input)="sub.set($any($event.target).value)" />
        </div>

        <fieldset class="field">
          <legend class="field__label">Colour</legend>
          <div class="swatches">
            @for (s of swatches; track s.v) {
              <label class="sw" [style.--sw]="s.v" [title]="s.t">
                <input type="radio" name="o2w-colour" [value]="s.v" [checked]="colour() === s.v" (change)="colour.set(s.v)" />
                <span class="sr-only">{{ s.t }}</span>
              </label>
            }
            <label class="sw custom" title="Custom colour">
              <input type="color" [value]="colour()" (input)="colour.set($any($event.target).value)" aria-label="Custom colour" />
            </label>
          </div>
          <span class="field__hint mono">text {{ ink() === '#ffffff' ? 'white' : 'dark' }}, picked for contrast</span>
        </fieldset>

        <div class="two">
          <div class="field">
            <label class="field__label" for="o2w-r">Corners <span class="mono">{{ radius() }} px</span></label>
            <input id="o2w-r" type="range" min="0" max="24" step="2" [value]="radius()" (input)="radius.set(+$any($event.target).value)" />
          </div>
          <div class="field">
            <label class="field__label" for="o2w-f">Text <span class="mono">{{ size() }} px</span></label>
            <input id="o2w-f" type="range" min="13" max="16" step="1" [value]="size()" (input)="size.set(+$any($event.target).value)" />
          </div>
        </div>

        <label class="check">
          <input type="checkbox" [checked]="branding()" (change)="branding.set($any($event.target).checked)" />
          Show O2Chat branding
        </label>
      </form>

      <div class="stage" aria-label="Preview on a sample store page" role="group">
        <div class="host" aria-hidden="true">
          <div class="host-bar"><i></i><i></i><i></i><span class="mono">your-store.example</span></div>
          <div class="host-body">
            <span class="sk w60"></span><span class="sk w40"></span>
            <div class="sk-grid"><span></span><span></span><span></span></div>
          </div>
        </div>

        @if (open()) {
          <section class="wd" [style.--wd]="colour()" [style.--wd-ink]="ink()" [style.--wd-r]="radius() + 'px'" [style.font-size.px]="size()" aria-label="Chat widget preview">
            <header class="wd-head">
              <span class="wd-logo"><img src="/images/o2chat/o2chat-mark.webp" width="22" height="22" alt="" /></span>
              <div>
                <b>{{ heading() || 'Chat with us' }}</b>
                <small>{{ sub() }}</small>
              </div>
              <button type="button" class="wd-x" aria-label="Close the chat" (click)="open.set(false)"><ng-icon name="phosphorX" aria-hidden="true" /></button>
            </header>
            <ol class="wd-msgs" role="list">
              @for (l of lines(); track $index) {
                <li [class.me]="l.from === 'visitor'">{{ l.text }}</li>
              }
            </ol>
            <form class="wd-in" (submit)="$event.preventDefault(); say()">
              <label class="sr-only" for="o2w-msg">Message in the preview</label>
              <input id="o2w-msg" placeholder="Type a message" autocomplete="off" [value]="draft()" (input)="draft.set($any($event.target).value)" />
              <button type="submit" aria-label="Send in the preview" [disabled]="!draft().trim()"><ng-icon name="phosphorPaperPlaneRight" aria-hidden="true" /></button>
            </form>
            @if (branding()) {
              <p class="wd-credit">Powered by <b>O2Chat</b></p>
            }
          </section>
        }
        <button type="button" class="launcher" [style.--wd]="colour()" [style.--wd-ink]="ink()" [attr.aria-expanded]="open()" [attr.aria-label]="open() ? 'Close the chat preview' : 'Open the chat preview'" (click)="open.set(!open())">
          <ng-icon [name]="open() ? 'phosphorX' : 'phosphorChatCircleDots'" aria-hidden="true" />
        </button>
      </div>

      <div class="embed">
        <div class="embed-bar">
          <div class="seg" role="group" aria-label="Embed as">
            <button type="button" [attr.aria-pressed]="view() === 'script'" (click)="view.set('script')">Script tag</button>
            <button type="button" [attr.aria-pressed]="view() === 'angular'" (click)="view.set('angular')">Angular</button>
            <button type="button" [attr.aria-pressed]="view() === 'json'" (click)="view.set('json')">Settings</button>
          </div>
          @if (view() === 'script') {
            <label class="sr-only" for="o2w-p">Platform</label>
            <select id="o2w-p" class="select" [value]="platform()" (change)="platform.set($any($event.target).value)">
              @for (p of platforms; track p.v) {
                <option [value]="p.v" [selected]="p.v === platform()">{{ p.t }}</option>
              }
            </select>
          }
        </div>
        <div class="code">
          <button type="button" class="copy" (click)="copy()">
            <ng-icon [name]="copied() ? 'phosphorCheck' : 'phosphorCopy'" aria-hidden="true" /> {{ copied() ? 'Copied' : 'Copy' }}
          </button>
          <pre class="mono"><code>{{ code() }}</code></pre>
        </div>
        <p class="mono note">{{ caption() }}</p>
      </div>
    </div>
  `,
  styles: `
    :host {
      display: block;
    }
    .lab {
      display: grid;
      grid-template-columns: minmax(0, 340px) minmax(0, 1fr);
      gap: 20px;
      padding: 20px;
    }
    .controls {
      min-width: 0;
      display: grid;
      align-content: start;
      gap: 14px;

      .input {
        height: 44px;
        font-size: 14px;
      }
    }
    .head-row {
      display: flex;
      align-items: center;
      justify-content: space-between;

      h3 {
        font-size: 15px;
      }
    }
    .reset {
      width: 44px;
      height: 44px;
      display: grid;
      place-items: center;
      border-radius: 999px;
      border: 1px solid var(--line);
      color: var(--ink-2);
      font-size: 17px;

      &:hover {
        background: var(--surface-2);
      }
    }
    fieldset {
      border: 0;
      padding: 0;
      margin: 0;
      min-width: 0;
    }
    legend {
      padding: 0;
      margin-bottom: 6px;
    }
    .swatches {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
    }
    .sw {
      position: relative;
      width: 44px;
      height: 44px;
      display: grid;
      place-items: center;
      cursor: pointer;

      &::before {
        content: '';
        width: 30px;
        height: 30px;
        border-radius: 50%;
        background: var(--sw);
        box-shadow: inset 0 0 0 1px rgb(0 0 0 / 0.12);
        transition: transform var(--t-fast) var(--ease);
      }
      input[type='radio'] {
        position: absolute;
        inset: 0;
        opacity: 0;
        cursor: pointer;
      }
      &:has(:checked)::before {
        box-shadow: 0 0 0 2px var(--surface), 0 0 0 4px var(--sw);
      }
      &:has(:focus-visible)::before {
        outline: 2px solid var(--focus);
        outline-offset: 5px;
      }
    }
    .sw.custom {
      &::before {
        display: none;
      }
      input {
        width: 32px;
        height: 32px;
        padding: 0;
        border: 1px solid var(--line-strong);
        border-radius: 50%;
        background: conic-gradient(#f43, #fc3, #3c6, #3cf, #63f, #f3c, #f43);
        cursor: pointer;
      }
      input::-webkit-color-swatch-wrapper {
        padding: 0;
        opacity: 0;
      }
    }
    .field__label .mono {
      font-size: 12px;
      color: var(--muted);
      margin-left: 4px;
    }
    .two {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 12px;

      input[type='range'] {
        width: 100%;
        margin: 0;
        height: 28px;
        accent-color: var(--o-blue-text);
      }
    }
    .check {
      font-size: 14px;
      min-height: 44px;
    }
    .stage {
      position: relative;
      min-width: 0;
      min-height: 430px;
      border-radius: var(--r-inner);
      overflow: hidden;
      background: var(--bg);
      border: 1px solid var(--line);
    }
    .host-bar {
      display: flex;
      align-items: center;
      gap: 6px;
      height: 32px;
      padding: 0 12px;
      background: var(--surface-2);
      border-bottom: 1px solid var(--line);

      i {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: var(--line-strong);
      }
      span {
        margin-left: 10px;
        font-size: 12px;
        color: var(--muted);
      }
    }
    .host-body {
      display: grid;
      gap: 10px;
      padding: 22px;
    }
    .sk {
      height: 14px;
      border-radius: 999px;
      background: var(--line);
    }
    .w60 {
      width: 60%;
      height: 22px;
    }
    .w40 {
      width: 40%;
    }
    .sk-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 10px;
      margin-top: 8px;
      max-width: 52%;

      span {
        aspect-ratio: 1;
        border-radius: 12px;
        background: var(--surface-2);
        border: 1px solid var(--line);
      }
    }
    .wd {
      position: absolute;
      right: 16px;
      bottom: 82px;
      width: min(300px, calc(100% - 32px));
      display: grid;
      grid-template-columns: minmax(0, 1fr);
      border-radius: var(--wd-r);
      overflow: hidden;
      background: var(--surface);
      box-shadow: var(--shadow-lg);
      border: 1px solid var(--line);
      line-height: 1.4;
    }
    .wd-head {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 12px 10px 12px 14px;
      background: var(--wd);
      color: var(--wd-ink);

      div {
        flex: 1;
        min-width: 0;
        display: grid;
      }
      b {
        font-size: 1em;
      }
      small {
        font-size: max(12px, 0.8em);
        opacity: 0.85;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }
    .wd-logo {
      width: 32px;
      height: 32px;
      flex-shrink: 0;
      display: grid;
      place-items: center;
      border-radius: 50%;
      background: #fff;
    }
    .wd-x {
      width: 36px;
      height: 36px;
      display: grid;
      place-items: center;
      border-radius: 50%;
      color: inherit;
      font-size: 16px;
    }
    .wd-msgs {
      display: flex;
      flex-direction: column;
      gap: 6px;
      height: 170px;
      overflow-y: auto;
      padding: 12px;

      li {
        max-width: 84%;
        padding: 7px 11px;
        border-radius: min(var(--wd-r), 16px) min(var(--wd-r), 16px) min(var(--wd-r), 16px) 4px;
        background: var(--surface-2);
        font-size: 0.9em;
      }
      li.me {
        align-self: flex-end;
        border-radius: min(var(--wd-r), 16px) min(var(--wd-r), 16px) 4px min(var(--wd-r), 16px);
        background: var(--wd);
        color: var(--wd-ink);
      }
    }
    .wd-in {
      display: flex;
      gap: 6px;
      padding: 8px;
      border-top: 1px solid var(--line);

      input {
        flex: 1;
        min-width: 0;
        height: 40px;
        padding: 0 12px;
        border-radius: 999px;
        border: 1px solid var(--line);
        font-size: 0.9em;
        background: var(--bg);
      }
      button {
        width: 40px;
        height: 40px;
        display: grid;
        place-items: center;
        border-radius: 50%;
        background: var(--wd);
        color: var(--wd-ink);
        font-size: 16px;
      }
      button[disabled] {
        opacity: 0.45;
      }
    }
    .wd-credit {
      padding: 0 0 8px;
      text-align: center;
      font-size: 12px;
      color: var(--muted);
    }
    .launcher {
      position: absolute;
      right: 16px;
      bottom: 16px;
      width: 54px;
      height: 54px;
      display: grid;
      place-items: center;
      border-radius: 50%;
      background: var(--wd);
      color: var(--wd-ink);
      font-size: 24px;
      box-shadow: var(--shadow-lg);
      transition: transform var(--t-fast) var(--ease);

      &:active {
        transform: scale(0.94);
      }
    }
    .embed {
      grid-column: 1 / -1;
      display: grid;
      grid-template-columns: minmax(0, 1fr);
      gap: 10px;
      min-width: 0;
    }
    .embed-bar {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      align-items: center;
      justify-content: space-between;

      .seg button {
        min-height: 36px;
        white-space: nowrap;
      }
      .select {
        height: 44px;
        width: auto;
        min-width: 150px;
        font-size: 14px;
      }
    }
    .code {
      min-width: 0;
    }
    .code pre {
      min-height: 172px;
      font-size: 12.5px;
      line-height: 1.65;
    }
    .note {
      font-size: 12px;
      color: var(--muted);
    }
    @media (max-width: 860px) {
      .lab {
        grid-template-columns: minmax(0, 1fr);
        padding: 14px;
      }
      .stage {
        min-height: 440px;
      }
      .sk-grid {
        max-width: 100%;
      }
    }
    @media (max-width: 374px) {
      .embed-bar .seg button {
        padding: 0 10px;
      }
    }
  `,
})
export class O2chatWidgetDemo {
  protected readonly swatches = SWATCHES;
  protected readonly platforms = PLATFORMS;

  protected readonly heading = signal('Chat with us');
  protected readonly sub = signal('We usually reply in a few minutes');
  protected readonly colour = signal('#0a58ca');
  protected readonly radius = signal(16);
  protected readonly size = signal(14);
  protected readonly branding = signal(true);
  protected readonly open = signal(true);
  protected readonly lines = signal<Line[]>(SEED);
  protected readonly draft = signal('');
  protected readonly view = signal<View>('script');
  protected readonly platform = signal<Platform>('site');
  protected readonly copied = signal(false);

  protected readonly ink = computed(() => onColour(this.colour()));

  private timers = new Set<ReturnType<typeof setTimeout>>();

  constructor() {
    inject(DestroyRef).onDestroy(() => this.timers.forEach(clearTimeout));
  }

  protected readonly code = computed(() => {
    const v = this.view();
    if (v === 'json') return JSON.stringify(this.settings(), null, 2);
    if (v === 'angular') {
      return [
        '<!-- Angular host: the same chat, mounted as a component -->',
        '<o2-live-chat',
        `  channel="${CHANNEL}"`,
        `  [customization]="{ background: '${this.colour()}', borderradius: ${this.radius()}, fontsize: ${this.size()} }"`,
        '/>',
      ].join('\n');
    }
    const base = ['<script', '  id="widget-script-23j"', '  src="https://widget.example/app.js"', '  data-url="https://chat.example"', `  data-channel="${CHANNEL}"`];
    const p = this.platform();
    if (p === 'shopify') base.push('  data-name="{{ customer.first_name | escape }}"', '  data-email="{{ customer.email | escape }}"');
    if (p === 'wordpress') base.push('  data-name="<?php echo esc_attr( wp_get_current_user()->display_name ); ?>"', '  data-email="<?php echo esc_attr( wp_get_current_user()->user_email ); ?>"');
    return [...base, '  allow="microphone"', '  defer>', '</script>'].join('\n');
  });

  protected readonly caption = computed(() => {
    const v = this.view();
    if (v === 'json') return 'What the portal saves for this channel. The widget reads it when it opens, so a change needs no new snippet.';
    if (v === 'angular') return 'Inside an Angular app the chat needs no loader and no iframe. The colours still come from the saved settings.';
    return {
      site: 'One tag before </body>. The loader adds the launcher and opens the chat in an iframe; the browser back button closes it.',
      shopify: 'Shopify themes pass the signed-in customer, so agents see a name instead of a visitor number.',
      wordpress: 'WordPress passes the logged-in user the same way, escaped for an attribute.',
    }[this.platform()];
  });

  private settings() {
    return {
      channelid: CHANNEL,
      heading: this.heading(),
      subheading: this.sub(),
      background: this.colour(),
      foreground: this.ink(),
      sentmsgbackground: this.colour(),
      sentmsgforeground: this.ink(),
      receivedmsgbackground: '#e8eef8',
      receivedmsgforeground: '#111a2e',
      borderradius: this.radius(),
      fontsize: this.size(),
      showo2chatbranding: this.branding(),
    };
  }

  private later(fn: () => void, ms: number): void {
    const t = setTimeout(() => {
      this.timers.delete(t);
      fn();
    }, ms);
    this.timers.add(t);
  }

  protected say(): void {
    const text = this.draft().trim();
    if (!text) return;
    this.lines.update((l) => [...l, { from: 'visitor', text }]);
    this.draft.set('');
    this.scroll();
    this.later(() => {
      this.lines.update((l) => [...l, { from: 'agent', text: 'Thanks. An agent will be with you in a moment.' }]);
      this.scroll();
    }, 900);
  }

  private scroll(): void {
    this.later(() => {
      const el = document.querySelector('mh-o2chat-widget .wd-msgs');
      if (el) el.scrollTop = el.scrollHeight;
    }, 30);
  }

  protected copy(): void {
    navigator.clipboard?.writeText(this.code()).then(
      () => {
        this.copied.set(true);
        this.later(() => this.copied.set(false), 1600);
      },
      () => {},
    );
  }

  protected reset(): void {
    this.heading.set('Chat with us');
    this.sub.set('We usually reply in a few minutes');
    this.colour.set('#0a58ca');
    this.radius.set(16);
    this.size.set(14);
    this.branding.set(true);
    this.open.set(true);
    this.lines.set(SEED);
    this.view.set('script');
    this.platform.set('site');
  }
}
