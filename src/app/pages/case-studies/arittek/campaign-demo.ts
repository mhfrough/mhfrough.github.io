import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { phosphorEnvelopeSimple, phosphorPaperPlaneTilt, phosphorUsersThree, phosphorX } from '@ng-icons/phosphor-icons/regular';

/**
 * The campaign editor, redrawn as my own mockup. One form, four types, each with only its own fields, and the
 * real save rules: email needs a subject; SMS has no image and stops at 480 characters (three 160-character
 * segments); a popup waits 0 to 120 seconds and shows once, once a day or on every visit; social picks from five
 * platforms. Email and SMS count their recipients from the audience list (all, or one tag) when saved. The
 * audience figures are samples, and nothing is sent.
 */
type Kind = 'email' | 'sms' | 'popup' | 'social';
type Freq = 'once' | 'once_per_day' | 'every_visit';

const KINDS: { v: Kind; t: string }[] = [
  { v: 'email', t: 'Email' },
  { v: 'sms', t: 'SMS' },
  { v: 'popup', t: 'Popup' },
  { v: 'social', t: 'Social' },
];

/** Subscribed contacts with an email address / a phone number, in all and per tag. */
const AUDIENCE: Record<string, { email: number; sms: number }> = {
  all: { email: 1240, sms: 860 },
  banking: { email: 412, sms: 301 },
  events: { email: 188, sms: 140 },
  partners: { email: 96, sms: 52 },
};

const PLATFORMS = [
  { v: 'facebook', t: 'Facebook' },
  { v: 'instagram', t: 'Instagram' },
  { v: 'linkedin', t: 'LinkedIn' },
  { v: 'twitter', t: 'X' },
  { v: 'youtube', t: 'YouTube' },
];

const FREQ: Record<Freq, string> = { once: 'Once', once_per_day: 'Once a day', every_visit: 'Every visit' };

const BODY: Record<Kind, string> = {
  email: 'Join a 30-minute walkthrough of pool management and profit distribution, with time for your questions.',
  sms: 'Arittek: our Islamic banking webinar starts Thursday at 3 pm. Reply STOP to opt out.',
  popup: 'New: a 30-minute walkthrough of Al-Qist. Pick a slot that suits your team.',
  social: 'Thirteen years of building for banks, data teams and toll operators. Here is what we learned.',
};

