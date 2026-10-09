// The last scene: a tree grows on a white screen and its crown is a heart made of tiny hearts,
// then the closing wish fades in underneath. Text lives in content/copy.json under "ending".
// If copy.ending.audio points at a file (e.g. a voice note), the play button plays it; otherwise it plays the birthday tune.

let cleanup = [];

const PINKS = ['#e0245e', '#ff5c8a', '#ff8fa8', '#d11a3a', '#f6845a', '#ffb3c1', '#e8416f'];
const easeOutBack = (p) => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(p - 1, 3) + c1 * Math.pow(p - 1, 2); };
const easeInOut = (p) => (p < .5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2);

// a little heart centred on 0,0, about `s` wide
function heartPath(g, s) {
  g.beginPath();
  g.moveTo(0, s * 0.42);
  g.bezierCurveTo(s * 0.62, -s * 0.02, s * 0.5, -s * 0.5, s * 0.25, -s * 0.5);
  g.bezierCurveTo(s * 0.12, -s * 0.5, 0, -s * 0.4, 0, -s * 0.28);
  g.bezierCurveTo(0, -s * 0.4, -s * 0.12, -s * 0.5, -s * 0.25, -s * 0.5);
  g.bezierCurveTo(-s * 0.5, -s * 0.5, -s * 0.62, -s * 0.02, 0, s * 0.42);
  g.closePath();
}

// inside the classic heart curve (x, y in roughly -1.3..1.3)
const inHeart = (x, y) => Math.pow(x * x + y * y - 1, 3) - x * x * y * y * y <= 0;

function quad(p0, p1, p2, t) { const u = 1 - t; return [u * u * p0[0] + 2 * u * t * p1[0] + t * t * p2[0], u * u * p0[1] + 2 * u * t * p1[1] + t * t * p2[1]]; }

