// VXR2-Test: Gesang-Editor robust gegen die Lage des Takes – A/B (index gegen basis) für die vier Punkte aus imp2b/NOTES „Offen 1“
// (a) Stücke gleich bei ±5 ms Vorlauf (#10, t1 0,378/0,383/0,388/0,393; Stück-Anfänge in Datei-Proben verglichen)
// (b) kein Knacken an den Schnitten (#10 t1 0,388 und 0,383: 2. Ableitung ≤ 1,5× Quelle, auffällig 0)
// (c) Raster sitzt (#10 t1 0,388, #14 Tempo 120,6 + t1 0,686: „frei daneben 0“)
// (d) Verschieben links: Ausklang des Vorgängers bitgleich bis zum Schnitt (#10, #14 – Messung wie rv1)
// Aufruf: node vxr2-test.mjs <abs index.html> <abs basis.html> <abs ordner gesang> <abs ausgabe-ordner>
import {spawn} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
const [idx, bas, dl, out] = process.argv.slice(2).map(p => path.resolve(p)); fs.mkdirSync(out, {recursive: true});
const here = path.dirname(new URL(import.meta.url).pathname), T = path.join(here, 'work', 'rv1s-test.mjs');
const K0 = 2.142857142857143, SR = 48000;
function run(file, env, tag) {
  return new Promise(ok => {
    const txt = path.join(out, tag + '.txt'), js = path.join(out, tag + '.json'), w = fs.createWriteStream(txt);
    const e = Object.assign({}, process.env, env); if (env.RV1_PROBE) e.RV1_PROBE = js;
    const p = spawn(process.execPath, [T, file, dl, js], {env: e}); p.stdout.pipe(w); p.stderr.pipe(w);
    p.on('close', c => setTimeout(() => ok({c, txt: fs.readFileSync(txt, 'utf8'), js: fs.existsSync(js) ? JSON.parse(fs.readFileSync(js, 'utf8')) : null}), 50));
  });
}
async function pool(jobs, n) { const res = new Array(jobs.length); let i = 0; await Promise.all(Array.from({length: n}, async () => { while (i < jobs.length) { const k = i++; res[k] = await jobs[k](); } })); return res; }
const F = {index: idx, basis: bas}, TS = ['0.378', '0.383', '0.388', '0.393'], TS2 = ['1.95', '1.955', '2.1', '2.105'];   // TS2 (Nachbesserung): Vorlauf 0,19 s / 0,04 s (< 0,25 s)
const jobs = [], key = [];
for (const t of TS.concat(TS2)) for (const f of ['index', 'basis']) { key.push(['p', f, t]); jobs.push(() => run(F[f], {RV1_PROBE: '1', RV1_T1: t, RV1_ONLY: '10'}, `p10-${f}-${t}`)); }
if (process.env.VXR2_NURA !== '1') for (const f of ['index', 'basis']) { key.push(['q14t', f, '']); jobs.push(() => run(F[f], {RV1_BPM: '120.6', RV1_T1: '0.686', RV1_ONLY: '14', RV1_T: '11.125'}, `q14t-${f}`)); }   // (d) gleiche Silbe (Datei-Zeit)
if (process.env.VXR2_NURA !== '1') for (const f of ['index', 'basis']) {
  key.push(['q10', f, '0.388']); jobs.push(() => run(F[f], {RV1_T1: '0.388', RV1_ONLY: '10'}, `q10-${f}-0.388`));
  key.push(['q10', f, '0.383']); jobs.push(() => run(F[f], {RV1_T1: '0.383', RV1_ONLY: '10'}, `q10-${f}-0.383`));
  key.push(['q14', f, '']); jobs.push(() => run(F[f], {RV1_BPM: '120.6', RV1_T1: '0.686', RV1_ONLY: '14'}, `q14-${f}`));
}
const R = await pool(jobs, +(process.env.VXR2_PAR || 3)), get = (a, f, t) => R[key.findIndex(k => k[0] === a && k[1] === f && k[2] === t)];
let bad = 0, all = 0; const ok = (c, m, d) => { all++; if (!c) bad++; console.log((c ? 'OK ' : 'FEHLER ') + m + (d != null ? ' – ' + (typeof d === 'string' ? d : JSON.stringify(d)) : '')); };
const info = (m, d) => console.log('INFO ' + m + ' – ' + (typeof d === 'string' ? d : JSON.stringify(d)));
const S = {}, rep = (f, c, m, d) => f === 'index' ? ok(c, m, d) : info(m, d);
for (const f of ['index', 'basis']) {
  // (a)
  const P = TS.map(t => { const r = get('p', f, t); const sh = x => Math.round((x + (+t - K0)) * SR); return r && r.js ? {t, n: r.js.L.length, ms: r.js.ms, L: r.js.L.map(sh), M: (r.js.mk || []).map(sh), off: r.js.last && r.js.last.vxr2} : {t, n: null}; });
  const n = P.map(p => p.n), same = n.every(v => v != null && v === n[0]);
  const cmp = key => { const ok2 = P.every(p => p[key] && p[key].length === P[0][key].length); return ok2 ? {max: Math.max(...P.slice(1).map(p => Math.max(...p[key].map((v, k) => Math.abs(v - P[0][key][k]))))), gleich: P.slice(1).map(p => p[key].filter((v, k) => v === P[0][key][k]).length + '/' + p[key].length)} : {max: null, gleich: P.map(p => p[key] && p[key].length)}; };
  const cm = cmp('M'), cl = cmp('L');
  S[f] = {stuecke: n, markenMaxDiffProben: cm.max, markenGleich: cm.gleich, anfangMitAnlaufMaxDiffProben: cl.max, anfangMitAnlaufGleich: cl.gleich, analyseMs: P.map(p => p.ms)};
  rep(f, same && cm.max === 0, `(a) ${f}: #10 Stücke bei Vorlauf ±5 ms (t1 ${TS.join('/')}): gleiche Zahl, Stück-Marken probengleich (Datei-Zeit)`, S[f]);
  { const pm = t => { const r = get('p', f, t); const sh = x => Math.round((x + (+t - K0)) * SR); return r && r.js ? {t, n: r.js.L.length, M: (r.js.mk || []).map(sh), off: r.js.last && r.js.last.vxr2} : {t, n: null}; };
    const P2 = TS2.map(pm), m0 = P[0].M || [], d2 = P2.map(p => p.M && p.M.length === m0.length ? Math.max(...p.M.map((v, k) => Math.abs(v - m0[k]))) : null);
    rep(f, P2.every(p => p.n === P[0].n) && d2.every(v => v === 0), `(a2) ${f}: #10 kurzer Vorlauf (t1 ${TS2.join('/')} = 0,19/0,04 s): gleiche Stücke wie bei langem Vorlauf (t1 ${TS[0]}), Marken probengleich`, {stuecke: P2.map(p => p.n), ref: P[0].n, markenMaxDiffProben: d2, off: P2.map(p => p.off)}); }
  info(`(a) ${f}: Stück-Anfang mit Anlauf (Anlauf weiter aus der gehörten Fassung, 10-ms-Raster)`, {maxDiffMs: cl.max == null ? null : +(cl.max / 48).toFixed(1), gleich: cl.gleich});
  if (process.env.VXR2_NURA === '1') continue;
  // (b) (c) (d)
  const q = (a, t) => { const r = get(a, f, t); return r ? r.txt : ''; };
  const line = (s, re) => (s.split('\n').find(l => re.test(l)) || '');
  const jq = (s, re) => { const l = line(s, re); const i = l.indexOf('{'); try { return i >= 0 ? JSON.parse(l.slice(i)) : null; } catch (e) { return null; } };
  for (const t of ['0.388', '0.383']) {
    const s = q('q10', t), Q = jq(s, /^INFO #10 Quantisieren – /), st = jq(s, /^INFO #10 Analyse – /);
    rep(f, !!Q && Q.d2Ratio <= 1.5 && Q.knackBad === 0, `(b) ${f}: #10 t1 ${t} Quantisieren ohne Knacken (2. Ableitung ≤ 1,5× Quelle, auffällig 0)`, Q && {stuecke: st && st['stücke'], d2Max: Q.d2Max, d2Ratio: Q.d2Ratio, knackBad: Q.knackBad, sprungBad: Q.sprungBad, schnitte: Q.schnitte});
    const ra = line(s, /^(OK|FEHLER) #10 Anker-Ziele/); const fd = /frei daneben (\d+)/.exec(ra);
    rep(f, !!fd && +fd[1] === 0, `(c) ${f}: #10 t1 ${t} Raster sitzt (frei daneben 0)`, ra.replace(/^.*– /, ''));
    const mv = line(s, /^(OK|FEHLER) #10 Stück \d+ 60 ms nach links/);
    rep(f, /^OK/.test(mv), `(d) ${f}: #10 t1 ${t} Verschieben links, Ausklang bitgleich`, mv.replace(/^\S+ /, '').slice(0, 400));
  }
  const s = q('q14', ''), ra = line(s, /^(OK|FEHLER) #14 Anker-Ziele/), fd = /frei daneben (\d+)/.exec(ra), mv = line(s, /^(OK|FEHLER) #14 Stück \d+ 60 ms nach links/), Q = jq(s, /^INFO #14 Quantisieren – /), st = jq(s, /^INFO #14 Analyse – /);
  info(`${f}: #14 (Tempo 120,6, t1 0,686) Analyse/Quantisieren`, Q && {stuecke: st && st['stücke'], d2Ratio: Q.d2Ratio, knackBad: Q.knackBad});
  if (f === 'index') { all++; if (!(Q && Q.d2Ratio <= 1.5 && Q.knackBad === 0)) { bad++; console.log('FEHLER (b) #14 Knacken'); } else console.log('OK (b) index: #14 kein Knacken'); }
  if (f === 'index') { all++; if (!(fd && +fd[1] === 0)) { bad++; console.log('FEHLER (c) index: #14 Raster – ' + ra); } else console.log('OK (c) index: #14 Raster sitzt – ' + ra.replace(/^.*– /, '')); }
  else info('(c) basis: #14 Raster', ra.replace(/^.*– /, ''));
  if (f === 'index') { all++; if (!/^OK/.test(mv)) { bad++; console.log('FEHLER (d) index: #14 Verschieben links – ' + mv.slice(0, 400)); } else console.log('OK (d) index: #14 Verschieben links – ' + mv.slice(0, 200)); }
  else info('(d) basis: #14 Verschieben links', mv.slice(0, 400));
  { const r = get('q14t', f, ''), l = r ? line(r.txt, /^(OK|FEHLER) #14 Stück \d+ 60 ms nach links/) : ''; console.log(`OFFEN (d) ${f}: #14 gleiche Silbe wie Basis-Stück 35 (RV1_T 11,125, nicht gezählt – Entscheidung im Funk) – ` + l.slice(0, 300)); }
}
fs.writeFileSync(path.join(out, 'vxr2-sum.json'), JSON.stringify(S));
console.log(bad ? `FEHLER ${bad}/${all}` : `ALLE OK (${all})`);
