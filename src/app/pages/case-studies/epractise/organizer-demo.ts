import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  phosphorArrowCounterClockwise,
  phosphorArrowDown,
  phosphorArrowLeft,
  phosphorArrowRight,
  phosphorArrowUp,
  phosphorDotsSixVertical,
  phosphorPlus,
  phosphorRows,
  phosphorTrash,
  phosphorUploadSimple,
} from '@ng-icons/phosphor-icons/regular';

/**
 * Organizer template builder (my own redraw, not a screenshot), following the real grid: questions sit in rows of up
 * to four, every tile in a row gets an equal share of the width (100, 50, 33.33 or 25 percent), and each question
 * is saved with its position as { posX, posY, width }. Tiles drag between rows with native drag and drop, as in the
 * original; the toolbar does the same moves from the keyboard. "Preview as client" renders the organizer as the
 * client fills it in. Invented questions.
 */
type QType = 'text' | 'yesno' | 'choice' | 'number' | 'date' | 'upload';

interface Tile {
  id: number;
  label: string;
  type: QType;
}

const MAX = 4;
const TYPES: { id: QType; t: string }[] = [
  { id: 'text', t: 'Text' },
  { id: 'yesno', t: 'Yes or no' },
  { id: 'choice', t: 'Choice' },
  { id: 'number', t: 'Number' },
  { id: 'date', t: 'Date' },
  { id: 'upload', t: 'File upload' },
];
const TYPE_NAME = Object.fromEntries(TYPES.map((t) => [t.id, t.t])) as Record<QType, string>;

const SEED: Tile[][] = [
  [
    { id: 1, label: 'Filing status', type: 'choice' },
    { id: 2, label: 'Number of dependents', type: 'number' },
  ],
  [
    { id: 3, label: 'Bought or sold a home?', type: 'yesno' },
    { id: 4, label: 'Moved to another state?', type: 'yesno' },
    { id: 5, label: 'Sold any crypto?', type: 'yesno' },
  ],
  [{ id: 6, label: 'Last year’s return', type: 'upload' }],
  [{ id: 7, label: 'Anything else we should know?', type: 'text' }],
];

const clone = (rows: Tile[][]) => rows.map((r) => [...r]);
const width = (n: number) => (n === 3 ? '33.33%' : `${100 / n}%`);

