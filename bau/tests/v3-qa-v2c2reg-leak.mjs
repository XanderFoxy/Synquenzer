// QA regression V2c′: memory over a long run with many Träger changes (part chord row, a chord every beat, 300 BPM):
// JS heap after forced GC at 20 s and at the end, base vs new; plus the size of the per-clip map caches (if reachable)
import { open, APP } from './v3-v2d-pw.mjs';
const BASE = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/synq-snapshots/VS2b-fix.html';
const DUR = +(process.argv[2] || 120);
for (const [name, file] of [['base', BASE], ['new', APP]]) {
  const {b, p, errs} = await open({width: 390, height: 844}, file);
  const cdp = await p.context().newCDPSession(p);
  const heap = async () => { await cdp.send('HeapProfiler.collectGarbage'); await cdp.send('HeapProfiler.collectGarbage'); const u = await cdp.send('Runtime.getHeapUsage'); return +(u.usedSize / 1048576).toFixed(2); };
  await p.evaluate(() => { const Q = window.SYNQUENZER; Q.newProject({init: true}); Q.setBpm(300); const K = {root: 9, scale: 'aeolian'};
    const mk = (base, step, d) => { const ns = []; for (let k = 0; k < 16 / step; k++) ns.push({t: k * step, d, n: base + [0, 2, 3, 5, 7, 8, 10, 12, 1, 6][k % 10], v: .8}); return ns; };
    Q.setClip(0, 0, {len: 1, key: K, notes: mk(45, .5, .45)}); Q.setClip(1, 0, {len: 1, key: K, notes: mk(64, .25, .2)});
    Q.setClip(2, 0, {len: 1, key: K, notes: mk(57, 1, .9)}); Q.setClip(3, 0, {len: 1, key: K, notes: mk(72, .5, .3)});
    const ch = ['Am', 'F', 'C', 'G', 'E', 'Dm', 'Bb', 'A', 'Am', 'F', 'C', 'G', 'E7', 'Dm', 'Bb', 'Esus4'];
    Q.setPart(0, {name: 'A', slots: [{s: 0}, {s: 0}, {s: 0}, {s: 0}, null, null], chords: {len: 4, ch: ch.map((c, k) => ({b: k, tg: Q.parseChord(c)}))}});
    Q.launchPart(0); });
  await p.waitForTimeout(20000);
  const h0 = await heap(), c0 = await p.evaluate(() => { try { return typeof OS !== 'undefined' ? 'os' : 'no'; } catch (e) { return 'err'; } });
  const b0 = await p.evaluate(() => window.SYNQUENZER.runtime().beat);
  await p.waitForTimeout(DUR * 1000);
  const h1 = await heap(), b1 = await p.evaluate(() => window.SYNQUENZER.runtime().beat);
  const tl = await p.evaluate(() => window.SYNQUENZER.timeline ? (window.SYNQUENZER.timeline() || []).length : null);
  console.log(name, 'heap MB at 20 s', h0, 'after', DUR, 's', h1, 'delta', +(h1 - h0).toFixed(2), 'beats', Math.round(b1 - b0), 'timeline', tl, 'OS', c0, 'te', await p.evaluate(() => window.SYNQUENZER.tickErrors()), 'errs', errs.length);
  await b.close();
}
