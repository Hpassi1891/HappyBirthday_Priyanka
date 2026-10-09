import { muralSVG } from '../lib/mural.js';

// The room: a party mural painted on the wall, barely visible in the dark.
// She can slide a finger around like a torch, then flips the switch and the wall slowly lights up.
let cleanup = [];
const BULB_COLORS = ['#ff7eb3', '#ffd166', '#c9a7ff', '#8fd3ff', '#ff9fc4'];
const BULB_TOPS = [14, 24, 32, 34, 30, 22, 16, 18, 26, 32, 30, 22, 14, 12];

export default {
  mount(stage, ctx) {
    stage.innerHTML = `
      <section class="page room" id="room">
        <div class="wallbg"></div>
        ${muralSVG()}
        <div class="floor"></div>
        <div class="rug" aria-hidden="true"></div>
        <svg class="fairy" viewBox="0 0 400 60" preserveAspectRatio="none" aria-hidden="true"><path d="M0 8 Q100 54 200 14 T400 10"/></svg>
        <div class="bulbs" id="bulbs"></div>
        <div class="disco" id="disco" aria-hidden="true"><i></i></div>
        <div class="warm" aria-hidden="true"></div>
        <div class="dim" id="dim" aria-hidden="true"></div>
        <button class="switch" id="switch" aria-label="Light switch" aria-pressed="false"><span class="knob-sw"></span><small>lights</small></button>
        <span class="flipme hand" id="flipme">flip me! ➜</span>
        <button class="popper" id="popper" aria-label="Party popper">🎉<small>pull!</small></button>
        <p class="room-hint hand" id="hint">It's so dark in here… slide your finger around to peek, then find the light switch</p>
        <button class="btn go hidden" id="go" type="button">on to her favourites ➜</button>
      </section>`;

    const $ = (s) => stage.querySelector(s);
    const room = $('#room');
    const dim = $('#dim');
    const hint = $('#hint');
    const state = { lit: false, torch: true };
    const slow = matchMedia('(prefers-reduced-motion: reduce)').matches ? 0.2 : 1;
    const kill = (t) => cleanup.push(() => t.kill());

    // fairy light bulbs along the string (they switch on one by one later)
    $('#bulbs').innerHTML = BULB_TOPS.map((top, i) =>
      `<i style="left:${4 + i * 7}%;top:${top}px;color:${BULB_COLORS[i % 5]};background:${BULB_COLORS[i % 5]};--i:${i}"></i>`).join('');

    // ---- torch: a small pool of light that wanders by itself, then follows her finger
    const pos = { x: 0, y: 0 };
    const place = () => { dim.style.setProperty('--x', pos.x + 'px'); dim.style.setProperty('--y', pos.y + 'px'); };
    const w = () => room.clientWidth, h = () => room.clientHeight;
    pos.x = w() * 0.6; pos.y = h() * 0.25; place();
    dim.style.setProperty('--r', Math.round(Math.min(w(), h()) * 0.24) + 'px');
    const wander = gsap.timeline({ repeat: -1, yoyo: true, onUpdate: place });
    wander.to(pos, { x: () => w() * 0.25, y: () => h() * 0.5, duration: 3.2, ease: 'sine.inOut' })
      .to(pos, { x: () => w() * 0.75, y: () => h() * 0.38, duration: 3.4, ease: 'sine.inOut' })
      .to(pos, { x: () => w() * 0.5, y: () => h() * 0.15, duration: 3, ease: 'sine.inOut' });
    kill(wander);
    const follow = (e) => {
      if (!state.torch) return;
      wander.kill();
      const r = room.getBoundingClientRect();
      gsap.to(pos, { x: e.clientX - r.left, y: e.clientY - r.top, duration: .25, ease: 'power2.out', onUpdate: place, overwrite: true });
    };
    room.addEventListener('pointermove', follow);
    room.addEventListener('pointerdown', follow);

    // ---- lights on
    const sw = $('#switch');
    const lightUp = () => {
      if (state.lit) return;
      state.lit = true;
      state.torch = false;
      wander.kill();
      sw.setAttribute('aria-pressed', 'true');
      ctx.audio.click();
      ctx.audio.glow();
      gsap.to($('#flipme'), { opacity: 0, duration: .3 });
      hint.textContent = '…';

      // the light spreads out from the switch
      const sr = sw.getBoundingClientRect(), rr = room.getBoundingClientRect();
      dim.style.setProperty('--x', sr.left - rr.left + sr.width / 2 + 'px');
      dim.style.setProperty('--y', sr.top - rr.top + sr.height / 2 + 'px');

      const tl = gsap.timeline();
      kill(tl);
      // a couple of nervous flickers first
      tl.to(room, { filter: 'brightness(1.5)', duration: .07 }).to(room, { filter: 'brightness(1)', duration: .12 })
        .to(room, { filter: 'brightness(1.8)', duration: .06 }).to(room, { filter: 'brightness(1)', duration: .25 })
        .call(() => room.classList.add('lit'))
        .fromTo(dim, { '--r': 30 }, { '--r': Math.round(Math.hypot(w(), h()) * 1.1), duration: 3.6 * slow, ease: 'power2.inOut', modifiers: { '--r': (v) => parseFloat(v) + 'px' } }, '>')
        .to($('.mural'), { filter: 'brightness(1) saturate(1)', duration: 3.2 * slow, ease: 'power1.inOut' }, '<')
        .to($('.warm'), { opacity: 1, duration: 3 * slow }, '<');

      // bulbs switch on one by one, left to right
      stage.querySelectorAll('.bulbs i').forEach((b, i) => gsap.delayedCall((0.7 + i * 0.14) * slow, () => b.classList.add('on')));

      // the painting colours itself in
      const at = (sel, vars, delay) => gsap.from(stage.querySelectorAll(sel), { ...vars, delay: delay * slow, clearProps: 'all' });
      at('.g-garland .flag', { scale: .2, opacity: 0, duration: .7, stagger: .05, ease: 'back.out(2)' }, 1.0);
      at('.g-letters .flag', { scale: .1, opacity: 0, duration: .8, stagger: .09, ease: 'back.out(2.2)' }, 1.5);
      at('.g-ribbon', { opacity: 0, scale: .6, transformOrigin: '500px 216px', duration: 1, ease: 'back.out(1.6)' }, 2.3);
      at('.g-plaque', { opacity: 0, scale: .4, transformOrigin: '500px 322px', duration: 1.1, ease: 'back.out(1.5)' }, 2.6);
      at('.fw', { scale: 0, duration: .6, stagger: .04, ease: 'back.out(3)' }, 2.9);
      at('.bal', { y: 40, opacity: 0, duration: 1.1, stagger: .12, ease: 'back.out(1.5)' }, 1.9);
      stage.querySelectorAll('.streamer').forEach((p, i) => gsap.fromTo(p, { strokeDasharray: 1, strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1.8 * slow, delay: (0.9 + i * 0.1) * slow, ease: 'power2.out', clearProps: 'strokeDasharray,strokeDashoffset' }));
      gsap.delayedCall(1.6 * slow, () => ctx.audio.sparkle());
      gsap.delayedCall(2.6 * slow, () => ctx.audio.sparkle());

      // all lit: celebrate and let her continue
      gsap.delayedCall(4 * slow, () => {
        hint.textContent = 'Ta-da! Happy Birthday, Chudail! ✨';
        ctx.audio.cheer();
        ctx.fx.burst(innerWidth / 2, innerHeight * 0.35, 120);
        const go = $('#go');
        go.classList.remove('hidden');
        gsap.from(go, { scale: 0, duration: .6, ease: 'back.out(2)' });
        dim.style.display = 'none';
      });
    };
    sw.onclick = lightUp;

    // ---- party popper + painted balloons (after the lights are on)
    $('#popper').onclick = () => {
      ctx.audio.pop();
      const r = $('#popper').getBoundingClientRect();
      ctx.fx.burst(r.left, r.top, 80);
      ctx.fx.rain(1800);
    };
    stage.querySelectorAll('.bal').forEach((b) => {
      b.addEventListener('click', () => {
        if (!state.lit || b.dataset.popped) return;
        b.dataset.popped = '1';
        const r = b.getBoundingClientRect();
        ctx.audio.pop();
        ctx.fx.burst(r.left + r.width / 2, r.top + r.height * 0.2, 28);
        b.style.visibility = 'hidden';
        const t = setTimeout(() => {
          b.style.visibility = 'visible';
          delete b.dataset.popped;
          gsap.fromTo(b, { opacity: 0 }, { opacity: 1, duration: .8 });
        }, 3500);
        cleanup.push(() => clearTimeout(t));
      });
    });

    // The page turn carries her on to the next page.
    $('#go').onclick = () => { $('#go').disabled = true; ctx.next(); };
  },
  unmount() { cleanup.forEach((f) => f()); cleanup = []; },
};
