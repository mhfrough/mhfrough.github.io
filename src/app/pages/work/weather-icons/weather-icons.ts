import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  computed,
  inject,
  signal,
} from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { phosphorArrowUpRight, phosphorCheck, phosphorCopy, phosphorDownloadSimple } from '@ng-icons/phosphor-icons/regular';
import { COPY } from '../work.copy';
import { WEATHER_ICONS, WEATHER_ICONS_DIR, WEATHER_PALETTE, WEATHER_TILE, WeatherIcon } from './weather-icons.data';

const COLS = 5;

type Mode = 'animated' | 'static';

/**
 * Weather icon set: the 5x5 grid of the original Dribbble shot plus an inspector (preview, sizes, meta, palette,
 * download and copy). The grid is one tab stop with arrow-key movement (roving tabindex).
 *
 * Motion: each icon has an animated twin in `animated/` (CSS keyframes inside the SVG, transform and opacity only).
 * Prerendered HTML uses the static files; the animated ones swap in only while the section is on screen, and
 * never under prefers-reduced-motion (the toggle is hidden and the static set stays).
 */
@Component({
  selector: 'mh-weather-icons',
  imports: [NgIcon],
  viewProviders: [provideIcons({ phosphorArrowUpRight, phosphorCheck, phosphorCopy, phosphorDownloadSimple })],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './weather-icons.html',
  styleUrl: './weather-icons.scss',
})
export class WeatherIcons {
  protected readonly t = COPY.icons;
  protected readonly icons = WEATHER_ICONS;
  protected readonly palette = WEATHER_PALETTE;
  protected readonly tile = WEATHER_TILE;
  protected readonly sizes = [32, 48, 64];
  protected readonly modes: Mode[] = ['animated', 'static'];

  protected readonly index = signal(WEATHER_ICONS.findIndex((i) => i.id === 'partly-sunny'));
  protected readonly current = computed(() => this.icons[this.index()]);
  protected readonly mode = signal<Mode>('static');
  protected readonly reduced = signal(false);
  private readonly visible = signal(false);
  /** Animated files are shown only when chosen, allowed and on screen (looping motion pauses off-screen). */
  private readonly moving = computed(() => this.mode() === 'animated' && !this.reduced() && this.visible());

  protected readonly copied = signal(false);
  protected readonly announcement = signal('');
  private copiedTimer?: ReturnType<typeof setTimeout>;

  constructor() {
    const host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
      const sync = () => {
        this.reduced.set(mq.matches);
        if (mq.matches) this.mode.set('static');
      };
      sync();
      mq.addEventListener('change', sync);

      const io = new IntersectionObserver(([e]) => this.visible.set(e.isIntersecting), { rootMargin: '120px 0px' });
      io.observe(host);
      destroyRef.onDestroy(() => {
        io.disconnect();
        mq.removeEventListener('change', sync);
        clearTimeout(this.copiedTimer);
      });
    });
  }

  /** What the page shows right now. */
  protected shown(icon: WeatherIcon): string {
    return this.path(icon, this.moving());
  }

  /** What Download and Copy hand over: the style picked in the toggle. */
  protected file(icon: WeatherIcon): string {
    return this.path(icon, this.mode() === 'animated');
  }

  protected fileName(icon: WeatherIcon): string {
    return this.mode() === 'animated' ? `${icon.id}-animated.svg` : `${icon.id}.svg`;
  }

  protected fileSize(icon: WeatherIcon): string {
    const bytes = this.mode() === 'animated' ? icon.animatedBytes : icon.bytes;
    return bytes < 1024 ? `${bytes} B` : `${(bytes / 1024).toFixed(1)} KB`;
  }

  private path(icon: WeatherIcon, animated: boolean): string {
    return `${WEATHER_ICONS_DIR}/${animated ? 'animated/' : ''}${icon.id}.svg`;
  }

  protected setMode(m: Mode): void {
    this.mode.set(m);
    this.copied.set(false);
  }

  protected select(i: number, focus = false, el?: HTMLElement): void {
    if (i !== this.index()) {
      this.index.set(i);
      this.copied.set(false);
      this.announcement.set(this.t.selectedAnnounce(this.icons[i].name));
    }
    if (focus) {
      const btn = el?.closest('.grid')?.querySelectorAll<HTMLButtonElement>('button')[i];
      btn?.focus();
    }
  }

  protected onKey(e: KeyboardEvent): void {
    const n = this.icons.length;
    const i = this.index();
    const next: Record<string, number> = {
      ArrowRight: Math.min(i + 1, n - 1),
      ArrowLeft: Math.max(i - 1, 0),
      ArrowDown: Math.min(i + COLS, n - 1),
      ArrowUp: Math.max(i - COLS, 0),
      Home: 0,
      End: n - 1,
    };
    if (!(e.key in next)) return;
    e.preventDefault();
    this.select(next[e.key], true, e.target as HTMLElement);
  }

  protected async copy(): Promise<void> {
    const icon = this.current();
    try {
      const svg = await fetch(this.file(icon)).then((r) => r.text());
      await navigator.clipboard.writeText(svg);
      this.copied.set(true);
      this.announcement.set(this.t.copiedAnnounce(icon.name));
      clearTimeout(this.copiedTimer);
      this.copiedTimer = setTimeout(() => this.copied.set(false), 1800);
    } catch {
      // Clipboard blocked (permissions or insecure context): the download link still works.
    }
  }
}
