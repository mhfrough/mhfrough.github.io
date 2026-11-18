import { ChangeDetectionStrategy, Component, DestroyRef, ElementRef, afterNextRender, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { phosphorArrowRight, phosphorPause, phosphorPlay } from '@ng-icons/phosphor-icons/regular';

interface Tool {
  id: string;
  name: string;
  /** One line from the tool's own README, short enough for one line down to 320 px. */
  sub: string;
  href: string;
  /** The tool's own mark (CLAUDE.md, Project icons). */
  mark: string;
  /** Its Open Graph card, 1200 x 630 (scripts/home-tools.mjs). */
  shot: string;
  shot640: string;
  alt: string;
}

const tool = (id: string, name: string, sub: string, alt: string): Tool => ({
  id,
  name,
  sub,
  href: `/work/${id}`,
  mark: `/images/${id}/${id}-mark.svg`,
  shot: `/images/home/tools/${id}.webp`,
  shot640: `/images/home/tools/${id}-640.webp`,
  alt,
});

/**
 * Hero component: my five Originals on one shelf (no server, nothing uploaded; each runs on your device). The dock picks one, the preview shows its own card
 * and links to its case study. Rotates on its own like the Quorum builder's examples, and stops for good once the
 * visitor picks a tool.
 */
const TOOLS: Tool[] = [
  tool('flick', 'Flick', 'Send files between nearby devices', 'Flick: "Flick it to the next screen." beside three nearby devices, one sending photo.jpg.'),
  tool('pinch', 'Pinch', 'Compress, convert and upscale images', 'Pinch: "Smaller images, made on your device." beside a before and after slider, 292 KB down to 151 KB.'),
  tool('scrawl', 'Scrawl', 'A sketchbook in your browser', 'Scrawl: felt-tip diagrams on dotted paper.'),
  tool('sizzle', 'Sizzle', 'Promo reels cut by your AI agent', 'Sizzle: "Your app, now showing." beside three steps: install, ask, render.'),
  tool('swoop', 'Swoop', 'Screenshots that stay on your computer', 'Swoop: "Screenshots that stay on your computer." beside its editor marking up an order page.'),
];

/** Long enough to read the line and look at the card, then move on. */
const DWELL_MS = 5500;

@Component({
  selector: 'mh-tool-shelf',
  imports: [NgIcon, RouterLink],
  viewProviders: [provideIcons({ phosphorArrowRight, phosphorPause, phosphorPlay })],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="stack">
      <div class="card card--lift shelf">
        <div class="head">
          <h2 id="ts-title">Originals, private by default</h2>
          <span class="head-r">
            @if (auto()) {
              <button type="button" class="pp" [attr.aria-label]="paused() ? 'Resume rotating products' : 'Pause rotating products'" (click)="togglePause()">
                <ng-icon [name]="paused() ? 'phosphorPlay' : 'phosphorPause'" aria-hidden="true" />
              </button>
            }
            <a class="all" routerLink="/work">View work <ng-icon name="phosphorArrowRight" aria-hidden="true" /></a>
          </span>
        </div>

        <!-- Every card sits in the same grid cell and only the active one shows, so nothing below ever moves. -->
        <p class="sr-only" aria-live="polite">{{ active().name }}</p>
        <a class="lead" [routerLink]="active().href">
          <span class="shot">
            @for (t of tools; track t.id; let first = $first) {
              <img
                [class.on]="t.id === active().id"
                [src]="t.shot640"
                [srcset]="t.shot640 + ' 640w, ' + t.shot + ' 1200w'"
                sizes="(max-width: 1040px) 92vw, 520px"
                width="1200"
                height="630"
                [alt]="t.id === active().id ? t.alt : ''"
                [attr.loading]="first ? null : 'lazy'"
                decoding="async"
              />
            }
          </span>
          <span class="row">
            <span class="t">
              <b>{{ active().name }}</b>
              <small>{{ active().sub }}</small>
            </span>
            <span class="go">Case study <ng-icon name="phosphorArrowRight" aria-hidden="true" /></span>
          </span>
        </a>

        <ul class="dock" role="list" aria-labelledby="ts-title">
          @for (t of tools; track t.id) {
            <li>
              <button type="button" class="tool" [attr.aria-pressed]="t.id === active().id" (click)="pick(t.id)">
                <span class="icon-tile icon-tile--fav" aria-hidden="true">
                  <img [src]="t.mark" width="26" height="26" alt="" decoding="async" />
                </span>
                <span class="name">{{ t.name }}</span>
                @if (auto() && t.id === active().id) {
                  <i class="bar" aria-hidden="true" [style.transform]="'scaleX(' + progress() + ')'"></i>
                }
              </button>
            </li>
          }
        </ul>
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
    .shelf {
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
    .lead {
      display: grid;
      gap: 10px;
      color: inherit;
    }
    .shot {
      display: grid;
      overflow: hidden;
      border-radius: var(--r-inner);
      border: 1px solid var(--line);
      background: var(--surface-2);
      aspect-ratio: 1200 / 630;

      img {
        grid-area: 1 / 1;
        display: block;
        width: 100%;
        height: 100%;
        object-fit: cover;
        opacity: 0;
        transition:
          opacity 0.4s var(--ease),
          transform 0.5s var(--ease);

        &.on {
          opacity: 1;
        }
      }
    }
    .lead:hover .shot img.on {
      transform: scale(1.015);
    }
    .row {
      display: flex;
      align-items: center;
      gap: 10px;
      min-height: 44px;
    }
    .t {
      flex: 1;
      min-width: 0;
      display: grid;
      line-height: 1.25;

      b {
        font-weight: 600;
        font-size: 14.5px;
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
    // The dock: five marks in one row, the picked one on a raised tile.
    .dock {
      display: grid;
      grid-template-columns: repeat(5, minmax(0, 1fr));
      gap: 4px;
      margin: 12px 0 0;
      padding: 6px;
      list-style: none;
      border-radius: var(--r-inner);
      background: var(--surface-2);
    }
    .tool {
      position: relative;
      width: 100%;
      display: grid;
      justify-items: center;
      gap: 6px;
      padding: 9px 4px 8px;
      border: 1px solid transparent;
      border-radius: 10px;
      background: transparent;
      color: var(--muted);
      font: inherit;
      cursor: pointer;
      overflow: hidden;
      transition:
        background var(--t-fast) var(--ease),
        color var(--t-fast) var(--ease);

      .icon-tile {
        width: 38px;
        height: 38px;
        padding: 6px;
        transition: transform var(--t-base) var(--ease);
      }
      &:hover {
        color: var(--ink);

        .icon-tile {
          transform: translateY(-2px);
        }
      }
      &[aria-pressed='true'] {
        background: var(--surface);
        border-color: var(--line);
        color: var(--ink);
      }
      &:focus-visible {
        outline: 2px solid var(--focus);
        outline-offset: 2px;
      }
    }
    .name {
      max-width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      font-size: 12px;
      font-weight: 500;
    }
    // Time left on the current tool, along the bottom of its dock tile.
    .bar {
      position: absolute;
      left: 10px;
      right: 10px;
      bottom: 0;
      height: 2px;
      border-radius: 2px;
      background: var(--ink);
      transform-origin: left;
    }
    @media (max-width: 480px) {
      .shelf {
        padding: 16px;
      }
      .dock {
        padding: 4px;
        gap: 2px;
      }
      .tool .icon-tile {
        width: 34px;
        height: 34px;
      }
    }
    @media (prefers-reduced-motion: reduce) {
      .shot img,
      .go ng-icon,
      .tool,
      .tool .icon-tile {
        transition: none;
      }
    }
  `,
})
export class ToolShelf {
  protected readonly tools = TOOLS;
  private readonly activeId = signal(TOOLS[0].id);
  protected readonly active = computed(() => TOOLS.find((t) => t.id === this.activeId()) ?? TOOLS[0]);

  /** Rotation runs in the browser only, and never for reduced motion; a tool the visitor picks stops it for good. */
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
          const p = this.progress() + dt / DWELL_MS;
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
    this.activeId.set(id);
  }

  protected togglePause(): void {
    this.paused.update((v) => !v);
  }

  private next(): void {
    const k = TOOLS.findIndex((t) => t.id === this.activeId());
    this.activeId.set(TOOLS[(k + 1) % TOOLS.length].id);
    this.progress.set(0);
  }
}
