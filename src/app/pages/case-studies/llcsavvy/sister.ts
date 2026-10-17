import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { COPY } from './llcsavvy.copy';

type State = 'same' | 'changed' | 'new';
type Filter = State | 'all';

/**
 * What LLC SAVVY kept from Finclore and what it changed, from a diff of the two repos (both read only): a brand
 * panel with the product's own mark and wordmark on its header navy, and a filterable list of modules marked
 * shared, changed or new. The filter is a segmented control; the counts in it come from the rows.
 */
@Component({
  selector: 'mh-llcsavvy-sister',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="sis">
      <figure class="brand">
        <div class="ground">
          <span class="tile"><img src="/images/llcsavvy/llcsavvy-mark.webp" width="64" height="64" alt="" /></span>
          <img class="word" src="/images/llcsavvy/llcsavvy-wordmark-light.webp" width="240" height="68" alt="LLC SAVVY" />
        </div>
        <ul class="sw" role="list" aria-label="Brand colours">
          <li><i style="background: var(--l-navy)"></i><span class="mono">#0A3161</span></li>
          <li><i style="background: var(--l-red)"></i><span class="mono">#B31942</span></li>
          <li><i style="background: var(--l-green)"></i><span class="mono">crescent green</span></li>
          <li><i style="background: var(--bg); box-shadow: inset 0 0 0 1px var(--line-strong)"></i><span class="mono">#F3F4F6</span></li>
        </ul>
        <figcaption>{{ c().brandCap }}</figcaption>
      </figure>

      <div class="card list">
        <div class="l-head">
          <span class="mono lbl" id="ls-sis">{{ c().filterLabel }}</span>
          <div class="seg" role="group" aria-labelledby="ls-sis">
            @for (f of c().filters; track f.id) {
              <button type="button" [attr.aria-pressed]="filter() === f.id" (click)="filter.set($any(f.id))">
                {{ f.label }} <span class="mono n">{{ count(f.id) }}</span>
              </button>
            }
          </div>
        </div>
        <ul class="rows" role="list" aria-live="polite">
          @for (r of shown(); track r.t) {
            <li>
              <span [class]="'st st--' + r.s">{{ label(r.s) }}</span>
              <div>
                <h3>{{ r.t }}</h3>
                <p>{{ r.d }}</p>
              </div>
            </li>
          }
        </ul>
      </div>
    </div>
  `,
  styles: `
    :host {
      display: block;
    }
    .sis {
      display: grid;
      grid-template-columns: minmax(0, 0.8fr) minmax(0, 1.2fr);
      gap: 16px;
      align-items: start;
    }
    .brand {
      margin: 0;
      display: grid;
      gap: 14px;
    }
    .ground {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 18px;
      min-height: 220px;
      padding: 28px;
      border-radius: var(--r-card);
      background: var(--l-night);
      box-shadow: var(--shadow-lg);
    }
    .tile {
      display: grid;
      place-items: center;
      width: 84px;
      height: 84px;
      flex-shrink: 0;
      border-radius: 20px;
      background: var(--surface);

      img {
        width: 64px;
        height: 64px;
      }
    }
    .word {
      width: 180px;
      max-width: 100%;
      height: auto;
    }
    .sw {
      display: flex;
      flex-wrap: wrap;
      gap: 8px 14px;

      li {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 12px;
        color: var(--ink-2);
      }
      i {
        width: 16px;
        height: 16px;
        border-radius: 50%;
      }
    }
    figcaption {
      font-size: 13.5px;
      color: var(--muted);
    }
    .list {
      display: grid;
      gap: 12px;
      padding: 18px;
    }
    .l-head {
      display: flex;
      align-items: center;
      gap: 10px;
      flex-wrap: wrap;

      .seg {
        flex-wrap: wrap;
      }
      .seg button {
        height: 36px;
        padding: 0 12px;
        font-size: 13px;
      }
      .n {
        margin-left: 6px;
        font-size: 12px;
        opacity: 0.7;
      }
    }
    .lbl {
      font-size: 12px;
      color: var(--muted);
    }
    .rows {
      display: grid;
      gap: 6px;

      li {
        display: grid;
        grid-template-columns: 78px minmax(0, 1fr);
        gap: 12px;
        align-items: start;
        padding: 10px 12px;
        border-radius: var(--r-inner);
        background: var(--bg);
        border: 1px solid var(--line);
      }
      h3 {
        font-size: 14px;
        font-weight: 600;
      }
      p {
        font-size: 13px;
        color: var(--ink-2);
      }
    }
    @media (prefers-reduced-motion: no-preference) {
      .rows li {
        animation: row-in 0.25s var(--ease) both;
      }
    }
    @keyframes row-in {
      from {
        opacity: 0;
        transform: translateY(4px);
      }
    }
    .st {
      justify-self: start;
      margin-top: 1px;
      padding: 2px 9px;
      border-radius: 999px;
      font-size: 12px;
      font-weight: 500;
      white-space: nowrap;
    }
    .st--same {
      background: var(--l-navy-soft);
      color: var(--l-navy);
    }
    .st--changed {
      background: var(--l-amber-soft);
      color: var(--l-amber-text);
    }
    .st--new {
      background: var(--l-green-soft);
      color: var(--l-green-text);
    }
    @media (max-width: 900px) {
      .sis {
        grid-template-columns: 1fr;
      }
    }
    @media (max-width: 460px) {
      .list {
        padding: 14px;
      }
      .rows li {
        grid-template-columns: 1fr;
        gap: 6px;
      }
      .ground {
        flex-direction: column;
      }
    }
    /* Narrow phones: the segmented control takes a full row of equal cells instead of wrapping into a blob */
    @media (max-width: 360px) {
      .l-head .seg {
        width: 100%;
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        border-radius: 18px;
      }
      .l-head .seg button {
        height: auto;
        min-height: 36px;
        padding: 4px 6px;
        justify-content: center;
        text-align: center;
        line-height: 1.2;
      }
    }
  `,
})
export class LlcsavvySister {
  readonly c = input.required<typeof COPY.sister>();
  protected readonly filter = signal<Filter>('all');

  protected readonly shown = computed(() => {
    const f = this.filter();
    return this.c().rows.filter((r) => f === 'all' || r.s === f);
  });

  protected count(id: string): number {
    return id === 'all' ? this.c().rows.length : this.c().rows.filter((r) => r.s === id).length;
  }

  protected label(s: string): string {
    return this.c().states[s as State];
  }
}
