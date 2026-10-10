import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

/**
 * Skeleton placeholder that matches the final layout's shape (never a spinner).
 * Use inside `@defer { ... } @placeholder { <mh-skeleton ... /> }` or while data/media loads.
 *
 *   <mh-skeleton shape="block" ratio="16/9" />          media
 *   <mh-skeleton shape="text" [lines]="3" />            paragraph
 *   <mh-skeleton shape="circle" [size]="40" />          avatar
 *   <mh-skeleton shape="block" height="220px" />        card
 */
@Component({
  selector: 'mh-skeleton',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 'aria-hidden': 'true', class: 'mh-skeleton', '[class.is-text]': "shape() === 'text'" },
  template: `
    @switch (shape()) {
      @case ('text') {
        @for (w of widths(); track $index) {
          <span class="skeleton line" [style.inline-size]="w"></span>
        }
      }
      @case ('circle') {
        <span class="skeleton circle" [style.inline-size.px]="size()" [style.block-size.px]="size()"></span>
      }
      @default {
        <span class="skeleton" [style.aspect-ratio]="ratio()" [style.block-size]="height()" [style.inline-size]="width()"></span>
      }
    }
  `,
  styles: `
    :host {
      display: block;
    }
    :host(.is-text) {
      display: grid;
      gap: 0.6em;
    }
    .line {
      block-size: 0.8em;
    }
    .circle {
      border-radius: 50%;
    }
  `,
})
export class Skeleton {
  readonly shape = input<'block' | 'text' | 'circle'>('block');
  readonly lines = input(3);
  readonly ratio = input<string | null>(null);
  readonly height = input<string | null>(null);
  readonly width = input('100%');
  readonly size = input(40);

  protected readonly widths = computed(() =>
    Array.from({ length: this.lines() }, (_, i) => (i === this.lines() - 1 && this.lines() > 1 ? '62%' : i % 2 ? '94%' : '100%')),
  );
}
