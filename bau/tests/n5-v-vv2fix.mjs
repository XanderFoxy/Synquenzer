// VV2-fix: (1) 9:16 [Kamera] Spur-Bild: Laufstrich always inside the picture (1-bar clips, 112/140 BPM), camera motion ≤ 5 %
// (2) Auto: a visible cut at every part start where the 2-bar rule allows it (random songs) (3) Auf alle übertragen / Ersetzen durch:
// Regie stays, undo/redo deep-equal
import { open, buildSong } from './n5-v-qm-lib.mjs';
import fs from 'fs';
const OUT = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/dirigent-test/n5-v-out/';
const BPM = +(process.argv[2] || 112);
const {b, p, errs} = await open({touch: true});
const res = {BPM};
await buildSong(p);
await p.evaluate(bpm => SYNQUENZER.setBpm(bpm), BPM);
res.set = await p.evaluate(() => { const Q = SYNQUENZER, m = S.song.marks.find(x => x.name === 'Refrain');
  Q.vvDirSet(m.a, m.a + m.len, 'matrix'); Q.vvDirSet(2, 6, 'spur', 3); Q.vvDirSet(6, 7, 'spur', stimmeT()); return Q.vvDirGet(); });
await p.evaluate(() => { SYNQUENZER.vvTest({opus: true}); SYNQUENZER.vvPrefs({fmt: '9:16', view: 'auto', cam: 'kamera'}); });
res.make = await p.evaluate(() => SYNQUENZER.vvMake({}).then(m => ({dur: m.dur, cuts: m.cuts})));
res.spur = await p.evaluate(() => {
  const r = VV.last, rt = VV.lastRt, L = rt.log, out = {};
  for (const sh of rt.shots) {
    const k = rt.shots.indexOf(sh), fr = L.filter(e => e.k === k); if (sh.v !== 'spur' || !fr.length) continue;
    let inside = 0, n = 0, fit = 0, moved = 0;
    for (const e of fr) {
      if (e.fit) fit++;
      const Ly = vvSpurLayout(e.ww, 360), st = vvStateAt(r, e.ts), s = st.slots[sh.t], c = s != null && s >= 0 ? vvClip(sh.t, s, st.own[sh.t]) : null, ph = vvPhase(st, sh.t, c); if (ph == null) continue;
      const x = Ly.x + 8 + ph * (Ly.w - 16); n++; if (x >= 0 && x <= e.ww) inside++;
    }
    for (let i = 1; i < fr.length; i++) if (fr[i].cx !== fr[i - 1].cx || fr[i].z !== fr[i - 1].z) moved++;
    out[(sh.a + 1) + '–' + sh.b + ' spur:' + S.tracks[sh.t].name] = {frames: fr.length, fit, laufstrichImBild: +(inside / Math.max(1, n) * 100).toFixed(1) + ' %', kameraBewegt: moved, fensterBreite: +fr[0].ww.toFixed(1)};
  }
  // camera motion over all non-cut frame pairs (window corners, % of picture width)
  let worst = 0, over = 0;
  for (let i = 1; i < L.length; i++) { const A = L[i - 1], B = L[i]; if (A.k !== B.k) continue; const d = vvCamDisp(A, B, 9 / 16); if (d > worst) worst = d; if (d > .05) over++; }
  out.kamera = {worstPct: +(worst * 100).toFixed(2), over5: over, frames: L.length};
  return out;
});
// a frame in the middle of the SYN 4 spur shot (bars 3–6) and the STIMME shot (bar 7)
for (const [nm, t] of [['syn4', 2.5], ['stimme', 6.5]]) {
  const png = await p.evaluate(([t, bpm]) => SYNQUENZER.vvShot(t * 4 * 60 / bpm + .3, 'auto', '9:16'), [t, BPM]);
  if (png) fs.writeFileSync(OUT + `vv2fix-spur-${nm}-${BPM}.png`, Buffer.from(png, 'base64'));
}
// (2) part starts → visible cuts (random songs, no entries)
res.teil = await p.evaluate(() => {
  const clips = S.tracks.map(t => t.clips.map((c, s) => (c ? s : -1)).filter(s => s >= 0));
  let seed = 5; const rnd = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };
  let starts = 0, cut = 0, blocked = 0, missed = [];
  for (let k = 0; k < 300; k++) {
    const bars = 4 + Math.floor(rnd() * 40), marks = []; let a = 0, id = 1;
    while (a < bars) { const len = Math.min(bars - a, 1 + Math.floor(rnd() * 18)); if (rnd() < .85) marks.push({id: 'm' + id++, a, len, name: 'T' + id}); a += len; }
    const lanes = clips.map(cs => { const l = []; if (!cs.length) return l; let x = 0; while (x < bars) { if (rnd() < .5) l.push({bar: x, slot: rnd() < .25 ? -1 : cs[Math.floor(rnd() * cs.length)]}); x += 1 + Math.floor(rnd() * 6); } return l; });
    SYNQUENZER.setSong({bars, lanes: lanes.slice(0, 6), carrier: [], mel: {}, marks});
    const sh = SYNQUENZER.vvCuts({range: {a: 0, b: bars}}).shots;
    for (const m of S.song.marks) { if (m.a === 0) continue; starts++;
      if (sh.some(s => s.a === m.a)) { cut++; continue; }
      const s = sh.find(q => q.a < m.a && q.b > m.a);
      if (m.a - s.a < 2 || s.b - m.a < 2 || bars - m.a < 2) { blocked++; continue; }
      missed.push({bars, at: m.a, shot: [s.a, s.b, s.v]}); }
  }
  return {starts, cut, blocked2Takt: blocked, missed: missed.length, ex: missed.slice(0, 3)};
});
// (3) Auf alle übertragen / Ersetzen durch keep the Regie; undo / redo
await buildSong(p);
res.ersetzen = await p.evaluate(() => {
  const Q = SYNQUENZER, out = {};
  const ms = S.song.marks.filter(m => m.name === 'Refrain');
  if (ms.length < 2) Q.markAction(ms[0].id, 'rep', 2);
  const R = S.song.marks.filter(m => m.name === 'Refrain').sort((x, y) => x.a - y.a);
  Q.vvDirSet(R[0].a, R[0].a + R[0].len, 'matrix'); Q.vvDirSet(R[1].a, R[1].a + 2, 'spur', 1);
  const v0 = JSON.stringify(S.song.video), s0 = songSnapshot();
  Q.markAction(R[1].id, 'applyAll'); const s1 = songSnapshot(); out.applyAll = {before: v0, after: JSON.stringify(S.song.video), same: JSON.stringify(S.song.video) === v0};
  undo(); out.applyAll.undoEq = songSnapshot() === s0; redo(); out.applyAll.redoEq = songSnapshot() === s1; undo();
  const strophe = S.song.marks.find(m => m.name === 'Strophe');
  Q.markAction(R[1].id, 'replaceBy', 'Strophe'); const s2 = songSnapshot();
  out.replaceBy = {after: JSON.stringify(S.song.video), sameLen: strophe.len === R[1].len};
  undo(); out.replaceBy.undoEq = songSnapshot() === s0; redo(); out.replaceBy.redoEq = songSnapshot() === s2;
  return out;
});
res.errs = errs;
console.log(JSON.stringify(res, null, 1));
await b.close();
