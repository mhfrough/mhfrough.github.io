import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  phosphorArrowCounterClockwise,
  phosphorArrowDown,
  phosphorArrowUp,
  phosphorArrowsClockwise,
} from '@ng-icons/phosphor-icons/regular';
import { COLUMNS, SampleColumn, TABLES, sampleValue } from './dmax.data';

/**
 * The console's headers page, as my own mockup with invented columns. As in the real app, each table's columns keep
 * their system name and get a name staff choose, an on or off switch, a position, a select-all with a mixed state,
 * and a sync that pulls new columns from the source. The preview is what an export's first lines would look like.
 */
interface Col extends SampleColumn {
  isNew?: boolean;
}

const SHOWN = ['customers', 'accounts', 'transfers'];

/** One new column per table that "Sync from source" finds. */
const NEW_AT_SOURCE: Record<string, Col> = {
  customers: { sys: 'LOCAL.REF.7', name: 'LOCAL_REF_7', kind: 'date', on: false, isNew: true },
  accounts: { sys: 'LIMIT.REF', name: 'LIMIT_REF', kind: 'code', on: false, isNew: true },
  transfers: { sys: 'CHARGES.AMT', name: 'CHARGES_AMT', kind: 'amount', on: false, isNew: true },
};

const fresh = (): Record<string, Col[]> =>
  Object.fromEntries(SHOWN.map((id) => [id, (COLUMNS[id] ?? []).map((c) => ({ ...c }))]));

