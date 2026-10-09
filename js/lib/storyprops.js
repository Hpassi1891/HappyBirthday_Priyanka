// Props and set pieces for the love-story cartoon: the laptop, phones, the bike, restaurants, food.
// Pure functions returning SVG strings, drawn in a 300 x 300 picture (x 0..300, y 10..310).
import { INK, SW, n, line, circ, heart, star, person } from './storyart.js';

const f = (v) => n(v);
const rad = (d) => (d * Math.PI) / 180;

let gid = 0;
export const backdrop = (top, bottom) => { const id = 'bg' + (++gid % 1000); return `<defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${top}"/><stop offset="1" stop-color="${bottom}"/></linearGradient></defs><rect x="-80" y="0" width="460" height="330" fill="url(#${id})"/>`; };
export const floor = (y, color = '#e9c9a0') => `<rect x="-80" y="${f(y)}" width="460" height="${f(330 - y)}" fill="${color}"/><path d="M-80 ${f(y)} H380" stroke="${INK}" stroke-width="${SW}"/>`;

// ---------- chat bubbles and phone bits ----------
export function chatBubble(x, y, w, text, side = 'left', a = 1, sc = 1, fill = '#fff') {
  if (a <= 0.01) return '';
  const h = 28, own = side === 'right';
  return `<g transform="translate(${f(x)} ${f(y)}) scale(${f(sc)})" opacity="${f(Math.min(1, a))}"><rect x="${own ? -w : 0}" y="${-h / 2}" width="${w}" height="${h}" rx="14" fill="${own ? '#ffd1e3' : fill}" stroke="${INK}" stroke-width="2.6"/><text x="${own ? -w / 2 : w / 2}" y="6" text-anchor="middle" font-family="Caveat, cursive" font-weight="700" font-size="17" fill="${INK}">${text}</text></g>`;
}
export const typingDots = (x, y, t) => `<g transform="translate(${f(x)} ${f(y)})"><rect x="-22" y="-12" width="44" height="24" rx="12" fill="#fff" stroke="${INK}" stroke-width="2.6"/>${[-10, 0, 10].map((dx, i) => `<circle cx="${dx}" cy="${f(-Math.max(0, Math.sin(t * 9 - i * 1.1)) * 4)}" r="3" fill="${INK}"/>`).join('')}</g>`;

export const phone = (x, y, s = 1, rot = 0, glow = 0, screen = '#bfe3ff') => `<g transform="translate(${f(x)} ${f(y)}) rotate(${f(rot)}) scale(${s})">${glow > 0 ? `<circle r="${f(26 + glow * 12)}" fill="#fff3a8" opacity="${f(0.55 * glow)}"/>` : ''}<rect x="-9" y="-16" width="18" height="32" rx="4" fill="#2b2b33" stroke="${INK}" stroke-width="2.4"/><rect x="-6.5" y="-12.5" width="13" height="25" rx="2" fill="${screen}"/></g>`;
export const battery = (x, y, pct) => {
  const col = pct < 20 ? '#e8416f' : pct < 50 ? '#ffd166' : '#7fd6c2';
  return `<g transform="translate(${f(x)} ${f(y)})"><rect x="-16" y="-8" width="32" height="16" rx="3" fill="#fff" stroke="${INK}" stroke-width="2.4"/><rect x="16" y="-3" width="3" height="6" fill="${INK}"/><rect x="-13" y="-5" width="${f(26 * Math.max(0.04, pct / 100))}" height="10" rx="1.5" fill="${col}"/></g>`;
};
export const clockFace = (x, y, r, minuteAngle, hourAngle) => `<g transform="translate(${f(x)} ${f(y)})">${circ(0, 0, r, '#fff')}${[0, 90, 180, 270].map((a) => `<line x1="0" y1="${-r + 3}" x2="0" y2="${-r + 7}" stroke="${INK}" stroke-width="2" transform="rotate(${a})"/>`).join('')}<line x1="0" y1="0" x2="0" y2="${-r * 0.5}" stroke="${INK}" stroke-width="3" stroke-linecap="round" transform="rotate(${f(hourAngle)})"/><line x1="0" y1="0" x2="0" y2="${-r * 0.78}" stroke="#e8416f" stroke-width="2.4" stroke-linecap="round" transform="rotate(${f(minuteAngle)})"/>${circ(0, 0, 2.4, INK, INK, 1)}</g>`;

