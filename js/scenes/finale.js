import { FRAMES, SHOTS, TOTAL, renderFrame } from '../lib/story.js';

// Finale: a doodle flip book appears, she taps it open and the pages flip fast enough that the
// drawings move. Rakshas delivers the letter, then a real envelope opens and the letter writes itself.
let cleanup = [];

const COVER = `
<div class="cv-inner">
  <i class="tape" style="left:50%;top:-8px;margin-left:-30px;--r:-3deg"></i>
  <p class="cv-kicker">a flip book</p>
  <h2 class="cv-title">Priyanka's<br>Birthday Story</h2>
  <svg class="doodle cv-art" viewBox="0 0 120 100" fill="none" stroke-linejoin="round" stroke-linecap="round" aria-hidden="true">
    <path d="M30 40 L22 14 L44 30Z M90 40 L98 14 L76 30Z" fill="#ff6b8b" stroke="#3c4a85" stroke-width="3.5"/>
    <circle cx="60" cy="58" r="32" fill="#ffd9b8" stroke="#3c4a85" stroke-width="3.5"/>
    <path d="M30 50 Q40 26 60 30 Q80 26 90 50 Q74 38 60 40 Q46 38 30 50Z" fill="#3a2a3a" stroke="#3c4a85" stroke-width="3"/>
    <circle cx="48" cy="58" r="3.4" fill="#3c4a85"/><circle cx="72" cy="58" r="3.4" fill="#3c4a85"/>
    <path d="M42 72 Q60 92 78 72Z" fill="#7a2d5a" stroke="#3c4a85" stroke-width="3"/>
    <ellipse cx="38" cy="68" rx="6" ry="3.6" fill="#ff8fb8" opacity=".7"/><ellipse cx="82" cy="68" rx="6" ry="3.6" fill="#ff8fb8" opacity=".7"/>
  </svg>
  <p class="cv-by">by Rakshas</p>
  <span class="cv-tap">tap to open ✋</span>
</div>`;

