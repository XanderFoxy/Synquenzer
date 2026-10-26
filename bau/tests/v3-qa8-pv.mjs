// QA MK8 preview: ▶ for every program of a bank (touch) – audible, arp/seq programs as intended; no mic request by H09–H15
import {launch, open} from './v3-qa8-lib.mjs';
const sleep = ms => new Promise(r => setTimeout(r, ms));
let fails = 0; const ok = (id, c, info) => { if (!c) fails++; console.log((c ? 'PASS ' : 'FAIL ') + id + (info !== undefined ? ' — ' + (typeof info === 'string' ? info : JSON.stringify(info)) : '')); };
const banks = (process.argv[2] || 'AH').split('');
const b = await launch(); const {ctx, page: p, errs} = await open(b, 'P1');
await ctx.addInitScript(() => {});
await p.evaluate(() => { window.__gum = 0; if (navigator.mediaDevices) { const o = navigator.mediaDevices.getUserMedia; navigator.mediaDevices.getUserMedia = function () { window.__gum++; return Promise.reject(new Error('stub')); }; } });
const cdp = await ctx.newCDPSession(p);
const tap = async (x, y, w = 250) => { await cdp.send('Input.dispatchTouchEvent', {type: 'touchStart', touchPoints: [{x, y, id: 1}]}); await sleep(40); await cdp.send('Input.dispatchTouchEvent', {type: 'touchEnd', touchPoints: []}); await sleep(w); };
await p.evaluate(async () => { await SYNQUENZER.libraryReady(); SYNQUENZER.setEngine(0, 'mk'); SYNQUENZER.selectTrack(0); SYNQUENZER.openEditor(); ensureAudio(); });
await sleep(500);
for (const B of banks) {
  const bi = 'ABCDEFGH'.indexOf(B) + 1;
  await p.evaluate(bi => { mkProg.select(bi, 1); }, bi); await sleep(300);
  await p.evaluate(() => { const e = document.querySelector('#synthSheet .sh-head .preset .pv'); e.click(); }); await sleep(500);
  const rows = await p.evaluate(() => [...document.querySelectorAll('#sndSheet .brow')].map(r => r.dataset.id));
  console.log('bank', B, rows.length, 'rows');
  const res = [];
  for (const id of rows) {
    const r0 = await p.evaluate(id => { const r = document.querySelector(`#sndSheet .brow[data-id="${id}"] .bpv`); if (!r) return null; r.scrollIntoView({block: 'center'}); const q = r.getBoundingClientRect(); return {x: q.x + q.width / 2, y: q.y + q.height / 2, w: q.width, h: q.height}; }, id);
    if (!r0) { res.push({id, err: 'no ▶'}); continue; }
    await sleep(120);
    const r1 = await p.evaluate(id => { const r = document.querySelector(`#sndSheet .brow[data-id="${id}"] .bpv`); const q = r.getBoundingClientRect(); return {x: q.x + q.width / 2, y: q.y + q.height / 2}; }, id);
    const pk = p.evaluate(() => new Promise(res => { const a = AU.ctx.createAnalyser(); a.fftSize = 2048; AU.M.ceil.connect(a); const buf = new Float32Array(2048); let pk = 0; const iv = setInterval(() => { a.getFloatTimeDomainData(buf); for (const v of buf) pk = Math.max(pk, Math.abs(v)); }, 20); setTimeout(() => { clearInterval(iv); try { AU.M.ceil.disconnect(a); } catch (e) {} res(+(20 * Math.log10(pk + 1e-9)).toFixed(1)); }, 1800); }));
    await tap(r1.x, r1.y, 100);
    const st = await p.evaluate(() => ({on: PV.on, id: PV.id, notes: PV.notes.length}));
    const lv = await pk;
    await p.evaluate(() => previewStop()); await sleep(400);
    res.push({id, lv, on: st.on && st.id === id, notes: st.notes, hit: [Math.round(r0.w), Math.round(r0.h)]});
  }
  const silent = res.filter(x => !(x.lv > -45) && x.id !== 'f-mk-h15');
  ok('bank ' + B + ': every ▶ starts and sounds (except H15 Eingang)', silent.length === 0 && res.every(x => x.on), silent.length ? silent : res.map(x => x.id.slice(5) + ' ' + x.lv + 'dB n' + x.notes).join(' · '));
  ok('bank ' + B + ': ▶ hit area ≥ 44×44', res.every(x => x.hit && x.hit[0] >= 44 && x.hit[1] >= 44), res.map(x => x.hit && x.hit.join('×')).slice(0, 3));
  if (B === 'H') console.log('H15 preview', JSON.stringify(res.find(x => x.id === 'f-mk-h15')));
  await p.evaluate(() => closeBrowser(false)); await sleep(300);
}
// selecting H09–H15 does not ask for the microphone
const g = await p.evaluate(async () => { for (let s = 9; s <= 15; s++) { mkProg.select(8, s); await new Promise(r => setTimeout(r, 200)); } SYNQUENZER.keyOn(60, .8, 'z'); await new Promise(r => setTimeout(r, 400)); SYNQUENZER.keyOff(60, 'z'); return window.__gum; });
ok('H09–H15 load and play: no getUserMedia call', g === 0, g);
ok('console', errs.length === 0, errs);
console.log(fails ? 'FAIL ' + fails : 'ALL PASS');
await b.close();
