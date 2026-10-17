import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  computed,
  inject,
  signal,
} from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  phosphorArrowClockwise,
  phosphorArrowCounterClockwise,
  phosphorDownloadSimple,
  phosphorPause,
  phosphorPlay,
  phosphorX,
} from '@ng-icons/phosphor-icons/regular';
import { COLUMNS, StoreId, TABLES, duration, int, sampleCsv, saveText, storeById } from './dmax.data';

/**
 * The extraction console's live view, as my own mockup with invented jobs. It follows the real app: the page polls
 * a status endpoint at the operator's rate (1, 3 or 5 s, the default 3), tables run one after another, every row
 * ends up extracted, failed or duplicate, and a run can be paused, resumed or cancelled (cancel confirms first).
 * Retrying failed rows and the CSV download are the sample's own: the file holds 25 invented rows.
 * Polling stops when the panel leaves the screen; with reduced motion it never runs on its own ("Poll now" does).
 */
type State = 'running' | 'paused' | 'done' | 'cancelled';
type Kind = 'Incremental' | 'Direct' | 'Statements';

interface TableRun {
  id: string;
  name: string;
  total: number;
  ok: number;
  failed: number;
  dup: number;
}

interface Job {
  id: number;
  kind: Kind;
  store: StoreId;
  state: State;
  elapsed: number;
  retry: boolean;
  tables: TableRun[];
}

const RATES = [1, 3, 5];
/** Share of processed rows that fail or turn out to be duplicates, in the sample. */
const FAIL = 0.0006;
const DUP = 0.0021;

const run = (id: string, total: number, done = 0, failed = 0, dup = 0): TableRun => ({
  id,
  name: TABLES.find((t) => t.id === id)?.name ?? id,
  total,
  ok: done - failed - dup,
  failed,
  dup,
});

function seed(): Job[] {
  return [
    {
      id: 1047,
      kind: 'Incremental',
      store: 'db2',
      state: 'running',
      elapsed: 41,
      retry: false,
      tables: [
        run('accounts', 30_828, 30_828, 17, 64),
        run('customers', 26_215, 18_402, 9, 38),
        run('transfers', 82_054),
        run('entries', 447_365),
      ],
    },
    {
      id: 1046,
      kind: 'Direct',
      store: 'mongo',
      state: 'paused',
      elapsed: 188,
      retry: false,
      tables: [run('transfers', 3_418_900, 1_299_182, 779, 2728)],
    },
    {
      id: 1045,
      kind: 'Statements',
      store: 'mongo',
      state: 'done',
      elapsed: 74,
      retry: false,
      tables: [run('entries', 510_690, 510_690, 214, 1072)],
    },
    {
      id: 1044,
      kind: 'Direct',
      store: 'file',
      state: 'done',
      elapsed: 102,
      retry: false,
      tables: [run('accounts', 1_284_500, 1_284_500, 0, 1206)],
    },
  ];
}

const sum = (j: Job, k: 'total' | 'ok' | 'failed' | 'dup') => j.tables.reduce((s, t) => s + t[k], 0);
const processed = (t: TableRun) => t.ok + t.failed + t.dup;
const pct = (n: number, of: number) => (of ? Math.min(100, (n / of) * 100) : 0);

