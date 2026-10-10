import { ChangeDetectionStrategy, Component, afterNextRender, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { phosphorGithubLogo } from '@ng-icons/phosphor-icons/regular';
import { Reveal } from '../../../shared/directives/reveal.directive';
import { COPY } from '../brand.copy';
import { readVar } from '../brand.util';
import { TkPipe } from './tk.pipe';

/** Shape, space, elevation: the shape rule, spacing rhythm at true size, shadows, glass and layers. */
@Component({
  selector: 'mh-brand-shape',
  imports: [Reveal, NgIcon, TkPipe],
  viewProviders: [provideIcons({ phosphorGithubLogo })],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="bp-head" mhReveal>
      <h2 class="title" id="shape-title">{{ t.title }}</h2>
      <p class="sub">{{ t.sub }}</p>
    </header>

    <div class="bp-subhead">
      <h3 class="h3">{{ t.shapeRule }}</h3>
      <p>Containers hold, pills act. Nesting steps the radius down so inner corners stay parallel.</p>
    </div>
    <div class="nest card" aria-hidden="true">
      <span class="nest__tag mono">--r-card 20px</span>
      <div class="nest__inner">
        <span class="nest__tag mono">--r-inner 14px</span>
        <div class="nest__row">
          <span class="btn btn-solid btn-sm">Pill</span>
          <span class="chip">Chip</span>
          <span class="badge">Badge</span>
          <span class="nest__tag mono">--r-pill 999px</span>
        </div>
      </div>
    </div>
    <dl class="bp-kv radii card">
      @for (n of t.nesting; track n.cls) {
        <div>
          <dt>{{ n.cls }} <span class="muted">{{ live()[n.cls] || n.v }}</span></dt>
          <dd>{{ n.what }}</dd>
        </div>
      }
    </dl>

    <div class="bp-subhead">
      <h3 class="h3">{{ t.space }}</h3>
      <p>{{ t.spaceNote }}</p>
    </div>
    <ul class="space card" role="list">
      @for (s of t.spacing; track s.k) {
        <li>
          <span class="space__k">{{ s.k }}</span>
          <span class="space__bar" [style.width.px]="s.v" aria-hidden="true"></span>
          <span class="space__v mono">{{ s.v }}px <span class="muted">{{ s.m }}</span></span>
        </li>
      }
    </ul>

    <div class="bp-subhead">
      <h3 class="h3">{{ t.elevation }}</h3>
      <p>{{ t.elevationNote }}</p>
    </div>
    <div class="bp-grid bp-grid--3">
      <div class="card lvl">
        <b>{{ t.flat }}</b>
        <span>{{ t.flatNote }}</span>
        <code>.card</code>
      </div>
      <div class="card card--hover lvl">
        <b>{{ t.hover }}</b>
        <span [innerHTML]="'Lifts 3px, gains --shadow.' | tk"></span>
        <code>.card.card--hover</code>
      </div>
      <div class="card card--lift lvl">
        <b>Lift</b>
        <span>The hero card. One per page.</span>
        <code>.card.card--lift</code>
      </div>
    </div>

    <div class="bp-grid glass-row">
      <div class="card glass-demo">
        <div class="glass-demo__bg" aria-hidden="true">
          @for (l of glassLines; track $index) {
            <p>{{ l }}</p>
          }
        </div>
        <div class="glass-demo__pill" aria-hidden="true">
          <span class="glass-demo__tile"></span>
          <span class="glass-demo__name">{{ t.glassBrand }}</span>
          <span class="icon-btn"><ng-icon name="phosphorGithubLogo" /></span>
        </div>
        <p class="glass-demo__note"><b>{{ t.glass }}.</b>&ngsp;<span [innerHTML]="t.glassNote | tk"></span></p>
      </div>
      <div class="card">
        <h4 class="bp-card-title">{{ t.z }}</h4>
        <p class="bp-card-note">{{ t.zNote }}</p>
        <dl class="bp-kv">
          @for (z of t.zTokens; track z.name) {
            <div>
              <dt>{{ z.name }} <span class="muted">{{ live()[z.name] || z.v }}</span></dt>
              <dd>{{ z.what }}</dd>
            </div>
          }
        </dl>
      </div>
    </div>
  `,
  styles: `
    .nest {
      position: relative;
      padding: 40px 26px 26px;
    }
    .nest__tag {
      position: absolute;
      top: 12px;
      left: 18px;
      font-size: 11.5px;
      color: var(--muted);
    }
    .nest__inner {
      position: relative;
      padding: 40px 22px 22px;
      border-radius: var(--r-inner);
      background: var(--surface-2);
      border: 1px solid var(--line);
    }
    .nest__row {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 10px;
    }
    .nest__row .nest__tag {
      position: static;
      margin-left: 6px;
    }
    .radii {
      margin-top: 12px;
    }
    .space {
      display: grid;
      padding: 26px;
    }
    .space li {
      display: grid;
      grid-template-columns: 160px 120px minmax(0, 1fr);
      align-items: center;
      gap: 16px;
      padding: 12px 0;
      border-bottom: 1px solid var(--line);
    }
    .space li:first-child {
      padding-top: 0;
    }
    .space li:last-child {
      border-bottom: 0;
      padding-bottom: 0;
    }
    .space__k {
      font-size: 14.5px;
      color: var(--ink-2);
    }
    .space__bar {
      height: 10px;
      border-radius: 999px;
      background: var(--ink);
      max-width: 120px;
    }
    .space__v {
      font-size: 12.5px;
      color: var(--ink);
    }
    .lvl {
      display: grid;
      gap: 4px;
      min-height: 150px;
      align-content: start;
    }
    .lvl span {
      color: var(--muted);
      font-size: 14px;
    }
    .lvl code {
      margin-top: auto;
      padding-top: 18px;
      font-size: 12px;
      color: var(--ink-2);
    }
    .glass-row {
      margin-top: 12px;
    }
    .glass-demo {
      position: relative;
      overflow: hidden;
      padding: 0;
      display: grid;
    }
    .glass-demo__bg {
      height: 196px;
      overflow: hidden;
      padding: 22px 26px 0;
      font-size: 15px;
      line-height: 1.6;
      color: var(--ink-2);
      border-bottom: 1px solid var(--line);
      mask-image: linear-gradient(#000 70%, transparent);
      -webkit-mask-image: linear-gradient(#000 70%, transparent);
    }
    .glass-demo__bg p + p {
      margin-top: 10px;
    }
    .glass-demo__bg p:nth-child(2) {
      font-size: 1.5rem;
      line-height: 1.2;
      font-weight: 600;
      letter-spacing: -0.03em;
      color: var(--ink);
    }
    .glass-demo__pill {
      position: absolute;
      top: 52px;
      left: 18px;
      right: 18px;
      height: 52px;
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 0 6px 0 10px;
      border-radius: 999px;
      background: color-mix(in oklab, var(--surface) 62%, transparent);
      -webkit-backdrop-filter: blur(18px) saturate(1.6);
      backdrop-filter: blur(18px) saturate(1.6);
      border: 1px solid var(--glass-edge);
      box-shadow:
        inset 0 1px 0 var(--glass-hi),
        0 8px 24px -12px rgb(0 0 0 / 0.5);
    }
    @media (prefers-reduced-transparency: reduce) {
      .glass-demo__pill {
        background: var(--surface);
        backdrop-filter: none;
        -webkit-backdrop-filter: none;
      }
    }
    .glass-demo__tile {
      width: 30px;
      height: 30px;
      border-radius: 9px;
      background: var(--cta);
    }
    .glass-demo__name {
      flex: 1;
      font-size: 14px;
      font-weight: 600;
    }
    .glass-demo__pill .icon-btn {
      width: 38px;
      height: 38px;
    }
    .glass-demo__note {
      padding: 20px 26px 26px;
      font-size: 14px;
      color: var(--ink-2);
    }
    @media (max-width: 640px) {
      .space li {
        grid-template-columns: minmax(0, 1fr) auto;
        gap: 8px 12px;
      }
      .space__v {
        grid-column: 1 / -1;
      }
    }
  `,
})
export class BrandShape {
  protected readonly t = COPY.shape;
  protected readonly live = signal<Record<string, string>>({});
  protected readonly glassLines = [
    'Nearly 7 years of production SaaS, fintech and enterprise platforms.',
    'Content scrolls under the nav.',
    'The pill stays legible over anything: blur, a little saturation, a 62% surface and a 1px inner highlight.',
  ];

  constructor() {
    afterNextRender(() => {
      const names = [...this.t.nesting.map((n) => n.cls), ...this.t.zTokens.map((z) => z.name)];
      this.live.set(Object.fromEntries(names.map((n) => [n, readVar(n)])));
    });
  }
}
