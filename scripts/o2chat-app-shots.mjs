// Screenshots of the O2Chat agent portal (Angular 16) for its case study, run locally with sample data.
//   node scripts/o2chat-app-shots.mjs            (dashboard + inbox)
//   node scripts/o2chat-app-shots.mjs --probe    (also logs every API path the app asks for)
// The owner asked for the real portal on this page, as an exception to the "public pages only" rule. The local
// build in D:\workspace-office\o2chat\o2chat-web-admin-revamp\dist (read only, never modified) is served from a
// virtual origin through context.route(), the way kpmc-shots.mjs does it. No real backend is ever reached:
//   - every XHR/fetch to any other host is fulfilled here from invented sample data, matched by API path only
//     (no backend host is named in this file);
//   - the SignalR hub is answered by a fake negotiate + routeWebSocket handshake that never connects upstream,
//     so the inbox shows its normal connected state;
//   - Firebase, Facebook SDK, fonts CDNs and anything else are aborted.
// Sign-in is skipped by seeding localStorage the way the portal stores its session ('o2chat:portal') with a fake,
// unsigned token for "Demo Admin". Every name, message, number and tag in the frames is invented; avatars are the
// bundle's own generic illustrations (fruit, a cube, a monster), never the character-like ones.
// Output: public/images/o2chat/app-dashboard.webp, app-inbox.webp (quality 80).
import { existsSync, mkdirSync, readFileSync, statSync } from 'node:fs';
import { extname, join, normalize, resolve } from 'node:path';
import sharp from 'sharp';
import { ROOT, hasFlag } from './_env.mjs';

const { chromium } = await import('playwright');
const OUT = resolve(ROOT, 'public/images/o2chat');
mkdirSync(OUT, { recursive: true });
const DIST = 'D:/workspace-office/o2chat/o2chat-web-admin-revamp/dist/admin-revamp';
const ORIGIN = 'https://portal.shots.test';
const PROBE = hasFlag('--probe');

// ---------------------------------------------------------------------------------------------------------------
// The session: a fake, unsigned JWT. The portal only decodes its payload (role name and permission list).
// ---------------------------------------------------------------------------------------------------------------
const b64url = (o) => Buffer.from(JSON.stringify(o)).toString('base64url');
const TOKEN = [
  b64url({ alg: 'none', typ: 'JWT' }),
  b64url({
    sub: '7',
    exp: 4102444800,
    Permissions: JSON.stringify({ RoleName: 'admin', RoleId: 1, ListPermissions: [{ ActionId: 1, AccessLevelCode: 0 }] }),
  }),
  'demo',
].join('.');

const USER = {
  userId: 7,
  id: 7,
  UserId: 7,
  fullName: 'Demo Admin',
  firstName: 'Demo',
  lastName: 'Admin',
  name: 'Demo Admin',
  userName: 'demo.admin',
  email: 'admin@demo-store.test',
  roleName: 'admin',
  isSuperAdmin: true,
  organizationId: 1,
  token: TOKEN,
  externalToken: 'demo',
  refreshToken: 'demo',
  timeZone: 'UTC',
  isOnboarding: true,
  doNotShow: { onboarding: true },
  canInitiateChat: true,
  featurePermissions: [{ isRead: true, isWrite: true }],
};

// ---------------------------------------------------------------------------------------------------------------
// Sample data (all invented).
// ---------------------------------------------------------------------------------------------------------------
const NOW = Date.now();
const ago = (min) => new Date(NOW - min * 60_000).toISOString().replace('Z', '');

