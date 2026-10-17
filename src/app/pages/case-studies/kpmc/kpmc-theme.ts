import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';

/**
 * Loads the Kpmc theme (src/styles/themes/_kpmc.scss) only on this route. Unencapsulated so its
 * `:root[data-theme='kpmc']` overrides reach the shared nav and footer. Every rule in it is scoped to that
 * attribute, which the router shell removes on navigation, so the theme never leaks.
 */
@Component({
  selector: 'mh-kpmc-theme',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: { hidden: '', 'aria-hidden': 'true' },
  template: '',
  styleUrl: './kpmc-theme.scss',
})
export class KpmcTheme {}
