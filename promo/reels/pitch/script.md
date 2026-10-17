# Pitch reel: script

One continuous video in three chapters: intro, selected work, why hire me. Owner's script (drafted with ChatGPT,
2026-10-13), adapted to the site's copy rules. Page: `promo/reels/pitch/reel.html`. Not rendered yet.

- Length: about 71 s. Format: vertical 9:16 only (1080x1920, 4K master).
- Style: start fast (quick cuts), slow down for project proof, finish with a direct invitation.
- Audio: **voiceover** over one continuous music bed (ducked under the voice by `mux.py --vo`). Not recorded yet.
- One look throughout: the site's tokens, the Truchet field, the glass brand pill. A segmented "Intro / Work / Hire"
  pill at the top slides at each chapter change, with a full-screen ripple of the field, so the shift is clear.

## Changes from the original draft (copy rules)

| Draft | Reel | Why |
|---|---|---|
| "nearly seven years of production experience" | "7+ years of production experience, since 2020" | CLAUDE.md: experience reads "Since 2020, 7+ years" |
| "Quick cuts of your face" | quick cuts of the ء mark, mhfrough.dev, the fleet admin, Quorum and the tax widget | No photos of the owner anywhere |
| "Karachi" | "Karāchi" on screen | Site spelling |
| Text "Build · Contract · Review · Rescue" | four cards with those words, each lit as the voice says it | Same words, uses the site's cards |
| Tax and fleet products | not named | Products stay unnamed outside their case studies |

Screens: the fleet admin is my own mockup with invented data (as on /work/fleet), the tax widget and driver app are
drawn in HTML, Quorum is its public site.

## Voiceover and shots

Times are estimates at about 2.5 words a second. After recording, set `CUES` in `reel.html` to the real word timings.

| Time | Chapter | Voiceover | On screen |
|---|---|---|---|
| 0.0 to 3.4 | Intro | A production app is more than screens. | Four quick cuts (about 0.8 s each): mhfrough.dev hero, fleet admin, Quorum site, tax widget in a bank app |
| 3.4 to 9.2 | Intro | It needs architecture that can grow, and someone who can carry the work through to launch. | "Built right, / from day one." Then three layers stack up from the bottom: PostgreSQL, NestJS API, Angular apps. Then a solid pill: "Live in production" |
| 9.2 to 18.0 | Intro | I'm Mohammad Hamza, a software architect focused on Angular and full-stack SaaS, with 7+ years of production experience, since 2020. | ء tile, "Mohammad Hamza", "Software Architect · Angular · SaaS", tags: "Since 2020", "7+ years in production", "Full-stack SaaS" |
| 18.0 to 26.6 | Work | I helped build and later lead a four-app tax platform, with a filing flow embedded in six banking apps. | Kicker "Tax-filing platform". "4 Angular apps" over four cards (Public portal, Customer dashboard, Agent portal, Admin). At 22 s: "Embedded in 6 banking apps", a bank app phone with the filing widget, six host apps lighting up in turn |
| 26.6 to 35.8 | Work | On a fleet-management SaaS, I worked across the Angular admin, NestJS and PostgreSQL API, and Flutter driver apps. | Kicker "Fleet-management SaaS". Fleet admin in a browser frame (slow pan), chips "Angular", "NestJS", "PostgreSQL", "Flutter", then the driver app phone |
| 35.8 to 43.0 | Work | I also build my own products, including Quorum, an AI decision tool. | Quorum favicon, "Quorum / My own product", the Quorum site, tag "Seven AI agents, one verdict" |
| 43.0 to 50.4 | Hire | Bring me in to build from zero, join your team on contract, review architecture, or rescue an Angular app. | Kicker "Ways to work together", "Bring me in / where it helps most.", cards Build, Contract, Review, Rescue lit one by one |
| 50.4 to 56.6 | Hire | You'll get clear scope, small reviewed changes, written updates, and work delivered in your repo. | Kicker "What you get", "No surprises, / just steady work.", rows lit one by one: Clear scope, Small reviewed changes, Written updates, Delivered in your repo |
| 56.6 to 61.6 | Hire | I'm based in Karachi and overlap with UK and EU hours. | Kicker "Based in Karāchi, UTC+5", "Your morning, / my afternoon.", working-hours bars for Karāchi, UK, EU with the shared window outlined, tag "4 to 5 shared hours" |
| 61.6 to 71.0 | Hire | Need someone who can think through the system and ship the details? Let's talk at mhfrough.dev/hire. | End card: ء tile, "Mohammad Hamza", "Software Architect", status pill "Taking on new projects", `https://mhfrough.dev/hire` typed in at the URL line. Holds still for the last 5 s |

## Still to decide

1. Who records the voiceover (owner, or a synthetic voice) and the music bed (`music.py` makes 24 s at 120 BPM today;
   it needs a 71 s version, or a licensed track).
2. Burned-in captions: most social video plays muted. The on-screen text carries the story, but full captions could be
   added as a line above the bottom safe zone.
3. Where the video sits on the site.
