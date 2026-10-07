import { audio } from './lib/audio.js';
import * as fx from './lib/confetti.js';
import door from './scenes/door.js';
import room from './scenes/room.js';
import favwall from './scenes/favwall.js';
import photos from './scenes/photos.js';
import gifts from './scenes/gifts.js';
import cake from './scenes/cake.js';
import finale from './scenes/finale.js';

// Register new scenes here as they are built.
const SCENES = { door, room, favwall, photos, gifts, cake, finale };

// The cake scene covers lighting, blowing out and cutting in one continuous page.
export const ORDER = ['door', 'room', 'favwall', 'photos', 'gifts', 'cake', 'finale'];

const stage = document.getElementById('stage');
const params = new URLSearchParams(location.search);
const ctx = { stage, audio, fx, params, preview: !!window.__PREVIEW__ || params.has('preview') || params.has('scene'), copy: null, favs: null, photos: null, gifts: null, letter: null, name: null };
let current = null; // { scene, layer, name }

// ---- Looks: 'scrapbook' (diary pages) or 'night' (dreamy night sky). Chosen by ?look=, then the saved choice, then the default.
const DEFAULT_LOOK = 'night';
const store = { get: (k) => { try { return localStorage.getItem(k); } catch { return null; } }, set: (k, v) => { try { localStorage.setItem(k, v); } catch { /* private mode */ } } };
const pickLook = () => { const l = params.get('look') || store.get('look'); return l === 'scrapbook' || l === 'night' ? l : DEFAULT_LOOK; };
ctx.look = pickLook();
document.body.dataset.look = ctx.look;

// The night sky: a field of twinkling stars, a moon and the odd shooting star, behind every scene.
function buildSky() {
  const sky = document.createElement('div');
  sky.id = 'sky';
  sky.setAttribute('aria-hidden', 'true');
  let h = '<b class="moon"></b><s class="aurora a1"></s><s class="aurora a2"></s>';
  let seed = 7;
  const r = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < 70; i++) {
    const size = (1 + r() * 2.2).toFixed(1);
    h += `<i style="left:${(r() * 100).toFixed(1)}%;top:${(r() * 100).toFixed(1)}%;width:${size}px;height:${size}px;animation-delay:${(-r() * 4).toFixed(2)}s;animation-duration:${(2 + r() * 3).toFixed(1)}s"></i>`;
  }
  h += '<u style="left:12%;top:8%"></u><u style="left:62%;top:22%;animation-delay:-5s"></u><u style="left:30%;top:46%;animation-delay:-9s"></u>';
  sky.innerHTML = h;
  stage.prepend(sky);
}
buildSky();

const lookBtn = document.getElementById('look');
const syncLookBtn = () => { lookBtn.textContent = ctx.look === 'night' ? '📓' : '🌙'; lookBtn.title = ctx.look === 'night' ? 'Switch to the scrapbook diary' : 'Switch to the dreamy night sky'; };
syncLookBtn();
ctx.setLook = (look) => {
  if (look === ctx.look) return;
  ctx.look = look;
  document.body.dataset.look = look;
  store.set('look', look);
  syncLookBtn();
  ctx.audio.sparkle();
  // the door is drawn differently in each look, so draw it again; every other scene just restyles
  if (current?.name === 'door' && !busy) { const n = current.name; current = { ...current }; go(n); }
};
lookBtn.onclick = () => ctx.setLook(ctx.look === 'night' ? 'scrapbook' : 'night');

async function loadJson(path) {
  try { return await (await fetch(path)).json(); } catch { return {}; }
}

// ---- Scene changes ------------------------------------------------------
// Scrapbook: each scene is a diary page; the next page is mounted underneath and the
// current page turns over. Night: scenes drift through the sky. Each scene is one layer. The next page is mounted underneath and the
// current page turns over, hinged on its left edge, so there is never a hard cut.
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
let busy = false;

async function go(name) {
  if (busy) return;
  busy = true;
  const from = current;
  const layer = document.createElement('div');
  layer.className = 'layer';
  if (from) stage.insertBefore(layer, from.layer); else stage.appendChild(layer);
  ctx.name = name;
  const scene = SCENES[name] ?? placeholder(name);
  scene.mount(layer, ctx);
  stage.classList.add('busy');

  if (!from) {
    await new Promise((done) => gsap.fromTo(layer, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: reduceMotion ? .2 : .9, ease: 'power1.out', onComplete: done }));
  } else if (ctx.look === 'night') {
    // drift forward through the sky: the old scene floats up and fades while the next one rises into view
    audio.flip();
    const dur = reduceMotion ? .2 : 1.5;
    gsap.fromTo('#sky', { scale: 1 }, { scale: 1.12, duration: dur * .5, yoyo: true, repeat: 1, ease: 'sine.inOut' });
    gsap.to(from.layer, { scale: 1.18, opacity: 0, y: -40, duration: dur * .8, ease: 'power2.in' });
    await new Promise((done) => gsap.fromTo(layer, { scale: .88, opacity: 0, y: 50 }, { scale: 1, opacity: 1, y: 0, duration: dur, delay: dur * .25, ease: 'power2.out', onComplete: done }));
  } else {
    audio.flip();
    const spine = from.layer.querySelector('.page')?.offsetLeft ?? 10;
    const shade = document.createElement('div');
    shade.style.cssText = 'position:absolute;inset:0;pointer-events:none;z-index:99;background:linear-gradient(90deg,#0006,#0001 40%,#0000)';
    layer.appendChild(shade);
    const dur = reduceMotion ? .2 : 1.35;
    gsap.fromTo(shade, { opacity: 1 }, { opacity: 0, duration: dur, ease: 'power1.in' });
    await new Promise((done) => {
      gsap.fromTo(from.layer, { rotationY: 0 }, { rotationY: -120, transformOrigin: `${spine}px 50%`, duration: dur, ease: 'power2.inOut', onComplete: done });
    });
    shade.remove();
  }
  gsap.set(layer, { clearProps: 'all' });
  if (from) {
    from.scene.unmount?.();
    from.layer.remove();
  }
  current = { scene, layer, name };
  stage.classList.remove('busy');
  busy = false;
}

ctx.go = go;
ctx.next = () => {
  const i = ORDER.indexOf(ctx.name);
  if (i >= 0 && i < ORDER.length - 1) go(ORDER[i + 1]);
};

// Shown for scenes that aren't built yet.
function placeholder(name) {
  return {
    mount(el) {
      el.innerHTML = `<section class="scene"><h2>🚧 ${name}</h2><p>This scene is coming soon.</p><button class="btn" id="skip">Continue</button></section>`;
      el.querySelector('#skip').onclick = () => ctx.next();
    },
  };
}

const muteBtn = document.getElementById('mute');
muteBtn.onclick = () => {
  audio.setMuted(!audio.muted);
  muteBtn.textContent = audio.muted ? '🔇' : '🔊';
};
addEventListener('pointerdown', () => audio.unlock(), { once: true });

async function boot() {
  ctx.copy = window.__COPY__ ?? await loadJson('content/copy.json');
  ctx.favs = window.__FAVS__ ?? await loadJson('content/favs.json');
  ctx.photos = window.__PHOTOS__ ?? await loadJson('content/photos.json');
  ctx.gifts = window.__GIFTS__ ?? await loadJson('content/gifts.json');
  ctx.letter = window.__LETTER__ ?? await loadJson('content/letter.json');
  const start = params.get('scene');
  go(ORDER.includes(start) ? start : 'door');
}
boot();
