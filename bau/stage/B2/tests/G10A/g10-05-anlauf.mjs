// B2: Prüfzeit wird vor songPlay() gelesen; die Audio-Uhr springt in 128-Sample-Blöcken → Toleranz 2 Blöcke (vorher 1e-6, streute auch in G10A allein)
// G10-05: Song mit Anlauf vor Takt 1 → ▶ SONG: der Anlauf klingt (RMS im Vorlauf > Rauschboden + 20 dB), Takt 1 liegt genau auf dem Raster.
// Ohne Anlauf startet es wie 4.30.0 (Basis). Offline-Render (Video/WAV) beginnt ebenso mit dem Vorlauf.
import {launch, open, sleep, idle, report, voice, BASE} from './lib.mjs';
const R = report('G10-05');
const sr = 48000, PRE = 1.0, bar = 2.0;                               // 120 BPM
// Take: 1 s Anlauf (330 Hz) vor dem Clip-Anfang, dann 2 Takte Gesang (247 Hz)
const pcm = []; { const a = voice(330, PRE, sr, .35, t => Math.min(1, t / .01)), b = voice(247, 2 * bar, sr, .35, t => Math.min(1, (2 * bar - t) / .02)); for (const v of a) pcm.push(Math.round(v * 32767)); for (const v of b) pcm.push(Math.round(v * 32767)); for (let k = 0; k < sr; k++) pcm.push(0); }
async function setup(p, withPre) {
  await p.evaluate(async () => { SYNQUENZER.newProject({init: true}); await new Promise(r => setTimeout(r, 400)); });
  const inj = await p.evaluate(o => SYNQUENZER.tkInject(o), {pcm, sr, scene: 0, len: 2});
  if (withPre) await p.evaluate(o => SYNQUENZER.g10aTestSeg(o), {track: inj.track, scene: 0, in: PRE, out: PRE + 2 * bar, at: 0, pre: {in: PRE, sec: .95}});   // wie nach G3 (g3TakePre)
  await p.evaluate(([t]) => { const lanes = Array.from({length: 8}, () => []); lanes[t] = [{bar: 0, slot: 0}]; return SYNQUENZER.setSong({bars: 2, lanes}); }, [inj.track]);
  await idle(p);
  return inj;
}
async function playSong(p) {
  await p.evaluate(() => { SYNQUENZER.play(); SYNQUENZER.stop(); window.__recOut(); });
  await sleep(300);
  const st = await p.evaluate(() => { const t = window.__ctx.currentTime; SYNQUENZER.songPlay(0); const c = SYNQUENZER.vsClock(); return {t, start: c.start, spb: c.spb, info: SYNQUENZER.g10aInfo ? SYNQUENZER.g10aInfo() : null, off: SYNQUENZER.song() && null}; });
  await sleep(4500);
  await p.evaluate(() => SYNQUENZER.stop()); await sleep(300);
  const rec = await p.evaluate(() => window.__rec.map(b => ({t: b.t, d: b.d})));
  const at = (t0, t1) => { let s = 0, n = 0; for (const b of rec) for (let k = 0; k < b.d.length; k++) { const t = b.t + k / 48000; if (t >= t0 && t < t1) { s += b.d[k] ** 2; n++; } } return n ? 10 * Math.log10(s / n + 1e-20) : null; };
  return {st, at};
}
const br = await launch();
// ---- mit Anlauf (G10a) ----
{
  const ctx = await br.newContext(); const {p, errs} = await open(br, {ctx}); 
  await setup(p, true);
  R.check('Vorlauf berechnet: ceil(0,95 s / 0,5 s) = 2 Schläge', await p.evaluate(() => SYNQUENZER.g10aInfo().leadNext) === 2);
  const {st, at} = await playSong(p);
  const lead = st.start - st.t, gl = await p.evaluate(() => SYNQUENZER.vsClock().outLat);
  R.check('Takt 1 genau auf dem Raster: Start = jetzt + 0,06 s + 2 Schläge', (lead - (.06 + 2 * st.spb)) > -1e-6 && (lead - (.06 + 2 * st.spb)) < 2 * 128 / 44100 + 1e-6 && st.info.lead === 2, {lead: +lead.toFixed(6), lb: st.info.lead});
  const floor = at(st.t - .25, st.t + .02), inLead = at(st.start - .9, st.start - .05);
  R.check('Anlauf klingt im Vorlauf (> Rauschboden + 20 dB)', inLead != null && inLead > Math.max(floor == null ? -120 : floor, -120) + 20, {floor: floor && +floor.toFixed(1), inLead: inLead && +inLead.toFixed(1)});
  // Vergleich mit der App ohne Vorlauf: der Anlauf fehlt dort (Befund 3b)
  const rr = await p.evaluate(() => SYNQUENZER.vvRender({}));
  const L = rr.dur - rr.songSec - rr.tail;
  R.check('Offline-Render: Vorlauf 1,0 s vor Takt 1', Math.abs(L - 1.0) < 1e-6, {dur: rr.dur, songSec: rr.songSec, tail: rr.tail});
  const pc = await p.evaluate(() => SYNQUENZER.vvPcm(0, 2.0));
  const buf = Buffer.from(pc.b64, 'base64'), X = new Int16Array(buf.buffer, buf.byteOffset, buf.length / 2).filter((_, i) => i % 2 === 0);
  const rs = pc.sr, win = (a, b) => { let s = 0; const i0 = Math.round(a * rs), i1 = Math.round(b * rs); for (let k = i0; k < i1; k++) s += (X[k] / 32768) ** 2; return 10 * Math.log10(s / (i1 - i0) + 1e-20); };
  const pitch = (a, b) => { const i0 = Math.round(a * rs), n = Math.round((b - a) * rs); let best = 0, bl = 0; for (let l = 90; l < 400; l++) { let x = 0; for (let k = 0; k < n - l; k += 2) x += X[i0 + k] * X[i0 + k + l]; if (x > best) { best = x; bl = l; } } return rs / bl; };
  const r0 = win(0, .04), rA = win(.2, .9), fA = pitch(.3, .85), fB = pitch(1.1, 1.6);
  R.check('Render: Anlauf hörbar (330 Hz) im Vorlauf, ab Takt 1 der Clip (247 Hz)', rA > -40 && Math.abs(fA - 330) < 6 && Math.abs(fB - 247) < 6, {rA: +rA.toFixed(1), fA: +fA.toFixed(1), fB: +fB.toFixed(1), r0: +r0.toFixed(1)});
  // Übergang Anlauf → Takt 1 genau bei 1,0 s (Tonhöhenwechsel ±10 ms)
  let sw = null; for (let t = .9; t < 1.1; t += .005) { if (Math.abs(pitch(t, t + .03) - 247) < 8) { sw = t; break; } }
  R.check('Render: Takt 1 genau bei Video-Zeit 1,0 s (±15 ms)', sw != null && Math.abs(sw - 1.0) < .015, sw && +sw.toFixed(3));
  const vs = await p.evaluate(() => [0, .5, .99, 1.0, 1.5].map(t => SYNQUENZER.vvStateAt(t).sb));
  R.check('Video-Bild: bis Takt 1 der Anfang, dann läuft es', vs[0] === 0 && vs[1] === 0 && vs[2] === 0 && Math.abs(vs[4] - 1) < 1e-9, vs);
  R.check('keine Seitenfehler', errs.length === 0, errs.slice(0, 3));
  await ctx.close();
}
// ---- ohne Anlauf: wie die Basis 4.30.0 ----
const cmp = {};
for (const [name, app] of [['neu', null], ['basis', BASE]]) {
  const ctx = await br.newContext(); const {p} = await open(br, {ctx, app: app || undefined});
  await setup(p, false);
  const {st} = await playSong(p);
  const rr = await p.evaluate(() => SYNQUENZER.vvRender({}));
  cmp[name] = {lead: +(st.start - st.t).toFixed(6), dur: rr.dur, rms: rr.rms, peak: rr.peak};
  await ctx.close();
}
R.check('ohne Anlauf: Start und Render wie 4.30.0', cmp.neu.lead === cmp.basis.lead && cmp.neu.dur === cmp.basis.dur && Math.abs(cmp.neu.rms - cmp.basis.rms) < 1e-9, cmp);
await br.close(); R.done();
