import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  phosphorAnchor,
  phosphorArrowCounterClockwise,
  phosphorBone,
  phosphorCompass,
  phosphorFire,
  phosphorHandHeart,
  phosphorMoon,
  phosphorSunHorizon,
} from '@ng-icons/phosphor-icons/regular';
import { COPY, EXAMPLE_VOTES, MEMBERS } from './quorum.copy';

/**
 * The example Quorum report as a working tally. Each vote is a toggle; the score and the result
 * recount with the skill's own rules (sum of +1/-1; >0 YES, <0 NO, 0 TIE toward the reversible option).
 * Server-renders the original report, so it reads correctly without JavaScript.
 */
@Component({
  selector: 'mh-quorum-vote',
  imports: [NgIcon],
  viewProviders: [
    provideIcons({
      phosphorAnchor,
      phosphorSunHorizon,
      phosphorHandHeart,
      phosphorFire,
      phosphorMoon,
      phosphorCompass,
      phosphorBone,
      phosphorArrowCounterClockwise,
    }),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <article class="report" [attr.aria-label]="t.reportTitle">
      <header class="report__head">
        <h3>{{ t.reportTitle }}</h3>
        <p class="q-line">
          <b>{{ t.decision }}:</b> {{ t.decisionText }} <span class="opts">{{ t.options }}</span>
        </p>
      </header>

      <div class="table" role="table" [attr.aria-label]="t.reportTitle">
        <div class="row row--head" role="row">
          <span role="columnheader">{{ t.member }}</span>
          <span role="columnheader" class="col-says">{{ t.saysCol }}</span>
          <span role="columnheader" class="col-vote">{{ t.voteCol }}</span>
        </div>
        @for (r of rows; track r.id; let i = $index) {
          <div class="row" role="row">
            <span role="cell" class="who">
              <ng-icon [name]="r.icon" aria-hidden="true" />
              {{ r.name }}
            </span>
            <span role="cell" class="col-says" lang="en">
              “@for (s of r.says; track $index) {@if (s.em) {<em>{{ s.t }}</em>} @else {<ng-container>{{ s.t }}</ng-container>}}”
            </span>
            <span role="cell" class="col-vote">
              <button
                type="button"
                class="vote"
                [class.is-down]="votes()[i] < 0"
                [attr.aria-label]="r.name + ' ' + (votes()[i] > 0 ? t.votesUp : t.votesDown) + '. ' + t.flip"
                (click)="flip(i)"
              >
                <span class="vote__n">{{ votes()[i] > 0 ? '+1' : '-1' }}</span>
              </button>
            </span>
          </div>
        }
        <div class="row row--score" role="row">
          <span role="cell">{{ t.score }}</span>
          <span role="cell" class="col-says">{{ ups() }} {{ t.up }}, {{ downs() }} {{ t.down }}</span>
          <span role="cell" class="col-vote score">{{ scoreLabel() }}</span>
        </div>
      </div>

      <div class="result" aria-live="polite">
        <span class="verdict" [attr.data-v]="verdict()">{{ verdict() }}</span>
        <span class="result__text">{{ resultText() }}</span>
      </div>

      <footer class="report__foot">
        <p class="note">{{ t.note }}</p>
        <button type="button" class="btn btn--ghost btn--sm reset" (click)="reset()" [disabled]="isOriginal()">
          <ng-icon name="phosphorArrowCounterClockwise" aria-hidden="true" />{{ t.reset }}
        </button>
      </footer>
    </article>
  `,
  styleUrl: './vote-demo.scss',
})
export class QuorumVoteDemo {
  protected readonly t = COPY.vote;
  protected readonly rows = EXAMPLE_VOTES.map((v) => {
    const m = MEMBERS.find((x) => x.id === v.id)!;
    return { ...v, name: m.name, icon: m.icon };
  });
  private readonly initial = EXAMPLE_VOTES.map((v) => v.vote as number);
  protected readonly votes = signal<number[]>([...this.initial]);

  protected readonly ups = computed(() => this.votes().filter((v) => v > 0).length);
  protected readonly downs = computed(() => this.votes().filter((v) => v < 0).length);
  protected readonly score = computed(() => this.votes().reduce((a, b) => a + b, 0));
  protected readonly scoreLabel = computed(() => (this.score() > 0 ? '+' : '') + this.score());
  protected readonly verdict = computed(() => (this.score() > 0 ? 'YES' : this.score() < 0 ? 'NO' : 'TIE'));
  protected readonly isOriginal = computed(() => this.votes().every((v, i) => v === this.initial[i]));
  protected readonly resultText = computed(() => {
    if (this.isOriginal()) return this.t.original;
    return this.score() > 0 ? this.t.yes : this.score() < 0 ? this.t.no : this.t.tie;
  });

  protected flip(i: number): void {
    this.votes.update((v) => v.map((x, j) => (j === i ? -x : x)));
  }

  protected reset(): void {
    this.votes.set([...this.initial]);
  }
}
