import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
const b = await chromium.launch();
const p = await (await b.newContext({viewport: {width: 428, height: 926}, deviceScaleFactor: 2, hasTouch: true, isMobile: true})).newPage();
await p.goto('file://' + process.argv[2]); await p.waitForTimeout(1500);
const r = await p.evaluate(async () => {
  const t = S.tracks.findIndex(z => z.kind === 'synth' && !z.stimme); selectSlot(t, 0); openRoll(t, 0); await new Promise(r => setTimeout(r, 400));
  const f = document.querySelector('#rollSheet .rhead .folc'); const cs = getComputedStyle(f, '::after'), r0 = f.getBoundingClientRect();
  const cx = r0.left + r0.width / 2; const pts = []; for (let y = Math.floor(r0.top) - 6; y <= r0.bottom + 6; y += 1) { const e = document.elementFromPoint(cx, y); pts.push(y + ':' + (e === f || f.contains(e) ? 'F' : (e && (e.className || e.tagName)).toString().slice(0, 20))); }
  return {cls: f.className, content: cs.content, pos: cs.position, top: cs.top, r: [r0.top, r0.bottom], pts, rh: document.querySelector('#rollSheet .rhead').getBoundingClientRect().toJSON()};
});
console.log(JSON.stringify(r));
await b.close();
