import { ChangeDetectionStrategy, Component, afterNextRender, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  phosphorArrowRight,
  phosphorArrowUpRight,
  phosphorBrowser,
  phosphorBuildings,
  phosphorChartBar,
  phosphorDeviceMobile,
  phosphorMessengerLogo,
  phosphorRobot,
  phosphorTray,
  phosphorWhatsappLogo,
} from '@ng-icons/phosphor-icons/regular';
import { PERSON_ID, Seo, abs } from '../../../core/seo/seo.service';
import { Reveal } from '../../../shared/directives/reveal.directive';
import { TechPills } from '../stack/tech-pills';
import { O2chatBotDemo } from './bot-demo';
import { O2chatHubDemo } from './hub-demo';
import { O2chatInboxDemo } from './inbox-demo';
import { COPY, LIVE_URL } from './o2chat.copy';
import { O2chatTheme } from './o2chat-theme';
import { O2chatWidgetDemo } from './widget-demo';

const PATH = '/work/o2chat';
const OG_IMAGE = '/og/og-o2chat.jpg';

/**
 * O2Chat case study: an omnichannel customer-engagement inbox, B2B and multi-tenant. The route wears the speech
 * bubble's blues via <html data-theme="o2chat">. The public site appears as screenshots of the live pages (no
 * people and no names in any frame). The agent portal appears twice: as real screenshots of its local build run
 * with invented sample data (an owner-approved exception, scripts/o2chat-app-shots.mjs), and as my working inbox
 * mockup in the hero. The widget, the AI bot and the hub connection are my own mockups with invented people.
 */
@Component({
  selector: 'mh-page-o2chat',
  imports: [RouterLink, NgIcon, Reveal, O2chatTheme, O2chatInboxDemo, O2chatHubDemo, O2chatWidgetDemo, O2chatBotDemo, TechPills],
  viewProviders: [
    provideIcons({
      phosphorArrowRight,
      phosphorArrowUpRight,
      phosphorBrowser,
      phosphorBuildings,
      phosphorChartBar,
      phosphorDeviceMobile,
      phosphorMessengerLogo,
      phosphorRobot,
      phosphorTray,
      phosphorWhatsappLogo,
    }),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './o2chat.html',
  styleUrl: './o2chat.scss',
})
export class O2chatCaseStudy {
  protected readonly c = COPY;
  protected readonly live = LIVE_URL;
  protected readonly ready = signal(false);

  constructor() {
    const url = abs(PATH);
    inject(Seo).set({
      title: COPY.seo.title,
      description: COPY.seo.description,
      path: PATH,
      type: 'article',
      image: OG_IMAGE,
      imageAlt: COPY.seo.imageAlt,
      breadcrumbs: [
        { name: 'Work', path: '/work' },
        { name: 'O2Chat', path: PATH },
      ],
      jsonLd: [
        {
          '@type': 'Article',
          '@id': url + '#article',
          headline: 'O2Chat: every channel, one inbox',
          description: COPY.seo.description,
          inLanguage: 'en',
          image: abs(OG_IMAGE),
          author: { '@id': PERSON_ID },
          publisher: { '@id': PERSON_ID },
          mainEntityOfPage: { '@id': url + '#webpage' },
          about: { '@type': 'SoftwareApplication', name: 'O2Chat', applicationCategory: 'BusinessApplication', url: LIVE_URL },
          keywords: ['Angular', 'SignalR', 'real-time', 'omnichannel inbox', 'embeddable chat widget', 'multi-tenant SaaS', 'AI chatbot', 'Angular Universal'],
        },
      ],
    });

    afterNextRender(() => requestAnimationFrame(() => this.ready.set(true)));
  }
}
