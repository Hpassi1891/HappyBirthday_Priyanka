// The cinematic opening. One thing leads to another, all full-screen:
//  1. paper flowers bloom across a cream screen
//  2. a starry "A surprise for you" card, with an Unwrap button
//  3. a glowing heart: pull the bow back and release the arrow
//  4. the screen floods red and big typographic wishes appear, one after another
//  5. a white-out that melts into the party
// The text lives in content/copy.json under "intro".

let cleanup = [];

// ---------- paper flowers (drawn once to small canvases, then stamped and animated) ----------
const PALETTE = {
  orange: ['#f6ac55', '#ee8f2f', '#fff3d9'],
  yellow: ['#f8d366', '#eab53a', '#fff7d8'],
  blue: ['#a9c2e2', '#7c9cc8', '#eef4fb'],
  green: ['#a9ceb4', '#7fb08f', '#eef8f0'],
  peach: ['#f6c2b6', '#ea9d8c', '#fff1ec'],
  cream: ['#fff0d6', '#e8cfa0', '#ffffff'],
};

function sprite(kind, key) {
  const [base, deep, light] = PALETTE[key];
  const S = 256;
  const c = document.createElement('canvas');
  c.width = c.height = S;
  const g = c.getContext('2d');
  g.translate(S / 2, S / 2);
  if (kind === 'scallop') {
    const R = 100, bumps = 12;
    g.fillStyle = base;
    for (let i = 0; i < bumps; i++) { const a = (i / bumps) * Math.PI * 2; g.beginPath(); g.arc(Math.cos(a) * R * 0.8, Math.sin(a) * R * 0.8, R * 0.27, 0, 7); g.fill(); }
    g.beginPath(); g.arc(0, 0, R * 0.82, 0, 7); g.fill();
    const grad = g.createRadialGradient(-20, -20, 6, 0, 0, R);
    grad.addColorStop(0, light + 'aa'); grad.addColorStop(0.6, '#0000'); grad.addColorStop(1, deep + '55');
    g.fillStyle = grad; g.beginPath(); g.arc(0, 0, R * 1.0, 0, 7); g.fill();
    g.strokeStyle = deep; g.lineWidth = 5; g.beginPath(); g.arc(0, 0, R * 0.42, 0, 7); g.stroke();
    g.fillStyle = light; g.beginPath(); g.arc(0, 0, R * 0.13, 0, 7); g.fill();
    g.strokeStyle = deep; g.lineWidth = 6; g.stroke();
  } else if (kind === 'sakura') {
    for (let k = 0; k < 5; k++) {
      g.save(); g.rotate((k / 5) * Math.PI * 2);
      g.beginPath(); g.moveTo(0, 0); g.bezierCurveTo(-46, -36, -40, -104, -10, -108); g.lineTo(0, -94); g.lineTo(10, -108); g.bezierCurveTo(40, -104, 46, -36, 0, 0);
      const gr = g.createLinearGradient(0, 0, 0, -108); gr.addColorStop(0, light); gr.addColorStop(1, base);
      g.fillStyle = gr; g.fill(); g.strokeStyle = deep + '88'; g.lineWidth = 2; g.stroke();
      g.restore();
    }
    g.strokeStyle = deep; g.lineWidth = 2.4;
    for (let k = 0; k < 9; k++) { const a = (k / 9) * Math.PI * 2; g.beginPath(); g.moveTo(0, 0); g.lineTo(Math.cos(a) * 30, Math.sin(a) * 30); g.stroke(); g.fillStyle = deep; g.beginPath(); g.arc(Math.cos(a) * 32, Math.sin(a) * 32, 3.2, 0, 7); g.fill(); }
  } else {
    for (let k = 0; k < 16; k++) {
      g.save(); g.rotate((k / 16) * Math.PI * 2);
      g.beginPath(); g.ellipse(0, -66, 15, 40, 0, 0, 7); g.fillStyle = k % 2 ? base : light; g.fill();
      g.restore();
    }
    g.fillStyle = deep; g.beginPath(); g.arc(0, 0, 24, 0, 7); g.fill();
    g.fillStyle = base; g.beginPath(); g.arc(-4, -4, 10, 0, 7); g.fill();
  }
  return c;
}

