// Smoke (nach bau/tests/smoke.mjs): Seite lädt ohne Fehler.  NODE_PATH=<playwright> node smoke.mjs <index.html> [shot.png]
import {createRequire} from 'module'; const {chromium} = createRequire(import.meta.url)('playwright');
const file = process.argv[2];
const b = await chromium.launch(); const p = await b.newPage({viewport: {width: 390, height: 844}});
const errs = []; p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
await p.goto('file://' + file); await p.waitForTimeout(1500);
await p.screenshot({path: process.argv[3] || 'shot.png'});
console.log('title', await p.title(), 'errors', JSON.stringify(errs));
await b.close();
