import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  phosphorArrowCounterClockwise,
  phosphorDeviceMobile,
  phosphorDeviceTablet,
  phosphorFilePdf,
  phosphorFilmStrip,
  phosphorImage,
  phosphorLaptop,
  phosphorLink,
  phosphorPlus,
} from '@ng-icons/phosphor-icons/regular';

const MB = 1024 * 1024;
const CHUNK = 64 * 1024;
const TICK_MS = 80;

interface Sample {
  id: string;
  kind: 'text' | 'file';
  name: string;
  size: number;
  icon: string;
  text?: string;
}

interface Peer {
  id: string;
  name: string;
  icon: string;
  label: string;
}

/** Something "Brisk Otter" shared: with everyone (the board) or with one device. */
interface Item {
  id: number;
  sample: Sample;
  all: boolean;
  to?: string;
}

type Status = 'text' | 'pending' | 'receiving' | 'done' | 'declined' | 'cancelled';

/** One item as one receiving device sees it. */
interface Delivery {
  itemId: number;
  peerId: string;
  status: Status;
  received: number;
}

const SAMPLES: Sample[] = [
  { id: 'link', kind: 'text', name: 'A link', size: 0, icon: 'phosphorLink', text: 'Slides: mhfrough.github.io/flick' },
  { id: 'pdf', kind: 'file', name: 'venue-map.pdf', size: 1.8 * MB, icon: 'phosphorFilePdf' },
  { id: 'jpg', kind: 'file', name: 'IMG_2041.jpg', size: 3.2 * MB, icon: 'phosphorImage' },
  { id: 'mp4', kind: 'file', name: 'walkthrough.mp4', size: 240 * MB, icon: 'phosphorFilmStrip' },
];

const PEERS: Peer[] = [
  { id: 'heron', name: 'Calm Heron', icon: 'phosphorDeviceMobile', label: 'iPhone · Safari' },
  { id: 'lynx', name: 'Golden Lynx', icon: 'phosphorDeviceTablet', label: 'Android tablet · Chrome' },
];

const ME = 'Brisk Otter';

const bytes = (n: number): string => {
  if (!n) return '0 B';
  const u = ['B', 'KB', 'MB', 'GB'];
  const i = Math.min(Math.floor(Math.log(n) / Math.log(1024)), u.length - 1);
  const v = n / 1024 ** i;
  return `${v.toFixed(i === 0 || v >= 100 ? 0 : 1)} ${u[i]}`;
};
const plural = (n: number, w: string): string => `${n} ${w}${n === 1 ? '' : 's'}`;

/**
 * A simulation of Flick written for this page: one laptop (you) and the devices on the same Wi-Fi. It follows the
 * real app's rules (app.js): text goes straight into the inbox; files are only offered, and move only after the
 * receiver accepts; things shared with everyone reach devices that open Flick later; Stop sharing takes an item back
 * from devices that have not finished receiving it. Status lines use the app's own wording. Transfers are timed
 * locally and counted in Flick's 64 KB chunks; nothing leaves the browser. Timers start only from a click and stop
 * when the page is destroyed, so the server render is the static first state.
 */
