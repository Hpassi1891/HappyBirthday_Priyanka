// Theme switch test. Run: node tests/look.mjs  (needs the site on http://localhost:8000)
import { createRequire } from 'node:module';
import { execSync } from 'node:child_process';
const require = createRequire(import.meta.url);
const { chromium } = require(execSync('npm root -g').toString().trim() + '/playwright');
const BASE = process.env.BASE || 'http://localhost:8000';
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const ctx = await browser.newContext({ viewport: { width: 1366, height: 768 } });
const page = await ctx.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
let failed = 0;
const check = (name, ok) => { console.log((ok ? 'PASS ' : 'FAIL ') + name); if (!ok) failed++; };
const look = () => page.evaluate(() => document.body.dataset.look);

await page.goto(BASE + '/?preview=1');
await page.waitForSelector('#door');
await page.waitForSelector('#stage:not(.busy)');
check('look: defaults to the cinematic look', (await look()) === 'cinema');
check('look: cinema draws the glowing doorway', (await page.locator('.night-door').count()) === 1 && (await page.textContent('.door-title')).includes('Surprise'));
await page.click('#look'); // cinema -> night
await page.waitForFunction(() => document.body.dataset.look === 'night');
await page.waitForSelector('#stage:not(.busy)');
check('look: next is the dreamy night sky (stars, night door)', (await look()) === 'night' && (await page.locator('#sky i').count()) > 40 && (await page.locator('.night-door').count()) === 1);
check('look: night uses its own door copy', (await page.textContent('.door-title')).includes('Night of Wishes'));
await page.click('#look'); // night -> scrapbook
await page.waitForFunction(() => document.body.dataset.look === 'scrapbook');
await page.waitForSelector('#stage:not(.busy)');
await page.waitForFunction(() => !document.querySelector('.night-door'), null, { timeout: 8000 });
check('look: then the scrapbook diary (and the door is redrawn)', (await look()) === 'scrapbook' && (await page.locator('.door-svg').count()) === 1);
check('look: the choice is remembered', (await page.evaluate(() => localStorage.getItem('look'))) === 'scrapbook');
await page.reload();
await page.waitForSelector('#door');
check('look: still scrapbook after a reload', (await look()) === 'scrapbook');
await page.goto(BASE + '/?preview=1&look=night');
await page.waitForSelector('#door');
check('look: ?look=night overrides the saved choice', (await look()) === 'night');
await page.click('#look');
await page.click('#look', { force: true });
await page.waitForFunction(() => document.body.dataset.look === 'cinema');
await page.waitForSelector('#stage:not(.busy)');
check('look: cycles round back to cinema', (await look()) === 'cinema');
check('no JS errors', errors.length === 0);
if (errors.length) console.log(errors);
await browser.close();
process.exit(failed ? 1 : 0);