@Component({
  selector: 'mh-arittek-campaign',
  imports: [NgIcon],
  viewProviders: [provideIcons({ phosphorEnvelopeSimple, phosphorPaperPlaneTilt, phosphorUsersThree, phosphorX })],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="cmp">
      <form class="card card--lift compose" (submit)="$event.preventDefault(); save()" aria-label="Sample campaign">
        <div class="seg kinds" role="group" aria-label="Campaign type">
          @for (k of kinds; track k.v) {
            <button type="button" [attr.aria-pressed]="kind() === k.v" (click)="setKind(k.v)">{{ k.t }}</button>
          }
        </div>

        @if (kind() === 'email') {
          <div class="field">
            <label for="ac-subj">Subject</label>
            <input id="ac-subj" class="input" [value]="subject()" (input)="subject.set($any($event.target).value)" [attr.aria-describedby]="subjectMissing() ? 'ac-subj-e' : null" [attr.aria-invalid]="subjectMissing()" />
            @if (subjectMissing()) {
              <span class="field__error" id="ac-subj-e">Email campaigns need a subject line.</span>
            }
          </div>
        }

        <div class="field">
          <div class="lbl-row">
            <label for="ac-body">Message</label>
            <span class="mono n" id="ac-body-n">
              @if (kind() === 'sms') {
                {{ body().length }}/480, {{ segments() }} segment{{ segments() === 1 ? '' : 's' }}
              } @else {
                {{ body().length }} characters
              }
            </span>
          </div>
          <textarea id="ac-body" class="textarea" rows="3" [attr.maxlength]="kind() === 'sms' ? 480 : null" [value]="body()" (input)="body.set($any($event.target).value)" aria-describedby="ac-body-n"></textarea>
        </div>

        @if (kind() === 'email' || kind() === 'sms') {
          <div class="field">
            <label for="ac-aud">Audience</label>
            <select id="ac-aud" class="select" [value]="tag()" (change)="tag.set($any($event.target).value)" aria-describedby="ac-aud-n">
              <option value="all">Everyone subscribed</option>
              <option value="banking">Tag: banking</option>
              <option value="events">Tag: events</option>
              <option value="partners">Tag: partners</option>
            </select>
            <span class="field__hint" id="ac-aud-n"><ng-icon name="phosphorUsersThree" aria-hidden="true" /> {{ recipients() }} recipients with {{ kind() === 'sms' ? 'a phone number' : 'an email address' }}</span>
          </div>
        }

        @if (kind() === 'popup') {
          <div class="row2">
            <div class="field">
              <label for="ac-delay">Show after <span class="mono">{{ delay() }}s</span></label>
              <input id="ac-delay" type="range" min="0" max="120" step="1" [value]="delay()" (input)="delay.set(+$any($event.target).value)" />
            </div>
            <div class="field">
              <label for="ac-freq">How often</label>
              <select id="ac-freq" class="select" [value]="freq()" (change)="freq.set($any($event.target).value)">
                <option value="once">Once</option>
                <option value="once_per_day">Once a day</option>
                <option value="every_visit">Every visit</option>
              </select>
            </div>
          </div>
        }

        @if (kind() === 'social') {
          <fieldset class="plats">
            <legend>Platforms</legend>
            <div class="chips">
              @for (p of platforms; track p.v) {
                <button type="button" class="chip" [attr.aria-pressed]="picked().includes(p.v)" (click)="toggle(p.v)">{{ p.t }}</button>
              }
            </div>
          </fieldset>
        }

        <div class="foot">
          <p class="mono note" aria-live="polite">{{ note() }}</p>
          <button type="submit" class="btn btn-solid btn-sm">Save draft</button>
        </div>
      </form>

      <!-- Preview: a visual duplicate of the form above, hidden from assistive tech. -->
      <div class="pv" aria-hidden="true">
        @switch (kind()) {
          @case ('email') {
            <div class="mail">
              <div class="mail-top">
                <span class="av"><img src="/images/arittek/arittek-mark.svg" width="22" height="11" alt="" /></span>
                <div>
                  <b>Arittek</b>
                  <small>to {{ tag() === 'all' ? 'subscribers' : tag() }}</small>
                </div>
              </div>
              <p class="mail-s">{{ subject() || 'No subject' }}</p>
              <p class="mail-b">{{ body() || 'Message' }}</p>
              <span class="mail-cta">Book a seat</span>
            </div>
          }
          @case ('sms') {
            <div class="phone">
              <p class="ph-from mono">ARITTEK</p>
              <p class="bubble">{{ body() || 'Message' }}</p>
              <p class="ph-meta mono">{{ segments() }} x 160 characters</p>
            </div>
          }
          @case ('popup') {
            <div class="site">
              <div class="site-bar"><i></i><i></i><i></i></div>
              <div class="site-page">
                <span class="ln w60"></span><span class="ln w80"></span><span class="ln w40"></span>
                <div class="pop">
                  <ng-icon name="phosphorX" class="pop-x" />
                  <p>{{ body() || 'Message' }}</p>
                  <span class="mail-cta">Pick a slot</span>
                </div>
              </div>
              <p class="site-meta mono">After {{ delay() }}s, {{ freqLabel().toLowerCase() }}</p>
            </div>
          }
          @case ('social') {
            <div class="post">
              <div class="mail-top">
                <span class="av"><img src="/images/arittek/arittek-mark.svg" width="22" height="11" alt="" /></span>
                <div>
                  <b>Arittek</b>
                  <small>Sample post</small>
                </div>
              </div>
              <p class="mail-b">{{ body() || 'Message' }}</p>
              <div class="post-img"></div>
              <div class="badges">
                @for (p of platforms; track p.v) {
                  @if (picked().includes(p.v)) {
                    <span class="tag">{{ p.t }}</span>
                  }
                }
              </div>
            </div>
          }
        }
      </div>
    </div>
  `,
  styles: `
    :host {
      display: block;
    }
    .cmp {
      display: grid;
      grid-template-columns: minmax(0, 1fr) minmax(0, 0.85fr);
      gap: 24px;
      align-items: center;
    }
    .compose {
      display: grid;
      gap: 12px;
      padding: 20px 22px;
    }
    .kinds {
      justify-self: start;
      max-width: 100%;
      overflow-x: auto;

      button {
        height: 32px;
        font-size: 13.5px;
      }
    }
    .field {
      gap: 5px;
    }
    .input,
    .select {
      height: 42px;
      font-size: 14px;
    }
    .textarea {
      min-height: 78px;
      font-size: 14px;
    }
    .lbl-row {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      gap: 8px;

      .n {
        font-size: 12px;
        color: var(--muted);
      }
    }
    .field__hint {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 12.5px;
      color: var(--ink-2);
    }
    .field__error {
      font-size: 12.5px;
      color: var(--a-red-text);
    }
    .row2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      align-items: end;
    }
    input[type='range'] {
      width: 100%;
      height: 42px;
      accent-color: var(--a-navy);
    }
    .plats {
      border: 0;
      margin: 0;
      padding: 0;

      legend {
        font-size: 13px;
        font-weight: 500;
        color: var(--ink-2);
        margin-bottom: 6px;
      }
    }
    .chips {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;

      .chip {
        height: 36px;
      }
    }
    .foot {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;

      .note {
        font-size: 12px;
        color: var(--muted);
      }
      .btn {
        flex-shrink: 0;
        min-height: 44px;
      }
    }

    // ---- previews ----
    .pv {
      display: grid;
      place-items: center;
      min-height: 340px;
      padding: 24px;
      border-radius: var(--r-card);
      background: linear-gradient(160deg, var(--a-night-2), var(--a-night));
    }
    .mail,
    .post {
      width: 100%;
      max-width: 340px;
      padding: 16px;
      border-radius: 14px;
      background: var(--surface);
      color: var(--a-navy);
      box-shadow: var(--shadow-lg);
    }
    .mail-top {
      display: flex;
      align-items: center;
      gap: 10px;
      padding-bottom: 10px;
      border-bottom: 1px solid var(--line);

      b {
        display: block;
        font-size: 13px;
      }
      small {
        font-size: 12px;
        color: var(--muted);
      }
    }
    .av {
      width: 34px;
      height: 34px;
      display: grid;
      place-items: center;
      border-radius: 50%;
      background: var(--bg);
      border: 1px solid var(--line);
    }
    .mail-s {
      margin-top: 10px;
      font-size: 14px;
      font-weight: 600;
      overflow-wrap: anywhere;
    }
    .mail-b {
      margin-top: 6px;
      font-size: 12.5px;
      color: var(--ink-2);
      overflow-wrap: anywhere;
    }
    .mail-cta {
      display: inline-block;
      margin-top: 12px;
      padding: 6px 14px;
      border-radius: 999px;
      background: var(--a-navy);
      color: var(--cta-ink);
      font-size: 12px;
      font-weight: 500;
    }
    .phone {
      width: 100%;
      max-width: 260px;
      min-height: 280px;
      padding: 18px 14px;
      border-radius: 28px;
      background: var(--surface-2);
      border: 7px solid var(--a-night);
    }
    .ph-from {
      text-align: center;
      font-size: 12px;
      color: var(--muted);
      margin-bottom: 12px;
    }
    .bubble {
      padding: 10px 12px;
      border-radius: 16px 16px 16px 4px;
      background: var(--surface);
      color: var(--a-navy);
      font-size: 12.5px;
      overflow-wrap: anywhere;
    }
    .ph-meta {
      margin-top: 8px;
      font-size: 12px;
      color: var(--muted);
    }
    .site {
      width: 100%;
      max-width: 360px;
    }
    .site-bar {
      display: flex;
      gap: 5px;
      padding: 8px 10px;
      border-radius: 10px 10px 0 0;
      background: var(--line);

      i {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: var(--line-strong);
      }
    }
    .site-page {
      position: relative;
      display: grid;
      gap: 8px;
      align-content: start;
      min-height: 230px;
      padding: 16px;
      border-radius: 0 0 10px 10px;
      background: var(--bg);

      .ln {
        height: 8px;
        border-radius: 4px;
        background: var(--line);
      }
      .w60 {
        width: 60%;
      }
      .w80 {
        width: 80%;
      }
      .w40 {
        width: 40%;
      }
    }
    .pop {
      position: absolute;
      inset: auto 16px 16px;
      padding: 14px;
      border-radius: 12px;
      background: var(--surface);
      color: var(--a-navy);
      box-shadow: 0 18px 40px -14px rgb(14 31 58 / 0.45);
      border: 1px solid var(--a-gold);

      p {
        font-size: 12.5px;
        padding-right: 18px;
        overflow-wrap: anywhere;
      }
    }
    .pop-x {
      position: absolute;
      top: 10px;
      right: 10px;
      font-size: 13px;
      color: var(--muted);
    }
    .site-meta {
      margin-top: 10px;
      text-align: center;
      font-size: 12px;
      color: var(--n-muted);
    }
    .post-img {
      height: 90px;
      margin-top: 10px;
      border-radius: 10px;
      background: linear-gradient(135deg, var(--a-navy), var(--a-forest) 60%, var(--a-gold));
    }
    .badges {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
      min-height: 24px;
      margin-top: 10px;

      .tag {
        background: var(--a-gold-soft);
        color: var(--a-gold-text);
      }
    }
    @media (max-width: 860px) {
      .cmp {
        grid-template-columns: 1fr;
      }
    }
    @media (max-width: 460px) {
      .compose {
        padding: 16px;
      }
      .row2 {
        grid-template-columns: 1fr;
      }
      .foot {
        flex-wrap: wrap;
      }
      .pv {
        min-height: 300px;
        padding: 16px;
      }
    }
  `,
})
export class ArittekCampaignDemo {
  protected readonly kinds = KINDS;
  protected readonly platforms = PLATFORMS;
  protected readonly kind = signal<Kind>('email');
  protected readonly subject = signal('Islamic banking webinar, Thursday 3 pm');
  protected readonly body = signal(BODY.email);
  protected readonly tag = signal('banking');
  protected readonly delay = signal(3);
  protected readonly freq = signal<Freq>('once_per_day');
  protected readonly picked = signal<string[]>(['linkedin', 'facebook']);
  protected readonly note = signal('Sample audience, nothing is sent.');
  private readonly tried = signal(false);

  protected readonly segments = computed(() => Math.max(1, Math.ceil(this.body().length / 160)));
  protected readonly recipients = computed(() => {
    const a = AUDIENCE[this.tag()] ?? AUDIENCE['all'];
    return (this.kind() === 'sms' ? a.sms : a.email).toLocaleString('en-US');
  });
  protected readonly subjectMissing = computed(() => this.tried() && this.kind() === 'email' && !this.subject().trim());
  protected readonly freqLabel = computed(() => FREQ[this.freq()]);

  protected setKind(k: Kind): void {
    this.kind.set(k);
    this.body.set(BODY[k]);
    this.tried.set(false);
    this.note.set('Sample audience, nothing is sent.');
  }

  protected toggle(p: string): void {
    this.picked.update((l) => (l.includes(p) ? l.filter((x) => x !== p) : [...l, p]));
  }

  protected save(): void {
    this.tried.set(true);
    const k = this.kind();
    if (!this.body().trim()) return this.note.set('Campaign content is required.');
    if (k === 'email' && !this.subject().trim()) return this.note.set('Not saved: the subject is missing.');
    if (k === 'social' && !this.picked().length) return this.note.set('Saved, but no platform is picked yet.');
    const what = {
      email: `Draft saved for ${this.recipients()} recipients.`,
      sms: `Draft saved: ${this.segments()} segment${this.segments() === 1 ? '' : 's'} to ${this.recipients()} numbers.`,
      popup: `Draft saved. Goes on the site after ${this.delay()}s, ${this.freqLabel().toLowerCase()}.`,
      social: `Draft saved for ${this.picked().length} platform${this.picked().length === 1 ? '' : 's'}.`,
    }[k];
    this.note.set(what);
  }
}
