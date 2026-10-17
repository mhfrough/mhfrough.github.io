import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { phosphorArrowUpRight, phosphorCheck, phosphorCopy } from '@ng-icons/phosphor-icons/regular';

/**
 * The package's own function, verbatim from @mhfrough/star-rating 1.0.1 (index.js, MIT, same author).
 * Kept inline instead of adding a runtime dependency for six lines.
 */
export const rating = (n: number): string => {
  if (typeof n !== 'number' || isNaN(n) || n < 0 || n > 5) throw new Error('Rating must be a number between 0 and 5.');
  const fullStars = Math.floor(n);
  const hasHalfStar = n % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
  return '★'.repeat(fullStars) + (hasHalfStar ? '⯪' : '') + '☆'.repeat(emptyStars);
};

const PKG = '@mhfrough/star-rating';
const INSTALL = `npm install ${PKG}`;
const USAGE = `import rating from '${PKG}';

rating(3.5); // "★★★⯪☆"`;

const COPY = {
  eyebrow: 'npm package',
  title: PKG,
  note: 'A tiny, dependency-free function that turns a number from 0 to 5 into a star string, with half stars. Published on npm in July 2025.',
  npm: 'See it on npm',
  npmUrl: 'https://www.npmjs.com/package/@mhfrough/star-rating',
  github: 'See it on GitHub',
  githubUrl: 'https://github.com/mhfrough/star-rating',
  external: '(opens in a new tab)',
  playground: 'Try it',
  value: 'Rating',
  valueHint: 'Any number from 0 to 5, decimals allowed. Half a star shows from .5 up.',
  install: 'Install',
  usage: 'Usage',
  copy: 'Copy',
  copied: 'Copied',
  copiedLive: 'Install command copied to the clipboard.',
  examples: 'Examples',
  facts: [
    { k: 'Version', v: '1.0.1' },
    { k: 'Dependencies', v: '0' },
    { k: 'Unpacked size', v: '5.2 KB' },
    { k: 'Types', v: 'Included' },
    { k: 'Runs in', v: 'Node.js and the browser' },
    { k: 'License', v: 'MIT' },
  ],
} as const;

/**
 * /work section for the npm package: a live playground running the package's exact function, the install line
 * with copy, usage, a few examples and the package facts. Sits under the weather icon set.
 */
