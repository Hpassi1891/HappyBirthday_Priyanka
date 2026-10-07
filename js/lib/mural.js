// The painted party mural for the room wall, drawn as one SVG (viewBox 300 x 440).
// Every decoration is its own group so the scene can colour them in one by one when the lights come on.
const INK = '#5a3a5e';
const COL = ['#ff8fb8', '#ffd166', '#7fd6c2', '#a9c7ff', '#ffb3d1', '#c9a7ff'];

// small seeded random so the confetti looks the same on every visit
const rng = (seed) => () => (seed = (seed * 16807) % 2147483647) / 2147483647;

const bez = (p0, p1, p2, t) => [
  (1 - t) * (1 - t) * p0[0] + 2 * (1 - t) * t * p1[0] + t * t * p2[0],
  (1 - t) * (1 - t) * p0[1] + 2 * (1 - t) * t * p1[1] + t * t * p2[1],
];
const bezDeriv = (p0, p1, p2, t) => [
  2 * (1 - t) * (p1[0] - p0[0]) + 2 * t * (p2[0] - p1[0]),
  2 * (1 - t) * (p1[1] - p0[1]) + 2 * t * (p2[1] - p1[1]),
];

// A string of pennant flags hung along a sagging curve. Letters make a banner.
function garland({ x0, y0, x1, y1, sag, n, letters, offset = 0, w = 20, h = 26 }) {
  const p0 = [x0, y0], p2 = [x1, y1];
  const p1 = [(x0 + x1) / 2, (y0 + y1) / 2 + sag * 2];
  let out = `<path class="rope" d="M${x0} ${y0} Q${p1[0]} ${p1[1]} ${x1} ${y1}" fill="none" stroke="${INK}" stroke-width="1.6"/>`;
  for (let i = 0; i < n; i++) {
    const t = (i + 0.5) / n;
    const [x, y] = bez(p0, p1, p2, t);
    const [dx, dy] = bezDeriv(p0, p1, p2, t);
    const a = (Math.atan2(dy, dx) * 180) / Math.PI;
    const c = COL[(i + offset) % COL.length];
    const ch = letters ? letters[i] : '';
    out += `<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${a.toFixed(1)})"><g class="flag" style="--i:${i + offset}">
      <polygon points="${-w / 2},0 ${w / 2},0 0,${h}" fill="${c}" stroke="${INK}" stroke-width="1.6" stroke-linejoin="round"/>
      <path d="M${-w / 2 + 3},3 L${w / 2 - 3},3" stroke="#fff" stroke-opacity=".65" stroke-width="1.6" stroke-linecap="round"/>
      ${ch ? `<text x="0" y="${h * 0.5}" text-anchor="middle" font-family="Caveat, cursive" font-weight="700" font-size="${h * 0.62}" fill="#fff" stroke="${INK}" stroke-width="1.6" paint-order="stroke" stroke-linejoin="round">${ch}</text>` : `<circle cx="0" cy="${h * 0.3}" r="2.2" fill="#fff" fill-opacity=".8"/>`}
    </g></g>`;
  }
  return out;
}

function balloon(tx, ty, dx, len, rx, ry, color, i) {
  const cy = -len - ry + 3;
  return `<g transform="translate(${tx} ${ty})"><g class="bal" style="--i:${i}">
    <path d="M0 0 Q${dx * 0.2} ${-len * 0.5} ${dx} ${-len + 2}" fill="none" stroke="${INK}" stroke-width="1.2"/>
    <ellipse cx="${dx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${color}" stroke="${INK}" stroke-width="1.8"/>
    <polygon points="${dx - 3},${-len + 4} ${dx + 3},${-len + 4} ${dx},${-len}" fill="${color}" stroke="${INK}" stroke-width="1.4" stroke-linejoin="round"/>
    <path d="M${dx - rx * 0.55} ${cy - ry * 0.2} Q${dx - rx * 0.5} ${cy - ry * 0.65} ${dx - rx * 0.15} ${cy - ry * 0.75}" fill="none" stroke="#fff" stroke-opacity=".8" stroke-width="3" stroke-linecap="round"/>
    <path d="M${dx + rx * 0.45} ${cy + ry * 0.2} l${rx * 0.2} ${ry * 0.25}" stroke="#fff" stroke-opacity=".35" stroke-width="2" stroke-linecap="round"/>
  </g></g>`;
}

