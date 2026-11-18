// All visible copy for /work. English only, no em or en dashes, facts from docs/content.md.

export const COPY = {
  seo: {
    title: 'Work',
    description:
      'Selected work by Mohammad Hamza: 30+ products since 2020 across tax, banking, investment, multi-tenant SaaS, commerce and the public sector, plus Quorum.',
  },
  head: {
    title: 'Selected work',
    sub: '30+ products delivered since 2020 across tax, banking, investment, multi-tenant SaaS and commerce, plus products and products of my own.',
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
  tools: {
    title: 'Originals, private by default',
    note: 'Products I design, build and ship on my own. Each runs entirely on your device, with no server behind it and nothing to sign up for.',
    traits: ['Runs on your device', 'No sign-up', 'Open source'],
    prev: 'Scroll apps back',
    next: 'Scroll apps forward',
    caseStudy: 'Case study',
  },
  grid: {
    title: 'Client and freelance work',
    note: 'Client names stay private. Each card is described by domain.',
    count: (n: number) => `${n} ${n === 1 ? 'project' : 'projects'}`,
    role: 'Role',
    stack: 'Stack',
    status: 'Case study in progress',
    caseStudy: 'Read the case study',
    freelance: 'Freelance',
    externalHint: '(opens in a new tab)',
  },
  icons: {
    eyebrow: 'Icon design',
    title: 'Weather icons',
    note: '25 colorful weather icons, drawn in Adobe XD and published on Dribbble on 6 July 2022.',
    dribbble: 'See it on Dribbble',
    dribbbleUrl: 'https://dribbble.com/shots/18693985-Weather-Icons',
    gridLabel: 'Weather icons. Use the arrow keys to move between icons.',
    modeLabel: 'Icon style',
    modes: { animated: 'Animated', static: 'Static' },
    motion: 'Motion',
    still: 'None',
    group: 'Group',
    canvas: 'Canvas',
    shapes: 'Shapes',
    file: 'File',
    colors: 'Colors',
    sizes: 'At size',
    palette: 'Set palette',
    download: 'Download SVG',
    copy: 'Copy SVG',
    copied: 'Copied',
    copiedAnnounce: (name: string) => `${name} SVG copied to the clipboard.`,
    selectedAnnounce: (name: string) => `${name} selected.`,
  },
  close: {
    title: 'Need something like this built?',
    sub: 'Quote after a short scoping call.',
    cta: 'Hire me',
  },
} as const;
