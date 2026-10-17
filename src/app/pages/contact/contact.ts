import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  ElementRef,
  Injector,
  afterNextRender,
  computed,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  phosphorArrowCounterClockwise,
  phosphorArrowUpRight,
  phosphorCheck,
  phosphorClock,
  phosphorCopy,
  phosphorDribbbleLogo,
  phosphorEnvelopeSimple,
  phosphorGithubLogo,
  phosphorLinkedinLogo,
  phosphorPaperPlaneTilt,
  phosphorPencil,
  phosphorWarningCircle,
  phosphorX,
} from '@ng-icons/phosphor-icons/regular';
import { debounceTime } from 'rxjs';
import { PERSON_ID, Seo, abs } from '../../core/seo/seo.service';
import { SITE } from '../../core/site.config';
import { Reveal } from '../../shared/directives/reveal.directive';
import { Pattern } from '../../shared/ui/pattern';
import { CONTACT_COPY, MESSAGE_MAX, MESSAGE_MIN } from './contact.copy';
import {
  BUDGET_TOPICS,
  CONTACT_TRANSPORT,
  ContactMessage,
  ContactTopic,
  isTopic,
  mailtoHref,
} from './contact.service';

const PATH = '/contact';
const DRAFT_KEY = 'mh.contact.draft';
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

type FormState = 'idle' | 'submitting' | 'success' | 'error';
type FieldKey = 'name' | 'email' | 'topic' | 'message' | 'consent';

/** Required, after trimming whitespace. */
const trimmedRequired = (c: AbstractControl<string>): ValidationErrors | null =>
  c.value?.trim() ? null : { required: true };
const trimmedMin =
  (min: number) =>
  (c: AbstractControl<string>): ValidationErrors | null => {
    const n = c.value?.trim().length ?? 0;
    return n > 0 && n < min ? { minlength: { requiredLength: min, actualLength: n } } : null;
  };
const emailFormat = (c: AbstractControl<string>): ValidationErrors | null =>
  !c.value?.trim() || EMAIL_RE.test(c.value.trim()) ? null : { email: true };

/**
 * Contact page. Reactive form, validated on blur and on submit (GOV.UK pattern: error summary card that
 * takes focus, linked to inline errors). Delivery goes through CONTACT_TRANSPORT: today MailtoTransport,
 * which opens the visitor's own email app, so the copy says exactly that.
 * Query params from /hire's scope builder (topic, timeline, brief) pre-fill the form after hydration.
 */
