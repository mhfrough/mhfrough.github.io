import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { phosphorArrowCounterClockwise, phosphorCheck, phosphorWarningCircle } from '@ng-icons/phosphor-icons/regular';

/**
 * Hero mockup of the Arittek blog post editor (my own redraw, not a screenshot). It follows the real form's
 * rules: the slug follows the title until it is edited by hand, must be lowercase words joined by hyphens and
 * must not be taken by another post; the meta description (160) defaults to the excerpt, and the meta title to
 * the post title (its 60-character field is left out here to keep the card short); a scheduled post needs a time
 * in the future. The preview uses the same title suffix and the
 * same 160-character summary the server writes into the page for crawlers. Sample post and slugs.
 */
type Status = 'draft' | 'scheduled' | 'published';

/** Slugs of sample posts that already exist. */
const TAKEN = ['islamic-pool-management-explained', 'what-a-toll-plaza-does-offline', 'data-pipelines-for-banks'];

const WHEN = [
  { v: 'tomorrow', t: 'Tomorrow, 09:00', s: 'tomorrow at 09:00', past: false },
  { v: 'monday', t: 'Next Monday, 10:30', s: 'next Monday at 10:30', past: false },
  { v: 'yesterday', t: 'Yesterday, 17:00', s: 'yesterday at 17:00', past: true },
] as const;

const SEED = {
  title: 'Profit distribution with an audit trail',
  excerpt:
    'How an Islamic bank can show, pool by pool, how profit was worked out and shared, and why every step needs a record that a Shariah board can read.',
};

const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

/** Whitespace collapsed and cut to a meta-description length, like the server's summarize(). */
const summarize = (s: string, max = 160) => {
  const t = s.replace(/\s+/g, ' ').trim();
  return t.length <= max ? t : t.slice(0, max - 1).trimEnd() + '…';
};

