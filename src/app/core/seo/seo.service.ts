import { DOCUMENT } from '@angular/common';
import { Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { SITE } from '../site.config';
import { I18n, LANGS, Lang, localize } from '../i18n/i18n.service';

export interface PageMeta {
  /** Page title without the site suffix. Omit on the home page. */
  title?: string;
  description: string;
  /** Language-less path, e.g. '/work/quorum'. */
  path: string;
  /** Absolute or root-relative. JPG/PNG 1200x630 (not every crawler reads WebP). */
  image?: string;
  imageAlt?: string;
  type?: 'website' | 'article' | 'profile';
  /** Extra JSON-LD nodes for this page; Person + WebSite + WebPage + BreadcrumbList are added automatically. */
  jsonLd?: Record<string, unknown>[];
  /** Breadcrumb trail after Home, e.g. [{ name: 'Work', path: '/work' }, { name: 'Quorum', path: '/work/quorum' }]. */
  breadcrumbs?: { name: string; path: string }[];
  noindex?: boolean;
  publishedTime?: string;
  modifiedTime?: string;
}

const OG_LOCALE: Record<Lang, string> = { en: 'en_US', ur: 'ur_PK' };
export const PERSON_ID = `${SITE.origin}/#person`;
export const WEBSITE_ID = `${SITE.origin}/#website`;

export const abs = (pathOrUrl: string) =>
  /^https?:\/\//.test(pathOrUrl) ? pathOrUrl : SITE.origin + (pathOrUrl.startsWith('/') ? '' : '/') + pathOrUrl;

/**
 * One call per page sets: <title>, description, robots, canonical, hreflang alternates,
 * Open Graph, Twitter card and a single JSON-LD @graph. Runs during prerender, so crawlers
 * get it without JavaScript.
 */
@Injectable({ providedIn: 'root' })
export class Seo {
  private readonly doc = inject(DOCUMENT);
  private readonly meta = inject(Meta);
  private readonly titleSvc = inject(Title);
  private readonly i18n = inject(I18n);

  set(page: PageMeta): void {
    const lang = this.i18n.lang();
    const url = abs(localize(page.path, lang));
    const fullTitle = page.title ? `${page.title} | ${SITE.name}` : `${SITE.name} (${SITE.at}) | ${SITE.role}`;
    const image = abs(page.image ?? SITE.defaultOgImage);
    const imageAlt = page.imageAlt ?? `${SITE.name}, ${SITE.role}`;

    this.titleSvc.setTitle(fullTitle);
    this.tag('name', 'description', page.description);
    this.tag('name', 'robots', page.noindex ? 'noindex, follow' : 'index, follow, max-image-preview:large');
    this.tag('name', 'author', SITE.name);

    this.tag('property', 'og:type', page.type ?? 'website');
    this.tag('property', 'og:site_name', SITE.name);
    this.tag('property', 'og:title', fullTitle);
    this.tag('property', 'og:description', page.description);
    this.tag('property', 'og:url', url);
    this.tag('property', 'og:image', image);
    this.tag('property', 'og:image:alt', imageAlt);
    this.tag('property', 'og:image:width', '1200');
    this.tag('property', 'og:image:height', '630');
    this.tag('property', 'og:locale', OG_LOCALE[lang]);
    this.tag('property', 'og:locale:alternate', OG_LOCALE[lang === 'en' ? 'ur' : 'en']);
    if (page.publishedTime) this.tag('property', 'article:published_time', page.publishedTime);
    if (page.modifiedTime) this.tag('property', 'article:modified_time', page.modifiedTime);

    this.tag('name', 'twitter:card', 'summary_large_image');
    this.tag('name', 'twitter:title', fullTitle);
    this.tag('name', 'twitter:description', page.description);
    this.tag('name', 'twitter:image', image);
    this.tag('name', 'twitter:image:alt', imageAlt);

    this.links(page.path, url, page.noindex);
    this.jsonLd(page, url, fullTitle, lang);
  }

  private tag(attr: 'name' | 'property', key: string, content: string): void {
    this.meta.updateTag({ [attr]: key, content }, `${attr}="${key}"`);
  }

  private links(path: string, canonical: string, noindex?: boolean): void {
    const head = this.doc.head;
    head.querySelectorAll('link[rel="canonical"], link[rel="alternate"][hreflang]').forEach((n) => n.remove());
    const add = (attrs: Record<string, string>) => {
      const l = this.doc.createElement('link');
      Object.entries(attrs).forEach(([k, v]) => l.setAttribute(k, v));
      head.appendChild(l);
    };
    add({ rel: 'canonical', href: canonical });
    if (noindex) return;
    for (const l of LANGS) add({ rel: 'alternate', hreflang: l, href: abs(localize(path, l)) });
    add({ rel: 'alternate', hreflang: 'x-default', href: abs(localize(path, 'en')) });
  }

  private jsonLd(page: PageMeta, url: string, title: string, lang: Lang): void {
    const crumbs = [{ name: lang === 'ur' ? 'ہوم' : 'Home', path: '/' }, ...(page.breadcrumbs ?? [])];
    const graph: Record<string, unknown>[] = [
      personNode(),
      {
        '@type': 'WebSite',
        '@id': WEBSITE_ID,
        url: SITE.origin + '/',
        name: SITE.name,
        alternateName: [SITE.at, SITE.domain],
        inLanguage: ['en', 'ur'],
        publisher: { '@id': PERSON_ID },
      },
      {
        '@type': 'WebPage',
        '@id': url + '#webpage',
        url,
        name: title,
        description: page.description,
        inLanguage: lang,
        isPartOf: { '@id': WEBSITE_ID },
        about: { '@id': PERSON_ID },
        primaryImageOfPage: abs(page.image ?? SITE.defaultOgImage),
      },
      ...(crumbs.length > 1
        ? [
            {
              '@type': 'BreadcrumbList',
              itemListElement: crumbs.map((c, i) => ({
                '@type': 'ListItem',
                position: i + 1,
                name: c.name,
                item: abs(localize(c.path, lang)),
              })),
            },
          ]
        : []),
      ...(page.jsonLd ?? []),
    ];

    let script = this.doc.head.querySelector<HTMLScriptElement>('script#ld-json');
    if (!script) {
      script = this.doc.createElement('script');
      script.id = 'ld-json';
      script.type = 'application/ld+json';
      this.doc.head.appendChild(script);
    }
    script.textContent = JSON.stringify({ '@context': 'https://schema.org', '@graph': graph });
  }
}

export function personNode(): Record<string, unknown> {
  return {
    '@type': 'Person',
    '@id': PERSON_ID,
    name: SITE.name,
    alternateName: SITE.at,
    url: SITE.origin + '/',
    jobTitle: SITE.role,
    description:
      'Software architect and lead frontend developer building production SaaS, fintech and enterprise platforms with Angular, NestJS and PostgreSQL.',
    image: abs(SITE.avatar ?? '/icons/icon-512.png'),
    address: { '@type': 'PostalAddress', addressLocality: SITE.locality, addressCountry: SITE.countryCode },
    alumniOf: { '@type': 'CollegeOrUniversity', name: 'Karachi Institute of Economics and Technology (KIET)' },
    knowsLanguage: ['en', 'ur'],
    knowsAbout: [
      'Angular',
      'TypeScript',
      'RxJS',
      'Micro-frontends',
      'Multi-tenant SaaS',
      'NestJS',
      'PostgreSQL',
      'Flutter',
      'Web accessibility (WCAG 2.1 AA)',
      'Technical SEO',
      'UI/UX design',
    ],
    sameAs: Object.values(SITE.social),
  };
}