const easeOutBack = (p) => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(p - 1, 3) + c1 * Math.pow(p - 1, 2); };

function startGarden(canvas, ctx, onDone) {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const w = canvas.clientWidth, h = canvas.clientHeight;
  canvas.width = w * dpr; canvas.height = h * dpr;
  const g = canvas.getContext('2d');
  g.scale(dpr, dpr);
  const kinds = [['scallop', 'orange'], ['scallop', 'yellow'], ['scallop', 'blue'], ['scallop', 'green'], ['scallop', 'peach'], ['sakura', 'peach'], ['sakura', 'cream'], ['sakura', 'orange'], ['daisy', 'cream'], ['daisy', 'yellow'], ['daisy', 'blue']];
  const sprites = kinds.map(([k, c]) => sprite(k, c));
  let seed = 11;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const cx = w / 2, cy = h / 2, maxD = Math.hypot(cx, cy);
  const scale = Math.max(0.7, Math.min(2.4, w / 620));
  const flowers = [{ x: cx, y: cy, r: Math.min(w, h) * 0.17, birth: 0.35, spr: 0, rot: 0.2, spin: 0.12, a: 1 }];
  const target = Math.min(90, Math.round((w * h) / (6500 * scale * scale)));
  for (let tries = 0; flowers.length < target && tries < 5000; tries++) {
    const r = (30 + rnd() * 62) * scale;
    const x = -10 + rnd() * (w + 20), y = -10 + rnd() * (h + 20);
    if (flowers.some((f) => Math.hypot(f.x - x, f.y - y) < (f.r + r) * 0.62)) continue;
    const far = rnd() < 0.3;
    flowers.push({ x, y, r: far ? r * 1.2 : r, birth: 0.9 + (Math.hypot(x - cx, y - cy) / maxD) * 2.3 + rnd() * 0.45, spr: (rnd() * sprites.length) | 0, rot: rnd() * 6.28, spin: (rnd() - 0.5) * 0.35, a: far ? 0.55 : 1 });
  }
  flowers.sort((a, b) => a.r - b.r);
  const total = Math.max(...flowers.map((f) => f.birth)) + 1.0;
  // a soft bell for some of the blooms
  flowers.filter((f, i) => i % 6 === 0).forEach((f) => { const t = gsap.delayedCall(f.birth, () => ctx.audio.bloom()); cleanup.push(() => t.kill()); });

  let t0 = performance.now(), raf = 0, done = false, alive = true;
  cleanup.push(() => { alive = false; cancelAnimationFrame(raf); });
  const frame = (now) => {
    if (!alive) return;
    const t = (now - t0) / 1000;
    g.clearRect(0, 0, w, h);
    for (const f of flowers) {
      const p = Math.min(1, Math.max(0, (t - f.birth) / 0.95));
      if (p <= 0) continue;
      const sc = easeOutBack(p) * (f.r / 128);
      g.save();
      g.globalAlpha = f.a * Math.min(1, p * 3);
      g.translate(f.x, f.y);
      g.rotate(f.rot + t * f.spin);
      g.scale(sc, sc);
      g.drawImage(sprites[f.spr], -128, -128);
      g.restore();
    }
    if (t > total && !done) { done = true; onDone(); }
    raf = requestAnimationFrame(frame);
  };
  raf = requestAnimationFrame(frame);
}

// ---------- bits of markup ----------
const GIFT_ICON = `<svg viewBox="0 0 64 64" width="46" height="46" aria-hidden="true"><rect x="8" y="26" width="48" height="32" rx="3" fill="#e9b872"/><rect x="5" y="19" width="54" height="12" rx="3" fill="#f3cf8e"/><rect x="28" y="19" width="8" height="39" fill="#c8302f"/><path d="M32 19 C20 4 8 12 20 19 Z M32 19 C44 4 56 12 44 19 Z" fill="#c8302f"/></svg>`;

