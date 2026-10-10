import { ChangeDetectionStrategy, Component, DestroyRef, ElementRef, afterNextRender, inject, signal, viewChildren } from '@angular/core';
import { Reveal } from '../../../shared/directives/reveal.directive';
import { COPY } from '../brand.copy';
import { TYPE_SCALE } from '../brand.data';

/** Typography: the two families, the scale rendered with the real classes (live computed size), mono rules. */
@Component({
  selector: 'mh-brand-type',
  imports: [Reveal],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="bp-head" mhReveal>
      <h2 class="title" id="type-title">{{ t.title }}</h2>
      <p class="sub">{{ t.sub }}</p>
    </header>

    <div class="bp-grid">
      <figure class="card fam">
        <span class="fam__aa" aria-hidden="true">Aa</span>
        <figcaption>
          <b>{{ t.sans }}</b>
          <span>{{ t.sansNote }}</span>
        </figcaption>
        <p class="fam__w" aria-hidden="true"><span style="font-weight: 400">Regular 400</span><span style="font-weight: 500">Medium 500</span><span style="font-weight: 600">Semibold 600</span></p>
      </figure>
      <figure class="card card--solid fam fam--mono">
        <span class="fam__aa" aria-hidden="true">0123</span>
        <figcaption>
          <b>{{ t.mono }}</b>
          <span>{{ t.monoNote }}</span>
        </figcaption>
        <p class="fam__w" aria-hidden="true"><span>$ npm start</span><span>v21.2.0</span><span>14:05 UTC+5</span></p>
      </figure>
    </div>

    <div class="bp-subhead">
      <h3 class="h3">{{ t.scale }}</h3>
      <p>Live specimens. The size on the right is measured at your current viewport.</p>
    </div>

    <ol class="scale card" role="list">
      @for (s of scale; track s.cls; let i = $index) {
        <li class="step">
          <div class="step__meta">
            <code class="step__cls">.{{ s.cls }}</code>
            <span class="step__px mono">{{ px()[i] || '' }}</span>
          </div>
          <div class="step__sample">
            @if (s.cls === 'display') {
              <p #sample class="display">
                <span class="line"><span>{{ s.sample }}</span></span>
                <span class="line"><span class="soft">{{ s.soft }}</span></span>
              </p>
            } @else {
              <p #sample [class]="s.cls">{{ s.sample }}</p>
            }
          </div>
          <dl class="step__spec">
            <div><dt>size</dt><dd>{{ s.size }}</dd></div>
            <div><dt>leading</dt><dd>{{ s.leading }}</dd></div>
            <div><dt>tracking</dt><dd>{{ s.tracking }}</dd></div>
            <div><dt>weight</dt><dd>{{ s.weight }}</dd></div>
          </dl>
          <p class="step__use">{{ s.use }}</p>
        </li>
      }
    </ol>

    <div class="bp-subhead">
      <h3 class="h3">{{ t.monoRules }}</h3>
    </div>
    <div class="card">
      <ul class="bp-list" role="list">
        @for (r of t.monoList; track r) {
          <li>{{ r }}</li>
        }
      </ul>
    </div>
  `,
  styles: `
    .fam {
      margin: 0;
      display: grid;
      gap: 18px;
      align-content: start;
    }
    .fam__aa {
      font-size: clamp(4rem, 9vw, 6.5rem);
      line-height: 0.9;
      font-weight: 600;
      letter-spacing: -0.05em;
    }
    .fam--mono .fam__aa {
      font-family: var(--font-mono);
      font-weight: 400;
      letter-spacing: -0.04em;
    }
    figcaption {
      display: grid;
      gap: 2px;
    }
    figcaption b {
      font-weight: 600;
    }
    figcaption span {
      font-size: 14px;
      color: var(--muted);
    }
    .fam--mono figcaption span,
    .fam--mono .fam__w {
      color: color-mix(in oklab, var(--solid-ink) 70%, transparent);
    }
    .fam__w {
      display: flex;
      flex-wrap: wrap;
      gap: 6px 18px;
      font-size: 14px;
      color: var(--ink-2);
      padding-top: 14px;
      border-top: 1px solid var(--line);
    }
    .fam--mono .fam__w {
      font-family: var(--font-mono);
      font-size: 13px;
      border-color: var(--solid-edge);
    }
    .scale {
      padding: 0 26px;
    }
    .step {
      display: grid;
      grid-template-columns: 112px minmax(0, 1fr) 220px;
      grid-template-areas: 'meta sample spec' 'meta use spec';
      grid-template-rows: auto 1fr;
      gap: 4px 28px;
      padding: 28px 0;
      border-bottom: 1px solid var(--line);
    }
    .step:last-child {
      border-bottom: 0;
    }
    .step__meta {
      grid-area: meta;
      display: grid;
      align-content: start;
      gap: 4px;
    }
    .step__cls {
      font-size: 13px;
      color: var(--ink);
    }
    .step__px {
      font-size: 12px;
      color: var(--muted);
      font-variant-numeric: tabular-nums;
    }
    .step__sample {
      grid-area: sample;
      min-width: 0;
    }
    .step__sample p {
      margin: 0;
      max-width: none;
    }
    .step__sample .title {
      max-width: 18ch;
    }
    .step__use {
      grid-area: use;
      font-size: 13.5px;
      color: var(--muted);
      margin-top: 8px;
    }
    .step__spec {
      grid-area: spec;
      display: grid;
      align-content: start;
      gap: 4px;
      margin: 0;
      font-family: var(--font-mono);
      font-size: 11.5px;
    }
    .step__spec div {
      display: flex;
      gap: 8px;
    }
    .step__spec dt {
      color: var(--muted);
      min-width: 60px;
    }
    .step__spec dd {
      color: var(--ink-2);
      overflow-wrap: anywhere;
    }
    @media (max-width: 1240px) {
      .step {
        grid-template-columns: 96px minmax(0, 1fr);
        grid-template-areas: 'meta sample' 'meta use' 'meta spec';
        grid-template-rows: auto;
      }
      .step__spec {
        margin-top: 10px;
        display: flex;
        flex-wrap: wrap;
        gap: 4px 18px;
      }
      .step__spec dt {
        min-width: 0;
      }
    }
    @media (max-width: 560px) {
      .scale {
        padding: 0 18px;
      }
      .step {
        grid-template-columns: minmax(0, 1fr);
        grid-template-areas: 'meta' 'sample' 'use' 'spec';
        grid-template-rows: auto;
        gap: 8px;
      }
      .step__meta {
        display: flex;
        gap: 12px;
        align-items: baseline;
      }
    }
  `,
})
export class BrandType {
  protected readonly t = COPY.type;
  protected readonly scale = TYPE_SCALE;
  protected readonly px = signal<string[]>([]);
  private readonly samples = viewChildren<ElementRef<HTMLElement>>('sample');

  constructor() {
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      let frame = 0;
      const measure = () => {
        cancelAnimationFrame(frame);
        frame = requestAnimationFrame(() =>
          this.px.set(this.samples().map((s) => `${Math.round(parseFloat(getComputedStyle(s.nativeElement).fontSize))}px`)),
        );
      };
      measure();
      document.fonts?.ready.then(measure);
      window.addEventListener('resize', measure, { passive: true });
      destroyRef.onDestroy(() => {
        cancelAnimationFrame(frame);
        window.removeEventListener('resize', measure);
      });
    });
  }
}
