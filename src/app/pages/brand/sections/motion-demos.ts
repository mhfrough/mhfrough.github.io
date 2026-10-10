import { ChangeDetectionStrategy, Component, DestroyRef, ElementRef, afterNextRender, inject, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { phosphorArrowCounterClockwise } from '@ng-icons/phosphor-icons/regular';
import { COPY } from '../brand.copy';

/**
 * Replayable motion demos (deferred). They use the real global classes (.hero-anim/.ready, .rise .d2 .d4,
 * .reveal/.in), so prefers-reduced-motion is handled by _motion.scss exactly as on every other page.
 */
@Component({
  selector: 'mh-brand-motion-demos',
  imports: [NgIcon],
  viewProviders: [provideIcons({ phosphorArrowCounterClockwise })],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (reduced()) {
      <p class="bp-callout reduced" role="status">{{ t.reduced }}</p>
    }
    <div class="demos">
      <figure class="card demo">
        <div class="demo__stage hero-anim" #s1>
          <p class="display demo__display">
            <span class="line"><span>One decision.</span></span>
            <span class="line"><span class="soft">Seven minds.</span></span>
          </p>
        </div>
        <figcaption>
          <span><b>Line rise</b><code>.hero-anim.ready .display .line > span</code></span>
          <button type="button" class="btn btn-ghost btn-sm" (click)="replay(s1)">
            <ng-icon name="phosphorArrowCounterClockwise" aria-hidden="true" />{{ t.replay }}<span class="sr-only"> line rise</span>
          </button>
        </figcaption>
      </figure>

      <figure class="card demo">
        <div class="demo__stage hero-anim" #s2>
          <div class="demo__stack">
            <span class="pill-link rise"><b>01</b>.rise</span>
            <span class="pill-link rise d2"><b>02</b>.rise.d2, +0.26s</span>
            <span class="pill-link rise d4"><b>03</b>.rise.d4, +0.42s</span>
          </div>
        </div>
        <figcaption>
          <span><b>Rise stagger</b><code>.rise .d2 .d4</code></span>
          <button type="button" class="btn btn-ghost btn-sm" (click)="replay(s2)">
            <ng-icon name="phosphorArrowCounterClockwise" aria-hidden="true" />{{ t.replay }}<span class="sr-only"> rise stagger</span>
          </button>
        </figcaption>
      </figure>

      <figure class="card demo demo--wide">
        <div class="demo__stage" #s3>
          <ol class="demo__cards" role="list">
            @for (c of cards; track c; let i = $index) {
              <li class="reveal" [style.--i]="i">
                <span class="mono">{{ i * 55 }}ms</span>{{ c }}
              </li>
            }
          </ol>
        </div>
        <figcaption>
          <span><b>Scroll reveal</b><code>[mhReveal] [revealIndex], 55ms per step</code></span>
          <button type="button" class="btn btn-ghost btn-sm" (click)="replay(s3)">
            <ng-icon name="phosphorArrowCounterClockwise" aria-hidden="true" />{{ t.replay }}<span class="sr-only"> scroll reveal</span>
          </button>
        </figcaption>
      </figure>
    </div>
  `,
  styles: `
    .is-reset,
    .is-reset * {
      transition: none !important;
    }
    .reduced {
      margin: 0 0 12px;
    }
    .demos {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 12px;
    }
    .demo {
      margin: 0;
      padding: 0;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }
    .demo--wide {
      grid-column: 1 / -1;
    }
    .demo__stage {
      flex: 1;
      min-height: 188px;
      padding: 28px 26px;
      display: grid;
      align-items: center;
    }
    .demo__display {
      font-size: clamp(1.9rem, 3.4vw, 2.6rem);
      margin: 0;
    }
    .demo__stack {
      display: grid;
      justify-items: start;
      gap: 8px;
    }
    .demo__stack .pill-link {
      font-family: var(--font-mono);
      font-size: 12.5px;
    }
    .demo__cards {
      display: grid;
      grid-template-columns: repeat(5, minmax(0, 1fr));
      gap: 10px;
    }
    .demo__cards li {
      display: grid;
      gap: 6px;
      padding: 16px;
      border-radius: var(--r-inner);
      background: var(--surface-2);
      border: 1px solid var(--line);
      font-size: 14px;
      font-weight: 500;
    }
    .demo__cards .mono {
      font-size: 11.5px;
      color: var(--muted);
      font-weight: 400;
    }
    figcaption {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      padding: 10px 10px 10px 20px;
      border-top: 1px solid var(--line);
    }
    figcaption > span {
      display: grid;
      min-width: 0;
      line-height: 1.35;
    }
    figcaption b {
      font-size: 14px;
      font-weight: 500;
    }
    figcaption code {
      font-size: 12px;
      color: var(--muted);
      overflow-wrap: anywhere;
    }
    figcaption .btn {
      flex-shrink: 0;
    }
    @media (max-width: 760px) {
      .demos {
        grid-template-columns: minmax(0, 1fr);
      }
      .demo__cards {
        grid-template-columns: minmax(0, 1fr);
        gap: 6px;
      }
      .demo__cards li {
        display: flex;
        align-items: baseline;
        justify-content: space-between;
        flex-direction: row-reverse;
        padding: 12px 16px;
      }
    }
  `,
})
export class BrandMotionDemos {
  protected readonly t = COPY.motion;
  protected readonly cards = ['Frame', 'Debate', 'Vote', 'Count', 'Ask'];
  protected readonly reduced = signal(false);

  constructor() {
    const destroyRef = inject(DestroyRef);
    const host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    afterNextRender(() => {
      const mq = matchMedia('(prefers-reduced-motion: reduce)');
      const sync = () => this.reduced.set(mq.matches);
      sync();
      mq.addEventListener('change', sync);
      destroyRef.onDestroy(() => mq.removeEventListener('change', sync));
      // First play when the demos arrive (they are deferred until near the viewport).
      const id = setTimeout(() => host.querySelectorAll<HTMLElement>('.demo__stage').forEach((s) => this.replay(s)), 250);
      destroyRef.onDestroy(() => clearTimeout(id));
    });
  }

  /** Snap back to the start state with transitions off, then add the end-state class again. */
  protected replay(stage: HTMLElement): void {
    const hero = stage.classList.contains('hero-anim');
    const cls = hero ? 'ready' : 'in';
    const items = hero ? [stage] : Array.from(stage.querySelectorAll<HTMLElement>('.reveal'));
    stage.classList.add('is-reset');
    items.forEach((i) => i.classList.remove(cls));
    void stage.offsetWidth;
    stage.classList.remove('is-reset');
    requestAnimationFrame(() => items.forEach((i) => i.classList.add(cls)));
  }
}
