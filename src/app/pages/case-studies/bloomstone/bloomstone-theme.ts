import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';

/**
 * Loads the Bloomstone theme (src/styles/themes/_bloomstone.scss) only on this route. Unencapsulated so its
 * `:root[data-theme='bloomstone']` overrides reach the shared nav and footer. Every rule in it is scoped to that
 * attribute, which the router shell removes on navigation, so the theme never leaks.
 */
@Component({
  selector: 'mh-bloomstone-theme',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: { hidden: '', 'aria-hidden': 'true' },
  template: '',
  styleUrl: './bloomstone-theme.scss',
})
export class BloomstoneTheme {}
