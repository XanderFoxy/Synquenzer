import {launch, open} from './v3-qa8-lib.mjs';
const b = await launch(); const {page, errs} = await open(b, 'P1');
const r = await page.evaluate(async () => {
  mkLoad(); await MKF.decodeAll();
  const out = [], init = JSON.stringify(SQMK.normMk(SQMK.init()));
  for (let bk = 1; bk <= 8; bk++) for (let s = 1; s <= 16; s++) {
    const rec = MKF.facRec(bk, s), pm = rec.p.mk, act = pm.mode === 1 || pm.mode === 2 ? [0, 1] : [0];
    const seqLanes = []; for (const ti of act) { const t = pm.t[ti]; if (t.seq.on) for (const q of t.seq.q) if (q.k) seqLanes.push({ti, k: q.k, var: Math.max(...q.v.slice(0, t.seq.last)) - Math.min(...q.v.slice(0, t.seq.last)), last: t.seq.last}); }
    const wave = act.some(ti => pm.t[ti].o1.w === 5 && pm.t[ti].mix.o1 > 0) && pm.mode !== 3;
    out.push({L: MKF.label(bk, s), id: rec.id, name: rec.name, nlen: rec.name.length, tip: (rec.tip || '').length, role: rec.prole || rec.role, bank: rec.bank, slot: rec.slot,
      mode: pm.mode, arp: pm.arp.on, arpT: pm.arp.tgt, seq: seqLanes, wave, w: act.map(ti => pm.t[ti].o1.w), dsync: pm.dly.sync, ddep: pm.dly.dep, mfx: [pm.mfx.type, pm.mfx.dep],
      eq: [pm.eq.lf, pm.eq.lg, pm.eq.hf, pm.eq.hg], lvl: act.map(ti => pm.t[ti].a.lvl), voc: pm.mode === 3 ? {hold: !!pm.voc.hold, dir: pm.voc.dir, hpl: pm.voc.hpl, lvl: pm.voc.lvl} : null,
      isInit: JSON.stringify(SQMK.normMk(pm)) === init, mw: rec.p.mw});
  }
  return out;
});
let bad = [];
const R = {2: 'arp', 6: 'seq|arp', 10: 'seq', 14: 'wseq'};
for (const x of r) {
  if (x.nlen > 12) bad.push(x.L + ' name>12 ' + x.name);
  if (!x.tip && x.L !== 'H16') bad.push(x.L + ' no tip');
  const s = +x.L.slice(1), bk = x.L[0];
  if (bk !== 'H' || s <= 8) {
    const need = bk === 'H' && (s === 2 || s === 7) ? null : R[s];
    if (need === 'arp' && !x.arp) bad.push(x.L + ' role 02 without arp');
    if (need === 'seq|arp' && !x.arp && !x.seq.length) bad.push(x.L + ' role 06 without seq/arp');
    if (need === 'seq' && !x.seq.length) bad.push(x.L + ' role 10 without mod-seq');
    if (need === 'wseq' && !(x.wave && x.seq.some(q => q.k === 5 && q.var > 0))) bad.push(x.L + ' role 14 not stored-wave seq on CONTROL 2 ' + JSON.stringify({w: x.w, seq: x.seq}));
  }
  for (const q of x.seq) if (q.var === 0) bad.push(x.L + ' seq lane k' + q.k + ' flat (no audible effect)');
}
const cnt = {arp: r.filter(x => x.arp).length, seq: r.filter(x => x.seq.length).length, seqAud: r.filter(x => x.seq.some(q => q.var > 0)).length, wave: r.filter(x => x.wave).length,
  dual: r.filter(x => x.mode === 1 || x.mode === 2).length, dsync: r.filter(x => x.dsync).length, dsyncAud: r.filter(x => x.dsync && x.ddep > 0).length};
console.log('counts', JSON.stringify(cnt));
const voc = r.filter(x => x.L >= 'H09' && x.L <= 'H14');
console.log('voc', voc.map(x => x.L + ' mode' + x.mode + ' ' + JSON.stringify(x.voc)).join('\n'));
console.log('H15', JSON.stringify(r.find(x => x.L === 'H15').w), 'H16 init', r.find(x => x.L === 'H16').isInit);
console.log('EQ', r.filter(x => x.eq[1] || x.eq[3]).length, 'programs with EQ gain; flat lifts', r.filter(x => x.eq[0] === 1000 && x.eq[2] === 1000 && x.eq[1] === x.eq[3] && x.eq[1] > 0).length, 'max', Math.max(...r.map(x => x.eq[1])));
console.log('mw nonzero', r.filter(x => x.mw).map(x => x.L + ':' + x.mw.toFixed(2)).join(' '));
console.log('bad', bad.length, bad.join('\n'));
console.log('errs', errs);
await b.close();
