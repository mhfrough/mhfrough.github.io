import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';

/**
 * Loads the Little Surprises theme (src/styles/themes/_little-surprises.scss) only on this route. Unencapsulated so its
 * `:root[data-theme='little-surprises']` overrides reach the shared nav and footer. Every rule in it is scoped to that
 * attribute, which the router shell removes on navigation, so the theme never leaks.
 */
@Component({
  selector: 'mh-little-surprises-theme',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: { hidden: '', 'aria-hidden': 'true' },
  template: '',
  styleUrl: './little-surprises-theme.scss',
})
export class LittleSurprisesTheme {}
