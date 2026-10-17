import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  phosphorArrowCounterClockwise,
  phosphorArrowRight,
  phosphorCheckSquare,
  phosphorEnvelopeSimple,
  phosphorFolderSimple,
  phosphorListChecks,
  phosphorNotepad,
  phosphorReceipt,
  phosphorTag,
  phosphorUploadSimple,
  phosphorUserPlus,
} from '@ng-icons/phosphor-icons/regular';

/**
 * A firm's pipeline (my own redraw, not a screenshot). Stages carry automations that fire when a job enters them,
 * drawn from the real automation types: send an organizer, a client request or an email, create a folder, a task or
 * an invoice, add or remove a tag, assign someone. A stage with Automove on hands the job to the next stage once
 * the client finishes their part; here that is the client uploading their documents. Invented clients; staff are
 * numbered, never named.
 */
type Kind = 'organizer' | 'request' | 'email' | 'folder' | 'task' | 'invoice' | 'tag' | 'untag' | 'assign';

interface Automation {
  kind: Kind;
  what: string;
}

interface Stage {
  id: string;
  name: string;
  auto: Automation[];
  automove?: boolean;
}

interface Job {
  id: number;
  client: string;
  stage: number;
  tags: string[];
  uploaded?: boolean;
}

const STAGES: Stage[] = [
  {
    id: 'intake',
    name: 'Intake',
    auto: [
      { kind: 'organizer', what: '2025 individual organizer' },
      { kind: 'tag', what: 'New season' },
    ],
  },
  {
    id: 'docs',
    name: 'Documents',
    automove: true,
    auto: [
      { kind: 'request', what: 'W-2s, 1099s and ID' },
      { kind: 'folder', what: '2025 return' },
      { kind: 'tag', what: 'Waiting on client' },
    ],
  },
  {
    id: 'prep',
    name: 'Prep and review',
    auto: [
      { kind: 'untag', what: 'Waiting on client' },
      { kind: 'assign', what: 'Preparer 2' },
      { kind: 'task', what: 'Review checklist' },
    ],
  },
  {
    id: 'sign',
    name: 'Signature',
    auto: [{ kind: 'email', what: 'Your return is ready to sign' }],
  },
  {
    id: 'bill',
    name: 'Invoice',
    auto: [
      { kind: 'invoice', what: 'Individual return fee' },
      { kind: 'untag', what: 'New season' },
    ],
  },
];

const SEED: Job[] = [
  { id: 1, client: 'Castillo household', stage: 0, tags: ['New season'] },
  { id: 2, client: 'Maple Row Bakery', stage: 1, tags: ['New season', 'Waiting on client'] },
  { id: 3, client: 'Northgate Dental', stage: 2, tags: ['New season'] },
];

const VERB: Record<Kind, string> = {
  organizer: 'Organizer sent',
  request: 'Client request sent',
  email: 'Email sent',
  folder: 'Folder created',
  task: 'Task created',
  invoice: 'Invoice created',
  tag: 'Tag added',
  untag: 'Tag removed',
  assign: 'Assigned',
};

// How the stage reads in the pipeline editor, before it fires.
const LABEL: Record<Kind, string> = {
  organizer: 'Send organizer',
  request: 'Send client request',
  email: 'Send email',
  folder: 'Create folder',
  task: 'Create task',
  invoice: 'Create invoice',
  tag: 'Add tag',
  untag: 'Remove tag',
  assign: 'Assign',
};

const ICON: Record<Kind, string> = {
  organizer: 'phosphorNotepad',
  request: 'phosphorListChecks',
  email: 'phosphorEnvelopeSimple',
  folder: 'phosphorFolderSimple',
  task: 'phosphorCheckSquare',
  invoice: 'phosphorReceipt',
  tag: 'phosphorTag',
  untag: 'phosphorTag',
  assign: 'phosphorUserPlus',
};

