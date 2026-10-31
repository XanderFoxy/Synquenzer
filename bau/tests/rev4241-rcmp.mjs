// Review 4.24.1: same sound objects (from 4.23.0's factory) rendered through hotfix / 4.23.0 / 4.24.0 via mkRender,
// worklet Math.random seeded (LCG seed SEED), variants as-is / reset 0 / reset 1. node rcmp.mjs <hotfix> <4230> <4240> [seed]
import {chromium} from 'playwright';
const [HF, A23, A24, SEEDS] = process.argv.slice(2); const SEED = +(SEEDS || 12345);
const b = await chromium.launch({args: ['--autoplay-policy=no-user-gesture-required']});
async function open(file) {
  const p = await b.newPage({viewport: {width: 390, height: 844}}); const errs = [];
  p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto('file://' + file); await p.waitForFunction(() => window.SYNQUENZER && window.SYNQUENZER.version, null, {timeout: 30000}); await p.waitForTimeout(800);
  await p.evaluate(seed => { const el = document.getElementById('sq-worklet-src'); el.textContent = `Math.random = (() => { let s = ${seed}; return () => { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 4294967296; }; })();\n` + el.textContent; }, SEED);
  return {p, errs};
}
const H = await open(HF), O = await open(A23), N = await open(A24);
const want = ['INIT Analog', 'Rom-Fläche', 'Mini-Lead', 'Melodie-Lead', 'Supersaw-Hymne', 'Moog-Bass'];
const sounds = await O.p.evaluate(want => {
  const out = []; const seen = new Set();
  for (const [id, f] of FACTORY_BY_ID) {
    if (!f || (f.engine !== 'analog' && f.engine !== 'wt')) continue;
    const s = typeof soundCopy === 'function' ? soundCopy(f) : SQStore.soundFromFactory(f);
    if (want.includes(f.name) && !seen.has(f.name)) { seen.add(f.name); out.push({id, name: f.name, eng: f.engine, s}); }
  }
  // two WT sounds with 2 oscillators (o2lvl > 0, reset 0)
  let w = 0; for (const [id, f] of FACTORY_BY_ID) { if (w >= 2 || !f || f.engine !== 'wt') continue; const s = soundCopy(f); if ((+s.p.o2lvl || 0) > 0 && !s.p.reset) { out.push({id, name: f.name, eng: 'wt', s}); w++; } }
  return out;
}, want);
const ev = [[0, 'on', 48, .9], [0, 'on', 55, .8], [0, 'on', 64, .7], [1.0, 'off', 48], [1.0, 'off', 55], [1.0, 'off', 64], [1.1, 'on', 67, .8], [1.6, 'on', 69, .6], [1.7, 'off', 67], [2.1, 'off', 69],
  [2.2, 'on', 60, .8], [2.4, 'off', 60], [2.5, 'on', 60, .8], [2.7, 'off', 60], [2.8, 'on', 60, .8], [3.0, 'off', 60]];
const render = (P, s) => P.p.evaluate(async ([s, ev]) => {
  const r = await SYNQUENZER.mkRender(s, ev, {sec: 3.4, seed: 1});
  const u = new Uint8Array(r.l.buffer.slice(0)); let bin = ''; for (let i = 0; i < u.length; i += 8192) bin += String.fromCharCode.apply(null, u.subarray(i, i + 8192)); return btoa(bin);
}, [s, ev]);
const dec = s => new Float32Array(Buffer.from(s, 'base64').buffer.slice(0));
const cmp = (x, y) => { let s = 0, r = 0, pk = 0; for (let i = 0; i < x.length; i++) { const d = x[i] - y[i]; s += d * d; r += y[i] * y[i]; pk = Math.max(pk, Math.abs(d)); } return {dB: r > 0 ? +(10 * Math.log10(Math.max(1e-30, s) / r)).toFixed(1) : -999, pk}; };
async function best(P, Q, s) { let o = {dB: 1e9}; for (let k = 0; k < 3 && o.dB > -90; k++) { const c = cmp(dec(await render(P, s)), dec(await render(Q, s))); if (c.dB < o.dB) o = c; } return o; }
const rows = [];
for (const z of sounds) for (const v of ['asis', 'r0', 'r1']) {
  const s = JSON.parse(JSON.stringify(z.s)); if (v === 'r0') s.p.reset = 0; if (v === 'r1') s.p.reset = 1;
  const hv23 = await best(H, O, s), hv24 = await best(H, N, s);
  rows.push({name: z.name, eng: z.eng, v, reset: v === 'asis' ? (z.s.p.reset | 0) : (v === 'r1' ? 1 : 0), o2: +z.s.p.o2lvl || 0, vs423: hv23.dB, pk423: hv23.pk, vs424: hv24.dB});
}
for (const r of rows) console.log(JSON.stringify(r));
console.log(JSON.stringify({seed: SEED, n: rows.length, eq423: rows.filter(r => r.vs423 <= -90).length, errs: H.errs.concat(O.errs, N.errs).slice(0, 5)}));
await b.close();
