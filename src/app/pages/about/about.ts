import { ChangeDetectionStrategy, Component, afterNextRender, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  phosphorAirplaneTilt,
  phosphorArrowRight,
  phosphorBrowser,
  phosphorCode,
  phosphorDatabase,
  phosphorDribbbleLogo,
  phosphorFilmSlate,
  phosphorForkKnife,
  phosphorGameController,
  phosphorGlobeHemisphereEast,
  phosphorGlobe,
  phosphorGraduationCap,
  phosphorHandshake,
  phosphorHouseLine,
  phosphorJoystick,
  phosphorMountains,
  phosphorMusicNotes,
  phosphorPencilLine,
  phosphorPencilSimpleLine,
  phosphorPenNib,
  phosphorPersonSimpleHike,
  phosphorPingPong,
  phosphorPlant,
  phosphorQuotes,
  phosphorRocketLaunch,
  phosphorSnowflake,
  phosphorSun,
  phosphorTelevisionSimple,
  phosphorTreeStructure,
  phosphorTruck,
  phosphorUsersThree,
  phosphorGift,
  phosphorRobot,
} from '@ng-icons/phosphor-icons/regular';
import { PERSON_ID, Seo, abs } from '../../core/seo/seo.service';
import { SITE } from '../../core/site.config';
import { Reveal } from '../../shared/directives/reveal.directive';
import { Logo } from '../../shared/ui/logo';
import { Pattern } from '../../shared/ui/pattern';
import { Skeleton } from '../../shared/ui/skeleton';
import { ABOUT_COPY } from './about.copy';
import { COVERS } from './about.covers';
import { GALLERY } from './about.photos';
import { PhotoGallery } from './photo-gallery';
import { ProfileCard } from './profile-card';

const PATH = '/about';

@Component({
  selector: 'mh-page-about',
  imports: [RouterLink, NgIcon, Reveal, Logo, Pattern, Skeleton, ProfileCard, PhotoGallery],
  viewProviders: [
    provideIcons({
      phosphorAirplaneTilt,
      phosphorArrowRight,
      phosphorBrowser,
      phosphorCode,
      phosphorDatabase,
      phosphorDribbbleLogo,
      phosphorFilmSlate,
      phosphorForkKnife,
      phosphorGameController,
      phosphorGlobeHemisphereEast,
      phosphorGlobe,
      phosphorGraduationCap,
      phosphorHandshake,
      phosphorHouseLine,
      phosphorJoystick,
      phosphorMountains,
      phosphorMusicNotes,
      phosphorPencilLine,
      phosphorPencilSimpleLine,
      phosphorPenNib,
      phosphorPersonSimpleHike,
      phosphorPingPong,
      phosphorPlant,
      phosphorQuotes,
      phosphorRocketLaunch,
      phosphorSnowflake,
      phosphorSun,
      phosphorTelevisionSimple,
      phosphorTreeStructure,
      phosphorTruck,
      phosphorUsersThree,
      phosphorGift,
      phosphorRobot,
    }),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './about.html',
  styleUrl: './about.scss',
})
export class About {
  protected readonly c = ABOUT_COPY;
  protected readonly gallery = GALLERY;
  protected readonly covers = COVERS;
  protected readonly dribbble = SITE.social.dribbble;
  protected readonly extraIcons: Record<string, string> = {
    Travel: 'phosphorAirplaneTilt',
    Music: 'phosphorMusicNotes',
    Food: 'phosphorForkKnife',
  };
  protected readonly ready = signal(false);

  constructor() {
    const url = abs(PATH);
    inject(Seo).set({
      title: ABOUT_COPY.seo.title,
      description: ABOUT_COPY.seo.description,
      path: PATH,
      type: 'profile',
      image: '/og/og-about.jpg',
      imageAlt: ABOUT_COPY.seo.imageAlt,
      breadcrumbs: [{ name: 'About', path: PATH }],
      jsonLd: [
        {
          '@type': 'AboutPage',
          '@id': url + '#about',
          url,
          name: `About ${SITE.name}`,
          description: ABOUT_COPY.seo.description,
          mainEntity: { '@id': PERSON_ID },
          ...(GALLERY.length
            ? {
                hasPart: {
                  '@type': 'ImageGallery',
                  name: ABOUT_COPY.gallery.title,
                  image: GALLERY.map((p) => ({ '@type': 'ImageObject', contentUrl: abs(p.src), caption: p.caption, creator: { '@id': PERSON_ID } })),
                },
              }
            : {}),
        },
      ],
    });

    afterNextRender(() => requestAnimationFrame(() => this.ready.set(true)));
  }
}
