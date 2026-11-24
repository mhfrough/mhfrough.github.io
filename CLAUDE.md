# mhfrough.dev

Personal brand site for **Mohammad Hamza (@mhfrough)**, software architect (Angular, NestJS, multi-tenant SaaS).
Frontend only (no backend yet). Angular 21, standalone, zoneless, signals, static prerender (SSG) of every route.
English only. Dark mode only. Deployed as static files to GitHub Pages at **https://mhfrough.github.io** (owner, 2026-11-24): `SITE.origin`,
`scripts/_env.mjs` ORIGIN and `tests/routes.ts` use it; there is no custom domain and no CNAME.

## Disk rule (C: is full)

Everything heavy lives on D: inside this repo, under `.devcache/` (git-ignored):
`.devcache/npm` (npm cache, also set in `.npmrc`), `.devcache/tmp` (TEMP/TMP), `.devcache/playwright` (browsers),
`.devcache/build/*` (scratch builds), `.devcache/preview` (stable preview, `bash .devcache/preview.sh "<ready pages>"`), `.devcache/taste` (Taste Skill source). Before running node tooling, set:

```powershell
$c="D:\workspace-personal\mhfrough.dev\.devcache"; $env:npm_config_cache="$c\npm"; $env:TEMP="$c\tmp"; $env:TMP="$c\tmp"; $env:PLAYWRIGHT_BROWSERS_PATH="$c\playwright"; $env:NG_CLI_ANALYTICS="false"
```
```bash
export C="D:/workspace-personal/mhfrough.dev/.devcache"; export npm_config_cache="$C/npm" TEMP="$C/tmp" TMP="$C/tmp" PLAYWRIGHT_BROWSERS_PATH="$C/playwright" NG_CLI_ANALYTICS=false
```

Node is 22.12, which is why we are on Angular 21 (Angular 22 needs Node >= 22.22) and Lighthouse 12.

## Commands

**Preview rule (owner, 2026-10-11):** to check changes, use the dev server on **http://localhost:4300**
(`npm start`, launch config `mhfrough-dev`; it rebuilds itself on save). Do not run extra builds or start other
preview servers just to look at a change.

- `npx ng build --configuration development` : full build + prerender (catches SSR errors such as touching `window`).
  When several agents build at once, add `--output-path .devcache/build/<your-name>` so outputs do not collide.
- `npm run build` : production build to `dist/mhfrough/browser`. `npm run serve:dist` serves it on :4400.
- `npm start` : dev server on :4300.
- `npm run about:photos` : converts `promo/about-photos/*` (gallery only, captions in `captions.json`) to WebP in
  `public/images/about/` and regenerates `src/app/pages/about/about.photos.ts`. It skips `portrait.*` on purpose.
- `npm run e2e` : Playwright (+ axe). `npm run lighthouse` : Lighthouse on the built site.

## Design system: Quorum, in black and white (owner decision, 2026-10-10)

The owner wants the whole site to look and feel like his Quorum product site
(`D:workspace-personalquorumindex.html`, live https://mhfrough.github.io/quorum/), re-skinned monochrome.
An earlier "mathematical blocks / tiny radius / brackets" direction was rejected as childish. **Before designing any
page, open the Quorum site (or read its index.html CSS + markup) and copy its patterns, spacing and proportions.**
Urdu was removed: English only, no /ur, no RTL work.

Quorum patterns to reuse (all already ported as global classes in `src/styles/_components.scss`):
- Floating glass nav (`src/app/layout/nav.ts`), now split in two pills (see the update below).
- Hero: left column = `.pill-link` (solid tag + text + arrow), `.display` headline in two `.line` spans with the
  second line `.soft` (muted), `.lede`, then actions (`.btn .btn-solid` + `.btn .btn-ghost`) or a `.cmd` mono bar.
  Right column = a real working component in a `.card.card--lift` (like Quorum's "Build your Quorum" builder), never
  a fake screenshot. Hero sits in `.glow`. Entry motion: wrap hero in `.hero-anim`, add `.ready` in
  `afterNextRender`; use `.rise .d2 .d4` on items.
- Sections: `<section class="section">` + `.wrap`; head = `h2.title` (max 18ch) + `p.sub` (56ch); content starts
  ~44px below. Centered heads use `.center`.
- Cards: `.card` (surface, 1px line, 16px radius, 22px padding), `.card--hover` (lift 3px + shadow),
  `.card--solid` (inverted featured cell), `.card--lift` (shadow-lg). Bento grids like Quorum's "seven" (3 columns,
  `.wide` spans 2, mixed solid/plain cells). Sticky split like Quorum's "How a council runs" (left sticky head,
  right stacked `.card` items with `.icon-well`). Paired rows like Quorum's "tensions". Reels row (`.reels .reel
  .reel-media`). One `.marquee` max per page.
- Pills: `.chip` (aria-pressed toggles), `.badge`, `.tag` (mono badge), `.seg` segmented tabs, `.copy` button on
  dark blocks, `.code` block, `.cmd` bar, `.icon-btn`, `.icon-tile`.
- Forms: pill `.input`/`.select` (46px), `.textarea` (14px radius), `.field` + `.field__label` above,
  `.field__hint`, `.field__error` below, `.check`.
- Tokens (`src/styles/_tokens.scss`): `--bg #111`, `--surface #1a1a1a`, `--surface-2 #222`, `--ink #ededed`,
  `--ink-2`, `--muted`, `--line`, `--accent` (= ink), `--accent-soft`, `--solid`, `--cta`, `--shadow`,
  `--shadow-lg`, `--glass-edge`, `--glass-hi`, `--r-card 16px`, `--r-inner 12px`, pills 999px. Never hard-code
  colors in pages; case-study themes override tokens in `src/styles/themes/`.
