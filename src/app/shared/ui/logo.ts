import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * The ء (hamza) mark, built from two primitives on a 48-unit grid, optically centred in the tile:
 *   1. a 225 degree arc, centre (24.5, 21), r = 8, stroke 5 (the head of the letter)
 *   2. a tapered tail: from the base line y = 26.5 (where the arc lands) it runs right to x = 37, then sweeps
 *      down-left to a 3 unit point at x = 15.5, thick on the right and thin on the left like a Naskh hamza
 * Geometry is documented on /brand (construction view). Do not redraw it by eye.
 * Previous arc-on-bar mark: .devcache/backup/logo-arc-bar-2026-10-11.
 */
export const MARK_ARC = 'M30.16 15.34A8 8 0 1 0 24.5 29';
export const MARK_TAIL = 'M22.5 26.5H37V28.5L15.5 38V35Z';

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
      <path [attr.d]="tail" fill="currentColor" />
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
  protected readonly tail = MARK_TAIL;
}
