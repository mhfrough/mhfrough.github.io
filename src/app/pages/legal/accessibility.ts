import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Seo } from '../../core/seo/seo.service';
import { LegalLayout } from './legal-layout';
import { ACCESSIBILITY } from './legal.copy';

// Template content for the owner to review (see the note at the top of legal.copy.ts).
@Component({
  selector: 'mh-page-accessibility',
  imports: [LegalLayout],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<mh-legal-layout [doc]="doc" />`,
})
export class Accessibility {
  protected readonly doc = ACCESSIBILITY;

  constructor() {
    inject(Seo).set({
      title: ACCESSIBILITY.seoTitle,
      description: ACCESSIBILITY.description,
      path: ACCESSIBILITY.path,
      breadcrumbs: [{ name: ACCESSIBILITY.crumb, path: ACCESSIBILITY.path }],
    });
  }
}
