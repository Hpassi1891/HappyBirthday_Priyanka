import test from 'node:test';
import assert from 'node:assert/strict';
import { detectBlow } from '../js/lib/blow.js';

test('silence is not a blow', () => assert.equal(detectBlow(new Array(30).fill(0.01)), false));
test('sustained loud noise is a blow', () => assert.equal(detectBlow(new Array(30).fill(0.3)), true));
test('short spike is not a blow', () => {
  const l = new Array(30).fill(0.01); l[29] = 0.9; l[28] = 0.9;
  assert.equal(detectBlow(l), false);
});
