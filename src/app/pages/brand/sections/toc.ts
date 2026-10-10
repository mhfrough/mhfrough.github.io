import { ChangeDetectionStrategy, Component, DestroyRef, ElementRef, afterNextRender, inject, signal } from '@angular/core';
import { COPY } from '../brand.copy';
import { SECTIONS } from '../brand.data';

/**
 * In-page table of contents. Desktop: a sticky card with numbered links. Under 1100px: a sticky, horizontally
 * scrolling segmented bar under the nav. The section in view gets aria-current="true" (IntersectionObserver).
 */
@Component({
  selector: 'mh-brand-toc',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nav class="toc" [attr.aria-label]="t.label">
      <p class="toc__label" aria-hidden="true">{{ t.label }}</p>
      <ol class="toc__list" role="list">
        @for (s of sections; track s.id; let i = $index) {
          <li>
            <a [href]="'#' + s.id" [attr.aria-current]="active() === s.id ? 'true' : null" (click)="go($event, s.id)">
              <span class="toc__n" aria-hidden="true">{{ (i + 1).toString().padStart(2, '0') }}</span>{{ s.label }}
            </a>
          </li>
        }
      </ol>
    </nav>
  `,
  styles: `
    :host {
      display: block;
      position: sticky;
      top: calc(var(--nav-top) + var(--nav-h) + 28px);
    }
    .toc {
      padding: 14px;
      border-radius: var(--r-card);
      background: var(--surface);
      border: 1px solid var(--line);
    }
    .toc__label {
      font-size: 13px;
      font-weight: 500;
      color: var(--muted);
      padding: 4px 10px 10px;
    }
    .toc__list {
      display: grid;
      gap: 2px;
    }
    a {
      display: flex;
      align-items: center;
      gap: 12px;
      min-height: 38px;
      padding: 0 12px;
      border-radius: 999px;
      font-size: 14.5px;
      color: var(--ink-2);
      white-space: nowrap;
      transition:
        background var(--t-base) var(--ease),
        color var(--t-base) var(--ease);
    }
    a:hover {
      color: var(--ink);
    }
    a[aria-current='true'] {
      background: var(--surface-2);
      color: var(--ink);
    }
    .toc__n {
      font-family: var(--font-mono);
      font-size: 11.5px;
      color: var(--muted);
      font-variant-numeric: tabular-nums;
    }
    a[aria-current='true'] .toc__n {
      color: var(--ink);
    }
    @media (max-width: 1099px) {
      :host {
        position: sticky;
        top: calc(var(--nav-top) * 2 + var(--nav-h) + 6px);
        z-index: 10;
      }
      .toc {
        padding: 4px;
        border-radius: 999px;
        background: color-mix(in oklab, var(--surface-2) 72%, transparent);
        -webkit-backdrop-filter: blur(18px) saturate(1.6);
        backdrop-filter: blur(18px) saturate(1.6);
        border-color: var(--glass-edge);
        box-shadow: 0 8px 24px -12px rgb(0 0 0 / 0.5);
      }
      .toc__label {
        display: none;
      }
      .toc__list {
        display: flex;
        gap: 4px;
        overflow-x: auto;
        scrollbar-width: none;
        scroll-snap-type: x proximity;
      }
      .toc__list::-webkit-scrollbar {
        display: none;
      }
      li {
        scroll-snap-align: start;
      }
      a {
        min-height: 36px;
        padding: 0 14px;
        font-size: 14px;
        font-weight: 500;
        color: var(--muted);
      }
      a[aria-current='true'] {
        background: var(--surface);
        box-shadow: 0 1px 2px rgb(0 0 0 / 0.3);
      }
      .toc__n {
        display: none;
      }
    }
    @media (max-width: 1099px) and (prefers-reduced-transparency: reduce) {
      .toc {
        background: var(--surface-2);
        backdrop-filter: none;
        -webkit-backdrop-filter: none;
      }
    }
  `,
})
export class BrandToc {
  protected readonly t = COPY.toc;
  protected readonly sections = SECTIONS;
  protected readonly active = signal<string>(SECTIONS[0].id);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  constructor() {
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      if (typeof IntersectionObserver === 'undefined') return;
      const seen = new Map<string, boolean>();
      const io = new IntersectionObserver(
        (entries) => {
          for (const e of entries) seen.set(e.target.id, e.isIntersecting);
          const first = SECTIONS.find((s) => seen.get(s.id));
          if (first && first.id !== this.active()) {
            this.active.set(first.id);
            this.scrollChipIntoView(first.id);
          }
        },
        { rootMargin: '-30% 0px -60% 0px' },
      );
      for (const s of SECTIONS) {
        const el = document.getElementById(s.id);
        if (el) io.observe(el);
      }
      destroyRef.onDestroy(() => io.disconnect());
    });
  }

  /** Keeps the active chip visible in the mobile scroller without moving the page. */
  private scrollChipIntoView(id: string): void {
    const list = this.host.nativeElement.querySelector<HTMLElement>('.toc__list');
    const link = list?.querySelector<HTMLElement>(`a[href="#${id}"]`);
    if (!list || !link || list.scrollWidth <= list.clientWidth) return;
    const left = link.offsetLeft - (list.clientWidth - link.offsetWidth) / 2;
    list.scrollTo({ left, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  }

  protected go(e: MouseEvent, id: string): void {
    const target = document.getElementById(id);
    if (!target) return;
    e.preventDefault();
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    history.replaceState(null, '', '#' + id);
    this.active.set(id);
    const heading = target.querySelector<HTMLElement>('h2');
    if (heading) {
      heading.setAttribute('tabindex', '-1');
      heading.focus({ preventScroll: true });
    }
  }
}
