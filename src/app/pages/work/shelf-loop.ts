import { DestroyRef, Directive, ElementRef, afterNextRender, inject, input } from '@angular/core';

/** Drift speed of the shelf, slow enough to read a tile as it passes. */
const SPEED = 32; // px per second
const STEP_MS = 520;

const mod = (n: number, m: number) => ((n % m) + m) % m;
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

/**
 * An endless shelf (owner, 2026-10-23): `<div mhShelfLoop [count]>` around one list whose items are the real set
 * followed by an inert copy. The track drifts left on its own and wraps by exactly one set's width, so the end runs
 * straight into the start with no jump. It pauses on hover, keyboard focus, a drag, off screen and in a hidden tab;
 * with reduced motion it never drifts, but the arrows (`step()`) and dragging still move it.
 * Transform only, written straight to the element each frame, so nothing re-renders while it runs.
 */
@Directive({ selector: '[mhShelfLoop]', exportAs: 'mhShelfLoop' })
export class ShelfLoop {
  /** How many items make one set (the real ones; the rest of the list is the copy). */
  readonly count = input.required<number>({ alias: 'mhShelfLoop' });

  private offset = 0;
  private tween: { from: number; to: number; start: number; dur: number } | null = null;
  private stepTo: ((dir: 1 | -1) => void) | null = null;

  constructor() {
    const host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    const destroyRef = inject(DestroyRef);

    afterNextRender(() => {
      const track = host.firstElementChild as HTMLElement | null;
      if (!track) return;
      const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
      let hover = false;
      let focused = false;
      let dragging = false;
      let onScreen = true;

      const items = () => track.children as HTMLCollectionOf<HTMLElement>;
      /** One set's width, gap included: where the copy's first item starts. 0 until the copy is rendered. */
      const setWidth = () => {
        const list = items();
        const n = this.count();
        return list.length > n ? list[n].offsetLeft - list[0].offsetLeft : 0;
      };
      const tileWidth = () => {
        const list = items();
        return list.length > 1 ? list[1].offsetLeft - list[0].offsetLeft : host.clientWidth * 0.8;
      };
      const animateTo = (to: number) => {
        if (reduced) {
          this.offset = to;
          this.tween = null;
        } else {
          this.tween = { from: this.offset, to, start: performance.now(), dur: STEP_MS };
        }
      };
      this.stepTo = (dir) => animateTo((this.tween?.to ?? this.offset) + dir * tileWidth());

      // Pause rules.
      host.addEventListener('pointerenter', (e) => (hover = e.pointerType === 'mouse'));
      host.addEventListener('pointerleave', () => (hover = false));
      host.addEventListener('focusin', (e) => {
        // Keyboard focus only: a mouse press also focuses the tile's link, and must neither stop the drift for good
        // nor shift the shelf under the pointer.
        const target = e.target as HTMLElement;
        focused = target.matches(':focus-visible');
        if (!focused) return;
        // Bring a tile reached with Tab fully into view.
        const tile = target.closest<HTMLElement>('li');
        if (!tile) return;
        const box = host.getBoundingClientRect();
        const r = tile.getBoundingClientRect();
        const pad = parseFloat(getComputedStyle(host).paddingLeft) || 0;
        if (r.left < box.left + pad) animateTo(this.offset - (box.left + pad - r.left));
        else if (r.right > box.right - pad) animateTo(this.offset + (r.right - (box.right - pad)));
      });
      host.addEventListener('focusout', (e) => {
        const next = e.relatedTarget as HTMLElement | null;
        focused = !!next && host.contains(next) && next.matches(':focus-visible');
      });
      // Focus can scroll an overflow: hidden box; the transform does the moving here, so undo it.
      host.addEventListener('scroll', () => (host.scrollLeft = 0));
      const io = new IntersectionObserver(([e]) => (onScreen = e.isIntersecting));
      io.observe(host);

      // Drag or swipe sideways; vertical swipes still scroll the page (touch-action: pan-y in CSS).
      let startX = 0;
      let startOffset = 0;
      let pointerId = -1;
      let moved = false;
      host.addEventListener('dragstart', (e) => e.preventDefault());
      host.addEventListener('pointerdown', (e) => {
        if (e.button !== 0) return;
        pointerId = e.pointerId;
        startX = e.clientX;
        startOffset = this.offset;
        moved = false;
      });
      host.addEventListener('pointermove', (e) => {
        if (e.pointerId !== pointerId) return;
        const dx = e.clientX - startX;
        if (!moved && Math.abs(dx) > 6) {
          moved = true;
          dragging = true;
          this.tween = null;
          host.setPointerCapture(e.pointerId);
        }
        if (moved) this.offset = startOffset - dx;
      });
      const release = (e: PointerEvent) => {
        if (e.pointerId !== pointerId) return;
        pointerId = -1;
        dragging = false;
      };
      host.addEventListener('pointerup', release);
      host.addEventListener('pointercancel', release);
      // A drag that ends over a tile must not open its case study.
      host.addEventListener(
        'click',
        (e) => {
          if (!moved) return;
          moved = false;
          e.preventDefault();
          e.stopPropagation();
        },
        { capture: true },
      );

      let last = performance.now();
      let raf = 0;
      const tick = (now: number) => {
        const dt = Math.min(now - last, 50);
        last = now;
        if (this.tween) {
          const t = Math.min((now - this.tween.start) / this.tween.dur, 1);
          this.offset = this.tween.from + (this.tween.to - this.tween.from) * easeOut(t);
          if (t === 1) this.tween = null;
        } else if (!reduced && !hover && !focused && !dragging && onScreen && !document.hidden) {
          this.offset += (SPEED * dt) / 1000;
        }
        const w = setWidth();
        let x = this.offset;
        if (w > 0) {
          x = mod(x, w);
        } else {
          // No copy yet: a plain clamped strip.
          x = Math.max(0, Math.min(x, track.scrollWidth - track.clientWidth));
          this.offset = x;
        }
        track.style.transform = `translate3d(${-x}px, 0, 0)`;
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);

      destroyRef.onDestroy(() => {
        cancelAnimationFrame(raf);
        io.disconnect();
      });
    });
  }

  /** Arrow buttons: one tile back or forward, eased; the drift carries on afterwards. */
  step(dir: 1 | -1): void {
    this.stepTo?.(dir);
  }
}
