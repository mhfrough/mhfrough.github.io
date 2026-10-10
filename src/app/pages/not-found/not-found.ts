import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  afterNextRender,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { phosphorArrowRight, phosphorHouse } from '@ng-icons/phosphor-icons/regular';
import { Seo } from '../../core/seo/seo.service';

const COPY = {
  seoTitle: 'Page not found',
  description:
    'This page does not exist on mhfrough.dev. Head home, view the work, or get in touch.',
  code: '404',
  line: 'This page does not exist, or it moved.',
  label: 'Requested path',
  home: 'Home',
  work: 'View work',
  contact: 'Get in touch',
} as const;

/**
 * 404 for /404 (prerendered, copied to /404.html for static hosts) and the ** route.
 * The requested path is read from location in the browser only: static hosts serve this same file for
 * every unknown URL, so the prerendered value would always be "/404".
 */
@Component({
  selector: 'mh-page-not-found',
  imports: [RouterLink, NgIcon],
  viewProviders: [provideIcons({ phosphorHouse, phosphorArrowRight })],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="page-head glow nf" aria-labelledby="nf-title">
      <div #hero class="wrap hero-anim">
        <div class="card card--lift box">
          <p class="nf-code mono rise" aria-hidden="true">{{ c.code }}</p>
          <h1 id="nf-title" class="title rise d2">
            <span class="sr-only">{{ c.code }}: </span>{{ c.line }}
          </h1>
          <div class="cmd path rise d2">
            <span class="prompt" aria-hidden="true">GET</span>
            <span class="sr-only">{{ c.label }}:</span>
            <code>{{ path() || '/404' }}</code>
          </div>
          <div class="actions rise d4">
            <a class="btn btn-solid" routerLink="/"
              ><ng-icon name="phosphorHouse" aria-hidden="true" />{{ c.home }}</a
            >
            <a class="btn btn-ghost" routerLink="/work">{{ c.work }}</a>
            <a class="btn btn--quiet" routerLink="/contact"
              >{{ c.contact }}<ng-icon name="phosphorArrowRight" aria-hidden="true"
            /></a>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: `
    :host {
      display: block;
    }
    .nf {
      min-height: 78dvh;
      display: grid;
      align-items: center;
      padding-bottom: 96px;
    }
    /* Fade the global glow out at the bottom so it never ends on a hard edge. */
    .nf::before {
      mask-image: linear-gradient(to bottom, black 55%, transparent);
    }
    .box {
      max-width: 620px;
      margin: 0 auto;
      padding: clamp(32px, 6vw, 56px) clamp(22px, 5vw, 48px);
      display: grid;
      justify-items: center;
      text-align: center;
      gap: 20px;
    }
    .nf-code {
      font-size: clamp(4.5rem, 14vw, 7.5rem);
      line-height: 1;
      letter-spacing: -0.06em;
      font-weight: 500;
      color: var(--ink);
    }
    .title {
      font-size: clamp(1.35rem, 3vw, 1.75rem);
      letter-spacing: -0.025em;
      line-height: 1.25;
      max-width: 24ch;
      margin: 0;
    }
    .path {
      width: 100%;
      max-width: 440px;
      padding: 6px 22px;
      min-height: 46px;
      text-align: left;
    }
    .actions {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 10px;
      margin-top: 8px;
    }
  `,
})
export class NotFound {
  protected readonly c = COPY;
  protected readonly path = signal('');
  private readonly hero = viewChild.required<ElementRef<HTMLElement>>('hero');

  constructor() {
    inject(Seo).set({
      title: COPY.seoTitle,
      description: COPY.description,
      path: '/404',
      noindex: true,
    });
    afterNextRender(() => {
      const raw = location.pathname + location.search;
      try {
        this.path.set(decodeURI(raw));
      } catch {
        this.path.set(raw); // malformed escape sequence: show it as typed
      }
      this.hero().nativeElement.classList.add('ready');
    });
  }
}
