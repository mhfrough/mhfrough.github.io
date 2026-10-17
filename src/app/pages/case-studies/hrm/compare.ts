import { ChangeDetectionStrategy, Component, input, signal } from '@angular/core';

/**
 * Before/after slider: the same HRM Suite screen in the light theme (left) and the dark theme (right). A native
 * range input sits over the pair, so it works with a keyboard and a screen reader; the divider is decorative.
 */
@Component({
  selector: 'mh-hrm-compare',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <figure class="cmp">
      <div class="frame" [style.--pos.%]="pos()">
        <img class="base" [src]="dark()" width="1600" height="1000" [alt]="darkAlt()" loading="lazy" decoding="async" />
        <img class="top" [src]="light()" width="1600" height="1000" [alt]="lightAlt()" loading="lazy" decoding="async" />
        <span class="divider" aria-hidden="true"><i></i></span>
        <span class="side-tag mono t-l" aria-hidden="true">Light</span>
        <span class="side-tag mono t-d" aria-hidden="true">Dark</span>
        <input
          type="range"
          min="0"
          max="100"
          step="1"
          [value]="pos()"
          [attr.aria-label]="label()"
          [attr.aria-valuetext]="pos() + '% light theme'"
          (input)="pos.set(+$any($event.target).value)"
        />
      </div>
    </figure>
  `,
  styles: `
    :host {
      display: block;
    }

    .cmp {
      margin: 0;
    }

    .frame {
      position: relative;
      border-radius: 14px;
      overflow: hidden;
      border: 1px solid var(--line);
      box-shadow: var(--shadow-lg);
      background: var(--surface);
    }

    img {
      display: block;
      width: 100%;
      height: auto;
    }

    .top {
      position: absolute;
      inset: 0;
      clip-path: inset(0 calc(100% - var(--pos)) 0 0);
    }

    .divider {
      position: absolute;
      top: 0;
      bottom: 0;
      left: var(--pos);
      width: 2px;
      margin-left: -1px;
      background: #fff;
      box-shadow: 0 0 0 1px rgb(0 0 0 / 0.25);
      pointer-events: none;

      i {
        position: absolute;
        top: 50%;
        left: 50%;
        width: 36px;
        height: 36px;
        margin: -18px 0 0 -18px;
        border-radius: 50%;
        background: #fff;
        box-shadow: 0 4px 14px rgb(0 0 0 / 0.35);

        &::before,
        &::after {
          content: '';
          position: absolute;
          top: 50%;
          width: 0;
          height: 0;
          margin-top: -5px;
          border: 5px solid transparent;
        }

        &::before {
          left: 6px;
          border-right-color: #0b0f17;
        }

        &::after {
          right: 6px;
          border-left-color: #0b0f17;
        }
      }
    }

    .side-tag {
      position: absolute;
      bottom: 12px;
      padding: 3px 9px;
      border-radius: 999px;
      font-size: 12px;
      pointer-events: none;
    }

    .t-l {
      left: 12px;
      background: #ffffff;
      color: #172033;
      box-shadow: 0 1px 3px rgb(0 0 0 / 0.2);
    }

    .t-d {
      right: 12px;
      background: #0b0f17;
      color: #e7ecf4;
      border: 1px solid #243044;
    }

    input {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      margin: 0;
      opacity: 0;
      cursor: ew-resize;
    }

    .frame:has(input:focus-visible) {
      outline: 2px solid var(--focus);
      outline-offset: 3px;
    }
  `,
})
export class HrmCompare {
  readonly light = input.required<string>();
  readonly dark = input.required<string>();
  readonly lightAlt = input.required<string>();
  readonly darkAlt = input.required<string>();
  readonly label = input('Compare the light and dark themes');
  protected readonly pos = signal(50);
}
