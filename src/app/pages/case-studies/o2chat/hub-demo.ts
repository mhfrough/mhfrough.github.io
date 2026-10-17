import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  phosphorArrowClockwise,
  phosphorArrowCounterClockwise,
  phosphorCheck,
  phosphorChecks,
  phosphorClock,
  phosphorPaperPlaneRight,
  phosphorWarningCircle,
  phosphorWifiHigh,
  phosphorWifiSlash,
} from '@ng-icons/phosphor-icons/regular';

/**
 * The real-time layer as my own working mockup. Left, the agent portal's hub connection with its real retry
 * schedule: an immediate attempt, then twelve more five seconds apart, and a sign-out once they run out. Right,
 * the visitor's widget: while the network is down, messages wait in a queue (IndexedDB in the real widget) and go
 * out in order once the hub is back; when the retries run out they turn into failed messages with a resend
 * button. Event names are the hub's own. Invented messages; timers start only on a click.
 */
type Conn = 'connected' | 'reconnecting' | 'disconnected';
type Status = 'sent' | 'read' | 'queued' | 'failed';

interface Msg {
  id: number;
  from: 'visitor' | 'agent';
  text: string;
  status: Status;
}

/** withAutomaticReconnect([0, 5000 x 12]) in the agent portal, in seconds. */
const SCHEDULE = [0, ...Array.from({ length: 12 }, () => 5)];

const SEED: Msg[] = [
  { id: 1, from: 'visitor', text: 'Hi, can I still change my delivery address?', status: 'read' },
  { id: 2, from: 'agent', text: 'Yes, until it ships. What is the new one?', status: 'sent' },
];

const AGENT_REPLIES = ['Got it, updating it now.', 'Thanks, that is done.', 'Noted. Anything else?'];

