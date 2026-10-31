import {launch, open, clickTake, sleep, U, LY, SET, deq, NET} from '../h.mjs';
const br = await launch(); const {p, errs} = await open(br);
await p.evaluate(() => { SYNQUENZER.newProject(); SYNQUENZER.setBpm(120); }); await sleep(300);
const T = Array.from({length: 10}, (_, k) => 0.3 + k * 0.3), tk = await clickTake(p, T, 4), id = tk.id;
const tk2 = await clickTake(p, T, 4, 1);
// Take 1: ly mit j, o, u, nm, w:2, p
await SET(p, id, {op: 'text', text: 'Lie-be ist\nein Feu-er das brennt so hell und warm heute Nacht', lang: 'de'});
await SET(p, id, {op: 'word', k: 2, text: 'Sonnenblume'});
await p.evaluate(([id, t]) => SYNQUENZER.wpMark(id, 'del', 4), [id]);
// Take 2: nur lyrics (VS5b)
await p.evaluate(id => SYNQUENZER.wpLyrics(id, 'Lie-be ist ein Feu-er'), tk2.id);
const P0 = await p.evaluate(() => SYNQUENZER.project().takes);
console.log('ly1', JSON.stringify(P0[id].ly).slice(0, 300));
console.log('t2', JSON.stringify(P0[tk2.id]).slice(0, 300));
await p.evaluate(() => SYNQUENZER.save()); await sleep(300);
await p.reload(); await p.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.version); await sleep(1500);
const P1 = await p.evaluate(() => SYNQUENZER.project().takes);
console.log('reload deep-equal take1', deq(P0[id], P1[id]), 'take2', deq(P0[tk2.id], P1[tk2.id]));
if (!deq(P0[id], P1[id])) console.log(JSON.stringify(P0[id].ly), '\n', JSON.stringify(P1[id].ly));
// old take: open marks editor + text mode, close → unchanged, no undo
const u0 = await p.evaluate(() => UNDO.length), d0 = await p.evaluate(() => JSON.stringify(S.takes));
await p.evaluate(r => SYNQUENZER.wpOpen(r), {t: P1[tk2.id] ? undefined : 0, s: 1}).catch(e => console.log('open err', e.message));
await p.evaluate(id => { const x = Object.values(S.tracks).length; }, 0);
console.log('loaded G9?', await p.evaluate(() => G9.loaded));
console.log('errs', errs.join('|'));
await br.close();
