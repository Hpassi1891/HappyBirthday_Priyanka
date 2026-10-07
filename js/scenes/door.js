import { checkAnswer } from '../lib/door.js';
import { isUnlocked, timeLeft } from '../lib/countdown.js';

const pick = (arr) => arr[(Math.random() * arr.length) | 0];
let timer = null;

// Hand-drawn door: an arch frame, a pink panel that swings open, and a heart window.
const DOOR_SVG = `
<svg class="doodle door-svg" viewBox="0 0 150 190" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  <path d="M14 184 V62 Q14 12 75 12 Q136 12 136 62 V184 Z" fill="#fff3b0" stroke="#3c4a85" stroke-width="3.5"/>
  <g class="inside"><path d="M75 30 L75 14 M75 30 L58 20 M75 30 L92 20 M40 70 L24 66 M110 70 L126 66" stroke="#f0a81a" stroke-width="3"/></g>
  <g class="dpanel">
    <path d="M22 184 V64 Q22 22 75 22 Q128 22 128 64 V184 Z" fill="#ffd1df" stroke="#3c4a85" stroke-width="3.5"/>
    <path d="M34 178 V68 Q34 36 75 36 Q116 36 116 68 V178" stroke="#d6457f" stroke-width="2.5"/>
    <circle cx="75" cy="76" r="20" fill="#e9f6ff" stroke="#3c4a85" stroke-width="3"/>
    <path class="heart" d="M75 88 q-14 -9 -10 -18 q4 -7 10 0 q6 -7 10 0 q4 9 -10 18" fill="#e8416f" stroke="#3c4a85" stroke-width="2.5"/>
    <circle class="knob" cx="110" cy="124" r="6" fill="#ffe98a" stroke="#3c4a85" stroke-width="3"/>
    <path d="M44 150 q10 6 20 0 M86 150 q10 6 20 0" stroke="#d6457f" stroke-width="2.5"/>
  </g>
  <path d="M0 186 L150 186" stroke="#3c4a85" stroke-width="3.5"/>
</svg>`;

// Night look: a portal in the sky. Same class names as the diary door, so the open animation is shared.
const NIGHT_DOOR_SVG = `
<svg class="door-svg night-door" viewBox="0 0 150 190" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  <defs>
    <radialGradient id="portalG" cx="50%" cy="70%" r="75%"><stop offset="0" stop-color="#fff3d6"/><stop offset=".45" stop-color="#f2b5a7"/><stop offset="1" stop-color="#b9a6ff"/></radialGradient>
    <linearGradient id="panelG" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2d3278"/><stop offset="1" stop-color="#171a4a"/></linearGradient>
  </defs>
  <path d="M10 186 V62 Q10 8 75 8 Q140 8 140 62 V186 Z" fill="url(#portalG)" stroke="#f2b5a7" stroke-width="3.5"/>
  <g class="inside"><path d="M75 28 L75 12 M75 28 L58 18 M75 28 L92 18 M40 70 L24 66 M110 70 L126 66" stroke="#fff3d6" stroke-width="3"/></g>
  <g class="dpanel">
    <path d="M20 186 V64 Q20 20 75 20 Q130 20 130 64 V186 Z" fill="url(#panelG)" stroke="#f2b5a7" stroke-width="3.5"/>
    <path d="M32 180 V68 Q32 34 75 34 Q118 34 118 68 V180" stroke="#f2b5a766" stroke-width="2"/>
    <g class="heart"><path d="M84 62 A15 15 0 1 1 69 47 A12 12 0 0 0 84 62Z" fill="#fff3d6" stroke="#f2b5a7" stroke-width="2.5"/></g>
    <path d="M52 100 l2.5 6 l6 .5 l-4.6 4 l1.5 6 l-5.4 -3.3 l-5.4 3.3 l1.5 -6 l-4.6 -4 l6 -.5Z M96 124 l2 5 l5 .4 l-3.8 3.3 l1.2 5 l-4.4 -2.7 l-4.4 2.7 l1.2 -5 l-3.8 -3.3 l5 -.4Z M60 150 l1.6 4 l4 .3 l-3 2.6 l1 4 l-3.6 -2.2 l-3.6 2.2 l1 -4 l-3 -2.6 l4 -.3Z" fill="#f2b5a7" stroke="none" opacity=".85"/>
    <circle class="knob" cx="110" cy="124" r="6" fill="#ffe27a" stroke="#f2b5a7" stroke-width="2.5"/>
  </g>
  <path d="M0 186 L150 186" stroke="#f2b5a7" stroke-width="3"/>
</svg>`;

const SUN_SVG = `
<svg class="doodle sun" viewBox="0 0 80 80" fill="none" stroke-linecap="round" aria-hidden="true">
  <g class="rays" stroke="#f0a81a" stroke-width="3.5">
    <path d="M40 4 V16 M40 64 V76 M4 40 H16 M64 40 H76 M14 14 L22 22 M58 58 L66 66 M66 14 L58 22 M22 58 L14 66"/>
  </g>
  <circle cx="40" cy="40" r="15" fill="#ffe98a" stroke="#3c4a85" stroke-width="3"/>
  <path d="M33 38 q2 -3 4 0 M43 38 q2 -3 4 0 M34 46 q6 5 12 0" stroke="#3c4a85" stroke-width="2.5"/>
</svg>`;

