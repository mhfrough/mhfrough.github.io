// Legal pages content. English only, plain const.
//
// TEMPLATES FOR THE OWNER TO REVIEW. These pages describe the site as built on 10 October 2026:
// static files, no cookies, no analytics, self-hosted fonts and images, Quorum reels from GitHub Pages
// on play only, and a contact form that opens the visitor's own email app. They are written in good faith
// but are not legal advice. Before launch, confirm: the hosting provider name, the governing law
// (Pakistan, Sindh), the response times promised, and anything that changes when a form backend,
// analytics or new embeds are added (update `updated` on every change).

import { SITE } from '../../core/site.config';
import { LegalDoc } from './legal-layout';

const UPDATED = { iso: '2026-10-10', label: '10 October 2026' } as const;
const mail = { text: SITE.email, href: `mailto:${SITE.email}` };

export const PRIVACY: LegalDoc = {
  path: '/privacy',
  crumb: 'Privacy',
  seoTitle: 'Privacy policy',
  description:
    'How mhfrough.dev handles personal data: no cookies, no analytics, no trackers, and a contact form that opens your own email app.',
  title: 'Privacy policy',
  soft: 'Short, because little is collected.',
  updated: UPDATED,
  summary: [
    'This site sets no cookies and runs no analytics, ads or trackers.',
    'Fonts, images and scripts are served from this domain. The only outside request is a Quorum video, and only when you press play.',
    'The contact form does not send anything to a server. It opens your own email app with a drafted message.',
    [
      'You can ask what I hold about you, or have it corrected or deleted, at any time: ',
      mail,
      '.',
    ],
  ],
  sections: [
    {
      id: 'who',
      title: 'Who runs this site',
      blocks: [
        {
          p: [
            `${SITE.domain} is the personal site of ${SITE.name}, a software architect based in ${SITE.locality}, ${SITE.country}. I am responsible for any personal data handled through it. You can reach me at `,
            mail,
            '.',
          ],
        },
      ],
    },
    {
      id: 'collect',
      title: 'What this site collects',
      blocks: [
        {
          p: 'Nothing, by itself. The site is a set of static pages built ahead of time. It has no accounts, no database, no comments and no newsletter.',
        },
        {
          ul: [
            'No cookies, first party or third party.',
            'No analytics, heatmaps, session recording or tracking pixels.',
            'No advertising and no social media widgets.',
            'No fingerprinting and no data sold or shared with anyone.',
          ],
        },
        {
          p: 'If any of this changes, for example if privacy-friendly analytics are added, this page will be updated first and will name the provider.',
        },
      ],
    },
    {
      id: 'hosting',
      title: 'Hosting and server logs',
      blocks: [
        {
          p: 'Like every website, the pages are delivered by a hosting provider. To keep the service running and secure, the provider may keep standard request logs: your IP address, browser type, the page requested and the time. I do not use these logs to identify or profile visitors. The provider handles them under its own privacy policy.',
        },
      ],
    },
    {
      id: 'assets',
      title: 'Fonts, images and scripts',
      blocks: [
        {
          p: 'Fonts (Geist and Geist Mono), icons, images and scripts are all served from this domain. Browsing the site does not contact Google Fonts, a CDN or any other third party.',
        },
      ],
    },
    {
      id: 'media',
      title: 'Embedded media',
      blocks: [
        {
          p: [
            'The ',
            { text: 'Quorum case study', href: '/work/quorum' },
            ' shows two short videos hosted on GitHub Pages (mhfrough.github.io). Their preview images come from this site, and the video file only loads when you press play. At that point your browser connects to GitHub, which receives your IP address and browser details, as with any website you visit. ',
            {
              text: "GitHub's privacy statement",
              href: 'https://docs.github.com/site-policy/privacy-policies/github-general-privacy-statement',
            },
            ' applies to that request.',
          ],
        },
      ],
    },
    {
      id: 'contact',
      title: 'When you contact me',
      blocks: [
        {
          p: [
            'The ',
            { text: 'contact form', href: '/contact' },
            ' does not send your details to any server. When you press Send message, it opens your own email app with a drafted message addressed to me. Nothing reaches me until you press send there.',
          ],
        },
        {
          p: 'While you type, an unsent draft is kept in your browser session storage so a reload does not lose it. It stays on your device and is deleted when you close the tab or once the email is drafted.',
        },
        {
          p: 'When you email me, I receive what you choose to send, usually your name, email address and message. I use it only to reply and to discuss the work you asked about. I do not add you to a mailing list and I do not share it with anyone else, except my email provider, which stores the mail.',
        },
        {
          p: 'I keep emails for as long as the conversation and any resulting work need them, and delete them on request.',
        },
      ],
    },
    {
      id: 'links',
      title: 'Links to other sites',
      blocks: [
        {
          p: 'Links to LinkedIn, GitHub, Dribbble and project sites open those services. Their own privacy policies apply once you are there.',
        },
      ],
    },
    {
      id: 'rights',
      title: 'Your rights',
      blocks: [
        { p: 'You can ask at any time to:' },
        {
          ul: [
            'see what personal data I hold about you',
            'have it corrected if it is wrong',
            'have it deleted',
            'object to how it is used',
          ],
        },
        {
          p: [
            'Write to ',
            mail,
            '. I will answer within 30 days. If you are in the UK or the EU, you can also complain to your local data protection authority.',
          ],
        },
      ],
    },
    {
      id: 'changes',
      title: 'Changes to this policy',
      blocks: [
        {
          p: 'When this policy changes, the date at the top of the page changes with it. Material changes, such as a new service that handles your data, are described here before they go live.',
        },
      ],
    },
  ],
};

