import { ChangeDetectionStrategy, Component, DestroyRef, ElementRef, afterNextRender, inject, input } from '@angular/core';

/**
 * Geometric background art: a Truchet field built from the quarter arc of the ء mark.
 * Every cell holds two quarter arcs on opposite corners, so neighbouring cells join into continuous curves.
 * Every few seconds a ripple runs out from a random cell and turns the tiles it passes by 90 degrees,
 * which re-routes the curves. Tiles near the pointer brighten.
 *
 * Canvas only, created after first render (SSR safe). Pauses off-screen and in hidden tabs.
 * Reduced motion: one still frame, no ripples, no pointer light.
 * Place inside a positioned, isolated section (`.glow` already is); it fills it and sits behind the content.
 */
interface Tile {
  x: number;
  y: number;
  a: number; // current angle
  to: number; // target angle
  at: number; // time the next turn starts, 0 when none is queued
}

@Component({
  selector: 'mh-pattern',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 'aria-hidden': 'true' },
  template: `<canvas #c></canvas>`,
  styles: `
    :host {
      position: absolute;
      inset: 0;
      z-index: -1;
      pointer-events: none;
      overflow: hidden;
      -webkit-mask-image: radial-gradient(ellipse 75% 85% at 72% 35%, #000 20%, transparent 78%);
      mask-image: radial-gradient(ellipse 75% 85% at 72% 35%, #000 20%, transparent 78%);
    }
    @media (max-width: 640px) {
      :host {
        -webkit-mask-image: radial-gradient(ellipse 90% 45% at 100% 0%, #000 10%, transparent 80%);
        mask-image: radial-gradient(ellipse 90% 45% at 100% 0%, #000 10%, transparent 80%);
      }
    }
    /* The curves fade out just before every edge, so where they meet a card's border they do not stack into bright dots. */
    canvas {
      display: block;
      width: 100%;
      height: 100%;
      -webkit-mask-image:
        linear-gradient(transparent, #000 12px, #000 calc(100% - 12px), transparent),
        linear-gradient(to right, transparent, #000 12px, #000 calc(100% - 12px), transparent);
      -webkit-mask-composite: source-in;
      mask-image:
        linear-gradient(transparent, #000 12px, #000 calc(100% - 12px), transparent),
        linear-gradient(to right, transparent, #000 12px, #000 calc(100% - 12px), transparent);
      mask-composite: intersect;
      opacity: 0;
      transition: opacity 1.4s var(--ease);
    }
    canvas.on {
      opacity: 1;
    }
  `,
})
export class Pattern {
  /** Tile size in CSS pixels. */
  readonly cell = input(46);
  /** Multiplies every stroke alpha. Keep it low behind text. */
  readonly intensity = input(1);

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  constructor() {
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      const host = this.host.nativeElement;
      const canvas = host.querySelector('canvas')!;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
      const ink = getComputedStyle(host).getPropertyValue('--ink').trim() || '#ededed';
      const k = this.intensity();
      const QUARTER = Math.PI / 2;

      let w = 0;
      let h = 0;
      let size = this.cell();
      let cols = 0;
      let sx = 1; // tile stretch per axis, close to 1
      let sy = 1;
      let tiles: Tile[] = [];
      let px = -9999;
      let py = -9999;
      let pointerMoved = false;
      let raf = 0;
      let visible = false;
      let nextRipple = 0;
      let timer: ReturnType<typeof setTimeout> | 0 = 0;

      const build = () => {
        const r = host.getBoundingClientRect();
        w = Math.max(1, Math.round(r.width));
        h = Math.max(1, Math.round(r.height));
        size = w < 640 ? Math.round(this.cell() * 0.8) : this.cell();
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = Math.round(w * dpr);
        canvas.height = Math.round(h * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        // Whole tiles only: each axis stretches its tiles a little so the grid ends exactly on every edge.
        // A cut through the middle of a row leaves the flat tops of its arcs along the edge, which reads as a dashed line.
        cols = Math.max(1, Math.round(w / size));
        const rows = Math.max(1, Math.round(h / size));
        sx = w / cols / size;
        sy = h / rows / size;
        tiles = [];
        for (let j = 0; j < rows; j++) {
          for (let i = 0; i < cols; i++) {
            const a = Math.random() < 0.5 ? 0 : QUARTER;
            tiles.push({ x: (i + 0.5) * size * sx, y: (j + 0.5) * size * sy, a, to: a, at: 0 });
          }
        }
      };

      const ripple = (now: number) => {
        const o = tiles[(Math.random() * tiles.length) | 0];
        const reach = size * 7;
        for (const t of tiles) {
          const d = Math.hypot(t.x - o.x, t.y - o.y);
          // Not every tile in reach turns: the gaps keep the field from flipping as one block.
          if (d < reach && Math.random() < 0.72) t.at = now + d * 1.6;
        }
      };

      const draw = (now: number): boolean => {
        ctx.clearRect(0, 0, w, h);
        ctx.strokeStyle = ink;
        ctx.lineWidth = 1;
        ctx.lineCap = 'round';
        const half = size / 2;
        const light = size * 5;
        let moving = false;
        for (const t of tiles) {
          if (t.at && now >= t.at) {
            t.to += QUARTER;
            t.at = 0;
          }
          const gap = t.to - t.a;
          if (gap > 0.001) {
            t.a += gap * 0.09;
            moving = true;
          } else {
            t.a = t.to;
          }
          if (t.at) moving = true;
          const d = Math.hypot(t.x - px, t.y - py);
          const near = d < light ? 1 - d / light : 0;
          const turning = Math.min(1, gap / QUARTER);
          ctx.globalAlpha = Math.min(0.6, (0.085 + near * near * 0.3 + turning * 0.32) * k);
          ctx.save();
          ctx.translate(t.x, t.y);
          ctx.scale(sx, sy);
          ctx.rotate(t.a);
          ctx.beginPath();
          ctx.arc(-half, -half, half, 0, QUARTER);
          ctx.moveTo(0, half);
          ctx.arc(half, half, half, Math.PI, Math.PI + QUARTER);
          ctx.stroke();
          ctx.restore();
        }
        ctx.globalAlpha = 1;
        return moving;
      };

      const frame = (now: number) => {
        raf = 0;
        if (!visible || document.hidden) return;
        if (!nextRipple || now >= nextRipple) {
          if (nextRipple) ripple(now);
          nextRipple = now + 2600 + Math.random() * 1800;
        }
        const moving = draw(now);
        pointerMoved = false;
        // Keep ticking while tiles turn or a ripple is pending; otherwise wake on the next ripple or pointer move.
        if (moving) raf = requestAnimationFrame(frame);
        else {
          const wait = Math.max(0, nextRipple - now);
          timer = setTimeout(() => {
            timer = 0;
            schedule();
          }, wait);
        }
      };

      const schedule = () => {
        if (raf || reduce) return;
        if (timer) {
          clearTimeout(timer);
          timer = 0;
        }
        raf = requestAnimationFrame(frame);
      };

      build();
      draw(performance.now());
      canvas.classList.add('on');

      const ro = new ResizeObserver(() => {
        build();
        draw(performance.now());
      });
      ro.observe(host);
      destroyRef.onDestroy(() => ro.disconnect());

      if (reduce) return;

      const onMove = (e: PointerEvent) => {
        const r = canvas.getBoundingClientRect();
        px = e.clientX - r.left;
        py = e.clientY - r.top;
        if (!pointerMoved && visible) {
          pointerMoved = true;
          schedule();
        }
      };
      window.addEventListener('pointermove', onMove, { passive: true });

      const io = new IntersectionObserver(([e]) => {
        visible = e.isIntersecting;
        if (visible) schedule();
      });
      io.observe(host);

      const onVis = () => {
        if (!document.hidden) schedule();
      };
      document.addEventListener('visibilitychange', onVis);

      destroyRef.onDestroy(() => {
        io.disconnect();
        window.removeEventListener('pointermove', onMove);
        document.removeEventListener('visibilitychange', onVis);
        cancelAnimationFrame(raf);
        if (timer) clearTimeout(timer);
      });
    });
  }
}
