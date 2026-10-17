import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  phosphorAirplaneTilt,
  phosphorArrowsClockwise,
  phosphorBell,
  phosphorCalendarX,
  phosphorClipboardText,
  phosphorCreditCard,
  phosphorDotsThree,
  phosphorFileText,
  phosphorHourglass,
  phosphorHouse,
  phosphorIdentificationCard,
  phosphorReceipt,
  phosphorWarning,
  phosphorWarningOctagon,
} from '@ng-icons/phosphor-icons/regular';

/**
 * The driver app's dashboard card engine, redrawn as my own mockup. Same rules as the API I wrote for it: seven
 * rules in a fixed priority order, the first one that matches wins, and the driver sees exactly one card. Vehicle
 * safety first, then money and legal deadlines, then routine reminders. Thresholds (30 days for documents and
 * tests, 7 days for "action required", 14 days for a contract) are the real ones. Names and figures are invented.
 */
type Severity = 'info' | 'warning' | 'action';

interface Rule {
  key: string;
  label: string;
  when: string;
  icon: string;
  severity: Severity;
  chip: string;
  title: string;
  detail: string;
  action: string;
}

const RULES: Rule[] = [
  {
    key: 'grounded',
    label: 'Vehicle grounded',
    when: 'A walkaround defect marked not safe',
    icon: 'phosphorWarningOctagon',
    severity: 'action',
    chip: 'Do not drive',
    title: 'Your vehicle is grounded',
    detail: 'A walkaround check flagged a not safe defect. Do not drive until the office confirms it is fixed.',
    action: 'View check',
  },
  {
    key: 'fine',
    label: 'Fine issued',
    when: 'An open fine with no dispute in flight',
    icon: 'phosphorReceipt',
    severity: 'action',
    chip: 'Action required',
    title: 'A fine has been issued',
    detail: 'A penalty charge notice was recorded on your account. Review it and confirm liability within 14 days.',
    action: 'View fine',
  },
  {
    key: 'licence',
    label: 'Licence expiring',
    when: 'Driving or private hire licence, 30 days',
    icon: 'phosphorIdentificationCard',
    severity: 'action',
    chip: 'Expires in 5 days',
    title: 'Your driving licence is expiring',
    detail: 'Upload a photo of your renewed licence before it expires in 5 days to keep driving without a gap.',
    action: 'Upload document',
  },
  {
    key: 'extension',
    label: 'Extension pending',
    when: 'A hire extension the office has not answered',
    icon: 'phosphorHourglass',
    severity: 'info',
    chip: 'With the office',
    title: 'Extension request pending',
    detail: 'Your 4 week extension request is with the office. You will hear back within one business day.',
    action: 'View request',
  },
  {
    key: 'test',
    label: 'Test due',
    when: 'Interim, MOT or renewal test, 30 days',
    icon: 'phosphorClipboardText',
    severity: 'warning',
    chip: 'Due in 12 days',
    title: 'Your MOT is due soon',
    detail: 'Your vehicle’s MOT is due in 12 days. The office will book it in.',
    action: 'View tests',
  },
  {
    key: 'contract',
    label: 'Contract ending',
    when: 'The hire ends within 14 days',
    icon: 'phosphorCalendarX',
    severity: 'warning',
    chip: '9 days left',
    title: 'Your contract is ending soon',
    detail: 'Your rental ends in 9 days. Extend now to keep hold of your vehicle without a gap.',
    action: 'Extend or return',
  },
  {
    key: 'holiday',
    label: 'On holiday',
    when: 'An approved holiday covers today',
    icon: 'phosphorAirplaneTilt',
    severity: 'info',
    chip: 'Approved',
    title: 'You’re covered while you’re away',
    detail: 'Your vehicle stays with you until you are back. Weekly payments resume on their own.',
    action: 'View holiday',
  },
];

