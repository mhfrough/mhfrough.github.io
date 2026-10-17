// Structured design-system data for /brand. `value` fields are the literal values from src/styles/_tokens.scss and
// _components.scss: they are the SSR fallback only. In the browser every swatch, size and ratio is re-read live.

export interface Section {
  id: string;
  label: string;
}

export const SECTIONS: Section[] = [
  { id: 'logo', label: 'Logo' },
  { id: 'color', label: 'Color' },
  { id: 'type', label: 'Typography' },
  { id: 'shape', label: 'Shape and space' },
  { id: 'components', label: 'Components' },
  { id: 'motion', label: 'Motion' },
  { id: 'icons', label: 'Iconography' },
  { id: 'voice', label: 'Voice and copy' },
  { id: 'a11y', label: 'Accessibility' },
];

export type ColorKind = 'text' | 'decor';

export interface ColorToken {
  name: string;
  value: string;
  role: string;
  /** What the contrast figure measures: fg on bg (token names). */
  fg: string;
  bg: string;
  kind: ColorKind;
}

export interface ColorGroup {
  id: string;
  label: string;
  note: string;
  tokens: ColorToken[];
}

const onBg = (name: string, value: string, role: string, kind: ColorKind = 'text'): ColorToken => ({
  name,
  value,
  role,
  fg: name,
  bg: '--bg',
  kind,
});
const inkOn = (name: string, value: string, role: string, fg = '--ink'): ColorToken => ({
  name,
  value,
  role,
  fg,
  bg: name,
  kind: 'text',
});

export const COLOR_GROUPS: ColorGroup[] = [
  {
    id: 'surfaces',
    label: 'Surfaces',
    note: 'Four steps of near black. Ratio shows --ink on each.',
    tokens: [
      inkOn('--bg', '#111111', 'Page background, under everything'),
      inkOn('--bg-2', '#151515', 'Raised page bands'),
      inkOn('--surface', '#1a1a1a', 'Cards, pills, ghost buttons'),
      inkOn('--surface-2', '#222222', 'Inputs, wells, segmented track, skeletons'),
    ],
  },
  {
    id: 'ink',
    label: 'Ink',
    note: 'Text colors. Ratio shows each on --bg.',
    tokens: [
      onBg('--ink', '#ededed', 'Headlines, emphasis, focus ring'),
      onBg('--ink-2', '#c9c9c9', 'Body copy, .sub and .lede'),
      onBg('--muted', '#9a9a9a', 'Captions, metadata, the .soft line'),
      onBg('--faint', '#4a4a4a', 'Decorative only, never text', 'decor'),
    ],
  },
  {
    id: 'lines',
    label: 'Lines',
    note: 'Hairlines separate; they never carry meaning alone.',
    tokens: [
      onBg('--line', '#2c2c2c', '1px borders on cards, pills, inputs', 'decor'),
      onBg('--line-strong', '#3a3a3a', 'Hover borders, strong rules', 'decor'),
    ],
  },
  {
    id: 'glass',
    label: 'Glass',
    note: 'Only the floating nav is glass.',
    tokens: [
      onBg('--glass-edge', 'rgb(255 255 255 / 0.09)', 'Nav pill border', 'decor'),
      onBg('--glass-hi', 'rgb(255 255 255 / 0.07)', 'Nav inner top highlight', 'decor'),
    ],
  },
  {
    id: 'solid',
    label: 'Solid and CTA',
    note: 'Accent = ink. CTAs invert: light fill, dark text.',
    tokens: [
      inkOn('--solid', '#262626', 'Code, command bar, featured cards', '--solid-ink'),
      { name: '--solid-ink', value: '#ededed', role: 'Text on solid blocks', fg: '--solid-ink', bg: '--solid', kind: 'text' },
      onBg('--solid-edge', 'rgb(255 255 255 / 0.08)', 'Edge of solid blocks', 'decor'),
      inkOn('--accent-soft', '#232323', 'Badges, tags, icon wells', '--ink-2'),
      inkOn('--cta', '#ededed', 'Primary buttons, pressed chips, brand tile', '--cta-ink'),
      { name: '--cta-ink', value: '#111111', role: 'Text on --cta', fg: '--cta-ink', bg: '--cta', kind: 'text' },
      onBg('--accent', '#ededed', 'Same as ink: focus ring, selection'),
      { name: '--accent-ink', value: '#111111', role: 'Text on selection', fg: '--accent-ink', bg: '--accent', kind: 'text' },
    ],
  },
];

export const SHADOWS = [
  { name: '--shadow', value: '0 1px 2px rgb(0 0 0 / 0.3), 0 18px 40px -18px rgb(0 0 0 / 0.6)', role: 'Hover lift on .card--hover and reels' },
  { name: '--shadow-lg', value: '0 2px 4px rgb(0 0 0 / 0.3), 0 40px 80px -30px rgb(0 0 0 / 0.7)', role: 'Hero cards (.card--lift), menus, popovers' },
];

export interface TypeStyle {
  cls: string;
  sample: string;
  size: string;
  leading: string;
  tracking: string;
  weight: string;
  use: string;
  soft?: string;
}

