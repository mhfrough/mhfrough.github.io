import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { phosphorArrowsClockwise, phosphorMinus, phosphorPlus } from '@ng-icons/phosphor-icons/regular';

/**
 * The tyre step of the daily walkaround check and the rules the API applies when it is submitted, redrawn as my
 * own mockup. The real rules: a tyre under the 1.6 mm UK legal minimum cannot be submitted as a pass, every
 * flagged item needs exactly one defect, a missing spare is recorded by the server as a "report" issue, the worst
 * severity wins, and only "not safe" grounds the vehicle. Nothing is sent anywhere; the response is worked out here.
 */
type Sev = 'minor' | 'report' | 'not_safe';

interface Tyre {
  key: string;
  label: string;
  short: string;
  mm: number;
  flagged: boolean;
  sev: Sev;
}

const MIN_MM = 1.6;
const RANK: Record<Sev, number> = { minor: 1, report: 2, not_safe: 3 };
const SEV_LABEL: Record<Sev, string> = { minor: 'Minor', report: 'Report', not_safe: 'Not safe' };

const START: Tyre[] = [
  { key: 'nearsideFront', label: 'Nearside front', short: 'NSF', mm: 4.8, flagged: false, sev: 'report' },
  { key: 'offsideFront', label: 'Offside front', short: 'OSF', mm: 5.1, flagged: false, sev: 'report' },
  { key: 'nearsideRear', label: 'Nearside rear', short: 'NSR', mm: 1.8, flagged: false, sev: 'report' },
  { key: 'offsideRear', label: 'Offside rear', short: 'OSR', mm: 4.4, flagged: false, sev: 'report' },
];

interface Result {
  ok: boolean;
  code: string;
  lines: string[];
  grounded?: boolean;
}

