import { ChangeDetectionStrategy, Component, DestroyRef, ElementRef, afterNextRender, inject, signal, viewChild } from '@angular/core';
import { Avatar } from '../../../shared/ui/avatar';
import { Skeleton } from '../../../shared/ui/skeleton';
import { Spec } from './spec';

const MARQUEE = ['Angular', 'NestJS', 'PostgreSQL', 'Micro-frontends', 'Multi-tenant SaaS', 'WCAG 2.1 AA', 'Flutter', 'Socket.io', 'Stripe', 'WebAuthn'];

/** Components, part 4 (deferred): avatar, skeletons, loading vs loaded card, reel frame, the page's one marquee. */
@Component({
  selector: 'mh-brand-cmp-status',
  imports: [Spec, Avatar, Skeleton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="bp-grid">
      <mh-spec name="Avatar" cls="mh-avatar [size] [src]" layout="center" [markup]="avatarMarkup">
        <figure class="av">
          <mh-avatar [size]="72" />
          <figcaption class="mono">photo slot</figcaption>
        </figure>
        <figure class="av">
          <mh-avatar [size]="56" [src]="null" />
          <figcaption class="mono">monogram 56</figcaption>
        </figure>
        <figure class="av">
          <mh-avatar [size]="40" [src]="null" />
          <figcaption class="mono">40</figcaption>
        </figure>
      </mh-spec>

      <mh-spec name="Skeletons" cls="mh-skeleton shape text | block | circle" layout="col" [markup]="skelMarkup">
        <div class="sk-row">
          <mh-skeleton shape="circle" [size]="40" />
          <mh-skeleton class="grow" shape="text" [lines]="2" />
        </div>
        <mh-skeleton shape="block" ratio="16/9" />
      </mh-spec>

      <mh-spec name="Loading card, loaded card" cls="@defer { } @placeholder (minimum 300ms) { mh-skeleton }" layout="sunk" class="span-all" [markup]="deferMarkup">
        <div class="pair">
          <article class="card proj" aria-hidden="true">
            <mh-skeleton shape="block" ratio="1200/630" />
            <mh-skeleton class="sk-title" shape="text" [lines]="1" width="60%" />
            <mh-skeleton shape="text" [lines]="2" />
            <div class="sk-tags">
              <mh-skeleton shape="block" height="26px" width="72px" />
              <mh-skeleton shape="block" height="26px" width="64px" />
            </div>
          </article>
          <article class="card proj">
            <img src="/images/quorum/og-cover.webp" width="1200" height="630" alt="Quorum cover: seven council members on a board" loading="lazy" decoding="async" />
            <h4 class="h3">Quorum</h4>
            <p>A council of seven minds for hard decisions, as a Claude Code skill.</p>
            <ul class="tag-list" role="list">
              <li class="tag">claude-code</li>
              <li class="tag">three.js</li>
            </ul>
          </article>
        </div>
      </mh-spec>

      <mh-spec name="Reel" cls=".reels > figure.reel > .reel-media + figcaption" layout="sunk" class="span-all">
        <div class="reels">
          <figure class="reel">
            <div class="reel-media">
              <img src="/images/quorum/quorum-reel.webp" width="720" height="1280" alt="Meet the Quorum, reel poster" loading="lazy" decoding="async" />
            </div>
            <figcaption>Meet the Quorum <span>0:23</span></figcaption>
          </figure>
          <figure class="reel" aria-hidden="true" data-spec-skip>
            <div class="reel-media"><mh-skeleton shape="block" height="100%" /></div>
            <figcaption><mh-skeleton class="grow" shape="text" [lines]="1" width="70%" /></figcaption>
          </figure>
        </div>
      </mh-spec>

      <mh-spec name="Marquee" cls=".marquee > .track (max one per page)" layout="col" class="span-all">
        <div class="marquee" #marquee>
          <ul class="track" role="list" [style.animation-play-state]="onScreen() ? null : 'paused'">
            @for (m of items; track $index) {
              <li class="q" [attr.aria-hidden]="$index >= half ? 'true' : null">{{ m }}</li>
            }
          </ul>
        </div>
        <p class="note">This is the only marquee on this page. Hover pauses it, it stops off screen, and reduced motion holds it still.</p>
      </mh-spec>
    </div>
  `,
  styles: `
    .av {
      display: grid;
      justify-items: center;
      align-content: end;
      gap: 10px;
      height: 106px;
      margin: 0 12px;
    }
    .av figcaption {
      font-size: 12px;
      color: var(--muted);
    }
    .sk-row {
      display: flex;
      align-items: center;
      gap: 14px;
    }
    .grow {
      flex: 1;
    }
    .pair {
      width: 100%;
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 12px;
    }
    .proj {
      display: grid;
      gap: 12px;
      align-content: start;
      padding: 14px 14px 22px;
    }
    .proj > :not(:first-child) {
      margin-inline: 8px;
    }
    .proj img {
      width: 100%;
      border-radius: var(--r-inner);
    }
    .proj p {
      color: var(--ink-2);
      font-size: 15px;
    }
    .sk-title {
      font-size: 1.25rem;
    }
    .sk-tags {
      display: flex;
      gap: 6px;
    }
    .sk-tags mh-skeleton ::ng-deep .skeleton {
      border-radius: 999px;
    }
    .reels {
      width: 100%;
      grid-auto-columns: min(46vw, 240px);
    }
    .reel figcaption mh-skeleton {
      width: 100%;
    }
    .reel-media mh-skeleton {
      position: absolute;
      inset: 0;
    }
    .reel-media mh-skeleton ::ng-deep .skeleton {
      height: 100%;
      border-radius: 0;
    }
    .q {
      flex-shrink: 0;
      padding: 8px 16px;
      border-radius: 999px;
      background: var(--surface-2);
      border: 1px solid var(--line);
      font-size: 14px;
      color: var(--ink-2);
      white-space: nowrap;
    }
    .note {
      font-size: 13.5px;
      color: var(--muted);
    }
    @media (max-width: 640px) {
      .pair {
        grid-template-columns: minmax(0, 1fr);
      }
    }
  `,
})
export class BrandCmpStatus {
  protected readonly items = [...MARQUEE, ...MARQUEE];
  protected readonly half = MARQUEE.length;
  protected readonly onScreen = signal(false);
  protected readonly avatarMarkup = `<mh-avatar [size]="40" />\n<mh-avatar [size]="40" [src]="null" />`;
  protected readonly skelMarkup = `<mh-skeleton shape="circle" [size]="40" />\n<mh-skeleton shape="text" [lines]="2" />\n<mh-skeleton shape="block" ratio="16/9" />`;
  protected readonly deferMarkup = `@defer (on viewport) {\n  <mh-project-card [project]="p" />\n} @placeholder (minimum 300ms) {\n  <mh-skeleton shape="block" ratio="1200/630" />\n}`;
  private readonly marquee = viewChild.required<ElementRef<HTMLElement>>('marquee');

  constructor() {
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      if (typeof IntersectionObserver === 'undefined') return this.onScreen.set(true);
      const io = new IntersectionObserver(([e]) => this.onScreen.set(e.isIntersecting));
      io.observe(this.marquee().nativeElement);
      destroyRef.onDestroy(() => io.disconnect());
    });
  }
}
