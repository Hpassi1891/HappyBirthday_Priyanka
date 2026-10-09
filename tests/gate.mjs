// Laptop-only check. Run: node tests/gate.mjs  (needs the site on http://localhost:8000)
import { createRequire } from 'node:module';
import { execSync } from 'node:child_process';
const require = createRequire(import.meta.url);
const { chromium } = require(execSync('npm root -g').toString().trim() + '/playwright');
const BASE = process.env.BASE || 'http://localhost:8000';
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
let failed = 0;
const check = (name, ok) => { console.log((ok ? 'PASS ' : 'FAIL ') + name); if (!ok) failed++; };
const errors = [];

// a phone
const phone = await browser.newContext({ viewport: { width: 390, height: 780 }, hasTouch: true, isMobile: true, deviceScaleFactor: 3 });
const p1 = await phone.newPage();
p1.on('pageerror', (e) => errors.push(e.message));
await p1.goto(BASE + '/?preview=1');
await p1.waitForSelector('#gate', { state: 'visible' });
check('phone: shows the "open on a laptop" message', (await p1.textContent('#gateTitle')).includes('laptop'));
await p1.waitForTimeout(800);
check('phone: the party does not start behind the message', (await p1.locator('.door-scene, .layer').count()) === 0);
check('phone: no theme or sound buttons on the message', !(await p1.locator('#look').isVisible()) && !(await p1.locator('#mute').isVisible()));

// a laptop
const lap = await browser.newContext({ viewport: { width: 1366, height: 768 } });
const p2 = await lap.newPage();
p2.on('pageerror', (e) => errors.push(e.message));
await p2.goto(BASE + '/?preview=1');
await p2.waitForSelector('#door');
check('laptop: no message, the door shows', !(await p2.locator('#gate').isVisible()) && await p2.locator('#door').isVisible());

// a laptop window squeezed too small, then widened again
await p2.setViewportSize({ width: 700, height: 700 });
await p2.waitForSelector('#gate', { state: 'visible' });
check('narrow window: asks for a bigger window', (await p2.textContent('#gateTitle')).includes('bigger'));
await p2.setViewportSize({ width: 1366, height: 768 });
await p2.waitForSelector('#gate', { state: 'hidden' });
check('widening again brings the surprise back', await p2.locator('#door').isVisible());

// a desktop window that is opened narrow then widened still starts exactly once
const late = await browser.newContext({ viewport: { width: 600, height: 700 } });
const p3 = await late.newPage();
p3.on('pageerror', (e) => errors.push(e.message));
await p3.goto(BASE + '/?preview=1');
await p3.waitForSelector('#gate', { state: 'visible' });
await p3.setViewportSize({ width: 1300, height: 760 });
await p3.waitForSelector('#door');
check('opened small then enlarged: the door appears once', (await p3.locator('.layer').count()) === 1);

check('no JS errors', errors.length === 0);
if (errors.length) console.log(errors);
await browser.close();
process.exit(failed ? 1 : 0);
