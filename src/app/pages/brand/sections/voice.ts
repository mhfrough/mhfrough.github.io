import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Reveal } from '../../../shared/directives/reveal.directive';
import { COPY } from '../brand.copy';

/** Voice and copy: the house rules, one label per CTA intent, and paired before/after rows (Quorum's tensions). */
@Component({
  selector: 'mh-brand-voice',
  imports: [Reveal],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="bp-head" mhReveal>
      <h2 class="title" id="voice-title">{{ t.title }}</h2>
      <p class="sub">{{ t.sub }}</p>
    </header>

    <div class="bp-grid">
      <div class="card">
        <h3 class="bp-card-title">House rules</h3>
        <p class="bp-card-note">Checked before anything ships.</p>
        <dl class="bp-kv rules">
          @for (r of t.rules; track r.k) {
            <div>
              <dt>{{ r.k }}</dt>
              <dd>{{ r.v }}</dd>
            </div>
          }
        </dl>
      </div>
      <div class="card card--solid ctas">
        <h3 class="bp-card-title">{{ t.ctas }}</h3>
        <p class="bp-card-note">{{ t.ctasNote }}</p>
        <ul role="list">
          @for (c of t.ctaList; track c.label) {
            <li>
              <span>{{ c.intent }}</span>
              <span class="ctas__btn">{{ c.label }}</span>
            </li>
          }
        </ul>
      </div>
    </div>

    <ul class="pairs" role="list">
      @for (p of t.pairs; track p.yes) {
        <li class="pair card">
          <span class="side side--no"><span class="tag">{{ t.avoid }}</span><s>{{ p.no }}</s></span>
          <span class="vs mono" aria-hidden="true">vs</span>
          <span class="side"><span class="tag">{{ t.write }}</span>{{ p.yes }}</span>
        </li>
      }
    </ul>
  `,
  styles: `
    .rules dt {
      font-family: var(--font-sans);
      font-size: 14.5px;
      font-weight: 500;
    }
    .rules > div {
      grid-template-columns: 1fr;
      gap: 2px;
    }
    .ctas .bp-card-note {
      color: color-mix(in oklab, var(--solid-ink) 65%, transparent);
    }
    .ctas ul {
      display: grid;
    }
    .ctas li {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      padding: 12px 0;
      border-top: 1px solid var(--solid-edge);
      font-size: 14.5px;
      color: color-mix(in oklab, var(--solid-ink) 75%, transparent);
    }
    .ctas__btn {
      display: inline-flex;
      align-items: center;
      height: 36px;
      padding: 0 16px;
      border-radius: 999px;
      background: var(--cta);
      color: var(--cta-ink);
      font-size: 14px;
      font-weight: 500;
      white-space: nowrap;
    }
    .pairs {
      display: grid;
      gap: 12px;
      margin-top: 12px;
    }
    .pair {
      display: grid;
      grid-template-columns: 1fr auto 1fr;
      align-items: center;
      gap: 24px;
      padding: 22px 26px;
    }
    .side {
      display: flex;
      align-items: center;
      gap: 12px;
      font-weight: 600;
      font-size: 1.05rem;
      letter-spacing: -0.015em;
      min-width: 0;
    }
    .side .tag {
      flex-shrink: 0;
    }
    .side--no {
      color: var(--muted);
      font-weight: 500;
    }
    .side--no s {
      text-decoration-color: var(--line-strong);
    }
    .vs {
      font-size: 12px;
      color: var(--muted);
      border: 1px solid var(--line);
      border-radius: 999px;
      padding: 4px 10px;
    }
    @media (max-width: 760px) {
      .pair {
        grid-template-columns: 1fr;
        gap: 12px;
        padding: 20px;
      }
      .vs {
        display: none;
      }
    }
  `,
})
export class BrandVoice {
  protected readonly t = COPY.voice;
}
