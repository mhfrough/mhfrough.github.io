import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';

/**
 * Loads the DMAX theme (src/styles/themes/_dmax.scss) only on this route. Unencapsulated so its
 * `:root[data-theme='dmax']` overrides reach the shared nav and footer. Every rule in it is scoped to that
 * attribute, which the router shell removes on navigation, so the theme never leaks.
 */
@Component({
  selector: 'mh-dmax-theme',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: { hidden: '', 'aria-hidden': 'true' },
  template: '',
  styleUrl: './dmax-theme.scss',
})
export class DmaxTheme {}
