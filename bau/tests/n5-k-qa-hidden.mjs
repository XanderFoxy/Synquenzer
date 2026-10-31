// QA K1 (musiker): hidden modulations that the Mod-Übersicht does not list: FM pitch EG, WT scan, MS 2000 OSC1 STEUER 2 (LFO 1)
import {launch} from './n5-k-blib.mjs';
const {b, p, errs} = await launch();
const r = await p.evaluate(async () => {
  const A = SYNQUENZER; mkLoad(); for (let i = 0; i < 80 && !mkLoaded(); i++) await new Promise(r => setTimeout(r, 100));
  const out = {fmPeg: [], wtScan: [], mkC2: [], counts: {fm: 0, wt: 0, mk: 0}};
  for (const [id, f] of FACTORY_BY_ID) {
    if (!['fm6', 'wt', 'mk'].includes(f.engine)) continue;
    loadPreset(2, id); await new Promise(r => setTimeout(r, 0));
    const s = A.getSound(2), L = A.k1Mods(2);
    if (s.engine === 'fm6') { out.counts.fm++; const g = s.p.fm6 && s.p.fm6.peg; const fx = s.p.fmx; const pit = fx && fx.ops ? fx.ops.filter(o => o.pit && o.pit.l && !o.pit.l.every(x => x === 50)).length : 0;
      if ((g && !g.l.every(x => x === 50)) || pit) out.fmPeg.push({id, name: s.name, peg: g ? g.l.join('/') : null, opsPit: pit, list: L.map(e => e.src + '→' + e.dst)}); }
    if (s.engine === 'wt') { out.counts.wt++; const w = s.p.wt; if (w && w.scan) out.wtScan.push({id, name: s.name, scan: w.scan, scanTime: w.scanTime, list: L.map(e => e.src + '→' + e.dst)}); }
    if (s.engine === 'mk') { out.counts.mk++; const pm = s.p.mk; const n = (pm.mode === 1 || pm.mode === 2) ? 2 : 1;
      for (let k = 0; k < n; k++) { const T = pm.t[k]; if (pm.mode === 3) continue; if (T.o1.c2 > 0 && ![5, 6].includes(T.o1.w)) out.mkC2.push({id, name: s.name, t: k, w: T.o1.w, c2: T.o1.c2, l1: T.l1 ? JSON.stringify(T.l1).slice(0, 60) : '', list: L.filter(e => /Osz 1|LFO 1/.test(e.src + e.dst)).map(e => e.src + '→' + e.dst)}); } }
  }
  return out;
});
console.log('counts', JSON.stringify(r.counts));
console.log('FM with pitch EG:', r.fmPeg.length); for (const x of r.fmPeg.slice(0, 12)) console.log('  ', JSON.stringify(x));
console.log('WT with scan:', r.wtScan.length); for (const x of r.wtScan) console.log('  ', JSON.stringify(x));
console.log('MS 2000 OSC1 STEUER 2 (LFO 1) > 0:', r.mkC2.length); for (const x of r.mkC2.slice(0, 15)) console.log('  ', JSON.stringify(x));
console.log('errors', JSON.stringify(errs.slice(0, 4)));
await b.close();
