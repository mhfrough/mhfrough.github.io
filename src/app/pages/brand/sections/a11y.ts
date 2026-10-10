import { ChangeDetectionStrategy, Component, ElementRef, afterNextRender, signal, viewChildren } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  phosphorArrowRight,
  phosphorCursorClick,
  phosphorEye,
  phosphorList,
  phosphorPause,
  phosphorSelection,
  phosphorStack,
  phosphorTreeStructure,
} from '@ng-icons/phosphor-icons/regular';
import { Reveal } from '../../../shared/directives/reveal.directive';
import { COPY } from '../brand.copy';
import { TkPipe } from './tk.pipe';

/** Accessibility: the AA targets as cards, a live focus ring and measured target sizes. */
@Component({
  selector: 'mh-brand-a11y',
  imports: [Reveal, NgIcon, TkPipe],
  viewProviders: [
    provideIcons({
      phosphorEye,
      phosphorCursorClick,
      phosphorSelection,
      phosphorTreeStructure,
      phosphorPause,
      phosphorStack,
      phosphorArrowRight,
      phosphorList,
    }),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="bp-head" mhReveal>
      <h2 class="title" id="a11y-title">{{ t.title }}</h2>
      <p class="sub">{{ t.sub }}</p>
    </header>

    <ul class="bp-grid items" role="list">
      @for (it of t.items; track it.k; let i = $index) {
        <li class="card item" [class.card--solid]="i === 2" mhReveal [revealIndex]="i % 2">
          <span class="icon-well"><ng-icon [name]="it.icon" aria-hidden="true" /></span>
          <div>
            <h3 class="h3">{{ it.k }}</h3>
            <p [innerHTML]="it.v | tk"></p>
          </div>
        </li>
      }
    </ul>

    <div class="bp-grid tools">
      <div class="card">
        <h3 class="bp-card-title">{{ t.focus }}</h3>
        <p class="bp-card-note">{{ t.focusNote }}</p>
        <div class="row">
          <button type="button" class="btn btn-solid">Primary</button>
          <button type="button" class="btn btn-ghost">Ghost</button>
          <button type="button" class="chip" aria-pressed="false">Chip</button>
          <a class="link" href="#a11y">Inline link</a>
        </div>
        <dl class="bp-kv ring">
          <div><dt>outline</dt><dd>2px solid var(--accent)</dd></div>
          <div><dt>offset</dt><dd>3px, 1px on inputs</dd></div>
          <div><dt>radius</dt><dd>999px, follows the pill</dd></div>
          <div><dt>trigger</dt><dd>:focus-visible; fields on :focus</dd></div>
        </dl>
      </div>
      <div class="card">
        <h3 class="bp-card-title">{{ t.target }}</h3>
        <p class="bp-card-note">Heights read from the rendered elements.</p>
        <ul class="measure" role="list">
          @for (m of targets; track m.cls; let i = $index) {
            <li>
              <span #probe [class]="m.cls" aria-hidden="true">
                @if (m.icon) {
                  <ng-icon name="phosphorList" />
                } @else {
                  {{ m.label }}
                }
              </span>
              <code>.{{ m.cls.split(' ').join('.') }}</code>
              <span class="mono">{{ heights()[i] || m.h }}px</span>
            </li>
          }
        </ul>
      </div>
    </div>
  `,
  styles: `
    .item {
      display: grid;
      grid-template-columns: 52px minmax(0, 1fr);
      gap: 18px;
      padding: 24px;
    }
    .item .h3 {
      margin: 2px 0 6px;
    }
    .item p {
      color: var(--ink-2);
      font-size: 15px;
    }
    .item.card--solid p {
      color: color-mix(in oklab, var(--solid-ink) 72%, transparent);
    }
    .item.card--solid .icon-well {
      background: color-mix(in oklab, var(--solid-ink) 12%, transparent);
      color: var(--solid-ink);
    }
    .tools {
      margin-top: 12px;
    }
    .row {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 12px 14px;
    }
    .ring {
      margin-top: 24px;
    }
    .ring dd {
      font-family: var(--font-mono);
      font-size: 12.5px;
    }
    .measure {
      display: grid;
    }
    .measure li {
      display: grid;
      grid-template-columns: 132px minmax(0, 1fr) auto;
      align-items: center;
      gap: 12px;
      padding: 8px 0;
      border-top: 1px solid var(--line);
    }
    .measure li:first-child {
      border-top: 0;
      padding-top: 0;
    }
    .measure code {
      font-size: 12px;
      color: var(--ink-2);
      overflow-wrap: anywhere;
    }
    .measure .mono {
      font-size: 12.5px;
      color: var(--ink);
      font-variant-numeric: tabular-nums;
    }
    .measure .btn,
    .measure .chip,
    .measure .input {
      pointer-events: none;
      justify-self: start;
    }
    .measure .input {
      width: 120px;
      display: flex;
      align-items: center;
      color: var(--muted);
    }
  `,
})
export class BrandA11y {
  protected readonly t = COPY.a11y;
  protected readonly targets = [
    { cls: 'btn btn-solid', label: 'Button', h: 44 },
    { cls: 'input', label: 'Input', h: 46 },
    { cls: 'icon-btn', label: '', h: 40, icon: true },
    { cls: 'chip', label: 'Chip', h: 32 },
  ];
  protected readonly heights = signal<number[]>([]);
  private readonly probes = viewChildren<ElementRef<HTMLElement>>('probe');

  constructor() {
    afterNextRender(() => this.heights.set(this.probes().map((p) => Math.round(p.nativeElement.getBoundingClientRect().height))));
  }
}
