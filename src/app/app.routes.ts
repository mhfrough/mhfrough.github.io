import { Routes } from '@angular/router';

/**
 * English only. Route data `theme` switches the whole page (nav + footer included) to a case-study theme.
 */
export const routes: Routes = [
  { path: '', loadComponent: () => import('./pages/home/home').then((m) => m.Home) },
  { path: 'work', loadComponent: () => import('./pages/work/work').then((m) => m.Work) },
  {
    path: 'work/befiler',
    data: { theme: 'befiler' },
    loadComponent: () => import('./pages/case-studies/befiler/befiler').then((m) => m.BefilerCaseStudy),
  },
  {
    path: 'work/bloomstone',
    data: { theme: 'bloomstone' },
    loadComponent: () => import('./pages/case-studies/bloomstone/bloomstone').then((m) => m.BloomstoneCaseStudy),
  },
  {
    path: 'work/emlaak',
    data: { theme: 'emlaak' },
    loadComponent: () => import('./pages/case-studies/emlaak/emlaak').then((m) => m.EmlaakCaseStudy),
  },
  {
    path: 'work/pizzerias',
    data: { theme: 'pizzerias' },
    loadComponent: () => import('./pages/case-studies/pizzerias/pizzerias').then((m) => m.PizzeriasCaseStudy),
  },
  {
    path: 'work/trades',
    data: { theme: 'trades' },
    loadComponent: () => import('./pages/case-studies/trades/trades').then((m) => m.TradesCaseStudy),
  },
  {
    path: 'work/kpmc',
    data: { theme: 'kpmc' },
    loadComponent: () => import('./pages/case-studies/kpmc/kpmc').then((m) => m.KpmcCaseStudy),
  },
  {
    path: 'work/asaan-hisab',
    data: { theme: 'asaan-hisab' },
    loadComponent: () => import('./pages/case-studies/asaan-hisab/asaan-hisab').then((m) => m.AsaanHisabCaseStudy),
  },
  {
    path: 'work/finclore',
    data: { theme: 'finclore' },
    loadComponent: () => import('./pages/case-studies/finclore/finclore').then((m) => m.FincloreCaseStudy),
  },
  {
    path: 'work/arittek',
    data: { theme: 'arittek' },
    loadComponent: () => import('./pages/case-studies/arittek/arittek').then((m) => m.ArittekCaseStudy),
  },
  {
    path: 'work/o2chat',
    data: { theme: 'o2chat' },
    loadComponent: () => import('./pages/case-studies/o2chat/o2chat').then((m) => m.O2chatCaseStudy),
  },
  {
    path: 'work/dmax',
    data: { theme: 'dmax' },
    loadComponent: () => import('./pages/case-studies/dmax/dmax').then((m) => m.DmaxCaseStudy),
  },
  {
    path: 'work/epractise',
    data: { theme: 'epractise' },
    loadComponent: () => import('./pages/case-studies/epractise/epractise').then((m) => m.EpractiseCaseStudy),
  },
  {
    path: 'work/llcsavvy',
    data: { theme: 'llcsavvy' },
    loadComponent: () => import('./pages/case-studies/llcsavvy/llcsavvy').then((m) => m.LlcsavvyCaseStudy),
  },
  {
    path: 'work/tmf',
    data: { theme: 'tmf' },
    loadComponent: () => import('./pages/case-studies/tmf/tmf').then((m) => m.TmfCaseStudy),
  },
  {
    path: 'work/ethical-node',
    data: { theme: 'ethical-node' },
    loadComponent: () => import('./pages/case-studies/ethical-node/ethical-node').then((m) => m.EthicalNodeCaseStudy),
  },
  {
    path: 'work/malik-transport',
    data: { theme: 'malik-transport' },
    loadComponent: () => import('./pages/case-studies/malik-transport/malik-transport').then((m) => m.MalikTransportCaseStudy),
  },
  {
    path: 'work/call-center',
    data: { theme: 'call-center' },
    loadComponent: () => import('./pages/case-studies/call-center/call-center').then((m) => m.CallCenterCaseStudy),
  },
  {
    path: 'work/fleet',
    data: { theme: 'fleet' },
    loadComponent: () => import('./pages/case-studies/fleet/fleet').then((m) => m.FleetCaseStudy),
  },
  {
    path: 'work/gift-wrap',
    data: { theme: 'gift-wrap' },
    loadComponent: () => import('./pages/case-studies/gift-wrap/gift-wrap').then((m) => m.GiftWrapCaseStudy),
  },
  {
    path: 'work/hrm',
    data: { theme: 'hrm' },
    loadComponent: () => import('./pages/case-studies/hrm/hrm').then((m) => m.HrmCaseStudy),
  },
  {
    path: 'work/quorum',
    data: { theme: 'quorum' },
    loadComponent: () => import('./pages/case-studies/quorum/quorum').then((m) => m.QuorumCaseStudy),
  },
  {
    path: 'work/whiteboard',
    data: { theme: 'whiteboard' },
    loadComponent: () => import('./pages/case-studies/whiteboard/whiteboard').then((m) => m.WhiteboardCaseStudy),
  },
  {
    path: 'work/flick',
    data: { theme: 'flick' },
    loadComponent: () => import('./pages/case-studies/flick/flick').then((m) => m.FlickCaseStudy),
  },
  {
    path: 'work/scrawl',
    data: { theme: 'scrawl' },
    loadComponent: () => import('./pages/case-studies/scrawl/scrawl').then((m) => m.ScrawlCaseStudy),
  },
  { path: 'about', loadComponent: () => import('./pages/about/about').then((m) => m.About) },
  { path: 'hire', loadComponent: () => import('./pages/hire/hire').then((m) => m.Hire) },
  { path: 'contact', loadComponent: () => import('./pages/contact/contact').then((m) => m.Contact) },
  { path: 'brand', loadComponent: () => import('./pages/brand/brand').then((m) => m.Brand) },
  { path: 'privacy', loadComponent: () => import('./pages/legal/privacy').then((m) => m.Privacy) },
  { path: 'terms', loadComponent: () => import('./pages/legal/terms').then((m) => m.Terms) },
  { path: 'cookies', loadComponent: () => import('./pages/legal/cookies').then((m) => m.Cookies) },
  { path: 'accessibility', loadComponent: () => import('./pages/legal/accessibility').then((m) => m.Accessibility) },
  { path: 'sitemap', loadComponent: () => import('./pages/sitemap/sitemap').then((m) => m.Sitemap) },
  // Prerendered as /404/index.html, copied to /404.html after build for static hosts.
  { path: '404', loadComponent: () => import('./pages/not-found/not-found').then((m) => m.NotFound) },
  { path: '**', loadComponent: () => import('./pages/not-found/not-found').then((m) => m.NotFound) },
];
