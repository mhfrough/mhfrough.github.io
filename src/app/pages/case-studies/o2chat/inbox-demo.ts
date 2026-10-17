import { ChangeDetectionStrategy, Component, DestroyRef, ElementRef, afterNextRender, computed, inject, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  phosphorArrowCounterClockwise,
  phosphorCheck,
  phosphorChecks,
  phosphorGlobe,
  phosphorInstagramLogo,
  phosphorMessengerLogo,
  phosphorPaperPlaneRight,
  phosphorRobot,
  phosphorWhatsappLogo,
} from '@ng-icons/phosphor-icons/regular';

/**
 * Hero mockup of the O2Chat team inbox (my own redraw, not a screenshot). It follows the agent portal's rules:
 * tabs by ownership (new and unassigned, assigned to me, all assigned, resolved), a channel filter, assignment to
 * a group and optionally one agent, typing shown for 2.5 s, read receipts, and conversations moving to the top as
 * messages arrive. The hub is simulated: a sample event arrives every few seconds while the card is on screen
 * (never with reduced motion; the button sends one by hand). Invented customers, agents and messages.
 */
type Channel = 'web' | 'wa' | 'ms' | 'ig';
type Tab = 'new' | 'mine' | 'assigned' | 'resolved';

interface Msg {
  from: 'them' | 'me' | 'bot';
  text: string;
  at: string;
  read?: boolean;
}

interface Convo {
  id: number;
  name: string;
  channel: Channel;
  group: string;
  agent: string | null;
  resolved: boolean;
  unread: number;
  typing: boolean;
  seq: number;
  msgs: Msg[];
}

const ME = 'You';
const GROUPS = ['Sales', 'Support', 'Billing'];
const AGENTS = [ME, 'Noor', 'Sam'];

const CHANNELS: Record<Channel, { label: string; icon: string; tone: string }> = {
  web: { label: 'Web', icon: 'phosphorGlobe', tone: 'var(--o-ch-web)' },
  wa: { label: 'WhatsApp', icon: 'phosphorWhatsappLogo', tone: 'var(--o-ch-wa)' },
  ms: { label: 'Messenger', icon: 'phosphorMessengerLogo', tone: 'var(--o-ch-ms)' },
  ig: { label: 'Instagram', icon: 'phosphorInstagramLogo', tone: 'var(--o-ch-ig)' },
};
const CHANNEL_KEYS = Object.keys(CHANNELS) as Channel[];

const TABS: { id: Tab; label: string }[] = [
  { id: 'new', label: 'New' },
  { id: 'mine', label: 'Mine' },
  { id: 'assigned', label: 'Assigned' },
  { id: 'resolved', label: 'Resolved' },
];

