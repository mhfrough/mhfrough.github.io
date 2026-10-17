import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { phosphorCaretLeft, phosphorCaretRight } from '@ng-icons/phosphor-icons/regular';

/**
 * One screenshot at a time for a single /work card: home, sales page, then portal. Arrows, dots and a swipe move
 * between them; with one image there are no controls. The controls sit below the frame (as on the wide card's deck)
 * so they never cover the screenshot. The shots are exact 16:10 thumbnails (scripts/work-thumbs.mjs), so the 16:10
 * frame shows each one whole. The image itself links to the case study (decorative, the card's own "Read the case
 * study" link is the accessible one).
 */
@Component({
  selector: 'mh-card-slider',
  imports: [RouterLink, NgIcon],
  viewProviders: [provideIcons({ phosphorCaretLeft, phosphorCaretRight })],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { role: 'group', 'aria-roledescription': 'carousel', '[attr.aria-label]': "label() + ' screenshots'" },
  template: `
    <div class="frame">
      <a class="track" [routerLink]="link()" tabindex="-1" aria-hidden="true"
         [style.transform]="'translateX(' + -index() * 100 + '%)'"
         (pointerdown)="down($event)" (pointerup)="up($event)" (pointercancel)="x0 = null" (click)="click($event)">
        @for (src of shots(); track src; let k = $index) {
          <img [src]="src" width="1280" height="800" alt="" loading="lazy" decoding="async" draggable="false" />
        }
      </a>
    </div>
    @if (many()) {
      <div class="ctrls">
        <button type="button" class="nav" aria-label="Previous screenshot" (click)="go(-1)">
          <ng-icon name="phosphorCaretLeft" aria-hidden="true" />
        </button>
        <span class="dots" aria-live="polite">
          <span class="sr-only">Screenshot {{ index() + 1 }} of {{ shots().length }}</span>
          @for (s of shots(); track s; let k = $index) {
            <i [class.on]="k === index()" aria-hidden="true"></i>
          }
        </span>
        <button type="button" class="nav" aria-label="Next screenshot" (click)="go(1)">
          <ng-icon name="phosphorCaretRight" aria-hidden="true" />
        </button>
      </div>
    }
  `,
  styles: `
    :host {
      display: grid;
      gap: 12px;
      min-width: 0;
    }
    .frame {
      position: relative;
      overflow: hidden;
      border-radius: var(--r-inner);
      border: 1px solid var(--line);
      background: var(--surface-2);
      aspect-ratio: 16 / 10;
    }
    .track {
      display: flex;
      height: 100%;
      touch-action: pan-y;
      transition: transform 0.45s var(--ease);

      img {
        flex: none;
        width: 100%;
        height: 100%;
        object-fit: cover;
        object-position: top;
        user-select: none;
      }
    }
    // Below the frame, centred: prev, dots, next (same as the wide card's deck).
    .ctrls {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
    }
    .nav {
      position: relative;
      width: 30px;
      height: 30px;
      display: grid;
      place-items: center;
      border-radius: 999px;
      border: 1px solid var(--line);
      background: var(--surface);
      color: var(--ink);
      font-size: 14px;
      cursor: pointer;

      // 44px hit area around a 30px button.
      &::before {
        content: '';
        position: absolute;
        inset: -7px;
      }
      &:hover {
        background: var(--surface-2);
      }
      &:focus-visible {
        outline: 2px solid var(--focus);
        outline-offset: 2px;
      }
    }
    .dots {
      display: flex;
      gap: 5px;

      i {
        width: 6px;
        height: 6px;
        border-radius: 999px;
        background: var(--line-strong);
        transition: width var(--t-fast) var(--ease);

        &.on {
          width: 14px;
          background: var(--ink);
        }
      }
    }
    @media (prefers-reduced-motion: reduce) {
      .track,
      .dots i {
        transition: none;
      }
    }
  `,
})
export class CardSlider {
  readonly shots = input.required<readonly string[]>();
  readonly link = input.required<string>();
  readonly label = input.required<string>();

  protected readonly index = signal(0);
  protected readonly many = computed(() => this.shots().length > 1);
  protected x0: number | null = null;
  private swiped = false;

  protected go(step: number): void {
    const n = this.shots().length;
    this.index.update((i) => (i + step + n) % n);
  }

  protected down(e: PointerEvent): void {
    this.x0 = e.clientX;
    this.swiped = false;
  }

  protected up(e: PointerEvent): void {
    if (this.x0 === null || !this.many()) return;
    const dx = e.clientX - this.x0;
    this.x0 = null;
    if (Math.abs(dx) > 40) {
      this.swiped = true;
      this.go(dx < 0 ? 1 : -1);
    }
  }

  /** A swipe ends in a click on the link: swallow it so swiping never opens the case study. */
  protected click(e: MouseEvent): void {
    if (this.swiped) {
      e.preventDefault();
      e.stopImmediatePropagation();
      this.swiped = false;
    }
  }
}