export const TERMS: LegalDoc = {
  path: '/terms',
  crumb: 'Terms',
  seoTitle: 'Terms of use',
  description:
    'Terms of use for mhfrough.dev: who owns the content, how linked open-source projects are licensed, and the limits of what the site promises.',
  title: 'Terms of use',
  soft: 'The ground rules for this site.',
  updated: UPDATED,
  summary: [
    'The writing, design and artwork on this site are mine. Short quotes with a link back are welcome.',
    'Open-source projects linked from here keep their own licences.',
    'The site is provided as it is. Anything we build together is covered by a separate written agreement.',
    'These terms follow the laws of Pakistan.',
  ],
  sections: [
    {
      id: 'about',
      title: 'About these terms',
      blocks: [
        {
          p: `These terms cover your use of ${SITE.domain}, the personal site of ${SITE.name}. By using the site you accept them. If you do not agree, please do not use the site.`,
        },
      ],
    },
    {
      id: 'content',
      title: 'Content ownership',
      blocks: [
        {
          p: `Unless stated otherwise, the text, design, illustrations, the ء mark and other original material on this site belong to ${SITE.name}. You may quote short excerpts with credit and a link back. Please do not copy pages, case studies or designs wholesale or present them as your own.`,
        },
        {
          p: 'Case studies describe real work with client names left out on purpose. Product names, logos and trademarks of third parties belong to their owners.',
        },
      ],
    },
    {
      id: 'open-source',
      title: 'Open-source projects',
      blocks: [
        {
          p: [
            'Repositories linked from this site, such as ',
            { text: 'Quorum', href: 'https://github.com/mhfrough/quorum' },
            ', are licensed under the terms in each repository (Quorum uses the MIT licence). These terms do not change or replace those licences.',
          ],
        },
      ],
    },
    {
      id: 'warranty',
      title: 'No warranty',
      blocks: [
        {
          p: 'The site and everything on it are provided as they are, without any warranty. I keep the information accurate and current, but details such as availability, skills and project descriptions can change, and nothing here is a binding offer of services.',
        },
      ],
    },
    {
      id: 'liability',
      title: 'Limitation of liability',
      blocks: [
        {
          p: 'To the extent the law allows, I am not liable for any loss or damage that comes from using this site or relying on its content. Nothing in these terms limits liability that cannot be limited by law.',
        },
      ],
    },
    {
      id: 'external',
      title: 'External links',
      blocks: [
        {
          p: 'The site links to other websites, including LinkedIn, GitHub, Dribbble and live project pages. I do not control them and am not responsible for their content, availability or privacy practices.',
        },
      ],
    },
    {
      id: 'work',
      title: 'Working together',
      blocks: [
        {
          p: [
            'These terms do not create a contract for services. Any project, retainer or review is agreed separately in writing, with its own scope, price and terms. The ',
            { text: 'Hire', href: '/hire' },
            ' page describes how that usually works.',
          ],
        },
      ],
    },
    {
      id: 'law',
      title: 'Governing law',
      blocks: [
        {
          p: 'These terms are governed by the laws of Pakistan. Any dispute about them falls under the courts of Karachi, Sindh, unless the law where you live gives you the right to bring it elsewhere.',
        },
      ],
    },
    {
      id: 'changes',
      title: 'Changes and contact',
      blocks: [
        {
          p: [
            'These terms may change. The date at the top shows the latest version. Questions are welcome at ',
            mail,
            '.',
          ],
        },
      ],
    },
  ],
};

