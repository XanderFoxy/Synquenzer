import {launch, openApp, R, mtof, OPEN, mergeO, SR} from './v3-qa-mk2-lib.mjs';
import {db, rms, centroid, spectrum, pdb} from './v3-mk1-ana.mjs';
const b = await launch(); const {page} = await openApp(b, new URL('../mk-wt/index.html', import.meta.url).pathname);
const M = (x, d = 0) => Math.round(x * 10 ** d) / 10 ** d;
// noise CUTOFF (C1) at C3: centroid and level; RESO (C2): peak prominence at the cutoff
const cs = [], lv = []; for (const c1 of [0, 32, 64, 95, 127]) { const x = (await R(page, mergeO({o1: {w: 6, c1, c2: 0}}, OPEN), [[0, 'on', 48, .8]], {sec: .5})).l; cs.push(centroid(x, 0, 8192, SR)); lv.push(db(rms(x, 0, 14400))); }
console.log('noise CUTOFF M-SP', cs.map(x => M(x)).join(' '), 'level', lv.map(x => M(x, 1)).join(' '));
const pk = []; for (const c2 of [0, 32, 64, 95, 127]) { const P = new Float64Array(8192); for (const seed of [1, 2, 3, 4, 5, 6, 7, 8]) { const x = (await R(page, mergeO({o1: {w: 6, c1: 60, c2}}, OPEN), [[0, 'on', 48, .8]], {sec: 1, seed})).l; const p = spectrum(x, 9600, 16384, 'hann'); for (let k = 0; k < 8192; k++) P[k] += p[k]; }
  const fc = mtof(48) * 2 ** (36 / 12), bin = SR / 16384, band = (lo, hi) => { let e = 0, c = 0; for (let k = Math.round(lo / bin); k <= Math.round(hi / bin); k++) { e += P[k]; c++; } return pdb(e / c); };
  pk.push(band(fc / 1.03, fc * 1.03) - band(fc / 2.2, fc / 1.8)); }
console.log('noise RESO peak prominence (dB at fc vs fc/2)', pk.map(x => M(x, 1)).join(' '));
// Speicherwelle WELLE 1 vs 64 (H-1) at C3
const s1 = (await R(page, mergeO({o1: {w: 5, c2: 0}}, OPEN), [[0, 'on', 48, .8]], {sec: .5})).l, s64 = (await R(page, mergeO({o1: {w: 5, c2: 126}}, OPEN), [[0, 'on', 48, .8]], {sec: .5})).l;
console.log('WELLE 1 vs 64 M-SP', M(centroid(s1, 0, 8192, SR)), M(centroid(s64, 0, 8192, SR)), 'level', M(db(rms(s1, 0, 14400)), 1), M(db(rms(s64, 0, 14400)), 1));
// Stimmwelle WFM (C2) depth: M-SP range across 2 s with LFO1 at 0, 32, 64, 95, 127
const wf = []; for (const c2 of [0, 32, 64, 95, 127]) { const x = (await R(page, mergeO({o1: {w: 4, c1: 0, c2}, l1: {w: 2, f: 60}}, OPEN), [[0, 'on', 48, .8]], {sec: 2})).l; const c = []; for (let s = 0; s + 4096 < x.length; s += 2400) c.push(centroid(x, s, 4096, SR)); wf.push(Math.log2(Math.max(...c) / Math.min(...c))); }
console.log('Stimmwelle WFM M-SP swing (oct)', wf.map(x => M(x, 2)).join(' '));
await b.close();
