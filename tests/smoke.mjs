// Run: node tests/smoke.mjs  (needs the site served on http://localhost:8000)
import { createRequire } from 'node:module';
import { execSync } from 'node:child_process';
const require = createRequire(import.meta.url);
const { chromium } = require(execSync('npm root -g').toString().trim() + '/playwright');

const BASE = process.env.BASE || 'http://localhost:8000';
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
let page = await browser.newPage({ viewport: { width: 375, height: 700 }, hasTouch: true });
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
await page.waitForSelector('#stage:not(.busy)');
await page.fill('#answer', 'Himanshu');
await page.click('button[type=submit]');
check('himanshu: funny message', (await page.textContent('#msg')).includes('Himanshu'));
check('himanshu: door stays', await page.locator('#answer').isVisible());
await page.fill('#answer', 'abc');
await page.click('button[type=submit]');
check('wrong: sassy message', (await page.textContent('#msg')).length > 5);
await page.fill('#answer', 'rakshas');
await page.click('button[type=submit]');
await page.waitForSelector('.room', { timeout: 9000 });
await page.waitForSelector('.door-scene', { state: 'detached', timeout: 9000 });
check('rakshas: moves past the door', !(await page.locator('.door-scene').count()));

// Room: dark mural, torch, light switch
await page.close();
page = await browser.newPage({ viewport: { width: 375, height: 700 }, hasTouch: true });
page.on('pageerror', (e) => errors.push(e.message));
await page.goto(BASE + '/?scene=room');
await page.waitForSelector('#switch');
await page.waitForSelector('#stage:not(.busy)');
check('room: starts dark', (await page.locator('.room.lit').count()) === 0);
check('room: mural painted on the wall', (await page.locator('.mural .flag').count()) >= 19);
await page.mouse.move(120, 300);
await page.waitForTimeout(500);
const tx = await page.$eval('#dim', (e) => parseFloat(e.style.getPropertyValue('--x')));
check('room: torch follows the pointer', tx > 90 && tx < 130);
await page.click('#switch');
await page.waitForSelector('.room.lit', { timeout: 3000 });
check('room: lights on', true);
check('room: continue is not shown straight away', !(await page.locator('#go').isVisible()));
await page.waitForSelector('#go', { state: 'visible', timeout: 9000 });
check('room: continue appears once the wall is lit', true);
await page.locator('.bal').first().click({ force: true });
check('room: balloon pops', (await page.locator('.bal[data-popped]').count()) === 1);
await page.click('#go');
await page.waitForSelector('.room', { state: 'detached', timeout: 9000 });
check('room: advances to next scene', !(await page.locator('.room').count()));

// Fav wall
await page.goto(BASE + '/?scene=favwall');
await page.waitForSelector('.frame');
await page.waitForSelector('#stage:not(.busy)');
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
await page.waitForSelector('.fav-scene', { state: 'detached', timeout: 9000 });
check('favwall: advances', !(await page.locator('.fav-scene').count()));

// Photo wall
await page.goto(BASE + '/?scene=photos');
await page.waitForSelector('.polaroid');
await page.waitForSelector('#stage:not(.busy)');
check('photos: 6 polaroids', (await page.locator('.polaroid').count()) === 6);
check('photos: continue hidden at start', !(await page.locator('#go').isVisible()));
for (let i = 0; i < 3; i++) {
  await page.locator('.polaroid').nth(i).click({ force: true });
  await page.waitForTimeout(150);
}
check('photos: flipped state set', (await page.locator('.polaroid.flipped').count()) === 3);
check('photos: counter 3/6', (await page.textContent('.fav-count')).includes('3 / 6'));
check('photos: continue appears after 3', await page.locator('#go').isVisible());
await page.locator('.polaroid').first().click({ force: true }); // flip back
check('photos: flips back', (await page.locator('.polaroid.flipped').count()) === 2);
await page.click('#go');
await page.waitForSelector('.photo-scene', { state: 'detached', timeout: 9000 });
check('photos: advances', !(await page.locator('.photo-scene').count()));

check('no JS errors', errors.length === 0);
if (errors.length) console.log(errors);
await browser.close();
process.exit(failed ? 1 : 0);
