// Sound for the party, synthesised with the Web Audio API (no audio files).
// Everything goes through one bus: a soft room reverb and a gentle limiter, so the sounds feel warm and
// never harsh. Voices: glassy bells, a music box, airy pads, and filtered noise for whooshes and puffs.
// Starts only after a user gesture (call unlock() on the first tap).
let ac = null;
let bus = null;       // { dry, wet } input nodes
let master = null;
let muted = false;

// Notes (Hz). C major pentatonic is used for sparkles so random notes always sound pleasant together.
const N = { C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392, A4: 440, B4: 493.88, C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99, A5: 880, B5: 987.77, C6: 1046.5, D6: 1174.66, E6: 1318.51, G6: 1567.98 };
const PENTA = [N.C5, N.D5, N.E5, N.G5, N.A5, N.C6, N.D6, N.E6, N.G6];

// A short, soft "room" built from decaying noise. Used for the reverb tail.
function impulse(context, seconds = 1.9, decay = 3.2) {
  const rate = context.sampleRate, len = Math.floor(rate * seconds);
  const buf = context.createBuffer(2, len, rate);
  for (let ch = 0; ch < 2; ch++) {
    const d = buf.getChannelData(ch);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
  }
  return buf;
}

function build(context) {
  master = context.createGain();
  master.gain.value = muted ? 0 : 0.9;
  const limiter = context.createDynamicsCompressor();
  limiter.threshold.value = -14; limiter.knee.value = 18; limiter.ratio.value = 6; limiter.attack.value = 0.004; limiter.release.value = 0.2;
  master.connect(limiter).connect(context.destination);
  const dry = context.createGain(); dry.connect(master);
  const verb = context.createConvolver(); verb.buffer = impulse(context);
  const wetIn = context.createGain();
  const wetOut = context.createGain(); wetOut.gain.value = 0.34;
  const tone = context.createBiquadFilter(); tone.type = 'lowpass'; tone.frequency.value = 4800;
  wetIn.connect(verb).connect(tone).connect(wetOut).connect(master);
  bus = { dry, wet: wetIn };
}

function ready() {
  if (!ac) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ac = new AC();
    build(ac);
  }
  // (an OfflineAudioContext, used in tests, is started by startRendering instead)
  if (ac.state === 'suspended' && typeof ac.startRendering !== 'function') ac.resume();
  return ac;
}

// ---- voices ----
// every voice takes `at` (seconds from now) and sends some of itself to the reverb (`send`)
function out(node, send = 0.25, gainNode) {
  const g = gainNode;
  node.connect(g);
  g.connect(bus.dry);
  if (send > 0) { const s = ac.createGain(); s.gain.value = send; g.connect(s); s.connect(bus.wet); }
}

function env(g, t, peak, attack, decay, floor = 0.0001) {
  g.gain.cancelScheduledValues(t);
  g.gain.setValueAtTime(floor, t);
  g.gain.linearRampToValueAtTime(peak, t + attack);
  g.gain.exponentialRampToValueAtTime(floor, t + attack + decay);
}

// glassy bell: a few inharmonic partials, each fading at its own speed
function bell(freq, at = 0, vel = 1, ring = 1.6) {
  const t = ac.currentTime + at;
  const parts = [[1, 1, 1], [2.01, 0.42, 0.62], [3.02, 0.22, 0.4], [4.17, 0.1, 0.25]];
  for (const [ratio, amp, dec] of parts) {
    const o = ac.createOscillator(), g = ac.createGain();
    o.type = 'sine'; o.frequency.value = freq * ratio;
    env(g, t, 0.16 * amp * vel, 0.004, ring * dec);
    out(o, 0.38, g);
    o.start(t); o.stop(t + ring * dec + 0.1);
  }
}

