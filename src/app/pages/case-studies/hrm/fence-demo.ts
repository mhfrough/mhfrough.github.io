import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { phosphorCamera, phosphorFingerprint, phosphorHandTap, phosphorMapPin } from '@ng-icons/phosphor-icons/regular';

/**
 * The geo-fenced punch, with the rule the HRM Suite phone app and server use (hrm_flutter README,
 * attendance_controller.dart): a fix counts as inside when distance <= radius + min(accuracy, 30 m); positions
 * from mock-location apps are refused; outside the fence a punch is accepted only when the company allows remote
 * punches, and then flagged for HR review, and only with a fingerprint or a selfie, because one tap has no proof
 * except the fence itself. My own rebuild; the office is the demo company's "Karachi HQ".
 */
type Method = 'biometric' | 'selfie' | 'tap';

interface Verdict {
  ok: boolean;
  flag: boolean;
  title: string;
  why: string;
}

const METHODS: { id: Method; label: string; icon: string }[] = [
  { id: 'biometric', label: 'Fingerprint', icon: 'phosphorFingerprint' },
  { id: 'selfie', label: 'Selfie', icon: 'phosphorCamera' },
  { id: 'tap', label: 'One tap', icon: 'phosphorHandTap' },
];

const VIEW = 120; // SVG radius in px for MAX metres
const MAX = 400;
const ANGLE = (-35 * Math.PI) / 180;

