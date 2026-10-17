import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { phosphorArrowCounterClockwise, phosphorPlay } from '@ng-icons/phosphor-icons/regular';
import { STORES, StoreId, TABLES, duration, int, size, storeById, tableById } from './dmax.data';

/**
 * Hero mockup of a DMAX extraction console's start panel (my own redraw, not a screenshot). It follows the real
 * rules: one console per store, three ways to extract (incremental across every enabled table, one table direct, or
 * statement entries), and statement extraction only on the MongoDB console. The estimate is rows times average row
 * size, and time at the store's sample rate. Tables, sizes and rates are invented.
 */
type Mode = 'incremental' | 'direct' | 'statements';

const MODES: { id: Mode; label: string }[] = [
  { id: 'incremental', label: 'Incremental' },
  { id: 'direct', label: 'Direct' },
  { id: 'statements', label: 'Statements' },
];

const PERIODS = [
  { days: 7, label: '7 days' },
  { days: 30, label: '30 days' },
  { days: 90, label: '90 days' },
  { days: 365, label: '1 year' },
];

/** Share of each table that changed since the last run, for incremental estimates. */
const CHANGED = 0.024;
/** Days of history in the sample statement table. */
const HISTORY_DAYS = 1095;

@Component({
  selector: 'mh-dmax-job',
  imports: [NgIcon],
  viewProviders: [provideIcons({ phosphorArrowCounterClockwise, phosphorPlay })],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="job card card--lift">
      <header class="j-head">
        <span class="mark"><img src="/images/dmax/dmax-mark.webp" width="28" height="28" alt="" /></span>
        <div>
          <h2>New extraction</h2>
          <p>{{ store().label }} console, sample data</p>
        </div>
        <button type="button" class="reset" aria-label="Reset the sample job" (click)="reset()">
          <ng-icon name="phosphorArrowCounterClockwise" aria-hidden="true" />
        </button>
      </header>

      <div class="row">
        <span class="mono lbl" id="dx-store">Store</span>
        <div class="seg" role="group" aria-labelledby="dx-store">
          @for (s of stores; track s.id) {
            <button type="button" [attr.aria-pressed]="storeId() === s.id" (click)="pickStore(s.id)">{{ s.label }}</button>
          }
        </div>
      </div>

      <div class="modes" role="group" aria-label="Extraction type">
        @for (m of modes; track m.id) {
          <button
            type="button"
            class="mode"
            [attr.aria-pressed]="mode() === m.id"
            [disabled]="m.id === 'statements' && storeId() !== 'mongo'"
            (click)="mode.set(m.id)"
          >
            {{ m.label }}
          </button>
        }
      </div>

      <div class="body">
        @switch (mode()) {
          @case ('incremental') {
            <p class="mono lbl" id="dx-tables">Enabled tables, rows changed since the last run</p>
            <div class="chips" role="group" aria-labelledby="dx-tables">
              @for (t of tables; track t.id) {
                <button type="button" class="chip" [attr.aria-pressed]="enabled().includes(t.id)" (click)="toggle(t.id)">
                  {{ t.name }}
                </button>
              }
            </div>
          }
          @case ('direct') {
            <label class="mono lbl" for="dx-table">Table, extracted in full</label>
            <select id="dx-table" class="select" (change)="tableId.set($any($event.target).value)">
              @for (t of tables; track t.id) {
                <option [value]="t.id" [selected]="t.id === tableId()">{{ t.name }}, {{ int(t.rows) }} rows</option>
              }
            </select>
          }
          @case ('statements') {
            <p class="mono lbl" id="dx-period">Statement entries from the last</p>
            <div class="chips" role="group" aria-labelledby="dx-period">
              @for (p of periods; track p.days) {
                <button type="button" class="chip" [attr.aria-pressed]="days() === p.days" (click)="days.set(p.days)">
                  {{ p.label }}
                </button>
              }
            </div>
          }
        }
        @if (storeId() !== 'mongo') {
          <p class="hint">Statement extraction runs on the MongoDB console only.</p>
        }
      </div>

      <dl class="est" aria-live="polite">
        <div>
          <dt>Rows</dt>
          <dd class="mono">{{ int(estimate().rows) }}</dd>
        </div>
        <div>
          <dt>Size</dt>
          <dd class="mono">{{ size(estimate().bytes) }}</dd>
        </div>
        <div>
          <dt>About</dt>
          <dd class="mono">{{ duration(estimate().rows / store().rate) }}</dd>
        </div>
      </dl>

      <div class="go-row">
        <button type="button" class="btn btn-solid go" [disabled]="!estimate().rows" (click)="start()">
          <ng-icon name="phosphorPlay" aria-hidden="true" /> Start extraction
        </button>
        <span class="mono rate">{{ int(store().rate) }} rec/s</span>
      </div>
      <p class="mono sample" aria-live="polite">{{ note() }}</p>
    </div>
  `,
  styles: `
    :host {
      display: block;
    }
    .job {
      display: grid;
      grid-template-columns: minmax(0, 1fr);
      gap: 14px;
      padding: 18px;
      background: var(--d-card);
    }
    .j-head {
      display: flex;
      align-items: center;
      gap: 12px;

      div {
        flex: 1;
        min-width: 0;
      }
      h2 {
        font-size: 16px;
      }
      p {
        font-size: 12.5px;
        color: var(--muted);
      }
    }
    // The mark on its light tile, as the product's favicon draws it.
    .mark {
      width: 40px;
      height: 40px;
      flex-shrink: 0;
      display: grid;
      place-items: center;
      border-radius: 11px;
      background: #f2f6fa;
    }
    .reset {
      width: 44px;
      height: 44px;
      flex-shrink: 0;
      display: grid;
      place-items: center;
      border-radius: 999px;
      border: 1px solid var(--line-strong);
      color: var(--ink-2);
      font-size: 17px;

      &:hover {
        background: var(--surface-2);
      }
    }
    .lbl {
      display: block;
      font-size: 12px;
      color: var(--muted);
    }
    .row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      flex-wrap: wrap;

      .seg {
        background: var(--bg);
      }
      .seg button {
        height: 34px;
        padding: 0 13px;
        font-size: 13px;
      }
      .seg [aria-pressed='true'] {
        background: var(--surface-2);
      }
    }
    // The product's extraction tabs, as three equal pills with a gradient underline on the active one.
    .modes {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 6px;
    }
    .mode {
      position: relative;
      min-height: 44px;
      padding: 0 8px;
      border-radius: var(--r-inner);
      border: 1px solid var(--line);
      background: var(--bg);
      color: var(--ink-2);
      font-size: 13px;
      font-weight: 500;
      overflow: hidden;
      transition:
        border-color var(--t-base) var(--ease),
        color var(--t-base) var(--ease);

      &::after {
        content: '';
        position: absolute;
        inset: auto 0 0;
        height: 2px;
        background: var(--d-gradient);
        transform: scaleX(0);
        transition: transform var(--t-base) var(--ease);
      }
      &:hover:not([disabled]) {
        border-color: var(--line-strong);
        color: var(--ink);
      }
      &[aria-pressed='true'] {
        color: var(--ink);
        border-color: var(--line-strong);
        background: var(--surface-2);

        &::after {
          transform: none;
        }
      }
      &[disabled] {
        opacity: 0.45;
        cursor: not-allowed;
      }
    }
    .body {
      display: grid;
      gap: 8px;
      min-height: 104px;
      align-content: start;

      .select {
        height: 44px;
        font-size: 14px;
        background-color: var(--bg);
      }
    }
    .chips {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;

      .chip {
        min-height: 36px;
        font-family: var(--font-mono);
        font-size: 12px;
        background: var(--bg);
      }
      .chip[aria-pressed='true'] {
        background: var(--cta);
      }
    }
    .hint {
      font-size: 12px;
      color: var(--muted);
    }
    .est {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      margin: 0;
      border-radius: var(--r-inner);
      background: var(--bg);
      border: 1px solid var(--line);

      div {
        padding: 10px 12px;
        min-width: 0;

        & + div {
          border-left: 1px solid var(--line);
        }
      }
      dt {
        font-size: 12px;
        color: var(--muted);
      }
      dd {
        margin: 2px 0 0;
        font-size: 15px;
        font-weight: 500;
        color: var(--ink);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }
    .go-row {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .go {
      flex: 1;
    }
    .rate {
      font-size: 12px;
      color: var(--d-green-text);
    }
    .sample {
      font-size: 12px;
      color: var(--muted);
      min-height: 14px;
    }
    @media (max-width: 460px) {
      .job {
        padding: 14px;
      }
      .est dd {
        font-size: 13px;
      }
    }
    /* Smallest phones: the three types wrap instead of clipping, and the estimate shows every figure whole */
    @media (max-width: 374px) {
      .modes {
        display: flex;
        flex-wrap: wrap;
      }
      .mode {
        flex: 1 1 auto;
        padding: 0 12px;
      }
      .est {
        // Columns sized to their figures, so "1 min 10 s" keeps one line instead of orphaning its unit
        grid-template-columns: repeat(3, auto);

        div {
          padding: 8px 10px;
        }
      }
    }
  `,
})
export class DmaxJobDemo {
  protected readonly stores = STORES;
  protected readonly modes = MODES;
  protected readonly tables = TABLES;
  protected readonly periods = PERIODS;
  protected readonly int = int;
  protected readonly size = size;
  protected readonly duration = duration;

  protected readonly storeId = signal<StoreId>('db2');
  protected readonly mode = signal<Mode>('incremental');
  protected readonly enabled = signal<string[]>(['accounts', 'customers', 'transfers', 'entries']);
  protected readonly tableId = signal('transfers');
  protected readonly days = signal(30);
  protected readonly note = signal('Sample data. Pick a store and a type, then start.');
  private nextJob = 1048;

  protected readonly store = computed(() => storeById(this.storeId()));

  protected readonly estimate = computed(() => {
    const mode = this.mode();
    if (mode === 'direct') {
      const t = tableById(this.tableId());
      return { rows: t.rows, bytes: t.rows * t.bytes };
    }
    if (mode === 'statements') {
      const t = tableById('entries');
      const rows = (t.rows * this.days()) / HISTORY_DAYS;
      return { rows: Math.round(rows), bytes: rows * t.bytes };
    }
    return TABLES.filter((t) => this.enabled().includes(t.id)).reduce(
      (sum, t) => ({ rows: sum.rows + Math.round(t.rows * CHANGED), bytes: sum.bytes + t.rows * CHANGED * t.bytes }),
      { rows: 0, bytes: 0 },
    );
  });

  protected pickStore(id: StoreId): void {
    this.storeId.set(id);
    if (id !== 'mongo' && this.mode() === 'statements') this.mode.set('incremental');
  }

  protected toggle(id: string): void {
    this.enabled.update((e) => (e.includes(id) ? e.filter((x) => x !== id) : [...e, id]));
  }

  protected start(): void {
    const id = this.nextJob++;
    this.note.set(`Job ${id} started on ${this.store().label}. Status polls every 3 s.`);
  }

  protected reset(): void {
    this.storeId.set('db2');
    this.mode.set('incremental');
    this.enabled.set(['accounts', 'customers', 'transfers', 'entries']);
    this.tableId.set('transfers');
    this.days.set(30);
    this.nextJob = 1048;
    this.note.set('Sample job reset.');
  }
}
