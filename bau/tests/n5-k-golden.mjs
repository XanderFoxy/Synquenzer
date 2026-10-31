// K1-05 (alte Projekte / Werksklaenge): every synth sound that exists in both builds (factory, INIT, MS 2000 programs, the
// demo project's tracks) rendered offline through each build's own main thread + worklet (mkRender), same phrase, seeded
// Math.random in the worklet; difference in dB (<= -90 = equal).  node n5-k-golden.mjs <new.html> <old.html> [filter]
import {chromium} from 'playwright';
const [NEW, OLD, FILT] = process.argv.slice(2);
const b = await chromium.launch({args: ['--autoplay-policy=no-user-gesture-required']});
async function open(file) {
  const p = await b.newPage({viewport: {width: 390, height: 844}}); const errs = [];
  p.on('pageerror', e => errs.push(String(e)));
  await p.goto('file://' + file); await p.waitForFunction(() => window.SYNQUENZER && window.SYNQUENZER.version, null, {timeout: 30000}); await p.waitForTimeout(800);
  await p.evaluate(() => {   // a seeded Math.random in front of the worklet text (S&H, drift seeds: equal in both builds)
    const el = document.getElementById('sq-worklet-src'); if (!el.dataset.k1) { el.dataset.k1 = 1; el.textContent = 'Math.random = (() => { let s = 12345; return () => { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 4294967296; }; })();\n' + el.textContent; }
  });
  return {p, errs};
}
const A = await open(NEW), B = await open(OLD);
const ids = async P => P.p.evaluate(() => {
  const out = [];
  for (const [id, f] of FACTORY_BY_ID) if (f && f.engine && f.engine !== 'drum') out.push(id);
  return out;
});
const ia = await ids(A), ib = new Set(await ids(B)), both = ia.filter(x => ib.has(x) && (!FILT || x.includes(FILT)));
const ev = [[0, 'on', 48, .9], [0, 'on', 55, .8], [0, 'on', 64, .7], [1.0, 'off', 48], [1.0, 'off', 55], [1.0, 'off', 64], [1.1, 'on', 67, .8], [1.6, 'on', 69, .6], [1.7, 'off', 67], [2.1, 'off', 69]];
const render = (P, id) => P.p.evaluate(async ([id, ev]) => {
  const rec = FACTORY_BY_ID.get(id); const s = typeof soundCopy === 'function' ? soundCopy(rec) : SQStore.soundFromFactory(rec);
  const r = await SYNQUENZER.mkRender(s, ev, {sec: 2.6, seed: 1});
  const u = new Uint8Array(r.l.buffer.slice(0)); let bin = ''; for (let i = 0; i < u.length; i += 8192) bin += String.fromCharCode.apply(null, u.subarray(i, i + 8192)); return btoa(bin);
}, [id, ev]);
const dec = s => new Float32Array(Buffer.from(s, 'base64').buffer.slice(0));
const res = []; let same = 0;
for (const id of both) {
  // mkRender posts its events through the port and starts 20 ms later: under load a message can come late (a time shift in
  // ONE render, measured base vs base): up to 3 tries, the smallest difference counts
  let dB = 1e9;
  for (let k = 0; k < 3 && dB > -90; k++) {
    let x, y; try { x = dec(await render(A, id)); y = dec(await render(B, id)); } catch (e) { res.push({id, err: String(e).slice(0, 120)}); dB = -1e9; break; }
    let s = 0, r = 0; for (let i = 0; i < x.length; i++) { const d = x[i] - y[i]; s += d * d; r += y[i] * y[i]; }
    dB = Math.min(dB, r > 0 ? 10 * Math.log10(Math.max(1e-30, s) / r) : (s > 0 ? 0 : -999));
  }
  if (dB === -1e9) continue;
  if (dB <= -90) same++; else res.push({id, dB: +dB.toFixed(1)});
}
console.log(JSON.stringify({n: both.length, same, diff: res, onlyNew: ia.filter(x => !ib.has(x)).length, errs: A.errs.concat(B.errs).slice(0, 5)}));
await b.close();
