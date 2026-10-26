// QA MK2-06 patches in Chromium via mkRender (taps where needed)
import {launch, openApp, R, mtof, OPEN, mergeO, SR} from './v3-qa-mk2-lib.mjs';
import {db, rms, zcFreq, amp} from './v3-mk1-ana.mjs';
const FILE = process.argv[2] || new URL('../mk-wt/index.html', import.meta.url).pathname;
const b = await launch(); const {page, errs} = await openApp(b, FILE);
const M = (x, d = 2) => Math.round(x * 10 ** d) / 10 ** d, out = (...a) => console.log(...a);
const P0 = [{s: 0, d: 0, i: 0}, {s: 2, d: 4, i: 0}, {s: 3, d: 0, i: 0}, {s: 4, d: 5, i: 0}];
const pat = (...ps) => { const p = JSON.parse(JSON.stringify(P0)); ps.forEach((x, k) => { if (x) p[k] = x; }); return p; };
const SINE = {o1: {w: 3, c1: 0}, mix: {o1: 127, o2: 0}};
const cents = (f, f0) => 1200 * Math.log2(f / f0);
// 1 pitch +63 with LFO1 square
{
  const x = (await R(page, mergeO(SINE, OPEN, {l1: {w: 1, f: 30}, p: pat({s: 2, d: 0, i: 63})}), [[0, 'on', 60, .8]], {sec: 4})).l;
  const fs = []; for (let s = 0; s + 4800 < x.length; s += 2400) fs.push(zcFreq(x, s, s + 4800, SR));
  const hi = Math.max(...fs), lo = Math.min(...fs.filter(f => f > 0));
  out('MK2-06 pitch +63 LFO1 square: high', M(cents(hi, mtof(60)), 1), 'ct, low', M(cents(lo, mtof(60)), 1), 'ct (want +-2400 +-10)');
  const y = (await R(page, mergeO(SINE, OPEN, {l1: {w: 1, f: 30}, p: pat({s: 2, d: 0, i: -63})}), [[0, 'on', 60, .8]], {sec: 4})).l;
  const fy = []; for (let s = 0; s + 4800 < y.length; s += 2400) fy.push(zcFreq(y, s, s + 4800, SR));
  out('  i -63: high', M(cents(Math.max(...fy), mtof(60)), 1), 'low', M(cents(Math.min(...fy.filter(f => f > 0)), mtof(60)), 1));
}
// 4 patches on one destination add (LFO1 square, 4 x 10 vs 1 x 40), and Mod-Rad / Velocity / KBD sources on pitch
{
  const f4 = async (p, top, note = 60, vel = .8) => { const x = (await R(page, mergeO(SINE, OPEN, {l1: {w: 1, f: 0}, e1: {a: 0, d: 0, s: 127}}, {p}), [[0, 'on', note, vel]], {sec: 1}, top)).l; return cents(zcFreq(x, 9600, 48000, SR), mtof(note)); };
  const a = await f4([{s: 0, d: 0, i: 10}, {s: 0, d: 0, i: 10}, {s: 0, d: 0, i: 10}, {s: 0, d: 0, i: 10}]), c = await f4(pat({s: 0, d: 0, i: 40}));
  out('MK2-06 4x10 EG1->pitch', M(a, 1), 'ct vs 1x40', M(c, 1), 'ct (want', M(40 / 63 * 2400, 1) + ')');
  out('MK2-06 MOD-RAD (p.mw=1) -> pitch +63:', M(await f4(pat({s: 7, d: 0, i: 63}), null), 1), 'ct with mw 0 / ', '(mw stored at sound level)');
  out('MK2-06 velocity 1.0 -> pitch +63:', M(await f4(pat({s: 4, d: 0, i: 63}), null, 60, 1), 1), 'ct; vel .5:', M(await f4(pat({s: 4, d: 0, i: 63}), null, 60, .5), 1));
  out('MK2-06 KBD -> pitch +63 at C5 (kt .2):', M(await f4(pat({s: 5, d: 0, i: 63}), null, 72), 1), 'ct (want', M(.2 * 2400, 1) + ')');
}
// 2 cutoff +63 with EG2 via mkScope (live engine)
{
  const r = await page.evaluate(async () => {
    SYNQUENZER.setEngine(0, 'mk'); SYNQUENZER.selectTrack(0); ensureAudio(); await new Promise(r => setTimeout(r, 300));
    const W = SQMK.W(), res = [];
    for (const [cut, i] of [[0, 63], [30, 32], [60, -40]]) {
      SYNQUENZER.mkSet(0, 't.0.f.cut', cut); SYNQUENZER.mkSet(0, 't.0.f.kbd', 0); SYNQUENZER.mkSet(0, 't.0.p.0.s', 1); SYNQUENZER.mkSet(0, 't.0.p.0.d', 4); SYNQUENZER.mkSet(0, 't.0.p.0.i', i);
      SYNQUENZER.mkSet(0, 't.0.e2.s', 127); SYNQUENZER.mkSet(0, 't.0.e2.a', 0);
      await new Promise(r => setTimeout(r, 100));
      SYNQUENZER.mkScope(0); SYNQUENZER.audition(0, 60, 600); await new Promise(r => setTimeout(r, 400));
      const s = SYNQUENZER.mkScope(0), v = s && s.voices && s.voices[0];
      res.push({cut, i, cutHz: v && v.cutHz, eg2: v && v.eg2, want: W.cutHz(cut + i / 63 * 127), base: W.cutHz(cut)});
      await new Promise(r => setTimeout(r, 400));
    }
    return res;
  });
  out('MK2-06 cutoff EG2 via mkScope:', r.map(x => `cut ${x.cut} i ${x.i}: ${x.cutHz && x.cutHz.toFixed(1)} Hz (want ${x.want.toFixed(1)}, eg2 ${x.eg2 && x.eg2.toFixed(3)})`).join(' | '));
}
// 3 pan +63 with LFO2 (sine): full way
{
  const x = await R(page, mergeO({o1: {w: 0}}, OPEN, {l2: {w: 2, f: 40}, p: pat(null, null, {s: 3, d: 6, i: 63})}), [[0, 'on', 60, .8]], {sec: 5});
  let mn = 9, mxv = -9; for (let s = 0; s + 960 < x.l.length; s += 480) { const a = rms(x.l, s, s + 960), c = rms(x.r, s, s + 960); const p = c / (a + c); mn = Math.min(mn, p); mxv = Math.max(mxv, p); }
  out('MK2-06 pan +63 LFO2: R/(L+R) min', M(mn, 3), 'max', M(mxv, 3));
}
// 4 LFO2-Freq with EG1 (sustain 127): frequency at the peak vs W-08; with sync on: bit-identical to no patch
{
  const W = await page.evaluate(() => [20, 60.3175, 0, 64.5, 50, 127].map(v => SQMK.W().lfoHz(v)));
  for (const [f, i, want] of [[20, 20, W[1]], [0, 32, W[3]], [64, 63, W[5]]]) {
    const x = (await R(page, mergeO(SINE, OPEN, {l2: {w: 2, f}, e1: {a: 0, d: 0, s: 127}, p: pat({s: 0, d: 7, i})}), [[0, 'on', 60, .8]], {sec: 6, tap: 'lfo2'})).l;
    const fz = zcFreq(x, 4800, x.length, SR);
    out('MK2-06 LFO2-Freq f', f, 'i', i, ':', M(fz, 3), 'Hz want', M(want, 3), 'dev', M((fz / want - 1) * 100, 1), '%');
  }
  const a = await R(page, mergeO({o1: {w: 0}}, OPEN, {l2: {w: 2, f: 20, sync: 1}, e1: {a: 0, d: 0, s: 127}, p: pat({s: 0, d: 7, i: 63}, null, {s: 3, d: 4, i: 40})}), [[0, 'on', 60, .8]], {sec: 2});
  const c = await R(page, mergeO({o1: {w: 0}}, OPEN, {l2: {w: 2, f: 20, sync: 1}, e1: {a: 0, d: 0, s: 127}, p: pat(null, null, {s: 3, d: 4, i: 40})}), [[0, 'on', 60, .8]], {sec: 2});
  let d = 0; for (let k = 0; k < a.l.length; k++) d = Math.max(d, Math.abs(a.l[k] - c.l[k])); out('MK2-06 LFO2-Freq with sync on: max |d| vs no patch', d);
}
// 5 OSC1 C1 with keytrack: pulse width vs pitch (mix tap)
{
  const pw = []; for (const note of [36, 60, 72, 84, 96]) { const x = (await R(page, mergeO({o1: {w: 1, c1: 0}}, OPEN, {p: pat({s: 5, d: 2, i: 63})}), [[0, 'on', note, .8]], {sec: .5, tap: 'mix'})).l;
    let mx = -9, mn = 9; for (let k = 4800; k < 24000; k++) { mx = Math.max(mx, x[k]); mn = Math.min(mn, x[k]); } let hi = 0; for (let k = 4800; k < 24000; k++) if (x[k] > (mx + mn) / 2) hi++; pw.push(note + ':' + M(hi / 19200 * 100, 1) + '%'); }
  out('MK2-06 KBD -> OSC1 C1 +63 pulse width:', pw.join(' '));
}
// 6 amp with velocity, noise with LFO1, OSC2 pitch with EG1
{
  const a = await R(page, mergeO({o1: {w: 0}}, OPEN, {a: {gate: 1, lvl: 127}, p: pat(null, null, null, {s: 4, d: 5, i: -63})}), [[0, 'on', 60, 64 / 127]], {sec: .6});
  const c = await R(page, mergeO({o1: {w: 0}}, OPEN, {a: {gate: 1, lvl: 63}}), [[0, 'on', 60, 64 / 127]], {sec: .6});
  out('MK2-06 amp vel -63 (lvl 127, vel 64/127) vs lvl 63:', M(db(rms(a.l, 9600, 28800))), M(db(rms(c.l, 9600, 28800))), 'dB');
  const n = (await R(page, mergeO({o1: {w: 0}}, OPEN, {mix: {o1: 0, o2: 0, n: 0}, l1: {w: 2, f: 40}, p: pat({s: 2, d: 3, i: 63})}), [[0, 'on', 60, .8]], {sec: 3})).l;
  const L = []; for (let s = 0; s + 2400 < n.length; s += 2400) L.push(db(rms(n, s, s + 2400))); out('MK2-06 noise <- LFO1 +63, mixer noise 0: level range', M(Math.min(...L), 0), '..', M(Math.max(...L), 1), 'dB');
  const o = (await R(page, mergeO({o1: {w: 0}}, OPEN, {mix: {o1: 0, o2: 127}, o2: {w: 2}, e1: {a: 0, d: 0, s: 127}, p: pat({s: 0, d: 1, i: 63})}), [[0, 'on', 57, .8]], {sec: 1})).l;
  const q = (await R(page, mergeO({o1: {w: 0}}, OPEN, {mix: {o1: 0, o2: 127}, o2: {w: 2, tune: 63}}), [[0, 'on', 57, .8]], {sec: 1})).l;
  out('MK2-06 OSC2 pitch <- EG1 +63:', M(zcFreq(o, 9600, 48000, SR), 2), 'Hz vs o2.tune 63:', M(zcFreq(q, 9600, 48000, SR), 2), 'Hz');
}
// 7 intensity 0 = bit-identical to no patch (INIT patches vs other s/d with i 0)
{
  const a = await R(page, mergeO({o1: {w: 1, c1: 40}}, {}), [[0, 'on', 60, .8], [.3, 'on', 64, .6], [.9, 'off', 60]], {sec: 1.5});
  const c = await R(page, mergeO({o1: {w: 1, c1: 40}}, {p: [{s: 7, d: 7, i: 0}, {s: 6, d: 6, i: 0}, {s: 5, d: 3, i: 0}, {s: 1, d: 2, i: 0}]}), [[0, 'on', 60, .8], [.3, 'on', 64, .6], [.9, 'off', 60]], {sec: 1.5});
  let d = 0; for (let k = 0; k < a.l.length; k++) d = Math.max(d, Math.abs(a.l[k] - c.l[k]), Math.abs(a.r[k] - c.r[k])); out('MK2-06 intensity 0 bit-identical: max |d|', d);
}
out('errors', errs.length, errs.slice(0, 3).join(' | '));
await b.close();
