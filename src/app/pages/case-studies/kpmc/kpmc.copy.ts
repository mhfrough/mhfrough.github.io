// KPMC case-study copy. English only, plain const.
// Facts come from the owner's CV and the kpmc_web repo (read, never modified). The owner asked for this case study
// (2026-10-11) under the work-index title "Municipal complaint portal". The client, Khairpur Municipal Committee,
// is a public body named on its own public site; the company the owner built it for is never named. Citizens file
// complaints in the committee's Android app, which is not this work; the page says so. The live domain is gone:
// the screenshots are the original production build rendered against a sample API. No real people, phone numbers
// of staff, or backend hosts appear anywhere.

export const COPY = {
  seo: {
    title: 'KPMC case study',
    description:
      'Khairpur Municipal Committee, Sindh: the Angular public site and the staff back office behind its complaint app, with role-based assignment, closing with photo proof, citizen ratings, reports and push notifications. Built in under two months.',
    imageAlt: 'KPMC case study cover: the committee emblem above "A city’s complaints, handled in one place."',
  },
  hero: {
    tag: 'Case study',
    pill: 'Nov to Dec 2022, Angular frontend',
    line1: 'Khairpur Municipal Committee.',
    line2: 'A city’s complaints, handled in one place.',
    lede: 'Citizens of Khairpur report a blocked drain or a broken water line from an app. I built the web side: the committee’s public site, and the back office where staff assign every complaint, close it with proof and see how the city rated the fix. First screen to live domain in under two months.',
    back: 'View work',
  },
  meta: [
    { k: 'Role', v: 'Angular developer, 76 of 89 commits' },
    { k: 'Timeline', v: 'Nov to Dec 2022, extended 2024' },
    { k: 'Platforms', v: 'Public site, staff back office' },
    { k: 'Stack', v: 'Angular 14, Universal, Bootstrap, FCM' },
  ],
  numbers: [
    { value: '< 2', label: 'months from the first admin screen to the live domain' },
    { value: '4', label: 'staff roles behind one permission directive' },
    { value: '52', label: 'lazy-loaded modules, every public page prerendered' },
    { value: '36', label: 'answers in the public FAQ, from licences to marriage certificates' },
  ],
  site: {
    title: 'The committee’s public face',
    sub: 'Complaint counters up front, eight municipal services, news, tenders and a FAQ, in the committee’s green. Every page prerendered, so it loads fast on a slow connection and reads well to search engines.',
    url: 'KPMC, original build',
    heroAlt: 'KPMC home page: a dark top bar with office hours, the committee emblem and menu, a photo of one of Khairpur’s palaces, and counters for received, resolved and in-process complaints.',
    mobileAlt: 'KPMC home page on a phone: the emblem, a menu button, the palace photo, the three counters and stacked service cards.',
    details: [
      {
        src: '/images/kpmc/site-services.webp',
        h: 913,
        alt: 'Complaint counters above eight service tiles: sanitation, collections, drinking water supply, fire fighter, anti encroachment, vaccination, urban and rural infrastructure, registration certificate.',
        cap: 'Counters and services',
      },
      {
        src: '/images/kpmc/site-news.webp',
        h: 1000,
        alt: 'News and updates: photo cards of Khairpur landmarks with municipal headlines and dates.',
        cap: 'News and updates',
      },
      {
        src: '/images/kpmc/site-faqs.webp',
        h: 1000,
        alt: 'Frequently asked questions: an accordion with one answer open, beside a Suggest Us form.',
        cap: 'FAQ and suggestions',
      },
    ],
    appAlt: 'Banner: "Get your complaint filed with the KPMC mobile app, download now" with a Google Play badge and two phones showing the app.',
    note: 'The original production build rendered against a sample API: the live domain is gone. Figures and headlines are samples.',
  },
  arch: {
    title: 'An app for citizens, the web for the committee',
    sub: 'Filing happens where people are: on a phone, with GPS and a photo. Everything after that happens on the web, in front of the staff who fix it.',
    left: 'Citizens, in the app',
    core: 'Complaint API',
    coreSub: 'Shared by app and web',
    right: 'Staff, on the web',
    citizens: [
      { icon: 'phosphorIdentificationCard', t: 'Sign up', s: 'Name, CNIC and mobile number' },
      { icon: 'phosphorMapPin', t: 'File', s: 'Category, ward, GPS and photos' },
      { icon: 'phosphorStar', t: 'Rate the fix', s: 'Resolved or not, and how well' },
    ],
    staff: [
      { icon: 'phosphorListChecks', t: 'Complaint desk', s: 'Assign, close with proof' },
      { icon: 'phosphorFilePdf', t: 'Reports', s: 'Filtered, exported as PDF' },
      { icon: 'phosphorBellRinging', t: 'Notifications', s: 'Push to every app user' },
      { icon: 'phosphorNewspaper', t: 'Public content', s: 'News, tenders, schemes' },
    ],
  },
  flow: {
    title: 'The life of a complaint',
    sub: 'Five states, each owned by someone: the citizen files and rates, a supervisor assigns, an agent fixes, and the close needs a remark and a photo of the work.',
    steps: ['Filed in the app', 'Unassigned', 'Assigned to an agent', 'Closed with proof', 'Rated by the citizen'],
    holds: [
      { t: 'Where', s: 'Taluka, ward, address and the GPS point, opened in Google Maps from the complaint.' },
      { t: 'What', s: 'A parent and a child category, a description, and the citizen’s photos as evidence.' },
      { t: 'Who', s: 'The citizen’s name, mobile number and CNIC, so nobody files anonymously.' },
      { t: 'Done', s: 'Closing remarks up to 256 characters and a photo marked as the committee’s confirmation.' },
    ],
  },
  reports: {
    title: 'Reports a supervisor can act on',
    sub: 'Every filter the office asked for, a table, and a PDF the server draws. The agent report turns citizen ratings into a scorecard for each agent.',
    filters: ['Date range', 'Ward', 'Category', 'Sub-category', 'Mobile', 'Complaint number', 'CNIC', 'Feedback', 'Status'],
  },
  push: {
    title: 'Talking back to the city',
    sub: 'Staff write a push notification on the web and it reaches every app user subscribed to the topic, now or at a set time.',
  },
  stack: {
    title: 'The stack',
    sub: 'Angular 14 with server rendering, Bootstrap components, and Firebase for one job: push notifications.',
    groups: [
      {
        t: 'Web',
        why: 'Lazy-loaded modules, guards, an interceptor and one facade over the data services.',
        items: [
          { name: 'Angular 14', logo: 'angular' },
          { name: 'TypeScript', logo: 'typescript' },
          { name: 'RxJS', logo: 'reactivex' },
          { name: 'Bootstrap 5', logo: 'bootstrap' },
          { name: 'ng-bootstrap', icon: 'phosphorCode' },
          { name: 'ng-select', icon: 'phosphorCode' },
        ],
      },
      {
        t: 'Rendering and forms',
        why: 'Every route prerendered with Angular Universal; CNIC masks and a rich-text editor for staff.',
        items: [
          { name: 'Angular Universal', logo: 'angular' },
          { name: 'Express', icon: 'phosphorCode' },
          { name: 'ngx-mask', icon: 'phosphorShieldCheck' },
          { name: 'Rich-text editor', icon: 'phosphorCode' },
          { name: 'SweetAlert2', icon: 'phosphorCode' },
        ],
      },
      {
        t: 'Messaging',
        why: 'Firebase Cloud Messaging for staff alerts on the web and topic pushes to the app.',
        items: [
          { name: 'Firebase Cloud Messaging', logo: 'firebase' },
          { name: 'Service worker', icon: 'phosphorBell' },
          { name: 'Google Maps links', logo: 'googlemaps' },
        ],
      },
    ],
  },
  decisions: {
    title: 'Decisions and what I’d change',
    sub: 'A public body, a hard deadline and three kinds of staff in one back office.',
    items: [
      {
        t: 'One directive for roles',
        s: 'Agents, supervisors and admins share one back office. A single structural directive shows or hides each menu item, column and button by role, so a new screen gets its rules in one line.',
      },
      {
        t: 'Fifteen screens, one base',
        s: 'News, tenders, schemes, accounts and the rest are the same list, search and form. A generic base component and one facade over the services kept each new module small and the same as the last.',
      },
      {
        t: 'Prerender everything',
        s: 'A government site is read on slow phones and found through search, so every route is prerendered. The price is guarding every touch of the browser so the server build never breaks.',
      },
      {
        t: 'A map link, not a map',
        s: 'Complaints carry a GPS point. Opening it in Google Maps gave staff directions on their phones without a map library in the bundle.',
      },
      {
        t: 'Hiding is not enforcing',
        s: 'The directive hides what a role should not see; the API has to refuse it too. Today I’d add route guards per role on top, so a typed address can’t open a screen a role should never reach.',
      },
      {
        t: 'Charts next to the PDFs',
        s: 'Reports are tables and server-drawn PDFs. A ward map and a trend line of open complaints would show a supervisor in seconds what a table takes minutes to say.',
      },
    ],
  },
  next: {
    title: 'A public service that needs a back office?',
    sub: 'Role-based back offices, prerendered public sites and the reports people actually use.',
    hire: 'Hire me',
    other: 'Next: Asaan Hisab',
  },
} as const;