@Component({
  selector: 'mh-hrm-fence',
  imports: [NgIcon],
  viewProviders: [provideIcons({ phosphorCamera, phosphorFingerprint, phosphorHandTap, phosphorMapPin })],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="fence card">
      <div class="radar-col">
        <svg class="radar" viewBox="-130 -130 260 260" role="img" [attr.aria-label]="svgLabel()">
          <circle class="ring" r="120" />
          <circle class="ring" r="90" />
          <circle class="ring" r="60" />
          <circle class="ring" r="30" />
          <circle class="zone" [attr.r]="px(radius())" />
          <circle class="tol" [attr.r]="px(radius() + tolerance())" />
          <circle class="acc" [attr.cx]="pos().x" [attr.cy]="pos().y" [attr.r]="px(accuracy())" [class.bad]="!verdict().ok" />
          <line class="ray" x1="0" y1="0" [attr.x2]="pos().x" [attr.y2]="pos().y" />
          <rect class="office" x="-7" y="-7" width="14" height="14" rx="3" />
          <circle class="me" [attr.cx]="pos().x" [attr.cy]="pos().y" r="6" [class.bad]="!verdict().ok" [class.flag]="verdict().flag" />
        </svg>
        <ul class="legend mono" role="list">
          <li><i class="l-zone"></i>Fence {{ radius() }} m</li>
          <li><i class="l-tol"></i>+ {{ tolerance() }} m GPS tolerance</li>
          <li><i class="l-acc"></i>Accuracy {{ accuracy() }} m</li>
        </ul>
      </div>

      <div class="controls">
        <div class="field">
          <label for="f-dist">Distance from Karāchi HQ <output for="f-dist" class="mono">{{ distance() }} m</output></label>
          <input id="f-dist" type="range" min="0" max="400" step="5" [value]="distance()" (input)="distance.set(num($event))" />
        </div>
        <div class="field">
          <label for="f-acc">GPS accuracy <output for="f-acc" class="mono">{{ accuracy() }} m</output></label>
          <input id="f-acc" type="range" min="5" max="80" step="1" [value]="accuracy()" (input)="accuracy.set(num($event))" />
        </div>
        <div class="field">
          <label for="f-rad">Office fence radius <output for="f-rad" class="mono">{{ radius() }} m</output></label>
          <input id="f-rad" type="range" min="50" max="300" step="10" [value]="radius()" (input)="radius.set(num($event))" />
        </div>

        <div class="field">
          <span class="lbl" id="f-method">Verification</span>
          <div class="seg" role="group" aria-labelledby="f-method">
            @for (m of methods; track m.id) {
              <button type="button" [attr.aria-pressed]="method() === m.id" (click)="method.set(m.id)">
                <ng-icon [name]="m.icon" aria-hidden="true" /> {{ m.label }}
              </button>
            }
          </div>
        </div>

        <div class="toggles">
          <label class="tg"><input type="checkbox" [checked]="remote()" (change)="remote.set(checked($event))" /> Company allows remote punches</label>
          <label class="tg"><input type="checkbox" [checked]="mock()" (change)="mock.set(checked($event))" /> Phone reports a mock location</label>
        </div>

        <div class="verdict" [class.ok]="verdict().ok && !verdict().flag" [class.flag]="verdict().flag" [class.no]="!verdict().ok" aria-live="polite">
          <b>{{ verdict().title }}</b>
          <span>{{ verdict().why }}</span>
        </div>
      </div>
    </div>
  `,
  styles: `
    :host {
      display: block;
    }

    .fence {
      display: grid;
      grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.1fr);
      gap: 28px;
      align-items: center;
      padding: 24px;
    }

    .radar-col {
      display: grid;
      justify-items: center;
      gap: 12px;
    }

    .radar {
      width: 100%;
      max-width: 320px;
      height: auto;
      overflow: visible;
    }

    .ring {
      fill: none;
      stroke: var(--line);
      stroke-width: 1;
    }

    .zone {
      fill: var(--h-blue-soft);
      stroke: var(--h-blue);
      stroke-width: 1.5;
      transition: r var(--t-base) var(--ease);
    }

    .tol {
      fill: none;
      stroke: var(--h-blue-text);
      stroke-width: 1;
      stroke-dasharray: 3 4;
      opacity: 0.7;
      transition: r var(--t-base) var(--ease);
    }

    .acc {
      fill: rgb(79 187 146 / 0.14);
      stroke: rgb(79 187 146 / 0.5);
      stroke-width: 1;

      &.bad {
        fill: rgb(240 122 122 / 0.12);
        stroke: rgb(240 122 122 / 0.5);
      }
    }

    .ray {
      stroke: var(--line-strong);
      stroke-width: 1;
      stroke-dasharray: 2 3;
    }

    .office {
      fill: var(--h-red);
    }

    .me {
      fill: var(--h-green-text);
      stroke: var(--surface);
      stroke-width: 2;

      &.flag {
        fill: var(--h-amber-text);
      }

      &.bad {
        fill: var(--h-red-text);
      }
    }

    .legend {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 4px 14px;
      font-size: 12px;
      color: var(--muted);

      li {
        display: flex;
        align-items: center;
        gap: 6px;
      }

      i {
        width: 10px;
        height: 10px;
        border-radius: 50%;
      }

      .l-zone {
        background: var(--h-blue);
      }

      .l-tol {
        border: 1px dashed var(--h-blue-text);
      }

      .l-acc {
        background: rgb(79 187 146 / 0.5);
      }
    }

    .controls {
      display: grid;
      gap: 16px;
    }

    .field label,
    .lbl {
      display: flex;
      justify-content: space-between;
      gap: 12px;
      font-size: 13px;
      font-weight: 500;
      color: var(--ink-2);
    }

    output {
      color: var(--ink);
      font-size: 12.5px;
    }

    input[type='range'] {
      width: 100%;
      height: 28px;
      accent-color: var(--h-blue);
      cursor: pointer;
    }

    .seg {
      flex-wrap: wrap;

      button {
        gap: 6px;
        font-size: 13px;
      }

      ng-icon {
        font-size: 16px;
      }
    }

    .toggles {
      display: grid;
      gap: 8px;
    }

    .tg {
      display: flex;
      align-items: center;
      gap: 10px;
      min-height: 32px;
      font-size: 14px;
      color: var(--ink-2);
      cursor: pointer;

      input {
        width: 18px;
        height: 18px;
        accent-color: var(--h-blue);
        flex-shrink: 0;
      }
    }

    .verdict {
      display: grid;
      gap: 2px;
      padding: 14px 16px;
      border-radius: var(--r-inner);
      border: 1px solid var(--line);

      b {
        font-size: 15px;
      }

      span {
        font-size: 13.5px;
        color: var(--ink-2);
      }

      &.ok {
        background: var(--h-green-soft);
        border-color: rgb(79 187 146 / 0.34);

        b {
          color: var(--h-green-text);
        }
      }

      &.flag {
        background: var(--h-amber-soft);
        border-color: rgb(240 189 94 / 0.32);

        b {
          color: var(--h-amber-text);
        }
      }

      &.no {
        background: var(--h-red-soft);
        border-color: rgb(240 122 122 / 0.34);

        b {
          color: var(--h-red-text);
        }
      }
    }

    @media (max-width: 480px) {
      .seg {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));

        button {
          justify-content: center;
          padding: 0 6px;
          font-size: 12.5px;
        }
      }
    }

    @media (max-width: 820px) {
      .fence {
        grid-template-columns: 1fr;
        padding: 18px;
      }

      .radar {
        max-width: 260px;
      }
    }
  `,
})
export class HrmFenceDemo {
  protected readonly methods = METHODS;

  protected readonly distance = signal(95);
  protected readonly accuracy = signal(18);
  protected readonly radius = signal(120);
  protected readonly method = signal<Method>('biometric');
  protected readonly remote = signal(false);
  protected readonly mock = signal(false);

  protected readonly tolerance = computed(() => Math.min(this.accuracy(), 30));
  protected readonly pos = computed(() => {
    const r = this.px(this.distance());
    return { x: +(Math.cos(ANGLE) * r).toFixed(1), y: +(Math.sin(ANGLE) * r).toFixed(1) };
  });

  protected readonly verdict = computed<Verdict>(() => {
    const d = this.distance();
    const limit = this.radius() + this.tolerance();
    const how = METHODS.find((m) => m.id === this.method())!.label.toLowerCase();
    if (this.mock()) {
      return { ok: false, flag: false, title: 'Punch refused', why: 'The position comes from a mock-location app, so the server ignores it.' };
    }
    if (d <= limit) {
      return {
        ok: true,
        flag: false,
        title: 'Checked in',
        why: `${d} m from the office, inside ${this.radius()} m plus ${this.tolerance()} m of GPS tolerance. Verified by ${how}.`,
      };
    }
    const out = d - limit;
    if (this.method() === 'tap') {
      return { ok: false, flag: false, title: 'Punch refused', why: `${out} m outside the fence. One tap needs the fence: being inside it is the only proof.` };
    }
    if (this.remote()) {
      return { ok: true, flag: true, title: 'Accepted, flagged for HR', why: `${out} m outside the fence. Remote punches are allowed, so it is recorded with the ${how} and sent for review.` };
    }
    return { ok: false, flag: false, title: 'Punch refused', why: `${out} m outside the fence, and this company does not allow remote punches.` };
  });

  protected readonly svgLabel = computed(
    () => `Map of the office fence: ${this.radius()} metres, the phone ${this.distance()} metres away. ${this.verdict().title}.`,
  );

  protected px(m: number): number {
    return +((Math.min(m, MAX) / MAX) * VIEW).toFixed(1);
  }

  protected num(e: Event): number {
    return +(e.target as HTMLInputElement).value;
  }

  protected checked(e: Event): boolean {
    return (e.target as HTMLInputElement).checked;
  }
}
