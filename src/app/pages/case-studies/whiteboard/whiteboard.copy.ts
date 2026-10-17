// Whiteboard case-study copy. English only, plain const.
// Facts come from the archived source (D:\workspace-personal\archive\mhfrough.dev: mhfrough_frontend
// src/app/features/whiteboard and mhfrough_backend src/whiteboard), read, never modified, and from its git history
// (whiteboard commits from 5 to 12 July 2026, all by the owner). The board lived at /whiteboard on the owner's
// previous site, which is archived; it is presented here as its own project. The status section was checked against
// a local run of the original build on 11 October 2026 (two browsers and a local relay with the gateway's event
// shapes). No hosts, keys or personal data appear anywhere.

export const COPY = {
  seo: {
    title: 'Whiteboard case study',
    description:
      'An Excalidraw-style whiteboard in Angular 21 and NestJS: one SVG scene under a pan and zoom transform, fifteen signal services, smart guides, snapshot undo, five export formats and live editing over socket.io.',
    imageAlt: 'Whiteboard case study cover: "An infinite canvas, built on signals." beside the board with a diagram drawn on it.',
  },
  hero: {
    tag: 'Case study',
    pill: 'July 2026, own product',
    line1: 'Whiteboard.',
    line2: 'An infinite canvas, built on signals.',
    lede: 'An Excalidraw-style board I built in a week for my previous site: twenty tools, smart guides, undo, five export formats, autosave with versions, and live editing between browsers through a NestJS relay. Try the miniature here; the real one follows.',
    back: 'View work',
    demoNote: 'A working miniature, written for this page',
  },
  meta: [
    { k: 'Role', v: 'Sole author, frontend and backend' },
    { k: 'Timeline', v: '5 to 12 July 2026' },
    { k: 'Lived in', v: 'My previous site, now archived' },
    { k: 'Stack', v: 'Angular 21, NestJS 11, socket.io, PostgreSQL' },
  ],
  numbers: [
    { value: '20', label: 'tools, each on one key, from rectangle to code block' },
    { value: '15', label: 'services provided per board, each holding its own signals' },
    { value: '100', label: 'undo steps, kept as whole-scene snapshots' },
    { value: '5', label: 'export formats, PNG, JPEG, SVG, PDF and JSON, plus clipboard and print' },
  ],
  shots: {
    title: 'The real board',
    sub: 'Rulers, a dot grid, a floating toolbar, a minimap, and an inspector that appears with the selection. Captured from the original build, running locally.',
    url: 'mhfrough.dev/whiteboard, original build',
    mainAlt:
      'The whiteboard: rulers along the top and left, a dot grid, a diagram titled "How a stroke travels" with a Browser A frame, a Server frame and a Browser B box joined by arrows, an amber sticky note, a code block, the tool bar at the bottom and a minimap in the corner.',
    details: [
      {
        src: '/images/whiteboard/guides.webp',
        alt: 'Dragging the sticky note: amber guide lines show its left edge lining up with the code block and its edges lining up with shapes in the other frame; the inspector shows its position and size.',
        cap: 'Smart guides while dragging',
      },
      {
        src: '/images/whiteboard/select.webp',
        alt: 'A diamond selected: dashed box, eight resize handles and a rotate knob; the inspector on the left with stroke, fill, width, style and opacity; a context bar on the right.',
        cap: 'Selection, inspector, context bar',
      },
      {
        src: '/images/whiteboard/layers.webp',
        alt: 'The layers panel listing every element by type and name, beside the board zoomed out to 83 percent.',
        cap: 'Layers, zoomed out',
      },
    ],
    pair: [
      {
        src: '/images/whiteboard/export.webp',
        w: 950,
        h: 800,
        alt: 'The export menu: PNG, transparent PNG, JPEG, SVG, JSON, copy image, a page size and orientation picker, PDF and print.',
        cap: 'Export menu',
      },
      {
        src: '/images/whiteboard/versions.webp',
        w: 950,
        h: 525,
        alt: 'The version history menu: a snapshot label field with a save button above three named versions with their times.',
        cap: 'Named versions',
      },
    ],
    note: 'Captured by a script: the demo scene goes in through the app’s own autosave slot, then a scripted mouse draws the Browser B box and its arrow, selects, drags and opens menus. No backend was running, so cloud sync shows as off.',
  },
  render: {
    title: 'One SVG, a few HTML layers, overlays on top',
    sub: 'Everything that moves with the board lives in world units under one transform. Everything that has to stay crisp at any zoom, like handles and guide lines, is drawn in screen pixels.',
    world: 'world units, transformed',
    screen: 'screen pixels',
    fixed: 'fixed chrome',
    layers: [
      { t: 'Chrome', s: 'Tool bar, top bar, inspector, layers panel, minimap and zoom controls.', space: 'fixed' },
      { t: 'Screen overlays', s: 'Selection box and handles, smart guides, remote cursors, image crop. Placed with worldToScreen, so a handle is the same size at 10% and 800%.', space: 'screen' },
      { t: 'HTML scene', s: 'Images, text and sticky notes as real DOM under a CSS translate and scale: rich text, links and checklists.', space: 'world' },
      { t: 'Draft layer', s: 'A second shape layer holding only the shape being drawn, so the committed layer does not re-render on every pointer move.', space: 'world' },
      { t: 'Shape layer', s: 'One full-surface SVG. Every shape, path and frame sits in one group under translate and scale; geometry strings are memoised per element.', space: 'world' },
      { t: 'Dot grid', s: 'A CSS background whose size and offset follow the pan and zoom. No elements at all.', space: 'screen' },
    ],
    code: `// ViewportService: all coordinate math in one place
screenToWorld(p) {
  return { x: (p.x - v.x) / v.zoom, y: (p.y - v.y) / v.zoom };
}

// Wheel and pinch: the point under the cursor stays put
zoomAt(anchor, factor) {
  const next = clamp(v.zoom * factor, 0.1, 8);
  const ratio = next / v.zoom;
  return {
    x: anchor.x - (anchor.x - v.x) * ratio,
    y: anchor.y - (anchor.y - v.y) * ratio,
    zoom: next,
  };
}`,
    notes: [
      'Pointer moves are coalesced to one update per animation frame, then flushed on release, so the last position is never dropped.',
      'Two pointers pinch-zoom around their midpoint; Space or the middle button pans; Ctrl and the wheel zoom around the cursor.',
      'The live board is SVG; exports redraw the scene on a canvas, so neither depends on the other.',
    ],
  },
  services: {
    title: 'Fifteen services, one per concern',
    sub: 'All provided by the board component, not the root injector, so each board owns its state and nothing outlives the route. Signals hold the state; computed signals derive the rest.',
    groups: [
      {
        t: 'Model',
        icon: 'phosphorCube',
        items: [
          { n: 'Scene', s: 'The ordered element list: add, update, reorder, replace' },
          { n: 'Viewport', s: 'Pan, zoom, grid, snap, rulers and every coordinate conversion' },
          { n: 'Tool', s: 'The active tool and the current style' },
          { n: 'History', s: 'Undo and redo over scene snapshots' },
        ],
      },
      {
        t: 'Input',
        icon: 'phosphorHandPointing',
        items: [
          { n: 'Drawing', s: 'Down, drag, up for new elements; Shift constrains' },
          { n: 'Selection', s: 'Selected ids; align, distribute, group, order, copy, nudge' },
          { n: 'SelectionInteraction', s: 'Move, resize, rotate and marquee drags' },
          { n: 'Guides', s: 'Alignment lines while a move is running' },
          { n: 'TextEditing', s: 'Formatting inside the live text editor' },
        ],
      },
      {
        t: 'Media',
        icon: 'phosphorImage',
        items: [
          { n: 'Image', s: 'Paste, drop and pick images; re-encode to WebP' },
          { n: 'ImageOps', s: 'Crop, mask and boolean ops, baked to PNG' },
        ],
      },
      {
        t: 'Outside the browser tab',
        icon: 'phosphorPlugs',
        items: [
          { n: 'Persistence', s: 'Local autosave, versions and cloud sync' },
          { n: 'Export', s: 'PNG, JPEG, SVG, PDF, JSON, clipboard, print' },
          { n: 'Collaboration', s: 'Presence, cursors and scene ops over socket.io' },
          { n: 'WhiteboardApi', s: 'The REST client for the backend module' },
        ],
      },
    ],
  },
  inside: {
    title: 'The parts worth reading',
    sub: 'Small, specific decisions that keep a canvas app from feeling like a web page.',
    items: [
      {
        t: 'Hit testing',
        s: 'The click is rotated back into the element’s own frame, then tested against its box with a pad of 6 screen pixels at any zoom, so thin lines stay clickable when zoomed out. The list is walked backwards, so the topmost element wins. Locked elements are skipped.',
      },
      {
        t: 'Smart guides',
        s: 'A computed signal that only runs during a move. It compares the selection’s left, centre and right, top, middle and bottom with up to 300 other elements, merges lines on the same axis and position, and stops at six. Grid snap makes the alignment exact; the guides show it.',
      },
      {
        t: 'Undo and redo',
        s: 'Whole-scene snapshots taken with structuredClone at the end of a gesture, never mid-drag. A JSON comparison skips commits that changed nothing, the stack stops at 100, and a remote edit clears the stack so undo can’t bring back a peer’s stale copy.',
      },
      {
        t: 'Export without libraries',
        s: 'Raster formats redraw the scene on a canvas; SVG is built as a string. The PDF is written by hand: one page, the board as a JPEG, fitted to A4, A3 or Letter. PNG, SVG and JSON can take just the selection, and PNG and SVG can write each selected object as its own file.',
      },
      {
        t: 'Images that fit',
        s: 'Pasted, dropped or picked images over 300 KB are capped at 1600px and re-encoded to WebP before they reach the scene, because the scene autosaves to localStorage and one phone photo would fill it. SVG and GIF stay as they are. Crop, mask and boolean ops keep the original for reset.',
      },
      {
        t: 'Text is real text',
        s: 'Text boxes and sticky notes are editable HTML: bold, italic, links that form as you type, checklists. A small pill rewrites a box through a throttled Gemini endpoint (improve, shorten, fix), and one undo restores the original wording.',
      },
    ],
  },
  collab: {
    title: 'Live editing through one relay',
    sub: 'The server forwards; the clients merge. Every op carries whole elements, and each element resolves on its own: the newer updatedAt wins.',
    lanes: ['Browser A', 'Relay /whiteboard', 'Browser B'],
    steps: [
      { from: 2, to: 1, msg: 'join', note: 'B joins room doc:<id>; the reply lists who is already there.' },
      { from: 1, to: 0, msg: 'presence:join', note: 'Everyone in the room hears about the newcomer.' },
      { from: 0, to: 2, msg: 'scene:op snapshot', note: 'Each peer sends its whole scene. Merging is idempotent, so duplicates are harmless.' },
      { from: 0, to: 2, msg: 'scene:op upsert / delete', note: '120ms after the last change: only elements whose object changed since the last send, and the ids that disappeared.' },
      { from: 2, to: 0, msg: 'cursor', note: 'Pointer position in world units, at most one every 45ms.' },
      { from: 2, to: 1, msg: 'leave', note: 'Or a dropped connection. The room hears presence:leave and the cursor goes away.' },
    ],
    code: `type SceneOp =
  | { kind: 'snapshot'; elements: Element[] }
  | { kind: 'upsert'; elements: Element[] }
  | { kind: 'delete'; ids: string[] };

// Merge: unknown ids append,
// known ids win only if same or newer.
for (const r of op.elements) {
  const mine = byId.get(r.id);
  if (!mine) next.push(r);
  else if (r.updatedAt >= mine.updatedAt) swap(mine, r);
}`,
    rulesTitle: 'What the gateway enforces',
    rules: [
      'Presence lives in memory: document, then socket, then user.',
      'Only a socket that joined a room can send into it.',
      'Room ids up to 128 characters, names and colours up to 64. Malformed envelopes are dropped, not relayed.',
      'Messages up to 5 MB, because images travel as data URLs.',
    ],
  },
  persist: {
    title: 'Saved twice: in the browser, then on the server',
    sub: 'Local first, so the board works with no account. Signing in adds a server copy, and the newer side wins on load.',
    tiers: [
      {
        t: 'In the browser',
        tag: 'always on',
        items: [
          'Autosave 600ms after the last change, into localStorage.',
          'A full quota shows “Not saved” instead of failing quietly.',
          'Up to 30 named versions; restoring one is a single undo step.',
        ],
      },
      {
        t: 'On the server',
        tag: 'when signed in',
        items: [
          'Find or create the default board, then keep the newer of the two copies.',
          'Save the scene 2.5s after the last change; overlapping saves collapse into one trailing save.',
          'Saving a version also snapshots it on the server.',
        ],
      },
    ],
    entitiesTitle: 'Three tables, TypeORM on PostgreSQL',
    entities: [
      { t: 'whiteboard_documents', s: 'id, title, ownerId, scene as jsonb, isPublic, shareRole, deletedAt for soft delete, timestamps' },
      { t: 'whiteboard_versions', s: 'id, documentId (indexed), scene as jsonb, label, createdBy, createdAt' },
      { t: 'whiteboard_collaborators', s: 'documentId and userId, unique together, role viewer or editor' },
    ],
    access: 'Access resolves owner first, then collaborator, then the public link’s role. Restoring a version first saves the current scene as “Auto-save before restore”, so a restore can itself be undone.',
    apiTitle: 'REST under api/v1/whiteboard',
    api: [
      'GET  /',
      'POST /',
      'GET  /:id',
      'PUT  /:id',
      'DELETE /:id',
      'POST /:id/restore',
      'POST /:id/duplicate',
      'GET  /:id/public',
      'GET  /:id/versions',
      'POST /:id/versions',
      'POST /:id/versions/:vid/restore',
      'GET  /:id/collaborators',
      'POST /:id/collaborators',
      'PATCH /:id/collaborators/:uid',
      'DELETE /:id/collaborators/:uid',
      'POST /ai/improve-text',
    ],
  },
  stack: {
    title: 'The stack',
    sub: 'Angular on the board, a NestJS module in the site’s existing API, and no libraries for drawing or export.',
    groups: [
      {
        t: 'Board',
        why: 'Standalone components, OnPush, signals and the new control flow. The socket client loads only when you go live.',
        items: [
          { name: 'Angular 21', logo: 'angular' },
          { name: 'TypeScript', logo: 'typescript' },
          { name: 'Signals', icon: 'phosphorBroadcast' },
          { name: 'socket.io client', logo: 'socketdotio' },
          { name: 'SVG', icon: 'phosphorCode' },
        ],
      },
      {
        t: 'Server',
        why: 'REST for documents, versions and sharing; a socket.io gateway for presence and ops; JWT guards on the document routes.',
        items: [
          { name: 'NestJS 11', logo: 'nestjs' },
          { name: 'socket.io', logo: 'socketdotio' },
          { name: 'TypeORM', logo: 'typeorm' },
          { name: 'PostgreSQL', logo: 'postgresql' },
          { name: 'JWT', logo: 'jsonwebtokens' },
          { name: 'Swagger', logo: 'swagger' },
        ],
      },
      {
        t: 'Output',
        why: 'Canvas for pixels, strings for SVG and a hand-written PDF. Gemini only for the optional text rewrite.',
        items: [
          { name: 'Canvas 2D', icon: 'phosphorCode' },
          { name: 'PDF, by hand', icon: 'phosphorFilePdf' },
          { name: 'JSON files', icon: 'phosphorCode' },
          { name: 'Gemini API', icon: 'phosphorPlugs' },
        ],
      },
    ],
  },
  decisions: {
    title: 'Decisions and what I’d change',
    sub: 'A week, one author, and a board that had to feel like a tool, not a page.',
    items: [
      {
        t: 'Signals, not a store',
        s: 'Each concern is a small service with its own signals, and the view reads computed ones: visible elements, guides, the minimap. No actions or reducers; change detection follows the data.',
      },
      {
        t: 'SVG for the board, canvas for export',
        s: 'SVG gives crisp strokes at any zoom, DOM events and CSS transforms for free. Exports need pixels, so a separate canvas renderer draws them and the live board never waits on it.',
      },
      {
        t: 'HTML for text',
        s: 'An editable HTML box brings selection, input methods, spellcheck and links that SVG text never will. The price is two layers to keep in step, solved by giving both the same transform.',
      },
      {
        t: 'Last writer wins, per element',
        s: 'Elements are small independent records, so two people editing different elements both keep their work, and same-element conflicts resolve to the newest. A CRDT would be the next step, not the first.',
      },
      {
        t: 'Snapshots for undo',
        s: 'Copying the whole scene is the simplest undo that is always right. It costs memory once large images are on the board; inverse patches per operation are the fix.',
      },
      {
        t: 'Local first',
        s: 'The board saves in the browser before anything else, so it works signed out and offline. The server copy is an upgrade, never a requirement.',
      },
    ],
  },
  status: {
    title: 'Where it stands',
    sub: 'Checked against the code and a local run of the original build, with two browsers and a relay using the gateway’s event shapes.',
    worksTitle: 'Works',
    works: [
      'All twenty tools, with move, resize, rotate, group, align, distribute and layers.',
      'Undo and redo, local autosave and named versions.',
      'Every export and import, plus image crop, mask and boolean ops.',
      'Live scene sync: a shape drawn in one browser appears in the other.',
    ],
    notTitle: 'Not yet',
    not: [
      'Presence labels. The gateway sends cursors without a name or colour and wraps a joining user in an envelope the client reads as flat, so remote cursors arrive unlabelled and a peer joining after you breaks your avatar list.',
      'Live rooms use an id minted in the address bar, not the saved document, and the socket is not authenticated: anyone with the link can join.',
      'Cloud sync covers one default board for a signed-in account. Versions restore locally only; the server stores them, but no screen lists them.',
      'Sharing, collaborators, public links and duplicate exist in the API with no screen yet.',
      'Hit testing uses boxes, so a click just outside an ellipse but inside its box still selects it.',
      'Offline today: it lived inside my previous site, which is archived.',
    ],
  },
  roadmap: {
    title: 'Next',
    sub: 'In the order I’d do them.',
    items: [
      { t: 'Rooms on the document', s: 'Join by the stored document id, authenticate the socket with the same JWT cookie as REST, and check the role before relaying an op.' },
      { t: 'One presence payload', s: 'The same shape for join and cursor events, with name and colour taken from the server’s presence map.' },
      { t: 'Versions on the server', s: 'A version list fed by the API, with restore going through the server so every client sees it.' },
      { t: 'Inverse patches for undo', s: 'Store what each operation changed, not the whole scene, so large images stop multiplying in memory.' },
      { t: 'Exact hit testing', s: 'Distance to the path for lines and arrows, the ellipse equation for ellipses, point in polygon for the rest.' },
      { t: 'Images as files', s: 'Upload each image once and reference it by URL, so scenes, ops and snapshots stay small.' },
    ],
  },
  cta: {
    title: 'Building a canvas, an editor or a live tool?',
    sub: 'Infinite canvases, real-time sync, and the undo, export and keyboard work that make them feel finished.',
    hire: 'Hire me',
    other: 'Next: Quorum',
  },
} as const;
