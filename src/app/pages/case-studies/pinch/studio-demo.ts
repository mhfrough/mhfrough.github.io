import { ChangeDetectionStrategy, Component, DestroyRef, afterNextRender, computed, inject, signal } from '@angular/core';
import { SAMPLES, type Sample, bytes, pct } from './pinch.samples';
import { PinchSplit } from './split';

type Fmt = 'image/jpeg' | 'image/webp';
const FMT_LABEL: Record<Fmt, string> = { 'image/jpeg': 'JPG', 'image/webp': 'WebP' };
const ZOOMS = [
  { v: 1, label: 'Fit' },
  { v: 2, label: '2x' },
  { v: 4, label: '4x' },
];

/**
 * A small working copy of Pinch's first screen, written for this page: pick one of Pinch's sample photos, a format and
 * a quality, and the right half of the compare is re-encoded in your browser on every change, with the new size and
 * the change in percent, like Pinch's result card. When the output would be larger than the original it says so,
 * because that is the moment Pinch keeps the original. The encoder here is the browser's own (canvas toBlob), not the
 * MozJPEG and libwebp builds Pinch ships, so the numbers differ from the app; the page says so. Nothing is uploaded:
 * the photo comes from this site and the result is an object URL in this tab. Work starts after the first render and
 * only in the browser; object URLs are revoked on every change and on destroy.
 */