@Component({
  selector: 'mh-star-rating-pkg',
  imports: [NgIcon],
  viewProviders: [provideIcons({ phosphorArrowUpRight, phosphorCheck, phosphorCopy })],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="pkg" id="star-rating" aria-labelledby="pkg-title">
      <div class="wrap">
        <div class="head">
          <div>
            <span class="badge">{{ t.eyebrow }}</span>
            <h2 class="head__title mono" id="pkg-title" translate="no">{{ t.title }}</h2>
            <p class="head__note">{{ t.note }}</p>
          </div>
          <div class="head__actions">
            <a class="btn btn-ghost btn-sm" [href]="t.githubUrl" target="_blank" rel="noopener">
              {{ t.github }}<ng-icon name="phosphorArrowUpRight" aria-hidden="true" /><span class="sr-only">{{ t.external }}</span>
            </a>
            <a class="btn btn-solid btn-sm" [href]="t.npmUrl" target="_blank" rel="noopener">
              {{ t.npm }}<ng-icon name="phosphorArrowUpRight" aria-hidden="true" /><span class="sr-only">{{ t.external }}</span>
            </a>
          </div>
        </div>

        <div class="card set">
          <div class="play">
            <p class="k">{{ t.playground }}</p>
            <output class="stars" for="pkg-range pkg-num" [attr.aria-label]="label()">{{ stars() }}</output>
            <p class="call mono" aria-hidden="true">
              rating({{ value() }}) <span class="cmt">// "{{ stars() }}"</span>
            </p>

            <div class="field">
              <label class="field__label" for="pkg-num">{{ t.value }}</label>
              <div class="controls">
                <input
                  id="pkg-range"
                  class="range"
                  type="range"
                  min="0"
                  max="5"
                  step="0.1"
                  [value]="value()"
                  (input)="set($any($event.target).value)"
                  [attr.aria-label]="t.value"
                  aria-describedby="pkg-hint"
                />
                <input
                  id="pkg-num"
                  class="input num mono"
                  type="number"
                  min="0"
                  max="5"
                  step="0.1"
                  inputmode="decimal"
                  [value]="value()"
                  (input)="set($any($event.target).value)"
                  aria-describedby="pkg-hint"
                />
              </div>
              <p class="field__hint" id="pkg-hint">{{ t.valueHint }}</p>
            </div>

            <p class="k">{{ t.examples }}</p>
            <ul class="examples" role="list">
              @for (e of examples; track e) {
                <li>
                  <button type="button" class="chip" [attr.aria-pressed]="value() === e" (click)="set(e)">
                    <span class="mono">{{ e }}</span><span class="glyphs" aria-hidden="true">{{ star(e) }}</span>
                  </button>
                </li>
              }
            </ul>
          </div>

          <div class="side">
            <p class="k">{{ t.install }}</p>
            <div class="cmd">
              <span class="prompt" aria-hidden="true">$</span>
              <code translate="no">{{ install }}</code>
              <button type="button" class="copy" (click)="copy()">
                <ng-icon [name]="copied() ? 'phosphorCheck' : 'phosphorCopy'" aria-hidden="true" />{{ copied() ? t.copied : t.copy }}
              </button>
            </div>

            <p class="k">{{ t.usage }}</p>
            <div class="code"><pre translate="no"><code>{{ usage }}</code></pre></div>

            <dl class="facts">
              @for (f of t.facts; track f.k) {
                <div><dt>{{ f.k }}</dt><dd>{{ f.v }}</dd></div>
              }
            </dl>
          </div>
        </div>
        <p class="sr-only" aria-live="polite" aria-atomic="true">{{ live() }}</p>
      </div>
    </section>
  `,
  styles: `
    :host {
      display: block;
    }
    .pkg {
      padding-top: 96px;
    }
    .head {
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
      gap: 16px;
      margin-bottom: 24px;
    }
    .head__title {
      margin: 14px 0 0;
      font-size: clamp(1.25rem, 2vw, 1.55rem);
      line-height: 1.2;
      letter-spacing: -0.02em;
      font-weight: 500;
      overflow-wrap: anywhere;
    }
    .head__note {
      margin: 8px 0 0;
      max-width: 60ch;
      color: var(--muted);
      font-size: 15px;
      text-wrap: pretty;
    }
    .head__actions {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
    .head__actions ng-icon {
      font-size: 15px;
    }
    .k {
      margin: 0;
      font-family: var(--font-mono);
      font-size: 12px;
      color: var(--muted);
    }
    .set {
      display: grid;
      grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr);
      padding: 0;
      overflow: hidden;
    }
    .play,
    .side {
      display: flex;
      flex-direction: column;
      gap: 14px;
      padding: 24px;
      min-width: 0;
    }
    .play {
      border-right: 1px solid var(--line);
    }
    /* The glyphs (★ ⯪ ☆) are not in Geist; use the platform symbol fonts. */
    .stars,
    .glyphs {
      font-family: 'Segoe UI Symbol', 'Noto Sans Symbols 2', 'Apple Symbols', 'DejaVu Sans', sans-serif;
      letter-spacing: 0.06em;
    }
    .stars {
      display: block;
      font-size: clamp(2.6rem, 6vw, 3.6rem);
      line-height: 1.1;
      color: var(--ink);
    }
    .call {
      margin: -4px 0 4px;
      font-size: 13px;
      color: var(--ink-2);
      overflow-wrap: anywhere;
    }
    .cmt {
      color: var(--muted);
    }
    .field {
      display: grid;
      gap: 8px;
    }
    .controls {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .range {
      flex: 1;
      min-width: 0;
      height: 44px;
      accent-color: var(--ink);
      cursor: pointer;
    }
    .num {
      width: 96px;
      flex-shrink: 0;
      text-align: center;
    }
    .examples {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin: 0;
      padding: 0;
      list-style: none;
    }
    .examples .chip {
      height: 36px;
      gap: 8px;
      cursor: pointer;
    }
    .cmd {
      max-width: none;
    }
    .code pre {
      font-size: 13px;
    }
    .facts {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 12px 18px;
      margin: 6px 0 0;
      padding-top: 16px;
      border-top: 1px solid var(--line);
    }
    .facts div {
      display: grid;
      gap: 2px;
    }
    .facts dt {
      font-family: var(--font-mono);
      font-size: 12px;
      color: var(--muted);
    }
    .facts dd {
      margin: 0;
      font-size: 14px;
      color: var(--ink-2);
    }
    @media (max-width: 900px) {
      .set {
        grid-template-columns: minmax(0, 1fr);
      }
      .play {
        border-right: 0;
        border-bottom: 1px solid var(--line);
      }
    }
    @media (max-width: 640px) {
      .pkg {
        padding-top: 72px;
      }
      .head {
        flex-direction: column;
        align-items: flex-start;
        gap: 14px;
      }
      .play,
      .side {
        padding: 18px;
      }
    }
  `,
})
export class StarRatingPkg {
  protected readonly t = COPY;
  protected readonly install = INSTALL;
  protected readonly usage = USAGE;
  protected readonly examples = [0, 1.5, 3, 4.5, 5];

  protected readonly value = signal(3.5);
  protected readonly stars = computed(() => rating(this.value()));
  /** Screen readers hear "3.5 out of 5 stars", not the raw glyphs. */
  protected readonly label = computed(() => `${this.value()} out of 5 stars`);
  protected readonly copied = signal(false);
  protected readonly live = signal('');
  private timer?: ReturnType<typeof setTimeout>;

  protected star(n: number): string {
    return rating(n);
  }

  /** Clamp to the package's valid range and one decimal, so the demo never throws. */
  protected set(raw: string | number): void {
    const n = typeof raw === 'number' ? raw : parseFloat(raw);
    if (Number.isNaN(n)) return;
    this.value.set(Math.round(Math.min(5, Math.max(0, n)) * 10) / 10);
  }

  protected async copy(): Promise<void> {
    try {
      await navigator.clipboard.writeText(INSTALL);
      this.copied.set(true);
      this.live.set(COPY.copiedLive);
      clearTimeout(this.timer);
      this.timer = setTimeout(() => this.copied.set(false), 1800);
    } catch {
      // Clipboard blocked: the command stays selectable.
    }
  }
}
