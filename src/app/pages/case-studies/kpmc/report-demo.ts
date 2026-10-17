import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';

/**
 * The agent performance report, redrawn as my own mockup: per agent, for a date range, the citizens' ratings
 * (good, neutral, bad), what is still pending and what is resolved, the same columns as the real report. The
 * filter chips list the real complaint report's filters. Sample figures, agents numbered.
 */
interface Row {
  agent: string;
  good: number;
  neutral: number;
  bad: number;
  pending: number;
}

const DATA: Record<'week' | 'month', Row[]> = {
  week: [
    { agent: 'Field agent 1', good: 14, neutral: 3, bad: 1, pending: 4 },
    { agent: 'Field agent 2', good: 9, neutral: 4, bad: 3, pending: 6 },
    { agent: 'Field agent 3', good: 11, neutral: 2, bad: 0, pending: 2 },
  ],
  month: [
    { agent: 'Field agent 1', good: 58, neutral: 11, bad: 6, pending: 9 },
    { agent: 'Field agent 2', good: 41, neutral: 17, bad: 12, pending: 14 },
    { agent: 'Field agent 3', good: 47, neutral: 9, bad: 3, pending: 5 },
  ],
};

@Component({
  selector: 'mh-kpmc-report',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="rep card card--lift">
      <div class="rep-head">
        <h3>Agent performance</h3>
        <div class="seg" role="group" aria-label="Date range">
          <button type="button" [attr.aria-pressed]="period() === 'week'" (click)="period.set('week')">This week</button>
          <button type="button" [attr.aria-pressed]="period() === 'month'" (click)="period.set('month')">This month</button>
        </div>
      </div>
      <ul class="filters" role="list" aria-label="Complaint report filters">
        @for (f of filters(); track f) {
          <li class="tag">{{ f }}</li>
        }
      </ul>
      <div class="tbl-wrap" tabindex="0" role="region" aria-label="Agent performance table, scrolls sideways">
        <table>
          <caption class="sr-only">Ratings and workload per agent, {{ period() === 'week' ? 'this week' : 'this month' }}</caption>
          <thead>
            <tr>
              <th scope="col">Agent</th>
              <th scope="col" class="n">Good</th>
              <th scope="col" class="n">Neutral</th>
              <th scope="col" class="n">Bad</th>
              <th scope="col" class="n">Pending</th>
              <th scope="col" class="n">Resolved</th>
              <th scope="col" class="n">Total</th>
              <th scope="col"><span class="sr-only">Ratings bar</span></th>
            </tr>
          </thead>
          <tbody>
            @for (r of rows(); track r.agent) {
              <tr>
                <th scope="row">{{ r.agent }}</th>
                <td class="n mono">{{ r.good }}</td>
                <td class="n mono">{{ r.neutral }}</td>
                <td class="n mono">{{ r.bad }}</td>
                <td class="n mono">{{ r.pending }}</td>
                <td class="n mono">{{ r.resolved }}</td>
                <td class="n mono"><b>{{ r.total }}</b></td>
                <td class="bar-cell">
                  <span class="bar" aria-hidden="true">
                    <i class="g" [style.flex-grow]="r.good"></i>
                    <i class="m" [style.flex-grow]="r.neutral"></i>
                    <i class="b" [style.flex-grow]="r.bad"></i>
                    <i class="p" [style.flex-grow]="r.pending"></i>
                  </span>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
      <p class="legend mono" aria-hidden="true"><i class="g"></i>Good <i class="m"></i>Neutral <i class="b"></i>Bad <i class="p"></i>Pending</p>
      <p class="mono sample">Sample figures. The real report also exports as a server-drawn PDF.</p>
    </div>
  `,
  styles: `
    :host {
      display: block;
    }
    .rep {
      padding: 20px 22px;
    }
    .rep-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      flex-wrap: wrap;

      h3 {
        font-size: 16px;
      }
      .seg button {
        height: 30px;
        font-size: 13px;
      }
    }
    .filters {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin: 14px 0;

      .tag {
        font-family: var(--font-sans);
        background: var(--surface-2);
        color: var(--ink-2);
      }
    }
    .tbl-wrap {
      position: relative; /* contains the sr-only bar header so it cannot widen the page */
      overflow-x: auto;
      /* Scroll shadows: an edge darkens only while more columns sit past it */
      background:
        linear-gradient(to right, var(--surface), transparent) left / 24px 100% no-repeat local,
        linear-gradient(to left, var(--surface), transparent) right / 24px 100% no-repeat local,
        radial-gradient(farthest-side at 0 50%, rgb(0 0 0 / 0.16), transparent) left / 12px 100% no-repeat scroll,
        radial-gradient(farthest-side at 100% 50%, rgb(0 0 0 / 0.16), transparent) right / 12px 100% no-repeat scroll;

      &:focus-visible {
        outline: 2px solid var(--focus);
        outline-offset: 2px;
      }
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 13.5px;
    }
    th,
    td {
      padding: 10px 8px;
      border-bottom: 1px solid var(--line);
      text-align: left;
      white-space: nowrap;
    }
    thead th {
      font-size: 12px;
      font-weight: 500;
      color: var(--muted);
    }
    tbody th {
      font-weight: 600;
    }
    .n {
      text-align: right;
    }
    .bar-cell {
      width: 30%;
      min-width: 120px;
    }
    .bar {
      display: flex;
      height: 10px;
      border-radius: 999px;
      overflow: hidden;
      gap: 2px;

      i {
        flex-basis: 0;
        transition: flex-grow 0.5s var(--ease);
      }
    }
    .g {
      background: var(--k-green);
    }
    .m {
      background: var(--k-amber);
    }
    .b {
      background: #e05a6b;
    }
    .p {
      background: var(--line-strong);
    }
    .legend {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 6px 12px;
      margin-top: 12px;
      font-size: 12px;
      color: var(--muted);

      i {
        display: inline-block;
        width: 9px;
        height: 9px;
        border-radius: 2px;
        margin-right: -6px;
      }
    }
    .sample {
      margin-top: 8px;
      font-size: 12px;
      color: var(--muted);
    }
    @media (prefers-reduced-motion: reduce) {
      .bar i {
        transition: none;
      }
    }
  `,
})
export class KpmcReportDemo {
  readonly filters = input<readonly string[]>([]);
  protected readonly period = signal<'week' | 'month'>('week');
  protected readonly rows = computed(() =>
    DATA[this.period()].map((r) => {
      const resolved = r.good + r.neutral + r.bad;
      return { ...r, resolved, total: resolved + r.pending };
    }),
  );
}