const AGENTS = [
  { name: 'Aisha', chatCount: 46, averageResponseTime: '38 sec', ratings: 4.8 },
  { name: 'Bilal', chatCount: 39, averageResponseTime: '52 sec', ratings: 4.6 },
  { name: 'Maya', chatCount: 33, averageResponseTime: '41 sec', ratings: 4.7 },
  { name: 'Daniel', chatCount: 28, averageResponseTime: '1 min', ratings: 4.4 },
  { name: 'Hina', chatCount: 21, averageResponseTime: '47 sec', ratings: 4.5 },
];
const CHANNELS = ['Website', 'WhatsApp', 'Messenger', 'Instagram'];
const BY_CHANNEL = { Website: 142, WhatsApp: 96, Messenger: 41, Instagram: 33 };
const TAGS = [
  { tagId: 1, tagName: 'Order', tagColor: '#2563eb' },
  { tagId: 2, tagName: 'Sizing', tagColor: '#0d9488' },
  { tagId: 3, tagName: 'Returns', tagColor: '#d97706' },
  { tagId: 4, tagName: 'Delivery', tagColor: '#7c3aed' },
];
const tag = (id, sel = true) => ({ ...TAGS.find((t) => t.tagId === id), isSelected: sel });
const GROUPS = [
  { id: 1, groupId: 1, groupName: 'Support', name: 'Support' },
  { id: 2, groupId: 2, groupName: 'Sales', name: 'Sales' },
];

// The open conversation is the first one.
const CONVERSATIONS = [
  { id: 101, agent: 8, name: 'Sara K.', source: 'web', avatar: 'pear', min: 1, count: 1, preview: 'Great, thank you! When should it arrive?', tags: [1, 2] },
  { id: 102, agent: 9, name: 'Omar R.', source: 'whatsapp', avatar: 'apple', min: 4, count: 1, preview: 'Order #5172 has not arrived yet', tags: [4] },
  { id: 103, agent: 10, name: 'Visitor 4821', source: 'web', avatar: 'no-image', min: 9, count: 0, preview: 'Do you ship to Dubai?', tags: [] },
  { id: 104, agent: 8, name: 'Lena M.', source: 'instagram', avatar: 'rubik', min: 16, count: 3, preview: 'Can I swap the size on my order?', tags: [3] },
  { id: 105, agent: 11, name: 'Yusuf A.', source: 'facebook', avatar: 'character', min: 27, count: 0, preview: 'Thanks, that fixed it', tags: [] },
  { id: 106, agent: 12, name: 'Visitor 1307', source: 'web', avatar: 'no-image', min: 41, count: 0, preview: 'What is your return window?', tags: [3] },
  { id: 107, agent: 9, name: 'Nadia F.', source: 'whatsapp', avatar: 'tannat', min: 58, count: 1, preview: 'Please send the tracking link', tags: [4] },
  { id: 108, agent: 10, name: 'Chris P.', source: 'web', avatar: 'monster', min: 75, count: 0, preview: 'Is there a discount for two?', tags: [1] },
  { id: 109, agent: 8, name: 'Visitor 2290', source: 'instagram', avatar: 'no-image', min: 96, count: 0, preview: 'Do the shoes run small?', tags: [2] },
].map((c) => ({
  conversationId: c.id,
  conversationUId: `demo-${c.id}`,
  customerId: 900 + c.id,
  customerName: c.name,
  customerEmail: '',
  avatar: c.avatar,
  source: c.source,
  content: c.preview,
  conversationType: 'text',
  files: [{ documentName: '' }],
  count: c.count,
  isChannelActive: true,
  groupId: 1,
  groupName: 'Support',
  agentId: c.agent,
  status: 3,
  inactivityStatus: 0,
  timestamp: ago(c.min),
  tagList: c.tags.map((t) => tag(t)),
  isWorkFlowActive: false,
}));

const OPEN = CONVERSATIONS[0];
let mid = 5000;
const msg = (fromCustomer, content, min, extra = {}) => ({
  id: ++mid,
  tempChatId: `demo-msg-${mid}`,
  conversationId: OPEN.conversationId,
  conversationUId: OPEN.conversationUId,
  customerId: OPEN.customerId,
  sender: fromCustomer ? OPEN.customerName : 'Aisha',
  receiver: fromCustomer ? 'Aisha' : OPEN.customerName,
  toUserId: fromCustomer ? 0 : 8,
  fromUserId: fromCustomer ? 0 : 8,
  isFromWidget: fromCustomer,
  isSeen: true,
  type: 'text',
  content,
  timestamp: ago(min),
  files: [{ documentName: '' }],
  isChannelActive: true,
  whatsAppCanReply: true,
  ...extra,
});
const MESSAGES = [
  msg(true, 'Hi, I ordered the linen shirt last week. Is the medium in stock in navy?', 14),
  msg(false, 'Hi Sara, yes, the navy medium is in stock. Would you like to swap your current size?', 12),
  msg(true, 'Yes please, my order is #3906. The large is a bit loose.', 9),
  msg(false, 'Done. The navy medium ships today and the return label for the large is in your email.', 6),
  msg(true, 'Great, thank you! When should it arrive?', 1),
].reverse(); // the portal reverses the page it receives

