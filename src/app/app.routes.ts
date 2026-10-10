import { Routes } from '@angular/router';

/**
 * Same page tree twice: '/' (English) and '/ur' (Urdu, RTL). Language comes from the URL so both
 * are prerendered and indexable. Page components read the language from I18n, never from the route.
 * Route data `theme` switches the whole page (nav + footer included) to a case-study theme.
 */
const pages: Routes = [
  { path: '', loadComponent: () => import('./pages/home/home').then((m) => m.Home) },
  { path: 'work', loadComponent: () => import('./pages/work/work').then((m) => m.Work) },
  {
    path: 'work/quorum',
    data: { theme: 'quorum' },
    loadComponent: () => import('./pages/case-studies/quorum/quorum').then((m) => m.QuorumCaseStudy),
  },
  { path: 'hire', loadComponent: () => import('./pages/hire/hire').then((m) => m.Hire) },
  { path: 'contact', loadComponent: () => import('./pages/contact/contact').then((m) => m.Contact) },
  { path: 'brand', loadComponent: () => import('./pages/brand/brand').then((m) => m.Brand) },
  { path: 'privacy', loadComponent: () => import('./pages/legal/privacy').then((m) => m.Privacy) },
  { path: 'terms', loadComponent: () => import('./pages/legal/terms').then((m) => m.Terms) },
  { path: 'cookies', loadComponent: () => import('./pages/legal/cookies').then((m) => m.Cookies) },
  { path: 'accessibility', loadComponent: () => import('./pages/legal/accessibility').then((m) => m.Accessibility) },
  // Prerendered as /404/index.html, copied to /404.html after build for static hosts.
  { path: '404', loadComponent: () => import('./pages/not-found/not-found').then((m) => m.NotFound) },
  { path: '**', loadComponent: () => import('./pages/not-found/not-found').then((m) => m.NotFound) },
];

export const routes: Routes = [
  { path: 'ur', data: { lang: 'ur' }, children: pages },
  { path: '', data: { lang: 'en' }, children: pages },
];