function growTree(canvas, onProgress) {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const w = canvas.clientWidth, h = canvas.clientHeight;
  canvas.width = w * dpr; canvas.height = h * dpr;
  const g = canvas.getContext('2d');
  g.scale(dpr, dpr);

  // On a wide screen the words sit on the left and the tree stands on the right.
  const wide = w > h * 1.15;
  const R = wide ? Math.min(h * 0.27, w * 0.26) : Math.min((w * 0.8) / 2.3, h * 0.165);
  const cx = wide ? w * 0.7 : w / 2;
  const cy = wide ? h * 0.1 + R * 1.3 : Math.max(h * 0.3, 205) + R * 1.25; // centre of the crown (x=0,y=0 in heart space)
  const tip = [cx, cy + R * 1.02];          // bottom point of the heart
  const base = [cx, tip[1] + R * 0.6];      // where the trunk meets the ground

  if (!wide) { const foot = canvas.parentElement.querySelector('.end-foot'); foot.style.bottom = 'auto'; foot.style.top = Math.min(base[1] + 12, h - 150) + 'px'; }

  // branches: [start, control, end, width]
  const trunkTop = [cx, tip[1] - R * 0.35];
  const P = (hx, hy) => [cx + hx * R, cy - hy * R];
  const branches = [
    [base, [cx - 6, (base[1] + trunkTop[1]) / 2], trunkTop, 7, 0, 0.32],
    [trunkTop, [cx - R * 0.15, trunkTop[1] - R * 0.35], P(-0.55, 0.15), 4.5, 0.28, 0.5],
    [trunkTop, [cx + R * 0.15, trunkTop[1] - R * 0.35], P(0.55, 0.15), 4.5, 0.28, 0.5],
    [P(-0.12, -0.2), [cx - R * 0.5, cy - R * 0.1], P(-0.78, 0.62), 3, 0.42, 0.62],
    [P(0.12, -0.2), [cx + R * 0.5, cy - R * 0.1], P(0.78, 0.62), 3, 0.42, 0.62],
    [P(0, -0.1), [cx, cy - R * 0.3], P(0, 0.42), 3, 0.42, 0.6],
    [P(-0.4, 0.1), [cx - R * 0.5, cy - R * 0.5], P(-0.5, 0.95), 2.4, 0.52, 0.68],
    [P(0.4, 0.1), [cx + R * 0.5, cy - R * 0.5], P(0.5, 0.95), 2.4, 0.52, 0.68],
  ];

  // blossoms, born from the bottom of the heart upward
  let seed = 5;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const hearts = [];
  const want = Math.round(Math.min(460, (R * R) / 38));
  for (let tries = 0; hearts.length < want && tries < 20000; tries++) {
    const x = (rnd() * 2.6 - 1.3), y = (rnd() * 2.5 - 1.2);
    if (!inHeart(x, y)) continue;
    const edge = !inHeart(x * 1.12, y * 1.12 + 0.02);
    const sz = (9 + rnd() * 12) * Math.max(0.8, R / 140) * (edge ? 1.05 : 1);
    hearts.push({ x: cx + x * R, y: cy - y * R, s: sz, rot: (rnd() - .5) * 0.9, col: PINKS[(rnd() * PINKS.length) | 0], birth: 1.5 + ((1.2 - y) / 2.4) * 2.6 + rnd() * 0.7, sway: rnd() * 6.28 });
  }
  hearts.sort((a, b) => a.birth - b.birth);
  const total = hearts.length ? hearts[hearts.length - 1].birth + 0.9 : 3;

  // ground
  const ground = (p) => {
    g.save(); g.globalAlpha = p;
    const gr = g.createRadialGradient(cx, base[1] + 4, 4, cx, base[1] + 4, R * 1.2);
    gr.addColorStop(0, '#f6d6c4'); gr.addColorStop(1, '#f6d6c400');
    g.fillStyle = gr; g.beginPath(); g.ellipse(cx, base[1] + 4, R * 1.2, R * 0.16, 0, 0, 7); g.fill();
    g.restore();
  };

  const falling = Array.from({ length: 16 }, (_, i) => ({ x: cx + (rnd() - .5) * R * 2.2, y: cy - R + rnd() * R * 2, s: 8 + rnd() * 9, v: 16 + rnd() * 22, ph: rnd() * 6.28, col: PINKS[i % PINKS.length], a: 0 }));

  let baked = null;
  const t0 = performance.now();
  let raf = 0, alive = true, last = t0, announced = false;
  cleanup.push(() => { alive = false; cancelAnimationFrame(raf); });
  const frame = (now) => {
    if (!alive) return;
    const t = (now - t0) / 1000;
    const dt = Math.min(.05, (now - last) / 1000); last = now;
    g.clearRect(0, 0, w, h);
    if (baked) g.drawImage(baked, 0, 0, w, h);
    else {
      ground(Math.min(1, t / 1.2));
      g.lineCap = 'round';
      g.strokeStyle = '#7a4a3a';
      for (const [a, c, b, lw, s0, s1] of branches) {
        const p = (t - s0 * 4.5) / ((s1 - s0) * 4.5);
        if (p <= 0) continue;
        const e = easeInOut(Math.min(1, p));
        g.lineWidth = lw * (0.6 + 0.4 * e);
        g.beginPath();
        const n = Math.max(2, Math.ceil(e * 28));
        for (let i = 0; i <= n; i++) { const [x, y] = quad(a, c, b, (e * i) / n); i ? g.lineTo(x, y) : g.moveTo(x, y); }
        g.stroke();
      }
      for (const f of hearts) {
        const p = Math.min(1, Math.max(0, (t - f.birth) / 0.8));
        if (p <= 0) continue;
        const sc = easeOutBack(p);
        g.save(); g.translate(f.x, f.y); g.rotate(f.rot + Math.sin(t * 1.4 + f.sway) * .06 * p); g.scale(sc, sc);
        g.fillStyle = f.col; heartPath(g, f.s); g.fill();
        g.restore();
      }
      const prog = Math.min(1, t / total);
      if (!announced && prog > 0.55) { announced = true; onProgress(); }
      if (t > total) {
        // bake the finished tree so later frames only draw one image
        baked = document.createElement('canvas'); baked.width = canvas.width; baked.height = canvas.height;
        baked.getContext('2d').drawImage(canvas, 0, 0);
      }
    }
    // hearts that let go of the tree and drift down
    if (t > total * 0.7) {
      for (const f of falling) {
        f.a = Math.min(1, f.a + dt * .4);
        f.y += f.v * dt; f.x += Math.sin(t * 1.3 + f.ph) * 12 * dt;
        if (f.y > base[1] + 10) { f.y = cy - R * 0.9; f.x = cx + (rnd() - .5) * R * 2; f.a = 0; }
        g.save(); g.globalAlpha = f.a * 0.9; g.translate(f.x, f.y); g.rotate(Math.sin(t + f.ph) * .5); g.fillStyle = f.col; heartPath(g, f.s); g.fill(); g.restore();
      }
    }
    raf = requestAnimationFrame(frame);
  };
  raf = requestAnimationFrame(frame);
}

