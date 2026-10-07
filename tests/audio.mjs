// Renders every sound offline in a real browser and checks it: audible, not clipping, no bad numbers.
// Run: node tests/audio.mjs  (needs the site on http://localhost:8000)
import { createRequire } from 'node:module';
import { execSync } from 'node:child_process';
const require = createRequire(import.meta.url);
const { chromium } = require(execSync('npm root -g').toString().trim() + '/playwright');
const BASE = process.env.BASE || 'http://localhost:8000';
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const page = await browser.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
await page.goto(BASE + '/tools/storyboard.html');   // any page on the site will do; we only need module imports
const CUES = ['click', 'pop', 'sparkle', 'wrong', 'creak', 'cheer', 'flip', 'glow', 'puff', 'slice', 'badum', 'whoosh', 'swell', 'thump', 'twang', 'arrow', 'bloom', 'chime', 'ding', 'birthday',
  'sfx:alarm', 'sfx:toss', 'sfx:slip', 'sfx:thud', 'sfx:bark', 'sfx:rain', 'sfx:knock', 'sfx:hurr'];
const results = await page.evaluate(async (cues) => {
  const { audio } = await import('/js/lib/audio.js');
  const out = [];
  for (const cue of cues) {
    const off = new OfflineAudioContext(2, 44100 * 14, 44100);
    audio.attach(off);
    let ret;
    if (cue.startsWith('sfx:')) audio.sfx(cue.slice(4)); else ret = audio[cue]();
    const buf = await off.startRendering();
    let peak = 0, sum = 0, n = 0, bad = 0, last = 0;
    for (let ch = 0; ch < 2; ch++) {
      const d = buf.getChannelData(ch);
      for (let i = 0; i < d.length; i++) { const v = d[i]; if (!Number.isFinite(v)) bad++; const a = Math.abs(v); if (a > peak) peak = a; sum += v * v; n++; if (a > 0.0005) last = Math.max(last, i); }
    }
    out.push({ cue, peak: +peak.toFixed(3), rms: +Math.sqrt(sum / n).toFixed(4), bad, seconds: +(last / 44100).toFixed(2), ret });
  }
  return out;
}, CUES);
let failed = 0;
for (const r of results) {
  const ok = r.bad === 0 && r.peak >= 0.08 && r.peak <= 1.0 && r.rms > 0.0003;
  console.log((ok ? 'PASS ' : 'FAIL ') + `${r.cue.padEnd(12)} peak ${String(r.peak).padEnd(6)} rms ${String(r.rms).padEnd(7)} ~${r.seconds}s`);
  if (!ok) failed++;
}
const bd = results.find((r) => r.cue === 'birthday');
const okLen = bd.ret > 10 && bd.ret < 18;
console.log((okLen ? 'PASS ' : 'FAIL ') + `birthday tune length ${bd.ret}s`);
if (!okLen) failed++;
console.log((errors.length === 0 ? 'PASS ' : 'FAIL ') + 'no JS errors');
if (errors.length) { console.log(errors); failed++; }
await browser.close();
process.exit(failed ? 1 : 0);
