import { ChangeDetectionStrategy, Component, ElementRef, computed, input, signal, viewChild } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { phosphorCheck, phosphorCopy } from '@ng-icons/phosphor-icons/regular';
import { COPY } from '../brand.copy';
import { copyText, serializeChildren } from '../brand.util';

/**
 * Specimen frame: a live stage (projected content), a mono class caption and a "Copy markup" button.
 * The copied markup is serialized from the rendered stage at click time, so it cannot drift from the code.
 * Pass `markup` only when the stage holds Angular components (such as mh-logo) whose source differs from the DOM.
 */
@Component({
  selector: 'mh-spec',
  imports: [NgIcon],
  viewProviders: [provideIcons({ phosphorCopy, phosphorCheck })],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'spec', '[class.spec--wide]': 'wide()' },
  template: `
    <div [class]="stageClass()" #stage>
      <ng-content />
    </div>
    <div class="spec__cap">
      <div class="spec__meta">
        <span class="spec__name">{{ name() }}</span>
        <code class="spec__cls">{{ cls() }}</code>
      </div>
      <button type="button" class="btn btn--quiet btn-sm spec__copy" (click)="copy()">
        <ng-icon [name]="copied() ? 'phosphorCheck' : 'phosphorCopy'" aria-hidden="true" />
        {{ copied() ? t.copied : t.copy }}<span class="sr-only">: {{ name() }}</span>
      </button>
    </div>
    <p class="sr-only" aria-live="polite">{{ copied() ? t.copiedLive : '' }}</p>
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      min-width: 0;
      background: var(--surface);
      border: 1px solid var(--line);
      border-radius: var(--r-card);
      overflow: hidden;
    }
    .spec__stage {
      flex: 1;
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 12px;
      min-height: 132px;
      padding: 28px 26px;
    }
    .spec__stage--col {
      flex-direction: column;
      align-items: stretch;
      flex-wrap: nowrap;
    }
    .spec__stage--roomy {
      gap: 20px 24px;
    }
    .spec__stage--center {
      justify-content: center;
    }
    .spec__stage--bare {
      padding: 0;
      min-height: 0;
    }
    .spec__stage--sunk {
      background: var(--bg-2);
    }
    .spec__cap {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      padding: 8px 8px 8px 20px;
      border-top: 1px solid var(--line);
    }
    .spec__meta {
      display: flex;
      flex-wrap: wrap;
      align-items: baseline;
      gap: 2px 10px;
      min-width: 0;
    }
    .spec__name {
      font-size: 14px;
      font-weight: 500;
    }
    .spec__cls {
      font-size: 12px;
      color: var(--muted);
      overflow-wrap: anywhere;
    }
    .spec__copy {
      flex-shrink: 0;
      height: 36px;
      padding: 0 12px;
      font-size: 13px;
      gap: 6px;
    }
    .spec__copy ng-icon {
      font-size: 15px;
    }
  `,
})
export class Spec {
  readonly name = input.required<string>();
  readonly cls = input('');
  /** Stage layout: row (default), col, center, bare, sunk; combine with spaces. */
  readonly layout = input('row');
  readonly wide = input(false);
  /** Optional explicit source, for stages that render Angular components. */
  readonly markup = input<string | null>(null);

  protected readonly stageClass = computed(
    () => 'spec__stage ' + this.layout().split(' ').map((l) => 'spec__stage--' + l).join(' '),
  );
  protected readonly t = COPY.spec;
  protected readonly copied = signal(false);
  private readonly stage = viewChild.required<ElementRef<HTMLElement>>('stage');
  private timer: ReturnType<typeof setTimeout> | undefined;

  protected async copy(): Promise<void> {
    const text = this.markup() ?? serializeChildren(this.stage().nativeElement);
    if (!(await copyText(text))) return;
    this.copied.set(true);
    clearTimeout(this.timer);
    this.timer = setTimeout(() => this.copied.set(false), 1600);
  }
}
