// The painted party mural for the room wall, drawn as one SVG (viewBox 1000 x 440, a wide wall).
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
export function garland({ x0, y0, x1, y1, sag, n, letters, offset = 0, w = 20, h = 26 }) {
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
  for (let i = 0; i < 90; i++) {
    const x = (rand() * 990 + 5).toFixed(0), y = (rand() * 350 + 60).toFixed(0), c = COL[i % COL.length];
    const k = i % 3;
    confetti += k === 0 ? `<circle class="cf" style="--i:${i}" cx="${x}" cy="${y}" r="2.6" fill="${c}"/>`
      : k === 1 ? `<rect class="cf" style="--i:${i}" x="${x}" y="${y}" width="7" height="3.5" rx="1" fill="${c}" transform="rotate(${(rand() * 180) | 0} ${x} ${y})"/>`
      : `<path class="cf" style="--i:${i}" d="M${x} ${y} l6 0 l-3 5.4z" fill="${c}" transform="rotate(${(rand() * 180) | 0} ${x} ${y})"/>`;
  }

  // flower wreath around the name plaque
  const PX = 500, PY = 322;
  let wreath = '';
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    const x = PX + Math.cos(a) * 62, y = PY + Math.sin(a) * 62;
    wreath += `<ellipse cx="${(PX + Math.cos(a + 0.2) * 66).toFixed(1)}" cy="${(PY + Math.sin(a + 0.2) * 66).toFixed(1)}" rx="7" ry="3.5" fill="#7fd6a0" stroke="${INK}" stroke-width="1" transform="rotate(${((a + 0.2) * 180) / Math.PI + 90} ${(PX + Math.cos(a + 0.2) * 66).toFixed(1)} ${(PY + Math.sin(a + 0.2) * 66).toFixed(1)})"/>`;
    wreath += flower(x, y, 9, COL[(i * 2) % COL.length], i);
  }

  const streamer = (x, flip) => {
    const s = flip ? -1 : 1;
    const d = `M${x} 52 C${x + 24 * s} 100 ${x - 18 * s} 140 ${x + 8 * s} 190 S${x - 14 * s} 250 ${x + 6 * s} 300 S${x - 8 * s} 330 ${x + 2 * s} 350`;
    return `<path class="streamer" d="${d}" fill="none" stroke="${INK}" stroke-width="9" stroke-linecap="round" pathLength="1"/>
            <path class="streamer" d="${d}" fill="none" stroke="${flip ? '#a9c7ff' : '#ffb3d1'}" stroke-width="6" stroke-linecap="round" pathLength="1"/>
            <path class="streamer" d="${d}" fill="none" stroke="#fff" stroke-opacity=".6" stroke-width="1.6" stroke-dasharray="1 7" stroke-linecap="round" transform="translate(-1 0)"/>`;
  };

  // a wide wall: bunting across the top, the banner in the middle, balloon bunches at both ends
  return `
<svg class="mural" viewBox="0 0 1000 440" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
  <g class="g-streamers">${streamer(22, false)}${streamer(978, true)}</g>
  <g class="g-garland">
    ${garland({ x0: -6, y0: 8, x1: 1006, y1: 8, sag: 22, n: 34 })}
    ${garland({ x0: 40, y0: 150, x1: 330, y1: 120, sag: 14, n: 8, offset: 2, w: 20, h: 26 })}
    ${garland({ x0: 960, y0: 150, x1: 670, y1: 120, sag: 14, n: 8, offset: 5, w: 20, h: 26 })}
  </g>
  <g class="g-letters">
    ${garland({ x0: 170, y0: 58, x1: 830, y1: 58, sag: 22, n: 14, letters: 'HAPPY BIRTHDAY', offset: 1, w: 40, h: 50 })}
  </g>
  <g class="g-ribbon">
    <path d="M300 196 L262 206 L280 226 L262 246 L306 238Z" fill="#e8416f" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>
    <path d="M700 196 L738 206 L720 226 L738 246 L694 238Z" fill="#e8416f" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>
    <path d="M296 192 Q500 172 704 192 L704 240 Q500 260 296 240Z" fill="#ff7aa6" stroke="${INK}" stroke-width="2.4" stroke-linejoin="round"/>
    <path d="M312 199 Q500 181 688 199" fill="none" stroke="#fff" stroke-opacity=".6" stroke-width="2" stroke-linecap="round"/>
    <text x="500" y="228" text-anchor="middle" font-family="Caveat, cursive" font-weight="700" font-size="50" fill="#fff" stroke="${INK}" stroke-width="1.4" paint-order="stroke" letter-spacing="4">CHUDAIL</text>
  </g>
  <g class="g-plaque">
    ${wreath}
    <circle cx="${PX}" cy="${PY}" r="52" fill="#fffaf2" stroke="${INK}" stroke-width="2.4"/>
    <circle cx="${PX}" cy="${PY}" r="45" fill="none" stroke="#f7a1bf" stroke-width="1.6" stroke-dasharray="3 4"/>
    <text x="${PX}" y="${PY + 4}" text-anchor="middle" font-family="Caveat, cursive" font-weight="700" font-size="30" fill="#d6457f">Priyanka</text>
    <text x="${PX}" y="${PY + 22}" text-anchor="middle" font-family="Caveat, cursive" font-weight="700" font-size="12.5" fill="${INK}">future bank officer</text>
    <text x="${PX}" y="${PY - 16}" text-anchor="middle" font-family="Caveat, cursive" font-weight="700" font-size="13" fill="${INK}">11 · 11</text>
  </g>
  <g class="g-balloons">
    ${balloon(120, 428, -26, 120, 22, 29, '#ff8fb8', 0)}
    ${balloon(120, 428, 4, 160, 23, 30, '#ffd166', 1)}
    ${balloon(120, 428, 32, 112, 21, 28, '#a9c7ff', 2)}
    ${balloon(120, 428, -6, 84, 20, 26, '#c9a7ff', 3)}
    ${balloon(880, 428, 26, 120, 22, 29, '#7fd6c2', 4)}
    ${balloon(880, 428, -4, 160, 23, 30, '#ff8fb8', 5)}
    ${balloon(880, 428, -32, 112, 21, 28, '#ffd166', 6)}
    ${balloon(880, 428, 6, 84, 20, 26, '#a9c7ff', 7)}
    ${balloon(290, 428, -10, 70, 18, 24, '#ffb3d1', 8)}
    ${balloon(290, 428, 14, 96, 19, 25, '#7fd6c2', 9)}
    ${balloon(710, 428, 10, 70, 18, 24, '#c9a7ff', 10)}
    ${balloon(710, 428, -14, 96, 19, 25, '#ffd166', 11)}
  </g>
  <g class="g-confetti">${confetti}</g>
  <g class="g-sparkles">
    ${sparkle(70, 100, 8, 0)}${sparkle(930, 96, 7, 1)}${sparkle(110, 240, 7, 2)}${sparkle(890, 230, 8, 3)}
    ${sparkle(230, 300, 6, 4)}${sparkle(770, 304, 7, 5)}${sparkle(500, 28, 7, 6)}${sparkle(380, 396, 6, 7)}${sparkle(620, 392, 6, 12)}
    ${heart(200, 200, 1.1, '#ff7aa6', 8)}${heart(800, 196, 1.2, '#c9a7ff', 9)}${heart(380, 330, 1, '#ffd166', 10)}${heart(620, 334, 1, '#ff7aa6', 11)}
  </g>
</svg>`;
}
