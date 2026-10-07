import { audio } from './lib/audio.js';
import * as fx from './lib/confetti.js';
import door from './scenes/door.js';
import intro from './scenes/intro.js';
import room from './scenes/room.js';
import favwall from './scenes/favwall.js';
import photos from './scenes/photos.js';
import gifts from './scenes/gifts.js';
import cake from './scenes/cake.js';
import finale from './scenes/finale.js';
import ending from './scenes/ending.js';

// Register new scenes here as they are built.
const SCENES = { door, intro, room, favwall, photos, gifts, cake, finale, ending };

// The cake scene covers lighting, blowing out and cutting in one continuous page.
export const ORDER = ['door', 'intro', 'room', 'favwall', 'photos', 'gifts', 'cake', 'finale', 'ending'];

const stage = document.getElementById('stage');
const params = new URLSearchParams(location.search);
const ctx = { stage, audio, fx, params, preview: !!window.__PREVIEW__ || params.has('preview') || params.has('scene'), copy: null, favs: null, photos: null, gifts: null, name: null };
let current = null; // { scene, layer, name }

// ---- Looks: 'cinema' (cream, red and big serif type), 'night' (dreamy night sky) or 'scrapbook' (diary pages).
// Chosen by ?look=, then the saved choice, then the default.
const LOOKS = ['cinema', 'night', 'scrapbook'];
const DEFAULT_LOOK = 'cinema';
const store = { get: (k) => { try { return localStorage.getItem(k); } catch { return null; } }, set: (k, v) => { try { localStorage.setItem(k, v); } catch { /* private mode */ } } };
const pickLook = () => { const l = params.get('look') || store.get('look'); return LOOKS.includes(l) ? l : DEFAULT_LOOK; };
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
const NEXT_LOOK = (l) => LOOKS[(LOOKS.indexOf(l) + 1) % LOOKS.length];
const LOOK_ICON = { cinema: '🎬', night: '🌙', scrapbook: '📓' };
const LOOK_NAME = { cinema: 'the cinematic look', night: 'the dreamy night sky', scrapbook: 'the scrapbook diary' };
const syncLookBtn = () => { const n = NEXT_LOOK(ctx.look); lookBtn.textContent = LOOK_ICON[n]; lookBtn.title = 'Switch to ' + LOOK_NAME[n]; };
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
lookBtn.onclick = () => ctx.setLook(NEXT_LOOK(ctx.look));

async function loadJson(path) {
  try { return await (await fetch(path)).json(); } catch { return {}; }
}

// ---- Scene changes ------------------------------------------------------
// Cinema: a full-screen typographic card ("a few of her favourite things") wipes over the old scene,
// the new scene is swapped in behind it and the card closes like an iris. Intro and the white-out that
// follows it cross-fade instead. Night: scenes drift through the sky. Scrapbook: the diary page turns over.
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
let busy = false;

const letters = (t) => [...t].map((ch) => `<span class="ch">${ch === ' ' ? '&nbsp;' : ch}</span>`).join('');

// Plays the interlude for `name` and calls `swap` once the screen is fully covered. Resolves when it has closed again.
function interlude(name, swap) {
  const spec = ctx.copy.interludes?.[name];
  const el = document.getElementById('interlude') ?? Object.assign(document.body.appendChild(document.createElement('div')), { id: 'interlude' });
  if (!spec) { swap(); return Promise.resolve(); }
  el.className = 't-' + (spec.theme || 'cream');
  el.innerHTML = spec.lines.map((l, i) => `<span class="il-line ${i < spec.lines.length - 1 ? 'il-sm' : 'il-big'}">${letters(l)}</span>`).join('') + '<i class="il-rule"></i>';
  const big = el.querySelector('.il-big');
  big.style.fontSize = Math.max(34, Math.min(76, (innerWidth - 44) / (spec.lines.at(-1).length * 0.6))) + 'px';
  el.style.display = 'flex';
  const dur = reduceMotion ? .2 : 1;
  const chars = el.querySelectorAll('.ch');
  audio.swell();
  return new Promise((done) => {
    const tl = gsap.timeline({ onComplete: done });
    tl.fromTo(el, { clipPath: 'circle(0% at 50% 55%)' }, { clipPath: 'circle(80% at 50% 55%)', duration: dur * .8, ease: 'power2.inOut' })
      .fromTo(chars, { opacity: 0, y: 26 }, { opacity: 1, y: 0, duration: .5, stagger: reduceMotion ? 0 : .035, ease: 'power3.out' }, '-=.25')
      .fromTo('.il-rule', { scaleX: 0 }, { scaleX: 1, duration: .6, ease: 'power2.out' }, '-=.4')
      .to({}, { duration: reduceMotion ? .1 : 1.1 })
      .call(swap)
      .to(el, { clipPath: 'circle(0% at 50% 50%)', duration: dur * .8, ease: 'power2.inOut', delay: .1 })
      .set(el, { display: 'none', clearProps: 'clipPath' });
  });
}

async function go(name) {
  if (busy) return;
  busy = true;
  const from = current;
  const layer = document.createElement('div');
  layer.className = 'layer';
  ctx.name = name;
  const scene = SCENES[name] ?? placeholder(name);
  const mountIt = () => { if (from) stage.insertBefore(layer, from.layer); else stage.appendChild(layer); scene.mount(layer, ctx); };
  stage.classList.add('busy');

  if (!from) {
    mountIt();
    await new Promise((done) => gsap.fromTo(layer, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: reduceMotion ? .2 : .9, ease: 'power1.out', onComplete: done }));
  } else if (ctx.look === 'cinema' && name !== 'intro' && from.name !== 'intro') {
    await interlude(name, () => { mountIt(); from.layer.style.display = 'none'; });
  } else if (ctx.look === 'night' && name !== 'intro' && from.name !== 'intro') {
    mountIt();
    // drift forward through the sky: the old scene floats up and fades while the next one rises into view
    audio.flip();
    const dur = reduceMotion ? .2 : 1.5;
    gsap.fromTo('#sky', { scale: 1 }, { scale: 1.12, duration: dur * .5, yoyo: true, repeat: 1, ease: 'sine.inOut' });
    gsap.to(from.layer, { scale: 1.18, opacity: 0, y: -40, duration: dur * .8, ease: 'power2.in' });
    await new Promise((done) => gsap.fromTo(layer, { scale: .88, opacity: 0, y: 50 }, { scale: 1, opacity: 1, y: 0, duration: dur, delay: dur * .25, ease: 'power2.out', onComplete: done }));
  } else if (ctx.look === 'scrapbook' && name !== 'intro' && from.name !== 'intro') {
    mountIt();
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
  } else {
    // into and out of the opening: the old layer simply melts away, revealing the new one underneath
    mountIt();
    await new Promise((done) => gsap.to(from.layer, { opacity: 0, duration: reduceMotion ? .2 : 1.1, ease: 'power1.inOut', onComplete: done }));
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
  const start = params.get('scene');
  go(ORDER.includes(start) ? start : 'door');
}
boot();
