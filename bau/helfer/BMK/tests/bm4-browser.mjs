// BM4-09 in Chromium: the app boots, mkLoad() evaluates sq-arp-src first (ARPC, BMARP) and then the MS block (MKUI); no console errors.
import {createRequire} from 'module';
import fs from 'fs';
const {chromium} = createRequire(import.meta.url)('playwright');
const HERE = new URL('.', import.meta.url).pathname;
const b = await chromium.launch({args: ['--autoplay-policy=no-user-gesture-required']}); const p = await (await b.newContext()).newPage(); const errs = [];
p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
await p.goto('file://' + HERE + '../index.html'); await p.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.storage().booted, null, {timeout: 30000});
const r = await p.evaluate(() => { const before = typeof ARPC; const ui = mkLoad(); return {before, arpc: typeof ARPC, bmarp: typeof BMARP, mkui: !!ui && typeof MKUI, arp: typeof MKUI !== 'undefined' && MKUI.arp === ARPC}; });
const ok = r.before === 'undefined' && r.arpc === 'object' && r.bmarp === 'object' && r.mkui === 'object' && r.arp && !errs.length;
console.log((ok ? 'PASS' : 'FAIL') + ' BM4-09 Chromium: mkLoad lädt sq-arp-src, dann den MS-Block — ' + JSON.stringify(r) + ', Fehler ' + errs.length);
fs.writeFileSync(HERE + 'bm4-browser.out.json', JSON.stringify([{id: 'BM4-09 browser', ok, info: JSON.stringify(r)}]));
await b.close(); process.exit(ok ? 0 : 1);
