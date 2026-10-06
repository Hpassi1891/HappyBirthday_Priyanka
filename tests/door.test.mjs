import test from 'node:test';
import assert from 'node:assert/strict';
import { checkAnswer } from '../js/lib/door.js';

test('rakshas opens', () => assert.equal(checkAnswer('  Rakshas ').result, 'open'));
test('himanshu refused', () => assert.equal(checkAnswer('HIMANSHU').result, 'funny'));
test('other is wrong', () => assert.equal(checkAnswer('abc').result, 'wrong'));
test('empty is wrong', () => assert.equal(checkAnswer('').result, 'wrong'));
