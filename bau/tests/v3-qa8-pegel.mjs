// QA MK8-04 re-measure: builder's BS.1770 helper validated on a reference sine, then all programs with seed 2 and velocity 1.0 chords
import {launch, open} from './v3-qa8-lib.mjs';
import fs from 'fs';
const MESS = fs.readFileSync('/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/dirigent-test/v3-mk8-mess.js', 'utf8');
const b = await launch(); const {page: p, errs} = await open(b, 'P1');
await p.evaluate(MESS); await p.evaluate(() => { mkLoad(); return MKF.decodeAll(); });
const ref = await p.evaluate(() => { const N = 48000 * 5, l = new Float32Array(N), r = new Float32Array(N); for (let i = 0; i < N; i++) l[i] = Math.sin(2 * Math.PI * 997 * i / 48000); return {lufs: MK8M.lufs(l, r), tp: MK8M.tp(l)}; });
console.log('reference 997 Hz 0 dBFS sine, left only: LUFS', ref.lufs.toFixed(2), '(BS.1770: -3.01)', 'TP', ref.tp.toFixed(2));
const out = [];
for (let bk = 1; bk <= 8; bk++) {
  const r = await p.evaluate(async bk => {
    const o = [];
    for (let s = 1; s <= 16; s++) {
      const rec = MKF.facRec(bk, s), snd = factorySound(rec.id), role = MKF.roleOf(bk, s)[0], kind = MK8M.KIND[role] || 'stab', ph = MK8M.phrase(kind);
      const ev = MK8M.arpEv(snd.p.mk, ph.ev);
      let x = await SYNQUENZER.mkRender(snd, ev, {sec: ph.sec, seed: 2});
      if (MK8M.lufs(x.l, x.r) < -60 && role !== 'eingang') x = await SYNQUENZER.mkRender(snd, ev, {sec: ph.sec, seed: 2});
      // worst case: a 4-note chord at full velocity, 2 s (MS 2000 has 4 voices)
      const ch = [48, 55, 60, 64].flatMap(n => [[0, 'on', n, 1], [1.6, 'off', n]]);
      const y = await SYNQUENZER.mkRender(snd, MK8M.arpEv(snd.p.mk, ch), {sec: 2.4, seed: 2});
      let pk = 0; for (const a of [y.l, y.r]) for (let i = 0; i < a.length; i++) { const v = Math.abs(a[i]); if (v > pk) pk = v; }
      o.push({L: MKF.label(bk, s), role, lufs: +MK8M.lufs(x.l, x.r).toFixed(1), tp: +Math.max(MK8M.tp(x.l), MK8M.tp(x.r)).toFixed(1), chordPk: +(20 * Math.log10(pk + 1e-12)).toFixed(1)});
    }
    return o;
  }, bk);
  out.push(...r);
}
const ex = x => x.L === 'H15' || x.L === 'H16';
const bad = out.filter(x => !ex(x) && (Math.abs(x.lufs + 18) > 3 || x.tp > -1));
console.log('LUFS range', Math.min(...out.filter(x => !ex(x)).map(x => x.lufs)), '…', Math.max(...out.filter(x => !ex(x)).map(x => x.lufs)), '| TP max', Math.max(...out.filter(x => !ex(x)).map(x => x.tp)));
console.log('outside −18 ± 3 LUFS or TP > −1 (seed 2):', bad.length ? JSON.stringify(bad) : 'none');
const hot = out.filter(x => x.chordPk > -1).sort((a, b) => b.chordPk - a.chordPk);
console.log('4-note chord vel 127 sample peak > −1 dBFS:', hot.length, JSON.stringify(hot.slice(0, 20).map(x => x.L + ' ' + x.role + ' ' + x.chordPk)));
console.log('errs', errs);
await b.close();
