import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { phosphorArrowRight, phosphorCheck, phosphorCopy } from '@ng-icons/phosphor-icons/regular';
import { SCOPE_COPY } from './hire.copy';

type TypeValue = (typeof SCOPE_COPY.types)[number]['value'];
type StartValue = (typeof SCOPE_COPY.starts)[number]['value'];
type FocusValue = (typeof SCOPE_COPY.focus)[number]['value'];

/**
 * Hero card on /hire, the counterpart of Quorum's "Build your Quorum": pick a project type, focus areas
 * and a start window, read the brief it composes, then copy it or carry it into /contact as query params
 * (topic, timeline, brief). Single choices are native radios styled as chips (arrow keys work);
 * focus areas are aria-pressed toggles.
 */
@Component({
  selector: 'mh-scope-builder',
  imports: [RouterLink, NgIcon],
  viewProviders: [provideIcons({ phosphorArrowRight, phosphorCopy, phosphorCheck })],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="builder card card--lift" aria-labelledby="scope-title">
      <div class="builder__head">
        <h2 id="scope-title">{{ t.title }}</h2>
        <span class="count mono" aria-hidden="true">{{ picked() }} picked</span>
      </div>

      <fieldset class="group">
        <legend>{{ t.typeLegend }}</legend>
        <div class="chips">
          @for (o of t.types; track o.value) {
            <label class="chip">
              <input
                class="sr-only"
                type="radio"
                name="scope-type"
                [value]="o.value"
                [checked]="type() === o.value"
                (change)="type.set(o.value)"
              />
              {{ o.label }}
            </label>
          }
        </div>
      </fieldset>

      <fieldset class="group">
        <legend>
          {{ t.focusLegend }} <span class="muted">{{ t.focusHint }}</span>
        </legend>
        <div class="chips">
          @for (o of t.focus; track o.value) {
            <button
              type="button"
              class="chip"
              [attr.aria-pressed]="focus().includes(o.value)"
              (click)="toggle(o.value)"
            >
              {{ o.label }}
            </button>
          }
        </div>
      </fieldset>

      <fieldset class="group">
        <legend>{{ t.startLegend }}</legend>
        <div class="chips">
          @for (o of t.starts; track o.value) {
            <label class="chip">
              <input
                class="sr-only"
                type="radio"
                name="scope-start"
                [value]="o.value"
                [checked]="start() === o.value"
                (change)="start.set(o.value)"
              />
              {{ o.label }}
            </label>
          }
        </div>
      </fieldset>

      <div class="out" role="group" [attr.aria-label]="t.outLabel">
        <code id="scope-brief" aria-live="polite">{{ brief() }}</code>
        <button type="button" class="copy" [attr.aria-label]="t.copyLabel" (click)="copy()">
          <ng-icon [name]="copied() ? 'phosphorCheck' : 'phosphorCopy'" aria-hidden="true" />
          <span aria-hidden="true">{{ copied() ? t.copied : t.copy }}</span>
        </button>
      </div>
      <p class="sr-only" aria-live="polite">{{ copied() ? t.copiedSr : '' }}</p>

      <a
        class="btn btn-solid go"
        routerLink="/contact"
        [queryParams]="params()"
        aria-describedby="scope-note"
      >
        {{ t.continue }}<ng-icon name="phosphorArrowRight" aria-hidden="true" />
      </a>
      <p id="scope-note" class="note">{{ t.note }}</p>
    </section>
  `,
  styles: `
    :host {
      display: block;
      position: relative;
      padding-top: 18px;
    }
    /* Quorum: a second card peeks out behind the builder */
    :host::before {
      content: '';
      position: absolute;
      left: 6%;
      right: 6%;
      top: 0;
      height: 60px;
      border-radius: var(--r-card);
      background: var(--surface-2);
      border: 1px solid var(--line);
    }
    .builder {
      position: relative;
      padding: 22px;
    }
    .builder__head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      margin-bottom: 6px;
    }
    h2 {
      font-size: 17px;
      letter-spacing: -0.01em;
      margin: 0;
    }
    .count {
      color: var(--muted);
    }
    .group {
      border: 0;
      margin: 0;
      padding: 0;
      min-width: 0;
      margin-top: 16px;
    }
    legend {
      padding: 0;
      margin-bottom: 8px;
      font-size: 13px;
      font-weight: 500;
      color: var(--ink-2);
    }
    legend .muted {
      font-weight: 400;
      margin-left: 6px;
    }
    .chips {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }
    label.chip {
      cursor: pointer;
      position: relative;
    }
    label.chip:has(:checked) {
      background: var(--cta);
      color: var(--cta-ink);
      border-color: var(--cta);
    }
    label.chip:has(:focus-visible) {
      outline: 2px solid var(--accent);
      outline-offset: 2px;
    }
    .out {
      margin-top: 20px;
      border-radius: var(--r-inner);
      background: var(--solid);
      color: var(--solid-ink);
      border: 1px solid var(--solid-edge);
      padding: 12px 12px 12px 16px;
      display: flex;
      align-items: center;
      gap: 12px;
      min-height: 76px;
    }
    .out code {
      flex: 1;
      min-width: 0;
      font-size: 13px;
      line-height: 1.55;
      word-break: break-word;
    }
    .go {
      width: 100%;
      margin-top: 14px;
    }
    .note {
      margin-top: 10px;
      font-size: 13px;
      color: var(--muted);
      text-align: center;
    }
    @media (max-width: 480px) {
      .builder {
        padding: 18px;
      }
      .out {
        flex-direction: column;
        align-items: stretch;
      }
      .out .copy {
        align-self: flex-end;
      }
    }
  `,
})
export class ScopeBuilder {
  protected readonly t = SCOPE_COPY;

  protected readonly type = signal<TypeValue>('build');
  protected readonly focus = signal<FocusValue[]>(['angular']);
  protected readonly start = signal<StartValue>('month');
  protected readonly copied = signal(false);

  protected readonly picked = computed(() => 2 + this.focus().length);

  /** Plain-English brief, also what lands in the contact form. */
  protected readonly brief = computed(() => {
    const type = this.t.types.find((o) => o.value === this.type())!;
    const start = this.t.starts.find((o) => o.value === this.start())!;
    // Keep the order of the chips, not the order of clicks.
    const focus = this.t.focus.filter((o) => this.focus().includes(o.value)).map((o) => o.phrase);
    const focusText = focus.length ? `, focused on ${joinList(focus)}` : '';
    return `${type.phrase}${focusText}, ${start.phrase}.`;
  });

  protected readonly params = computed(() => {
    const type = this.t.types.find((o) => o.value === this.type())!;
    return { topic: type.topic, timeline: this.start(), brief: this.brief() };
  });

  private timer: ReturnType<typeof setTimeout> | undefined;

  constructor() {
    inject(DestroyRef).onDestroy(() => clearTimeout(this.timer));
  }

  protected toggle(v: FocusValue): void {
    this.focus.update((list) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]));
  }

  protected async copy(): Promise<void> {
    try {
      await navigator.clipboard.writeText(this.brief());
      this.copied.set(true);
      clearTimeout(this.timer);
      this.timer = setTimeout(() => this.copied.set(false), 1800);
    } catch {
      // Clipboard blocked: the brief stays visible and selectable.
    }
  }
}

function joinList(items: string[]): string {
  if (items.length < 2) return items.join('');
  return `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`;
}
