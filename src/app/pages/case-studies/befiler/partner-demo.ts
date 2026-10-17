import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { phosphorCaretLeft, phosphorCheck, phosphorLockSimple } from '@ng-icons/phosphor-icons/regular';
import { PARTNERS, PartnerId } from './befiler.copy';

/**
 * "Same widget, each bank's colours": a phone mockup of the Befiler widget running inside a bank app
 * (my own design). Pick a partner and the widget re-skins; the handoff log replays the order of events.
 * The اردو toggle flips the widget to Urdu and right to left, as the real v2 widgets do.
 */
const TEXT = {
  en: {
    title: 'Tax return 2026',
    powered: 'Filing by Befiler',
    steps: ['Income', 'Wealth statement', 'Payment'],
    status: ['Done', 'Done', 'Ready'],
    pay: 'Pay from your account',
    lang: 'اردو',
  },
  ur: {
    title: 'ٹیکس ریٹرن 2026',
    powered: 'بی فائلر کے ذریعے فائلنگ',
    steps: ['آمدنی', 'اثاثوں کا گوشوارہ', 'ادائیگی'],
    status: ['مکمل', 'مکمل', 'تیار'],
    pay: 'اپنے اکاؤنٹ سے ادائیگی کریں',
    lang: 'English',
  },
} as const;

