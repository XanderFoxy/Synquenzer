// QA VC2a menu: Verlauf rows in 6 layouts — touch targets via elementFromPoint (>= 44x44 hit area), clipping, layout jump on taps
import { open, T, sleep, VPS } from './n5-h-qa-lib.mjs';
const OUT = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/dirigent-test';
const bad = [];
for (const vp of Object.keys(VPS)) {
  const {b, p, errs, cdp} = await open(vp);
  const t = T(p, cdp), E = t.E;
  await E(() => openMenu()); await sleep(400);
  await E(() => { const r = [...document.querySelectorAll('#menu .mrow')].find(r => /^Verlauf/.test(r.textContent)); r.scrollIntoView({block: 'center'}); });
  await sleep(300);
  const meas = () => E(() => {
    const rows = [...document.querySelectorAll('#menu .mrow')].filter(r => /Verlauf|Projektdatei/.test(r.textContent));
    const out = [];
    for (const r of rows) for (const el of r.querySelectorAll('button, .mval, .lbl, span, div')) {
      if (!el.offsetWidth) continue;
      const R = el.getBoundingClientRect(); const isBtn = el.tagName === 'BUTTON';
      let hitW = 0, hitH = 0;
      if (isBtn) {
        const cy = R.top + R.height / 2, cx = R.left + R.width / 2;
        // probe the hit area: how far does elementFromPoint still return this button (or a child)?
        const hit = (x, y) => { const e = document.elementFromPoint(x, y); return e && (e === el || el.contains(e)); };
        let x0 = cx, x1 = cx, y0 = cy, y1 = cy;
        while (x0 > 0 && hit(x0 - 1, cy)) x0--; while (x1 < innerWidth && hit(x1 + 1, cy)) x1++;
        while (y0 > 0 && hit(cx, y0 - 1)) y0--; while (y1 < innerHeight && hit(cx, y1 + 1)) y1++;
        hitW = x1 - x0 + 1; hitH = y1 - y0 + 1;
      }
      out.push({tag: el.tagName, cls: el.className, t: el.textContent.trim().slice(0, 40), w: Math.round(R.width), h: Math.round(R.height), l: Math.round(R.left), r: Math.round(R.right), sw: el.scrollWidth, cw: el.clientWidth, hitW, hitH, btn: isBtn});
    }
    const menu = document.getElementById('menu'); const sc = menu.querySelector('.msc') || menu;
    return {items: out, vw: innerWidth, vh: innerHeight, docH: document.documentElement.scrollHeight, docW: document.documentElement.scrollWidth, scrollH: [...menu.querySelectorAll('*')].reduce((a, e) => Math.max(a, e.scrollHeight > e.clientHeight + 2 && getComputedStyle(e).overflowY !== 'visible' ? e.scrollHeight : 0), 0)};
  });
  const m0 = await meas();
  for (const x of m0.items) {
    if (x.btn && (x.hitW < 44 || x.hitH < 44)) bad.push({vp, why: 'Trefferfläche < 44', x});
    if (x.cw && x.sw > x.cw + 1) bad.push({vp, why: 'abgeschnitten', x});
    if (x.l < 0 || x.r > m0.vw) bad.push({vp, why: 'außerhalb', x});
  }
  console.log(vp, m0.items.filter(x => x.btn).map(x => `${x.t} ${x.w}x${x.h} hit ${x.hitW}x${x.hitH}`).join(' | '), 'docH', m0.docH, 'menuScrollH', m0.scrollH);
  // layout jump: position of the element after the Verlauf block, before/after taps
  const below = () => E(() => { const rows = [...document.querySelectorAll('#menu .mrow, #menu .msec, #menu h3, #menu .mh')]; const del = [...document.querySelectorAll('#menu button')].find(x => /Verlauf dieses|Wirklich/.test(x.textContent)); const r = del.getBoundingClientRect(); const all = [...document.querySelectorAll('#menu *')].filter(e => e.offsetWidth && e.getBoundingClientRect().top > r.bottom + 2); const nx = all[0]; return {delTop: Math.round(r.top), delH: Math.round(r.height), delW: Math.round(r.width), nextTop: nx ? Math.round(nx.getBoundingClientRect().top) : null, nextTxt: nx ? nx.textContent.trim().slice(0, 20) : null, docH: document.documentElement.scrollHeight}; });
  const tapTxt = async re => { const r = await E(s => { const b = [...document.querySelectorAll('#menu button')].find(x => new RegExp(s).test(x.textContent.trim()) && x.offsetWidth); const R = b.getBoundingClientRect(); return {x: R.left + R.width / 2, y: R.top + R.height / 2}; }, re); await t.tap(r.x, r.y, 300); };
  const L0 = await below();
  await tapTxt('^Aus$'); const L1 = await below(); const on1 = await E(() => SYNQUENZER.history().on);
  await tapTxt('^An$'); const L2 = await below(); const on2 = await E(() => SYNQUENZER.history().on);
  await tapTxt('^mit Verlauf$'); const L3 = await below(); const hf = await E(() => !!UI.histFile);
  await tapTxt('^Verlauf dieses Projekts löschen$'); const L4 = await below(); const armedTxt = await E(() => [...document.querySelectorAll('#menu button')].map(x => x.textContent).find(x => /Wirklich/.test(x)) || null);
  const m4 = await meas();
  for (const x of m4.items) { if (x.btn && (x.hitW < 44 || x.hitH < 44)) bad.push({vp, why: 'Trefferfläche < 44 (scharf)', x}); if (x.cw && x.sw > x.cw + 1) bad.push({vp, why: 'abgeschnitten (scharf)', x}); }
  await p.screenshot({path: `${OUT}/n5-h-qa-menu-${vp}-armed.png`});
  await tapTxt('^Wirklich löschen\\?$'); await sleep(800); const L5 = await below();
  const hh = await E(() => SYNQUENZER.history());
  console.log(vp, 'on', on1, on2, 'histFile', hf, 'armed', armedTxt, 'after clear', JSON.stringify(hh));
  const Ls = [L0, L1, L2, L3, L4, L5];
  console.log(vp, 'layout', JSON.stringify(Ls));
  for (const [i, L] of Ls.entries()) if (L.nextTop !== L0.nextTop || L.delH !== L0.delH || L.docH !== L0.docH) bad.push({vp, why: 'Layout-Sprung nach Schritt ' + i, L0, L});
  if (on1 !== false || on2 !== true || !hf || !armedTxt) bad.push({vp, why: 'Bedienung', on1, on2, hf, armedTxt});
  if (errs.length) bad.push({vp, errs});
  await b.close();
}
console.log('BAD', JSON.stringify(bad, null, 1));
