import test from 'node:test';
import assert from 'node:assert/strict';
import { SHOTS, DURATIONS, TOTAL_SECONDS, locate, renderAt, renderShot } from '../js/lib/story.js';

test('story has 11 shots and runs for a sensible length', () => {
  assert.equal(SHOTS.length, 11);
  assert.ok(TOTAL_SECONDS > 15 && TOTAL_SECONDS < 40, `seconds: ${TOTAL_SECONDS}`);
  assert.equal(DURATIONS.length, 11);
});

test('every moment of the story renders valid SVG with no NaN/undefined (sampled at 30 fps)', () => {
  for (let t = 0; t <= TOTAL_SECONDS + 0.5; t += 1 / 30) {
    const svg = renderAt(t);
    assert.ok(svg.startsWith('<svg') && svg.endsWith('</svg>'), `t=${t}`);
    assert.ok(!/NaN|undefined|Infinity/.test(svg), `t=${t.toFixed(2)} has a bad number`);
    assert.equal((svg.match(/<g[ >]/g) || []).length, (svg.match(/<\/g>/g) || []).length, `t=${t.toFixed(2)} has unbalanced groups`);
  }
});

test('locate() walks through the shots in order and stays inside each shot', () => {
  let last = 0;
  for (let t = 0; t < TOTAL_SECONDS; t += 0.05) {
    const { si, k } = locate(t);
    assert.ok(si >= last, 'shots go forward');
    assert.ok(k >= 0 && k <= SHOTS[si].n - 1, 'k stays in range');
    last = si;
  }
  assert.equal(locate(TOTAL_SECONDS + 5).si, SHOTS.length - 1);
});

test('every shot has a caption and sound cues point at real frames', () => {
  for (const s of SHOTS) {
    assert.ok(s.caption.length > 10, s.id);
    for (const k of Object.keys(s.sfx)) assert.ok(+k < s.n, `${s.id} sfx frame ${k}`);
  }
  assert.ok(renderShot(0, 0).includes('<svg'));
});