const HEART = `<svg viewBox="0 0 120 110" width="132" height="121" aria-hidden="true">
  <defs><radialGradient id="hg" cx="35%" cy="28%" r="80%"><stop offset="0" stop-color="#ff8f8f"/><stop offset=".55" stop-color="#e8323f"/><stop offset="1" stop-color="#b30f27"/></radialGradient></defs>
  <path d="M60 104 C8 66 2 30 28 14 C44 5 58 12 60 26 C62 12 76 5 92 14 C118 30 112 66 60 104Z" fill="url(#hg)"/>
  <ellipse cx="38" cy="30" rx="12" ry="7" fill="#fff" opacity=".85" transform="rotate(-28 38 30)"/></svg>`;

const bowSVG = `<svg class="bow-svg" viewBox="0 0 200 200" width="170" height="170" overflow="visible" aria-hidden="true">
  <g class="bow-rot">
    <path d="M80 30 Q140 100 80 170" fill="none" stroke="#3b2a2a" stroke-width="6" stroke-linecap="round"/>
    <rect x="72" y="92" width="14" height="16" rx="4" fill="#3b2a2a" transform="translate(6 0)"/>
    <path class="string" d="M80 30 L80 100 L80 170" fill="none" stroke="#5a3f3f" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>
    <g class="arrow">
      <line x1="70" y1="100" x2="190" y2="100" stroke="#3b2a2a" stroke-width="3.6" stroke-linecap="round"/>
      <path d="M190 100 l-12 -7 l4 7 l-4 7z" fill="#e0a43c" stroke="#8a5d17" stroke-width="1.4" stroke-linejoin="round"/>
      <path d="M70 100 l-8 -8 l16 4 z M70 100 l-8 8 l16 -4 z" fill="#d12b3a" stroke="#7a0f1c" stroke-width="1.2" stroke-linejoin="round"/>
    </g>
  </g></svg>`;

const FLOURISH = `<svg class="wish-flourish" viewBox="0 0 220 24" aria-hidden="true"><path d="M4 14 C40 2 70 22 110 12 S180 4 216 12" fill="none" stroke="#f8e3da" stroke-width="3" stroke-linecap="round"/></svg>`;

// letters wrapped so they can be revealed one by one
const letters = (text) => [...text].map((ch) => `<span class="ch">${ch === ' ' ? '&nbsp;' : ch}</span>`).join('');

