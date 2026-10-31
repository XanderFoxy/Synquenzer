// the "none" gate and the fallback line in the narrowest sizes: reason readable (not clipped), no song: texts and disabled buttons
import { open, SONG8, OUT } from './n5-v-abn-lib.mjs';
const SZ = {P3: [320, 568], L2: [667, 375], P1: [390, 844]};
for (const n of ['P3', 'L2', 'P1']) {
  for (const mode of ['none', 'nosong']) {
    const {b, p, errs} = await open({w: SZ[n][0], h: SZ[n][1], touch: true, dpr: 2, init: mode === 'none' ? () => { delete window.VideoEncoder; delete window.MediaRecorder; } : undefined});
    if (mode === 'none') await p.evaluate(s => SYNQUENZER.setSong(s), SONG8);
    await p.evaluate(() => SYNQUENZER.vvOpen()); await p.waitForTimeout(600);
    const r = await p.evaluate(() => { const w = document.querySelector('#vvSheet .vvway'), t = w.firstChild, bt = [...document.querySelectorAll('#vvSheet .vvacts button')];
      return {way: w.textContent, wayClipY: w.scrollHeight > w.clientHeight + 1, wayH: [w.scrollHeight, w.clientHeight], spanClipX: t.scrollWidth > t.clientWidth + 1, rng: document.querySelector('#vvSheet .vvrow.txt .vvtxt').textContent, rngClip: (e => e.scrollWidth > e.clientWidth + 1)(document.querySelector('#vvSheet .vvrow.txt .vvtxt')), btns: bt.map(x => x.textContent + ':' + (x.disabled ? 'grau' : 'aktiv'))}; });
    await p.screenshot({path: OUT + '12-' + n + '-' + mode + '.png'});
    console.log(n, mode, JSON.stringify(r), errs.length ? errs : '');
    await b.close();
  }
}
