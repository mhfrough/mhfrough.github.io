# mhfrough.dev

Personal brand site for **Mohammad Hamza (@mhfrough)**, software architect (Angular, NestJS, multi-tenant SaaS).
Frontend only (no backend yet). Angular 21, standalone, zoneless, signals, static prerender (SSG) of every route.
English only. Dark mode only. Deployed as static files (target: GitHub Pages or Cloudflare Pages on `mhfrough.dev`).

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

- `npx ng build --configuration development` : full build + prerender (catches SSR errors such as touching `window`).
  When several agents build at once, add `--output-path .devcache/build/<your-name>` so outputs do not collide.
- `npm run build` : production build to `dist/mhfrough/browser`. `npm run serve:dist` serves it on :4400.
- `npm start` : dev server on :4300.
- `npm run e2e` : Playwright (+ axe). `npm run lighthouse` : Lighthouse on the built site.

## Design system: Quorum, in black and white (owner decision, 2026-10-10)

The owner wants the whole site to look and feel like his Quorum product site
(`D:workspace-personalquorumindex.html`, live https://mhfrough.github.io/quorum/), re-skinned monochrome.
An earlier "mathematical blocks / tiny radius / brackets" direction was rejected as childish. **Before designing any
page, open the Quorum site (or read its index.html CSS + markup) and copy its patterns, spacing and proportions.**
Urdu was removed: English only, no /ur, no RTL work.

Quorum patterns to reuse (all already ported as global classes in `src/styles/_components.scss`):
- Floating glass pill nav (done, `src/app/layout/nav.ts`), brand mark = rounded 10px square with the ء mark.
- Hero: left column = `.pill-link` (solid tag + text + arrow), `.display` headline in two `.line` spans with the
  second line `.soft` (muted), `.lede`, then actions (`.btn .btn-solid` + `.btn .btn-ghost`) or a `.cmd` mono bar.
  Right column = a real working component in a `.card.card--lift` (like Quorum's "Build your Quorum" builder), never
  a fake screenshot. Hero sits in `.glow`. Entry motion: wrap hero in `.hero-anim`, add `.ready` in
  `afterNextRender`; use `.rise .d2 .d4` on items.
- Sections: `<section class="section">` + `.wrap`; head = `h2.title` (max 18ch) + `p.sub` (56ch); content starts
  ~44px below. Centered heads use `.center`.
- Cards: `.card` (surface, 1px line, 20px radius, 26px padding), `.card--hover` (lift 3px + shadow),
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
  `--shadow-lg`, `--glass-edge`, `--glass-hi`, `--r-card 20px`, `--r-inner 14px`, pills 999px. Never hard-code
  colors in pages; case-study themes override tokens in `src/styles/themes/`.
- Type: Geist Variable + Geist Mono Variable only. Mono for commands, metadata, numbers, small captions.
- Icons: Phosphor regular via `@ng-icons/phosphor-icons/regular` + `viewProviders: [provideIcons({...})]`.
- Motion: `.hero-anim`/`.ready`, `[mhReveal]` (+ `[revealIndex]` for 55ms stagger), transform/opacity only,
  everything gated by `prefers-reduced-motion`. Looping animations pause off-screen.
- Skeletons: `<mh-skeleton>` inside `@defer (on viewport) { } @placeholder (minimum 300ms) { }` for heavy or
  below-the-fold media; SEO text stays server-rendered.

Owner's taste (keep): restrained, polished, Quorum-level craft. Rejected: custom cursors, magnetic buttons, animated
link underlines, big footer CTA text, vertical hairline dividers in the footer, childish/decorative geometry.

### Copy rules
Zero em dashes or en dashes in visible text. No filler verbs (elevate, seamless, unleash). Facts only from
`docs/content.md` (7 years, 14+ products, 6 banking apps, 4 Angular apps...). **Never name employers** (Arittek,
Nearby Cars / Nearby Group, Malik Tech) or client banks. One label per CTA intent site-wide: portfolio "View work",
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
