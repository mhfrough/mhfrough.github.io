import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Seo } from '../../core/seo/seo.service';
import { LegalLayout } from './legal-layout';
import { COOKIES } from './legal.copy';

// Template content for the owner to review (see the note at the top of legal.copy.ts).
@Component({
  selector: 'mh-page-cookies',
  imports: [LegalLayout],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<mh-legal-layout [doc]="doc" />`,
})
export class Cookies {
  protected readonly doc = COOKIES;

  constructor() {
    inject(Seo).set({
      title: COOKIES.seoTitle,
      description: COOKIES.description,
      path: COOKIES.path,
      breadcrumbs: [{ name: COOKIES.crumb, path: COOKIES.path }],
    });
  }
}