export const TYPE_SCALE: TypeStyle[] = [
  { cls: 'display', sample: 'Two inks.', soft: 'One shape.', size: 'clamp(2.4rem, 5.6vw, 4.2rem)', leading: '1.04', tracking: '-0.045em', weight: '600', use: 'Hero headline, once per page. Two .line spans, the second .soft.' },
  { cls: 'h1', sample: 'Selected work', size: 'clamp(2.2rem, 4.6vw, 3.6rem)', leading: '1.04', tracking: '-0.04em', weight: '600', use: 'Page title when there is no hero.' },
  { cls: 'title', sample: 'How a council runs', size: 'clamp(2rem, 4vw, 3.1rem)', leading: '1.05', tracking: '-0.035em', weight: '600', use: 'Section heads. Max 18ch.' },
  { cls: 'h3', sample: 'Multi-tenant Angular frontend', size: '1.25rem', leading: '1.25', tracking: '-0.02em', weight: '600', use: 'Card and sub-section titles.' },
  { cls: 'lede', sample: 'Production SaaS, fintech and enterprise platforms since 2020.', size: 'clamp(1.05rem, 1.4vw, 1.2rem)', leading: '1.6', tracking: '0', weight: '400', use: 'Hero intro under .display. Max 34ch.' },
  { cls: 'sub', sample: 'The head of every section: one or two sentences, never more.', size: '1.075rem', leading: '1.6', tracking: '0', weight: '400', use: 'Section intro under .title. Max 56ch.' },
  { cls: 'body', sample: 'A tax-filing flow embedded in six banking apps, kept in one codebase.', size: '1rem', leading: '1.6', tracking: '0', weight: '400', use: 'Running prose. Max 65ch.' },
  { cls: 'label', sample: 'Your email', size: '13px', leading: '1.6', tracking: '0', weight: '500', use: 'Field and group labels, muted.' },
  { cls: 'mono', sample: '$ ng build --configuration production', size: '13px', leading: '1.6', tracking: '0', weight: '400', use: 'Commands, metadata, numbers, captions.' },
];

/** Phosphor (regular) icons in use across the site. */
export const ICONS: { key: string; label: string }[] = [
  { key: 'phosphorArrowRight', label: 'arrow-right' },
  { key: 'phosphorArrowUpRight', label: 'arrow-up-right' },
  { key: 'phosphorArrowUp', label: 'arrow-up' },
  { key: 'phosphorArrowLeft', label: 'arrow-left' },
  { key: 'phosphorList', label: 'list' },
  { key: 'phosphorX', label: 'x' },
  { key: 'phosphorCopy', label: 'copy' },
  { key: 'phosphorCheck', label: 'check' },
  { key: 'phosphorGithubLogo', label: 'github-logo' },
  { key: 'phosphorLinkedinLogo', label: 'linkedin-logo' },
  { key: 'phosphorDribbbleLogo', label: 'dribbble-logo' },
  { key: 'phosphorUsersThree', label: 'users-three' },
  { key: 'phosphorSignpost', label: 'signpost' },
  { key: 'phosphorScales', label: 'scales' },
  { key: 'phosphorShieldCheck', label: 'shield-check' },
  { key: 'phosphorGauge', label: 'gauge' },
  { key: 'phosphorCube', label: 'cube' },
  { key: 'phosphorBriefcase', label: 'briefcase' },
];

export const ICON_SIZES = [
  { px: 14, where: '.pill-link, .chip' },
  { px: 16, where: '.copy' },
  { px: 18, where: '.btn, .icon-btn' },
  { px: 24, where: '.icon-well' },
  { px: 26, where: '.icon-tile' },
];

/**
 * Case-study themes. Each one overrides the colour tokens above under :root[data-theme='<slug>']
 * (src/styles/themes/_<slug>.scss) and nothing else. A theme only applies to the whole document, so these swatches
 * cannot be read live: the values below are copied from those files (bg, ink, cta, cta-ink, accent) for display
 * only. Keep them in step when a theme changes. Order follows /work. The company-site theme is left out here
 * because that client is only named on its own case study, /work and /sitemap.
 */
export interface CaseTheme {
  slug: string;
  name: string;
  href: string;
  /** The product's own mark (favicon-first rule); otherwise `icon`. */
  mark?: string;
  icon: string;
  scheme: 'light' | 'dark';
  bg: string;
  ink: string;
  accent: string;
  cta: string;
  ctaInk: string;
}

const theme = (
  slug: string,
  name: string,
  icon: string,
  mark: string | undefined,
  scheme: 'light' | 'dark',
  [bg, ink, accent, cta, ctaInk]: [string, string, string, string, string],
): CaseTheme => ({ slug, name, href: `/work/${slug}`, icon, mark, scheme, bg, ink, accent, cta, ctaInk });

