import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { Skeleton } from '../../../shared/ui/skeleton';
import { COPY, CUES, REEL } from './sizzle.copy';
import { timecode } from './scrubber';

/**
 * The Sizzle trailer itself (the 720 x 1280 web copy of the 4K render), with its cue list beside it. The video loads
 * nothing until it scrolls into view (@defer on viewport, preload none), starts muted, and pauses whenever it leaves
 * the screen or the tab is hidden. The cue list is a list of buttons that seek the video; the playing cue is marked.
 */
@Component({
  selector: 'mh-sz-trailer',
  imports: [Skeleton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <figure class="film">
      <div class="media">
        @defer (on viewport) {
          <video
            #film
            controls
            [muted]="true"
            playsinline
            preload="none"
            width="720"
            height="1280"
            [poster]="reel.poster"
            [attr.aria-label]="t.video"
            (timeupdate)="onTime($event)"
          >
            <source [src]="reel.src" type="video/mp4" />
          </video>
        } @placeholder (minimum 300ms) {
          <mh-skeleton shape="block" ratio="9/16" />
        }
      </div>
      <figcaption>{{ t.muted }}</figcaption>
    </figure>

    <div class="cues">
      <h3 class="mini">{{ t.cuesTitle }}</h3>
      <ol role="list">
        @for (c of cues; track c.name; let i = $index) {
          <li>
            <button type="button" [class.on]="i === current()" [attr.aria-current]="i === current() ? 'true' : null" (click)="jump(i)">
              <span class="tc mono">{{ tc(c.t) }}</span>
              <span class="nm">{{ c.name }}</span>
              <span class="nt">{{ c.note }}</span>
            </button>
          </li>
        }
      </ol>
    </div>
  `,
  styles: `
    :host {
      display: grid;
      grid-template-columns: minmax(0, 300px) minmax(0, 1fr);
      gap: 32px;
      align-items: start;
    }
    .film {
      margin: 0;
      position: sticky;
      top: calc(var(--nav-h) + 32px);
    }
    .media {
      position: relative;
      aspect-ratio: 9 / 16;
      border-radius: var(--r-card);
      overflow: hidden;
      background: #000;
      border: 1px solid var(--line-strong);
      box-shadow: var(--shadow-lg);
    }
    video {
      display: block;
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    mh-skeleton {
      position: absolute;
      inset: 0;
    }
    figcaption {
      padding: 10px 4px 0;
      font-size: 12.5px;
      color: var(--muted);
      text-align: center;
    }
    .mini {
      margin: 0 0 10px;
      font-size: 13px;
      font-weight: 600;
      color: var(--muted);
    }
    ol {
      display: grid;
      margin: 0;
      padding: 0;
      border-top: 1px solid var(--line);
    }
    li {
      border-bottom: 1px solid var(--line);
    }
    button {
      display: grid;
      grid-template-columns: 104px 120px minmax(0, 1fr);
      gap: 4px 14px;
      align-items: baseline;
      width: 100%;
      min-height: 44px;
      padding: 10px 12px;
      border-radius: 10px;
      text-align: left;
      color: var(--ink-2);
      transition: background var(--t-base) var(--ease), color var(--t-base) var(--ease);
    }
    button:hover {
      background: var(--surface);
      color: var(--ink);
    }
    button.on {
      background: var(--sz-bronze-soft);
    }
    .tc {
      font-size: 12px;
      color: var(--muted);
      font-variant-numeric: tabular-nums;
    }
    .on .tc {
      color: var(--sz-bronze-hi);
    }
    .nm {
      font-size: 14.5px;
      font-weight: 600;
      color: var(--ink);
    }
    .nt {
      font-size: 13.5px;
      line-height: 1.5;
    }
    @media (max-width: 860px) {
      :host {
        grid-template-columns: 1fr;
        gap: 24px;
      }
      .film {
        position: static;
        width: min(100%, 300px);
        justify-self: center;
      }
      button {
        grid-template-columns: 96px minmax(0, 1fr);
      }
      .nt {
        grid-column: 2;
      }
    }
  `,
})
export class SizzleTrailer {
  protected readonly t = COPY.trailer;
  protected readonly cues = CUES;
  protected readonly reel = REEL;
  protected readonly current = signal(-1);
  private readonly film = viewChild<ElementRef<HTMLVideoElement>>('film');

  protected readonly tc = (s: number) => timecode(Math.round(s * REEL.fps));

  constructor() {
    const host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    const destroy = inject(DestroyRef);
    afterNextRender(() => {
      const pause = () => this.film()?.nativeElement.pause();
      const io = new IntersectionObserver(([e]) => !e.isIntersecting && pause(), { threshold: 0.15 });
      io.observe(host);
      const onHide = () => document.hidden && pause();
      document.addEventListener('visibilitychange', onHide);
      destroy.onDestroy(() => {
        io.disconnect();
        document.removeEventListener('visibilitychange', onHide);
      });
    });
  }

  protected onTime(e: Event): void {
    const s = (e.target as HTMLVideoElement).currentTime;
    let i = -1;
    for (let k = 0; k < CUES.length; k++) if (CUES[k].t <= s + 0.01) i = k;
    if (i !== this.current()) this.current.set(i);
  }

  protected jump(i: number): void {
    const v = this.film()?.nativeElement;
    this.current.set(i);
    if (!v) return;
    v.currentTime = CUES[i].t;
    v.play().catch(() => undefined);
  }
}
