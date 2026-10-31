import {launch, open, mkTake, sleep, LY} from '../h.mjs';
const br = await launch(); const {p, errs} = await open(br);
await p.evaluate(() => { SYNQUENZER.newProject(); SYNQUENZER.setBpm(120); }); await sleep(300);
const T = []; for (let t = 0.5; t < 88; t += 0.45) { T.push(t); if (T.length % 6 === 0) t += 0.8; }
const tk = await mkTake(p, T, 90, 0), id = tk.id;
console.log('marks', tk.marks.length);
await p.evaluate(() => SYNQUENZER.g9Text(null, false));
await p.evaluate(() => { window.__calls = []; window.__done = []; SYNQUENZER.g9AsrSim(async (x, o) => { window.__calls.push(o.k); await new Promise(r => setTimeout(r, 400)); window.__done.push(o.k); return {words: [{text: 'la', start: 0.2, end: 0.5}], lang: 'de'}; }); });
const pr = p.evaluate(id => SYNQUENZER.g9Recognize(id, {lang: 'de'}), id);
await p.waitForFunction(() => window.__done.length >= 1, null, {timeout: 20000}); await sleep(150);
await p.evaluate(() => { MICTAP.users.add('test'); g9MicOn(); });
await sleep(600);
await p.evaluate(() => MICTAP.users.delete('test'));
const r = await pr;
console.log('chunks', r.chunks, 'calls', (await p.evaluate(() => window.__calls)).join(','), 'words', r.words.length, 'err', r.err);
console.log('timers: holdT', await p.evaluate(() => G9.holdT), 'hold', await p.evaluate(() => G9.hold));
console.log('errs', errs.join('|'));
await br.close();
