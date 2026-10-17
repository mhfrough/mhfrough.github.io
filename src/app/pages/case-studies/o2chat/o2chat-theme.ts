import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';

/**
 * Loads the O2Chat theme (src/styles/themes/_o2chat.scss) only on this route. Unencapsulated so its
 * `:root[data-theme='o2chat']` overrides reach the shared nav and footer. Every rule in it is scoped to that
 * attribute, which the router shell removes on navigation, so the theme never leaks.
 */
@Component({
  selector: 'mh-o2chat-theme',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: { hidden: '', 'aria-hidden': 'true' },
  template: '',
  styleUrl: './o2chat-theme.scss',
})
export class O2chatTheme {}
