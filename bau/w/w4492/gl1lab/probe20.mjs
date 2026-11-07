import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
import path from 'path';
const [f] = process.argv.slice(2);
const b = await chromium.launch();
for (const [W, H] of [[428, 926], [926, 428]]) { const ctx = await b.newContext({viewport: {width: W, height: H}, hasTouch: true}); const p = await ctx.newPage(); await p.goto('file://' + path.resolve(f)); await p.waitForTimeout(1200);
  const r = await p.evaluate(async () => { SYNQUENZER.loadDemo(); S.tracks[0].clips[0] = {len: 1, key: {root: 0, scale: 'ionian', src: 'user'}, notes: [0, 2, 4, 5].map((d, k) => ({t: k, d: .9, n: 48 + d, v: .8})), lf: {dir: 'rev'}}; clipChanged(0, 0); ROLLP.view = 'roll'; openRoll(0, 0); await new Promise(r => setTimeout(r, 600));
    const bar = ED.roll.el.bar, hit = b => { const r = b.getBoundingClientRect(), x = r.left + r.width / 2; let n = 0; for (let y = Math.floor(r.top) - 12; y <= r.bottom + 12; y++) { const e = document.elementFromPoint(x, y); if (e && (e === b || b.contains(e))) n++; } return {h: Math.round(r.height), hit: n}; };
    const bs = [...bar.children].filter(e => e.tagName === 'BUTTON').slice(0, 6); const bc = getComputedStyle(bar), br = bar.getBoundingClientRect();
    return {bar: {h: Math.round(br.height), ov: bc.overflowX + '/' + bc.overflowY, pad: bc.padding}, btns: bs.map(b => b.textContent.trim().slice(0, 10) + ':' + JSON.stringify(hit(b))), after: getComputedStyle(bs[0], '::after').content}; });
  console.log(W, H, JSON.stringify(r)); await ctx.close(); }
await b.close();
