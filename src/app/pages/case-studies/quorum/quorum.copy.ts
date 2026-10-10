// All copy for the Quorum case study. English only. Facts come from the Quorum repo
// (README, skills/quorum/SKILL.md + council.md, index.html, chamber.js, promo scripts, tests, git log).

export const LIVE_URL = 'https://mhfrough.github.io/quorum/';
export const REPO_URL = 'https://github.com/mhfrough/quorum';
export const INSTALL_UNIX = 'curl -fsSL https://mhfrough.github.io/quorum/install.sh | sh';
export const INSTALL_WIN = 'irm https://mhfrough.github.io/quorum/install.ps1 | iex';

/** A quote split into plain runs and *stage directions* (rendered as mono accent, like Quorum does). */
export type Run = { t: string; em?: boolean };
const runs = (s: string): Run[] =>
  s
    .split(/(\*[^*]+\*)/g)
    .filter(Boolean)
    .map((t) => (t.startsWith('*') && t.endsWith('*') ? { t: t.slice(1, -1), em: true } : { t }));

export interface Member {
  id: string;
  name: string;
  icon: string;
  role: string;
  model: 'Opus' | 'Sonnet' | 'Haiku';
  method: string;
  methodBody: string;
  voice: string;
  swearing: string;
  says: Run[];
  blind: string;
  traits: string[];
  move: string;
}

// Quotes are the members' own lines from the Quorum site, with emoji left out.
export const MEMBERS: Member[] = [
  {
    id: 'anchor',
    name: 'Anchor',
    icon: 'phosphorAnchor',
    role: 'Conscience and discipline',
    model: 'Opus',
    method: 'Values and commitment test',
    methodBody: 'Is it right, can you commit, and what is the plan?',
    voice: 'Wise elder, drill sergeant',
    swearing: 'No swearing',
    says: runs('Peace, friend. Check your intent first. If it is honest: First, read the terms. Second, set the date. Third, no excuses.'),
    blind: 'Idealism and rigidity.',
    traits: ['Angel', 'Willpower', 'Discipline'],
    move: 'Walks straight lines, like a rook.',
  },
  {
    id: 'dawn',
    name: 'Dawn',
    icon: 'phosphorSunHorizon',
    role: 'The upside',
    model: 'Sonnet',
    method: 'Upside and opportunity cost',
    methodBody: 'The best realistic outcome, and what you lose by not trying.',
    voice: 'Gen Z hype coach',
    swearing: 'Mild swearing',
    says: runs("LET'S GOOO, no cap, this is a massive W. Lock in for 90 days and secure the bag."),
    blind: 'Optimism bias and greed.',
    traits: ['Hope', 'Greed', 'Joy', 'Life'],
    move: 'Moves like a queen, up to three squares.',
  },
  {
    id: 'kindred',
    name: 'Kindred',
    icon: 'phosphorHandHeart',
    role: 'The people',
    model: 'Sonnet',
    method: 'Stakeholder impact',
    methodBody: 'Who this touches, how it will feel, and who needs a conversation first.',
    voice: 'Loving, many languages',
    swearing: 'No swearing',
    says: runs("Aigoo, bestie, it's valid to be tired. Habibi, ask the people at home how this feels first. Protect your peace."),
    blind: 'Too lenient, avoids hard calls.',
    traits: ['Love', 'Compassion', 'Sensitivity', 'Social'],
    move: 'Steps toward whoever is closest, never crowding them.',
  },
  {
    id: 'pyre',
    name: 'Pyre',
    icon: 'phosphorFire',
    role: 'What must stop',
    model: 'Sonnet',
    method: 'What must end',
    methodBody: 'What is rotten, what to cut, and the loss you have to accept.',
    voice: 'Furious, then grim',
    swearing: 'Strong swearing',
    says: runs("Bro WHAT. Nah fam, this is cooked. Khalas, cut what's draining you. ...it was good once. let yourself miss it."),
    blind: 'Burns what should be kept.',
    traits: ['Anger', 'Disgust', 'Death', 'Grief'],
    move: 'Charges in a straight line as far as it can.',
  },
  {
    id: 'shadow',
    name: 'Shadow',
    icon: 'phosphorMoon',
    role: 'The red team',
    model: 'Opus',
    method: 'Pre-mortem and reversibility',
    methodBody: 'How this fails, what cannot be undone, and the guardrail.',
    voice: 'Sarcastic villain',
    swearing: 'Strong swearing',
    says: runs("Nope. *psst...* darling, who's checking? *heh* WAIT. Everyone is. Red flag. Read the damn contract."),
    blind: 'Assumes the worst about everyone.',
    traits: ['Fear', 'Negative', 'Devil'],
    move: 'Glides on diagonals, like a bishop.',
  },
  {
    id: 'wanderer',
    name: 'Wanderer',
    icon: 'phosphorCompass',
    role: 'Fresh eyes',
    model: 'Sonnet',
    method: 'Outside view and third options',
    methodBody: 'How others decide this, the third option, and a cheap test before you commit.',
    voice: 'Polite, well-travelled nerd',
    swearing: 'No swearing',
    says: runs('Forgive me, but how curious. Tiens! ¿Y si... you tested it for one month before choosing?'),
    blind: 'Chases novelty, misses context.',
    traits: ['Curiosity', 'Outsider'],
    move: 'Hops like a knight.',
  },
  {
    id: 'grug',
    name: 'Grug',
    icon: 'phosphorBone',
    role: 'Bone simple',
    model: 'Haiku',
    method: 'The one obvious thing',
    methodBody: 'Ask the simple question nobody asked, gut vote, then say what to do now.',
    voice: 'Grunts and barks',
    swearing: 'Mild swearing',
    says: runs('Huh? Two cave, one Grug. *burf* Big fire. Woof. Read paper first. Then pick. *bonk*'),
    blind: 'Too simple. Loses nuance.',
    traits: ['Naive', 'Caveman'],
    move: 'One square at a time, like a king.',
  },
];

