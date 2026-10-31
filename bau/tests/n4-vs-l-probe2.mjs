import {open} from './n4-vs-l-h.mjs';
const H = await open({file: process.argv[2]});
const r = await H.p.evaluate(() => { const S = SYNQUENZER; S.loadDemo(); const out = {bpm: (S.state? 1:0), grid: []}; for (let t = 0; t < 8; t++) { const row = []; for (let s = 0; s < 8; s++) { let c = null; try { c = S.getClip(t, s); } catch (e) {} row.push(c ? c.len + (c.notes ? ':' + c.notes.length : '') : '.'); } out.grid.push(row.join(' ')); } out.st = Object.keys(S).filter(k=>/^(state|info|get)/.test(k)).join(" "); return out; });
console.log(JSON.stringify(r, null, 1));
await H.br.close();
