import { SHOTS, TOTAL_SECONDS, locate, renderShot } from '../lib/story.js';

// Finale: a little cartoon plays on a screen. When it ends, a button leads on to the closing scene.
let cleanup = [];

const TITLE_CARD = `
<div class="cv-inner">
  <p class="cv-kicker">a little cartoon</p>
  <h2 class="cv-title">Priyanka's<br>Birthday Story</h2>
  <svg class="doodle cv-art" viewBox="0 0 120 100" fill="none" stroke-linejoin="round" stroke-linecap="round" aria-hidden="true">
    <path d="M30 40 L22 14 L44 30Z M90 40 L98 14 L76 30Z" fill="#ff6b8b" stroke="#3c4a85" stroke-width="3.5"/>
    <circle cx="60" cy="58" r="32" fill="#ffd9b8" stroke="#3c4a85" stroke-width="3.5"/>
    <path d="M30 50 Q40 26 60 30 Q80 26 90 50 Q74 38 60 40 Q46 38 30 50Z" fill="#3a2a3a" stroke="#3c4a85" stroke-width="3"/>
    <circle cx="48" cy="58" r="3.4" fill="#3c4a85"/><circle cx="72" cy="58" r="3.4" fill="#3c4a85"/>
    <path d="M42 72 Q60 92 78 72Z" fill="#7a2d5a" stroke="#3c4a85" stroke-width="3"/>
    <ellipse cx="38" cy="68" rx="6" ry="3.6" fill="#ff8fb8" opacity=".7"/><ellipse cx="82" cy="68" rx="6" ry="3.6" fill="#ff8fb8" opacity=".7"/>
  </svg>
  <p class="cv-by">starring Rakshas &amp; Chudail</p>
  <span class="cv-playbtn" aria-hidden="true">▶</span>
</div>`;

export default {
  mount(stage, ctx) {
    const SPEED = ctx.params.has('fast') ? 8 : 1;   // ?fast=1 plays the story quickly (used by tests)
    stage.innerHTML = `
      <section class="page finale-scene">
        <div class="fs-book" id="bookArea">
          <div class="scr-wrap" id="wrap">
            <i class="tape" style="left:16px;top:-9px;--r:-8deg"></i><i class="tape" style="right:16px;top:-9px;--r:7deg"></i>
            <div class="scr" id="screen">
              <div class="scr-view" id="view"></div>
              <button class="scr-play" id="play" type="button" aria-label="Play the story">${TITLE_CARD}</button>
              <div class="scr-paused" id="paused" hidden>▶ tap to continue</div>
            </div>
            <div class="scr-prog" aria-hidden="true"><i id="prog"></i></div>
          </div>
          <p class="fb-cap hand" id="cap">tap play to watch</p>
          <button class="btn" id="toEnd" type="button" hidden>one last thing ➜</button>
        </div>
      </section>`;

    const $ = (s) => stage.querySelector(s);
    const view = $('#view'), cap = $('#cap'), screen = $('#screen'), prog = $('#prog');
    let alive = true;
    cleanup.push(() => { alive = false; });
    const wait = (ms) => new Promise((r) => { const t = setTimeout(r, ms); cleanup.push(() => clearTimeout(t)); });
    const later = (s, fn) => { const t = gsap.delayedCall(s, fn); cleanup.push(() => t.kill()); return t; };
    const setCap = (t) => { cap.textContent = t; gsap.fromTo(cap, { scale: .8, opacity: 0, y: 8 }, { scale: 1, opacity: 1, y: 0, duration: .35, ease: 'back.out(2)' }); };

    view.innerHTML = renderShot(0, 0);

    // ---- the screen is taped up onto the page
    gsap.from($('#wrap'), { y: -520, rotation: 6, duration: 1.3, delay: .4, ease: 'bounce.out' });
    ctx.audio.flip();

    // ---- the player
    let t = 0, running = false, started = false, lastShot = -1, lastNow = 0, lastDraw = 0, raf = 0;
    const fired = new Set();
    cleanup.push(() => cancelAnimationFrame(raf));

    const draw = () => {
      const { si, k } = locate(t);
      if (si !== lastShot) {
        lastShot = si;
        setCap(SHOTS[si].caption);
        gsap.fromTo(view, { opacity: 0.15 }, { opacity: 1, duration: .25 });   // a quick cut between scenes
      }
      // sound effects fire once as each cue frame is reached
      const sfx = SHOTS[si].sfx;
      for (const key of Object.keys(sfx)) {
        const id = `${si}:${key}`;
        if (k >= +key && !fired.has(id)) { fired.add(id); ctx.audio.sfx(sfx[key]); }
      }
      view.innerHTML = renderShot(si, k);
      prog.style.width = `${Math.min(100, (t / TOTAL_SECONDS) * 100)}%`;
    };

    const loop = (now) => {
      if (!running || !alive) return;
      const dt = Math.min(0.1, (now - lastNow) / 1000);
      lastNow = now;
      t += dt * SPEED;
      if (t >= TOTAL_SECONDS) { running = false; t = TOTAL_SECONDS; draw(); finish(); return; }
      if (now - lastDraw >= 32) { lastDraw = now; draw(); }   // about 30 frames a second
      raf = requestAnimationFrame(loop);
    };
    const resume = () => { running = true; lastNow = performance.now(); $('#paused').hidden = true; raf = requestAnimationFrame(loop); };

    $('#play').onclick = () => {
      if (started) return;
      started = true;
      ctx.audio.click();
      gsap.to($('#play'), { opacity: 0, scale: 1.08, duration: .4, onComplete: () => { $('#play').hidden = true; } });
      later(.5, resume);
    };
    // tap the picture to pause or carry on
    screen.addEventListener('click', (e) => {
      if (!started || e.target.closest('#play') || t >= TOTAL_SECONDS) return;
      if (running) { running = false; cancelAnimationFrame(raf); $('#paused').hidden = false; } else resume();
    });

    function finish() {
      ctx.audio.cheer();
      ctx.fx.burst(innerWidth / 2, innerHeight * 0.35, 100);
      setCap('and that is the story ✨');
      const b = $('#toEnd');
      b.hidden = false;
      gsap.from(b, { scale: 0, duration: .6, ease: 'back.out(2)' });
    }

    $('#toEnd').onclick = () => { $('#toEnd').disabled = true; ctx.next(); };
  },
  unmount() { cleanup.forEach((f) => f()); cleanup = []; },
};