@Component({
  selector: 'mh-epractise-pipeline',
  imports: [NgIcon],
  viewProviders: [
    provideIcons({
      phosphorArrowCounterClockwise,
      phosphorArrowRight,
      phosphorCheckSquare,
      phosphorEnvelopeSimple,
      phosphorFolderSimple,
      phosphorListChecks,
      phosphorNotepad,
      phosphorReceipt,
      phosphorTag,
      phosphorUploadSimple,
      phosphorUserPlus,
    }),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./mini-btn.scss'],
  template: `
    <div class="pipe card">
      <header class="pipe-head">
        <div>
          <p class="mono lbl">Pipeline</p>
          <h3>Individual tax return</h3>
        </div>
        <label class="check am">
          <input type="checkbox" [checked]="automove()" (change)="automove.set($any($event.target).checked)" />
          Automove on Documents
        </label>
        <button type="button" class="reset" aria-label="Reset the sample pipeline" (click)="reset()">
          <ng-icon name="phosphorArrowCounterClockwise" aria-hidden="true" />
        </button>
      </header>

      <div class="board" role="region" aria-label="Pipeline stages" tabindex="0">
        @for (s of stages; track s.id; let si = $index) {
          <section class="col" [attr.aria-labelledby]="'ep-st-' + s.id">
            <h4 [id]="'ep-st-' + s.id">
              <span class="mono">{{ si + 1 }}</span> {{ s.name }}
              @if (s.automove && automove()) {
                <span class="am-pill mono">Automove</span>
              }
            </h4>
            <ul class="autos" role="list" [attr.aria-label]="'Automations on ' + s.name">
              @for (a of s.auto; track a.what + a.kind) {
                <li [class.flash]="flash() === s.id">
                  <ng-icon [name]="icon[a.kind]" aria-hidden="true" />
                  <span>{{ label[a.kind] }}: {{ a.what }}</span>
                </li>
              }
            </ul>
            <ul class="jobs" role="list">
              @for (j of jobsIn(si); track j.id) {
                <li class="job">
                  <div class="job-head">
                    <b>{{ j.client }}</b>
                    @if (si < stages.length - 1) {
                      <button
                        type="button"
                        class="mini-btn mini-btn--icon"
                        (click)="move(j)"
                        [attr.aria-label]="'Move ' + j.client + ' to ' + stages[si + 1].name"
                        [title]="'Move to ' + stages[si + 1].name"
                      >
                        <ng-icon name="phosphorArrowRight" aria-hidden="true" />
                      </button>
                    } @else {
                      <span class="done mono">Invoiced</span>
                    }
                  </div>
                  @if (j.tags.length) {
                    <span class="tags">
                      @for (t of j.tags; track t) {
                        <span class="t">{{ t }}</span>
                      }
                    </span>
                  }
                  @if (s.id === 'docs' && !j.uploaded) {
                    <button type="button" class="mini-btn up" (click)="upload(j)" [attr.aria-label]="j.client + ' uploads the requested documents'">
                      <ng-icon name="phosphorUploadSimple" aria-hidden="true" /> Client uploads
                    </button>
                  }
                </li>
              }
            </ul>
          </section>
        }
      </div>

      <div class="log">
        <p class="mono lbl" id="ep-log">Automation log</p>
        <ol role="list" aria-labelledby="ep-log" aria-live="polite">
          @for (l of log(); track l.n) {
            <li><span class="mono">{{ l.client }}</span> {{ l.text }}</li>
          } @empty {
            <li class="empty">Move a job. Each stage’s automations fire as it arrives.</li>
          }
        </ol>
      </div>
    </div>
  `,
  styles: `
    :host {
      display: block;
    }
    .pipe {
      display: grid;
      gap: 14px;
      padding: 18px;
    }
    .pipe-head {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 10px 16px;

      div {
        flex: 1;
        min-width: 180px;
      }
      h3 {
        font-size: 16px;
      }
    }
    .lbl {
      font-size: 12px;
      color: var(--muted);
    }
    .am {
      align-items: center;
      min-height: 44px;
      font-size: 13.5px;

      input {
        margin: 0;
        accent-color: var(--e-blue);
      }
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
    .board {
      display: grid;
      grid-template-columns: repeat(5, minmax(200px, 1fr));
      gap: 10px;
      overflow-x: auto;
      padding-bottom: 4px;
      border-radius: var(--r-inner);

      &:focus-visible {
        outline: 2px solid var(--focus);
        outline-offset: 2px;
      }
    }
    .col {
      display: grid;
      gap: 8px;
      align-content: start;
      padding: 12px;
      border-radius: var(--r-inner);
      background: var(--bg);
      border: 1px solid var(--line);

      h4 {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 6px;
        font-size: 13.5px;

        .mono {
          font-size: 12px;
          color: var(--e-blue-text);
        }
      }
    }
    .am-pill {
      padding: 1px 7px;
      border-radius: 999px;
      background: var(--e-blue-soft);
      color: var(--e-blue-text);
      font-size: 12px;
    }
    .autos {
      display: grid;
      gap: 4px;
      padding-bottom: 8px;
      border-bottom: 1px dashed var(--line-strong);

      li {
        display: flex;
        gap: 6px;
        align-items: flex-start;
        font-size: 12px;
        line-height: 1.4;
        color: var(--ink-2);
        border-radius: 6px;
        transition: background var(--t-base) var(--ease);

        ng-icon {
          flex-shrink: 0;
          margin-top: 1px;
          font-size: 13px;
          color: var(--e-blue-text);
        }
        &.flash {
          background: var(--e-blue-soft);
        }
      }
    }
    .jobs {
      display: grid;
      gap: 6px;
      min-height: 60px;
    }
    .job {
      display: grid;
      gap: 6px;
      padding: 10px;
      border-radius: 10px;
      background: var(--surface);
      border: 1px solid var(--line);
      box-shadow: var(--shadow);

    }
    .job-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      min-height: 30px;

      b {
        flex: 1 1 auto;
        min-width: 0;
        font-size: 13px;
        line-height: 1.3;
      }
    }
    .up {
      justify-self: start;
      margin-top: 2px;
    }
    .tags {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
    }
    .t {
      padding: 1px 7px;
      border-radius: 999px;
      background: var(--e-amber-soft);
      color: var(--e-amber-text);
      font-size: 12px;
    }
    .done {
      font-size: 12px;
      padding: 2px 8px;
      border-radius: 999px;
      background: var(--e-green-soft);
      color: var(--e-green-text);
    }
    .log {
      display: grid;
      gap: 6px;
      padding: 12px 14px;
      border-radius: var(--r-inner);
      background: var(--e-night);
      color: var(--n-ink);

      .lbl {
        color: var(--n-muted);
      }
      ol {
        display: grid;
        gap: 3px;
        max-height: 132px;
        overflow-y: auto;
      }
      li {
        font-size: 12.5px;
      }
      .mono {
        color: #9db8ff;
        font-size: 12px;
        margin-right: 4px;
      }
      .empty {
        color: var(--n-muted);
      }
    }
    // Phones: the stages stack instead of scrolling sideways.
    @media (max-width: 640px) {
      .board {
        grid-template-columns: 1fr;
        overflow-x: visible;
      }
    }
    @media (max-width: 460px) {
      .pipe {
        padding: 14px;
      }
    }
  `,
})
export class EpractisePipelineDemo {
  protected readonly stages = STAGES;
  protected readonly label = LABEL;
  protected readonly icon = ICON;
  protected readonly jobs = signal<Job[]>(SEED);
  protected readonly automove = signal(true);
  protected readonly flash = signal<string | null>(null);
  protected readonly log = signal<{ n: number; client: string; text: string }[]>([]);
  private n = 0;

  protected readonly byStage = computed(() => STAGES.map((_, i) => this.jobs().filter((j) => j.stage === i)));

  protected jobsIn(i: number): Job[] {
    return this.byStage()[i];
  }

  protected move(job: Job): void {
    this.write(job.client, this.enter(job.id, job.stage + 1));
  }

  /** The client finishes the request: with Automove on, the job hands itself to the next stage. */
  protected upload(job: Job): void {
    this.jobs.update((l) => l.map((j) => (j.id === job.id ? { ...j, uploaded: true } : j)));
    const lines = ['uploaded every requested document.'];
    if (this.automove()) lines.push('Automove: Documents is complete.', ...this.enter(job.id, job.stage + 1));
    this.write(job.client, lines);
  }

  /** Moves a job into a stage, runs that stage's automations against it and returns what happened, in order. */
  private enter(id: number, stage: number): string[] {
    const s = STAGES[stage];
    if (!s) return [];
    this.jobs.update((l) =>
      l.map((j) => {
        if (j.id !== id) return j;
        let tags = j.tags;
        for (const a of s.auto) {
          if (a.kind === 'tag' && !tags.includes(a.what)) tags = [...tags, a.what];
          if (a.kind === 'untag') tags = tags.filter((t) => t !== a.what);
        }
        return { ...j, stage, tags, uploaded: false };
      }),
    );
    this.flash.set(s.id);
    return [`entered ${s.name}.`, ...s.auto.map((a) => `${VERB[a.kind]}: ${a.what}.`)];
  }

  /** Newest action on top; the lines of one action keep their order. */
  private write(client: string, lines: string[]): void {
    const block = lines.map((text) => ({ n: ++this.n, client, text }));
    this.log.update((l) => [...block, ...l].slice(0, 14));
  }

  protected reset(): void {
    this.jobs.set(SEED);
    this.automove.set(true);
    this.flash.set(null);
    this.log.set([]);
  }
}
