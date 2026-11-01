// SX1 Abnahme (Video-Offline-Render + WAV-Export): Pegel fällt monoton, am Ende ±1 Schlag unter −60 dB, kein Ausklang;
// die Rampe selbst (derselbe Code sx1Sched am selben Knotentyp) exakt gemessen; vor der Rampe unverändert
import { open, SONG8, PCM_FN, OUT, db } from './sx-lib.mjs';
import fs from 'fs';
fs.mkdirSync(OUT, {recursive: true});
const res = {}; let ok = true;
const {b, p, errs} = await open();
await p.evaluate(s => SYNQUENZER.setSong(s), SONG8); await p.evaluate(PCM_FN);
// 1) die Kurve exakt: Konstante 1 → AU.M.fade-gleicher GainNode → Ausgang = Verstärkung (Offline, 48 kHz)
for (const bars of [2, 4, 8]) {
  const r = await p.evaluate(async bars => {
    const sr = 48000, sec = 1 + bars * sx1Bpb() * .25 + 1, oc = new OfflineAudioContext(1, Math.round(sr * sec), sr), src = oc.createConstantSource(), g = oc.createGain();
    src.connect(g); g.connect(oc.destination); src.start(0);
    const beat = .25, tS = 1, tE = tS + bars * sx1Bpb() * beat;          // 240 BPM, damit 8 Takte in 6 s passen
    sx1Sched(g, tS, tE, beat);
    const y = (await oc.startRendering()).getChannelData(0);
    let mono = true, worst = 0; for (let k = 1; k < y.length; k++) if (y[k] > y[k - 1] + 1e-7) { mono = false; worst = Math.max(worst, y[k] - y[k - 1]); }
    const i60 = y.findIndex(v => v < 1e-3), t60 = i60 / sr, before = y[Math.round((tS - .01) * sr)], atEnd = y[Math.round(tE * sr)], after = y[Math.round((tE + .05) * sr)];
    const half = y[Math.round((tS + (tE - tS) / 2) * sr)];
    return {mono, worst, t60, tE, dBeat: (t60 - tE) / beat, before, half, atEnd, after};
  }, bars);
  const pass = r.mono && Math.abs(r.dBeat) <= 1 && r.before === 1 && r.after === 0;
  res['kurve-' + bars] = Object.assign(r, {halfDb: +db(r.half).toFixed(1), atEndDb: +db(r.atEnd).toFixed(1), ok: pass}); ok = ok && pass;
}
// 2) Video-Render: ohne Ausblenden (Bezug, zweimal = Zufallsstreuung) und mit 2 / 4 Takten
const beatSec = await p.evaluate(() => spb());
const winStats = async () => p.evaluate(bs => __sxWin(0, VV.last.n / VV.last.sr, bs).map(w => w.rms), beatSec);
await p.evaluate(() => SYNQUENZER.vvRender()); const ref1 = await winStats(); const refInfo = await p.evaluate(() => ({dur: VV.last.dur, tail: VV.last.tail, songSec: VV.last.songSec}));
await p.evaluate(() => SYNQUENZER.vvRender()); const ref2 = await winStats();
let spread = 0; for (let k = 0; k < Math.min(ref1.length, ref2.length) && k < 32; k++) spread = Math.max(spread, Math.abs(db(ref1[k]) - db(ref2[k])));
res.bezug = {dur: refInfo.dur, tail: refInfo.tail, streuungDb: +spread.toFixed(2)};
for (const bars of [2, 4]) {
  await p.evaluate(n => SYNQUENZER.sx1Fade(n), bars);
  const x = await p.evaluate(() => SYNQUENZER.vvRender());
  const w = await winStats(), nb = SONG8.bars * 4, F = bars * 4, tol = spread + .5;
  const rel = w.slice(0, nb).map((v, k) => db(v) - db(ref1[k]));
  let mono = true; for (let k = nb - F + 1; k < nb; k++) if (rel[k] > rel[k - 1] + tol) mono = false;
  const pre = rel.slice(0, nb - F).every(v => Math.abs(v) <= tol);
  // −60 dB-Punkt: das erste 1/16-Schlag-Fenster, ab dem der Spitzenwert unter −60 dBFS bleibt
  const fine = await p.evaluate(bs => __sxWin(0, VV.last.n / VV.last.sr, bs / 16), beatSec);
  let k60 = fine.length; while (k60 > 0 && db(fine[k60 - 1].pk) < -60) k60--;
  const t60 = k60 < fine.length ? fine[k60].t : null, dBeat = t60 == null ? null : (t60 - x.songSec) / beatSec;
  const r = {dur: +x.dur.toFixed(4), songSec: +x.songSec.toFixed(4), tail: x.tail, relDb: rel.slice(nb - F - 1).map(v => +v.toFixed(1)), mono, pre, t60, dBeat: dBeat == null ? null : +dBeat.toFixed(3), lastBeatPeakDb: +db(Math.max(...fine.slice(-16).map(f => f.pk))).toFixed(1)};
  r.ok = r.tail === 0 && mono && pre && dBeat != null && Math.abs(dBeat) <= 1; ok = ok && r.ok; res['video-' + bars] = r;
}
// 3) WAV-Export (GarageBand-Instrumental, derselbe Offline-Weg) mit 2 Takten: Datei lesen
{
  await p.evaluate(() => SYNQUENZER.sx1Fade(2));
  const r = await p.evaluate(async () => {
    const x = await SYNQUENZER.ggbExport({pre: 0, remember: false}); const u8 = GGB.res && GGB.res.bytes; if (!u8) return {err: 'keine Datei', x};
    const dv = new DataView(u8.buffer, u8.byteOffset, u8.byteLength), sr = dv.getUint32(24, true), n = dv.getUint32(40, true) / 4, pcm = new Int16Array(u8.buffer.slice(u8.byteOffset + 44, u8.byteOffset + 44 + n * 4));
    const bs = spb(), win = Math.round(bs * sr / 16), out = []; for (let k = 0; k < n; k += win) { let pk = 0; for (let j = k; j < Math.min(n, k + win); j++) pk = Math.max(pk, Math.abs(pcm[2 * j]) / 32768, Math.abs(pcm[2 * j + 1]) / 32768); out.push(pk); }
    return {sr, n, sec: n / sr, songSec: x.songSec, win: out, bs};
  });
  if (r.err) { res.wav = r; ok = false; } else {
    let k60 = r.win.length; while (k60 > 0 && db(r.win[k60 - 1]) < -60) k60--;
    const t60 = k60 * r.bs / 16, dBeat = (t60 - r.songSec) / r.bs, early = Math.max(...r.win.slice(0, 16));
    res.wav = {sec: +r.sec.toFixed(3), songSec: +r.songSec.toFixed(3), t60: +t60.toFixed(3), dBeat: +dBeat.toFixed(3), firstBeatPeakDb: +db(early).toFixed(1), ok: Math.abs(dBeat) <= 1 && db(early) > -30};
    ok = ok && res.wav.ok;
  }
}
await p.evaluate(() => SYNQUENZER.sx1Fade(0));
res.errors = errs; ok = ok && !errs.length;
console.log(JSON.stringify(res, null, 1)); console.log(ok ? 'OK' : 'FEHLER');
fs.writeFileSync(OUT + '/t1-sx1-render.json', JSON.stringify(res, null, 1));
await b.close(); process.exit(ok ? 0 : 1);
