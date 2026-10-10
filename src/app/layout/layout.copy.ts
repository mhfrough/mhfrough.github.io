import { Copy } from '../core/i18n/i18n.service';

export interface LayoutCopy {
  skip: string;
  homeLabel: string;
  nav: { work: string; brand: string; contact: string };
  hire: string;
  menu: string;
  close: string;
  langSwitch: string;
  langSwitchLabel: string;
  footer: {
    blurb: string;
    available: string;
    unavailable: string;
    pages: string;
    elsewhere: string;
    legal: string;
    hireLink: string;
    privacy: string;
    terms: string;
    cookies: string;
    accessibility: string;
    rights: string;
    localTime: string;
    top: string;
  };
}

export const LAYOUT_COPY: Copy<LayoutCopy> = {
  en: {
    skip: 'Skip to content',
    homeLabel: 'mhfrough, home',
    nav: { work: 'Work', brand: 'Brand', contact: 'Contact' },
    hire: 'Hire me',
    menu: 'Menu',
    close: 'Close menu',
    langSwitch: 'اردو',
    langSwitchLabel: 'Read this page in Urdu',
    footer: {
      blurb: 'Software architect. Angular platforms, multi-tenant SaaS and the design systems behind them.',
      available: 'Taking on new projects',
      unavailable: 'Booked for now',
      pages: 'Pages',
      elsewhere: 'Elsewhere',
      legal: 'Legal',
      hireLink: 'Hire',
      privacy: 'Privacy',
      terms: 'Terms',
      cookies: 'Cookies',
      accessibility: 'Accessibility',
      rights: 'Mohammad Hamza',
      localTime: 'Karachi',
      top: 'Back to top',
    },
  },
  ur: {
    skip: 'مواد پر جائیں',
    homeLabel: 'mhfrough، ہوم',
    nav: { work: 'کام', brand: 'برانڈ', contact: 'رابطہ' },
    hire: 'ہائر کریں',
    menu: 'مینو',
    close: 'مینو بند کریں',
    langSwitch: 'English',
    langSwitchLabel: 'یہ صفحہ انگریزی میں پڑھیں',
    footer: {
      blurb: 'سافٹ ویئر آرکیٹیکٹ۔ اینگولر پلیٹ فارمز، ملٹی ٹیننٹ SaaS اور ان کے پیچھے ڈیزائن سسٹمز۔',
      available: 'نئے پراجیکٹس کے لیے دستیاب',
      unavailable: 'فی الحال مصروف',
      pages: 'صفحات',
      elsewhere: 'دیگر جگہیں',
      legal: 'قانونی',
      hireLink: 'ہائر',
      privacy: 'رازداری',
      terms: 'شرائط',
      cookies: 'کوکیز',
      accessibility: 'رسائی',
      rights: 'محمد حمزہ',
      localTime: 'کراچی',
      top: 'اوپر جائیں',
    },
  },
};
