import test from 'node:test';
import assert from 'node:assert/strict';
import { isUnlocked, timeLeft } from '../js/lib/countdown.js';

test('locked before birthday', () => assert.equal(isUnlocked(new Date(2026, 10, 10, 23, 59)), false));
test('unlocked on birthday', () => assert.equal(isUnlocked(new Date(2026, 10, 11, 0, 0)), true));
test('preview bypass', () => assert.equal(isUnlocked(new Date(2026, 0, 1), { preview: true }), true));
test('timeLeft', () => assert.deepEqual(timeLeft(new Date(2026, 10, 9, 22, 59, 30)), { d: 1, h: 1, m: 0, s: 30 }));
test('timeLeft clamps at zero', () => assert.deepEqual(timeLeft(new Date(2027, 0, 1)), { d: 0, h: 0, m: 0, s: 0 }));
