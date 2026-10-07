import test from 'node:test';
import assert from 'node:assert/strict';
import { SHOTS, DURATIONS, TOTAL_SECONDS, locate, renderAt, renderShot } from '../js/lib/story.js';

test('story has 14 shots and runs for a sensible length', () => {
  assert.equal(SHOTS.length, 14);
  assert.ok(TOTAL_SECONDS > 60 && TOTAL_SECONDS < 100, `seconds: ${TOTAL_SECONDS}`);
  assert.equal(DURATIONS.length, 14);
});

test('the story follows the real order of events', () => {
  assert.deepEqual(SHOTS.map((s) => s.id), ['laptop', 'insta', 'accept', 'chat', 'ask', 'ride', 'panfire', 'bfs', 'donut', 'baskin', 'starbucks', 'fight', 'care', 'end']);
});

test('every moment of the story renders valid SVG with no NaN/undefined (sampled at 60 fps)', () => {
  for (let t = 0; t <= TOTAL_SECONDS + 0.5; t += 1 / 60) {
    const svg = renderAt(t);
    assert.ok(svg.startsWith('<svg') && svg.endsWith('</svg>'), `t=${t}`);
    assert.ok(!/NaN|undefined|Infinity/.test(svg), `t=${t.toFixed(2)} has a bad number`);
    assert.equal((svg.match(/<g[ >]/g) || []).length, (svg.match(/<\/g>/g) || []).length, `t=${t.toFixed(2)} has unbalanced groups`);
  }
});

test('locate() walks through the shots in order and stays inside each shot', () => {
  let last = 0;
  for (let t = 0; t < TOTAL_SECONDS; t += 0.05) {
    const { si, t: local } = locate(t);
    assert.ok(si >= last, 'shots go forward');
    assert.ok(local >= 0 && local <= SHOTS[si].dur, 'local time stays in range');
    last = si;
  }
  assert.equal(locate(TOTAL_SECONDS + 5).si, SHOTS.length - 1);
});

test('every shot has a caption, and sound cues fall inside the shot', () => {
  for (const s of SHOTS) {
    assert.ok(s.caption.length > 10, s.id);
    for (const at of Object.keys(s.sfx)) assert.ok(+at >= 0 && +at < s.dur, `${s.id} sfx at ${at}`);
  }
  assert.ok(renderShot(0, 0).includes('<svg'));
});

test('the story mentions the places and things from the real memories', () => {
  const all = SHOTS.map((s) => s.caption + renderShot(SHOTS.indexOf(s), s.dur * 0.7)).join(' ');
  for (const w of ['Pan Fire', 'BFS', 'Harpreet Singh', 'Super Donuts', 'Baskin Robbins', 'Starbucks', 'Meteor 350', 'Fanta', 'chilly paneer']) assert.ok(all.toLowerCase().includes(w.toLowerCase()), w);
});
