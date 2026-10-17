import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';

/**
 * SOS24's single service page, redrawn: the trade in the address picks its block from one content map. Pick a
 * trade and the address and the list of jobs change; the page around them does not. Trade and job names are
 * SOS24's own.
 */
export interface Trade {
  id: string;
  name: string;
  jobs: readonly string[];
}

@Component({
  selector: 'mh-trades-explorer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="ex">
      <div class="tabs" role="group" aria-label="Trade">
        @for (t of trades(); track t.id; let i = $index) {
          <button type="button" class="chip" [attr.aria-pressed]="pick() === i" (click)="pick.set(i)">{{ t.name }}</button>
        }
      </div>
      <div class="page card card--lift">
        <p class="addr mono"><span>/service?type=</span><b>{{ current().id }}</b></p>
        <h3>{{ current().name }} services</h3>
        <p class="lede">Introduction, why choose us, and the jobs below: one entry in the map, one page on the site.</p>
        <ul class="jobs" role="list" aria-live="polite">
          @for (j of current().jobs; track j) {
            <li>{{ j }}</li>
          }
        </ul>
      </div>
    </div>
  `,
  styles: `
    :host {
      display: block;
    }
    .ex {
      display: grid;
      grid-template-columns: minmax(0, 1fr) minmax(0, 1.1fr);
      gap: 20px;
      align-items: start;
    }
    .tabs {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;

      .chip {
        min-height: 40px;
      }
      .chip[aria-pressed='true'] {
        background: var(--t-navy);
        border-color: var(--t-navy);
        color: #fff;
      }
    }
    .page {
      padding: 20px 22px;
    }
    .addr {
      display: inline-flex;
      padding: 4px 12px;
      border-radius: 999px;
      background: var(--surface-2);
      font-size: 12px;
      color: var(--muted);

      b {
        color: var(--t-red-text);
        font-weight: 500;
      }
    }
    h3 {
      margin-top: 14px;
      font-size: 20px;
      letter-spacing: -0.02em;
    }
    .lede {
      margin-top: 4px;
      font-size: 13.5px;
      color: var(--muted);
    }
    .jobs {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
      margin-top: 16px;

      li {
        padding: 10px 12px;
        border-radius: var(--r-inner);
        background: var(--t-amber-soft);
        font-size: 13.5px;
        color: var(--ink);
      }
    }
    @media (prefers-reduced-motion: no-preference) {
      .jobs li {
        animation: in 0.35s var(--ease) both;
      }
    }
    @keyframes in {
      from {
        opacity: 0;
        transform: translateY(4px);
      }
    }
    @media (max-width: 860px) {
      .ex {
        grid-template-columns: 1fr;
      }
    }
    @media (max-width: 460px) {
      .jobs {
        grid-template-columns: 1fr;
      }
    }
  `,
})
export class TradesExplorerDemo {
  readonly trades = input.required<readonly Trade[]>();
  protected readonly pick = signal(0);
  protected readonly current = computed(() => this.trades()[this.pick()]);
}
