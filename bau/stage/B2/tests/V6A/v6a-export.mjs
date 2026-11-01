// V6A in Video und GarageBand-Instrumental: beide rechnen über vvRenderAudio (Video: vvMake → vvRenderAudio; GarageBand: ggbRender →
// vvRenderAudio mit GGB.dry). Geprüft: im GarageBand-Render fährt der Cutoff (Probe), die WAV unterscheidet sich im Fahrt-Bereich von
// derselben Aufnahme ohne Zustand und gleicht ihr davor (ein Takt ohne Zustand); der Video-Ton (vvRender) fährt genauso.
import { open, setup, ok, done } from './v6a-lib.mjs';
const { b, p, errs } = await open();
const t = await setup(p, { scenes: 2, len: 2 });
const r = await p.evaluate(async (t) => {
  const Q = window.SYNQUENZER, out = {};
  setP(t, 'cutoff', 2400);
  Q.songFromChain([0, 1, 0, 1].map(s => ({scene: s, bars: 2})));
  const wav = () => { const u = GGB.res.bytes, dv = new DataView(u.buffer, u.byteOffset, u.byteLength); let o = 12; while (o < u.length - 8) { const id = String.fromCharCode(u[o], u[o + 1], u[o + 2], u[o + 3]), n = dv.getUint32(o + 4, true); if (id === 'data') return new Int16Array(u.buffer.slice(u.byteOffset + o + 8, u.byteOffset + o + 8 + n)); o += 8 + n; } return null; };
  const rms = (x, b0, b1, sr) => { const a = Math.round(b0 * spb() * sr) * 2, e = Math.round(b1 * spb() * sr) * 2; let s = 0; for (let k = a; k < e; k++) s += x[k] * x[k]; return Math.sqrt(s / Math.max(1, e - a)) / 32768; };
  // without a state
  await Q.ggbExport({range: {a: 0, b: 4}, pre: 0, remember: false}); const w0 = wav(), sr = 48000;
  // with a state: Szene 2 dark
  Q.v6aSetState(t, 1, {p: {cutoff: 300, res: .2}});
  Q.v6aProbeAll(t, ['cutoff']);
  await Q.ggbExport({range: {a: 0, b: 4}, pre: 0, remember: false}); const w1 = wav();
  const lg = Q.v6aProbeLog(t), st = Q.v6aStart();
  out.ggbMoves = lg.filter(x => x.v[0] < 2399 && x.v[0] > 301).length; out.ggbEnd = lg.some(x => x.v[0] === 300);
  out.before = [rms(w0, .5, 6.5, sr), rms(w1, .5, 6.5, sr)]; out.after = [rms(w0, 8.5, 15, sr), rms(w1, 8.5, 15, sr)]; out.len = [w0.length, w1.length];
  // the video's sound
  Q.v6aProbeAll(t, ['cutoff']); await Q.vvRender({range: {a: 0, b: 4}}); const lv = Q.v6aProbeLog(t);
  out.vidMoves = lv.filter(x => x.v[0] < 2399 && x.v[0] > 301).length; out.vidEnd = lv.some(x => x.v[0] === 300);
  return out;
}, t);
console.log(JSON.stringify(r));
ok('EXP-1 GarageBand-Instrumental: der Cutoff fährt (≥ 100 Zwischenwerte) und erreicht 300 Hz', r.ggbMoves >= 100 && r.ggbEnd, r.ggbMoves + ' Blöcke');
ok('EXP-2 GarageBand-WAV vor der Kante gleich (Szene 1 ohne Zustand)', Math.abs(r.before[0] / r.before[1] - 1) < .02, r.before.map(x => x.toFixed(4)).join(' / '));
ok('EXP-3 GarageBand-WAV nach der Kante dunkler (Zustand gilt)', r.after[1] < r.after[0] * .8, r.after.map(x => x.toFixed(4)).join(' / '));
ok('EXP-4 Video-Ton (vvRender): der Cutoff fährt genauso', r.vidMoves === r.ggbMoves && r.vidEnd, r.vidMoves + ' / ' + r.ggbMoves);
ok('EXP-E keine Fehler', !errs.length, errs.join(' | ').slice(0, 300));
await b.close(); process.exit(done() ? 1 : 0);
