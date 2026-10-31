// VC2a-fix: Fehlersuche im Benutzer-Tempo – je Geste die Ereignisse und Umweg-Funde
import { launch, installGestures } from './n5-h-lib.mjs';
const PAUSE = +(process.env.PAUSE || 2100);
const {b, p, errs} = await launch();
await installGestures(p);
await p.evaluate(() => window.__setup());
await p.waitForTimeout(2600); await p.evaluate(() => historyCheck());
const order = ['track', 'track', 'tflag', 'takesGroup', 'takes', 'group', 'track'];
const rot = ['clip', 'sound', 'fx', 'set', 'part', 'kit', 'songChord', 'own', 'mkin', 'mkslot', 'takes', 'clipDel1', 'takesGroup'];
while (order.length < (+process.env.N || 40)) order.push(rot[order.length % rot.length]);
const r = await p.evaluate(async ([order, PAUSE]) => {
  const G = window.__G, sl = ms => new Promise(r => setTimeout(r, ms)); let sel = 0; const out = [];
  G.clipDel1 = () => { const t = 1 + (sel % 3); window.SYNQUENZER.setClip(t, 6, (sel % 2) ? null : {len: 1, notes: [{t: 0, d: 1, n: 62, v: .7}]}); };
  for (let i = 0; i < order.length; i++) {
    const n0 = HIST.cur.strs.length, s0 = HIST.stray.length;
    await G[order[i]](); await sl(0);
    if (i % 3 === 0) { G.sel(); sel++; } if (i % 7 === 0) { G.sel(); sel++; }
    await sl(PAUSE);
    const ev = HIST.cur.strs.slice(n0).map(s => JSON.parse(s)).filter(e => e.u !== 'ctx');
    out.push(i + ' ' + order[i] + ' → ' + ev.map(e => e.u + '/' + e.l + ' d' + (e.d || []).length + ' [' + [...new Set((e.d || []).map(o => o.path.split('/').slice(1, 5).join('/')))].join(' ') + ']').join(' | ') + (HIST.stray.length > s0 ? '  STRAY ' + JSON.stringify(HIST.stray.slice(s0)) : ''));
  }
  return out;
}, [order, PAUSE]);
console.log(r.join('\n'));
console.log('check', JSON.stringify(await p.evaluate(() => historyCheck({detail: true}))), 'errs', errs.slice(0, 3));
await b.close();