@Component({
  selector: 'mh-epractise-organizer',
  imports: [NgIcon],
  viewProviders: [
    provideIcons({
      phosphorArrowCounterClockwise,
      phosphorArrowDown,
      phosphorArrowLeft,
      phosphorArrowRight,
      phosphorArrowUp,
      phosphorDotsSixVertical,
      phosphorPlus,
      phosphorRows,
      phosphorTrash,
      phosphorUploadSimple,
    }),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./mini-btn.scss'],
  template: `
    <div class="org card">
      <header class="o-head">
        <div>
          <p class="mono lbl">Organizer template</p>
          <h3>2025 individual organizer</h3>
        </div>
        <div class="seg" role="group" aria-label="Mode">
          <button type="button" [attr.aria-pressed]="!preview()" (click)="preview.set(false)">Build</button>
          <button type="button" [attr.aria-pressed]="preview()" (click)="preview.set(true)">Preview as client</button>
        </div>
        <button type="button" class="reset" aria-label="Reset the sample organizer" (click)="reset()">
          <ng-icon name="phosphorArrowCounterClockwise" aria-hidden="true" />
        </button>
      </header>

      @if (!preview()) {
        <div class="grid" role="list" aria-label="Rows of questions">
          @for (row of rows(); track $index; let r = $index) {
            <div class="row" role="listitem" [attr.aria-label]="'Row ' + (r + 1) + ', ' + row.length + ' of ' + max"
                 [class.over]="overRow() === r" (dragover)="allow($event, r)" (dragleave)="overRow.set(null)" (drop)="dropOnRow($event, r)">
              @for (t of row; track t.id; let x = $index) {
                <button
                  type="button"
                  class="tile"
                  draggable="true"
                  [style.flex-basis]="widthOf(row.length)"
                  [attr.aria-pressed]="selected() === t.id"
                  (click)="select(t.id)"
                  (dragstart)="dragStart($event, t.id)"
                  (dragend)="dragId.set(null); overRow.set(null)"
                  (dragover)="allow($event, r)"
                  (drop)="dropOnTile($event, r, x)"
                  [class.dragging]="dragId() === t.id"
                >
                  <ng-icon name="phosphorDotsSixVertical" class="grip" aria-hidden="true" />
                  <span class="q">{{ t.label }}</span>
                  <span class="ty mono">{{ typeName[t.type] }} · {{ widthOf(row.length) }}</span>
                </button>
              }
            </div>
          }
          <div class="row new" aria-hidden="true" [class.over]="overRow() === -1" (dragover)="allow($event, -1)" (dragleave)="overRow.set(null)" (drop)="dropNewRow($event)">
            <ng-icon name="phosphorRows" aria-hidden="true" /> Drop here for a new row
          </div>
        </div>

        <div class="tools" role="toolbar" aria-label="Move the selected question">
          @if (sel(); as s) {
            <span class="pos mono">{{ '{' }} posX: {{ s.x }}, posY: {{ s.y }}, width: '{{ s.w }}' {{ '}' }}</span>
            <span class="btns">
              <button type="button" class="icon-sq" aria-label="Move left" (click)="nudge(0, -1)" [disabled]="s.x === 0"><ng-icon name="phosphorArrowLeft" aria-hidden="true" /></button>
              <button type="button" class="icon-sq" aria-label="Move right" (click)="nudge(0, 1)" [disabled]="s.x === s.n - 1"><ng-icon name="phosphorArrowRight" aria-hidden="true" /></button>
              <button type="button" class="icon-sq" aria-label="Move to the row above" (click)="nudge(-1, 0)" [disabled]="s.y === 0"><ng-icon name="phosphorArrowUp" aria-hidden="true" /></button>
              <button type="button" class="icon-sq" aria-label="Move to the row below" (click)="nudge(1, 0)" [disabled]="s.y === rows().length - 1"><ng-icon name="phosphorArrowDown" aria-hidden="true" /></button>
              <button type="button" class="icon-sq" aria-label="Put on its own row" (click)="ownRow()" [disabled]="s.n === 1"><ng-icon name="phosphorRows" aria-hidden="true" /></button>
              <button type="button" class="icon-sq" aria-label="Remove question" (click)="remove()"><ng-icon name="phosphorTrash" aria-hidden="true" /></button>
            </span>
          } @else {
            <span class="hint">Select a question, or drag it beside another. Rows hold up to four.</span>
          }
        </div>

        <form class="add" (submit)="add($event)">
          <div class="field">
            <label class="field__label" for="ep-q">New question</label>
            <input id="ep-q" class="input" [value]="draft()" (input)="draft.set($any($event.target).value)" maxlength="60" />
          </div>
          <div class="field">
            <label class="field__label" for="ep-qt">Type</label>
            <select id="ep-qt" class="select" [value]="draftType()" (change)="draftType.set($any($event.target).value)">
              @for (t of types; track t.id) {
                <option [value]="t.id">{{ t.t }}</option>
              }
            </select>
          </div>
          <button type="submit" class="btn btn-solid" [disabled]="draft().trim().length < 3"><ng-icon name="phosphorPlus" aria-hidden="true" /> Add</button>
        </form>
      } @else {
        <div class="prev">
          @for (row of rows(); track $index) {
            <div class="row">
              @for (t of row; track t.id) {
                <div class="pq" [style.flex-basis]="widthOf(row.length)">
                  @switch (t.type) {
                    @case ('yesno') {
                      <fieldset>
                        <legend>{{ t.label }}</legend>
                        <span class="yn">
                          <label><input type="radio" [name]="'ep-p' + t.id" /> Yes</label>
                          <label><input type="radio" [name]="'ep-p' + t.id" /> No</label>
                        </span>
                      </fieldset>
                    }
                    @case ('upload') {
                      <span class="pl">{{ t.label }}</span>
                      <button type="button" class="mini-btn up" [attr.aria-label]="'Upload file for ' + t.label"><ng-icon name="phosphorUploadSimple" aria-hidden="true" /> Upload file</button>
                    }
                    @case ('choice') {
                      <label class="pl" [for]="'ep-p' + t.id">{{ t.label }}</label>
                      <select class="select" [id]="'ep-p' + t.id">
                        <option>Single</option>
                        <option>Married filing jointly</option>
                        <option>Head of household</option>
                      </select>
                    }
                    @default {
                      <label class="pl" [for]="'ep-p' + t.id">{{ t.label }}</label>
                      <input class="input" [id]="'ep-p' + t.id" [type]="t.type === 'number' ? 'number' : t.type === 'date' ? 'date' : 'text'" />
                    }
                  }
                </div>
              }
            </div>
          }
        </div>
      }
      <p class="mono sample" aria-live="polite">{{ note() }}</p>
    </div>
  `,
  styles: `
    :host {
      display: block;
    }
    .org {
      display: grid;
      gap: 14px;
      padding: 18px;
    }
    .o-head {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 10px 16px;

      > div:first-child {
        flex: 1;
        min-width: 180px;
      }
      h3 {
        font-size: 16px;
      }
      .seg button {
        min-height: 36px;
      }
    }
    .lbl {
      font-size: 12px;
      color: var(--muted);
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
    .grid,
    .prev {
      display: grid;
      gap: 8px;
    }
    .row {
      display: flex;
      gap: 8px;
      padding: 6px;
      border-radius: var(--r-inner);
      background: var(--bg);
      border: 1px dashed var(--line-strong);
      transition: border-color var(--t-base) var(--ease), background var(--t-base) var(--ease);

      &.over {
        border-color: var(--e-blue);
        background: var(--e-blue-soft);
      }
    }
    .new {
      justify-content: center;
      align-items: center;
      min-height: 48px;
      gap: 8px;
      font-size: 12.5px;
      color: var(--muted);
    }
    .tile {
      position: relative;
      display: grid;
      gap: 2px;
      flex: 1 1 0;
      min-width: 0;
      min-height: 56px;
      padding: 9px 10px 9px 26px;
      border-radius: 10px;
      background: var(--surface);
      border: 1px solid var(--line);
      text-align: left;
      cursor: grab;
      transition: border-color var(--t-base) var(--ease), opacity var(--t-base) var(--ease);

      &[aria-pressed='true'] {
        border-color: var(--e-blue);
        box-shadow: 0 0 0 1px var(--e-blue);
      }
      &.dragging {
        opacity: 0.45;
      }
      .grip {
        position: absolute;
        left: 7px;
        top: 11px;
        font-size: 14px;
        color: var(--muted);
      }
      .q {
        font-size: 13px;
        font-weight: 500;
        overflow-wrap: anywhere;
      }
      .ty {
        font-size: 12px;
        color: var(--muted);
      }
    }
    .tools {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 8px 14px;
      min-height: 44px;

      .pos {
        font-size: 12px;
        color: var(--e-blue-text);
      }
      .hint {
        font-size: 13px;
        color: var(--muted);
      }
      .btns {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }
    }
    // 36px to the eye, a 44px hit area through ::before.
    .icon-sq {
      position: relative;
      width: 36px;
      height: 36px;
      display: grid;
      place-items: center;
      border-radius: 10px;

      &::before {
        content: '';
        position: absolute;
        inset: -4px;
      }
      border: 1px solid var(--line);
      color: var(--ink-2);
      font-size: 16px;

      &:hover:not([disabled]) {
        background: var(--surface-2);
      }
      &[disabled] {
        opacity: 0.4;
        cursor: not-allowed;
      }
    }
    .add {
      display: grid;
      grid-template-columns: minmax(0, 1fr) 180px auto;
      gap: 10px;
      align-items: end;
      padding-top: 12px;
      border-top: 1px solid var(--line);

      .btn[disabled] {
        opacity: 0.45;
        cursor: not-allowed;
      }
    }
    .prev .row {
      border-style: solid;
      border-color: var(--line);
      background: var(--surface);
      padding: 12px;
      gap: 14px;
    }
    .pq {
      display: grid;
      gap: 6px;
      flex: 1 1 0;
      min-width: 0;
      align-content: start;

      .pl,
      legend {
        font-size: 13px;
        font-weight: 500;
        color: var(--ink-2);
      }
      fieldset {
        display: grid;
        gap: 6px;
        border: 0;
        padding: 0;
        margin: 0;
      }
      .yn {
        display: flex;
        gap: 14px;
        min-height: 46px;
        align-items: center;
        font-size: 14px;

        label {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        input {
          width: 18px;
          height: 18px;
          accent-color: var(--e-blue);
        }
      }
      .input,
      .select {
        height: 44px;
        font-size: 14px;
      }
      .up {
        justify-self: start;
        margin-block: 7px;
      }
    }
    .sample {
      font-size: 12px;
      color: var(--muted);
      min-height: 14px;
    }
    @media (max-width: 640px) {
      .add {
        grid-template-columns: 1fr;
      }
      .prev .row {
        flex-direction: column;
      }
    }
    @media (max-width: 460px) {
      .org {
        padding: 14px;
      }
      .row {
        flex-wrap: wrap;
      }
      .tile {
        flex: 1 1 calc(50% - 8px) !important;
      }
    }
  `,
})
export class EpractiseOrganizerDemo {
  protected readonly types = TYPES;
  protected readonly typeName = TYPE_NAME;
  protected readonly max = MAX;
  protected readonly rows = signal<Tile[][]>(clone(SEED));
  protected readonly selected = signal<number | null>(5);
  protected readonly preview = signal(false);
  protected readonly dragId = signal<number | null>(null);
  protected readonly overRow = signal<number | null>(null);
  protected readonly draft = signal('Received a 1099-K?');
  protected readonly draftType = signal<QType>('yesno');
  protected readonly note = signal('Sample organizer. Drag a question or use the arrows.');
  private nextId = 8;

  /** The selected tile's saved position, the way the real template stores it. */
  protected readonly sel = computed(() => {
    const id = this.selected();
    const rows = this.rows();
    for (let y = 0; y < rows.length; y++) {
      const x = rows[y].findIndex((t) => t.id === id);
      if (x > -1) return { x, y, n: rows[y].length, w: width(rows[y].length) };
    }
    return null;
  });

  protected widthOf(n: number): string {
    return width(n);
  }

  protected select(id: number): void {
    this.selected.set(this.selected() === id ? null : id);
  }

  protected dragStart(e: DragEvent, id: number): void {
    this.dragId.set(id);
    this.selected.set(id);
    e.dataTransfer?.setData('text/plain', String(id));
    if (e.dataTransfer) e.dataTransfer.effectAllowed = 'move';
  }

  protected allow(e: DragEvent, row: number): void {
    if (this.dragId() === null) return;
    e.preventDefault();
    this.overRow.set(row);
  }

  protected dropOnTile(e: DragEvent, row: number, index: number): void {
    e.preventDefault();
    e.stopPropagation();
    this.place(row, index);
  }

  protected dropOnRow(e: DragEvent, row: number): void {
    e.preventDefault();
    this.place(row, this.rows()[row].length);
  }

  protected dropNewRow(e: DragEvent): void {
    e.preventDefault();
    const id = this.dragId();
    if (id === null) return;
    this.rows.update((rows) => {
      const { rest, tile } = this.take(rows, id);
      return tile ? [...rest, [tile]] : rows;
    });
    this.done('Dropped on a new row: full width.');
  }

  /** Puts the dragged tile into a row at an index. A full row refuses it, as the real grid does. */
  private place(row: number, index: number): void {
    const id = this.dragId();
    if (id === null) return;
    const rows = this.rows();
    const target = rows[row];
    const same = target.some((t) => t.id === id);
    if (!same && target.length >= MAX) return this.done('That row already holds four questions.');
    const fromIndex = target.findIndex((t) => t.id === id);
    const at = same && fromIndex < index ? index - 1 : index;
    this.rows.update((all) => {
      const copy = clone(all);
      const tgt = copy[row];
      const { rest, tile } = this.take(copy, id, row);
      if (!tile) return all;
      const dest = rest.indexOf(tgt);
      rest[dest] = [...tgt.slice(0, at), tile, ...tgt.slice(at)];
      return rest;
    });
    const n = this.rows().find((r) => r.some((t) => t.id === id))?.length ?? 1;
    this.done(`Placed. The row now shares its width: ${width(n)} each.`);
  }

  /**
   * Removes a tile from wherever it is and drops rows left empty. `keep` is a row index that must survive even if
   * it empties (the drop target).
   */
  private take(rows: Tile[][], id: number, keep = -1): { rest: Tile[][]; tile: Tile | null } {
    let tile: Tile | null = null;
    const rest: Tile[][] = [];
    rows.forEach((r, i) => {
      const hit = r.find((t) => t.id === id);
      if (hit) {
        tile = hit;
        r.splice(r.indexOf(hit), 1);
      }
      if (r.length || i === keep) rest.push(r);
    });
    return { rest, tile };
  }

  private done(msg: string): void {
    this.dragId.set(null);
    this.overRow.set(null);
    this.note.set(msg);
  }

  /** Keyboard moves for the selected tile: along its row, or into the row above or below. */
  protected nudge(dy: number, dx: number): void {
    const s = this.sel();
    const id = this.selected();
    if (!s || id === null) return;
    if (dx) {
      this.rows.update((all) => {
        const copy = clone(all);
        const r = copy[s.y];
        [r[s.x], r[s.x + dx]] = [r[s.x + dx], r[s.x]];
        return copy;
      });
      this.note.set('Moved along the row.');
      return;
    }
    const target = s.y + dy;
    if (this.rows()[target].length >= MAX) {
      this.note.set('That row already holds four questions.');
      return;
    }
    this.dragId.set(id);
    this.place(target, dy < 0 ? this.rows()[target].length : 0);
  }

  protected ownRow(): void {
    const s = this.sel();
    const id = this.selected();
    if (!s || id === null) return;
    this.rows.update((all) => {
      const copy = clone(all);
      const [tile] = copy[s.y].splice(s.x, 1);
      copy.splice(s.y + 1, 0, [tile]);
      return copy;
    });
    this.note.set('On its own row: full width.');
  }

  protected remove(): void {
    const id = this.selected();
    if (id === null) return;
    this.rows.update((all) => this.take(clone(all), id).rest);
    this.selected.set(null);
    this.note.set('Question removed.');
  }

  protected add(e: Event): void {
    e.preventDefault();
    const label = this.draft().trim();
    if (label.length < 3) return;
    const tile: Tile = { id: this.nextId++, label, type: this.draftType() };
    this.rows.update((all) => [...clone(all), [tile]]);
    this.selected.set(tile.id);
    this.draft.set('');
    this.note.set(`Added "${label}" on a new row. Drag it beside another to share the width.`);
  }

  protected reset(): void {
    this.rows.set(clone(SEED));
    this.selected.set(5);
    this.preview.set(false);
    this.draft.set('Received a 1099-K?');
    this.draftType.set('yesno');
    this.done('Sample organizer reset.');
  }
}
