// SX11 2: Wechsel während des Abspielens – Tipp auf [Leicht]/[Voll] im Marken-Blatt (Touch) wirkt am nächsten Taktstrich;
// eine Fläche, die über den Taktstrich klingt, klingt aus (Release) statt hart abzureißen: kein Knackser (Offline-Render, 2. Ableitung)
import { open, buildSong, ok, summary, notesOf } from './lib.mjs';
const {b, p, errs} = await open();
await buildSong(p, {cats: true});
await p.evaluate(() => { S.bpm = 120; setSongView(true); });
const tapSx = async a => { const r = await p.evaluate(a => { const x = UI.pop && UI.pop.el.querySelector(`button[data-sx="${a}"]`); if (!x) return null; const q = x.getBoundingClientRect(); return {x: q.x + q.width / 2, y: q.y + q.height / 2, w: q.width, h: q.height}; }, a); if (!r) return null; await p.touchscreen.tap(r.x, r.y); await p.waitForTimeout(60); return r; };
const waitBeat = bt => p.waitForFunction(bt => R.songPlay && songBeatOf(audBeat()) >= bt, bt, {timeout: 20000, polling: 5});
const sbNow = () => p.evaluate(() => songBeatOf(audBeat()));

console.log('Im Lauf: Refrain 1. Takt → [Leicht] → ab Takt 8 leicht; 3. Takt → [Voll] → ab Takt 10 voll');
await p.evaluate(() => { clearLog(); SYNQUENZER.songSelect(null); songPlayStart(5); });
await waitBeat(6 * 4 + 1.3);
await p.evaluate(() => openMarkSheet('M3')); await p.waitForTimeout(80);
const t1 = await sbNow(), r1 = await tapSx('l'), t1b = await sbNow();
ok(r1 && r1.h >= 44 && r1.w >= 44, 'Knopf [Leicht] ≥ 44 px', r1);
ok(await p.evaluate(() => SYNQUENZER.markFassung('M3')) === 'l', 'Tipp im Lauf: Refrain leicht (Tipp bei Schlag ' + t1.toFixed(2) + '–' + t1b.toFixed(2) + ')');
await waitBeat(8 * 4 + 1.1);
const t2 = await sbNow(); await tapSx('v');
ok(await p.evaluate(() => SYNQUENZER.markFassung('M3')) === 'v', 'Tipp im Lauf: wieder voll (Schlag ' + t2.toFixed(2) + ')');
await waitBeat(10 * 4 + .5);
await p.evaluate(() => { stop(); closePop(); });
await p.waitForTimeout(300);
const log = notesOf(await p.evaluate(() => noteLog(4096))).map(n => [n[0], n[1], n[2], +(n[3] - 0).toFixed(3)]);
// noteLog beats are transport beats: songPlayStart(5) maps song beat 20 to the first transport beat of the take
const off = await p.evaluate(() => 0);
const sbOf = await p.evaluate(() => (R.songPlay ? R.songPlay.off : null));
const L0 = log[0] ? log[0][3] : 0, base = L0 - 20;      // the first note sits on song beat 20 (bar 6, all tracks)
const sl = log.map(n => [n[0], n[1], n[2], +(n[3] - base).toFixed(3)]);
const has = (t, a, e, f) => sl.filter(n => n[0] === t && n[3] >= a - 1e-3 && n[3] < e - 1e-3 && (!f || f(n)));
const nb1 = Math.floor(t1b / 4 + 1e-9) + 1, nb2 = Math.floor((t2 + .2) / 4 + 1e-9) + 1;
ok(nb1 === 7 && nb2 === 9, 'nächster Taktstrich nach den Tipps: Takt ' + (nb1 + 1) + ' und ' + (nb2 + 1), {t1, t1b, t2});
ok(has(2, 24, 28).length > 0 && has(3, 24, 28).length === 5, 'Takt 7 (Tipp-Takt) spielt noch voll: Fläche + 5 Lead-Noten', {pad: has(2, 24, 28).length, lead: has(3, 24, 28).length});
ok(has(2, 28, 36).length === 0 && has(3, 28, 36).length === 0, 'Takt 8–9: Fläche und Lead aus (leicht)', {pad: has(2, 28, 36), lead: has(3, 28, 36).slice(0, 3)});
ok(has(4, 24, 28, n => n[2] === 49 || n[2] === 46).length === 3 && has(4, 28, 36, n => n[2] === 49 || n[2] === 46).length === 0, 'Drums: Takt 7 voll (Becken, offene Hi-Hat), Takt 8–9 ohne');
ok(has(4, 28, 36, n => n[2] === 42).length === 16 && has(4, 24, 28, n => n[2] === 42).length === 17, 'Hi-Hat: Takt 7 16tel (+1 Ratsche), Takt 8–9 Achtel', {a: has(4, 24, 28, n => n[2] === 42).length, b: has(4, 28, 36, n => n[2] === 42).length});
ok(has(2, 36, 40).length > 0 && has(3, 36, 40).length === 5 && has(4, 36, 40, n => n[2] === 49).length === 1, 'ab Takt 10 wieder voll (Fläche, Lead, Becken)', {pad: has(2, 36, 40).length, lead: has(3, 36, 40).length});
for (const t of [0, 1, 5]) ok(has(t, 20, 40).length === (t === 0 ? 40 : t === 1 ? 60 : 20), 'Spur ' + t + ' spielt durch (ohne Lücke, ohne doppelte Noten)', has(t, 20, 40).length);
ok(!sl.some(n => n[3] % 1 > 1e-3 && n[0] !== 3 && n[0] !== 4 && n[0] !== 1 && n[0] !== 0), 'keine Noten neben dem Raster');

