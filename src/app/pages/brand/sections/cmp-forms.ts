import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { phosphorWarningCircle } from '@ng-icons/phosphor-icons/regular';
import { Spec } from './spec';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Components, part 3 (deferred): field anatomy with a working validation state.
 * The error is linked to its input with aria-describedby and flips aria-invalid; hint and error share the slot.
 */
@Component({
  selector: 'mh-brand-cmp-forms',
  imports: [Spec, NgIcon],
  viewProviders: [provideIcons({ phosphorWarningCircle })],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="bp-grid">
      <mh-spec name="Field anatomy" cls=".field > .field__label + .input + .field__hint | .field__error" layout="row roomy" class="span-all anat">
        <div class="field">
          <label class="field__label" for="bp-email">Your email</label>
          <input
            id="bp-email"
            class="input"
            type="email"
            autocomplete="email"
            placeholder="name@company.com"
            [value]="email()"
            [attr.aria-invalid]="invalid() ? 'true' : null"
            [attr.aria-describedby]="invalid() ? 'bp-email-error' : 'bp-email-hint'"
            (input)="email.set($any($event.target).value)"
            (blur)="touched.set(true)"
          />
          @if (invalid()) {
            <p class="field__error" id="bp-email-error"><ng-icon name="phosphorWarningCircle" aria-hidden="true" />Enter an email like name&#64;company.com.</p>
          } @else {
            <p class="field__hint" id="bp-email-hint">Only used to reply. Type something and leave the field.</p>
          }
        </div>
        <div class="field">
          <label class="field__label" for="bp-site">Website</label>
          <input id="bp-site" class="input" type="url" value="mhfrough" aria-invalid="true" aria-describedby="bp-site-error" />
          <p class="field__error" id="bp-site-error"><ng-icon name="phosphorWarningCircle" aria-hidden="true" />Add the full address, starting with https://</p>
        </div>
      </mh-spec>

      <mh-spec name="Select" cls=".field > .select" layout="col">
        <div class="field">
          <label class="field__label" for="bp-kind">Project type</label>
          <select id="bp-kind" class="select">
            <option>Angular app from zero</option>
            <option>Micro-frontend split</option>
            <option>Accessibility pass</option>
            <option>Architecture review</option>
          </select>
          <p class="field__hint">Native select, pill shaped, custom caret.</p>
        </div>
      </mh-spec>


      <mh-spec name="Check" cls=".check > input[type=checkbox]" layout="col">
        <label class="check">
          <input type="checkbox" checked />
          <span>Keep me posted about new case studies. One email a quarter, at most.</span>
        </label>
        <label class="check">
          <input type="checkbox" />
          <span>I have read the privacy notice.</span>
        </label>
      </mh-spec>
      <mh-spec name="Textarea" cls=".field > .textarea" layout="col" class="span-all">
        <div class="field">
          <label class="field__label" for="bp-msg">Message</label>
          <textarea id="bp-msg" class="textarea" rows="4" placeholder="What are you building?"></textarea>
        </div>
      </mh-spec>
    </div>
  `,
  styles: `
    .field {
      width: 100%;
    }
    .anat .field {
      flex: 1 1 260px;
      width: auto;
      align-self: start;
    }
    .check + .check {
      margin-top: 4px;
    }
  `,
})
export class BrandCmpForms {
  protected readonly email = signal('');
  protected readonly touched = signal(false);
  protected readonly invalid = computed(() => this.touched() && this.email().length > 0 && !EMAIL.test(this.email()));
}
