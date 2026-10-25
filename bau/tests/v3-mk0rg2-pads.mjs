// QA regression MK0: drum pads by touch (drum track selected, transport stopped and running), API pads; base vs new
import { open, NEW, BASE, OUT } from './v3-mk0rg2-lib.mjs';
import fs from 'fs';
const [which, vp] = process.argv.slice(2);
const {p, errs, close} = await open(which === 'base' ? BASE : NEW, vp, true);
const r = {};
await p.evaluate(() => { const Q = window.SYNQUENZER; Q.selectSlot(4, 1); }); await p.waitForTimeout(400);
const pts = await p.evaluate(() => [...document.querySelectorAll('.pad')].filter(x => x.offsetParent).map(e => { const q = e.getBoundingClientRect(); return {x: q.x + q.width / 2, y: q.y + q.height / 2}; }));
r.nPads = pts.length;
await p.evaluate(() => window.SYNQUENZER.clearLog());
for (const q of pts.slice(0, 8)) { await p.touchscreen.tap(q.x, q.y); await p.waitForTimeout(80); }
r.padsStopped = await p.evaluate(() => window.SYNQUENZER.noteLog(100).filter(n => n.track === 4).map(n => n.out));
await p.evaluate(() => { const Q = window.SYNQUENZER; Q.clearLog(); Q.pad('kick'); Q.pad('snare'); Q.pad(42); });
await p.waitForTimeout(200);
r.padsApi = await p.evaluate(() => window.SYNQUENZER.noteLog(100).filter(n => n.track === 4).map(n => n.out));
await p.evaluate(() => { const Q = window.SYNQUENZER; Q.setBpm(120); Q.launchScene(0); }); await p.waitForTimeout(800);
await p.evaluate(() => window.SYNQUENZER.clearLog());
for (const q of pts.slice(0, 4)) { await p.touchscreen.tap(q.x, q.y); await p.waitForTimeout(80); }
r.padsRunning = await p.evaluate(() => window.SYNQUENZER.noteLog(200).filter(n => n.track === 4 && n.src === 'live').map(n => n.out));
await p.evaluate(() => window.SYNQUENZER.stop());
r.errs = errs.slice();
fs.writeFileSync(OUT + `pads-${which}-${vp}.json`, JSON.stringify(r, null, 1)); console.log(which, vp, 'done'); await close();
