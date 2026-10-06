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

check('no JS errors', errors.length === 0);
if (errors.length) console.log(errors);
await browser.close();
process.exit(failed ? 1 : 0);
