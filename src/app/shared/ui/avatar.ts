import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { SITE } from '../../core/site.config';
import { Logo } from './logo';

/**
 * Small circular portrait. The one documented exception to the small-radius rule.
 * Falls back to the ء mark until SITE.avatar points at a real photo.
 */
@Component({
  selector: 'mh-avatar',
  imports: [Logo],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'mh-avatar', '[style.--avatar-size.px]': 'size()' },
  template: `
    @if (src(); as s) {
      <img [src]="s" [alt]="alt()" [width]="size()" [height]="size()" decoding="async" [attr.loading]="eager() ? 'eager' : 'lazy'" [attr.fetchpriority]="eager() ? 'high' : null" />
    } @else {
      <span class="mono-fallback" role="img" [attr.aria-label]="alt()">
        <mh-logo [size]="size() * 0.62" />
      </span>
    }
  `,
  styles: `
    :host {
      display: inline-grid;
      place-items: center;
      inline-size: var(--avatar-size);
      block-size: var(--avatar-size);
      border-radius: 50%;
      overflow: hidden;
      background: var(--surface-2);
      box-shadow: 0 0 0 1px var(--line-strong);
      flex-shrink: 0;
    }
    img {
      inline-size: 100%;
      block-size: 100%;
      object-fit: cover;
      filter: grayscale(1) contrast(1.05);
    }
    .mono-fallback {
      display: grid;
      place-items: center;
    }
  `,
})
export class Avatar {
  readonly size = input(40);
  readonly src = input<string | null>(SITE.avatar);
  readonly alt = input(`${SITE.name}, portrait`);
  readonly eager = input(false);
}