// music box: a quick, sweet pluck with a bright overtone
function musicBox(freq, at = 0, vel = 1, ring = 1.1) {
  const t = ac.currentTime + at;
  [[1, 1, 1], [3, 0.3, 0.35], [5, 0.1, 0.2]].forEach(([r, a, d]) => {
    const o = ac.createOscillator(), g = ac.createGain();
    o.type = 'sine'; o.frequency.value = freq * r;
    env(g, t, 0.22 * a * vel, 0.003, ring * d);
    out(o, 0.42, g);
    o.start(t); o.stop(t + ring * d + 0.1);
  });
}

// soft marimba-like thunk (used for gentle "no" sounds)
function thunk(freq, at = 0, vel = 1) {
  const t = ac.currentTime + at;
  const o = ac.createOscillator(), g = ac.createGain();
  o.type = 'sine'; o.frequency.setValueAtTime(freq * 1.6, t); o.frequency.exponentialRampToValueAtTime(freq, t + 0.05);
  env(g, t, 0.3 * vel, 0.004, 0.32);
  out(o, 0.15, g);
  o.start(t); o.stop(t + 0.4);
}

// warm pad: slightly detuned triangles through a low-pass, with a slow swell
function pad(freqs, at = 0, dur = 2.4, vel = 1) {
  const t = ac.currentTime + at;
  const lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.setValueAtTime(500, t); lp.frequency.linearRampToValueAtTime(1800, t + dur * 0.6);
  const g = ac.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(0.09 * vel, t + dur * 0.45);
  g.gain.linearRampToValueAtTime(0.0001, t + dur);
  lp.connect(g);
  g.connect(bus.dry);
  const s = ac.createGain(); s.gain.value = 0.55; g.connect(s); s.connect(bus.wet);
  freqs.forEach((f, i) => {
    [-5, 5].forEach((cents) => {
      const o = ac.createOscillator(); o.type = i % 2 ? 'sine' : 'triangle'; o.frequency.value = f; o.detune.value = cents;
      o.connect(lp); o.start(t); o.stop(t + dur + 0.1);
    });
  });
}

// filtered noise with a sweeping filter: whooshes, puffs, shimmers, rain, cymbals
function noise(dur, type, f0, f1, gain, at = 0, q = 0.9, send = 0.2, curve = 'swell') {
  const t = ac.currentTime + at;
  const len = Math.max(1, Math.floor(ac.sampleRate * dur));
  const buf = ac.createBuffer(1, len, ac.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  const src = ac.createBufferSource(); src.buffer = buf;
  const f = ac.createBiquadFilter(); f.type = type; f.Q.value = q;
  f.frequency.setValueAtTime(f0, t); f.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur);
  const g = ac.createGain();
  g.gain.setValueAtTime(0.0001, t);
  if (curve === 'hit') { g.gain.linearRampToValueAtTime(gain, t + 0.004); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); }
  else { g.gain.linearRampToValueAtTime(gain, t + dur * 0.35); g.gain.linearRampToValueAtTime(0.0001, t + dur); }
  src.connect(f); f.connect(g);
  g.connect(bus.dry);
  if (send > 0) { const s = ac.createGain(); s.gain.value = send; g.connect(s); s.connect(bus.wet); }
  src.start(t); src.stop(t + dur + 0.05);
}

// a pitched sweep (slide whistle, kick, twang, growl)
function sweep(type, f0, f1, dur, gain, at = 0, send = 0.1, vibrato = 0) {
  const t = ac.currentTime + at;
  const o = ac.createOscillator(), g = ac.createGain();
  o.type = type; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f1, t + dur);
  if (vibrato) {
    const lfo = ac.createOscillator(), lg = ac.createGain();
    lfo.frequency.value = vibrato; lg.gain.value = f0 * 0.04; lfo.connect(lg); lg.connect(o.frequency); lfo.start(t); lfo.stop(t + dur + 0.05);
  }
  env(g, t, gain, 0.006, dur);
  out(o, send, g);
  o.start(t); o.stop(t + dur + 0.1);
}

const on = (fn) => (...a) => { if (muted || !ready()) return; fn(...a); };

