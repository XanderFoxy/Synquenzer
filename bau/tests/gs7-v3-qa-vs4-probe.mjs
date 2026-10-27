import {launch, open, micOn, sleep} from './gs7-v3-qa-vs4-h.mjs';
const br = await launch(null);
const H = await open(br), p = H.p;
const info = await p.evaluate(() => { const P = SYNQUENZER.project(); return {v: SYNQUENZER.version, tracks: P.tracks.map((t, i) => ({i, kind: t.kind, eng: t.engine, clips: t.clips.map((c, s) => c ? s + ':' + (c.notes ? c.notes.length : '?') : null).filter(Boolean).join(',')})), scene: SYNQUENZER.runtime && SYNQUENZER.runtime().scene}; });
console.log(JSON.stringify(info));
const m = await micOn(p, 'speaker'); console.log('mic', JSON.stringify(m), await p.evaluate(() => JSON.stringify(SYNQUENZER.stimme())));
await p.evaluate(() => { SYNQUENZER.setBpm(120); SYNQUENZER.setMetronome(false); window.__tap(); SYNQUENZER.selectSlot(0, 3); SYNQUENZER.play(); });
for (let k = 0; k < 6; k++) { await sleep(500); console.log(JSON.stringify(await p.evaluate(() => window.__lvl()))); }
console.log('errs', JSON.stringify(H.errs), 'reqs', H.reqs.length);
await br.close();