- Type: Geist Variable + Geist Mono Variable only. Mono for commands, metadata, numbers, small captions.
- Icons: Phosphor regular via `@ng-icons/phosphor-icons/regular` + `viewProviders: [provideIcons({...})]`.
- Motion: `.hero-anim`/`.ready`, `[mhReveal]` (+ `[revealIndex]` for 55ms stagger), transform/opacity only,
  everything gated by `prefers-reduced-motion`. Looping animations pause off-screen.
- Skeletons: `<mh-skeleton>` inside `@defer (on viewport) { } @placeholder (minimum 300ms) { }` for heavy or
  below-the-fold media; SEO text stays server-rendered.

**Update 2026-10-10 (owner): "too bulky, an exact copy of Quorum".** Quorum is the starting point, not a template.
Keep its craft, but the site now has its own, more compact identity:
- Compact scale: `.section` 88px, `.display` max ~3.35rem, `.title` max ~2.25rem, `--r-card 16px`, `--r-inner 12px`,
  card padding 22px, `--nav-h 52px`. Do not scale these back up.
- Nav is two separate glass pills: left = round ء tile + "mhfrough"; right = links, GitHub, "Hire me", menu.
- Geometric background art: `<mh-pattern>` (`src/app/shared/ui/pattern.ts`), a Truchet field of the logo's quarter
  arc that ripples and brightens near the pointer. Used behind the home hero, the home contact band, /hire and
  /contact heads. Not on legal pages.
- Availability always shows as `.status-pill` + `.blip.is-on` (sonar ring).
- Section heads are split (`.split-head` on home: title left, sub or action right); lists run horizontally (numbers
  band, process rail, offer cards). Avoid Quorum's centred heads, sticky "how" split and install panels.
- Footer is two short rows (identity + status + social icons; then copyright, Karachi time, Privacy, Back to top).
  No link columns. Other legal pages are linked from the end of each legal page.
- Legal pages: one narrow column, small type, no sidebar/TOC.
- Cookie notice (`src/app/layout/cookie-notice.ts`): befiler.com layout in this theme. The site sets no cookies, so
  it informs ("Got it"), never fake Accept/Decline. Closing stores `mh:cookie-notice` in localStorage (documented
  on /cookies). If analytics are ever added, turn it into a real consent banner first.

Owner's taste (keep): restrained, polished, Quorum-level craft. Rejected: custom cursors, magnetic buttons, animated
link underlines, big footer CTA text, vertical hairline dividers in the footer, childish/decorative geometry.

### No photos of the owner (owner, 2026-10-11)
Never show a photo of Mohammad Hamza anywhere: not in the nav, avatar, About, home, /brand, OG images or JSON-LD.
The ء mark on its tile stands in wherever a person image would go. The nav "identity loop" (mark to portrait) and
the blue duotone portrait treatment were removed; do not bring them back. /brand documents **mhfrough's own
system** in black and white: never describe it as "Quorum's system" or "ported from Quorum" on the page.

### Project icons: favicon first (owner, 2026-10-11)
Wherever a project gets an icon (home bento, home work explorer, /work cards, and any new place that lists
projects), use the product's own favicon/mark if we have one, else a Phosphor icon. Data: `favicon?: string` next
to `icon` in `home.data.ts` / `work.data.ts`; markup: `.icon-tile.icon-tile--fav > img` (light tile, image contained).
Current favicons: Little Surprises `little-surprises/little-surprises-mark.webp`, Jot `jot/jot-mark.svg`, Quorum `/images/quorum/favicon.svg`, Befiler `befiler/befiler-icon.webp`, Emlaak
`emlaak/emlaak-mark.webp`, Bloomstone `bloomstone/bloomstone-mark.webp`, KPMC `kpmc/kpmc-logo.webp`,
Asaan Hisab `asaan-hisab/asaan-hisab-mark.webp`, Finclore `finclore/finclore-mark.svg` (owner drew the Finclore logo),
Arittek `arittek/arittek-mark.svg`, O2Chat `o2chat/o2chat-mark.webp`, DMAX `dmax/dmax-mark.webp`, ePractise
`epractise/epractise-mark.webp`, LLC SAVVY `llcsavvy/llcsavvy-mark.webp`, TMF `tmf/tmf-mark.webp`, EthicalNode
`ethical-node/ethical-node-mark.webp`. Multi-brand
projects (Pizzerias, SOS24 + AK Heating) keep a Phosphor icon. New case study with a favicon: save it under
`public/images/<page>/` and set `favicon` in both data files.

