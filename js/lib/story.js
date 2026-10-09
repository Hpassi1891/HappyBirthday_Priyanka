// The love story, as a smooth cartoon: "Rakshas & Chudail". Fourteen shots, each drawn procedurally from a
// time in seconds (so motion is continuous: nothing is stepped or frame-counted).
// Each shot is { id, dur, caption, sfx: { seconds: soundName }, draw(t, p) } where t is seconds into the shot.
import { jitter, person, bubble, confetti, heart, star, speedLines, sweatDrops, steam } from './storyart.js';
import {
  backdrop, floor, chatBubble, typingDots, phone, battery, clockFace, windowNight, mug, laptopBack, desk, bike, riders, road, townStrip, lampPost, treeSm,
  stringLights, neonSign, fireIcon, windowBike, table, plate, steamPuffs, pizza, paneerBowl, fanta, donut, donutBox, cakeSlice, baskinSign, donutSign,
  starbucksSign, coffeeCup, stinkLines, jacket, choco, thumb, lightning, floatHearts,
} from './storyprops.js';

const INK = '#3c4a85';
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const sm = (t) => t * t * (3 - 2 * t);
const sp = (t, a, b) => sm(clamp((t - a) / (b - a)));          // smooth 0..1 between two moments
const win = (t, a, b, fade = 0.25) => Math.min(sp(t, a, a + fade), 1 - sp(t, b - fade, b)); // 0..1..0 envelope
const osc = (t, hz, amp = 1, ph = 0) => Math.sin(t * hz * Math.PI * 2 + ph) * amp;
const blinkAt = (t, off = 0) => ((t + off) % 3.3) < 0.13;
const easeOutBack = (p) => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(p - 1, 3) + c1 * Math.pow(p - 1, 2); };
const NJ = () => 0;
const mixc = (a, b, p) => { const h = (s) => [1, 3, 5].map((i) => parseInt(s.slice(i, i + 2), 16)); const A = h(a), B = h(b); return '#' + A.map((v, i) => Math.round(lerp(v, B[i], p)).toString(16).padStart(2, '0')).join(''); };
const handPos = (x, y, arm, side = 1, s = 1) => [x + (side * 13 + Math.sin((arm * Math.PI) / 180) * 30) * s, y - 70 * s + Math.cos((arm * Math.PI) / 180) * 30 * s];

// a speech bubble that pops in at a and out at b
function say(t, a, b, x, y, w, h, lines, dir = 'down', size = 18, fill = '#fff') {
  const p = win(t, a, b, 0.22);
  if (p <= 0.01) return '';
  const sc = p < 1 ? easeOutBack(p) : 1;
  const cx = x + w / 2, cy = y + h;
  return `<g transform="translate(${cx} ${cy}) scale(${sc.toFixed(3)}) translate(${-cx} ${-cy})" opacity="${Math.min(1, p * 3).toFixed(2)}">${bubble(x, y, w, h, lines, dir, NJ, size, fill)}</g>`;
}
const pop = (str, cx, cy, p) => (p <= 0.01 ? '' : `<g transform="translate(${cx} ${cy}) scale(${easeOutBack(clamp(p)).toFixed(3)}) translate(${-cx} ${-cy})" opacity="${Math.min(1, p * 4).toFixed(2)}">${str}</g>`);

// a tiny version of Chudail's face for chat avatars and the profile picture
const avatar = (x, y, r = 16) => `<g transform="translate(${x} ${y}) scale(${r / 23})"><circle cx="0" cy="-26" r="9" fill="#2e2233" stroke="${INK}" stroke-width="2.8"/><circle r="23" fill="#ffd9b8" stroke="${INK}" stroke-width="3"/><path d="M-22 -2 Q-22 -26 0 -24 Q22 -26 22 -2 Q16 -15 4 -15 Q-12 -13 -22 -2Z" fill="#2e2233" stroke="${INK}" stroke-width="2.4"/><circle cx="-8" cy="1" r="7" fill="#fff6" stroke="${INK}" stroke-width="2"/><circle cx="8" cy="1" r="7" fill="#fff6" stroke="${INK}" stroke-width="2"/><circle cx="-8" cy="1" r="2.4" fill="${INK}"/><circle cx="8" cy="1" r="2.4" fill="${INK}"/><path d="M-6 11 q6 5 12 0" stroke="${INK}" stroke-width="2.6" fill="none" stroke-linecap="round"/></g>`;

