import {open, micOn, sleep, waitBeat, idle, b64, APP, BASE, mysing} from './n4-vs-p-qa-h.mjs';
const H = await open({file: APP}), p = H.p;
await p.evaluate(() => { SYNQUENZER.loadDemo(); SYNQUENZER.setMetronome(false); });
const sr = await micOn(p, 'wired');
const spb = 60 / await p.evaluate(() => S.bpm);
await p.evaluate(() => { SYNQUENZER.setRecOptions({countIn: 0, length: 4}); SYNQUENZER.selectSlot(5, 0); SYNQUENZER.launchScene(0); });
await p.waitForFunction(() => SYNQUENZER.vsClock().playing);
const y1 = mysing(16 * spb + .5, sr, -34, 3).y;
await p.evaluate(([b1]) => { const c = SYNQUENZER.vsClock(); window.__fake.play(b1, c.start + 4 * c.spb - 0.04); window.__fake.play(b1, c.start + 48 * c.spb - 0.04); }, [b64(y1)]);
await waitBeat(p, 3.6); await p.evaluate(() => SYNQUENZER.rec());
await sleep(300); console.log('rec1', JSON.stringify(await p.evaluate(() => { const r = SYNQUENZER.runtime(); return {rec: r.rec, recording: r.recording, keys: Object.keys(r)}; })).slice(0, 600));
await waitBeat(p, 21);
await p.waitForFunction(() => !SYNQUENZER.vsInfo().busy, null, {timeout: 60000});
console.log('res', await p.evaluate(() => { const r = SYNQUENZER.vsResult(); SYNQUENZER.vsResultOk(); return JSON.stringify(r).slice(0, 200); }));
await waitBeat(p, 47.6); await p.evaluate(() => { SYNQUENZER.selectSlot(5, 0); SYNQUENZER.rec(); });
for (const b of [48.5, 52, 60, 64.5, 66]) { await waitBeat(p, b); console.log(b, JSON.stringify(await p.evaluate(() => { const r = SYNQUENZER.runtime(); return {rec: r.rec, toast: document.querySelector('.toast,#toast') && document.querySelector('.toast,#toast').textContent, vs: SYNQUENZER.vsInfo().busy, last: SYNQUENZER.tkInfo().last}; })).slice(0, 500)); }
await H.br.close();
