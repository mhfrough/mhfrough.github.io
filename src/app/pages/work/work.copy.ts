// All visible copy for /work. English only, no em or en dashes, facts from docs/content.md.

export const COPY = {
  seo: {
    title: 'Work',
    description:
      'Selected work by Mohammad Hamza: 14+ products since 2020 across tax, banking, investment, multi-tenant SaaS, commerce and the public sector, plus Quorum.',
  },
  head: {
    title: 'Selected work',
    sub: '14+ products delivered since 2020 across tax, banking, investment, multi-tenant SaaS and commerce, plus one product of my own.',
  },
  filter: {
    label: 'Filter projects by domain',
    /** Polite live region text after a filter change. */
    announce: (count: number, label: string) =>
      label === 'All' ? `Showing all ${count} projects.` : `Showing ${count} ${count === 1 ? 'project' : 'projects'} in ${label}.`,
  },
  featured: {
    eyebrow: 'Own product',
    badge: 'Full case study',
    cta: 'Read the case study',
  },
  grid: {
    title: 'Client and freelance work',
    note: 'Client names stay private. Each card is described by domain.',
    count: (n: number) => `${n} ${n === 1 ? 'project' : 'projects'}`,
    role: 'Role',
    stack: 'Stack',
    status: 'Case study in progress',
    freelance: 'Freelance',
    externalHint: '(opens in a new tab)',
  },
  close: {
    title: 'Need something like this built?',
    sub: 'Quote after a short scoping call.',
    cta: 'Hire me',
  },
} as const;
