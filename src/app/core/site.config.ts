// Brand + identity constants. Change once, every page, meta tag and JSON-LD follows.
// Employers are intentionally never named anywhere on the site (owner's request).

export const SITE = {
  name: 'Mohammad Hamza',
  handle: 'mhfrough',
  at: '@mhfrough',
  domain: 'mhfrough.dev',
  origin: 'https://mhfrough.dev',
  role: 'Software Architect',
  locality: 'Karachi',
  country: 'Pakistan',
  countryCode: 'PK',
  timeZone: 'Asia/Karachi',
  // Public contact address. Suggested: route hello@mhfrough.dev to this inbox (e.g. Cloudflare Email Routing).
  email: 'mhfrough@yahoo.com',
  // Drop a square photo at public/images/avatar.webp (min 256x256) and set this to '/images/avatar.webp'.
  // Until then the avatar renders the ء monogram.
  avatar: null as string | null,
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
