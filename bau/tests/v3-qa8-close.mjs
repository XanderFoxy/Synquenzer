import {launch, open} from './v3-qa8-lib.mjs';
const sleep = ms => new Promise(r => setTimeout(r, ms));
let fails = 0; const ok = (id, c, info) => { if (!c) fails++; console.log((c ? 'PASS ' : 'FAIL ') + id + (info !== undefined ? ' — ' + (typeof info === 'string' ? info : JSON.stringify(info)) : '')); };
const b = await launch();
for (const f of ['P1', 'L1']) {
  const {ctx, page: p, errs} = await open(b, f);
  const cdp = await ctx.newCDPSession(p);
  const tap = async (x, y, w = 300) => { await cdp.send('Input.dispatchTouchEvent', {type: 'touchStart', touchPoints: [{x, y, id: 1}]}); await sleep(40); await cdp.send('Input.dispatchTouchEvent', {type: 'touchEnd', touchPoints: []}); await sleep(w); };
  await p.evaluate(async () => { await SYNQUENZER.libraryReady(); SYNQUENZER.setEngine(0, 'mk'); SYNQUENZER.selectTrack(0); SYNQUENZER.openEditor(); mkProg.select(2, 3); });
  await sleep(500);
  const outside = () => p.evaluate(() => { const q = document.querySelector('#popLayer .pop'); const r = q.getBoundingClientRect(); const W = innerWidth, H = innerHeight; const c = [[4, H - 4], [W - 4, H - 4], [4, 4], [W - 4, 4]].find(([x, y]) => x < r.left || x > r.right || y < r.top || y > r.bottom); return c; });
  for (const [name, sel] of [['Sichern', '#synthSheet .sh-head .hb.sv']]) {
    const u0 = await p.evaluate(() => [SYNQUENZER.undoInfo().n, JSON.stringify(S.tracks[0].sound), SYNQUENZER.library().length]);
    await p.evaluate(s => document.querySelector(s).click(), sel); await sleep(300);
    const o = await outside(); await tap(o[0], o[1]);
    const r = await p.evaluate(() => [!!document.querySelector('#popLayer .pop'), SYNQUENZER.undoInfo().n, JSON.stringify(S.tracks[0].sound), SYNQUENZER.library().length]);
    ok(f + ' ' + name + ' pop closes with an outside tap, nothing changed', !r[0] && r[1] === u0[0] && r[2] === u0[1] && r[3] === u0[2], {open: r[0], du: r[1] - u0[0], lib: r[3] - u0[2], at: o});
  }
  const st = await p.evaluate(() => ({ed: R.editor, pv: !!document.querySelector('#synthSheet .sh-head .preset .pv'), head: (document.querySelector('#synthSheet .sh-head') || {}).innerText}));
  console.log('state after outside tap', JSON.stringify(st));
  if (!st.pv) { await p.evaluate(() => { SYNQUENZER.selectTrack(0); SYNQUENZER.openEditor(); }); await sleep(500); }
  const tapSel = async s => { const r = await p.evaluate(s => { const e = document.querySelector(s); const q = e.getBoundingClientRect(); return [q.x + q.width / 2, q.y + q.height / 2]; }, s); await tap(r[0], r[1], 400); };
  await tapSel('#synthSheet .sh-head .preset .pv'); await tapSel('#sndSheet .brbank');
  const o2 = await outside(); await tap(o2[0], o2[1]);
  const r2 = await p.evaluate(() => [!!document.querySelector('#popLayer .pop'), BR.bank, R.editor]);
  ok(f + ' Bank ▾ closes with an outside tap, bank unchanged', !r2[0] && r2[1] === 2, r2);
  // Sichern pop open, then Stop / scene launch (Typical A.6)
  await p.evaluate(() => closeBrowser(false)); await sleep(300);
  await p.evaluate(() => { SYNQUENZER.play(); }); await tapSel('#synthSheet .sh-head .hb.sv');
  await p.evaluate(() => SYNQUENZER.stop()); await sleep(300);
  const r3 = await p.evaluate(() => !!document.querySelector('#popLayer .pop.mk8w'));
  console.log(f, 'Sichern pop still open after Stop:', r3, '(same as other popups?)');
  await p.evaluate(() => closePop());
  ok(f + ' console', errs.length === 0, errs);
  await ctx.close();
}
console.log(fails ? 'FAIL ' + fails : 'ALL PASS');
await b.close();
