// Swoop case-study copy. English only, plain const.
// Facts come from the Swoop repo (D:\workspace-personal\mhfrough_projects\swoop, read, never modified): README.md,
// PLAN.md, index.html, privacy.html, store/listing.md, shared/editor/editor.js, extension/ (manifest.json,
// background.js, capture.js), desktop/src-tauri (Cargo.toml, src/lib.rs), desktop/ui/overlay.js and the git log
// (13 commits on 21 and 22 October 2026, all by the owner, tags v0.1.0 to v0.1.3). Live at
// https://mhfrough.github.io/swoop/, source at https://github.com/mhfrough/swoop, MIT licence.
// "Coming soon" items are worded as the README's download table words them. Line counts from that checkout.

export const LIVE_URL = 'https://mhfrough.github.io/swoop/';
export const REPO_URL = 'https://github.com/mhfrough/swoop';
export const RELEASES_URL = 'https://github.com/mhfrough/swoop/releases/latest';

export const COPY = {
  seo: {
    title: 'Swoop case study',
    description:
      'Swoop is a free, open-source screenshot tool: a Chrome extension that captures a whole page by scrolling and stitching, and a 1.4 MB Print Screen app for Windows built with Tauri 2, sharing one plain JavaScript editor. Nothing is uploaded.',
    imageAlt: 'Swoop case study cover: "Screenshots that stay on your computer." beside the Swoop editor with a box, numbered steps, an arrow and a blurred address.',
  },
  hero: {
    tag: 'Case study',
    pill: 'October 2026, own open source',
    line1: 'Swoop.',
    line2: 'Screenshots that stay on your computer.',
    lede: 'A full-page capture extension for Chrome and a Print Screen app for Windows, sharing one free editor: arrows, boxes, numbered steps, blur and crop. There is no Swoop server, so nothing is uploaded. Mark up the sample here; the real editor is a click away.',
    live: 'Live site',
    source: 'Source',
    newTab: '(opens in a new tab)',
    demoNote: 'Swoop’s shape model and drawing rules, rebuilt in SVG for this page',
  },
  meta: [
    { k: 'Role', v: 'Sole author, design and code' },
    { k: 'Released', v: 'October 2026, v0.1.3, MIT' },
    { k: 'Runs on', v: 'Chrome and Edge, Windows 10 and 11' },
    { k: 'Stack', v: 'JavaScript, Canvas 2D, Rust, Tauri 2' },
  ],
  numbers: [
    { value: '0', label: 'servers, accounts or share links; pictures go to your clipboard or your disk' },
    { value: '11', label: 'editor tools, each on one key, with no paid tier and no watermark' },
    { value: '1.4 MB', label: 'Windows installer, and about 30 MB of memory while it waits in the tray' },
    { value: '550 ms', label: 'between screens, because Chrome allows two captures a second' },
  ],
  shots: {
    title: 'The real thing',
    sub: 'The landing page carries the real editor on a sample order page. The desktop overlay and the extension’s editor tab run the same code. Captured from the repo with Playwright.',
    url: 'mhfrough.github.io/swoop',
    mainAlt:
      'The Swoop landing page in dark mode: the headline "Screenshots that stay on your computer.", Get it for Chrome and Get it for Windows buttons, and the editor demo with its toolbar below.',
    duo: [
      {
        src: '/images/swoop/overlay.webp',
        small: '/images/swoop/overlay-800.webp',
        alt: 'The desktop overlay over a frozen screen: a 536 by 430 selection with handles, a red box and a numbered step inside it, and the floating toolbar under the selection.',
        cap: 'Desktop: drag over the frozen screen, mark up in place',
      },
      {
        src: '/images/swoop/store-editor.webp',
        small: '',
        alt: 'The Swoop editor tab from the Chrome Web Store listing: the full toolbar with tools, colours, sizes, zoom, Copy, a PNG format menu and Save, over a sample order page with a box, an arrow, two steps and a blurred address.',
        cap: 'Chrome: the editor tab, from the store listing',
      },
    ],
    trio: [
      {
        src: '/images/swoop/editor.webp',
        small: '/images/swoop/editor-800.webp',
        alt: 'The landing page demo after markup: a red box around Tracking, steps 1 and 2, an arrow to Shipped and a pixelated delivery address.',
        cap: 'The demo is the real editor',
      },
      {
        src: '/images/swoop/chrome.webp',
        small: '/images/swoop/chrome-800.webp',
        alt: 'The Swoop for Chrome section: "The whole page, top to bottom, in one picture." with five checks and three numbered steps.',
        cap: 'Swoop for Chrome',
      },
      {
        src: '/images/swoop/site-light.webp',
        small: '/images/swoop/site-light-800.webp',
        alt: 'The landing page hero in light mode, with the orange Get it for Chrome button.',
        cap: 'Light, following the system',
      },
    ],
    phoneTitle: 'On a phone',
    phoneText:
      'The landing page in one column. The editor demo fits the width with a shorter toolbar, and the download cards stack, each saying plainly what is ready and what is not.',
    phonePoints: [
      'The desktop button points at your own system: Windows, or "coming soon" on Linux and Mac',
      'One request to another site: the GitHub star count, at most once every five minutes',
      'No analytics and no cookies on the page, the extension or the app',
    ],
    phones: [
      {
        src: '/images/swoop/phone.webp',
        alt: 'The Swoop landing page on a phone: the headline, the two buttons and the top of the editor demo.',
        cap: 'The hero on a phone',
      },
      {
        src: '/images/swoop/phone-download.webp',
        alt: 'The download cards on a phone: Chrome and Edge with Download the extension, Windows with Download for Windows, and Linux marked Coming soon.',
        cap: 'Downloads, with Linux coming soon',
      },
    ],
    note: 'The frozen screen in the overlay shot is the landing page itself, fed to desktop/ui/overlay.html through a stand-in for Tauri, the same way the repo’s own tests drive it. The sample order page and its address are made up.',
  },
  ways: {
    title: 'Two ways in, one editor',
    sub: 'A page in Chrome, or anything on the screen. Both end in the same editor and the same two exits: copy or save.',
    items: [
      {
        icon: 'chrome',
        t: 'Swoop for Chrome',
        tag: 'Manifest V3',
        keys: ['Alt', 'Shift', 'S'],
        s: 'Click the Swoop button and it scrolls the page one screen at a time, joins the parts into one tall image and opens it in a new tab. Alt+Shift+V takes only the part you can see.',
        points: [
          'Save as PNG, JPG, WebP or PDF; a long page becomes several A4 pages',
          'The last 12 captures stay in the browser',
          'Right-click the picture for Copy, Save, Save as PDF, Undo and Delete',
        ],
      },
      {
        icon: 'desktop',
        t: 'Swoop for Windows',
        tag: 'Tauri 2',
        keys: ['Print Screen'],
        s: 'Swoop waits in the tray. Press Print Screen and the screen under the pointer freezes, so menus and tooltips stay put. Drag over a part, mark it up where it is, then Enter copies and Ctrl+S saves.',
        points: [
          'Saves full size to Pictures/Swoop, named with the date and time',
          'Starts with the computer, with a switch in the tray menu',
          'Updating is running the new installer; settings are kept',
        ],
      },
    ],
  },
  stitch: {
    title: 'Scroll and stitch',
    sub: 'Chrome can only photograph what is on screen, so Swoop scrolls and takes the page one screen at a time. Real pages fight back: fixed headers, lazy images, cookie bars. Turn each fix off and capture again.',
    notes: [
      'Sticky elements are moved back to their place in the page, so they appear once',
      'When the page scrolls inside a box, the largest scrolling box is captured instead',
      'Smooth scrolling and scroll bars are switched off for the capture, then everything is put back',
      'Fade-ins are waited for, but only animations that will end within 8 seconds',
      'A page taller than 32,767 px is scaled to fit Chrome’s canvas, and the editor says so',
      'Infinite feeds stop at 60,000 CSS px',
    ],
    whyTitle: 'Why not one DevTools call',
    why: 'The DevTools protocol can capture beyond the screen in one call, but Chrome then shows a yellow "is debugging this browser" bar on every capture, the install screen warns about full access, and full-height (100vh) layouts come out wrong. Scrolling a screen at a time is slower and works on real pages.',
  },
  editor: {
    title: 'One editor, three places',
    sub: 'One plain JavaScript file with no dependencies and no build step runs in the extension, the desktop overlay and the landing page. A sync script copies it into both apps, and the tests fail if the copies drift.',
    modelTitle: 'The document, live from the hero',
    modelNote:
      'The editor keeps the picture, a list of shapes and a crop box. Every change is one step for undo and redo. These are the marks on the hero sample, in Swoop’s own field names, at the sample’s 1200 by 760 size.',
    points: [
      {
        t: 'Any height',
        s: 'Tall captures are cut into 4096 px tiles, never one giant texture, and one window-sized canvas is redrawn with the current zoom and pan.',
      },
      {
        t: 'Full resolution out',
        s: 'Saving redraws the picture and every shape on an off-screen canvas at full size. Strokes scale with the capture’s pixel ratio, so a 2x capture gets 2x lines.',
      },
      {
        t: 'PDF without a library',
        s: 'A tall capture is cut into A4-sized slices, each a JPEG, and written into a minimal PDF by one function of about 30 lines.',
      },
      {
        t: 'Two layouts',
        s: 'Full, with the toolbar on top and zoom and pan, for the extension and the demo. Overlay, where you drag a selection first and the toolbar floats beside it, for the desktop app.',
      },
    ],
    keysTitle: 'Every tool on one key',
    keys: [
      { k: 'V', t: 'Select and move' },
      { k: 'C', t: 'Crop' },
      { k: 'R', t: 'Rectangle' },
      { k: 'O', t: 'Ellipse' },
      { k: 'A', t: 'Arrow' },
      { k: 'L', t: 'Line' },
      { k: 'P', t: 'Pen' },
      { k: 'H', t: 'Highlighter' },
      { k: 'T', t: 'Text' },
      { k: 'N', t: 'Numbered step' },
      { k: 'B', t: 'Blur' },
    ],
  },
  desktop: {
    title: 'A small desktop app',
    sub: 'Tauri 2 uses the web view the system already has, so the desktop app runs the same editor and still ships as a 1.4 MB installer.',
    items: [
      {
        t: 'A frozen screen',
        s: 'The monitor under the pointer is captured first with the xcap crate, then shown full screen. You select on a still picture, like Lightshot, so menus and tooltips stay where they were.',
      },
      {
        t: 'Ready before you press',
        s: 'The overlay window is made once at start-up and kept hidden, so it appears at once. Pixels reach it as raw bytes over Tauri’s binary IPC: a 12-byte header, then RGBA, with no PNG encode between.',
      },
      {
        t: 'Print Screen is your choice',
        s: 'A switch, on by default. On, Swoop turns off Windows’ "Use the Print screen key to open screen capture" setting and, if another app holds the key, uses a low-level keyboard hook that sees it first. Off, it puts Windows’ setting back.',
      },
      {
        t: 'One copy, any trigger',
        s: 'Only one copy runs. Running swoop --capture again starts a capture in the copy that is running, which is also how Wayland users bind a shortcut, since apps there cannot listen for keys.',
      },
      {
        t: 'Clipboard from Rust',
        s: 'Copy goes through the arboard crate, with Wayland support switched on. Save asks Rust to write the PNG into Pictures/Swoop with a unique, dated name.',
      },
      {
        t: 'Built for size',
        s: 'The release profile optimises for size, with link-time optimisation, one codegen unit, abort on panic and stripped symbols. The installer is per user and needs no admin rights.',
      },
    ],
  },
  decisions: {
    title: 'Decisions',
    sub: 'Swoop was planned against two tools people already use: GoFullPage in Chrome and Lightshot on the desktop.',
    items: [
      {
        t: 'The editor is free, everywhere',
        s: 'GoFullPage keeps crop and markup in its paid tier. Swoop has no paid tier and no watermark, and the same editor runs in every place it appears.',
      },
      {
        t: 'Nowhere to upload to',
        s: 'Lightshot uploads to a public server and hands out short links, and old links could be guessed in order. Swoop has no server, no account and no links: copy or save only.',
      },
      {
        t: 'Only the tab you click',
        s: 'The extension asks for activeTab, not every site, so it can see a tab only after you click its button and the install screen shows no "read all your data" warning.',
      },
      {
        t: 'Tauri, not Electron',
        s: 'Electron would ship its own browser in every install. Tauri borrows the system web view, keeps the editor shared, and builds for Windows and Linux.',
      },
    ],
    tableTitle: 'Desktop options, from the plan',
    table: {
      cols: ['Option', 'Installer', 'Linux', 'Shares the editor'],
      rows: [
        ['Electron', '80 to 100 MB', 'Yes', 'Yes'],
        ['Qt / C++ (Flameshot)', '15 to 30 MB with Qt', 'Yes', 'No'],
        ['.NET WinForms', 'Under 1 MB', 'No', 'No'],
        ['Tauri 2 (Rust and the system web view)', '3 to 6 MB planned, 1.4 MB shipped', 'Yes', 'Yes'],
      ],
    },
  },
  privacy: {
    title: 'Private by design',
    sub: 'Five permissions, each with one job. The extension and the app make no network requests at all.',
    perms: [
      { p: 'activeTab', s: 'Capture the tab you clicked Swoop on, and only that tab.' },
      { p: 'scripting', s: 'Scroll that tab during the capture and put it back the way it was.' },
      { p: 'contextMenus', s: 'Capture the whole page or the visible part from the button’s right-click menu.' },
      { p: 'storage', s: 'Keep your capture settings, such as whether to scroll the page first.' },
      { p: 'unlimitedStorage', s: 'Keep your recent captures in the browser; a long page is a large image.' },
    ],
    points: [
      { icon: 'lock', t: 'No account', s: 'Nothing to sign up for.' },
      { icon: 'link', t: 'No links', s: 'Copy and save only.' },
      { icon: 'eye', t: 'No tracking', s: 'No analytics in the extension, the app or the page.' },
      { icon: 'code', t: 'Open source', s: 'MIT licence, every line on GitHub.' },
    ],
  },
  limits: {
    title: 'Status, stated plainly',
    sub: 'From the README’s download table and its "Not yet" list.',
    worksTitle: 'Ready',
    works: [
      'Swoop for Chrome, in Chrome and in Edge, as a zip to load unpacked',
      'Swoop for Windows 10 and 11, 64-bit, installed per user without admin rights',
      'PNG, JPG, WebP and PDF, or copy to the clipboard',
      'Releases built by GitHub Actions on every version tag, with Playwright tests on every push',
    ],
    notTitle: 'Coming soon, or not yet',
    not: [
      'Linux: coming soon, as .deb for Debian and Ubuntu, .rpm for Fedora, and an AppImage',
      'Mac: coming soon; until then, Swoop for Chrome works on a Mac',
      'The Chrome Web Store listing is on its way; the installer is not code-signed yet, so SmartScreen may warn once',
      'Selecting across several monitors, a timer and window capture',
      'Capturing one element or a selected area in the extension, and pages that scroll sideways',
      'Firefox and the Edge Add-ons store',
    ],
  },
  stack: {
    title: 'The stack',
    sub: 'Plain JavaScript where the browser is, Rust where the operating system is.',
    files: [
      { f: 'shared/editor/editor.js', s: 'The editor, used by everything', n: '1,420 lines' },
      { f: 'extension/background.js', s: 'Runs the capture, stitches the screens', n: '217 lines' },
      { f: 'extension/capture.js', s: 'Prepares the page and puts it back', n: '216 lines' },
      { f: 'desktop/src-tauri/src/lib.rs', s: 'Tray, Print Screen, capture, clipboard, save', n: '751 lines' },
      { f: 'desktop/ui/overlay.js', s: 'Hands the frozen screen to the editor', n: '77 lines' },
    ],
    groups: [
      {
        t: 'Editor and page',
        why: 'Plain JavaScript and Canvas 2D with no framework and no build step. Geist and Geist Mono, self-hosted.',
        items: [
          { name: 'JavaScript', logo: 'javascript' },
          { name: 'Canvas 2D', icon: 'phosphorCode' },
          { name: 'PDF writer, no library', icon: 'phosphorFilePdf' },
        ],
      },
      {
        t: 'Chrome extension',
        why: 'Manifest V3 with a service worker, captureVisibleTab and the extension’s own IndexedDB.',
        items: [
          { name: 'Manifest V3', icon: 'phosphorPlugs' },
          { name: 'activeTab', icon: 'phosphorShieldCheck' },
          { name: 'IndexedDB', icon: 'phosphorPackage' },
        ],
      },
      {
        t: 'Desktop and release',
        why: 'Rust with Tauri 2, xcap for capture and arboard for the clipboard. GitHub Actions builds every download.',
        items: [
          { name: 'Rust', icon: 'phosphorCode' },
          { name: 'Tauri 2', icon: 'phosphorPackage' },
          { name: 'Playwright', icon: 'phosphorShieldCheck' },
          { name: 'GitHub Actions', icon: 'phosphorCloudArrowUp' },
        ],
      },
    ],
  },
  cta: {
    title: 'Need a tool that respects its users?',
    sub: 'Extensions, desktop apps and web tools that do one job well, keep data local and are honest about their limits.',
    hire: 'Hire me',
    other: 'Next: Flick',
  },
} as const;
