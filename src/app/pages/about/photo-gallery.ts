import { ChangeDetectionStrategy, Component, ElementRef, computed, input, signal, viewChild } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { phosphorArrowLeft, phosphorArrowRight, phosphorX } from '@ng-icons/phosphor-icons/regular';
import { ABOUT_COPY } from './about.copy';
import type { AboutPhoto } from './about.photos';

/**
 * Masonry gallery (CSS columns) with a native <dialog> lightbox: Esc closes, arrow keys step through,
 * focus returns to the photo that opened it. Thumbs are lazy WebP with real dimensions (no layout shift).
 */
@Component({
  selector: 'mh-photo-gallery',
  imports: [NgIcon],
  viewProviders: [provideIcons({ phosphorArrowLeft, phosphorArrowRight, phosphorX })],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ul class="grid" role="list">
      @for (p of photos(); track p.id; let i = $index) {
        <li>
          <figure>
            <button type="button" class="shot" (click)="open(i, $event)" [attr.aria-label]="t.open + ': ' + p.caption">
              <img [src]="p.thumb" [width]="p.tw" [height]="p.th" [alt]="p.alt" loading="lazy" decoding="async" />
            </button>
            <figcaption>{{ p.caption }}</figcaption>
          </figure>
        </li>
      }
    </ul>

    <dialog #dlg class="box" [attr.aria-label]="current()?.caption ?? ''" (close)="onClose()" (click)="backdrop($event)" (keydown)="key($event)">
      @if (current(); as p) {
        <figure class="box-fig">
          <img [src]="p.src" [width]="p.w" [height]="p.h" [alt]="p.alt" decoding="async" />
          <figcaption>
            <span>{{ p.caption }}</span>
            <span class="mono count">{{ index() + 1 }} {{ t.of }} {{ photos().length }}</span>
          </figcaption>
        </figure>
        <div class="box-bar">
          @if (photos().length > 1) {
            <button type="button" class="icon-btn" (click)="step(-1)" [attr.aria-label]="t.prev"><ng-icon name="phosphorArrowLeft" aria-hidden="true" /></button>
            <button type="button" class="icon-btn" (click)="step(1)" [attr.aria-label]="t.next"><ng-icon name="phosphorArrowRight" aria-hidden="true" /></button>
          }
          <button type="button" class="icon-btn" (click)="dlg.close()" [attr.aria-label]="t.close"><ng-icon name="phosphorX" aria-hidden="true" /></button>
        </div>
      }
    </dialog>
  `,
  styles: `
    :host {
      display: block;
    }
    .grid {
      columns: 3 260px;
      column-gap: 10px;
      margin: 0;
      padding: 0;
      list-style: none;
    }
    .grid li {
      break-inside: avoid;
      margin-bottom: 10px;
    }
    figure {
      margin: 0;
    }
    .shot {
      display: block;
      inline-size: 100%;
      padding: 0;
      border: 1px solid var(--line);
      border-radius: var(--r-card);
      overflow: hidden;
      background: var(--surface-2);
      cursor: zoom-in;
      transition: border-color var(--t-base) var(--ease);
    }
    .shot img {
      display: block;
      inline-size: 100%;
      block-size: auto;
      filter: grayscale(1) contrast(1.04);
      transition:
        filter 0.5s var(--ease),
        transform 0.6s var(--ease);
    }
    .shot:hover,
    .shot:focus-visible {
      border-color: var(--line-strong);
    }
    .shot:hover img,
    .shot:focus-visible img {
      filter: none;
    }
    @media (prefers-reduced-motion: no-preference) {
      .shot:hover img {
        transform: scale(1.02);
      }
    }
    figcaption {
      padding: 8px 4px 0;
      font-size: 13px;
      color: var(--muted);
    }

    .box {
      inline-size: min(1100px, calc(100vw - 32px));
      max-block-size: calc(100dvh - 32px);
      padding: 0;
      border: 1px solid var(--line);
      border-radius: var(--r-card);
      background: var(--surface);
      color: var(--ink);
      box-shadow: var(--shadow-lg);
      overflow: hidden;
    }
    .box::backdrop {
      background: rgb(0 0 0 / 0.78);
      -webkit-backdrop-filter: blur(6px);
      backdrop-filter: blur(6px);
    }
    .box[open] {
      display: grid;
      grid-template-rows: minmax(0, 1fr) auto;
    }
    @media (prefers-reduced-motion: no-preference) {
      .box[open] {
        animation: pop 0.24s var(--ease);
      }
    }
    @keyframes pop {
      from {
        opacity: 0;
        transform: scale(0.98);
      }
    }
    .box-fig {
      display: grid;
      grid-template-rows: minmax(0, 1fr) auto;
      min-block-size: 0;
    }
    .box-fig img {
      inline-size: 100%;
      block-size: 100%;
      max-block-size: calc(100dvh - 140px);
      object-fit: contain;
      background: var(--bg);
    }
    .box-fig figcaption {
      display: flex;
      justify-content: space-between;
      gap: 16px;
      padding: 12px 16px 0;
      font-size: 14px;
      color: var(--ink-2);
    }
    .count {
      font-size: 12px;
      color: var(--muted);
      white-space: nowrap;
    }
    .box-bar {
      display: flex;
      justify-content: flex-end;
      gap: 6px;
      padding: 10px 12px 12px;
    }
  `,
})
export class PhotoGallery {
  readonly photos = input.required<readonly AboutPhoto[]>();
  protected readonly t = ABOUT_COPY.gallery;
  protected readonly index = signal(-1);
  protected readonly current = computed<AboutPhoto | null>(() => this.photos()[this.index()] ?? null);
  private readonly dlg = viewChild.required<ElementRef<HTMLDialogElement>>('dlg');
  private opener: HTMLElement | null = null;

  protected open(i: number, e: Event): void {
    this.opener = e.currentTarget as HTMLElement;
    this.index.set(i);
    this.dlg().nativeElement.showModal();
  }

  protected step(d: number): void {
    const n = this.photos().length;
    this.index.update((i) => (i + d + n) % n);
  }

  protected key(e: KeyboardEvent): void {
    if (e.key === 'ArrowLeft') this.step(-1);
    else if (e.key === 'ArrowRight') this.step(1);
  }

  /** A click on the dialog element itself (not its content) is a click on the backdrop. */
  protected backdrop(e: MouseEvent): void {
    if (e.target === this.dlg().nativeElement) this.dlg().nativeElement.close();
  }

  protected onClose(): void {
    this.index.set(-1);
    this.opener?.focus();
    this.opener = null;
  }
}
