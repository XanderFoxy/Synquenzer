// G6P-12: M-CT je Chornote ≤ 3 ct; Kopie ct −9 → −9 ± 1 ct gegen die Stimme; Vibrato-Tiefe ≥ 95 % des Leads
import {open, sing, melody, inject, chor, report, nsdf, cents, median} from './h.mjs';
const {br, p, errs} = await open(), rows = [];
const y = sing(melody(16), {beats: 16}), sr = 48000;
const tk = await inject(p, y, {bars: 4}), r = {t: tk.track, s: 0};
await p.evaluate(([r, c]) => SYNQUENZER.g6pbSet(r, c), [r, chor([{rule: 'st+2', dbl: [{ms: 0, ct: 0, p: 0}, {ms: 20, ct: -9, p: 0}]}, {rule: 'st-5', dbl: [{ms: 0, ct: 0, p: 0}]}, {rule: 'oct+1', dbl: [{ms: 0, ct: 0, p: 0}]}])]);
await p.evaluate(r => SYNQUENZER.g6pbBufs(r), r);
const track = (x, t0, t1) => { const a = Math.round((t0 + 0.2 * (t1 - t0)) * sr), b = Math.round((t1 - 0.2 * (t1 - t0)) * sr), W = Math.round(0.03 * sr), H = Math.round(0.005 * sr), out = []; for (let s = a; s + W <= b; s += H) { const f = nsdf(x, sr, s, s + W); if (f > 0) out.push(f); } return out; };
const sd = a => { const m = a.reduce((s, v) => s + v, 0) / a.length; return Math.sqrt(a.reduce((s, v) => s + (v - m) ** 2, 0) / a.length); };
let worst = 0, raw = 0, n = 0, dct = [], vr = [];
for (let k = 0; k < 3; k++) {
  const T = await p.evaluate(([r, k]) => SYNQUENZER.g6pbTones(r, k), [r, k]);
  const B = await p.evaluate(([r, k]) => SYNQUENZER.g6pbBuf(r, k, 0), [r, k]), x = Float32Array.from(B.data), off = Math.round(B.t0 * sr);
  const B1 = k === 0 ? await p.evaluate(r => SYNQUENZER.g6pbBuf(r, 0, 1), r) : null, x1 = B1 ? Float32Array.from(B1.data) : null;
  for (const nt of T) {
    const z = new Float32Array(x.length + off); z.set(x, off);
    const fr = track(z, nt.t0, nt.t1); if (fr.length < 5) continue;
    const c = fr.map(f => cents(f, nt.cp)), md = median(c);
    const L = track(y, nt.t0, nt.t1).map(f => cents(f, nt.L)); vr.push(sd(c) / sd(L));
    worst = Math.max(worst, Math.abs(md - median(L))); raw = Math.max(raw, Math.abs(md)); n++;
    if (x1) { const z1 = new Float32Array(x1.length + off); z1.set(x1, off); const c1 = track(z1, nt.t0, nt.t1).map(f => cents(f, nt.cp)); dct.push(median(c1) - md); }
  }
}
rows.push({id: 'G6P-12a', ok: worst <= 3 && n >= 20, msg: `${n} Chornoten (Terz oben, Sexte unten, Oktave oben): größte Abweichung zum Soll (gesungener Lead + Intervall) ${worst.toFixed(2)} ct (≤ 3); zum Notennamen ${raw.toFixed(2)} ct (Vibrato-Median des Leads)`});
const dm = median(dct), dw = Math.max(...dct.map(d => Math.abs(d + 9)));
rows.push({id: 'G6P-12b', ok: dw <= 1, msg: `Kopie ct −9: Median ${dm.toFixed(2)} ct, schlechteste Note ${dct.find(d => Math.abs(d + 9) === dw).toFixed(2)} (Soll −9 ± 1)`});
const vmin = Math.min(...vr);
rows.push({id: 'G6P-12c', ok: median(vr) >= 0.95 && vmin >= 0.9, msg: `Vibrato-Tiefe Chor/Lead: Median ${(median(vr) * 100).toFixed(1)} %, kleinste ${(vmin * 100).toFixed(1)} % (≥ 95 %)`});
rows.push({id: 'Fehler', ok: !errs.length, msg: errs.slice(0, 3).join(' | ') || 'keine Seitenfehler'});
report('G6P-12', rows); await br.close();
