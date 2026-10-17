import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';

/**
 * Loads the Pizzerias theme (src/styles/themes/_pizzerias.scss) only on this route. Unencapsulated so its
 * `:root[data-theme='pizzerias']` overrides reach the shared nav and footer. Every rule in it is scoped to that
 * attribute, which the router shell removes on navigation, so the theme never leaks.
 */
@Component({
  selector: 'mh-pizzerias-theme',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: { hidden: '', 'aria-hidden': 'true' },
  template: '',
  styleUrl: './pizzerias-theme.scss',
})
export class PizzeriasTheme {}
