// Brand + identity constants. Change once, every page, meta tag and JSON-LD follows.
// Employers are intentionally never named anywhere on the site (owner's request).

export const SITE = {
  name: 'Mohammad Hamza',
  handle: 'mhfrough',
  at: '@mhfrough',
  domain: 'mhfrough.github.io',
  origin: 'https://mhfrough.github.io',
  role: 'Software Architect and Lead Developer',
  locality: 'Karachi',
  localityLabel: 'Karāchi',
  country: 'Pakistan',
  countryCode: 'PK',
  timeZone: 'Asia/Karachi',
  // Public contact address.
  email: 'mhfrough@yahoo.com',
  // Shown in the footer status link and on /hire. Keep honest.
  availableForWork: true,
  social: {
    github: 'https://github.com/mhfrough',
    linkedin: 'https://www.linkedin.com/in/mhfrough',
    dribbble: 'https://dribbble.com/mhfrough',
  },
  defaultOgImage: '/og/og-default.jpg',
  themeColor: '#111111',
  startedYear: 2020, // first full-time role
} as const;

export type SocialKey = keyof typeof SITE.social;
