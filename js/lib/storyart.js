// Doodle drawing kit for the flip-book story: two characters (Rakshas and Chudail) and props, as SVG strings.
// Pure functions (no DOM), so every frame can be rendered and tested in Node.
// Each frame passes a jitter function `j` seeded by the frame number, which makes every line shake a little
// from page to page, the way hand-drawn flip-book lines "boil".
export const W = 300, H = 360, GROUND = 296;
export const INK = '#3c4a85';
export const SW = 3.2;

function mulberry(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
export const jitter = (k) => { const r = mulberry((k + 1) * 2654435761); return (a = 1) => (r() - 0.5) * 2 * a; };

export const n = (v) => Math.round(v * 10) / 10;
const rad = (d) => (d * Math.PI) / 180;
const end = (x, y, deg, len) => [x + Math.sin(rad(deg)) * len, y + Math.cos(rad(deg)) * len];
export const line = (x1, y1, x2, y2, stroke = INK, w = SW) => `<line x1="${n(x1)}" y1="${n(y1)}" x2="${n(x2)}" y2="${n(y2)}" stroke="${stroke}" stroke-width="${w}" stroke-linecap="round"/>`;
export const limb = (x1, y1, x2, y2, color, w) => line(x1, y1, x2, y2, INK, w + 4.5) + line(x1, y1, x2, y2, color, w);
export const circ = (x, y, r, fill = '#fff', stroke = INK, w = SW) => `<circle cx="${n(x)}" cy="${n(y)}" r="${n(r)}" fill="${fill}" stroke="${stroke}" stroke-width="${w}"/>`;
const heartPath = (s = 1) => `M0 ${6 * s} C${-12 * s} ${-2 * s} ${-7 * s} ${-12 * s} 0 ${-5 * s} C${7 * s} ${-12 * s} ${12 * s} ${-2 * s} 0 ${6 * s}Z`;
export const heart = (x, y, s = 1, fill = '#e8416f', rot = 0) => `<path transform="translate(${n(x)} ${n(y)}) rotate(${n(rot)})" d="${heartPath(s)}" fill="${fill}" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>`;
export const star = (x, y, s = 6, fill = '#ffd166') => `<path transform="translate(${n(x)} ${n(y)})" d="M0 ${-s} L${s * 0.3} ${-s * 0.3} L${s} 0 L${s * 0.3} ${s * 0.3} L0 ${s} L${-s * 0.3} ${s * 0.3} L${-s} 0 L${-s * 0.3} ${-s * 0.3}Z" fill="${fill}" stroke="${INK}" stroke-width="1.6" stroke-linejoin="round"/>`;

const LOOKS = {
  him: { skin: '#ffd9b8', top: '#8fd3ff', bottom: '#4a5aa8', shoes: '#ff7aa6' },
  her: { skin: '#ffd9b8', top: '#ff9ac2', bottom: '#c9a7ff', shoes: '#ffffff' },
};

function face(expr, who, blink = false) {
  const eye = (x, y, r = 2.4) => (blink ? `<path d="M${x - 3.4} ${y} h6.8" stroke="${INK}" stroke-width="2.4" stroke-linecap="round"/>` : `<circle cx="${x}" cy="${y}" r="${r}" fill="${INK}"/>`);
  const blush = `<ellipse cx="-14" cy="6" rx="5" ry="3" fill="#ff8fb8" opacity=".6"/><ellipse cx="14" cy="6" rx="5" ry="3" fill="#ff8fb8" opacity=".6"/>`;
  const brow = (x1, y1, x2, y2) => line(x1, y1, x2, y2, INK, 2.6);
  switch (expr) {
    case 'sleep': return `${blush}<path d="M-13 0 q4 4 8 0 M5 0 q4 4 8 0" stroke="${INK}" stroke-width="2.6" fill="none" stroke-linecap="round"/><path d="M-3 10 q3 3 6 0" stroke="${INK}" stroke-width="2.4" fill="none" stroke-linecap="round"/>`;
    case 'shock': return `${circ(-8, -1, 5, '#fff', INK, 2.2)}${eye(-8, -1, 1.8)}${circ(8, -1, 5, '#fff', INK, 2.2)}${eye(8, -1, 1.8)}<ellipse cx="0" cy="12" rx="4.5" ry="6" fill="#7a2d5a" stroke="${INK}" stroke-width="2.2"/>${brow(-14, -11, -5, -13)}${brow(5, -13, 14, -11)}`;
    case 'angry': return `${eye(-8, 0)}${eye(8, 0)}${brow(-15, -9, -3, -4)}${brow(3, -4, 15, -9)}<path d="M-8 13 L-4 9 L0 13 L4 9 L8 13" stroke="${INK}" stroke-width="2.6" fill="none" stroke-linejoin="round" stroke-linecap="round"/><ellipse cx="-14" cy="6" rx="5" ry="3" fill="#ff5d7a" opacity=".6"/><ellipse cx="14" cy="6" rx="5" ry="3" fill="#ff5d7a" opacity=".6"/>`;
    case 'sweat': return `${eye(-8, 0)}${eye(8, 0)}${brow(-14, -7, -4, -9)}${brow(4, -9, 14, -7)}<path d="M-7 11 q3.5 -3 7 0 q3.5 3 7 0" stroke="${INK}" stroke-width="2.6" fill="none" stroke-linecap="round"/><path d="M19 -10 q4 7 0 9 q-4 -2 0 -9Z" fill="#8fd3ff" stroke="${INK}" stroke-width="1.8"/>`;
    case 'grin': return `${eye(-8, -1)}${eye(8, -1)}<path d="M-11 6 Q0 24 11 6 Z" fill="#7a2d5a" stroke="${INK}" stroke-width="2.4" stroke-linejoin="round"/><path d="M-6 9 Q0 15 6 9" fill="#ff8fb8"/>${blush}`;
    case 'love': return `<path transform="translate(-8 -1) scale(.55)" d="${heartPath()}" fill="#e8416f"/><path transform="translate(8 -1) scale(.55)" d="${heartPath()}" fill="#e8416f"/><path d="M-6 8 Q0 17 6 8" stroke="${INK}" stroke-width="2.6" fill="none" stroke-linecap="round"/>${blush}`;
    case 'blush': return `${eye(-8, 0)}${eye(8, 0)}<path d="M-5 10 q5 4 10 0" stroke="${INK}" stroke-width="2.6" fill="none" stroke-linecap="round"/><ellipse cx="-14" cy="6" rx="6" ry="3.6" fill="#ff6f9c" opacity=".75"/><ellipse cx="14" cy="6" rx="6" ry="3.6" fill="#ff6f9c" opacity=".75"/>`;
    case 'think': return `${eye(-8, -1)}${eye(8, -1)}${brow(-14, -9, -4, -7)}${brow(4, -7, 14, -10)}<path d="M-4 11 h8" stroke="${INK}" stroke-width="2.6" stroke-linecap="round"/>`;
    case 'stare': return `${circ(-8, -1, 6.4, '#fff', INK, 2.2)}<circle cx="-8" cy="-1" r="3.4" fill="${INK}"/><circle cx="-9.2" cy="-2.4" r="1.2" fill="#fff"/>${circ(8, -1, 6.4, '#fff', INK, 2.2)}<circle cx="8" cy="-1" r="3.4" fill="${INK}"/><circle cx="6.8" cy="-2.4" r="1.2" fill="#fff"/><path d="M-5 11 q5 4 10 0" stroke="${INK}" stroke-width="2.6" fill="none" stroke-linecap="round"/>${blush}`;
    case 'yuck': return `<path d="M-13 -3 l8 3 l-8 3 M13 -3 l-8 3 l8 3" stroke="${INK}" stroke-width="2.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M-9 12 q3 -4 6 0 t6 0 t6 0" stroke="${INK}" stroke-width="2.6" fill="none" stroke-linecap="round"/><path d="M4 13 q5 3 4 9 q-5 1 -6 -5Z" fill="#ff7aa6" stroke="${INK}" stroke-width="1.8"/><ellipse cx="0" cy="3" rx="19" ry="12" fill="#9be3b0" opacity=".35"/>`;
    case 'smirk': return `${eye(-8, 0)}${eye(8, 0)}${brow(-14, -9, -4, -7)}${brow(4, -10, 14, -7)}<path d="M-6 10 Q2 12 9 6" stroke="${INK}" stroke-width="2.6" fill="none" stroke-linecap="round"/>${blush}`;
    case 'cry': return `${eye(-8, 0)}${eye(8, 0)}${brow(-14, -6, -4, -9)}${brow(4, -9, 14, -6)}<path d="M-6 13 q6 -6 12 0" stroke="${INK}" stroke-width="2.6" fill="none" stroke-linecap="round"/><path d="M-9 4 q-3 8 0 10 q3 -2 0 -10Z M9 4 q3 8 0 10 q-3 -2 0 -10Z" fill="#8fd3ff" stroke="${INK}" stroke-width="1.6"/>`;
    default: return `${eye(-8, 0)}${eye(8, 0)}<path d="M-8 8 Q0 16 8 8" stroke="${INK}" stroke-width="2.6" fill="none" stroke-linecap="round"/>${blush}`;
  }
}

export const envelope = (x, y, rot = 0, s = 1) => `<g transform="translate(${n(x)} ${n(y)}) rotate(${n(rot)}) scale(${s})">
  <rect x="-15" y="-10" width="30" height="20" rx="2" fill="#fff" stroke="${INK}" stroke-width="2.4"/>
  <path d="M-15 -10 L0 2 L15 -10" fill="none" stroke="${INK}" stroke-width="2.2" stroke-linejoin="round"/>
  <path transform="translate(0 4) scale(.5)" d="${heartPath()}" fill="#e8416f"/></g>`;

export function person(o) {
  const { who = 'him', x = 150, y = GROUND, s = 1, flip = false, bob = 0, rot = 0, legL = 0, legR = 0, armL = 0, armR = 0, tilt = 0,
    expr = 'smile', hold = null, hat = false, blink = false, sit = false, red = 0, shadow = true, j = () => 0 } = o;
  const L = LOOKS[who];
  const fl = sit ? [20 + legL * 0.2, -4] : end(-6, -40, legL, 38), fr = sit ? [22 + legR * 0.2, -4] : end(6, -40, legR, 38);
  const shL = [-13, -70], shR = [13, -70];
  const hl = end(shL[0], shL[1], armL, 30), hr = end(shR[0], shR[1], armR, 30);
  let g = shadow ? `<ellipse cx="0" cy="2" rx="24" ry="5" fill="#3c4a8522"/>` : '';
  if (sit) {
    // seated on a bike: thigh forward, shin down
    g += limb(-6, -40, 22, -40, L.bottom, 8) + limb(22, -40, fl[0], fl[1], L.bottom, 8);
    g += limb(4, -40, 26, -38, L.bottom, 8) + limb(26, -38, fr[0], fr[1], L.bottom, 8);
  } else g += limb(-6 + j(.6), -40, fl[0] + j(.8), fl[1], L.bottom, 8) + limb(6 + j(.6), -40, fr[0] + j(.8), fr[1], L.bottom, 8);
  g += `<ellipse cx="${n(fl[0] + 3)}" cy="${n(fl[1] + 1)}" rx="9" ry="5" fill="${L.shoes}" stroke="${INK}" stroke-width="2.6"/><ellipse cx="${n(fr[0] + 3)}" cy="${n(fr[1] + 1)}" rx="9" ry="5" fill="${L.shoes}" stroke="${INK}" stroke-width="2.6"/>`;
  g += who === 'her'
    ? `<path d="M-14 -76 Q-17 -50 -24 -30 L24 -30 Q17 -50 14 -76 Q0 -82 -14 -76Z" fill="${L.top}" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/><path d="M-12 -44 q12 6 24 0" stroke="#fff" stroke-opacity=".7" stroke-width="3" fill="none" stroke-linecap="round"/>`
    : `<rect x="-15" y="-78" width="30" height="42" rx="11" fill="${L.top}" stroke="${INK}" stroke-width="3"/><path d="M-6 -62 l12 0 M-6 -52 l12 0" stroke="#fff" stroke-opacity=".7" stroke-width="3" stroke-linecap="round"/>`;
  g += limb(shL[0], shL[1], hl[0] + j(.8), hl[1], L.top, 7) + limb(shR[0], shR[1], hr[0] + j(.8), hr[1], L.top, 7);
  g += circ(hl[0], hl[1], 5.5, L.skin, INK, 2.6) + circ(hr[0], hr[1], 5.5, L.skin, INK, 2.6);
  if (hold === 'letter') g += envelope(hr[0] + 6, hr[1] - 6, -15, 1.1);
  if (hold === 'books') g += `<g transform="translate(${n(hr[0] - 16)} ${n(hr[1] - 10)})"><rect width="34" height="9" fill="#ff9ac2" stroke="${INK}" stroke-width="2.2"/><rect y="-9" x="2" width="30" height="9" fill="#a9c7ff" stroke="${INK}" stroke-width="2.2"/><rect y="-18" x="-1" width="32" height="9" fill="#ffd166" stroke="${INK}" stroke-width="2.2"/></g>`;
  // head
  g += `<g transform="translate(0 -98) rotate(${n(tilt)})">`;
  if (who === 'him') {
    g += `<path d="M-17 -14 L-24 -38 L-5 -22Z" fill="#ff6b8b" stroke="${INK}" stroke-width="2.6" stroke-linejoin="round"/><path d="M17 -14 L24 -38 L5 -22Z" fill="#ff6b8b" stroke="${INK}" stroke-width="2.6" stroke-linejoin="round"/>`;
    g += circ(0, 0, 23, L.skin);
    if (red) g += `<circle r="22" fill="#ff3b5c" opacity="${n(red * 0.5)}"/>`;
    g += `<path d="M-20 -8 Q-12 -26 0 -22 Q12 -26 20 -8 Q10 -17 0 -14 Q-10 -17 -20 -8Z" fill="#3a2a3a" stroke="${INK}" stroke-width="2.4" stroke-linejoin="round"/><path d="M-2 -22 L2 -31 L6 -21" fill="#3a2a3a" stroke="${INK}" stroke-width="2.2" stroke-linejoin="round"/>`;
  } else {
    g += circ(0, -26, 9, '#2e2233', INK, 2.8);
    g += `<path d="M-6 -29 L9 -41" stroke="#ffd166" stroke-width="3.4" stroke-linecap="round"/><path d="M-6 -29 L-8 -27" stroke="#ff7aa6" stroke-width="3.4" stroke-linecap="round"/>`;
    g += circ(0, 0, 23, L.skin);
    if (red) g += `<circle r="22" fill="#ff3b5c" opacity="${n(red * 0.5)}"/>`;
    g += `<path d="M-22 -2 Q-22 -26 0 -24 Q22 -26 22 -2 Q16 -15 4 -15 Q-12 -13 -22 -2Z" fill="#2e2233" stroke="${INK}" stroke-width="2.4" stroke-linejoin="round"/>`;
    g += `<circle cx="-8" cy="0" r="7.4" fill="#ffffff55" stroke="${INK}" stroke-width="2"/><circle cx="8" cy="0" r="7.4" fill="#ffffff55" stroke="${INK}" stroke-width="2"/><path d="M-0.6 0 h1.2" stroke="${INK}" stroke-width="2"/>`;
  }
  g += face(expr, who, blink && expr !== 'stare');
  if (hat) g += `<path d="M-14 -20 L0 -52 L14 -20Z" fill="#ffd166" stroke="${INK}" stroke-width="2.6" stroke-linejoin="round"/><path d="M-9 -29 l14 -3 M-5 -39 l9 -2" stroke="#ff7aa6" stroke-width="3"/>${circ(0, -53, 4, '#ff7aa6', INK, 2)}`;
  g += `</g>`;
  const fx = flip ? -s : s;
  return `<g transform="translate(${n(x)} ${n(y + bob)}) scale(${fx} ${s}) translate(0 -40) rotate(${n(rot)}) translate(0 40)">${g}</g>`;
}

// ---- props ----
export const ground = (j, y = GROUND) => `<path d="M-4 ${n(y + j(1))} Q75 ${n(y - 3 + j(1.4))} 150 ${n(y + j(1))} T304 ${n(y + j(1))}" fill="none" stroke="${INK}" stroke-width="${SW}" stroke-linecap="round"/>` +
  [18, 66, 138, 212, 268].map((gx, i) => `<path d="M${gx} ${y + 4} l-3 -8 M${gx + 3} ${y + 4} l0 -10 M${gx + 6} ${y + 4} l3 -8" stroke="#5bbf86" stroke-width="2.4" stroke-linecap="round" transform="translate(${n(j(1))} 0)"/>`).join('');

export const cloud = (x, y, s = 1, fill = '#fff') => `<path transform="translate(${n(x)} ${n(y)}) scale(${s})" d="M-34 10 Q-48 10 -45 -2 Q-42 -12 -30 -10 Q-26 -26 -8 -24 Q4 -32 16 -18 Q32 -20 36 -6 Q50 -4 46 8 Q44 14 34 12Z" fill="${fill}" stroke="${INK}" stroke-width="2.6" stroke-linejoin="round"/>`;
export const sun = (x, y, k = 0) => `<g transform="translate(${x} ${y})"><g transform="rotate(${k * 12})">${[0, 45, 90, 135, 180, 225, 270, 315].map((a) => `<line x1="0" y1="-26" x2="0" y2="-36" stroke="#f0a81a" stroke-width="3.4" stroke-linecap="round" transform="rotate(${a})"/>`).join('')}</g>${circ(0, 0, 18, '#ffe98a')}<path d="M-7 -2 q2 -3 4 0 M3 -2 q2 -3 4 0 M-6 6 q6 5 12 0" stroke="${INK}" stroke-width="2" fill="none" stroke-linecap="round"/></g>`;
export const tree = (x, y) => `<g transform="translate(${n(x)} ${n(y)})"><rect x="-6" y="-50" width="12" height="52" fill="#c98e6a" stroke="${INK}" stroke-width="2.8"/><circle cx="0" cy="-66" r="26" fill="#9be3b0" stroke="${INK}" stroke-width="2.8"/><circle cx="-14" cy="-52" r="16" fill="#9be3b0" stroke="${INK}" stroke-width="2.8"/><circle cx="14" cy="-54" r="16" fill="#9be3b0" stroke="${INK}" stroke-width="2.8"/><circle cx="-4" cy="-70" r="4" fill="#ff8fb8"/><circle cx="10" cy="-60" r="3.4" fill="#ffd166"/></g>`;
export const lamp = (x, y) => `<g transform="translate(${n(x)} ${n(y)})"><rect x="-3" y="-90" width="6" height="92" fill="#8f98c6" stroke="${INK}" stroke-width="2.6"/><path d="M-14 -90 L14 -90 L8 -104 L-8 -104Z" fill="#ffe98a" stroke="${INK}" stroke-width="2.6" stroke-linejoin="round"/></g>`;

export function bubble(x, y, w, h, lines, dir = 'down', j = () => 0, size = 17, fill = '#fff') {
  const tail = dir === 'down' ? `M${w / 2 - 10} ${h - 1} L${w / 2 - 22} ${h + 16} L${w / 2 + 6} ${h - 1}` : dir === 'left' ? `M1 ${h / 2 - 8} L-16 ${h / 2 + 10} L1 ${h / 2 + 8}` : `M${w - 1} ${h / 2 - 8} L${w + 16} ${h / 2 + 10} L${w - 1} ${h / 2 + 8}`;
  const text = lines.map((t, i) => `<text x="${w / 2}" y="${n(size + 3 + i * (size + 1))}" text-anchor="middle" font-family="Caveat, cursive" font-weight="700" font-size="${size}" fill="${INK}">${t}</text>`).join('');
  return `<g transform="translate(${n(x + j(1))} ${n(y + j(1))})"><rect width="${w}" height="${h}" rx="12" fill="${fill}" stroke="${INK}" stroke-width="3"/><path d="${tail}" fill="${fill}" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/><path d="${tail}" fill="none" stroke="${fill}" stroke-width="5" transform="translate(0 -1.5)"/>${text}</g>`;
}

export const confetti = (cx, cy, p, count = 22, j = () => 0) => {
  const cols = ['#ff7aa6', '#ffd166', '#7fd6c2', '#a9c7ff', '#c9a7ff'];
  let s = '';
  for (let i = 0; i < count; i++) {
    const a = (i / count) * Math.PI * 2 + i * 0.7, r = 10 + p * (46 + (i % 5) * 16);
    const x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r * 0.8 + p * p * 50;
    s += i % 2 ? `<rect x="${n(x)}" y="${n(y)}" width="7" height="4" rx="1" fill="${cols[i % 5]}" transform="rotate(${(i * 40 + p * 200) | 0} ${n(x)} ${n(y)})"/>` : `<circle cx="${n(x)}" cy="${n(y)}" r="2.8" fill="${cols[i % 5]}"/>`;
  }
  return s;
};

export const dog = (x, y, k, flip = false, mouthOpen = true, head = 0) => `<g transform="translate(${n(x)} ${n(y)}) scale(${flip ? -1 : 1} 1)">
  <path d="M-34 -22 Q-48 ${-34 + Math.sin(k * 2) * 6} -42 -44" fill="none" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>
  <ellipse cx="0" cy="-24" rx="30" ry="17" fill="#f3c98f" stroke="${INK}" stroke-width="3"/>
  ${[-18, -8, 12, 22].map((lx, i) => `<line x1="${lx}" y1="-12" x2="${lx + Math.sin(k * 1.6 + i * 1.6) * 9}" y2="0" stroke="${INK}" stroke-width="6" stroke-linecap="round"/><line x1="${lx}" y1="-12" x2="${lx + Math.sin(k * 1.6 + i * 1.6) * 9}" y2="0" stroke="#f3c98f" stroke-width="2.6" stroke-linecap="round"/>`).join('')}
  <g transform="translate(26 ${-38 + head})"><circle r="15" fill="#f3c98f" stroke="${INK}" stroke-width="3"/><path d="M-11 -10 q-10 4 -8 16 q8 -2 10 -10Z" fill="#c98e6a" stroke="${INK}" stroke-width="2.4" stroke-linejoin="round"/><circle cx="3" cy="-3" r="2.4" fill="${INK}"/><ellipse cx="14" cy="3" rx="6" ry="4.4" fill="#fff" stroke="${INK}" stroke-width="2.4"/><circle cx="17" cy="1.5" r="2" fill="${INK}"/>${mouthOpen ? `<path d="M9 9 Q15 14 20 9" fill="#ff8fb8" stroke="${INK}" stroke-width="2"/>` : ''}</g></g>`;

export const bed = (x, y) => `<g transform="translate(${x} ${y})"><rect x="0" y="-8" width="190" height="34" rx="6" fill="#ffd6e4" stroke="${INK}" stroke-width="3"/><rect x="0" y="-40" width="10" height="66" fill="#c98e6a" stroke="${INK}" stroke-width="3"/><rect x="180" y="-18" width="10" height="44" fill="#c98e6a" stroke="${INK}" stroke-width="3"/><rect x="14" y="-22" width="48" height="16" rx="8" fill="#fff" stroke="${INK}" stroke-width="3"/></g>`;

export const alarm = (x, y, ring, j = () => 0) => `<g transform="translate(${n(x + (ring ? j(3) : 0))} ${n(y + (ring ? j(2) : 0))})">
  <circle cx="-9" cy="-20" r="7" fill="#ffd166" stroke="${INK}" stroke-width="2.6"/><circle cx="9" cy="-20" r="7" fill="#ffd166" stroke="${INK}" stroke-width="2.6"/>
  ${circ(0, 0, 17, '#fff')}<path d="M0 -9 V0 L7 4" stroke="${INK}" stroke-width="2.8" fill="none" stroke-linecap="round"/>
  ${ring ? `<path d="M-24 -10 l-8 -4 M-24 0 l-10 0 M24 -10 l8 -4 M24 0 l10 0" stroke="#e8416f" stroke-width="3" stroke-linecap="round"/>` : ''}</g>`;

export const house = (x, y) => `<g transform="translate(${x} ${y})">
  <rect x="0" y="0" width="124" height="146" fill="#fff0f5" stroke="${INK}" stroke-width="3.2"/>
  <path d="M-10 4 L62 -46 L134 4Z" fill="#ff9ac2" stroke="${INK}" stroke-width="3.2" stroke-linejoin="round"/>
  <rect x="12" y="30" width="34" height="30" fill="#fff3b0" stroke="${INK}" stroke-width="3"/><path d="M29 30 v30 M12 45 h34" stroke="${INK}" stroke-width="2.4"/>
  <path d="M74 -30 l0 -16 l12 0 l0 22" fill="#c9a7ff" stroke="${INK}" stroke-width="2.6"/></g>`;

export const stars = (x, y, k) => [0, 1, 2].map((i) => star(x + Math.cos(k * 0.9 + i * 2.1) * 26, y + Math.sin(k * 0.9 + i * 2.1) * 9, 7)).join('');
export const sweatDrops = (x, y, k) => [0, 1].map((i) => `<path transform="translate(${n(x + i * 16 - 8)} ${n(y + ((k * 6 + i * 9) % 22))})" d="M0 -6 q5 7 0 9 q-5 -2 0 -9Z" fill="#8fd3ff" stroke="${INK}" stroke-width="1.8"/>`).join('');
export const steam = (x, y, k) => [0, 1, 2].map((i) => circ(x + (i - 1) * 10 + Math.sin(k + i) * 3, y - ((k * 7 + i * 12) % 36), 5 + (i % 2) * 2, '#fff', INK, 2)).join('');
export const zzz = (x, y, k) => [0, 1, 2].map((i) => `<text x="${n(x + i * 12 + ((k * 2) % 6))}" y="${n(y - i * 15 - ((k * 3) % 8))}" font-family="Caveat, cursive" font-weight="700" font-size="${16 + i * 5}" fill="${INK}" opacity="${n(0.5 + i * 0.25)}">z</text>`).join('');
export const speedLines = (x, y, k, len = 40) => [0, 1, 2].map((i) => line(x - len - ((k * 9 + i * 14) % 24), y - 18 + i * 18, x - 8 - ((k * 9 + i * 14) % 24), y - 18 + i * 18, '#8f98c6', 3)).join('');
export const rain = (k, count = 26) => Array.from({ length: count }, (_, i) => {
  const x = (i * 37 + 11) % 300, y = ((i * 53 + k * 34) % 320) + 40;
  return `<line x1="${x}" y1="${y}" x2="${x - 5}" y2="${y + 16}" stroke="#6aa8e8" stroke-width="3" stroke-linecap="round"/>`;
}).join('');
export const rainbow = (x, y, p) => ['#ff7aa6', '#ffd166', '#7fd6c2', '#a9c7ff'].map((c, i) => `<path d="M${x - 110 + i * 9} ${y} A${110 - i * 9} ${110 - i * 9} 0 0 1 ${x + 110 - i * 9} ${y}" fill="none" stroke="${c}" stroke-width="8" stroke-linecap="round" stroke-dasharray="${n(400 * p)} 400" opacity=".9"/>`).join('');
export const bananaPeel = (x, y) => `<g transform="translate(${x} ${y})"><path d="M-16 -2 Q-8 -14 4 -6 Q14 -12 18 -2 Q4 4 -16 -2Z" fill="#ffe27a" stroke="${INK}" stroke-width="2.6" stroke-linejoin="round"/><path d="M-12 -2 q-6 6 -10 2 M12 -2 q6 6 10 2" stroke="${INK}" stroke-width="2.4" fill="none" stroke-linecap="round"/></g>`;
export const crumple = (x, y, r = 0) => `<g transform="translate(${n(x)} ${n(y)}) rotate(${n(r)})"><circle r="9" fill="#fff" stroke="${INK}" stroke-width="2.6"/><path d="M-5 -3 l4 3 l-3 4 M2 -5 l3 4 M0 2 l5 1" stroke="${INK}" stroke-width="1.6" fill="none" stroke-linecap="round"/></g>`;
export const lettersOnSign = (x, y, w, h, lines, j = () => 0) => `<g transform="translate(${n(x + j(.6))} ${n(y + j(.6))})"><rect width="${w}" height="${h}" rx="3" fill="#ffe98a" stroke="${INK}" stroke-width="2.6"/>${lines.map((t, i) => `<text x="${w / 2}" y="${13 + i * 12}" text-anchor="middle" font-family="Caveat, cursive" font-weight="700" font-size="12" fill="${INK}">${t}</text>`).join('')}</g>`;
