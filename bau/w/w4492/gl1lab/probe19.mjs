import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
import path from 'path';
const [f] = process.argv.slice(2);
const b = await chromium.launch();
for (const [W, H] of [[428, 926], [926, 428], [390, 844], [375, 667]]) { const ctx = await b.newContext({viewport: {width: W, height: H}}); const p = await ctx.newPage(); await p.goto('file://' + path.resolve(f)); await p.waitForTimeout(1200);
  const r = await p.evaluate(async () => { SYNQUENZER.loadDemo(); SYNQUENZER.songFromChain([{scene: 0, bars: 4}, {scene: 1, bars: 4}]); setSongView(true); const out = {}; for (const lp of [null, {on: true, a: 0, b: 4}, {on: true, a: 2, b: 5}, {on: true, a: 8, b: 16}]) { if (lp) S.song.loop = lp; songChanged(); await new Promise(r => setTimeout(r, 300)); const B = SV.btn.bLoop, v = B.lastChild, cs = getComputedStyle(B); out[lp ? lp.a + '-' + lp.b : 'aus'] = {txt: v.textContent, w: v.offsetWidth, inner: B.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight), ov: cs.overflow, ws: getComputedStyle(v).whiteSpace}; } return out; });
  console.log(W, H, JSON.stringify(r)); await ctx.close(); }
await b.close();
