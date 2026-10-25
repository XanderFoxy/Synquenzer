import { open, APP } from './v3-v2d-pw.mjs';
const setup = () => { const Q = window.SYNQUENZER; Q.newProject({init: true}); Q.setBpm(120); const K = {root: 9, scale: 'aeolian'}, N = (t, n, d) => ({t, d: d || .4, n, v: .8});
  Q.setClip(0, 0, {len: 1, key: K, notes: [N(0, 57), N(2, 64)]}); Q.setClip(1, 0, {len: 1, key: K, notes: [N(0, 69, 1.5)]}); Q.setClip(1, 1, {len: 1, key: K, notes: [N(.5, 76, .3)]});
  Q.songFromChain([{scene: 0, bars: 4}, {scene: 1, bars: 4}, {scene: 0, bars: 4}]); Q.selectTrack(1); Q.songView(true); return {mt: Q.song().melodyTrack, sel: Q.runtime().selected}; };
const {b, p, errs} = await open({width: 390, height: 844}, APP, true);
for (let i = 0; i < 3; i++) {
  console.log('setup', JSON.stringify(await p.evaluate(setup)));
  const ok = await p.evaluate(() => window.SYNQUENZER.songRecFrom({from: 3, mode: 'over', targets: {clips: false, chords: true, notes: true}, track: 1, preroll: false}));
  await p.waitForTimeout(500);
  console.log(ok, JSON.stringify(await p.evaluate(() => { const r = window.SYNQUENZER.runtime(); return {recTrack: r.song.recTrack, mode: r.song.recMode, mt: window.SYNQUENZER.song().melodyTrack, ban: SV.ban.textContent, mute: r.song.mute}; })));
  await p.evaluate(() => window.SYNQUENZER.stop()); await p.waitForTimeout(300);
  console.log('after stop', JSON.stringify(await p.evaluate(() => ({rec: window.SYNQUENZER.runtime().song.rec, mt: window.SYNQUENZER.song().melodyTrack, toast: (document.getElementById('toast')||{}).textContent}))));
}
console.log(errs); await b.close();
