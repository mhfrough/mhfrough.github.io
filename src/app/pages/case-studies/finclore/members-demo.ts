import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { phosphorArrowCounterClockwise, phosphorTrash, phosphorUserPlus } from '@ng-icons/phosphor-icons/regular';

/**
 * The wizard's members step as my own working mockup. Same rules as the original form: at least one person, every
 * share capped at what the others leave of 100% (the field's max moves as you type), shares optional, and exactly
 * one contact person for the order. Invented people; the real step also asks for email, phone and address, which
 * are left out here.
 */
interface Member {
  id: number;
  name: string;
  position: string;
  share: number;
}

const POSITIONS = ['Member', 'Manager', 'Member and manager'];
const TONES = ['var(--f-navy)', 'var(--f-red)', 'var(--f-blue)', 'var(--f-slate)'];
const SEED: Member[] = [
  { id: 1, name: 'Founder A', position: 'Member and manager', share: 60 },
  { id: 2, name: 'Founder B', position: 'Member', share: 25 },
];
const MAX_PEOPLE = 4;

@Component({
  selector: 'mh-finclore-members',
  imports: [NgIcon],
  viewProviders: [provideIcons({ phosphorArrowCounterClockwise, phosphorTrash, phosphorUserPlus })],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="mem card">
      <div class="top">
        <div class="alloc">
          <p class="alloc-t">
            <b class="mono">{{ used() }}%</b> allocated, <b class="mono">{{ 100 - used() }}%</b> left
          </p>
          <div class="track" role="img" [attr.aria-label]="used() + ' percent of the company allocated'">
            @for (m of members(); track m.id; let i = $index) {
              <span [style.flex-basis.%]="m.share" [style.background]="tone(i)"></span>
            }
          </div>
        </div>
        <button type="button" class="reset" aria-label="Reset the sample members" (click)="reset()">
          <ng-icon name="phosphorArrowCounterClockwise" aria-hidden="true" />
        </button>
      </div>

      <ul class="rows" role="list">
        @for (m of members(); track m.id; let i = $index) {
          <li class="row">
            <span class="dot" [style.background]="tone(i)" aria-hidden="true"></span>
            <div class="field f-name">
              <label class="field__label" [for]="'fm-n-' + m.id">Name</label>
              <input class="input" [id]="'fm-n-' + m.id" [value]="m.name" (input)="patch(m.id, { name: $any($event.target).value })" />
            </div>
            <div class="field f-pos">
              <label class="field__label" [for]="'fm-p-' + m.id">Position</label>
              <select class="select" [id]="'fm-p-' + m.id" [value]="m.position" (change)="patch(m.id, { position: $any($event.target).value })">
                @for (p of positions; track p) {
                  <option [value]="p" [selected]="p === m.position">{{ p }}</option>
                }
              </select>
            </div>
            <div class="field f-share">
              <label class="field__label" [for]="'fm-s-' + m.id">Shares (%)</label>
              <input
                class="input mono"
                type="number"
                inputmode="numeric"
                min="0"
                [max]="max(m)"
                [id]="'fm-s-' + m.id"
                [value]="m.share"
                [attr.aria-describedby]="'fm-s-h-' + m.id"
                (input)="setShare(m, $any($event.target))"
              />
              <span class="field__hint mono" [id]="'fm-s-h-' + m.id">max {{ max(m) }}</span>
            </div>
            <label class="contact">
              <input
                type="radio"
                name="fm-contact"
                [checked]="contact() === m.id"
                [attr.aria-label]="'Contact person: ' + (m.name || 'this person')"
                (change)="contact.set(m.id)"
              />
              <span>Contact</span>
            </label>
            <button
              type="button"
              class="del"
              [disabled]="members().length === 1"
              [attr.aria-label]="'Remove ' + (m.name || 'this person')"
              (click)="remove(m.id)"
            >
              <ng-icon name="phosphorTrash" aria-hidden="true" />
            </button>
          </li>
        }
      </ul>

      <div class="foot">
        <button type="button" class="btn btn-ghost btn-sm" [disabled]="members().length >= maxPeople" (click)="add()">
          <ng-icon name="phosphorUserPlus" aria-hidden="true" /> Add new person
        </button>
        <p class="mono note" aria-live="polite">{{ note() }}</p>
      </div>
    </div>
  `,
  styles: `
    :host {
      display: block;
    }
    .mem {
      display: grid;
      gap: 16px;
      padding: 20px;
    }
    .top {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .alloc {
      flex: 1;
      display: grid;
      gap: 8px;
    }
    .alloc-t {
      font-size: 13.5px;
      color: var(--ink-2);

      b {
        color: var(--ink);
        font-weight: 600;
      }
    }
    .track {
      display: flex;
      height: 12px;
      border-radius: 999px;
      overflow: hidden;
      background: repeating-linear-gradient(135deg, var(--surface-2) 0 6px, var(--bg) 6px 12px);
      box-shadow: inset 0 0 0 1px var(--line);

      span {
        flex-grow: 0;
        flex-shrink: 0;
        transition: flex-basis var(--t-base) var(--ease);
      }
      span + span {
        box-shadow: -2px 0 0 var(--surface);
      }
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
    .rows {
      display: grid;
      gap: 8px;
    }
    .row {
      display: grid;
      grid-template-columns: 10px minmax(0, 1.3fr) minmax(0, 1.2fr) 112px auto 44px;
      align-items: end;
      gap: 12px;
      padding: 12px 12px 12px 14px;
      border-radius: var(--r-inner);
      border: 1px solid var(--line);
      background: var(--bg);
    }
    .dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      margin-bottom: 18px;
    }
    .field {
      display: grid;
      gap: 4px;
      min-width: 0;

      .input,
      .select {
        height: 44px;
        font-size: 14px;
        background: var(--surface);
      }
    }
    .f-share {
      position: relative;
    }
    .field__hint {
      position: absolute;
      top: 0;
      right: 4px;
      font-size: 12px;
      color: var(--muted);
    }
    .contact {
      display: flex;
      align-items: center;
      gap: 6px;
      min-height: 44px;
      font-size: 13px;
      color: var(--ink-2);
      cursor: pointer;

      input {
        width: 18px;
        height: 18px;
        accent-color: var(--f-navy);
      }
    }
    .del {
      width: 44px;
      height: 44px;
      display: grid;
      place-items: center;
      border-radius: 999px;
      color: var(--ink-2);
      font-size: 17px;

      &:hover:not([disabled]) {
        background: var(--f-red-soft);
        color: var(--f-red);
      }
      &[disabled] {
        opacity: 0.35;
        cursor: not-allowed;
      }
    }
    .foot {
      display: flex;
      align-items: center;
      gap: 14px;
      flex-wrap: wrap;

      .btn[disabled] {
        opacity: 0.45;
        cursor: not-allowed;
      }
    }
    .note {
      flex: 1;
      min-width: 200px;
      font-size: 12px;
      color: var(--muted);
    }
    @media (max-width: 760px) {
      .mem {
        padding: 14px;
      }
      .row {
        grid-template-columns: minmax(0, 1fr) auto 44px;
      }
      .dot {
        display: none;
      }
      .f-name,
      .f-pos {
        grid-column: 1 / -1;
      }
    }
  `,
})
export class FincloreMembersDemo {
  protected readonly positions = POSITIONS;
  protected readonly maxPeople = MAX_PEOPLE;
  protected readonly members = signal<Member[]>(SEED);
  protected readonly contact = signal(1);
  protected readonly note = signal('Invented people. Type a share above what is left and the form holds it at the cap.');
  private nextId = 3;

  protected readonly used = computed(() => this.members().reduce((sum, m) => sum + m.share, 0));

  protected tone(i: number): string {
    return TONES[i % TONES.length];
  }

  /** What this person may hold: 100 minus everyone else, as the original form's [max] did. */
  protected max(m: Member): number {
    return 100 - (this.used() - m.share);
  }

  protected patch(id: number, change: Partial<Member>): void {
    this.members.update((list) => list.map((m) => (m.id === id ? { ...m, ...change } : m)));
  }

  protected setShare(m: Member, el: HTMLInputElement): void {
    const raw = Math.max(0, Math.floor(Number(el.value) || 0));
    const cap = this.max(m);
    const share = Math.min(raw, cap);
    if (raw > cap) {
      el.value = String(share);
      this.note.set(`Shares can’t pass 100%. ${m.name || 'This person'} is held at ${cap}%.`);
    } else {
      this.note.set(share + this.used() - m.share === 100 ? 'The company is fully allocated.' : 'Shares are optional; managers can hold none.');
    }
    this.patch(m.id, { share });
  }

  protected add(): void {
    const id = this.nextId++;
    const letter = String.fromCharCode(64 + Math.min(id, 26));
    this.members.update((list) => [...list, { id, name: `Founder ${letter}`, position: 'Member', share: 0 }]);
    this.note.set(`Added. ${100 - this.used()}% is left to give.`);
  }

  protected remove(id: number): void {
    if (this.members().length === 1) return;
    this.members.update((list) => list.filter((m) => m.id !== id));
    if (this.contact() === id) this.contact.set(this.members()[0].id);
    this.note.set('Removed. The contact moves to the first person if it was them.');
  }

  protected reset(): void {
    this.members.set(SEED);
    this.contact.set(1);
    this.nextId = 3;
    this.note.set('Sample members reset.');
  }
}
