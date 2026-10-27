import {launch, open, sleep} from './v3-qa-vs4-h.mjs';
const br = await launch(null), H = await open(br), p = H.p;
const mk = f => { const n = 48000 * 2, a = new Array(n); for (let i = 0; i < n; i++) a[i] = Math.round(0.3 * Math.sin(2 * Math.PI * f * i / 48000) * ((i / 48000) % 0.5 < 0.3) * 32767); return a; };
const A = await p.evaluate(pc => SYNQUENZER.tkInject({pcm: pc, sr: 48000, scene: 1, len: 1}), mk(220));
const B = await p.evaluate(pc => SYNQUENZER.tkInject({pcm: pc, sr: 48000, scene: 2, len: 1}), mk(330));
for (const r of [A, B]) { await p.evaluate(id => SYNQUENZER.clSet(id, 60), r.id); await p.evaluate(id => SYNQUENZER.clWait(id), r.id); }
await sleep(500);
const k0 = (await p.evaluate(() => SYNQUENZER.tkKeys())).map(String);
// remove the clip of A (scene 1) so take A is unused
const del = await p.evaluate(t => { try { SYNQUENZER.deleteClip ? SYNQUENZER.deleteClip(t, 1) : SYNQUENZER.clearClip(t, 1); return true; } catch (e) { return String(e); } }, A.track);
await sleep(300);
const g = await p.evaluate(() => SYNQUENZER.tkGc()); await sleep(800);
const k1 = (await p.evaluate(() => SYNQUENZER.tkKeys())).map(String);
console.log('del', JSON.stringify(del), 'gc', JSON.stringify(g));
console.log('A keys before', k0.filter(k => k.startsWith(A.id)), 'after', k1.filter(k => k.startsWith(A.id)));
console.log('B keys before', k0.filter(k => k.startsWith(B.id)), 'after', k1.filter(k => k.startsWith(B.id)));
console.log('errs', JSON.stringify(H.errs));
await br.close();
