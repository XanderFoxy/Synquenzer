import {launch, open, openMk} from './v3-qmkp-lib.mjs';
const [file, out] = [process.argv[2], process.argv[3]];
const b = await launch();
const page = await open(b, 'X', {file, dpr: 2});
await page.waitForTimeout(800); await openMk(page); await page.waitForTimeout(700);
const mark = (pts) => page.evaluate(pts => {
  document.querySelectorAll('.hilfe-m').forEach(e => e.remove());
  for (const [n, x, y, r] of pts) { const d = document.createElement('div'); d.className = 'hilfe-m';
    d.style.cssText = `position:fixed;left:${x - r}px;top:${y - r}px;width:${2 * r}px;height:${2 * r}px;border:3px solid #ff2d55;border-radius:50%;z-index:99999;pointer-events:none;box-shadow:0 0 6px #ff2d55`;
    const t = document.createElement('div'); t.textContent = n; t.style.cssText = `position:absolute;right:-12px;top:-12px;width:20px;height:20px;border-radius:50%;background:#ff2d55;color:#fff;font:700 13px/20px sans-serif;text-align:center`;
    d.appendChild(t); document.body.appendChild(d); } }, pts);
// Mod-Seq: 1 REC, 2 CUTOFF knob
const knob = await page.evaluate(() => { const L = [...document.querySelectorAll('#synthSheet .mkpk')].map(e => e.getBoundingClientRect()).filter(r => r.x > 370 && r.x < 420 && r.y < 140); return L.length ? [L[0].x + L[0].width / 2, L[0].y + L[0].height / 2] : null; });
const btn = (x, y) => page.evaluate(([x, y]) => { const L = [...document.querySelectorAll('#synthSheet .mkpb')].map(e => e.getBoundingClientRect()); let best = null, d0 = 1e9; for (const r of L) { const cx = r.x + r.width / 2, cy = r.y + r.height / 2, d = Math.hypot(cx - x, cy - y); if (d < d0) { d0 = d; best = [cx, cy]; } } return best; }, [x, y]);
const rec = await btn(340, 280), bankUp = await btn(149, 392), k9 = await btn(524, 385);
console.log(JSON.stringify({knob, rec, bankUp, k9}));
await mark([[1, rec[0], rec[1], 16], [2, knob[0], knob[1], 18]]);
await page.screenshot({path: out + '-modseq.png'});
await mark([[1, bankUp[0], bankUp[1], 16], [2, k9[0], k9[1], 16]]);
await page.screenshot({path: out + '-vocoder.png'});
await b.close();
