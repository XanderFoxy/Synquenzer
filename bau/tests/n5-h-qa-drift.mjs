// QA VC2a: after each single gesture (and after each undo/redo) is captured, does the shadow still differ from the project?
// (a manual Abgleich right after the capture must find nothing; anything found = the event missed part of its gesture)
import { launch, installGestures } from './n5-h-qa-lib01.mjs';
const {b, p, errs} = await launch();
await installGestures(p);
await p.evaluate(() => window.__setup());
await p.evaluate(() => historyCheck());
await new Promise(r => setTimeout(r, 3000)); await p.evaluate(() => { histDrainNow(); histSweep(); });
const order = ['track', 'track', 'tflag', 'takesGroup', 'takes', 'group', 'track'];
const rot = ['clip', 'sound', 'fx', 'set', 'part', 'kit', 'songChord', 'own', 'mkin', 'mkslot', 'takes', 'clipDel', 'takesGroup'];
while (order.length < 60) order.push(rot[order.length % rot.length]);
const r = await p.evaluate(async order => {
  const G = window.__G, drift = [];
  const probe = (what) => { histDrainNow(); const ops = []; histFullOps(ops); if (ops.length) drift.push({what, ops: ops.map(o => o.op + ' ' + o.path + '=' + JSON.stringify(o.value)).slice(0, 4)}); };
  for (let i = 0; i < order.length; i++) { await G[order[i]](); await new Promise(r => setTimeout(r, 0)); probe('geste ' + i + ' ' + order[i]); }
  for (let i = 0; i < 10; i++) { const u = UNDO[UNDO.length - 1]; undo(); await new Promise(r => setTimeout(r, 0)); probe('undo ' + (u && u.kind + ':' + u.label)); }
  for (let i = 0; i < 5; i++) { const u = REDO[REDO.length - 1]; redo(); await new Promise(r => setTimeout(r, 0)); probe('redo ' + (u && u.kind + ':' + u.label)); }
  return drift;
}, order);
console.log('drift after captures:', r.length);
for (const d of r) console.log('  ', d.what, JSON.stringify(d.ops));
console.log('errors', JSON.stringify(errs.slice(0, 3)));
await b.close();
