// Pinch case-study copy. English only, plain const.
// Facts come from the Pinch source (D:\workspace-personal\mhfrough_projects\pinch: README.md, DESIGN.md, index.html,
// site.js, engine.js, app.js, codecs/README.md, ai/README.md, promo/pinch-reel-script.md), read, never modified, and
// from its git history (seven commits from 16 to 22 October 2026, all by the owner). Live at
// https://mhfrough.github.io/pinch/, source at https://github.com/mhfrough/pinch (MIT).
// Screenshots: scripts/pinch-shots.mjs (the live site in its dark theme, opened on Pinch's own sample photos).

export const LIVE_URL = 'https://mhfrough.github.io/pinch/';
export const REPO_URL = 'https://github.com/mhfrough/pinch';

export const COPY = {
  seo: {
    title: 'Pinch case study',
    description:
      'Pinch compresses, converts and upscales images in the browser with nothing uploaded: MozJPEG, libwebp, libavif and OxiPNG compiled to WebAssembly in a pool of Web Workers, a target-size search, and Real-ESRGAN upscaling on WebGPU or WebAssembly.',
    imageAlt: 'Pinch case study cover: "Lighter images, never uploaded." beside the Pinch studio with four sample photos made 35% smaller.',
  },
  hero: {
    tag: 'Case study',
    pill: 'October 2026, own open source',
    line1: 'Pinch.',
    line2: 'Lighter images, never uploaded.',
    lede: 'An image studio that runs in the browser tab: compress, convert between seven formats, hit a file size, upscale with AI. Every change shows the new size before you save, and no picture ever leaves the device. Try the compare, then the real thing.',
    live: 'Live site',
    source: 'Source',
    newTab: '(opens in a new tab)',
    demoNote: 'Written for this page; your browser encodes the right half, nothing is uploaded',
  },
  meta: [
    { k: 'Role', v: 'Sole author, design and code' },
    { k: 'Released', v: 'October 2026, MIT licence' },
    { k: 'Runs on', v: 'Static files, no backend' },
    { k: 'Stack', v: 'Plain JavaScript, WebAssembly, Web Workers, ONNX Runtime Web' },
  ],
  numbers: [
    { value: '0', label: 'bytes of your images sent anywhere; the page counts its own requests to prove it' },
    { value: '7', label: 'formats it saves: JPG, PNG, WebP, AVIF, GIF, BMP and ICO' },
    { value: '4', label: 'Web Workers at most, encoding side by side with shared WebAssembly modules' },
    { value: '2.4 MB', label: 'Real-ESRGAN model, converted from the official checkpoint for the browser' },
  ],
  shots: {
    title: 'The real app',
    sub: 'The first screen is the tool. Add images and it becomes a studio: files on the left, a before and after stage in the middle, settings and the live result on the right. Captured from the live site on its own sample photos.',
    url: 'mhfrough.github.io/pinch',
    mainAlt:
      'The Pinch studio with four sample photos: a file list showing each one 24% to 48% smaller as WebP, the harbour photo on a compare stage with a blue divider, the Web preset selected, and a bottom bar reading 4 files, 1.61 MB to 1.05 MB, 35% smaller, with Save all.',
    wide: [
      {
        src: '/images/pinch/target.webp',
        small: '/images/pinch/target-800.webp',
        alt: 'Target size on: every file is now about 96 KB. The hills photo reads 96 KB, 83% smaller, with the note "Quality 35 fits under 98 KB. Made smaller (1734 x 1156 px) to fit under 98 KB."',
        cap: 'Keep each file under 100 KB',
      },
      {
        src: '/images/pinch/app.webp',
        small: '/images/pinch/app-800.webp',
        alt: 'Pinch before any image is added: "Make images lighter. Keep them private.", a Choose images button, five preset chips, and a compare of the valley sample, 353 KB as the original against 198 KB as WebP.',
        cap: 'The first screen, already working',
      },
      {
        src: '/images/pinch/features.webp',
        small: '/images/pinch/features-800.webp',
        alt: 'The features section: a compare tile of the lake photo at 100% zoom, 292 KB against 151 KB, beside a quality slider card and a Save as card showing the harbour photo 54% smaller as AVIF.',
        cap: 'Features, with numbers measured on the samples',
      },
      {
        src: '/images/pinch/privacy.webp',
        small: '/images/pinch/privacy-800.webp',
        alt: 'The privacy section after four images: "Your images stay on this device. You can check." beside a counter of network requests since the first image, reading 0, with 0 sent to other sites and 4 images added.',
        cap: 'Zero requests after four images',
      },
    ],
    phoneTitle: 'On a phone',
    phoneText:
      'The same studio in one column. The stage takes the screen, files become a strip of thumbnails, and settings rise in a sheet over the result card.',
    phonePoints: [
      'Choose images, or tap a sample to see it work first',
      'Drag the blue divider; pinch to zoom, hold the eye to see the original',
      'Save one file, or Save all as one ZIP',
    ],
    phones: [
      {
        src: '/images/pinch/phone.webp',
        alt: 'Pinch on a phone before any image: the headline, a wide Choose images button, preset chips, the valley compare at 353 KB against 198 KB, and four sample photos.',
        cap: 'The first screen',
      },
      {
        src: '/images/pinch/phone-studio.webp',
        alt: 'Pinch on a phone with the harbour sample open: the compare stage, a thumbnail strip with the file at 33% smaller, and a result card reading 288 KB, WebP at quality 75, with Save all.',
        cap: 'One photo in the studio',
      },
    ],
    note: 'Every picture in these shots is one of the four Unsplash samples that ship with Pinch, processed by Pinch in the browser that took the shot. Nothing was uploaded; the counter in the privacy shot says so.',
  },
  compress: {
    title: 'Measured, not guessed',
    sub: 'Pinch shows the exact size of every file before you save. These are its own numbers on its own samples, from the engine in Chromium, the same ones on its features section.',
  },
  target: {
    title: 'Hit a file size',
    sub: 'For forms that say “under 100 KB”. Pinch finds the highest quality that fits, and makes the picture smaller only when quality alone cannot get there. This runs the same search live; watch it narrow down.',
    steps: [
      { t: 'Try your quality', s: 'One encode at the chosen quality. If it already fits, that is the answer and nothing else runs.' },
      { t: 'Halve the range', s: 'Between quality 30 and one below yours, at most seven tries (five for AVIF), keeping the highest that fits.' },
      { t: 'Then shrink', s: 'If quality 30 is still too big, the picture gets smaller in 0.85 x 0.85 steps, as many as the size gap suggests, and the search runs again.' },
      { t: 'AVIF finishes slow', s: 'AVIF searches with a fast encoder setting, then encodes once more at full effort at the quality it found.' },
    ],
  },
  upscale: {
    title: 'Upscale, with AI on your device',
    sub: 'Smooth and Sharp resample, Pixel keeps hard edges for pixel art, and AI (detail) runs Real-ESRGAN in the tab. Drag the divider over Pinch’s own output.',
    points: [
      { t: 'WebGPU first, then WebAssembly', s: 'A WebGPU device has to be created, not just found; if it fails, the WebAssembly build runs instead. Threads would need COOP and COEP headers, which GitHub Pages cannot send, so it runs on one.' },
      { t: 'Tiles with real context', s: 'The image is cut into equal tiles, at most 256 px on WebGPU and 192 on WebAssembly, each read with 12 to 16 px of its neighbours, so memory stays bounded and there are no seams.' },
      { t: '2x from the 4x model', s: 'For 2x the 4x network runs and each padded tile is reduced with Lanczos-3 before cropping, so the filter sees real pixels at the edges.' },
      { t: 'Transparency kept', s: 'Alpha is resized on its own and put back. Hidden pixels first take the colour of their visible neighbours, so no stray colour bleeds into edges.' },
    ],
    timesTitle: 'One 128 px tile at 4x, measured on a laptop GPU',
    times: [
      { k: 'WebGPU', v: 0.57 },
      { k: 'WebAssembly, 1 thread', v: 3.7 },
      { k: 'WebGL, packed', v: 32.5 },
      { k: 'WebGL, unpacked', v: 69 },
    ],
    timesNote: 'Edge on Intel UHD Graphics 620, warm. WebGL ran the network only after three changes and was about 9 times slower than WebAssembly, so it was dropped, with its 472 KB bundle and the 4.9 MB float32 model it needed.',
  },
  presets: {
    title: 'Five presets',
    sub: 'One click sets format, size and quality for where the picture is going. No other tool in the research for Pinch offered them.',
    items: [
      { icon: 'phosphorGlobe', t: 'Web', s: 'WebP at quality 75, fitted inside 2560 px. On the four samples: 24% to 48% smaller.', tag: 'webp q75' },
      { icon: 'phosphorEnvelope', t: 'Email', s: 'JPG kept under 1 MB, ready to attach. Uses the same target search.', tag: '< 1 MB' },
      { icon: 'phosphorUsersThree', t: 'Social', s: 'JPG at quality 82, fitted inside 1080 × 1350.', tag: 'jpg q82' },
      { icon: 'phosphorAppWindow', t: 'Favicon', s: 'An ICO icon for websites, with small sizes from 16 to 256 px inside.', tag: 'ico' },
      { icon: 'phosphorDiamond', t: 'Lossless', s: 'PNG with every pixel kept, squeezed further by OxiPNG.', tag: 'png' },
    ],
  },
  inside: {
    title: 'Engineering details',
    sub: 'Small things that keep a heavy tool calm inside one browser tab.',
    items: [
      {
        t: 'A pool of workers',
        s: 'Up to four Web Workers, one fewer than the CPU cores. Compiled WebAssembly modules are shared between them, and the worker starts from a Blob URL of its own source, so restarts work offline.',
      },
      {
        t: 'Warm when idle',
        s: 'Ten seconds after load, when the page is idle, every codec is fetched and compiled in the background, the 3.4 MB AVIF encoder last, and only the small ones on Save-Data. After that Pinch works with Wi-Fi off.',
      },
      {
        t: 'The original is kept',
        s: 'If a file would come out larger in its own format, Pinch hands back the original and says so, with metadata stripped losslessly unless that would lose the photo’s rotation. Re-encoded files never carry EXIF or GPS.',
      },
      {
        t: 'Auto picks a format',
        s: 'A quick look at the pixels decides: 32 colours or fewer, or many flat neighbours, is a graphic and goes to PNG; anything else is a photo and goes to WebP, which keeps transparency.',
      },
      {
        t: 'HEIC only when needed',
        s: 'libheif is LGPL, so it lives in its own 3 MB file, loaded only when an iPhone photo is opened and the browser cannot decode it, and replaceable with any compatible build.',
      },
      {
        t: 'Bounded memory',
        s: 'Output is capped at 12,000 px on the long side and 40 megapixels, with a note saying so. AI output stops at 16.8 megapixels, checked before any work, and the message says what size to try instead.',
      },
    ],
  },
  decisions: {
    title: 'Decisions',
    sub: 'Each one follows from the promise in the title: the work happens on your device, and you can check it.',
    items: [
      {
        t: 'Ship the encoders',
        s: 'WebP, AVIF, JPG and PNG are written by MozJPEG, libwebp, libavif and OxiPNG compiled to WebAssembly, not by the browser, so the same settings give the same file in every browser.',
      },
      {
        t: 'Make privacy checkable',
        s: 'Saying “nothing is uploaded” is cheap. The page counts every network request made after the first image, and names the two that can happen: the AI model from this site, and the GitHub star count.',
      },
      {
        t: 'Convert the model ourselves',
        s: 'No third-party ONNX copy: the official Real-ESRGAN checkpoint is read with a restricted unpickler and written as ONNX with float16 weights, half the size, checked against the PyTorch network.',
      },
      {
        t: 'No CDN, no framework',
        s: 'Every font, codec and script is served from the repository. Plain HTML, CSS and JavaScript, with esbuild only to build the codec worker; the page itself has no build step.',
      },
    ],
  },
  limits: {
    title: 'Limits, stated plainly',
    sub: 'From the README and the questions on the page, because a privacy tool should be precise about what it does.',
    worksTitle: 'Works',
    works: [
      'Current Chrome, Edge, Firefox and Safari, on computers and phones',
      'Opens JPG, PNG, WebP, AVIF, GIF, BMP, ICO, SVG and iPhone HEIC',
      'Offline once loaded: compressing, converting and resizing need no connection',
      'Batch with one set of settings, per-file changes and one ZIP',
      'Keyboard shortcuts for every common step, listed on ?',
    ],
    notTitle: 'Does not, by design',
    not: [
      'Very large pictures, above about 40 megapixels, are not handled at full size, so the tab does not run out of memory',
      'GIF opens its first frame only; SVG and HEIC open but are not saved back',
      'AI detail is a good guess, not recovered data: not for faces in evidence, small text or number plates',
      'AI without WebGPU is slow: a 1 MP input at 4x takes minutes on WebAssembly',
      'The first AI run downloads the 2.4 MB model and its runtime, then both stay in the browser’s cache',
    ],
  },
  stack: {
    title: 'The stack',
    sub: 'Static files you can host anywhere. Codecs are built once by a script; the page has no build step.',
    groups: [
      {
        t: 'Page',
        why: 'Plain HTML, CSS and JavaScript, one set of tokens for light and dark, self-hosted Geist.',
        items: [
          { name: 'JavaScript', logo: 'javascript' },
          { name: 'HTML and CSS', icon: 'phosphorCode' },
          { name: 'Geist', icon: 'phosphorCode' },
        ],
      },
      {
        t: 'Codecs',
        why: 'Open source encoders compiled to WebAssembly through jSquash, each in a Web Worker.',
        items: [
          { name: 'WebAssembly', icon: 'phosphorCode' },
          { name: 'MozJPEG', icon: 'phosphorPackage' },
          { name: 'libwebp', icon: 'phosphorPackage' },
          { name: 'libavif', icon: 'phosphorPackage' },
          { name: 'OxiPNG', icon: 'phosphorPackage' },
          { name: 'libheif', icon: 'phosphorPackage' },
          { name: 'esbuild', icon: 'phosphorPlugs' },
        ],
      },
      {
        t: 'AI',
        why: 'Real-ESRGAN realesr-general-x4v3 on ONNX Runtime Web 1.30, cached with the Cache API.',
        items: [
          { name: 'ONNX Runtime Web', icon: 'phosphorGauge' },
          { name: 'WebGPU', icon: 'phosphorGauge' },
          { name: 'Real-ESRGAN', icon: 'phosphorPackage' },
          { name: 'Cache API', icon: 'phosphorShieldCheck' },
        ],
      },
    ],
  },
  cta: {
    title: 'Need heavy work done without a server?',
    sub: 'WebAssembly, workers and on-device AI, built so the page stays smooth and the data stays put.',
    hire: 'Hire me',
    other: 'Next: Sizzle',
  },
} as const;
