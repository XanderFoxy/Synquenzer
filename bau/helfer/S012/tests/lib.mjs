// shared setup for S012 tests
import {sleep} from './h.mjs';
// parts: Strophe = scene 1, Refrain = scene 2; song: Strophe T1–2, Refrain T3–4, Strophe T5–6 (bpm 240: 1 bar = 1 s)
export async function songABA(p, o = {}) {
  return p.evaluate(o => {
    const D = SYNQUENZER, nt = D.NT();
    D.setBpm(o.bpm || 240); D.setMetronome && D.setMetronome(false);
    D.setPart(0, {name: 'Strophe', slots: Array.from({length: nt}, (_, t) => D.getClip(t, 0) ? {s: 0} : -1)});
    D.setPart(1, {name: 'Refrain', slots: Array.from({length: nt}, (_, t) => D.getClip(t, 1) ? {s: 1} : -1)});
    if (o.two) D.setPart(2, {name: 'Strophe 2', slots: Array.from({length: nt}, (_, t) => D.getClip(t, 0) ? {s: 0} : -1)});
    D.setSong(null); D.placePart('P1', 0, 'insert'); D.placePart('P2', 99, 'insert'); D.placePart(o.two ? 'P3' : 'P1', 99, 'insert');
    return D.songMarks();
  }, o);
}
// tap a mark in the song view (real touch on the canvas)
export async function tapMark(p, id) {
  const L = await p.evaluate(() => SYNQUENZER.svLayoutInfo());
  const m = L.marks.find(x => x.id === id); if (!m) throw new Error('mark not visible ' + id);
  await p.touchscreen.tap(L.canvas.x + (m.x0 + m.x1) / 2, L.canvas.y + L.rulerH / 2); await sleep(250);
}
// notes per song bar from the note log: the whole song loops, the 2nd pass is counted (the first bars after ▶ are warm-up)
export async function songNotesPerBar(p, bars) {
  await p.evaluate(() => { SYNQUENZER.stop(); SYNQUENZER.songLoop(true); });
  await sleep(200);
  await p.evaluate(() => SYNQUENZER.songPlay());
  await p.waitForFunction(() => R.songPlay && R.playing, null, {timeout: 5000});
  const t0 = await p.evaluate(() => b2t(R.songPlay.off)), spBar = await p.evaluate(() => 4 * spb());
  await p.waitForFunction(([t0, e]) => window.__ctx.currentTime > t0 + e, [t0, (bars - 1.5) * spBar], {timeout: 60000, polling: 50});
  await p.evaluate(() => SYNQUENZER.clearLog());
  await p.waitForFunction(([t0, e]) => window.__ctx.currentTime > t0 + e, [t0, 2 * bars * spBar + 0.3], {timeout: 60000, polling: 50});
  const log = await p.evaluate(() => SYNQUENZER.noteLog());
  await p.evaluate(() => { SYNQUENZER.stop(); SYNQUENZER.songLoop(false); });
  const out = {};
  for (const e of log) { const b = Math.floor((e.time - t0) / spBar + 1e-6) - bars; if (b < 0 || b >= bars) continue; const k = out[b] || (out[b] = {}); k[e.track] = (k[e.track] | 0) + 1; }
  return out;
}
export const roundTrip = p => p.evaluate(() => { const a = SYNQUENZER.project(); importProject(JSON.parse(serializeProject()), []); const b = SYNQUENZER.project(); return {a: a.song, b: b.song, pa: a.parts, pb: b.parts}; });
import {recStart, recStop} from './h.mjs';
// real audio: the song from bar 0 (or `from`), output recorded; dB per bar (and the raw samples per bar for a bit compare)
export async function songBarsDb(p, bars, o = {}) {
  await p.evaluate(() => SYNQUENZER.stop()); await sleep(400);
  await recStart(p);
  await p.evaluate(f => SYNQUENZER.songPlay(f || 0), o.from || 0);
  await p.waitForFunction(() => R.songPlay && R.playing);
  const st = await p.evaluate(() => ({t0: b2t(R.songPlay.off + (R.songPlay.from || 0) * 0), spBar: 4 * spb()}));
  await p.waitForFunction(([t0, e]) => window.__ctx.currentTime > t0 + e, [st.t0, bars * st.spBar + 0.25], {timeout: 90000, polling: 50});
  const c = await recStop(p); await p.evaluate(() => SYNQUENZER.stop());
  const db = [], raw = [];
  for (let k = 0; k < bars; k++) {
    const a = Math.round((st.t0 + k * st.spBar) * c.sr) - c.f0, n = Math.round(st.spBar * c.sr); let s = 0;
    const seg = c.y.slice(Math.max(0, a), a + n); for (const v of seg) s += v * v;
    db.push(+(10 * Math.log10(s / n + 1e-14)).toFixed(2)); if (o.raw) raw.push(seg);
  }
  return o.raw ? {db, raw, sr: c.sr} : db;
}
export const soloT = (p, t) => p.evaluate(t => { S.tracks.forEach((x, i) => { x.mute = t != null && i !== t; }); }, t);
