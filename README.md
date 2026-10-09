# 🎂 A surprise for Priyanka

A birthday website made for a **laptop / desktop screen** (phones get a "please open this on a laptop" message).
Plain HTML, CSS and JavaScript. There is nothing to install and nothing to build.

## Run it on your own computer

The site uses JavaScript modules, so it must be served by a tiny local web server (double-clicking `index.html` will not work).

**Windows:** double-click **`start.bat`**.
**Mac / Linux:** run `./start.sh` in a terminal (the first time: `chmod +x start.sh`).

Both open <http://localhost:8000/?preview=1> in your browser. `?preview=1` skips the countdown so you can test the whole thing before 11 November.
(Without it the door stays locked, with a countdown, until 11 November.)

No script? Any static server works, for example `python -m http.server 8000` or `npx serve`, from this folder.

### Handy addresses while testing
| Address | What it does |
|---|---|
| `/?preview=1` | Start from the door, with the countdown skipped |
| `/?scene=intro` | Jump straight to any scene: `door`, `intro`, `room`, `favwall`, `photos`, `gifts`, `cake`, `finale`, `ending` |
| `/?scene=finale&fast=1` | Play the cartoon 8x faster (for testing) |
| `/?look=night` / `?look=scrapbook` | Other themes (the default is the cinematic one; the 🎬/🌙/📓 button switches) |

## Change the words, photos and favourites

Everything she reads lives in `content/`:

* `content/copy.json` — door messages, the opening and ending text, the typographic cards between scenes
* `content/favs.json` — the fav wall (movies, food, snacks, songs); add `"image": "assets/photos/xyz.jpg"` to show a real picture
* `content/photos.json` — the polaroids and the notes on their backs
* `content/gifts.json` — the lunch ticket
* `ending.audio` in `copy.json` — path of a voice note to play on the last screen (leave empty to play the birthday tune)

Put your own pictures in `assets/` and point to them from the JSON files.

## The cartoon story

`js/lib/story.js` holds the 14 scenes (captions, speech bubbles, timing, sound cues). Open `tools/storyboard.html` through the local server to see a contact sheet of every scene while editing.

## Tests (optional)

```
node --test tests/*.test.mjs        # logic: door answer, countdown, blow detection, story
node tests/gate.mjs                 # laptop-only message (needs the site running on :8000 and Playwright)
node tests/smoke.mjs                # click-through of every scene
```

## Put it online (free)

Cloudflare Pages or Netlify, connected to this (private) GitHub repo: no build command, output directory `/`.
