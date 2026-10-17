// Flick case-study copy. English only, plain const.
// Facts come from the Flick source (D:\workspace-personal\mhfrough_projects\flick: README.md, index.html, net.js,
// app.js, styles.css), read, never modified, and from its git history (four commits on 14 October 2026, all by the
// owner). Live at https://mhfrough.github.io/flick/, source at https://github.com/mhfrough/flick (MIT).
// Screenshots: scripts/flick-shots.mjs (two real browsers in a throwaway room on a documentation-range address).

export const LIVE_URL = 'https://mhfrough.github.io/flick/';
export const REPO_URL = 'https://github.com/mhfrough/flick';

export const COPY = {
  seo: {
    title: 'Flick case study',
    description:
      'Flick shares files and text between nearby devices from the browser, with no server of its own: AES-GCM sealed signalling over three public MQTT brokers through a tiny built-in MQTT client, then direct WebRTC data channels with 64 KB chunks and back-pressure.',
    imageAlt: 'Flick case study cover: "Files to the next screen, with no server." beside the Flick app with a phone connected.',
  },
  hero: {
    tag: 'Case study',
    pill: 'October 2026, own open source',
    line1: 'Flick.',
    line2: 'Nearby sharing, no server.',
    lede: 'Open Flick on two devices on the same Wi-Fi and they find each other. Share with everyone at once or send to one device; the bytes go browser to browser. No sign-up, no codes, nothing uploaded. Try the simulation, then the real thing.',
    live: 'Live site',
    source: 'Source',
    newTab: '(opens in a new tab)',
    demoNote: 'A simulation written for this page; nothing leaves your browser',
  },
  meta: [
    { k: 'Role', v: 'Sole author, design and code' },
    { k: 'Released', v: 'October 2026, MIT licence' },
    { k: 'Runs on', v: 'Static files, no backend' },
    { k: 'Stack', v: 'Plain JavaScript, WebRTC, MQTT, Web Crypto' },
  ],
  numbers: [
    { value: '0', label: 'servers of its own: no backend, no database, no build step' },
    { value: '3', label: 'public MQTT brokers used at once, so one can drop out' },
    { value: '64 KB', label: 'binary chunks, with the send queue held under 8 MB' },
    { value: '1', label: 'third-party library, a QR code generator loaded on demand' },
  ],
  shots: {
    title: 'The real app',
    sub: 'One page: who you are, a board for everyone nearby, the devices around you, and an inbox where nothing lands until you accept it. Captured from the live site with two real browsers.',
    url: 'mhfrough.github.io/flick',
    mainAlt:
      'Flick on a laptop named Brisk Otter: the headline "Flick it to the next screen.", a lime panel reading "Connected to 1 device", the share box, and an inbox with a note from Calm Heron and a photo waiting with Accept and Decline.',
    phoneTitle: 'On a phone',
    phoneText:
      'The same page in one column. Every device gets a random two-word name like Calm Heron, kept until you rename it, and shows up on the others with its kind and browser.',
    phonePoints: [
      'A device tile with Send files and Send text, and the transfer’s state under it',
      'Offers wait with names and sizes; nothing downloads until you press Accept or Download',
      'Received files stay in memory until you press Save',
    ],
    phones: [
      {
        src: '/images/flick/phone.webp',
        alt: 'Flick on a phone named Calm Heron: the same headline, the lime "You are Calm Heron, connected to 1 device" panel and the share box.',
        cap: 'The phone, connected',
      },
      {
        src: '/images/flick/phone-inbox.webp',
        alt: 'The phone further down: Brisk Otter in Nearby devices with "Waiting for Brisk Otter to accept IMG_2041.jpg", and a Received list with a shared link and a shared PDF offering Download or Dismiss.',
        cap: 'Offer sent, shares received',
      },
    ],
    wide: [
      {
        src: '/images/flick/transfer.webp',
        small: '/images/flick/transfer-800.webp',
        alt: 'The laptop after the transfer: the board says the PDF was downloaded by 1 device and the link was seen by 1 device; the inbox shows the photo with its thumbnail and a Save button.',
        cap: 'Board status and a finished transfer',
      },
      {
        src: '/images/flick/link.webp',
        small: '/images/flick/link-800.webp',
        alt: 'The private link sheet over the app: a QR code, the link with its room code after #r=, and Copy link, Stop sharing and Done.',
        cap: 'Private link and QR, for other networks',
      },
    ],
    note: 'The two browsers met in a throwaway room: the public address lookup was answered with an address from the documentation range, so no real network appears anywhere. Flick never shows the address anyway.',
  },
  meet: {
    title: 'How two browsers meet',
    sub: 'Browsers cannot reach each other until something passes a few handshake messages. Flick has no server, so it borrows free public MQTT brokers and makes sure they only ever see noise. Step through it; the hashes and the ciphertext are computed live in your browser.',
  },
  wire: {
    title: 'Moving the bytes',
    sub: 'Once the channel is open, Flick speaks its own small protocol: JSON for control, raw binary for file data. Files are always offered first and only sent once the receiver accepts.',
    msgsTitle: 'Eight control messages',
    msgs: [
      { t: 'hello', s: 'Name, device kind and label. Sent on open and again after a rename.' },
      { t: 'text', s: 'Text or a link, straight into the inbox. Up to 100,000 characters.' },
      { t: 'offer', s: 'File names, sizes and types, up to 500 files. Nothing moves yet.' },
      { t: 'reply', s: 'Accept or decline. Only an accept starts the transfer.' },
      { t: 'file', s: 'Marks which file the binary chunks that follow belong to.' },
      { t: 'got', s: 'The receiver has every byte. Until then the sender shows the transfer as unfinished.' },
      { t: 'cancel', s: 'Either side stops a transfer; both inboxes update.' },
      { t: 'unshare', s: 'Takes a board item back off other devices, unless its files were already received.' },
    ],
    pumpTitle: 'Back-pressure, simulated',
    pumpSub:
      'The sender reads the file 4 MB at a time and sends 64 KB pieces. When the channel’s buffer passes 8 MB it stops and waits for the browser’s “buffer low” event at 1 MB. Turn the wait off to see what it prevents.',
  },
  ways: {
    title: 'Three ways to share',
    sub: 'Like AirForShare for the room, like AirDrop for one device, and a link for everything else.',
    items: [
      {
        icon: 'phosphorUsersThree',
        t: 'Share with everyone',
        s: 'Paste text or add files once and every device on the network gets them, including devices that open Flick later: a new device is handed the whole board as soon as it says hello. Drop files anywhere on the page and they go out at once.',
        tag: 'board',
      },
      {
        icon: 'phosphorDeviceMobile',
        t: 'Send to one device',
        s: 'Tap a device, or drop files on its tile, and only that device is asked. Its owner sees names and sizes first and decides; the tile shows waiting, sending and done, with a cancel at every step.',
        tag: 'tile',
      },
      {
        icon: 'phosphorQrCode',
        t: 'A private link',
        s: 'On guest Wi-Fi, a hotspot or another network entirely, Share a link opens a sheet with a QR code. The room code rides in the URL after #r=, so whoever opens it joins the same encrypted room from anywhere.',
        tag: '#r=code',
      },
    ],
  },
  inside: {
    title: 'Engineering details',
    sub: 'Small things that make a no-server tool hold up on real networks and real phones.',
    items: [
      {
        t: 'An MQTT client in about 110 lines',
        s: 'MQTT 3.1.1 over WebSocket, QoS 0 only: connect, subscribe, publish, ping every 30 seconds, and a packet parser that copes with frames split across messages. Reconnects back off from 1 to 30 seconds.',
      },
      {
        t: 'Three brokers, one conversation',
        s: 'Every message goes to EMQX, Mosquitto and HiveMQ at once. Each carries a random id inside its sealed body, and a rolling set of the last 2,000 ids drops the duplicates.',
      },
      {
        t: 'No glare',
        s: 'When two devices hear each other, only the one with the lower id dials. The other answers with a direct hello so it is noticed, and ICE candidates that arrive before the offer are queued, not lost.',
      },
      {
        t: 'Memory that can page out',
        s: 'Received chunks are folded into a Blob every 64 pieces, so the browser can move them out of memory. A file that grows past its announced size fails instead of filling the tab.',
      },
      {
        t: 'Awake while it works',
        s: 'A screen wake lock is held only while a transfer runs, and a hidden tab shows unseen arrivals in its title, so a phone does not sleep halfway through a file.',
      },
      {
        t: 'Careful with what peers say',
        s: 'Names, labels and file names from other devices are cleaned of control and direction-override characters and trimmed; slashes in file names are replaced. Shared links open with noopener and nofollow.',
      },
    ],
  },
  decisions: {
    title: 'Decisions',
    sub: 'Each one follows from the same constraint: a static page, no account, nothing stored.',
    items: [
      {
        t: 'The public IP is the meeting point',
        s: 'Devices behind one router share a public address, so Flick asks ipify (or icanhazip) for it and hashes it into a topic and a key. No codes to type, and brokers never see the address, only hashes of it.',
      },
      {
        t: 'Borrowed brokers, sealed messages',
        s: 'With no signalling server, free public MQTT brokers pass the handshake. Every message is AES-GCM encrypted in the page with a fresh 12-byte IV, so brokers see random bytes on a hashed topic.',
      },
      {
        t: 'Offers before bytes',
        s: 'Everyone behind the same public IP counts as nearby, which on a campus or office network can include strangers. So files are always offered first and never sent until the receiver accepts.',
      },
      {
        t: 'Not Bluetooth',
        s: 'Web Bluetooth can only connect to Bluetooth gadgets. It cannot advertise, so two browsers can never discover each other over it. Wi-Fi plus WebRTC is the path a web page actually has.',
      },
    ],
  },
  limits: {
    title: 'Limits, stated plainly',
    sub: 'From the README, because a tool that moves your files should say where it stops.',
    worksTitle: 'Works',
    works: [
      'Phones and computers on the same Wi-Fi, in current Chrome, Edge, Firefox and Safari',
      'Any network, through the private link and QR code',
      'Many files at once, text and links, drag and drop, paste',
      'Light and dark, following the system until you pick',
    ],
    notTitle: 'Does not, by design',
    not: [
      'Transfers need both pages open; phones pause background tabs',
      'Received files are held in memory until saved, so files of several GB suit a computer',
      'Guest Wi-Fi, hotspots and client isolation keep devices apart; the link still works',
      'About 1 in 10 setups, strict corporate NATs, block direct connections; that needs a TURN relay, which this build does not include',
      'Public brokers have no uptime guarantee; three at once, and any MQTT-over-WebSocket broker can be added',
    ],
  },
  stack: {
    title: 'The stack',
    sub: 'Static files you can host anywhere. Two scripts, one stylesheet, one self-hosted font.',
    groups: [
      {
        t: 'Page',
        why: 'Plain HTML, CSS and JavaScript with no framework and no build. Light and dark from one set of tokens.',
        items: [
          { name: 'JavaScript', logo: 'javascript' },
          { name: 'HTML and CSS', icon: 'phosphorCode' },
          { name: 'Bricolage Grotesque', icon: 'phosphorCode' },
        ],
      },
      {
        t: 'Network',
        why: 'Signalling over MQTT on WebSocket, then a direct, DTLS-encrypted data channel. STUN from Google and Cloudflare.',
        items: [
          { name: 'WebRTC', icon: 'phosphorShareNetwork' },
          { name: 'MQTT 3.1.1', icon: 'phosphorBroadcast' },
          { name: 'WebSocket', icon: 'phosphorPlugs' },
        ],
      },
      {
        t: 'Browser APIs',
        why: 'Hashing and AES-GCM in the page, a wake lock during transfers, the share sheet and clipboard when present.',
        items: [
          { name: 'Web Crypto', icon: 'phosphorLock' },
          { name: 'Wake Lock', icon: 'phosphorGauge' },
          { name: 'Web Share', icon: 'phosphorShareNetwork' },
          { name: 'qrcode-generator', icon: 'phosphorPackage' },
        ],
      },
    ],
  },
  cta: {
    title: 'Need something that works without a backend?',
    sub: 'Peer to peer and real-time tools, built small, honest about their limits and easy to host.',
    hire: 'Hire me',
    other: 'Next: Scrawl',
  },
} as const;
