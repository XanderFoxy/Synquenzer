// QA V2c′ – part E: lit keys in the DOM (inkey classes + ghost dots) under a scene Träger; menu screenshots P1/L1
import { open } from './v3-v2d-pw.mjs';
const out = {};
for (const [vp, tag] of [[{width: 390, height: 844}, 'P1'], [{width: 844, height: 390}, 'L1']]) {
  const {b, p, errs} = await open(vp);
  const r = await p.evaluate(async () => {
    const Q = window.SYNQUENZER, sl = ms => new Promise(r => setTimeout(r, ms)), PC = n => ((n % 12) + 12) % 12;
    const res = {};
    for (const os of [true, false]) {
      Q.stop(); Q.newProject({init: true}); ensureAudio(); Q.oneScale(os); Q.setKbScale('show');
      Q.setClip(0, 0, {len: 1, key: {root: 4, scale: 'aeolian', src: 'user'}, notes: [64, 66, 67, 69, 71, 72, 74].map((n, i) => ({t: i * .5, d: .45, n, v: .8}))});
      Q.setChordRow('S1', {len: 1, ch: [{b: 0, tg: Q.parseChord('C')}]}); Q.setBpm(120); Q.selectTrack(0);
      Q.play(); Q.launchScene(0); await sl(1500);
      const inkey = new Set(), dotted = new Set(); let total = 0;
      for (let k = 0; k < 6; k++) { for (const [n, o] of KB.byNote) { total++; if (o.el.classList.contains('inkey')) inkey.add(PC(n)); if (o.dots.some(d => !d.hidden)) dotted.add(PC(n)); } await sl(120); }
      // 20 sampled sounding voices
      const outs = new Set(); for (let k = 0; k < 20; k++) { for (const v of Q.voices()) if (v.track === 0 && v.src === 'clip') outs.add(PC(v.out)); await sl(50); }
      res[os ? 'on' : 'off'] = {total, inkey: [...inkey].sort((a, b) => a - b), dotted: [...dotted].sort((a, b) => a - b), voices: [...outs].sort((a, b) => a - b), ks: Q.kbScaleNow().pcs.slice().sort((a, b) => a - b)};
      Q.stop(); await sl(200);
    }
    return res;
  });
  out[tag] = r;
  await p.evaluate(() => { window.SYNQUENZER.newProject({init: true}); });
  await p.click('#bMenu'); await p.waitForTimeout(600);
  const row = p.getByText('Eine Skala', {exact: true}).first(); await row.scrollIntoViewIfNeeded().catch(() => {});
  await p.waitForTimeout(300);
  await p.screenshot({path: `/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/dirigent-test/v3-qa-v2c2-${tag}-menu.png`});
  out[tag].hscroll = await p.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1);
  out[tag].errs = errs;
  await b.close();
}
console.log(JSON.stringify(out, null, 1));