// Dashboard series: two months of daily chats.
const wave = (n, base, amp, seed) => Array.from({ length: n }, (_, i) => ({ chatCount: Math.round(base + amp * Math.sin((i + seed) / 2.3) + ((i * 7 + seed) % 5)) }));

// ---------------------------------------------------------------------------------------------------------------
// The API, by path (the part after the API base). Unknown GETs get an empty success.
// ---------------------------------------------------------------------------------------------------------------
const ok = (result, extra = {}) => ({ isSuccess: true, message: '', result, pageNumber: 1, totalPages: 1, ...extra });
const unknown = new Set();

function api(path, params, method) {
  const p = path.toLowerCase();
  const has = (s) => p.endsWith(s.toLowerCase());

  // Session and plan
  if (has('Portal/GetOwnerInfo'))
    return ok({
      data: {
        name: 'Demo Admin',
        email: 'admin@demo-store.test',
        organizationName: 'Demo Store',
        isChannelsOnboarding: true,
        canInitiateChat: true,
        timeZone: 'UTC',
        isUseAssistant: false,
        organizationInactivityInfo: null,
        subscriptionDetail: [{ subscriptionStatus: 'active', subscriptionItemBeans: [{ family: 'O2Chat', plan: 'Pro' }] }],
      },
    });
  if (has('Package/GetFeaturesForPackage')) return ok({ features: [], webWidgets: 5, instagramAccounts: 5 });

  // Dashboard
  if (has('Chat/HasConversations')) return ok({ value: true });
  if (has('Analytics/GetCards')) return ok({ AverageResponseTime: { value: 42, prefix: 'sec' }, LongestWaitTime: { value: 4, prefix: 'min' }, AgentsOnline: 5, AgentsOffline: 2 });
  if (has('Analytics/GetAgents')) return ok(AGENTS);
  if (has('Analytics/GetChildTypes')) {
    const t = params.get('parentType');
    const names = { Channels: CHANNELS, Groups: ['Support', 'Sales'], Tags: TAGS.map((x) => x.tagName), Agents: AGENTS.map((a) => a.name), Status: ['Open', 'Assigned', 'Resolved'] }[t] ?? [];
    return ok(names.map((sourceName) => ({ sourceName })));
  }
  if (has('Analytics/GetCountByName')) return ok([{ count: { Channels: 312, Status: 47, Tags: 64 }[params.get('parentType')] ?? 0 }]);
  if (has('Analytics/GetTotalChatCountWithAvg'))
    return ok({ name: 'Total', value: 312, countVMs: CHANNELS.map((channel) => ({ channel, count: BY_CHANNEL[channel] })) });
  if (has('Analytics/GetInfoBySource')) return ok(CHANNELS.map((channel) => ({ channel, count: BY_CHANNEL[channel] })));
  if (has('Analytics/GetChatDetailsLast24Hours')) {
    const day = new Date().getUTCDate();
    const cur = wave(31, 14, 5, 1).map((d, i) => (i < day ? d : { chatCount: 0 }));
    return ok({ currentMonthDetails: cur, lastMonthDetails: wave(31, 11, 4, 4) });
  }
  if (has('Analytics/GetRatings'))
    return ok({ goodPercentage: 82, goodCount: 164, averagePercentage: 13, averageCount: 26, badPercentage: 5, badCount: 10, totalCount: 200 });

  // Inbox
  if (has('Chat/GetConversations')) return ok(+params.get('status') === 3 ? CONVERSATIONS : []);
  if (has('Chat/GetConversationsCountByFilter'))
    return ok([{ newCount: 3, assignedCount: 2, allAssignedCount: CONVERSATIONS.length, resolvedCount: 236, archivedCount: 12, irrelevantCount: 3 }]);
  if (has('Chat/GetConversationsByUId')) return ok(MESSAGES);
  if (has('Organization/GetOrganization')) return ok({ orgName: 'Demo Store', organizationName: 'Demo Store' });
  if (has('Tag/GetAllTags')) return ok(TAGS);
  if (has('Tag/GetTagsByConversationUId')) return ok(TAGS.map((t) => tag(t.tagId, OPEN.tagList.some((x) => x.tagId === t.tagId))));
  if (has('UserManagement/GetGroupByUser')) return ok({ groupsList: GROUPS });
  if (has('UserManagement/GetAllGroups')) return ok(GROUPS);
  if (has('UserManagement/GetFilteredAgents')) return ok(AGENTS.map((a, i) => ({ agentId: 8 + i, firstName: a.name })));
  if (has('CustomFilters/GetByAgentIdAsync')) return ok([]);

  if (method === 'GET') unknown.add(path);
  return ok(method === 'GET' ? [] : {});
}

