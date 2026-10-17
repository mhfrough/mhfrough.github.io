import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  computed,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { phosphorArrowLeft, phosphorArrowRight } from '@ng-icons/phosphor-icons/regular';

export interface SliderPhoto {
  file: string;
  alt: string;
  cap: string;
}

/**
 * Photo slider: a native scroll-snap track (touch, trackpad and arrow keys all work) with prev / next buttons,
 * one dot per stop and a "01 / 05" counter. Stops are the scroll positions the track can actually reach, so the
 * last dot lines up with the end of the row instead of pointing at photos that can never sit first.
 * Server render shows the track and one dot per photo; the real stops are measured after hydration.
 */
@Component({
  selector: 'mh-bloomstone-photos',
  imports: [NgIcon],
  viewProviders: [provideIcons({ phosphorArrowLeft, phosphorArrowRight })],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div #track class="track" role="region" tabindex="0" [attr.aria-label]="label()" (scroll)="onScroll()">
      <ul role="list">
        @for (p of photos(); track p.file; let i = $index) {
          <li>
            <figure>
              <img
                [src]="'/images/bloomstone/photos/' + p.file + '.webp'"
                width="960"
                height="640"
                [alt]="p.alt"
                loading="lazy"
                decoding="async"
              />
              <figcaption><span class="mono">{{ pad(i + 1) }}</span>{{ p.cap }}</figcaption>
            </figure>
          </li>
        }
      </ul>
    </div>

    <div class="wrap">
      <div class="nav">
        <div class="ctrls">
          <button type="button" class="arrow" aria-label="Previous photos" [disabled]="at() === 0" (click)="go(at() - 1)">
            <ng-icon name="phosphorArrowLeft" aria-hidden="true" />
          </button>
          <div class="dots" role="group" aria-label="Choose a stop">
            @for (s of stops(); track $index; let i = $index) {
              <button
                type="button"
                class="dot"
                [attr.aria-label]="'Stop ' + (i + 1) + ' of ' + stops().length"
                [attr.aria-current]="i === at() ? 'true' : null"
                (click)="go(i)"
              ></button>
            }
          </div>
          <button type="button" class="arrow" aria-label="Next photos" [disabled]="at() >= last()" (click)="go(at() + 1)">
            <ng-icon name="phosphorArrowRight" aria-hidden="true" />
          </button>
        </div>
        <p class="count mono" aria-live="polite">
          <b>{{ pad(at() + 1) }}</b><span aria-hidden="true"> / </span><span class="sr-only"> of </span>{{ pad(stops().length) }}
        </p>
      </div>
    </div>
  `,
  styles: `
    :host {
      display: block;
    }

    // Line the first photo up with .wrap and let the row run off the right edge.
    .track {
      --lead: max(var(--gutter), calc((100vw - var(--max)) / 2 + var(--gutter)));
      position: relative;
      overflow-x: auto;
      scroll-snap-type: x mandatory;
      scroll-padding-left: var(--lead);
      scrollbar-width: none;
      padding: 0 var(--gutter) 4px var(--lead);
      border-radius: var(--r-card);

      &::-webkit-scrollbar {
        display: none;
      }
    }

    @media (prefers-reduced-motion: no-preference) {
      .track {
        scroll-behavior: smooth;
      }
    }

    ul {
      display: flex;
      gap: 14px;
      width: max-content;
    }

    li {
      flex: 0 0 auto;
      scroll-snap-align: start;
    }

    figure {
      margin: 0;
      width: clamp(260px, 34vw, 440px);
    }

    img {
      display: block;
      width: 100%;
      height: auto;
      aspect-ratio: 3 / 2;
      object-fit: cover;
      border-radius: var(--r-card);
      box-shadow: var(--shadow);
    }

    figcaption {
      display: flex;
      align-items: baseline;
      gap: 10px;
      padding: 12px 2px 0;
      font-size: 14px;
      font-weight: 500;
      color: var(--ink);

      .mono {
        font-size: 12px;
        color: var(--muted);
      }
    }

    .nav {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      margin-top: 22px;
      padding-top: 18px;
      border-top: 1px solid var(--line);
    }

    .ctrls {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .arrow {
      width: 44px;
      height: 44px;
      display: grid;
      place-items: center;
      flex-shrink: 0;
      border-radius: 999px;
      border: 1px solid var(--line-strong);
      background: var(--surface);
      color: var(--ink);
      font-size: 18px;
      transition:
        background var(--t-fast) var(--ease),
        border-color var(--t-fast) var(--ease),
        color var(--t-fast) var(--ease);

      &:hover:not([disabled]) {
        background: var(--cta);
        border-color: var(--cta);
        color: var(--cta-ink);
      }

      &[disabled] {
        opacity: 0.4;
        cursor: default;
      }
    }

    .dots {
      display: flex;
      align-items: center;
    }

    // 24 x 44 hit area (WCAG 2.5.8 minimum), a small dot inside; the current stop stretches into a bronze pill.
    .dot {
      position: relative;
      width: 24px;
      height: 44px;
      display: grid;
      place-items: center;

      &::before {
        content: '';
        width: 8px;
        height: 8px;
        border-radius: 999px;
        background: var(--line-strong);
        transition:
          width var(--t-base) var(--ease),
          background var(--t-base) var(--ease);
      }

      &:hover::before {
        background: var(--muted);
      }

      &[aria-current='true'] {
        width: 38px;

        &::before {
          width: 28px;
          background: var(--b-bronze, var(--accent));
        }
      }
    }

    @media (prefers-reduced-motion: no-preference) {
      .dot {
        transition: width var(--t-base) var(--ease);
      }
    }

    .count {
      font-size: 14px;
      color: var(--muted);
      white-space: nowrap;

      b {
        color: var(--ink);
        font-weight: 600;
      }
    }

    @media (max-width: 480px) {
      .count {
        display: none;
      }
    }

    // Smallest phones: eight 24px dots and two arrows do not fit, so the arrows keep the counter instead
    @media (max-width: 374px) {
      .dots {
        display: none;
      }
      .count {
        display: block;
      }
    }
  `,
})
export class BloomstonePhotoSlider {
  readonly photos = input.required<readonly SliderPhoto[]>();
  readonly label = input('Photos');

  private readonly track = viewChild.required<ElementRef<HTMLElement>>('track');
  /** scrollLeft of every reachable stop. Before hydration: one per photo (positions unknown yet). */
  private readonly positions = signal<number[] | null>(null);
  protected readonly stops = computed(() => this.positions() ?? this.photos().map((_, i) => i));
  protected readonly last = computed(() => this.stops().length - 1);
  protected readonly at = signal(0);
  private frame = 0;

  constructor() {
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      this.measure();
      const ro = new ResizeObserver(() => this.measure());
      ro.observe(this.track().nativeElement);
      destroyRef.onDestroy(() => {
        ro.disconnect();
        cancelAnimationFrame(this.frame);
      });
    });
  }

  protected pad(n: number): string {
    return String(n).padStart(2, '0');
  }

  protected go(i: number): void {
    const pos = this.positions();
    if (!pos) return;
    const k = Math.max(0, Math.min(i, pos.length - 1));
    this.at.set(k);
    this.track().nativeElement.scrollTo({ left: pos[k] });
  }

  protected onScroll(): void {
    cancelAnimationFrame(this.frame);
    this.frame = requestAnimationFrame(() => this.sync());
  }

  /** Reachable stops: each photo's start, clamped to the end of the track, duplicates folded together. */
  private measure(): void {
    const el = this.track().nativeElement;
    const lead = parseFloat(getComputedStyle(el).scrollPaddingLeft) || 0;
    const max = el.scrollWidth - el.clientWidth;
    const items = Array.from(el.querySelectorAll<HTMLElement>('li'));
    const pos: number[] = [];
    for (const li of items) {
      const p = Math.min(Math.max(0, li.offsetLeft - lead), max);
      if (!pos.length || p - pos[pos.length - 1] > 4) pos.push(p);
    }
    this.positions.set(pos.length ? pos : [0]);
    this.sync();
  }

  /** The stop nearest the current scroll position. */
  private sync(): void {
    const pos = this.positions();
    if (!pos) return;
    const x = this.track().nativeElement.scrollLeft;
    let best = 0;
    for (let i = 1; i < pos.length; i++) if (Math.abs(pos[i] - x) < Math.abs(pos[best] - x)) best = i;
    this.at.set(best);
  }
}
