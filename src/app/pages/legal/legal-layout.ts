import { ChangeDetectionStrategy, Component, ElementRef, afterNextRender, input, viewChild } from '@angular/core';
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
      <div #hero class="wrap col hero-anim">
        <p class="kicker mono rise">Legal</p>
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

    <div class="wrap col">
      <section class="summary" aria-labelledby="summary-title">
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

      <article class="prose">
        @for (s of doc().sections; track s.id; let i = $index) {
          <section class="part" [id]="s.id" [attr.aria-labelledby]="s.id + '-h'" mhReveal>
            <h2 [id]="s.id + '-h'"><span class="num mono" aria-hidden="true">{{ i + 1 < 10 ? '0' : '' }}{{ i + 1 }}</span>{{ s.title }}</h2>
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
      </article>

      <footer class="end">
        <nav aria-label="Other policies">
          <ul role="list" class="others">
            @for (l of others(); track l.path) {
              <li>
                <a class="chip" [routerLink]="l.path">{{ l.label }}</a>
              </li>
            }
          </ul>
        </nav>
        <a class="btn btn-ghost btn-sm" routerLink="/contact"
          >Get in touch<ng-icon name="phosphorArrowRight" aria-hidden="true"
        /></a>
      </footer>
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
      padding-bottom: 80px;
    }
    /* One reading column, no sidebar. Small type: these pages are reference, not marketing. */
    .col {
      max-width: calc(680px + 2 * var(--gutter));
    }
    .head {
      padding-bottom: 36px;
    }
    /* Fade the global glow out at the bottom so it never ends on a hard edge. */
    .head::before {
      mask-image: linear-gradient(to bottom, black 55%, transparent);
    }
    .kicker {
      color: var(--muted);
      font-size: 12px;
    }
    .display {
      font-size: clamp(1.8rem, 3.4vw, 2.5rem);
      margin: 10px 0 12px;
    }
    .updated {
      color: var(--muted);
      font-size: 12px;
    }
    .updated time {
      color: var(--ink-2);
    }

    .summary {
      padding: 16px 18px;
      border-radius: var(--r-inner);
      background: var(--surface);
      border: 1px solid var(--line);
      margin-bottom: 36px;
    }
    .summary__title {
      font-size: 13px;
      font-weight: 500;
      color: var(--muted);
      margin-bottom: 10px;
    }
    .summary ul {
      display: grid;
      gap: 8px;
    }
    .summary li {
      display: flex;
      gap: 10px;
      align-items: baseline;
      font-size: 14px;
      line-height: 1.6;
      color: var(--ink-2);
    }
    .tick {
      width: 5px;
      height: 5px;
      border-radius: 50%;
      background: var(--ink);
      flex-shrink: 0;
      transform: translateY(-2px);
    }

    .prose {
      color: var(--ink-2);
      font-size: 14.5px;
      line-height: 1.7;
    }
    .part {
      padding-top: 22px;
      margin-top: 22px;
      border-top: 1px solid var(--line);
      scroll-margin-top: calc(var(--nav-h) + var(--nav-top) + 24px);
    }
    .part:first-child {
      border-top: 0;
      margin-top: 0;
      padding-top: 0;
    }
    .part h2 {
      display: flex;
      align-items: baseline;
      gap: 12px;
      color: var(--ink);
      font-size: 1.05rem;
      line-height: 1.35;
      letter-spacing: -0.015em;
      margin-bottom: 10px;
    }
    .num {
      font-size: 11.5px;
      font-weight: 400;
      color: var(--muted);
    }
    .part p + p,
    .part p + ul,
    .part ul + p {
      margin-top: 10px;
    }
    .part ul {
      margin: 0;
      padding-left: 1.2em;
      display: grid;
      gap: 5px;
    }
    .part li::marker {
      color: var(--muted);
    }
    .end {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 14px 20px;
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid var(--line);
    }
    .others {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }

    @media (max-width: 640px) {
      :host {
        padding-bottom: 56px;
      }
      .head {
        padding-bottom: 28px;
      }
    }
  `,
})
export class LegalLayout {
  readonly doc = input.required<LegalDoc>();
  protected readonly others = () => LEGAL_LINKS.filter((l) => l.path !== this.doc().path);

  private readonly hero = viewChild.required<ElementRef<HTMLElement>>('hero');

  constructor() {
    afterNextRender(() => this.hero().nativeElement.classList.add('ready'));
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