@Component({
  selector: 'mh-dmax-queue',
  imports: [NgIcon],
  viewProviders: [
    provideIcons({
      phosphorArrowClockwise,
      phosphorArrowCounterClockwise,
      phosphorDownloadSimple,
      phosphorPause,
      phosphorPlay,
      phosphorX,
    }),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="console card">
      <div class="bar">
        <span class="status-pill">
          <span class="blip" [class.is-on]="live()" aria-hidden="true"></span>
          {{ pollLabel() }}
        </span>
        <div class="bar-acts">
          <div class="seg" role="group" aria-label="Refresh rate">
            @for (r of rates; track r) {
              <button type="button" [attr.aria-pressed]="rate() === r" (click)="setRate(r)">{{ r }} s</button>
            }
          </div>
          <button type="button" class="btn btn-ghost btn-sm" (click)="poll()">
            <ng-icon name="phosphorArrowClockwise" aria-hidden="true" /> Poll now
          </button>
          <button type="button" class="icon-btn" aria-label="Reset the sample jobs" (click)="reset()">
            <ng-icon name="phosphorArrowCounterClockwise" aria-hidden="true" />
          </button>
        </div>
      </div>

      <div class="panes">
        <ul class="jobs" role="list" aria-label="Extraction jobs">
          @for (j of jobs(); track j.id) {
            <li>
              <button type="button" class="job" [attr.aria-pressed]="selectedId() === j.id" (click)="selectedId.set(j.id)">
                <span class="j-top">
                  <b class="mono">Job {{ j.id }}</b>
                  <span class="state" [attr.data-s]="j.state">{{ stateLabel(j) }}</span>
                </span>
                <span class="j-sub">{{ j.kind }} on {{ storeLabel(j.store) }}</span>
                <span class="track" aria-hidden="true"><i [style.width.%]="progress(j)"></i></span>
              </button>
            </li>
          }
        </ul>

        @if (selected(); as j) {
          <section class="detail" [attr.aria-label]="'Job ' + j.id">
            <header class="d-head">
              <div>
                <h3>Job {{ j.id }}, {{ j.kind }} on {{ storeLabel(j.store) }}</h3>
                <p class="mono">
                  {{ progress(j).toFixed(1) }}% · {{ duration(j.elapsed) }} elapsed
                  @if (j.state === 'running') {
                    · {{ int(rateOf(j)) }} rec/s
                  }
                </p>
              </div>
              <span class="state" [attr.data-s]="j.state">{{ stateLabel(j) }}</span>
            </header>

            <dl class="counts">
              <div class="c-ok">
                <dt>Extracted</dt>
                <dd class="mono">{{ int(total(j, 'ok')) }}</dd>
              </div>
              <div class="c-fail">
                <dt>Failed</dt>
                <dd class="mono">{{ int(total(j, 'failed')) }}</dd>
              </div>
              <div class="c-dup">
                <dt>Duplicate</dt>
                <dd class="mono">{{ int(total(j, 'dup')) }}</dd>
              </div>
              <div>
                <dt>Total</dt>
                <dd class="mono">{{ int(total(j, 'total')) }}</dd>
              </div>
            </dl>

            <table class="tbl">
              <caption class="sr-only">Rows per table for job {{ j.id }}</caption>
              <thead>
                <tr>
                  <th scope="col">Table</th>
                  <th scope="col">Progress</th>
                  <th scope="col" class="num">Failed</th>
                </tr>
              </thead>
              <tbody>
                @for (t of j.tables; track t.id) {
                  <tr>
                    <th scope="row" class="mono">@for (part of t.name.split('_'); track $index) {@if ($index) {_<wbr />}{{ part }}}</th>
                    <td>
                      <span class="t-prog">
                        <span class="track" aria-hidden="true"><i [style.width.%]="tableProgress(t)"></i></span>
                        <span class="mono">{{ int(done(t)) }} / {{ int(t.total) }}</span>
                      </span>
                    </td>
                    <td class="num mono" [class.bad]="t.failed > 0">{{ int(t.failed) }}</td>
                  </tr>
                }
              </tbody>
            </table>

            @if (confirming() === j.id) {
              <div class="confirm" role="alertdialog" aria-labelledby="dx-cancel-q">
                <p id="dx-cancel-q">Cancel job {{ j.id }}? Rows extracted so far stay in the report.</p>
                <div class="acts">
                  <button type="button" class="btn btn-sm danger" (click)="cancel(j.id)">Yes, cancel</button>
                  <button type="button" class="btn btn-ghost btn-sm" (click)="confirming.set(0)">Keep running</button>
                </div>
              </div>
            } @else {
              <div class="acts">
                @switch (j.state) {
                  @case ('running') {
                    <button type="button" class="btn btn-ghost btn-sm" (click)="setState(j.id, 'paused')">
                      <ng-icon name="phosphorPause" aria-hidden="true" /> Pause
                    </button>
                    <button type="button" class="btn btn-ghost btn-sm" (click)="confirming.set(j.id)">
                      <ng-icon name="phosphorX" aria-hidden="true" /> Cancel
                    </button>
                  }
                  @case ('paused') {
                    <button type="button" class="btn btn-solid btn-sm" (click)="setState(j.id, 'running')">
                      <ng-icon name="phosphorPlay" aria-hidden="true" /> Resume
                    </button>
                    <button type="button" class="btn btn-ghost btn-sm" (click)="confirming.set(j.id)">
                      <ng-icon name="phosphorX" aria-hidden="true" /> Cancel
                    </button>
                  }
                  @case ('done') {
                    <button type="button" class="btn btn-solid btn-sm" (click)="download(j)">
                      <ng-icon name="phosphorDownloadSimple" aria-hidden="true" /> Download CSV
                    </button>
                    @if (total(j, 'failed') > 0) {
                      <button type="button" class="btn btn-ghost btn-sm" (click)="retry(j.id)">
                        <ng-icon name="phosphorArrowClockwise" aria-hidden="true" /> Retry {{ int(total(j, 'failed')) }} failed
                      </button>
                    }
                  }
                  @case ('cancelled') {
                    <p class="mono quiet">Cancelled. Its rows so far are in the report.</p>
                  }
                }
              </div>
            }
          </section>
        }
      </div>
      <p class="mono sample" aria-live="polite">{{ note() }}</p>
    </div>
  `,
  styles: `
    :host {
      display: block;
    }
    .console {
      display: grid;
      gap: 14px;
      padding: 16px;
      background: var(--d-card);
    }
    .bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 10px;

      .status-pill {
        background: var(--bg);
      }
      .blip.is-on,
      .blip.is-on::before,
      .blip.is-on::after {
        background: var(--d-green);
        border-color: var(--d-green);
      }
    }
    .bar-acts {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 8px;

      .seg {
        background: var(--bg);
      }
      .seg button {
        height: 34px;
        font-size: 13px;
        font-family: var(--font-mono);
      }
      .seg [aria-pressed='true'] {
        background: var(--surface-2);
      }
      .icon-btn {
        width: 44px;
        height: 44px;
        background: var(--bg);
        font-size: 17px;
      }
      .btn-sm {
        height: 44px;
      }
    }
    .panes {
      display: grid;
      grid-template-columns: 260px minmax(0, 1fr);
      gap: 12px;
      align-items: start;
    }
    .jobs {
      display: grid;
      gap: 6px;
    }
    .job {
      width: 100%;
      display: grid;
      gap: 4px;
      padding: 10px 12px;
      border-radius: var(--r-inner);
      border: 1px solid var(--line);
      background: var(--bg);
      text-align: left;
      transition: border-color var(--t-base) var(--ease);

      &:hover {
        border-color: var(--line-strong);
      }
      &[aria-pressed='true'] {
        border-color: var(--d-green);
        background: var(--surface);
      }
    }
    .j-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;

      b {
        font-size: 13px;
        font-weight: 500;
      }
    }
    .j-sub {
      font-size: 12.5px;
      color: var(--muted);
    }
    .track {
      display: block;
      height: 4px;
      border-radius: 2px;
      background: var(--surface-2);
      overflow: hidden;

      i {
        display: block;
        height: 100%;
        border-radius: 2px;
        background: var(--d-gradient);
      }
    }
    @media (prefers-reduced-motion: no-preference) {
      .track i {
        transition: width 0.6s var(--ease);
      }
    }
    .state {
      flex-shrink: 0;
      padding: 1px 8px;
      border-radius: 999px;
      font-size: 12px;
      font-weight: 500;
      background: var(--surface-2);
      color: var(--ink-2);

      &[data-s='running'] {
        background: var(--d-green-soft);
        color: var(--d-green-text);
      }
      &[data-s='paused'] {
        background: var(--d-amber-soft);
        color: var(--d-amber-text);
      }
      &[data-s='done'] {
        background: var(--d-blue-soft);
        color: var(--d-blue-text);
      }
      &[data-s='cancelled'] {
        background: var(--d-red-soft);
        color: var(--d-red-text);
      }
    }
    .detail {
      grid-template-columns: minmax(0, 1fr);
      display: grid;
      gap: 12px;
      padding: 14px;
      border-radius: var(--r-inner);
      background: var(--bg);
      border: 1px solid var(--line);
      min-width: 0;
    }
    .d-head {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 10px;

      h3 {
        font-size: 15px;
      }
      p {
        margin-top: 2px;
        font-size: 12px;
        color: var(--muted);
      }
    }
    .counts {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 6px;
      margin: 0;

      div {
        padding: 8px 10px;
        border-radius: 10px;
        background: var(--surface);
        border: 1px solid var(--line-strong);
        min-width: 0;
      }
      .c-ok {
        border-color: var(--d-green);
      }
      .c-fail {
        border-color: var(--d-red);
      }
      .c-dup {
        border-color: var(--d-amber);
      }
      dt {
        font-size: 12px;
        color: var(--muted);
      }
      dd {
        margin: 2px 0 0;
        font-size: 14px;
        font-weight: 500;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }
    .tbl {
      width: 100%;
      border-collapse: collapse;
      font-size: 12.5px;

      th,
      td {
        padding: 7px 6px;
        border-top: 1px solid var(--line);
        text-align: left;
        font-weight: 400;
      }
      thead th {
        border-top: 0;
        font-size: 12px;
        color: var(--muted);
      }
      tbody th {
        font-size: 12px;
        color: var(--ink);
        white-space: nowrap;
      }
      .num {
        text-align: right;
      }
      .bad {
        color: var(--d-red-text);
      }
    }
    .t-prog {
      display: grid;
      gap: 4px;

      .mono {
        font-size: 12px;
        color: var(--muted);
      }
    }
    .acts {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      align-items: center;

      .btn-sm {
        height: 44px;
      }
    }
    .confirm {
      display: grid;
      gap: 10px;
      padding: 12px;
      border-radius: 10px;
      background: var(--d-red-soft);

      p {
        font-size: 13.5px;
      }
    }
    .danger {
      background: var(--d-red);
      color: #fff;

      &:hover {
        background: #9c1b3d;
      }
    }
    .quiet {
      font-size: 12px;
      color: var(--muted);
    }
    .sample {
      font-size: 12px;
      color: var(--muted);
      min-height: 14px;
    }
    @media (max-width: 820px) {
      .panes {
        grid-template-columns: minmax(0, 1fr);
      }
      .jobs {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
    }
    @media (max-width: 520px) {
      .console {
        padding: 12px;
      }
      .jobs {
        grid-template-columns: 1fr;
      }
      .counts {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
      .detail {
        padding: 12px;
      }
    }
    /* Smallest phones: long table names break at their underscores so the row counts stay on one line */
    @media (max-width: 374px) {
      .tbl tbody th {
        white-space: normal;
      }
      .tbl th,
      .tbl td {
        padding: 7px 3px;
      }
      .t-prog .mono {
        white-space: nowrap;
      }
    }
  `,
})
export class DmaxQueueDemo {
  protected readonly rates = RATES;
  protected readonly int = int;
  protected readonly duration = duration;

  protected readonly jobs = signal<Job[]>(seed());
  protected readonly selectedId = signal(1047);
  protected readonly rate = signal(3);
  protected readonly confirming = signal(0);
  protected readonly note = signal('Sample jobs. Pause one, resume another, retry the failed rows.');
  private readonly visible = signal(false);
  private readonly reduce = signal(true);

  protected readonly selected = computed(() => this.jobs().find((j) => j.id === this.selectedId()));
  protected readonly running = computed(() => this.jobs().some((j) => j.state === 'running'));
  /** Polling runs on its own only on screen, with motion allowed and something to watch. */
  protected readonly live = computed(() => this.running() && this.visible() && !this.reduce());
  protected readonly pollLabel = computed(() => {
    if (!this.running()) return 'No job running';
    if (this.reduce()) return 'Use Poll now';
    return this.visible() ? `Polling every ${this.rate()} s` : 'Paused off-screen';
  });

  private timer: ReturnType<typeof setTimeout> | undefined;
  private io: IntersectionObserver | undefined;
  private readonly host: ElementRef<HTMLElement> = inject(ElementRef);

  constructor() {
    inject(DestroyRef).onDestroy(() => {
      clearTimeout(this.timer);
      this.io?.disconnect();
    });
    afterNextRender(() => {
      this.reduce.set(matchMedia('(prefers-reduced-motion: reduce)').matches);
      if (typeof IntersectionObserver === 'undefined') return;
      this.io = new IntersectionObserver(([e]) => {
        this.visible.set(e.isIntersecting);
        this.schedule();
      });
      this.io.observe(this.host.nativeElement);
    });
  }

  protected stateLabel(j: Job): string {
    if (j.state === 'running') return j.retry ? 'Retrying' : 'Running';
    return j.state === 'done' ? 'Complete' : j.state === 'paused' ? 'Paused' : 'Cancelled';
  }

  protected storeLabel(id: StoreId): string {
    return storeById(id).label;
  }

  protected total(j: Job, k: 'total' | 'ok' | 'failed' | 'dup'): number {
    return sum(j, k);
  }

  protected done(t: TableRun): number {
    return processed(t);
  }

  protected progress(j: Job): number {
    return pct(j.tables.reduce((s, t) => s + processed(t), 0), sum(j, 'total'));
  }

  protected tableProgress(t: TableRun): number {
    return pct(processed(t), t.total);
  }

  protected rateOf(j: Job): number {
    return storeById(j.store).rate;
  }

  protected setRate(r: number): void {
    this.rate.set(r);
    this.note.set(`Status now polled every ${r} s. The real console remembers this per browser.`);
    this.schedule();
  }

  protected setState(id: number, state: State): void {
    this.patch(id, (j) => ({ ...j, state }));
    this.note.set(state === 'paused' ? `Job ${id} paused where it stopped.` : `Job ${id} resumed.`);
    this.schedule();
  }

  protected cancel(id: number): void {
    this.confirming.set(0);
    this.patch(id, (j) => ({ ...j, state: 'cancelled' }));
    this.note.set(`Job ${id} cancelled.`);
  }

  protected retry(id: number): void {
    // Failed rows go back to the queue and run again; the sample lets every retried row through.
    this.patch(id, (j) => ({ ...j, state: 'running', retry: true, tables: j.tables.map((t) => ({ ...t, failed: 0 })) }));
    this.note.set(`Retrying the failed rows of job ${id}.`);
    this.schedule();
  }

  protected download(j: Job): void {
    const table = j.tables[0];
    saveText(`dmax-job-${j.id}-${table.name.toLowerCase()}-sample.csv`, sampleCsv(COLUMNS[table.id] ?? [], 25));
    this.note.set(`Downloaded a 25-row sample of job ${j.id}. The real file has every extracted row.`);
  }

  /** One status poll: every running job advances by its store's rate times the polling interval. */
  protected poll(): void {
    const secs = this.rate();
    this.jobs.update((jobs) => jobs.map((j) => (j.state === 'running' ? this.advance(j, secs) : j)));
    const finished = this.jobs().find((j) => j.state === 'done' && j.retry);
    if (finished) {
      this.patch(finished.id, (j) => ({ ...j, retry: false }));
      this.note.set(`Job ${finished.id} complete: every failed row went through on retry.`);
    }
    this.schedule();
  }

  protected reset(): void {
    this.jobs.set(seed());
    this.selectedId.set(1047);
    this.confirming.set(0);
    this.rate.set(3);
    this.note.set('Sample jobs reset.');
    this.schedule();
  }

  private advance(j: Job, secs: number): Job {
    let budget = storeById(j.store).rate * secs;
    const fail = j.retry ? 0 : FAIL;
    const dup = j.retry ? 0 : DUP;
    // Tables run one after another, as in the console.
    const tables = j.tables.map((t) => {
      const left = t.total - processed(t);
      if (budget <= 0 || left <= 0) return t;
      const n = Math.min(left, budget);
      budget -= n;
      const f = Math.round(n * fail);
      const d = Math.round(n * dup);
      return { ...t, ok: t.ok + n - f - d, failed: t.failed + f, dup: t.dup + d };
    });
    const complete = tables.every((t) => processed(t) >= t.total);
    return { ...j, tables, elapsed: j.elapsed + secs, state: complete ? 'done' : 'running' };
  }

  private patch(id: number, fn: (j: Job) => Job): void {
    this.jobs.update((jobs) => jobs.map((j) => (j.id === id ? fn(j) : j)));
  }

  private schedule(): void {
    clearTimeout(this.timer);
    if (!this.live()) return;
    this.timer = setTimeout(() => this.poll(), this.rate() * 1000);
  }
}
