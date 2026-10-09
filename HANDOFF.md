# Handoff: Priyanka's birthday website

Paste or point a new session at this file. Repo: `Hpassi1891/HappyBirthday_Priyanka` (private), branch `main`. Latest preview artifact: https://claude.ai/artifact/QuQ93h7jngMoY3h5taYsRe (Version 15).

## What this is
A highly animated, immersive virtual birthday party site for the user's friend **Priyanka** (birthday **11 Nov**). Static site: vanilla JS ES modules, GSAP vendored in `vendor/`, canvas, Web Audio. **Laptop/desktop only**; phones and windows narrower than 900px see a "please open this on a laptop" message (gate in `js/main.js`, `#gate` in `index.html`, styles in `css/desktop.css`). Door stays locked with a countdown until 11 Nov; `?preview=1` bypasses it.

## In-jokes and tone (keep Hinglish, funny, loving)
She is **"chudail"**; the user is **"Rakshas"** (her name for him; real name Himanshu). She says **"hurrr" / "bhodam"** when angry; they call each other **"nasharam"**. She is preparing for **banking exams (SBI, IBPS)**, not "baking". Door puzzle: "Who is your Priya Mitar?" -> `rakshas` opens; `himanshu` -> funny refusal; anything else -> sassy line.

## Scene flow (`ORDER` in `js/main.js`)
door -> intro (flowers bloom -> "A surprise for Priyanka" card -> pull-and-release bow at a heart -> red full-screen wishes -> whiteout) -> room (dark painted mural, torch, light switch lights it up slowly; balloons pop) -> favwall (4 categories x 3) -> photos (clothesline of polaroids) -> gifts (single **lunch ticket**) -> cake (light candles, wish, blow via mic or swipe/tap fallback, trick candle, cut) -> finale (14-scene cartoon, see below) -> ending (heart-shaped blossom tree, play button, "watch it all again").
In the **cinema** look a full-screen typographic interlude card (`copy.interludes`) plays between scenes.

## The cartoon story (`js/lib/story.js`, `storyart.js`, `storyprops.js`)
Time-based (seconds), 60 fps SVG redrawn each frame, 4:3 frame (viewBox -50 10 400 300). 14 shots: laptop -> insta follow request -> accepted -> chatting for hours -> asks to meet -> black Meteor 350 ride -> Pan Fire (he stares) -> BFS (Harpreet Singh special pizza, chilly paneer, Fanta) -> Super Donuts (she stops his hand) -> Baskin Robbins (she accepts, feeds him back, he blushes) -> Starbucks (worst coffee) -> the fight -> they still care (jacket + chocolate) -> THE END ride into sunset. No letter/envelope. Each shot: `{id, dur, caption, sfx:{sec:name}, draw(t,p)}`. `tools/storyboard.html?per=5&shot=<id>` shows a contact sheet (serve over http).

## Looks
`body[data-look]` = `cinema` (default; cream/deep red/orange, serif) | `night` (dreamy sky) | `scrapbook` (diary). Look button cycles; `?look=` or localStorage `look`. `css/night.css` and `css/cinema.css` are structurally the same (cinema is a recoloured copy); `css/desktop.css` is the laptop layout and loads last; use the `body[data-look]` prefix there to beat per-look rules. Only the cinema look has been polished for desktop; night/scrapbook work but are less tuned.

## Files
`index.html`; `css/{base,scenes,night,cinema,story,desktop}.css`; `js/main.js` (scene manager, looks, transitions, interludes, gate); `js/scenes/*.js` (each `{mount(stage,ctx), unmount()}`); `js/lib/*` (audio engine, confetti, mural, story, blow, countdown, door logic); `content/*.json` (copy, favs, photos, gifts: all editable text/placeholders); `tests/`; `tools/storyboard.html`; `start.bat` / `start.sh` + `README.md` for running locally.

## Testing
Serve with `python3 -m http.server 8000` (it dies between tool calls in the cloud container; restart it each time). Then: `node --test tests/*.test.mjs` (18 logic tests), `node tests/audio.mjs`, `node tests/look.mjs`, `node tests/gate.mjs`, `LOOK=cinema|night|scrapbook node tests/finale.mjs`, and `LOOK=... node tests/smoke.mjs` (long, ~4 min; run the three in the background). Playwright uses `/opt/pw-browsers/chromium`; tests use a 1366x768 desktop viewport. All passing at last commit.

## Artifact preview workflow (cloud sessions)
The preview is a single-file build made by a scratchpad script `build.mjs` (esbuild IIFE bundle + inlined CSS and JSON via `window.__COPY__/__FAVS__/__PHOTOS__/__GIFTS__`, `window.__PREVIEW__=true`), then published with the Artifact tool to the same URL. That script is not in the repo; recreate if needed (the mic and downloads don't work inside the viewer).

## Conventions
Commit messages end with `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>` and `Claude-Session: <session url>`. Push to `origin main`; do not open PRs unless asked. No model identifiers in repo files. Use individual CSS transform properties (`translate/rotate/scale`) for ambient animation so GSAP's `transform` never conflicts; avoid heavy SVG filters.

## Open items / next steps
1. **Deployment walkthrough** (user is new to it): Cloudflare Pages (or Netlify) connected to the private GitHub repo, no build command, output directory `/`; test on a laptop; the door unlocks on 11 Nov.
2. The user will supply real **photos, favourites (movies/food/snacks/songs) and a voice note** to replace placeholders (`content/*.json`, `assets/`; voice note path goes in `copy.ending.audio`).
3. Games were skipped on purpose; could be added later as an extra scene.
4. Polish the night and scrapbook looks for desktop if the user wants to keep them (or remove them to simplify).
5. Pending question for the user: remove any remaining envelope props from old content? (The new story has none.)
6. Listen for the user's feedback on the cartoon's jokes/timing and the new sound effects (only level-tested, never heard by Claude).
