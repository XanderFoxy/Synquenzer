// G7 Gesang folgt dem Transponieren (Chromium): G7-01 … G7-04.  node bau/helfer/G267/tests/g7-app.mjs
import {launch, openG, sleep, toI16, SR, deq} from './g1/n5-g-h.mjs';
import {voice, rng} from './vs-dsp/test-signals.mjs';
import {rec2Start, rec2Stop} from './rec2.mjs';
let fail = 0; const ok = (c, m) => { console.log((c ? '✓ ' : '✗ ') + m); if (!c) fail++; };
const hz = m => 440 * Math.pow(2, (m - 69) / 12), ct = (a, b) => 1200 * Math.log2(a / b);
const median = a => { const b = a.filter(v => v === v).sort((p, q) => p - q); return b.length ? b[b.length >> 1] : NaN; };
function track(x, sr, a, b) {
  const W = Math.round(0.03 * sr), hop = Math.round(0.005 * sr), out = [];
  for (let s = Math.round(a * sr); s + W + Math.round(sr / 70) < Math.min(x.length, b * sr); s += hop) {
    const tmin = Math.floor(sr / 1100), tmax = Math.ceil(sr / 70), r = new Float64Array(tmax + 2);
    for (let t = tmin - 1; t <= tmax + 1; t++) { let ac = 0, e = 0; for (let j = 0; j < W; j++) { ac += x[s + j] * x[s + j + t]; e += x[s + j] * x[s + j] + x[s + j + t] * x[s + j + t]; } r[t] = e > 0 ? 2 * ac / e : 0; }
    let mx = 0; for (let t = tmin; t <= tmax; t++) mx = Math.max(mx, r[t]); if (mx < 0.6) { out.push(NaN); continue; }
    let t = tmin; for (; t <= tmax; t++) if (r[t] >= 0.93 * mx && r[t] >= r[t - 1] && r[t] >= r[t + 1]) break;
    const y0 = r[t - 1], y1 = r[t], y2 = r[t + 1], den = y0 - 2 * y1 + y2; out.push(sr / (t + (den < 0 ? 0.5 * (y0 - y2) / den : 0)));
  }
  return out;
}
// gehaltene Fläche („aaah“, 1 Takt) + Worte mit Zischlauten, C-Dur
const MEL = [60, 64, 62, 65, 67, 69, 71, 72];
const notes = [{t: 0.05, d: 1.9, f0: hz(60), vowel: 'a', cons: false, m: 60}].concat(MEL.slice(1).map((m, k) => ({t: 2.05 + k * 0.42, d: 0.38, f0: hz(m), vowel: 'aeiou'[k % 5], cons: k % 2 === 0, m})));
const x = voice(SR, 5.0, notes, {seed: 6, vibrato: 15}).x; { const r = rng(4); for (let i = 0; i < x.length; i++) x[i] += 0.0004 * (r() * 2 - 1); }
const cons = notes.filter(n => n.cons).map(n => [n.t, n.t + 0.019]);
const noteHz = (y, n) => median(track(y, SR, n.t + (n.cons ? 0.06 : 0.04), n.t + n.d - 0.05));

