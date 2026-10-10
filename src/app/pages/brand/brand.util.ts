// Small, framework-free helpers for the /brand page: color math (WCAG 2.1 contrast), live token reads,
// clipboard, and a markup serializer that turns a rendered specimen back into clean copyable HTML.

export type Rgba = [number, number, number, number];

/** Parses #rgb, #rrggbb, #rrggbbaa, rgb()/rgba() in comma or space syntax (with optional "/ alpha"). */
export function parseColor(input: string): Rgba | null {
  const v = input.trim().toLowerCase();
  const hex = v.match(/^#([0-9a-f]{3,8})$/);
  if (hex) {
    let h = hex[1];
    if (h.length === 3 || h.length === 4) h = [...h].map((c) => c + c).join('');
    if (h.length !== 6 && h.length !== 8) return null;
    const n = (i: number) => parseInt(h.slice(i, i + 2), 16);
    return [n(0), n(2), n(4), h.length === 8 ? n(6) / 255 : 1];
  }
  const fn = v.match(/^rgba?\(([^)]+)\)$/);
  if (!fn) return null;
  const parts = fn[1].replace(/\//g, ' ').replace(/,/g, ' ').split(/\s+/).filter(Boolean);
  if (parts.length < 3) return null;
  const ch = (p: string) => (p.endsWith('%') ? (parseFloat(p) / 100) * 255 : parseFloat(p));
  const a = parts[3] === undefined ? 1 : parts[3].endsWith('%') ? parseFloat(parts[3]) / 100 : parseFloat(parts[3]);
  return [ch(parts[0]), ch(parts[1]), ch(parts[2]), a];
}

export function toHex([r, g, b]: Rgba): string {
  return '#' + [r, g, b].map((n) => Math.round(n).toString(16).padStart(2, '0')).join('');
}

/** Human value: "#ededed", or "#ffffff 8%" for translucent colors. */
export function describeColor(c: Rgba): string {
  return c[3] < 1 ? `${toHex(c)} ${Math.round(c[3] * 100)}%` : toHex(c);
}

/** Alpha-composites fg over an opaque bg. */
export function over(fg: Rgba, bg: Rgba): Rgba {
  const a = fg[3];
  return [fg[0] * a + bg[0] * (1 - a), fg[1] * a + bg[1] * (1 - a), fg[2] * a + bg[2] * (1 - a), 1];
}

function lum([r, g, b]: Rgba): number {
  const f = (c: number) => {
    const s = c / 255;
    return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}

export function contrast(a: Rgba, b: Rgba): number {
  const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m);
  return (x + 0.05) / (y + 0.05);
}

export type Grade = 'AAA' | 'AA' | 'AA large' | 'Fails' | 'Decorative';

export function grade(ratio: number, kind: 'text' | 'decor'): Grade {
  if (kind === 'decor') return 'Decorative';
  if (ratio >= 7) return 'AAA';
  if (ratio >= 4.5) return 'AA';
  if (ratio >= 3) return 'AA large';
  return 'Fails';
}

export const ratioLabel = (r: number) => `${(Math.floor(r * 10) / 10).toFixed(1)}:1`;

/** Reads a custom property from :root (browser only). */
export function readVar(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

/** Resolves any CSS color (incl. color-mix) to rgba through a probe element (browser only). */
export function resolveColor(value: string): Rgba | null {
  const direct = parseColor(value);
  if (direct) return direct;
  const probe = document.createElement('i');
  probe.style.color = value;
  probe.style.display = 'none';
  document.body.appendChild(probe);
  const out = parseColor(getComputedStyle(probe).color);
  probe.remove();
  return out;
}

export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    ta.remove();
    return ok;
  }
}

// ---------- Markup serializer ----------
const VOID = new Set(['input', 'img', 'br', 'hr', 'source', 'meta', 'link', 'col', 'wbr']);
const INLINE = new Set(['b', 'span', 'code', 'ng-icon', 'em', 'strong', 'i', 'small', 'kbd', 'time', 'abbr', 'svg']);
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const escAttr = (s: string) => esc(s).replace(/"/g, '&quot;');

function strip(root: Element): void {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_COMMENT);
  const dead: Node[] = [];
  while (walker.nextNode()) dead.push(walker.currentNode);
  dead.forEach((n) => n.parentNode?.removeChild(n));
  root.querySelectorAll('[data-spec-skip]').forEach((n) => n.remove());
  root.querySelectorAll('*').forEach((el) => {
    for (const a of Array.from(el.attributes)) {
      if (/^(_ng|ng-reflect|ng-version)/.test(a.name)) el.removeAttribute(a.name);
    }
    if (el.localName === 'ng-icon') {
      el.removeAttribute('style');
      el.removeAttribute('role'); // set at runtime by ng-icon
      el.innerHTML = '';
    }
    if (el.hasAttribute('routerlink')) el.removeAttribute('href'); // href is generated from routerLink
  });
}

function openTag(el: Element): string {
  const attrs = Array.from(el.attributes)
    .map((a) => {
      const name = a.name === 'routerlink' ? 'routerLink' : a.name;
      return a.value === '' ? name : `${name}="${escAttr(a.value)}"`;
    })
    .join(' ');
  return `<${el.localName}${attrs ? ' ' + attrs : ''}>`;
}

function inline(n: Node): string {
  if (n.nodeType === Node.TEXT_NODE) return esc((n.textContent ?? '').replace(/\s+/g, ' '));
  const el = n as Element;
  if (VOID.has(el.localName)) return openTag(el);
  const parts = Array.from(el.childNodes).map(inline);
  if (parts.length) {
    parts[0] = parts[0].trimStart();
    parts[parts.length - 1] = parts[parts.length - 1].trimEnd();
  }
  return openTag(el) + parts.join('') + `</${el.localName}>`;
}

function block(el: Element, depth: number): string {
  const pad = '  '.repeat(depth);
  if (VOID.has(el.localName)) return pad + openTag(el);
  const kids = Array.from(el.childNodes).filter((n) => n.nodeType === Node.ELEMENT_NODE || (n.textContent ?? '').trim());
  const allInline = kids.every((n) => n.nodeType === Node.TEXT_NODE || INLINE.has((n as Element).localName));
  if (allInline || el.localName === 'pre') return pad + inline(el).trim();
  const inner = kids.map((n) =>
    n.nodeType === Node.TEXT_NODE ? '  '.repeat(depth + 1) + esc((n.textContent ?? '').trim()) : block(n as Element, depth + 1),
  );
  return [pad + openTag(el), ...inner, `${pad}</${el.localName}>`].join('\n');
}

/** Clean, indented HTML of a rendered specimen (Angular attributes, comments and icon SVGs removed). */
export function serializeChildren(stage: HTMLElement): string {
  const clone = stage.cloneNode(true) as HTMLElement;
  strip(clone);
  return Array.from(clone.children)
    .map((c) => block(c, 0))
    .join('\n');
}