export const audio = {
  unlock() { ready(); },
  get muted() { return muted; },
  setMuted(m) {
    muted = m;
    if (master) master.gain.setTargetAtTime(m ? 0 : 0.9, ac.currentTime, 0.03);
  },
  // for tests: run the engine on any AudioContext (for example an OfflineAudioContext)
  attach(context) { ac = context; build(context); },

  // ---- small interface sounds ----
  click: on(() => { sweep('sine', 1500, 620, 0.04, 0.34, 0, 0.05); noise(0.02, 'highpass', 4000, 4000, 0.12, 0, 1, 0, 'hit'); }),
  pop: on(() => { sweep('sine', 720, 130, 0.09, 0.6, 0, 0.1); noise(0.03, 'bandpass', 2400, 1200, 0.22, 0, 1.2, 0.05, 'hit'); }),
  sparkle: on(() => {
    const start = (Math.random() * 3) | 0;
    [0, 2, 3, 5].forEach((step, i) => bell(PENTA[Math.min(PENTA.length - 1, start + step)], i * 0.07, 0.55 - i * 0.07, 1.2));
  }),
  wrong: on(() => { thunk(N.A4 / 2, 0, 0.9); thunk(N.F4 / 2, 0.13, 0.8); }),
  creak: on(() => { sweep('sawtooth', 95, 70, 0.7, 0.14, 0, 0.2, 6); sweep('sawtooth', 142, 110, 0.55, 0.09, 0.12, 0.2, 7); noise(0.5, 'bandpass', 500, 300, 0.07, 0.05, 2, 0.1); }),
  // a warm swell with a rising bell arpeggio
  cheer: on(() => {
    pad([N.C4, N.E4, N.G4, N.C5], 0, 2.2, 1);
    [N.C5, N.E5, N.G5, N.C6, N.E6].forEach((f, i) => bell(f, 0.05 + i * 0.09, 0.8, 1.8));
    noise(0.9, 'highpass', 5500, 9000, 0.05, 0.05, 0.7, 0.4);
  }),
  // soft paper swish for turning to the next scene
  flip: on(() => { noise(0.34, 'bandpass', 1300, 3600, 0.22, 0, 0.8, 0.1); }),
  // a rising shimmer when the lights come on
  glow: on(() => {
    pad([N.G4, N.D5, N.G5], 0, 3.6, 1);
    [N.G5, N.B5, N.D6, N.G6].forEach((f, i) => bell(f, 0.8 + i * 0.35, 0.5, 2));
    noise(3.4, 'highpass', 2000, 9000, 0.05, 0, 0.8, 0.5);
  }),
  puff: on(() => { noise(0.26, 'lowpass', 1500, 380, 1.1, 0, 0.7, 0.15, 'hit'); }),
  slice: on(() => { noise(0.14, 'highpass', 2500, 7500, 0.3, 0, 1, 0.1, 'hit'); bell(N.E6, 0.1, 0.6, 1.0); }),
  badum() {
    if (muted || !ready()) return;
    sweep('sine', 160, 70, 0.18, 0.35, 0, 0.1); sweep('sine', 120, 55, 0.22, 0.38, 0.17, 0.1);
    noise(0.7, 'highpass', 6500, 9500, 0.12, 0.36, 0.7, 0.3, 'hit');
  },

  // ---- cinematic moments ----
  whoosh: on(() => { noise(0.9, 'bandpass', 300, 2600, 0.32, 0, 0.9, 0.35); }),
  // a slow, low swell for scene changes
  swell: on(() => { pad([N.C4 / 2, N.G4 / 2, N.E4], 0, 2.4, 1.1); noise(1.6, 'lowpass', 400, 2400, 0.06, 0, 0.7, 0.4); }),
  // heartbeat: lub-dub
  thump: on(() => { sweep('sine', 90, 45, 0.16, 0.5, 0, 0.1); sweep('sine', 80, 40, 0.2, 0.4, 0.17, 0.1); }),
  // bow string
  twang: on(() => { sweep('triangle', 330, 150, 0.35, 0.4, 0, 0.3); noise(0.08, 'bandpass', 2400, 1500, 0.14, 0, 2, 0.1, 'hit'); }),
  arrow: on(() => { noise(0.38, 'bandpass', 4200, 900, 0.26, 0, 1.4, 0.15); }),
  // a flower opening
  bloom: on(() => { bell(PENTA[(Math.random() * 6) | 0], 0, 0.5, 1.6); }),
  // a big soft chime for a white-out
  chime: on(() => { [N.C5, N.G5, N.C6, N.E6].forEach((f, i) => bell(f, i * 0.05, 0.8, 2.6)); pad([N.C4, N.G4, N.E5], 0, 3, 0.8); }),
  // a gentle two-note "ding" to confirm something
  ding: on(() => { bell(N.E6, 0, 0.7, 1.4); bell(N.A5, 0.12, 0.6, 1.6); }),

  // "Happy Birthday" on a music box, with soft chords underneath. Returns the length in seconds.
  birthday() {
    if (muted || !ready()) return 0;
    const q = 0.5;                               // seconds per quarter note
    const song = [
      [N.G4, 0.75], [N.G4, 0.25], [N.A4, 1], [N.G4, 1], [N.C5, 1], [N.B4, 2],
      [N.G4, 0.75], [N.G4, 0.25], [N.A4, 1], [N.G4, 1], [N.D5, 1], [N.C5, 2],
      [N.G4, 0.75], [N.G4, 0.25], [N.G5, 1], [N.E5, 1], [N.C5, 1], [N.B4, 1], [N.A4, 1],
      [N.F5, 0.75], [N.F5, 0.25], [N.E5, 1], [N.C5, 1], [N.D5, 1], [N.C5, 2],
    ];
    let t = 0.1;
    for (const [f, len] of song) { musicBox(f, t, 1, 1.2); t += len * q; }
    pad([N.C4, N.E4, N.G4], 0.1, 3.2, 0.7); pad([N.G4 / 2, N.B4 / 2, N.D4], 3.4, 3.2, 0.6);
    pad([N.C4, N.E4, N.G4], 6.6, 3.2, 0.7); pad([N.F4, N.A4, N.C5], 9.8, 3.4, 0.7);
    return t;
  },

  // Short effects for the cartoon story. Unknown names are ignored.
  sfx(name) {
    if (muted || !ready()) return;
    switch (name) {
      case 'alarm': [0, 0.13, 0.26, 0.39].forEach((d, i) => sweep('square', i % 2 ? 1700 : 2000, i % 2 ? 1690 : 1990, 0.07, 0.1, d, 0.05)); break;
      case 'pop': this.pop(); break;
      case 'toss': noise(0.32, 'bandpass', 700, 2600, 0.3, 0, 1, 0.1); break;
      case 'slip': sweep('sine', 1500, 220, 0.55, 0.3, 0, 0.2, 9); break;
      case 'thud': sweep('sine', 130, 42, 0.26, 0.45, 0, 0.08); noise(0.08, 'lowpass', 600, 200, 0.12, 0, 1, 0, 'hit'); break;
      case 'bark': [0, 0.17].forEach((d) => { sweep('sawtooth', 300, 170, 0.12, 0.25, d, 0.1); noise(0.1, 'bandpass', 900, 500, 0.14, d, 1.5, 0.05, 'hit'); }); break;
      case 'rain': noise(1.0, 'lowpass', 3600, 2400, 0.14, 0, 0.5, 0.3); break;
      case 'knock': [0, 0.15].forEach((d) => { sweep('sine', 210, 95, 0.07, 0.4, d, 0.05); noise(0.03, 'bandpass', 1400, 800, 0.1, d, 1, 0, 'hit'); }); break;
      case 'creak': this.creak(); break;
      case 'hurr': sweep('sawtooth', 160, 62, 0.55, 0.22, 0, 0.15, 11); noise(0.5, 'lowpass', 700, 250, 0.12, 0, 1, 0.1); break;
      case 'cheer': this.cheer(); break;
      case 'sparkle': this.sparkle(); break;
      default: break;
    }
  },
};
