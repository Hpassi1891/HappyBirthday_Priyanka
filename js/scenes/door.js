import { checkAnswer } from '../lib/door.js';
import { isUnlocked, timeLeft } from '../lib/countdown.js';

const pick = (arr) => arr[(Math.random() * arr.length) | 0];
let timer = null;

export default {
  mount(stage, ctx) {
    const c = ctx.copy.door;
    const unlocked = isUnlocked(new Date(), { preview: ctx.preview });
    const stars = Array.from({ length: 34 }, () =>
      `<i style="left:${(Math.random() * 100).toFixed(1)}%;top:${(Math.random() * 62).toFixed(1)}%;animation-delay:${(Math.random() * 3).toFixed(2)}s;transform:scale(${(.5 + Math.random()).toFixed(2)})"></i>`).join('');
    stage.innerHTML = `
      <section class="scene door-scene">
        <div class="door-world">
        <div class="sky" aria-hidden="true">
          <div class="stars">${stars}</div>
          <span class="moon"></span>
          <span class="cloud c1"></span><span class="cloud c2"></span>
          <svg class="castle" viewBox="0 0 240 190" aria-hidden="true">
            <g stroke="#6b2358" stroke-width="4" stroke-linejoin="round">
              <rect x="20" y="96" width="34" height="94" fill="#ffe3f1"/><path d="M12 98 L37 40 L62 98 Z" fill="#ff7eb3"/>
              <rect x="186" y="96" width="34" height="94" fill="#ffe3f1"/><path d="M178 98 L203 40 L228 98 Z" fill="#ff7eb3"/>
              <rect x="86" y="70" width="68" height="120" fill="#fff3fa"/><path d="M76 72 L120 4 L164 72 Z" fill="#f0568e"/>
              <rect x="54" y="126" width="132" height="64" fill="#ffe3f1"/>
              <path d="M104 190 V156 a16 16 0 0 1 32 0 V190 Z" fill="#c9a7ff"/>
              <circle cx="120" cy="52" r="8" fill="#8fd3ff"/><circle cx="37" cy="76" r="6" fill="#8fd3ff"/><circle cx="203" cy="76" r="6" fill="#8fd3ff"/>
              <path d="M120 4 V-10 M120 -10 l16 6 l-16 6" fill="#f7c86a" stroke-width="3"/>
            </g>
          </svg>
          <span class="hill h1"></span><span class="hill h2"></span>
          <b class="spark s1">✦</b><b class="spark s2">✦</b><b class="spark s3">✧</b><b class="spark s4">✦</b>
        </div>
        <h1 class="title door-title">${c.title}</h1>
        <div class="arch">
          <div class="door" id="door">
            <div class="door-panel">
              <span class="plank"></span><span class="plank p2"></span>
              <span class="porthole">💖</span>
              <span class="hinge hg1"></span><span class="hinge hg2"></span>
              <span class="knob"></span>
              <div class="note" id="note"><span class="pin"></span>${c.note.map((l) => `<p>${l}</p>`).join('')}</div>
            </div>
          </div>
        </div>
        <div id="locked" class="card ${unlocked ? 'hidden' : ''}">
          <p class="hand hint">${c.lockedHint}</p>
          <div class="count" id="count"></div>
        </div>
        <form id="form" class="card ${unlocked ? '' : 'hidden'}" autocomplete="off">
          <p class="question">${c.question}</p>
          <input id="answer" class="answer" type="text" placeholder="${c.placeholder}" enterkeyhint="go" autocapitalize="off">
          <button class="btn" type="submit">${c.button}</button>
          <p id="msg" class="msg" aria-live="polite"></p>
        </form>
        </div>
      </section>`;

    const door = stage.querySelector('#door');
    const msg = stage.querySelector('#msg');
    const note = stage.querySelector('#note');
    note.onclick = (e) => { e.stopPropagation(); ctx.audio.click(); gsap.fromTo(note, { rotation: -9 }, { rotation: -3, duration: .7, ease: 'elastic.out(2,.3)' }); };

    if (!unlocked) {
      const countEl = stage.querySelector('#count');
      const tick = () => {
        const t = timeLeft();
        countEl.innerHTML = [['d', 'days'], ['h', 'hrs'], ['m', 'min'], ['s', 'sec']]
          .map(([k, l]) => `<div class="cd"><b>${t[k]}</b><small>${l}</small></div>`).join('');
        if (isUnlocked()) location.reload();
      };
      tick();
      timer = setInterval(tick, 1000);
      door.onclick = () => { gsap.fromTo(door, { x: -6 }, { x: 0, duration: .5, ease: 'elastic.out(2,.3)' }); ctx.audio.wrong(); };
      return;
    }

    const input = stage.querySelector('#answer');

    // Open the door, walk into the light, and hand over to the room (which fades up out of the glow).
    function walkIn() {
      const section = stage.querySelector('.door-scene');
      const world = stage.querySelector('.door-world');
      const r = door.getBoundingClientRect();
      const ox = r.left + r.width / 2, oy = r.top + r.height * 0.6;
      const glow = document.createElement('div');
      glow.className = 'door-glow';
      glow.style.background = `radial-gradient(circle at ${ox}px ${oy}px, #fffef2 0%, #ffeaa6 38%, #ffc7e0 100%)`;
      section.appendChild(glow);
      ctx.audio.creak();
      door.classList.add('open');
      gsap.timeline({ onComplete: () => ctx.next() })
        .to(world.querySelectorAll('.door-title, #form'), { opacity: 0, duration: .5 }, .15)
        .call(() => { ctx.audio.cheer(); ctx.fx.burst(ox, oy, 120); }, null, .55)
        .to(world, { scale: 6, transformOrigin: `${ox}px ${oy}px`, duration: 1.7, ease: 'power2.in' }, .9)
        .to(glow, { opacity: 1, duration: 1, ease: 'power1.in' }, 1.5)
        .call(() => ctx.audio.sparkle(), null, 1.8);
    }
    stage.querySelector('#form').onsubmit = (e) => {
      e.preventDefault();
      const { result } = checkAnswer(input.value);
      if (result === 'open') {
        msg.textContent = '';
        input.disabled = true;
        walkIn();
        return;
      }
      msg.textContent = pick(result === 'funny' ? c.himanshu : c.wrong);
      ctx.audio.wrong();
      gsap.fromTo(door, { x: -12 }, { x: 0, duration: .6, ease: 'elastic.out(3,.25)' });
      ctx.fx.hearts(innerWidth / 2, innerHeight / 2, 4);
      input.select();
    };
  },
  unmount() { clearInterval(timer); },
};
