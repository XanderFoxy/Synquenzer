// RETEST G7 (unabhängig): a-Moll-Szene, Melodie + gehaltene Fläche, Träger d-Moll / E-Dur / F-Dur, Vergleich je Note mit outPitch der
// STIMME-Spur; zurück (Akkord a-Moll und resetCarrier) → bitgleich; Hin-und-her-Wechsel beim Abspielen (Mitschnitt: Löcher/Klicks);
// alter Projektstand ohne neue Felder → bitgleich, JSON ohne neue Felder.
import {launch, openG, sleep, toI16, deq, hz, ct, median, notePitch, yinTrack, clickAt, hp2, setKey, errsOf, longTasks, ltGet} from './h.mjs';
import {singer} from './sig.mjs';
import {rec2Start, rec2Stop} from '../rec2.mjs';
import fs from 'fs';
const SR = 48000, OUT = [];
let fail = 0; const ok = (c, m) => { const s = (c ? '✓ ' : '✗ ') + m; console.log(s); OUT.push(s); if (!c) fail++; };
const NN = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'H'], nm = q => NN[((q % 12) + 12) % 12] + (Math.floor(q / 12) - 1);
const MEL = [57, 60, 64, 62, 59, 55, 57];   // a-Moll: A3 C4 E4 D4 H3 G3 A3
const ph = MEL.map((m, k) => ({t0: 0.05 + k * 0.48, cons: k % 2 ? 's' : (k === 2 ? 't' : null), vib: 14, segs: [{m, off: 0, d: k % 2 ? 0.34 : 0.4, vowel: 'aoeiu'[k % 5], f0: hz(m)}]}));
const {x, truth, cons} = singer(SR, 3.6, ph, {seed: 41});
const br = await launch(null), H = await openG(br), p = H.p, errs = errsOf(p);
await p.evaluate(() => { SYNQUENZER.newProject(); SYNQUENZER.setBpm(100); SYNQUENZER.setMetronome(false); }); await sleep(300);
await setKey(p, 9, 'aeolian');
await p.evaluate(() => SYNQUENZER.play()); await sleep(200); await p.evaluate(() => SYNQUENZER.stop()); await sleep(200);
const r1 = await p.evaluate(pcm => SYNQUENZER.tkInject({pcm, sr: 48000, scene: 0, len: 2}), toI16(x));
const id = r1.id, R = {t: r1.track, s: 0};
const xr = Float32Array.from(await p.evaluate(id => SYNQUENZER.tkBufRange(id), id));
const clipKey = (await p.evaluate(R => SYNQUENZER.getClip(R.t, 0).key, R)); console.log('Clip-Tonart', JSON.stringify(clipKey));
const played = async () => { const r = await p.evaluate(R => SYNQUENZER.g2Played(R), R); return {raw: r.raw, y: Float32Array.from(r.data)}; };
const beq = (a, b) => { let d = 0; for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) d++; return d; };
// alter Stand: ohne Bearbeitung und ohne Transponieren, nach Abspielen (G7 sucht Noten im Hintergrund) → bitgleich, JSON ohne neue Felder
const ser0 = await p.evaluate(() => JSON.parse(SYNQUENZER.serialize()).project);
await p.evaluate(() => { SYNQUENZER.launchScene(0); SYNQUENZER.play(); }); await sleep(4500);
let P = await played();
const ser1 = await p.evaluate(() => JSON.parse(SYNQUENZER.serialize()).project);
const strip = o => { const c = JSON.parse(JSON.stringify(o)); delete c.saved; return c; };
const newKeys = o => { const out = []; const walk = (v, path) => { if (v && typeof v === 'object') for (const k of Object.keys(v)) { if (k === 'pitch' || k === 'chor') out.push(path + '.' + k); walk(v[k], path + '.' + k); } }; walk(o, ''); return out; };
const nk0 = newKeys(ser0), nk1 = newKeys(ser1), hasNew = nk1.filter(k => !nk0.includes(k)).concat(newKeys(ser1.takes || {}).map(k => 'takes' + k)).filter((v, i, a) => a.indexOf(v) === i); console.log('pitch/chor-Schlüssel schon vorher (Klang-Parameter):', nk0.slice(0, 4).join(' '));
const hasNewOk = !nk1.some(k => k.startsWith('.takes') || /\.audio\./.test(k)) && nk1.length === nk0.length;
ok(P.raw && beq(P.y, xr) === 0, `Alt-Stand (kein Feld, kein Transponieren) nach 4,5 s Abspielen: gespielt = Roh-Take bitgleich (${beq(P.y, xr)} anders)`);
ok(hasNewOk && deq(strip(ser0.tracks), strip(ser1.tracks)) && deq(ser0.takes, ser1.takes), `Projekt-JSON nach dem Abspielen ohne neue Felder (neue pitch/chor-Schlüssel an Takes/Audio: ${nk1.filter(k => k.startsWith('.takes') || /\.audio\./.test(k)).join(',') || 'keine'}), Spuren/Takes deep-equal`);
const inf0 = await p.evaluate(R => SYNQUENZER.g7Info(R), R); console.log('nach Abspielen ohne Transponieren:', JSON.stringify({shift: inf0.shift, cache: inf0.cache, renders: inf0.renders}));
// G7-01: Transponieren (TRANSP-Modus, Akkorde), Vergleich je Note mit outPitch
await p.evaluate(() => SYNQUENZER.setKbMode('transpose'));
await longTasks(p);
const win = n => [n.t0 + 0.07, n.t1 - 0.06];
const results = {};
for (const [name, chord] of [['d-Moll', [62, 65, 69]], ['E-Dur', [64, 68, 71]], ['F-Dur', [65, 69, 72]], ['d-Moll (Cache)', [62, 65, 69]]]) {
  const rn0 = (await p.evaluate(R => SYNQUENZER.g7Info(R), R)).renders, t0 = Date.now();
  await p.evaluate(c => SYNQUENZER.chord(c, 150), chord);
  await p.waitForFunction(R => { const i = SYNQUENZER.g7Info(R); return i.shift && i.ready; }, R, {timeout: 20000}).catch(() => {});
  const tReady = Date.now() - t0;
  const tab = await p.evaluate(([st, ms]) => ms.map(m => SYNQUENZER.outPitch(st, m, null)), [R.t, MEL]);
  P = await played(); const inf = await p.evaluate(R => SYNQUENZER.g7Info(R), R);
  const rows = [], e = []; MEL.forEach((m, k) => { const [a, b] = win(truth[k]); const f = notePitch(P.y, SR, a, b), c = ct(f, hz(tab[k])); e.push(c); rows.push(`${nm(m)}→${nm(tab[k])} ${c >= 0 ? '+' : ''}${c.toFixed(1)}`); });
  const w = Math.max(...e.map(Math.abs)), sh = inf.shift || [];
  const shOk = MEL.every((m, k) => sh[k] === tab[k] - m);
  const cd = cons.map(([a, b, k]) => { let d = 0; for (let i = Math.floor(a * SR); i < Math.floor((b + (k === 't' ? 0.025 : 0)) * SR); i++) if (P.y[i] !== xr[i]) d++; return d; });
  results[name] = P.y;
  ok(!P.raw && w <= 5 && shOk, `G7-01 Träger ${name}: je Note = outPitch der STIMME-Spur ±5 Cent – max ${w.toFixed(2)} Cent: ${rows.join(', ')}; Verschiebung ${JSON.stringify(sh)} (bereit nach ${tReady} ms, Renders +${inf.renders - rn0})`);
  ok(cd.every(d => d === 0), `G7-02 ${name}: Zisch-/Plosivlaute bitgleich (${cd.join(',')} Samples anders)`);
}
// zurück: Akkord a-Moll → bitgleich
await p.evaluate(() => SYNQUENZER.chord([57, 60, 64], 150)); await sleep(800);
P = await played(); let inf = await p.evaluate(R => SYNQUENZER.g7Info(R), R);
ok(P.raw && beq(P.y, xr) === 0, `G7-03 zurück (Akkord a-Moll): gespielt = Roh-Take bitgleich (${beq(P.y, xr)} anders; shift ${JSON.stringify(inf.shift)})`);
await p.evaluate(() => SYNQUENZER.chord([62, 65, 69], 150)); await sleep(800);
await p.evaluate(() => SYNQUENZER.resetCarrier()); await sleep(800);
P = await played(); inf = await p.evaluate(R => SYNQUENZER.g7Info(R), R);
ok(P.raw && beq(P.y, xr) === 0, `G7-03 zurück per resetCarrier (Träger aus): bitgleich (${beq(P.y, xr)} anders; shift ${JSON.stringify(inf.shift)})`);
const ltT = await ltGet(p); ok(!ltT.filter(d => d > 50).length, `keine langen Tasks > 50 ms beim Transponieren (4 Lagen + zurück): [${ltT.join(',') || '–'}]`);
await p.evaluate(() => SYNQUENZER.stop()); await sleep(300);
// G7-04: Hin und her beim Abspielen auf einer gehaltenen Fläche („aaah“, 2 Takte) – Mitschnitt
const hold = singer(SR, 4.75, [{t0: 0.02, vib: 12, segs: [{m: 57, off: 0, d: 4.7, vowel: 'a', f0: hz(57)}]}], {seed: 5}).x;
const r2 = await p.evaluate(pcm => SYNQUENZER.tkInject({pcm, sr: 48000, scene: 1, len: 2}), toI16(hold)); const R2 = {t: r2.track, s: 1};
await p.evaluate(() => { SYNQUENZER.launchScene(1); SYNQUENZER.play(); }); await sleep(2500);
await p.evaluate(() => SYNQUENZER.chord([62, 65, 69], 120)); await sleep(2500);   // d-Moll einmal rechnen
await p.evaluate(() => SYNQUENZER.chord([57, 60, 64], 120)); await sleep(1500);
await longTasks(p);
const sr = await rec2Start(p); const tStart = await p.evaluate(() => window.__ctx.currentTime); const sw = [];
for (let k = 0; k < 8; k++) { await sleep(900); const c = k % 2 ? [57, 60, 64] : [62, 65, 69]; const t = await p.evaluate(() => window.__ctx.currentTime); sw.push(t - tStart); await p.evaluate(c => SYNQUENZER.chord(c, 100), c); }
await sleep(1200); const rr = await rec2Stop(p); const ltP = await ltGet(p);
await p.evaluate(() => SYNQUENZER.stop());
{
  const L = Float32Array.from(rr.l), W = Math.round(0.005 * rr.sr), e = []; for (let s = 0; s + W <= L.length; s += W) { let q = 0; for (let i = s; i < s + W; i++) q += L[i] * L[i]; e.push(10 * Math.log10(q / W + 1e-14)); }
  // Löcher: 5-ms-Energie ≥ 6 dB unter dem Median ±50 ms, wo die Umgebung klingt (> −50 dBFS); Klicks: HP 4 kHz Spitze
  let holes = []; for (let k = 10; k < e.length - 10; k++) { const nb = e.slice(k - 10, k).concat(e.slice(k + 1, k + 11)).sort((a, b) => a - b); if (nb[0] > -50 && e[k] < nb[10] - 6) holes.push((k * W / rr.sr).toFixed(3)); }
  // Klick-Maß: HP 4 kHz, 1 ms, Spitze gegen Median ±30 ms – an den Umschaltzeiten (Wechsel gilt ab Schlag → ±0,7 s) und im ganzen Mitschnitt
  const hpE = (() => { const h = hp2(L, 4000, rr.sr), Wk = Math.round(0.001 * rr.sr), n = Math.floor(h.length / Wk), o = new Float64Array(n); for (let k = 0; k < n; k++) { let s = 0; for (let i = k * Wk; i < (k + 1) * Wk; i++) s += h[i] * h[i]; o[k] = 10 * Math.log10(s / Wk + 1e-14); } return o; })();
  let worst = -99, wat = 0; for (let k = 30; k < hpE.length - 30; k++) { const nb = []; for (let j = k - 30; j <= k + 30; j++) if (Math.abs(j - k) > 2) nb.push(hpE[j]); const d = hpE[k] - median(nb); if (d > worst) { worst = d; wat = k / 1000; } }
  // gleiches Maß auf einem Mitschnitt ohne Wechsel (Vergleich)
  const tr = yinTrack(L, rr.sr, 0.1, L.length / rr.sr - 0.1).filter(v => v === v), lv = tr.map(f => ct(f, hz(57)));
  const lagen = [0, 0]; for (const c of lv) { if (Math.abs(c) < 60) lagen[0]++; else if (Math.abs(c - 500) < 60 || Math.abs(c + 700) < 60) lagen[1]++; }
  const swi = await p.evaluate(() => SYNQUENZER.wpSwitchInfo());
  globalThis.__sw = {holes, worst, wat, lagen, swi};
  ok(holes.length === 0, `G7-04 8 Wechsel a-Moll ↔ d-Moll beim Abspielen (gehaltene Fläche): Löcher ≥ 6 dB: ${holes.length} [${holes.join(',') || '–'}]`);
  ok(lagen[1] > 50 && lagen[0] > 50, `G7-04 gehört: beide Lagen im Mitschnitt (Frames Original ${lagen[0]}, d-Moll-Lage ${lagen[1]}, Cent-Werte ${[...new Set(lv.map(c => Math.round(c / 50) * 50))].join('/')})`);
  ok(!ltP.filter(d => d > 50).length, `G7-04 keine langen Tasks > 50 ms beim Wechseln: [${ltP.join(',') || '–'}]; Überblendung ${JSON.stringify(swi)}`);
  globalThis.__L = L; globalThis.__sr = rr.sr;
}
// Vergleich: Klick-Maß mit und ohne Wechsel (gleicher Take, ohne Akkordwechsel)
await p.evaluate(() => { SYNQUENZER.launchScene(1); SYNQUENZER.play(); }); await sleep(800);
await rec2Start(p); await sleep(7200 + 1200); const rq = await rec2Stop(p); await p.evaluate(() => SYNQUENZER.stop());
{
  const mk = L => { const h = hp2(L, 4000, rq.sr), Wk = Math.round(0.001 * rq.sr), n = Math.floor(h.length / Wk), o = new Float64Array(n); for (let k = 0; k < n; k++) { let s = 0; for (let i = k * Wk; i < (k + 1) * Wk; i++) s += h[i] * h[i]; o[k] = 10 * Math.log10(s / Wk + 1e-14); } let w = -99; for (let k = 30; k < n - 30; k++) { const nb = []; for (let j = k - 30; j <= k + 30; j++) if (Math.abs(j - k) > 2) nb.push(o[j]); w = Math.max(w, o[k] - median(nb)); } return w; };
  const a = globalThis.__sw.worst, b = mk(Float32Array.from(rq.l));
  ok(a <= b + 3, `G7-04 Klick-Maß (HP 4 kHz, 1 ms über Median ±30 ms): mit 8 Wechseln ${a.toFixed(1)} dB (bei ${globalThis.__sw.wat.toFixed(3)} s), ohne Wechsel ${b.toFixed(1)} dB`);
}
// G7 + G2: quantisierter Take folgt dem Transponieren; zurück → bitgleich zur Quantisier-Fassung
await p.evaluate(() => SYNQUENZER.chord([57, 60, 64], 120)); await sleep(500);
await p.evaluate(() => { SYNQUENZER.launchScene(0); });
const off = singer(SR, 3.6, MEL.map((m, k) => ({t0: 0.05 + k * 0.48, vib: 10, segs: [{m, off: [35, -38, 41, -33, 30, -44, 37][k], d: 0.4, vowel: 'a', f0: hz(m + [35, -38, 41, -33, 30, -44, 37][k] / 100)}]})), {seed: 2}).x;
const r3 = await p.evaluate(pcm => SYNQUENZER.tkInject({pcm, sr: 48000, scene: 2, len: 2}), toI16(off)); const R3 = {t: r3.track, s: 2};
await p.evaluate(() => { SYNQUENZER.launchScene(2); SYNQUENZER.play(); }); await sleep(600);
await p.evaluate(R => SYNQUENZER.g2Quantize(R, {q: true, mode: 'hard', str: 1}), R3);
const pq = async () => Float32Array.from((await p.evaluate(R => SYNQUENZER.g2Played(R), R3)).data);
const Yq = await pq();
await p.evaluate(() => SYNQUENZER.chord([62, 65, 69], 150)); await p.waitForFunction(R => { const i = SYNQUENZER.g7Info(R); return i.shift && i.ready; }, R3, {timeout: 20000}).catch(() => {});
const Yt = await pq(); const tab = await p.evaluate(([st, ms]) => ms.map(m => SYNQUENZER.outPitch(st, m, null)), [R3.t, MEL]);
{ const e = MEL.map((m, k) => ct(notePitch(Yt, SR, 0.05 + k * 0.48 + 0.07, 0.05 + k * 0.48 + 0.34), hz(tab[k]))), w = Math.max(...e.map(Math.abs)); ok(w <= 5, `G7+G2: quantisierter Take (Hart 100 %) unter d-Moll je Note = outPitch ±5 Cent – max ${w.toFixed(2)} [${e.map(v => v.toFixed(1)).join(' ')}]`); }
await p.evaluate(() => SYNQUENZER.chord([57, 60, 64], 150)); await sleep(900);
{ const Yb = await pq(); ok(beq(Yb, Yq) === 0, `G7+G2 zurück: bitgleich zur Quantisier-Fassung (${beq(Yb, Yq)} anders)`); }
await p.evaluate(() => SYNQUENZER.stop());
ok(!errs.length, 'keine Seitenfehler ' + errs.join(' | '));
await br.close();
fs.writeFileSync('/home/user/Synquenzer/bau/helfer/G267/tests/rt/out/rt-g7.out', OUT.join('\n') + '\n');
console.log(fail ? fail + ' FEHLER' : 'ALLE GRÜN'); process.exit(fail ? 1 : 0);
