import { ChangeDetectionStrategy, Component, DestroyRef, afterNextRender, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  phosphorArrowRight,
  phosphorBriefcase,
  phosphorChartLineUp,
  phosphorChatsCircle,
  phosphorCheck,
  phosphorClock,
  phosphorCode,
  phosphorCopy,
  phosphorDribbbleLogo,
  phosphorGithubLogo,
  phosphorLinkedinLogo,
  phosphorPenNib,
  phosphorReceipt,
  phosphorRocketLaunch,
  phosphorSparkle,
  phosphorStack,
  phosphorStorefront,
  phosphorTreeStructure,
  phosphorTruck,
} from '@ng-icons/phosphor-icons/regular';
import { PERSON_ID, Seo, abs } from '../../core/seo/seo.service';
import { SITE } from '../../core/site.config';
import { Reveal } from '../../shared/directives/reveal.directive';
import { Avatar } from '../../shared/ui/avatar';
import { Skeleton } from '../../shared/ui/skeleton';
import { EXPERIENCE, HOW, PROJECTS, REELS, STACK } from './home.data';
import { WorkExplorer } from './work-explorer';

@Component({
  selector: 'mh-page-home',
  imports: [RouterLink, NgIcon, Avatar, Skeleton, Reveal, WorkExplorer],
  viewProviders: [
    provideIcons({
      phosphorArrowRight,
      phosphorBriefcase,
      phosphorChartLineUp,
      phosphorChatsCircle,
      phosphorCheck,
      phosphorClock,
      phosphorCode,
      phosphorCopy,
      phosphorDribbbleLogo,
      phosphorGithubLogo,
      phosphorLinkedinLogo,
      phosphorPenNib,
      phosphorReceipt,
      phosphorRocketLaunch,
      phosphorSparkle,
      phosphorStack,
      phosphorStorefront,
      phosphorTreeStructure,
      phosphorTruck,
    }),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  protected readonly available = SITE.availableForWork;
  protected readonly email = SITE.email;
  protected readonly social = SITE.social;
  protected readonly stack = STACK;
  protected readonly stackLoop = [...STACK, ...STACK]; // duplicated for a seamless loop; copies are aria-hidden
  protected readonly how = HOW;
  protected readonly experience = EXPERIENCE;
  protected readonly reels = REELS;
  // Bento: the six strongest client projects after Quorum (Quorum is the feature cell)
  protected readonly bento = ['tax', 'fleet', 'inbox', 'funds', 'food', 'practice'].map((id) => PROJECTS.find((p) => p.id === id)!);

  protected readonly kit = [
    { group: 'Frontend', items: 'Angular, TypeScript, RxJS, SCSS, Angular SSR, PWA' },
    { group: 'Architecture', items: 'Micro-frontends, multi-tenant SaaS, real-time, embeddable widgets' },
    { group: 'Backend and data', items: 'NestJS, Node.js, PHP, PostgreSQL, MongoDB, Firebase, Supabase' },
    { group: 'Mobile', items: 'Flutter, Ionic' },
    { group: 'Cloud and DevOps', items: 'AWS, Cloudflare, Netlify, Render, Nginx, Coolify CI/CD' },
    { group: 'Quality and design', items: 'Playwright, Karma, WCAG 2.1 AA, SEO, Adobe XD' },
  ];

  protected readonly offers = [
    {
      id: 'project',
      label: 'Project',
      title: 'A product or feature, built end to end',
      points: ['Fixed scope agreed up front', 'Weekly demos on a staging URL', 'You own the code and the repo'],
    },
    {
      id: 'contract',
      label: 'Contract',
      title: 'Part-time with your team',
      points: ['Architecture, reviews and hands-on code', 'Fits into your standups and tools', 'Monthly retainer, easy to pause'],
    },
    {
      id: 'review',
      label: 'Review',
      title: 'A second pair of eyes on your Angular app',
      points: ['Architecture, performance and bundle size', 'Accessibility and SEO audit', 'A written plan you can act on'],
    },
  ];
  protected readonly offerId = signal(this.offers[0].id);
  protected readonly offer = computed(() => this.offers.find((o) => o.id === this.offerId())!);

  protected readonly fits = [
    { k: 'angular', v: 'New Angular apps, or rescuing one that grew too fast' },
    { k: 'mfe', v: 'Splitting a monolith into micro-frontends' },
    { k: 'saas', v: 'Multi-tenant SaaS frontends and admin portals' },
    { k: 'widget', v: 'Widgets that embed in other people’s sites and apps' },
    { k: 'a11y', v: 'WCAG 2.1 AA and technical SEO passes' },
    { k: 'api', v: 'NestJS and PostgreSQL APIs behind it all' },
  ];

  protected readonly ready = signal(false);
  protected readonly copied = signal(false);

  constructor() {
    inject(Seo).set({
      description:
        'Mohammad Hamza (@mhfrough) is a software architect in Karachi building Angular platforms, multi-tenant SaaS and design systems. Available for freelance and contract work.',
      path: '/',
      type: 'profile',
      jsonLd: [
        { '@type': 'ProfilePage', '@id': `${SITE.origin}/#profile`, url: SITE.origin + '/', mainEntity: { '@id': PERSON_ID } },
        ...REELS.map((r, i) => ({
          '@type': 'VideoObject',
          name: r.title,
          description: i === 0 ? 'A 23-second intro to Quorum, a Claude Code skill for hard decisions.' : 'The seven Quorum council members on a 3D board.',
          thumbnailUrl: abs(r.poster),
          contentUrl: r.src,
          uploadDate: '2026-10-08T12:00:00+05:00',
          duration: i === 0 ? 'PT23S' : 'PT26S',
          creator: { '@id': PERSON_ID },
        })),
      ],
    });

    const destroyRef = inject(DestroyRef);
    let timer: ReturnType<typeof setTimeout> | undefined;
    destroyRef.onDestroy(() => clearTimeout(timer));
    afterNextRender(() => {
      requestAnimationFrame(() => this.ready.set(true));
    });
    this.resetCopied = () => {
      clearTimeout(timer);
      timer = setTimeout(() => this.copied.set(false), 1800);
    };
  }

  private resetCopied: () => void = () => {};

  protected async copyEmail(): Promise<void> {
    try {
      await navigator.clipboard.writeText(this.email);
      this.copied.set(true);
      this.resetCopied();
    } catch {
      window.location.href = `mailto:${this.email}`;
    }
  }

  protected onTabKey(e: KeyboardEvent): void {
    const i = this.offers.findIndex((o) => o.id === this.offerId());
    let next = i;
    if (e.key === 'ArrowRight') next = (i + 1) % this.offers.length;
    else if (e.key === 'ArrowLeft') next = (i - 1 + this.offers.length) % this.offers.length;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = this.offers.length - 1;
    else return;
    e.preventDefault();
    this.offerId.set(this.offers[next].id);
    document.getElementById('tab-' + this.offers[next].id)?.focus();
  }
}
