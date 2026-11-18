import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { MEASURED, SAMPLES, bytes, pct } from './pinch.samples';

const W = 600;
const H = 220;
const PAD = { l: 44, r: 12, t: 14, b: 26 };
const ORIGINAL = SAMPLES[0].fullBytes; // valley.jpg, 2400 x 1600
const Y_MAX = 700 * 1024;
const PTS = MEASURED.quality;
const Q_MIN = PTS[0][0];
const Q_MAX = PTS[PTS.length - 1][0];

const x = (q: number) => PAD.l + ((q - Q_MIN) / (Q_MAX - Q_MIN)) * (W - PAD.l - PAD.r);
const y = (b: number) => PAD.t + (1 - b / Y_MAX) * (H - PAD.t - PAD.b);

/**
 * Size against quality, measured: the valley sample saved as WebP by Pinch's own engine at every fifth quality
 * from 40 to 95 (the numbers behind Pinch's features section). Move the slider to read any point; the dashed line is
 * the 353 KB original, so the point where re-encoding stops paying is plain to see. Beside it, the harbour sample at
 * quality 75 in each format. Pure SVG and text; renders on the server, and the slider only changes which point is read.
 */
@Component({
  selector: 'mh-pn-curve',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="cv">
      <div class="card chart">
        <div class="head">
          <div>
            <p class="k mono">valley.jpg as WebP, 2400 × 1600</p>
            <p class="big">
              {{ bytesOf(sel()[1]) }}
              <span class="pct mono" [attr.data-tone]="sel()[1] > original ? 'warn' : 'good'">{{ pctOf(sel()[1]) }}</span>
            </p>
          </div>
          <div class="q">
            <label for="pn-cq">Quality</label>
            <input id="pn-cq" type="range" [min]="qMin" [max]="qMax" step="5" [value]="q()" (input)="setQ($event)" [attr.aria-valuetext]="'Quality ' + q() + ', ' + bytesOf(sel()[1])" />
            <output for="pn-cq" class="mono">{{ q() }}</output>
          </div>
        </div>
        <svg [attr.viewBox]="'0 0 ' + w + ' ' + h" role="img" [attr.aria-label]="chartLabel">
          @for (t of yTicks; track t) {
            <line class="grid" [attr.x1]="pad.l" [attr.x2]="w - pad.r" [attr.y1]="y(t * 1024)" [attr.y2]="y(t * 1024)" />
            <text class="ax" [attr.x]="pad.l - 8" [attr.y]="y(t * 1024) + 4" text-anchor="end">{{ t }}</text>
          }
          @for (p of pts; track p[0]) {
            <text class="ax" [attr.x]="x(p[0])" [attr.y]="h - 8" text-anchor="middle">{{ p[0] }}</text>
          }
          <line class="orig" [attr.x1]="pad.l" [attr.x2]="w - pad.r" [attr.y1]="y(original)" [attr.y2]="y(original)" />
          <text class="orig-t" [attr.x]="pad.l + 6" [attr.y]="y(original) - 6">original 353 KB</text>
          <polyline class="ln" [attr.points]="line" />
          <line class="cur" [attr.x1]="x(sel()[0])" [attr.x2]="x(sel()[0])" [attr.y1]="pad.t" [attr.y2]="h - pad.b" />
          @for (p of pts; track p[0]) {
            <circle [attr.cx]="x(p[0])" [attr.cy]="y(p[1])" [attr.r]="p[0] === q() ? 5.5 : 3" [class.on]="p[0] === q()" [class.over]="p[1] > original" />
          }
        </svg>
        <p class="cap">KB on the left, quality along the bottom. From 75 to 80 the file grows by {{ jump }}%; past 90 it is larger than the JPG it came from.</p>
      </div>

      <div class="card fmts">
        <p class="k mono">harbour.jpg at quality 75, from {{ bytesOf(harbour) }}</p>
        <ul role="list">
          @for (f of formats; track f.id) {
            <li [class.over]="f.bytes > harbour">
              <span class="name">{{ f.label }}<small class="mono">{{ f.codec }}</small></span>
              <span class="bar" aria-hidden="true"><i [style.transform]="'scaleX(' + Math.min(1, f.bytes / harbour) + ')'"></i></span>
              <span class="mono val">{{ bytesOf(f.bytes) }}</span>
              <span class="mono p" [attr.data-tone]="f.bytes > harbour ? 'warn' : 'good'">{{ f.bytes > harbour ? (f.bytes / harbour).toFixed(1) + 'x' : pctH(f.bytes) }}</span>
            </li>
          }
        </ul>
        <p class="cap">Bars are drawn against the original. Lossless PNG is {{ (formats[3].bytes / harbour).toFixed(1) }} times the size of the photo it came from, which is why Auto picks PNG only for flat graphics.</p>
      </div>
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
    .cv {
      display: grid;
      grid-template-columns: minmax(0, 1.45fr) minmax(0, 1fr);
      gap: 12px;
      align-items: stretch;
    }
    .chart,
    .fmts {
      display: grid;
      gap: 12px;
      align-content: start;
      min-width: 0;
    }
    .k {
      font-size: 11.5px;
      color: var(--muted);
    }
    .head {
      display: flex;
      flex-wrap: wrap;
      align-items: flex-end;
      justify-content: space-between;
      gap: 10px 24px;
    }
    .big {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-top: 2px;
      font-size: 1.75rem;
      font-weight: 600;
      letter-spacing: -0.035em;
      font-variant-numeric: tabular-nums;
      line-height: 1.15;
    }
    .pct,
    .p {
      padding: 2px 8px;
      border-radius: 999px;
      font-size: 12px;
      letter-spacing: 0;
      font-weight: 400;
      color: var(--pn-good, var(--ink));
      background: var(--pn-good-soft, var(--surface-2));

      &[data-tone='warn'] {
        color: var(--pn-warn, var(--ink));
        background: var(--pn-warn-soft, var(--surface-2));
      }
    }
    .q {
      display: grid;
      grid-template-columns: auto minmax(120px, 220px) 3ch;
      align-items: center;
      gap: 10px;

      label {
        font-size: 13px;
        font-weight: 500;
        color: var(--ink-2);
      }
      output {
        font-size: 13px;
        text-align: right;
      }
    }
    input[type='range'] {
      width: 100%;
      height: 44px;
      margin: 0;
      accent-color: var(--pn-blue-strong, var(--ink));
      cursor: pointer;
    }
    svg {
      display: block;
      width: 100%;
      height: auto;
      overflow: visible;
    }
    .grid {
      stroke: var(--line);
      stroke-width: 1;
    }
    .ax {
      fill: var(--muted);
      font-family: var(--font-mono);
      font-size: 11px;
    }
    .orig {
      stroke: var(--pn-warn, var(--muted));
      stroke-width: 1;
      stroke-dasharray: 4 4;
    }
    .orig-t {
      fill: var(--pn-warn, var(--muted));
      font-family: var(--font-mono);
      font-size: 11px;
    }
    .ln {
      fill: none;
      stroke: var(--pn-blue, var(--ink));
      stroke-width: 2;
      stroke-linejoin: round;
    }
    .cur {
      stroke: var(--line-strong);
      stroke-width: 1;
    }
    circle {
      fill: var(--bg);
      stroke: var(--pn-blue, var(--ink));
      stroke-width: 2;
    }
    circle.over {
      stroke: var(--pn-warn, var(--ink));
    }
    circle.on {
      fill: var(--pn-blue, var(--ink));
    }
    circle.on.over {
      fill: var(--pn-warn, var(--ink));
    }
    .cap {
      font-size: 12.5px;
      color: var(--muted);
    }
    ul {
      display: grid;
      gap: 12px;
      margin: 4px 0 0;
      padding: 0;
      list-style: none;
    }
    li {
      display: grid;
      grid-template-columns: 116px minmax(0, 1fr) 62px 52px;
      align-items: center;
      gap: 10px;
      font-size: 13.5px;
    }
    .name {
      display: grid;
      font-weight: 500;

      small {
        font-size: 11px;
        font-weight: 400;
        color: var(--muted);
      }
    }
    .bar {
      height: 8px;
      border-radius: 999px;
      background: var(--surface-2);
      overflow: hidden;

      i {
        display: block;
        height: 100%;
        background: var(--pn-blue, var(--ink));
        transform-origin: left;
      }
    }
    .over .bar i {
      background: var(--pn-warn, var(--ink));
    }
    .val {
      text-align: right;
      font-size: 12.5px;
    }
    .p {
      justify-self: end;
    }
    @media (max-width: 960px) {
      .cv {
        grid-template-columns: 1fr;
      }
    }
    @media (max-width: 480px) {
      li {
        grid-template-columns: 84px minmax(0, 1fr) 56px;
      }
      .p {
        display: none;
      }
      .q {
        grid-template-columns: auto minmax(0, 1fr) 3ch;
        width: 100%;
      }
    }
  `,
})
export class PinchCurveDemo {
  protected readonly w = W;
  protected readonly h = H;
  protected readonly pad = PAD;
  protected readonly pts = PTS;
  protected readonly qMin = Q_MIN;
  protected readonly qMax = Q_MAX;
  protected readonly original = ORIGINAL;
  protected readonly harbour = SAMPLES[1].fullBytes;
  protected readonly formats = MEASURED.formats;
  protected readonly yTicks = [0, 200, 400, 600];
  protected readonly x = x;
  protected readonly y = y;
  protected readonly bytesOf = bytes;
  protected readonly Math = Math;
  protected readonly line = PTS.map(([q, b]) => `${x(q).toFixed(1)},${y(b).toFixed(1)}`).join(' ');
  protected readonly jump = Math.round((PTS[8][1] / PTS[7][1] - 1) * 100);
  protected readonly chartLabel =
    'Line chart: the valley sample as WebP grows from 106 KB at quality 40 to 198 KB at 75, 255 KB at 80 and 647 KB at 95. The original is 353 KB; quality 90 and 95 are larger than it.';

  protected readonly q = signal(75);
  protected readonly sel = computed(() => PTS.find((p) => p[0] === this.q()) ?? PTS[7]);

  protected setQ(e: Event): void {
    this.q.set(+(e.target as HTMLInputElement).value);
  }

  protected pctOf(n: number): string {
    return pct(ORIGINAL, n);
  }

  protected pctH(n: number): string {
    return pct(this.harbour, n);
  }
}
