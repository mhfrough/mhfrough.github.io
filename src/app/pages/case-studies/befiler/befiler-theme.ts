import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';

/**
 * Loads the Befiler theme (src/styles/themes/_befiler.scss) only on this route. Unencapsulated so its
 * `:root[data-theme='befiler']` overrides reach the shared nav and footer. Every rule in it is scoped to that
 * attribute, which the router shell removes on navigation, so the theme never leaks.
 */
@Component({
  selector: 'mh-befiler-theme',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: { hidden: '', 'aria-hidden': 'true' },
  template: '',
  styleUrl: './befiler-theme.scss',
})
export class BefilerTheme {}
