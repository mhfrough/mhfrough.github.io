// Arittek case-study copy. English only, plain const.
// Facts come from the arittek-web repo (read, never modified; 53 of 54 commits by the owner) and the public
// www.arittek.com site. Naming exception (owner, 2026-10-11): this case study may name Arittek and show its site
// and mark, as the client whose website the owner built, like the Befiler exception. It never calls Arittek the
// owner's employer, never gives his job title there, and never names other employers or client banks (the bank
// logo strips, testimonials and product cards for other brands are kept out of every screenshot). Al-Qist, DMax
// and TollX are named because arittek.com names them publicly.
// Security: describe the system at the level a visitor needs. Nothing from the backend config, no hosts, no
// mailboxes, no limits that would help an attacker. The admin appears only as my own mockups with sample data.

export const LIVE_URL = 'https://www.arittek.com/';

export const COPY = {
  seo: {
    title: 'Arittek case study',
    description:
      'Arittek, Karāchi: the prerendered Angular site for its banking, data and toll platforms, and the PHP back office behind it, with a blog editor, scheduled publishing, four kinds of campaign, inquiries and role-based permissions. One build, one folder on shared hosting.',
    imageAlt: 'Arittek case study cover: the Arittek mark above "A company site with its own back office."',
  },
  hero: {
    tag: 'Case study',
    pill: 'Jun 2023, rebuilt Sep to Oct 2026',
    line1: 'Arittek.',
    line2: 'A company site with its own back office.',
    lede: 'Arittek builds banking, data and toll platforms in Karāchi. I built its website in June 2023, then rebuilt it in 2026 on a new design: 20 prerendered pages, and a PHP back office where the team writes the blog, plans campaigns, answers inquiries and decides who can do what.',
    live: 'Visit arittek.com',
    back: 'View work',
  },
  meta: [
    { k: 'Role', v: 'Frontend and PHP backend, 53 of 54 commits' },
    { k: 'Timeline', v: 'Jun 2023, rebuilt Sep to Oct 2026' },
    { k: 'Platforms', v: 'Public site, admin back office' },
    { k: 'Stack', v: 'Angular 16, Universal, PHP, MySQL' },
  ],
  numbers: [
    { value: '20', label: 'pages prerendered to flat HTML, served by Apache with no Node server' },
    { value: '48', label: 'PHP endpoints behind the back office, every one behind a session check' },
    { value: '32', label: 'permissions: 8 modules, each with create, read, update and delete' },
    { value: '4', label: 'campaign types in one editor: email, SMS, website popup and social' },
  ],
  site: {
    title: 'The public face',
    sub: 'Navy, gold and cream for a company that sells to banks: a home page with a slider and a timeline, a page for each product, services, careers and contact. Every page is prerendered, so the first paint is the real content.',
    url: 'arittek.com',
    heroAlt: 'arittek.com home page: the Arittek mark and menu above a navy hero, "Building Intelligence. Driving Progress.", two buttons and a photo of a glass meeting room with "13+ years of engineering impact".',
    mobileAlt: 'arittek.com on a phone: the mark, a menu button, the navy hero with its headline and two buttons, and the meeting room photo.',
    details: [
      {
        src: '/images/arittek/site-alqist.webp',
        h: 619,
        alt: 'Al-Qist page: "Islamic Pool Management. Engineered for Trust." beside a laptop showing the Al-Qist dashboard in front of stone columns.',
        cap: 'Al-Qist, Islamic pool management',
      },
      {
        src: '/images/arittek/site-dmax.webp',
        h: 619,
        alt: 'DMax page: "Accelerate Data. Unlock Decisions." beside a laptop showing a pipeline dashboard in a server room.',
        cap: 'DMax, data acceleration',
      },
      {
        src: '/images/arittek/site-tollx.webp',
        h: 619,
        alt: 'TollX page: "Smarter Toll Operations. Uninterrupted Journeys." beside a photo of a row of toll booths at night.',
        cap: 'TollX, toll management',
      },
    ],
    journeyAlt: 'Home page timeline, "13 Years of Engineering Impact": founded in Karāchi in 2013, Al-Qist and TollX live in 2016, data engineering in 2020, AI and engagement in 2026.',
    note: 'Screenshots of the live site, each cropped to one hero or section. The back office is shown below as my own mockups, with sample posts and figures.',
  },
  arch: {
    title: 'Static where it can be, PHP where it must',
    sub: 'The host is shared hosting with Apache and MySQL, no Node. So pages are rendered at build time, and the only code that runs on a request is PHP: the blog, the popup, the forms and the back office.',
    left: 'Visitors',
    core: 'Apache on shared hosting',
    coreSub: 'The site and api/ in one folder',
    right: 'The Arittek team',
    visitors: [
      { icon: 'phosphorFileHtml', t: 'Prerendered pages', s: '20 routes as flat HTML files' },
      { icon: 'phosphorArticle', t: 'Blog and policies', s: 'Filled in by PHP from MySQL' },
      { icon: 'phosphorBrowser', t: 'Popup campaign', s: 'Fetched after load, capped per visitor' },
      { icon: 'phosphorEnvelopeSimple', t: 'Contact form', s: 'Stored, then answered from the admin' },
    ],
    team: [
      { icon: 'phosphorArticle', t: 'Blog and comments', s: 'Write, schedule, moderate' },
      { icon: 'phosphorMegaphone', t: 'Campaigns', s: 'Email, SMS, popup, social' },
      { icon: 'phosphorTray', t: 'Inquiries', s: 'Reply by email, keep the thread' },
      { icon: 'phosphorUsersThree', t: 'Users and roles', s: 'Permissions per module' },
    ],
  },
  build: {
    title: 'One build, one folder',
    sub: 'A single command produces everything the host needs. The result is dragged into public_html as it is: no server process, no deploy tool, nothing to keep alive.',
    steps: ['Bump the version', 'Prerender 20 routes', 'Flatten to about.html', 'Copy the PHP into api/', 'Upload one folder'],
    rules: [
      { t: 'One address per page', s: '/about is served from about.html. /about.html and /about/ answer with a 301 to /about, and the bare domain goes to www.' },
      { t: 'Pages from the database', s: 'A blog post or policy page gets its title, description, share tags and text in the HTML from PHP, so link previews work without JavaScript.' },
      { t: 'Caching that survives a deploy', s: 'HTML is always revalidated; hashed scripts and styles are cached for a year. An old page can never point at bundles that are gone.' },
      { t: 'A demo nobody indexes', s: 'A second build for a /demo folder adds noindex to every page and header, turns crawlers away and drops the sitemap, and fails if any step did not take.' },
    ],
  },
  publish: {
    title: 'Publishing without a developer',
    sub: 'The editor in the hero is the post screen: the slug follows the title until you touch it, the SEO fields have the lengths search engines show, and a scheduled post goes live on its own.',
    steps: [
      { t: 'Draft', s: 'Rich text in Quill, a featured image, an excerpt up to 160 characters.' },
      { t: 'Scheduled', s: 'Needs a time in the future. Saved as a date, not a job.' },
      { t: 'Published', s: 'Promoted by the next read of the site; a cron job only tightens the timing.' },
      { t: 'In the sitemap', s: 'A PHP sitemap lists every published post with its last change.' },
    ],
  },
  campaigns: {
    title: 'Four kinds of campaign, one editor',
    sub: 'Each type shows only the fields it needs. Email and SMS go to the audience list or a tag, and the recipient count is saved with the campaign. The popup runs on the site itself, with views, clicks and dismissals counted.',
  },
  roles: {
    title: 'Who can do what',
    sub: 'A role is a matrix of eight modules and four actions, cached in the session at sign-in. The screen hides what a role cannot do, and the PHP endpoint refuses it anyway.',
  },
  office: {
    title: 'The rest of the back office',
    sub: 'The parts nobody sees on the public site, and the ones that keep it honest.',
    items: [
      { icon: 'phosphorChatCircleText', t: 'Comment moderation', s: 'Every comment waits for a person. Links, rude words and a pile of @ mentions raise a flag; nothing is rejected automatically. A hidden field catches bots.' },
      { icon: 'phosphorTray', t: 'Inquiries', s: 'Contact messages land in a list with a status. A reply goes out by email from the site’s own domain and is kept with the message.' },
      { icon: 'phosphorClockCounterClockwise', t: 'Activity and soft delete', s: 'Every change writes who, what and when to an activity log. Delete hides a row instead of removing it, and lists show who changed it last.' },
      { icon: 'phosphorLockKey', t: 'Sign-in', s: 'Repeated failed attempts lock an address out for a while. Passwords reset by an emailed link, and an idle screen covers the admin after 15 minutes.' },
    ],
  },
  stack: {
    title: 'The stack',
    sub: 'Angular 16 with Universal for the build, plain PHP and MySQL for everything that has to run on a request.',
    groups: [
      {
        t: 'Site',
        why: 'Lazy-loaded modules per page, prerendered at build time, design tokens for every colour and size.',
        items: [
          { name: 'Angular 16', logo: 'angular' },
          { name: 'Angular Universal', logo: 'angular' },
          { name: 'TypeScript', logo: 'typescript' },
          { name: 'RxJS', logo: 'reactivex' },
          { name: 'Bootstrap 5', logo: 'bootstrap' },
          { name: 'Sass', logo: 'sass' },
        ],
      },
      {
        t: 'Back office',
        why: 'Reactive forms, a rich-text editor, and a JSON API of small PHP files over one PDO connection.',
        items: [
          { name: 'PHP', logo: 'php' },
          { name: 'MySQL', icon: 'phosphorPackage' },
          { name: 'Quill editor', icon: 'phosphorCode' },
          { name: 'Reactive forms', logo: 'angular' },
          { name: 'Sessions + roles', icon: 'phosphorLock' },
          { name: 'SQL migrations', icon: 'phosphorPackage' },
        ],
      },
      {
        t: 'Build and checks',
        why: 'Node scripts shape the build for Apache; Playwright covers the admin flows.',
        items: [
          { name: 'Node build scripts', logo: 'nodedotjs' },
          { name: 'Apache rewrites', icon: 'phosphorPlugs' },
          { name: 'Playwright', icon: 'phosphorShieldCheck' },
          { name: 'Cache headers', icon: 'phosphorGauge' },
          { name: 'Sitemaps', icon: 'phosphorShareNetwork' },
        ],
      },
    ],
  },
  decisions: {
    title: 'Decisions and what I’d change',
    sub: 'A marketing site on shared hosting that also had to become a small CMS.',
    items: [
      {
        t: 'No server to keep alive',
        s: 'The host runs Apache and PHP, not Node. Prerendering at build time and flattening each route to one HTML file gave server-rendered pages with nothing running between requests.',
      },
      {
        t: 'Schedules without cron',
        s: 'Scheduled posts and campaigns are promoted at the top of every read, so they go live with the next visitor. A cron job is optional and only makes the timing exact.',
      },
      {
        t: 'Delete means hide',
        s: 'Every admin table soft-deletes, and the activity log keeps a copy of each person’s name. Removing a user never breaks history, and a mistake can be undone in the database.',
      },
      {
        t: 'Hide in the screen, refuse in PHP',
        s: 'One permissions service hides buttons a role cannot use. The real gate is a single check in each endpoint that answers 403, so a crafted request gets nowhere.',
      },
      {
        t: 'Gate every endpoint',
        s: 'The permission check guards the endpoints that change data. Today I’d put it on every read as well, and generate the list of endpoints and modules from one place so none is missed.',
      },
      {
        t: 'Hand campaigns to a sender',
        s: 'Email and SMS campaigns are planned, scheduled and counted, and the popup runs live. Next is a queue that hands them to a mail and SMS provider and writes delivery back to the list.',
      },
    ],
  },
  next: {
    title: 'A company site that needs a back office?',
    sub: 'Prerendered marketing sites, small CMSs with real permissions, and builds that fit the hosting you already have.',
    hire: 'Hire me',
    other: 'Next: Pizzerias',
  },
} as const;