/** The example report from the Quorum site: "Rewrite our React Native app in Flutter?" */
export const EXAMPLE_VOTES: { id: string; vote: 1 | -1; says: Run[] }[] = [
  { id: 'anchor', vote: 1, says: runs('Peace, friend. Festina lente. First, spike. Second, measure. Third, decide. No excuses.') },
  { id: 'dawn', vote: 1, says: runs("LET'S GOOO, a clean codebase in six months? That's a massive W, no cap.") },
  { id: 'kindred', vote: -1, says: runs('Aigoo, the team is already tired, cariño. Ask them before you pile this on.') },
  { id: 'pyre', vote: 1, says: runs('Bro WHAT. Those bridge bugs blocked releases for MONTHS. Nah fam, khalas.') },
  { id: 'shadow', vote: -1, says: runs('Nope, rewrites kill products. *psst...* skip the tests to hit the date? *heh* Red flag.') },
  { id: 'wanderer', vote: 1, says: runs('Forgive me, but other teams migrate one screen at a time. ¿Y si... you tried two first?') },
  { id: 'grug', vote: -1, says: runs('Ugh. Big rewrite, big fire. *burf* Small test first. Woof.') },
];

export const COPY = {
  seo: {
    title: 'Quorum case study',
    description:
      'Quorum, a Claude Code skill where seven personality sub-agents debate a decision, vote, and return a clear YES or NO. Product, design, engineering and motion by Mohammad Hamza.',
    imageAlt: 'Quorum: One decision. Seven minds. A skill for Claude Code.',
  },
  hero: {
    pillTag: 'Case study',
    pill: 'A skill for Claude Code',
    title: 'Quorum',
    titleSoft: 'A council of seven minds.',
    lede: 'A Claude Code skill for hard decisions, plus the site, 3D board and reels I built to launch it.',
    live: 'Live site',
    source: 'Source',
    newTab: '(opens in a new tab)',
    coverAlt: 'The Quorum cover: One decision. Seven minds. The seven members as icons and the command /quorum "Should I take the offer?"',
    meta: [
      { k: 'Role', v: 'Solo: product, design, engineering, motion' },
      { k: 'Timeline', v: 'October 2026' },
      { k: 'Stack', v: 'Claude Code sub-agents, HTML, CSS, JS, three.js, Playwright' },
      { k: 'License', v: 'MIT, free' },
    ],
  },
  problem: {
    title: 'One answer hides the tradeoff',
    body: [
      'Ask a single assistant about a hard call and you get one balanced voice: some pros, some cons, a careful "it depends". The real tension behind the decision stays buried, and you still have to dig it out yourself.',
      'Quorum splits that one voice into seven. Each member decides with its own method, on its own model, and none of them can see the others. Disagreement is the point: the report names each clash, so you see the tradeoff instead of a blend.',
    ],
    defWord: 'quorum',
    defPos: 'noun',
    def: 'The minimum number of members a group needs before its decision counts.',
    defNote: 'Here, seven minds make the quorum.',
  },
  council: {
    title: 'Seven minds, one council',
    sub: 'Twenty-two traits merged into seven voices. Each member has its own decision method, model, voice and blind spot, written into the skill word for word.',
    tablist: 'Council members',
    method: 'Method',
    says: 'Sounds like',
    blind: 'Blind spot',
    traits: 'Merged traits',
    board: 'On the board',
  },
  how: {
    title: 'How a council runs',
    sub: 'One command. The skill handles the fan-out, keeps every member in character, and hands back a single report.',
    steps: [
      { icon: 'phosphorSignpost', t: 'Frame', d: 'The question becomes a clear decision: the options, what is known, what is not, and whether it can be undone.' },
      { icon: 'phosphorUsersThree', t: 'Fan out', d: 'Up to seven separate sub-agents start in parallel, each on its own model. None of them can see the others.' },
      { icon: 'phosphorArrowsDownUp', t: 'Vote', d: 'Every member votes up or down in its own voice, and names the one fact that would flip its vote.' },
      { icon: 'phosphorScales', t: 'Count', d: 'Up is +1, down is -1. Above zero is YES, below is NO, and a tie breaks toward the more reversible option.' },
      { icon: 'phosphorHand', t: 'Ask', d: 'The Quorum only advises. Nothing is edited, sent or changed until you say yes.' },
    ],
  },
  vote: {
    title: 'Count it yourself',
    sub: 'The example report from the Quorum site. Flip any vote and the score and result recount with the skill’s own rules.',
    reportTitle: 'Quorum: Flutter rewrite',
    decision: 'Decision',
    decisionText: 'Rewrite our React Native app in Flutter?',
    options: 'YES = rewrite, NO = keep React Native.',
    member: 'Member',
    saysCol: 'Says, word for word',
    voteCol: 'Vote',
    score: 'Score',
    up: 'up',
    down: 'down',
    reset: 'Reset votes',
    flip: 'Flip vote',
    votesUp: 'votes up',
    votesDown: 'votes down',
    original: 'Rewrite, but only after a two-week spike on the two worst screens.',
    yes: 'The council says rewrite.',
    no: 'The council says keep React Native.',
    tie: 'Tie, broken toward the more reversible option: keep React Native for now.',
    note: 'Example output, shortened. Real reports also quote each member’s full reply, the clashes and what would flip the vote.',
  },
  design: {
    title: 'A product site with one rule set',
    sub: 'The Quorum site is one HTML page with no framework and no CDN. Its look comes from three rules, applied everywhere, including this page.',
    shapeT: 'Shape',
    shapeD: 'Anything you can press is a full pill. Cards and panels use a 20px radius, and blocks inside a card use 14px.',
    shapeChips: ['All seven', 'Lite', 'Angel vs devil'],
    paletteT: 'Palette',
    paletteD: 'Warm off-black and warm ink, with one coffee accent and nothing else saturated. Light and dark themes share every token.',
    typeT: 'Type',
    typeD: 'Geist for text and headings, Geist Mono for commands, votes and stage directions. Both self-hosted, one variable file each.',
    installT: 'Install, detected',
    installD: 'The hero shows the one-liner for your system: curl on macOS and Linux, PowerShell on Windows. Running it again updates the skill.',
    installTabs: 'Operating system',
    unix: 'macOS / Linux',
    win: 'Windows',
    copy: 'Copy install command',
    copied: 'Copied',
  },
  board: {
    title: 'Then they got a board',
    sub: 'Under the hero, all seven wander a low-poly chess board in three.js. Hover to wave, click to chat, ask a question and all seven answer at once.',
    points: [
      'Each member moves like a chess piece that fits it, and talks like itself.',
      'Poke one three times and it gets annoyed, five times and it snaps, steams and storms off.',
      'three.js r160 is self-hosted and fetched about two screens early. A skeleton drawn to the board’s shape holds the space, so nothing shifts when it fades in.',
      'Without WebGL the council still talks, as a plain list of speech bubbles.',
    ],
    reelsLabel: 'Promo reels',
    reels: [
      { slug: 'quorum-board-reel', t: 'The board', d: '0:26', aria: 'The board: the seven council members on a 3D board' },
      { slug: 'quorum-reel', t: 'Meet the Quorum', d: '0:23', aria: 'Meet the Quorum: a 23-second intro to the skill' },
    ],
    reelNote: 'Both reels are animated HTML pages rendered to video (the board reel drives the real board code), with a recorded voiceover and English captions.',
  },
  quality: {
    title: 'Built to pass its own tests',
    sub: 'A Playwright suite runs on a desktop and a phone profile and checks the content against the skill, the interactions, the layout and the SEO.',
    items: [
      { icon: 'phosphorPackage', t: 'Self-hosted', d: 'Fonts, icons and three.js live in the repo. A test fails if the page requests anything off-site except the GitHub star count.' },
      { icon: 'phosphorGlobe', t: 'Search and sharing', d: 'Canonical, Open Graph and Twitter tags with a 1200x630 card, JSON-LD for the app, author, site and both videos, plus robots.txt and a sitemap.' },
      { icon: 'phosphorShieldCheck', t: 'Accessible', d: 'Captions on both reels, a keyboard-driven question picker, pressed states on toggles, the faded disclaimer checked at 4.5:1 in both themes, and all content shown with reduced motion.' },
      { icon: 'phosphorGauge', t: 'Lean', d: 'WebP posters load lazily, nothing big downloads until play, and looping shimmers and the marquee pause off screen.' },
    ],
    logTitle: 'Build log',
    log: [
      'A council of seven minds for Claude Code: skill, site, 3D board, reels, tests',
      'One-line installers for macOS, Linux and Windows',
      'OS-detected install line in the hero',
      'SEO, accessibility and performance pass from Lighthouse',
      'Star count rolls up from 0, skeletons for reels, board reel first',
      'Reels leave buffering to the browser’s own spinner',
    ],
  },
  outro: {
    title: 'Shipped, live, MIT',
    body: 'Quorum is plain Markdown in a Claude Code skills folder, installed in one line and updated by running it again. The site that sells it is one page, built and tested like a product.',
    work: 'View work',
  },
} as const;
