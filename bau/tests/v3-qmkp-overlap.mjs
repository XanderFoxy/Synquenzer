// prints of the plate that overlap each other, an element, or cross a section frame line
import {launch, open, openMk, OUT, panel} from './v3-qmkp-lib.mjs';
const b = await launch();
const page = await open(b, process.argv[2] || 'W');
await openMk(page); await page.waitForTimeout(400);
const res = await page.evaluate(() => {
  const pl = MKUI.PL.el, pr = pl.getBoundingClientRect(), W = pr.width, H = pr.height;
  const R = e => { const q = e.getBoundingClientRect(); return {x0: (q.left - pr.left) / W * 100, x1: (q.right - pr.left) / W * 100, y0: (q.top - pr.top) / H * 100, y1: (q.bottom - pr.top) / H * 100}; };
  // glyph box: use a Range for the text (tighter than the span's line box)
  const G = e => { const rg = document.createRange(); rg.selectNodeContents(e); const q = rg.getBoundingClientRect(); return {x0: (q.left - pr.left) / W * 100, x1: (q.right - pr.left) / W * 100, y0: (q.top - pr.top) / H * 100, y1: (q.bottom - pr.top) / H * 100}; };
  const T = [...pl.querySelectorAll('.mkpt')].map(e => ({t: e.textContent, inv: e.classList.contains('inv'), r: e.classList.contains('inv') ? R(e) : G(e), fs: parseFloat(e.style.fontSize)}));
  const ov = (a, b, m = 0.05) => Math.min(a.x1, b.x1) - Math.max(a.x0, b.x0) > m && Math.min(a.y1, b.y1) - Math.max(a.y0, b.y0) > m;
  const pairs = [];
  for (let i = 0; i < T.length; i++) for (let j = i + 1; j < T.length; j++) if (ov(T[i].r, T[j].r)) pairs.push(T[i].t + (T[i].inv ? '[inv]' : '') + ' × ' + T[j].t + (T[j].inv ? '[inv]' : ''));
  // prints over elements (knobs, keys, LEDs, LCD)
  const E = [...pl.querySelectorAll('.mkpk .cap, .mkpb, .mkpl, .mkplcd')].map(e => ({k: e.dataset.k || (e.parentNode.dataset && e.parentNode.dataset.k) || e.className, r: R(e)}));
  const onEl = []; for (const t of T) for (const e of E) if (ov(t.r, e.r, 0.1)) onEl.push(t.t + (t.inv ? '[inv]' : '') + ' × ' + e.k);
  // prints crossing a section frame (vertical lines x0/x1 within y range, horizontal y0/y1)
  const cross = [];
  for (const q of MKUI.SEC) { const [id, , , , x0, x1, y0, y1] = q;
    for (const t of T) { const r = t.r; const inY = r.y1 > y0 + .2 && r.y0 < y1 - .2, inX = r.x1 > x0 + .2 && r.x0 < x1 - .2;
      if (inY && ((r.x0 < x0 - .05 && r.x1 > x0 + .05) || (r.x0 < x1 - .05 && r.x1 > x1 + .05))) cross.push(t.t + (t.inv ? '[inv]' : '') + ' | ' + id + ' x');
      if (inX && ((r.y0 < y0 - .05 && r.y1 > y0 + .05) || (r.y0 < y1 - .05 && r.y1 > y1 + .05))) cross.push(t.t + (t.inv ? '[inv]' : '') + ' | ' + id + ' y'); } }
  const small = T.filter(t => t.fs / W * 1000 < 7.5).map(t => t.t + ' ' + (t.fs / W * 1000).toFixed(2) + 'u');
  return {n: T.length, pairs, onEl, cross, small};
});
console.log('prints', res.n); console.log('OVERLAP prints:', res.pairs.length, JSON.stringify(res.pairs)); console.log('print over element:', res.onEl.length, JSON.stringify(res.onEl)); console.log('crossing frames:', res.cross.length, JSON.stringify(res.cross)); console.log('tiny (<7.5u):', JSON.stringify(res.small));
await b.close();
