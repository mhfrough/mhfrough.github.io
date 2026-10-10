# mhfrough.dev

Personal brand site for **Mohammad Hamza (@mhfrough)**, software architect (Angular, NestJS, multi-tenant SaaS).
Frontend only (no backend yet). Angular 21, standalone, zoneless, signals, static prerender (SSG) of every route in two
languages. Dark mode only. Deployed as static files (target: GitHub Pages or Cloudflare Pages on `mhfrough.dev`).

## Disk rule (C: is full)

Everything heavy lives on D: inside this repo, under `.devcache/` (git-ignored):
`.devcache/npm` (npm cache, also set in `.npmrc`), `.devcache/tmp` (TEMP/TMP), `.devcache/playwright` (browsers),
`.devcache/build/*` (scratch builds), `.devcache/taste` (Taste Skill source). Before running node tooling, set:

```powershell
$c="D:\workspace-personal\mhfrough.dev\.devcache"; $env:npm_config_cache="$c\npm"; $env:TEMP="$c\tmp"; $env:TMP="$c\tmp"; $env:PLAYWRIGHT_BROWSERS_PATH="$c\playwright"; $env:NG_CLI_ANALYTICS="false"
```
```bash
export C="D:/workspace-personal/mhfrough.dev/.devcache" npm_config_cache="$C/npm" TEMP="$C/tmp" TMP="$C/tmp" PLAYWRIGHT_BROWSERS_PATH="$C/playwright" NG_CLI_ANALYTICS=false
```

Node is 22.12, which is why we are on Angular 21 (Angular 22 needs Node >= 22.22) and Lighthouse 12.

## Commands

- `npx ng build --configuration development` : full build + prerender (catches SSR errors such as touching `window`).
  When several agents build at once, add `--output-path .devcache/build/<your-name>` so outputs do not collide.
- `npm run build` : production build to `dist/mhfrough/browser`. `npm run serve:dist` serves it on :4400.
- `npm start` : dev server on :4300.
- `npm run e2e` : Playwright (+ axe). `npm run lighthouse` : Lighthouse on the built site.

## Design read (Taste Skill, `.devcache/taste/repo/skills/taste-skill/SKILL.md`)

Reading this as: **developer + designer portfolio for hiring managers and freelance clients, with a monochrome,
mathematical / geometric language, leaning toward native CSS in Angular (no UI kit), Geist + JetBrains Mono, restrained
content-level motion.** Dials: `DESIGN_VARIANCE 7`, `MOTION_INTENSITY 5`, `VISUAL_DENSITY 4`.

### Brand rules (hard)

- **Dark only, monochrome.** No accent hue. CTAs invert (ink fill, bg text). Use only tokens from
  `src/styles/_tokens.scss`. Never hard-code hex in components (case-study themes are the only exception and live in
  `src/styles/themes/`).
- **Small radius:** `--r-1` 2px (tags, inputs), `--r-2` 4px (buttons, cards, nav, media). Avatar is the one circle.
- **Type:** Geist for text and headings, JetBrains Mono for metadata, numbers, handles, code, labels. Urdu uses
  Noto Nastaliq Urdu automatically via `:root[lang='ur']`. Emphasis = weight or italic of the same family, never a serif.
- **Math / geometry motif, used with intent:** matrix brackets, function notation `f(x)`, set notation, axes with ticks,
  the end-of-proof mark `∎` (`.qed`), compass-and-straightedge construction lines, the ء mark's own geometry.
  Lines and grids must organize real content, never decorate empty space.
- **Logo:** `mh-logo` (`src/app/shared/ui/logo.ts`). The ء is a 225 degree arc landing on a bar on a 48 grid. Never
  redraw it.
- **Global primitives** in `src/styles/_components.scss`: `.container .section .page-head .display .h1 .h2 .h3 .lede
  .body .muted .mono .label .math .qed .link .btn(.btn--primary|--ghost|--quiet|--sm) .icon-btn .tag .tag-list .block
  .block--ticks .field .field__label .field__hint .field__error .input .select .textarea .check .skeleton .sr-only`.
  Use them. Do not restyle them per page.