export default {
  mount(stage, ctx) {
    const c = ctx.copy.intro;
    stage.innerHTML = `
      <section class="intro-scene">
        <canvas class="in-garden" id="garden"></canvas>
        <div class="in-dust" aria-hidden="true">${Array.from({ length: 34 }, (_, i) => `<i style="left:${(i * 29) % 100}%;top:${(i * 53) % 100}%;animation-delay:${-(i % 9)}s"></i>`).join('')}</div>
        <div class="in-dark" id="dark" hidden>
          <div class="in-stars" aria-hidden="true">${Array.from({ length: 46 }, (_, i) => `<i style="left:${(i * 37 + 7) % 100}%;top:${(i * 61 + 13) % 100}%;animation-delay:${-(i % 7)}s"></i>`).join('')}</div>
          <div class="in-card" id="card">
            <div class="in-gift">${GIFT_ICON}</div>
            <p class="in-kicker"></p>
            <p class="in-name"></p>
            <p class="in-by"></p>
          </div>
          <button class="in-unwrap" id="unwrap" type="button"><span></span> ✦</button>
          <p class="in-sound"></p>
        </div>
        <div class="in-pull" id="pull" hidden>
          <p class="in-title"></p>
          <div class="in-heart" id="heart"><i class="in-glow"></i>${HEART}</div>
          <div class="in-bow" id="bow" role="button" aria-label="Pull the bow back and release">${bowSVG}</div>
          <p class="in-hint"></p>
          <p class="in-tap"></p>
        </div>
        <div class="in-wish" id="wish" hidden>
          <p class="wish-small" id="wSmall"></p>
          <h1 class="wish-big" id="wBig"></h1>
          ${FLOURISH}
          <p class="wish-sub" id="wSub"></p>
        </div>
        <div class="in-white" id="white"></div>
      </section>`;

    const $ = (s) => stage.querySelector(s);
    const root = $('.intro-scene');
    const later = (s, fn) => { const t = gsap.delayedCall(s, fn); cleanup.push(() => t.kill()); return t; };
    $('.in-kicker').textContent = c.kicker;
    $('.in-name').textContent = c.name;
    $('.in-by').textContent = c.by;
    $('#unwrap span').textContent = c.button;
    $('.in-sound').textContent = '🔈 ' + c.sound;
    $('.in-title').textContent = c.pullTitle;
    $('.in-hint').textContent = c.pullHint;
    $('.in-tap').textContent = c.pullTap;

    // ===== 1. the flowers bloom =====
    const garden = $('#garden');
    gsap.from(garden, { opacity: 0, duration: .8 });
    gsap.from('.in-dust i', { opacity: 0, duration: 1.2, stagger: .03 });
    ctx.audio.swell();
    startGarden(garden, ctx, () => later(.7, toDark));

    // ===== 2. the surprise card =====
    function toDark() {
      ctx.audio.chime();
      const dark = $('#dark');
      dark.hidden = false;
      gsap.fromTo(dark, { opacity: 0 }, { opacity: 1, duration: 1.1, ease: 'power1.inOut' });
      gsap.to([garden, '.in-dust'], { opacity: 0, duration: 1.1, delay: .2 });
      gsap.from('#card', { y: 40, opacity: 0, scale: .94, duration: 1, delay: .7, ease: 'power3.out' });
      gsap.from('#card > *', { y: 14, opacity: 0, duration: .7, stagger: .12, delay: 1, ease: 'power2.out' });
      gsap.from('#unwrap', { y: 20, opacity: 0, duration: .8, delay: 1.5, ease: 'power3.out' });
      gsap.from('.in-sound', { opacity: 0, duration: .8, delay: 1.9 });
    }
    $('#unwrap').onclick = () => {
      if ($('#unwrap').dataset.done) return;
      $('#unwrap').dataset.done = '1';
      ctx.audio.unlock();
      ctx.audio.ding();
      ctx.fx.burst(innerWidth / 2, innerHeight * 0.45, 60);
      const tl = gsap.timeline({ onComplete: toPull });
      tl.to('#card', { scale: 1.08, duration: .35, ease: 'power2.out' })
        .to('#card', { scale: .6, opacity: 0, y: -40, duration: .6, ease: 'power2.in' })
        .to(['#unwrap', '.in-sound'], { opacity: 0, y: 20, duration: .4 }, '<')
        .to('#dark', { opacity: 0, duration: .7 }, '-=.1');
    };

    // ===== 3. pull and release =====
    const state = { p: 0 };
    let angle = 0, geo = null, fired = false;
    const bow = $('#bow');
    const unit = () => bow.getBoundingClientRect().width / 170;   // how much bigger the bow is than its drawing
    const setPull = (p) => {
      state.p = p;
      bow.querySelector('.string').setAttribute('d', `M80 30 L${80 - p} 100 L80 170`);
      bow.querySelector('.arrow').setAttribute('transform', `translate(${-p} 0)`);
    };
    function toPull() {
      $('#dark').hidden = true;
      const pull = $('#pull');
      pull.hidden = false;
      gsap.fromTo(pull, { opacity: 0 }, { opacity: 1, duration: .9 });
      gsap.from('.in-title', { y: 12, opacity: 0, duration: 1, delay: .3 });
      gsap.from('#heart', { scale: .3, opacity: 0, duration: 1.1, delay: .4, ease: 'back.out(1.6)' });
      gsap.from('#bow', { x: -40, opacity: 0, duration: .9, delay: .9, ease: 'power3.out' });
      gsap.from(['.in-hint', '.in-tap'], { opacity: 0, duration: .9, delay: 1.4 });
      ctx.audio.thump();
      const beat = setInterval(() => { if (!fired) ctx.audio.thump(); }, 2600);
      cleanup.push(() => clearInterval(beat));
      requestAnimationFrame(() => {
        const pr = pull.getBoundingClientRect(), hr = $('#heart').getBoundingClientRect(), br = bow.getBoundingClientRect();
        geo = { hx: hr.left - pr.left + hr.width / 2, hy: hr.top - pr.top + hr.height / 2, bx: br.left - pr.left + br.width / 2, by: br.top - pr.top + br.height / 2 };
        angle = Math.atan2(geo.hy - geo.by, geo.hx - geo.bx);
        bow.querySelector('.bow-rot').style.transformOrigin = '100px 100px';
        bow.querySelector('.bow-rot').style.transform = `rotate(${angle}rad)`;
      });
      attachBow();
    }

    function attachBow() {
      let start = null, moved = 0;
      bow.addEventListener('pointerdown', (e) => { if (fired) return; e.preventDefault(); bow.setPointerCapture(e.pointerId); start = { x: e.clientX, y: e.clientY }; moved = 0; gsap.killTweensOf(state); ctx.audio.click(); });
      bow.addEventListener('pointermove', (e) => {
        if (!start || fired) return;
        const dx = e.clientX - start.x, dy = e.clientY - start.y;
        moved = Math.max(moved, Math.hypot(dx, dy));
        const pull = Math.max(0, Math.min(72, -(dx * Math.cos(angle) + dy * Math.sin(angle)) / unit()));
        setPull(pull);
      });
      const end = () => {
        if (!start || fired) return;
        start = null;
        if (moved < 8) return autoShot();
        if (state.p > 28) return fire();
        gsap.to(state, { p: 0, duration: .5, ease: 'elastic.out(1,.35)', onUpdate: () => setPull(state.p) });
        ctx.audio.twang();
      };
      bow.addEventListener('pointerup', end);
      bow.addEventListener('pointercancel', end);
    }
    const autoShot = () => {
      if (fired) return;
      fired = true;
      gsap.to(state, { p: 72, duration: .8, ease: 'power2.out', onUpdate: () => setPull(state.p), onComplete: () => { fired = false; fire(); } });
    };

    function fire() {
      if (fired) return;
      fired = true;
      ctx.audio.twang();
      ctx.audio.arrow();
      const pull = $('#pull');
      const k = unit();
      const tailX = geo.bx + Math.cos(angle) * -40 * k, tailY = geo.by + Math.sin(angle) * -40 * k;
      const fly = document.createElement('div');
      fly.className = 'fly-arrow';
      fly.innerHTML = `<svg viewBox="0 0 130 24" width="${130 * k}" height="${24 * k}" aria-hidden="true"><line x1="6" y1="12" x2="122" y2="12" stroke="#3b2a2a" stroke-width="3.6" stroke-linecap="round"/><path d="M124 12 l-12 -7 l4 7 l-4 7z" fill="#e0a43c" stroke="#8a5d17" stroke-width="1.4" stroke-linejoin="round"/><path d="M6 12 l-8 -8 l16 4 z M6 12 l-8 8 l16 -4 z" fill="#d12b3a" stroke="#7a0f1c" stroke-width="1.2" stroke-linejoin="round"/></svg>`;
      fly.style.cssText = `left:${tailX - 65 * k}px;top:${tailY - 12 * k}px;rotate:${angle}rad`;
      pull.appendChild(fly);
      bow.querySelector('.arrow').style.display = 'none';
      gsap.to(state, { p: 0, duration: .5, ease: 'elastic.out(1,.3)', onUpdate: () => setPull(state.p) });
      const dist = Math.hypot(geo.hx - tailX, geo.hy - tailY) - 40 * k;
      gsap.to(fly, { x: Math.cos(angle) * dist, y: Math.sin(angle) * dist, duration: .55, ease: 'power2.in', onComplete: () => { fly.remove(); impact(); } });
      gsap.to(['.in-hint', '.in-tap'], { opacity: 0, duration: .3 });
    }

    function impact() {
      ctx.audio.thump();
      const hr = $('#heart').getBoundingClientRect();
      const hx = hr.left + hr.width / 2, hy = hr.top + hr.height / 2;
      ctx.fx.burst(hx, hy, 70);
      ctx.fx.hearts(hx, hy, 14);
      const tl = gsap.timeline();
      tl.to('#heart', { scale: 1.4, duration: .12, ease: 'power2.out' })
        .to('#heart', { scale: .85, duration: .12 })
        .to('#heart svg', { scale: .08, duration: .5, ease: 'power3.in' }, '+=.1')
        .to('.in-glow', { scale: 2.4, opacity: 1, duration: .5 }, '<')
        .call(() => { ctx.audio.chime(); floodRed(geo.hx, geo.hy); });
    }

    // ===== 4. the red screen and the wishes =====
    function fit(lines) {
      const avail = Math.min(innerWidth - 80, 1100);
      const longest = Math.max(...lines.map((l) => l.length));
      const byHeight = (innerHeight * 0.5) / (lines.length * 1.0);
      return Math.max(38, Math.min(190, byHeight, avail / (longest * 0.56)));
    }
    function floodRed(x, y) {
      const wish = $('#wish');
      wish.hidden = false;
      wish.style.clipPath = `circle(0px at ${x}px ${y}px)`;
      const R = Math.hypot(innerWidth, innerHeight) * 1.1;
      const o = { r: 0 };
      gsap.to(o, { r: R, duration: 1.2, ease: 'power2.in', onUpdate: () => { wish.style.clipPath = `circle(${o.r}px at ${x}px ${y}px)`; }, onComplete: () => { wish.style.clipPath = 'none'; $('#pull').hidden = true; playBeats(0); } });
    }
    function playBeats(i) {
      const beats = c.beats;
      const b = beats[i];
      const big = $('#wBig');
      big.innerHTML = b.big.map((l) => `<span class="wl">${letters(l)}</span>`).join('');
      big.style.fontSize = fit(b.big) + 'px';
      $('#wSmall').textContent = b.small;
      $('#wSub').textContent = b.sub;
      const chars = big.querySelectorAll('.ch');
      const flour = stage.querySelector('.wish-flourish path');
      flour.style.strokeDasharray = 300; flour.style.strokeDashoffset = 300;
      ctx.audio.swell();
      const tl = gsap.timeline();
      tl.fromTo('#wSmall', { opacity: 0, y: 10 }, { opacity: .9, y: 0, duration: .8 })
        .fromTo(chars, { opacity: 0, y: 30, clipPath: 'inset(0 0 100% 0)' }, { opacity: 1, y: 0, clipPath: 'inset(0 0 0% 0)', duration: .55, stagger: .07, ease: 'power3.out' }, '-=.4')
        .call(() => ctx.audio.sparkle(), null, '-=.3')
        .to(flour, { strokeDashoffset: 0, duration: .9, ease: 'power2.inOut' }, '-=.2')
        .fromTo('#wSub', { opacity: 0 }, { opacity: .9, duration: .8 }, '-=.5')
        .to({}, { duration: 1.3 })
        .to(['#wSmall', chars, '#wSub', flour], { opacity: 0, y: -16, duration: .5, stagger: { each: .015, from: 'start' } })
        .call(() => { if (i + 1 < beats.length) playBeats(i + 1); else whiteOut(); });
    }

    // ===== 5. white-out into the party =====
    function whiteOut() {
      ctx.audio.chime();
      const w = $('#white');
      w.style.display = 'block';
      gsap.fromTo(w, { opacity: 0, scale: .4 }, { opacity: 1, scale: 1.6, duration: 1.4, ease: 'power2.in', onComplete: () => later(.2, () => ctx.next()) });
    }
  },
  unmount() { cleanup.forEach((f) => f()); cleanup = []; },
};
