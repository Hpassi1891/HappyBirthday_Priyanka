import { el } from '../lib/dom.js';

// Gift table: four wrapped presents on a gingham cloth. Each opens to a poem, coupon, joke or voice note.
// Content lives in content/gifts.json.

const INK = '#3c4a85';

function boxSVG(color, ribbon) {
  return `
<svg class="doodle box" viewBox="0 0 120 130" fill="none" stroke-linejoin="round" stroke-linecap="round" aria-hidden="true">
  <g class="base">
    <rect x="16" y="58" width="88" height="62" rx="4" fill="${color}" stroke="${INK}" stroke-width="3"/>
    <rect x="52" y="58" width="16" height="62" fill="${ribbon}" stroke="${INK}" stroke-width="2.5"/>
    <path d="M26 72 l4 4 M84 96 l4 -4 M30 104 l4 4 M88 76 l4 4" stroke="#fff" stroke-opacity=".8" stroke-width="3"/>
  </g>
  <g class="lid">
    <rect x="10" y="38" width="100" height="22" rx="4" fill="${color}" stroke="${INK}" stroke-width="3"/>
    <rect x="52" y="38" width="16" height="22" fill="${ribbon}" stroke="${INK}" stroke-width="2.5"/>
    <g class="bow">
      <path d="M60 38 C38 8 14 22 34 36 C42 41 52 39 60 38Z" fill="${ribbon}" stroke="${INK}" stroke-width="3"/>
      <path d="M60 38 C82 8 106 22 86 36 C78 41 68 39 60 38Z" fill="${ribbon}" stroke="${INK}" stroke-width="3"/>
      <circle cx="60" cy="38" r="6.5" fill="${ribbon}" stroke="${INK}" stroke-width="3"/>
    </g>
  </g>
</svg>`;
}

function buildCard(g, ctx) {
  const card = el('div', 'gift-card');
  card.appendChild(el('i', 'tape'));
  const title = el('h3', 'gift-title hand', g.title);
  card.appendChild(title);
  const body = el('div', 'gift-body');
  card.appendChild(body);
  const onShow = [];

  if (g.kind === 'poem') {
    body.classList.add('poem');
    g.lines.forEach((l) => body.appendChild(el('p', 'pl', l)));
    onShow.push(() => gsap.from(body.querySelectorAll('.pl'), { opacity: 0, x: -14, duration: .5, stagger: .45, delay: .4, ease: 'power2.out' }));
  } else if (g.kind === 'coupon') {
    body.classList.add('coupon');
    body.append(el('small', '', 'COUPON'), el('p', 'ch hand', g.headline), el('p', 'cf', g.fine));
    const stamp = el('span', 'stamp hand');
    stamp.innerHTML = 'VALID<br>FOREVER';
    body.appendChild(stamp);
    onShow.push(() => gsap.from(stamp, { scale: 3.2, rotation: -40, opacity: 0, duration: .45, delay: .9, ease: 'power3.in', onComplete: () => { ctx.audio.pop(); ctx.fx.burst(innerWidth / 2, innerHeight / 2, 40); } }));
  } else if (g.kind === 'joke') {
    body.classList.add('joke');
    const setup = el('p', 'setup hand', g.setup);
    const punch = el('p', 'punch hand hidden', g.punchline);
    const reveal = el('button', 'btn reveal', 'tell me!');
    reveal.type = 'button';
    reveal.onclick = () => {
      reveal.classList.add('hidden');
      punch.classList.remove('hidden');
      gsap.from(punch, { scale: .3, rotation: -8, opacity: 0, duration: .6, ease: 'back.out(2)' });
      ctx.audio.badum();
      gsap.delayedCall(.35, () => ctx.fx.burst(innerWidth / 2, innerHeight / 2, 70));
    };
    body.append(setup, reveal, punch);
  } else if (g.kind === 'voice') {
    body.classList.add('voice');
    const play = el('button', 'play', '▶');
    play.type = 'button';
    play.setAttribute('aria-label', 'Play voice note');
    const wave = el('div', 'wave');
    wave.innerHTML = Array.from({ length: 16 }, (_, i) => `<i style="--i:${i}"></i>`).join('');
    const note = el('p', 'vnote hand', g.note || '');
    body.append(play, wave, note);
    if (g.audio) {
      const a = new Audio(g.audio);
      a.onended = () => { play.textContent = '▶'; body.classList.remove('playing'); };
      a.onerror = () => { body.classList.add('missing'); };
      play.onclick = () => {
        if (a.paused) { a.play().catch(() => body.classList.add('missing')); play.textContent = '❚❚'; body.classList.add('playing'); }
        else { a.pause(); play.textContent = '▶'; body.classList.remove('playing'); }
      };
      card.stop = () => a.pause();
    } else {
      body.classList.add('missing');
      play.disabled = true;
    }
  }
  card.onShow = () => onShow.forEach((f) => f());
  return card;
}

