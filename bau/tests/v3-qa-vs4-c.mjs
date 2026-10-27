// QA VS4 C: cleaned-version cache after a change+undo while cleaning (store keys, reload re-run)
import {launch, open, sleep} from './v3-qa-vs4-h.mjs';
const RACE = process.argv[2] === 'race';
const br = await launch(null), ctx = await br.newContext({viewport: {width: 390, height: 844}});
const H = await open(br, {ctx}), p = H.p;
const sr = 48000, n = sr * 4, pcm = new Array(n); let s = 3; for (let i = 0; i < n; i++) { s = (s * 16807) % 2147483647; pcm[i] = Math.round((0.3 * Math.sin(2 * Math.PI * 220 * i / sr) * ((i / sr) % 0.7 < 0.5) + (s / 2147483647 - 0.5) * 0.004) * 32767); }
const r = await p.evaluate(pc => SYNQUENZER.tkInject({pcm: pc, sr: 48000, scene: 0, len: 2}), pcm), id = r.id;
await p.evaluate(id => SYNQUENZER.clSet(id, 100), id); await p.evaluate(id => SYNQUENZER.clWait(id), id); await sleep(500);
const k1 = await p.evaluate(() => SYNQUENZER.tkKeys());
if (RACE) { await p.evaluate(id => { SYNQUENZER.clSet(id, 30); SYNQUENZER.undo(); }, id); await sleep(3000); await p.evaluate(id => SYNQUENZER.clWait(id), id); await sleep(1500); }
const k2 = await p.evaluate(() => SYNQUENZER.tkKeys()), h = await p.evaluate(id => SYNQUENZER.clPlayHash(id), id), cl = await p.evaluate(id => SYNQUENZER.takes()[id].cl, id);
const inf = await p.evaluate(id => SYNQUENZER.clInfo(id).info, id); await p.evaluate(t => SYNQUENZER.tkSheet({t, s: 0}), r.track); await sleep(300); const stt = await p.evaluate(() => document.querySelector('.pop.tksheet .clst').textContent);
console.log('info', JSON.stringify(inf), 'status', stt);
console.log('cl', cl, 'keys before', JSON.stringify(k1.map(String).filter(k => k.startsWith(id))), 'after', JSON.stringify(k2.map(String).filter(k => k.startsWith(id))));
await p.evaluate(() => SYNQUENZER.save()); await sleep(1500);
await p.reload(); await p.waitForFunction(() => window.SYNQUENZER && window.SYNQUENZER.version); await sleep(1200);
await p.evaluate(id => { SYNQUENZER.tkLoadAll(); return SYNQUENZER.clEnsure(id); }, id); await p.evaluate(id => SYNQUENZER.clWait(id), id);
const a = await p.evaluate(id => ({h: SYNQUENZER.clPlayHash(id), runs: SYNQUENZER.clInfo(id).runs}), id);
console.log(RACE ? 'RACE' : 'PLAIN', 'after reload: runs', a.runs, 'same hash', a.h === h, 'errs', JSON.stringify(H.errs));
await br.close();
