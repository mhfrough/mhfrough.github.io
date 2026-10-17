import { ChangeDetectionStrategy, Component, afterNextRender, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  phosphorArrowRight,
  phosphorBellRinging,
  phosphorBookOpen,
  phosphorBrowser,
  phosphorCalendarCheck,
  phosphorDatabase,
  phosphorDeviceMobile,
  phosphorEnvelope,
  phosphorFingerprint,
  phosphorGlobe,
  phosphorHandCoins,
  phosphorHardDrives,
  phosphorLockKey,
  phosphorMoney,
  phosphorPercent,
  phosphorSealCheck,
  phosphorTray,
  phosphorUserCircle,
  phosphorUsers,
} from '@ng-icons/phosphor-icons/regular';
import { PERSON_ID, Seo, abs } from '../../../core/seo/seo.service';
import { Reveal } from '../../../shared/directives/reveal.directive';
import { TechPills } from '../stack/tech-pills';
import { HrmCompare } from './compare';
import { HrmFenceDemo } from './fence-demo';
import { COPY } from './hrm.copy';
import { HrmTheme } from './hrm-theme';
import { HrmPayrunDemo } from './payrun-demo';
import { HrmThemeLab } from './theme-lab';

const PATH = '/work/hrm';
const OG_IMAGE = '/og/og-hrm.jpg';

/**
 * HRM Suite case study: my own multi-tenant HR, attendance and payroll platform, in development (not launched).
 * The route wears the product's dark theme via <html data-theme="hrm">. Screenshots are the real development
 * build on its seeded demo company (scripts/hrm-shots.mjs); the three demos are my own rebuilds of its rules.
 */
@Component({
  selector: 'mh-page-hrm',
  imports: [RouterLink, NgIcon, Reveal, HrmTheme, HrmThemeLab, HrmPayrunDemo, HrmFenceDemo, HrmCompare, TechPills],
  viewProviders: [
    provideIcons({
      phosphorArrowRight,
      phosphorBellRinging,
      phosphorBookOpen,
      phosphorBrowser,
      phosphorCalendarCheck,
      phosphorDatabase,
      phosphorDeviceMobile,
      phosphorEnvelope,
      phosphorFingerprint,
      phosphorGlobe,
      phosphorHandCoins,
      phosphorHardDrives,
      phosphorLockKey,
      phosphorMoney,
      phosphorPercent,
      phosphorSealCheck,
      phosphorTray,
      phosphorUserCircle,
      phosphorUsers,
    }),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './hrm.html',
  styleUrl: './hrm.scss',
})
export class HrmCaseStudy {
  protected readonly c = COPY;
  protected readonly ready = signal(false);

  constructor() {
    const url = abs(PATH);
    inject(Seo).set({
      title: COPY.seo.title,
      description: COPY.seo.description,
      path: PATH,
      type: 'article',
      image: OG_IMAGE,
      imageAlt: COPY.seo.imageAlt,
      breadcrumbs: [
        { name: 'Work', path: '/work' },
        { name: 'HRM Suite', path: PATH },
      ],
      jsonLd: [
        {
          '@type': 'Article',
          '@id': url + '#article',
          headline: 'HRM Suite: HR, attendance and payroll on one record',
          description: COPY.seo.description,
          inLanguage: 'en',
          image: abs(OG_IMAGE),
          author: { '@id': PERSON_ID },
          publisher: { '@id': PERSON_ID },
          mainEntityOfPage: { '@id': url + '#webpage' },
          about: { '@id': url + '#product' },
          keywords: ['HRM', 'payroll', 'multi-tenant SaaS', 'row-level security', 'design system', 'Angular', 'NestJS', 'PostgreSQL', 'Flutter', 'Pakistan'],
        },
        {
          '@type': 'CreativeWork',
          '@id': url + '#product',
          name: 'HRM Suite',
          description:
            'A multi-tenant HR, attendance and payroll platform for small and mid-sized companies in Pakistan: web app, Android check-in app, API and design system.',
          creativeWorkStatus: 'In development',
          inLanguage: 'en',
          dateCreated: '2026',
          creator: { '@id': PERSON_ID },
          image: abs('/images/hrm/cover.webp'),
          keywords: 'HR software, payroll, attendance, geofencing, multi-tenant, design system',
        },
      ],
    });

    afterNextRender(() => requestAnimationFrame(() => this.ready.set(true)));
  }
}
