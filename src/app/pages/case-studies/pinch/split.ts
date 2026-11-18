import { ChangeDetectionStrategy, Component, ElementRef, computed, inject, input, signal, viewChild } from '@angular/core';

/**
 * A before and after compare, the way Pinch's stage works: the original on the left, the result on the right, one
 * blue divider between them. Drag anywhere on the picture, or focus the divider and use the arrow keys (Shift for
 * bigger steps, Home and End for the edges). Both pictures share one zoom around the centre, so detail can be checked
 * at 2x or 4x in hard pixels. The divider moves only under the pointer or keys; nothing animates on its own.
 * Server-rendered with the divider in the middle.
 */
@Component({
  selector: 'mh-pn-split',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[style.--ratio]': 'ratio()' },
  template: `
    <div
      #frame
      class="frame"
      [class.dragging]="dragging()"
      (pointerdown)="down($event)"
      (pointermove)="move($event)"
      (pointerup)="up()"
      (pointercancel)="up()"
    >
      <div class="layer">
        <img [src]="a()" [alt]="aAlt()" [style.transform]="zoomT()" [class.px]="(zoom() > 1 && pixels()) || aPx()" draggable="false" decoding="async" [attr.width]="w()" [attr.height]="h()" />
      </div>
      <div class="layer top" [style.clip-path]="'inset(0 0 0 ' + pos() + '%)'">
        @if (b(); as src) {
          <img [src]="src" [alt]="bAlt()" [style.transform]="zoomT()" [class.px]="zoom() > 1 && pixels()" draggable="false" decoding="async" [attr.width]="w()" [attr.height]="h()" />
        }
      </div>
      <div
        class="divider"
        [style.left.%]="pos()"
        role="slider"
        tabindex="0"
        [attr.aria-label]="label()"
        aria-valuemin="0"
        aria-valuemax="100"
        [attr.aria-valuenow]="round(pos())"
        [attr.aria-valuetext]="valueText()"
        (keydown)="key($event)"
      >
        <span class="knob" aria-hidden="true">
          <svg viewBox="0 0 20 20"><path d="M8 6.5 4.5 10 8 13.5M12 6.5l3.5 3.5-3.5 3.5" /></svg>
        </span>
      </div>
      <span class="tag-a" aria-hidden="true"><b>{{ aLabel() }}</b>@if (aMeta()) {<span class="mono">{{ aMeta() }}</span>}</span>
      <span class="tag-b" aria-hidden="true" [class.busy]="busy()">
        <b>{{ bLabel() }}</b>
        @if (bMeta()) {<span class="mono">{{ bMeta() }}</span>}
        @if (bPct()) {<i class="mono" [attr.data-tone]="bTone()">{{ bPct() }}</i>}
      </span>
    </div>
  `,
  styles: `
    :host {
      display: block;
      min-width: 0;
    }
    .frame {
      position: relative;
      aspect-ratio: var(--ratio, 1.5);
      overflow: hidden;
      border-radius: var(--r-inner);
      background: repeating-conic-gradient(var(--pn-check-a, var(--surface)) 0 25%, var(--pn-check-b, var(--surface-2)) 0 50%) 0 0 / 16px 16px;
      touch-action: pan-y;
      cursor: ew-resize;
      user-select: none;
      -webkit-user-select: none;
    }
    .frame.dragging {
      cursor: grabbing;
    }
    .layer {
      position: absolute;
      inset: 0;
      overflow: hidden;
    }
    img {
      display: block;
      width: 100%;
      height: 100%;
      object-fit: cover;
      transform-origin: 50% 50%;
      pointer-events: none;
    }
    img.px {
      image-rendering: pixelated;
    }
    .divider {
      position: absolute;
      top: 0;
      bottom: 0;
      width: 44px;
      margin-left: -22px;
      display: grid;
      place-items: center;
      cursor: ew-resize;
      outline: none;

      &::before {
        content: '';
        position: absolute;
        top: 0;
        bottom: 0;
        left: 50%;
        width: 2px;
        margin-left: -1px;
        background: var(--pn-blue, var(--ink));
      }
      &:focus-visible .knob {
        box-shadow:
          0 0 0 3px var(--bg),
          0 0 0 5px var(--focus);
      }
    }
    .knob {
      position: relative;
      width: 36px;
      height: 36px;
      border-radius: 999px;
      display: grid;
      place-items: center;
      background: var(--pn-blue-strong, var(--cta));
      color: #fff;
      box-shadow: 0 4px 14px rgb(0 0 0 / 0.4);

      svg {
        width: 18px;
        height: 18px;
        fill: none;
        stroke: currentColor;
        stroke-width: 1.6;
        stroke-linecap: round;
        stroke-linejoin: round;
      }
    }
    .tag-a,
    .tag-b {
      position: absolute;
      top: 10px;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      max-width: calc(50% - 26px);
      padding: 4px 10px;
      border-radius: 999px;
      background: rgb(12 13 15 / 0.82);
      color: #f3f3f2;
      font-size: 12px;
      white-space: nowrap;
      overflow: hidden;
      pointer-events: none;

      b {
        font-weight: 600;
      }
      span {
        color: #a9abb1;
      }
    }
    .tag-a {
      left: 10px;
    }
    .tag-b {
      right: 10px;
    }
    .tag-b.busy {
      opacity: 0.7;
    }
    .tag-b i {
      font-style: normal;
      padding: 1px 6px;
      border-radius: 999px;
      color: var(--pn-good, var(--ink));
      background: var(--pn-good-soft, transparent);

      &[data-tone='warn'] {
        color: var(--pn-warn, var(--ink));
        background: var(--pn-warn-soft, transparent);
      }
    }
    @media (max-width: 480px) {
      .tag-a span,
      .tag-b span {
        display: none;
      }
    }
  `,
})
export class PinchSplit {
  readonly a = input.required<string>();
  readonly b = input<string | null>(null);
  readonly aAlt = input('');
  readonly bAlt = input('');
  readonly aLabel = input('Original');
  readonly bLabel = input('Result');
  readonly aMeta = input('');
  readonly bMeta = input('');
  readonly bPct = input('');
  readonly bTone = input<'good' | 'warn' | ''>('good');
  readonly busy = input(false);
  readonly zoom = input(1);
  readonly pixels = input(true);
  /** Draw the left picture in hard pixels at any zoom (a small input shown large). */
  readonly aPx = input(false);
  readonly w = input(1200);
  readonly h = input(800);
  readonly label = input('Compare divider');

