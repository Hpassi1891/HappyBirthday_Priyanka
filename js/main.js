import { audio } from './lib/audio.js';
import * as fx from './lib/confetti.js';
import door from './scenes/door.js';
import room from './scenes/room.js';
import favwall from './scenes/favwall.js';
import photos from './scenes/photos.js';

// Register new scenes here as they are built.
const SCENES = { door, room, favwall, photos };

export const ORDER = ['door', 'room', 'favwall', 'photos', 'gifts', 'cake', 'blow', 'cut', 'finale'];

const stage = document.getElementById('stage');
const params = new URLSearchParams(location.search);
const ctx = { stage, audio, fx, params, preview: !!window.__PREVIEW__ || params.has('preview') || params.has('scene'), copy: null, favs: null, photos: null, name: null };
let current = null; // { scene, layer, name }

async function loadJson(path) {
  try { return await (await fetch(path)).json(); } catch { return {}; }
}

// ---- Scene transitions -------------------------------------------------
// Each scene lives in its own full-screen "layer". The incoming layer is mounted on top of the
// outgoing one and the two are animated together, so there is never a hard cut.
// Key is "from>to"; anything not listed uses the default soft crossfade.
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const DEFAULT = { dur: 1, ease: 'sine.inOut', out: {}, in: { opacity: 0, scale: 1.03 } };
const TRANSITIONS = {
  // The door scene zooms into the open door and floods with light itself; the room fades up out of it.
  'door>room': { dur: 1.4, ease: 'sine.inOut', out: {}, in: { opacity: 0, scale: 1.08 } },
  // Walk toward the wall: the room pushes in while the fav wall appears over the same wallpaper.
  'room>favwall': { dur: 1.2, ease: 'sine.inOut', out: { scale: 1.2, transformOrigin: '50% 35%' }, in: { opacity: 0, scale: .96 } },
  // Slide along the wall to the next one.
  'favwall>photos': { dur: 1.3, ease: 'power2.inOut', out: { xPercent: -14 }, in: { opacity: 0, xPercent: 14 } },
};

let busy = false;

async function go(name) {
  if (busy) return;
  busy = true;
  const from = current;
  const layer = document.createElement('div');
  layer.className = 'layer';
  stage.appendChild(layer);
  ctx.name = name;
  const scene = SCENES[name] ?? placeholder(name);
  scene.mount(layer, ctx);

  const t = TRANSITIONS[`${from?.name}>${name}`] ?? DEFAULT;
  const dur = reduceMotion ? .2 : (from ? t.dur : .9);
  stage.classList.add('busy');
  if (from) gsap.to(from.layer, { ...t.out, duration: dur, ease: t.ease });
  await new Promise((done) => {
    gsap.fromTo(layer, t.in, { opacity: 1, scale: 1, xPercent: 0, duration: dur, ease: t.ease, onComplete: done });
  });
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
  const start = params.get('scene');
  go(ORDER.includes(start) ? start : 'door');
}
boot();
