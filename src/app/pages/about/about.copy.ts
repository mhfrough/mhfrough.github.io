// /about copy. Facts from docs/content.md plus the owner's own answers (2026-10-11). No employer names.

export const ABOUT_COPY = {
  seo: {
    title: 'About',
    description:
      'Mohammad Hamza (@mhfrough), a soft-spoken software architect from Karāchi. From tech blogging and teaching SEO in 2011 to leading Angular teams, plus the anime, films and games he loves.',
    imageAlt: 'About Mohammad Hamza, software architect in Karāchi',
  },

  hero: {
    tag: 'About',
    tagText: 'The person behind the code',
    line1: 'Soft-spoken.',
    line2: 'Pixel perfect.',
    lede: "I'm Mohammad Hamza, a software architect from Karāchi. I started out writing about tech and teaching SEO in 2011. Today I lead Angular teams, and I still check every pixel twice.",
    primary: 'View work',
    secondary: 'Get in touch',
  },

  profile: {
    name: 'Mohammad Hamza',
    handle: '@mhfrough',
    role: 'Software Architect',
    traits: ['Friendly', 'Soft-spoken', 'Introvert'],
    facts: [
      { k: 'Based in', v: 'Karāchi, Pakistan' },
      { k: 'Speaks', v: 'Urdu, English' },
      { k: 'Studied', v: 'BSc Computer Science, KIET' },
      { k: 'Values', v: 'Faith, family, loyalty' },
    ],
    clockLabel: 'Karāchi now',
    weekday: 'Weekday, so early bird mode',
    weekend: 'Weekend, so night owl mode',
  },

  numbers: [
    { value: '2011', label: 'first tech article published' },
    { value: '2020', label: 'BSc Computer Science, KIET Karāchi' },
    { value: '7+', label: 'years building production software, since 2020' },
    { value: '30+', label: 'products shipped' },
  ],

  story: {
    title: 'In my own words',
    sub: 'Who I am, how I work and what I care about, in a few minutes of reading.',
    lead: "I'm Mohammad Hamza, a software architect and product designer in Karāchi. Since 2020, 7+ years, I have built SaaS, fintech and enterprise products that people use every day. More than 30 of them so far.",
    paragraphs: [
      'I think in systems, not screens. When I pick up a product I look at how the pieces fit together: tenants and roles, payments, real-time events, the design system, and the person who has to use all of it at the end. Most of my work is Angular on the front and NestJS with PostgreSQL behind it, with Flutter when the product needs to live on a phone.',
      'Design is part of the build for me, not a coat of paint on top. I started out drawing icons and interfaces for Dribbble, and I still design most of what I build before I write the first line of code. Spacing, type and consistency matter to me as much as the code underneath them.',
      'I like the hard parts. Money moving through a fintech flow. A tax-filing widget that runs inside 6 banking apps. A slow frontend that has to load faster. When something breaks, I look for the real cause instead of hiding the symptom, and I check that the fix actually reaches production.',
    ],
    quote: "I'd rather own a problem from the first sketch to production than ship a ticket and walk away.",
    closing:
      'Today I lead a frontend team. I set conventions, review pull requests and own deployment decisions, and I try to write standards that help people get it right the first time. Outside work I build my own products, like Quorum, where seven AI personalities debate a decision and vote on it.',
    sign: { name: 'Mohammad Hamza', meta: '@mhfrough · Karāchi' },
    card: {
      title: 'At a glance',
      rows: [
        { icon: 'phosphorTreeStructure', k: 'Architecture', v: 'Multi-tenant SaaS, micro-frontends, real-time systems, embeddable widgets' },
        { icon: 'phosphorBrowser', k: 'Frontend', v: 'Angular, TypeScript, RxJS, SSR, performance and accessibility' },
        { icon: 'phosphorDatabase', k: 'Backend', v: 'NestJS, Node.js, PostgreSQL, Firebase, Stripe, WebSockets' },
        { icon: 'phosphorPenNib', k: 'Design', v: 'UI and UX, design systems, icons, mockups in Adobe XD' },
      ],
      nowLabel: 'Right now',
      now: 'Leading a frontend team, building Quorum and HRM Suite, and taking on select freelance work.',
    },
  },

  journey: {
    title: 'How I got here',
    sub: 'From a blog about HTML and SEO to leading a frontend team. The thread through all of it: learning something new and sharing it.',
    /** Accessible name prefix for the case-study pills under a step. */
    casesLabel: 'Case studies',
    steps: [
      {
        when: '2011',
        title: 'Blogger and teacher',
        icon: 'phosphorPencilLine',
        body: 'Wrote tech news and HTML and CSS tutorials, and taught SEO and blogging through my articles.',
      },
      {
        when: 'Until 2020',
        title: 'University',
        icon: 'phosphorGraduationCap',
        body: 'A BSc in Computer Science at KIET, Karāchi. University got me hooked on new things, and that never wore off.',
      },
      {
        when: '2020',
        title: 'Junior to senior',
        icon: 'phosphorCode',
        body: 'Joined full time on Asaan Hisab, an Angular invoicing app, then Befiler, a tax-filing platform that now runs inside 6 banking apps. Senior by mid 2021.',
        links: [
          { label: 'Asaan Hisab', href: '/work/asaan-hisab', mark: '/images/asaan-hisab/asaan-hisab-mark.webp' },
          { label: 'Befiler', href: '/work/befiler', mark: '/images/befiler/befiler-icon.webp' },
        ],
      },
      {
        when: '2023',
        title: 'Freelance on the side',
        icon: 'phosphorGlobe',
        body: 'Started contract and freelance work for clients in the UK and Europe, from food ordering and courier dispatch to fleet management.',
        links: [
          { label: 'Pizzerias', href: '/work/pizzerias', icon: 'phosphorForkKnife' },
          { label: 'Malik Transport', href: '/work/malik-transport', mark: '/images/malik-transport/malik-transport-mark.webp' },
          { label: 'Fleet', href: '/work/fleet', icon: 'phosphorTruck' },
        ],
      },
      {
        when: '2025',
        title: 'Lead frontend developer',
        icon: 'phosphorUsersThree',
        body: 'Leading a frontend team: conventions, code reviews and deployment decisions across 3 production platforms.',
      },
      {
        when: '2026',
        title: 'My own products',
        icon: 'phosphorRocketLaunch',
        body: 'Shipped Quorum, a Claude Code skill for hard decisions, and two frontend-only browser tools, Flick and Scrawl. Built Whiteboard, started HRM Suite and rebuilt this site from scratch.',
        links: [
          { label: 'Quorum', href: '/work/quorum', mark: '/images/quorum/favicon.svg' },
          { label: 'Flick', href: '/work/flick', mark: '/images/flick/flick-mark.svg' },
          { label: 'Scrawl', href: '/work/scrawl', mark: '/images/scrawl/scrawl-mark.svg' },
          { label: 'Whiteboard', href: '/work/whiteboard', icon: 'phosphorPencilSimpleLine' },
          { label: 'HRM Suite', href: '/work/hrm', mark: '/images/hrm/hrm-mark.svg' },
        ],
      },
    ],
  },

  values: {
    title: 'What I hold on to',
    sub: 'Three things that come before work, and one that shows up in all of it.',
    craft: {
      tag: 'Craft',
      title: 'Pixel perfect, a little OCD',
      body: 'Every icon on my Dribbble, every screen and every component gets the same care: aligned to the grid, checked at every size, finished properly. Small details are how people can tell someone cared.',
      link: 'See my icon work on Dribbble',
    },
    items: [
      { icon: 'phosphorSun', title: 'Faith', body: 'It comes first. It keeps me grounded and honest, at work and at home.' },
      { icon: 'phosphorHouseLine', title: 'Family', body: 'Home is where I recharge, and the reason behind the work.' },
      {
        icon: 'phosphorHandshake',
        title: 'Loyalty',
        body: 'To family, friends, teams and clients. I stay for the long run: one platform took me from junior to lead.',
      },
    ],
  },

  hobbies: {
    title: 'Off the clock',
    sub: 'Anime, films, games and sport, plus a garden, travel, music and good food.',
    anime: {
      tag: 'Anime',
      title: 'Watch list I keep recommending',
      titles: ['Violet Evergarden', 'Steins;Gate', 'Naruto', 'Pokémon', 'Astra Lost in Space'],
      note: 'Violet Evergarden first, always.',
    },
    films: {
      tag: 'Films',
      title: 'Favourite films',
      titles: ['Interstellar', 'Inception', 'Predestination', 'Real Steel'],
      note: 'Three of these four bend time. So does Steins;Gate. I see a pattern.',
    },
    games: {
      tag: 'Games',
      title: 'What I play',
      titles: ['Dota 2', 'GTA V', 'Red Dead Redemption', 'Elden Ring', 'The Witcher 3', 'Retro classics'],
      note: 'Weekend nights, when the night owl comes out.',
    },
    travel: {
      tag: 'Travel',
      title: 'Favourite trip so far: Umrah',
      note: 'Also into',
      extras: ['Travel', 'Music', 'Food'],
      rows: [
        { icon: 'phosphorMountains', name: 'Northern Pakistan', ctx: 'Favourite region' },
        { icon: 'phosphorPersonSimpleHike', name: 'Hiking and long walks', ctx: 'On foot' },
        { icon: 'phosphorSnowflake', name: 'Cold weather', ctx: 'Down to −4°C' },
      ],
    },
    sport: {
      tag: 'Sport',
      title: 'Where I play',
      rows: [
        { name: 'Bowling', ctx: 'With friends' },
        { name: 'Badminton', ctx: 'At the office' },
        { name: 'Table tennis', ctx: 'Since university' },
      ],
    },
    garden: {
      tag: 'Gardening',
      title: 'What I grow',
      rows: [
        { name: 'Tomatoes', ctx: 'Harvested' },
        { name: 'Papaya', ctx: 'Growing' },
      ],
      note: 'The tomatoes worked. Papaya is the patient one.',
    },
    world: {
      tag: 'Faith and interests',
      title: 'Faith and the world',
      rows: [
        { name: 'Islam', ctx: 'Faith' },
        { name: 'Current affairs', ctx: 'Follow' },
        { name: 'Global politics', ctx: 'Follow' },
      ],
    },
  },

  gallery: {
    title: 'A few photos',
    sub: 'Life outside the editor. Select a photo to see it larger.',
    open: 'Open photo',
    close: 'Close photo',
    prev: 'Previous photo',
    next: 'Next photo',
    of: 'of',
  },

  close: {
    title: 'Want to talk?',
    sub: 'About work, or about anime. I reply to every message myself.',
    primary: 'Get in touch',
    secondary: 'View work',
  },
} as const;
