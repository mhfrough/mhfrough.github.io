import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { phosphorEnvelopeSimple, phosphorWhatsappLogo } from '@ng-icons/phosphor-icons/regular';

/**
 * Hero mockup: one call-out request, two businesses (my own redraw, not a screenshot). SOS24 takes a form and
 * sends it as a plain-text email in the exact layout the real form builds; AK shows its fixed call-out price for
 * the time of day and sends people to WhatsApp. Trades, services and prices are the real ones from the two
 * sites; names and postcodes typed here go nowhere.
 */
type Biz = 'sos' | 'ak';

const SOS_TRADES = ['Plumber', 'Gas engineer', 'Electrician', 'Solar Power', 'Heat pump', 'Alarms', 'TV aerial services', 'Locksmith', 'Fridge and AC', 'Electric Car Charger (EV)'];
const AK_SERVICES = ['Plumber', 'Gas Engineer', 'Electrician', 'Boiler Service', 'Heat Pump', 'Unvented to Combi Boiler', 'Cylinder Installation', 'Range Cooker Installation', 'Landlord Gas Safety Certificate', 'Gas Hob and Cooker Installation'];
const BANDS = [
  { id: 'day', label: '9 to 5', price: 79 },
  { id: 'eve', label: '5 to 10 pm', price: 119 },
  { id: 'night', label: '10 pm to 6 am', price: 179 },
];
const UK_POSTCODE = /^[A-Z]{1,2}\d[A-Z\d]? ?\d[A-Z]{2}$/i;

