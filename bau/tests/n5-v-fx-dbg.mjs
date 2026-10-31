import { open, SONG8 } from './n5-v-abn-lib.mjs';
const {b, p, errs} = await open();
await p.evaluate(() => { window.__fn = 'vvMake'; });
const r = await p.evaluate(async s => { SYNQUENZER.setSong(s); SYNQUENZER.vvTest({opus: true});
  const t = performance.now(); let st = []; const iv = setInterval(() => st.push([Math.round(performance.now() - t), !!VV.off, VV.off ? +VV.off.prog.toFixed(3) : null, VV.busy]), 1000);
  try { const x = await Promise.race([SYNQUENZER[window.__fn || "vvRender"]({fmt: "9:16", view: "song"}), new Promise((_, j) => setTimeout(() => j(new Error('timeout')), 40000))]); clearInterval(iv); return {ok: true, dur: x.dur, st}; } catch (e) { clearInterval(iv); return {err: String(e), st, prof: VV.prof}; } }, SONG8);
console.log(JSON.stringify(r), errs); await b.close();
