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
      onBg('--line-strong', '#3a3a3a', 'Hover borders, avatar ring', 'decor'),
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
  { cls: 'lede', sample: 'Seven years of production SaaS, fintech and enterprise platforms.', size: 'clamp(1.05rem, 1.4vw, 1.2rem)', leading: '1.6', tracking: '0', weight: '400', use: 'Hero intro under .display. Max 34ch.' },
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
