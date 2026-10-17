// O2Chat case-study copy. English only, plain const.
// Facts come from the owner's CV (docs/content.md, item 3 "Omnichannel customer-engagement inbox" and item 10, the
// server-rendered marketing site) and the O2Chat repos (read, never modified; the archive folder is never used):
// the agent portal (1,180 of 1,497 commits by the owner, Jan 2025 to Sep 2026), the tenant portal (190 of 422), the
// public site (102 of 205), the chat widget (79 of 334) and its loader script (21 of 26): 1,572 commits from Sep
// 2024 to Sep 2026. The .NET hub and API were built by the backend team; the page never claims them. The company
// the owner built it for is never named. www.o2chat.io is live: the site screenshots are public pages only. At the
// owner's request (2026-10-11) the agent portal also appears as real screenshots, an exception to that rule: its
// local build run with invented sample data (scripts/o2chat-app-shots.mjs), never real customers or credentials.
// The widget, bot, hub and tenant portal stay my own mockups with invented people and messages.

export const LIVE_URL = 'https://www.o2chat.io/';

export const COPY = {
  seo: {
    title: 'O2Chat case study',
    description:
      'O2Chat puts website chat, WhatsApp, Messenger and Instagram in one team inbox, with a chatbot each business trains itself. I built its Angular frontend: the real-time agent portal, a chat widget that installs on any site with one script tag, the tenant portal and the server-rendered public site.',
    imageAlt: 'O2Chat case study cover: the O2 speech bubble above "Every channel, one inbox." beside the O2Chat pricing page.',
  },
  hero: {
    tag: 'Case study',
    pill: 'Sep 2024 to now, Angular frontend',
    line1: 'O2Chat',
    line2: 'Every channel, one inbox.',
    lede: 'O2Chat gives a support team one inbox for website chat, WhatsApp, Messenger and Instagram, plus a chatbot each business trains on its own content. I built its frontend: the real-time agent portal, the chat widget that installs on any site, the tenant portal for plans and users, and the public site.',
    live: 'Visit o2chat.io',
    back: 'View work',
  },
  meta: [
    { k: 'Role', v: 'Angular frontend, 1,572 commits in 5 repos' },
    { k: 'Timeline', v: 'Sep 2024 to now' },
    { k: 'Platforms', v: 'Agent portal, widget, tenant portal, site' },
    { k: 'Stack', v: 'Angular 16, SignalR, Universal, Bootstrap' },
  ],
  numbers: [
    { value: '1,180', label: 'of the agent portal’s 1,497 commits are mine, Jan 2025 to Sep 2026' },
    { value: '22', label: 'real-time hub events the inbox listens for, and 12 it sends' },
    { value: '55', label: 'lazy-loaded modules behind the portal’s sidebar' },
    { value: '6', label: 'install paths for the widget: Shopify, Magento, WordPress, Wix, Drupal, any site' },
  ],
  portal: {
    title: 'The agent portal, as built',
    sub: 'The screens a support team lives in: the dashboard a lead opens first, and the inbox with a conversation open. Taken from the portal’s own build, run locally.',
    note: 'The agent portal, run locally with sample data. Every customer, agent, message and number in these frames is invented.',
    shots: [
      {
        src: '/images/o2chat/app-dashboard.webp',
        url: 'localhost/dashboard',
        cap: 'Dashboard',
        sub: 'Response times, agents online, chats by channel and ratings.',
        alt: 'O2Chat agent portal dashboard with sample data: average response 42 seconds, longest wait 4 minutes, 5 agents online, an agent list with chat counts and star ratings, a bar chart comparing this month with last month, and chats by source for Website, WhatsApp, Messenger and Instagram.',
      },
      {
        src: '/images/o2chat/app-inbox.webp',
        url: 'localhost/chats',
        cap: 'Inbox',
        sub: 'Conversations by tab, assignment to a team and an agent, the thread.',
        alt: 'O2Chat agent portal inbox with sample data: the All Assigned tab lists nine conversations from Website, WhatsApp, Messenger and Instagram with tags such as Order and Delivery; Sara K. is open, assigned to Support and Aisha, asking to swap a shirt for a navy medium.',
      },
    ],
  },
  site: {
    title: 'The public site',
    sub: 'Angular Universal with an Express server, prerendered for search. Plans and prices load from the product’s own API, and the bubble in the corner is the widget itself.',
    url: 'o2chat.io/pricing',
    heroAlt: 'O2Chat pricing page: the O2Chat logo and menu, a monthly or yearly switch, and four plan cards, Free at $0, Growth at $18 and Pro at $35 per agent per month, and Enterprise on request, each with its features.',
    mobileAlt: 'O2Chat home page on a phone: the headline Turn Conversations Into Conversions, a blue get started button, then six channel icons for web, WhatsApp, Messenger, SMS, Instagram and Android.',
    details: [
      {
        src: '/images/o2chat/site-integrations.webp',
        h: 1000,
        alt: 'Home page integrations: Omni-channel Messaging, One Powerful Inbox beside Integrate O2Chat in Minutes, with WordPress, Wix, Shopify, Magento, Drupal and Webflow badges.',
        cap: 'Installs where the store already is',
      },
      {
        src: '/images/o2chat/site-compare.webp',
        h: 1000,
        alt: 'Compare LiveChat plans: a table of Free, Growth, Pro and Enterprise with monthly and annual prices and Smart text rows such as reply suggestions and chat summary.',
        cap: 'Plans, compared row by row',
      },
      {
        src: '/images/o2chat/site-features.webp',
        h: 1000,
        alt: 'Free Live Chat and Premium Features For All: a four-column list from JavaScript API and tags to web widgets and visitor information, above a contact form.',
        cap: 'Every feature in one list',
      },
    ],
    note: 'Screenshots of the live site. The home page’s hero photo and team-inbox illustration are left out of every frame.',
  },
  arch: {
    title: 'Every channel, one hub',
    sub: 'Messages from every channel land in one .NET real-time hub, built by the backend team. The Angular apps I built sit on either side of it: the widget customers type into, and the portals a team works from.',
    left: 'Where customers write',
    core: 'Real-time hub',
    coreSub: '.NET, SignalR groups per team',
    right: 'Where the team answers',
    channels: [
      { icon: 'phosphorBrowser', t: 'Website widget', s: 'One script tag, any site' },
      { icon: 'phosphorWhatsappLogo', t: 'WhatsApp', s: 'Inbox and template campaigns' },
      { icon: 'phosphorMessengerLogo', t: 'Messenger and Instagram', s: 'Messages, comments, posts' },
      { icon: 'phosphorDeviceMobile', t: 'iOS and Android SDKs', s: 'Chat inside the store’s app' },
    ],
    team: [
      { icon: 'phosphorTray', t: 'Agent portal', s: 'Inbox, tickets, campaigns' },
      { icon: 'phosphorRobot', t: 'AI bot', s: 'Trained per business' },
      { icon: 'phosphorBuildings', t: 'Tenant portal', s: 'Plans, users, invoices' },
      { icon: 'phosphorChartBar', t: 'Live dashboard', s: 'Chats by source, now' },
    ],
    installs: 'Installs on',
    platforms: ['Shopify', 'Magento', 'WordPress', 'Wix', 'Drupal', 'Any HTML page'],
  },
  inbox: {
    title: 'An inbox that never asks for a refresh',
    sub: 'The hero is the inbox as a working mockup. Below is what keeps it live: one hub connection that drops, retries and rejoins on its own, and a widget that holds a customer’s messages until the network is back.',
    holds: [
      { t: 'Tabs by ownership', s: 'New and unassigned, assigned to me, all assigned, resolved, archived and irrelevant. Who sees all assigned depends on the role’s access level.' },
      { t: 'Assign to a team or a person', s: 'An agent hands a conversation to a group and, optionally, one agent. The hub tells every open inbox, so it moves tabs everywhere at once.' },
      { t: 'Custom views', s: 'Saved filters by channel, tag, group, agent and date become tabs of their own, and live events only reach the views they match.' },
      { t: 'Typing and receipts', s: 'A typing event lights its conversation in the list for two and a half seconds; read receipts, tags and notes travel over the same connection.' },
    ],
  },
  widget: {
    title: 'One widget, two ways in',
    sub: 'The chat itself is an Angular app, customised per channel from the portal. Angular hosts mount it as a component; every other site gets a plain JS and CSS loader that adds the launcher and opens the chat in an iframe.',
  },
  bot: {
    title: 'A bot each business teaches',
    sub: 'Owners train the bot on questions and answers, pasted text, crawled pages and files, then set its name and tone, per channel if they like. A preview answers from that knowledge, and hands over to a person when it has none.',
  },
  tenants: {
    title: 'From sign-up to the first chat',
    sub: 'The tenant portal turns a sign-up into a workspace with a plan. Then the agent portal takes over, and the two pass the session back and forth so nobody signs in twice.',
    steps: ['Sign up', 'Email code', 'Organization', 'Plan', 'Agent portal', 'First channel'],
    rules: [
      { t: 'Two tokens, one interceptor', s: 'Chat calls carry the portal’s token; plans, wallet and AI calls carry the tenant’s. One interceptor picks the right one and the right base URL.' },
      { t: 'Plans gate features', s: 'Widget limits, WhatsApp and Messenger, the AI bot and voice features follow the plan. At the widget limit, Create is disabled and an upgrade prompt takes its place.' },
      { t: 'A wallet for voice', s: 'Voice to voice and voice streaming draw from a prepaid wallet, each with its own switch and its own usage line.' },
      { t: 'Back to the right screen', s: 'The agent portal opens the tenant portal on subscriptions, users, profile or security, carrying the session with it.' },
    ],
  },
  stack: {
    title: 'The stack',
    sub: 'Angular 16 across five repos, SignalR for everything live, and a vanilla JS loader where Angular cannot go.',
    groups: [
      {
        t: 'Agent and tenant portals',
        why: 'Lazy modules per area, guards per audience, one interceptor and a hub service shared by every screen.',
        items: [
          { name: 'Angular 16', logo: 'angular' },
          { name: 'TypeScript', logo: 'typescript' },
          { name: 'RxJS', logo: 'reactivex' },
          { name: 'SignalR client', icon: 'phosphorBroadcast' },
          { name: 'Bootstrap 5', logo: 'bootstrap' },
          { name: 'PrimeNG', logo: 'primeng' },
          { name: 'ngx-charts', icon: 'phosphorChartLineUp' },
          { name: 'FullCalendar', icon: 'phosphorCode' },
          { name: '@mhfrough/star-rating', icon: 'phosphorPackage' },
        ],
      },
      {
        t: 'Widget and loader',
        why: 'The chat runs as its own Angular app in an iframe; the loader is plain JavaScript and CSS with no dependencies.',
        items: [
          { name: 'Angular 16', logo: 'angular' },
          { name: 'Tailwind CSS', icon: 'phosphorCode' },
          { name: 'Dexie (IndexedDB)', icon: 'phosphorPackage' },
          { name: 'SignalR client', icon: 'phosphorBroadcast' },
          { name: 'Vanilla JS loader', logo: 'javascript' },
          { name: 'postMessage bridge', icon: 'phosphorShareNetwork' },
          { name: 'MediaRecorder', icon: 'phosphorCode' },
        ],
      },
      {
        t: 'Site and channels',
        why: 'A server-rendered site for search, push for agents, and install snippets for every store platform.',
        items: [
          { name: 'Angular Universal', logo: 'angular' },
          { name: 'Express', icon: 'phosphorCode' },
          { name: 'Firebase Cloud Messaging', logo: 'firebase' },
          { name: 'WhatsApp', logo: 'whatsapp' },
          { name: 'WordPress', logo: 'wordpress' },
          { name: 'Shopify, Magento, Wix, Drupal', icon: 'phosphorPlugs' },
        ],
      },
    ],
  },
  decisions: {
    title: 'Decisions and what I’d change',
    sub: 'Five repos, one hub, and a widget that has to behave on websites nobody on the team has ever seen.',
    items: [
      {
        t: 'An iframe and a small loader',
        s: 'The chat is an Angular app inside an iframe, so a store’s CSS can’t break it and its styles can’t leak out. The loader is about 400 lines of plain JS and CSS: launcher, iframe, back button closes the chat.',
      },
      {
        t: 'The microphone lives on the host page',
        s: 'Many sites never grant a microphone to a third-party iframe. Voice notes are recorded by the loader on the host page and posted into the chat as data, with start, stop and cancel as messages.',
      },
      {
        t: 'Nothing a customer types is lost',
        s: 'The widget keeps the conversation in IndexedDB, queues messages while offline and sends them once the hub is back. A message that still fails gets a resend button.',
      },
      {
        t: 'Splitting the widget’s hub service',
        s: 'One service had grown to own the connection, the listeners, sending and the visitor’s identity. In 2026 I split it into four, and four copies of the message template into components.',
      },
      {
        t: 'Register hub listeners once',
        s: 'The portal registers its 22 listeners again after every reconnect, and SignalR keeps both copies. Today I’d register them once, rejoin on reconnect, and use one typed event map instead of 22 untyped subjects.',
      },
      {
        t: 'Keep tokens out of URLs',
        s: 'The two portals hand a session over in a query string. Today I’d pass a one-time code and swap it for a session on the server, so a token never sits in history or logs.',
      },
    ],
  },
  next: {
    title: 'Many channels, one team?',
    sub: 'Real-time inboxes, embeddable widgets and multi-tenant portals that stay in sync.',
    hire: 'Hire me',
    other: 'Next: DMAX',
  },
} as const;
