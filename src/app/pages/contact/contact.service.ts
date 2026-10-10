import { DOCUMENT } from '@angular/common';
import { Injectable, InjectionToken, inject } from '@angular/core';
import { SITE } from '../../core/site.config';

/**
 * Contact form submission.
 *
 * The site is static, so by default the form does NOT post anywhere: MailtoTransport opens the
 * visitor's own email app with the message prefilled, and nothing reaches the owner until the visitor
 * presses send there. The UI says so before and after submit.
 *
 * To switch to a real endpoint later (Formspree, Web3Forms, a Cloudflare Worker + Resend, ...):
 *   1. Uncomment HttpTransport below.
 *   2. Provide the endpoint, e.g. in app.config.ts:
 *        { provide: CONTACT_ENDPOINT, useValue: 'https://contact.mhfrough.dev/send' }
 *   3. Swap the CONTACT_TRANSPORT factory to pick HttpTransport when an endpoint is set.
 *   4. Add the endpoint's origin to `connect-src` in public/_headers (the CSP blocks it otherwise).
 *   5. Update /privacy (and /cookies if the provider sets any) to name the provider before it goes live,
 *      and change the submit hint in contact.copy.ts, which currently says the form opens an email app.
 */

export type ContactTopic = 'freelance' | 'contract' | 'fulltime' | 'review' | 'other';

/** Topics where a project budget makes sense. */
export const BUDGET_TOPICS: readonly ContactTopic[] = ['freelance', 'contract', 'review'];

export const CONTACT_TOPICS: readonly ContactTopic[] = [
  'freelance',
  'contract',
  'fulltime',
  'review',
  'other',
];

export const isTopic = (v: unknown): v is ContactTopic =>
  typeof v === 'string' && (CONTACT_TOPICS as readonly string[]).includes(v);

export interface ContactMessage {
  name: string;
  email: string;
  topic: ContactTopic;
  /** Human-readable labels (English), so the email reads well without a lookup table. */
  topicLabel: string;
  budget: string | null;
  timeline: string | null;
  /** Optional one-line brief carried over from the /hire scope builder. */
  brief: string | null;
  message: string;
}

export interface ContactTransport {
  /** 'mailto' only drafts the email in the visitor's app; 'http' actually delivers it. */
  readonly kind: 'mailto' | 'http';
  send(msg: ContactMessage): Promise<void>;
}

/** Future form endpoint. `null` (the default) keeps the mailto flow. */
export const CONTACT_ENDPOINT = new InjectionToken<string | null>('CONTACT_ENDPOINT', {
  providedIn: 'root',
  factory: () => null,
});

/** Subject + plain-text body for a message. Shared by the mailto transport and the error fallback link. */
export function composeEmail(msg: ContactMessage): { subject: string; body: string } {
  const subject = `[${SITE.domain}] ${msg.topicLabel}: ${msg.name}`;
  const lines = [
    ...(msg.brief ? [`Brief: ${msg.brief}`, ''] : []),
    msg.message.trim(),
    '',
    '--',
    `Name: ${msg.name}`,
    `Email: ${msg.email}`,
    `Topic: ${msg.topicLabel}`,
    ...(msg.budget ? [`Budget: ${msg.budget}`] : []),
    ...(msg.timeline ? [`Timeline: ${msg.timeline}`] : []),
    `Sent from: ${SITE.origin}/contact`,
  ];
  return { subject, body: lines.join('\r\n') };
}

export function mailtoHref(msg: ContactMessage): string {
  const { subject, body } = composeEmail(msg);
  return `mailto:${SITE.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

/** Default transport: hands the drafted email to the visitor's mail client. Browser only. */
@Injectable({ providedIn: 'root' })
export class MailtoTransport implements ContactTransport {
  readonly kind = 'mailto' as const;
  private readonly doc = inject(DOCUMENT);

  async send(msg: ContactMessage): Promise<void> {
    const win = this.doc.defaultView;
    if (!win) throw new Error('mailto transport needs a browser');
    // Navigating to a mailto: URL opens the mail app and leaves this page in place.
    win.location.href = mailtoHref(msg);
    // There is no way to know whether a mail app opened; give the handoff a moment, then resolve.
    await new Promise((r) => setTimeout(r, 600));
  }
}

/*
 * Ready-to-enable HTTP transport. Uses fetch, so no HttpClient provider is needed.
 * The endpoint should accept JSON and return 2xx on success. Keep any API key on the server side
 * (Worker / Edge Function); never ship a secret in this static bundle.
 *
 * @Injectable({ providedIn: 'root' })
 * export class HttpTransport implements ContactTransport {
 *   readonly kind = 'http' as const;
 *   private readonly endpoint = inject(CONTACT_ENDPOINT);
 *
 *   async send(msg: ContactMessage): Promise<void> {
 *     if (!this.endpoint) throw new Error('CONTACT_ENDPOINT is not set');
 *     const { subject } = composeEmail(msg);
 *     const res = await fetch(this.endpoint, {
 *       method: 'POST',
 *       headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
 *       body: JSON.stringify({ ...msg, subject }),
 *     });
 *     if (!res.ok) throw new Error(`Contact endpoint answered ${res.status}`);
 *   }
 * }
 */

export const CONTACT_TRANSPORT = new InjectionToken<ContactTransport>('CONTACT_TRANSPORT', {
  providedIn: 'root',
  // When HttpTransport is enabled:
  //   factory: () => (inject(CONTACT_ENDPOINT) ? inject(HttpTransport) : inject(MailtoTransport)),
  factory: () => inject(MailtoTransport),
});
