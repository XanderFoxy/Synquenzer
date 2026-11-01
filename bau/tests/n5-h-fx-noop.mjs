// VC2a-fix: sind die leeren 'Clip'-Ereignisse im VC2a-01-Skript Gesten ohne Datenänderung? (Pause 0 und 2,1 s)
import { launch, installGestures } from './n5-h-lib.mjs';
for (const PAUSE of [0, 2100]) {
  const {b, p} = await launch();
  await installGestures(p);
  await p.evaluate(() => window.__setup());
  await p.waitForTimeout(2600); await p.evaluate(() => historyCheck());
  const order = ['track', 'track', 'tflag', 'takesGroup', 'takes', 'group', 'track'];
  const rot = ['clip', 'sound', 'fx', 'set', 'part', 'kit', 'songChord', 'own', 'mkin', 'mkslot', 'takes', 'clipDel1', 'takesGroup'];
  while (order.length < 100) order.push(rot[order.length % rot.length]);
  const r = await p.evaluate(async ([order, PAUSE]) => {
    const G = window.__G, sl = ms => new Promise(r => setTimeout(r, ms)); let sel = 0; const out = [];
    G.clipDel1 = () => { const t = 1 + (sel % 3); window.SYNQUENZER.setClip(t, 6, (sel % 2) ? null : {len: 1, notes: [{t: 0, d: 1, n: 62, v: .7}]}); };
    for (let i = 0; i < order.length; i++) {
      const n0 = HIST.cur.strs.length, snap = JSON.stringify(S.tracks.map(t => t.clips));
      await G[order[i]](); await sl(0); await sl(PAUSE || 1);
      if (order[i] === 'clipDel1' || order[i] === 'clip') { histDrainNow(); const ev = HIST.cur.strs.slice(n0).map(s => JSON.parse(s)).filter(e => e.u === 'clip'); out.push({i, g: order[i], changed: snap !== JSON.stringify(S.tracks.map(t => t.clips)), d: ev.map(e => e.d.length)}); }
      if (i % 3 === 0) { G.sel(); sel++; } if (i % 7 === 0) { G.sel(); sel++; }
    }
    return out;
  }, [order, PAUSE]);
  console.log('PAUSE', PAUSE, 'leere Clip-Ereignisse', r.filter(x => x.d.includes(0)).length, 'davon ohne Datenänderung', r.filter(x => x.d.includes(0) && !x.changed).length, JSON.stringify(r.filter(x => x.d.includes(0))));
  await b.close();
}