const br = await launch(null), H = await openG(br), p = H.p;
const errs = []; p.on('pageerror', e => errs.push(String(e)));
await p.evaluate(() => { SYNQUENZER.newProject(); SYNQUENZER.setBpm(96); SYNQUENZER.setMetronome(false); }); await sleep(300);
await p.evaluate(() => SYNQUENZER.play()); await sleep(300); await p.evaluate(() => SYNQUENZER.stop()); await sleep(200);
const r1 = await p.evaluate(pcm => SYNQUENZER.tkInject({pcm, sr: 48000, scene: 0, len: 2}), toI16(x));
const id = r1.id, R = {t: r1.track, s: 0};
const xr = Float32Array.from(await p.evaluate(id => SYNQUENZER.tkBufRange(id), id));
const played = async () => { const r = await p.evaluate(R => SYNQUENZER.g2Played(R), R); return {raw: r.raw, y: Float32Array.from(r.data)}; };
await p.evaluate(() => { SYNQUENZER.launchScene(0); SYNQUENZER.play(); }); await sleep(500);
// G7-01: Träger D (Szene +2): je Note die Lage eines Noten-Clips auf derselben Spur (outPitch) – Tabelle; gemessen ±5 Cent
const t0 = Date.now();
await p.evaluate(async () => { SYNQUENZER.setKbMode('transpose'); await SYNQUENZER.chord([62, 66, 69], 150); }); await sleep(900);   // der Wechsel gilt ab dem nächsten Schlag
let P = await played(); const tFirst = Date.now() - t0;
const tab = await p.evaluate(([st, ms]) => ms.map(m => SYNQUENZER.outPitch(st, m)), [R.t, notes.map(n => n.m)]);
const inf = await p.evaluate(R => SYNQUENZER.g7Info(R), R);
{
  const rows = []; let w = 0;
  notes.forEach((n, k) => { const want = tab[k], c = ct(noteHz(P.y, n), hz(want)); rows.push(`${n.m}→${want} (${c >= 0 ? '+' : ''}${c.toFixed(1)})`); w = Math.max(w, Math.abs(c)); });
  ok(!P.raw && w <= 5 && tab.every((q, k) => q - notes[k].m === 2), `G7-01 Träger D-Dur (+2): Gesang je Note wie ein Noten-Clip (Tabelle) ±5 Cent – max ${w.toFixed(2)} Cent: ${rows.join(' ')} (erste Lage hörbar nach ${tFirst} ms)`);
  ok(inf.shift && inf.shift.every(v => v === 2), 'G7-01 Verschiebung je erkannter Note: ' + JSON.stringify(inf.shift));
}
// G7-02: Zischlaute unverändert
{ let bad = 0; for (const [a, b] of cons) for (let i = Math.round(a * SR); i < b * SR; i++) if (P.y[i] !== xr[i]) bad++; ok(bad === 0, 'G7-02 Zischlaute bitgleich (' + bad + ' Samples anders)'); }
// diatonisch: Träger in a-Moll (A + C + E) – Lagen wie ein Noten-Clip
await p.evaluate(async () => { await SYNQUENZER.chord([57, 60, 64], 150); }); await sleep(900); P = await played();
{
  const tab2 = await p.evaluate(([st, ms]) => ms.map(m => SYNQUENZER.outPitch(st, m)), [R.t, notes.map(n => n.m)]); let w = 0; const rows = [];
  notes.forEach((n, k) => { const c = ct(noteHz(P.y, n), hz(tab2[k])); rows.push(`${n.m}→${tab2[k]} (${c.toFixed(1)})`); w = Math.max(w, Math.abs(c)); });
  ok(w <= 5, `G7-01 Träger a-Moll (diatonisch wie Noten-Clip): max ${w.toFixed(2)} Cent: ${rows.join(' ')}`);
}
// G7-03: zurück auf 0 (Träger C) → bitgleich zum Original
await p.evaluate(async () => { await SYNQUENZER.chord([60, 64, 67], 150); }); await sleep(900);
P = await played();
{ let d = 0; for (let i = 0; i < xr.length; i++) if (P.y[i] !== xr[i]) d++; ok(P.raw && d === 0, 'G7-03 zurück auf 0 → Roh-Take bitgleich (' + d + ' Samples anders)'); }
// G7-04: zurück auf +2 → aus dem Cache (kein Neurechnen); Wechsel beim Abspielen auf einer gehaltenen Fläche („aaah“) ohne Loch/Knacks
{
  const hold = voice(SR, 4.9, [{t: 0.02, d: 4.85, f0: hz(60), vowel: 'a'}], {seed: 2, vibrato: 15}).x;
  const r2 = await p.evaluate(pcm => SYNQUENZER.tkInject({pcm, sr: 48000, scene: 1, len: 2}), toI16(hold)); const R2 = {t: r2.track, s: 1};
  await p.evaluate(() => { SYNQUENZER.launchScene(1); }); await sleep(5200);
  await p.evaluate(async () => { await SYNQUENZER.chord([62, 66, 69], 120); }); await sleep(1500);   // +2 einmal rechnen (Cache)
  await p.evaluate(R => SYNQUENZER.g2Played(R, 0, 10), R2);
  await p.evaluate(async () => { await SYNQUENZER.chord([60, 64, 67], 120); }); await sleep(1500);
  const rn0 = (await p.evaluate(R => SYNQUENZER.g7Info(R), R2)).renders;
  await rec2Start(p); await sleep(400);
  const tb = Date.now(); await p.evaluate(async () => { await SYNQUENZER.chord([62, 66, 69], 100); });
  const ready = await p.evaluate(R => SYNQUENZER.g7Info(R).ready, R2); const tc = Date.now() - tb;
  await sleep(1600); const rr = await rec2Stop(p);
  const rn1 = (await p.evaluate(R => SYNQUENZER.g7Info(R), R2)).renders, sw = await p.evaluate(() => SYNQUENZER.wpSwitchInfo());
  const L = rr.l, W = 240, e = []; for (let s = 0; s + W <= L.length; s += W) { let q = 0; for (let i = s; i < s + W; i++) q += L[i] * L[i]; e.push(10 * Math.log10(q / W + 1e-14)); }
  let hole = 0, at = []; for (let k = 10; k < e.length - 10; k++) { const nb = e.slice(k - 10, k).concat(e.slice(k + 1, k + 11)).sort((a, b) => a - b); if (nb[0] > -45 && e[k] < nb[10] - 6) { hole++; at.push((k * W / 48000).toFixed(3)); } }
  // Tonhöhe vor/nach dem Wechsel im Mitschnitt: C3 → D3
  const fA = median(track(L, 48000, 0.05, 0.3)), fB = median(track(L, 48000, L.length / 48000 - 0.4, L.length / 48000 - 0.1));
  ok(rn1 === rn0 && ready, `G7-04 zurück auf +2: aus dem Cache (Renders ${rn0} → ${rn1}), sofort bereit (${tc} ms)`);
  ok(hole === 0 && sw && sw.bad <= 1.5 && Math.abs(ct(fB, fA) - 200) <= 5, `G7-04 Wechsel auf der gehaltenen Fläche: ${hole} Einbrüche ≥ 6 dB (${at.join(',') || '–'}), Überblendung „${sw && sw.kind}“ ${sw && sw.bad} dB, gehört ${ct(fB, fA).toFixed(1)} Cent höher`);
}
// vorberechnet: Akkord-Zeile der Szene (D, F) → beim Abspielen schon im Cache
{
  await p.evaluate(() => { SYNQUENZER.stop(); }); await sleep(200);
  const has = await p.evaluate(() => typeof SYNQUENZER.setChordRow === 'function');
  if (has) {
    await p.evaluate(() => SYNQUENZER.setChordRow('S1', {len: 2, ch: [{b: 0, tg: SYNQUENZER.harmony.detectChord([65, 69, 72])}, {b: 4, tg: SYNQUENZER.harmony.detectChord([67, 71, 74])}]}));
    await p.evaluate(async () => { await SYNQUENZER.chord([60, 64, 67], 100); SYNQUENZER.launchScene(0); SYNQUENZER.play(); }); await sleep(6000);
    const i2 = await p.evaluate(R => SYNQUENZER.g7Info(R), R);
    console.log('  Vorberechnet aus der Akkord-Zeile: ' + i2.pre + ' Lagen, Cache ' + i2.cache + ' Fassungen');
    ok(i2.cache >= 3, 'G7-04 vorberechnet: Lagen der Akkord-Zeile liegen im Cache (' + i2.cache + ')');
    await p.evaluate(() => SYNQUENZER.stop());
  }
}
ok(!errs.length, 'keine Seitenfehler ' + errs.join(' | '));
await br.close(); console.log(fail ? fail + ' FEHLER' : 'ALLE GRÜN'); process.exit(fail ? 1 : 0);