  protected readonly ratio = computed(() => this.w() / this.h());
  protected readonly zoomT = computed(() => (this.zoom() > 1 ? `scale(${this.zoom()})` : null));
  protected readonly pos = signal(50);
  protected readonly dragging = signal(false);
  protected readonly valueText = computed(() => `${this.aLabel()} on the left ${Math.round(this.pos())}%, ${this.bLabel()} on the right`);
  protected readonly round = Math.round;

  private readonly frame = viewChild.required<ElementRef<HTMLElement>>('frame');
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  protected down(e: PointerEvent): void {
    if (e.button !== 0) return;
    this.dragging.set(true);
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
    this.at(e.clientX);
    this.host.nativeElement.querySelector<HTMLElement>('.divider')?.focus({ preventScroll: true });
  }

  protected move(e: PointerEvent): void {
    if (this.dragging()) this.at(e.clientX);
  }

  protected up(): void {
    this.dragging.set(false);
  }

  protected key(e: KeyboardEvent): void {
    const step = e.shiftKey ? 10 : 2;
    const next =
      e.key === 'ArrowLeft' || e.key === 'ArrowDown'
        ? this.pos() - step
        : e.key === 'ArrowRight' || e.key === 'ArrowUp'
          ? this.pos() + step
          : e.key === 'Home'
            ? 0
            : e.key === 'End'
              ? 100
              : null;
    if (next === null) return;
    e.preventDefault();
    this.pos.set(Math.min(100, Math.max(0, next)));
  }

  private at(x: number): void {
    const r = this.frame().nativeElement.getBoundingClientRect();
    if (!r.width) return;
    this.pos.set(Math.min(100, Math.max(0, ((x - r.left) / r.width) * 100)));
  }
}
