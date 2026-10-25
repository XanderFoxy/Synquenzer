import { open } from './v3-v2d-pw.mjs';
const {b, p, errs} = await open();
await p.evaluate(() => { const Q = window.SYNQUENZER;
  window.__sleep = ms => new Promise(r => setTimeout(r, ms));
  window.__heard = async (notes, key, chord, o = {}) => {
    Q.stop(); await __sleep(80);
    Q.setClip(0, 0, {len: 1, key, notes});
    Q.setBpm(240); Q.play(); Q.launchScene(0); Q.setKbMode('transpose');
    if (chord) { await Q.chord(chord, 60); }
    await __sleep(300); Q.clearLog();
    await __sleep(o.ms || 2200);
    const log = Q.noteLog(4096).filter(e => e.track === 0 && e.src === 'clip');
    const info = {os: S.tracks[0].os, act: osActive(S.tracks[0]), h: S.settings.harmony.oneScale, ref: S.settings.harmony.osRef, sk: sceneKeyOf(0), ck: S.tracks[0].clips[0].key, tl: Q.timeline().slice(-1)};
    Q.stop(); Q.resetCarrier(); Q.setKbMode('play');
    return {info, log: log.map(e => [e.clipNote, e.out]).slice(0, 8)};
  }; });
const EM7 = [64, 66, 67, 69, 71, 72, 74].map((n, i) => ({t: i * .5, d: .4, n, v: .8}));
for (const step of ['base', 'trk', 'auto']) {
  const r = await p.evaluate(async ([n, step]) => { const Q = window.SYNQUENZER; if (step === 'base') Q.newProject({init: true}); if (step === 'trk') Q.setTrackScale(0, false); if (step === 'auto') { Q.setTrackScale(0, true); Q.setHarmony({osRef: 'auto'}); }
    return __heard(n, {root: 4, scale: 'aeolian'}, [60, 64, 67]); }, [EM7, step]);
  console.log(step, JSON.stringify(r));
}
console.log(errs); await b.close();
