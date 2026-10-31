// a computer-keyboard note (KeyA) while the video's offline sound renders: does the note end up in the video (and not live)?
import { open, OUT } from './n5-v-abn-lib.mjs';
import { pcmOf } from './n5-v-lufs.mjs';
const res = {};
const song = {bars: 6, lanes: [[], [], [], [], [{bar: 4, slot: 0}], []], carrier: [], mel: {}, marks: []};   // silent bars 1–4
for (const run of [1, 2]) {
  const {b, p, errs} = await open();
  await p.evaluate(s => { SYNQUENZER.setSong(s); SYNQUENZER.vvTest({opus: true}); SYNQUENZER.vvOpen(); }, song);
  await p.waitForTimeout(500);
  await p.evaluate(() => { window.__err = null; window.__job = null; SYNQUENZER.vvMake({fmt: '9:16', view: 'song'}).then(x => { window.__job = x; }, e => { window.__err = String(e && e.message || e); }); });
  await p.waitForFunction(() => VV.off && VV.off.prog > .08, null, {timeout: 30000, polling: 20});
  const at = await p.evaluate(() => +(VV.off.prog * VV.off.oc.length / VV.off.oc.sampleRate).toFixed(2));
  await p.keyboard.down('KeyA'); await p.waitForTimeout(200); await p.keyboard.up('KeyA');
  await p.waitForFunction(() => window.__job || window.__err, null, {timeout: 120000});
  const pc = await p.evaluate(() => SYNQUENZER.vvPcm()); const {L, R} = pcmOf(pc.b64), sr = pc.sr;
  const sec = []; for (let t = 0; t + 1 <= Math.min(8, L.length / sr); t += 1) { let s = 0; for (let k = Math.round(t * sr); k < Math.round((t + 1) * sr); k++) s += L[k] * L[k] + R[k] * R[k]; sec.push(Math.round(10 * Math.log10(s / sr / 2 + 1e-12))); }
  res['run' + run] = {keyAtOfflineSec: at, err: await p.evaluate(() => window.__err), rmsPerSecond_first8s_dB: sec, note: 'bars 1–4 (0–8.6 s) of the song are silent', errs};
  await b.close();
}
console.log(JSON.stringify(res));
