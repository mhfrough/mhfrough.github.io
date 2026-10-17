import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { phosphorCheckCircle, phosphorCircleDashed } from '@ng-icons/phosphor-icons/regular';

/**
 * The account-opening masks, redrawn as my own mockup with the real formats: CNIC 00000-0000000-0, a mobile
 * number that starts with 03, and the IBAN field, which fills and locks the bank's four-letter code once a bank
 * is picked and accepts digits only around it (PK, 2 check digits, code, 16 digits). The real IBAN field is one
 * Angular directive that is both the form control and its validator. The banks here are samples, not real codes.
 */
const BANKS = [
  { code: 'SMPL', name: 'Sample Bank' },
  { code: 'DEMO', name: 'Demo Bank' },
  { code: 'TEST', name: 'Test Bank' },
];

const digits = (v: string, max: number) => v.replace(/\D/g, '').slice(0, max);

function cnicMask(d: string): string {
  return [d.slice(0, 5), d.slice(5, 12), d.slice(12, 13)].filter(Boolean).join('-');
}

function mobileMask(d: string): string {
  return [d.slice(0, 4), d.slice(4, 11)].filter(Boolean).join('-');
}

/** PK + check digits + locked code + account digits, with underscores for what is still to type. */
function ibanMask(d: string, code: string): string {
  return 'PK' + d.slice(0, 2).padEnd(2, '_') + code + d.slice(2).padEnd(16, '_');
}