// ---------- Rakshas's room ----------
export const windowNight = (x, y, w, h, t = 0) => `<g transform="translate(${f(x)} ${f(y)})"><rect width="${w}" height="${h}" fill="#1d2760" stroke="${INK}" stroke-width="3.2"/>${[[12, 14], [40, 30], [58, 12], [26, 52]].map(([sx, sy], i) => star(sx, sy, 3 + (i % 2) * 1.5 + Math.sin(t * 2 + i) * 0.8, '#fff3b0')).join('')}<circle cx="${w - 22}" cy="22" r="11" fill="#fff3d6"/><circle cx="${w - 17}" cy="19" r="9" fill="#1d2760"/><path d="M${w / 2} 0 V${h} M0 ${h / 2} H${w}" stroke="${INK}" stroke-width="2.4"/></g>`;
export const mug = (x, y, t) => `<g transform="translate(${f(x)} ${f(y)})"><rect x="-10" y="-16" width="20" height="16" rx="3" fill="#fff" stroke="${INK}" stroke-width="2.6"/><path d="M10 -12 q8 2 0 9" fill="none" stroke="${INK}" stroke-width="2.6"/>${[0, 1].map((i) => `<path d="M${-4 + i * 8} -20 q-4 -6 0 -12 q4 -6 0 -12" fill="none" stroke="#c3cbe6" stroke-width="2.4" stroke-linecap="round" opacity="${f(0.8 - ((t * 0.5 + i * 0.4) % 1) * 0.6)}" transform="translate(0 ${f(-((t * 8 + i * 6) % 10))})"/>`).join('')}</g>`;
// the back of a laptop lid, seen from across the desk, with a glowing logo
export const laptopBack = (x, y, glow = 1) => `<g transform="translate(${f(x)} ${f(y)})"><ellipse cx="0" cy="-8" rx="56" ry="38" fill="#8fd3ff" opacity="${f(0.28 * glow)}"/><rect x="-33" y="-46" width="66" height="44" rx="4" fill="#cfd6e8" stroke="${INK}" stroke-width="3"/><path transform="translate(0 -24) scale(.8)" d="M0 8 C-14 -2 -9 -14 0 -6 C9 -14 14 -2 0 8Z" fill="#fff" opacity="${f(0.55 + glow * 0.4)}"/><rect x="-40" y="-4" width="80" height="6" rx="3" fill="#aab4d2" stroke="${INK}" stroke-width="2.6"/></g>`;
export const desk = (y) => `<rect x="-20" y="${f(y)}" width="370" height="11" fill="#e0a77a" stroke="${INK}" stroke-width="3"/><rect x="-16" y="${f(y + 11)}" width="362" height="${f(330 - y)}" fill="#cf8f62" stroke="${INK}" stroke-width="3"/><rect x="60" y="${f(y + 24)}" width="70" height="30" rx="4" fill="#e0a77a" stroke="${INK}" stroke-width="2.6"/><circle cx="95" cy="${f(y + 39)}" r="3.4" fill="#ffe27a" stroke="${INK}" stroke-width="2"/>`;

