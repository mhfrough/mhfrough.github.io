import { ChangeDetectionStrategy, Component, DestroyRef, ElementRef, afterNextRender, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  phosphorArrowRight,
  phosphorCaretLeft,
  phosphorCaretRight,
  phosphorPause,
  phosphorPlay,
  phosphorBroadcast,
  phosphorBuildings,
  phosphorCheckCircle,
  phosphorLightning,
  phosphorRobot,
  phosphorShieldCheck,
  phosphorStack,
} from '@ng-icons/phosphor-icons/regular';
import { CARD_SHOTS } from '../work/work.data';
import { CARD_THUMBS } from '../work/work.thumbs';

interface Offer {
  icon: string;
  text: string;
}

interface Intent {
  id: string;
  label: string;
  icon: string;
  /** One of my own products (never a client's), shown with a real screenshot. */
  name: string;
  sub: string;
  href: string;
  shot: string;
  /** What I'd do for you, from docs/content.md skills. Kept short: one line each down to 320 px, so no answer jumps. */
  offer: [Offer, Offer];
}

/**
 * Hero component: "What are you building?" Three kinds of project; each answers with one of my own products (never a
 * client's product: those live on /work as case studies) and two lines on what I would build for you.
 * A working component in the Quorum builder tradition, kept to the hero's height.
 */
const INTENTS: Intent[] = [
  {
    id: 'saas',
    label: 'SaaS platform',
    icon: 'phosphorBuildings',
    name: 'HRM Suite',
    sub: 'My HR and payroll SaaS',
    href: '/work/hrm',
    shot: CARD_SHOTS['hrm-suite'][0], // the same front image as its /work card
    offer: [
      { icon: 'phosphorShieldCheck', text: 'Multi-tenant Angular and NestJS' },
      { icon: 'phosphorStack', text: 'Flutter apps on the same API' },
    ],
  },
  {
    id: 'ai',
    label: 'AI and agents',
    icon: 'phosphorRobot',
    name: 'Quorum',
    sub: 'My Claude Code skill',
    href: '/work/quorum',
    shot: '/images/quorum/site-hero.webp', // the live landing page at 16:10 (scripts/quorum-site-shot.mjs)
    offer: [
      { icon: 'phosphorStack', text: 'Multi-agent tools on Claude Code' },
      { icon: 'phosphorCheckCircle', text: 'Landing pages that explain them' },
    ],
  },
  {
    id: 'realtime',
    label: 'Real-time app',
    icon: 'phosphorBroadcast',
    name: 'Whiteboard',
    sub: 'My live infinite canvas',
    href: '/work/whiteboard',
    shot: CARD_SHOTS['whiteboard'][0], // the same front image as its /work card
    offer: [
      { icon: 'phosphorBroadcast', text: 'Live editing over Socket.io' },
      { icon: 'phosphorLightning', text: 'Signals-first, fast Angular' },
    ],
  },
];

/** Standard reading time for one answer: ~230 words a minute plus a beat to look at the shot, at least 6 s. */
function readingMs(i: Intent): number {
  const words = [i.name, i.sub, ...i.offer.map((o) => o.text)].join(' ').split(/\s+/).length;
  return Math.max(6000, Math.round((words / 230) * 60_000) + 2500);
}

