# Weather icons reel: script

**Length:** 24.7 s. **Format:** vertical 9:16 (Instagram Reels, TikTok, Shorts, X). **Page:** `reel.html`.
**Goal:** show off the 25 animated weather icons from /work and get comments: viewers comment CLOUD, the owner
sends them the link. **Look:** the site's own black (#111, #1a1a1a cards, #ededed ink) on a faint 54 px designer's
grid; EB Garamond for the headlines, Geist and Geist Mono for the app and the end card.
**Status:** picture waiting for the owner's approval. Sound, voiceover and render come after.

## Script

| # | Time | On screen | Voiceover | Sound |
|---|---|---|---|---|
| 1 | 0.0 to 1.2 | A giant serif **25** | (none) | Bass drop and a soft sub hit on the 25 |
| 2 | 1.2 to 4.0 | "Want icons that / *move like this?*" · 25 CUSTOM ICONS · ALL ANIMATED · the wall of all 25 icons, every one moving | "Want icons that move like this?" | Pluck melody starts; a light pop per row as the wall builds |
| 3 | 4.0 to 4.8 | The camera dives into the first icon (Cloud) | (none) | Whoosh into the zoom |
| 4 | 4.8 to 13.0 | "Animated down to / *the smallest detail.*" · a quick slide through all 25 icons, each with its name, number, group and its own `@keyframes` names (float, drift, fall, flash, spin, twinkle ...). The first three hold, then it speeds up | "Every one custom made, and animated down to the smallest detail." | Soft tick on every slide; the beat doubles when the slide speeds up |
| 5 | 13.0 to 17.0 | READY FOR A REAL APP · a weather app: Karāchi, Pakistan, Sunny 31°, H 33° L 26°, hourly row, four days | "Drop them straight into a real app." | Pad opens up; small chime as the card lands |
| 6 | 17.0 to 20.7 | The cloud icon · *Comment* **CLOUD** · a comment box types CLOUD and sends · *and I'll send you the link.* · reply: "Sent you the link." | "Want your own? Comment cloud, and I'll send you the link." | Typing clicks, a send pop, a message chime on the reply |
| 7 | 20.7 to 24.7 | End card: ء tile, Mohammad Hamza, Software architect · @mhfrough, github.com/mhfrough types in, MORE FREE TOOLS: Flick, Sizzle, Scrawl, Pinch, Swoop, Jot | "More free tools on my GitHub." | Music resolves, bass out, last note rings |

## Voiceover (about 2.5 words a second, calm and warm)

| Starts at | Line |
|---|---|
| 1.4 | Want icons that move like this? |
| 5.0 | Every one custom made, and animated down to the smallest detail. |
| 13.3 | Drop them straight into a real app. |
| 17.2 | Want your own? Comment cloud, and I'll send you the link. |
| 21.2 | More free tools on my GitHub. |

## Claims check

- 25 icons, every one animated: `src/app/pages/work/weather-icons/weather-icons.data.ts` lists 25, each with its `motion` keyframes.
- The keyframe names on each slide are the icon's own (`motion` in the data file).
- The weather app is a concept frame made with the icons, not a shipped app; the kicker says "Ready for a real app".
- github.com/mhfrough and the six tools are the owner's.

## Sound plan (after the picture is approved)

- **Music:** bright pluck-pop with a warm bass line, around 112 BPM, the drop on the 25 at 0.1 s and a lift at the
  speed-up (6.7 s). Either a royalty-free track (shortlist for the owner) or one made with `synth.py bed`.
- **SFX (soft palette):** sub hit, row pops, zoom whoosh, a tick per slide, chime on the app card, typing, send pop,
  reply chime.
- **Voiceover:** the lines above, recorded by the owner or with ElevenLabs; the music ducks under it.

## Direction

Behind-the-scenes on a black designer's canvas: a giant serif number opens, the icon wall builds, one continuous
take dives into the first icon and springs through all 25, then a Karāchi weather app, the comment ask and the
site's end card. Checked with Sizzle's `fingerprint.py`: direction 14% like the closest reel (swoop-windows),
look 74% (fail at 86%).