export default {
  mount(stage, ctx) {
    const letter = ctx.letter;
    const SPEED = ctx.params.has('fast') ? 8 : 1;   // ?fast=1 plays the story quickly (used by tests)
    stage.innerHTML = `
      <section class="page finale-scene">
        <div class="fs-book" id="bookArea">
          <div class="fb-wrap" id="wrap">
            <div class="fb-book" id="book">
              <div class="fb-redge"></div><div class="fb-lstack"></div>
              <div class="fb-pages" id="pages"></div>
              <button class="fb-cover" id="cover" type="button" aria-label="Open the flip book">${COVER}</button>
            </div>
          </div>
          <p class="fb-cap hand" id="cap">tap the book to open it</p>
          <button class="btn" id="openLetter" type="button" hidden>open the letter 💌</button>
        </div>
        <div class="fs-env" id="envArea" hidden>
          <p class="env-hint hand" id="envHint">a letter just for you… tap to open</p>
          <button class="env" id="env" type="button" aria-label="Open the envelope">
            <i class="env-back"></i><i class="env-paper"></i><i class="env-front"></i><i class="env-flap"></i>
            <span class="env-seal">♥</span><span class="env-to hand">To: Chudail</span>
          </button>
        </div>
        <div class="fs-letter" id="letterArea" hidden>
          <div class="lcard" id="lcard"><i class="tape" style="left:50%;top:-9px;margin-left:-30px;--r:2deg"></i><div class="lbody" id="lbody"></div></div>
          <div class="fs-actions" id="actions" hidden>
            <button class="btn" id="save" type="button">save this card 💾</button>
            <button class="btn alt" id="replay" type="button">watch the story again ↺</button>
          </div>
        </div>
      </section>`;

    const $ = (s) => stage.querySelector(s);
    const book = $('#book'), pagesEl = $('#pages'), cover = $('#cover'), cap = $('#cap');
    const lstack = $('.fb-lstack'), redge = $('.fb-redge');
    let alive = true;
    cleanup.push(() => { alive = false; });
    const wait = (ms) => new Promise((r) => { const t = setTimeout(r, ms); cleanup.push(() => clearTimeout(t)); });
    const later = (s, fn) => { const t = gsap.delayedCall(s, fn); cleanup.push(() => t.kill()); return t; };
    const setCap = (t) => { cap.textContent = t; gsap.fromTo(cap, { scale: .8, opacity: 0, y: 8 }, { scale: 1, opacity: 1, y: 0, duration: .35, ease: 'back.out(2)' }); };

    // ---- the pages: made a few frames ahead and thrown away once flipped, so the DOM stays small
    const pages = new Map();
    const ensure = (i) => {
      if (i >= TOTAL || pages.has(i)) return pages.get(i);
      const el = document.createElement('div');
      el.className = 'fpage';
      el.style.zIndex = String(2000 - i);
      el.innerHTML = renderFrame(i);
      pagesEl.appendChild(el);
      pages.set(i, el);
      return el;
    };
    for (let i = 0; i < 5; i++) ensure(i);

    // ---- the book arrives on the desk
    gsap.from($('#wrap'), { y: 420, rotation: -14, scale: .5, opacity: 0, duration: 1.2, delay: .4, ease: 'back.out(1.5)', clearProps: 'opacity' });
    ctx.audio.flip();

    // ---- open the cover, then flip
    let started = false;
    cover.onclick = () => {
      if (started) return;
      started = true;
      ctx.audio.flip();
      gsap.killTweensOf(cover);
      gsap.to(cover, { rotationY: -110, transformPerspective: 2200, transformOrigin: '0% 50%', duration: 1, ease: 'power2.inOut', onComplete: () => { cover.style.display = 'none'; } });
      gsap.to(lstack, { width: 6, duration: 1 });
      setCap('ready…');
      later(1.3 / Math.min(SPEED, 3), () => play());
    };

    function play() {
      const step = (i) => {
        if (!alive) return;
        const f = FRAMES[i], shot = SHOTS[f.shot];
        for (let a = 1; a <= 4; a++) ensure(i + a);
        if (f.k === 0) setCap(shot.caption);
        const fx = shot.sfx[f.k];
        if (fx) ctx.audio.sfx(fx);
        ctx.audio.sfx('thwip');
        const d = 1 / (shot.fps * SPEED);
        const prog = i / (TOTAL - 1);
        gsap.set(lstack, { width: 6 + prog * 16 });
        gsap.set(redge, { width: 18 - prog * 14 });
        if (f.last) { later(1.3 / Math.min(SPEED, 3), finish); return; }
        const el = pages.get(i);
        gsap.to(el, { rotationY: -104, transformPerspective: 2800, transformOrigin: '0% 50%', duration: d * 1.5, ease: 'power1.in', onComplete: () => { el.remove(); pages.delete(i); } });
        later(d, () => step(i + 1));
      };
      step(0);
    }

    function finish() {
      ctx.audio.cheer();
      ctx.fx.burst(innerWidth / 2, innerHeight * 0.35, 100);
      setCap('and the letter is for you… 💌');
      const b = $('#openLetter');
      b.hidden = false;
      gsap.from(b, { scale: 0, duration: .6, ease: 'back.out(2)' });
    }

    // ---- the envelope
    $('#openLetter').onclick = () => {
      $('#openLetter').disabled = true;
      ctx.audio.flip();
      gsap.to($('#bookArea'), { y: 520, rotation: 8, opacity: 0, duration: .9, ease: 'power2.in', onComplete: () => { $('#bookArea').hidden = true; } });
      const area = $('#envArea');
      area.hidden = false;
      gsap.from(area, { y: -300, opacity: 0, rotation: -8, duration: 1.1, delay: .5, ease: 'bounce.out' });
    };
    $('#env').onclick = async () => {
      const env = $('#env');
      if (env.dataset.open) return;
      env.dataset.open = '1';
      env.classList.add('open');
      ctx.audio.sparkle();
      ctx.fx.hearts(innerWidth / 2, innerHeight * 0.45, 10);
      gsap.to($('#envHint'), { opacity: 0, duration: .3 });
      await wait(900 / Math.min(SPEED, 3));
      env.classList.add('rise');
      await wait(900 / Math.min(SPEED, 3));
      showLetter();
    };

    // ---- the letter writes itself
    async function showLetter() {
      gsap.to($('#envArea'), { opacity: 0, y: 40, duration: .5, onComplete: () => { $('#envArea').hidden = true; } });
      const area = $('#letterArea');
      area.hidden = false;
      gsap.from(area, { scale: .4, y: 120, rotation: -6, opacity: 0, duration: .8, delay: .3, ease: 'back.out(1.5)' });
      ctx.audio.sparkle();
      const body = $('#lbody');
      body.innerHTML = '';
      const addP = (cls, text = '') => { const p = document.createElement('p'); if (cls) p.className = cls; p.textContent = text; body.appendChild(p); return p; };
      let skip = SPEED > 1;
      $('#lcard').onclick = () => { skip = true; };
      const typeInto = async (p, text) => {
        if (skip) { p.textContent = text; return; }
        for (const ch of text) {
          if (!alive) return;
          p.textContent += ch;
          if (skip) { p.textContent = text; return; }
          $('#lcard').scrollTop = $('#lcard').scrollHeight;
          await wait(/[.,!?]/.test(ch) ? 160 : 34);
        }
      };
      await wait(1100 / Math.min(SPEED, 3));
      await typeInto(addP('lto hand'), letter.to);
      for (const line of letter.lines) {
        if (!alive) return;
        const p = addP('lline');
        if (line === '') { p.innerHTML = '&nbsp;'; p.classList.add('gap'); continue; }
        await typeInto(p, line);
        $('#lcard').scrollTop = $('#lcard').scrollHeight;
      }
      await typeInto(addP('lfrom hand'), letter.from);
      $('#lcard').scrollTop = $('#lcard').scrollHeight;
      if (!alive) return;
      celebrate();
      later(2.2, () => $('#lcard').scrollTo({ top: 0, behavior: 'smooth' }));
    }

    function celebrate() {
      ctx.audio.cheer();
      ctx.fx.rain(2600);
      const fw = setInterval(() => ctx.fx.firework(), 1000);
      cleanup.push(() => clearInterval(fw));
      for (let i = 0; i < 4; i++) later(i * 0.35, () => ctx.fx.firework());
      const act = $('#actions');
      act.hidden = false;
      gsap.from(act.children, { y: 30, opacity: 0, stagger: .15, duration: .6, ease: 'back.out(2)' });
    }

    $('#replay').onclick = () => { ctx.go('finale'); };
    $('#save').onclick = () => saveCard(letter);
  },
  unmount() { cleanup.forEach((f) => f()); cleanup = []; },
};

