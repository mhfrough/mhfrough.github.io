// Production-like static server for the build output, used by Lighthouse (and handy for manual checks).
//   node scripts/serve.mjs [--dist <path>] [--port 4400]
// Mirrors what GitHub Pages / Cloudflare Pages do, so Lighthouse measures the real thing rather than
// dev-server artefacts: gzip/brotli for text, clean URLs without redirects ('/hire' -> hire.html or
// hire/index.html), 404.html with a 404 status, long cache for hashed bundles, no-cache for HTML.
import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize, resolve, sep } from 'node:path';
import { pathToFileURL } from 'node:url';
import { createBrotliCompress, createGzip, constants } from 'node:zlib';
import { distArg } from './_env.mjs';

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.vtt': 'text/vtt; charset=utf-8',
};
const COMPRESSIBLE = /^(text\/|application\/(json|manifest\+json|xml)|image\/svg)/;
const HASHED = /-[A-Z0-9]{8}\.(js|css|woff2?)$/;

export function startServer(dist, port = 0, host = '127.0.0.1') {
  const root = resolve(dist);
  const find = (urlPath) => {
    const clean = normalize(decodeURIComponent(urlPath.split(/[?#]/)[0])).replace(/^[\\/]+/, '');
    const base = join(root, clean);
    if (!base.startsWith(root)) return null;
    const candidates = clean === '' || clean.endsWith(sep)
      ? [join(base, 'index.html')]
      : [base, base + '.html', join(base, 'index.html')];
    return candidates.find((p) => existsSync(p) && statSync(p).isFile()) ?? null;
  };

  const server = createServer((req, res) => {
    let file = find(req.url ?? '/');
    let status = 200;
    if (!file) {
      file = existsSync(join(root, '404.html')) ? join(root, '404.html') : null;
      status = 404;
      if (!file) return res.writeHead(404).end('Not found');
    }
    const ext = extname(file).toLowerCase();
    const type = TYPES[ext] ?? 'application/octet-stream';
    const headers = {
      'Content-Type': type,
      'X-Content-Type-Options': 'nosniff',
      'Cache-Control': ext === '.html' ? 'public, max-age=0, must-revalidate' : HASHED.test(file) ? 'public, max-age=31536000, immutable' : 'public, max-age=86400',
      Vary: 'Accept-Encoding',
    };
    const accept = String(req.headers['accept-encoding'] ?? '');
    let stream = createReadStream(file);
    if (COMPRESSIBLE.test(type)) {
      if (/\bbr\b/.test(accept)) {
        headers['Content-Encoding'] = 'br';
        stream = stream.pipe(createBrotliCompress({ params: { [constants.BROTLI_PARAM_QUALITY]: 9 } }));
      } else if (/\bgzip\b/.test(accept)) {
        headers['Content-Encoding'] = 'gzip';
        stream = stream.pipe(createGzip({ level: 9 }));
      }
    } else {
      headers['Content-Length'] = statSync(file).size;
    }
    res.writeHead(status, headers);
    if (req.method === 'HEAD') return res.end();
    stream.pipe(res);
  });
  return new Promise((ok) => server.listen(port, host, () => ok(server)));
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const i = process.argv.indexOf('--port');
  const port = i > -1 ? Number(process.argv[i + 1]) : 4400;
  // --host 0.0.0.0 to reach the build from other devices on the network.
  const h = process.argv.indexOf('--host');
  const host = h > -1 ? process.argv[h + 1] : '127.0.0.1';
  const s = await startServer(distArg(), port, host);
  console.log(`serving ${distArg()} at http://${host}:${s.address().port}`);
}
