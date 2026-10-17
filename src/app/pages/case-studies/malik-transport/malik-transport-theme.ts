import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';

/**
 * Loads the Malik Transport theme (src/styles/themes/_malik-transport.scss) only on this route. Unencapsulated so
 * its `:root[data-theme='malik-transport']` overrides reach the shared nav and footer. Every rule in it is scoped
 * to that attribute, which the router shell removes on navigation, so the theme never leaks.
 */
@Component({
  selector: 'mh-malik-transport-theme',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: { hidden: '', 'aria-hidden': 'true' },
  template: '',
  styleUrl: './malik-transport-theme.scss',
})
export class MalikTransportTheme {}
