import test from 'node:test';
import assert from 'node:assert/strict';
import { FRAMES, SHOTS, TOTAL, renderFrame } from '../js/lib/story.js';

test('story has 11 shots and a sensible number of pages', () => {
  assert.equal(SHOTS.length, 11);
  assert.equal(TOTAL, SHOTS.reduce((a, s) => a + s.n, 0));
  assert.ok(TOTAL >= 120 && TOTAL <= 200, `pages: ${TOTAL}`);
});

test('every frame renders valid-looking SVG with no NaN/undefined', () => {
  for (let i = 0; i < TOTAL; i++) {
    const svg = renderFrame(i);
    assert.ok(svg.startsWith('<svg') && svg.endsWith('</svg>'), `frame ${i}`);
    assert.ok(!/NaN|undefined|Infinity/.test(svg), `frame ${i} has a bad number`);
    assert.equal((svg.match(/<g[ >]/g) || []).length, (svg.match(/<\/g>/g) || []).length, `frame ${i} has unbalanced groups`);
  }
});

test('every shot has a caption and sound cues point at real frames', () => {
  for (const s of SHOTS) {
    assert.ok(s.caption.length > 10, s.id);
    for (const k of Object.keys(s.sfx)) assert.ok(+k < s.n, `${s.id} sfx frame ${k}`);
  }
  assert.ok(FRAMES[TOTAL - 1].last);
});
