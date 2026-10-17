# Befiler reel: Tax returns, filed from any app

**Length:** 26.5 seconds, 9:16 vertical (1080x1920)
**Visuals:** `promo/befiler/befiler-reel.html` (pure CSS, Befiler theme: Poppins, #e41e26, light surfaces).
Every beat is a fixed animation delay, so the voiceover has to follow the timing below.
**Status:** visuals for review. No voiceover or music recorded yet; the video render comes after the owner signs off.

## Preview

Serve the repo root (the `promo` entry in `.claude/launch.json`, or `npx http-server . -p 5529`) and open
`http://localhost:5529/promo/befiler/befiler-reel.html`. It scales to the window and autoplays; Replay restarts it and
the scrubber seeks to any moment. Exact stills: `node scripts/reel-stills.mjs promo/befiler/befiler-reel.html 2,6,12`.

## Voiceover draft (read this to ElevenLabs)

> Tax season again? Wealth statements, NTNs, deductions...
> Befiler turns your return into a few simple screens. Add your income, your wealth, and submit.
> And you don't have to leave your bank. The same widget lives inside six banking apps and a mobile wallet.
> In English, or in Urdu, right to left.
> Then the tax team reviews it and files it with FBR, and you watch every step.
> Befiler. Tax returns, filed from any app.

## Timing

| Time (s) | Line | On screen |
|---|---|---|
| 0.2 to 3.4 | Tax season again? Wealth statements, NTNs, deductions... | "Tax season? **Again?**" over two scrolling rows of form words |
| 3.8 to 8.2 | Befiler turns your return into a few simple screens. Add your income, your wealth, and submit. | "One return. **A few screens.**" Befiler phone: checks at 5.0, 5.6, 6.2; Submit pressed 6.75; "Submitted" seal 7.2 |
| 8.6 to 14.2 | And you don't have to leave your bank. The same widget lives inside six banking apps and a mobile wallet. | "Inside your **bank app.**" Widget re-skins every 0.87 s: HBL, Allied Bank, Bank Alfalah, MCB, Abhi, Easypaisa; partner logos pop in from 12.0 |
| 14.6 to 18.4 | In English, or in Urdu, right to left. | "English or Urdu. Right to left, built in." Card flips to Urdu (RTL) at 16.2 |
| 18.8 to 22.2 | Then the tax team reviews it and files it with FBR, and you watch every step. | "Then we **file it.**" Tracker lights 19.5, 19.95, 20.4, 20.95 (Submitted to FBR), 21.45 |
| 22.6 to 26.5 | Befiler. Tax returns, filed from any app. | Befiler mark, "Tax returns, **filed from any app.**", befiler.com button, "Case study at mhfrough.dev/work/befiler" |

## Delivery notes

- Say "Befiler" as BEE-fy-ler (be + filer).
- Leave about 0.2 s of silence at the start. Calm, confident, a little faster in the bank-app line.
- If a take drifts, shift the CSS delays in the HTML (`--d` / `--o` on headline lines, `--c`, `--a` / `--z`, `--l`,
  `--s`, and the `animation:` delays per scene). The scene comments list each scene's window.

## Render (later)

The page follows the Quorum reel contract (`window.reelReady`, `window.startReel()`, `window.REEL.duration`, `?render`),
so the Quorum `promo/tools` pipeline (render.js frames at 2x, mux.py for voice and music) can render it unchanged once a
voiceover exists.

## Rights

Bank and partner logos are shown as befiler.com shows them; the closing card says they belong to their owners.
