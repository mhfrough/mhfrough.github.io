import { Directive, ElementRef, afterNextRender, inject, input, DestroyRef } from '@angular/core';

/**
 * Scroll reveal: `<div mhReveal>` or `<li mhReveal [revealIndex]="i">` for a stagger.
 * - Only elements that start below the fold get hidden, so prerendered HTML never flashes.
 * - IntersectionObserver, one shot, no scroll listeners.
 * - Reduced motion: the CSS gate in _motion.scss makes .reveal a no-op.
 */
@Directive({ selector: '[mhReveal]' })
export class Reveal {
  readonly revealIndex = input(0);
  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef);

  constructor() {
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      const node = this.el.nativeElement;
      if (typeof IntersectionObserver === 'undefined') return;
      const rect = node.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.92) return; // already visible: leave it alone

      node.style.setProperty('--i', String(this.revealIndex()));
      node.classList.add('reveal');
      const io = new IntersectionObserver(
        (entries) => {
          for (const e of entries) {
            if (e.isIntersecting) {
              node.classList.add('in');
              io.disconnect();
            }
          }
        },
        { rootMargin: '0px 0px -8% 0px', threshold: 0.05 },
      );
      io.observe(node);
      destroyRef.onDestroy(() => io.disconnect());
    });
  }
}
