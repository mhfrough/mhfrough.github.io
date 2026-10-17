import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';

/**
 * Loads the Asaan Hisab theme (src/styles/themes/_asaan-hisab.scss) only on this route. Unencapsulated so its
 * `:root[data-theme='asaan-hisab']` overrides reach the shared nav and footer. Every rule in it is scoped to that
 * attribute, which the router shell removes on navigation, so the theme never leaks.
 */
@Component({
  selector: 'mh-asaan-hisab-theme',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: { hidden: '', 'aria-hidden': 'true' },
  template: '',
  styleUrl: './asaan-hisab-theme.scss',
})
export class AsaanHisabTheme {}
