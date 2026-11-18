// Sizzle case-study copy. English only, plain const.
// Facts come from the Sizzle repo (D:\workspace-personal\mhfrough_projects\sizzle, read, never modified): README.md,
// index.html, site.css, skills/sizzle/SKILL.md, its tools/ and references/, assets/media/sizzle-reel.json (the
// trailer's cues, mix report and music credit), LICENSE (MIT) and the git log (seven commits, 15 to 22 October 2026,
// all by the owner; skill v3 on 22 October). That the Pinch reel was cut with Sizzle comes from the comment at the
// top of pinch/promo/pinch-reel.html. Live at https://mhfrough.github.io/sizzle/, source at
// https://github.com/mhfrough/sizzle. Media and screenshots: scripts/sizzle-shots.mjs.

export const LIVE_URL = 'https://mhfrough.github.io/sizzle/';
export const REPO_URL = 'https://github.com/mhfrough/sizzle';

/** The trailer: 25 s at 30 fps (750 frames), 9:16. Cue times and names from assets/media/sizzle-reel.json. */
export const REEL = {
  duration: 25,
  fps: 30,
  src: '/images/sizzle/sizzle-reel.mp4',
  poster: '/images/sizzle/sizzle-poster.webp',
};

export interface Cue {
  t: number;
  name: string;
  note: string;
  still: string;
  alt: string;
}

export const CUES: readonly Cue[] = [
  {
    t: 0.15,
    name: 'Hook',
    note: 'Nobody reads your README. Four workaround tags are struck out on the half beats and fall.',
    still: 'hook',
    alt: 'NOBODY READS YOUR README. in poster capitals, with README.md, screenshot, demo.gif and walkthrough tags struck out around it.',
  },
  {
    t: 2.95,
    name: 'Reveal',
    note: 'The drop: a bronze gate slams shut. Your agent presents SIZZLE. Your app, now showing.',
    still: 'reveal',
    alt: 'A full bronze frame: the film-frame mark, YOUR AGENT PRESENTS, SIZZLE, and "Your app, now showing." in italics.',
  },
  {
    t: 4.88,
    name: 'Collapse',
    note: 'The poster and the bronze shrink into the film-frame mark of the lockup in the brand bar.',
    still: 'collapse',
    alt: 'The bronze poster shrinking towards the top of the frame, on its way into the brand bar.',
  },
  {
    t: 5.2,
    name: 'Install',
    note: 'npx skills add mhfrough/sizzle, and the skill’s files land.',
    still: 'install',
    alt: 'Scene 01, ONE LINE TO INSTALL., over a terminal running npx skills add mhfrough/sizzle and the skill’s folders.',
  },
  {
    t: 7.45,
    name: 'Ask',
    note: '“make a promo reel for this app”. The agent reads the code.',
    still: 'ask',
    alt: 'Scene 02, THEN JUST ASK., with the prompt "make a promo reel for this app" and the agent reading README.md, index.html, styles.css and app.js.',
  },
  {
    t: 9.7,
    name: 'Script',
    note: 'This reel’s own shot list writes itself, row by row.',
    still: 'script',
    alt: 'Scene 03, IT WRITES THE SCRIPT., over the reel’s own shot list with times from Hook to CTA.',
  },
  {
    t: 11.95,
    name: 'Cut',
    note: 'The live CUES object prints; each cue drops its block on the timeline.',
    still: 'cut',
    alt: 'Scene 04, CUT ON CUE, IN HTML., with the CUES object beside a 9:16 preview and a timeline of blocks.',
  },
  {
    t: 14.2,
    name: 'Picture lock',
    note: 'This reel’s own contact sheet. Approve. PICTURE LOCK.',
    still: 'lock',
    alt: 'Scene 05, YOU APPROVE IT FIRST., a contact sheet of the reel’s stills stamped PICTURE LOCK above an Approve button.',
  },
  {
    t: 16.45,
    name: 'Mix',
    note: 'The track’s real waveform slides until the drop at 57.02 s locks onto the reveal at 2.95 s.',
    still: 'mix',
    alt: 'Scene 06, THE DROP HITS THE REVEAL., the track’s waveform with the drop at 57.02 s and the offset 54.07.',
  },
  {
    t: 18.7,
    name: 'Print',
    note: 'Frame 000 to 750 while the reel’s frames pass through the gate.',
    still: 'print',
    alt: 'Scene 07, RENDERED FRAME BY FRAME., a counter at 750 / 750 over a film strip of the reel’s frames.',
  },
  {
    t: 21.7,
    name: 'CTA',
    note: 'The gate slams again: the lockup, the install line, the address and the billing block.',
    still: 'cta',
    alt: 'The bronze end card: A SKILL FOR AI AGENTS, the Sizzle lockup, "Your app, now showing.", the install command and mhfrough.github.io/sizzle.',
  },
];

