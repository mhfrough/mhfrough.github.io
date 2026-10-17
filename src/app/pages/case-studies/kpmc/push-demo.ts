import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { phosphorBellRinging } from '@ng-icons/phosphor-icons/regular';

/**
 * The notification composer, redrawn as my own mockup: title up to 128 characters, body up to 256, a topic and
 * a send date and time, as in the real form, with a preview of how the push lands on a citizen's phone. The
 * real one sends through Firebase Cloud Messaging; this one sends nothing.
 */
@Component({
  selector: 'mh-kpmc-push',
  imports: [NgIcon],
  viewProviders: [provideIcons({ phosphorBellRinging })],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="push">
      <form class="card card--lift compose" (submit)="$event.preventDefault()" aria-label="Sample push notification">
        <div class="field">
          <label for="kp-title">Title</label>
          <input id="kp-title" class="input" maxlength="128" [value]="title()" (input)="title.set($any($event.target).value)" aria-describedby="kp-title-n" />
          <span class="field__hint mono" id="kp-title-n">{{ title().length }}/128</span>
        </div>
        <div class="field">
          <label for="kp-body">Message</label>
          <textarea id="kp-body" class="textarea" rows="3" maxlength="256" [value]="body()" (input)="body.set($any($event.target).value)" aria-describedby="kp-body-n"></textarea>
          <span class="field__hint mono" id="kp-body-n">{{ body().length }}/256</span>
        </div>
        <div class="row2">
          <div class="field">
            <label for="kp-topic">Topic</label>
            <select id="kp-topic" class="select" [value]="topic()" (change)="topic.set($any($event.target).value)">
              <option value="All app users">All app users</option>
              <option value="Ward 7">Ward 7</option>
              <option value="Water supply">Water supply</option>
            </select>
          </div>
          <div class="field">
            <label for="kp-when">Send at</label>
            <input id="kp-when" class="input mono" value="2023-10-16  09:00" readonly />
          </div>
        </div>
        <p class="mono sample">Real limits, nothing is sent</p>
      </form>

      <div class="phone" aria-hidden="true">
        <div class="screen">
          <p class="time mono">09:00</p>
          <div class="note">
            <div class="note-top">
              <img src="/images/kpmc/kpmc-logo.webp" width="18" height="19" alt="" />
              <span>KPMC</span>
              <span class="ago">now</span>
            </div>
            <b>{{ title() || 'Title' }}</b>
            <p>{{ preview() }}</p>
          </div>
          <p class="topic mono"><ng-icon name="phosphorBellRinging" /> {{ topic() }}</p>
        </div>
      </div>
    </div>
  `,
  styles: `
    :host {
      display: block;
    }
    .push {
      display: grid;
      grid-template-columns: minmax(0, 1fr) 280px;
      gap: 24px;
      align-items: center;
    }
    .compose {
      display: grid;
      gap: 12px;
      padding: 20px 22px;
    }
    .field {
      gap: 5px;
    }
    .field__hint {
      font-size: 12px;
      text-align: right;
    }
    .row2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
    }
    .input,
    .select {
      height: 42px;
      font-size: 14px;
    }
    .sample {
      font-size: 12px;
      color: var(--muted);
    }
    .phone {
      padding: 8px;
      border-radius: 34px;
      background: var(--k-night);
      box-shadow: var(--shadow-lg);
    }
    .screen {
      min-height: 380px;
      padding: 18px 12px;
      border-radius: 27px;
      background: linear-gradient(170deg, #2c4a3b, #10251b);
    }
    .time {
      text-align: center;
      font-size: 34px;
      font-weight: 500;
      color: #fff;
      margin: 18px 0 26px;
    }
    .note {
      padding: 10px 12px;
      border-radius: 16px;
      background: rgb(255 255 255 / 0.9);
      color: #1b2534;

      b {
        display: block;
        font-size: 13px;
        margin-top: 4px;
        overflow-wrap: anywhere;
      }
      p {
        font-size: 12px;
        color: #3d5170;
        overflow-wrap: anywhere;
      }
    }
    .note-top {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      color: #5a6575;

      .ago {
        margin-left: auto;
      }
    }
    .topic {
      display: flex;
      align-items: center;
      gap: 6px;
      justify-content: center;
      margin-top: 14px;
      font-size: 12px;
      color: rgb(255 255 255 / 0.75);
    }
    @media (max-width: 760px) {
      .push {
        grid-template-columns: 1fr;
      }
      .phone {
        max-width: 280px;
        width: 100%;
        justify-self: center;
      }
    }
    @media (max-width: 460px) {
      .row2 {
        grid-template-columns: 1fr;
      }
    }
  `,
})
export class KpmcPushDemo {
  protected readonly title = signal('Water supply restored in Ward 7');
  protected readonly body = signal('The main line on Station Road is repaired. Supply is back to normal from this evening. Thank you for reporting it.');
  protected readonly topic = signal('Ward 7');
  /** Phones cut long pushes short: about two lines. */
  protected readonly preview = computed(() => (this.body().length > 110 ? this.body().slice(0, 107).trimEnd() + '...' : this.body() || 'Message'));
}
