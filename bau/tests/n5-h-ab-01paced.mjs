// VC2a-01 Abnahme im Benutzer-Tempo: das Gesten-Skript des Builders (n5-h-01.mjs: 100 Gesten über alle Arten, 10x Undo, 5x Redo,
// Auswahlwechsel), aber mit 2,1 s zwischen den Gesten (wie ein Mensch) – entstehen genau 115 Daten-Ereignisse, jedes mit Patch?
import { launch, installGestures } from './n5-h-lib.mjs';
const PAUSE = +(process.env.PAUSE || 2100);
const {b, p, errs} = await launch();
await installGestures(p);
await p.evaluate(() => window.__setup());
await p.evaluate(() => historyCheck());
await p.waitForTimeout(2600); await p.evaluate(() => historyCheck());
const base = await p.evaluate(() => HIST.cur.strs.length);
const order = ['track', 'track', 'tflag', 'takesGroup', 'takes', 'group', 'track'];
const rot = ['clip', 'sound', 'fx', 'set', 'part', 'kit', 'songChord', 'own', 'mkin', 'mkslot', 'takes', 'clipDel1', 'takesGroup'];
while (order.length < 100) order.push(rot[order.length % rot.length]);
const r = await p.evaluate(async ([order, PAUSE]) => {
  const G = window.__G, sl = ms => new Promise(r => setTimeout(r, ms)); let sel = 0; const bad = [];
  G.clipDel1 = () => { const t = 1 + (sel % 3); window.SYNQUENZER.setClip(t, 6, (sel % 2) ? null : {len: 1, notes: [{t: 0, d: 1, n: 62, v: .7}]}); };
  for (let i = 0; i < order.length; i++) {
    const top0 = UNDO[UNDO.length - 1]; await G[order[i]](); await sl(0);
    if (UNDO[UNDO.length - 1] === top0) bad.push(i + ':' + order[i]);
    if (i % 3 === 0) { G.sel(); sel++; } if (i % 7 === 0) { G.sel(); sel++; }
    await sl(PAUSE);
  }
  for (let i = 0; i < 10; i++) { undo(); if (i % 4 === 0) { G.sel(); sel++; } await sl(PAUSE); }
  for (let i = 0; i < 5; i++) { redo(); await sl(PAUSE); }
  await sl(2600);
  return {bad, sel};
}, [order, PAUSE]);
const evs = await p.evaluate(b => HIST.cur.strs.slice(b).map(s => JSON.parse(s)), base);
const data = evs.filter(e => e.u !== 'ctx');
const emptyGesture = data.filter(e => e.u !== 'proj' && (!e.d || !e.d.length) && e.u !== 'mkslot');
const byU = {}; for (const e of data) byU[e.u] = (byU[e.u] || 0) + 1;
console.log(JSON.stringify({pauseMs: PAUSE, noUndo: r.bad, selChanges: r.sel, dataEvents: data.length, expected: 115, byU, projEvents: data.filter(e => e.u === 'proj').length,
  gestureEventsWithEmptyPatch: emptyGesture.length, examples: emptyGesture.slice(0, 6).map(e => e.u + ' „' + e.l + '“')}));
console.log('check', JSON.stringify(await p.evaluate(() => historyCheck({detail: true}))), 'errs', errs.slice(0, 3));
await b.close();