const CLOUD_SVG = `
<svg class="doodle cloud" viewBox="0 0 110 50" fill="#fff" stroke="#3c4a85" stroke-width="3" stroke-linejoin="round" aria-hidden="true">
  <path d="M20 44 Q4 44 6 31 Q8 20 22 22 Q26 6 44 8 Q58 2 68 16 Q84 12 90 26 Q106 28 102 40 Q100 46 88 44 Z"/>
</svg>`;

export default {
  mount(stage, ctx) {
    const night = ctx.look === 'night';
    const c = night ? { ...ctx.copy.door, ...ctx.copy.door.night } : ctx.copy.door;
    const unlocked = isUnlocked(new Date(), { preview: ctx.preview });
    stage.innerHTML = `
      <section class="page door-scene">
        <div class="sky" aria-hidden="true">
          ${night ? '' : SUN_SVG + CLOUD_SVG + CLOUD_SVG.replace('class="doodle cloud"', 'class="doodle cloud c2"')}
          ${night ? ['8%:30%', '84%:24%', '20%:60%', '76%:56%', '50%:12%'].map((p, i) => `<i class="fly" style="left:${p.split(':')[0]};top:${p.split(':')[1]};animation-delay:${-i * 1.3}s"></i>`).join('') : ''}
          <b class="fl f1">✦</b><b class="fl f2">♡</b><b class="fl f3">✧</b><b class="fl f4">♡</b><b class="fl f5">✦</b>
        </div>
        <i class="tape" style="left:50%;top:-4px;--r:-3deg"></i>
        <h1 class="title door-title"><span class="write">${c.title}</span></h1>
        <p class="dateline">${c.dateLine}</p>
        <div class="door-wrap">
          <div class="door" id="door">
            ${night ? NIGHT_DOOR_SVG : DOOR_SVG}
            <div class="note" id="note"><i class="tape" style="left:50%;margin-left:-22px;top:-9px;width:44px;--r:3deg"></i>${c.note.map((l) => `<p>${l}</p>`).join('')}</div>
          </div>
          ${night ? '<span class="stk s1">✦</span><span class="stk s2">☾</span><span class="stk s3">✧</span><span class="stk s4">✦</span>' : '<span class="stk s1">⭐</span><span class="stk s2">💖</span><span class="stk s3">🌷</span><span class="stk s4">✨</span>'}
        </div>
        <div id="locked" class="${unlocked ? 'hidden' : ''}">
          <p class="hint">${c.lockedHint}</p>
          <div class="count" id="count"></div>
        </div>
        <form id="form" class="${unlocked ? '' : 'hidden'}" autocomplete="off">
          <p class="question">${c.question}</p>
          <svg class="uline" viewBox="0 0 220 10" preserveAspectRatio="none" aria-hidden="true"><path d="M2 6 Q30 0 58 6 T114 6 T170 6 T218 5" fill="none" stroke="#d6457f" stroke-width="3" stroke-linecap="round"/></svg>
          <input id="answer" class="answer" type="text" placeholder="${c.placeholder}" enterkeyhint="go" autocapitalize="off">
          <button class="btn" type="submit">${c.button}</button>
          <p id="msg" class="msg" aria-live="polite"></p>
        </form>
      </section>`;

    const door = stage.querySelector('#door');
    const msg = stage.querySelector('#msg');
    const note = stage.querySelector('#note');
    note.onclick = (e) => { e.stopPropagation(); ctx.audio.click(); gsap.fromTo(note, { rotation: -9 }, { rotation: -3, duration: .7, ease: 'elastic.out(2,.3)' }); };

    if (!unlocked) {
      const countEl = stage.querySelector('#count');
      let last = null;
      const tick = () => {
        const t = timeLeft();
        countEl.innerHTML = [['d', 'days'], ['h', 'hrs'], ['m', 'min'], ['s', 'sec']]
          .map(([k, l]) => `<div class="cd${k === 's' ? ' tk' : ''}"><i class="tape"></i><b>${t[k]}</b><small>${l}</small></div>`).join('');
        if (last !== null && last !== t.s) countEl.querySelector('.tk b').style.animation = 'tick .4s var(--bounce)';
        last = t.s;
        if (isUnlocked()) location.reload();
      };
      tick();
      timer = setInterval(tick, 1000);
      door.onclick = () => { gsap.fromTo(door, { x: -6 }, { x: 0, duration: .5, ease: 'elastic.out(2,.3)' }); ctx.audio.wrong(); };
      return;
    }

    const input = stage.querySelector('#answer');

    // Open the door, burst into hearts, then the page turns on its own.
    function walkIn() {
      const r = door.getBoundingClientRect();
      const ox = r.left + r.width / 2, oy = r.top + r.height * 0.55;
      ctx.audio.creak();
      door.classList.add('open');
      gsap.to(stage.querySelectorAll('#form, .door-title, .dateline'), { opacity: 0, duration: .6, delay: .4 });
      gsap.delayedCall(.6, () => { ctx.audio.cheer(); ctx.fx.burst(ox, oy, 110); ctx.fx.hearts(ox, oy, 10); });
      gsap.delayedCall(2, () => ctx.next());
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
      gsap.fromTo(msg, { opacity: 0, y: 8, rotation: -3 }, { opacity: 1, y: 0, rotation: -1, duration: .4, ease: 'back.out(2)' });
      ctx.audio.wrong();
      gsap.fromTo(door, { x: -12 }, { x: 0, duration: .6, ease: 'elastic.out(3,.25)' });
      ctx.fx.hearts(innerWidth / 2, innerHeight / 2, 4);
      input.select();
    };
  },
  unmount() { clearInterval(timer); },
};