// ---------- the bike: black Meteor 350, side view facing right. Origin: where the tyres touch the road ----------
export function bike(wheel = 0, o = {}) {
  const { glow = 0.4 } = o;
  const w = (cx) => `<g transform="translate(${cx} -22)">${circ(0, 0, 22, '#fff0', '#1b1b22', 7)}${circ(0, 0, 16.5, '#fff0', '#cfd6e8', 1.6)}${[0, 1, 2, 3, 4, 5].map((i) => `<line x1="0" y1="-16" x2="0" y2="16" stroke="#aab4d2" stroke-width="1.6" transform="rotate(${f(wheel + i * 30)})"/>`).join('')}${circ(0, 0, 4, '#cfd6e8', INK, 2)}</g>`;
  return `<g>
  <path d="M60 -62 L${f(140 * 0.5 + 18)} -62" stroke="none"/>
  ${glow > 0 ? `<path d="M56 -62 L${f(150 + glow * 40)} -92 L${f(150 + glow * 40)} -34Z" fill="#ffe27a" opacity="${f(glow * 0.35)}"/>` : ''}
  ${w(-46)}${w(46)}
  <path d="M-72 -34 Q-60 -56 -28 -50" fill="none" stroke="#1b1b22" stroke-width="8" stroke-linecap="round"/>
  <path d="M-48 -26 L-18 -20 L16 -22 L-8 -50Z" fill="#33364a" stroke="${INK}" stroke-width="2.6" stroke-linejoin="round"/>
  <rect x="-8" y="-44" width="30" height="22" rx="3" fill="#4a4f66" stroke="${INK}" stroke-width="2.6"/>
  ${[0, 1, 2, 3].map((i) => `<line x1="${-4 + i * 7}" y1="-44" x2="${-4 + i * 7}" y2="-34" stroke="#cfd6e8" stroke-width="2"/>`).join('')}
  <path d="M-40 -26 Q-60 -22 -76 -16 L-78 -22 Q-60 -28 -40 -33Z" fill="#cfd6e8" stroke="${INK}" stroke-width="2.4" stroke-linejoin="round"/>
  <path d="M46 -22 L36 -66" stroke="#1b1b22" stroke-width="7" stroke-linecap="round"/><path d="M46 -22 L36 -66" stroke="#cfd6e8" stroke-width="3" stroke-linecap="round"/>
  <path d="M-4 -60 Q6 -80 40 -66 L38 -50 L-2 -48Z" fill="#1d1e26" stroke="${INK}" stroke-width="2.8" stroke-linejoin="round"/>
  <path d="M2 -66 Q14 -74 32 -68" fill="none" stroke="#cfd6e8" stroke-width="2.2" stroke-linecap="round" opacity=".85"/>
  <text x="19" y="-54" text-anchor="middle" font-family="Quicksand, sans-serif" font-weight="700" font-size="7" fill="#cfd6e8">METEOR 350</text>
  <rect x="-56" y="-58" width="48" height="8" rx="4" fill="#111" stroke="${INK}" stroke-width="2.4"/>
  <path d="M34 -72 L46 -78 M34 -72 L38 -64" stroke="#1b1b22" stroke-width="5" stroke-linecap="round"/>
  <circle cx="52" cy="-62" r="8" fill="#ffe27a" stroke="${INK}" stroke-width="2.6"/><circle cx="52" cy="-62" r="3.4" fill="#fff"/>
  <rect x="-74" y="-44" width="6" height="8" rx="2" fill="#ff5d7a" stroke="${INK}" stroke-width="2"/>
</g>`;
}
// Both of them on the bike. x,y = tyre contact point. `him`/`her` are extra person() options.
export function riders(x, y, s, t, o = {}) {
  const { wheel = t * 520, hop = 0, him = {}, her = {}, glow = 0.4 } = o;
  const hump = hop;
  return `<g transform="translate(${f(x)} ${f(y - hump)}) scale(${s})">
    ${bike(wheel, { glow })}
    ${person({ who: 'her', x: -22, y: -12, sit: true, shadow: false, rot: -2, armR: 8, armL: 14, expr: 'smile', ...her })}
    ${person({ who: 'him', x: 10, y: -12, sit: true, shadow: false, rot: 4, armR: 58, armL: 58, expr: 'grin', ...him })}
  </g>`;
}

// ---------- the road and the town ----------
export function road(y, scroll) {
  let s = `<rect x="-80" y="${f(y)}" width="460" height="${f(330 - y)}" fill="#8a8fa8"/><path d="M-80 ${f(y)} H380" stroke="${INK}" stroke-width="${SW}"/>`;
  for (let i = -1; i < 6; i++) s += `<rect x="${f(((i * 70 - scroll) % 420 + 420) % 420 - 60)}" y="${f(y + 26)}" width="36" height="5" rx="2" fill="#fff3d6"/>`;
  return s;
}
export function townStrip(y, scroll, tint = ['#b9a7e8', '#a3c8f0', '#f2b5c4']) {
  let s = '';
  for (let i = 0; i < 8; i++) {
    const x = ((i * 74 - scroll * 0.35) % 592 + 592) % 592 - 90, h = 50 + ((i * 37) % 46);
    s += `<g transform="translate(${f(x)} ${f(y - h)})"><rect width="58" height="${h}" fill="${tint[i % 3]}" stroke="${INK}" stroke-width="2.6"/>${[0, 1, 2].map((r) => `<rect x="9" y="${8 + r * 15}" width="9" height="9" fill="#fff3b0" stroke="${INK}" stroke-width="1.6"/><rect x="34" y="${8 + r * 15}" width="9" height="9" fill="#fff3b0" stroke="${INK}" stroke-width="1.6"/>`).join('')}</g>`;
  }
  return s;
}
export const lampPost = (x, y) => `<g transform="translate(${f(x)} ${f(y)})"><rect x="-3" y="-92" width="6" height="92" fill="#8f98c6" stroke="${INK}" stroke-width="2.4"/><path d="M-14 -92 L14 -92 L8 -104 L-8 -104Z" fill="#ffe98a" stroke="${INK}" stroke-width="2.4" stroke-linejoin="round"/></g>`;
export const treeSm = (x, y) => `<g transform="translate(${f(x)} ${f(y)})"><rect x="-5" y="-42" width="10" height="44" fill="#c98e6a" stroke="${INK}" stroke-width="2.6"/><circle cy="-56" r="22" fill="#9be3b0" stroke="${INK}" stroke-width="2.6"/><circle cx="-12" cy="-44" r="14" fill="#9be3b0" stroke="${INK}" stroke-width="2.6"/><circle cx="12" cy="-46" r="14" fill="#9be3b0" stroke="${INK}" stroke-width="2.6"/></g>`;

