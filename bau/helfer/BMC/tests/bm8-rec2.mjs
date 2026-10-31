// BM8-01 FANG, Song-Aufnahme (NOTEN → Melodie), [● MEL.], automatische Länge, BM8-11 Größe (16 Takte ständige Bewegung)
import { open, ok, summary } from './lib.mjs';
const {b, p, errs} = await open();
await p.evaluate(() => {
  ensureAudio(); SYNQUENZER.setBpm(240); SYNQUENZER.setRecOptions({length: 'auto', countIn: 0}); SYNQUENZER.bmcFake(0, true); SYNQUENZER.selectTrack(0);
  window.__move = (ks, durS, f) => new Promise(res => { const t0 = performance.now(); for (const k of ks) SYNQUENZER.bmcLive(0, k, null, {touch: true});
    const id = setInterval(() => { const x = (performance.now() - t0) / 1000; if (x > durS) { clearInterval(id); for (const k of ks) SYNQUENZER.bmcLive(0, k, null, {touch: false}); res(); return; }
      for (const k of ks) SYNQUENZER.bmcLive(0, k, f(k, x)); }, 8); });
  window.__f = (k, x) => k === 'bd' ? .7 * Math.sin(2 * Math.PI * .8 * x) : k === 'mw' ? .5 + .4 * Math.sin(2 * Math.PI * .6 * x) : .5 + .4 * Math.sin(2 * Math.PI * 1.1 * x + 2);
});
const dev = `(c, B0, ks) => { const H = BMC.h[0], o = {}; for (const k of ks) { let d = 0; const a = c.cv && c.cv[k]; if (!a) { o[k] = null; continue; }
  const st = BMC.ST / spb(), last = H[k][H[k].length - 1][0]; let wb = null; for (let j = Math.ceil(Math.max(B0, H[k][1][0]) / st); j * st < Math.min(B0 + c.len * 4, last); j++) { const bb = j * st, e = Math.abs(cvAt(a, bb - B0) - bmcVal(H, k, bb)); if (e > d) { d = e; wb = bb; } } o[k] = +d.toFixed(5); if (d > .005) o[k + '@'] = [wb, H[k].slice(0, 3)]; } return o; }`;
// ---------- automatische Länge: ● bis 2 Takte, Notenlos aber mit Kurven ----------
await p.evaluate(() => { const s = S.tracks[0].clips.findIndex(c => !c); window.__s = s; SYNQUENZER.selectSlot(0, s); SYNQUENZER.rec(); });
await p.waitForFunction(() => rec.state === 'recording', null, {timeout: 5000});
await p.evaluate(() => { SYNQUENZER.keyOn(60, .8, 'k1'); });
await p.evaluate(() => window.__move(['bd', 'at'], 1.8, window.__f));
await p.evaluate(() => { SYNQUENZER.keyOff(60, 'k1'); SYNQUENZER.rec(); });
await p.waitForFunction(() => rec.state === 'off' && S.tracks[0].clips[window.__s], null, {timeout: 6000});
await p.waitForFunction(() => S.tracks[0].clips[window.__s].cv, null, {timeout: 3000}).catch(() => {});
const ra = await p.evaluate(`(() => { const c = S.tracks[0].clips[window.__s]; return {len: c.len, keys: Object.keys(c.cv || {}), notes: c.notes.length, dev: (${dev})(c, rec.startBeat, ['bd', 'at']), u: SYNQUENZER.undoInfo().top.label}; })()`);
ok('BM8-01 ● automatische Länge: Kurven + Noten im Clip, ein Undo', ra.keys.join() === 'bd,at' && ra.notes === 1 && ra.u === 'Aufnahme', ra);
ok('BM8-01 ● automatische Länge: Abweichung ≤ 0,005', Object.values(ra.dev).every(x => x != null && x <= .005), ra.dev);
// ---------- FANG: frei spielen + Regler, dann FANG ----------
await p.evaluate(() => { SYNQUENZER.stop(); SYNQUENZER.play(); });
await p.waitForFunction(() => R.playing && t2b(AU.ctx.currentTime - AU.outLat) > 4.05, null, {timeout: 6000});
await p.evaluate(async () => {
  const sleep = ms => new Promise(r => setTimeout(r, ms)); const mv = window.__move(['bd', 'mw', 'at'], 3.6, window.__f);
  for (let j = 0; j < 8; j++) { SYNQUENZER.keyOn(60 + (j % 4) * 2, .8, 'f' + j); await sleep(220); SYNQUENZER.keyOff(60 + (j % 4) * 2, 'f' + j); await sleep(230); }
  await mv;
});
const rf = await p.evaluate(`(() => { const n0 = UNDO.length, fr = S.tracks[0].clips.findIndex(c => !c); window.__sf = fr; SYNQUENZER.selectSlot(0, fr); const okF = capture(); const c = S.tracks[0].clips[fr];
  if (!c) return {okF, none: true}; const B0 = R.pend[0] && R.pend[0].cs != null ? R.pend[0].cs : R.cstart[0];
  return {okF, len: c.len, keys: Object.keys(c.cv || {}), starts: Object.values(c.cv || {}).map(a => a[0][0]), notes: c.notes.length, undo: UNDO.length - n0, label: UNDO[UNDO.length - 1].label}; })()`);
