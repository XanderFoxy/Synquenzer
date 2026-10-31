// QA VS-P-06: lange Tasks (> 50 ms) beim Fertigwerden (echte Aufnahme 8 Takte @40 = 48 s) und beim Laden eines 96-s-Takes; BASE ↔ VS-P
import {open, micOn, sleep, APP, BASE, mysing, waitBeat, b64, idle, i16} from './n4-vs-p-qa-h.mjs';
import fs from 'fs';
const OBS = () => { window.__lt = []; new PerformanceObserver(l => { for (const e of l.getEntries()) window.__lt.push({t: Math.round(e.startTime), d: Math.round(e.duration)}); }).observe({type: 'longtask', buffered: true}); };
for (const f of [BASE, APP]) {
  const H = await open({file: f}), ctx = H.ctx; let p = H.p; await p.evaluate(OBS);
  const sr = await micOn(p, 'wired');
  const BARS = 8, BPM = 40, y = mysing(BARS * 4 * 60 / BPM + 0.3, sr, -28, 91, {t0: 0.02}).y;
  await p.evaluate(([len, bpm]) => { SYNQUENZER.setBpm(bpm); SYNQUENZER.setMetronome(false); SYNQUENZER.setRecOptions({countIn: 0, length: len}); SYNQUENZER.selectSlot(0, 2); }, [BARS, BPM]);
  await p.evaluate(([b]) => { SYNQUENZER.play(); const c = SYNQUENZER.vsClock(); window.__fake.play(b, c.start + 4 * c.spb - 0.04); }, [b64(y)]);
  await waitBeat(p, 3.6); await p.evaluate(() => SYNQUENZER.rec());
  await waitBeat(p, 4 + BARS * 4 - 2);
  const tA = await p.evaluate(() => performance.now());
  await waitBeat(p, 4 + BARS * 4 + 2); await idle(p);
  // weiterspielen: der neue Take läuft im nächsten Durchgang (Messung + Neu-Planung)
  await sleep(4000);
  const tB = await p.evaluate(() => performance.now());
  await p.evaluate(() => SYNQUENZER.stop()); await sleep(300);
  // 2) Stopp → ▶ der Szene (erste Wiedergabe misst)
  const st = await p.evaluate(() => SYNQUENZER.tkInfo().stimme);
  await p.evaluate(st => { SYNQUENZER.launchScene(2); for (let i = 0; i < NT(); i++) if (i !== st) R.slot[i] = -1; }, st); await sleep(3000);
  const tC = await p.evaluate(() => performance.now()); await p.evaluate(() => SYNQUENZER.stop());
  const r1 = await p.evaluate(() => ({lt: window.__lt, vp: typeof VP !== 'undefined' ? {maxMs: VP.maxMs, runs: VP.runs, sync: VP.sync} : null}));
  console.log(await p.evaluate(() => SYNQUENZER.version), '· Aufnahme 48 s fertig + weiterspielen: lange Tasks', JSON.stringify(r1.lt.filter(x => x.t >= tA && x.t < tB).map(x => x.d)), '· Stopp → ▶:', JSON.stringify(r1.lt.filter(x => x.t >= tB && x.t < tC).map(x => x.d)), 'VP', JSON.stringify(r1.vp));
  // 3) 96-s-Take (16 Takte @40) einfügen, speichern, Seite neu laden (Laden + Messung), dann ▶
  const big = mysing(96.5, sr, -26, 92).y;
  await p.evaluate(([pc, sr]) => SYNQUENZER.tkInject({pcm: pc, sr, scene: 3, len: 16}), [i16(big), sr]);
  await sleep(1500); await p.evaluate(() => SYNQUENZER.save()); await sleep(2000); await p.close();
  const {INIT} = await import('./v3-vs2-h.mjs');
  p = await ctx.newPage(); await p.addInitScript(INIT); await p.addInitScript(OBS);
  await p.goto('file://' + f); await p.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.version);
  const tD = await p.evaluate(() => performance.now());
  await sleep(4000);
  await p.evaluate(() => { ensureAudio(); const st = SYNQUENZER.tkInfo().stimme; SYNQUENZER.launchScene(3); for (let i = 0; i < NT(); i++) if (i !== st) R.slot[i] = -1; }); await sleep(3000);
  const r2 = await p.evaluate(() => ({lt: window.__lt, vp: typeof VP !== 'undefined' ? {maxMs: VP.maxMs, runs: VP.runs, sync: VP.sync, err: VP.err} : null}));
  console.log(await p.evaluate(() => SYNQUENZER.version), '· Neuladen+Messen+▶ (96-s-Take): lange Tasks', JSON.stringify(r2.lt.filter(x => x.t > tD - 100).map(x => x.d)), 'VP', JSON.stringify(r2.vp));
  await H.br.close();
}