@Component({
  selector: 'mh-dmax-columns',
  imports: [NgIcon],
  viewProviders: [provideIcons({ phosphorArrowCounterClockwise, phosphorArrowDown, phosphorArrowUp, phosphorArrowsClockwise })],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="cols card">
      <div class="bar">
        <div class="seg" role="group" aria-label="Table">
          @for (t of tables; track t.id) {
            <button type="button" [attr.aria-pressed]="tableId() === t.id" (click)="tableId.set(t.id)">{{ t.name }}</button>
          }
        </div>
        <div class="bar-acts">
          <button type="button" class="btn btn-ghost btn-sm" [disabled]="synced().includes(tableId())" (click)="sync()">
            <ng-icon name="phosphorArrowsClockwise" aria-hidden="true" />
            {{ synced().includes(tableId()) ? 'In sync' : 'Sync from source' }}
          </button>
          <button type="button" class="icon-btn" aria-label="Reset the sample headers" (click)="reset()">
            <ng-icon name="phosphorArrowCounterClockwise" aria-hidden="true" />
          </button>
        </div>
      </div>

      <div class="grid">
        <div class="list">
          <div class="head">
            <label class="all">
              <input
                type="checkbox"
                [checked]="allOn()"
                [indeterminate]="someOn()"
                (change)="setAll($any($event.target).checked)"
              />
              <span>Export all</span>
            </label>
            <span class="mono">{{ onCount() }} of {{ cols().length }} in the export</span>
          </div>
          <ol role="list">
            @for (c of cols(); track c.sys; let i = $index, first = $first, last = $last) {
              <li [class.off]="!c.on">
                <input
                  type="checkbox"
                  class="tick"
                  [id]="'dx-on-' + i"
                  [checked]="c.on"
                  (change)="toggle(i)"
                  [attr.aria-label]="'Export ' + c.sys"
                />
                <label class="sys mono" [for]="'dx-name-' + i">
                  {{ c.sys }}
                  @if (c.isNew) {
                    <span class="new">New</span>
                  }
                </label>
                <span class="name">
                  <input
                    class="input"
                    [id]="'dx-name-' + i"
                    [value]="c.name"
                    autocomplete="off"
                    spellcheck="false"
                    [attr.aria-invalid]="!!errorOf(i)"
                    [attr.aria-describedby]="errorOf(i) ? 'dx-err-' + i : null"
                    (input)="rename(i, $any($event.target))"
                  />
                  @if (errorOf(i); as e) {
                    <span class="err" [id]="'dx-err-' + i">{{ e }}</span>
                  }
                </span>
                <span class="move">
                  <button type="button" class="mv" [disabled]="first" [attr.aria-label]="'Move ' + c.sys + ' up'" (click)="move(i, -1)">
                    <ng-icon name="phosphorArrowUp" aria-hidden="true" />
                  </button>
                  <button type="button" class="mv" [disabled]="last" [attr.aria-label]="'Move ' + c.sys + ' down'" (click)="move(i, 1)">
                    <ng-icon name="phosphorArrowDown" aria-hidden="true" />
                  </button>
                </span>
              </li>
            }
          </ol>
        </div>

        <figure class="preview">
          <figcaption class="mono">Export preview, {{ tableName() }}</figcaption>
          <pre class="mono" tabindex="0" aria-label="First three lines of the export"><code>{{ preview() }}</code></pre>
          <p class="mono foot">Saved per table. Every export, report and download uses these names in this order.</p>
        </figure>
      </div>
      <p class="mono sample" aria-live="polite">{{ note() }}</p>
    </div>
  `,
  styles: `
    :host {
      display: block;
    }
    .cols {
      display: grid;
      grid-template-columns: minmax(0, 1fr);
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

      .seg {
        background: var(--bg);
        max-width: 100%;
        overflow-x: auto;
      }
      .seg button {
        height: 34px;
        font-family: var(--font-mono);
        font-size: 12px;
        white-space: nowrap;
      }
      .seg [aria-pressed='true'] {
        background: var(--surface-2);
      }
    }
    .bar-acts {
      display: flex;
      gap: 8px;

      .btn-sm {
        height: 44px;
        background: var(--bg);
      }
      .icon-btn {
        width: 44px;
        height: 44px;
        background: var(--bg);
        font-size: 17px;
      }
    }
    .grid {
      display: grid;
      grid-template-columns: minmax(0, 1.25fr) minmax(0, 1fr);
      gap: 12px;
      align-items: start;
    }
    .list {
      border-radius: var(--r-inner);
      background: var(--bg);
      border: 1px solid var(--line);
      overflow: hidden;
    }
    .head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      padding: 8px 12px;
      border-bottom: 1px solid var(--line);

      .mono {
        font-size: 12px;
        color: var(--muted);
      }
    }
    .all {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      min-height: 44px;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
    }
    input[type='checkbox'] {
      width: 18px;
      height: 18px;
      margin: 0;
      flex-shrink: 0;
      accent-color: var(--d-green);
    }
    ol li {
      display: grid;
      grid-template-columns: 18px minmax(0, 0.9fr) minmax(0, 1fr) auto;
      align-items: center;
      gap: 10px;
      padding: 6px 8px 6px 12px;
      border-top: 1px solid var(--line);
      transition: opacity var(--t-base) var(--ease);

      &:first-child {
        border-top: 0;
      }
      &.off .sys {
        color: var(--muted);
      }
      &.off .input {
        opacity: 0.5;
      }
    }
    .sys {
      display: flex;
      align-items: center;
      gap: 6px;
      min-width: 0;
      font-size: 12px;
      color: var(--muted);
      overflow-wrap: anywhere;
    }
    .new {
      flex-shrink: 0;
      padding: 0 6px;
      border-radius: 999px;
      font-family: var(--font-sans);
      font-size: 12px;
      background: var(--d-green-soft);
      color: var(--d-green-text);
    }
    .name {
      display: grid;
      gap: 3px;
      min-width: 0;

      .input {
        height: 38px;
        padding: 0 12px;
        font-family: var(--font-mono);
        font-size: 12.5px;
        background: var(--surface);
      }
      .input[aria-invalid='true'] {
        border-color: var(--d-red-text);
      }
    }
    .err {
      font-size: 12px;
      color: var(--d-red-text);
    }
    .move {
      display: flex;
    }
    .mv {
      width: 40px;
      height: 44px;
      display: grid;
      place-items: center;
      border-radius: 8px;
      color: var(--ink-2);
      font-size: 15px;

      &:hover:not([disabled]) {
        background: var(--surface-2);
        color: var(--ink);
      }
      &[disabled] {
        opacity: 0.3;
      }
    }
    .preview {
      margin: 0;
      display: grid;
      gap: 8px;
      padding: 12px;
      border-radius: var(--r-inner);
      background: var(--d-night);
      border: 1px solid var(--line);
      min-width: 0;

      figcaption {
        font-size: 12px;
        color: var(--d-sky);
      }
      pre {
        margin: 0;
        padding: 10px;
        border-radius: 8px;
        background: var(--bg);
        font-size: 12px;
        line-height: 1.7;
        color: var(--ink-2);
        overflow-x: auto;
        white-space: pre;

        &:focus-visible {
          outline: 2px solid var(--focus);
          outline-offset: 2px;
        }
      }
      .foot {
        font-size: 12px;
        color: var(--muted);
      }
    }
    .sample {
      font-size: 12px;
      color: var(--muted);
      min-height: 14px;
    }
    @media (max-width: 900px) {
      .grid {
        grid-template-columns: minmax(0, 1fr);
      }
    }
    @media (max-width: 520px) {
      .cols {
        padding: 12px;
      }
      ol li {
        grid-template-columns: 18px minmax(0, 1fr) auto;
        row-gap: 4px;
      }
      .name {
        grid-column: 2 / 3;
        grid-row: 2;
      }
      .move {
        grid-row: 1 / 3;
        grid-column: 3;
        flex-direction: column;
      }
    }
  `,
})
export class DmaxColumnsDemo {
  protected readonly tables = TABLES.filter((t) => SHOWN.includes(t.id));
  protected readonly tableId = signal('customers');
  private readonly state = signal<Record<string, Col[]>>(fresh());
  protected readonly synced = signal<string[]>([]);
  protected readonly note = signal('Sample headers. Rename one, switch one off, or move it.');

  protected readonly cols = computed(() => this.state()[this.tableId()] ?? []);
  protected readonly tableName = computed(() => this.tables.find((t) => t.id === this.tableId())?.name ?? '');
  protected readonly onCount = computed(() => this.cols().filter((c) => c.on).length);
  protected readonly allOn = computed(() => this.onCount() === this.cols().length);
  protected readonly someOn = computed(() => this.onCount() > 0 && !this.allOn());

  /** Per row: an empty name, or a name another enabled column already uses. */
  private readonly errors = computed(() => {
    const cols = this.cols();
    return cols.map((c, i) => {
      if (!c.name) return 'A name is required';
      if (c.on && cols.some((o, j) => j !== i && o.on && o.name === c.name)) return 'Already used by another column';
      return '';
    });
  });

  protected readonly preview = computed(() => {
    const on = this.cols().filter((c) => c.on);
    if (!on.length) return 'No columns in the export.';
    const header = on.map((c) => c.name || c.sys).join(',');
    const rows = [0, 1].map((i) => on.map((c) => sampleValue(c, i + 3)).join(','));
    return [header, ...rows].join('\n');
  });

  protected errorOf(i: number): string {
    return this.errors()[i] ?? '';
  }

  protected toggle(i: number): void {
    this.edit((cols) => cols.map((c, j) => (j === i ? { ...c, on: !c.on } : c)));
  }

  protected setAll(on: boolean): void {
    this.edit((cols) => cols.map((c) => ({ ...c, on })));
    this.note.set(on ? 'Every column is in the export.' : 'No columns selected: the export would be empty.');
  }

  /** Export names are upper case with underscores, the way the product's files name their columns. */
  protected rename(i: number, el: HTMLInputElement): void {
    const name = el.value.toUpperCase().replace(/[^A-Z0-9_]/g, '_');
    if (name !== el.value) el.value = name;
    this.edit((cols) => cols.map((c, j) => (j === i ? { ...c, name } : c)));
  }

  protected move(i: number, by: -1 | 1): void {
    const cols = [...this.cols()];
    const to = i + by;
    if (to < 0 || to >= cols.length) return;
    [cols[i], cols[to]] = [cols[to], cols[i]];
    this.edit(() => cols);
    this.note.set(`${cols[to].sys} is now column ${to + 1} of the export.`);
  }

  protected sync(): void {
    const id = this.tableId();
    const extra = NEW_AT_SOURCE[id];
    if (!extra || this.synced().includes(id)) return;
    this.edit((cols) => [...cols, { ...extra }]);
    this.synced.update((s) => [...s, id]);
    this.note.set(`Found 1 new column at the source: ${extra.sys}. It stays out of exports until someone turns it on.`);
  }

  protected reset(): void {
    this.state.set(fresh());
    this.synced.set([]);
    this.tableId.set('customers');
    this.note.set('Sample headers reset.');
  }

  private edit(fn: (cols: Col[]) => Col[]): void {
    const id = this.tableId();
    this.state.update((s) => ({ ...s, [id]: fn(s[id] ?? []) }));
  }
}
