import { el, picture } from '../lib/dom.js';

// Photo wall: polaroids pegged on clotheslines. Tap one to flip it and read the note on the back.
// Content lives in content/photos.json; a photo may set `image` to show a real picture.

function polaroid(photo, i) {
  const wrap = el('div', 'hang');
  wrap.style.setProperty('--tilt', `${i % 2 ? 2.5 : -2.5}deg`);
  wrap.appendChild(el('span', 'peg'));

  const btn = el('button', 'polaroid');
  btn.type = 'button';
  btn.setAttribute('aria-pressed', 'false');
  btn.setAttribute('aria-label', `${photo.caption}. Tap to flip and read the note`);
  btn.style.animationDelay = `${i * -.9}s`;

  const card = el('div', 'card3d');
  const front = el('div', 'face front');
  front.append(picture(photo), el('span', 'cap hand', photo.caption));
  const back = el('div', 'face back');
  back.append(el('p', 'note-text hand', photo.note), el('span', 'back-heart', '💖'));
  card.append(front, back);
  btn.appendChild(card);
  wrap.appendChild(btn);
  return { wrap, btn };
}

export default {
  mount(stage, ctx) {
    const data = ctx.photos;
    const total = data.photos.length;
    const read = new Set();

    const root = el('section', 'scene photo-scene');
    root.innerHTML = `
      <div class="fav-head">
        <h1 class="title fav-title"></h1>
        <p class="hand fav-sub"></p>
        <p class="fav-count" aria-live="polite"></p>
      </div>
      <div class="photo-wall" id="pwall"></div>
      <button class="btn fav-go hidden" id="go" type="button">Time for gifts! 🎁</button>`;
    root.querySelector('.fav-title').textContent = data.title;
    root.querySelector('.fav-sub').textContent = data.subtitle;
    const countEl = root.querySelector('.fav-count');
    const goBtn = root.querySelector('#go');
    const wall = root.querySelector('#pwall');
    const updateCount = () => { countEl.textContent = `💌 ${read.size} / ${total} notes read`; };
    updateCount();

    const perLine = innerWidth >= 700 ? 3 : 2;
    const handles = data.photos.map((p, i) => polaroid(p, i));
    for (let i = 0; i < handles.length; i += perLine) {
      const line = el('div', 'line');
      handles.slice(i, i + perLine).forEach(({ wrap }) => line.appendChild(wrap));
      wall.appendChild(line);
    }

    handles.forEach(({ btn }, i) => {
      btn.onclick = () => {
        const flipped = btn.classList.toggle('flipped');
        btn.setAttribute('aria-pressed', flipped);
        ctx.audio.sparkle();
        if (!flipped) return;
        const r = btn.getBoundingClientRect();
        ctx.fx.hearts(r.left + r.width / 2, r.top + r.height / 2, 5);
        read.add(i);
        updateCount();
        if (read.size >= Math.min(data.unlockAfter ?? total, total) && goBtn.classList.contains('hidden')) {
          goBtn.classList.remove('hidden');
          gsap.from(goBtn, { scale: 0, duration: .6, ease: 'back.out(2)' });
          ctx.audio.cheer();
        }
      };
    });

    stage.appendChild(root);
    goBtn.onclick = () => ctx.next();
  },
};