export const COPY = {
  seo: {
    title: 'Sizzle case study',
    description:
      'Sizzle is an open-source skill for AI agents that makes short promo reels for software: built as an HTML animation from the product’s real interface, approved by you, then rendered frame-exact to a 4K MP4 with music. No ffmpeg, no editing app.',
    imageAlt: 'Sizzle case study cover: "Promo reels, cut by your agent." beside the Sizzle site and its bronze trailer poster.',
  },
  hero: {
    tag: 'Case study',
    pill: 'October 2026, own open source',
    line1: 'Sizzle.',
    line2: 'Promo reels, cut by your agent.',
    lede: 'A skill I wrote for AI agents. Ask for a reel and the agent reads your code, writes a script, builds the reel as a web page from your real interface and waits for your yes. Only then does it render a frame-exact 4K video with music. Scrub the trailer it made about itself.',
    live: 'Live site',
    source: 'Source',
    newTab: '(opens in a new tab)',
    demoNote: 'One still per cue from the real 4K render; the full trailer plays further down',
  },
  meta: [
    { k: 'Role', v: 'Sole author, design and code' },
    { k: 'Released', v: 'October 2026, MIT licence' },
    { k: 'Works with', v: 'Claude Code, Codex, Cursor and more' },
    { k: 'Stack', v: 'Markdown, Node, Playwright, Python' },
  ],
  numbers: [
    { value: '2', label: 'approval gates before any 4K frame: the script, then the picture' },
    { value: '750', label: 'frames in the 25 second trailer, each stepped on a fake clock' },
    { value: '4K', label: '2160 × 3840 at 30 fps, mixed to -14 LUFS' },
    { value: '0', label: 'ffmpeg installs: PyAV encodes the picture and the sound' },
  ],
  scrubber: {
    label: 'Sizzle trailer storyboard',
    file: 'sizzle-reel.html',
    spec: '1080 × 1920 · 30 fps',
    cueOf: 'Cue',
    of: 'of',
    frame: 'Frame',
    safe: 'Safe zones',
    safeNote: 'On 9:16, text stays out of the top 10% and the bottom 20%, where the apps put their own buttons.',
    zoneTop: 'Safe zone, top 10%',
    zoneBottom: 'Safe zone, bottom 20%',
    play: 'Play',
    pause: 'Pause',
    prev: 'Previous cue',
    next: 'Next cue',
    playhead: 'Playhead',
  },
  shots: {
    title: 'The project page',
    sub: 'Dressed as a film release: soft black, one bronze accent, poster capitals over a book serif. A cutting room that recuts a reel as you type, a production schedule, and a three.js cinema that screens the trailer. Captured from the live site.',
    url: 'mhfrough.github.io/sizzle',
    mainAlt:
      'The Sizzle site: a slate reading SC 01, the headline YOUR APP, NOW SHOWING, a one-line install command with Copy, and four steps: Install, Ask, Approve and Render.',
    wide: [
      {
        src: '/images/sizzle/studio.webp',
        small: '/images/sizzle/studio-800.webp',
        alt: 'The cutting room: an editing bay with app name, hook, tagline, features, web address, accent and cut length; a 9:16 reel preview on bronze with a timeline; the shot list and the prompt to copy.',
        cap: 'The cutting room: a reel sketch that recuts as you type',
      },
      {
        src: '/images/sizzle/schedule.webp',
        small: '/images/sizzle/schedule-800.webp',
        alt: 'The production schedule on scene 05, Picture lock: a call sheet of seven scenes, two marked Gate, You, and a monitor where the agent asks "Approve it, or tell me what to change?"',
        cap: 'The schedule: seven scenes, two gates',
      },
      {
        src: '/images/sizzle/screening.webp',
        small: '/images/sizzle/screening-800.webp',
        alt: 'The screening room: THIS TRAILER WAS MADE BY SIZZLE. above a low-poly cinema with a marquee, the Sizzle poster on screen, and the trailer’s cue list beside it.',
        cap: 'The screening room: a three.js cinema for the trailer',
      },
      {
        src: '/images/sizzle/install.webp',
        small: '/images/sizzle/install-800.webp',
        alt: 'The install section: IN YOUR TERMINAL NOW., tabs for Any agent, Claude Code and Cursor, the install command with Copy, the requirements and the line to say.',
        cap: 'Install: one line for any agent',
      },
    ],
    phoneTitle: 'On a phone',
    phoneText:
      'The same page in one column. The install line sits under the headline, and the cutting room keeps its reel preview, transport and timeline.',
    phonePoints: [
      'The reel preview scrubs by drag or arrow keys, one frame at a time, and Space plays it',
      'The cinema loads only when you scroll to it; every control in it is also a plain button',
      'Fonts and three.js are self-hosted, so nothing loads from a CDN',
    ],
    phones: [
      {
        src: '/images/sizzle/phone.webp',
        alt: 'Sizzle on a phone: the slate, YOUR APP, NOW SHOWING, the install command with Copy, and How it runs, in four steps.',
        cap: 'The opening titles',
      },
      {
        src: '/images/sizzle/phone-studio.webp',
        alt: 'The cutting room on a phone: the 9:16 reel preview on the bronze Sizzle card, with play controls, a timecode and the scene timeline.',
        cap: 'The cutting room preview',
      },
    ],
    note: 'Screenshots of the public page. The cutting room there is a sketch drawn in your browser; real reels come from the skill, on your own machine.',
  },
  trailer: {
    title: 'A trailer, made by Sizzle about itself',
    sub: 'The same skill and the same steps, pointed at its own repository. 25 seconds at 9:16; this is the 720 × 1280 web copy of the 4K render. Pick a cue to jump there.',
    video: 'The Sizzle trailer, 25 seconds, 9:16, made by Sizzle',
    muted: 'Starts muted; the controls turn the sound on.',
    cuesTitle: 'Cues',
    sheetTitle: 'Contact sheet',
    sheetAlt:
      'The trailer’s contact sheet: ten 9:16 stills from the hook, the bronze reveal, the install, ask, script, cut, picture lock, mix and print scenes, and the bronze end card.',
    sheetCap: 'The key frames the agent renders and checks before it asks for picture lock',
    mixTitle: 'Mix report',
    mixSub: 'music_sync.py found the drop at 57.02 s and started the track 54.07 s in, so it lands on the reveal at 2.95 s. Then the mux, from the same run:',
    mix: `$ python -I tools/music_sync.py promo/sizzle-bgm.mp3 --cue 2.95 --length 25
track 102.8s, beat ~0.75s (~80 bpm, or double that)
  hit   57.02s  offset   54.07  pre  -14.6 dB  body   -8.9 dB  fits yes

---- mux summary ----
video     : 2160x3840, 750 frames @ 30 fps, H.264 High crf 16
duration  : 25.000 s
audio     : AAC 48 kHz stereo 192k | VO=no BGM=yes
loudness  : -14.0 LUFS integrated (BS.1770-4 K-weighted, gated)
peak      : -4.03 dBTP (4x oversampled)`,
    credit: 'Music: “Upbeat Future Bass - So Easy” by BombinSound, under the Pixabay Content License.',
    note: 'Not the only one: the Pinch reel was cut with Sizzle too, and the skill’s references walk through two finished reels, for a file-sharing app and a browser sketchbook.',
  },
  flow: {
    title: 'Nothing renders until you say yes',
    sub: 'Between the stops the agent works on its own. It asks you to pick a concept, approve the script, approve the picture and choose the music; nothing is rendered in 4K or downloaded before that. Run it here: a simulation of the nine steps in SKILL.md.',
  },
  inside: {
    title: 'Under the hood',
    sub: 'Plain files an agent can read: Markdown for the method, one JavaScript renderer, Python for sound and encoding.',
    items: [
      {
        t: 'A fake clock, frame by frame',
        s: 'render.js drives Chromium through Playwright with a faked clock, so timers and animation frames fire at exact reel times, and every CSS animation is paused and seeked to the frame before each screenshot.',
      },
      {
        t: 'Every time in one place',
        s: 'A reel page keeps all its timing in one CUES object, and elements hang off it with data-in and data-out. A retime is one edit and a re-render; a new track only needs the mix step again.',
      },
      {
        t: 'The drop on the reveal',
        s: 'music_sync.py finds a track’s tempo and its strongest hits, then scores the offset that lands each hit on your cue: a quieter build before it, a steady body after, and enough track to last.',
      },
      {
        t: 'A mix without ffmpeg',
        s: 'mux.py encodes H.264 High at crf 16 through PyAV, ducks the music under sound effects and voice, normalises to -14 LUFS with BS.1770-4 gating, and limits the true peak to -1 dBTP.',
      },
      {
        t: 'No two reels alike',
        s: 'fingerprint.py keeps a history of every reel across all projects. A direction too close to a recent reel fails, and so do rendered stills that look like an earlier reel’s.',
      },
      {
        t: 'Sound from scratch',
        s: 'synth.py makes 20 kinds of sound effect in 6 kit palettes, and music beds in 9 genres whose downbeat lands on the drop. Pure synthesis: no samples, no licence, no download.',
      },
    ],
  },
  decisions: {
    title: 'Decisions',
    sub: 'Each one keeps a reel true to the product and cheap to change.',
    items: [
      {
        t: 'A web page, not a video editor',
        s: 'A reel is an HTML page with one timeline. Agents already write HTML, it previews in any browser, and the renderer steps it frame-exact. No editing app in the loop.',
      },
      {
        t: 'The real interface, not screenshots',
        s: 'The reel links the product’s own stylesheet or drives its own renderer with invented data. Text stays sharp at 4K, everything can move, and no real names or files end up in the video.',
      },
      {
        t: 'Approval before rendering',
        s: 'Rework after a 4K render is expensive, so the agent stops for the script and again for the picture. Ask for changes and it goes back to the build, not to the start.',
      },
      {
        t: 'One plain folder, any agent',
        s: 'SKILL.md follows the open Agent Skills format: YAML front matter, then Markdown. Claude Code, Codex, Cursor, Gemini CLI and OpenCode load it as a skill; any other agent reads it as instructions.',
      },
    ],
  },
  install: {
    title: 'Install',
    sub: 'One line for any agent that reads skills, or an installer that puts it where Claude Code or Cursor looks. Then ask for a reel.',
    tabs: 'Install for',
    os: 'Operating system',
    unix: 'macOS / Linux',
    win: 'Windows',
    copy: 'Copy command',
    copied: 'Command copied',
    agents: [
      { id: 'any', label: 'Any agent', note: 'Adds it to Claude Code, Codex, Gemini CLI, OpenCode and the other agents the skills tool supports.' },
      { id: 'claude', label: 'Claude Code', note: 'Puts the skill in ~/.claude/skills/sizzle. Run it again to update.' },
      { id: 'cursor', label: 'Cursor', note: 'Puts the skill in ~/.cursor/skills/sizzle. Restart Cursor, then ask Agent for a reel or type /sizzle.' },
    ],
    sayTitle: 'Then say',
    say: 'make a promo reel for this app',
    reqTitle: 'Once per machine',
    req: 'npm i -D playwright && npx playwright install chromium\npip install -r skills/sizzle/tools/requirements.txt',
    reqNote: 'Node 18 or newer with Playwright, Python 3.10 or newer. No ffmpeg, no editing app.',
  },
  limits: {
    title: 'Where it stops',
    sub: 'From SKILL.md and the README. A tool that speaks for your product should be careful about what it puts on screen.',
    worksTitle: 'Works',
    works: [
      'Any agent that can read files, write files and run shell commands',
      'Reels at 9:16, 4:5, 1:1 or 16:9, about 6 to 60 seconds, the length set by the concept',
      'A free track or a bed made on your machine, with sound effects on the reel’s own moments',
      'Windows, macOS and Linux, with Node 18+, Playwright and Python 3.10+',
    ],
    notTitle: 'Does not, by design',
    not: [
      'Render 4K frames before you approve the script and the picture',
      'Download a track without naming the file, the host and its size, and asking first',
      'Put real names, emails, devices or tokens on screen; demo data is invented',
      'Make a claim the product cannot back: every line on screen gets a source in the claims check',
      'Repeat a recent reel: a concept, font, opening, signature or music genre from the last three fails the check',
    ],
  },
  stack: {
    title: 'The stack',
    sub: 'No build step, no ffmpeg, no editing app. The tools need Node and Python once per machine.',
    groups: [
      {
        t: 'The skill',
        why: 'The method as Markdown with its gates, plus references, a cookbook of worked techniques and a bare reel engine with no look of its own.',
        items: [
          { name: 'Markdown', icon: 'phosphorCode' },
          { name: 'Agent Skills format', icon: 'phosphorPackage' },
          { name: 'HTML and CSS', icon: 'phosphorCode' },
        ],
      },
      {
        t: 'Render',
        why: 'One Playwright script with a fake clock: any canvas size, frames at twice the CSS size, stills and a contact sheet for checking.',
        items: [
          { name: 'Node.js', logo: 'nodedotjs' },
          { name: 'JavaScript', logo: 'javascript' },
          { name: 'Playwright', icon: 'phosphorGauge' },
        ],
      },
      {
        t: 'Sound and encode',
        why: 'PyAV with its bundled libx264 for the MP4, NumPy and SciPy for analysis and synthesis, OpenCV and Pillow for stills.',
        items: [
          { name: 'Python', icon: 'phosphorCode' },
          { name: 'PyAV', icon: 'phosphorPackage' },
          { name: 'NumPy and SciPy', icon: 'phosphorChartLineUp' },
        ],
      },
      {
        t: 'The page',
        why: 'Static files on GitHub Pages with no build step. three.js, Bebas Neue and EB Garamond are vendored, so nothing loads from a CDN.',
        items: [
          { name: 'JavaScript', logo: 'javascript' },
          { name: 'three.js', icon: 'phosphorPackage' },
          { name: 'GitHub Pages', icon: 'phosphorCloudArrowUp' },
        ],
      },
    ],
  },
  cta: {
    title: 'Need an AI workflow with a person in the loop?',
    sub: 'Agent skills and tools that do the slow parts on their own and stop where a person should decide.',
    hire: 'Hire me',
    other: 'Next: Swoop',
  },
} as const;