- **Icons:** Phosphor only, via `@ng-icons/phosphor-icons/regular` + `viewProviders: [provideIcons({...})]`. Never
  hand-draw icon SVG paths.
- **Motion:** content only. `mhReveal` directive (`src/app/shared/directives/reveal.directive.ts`) for scroll
  reveals, `.rise > span` for masked headline lines, `.fade-in`. Only `transform`/`opacity`. Everything gated by
  `prefers-reduced-motion`. No `window` scroll listeners (IntersectionObserver or CSS scroll timelines only).
- **Owner's taste (learned, keep):** liked generative glyph-field hero canvas (`·` `+` `ء`), masked title rises,
  scroll staggers, a single tech marquee, hover project previews, the Karachi local-time line, the footer availability
  link. **Rejected:** custom cursors, magnetic buttons, animated link underlines, big footer CTA text, vertical hairline
  dividers in the footer.
- **Copy:** zero em dashes or en dashes anywhere visible (use `-`, commas, colons, periods). No filler verbs (elevate,
  seamless, unleash, next-gen). No fake numbers: only facts from the CV (7 years, 14+ products, 6 banking apps, etc.).
  Max one small uppercase eyebrow per three sections. No section numbering labels (`01 /`), no scroll cues, no version
  stamps, no decorative status dots (the footer availability mark is the one semantic exception).
- **Never name employers** (no Arittek, Nearby Cars/Nearby Group, Malik Tech). Describe work by domain and scale
  ("tax-filing platform embedded in 6 banking apps"). Do not name client banks either.
- **One label per CTA intent across the whole site:** portfolio = "View work", hire info = "Hire me", contact =
  "Get in touch", form submit = "Send message".

### Engineering rules

- Standalone components, `ChangeDetectionStrategy.OnPush`, signals, `input()`/`output()`, new control flow
  (`@if/@for/@defer`). Inline templates/styles are fine; split into `.html/.scss` files when a page is large.
- **i18n:** all visible strings live in a `Copy<T>` object (`{ en, ur }`) next to the page, read via
  `inject(I18n).select(COPY)`. Links use the `loc` pipe: `[routerLink]="'/hire' | loc"`. Latin tech terms inside Urdu
  stay Latin (wrap in `<span lang="en" dir="ltr">` or use `.tag`). Use logical CSS properties
  (`margin-inline-start`, `inset-inline-end`, `padding-block`) so RTL mirrors without extra CSS.
- **SEO:** every page calls `inject(Seo).set({...})` in its constructor with localized title/description, `path`
  (language-less), optional `breadcrumbs`, `image`, and extra `jsonLd` nodes.
- **SSR safety:** pages are prerendered in Node. Touch `window`, `document`, `matchMedia`, canvas only inside
  `afterNextRender` or `@defer`. 
- **Skeletons:** heavy or below-the-fold media/interactive parts use
  `@defer (on viewport) { ... } @placeholder (minimum 300ms) { <mh-skeleton ... /> }`. Content that matters for SEO
  must stay server-rendered (plain markup, or `@defer (hydrate on viewport)`).
- **Images:** WebP or SVG, explicit `width`/`height`, `loading="lazy"` + `decoding="async"` below the fold,
  `fetchpriority="high"` for the LCP image. Put files under `public/images/...`. Convert with sharp
  (`node_modules/sharp`). Videos: `preload="none"`, poster WebP, captions `<track>`.
- **a11y:** WCAG 2.1 AA. Landmarks, one `h1` per page, heading order, visible focus, labels above inputs, error text
  below inputs linked by `aria-describedby`, 44px targets, `aria-current` on active nav.

## File ownership (parallel agents)

- Foundation (do not edit unless you own it): `src/styles/*`, `src/app/core/**`, `src/app/shared/**`,
  `src/app/layout/**`, `src/app/app*.ts`, `angular.json`, `package.json`.
  Need something shared? Build it inside your page folder and note it in your report.
- Pages: `src/app/pages/<page>/**`. Assets: `public/**` subfolders named after your page.

## Content source

Owner's CV (5 pages) summarized in `docs/content.md`. Quorum reference project: `D:\workspace-personal\quorum`
(live at https://mhfrough.github.io/quorum/, repo https://github.com/mhfrough/quorum).
