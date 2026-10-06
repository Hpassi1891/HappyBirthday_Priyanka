import { audio } from './lib/audio.js';
import * as fx from './lib/confetti.js';
import door from './scenes/door.js';
import room from './scenes/room.js';
import favwall from './scenes/favwall.js';

// Register new scenes here as they are built.
const SCENES = { door, room, favwall };

export const ORDER = ['door', 'room', 'favwall', 'photos', 'gifts', 'cake', 'blow', 'cut', 'finale'];

const stage = document.getElementById('stage');
const params = new URLSearchParams(location.search);
const ctx = { stage, audio, fx, params, preview: !!window.__PREVIEW__ || params.has('preview') || params.has('scene'), copy: null, favs: null, name: null };
let current = null;

async function loadJson(path) {
  try { return await (await fetch(path)).json(); } catch { return {}; }
}

async function go(name) {
  if (current?.unmount) current.unmount();
  stage.replaceChildren();
  ctx.name = name;
  current = SCENES[name] ?? placeholder(name);
  current.mount(stage, ctx);
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
  const start = params.get('scene');
  go(ORDER.includes(start) ? start : 'door');
}
boot();