@Component({
  selector: 'mh-fleet-cards',
  imports: [NgIcon],
  viewProviders: [
    provideIcons({
      phosphorAirplaneTilt,
      phosphorArrowsClockwise,
      phosphorBell,
      phosphorCalendarX,
      phosphorClipboardText,
      phosphorCreditCard,
      phosphorDotsThree,
      phosphorFileText,
      phosphorHourglass,
      phosphorHouse,
      phosphorIdentificationCard,
      phosphorReceipt,
      phosphorWarning,
      phosphorWarningOctagon,
    }),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="card card--lift demo">
      <div class="phone" aria-hidden="true">
        <div class="screen">
          <div class="status mono"><span>7:42</span><span class="cam"></span><span>5G</span></div>
          <div class="hello">
            <div>
              <small>Good morning,</small>
              <b>Sam</b>
            </div>
            <span class="bell"><ng-icon name="phosphorBell" /><i></i></span>
          </div>

          <div class="car">
            <div class="car-art">
              <svg viewBox="0 0 200 70" aria-hidden="true">
                <path d="M14 52c0-8 4-13 13-15l26-6 22-15c4-3 9-4 14-4h38c6 0 11 2 15 6l15 15 18 3c8 2 11 6 11 13v5H14z" />
                <circle cx="52" cy="57" r="10" />
                <circle cx="150" cy="57" r="10" />
              </svg>
            </div>
            <div class="car-meta">
              <b>Hybrid saloon <span class="plate mono">SAMPLE</span></b>
              <small>Weekly hire, contract to 12 Mar</small>
            </div>
          </div>

          <div class="pay">
            <small class="mono">Next payment</small>
            <p><b>£210.00</b> <span>due Friday</span></p>
          </div>

          @if (card(); as c) {
            <div class="ctx" [attr.data-sev]="c.severity">
              <div class="ctx-top">
                <span class="ctx-ic"><ng-icon [name]="c.icon" /></span>
                <span class="chip-s">{{ c.chip }}</span>
              </div>
              <b>{{ c.title }}</b>
              <p>{{ c.detail }}</p>
              <span class="ctx-btn">{{ c.action }}</span>
            </div>
          } @else {
            <div class="ctx none">
              <b>All clear</b>
              <p>Nothing needs you today.</p>
            </div>
          }

          <nav class="tabs">
            <span class="on"><ng-icon name="phosphorHouse" />Home</span>
            <span><ng-icon name="phosphorCreditCard" />Pay</span>
            <span class="sos"><ng-icon name="phosphorWarning" /></span>
            <span><ng-icon name="phosphorFileText" />Docs</span>
            <span><ng-icon name="phosphorDotsThree" />More</span>
          </nav>
        </div>
      </div>

      <div class="rules">
        <div class="rules-head">
          <p class="mono">Driver’s situation</p>
          <button type="button" class="reset" (click)="reset()" aria-label="Reset the sample situation">
            <ng-icon name="phosphorArrowsClockwise" aria-hidden="true" />
          </button>
        </div>
        <ol role="list">
          @for (r of rules; track r.key; let i = $index) {
            <li>
              <button
                type="button"
                class="rule"
                [attr.aria-pressed]="on().has(r.key)"
                [class.win]="winner() === i"
                [class.below]="winner() > -1 && i > winner()"
                (click)="toggle(r.key)"
              >
                <span class="n mono">{{ i + 1 }}</span>
                <span class="txt">
                  <b>{{ r.label }}</b>
                  <small>{{ r.when }}</small>
                </span>
                <span class="state mono">{{ state(i, r.key) }}</span>
              </button>
            </li>
          }
        </ol>
        <p class="hint">Tap a rule to switch it on. The first match wins; the rest are never checked.</p>
      </div>
      <p class="sr-only" aria-live="polite">{{ live() }}</p>
    </div>
  `,
  styles: `
    :host {
      display: block;
    }
    .demo {
      display: grid;
      grid-template-columns: 232px minmax(0, 1fr);
      gap: 20px;
      padding: 18px;
      align-items: start;
    }

    // ---------- Phone ----------
    .phone {
      padding: 7px;
      border-radius: 34px;
      background: var(--f-night);
      box-shadow: var(--shadow);
    }
    .screen {
      position: relative;
      display: grid;
      gap: 8px;
      align-content: start;
      height: 500px;
      padding: 10px 11px 0;
      border-radius: 28px;
      background: #f4f6f5;
      overflow: hidden;
      color: #141c1b;
    }
    .status {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 10px;
      padding: 0 6px;

      .cam {
        width: 54px;
        height: 14px;
        border-radius: 99px;
        background: var(--f-night);
      }
    }
    .hello {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 2px;

      small {
        display: block;
        font-size: 10.5px;
        color: #56625f;
      }
      b {
        font-size: 18px;
        letter-spacing: -0.02em;
      }
    }
    .bell {
      position: relative;
      display: grid;
      place-items: center;
      width: 28px;
      height: 28px;
      border-radius: 9px;
      background: #fff;
      font-size: 14px;

      i {
        position: absolute;
        top: 6px;
        right: 7px;
        width: 5px;
        height: 5px;
        border-radius: 50%;
        background: var(--f-amber-fill);
      }
    }
    .car {
      border-radius: 14px;
      overflow: hidden;
      background: linear-gradient(160deg, var(--f-night-3), var(--f-night));
      color: var(--n-ink);
    }
    .car-art {
      padding: 8px 30px 0;

      svg {
        display: block;
        width: 100%;
        height: auto;
        fill: none;
        stroke: var(--n-teal);
        stroke-width: 1.6;
        opacity: 0.85;
      }
    }
    .car-meta {
      padding: 4px 11px 9px;

      b {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 12.5px;
      }
      small {
        font-size: 10px;
        color: var(--n-muted);
      }
    }
    .plate {
      padding: 1px 5px;
      border-radius: 4px;
      background: rgb(255 255 255 / 0.14);
      font-size: 9px;
      font-weight: 500;
    }
    .pay {
      padding: 8px 11px;
      border-radius: 12px;
      background: #fff;

      small {
        font-size: 9px;
        color: #56625f;
        text-transform: uppercase;
        letter-spacing: 0.06em;
      }
      p {
        font-size: 10.5px;
        color: #56625f;

        span {
          margin-left: 4px;
        }
      }
      b {
        font-size: 16px;
        color: #141c1b;
        letter-spacing: -0.02em;
      }
    }
    .ctx {
      display: grid;
      gap: 4px;
      padding: 10px 11px 11px;
      border-radius: 12px;
      background: #fff;
      border: 1px solid var(--line);

      b {
        font-size: 12.5px;
        line-height: 1.25;
      }
      p {
        font-size: 10.5px;
        line-height: 1.4;
        color: #56625f;
      }
      &.none {
        border-style: dashed;
        background: transparent;
      }
    }
    @media (prefers-reduced-motion: no-preference) {
      .ctx {
        animation: card-in 0.45s var(--ease) both;
      }
    }
    @keyframes card-in {
      from {
        opacity: 0;
        transform: translateY(8px) scale(0.98);
      }
    }
    .ctx-top {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .ctx-ic {
      display: grid;
      place-items: center;
      width: 24px;
      height: 24px;
      border-radius: 8px;
      font-size: 13px;
      background: var(--f-teal-soft);
      color: var(--f-teal);
    }
    .chip-s {
      padding: 2px 7px;
      border-radius: 99px;
      font-size: 9.5px;
      font-weight: 600;
      background: var(--f-teal-soft);
      color: var(--f-teal);
    }
    .ctx[data-sev='warning'] {
      .ctx-ic,
      .chip-s {
        background: var(--f-amber-soft);
        color: var(--f-amber);
      }
    }
    .ctx[data-sev='action'] {
      .ctx-ic,
      .chip-s {
        background: var(--f-red-soft);
        color: var(--f-red);
      }
    }
    .ctx-btn {
      margin-top: 4px;
      display: grid;
      place-items: center;
      height: 30px;
      border-radius: 9px;
      background: var(--f-teal);
      color: #fff;
      font-size: 11px;
      font-weight: 600;
    }
    .tabs {
      position: absolute;
      left: 0;
      right: 0;
      bottom: 0;
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      align-items: end;
      padding: 6px 6px 12px;
      background: #fff;
      border-top: 1px solid var(--line);

      span {
        display: grid;
        justify-items: center;
        gap: 1px;
        font-size: 8.5px;
        color: #56625f;

        ng-icon {
          font-size: 15px;
        }
      }
      .on {
        color: var(--f-teal);
        font-weight: 600;
      }
      .sos {
        width: 38px;
        height: 38px;
        margin: -18px auto 0;
        place-items: center;
        border-radius: 50%;
        background: var(--f-night);
        color: var(--n-amber);
        box-shadow: 0 6px 14px rgb(17 25 24 / 0.3);

        ng-icon {
          font-size: 17px;
        }
      }
    }

    // ---------- Rules ----------
    .rules-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 8px;

      p {
        font-size: 12px;
        color: var(--muted);
      }
    }
    .reset {
      display: grid;
      place-items: center;
      width: 44px;
      height: 44px;
      margin: -10px -10px -10px 0;
      border-radius: 50%;
      color: var(--muted);
      font-size: 16px;

      &:hover {
        color: var(--ink);
        background: var(--surface-2);
      }
    }
    ol {
      display: grid;
      gap: 5px;
    }
    .rule {
      width: 100%;
      min-height: 44px;
      display: grid;
      grid-template-columns: 20px minmax(0, 1fr) auto;
      align-items: center;
      gap: 9px;
      padding: 6px 10px 6px 8px;
      border-radius: 11px;
      border: 1px solid var(--line);
      background: var(--bg);
      text-align: left;
      transition:
        background var(--t-fast),
        border-color var(--t-fast),
        opacity var(--t-fast);

      &:hover {
        border-color: var(--line-strong);
      }
      &[aria-pressed='true'] {
        background: var(--surface);
        border-color: var(--line-strong);
      }
      &.win {
        background: var(--f-teal-tint);
        border-color: var(--f-teal-2);
      }
      &.below[aria-pressed='true'] {
        opacity: 0.62;
      }
    }
    .n {
      display: grid;
      place-items: center;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      font-size: 12px;
      background: var(--surface-2);
      color: var(--muted);

      .win & {
        background: var(--f-teal);
        color: #fff;
      }
    }
    .txt {
      min-width: 0;

      b {
        display: block;
        font-size: 13px;
        font-weight: 600;
      }
      small {
        display: block;
        font-size: 12px;
        color: var(--muted);
        line-height: 1.3;
      }
    }
    .state {
      font-size: 12px;
      color: var(--muted);
      white-space: nowrap;

      .win & {
        color: var(--f-teal);
        font-weight: 600;
      }
    }
    .hint {
      margin-top: 10px;
      font-size: 12px;
      color: var(--muted);
      line-height: 1.45;
    }

    @media (max-width: 560px) {
      .demo {
        grid-template-columns: 1fr;
        padding: 14px;
      }
      .phone {
        width: 232px;
        margin: 0 auto;
      }
    }
  `,
})
export class FleetCardDemo {
  protected readonly rules = RULES;
  private static readonly START = ['fine', 'contract'];
  protected readonly on = signal(new Set<string>(FleetCardDemo.START));
  protected readonly winner = computed(() => RULES.findIndex((r) => this.on().has(r.key)));
  protected readonly card = computed(() => {
    const i = this.winner();
    return i > -1 ? RULES[i] : null;
  });
  protected readonly live = computed(() => {
    const c = this.card();
    return c ? `The driver sees one card: ${c.title}.` : 'No rule matches. The driver sees no card.';
  });

  protected toggle(key: string): void {
    this.on.update((s) => {
      const next = new Set(s);
      if (!next.delete(key)) next.add(key);
      return next;
    });
  }

  protected reset(): void {
    this.on.set(new Set(FleetCardDemo.START));
  }

  protected state(i: number, key: string): string {
    const w = this.winner();
    if (w === i) return 'Shown';
    if (w > -1 && i > w) return 'Skipped';
    return this.on().has(key) ? 'Match' : 'No match';
  }
}