// ---- keepsake: draw the letter onto a canvas and download it as a picture
async function saveCard(letter) {
  try { await document.fonts.load('700 54px Caveat'); } catch { /* fall back to the default cursive */ }
  const W = 1080, H = 1500;
  const c = document.createElement('canvas');
  c.width = W; c.height = H;
  const g = c.getContext('2d');
  g.fillStyle = '#fffaf2'; g.fillRect(0, 0, W, H);
  g.strokeStyle = '#9fc3e688'; g.lineWidth = 2;
  for (let y = 200; y < H - 60; y += 56) { g.beginPath(); g.moveTo(60, y); g.lineTo(W - 60, y); g.stroke(); }
  g.strokeStyle = '#f4a3b8'; g.lineWidth = 3; g.beginPath(); g.moveTo(130, 0); g.lineTo(130, H); g.stroke();
  g.setLineDash([18, 14]); g.strokeStyle = '#f7a1bf'; g.lineWidth = 8; g.strokeRect(24, 24, W - 48, H - 48); g.setLineDash([]);
  g.fillStyle = '#d6457f'; g.font = '700 84px Caveat, "Comic Sans MS", cursive'; g.textAlign = 'center';
  g.fillText("Priyanka's Birthday Letter", W / 2, 130);
  g.textAlign = 'left'; g.fillStyle = '#3c4a85'; g.font = '700 54px Caveat, "Comic Sans MS", cursive';
  const wrap = (text, x, y, maxW) => {
    if (!text) return y + 56;
    let line = '';
    for (const word of text.split(' ')) {
      const test = line ? line + ' ' + word : word;
      if (g.measureText(test).width > maxW && line) { g.fillText(line, x, y); y += 56; line = word; } else line = test;
    }
    g.fillText(line, x, y);
    return y + 56;
  };
  let y = 250;
  g.fillStyle = '#d6457f'; y = wrap(letter.to, 160, y, W - 260); g.fillStyle = '#3c4a85';
  for (const l of letter.lines) y = wrap(l, 160, y, W - 260);
  g.fillStyle = '#d6457f'; wrap(letter.from, 160, y + 10, W - 260);
  c.toBlob((blob) => {
    if (!blob) return;
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'priyanka-birthday-letter.png';
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  });
}
