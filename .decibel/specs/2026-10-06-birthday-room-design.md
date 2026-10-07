# Priyanka's Birthday Room — Design Spec

Date: 2026-10-06 · Birthday: 11 Nov · Audience: Priyanka (phone + laptop)

## Goal
A highly interactive, cute pink "virtual birthday party" website. She walks through a
sequence of scenes: unlock door, decorated room (with fav wall), photo wall, gifts,
cake, blow candles, cut cake, finale letter.

## Tech
- Static site, no backend, no build step. Vanilla JS (ES modules), GSAP (CDN or vendored),
  Canvas for confetti/fireworks, Web Audio API for sounds + mic blow detection.
- Mobile-first responsive; works on desktop. Touch + mouse input.
- Hosting: Netlify or Cloudflare Pages (free), repo kept private. Owner is new to it, so the
  deploy step is a guided walkthrough at the end.

## Visual style
Cute, loving, pink. Blush/rose/baby pink, cream, gold sparkle. Rounded handwritten font for
notes + rounded sans for UI. Hand-drawn style SVG, soft shadows, bouncy easing.
Mute toggle always visible.

## Scenes
1. **Countdown + Door** — before 11 Nov: countdown, door locked. On/after 11 Nov (or with a
   secret preview query param for testing): door prompt "Who is your Priya Mitar?"
   - `rakshas` (case-insensitive, trimmed) -> opens with confetti.
   - `himanshu` -> funny refusal, stays locked.
   - anything else -> random sassy Hinglish reply ("hurrr!", "nasharam").
   - Answers stored hashed, not plain text.
2. **Decorated room** — tappable balloons that pop, drag-to-place banner letters
   ("HAPPY BIRTHDAY CHUDAIL"), light switch (fairy lights + disco ball), party popper,
   banking-exam themed touches ("future bank officer" plaque, study snacks).
3. **Fav wall** — a wall in the room with framed/pinned image decorations for her favourites:
   movies, food, and more categories. Tap an item to zoom it with a short caption.
   Content driven by a `content/favs.json` file (category, title, image path, caption),
   placeholder images for now.
4. **Photo wall** — polaroids on strings; tap to flip and read a note. Placeholders for now,
   data in `content/photos.json`.
5. **Gift table** — tap-to-unwrap gifts: voice note (added later), poem, coupon, banker joke.
6. **Cake** — tap to light candles one by one; Happy Birthday tune plays.
7. **Blow candles** — mic blow detection extinguishes flames with smoke; fallback to swipe
   if mic denied/unavailable. Trick-candle relight gag with "hurrr".
8. **Cake cutting** — drag knife across cake; slice slides onto plate; cheer + sparkles.
9. **Finale** — fireworks, self-typing Hinglish letter, downloadable keepsake card image.

## Content / voice
Hinglish. In-jokes: chudail, rakshas, hurrr, bhodam, nasharam (cute besharam). She is
preparing for banking exams (SBI, IBPS) -> bank-officer plaque, banker joke + good-luck note. All copy lives in
`content/*.json` so it can be edited without touching code.

## Out of scope (v1)
Games (to be added later as an extra scene), guest book/backend, selfie camera, custom music.

## Error handling
- Mic denied -> swipe fallback. Audio autoplay blocked -> start audio after first tap.
- Missing images -> placeholder fallback. localStorage failures tolerated.

## Testing
Manual on phone + desktop browsers; Playwright smoke test for door logic (rakshas /
himanshu / other) and scene progression.
