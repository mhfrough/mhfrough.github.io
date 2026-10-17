import { ChangeDetectionStrategy, Component, afterNextRender, computed, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { phosphorArrowLeft, phosphorArrowRight, phosphorArrowsClockwise } from '@ng-icons/phosphor-icons/regular';

/** Lanes: 0 = the phone, 1 = the three public brokers, 2 = the laptop. */
type Lane = 0 | 1 | 2;

interface Msg {
  from: Lane;
  to: Lane;
  label: string;
  direct?: boolean;
}

interface Step {
  t: string;
  s: string;
  msgs: Msg[];
}

const LANES = ['Calm Heron', '3 brokers', 'Brisk Otter'];
const PHONE_ID = 'k3vq8n2xa7pd5mfh';
const LAPTOP_ID = 'q7wz4tcjr9hb2ens';
const OTHER_IP = '198.51.100.7';
const IPV4 = /^\d{1,3}(\.\d{1,3}){3}$/;

// Server render shows the real values for the default address (worked out with the same recipe as net.js);
// the browser recomputes them with Web Crypto whenever the address changes.
const DEFAULT_IP = '203.0.113.24';
const DEFAULT_TOPIC = 'flick/v1/832751743c7382b1557d649b36477a0420d0d3be';
const DEFAULT_KEY = 'df304e6594df673b5871cd9ceb49e40f0512737341af81f68055eaee5685cb13';

const STEPS: Step[] = [
  {
    t: 'Find the network',
    s: 'Each device asks api.ipify.org (or ipv4.icanhazip.com) for its public IPv4 address. Devices behind the same router get the same answer, so it becomes the meeting point.',
    msgs: [],
  },
  {
    t: 'Hash it into a room',
    s: 'The address is never sent anywhere. Two SHA-256 hashes of it give the topic name and the AES-GCM key, so only devices that know the address can find the room or read it. Each device subscribes to the room and to its own sub-topic.',
    msgs: [
      { from: 0, to: 1, label: 'SUBSCRIBE room, room/k3vq…' },
      { from: 2, to: 1, label: 'SUBSCRIBE room, room/q7wz…' },
    ],
  },
  {
    t: 'Announce, sealed',
    s: 'Every 6 seconds each device publishes a “here” message to all three brokers. It is encrypted in the page first, with a fresh 12-byte IV each time, so a broker sees only random bytes on a hashed topic.',
    msgs: [
      { from: 0, to: 1, label: 'PUBLISH here (sealed)' },
      { from: 1, to: 2, label: 'here (sealed)' },
    ],
  },
  {
    t: 'The lower id dials',
    s: 'If both sides dialled at once, the offers would collide. So only the device with the lower id dials; the other answers its “here” with a direct one on the dialler’s own sub-topic, so it is noticed straight away.',
    msgs: [
      { from: 2, to: 1, label: 'here → room/k3vq…' },
      { from: 1, to: 0, label: 'here (direct)' },
    ],
  },
  {
    t: 'Offer, answer, candidates',
    s: 'The WebRTC handshake travels the same way: an SDP offer, an answer and ICE candidates, each sealed, each on the receiver’s sub-topic. STUN servers from Google and Cloudflare help each side find its public route.',
    msgs: [
      { from: 0, to: 1, label: 'sdp offer' },
      { from: 1, to: 2, label: 'sdp offer' },
      { from: 2, to: 1, label: 'sdp answer' },
      { from: 1, to: 0, label: 'sdp answer' },
      { from: 0, to: 2, label: 'ice candidates, both ways' },
    ],
  },
  {
    t: 'A direct channel',
    s: 'An ordered RTCDataChannel named “flick” opens, encrypted by DTLS. The devices say hello with their names, and from here files and text go browser to browser. The brokers are out of the path.',
    msgs: [
      { from: 0, to: 2, label: 'data channel open', direct: true },
      { from: 0, to: 2, label: 'hello: Calm Heron, phone', direct: true },
      { from: 2, to: 0, label: 'hello: Brisk Otter, laptop', direct: true },
    ],
  },
];

const enc = new TextEncoder();
const dec = new TextDecoder();
const hex = (b: Uint8Array): string => Array.from(b, (x) => x.toString(16).padStart(2, '0')).join('');

/**
 * Step-through of how two Flick devices meet (net.js): public IP, hashed room, sealed announcements, the lower id
 * dialling, the WebRTC handshake over the brokers, then the direct data channel. The topic, key and sealed envelope
 * are computed in the browser with Web Crypto, with the same recipe as Flick (SHA-256 of "flick-topic:" and
 * "flick-key:" plus the room secret, AES-GCM with a random 12-byte IV in front). A second, made-up network shows that
 * a device elsewhere gets a different room and cannot open the envelope. Addresses are from the documentation ranges.
 */
@Component({
  selector: 'mh-fl-handshake',
  imports: [NgIcon],
  viewProviders: [provideIcons({ phosphorArrowLeft, phosphorArrowRight, phosphorArrowsClockwise })],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="hs">
      <ol class="steps" role="list" aria-label="Handshake steps">
        @for (s of steps; track s.t; let i = $index) {
          <li>
            <button type="button" class="step" [attr.aria-current]="i === at() ? 'step' : null" [class.past]="i < at()" (click)="go(i)">
              <span class="n mono" aria-hidden="true">{{ i + 1 }}</span>
              <span>{{ s.t }}</span>
            </button>
          </li>
        }
      </ol>

      <div class="stage card">
        <div class="stage-head">
          <p class="mono count">Step {{ at() + 1 }} of {{ steps.length }}</p>
          <h3>{{ step().t }}</h3>
          <p class="desc">{{ step().s }}</p>
        </div>

        @if (step().msgs.length) {
          <figure class="seq">
            <figcaption class="sr-only">Messages in this step</figcaption>
            <div class="lanes" aria-hidden="true">
              @for (l of lanes; track l; let i = $index) {
                <span class="mono" [class.broker]="i === 1">{{ l }}</span>
              }
            </div>
            <ol class="msgs" role="list">
              @for (m of step().msgs; track $index) {
                <li class="m">
                  <div class="arrow" [class.left]="m.to < m.from" [class.direct]="m.direct" [style.grid-column]="span(m.from, m.to)">
                    <span class="mono">{{ m.label }}</span>
                    <i aria-hidden="true"></i>
                  </div>
                  <span class="sr-only">{{ lanes[m.from] }} to {{ lanes[m.to] }}: {{ m.label }}</span>
                </li>
              }
            </ol>
          </figure>
        }

        <div class="detail">
          @switch (at()) {
            @case (0) {
              <div class="field">
                <label class="field__label" for="fl-ip">Example public address</label>
                <input id="fl-ip" class="input mono" [value]="ip()" (input)="setIp($any($event.target).value)" inputmode="decimal" autocomplete="off" spellcheck="false" aria-describedby="fl-ip-hint" />
                <p id="fl-ip-hint" class="field__hint">An address from the documentation range. Try your own idea of one; nothing is sent.</p>
              </div>
              <ul class="kv" role="list">
                <li><span class="k">Calm Heron asks ipify</span><span class="v mono">{{ ipOk() ? ip() : 'not an IPv4 address' }}</span></li>
                <li><span class="k">Brisk Otter asks ipify</span><span class="v mono">{{ ipOk() ? ip() + ', same router' : '' }}</span></li>
                <li><span class="k">Room secret</span><span class="v mono">network:{{ roomIp() }}</span></li>
              </ul>
            }
            @case (1) {
              <ul class="kv" role="list">
                <li><span class="k">Topic, SHA-256 of “flick-topic:network:{{ roomIp() }}”</span><span class="v mono hash">{{ topic() }}</span></li>
                <li><span class="k">AES-GCM key, SHA-256 of “flick-key:network:{{ roomIp() }}”</span><span class="v mono hash">{{ key().slice(0, 32) }}…</span></li>
                <li><span class="k">Another network, {{ other }}</span><span class="v mono hash">{{ otherTopic() }}</span></li>
              </ul>
              <p class="foot-note">Different address, different room: a device on another network never hears this one.</p>
            }
            @case (2) {
              <ul class="kv" role="list">
                <li><span class="k">What Calm Heron means</span><span class="v mono">{{ plain() }}</span></li>
                <li>
                  <span class="k">What the brokers carry, {{ sealedLen() }} bytes</span>
                  <span class="v mono hash">
                    @if (sealed()) {
                      <b class="iv" title="12-byte IV">{{ sealed().slice(0, 24) }}</b>{{ sealed().slice(24, 120) }}…
                    } @else {
                      {{ cryptoOff() ? 'Web Crypto runs only on secure (https) pages' : 'sealing in your browser…' }}
                    }
                  </span>
                </li>
                <li><span class="k">Opened with the room key</span><span class="v mono ok">{{ opened() }}</span></li>
                <li><span class="k">Opened with the {{ other }} key</span><span class="v mono bad">{{ openedOther() }}</span></li>
              </ul>
              <button type="button" class="btn btn-ghost btn-sm" (click)="reseal()">
                <ng-icon name="phosphorArrowsClockwise" aria-hidden="true" />Seal again
              </button>
              <p class="sr-only" aria-live="polite">{{ sealedNote() }}</p>
            }
            @case (3) {
              <ul class="kv" role="list">
                <li><span class="k">Calm Heron’s id</span><span class="v mono">{{ phoneId }}</span></li>
                <li><span class="k">Brisk Otter’s id</span><span class="v mono">{{ laptopId }}</span></li>
                <li><span class="k">“k” sorts before “q”</span><span class="v mono ok">Calm Heron dials</span></li>
              </ul>
            }
            @case (4) {
              <ul class="kv" role="list">
                <li><span class="k">Candidates that arrive before the offer</span><span class="v">Queued, the last 50 kept</span></li>
                <li><span class="k">No channel after 25 seconds</span><span class="v">The attempt is dropped</span></li>
                <li><span class="k">Strict corporate NATs</span><span class="v">Need a TURN relay; this build has none</span></li>
              </ul>
            }
            @case (5) {
              <ul class="kv" role="list">
                <li><span class="k">Channel</span><span class="v mono">flick, ordered, DTLS</span></li>
                <li><span class="k">Brokers now see</span><span class="v">Only the “here” every 6 seconds, for devices that join later</span></li>
                <li><span class="k">Files and text</span><span class="v">Device to device, never through a server</span></li>
              </ul>
            }
          }
        </div>

        <div class="nav">
          <button type="button" class="btn btn-ghost btn-sm" (click)="go(at() - 1)" [disabled]="at() === 0">
            <ng-icon name="phosphorArrowLeft" aria-hidden="true" />Back
          </button>
          <button type="button" class="btn btn-solid btn-sm" (click)="go(at() + 1)" [disabled]="at() === steps.length - 1">
            Next<ng-icon name="phosphorArrowRight" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  `,
  styles: `
    :host {
      display: block;
      min-width: 0;
    }
    p,
    h3 {
      margin: 0;
    }
    .hs {
      display: grid;
      grid-template-columns: minmax(0, 0.42fr) minmax(0, 1fr);
      gap: 16px;
      align-items: start;
    }
    .steps {
      display: grid;
      gap: 6px;
      margin: 0;
      padding: 0;
      list-style: none;
    }
    .step {
      width: 100%;
      min-height: 48px;
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 6px 14px 6px 6px;
      border-radius: 999px;
      border: 1px solid var(--line);
      background: var(--surface);
      color: var(--ink-2);
      font-size: 14px;
      font-weight: 500;
      text-align: left;
      cursor: pointer;
      transition:
        background var(--t-base) var(--ease),
        border-color var(--t-base) var(--ease),
        color var(--t-base) var(--ease);

      &:hover {
        color: var(--ink);
        border-color: var(--line-strong);
      }

      &[aria-current='step'] {
        background: var(--fl-lime, var(--cta));
        border-color: var(--fl-lime, var(--cta));
        color: var(--fl-lime-ink, var(--cta-ink));
      }
    }
    .n {
      flex: none;
      width: 34px;
      height: 34px;
      border-radius: 50%;
      display: grid;
      place-items: center;
      background: var(--surface-2);
      font-size: 12.5px;
      color: var(--ink-2);

      .past & {
        color: var(--fl-lime, var(--ink));
      }

      [aria-current='step'] & {
        background: var(--fl-lime-ink, var(--bg));
        color: var(--fl-lime, var(--ink));
      }
    }

    .stage {
      display: grid;
      gap: 18px;
      min-width: 0;
    }
    .count {
      font-size: 12px;
      color: var(--fl-lime, var(--muted));
    }
    h3 {
      margin: 6px 0 6px;
      font-size: 1.15rem;
      letter-spacing: -0.02em;
    }
    .desc {
      font-size: 14.5px;
      color: var(--ink-2);
      max-width: 64ch;
    }

    // Sequence: three lanes on a six-column grid; lane n is centred on column line 2n + 2.
    .seq {
      margin: 0;
      padding: 14px 0 6px;
      border-radius: var(--r-inner);
      background-color: var(--bg-2, var(--bg));
      background-image:
        linear-gradient(var(--line-strong), var(--line-strong)),
        linear-gradient(var(--line-strong), var(--line-strong)),
        linear-gradient(var(--line-strong), var(--line-strong));
      background-size: 1px calc(100% - 44px);
      background-repeat: no-repeat;
      background-position:
        calc(100% / 6) 40px,
        50% 40px,
        calc(500% / 6) 40px;
    }
    .lanes {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      margin-bottom: 8px;

      span {
        justify-self: center;
        padding: 4px 10px;
        border-radius: 999px;
        background: var(--surface-2);
        border: 1px solid var(--line);
        font-size: 11.5px;
        color: var(--ink);
        text-align: center;
        white-space: nowrap;
        position: relative;
        z-index: 1;
      }

      .broker {
        color: var(--muted);
        border-style: dashed;
      }
    }
    .msgs {
      display: grid;
      gap: 2px;
      margin: 0;
      padding: 0;
      list-style: none;
    }
    .m {
      display: grid;
      grid-template-columns: repeat(6, minmax(0, 1fr));
      padding: 4px 0 6px;
    }
    .arrow {
      display: grid;
      justify-items: center;
      gap: 3px;
      min-width: 0;

      span {
        max-width: 100%;
        padding: 0 6px;
        font-size: 11.5px;
        color: var(--ink-2);
        background: var(--bg-2, var(--bg));
        position: relative;
        z-index: 1;
        text-align: center;
      }

      i {
        position: relative;
        display: block;
        width: 100%;
        height: 2px;
        background: var(--ink-2);

        &::after {
          content: '';
          position: absolute;
          right: -1px;
          top: -4px;
          border: 5px solid transparent;
          border-left: 7px solid var(--ink-2);
          border-right: 0;
        }
      }

      &.left i::after {
        right: auto;
        left: -1px;
        border-left: 0;
        border-right: 7px solid var(--ink-2);
      }

      &.direct {
        span {
          color: var(--fl-lime, var(--ink));
        }
        i {
          height: 3px;
          background: var(--fl-lime, var(--ink));
          &::after {
            border-left-color: var(--fl-lime, var(--ink));
          }
        }
        &.left i::after {
          border-right-color: var(--fl-lime, var(--ink));
        }
      }
    }

    .detail {
      display: grid;
      gap: 12px;
      justify-items: start;
    }
    .field {
      width: 100%;
      max-width: 360px;
    }
    .kv {
      width: 100%;
      display: grid;
      gap: 0;
      margin: 0;
      padding: 0;
      list-style: none;

      li {
        display: grid;
        grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.4fr);
        gap: 4px 16px;
        padding: 10px 0;
        border-top: 1px solid var(--line);
      }
    }
    .k {
      font-size: 13px;
      color: var(--muted);
    }
    .v {
      font-size: 13px;
      color: var(--ink);
      overflow-wrap: anywhere;
    }
    .hash {
      font-size: 12px;
      line-height: 1.6;
    }
    .iv {
      font-weight: 400;
      color: var(--fl-lime, var(--ink));
    }
    .ok {
      color: var(--fl-lime, var(--ink));
    }
    .bad {
      color: var(--fl-danger, var(--muted));
    }
    .foot-note {
      font-size: 13px;
      color: var(--muted);
    }
    .btn-sm {
      height: 40px;
      padding: 0 16px;
      font-size: 14px;
    }
    .nav {
      display: flex;
      justify-content: space-between;
      gap: 10px;
      padding-top: 14px;
      border-top: 1px solid var(--line);
    }

    @media (max-width: 900px) {
      .hs {
        grid-template-columns: 1fr;
      }
      .steps {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
      .step {
        font-size: 13px;
      }
    }
    @media (max-width: 520px) {
      .kv li {
        grid-template-columns: 1fr;
      }
      .lanes span {
        padding: 3px 7px;
        font-size: 11px;
      }
    }
  `,
})
export class FlickHandshakeDemo {
  protected readonly steps = STEPS;
  protected readonly lanes = LANES;
  protected readonly phoneId = PHONE_ID;
  protected readonly laptopId = LAPTOP_ID;
  protected readonly other = OTHER_IP;

  protected readonly at = signal(0);
  protected readonly ip = signal(DEFAULT_IP);
  protected readonly topic = signal(DEFAULT_TOPIC);
  protected readonly key = signal(DEFAULT_KEY);
  protected readonly otherTopic = signal('flick/v1/058b5145075eb076efb5e721def861ab2c0d01c8');
  protected readonly sealed = signal('');
  protected readonly sealedLen = signal(0);
  protected readonly opened = signal('…');
  protected readonly openedOther = signal('…');
  protected readonly sealedNote = signal('');
  protected readonly cryptoOff = signal(false);

  protected readonly step = computed(() => STEPS[this.at()]);
  protected readonly ipOk = computed(() => IPV4.test(this.ip()) && this.ip().split('.').every((p) => +p <= 255));
  protected readonly roomIp = computed(() => (this.ipOk() ? this.ip() : DEFAULT_IP));
  protected readonly plain = signal(JSON.stringify({ k: 'here', f: PHONE_ID, m: '…' }));

  private browser = false;
  private run = 0;

  constructor() {
    afterNextRender(() => {
      this.browser = typeof crypto !== 'undefined' && !!crypto.subtle;
      this.cryptoOff.set(!this.browser);
      this.refresh();
    });
  }

  protected go(i: number): void {
    this.at.set(Math.max(0, Math.min(STEPS.length - 1, i)));
  }

  /** Grid lines for a message: each lane spans two of six columns, arrows run lane centre to centre. */
  protected span(from: number, to: number): string {
    return `${Math.min(from, to) * 2 + 2} / ${Math.max(from, to) * 2 + 2}`;
  }

  protected setIp(value: string): void {
    this.ip.set(value.trim().slice(0, 15));
    this.refresh();
  }

  protected reseal(): void {
    this.refresh(true);
  }

  /** Recomputes the room and a fresh sealed "here" in the browser. Later runs win if the address changes mid-way. */
  private async refresh(announce = false): Promise<void> {
    if (!this.browser) return;
    const run = ++this.run;
    const ip = this.roomIp();
    const sha = async (s: string) => new Uint8Array(await crypto.subtle.digest('SHA-256', enc.encode(s)));
    const room = async (secret: string) => {
      const topic = `flick/v1/${hex(await sha(`flick-topic:${secret}`)).slice(0, 40)}`;
      const raw = await sha(`flick-key:${secret}`);
      const key = await crypto.subtle.importKey('raw', raw, 'AES-GCM', false, ['encrypt', 'decrypt']);
      return { topic, raw, key };
    };
    try {
      const mine = await room(`network:${ip}`);
      const theirs = await room(`network:${OTHER_IP}`);
      const msg = { k: 'here', f: PHONE_ID, m: hex(crypto.getRandomValues(new Uint8Array(8))) };
      const iv = crypto.getRandomValues(new Uint8Array(12));
      const ct = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, mine.key, enc.encode(JSON.stringify(msg))));
      const out = new Uint8Array(12 + ct.length);
      out.set(iv);
      out.set(ct, 12);
      const unseal = async (key: CryptoKey) => {
        try {
          const pt = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: out.subarray(0, 12) }, key, out.subarray(12));
          return dec.decode(pt);
        } catch {
          return 'fails: unseal returns null, message ignored';
        }
      };
      const [a, b] = [await unseal(mine.key), await unseal(theirs.key)];
      if (run !== this.run) return;
      this.topic.set(mine.topic);
      this.key.set(hex(mine.raw));
      this.otherTopic.set(theirs.topic);
      this.plain.set(JSON.stringify(msg));
      this.sealed.set(hex(out));
      this.sealedLen.set(out.length);
      this.opened.set(a);
      this.openedOther.set(b);
      if (announce) this.sealedNote.set(`Sealed again: new IV, completely different ${out.length} bytes, same message.`);
    } catch {
      // Web Crypto unavailable (an insecure origin): the server-rendered values stay.
    }
  }
}