function flower(x, y, r, color, i) {
  let petals = '';
  for (let k = 0; k < 5; k++) {
    const a = (k / 5) * Math.PI * 2 - Math.PI / 2;
    petals += `<circle cx="${(Math.cos(a) * r * 0.62).toFixed(1)}" cy="${(Math.sin(a) * r * 0.62).toFixed(1)}" r="${(r * 0.5).toFixed(1)}" fill="${color}" stroke="${INK}" stroke-width="1.2"/>`;
  }
  return `<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)})"><g class="fw" style="--i:${i}">${petals}<circle r="${(r * 0.32).toFixed(1)}" fill="#ffe27a" stroke="${INK}" stroke-width="1"/></g></g>`;
}

const sparkle = (x, y, s, i) => `<g transform="translate(${x} ${y})"><path class="sp4" style="--i:${i}" d="M0 ${-s} Q${s * 0.2} ${-s * 0.2} ${s} 0 Q${s * 0.2} ${s * 0.2} 0 ${s} Q${-s * 0.2} ${s * 0.2} ${-s} 0 Q${-s * 0.2} ${-s * 0.2} 0 ${-s}Z" fill="#ffd166" stroke="${INK}" stroke-width="1" stroke-linejoin="round"/></g>`;

const heart = (x, y, s, c, i) => `<g transform="translate(${x} ${y}) scale(${s})"><path class="sp4" style="--i:${i}" d="M0 6 C-12 -2 -7 -12 0 -5 C7 -12 12 -2 0 6Z" fill="${c}" stroke="${INK}" stroke-width="1.4" stroke-linejoin="round"/></g>`;