const seed = (): Convo[] => [
  {
    id: 1, name: 'Sara K.', channel: 'wa', group: 'Sales', agent: null, resolved: false, unread: 2, typing: false, seq: 9,
    msgs: [
      { from: 'them', text: 'Hi, is the trail runner still in stock?', at: '10:41' },
      { from: 'them', text: 'Size 42, in blue if you have it.', at: '10:42' },
    ],
  },
  {
    id: 2, name: 'Omar R.', channel: 'web', group: 'Support', agent: null, resolved: false, unread: 1, typing: false, seq: 8,
    msgs: [
      { from: 'bot', text: 'Hi, I’m Ava, the store’s assistant. What can I help with?', at: '10:36' },
      { from: 'them', text: 'My order still says processing. It is order 5531.', at: '10:37' },
    ],
  },
  {
    id: 3, name: 'Lena P.', channel: 'ig', group: 'Support', agent: ME, resolved: false, unread: 0, typing: false, seq: 7,
    msgs: [
      { from: 'them', text: 'Can I change the colour after ordering?', at: '10:20' },
      { from: 'me', text: 'Yes, until it ships. Which colour would you like?', at: '10:22', read: true },
    ],
  },
  {
    id: 4, name: 'Diego M.', channel: 'ms', group: 'Sales', agent: 'Noor', resolved: false, unread: 0, typing: false, seq: 6,
    msgs: [
      { from: 'them', text: 'Do you ship to Spain?', at: '10:05' },
      { from: 'me', text: 'We do, in 3 to 5 working days.', at: '10:07', read: true },
    ],
  },
  {
    id: 5, name: 'Visitor 2381', channel: 'web', group: 'Support', agent: null, resolved: false, unread: 0, typing: false, seq: 5,
    msgs: [
      { from: 'them', text: 'Are you open on Sundays?', at: '09:52' },
      { from: 'bot', text: 'We reply on Sundays from 10:00 to 16:00.', at: '09:52' },
    ],
  },
  {
    id: 6, name: 'Priya N.', channel: 'wa', group: 'Billing', agent: 'Sam', resolved: false, unread: 0, typing: false, seq: 4,
    msgs: [{ from: 'them', text: 'Can I get an invoice with my company name on it?', at: '09:30' }],
  },
  {
    id: 7, name: 'Aiko T.', channel: 'ig', group: 'Billing', agent: ME, resolved: true, unread: 0, typing: false, seq: 3,
    msgs: [
      { from: 'them', text: 'The refund arrived, thank you!', at: '09:12' },
      { from: 'me', text: 'Glad to hear it. Have a good day.', at: '09:13', read: true },
    ],
  },
];

/** Sample hub events, played in turn. `id` 0 opens a new conversation. */
const EVENTS: { id: number; name?: string; channel?: Channel; text: string }[] = [
  { id: 1, text: 'Also, do you have it in a 43?' },
  { id: 0, name: 'Visitor 2417', channel: 'web', text: 'Hello, do you deliver on weekends?' },
  { id: 4, text: 'Great. Is shipping free over 50 euros?' },
  { id: 2, text: 'Any news on my order?' },
  { id: 0, name: 'Hana S.', channel: 'ig', text: 'Is the sale on in store too?' },
  { id: 3, text: 'Green, please.' },
];

const REPLIES = ['Perfect, thank you!', 'Great, thanks.', 'That helps, thank you.'];

