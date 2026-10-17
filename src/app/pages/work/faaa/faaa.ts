import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { phosphorBellRinging } from '@ng-icons/phosphor-icons/regular';

const COPY = {
  label: 'Side project',
  title: 'Faaa, sound alerts for VS Code',
  meta: ['VS Code extension', '2026', 'Built for fun'],
  body: 'Plays a sound the moment an editor error, a failed build or a failed test shows up, so your ears catch problems while your eyes stay on the code.',
  features: ['Editor errors', 'Build and test failures', 'Status bar toggle', 'Cooldown', 'Your own .wav'],
  stack: ['TypeScript', 'VS Code API', 'Node.js'],
} as const;

/** Faaa: a small full-width card of its own, under the npm package. Not client work, no case study. */
@Component({
  selector: 'mh-faaa-card',
  imports: [NgIcon],
  viewProviders: [provideIcons({ phosphorBellRinging })],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="faaa" aria-labelledby="faaa-title">
      <div class="wrap">
        <article class="card faaa-card">
          <span class="icon-tile" aria-hidden="true"><ng-icon name="phosphorBellRinging" /></span>
          <div class="text">
            <p class="meta mono">
              <span class="badge">{{ t.label }}</span>
              @for (m of t.meta; track m; let last = $last) {
                <span>{{ m }}</span>@if (!last) {<span aria-hidden="true"> · </span>}
              }
            </p>
            <h2 class="title-sm" id="faaa-title">{{ t.title }}</h2>
            <p class="body">{{ t.body }}</p>
          </div>
          <div class="side">
            <ul class="tag-list" role="list" aria-label="Features">
              @for (f of t.features; track f) {
                <li class="badge">{{ f }}</li>
              }
            </ul>
            <ul class="tag-list" role="list" aria-label="Stack">
              @for (s of t.stack; track s) {
                <li class="tag">{{ s }}</li>
              }
            </ul>
          </div>
        </article>
      </div>
    </section>
  `,
  styles: `
    :host {
      display: block;
    }
    .faaa {
      padding-top: 12px;
    }
    .faaa-card {
      display: grid;
      grid-template-columns: auto minmax(0, 1.2fr) minmax(0, 1fr);
      gap: 18px 24px;
      align-items: start;
      padding: 18px 22px;
    }
    .meta {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 4px 6px;
      margin: 0;
      font-size: 12.5px;
      color: var(--muted);
    }
    .meta .badge {
      margin-right: 6px;
      font-family: var(--font-sans);
    }
    .title-sm {
      margin: 8px 0 4px;
      font-size: 1.15rem;
      line-height: 1.25;
      letter-spacing: -0.02em;
      font-weight: 600;
    }
    .body {
      margin: 0;
      max-width: 60ch;
      color: var(--ink-2);
      font-size: 14.5px;
    }
    .side {
      display: grid;
      gap: 8px;
      justify-items: end;
    }
    .side .tag-list {
      justify-content: flex-end;
    }
    @media (max-width: 900px) {
      .faaa-card {
        grid-template-columns: auto minmax(0, 1fr);
        align-items: start;
      }
      .side {
        grid-column: 1 / -1;
        justify-items: start;
      }
      .side .tag-list {
        justify-content: flex-start;
      }
    }
    /* Phones: icon above the text, so the copy gets the full card width. */
    @media (max-width: 520px) {
      .faaa-card {
        grid-template-columns: minmax(0, 1fr);
        gap: 14px;
      }
    }
  `,
})
export class FaaaCard {
  protected readonly t = COPY;
}
