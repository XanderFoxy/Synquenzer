import {open} from './n4-vs-l-h.mjs';
const H = await open({file: process.argv[2]});
const r = await H.p.evaluate(() => { const S = SYNQUENZER; const out = {v: S.version, keys: Object.keys(S).filter(k => /^(vs|tk|stimme|rec|setRec|getClip|selectSlot|select|song)/.test(k)).join(' ')}; out.grid = []; for (let t = 0; t < 8; t++) { const row = []; for (let s = 0; s < 8; s++) { let c = null; try { c = S.getClip(t, s); } catch (e) {} row.push(c ? c.len : '.'); } out.grid.push(row.join(' ')); } out.bpm = S.vsClock().spb; return out; });
console.log(JSON.stringify(r, null, 1));
await H.br.close();
