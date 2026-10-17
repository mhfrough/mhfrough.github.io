// Legal pages content. English only, plain const.
//
// TEMPLATES FOR THE OWNER TO REVIEW. These pages describe the site as built on 11 October 2026:
// static files, no cookies, no analytics, self-hosted fonts and images, Quorum reels from GitHub Pages
// on play only (home and /work/quorum), downloadable SVGs on /work (weather icons) and /brand, and a
// contact form that opens the visitor's own email app (MailtoTransport, no form service).
// They are written in good faith to protect the owner as far as is reasonable, but they are not legal
// advice and are no substitute for a lawyer. Before launch, confirm: the hosting provider, the email
// provider, the liability cap wording, and anything that changes when a form backend, analytics or new
// embeds are added (update `UPDATED` on every change).

import { SITE } from '../../core/site.config';
import { LegalDoc } from './legal-layout';

const UPDATED = { iso: '2026-10-11', label: '11 October 2026' } as const;
const mail = { text: SITE.email, href: `mailto:${SITE.email}` };

export const PRIVACY: LegalDoc = {
  path: '/privacy',
  crumb: 'Privacy',
  seoTitle: 'Privacy policy',
  description:
    'How mhfrough.dev handles personal data: no cookies, no analytics, no trackers, a contact form that opens your own email app, and your rights.',
  title: 'Privacy policy',
  soft: 'Short, because little is collected.',
  updated: UPDATED,
  summary: [
    'This site sets no cookies and runs no analytics, ads or trackers.',
    'The contact form does not send anything to a server. It opens your own email app with a drafted message.',
    'The only personal data I receive is what you choose to email me. The hosting provider also keeps standard request logs.',
    'I never sell your data, share it for marketing or use it to profile you.',
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
            `${SITE.domain} is the personal site of ${SITE.name}, a software architect based in ${SITE.localityLabel}, ${SITE.country}. I decide how personal data sent through this site is used, and I am responsible for it. You can reach me at `,
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
            'Downloading an icon or brand file is a plain file download. It is not tracked.',
          ],
        },
        {
          p: 'The only personal data that reaches me is what you choose to send by email, and the hosting provider keeps its own request logs, described below.',
        },
      ],
    },
    {
      id: 'hosting',
      title: 'Hosting and server logs',
      blocks: [
        {
          p: 'Like every website, the pages are delivered by a hosting provider. To keep the service running and secure, the provider may keep standard request logs: your IP address, browser type, the page requested and the time. I do not use these logs to identify or profile visitors. The provider handles them under its own privacy policy and keeps them for as long as its own policy says.',
        },
      ],
    },
    {
      id: 'assets',
      title: 'Fonts, images and scripts',
      blocks: [
        {
          p: 'Fonts (Geist and Geist Mono), icons, images, photos and scripts are all served from this domain. Browsing the site does not contact Google Fonts, a CDN or any other third party.',
        },
      ],
    },
    {
      id: 'media',
      title: 'Embedded media',
      blocks: [
        {
          p: [
            'The home page and the ',
            { text: 'Quorum case study', href: '/work/quorum' },
            ' show two short videos hosted on GitHub Pages (mhfrough.github.io). Their preview images come from this site, and the video file only loads when you press play. At that point your browser connects to GitHub, which receives your IP address and browser details, as with any website you visit. ',
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
            ' does not send your details to any server, and no form service is used. When you press Send message, it opens your own email app with a drafted message addressed to me. Nothing reaches me until you press send there.',
          ],
        },
        {
          p: 'While you type, an unsent draft is kept in your browser session storage so a reload does not lose it. It stays on your device and is deleted when you close the tab or once the email is drafted.',
        },
        {
          p: 'When you email me, I receive what you choose to send, usually your name, email address, the topic, and your message, plus any budget, timeline or brief you added. Your email provider and mine also handle the message, as with any email.',
        },
      ],
    },
    {
      id: 'purpose',
      title: 'Why I use it, and on what basis',
      blocks: [
        {
          p: 'I use what you send only to read and answer your message, to discuss the work you asked about, and to keep a record of that conversation. In plain words, the legal reasons are:',
        },
        {
          ul: [
            'you asked me to reply, or to look at work before any agreement is made',
            'you agreed to it by ticking the box on the contact form, and you can withdraw that at any time by email',
            'I have a fair, ordinary interest in answering messages, keeping records of my work and keeping this site secure',
            'the law sometimes requires me to keep or disclose records',
          ],
        },
        {
          p: 'I do not use your data for marketing, I do not add you to a mailing list, and I do not make automated decisions about you.',
        },
      ],
    },
    {
      id: 'sharing',
      title: 'Who else handles it',
      blocks: [
        {
          p: 'I never sell your data or share it with anyone for their own marketing. A few services handle it on my behalf, only to deliver what you asked for:',
        },
        {
          ul: [
            'the hosting provider that serves these pages and keeps request logs',
            'the email provider that stores my inbox',
            'GitHub, only for the Quorum videos and only when you press play',
          ],
        },
        {
          p: 'There is no form service, analytics provider or advertising partner. I may also disclose information if the law requires it, or where it is needed to protect my rights, safety or property, or to deal with a legal claim.',
        },
      ],
    },
    {
      id: 'retention',
      title: 'How long I keep it',
      blocks: [
        {
          p: 'I keep emails for as long as the conversation and any resulting work need them, and after that only for as long as I reasonably need them for my records, to meet a legal duty or to resolve a dispute. Then I delete them. You can ask me to delete them sooner, unless I have to keep them for one of those reasons.',
        },
        {
          p: 'Hosting logs are kept by the hosting provider on its own schedule, which I do not control.',
        },
      ],
    },
    {
      id: 'security',
      title: 'Security',
      blocks: [
        {
          p: 'The site is served over HTTPS with strict security headers, and it has no database or accounts that could leak. I take reasonable care with the email I receive.',
        },
        {
          p: 'Still, no website, email service or method of storage is perfectly secure, and I cannot guarantee the security of anything sent over the internet. Email is not encrypted end to end. Please do not send passwords, financial details, confidential business information or sensitive personal data through the form or by email.',
        },
      ],
    },
    {
      id: 'transfers',
      title: 'International transfers',
      blocks: [
        {
          p: `I am based in ${SITE.country}. The hosting and email providers I use may store and process data in other countries, including the United States. When you contact me, your message is handled in ${SITE.country} and wherever those providers operate, which may have different data protection laws from yours. I only use well-known providers that publish their own privacy and security terms.`,
        },
      ],
    },
    {
      id: 'children',
      title: 'Children',
      blocks: [
        {
          p: 'This site is meant for adults looking for a software architect. It is not directed at children under 16, and I do not knowingly collect their data. If you believe a child has sent me personal data, email me and I will delete it.',
        },
      ],
    },
    {
      id: 'links',
      title: 'Links to other sites',
      blocks: [
        {
          p: 'Links to LinkedIn, GitHub, Dribbble and live project sites open those services. I do not control them, and their own privacy policies apply once you are there.',
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
            'object to how it is used, or withdraw your consent',
          ],
        },
        {
          p: [
            'Write to ',
            mail,
            '. I may need to confirm it is really you before I act. I will answer within 30 days, and I may decline only where the law allows, for example if I must keep a record. If you are in the UK or the EU, you can also complain to your local data protection authority.',
          ],
        },
      ],
    },
    {
      id: 'changes',
      title: 'Changes to this policy',
      blocks: [
        {
          p: 'I may update this policy at any time. When it changes, the date at the top of the page changes with it. Material changes, such as a new service that handles your data, are described here before they go live.',
        },
      ],
    },
    {
      id: 'questions',
      title: 'Questions',
      blocks: [
        {
          p: ['Questions about this policy or your data are welcome at ', mail, '.'],
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
    'Terms of use for mhfrough.dev: content and downloads are owned by the author, the site is provided as is, no advice and no client relationship, and the laws of Pakistan apply.',
  title: 'Terms of use',
  soft: 'The ground rules for this site.',
  updated: UPDATED,
  summary: [
    'Everything here, including the writing, design, icons, brand files and photos, is mine. All rights reserved.',
    'Downloads are for personal viewing and evaluation only. Any other use needs my written permission first.',
    'The site is provided as is, with no warranties, and it is general information, not advice.',
    'Browsing or sending a message creates no client relationship. Work starts only with a separate signed agreement.',
    'These terms follow the laws of Pakistan, with the courts of Karāchi.',
  ],
  sections: [
    {
      id: 'about',
      title: 'About these terms',
      blocks: [
        {
          p: [
            `These terms cover your use of ${SITE.domain}, the personal site of ${SITE.name} ("I", "me"). By using the site you accept them, together with the `,
            { text: 'privacy policy', href: '/privacy' },
            ' and the ',
            { text: 'cookie policy', href: '/cookies' },
            '. If you use the site for an organisation, you accept them for that organisation too. If you do not agree, please do not use the site.',
          ],
        },
      ],
    },
    {
      id: 'no-advice',
      title: 'Information only, not advice',
      blocks: [
        {
          p: 'The site is general information about me and my work. Nothing on it is professional, legal, financial, investment, tax or technical advice for your situation, and it is not a recommendation to buy, build or invest in anything. Code, commands and architecture shown are examples. Do not rely on them without checking them yourself or getting advice from a qualified professional.',
        },
      ],
    },
    {
      id: 'portfolio',
      title: 'Portfolio and case studies',
      blocks: [
        {
          ul: [
            'Case studies and project descriptions are summaries. They are simplified, they reflect my own view and memory of the work, and they may leave out details on purpose.',
            'Figures such as years of experience or number of products are my own count, given in good faith.',
            'Real projects are built by many people. Their outcomes depend on clients, teams, vendors and circumstances, and I do not claim sole credit for them or promise similar results for you.',
            'Some client names are withheld on purpose. Where a product is named, shown or linked, it is only to show work I contributed to. Screenshots show a product as it looked at one point in time.',
            'Nothing on this site implies endorsement, sponsorship or partnership by any company, client or employer, past or present. My views are my own.',
          ],
        },
      ],
    },
    {
      id: 'ownership',
      title: 'Ownership of content',
      blocks: [
        {
          p: `Unless stated otherwise, everything on this site belongs to ${SITE.name}, all rights reserved. That includes:`,
        },
        {
          ul: [
            'the text, case studies, page designs, layouts and code shown on the site',
            'the ء mark, the logo files and the rest of the brand system',
            'illustrations, patterns and the weather icon set, static and animated',
            'photos of me and any other photos taken by me',
          ],
        },
        {
          p: 'You may quote short excerpts of text with credit and a link back. You may not copy pages, case studies, designs or artwork, in whole or in large part, or present them as your own.',
        },
        {
          p: 'Product names, logos, screenshots and trademarks of third parties belong to their owners and appear only to describe work. Their use here does not give you any right to use them.',
        },
      ],
    },
    {
      id: 'downloads',
      title: 'Downloads',
      blocks: [
        {
          p: 'Some files can be downloaded, such as the weather icons on the work page and the logo files on the brand page. They are offered for personal viewing and evaluation only, for example to look at the detail or to judge my work. Downloading a file does not give you a licence to use it.',
        },
        {
          p: 'Without my prior written permission, you may not:',
        },
        {
          ul: [
            'use the files in any product, app, website, template, presentation or publication',
            'redistribute, sell, sublicense or share them, alone or inside an icon pack, kit or library',
            'use them for any commercial purpose',
            'edit them or make derived works and publish the result',
            'use the ء mark or any brand file as your own logo, or in a way that suggests a link to me',
            'use them, or anything else on this site, to train, fine-tune or test an AI or machine learning model',
          ],
        },
        {
          p: ['To ask for permission, email ', mail, ' and describe the use. Permission is only valid in writing from me.'],
        },
      ],
    },
    {
      id: 'likeness',
      title: 'My name, photos and likeness',
      blocks: [
        {
          p: 'My name, photos, voice and likeness may not be copied, edited, reproduced or published, and may not be used to create AI generated images, video, voice, avatars or deepfakes of me. You may not use them to impersonate me, to suggest that I endorse or am connected with anything, or in any advertising, without my prior written permission.',
        },
      ],
    },
    {
      id: 'automated',
      title: 'Scraping and AI use',
      blocks: [
        {
          p: 'Search engines may index the site to show it in search results. Apart from that, you may not scrape, crawl or copy the site at scale, collect its content into datasets, or use any of it to train or improve AI systems, without my prior written permission.',
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
            ', are licensed under the terms in each repository (Quorum uses the MIT licence). For that code, the repository licence applies instead of these terms. Install commands shown on the site run software on your own machine: read the script first and run it at your own risk. Open-source software is provided without warranty, as its licence says.',
          ],
        },
      ],
    },
    {
      id: 'use',
      title: 'Acceptable use',
      blocks: [
        { p: 'When using this site, you agree not to:' },
        {
          ul: [
            'attack, probe, overload or disrupt the site or its hosting, or try to get around its security',
            'upload or send malware, spam or automated messages, or abuse the contact form',
            'impersonate me or anyone else, or misrepresent a connection with me',
            'frame or mirror the site, or present its content under another name or domain',
            'use the site for anything unlawful or harmful',
          ],
        },
        {
          p: ['If you find a security issue, please report it privately to ', mail, ' and do not test it against the live site.'],
        },
      ],
    },
    {
      id: 'relationship',
      title: 'No client relationship',
      blocks: [
        {
          p: 'Browsing the site, downloading a file or sending me a message does not create a client, employment, agency, partnership or any other relationship between us. It also does not oblige me to reply, to take on work or to keep what you send confidential.',
        },
        {
          p: [
            'Any project, retainer, review or job starts only under a separate written agreement signed by both of us, with its own scope, price and terms. That agreement, not this site, then governs the work. Prices, ranges, timelines, availability and anything produced by the scope builder on the ',
            { text: 'Hire', href: '/hire' },
            ' page are non-binding estimates, not offers, and can change at any time.',
          ],
        },
      ],
    },
    {
      id: 'confidential',
      title: 'Do not send confidential information',
      blocks: [
        {
          p: 'Please do not send confidential or proprietary information, trade secrets, passwords, or personal data about other people through the form or by email before we have a signed agreement that covers it, such as a non-disclosure agreement. I treat messages with ordinary discretion, but no duty of confidentiality arises until then. If you send ideas or suggestions without one, I have no obligation to you about them, and I may already be working on similar ideas.',
        },
      ],
    },
    {
      id: 'external',
      title: 'Third-party links and services',
      blocks: [
        {
          p: 'The site links to and uses other websites and services, including LinkedIn, GitHub, Dribbble, GitHub Pages and live product sites. I do not control them and am not responsible for their content, availability, security or privacy practices. Your use of them is at your own risk and under their own terms.',
        },
      ],
    },
    {
      id: 'warranty',
      title: 'No warranty',
      blocks: [
        {
          p: 'The site, its content and every download are provided "as is" and "as available", without warranties of any kind, express or implied. To the fullest extent the law allows, I disclaim all warranties, including that the site or any file is accurate, complete, current, fit for a particular purpose, free of errors, viruses or other harmful code, does not infringe anyone\'s rights, or will be available without interruption. Information such as availability, skills and project descriptions can change without notice. You use the site and its files at your own risk.',
        },
      ],
    },
    {
      id: 'liability',
      title: 'Limitation of liability',
      blocks: [
        {
          p: 'To the fullest extent permitted by law, I am not liable for any loss or damage of any kind arising from or connected with the site, including direct, indirect, incidental, special, consequential or punitive loss, loss of profit, revenue, business, goodwill or data, and loss caused by downtime, errors, interruptions, downloads, links to other sites, or your reliance on any content. This applies whatever the legal basis of the claim, and even if I was told such loss was possible.',
        },
        {
          p: 'If I am found liable despite this, my total liability for all claims about the site is limited to the amount you paid to use it, which is nothing, or the lowest amount the law allows. Nothing in these terms limits liability that cannot be limited by law.',
        },
      ],
    },
    {
      id: 'indemnity',
      title: 'Indemnity',
      blocks: [
        {
          p: 'If you misuse the site or its content, break these terms, or break the law or anyone else\'s rights while using it, you agree to compensate me and hold me harmless for any resulting claims, losses, damages and costs, including reasonable legal fees.',
        },
      ],
    },
    {
      id: 'changes',
      title: 'Changes to the site and these terms',
      blocks: [
        {
          p: 'I may change, suspend or remove any part of the site, its content or its downloads, and I may change these terms, at any time and without notice. I may also block access for anyone who breaks them. The date at the top shows the latest version. If you keep using the site after a change, you accept the new terms.',
        },
      ],
    },
    {
      id: 'general',
      title: 'General',
      blocks: [
        {
          ul: [
            'If any part of these terms is found invalid or unenforceable, that part is limited as little as needed, and the rest stays in full effect.',
            'If I do not enforce a right under these terms, or enforce it late, I have not waived it.',
            'These terms, the privacy policy and the cookie policy are the entire agreement between us about your use of the site. A separate signed agreement for a project governs that project.',
            'You may not transfer your rights under these terms. Headings are for reading ease only.',
          ],
        },
      ],
    },
    {
      id: 'law',
      title: 'Governing law',
      blocks: [
        {
          p: `These terms, and any dispute about the site or these terms, are governed by the laws of ${SITE.country}. The courts of ${SITE.localityLabel}, Sindh, ${SITE.country} have exclusive jurisdiction. This does not take away any rights that the law of your own country gives you as a consumer and that cannot be excluded by agreement.`,
        },
      ],
    },
    {
      id: 'contact',
      title: 'Questions',
      blocks: [
        {
          p: ['Questions about these terms, and requests for permission, are welcome at ', mail, '.'],
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
    'The notice at the bottom of the page only informs: there is nothing to consent to. Closing it saves one local storage flag so it stays closed.',
    'The contact form keeps an unsent draft in your browser session storage. It never leaves your device.',
    'Sites linked from here have their own cookie policies.',
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
          p: 'Two small things, both in your own browser storage, never in cookies, and never sent to me or anyone else:',
        },
        {
          ul: [
            'When you close the cookie notice, a local storage entry named mh:cookie-notice with the value closed, so the notice does not come back. It holds nothing about you. Clear site data to remove it.',
            [
              'If you use the ',
              { text: 'contact form', href: '/contact' },
              ', an unsent draft in session storage named mh.contact.draft while you type, so a reload does not lose your message. It contains only what you typed, is never sent to a server, and is deleted when you close the tab or once the email is drafted.',
            ],
          ],
        },
        {
          p: 'Downloading an icon or brand file, or using a copy button, stores nothing.',
        },
      ],
    },
    {
      id: 'third-parties',
      title: 'Third parties',
      blocks: [
        {
          p: [
            'There are no analytics, ads or social widgets. The only outside content is the two Quorum videos on the home page and the ',
            { text: 'Quorum case study', href: '/work/quorum' },
            ', served from GitHub Pages when you press play. That is a plain file download, and GitHub handles it under its own privacy statement.',
          ],
        },
        {
          p: 'Links to LinkedIn, GitHub, Dribbble and live project sites take you to those services. They may set their own cookies once you are there, and their own cookie and privacy policies apply. I do not control them and am not responsible for them.',
        },
      ],
    },
    {
      id: 'control',
      title: 'Controlling cookies',
      blocks: [
        {
          p: 'There is nothing to opt out of here. Your browser settings let you block or delete cookies and site storage for every site, which also covers the services linked from this one.',
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
            ' will name the provider, and you will be asked for consent wherever the law requires it. Questions are welcome at ',
            mail,
            '.',
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
            'Downloadable icons and brand files are images and carry no text description inside the file. If you need one described, email me.',
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
          p: 'I aim to reply within five working days. If a fix takes longer, I will try to send you the content you need in another format in the meantime.',
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
          p: 'This statement is based on a self-assessment, with automated checks and manual keyboard testing. It has not been audited by an independent body. It was last reviewed on the date at the top of this page.',
        },
      ],
    },
    {
      id: 'best-effort',
      title: 'Best effort, not a warranty',
      blocks: [
        {
          p: [
            'This statement describes my aims and the work done so far, in good faith. It is a best-effort statement, not a guarantee that every page meets every criterion at all times, and it creates no warranty or legal obligation. The ',
            { text: 'terms of use', href: '/terms' },
            ' still apply in full.',
          ],
        },
      ],
    },
  ],
};
