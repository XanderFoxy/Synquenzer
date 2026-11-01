// QA musiker (Xander-Weg, iPhone-Format 390×844, Touch): Demo laden → ● REC mit 🎤 (Szene 1) → Stimme-FANG (Szene 2) → Song aus beiden Szenen
// → ● SONG mit 🎤 (Punch Takt 3–6, leise gesungen) → Song hören (Pegel je Abschnitt) → Undo/Redo → Speichern/Neu laden → sofort ▶ → 3 min Szenenwechsel
// node n4-vs-p-qam-flow.mjs <app> [sec3min]
import {open, micOn, sleep, waitBeat, idle, b64, APP, BASE, mysing} from './n4-vs-p-qa-h.mjs';
const FILE = process.argv[2] || APP, LONG = +(process.argv[3] || 180);
const H = await open({file: FILE, viewport: {width: 390, height: 844}, touch: true, mobile: true}), p = H.p;
const beat = () => p.evaluate(() => { const c = SYNQUENZER.vsClock(); return (c.now - c.outLat - c.start) / c.spb; });
const vpw = () => p.evaluate(() => { if (SYNQUENZER.vpInfo) { SYNQUENZER.vpInfo(); return SYNQUENZER.vpWait(); } });
await p.evaluate(() => { SYNQUENZER.loadDemo(); SYNQUENZER.setMetronome(false); });
const sr = await micOn(p, 'wired'), bpm = await p.evaluate(() => S.bpm), spb = 60 / bpm;
console.log(FILE.split('/').slice(-2).join('/'), await p.evaluate(() => SYNQUENZER.version), 'BPM', bpm);
// 1) ● REC mit 🎤 auf MELODIE, Szene 1
await p.evaluate(() => { SYNQUENZER.setRecOptions({countIn: 0, length: 4}); SYNQUENZER.selectSlot(5, 0); SYNQUENZER.launchScene(0); });
await p.waitForFunction(() => SYNQUENZER.vsClock().playing);
await waitBeat(p, 1); await p.evaluate(() => SYNQUENZER.rec());
const rs = await p.evaluate(() => SYNQUENZER.runtime().rec.startBeat);
await p.evaluate(([b, at]) => { const c = SYNQUENZER.vsClock(); window.__fake.play(b, c.start + at * c.spb - 0.04); }, [b64(mysing(16 * spb + .5, sr, -30, 3).y), rs]);
await waitBeat(p, rs + 17);
await p.waitForFunction(() => { const st = SYNQUENZER.tkInfo().stimme; const c = st >= 0 && SYNQUENZER.getClip(st, 0); return !!(c && c.audio) && !SYNQUENZER.vsInfo().busy; }, null, {timeout: 60000});
await p.evaluate(() => SYNQUENZER.vsResultOk && SYNQUENZER.vsResultOk());
// 2) Stimme-FANG in Szene 2
await p.evaluate(() => SYNQUENZER.launchScene(1));
const b0 = Math.ceil((await beat()) / 4) * 4 + 4;
await p.evaluate(([b, at]) => { const c = SYNQUENZER.vsClock(); window.__fake.play(b, c.start + at * c.spb - 0.04); }, [b64(mysing(16 * spb, sr, -24, 5, {oct: -1}).y), b0]);
await waitBeat(p, b0 + 16 + 0.3);
const fok = await p.evaluate(() => SYNQUENZER.vsFang({}));
await p.waitForFunction(() => !SYNQUENZER.vsInfo().busy && !SYNQUENZER.tkInfo().pend.length && SYNQUENZER.tkInfo().writes === 0, null, {timeout: 60000});
const fres = await p.evaluate(() => { const r = SYNQUENZER.vsResult(); SYNQUENZER.vsResultOk(); return r && {len: r.len, scene: r.scene, n: r.notes.length}; });
await p.evaluate(() => SYNQUENZER.stop()); await sleep(500);
const st = await p.evaluate(() => SYNQUENZER.tkInfo().stimme);
const clips = await p.evaluate(st => S.tracks[st].clips.map((c, i) => c && c.audio ? i + ':' + c.len + ':' + c.audio.take : null).filter(Boolean), st);
console.log('  REC + FANG:', JSON.stringify({fang: fok, fres, stimmeClips: clips}));
// 3) Song: Takt 1–4 Szene 1, Takt 5–8 Szene 2 (alle Spuren)
await p.evaluate(() => { const lanes = []; for (let i = 0; i < NT(); i++) lanes.push([{bar: 0, slot: 0}, {bar: 4, slot: 1}]); SYNQUENZER.setSong({bars: 8, lanes, carrier: [], mel: {}}); });
// 4) ● SONG mit 🎤: Punch ab Takt 3, leise gesungen (weiter weg vom Mikro, −38 dBFS RMS), Ende Takt 7
await p.evaluate(() => SYNQUENZER.songRecFrom({from: 2, mode: 'over', targets: {clips: false, chords: false, mel: true}, preroll: false}));
await p.waitForFunction(() => SYNQUENZER.runtime().song.play && SYNQUENZER.vsClock().playing, null, {timeout: 5000});
const so = await p.evaluate(() => SYNQUENZER.runtime().song.off || 0);
await p.evaluate(([b, so]) => { const c = SYNQUENZER.vsClock(); window.__fake.play(b, c.start + (so + 8) * c.spb); }, [b64(mysing(16 * spb, sr, -38, 9).y), so]);
await waitBeat(p, so + 24.2); await p.evaluate(so => SYNQUENZER.songRecEnd({beat: so + 24}), so);
await idle(p); await p.evaluate(() => SYNQUENZER.stop()); await sleep(500); await vpw();
const vox = await p.evaluate(() => SYNQUENZER.tkInfo().vox);
console.log('  song.vox:', JSON.stringify(vox && vox.map(v => [v.bar, v.len, v.take])));
// Song hören: STIMME-Ausgang je Abschnitt + Master
async function hear(tag) {
  await p.evaluate(st => { window.__cap('v', AU.tracks[st].cut); window.__cap('M', AU.M.ceil); SYNQUENZER.songPlay(0); }, st);
  await p.waitForFunction(() => SYNQUENZER.runtime().song.play && SYNQUENZER.vsClock().playing, null, {timeout: 5000});
  const t0 = await p.evaluate(() => { const c = SYNQUENZER.vsClock(); return c.start + c.outLat + (SYNQUENZER.runtime().song.off || 0) * c.spb; });
  await sleep(32 * spb * 1000 + 800);
  const o = await p.evaluate(([t0, spb]) => { const C = window.__capGet('v'), M = window.__capGet('M'), sr = window.__ctx.sampleRate, seg = (a, b, X) => { const i = Math.round((t0 + a * 4 * spb - X.t0) * sr), j = Math.round((t0 + b * 4 * spb - X.t0) * sr); return window.__L.lufs([X.L.subarray(i, j), X.R.subarray(i, j)], sr).lufs; };
    return {stimme: {'T1-2 Szene1': seg(0, 2, C), 'T3-6 song.vox': seg(2, 6, C), 'T7-8 Szene2': seg(6, 8, C)}, master: seg(0, 8, M), mtp: window.__L.truePeakDb([M.L, M.R])}; }, [t0, spb]);
  await p.evaluate(() => SYNQUENZER.stop()); await sleep(500);
  console.log(`  ${tag}:`, JSON.stringify(o));
  return o;
}
await hear('Song (STIMME LUFS je Abschnitt)');
// 5) Undo / Redo des Punch
const u = await p.evaluate(() => { SYNQUENZER.undo(); return SYNQUENZER.tkInfo().vox; });
await hear('nach Undo (ohne song.vox)');
const rd = await p.evaluate(() => { SYNQUENZER.redo(); return SYNQUENZER.tkInfo().vox; });
console.log('  Undo/Redo song.vox:', JSON.stringify([u && u.length, rd && rd.length]));
// 6) Speichern → neu laden → sofort ▶ (wie am iPhone nach dem Öffnen)
const pj0 = await p.evaluate(() => SYNQUENZER.serialize());
await p.evaluate(() => SYNQUENZER.saveNow ? SYNQUENZER.saveNow() : SYNQUENZER.save()); await sleep(1500);
await p.reload(); await p.waitForFunction(() => window.SYNQUENZER && window.SYNQUENZER.version); await sleep(300);
const pj1 = await p.evaluate(() => SYNQUENZER.serialize());
const strip = s => { const o = JSON.parse(s); for (const k of ['savedAt', 'updatedAt', 'appVersion', 'id', 'sum', 'checksum']) delete o[k]; return JSON.stringify(o); };
console.log('  Speichern/Laden deep-equal:', strip(pj0) === strip(pj1), pj0.length, pj1.length);
await p.evaluate(() => { SYNQUENZER.play(); SYNQUENZER.stop(); SYNQUENZER.setMetronome(false); });
const st2 = await p.evaluate(() => SYNQUENZER.tkInfo().stimme);
await p.evaluate(st => { window.__cap('v', AU.tracks[st].cut); SYNQUENZER.songPlay(0); }, st2);
const t0b = await p.evaluate(() => { const c = SYNQUENZER.vsClock(); return c.start + c.outLat; });
await sleep(32 * spb * 1000 + 800);
const after = await p.evaluate(([t0, spb]) => { const C = window.__capGet('v'), sr = window.__ctx.sampleRate, seg = (a, b) => { const i = Math.max(0, Math.round((t0 + a * 4 * spb - C.t0) * sr)), j = Math.round((t0 + b * 4 * spb - C.t0) * sr); return window.__L.lufs([C.L.subarray(i, j), C.R.subarray(i, j)], sr).lufs; };
  // erstes hörbares Sample der STIMME
  let first = -1; for (let i = 0; i < C.L.length; i++) if (Math.abs(C.L[i]) > 0.003) { first = i; break; }
  return {'T1-2': seg(0, 2), 'T3-6': seg(2, 6), 'T7-8': seg(6, 8), firstVoxSec: first < 0 ? null : +((C.t0 + first / sr) - t0).toFixed(3), vp: SYNQUENZER.vpInfo ? (({runs, sync, gated, deferred, err}) => ({runs, sync, gated, deferred, err}))(SYNQUENZER.vpInfo()) : null}; }, [t0b, spb]);
