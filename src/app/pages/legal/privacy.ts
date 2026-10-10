import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Seo } from '../../core/seo/seo.service';
import { LegalLayout } from './legal-layout';
import { PRIVACY } from './legal.copy';

// Template content for the owner to review (see the note at the top of legal.copy.ts).
@Component({
  selector: 'mh-page-privacy',
  imports: [LegalLayout],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<mh-legal-layout [doc]="doc" />`,
})
export class Privacy {
  protected readonly doc = PRIVACY;

  constructor() {
    inject(Seo).set({
      title: PRIVACY.seoTitle,
      description: PRIVACY.description,
      path: PRIVACY.path,
      breadcrumbs: [{ name: PRIVACY.crumb, path: PRIVACY.path }],
    });
  }
}
