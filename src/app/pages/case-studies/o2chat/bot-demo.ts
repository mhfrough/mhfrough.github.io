import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  phosphorArrowCounterClockwise,
  phosphorCheck,
  phosphorFileText,
  phosphorGlobe,
  phosphorPaperPlaneRight,
  phosphorPlus,
  phosphorRobot,
  phosphorTrash,
  phosphorUser,
} from '@ng-icons/phosphor-icons/regular';

/**
 * The AI bot's training screens as my own working mockup. The four real sources are here: question and answer
 * pairs, pasted text, crawled pages and uploaded files (PDF, Word, text or JSON up to 10 MB in the product), plus
 * the bot's name, tone keywords and a tone per channel. The test chat on the right answers only from what has been
 * trained, by plain word overlap (the real bot is a hosted language model; this is a stand-in that shows the
 * idea), names its source, and hands over to a person when nothing matches. Invented store and content.
 */
type Source = 'qa' | 'text' | 'pages' | 'files';
type Tone = 'friendly' | 'formal' | 'brief';
type Chan = 'web' | 'email' | 'instagram';

interface Pair {
  id: number;
  q: string;
  a: string;
}
interface Doc {
  id: string;
  label: string;
  size?: string;
  text: string;
  state: 'idle' | 'busy' | 'done';
  progress: number;
}
interface Chunk {
  kind: 'Q&A' | 'Text' | 'Page' | 'File';
  label: string;
  text: string;
  q?: string;
}
interface Line {
  from: 'me' | 'bot' | 'sys';
  text: string;
  src?: string;
}

const PAIRS: Pair[] = [
  { id: 1, q: 'Do you ship abroad?', a: 'We ship to 30 countries. International orders arrive in 5 to 9 working days.' },
  { id: 2, q: 'How do I return an item?', a: 'Start a return from your order page within 30 days. Returns are free for unworn items.' },
  { id: 3, q: 'Can I change my order?', a: 'You can change the size or colour until the order ships.' },
];
const TEXT =
  'Our support team replies Monday to Saturday, 9:00 to 18:00. On Sundays we reply from 10:00 to 16:00. Gift cards never expire and work online only.';
const PAGES: Doc[] = [
  {
    id: 'p1',
    label: 'your-store.example/shipping',
    text: 'Standard delivery takes 2 to 4 working days. Express delivery arrives the next working day when you order before 14:00. Shipping is free on orders over 50 euros.',
    state: 'idle',
    progress: 0,
  },
  {
    id: 'p2',
    label: 'your-store.example/sizes',
    text: 'Our shoes run true to size. Between sizes, choose the larger one. A wide fit is available for the trail runner.',
    state: 'idle',
    progress: 0,
  },
];
const FILES: Doc[] = [
  {
    id: 'f1',
    label: 'care-guide.pdf',
    size: '1.2 MB',
    text: 'Clean leather with a dry cloth. Never wash the shoes in a washing machine. A waterproof spray every two months keeps them dry.',
    state: 'idle',
    progress: 0,
  },
  {
    id: 'f2',
    label: 'warranty.txt',
    size: '4 KB',
    text: 'Every pair has a two year warranty that covers manufacturing faults. Normal wear is not part of it.',
    state: 'idle',
    progress: 0,
  },
];
const ASK = ['Do you ship abroad?', 'Is shipping free?', 'When do you reply on Sunday?', 'What does the warranty cover?', 'Can I wash them?'];
const SEED_LINES: Line[] = [
  { from: 'sys', text: 'Invented store. Ask something, then train the bot and ask again.' },
  { from: 'me', text: 'Do you ship abroad?' },
  { from: 'bot', text: 'Happy to help! We ship to 30 countries. International orders arrive in 5 to 9 working days.', src: 'from Q&A: Do you ship abroad?' },
];
const STOP = new Set(
  'a an the is are do does did you your i we our my me it its to of in on for and or can how what when where which who why with be at by from this that there them they will would should could have has about any'.split(' '),
);
const CHANNELS: { v: Chan; t: string }[] = [
  { v: 'web', t: 'Website' },
  { v: 'email', t: 'Email' },
  { v: 'instagram', t: 'Instagram' },
];
const TONES: { v: Tone; t: string }[] = [
  { v: 'friendly', t: 'Friendly' },
  { v: 'formal', t: 'Formal' },
  { v: 'brief', t: 'Brief' },
];

