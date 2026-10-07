import { garland } from '../lib/mural.js';
import { detectBlow } from '../lib/blow.js';

// The cake: light the candles, make a wish, blow them out (mic or swipe), then cut the cake.
// Stages: light -> blow -> (trick candle) -> celebrate -> cut -> done
const INK = '#3c4a85';
const CUT_X = 160;                    // where the knife cuts, in cake viewBox units
const CANDLES = [76, 95, 114, 133, 152];
const STRIPE = ['#f7a1bf', '#7fd6c2', '#a9c7ff', '#ffd166', '#c9a7ff'];
let cleanup = [];

// scalloped icing along a horizontal edge
function icing(x0, x1, y, r, color) {
  const n = Math.round((x1 - x0) / (2 * r));
  const rr = (x1 - x0) / n / 2;
  let d = `M${x0} ${y - 6} H${x1} V${y}`;
  for (let i = 0; i < n; i++) d += ` a${rr} ${rr + 2} 0 0 1 ${-2 * rr} 0`;
  return `<path d="${d} Z" fill="${color}" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>`;
}

function cakeSVG() {
  const sprinkles = [[34, 190, 20], [60, 204, -30], [90, 196, 60], [118, 210, 10], [146, 194, -50], [176, 206, 35], [204, 192, -20], [48, 214, 80], [190, 214, 0]]
    .map(([x, y, a], i) => `<rect x="${x}" y="${y}" width="7" height="3" rx="1.5" fill="${STRIPE[i % 5]}" transform="rotate(${a} ${x} ${y})"/>`).join('');
  const candles = CANDLES.map((x, i) => `
    <g transform="translate(${x} 100)" class="candle" data-i="${i}">
      <rect x="-4.5" y="-32" width="9" height="32" rx="2" fill="#fff" stroke="${INK}" stroke-width="2.4"/>
      <path d="M-4 -24 l8 -5 M-4 -14 l8 -5 M-4 -4 l8 -5" stroke="${STRIPE[i]}" stroke-width="3.2" stroke-linecap="round"/>
      <path d="M0 -32 q1 -4 0 -6" stroke="${INK}" stroke-width="2" fill="none" stroke-linecap="round"/>
      <circle class="ember" cx="0" cy="-38" r="2.4" fill="#ff8a3d" opacity="0"/>
      <g transform="translate(0 -38)"><g class="flame-wrap"><g class="flame">
        <circle class="glow" cx="0" cy="-12" r="18" fill="url(#glowG)"/>
        <path d="M0 0 C-8 -6 -7 -18 0 -30 C7 -18 8 -6 0 0Z" fill="#ffb627" stroke="#f08a1a" stroke-width="1.2"/>
        <path d="M0 -2 C-4 -6 -3 -13 0 -19 C3 -13 4 -6 0 -2Z" fill="#fff4b8"/>
      </g></g></g>
      <rect class="hit" x="-16" y="-70" width="32" height="76" fill="transparent"/>
    </g>`).join('');
  return `
<svg class="cake-svg" viewBox="0 0 240 270" overflow="visible" aria-label="Birthday cake" role="img">
  <defs>
    <radialGradient id="glowG"><stop offset="0" stop-color="#ffe9a0" stop-opacity=".95"/><stop offset=".5" stop-color="#ffc94d" stop-opacity=".35"/><stop offset="1" stop-color="#ffc94d" stop-opacity="0"/></radialGradient>
    <clipPath id="clipL"><rect x="-60" y="-120" width="${CUT_X + 60.5}" height="500"/></clipPath>
    <clipPath id="clipR"><rect x="${CUT_X}" y="-120" width="300" height="500"/></clipPath>
    <g id="cakeBody" stroke-linejoin="round" stroke-linecap="round">
      <rect x="22" y="152" width="196" height="72" rx="10" fill="#ffc2dd" stroke="${INK}" stroke-width="3"/>
      ${icing(22, 218, 166, 12, '#fffaf0')}
      ${sprinkles}
      <rect x="58" y="100" width="124" height="54" rx="9" fill="#fffaf0" stroke="${INK}" stroke-width="3"/>
      ${icing(58, 182, 114, 10, '#ffa6c8')}
      <path d="M72 138 q6 6 12 0 q6 6 12 0 M120 138 q6 6 12 0 q6 6 12 0" stroke="#f7a1bf" stroke-width="2.6" fill="none"/>
      <circle cx="40" cy="157" r="5" fill="#e8416f" stroke="${INK}" stroke-width="2"/><circle cx="200" cy="157" r="5" fill="#e8416f" stroke="${INK}" stroke-width="2"/>
    </g>
  </defs>
  <g class="plate"><ellipse cx="120" cy="230" rx="124" ry="17" fill="#fff" stroke="${INK}" stroke-width="3"/><ellipse cx="120" cy="228" rx="96" ry="10" fill="none" stroke="#f7a1bf" stroke-width="2" stroke-dasharray="4 5"/></g>
  <g class="plate2" opacity="0"><ellipse cx="226" cy="240" rx="40" ry="9" fill="#fff" stroke="${INK}" stroke-width="3"/></g>
  <g class="cake-left" clip-path="url(#clipL)"><use href="#cakeBody"/></g>
  <g class="slice" clip-path="url(#clipR)"><use href="#cakeBody"/><g class="face" opacity="0">
    <rect x="${CUT_X}" y="170" width="9" height="54" fill="#ffe3b8" stroke="${INK}" stroke-width="1.6"/><rect x="${CUT_X}" y="190" width="9" height="8" fill="#e8416f"/><rect x="${CUT_X}" y="206" width="9" height="4" fill="#fffaf0"/>
    <rect x="${CUT_X}" y="118" width="9" height="36" fill="#ffe3b8" stroke="${INK}" stroke-width="1.6"/><rect x="${CUT_X}" y="132" width="9" height="6" fill="#e8416f"/>
  </g></g>
  <line class="cutline" x1="${CUT_X}" y1="96" x2="${CUT_X}" y2="96" stroke="#e8416f" stroke-width="3" stroke-dasharray="6 5" stroke-linecap="round"/>
  <g class="candles">${candles}</g>
  <g class="smoke"></g>
</svg>`;
}