export const SHOTS = [
  // 1 ─ Rakshas, working late on his laptop, until his phone buzzes
  {
    id: 'laptop', dur: 6.4,
    caption: 'Rakshas, raat ko laptop pe kaam kar raha tha 💻',
    sfx: { 0.3: 'type', 0.9: 'type', 1.5: 'type', 2.1: 'type', 2.7: 'type', 3.0: 'buzz', 3.45: 'buzz', 4.9: 'gasp' },
    draw(t) {
      const buzzing = t > 3.0 && t < 4.0;
      const lift = sp(t, 4.0, 4.9), a = lerp(38, 122, lift);
      const typing = t < 4.0;
      const hx = 150, hy = 272;
      const hand = handPos(hx, hy, a, 1, 1);
      const phx = lerp(192 + (buzzing ? osc(t, 14, 1.4) : 0), hand[0] + 8, lift), phy = lerp(236, hand[1] - 10, lift);
      const expr = t < 2.9 ? 'think' : t < 4.9 ? 'shock' : 'stare';
      let s = backdrop('#ffe3cc', '#ffcfae') + windowNight(22, 44, 92, 84, t) + clockFace(238, 72, 22, t * 60 + 200, 322);
      s += `<rect x="150" y="104" width="80" height="2" fill="none"/>`;
      s += person({ x: hx, y: hy, bob: typing ? osc(t, 1.5, 1.5) : 0, tilt: typing ? osc(t, 0.5, 3) : 0, armL: typing ? 42 + osc(t, 5, 6) : 42, armR: typing ? -42 + osc(t, 4.3, 6, 1) : a, expr, blink: blinkAt(t), j: NJ });
      s += laptopBack(hx, 244, 0.9 + osc(t, 0.8, 0.1)) + desk(240) + mug(82, 238, t);
      if (lift < 0.02) {
        s += phone(phx, phy, 1.1, buzzing ? osc(t, 10, 4) : 0, buzzing ? 0.6 + 0.4 * Math.sin(t * 20) : 0, '#8fd3ff');
        if (buzzing) s += `<text x="${phx + 22}" y="${phy - 10}" font-family="Caveat, cursive" font-weight="700" font-size="20" fill="#e8416f" transform="rotate(${osc(t, 12, 6)} ${phx + 22} ${phy - 10})">bzzz!</text>`;
      } else s += phone(phx, phy, 1.1 + lift * 0.5, lerp(0, -12, lift), 0.4 * lift, '#8fd3ff');
      s += say(t, 0.3, 2.7, 160, 62, 128, 38, ['kaam kaam kaam…'], 'down', 18);
      s += say(t, 4.4, 6.4, 18, 150, 110, 40, ['ye kaun hai…?'], 'right', 20);
      return s;
    },
  },
  // 2 ─ the Insta profile, the Follow button, the panic
  {
    id: 'insta', dur: 5.8,
    caption: 'Phone uthaya… Insta pe Chudail dikhi. Follow request bhej di! 🙈',
    sfx: { 0.5: 'whoosh', 2.45: 'tap', 2.6: 'notify', 3.0: 'gasp' },
    draw(t) {
      const slide = (1 - sp(t, 0, 0.9)) * 320;
      const requested = t > 2.55;
      const press = win(t, 2.3, 2.75, 0.12);
      const thx = t < 1.8 ? lerp(240, 168, sp(t, 0.8, 1.8)) : t < 2.4 ? 168 + osc(t, 3, 3) : lerp(168, 240, sp(t, 2.8, 3.5));
      const thy = t < 1.8 ? lerp(360, 214, sp(t, 0.8, 1.8)) : t < 2.45 ? lerp(214, 196, sp(t, 2.0, 2.45)) : lerp(196, 360, sp(t, 2.8, 3.5));
      let s = backdrop('#ffe6f1', '#f5d6ff') + `<g transform="translate(0 ${slide.toFixed(1)})"><g transform="translate(84 70) scale(.83) translate(-70 -22)">`;
      s += `<rect x="70" y="22" width="160" height="282" rx="24" fill="#2b2b33" stroke="${INK}" stroke-width="4"/><rect x="78" y="34" width="144" height="258" rx="14" fill="#fff"/>`;
      s += `<text x="150" y="56" text-anchor="middle" font-family="Caveat, cursive" font-weight="700" font-size="26" fill="#d6457f">insta</text>${heart(204, 50, 0.9, '#e8416f')}`;
      s += `<circle cx="112" cy="100" r="30" fill="none" stroke="#ff7aa6" stroke-width="3"/>${avatar(112, 102, 24)}`;
      s += [['12', 'posts', 160], ['312', 'followers', 188], ['148', 'following', 214]].map(([v, l, x]) => `<text x="${x}" y="98" text-anchor="middle" font-family="Quicksand, sans-serif" font-weight="700" font-size="11" fill="${INK}">${v}</text><text x="${x}" y="108" text-anchor="middle" font-family="Quicksand, sans-serif" font-size="5.6" fill="#8f98c6">${l}</text>`).join('');
      s += `<text x="88" y="146" font-family="Quicksand, sans-serif" font-weight="700" font-size="11" fill="${INK}">chudail</text><text x="88" y="158" font-family="Quicksand, sans-serif" font-size="8" fill="#8f98c6">future bank officer 🏦</text>`;
      s += `<g transform="translate(150 178) scale(${(1 - press * 0.07).toFixed(3)}) translate(-150 -178)"><rect x="88" y="166" width="124" height="24" rx="7" fill="${requested ? '#e6e8f2' : '#3897f0'}"/><text x="150" y="182.5" text-anchor="middle" font-family="Quicksand, sans-serif" font-weight="700" font-size="11" fill="${requested ? INK : '#fff'}">${requested ? 'Requested' : 'Follow'}</text></g>`;
      const cols = ['#ffd1e3', '#bfe3ff', '#fff3b0', '#d9c9ff', '#c9f0d9', '#ffe0c2', '#ffc2d9', '#bfe3ff', '#fff3b0'];
      for (let i = 0; i < 9; i++) s += `<rect x="${82 + (i % 3) * 47}" y="${204 + Math.floor(i / 3) * 29}" width="45" height="27" fill="${cols[i]}"/>`;
      s += `<path d="M104 216 q3 -4 6 0 q3 -4 6 0 q0 5 -6 9 q-6 -4 -6 -9Z" fill="#e8416f"/>${star(150, 218, 5, '#ffd166')}<rect x="190" y="212" width="12" height="10" fill="#fff" stroke="${INK}" stroke-width="1.6"/>`;
      s += `</g></g>`;
      if (t > 2.4 && t < 3.4) { const p = (t - 2.4) / 1; s += `<circle cx="147" cy="${(173 * 0.83 + 70 - 22 * 0.83 + 2).toFixed(1)}" r="${(8 + p * 40).toFixed(1)}" fill="none" stroke="#3897f0" stroke-width="3" opacity="${(1 - p).toFixed(2)}"/>`; }
      s += thumb(thx, thy, -8, press);
      s += person({ x: 38, y: 306, s: 0.8, expr: t < 2.6 ? 'think' : 'shock', tilt: t < 2.6 ? 8 : osc(t, 8, 3), blink: blinkAt(t), j: NJ });
      if (t >= 2.7) s += sweatDrops(38, 306 - 100 * 0.8, t * 1.5);
      s += say(t, 1.0, 2.4, 14, 12, 150, 38, ['bhej doon…? 🤔'], 'down', 19);
      s += say(t, 3.0, 5.8, 96, 8, 190, 58, ['MAINE KYA', 'KAR DIYA?!'], 'down', 24, '#fffbe0');
      return s;
    },
  },
  // 3 ─ next day: accepted!
  {
    id: 'accept', dur: 5.0,
    caption: 'Agle din… Chudail ne request accept kar li!! 🥳',
    sfx: { 0.4: 'whoosh', 1.7: 'buzz', 2.05: 'notify', 2.7: 'cheer', 3.2: 'sparkle' },
    draw(t) {
      const day = sp(t, 0.2, 1.6);
      let s = backdrop(mixc('#1d2760', '#ffe3a8', day), mixc('#3d2f78', '#ffd0b0', day));
      s += `<circle cx="${(240 - day * 10).toFixed(1)}" cy="${(210 - day * 120).toFixed(1)}" r="26" fill="#ffe98a" stroke="${INK}" stroke-width="3"/>`;
      s += `<circle cx="${(60 + day * 30).toFixed(1)}" cy="${(70 + day * 90).toFixed(1)}" r="12" fill="#fff3d6" opacity="${(1 - day).toFixed(2)}"/>`;
      s += floor(270, mixc('#3a3a6a', '#f2cfa6', day));
      s += `<text x="150" y="100" text-anchor="middle" font-family="Caveat, cursive" font-weight="700" font-size="46" fill="${mixc('#fff3d6', '#d6457f', day)}" opacity="${win(t, 0.1, 1.9, 0.4).toFixed(2)}">agle din…</text>`;
      const react = t > 2.6, jumpT = Math.max(0, t - 2.7);
      const bob = react ? -Math.abs(osc(jumpT, 1.6, 28)) : 0;
      const armUp = react ? 160 + osc(jumpT, 3.2, 14) : 150;
      s += person({ x: 150, y: 288, bob, armL: react ? -armUp : -20, armR: react ? armUp : 152, expr: t < 2.0 ? 'sleep' : react ? 'grin' : 'shock', blink: !react && blinkAt(t), legL: react ? osc(jumpT, 1.6, 10) : 0, legR: react ? -osc(jumpT, 1.6, 10) : 0, j: NJ });
      if (!react && t > 0.9) { const h = handPos(150, 288, 152, 1, 1); s += phone(h[0] + 8, h[1] - 8, 1.25, -10, win(t, 1.6, 3.0, 0.1) * Math.abs(Math.sin(t * 18)), '#8fd3ff'); }
      const bp = sp(t, 2.0, 2.4) * (1 - sp(t, 4.4, 4.9));
      if (bp > 0.01) s += `<g transform="translate(0 ${((1 - bp) * -70).toFixed(1)})" opacity="${bp.toFixed(2)}"><rect x="22" y="22" width="256" height="54" rx="16" fill="#fff" stroke="${INK}" stroke-width="3"/>${avatar(52, 50, 17)}<text x="78" y="44" font-family="Quicksand, sans-serif" font-weight="700" font-size="13" fill="${INK}">chudail</text><text x="78" y="62" font-family="Quicksand, sans-serif" font-size="11.5" fill="${INK}">accepted your follow request</text>${heart(256, 50, 1, '#e8416f')}</g>`;
      if (react) s += confetti(150, 160, clamp(jumpT / 1.6), 30, NJ) + say(t, 3.0, 5.0, 36, 86, 228, 44, ['ACCEPT KAR LIYA!!'], 'down', 26, '#fffbe0');
      return s;
    },
  },
  // 4 ─ chatting every day, for hours
  {
    id: 'chat', dur: 6.0,
    caption: 'Phir roz ki baatein… ghanton tak 📱💬',
    sfx: { 0.4: 'tap', 1.0: 'notify', 1.6: 'tap', 2.2: 'notify', 2.8: 'tap', 3.4: 'notify', 4.0: 'tap', 4.6: 'notify', 5.2: 'gasp' },
    draw(t) {
      const cyc = (Math.sin((t / 6.0) * Math.PI * 2 - Math.PI / 2) + 1) / 2;   // night -> day -> night
      let s = backdrop(mixc('#1d2760', '#bfe3ff', Math.sin(t / 6 * Math.PI) ), mixc('#3d2f78', '#ffe9c2', Math.sin(t / 6 * Math.PI)));
      s += floor(272, mixc('#2a2f6b', '#f2cfa6', Math.sin(t / 6 * Math.PI)));
      s += clockFace(150, 44, 24, t * 720, t * 60) + `<text x="150" y="88" text-anchor="middle" font-family="Caveat, cursive" font-weight="700" font-size="16" fill="${cyc > 0.5 ? INK : '#fff3d6'}">ghante guzar gaye…</text>`;
      const msgs = [['him', 'hi chudail'], ['her', 'hi rakshas'], ['him', 'khana khaya?'], ['her', 'haan, tune?'], ['him', 'tera wait tha'], ['her', 'bhodam!'], ['him', 'good night?'], ['her', 'abhi nahi…']];
      const ts = msgs.map((_, i) => 0.5 + i * 0.62);
      const pr = ts.map((a) => sp(t, a, a + 0.32));
      msgs.forEach(([who, tx], i) => {
        let y = 250 - 0;
        for (let j = i + 1; j < msgs.length; j++) y -= pr[j] * 34;
        if (y < 100) return;
        s += chatBubble(who === 'him' ? 74 : 226, y, 100, tx, who === 'him' ? 'left' : 'right', pr[i] * clamp((y - 100) / 30), 0.7 + 0.3 * pr[i], '#fff');
      });
      const m1 = Math.floor(t / 1.4) % 2;
      s += person({ x: 38, y: 276, s: 0.82, tilt: osc(t, 0.6, 5), armR: 118, armL: -20, expr: t > 5.2 ? 'sleep' : m1 ? 'grin' : 'blush', blink: blinkAt(t), j: NJ });
      s += person({ who: 'her', x: 262, y: 276, s: 0.82, tilt: osc(t, 0.6, 5, 2), armL: -118, armR: 20, expr: t > 5.2 ? 'sleep' : m1 ? 'smirk' : 'grin', blink: blinkAt(t, 1), j: NJ });
      const hh = handPos(38, 276, 118, 1, 0.82), hl = handPos(262, 276, -118, -1, 0.82);
      s += phone(hh[0] + 4, hh[1] - 8, 1, 12, 0.5) + phone(hl[0] - 4, hl[1] - 8, 1, -12, 0.5);
      const pct = Math.round(lerp(100, 2, sp(t, 0.5, 5.4)));
      s += battery(40, 130, pct) + `<text x="40" y="153" text-anchor="middle" font-family="Caveat, cursive" font-weight="700" font-size="17" fill="${pct < 20 ? '#e8416f' : INK}">${pct}%</text>`;
      return s;
    },
  },
  // 5 ─ he asks to meet; she says yes
  {
    id: 'ask', dur: 4.8,
    caption: 'Ek din maine poocha: milna hai? Usne haan bol diya!! 😳',
    sfx: { 0.6: 'tap', 1.0: 'notify', 2.7: 'notify', 3.0: 'cheer', 3.4: 'sparkle' },
    draw(t) {
      let s = backdrop('#ffe3f0', '#ffd0e6') + floor(274, '#f3c9dc');
      const yes = t > 2.9, jt = Math.max(0, t - 3.0);
      s += person({ x: 78, y: 280, bob: yes ? -Math.abs(osc(jt, 1.5, 26)) : 0, tilt: yes ? 0 : 6, armL: yes ? -158 : -30, armR: yes ? 158 : 120, expr: yes ? 'grin' : t < 1.2 ? 'think' : 'sweat', blink: blinkAt(t), j: NJ });
      if (!yes) { const h = handPos(78, 280, 120, 1, 1); s += phone(h[0] + 4, h[1] - 8, 1.1, 14, 0.4); }
      s += person({ who: 'her', x: 226, y: 280, s: 0.94, armL: -120, armR: 20, tilt: -4, expr: t < 1.5 ? 'smile' : t < 2.7 ? 'think' : 'blush', blink: blinkAt(t, 1), j: NJ });
      const hl = handPos(226, 280, -120, -1, 0.94); s += phone(hl[0] - 4, hl[1] - 8, 1.1, -14, 0.4);
      const bp = sp(t, 0.9, 1.2);
      s += chatBubble(152, 120, 124, 'Milte hain? 🙈', 'right', bp, 0.8 + 0.2 * bp);
      if (t > 1.5 && t < 2.8) s += typingDots(188, 164, t);
      s += chatBubble(120, 164, 134, 'hmm… chal theek hai', 'left', sp(t, 2.8, 3.1), 0.8 + 0.2 * sp(t, 2.8, 3.1), '#fff');
      if (yes) s += floatHearts(152, 130, jt, 5, 120) + confetti(150, 150, clamp(jt / 1.5), 24, NJ);
      return s;
    },
  },
  // 6 ─ the black Meteor 350
  {
    id: 'ride', dur: 5.6,
    caption: 'Meri black Meteor 350 🏍️ — main aage, Chudail peeche',
    sfx: { 0.1: 'vroom', 2.5: 'bump', 3.0: 'thud', 3.2: 'hurr' },
    draw(t) {
      const sc = t * 230;
      let s = backdrop('#ffe9b8', '#ffd1c0') + `<circle cx="226" cy="84" r="30" fill="#fff3a8" stroke="${INK}" stroke-width="3"/>`;
      s += [0, 1, 2].map((i) => `<path transform="translate(${(((i * 160 - t * 22) % 480 + 480) % 480 - 60).toFixed(1)} ${40 + i * 24})" d="M-30 8 Q-40 8 -38 -2 Q-34 -10 -24 -8 Q-20 -22 -4 -20 Q8 -26 18 -14 Q32 -14 34 -2 Q44 0 40 8Z" fill="#fff" stroke="${INK}" stroke-width="2.4"/>`).join('');
      s += townStrip(240, sc) + road(246, sc);
      for (let i = 0; i < 4; i++) s += (i % 2 ? lampPost : treeSm)(((i * 150 - sc * 0.9) % 600 + 600) % 600 - 80, 246);
      const hop = Math.exp(-Math.pow((t - 2.7) / 0.17, 2)) * 20;
      // speed bump rolling past
      const bx = 330 - (t - 1.2) * 230 * 0.9;
      s += `<path d="M${(bx - 34).toFixed(1)} 280 Q${bx.toFixed(1)} 258 ${(bx + 34).toFixed(1)} 280Z" fill="#ffd166" stroke="${INK}" stroke-width="2.6"/>`;
      const smack = win(t, 3.0, 3.7, 0.15);
      s += riders(150, 288, 1.18, t, { wheel: t * 700, hop, him: { expr: t < 2.6 ? 'grin' : t < 3.6 ? 'shock' : 'grin', tilt: osc(t, 1.2, 2), blink: blinkAt(t) }, her: { expr: t > 2.6 && t < 4.4 ? 'angry' : 'smile', armR: lerp(8, 118, smack), tilt: osc(t, 1.4, 3, 1), blink: blinkAt(t, 1) } });
      s += speedLines(70, 250, t * 14, 60);
      s += say(t, 3.1, 5.4, 12, 60, 196, 66, ['DHEERE CHALA,', 'RAKSHAS!!'], 'down', 24, '#fff5f8');
      s += say(t, 0.4, 2.0, 120, 120, 150, 40, ['vroom vroom 😎'], 'down', 19);
      return s;
    },
  },
  // 7 ─ Pan Fire: first meeting. He stares the whole time.
  {
    id: 'panfire', dur: 6.4,
    caption: 'Pehli mulaqat @ Pan Fire — main bas ghoorta raha 👀',
    sfx: { 0.5: 'whoosh', 1.2: 'heart', 2.2: 'heart', 3.4: 'gasp', 4.4: 'plop', 5.4: 'heart' },
    draw(t) {
      const rise = sp(t, 0.3, 1.0);
      let s = backdrop('#ffe6c4', '#ffd0a0') + floor(262, '#d9a679') + stringLights(t, 28);
      s += neonSign(150, 76, 156, 46, 'PAN FIRE', '#ff7a4a', t, 30) + fireIcon(52, 76, t, 1.1) + fireIcon(248, 76, t + 1, 1.1);
      s += windowBike(208, 112, 84, 58, t);
      const stare = t < 3.4 || t > 5.2, away = t > 3.8 && t < 5.2;
      const eat = t > 1.0 && t < 3.4;
      const yy = 276 + (1 - rise) * 60;
      s += person({ x: 100, y: yy, s: 0.95, tilt: away ? -12 : 10, expr: away ? 'sweat' : stare ? 'stare' : 'think', armL: -14, armR: 20, j: NJ });
      s += person({ who: 'her', x: 198, y: yy, s: 0.95, tilt: t > 3.4 && t < 4.6 ? -8 : 2, expr: t > 3.4 && t < 4.8 ? 'think' : t > 4.8 ? 'blush' : 'smile', armR: eat ? 96 + 52 * Math.max(0, Math.sin(t * 3.4)) : 30, armL: 12, blink: blinkAt(t, 1), j: NJ });
      s += table(150, 220, 232) + plate(104, 232, 48) + plate(194, 232, 48);
      s += `<ellipse cx="104" cy="228" rx="15" ry="6" fill="#f4c47a" stroke="${INK}" stroke-width="2"/><ellipse cx="194" cy="228" rx="15" ry="6" fill="#f4c47a" stroke="${INK}" stroke-width="2"/>`;
      if (t < 2.4) s += steamPuffs(104, 224, t, 3);
      if (stare) s += floatHearts(100, 112, t, 3, 50);
      s += say(t, 3.5, 4.9, 130, 106, 150, 40, ['Kya dekh raha hai?'], 'down', 18, '#fff5f8');
      s += say(t, 4.2, 5.7, 10, 112, 100, 36, ['kuch nahi…'], 'down', 18);
      return s;
    },
  },
  // 8 ─ BFS: Harpreet Singh special pizza, chilly paneer, Fanta
  {
    id: 'bfs', dur: 6.6,
    caption: 'BFS: Harpreet Singh Special Pizza (uska), chilly paneer (mera), aur Fanta 🥤',
    sfx: { 0.5: 'whoosh', 3.2: 'plop', 3.4: 'plop', 3.6: 'plop', 4.1: 'munch', 4.7: 'munch', 5.2: 'slurp', 5.3: 'gasp' },
    draw(t) {
      let s = backdrop('#d9f0ff', '#bfe3ff') + floor(262, '#c9a679') + stringLights(t, 26);
      s += neonSign(150, 72, 120, 48, 'BFS', '#ff5d9a', t, 38);
      s += `<rect x="14" y="100" width="64" height="44" fill="#fff3b0" stroke="${INK}" stroke-width="3"/><text x="46" y="118" text-anchor="middle" font-family="Caveat, cursive" font-weight="700" font-size="13" fill="${INK}">MENU</text><path d="M24 126 h44 M24 134 h34" stroke="${INK}" stroke-width="2" stroke-linecap="round"/>`;
      const hot = sp(t, 4.4, 5.4);
      s += person({ x: 98, y: 276, s: 0.95, red: hot, expr: t < 4.4 ? (t < 1.9 ? 'smile' : 'grin') : 'shock', armR: t > 4.0 && t < 4.5 ? 130 : 20, armL: -14, tilt: t < 4.4 ? 0 : osc(t, 6, 3), blink: blinkAt(t), j: NJ });
      s += person({ who: 'her', x: 206, y: 276, s: 0.95, expr: t > 5.0 ? 'smirk' : t > 3.9 ? 'love' : 'smile', armL: -14, armR: t > 3.7 && t < 4.9 ? 118 + 24 * Math.sin(t * 5) : 30, blink: blinkAt(t, 1), j: NJ });
      if (hot > 0.1) s += steam(98 - 20, 276 - 100 * 0.95, t * 3) + steam(98 + 20, 276 - 100 * 0.95, t * 3 + 2);
      s += table(150, 232, 234);
      s += pop(pizza(214, 234, 32, sp(t, 4.0, 4.6)), 214, 234, sp(t, 3.1, 3.5)) + pop(paneerBowl(100, 236, t), 100, 236, sp(t, 3.3, 3.7)) + pop(fanta(158, 238, sp(t, 5.0, 5.4)), 158, 238, sp(t, 3.5, 3.9));
      s += say(t, 0.6, 2.4, 128, 98, 160, 54, ['Ek Harpreet Singh', 'Special Pizza!'], 'down', 18, '#fff5f8');
      s += say(t, 1.9, 3.5, 8, 160, 130, 46, ['Mere liye', 'chilly paneer'], 'down', 18);
      s += say(t, 5.0, 6.6, 8, 100, 112, 40, ['uff, teekha!!'], 'down', 20, '#fffbe0');
      return s;
    },
  },
  // 9 ─ Super Donuts: he tries to feed her; she stops him
  {
    id: 'donut', dur: 5.8,
    caption: 'Super Donuts: maine donut khilane ki koshish ki… usne haath rok diya ✋',
    sfx: { 0.5: 'whoosh', 0.9: 'plop', 2.1: 'gasp', 2.5: 'tap', 4.3: 'munch', 4.6: 'munch' },
    draw(t) {
      let s = backdrop('#ffe3ef', '#ffd0e0') + floor(262, '#e7b78f');
      s += donutSign(150, 62, t);
      s += `<rect x="20" y="102" width="260" height="8" fill="#e0a77a" stroke="${INK}" stroke-width="2.6"/>` + [0, 1, 2, 3, 4, 5, 6].map((i) => donut(40 + i * 36, 98, 10, ['#ff9ac2', '#a9c7ff', '#ffd166', '#c9f0d9'][i % 4], i * 20)).join('');
      const take = sp(t, 0.8, 1.4), offer = sp(t, 1.3, 2.1), refuse = sp(t, 2.0, 2.5), back = sp(t, 2.9, 3.6);
      const armR = lerp(30, lerp(60, 112, offer), take) * (1 - back) + 28 * back;
      const him = { x: 122, y: 276, s: 0.95 };
      s += person({ ...him, armR, armL: -14, expr: t < 2.1 ? 'grin' : t < 2.9 ? 'sweat' : t < 4.2 ? 'cry' : 'cry', tilt: t > 3.0 ? 6 : 0, blink: blinkAt(t), j: NJ });
      const hh = handPos(him.x, him.y, armR, 1, him.s);
      const bite = sp(t, 4.2, 4.7) * 0.9;
      if (take > 0.05) s += donut(hh[0] + 4, hh[1] - 4, 9, '#ff9ac2', t * 20, bite);
      s += person({ who: 'her', x: 178, y: 276, s: 0.95, armL: lerp(-14, -96, refuse) * (1 - back) - 14 * back, armR: 24, tilt: lerp(0, -9, refuse) * (1 - back), expr: t < 1.5 ? 'smile' : t < 3.1 ? (refuse > 0.5 ? 'angry' : 'shock') : t < 4.6 ? 'think' : 'smirk', blink: blinkAt(t, 1), j: NJ });
      s += table(150, 220, 234) + donutBox(150, 238);
      if (refuse > 0.6 && back < 0.5) s += `<path d="M150 150 l-8 -10 M158 146 l0 -14 M166 150 l8 -10" stroke="#e8416f" stroke-width="3.4" stroke-linecap="round"/>`;
      s += say(t, 2.4, 4.0, 150, 118, 140, 40, ['Haath hata! ✋'], 'down', 22, '#fff5f8');
      s += say(t, 3.3, 5.0, 4, 130, 112, 40, ['sirf ek bite…'], 'down', 18);
      return s;
    },
  },
  // 10 ─ Baskin Robbins: this time she lets him, and feeds him back
  {
    id: 'baskin', dur: 6.8,
    caption: 'Baskin Robbins: is baar usne khaaya… aur mujhe bhi khilaya 🥹 Main sharma gaya!',
    sfx: { 0.5: 'whoosh', 2.7: 'munch', 3.0: 'heart', 4.8: 'munch', 5.2: 'heart', 5.4: 'sparkle' },
    draw(t) {
      let s = backdrop('#ffe0ee', '#ffc9e0') + floor(262, '#f2d7e2');
      s += [0, 1, 2, 3, 4, 5, 6, 7].map((i) => `<circle cx="${20 + i * 38}" cy="${120 + (i % 2) * 22}" r="7" fill="#fff" opacity=".7"/>`).join('');
      s += baskinSign(150, 62, t);
      const offer = sp(t, 0.6, 1.6), hold = sp(t, 1.6, 2.6), bite = sp(t, 2.6, 2.9);
      const her2 = sp(t, 3.4, 4.2), shy = sp(t, 3.8, 5.2), bite2 = sp(t, 4.8, 5.1);
      const armR = lerp(30, 112, offer) * (1 - her2) + 24 * her2;
      const him = { x: 122, y: 276, s: 0.95 };
      s += person({ ...him, armR, armL: -14, expr: t < 2.7 ? 'smile' : t < 3.8 ? 'grin' : 'blush', red: shy, tilt: t > 4.0 ? osc(t, 1.4, 4) : 0, blink: t < 3.8 && blinkAt(t), j: NJ });
      if (shy > 0.3) s += steam(122 - 18, 276 - 106 * 0.95, t * 3) + steam(122 + 18, 276 - 106 * 0.95, t * 3 + 2);
      const hh = handPos(him.x, him.y, armR, 1, him.s);
      const mySlice = her2 < 0.5 && hold > 0.01 ? cakeSlice(hh[0] + 6, hh[1] - 6, 1, -10, bite) : '';
      s += person({ who: 'her', x: 178, y: 276, s: 0.95, tilt: lerp(0, 8, hold) * (1 - her2) , armL: lerp(-14, -100, her2), armR: 24, expr: t < 1.8 ? 'smile' : t < 2.7 ? 'think' : t < 3.4 ? 'blush' : 'love', blink: blinkAt(t, 1), j: NJ });
      s += mySlice;
      s += table(150, 220, 234) + plate(150, 236, 50);
      s += cakeSlice(150, 232, 0.9, 0, 0) ;
      if (her2 > 0.2) { const hl = handPos(178, 276, lerp(-14, -100, her2), -1, 0.95); s += cakeSlice(hl[0] - 6, hl[1] - 6, 1, 10, bite2); }
      if (t > 2.8 && t < 4.6) s += floatHearts(170, 150, t - 2.8, 4, 60);
      if (t > 5.2) s += floatHearts(122, 150, t - 5.2, 5, 70);
      s += say(t, 5.0, 6.8, 6, 124, 128, 40, ['(sharma gaya…)'], 'down', 18, '#fff5f8');
      return s;
    },
  },
  // 11 ─ Starbucks: the worst coffee ever
  {
    id: 'starbucks', dur: 5.8,
    caption: 'Starbucks: ab tak ki sabse kharab coffee ☕ — aur Chudail ne taunt maara!',
    sfx: { 0.4: 'whoosh', 1.9: 'slurp', 2.6: 'yuck', 3.0: 'gasp', 4.8: 'slurp', 5.1: 'yuck' },
    draw(t) {
      let s = backdrop('#e3f5ea', '#cfe9da') + floor(262, '#c9a679');
      s += starbucksSign(150, 62, t) + `<rect x="20" y="108" width="74" height="40" fill="#fff" stroke="${INK}" stroke-width="3"/><text x="57" y="125" text-anchor="middle" font-family="Caveat, cursive" font-weight="700" font-size="13" fill="#1e8f5a">today:</text><text x="57" y="141" text-anchor="middle" font-family="Caveat, cursive" font-weight="700" font-size="14" fill="${INK}">kadha ☕</text>`;
      const sipHer = sp(t, 1.7, 2.3) * (1 - sp(t, 2.9, 3.4));
      const sipHim = sp(t, 4.6, 5.1);
      const yuckHer = t > 2.5 && t < 3.6;
      s += person({ x: 108, y: 276, s: 0.95, expr: t < 4.8 ? (t < 2.9 ? 'grin' : 'sweat') : 'yuck', armR: lerp(24, 138, sipHim), armL: -14, tilt: sipHim * 4, blink: blinkAt(t), j: NJ });
      s += person({ who: 'her', x: 192, y: 276, s: 0.95, expr: yuckHer ? 'yuck' : t > 3.6 ? 'smirk' : 'smile', armL: lerp(-14, -138, sipHer) , armR: t > 3.6 ? lerp(24, 100, sp(t, 3.6, 4.0)) : 24, tilt: yuckHer ? -6 : 0, blink: blinkAt(t, 1), j: NJ });
      s += table(150, 220, 234);
      s += coffeeCup(122, 236, t) + coffeeCup(178, 236, t);
      if (yuckHer || sipHim > 0.8) s += stinkLines(yuckHer ? 192 : 108, 160, t);
      s += say(t, 0.5, 1.9, 6, 98, 150, 44, ['Special coffee!', 'sirf tere liye ☕'], 'down', 17);
      s += say(t, 3.0, 4.9, 150, 96, 146, 62, ['Ye coffee hai', 'ya KADHA?!'], 'down', 22, '#fff5f8');
      s += say(t, 3.9, 5.7, 2, 150, 140, 48, ['maine to bas', 'order kiya tha…'], 'down', 16);
      return s;
    },
  },
  // 12 ─ the fight
  {
    id: 'fight', dur: 4.8,
    caption: 'Phir ek din ladai ho gayi… HURRR! 😤',
    sfx: { 0.5: 'hurr', 1.5: 'thud', 3.4: 'gasp' },
    draw(t) {
      const turn = sp(t, 3.3, 4.0);
      let s = backdrop('#ff9a8b', '#8a6fd1') + floor(272, '#6a5aa8');
      s += `<circle cx="150" cy="210" r="60" fill="#ffd0a0" opacity=".5"/>`;
      const bump = Math.max(0, Math.sin(t * 14)) * (t > 1.3 && t < 3.2 ? 3 : 0);
      s += person({ x: 90, y: 284 - bump, tilt: lerp(-12, 10, turn), armL: 38, armR: -38, expr: turn > 0.5 ? 'sweat' : 'angry', blink: false, j: NJ });
      s += person({ who: 'her', x: 210, y: 284 - bump, tilt: lerp(12, -10, turn), armL: 38, armR: -38, expr: turn > 0.5 ? 'think' : 'angry', blink: false, j: NJ });
      s += steam(70, 170, t * 3) + steam(110, 170, t * 3 + 1) + steam(190, 170, t * 3 + 2) + steam(230, 170, t * 3 + 3);
      const fl = (1 - turn) * (Math.sin(t * 30) > -0.2 ? 1 : 0.25);
      s += `<g opacity="${fl.toFixed(2)}">${lightning(150, 160, 1.6)}</g>`;
      s += say(t, 0.5, 2.5, 150, 40, 140, 54, ['HURRR!!', 'bhodam!'], 'down', 24, '#fff5f8');
      s += say(t, 1.4, 3.2, 6, 60, 130, 44, ['Nasharam!!'], 'down', 24, '#fffbe0');
      return s;
    },
  },
  // 13 ─ ...but they still care for each other
  {
    id: 'care', dur: 6.4,
    caption: 'Ladte hain, par parwah bhi karte hain 🥺 (jacket + chocolate, bina dekhe)',
    sfx: { 0.6: 'gasp', 1.9: 'whoosh', 3.2: 'plop', 4.3: 'whoosh', 5.0: 'heart', 5.4: 'sparkle' },
    draw(t) {
      let s = backdrop('#a9b9f0', '#dccbf3') + floor(272, '#8f89c8');
      s += `<g transform="translate(262 272) scale(.7)">${bike(0, { glow: 0.2 })}</g>`;
      const give = sp(t, 1.5, 2.4), got = sp(t, 2.4, 3.2), tosser = sp(t, 3.4, 4.2), peek = sp(t, 4.8, 5.4);
      const shiver = t < 3.0 ? osc(t, 14, 1.4) : 0;
      s += person({ x: 96, y: 284, tilt: lerp(-12, 8, peek), armL: 38, armR: lerp(-38, 92, give) * (1 - got) + -38 * got, expr: peek > 0.5 ? 'blush' : 'angry', blink: false, red: peek * 0.6, j: NJ });
      s += person({ who: 'her', x: 198 + shiver, y: 284, tilt: lerp(12, -8, peek), armL: lerp(38, -92, tosser) * (1 - sp(t, 4.4, 5.0)) + 38 * sp(t, 4.4, 5.0), armR: -38, expr: peek > 0.5 ? 'blush' : t < 3.0 ? 'sweat' : 'angry', blink: false, red: peek * 0.6, j: NJ });
      if (t < 3.0) s += `<text x="${198 + shiver}" y="170" font-family="Caveat, cursive" font-weight="700" font-size="22" fill="#fff" transform="rotate(${osc(t, 14, 5)} 198 170)">brrr…</text>`;
      // jacket travels from his shoulders to hers
      if (t > 1.2) { const jx = lerp(lerp(96, 148, give), 198, got), jy = lerp(284 - 62, 284 - 66, got) - Math.sin(give * Math.PI) * 24 * (1 - got); s += jacket(jx, jy, lerp(1, 1.1, got), lerp(-10, 0, got)); }
      if (tosser > 0.05) { const cx = lerp(198 - 30, 96 + 30, sp(t, 3.8, 4.6)), cy = 284 - 80 - Math.sin(sp(t, 3.8, 4.6) * Math.PI) * 34; if (tosser < 1 || t < 4.7) s += choco(cx, cy, osc(t, 3, 16)); }
      s += say(t, 2.6, 4.0, 128, 104, 150, 40, ['…hmph. le.'], 'down', 20, '#fff5f8');
      s += say(t, 4.6, 6.4, 20, 96, 170, 46, ['hurr… tu bhi kha.', 'nasharam 💗'], 'down', 18, '#fff5f8');
      if (peek > 0.2) s += floatHearts(148, 150, t - 4.8, 6, 100);
      return s;
    },
  },
  // 14 ─ riding off into the sunset
  {
    id: 'end', dur: 5.4,
    caption: 'The End… Happy Birthday, Chudail 💖',
    sfx: { 0.2: 'vroom', 1.5: 'cheer', 2.7: 'sparkle' },
    draw(t) {
      const sc = t * 160;
      let s = backdrop('#ffb88a', '#ff8fb4');
      s += `<circle cx="150" cy="190" r="${(86 + Math.sin(t * 1.2) * 2).toFixed(1)}" fill="#ffe27a" opacity=".92" stroke="${INK}" stroke-width="3"/>`;
      s += townStrip(240, sc, ['#8a6fd1', '#b36fc8', '#d77fb4']) + road(246, sc);
      const x = lerp(88, 250, sp(t, 0, 5.2));
      s += riders(x, 288, 0.95, t, { wheel: t * 700, him: { expr: 'grin', blink: blinkAt(t) }, her: { expr: 'love', armR: 8 } });
      s += floatHearts(x - 20, 190, t, 5, 70);
      const ep = sp(t, 1.3, 1.9);
      s += pop(`<text x="150" y="96" text-anchor="middle" font-family="Caveat, cursive" font-weight="700" font-size="62" fill="#d6457f" stroke="#fff" stroke-width="7" paint-order="stroke" transform="rotate(-3 150 80)">THE END</text>`, 150, 80, ep);
      s += `<text x="150" y="132" text-anchor="middle" font-family="Caveat, cursive" font-weight="700" font-size="28" fill="#fff" stroke="${INK}" stroke-width="5" paint-order="stroke" opacity="${sp(t, 2.6, 3.4).toFixed(2)}">Happy Birthday, Chudail</text>`;
      if (t > 1.5) s += confetti(150, 100, clamp((t - 1.5) / 2.0), 28, NJ);
      return s;
    },
  },
];

// ---- playback: the story as one continuous cartoon ----
export const DURATIONS = SHOTS.map((s) => s.dur);
export const TOTAL_SECONDS = DURATIONS.reduce((a, b) => a + b, 0);
const STARTS = DURATIONS.map((_, i) => DURATIONS.slice(0, i).reduce((a, b) => a + b, 0));
export const shotStart = (si) => STARTS[si];

// Which shot is playing at time `time` (seconds), and how far into it (t, in seconds).
export function locate(time) {
  const tt = Math.max(0, Math.min(TOTAL_SECONDS - 1e-6, time));
  let si = STARTS.length - 1;
  while (si > 0 && tt < STARTS[si]) si--;
  const t = tt - STARTS[si];
  return { si, t, p: t / SHOTS[si].dur };
}

export function renderShot(si, t) {
  const shot = SHOTS[si];
  return `<svg class="fsvg" viewBox="-50 10 400 300" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${shot.draw(t, t / shot.dur)}</svg>`;
}

export const renderAt = (time) => { const { si, t } = locate(time); return renderShot(si, t); };
