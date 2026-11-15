// VXR2-Nachbesserung: Songtext-Schutz + Kennung + kurzer Vorlauf (synthetischer Gesang, ohne Import-Oberfläche)
// (1) Take mit Songtext (ohne Kennung) → bisherige Erkennung (Marken = Op 'det' am ganzen Take), keine Kennung
// (2) Take ohne Songtext → Kennung m.vxr2 = 1, bleibt beim Normalisieren (Speichern/Laden) und nach späterem Songtext
// (3) gleicher Inhalt bei Vorlauf 0,10 / 0,105 / 0,6 s (Import) → Marken in Inhalts-Proben gleich (kurzer Vorlauf wird aufgefüllt)
// (4) aufgenommener Take (ohne m.imp) mit 0,10 s Nullen vorn → unverändert (Marken = Op 'det' am ganzen Take)
// Aufruf: node vxr2-lyr-test.mjs <abs index.html>
import {createRequire} from 'node:module';
const require = createRequire(import.meta.url); const {chromium} = require('playwright');
const file = process.argv[2];
const b = await chromium.launch(), errs = [];
const p = await b.newPage({viewport: {width: 390, height: 844}});
p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
await p.goto('file://' + file); await p.waitForTimeout(1500);
const R = await p.evaluate(async () => {
  const sr = 48000, content = (() => {   // 6 gesungene „Silben“ (Grundton + Obertöne, Hüllkurve) mit Konsonant-Rauschen davor
    const n = Math.round(3.4 * sr), y = new Float32Array(n); let s = 12345; const rnd = () => (s = (s * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff - .5;
    const f = [220, 247, 262, 294, 262, 220];
    for (let k = 0; k < 6; k++) { const a = Math.round((.05 + k * .55) * sr), L = Math.round(.45 * sr);
      for (let i = 0; i < Math.round(.03 * sr); i++) y[a + i] += .08 * rnd();
      for (let i = 0; i < L; i++) { const t = i / sr, e = Math.min(1, t / .02) * Math.min(1, (L - i) / sr / .05); y[a + Math.round(.03 * sr) + i] += e * (.4 * Math.sin(2 * Math.PI * f[k] * t) + .15 * Math.sin(4 * Math.PI * f[k] * t) + .07 * Math.sin(6 * Math.PI * f[k] * t)); } }
    return y; })();
  const mk = (pre, imp, ly) => { const z = Math.round(pre * sr), pcm = new Int16Array(z + content.length); for (let i = 0; i < content.length; i++) pcm[z + i] = Math.max(-32767, Math.min(32767, Math.round(content[i] * 32767))); const r = tkAddPcmTake(pcm, sr, 'import'), m = S.takes[r.id]; if (imp) { m.route = 'datei'; m.imp = {bpm: 112, ts: '4/4', t1: .3}; } if (ly) m.lyrics = 'la la la la la la'; return {id: r.id, z}; };
  const full = async id => { const bb = tkBuffer(id); const r = await wpCall({op: 'det', x: bb.getChannelData(0), sr}); return (wpNormMarks(r, bb.length / sr) || []).map(k => Math.round(k.t * sr)); };
  const det = async id => (await wpDetect(id) || []).map(k => Math.round(k.t * sr));
  const out = {has: typeof window.__vxr2 === 'object'};
  const A = mk(.4, true, false), B = mk(.4, true, true), C = mk(.10, false, false), D = mk(.10, true, false), E = mk(.105, true, false), F = mk(.6, true, false);
  out.A = {det: await det(A.id), flag: S.takes[A.id].vxr2 === 1, z: A.z};
  S.takes[A.id].lyrics = 'la la'; out.A.takeNachText = out.has ? window.__vxr2.take(A.id) : null; out.A.norm = (tkNormTake(S.takes[A.id]) || {}).vxr2 === 1;
  out.B = {det: await det(B.id), full: await full(B.id), flag: S.takes[B.id].vxr2 === 1, norm: (tkNormTake(S.takes[B.id]) || {}).vxr2 === 1};
  out.C = {det: await det(C.id), full: await full(C.id), flag: S.takes[C.id].vxr2 === 1};
  for (const [k, T] of [['D', D], ['E', E], ['F', F]]) { const d = await det(T.id); out[k] = {z: T.z, rel: d.map(v => v - T.z), flag: S.takes[T.id].vxr2 === 1}; }
  return out;
});
let bad = 0, all = 0; const ok = (c, m, d) => { all++; if (!c) bad++; console.log((c ? 'OK ' : 'FEHLER ') + m + (d != null ? ' – ' + JSON.stringify(d) : '')); };
const eq = (a, b) => a.length === b.length && a.every((v, k) => v === b[k]);
if (R.has) {
  ok(R.A.flag && R.A.norm && R.A.takeNachText, '(2) Take ohne Songtext: Kennung gesetzt, bleibt beim Normalisieren und nach späterem Text zuständig', {flag: R.A.flag, norm: R.A.norm, nachText: R.A.takeNachText, marken: R.A.det.length});
  ok(!R.B.flag && !R.B.norm && eq(R.B.det, R.B.full), '(1) Take mit Songtext: keine Kennung, Marken = bisherige Erkennung am ganzen Take', {flag: R.B.flag, n: R.B.det.length, gleich: eq(R.B.det, R.B.full)});
  ok(!R.C.flag && eq(R.C.det, R.C.full), '(4) aufgenommener Take (ohne Import) mit 0,10 s Nullen: unverändert', {flag: R.C.flag, n: R.C.det.length, gleich: eq(R.C.det, R.C.full)});
} else console.log('INFO basis: kein __vxr2 (Kennung/Songtext-Prüfung entfällt)');
const sD = eq(R.D.rel, R.E.rel), sF = eq(R.D.rel, R.F.rel);
(R.has ? ok : (c, m, d) => console.log('INFO ' + m + ' – ' + JSON.stringify(d)))(sD && sF, '(3) gleicher Inhalt bei Vorlauf 0,10 / 0,105 / 0,6 s (Import): Marken in Inhalts-Proben gleich', {n: [R.D.rel.length, R.E.rel.length, R.F.rel.length], D_E: sD, D_F: sF, maxDiffDE: R.D.rel.length === R.E.rel.length ? Math.max(...R.D.rel.map((v, k) => Math.abs(v - R.E.rel[k]))) : null, flags: [R.D.flag, R.E.flag, R.F.flag]});
ok(!errs.length, 'keine Seitenfehler', errs.slice(0, 3));
console.log(bad ? `FEHLER ${bad}/${all}` : `ALLE OK (${all})`);
await b.close();