@Component({
  selector: 'mh-fleet-walkaround',
  imports: [NgIcon],
  viewProviders: [provideIcons({ phosphorArrowsClockwise, phosphorMinus, phosphorPlus })],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="wk">
      <div class="card card--lift form">
        <div class="head">
          <div>
            <p class="mono step">Step 2 of 5</p>
            <h3>Tyres and wheels</h3>
          </div>
          <button type="button" class="reset" (click)="reset()" aria-label="Reset the sample check">
            <ng-icon name="phosphorArrowsClockwise" aria-hidden="true" />
          </button>
        </div>

        <div class="axle">
          @for (t of tyres(); track t.key; let i = $index) {
            <fieldset class="tyre" [class.low]="t.mm < min" [class.flag]="t.flagged" [style.grid-area]="t.short">
              <legend>{{ t.label }}</legend>
              <div class="mm">
                <button type="button" class="step-btn" (click)="nudge(i, -0.2)" [attr.aria-label]="'Less tread on ' + t.label">
                  <ng-icon name="phosphorMinus" aria-hidden="true" />
                </button>
                <output class="mono" [attr.aria-label]="t.label + ' tread depth'">{{ t.mm.toFixed(1) }} mm</output>
                <button type="button" class="step-btn" (click)="nudge(i, 0.2)" [attr.aria-label]="'More tread on ' + t.label">
                  <ng-icon name="phosphorPlus" aria-hidden="true" />
                </button>
              </div>
              <div class="pf" role="group" [attr.aria-label]="t.label + ' result'">
                <button type="button" [attr.aria-pressed]="!t.flagged" (click)="flag(i, false)">Pass</button>
                <button type="button" [attr.aria-pressed]="t.flagged" (click)="flag(i, true)">Flag</button>
              </div>
            </fieldset>
          }
          <svg class="car" viewBox="0 0 90 170" aria-hidden="true" style="grid-area: CAR">
            <rect x="12" y="6" width="66" height="158" rx="26" />
            <path d="M20 52c8-6 42-6 50 0l-4 22H24z" />
            <path d="M24 122h42l3 16c-10 5-38 5-48 0z" />
            <line x1="45" y1="10" x2="45" y2="30" />
          </svg>
        </div>

        <div class="spares">
          @for (s of spareList; track s.key) {
            <label class="check">
              <input type="checkbox" [checked]="spares()[s.key]" (change)="toggleSpare(s.key)" />
              <span>{{ s.label }} present</span>
            </label>
          }
        </div>

        @if (flagged().length) {
          <div class="defects">
            <p class="mono lab">Defects, one per flagged tyre</p>
            @for (t of flagged(); track t.key) {
              <div class="defect">
                <span>{{ t.label }}</span>
                <div class="sev" role="group" [attr.aria-label]="'Severity for ' + t.label">
                  @for (s of sevs; track s) {
                    <button type="button" [attr.aria-pressed]="t.sev === s" [attr.data-s]="s" (click)="setSev(t.key, s)">{{ label[s] }}</button>
                  }
                </div>
              </div>
            }
          </div>
        }

        <button type="button" class="btn btn-solid submit" (click)="submit()">Submit check</button>
      </div>

      <div class="srv" aria-live="polite">
        <p class="mono srv-head">API response</p>
        @if (result(); as r) {
          <p class="code mono" [class.bad]="!r.ok">{{ r.code }}</p>
          <ul role="list">
            @for (l of r.lines; track l) {
              <li>{{ l }}</li>
            }
          </ul>
          @if (r.grounded) {
            <p class="ground mono">Vehicle status: VOR, maintenance. Staff alerted. Only a staff edit releases it.</p>
          }
        } @else {
          <p class="idle">Change a tread depth, flag a tyre or take the spare out, then submit. The server checks the
            same rules whatever the app sends.</p>
        }
        <p class="mono sample">Sample check, nothing is sent</p>
      </div>
    </div>
  `,
  styles: `
    :host {
      display: block;
    }
    .wk {
      display: grid;
      grid-template-columns: minmax(0, 1fr) minmax(0, 0.8fr);
      gap: 16px;
      align-items: stretch;
    }
    .form {
      display: grid;
      gap: 16px;
      padding: 20px;
    }
    .head {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;

      h3 {
        font-size: 16px;
      }
    }
    .step {
      font-size: 12px;
      color: var(--f-teal);
    }
    .reset {
      display: grid;
      place-items: center;
      width: 44px;
      height: 44px;
      margin: -8px -10px 0 0;
      border-radius: 50%;
      color: var(--muted);
      font-size: 16px;

      &:hover {
        color: var(--ink);
        background: var(--surface-2);
      }
    }

    // Two tyres each side of a top-down car, front at the top. Nearside is the left in the UK.
    .axle {
      display: grid;
      grid-template-columns: minmax(0, 1fr) 70px minmax(0, 1fr);
      grid-template-areas:
        'NSF CAR OSF'
        'NSR CAR OSR';
      gap: 10px 12px;
      align-items: center;
    }
    .car {
      width: 70px;
      height: auto;
      fill: none;
      stroke: var(--line-strong);
      stroke-width: 2;
    }
    .tyre {
      display: grid;
      gap: 8px;
      margin: 0;
      padding: 10px;
      border: 1px solid var(--line);
      border-radius: var(--r-inner);
      background: var(--bg);
      min-width: 0;

      legend {
        float: left;
        width: 100%;
        padding: 0;
        font-size: 12.5px;
        font-weight: 600;
      }
      &.low {
        border-color: var(--f-amber-fill);
      }
      &.flag {
        background: var(--f-amber-soft);
      }
    }
    .mm {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 4px;

      output {
        font-size: 13px;
        font-weight: 500;
        white-space: nowrap;

        .low & {
          color: var(--f-red);
        }
      }
    }
    .step-btn {
      display: grid;
      place-items: center;
      width: 32px;
      height: 32px;
      flex: none;
      border-radius: 50%;
      border: 1px solid var(--line);
      background: var(--surface);
      font-size: 13px;

      &:hover {
        border-color: var(--line-strong);
      }
    }
    .pf,
    .sev {
      display: flex;
      gap: 4px;

      button {
        flex: 1;
        min-height: 32px;
        padding: 0 8px;
        border-radius: 99px;
        border: 1px solid var(--line);
        background: var(--surface);
        font-size: 12px;
        font-weight: 500;
        color: var(--ink-2);

        &[aria-pressed='true'] {
          background: var(--f-teal);
          border-color: var(--f-teal);
          color: #fff;
        }
      }
    }
    .sev button[data-s='not_safe'][aria-pressed='true'] {
      background: var(--f-red);
      border-color: var(--f-red);
    }
    .spares {
      display: flex;
      flex-wrap: wrap;
      gap: 6px 20px;
    }
    .check {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      min-height: 44px;
      font-size: 13.5px;
    }
    .lab {
      font-size: 12px;
      color: var(--muted);
      margin-bottom: 6px;
    }
    .defects {
      display: grid;
      gap: 6px;
    }
    .defect {
      display: grid;
      grid-template-columns: minmax(0, 0.8fr) minmax(0, 1.2fr);
      align-items: center;
      gap: 10px;
      font-size: 13px;
      font-weight: 500;
    }
    .submit {
      justify-self: start;
    }

    // Response panel: the API's verdict on the night block.
    .srv {
      display: flex;
      flex-direction: column;
      gap: 10px;
      padding: 20px;
      border-radius: var(--r-card);
      background: var(--f-night);
      color: var(--n-ink);
      min-width: 0;
    }
    .srv-head {
      font-size: 12px;
      color: var(--n-muted);
    }
    .code {
      font-size: 13px;
      font-weight: 600;
      color: var(--n-teal);

      &.bad {
        color: var(--n-amber);
      }
    }
    ul {
      display: grid;
      gap: 6px;

      li {
        font-size: 13px;
        line-height: 1.45;
        color: var(--n-ink);
        overflow-wrap: anywhere;
      }
    }
    .ground {
      padding: 10px 12px;
      border-radius: 10px;
      background: var(--f-night-3);
      color: var(--n-amber);
      font-size: 12px;
      line-height: 1.45;
    }
    .idle {
      font-size: 13.5px;
      line-height: 1.5;
      color: var(--n-muted);
    }
    .sample {
      margin-top: auto;
      font-size: 12px;
      color: var(--n-muted);
    }

    @media (max-width: 860px) {
      .wk {
        grid-template-columns: 1fr;
      }
    }
    @media (max-width: 520px) {
      .form {
        padding: 16px;
      }
      .axle {
        grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
        grid-template-areas:
          'NSF OSF'
          'NSR OSR';
      }
      .car {
        display: none;
      }
      .defect {
        grid-template-columns: 1fr;
        gap: 4px;
      }
    }
  `,
})
export class FleetWalkaroundDemo {
  protected readonly min = MIN_MM;
  protected readonly sevs: Sev[] = ['minor', 'report', 'not_safe'];
  protected readonly label = SEV_LABEL;
  protected readonly spareList = [
    { key: 'spareTyre' as const, label: 'Spare tyre' },
    { key: 'spareKit' as const, label: 'Repair kit' },
  ];

  protected readonly tyres = signal<Tyre[]>(START.map((t) => ({ ...t })));
  protected readonly spares = signal({ spareTyre: true, spareKit: true });
  protected readonly result = signal<Result | null>(null);
  protected readonly flagged = computed(() => this.tyres().filter((t) => t.flagged));

  protected nudge(i: number, by: number): void {
    this.patch(i, (t) => ({ ...t, mm: Math.min(8, Math.max(0, Math.round((t.mm + by) * 10) / 10)) }));
  }

  protected flag(i: number, flagged: boolean): void {
    this.patch(i, (t) => ({ ...t, flagged }));
  }

  protected setSev(key: string, sev: Sev): void {
    this.tyres.update((ts) => ts.map((t) => (t.key === key ? { ...t, sev } : t)));
    this.result.set(null);
  }

  protected toggleSpare(key: 'spareTyre' | 'spareKit'): void {
    this.spares.update((s) => ({ ...s, [key]: !s[key] }));
    this.result.set(null);
  }

  protected reset(): void {
    this.tyres.set(START.map((t) => ({ ...t })));
    this.spares.set({ spareTyre: true, spareKit: true });
    this.result.set(null);
  }

  /** Same order as the API: legal minimum first, then defects against flags, then severity. */
  protected submit(): void {
    const low = this.tyres().find((t) => t.mm < MIN_MM && !t.flagged);
    if (low) {
      this.result.set({
        ok: false,
        code: '400 Bad Request',
        lines: [`${low.label}: ${low.mm.toFixed(1)} mm is below the ${MIN_MM} mm legal minimum, so the tyre must be flagged with a defect.`],
      });
      return;
    }

    const defects: { what: string; sev: Sev }[] = this.flagged().map((t) => ({ what: `${t.label} tyre`, sev: t.sev }));
    const s = this.spares();
    if (!s.spareTyre) defects.push({ what: 'Spare tyre not present, recorded by the server', sev: 'report' });
    if (!s.spareKit) defects.push({ what: 'Repair kit not present, recorded by the server', sev: 'report' });

    if (!defects.length) {
      this.result.set({ ok: true, code: '201 Created', lines: ['No defects. The driver sees "You’re good to go" and the app unlocks.'] });
      return;
    }

    const worst = defects.reduce<Sev>((w, d) => (RANK[d.sev] > RANK[w] ? d.sev : w), defects[0].sev);
    const grounded = worst === 'not_safe';
    this.result.set({
      ok: true,
      code: '201 Created',
      lines: [
        ...defects.map((d) => `${d.what}: ${SEV_LABEL[d.sev]}`),
        `Worst severity: ${SEV_LABEL[worst]}.`,
        grounded ? 'The driver sees "Vehicle grounded" and a call the office button.' : 'The vehicle stays on the road. The office sees the defects.',
      ],
      grounded,
    });
  }

  private patch(i: number, fn: (t: Tyre) => Tyre): void {
    this.tyres.update((ts) => ts.map((t, j) => (j === i ? fn(t) : t)));
    this.result.set(null);
  }
}
