// QA MK8 without storage (artifact viewer: localStorage / IndexedDB throw): program choice, WRITE, Werksklang zurück, library bank work
import {launch, FILE} from './v3-qa8-lib.mjs';
const sleep = ms => new Promise(r => setTimeout(r, ms));
let fails = 0; const ok = (id, c, info) => { if (!c) fails++; console.log((c ? 'PASS ' : 'FAIL ') + id + (info !== undefined ? ' — ' + (typeof info === 'string' ? info : JSON.stringify(info)) : '')); };
const b = await launch();
const ctx = await b.newContext({viewport: {width: 390, height: 844}, hasTouch: true, isMobile: true});
await ctx.addInitScript(() => { const thr = () => { throw new DOMException('blocked', 'SecurityError'); };
  try { Object.defineProperty(window, 'localStorage', {get: thr, configurable: true}); } catch (e) {}
  try { Object.defineProperty(window, 'sessionStorage', {get: thr, configurable: true}); } catch (e) {}
  try { Object.defineProperty(window, 'indexedDB', {get: thr, configurable: true}); } catch (e) {} });
const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push('PE ' + e)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
await p.goto('file://' + FILE); await p.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.storage().booted, null, {timeout: 30000});
const r = await p.evaluate(async () => { const out = {mode: JSON.stringify(SYNQUENZER.storage()).slice(0, 200)};
  await SYNQUENZER.libraryReady(); SYNQUENZER.setEngine(0, 'mk'); SYNQUENZER.selectTrack(0); SYNQUENZER.openEditor();
  out.sel = mkProg.select(4, 4); SYNQUENZER.mkSet(0, 't.0.f.cut', 50);
  let w; try { w = await mkProg.write(4, 4, 'Ohne Speicher'); } catch (e) { w = 'ERR ' + e; }
  out.w = w && w.bank ? [w.bank, w.slot] : String(w); out.cur = mkProg.current();
  out.own = MKF.ownAt(4, 4) && MKF.ownAt(4, 4).name;
  out.rest = mkProg.restore(4, 4); out.after = mkProg.current();
  openBrowser(0); await new Promise(r => setTimeout(r, 300)); out.rows = document.querySelectorAll('#sndSheet .brow').length; closeBrowser(false);
  return out; });
console.log(JSON.stringify(r));
ok('no storage: select, WRITE, restore, library bank list work', r.sel && Array.isArray(r.w) && r.cur && r.cur.own && r.own === 'Ohne Speicher' && r.rest && r.after && r.after.label === 'D04' && !r.after.own && r.rows === 16, r);
ok('console', errs.length === 0, errs);
console.log(fails ? 'FAIL ' + fails : 'ALL PASS');
await b.close();
