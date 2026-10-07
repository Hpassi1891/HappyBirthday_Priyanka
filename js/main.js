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

// ---- Page turns ---------------------------------------------------------
// Each scene is one diary page in its own layer. The next page is mounted underneath and the
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
  const start = params.get('scene');
  go(ORDER.includes(start) ? start : 'door');
}
boot();
