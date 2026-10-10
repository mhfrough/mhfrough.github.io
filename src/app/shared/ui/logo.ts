import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * The ء (hamza) mark, built from two primitives on a 48-unit grid:
 *   1. a 225 degree arc, centre (24, 21.5), r = 9, stroke 5 (the head of the letter)
 *   2. a 25 x 5 bar at y = 30 (the base stroke), which the arc lands on
 * Geometry is documented on /brand (construction view). Do not redraw it by eye.
 */
export const MARK_ARC = 'M30.36 15.14A9 9 0 1 0 24 30.5';
export const MARK_BAR = { x: 12, y: 30, w: 25, h: 5 } as const;

@Component({
  selector: 'mh-logo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'mh-logo', '[style.--logo-size.px]': 'size()' },
  template: `
    <svg
      class="mark"
      viewBox="0 0 48 48"
      [attr.width]="size()"
      [attr.height]="size()"
      [attr.aria-hidden]="label() ? null : 'true'"
      [attr.role]="label() ? 'img' : null"
      [attr.aria-label]="label() || null"
      focusable="false"
    >
      @if (boxed()) {
        <rect class="box" x="0.5" y="0.5" width="47" height="47" rx="3.5" />
      }
      <path [attr.d]="arc" fill="none" stroke="currentColor" stroke-width="5" />
      <rect [attr.x]="bar.x" [attr.y]="bar.y" [attr.width]="bar.w" [attr.height]="bar.h" fill="currentColor" />
    </svg>
    @if (wordmark()) {
      <span class="word" translate="no">Mohammad Hamza</span>
    }
  `,
  styles: `
    :host {
      display: inline-flex;
      align-items: center;
      gap: calc(var(--logo-size) * 0.28);
      color: inherit;
    }
    .mark {
      flex-shrink: 0;
    }
    .box {
      fill: none;
      stroke: var(--line-strong);
    }
    .word {
      font-weight: 600;
      letter-spacing: -0.01em;
      line-height: 1;
    }
  `,
})
export class Logo {
  readonly size = input(32);
  readonly wordmark = input(false);
  readonly boxed = input(false);
  /** Accessible name. Leave empty when the logo sits inside a labelled link. */
  readonly label = input('');
  protected readonly arc = MARK_ARC;
  protected readonly bar = MARK_BAR;
}