// ---------- restaurants ----------
export const stringLights = (t, y = 34) => {
  let s = `<path d="M-60 ${y} Q45 ${y + 22} 150 ${y} T360 ${y}" fill="none" stroke="${INK}" stroke-width="2"/>`;
  const cols = ['#ff7aa6', '#ffd166', '#7fd6c2', '#a9c7ff'];
  for (let i = 0; i < 12; i++) { const x = -48 + i * 36, yy = y + Math.sin((x / 300) * Math.PI * 2) * -4 + (i % 2 ? 11 : 8); s += `<circle cx="${x}" cy="${f(yy + 4)}" r="4.4" fill="${cols[i % 4]}" opacity="${f(0.65 + 0.35 * Math.sin(t * 3 + i))}" stroke="${INK}" stroke-width="1.4"/>`; }
  return s;
};
export const neonSign = (x, y, w, h, text, color, t = 9, size = 26) => {
  const on = t < 0.5 ? (Math.floor(t * 18) % 2 ? 1 : 0.4) : 1;
  return `<g transform="translate(${f(x)} ${f(y)})"><rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" rx="10" fill="#241a3a" stroke="${INK}" stroke-width="3"/><rect x="${-w / 2 + 5}" y="${-h / 2 + 5}" width="${w - 10}" height="${h - 10}" rx="7" fill="none" stroke="${color}" stroke-width="2.4" opacity="${f(on)}"/><text y="${f(size * 0.34)}" text-anchor="middle" font-family="Caveat, cursive" font-weight="700" font-size="${size}" fill="${color}" opacity="${f(on)}" style="filter:drop-shadow(0 0 4px ${color})">${text}</text></g>`;
};
export const fireIcon = (x, y, t, s = 1) => `<g transform="translate(${f(x)} ${f(y)}) scale(${s})"><path d="M0 -14 Q12 -2 8 8 Q4 14 0 14 Q-8 14 -8 4 Q-8 -4 -2 -8 Q-2 -2 2 -2 Q4 -8 0 -14Z" fill="#ff9d3b" stroke="${INK}" stroke-width="2" transform="scale(${f(1 + Math.sin(t * 9) * 0.06)} ${f(1 + Math.sin(t * 11) * 0.09)})"/><path d="M0 -2 Q5 4 2 9 Q-3 10 -3 5 Q-3 2 0 -2Z" fill="#ffe27a"/></g>`;
// a window onto the street, with the black Meteor parked outside
export const windowBike = (x, y, w, h, t = 0) => `<g transform="translate(${f(x)} ${f(y)})"><defs><clipPath id="wbc"><rect width="${w}" height="${h}"/></clipPath></defs><rect width="${w}" height="${h}" fill="#bfe3ff" stroke="${INK}" stroke-width="3.2"/><g clip-path="url(#wbc)"><rect y="${f(h * 0.72)}" width="${w}" height="${f(h * 0.3)}" fill="#8a8fa8"/><g transform="translate(${f(w * 0.52)} ${f(h * 0.8)}) scale(${f(w / 230)})">${bike(0, { glow: 0 })}</g></g><path d="M${w / 2} 0 V${h}" stroke="${INK}" stroke-width="2.4"/><path d="M0 ${h * 0.5} H${w}" stroke="${INK}" stroke-width="2"/></g>`;
export const table = (x, w, y, cloth = '#ffd1e3') => `<g><rect x="${f(x - w / 2)}" y="${f(y)}" width="${w}" height="9" rx="3" fill="${cloth}" stroke="${INK}" stroke-width="3"/><path d="M${f(x - w / 2 + 4)} ${f(y + 9)} h${w - 8} l-6 34 h${-(w - 20)}Z" fill="${cloth}" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/><path d="M${f(x - w / 2 + 14)} ${f(y + 18)} h${w - 28}" stroke="#fff" stroke-width="2.4" stroke-dasharray="6 6" opacity=".8"/></g>`;
export const plate = (x, y, w = 40) => `<g transform="translate(${f(x)} ${f(y)})"><ellipse rx="${w / 2}" ry="${f(w * 0.13)}" fill="#fff" stroke="${INK}" stroke-width="2.4"/><ellipse rx="${f(w * 0.32)}" ry="${f(w * 0.08)}" fill="#f1f3fb"/></g>`;
export const steamPuffs = (x, y, t, n3 = 3) => Array.from({ length: n3 }, (_, i) => { const p = ((t * 0.6 + i / n3) % 1); return circ(x + Math.sin(t * 3 + i * 2) * 4 + (i - 1) * 6, y - p * 30, 3 + p * 3, '#fff', INK, 1.6).replace('<circle', `<circle opacity="${f(0.9 - p)}"`); }).join('');

