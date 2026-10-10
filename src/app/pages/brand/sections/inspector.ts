import { ChangeDetectionStrategy, Component, afterNextRender, computed, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { phosphorCheck, phosphorCopy } from '@ng-icons/phosphor-icons/regular';
import { COPY } from '../brand.copy';
import { COLOR_GROUPS, ColorToken } from '../brand.data';
import { Rgba, contrast, copyText, describeColor, grade, over, parseColor, ratioLabel, readVar, resolveColor } from '../brand.util';

const BY: Record<string, ColorToken> = Object.fromEntries(COLOR_GROUPS.flatMap((g) => g.tokens).map((t) => [t.name, t]));
const pick = (...names: string[]) => names.map((n) => BY[n]);
/** Four per group, so the card keeps one height while you switch. */
const GROUPS = [
  { id: 'surfaces', label: 'Surfaces', tokens: pick('--bg', '--bg-2', '--surface', '--surface-2') },
  { id: 'ink', label: 'Ink', tokens: pick('--ink', '--ink-2', '--muted', '--faint') },
  { id: 'cta', label: 'CTA', tokens: pick('--cta', '--cta-ink', '--accent', '--accent-ink') },
  { id: 'solid', label: 'Solid', tokens: pick('--solid', '--solid-ink', '--accent-soft', '--solid-edge') },
  { id: 'lines', label: 'Lines', tokens: pick('--line', '--line-strong', '--glass-edge', '--glass-hi') },
];

/**
 * Hero visual: a working token inspector (Quorum's "Build your Quorum" card, pointed at the design tokens).
 * Pick a group, pick a token, read its live value and contrast, copy the var().
 */
@Component({
  selector: 'mh-brand-inspector',
  imports: [NgIcon],
  viewProviders: [provideIcons({ phosphorCopy, phosphorCheck })],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="card card--lift insp" aria-labelledby="insp-title">
      <div class="insp__head">
        <h2 id="insp-title">{{ t.title }}</h2>
        <span class="mono muted" aria-live="polite">{{ index() + 1 }} of {{ tokens().length }}</span>
      </div>

      <div class="insp__groups" role="group" [attr.aria-label]="t.groups">
        @for (g of groups; track g.id) {
          <button type="button" class="chip" [attr.aria-pressed]="g.id === group()" (click)="pickGroup(g.id)">{{ g.label }}</button>
        }
      </div>

      <div class="insp__tokens" role="group" [attr.aria-label]="t.tokens">
        @for (tk of tokens(); track tk.name) {
          <button type="button" class="tk" [attr.aria-pressed]="tk.name === token().name" (click)="selected.set(tk.name)">
            <span class="tk__sw" [style.background]="'var(' + tk.name + ')'" aria-hidden="true"></span>
            <span class="tk__t">
              <b>{{ tk.name }}</b>
              <small>{{ value(tk) }}</small>
            </span>
          </button>
        }
      </div>

      <div class="insp__preview" [style.background]="'var(' + token().bg + ')'">
        <span class="insp__aa" [style.color]="'var(' + token().fg + ')'">Aa</span>
        <span class="insp__read">
          <span class="mono">{{ token().fg }} {{ t.on }} {{ token().bg }}</span>
          <span class="insp__ratio" [style.color]="'var(' + token().fg + ')'">{{ ratio() }} <span class="tag">{{ gradeOf() }}</span></span>
        </span>
      </div>

      <div class="insp__out">
        <code>var({{ token().name }})</code>
        <button type="button" class="copy" (click)="copy()">
          <ng-icon [name]="copied() ? 'phosphorCheck' : 'phosphorCopy'" aria-hidden="true" />{{ copied() ? t.copied : t.copy }}
        </button>
      </div>
      <p class="sr-only" aria-live="polite">{{ copied() ? t.copiedLive : '' }}</p>
    </section>
  `,
  styles: `
    :host {
      display: block;
      position: relative;
      padding-top: 18px;
    }
    :host::before {
      content: '';
      position: absolute;
      left: 6%;
      right: 6%;
      top: 0;
      height: 60px;
      border-radius: var(--r-card);
      background: var(--surface-2);
      border: 1px solid var(--line);
    }
    .insp {
      position: relative;
      padding: 22px;
    }
    .insp__head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      margin-bottom: 14px;
    }
    h2 {
      font-size: 17px;
      letter-spacing: -0.01em;
    }
    .insp__groups {
      display: flex;
      gap: 6px;
      overflow-x: auto;
      scrollbar-width: none;
      margin: 0 -22px 14px;
      padding: 0 22px;
    }
    .insp__tokens {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 6px;
    }
    .tk {
      min-width: 0;
      display: flex;
      align-items: center;
      gap: 10px;
      height: 50px;
      padding: 0 14px 0 8px;
      border-radius: 999px;
      text-align: left;
      border: 1px solid transparent;
      background: var(--surface-2);
      color: var(--muted);
      transition:
        background var(--t-base) var(--ease),
        color var(--t-base) var(--ease),
        border-color var(--t-base) var(--ease),
        transform var(--t-fast) var(--ease);
    }
    .tk:active {
      transform: scale(0.98);
    }
    .tk[aria-pressed='true'] {
      background: var(--accent-soft);
      color: var(--ink);
      border-color: var(--line-strong);
    }
    .tk__sw {
      width: 34px;
      height: 34px;
      flex-shrink: 0;
      border-radius: 999px;
      box-shadow: inset 0 0 0 1px var(--line-strong);
    }
    .tk__t {
      min-width: 0;
      display: grid;
      line-height: 1.25;
    }
    .tk__t b {
      font-family: var(--font-mono);
      font-weight: 500;
      font-size: 13px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .tk__t small {
      font-family: var(--font-mono);
      font-size: 11.5px;
      color: var(--muted);
    }
    .insp__preview {
      display: flex;
      align-items: center;
      gap: 18px;
      margin-top: 14px;
      padding: 14px 18px;
      border-radius: var(--r-inner);
      border: 1px solid var(--line);
      transition: background var(--t-base) var(--ease);
    }
    .insp__aa {
      font-size: 44px;
      font-weight: 600;
      letter-spacing: -0.04em;
      line-height: 1;
    }
    .insp__read {
      display: grid;
      gap: 2px;
      min-width: 0;
    }
    .insp__read .mono {
      font-size: 12px;
      color: var(--muted);
      overflow-wrap: anywhere;
    }
    .insp__ratio {
      font-size: 1.25rem;
      font-weight: 600;
      letter-spacing: -0.02em;
      display: flex;
      align-items: center;
      gap: 8px;
      font-variant-numeric: tabular-nums;
    }
    .insp__out {
      margin-top: 14px;
      border-radius: var(--r-inner);
      background: var(--solid);
      color: var(--solid-ink);
      border: 1px solid var(--solid-edge);
      padding: 10px 10px 10px 16px;
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .insp__out code {
      flex: 1;
      min-width: 0;
      font-size: 13px;
    }
    @media (max-width: 420px) {
      .insp {
        padding: 18px;
      }
      .insp__groups {
        margin: 0 -18px 14px;
        padding: 0 18px;
      }
      .tk {
        padding-right: 10px;
      }
    }
  `,
})
export class BrandInspector {
  protected readonly t = COPY.inspector;
  protected readonly groups = GROUPS;
  protected readonly group = signal(GROUPS[0].id);
  protected readonly selected = signal<string>(GROUPS[0].tokens[2].name);
  protected readonly copied = signal(false);
  /** Live token values (browser), literal fallbacks from _tokens.scss (server). */
  private readonly live = signal<Record<string, string>>({});
  private timer: ReturnType<typeof setTimeout> | undefined;

  protected readonly tokens = computed(() => GROUPS.find((g) => g.id === this.group())!.tokens);
  protected readonly token = computed(() => this.tokens().find((x) => x.name === this.selected()) ?? this.tokens()[0]);
  protected readonly index = computed(() => this.tokens().indexOf(this.token()));

  private readonly ratioNum = computed(() => {
    const tk = this.token();
    const bg = this.rgba(tk.bg);
    const fg = this.rgba(tk.fg);
    return bg && fg ? contrast(over(fg, bg), bg) : 0;
  });
  protected readonly ratio = computed(() => ratioLabel(this.ratioNum()));
  protected readonly gradeOf = computed(() => grade(this.ratioNum(), this.token().kind));

  constructor() {
    afterNextRender(() => {
      const all: Record<string, string> = {};
      for (const g of GROUPS) for (const tk of g.tokens) all[tk.name] = readVar(tk.name);
      this.live.set(all);
    });
  }

  private raw(name: string): string {
    return this.live()[name] || GROUPS.flatMap((g) => g.tokens).find((x) => x.name === name)?.value || '#000';
  }

  private rgba(name: string): Rgba | null {
    const v = this.raw(name);
    return typeof document === 'undefined' ? parseColor(v) : resolveColor(v);
  }

  protected value(tk: ColorToken): string {
    const c = this.rgba(tk.name);
    return c ? describeColor(c) : tk.value;
  }

  protected pickGroup(id: string): void {
    this.group.set(id);
    this.selected.set(this.tokens()[0].name);
  }

  protected async copy(): Promise<void> {
    if (!(await copyText(`var(${this.token().name})`))) return;
    this.copied.set(true);
    clearTimeout(this.timer);
    this.timer = setTimeout(() => this.copied.set(false), 1600);
  }
}
