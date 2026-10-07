// The flip-book story: "Rakshas delivers a birthday letter". Eleven shots, drawn procedurally frame by frame.
// Each shot is { id, n: frame count, fps, caption, sfx: { frame: soundName }, draw(k, p, j) }.
import { W, H, GROUND, jitter, person, ground, cloud, sun, tree, lamp, bubble, confetti, dog, bed, alarm, house, stars, sweatDrops, steam, zzz, speedLines, rain, rainbow, bananaPeel, crumple, lettersOnSign, envelope, heart, star } from './storyart.js';

const INK = '#3c4a85';
const lerp = (a, b, t) => a + (b - a) * t;
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const ease = (t) => t * t * (3 - 2 * t);
const tri = (k, a, b) => clamp((k - a) / (b - a));
const handPos = (x, y, arm, side = 1, s = 1) => [x + (side * 13 + Math.sin((arm * Math.PI) / 180) * 30) * s, y - 70 * s + Math.cos((arm * Math.PI) / 180) * 30 * s];
const walkCycle = (k, speed = 0.9, amp = 28) => { const a = Math.sin(k * speed) * amp; return { legL: a, legR: -a, armL: -a * 0.7, bob: -Math.abs(Math.sin(k * speed)) * 4 }; };

export const SHOTS = [
  {
    id: 'wake', n: 12, fps: 8,
    caption: '6 baje… alarm! 😴➜😱',
    sfx: { 5: 'alarm', 6: 'alarm', 7: 'alarm', 8: 'pop' },
    draw(k, p, j) {
      let s = ground(j) + bed(14, 262);
      s += `<rect x="238" y="270" width="48" height="26" fill="#ffd6a8" stroke="${INK}" stroke-width="3"/>`;
      s += alarm(262, 252, k >= 5, j);
      if (k <= 6) {
        s += `<circle cx="40" cy="244" r="17" fill="#ffd9b8" stroke="${INK}" stroke-width="3"/><path d="M28 232 L24 218 L36 228Z M52 232 L56 218 L44 228Z" fill="#ff6b8b" stroke="${INK}" stroke-width="2.2" stroke-linejoin="round"/><path d="M31 242 q3 3 6 0 M43 242 q3 3 6 0" stroke="${INK}" stroke-width="2.4" fill="none" stroke-linecap="round"/><path d="M37 251 q3 2 6 0" stroke="${INK}" stroke-width="2.2" fill="none" stroke-linecap="round"/>`;
        s += `<path d="M58 244 Q120 ${222 + Math.sin(k) * 3} 198 250 L198 276 L58 276Z" fill="#c9d8ff" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/><path d="M90 236 l8 38 M130 232 l8 42 M170 238 l8 38" stroke="#fff" stroke-opacity=".8" stroke-width="4" stroke-linecap="round"/>`;
        s += zzz(66, 214, k);
      } else {
        const t = k - 7;
        s += `<path transform="translate(${70 + t * 2} ${150 - t * 6}) rotate(${-20 + t * 8})" d="M0 0 Q30 -14 60 0 L56 34 L0 34Z" fill="#c9d8ff" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>`;
        s += person({ x: 150, bob: -Math.abs(Math.sin(t * 1.4)) * 16, armL: -155, armR: 155, legL: -10, legR: 10, expr: 'shock', j });
        if (k >= 8) s += bubble(24, 20, 252, 66, ['AAJ CHUDAIL KA', 'BIRTHDAY HAI!!'], 'down', j, 24);
        s += star(70, 130, 7) + star(236, 120, 6) + star(210, 160, 5);
      }
      return s;
    },
  },
  {
    id: 'letter', n: 14, fps: 9,
    caption: 'Letter likha. 7 baar. 📝',
    sfx: { 8: 'toss', 11: 'sparkle' },
    draw(k, p, j) {
      let s = ground(j);
      s += `<rect x="150" y="232" width="134" height="10" fill="#ffd6a8" stroke="${INK}" stroke-width="3"/><rect x="158" y="242" width="9" height="54" fill="#ffd6a8" stroke="${INK}" stroke-width="3"/><rect x="266" y="242" width="9" height="54" fill="#ffd6a8" stroke="${INK}" stroke-width="3"/>`;
      s += `<path d="M168 230 L228 230 L238 218 L178 218Z" fill="#fff" stroke="${INK}" stroke-width="2.6" stroke-linejoin="round"/>`;
      s += `<path d="M232 270 L238 252 M232 270 L236 296 M278 270 L274 296" stroke="none"/>`;
      const lines = k < 7 ? Math.min(4, 1 + Math.floor(k / 2)) : 0;
      for (let i = 0; i < lines; i++) s += `<path d="M${182 + i * 2} ${224 - i * 2.4} q6 -3 12 0 t12 0 t12 0" stroke="${INK}" stroke-width="1.8" fill="none" stroke-linecap="round" transform="translate(0 ${j(.4)})"/>`;
      if (k < 7) {
        s += person({ x: 100, tilt: 8, armR: 112 + Math.sin(k * 2) * 12, armL: -20, legL: -4, legR: 6, expr: 'think', j });
        s += star(176, 196, 5);
      } else if (k < 11) {
        const t = (k - 7) / 3;
        s += person({ x: 100, armR: 150 - t * 40, armL: -20, legL: -6, legR: 6, expr: 'sweat', j });
        // crumpled paper: arcs toward the bin, misses, bounces away
        const bx = lerp(120, 262, Math.min(t, 0.8) / 0.8), by = lerp(196, 262, Math.min(t, 0.8) / 0.8) - Math.sin(Math.min(t, 0.8) / 0.8 * Math.PI) * 70;
        s += crumple(bx + (t > 0.8 ? (t - 0.8) * 90 : 0), t > 0.8 ? 262 + Math.sin((t - 0.8) * 8) * -26 + (t - 0.8) * 60 : by, t * 400);
      } else {
        const t = k - 11;
        s += person({ x: 100, bob: -Math.abs(Math.sin(t * 1.5)) * 8, armR: 168, armL: -150, legL: -8, legR: 8, expr: 'grin', hold: 'letter', j });
        s += heart(60 + t * 6, 120 - t * 4, 1, '#ff7aa6') + star(150, 100 + t * 3, 7) + heart(140, 82 + t * 4, 0.8, '#c9a7ff');
      }
      s += `<path d="M252 296 L256 262 L286 262 L290 296Z" fill="#9be3b0" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>`;
      return s;
    },
  },
  {
    id: 'walk', n: 16, fps: 11,
    caption: 'Delivery boy Rakshas 🚶',
    sfx: {},
    draw(k, p, j) {
      let s = sun(246, 52, k) + cloud(80 - k * 3, 62, 0.9) + cloud(240 - k * 2, 120, 0.6);
      s += tree(((300 - k * 16) % 440) - 40, GROUND) + tree(((120 - k * 16 + 440) % 440) - 40, GROUND) + lamp(((210 - k * 16 + 440) % 440) - 40, GROUND);
      s += ground(j);
      const w = walkCycle(k, 0.95, 28);
      s += person({ x: 128, bob: w.bob, legL: w.legL, legR: w.legR, armL: w.armL, armR: 70, expr: k % 8 < 5 ? 'smile' : 'grin', hold: 'letter', j });
      return s;
    },
  },
  {
    id: 'peel', n: 14, fps: 10,
    caption: 'Vighna #1: kela 🍌',
    sfx: { 5: 'slip', 10: 'thud', 13: 'sparkle' },
    draw(k, p, j) {
      let s = ground(j) + bananaPeel(170, GROUND);
      if (k < 5) {
        const w = walkCycle(k, 1.0, 26);
        s += person({ x: 30 + k * 24, bob: w.bob, legL: w.legL, legR: w.legR, armL: w.armL, armR: 70, hold: 'letter', j });
      } else if (k < 10) {
        const t = (k - 5) / 4;
        s += person({ x: 150 + t * 56, bob: -Math.sin(t * Math.PI) * 100, rot: -t * 250, legL: 40 + Math.sin(k * 3) * 20, legR: -40, armL: 140, armR: -140, expr: 'shock', j });
        const lx = lerp(160, 262, t), ly = lerp(190, 120, Math.sin(t * Math.PI)) + t * 80;
        s += envelope(lx, ly - Math.sin(t * Math.PI) * 60, t * 500, 1.1) + bubble(24, 24, 120, 48, ['AAAIII!!'], 'down', j, 24);
      } else {
        const t = k - 10;
        s += person({ x: 214, rot: -90, bob: -4, armR: 150, legL: 10, legR: -10, expr: k >= 13 ? 'grin' : 'sweat', hold: k >= 12 ? 'letter' : null, j });
        s += stars(214, 196, k);
        if (k < 12) s += envelope(lerp(250, 232, t / 2), lerp(120, 200, ease(t / 2)), t * 200, 1.1);
        if (k >= 13) s += bubble(20, 60, 120, 44, ['sab theek!'], 'down', j, 20);
      }
      return s;
    },
  },
  {
    id: 'dog', n: 16, fps: 12,
    caption: 'Vighna #2: kutta 🐕',
    sfx: { 0: 'bark', 4: 'bark', 8: 'bark', 11: 'toss', 13: 'sparkle' },
    draw(k, p, j) {
      let s = ground(j) + cloud(80, 60, 0.8);
      const running = k < 11;
      const px = running ? 40 + k * 18 : 40 + 10 * 18;
      const w = { legL: Math.sin(k * 1.6) * 42, legR: -Math.sin(k * 1.6) * 42, armL: -Math.sin(k * 1.6) * 60, armR: Math.sin(k * 1.6) * 60, bob: -Math.abs(Math.sin(k * 1.6)) * 8 };
      if (running) s += speedLines(px - 20, GROUND - 60, k);
      const dx = running ? px - 82 + Math.sin(k) * 4 : px - 70;
      s += dog(dx, GROUND, running ? k : 99, false, running, running ? 0 : 12);
      if (running) {
        s += person({ x: px, ...w, expr: 'shock', hold: 'letter', j });
        if (k < 9) s += bubble(8, 30, 120, 46, ['BHOW BHOW!!'], 'down', j, 22);
      } else {
        s += person({ x: px, armL: 160, armR: 40, legL: 6, legR: -6, expr: 'sweat', hold: 'letter', j }) + sweatDrops(px, GROUND - 120, k);
        if (k >= 13) s += bubble(120, 40, 112, 44, ['phew…'], 'down', j, 22);
      }
      if (k >= 10 && k <= 12) { const t = (k - 10) / 2; s += `<circle cx="${lerp(px - 10, dx + 30, t)}" cy="${GROUND - 100 + Math.sin(t * Math.PI) * -26 + t * 70}" r="7" fill="#e6b073" stroke="${INK}" stroke-width="2.4"/><circle cx="${lerp(px - 10, dx + 30, t) - 2}" cy="${GROUND - 102 + Math.sin(t * Math.PI) * -26 + t * 70}" r="1.4" fill="${INK}"/>`; }
      return s;
    },
  },
  {
    id: 'rain', n: 12, fps: 10,
    caption: 'Vighna #3: baarish 🌧️',
    sfx: { 0: 'rain', 9: 'sparkle' },
    draw(k, p, j) {
      let s = ground(j);
      const rainy = k < 9;
      if (rainy) {
        s += cloud(150, 52, 2.2, '#c3cbe6') + rain(k);
        s += `<ellipse cx="150" cy="${GROUND + 2}" rx="${22 + (k % 4) * 6}" ry="${5 + (k % 4)}" fill="none" stroke="#6aa8e8" stroke-width="2.4"/>`;
        s += person({ x: 150, tilt: 12, armL: 52, armR: -52, legL: -4, legR: 4, expr: 'sweat', j }) + envelope(150, GROUND - 62, 0, 1) + sweatDrops(150, GROUND - 130, k);
      } else {
        const t = (k - 9) / 2;
        s += sun(244, 60, k) + rainbow(150, 210, clamp(t + 0.3));
        s += person({ x: 150, bob: -Math.abs(Math.sin(k * 2)) * 6, armR: 160, armL: 20, legL: -8, legR: 8, expr: 'grin', hold: 'letter', j });
        s += star(60, 90, 6) + star(250, 150, 5);
      }
      return s;
    },
  },
  {
    id: 'arrive', n: 14, fps: 9,
    caption: 'Chudail ka kila: SBI PO mock test!',
    sfx: { 8: 'knock', 10: 'knock', 12: 'knock' },
    draw(k, p, j) {
      let s = ground(j) + tree(30, GROUND) + house(170, 150);
      s += `<rect x="208" y="222" width="38" height="74" fill="#c9a7ff" stroke="${INK}" stroke-width="3"/><circle cx="238" cy="262" r="3.6" fill="#ffe98a" stroke="${INK}" stroke-width="2"/>`;
      s += lettersOnSign(190, 168, 74, 66, ['SSHH!!', 'SBI PO', 'MOCK TEST', 'CHAL RAHA', 'HAI'], j);
      const t = Math.min(k, 8);
      const x = 52 + t * 6;
      if (k < 8) {
        const w = walkCycle(k, 1.1, 14);
        s += person({ x, bob: Math.abs(Math.sin(k * 1.1)) * -3, legL: w.legL, legR: w.legR, armL: -10, armR: 152, expr: 'think', hold: null, j });
        s += `<text x="${x + 14}" y="${GROUND - 118}" font-family="Caveat, cursive" font-weight="700" font-size="20" fill="${INK}">shh…</text>`;
      } else {
        const kn = Math.floor(k) % 2;
        s += person({ x, armR: 96 + kn * 36, armL: -10, legL: -4, legR: 4, expr: 'sweat', j });
        s += `<text x="${x + 38}" y="${GROUND - 98 - kn * 6}" font-family="Caveat, cursive" font-weight="700" font-size="${22 + kn * 4}" fill="#e8416f">tok tok!</text>`;
      }
      return s;
    },
  },
  {
    id: 'door', n: 14, fps: 8,
    caption: 'Darwaza khula… HURRR!! 😨',
    sfx: { 0: 'creak', 2: 'hurr', 3: 'hurr' },
    draw(k, p, j) {
      let s = ground(j) + tree(30, GROUND) + house(170, 150);
      s += `<rect x="208" y="222" width="38" height="74" fill="#5a3a5e" stroke="${INK}" stroke-width="3"/><path d="M208 222 L196 228 L196 296 L208 296Z" fill="#c9a7ff" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>`;
      s += lettersOnSign(184, 150, 74, 66, ['SSHH!!', 'SBI PO', 'MOCK TEST', 'CHAL RAHA', 'HAI'], j).replace('<g ', '<g opacity="0" ');
      const shake = () => Math.sin(k * 52) * 2.2;
      s += person({ who: 'her', x: 236 + shake(), s: 0.92, armR: 62, armL: -24 + shake() * 3, legL: -3, legR: 3, expr: 'angry', hold: 'books', j });
      s += steam(236, GROUND - 124, k) + `<text x="224" y="${GROUND - 148}" font-family="Caveat, cursive" font-weight="700" font-size="22" fill="#e8416f">#@!$</text>`;
      s += bubble(40 + Math.sin(k * 47) * 2, 52 + Math.cos(k * 41) * 2, 148, 58, ['HURRR!!'], 'right', () => 0, 34, '#fff5f8');
      const knock = k % 2 ? 7 : -7;
      s += person({ x: 96, legL: knock, legR: -knock, armL: 12, armR: -12, expr: 'sweat', j }) + sweatDrops(96, GROUND - 128, k);
      s += `<text x="46" y="${GROUND - 118}" font-family="Caveat, cursive" font-weight="700" font-size="20" fill="${INK}">glp…</text>`;
      return s;
    },
  },
  {
    id: 'wish', n: 18, fps: 10,
    caption: 'Happy Birthday, Chudail! 🎉',
    sfx: { 4: 'pop', 5: 'cheer', 17: 'sparkle' },
    draw(k, p, j) {
      let s = ground(j) + tree(24, GROUND);
      const hat = k >= 3;
      const popT = tri(k, 4, 10);
      const hx = 96;
      let armR = -30;
      if (k >= 3 && k < 9) armR = 150;
      if (k >= 9) armR = lerp(150, 78, ease(tri(k, 9, 12)));
      if (k >= 15) armR = lerp(78, 10, tri(k, 15, 17));
      s += person({ x: hx, bob: k >= 4 && k < 9 ? -Math.abs(Math.sin(k * 2)) * 8 : 0, armR, armL: k >= 4 && k < 9 ? -150 : -14, legL: -6, legR: 6, expr: 'grin', hat, j });
      if (k >= 4 && k < 11) s += confetti(hx + 14, GROUND - 130, popT, 26, j);
      if (k >= 5 && k < 12) s += bubble(14, 18, 272, 64, ['HAPPY BIRTHDAY', 'CHUDAIL!!'], 'down', j, 26, '#fffbe0');
      const herArms = k >= 15 ? { armR: 40, hold: 'letter' } : { armR: 30 };
      s += person({ who: 'her', x: 236, s: 0.92, armL: -20, ...herArms, legL: -3, legR: 3, expr: k < 12 ? 'shock' : 'blush', j });
      if (k >= 9 && k < 15) {
        const t = ease(tri(k, 9, 15));
        const [sx] = handPos(hx, GROUND, armR, 1, 1);
        s += envelope(lerp(sx + 14, 222, t), lerp(GROUND - 76, GROUND - 68, t) - Math.sin(t * Math.PI) * 18, -15 + t * 15, 1.1);
      }
      if (k >= 15) s += heart(214, 120 - (k - 15) * 6, 1, '#ff7aa6') + heart(250, 100 - (k - 15) * 5, 0.8, '#c9a7ff') + star(170, 150, 6);
      return s;
    },
  },
  {
    id: 'read', n: 14, fps: 8,
    caption: 'Gussa pighla… nasharam! 🥺',
    sfx: { 4: 'sparkle', 8: 'cheer' },
    draw(k, p, j) {
      let s = ground(j);
      const expr = k < 4 ? 'shock' : k < 9 ? 'blush' : 'love';
      s += person({ who: 'her', x: 168, s: 1.08, armL: -42, armR: 42, legL: -3, legR: 3, expr, j });
      // the open letter held in front of her
      s += `<g transform="translate(168 ${GROUND - 50}) rotate(${Math.sin(k) * 2})"><rect x="-34" y="-34" width="68" height="52" rx="3" fill="#fff" stroke="${INK}" stroke-width="3"/><path d="M-24 -20 h48 M-24 -10 h48 M-24 0 h36" stroke="#9fc3e6" stroke-width="2.4" stroke-linecap="round"/>${heart(22, 8, 0.7)}</g>`;
      for (let i = 0; i < 5; i++) s += heart(120 + i * 22 + Math.sin(k + i) * 6, GROUND - 150 - ((k * 9 + i * 26) % 130), 0.9, i % 2 ? '#ff7aa6' : '#c9a7ff');
      if (k >= 5) s += bubble(180, 24, 110, 46, ['nasharam…'], 'down', j, 22, '#fff5f8');
      const d = Math.sin(k * 1.8);
      s += person({ x: 56, bob: -Math.abs(d) * 12, armL: 120 + d * 40, armR: -120 - d * 40, legL: d * 14, legR: -d * 14, expr: 'grin', j });
      return s;
    },
  },
  {
    id: 'end', n: 8, fps: 6,
    caption: 'The End… letter tere haath mein 💌',
    sfx: { 0: 'cheer', 4: 'sparkle' },
    draw(k, p, j) {
      let s = ground(j);
      s += `<text x="150" y="86" text-anchor="middle" font-family="Caveat, cursive" font-weight="700" font-size="58" fill="#d6457f" stroke="#fff" stroke-width="6" paint-order="stroke" transform="rotate(${-3 + Math.sin(k) * 1.5} 150 70)">THE END</text>`;
      s += confetti(150, 110, (k % 8) / 8, 24, j);
      const w = Math.sin(k * 1.5);
      s += person({ x: 96, armR: 140 + w * 26, armL: -10, legL: -5, legR: 5, expr: 'grin', j });
      s += person({ who: 'her', x: 206, armL: -140 - w * 26, armR: 10, legL: -5, legR: 5, expr: 'love', j });
      s += heart(150, 190 - (k % 4) * 5, 1.3, '#e8416f') + heart(60, 160, 0.9, '#ff7aa6') + heart(250, 150, 0.9, '#c9a7ff');
      return s;
    },
  },
];