// ---------------------------------------------------------------------------------------------------------------
// Static files from the dist folder, index.html for client routes.
// ---------------------------------------------------------------------------------------------------------------
const TYPES = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.gif': 'image/gif', '.ico': 'image/x-icon', '.woff2': 'font/woff2',
  '.woff': 'font/woff', '.ttf': 'font/ttf', '.otf': 'font/otf', '.mp3': 'audio/mpeg', '.wav': 'audio/wav',
};
function staticFile(urlPath) {
  const clean = normalize(decodeURIComponent(urlPath)).replace(/^[\\/]+/, '');
  const file = join(DIST, clean);
  if (clean && file.startsWith(resolve(DIST)) && existsSync(file) && statSync(file).isFile()) {
    return { status: 200, contentType: TYPES[extname(file).toLowerCase()] ?? 'application/octet-stream', body: readFileSync(file) };
  }
  if (extname(clean)) return { status: 404, contentType: 'text/plain', body: 'not found' };
  return { status: 200, contentType: TYPES['.html'], body: readFileSync(join(DIST, 'index.html')) };
}

const HIDE = [
  '#loader { display: none !important; }',
  'html { scrollbar-width: none; } ::-webkit-scrollbar { display: none; }',
  '*, *::before, *::after { caret-color: transparent !important; }',
].join('\n');

const CORS = { 'access-control-allow-origin': ORIGIN, 'access-control-allow-credentials': 'true', 'access-control-allow-headers': '*', 'access-control-allow-methods': '*' };
const browser = await chromium.launch();

