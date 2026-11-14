// IMP2 Node-Prüfung: imp1Core aus einer App-Datei auf dieselben Stücke bei verschiedenen Abtastraten (Tempo muss gleich und richtig sein).
// Aufruf: node imp2-node.mjs <abs index.html> <ordner mit <name>@<sr>.wav> [filter-regex]
// Wahrheit: App-Renders 92 4/4, 120 3/4, 120 6/8, Melodie 96 (Gesang); echte Gesangsaufnahmen #1 (Annotation ≈ 119), #10/#14 ohne feste Wahrheit.
import fs from 'node:fs';
import path from 'node:path';
const [file, dir, flt] = process.argv.slice(2);
const H = fs.readFileSync(file, 'utf8');
const i = H.indexOf('function imp1Core() {'), j = H.indexOf('const IMP1 = {', i);
const C = new Function(H.slice(i, j) + '\nreturn imp1Core;')()();
const rd = f => { const B = fs.readFileSync(f); let p = 12, sr = 0, ch = 1, bits = 16, x = null; while (p < B.length) { const id = B.toString('ascii', p, p + 4), n = B.readUInt32LE(p + 4); if (id === 'fmt ') { ch = B.readUInt16LE(p + 10); sr = B.readUInt32LE(p + 12); bits = B.readUInt16LE(p + 22); } if (id === 'data') { const m = Math.floor(n / (bits / 8) / ch); x = new Float32Array(m); for (let k = 0; k < m; k++) { let s = 0; for (let c = 0; c < ch; c++) s += bits === 32 ? B.readFloatLE(p + 8 + 4 * (k * ch + c)) : B.readInt16LE(p + 8 + 2 * (k * ch + c)) / 32768; x[k] = s / ch; } } p += 8 + n + (n & 1); } return {x, sr}; };
const TRUTH = {'92_4_4': [92, '4/4'], '92_4_4mp3': [92, '4/4'], '120_3_4': [120, '3/4'], '120_6_8': [120, '6/8'], m96: [96, '4/4'], 1: [119, null]};
const files = fs.readdirSync(dir).filter(f => /@\d+\.wav$/.test(f) && (!flt || new RegExp(flt).test(f))).sort();
const groups = {};
for (const f of files) { const m = f.match(/^(.*)@(\d+)\.wav$/), key = m[1].replace(/^[a-z]+_(\d+)$/i, '#$1'); (groups[key] = groups[key] || []).push({f, sr: +m[2]}); }
const out = {};
let bad = 0;
for (const [key, L] of Object.entries(groups)) {
  const res = [];
  for (const {f, sr} of L.sort((a, b) => a.sr - b.sr)) {
    const {x} = rd(path.join(dir, f)), t0 = Date.now(), r = C.analyse(x, sr, {}, () => {}), ms = Date.now() - t0;
    res.push({sr, ms, bpm: r.bpm, roh: r.bpmRoh, q: r.quelle, frage: r.frage, alt: r.alt, ts: r.ts, t1: r.t1, st: r.stabil, n: r.teile && r.teile.length, teile: r.teile && r.teile.map(t => t.name + ':' + t.a).join(' '), low: r.diag && r.diag.lowRatio, quiet: r.diag && r.diag.quiet});
  }
  const bs = res.map(r => r.roh), spread = Math.max(...bs) - Math.min(...bs), tr = TRUTH[key.replace('#', '')];
  const right = tr ? res.every(r => Math.abs(r.bpm - tr[0]) <= Math.max(1.5, tr[0] * .015) && (!tr[1] || r.ts === tr[1])) : null;
  const same = spread <= .5 && res.every(r => r.q === res[0].q && r.ts === res[0].ts && r.frage === res[0].frage);
  if (!same || right === false) bad++;
  console.log(`${same && right !== false ? 'OK ' : 'FEHLER '}${key}: gleich ${same} (Spanne ${spread.toFixed(2)} BPM)` + (tr ? `, richtig ${right} (Wahrheit ${tr.join(' ')})` : ''));
  for (const r of res) console.log(`   ${r.sr}: bpm ${r.bpm} roh ${r.roh} ${r.q} frage ${r.frage} alt ${JSON.stringify(r.alt)} ts ${r.ts} t1 ${r.t1} stabil ${r.st} teile ${r.n} [${r.teile}] low ${r.low} quiet ${r.quiet} ${r.ms} ms`);
  out[key] = res;
}
console.log(bad ? `FEHLER: ${bad} Gruppen` : 'ALLE OK');
if (process.env.IMP2_OUT) fs.writeFileSync(process.env.IMP2_OUT, JSON.stringify(out, null, 1));