@Component({
  selector: 'mh-befiler-partner',
  imports: [NgIcon],
  viewProviders: [provideIcons({ phosphorCaretLeft, phosphorCheck, phosphorLockSimple })],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="demo">
      <div class="side">
        <div class="pick" role="radiogroup" [attr.aria-label]="label()">
          @for (p of partners; track p.id) {
            <button
              type="button"
              role="radio"
              class="chip"
              [attr.aria-checked]="p.id === id()"
              [attr.tabindex]="p.id === id() ? 0 : -1"
              (click)="id.set(p.id)"
              (keydown)="onKey($event)"
            >
              <span class="sw" [style.background]="p.color" aria-hidden="true"></span>{{ p.name }}
            </button>
          }
        </div>

        @for (k of [id()]; track k) {
          <ol class="log mono" role="list" aria-label="What happens">
            @for (line of log(); track $index; let i = $index) {
              <li [style.--i]="i"><span class="n">0{{ i + 1 }}</span>{{ line }}</li>
            }
          </ol>
        }
      </div>

      <div class="phone" role="img" [attr.aria-label]="'Widget preview in ' + partner().name + ' colours, ' + (ur() ? 'Urdu, right to left' : 'English')">
        <div class="screen" [style.--p]="partner().color" [style.--p-ink]="partner().ink" [attr.dir]="ur() ? 'rtl' : 'ltr'" [attr.lang]="ur() ? 'ur' : 'en'">
          <div class="bank-bar">
            <ng-icon name="phosphorCaretLeft" class="flip" aria-hidden="true" />
            <b>{{ partner().name }}</b>
            <span class="lock"><ng-icon name="phosphorLockSimple" aria-hidden="true" /></span>
          </div>
          <div class="w">
            <p class="powered">{{ t().powered }}</p>
            <div class="w-card">
              <p class="w-title">{{ t().title }}</p>
              <div class="w-bar"><i></i></div>
              <ul role="list">
                @for (s of t().steps; track s; let i = $index) {
                  <li>
                    <span class="dot" [class.on]="i < 2">
                      @if (i < 2) {
                        <ng-icon name="phosphorCheck" aria-hidden="true" />
                      }
                    </span>
                    {{ s }}
                    <em>{{ t().status[i] }}</em>
                  </li>
                }
              </ul>
            </div>
            <span class="w-btn">{{ t().pay }}</span>
          </div>
        </div>
      </div>
      <button type="button" class="chip lang" [attr.aria-pressed]="ur()" (click)="ur.set(!ur())">
        <span [attr.lang]="ur() ? 'en' : 'ur'">{{ t().lang }}</span>
      </button>
    </div>
  `,
  styles: `
    :host {
      display: block;
    }
    .demo {
      position: relative;
      display: grid;
      grid-template-columns: minmax(0, 1fr) 260px;
      gap: 40px;
      align-items: center;
    }
    .pick {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin-bottom: 22px;
    }
    .chip {
      height: 34px;
    }
    .chip[aria-checked='true'] {
      background: var(--ink);
      border-color: var(--ink);
      color: var(--bg);
    }
    .sw {
      width: 10px;
      height: 10px;
      border-radius: 50%;
    }
    .log {
      display: grid;
      gap: 8px;
      font-size: 12.5px;
      color: var(--ink-2);
    }
    .log li {
      display: flex;
      gap: 12px;
      padding: 10px 14px;
      border-radius: var(--r-inner);
      background: var(--surface);
      border: 1px solid var(--line);
    }
    .n {
      color: var(--b-red-text, var(--accent));
    }
    @media (prefers-reduced-motion: no-preference) {
      .log li {
        animation: in 0.5s var(--ease) both;
        animation-delay: calc(var(--i) * 140ms);
      }
    }
    @keyframes in {
      from {
        opacity: 0;
        transform: translateY(8px);
      }
    }

    /* Phone */
    .phone {
      width: 260px;
      height: 520px;
      padding: 10px;
      border-radius: 40px;
      background: #1b1b1b;
      box-shadow: var(--shadow-lg);
    }
    .screen {
      height: 100%;
      border-radius: 31px;
      overflow: hidden;
      background: #f6f6f6;
      font-size: 12px;
      color: #1b1b1b;
    }
    .screen[lang='ur'] {
      font-family: 'Noto Nastaliq Urdu', var(--font-sans);
      line-height: 2;
    }
    .bank-bar {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 30px 16px 14px;
      background: var(--p);
      color: var(--p-ink);
      transition: background 0.5s var(--ease);
    }
    .bank-bar b {
      font-family: var(--font-sans);
      font-size: 14px;
    }
    .lock {
      margin-inline-start: auto;
      opacity: 0.8;
    }
    [dir='rtl'] .flip {
      transform: scaleX(-1);
    }
    .w {
      padding: 14px;
      display: grid;
      gap: 12px;
    }
    .powered {
      font-size: 12px;
      color: #5f6672;
    }
    .w-card {
      padding: 14px;
      border-radius: 14px;
      background: #fff;
      box-shadow: 0 1px 4px rgb(0 0 0 / 0.06);
    }
    .w-title {
      font-weight: 600;
      font-size: 13.5px;
    }
    .w-bar {
      height: 5px;
      margin: 10px 0 12px;
      border-radius: 999px;
      background: #eee;
      overflow: hidden;
    }
    .w-bar i {
      display: block;
      width: 66%;
      height: 100%;
      background: var(--p);
      transition: background 0.5s var(--ease);
    }
    [dir='rtl'] .w-bar i {
      margin-inline-start: auto;
    }
    .w-card ul {
      display: grid;
      gap: 8px;
    }
    .w-card li {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .w-card em {
      margin-inline-start: auto;
      font-style: normal;
      color: #5f6672;
      font-size: 12px;
    }
    .dot {
      width: 18px;
      height: 18px;
      border-radius: 50%;
      border: 1.5px solid #d0d0d0;
      display: grid;
      place-items: center;
      font-size: 12px;
    }
    .dot.on {
      background: var(--p);
      border-color: var(--p);
      color: var(--p-ink);
    }
    .w-btn {
      display: grid;
      place-items: center;
      height: 42px;
      border-radius: 10px;
      background: var(--p);
      color: var(--p-ink);
      font-weight: 600;
      transition: background 0.5s var(--ease);
    }
    .lang {
      position: absolute;
      right: 0;
      bottom: -46px;
      width: 260px;
      justify-content: center;
    }
    .lang[aria-pressed='true'] {
      background: var(--surface);
      color: var(--ink);
      border-color: var(--line);
    }
    @media (max-width: 760px) {
      .demo {
        grid-template-columns: 1fr;
        justify-items: center;
      }
      .side {
        width: 100%;
      }
      .lang {
        position: static;
        margin-top: -28px;
      }
    }
  `,
})
export class BefilerPartnerDemo {
  protected readonly partners = PARTNERS;
  protected readonly id = signal<PartnerId>('hbl');
  protected readonly ur = signal(false);
  protected readonly partner = computed(() => PARTNERS.find((p) => p.id === this.id())!);
  protected readonly t = computed(() => (this.ur() ? TEXT.ur : TEXT.en));
  protected readonly label = signal('Partner');
  protected readonly log = computed(() => {
    const n = this.partner().name;
    return [
      `${n} app opens the widget with a signed handoff`,
      'Widget trades it for a Befiler session',
      'Customer adds income and wealth',
      `Widget asks the ${n} app to take payment`,
      'Payment confirmed, the return joins the queue',
    ];
  });

  protected onKey(e: KeyboardEvent): void {
    const i = PARTNERS.findIndex((p) => p.id === this.id());
    let n = i;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') n = (i + 1) % PARTNERS.length;
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') n = (i - 1 + PARTNERS.length) % PARTNERS.length;
    else return;
    e.preventDefault();
    this.id.set(PARTNERS[n].id);
    const group = (e.currentTarget as HTMLElement).parentElement;
    (group?.children[n] as HTMLElement | undefined)?.focus();
  }
}
