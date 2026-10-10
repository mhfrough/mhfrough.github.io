# Deploying mhfrough.dev

The site is fully static: `npm run build` prerenders every route to `dist/mhfrough/browser` and then runs
`scripts/postbuild.mjs`, which adds what static hosts need:

| Output | Why |
| --- | --- |
| `404.html` | copy of `404/index.html`; both hosts serve it for unknown URLs |
| `<route>.html` (e.g. `hire.html`, `work/quorum.html`) | canonical URLs have no trailing slash (`/hire`). With the flat copy both hosts answer `/hire` with 200 instead of a 301 to `/hire/`. Disable with `--no-flat`. |
| `CNAME`, `.nojekyll` | GitHub Pages custom domain; skip Jekyll processing |
| `sitemap.xml` | every indexable page (404 and `noindex` pages skipped), lastmod = build date |
| `_headers` | security + cache headers; the CSP `script-src` gets the sha256 of Angular's inline scripts filled in |

Always deploy the output of `npm run build`, never a bare `ng build`: without postbuild there is no 404 page,
no sitemap, and `_headers` still holds the `__INLINE_SCRIPT_HASHES__` placeholder.

Quality gates before a deploy: `npm run check:seo` (strict SEO sanity check), `npm run e2e`,
`npm run lighthouse:assert`, or all of it with `npm run qa`.

## Option A: Cloudflare Pages (recommended)

Why: honours `_headers` (CSP, HSTS, immutable caching for hashed bundles), Brotli, HTTP/3, fast edge in South
Asia and Europe, free, and Cloudflare Email Routing can forward `hello@mhfrough.dev`.

1. Cloudflare dashboard, Workers and Pages, Create, Pages, Connect to Git, pick the repo.
2. Build settings:
   - Framework preset: None
   - Build command: `npm run build`
   - Build output directory: `dist/mhfrough/browser`
   - Environment variables: `NODE_VERSION=22`, `NG_CLI_ANALYTICS=false`
   - Note: `.npmrc` sets a Windows npm cache path for local dev. If the build complains, add
     `NPM_CONFIG_CACHE=/opt/buildhome/.npm` as an environment variable.
3. Custom domains: add `mhfrough.dev` and `www.mhfrough.dev`. If the domain's DNS is on Cloudflare the records
   are created for you (CNAME flattening at the apex). Add a redirect rule `www.mhfrough.dev/*` to
   `https://mhfrough.dev/$1` (301) so there is one canonical host.
4. SSL/TLS: Full (strict), Always Use HTTPS on, minimum TLS 1.2. HSTS is already sent by `_headers`; only enable
   preload after a few weeks of clean HTTPS.
5. Turn off Cloudflare "Rocket Loader" and "Auto Minify" (they rewrite inline scripts and break the CSP hashes).

`public/_headers` (copied to the output) sets, for every path: `X-Content-Type-Options: nosniff`,
`Referrer-Policy`, `X-Frame-Options: DENY`, `Cross-Origin-Opener-Policy`, `Permissions-Policy`, HSTS and this CSP:

```
default-src 'self'; script-src 'self' <sha256 of inline scripts> 'unsafe-hashes' <sha256 of onload handler>;
style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self';
media-src 'self' https://mhfrough.github.io; connect-src 'self'; frame-src 'none'; object-src 'none';
base-uri 'self'; form-action 'self'; frame-ancestors 'none'; manifest-src 'self'; upgrade-insecure-requests
```

- No `unsafe-eval`, no inline script without a hash. The hashes cover Angular's event-replay contract,
  the per-page `__jsaction_bootstrap(...)` call and the critical-CSS `onload="this.media='all'"` handler; they
  are recomputed on every build. `tests/csp.spec.ts` applies the generated policy in Chromium and fails on any
  violation.
- `style-src 'unsafe-inline'` is required: Angular injects component styles as `<style>` elements at runtime.
- JSON-LD `<script type="application/ld+json">` is data, not executed, so it needs no hash.
- If a page starts posting a form to a third party (e.g. Formspree), add that origin to `connect-src` and/or
  `form-action` in `public/_headers`.

Caching: `*.js`, `*.css` and `media/*.woff2` are content-hashed by Angular, so they get
`max-age=31536000, immutable`. `images/`, `icons/`, `og/`, favicons get one day plus stale-while-revalidate
(their names are not hashed: rename a file when you replace it, or accept up to a day of staleness).
HTML is left at the host default (`max-age=0, must-revalidate`), so a deploy is live immediately.

## Option B: GitHub Pages

`.github/workflows/deploy.yml` builds on every push to `main` and publishes with `actions/deploy-pages`.

1. Repo Settings, Pages, Source: **GitHub Actions**.
2. Settings, Pages, Custom domain: `mhfrough.dev`, then tick **Enforce HTTPS** once the certificate is issued.
   `CNAME` is already in the build output, so the domain survives every deploy.
3. DNS at your registrar:
   - Apex `mhfrough.dev`, four `A` records: `185.199.108.153`, `185.199.109.153`, `185.199.110.153`,
     `185.199.111.153`
   - Optional IPv6 `AAAA`: `2606:50c0:8000::153`, `2606:50c0:8001::153`, `2606:50c0:8002::153`,
     `2606:50c0:8003::153`
   - `www` `CNAME` to `mhfrough.github.io` (GitHub redirects www to the apex)
   - Verify the domain under your GitHub account (Settings, Pages, Verified domains) to prevent takeover.
4. `.dev` is on the HSTS preload list, so the site only works over HTTPS: wait for the certificate before
   announcing the URL.

Limits of GitHub Pages: **it ignores `_headers`** (the file is simply served as a static file, harmless). So there
is no CSP, HSTS header, `X-Frame-Options` or custom caching: every asset gets `Cache-Control: max-age=600`.
Hashed bundles still work correctly, they are just re-validated more often. If you need the headers, put
Cloudflare (proxied DNS) in front of GitHub Pages and recreate the rules as Transform Rules, or use Option A.

## Recommendation

Cloudflare Pages on `mhfrough.dev`, with GitHub Actions CI (`.github/workflows/ci.yml`) as the gate on pull
requests. Keep `deploy.yml` only if you choose GitHub Pages; with Cloudflare Pages connected to the repo,
disable or delete it so there is one source of truth.

## Checks after the first deploy

- `https://mhfrough.dev/hire` returns 200 (no redirect), `https://mhfrough.dev/nope` returns the 404 page.
- `curl -sI https://mhfrough.dev/ | grep -i content-security` shows the hashes (Cloudflare only).
- Submit `https://mhfrough.dev/sitemap.xml` in Google Search Console and Bing Webmaster Tools.
- Share-preview a page in the LinkedIn Post Inspector and the opengraph.xyz checker (`/og/*.jpg`, 1200 x 630).
- Run `npm run lighthouse` against production by pointing a browser Lighthouse run at the live URL.
