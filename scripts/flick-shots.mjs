// Screenshots of the owner's Flick app (https://mhfrough.github.io/flick/) for the /work/flick case study.
//   node scripts/flick-shots.mjs [--base https://mhfrough.github.io/flick/]
// Two real browser contexts, a laptop and a phone, open Flick and find each other the way people do: through the
// public MQTT brokers, then a direct WebRTC data channel. The public IP lookup (ipify / icanhazip) is answered with an
// address from the documentation range 203.0.113.0/24, so both contexts meet in a private, throwaway room and no real
// address is used (Flick never displays it anyway). Device names are seeded through the app's own localStorage key
// ('flick.name') from its own word lists, so the shots are repeatable. Files are generated in memory.
// Output: public/images/flick/*.webp (quality 80): desktop shots at 1600 and 800 wide, phone shots at 600 wide.
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import sharp from 'sharp';
import { ROOT } from './_env.mjs';

const { chromium } = await import('playwright');
const OUT = resolve(ROOT, 'public/images/flick');
mkdirSync(OUT, { recursive: true });
const argBase = process.argv.indexOf('--base');
const BASE = argBase > -1 ? process.argv[argBase + 1] : 'https://mhfrough.github.io/flick/';

// A fresh documentation-range address per run, so leftover tabs from an earlier run never join the room.
const FAKE_IP = `203.0.113.${10 + Math.floor(Math.random() * 230)}`;

const IPHONE_UA =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1';

const browser = await chromium.launch({
  // Two contexts in one headless browser reach each other over host candidates; mDNS names would not resolve here.
  args: ['--disable-features=WebRtcHideLocalIpsWithMdns'],
});

async function device({ name, viewport, ua, mobile = false, scale = 1.25 }) {
  const ctx = await browser.newContext({
    viewport,
    deviceScaleFactor: scale,
    isMobile: mobile,
    hasTouch: mobile,
    userAgent: ua,
    colorScheme: 'dark',
    reducedMotion: 'reduce',
  });
  await ctx.route(/api\.ipify\.org/, (r) => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ip: FAKE_IP }) }));
  await ctx.route(/icanhazip\.com/, (r) => r.fulfill({ status: 200, contentType: 'text/plain', body: FAKE_IP }));
  await ctx.addInitScript((n) => {
    try {
      localStorage.setItem('flick.name', n);
      localStorage.setItem('flick-theme', 'dark');
    } catch {}
  }, name);
  const page = await ctx.newPage();
  page.on('pageerror', (e) => console.log(`[${name}] pageerror:`, e.message.slice(0, 200)));
  await page.goto(BASE, { waitUntil: 'networkidle', timeout: 120_000 });
  await settleImages(page);
  return { ctx, page };
}

// Waits until fonts and every image have loaded, so no shot is saved half-drawn.
async function settleImages(p) {
  await p.evaluate(() => document.fonts.ready);
  await p.waitForFunction(() => [...document.images].every((i) => i.complete && (i.naturalWidth > 0 || !i.currentSrc)), null, {
    timeout: 60_000,
    polling: 250,
  });
  await p.waitForTimeout(600);
}

/** Saves one shot `width` wide, plus a half-width `<name>-<half>.webp` for srcset when `half` is set. */
async function save(buf, name, width, half = false) {
  const sizes = half ? [[name, width], [`${name}-${width / 2}`, width / 2]] : [[name, width]];
  for (const [file, w] of sizes) {
    const info = await sharp(buf).resize({ width: w, withoutEnlargement: true }).webp({ quality: 80 }).toFile(resolve(OUT, `${file}.webp`));
    console.log(`${file}.webp ${info.width}x${info.height} ${(info.size / 1024).toFixed(0)} KB`);
  }
}

const file = (name, mimeType, kb) => ({ name, mimeType, buffer: Buffer.alloc(kb * 1024, 7) });
const peerTile = (page, peerName) => page.locator('article.peer', { has: page.locator('.peer-name', { hasText: peerName }) });

