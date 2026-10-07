import { el, picture } from '../lib/dom.js';

// Fav wall: framed favourites grouped by category. Content lives in content/favs.json.
// An item may set `image` (path) to show a real picture; otherwise its emoji is shown.

function frame(item, i) {
  const btn = el('button', 'frame');
  btn.type = 'button';
  btn.setAttribute('aria-label', item.title);
  btn.style.animationDelay = `${(i % 5) * -.7}s`;
  btn.innerHTML = '<i class="tape"></i>';
  const box = el('div', 'frame-box');
  box.appendChild(picture(item));
  btn.appendChild(box);
  btn.appendChild(el('span', 'plaque', item.title));
  return btn;
}

export default {
  mount(stage, ctx) {
    const data = ctx.favs;
    const total = data.categories.reduce((n, c) => n + c.items.length, 0);
    const opened = new Set();

    const root = el('section', 'page fav-scene');
    root.innerHTML = `<div class="scroller">
      <div class="fav-head">
        <h1 class="title fav-title"></h1>
        <p class="hand fav-sub"></p>
        <p class="fav-count" aria-live="polite"></p>
      </div>
      <div class="fav-wall" id="wall"></div>
      <button class="btn fav-go hidden" id="go" type="button">on to our memories ➜</button></div>`;
    root.querySelector('.fav-title').textContent = data.title;
    root.querySelector('.fav-sub').textContent = data.subtitle;
    const countEl = root.querySelector('.fav-count');
    const goBtn = root.querySelector('#go');
    const wall = root.querySelector('#wall');
    const updateCount = () => { countEl.textContent = `✨ ${opened.size} / ${total} opened`; };
    updateCount();

    let n = 0;
    for (const cat of data.categories) {
      const sec = el('div', 'fav-cat');
      const ribbon = el('h2', 'ribbon', `${cat.emoji} ${cat.label}`);
      ribbon.style.setProperty('--d', `${.5 + n * .08}s`);
      const grid = el('div', 'fav-grid');
      for (const item of cat.items) {
        const f = frame(item, n++);
        f.onclick = () => openZoom(item, f);
        grid.appendChild(f);
      }
      sec.append(ribbon, grid);
      wall.appendChild(sec);
    }
    stage.appendChild(root);
    // Frames settle in gently once the scene has faded up.
    gsap.from(root.querySelectorAll('.frame-box'), { opacity: 0, y: 30, rotation: -6, duration: .7, stagger: .05, delay: .5, ease: 'back.out(1.6)', clearProps: 'opacity,transform' });

    function openZoom(item, from) {
      ctx.audio.sparkle();
      gsap.fromTo(from, { rotation: -8 }, { rotation: 0, duration: .8, ease: 'elastic.out(2,.3)' });
      const r = from.getBoundingClientRect();
      ctx.fx.hearts(r.left + r.width / 2, r.top + r.height / 2, 6);

      const overlay = el('div', 'zoom');
      overlay.setAttribute('role', 'dialog');
      overlay.setAttribute('aria-label', item.title);
      const card = el('div', 'zoom-card');
      const box = el('div', 'frame-box big');
      box.appendChild(picture(item));
      const close = el('button', 'btn', 'Aww, nice! 💖');
      close.type = 'button';
      card.append(box, el('h3', 'zoom-title', item.title), el('p', 'hand zoom-cap', item.caption || ''), close);
      overlay.appendChild(card);
      stage.appendChild(overlay);
      gsap.from(overlay, { opacity: 0, duration: .2 });
      gsap.from(card, { scale: .3, rotation: -10, duration: .6, ease: 'back.out(1.8)' });
      close.focus();

      const done = () => {
        gsap.to(overlay, { opacity: 0, duration: .15, onComplete: () => overlay.remove() });
        opened.add(item.title);
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

    // The page turn carries her on to the next page.
    goBtn.onclick = () => { goBtn.disabled = true; ctx.next(); };
  },
};
