import {open} from './lib.mjs';
for (const f of [process.argv[2], undefined]) {
const {b, p} = await open(f);
const r = await p.evaluate(async () => {
  const D = SYNQUENZER; D.newProject(); D.setClip(0, 0, {len: 1, notes: [{t: 0, d: .25, n: 60, v: .8}, {t: .5, d: .25, n: 62, v: .8}]});
  const a = await D.historyCheck({detail: true});
  D.undo(); D.redo(); const b2 = await D.historyCheck({detail: true});
  const ok3 = typeof D.lkSet === 'function' ? (D.lkSet(0, 0, 0, 'cutoff', .3), await D.historyCheck({detail: true})) : null;
  return {a: a.ok, b: b2.ok, c: ok3 && ok3.ok, cw: ok3 && ok3.bad};
});
console.log(f || 'neu', JSON.stringify(r)); await b.close(); }
