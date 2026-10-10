import { ChangeDetectionStrategy, Component, afterNextRender, signal } from '@angular/core';
import { Reveal } from '../../../shared/directives/reveal.directive';
import { Skeleton } from '../../../shared/ui/skeleton';
import { COPY } from '../brand.copy';
import { readVar } from '../brand.util';
import { BrandMotionDemos } from './motion-demos';

type Pts = readonly number[];

/** Motion: easing curves (plotted from the live tokens), durations, replayable demos and the owner's rules. */
@Component({
  selector: 'mh-brand-motion',
  imports: [Reveal, Skeleton, BrandMotionDemos],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="bp-head" mhReveal>
      <h2 class="title" id="motion-title">{{ t.title }}</h2>
      <p class="sub">{{ t.sub }}</p>
    </header>

    <div class="bp-subhead">
      <h3 class="h3">{{ t.tokens }}</h3>
    </div>
    <div class="bp-grid">
      @for (e of t.eases; track e.name; let i = $index) {
        <figure class="card ease">
          <svg viewBox="-8 -8 116 116" aria-hidden="true">
            <rect class="ease__box" x="0" y="0" width="100" height="100" rx="2" />
            <line class="ease__h" x1="0" y1="100" [attr.x2]="pts()[i][0] * 100" [attr.y2]="(1 - pts()[i][1]) * 100" />
            <line class="ease__h" x1="100" y1="0" [attr.x2]="pts()[i][2] * 100" [attr.y2]="(1 - pts()[i][3]) * 100" />
            <path class="ease__c" [attr.d]="curve(pts()[i])" />
            <circle class="ease__p" [attr.cx]="pts()[i][0] * 100" [attr.cy]="(1 - pts()[i][1]) * 100" r="2.4" />
            <circle class="ease__p" [attr.cx]="pts()[i][2] * 100" [attr.cy]="(1 - pts()[i][3]) * 100" r="2.4" />
          </svg>
          <figcaption>
            <code class="ease__n">{{ e.name }}</code>
            <code class="ease__v">{{ raw()[i] || e.v }}</code>
            <span>{{ e.what }}</span>
          </figcaption>
        </figure>
      }
      <div class="card span-all">
        <dl class="bp-kv">
          @for (d of t.durations; track d.name) {
            <div>
              <dt>{{ d.name }} <span class="muted">{{ d.v }}</span></dt>
              <dd>{{ d.what }}</dd>
            </div>
          }
        </dl>
      </div>
    </div>

    <div class="bp-subhead">
      <h3 class="h3">{{ t.demos }}</h3>
      <p>Each demo uses the global classes, so reduced motion behaves here exactly as it does on every page.</p>
    </div>
    @defer (on viewport) {
      <mh-brand-motion-demos />
    } @placeholder (minimum 300ms) {
      <div class="bp-grid" aria-hidden="true">
        <mh-skeleton shape="block" height="250px" class="bp-skel" />
        <mh-skeleton shape="block" height="250px" class="bp-skel" />
        <mh-skeleton shape="block" height="210px" class="bp-skel span-all" />
      </div>
    }

    <div class="bp-subhead">
      <h3 class="h3">{{ t.rules }}</h3>
    </div>
    <div class="card">
      <ul class="bp-list" role="list">
        @for (r of t.ruleList; track r) {
          <li>{{ r }}</li>
        }
      </ul>
    </div>
  `,
  styles: `
    .ease {
      margin: 0;
      display: grid;
      grid-template-columns: 132px minmax(0, 1fr);
      gap: 22px;
      align-items: center;
    }
    svg {
      width: 100%;
      overflow: visible;
    }
    .ease__box {
      fill: var(--surface-2);
      stroke: var(--line);
      stroke-width: 0.8;
    }
    .ease__h {
      stroke: var(--muted);
      stroke-width: 0.8;
    }
    .ease__c {
      fill: none;
      stroke: var(--ink);
      stroke-width: 2.4;
      stroke-linecap: round;
    }
    .ease__p {
      fill: var(--bg);
      stroke: var(--ink);
      stroke-width: 1.2;
    }
    figcaption {
      display: grid;
      gap: 4px;
      min-width: 0;
    }
    .ease__n {
      font-size: 14px;
      color: var(--ink);
    }
    .ease__v {
      font-size: 12px;
      color: var(--ink-2);
      overflow-wrap: anywhere;
    }
    figcaption span {
      font-size: 14px;
      color: var(--muted);
    }
    @media (max-width: 420px) {
      .ease {
        grid-template-columns: 96px minmax(0, 1fr);
        gap: 16px;
      }
    }
  `,
})
export class BrandMotion {
  protected readonly t = COPY.motion;
  protected readonly pts = signal<Pts[]>(COPY.motion.eases.map((e) => e.p));
  protected readonly raw = signal<string[]>([]);

  constructor() {
    afterNextRender(() => {
      const raw = this.t.eases.map((e) => readVar(e.name));
      this.raw.set(raw);
      this.pts.set(
        raw.map((r, i) => {
          const n = r.match(/-?\d*\.?\d+/g)?.map(Number);
          return n && n.length === 4 ? n : this.t.eases[i].p;
        }),
      );
    });
  }

  protected curve(p: Pts): string {
    const y = (v: number) => (1 - v) * 100;
    return `M0 100C${p[0] * 100} ${y(p[1])} ${p[2] * 100} ${y(p[3])} 100 0`;
  }
}