@Component({
  selector: 'mh-emlaak-masks',
  imports: [NgIcon],
  viewProviders: [provideIcons({ phosphorCheckCircle, phosphorCircleDashed })],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <form class="masks card card--lift" (submit)="$event.preventDefault()" aria-label="Sample account details">
      <div class="field">
        <label for="em-cnic">CNIC number</label>
        <div class="row">
          <input
            id="em-cnic"
            class="input mono"
            inputmode="numeric"
            autocomplete="off"
            placeholder="00000-0000000-0"
            [value]="cnicText()"
            (input)="cnic.set(digits($any($event.target).value, 13)); $any($event.target).value = cnicText()"
            aria-describedby="em-cnic-st"
          />
          <span class="st" id="em-cnic-st" [class.ok]="cnicOk()">
            <ng-icon [name]="cnicOk() ? 'phosphorCheckCircle' : 'phosphorCircleDashed'" aria-hidden="true" />
            {{ cnicOk() ? 'Valid' : cnic().length + ' of 13' }}
          </span>
        </div>
      </div>

      <div class="field">
        <label for="em-mob">Mobile number</label>
        <div class="row">
          <input
            id="em-mob"
            class="input mono"
            inputmode="numeric"
            autocomplete="off"
            placeholder="0300-0000000"
            [value]="mobileText()"
            (input)="mobile.set(digits($any($event.target).value, 11)); $any($event.target).value = mobileText()"
            aria-describedby="em-mob-st"
          />
          <span class="st" id="em-mob-st" [class.ok]="mobileOk()" [class.bad]="mobileBad()">
            <ng-icon [name]="mobileOk() ? 'phosphorCheckCircle' : 'phosphorCircleDashed'" aria-hidden="true" />
            {{ mobileOk() ? 'Valid' : mobileBad() ? 'Starts with 03' : mobile().length + ' of 11' }}
          </span>
        </div>
      </div>

      <div class="field">
        <span class="field__label" id="em-bank">Bank</span>
        <div class="seg banks" role="group" aria-labelledby="em-bank">
          @for (b of banks; track b.code) {
            <button type="button" [attr.aria-pressed]="bank().code === b.code" (click)="bank.set(b)">{{ b.name }}</button>
          }
        </div>
      </div>

      <div class="field">
        <label for="em-iban">IBAN</label>
        <div class="row">
          <input
            id="em-iban"
            class="input mono iban"
            inputmode="numeric"
            autocomplete="off"
            spellcheck="false"
            [value]="ibanText()"
            (input)="onIban($any($event.target))"
            (focus)="caret($any($event.target))"
            (click)="caret($any($event.target))"
            aria-describedby="em-iban-hint em-iban-st"
          />
          <span class="st" id="em-iban-st" [class.ok]="ibanOk()">
            <ng-icon [name]="ibanOk() ? 'phosphorCheckCircle' : 'phosphorCircleDashed'" aria-hidden="true" />
            {{ ibanOk() ? 'Valid' : iban().length + ' of 18' }}
          </span>
        </div>
        <p class="field__hint" id="em-iban-hint">
          Digits only. <span class="mono">{{ bank().code }}</span> is locked to the bank you picked.
        </p>
      </div>
      <p class="mono sample">Sample banks, nothing is sent</p>
    </form>
  `,
  styles: `
    :host {
      display: block;
    }
    .masks {
      display: grid;
      gap: 16px;
      padding: 20px 22px;
    }
    .row {
      display: flex;
      align-items: center;
      gap: 10px;

      .input {
        flex: 1;
        min-width: 0;
        font-size: 14.5px;
        letter-spacing: 0.02em;
      }
    }
    .iban {
      font-size: 13.5px !important;
      letter-spacing: 0.04em;
    }
    .st {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      width: 104px;
      flex-shrink: 0;
      font-size: 12.5px;
      color: var(--muted);

      ng-icon {
        font-size: 16px;
      }
      &.ok {
        color: var(--e-green-text);
      }
      &.bad {
        color: var(--e-orange-text);
      }
    }
    .banks {
      flex-wrap: wrap;
      border-radius: 22px;

      button {
        height: 36px;
        font-size: 13px;
      }
    }
    .sample {
      font-size: 12px;
      color: var(--muted);
    }
    @media (max-width: 460px) {
      .masks {
        padding: 16px;
      }
      .st {
        width: auto;
      }
      .row {
        flex-wrap: wrap;
      }
    }
    /* Smallest phones: the 24-character IBAN takes the full row so all of it shows; the status drops below */
    @media (max-width: 374px) {
      .row .iban {
        flex-basis: 100%;
        font-size: 13px !important;
        letter-spacing: 0;
      }
    }
  `,
})
export class EmlaakMasksDemo {
  protected readonly banks = BANKS;
  protected readonly digits = digits;
  protected readonly cnic = signal('4210112345678');
  protected readonly mobile = signal('0300123');
  protected readonly bank = signal(BANKS[0]);
  protected readonly iban = signal('3600000011');

  protected readonly cnicText = computed(() => cnicMask(this.cnic()));
  protected readonly cnicOk = computed(() => this.cnic().length === 13);
  protected readonly mobileText = computed(() => mobileMask(this.mobile()));
  protected readonly mobileBad = computed(() => this.mobile().length >= 2 && !this.mobile().startsWith('03'));
  protected readonly mobileOk = computed(() => this.mobile().length === 11 && !this.mobileBad());
  protected readonly ibanText = computed(() => ibanMask(this.iban(), this.bank().code));
  protected readonly ibanOk = computed(() => /^PK\d{2}[A-Z]{4}\d{16}$/.test(this.ibanText()));

  /** Digits typed anywhere in the field are kept, in order; letters and underscores are the mask's. */
  protected onIban(el: HTMLInputElement): void {
    const code = this.bank().code;
    const raw = el.value.startsWith('PK') ? el.value.slice(2) : el.value;
    this.iban.set(digits(raw.replace(code, ''), 18));
    el.value = this.ibanText();
    this.caret(el);
  }

  /** Keeps the caret right after the last typed digit, skipping over the locked bank code. */
  protected caret(el: HTMLInputElement): void {
    const n = this.iban().length;
    const pos = n < 2 ? 2 + n : 8 + (n - 2);
    requestAnimationFrame(() => el.setSelectionRange(pos, pos));
  }
}