@Component({
  selector: 'mh-pn-studio',
  imports: [PinchSplit],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="studio card card--lift">
      <mh-pn-split
        [a]="sample().small"
        [b]="outUrl()"
        [aMeta]="bytesOf(sample().smallBytes)"
        [bLabel]="fmtLabel()"
        [bMeta]="outBytes() ? bytesOf(outBytes()!) : 'encoding'"
        [bPct]="outBytes() ? pctOf(outBytes()!) : ''"
        [bTone]="larger() ? 'warn' : 'good'"
        [busy]="busy()"
        [zoom]="zoom()"
        [aAlt]="'Sample photo, ' + sample().name.toLowerCase() + ', original JPG'"
        [bAlt]="'The same photo re-encoded as ' + fmtLabel() + ' at quality ' + quality()"
        label="Compare the original and the result"
      />

      <div class="res" [attr.data-state]="larger() ? 'warn' : 'ok'">
        <div class="res-l1">
          <span>{{ fmtLabel() }} · quality {{ quality() }}</span>
          <span class="mono">1200 × 800</span>
        </div>
        <div class="res-l2">
          <span class="size">{{ outBytes() ? bytesOf(outBytes()!) : '...' }}</span>
          @if (outBytes()) {
            <span class="pct mono" [attr.data-tone]="larger() ? 'warn' : 'good'">{{ pctOf(outBytes()!) }}</span>
          }
          <span class="from mono">from {{ bytesOf(sample().smallBytes) }}{{ ms() !== null ? ' · ' + ms() + ' ms' : '' }}</span>
        </div>
        @if (larger()) {
          <p class="warn">Larger than the original. Pinch says so and keeps your original.</p>
        }
      </div>

      <div class="ctrls">
        <div class="row" role="group" aria-label="Sample photo">
          @for (s of samples; track s.id) {
            <button type="button" class="chip" [attr.aria-pressed]="sample().id === s.id" (click)="pick(s)">{{ s.name }}</button>
          }
        </div>
        <div class="row">
          <div class="seg" role="group" aria-label="Save as">
            @for (f of fmts(); track f) {
              <button type="button" [attr.aria-pressed]="fmt() === f" (click)="setFmt(f)">{{ label[f] }}</button>
            }
          </div>
          <div class="seg" role="group" aria-label="Zoom">
            @for (z of zooms; track z.v) {
              <button type="button" [attr.aria-pressed]="zoom() === z.v" (click)="zoom.set(z.v)">{{ z.label }}</button>
            }
          </div>
        </div>
        <div class="q">
          <label for="pn-q">Quality</label>
          <input id="pn-q" type="range" min="5" max="100" step="1" [value]="quality()" (input)="setQuality($event)" />
          <output for="pn-q" class="mono">{{ quality() }}</output>
        </div>
      </div>
      <p class="sr-only" aria-live="polite">{{ announce() }}</p>
    </div>
  `,
  styles: `
    :host {
      display: block;
      min-width: 0;
    }
    p {
      margin: 0;
    }
    .studio {
      display: grid;
      gap: 14px;
      padding: 12px;
    }
    .res {
      display: grid;
      gap: 2px;
      padding: 4px 6px 0;
    }
    .res-l1 {
      display: flex;
      justify-content: space-between;
      gap: 10px;
      font-size: 13px;
      color: var(--muted);
    }
    .res-l2 {
      display: flex;
      align-items: baseline;
      flex-wrap: wrap;
      gap: 6px 10px;
    }
    .size {
      font-size: 2rem;
      font-weight: 600;
      letter-spacing: -0.035em;
      font-variant-numeric: tabular-nums;
      color: var(--ink);
      line-height: 1.15;
    }
    .pct {
      padding: 2px 8px;
      border-radius: 999px;
      font-size: 12.5px;
      color: var(--pn-good, var(--ink));
      background: var(--pn-good-soft, var(--surface-2));

      &[data-tone='warn'] {
        color: var(--pn-warn, var(--ink));
        background: var(--pn-warn-soft, var(--surface-2));
      }
    }
    .from {
      font-size: 12.5px;
      color: var(--muted);
    }
    .warn {
      margin-top: 6px;
      padding: 8px 12px;
      border-radius: var(--r-inner);
      background: var(--pn-warn-soft, var(--surface-2));
      color: var(--pn-warn, var(--ink));
      font-size: 13px;
    }
    .ctrls {
      display: grid;
      gap: 10px;
      padding: 0 6px 6px;
    }
    .row {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      justify-content: space-between;
    }
    .row:first-child {
      justify-content: flex-start;
      gap: 6px;
    }
    .chip {
      height: 36px;
      cursor: pointer;
    }
    .seg button {
      height: 32px;
    }
    .q {
      display: grid;
      grid-template-columns: auto minmax(0, 1fr) 3ch;
      align-items: center;
      gap: 12px;
      min-height: 44px;

      label {
        font-size: 13px;
        font-weight: 500;
        color: var(--ink-2);
      }
      output {
        font-size: 13px;
        text-align: right;
        color: var(--ink);
      }
    }
    input[type='range'] {
      width: 100%;
      height: 44px;
      margin: 0;
      background: transparent;
      accent-color: var(--pn-blue-strong, var(--ink));
      cursor: pointer;
    }
  `,
})
export class PinchStudioDemo {
  protected readonly samples = SAMPLES;
  protected readonly label = FMT_LABEL;
  protected readonly zooms = ZOOMS;
  protected readonly bytesOf = bytes;

  protected readonly sample = signal<Sample>(SAMPLES[0]);
  protected readonly fmt = signal<Fmt>('image/jpeg');
  protected readonly fmts = signal<Fmt[]>(['image/jpeg']);
  protected readonly quality = signal(75);
  protected readonly zoom = signal(1);
  protected readonly outUrl = signal<string | null>(null);
  protected readonly outBytes = signal<number | null>(null);
  protected readonly ms = signal<number | null>(null);
  protected readonly busy = signal(true);
  protected readonly announce = signal('');

  protected readonly fmtLabel = computed(() => FMT_LABEL[this.fmt()]);
  protected readonly larger = computed(() => (this.outBytes() ?? 0) > this.sample().smallBytes);

  private canvas: HTMLCanvasElement | null = null;
  private loaded = '';
  private run = 0;
  private timer: ReturnType<typeof setTimeout> | null = null;
  private browser = false;

  constructor() {
    const destroy = inject(DestroyRef);
    destroy.onDestroy(() => {
      this.run++;
      if (this.timer) clearTimeout(this.timer);
      const u = this.outUrl();
      if (u) URL.revokeObjectURL(u);
    });
    afterNextRender(() => {
      this.browser = true;
      const c = document.createElement('canvas');
      c.width = c.height = 1;
      // WebP encoding is in Chrome, Edge and Firefox; Safari's canvas cannot write WebP, so the option is left out.
      if (c.toDataURL('image/webp').startsWith('data:image/webp')) {
        this.fmts.set(['image/jpeg', 'image/webp']);
        this.fmt.set('image/webp');
      }
      this.encode();
    });
  }

  protected pctOf(n: number): string {
    return pct(this.sample().smallBytes, n);
  }

  protected pick(s: Sample): void {
    if (s.id === this.sample().id) return;
    this.sample.set(s);
    this.schedule(0);
  }

  protected setFmt(f: Fmt): void {
    this.fmt.set(f);
    this.schedule(0);
  }

  protected setQuality(e: Event): void {
    this.quality.set(+(e.target as HTMLInputElement).value);
    this.schedule(90);
  }

  private schedule(delay: number): void {
    if (!this.browser) return;
    if (this.timer) clearTimeout(this.timer);
    this.timer = setTimeout(() => this.encode(), delay);
  }

  private async encode(): Promise<void> {
    const id = ++this.run;
    const s = this.sample();
    this.busy.set(true);
    try {
      if (this.loaded !== s.small || !this.canvas) {
        const img = new Image();
        img.decoding = 'async';
        img.src = s.small;
        await img.decode();
        if (id !== this.run) return;
        const c = this.canvas ?? document.createElement('canvas');
        c.width = img.naturalWidth;
        c.height = img.naturalHeight;
        c.getContext('2d')!.drawImage(img, 0, 0);
        this.canvas = c;
        this.loaded = s.small;
      }
      const t0 = performance.now();
      const blob = await new Promise<Blob | null>((res) => this.canvas!.toBlob(res, this.fmt(), this.quality() / 100));
      if (id !== this.run || !blob) return;
      const prev = this.outUrl();
      this.outUrl.set(URL.createObjectURL(blob));
      if (prev) URL.revokeObjectURL(prev);
      this.outBytes.set(blob.size);
      this.ms.set(Math.max(1, Math.round(performance.now() - t0)));
      this.announce.set(
        `${this.fmtLabel()} at quality ${this.quality()}: ${bytes(blob.size)}, ${this.pctOf(blob.size).replace('−', 'minus ')} against the ${bytes(s.smallBytes)} original.`,
      );
    } catch {
      if (id === this.run) this.announce.set('This browser could not encode the sample.');
    } finally {
      if (id === this.run) this.busy.set(false);
    }
  }
}
