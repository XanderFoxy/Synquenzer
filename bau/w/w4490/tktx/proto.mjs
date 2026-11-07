import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
import fs from 'fs';
const [file] = process.argv.slice(2);
const b = await chromium.launch({args: ['--autoplay-policy=no-user-gesture-required']});
const p = await b.newPage({viewport: {width: 428, height: 926}});
const errs = []; p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
await p.goto('file://' + file); await p.waitForTimeout(1200);
await p.addScriptTag({content: fs.readFileSync(new URL('./dsp.js', import.meta.url), 'utf8')});
const r = await p.evaluate(async ({rtMid, gF, sec}) => {
  const sr = 24000, oc = new OfflineAudioContext(2, Math.round(sec * sr), sr);
  const T0 = performance.now(); const [L, Rr] = tktOelIR(sr, 75); const tIR = performance.now() - T0;
  const buf = oc.createBuffer(2, L.length, sr); buf.copyToChannel(L, 0); buf.copyToChannel(Rr, 1);
  const src = oc.createBufferSource(), ib = oc.createBuffer(1, 64, sr); ib.getChannelData(0)[0] = 1; src.buffer = ib;
  const inp = oc.createGain(); inp.channelCount = 1; inp.channelCountMode = 'explicit';
  const cv = oc.createConvolver(); cv.normalize = false; cv.buffer = buf;
  const mix = oc.createGain(), fin = oc.createGain(); fin.gain.value = gF;
  const F = tktFdn(oc); F.set(rtMid, rtMid * 1.5, Math.max(1.5, rtMid * .3), 0);
  src.connect(inp); inp.connect(cv); cv.connect(mix); cv.connect(fin); fin.connect(F.in); F.out.connect(mix); mix.connect(oc.destination);
  src.start(0);
  const T1 = performance.now(); const out = await oc.startRendering(); const tR = performance.now() - T1;
  const x = out.getChannelData(0), y = out.getChannelData(1);
  // Bänder: einfache Biquad-Bandpässe offline (zweite Offline-Runde)
  async function band(f, q) { const o2 = new OfflineAudioContext(1, x.length, sr), bb = o2.createBuffer(1, x.length, sr); bb.copyToChannel(x, 0); const s = o2.createBufferSource(); s.buffer = bb; const bp = o2.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = f; bp.Q.value = q; const bp2 = o2.createBiquadFilter(); bp2.type = 'bandpass'; bp2.frequency.value = f; bp2.Q.value = q; s.connect(bp); bp.connect(bp2); bp2.connect(o2.destination); s.start(); return (await o2.startRendering()).getChannelData(0); }
  function env(z) { const W = Math.round(.25 * sr), out = []; for (let i = 0; i + W <= z.length; i += W) { let e = 0; for (let j = i; j < i + W; j++) e += z[j] * z[j]; out.push(10 * Math.log10(e / W + 1e-30)); } return out; }
  function rt(e, a, z) { const pk = Math.max(...e.slice(0, 12)); let i0 = e.findIndex((v, k) => k > 2 && v < pk - a), i1 = e.findIndex((v, k) => k > i0 && v < pk - z); if (i0 < 0) return null; if (i1 < 0) i1 = e.length - 1; let sx = 0, sy = 0, sxx = 0, sxy = 0, n = 0; for (let k = i0; k <= i1; k++) { const t = k * .25; sx += t; sy += e[k]; sxx += t * t; sxy += t * e[k]; n++; } const sl = (n * sxy - sx * sy) / (n * sxx - sx * sx); return {rt: +(-60 / sl).toFixed(1), from: i0 * .25, to: i1 * .25}; }
  const e125 = env(await band(125, 1.4)), e1k = env(await band(1000, 1.4)), e4k = env(await band(4000, 1.4)), eAll = env(x);
  let en = 0; for (let i = 0; i < x.length; i++) en += x[i] * x[i] + y[i] * y[i];
  return {tIR: Math.round(tIR), tR: Math.round(tR), rt125: rt(e125, 5, 25), rt1k: rt(e1k, 5, 25), rt4k: rt(e4k, 5, 25), energy: +en.toFixed(2), envAll: eAll.filter((_, k) => k % 4 === 0).map(v => Math.round(v)), env125: e125.filter((_, k) => k % 8 === 0).map(v => Math.round(v)), env1k: e1k.filter((_, k) => k % 8 === 0).map(v => Math.round(v)), lvl125vs1k: +((Math.max(...e125.slice(8, 40)) - Math.max(...e1k.slice(8, 40)))).toFixed(1)};
}, {rtMid: +process.argv[3] || 30, gF: +process.argv[4] || .3, sec: +process.argv[5] || 30});
console.log(JSON.stringify(r)); console.log(JSON.stringify(errs));
await b.close();
