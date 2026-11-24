import { ChangeDetectionStrategy, Component, DestroyRef, afterNextRender, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  phosphorArrowRight,
  phosphorBriefcase,
  phosphorCaretLeft,
  phosphorCaretRight,
  phosphorChartLineUp,
  phosphorChatsCircle,
  phosphorCheck,
  phosphorClock,
  phosphorCode,
  phosphorCopy,
  phosphorDatabase,
  phosphorDribbbleLogo,
  phosphorGithubLogo,
  phosphorGraduationCap,
  phosphorHandCoins,
  phosphorLinkedinLogo,
  phosphorPenNib,
  phosphorReceipt,
  phosphorRocketLaunch,
  phosphorSparkle,
  phosphorStack,
  phosphorStorefront,
  phosphorIdentificationBadge,
  phosphorPencilSimpleLine,
  phosphorTreePalm,
  phosphorTreeStructure,
  phosphorTruck,
} from '@ng-icons/phosphor-icons/regular';
import { PERSON_ID, Seo, abs } from '../../core/seo/seo.service';
import { SITE } from '../../core/site.config';
import { routes } from '../../app.routes';
import { Reveal } from '../../shared/directives/reveal.directive';
import { Pattern } from '../../shared/ui/pattern';
import { Skeleton } from '../../shared/ui/skeleton';
import { BENTO, EXPERIENCE, HOW, REELS, STACK } from './home.data';
import { HomeMore } from './home-more';
import { HeroCard } from './hero-card';

@Component({
  selector: 'mh-page-home',
  imports: [RouterLink, NgIcon, Pattern, Skeleton, Reveal, HeroCard, HomeMore],
  viewProviders: [
    provideIcons({
      phosphorArrowRight,
      phosphorBriefcase,
      phosphorCaretLeft,
      phosphorCaretRight,
      phosphorChartLineUp,
      phosphorChatsCircle,
      phosphorCheck,
      phosphorClock,
      phosphorCode,
      phosphorCopy,
      phosphorDatabase,
      phosphorDribbbleLogo,
      phosphorGithubLogo,
      phosphorGraduationCap,
      phosphorHandCoins,
      phosphorLinkedinLogo,
      phosphorPenNib,
      phosphorReceipt,
      phosphorRocketLaunch,
      phosphorSparkle,
      phosphorStack,
      phosphorStorefront,
      phosphorIdentificationBadge,
      phosphorPencilSimpleLine,
      phosphorTreePalm,
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
  // Bento: six case studies after Little Surprises (the feature cell). Order and count live in BENTO.
  protected readonly bento = BENTO;
  /** Case studies on the site, counted from the router so the number cannot drift. */
  protected readonly caseStudies = routes.filter((r) => r.path?.startsWith('work/')).length;

  // Credentials, not a scoreboard: short facts from the CV, no big digits.
  protected readonly credentials = [
    { k: 'Since 2020', v: '7+ years of experience in production software' },
    { k: '30+ products', v: 'Shipped across banking, tax, investment, fleet and SaaS' },
    { k: 'Architect and lead', v: 'Leads a team of 7+, sets the architecture, owns AWS releases' },
    { k: 'AI-first', v: 'Agentic workflows in Claude Code, from plan to test' },
  ];

  protected readonly kit = [
    { group: 'Frontend', items: ['Angular', 'React', 'TypeScript', 'JavaScript', 'RxJS', 'SCSS', 'Angular SSR', 'PWA'] },
    { group: 'Architecture', items: ['Micro-frontends', 'Multi-tenant SaaS', 'Fintech', 'Real-time', 'Widgets'] },
    { group: 'AI and agents', items: ['Claude Code', 'Multi-agent skills', 'Agentic workflows'] },
    { group: 'Backend and data', items: ['NestJS', 'Node.js', 'Java Spring Boot', '.NET', 'PHP', 'WordPress', 'PostgreSQL', 'MySQL', 'phpMyAdmin', 'MongoDB', 'Firebase', 'Supabase'] },
    { group: 'Mobile', items: ['Flutter', 'Ionic', 'Android Studio'] },
    { group: 'Cloud and DevOps', items: ['AWS', 'Cloudflare', 'Netlify', 'Render', 'Nginx', 'cPanel', 'Coolify'] },
    { group: 'Quality and design', items: ['Playwright', 'Karma', 'WCAG 2.1 AA', 'SEO', 'Adobe XD'] },
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

  protected readonly fits = [
    { k: 'angular', v: 'New Angular apps, or rescuing one that grew too fast' },
    { k: 'mfe', v: 'Splitting a monolith into micro-frontends' },
    { k: 'saas', v: 'Multi-tenant SaaS frontends and admin portals' },
    { k: 'widget', v: 'Widgets that embed in other people’s sites and apps' },
    { k: 'a11y', v: 'WCAG 2.1 AA and technical SEO passes' },
    { k: 'api', v: 'NestJS and PostgreSQL APIs behind it all' },
    { k: 'agents', v: 'Setting up AI-first, agentic delivery for a team' },
  ];

  protected readonly ready = signal(false);
  protected readonly copied = signal(false);

  constructor() {
    inject(Seo).set({
      description:
        'Mohammad Hamza (@mhfrough) is a software architect and lead developer in Karāchi building Angular platforms and multi-tenant SaaS, AI-first with agentic workflows, and co-founder of Little Surprises. Available for freelance and contract work.',
      path: '/',
      type: 'profile',
      jsonLd: [
        { '@type': 'ProfilePage', '@id': `${SITE.origin}/#profile`, url: SITE.origin + '/', mainEntity: { '@id': PERSON_ID } },
        ...REELS.map((r) => ({
          '@type': 'VideoObject',
          name: r.title,
          description: r.description,
          thumbnailUrl: abs(r.poster),
          contentUrl: r.src.startsWith('http') ? r.src : abs(r.src),
          uploadDate: r.uploadDate,
          duration: r.duration,
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

  /** Reels row arrows: about one screen of reels at a time, instant when the visitor prefers reduced motion. */
  protected scrollReels(row: HTMLElement, dir: 1 | -1): void {
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    row.scrollBy({ left: dir * row.clientWidth * 0.8, behavior: still ? 'auto' : 'smooth' });
  }

  protected async copyEmail(): Promise<void> {
    try {
      await navigator.clipboard.writeText(this.email);
      this.copied.set(true);
      this.resetCopied();
    } catch {
      window.location.href = `mailto:${this.email}`;
    }
  }
}
