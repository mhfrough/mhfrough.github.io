import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  phosphorArrowRight,
  phosphorBank,
  phosphorBriefcase,
  phosphorChartLineUp,
  phosphorChatsCircle,
  phosphorCube,
  phosphorHandCoins,
  phosphorLightning,
  phosphorReceipt,
  phosphorSparkle,
  phosphorSquaresFour,
  phosphorStorefront,
  phosphorTruck,
  phosphorUsersThree,
} from '@ng-icons/phosphor-icons/regular';
import { Domain, FILTERS, PROJECTS } from './home.data';

/**
 * Hero component (the Quorum "Build your Quorum" builder pattern): filter chips, a 2-column grid of project
 * tokens, and a dark output block describing the selected project. A real, working component, not a screenshot.
 */
@Component({
  selector: 'mh-work-explorer',
  imports: [NgIcon, RouterLink],
  viewProviders: [
    provideIcons({
      phosphorArrowRight,
      phosphorBank,
      phosphorBriefcase,
      phosphorChartLineUp,
      phosphorChatsCircle,
      phosphorCube,
      phosphorHandCoins,
      phosphorLightning,
      phosphorReceipt,
      phosphorSparkle,
      phosphorSquaresFour,
      phosphorStorefront,
      phosphorTruck,
      phosphorUsersThree,
    }),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="stack">
      <div class="card card--lift explorer">
        <div class="head">
          <h2>Selected work</h2>
          <span class="count">{{ visible().length }} of {{ total }}</span>
        </div>

        <div class="presets" role="toolbar" aria-label="Filter projects by domain">
          @for (f of filters; track f.id) {
            <button type="button" class="chip" [attr.aria-pressed]="filter() === f.id" (click)="setFilter(f.id)">
              <ng-icon [name]="f.icon" aria-hidden="true" />{{ f.label }}
            </button>
          }
        </div>

        <ul class="tokens" role="list" aria-label="Projects">
          @for (p of visible(); track p.id) {
            <li>
              <button type="button" class="token" [attr.aria-pressed]="selected().id === p.id" (click)="selectedId.set(p.id)">
                <span class="e"><ng-icon [name]="p.icon" aria-hidden="true" /></span>
                <span class="t">
                  <b>{{ p.title }}</b>
                  <small>{{ p.sub }}</small>
                </span>
              </button>
            </li>
          }
        </ul>

        <div class="out" aria-live="polite">
          <div class="out-text">
            <code class="fn">f({{ selected().id }})</code>
            <p>{{ selected().outcome }}</p>
            <span class="out-meta">{{ selected().years }} &middot; {{ selected().stack.join(', ') }}</span>
          </div>
          @if (selected().href; as href) {
            <a class="copy" [routerLink]="href">Open <ng-icon name="phosphorArrowRight" aria-hidden="true" /></a>
          }
        </div>
      </div>
    </div>
  `,
  styles: `
    :host {
      display: block;
      min-width: 0;
    }
    /* Quorum's builder sits on a second, offset card for depth */
    .stack {
      position: relative;
      padding-top: 18px;
    }
    .stack::before {
      content: '';
      position: absolute;
      left: 6%;
      right: 6%;
      top: 0;
      height: 60px;
      border-radius: var(--r-card);
      background: var(--surface-2);
      border: 1px solid var(--line);
    }
    .explorer {
      position: relative;
      padding: 22px;
    }
    .head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      margin-bottom: 14px;
    }
    h2 {
      font-size: 17px;
      letter-spacing: -0.01em;
    }
    .count {
      font-family: var(--font-mono);
      font-size: 13px;
      color: var(--muted);
    }
    .presets {
      display: flex;
      gap: 6px;
      overflow-x: auto;
      scrollbar-width: none;
      margin: 0 -22px 14px;
      padding: 0 22px;
    }
    .presets::-webkit-scrollbar {
      display: none;
    }
    .tokens {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 6px;
      list-style: none;
      margin: 0;
      padding: 0;
      min-height: 218px;
      align-content: start;
    }
    .token {
      width: 100%;
      min-width: 0;
      display: flex;
      align-items: center;
      gap: 10px;
      height: 50px;
      padding: 0 14px 0 8px;
      border-radius: 999px;
      text-align: left;
      border: 1px solid transparent;
      background: var(--surface-2);
      color: var(--muted);
      transition:
        background 0.3s var(--ease),
        color 0.3s var(--ease),
        border-color 0.3s var(--ease),
        transform 0.2s var(--ease);
    }
    .token:hover {
      color: var(--ink-2);
    }
    .token:active {
      transform: scale(0.98);
    }
    .token .e {
      width: 34px;
      height: 34px;
      flex-shrink: 0;
      border-radius: 999px;
      display: grid;
      place-items: center;
      font-size: 18px;
      background: var(--surface);
      opacity: 0.6;
      transition: opacity 0.3s var(--ease);
    }
    .token .t {
      min-width: 0;
      display: grid;
      line-height: 1.2;
    }
    .token b {
      font-weight: 600;
      font-size: 14.5px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .token small {
      font-size: 12px;
      color: var(--muted);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .token[aria-pressed='true'] {
      background: var(--accent-soft);
      color: var(--ink);
      border-color: var(--line-strong);
    }
    .token[aria-pressed='true'] .e {
      opacity: 1;
      background: var(--cta);
      color: var(--cta-ink);
    }
    .out {
      margin-top: 16px;
      border-radius: var(--r-inner);
      background: var(--solid);
      color: var(--solid-ink);
      border: 1px solid var(--solid-edge);
      padding: 14px 12px 14px 16px;
      display: flex;
      align-items: center;
      gap: 12px;
      min-height: 104px;
    }
    .out-text {
      flex: 1;
      min-width: 0;
      display: grid;
      gap: 4px;
    }
    .fn {
      font-size: 12.5px;
      opacity: 0.55;
    }
    .out p {
      font-size: 14.5px;
      line-height: 1.45;
    }
    .out-meta {
      font-family: var(--font-mono);
      font-size: 12px;
      opacity: 0.6;
    }
    @media (max-width: 480px) {
      .tokens {
        grid-template-columns: minmax(0, 1fr);
      }
      .explorer {
        padding: 18px;
      }
      .presets {
        margin: 0 -18px 14px;
        padding: 0 18px;
      }
    }
  `,
})
export class WorkExplorer {
  protected readonly filters = FILTERS;
  protected readonly total = PROJECTS.length;
  protected readonly filter = signal<'all' | Domain>('all');
  protected readonly selectedId = signal(PROJECTS[0].id);

  protected readonly visible = computed(() => {
    const f = this.filter();
    return f === 'all' ? PROJECTS : PROJECTS.filter((p) => p.domains.includes(f));
  });

  protected readonly selected = computed(() => {
    const list = this.visible();
    return list.find((p) => p.id === this.selectedId()) ?? list[0];
  });

  protected setFilter(id: 'all' | Domain): void {
    this.filter.set(id);
    const list = this.visible();
    if (!list.some((p) => p.id === this.selectedId())) this.selectedId.set(list[0].id);
  }
}
