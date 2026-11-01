// G6P-14: Zischlaute im Chor (M-SIB): [ganz] bitgleich zum Lead in stimmlosen Abschnitten; [leiser] −12 ± 0,5 dB; [weg] ≤ −40 dB;
// stimmhafte Teile unverändert (≤ −90 dB Differenz außerhalb der 10-ms-Blenden)
import {open, sing, melody, inject, chor, report} from './h.mjs';
const {br, p, errs} = await open(), rows = [];
const y = sing(melody(16), {beats: 16}), sr = 48000;
const tk = await inject(p, y, {bars: 4}), r = {t: tk.track, s: 0};
const A = await p.evaluate(id => SYNQUENZER.g2Analyse(id), tk.id);
// stimmhafte Sample-Bereiche wie im Rechner: Frame i … j−1 → [(i − ½)·H, (j − ½)·H)
const H = A.hop * sr, vo = []; for (let i = 0; i < A.n;) { if (!(A.f0[i] > 0)) { i++; continue; } let j = i; while (j < A.n && A.f0[j] > 0) j++; vo.push([Math.max(0, Math.round((i - .5) * H)), Math.round((j - .5) * H)]); i = j; }
const R10 = Math.round(0.01 * sr), N = y.length;
const mask = new Int8Array(N).fill(-1);   // −1 stimmlos (außerhalb Blenden), 1 stimmhaft, 0 Blende
for (const [a, b] of vo) for (let i = a; i < b && i < N; i++) mask[i] = 1;
for (const [a, b] of vo) for (let d = 1; d <= R10; d++) { if (a - d >= 0 && mask[a - d] === -1) mask[a - d] = 0; if (b - 1 + d < N && mask[b - 1 + d] === -1) mask[b - 1 + d] = 0; }
const lead = await p.evaluate(([id, n]) => SYNQUENZER.g4PlayRange(id, 0, n), [tk.id, N]);   // gehörter Lead (gesäubert, ohne Tonhöhen-Änderung) = Quelle des Chors
async function buf(sib, rule) {
  await p.evaluate(([r, c]) => SYNQUENZER.g6pbSet(r, c), [r, chor([{rule}], {sib})]);
  await p.evaluate(r => SYNQUENZER.g6pbBufs(r), r);
  const B = await p.evaluate(r => SYNQUENZER.g6pbBuf(r, 0, 0), r); const z = new Float32Array(N); z.set(B.data, Math.round(B.t0 * sr)); return z;
}
const rms = (x, m, v) => { let s = 0, n = 0; for (let i = 0; i < N; i++) if (mask[i] === v) { s += x[i] * x[i]; n++; } return Math.sqrt(s / Math.max(1, n)); };
const db = v => 20 * Math.log10(v);
const g0 = await buf(0, 'st+2'), g12 = await buf(-12, 'st+2'), gw = await buf('weg', 'st+2');
let eq = true; for (let i = 0; i < N; i++) if (mask[i] === -1 && g0[i] !== lead[i]) { eq = false; break; }
rows.push({id: 'G6P-14a', ok: eq, msg: `[ganz] stimmlose Abschnitte bitgleich zum Lead: ${eq ? 'ja' : 'nein'}`});
const s12 = db(rms(g12, mask, -1) / rms(g0, mask, -1)), sw = db(rms(gw, mask, -1) / rms(g0, mask, -1));
rows.push({id: 'G6P-14b', ok: Math.abs(s12 + 12) <= .5, msg: `[leiser] stimmlos ${s12.toFixed(2)} dB (Soll −12 ± 0,5)`});
rows.push({id: 'G6P-14c', ok: sw <= -40, msg: `[weg] stimmlos ${sw.toFixed(1)} dB (≤ −40)`});
let mxd = 0; for (const g of [g12, gw]) for (let i = 0; i < N; i++) if (mask[i] === 1) mxd = Math.max(mxd, Math.abs(g[i] - g0[i]));
rows.push({id: 'G6P-14d', ok: mxd === 0 || db(mxd) <= -90, msg: `stimmhafte Teile: größte Differenz ${mxd === 0 ? '0 (bitgleich)' : db(mxd).toFixed(1) + ' dB'} (≤ −90 dB)`});
// gilt auch für Take-Stimmen (Unisono-Kopie ohne Rechnung, Quelle = Take): Zischlaute ebenfalls abgesenkt
const u12 = await buf(-12, 'uni'), su = db(rms(u12, mask, -1) / rms(lead, mask, -1));
rows.push({id: 'G6P-14e', ok: Math.abs(su + 12) <= .5, msg: `Unisono ohne Verschiebung, [leiser]: ${su.toFixed(2)} dB`});
rows.push({id: 'Fehler', ok: !errs.length, msg: errs.slice(0, 3).join(' | ') || 'keine Seitenfehler'});
report('G6P-14', rows); await br.close();
