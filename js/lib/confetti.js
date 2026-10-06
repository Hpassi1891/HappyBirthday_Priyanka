// Full-screen canvas particles: confetti bursts, hearts, fireworks.
const canvas = document.getElementById('fx');
const g = canvas.getContext('2d');
let parts = [];
let running = false;
const COLORS = ['#ff9fc4', '#f0568e', '#f7c86a', '#fff', '#c9a7ff', '#8fd3ff'];

function resize() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = innerWidth * dpr;
  canvas.height = innerHeight * dpr;
  g.setTransform(dpr, 0, 0, dpr, 0, 0);
}
addEventListener('resize', resize);
resize();

function loop() {
  g.clearRect(0, 0, innerWidth, innerHeight);
  parts = parts.filter((p) => p.life > 0 && p.y < innerHeight + 30);
  for (const p of parts) {
    p.vy += p.gravity;
    p.vx *= p.drag; p.vy *= p.drag;
    p.x += p.vx; p.y += p.vy;
    p.rot += p.vr;
    p.life -= 1;
    g.save();
    g.globalAlpha = Math.min(1, p.life / 30);
    g.translate(p.x, p.y);
    g.rotate(p.rot);
    g.fillStyle = p.color;
    if (p.shape === 'heart') {
      g.font = `${p.size * 2}px serif`; g.textAlign = 'center'; g.fillText('💖', 0, 0);
    } else if (p.shape === 'dot') {
      g.beginPath(); g.arc(0, 0, p.size / 2, 0, 7); g.fill();
    } else {
      g.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
    }
    g.restore();
  }
  if (parts.length) requestAnimationFrame(loop); else running = false;
}

function add(p) {
  parts.push({ vr: 0, drag: 0.99, gravity: 0.12, life: 120, size: 8, shape: 'rect', ...p });
  if (!running) { running = true; requestAnimationFrame(loop); }
}

export function burst(x = innerWidth / 2, y = innerHeight / 2, count = 90) {
  for (let i = 0; i < count; i++) {
    const a = Math.random() * Math.PI * 2;
    const s = 3 + Math.random() * 7;
    add({
      x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 4,
      color: COLORS[(Math.random() * COLORS.length) | 0],
      size: 6 + Math.random() * 8, vr: (Math.random() - .5) * .4,
      life: 90 + Math.random() * 60,
    });
  }
}

export function hearts(x, y, count = 8) {
  for (let i = 0; i < count; i++) {
    add({ x, y, vx: (Math.random() - .5) * 5, vy: -2 - Math.random() * 4, gravity: 0.05, size: 10 + Math.random() * 8, shape: 'heart', life: 70 });
  }
}

export function rain(durationMs = 2500) {
  const end = performance.now() + durationMs;
  (function tick() {
    for (let i = 0; i < 4; i++) {
      add({ x: Math.random() * innerWidth, y: -10, vx: (Math.random() - .5) * 2, vy: 2 + Math.random() * 3,
        color: COLORS[(Math.random() * COLORS.length) | 0], size: 6 + Math.random() * 8, vr: (Math.random() - .5) * .3, life: 200 });
    }
    if (performance.now() < end) requestAnimationFrame(tick);
  })();
}

export function firework(x = Math.random() * innerWidth, y = innerHeight * (.15 + Math.random() * .3)) {
  const color = COLORS[(Math.random() * COLORS.length) | 0];
  for (let i = 0; i < 70; i++) {
    const a = (i / 70) * Math.PI * 2;
    const s = 2 + Math.random() * 4;
    add({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, color, size: 5, shape: 'dot', gravity: 0.05, drag: 0.97, life: 70 });
  }
}
