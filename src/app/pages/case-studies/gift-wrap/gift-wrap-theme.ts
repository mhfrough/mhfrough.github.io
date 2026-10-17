import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';

/**
 * Loads the Gift Wrap theme (src/styles/themes/_gift-wrap.scss) only on this route. Unencapsulated so its
 * `:root[data-theme='gift-wrap']` overrides reach the shared nav and footer. Every rule in it is scoped to that
 * attribute, which the router shell removes on navigation, so the theme never leaks.
 */
@Component({
  selector: 'mh-gift-wrap-theme',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: { hidden: '', 'aria-hidden': 'true' },
  template: '',
  styleUrl: './gift-wrap-theme.scss',
})
export class GiftWrapTheme {}