const KNIFE = `
<svg class="knife-svg" viewBox="0 0 40 130" fill="none" stroke-linejoin="round" stroke-linecap="round" aria-hidden="true">
  <rect x="12" y="2" width="16" height="42" rx="7" fill="#f7a1bf" stroke="${INK}" stroke-width="3"/>
  <path d="M20 14 v18" stroke="#fff" stroke-width="3" stroke-opacity=".8"/>
  <path d="M8 44 H32 V50 H8Z" fill="#ffe27a" stroke="${INK}" stroke-width="3"/>
  <path d="M10 50 H32 L26 124 Q20 130 10 124Z" fill="#e8f0ff" stroke="${INK}" stroke-width="3"/>
  <path d="M16 58 V112" stroke="#fff" stroke-width="3"/>
</svg>`;

export default {
  mount(stage, ctx) {
    const garl = garland({ x0: -6, y0: 6, x1: 306, y1: 6, sag: 16, n: 13 });
    stage.innerHTML = `
      <section class="page cake-scene night">
        <svg class="mini-garland waves" viewBox="0 0 300 70" preserveAspectRatio="none" aria-hidden="true">${garl}</svg>
        <div class="cake-dim" id="dim" aria-hidden="true"></div>
        <div class="cake-wrap" id="wrap">${cakeSVG()}<div class="knife" id="knife" hidden>${KNIFE}</div></div>
        <b class="cs c1">✦</b><b class="cs c2">♡</b><b class="cs c3">✧</b><b class="cs c4">♡</b>
        <p class="cake-hint hand" id="hint">Tap each candle to light it 🕯️</p>
        <button class="btn mic" id="blowBtn" type="button" hidden>🎤 blow!</button>
        <button class="btn go hidden" id="go" type="button">one last surprise ➜</button>
      </section>`;

    const $ = (s) => stage.querySelector(s);
    const page = $('.cake-scene');
    const hint = $('#hint');
    const wrap = $('#wrap');
    const svg = $('.cake-svg');
    const dim = $('#dim');
    const candles = [...stage.querySelectorAll('.candle')];
    const flames = candles.map((c) => c.querySelector('.flame-wrap')); // GSAP scales the wrapper; CSS flickers the inner .flame
    let stageName = 'light';
    let trickDone = false;
    let lit = 0;
    let mic = null;
    const later = (s, fn) => { const t = gsap.delayedCall(s, fn); cleanup.push(() => t.kill()); return t; };
    const setHint = (t) => { hint.textContent = t; gsap.fromTo(hint, { scale: .85, opacity: 0 }, { scale: 1, opacity: 1, duration: .45, ease: 'back.out(2)' }); };

    // everything starts dark except the cake; each flame widens the pool of light
    gsap.set(flames, { scale: 0, transformOrigin: '0px 0px' });
    dim.style.setProperty('--g', 0);
    const glowTo = (n) => gsap.to(dim, { '--g': n, duration: .6, ease: 'power2.out' });

    const point = (c) => { const r = c.querySelector('.flame-wrap').getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height * 0.35]; };

    // ---- lighting
    function light(i) {
      const c = candles[i];
      if (c.dataset.lit) return;
      c.dataset.lit = '1';
      lit++;
      gsap.to(flames[i], { scale: 1, duration: .5, ease: 'back.out(3)', overwrite: true });
      gsap.to(c.querySelector('.ember'), { opacity: 0, duration: .2 });
      ctx.audio.sparkle();
      const [x, y] = point(c);
      ctx.fx.burst(x, y, 10);
      glowTo(lit);
    }
    function startWish() {
      stageName = 'blow';
      const dur = ctx.audio.birthday();
      setHint('Close your eyes… make a wish 🤍 then blow them all out!');
      const b = $('#blowBtn');
      b.hidden = false;
      gsap.from(b, { scale: 0, duration: .5, ease: 'back.out(2)' });
      cleanup.push(() => gsap.killTweensOf(b));
      void dur;
    }
    candles.forEach((c, i) => {
      c.addEventListener('click', () => {
        if (stageName === 'light') { light(i); if (lit === candles.length) later(.7, startWish); }
        else if (stageName === 'blow' && c.dataset.lit) extinguish(i);
      });
    });

    // ---- blowing out
    function smokeAt(i) {
      const g = svg.querySelector('.smoke');
      const x = CANDLES[i], y = 62;
      for (let k = 0; k < 4; k++) {
        const p = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        p.setAttribute('cx', x + (k - 1.5) * 1.5); p.setAttribute('cy', y); p.setAttribute('r', 2.5 + k * .8);
        p.setAttribute('fill', '#b9bfdc'); p.setAttribute('stroke', INK); p.setAttribute('stroke-width', '.8'); p.setAttribute('opacity', '.9');
        g.appendChild(p);
        gsap.to(p, { attr: { cy: y - 40 - k * 12, cx: x + gsap.utils.random(-14, 14), r: 7 + k * 2 }, opacity: 0, duration: 1.6 + k * .2, delay: k * .08, ease: 'power1.out', onComplete: () => p.remove() });
      }
    }
    function extinguish(i) {
      const c = candles[i];
      if (!c.dataset.lit) return;
      delete c.dataset.lit;
      lit--;
      gsap.to(flames[i], { scale: 0, duration: .25, ease: 'power2.in', overwrite: true });
      gsap.fromTo(c.querySelector('.ember'), { opacity: 1 }, { opacity: 0, duration: 1.4 });
      smokeAt(i);
      ctx.audio.puff();
      glowTo(lit);
      if (lit === 0) later(.5, allOut);
    }
    function allOut() {
      if (stageName !== 'blow') return;
      if (!trickDone) {
        trickDone = true;
        stageName = 'trick';
        setHint('…');
        later(1.3, () => {
          const i = 2;
          const c = candles[i];
          c.dataset.lit = '1'; lit = 1;
          gsap.to(flames[i], { scale: 1.1, duration: .35, ease: 'back.out(4)', overwrite: true });
          ctx.audio.sparkle();
          glowTo(1);
          const [x, y] = point(c);
          ctx.fx.burst(x, y, 16);
          setHint('Hurrr! Trick candle, nasharam 😈 blow it again!');
          stageName = 'blow';
        });
        return;
      }
      celebrate();
    }

    // microphone: a sustained loud puff of air blows candles out, one at a time
    const modeBlowBtn = $('#blowBtn');
    modeBlowBtn.onclick = async () => {
      modeBlowBtn.disabled = true;
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } });
        const AC = window.AudioContext || window.webkitAudioContext;
        const ac = new AC();
        await ac.resume();
        const an = ac.createAnalyser();
        an.fftSize = 1024;
        ac.createMediaStreamSource(stream).connect(an);
        const buf = new Float32Array(an.fftSize);
        const levels = [];
        let last = 0, raf = 0;
        const loop = (t) => {
          an.getFloatTimeDomainData(buf);
          let sum = 0;
          for (let k = 0; k < buf.length; k++) sum += buf[k] * buf[k];
          const rms = Math.sqrt(sum / buf.length);
          levels.push(rms);
          if (levels.length > 60) levels.shift();
          page.style.setProperty('--bend', Math.min(28, rms * 120).toFixed(1));
          if (stageName === 'blow' && detectBlow(levels) && t - last > 420) {
            const next = candles.findIndex((c) => c.dataset.lit);
            if (next >= 0) { extinguish(next); last = t; }
          }
          raf = requestAnimationFrame(loop);
        };
        raf = requestAnimationFrame(loop);
        mic = { stop: () => { cancelAnimationFrame(raf); stream.getTracks().forEach((tr) => tr.stop()); ac.close(); page.style.setProperty('--bend', 0); } };
        cleanup.push(() => mic?.stop());
        modeBlowBtn.textContent = '🎤 listening… blow!';
        modeBlowBtn.classList.add('live');
        setHint('Take a deep breath and blow into the mic! (or swipe the flames)');
      } catch {
        modeBlowBtn.hidden = true;
        setHint('No mic? No problem: swipe your finger across the flames or tap them 👆');
      }
    };

    // swiping a finger across the flames also blows them out
    wrap.addEventListener('pointermove', (e) => {
      if (stageName !== 'blow') return;
      candles.forEach((c, i) => {
        if (!c.dataset.lit) return;
        const [x, y] = point(c);
        if (Math.hypot(e.clientX - x, e.clientY - y) < 30) extinguish(i);
      });
    });

    // ---- celebration, then the knife
    function celebrate() {
      stageName = 'celebrate';
      mic?.stop(); mic = null;
      $('#blowBtn').hidden = true;
      ctx.audio.cheer();
      ctx.fx.burst(innerWidth / 2, innerHeight * 0.4, 130);
      setHint('Your wish is on its way ✨');
      later(1.8, () => {
        gsap.to(dim, { opacity: 0, duration: 2, ease: 'power1.inOut' });
        page.classList.remove('night');
        ctx.audio.sparkle();
        setHint('Now cut the cake! Drag the knife down through it 🔪');
        startCut();
      });
    }

    // ---- cutting
    function startCut() {
      stageName = 'cut';
      const knife = $('#knife');
      knife.hidden = false;
      const sc = () => svg.getBoundingClientRect().width / 240;
      const wr = wrap.getBoundingClientRect();
      const sr = svg.getBoundingClientRect();
      const topY = sr.top - wr.top + 98 * sc();
      const botY = sr.top - wr.top + 226 * sc();
      const cx = sr.left - wr.left + CUT_X * sc();
      const kw = 40 * (sc() * 0.9), kh = 130 * (sc() * 0.9);
      knife.style.width = kw + 'px'; knife.style.height = kh + 'px';
      const home = { x: cx - kw / 2, y: topY - kh - 10 };
      gsap.set(knife, { x: home.x, y: home.y - 80, opacity: 0 });
      gsap.to(knife, { y: home.y, opacity: 1, duration: .8, ease: 'back.out(1.6)' });
      const line = svg.querySelector('.cutline');
      let dragging = false, dx = 0, dy = 0;
      const tipOffset = kh - 6; // blade tip sits this far below the knife's top
      knife.onpointerdown = (e) => { dragging = true; knife.setPointerCapture(e.pointerId); const k = knife.getBoundingClientRect(); dx = e.clientX - k.left; dy = e.clientY - k.top; gsap.killTweensOf(knife); ctx.audio.click(); };
      knife.onpointermove = (e) => {
        if (!dragging) return;
        const w = wrap.getBoundingClientRect();
        let x = e.clientX - w.left - dx, y = e.clientY - w.top - dy;
        x = Math.max(cx - kw / 2 - 26, Math.min(cx - kw / 2 + 26, x)); // stay near the cut line
        gsap.set(knife, { x, y });
        const tip = y + tipOffset;
        const p = Math.max(0, Math.min(1, (tip - topY) / (botY - topY)));
        line.setAttribute('y2', 96 + p * 130);
        if (p >= 0.95) { dragging = false; cut(); }
      };
      knife.onpointerup = knife.onpointercancel = () => {
        if (!dragging) return;
        dragging = false;
        line.setAttribute('y2', 96);
        gsap.to(knife, { x: home.x, y: home.y, duration: .5, ease: 'back.out(1.7)' });
      };

      function cut() {
        stageName = 'done';
        ctx.audio.slice();
        knife.style.pointerEvents = 'none';
        const slice = svg.querySelector('.slice');
        const tl = gsap.timeline();
        tl.to(knife, { y: '+=30', duration: .15 })
          .to(knife, { x: home.x + 160, y: home.y - 40, rotation: 25, opacity: 0, duration: .6, ease: 'power2.in' })
          .to(svg.querySelector('.plate2'), { opacity: 1, duration: .3 }, '<')
          .to(wrap, { x: -34, duration: .9, ease: 'power2.inOut' }, '<')
          .to(svg.querySelector('.cutline'), { opacity: 0, duration: .4 }, '<')
          .to(slice, { x: 36, y: 10, rotation: 6, svgOrigin: '200 230', duration: .9, ease: 'back.out(1.7)' }, '<.1')
          .to(svg.querySelector('.face'), { opacity: 1, duration: .4 }, '<.2')
          .call(() => {
            ctx.audio.cheer();
            const r = slice.getBoundingClientRect();
            ctx.fx.burst(r.left + r.width / 2, r.top + r.height / 2, 90);
            ctx.fx.hearts(r.left + r.width / 2, r.top, 10);
            setHint('That slice is all yours. You earned it! 🍰');
            const go = $('#go');
            go.classList.remove('hidden');
            gsap.from(go, { scale: 0, duration: .6, ease: 'back.out(2)' });
          }, null, '+=.3');
      }
    }

    $('#go').onclick = () => { $('#go').disabled = true; ctx.next(); };
    gsap.from(wrap, { y: 40, opacity: 0, duration: .9, delay: .4, ease: 'back.out(1.4)', clearProps: 'opacity,transform' });
  },
  unmount() { cleanup.forEach((f) => f()); cleanup = []; },
};