@Component({
  selector: 'mh-arittek-editor',
  imports: [NgIcon],
  viewProviders: [provideIcons({ phosphorArrowCounterClockwise, phosphorCheck, phosphorWarningCircle })],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <form class="ed card card--lift" (submit)="$event.preventDefault(); save()" aria-label="Sample blog post editor">
      <header class="ed-head">
        <span class="mark"><img src="/images/arittek/arittek-mark.svg" width="34" height="17" alt="" /></span>
        <div>
          <h2>New post</h2>
          <p>Blog, sample data</p>
        </div>
        <button type="button" class="reset" aria-label="Reset the sample post" (click)="reset()">
          <ng-icon name="phosphorArrowCounterClockwise" aria-hidden="true" />
        </button>
      </header>

      <div class="field">
        <label for="are-title">Title</label>
        <input id="are-title" class="input" [value]="title()" (input)="onTitle($any($event.target).value)" />
      </div>

      <div class="field">
        <label for="are-slug">Slug</label>
        <div class="slug" [class.bad]="slugState().bad">
          <span class="pre mono" aria-hidden="true">/blogs/</span>
          <input id="are-slug" class="mono" [value]="slug()" (input)="onSlug($any($event.target).value)" aria-describedby="are-slug-msg" spellcheck="false" />
          @if (manual()) {
            <button type="button" class="relink" (click)="relink()">Use title</button>
          }
        </div>
        <span class="msg" id="are-slug-msg" [class.bad]="slugState().bad">
          <ng-icon [name]="slugState().bad ? 'phosphorWarningCircle' : 'phosphorCheck'" aria-hidden="true" />
          {{ slugState().msg }}
        </span>
      </div>

      <div class="row">
        <div class="seg" role="group" aria-label="Status">
          <button type="button" [attr.aria-pressed]="status() === 'draft'" (click)="setStatus('draft')">Draft</button>
          <button type="button" [attr.aria-pressed]="status() === 'scheduled'" (click)="setStatus('scheduled')">Scheduled</button>
          <button type="button" [attr.aria-pressed]="status() === 'published'" (click)="setStatus('published')">Published</button>
        </div>
        @if (status() === 'scheduled') {
          <label for="are-when" class="sr-only">Publish at</label>
          <select id="are-when" class="select" [value]="when()" (change)="when.set($any($event.target).value)" [attr.aria-describedby]="whenPast() ? 'are-when-msg' : null">
            @for (w of whens; track w.v) {
              <option [value]="w.v">{{ w.t }}</option>
            }
          </select>
        }
      </div>
      @if (whenPast()) {
        <span class="msg bad" id="are-when-msg"><ng-icon name="phosphorWarningCircle" aria-hidden="true" /> Scheduled time must be in the future.</span>
      }

      <div class="field">
        <div class="lbl-row">
          <label for="are-meta">Meta description</label>
          <span class="mono n" id="are-meta-n">{{ meta().length }}/160</span>
        </div>
        <textarea id="are-meta" class="textarea" rows="2" maxlength="160" placeholder="Defaults to the excerpt" [value]="meta()" (input)="meta.set($any($event.target).value)" aria-describedby="are-meta-n"></textarea>
      </div>

      <div class="serp" aria-label="Search result preview" role="group">
        <p class="serp-url mono"><span class="fav"><img src="/images/arittek/arittek-mark.svg" width="14" height="7" alt="" /></span>arittek.com › blogs › {{ slug() || '…' }}</p>
        <p class="serp-t">{{ serpTitle() }}</p>
        <p class="serp-d">{{ serpDesc() }}</p>
      </div>

      <div class="foot">
        <p class="mono note" aria-live="polite">{{ note() }}</p>
        <button type="submit" class="btn btn-solid btn-sm" [disabled]="!valid()">{{ action() }}</button>
      </div>
    </form>
  `,
  styles: `
    :host {
      display: block;
    }
    .ed {
      display: grid;
      grid-template-columns: minmax(0, 1fr);
      gap: 12px;
      padding: 18px;
    }
    .ed-head {
      display: flex;
      align-items: center;
      gap: 12px;
      padding-bottom: 12px;
      border-bottom: 1px solid var(--line);

      div {
        flex: 1;
      }
      h2 {
        font-size: 16px;
      }
      p {
        font-size: 12.5px;
        color: var(--muted);
      }
    }
    .mark {
      width: 44px;
      height: 44px;
      display: grid;
      place-items: center;
      border-radius: var(--r-inner);
      background: var(--bg);
      border: 1px solid var(--line);
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
    .field {
      gap: 5px;
    }
    .input,
    .select {
      height: 42px;
      font-size: 14px;
    }
    // The global .field grid sizes to its widest child; here the slug row must shrink with the card
    .field {
      grid-template-columns: minmax(0, 1fr);
    }
    .slug {
      min-width: 0;
      display: flex;
      align-items: center;
      height: 42px;
      padding: 0 6px 0 16px;
      border-radius: 999px;
      border: 1px solid var(--line);
      background: var(--surface);

      &:focus-within {
        outline: 2px solid var(--focus);
        outline-offset: 2px;
      }
      &.bad {
        border-color: var(--a-red-text);
      }
      .pre {
        font-size: 12.5px;
        color: var(--muted);
      }
      input {
        flex: 1;
        min-width: 0;
        height: 100%;
        border: 0;
        background: transparent;
        font-size: 12.5px;
        color: var(--ink);
        outline: none;
      }
    }
    .relink {
      height: 32px;
      padding: 0 11px;
      border-radius: 999px;
      font-size: 12px;
      font-weight: 500;
      white-space: nowrap;
      background: var(--surface-2);
      color: var(--ink-2);

      &:hover {
        color: var(--ink);
      }
    }
    .msg {
      display: flex;
      align-items: center;
      gap: 5px;
      font-size: 12px;
      color: var(--a-forest-text);

      &.bad {
        color: var(--a-red-text);
      }
    }
    .row {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 8px;

      .seg button {
        height: 30px;
        padding: 0 11px;
        font-size: 13px;
      }
      .select {
        flex: 1 1 160px;
        height: 40px;
      }
    }
    .lbl-row {
      display: flex;
      justify-content: space-between;
      align-items: baseline;

      .n {
        font-size: 12px;
        color: var(--muted);
      }
    }
    .textarea {
      min-height: 60px;
      font-size: 13.5px;
    }
    .serp {
      padding: 12px 14px;
      border-radius: var(--r-inner);
      background: var(--bg);
      border: 1px solid var(--line);

      p {
        overflow-wrap: anywhere;
      }
    }
    .serp-url {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      color: var(--muted);
    }
    .fav {
      width: 20px;
      height: 20px;
      display: grid;
      place-items: center;
      border-radius: 50%;
      background: var(--surface);
      border: 1px solid var(--line);
    }
    .serp-t {
      margin-top: 4px;
      font-size: 15.5px;
      font-weight: 500;
      color: var(--a-navy-2);
      line-height: 1.3;
    }
    .serp-d {
      margin-top: 2px;
      font-size: 12.5px;
      color: var(--ink-2);
      line-height: 1.45;
    }
    .foot {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;

      .note {
        font-size: 12px;
        color: var(--muted);
      }
      .btn {
        flex-shrink: 0;
        min-height: 44px;
      }
      .btn[disabled] {
        opacity: 0.45;
        cursor: not-allowed;
      }
    }
    @media (max-width: 460px) {
      .ed {
        padding: 14px;
      }
      .foot {
        flex-wrap: wrap;
      }
    }
  `,
})
export class ArittekEditorDemo {
  protected readonly whens = WHEN;
  protected readonly title = signal(SEED.title);
  protected readonly slug = signal(slugify(SEED.title));
  protected readonly manual = signal(false);
  protected readonly status = signal<Status>('scheduled');
  protected readonly when = signal<string>('tomorrow');
  protected readonly meta = signal('');
  protected readonly note = signal('Sample post. Edit the title, the slug or the status.');

  protected readonly slugState = computed(() => {
    const s = this.slug();
    if (!s) return { bad: true, msg: 'A slug is required.' };
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(s)) return { bad: true, msg: 'Lowercase letters, numbers and hyphens only.' };
    if (TAKEN.includes(s)) return { bad: true, msg: 'This slug is already used by another post.' };
    return { bad: false, msg: this.manual() ? 'Available, edited by hand.' : 'Available, follows the title.' };
  });
  protected readonly whenPast = computed(() => this.status() === 'scheduled' && !!WHEN.find((w) => w.v === this.when())?.past);
  protected readonly valid = computed(() => this.title().trim().length > 0 && !this.slugState().bad && !this.whenPast());
  protected readonly action = computed(() => ({ draft: 'Save draft', scheduled: 'Schedule', published: 'Publish' })[this.status()]);

  /** What the server writes into the page head: meta title (or the title) plus the blog suffix. */
  protected readonly serpTitle = computed(() => {
    const t = (this.title().trim() || 'Untitled') + ' | Arittek Blog';
    return t.length > 62 ? t.slice(0, 60).trimEnd() + '…' : t;
  });
  protected readonly serpDesc = computed(() => summarize(this.meta() || SEED.excerpt));

  protected onTitle(v: string): void {
    this.title.set(v);
    if (!this.manual()) this.slug.set(slugify(v));
  }

  protected onSlug(v: string): void {
    this.manual.set(true);
    this.slug.set(v);
  }

  protected relink(): void {
    this.manual.set(false);
    this.slug.set(slugify(this.title()));
  }

  protected setStatus(s: Status): void {
    this.status.set(s);
  }

  protected save(): void {
    if (!this.valid()) return;
    const msg = {
      draft: 'Draft saved. Only the admin can see it.',
      scheduled: `Scheduled for ${WHEN.find((w) => w.v === this.when())?.s}. It goes live with the first visit after that.`,
      published: `Published at /blogs/${this.slug()} and added to the blog sitemap.`,
    }[this.status()];
    this.note.set(msg);
  }

  protected reset(): void {
    this.title.set(SEED.title);
    this.slug.set(slugify(SEED.title));
    this.manual.set(false);
    this.status.set('scheduled');
    this.when.set('tomorrow');
    this.meta.set('');
    this.note.set('Sample post reset.');
  }
}
