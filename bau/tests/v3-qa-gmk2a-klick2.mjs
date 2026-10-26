// wave switches with the filter OPEN while one note sounds (touch edits, 2nd finger): HP-5 kHz energy per 2-ms window vs. the
// LOUDER of the two steady states around it (median of 10 windows before / after, M-KLICK like MK2-03); spike > 6 dB = click
import {open, sleep, OUT, check, done} from './v3-qa-gmk2a-tl.mjs';
import {recStart} from './v3-qa-gmk2a-rec.mjs';
const NOTE = +(process.argv[2] || 12);
const T = await open(); const {p, E, errs} = T;
await E(() => { const Q = SYNQUENZER; Q.setMetronome(false); Q.setEngine(0, 'mk'); for (const [k, v] of Object.entries({'t.0.f.cut': 127, 't.0.f.res': 0, 't.0.e2.a': 0, 't.0.e2.s': 127, 't.0.e2.r': 40, 't.0.o1.w': 5, 't.0.o1.c2': 0, 't.0.a.lvl': 100})) Q.mkSet(0, k, v); });
await T.openEd(0); await T.w('w1', /^3 OSZ 1/);
await sleep(2500);
await recStart(E, 150, [0]);
const kA = await T.key(NOTE); const keyPt = {x: kA.cx, y: kA.cy, id: 90};
await E(() => { window.__wl = []; let last = -1; window.__wli = setInterval(() => { const m = SYNQUENZER.mkGet(0); const k = m.t[0].o1.w + ':' + m.t[0].o1.c2; if (k !== last) { last = k; window.__wl.push([+AU.ctx.currentTime.toFixed(3), m.t[0].o1.w, m.t[0].o1.c2, Math.floor(m.t[0].o1.c2 / 2) + 1, SYNQUENZER.mkInfo().built]); } }, 4); });
await T.send('touchStart', [keyPt]); await sleep(600);
const tap2 = async (x, y, wait = 250) => { await T.send('touchStart', [{x, y, id: 91}]); await sleep(40); await T.send('touchEnd', [{x, y, id: 91}]); await sleep(wait); };
const drag2 = async (k, dy, steps = 60, ms = 25) => { const r = await T.mk(k); await T.send('touchStart', [{x: r.cx, y: r.cy, id: 92}]); for (let s = 1; s <= steps; s++) { await T.send('touchMove', [{x: r.cx, y: r.cy + dy * s / steps, id: 92}]); await sleep(ms); } await T.send('touchEnd', [{x: r.cx, y: r.cy + dy, id: 92}]); await sleep(150); };
const list2 = async (k, re) => { const r = await T.mk(k); await tap2(r.cx, r.cy, 400); const b = await T.rectText('#popLayer .pop button', re); if (!b) return 'no item ' + re; await tap2(b.cx, b.cy, 300); return 'ok'; };
const pick = async n => { const r = await T.mk('k2'); await tap2(r.cx, r.cy, 600); await E(n => { const L = document.querySelector('#popLayer .plist.mkwv'); const b = document.querySelector('#popLayer .pop button[data-v="' + n + '"]'); L.scrollTop = b.offsetTop - L.offsetTop - 100; }, n); await sleep(300); const b = await E(n => { const r = document.querySelector('#popLayer .pop button[data-v="' + n + '"]').getBoundingClientRect(); return {cx: r.x + r.width / 2, cy: r.y + r.height / 2}; }, n); await tap2(b.cx, b.cy, 500); };
const acts = [];
const act = async (n, fn) => { const t = await E(() => AU.ctx.currentTime); await fn(); const t1 = await E(() => AU.ctx.currentTime); acts.push({n, t, t1, v: (await E(() => SYNQUENZER.voices().length))}); await sleep(500); };
await act('STEUER 2 slow sweep 1 → 64', () => drag2('k2', -230, 200, 25));
await act('STEUER 2 slow sweep 64 → 1', () => drag2('k2', 230, 200, 25));
for (const n of [61, 35, 64, 12, 63, 27, 62, 1]) await act('list → ' + n, () => pick(n));
for (const w of ['Säge', 'Speicherwelle', 'Sinus×', 'Stimmwelle', 'Rauschen', 'Puls', 'Speicherwelle', 'Dreieck', 'Speicherwelle']) await act('WELLE → ' + w, () => list2('k0', new RegExp('^' + w)));
await T.send('touchEnd', [keyPt]); await sleep(800);
const r = await E(acts => {
  const Q = window.__q, sr = Q.sr, x = Q.bufs[1].subarray(0, Q.n), t0 = Q.f0 / sr;
  const hp = (inp, f, q) => { const w = 2 * Math.PI * f / sr, a = Math.sin(w) / (2 * q), cw = Math.cos(w), b0 = (1 + cw) / 2, b1 = -(1 + cw), b2 = b0, a0 = 1 + a, a1 = -2 * cw, a2 = 1 - a; const y = new Float32Array(inp.length); let x1 = 0, x2 = 0, y1 = 0, y2 = 0; for (let i = 0; i < inp.length; i++) { const v = (b0 * inp[i] + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2) / a0; x2 = x1; x1 = inp[i]; y2 = y1; y1 = v; y[i] = v; } return y; };
  const h = hp(hp(x, 5000, .5412), 5000, 1.3066);
  const note = SYNQUENZER.noteLog(50).filter(n => n.track === 0).pop().out, f0 = 440 * Math.pow(2, (note - 69) / 12);
  const per = sr / f0, NP = Math.max(1, Math.ceil(sr * .004 / per));   // period-synchronous windows (≥ 4 ms, whole periods)
  const W = Math.round(per * NP), e = [], rm = []; for (let i = 0; i + W <= x.length; i += W) { let s = 0, s2 = 0; for (let k = i; k < i + W; k++) { s += h[k] * h[k]; s2 += x[k] * x[k]; } e.push(10 * Math.log10(s / W + 1e-20)); rm.push(10 * Math.log10(s2 / W + 1e-20)); }
  const med = a => { const b = a.slice().sort((p, q) => p - q); return b[b.length >> 1]; };
  const flags = []; let minRms = 0;
  const tA = acts[0].t, tB = acts[acts.length - 1].t1;
  for (let k = 12; k < e.length - 12; k++) { const t = t0 + k * W / sr; if (t < tA || t > tB) continue; minRms = Math.min(minRms, rm[k]); const before = med(e.slice(k - 11, k - 1)), after = med(e.slice(k + 2, k + 12)); const ref = Math.max(before, after); if (e[k] > ref + 6 && e[k] > -80) flags.push({t: +t.toFixed(4), db: +(e[k] - ref).toFixed(1), lv: +e[k].toFixed(1), act: (acts.filter(a => t >= a.t - .05).pop() || {}).n}); }
  return {flags, minRms: +minRms.toFixed(1), n: flags.length, f0: +f0.toFixed(2), W, NP};
}, acts);
const WL = await E(() => window.__wl); for (const f of r.flags) { const w = WL.filter(x => x[0] <= f.t).pop(); console.log('flag', f.t, f.db, 'wave state', JSON.stringify(w), 'next', JSON.stringify(WL.find(x => x[0] > f.t))); }
console.log('acts', JSON.stringify(acts.map(a => [a.n, a.v])));
console.log('f0/W', r.f0, r.W, r.NP, 'min RMS while held', r.minRms, 'flags', r.n, JSON.stringify(r.flags.slice(0, 30)));
check('note held through all wave switches', acts.every(a => a.v >= 1), acts.map(a => a.v));
check('M-KLICK (vs. the louder steady state): no spike > 6 dB at any wave switch (filter open)', r.n === 0, r.flags.slice(0, 12));
check('no dropout (2-ms RMS > −60 dB while held)', r.minRms > -60, r.minRms);
check('no console errors', errs.length === 0, errs);
await T.br.close(); done();