export const CASE_THEMES: CaseTheme[] = [
  theme('quorum', 'Quorum', 'phosphorUsersThree', '/images/quorum/favicon.svg', 'dark', ['#121110', '#eeebe6', '#eeebe6', '#eeebe6', '#161513']),
  theme('befiler', 'Befiler', 'phosphorReceipt', '/images/befiler/befiler-icon.webp', 'light', ['#fbfafa', '#1b1b1b', '#c0121a', '#e41e26', '#ffffff']),
  theme('emlaak', 'Emlaak Financials', 'phosphorChartLineUp', '/images/emlaak/emlaak-mark.webp', 'light', ['#f4f8fa', '#18222d', '#2e609b', '#2e609b', '#ffffff']),
  theme('tmf', 'TMF', 'phosphorHandCoins', '/images/tmf/tmf-mark.webp', 'light', ['#f8f5ef', '#2b2117', '#8a5a26', '#d1a871', '#2b2117']),
  theme('fleet', 'Fleet', 'phosphorTruck', undefined, 'light', ['#f2f4f3', '#141c1b', '#0d5c57', '#0d5c57', '#ffffff']),
  theme('dmax', 'DMAX', 'phosphorDatabase', '/images/dmax/dmax-mark.webp', 'dark', ['#10121f', '#e8f0f8', '#19b98a', '#19b98a', '#10121f']),
  theme('epractise', 'ePractise', 'phosphorBriefcase', '/images/epractise/epractise-mark.webp', 'light', ['#f5f7fb', '#1c2230', '#2563eb', '#2563eb', '#ffffff']),
  theme('o2chat', 'O2Chat', 'phosphorChatsCircle', '/images/o2chat/o2chat-mark.webp', 'light', ['#f3f6fb', '#111a2e', '#0a58ca', '#0a58ca', '#ffffff']),
  theme('bloomstone', 'Bloomstone', 'phosphorTreePalm', '/images/bloomstone/bloomstone-mark.webp', 'light', ['#f3eee2', '#2a2a2a', '#545c2b', '#545c2b', '#ffffff']),
  theme('finclore', 'Finclore', 'phosphorBuildingOffice', '/images/finclore/finclore-mark.svg', 'light', ['#f5f6f8', '#131b2c', '#0a3161', '#0a3161', '#ffffff']),
  theme('llcsavvy', 'LLC SAVVY', 'phosphorBuildingOffice', '/images/llcsavvy/llcsavvy-mark.webp', 'light', ['#f3f4f6', '#16202f', '#0a3161', '#b31942', '#ffffff']),
  theme('pizzerias', 'Pizzerias', 'phosphorForkKnife', undefined, 'light', ['#fbf6ec', '#221d18', '#cc2f00', '#cc2f00', '#ffffff']),
  theme('call-center', 'Call center', 'phosphorHeadset', undefined, 'light', ['#f5f5fb', '#131336', '#4d4cac', '#4d4cac', '#ffffff']),
  theme('malik-transport', 'Malik Transport', 'phosphorTruck', '/images/malik-transport/malik-transport-mark.webp', 'light', ['#f4f6fa', '#1b2236', '#3365a4', '#3365a4', '#ffffff']),
  theme('trades', 'SOS24 and AK Heating', 'phosphorWrench', undefined, 'light', ['#f5f6fb', '#0f1533', '#031071', '#031071', '#ffffff']),
  theme('kpmc', 'KPMC', 'phosphorBuildings', '/images/kpmc/kpmc-logo.webp', 'light', ['#f3f5f7', '#1b2534', '#007a45', '#007a45', '#ffffff']),
  theme('asaan-hisab', 'Asaan Hisab', 'phosphorInvoice', '/images/asaan-hisab/asaan-hisab-mark.webp', 'light', ['#f4f6f9', '#1c2733', '#0077c5', '#0077c5', '#ffffff']),
  theme('hrm', 'HRM Suite', 'phosphorIdentificationBadge', '/images/hrm/hrm-mark.svg', 'dark', ['#0b0f17', '#e7ecf4', '#2563eb', '#2563eb', '#ffffff']),
  theme('whiteboard', 'Whiteboard', 'phosphorPencilSimpleLine', undefined, 'dark', ['#1a1917', '#e4e0d8', '#818cf8', '#4f46e5', '#ffffff']),
  theme('flick', 'Flick', 'phosphorShareNetwork', '/images/flick/flick-mark.svg', 'dark', ['#0f110e', '#eceee6', '#d4f84b', '#d4f84b', '#11130f']),
  theme('scrawl', 'Scrawl', 'phosphorPenNib', '/images/scrawl/scrawl-mark.svg', 'dark', ['#161614', '#ebebe9', '#ffe14a', '#ffe14a', '#1d1d1b']),
  theme('gift-wrap', 'Gift Wrap', 'phosphorGift', undefined, 'light', ['#fdf6f8', '#3a2330', '#7a0f3d', '#7a0f3d', '#ffffff']),
  theme('ethical-node', 'EthicalNode', 'phosphorHandCoins', '/images/ethical-node/ethical-node-mark.webp', 'light', ['#f2f6fd', '#0d1b33', '#1d5fd6', '#1d5fd6', '#ffffff']),
];