// ---- playback: the story as one continuous cartoon ----
// Shot lengths come from frame count / fps, stretched a little so each scene is easy to follow.
export const TIME_SCALE = 1.35;
export const DURATIONS = SHOTS.map((sh) => (sh.n / sh.fps) * TIME_SCALE);
export const TOTAL_SECONDS = DURATIONS.reduce((a, b) => a + b, 0);
const STARTS = DURATIONS.map((_, i) => DURATIONS.slice(0, i).reduce((a, b) => a + b, 0));
const noJitter = () => 0;

// Which shot is playing at time t (seconds), and how far into it (k is in "frames", but fractional).
export function locate(t) {
  const tt = Math.max(0, Math.min(TOTAL_SECONDS - 1e-6, t));
  let si = STARTS.length - 1;
  while (si > 0 && tt < STARTS[si]) si--;
  const shot = SHOTS[si];
  const k = Math.min(shot.n - 1, ((tt - STARTS[si]) / DURATIONS[si]) * shot.n);
  return { si, k, p: shot.n > 1 ? k / (shot.n - 1) : 0 };
}

export function renderShot(si, k) {
  const shot = SHOTS[si];
  const p = shot.n > 1 ? k / (shot.n - 1) : 0;
  return `<svg class="fsvg" viewBox="0 10 300 300" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${shot.draw(k, p, noJitter)}</svg>`;
}

export const renderAt = (t) => { const { si, k } = locate(t); return renderShot(si, k); };
