import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
import fs from 'fs';
const [file] = process.argv.slice(2);
const b = await chromium.launch({args: ['--autoplay-policy=no-user-gesture-required']});
const p = await b.newPage({viewport: {width: 428, height: 926}});
await p.goto('file://' + file); await p.waitForTimeout(1200);
await p.addScriptTag({content: fs.readFileSync(new URL('./dsp.js', import.meta.url), 'utf8')});
const r = await p.evaluate(async () => {
  const sr = 24000, res = {};
  const ms = (z, a, b) => { let e = 0; for (let i = Math.round(a * sr); i < Math.round(b * sr); i++) e += z[i] * z[i]; return 10 * Math.log10(e / ((b - a) * sr)); };
  { const P = FX.irParams({decay: 3.2, size: .7, damp: .4, bass: 1, seed: 7, maxLen: 20}); const L = new Float32Array(FX.irLength(sr, P)), Rr = new Float32Array(L.length); const g = FX.irGenerator(sr, P, [L, Rr]); let q; do { q = g.next(); } while (!q.done); for (let i = 0; i < L.length; i++) L[i] *= q.value; res.std = +ms(L, .25, 1.25).toFixed(1); res.stdLate = +ms(L, 2, 3).toFixed(1); }
  for (const rt of [8, 30, 75]) {
    const oc = new OfflineAudioContext(2, Math.round(4 * sr), sr); const [L, Rr] = tktOelIR(sr, 75);
    const buf = oc.createBuffer(2, L.length, sr); buf.copyToChannel(L, 0); buf.copyToChannel(Rr, 1);
    const src = oc.createBufferSource(), ib = oc.createBuffer(1, 64, sr); ib.getChannelData(0)[0] = 1; src.buffer = ib;
    const inp = oc.createGain(); inp.channelCount = 1; inp.channelCountMode = 'explicit'; const cv = oc.createConvolver(); cv.normalize = false; cv.buffer = buf;
    const mix = oc.createGain(); const F = tktFdn(oc); F.set(rt, rt * 1.5, Math.max(1.5, rt * .3), 0);
    src.connect(inp); inp.connect(cv); cv.connect(mix); cv.connect(F.in); F.out.connect(mix); mix.connect(oc.destination); src.start(0);
    const out = (await oc.startRendering()).getChannelData(0); res['oel' + rt] = +ms(out, .25, 1.25).toFixed(1); res['oel' + rt + 'late'] = +ms(out, 2, 3).toFixed(1);
  }
  return res;
});
console.log(JSON.stringify(r));
await b.close();
