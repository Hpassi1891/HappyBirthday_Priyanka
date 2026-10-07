// Tiny Web Audio helper: sfx + Happy Birthday tune. Starts only after a user gesture.
let ctx = null;
let muted = false;

function ac() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

function tone(freq, start, dur, { type = 'sine', gain = 0.15 } = {}) {
  const a = ac();
  if (!a || muted) return;
  const t = a.currentTime + start;
  const o = a.createOscillator();
  const g = a.createGain();
  o.type = type;
  o.frequency.value = freq;
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(gain, t + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(a.destination);
  o.start(t);
  o.stop(t + dur + 0.05);
}

export const audio = {
  unlock() { ac(); },
  get muted() { return muted; },
  setMuted(m) { muted = m; },
  pop() { tone(500, 0, 0.08, { type: 'square', gain: 0.1 }); tone(180, 0.02, 0.1, { type: 'triangle', gain: 0.12 }); },
  sparkle() { [880, 1320, 1760].forEach((f, i) => tone(f, i * 0.07, 0.25, { gain: 0.08 })); },
  wrong() { tone(220, 0, 0.15, { type: 'sawtooth', gain: 0.08 }); tone(165, 0.15, 0.25, { type: 'sawtooth', gain: 0.08 }); },
  creak() { tone(110, 0, 0.5, { type: 'sawtooth', gain: 0.05 }); tone(140, 0.2, 0.5, { type: 'sawtooth', gain: 0.05 }); },
  cheer() { [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.09, 0.4, { gain: 0.1 })); },
  // soft paper swish for page turns
  flip() {
    const a = ac();
    if (!a || muted) return;
    const len = Math.floor(a.sampleRate * 0.7);
    const buf = a.createBuffer(1, len, a.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.sin((i / len) * Math.PI);
    const src = a.createBufferSource(); src.buffer = buf;
    const f = a.createBiquadFilter(); f.type = 'bandpass'; f.frequency.setValueAtTime(900, a.currentTime); f.frequency.exponentialRampToValueAtTime(3200, a.currentTime + 0.6); f.Q.value = 0.8;
    const g = a.createGain(); g.gain.value = 0.18;
    src.connect(f).connect(g).connect(a.destination); src.start();
  },
  // a warm rising hum for when the lights come on
  glow() {
    const a = ac();
    if (!a || muted) return;
    const o = a.createOscillator(), g = a.createGain();
    o.type = 'sine';
    o.frequency.setValueAtTime(180, a.currentTime);
    o.frequency.exponentialRampToValueAtTime(720, a.currentTime + 3);
    g.gain.setValueAtTime(0.0001, a.currentTime);
    g.gain.exponentialRampToValueAtTime(0.06, a.currentTime + 1.2);
    g.gain.exponentialRampToValueAtTime(0.0001, a.currentTime + 3.4);
    o.connect(g).connect(a.destination); o.start(); o.stop(a.currentTime + 3.5);
  },
  click() { tone(700, 0, 0.05, { type: 'triangle', gain: 0.08 }); },
  // Happy Birthday in C major; returns total duration in seconds.
  birthday() {
    const n = { C: 262, D: 294, E: 330, F: 349, G: 392, A: 440, B: 494, C2: 523 };
    const song = [
      ['G', .5], ['G', .25], ['A', 1], ['G', 1], ['C2', 1], ['B', 2],
      ['G', .5], ['G', .25], ['A', 1], ['G', 1], ['D', 1], ['C2', 2],
      ['G', .5], ['G', .25], ['G', 1], ['E', 1], ['C2', 1], ['B', 1], ['A', 1.5],
      ['F', .5], ['F', .25], ['E', 1], ['C2', 1], ['D', 1], ['C2', 2],
    ];
    let t = 0;
    const beat = 0.42;
    for (const [note, len] of song) {
      tone(n[note], t * beat, len * beat * 0.95, { type: 'triangle', gain: 0.14 });
      t += len;
    }
    return t * beat;
  },
};
