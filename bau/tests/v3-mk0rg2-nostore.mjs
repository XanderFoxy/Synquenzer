// QA regression MK0: viewer-like sandbox where localStorage / IndexedDB throw; boot, play, edit, save, new project; base vs new
import { launch, NEW, BASE, OUT } from './v3-mk0rg2-lib.mjs';
import fs from 'fs';
const [which] = process.argv.slice(2);
const b = await launch(); const ctx = await b.newContext({viewport: {width: 390, height: 844}, hasTouch: true, isMobile: true});
await ctx.addInitScript(() => { const thr = () => { throw new DOMException('denied', 'SecurityError'); };
  Object.defineProperty(window, 'localStorage', {get: thr, configurable: true}); Object.defineProperty(window, 'sessionStorage', {get: thr, configurable: true});
  Object.defineProperty(window, 'indexedDB', {get: thr, configurable: true}); });
const p = await ctx.newPage(); const errs = [];
p.on('pageerror', e => errs.push('PAGEERR ' + e)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
await p.goto('file://' + (which === 'base' ? BASE : NEW));
const r = {};
try {
  await p.waitForFunction(() => window.SYNQUENZER && window.SYNQUENZER.storage && window.SYNQUENZER.storage().booted, null, {timeout: 30000});
  await p.waitForTimeout(800);
  r.st = await p.evaluate(() => { const s = window.SYNQUENZER.storage(); return {mode: s.mode, booted: s.booted}; });
  r.play = await p.evaluate(async () => { const Q = window.SYNQUENZER; Q.setBpm(200); Q.clearLog(); Q.launchScene(0); await new Promise(r => setTimeout(r, 2500)); const n = Q.noteLog(500).filter(x => x.beat != null).length; Q.stop(); return n > 10; });
  r.edit = await p.evaluate(async () => { const Q = window.SYNQUENZER; Q.setClip(3, 2, {len: 1, notes: [{t: 0, d: 1, n: 60, v: .8}]}); const a = await Q.save().catch(e => 'err ' + e); await Q.newProject({init: true}); return {save: String(a), n: Q.project().tracks.length}; });
  r.ban = await p.evaluate(() => !!document.getElementById('nvBan'));
} catch (e) { r.FAIL = String(e).slice(0, 300); }
r.errs = errs.slice();
fs.writeFileSync(OUT + `nostore-${which}-P1.json`, JSON.stringify(r, null, 1)); console.log(which, 'done'); await b.close();
