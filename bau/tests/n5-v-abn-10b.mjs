// one Space key press while the video's offline sound renders (sheet open, busy): what is in the finished video's sound?
import { open, SONG8, OUT } from './n5-v-abn-lib.mjs';
import { pcmOf } from './n5-v-lufs.mjs';
const res = {};
for (const run of [1, 2]) {
  const {b, p, errs} = await open();
  await p.evaluate(s => { SYNQUENZER.setSong(s); SYNQUENZER.vvTest({opus: true}); SYNQUENZER.vvOpen(); }, SONG8);
  await p.waitForTimeout(500);
  await p.evaluate(() => { window.__err = null; window.__job = null; SYNQUENZER.vvMake({fmt: '9:16', view: 'song'}).then(x => { window.__job = x; }, e => { window.__err = String(e && e.message || e); }); });
  await p.waitForFunction(() => VV.off && VV.off.prog > .15, null, {timeout: 30000, polling: 20});
  const at = await p.evaluate(() => ({prog: +VV.off.prog.toFixed(3), t: +(VV.off.prog * VV.off.oc.length / VV.off.oc.sampleRate).toFixed(2)}));
  await p.keyboard.press('Space');
  await p.waitForFunction(() => window.__job || window.__err, null, {timeout: 120000});
  const end = await p.evaluate(() => ({job: window.__job ? {dur: +window.__job.dur.toFixed(3), songSec: +window.__job.songSec.toFixed(3), tail: +window.__job.tail.toFixed(3), size: window.__job.size} : null, err: window.__err, playing: R.playing, toast: EL.toast.textContent}));
  const pc = await p.evaluate(() => SYNQUENZER.vvPcm()); const {L, R} = pcmOf(pc.b64), sr = pc.sr;
  const sec = []; for (let t = 0; t + 1 <= L.length / sr; t += 1) { let s = 0; for (let k = Math.round(t * sr); k < Math.round((t + 1) * sr); k++) s += L[k] * L[k] + R[k] * R[k]; sec.push(Math.round(10 * Math.log10(s / sr / 2 + 1e-12))); }
  res['run' + run] = {spaceAtRenderedSec: at, end, rmsPerSecond_dB: sec, errs};
  await b.close();
}
console.log(JSON.stringify(res));
