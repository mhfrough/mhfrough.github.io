import { DOCUMENT } from '@angular/common';
import { Injectable, Pipe, PipeTransform, Signal, computed, inject, signal } from '@angular/core';
import { ActivatedRouteSnapshot, Router, RoutesRecognized } from '@angular/router';

export type Lang = 'en' | 'ur';
export const LANGS: readonly Lang[] = ['en', 'ur'];

/** Every piece of visible copy is declared once per language: `const copy: Copy<{...}> = { en: {...}, ur: {...} }`. */
export type Copy<T> = Record<Lang, T>;

const UR_PREFIX = '/ur';

/** Split a URL into language + language-less path. '/ur/hire?x#y' -> { lang: 'ur', path: '/hire' } */
export function parseLangUrl(url: string): { lang: Lang; path: string } {
  const clean = url.split(/[?#]/)[0] || '/';
  if (clean === UR_PREFIX || clean.startsWith(UR_PREFIX + '/')) {
    return { lang: 'ur', path: clean.slice(UR_PREFIX.length) || '/' };
  }
  return { lang: 'en', path: clean };
}

/** Prefix a language-less path for a language. localize('/hire', 'ur') -> '/ur/hire' */
export function localize(path: string, lang: Lang): string {
  const p = path.startsWith('/') ? path : '/' + path;
  if (lang === 'en') return p;
  return p === '/' ? UR_PREFIX : UR_PREFIX + p;
}

/**
 * Route-driven i18n. The language lives in the URL (/ur/...), so every language is prerendered,
 * crawlable, and shareable. Updated on RoutesRecognized, i.e. before page components are created,
 * so constructors can read `lang()` safely.
 */
@Injectable({ providedIn: 'root' })
export class I18n {
  private readonly doc = inject(DOCUMENT);
  private readonly router = inject(Router);

  private readonly _lang = signal<Lang>('en');
  private readonly _path = signal('/');
  private readonly _theme = signal<string | null>(null);

  readonly lang = this._lang.asReadonly();
  /** Current path without the language prefix. */
  readonly path = this._path.asReadonly();
  /** Project theme slug from route data (case studies), or null for the brand theme. */
  readonly theme = this._theme.asReadonly();
  readonly dir = computed(() => (this._lang() === 'ur' ? 'rtl' : 'ltr'));
  readonly isUrdu = computed(() => this._lang() === 'ur');
  /** The other language, for the switcher. */
  readonly other = computed<Lang>(() => (this._lang() === 'en' ? 'ur' : 'en'));

  constructor() {
    this.router.events.subscribe((e) => {
      if (!(e instanceof RoutesRecognized)) return;
      const { lang, path } = parseLangUrl(e.urlAfterRedirects);
      this._lang.set(lang);
      this._path.set(path);
      this._theme.set(deepestData(e.state.root, 'theme') ?? null);
      this.applyToDocument();
    });
  }

  /** Reactive view of a Copy object for the current language. */
  select<T>(copy: Copy<T>): Signal<T> {
    return computed(() => copy[this._lang()]);
  }

  /** Non-reactive read for one-off use (e.g. SEO in a constructor). */
  pick<T>(copy: Copy<T>): T {
    return copy[this._lang()];
  }

  /** Localized href for a language-less path. */
  link(path: string, lang: Lang = this._lang()): string {
    return localize(path, lang);
  }

  /** The current page in the other language. */
  readonly alternateHref = computed(() => localize(this._path(), this.other()));

  private applyToDocument(): void {
    const html = this.doc.documentElement;
    html.setAttribute('lang', this._lang());
    html.setAttribute('dir', this.dir());
    const theme = this._theme();
    if (theme) html.setAttribute('data-theme', theme);
    else html.removeAttribute('data-theme');
  }
}

function deepestData(snap: ActivatedRouteSnapshot, key: string): string | undefined {
  let found: string | undefined = snap.data?.[key];
  for (const child of snap.children) {
    const v = deepestData(child, key);
    if (v !== undefined) found = v;
  }
  return found;
}

/** `[routerLink]="'/hire' | loc"` -> '/ur/hire' on Urdu pages. Impure so the shell reacts to language changes. */
@Pipe({ name: 'loc', pure: false })
export class LocPipe implements PipeTransform {
  private readonly i18n = inject(I18n);
  transform(path: string, lang?: Lang): string {
    return this.i18n.link(path, lang ?? this.i18n.lang());
  }
}
