// QA regression V2c′: new project (Eine Skala on in 4.5.3) with 4 busy synth clips incl. foreign tones + drums, a part with a
// chord row changing every 2 beats (Am F C G E Dm Bb A), editor open: rAF fps, long tasks, tick errors, voices after stop; base vs new
import { open, APP } from './v3-v2d-pw.mjs';
const BASE = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/synq-snapshots/VS2b-fix.html';
for (const run of [1, 2]) for (const [name, file] of [['base', BASE], ['new', APP]]) {
  const {b, p, errs} = await open({width: 390, height: 844}, file, true);
  const setup = await p.evaluate(() => { const Q = window.SYNQUENZER; Q.newProject({init: true}); Q.setBpm(150); const K = {root: 4, scale: 'aeolian'};
    const mk = (base, step, d) => { const ns = []; for (let k = 0; k < 16 / step; k++) ns.push({t: k * step, d, n: base + [0, 2, 3, 5, 7, 8, 10, 12, 1, 6][k % 10], v: .8}); return ns; };
    Q.setClip(0, 0, {len: 1, key: K, notes: mk(40, .5, .45)}); Q.setClip(1, 0, {len: 1, key: K, notes: mk(64, .25, .2)});
    Q.setClip(2, 0, {len: 1, key: K, notes: [0, 4, 8, 12].flatMap(t => [52, 55, 59, 62].map(n => ({t, d: 3.9, n, v: .6})))}); Q.setClip(3, 0, {len: 1, key: K, notes: mk(76, .25, .1)});
    Q.setClip(4, 0, {len: 1, key: K, notes: [0, 1, 2, 3].flatMap(t => [{t, d: .1, n: 36, v: .9}, {t: t + .5, d: .1, n: 42, v: .7}])});
    const ch = ['Am', 'F', 'C', 'G', 'E', 'Dm', 'Bb', 'A'];
    Q.setPart(0, {name: 'A', slots: [{s: 0}, {s: 0}, {s: 0}, {s: 0}, {s: 0}, null], chords: {len: 4, ch: ch.map((c, k) => ({b: k * 2, tg: Q.parseChord(c)}))}});
    Q.launchPart(0); Q.selectSlot(1, 0); Q.openEditor(); return Q.runtime().harmony.oneScale; });
  await p.waitForTimeout(1500);
  const m = await p.evaluate(() => new Promise(res => {
    const lt = []; let po; try { po = new PerformanceObserver(l => { for (const e of l.getEntries()) lt.push(e.duration); }); po.observe({type: 'longtask', buffered: false}); } catch (e) {}
    const fr = []; let last = performance.now(); const t0 = last;
    const f = now => { fr.push(now - last); last = now; if (now - t0 < 10000) requestAnimationFrame(f); else { po && po.disconnect(); const s = fr.slice().sort((a, b) => a - b); res({fps: +(1000 / s[Math.floor(s.length / 2)]).toFixed(1), frames: fr.length, p95: +s[Math.floor(s.length * .95)].toFixed(1), p99: +s[Math.floor(s.length * .99)].toFixed(1), long: lt.length, maxLong: lt.length ? Math.max(...lt).toFixed(0) : 0}); } };
    requestAnimationFrame(f);
  }));
  const r = await p.evaluate(() => { const Q = window.SYNQUENZER; const L = Q.noteLog(4000).filter(n => n.beat != null); return {te: Q.tickErrors(), n: L.length, part: !!Q.partInfo().part}; });
  await p.evaluate(() => window.SYNQUENZER.stop()); await p.waitForTimeout(1500);
  const v = await p.evaluate(() => window.SYNQUENZER.runtime().voices);
  console.log(run, name, 'oneScale', setup, JSON.stringify(m), JSON.stringify(r), 'voicesAfterStop', v, 'errs', JSON.stringify(errs));
  await b.close();
}
