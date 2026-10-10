import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Seo } from '../../core/seo/seo.service';
import { LegalLayout } from './legal-layout';
import { TERMS } from './legal.copy';

// Template content for the owner to review (see the note at the top of legal.copy.ts).
@Component({
  selector: 'mh-page-terms',
  imports: [LegalLayout],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<mh-legal-layout [doc]="doc" />`,
})
export class Terms {
  protected readonly doc = TERMS;

  constructor() {
    inject(Seo).set({
      title: TERMS.seoTitle,
      description: TERMS.description,
      path: TERMS.path,
      breadcrumbs: [{ name: TERMS.crumb, path: TERMS.path }],
    });
  }
}