### Copy rules
Zero em dashes or en dashes in visible text. No filler verbs (elevate, seamless, unleash). Facts only from
`docs/content.md` (since 2020, 7+ years, 30+ products, 6 banking apps, 4 Angular apps...). Experience reads "Since 2020, 7+ years"
(owner, 2026-10-13); never a bare "7 years". Products are 30+. No big-digit stat bands. Visible text spells the city **Karāchi** (owner, 2026-10-13); machine fields keep `Karachi` (Asia/Karachi, JSON-LD addressLocality via `SITE.locality`, SEO keywords, the KIET official name). Use `SITE.localityLabel` for display. **Never name employers** (Arittek,
Nearby Cars / Nearby Group, Malik Tech) or client banks. Exception (owner, 2026-10-10): the /work/befiler case study names Befiler
and its partner banks and shows their logos, as befiler.com does publicly. The employer behind it stays unnamed.
Exception (owner, 2026-10-11): /work/arittek names Arittek as the client of its own company site and shows its
logo and public pages. Never call Arittek an employer there, never link it next to Befiler, Finclore or Asaan Hisab
(their "Next" links avoid it), and keep it unnamed everywhere else, except Zingoo (owner, 2026-11-24): the Zingoo
ERP card on /work reads "Built with Arittek"; its food-maker client stays unnamed.
Named products (owner, 2026-10-11), each on its own case study: O2Chat, DMAX, ePractise, LLC SAVVY, Asaan Hisab,
Finclore, EthicalNode, and the client Thardeep Microfinance Foundation (TMF, /work/tmf). Never name the employer behind
them; DMAX's client banks and the core banking vendor stay unnamed. Live epractise.com and asaanhisab.com pages carry
the employer's name: screenshots hide or blur it. Marfiz was dropped (repo is other agencies' cloned content).
Screenshot scripts wait for every image to load before capturing (`settleImages` in scripts/asaan-hisab-shots.mjs).
Case studies show only public marketing sites as screenshots; product apps appear as my own mockups. One label per CTA intent site-wide: portfolio "View work",
hire info "Hire me", contact "Get in touch", form submit "Send message".

### Engineering rules
- Standalone components, OnPush, signals, `input()`, new control flow. Copy in plain `const` objects (no i18n).
  Plain router paths (`routerLink="/hire"`). Do not import from `core/i18n` (deprecated shim, to be deleted).
- SEO: every page calls `inject(Seo).set({ title, description, path, breadcrumbs?, image?, jsonLd? })` in its
  constructor. Import `PERSON_ID`, `abs` from `core/seo/seo.service`. OG images live in `public/og/`.
- SSR safety: `window`/`document`/canvas only inside `afterNextRender` or `@defer`.
- Images WebP/SVG with width/height, lazy below the fold, `fetchpriority="high"` on the LCP image.
- a11y WCAG 2.1 AA: one h1, heading order, focus visible, labels above inputs, errors linked with
  `aria-describedby`, 44px targets.

## File ownership (parallel agents)

- Foundation (do not edit unless you own it): `src/styles/*`, `src/app/core/**`, `src/app/shared/**`,
  `src/app/layout/**`, `src/app/app*.ts`, `angular.json`, `package.json`.
  Need something shared? Build it inside your page folder and note it in your report.
- Pages: `src/app/pages/<page>/**`. Assets: `public/**` subfolders named after your page.

## Content source

Owner's CV (5 pages) summarized in `docs/content.md`. Quorum reference project: `D:\workspace-personal\quorum`
(live at https://mhfrough.github.io/quorum/, repo https://github.com/mhfrough/quorum).

## Little Surprises, role and hero (owner, 2026-11-24)

- **Little Surprises** (https://littlesurprises.shop, repo `D:\workspace-personal\littlesurprises.shop`) is the owner's
  startup, run with his wife (never name her). It is the featured project in Quorum's old place: the /work featured
  card (`FEATURED` in `work.data.ts`), the home bento feature cell and the home hero card. Case study:
  `/work/little-surprises` (screens from `scripts/little-surprises-shots.mjs`, OG from `little-surprises-og.mjs`).
  The old Gift Wrap thesis build was its first version; `/work/gift-wrap` was removed for good.
- Originals ("private by default") on /work, in `TOOL_ORDER`: Quorum, Jot, Flick, Pinch, Scrawl, Sizzle, Swoop.
  Jot has no case study yet; its tile links to https://mhfrough.github.io/jot/.
- Role: **Software Architect and Lead Developer, AI-first with agentic workflows** (`SITE.role`). He is no longer a
  frontend lead; never write "lead frontend developer" for the present (Befiler's history may still say it).
- Home hero right column is `mh-hero-card` (`src/app/pages/home/hero-card.ts`): identity + Karāchi clock, "Now
  building" Little Surprises, three roles, a still dock of Originals. The owner rejected the rotating 5-project
  shelf: no carousels or auto-rotation in the hero.

