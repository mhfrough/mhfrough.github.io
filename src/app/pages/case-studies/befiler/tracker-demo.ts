import { ChangeDetectionStrategy, Component, DestroyRef, ElementRef, afterNextRender, computed, inject, input, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { phosphorArrowCounterClockwise, phosphorCheck } from '@ng-icons/phosphor-icons/regular';

/**
 * The customer-facing case tracker, redrawn as my own mockup. The five stages are the real ones the
 * dashboard shows. Plays once when scrolled into view; Replay runs it again. Reduced motion: final state.
 */
const STAGES = [
  { t: 'NTN registration', s: 'Getting your NTN or updating FBR' },
  { t: 'Case in queue', s: 'Waiting for a tax lawyer' },
  { t: 'Lawyer review', s: 'Checking every schedule' },
  { t: 'Submitted to FBR', s: 'Your return is filed' },
  { t: 'Case closed', s: 'Receipt in your documents' },
];

@Component({
  selector: 'mh-befiler-tracker',
  imports: [NgIcon],
  viewProviders: [provideIcons({ phosphorArrowCounterClockwise, phosphorCheck })],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="card card--lift tr">
      <div class="tr-head">
        <h3>{{ title() }}</h3>
        <button type="button" class="icon-btn" aria-label="Replay the tracker" (click)="play()">
          <ng-icon name="phosphorArrowCounterClockwise" aria-hidden="true" />
        </button>
      </div>
      <ol role="list">
        @for (st of stages; track st.t; let i = $index) {
          <li [class.done]="i < at()" [class.now]="i === at()" [attr.aria-current]="i === at() ? 'step' : null">
            <span class="dot" aria-hidden="true">
              @if (i < at() || (i === at() && at() === last)) {
                <ng-icon name="phosphorCheck" />
              }
            </span>
            <div>
              <b>{{ st.t }}</b>
              <span>{{ st.s }}</span>
            </div>
          </li>
        }
      </ol>
      <p class="sr-only" aria-live="polite">{{ status() }}</p>
    </div>
  `,
  styles: `
    :host {
      display: block;
    }
    .tr {
      padding: 18px 20px;
    }
    .tr-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 12px;
    }
    h3 {
      font-size: 15px;
    }
    .icon-btn {
      width: 34px;
      height: 34px;
    }
    ol {
      position: relative;
      display: grid;
      gap: 4px;
    }
    li {
      position: relative;
      display: flex;
      gap: 14px;
      padding: 8px 0;
    }
    /* connector between dots */
    li:not(:last-child)::after {
      content: '';
      position: absolute;
      left: 11px;
      top: 34px;
      bottom: -10px;
      width: 2px;
      background: var(--line);
    }
    li.done:not(:last-child)::after {
      background: var(--b-red, var(--accent));
      transition: background 0.4s var(--ease);
    }
    .dot {
      position: relative;
      width: 24px;
      height: 24px;
      flex-shrink: 0;
      border-radius: 50%;
      border: 2px solid var(--line-strong);
      background: var(--surface);
      display: grid;
      place-items: center;
      font-size: 12px;
      color: #fff;
      transition:
        background 0.35s var(--ease),
        border-color 0.35s var(--ease);
    }
    .done .dot,
    .now .dot {
      border-color: var(--b-red, var(--accent));
    }
    .done .dot {
      background: var(--b-red, var(--accent));
    }
    .now:last-child .dot {
      background: var(--b-red, var(--accent));
    }
    @media (prefers-reduced-motion: no-preference) {
      .now:not(:last-child) .dot::after {
        content: '';
        position: absolute;
        inset: -2px;
        border-radius: 50%;
        border: 2px solid var(--b-red, var(--accent));
        animation: ping 1.6s cubic-bezier(0.2, 0.6, 0.3, 1) infinite;
      }
    }
    @keyframes ping {
      from {
        transform: scale(1);
        opacity: 0.6;
      }
      to {
        transform: scale(1.9);
        opacity: 0;
      }
    }
    li b {
      display: block;
      font-size: 13.5px;
      font-weight: 600;
      color: var(--muted);
      transition: color 0.3s var(--ease);
    }
    li span {
      font-size: 12.5px;
      color: var(--muted);
    }
    .done b,
    .now b {
      color: var(--ink);
    }
  `,
})
export class BefilerTrackerDemo {
  readonly title = input('Your return');
  protected readonly stages = STAGES;
  protected readonly last = STAGES.length - 1;
  protected readonly at = signal(STAGES.length - 1);
  protected readonly status = computed(() => `Stage ${this.at() + 1} of ${STAGES.length}: ${STAGES[this.at()].t}`);

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private timer: ReturnType<typeof setInterval> | undefined;
  private reduce = false;

  constructor() {
    const destroyRef = inject(DestroyRef);
    destroyRef.onDestroy(() => clearInterval(this.timer));
    afterNextRender(() => {
      this.reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (this.reduce || typeof IntersectionObserver === 'undefined') return;
      this.at.set(0);
      const io = new IntersectionObserver(
        ([e]) => {
          if (!e.isIntersecting) return;
          io.disconnect();
          this.play();
        },
        { threshold: 0.5 },
      );
      io.observe(this.host.nativeElement);
      destroyRef.onDestroy(() => io.disconnect());
    });
  }

  protected play(): void {
    clearInterval(this.timer);
    if (this.reduce) {
      this.at.set(this.last);
      return;
    }
    this.at.set(0);
    this.timer = setInterval(() => {
      if (this.at() >= this.last) clearInterval(this.timer);
      else this.at.set(this.at() + 1);
    }, 900);
  }
}
