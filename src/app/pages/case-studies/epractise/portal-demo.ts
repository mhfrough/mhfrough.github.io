import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  phosphorArrowCounterClockwise,
  phosphorCheck,
  phosphorFileText,
  phosphorLockSimple,
  phosphorUploadSimple,
  phosphorWarningCircle,
} from '@ng-icons/phosphor-icons/regular';

/**
 * One job seen from both sides (my own redraw, not a screenshot). Staff see the internal stage, a private folder and
 * every file to approve or send back with a remark; the client sees the firm's client-facing status for that
 * stage, what is still needed, and the remark on anything returned. Private folders never reach the portal, and
 * the portal only ever asks for the signed-in client's own account. Invented household and files; staff are
 * numbered, never named.
 */
type View = 'firm' | 'client';
type DocStatus = 'needed' | 'review' | 'approved' | 'returned';

interface Doc {
  id: number;
  name: string;
  status: DocStatus;
  remark?: string;
}

const STAGES = [
  { t: 'Documents', client: 'We need a few documents from you' },
  { t: 'Prep and review', client: 'We are preparing your return' },
  { t: 'Signature', client: 'Your return is ready to sign' },
];

const SEED: Doc[] = [
  { id: 1, name: 'W-2, main employer', status: 'approved' },
  { id: 2, name: '1099-INT, savings account', status: 'needed' },
  { id: 3, name: 'Photo ID, both sides', status: 'returned', remark: 'The image is cut off. Please upload the whole card.' },
  { id: 4, name: '1098, mortgage interest', status: 'review' },
];

const STATUS: Record<DocStatus, string> = {
  needed: 'Requested',
  review: 'To review',
  approved: 'Approved',
  returned: 'Sent back',
};
const CLIENT_STATUS: Record<DocStatus, string> = {
  needed: 'Needed',
  review: 'Received, in review',
  approved: 'Accepted',
  returned: 'Please upload again',
};

