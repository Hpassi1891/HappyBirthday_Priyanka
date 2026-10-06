import { checkAnswer } from '../lib/door.js';
import { isUnlocked, timeLeft } from '../lib/countdown.js';

const pick = (arr) => arr[(Math.random() * arr.length) | 0];
let timer = null;

export default {
  mount(stage, ctx) {
    const c = ctx.copy.door;
    const unlocked = isUnlocked(new Date(), { preview: ctx.preview });
    stage.innerHTML = `
      <section class="scene door-scene">
        <h1 class="hand door-title">${c.title}</h1>
        <div class="door" id="door">
          <div class="door-panel"><span class="knob"></span><span class="door-heart">💖</span></div>
        </div>
        <div id="locked" class="${unlocked ? 'hidden' : ''}">
          <p class="hand hint">${c.lockedHint}</p>
          <div class="count" id="count"></div>
        </div>
        <form id="form" class="${unlocked ? '' : 'hidden'}" autocomplete="off">
          <p class="question">${c.question}</p>
          <input id="answer" class="answer" type="text" placeholder="${c.placeholder}" enterkeyhint="go" autocapitalize="off">
          <button class="btn" type="submit">${c.button}</button>
          <p id="msg" class="msg" aria-live="polite"></p>
        </form>
      </section>`;

    const door = stage.querySelector('#door');
    const msg = stage.querySelector('#msg');

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
    stage.querySelector('#form').onsubmit = (e) => {
      e.preventDefault();
      const { result } = checkAnswer(input.value);
      if (result === 'open') {
        msg.textContent = '';
        ctx.audio.creak();
        door.classList.add('open');
        setTimeout(() => { ctx.audio.cheer(); ctx.fx.burst(innerWidth / 2, innerHeight / 2, 140); }, 500);
        setTimeout(() => ctx.next(), 1700);
        input.disabled = true;
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