@Component({
  selector: 'mh-fl-nearby-demo',
  imports: [NgIcon],
  viewProviders: [
    provideIcons({
      phosphorArrowCounterClockwise,
      phosphorDeviceMobile,
      phosphorDeviceTablet,
      phosphorFilePdf,
      phosphorFilmStrip,
      phosphorImage,
      phosphorLaptop,
      phosphorLink,
      phosphorPlus,
    }),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="demo card card--lift">
      <div class="top">
        <p class="net mono">
          <span class="blip is-on" aria-hidden="true"></span>
          Same Wi-Fi · {{ plural(online().length + 1, 'device') }}
        </p>
        <button type="button" class="btn btn-ghost btn-sm reset" (click)="reset()" [disabled]="!dirty()">
          <ng-icon name="phosphorArrowCounterClockwise" aria-hidden="true" />Reset
        </button>
      </div>

      <section class="me" aria-label="This device: Brisk Otter">
        <div class="who">
          <span class="av av--me" aria-hidden="true"><ng-icon name="phosphorLaptop" /></span>
          <div>
            <p class="name">You are <b>{{ me }}</b></p>
            <p class="label mono">Laptop · Chrome</p>
          </div>
        </div>

        <div class="row">
          <div class="seg" role="group" aria-label="Who gets it">
            <button type="button" [attr.aria-pressed]="mode() === 'all'" (click)="mode.set('all')">Everyone nearby</button>
            <button type="button" [attr.aria-pressed]="mode() === 'one'" (click)="mode.set('one')">One device</button>
          </div>
          @if (mode() === 'one') {
            <div class="targets" role="group" aria-label="Send to">
              @for (p of onlinePeers(); track p.id) {
                <button type="button" class="chip" [attr.aria-pressed]="target() === p.id" (click)="target.set(p.id)">
                  <ng-icon [name]="p.icon" aria-hidden="true" />{{ p.name }}
                </button>
              }
            </div>
          }
        </div>

        <div class="picks" role="group" aria-label="What to send">
          @for (s of samples; track s.id) {
            <button type="button" class="chip" [attr.aria-pressed]="pick() === s.id" (click)="pick.set(s.id)">
              <ng-icon [name]="s.icon" aria-hidden="true" />{{ s.name }}@if (s.size) {<span class="mono size">{{ fmt(s.size) }}</span>}
            </button>
          }
        </div>

        <button type="button" class="btn btn-solid btn-sm send" (click)="send()">{{ sendLabel() }}</button>

        @if (outbox().length) {
          <ol class="out" role="list" aria-label="Shared by you">
            @for (o of outbox(); track o.item.id) {
              <li>
                <ng-icon [name]="o.item.sample.icon" aria-hidden="true" />
                <div class="out-text">
                  <p><b>{{ o.item.sample.name }}</b> <span class="muted">{{ o.item.all ? 'to everyone' : 'to ' + peerName(o.item.to!) }}</span></p>
                  <p class="mono st">{{ o.status }}</p>
                </div>
                @if (o.item.all) {
                  <button type="button" class="link-btn" (click)="unshare(o.item)" [attr.aria-label]="'Stop sharing ' + o.item.sample.name">Stop sharing</button>
                }
              </li>
            }
          </ol>
        }
      </section>

      <div class="peers" [class.two]="online().length > 1">
        @for (p of onlinePeers(); track p.id) {
          <section class="peer" [attr.aria-label]="p.name + ', ' + p.label">
            <div class="who">
              <span class="av" aria-hidden="true"><ng-icon [name]="p.icon" /></span>
              <div>
                <p class="name"><b>{{ p.name }}</b></p>
                <p class="label mono">{{ p.label }}</p>
              </div>
            </div>
            @let list = inbox(p.id);
            @if (!list.shown.length) {
              <p class="empty">Files and text sent to {{ p.name }} land here.</p>
            } @else {
              <ol class="inbox" role="list">
                @for (d of list.shown; track d.itemId) {
                  <li class="msg" [class.is-new]="d.status === 'pending'">
                    <p class="head">
                      <b>{{ me }}</b> {{ verb(d) }}
                    </p>
                    @if (d.item.sample.kind === 'text') {
                      <p class="text">{{ d.item.sample.text }}</p>
                    } @else {
                      <div class="file">
                        <ng-icon [name]="d.item.sample.icon" aria-hidden="true" />
                        <div>
                          <p class="fname">{{ d.item.sample.name }}</p>
                          <p class="mono fsize">
                            @if (d.status === 'receiving') {
                              {{ fmt(d.received) }} of {{ fmt(d.item.sample.size) }} · chunk {{ chunks(d.received) }} of {{ chunks(d.item.sample.size) }}
                            } @else {
                              {{ fmt(d.item.sample.size) }}
                            }
                          </p>
                        </div>
                      </div>
                      @if (d.status === 'receiving') {
                        <div class="track" role="progressbar" [attr.aria-label]="'Receiving ' + d.item.sample.name" aria-valuemin="0" aria-valuemax="100" [attr.aria-valuenow]="pct(d)">
                          <i [style.transform]="'scaleX(' + d.received / d.item.sample.size + ')'"></i>
                        </div>
                      }
                      <div class="acts">
                        @switch (d.status) {
                          @case ('pending') {
                            <button type="button" class="btn btn-solid btn-xs" (click)="accept(d)">{{ d.item.all ? 'Download' : 'Accept' }}</button>
                            <button type="button" class="link-btn" (click)="decline(d)">{{ d.item.all ? 'Dismiss' : 'Decline' }}</button>
                          }
                          @case ('receiving') {
                            <button type="button" class="link-btn" (click)="cancel(d)">Cancel</button>
                          }
                          @case ('done') {
                            <span class="tag ok">Ready to save</span>
                          }
                          @case ('cancelled') {
                            <button type="button" class="link-btn" (click)="remove(d)">Remove</button>
                          }
                        }
                      </div>
                    }
                  </li>
                }
              </ol>
              @if (list.more) {
                <p class="more mono">{{ list.more }} earlier</p>
              }
            }
          </section>
        }
        @if (online().length < peers.length) {
          <div class="join">
            <p>Open Flick on another device on this Wi-Fi.</p>
            <button type="button" class="btn btn-ghost btn-sm" (click)="join()">
              <ng-icon name="phosphorPlus" aria-hidden="true" />Add Golden Lynx
            </button>
          </div>
        }
      </div>

      <p class="sr-only" aria-live="polite">{{ announce() }}</p>
    </div>
  `,
  styles: `
    :host {
      display: block;
      min-width: 0;
    }
    .demo {
      padding: 0;
      overflow: hidden;
      background: var(--surface);
    }
    p {
      margin: 0;
    }
    .top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      padding: 10px 12px 10px 16px;
      border-bottom: 1px solid var(--line);
    }
    .net {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      font-size: 12px;
      color: var(--ink-2);
    }
    .net .blip.is-on {
      background: var(--fl-lime, var(--ink));
      border-color: var(--fl-lime, var(--ink));
    }
    .btn-sm {
      height: 40px;
      padding: 0 14px;
      font-size: 13.5px;
    }
    .btn-xs {
      height: 36px;
      padding: 0 14px;
      font-size: 13px;
    }
    .reset ng-icon {
      font-size: 16px;
    }

    .me {
      display: grid;
      gap: 12px;
      padding: 16px;
      border-bottom: 1px solid var(--line);
    }
    .who {
      display: flex;
      align-items: center;
      gap: 12px;
      min-width: 0;
    }
    .av {
      flex: none;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: grid;
      place-items: center;
      background: var(--surface-2);
      color: var(--ink);
      font-size: 20px;
    }
    .av--me {
      background: var(--fl-lime, var(--cta));
      color: var(--fl-lime-ink, var(--cta-ink));
    }
    .name {
      font-size: 15px;
      color: var(--ink);
      line-height: 1.3;
    }
    .label {
      font-size: 11.5px;
      color: var(--muted);
    }
    .row {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 8px;
    }
    .seg button {
      height: 34px;
    }
    .targets,
    .picks {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }
    .chip {
      height: 36px;
      cursor: pointer;
    }
    .size {
      font-size: 11px;
      opacity: 0.75;
    }
    .send {
      justify-self: start;
    }

    .out {
      display: grid;
      gap: 2px;
      margin: 2px 0 0;
      padding: 0;
      list-style: none;

      li {
        display: grid;
        grid-template-columns: 18px minmax(0, 1fr) auto;
        align-items: center;
        gap: 10px;
        padding: 8px 10px;
        border-radius: var(--r-inner);
        background: var(--bg-2, var(--bg));
      }
      ng-icon {
        font-size: 16px;
        color: var(--ink-2);
      }
      p {
        font-size: 13px;
        color: var(--ink);
        overflow-wrap: anywhere;
      }
      .st {
        font-size: 11.5px;
        color: var(--fl-lime, var(--ink-2));
      }
    }
    .muted {
      margin-left: 4px;
      color: var(--muted);
    }
    .link-btn {
      min-height: 36px;
      padding: 0 8px;
      border-radius: 999px;
      font-size: 13px;
      font-weight: 500;
      color: var(--ink);
      background: none;
      border: 0;
      cursor: pointer;
      text-decoration: underline;
      text-underline-offset: 3px;
      text-decoration-color: var(--line-strong);

      &:hover {
        text-decoration-color: currentColor;
      }
    }

    .peers {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 1px;
      background: var(--line);
    }
    .peer,
    .join {
      display: grid;
      gap: 12px;
      align-content: start;
      padding: 16px;
      background: var(--surface);
      min-width: 0;
    }
    .join {
      align-content: center;
      justify-items: start;

      p {
        font-size: 13px;
        color: var(--muted);
        max-width: 24ch;
      }
    }
    .empty {
      font-size: 13px;
      color: var(--muted);
    }
    .inbox {
      display: grid;
      gap: 8px;
      margin: 0;
      padding: 0;
      list-style: none;
    }
    .msg {
      display: grid;
      gap: 8px;
      padding: 10px 12px;
      border-radius: var(--r-inner);
      background: var(--surface-2);
      border: 1px solid transparent;

      &.is-new {
        border-color: var(--fl-lime-line, var(--line-strong));
      }
    }
    .head {
      font-size: 12.5px;
      color: var(--ink-2);
    }
    .head b {
      color: var(--ink);
    }
    .text {
      font-size: 13.5px;
      color: var(--ink);
      overflow-wrap: anywhere;
    }
    .file {
      display: grid;
      grid-template-columns: 30px minmax(0, 1fr);
      align-items: center;
      gap: 10px;

      ng-icon {
        width: 30px;
        height: 30px;
        display: grid;
        place-items: center;
        border-radius: 9px;
        background: var(--bg-2, var(--bg));
        font-size: 16px;
        color: var(--ink-2);
      }
    }
    .fname {
      font-size: 13px;
      font-weight: 500;
      color: var(--ink);
      overflow-wrap: anywhere;
    }
    .fsize {
      font-size: 11.5px;
      color: var(--muted);
    }
    .track {
      height: 6px;
      border-radius: 999px;
      background: var(--bg-2, var(--bg));
      overflow: hidden;

      i {
        display: block;
        height: 100%;
        background: var(--fl-lime, var(--ink));
        transform-origin: left;
        transform: scaleX(0);
      }
    }
    .acts {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 4px;

      &:empty {
        display: none;
      }
    }
    .ok {
      background: var(--fl-lime-soft, var(--accent-soft));
      color: var(--fl-lime, var(--ink));
    }
    .more {
      font-size: 11.5px;
      color: var(--muted);
    }

    @media (max-width: 560px) {
      .peers {
        grid-template-columns: 1fr;
      }
    }
    @media (prefers-reduced-motion: no-preference) {
      .track i {
        transition: transform ${TICK_MS}ms linear;
      }
    }
  `,
})
export class FlickNearbyDemo {
  protected readonly me = ME;
  protected readonly samples = SAMPLES;
  protected readonly peers = PEERS;
  protected readonly plural = plural;
  protected readonly fmt = bytes;

  protected readonly mode = signal<'all' | 'one'>('all');
  protected readonly target = signal('heron');
  protected readonly pick = signal('pdf');
  protected readonly online = signal<string[]>(['heron']);
  protected readonly items = signal<Item[]>([]);
  protected readonly deliveries = signal<Delivery[]>([]);
  protected readonly announce = signal('');

  private nextId = 1;
  private timer: ReturnType<typeof setInterval> | null = null;

  protected readonly onlinePeers = computed(() => PEERS.filter((p) => this.online().includes(p.id)));
  protected readonly dirty = computed(() => this.items().length > 0 || this.online().length > 1);

  protected readonly sendLabel = computed(() => {
    const s = this.sample();
    if (this.mode() === 'all') return s.kind === 'text' ? 'Share with everyone' : `Share ${s.name} with everyone`;
    return `Send to ${this.peerName(this.target())}`;
  });

  /** The newest three things you shared, each with the status line the real app shows. */
  protected readonly outbox = computed(() => {
    const ds = this.deliveries();
    const online = this.online();
    return this.items()
      .slice(-3)
      .reverse()
      .map((item) => ({ item, status: this.statusFor(item, ds.filter((d) => d.itemId === item.id && online.includes(d.peerId))) }));
  });

  constructor() {
    inject(DestroyRef).onDestroy(() => this.stop());
  }

  protected peerName(id: string): string {
    return PEERS.find((p) => p.id === id)?.name ?? 'device';
  }

  protected chunks(n: number): string {
    return Math.ceil(n / CHUNK).toLocaleString('en-US');
  }

  protected pct(d: Delivery & { item: Item }): number {
    return Math.round((100 * d.received) / d.item.sample.size);
  }

  protected verb(d: Delivery & { item: Item }): string {
    const s = d.item.sample;
    if (s.kind === 'text') return d.item.all ? 'shared text with everyone' : 'sent you text';
    if (d.status === 'pending') return d.item.all ? 'shared a file' : 'wants to send you a file';
    if (d.status === 'receiving') return 'is sending a file';
    if (d.status === 'cancelled') return 'sent a file · transfer cancelled';
    return d.item.all ? 'shared a file' : 'sent you a file';
  }

  /** What one device's inbox shows: newest first, the latest two, and a count of the rest. */
  protected inbox(peerId: string): { shown: (Delivery & { item: Item })[]; more: number } {
    const items = this.items();
    const list = this.deliveries()
      .filter((d) => d.peerId === peerId && d.status !== 'declined')
      .map((d) => ({ ...d, item: items.find((i) => i.id === d.itemId)! }))
      .filter((d) => d.item)
      .reverse();
    return { shown: list.slice(0, 2), more: Math.max(0, list.length - 2) };
  }

  protected send(): void {
    const sample = this.sample();
    const all = this.mode() === 'all';
    const item: Item = { id: this.nextId++, sample, all, to: all ? undefined : this.target() };
    this.items.update((list) => [...list, item]);
    const to = all ? this.online() : [this.target()];
    to.forEach((peerId) => this.deliver(item, peerId));
    if (all) {
      this.say(`Shared ${sample.name} with ${plural(to.length, 'device')} nearby.`);
    } else {
      this.say(sample.kind === 'text' ? `Text sent to ${this.peerName(item.to!)}.` : `Waiting for ${this.peerName(item.to!)} to accept ${sample.name}.`);
    }
  }

  /** A device opens Flick later: it is handed everything on the board, like onHello in the real app. */
  protected join(): void {
    const peer = PEERS.find((p) => !this.online().includes(p.id));
    if (!peer) return;
    this.online.update((ids) => [...ids, peer.id]);
    const board = this.items().filter((i) => i.all);
    board.forEach((item) => this.deliver(item, peer.id));
    this.say(`${peer.name} is here${board.length ? ` and received ${plural(board.length, 'shared item')}` : ''}.`);
  }

  protected accept(d: Delivery): void {
    this.patch(d, { status: 'receiving' });
    this.say(`${this.peerName(d.peerId)} accepted. Receiving in 64 KB chunks.`);
    this.start();
  }

  protected decline(d: Delivery): void {
    this.patch(d, { status: 'declined' });
    this.say(`${this.peerName(d.peerId)} said no. Nothing was sent.`);
  }

  protected cancel(d: Delivery): void {
    this.patch(d, { status: 'cancelled' });
    this.say('Transfer cancelled on both sides.');
  }

  protected remove(d: Delivery): void {
    this.deliveries.update((list) => list.filter((x) => !(x.itemId === d.itemId && x.peerId === d.peerId)));
  }

  /** Stop sharing: the item leaves the board and every inbox that has not finished receiving it. */
  protected unshare(item: Item): void {
    this.items.update((list) => list.filter((i) => i !== item));
    this.deliveries.update((list) => list.filter((d) => d.itemId !== item.id || d.status === 'done'));
    this.say(`Stopped sharing ${item.sample.name}.`);
  }

  protected reset(): void {
    this.stop();
    this.items.set([]);
    this.deliveries.set([]);
    this.online.set(['heron']);
    this.target.set('heron');
    this.say('Reset. Calm Heron is the only other device.');
  }

  private sample(): Sample {
    return SAMPLES.find((s) => s.id === this.pick())!;
  }

  private deliver(item: Item, peerId: string): void {
    if (this.deliveries().some((d) => d.itemId === item.id && d.peerId === peerId)) return;
    const status: Status = item.sample.kind === 'text' ? 'text' : 'pending';
    this.deliveries.update((list) => [...list, { itemId: item.id, peerId, status, received: 0 }]);
  }

  private patch(d: Delivery, change: Partial<Delivery>): void {
    this.deliveries.update((list) => list.map((x) => (x.itemId === d.itemId && x.peerId === d.peerId ? { ...x, ...change } : x)));
  }

  /** The status line the sender sees: boardStatus() for the board, the device tile's wording for one device. */
  private statusFor(item: Item, ds: Delivery[]): string {
    if (item.all) {
      if (item.sample.kind === 'text') return ds.length ? `Seen by ${plural(ds.length, 'device')}` : 'Waiting for devices to join';
      const moving = ds.filter((d) => d.status === 'receiving');
      const got = ds.filter((d) => d.status === 'done').length;
      const waiting = ds.filter((d) => d.status === 'pending').length;
      const parts: string[] = [];
      if (moving.length) {
        const pct = Math.floor((100 * moving.reduce((s, d) => s + d.received, 0)) / (moving.length * item.sample.size));
        parts.push(`Sending to ${plural(moving.length, 'device')} · ${pct}%`);
      }
      if (got) parts.push(`${got} downloaded`);
      if (waiting) parts.push(`${waiting} not downloaded yet`);
      return parts.length ? parts.join(' · ') : 'Waiting for devices to join';
    }
    const name = this.peerName(item.to!);
    const d = ds[0];
    if (!d) return `${name} left`;
    if (item.sample.kind === 'text') return `Text sent to ${name}`;
    switch (d.status) {
      case 'pending':
        return `Waiting for ${name} to accept`;
      case 'receiving':
        return `Sending ${bytes(d.received)} of ${bytes(item.sample.size)}`;
      case 'done':
        return `${name} got ${item.sample.name}`;
      case 'declined':
        return `${name} declined ${item.sample.name}`;
      default:
        return `${name} stopped the transfer`;
    }
  }

  private start(): void {
    if (this.timer) return;
    this.timer = setInterval(() => this.tick(), TICK_MS);
  }

  private stop(): void {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
  }

  /** Small files land in about a second, the 240 MB video in about four. */
  private tick(): void {
    let moving = 0;
    const finished: string[] = [];
    this.deliveries.update((list) =>
      list.map((d) => {
        if (d.status !== 'receiving') return d;
        const item = this.items().find((i) => i.id === d.itemId);
        if (!item) return d;
        const size = item.sample.size;
        const steps = size > 100 * MB ? 50 : 14;
        const received = Math.min(size, d.received + Math.ceil(size / steps / CHUNK) * CHUNK);
        if (received >= size) {
          finished.push(`${this.peerName(d.peerId)} got ${item.sample.name}.`);
          return { ...d, received: size, status: 'done' as Status };
        }
        moving++;
        return { ...d, received };
      }),
    );
    if (finished.length) this.say(finished.join(' '));
    if (!moving) this.stop();
  }

  private say(text: string): void {
    this.announce.set(text);
  }
}