@Component({
  selector: 'mh-page-contact',
  imports: [ReactiveFormsModule, RouterLink, NgIcon, Reveal, Pattern],
  viewProviders: [
    provideIcons({
      phosphorArrowCounterClockwise,
      phosphorArrowUpRight,
      phosphorCheck,
      phosphorClock,
      phosphorCopy,
      phosphorDribbbleLogo,
      phosphorEnvelopeSimple,
      phosphorGithubLogo,
      phosphorLinkedinLogo,
      phosphorPaperPlaneTilt,
      phosphorPencil,
      phosphorWarningCircle,
      phosphorX,
    }),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './contact.html',
  styleUrl: './contact.scss',
})
export class Contact {
  protected readonly c = CONTACT_COPY;
  protected readonly site = SITE;
  protected readonly min = MESSAGE_MIN;
  protected readonly max = MESSAGE_MAX;
  protected readonly transport = inject(CONTACT_TRANSPORT);
  protected readonly isMailto = this.transport.kind === 'mailto';

  // Query params (router input binding): /contact?topic=review&timeline=month&brief=...
  readonly topic = input<string>();
  readonly timeline = input<string>();
  readonly brief = input<string>();

  private readonly doc = inject(DOCUMENT);
  private readonly fb = inject(FormBuilder);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly injector = inject(Injector);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly form = this.fb.nonNullable.group({
    name: ['', [trimmedRequired, Validators.maxLength(120)]],
    email: ['', [trimmedRequired, emailFormat, Validators.maxLength(200)]],
    topic: ['' as ContactTopic | '', Validators.required],
    budget: [''],
    timeline: [''],
    message: ['', [trimmedRequired, trimmedMin(MESSAGE_MIN), Validators.maxLength(MESSAGE_MAX)]],
    consent: [false, Validators.requiredTrue],
    website: [''], // honeypot: people never see it, naive bots fill it
  });

  protected readonly state = signal<FormState>('idle');
  protected readonly submitted = signal(false);
  protected readonly briefText = signal<string | null>(null);
  protected readonly lastMailto = signal<string | null>(null);

  private readonly topicValue = toSignal(this.form.controls.topic.valueChanges, {
    initialValue: '' as ContactTopic | '',
  });
  private readonly messageValue = toSignal(this.form.controls.message.valueChanges, {
    initialValue: '',
  });
  protected readonly showBudget = computed(() => {
    const t = this.topicValue();
    return t !== '' && BUDGET_TOPICS.includes(t);
  });
  protected readonly count = computed(() => this.messageValue().length);
  /** Screen-reader count, updated only after typing pauses (no chatter on every key). */
  protected readonly countSr = signal('');

  // Copy-email button
  protected readonly copied = signal<'idle' | 'done' | 'failed'>('idle');
  // Karachi clock (browser only)
  protected readonly time = signal('');
  protected readonly timeIso = signal('');
  protected readonly working = signal<boolean | null>(null);

  private readonly summary = viewChild<ElementRef<HTMLElement>>('summary');
  private readonly result = viewChild<ElementRef<HTMLElement>>('result');
  private readonly hero = viewChild.required<ElementRef<HTMLElement>>('hero');

  private timers: ReturnType<typeof setTimeout>[] = [];

  constructor() {
    inject(Seo).set({
      title: CONTACT_COPY.seo.title,
      description: CONTACT_COPY.seo.description,
      path: PATH,
      breadcrumbs: [{ name: 'Contact', path: PATH }],
      jsonLd: [
        {
          '@type': 'ContactPage',
          '@id': abs(PATH) + '#contact',
          url: abs(PATH),
          name: `Contact ${SITE.name}`,
          description: CONTACT_COPY.seo.description,
          inLanguage: 'en',
          about: { '@id': PERSON_ID },
          mainEntity: {
            '@id': PERSON_ID,
            contactPoint: {
              '@type': 'ContactPoint',
              contactType: 'Freelance, contract and hiring enquiries',
              email: SITE.email,
              availableLanguage: ['en'],
              areaServed: 'Worldwide',
            },
          },
        },
      ],
    });

    this.form.controls.message.valueChanges
      .pipe(debounceTime(1200), takeUntilDestroyed())
      .subscribe((v) => {
        this.countSr.set(this.c.counterSr(v.length, MESSAGE_MIN, MESSAGE_MAX));
      });

    afterNextRender(() => {
      this.hero().nativeElement.classList.add('ready');
      this.restore();
      this.form.valueChanges
        .pipe(debounceTime(400), takeUntilDestroyed(this.destroyRef))
        .subscribe(() => this.persist());
      this.startClock();
    });

    this.destroyRef.onDestroy(() => this.timers.forEach(clearTimeout));
  }

  // ---------- Errors ----------

  protected show(key: FieldKey): boolean {
    const ctrl = this.form.controls[key];
    return ctrl.invalid && (ctrl.touched || this.submitted());
  }

  protected errorText(key: FieldKey): string {
    const e = this.form.controls[key].errors ?? {};
    const t = this.c.errors;
    switch (key) {
      case 'name':
        return t.nameRequired;
      case 'email':
        return e['required'] ? t.emailRequired : t.emailFormat;
      case 'topic':
        return t.topicRequired;
      case 'message':
        if (e['required']) return t.messageRequired;
        if (e['minlength']) return t.messageMin(MESSAGE_MIN);
        return t.messageMax(MESSAGE_MAX);
      case 'consent':
        return t.consentRequired;
    }
  }

  /** Errors for the summary, in page order. Re-evaluated as the visitor fixes fields. */
  protected errorList(): { key: FieldKey; target: string; text: string }[] {
    const order: [FieldKey, string][] = [
      ['name', 'c-name'],
      ['email', 'c-email'],
      ['topic', 'c-topic-' + this.c.topic.options[0].value],
      ['message', 'c-message'],
      ['consent', 'c-consent'],
    ];
    return order
      .filter(([k]) => this.form.controls[k].invalid)
      .map(([key, target]) => ({ key, target, text: this.errorText(key) }));
  }

  protected describedBy(key: FieldKey, hint = false): string | null {
    const ids = [hint ? `c-${key}-hint` : '', this.show(key) ? `c-${key}-error` : ''].filter(
      Boolean,
    );
    return ids.length ? ids.join(' ') : null;
  }

  /** Error summary links: move focus to the field (a plain #hash would resolve against <base href>). */
  protected jump(e: Event, id: string): void {
    e.preventDefault();
    const el = this.doc.getElementById(id);
    el?.scrollIntoView({ block: 'center' });
    el?.focus({ preventScroll: true });
  }

  // ---------- Submit ----------

  protected async submit(): Promise<void> {
    if (this.state() === 'submitting') return;
    this.submitted.set(true);
    this.form.markAllAsTouched();

    if (this.form.invalid) {
      this.state.set('idle');
      this.focusAfterRender(() => this.summary()?.nativeElement);
      return;
    }

    const msg = this.compose();
    this.lastMailto.set(mailtoHref(msg));

    // Honeypot filled: pretend it worked, send nothing.
    if (this.form.controls.website.value) {
      this.finish();
      return;
    }

    this.state.set('submitting');
    try {
      await this.transport.send(msg);
      this.finish();
    } catch {
      this.state.set('error');
    }
  }

  protected edit(): void {
    this.state.set('idle');
    this.focusAfterRender(() => this.doc.getElementById('c-message') ?? undefined);
  }

  protected restart(): void {
    this.form.reset();
    this.briefText.set(null);
    this.submitted.set(false);
    this.state.set('idle');
    this.clearDraft();
    this.focusAfterRender(() => this.doc.getElementById('c-name') ?? undefined);
  }

  protected removeBrief(): void {
    this.briefText.set(null);
    this.persist();
    this.focusAfterRender(() => this.doc.getElementById('c-message') ?? undefined);
  }

  private finish(): void {
    this.state.set('success');
    this.clearDraft();
    this.focusAfterRender(() => this.result()?.nativeElement);
  }

  private compose(): ContactMessage {
    const v = this.form.getRawValue();
    const topic = v.topic as ContactTopic;
    const label = (list: readonly { value: string; label: string }[], value: string) =>
      list.find((o) => o.value === value)?.label ?? null;
    return {
      name: v.name.trim(),
      email: v.email.trim(),
      topic,
      topicLabel: label(this.c.topic.options, topic) ?? topic,
      budget: this.showBudget() && v.budget ? label(this.c.budget.options, v.budget) : null,
      timeline: v.timeline ? label(this.c.timeline.options, v.timeline) : null,
      brief: this.briefText(),
      message: v.message.trim(),
    };
  }

  private focusAfterRender(get: () => HTMLElement | undefined): void {
    afterNextRender(() => get()?.focus(), { injector: this.injector });
  }

  // ---------- Copy email ----------

  protected async copyEmail(): Promise<void> {
    try {
      await navigator.clipboard.writeText(SITE.email);
      this.copied.set('done');
    } catch {
      this.copied.set('failed');
    }
    this.timers.push(setTimeout(() => this.copied.set('idle'), 2400));
  }

  // ---------- Draft (sessionStorage, browser only) ----------

  private restore(): void {
    try {
      const raw = sessionStorage.getItem(DRAFT_KEY);
      if (raw) {
        const d = JSON.parse(raw) as Partial<
          Record<'name' | 'email' | 'topic' | 'budget' | 'timeline' | 'message' | 'brief', string>
        >;
        this.form.patchValue({
          name: d.name ?? '',
          email: d.email ?? '',
          topic: isTopic(d.topic) ? d.topic : '',
          budget: d.budget ?? '',
          timeline: d.timeline ?? '',
          message: d.message ?? '',
        });
        if (d.brief) this.briefText.set(d.brief.slice(0, 300));
      }
    } catch {
      // Storage blocked or corrupt: start empty.
    }

    // Query params win over a stored draft.
    const topic = this.topic();
    if (isTopic(topic)) this.form.controls.topic.setValue(topic);
    const timeline = this.timeline();
    if (timeline && this.c.timeline.options.some((o) => o.value === timeline))
      this.form.controls.timeline.setValue(timeline);
    const brief = this.brief()?.trim();
    if (brief) this.briefText.set(brief.slice(0, 300));

    this.cdr.markForCheck();
  }

  private persist(): void {
    if (this.state() === 'success') return;
    try {
      const { name, email, topic, budget, timeline, message } = this.form.getRawValue();
      sessionStorage.setItem(
        DRAFT_KEY,
        JSON.stringify({ name, email, topic, budget, timeline, message, brief: this.briefText() }),
      );
    } catch {
      // Storage full or blocked: the form still works, the draft just does not survive a reload.
    }
  }

  private clearDraft(): void {
    try {
      sessionStorage.removeItem(DRAFT_KEY);
    } catch {
      // ignore
    }
  }

  // ---------- Karachi clock ----------

  private startClock(): void {
    const fmt = new Intl.DateTimeFormat('en-GB', {
      timeZone: SITE.timeZone,
      hour: '2-digit',
      minute: '2-digit',
      weekday: 'short',
      hourCycle: 'h23',
    });
    const tick = () => {
      const now = new Date();
      const parts = Object.fromEntries(fmt.formatToParts(now).map((p) => [p.type, p.value]));
      const hour = Number(parts['hour']);
      const weekend = parts['weekday'] === 'Sat' || parts['weekday'] === 'Sun';
      this.time.set(`${parts['weekday']} ${parts['hour']}:${parts['minute']}`);
      this.timeIso.set(now.toISOString());
      this.working.set(!weekend && hour >= 9 && hour < 19);
    };
    tick();
    const id = setInterval(tick, 20_000);
    this.destroyRef.onDestroy(() => clearInterval(id));
  }
}
