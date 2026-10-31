import {launch, open, clickTake, mkTake, sleep, U, LY, SET, deq} from '../h.mjs';
const br = await launch(); const {p, errs} = await open(br);
await p.evaluate(() => { SYNQUENZER.newProject(); SYNQUENZER.setBpm(120); }); await sleep(300);
const T = [0.5, 0.9, 1.3, 2.4, 2.8, 3.2, 4.4, 4.8];
const tkB = await clickTake(p, Array.from({length: 8}, (_, k) => .3 + k * .3), 4, 1);
await p.evaluate(T => {
  SYNQUENZER.g9AsrSim(async (x, o) => ({words: [{text: 'Liebe', start: o.toStream(T[0]) - o.a, end: o.toStream(T[2] + .3) - o.a}, {text: 'ist', start: o.toStream(T[3]) - o.a, end: o.toStream(T[3] + .3) - o.a}], lang: 'de'}));
}, T);
const tk = await mkTake(p, T, 6, 0), id = tk.id;
await p.evaluate(id => g9AutoQueue(id), id);
await p.waitForFunction(id => SYNQUENZER.g9Ly(id), id, {timeout: 10000});
console.log('auto ly', (await LY(p, id)).s.map(s => s.x).join(' '));
// 1) Nutzer löscht den Text über wpLyrics('') (VS5b-Pop / Test-API)
await p.evaluate(id => SYNQUENZER.wpLyrics(id, ''), id);
console.log('nach Löschen', JSON.stringify(await LY(p, id)), await p.evaluate(id => S.takes[id].lyrics || null, id));
// unrelated 'takes' step on other take + undo
await p.evaluate(id => SYNQUENZER.wpMark(id, 'add', 1.95), tkB.id);
await p.evaluate(() => SYNQUENZER.undo());
const after = await LY(p, id);
console.log('nach fremdem takes-Undo:', after ? 'TEXT WIEDER DA: ' + after.s.map(s => s.x).join(' ') : 'weg (ok)');
// 2) Manual recognize while auto job pending: o.auto leaks
await p.evaluate(() => { const f = G9.asr; G9.asr = async (x, o) => { await new Promise(r => setTimeout(r, 800)); return f(x, o); }; });
const tk3 = await mkTake(p, T, 6, 2);
await p.evaluate(id => g9AutoQueue(id), tk3.id); await sleep(100);
await SET(p, tk3.id, {op: 'word', k: 0, text: 'Herz'});
const u0 = await p.evaluate(() => UNDO.length);
const res = await p.evaluate(id => SYNQUENZER.g9Recognize(id, {lang: 'de', mode: 'fill'}), tk3.id);
console.log('manuell während Auto-Job:', JSON.stringify({discard: res && res.discard, undo: (await p.evaluate(() => UNDO.length)) - u0}), (await LY(p, tk3.id)).s.map(s => s.x).join(' '));
console.log('errs', errs.join('|'));
await br.close();
