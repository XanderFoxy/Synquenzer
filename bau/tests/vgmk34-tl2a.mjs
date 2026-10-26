// QA G-MK2a: launcher on mk-wt (re-uses the G-MK1 helpers) with own OUT dir
import * as G from './vgmk34-tl1.mjs';
export const {check, done, eq, canon, diff, res, sleep, recStart, APPMK} = G;
export const OUT = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/vgmk34/qa2a/';
export async function open(o = {}) {
  const T = await G.open(o);
  const {E} = T;
  // master level (peak dBFS) over ms
  T.lvl = ms => E(ms => new Promise(r => { const a = AU.ctx.createAnalyser(); a.fftSize = 2048; AU.M.ceil.connect(a); const buf = new Float32Array(2048); let pk = 0; const iv = setInterval(() => { a.getFloatTimeDomainData(buf); for (const v of buf) pk = Math.max(pk, Math.abs(v)); }, 20); setTimeout(() => { clearInterval(iv); try { AU.M.ceil.disconnect(a); } catch (e) {} r(+(20 * Math.log10(pk + 1e-9)).toFixed(1)); }, ms); }), ms);
  // spectrum snapshot: returns {cent: spectral centroid Hz, rms dB, peaks:[hz]}
  T.spec = ms => E(ms => new Promise(r => { const a = AU.ctx.createAnalyser(); a.fftSize = 8192; a.smoothingTimeConstant = 0; AU.M.ceil.connect(a); const f = new Float32Array(a.frequencyBinCount); const acc = new Float64Array(a.frequencyBinCount); let n = 0; const iv = setInterval(() => { a.getFloatFrequencyData(f); for (let i = 0; i < f.length; i++) acc[i] += Math.pow(10, f[i] / 10); n++; }, 30); setTimeout(() => { clearInterval(iv); try { AU.M.ceil.disconnect(a); } catch (e) {} const bw = AU.ctx.sampleRate / a.fftSize; let s = 0, sw = 0; const pw = []; for (let i = 1; i < acc.length; i++) { const p = acc[i] / n; s += p; sw += p * i * bw; pw.push(p); } const pk = []; for (let i = 2; i < pw.length - 2; i++) if (pw[i] > pw[i - 1] && pw[i] >= pw[i + 1] && 10 * Math.log10(pw[i] + 1e-30) > -70) pk.push([Math.round((i + 1) * bw), +(10 * Math.log10(pw[i])).toFixed(1)]); pk.sort((a, b) => b[1] - a[1]); r({cent: Math.round(sw / (s + 1e-30)), pow: +(10 * Math.log10(s + 1e-30)).toFixed(1), peaks: pk.slice(0, 8)}); }, ms); }), ms);
  T.closePop = async () => { const r = await E(() => { const p = document.querySelector('#popLayer.open .pop'); if (!p) return null; const r = p.getBoundingClientRect(); const W = innerWidth, H = innerHeight; const cands = [[8, 8], [W - 8, 8], [8, H - 8], [W - 8, H - 8], [W / 2, 8], [W / 2, H - 8], [8, H / 2], [W - 8, H / 2]]; const dist = ([x, y]) => Math.max(r.left - x, x - r.right, r.top - y, y - r.bottom); cands.sort((a, b) => dist(b) - dist(a)); return dist(cands[0]) > 20 ? cands[0] : null; }); if (!r) { await E(() => closePop()); await sleep(600); return 'api'; } await T.tap(r[0], r[1], 600); return true; };
  T.openEd = async t => { await E(t => { SYNQUENZER.selectTrack(t); SYNQUENZER.openEditor(); }, t); await sleep(500); const pn = await T.panel(); return pn && pn.fmt; };
  T.w = async (which, re) => { await T.closePop(); await T.tapMk(which, 300); const r = await T.tapPop(re); await sleep(200); const pn = await T.panel(); return r ? pn.sel : 'no row ' + re + ' ' + JSON.stringify(await T.popTexts()); };
  T.knobList = async (k, re) => { await T.tapMk(k, 300); const r = await T.tapPop(re); await sleep(150); return r ? 'ok' : 'no list item ' + re + ' ' + JSON.stringify(await T.popTexts()); };
  T.sweep = async (k, dy, steps = 60, ms = 30) => { const r = await T.mk(k); if (!r) return 'no knob ' + k; await T.down(r.cx, r.cy); await T.glide(r.cx, r.cy, r.cx, r.cy + dy, steps, ms); await T.up(); await sleep(120); return 'ok'; };
  return T;
}