console.log('Im Lauf: [Leicht], dann ↶ Rückgängig mitten im leichten Takt → voll ab dem nächsten Taktstrich');
await p.evaluate(() => { clearLog(); songPlayStart(5); });
await waitBeat(6 * 4 + 1.3);
await p.evaluate(() => SYNQUENZER.markFassungSet('M3', 'l'));
await waitBeat(7 * 4 + 1.2);
await p.evaluate(() => SYNQUENZER.undo());
ok(await p.evaluate(() => SYNQUENZER.markFassung('M3')) === 'v', 'rückgängig: voll');
await waitBeat(9 * 4 + .5);
await p.evaluate(() => stop()); await p.waitForTimeout(300);
{ const lg = notesOf(await p.evaluate(() => noteLog(4096))), bs = lg[0][3] - 20, q = (a, e, f) => lg.filter(n => n[0] === 4 && n[3] - bs >= a - 1e-3 && n[3] - bs < e - 1e-3 && f(n)).length;
  ok(q(28, 32, n => n[2] === 42) === 8 && q(28, 32, n => n[2] === 46) === 0, 'Takt 8 (Undo-Takt) bleibt bis zum Taktstrich leicht', {hh: q(28, 32, n => n[2] === 42), oh: q(28, 32, n => n[2] === 46)});
  ok(q(32, 36, n => n[2] === 42) === 17 && q(32, 36, n => n[2] === 46) === 2, 'ab Takt 9 voll', {hh: q(32, 36, n => n[2] === 42)});
  const pd = a => lg.filter(n => n[0] === 2 && n[3] - bs >= a - 1e-3 && n[3] - bs < a + 4 - 1e-3).length;
  ok(pd(28) === 0 && pd(32) === 4, 'Fläche: Takt 8 aus, ab Takt 9 wieder an', {b8: pd(28), b9: pd(32)}); }

