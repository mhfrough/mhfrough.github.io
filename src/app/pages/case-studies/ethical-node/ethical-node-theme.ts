import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';

/**
 * Loads the EthicalNode theme (src/styles/themes/_ethical-node.scss) only on this route. Unencapsulated so its
 * `:root[data-theme='ethical-node']` overrides reach the shared nav and footer. Every rule in it is scoped to that
 * attribute, which the router shell removes on navigation, so the theme never leaks.
 */
@Component({
  selector: 'mh-ethical-node-theme',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: { hidden: '', 'aria-hidden': 'true' },
  template: '',
  styleUrl: './ethical-node-theme.scss',
})
export class EthicalNodeTheme {}
