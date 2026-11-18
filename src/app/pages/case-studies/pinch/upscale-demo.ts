import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { PinchSplit } from './split';

const LEFT = {
  input: { src: '/images/pinch/hills-crop-160.png', label: 'Input', meta: '160 × 160', alt: 'The 160 by 160 pixel crop of the hills photo, shown enlarged in hard pixels' },
  smooth: { src: '/images/pinch/hills-smooth-4x.webp', label: 'Smooth 4x', meta: 'Lanczos', alt: 'The crop made four times larger with Smooth resampling: soft, with no new detail' },
} as const;
type Left = keyof typeof LEFT;

/**
 * Smooth against AI (detail), on real output: a 160 x 160 crop of the hills sample, made 640 x 640 by Pinch's Smooth
 * resampler and by Real-ESRGAN running in the browser on the WebAssembly backend (9.6 s), both saved by Pinch
 * (from Pinch's promo/media, measured 2026-10-16). The left side can also show the input in hard pixels. Static
 * images in the shared compare; renders on the server.
 */
@Component({
  selector: 'mh-pn-upscale',
  imports: [PinchSplit],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="up card">
      <div class="seg" role="group" aria-label="Left side">
        @for (k of keys; track k) {
          <button type="button" [attr.aria-pressed]="left() === k" (click)="left.set(k)">{{ k === 'input' ? 'Input, hard pixels' : 'Smooth 4x' }}</button>
        }
      </div>
      <mh-pn-split
        [a]="l().src"
        [aAlt]="l().alt"
        [aLabel]="l().label"
        [aMeta]="l().meta"
        [aPx]="left() === 'input'"
        b="/images/pinch/hills-ai-4x.webp"
        bAlt="The same crop made four times larger by Real-ESRGAN: rock edges, leaves and grass drawn in"
        bLabel="AI 4x"
        bMeta="Real-ESRGAN"
        [w]="640"
        [h]="640"
        label="Compare the left picture with the AI upscale"
      />
      <p class="cap mono">hills.jpg, 160 × 160 crop to 640 × 640 · AI on WebAssembly in 9.6 s</p>
    </div>
  `,
  styles: `
    :host {
      display: block;
      min-width: 0;
    }
    .up {
      display: grid;
      gap: 12px;
      padding: 12px;
    }
    .seg {
      justify-self: start;
    }
    .seg button {
      height: 34px;
    }
    .cap {
      margin: 0;
      padding: 0 4px 2px;
      font-size: 11.5px;
      color: var(--muted);
    }
  `,
})
export class PinchUpscaleDemo {
  protected readonly keys = Object.keys(LEFT) as Left[];
  protected readonly left = signal<Left>('smooth');
  protected readonly l = computed(() => LEFT[this.left()]);
}