// A real photo-like JPEG (a dusk gradient with a horizon), so the receiver's inbox can show its own thumbnail.
const photo = await sharp(
  Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="2400" height="1600">
    <defs><linearGradient id="s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#28324a"/><stop offset=".55" stop-color="#c7785a"/><stop offset=".62" stop-color="#e9b77a"/><stop offset="1" stop-color="#1d2420"/></linearGradient></defs>
    <rect width="2400" height="1600" fill="url(#s)"/><circle cx="1560" cy="930" r="120" fill="#f6d39a" opacity=".9"/>
    <path d="M0 1010 L380 900 L760 990 L1180 860 L1640 980 L2050 890 L2400 960 L2400 1600 L0 1600 Z" fill="#141a17"/></svg>`),
)
  .jpeg({ quality: 92 })
  .toBuffer();

// Waits until no toast is showing, so it never covers a shot.
const noToast = (p) => p.waitForFunction(() => !document.querySelector('#toast.is-shown'), null, { timeout: 15_000 });

const laptop = await device({ name: 'Brisk Otter', viewport: { width: 1440, height: 900 } });
const phone = await device({ name: 'Calm Heron', viewport: { width: 390, height: 844 }, ua: IPHONE_UA, mobile: true, scale: 2 });

console.log(`room: ${FAKE_IP} (documentation range), waiting for the two devices to meet...`);
await peerTile(laptop.page, 'Calm Heron').waitFor({ timeout: 90_000 });
await peerTile(phone.page, 'Brisk Otter').waitFor({ timeout: 90_000 });
await laptop.page.waitForTimeout(800);

// 1. Laptop shares a link and a file with everyone nearby.
await laptop.page.fill('#shareText', 'Slides for Thursday: https://mhfrough.github.io/flick/');
await laptop.page.setInputFiles('#sharePicker', [file('venue-map.pdf', 'application/pdf', 1840)]);
await laptop.page.click('#shareSubmit');

// 2. Phone sends one photo and a note to the laptop only.
const tileOnPhone = peerTile(phone.page, 'Brisk Otter');
await tileOnPhone.locator('input[type=file]').setInputFiles([{ name: 'IMG_2041.jpg', mimeType: 'image/jpeg', buffer: photo }]);
await tileOnPhone.getByRole('button', { name: 'Send text' }).click();
await tileOnPhone.locator('textarea').fill('Door code is on the second page.');
await tileOnPhone.getByRole('button', { name: 'Send', exact: true }).click();

await laptop.page.locator('#inboxList .item').nth(1).waitFor({ timeout: 30_000 });
await phone.page.locator('#inboxList .item').nth(1).waitFor({ timeout: 30_000 });
await laptop.page.mouse.move(4, 600);
await noToast(laptop.page);
await laptop.page.evaluate(() => window.scrollTo(0, 0));
await laptop.page.waitForTimeout(500);
await save(await laptop.page.screenshot(), 'app', 1600, true);

// 3. The phone: its own name and status at the top; then the laptop's tile and its inbox.
await noToast(phone.page);
await phone.page.evaluate(() => window.scrollTo(0, 0));
await phone.page.waitForTimeout(500);
await save(await phone.page.screenshot(), 'phone', 600);
await phone.page.evaluate(() => {
  const r = document.querySelector('.nearby').getBoundingClientRect();
  window.scrollTo(0, window.scrollY + r.top - 24);
});
await phone.page.waitForTimeout(500);
await save(await phone.page.screenshot(), 'phone-inbox', 600);

// 4. Laptop accepts the photo: it travels over the data channel and lands ready to save, with a thumbnail.
//    The phone downloads the shared PDF too, so the laptop's board reports who has it.
const photoItem = laptop.page.locator('#inboxList .item', { hasText: 'IMG_2041.jpg' });
await photoItem.getByRole('button', { name: 'Accept' }).click();
await photoItem.getByRole('link', { name: 'Save' }).waitFor({ timeout: 60_000 });
const pdfOnPhone = phone.page.locator('#inboxList .item', { hasText: 'venue-map.pdf' });
await pdfOnPhone.getByRole('button', { name: 'Download' }).click();
await pdfOnPhone.getByRole('link', { name: 'Save' }).waitFor({ timeout: 60_000 });
await noToast(laptop.page);
await laptop.page.evaluate(() => {
  const r = document.querySelector('.everyone').getBoundingClientRect();
  window.scrollTo(0, window.scrollY + r.top - 40);
});
await laptop.page.waitForTimeout(800);
await save(await laptop.page.screenshot(), 'transfer', 1600, true);

// 5. The private link sheet with its QR code, for devices on another network.
await laptop.page.evaluate(() => window.scrollTo(0, 0));
await laptop.page.click('#linkBtn');
await laptop.page.locator('#qrBox svg').waitFor({ timeout: 20_000 });
await laptop.page.waitForTimeout(600);
await save(await laptop.page.screenshot(), 'link', 1600, true);

await laptop.ctx.close();
await phone.ctx.close();
await browser.close();
