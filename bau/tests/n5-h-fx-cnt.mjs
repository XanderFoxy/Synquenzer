// VC2a-fix: markDirty- und Undo-Aufrufe je API-Geste zählen (Fehlersuche)
import { launch, installGestures } from './n5-h-lib.mjs';
const {b, p} = await launch();
await installGestures(p);
const r = await p.evaluate(async () => {
  let d = 0, u = 0; const od = histDirty, op = histPush;
  window.histDirty = function () { d++; return od.apply(this, arguments); };
  window.histPush = function () { u++; return op.apply(this, arguments); };
  const out = {}; const G = window.__G;
  for (const g of ['clip', 'clipDel', 'sound', 'fx', 'set', 'part', 'kit', 'song', 'songChord', 'track', 'group', 'mkin', 'takes', 'tflag']) { d = u = 0; try { await G[g](); } catch (e) { out[g] = String(e); continue; } out[g] = d + '/' + u; }
  d = u = 0; undo(); out.undo = d + '/' + u; d = u = 0; redo(); out.redo = d + '/' + u;
  d = u = 0; SYNQUENZER.setEngine(1, 'mk'); out.setEngine = d + '/' + u;
  d = u = 0; SYNQUENZER.setBpm(101); out.setBpm = d + '/' + u;
  return out;
});
console.log(JSON.stringify(r));
await b.close();