@Component({
  selector: 'mh-o2chat-hub',
  imports: [NgIcon],
  viewProviders: [
    provideIcons({
      phosphorArrowClockwise,
      phosphorArrowCounterClockwise,
      phosphorCheck,
      phosphorChecks,
      phosphorClock,
      phosphorPaperPlaneRight,
      phosphorWarningCircle,
      phosphorWifiHigh,
      phosphorWifiSlash,
    }),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="hub card">
      <div class="top">
        <button type="button" class="btn btn-sm" [class.btn-solid]="online()" [class.btn-ghost]="!online()" (click)="toggleNetwork()">
          <ng-icon [name]="online() ? 'phosphorWifiSlash' : 'phosphorWifiHigh'" aria-hidden="true" />
          {{ online() ? 'Drop the network' : 'Restore the network' }}
        </button>
        <span class="net mono" [class.off]="!online()">network {{ online() ? 'online' : 'offline' }}</span>
        <button type="button" class="reset" aria-label="Reset the connection demo" (click)="reset()">
          <ng-icon name="phosphorArrowCounterClockwise" aria-hidden="true" />
        </button>
      </div>

      <div class="grid">
        <section class="side" aria-labelledby="o2h-portal">
          <header class="side-head">
            <h3 id="o2h-portal">Agent portal</h3>
            <span class="state" [attr.data-s]="conn()">
              <span class="blip" [class.is-on]="conn() === 'connected'" aria-hidden="true"></span>{{ stateLabel() }}
            </span>
          </header>

          <div class="sched">
            <p class="mini">Retry schedule, in seconds</p>
            <ol class="dots" role="list" aria-label="Reconnect attempts">
              @for (s of schedule; track $index; let i = $index) {
                <li [class.done]="i < attempt()" [class.now]="conn() === 'reconnecting' && i === attempt()" [attr.aria-label]="'Attempt ' + (i + 1) + ' after ' + s + ' seconds'">
                  <span class="mono">{{ s }}</span>
                </li>
              }
            </ol>
            <p class="mono wait" aria-live="polite">{{ waitLabel() }}</p>
          </div>

          <ol class="events mono" role="list" aria-label="Hub events">
            @for (e of events(); track e.id) {
              <li [class.in]="e.dir === 'in'" [class.sys]="e.dir === 'sys'">
                <span class="dir" aria-hidden="true">{{ e.dir === 'in' ? '←' : e.dir === 'out' ? '→' : '·' }}</span>{{ e.text }}
              </li>
            }
          </ol>
        </section>

        <section class="side widget" aria-labelledby="o2h-widget">
          <header class="side-head">
            <h3 id="o2h-widget">Visitor widget</h3>
            @if (queued() > 0) {
              <span class="tag q">{{ queued() }} queued</span>
            }
          </header>

          <ol class="msgs" role="list" aria-label="Widget messages">
            @for (m of msgs(); track m.id) {
              <li class="msg" [class.me]="m.from === 'visitor'" [attr.data-s]="m.status">
                <span class="bubble">{{ m.text }}</span>
                @if (m.from === 'visitor') {
                  <span class="meta mono">
                    @switch (m.status) {
                      @case ('queued') {
                        <ng-icon name="phosphorClock" aria-hidden="true" /> Queued
                      }
                      @case ('failed') {
                        <ng-icon name="phosphorWarningCircle" aria-hidden="true" /> Not sent
                        <button type="button" class="resend" (click)="resend(m.id)">Resend</button>
                      }
                      @case ('read') {
                        <ng-icon name="phosphorChecks" aria-hidden="true" /> Read
                      }
                      @default {
                        <ng-icon name="phosphorCheck" aria-hidden="true" /> Sent
                      }
                    }
                  </span>
                }
              </li>
            }
          </ol>

          <form class="reply" (submit)="$event.preventDefault(); send()">
            <label class="sr-only" for="o2h-msg">Message as the visitor</label>
            <input id="o2h-msg" class="input" placeholder="Write as the visitor" autocomplete="off" [value]="draft()" (input)="draft.set($any($event.target).value)" />
            <button type="submit" class="send" [disabled]="!draft().trim()" aria-label="Send">
              <ng-icon name="phosphorPaperPlaneRight" aria-hidden="true" />
            </button>
          </form>
        </section>
      </div>

      <p class="mono note" aria-live="polite">{{ note() }}</p>
    </div>
  `,
  styles: `
    :host {
      display: block;
    }
    .hub {
      display: grid;
      gap: 16px;
      padding: 20px;
    }
    .top {
      display: flex;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;

      .btn {
        height: 44px;
      }
    }
    .net {
      font-size: 12px;
      color: var(--o-green-text);

      &.off {
        color: var(--o-red-text);
      }
    }
    .reset {
      width: 44px;
      height: 44px;
      margin-left: auto;
      display: grid;
      place-items: center;
      border-radius: 999px;
      border: 1px solid var(--line);
      color: var(--ink-2);
      font-size: 17px;

      &:hover {
        background: var(--surface-2);
      }
    }
    .grid {
      display: grid;
      grid-template-columns: minmax(0, 1.1fr) minmax(0, 0.9fr);
      gap: 14px;
    }
    .side {
      display: grid;
      align-content: start;
      gap: 12px;
      padding: 16px;
      border-radius: var(--r-inner);
      background: var(--bg);
      border: 1px solid var(--line);
      min-width: 0;
    }
    .side-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;

      h3 {
        font-size: 15px;
      }
    }
    .state {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      height: 28px;
      padding: 0 12px 0 10px;
      border-radius: 999px;
      font-size: 12.5px;
      font-weight: 500;
      background: var(--o-green-soft);
      color: var(--o-green-text);

      &[data-s='reconnecting'] {
        background: var(--o-amber-soft);
        color: var(--o-amber-text);
      }
      &[data-s='disconnected'] {
        background: var(--o-red-soft);
        color: var(--o-red-text);
      }
      .blip:not(.is-on) {
        background: currentColor;
      }
    }
    .mini {
      font-size: 12px;
      color: var(--muted);
      margin-bottom: 6px;
    }
    .dots {
      display: grid;
      grid-template-columns: repeat(13, minmax(0, 1fr));
      gap: 4px;

      li {
        display: grid;
        place-items: center;
        height: 26px;
        border-radius: 7px;
        background: var(--surface);
        border: 1px solid var(--line);
        font-size: 12px;
        color: var(--muted);
        transition:
          background var(--t-base) var(--ease),
          color var(--t-base) var(--ease);
      }
      .done {
        background: var(--o-red-soft);
        border-color: transparent;
        color: var(--o-red-text);
      }
      .now {
        background: var(--o-amber-soft);
        border-color: var(--o-amber-text);
        color: var(--o-amber-text);
      }
    }
    .wait {
      margin-top: 8px;
      font-size: 12px;
      color: var(--ink-2);
      min-height: 1.5em;
    }
    .events {
      display: grid;
      align-content: start;
      gap: 3px;
      height: 150px;
      overflow: hidden;
      padding: 10px 12px;
      border-radius: 10px;
      background: var(--o-night);
      color: var(--n-ink);
      font-size: 12px;

      li {
        display: flex;
        gap: 8px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .dir {
        width: 10px;
        flex-shrink: 0;
        color: var(--o-sky);
      }
      .in .dir {
        color: #7ee2a8;
      }
      .sys {
        color: var(--n-muted);
      }
    }
    .widget {
      grid-template-rows: auto 1fr auto;
    }
    .q {
      background: var(--o-amber-soft);
      color: var(--o-amber-text);
      border-color: transparent;
    }
    .msgs {
      display: flex;
      flex-direction: column;
      gap: 8px;
      height: 236px;
      overflow-y: auto;
      padding: 10px;
      border-radius: 10px;
      background: var(--surface);
      border: 1px solid var(--line);
      overscroll-behavior: contain;
    }
    .msg {
      display: grid;
      justify-items: start;
      gap: 2px;
      max-width: 86%;

      &.me {
        align-self: flex-end;
        justify-items: end;
      }
    }
    .bubble {
      padding: 7px 11px;
      border-radius: 14px 14px 14px 4px;
      background: var(--bg);
      border: 1px solid var(--line);
      font-size: 13px;
      line-height: 1.4;
    }
    .me .bubble {
      border-radius: 14px 14px 4px 14px;
      background: var(--o-blue-text);
      border-color: transparent;
      color: #fff;
    }
    .me[data-s='queued'] .bubble {
      background: var(--o-blue-soft);
      color: var(--ink);
      border: 1px dashed var(--o-blue-text);
    }
    .me[data-s='failed'] .bubble {
      background: var(--o-red-soft);
      color: var(--ink);
      border: 1px solid var(--o-red-text);
    }
    .meta {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      font-size: 12px;
      color: var(--muted);
    }
    [data-s='failed'] .meta {
      color: var(--o-red-text);
    }
    .resend {
      margin-left: 4px;
      min-height: 28px;
      padding: 0 10px;
      border-radius: 999px;
      border: 1px solid currentColor;
      font-family: var(--font-sans);
      font-size: 12px;
      font-weight: 500;
    }
    .reply {
      display: flex;
      gap: 6px;

      .input {
        flex: 1;
        min-width: 0;
        height: 44px;
        font-size: 14px;
        background: var(--surface);
      }
    }
    .send {
      width: 44px;
      height: 44px;
      flex-shrink: 0;
      display: grid;
      place-items: center;
      border-radius: 999px;
      background: var(--cta);
      color: var(--cta-ink);
      font-size: 17px;

      &[disabled] {
        opacity: 0.4;
        cursor: not-allowed;
      }
    }
    .note {
      font-size: 12px;
      color: var(--muted);
    }
    @media (max-width: 820px) {
      .hub {
        padding: 14px;
      }
      .grid {
        grid-template-columns: minmax(0, 1fr);
      }
      .dots {
        grid-template-columns: repeat(7, minmax(0, 1fr));
      }
    }
  `,
})
export class O2chatHubDemo {
  protected readonly schedule = SCHEDULE;
  protected readonly online = signal(true);
  protected readonly conn = signal<Conn>('connected');
  protected readonly attempt = signal(0);
  protected readonly wait = signal(0);
  protected readonly msgs = signal<Msg[]>(SEED);
  protected readonly events = signal<{ id: number; dir: 'in' | 'out' | 'sys'; text: string }[]>([
    { id: 1, dir: 'sys', text: 'start(): connected' },
    { id: 2, dir: 'out', text: 'AgentJoined, reconnecting: false' },
    { id: 3, dir: 'sys', text: '22 listeners registered' },
  ]);
  protected readonly draft = signal('');
  protected readonly note = signal('Drop the network, write as the visitor, then bring it back.');

  protected readonly queued = computed(() => this.msgs().filter((m) => m.status === 'queued').length);
  protected readonly stateLabel = computed(() => ({ connected: 'Connected', reconnecting: 'Reconnecting', disconnected: 'Signed out' })[this.conn()]);
  protected readonly waitLabel = computed(() => {
    const c = this.conn();
    if (c === 'connected') return 'Live. Every event arrives as it happens.';
    if (c === 'disconnected') return 'All 13 attempts failed: the portal closes the session.';
    return `Attempt ${this.attempt() + 1} of ${SCHEDULE.length} in ${this.wait()} s`;
  });

  private ids = 10;
  private ev = 10;
  private replies = 0;
  private tick: ReturnType<typeof setInterval> | null = null;
  private timers = new Set<ReturnType<typeof setTimeout>>();

  constructor() {
    inject(DestroyRef).onDestroy(() => this.stopAll());
  }

  private stopAll(): void {
    if (this.tick) clearInterval(this.tick);
    this.tick = null;
    this.timers.forEach(clearTimeout);
    this.timers.clear();
  }

  private later(fn: () => void, ms: number): void {
    const t = setTimeout(() => {
      this.timers.delete(t);
      fn();
    }, ms);
    this.timers.add(t);
  }

  private push(dir: 'in' | 'out' | 'sys', text: string): void {
    this.events.update((list) => [...list, { id: this.ev++, dir, text }].slice(-8));
  }

  protected toggleNetwork(): void {
    const next = !this.online();
    this.online.set(next);
    if (!next && this.conn() === 'connected') {
      this.conn.set('reconnecting');
      this.attempt.set(0);
      this.push('sys', 'onreconnecting(): banner shown');
      this.note.set('The hub dropped. The portal shows a reconnecting banner and starts its schedule.');
      this.runAttempt();
    } else if (next) {
      this.note.set(this.conn() === 'disconnected' ? 'Network back. Press Reset to sign in again.' : 'Network back. The next attempt will get through.');
    }
  }

  /** One attempt at the current step of the schedule, after its delay, counting down each second. */
  private runAttempt(): void {
    if (this.tick) clearInterval(this.tick);
    this.wait.set(SCHEDULE[this.attempt()]);
    const fire = () => {
      if (this.tick) clearInterval(this.tick);
      this.tick = null;
      if (this.online()) return this.reconnected();
      const n = this.attempt() + 1;
      this.push('sys', `attempt ${n}: failed`);
      if (n >= SCHEDULE.length) {
        this.conn.set('disconnected');
        this.attempt.set(SCHEDULE.length);
        this.push('sys', 'onclose(): session closed');
        this.msgs.update((list) => list.map((m) => (m.status === 'queued' ? { ...m, status: 'failed' } : m)));
        this.note.set('Out of retries. Queued messages turn into failed ones the visitor can resend.');
        return;
      }
      this.attempt.set(n);
      this.runAttempt();
    };
    if (this.wait() === 0) return this.later(fire, 400);
    this.tick = setInterval(() => {
      this.wait.update((w) => w - 1);
      if (this.wait() <= 0) fire();
    }, 1000);
  }

  private reconnected(): void {
    this.conn.set('connected');
    this.push('sys', `attempt ${this.attempt() + 1}: connected`);
    this.push('out', 'AgentJoined, reconnecting: true');
    this.push('sys', '22 listeners registered again');
    this.attempt.set(0);
    this.flush();
  }

  /** Queued messages go out in the order they were written. */
  private flush(): void {
    const waiting = this.msgs().filter((m) => m.status === 'queued');
    if (!waiting.length) return this.note.set('Back online. Nothing was waiting.');
    this.note.set(`Back online. Sending ${waiting.length} queued ${waiting.length === 1 ? 'message' : 'messages'} in order.`);
    waiting.forEach((m, i) =>
      this.later(() => {
        this.setStatus(m.id, 'sent');
        this.push('in', `ReceiveMessage: "${m.text.slice(0, 22)}"`);
        if (i === waiting.length - 1) this.agentReply();
      }, 450 * (i + 1)),
    );
  }

  private setStatus(id: number, status: Status): void {
    this.msgs.update((list) => list.map((m) => (m.id === id ? { ...m, status } : m)));
  }

  private agentReply(): void {
    this.later(() => {
      if (this.conn() !== 'connected') return;
      this.msgs.update((list) => list.map((m) => (m.from === 'visitor' && m.status === 'sent' ? { ...m, status: 'read' } : m)));
      this.push('out', 'ReadReceipt');
      this.later(() => {
        if (this.conn() !== 'connected') return;
        this.msgs.update((list) => [...list, { id: this.ids++, from: 'agent', text: AGENT_REPLIES[this.replies++ % AGENT_REPLIES.length], status: 'sent' }]);
        this.scrollWidget();
      }, 1100);
    }, 900);
  }

  protected send(): void {
    const text = this.draft().trim();
    if (!text) return;
    const id = this.ids++;
    const live = this.online() && this.conn() === 'connected';
    const status: Status = live ? 'sent' : this.conn() === 'disconnected' ? 'failed' : 'queued';
    this.msgs.update((list) => [...list, { id, from: 'visitor', text, status }]);
    this.draft.set('');
    this.scrollWidget();
    if (live) {
      this.push('in', `ReceiveMessage: "${text.slice(0, 22)}"`);
      this.note.set('Delivered at once: the hub pushes it to every agent watching.');
      this.agentReply();
    } else {
      this.note.set(status === 'queued' ? 'Offline: saved in the queue, it waits for the hub.' : 'The session is closed: the message failed and can be resent.');
    }
  }

  protected resend(id: number): void {
    if (this.online() && this.conn() !== 'reconnecting') {
      if (this.conn() === 'disconnected') this.reconnectNow();
      this.setStatus(id, 'sent');
      const m = this.msgs().find((x) => x.id === id);
      this.push('in', `ReceiveMessage: "${(m?.text ?? '').slice(0, 22)}"`);
      this.note.set('Resent.');
      this.agentReply();
    } else {
      this.setStatus(id, 'queued');
      this.note.set('Still offline: back in the queue.');
    }
  }

  private reconnectNow(): void {
    this.conn.set('connected');
    this.attempt.set(0);
    this.push('sys', 'start(): connected');
    this.push('out', 'AgentJoined, reconnecting: false');
  }

  private scrollWidget(): void {
    this.later(() => {
      const el = document.querySelector('mh-o2chat-hub .msgs');
      if (el) el.scrollTop = el.scrollHeight;
    }, 30);
  }

  protected reset(): void {
    this.stopAll();
    this.online.set(true);
    this.conn.set('connected');
    this.attempt.set(0);
    this.wait.set(0);
    this.msgs.set(SEED);
    this.draft.set('');
    this.events.set([
      { id: this.ev++, dir: 'sys', text: 'start(): connected' },
      { id: this.ev++, dir: 'out', text: 'AgentJoined, reconnecting: false' },
      { id: this.ev++, dir: 'sys', text: '22 listeners registered' },
    ]);
    this.note.set('Reset. Drop the network, write as the visitor, then bring it back.');
  }
}