ok('BM8-01 FANG nimmt Bend/Rad/Druck mit (Startpunkt 0, ein Undo)', rf.okF !== false && rf.keys && rf.keys.join() === 'bd,mw,at' && rf.starts.every(x => x === 0) && rf.undo === 1 && rf.label === 'Fang', rf);
await p.evaluate(() => { SYNQUENZER.stop(); SYNQUENZER.setSong({bars: 2, loop: {on: false, a: 0, b: 2}, melodyTrack: 0, lanes: S.tracks.map(() => []), carrier: [], mel: {0: {len: 2, key: {root: 0, scale: 'ionian'}, notes: []}}}); });
// [● MEL.] während ▶ SONG
const rm = await p.evaluate(async () => {
  const A = SYNQUENZER, sleep = ms => new Promise(r => setTimeout(r, ms));
  A.songPlay(0); await sleep(300);
  const st = melRecStart(); A.keyOn(67, .8, 'm1'); await window.__move(['bd'], 1.0, window.__f); A.keyOff(67, 'm1'); melRecEnd();
  const m = S.song.mel[0]; const out = {st, playing: !!R.songPlay, keys: Object.keys(m.cv || {}), n: m.notes.length, label: UNDO[UNDO.length - 1] && UNDO[UNDO.length - 1].label, start: m.cv && m.cv.bd && m.cv.bd[0]};
  A.stop(); return out;
});
ok('[● MEL.]: Bend in die Song-Melodie, ein Undo mit den Noten', rm.keys.join() === 'bd' && rm.n === 1 && /^Melodie/.test(rm.label || ''), rm);
// ---------- Song-Aufnahme NOTEN (Overdub Takte 1–4): Takte 1–2 spielt Spur 0 einen Szenen-Clip → eigener Clip; Takte 3–4 → Song-Melodie ----------
const rsg = await p.evaluate(async () => {
  const A = SYNQUENZER, sleep = ms => new Promise(r => setTimeout(r, ms)); A.stop();
  const s = S.tracks[0].clips.findIndex(c => !c); A.setClip(0, s, {len: 2, key: {root: 0, scale: 'ionian'}, notes: [{t: 0, d: 1, n: 60, v: .8}]});
  A.setSong({bars: 4, loop: {on: false, a: 0, b: 4}, melodyTrack: 1, lanes: S.tracks.map((_, i) => i === 0 ? [{bar: 0, slot: s}, {bar: 2, slot: -1}] : []), carrier: [], mel: {1: {len: 4, key: {root: 0, scale: 'ionian'}, notes: []}}});
  const u0 = UNDO.length;
  const st = A.songRecRange(0, 3, 'overdub', {mel: true, clips: false, chords: false}, {track: 0, preroll: false});
  while (!(R.songPlay && songBeatOf(t2b(AU.ctx.currentTime - AU.outLat)) > .05)) await sleep(5);
  await window.__move(['bd'], 3.85, window.__f);
  while (songBeatOf(t2b(AU.ctx.currentTime - AU.outLat)) < 15.95 && R.songRec) await sleep(5);
  if (R.songRec) A.songRecEnd(); A.stop();
  const own = Object.values(S.song.own || {}), m0 = S.song.mel[0];
  return {st: !!st, nOwn: own.length, ownCv: own.map(c => c.cv && c.cv.bd ? [c.cv.bd.length, c.cv.bd[0][0], c.len] : null), melCv: m0 && m0.cv && m0.cv.bd ? [m0.cv.bd.length, m0.cv.bd.filter(q => q[0] >= 8).length, m0.cv.bd[0]] : null,
    undo: UNDO.length - u0, label: UNDO.length ? UNDO[UNDO.length - 1].label : null, sceneClipCv: !!S.tracks[0].clips[s].cv};
});
ok('Song-Aufnahme NOTEN: Kurven in eigenen Clip (Takte 1–2) und Song-Melodie (Takte 3–4), Szenen-Clip unberührt, ein Undo', rsg.st && rsg.nOwn >= 1 && rsg.ownCv.every(x => x && x[1] === 0) && rsg.melCv && rsg.melCv[1] > 0 && !rsg.sceneClipCv && rsg.undo === 1, rsg);
// ---------- BM8-11 Größe: 16 Takte ständige Bewegung aller drei Regler ----------
await p.evaluate(() => { SYNQUENZER.stop(); SYNQUENZER.setRecOptions({length: 'auto', countIn: 0}); SYNQUENZER.setBpm(240); const s = S.tracks[0].clips.findIndex(c => !c); window.__s16 = s; SYNQUENZER.selectSlot(0, s); SYNQUENZER.rec(); });
await p.waitForFunction(() => rec.state === 'recording', null, {timeout: 5000});
await p.evaluate(() => window.__move(['bd', 'mw', 'at'], 15.85, (k, x) => k === 'bd' ? .9 * Math.sin(2 * Math.PI * 1.5 * x) : k === 'mw' ? .5 + .45 * Math.sin(2 * Math.PI * 1.1 * x) : .5 + .45 * Math.sin(2 * Math.PI * 2 * x + 1)));
await p.evaluate(() => SYNQUENZER.rec());
await p.waitForFunction(() => rec.state === 'off' && S.tracks[0].clips[window.__s16], null, {timeout: 8000});
await p.waitForFunction(() => S.tracks[0].clips[window.__s16].cv, null, {timeout: 3000}).catch(() => {});
const rz = await p.evaluate(() => { const s = window.__s16, c = S.tracks[0].clips[s], f = SQStore.buildProjectFile(S, null, VERSION).project.tracks[0].clips[s];
  return {len: c.len, pts: Object.fromEntries(Object.entries(c.cv).map(([k, a]) => [k, a.length])), bytes: new TextEncoder().encode(JSON.stringify(f)).length, cvBytes: new TextEncoder().encode(JSON.stringify(c.cv)).length}; });
ok('BM8-11 16 Takte ständige Bewegung ≤ 20 KB je Clip', rz.len === 16 && rz.bytes <= 20480, rz);
ok('Konsole ohne Fehler, kein Supabase-Aufruf', !errs.length, errs);
await b.close(); process.exit(summary());
