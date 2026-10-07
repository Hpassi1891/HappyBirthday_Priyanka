import { el, picture } from '../lib/dom.js';

// Fav wall: framed favourites grouped by category. Content lives in content/favs.json.
// An item may set `image` (path) to show a real picture; otherwise its emoji is shown.

function frame(item, i) {
  const btn = el('button', 'frame');
  btn.type = 'button';
  btn.setAttribute('aria-label', item.title);
  btn.style.animationDelay = `${(i % 5) * -.7}s`;
  btn.innerHTML = '<svg class="nail" viewBox="0 0 60 18" aria-hidden="true"><polyline points="4,18 30,3 56,18" fill="none" stroke="#6b2358" stroke-width="2.5" stroke-linejoin="round"/><circle cx="30" cy="3" r="3.5" fill="#f7c86a" stroke="#6b2358" stroke-width="2"/></svg>';
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

    const root = el('section', 'scene fav-scene');
    root.innerHTML = `
      <div class="fav-head">
        <h1 class="title fav-title"></h1>
        <p class="hand fav-sub"></p>
        <p class="fav-count" aria-live="polite"></p>
      </div>
      <div class="fav-wall" id="wall"></div>
      <button class="btn fav-go hidden" id="go" type="button">On to our memories ➜</button>`;
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
    gsap.from(root.querySelectorAll('.ribbon, .frame-box'), { opacity: 0, y: 26, duration: .7, stagger: .045, delay: .5, ease: 'power2.out', clearProps: 'opacity,transform' });

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

    // Frames clear away first so only the wallpaper carries over to the next scene.
    goBtn.onclick = () => {
      goBtn.disabled = true;
      gsap.to(root.querySelectorAll('.fav-head, .fav-wall, .fav-go'), { opacity: 0, y: -16, duration: .6, ease: 'power1.inOut', onComplete: () => ctx.next() });
    };
  },
};