await p.evaluate(() => SYNQUENZER.stop()); await sleep(400);
console.log('  nach Neuladen sofort ▶:', JSON.stringify(after));
// 7) 3 min Wiedergabe mit Szenenwechseln (alle 2 Takte), Master + STIMME, lange Tasks
await p.evaluate(st => { window.__lt = []; try { new PerformanceObserver(l => { for (const e of l.getEntries()) window.__lt.push(+e.duration.toFixed(0)); }).observe({type: 'longtask'}); } catch (e) {} window.__cap('v', AU.tracks[st].cut); window.__cap('M', AU.M.ceil); SYNQUENZER.launchScene(0); }, st2);
const T0 = Date.now(); let k = 0;
while (Date.now() - T0 < LONG * 1000) { await sleep(8 * spb * 1000); k++; await p.evaluate(s => SYNQUENZER.launchScene(s), k % 2); }
const L3 = await p.evaluate(() => { const C = window.__capGet('v'), M = window.__capGet('M'), sr = window.__ctx.sampleRate, W = sr * 4, per = [];
  for (let i = sr * 2; i + W <= C.L.length; i += W) per.push(window.__L.lufs([C.L.subarray(i, i + W), C.R.subarray(i, i + W)], sr).lufs);
  let d2 = 0; for (let i = 2; i < M.L.length; i++) d2 = Math.max(d2, Math.abs(M.L[i] - 2 * M.L[i - 1] + M.L[i - 2]));
  return {stimme4s: per.map(v => v == null || !isFinite(v) ? null : Math.round(v)), master: window.__L.lufs([M.L, M.R], sr).lufs, mtp: window.__L.truePeakDb([M.L, M.R]), longtasks: window.__lt, vp: SYNQUENZER.vpInfo ? (({runs, sync, gated, deferred, err, maxMs}) => ({runs, sync, gated, deferred, err, maxMs}))(SYNQUENZER.vpInfo()) : null}; });
await p.evaluate(() => SYNQUENZER.stop());
console.log(`  ${LONG} s Szenenwechsel (${k} Wechsel):`, JSON.stringify(L3));
console.log('  Konsole:', JSON.stringify(H.errs.slice(0, 4)));
await H.br.close();
