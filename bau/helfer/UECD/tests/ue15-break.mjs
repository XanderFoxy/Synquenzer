// UE-15 / UE-D Breaks: gewählte Spuren 0 Noten, Hall/Echo klingen aus, kein Klick über −40 dBFS an Anfang/Ende; [Kick bleibt];
// Breakdown (nur Drums); Break stoppt auch Gesang (STIMME) + Chor und North-Pads; sauberer Wiedereinsatz; Undo/Redo; Speichern/Laden.
import {open, render, pcm, ok, db, DIR} from './lib.mjs';
import fs from 'fs';
const R = [], {b, p, errs} = await open();
const A = (f, ...a) => p.evaluate(([f, a]) => window.SYNQUENZER[f](...a), [f, a]);
// Song: 3 Teile à 4 Takte. o.drums, o.pad (Synth 1, Hall-Send), o.voc (STIMME-Take + Chor), o.kit
async function build(o) {
  if (o.voc) {
    await p.evaluate(() => window.SYNQUENZER.newProject({}));
    const sr = 48000, n = sr * 26, pc = new Array(n);
    for (let k = 0; k < n; k++) { const t = k / sr; pc[k] = Math.round(9000 * Math.sin(2 * Math.PI * 220 * t + .3 * Math.sin(2 * Math.PI * 5 * t)) * Math.min(1, t * 20, (26 - t) * 20)); }
    const r = await p.evaluate(pc => window.SYNQUENZER.tkInject({pcm: pc, sr: 48000, scene: 0, len: 12}), pc);
    if (o.chor) { await p.evaluate(t => window.SYNQUENZER.g6Make({t, s: 0}, 'terz', 'up', '80'), r.track); await p.evaluate(t => window.SYNQUENZER.g6Wait({t, s: 0}), r.track); }
  } else await p.evaluate(() => window.SYNQUENZER.newProject({}));
  return p.evaluate(o => {
    const A = window.SYNQUENZER, lanes = Array.from({length: A.NT()}, () => []);
    if (o.drums) {
      const notes = []; for (let i = 0; i < 16; i++) { if (i % 4 === 0) notes.push({t: i * .25, d: .1, n: 36, v: .8}); if (i % 8 === 4) notes.push({t: i * .25, d: .1, n: 38, v: 1, a: 1}); if (i % 2 === 0) notes.push({t: i * .25, d: .1, n: 42, v: .7}); }
      A.setClip(4, 0, {len: 1, notes}); lanes[4] = [{bar: 0, slot: 0}];
    }
    if (o.kit) A.loadKit(o.kit);
    if (o.pad) { A.setClip(0, 0, {len: 1, notes: [{t: 0, d: 4, n: 57, v: .7}, {t: 0, d: 4, n: 60, v: .7}, {t: 0, d: 4, n: 64, v: .7}]}); lanes[0] = [{bar: 0, slot: 0}]; A.setTrackFx(0, 'rev', o.rev == null ? .5 : o.rev); A.setTrackFx(0, 'dly', o.dly || 0); }
    A.setTrackFx(4, 'vol', .6);
    const st = S.tracks.findIndex(t => t.stimme); if (o.voc && st >= 0) lanes[st] = [{bar: 0, slot: 0}];
    A.setSong({bars: 12, lanes, carrier: [], marks: [{a: 0, len: 4, part: 'S1'}, {a: 4, len: 4, part: 'S2'}, {a: 8, len: 4, part: 'S3'}], mel: {}});
    return {marks: A.song().marks, st};
  }, o);
}
function hp(x, sr, fc) { // Butterworth 2. Ordnung
  const w = Math.tan(Math.PI * fc / sr), n = 1 / (1 + Math.SQRT2 * w + w * w), b0 = n, b1 = -2 * n, b2 = n, a1 = 2 * (w * w - 1) * n, a2 = (1 - Math.SQRT2 * w + w * w) * n;
  const y = new Float32Array(x.length); let x1 = 0, x2 = 0, y1 = 0, y2 = 0; for (let k = 0; k < x.length; k++) { const v = b0 * x[k] + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2; x2 = x1; x1 = x[k]; y2 = y1; y1 = v; y[k] = v; } return y;
}
const win = (x, sr, t0, t1) => x.subarray(Math.max(0, Math.round(t0 * sr)), Math.min(x.length, Math.round(t1 * sr)));
const pk = a => { let m = 0; for (const v of a) { const q = Math.abs(v); if (q > m) m = q; } return db(m); };
const rms = a => { let s = 0; for (const v of a) s += v * v; return 10 * Math.log10(s / Math.max(1, a.length) + 1e-20); };
// ---------- A: Stopp 1 Takt an Kante 4|5 (Standard: alle außer Gesang) – Noten, Ausklang, Klick ----------
let {marks} = await build({drums: 1, pad: 1, kit: 'Rom Pop'});
const ub = await A('ueAdd', 'w-stopp-takt', {m: marks[1].id}, {});
const u = (await A('ueList'))[0];
let r = await render(p, 0, 12); const spb = 60 / r.bpm, s0 = 12, s1 = 16;
const inB = e => e.beat >= s0 - 1e-6 && e.beat < s1 - 1e-6;
const nIn = r.log.filter(e => inB(e) && u.stop.includes(e.track)).length, nAfter = r.log.filter(e => Math.abs(e.beat - s1) < 1e-6).length;
R.push(ok(nIn === 0 && nAfter >= 2 && u.stop.length >= 5, 'UE-15 Break 1 Takt: gewählte Spuren 0 Noten, Einsatz auf der Eins danach', {stop: u.stop, imBreak: nIn, aufDerEins: nAfter}));
let P = await pcm(p, 0, r.songSec), sr = P.sr;
const t0 = s0 * spb, t1 = s1 * spb, L = P.L;
const q1 = rms(win(L, sr, t0 + .05, t0 + .05 + (t1 - t0) / 4)), q4 = rms(win(L, sr, t1 - .05 - (t1 - t0) / 4, t1 - .05));
// Vergleich: gleicher Song ohne Hall/Echo → im Break still
await A('setBusFx', 'hall.ret', 0); await A('setBusFx', 'echo.ret', 0);
let r0 = await render(p, 0, 12), P0 = await pcm(p, 0, r0.songSec);
const dry = rms(win(P0.L, sr, t0 + .05, t1 - .02));
R.push(ok(q1 > -75 && q1 > q4 + 3 && q1 > dry + 6, 'UE-15 Hall/Echo klingen im Break aus (Pegel fällt), trocken = still', {q1: +q1.toFixed(1), q4: +q4.toFixed(1), trocken: +dry.toFixed(1)}));
// Klick: Hochpass 4 kHz – im Break-Inneren ≤ −40 dBFS, an der Blende (Anfang 0…25 ms, Ende −20…0 ms) nicht über dem Inhalt davor bzw. ≤ −40 dBFS
const H0 = hp(P0.L, sr, 4000), H1 = hp(P0.R, sr, 4000);
const inner = Math.max(pk(win(H0, sr, t0 + .03, t1 - .03)), pk(win(H1, sr, t0 + .03, t1 - .03)));
const atStart = Math.max(pk(win(H0, sr, t0, t0 + .025)), pk(win(H1, sr, t0, t0 + .025))), before = Math.max(pk(win(H0, sr, t0 - .025, t0)), pk(win(H1, sr, t0 - .025, t0)));
const atEnd = Math.max(pk(win(H0, sr, t1 - .02, t1 - .0005)), pk(win(H1, sr, t1 - .02, t1 - .0005)));
R.push(ok(inner <= -40 && atEnd <= -40 && (atStart <= -40 || atStart <= before + .5), 'UE-15 kein Klick über −40 dBFS an Anfang und Ende', {innen: +inner.toFixed(1), anfang: +atStart.toFixed(1), davor: +before.toFixed(1), ende: +atEnd.toFixed(1)}));
// ---------- B: [Kick bleibt] ----------
await A('ueSet', ub, {kick: true}); r = await render(p, 0, 12);
const kb = r.log.filter(e => inB(e) && e.track === 4), kOnly = kb.length > 0 && kb.every(e => e.out === 36), synth = r.log.filter(e => inB(e) && e.track === 0).length;
R.push(ok(kOnly && kb.length === 4 && synth === 0, 'Break [Kick bleibt]: im Break nur die Kick (4×), Synth 0', {kick: kb.length, synth}));
// Undo/Redo + Speichern/Laden
const sK = JSON.stringify(await A('song')); await A('undo'); const sU = JSON.stringify(await A('song')); await A('redo'); const sR = JSON.stringify(await A('song'));
const f = await A('serialize'); await A('importJSON', f); await p.waitForTimeout(300); const sL = JSON.stringify((await A('song')).ue);
R.push(ok(sU !== sK && sR === sK && sL === JSON.stringify(JSON.parse(sK).ue), 'Break: Undo/Redo und Speichern/Laden bit-gleich', {}));
// ---------- C: Breakdown (2 Takte, nur Drums) ----------
({marks} = await build({drums: 1, pad: 1, kit: '909'}));
await A('ueAdd', 'w-breakdown', {m: marks[2].id}, {}); r = await render(p, 0, 12);
const bd = e => e.beat >= 24 - 1e-6 && e.beat < 32 - 1e-6;
R.push(ok(r.log.filter(e => bd(e) && e.track === 4).length === 0 && r.log.filter(e => bd(e) && e.track === 0).length > 0, 'Breakdown: nur die Drums schweigen', {drums: r.log.filter(e => bd(e) && e.track === 4).length, synth: r.log.filter(e => bd(e) && e.track === 0).length}));
// ---------- D: Gesang (STIMME) + Chor stoppen mit ----------
let bv = await build({voc: 1});                                         // ohne Chor: Vergleichspegel
r = await render(p, 0, 12); P = await pcm(p, 0, r.songSec); const vNoChor = rms(win(P.L, sr, t0 - 1.0, t0 - .05));
bv = await build({voc: 1, chor: 1});
const stv = bv.st;
await A('ueAdd', 'w-stopp-takt', {m: bv.marks[1].id}, {stop: [stv]});
r = await render(p, 0, 12); P = await pcm(p, 0, r.songSec);
const vOut = rms(win(P.L, sr, t0 - 1.0, t0 - .05)), vAfter = rms(win(P.L, sr, t1 + .05, t1 + 1));
const vq1 = rms(win(P.L, sr, t0 + .03, t0 + .5)), vq4 = rms(win(P.L, sr, t1 - .5, t1 - .03));
await A('setBusFx', 'hall.ret', 0); await A('setBusFx', 'echo.ret', 0);              // trocken: ohne Hall-/Echo-Rückweg
r = await render(p, 0, 12); P = await pcm(p, 0, r.songSec);
const vIn = rms(win(P.L, sr, t0 + .03, t1 - .03));
R.push(ok(vOut > vNoChor + 1 && vIn < vOut - 40 && vAfter > vOut - 6 && vq1 > vq4, 'Break stoppt Gesang + Chor (STIMME-Spur), Hall klingt aus, sauberer Wiedereinsatz', {ohneChor: +vNoChor.toFixed(1), trockenImBreak: +vIn.toFixed(1), davor: +vOut.toFixed(1), danach: +vAfter.toFixed(1), hallAnfang: +vq1.toFixed(1), hallEnde: +vq4.toFixed(1)}));
await A('setBusFx', 'hall.ret', .8); await A('setBusFx', 'echo.ret', .8);
// Standard-Break lässt den Gesang laufen
await A('ueSet', (await A('ueList'))[0].id, {stop: [0, 1, 2, 3, 4, 5]}); r = await render(p, 0, 12); P = await pcm(p, 0, r.songSec);
const vStd = rms(win(P.L, sr, t0 + .03, t1 - .03));
R.push(ok(vStd > vOut - 6, 'Standard-Break (alle außer Gesang): Gesang klingt weiter', {imBreak: +vStd.toFixed(1), davor: +vOut.toFixed(1)}));
// ---------- E: North-Kit: Pads der Drum-Engine North schweigen im Break ----------
({marks} = await build({drums: 1}));
const nk = await p.evaluate(() => MD_KIT_NAMES[0]); await A('loadKit', nk);
const mdOn = await p.evaluate(() => mdUsed());
await A('ueAdd', 'w-stopp-takt', {m: marks[1].id}, {});
await A('ueAdd', 'w-tom-wirbel', {m: marks[2].id}, {dens: 1});
r = await render(p, 0, 12); P = await pcm(p, 0, r.songSec);
const nIn2 = r.log.filter(e => inB(e) && e.track === 4).length, nRms = rms(win(P.L, sr, t0 + .08, t1 - .03)), nBefore = rms(win(P.L, sr, t0 - 1.5, t0 - .05));
const nUe = r.log.filter(e => e.src === 'ue').length;
R.push(ok(mdOn && nIn2 === 0 && nRms < nBefore - 35 && nUe > 0, 'North-Kit: Break schweigt (0 Noten, still), Übergang spielt mit North', {kit: nk, md: mdOn, noten: nIn2, imBreak: +nRms.toFixed(1), davor: +nBefore.toFixed(1), ueTreffer: nUe}));
// ---------- F: freier Break in einem Teil (1/16) + live: Blende liegt an den Spuren, Stopp setzt sie zurück ----------
({marks} = await build({drums: 1, pad: 1, kit: 'Disko 85'}));
const fb = await A('ueAdd', 'w-stopp-1', {at: 6.5}, {}); const lf = (await A('ueList'))[0];
r = await render(p, 0, 12);
R.push(ok(lf.at === 6.5 && r.log.filter(e => e.beat >= 6.5 - 1e-6 && e.beat < 7.5 - 1e-6 && lf.stop.includes(e.track)).length === 0, 'freier Break in einem Teil (1/16), 0 Noten im Fenster', {at: lf.at}));
await p.evaluate(() => { window.SYNQUENZER.setBpm(240); window.SYNQUENZER.songPlay(0); });
await p.waitForFunction(() => R.playing && songBeatOf(audBeat()) > 7.1, null, {timeout: 8000});
const gMid = await p.evaluate(() => AU.tracks[0].ueB.gain.value);
await p.evaluate(() => window.SYNQUENZER.songPlay(false)); await p.waitForTimeout(150);
const gStop = await p.evaluate(() => AU.tracks.filter(Boolean).map(A => A.ueB.gain.value));
R.push(ok(gMid < .01 && gStop.every(v => v === 1), 'live: Break-Blende 0 im Break, nach Stopp überall 1', {mitte: gMid, nachStopp: gStop}));
R.push(ok(errs.length === 0, 'keine Seitenfehler', errs.slice(0, 5)));
fs.mkdirSync(DIR + '/out', {recursive: true}); fs.writeFileSync(DIR + '/out/ue15-break.json', JSON.stringify(R, null, 1));
console.log(R.filter(x => x.ok).length + '/' + R.length + ' OK');
await b.close(); process.exit(R.every(x => x.ok) ? 0 : 1);
