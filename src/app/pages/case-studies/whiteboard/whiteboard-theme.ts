import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';

/**
 * Loads the Whiteboard theme (src/styles/themes/_whiteboard.scss) only on this route. Unencapsulated so its
 * `:root[data-theme='whiteboard']` overrides reach the shared nav and footer. Every rule in it is scoped to that
 * attribute, which the router shell removes on navigation, so the theme never leaks.
 */
@Component({
  selector: 'mh-whiteboard-theme',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: { hidden: '', 'aria-hidden': 'true' },
  template: '',
  styleUrl: './whiteboard-theme.scss',
})
export class WhiteboardTheme {}