export default {
  mount(stage, ctx) {
    const data = ctx.gifts;
    const total = data.gifts.length;
    const opened = new Set();

    const root = el('section', 'page gift-scene');
    root.innerHTML = `<div class="scroller">
      <div class="fav-head">
        <h1 class="title fav-title"></h1>
        <p class="hand fav-sub"></p>
        <p class="fav-count" aria-live="polite"></p>
      </div>
      <div class="cloth"><i class="tape" style="left:14px;top:-9px;--r:-6deg"></i><i class="tape" style="right:14px;top:-9px;--r:5deg"></i><div class="gifts" id="gifts"></div></div>
      <button class="btn fav-go hidden" id="go" type="button">time to make a wish ➜</button></div>`;
    root.querySelector('.fav-title').textContent = data.title;
    root.querySelector('.fav-sub').textContent = data.subtitle;
    const countEl = root.querySelector('.fav-count');
    const goBtn = root.querySelector('#go');
    const updateCount = () => { countEl.textContent = `🎁 ${opened.size} / ${total} opened`; };
    updateCount();

    const grid = root.querySelector('#gifts');
    data.gifts.forEach((g, i) => {
      const b = el('button', 'gift');
      b.type = 'button';
      b.setAttribute('aria-label', `${g.title}. Tap to unwrap`);
      b.style.setProperty('--i', i);
      b.innerHTML = `<span class="rays"></span><span class="peek"></span>${boxSVG(g.color, g.ribbon)}<span class="gtag hand"></span><i class="done">✓</i>`;
      b.querySelector('.peek').textContent = g.emoji || '🎁';
      b.querySelector('.gtag').textContent = g.title;
      b.onclick = () => unwrap(b, g);
      grid.appendChild(b);
    });
    stage.appendChild(root);
    gsap.from(root.querySelectorAll('.gift'), { y: -60, opacity: 0, rotation: () => gsap.utils.random(-12, 12), duration: .8, stagger: .14, delay: .5, ease: 'bounce.out', clearProps: 'opacity,transform' });

    let busy = false;
    function unwrap(b, g) {
      if (busy) return;
      busy = true;
      const r = b.getBoundingClientRect();
      const cx = r.left + r.width / 2, cy = r.top + r.height * 0.5;
      ctx.audio.pop();
      const peek = b.querySelector('.peek'), rays = b.querySelector('.rays');
      const first = !b.classList.contains('open');
      b.classList.add('open');
      const tl = gsap.timeline({ onComplete: () => { busy = false; showCard(b, g); } });
      tl.fromTo(b, { rotation: -4 }, { rotation: 4, duration: .06, repeat: 5, yoyo: true, ease: 'sine.inOut' })
        .to(b, { rotation: 0, duration: .1 })
        .call(() => { ctx.audio.sparkle(); ctx.fx.burst(cx, cy - 20, first ? 70 : 24); ctx.fx.hearts(cx, cy - 20, 6); })
        .fromTo(rays, { scale: .2, opacity: .9 }, { scale: 2.6, opacity: 0, duration: .9, ease: 'power2.out' }, '<')
        .fromTo(peek, { y: 30, scale: .2, opacity: 0 }, { y: -64, scale: 1.4, opacity: 1, duration: .55, ease: 'back.out(2)' }, '<.1')
        .to(peek, { y: -90, scale: 2.2, opacity: 0, duration: .35, ease: 'power1.in' }, '+=.15');
    }

    function showCard(b, g) {
      const overlay = el('div', 'zoom');
      overlay.setAttribute('role', 'dialog');
      overlay.setAttribute('aria-label', g.title);
      const wrap = el('div', 'zoom-card');
      const card = buildCard(g, ctx);
      const close = el('button', 'btn', 'keep it 💖');
      close.type = 'button';
      wrap.append(card, close);
      overlay.appendChild(wrap);
      stage.appendChild(overlay);
      gsap.from(overlay, { opacity: 0, duration: .25 });
      gsap.from(card, { y: 120, scale: .5, rotation: -8, duration: .7, ease: 'back.out(1.6)', onComplete: () => card.onShow() });
      close.focus();

      const done = () => {
        card.stop?.();
        gsap.to(overlay, { opacity: 0, duration: .2, onComplete: () => overlay.remove() });
        b.classList.add('seen');
        opened.add(g.title);
        updateCount();
        if (opened.size >= Math.min(data.unlockAfter ?? total, total) && goBtn.classList.contains('hidden')) {
          goBtn.classList.remove('hidden');
          gsap.from(goBtn, { scale: 0, duration: .6, ease: 'back.out(2)' });
          ctx.audio.cheer();
        }
      };
      close.onclick = done;
      overlay.onclick = (e) => { if (e.target === overlay) done(); };
    }

    goBtn.onclick = () => { goBtn.disabled = true; ctx.next(); };
  },
};