export const COOKIES: LegalDoc = {
  path: '/cookies',
  crumb: 'Cookies',
  seoTitle: 'Cookie policy',
  description:
    'mhfrough.dev sets no cookies: no analytics, no ads, no trackers. What the site does store, and what would change that.',
  title: 'Cookie policy',
  soft: 'There are none. Here is the detail.',
  updated: UPDATED,
  summary: [
    'This site sets no cookies, first party or third party.',
    'That is why there is no cookie banner: there is nothing to consent to.',
    'The contact form keeps an unsent draft in your browser session storage. It never leaves your device.',
  ],
  sections: [
    {
      id: 'none',
      title: 'No cookies',
      blocks: [
        {
          p: 'Cookies are small files a website asks your browser to store and send back on later visits. This site does not set any: no analytics cookies, no advertising cookies, no preference cookies and no session cookies.',
        },
        {
          p: 'You can check this yourself in your browser developer tools, under Application or Storage, while visiting any page.',
        },
      ],
    },
    {
      id: 'storage',
      title: 'What the site does store',
      blocks: [
        {
          p: [
            'One thing, and only if you use the ',
            { text: 'contact form', href: '/contact' },
            ': while you type, an unsent draft is saved in your browser session storage, so a reload does not lose your message.',
          ],
        },
        {
          ul: [
            'It contains only what you typed into the form.',
            'It is never sent to a server and is not readable by other sites.',
            'It is deleted when you close the tab, start a new message, or once the email is drafted.',
          ],
        },
      ],
    },
    {
      id: 'third-parties',
      title: 'Third parties',
      blocks: [
        {
          p: [
            'There are no analytics, ads or social widgets. The only outside content is the two Quorum videos on the ',
            { text: 'Quorum case study', href: '/work/quorum' },
            ', served from GitHub Pages when you press play. That is a plain file download, and GitHub handles it under its own privacy statement.',
          ],
        },
        {
          p: 'Links to LinkedIn, GitHub and Dribbble take you to those services, which set their own cookies once you are there.',
        },
      ],
    },
    {
      id: 'control',
      title: 'Controlling cookies',
      blocks: [
        {
          p: 'There is nothing to opt out of here. Your browser settings let you block or delete cookies for every site, which also covers the services linked from this one.',
        },
      ],
    },
    {
      id: 'changes',
      title: 'If this changes',
      blocks: [
        {
          p: [
            'If cookies or analytics are ever added, this page will be updated first, the ',
            { text: 'privacy policy', href: '/privacy' },
            ' will name the provider, and you will be asked for consent wherever the law requires it.',
          ],
        },
      ],
    },
  ],
};

export const ACCESSIBILITY: LegalDoc = {
  path: '/accessibility',
  crumb: 'Accessibility',
  seoTitle: 'Accessibility statement',
  description:
    'Accessibility statement for mhfrough.dev: the WCAG 2.1 AA target, what has been done to meet it, known limits, and how to report a problem.',
  title: 'Accessibility',
  soft: 'Built for every visitor.',
  updated: UPDATED,
  summary: [
    'The target is WCAG 2.1 level AA across the whole site.',
    'Every page works with a keyboard, reads in a logical order and respects reduced motion.',
    'Some limits remain, listed below with what to do about them.',
    ['Found a barrier? Email ', mail, ' and I will fix it or send you the content another way.'],
  ],
  sections: [
    {
      id: 'target',
      title: 'The target',
      blocks: [
        {
          p: `${SITE.domain} aims to meet the Web Content Accessibility Guidelines (WCAG) 2.1 at level AA. Accessibility is part of how I build for clients, so this site is held to the same standard.`,
        },
      ],
    },
    {
      id: 'done',
      title: 'What has been done',
      blocks: [
        {
          ul: [
            'Semantic HTML with landmarks, one main heading per page and headings in order.',
            'Everything works with a keyboard, with a visible focus ring and a skip link to the main content.',
            'Text contrast meets at least 4.5 to 1, including secondary grey text.',
            'Form fields have visible labels above them. Errors are written in text, linked to their field and listed in a summary that receives focus.',
            'Animations respect the reduced motion setting, and looping animations pause when off screen.',
            'Pages are rendered ahead of time, so the content reads even before or without JavaScript.',
            'Images have text alternatives, and decorative icons are hidden from screen readers.',
            'Buttons and links are at least 44 by 44 pixels where they matter most.',
            'Automated checks with axe and Lighthouse run against every page.',
          ],
        },
      ],
    },
    {
      id: 'limits',
      title: 'Known limits',
      blocks: [
        {
          ul: [
            'The site has a dark theme only. If you need a light theme, your browser reader mode or high contrast settings work on every page.',
            'Some case studies include interactive demos that are visual by nature. Their content is also given in plain text on the same page.',
            'The contact form opens your own email app. If none is set up, use the email address shown next to the form instead.',
            'Linked services such as LinkedIn, GitHub and Dribbble are outside my control.',
            'Automated tools catch only part of the issues. Manual testing with screen readers is ongoing, and reports from real use are the most valuable input.',
          ],
        },
      ],
    },
    {
      id: 'report',
      title: 'Report a problem',
      blocks: [
        { p: ['If something on the site does not work for you, email ', mail, ' with:'] },
        {
          ul: [
            'the page address',
            'what you were trying to do',
            'the browser and any assistive technology you use, if you are happy to share it',
          ],
        },
        {
          p: 'I aim to reply within five working days. If a fix takes longer, I will send you the content you need in another format in the meantime.',
        },
      ],
    },
    {
      id: 'tech',
      title: 'Technical details',
      blocks: [
        {
          p: 'The site is built with HTML, CSS, WAI-ARIA and JavaScript (Angular), and is tested in current versions of Chrome, Firefox, Safari and Edge on desktop and mobile.',
        },
      ],
    },
    {
      id: 'assessment',
      title: 'How this was assessed',
      blocks: [
        {
          p: 'This statement is based on a self-assessment, with automated checks and manual keyboard testing. It was last reviewed on the date at the top of this page.',
        },
      ],
    },
  ],
};
