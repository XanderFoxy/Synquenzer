// Platte im Lock-Modus: F.CUT gelockt, Doppeltipp (zwei Tipps) auf den Regler = Lock weg?
import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
const file = process.argv[2];
const b = await chromium.launch({args: ['--autoplay-policy=no-user-gesture-required']});
const ctx = await b.newContext({viewport: {width: 428, height: 926}, hasTouch: true, isMobile: true, deviceScaleFactor: 2});
const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(String(e)));
await p.goto('file://' + file); await p.waitForTimeout(1800);
const cdp = await ctx.newCDPSession(p);
const T = (type, pts) => cdp.send('Input.dispatchTouchEvent', {type, touchPoints: pts.map((q, k) => ({x: q.x, y: q.y, id: k + 1, radiusX: 4, radiusY: 4, force: 1}))});
const W = ms => p.waitForTimeout(ms);
const r0 = await p.evaluate(async () => {
  const w = ms => new Promise(r => setTimeout(r, ms));
  SYNQUENZER.loadDemo(); ensureAudio(); setEngine(2, 'mk'); await w(400);
  S.tracks[2].clips[0] = {len: 1, key: {root: 0, scale: 'ionian', src: 'user'}, notes: [0, 1, 2, 3].map(t => ({t, d: .4, n: 60, v: .8}))}; clipChanged(2, 0); R.selS = 0; UNDO.length = 0;
  pl1ModeGo(pl1Tg(2, 0, 'rolle', [S.tracks[2].clips[0].notes[1]], '1 Note')); await w(900);
  UI.pl1.pt = performance.now(); mkSetP(2, 't.0.f.cut', 20, true); pl1Flush();
  const k = document.querySelector('#synthSheet [data-k="f.cut"]') || document.querySelector('#synthSheet .mkpk[data-k="f.cut"]');
  const kk = [...document.querySelectorAll('#synthSheet [data-k]')].map(x => x.dataset.k).slice(0, 30);
  if (!k) return {err: 'kein Regler', kk};
  const r = k.getBoundingClientRect();
  return {x: r.left + r.width / 2, y: r.top + r.height / 2, lk: JSON.stringify(S.tracks[2].clips[0].notes[1].lk), undo: UNDO.map(u => u.label), ansicht: MKUI.P.ansicht};
});
console.log('vor', JSON.stringify(r0));
if (r0.x) {
  // erster Tipp im Überblick zoomt evtl. – erst hinein, dann zwei Tipps
  for (let k = 0; k < 2; k++) { await T('touchStart', [{x: r0.x, y: r0.y}]); await W(40); await T('touchEnd', []); await W(600); }
  const r1 = await p.evaluate(() => { const k = document.querySelector('#synthSheet [data-k="f.cut"]'); const r = k.getBoundingClientRect(); return {x: r.left + r.width / 2, y: r.top + r.height / 2, ansicht: MKUI.P.ansicht, lk: JSON.stringify(S.tracks[2].clips[0].notes[1].lk)}; });
  console.log('nach Zoom', JSON.stringify(r1));
  await T('touchStart', [{x: r1.x, y: r1.y}]); await W(40); await T('touchEnd', []); await W(90);
  await T('touchStart', [{x: r1.x, y: r1.y}]); await W(40); await T('touchEnd', []); await W(400);
  const r2 = await p.evaluate(() => ({lk: JSON.stringify(S.tracks[2].clips[0].notes[1].lk || null), cut: SQMK.mkPathGet(S.tracks[2].sound.p.mk, 't.0.f.cut'), undo: UNDO.map(u => u.label), ban: document.querySelector('.pl1ban .pl1bv').textContent, toast: EL.toast.textContent}));
  console.log('Doppeltipp', JSON.stringify(r2));
  await p.evaluate(() => undo()); await W(200);
  console.log('↶', JSON.stringify(await p.evaluate(() => ({lk: JSON.stringify(S.tracks[2].clips[0].notes[1].lk || null), cut: SQMK.mkPathGet(S.tracks[2].sound.p.mk, 't.0.f.cut')}))));
}
console.log('errs', JSON.stringify(errs));
await b.close();
