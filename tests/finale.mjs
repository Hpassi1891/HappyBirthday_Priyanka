// Finale smoke test. Run: node tests/finale.mjs  (needs the site on http://localhost:8000)
// Uses ?fast=1 so the cartoon plays in a couple of seconds.
import { createRequire } from 'node:module';
import { execSync } from 'node:child_process';
const require = createRequire(import.meta.url);
const { chromium } = require(execSync('npm root -g').toString().trim() + '/playwright');
const BASE = process.env.BASE || 'http://localhost:8000';
const SHOTS = process.env.SHOTS; // optional folder to save screenshots in
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
// LOOK=scrapbook|night picks the theme under test (default: whatever the site defaults to)
const LOOK = process.env.LOOK;
const mk = async (opts) => { const c = await browser.newContext(opts); if (LOOK) await c.addInitScript((l) => localStorage.setItem('look', l), LOOK); return c.newPage(); };
const page = await mk({ viewport: { width: 1366, height: 768 } });
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
page.on('console', (m) => m.type() === 'error' && !/fonts|ERR_|Failed to load resource/.test(m.text()) && errors.push(m.text()));
let failed = 0;
const check = (name, ok) => { console.log((ok ? 'PASS ' : 'FAIL ') + name); if (!ok) failed++; };
const shot = async (n) => { if (SHOTS) await page.screenshot({ path: `${SHOTS}/${n}.png` }); };

await page.goto(BASE + '/?scene=finale&fast=1');
await page.waitForSelector('#play');
await page.waitForSelector('#stage:not(.busy)');
await page.waitForTimeout(1500);
check('finale: the cartoon screen is taped up with a play button', await page.locator('#play').isVisible());
check('finale: next button hidden until the story ends', !(await page.locator('#toEnd').isVisible()));
const before = await page.$eval('#view', (e) => e.innerHTML);
await page.click('#play');
await page.waitForFunction(() => document.querySelector('#cap').textContent.includes('laptop'), null, { timeout: 8000 });
check('finale: first caption appears when the cartoon starts', true);
await page.waitForTimeout(300);
check('finale: the picture is actually animating (it changes over time)', (await page.$eval('#view', (e) => e.innerHTML)) !== before);
check('finale: no page flipping any more', (await page.locator('.fpage').count()) === 0);
await page.waitForSelector('#toEnd', { state: 'visible', timeout: 20000 });
check('finale: story reaches the end and offers the last step', true);
check('finale: no letter any more', (await page.locator('#openLetter, #env, #lbody').count()) === 0);
check('finale: closing caption', (await page.textContent('#cap')).includes('story'));
await shot('end');
await page.click('#toEnd');
await page.waitForSelector('.end-scene', { timeout: 12000 });
await page.waitForSelector('#stage:not(.busy)', { timeout: 9000 });
check('ending: the tree scene is shown', await page.locator('#tree').isVisible());
await page.waitForSelector('#play', { state: 'visible' });
await page.waitForFunction(() => parseFloat(getComputedStyle(document.querySelector('.end-name')).opacity) > 0.9, null, { timeout: 15000 });
check('ending: her name and the sign-off appear', (await page.textContent('.end-name')) === 'Priyanka' && (await page.textContent('.end-from')).includes('Rakshas'));
await shot('ending');
await page.click('#play');
await page.waitForFunction(() => document.querySelector('#play').textContent.includes('❚❚'), null, { timeout: 3000 });
check('ending: play starts the birthday tune', true);
await page.click('#again');
await page.waitForSelector('.intro-scene', { timeout: 9000 });
await page.waitForSelector('.end-scene', { state: 'detached', timeout: 9000 });
check('ending: watch again goes back to the opening', true);
check('no JS errors', errors.length === 0);
if (errors.length) console.log(errors);
await browser.close();
process.exit(failed ? 1 : 0);