export default {
  mount(stage, ctx) {
    const c = ctx.copy.ending;
    stage.innerHTML = `
      <section class="end-scene">
        <canvas class="end-canvas" id="tree"></canvas>
        <div class="end-text">
          <div class="end-top">
            <p class="end-kicker"></p>
            <p class="end-title"></p>
            <p class="end-name"></p>
          </div>
          <div class="end-foot">
            <p class="end-sub"></p>
            <p class="end-from"></p>
          </div>
          <div class="end-btns">
            <button class="end-btn" id="play" type="button"></button>
            <button class="end-btn ghost" id="again" type="button"></button>
          </div>
        </div>
      </section>`;
    const $ = (s) => stage.querySelector(s);
    $('.end-kicker').textContent = c.kicker;
    $('.end-title').textContent = c.title;
    $('.end-name').textContent = c.name;
    $('.end-sub').textContent = c.sub;
    $('.end-from').textContent = c.from;
    $('#play').textContent = '▶ ' + c.play;
    $('#again').textContent = c.again;
    const parts = ['.end-kicker', '.end-title', '.end-name', '.end-sub', '.end-from', '.end-btns'];
    gsap.set(parts, { opacity: 0, y: 14 });
    ctx.audio.swell();
    growTree($('#tree'), () => {
      ctx.audio.chime();
      gsap.to(parts, { opacity: 1, y: 0, duration: 1, stagger: .35, ease: 'power2.out' });
      gsap.fromTo('.end-name', { scale: .92 }, { scale: 1, duration: 1.4, ease: 'elastic.out(1,.5)' });
      ctx.fx.hearts(innerWidth / 2, innerHeight * .4, 10);
    });

    let voice = null, playing = false;
    const playBtn = $('#play');
    const setPlaying = (v) => { playing = v; playBtn.textContent = (v ? '❚❚ ' : '▶ ') + c.play; };
    playBtn.onclick = () => {
      ctx.audio.unlock();
      if (playing) { voice?.pause(); setPlaying(false); return; }
      ctx.fx.hearts(innerWidth / 2, innerHeight * .45, 12);
      if (c.audio) {
        voice = voice ?? new Audio(c.audio);
        voice.onended = () => setPlaying(false);
        voice.play().then(() => setPlaying(true)).catch(() => { const d = ctx.audio.birthday(); setPlaying(true); setTimeout(() => setPlaying(false), d * 1000); });
      } else {
        const d = ctx.audio.birthday();
        setPlaying(true);
        const t = setTimeout(() => setPlaying(false), d * 1000);
        cleanup.push(() => clearTimeout(t));
      }
    };
    cleanup.push(() => { voice?.pause(); });
    $('#again').onclick = () => { ctx.audio.sparkle(); ctx.go('intro'); };
  },
  unmount() { cleanup.forEach((f) => f()); cleanup = []; },
};
