// QA musiker VV2-04: 9:16 [Kamera] in Spur pictures — is the Laufstrich (what is playing now) inside the 9:16 window?
// per spur shot: share of frames with the Laufstrich inside, the largest distance outside; also the song picture's label column
// argv: BPM (default 112) CLIPBARS (1|2|4, the SYN 4 clip length)
import { open, buildSong } from './n5-v-qm-lib.mjs';
import fs from 'fs';
const OUT = '/home/user/Synquenzer/bau/helfer/VIDSTAGE/tests/out/n5-v-q2-out/';
const BPM = +(process.argv[2] || 112), CB = +(process.argv[3] || 1);
const {b, p, errs} = await open({touch: true});
const res = {BPM, CB};
await buildSong(p);
res.clip = await p.evaluate(([bpm, cb]) => { SYNQUENZER.setBpm(bpm); const c = S.tracks[3].clips[0]; if (cb > 1) { c.len = cb; } return {len: c.len, n: c.notes.length, stLen: S.tracks[6].clips[0] && S.tracks[6].clips[0].len}; }, [BPM, CB]);
res.set = await p.evaluate(() => { const Q = SYNQUENZER, m = S.song.marks.find(x => x.name === 'Refrain');
  return [Q.vvDirSet(m.a, m.a + m.len, 'matrix'), Q.vvDirSet(2, 6, 'spur', 3), Q.vvDirSet(6, 7, 'spur', stimmeT()), Q.vvDirGet()]; });
await p.evaluate(() => { SYNQUENZER.vvTest({opus: true}); SYNQUENZER.vvPrefs({fmt: '9:16', view: 'auto', cam: 'kamera'}); });
res.make = await p.evaluate(() => SYNQUENZER.vvMake({}).then(m => ({dur: m.dur, cuts: m.cuts})));
res.an = await p.evaluate(() => {
  const r = VV.last, rt = VV.lastRt, L = rt.log, out = {};
  const Ly = vvSpurLayout(640, 360);
  for (const sh of rt.shots) {
    const key = (sh.a + 1) + '–' + sh.b + ' ' + sh.v + (sh.t != null ? ':' + sh.t : ''), k = rt.shots.indexOf(sh);
    const fr = L.filter(e => e.k === k); if (!fr.length) continue;
    if (sh.v === 'spur') {
      let inside = 0, worst = 0, n = 0;
      for (const e of fr) {
        const st = vvStateAt(r, e.ts), s = st.slots[sh.t], c = s != null && s >= 0 ? vvClip(sh.t, s, st.own[sh.t]) : null, ph = vvPhase(st, sh.t, c); if (ph == null) continue;
        const x = Ly.x + 8 + ph * (Ly.w - 16), l = e.cx - e.ww / 2, rr = e.cx + e.ww / 2; n++;
        if (x >= l && x <= rr) inside++; else worst = Math.max(worst, x < l ? l - x : x - rr);
      }
      out[key] = {frames: n, laufstrichImBild: +(inside / Math.max(1, n) * 100).toFixed(1) + ' %', weitesterAbstand_px: +worst.toFixed(0), fensterBreite_px: +fr[0].ww.toFixed(1)};
    } else if (sh.v === 'song') {
      // the label column (0..78): how many frames cut it (window left edge inside 1..77 = names cut in the middle)
      let cut = 0; for (const e of fr) { const l = e.cx - e.ww / 2; if (l > 1 && l < 77) cut++; }
      out[key] = {frames: fr.length, namenAngeschnitten: cut};
    } else {
      let lab = 0; for (const e of fr) { const l = e.cx - e.ww / 2; if (l <= 1) lab++; }
      out[key] = {frames: fr.length, spurnamenImBild: lab, z: [Math.min(...fr.map(e => e.z)).toFixed(2), Math.max(...fr.map(e => e.z)).toFixed(2)]};
    }
  }
  return out;
});
res.errs = errs;
console.log(JSON.stringify(res, null, 1));
fs.writeFileSync(OUT + `cam-${BPM}-${CB}.json`, JSON.stringify(res, null, 1));
await b.close();
