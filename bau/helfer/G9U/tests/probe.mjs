import {launch, open, clickTake, sleep} from './h.mjs';
const br = await launch(); const {p, errs} = await open(br);
await p.evaluate(() => { SYNQUENZER.newProject(); SYNQUENZER.setBpm(120); }); await sleep(300);
const T = Array.from({length: 16}, (_, k) => 0.3 + k * 0.22);
const tk = await clickTake(p, T, 4);
console.log(tk.marks.length, tk.marks.map(m => m.t.toFixed(3) + (m.word ? 'W' : '')).join(' '));
console.log(errs); await br.close();