const words = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9 ]+/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 1 && !STOP.has(w))
    .map((w) => (w.length > 4 ? w.replace(/(ing|ed|s)$/, '') : w));
const sentences = (s: string) => s.match(/[^.!?]+[.!?]/g)?.map((x) => x.trim()) ?? [s];
const overlap = (a: string[], b: Set<string>) => a.filter((w) => b.has(w)).length;

@Component({
  selector: 'mh-o2chat-bot',
  imports: [NgIcon],
  viewProviders: [
    provideIcons({
      phosphorArrowCounterClockwise,
      phosphorCheck,
      phosphorFileText,
      phosphorGlobe,
      phosphorPaperPlaneRight,
      phosphorPlus,
      phosphorRobot,
      phosphorTrash,
      phosphorUser,
    }),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="trainer card">
      <section class="train" aria-labelledby="o2b-train">
        <div class="head-row">
          <h3 id="o2b-train">Train</h3>
          <span class="mono kb">{{ chunks().length }} passages</span>
          <button type="button" class="reset" aria-label="Reset the sample bot" (click)="reset()">
            <ng-icon name="phosphorArrowCounterClockwise" aria-hidden="true" />
          </button>
        </div>

        <div class="seg src" role="group" aria-label="Training source">
          <button type="button" [attr.aria-pressed]="source() === 'qa'" (click)="source.set('qa')">Q&amp;A</button>
          <button type="button" [attr.aria-pressed]="source() === 'text'" (click)="source.set('text')">Text</button>
          <button type="button" [attr.aria-pressed]="source() === 'pages'" (click)="source.set('pages')">Pages</button>
          <button type="button" [attr.aria-pressed]="source() === 'files'" (click)="source.set('files')">Files</button>
        </div>

        <div class="pane">
          @switch (source()) {
            @case ('qa') {
              <ul class="pairs" role="list">
                @for (p of pairs(); track p.id) {
                  <li>
                    <div><b>{{ p.q }}</b><span>{{ p.a }}</span></div>
                    <button type="button" class="del" [attr.aria-label]="'Delete: ' + p.q" (click)="removePair(p.id)">
                      <ng-icon name="phosphorTrash" aria-hidden="true" />
                    </button>
                  </li>
                }
              </ul>
              <form class="add" (submit)="$event.preventDefault(); addPair()">
                <label class="sr-only" for="o2b-q">Question</label>
                <input id="o2b-q" class="input" placeholder="Question" [value]="newQ()" (input)="newQ.set($any($event.target).value)" />
                <label class="sr-only" for="o2b-a">Answer</label>
                <input id="o2b-a" class="input" placeholder="Answer" [value]="newA()" (input)="newA.set($any($event.target).value)" />
                <button type="submit" class="btn btn-ghost btn-sm" [disabled]="!newQ().trim() || !newA().trim()">
                  <ng-icon name="phosphorPlus" aria-hidden="true" /> Add
                </button>
              </form>
            }
            @case ('text') {
              <label class="field__label" for="o2b-text">Pasted text</label>
              <textarea id="o2b-text" class="textarea" rows="6" [value]="text()" (input)="text.set($any($event.target).value)"></textarea>
              <p class="hint">Every sentence becomes a passage the bot can quote.</p>
            }
            @case ('pages') {
              <ul class="docs" role="list">
                @for (d of pages(); track d.id) {
                  <li>
                    <ng-icon name="phosphorGlobe" aria-hidden="true" />
                    <div class="doc-t">
                      <b class="mono">{{ d.label }}</b>
                      @if (d.state === 'busy') {
                        <span class="bar" role="progressbar" aria-label="Crawling" [attr.aria-valuenow]="d.progress" aria-valuemin="0" aria-valuemax="100"><i [style.width.%]="d.progress"></i></span>
                      } @else {
                        <span>{{ d.state === 'done' ? sentences(d.text).length + ' passages from the page' : 'Not crawled yet' }}</span>
                      }
                    </div>
                    @if (d.state === 'done') {
                      <span class="ok"><ng-icon name="phosphorCheck" aria-hidden="true" /> Crawled</span>
                    } @else {
                      <button type="button" class="btn btn-ghost btn-sm" [disabled]="d.state === 'busy'" (click)="ingest('pages', d.id)">Crawl</button>
                    }
                  </li>
                }
              </ul>
            }
            @case ('files') {
              <ul class="docs" role="list">
                @for (d of files(); track d.id) {
                  <li>
                    <ng-icon name="phosphorFileText" aria-hidden="true" />
                    <div class="doc-t">
                      <b class="mono">{{ d.label }}</b>
                      @if (d.state === 'busy') {
                        <span class="bar" role="progressbar" aria-label="Uploading" [attr.aria-valuenow]="d.progress" aria-valuemin="0" aria-valuemax="100"><i [style.width.%]="d.progress"></i></span>
                      } @else {
                        <span>{{ d.size }}, {{ d.state === 'done' ? 'in the knowledge base' : 'not uploaded' }}</span>
                      }
                    </div>
                    @if (d.state === 'done') {
                      <span class="ok"><ng-icon name="phosphorCheck" aria-hidden="true" /> Trained</span>
                    } @else {
                      <button type="button" class="btn btn-ghost btn-sm" [disabled]="d.state === 'busy'" (click)="ingest('files', d.id)">Upload</button>
                    }
                  </li>
                }
              </ul>
              <p class="hint">PDF, Word, text or JSON, up to 10 MB each.</p>
            }
          }
        </div>

        <div class="tone">
          <div class="field">
            <label class="field__label" for="o2b-name">Bot name</label>
            <input id="o2b-name" class="input" maxlength="20" [value]="name()" (input)="name.set($any($event.target).value)" />
          </div>
          <div class="tones">
            @for (ch of channels; track ch.v) {
              <div class="field">
                <label class="field__label" [for]="'o2b-t-' + ch.v">{{ ch.t }} tone</label>
                <select class="select" [id]="'o2b-t-' + ch.v" [value]="tones()[ch.v]" (change)="setTone(ch.v, $any($event.target).value)">
                  @for (t of toneList; track t.v) {
                    <option [value]="t.v" [selected]="t.v === tones()[ch.v]">{{ t.t }}</option>
                  }
                </select>
              </div>
            }
          </div>
        </div>
      </section>

      <section class="test" aria-labelledby="o2b-test">
        <div class="head-row">
          <h3 id="o2b-test">Test</h3>
          <label class="sr-only" for="o2b-ch">Test on channel</label>
          <select id="o2b-ch" class="select ch" [value]="chan()" (change)="chan.set($any($event.target).value)">
            @for (ch of channels; track ch.v) {
              <option [value]="ch.v" [selected]="ch.v === chan()">{{ ch.t }}</option>
            }
          </select>
        </div>

        <div role="log" aria-live="polite" aria-label="Bot test chat">
          <ol class="chat" role="list">
            @for (l of lines(); track $index) {
              <li [class]="l.from">
                @if (l.from === 'bot') {
                  <span class="who"><ng-icon name="phosphorRobot" aria-hidden="true" /> {{ name() || 'Bot' }}</span>
                }
                <span class="bubble">{{ l.text }}</span>
                @if (l.src) {
                  <span class="src-tag mono">{{ l.src }}</span>
                }
              </li>
            }
          </ol>
        </div>

        <div class="asks" role="group" aria-label="Try a question">
          @for (q of ask; track q) {
            <button type="button" class="chip" (click)="askQ(q)">{{ q }}</button>
          }
        </div>

        <form class="reply" (submit)="$event.preventDefault(); askQ(draft())">
          <label class="sr-only" for="o2b-ask">Ask the bot</label>
          <input id="o2b-ask" class="input" placeholder="Ask the bot something" autocomplete="off" [value]="draft()" (input)="draft.set($any($event.target).value)" />
          <button type="submit" class="send" [disabled]="!draft().trim()" aria-label="Ask">
            <ng-icon name="phosphorPaperPlaneRight" aria-hidden="true" />
          </button>
        </form>
      </section>
    </div>
  `,
  styles: `
    :host {
      display: block;
    }
    .trainer {
      display: grid;
      grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
      gap: 20px;
      padding: 20px;
    }
    .train,
    .test {
      display: grid;
      align-content: start;
      gap: 12px;
      min-width: 0;
    }
    .head-row {
      display: flex;
      align-items: center;
      gap: 10px;
      min-height: 44px;

      h3 {
        font-size: 15px;
        flex: 1;
      }
    }
    .kb {
      font-size: 12px;
      color: var(--o-blue-text);
      background: var(--o-blue-soft);
      padding: 3px 10px;
      border-radius: 999px;
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
    .src {
      justify-self: start;
      max-width: 100%;
      overflow-x: auto;

      button {
        min-height: 36px;
      }
    }
    .pane {
      display: grid;
      gap: 10px;
      align-content: start;
      min-height: 232px;
      padding: 12px;
      border-radius: var(--r-inner);
      background: var(--bg);
      border: 1px solid var(--line);
    }
    .pairs {
      display: grid;
      gap: 6px;

      li {
        display: flex;
        gap: 8px;
        align-items: center;
        padding: 8px 6px 8px 12px;
        border-radius: 10px;
        background: var(--surface);
        border: 1px solid var(--line);
      }
      div {
        flex: 1;
        min-width: 0;
        display: grid;
      }
      b {
        font-size: 13px;
        font-weight: 600;
      }
      span {
        font-size: 12.5px;
        color: var(--ink-2);
      }
    }
    .del {
      width: 44px;
      height: 44px;
      flex-shrink: 0;
      display: grid;
      place-items: center;
      border-radius: 999px;
      color: var(--ink-2);
      font-size: 16px;

      &:hover {
        background: var(--o-red-soft);
        color: var(--o-red-text);
      }
    }
    .add {
      display: grid;
      grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) auto;
      gap: 6px;

      .input {
        height: 44px;
        font-size: 13.5px;
        background: var(--surface);
      }
      .btn {
        height: 44px;
      }
      .btn[disabled] {
        opacity: 0.45;
        cursor: not-allowed;
      }
    }
    .textarea {
      font-size: 13.5px;
      background: var(--surface);
    }
    .hint {
      font-size: 12px;
      color: var(--muted);
    }
    .docs {
      display: grid;
      gap: 6px;

      li {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 8px 8px 8px 12px;
        border-radius: 10px;
        background: var(--surface);
        border: 1px solid var(--line);

        > ng-icon {
          font-size: 18px;
          color: var(--o-blue-text);
          flex-shrink: 0;
        }
      }
      .btn {
        height: 40px;
      }
    }
    .doc-t {
      flex: 1;
      min-width: 0;
      display: grid;
      gap: 3px;

      b {
        font-size: 12px;
        font-weight: 500;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      span {
        font-size: 12px;
        color: var(--muted);
      }
    }
    .bar {
      height: 6px;
      border-radius: 999px;
      background: var(--surface-2);
      overflow: hidden;

      i {
        display: block;
        height: 100%;
        background: var(--o-grad);
        transition: width 0.2s linear;
      }
    }
    .ok {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      font-size: 12px;
      font-weight: 500;
      color: var(--o-green-text);
    }
    .tone {
      display: grid;
      grid-template-columns: minmax(0, 0.8fr) minmax(0, 2.2fr);
      gap: 10px;
      align-items: end;

      .input,
      .select {
        height: 44px;
        font-size: 13.5px;
      }
    }
    .tones {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 8px;
    }
    .ch {
      width: auto;
      height: 44px;
      font-size: 13.5px;
    }
    .chat {
      display: flex;
      flex-direction: column;
      gap: 8px;
      height: 300px;
      overflow-y: auto;
      padding: 12px;
      border-radius: var(--r-inner);
      background: var(--bg);
      border: 1px solid var(--line);
      overscroll-behavior: contain;

      li {
        display: grid;
        justify-items: start;
        gap: 3px;
        max-width: 88%;
      }
      .me {
        align-self: flex-end;
        justify-items: end;
      }
      .sys {
        align-self: center;
        max-width: 100%;
        font-size: 12px;
        color: var(--muted);
      }
    }
    .who {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      font-size: 12px;
      color: var(--muted);
    }
    .bubble {
      padding: 8px 12px;
      border-radius: 14px 14px 14px 4px;
      background: var(--surface);
      border: 1px solid var(--line);
      font-size: 13px;
      line-height: 1.45;
      white-space: pre-line;
    }
    .me .bubble {
      border-radius: 14px 14px 4px 14px;
      background: var(--o-blue-text);
      border-color: transparent;
      color: #fff;
    }
    .sys .bubble {
      background: transparent;
      border: 0;
      padding: 0;
      font-size: 12px;
      color: var(--muted);
    }
    .src-tag {
      font-size: 12px;
      color: var(--o-blue-text);
    }
    .asks {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;

      .chip {
        height: 34px;
      }
    }
    .reply {
      display: flex;
      gap: 6px;

      .input {
        flex: 1;
        min-width: 0;
        height: 44px;
        font-size: 14px;
      }
    }
    .send {
      width: 44px;
      height: 44px;
      flex-shrink: 0;
      display: grid;
      place-items: center;
      border-radius: 999px;
      background: var(--cta);
      color: var(--cta-ink);
      font-size: 17px;

      &[disabled] {
        opacity: 0.4;
        cursor: not-allowed;
      }
    }
    @media (max-width: 900px) {
      .trainer {
        grid-template-columns: minmax(0, 1fr);
        padding: 14px;
      }
    }
    @media (max-width: 520px) {
      .add {
        grid-template-columns: minmax(0, 1fr);
      }
      .tone {
        grid-template-columns: minmax(0, 1fr);
      }
      .tones {
        grid-template-columns: minmax(0, 1fr);
      }
    }
    @media (max-width: 374px) {
      .src button {
        padding: 0 11px;
      }
    }
  `,
})
export class O2chatBotDemo {
  protected readonly channels = CHANNELS;
  protected readonly toneList = TONES;
  protected readonly ask = ASK;
  protected readonly sentences = sentences;

  protected readonly source = signal<Source>('qa');
  protected readonly pairs = signal<Pair[]>(PAIRS);
  protected readonly text = signal(TEXT);
  protected readonly pages = signal<Doc[]>(PAGES);
  protected readonly files = signal<Doc[]>(FILES);
  protected readonly newQ = signal('');
  protected readonly newA = signal('');
  protected readonly name = signal('Ava');
  protected readonly tones = signal<Record<Chan, Tone>>({ web: 'friendly', email: 'formal', instagram: 'brief' });
  protected readonly chan = signal<Chan>('web');
  protected readonly draft = signal('');
  protected readonly lines = signal<Line[]>(SEED_LINES);

  private nextPair = 4;
  private timers = new Set<ReturnType<typeof setTimeout>>();

  constructor() {
    inject(DestroyRef).onDestroy(() => this.timers.forEach(clearTimeout));
  }

  /** Everything the bot may quote: Q&A pairs whole, everything else one sentence per passage. */
  protected readonly chunks = computed<Chunk[]>(() => [
    ...this.pairs().map((p) => ({ kind: 'Q&A' as const, label: p.q, text: p.a, q: p.q })),
    ...sentences(this.text()).filter(Boolean).map((t) => ({ kind: 'Text' as const, label: 'pasted text', text: t })),
    ...this.pages()
      .filter((d) => d.state === 'done')
      .flatMap((d) => sentences(d.text).map((t) => ({ kind: 'Page' as const, label: d.label.replace('your-store.example', ''), text: t }))),
    ...this.files()
      .filter((d) => d.state === 'done')
      .flatMap((d) => sentences(d.text).map((t) => ({ kind: 'File' as const, label: d.label, text: t }))),
  ]);

  private later(fn: () => void, ms: number): void {
    const t = setTimeout(() => {
      this.timers.delete(t);
      fn();
    }, ms);
    this.timers.add(t);
  }

  protected setTone(ch: Chan, t: Tone): void {
    this.tones.update((m) => ({ ...m, [ch]: t }));
  }

  protected addPair(): void {
    const q = this.newQ().trim();
    const a = this.newA().trim();
    if (!q || !a) return;
    this.pairs.update((l) => [...l, { id: this.nextPair++, q, a }]);
    this.newQ.set('');
    this.newA.set('');
  }

  protected removePair(id: number): void {
    this.pairs.update((l) => l.filter((p) => p.id !== id));
  }

  /** A crawl or an upload: a progress bar, then its passages join the knowledge base. */
  protected ingest(kind: 'pages' | 'files', id: string): void {
    const list = kind === 'pages' ? this.pages : this.files;
    const set = (patch: Partial<Doc>) => list.update((l) => l.map((d) => (d.id === id ? { ...d, ...patch } : d)));
    set({ state: 'busy', progress: 0 });
    const step = (p: number) => {
      if (p >= 100) return set({ state: 'done', progress: 100 });
      set({ progress: p });
      this.later(() => step(p + 20), 180);
    };
    step(10);
  }

  protected askQ(raw: string): void {
    const q = raw.trim();
    if (!q) return;
    this.draft.set('');
    this.lines.update((l) => [...l, { from: 'me', text: q }]);
    this.scroll();
    this.later(() => {
      this.lines.update((l) => [...l, this.answer(q)]);
      this.scroll();
    }, 500);
  }

  private answer(q: string): Line {
    const qw = words(q);
    let best: { c: Chunk; score: number } | null = null;
    for (const c of this.chunks()) {
      const body = new Set(words(c.text));
      const score = c.q ? overlap(qw, new Set(words(c.q))) * 2 + overlap(qw, body) : overlap(qw, body);
      if (!best || score > best.score) best = { c, score };
    }
    const tone = this.tones()[this.chan()];
    const name = this.name().trim() || 'the bot';
    if (!best || best.score < Math.min(2, qw.length) || best.score === 0) {
      const text =
        tone === 'formal'
          ? 'I am sorry, I do not have that information. A member of our team will reply shortly.'
          : tone === 'brief'
            ? 'Not sure. Passing you to the team.'
            : 'Good question! I don’t know that one yet, so I’m passing you to a person.';
      return { from: 'bot', text: this.signOff(text, tone, name), src: 'no match: handed to an agent, New and unassigned' };
    }
    const a = tone === 'brief' ? sentences(best.c.text)[0] : best.c.text;
    const lead = tone === 'formal' ? 'Thank you for your question. ' : tone === 'friendly' ? 'Happy to help! ' : '';
    return { from: 'bot', text: this.signOff(lead + a, tone, name), src: `from ${best.c.kind}: ${best.c.label}` };
  }

  /** Email answers end like a letter; other channels stay chat-shaped. */
  private signOff(text: string, tone: Tone, name: string): string {
    if (this.chan() !== 'email') return text;
    return `${text}\n\n${tone === 'formal' ? 'Kind regards' : 'Thanks'},\n${name}`;
  }

  private scroll(): void {
    this.later(() => {
      const el = document.querySelector('mh-o2chat-bot .chat');
      if (el) el.scrollTop = el.scrollHeight;
    }, 30);
  }

  protected reset(): void {
    this.timers.forEach(clearTimeout);
    this.timers.clear();
    this.source.set('qa');
    this.pairs.set(PAIRS);
    this.text.set(TEXT);
    this.pages.set(PAGES);
    this.files.set(FILES);
    this.name.set('Ava');
    this.tones.set({ web: 'friendly', email: 'formal', instagram: 'brief' });
    this.chan.set('web');
    this.lines.set(SEED_LINES);
    this.nextPair = 4;
  }
}