@Component({
  selector: 'mh-work-explorer',
  imports: [NgIcon, RouterLink],
  viewProviders: [
    provideIcons({
      phosphorArrowRight,
      phosphorCaretLeft,
      phosphorCaretRight,
      phosphorPause,
      phosphorPlay,
      phosphorBroadcast,
      phosphorBuildings,
      phosphorCheckCircle,
      phosphorLightning,
      phosphorRobot,
      phosphorShieldCheck,
      phosphorStack,
    }),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="stack">
      <div class="card card--lift explorer">
        <div class="head">
          <h2 id="wx-title">What are you building?</h2>
          <span class="head-r">
            @if (auto()) {
              <button type="button" class="pp" [attr.aria-label]="paused() ? 'Resume rotating examples' : 'Pause rotating examples'" (click)="togglePause()">
                <ng-icon [name]="paused() ? 'phosphorPlay' : 'phosphorPause'" aria-hidden="true" />
              </button>
            }
            <a class="all" routerLink="/work">View work <ng-icon name="phosphorArrowRight" aria-hidden="true" /></a>
          </span>
        </div>

        <div class="intents" role="group" aria-labelledby="wx-title">
          @for (i of intents; track i.id) {
            <button type="button" class="chip" [attr.aria-pressed]="intent().id === i.id" (click)="pick(i.id)">
              <ng-icon [name]="i.icon" aria-hidden="true" />{{ i.label }}
            </button>
          }
        </div>

        <!-- Every answer sits in the same grid cell and only the active one is visible, so the panel is always as
             tall as its tallest answer and nothing below it moves when the chip changes. -->
        <p class="sr-only" aria-live="polite">{{ intent().name }}</p>
        <div class="answers">
          @for (i of intents; track i.id) {
            <div class="result" [class.on]="i.id === intent().id" [attr.inert]="i.id === intent().id ? null : ''" [attr.aria-hidden]="i.id === intent().id ? null : 'true'">
              <a class="lead" [routerLink]="i.href">
                <span class="shot">
                  <img [src]="thumb(i.shot)" width="1280" height="800" [alt]="'Screenshot of ' + i.name" decoding="async" />
                </span>
                <span class="row">
                  <span class="t">
                    <b>{{ i.name }}</b>
                    <small>{{ i.sub }}</small>
                  </span>
                  <span class="go">See it <ng-icon name="phosphorArrowRight" aria-hidden="true" /></span>
                </span>
              </a>

              <ul class="offer" role="list" aria-label="What I would build for you">
                @for (o of i.offer; track o.text) {
                  <li><ng-icon [name]="o.icon" aria-hidden="true" />{{ o.text }}</li>
                }
              </ul>

            </div>
          }
        </div>

        <div class="ctrls">
          <button type="button" class="nav" aria-label="Previous example" (click)="step(-1)">
            <ng-icon name="phosphorCaretLeft" aria-hidden="true" />
          </button>
          <span class="dots" aria-hidden="true">
            @for (i of intents; track i.id) {
              <i [class.on]="i.id === intent().id"></i>
            }
          </span>
          <button type="button" class="nav" aria-label="Next example" (click)="step(1)">
            <ng-icon name="phosphorCaretRight" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  `,
  styles: `
    :host {
      display: block;
      min-width: 0;
    }
    /* A second, offset card behind the panel for depth */
    .stack {
      position: relative;
      padding-top: 18px;
    }
    .stack::before {
      content: '';
      position: absolute;
      left: 6%;
      right: 6%;
      top: 0;
      height: 60px;
      border-radius: var(--r-card);
      background: var(--surface-2);
      border: 1px solid var(--line);
    }
    .explorer {
      position: relative;
      padding: 20px;
    }
    .head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      margin-bottom: 12px;
    }
    h2 {
      font-size: 17px;
      letter-spacing: -0.01em;
    }
    .head-r {
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }
    .pp {
      position: relative;
      width: 30px;
      height: 30px;
      display: grid;
      place-items: center;
      border-radius: 999px;
      border: 1px solid var(--line);
      background: transparent;
      color: var(--ink-2);
      font-size: 13px;
      cursor: pointer;

      // 44px hit area around a 30px button.
      &::before {
        content: '';
        position: absolute;
        inset: -7px;
      }
      &:hover {
        color: var(--ink);
        background: var(--surface-2);
      }
    }
    // Arrows and dots, the same control as the /work card slider.
    .ctrls {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      margin-top: 14px;
    }
    .nav {
      position: relative;
      width: 30px;
      height: 30px;
      display: grid;
      place-items: center;
      border-radius: 999px;
      border: 1px solid var(--line);
      background: var(--surface);
      color: var(--ink);
      font-size: 14px;
      cursor: pointer;

      // 44px hit area around a 30px button.
      &::before {
        content: '';
        position: absolute;
        inset: -7px;
      }
      &:hover {
        background: var(--surface-2);
      }
      &:focus-visible {
        outline: 2px solid var(--focus);
        outline-offset: 2px;
      }
    }
    .dots {
      display: flex;
      gap: 5px;

      i {
        width: 6px;
        height: 6px;
        border-radius: 999px;
        background: var(--line-strong);
        transition: width var(--t-fast) var(--ease);

        &.on {
          width: 14px;
          background: var(--ink);
        }
      }
    }
    .all {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      min-height: 44px;
      flex-shrink: 0;
      white-space: nowrap;
      font-family: var(--font-mono);
      font-size: 13px;
      color: var(--ink-2);

      &:hover {
        color: var(--ink);
      }
    }
    .intents {
      display: flex;
      gap: 6px;
      margin: 0 -20px 14px;
      padding: 0 20px;
      overflow-x: auto;
      scrollbar-width: none;

      &::-webkit-scrollbar {
        display: none;
      }
      .chip {
        flex: none;
      }
    }
    .answers {
      display: grid;
    }
    // Each answer fills the shared cell: the shot and title sit at the same place on every chip and the offer box
    // stretches to the bottom, so only the words change, never the layout.
    .result {
      grid-area: 1 / 1;
      display: flex;
      flex-direction: column;
      gap: 10px;
      visibility: hidden;

      &.on {
        visibility: visible;
      }
    }
    .lead {
      display: grid;
      gap: 10px;
      color: inherit;
    }
    .shot {
      display: block;
      overflow: hidden;
      border-radius: var(--r-inner);
      border: 1px solid var(--line);
      background: var(--surface-2);
      aspect-ratio: 16 / 10;

      img {
        display: block;
        width: 100%;
        height: 100%;
        object-fit: cover;
        object-position: top;
        transition: transform 0.5s var(--ease);
      }
    }
    .lead:hover .shot img {
      transform: scale(1.015);
    }
    .row {
      display: flex;
      align-items: center;
      gap: 10px;
      min-height: 44px;
      color: inherit;
    }
    .offer {
      flex: 1;
      display: grid;
      align-content: start;
      gap: 8px;
      margin: 0;
      padding: 12px 14px;
      list-style: none;
      border-radius: var(--r-inner);
      background: var(--surface-2);

      li {
        display: flex;
        align-items: flex-start;
        min-width: 0;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        gap: 10px;
        font-size: 13.5px;
        line-height: 1.45;
        color: var(--ink-2);
      }
      ng-icon {
        flex-shrink: 0;
        margin-top: 2px;
        font-size: 16px;
        color: var(--ink);
      }
    }
    .t {
      flex: 1;
      min-width: 0;
      display: grid;
      line-height: 1.25;

      b {
        font-weight: 600;
        font-size: 14.5px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      small {
        font-size: 12.5px;
        color: var(--muted);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }
    .go {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      flex-shrink: 0;
      font-size: 13.5px;
      font-weight: 500;

      ng-icon {
        transition: transform var(--t-base) var(--ease);
      }
    }
    .lead:hover .go ng-icon {
      transform: translateX(3px);
    }
    @media (max-width: 480px) {
      .explorer {
        padding: 16px;
      }
      /* Phones: three choices wrap instead of hiding the last one off the edge. */
      .intents {
        flex-wrap: wrap;
        margin: 0 0 14px;
        padding: 0;
        overflow: visible;
      }
    }
    // The smallest phones: a touch tighter so every offer line still fits on one line.
    @media (max-width: 360px) {
      .offer {
        padding: 10px 10px;

        li {
          gap: 8px;
          font-size: 12.5px;
        }
      }
    }
    @media (prefers-reduced-motion: reduce) {
      .shot img,
      .go ng-icon,
      .dots i {
        transition: none;
      }
    }
  `,
})
export class WorkExplorer {
  protected readonly intents = INTENTS;
  protected readonly intentId = signal(INTENTS[0].id);
  protected readonly intent = computed(() => INTENTS.find((i) => i.id === this.intentId()) ?? INTENTS[0]);

  /** Rotation runs in the browser only, and never for reduced motion; a chip the visitor picks stops it for good. */
  protected readonly auto = signal(false);
  protected readonly paused = signal(false);
  protected readonly progress = signal(0);
  private hover = false;
  private focused = false;
  private onScreen = true;

  constructor() {
    const host = inject(ElementRef<HTMLElement>).nativeElement as HTMLElement;
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      this.auto.set(true);
      host.addEventListener('pointerenter', () => (this.hover = true));
      host.addEventListener('pointerleave', () => (this.hover = false));
      host.addEventListener('focusin', () => (this.focused = true));
      host.addEventListener('focusout', () => (this.focused = host.contains(document.activeElement)));
      const io = new IntersectionObserver(([e]) => (this.onScreen = e.isIntersecting));
      io.observe(host);

      let last = performance.now();
      let raf = 0;
      const tick = (now: number) => {
        const dt = now - last;
        last = now;
        if (!this.auto()) return;
        if (!this.paused() && !this.hover && !this.focused && this.onScreen && !document.hidden) {
          const p = this.progress() + dt / readingMs(this.intent());
          if (p >= 1) this.next();
          else this.progress.set(p);
        }
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
      destroyRef.onDestroy(() => {
        cancelAnimationFrame(raf);
        io.disconnect();
      });
    });
  }

  protected pick(id: string): void {
    this.auto.set(false);
    this.intentId.set(id);
  }

  /** Arrows: the visitor takes over, so the rotation stops like it does for a chip. */
  protected step(n: number): void {
    const k = INTENTS.findIndex((i) => i.id === this.intentId());
    this.pick(INTENTS[(k + n + INTENTS.length) % INTENTS.length].id);
  }

  protected togglePause(): void {
    this.paused.update((v) => !v);
  }

  private next(): void {
    const k = INTENTS.findIndex((i) => i.id === this.intentId());
    this.intentId.set(INTENTS[(k + 1) % INTENTS.length].id);
    this.progress.set(0);
  }

  /** The 16:10 card thumbnail when there is one (scripts/work-thumbs.mjs), else the original. */
  protected thumb(src: string): string {
    return CARD_THUMBS[src] ?? src;
  }
}