console.log('Knackser: Fläche klingt über den Taktstrich, der Refrain schaltet sie aus (Offline-Render)');
await p.evaluate(() => {
  // nur die Fläche: ein 2-Takt-Clip, die Note hält 8 Schläge und klingt über Takt 6→7 (die Grenze Strophe │ Refrain)
  const t = 2; S.tracks[t].clips[1] = normClip({len: 2, notes: [60, 64, 67].map(n => ({t: 0, d: 8, n, v: .7}))}, 'synth', S.key);
  for (let k = 0; k < NT(); k++) S.song.lanes[k] = k === t ? [{bar: 0, slot: -1}, {bar: 5, slot: 1}] : [{bar: 0, slot: -1}];
  songTidy(S.song); songChanged(); S.bpm = 120;
});
const render = () => p.evaluate(async () => { const r = await SYNQUENZER.vvRender({range: {a: 4, b: 8}}); const pc = SYNQUENZER.vvPcm(); const bin = atob(pc.b64), u = new Int16Array(bin.length / 2); for (let k = 0; k < u.length; k++) u[k] = (bin.charCodeAt(2 * k) | (bin.charCodeAt(2 * k + 1) << 8)) << 16 >> 16; return {sr: pc.sr, n: pc.n, x: Array.from(u.filter((_, k) => k % 2 === 0)), peak: r.peak}; });
const V = await render();
await p.evaluate(() => SYNQUENZER.markFassungSet('M3', 'l'));
ok(await p.evaluate(() => S.song.lanes[2].some(e => e.bar === 6 && e.slot < 0)), 'Refrain leicht: die Fläche ist ab Takt 7 aus');
const Lr = await render();
let i0 = -1; for (let k = 0; k < Math.min(V.x.length, Lr.x.length); k++) if (Math.abs(V.x[k] - Lr.x[k]) > 40) { i0 = k; break; }
const spb = 0.5 * V.sr, i6 = i0;   // the first sample where voll and leicht differ = the bar line (the release begins)
ok(i0 > 0, 'leicht und voll gleich bis zur Grenze, dann verschieden (Probe ' + i0 + ', ' + (i0 / V.sr).toFixed(3) + ' s)');
const win = (x, a, e) => { let m = 0; for (let k = Math.max(2, a); k < Math.min(x.length, e); k++) m = Math.max(m, Math.abs(x[k] - 2 * x[k - 1] + x[k - 2])); return m; };
const rms = (x, a, e) => { let s = 0, n = 0; for (let k = Math.max(0, a); k < Math.min(x.length, e); k++) { s += x[k] * x[k]; n++; } return Math.sqrt(s / Math.max(1, n)); };
const ms = k => Math.round(k * V.sr / 1000);
const dL = win(Lr.x, i6 - ms(3), i6 + ms(10)), dV = win(V.x, i6 - ms(3), i6 + ms(10)), dRef = win(V.x, i6 - ms(200), i6 - ms(20));
ok(dL <= Math.max(dV, dRef) * 1.25 + 8, 'kein Sprung an der Grenze: 2. Ableitung leicht ' + dL + ' ≤ voll ' + dV + ' / davor ' + dRef);
const rB = rms(Lr.x, i6 - ms(20), i6), rA = rms(Lr.x, i6, i6 + ms(5));
ok(rB > 200 && rA > rB * .3, 'die Fläche klingt aus (Release), kein hartes Abreißen: RMS ' + rB.toFixed(0) + ' → ' + rA.toFixed(0) + ' in 5 ms', {rB, rA});
const env = q => [rms(Lr.x, i6 + ms(q), i6 + ms(q + 20)), rms(V.x, i6 + ms(q), i6 + ms(q + 20))];
const e50 = env(50), e600 = env(600), e1500 = env(1500);
ok(e50[0] > e50[1] * .6, 'nach 50 ms klingt die Fläche noch (Release ' + e50[0].toFixed(0) + ' gegen voll ' + e50[1].toFixed(0) + ')');
ok(e600[0] < e600[1] && e1500[0] < e1500[1] * .35, 'dann klingt sie aus (600 ms: ' + e600[0].toFixed(0) + '/' + e600[1].toFixed(0) + ', 1,5 s: ' + e1500[0].toFixed(0) + '/' + e1500[1].toFixed(0) + ')');
ok(errs.length === 0, 'keine Konsolenfehler', errs);
await b.close();
process.exit(summary('SX11-Lauf') ? 1 : 0);
