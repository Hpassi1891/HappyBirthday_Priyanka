// Run: node tests/smoke.mjs  (needs the site served on http://localhost:8000)
import { createRequire } from 'node:module';
import { execSync } from 'node:child_process';
const require = createRequire(import.meta.url);
const { chromium } = require(execSync('npm root -g').toString().trim() + '/playwright');

const BASE = process.env.BASE || 'http://localhost:8000';
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const page = await browser.newPage({ viewport: { width: 375, height: 700 }, hasTouch: true });
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
page.on('console', (m) => m.type() === 'error' && !/fonts|ERR_|Failed to load resource/.test(m.text()) && errors.push(m.text()));

let failed = 0;
const check = (name, ok) => { console.log((ok ? 'PASS ' : 'FAIL ') + name); if (!ok) failed++; };

// Locked before the birthday (page clock is real: Oct 2026 in this env, so force it)
await page.clock.install({ time: new Date(2026, 9, 6) });
await page.goto(BASE + '/');
check('locked: countdown visible', await page.locator('#count').isVisible());
check('locked: no input', !(await page.locator('#answer').isVisible()));

// Preview mode
await page.goto(BASE + '/?preview=1');
await page.fill('#answer', 'Himanshu');
await page.click('button[type=submit]');
check('himanshu: funny message', (await page.textContent('#msg')).includes('Himanshu'));
check('himanshu: door stays', await page.locator('#answer').isVisible());
await page.fill('#answer', 'abc');
await page.click('button[type=submit]');
check('wrong: sassy message', (await page.textContent('#msg')).length > 5);
await page.fill('#answer', 'rakshas');
await page.click('button[type=submit]');
await page.waitForSelector('.door-scene', { state: 'detached', timeout: 5000 }).catch(() => {});
await page.waitForTimeout(300);
check('rakshas: moves past the door', !(await page.locator('.door-scene').count()));

// Room: lights + banner
await page.goto(BASE + '/?scene=room');
await page.click('#switch');
check('room: lights on', await page.locator('.room.lit').count() === 1);
// drag the first tile onto the banner
const first = page.locator('.tile').first();
const ch = await first.getAttribute('data-ch');
const tb = await first.boundingBox();
const target = page.locator(`.slot[data-ch="${ch}"]`).first();
const sb = await target.boundingBox();
await page.mouse.move(tb.x + tb.width / 2, tb.y + tb.height / 2);
await page.mouse.down();
await page.mouse.move(sb.x + sb.width / 2, sb.y + sb.height / 2, { steps: 8 });
await page.mouse.up();
await page.waitForTimeout(700);
check('room: drag places letter', (await page.locator('.slot.filled').count()) === 1);
// tap the rest
while (await page.locator('.tile:not(.spacer)').count()) {
  const before = await page.locator('.tile:not(.spacer)').count();
  await page.locator('.tile:not(.spacer)').first().click();
  await page.waitForFunction((n) => document.querySelectorAll('.tile:not(.spacer)').length < n, before, { timeout: 5000 });
}
check('room: banner complete', (await page.locator('.slot:not(.filled)').count()) === 0);
check('room: continue appears', await page.locator('#go').isVisible());
await page.click('#go');
await page.waitForTimeout(400);
check('room: advances to next scene', !(await page.locator('.room').count()));

// Fav wall
await page.goto(BASE + '/?scene=favwall');
check('favwall: 12 frames', (await page.locator('.frame').count()) === 12);
check('favwall: continue hidden at start', !(await page.locator('#go').isVisible()));
for (let i = 0; i < 4; i++) {
  await page.locator('.frame').nth(i).click({ force: true });
  await page.waitForSelector('.zoom', { timeout: 3000 });
  if (i === 0) check('favwall: zoom shows title', (await page.textContent('.zoom-title')) === 'Movie #1');
  await page.click('.zoom .btn');
  await page.waitForSelector('.zoom', { state: 'detached', timeout: 3000 });
}
check('favwall: counter 4/12', (await page.textContent('.fav-count')).includes('4 / 12'));
check('favwall: continue appears after 4', await page.locator('#go').isVisible());
await page.click('#go');
await page.waitForTimeout(300);
check('favwall: advances', !(await page.locator('.fav-scene').count()));

check('no JS errors', errors.length === 0);
if (errors.length) console.log(errors);
await browser.close();
process.exit(failed ? 1 : 0);