async function open(path) {
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1.5,
    serviceWorkers: 'block',
    reducedMotion: 'reduce',
    locale: 'en-US',
    timezoneId: 'UTC',
  });
  const misses = [];
  await ctx.route('**/*', async (route) => {
    const req = route.request();
    const url = new URL(req.url());
    if (url.origin === ORIGIN) {
      const r = staticFile(url.pathname);
      if (r.status === 404) misses.push(url.pathname);
      return route.fulfill(r);
    }
    if (url.protocol === 'data:' || url.protocol === 'blob:') return route.continue();
    if (!['xhr', 'fetch'].includes(req.resourceType())) return route.abort(); // SDKs, fonts CDNs, analytics
    if (req.method() === 'OPTIONS') return route.fulfill({ status: 204, headers: CORS });
    // SignalR negotiate: point the client at a WebSocket that routeWebSocket answers below.
    if (/\/negotiate$/i.test(url.pathname)) {
      return route.fulfill({
        status: 200,
        headers: CORS,
        contentType: 'application/json',
        body: JSON.stringify({ negotiateVersion: 1, connectionId: 'demo', connectionToken: 'demo', availableTransports: [{ transport: 'WebSockets', transferFormats: ['Text', 'Binary'] }] }),
      });
    }
    // Firebase and other SDK calls never leave the browser.
    if (/googleapis|firebase|facebook/i.test(url.hostname)) return route.abort();
    const path = url.pathname.replace(/^.*?\/api\//i, '').replace(/^\/+/, '');
    if (PROBE) console.log(`  ${req.method()} ${path}${url.search}`);
    return route.fulfill({ status: 200, headers: CORS, contentType: 'application/json', body: JSON.stringify(api(path, url.searchParams, req.method())) });
  });
  // The hub: complete the SignalR JSON handshake and keep the socket alive; nothing is forwarded anywhere.
  await ctx.routeWebSocket(/.*/, (ws) => {
    ws.onMessage((m) => {
      const text = typeof m === 'string' ? m : m.toString();
      if (text.includes('"protocol"')) ws.send('{}\u001e');
    });
    const ping = setInterval(() => ws.send('{"type":6}\u001e'), 10_000);
    ws.onClose(() => clearInterval(ping));
  });
  await ctx.addInitScript(([user, tab]) => {
    try {
      localStorage.setItem('o2chat:portal', user);
      localStorage.setItem('o2chat:chat-tab', tab);
      Notification.requestPermission = () => Promise.resolve('denied');
      Object.defineProperty(Notification, 'permission', { get: () => 'denied' });
    } catch {}
  }, [JSON.stringify(USER), JSON.stringify({ id: 3, title: 'All Assigned', count: 0, active: true, hasPermission: true })]);
  const p = await ctx.newPage();
  p.on('pageerror', (e) => console.log(`  pageerror: ${e.message.split('\n')[0]}`));
  if (PROBE) p.on('console', (m) => m.type() === 'error' && console.log(`  console: ${m.text().slice(0, 200)}`));
  await p.goto(ORIGIN + path, { waitUntil: 'load', timeout: 60_000 });
  await p.addStyleTag({ content: HIDE });
  if (misses.length) console.log(`  missing files: ${[...new Set(misses)].join(', ')}`);
  return { ctx, page: p };
}

// Waits until every image on the page has really loaded (complete with pixels) and fonts are ready, so nothing is
// half-rendered. Throws instead of saving a broken shot. (Same check as asaan-hisab-shots.mjs.)
async function settleImages(p) {
  await p.evaluate(async () => { await document.fonts.ready; });
  try {
    await p.waitForFunction(
      () => [...document.images].every((i) => i.complete && (i.naturalWidth > 0 || !i.currentSrc)),
      null,
      { timeout: 60_000, polling: 250 },
    );
  } catch {
    const broken = await p.evaluate(() => [...document.images].filter((i) => !(i.complete && i.naturalWidth > 0)).map((i) => i.currentSrc || i.src));
    throw new Error(`images did not load: ${broken.join(', ')}`);
  }
  await p.waitForLoadState('networkidle').catch(() => {});
  // No shimmer placeholders or spinners left.
  const ready = await p
    .waitForFunction(() => ![...document.querySelectorAll('.shimmer, .spinner-border, .spinner-grow')].some((e) => e.getClientRects().length > 0), null, { timeout: 20_000, polling: 250 })
    .then(() => true, () => false);
  if (!ready) throw new Error('a placeholder or spinner is still on screen');
  await p.waitForTimeout(1500); // chart and fade-in animations
}

async function save(buf, name, width = 1600) {
  const info = await sharp(buf).resize({ width, withoutEnlargement: true }).webp({ quality: 80 }).toFile(resolve(OUT, `${name}.webp`));
  console.log(`${name}.webp ${info.width}x${info.height} ${(info.size / 1024).toFixed(0)} KB`);
}

// ---------------------------------------------------------------------------------------------------------------
// Shots
// ---------------------------------------------------------------------------------------------------------------
{
  const { ctx, page: p } = await open('/');
  await p.waitForSelector('.dashboard .cards', { timeout: 30_000 });
  await settleImages(p);
  await save(await p.screenshot(), 'app-dashboard');
  await ctx.close();
}
{
  const { ctx, page: p } = await open('/chats');
  await p.waitForSelector('app-chat-list .list li', { timeout: 30_000 });
  await p.locator('app-chat-list .list li').first().click();
  await p.waitForSelector('app-messages li', { timeout: 30_000 });
  await settleImages(p);
  await save(await p.screenshot(), 'app-inbox');
  await ctx.close();
}

await browser.close();
if (unknown.size) console.log(`unmocked GETs (answered empty): ${[...unknown].join(', ')}`);