const initials = (n: string) =>
  n.startsWith('Visitor')
    ? 'V'
    : n
        .split(/\s+/)
        .map((w) => w[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();

@Component({
  selector: 'mh-o2chat-inbox',
  imports: [NgIcon],
  viewProviders: [
    provideIcons({
      phosphorArrowCounterClockwise,
      phosphorCheck,
      phosphorChecks,
      phosphorGlobe,
      phosphorInstagramLogo,
      phosphorMessengerLogo,
      phosphorPaperPlaneRight,
      phosphorRobot,
      phosphorWhatsappLogo,
    }),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="ib card card--lift" role="group" aria-label="Sample team inbox">
      <header class="ib-head">
        <span class="mark"><img src="/images/o2chat/o2chat-mark.webp" width="26" height="26" alt="" /></span>
        <div class="who">
          <h2>Team inbox</h2>
          <p>Sample data</p>
        </div>
        <span class="status-pill hub"><span class="blip is-on" aria-hidden="true"></span>Hub connected</span>
        <button type="button" class="reset" aria-label="Reset the sample inbox" (click)="reset()">
          <ng-icon name="phosphorArrowCounterClockwise" aria-hidden="true" />
        </button>
      </header>

      <div class="bar">
        <div class="seg tabs" role="group" aria-label="Inbox tab">
          @for (t of tabs; track t.id) {
            <button type="button" [attr.aria-pressed]="tab() === t.id" (click)="tab.set(t.id)">
              {{ t.label }} <span class="n mono">{{ counts()[t.id] }}</span>
            </button>
          }
        </div>
        <div class="chans" role="group" aria-label="Channel filter">
          <button type="button" class="chip" [attr.aria-pressed]="channel() === null" (click)="channel.set(null)">All</button>
          @for (k of channelKeys; track k) {
            <button type="button" class="chip ch" [attr.aria-pressed]="channel() === k" [attr.aria-label]="channels[k].label" [title]="channels[k].label" (click)="channel.set(k)">
              <ng-icon [name]="channels[k].icon" aria-hidden="true" />
            </button>
          }
        </div>
      </div>

      <div class="panes">
        <ul class="list" role="list" aria-label="Conversations">
          @for (c of visible(); track c.id) {
            <li>
              <button type="button" class="row" [attr.aria-current]="c.id === openId() ? 'true' : null" (click)="open(c.id)">
                <span class="av" aria-hidden="true">
                  {{ initials(c.name) }}
                  <span class="badge-ch" [style.background]="channels[c.channel].tone"><ng-icon [name]="channels[c.channel].icon" /></span>
                </span>
                <span class="txt">
                  <span class="top">
                    <b>{{ c.name }}</b>
                    <span class="mono at">{{ last(c).at }}</span>
                  </span>
                  <span class="prev" [class.typing]="c.typing">{{ c.typing ? 'typing…' : last(c).text }}</span>
                </span>
                @if (c.unread) {
                  <span class="unread mono" [attr.aria-label]="c.unread + ' unread'">{{ c.unread }}</span>
                }
              </button>
            </li>
          } @empty {
            <li class="empty">Nothing here. Try another tab or channel.</li>
          }
        </ul>

        @if (current(); as c) {
          <section class="thread" [attr.aria-label]="'Conversation with ' + c.name">
            <header class="th-head">
              <b>{{ c.name }}</b>
              <span class="tag ch-tag" [style.--ch]="channels[c.channel].tone">
                <ng-icon [name]="channels[c.channel].icon" aria-hidden="true" /> {{ channels[c.channel].label }}
              </span>
              <span class="owner">{{ ownerLabel(c) }}</span>
            </header>

            <ol class="msgs" role="list" #msgs>
              @for (m of c.msgs; track $index) {
                <li class="msg" [class.me]="m.from === 'me'" [class.bot]="m.from === 'bot'">
                  @if (m.from === 'bot') {
                    <span class="by"><ng-icon name="phosphorRobot" aria-hidden="true" /> Bot</span>
                  }
                  <span class="bubble">{{ m.text }}</span>
                  <span class="meta mono">
                    {{ m.at }}
                    @if (m.from === 'me') {
                      <ng-icon [name]="m.read ? 'phosphorChecks' : 'phosphorCheck'" [class.read]="m.read" [attr.aria-label]="m.read ? 'Read' : 'Sent'" />
                    }
                  </span>
                </li>
              }
              @if (c.typing) {
                <li class="msg"><span class="bubble dots" aria-label="Typing"><i></i><i></i><i></i></span></li>
              }
            </ol>

            <div class="assign">
              <label class="sr-only" for="o2i-group">Group</label>
              <select id="o2i-group" class="select" [value]="draftGroup()" (change)="draftGroup.set($any($event.target).value)">
                @for (g of groups; track g) {
                  <option [value]="g" [selected]="g === draftGroup()">{{ g }}</option>
                }
              </select>
              <label class="sr-only" for="o2i-agent">Agent</label>
              <select id="o2i-agent" class="select" [value]="draftAgent()" (change)="draftAgent.set($any($event.target).value)">
                <option value="" [selected]="draftAgent() === ''">Anyone</option>
                @for (a of agents; track a) {
                  <option [value]="a" [selected]="a === draftAgent()">{{ a }}</option>
                }
              </select>
              <button type="button" class="btn btn-ghost btn-sm" (click)="assign()">Assign</button>
              <button type="button" class="btn btn-ghost btn-sm" (click)="toggleResolved()">{{ c.resolved ? 'Reopen' : 'Resolve' }}</button>
            </div>

            <form class="reply" (submit)="$event.preventDefault(); send()">
              <label class="sr-only" for="o2i-reply">Reply to {{ c.name }}</label>
              <input id="o2i-reply" class="input" placeholder="Type a reply" autocomplete="off" [value]="draft()" (input)="draft.set($any($event.target).value)" />
              <button type="submit" class="send" [disabled]="!draft().trim()" aria-label="Send reply">
                <ng-icon name="phosphorPaperPlaneRight" aria-hidden="true" />
              </button>
            </form>
          </section>
        }
      </div>

      <footer class="foot">
        <p class="mono log" aria-live="polite">{{ log() }}</p>
        <button type="button" class="btn btn-ghost btn-sm" (click)="incoming()">Simulate a message</button>
      </footer>
    </div>
  `,
  styles: `
    :host {
      display: block;
    }
    .ib {
      display: grid;
      grid-template-columns: minmax(0, 1fr);
      gap: 12px;
      padding: 16px;
    }
    .ib-head {
      display: flex;
      align-items: center;
      gap: 10px;

      .who {
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
    }
    .mark {
      width: 40px;
      height: 40px;
      flex-shrink: 0;
      display: grid;
      place-items: center;
      border-radius: var(--r-inner);
      background: var(--bg);
      border: 1px solid var(--line);
    }
    .hub {
      font-size: 12px;
    }
    .reset {
      width: 44px;
      height: 44px;
      flex-shrink: 0;
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
    .bar {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
    }
    .tabs button {
      padding: 0 10px;
      font-size: 13px;
      gap: 5px;
      min-height: 32px;
    }
    .n {
      font-size: 12px;
      color: var(--muted);
    }
    [aria-pressed='true'] .n {
      color: var(--o-blue-text);
    }
    .chans {
      display: flex;
      gap: 4px;
    }
    .chip {
      height: 32px;
      padding: 0 11px;
    }
    .chip.ch {
      width: 36px;
      padding: 0;
      justify-content: center;

      ng-icon {
        font-size: 16px;
      }
    }
    .panes {
      display: grid;
      grid-template-columns: minmax(0, 0.92fr) minmax(0, 1.08fr);
      gap: 10px;
      min-height: 0;
    }
    .list {
      display: grid;
      align-content: start;
      gap: 2px;
      height: 360px;
      overflow-y: auto;
      padding: 4px;
      border-radius: var(--r-inner);
      background: var(--bg);
      border: 1px solid var(--line);
      overscroll-behavior: contain;
    }
    .empty {
      padding: 16px 10px;
      font-size: 13px;
      color: var(--muted);
    }
    .row {
      width: 100%;
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 8px;
      border-radius: 10px;
      text-align: left;
      min-height: 52px;
      transition: background var(--t-base) var(--ease);

      &:hover {
        background: var(--surface);
      }
      &[aria-current='true'] {
        // A full rounded tint with a 1px ring on every side: no one-sided accent bar.
        background: color-mix(in srgb, var(--o-blue) 7%, var(--surface));
        box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--o-blue) 38%, transparent);
      }
    }
    .av {
      position: relative;
      width: 34px;
      height: 34px;
      flex-shrink: 0;
      display: grid;
      place-items: center;
      border-radius: 50%;
      background: var(--o-blue-soft);
      color: var(--o-blue-text);
      font-size: 12px;
      font-weight: 600;
    }
    .badge-ch {
      position: absolute;
      right: -3px;
      bottom: -3px;
      width: 17px;
      height: 17px;
      display: grid;
      place-items: center;
      border-radius: 50%;
      color: #fff;
      font-size: 12px;
      box-shadow: 0 0 0 2px var(--bg);
    }
    .txt {
      flex: 1;
      min-width: 0;
      display: grid;
      gap: 1px;
    }
    .top {
      display: flex;
      justify-content: space-between;
      gap: 6px;

      b {
        font-size: 13px;
        font-weight: 600;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }
    .at {
      font-size: 12px;
      color: var(--muted);
      flex-shrink: 0;
    }
    .prev {
      font-size: 12.5px;
      color: var(--muted);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;

      &.typing {
        color: var(--o-green-text);
        font-style: italic;
      }
    }
    .unread {
      min-width: 20px;
      height: 20px;
      padding: 0 6px;
      display: grid;
      place-items: center;
      border-radius: 999px;
      background: var(--o-blue-text);
      color: #fff;
      font-size: 12px;
    }
    .thread {
      display: grid;
      grid-template-rows: auto 1fr auto auto;
      gap: 8px;
      min-width: 0;
      height: 360px;
    }
    .th-head {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 6px 8px;
      min-height: 28px;

      b {
        font-size: 14px;
      }
    }
    .ch-tag {
      gap: 4px;
      color: var(--ink-2);

      ng-icon {
        color: var(--ch);
        font-size: 13px;
      }
    }
    .owner {
      margin-left: auto;
      font-size: 12px;
      color: var(--muted);
    }
    .msgs {
      display: flex;
      flex-direction: column;
      gap: 6px;
      min-height: 0;
      overflow-y: auto;
      padding: 8px;
      border-radius: var(--r-inner);
      background: var(--bg);
      border: 1px solid var(--line);
      overscroll-behavior: contain;
    }
    .msg {
      display: grid;
      justify-items: start;
      gap: 2px;
      max-width: 88%;

      &.me {
        align-self: flex-end;
        justify-items: end;
      }
    }
    .by {
      display: inline-flex;
      align-items: center;
      gap: 3px;
      font-size: 12px;
      color: var(--muted);
    }
    .bubble {
      padding: 7px 11px;
      border-radius: 14px 14px 14px 4px;
      background: var(--surface);
      border: 1px solid var(--line);
      font-size: 12.5px;
      line-height: 1.4;
      color: var(--ink);
    }
    .bot .bubble {
      background: var(--o-blue-soft);
      border-color: transparent;
    }
    .me .bubble {
      border-radius: 14px 14px 4px 14px;
      background: var(--o-blue-text);
      border-color: transparent;
      color: #fff;
    }
    .meta {
      display: inline-flex;
      align-items: center;
      gap: 3px;
      font-size: 12px;
      color: var(--muted);

      .read {
        color: var(--o-blue-text);
      }
    }
    .dots {
      display: inline-flex;
      gap: 3px;
      padding: 10px 12px;

      i {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: var(--muted);
        opacity: 0.5;
      }
    }
    @media (prefers-reduced-motion: no-preference) {
      .dots i {
        animation: o2-dot 1s var(--ease-in-out) infinite;
      }
      .dots i:nth-child(2) {
        animation-delay: 0.15s;
      }
      .dots i:nth-child(3) {
        animation-delay: 0.3s;
      }
    }
    @keyframes o2-dot {
      50% {
        opacity: 1;
        transform: translateY(-2px);
      }
    }
    .assign {
      display: grid;
      grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
      gap: 6px;

      .select {
        min-width: 0;
        height: 36px;
        padding-left: 12px;
        font-size: 13px;
      }
      .btn {
        height: 36px;
        padding: 0 12px;
        justify-content: center;
      }
    }
    .reply {
      display: flex;
      gap: 6px;

      .input {
        flex: 1;
        min-width: 0;
        height: 44px;
        font-size: 13.5px;
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
    .foot {
      display: flex;
      align-items: center;
      gap: 10px;
      flex-wrap: wrap;
    }
    .log {
      flex: 1;
      min-width: 180px;
      font-size: 12px;
      color: var(--muted);
    }
    @media (max-width: 600px) {
      .ib {
        padding: 12px;
      }
      .hub {
        display: none;
      }
      .panes {
        grid-template-columns: minmax(0, 1fr);
      }
      .list {
        height: 232px;
      }
      .thread {
        height: 360px;
      }
    }
    /* Four tabs do not fit one row below 390px: two rows of two, full width, labels whole */
    @media (max-width: 389px) {
      .tabs {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        width: 100%;
        border-radius: 20px;

        button {
          justify-content: center;
        }
      }
    }
  `,
})
export class O2chatInboxDemo {
  protected readonly tabs = TABS;
  protected readonly channels = CHANNELS;
  protected readonly channelKeys = CHANNEL_KEYS;
  protected readonly groups = GROUPS;
  protected readonly agents = AGENTS;
  protected readonly initials = initials;

  protected readonly convos = signal<Convo[]>(seed());
  protected readonly tab = signal<Tab>('new');
  protected readonly channel = signal<Channel | null>(null);
  protected readonly openId = signal(1);
  protected readonly draft = signal('');
  protected readonly draftGroup = signal('Sales');
  protected readonly draftAgent = signal('');
  protected readonly log = signal('Invented customers. Open a chat, assign it, reply, or wait for the hub.');

  private seq = 10;
  private nextId = 8;
  private event = 0;
  private onScreen = false;
  private timers = new Set<ReturnType<typeof setTimeout>>();
  private readonly host = inject(ElementRef<HTMLElement>);

  protected readonly counts = computed(() => {
    const out: Record<Tab, number> = { new: 0, mine: 0, assigned: 0, resolved: 0 };
    for (const c of this.convos()) for (const t of TABS) if (this.inTab(c, t.id)) out[t.id]++;
    return out;
  });

  protected readonly visible = computed(() =>
    this.convos()
      .filter((c) => this.inTab(c, this.tab()) && (this.channel() === null || c.channel === this.channel()))
      .sort((a, b) => b.seq - a.seq),
  );

  protected readonly current = computed(() => this.convos().find((c) => c.id === this.openId()) ?? null);

  constructor() {
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      this.syncDraft();
      const io = new IntersectionObserver(([e]) => (this.onScreen = e.isIntersecting), { threshold: 0.2 });
      io.observe(this.host.nativeElement);
      const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
      // The hub "speaks" only while the card is on screen, the tab is visible and motion is welcome.
      const tick = still ? null : setInterval(() => this.onScreen && !document.hidden && this.incoming(), 7000);
      destroyRef.onDestroy(() => {
        io.disconnect();
        if (tick) clearInterval(tick);
        this.timers.forEach(clearTimeout);
      });
    });
  }

  protected last(c: Convo): Msg {
    return c.msgs[c.msgs.length - 1];
  }

  protected ownerLabel(c: Convo): string {
    if (c.resolved) return 'Resolved';
    return c.agent ? `${c.group}, ${c.agent === ME ? 'you' : c.agent}` : `${c.group}, unassigned`;
  }

  private inTab(c: Convo, t: Tab): boolean {
    if (t === 'resolved') return c.resolved;
    if (c.resolved) return false;
    if (t === 'new') return !c.agent;
    if (t === 'mine') return c.agent === ME;
    return !!c.agent;
  }

  private patch(id: number, fn: (c: Convo) => Convo): void {
    this.convos.update((list) => list.map((c) => (c.id === id ? fn(c) : c)));
  }

  private later(fn: () => void, ms: number): void {
    const t = setTimeout(() => {
      this.timers.delete(t);
      fn();
    }, ms);
    this.timers.add(t);
  }

  private now(): string {
    const d = new Date();
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  }

  private syncDraft(): void {
    const c = this.current();
    if (!c) return;
    this.draftGroup.set(c.group);
    this.draftAgent.set(c.agent ?? '');
  }

  protected open(id: number): void {
    this.openId.set(id);
    this.draft.set('');
    const c = this.current();
    if (c?.unread) {
      this.patch(id, (x) => ({ ...x, unread: 0 }));
      this.log.set(`hub: ReadReceipt, ${c.name}`);
    }
    this.syncDraft();
    this.scrollThread();
  }

  protected assign(): void {
    const c = this.current();
    if (!c) return;
    const agent = this.draftAgent() || null;
    const group = this.draftGroup();
    this.patch(c.id, (x) => ({ ...x, group, agent, resolved: false, seq: this.seq++ }));
    const where = agent === ME ? 'Mine' : agent ? 'Assigned' : 'New';
    this.log.set(`hub: AssignChat, ${group}${agent ? ', ' + agent : ''}. It now sits in ${where}.`);
  }

  protected toggleResolved(): void {
    const c = this.current();
    if (!c) return;
    this.patch(c.id, (x) => ({ ...x, resolved: !x.resolved, unread: 0 }));
    this.log.set(`hub: UpdateConversationStatus, ${c.name} ${c.resolved ? 'reopened' : 'resolved'}`);
  }

  protected send(): void {
    const c = this.current();
    const text = this.draft().trim();
    if (!c || !text) return;
    const at = this.now();
    // Replying to an unassigned chat claims it, as the portal does when an agent engages.
    this.patch(c.id, (x) => ({ ...x, agent: x.agent ?? ME, resolved: false, unread: 0, seq: this.seq++, msgs: [...x.msgs, { from: 'me', text, at }] }));
    this.draft.set('');
    this.log.set(`Sent to ${c.name} on ${CHANNELS[c.channel].label}. The customer sees it in their own app.`);
    this.scrollThread();
    const id = c.id;
    this.later(() => {
      this.patch(id, (x) => ({ ...x, msgs: x.msgs.map((m) => (m.from === 'me' ? { ...m, read: true } : m)) }));
      this.log.set(`hub: ReadReceiptListener, ${c.name} read your reply`);
      this.later(() => this.arrive(id, REPLIES[id % REPLIES.length]), 1400);
    }, 1200);
  }

  /** One sample hub event: typing first, then the message, then the list re-sorts. */
  protected incoming(): void {
    const e = EVENTS[this.event++ % EVENTS.length];
    let id = e.id;
    if (id === 0) {
      if (this.convos().length >= 11) return;
      id = this.nextId++;
      const name = this.convos().some((c) => c.name === e.name) ? `Visitor ${2400 + id}` : e.name!;
      this.convos.update((list) => [
        ...list,
        { id, name, channel: e.channel!, group: 'Support', agent: null, resolved: false, unread: 0, typing: false, seq: this.seq++, msgs: [] },
      ]);
      this.arrive(id, e.text);
      return;
    }
    this.arrive(id, e.text);
  }

  private arrive(id: number, text: string): void {
    const c = this.convos().find((x) => x.id === id);
    if (!c) return;
    this.patch(id, (x) => ({ ...x, typing: true }));
    this.log.set(`hub: TypingIndicatorListener, ${c.name}`);
    this.later(() => {
      const open = this.openId() === id;
      this.patch(id, (x) => ({
        ...x,
        typing: false,
        resolved: false,
        seq: this.seq++,
        unread: open ? 0 : x.unread + 1,
        msgs: [...x.msgs, { from: 'them', text, at: this.now() }],
      }));
      this.log.set(`hub: ReceiveMessage, ${c.name} on ${CHANNELS[c.channel].label}`);
      if (open) this.scrollThread();
    }, 1600);
  }

  private scrollThread(): void {
    this.later(() => {
      const el = this.host.nativeElement.querySelector('.msgs');
      if (el) el.scrollTop = el.scrollHeight;
    }, 30);
  }

  protected reset(): void {
    this.timers.forEach(clearTimeout);
    this.timers.clear();
    this.convos.set(seed());
    this.tab.set('new');
    this.channel.set(null);
    this.openId.set(1);
    this.draft.set('');
    this.seq = 10;
    this.nextId = 8;
    this.event = 0;
    this.syncDraft();
    this.log.set('Sample inbox reset.');
  }
}
