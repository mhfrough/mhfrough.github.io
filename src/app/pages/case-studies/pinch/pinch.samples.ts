// Pinch's four sample photos and the sizes Pinch measured on them with its own engine (Pinch.process in Chromium),
// copied from the Pinch source: site.js (DATA), app.js (PRESETS), engine.js (bytes, fitTarget) and
// promo/pinch-reel-script.md. Photos: Unsplash, via picsum.photos (Paul Jarvis: valley, lake; John Maravelakis:
// harbour; Forrest Cavale: hills), 2400 x 1600, plus the 1200 px copies Pinch serves for its own previews.

export interface Sample {
  id: 'valley' | 'harbour' | 'lake' | 'hills';
  name: string;
  /** 1200 x 800 copy, used by the live compare. */
  small: string;
  smallBytes: number;
  /** The 2400 x 1600 original Pinch ships. */
  full: string;
  fullBytes: number;
  credit: string;
}

export const SAMPLES: Sample[] = [
  { id: 'valley', name: 'Valley', small: '/images/pinch/samples/valley-1200.jpg', smallBytes: 126866, full: '/images/pinch/samples/valley.jpg', fullBytes: 361245, credit: 'Paul Jarvis' },
  { id: 'harbour', name: 'Harbour', small: '/images/pinch/samples/harbour-1200.jpg', smallBytes: 104278, full: '/images/pinch/samples/harbour.jpg', fullBytes: 438266, credit: 'John Maravelakis' },
  { id: 'lake', name: 'Lake', small: '/images/pinch/samples/lake-1200.jpg', smallBytes: 90544, full: '/images/pinch/samples/lake.jpg', fullBytes: 299315, credit: 'Paul Jarvis' },
  { id: 'hills', name: 'Hills', small: '/images/pinch/samples/hills-1200.jpg', smallBytes: 166261, full: '/images/pinch/samples/hills.jpg', fullBytes: 591976, credit: 'Forrest Cavale' },
];

/** Bytes, measured by Pinch's own engine on the samples (site.js DATA). */
export const MEASURED = {
  // valley.jpg saved as WebP at each quality
  quality: [
    [40, 108954], [45, 121858], [50, 132704], [55, 142748], [60, 156340], [65, 172342],
    [70, 188962], [75, 202434], [80, 261624], [85, 323156], [90, 440886], [95, 662662],
  ] as [number, number][],
  // harbour.jpg saved at quality 75 (PNG is lossless)
  formats: [
    { id: 'avif', label: 'AVIF', codec: 'libavif', bytes: 200905 },
    { id: 'webp', label: 'WebP', codec: 'libwebp', bytes: 294626 },
    { id: 'jpeg', label: 'JPG', codec: 'MozJPEG', bytes: 380733 },
    { id: 'png', label: 'PNG', codec: 'lossless, OxiPNG', bytes: 3699329 },
  ],
  // hills.jpg as JPG with a target size: quality first, then a smaller picture when quality alone cannot fit
  target: {
    50: { bytes: 50327, q: 32, w: 1474, h: 983 },
    100: { bytes: 99221, q: 32, w: 2040, h: 1360 },
    200: { bytes: 195597, q: 43, w: 2400, h: 1600 },
  } as Record<number, { bytes: number; q: number; w: number; h: number }>,
};

/** Pinch's own size format (engine.js bytes()): 1024-based, one decimal under 10 KB, two under 10 MB. */
export function bytes(n: number): string {
  n = Number(n) || 0;
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(n < 10240 ? 1 : 0)} KB`;
  return `${(n / 1048576).toFixed(n < 10485760 ? 2 : 1)} MB`;
}

/** Percentage change, rounded, with a real minus sign the way Pinch shows it. */
export function pct(from: number, to: number): string {
  const p = Math.round((to / from - 1) * 100);
  return p > 0 ? `+${p}%` : p < 0 ? `−${-p}%` : '0%';
}