export const pizza = (x, y, r = 40, missing = 0) => {
  let s = `<g transform="translate(${f(x)} ${f(y)})"><ellipse cx="0" cy="${f(r * 0.1)}" rx="${f(r * 1.06)}" ry="${f(r * 0.4)}" fill="#c98e6a" stroke="${INK}" stroke-width="2.6"/><ellipse rx="${r}" ry="${f(r * 0.34)}" fill="#ffd166" stroke="${INK}" stroke-width="2.4"/>`;
  [[-0.5, -0.05], [0.1, -0.12], [0.55, 0.02], [-0.15, 0.12], [0.3, 0.14], [-0.62, 0.1]].forEach(([px, py]) => { s += circ(px * r, py * r, r * 0.11, '#e8416f', INK, 1.6); });
  [[-0.3, -0.1], [0.4, -0.08], [0.0, 0.05]].forEach(([px, py]) => { s += circ(px * r, py * r, r * 0.05, '#7fd6c2', 'none', 0); });
  for (let i = 0; i < 3; i++) s += `<line x1="0" y1="0" x2="${f(Math.cos(rad(i * 60 + 20)) * r)}" y2="${f(Math.sin(rad(i * 60 + 20)) * r * 0.34)}" stroke="${INK}" stroke-width="1.6" opacity=".7"/>`;
  if (missing > 0) s += `<path d="M0 0 L${f(r)} ${f(-r * 0.34 * 0.2)} A${r} ${f(r * 0.34)} 0 0 0 ${f(r * 0.5)} ${f(r * 0.3)}Z" fill="#f1f3fb" opacity="${f(Math.min(1, missing))}"/>`;
  return s + '</g>';
};
export const paneerBowl = (x, y, t) => `<g transform="translate(${f(x)} ${f(y)})"><path d="M-22 -8 Q-20 12 0 12 Q20 12 22 -8Z" fill="#fff" stroke="${INK}" stroke-width="2.6"/><ellipse cy="-8" rx="22" ry="6" fill="#e8754b" stroke="${INK}" stroke-width="2.4"/>${[[-12, -12], [-2, -14], [9, -12], [-6, -9], [4, -9], [14, -9]].map(([cx, cy], i) => `<rect x="${cx - 4}" y="${cy - 3}" width="8" height="7" rx="1.6" fill="#ffe9bd" stroke="${INK}" stroke-width="1.4" transform="rotate(${i * 25} ${cx} ${cy})"/>`).join('')}<path d="M-8 -16 l4 -3 M10 -15 l5 -2" stroke="#5bbf86" stroke-width="3" stroke-linecap="round"/>${steamPuffs(0, -18, t, 3)}</g>`;
export const fanta = (x, y, sip = 0) => `<g transform="translate(${f(x)} ${f(y)})"><rect x="-9" y="-30" width="18" height="30" rx="4" fill="#ff9d1c" stroke="${INK}" stroke-width="2.6"/><path d="M-9 -16 q4.5 -5 9 0 t9 0" fill="none" stroke="#fff" stroke-width="2.2"/><text y="-21" text-anchor="middle" font-family="Quicksand, sans-serif" font-weight="700" font-size="5.6" fill="#fff">FANTA</text><path d="M3 -30 L${f(10 + sip * 2)} ${f(-48)}" stroke="#e8416f" stroke-width="3" stroke-linecap="round"/></g>`;
export const donut = (x, y, r = 11, frost = '#ff9ac2', rot = 0, bite = 0) => `<g transform="translate(${f(x)} ${f(y)}) rotate(${f(rot)})"><circle r="${r}" fill="#e6b073" stroke="${INK}" stroke-width="2.2"/><circle r="${f(r * 0.86)}" fill="${frost}"/><circle r="${f(r * 0.32)}" fill="#fff" stroke="${INK}" stroke-width="1.6"/>${[[-5, -5, 20], [4, -6, 70], [6, 3, 120], [-6, 4, 160], [0, 8, 10]].map(([sx, sy, a]) => `<rect x="${f(sx * r / 11 - 2)}" y="${f(sy * r / 11 - 0.8)}" width="4" height="1.6" rx=".8" fill="${['#fff', '#ffd166', '#7fd6c2'][a % 3]}" transform="rotate(${a} ${f(sx * r / 11)} ${f(sy * r / 11)})"/>`).join('')}${bite > 0 ? `<circle cx="${f(r * 0.95)}" cy="${f(-r * 0.2)}" r="${f(r * 0.5 * bite)}" fill="#fff"/>` : ''}</g>`;
export const donutBox = (x, y) => `<g transform="translate(${f(x)} ${f(y)})"><rect x="-30" y="-6" width="60" height="16" rx="3" fill="#ffc2d9" stroke="${INK}" stroke-width="2.6"/>${donut(-14, -9, 9, '#ff9ac2')}${donut(5, -10, 9, '#a9c7ff')}${donut(22, -8, 8, '#ffd166')}</g>`;
export const cakeSlice = (x, y, s = 1, rot = 0, bite = 0) => `<g transform="translate(${f(x)} ${f(y)}) rotate(${f(rot)}) scale(${f(s)})"><path d="M-16 6 L16 6 L14 -14 L-14 -14Z" fill="#ffd1e3" stroke="${INK}" stroke-width="2.4" stroke-linejoin="round"/><path d="M-15 -4 H15 M-14.6 -9 H14.6" stroke="#fff" stroke-width="3"/><path d="M-14 -14 Q0 -22 14 -14" fill="#fff" stroke="${INK}" stroke-width="2.2"/><circle cy="-19" r="4" fill="#e8416f" stroke="${INK}" stroke-width="1.8"/>${bite > 0 ? `<circle cx="${f(14 - bite * 4)}" cy="-6" r="${f(8 * bite)}" fill="#fffaf2"/>` : ''}</g>`;
export const baskinSign = (x, y, t) => `<g transform="translate(${f(x)} ${f(y)})"><rect x="-70" y="-24" width="140" height="48" rx="10" fill="#ff8fb8" stroke="${INK}" stroke-width="3"/><text y="-2" text-anchor="middle" font-family="Caveat, cursive" font-weight="700" font-size="24" fill="#fff" stroke="#2f6fe0" stroke-width="1" paint-order="stroke">BASKIN</text><text y="17" text-anchor="middle" font-family="Caveat, cursive" font-weight="700" font-size="22" fill="#fff" stroke="#2f6fe0" stroke-width="1" paint-order="stroke">ROBBINS</text>${circ(58, -18, 9 + Math.sin(t * 4) * 0.6, '#a9c7ff', INK, 2)}<text x="58" y="-14.4" text-anchor="middle" font-family="Quicksand, sans-serif" font-weight="700" font-size="9" fill="${INK}">31</text></g>`;
export const donutSign = (x, y, t) => `<g transform="translate(${f(x)} ${f(y)})"><rect x="-88" y="-22" width="176" height="44" rx="22" fill="#fff3b0" stroke="${INK}" stroke-width="3"/><text x="14" y="7" text-anchor="middle" font-family="Caveat, cursive" font-weight="700" font-size="24" fill="#e8416f">SUPER DONUTS</text>${donut(-66, 0, 13, '#ff9ac2', t * 40)}</g>`;
export const starbucksSign = (x, y, t) => `<g transform="translate(${f(x)} ${f(y)})"><circle r="30" fill="#1e8f5a" stroke="${INK}" stroke-width="3"/><circle r="22" fill="none" stroke="#fff" stroke-width="2" stroke-dasharray="3 3" transform="rotate(${f(t * 20)})"/><text y="3" text-anchor="middle" font-family="Quicksand, sans-serif" font-weight="700" font-size="9" fill="#fff">STARBUCKS</text><text y="14" text-anchor="middle" font-family="Quicksand, sans-serif" font-weight="700" font-size="7" fill="#d8f5e4">COFFEE</text></g>`;
export const coffeeCup = (x, y, t, s = 1) => `<g transform="translate(${f(x)} ${f(y)}) scale(${s})"><path d="M-9 -22 L9 -22 L7 0 L-7 0Z" fill="#fff" stroke="${INK}" stroke-width="2.4" stroke-linejoin="round"/><rect x="-8" y="-15" width="16" height="8" fill="#1e8f5a"/><rect x="-10" y="-25" width="20" height="4" rx="2" fill="#fff" stroke="${INK}" stroke-width="2"/>${steamPuffs(0, -28, t, 3)}</g>`;
export const stinkLines = (x, y, t) => [0, 1, 2].map((i) => `<path d="M${f(x + (i - 1) * 12)} ${f(y)} q-5 -7 0 -14 q5 -7 0 -14" fill="none" stroke="#6bbf86" stroke-width="3" stroke-linecap="round" opacity="${f(0.5 + Math.sin(t * 5 + i) * 0.3)}" transform="translate(0 ${f(Math.sin(t * 4 + i) * 3)})"/>`).join('');
export const jacket = (x, y, s = 1, rot = 0) => `<g transform="translate(${f(x)} ${f(y)}) rotate(${f(rot)}) scale(${f(s)})"><path d="M-16 -14 Q0 -22 16 -14 L22 8 L12 10 L10 26 L-10 26 L-12 10 L-22 8Z" fill="#33364a" stroke="${INK}" stroke-width="2.6" stroke-linejoin="round"/><path d="M0 -17 V26" stroke="#cfd6e8" stroke-width="2"/></g>`;
export const bottle = (x, y, rot = 0) => `<g transform="translate(${f(x)} ${f(y)}) rotate(${f(rot)})"><rect x="-6" y="-14" width="12" height="26" rx="4" fill="#bfe3ff" stroke="${INK}" stroke-width="2.4"/><rect x="-3" y="-20" width="6" height="7" rx="1.6" fill="#fff" stroke="${INK}" stroke-width="2"/></g>`;
export const choco = (x, y, rot = 0) => `<g transform="translate(${f(x)} ${f(y)}) rotate(${f(rot)})"><rect x="-13" y="-8" width="26" height="16" rx="3" fill="#a56a45" stroke="${INK}" stroke-width="2.4"/><path d="M-4 -8 V8 M5 -8 V8 M-13 0 H13" stroke="#7a4a2d" stroke-width="1.6"/><rect x="-13" y="-8" width="9" height="16" fill="#ff9ac2" opacity=".9"/></g>`;
export const thumb = (x, y, rot = 0, press = 0) => `<g transform="translate(${f(x)} ${f(y)}) rotate(${f(rot)}) scale(${f(1 - press * 0.08)})"><path d="M-14 60 Q-16 20 -10 6 Q-6 -8 4 -8 Q14 -6 12 8 Q16 20 14 60Z" fill="#ffd9b8" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/><path d="M-4 -2 q3 -3 6 0" stroke="#f2b88f" stroke-width="2" fill="none" stroke-linecap="round"/></g>`;
export const lightning = (x, y, s = 1) => `<path transform="translate(${f(x)} ${f(y)}) scale(${f(s)})" d="M6 -40 L-12 4 L0 4 L-8 40 L16 -8 L2 -8Z" fill="#ffe27a" stroke="${INK}" stroke-width="2.6" stroke-linejoin="round"/>`;
export const floatHearts = (x, y, t, count = 4, spread = 40) => Array.from({ length: count }, (_, i) => { const p = (t * 0.55 + i / count) % 1; return heart(x + Math.sin(t * 2 + i * 2.3) * spread * 0.5 + (i - count / 2) * spread / count, y - p * 70, 0.8 + (i % 2) * 0.3, i % 2 ? '#ff7aa6' : '#e8416f').replace('<path', `<path opacity="${f(Math.sin(p * Math.PI))}"`); }).join('');
