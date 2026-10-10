// Shared helpers for scripts/*. Keeps every cache/temp/browser path on D: (C: is full).
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
export const CACHE = resolve(ROOT, '.devcache');
export const DEFAULT_DIST = resolve(ROOT, 'dist/mhfrough/browser');
export const ORIGIN = 'https://mhfrough.dev';

process.env.PLAYWRIGHT_BROWSERS_PATH ??= resolve(CACHE, 'playwright');
if (!process.env.CI) {
  // Local machine: never let tools spill temp files onto C:.
  process.env.TEMP = process.env.TMP = resolve(CACHE, 'tmp');
}
mkdirSync(resolve(CACHE, 'tmp'), { recursive: true });

/** `--dist <path>` (relative to the project root) or the default production output. */
export function distArg(argv = process.argv) {
  const i = argv.indexOf('--dist');
  return i > -1 && argv[i + 1] ? resolve(ROOT, argv[i + 1]) : DEFAULT_DIST;
}

export const hasFlag = (name, argv = process.argv) => argv.includes(name);