export function muralSVG() {
  const rand = rng(42);
  let confetti = '';
  for (let i = 0; i < 44; i++) {
    const x = (rand() * 296 + 2).toFixed(0), y = (rand() * 380 + 50).toFixed(0), c = COL[i % COL.length];
    const k = i % 3;
    confetti += k === 0 ? `<circle class="cf" style="--i:${i}" cx="${x}" cy="${y}" r="2.2" fill="${c}"/>`
      : k === 1 ? `<rect class="cf" style="--i:${i}" x="${x}" y="${y}" width="6" height="3" rx="1" fill="${c}" transform="rotate(${(rand() * 180) | 0} ${x} ${y})"/>`
      : `<path class="cf" style="--i:${i}" d="M${x} ${y} l5 0 l-2.5 4.5z" fill="${c}" transform="rotate(${(rand() * 180) | 0} ${x} ${y})"/>`;
  }

  // flower wreath around the name plaque
  let wreath = '';
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * Math.PI * 2;
    const x = 150 + Math.cos(a) * 58, y = 352 + Math.sin(a) * 58;
    wreath += `<ellipse cx="${(150 + Math.cos(a + 0.2) * 62).toFixed(1)}" cy="${(352 + Math.sin(a + 0.2) * 62).toFixed(1)}" rx="7" ry="3.5" fill="#7fd6a0" stroke="${INK}" stroke-width="1" transform="rotate(${((a + 0.2) * 180) / Math.PI + 90} ${(150 + Math.cos(a + 0.2) * 62).toFixed(1)} ${(352 + Math.sin(a + 0.2) * 62).toFixed(1)})"/>`;
    wreath += flower(x, y, 8.5, COL[(i * 2) % COL.length], i);
  }

  const streamer = (x, flip) => {
    const s = flip ? -1 : 1;
    const d = `M${x} 52 C${x + 24 * s} 100 ${x - 18 * s} 140 ${x + 8 * s} 190 S${x - 14 * s} 250 ${x + 6 * s} 300 S${x - 8 * s} 330 ${x + 2 * s} 350`;
    return `<path class="streamer" d="${d}" fill="none" stroke="${INK}" stroke-width="9" stroke-linecap="round" pathLength="1"/>
            <path class="streamer" d="${d}" fill="none" stroke="${flip ? '#a9c7ff' : '#ffb3d1'}" stroke-width="6" stroke-linecap="round" pathLength="1"/>
            <path class="streamer" d="${d}" fill="none" stroke="#fff" stroke-opacity=".6" stroke-width="1.6" stroke-dasharray="1 7" stroke-linecap="round" transform="translate(-1 0)"/>`;
  };

  return `
<svg class="mural" viewBox="0 0 300 440" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
  <g class="g-streamers">${streamer(10, false)}${streamer(290, true)}</g>
  <g class="g-garland">
    ${garland({ x0: -6, y0: 8, x1: 306, y1: 8, sag: 18, n: 14 })}
  </g>
  <g class="g-letters">
    ${garland({ x0: 50, y0: 62, x1: 250, y1: 62, sag: 20, n: 5, letters: 'HAPPY', offset: 1, w: 30, h: 38 })}
    ${garland({ x0: 22, y0: 130, x1: 278, y1: 130, sag: 22, n: 8, letters: 'BIRTHDAY', offset: 4, w: 28, h: 36 })}
  </g>
  <g class="g-ribbon">
    <path d="M44 224 L12 232 L26 248 L12 264 L48 258Z" fill="#e8416f" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>
    <path d="M256 224 L288 232 L274 248 L288 264 L252 258Z" fill="#e8416f" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>
    <path d="M40 222 Q150 208 260 222 L260 262 Q150 276 40 262Z" fill="#ff7aa6" stroke="${INK}" stroke-width="2.4" stroke-linejoin="round"/>
    <path d="M52 228 Q150 216 248 228" fill="none" stroke="#fff" stroke-opacity=".6" stroke-width="2" stroke-linecap="round"/>
    <text x="150" y="254" text-anchor="middle" font-family="Caveat, cursive" font-weight="700" font-size="36" fill="#fff" stroke="${INK}" stroke-width="1.2" paint-order="stroke" letter-spacing="2">CHUDAIL</text>
  </g>
  <g class="g-plaque">
    ${wreath}
    <circle cx="150" cy="352" r="46" fill="#fffaf2" stroke="${INK}" stroke-width="2.4"/>
    <circle cx="150" cy="352" r="40" fill="none" stroke="#f7a1bf" stroke-width="1.6" stroke-dasharray="3 4"/>
    <text x="150" y="354" text-anchor="middle" font-family="Caveat, cursive" font-weight="700" font-size="25" fill="#d6457f">Priyanka</text>
    <text x="150" y="370" text-anchor="middle" font-family="Caveat, cursive" font-weight="700" font-size="11" fill="${INK}">future master baker</text>
    <text x="150" y="338" text-anchor="middle" font-family="Caveat, cursive" font-weight="700" font-size="11" fill="${INK}">11 · 11</text>
  </g>
  <g class="g-balloons">
    ${balloon(46, 428, -22, 70, 19, 25, '#ff8fb8', 0)}
    ${balloon(46, 428, 2, 96, 20, 26, '#ffd166', 1)}
    ${balloon(46, 428, 26, 66, 18, 24, '#a9c7ff', 2)}
    ${balloon(46, 428, -4, 50, 17, 22, '#c9a7ff', 3)}
    ${balloon(254, 428, 22, 70, 19, 25, '#7fd6c2', 4)}
    ${balloon(254, 428, -2, 96, 20, 26, '#ff8fb8', 5)}
    ${balloon(254, 428, -26, 66, 18, 24, '#ffd166', 6)}
    ${balloon(254, 428, 4, 50, 17, 22, '#a9c7ff', 7)}
  </g>
  <g class="g-confetti">${confetti}</g>
  <g class="g-sparkles">
    ${sparkle(36, 100, 7, 0)}${sparkle(268, 96, 6, 1)}${sparkle(30, 200, 6, 2)}${sparkle(272, 190, 7, 3)}
    ${sparkle(100, 296, 5, 4)}${sparkle(204, 300, 6, 5)}${sparkle(150, 30, 6, 6)}${sparkle(90, 410, 5, 7)}
    ${heart(70, 196, 0.9, '#ff7aa6', 8)}${heart(234, 190, 1, '#c9a7ff', 9)}${heart(96, 330, 0.8, '#ffd166', 10)}${heart(206, 336, 0.8, '#ff7aa6', 11)}
  </g>
</svg>`;
}
