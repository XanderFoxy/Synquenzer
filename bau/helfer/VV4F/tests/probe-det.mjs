import { open, SONG8 } from './lib.mjs';
const {b, p, errs} = await open({w: 428, h: 926});
await p.evaluate(s => SYNQUENZER.setSong(s), process.env.ONE ? {bars: 4, lanes: [[{bar: 0, slot: 0}], [], [], [], [], []], carrier: [], mel: {}, marks: []} : SONG8);
await p.evaluate(() => { const el = document.getElementById('sq-worklet-src'); window._wsrc = el.textContent;
  el.textContent = '(function(){var s=12345;Math.random=function(){s=(Math.imul(s,1664525)+1013904223)>>>0;return s/4294967296;};})();\n' + window._wsrc;
  window._seed = () => { let s = 777; Math.random = () => { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 4294967296; }; }; });
const R = [];
for (let k = 0; k < 3; k++) R.push(await p.evaluate(async k => { window._seed(); VV.noMtr = true; await SYNQUENZER.vvRender({}); window['_d' + k] = VV.last; return {hall: AU.hallKind, n: VV.last.n}; }, k));
const d = await p.evaluate(() => { const A = window._d1, B = window._d2, sr = A.sr; let first = -1, mx = 0; const per = [];
  for (let k = 0; k < A.n; k++) { const x = Math.abs(A.ch[0][k] - B.ch[0][k]); if (x > 0 && first < 0) first = k; if (x > mx) mx = x; if (k % sr === 0) per.push(0); if (x > per[per.length - 1]) per[per.length - 1] = x; }
  const bf = A.buf.getChannelData(0), bg = B.buf.getChannelData(0); let f2 = -1; for (let k = 0; k < bf.length; k++) if (bf[k] !== bg[k]) { f2 = k; break; }
  return {first: first / sr, mx, per: per.map(v => v ? Math.round(20 * Math.log10(v)) : -999), f2, f2s: f2 / sr, off: A.off}; });
console.log(JSON.stringify(R), JSON.stringify(d));
await b.close();