@Component({
  selector: 'mh-epractise-portal',
  imports: [NgIcon],
  viewProviders: [
    provideIcons({ phosphorArrowCounterClockwise, phosphorCheck, phosphorFileText, phosphorLockSimple, phosphorUploadSimple, phosphorWarningCircle }),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./mini-btn.scss'],
  template: `
    <div class="portal card">
      <header class="pt-head">
        <div>
          <p class="mono lbl">Job, 2025 individual return</p>
          <h3>Castillo household</h3>
        </div>
        <div class="seg" role="group" aria-label="Signed in as">
          <button type="button" [attr.aria-pressed]="view() === 'firm'" (click)="view.set('firm')">Firm staff</button>
          <button type="button" [attr.aria-pressed]="view() === 'client'" (click)="view.set('client')">Client</button>
        </div>
        <button type="button" class="reset" aria-label="Reset the sample job" (click)="reset()">
          <ng-icon name="phosphorArrowCounterClockwise" aria-hidden="true" />
        </button>
      </header>

      @if (view() === 'firm') {
        <div class="firm">
          <div class="stage-row">
            <span class="mono lbl" id="ep-stage">Internal stage</span>
            <div class="seg" role="group" aria-labelledby="ep-stage">
              @for (s of stages; track s.t; let i = $index) {
                <button type="button" [attr.aria-pressed]="stage() === i" (click)="stage.set(i)">{{ s.t }}</button>
              }
            </div>
            <span class="who mono">Preparer 2</span>
          </div>

          <ul class="docs" role="list" aria-label="Client documents">
            @for (d of docs(); track d.id) {
              <li [attr.data-s]="d.status">
                <ng-icon name="phosphorFileText" class="fi" aria-hidden="true" />
                <span class="nm">{{ d.name }}</span>
                <span class="st">{{ status[d.status] }}</span>
                @if (d.status === 'review') {
                  <span class="acts">
                    <button type="button" class="mini-btn is-primary" (click)="approve(d.id)" [attr.aria-label]="'Approve ' + d.name"><ng-icon name="phosphorCheck" aria-hidden="true" /> Approve</button>
                    <button type="button" class="mini-btn" (click)="startReturn(d.id)" [attr.aria-label]="'Send back ' + d.name" [attr.aria-expanded]="returning() === d.id">Send back</button>
                  </span>
                }
              </li>
              @if (returning() === d.id) {
                <li class="ret">
                  <label [for]="'ep-rm-' + d.id">Remark for the client</label>
                  <textarea [id]="'ep-rm-' + d.id" class="textarea" rows="2" maxlength="160" [value]="remark()" (input)="remark.set($any($event.target).value)" [attr.aria-describedby]="'ep-rm-h-' + d.id"></textarea>
                  <div class="ret-foot">
                    <span class="mono" [id]="'ep-rm-h-' + d.id">The client sees this remark. {{ remark().length }}/160</span>
                    <button type="button" class="mini-btn is-primary" [disabled]="remark().trim().length < 5" (click)="sendBack(d.id)">Send with remark</button>
                  </div>
                </li>
              }
            }
            <li class="priv">
              <ng-icon name="phosphorLockSimple" class="fi" aria-hidden="true" />
              <span class="nm">Internal, workpapers draft</span>
              <span class="st">Private folder</span>
            </li>
          </ul>
        </div>
      } @else {
        <div class="client">
          <p class="banner">
            <span class="mono lbl">Status</span>
            <b>{{ clientStatus() }}</b>
          </p>
          <div class="cols">
            <div>
              <h4>Still needed</h4>
              <ul class="docs" role="list">
                @for (d of open(); track d.id) {
                  <li [attr.data-s]="d.status">
                    <ng-icon [name]="d.status === 'returned' ? 'phosphorWarningCircle' : 'phosphorFileText'" class="fi" aria-hidden="true" />
                    <span class="nm">
                      {{ d.name }}
                      @if (d.remark && d.status === 'returned') {
                        <small>{{ d.remark }}</small>
                      }
                    </span>
                    <button type="button" class="mini-btn is-primary" (click)="upload(d.id)" [attr.aria-label]="'Upload ' + d.name"><ng-icon name="phosphorUploadSimple" aria-hidden="true" /> Upload</button>
                  </li>
                } @empty {
                  <li class="empty">Nothing else needed. Thank you.</li>
                }
              </ul>
            </div>
            <div>
              <h4>Sent to your firm</h4>
              <ul class="docs" role="list">
                @for (d of sent(); track d.id) {
                  <li [attr.data-s]="d.status">
                    <ng-icon name="phosphorFileText" class="fi" aria-hidden="true" />
                    <span class="nm">{{ d.name }}</span>
                    <span class="st">{{ clientLabel[d.status] }}</span>
                  </li>
                }
              </ul>
            </div>
          </div>
        </div>
      }
      <p class="mono sample" aria-live="polite">{{ note() }}</p>
    </div>
  `,
  styles: `
    :host {
      display: block;
    }
    .portal {
      display: grid;
      gap: 14px;
      padding: 18px;
    }
    .pt-head {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 10px 16px;

      > div:first-child {
        flex: 1;
        min-width: 180px;
      }
      h3 {
        font-size: 16px;
      }
      .seg button {
        min-height: 36px;
      }
    }
    .lbl {
      font-size: 12px;
      color: var(--muted);
    }
    .reset {
      width: 44px;
      height: 44px;
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
    .firm,
    .client {
      display: grid;
      gap: 12px;
      min-height: 300px;
      align-content: start;
    }
    .stage-row {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 8px 12px;

      .seg {
        flex-wrap: wrap;
        border-radius: 20px;
      }
      .seg button {
        height: 34px;
        font-size: 13px;
        padding: 0 12px;
      }
    }
    .who {
      margin-left: auto;
      padding: 3px 10px;
      border-radius: 999px;
      background: var(--surface-2);
      color: var(--ink-2);
      font-size: 12px;
    }
    .docs {
      display: grid;
      gap: 6px;

      > li:not(.ret) {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 8px 10px;
        min-height: 52px;
        padding: 8px 10px 8px 12px;
        border-radius: var(--r-inner);
        border: 1px solid var(--line);
        background: var(--surface);
      }
      .fi {
        font-size: 17px;
        color: var(--e-blue-text);
        flex-shrink: 0;
      }
      .nm {
        flex: 1;
        min-width: 150px;
        font-size: 13.5px;
        font-weight: 500;

        small {
          display: block;
          font-weight: 400;
          font-size: 12.5px;
          color: var(--e-red-text);
        }
      }
      .st {
        font-size: 12px;
        font-weight: 500;
        padding: 2px 9px;
        border-radius: 999px;
        white-space: nowrap;
        background: var(--surface-2);
        color: var(--ink-2);
      }
      [data-s='approved'] .st {
        background: var(--e-green-soft);
        color: var(--e-green-text);
      }
      [data-s='review'] .st {
        background: var(--e-amber-soft);
        color: var(--e-amber-text);
      }
      [data-s='returned'] .st {
        background: var(--e-red-soft);
        color: var(--e-red-text);
      }
      [data-s='returned'] .fi {
        color: var(--e-red-text);
      }
      .priv {
        border-style: dashed !important;
        background: var(--bg) !important;

        .fi {
          color: var(--muted);
        }
      }
      .empty {
        font-size: 13px;
        color: var(--muted);
      }
    }
    .acts {
      display: flex;
      gap: 8px;
    }
    .ret {
      display: grid;
      gap: 6px;
      padding: 10px 12px;
      border-radius: var(--r-inner);
      background: var(--surface-2);

      label {
        font-size: 12.5px;
        font-weight: 500;
        color: var(--ink-2);
      }
      .textarea {
        min-height: 60px;
        font-size: 13.5px;
        background: var(--surface);
      }
    }
    .ret-foot {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 8px;

      .mono {
        font-size: 12px;
        color: var(--muted);
      }
    }
    .banner {
      display: grid;
      gap: 2px;
      padding: 14px 16px;
      border-radius: var(--r-inner);
      background: var(--e-blue-soft);

      .lbl {
        color: var(--e-blue-text);
      }
      b {
        font-size: 16px;
        color: var(--ink);
      }
    }
    .cols {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 14px;

      h4 {
        font-size: 13.5px;
        margin-bottom: 8px;
      }
    }
    .sample {
      font-size: 12px;
      color: var(--muted);
      min-height: 14px;
    }
    @media (max-width: 760px) {
      .cols {
        grid-template-columns: 1fr;
      }
      .who {
        margin-left: 0;
      }
    }
    @media (max-width: 460px) {
      .portal {
        padding: 14px;
      }
    }
    /* Narrow phones: the segmented control takes a full row of equal cells instead of wrapping into a blob */
    @media (max-width: 400px) {
      .stage-row .seg {
        width: 100%;
        display: grid;
        grid-auto-flow: column;
        grid-auto-columns: minmax(0, 1fr);
        border-radius: 18px;
      }
      .stage-row .seg button {
        height: auto;
        min-height: 36px;
        padding: 4px 6px;
        justify-content: center;
        text-align: center;
        line-height: 1.2;
      }
    }
  `,
})
export class EpractisePortalDemo {
  protected readonly stages = STAGES;
  protected readonly status = STATUS;
  protected readonly clientLabel = CLIENT_STATUS;
  protected readonly view = signal<View>('firm');
  protected readonly stage = signal(0);
  protected readonly docs = signal<Doc[]>(SEED);
  protected readonly returning = signal<number | null>(null);
  protected readonly remark = signal('');
  protected readonly note = signal('Sample job. Switch to the client to see their side.');

  protected readonly clientStatus = computed(() => STAGES[this.stage()].client);
  protected readonly open = computed(() => this.docs().filter((d) => d.status === 'needed' || d.status === 'returned'));
  protected readonly sent = computed(() => this.docs().filter((d) => d.status === 'review' || d.status === 'approved'));

  private set(id: number, patch: Partial<Doc>): void {
    this.docs.update((l) => l.map((d) => (d.id === id ? { ...d, ...patch } : d)));
  }

  private name(id: number): string {
    return this.docs().find((d) => d.id === id)?.name ?? '';
  }

  protected approve(id: number): void {
    this.set(id, { status: 'approved', remark: undefined });
    this.returning.set(null);
    this.note.set(`${this.name(id)} approved. The client sees it as accepted.`);
  }

  protected startReturn(id: number): void {
    this.returning.set(this.returning() === id ? null : id);
    this.remark.set('');
  }

  protected sendBack(id: number): void {
    this.set(id, { status: 'returned', remark: this.remark().trim() });
    this.returning.set(null);
    this.note.set(`${this.name(id)} sent back with a remark. Switch to the client to read it.`);
  }

  protected upload(id: number): void {
    this.set(id, { status: 'review', remark: undefined });
    this.note.set(`${this.name(id)} uploaded. It waits for the firm to review it.`);
  }

  protected reset(): void {
    this.view.set('firm');
    this.stage.set(0);
    this.docs.set(SEED);
    this.returning.set(null);
    this.remark.set('');
    this.note.set('Sample job reset.');
  }
}
