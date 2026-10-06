const BANNER = ['HAPPY', 'BIRTHDAY', 'CHUDAIL'];
const BALLOONS = [
  { x: 6, y: 42, c: '#ff7eb3' }, { x: 20, y: 52, c: '#ffd166' }, { x: 78, y: 40, c: '#c9a7ff' },
  { x: 90, y: 54, c: '#ff7eb3' }, { x: 66, y: 50, c: '#8fd3ff' },
];

const shuffle = (a) => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = (Math.random() * (i + 1)) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; };
let cleanup = [];

export default {
  mount(stage, ctx) {
    const letters = shuffle(BANNER.join('').split(''));
    stage.innerHTML = `
      <section class="room">
        <div class="wall"></div>
        <div class="floor"></div>
        <svg class="fairy" viewBox="0 0 400 60" preserveAspectRatio="none" aria-hidden="true">
          <path d="M0 8 Q100 54 200 14 T400 10" fill="none" stroke="#b3225f66" stroke-width="2"/>
        </svg>
        <div class="bulbs" id="bulbs"></div>
        <div class="disco" id="disco" aria-hidden="true"><i></i></div>
        <div class="banner" id="banner">
          ${BANNER.map((w) => `<div class="bunting">${w.split('').map((ch) => `<span class="slot" data-ch="${ch}"></span>`).join('')}</div>`).join('')}
        </div>
        <div class="shelf" aria-hidden="true"><span>🧁</span><span class="baker hand">future master baker 👩‍🍳</span><span>🍰</span></div>
        <div id="balloons"></div>
        <div class="dim" id="dim"></div>
        <button class="switch" id="switch" aria-label="Light switch" aria-pressed="false"><span class="knob-sw"></span><small>lights</small></button>
        <button class="popper" id="popper" aria-label="Party popper">🎉<small>pull!</small></button>
        <p class="hint hand room-hint" id="hint">Flip the switch to turn on the lights 💡</p>
        <div class="tray" id="tray">${letters.map((ch, i) => `<span class="tile" data-ch="${ch}" data-i="${i}">${ch}</span>`).join('')}</div>
        <button class="btn go hidden" id="go">Let's go see the Fav Wall ➜</button>
      </section>`;

    const $ = (s) => stage.querySelector(s);
    const state = { lit: false, banner: false };

    // --- fairy lights bulbs
    const colors = ['#ff7eb3', '#ffd166', '#c9a7ff', '#8fd3ff', '#ff9fc4'];
    $('#bulbs').innerHTML = Array.from({ length: 14 }, (_, i) =>
      `<i style="left:${4 + i * 7}%;top:${[12, 22, 30, 32, 28, 20, 14, 16, 24, 30, 28, 20, 12, 10][i]}px;background:${colors[i % 5]};animation-delay:${(i % 5) * .3}s"></i>`).join('');

    // --- lights
    const sw = $('#switch');
    const refresh = () => {
      const done = state.lit && state.banner;
      $('#hint').textContent = !state.lit ? 'Flip the switch to turn on the lights 💡'
        : !state.banner ? 'Now put up the banner — drag or tap the letters 🎀'
        : 'Looking perfect! ✨';
      if (done && $('#go').classList.contains('hidden')) {
        $('#go').classList.remove('hidden');
        gsap.from($('#go'), { scale: 0, duration: .6, ease: 'back.out(2)' });
        ctx.audio.cheer(); ctx.fx.burst(innerWidth / 2, innerHeight / 3, 120);
      }
    };
    sw.onclick = () => {
      state.lit = !state.lit;
      stage.firstElementChild.classList.toggle('lit', state.lit);
      sw.setAttribute('aria-pressed', state.lit);
      ctx.audio.click();
      if (state.lit) ctx.audio.sparkle();
      refresh();
    };

    // --- balloons
    const balloonsEl = $('#balloons');
    BALLOONS.forEach((b, i) => {
      const el = document.createElement('button');
      el.className = 'balloon';
      el.setAttribute('aria-label', 'Balloon');
      el.style.cssText = `left:${b.x}%;top:${b.y}%;--c:${b.c};animation-delay:${i * .4}s`;
      el.innerHTML = '<i></i>';
      el.onclick = () => {
        const r = el.getBoundingClientRect();
        ctx.audio.pop();
        ctx.fx.burst(r.left + r.width / 2, r.top + r.height / 2, 30);
        el.style.visibility = 'hidden';
        el.disabled = true;
        const t = setTimeout(() => {
          el.style.visibility = 'visible'; el.disabled = false;
          gsap.from(el, { scale: 0, y: 60, duration: .8, ease: 'back.out(2)' });
        }, 3500);
        cleanup.push(() => clearTimeout(t));
      };
      balloonsEl.appendChild(el);
    });

    // --- party popper
    $('#popper').onclick = () => {
      ctx.audio.pop();
      const r = $('#popper').getBoundingClientRect();
      ctx.fx.burst(r.left, r.top, 80);
      ctx.fx.rain(1800);
    };

    // --- banner letters: drag or tap to place
    const banner = $('#banner');
    const slotsFor = (ch) => [...stage.querySelectorAll(`.slot[data-ch="${ch}"]:not(.filled)`)];

    function fill(tile, slot) {
      const to = slot.getBoundingClientRect();
      const from = tile.getBoundingClientRect();
      tile.style.cssText = `position:fixed;left:${from.left}px;top:${from.top}px;width:${from.width}px;height:${from.height}px;z-index:40;margin:0`;
      slot.classList.add('filled'); // reserve so it can't be double-booked
      gsap.to(tile, {
        left: to.left, top: to.top, width: to.width, height: to.height, rotation: 0, duration: .45, ease: 'back.out(1.6)',
        onComplete: () => {
          slot.textContent = tile.dataset.ch;
          slot.classList.add('pop');
          tile.remove(); tile.spacer?.remove();
          ctx.audio.sparkle();
          const r = slot.getBoundingClientRect();
          ctx.fx.hearts(r.left + r.width / 2, r.top, 3);
          if (!stage.querySelector('.slot:not(.filled)')) { state.banner = true; refresh(); }
        },
      });
    }

    function nearest(slots, x, y) {
      return slots.sort((a, b) => dist(a, x, y) - dist(b, x, y))[0];
    }
    const dist = (el, x, y) => { const r = el.getBoundingClientRect(); return Math.hypot(r.left + r.width / 2 - x, r.top + r.height / 2 - y); };

    stage.querySelectorAll('.tile').forEach((tile) => {
      tile.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        tile.setPointerCapture(e.pointerId);
        const r = tile.getBoundingClientRect();
        const start = { x: e.clientX, y: e.clientY, l: r.left, t: r.top };
        let lifted = false;
        const lift = () => {
          lifted = true;
          tile.spacer = document.createElement('span');
          tile.spacer.className = 'tile spacer';
          tile.before(tile.spacer);
          tile.style.cssText = `position:fixed;left:${r.left}px;top:${r.top}px;width:${r.width}px;height:${r.height}px;z-index:40;margin:0`;
          tile.classList.add('drag');
        };
        const move = (ev) => {
          const dx = ev.clientX - start.x, dy = ev.clientY - start.y;
          if (!lifted && Math.hypot(dx, dy) > 8) lift();
          if (lifted) { tile.style.left = start.l + dx + 'px'; tile.style.top = start.t + dy + 'px'; }
        };
        const up = (ev) => {
          tile.removeEventListener('pointermove', move);
          tile.removeEventListener('pointerup', up);
          tile.removeEventListener('pointercancel', up);
          const slots = slotsFor(tile.dataset.ch);
          if (!lifted) { // tap
            if (slots[0]) { tile.spacer = document.createElement('span'); tile.spacer.className = 'tile spacer'; tile.before(tile.spacer); fill(tile, slots[0]); }
            return;
          }
          const b = banner.getBoundingClientRect();
          const over = ev.clientX > b.left - 20 && ev.clientX < b.right + 20 && ev.clientY > b.top - 20 && ev.clientY < b.bottom + 20;
          if (over && slots.length) { fill(tile, nearest(slots, ev.clientX, ev.clientY)); return; }
          // spring back
          const home = tile.spacer.getBoundingClientRect();
          ctx.audio.wrong();
          gsap.to(tile, { left: home.left, top: home.top, duration: .4, ease: 'back.out(1.7)', onComplete: () => {
            tile.style.cssText = ''; tile.classList.remove('drag'); tile.spacer.remove();
          } });
        };
        tile.addEventListener('pointermove', move);
        tile.addEventListener('pointerup', up);
        tile.addEventListener('pointercancel', up);
      });
    });

    $('#go').onclick = () => ctx.next();
  },
  unmount() { cleanup.forEach((f) => f()); cleanup = []; },
};
