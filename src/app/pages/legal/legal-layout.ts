import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { phosphorArrowRight } from '@ng-icons/phosphor-icons/regular';
import { Reveal } from '../../shared/directives/reveal.directive';

/**
 * Shared layout for /privacy, /terms, /cookies and /accessibility.
 * Content is plain data (see legal.copy.ts): paragraphs and lists of inline segments, where a segment is
 * text or a link. Root-relative links use the router, everything else is a normal <a href>.
 */

export type Inline = string | { text: string; href: string };
export type Rich = string | readonly Inline[];
export type Block = { readonly p: Rich } | { readonly ul: readonly Rich[] };

export interface LegalSection {
  readonly id: string;
  readonly title: string;
  readonly blocks: readonly Block[];
}

export interface LegalDoc {
  readonly path: string;
  readonly crumb: string;
  readonly seoTitle: string;
  readonly description: string;
  readonly title: string;
  readonly soft: string;
  readonly updated: { readonly iso: string; readonly label: string };
  readonly summary: readonly Rich[];
  readonly sections: readonly LegalSection[];
}

export const LEGAL_LINKS = [
  { path: '/privacy', label: 'Privacy' },
  { path: '/terms', label: 'Terms' },
  { path: '/cookies', label: 'Cookies' },
  { path: '/accessibility', label: 'Accessibility' },
] as const;

