// VV1-06: nothing changes – project, selection, song loop, and a broad diff of the app's global state objects around a whole video job
import { open, SONG8, OUT } from './n5-v-abn-lib.mjs';
import fs from 'fs';
const tag = process.argv[2] || 'r1';
const {b, p, errs} = await open();
await p.evaluate(s => { SYNQUENZER.setSong(s); S.song.loop = Object.assign({}, S.song.loop, {on: true}); SYNQUENZER.songSelect(2, 4); }, SONG8);
const names = ['R', 'T', 'XP', 'MEM', 'LOG', 'PERF', 'TK', 'CAP', 'LIM', 'MEL', 'TICKERR', 'SONGCAR', 'MKWH', 'MKL', 'DRB', 'DPC', 'OS', 'KEYC', 'STEPQ', 'PADSEL', 'ROWAP', 'PRT', 'FANG', 'HEARD', 'MLIVE', 'SV', 'MX', 'PV', 'KETTE', 'WAKE', 'SQV', 'NTQ', 'REP', 'ZCACHE', 'MELPICK', 'TAP', 'KB', 'CR', 'PB', 'ST', 'VS', 'MIC', 'SYNC', 'SREC', 'rec'];
const snap = () => p.evaluate((names) => {
  const out = {};
  const rep = () => { const seen = new WeakSet(); return (k, v) => { if (typeof v === 'function') return undefined; if (v && typeof v === 'object') { if (v instanceof Node || v instanceof AudioNode || v instanceof BaseAudioContext || v instanceof AudioBuffer || (window.AudioParam && v instanceof AudioParam)) return '[obj]'; if (ArrayBuffer.isView(v)) return '[ta' + v.length + ']'; if (v instanceof Map) return {map: [...v.entries()].slice(0, 50)}; if (v instanceof Set) return {set: [...v].slice(0, 50)}; if (seen.has(v)) return '[cyc]'; seen.add(v); } return v; }; };
  for (const n of names) { let o; try { o = eval(n); } catch (e) { continue; } try { out[n] = JSON.stringify(o, rep()); } catch (e) { out[n] = 'ERR ' + e.message; } }
  out.arpc = typeof ARPC !== 'undefined' ? 'present' : 'none';
  out.proj = JSON.stringify(SYNQUENZER.serialize()); out.runtime = JSON.stringify(SYNQUENZER.runtime()); out.sel = JSON.stringify(SV.sel); out.loop = JSON.stringify(S.song.loop); out.ctx = AU.ctx && AU.ctx.constructor.name; out.ctxState = AU.ctx && AU.ctx.state;
  out.undo = JSON.stringify(SYNQUENZER.undoInfo());
  return out;
}, names);
await p.waitForTimeout(500);
const s0 = await snap();
const m = await p.evaluate(async () => { SYNQUENZER.vvTest({opus: true}); const x = await SYNQUENZER.vvMake({fmt: '9:16', view: 'matrix'}); return {how: x.how, a: x.a, b: x.b, dur: x.dur}; });
await p.waitForTimeout(500);
const s1 = await snap();
const diff = {};
for (const k of Object.keys(s0)) if (s0[k] !== s1[k]) {
  // locate the first differing keys
  let d = null; try { const A = JSON.parse(s0[k]), B = JSON.parse(s1[k]); if (A && typeof A === 'object' && B && typeof B === 'object') d = Object.keys(Object.assign({}, A, B)).filter(q => JSON.stringify(A[q]) !== JSON.stringify(B[q])).slice(0, 12).map(q => q + ': ' + String(JSON.stringify(A[q])).slice(0, 90) + ' → ' + String(JSON.stringify(B[q])).slice(0, 90)); else d = [String(s0[k]).slice(0, 100) + ' → ' + String(s1[k]).slice(0, 100)]; } catch (e) { d = ['(not json) ' + String(s0[k]).slice(0, 80) + ' → ' + String(s1[k]).slice(0, 80)]; }
  diff[k] = d;
}
console.log(JSON.stringify({m, diff, errs}, null, 1));
fs.writeFileSync(OUT + tag + '-06.json', JSON.stringify({m, diff}, null, 1));
await b.close();
