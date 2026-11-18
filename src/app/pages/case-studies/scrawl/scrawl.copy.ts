// Scrawl case-study copy. English only, plain const.
// Facts come from the Scrawl repo (D:\workspace-personal\mhfrough_projects\scrawl, read, never modified): README.md,
// index.html, styles.css, scene.js, app.js and the git log (four commits on 14 October 2026, all by the owner).
// Live at https://mhfrough.github.io/scrawl/, source at https://github.com/mhfrough/scrawl, MIT licence.
// Line counts were taken from that checkout on 14 October 2026.

export const COPY = {
  seo: {
    title: 'Scrawl case study',
    description:
      'Scrawl is a sketchbook in the browser: felt-tip diagrams on dotted paper, risograph-style fills, a pen and a highlighter, autosave on your own device, and no dependencies or build step.',
    imageAlt: 'Scrawl case study cover: "Felt-tip diagrams on dotted paper." beside the app with a hand-drawn onboarding flow.',
  },
  hero: {
    tag: 'Case study',
    pill: 'October 2026, open source',
    line1: 'Scrawl.',
    line2: 'Felt-tip diagrams on dotted paper.',
    lede: 'A sketchbook I wrote for the browser in plain JavaScript: boxes, circles and arrows drawn as single marker strokes, fills printed like a risograph, and every page saved on your own device. Draw on the page here; the real one is a click away.',
    live: 'Live site',
    source: 'Source',
    newTab: '(opens in a new tab)',
    demoNote: 'Scrawl’s own marker maths, running in this page',
  },
  meta: [
    { k: 'Role', v: 'Sole author, design and code' },
    { k: 'Released', v: 'October 2026, MIT licence' },
    { k: 'Runs on', v: 'Any static host, here GitHub Pages' },
    { k: 'Stack', v: 'JavaScript, Canvas 2D, SVG, no build' },
  ],
  numbers: [
    { value: '0', label: 'dependencies, and no build step to run' },
    { value: '12', label: 'tools, each on one key, from box to eraser' },
    { value: '3', label: 'print fills: Offset, Solid and Dots' },
    { value: '2', label: 'renderers, canvas and SVG, fed by one geometry builder' },
  ],
  shots: {
    title: 'The real sketchbook',
    sub: 'A rail of markers on the left, the drawing name and history on top, Export in highlighter yellow. Everything else floats over the paper only when you need it.',
    url: 'mhfrough.github.io/scrawl',
    mainAlt:
      'Scrawl on dark dotted paper: a hand-drawn onboarding flow with a yellow box, a dotted blue diamond, a pink box, a green circle, a phone wireframe, a taped reference picture and a highlighted title.',
    details: [
      {
        src: '/images/scrawl/style-dark.webp',
        alt: 'A diamond selected in Scrawl with the style popover open: thickness, line, hand (Steady, Loose, Wild) and corners.',
        cap: 'Style: thickness, line, hand and corners',
      },
      {
        src: '/images/scrawl/export-dark.webp',
        alt: 'Scrawl export dialog with a preview of the drawing, Paper and Dark checkboxes, a 1x, 2x, 3x size switch and Download PNG, Download SVG and Copy PNG buttons.',
        cap: 'Export: PNG at 1x to 3x, SVG, or copy',
      },
      {
        src: '/images/scrawl/drawings-dark.webp',
        alt: 'Scrawl My drawings dialog listing four drawings with thumbnails, names, ages and item counts.',
        cap: 'My drawings: every page, with thumbnails',
      },
    ],
    light: {
      src: '/images/scrawl/board-light.webp',
      alt: 'The same onboarding flow on Scrawl’s light paper: black, blue, pink, green, orange and red marker on warm off-white.',
      cap: 'Light paper, the colours as printed',
    },
    phones: [
      {
        src: '/images/scrawl/phone-dark.webp',
        alt: 'Scrawl on a phone in dark mode: a vertical sign-up flow, with the tools in a bar along the bottom.',
        cap: 'Phone, dark',
      },
      {
        src: '/images/scrawl/phone-light.webp',
        alt: 'Scrawl on a phone in light mode with the same sign-up flow and the bottom tool bar.',
        cap: 'Phone, light',
      },
    ],
    note: 'Screenshots of the public app, served from the repo as it is, with sample drawings written into its own storage.',
  },
  marker: {
    title: 'One stroke per edge',
    sub: 'Scrawl does not trace a shape and then roughen it. Each edge is one bowed marker stroke, and the seed stored on the shape decides every wobble.',
    steps: [
      {
        t: 'A bowed stroke, not a straight line',
        s: 'Each side is one cubic curve: both ends nudged a little and the middle bowed off the line, further on longer sides and wilder hands, up to a cap.',
      },
      {
        t: 'Corners that cross',
        s: 'Box sides run past each other at the corners, like a quick architect’s sketch. Diamonds overshoot less than half as much.',
      },
      {
        t: 'Loops that carry on',
        s: 'Circles and rounded boxes are drawn in one go through jittered points, and the pen keeps going one or two points past where it started.',
      },
      {
        t: 'One seed, the same wobble',
        s: 'Every element carries a seed for a small random generator, so it looks the same on every redraw, in every export and on every device.',
      },
    ],
    hands: ['Steady', 'Loose', 'Wild'],
    reseed: 'New seeds',
    specLabel: 'The same four shapes drawn with each hand',
    code: `// scene.js: one felt-tip stroke, with optional overshoot
function markerLine(p, x1, y1, x2, y2, rough, rand, over = 0) {
  const len = Math.hypot(x2 - x1, y2 - y1) || 1
  const j = () => (rand() - 0.5) * 2 * Math.min(1.2 * rough, len / 12)
  const bow = (rand() - 0.5) * Math.min(len / 24, 7) * rough
  // ...start and end nudged by j(), the middle bowed by bow
  p.C(cx1 + nx * bow, cy1 + ny * bow,
      cx2 + nx * bow * 0.8, cy2 + ny * bow * 0.8,
      x2 + j(), y2 + j())
}`,
  },
  fills: {
    title: 'Fills that look printed',
    sub: 'Three fill styles borrowed from print. Change the pen and the numbers move with it: they are the ones scene.js uses.',
    notes: [
      'Offset prints the tint 4 px plus one and a half pen widths off the outline, so it peeks out like a risograph out of register.',
      'Solid uses the same outline with no shift. Dots lays a halftone screen in rows 0.87 steps apart, every other row offset by half a step.',
      'The step grows with large shapes, so a big box never turns into thousands of dots.',
    ],
  },
  tools: {
    title: 'The rest of the pencil case',
    sub: 'Twelve tools, each on one key. The ones that make it feel like a sketchbook rather than a diagram editor:',
    items: [
      {
        icon: 'phosphorPencilSimple',
        t: 'Pen',
        s: 'A filled outline, not a stroked line: it swells where you draw slowly and tapers over the first and last five points.',
      },
      {
        icon: 'phosphorHighlighter',
        t: 'Highlighter',
        s: 'A broad, square-ended stroke at 38% that multiplies on light paper and screens on dark, so it tints what is under it.',
      },
      {
        icon: 'phosphorTextAa',
        t: 'Lettering',
        s: 'Hand (Shantell Sans) or print (Bricolage Grotesque) in four sizes. Double-click anywhere to write, or on a shape to label it.',
      },
      {
        icon: 'phosphorImage',
        t: 'Taped pictures',
        s: 'Drop, paste or pick a photo and a strip of torn masking tape holds it on, with seeded ragged edges and a slight tilt.',
      },
      {
        icon: 'phosphorLock',
        t: 'Keep the tool',
        s: 'The tool you pick stays on, so you can draw line after line. Press Q to go back to Select after each shape instead.',
      },
      {
        icon: 'phosphorDeviceMobile',
        t: 'Phones',
        s: 'At 760 px and below the tools move to a bar along the bottom, and two fingers pinch to zoom and move around the page.',
      },
    ],
  },
  dark: {
    title: 'Dark paper, same drawing',
    sub: 'A black marker would vanish on dark paper. Scrawl keeps each colour’s hue and saturation and flips its lightness, so a drawing reads the same either way.',
    notes: [
      'One function converts a colour once and caches it; the editor, the swatches, PNG and SVG export all call it.',
      'Exports can be light or dark whatever the page shows, and the drawing’s saved colours never change.',
    ],
  },
  saving: {
    title: 'Local first, no account',
    sub: 'There is no server. Every page lives in the browser that drew it, and a file is one click away when it needs to travel.',
    tiers: [
      {
        t: 'Autosave',
        tag: 'localStorage',
        items: [
          'Saves 400 ms after the last change, and again when the tab is hidden or closed',
          'One key per drawing, plus an index, the open page and your preferences',
          'A full browser shows “Not saved: storage full” and points to Save to file',
        ],
      },
      {
        t: 'Pictures',
        tag: 'IndexedDB',
        items: [
          'Photos go to IndexedDB, which has room for them; drawings keep only an id',
          'Anything over 2400 px or 3 MB is redrawn at 2400 px at most and stored as WebP, or JPEG where WebP is missing',
          'Pictures no drawing uses any more are cleared a few seconds after start',
        ],
      },
      {
        t: 'Files',
        tag: '.scrawl',
        items: [
          'Plain JSON: type, version, name, elements, and pictures as data URLs',
          'Opening one checks every field: known types, hex colours, clamped numbers, image data only',
          'Drop a .scrawl file anywhere on the page to open it',
        ],
      },
      {
        t: 'Exports',
        tag: 'PNG · SVG',
        items: [
          'PNG at 1x, 2x or 3x, or straight to the clipboard',
          'SVG from the same paths, with the fonts linked so it renders anywhere',
          'With or without paper, light or dark, all or just the selection',
        ],
      },
    ],
    fileTitle: 'Your sketch from the top of this page, as a .scrawl file',
    fileNote: 'Updates as you draw. Labels become text elements, as they are in Scrawl.',
    sizeOf: 'of the roughly 5 MB a site gets in localStorage',
  },
  stack: {
    title: 'No dependencies, no build',
    sub: 'Four files you can read top to bottom, served as they are. Any static server runs it.',
    files: [
      { f: 'index.html', s: 'Rail, title, context bar and dialogs', n: '398 lines' },
      { f: 'styles.css', s: 'All styling, light and dark', n: '428 lines' },
      { f: 'scene.js', s: 'Element model, marker look, hit testing, canvas and SVG renderers, validation', n: '609 lines' },
      { f: 'app.js', s: 'Tools, selection, history, autosave, drawings list, export, shortcuts', n: '1,742 lines' },
      { f: 'icon.svg', s: 'The favicon: a yellow scribble on ink', n: '1 path' },
      { f: 'assets/fonts', s: 'Bricolage Grotesque and Shantell Sans, SIL OFL 1.1', n: '2 fonts' },
    ],
    groups: [
      {
        t: 'Runtime',
        why: 'The browser is the framework: no bundler, no packages, nothing to update.',
        items: [
          { name: 'JavaScript', logo: 'javascript' },
          { name: 'Canvas 2D', icon: 'phosphorCode' },
          { name: 'Path2D', icon: 'phosphorCode' },
          { name: 'SVG', icon: 'phosphorCode' },
        ],
      },
      {
        t: 'Storage',
        why: 'Drawings, pictures and preferences stay on the device that made them.',
        items: [
          { name: 'localStorage', icon: 'phosphorLock' },
          { name: 'IndexedDB', icon: 'phosphorPackage' },
          { name: 'JSON files', icon: 'phosphorCode' },
          { name: 'Clipboard API', icon: 'phosphorShareNetwork' },
        ],
      },
      {
        t: 'Shipping',
        why: 'One folder on GitHub Pages. The only network call is the star count, cached for five minutes.',
        items: [
          { name: 'GitHub Pages', icon: 'phosphorCloudArrowUp' },
          { name: 'Self-hosted fonts', icon: 'phosphorPackage' },
          { name: 'MIT licence', icon: 'phosphorShieldCheck' },
        ],
      },
    ],
  },
  engineering: {
    title: 'Small things that keep it quick',
    sub: 'Plain JavaScript still needs care once a page holds a few hundred marker strokes.',
    items: [
      { t: 'Geometry cached per version', s: 'Each element’s paths are built once and kept until the element changes; a second cache holds the Path2D objects.' },
      { t: 'Only what is on screen', s: 'The editor skips anything outside the view, and draws the dotted paper in screen space so it stays crisp at any zoom.' },
      { t: 'Undo as snapshots', s: 'Up to 150 steps, each a snapshot of the page, committed at the end of a gesture rather than on every pointer move.' },
      { t: 'Other tabs stay in step', s: 'A storage event reloads the open drawing when another tab saves it, unless you are mid-drag or typing.' },
      { t: 'Validation at every door', s: 'Storage, files and the clipboard all pass through one sanitiser: unknown types are dropped, numbers clamped, text and points capped.' },
      { t: 'Thumbnails from the SVG renderer', s: 'My drawings shows each page as an SVG data URL from the export code, so thumbnails cost no extra drawing code.' },
    ],
  },
  limits: {
    title: 'What it does, and its limits',
    sub: 'Straight from the README. Local first is the point, and it comes with trade-offs.',
    worksTitle: 'Works today',
    works: [
      'Boxes, circles, diamonds, arrows and lines in three hands',
      'Offset, Solid and Dots fills; pen, highlighter, text and taped pictures',
      'Select, multi-select, move, resize, Alt-drag to copy, layer order, snap to the dots',
      'Autosave, any number of pages, .scrawl files, PNG and SVG export',
      'Dotted, ruled or plain paper; light, dark or automatic theme; phones',
    ],
    limitsTitle: 'Limits',
    limits: [
      'Drawings live in this browser only. Clearing site data deletes them, so save to a file to keep one.',
      'localStorage holds roughly 5 MB per site: thousands of shapes, not unlimited. Scrawl warns when it is full.',
      'Pictures sit in IndexedDB on this device. Saving to a file embeds them, so files with photos can be large.',
    ],
  },
  cta: {
    title: 'Want a tool people enjoy drawing in?',
    sub: 'Editors, canvases and small tools with the keyboard, export and saving work done properly.',
    hire: 'Hire me',
    other: 'Next: Pinch',
  },
} as const;