@Component({
  selector: 'mh-legal-layout',
  imports: [RouterLink, NgTemplateOutlet, NgIcon, Reveal],
  viewProviders: [provideIcons({ phosphorArrowRight })],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="page-head glow head" [attr.aria-labelledby]="'legal-title'">
      <div #hero class="wrap hero-anim">
        <h1 id="legal-title" class="display">
          <span class="line"
            ><span>{{ doc().title }}</span></span
          >
          <span class="line"
            ><span class="soft">{{ doc().soft }}</span></span
          >
        </h1>
        <p class="updated mono rise d2">
          Last updated <time [attr.datetime]="doc().updated.iso">{{ doc().updated.label }}</time>
        </p>
      </div>
    </section>

    <div class="wrap layout">
      <section class="card summary" aria-labelledby="summary-title">
        <h2 id="summary-title" class="summary__title">In plain words</h2>
        <ul role="list">
          @for (item of doc().summary; track $index) {
            <li>
              <span class="tick" aria-hidden="true"></span>
              <span>
                <ng-container *ngTemplateOutlet="rich; context: { $implicit: item }" />
              </span>
            </li>
          }
        </ul>
      </section>

      <aside class="toc-col">
        <nav class="card toc" aria-labelledby="toc-title">
          <h2 id="toc-title" class="toc__title">On this page</h2>
          <ol role="list">
            @for (s of doc().sections; track s.id) {
              <li>
                <a
                  [routerLink]="[]"
                  [fragment]="s.id"
                  [attr.aria-current]="active() === s.id ? 'location' : null"
                  >{{ s.title }}</a
                >
              </li>
            }
          </ol>
          <h2 class="toc__title toc__title--other">Other policies</h2>
          <ul role="list" class="others">
            @for (l of others(); track l.path) {
              <li>
                <a class="chip" [routerLink]="l.path">{{ l.label }}</a>
              </li>
            }
          </ul>
        </nav>
      </aside>

      <article #article class="prose">
        @for (s of doc().sections; track s.id) {
          <section class="part" [id]="s.id" [attr.aria-labelledby]="s.id + '-h'" mhReveal>
            <h2 [id]="s.id + '-h'">{{ s.title }}</h2>
            @for (b of s.blocks; track $index) {
              @if (isList(b)) {
                <ul>
                  @for (li of b.ul; track $index) {
                    <li><ng-container *ngTemplateOutlet="rich; context: { $implicit: li }" /></li>
                  }
                </ul>
              } @else {
                <p><ng-container *ngTemplateOutlet="rich; context: { $implicit: para(b) }" /></p>
              }
            }
          </section>
        }

        <div class="card end">
          <p>Questions about this page?</p>
          <a class="btn btn-ghost btn-sm" routerLink="/contact"
            >Get in touch<ng-icon name="phosphorArrowRight" aria-hidden="true"
          /></a>
        </div>
      </article>
    </div>

    <ng-template #rich let-value>
      @for (seg of segs(value); track $index) {
        @if (isLink(seg)) {
          @if (seg.href.startsWith('/')) {
            <a class="link" [routerLink]="seg.href">{{ seg.text }}</a>
          } @else {
            <a
              class="link"
              [href]="seg.href"
              [attr.target]="seg.href.startsWith('http') ? '_blank' : null"
              [attr.rel]="seg.href.startsWith('http') ? 'noopener' : null"
              >{{ seg.text }}</a
            >
          }
        } @else {
          <ng-container>{{ seg }}</ng-container>
        }
      }
    </ng-template>
  `,
  styles: `
    :host {
      display: block;
      padding-bottom: 120px;
    }
    .head {
      padding-bottom: 56px;
    }
    /* Fade the global glow out at the bottom so it never ends on a hard edge. */
    .head::before {
      mask-image: linear-gradient(to bottom, black 55%, transparent);
    }
    .display {
      margin-bottom: 18px;
    }
    .updated {
      color: var(--muted);
    }
    .updated time {
      color: var(--ink-2);
    }

    .layout {
      display: grid;
      grid-template-columns: 260px minmax(0, 65ch);
      grid-template-areas:
        'toc summary'
        'toc article';
      column-gap: 56px;
      align-items: start;
    }
    .summary {
      grid-area: summary;
    }
    .toc-col {
      grid-area: toc;
      align-self: stretch;
    }
    .prose {
      grid-area: article;
    }

    /* TOC */
    .toc {
      position: sticky;
      top: calc(var(--nav-h) + var(--nav-top) + 24px);
      padding: 20px;
    }
    .toc__title {
      font-size: 13px;
      font-weight: 500;
      color: var(--muted);
      margin-bottom: 10px;
    }
    .toc__title--other {
      margin-top: 22px;
      padding-top: 18px;
      border-top: 1px solid var(--line);
    }
    .toc ol {
      display: grid;
      gap: 2px;
      counter-reset: toc;
    }
    .toc ol a {
      display: flex;
      gap: 10px;
      padding: 7px 12px;
      border-radius: 999px;
      font-size: 14px;
      line-height: 1.4;
      color: var(--ink-2);
      transition:
        background var(--t-base) var(--ease),
        color var(--t-base) var(--ease);
    }
    .toc ol a::before {
      counter-increment: toc;
      content: counter(toc, decimal-leading-zero);
      font-family: var(--font-mono);
      font-size: 12px;
      color: var(--muted);
      padding-top: 1px;
    }
    .toc ol a:hover {
      color: var(--ink);
      background: var(--surface-2);
    }
    .toc ol a[aria-current] {
      color: var(--ink);
      background: var(--accent-soft);
    }
    .others {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }

    /* Prose */
    .prose {
      max-width: 65ch;
      color: var(--ink-2);
      font-size: 16.5px;
      line-height: 1.7;
    }
    .summary {
      margin-bottom: 48px;
      color: var(--ink);
      max-width: 65ch;
    }
    .summary__title {
      font-size: 1.1rem;
      letter-spacing: -0.015em;
      margin-bottom: 14px;
    }
    .summary ul {
      display: grid;
      gap: 10px;
    }
    .summary li {
      display: flex;
      gap: 12px;
      align-items: baseline;
      font-size: 15.5px;
      line-height: 1.6;
      color: var(--ink-2);
    }
    .tick {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: var(--ink);
      flex-shrink: 0;
      transform: translateY(-2px);
    }
    .part {
      padding-top: 8px;
      margin-bottom: 40px;
      scroll-margin-top: calc(var(--nav-h) + var(--nav-top) + 24px);
    }
    .part h2 {
      color: var(--ink);
      font-size: 1.5rem;
      line-height: 1.25;
      letter-spacing: -0.025em;
      margin-bottom: 14px;
    }
    .part p + p,
    .part p + ul,
    .part ul + p {
      margin-top: 14px;
    }
    .part ul {
      margin: 0;
      padding-left: 1.2em;
      display: grid;
      gap: 6px;
    }
    .part li::marker {
      color: var(--muted);
    }
    .end {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 12px 20px;
      margin-top: 56px;
      color: var(--ink);
    }

    @media (max-width: 960px) {
      .layout {
        grid-template-columns: minmax(0, 1fr);
        grid-template-areas: 'summary' 'toc' 'article';
      }
      .summary {
        margin-bottom: 12px;
      }
      .toc {
        position: static;
        margin-bottom: 48px;
      }
    }
    @media (max-width: 640px) {
      :host {
        padding-bottom: 80px;
      }
      .head {
        padding-bottom: 40px;
      }
      .prose {
        font-size: 16px;
      }
    }
  `,
})
export class LegalLayout {
  readonly doc = input.required<LegalDoc>();
  protected readonly active = signal<string | null>(null);
  protected readonly others = () => LEGAL_LINKS.filter((l) => l.path !== this.doc().path);

  private readonly hero = viewChild.required<ElementRef<HTMLElement>>('hero');
  private readonly article = viewChild.required<ElementRef<HTMLElement>>('article');

  constructor() {
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      this.hero().nativeElement.classList.add('ready');
      if (typeof IntersectionObserver === 'undefined') return;
      // Highlight the section being read in the table of contents.
      const parts = Array.from(
        this.article().nativeElement.querySelectorAll<HTMLElement>('section.part'),
      );
      const io = new IntersectionObserver(
        (entries) => {
          for (const e of entries) if (e.isIntersecting) this.active.set(e.target.id);
        },
        { rootMargin: '-20% 0px -70% 0px' },
      );
      parts.forEach((p) => io.observe(p));
      destroyRef.onDestroy(() => io.disconnect());
    });
  }

  protected segs(v: Rich): readonly Inline[] {
    return typeof v === 'string' ? [v] : v;
  }

  protected isLink(seg: Inline): seg is { text: string; href: string } {
    return typeof seg !== 'string';
  }

  protected para(b: Block): Rich {
    return 'p' in b ? b.p : '';
  }

  protected isList(b: Block): b is { ul: readonly Rich[] } {
    return 'ul' in b;
  }
}