@Component({
  selector: 'mh-trades-callout',
  imports: [NgIcon],
  viewProviders: [provideIcons({ phosphorEnvelopeSimple, phosphorWhatsappLogo })],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="co card card--lift" [attr.data-biz]="biz()">
      <header class="co-head">
        <img [src]="biz() === 'sos' ? '/images/trades/sos24-logo.webp' : '/images/trades/ak-logo.webp'" alt="" [width]="biz() === 'sos' ? 99 : 20" height="29" />
        <div>
          <h2>{{ biz() === 'sos' ? 'SOS24' : 'AK Heating and Plumbing' }}</h2>
          <p>{{ biz() === 'sos' ? 'Emergency call out, repairs, maintenance' : 'Response in 30 to 60 minutes' }}</p>
        </div>
        <div class="seg" role="group" aria-label="Business">
          <button type="button" [attr.aria-pressed]="biz() === 'sos'" (click)="setBiz('sos')">SOS24</button>
          <button type="button" [attr.aria-pressed]="biz() === 'ak'" (click)="setBiz('ak')">AK</button>
        </div>
      </header>

      <div class="field">
        <label for="tr-svc">{{ biz() === 'sos' ? 'Trade' : 'Service' }}</label>
        <select id="tr-svc" class="select" (change)="service.set($any($event.target).value)">
          @for (s of services(); track s) {
            <option [value]="s" [selected]="s === service()">{{ s }}</option>
          }
        </select>
      </div>

      <div class="row2">
        <div class="field">
          <label for="tr-name">Name</label>
          <input id="tr-name" class="input" autocomplete="off" [value]="name()" (input)="name.set($any($event.target).value)" />
        </div>
        <div class="field">
          <label for="tr-pc">Postcode</label>
          <input
            id="tr-pc"
            class="input mono"
            autocomplete="off"
            [value]="postcode()"
            (input)="postcode.set($any($event.target).value.toUpperCase())"
            [attr.aria-describedby]="pcBad() ? 'tr-pc-err' : null"
          />
        </div>
      </div>
      @if (pcBad()) {
        <p class="err" id="tr-pc-err">That doesn’t look like a UK postcode.</p>
      }

      @if (biz() === 'ak') {
        <div class="field">
          <span class="field__label" id="tr-when">When</span>
          <div class="seg bands" role="group" aria-labelledby="tr-when">
            @for (b of bands; track b.id) {
              <button type="button" [attr.aria-pressed]="band() === b.id" (click)="band.set(b.id)">{{ b.label }}</button>
            }
            <button type="button" [attr.aria-pressed]="band() === 'wait'" (click)="band.set('wait')">Can wait</button>
          </div>
        </div>
        <div class="price">
          <span>{{ band() === 'wait' ? 'Non-urgent call-out' : 'Emergency call-out' }}</span>
          <b class="mono" aria-live="polite">£{{ price() }}</b>
        </div>
        <div class="go">
          <button type="button" class="btn wa" [disabled]="!ready()">
            <ng-icon name="phosphorWhatsappLogo" aria-hidden="true" /> Contact us on WhatsApp
          </button>
          <span class="mono sample">Real prices, demo only</span>
        </div>
      } @else {
        <p class="mono label">The email the owner receives</p>
        <pre class="mail" tabindex="0" role="region" aria-label="The email the owner receives" aria-live="polite">{{ email() }}</pre>
        <div class="go">
          <button type="button" class="btn btn-solid" [disabled]="!ready()">
            <ng-icon name="phosphorEnvelopeSimple" aria-hidden="true" /> Submit
          </button>
          <span class="mono sample">Real format, nothing is sent</span>
        </div>
      }
    </div>
  `,
  styles: `
    :host {
      display: block;
    }
    .co {
      display: grid;
      gap: 12px;
      padding: 18px;
    }
    .co-head {
      display: flex;
      align-items: center;
      gap: 12px;
      padding-bottom: 12px;
      border-bottom: 1px solid var(--line);

      img {
        height: 29px;
        width: auto;
      }
      div:first-of-type {
        flex: 1;
        min-width: 0;
      }
      h2 {
        font-size: 15px;
      }
      p {
        font-size: 12px;
        color: var(--muted);
      }
      .seg button {
        height: 30px;
        padding: 0 12px;
        font-size: 13px;
      }
    }
    .row2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
    }
    .field {
      gap: 5px;

      label,
      .field__label {
        font-size: 12.5px;
      }
    }
    .input,
    .select {
      height: 42px;
      font-size: 14px;
    }
    .err {
      margin-top: -4px;
      font-size: 12.5px;
      color: var(--t-red-text);
    }
    .bands {
      flex-wrap: wrap;
      border-radius: 22px;

      button {
        height: 32px;
        padding: 0 11px;
        font-size: 12.5px;
      }
    }
    .price {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      padding: 12px 14px;
      border-radius: var(--r-inner);
      background: var(--t-amber-soft);

      span {
        font-size: 13px;
        color: var(--t-amber-text);
        font-weight: 500;
      }
      b {
        font-size: 24px;
        font-weight: 600;
        color: var(--ink);
        letter-spacing: -0.02em;
      }
    }
    .label {
      font-size: 12px;
      color: var(--muted);
      margin-bottom: -6px;
    }
    .mail {
      margin: 0;
      padding: 12px 14px;
      max-height: 196px;
      overflow: auto;
      border-radius: var(--r-inner);
      background: var(--t-night);
      color: var(--n-ink);
      font-family: var(--font-mono);
      font-size: 12px;
      line-height: 1.6;
      white-space: pre-wrap;
      overflow-wrap: anywhere;

      // It scrolls when a long message is typed, so it takes keyboard focus like any scroll region
      &:focus-visible {
        outline: 2px solid var(--focus);
        outline-offset: 2px;
      }
    }
    .go {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;

      .btn[disabled] {
        opacity: 0.45;
        cursor: not-allowed;
      }
    }
    .wa {
      background: var(--t-amber);
      color: var(--t-navy);

      &:hover {
        background: #ffb53f;
      }
    }
    .sample {
      font-size: 12px;
      color: var(--muted);
      text-align: right;
    }
    @media (max-width: 460px) {
      .co {
        padding: 14px;
      }
      .co-head p {
        display: none;
      }
      .row2 {
        grid-template-columns: 1fr;
      }
    }
  `,
})
export class TradesCalloutDemo {
  protected readonly bands = BANDS;
  protected readonly biz = signal<Biz>('sos');
  protected readonly service = signal(SOS_TRADES[0]);
  protected readonly name = signal('Sam Taylor');
  protected readonly postcode = signal('NG7 3AB');
  protected readonly band = signal('eve');

  protected readonly services = computed(() => (this.biz() === 'sos' ? SOS_TRADES : AK_SERVICES));
  protected readonly pcBad = computed(() => this.postcode().trim().length > 0 && !UK_POSTCODE.test(this.postcode().trim()));
  protected readonly ready = computed(() => this.name().trim().length > 0 && !this.pcBad());
  protected readonly price = computed(() => (this.band() === 'wait' ? 49 : BANDS.find((b) => b.id === this.band())!.price));

  /** The body the real SOS24 form builds (email and phone left out of the demo). */
  protected readonly email = computed(
    () => `Hello,
I would like to get in touch with you regarding the following:
- Name: ${this.name().trim() || 'Not provided'}
- Inquiry: ${this.service()}
- Postal Code: ${this.postcode().trim() || 'Not provided'}

Message:
No message provided

Thank you.`,
  );

  protected setBiz(b: Biz): void {
    this.biz.set(b);
    this.service.set(b === 'sos' ? SOS_TRADES[0] : AK_SERVICES[3]);
  }
}
