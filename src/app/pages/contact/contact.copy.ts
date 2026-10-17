// Copy for /contact. English only, plain const, no translation layer. Owner to confirm the response-time promise.
import { ContactTopic } from './contact.service';

export interface Option<V extends string = string> {
  value: V;
  label: string;
}

export const MESSAGE_MIN = 20;
export const MESSAGE_MAX = 2000;

export const CONTACT_COPY = {
  seo: {
    title: 'Contact',
    description:
      'Get in touch with Mohammad Hamza (@mhfrough) about a freelance project, contract work, an architecture review or a full-time role.',
  },

  hero: {
    pillTag: 'Contact',
    pill: 'Usually replies within two working days',
    line1: 'Tell me what',
    line2: 'you are building.',
    lede: 'A few lines on the product, where it stands and what you need. That is enough to start.',
  },

  formTitle: 'Send a message',
  formNote: 'Fields marked optional can be left blank.',
  optional: 'optional',
  summaryTitle: 'There is a problem',

  name: { label: 'Your name' },
  email: { label: 'Email address', hint: 'Only used to reply to you.' },
  topic: {
    legend: 'What is this about?',
    options: [
      { value: 'freelance', label: 'Freelance project' },
      { value: 'contract', label: 'Contract or part-time' },
      { value: 'fulltime', label: 'Full-time role' },
      { value: 'review', label: 'Architecture review' },
      { value: 'other', label: 'Something else' },
    ] as Option<ContactTopic>[],
  },
  brief: {
    label: 'Brief from the scope builder',
    remove: 'Remove brief',
  },
  budget: {
    label: 'Budget',
    hint: 'In US dollars. A rough band is enough.',
    empty: 'Choose a range',
    options: [
      { value: 'under-2k', label: 'Under $2,000' },
      { value: '2k-5k', label: '$2,000 to $5,000' },
      { value: '5k-15k', label: '$5,000 to $15,000' },
      { value: '15k-40k', label: '$15,000 to $40,000' },
      { value: 'over-40k', label: 'Over $40,000' },
      { value: 'unsure', label: 'Not sure yet' },
    ] as Option[],
  },
  timeline: {
    label: 'Timeline',
    empty: 'Choose a timeline',
    options: [
      { value: 'asap', label: 'As soon as possible' },
      { value: 'month', label: 'Within a month' },
      { value: 'quarter', label: 'In 1 to 3 months' },
      { value: 'later', label: 'Later, just exploring' },
    ] as Option[],
  },
  message: {
    label: 'Message',
    hint: 'What you are building, where it stands, and what you need help with.',
  },
  counter: (n: number, max: number) => `${n} / ${max}`,
  counterSr: (n: number, min: number, max: number) =>
    n < min ? `${min - n} more characters needed` : `${max - n} characters remaining`,
  consent: {
    before: 'I agree that my details are used only to reply to this message, as described in the ',
    link: 'privacy policy',
    after: '.',
  },
  honeypot: 'Leave this field empty',

  submit: 'Send message',
  submitHint:
    'Opens your email app with the message ready to send. Nothing leaves this page until you press send there.',
  submitting: 'Opening your email app',

  errors: {
    nameRequired: 'Enter your name',
    emailRequired: 'Enter your email address',
    emailFormat: 'Enter an email address in the correct format, like name@example.com',
    topicRequired: 'Choose what this is about',
    messageRequired: 'Enter a message',
    messageMin: (min: number) => `Message must be at least ${min} characters`,
    messageMax: (max: number) => `Message must be ${max} characters or fewer`,
    consentRequired: 'Tick the box to agree to how your details are used',
  },

  success: {
    tag: 'Drafted',
    title: 'Your email app should now be open',
    body: 'The message is written and addressed to me. Press send in your email app and it reaches my inbox. Nothing has been sent yet.',
    nothing: 'Nothing opened? Open the draft again, or copy my address and write from any inbox.',
    again: 'Open the draft again',
    edit: 'Edit message',
    restart: 'Start a new message',
  },
  // Used once an HttpTransport delivers the message for real (see contact.service.ts).
  sent: {
    tag: 'Sent',
    title: 'Thanks, your message is on its way',
    body: 'It reached my inbox just now. I will reply to the address you gave, usually within two working days.',
    restart: 'Send another message',
  },
  submitHintHttp: 'Sent straight to my inbox. Your details are used only to reply.',
  submittingHttp: 'Sending',
  failure: {
    title: 'The message could not be prepared',
    body: 'Something went wrong on this page. Your text is still in the form.',
    retry: 'Try again',
    mailto: 'Email me instead',
  },

  aside: {
    direct: 'Direct',
    directSub: 'Prefer your own inbox? Write to me directly.',
    copy: 'Copy',
    copyLabel: 'Copy email address',
    copied: 'Copied',
    copiedSr: 'Email address copied',
    copyFailed: 'Copy failed. Select the address and copy it manually.',
    elsewhere: 'Elsewhere',
    newTab: 'opens in a new tab',
    channels: [
      {
        key: 'linkedin',
        label: 'LinkedIn',
        icon: 'phosphorLinkedinLogo',
        note: 'Messages and intros',
      },
      { key: 'github', label: 'GitHub', icon: 'phosphorGithubLogo', note: 'Code and open source' },
      {
        key: 'dribbble',
        label: 'Dribbble',
        icon: 'phosphorDribbbleLogo',
        note: 'Icon and UI design',
      },
    ],
    response: 'Response time',
    responseValue: 'Usually within two working days, Monday to Friday.',
    time: 'Local time in Karāchi',
    zone: 'UTC+5',
    working: 'Within working hours',
    offHours: 'Outside working hours, replies resume next working day',
    overlap: 'Overlaps UK and EU mornings to afternoons.',
  },
} as const;
