// Finale smoke test. Run: node tests/finale.mjs  (needs the site on http://localhost:8000)
// Uses ?fast=1 so the 16-second flip book plays in a couple of seconds.
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
const page = await mk({ viewport: { width: 375, height: 700 }, hasTouch: true });
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
check('finale: letter button hidden until the story ends', !(await page.locator('#openLetter').isVisible()));
const before = await page.$eval('#view', (e) => e.innerHTML);
await page.click('#play');
await page.waitForFunction(() => document.querySelector('#cap').textContent.includes('alarm'), null, { timeout: 8000 });
check('finale: first caption appears when the cartoon starts', true);
await page.waitForTimeout(300);
check('finale: the picture is actually animating (it changes over time)', (await page.$eval('#view', (e) => e.innerHTML)) !== before);
check('finale: no page flipping any more', (await page.locator('.fpage').count()) === 0);
await page.waitForSelector('#openLetter', { state: 'visible', timeout: 20000 });
check('finale: story reaches the end and offers the letter', true);
check('finale: last caption mentions the letter', (await page.textContent('#cap')).includes('letter'));
await shot('end');
await page.click('#openLetter');
await page.waitForSelector('#env', { state: 'visible', timeout: 5000 });
await page.waitForTimeout(1500);
await shot('envelope');
await page.click('#env');
await page.waitForSelector('#actions', { state: 'visible', timeout: 15000 });
const text = await page.textContent('#lbody');
check('finale: letter is addressed and written out', text.includes('Dear Chudail') && text.includes('Happy Birthday') && text.includes('Rakshas'));
check('finale: save and replay buttons appear', (await page.locator('#save').isVisible()) && (await page.locator('#replay').isVisible()));
await shot('letter');
const [download] = await Promise.all([page.waitForEvent('download', { timeout: 8000 }).catch(() => null), page.click('#save')]);
check('finale: keepsake card downloads as a png', !!download && download.suggestedFilename().endsWith('.png'));
await page.click('#replay');
await page.waitForSelector('#play', { timeout: 9000 });
await page.waitForFunction(() => document.querySelectorAll('.layer').length === 1, null, { timeout: 9000 });
check('finale: replay brings the play screen back', await page.locator('#play').isVisible());
check('no JS errors', errors.length === 0);
if (errors.length) console.log(errors);
await browser.close();
process.exit(failed ? 1 : 0);
