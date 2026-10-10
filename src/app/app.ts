import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { I18n } from './core/i18n/i18n.service';
import { Footer } from './layout/footer';
import { LAYOUT_COPY } from './layout/layout.copy';
import { Nav } from './layout/nav';

@Component({
  selector: 'mh-root',
  imports: [RouterOutlet, Nav, Footer],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <a class="skip-link" href="#main">{{ t().skip }}</a>
    <span id="top"></span>
    <mh-nav />
    <main id="main" tabindex="-1">
      <router-outlet />
    </main>
    <mh-footer />
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      min-block-size: 100dvh;
    }
    main {
      flex: 1;
      outline: none;
      // the floating nav overlaps the top of every page; pages own their own top spacing
      margin-block-start: calc(-1 * (var(--nav-h) + var(--nav-top)));
    }
  `,
})
export class App {
  protected readonly t = inject(I18n).select(LAYOUT_COPY);
}
