import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { phosphorCaretLeft, phosphorCaretRight } from '@ng-icons/phosphor-icons/regular';

/**
 * The image stack on a wide /work card: three 16:10 shots on one centre, the back two nudged and slightly tilted.
 * The shots are exact 16:10 thumbnails (scripts/work-thumbs.mjs), so `object-fit: cover` never crops them.
 * The product's home section starts on top; arrows and dots rotate the whole set. The images link to the case study
 * (decorative: the card's own link is the accessible one).
 */
@Component({
  selector: 'mh-card-deck',
  imports: [RouterLink, NgIcon],
  viewProviders: [provideIcons({ phosphorCaretLeft, phosphorCaretRight })],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { role: 'group', 'aria-roledescription': 'carousel', '[attr.aria-label]': "label() + ' screenshots'" },
  template: `
    <a class="deck" [routerLink]="link()" tabindex="-1" aria-hidden="true">
      @for (src of shots(); track src; let k = $index) {
        <img [class]="'st p' + pos(k)" [src]="src" width="1280" height="800" alt="" loading="lazy" decoding="async" />
      }
    </a>
    @if (shots().length > 1) {
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
      align-content: center;
      gap: 16px;
      min-width: 0;
    }
    // Room for the 16:10 front frame plus the tilted frames peeking above it.
    .deck {
      position: relative;
      display: block;
      aspect-ratio: 16 / 12;
    }
    .st {
      position: absolute;
      top: 50%;
      left: 50%;
      width: 88%;
      aspect-ratio: 16 / 10;
      object-fit: cover;
      object-position: top;
      border-radius: var(--r-inner);
      border: 1px solid var(--line);
      background: var(--surface);
      box-shadow: var(--shadow-lg);
      transition:
        transform 0.5s var(--ease),
        opacity 0.4s var(--ease);
    }
    // p0 front (straight), p1 middle, p2 back; the rest wait behind, hidden.
    .p0 {
      z-index: 3;
      transform: translate(-50%, -50%) translate(0, 7%);
    }
    .p1 {
      z-index: 2;
      transform: translate(-50%, -50%) translate(5%, -4%) rotate(3.5deg);
    }
    .p2 {
      z-index: 1;
      transform: translate(-50%, -50%) translate(-5%, -9%) rotate(-4.5deg);
    }
    .p3 {
      z-index: 0;
      opacity: 0;
      transform: translate(-50%, -50%) translate(-7%, -11%) rotate(-6deg);
    }
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
      .st,
      .dots i {
        transition: none;
      }
    }
  `,
})
export class CardDeck {
  readonly shots = input.required<readonly string[]>();
  readonly link = input.required<string>();
  readonly label = input.required<string>();

  protected readonly index = signal(0);
  private readonly n = computed(() => this.shots().length);

  /** Position of shot k in the stack: 0 front, 1 middle, 2 back, 3 hidden behind. */
  protected pos(k: number): number {
    return Math.min((k - this.index() + this.n()) % this.n(), 3);
  }

  protected go(step: number): void {
    const n = this.n();
    this.index.update((i) => (i + step + n) % n);
  }
}
