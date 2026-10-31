// QA VV2-05: Video sheet with the new row „9:16“ in 6 layouts: ≥ 44 × 44 (elementFromPoint), in view, nothing clipped, no jump on 9:16 ↔ 16:9 / Kamera ↔ Balken
import { open } from './n5-v-lib.mjs';
const SONG16 = {bars: 16, lanes: [[{bar: 0, slot: 0}, {bar: 8, slot: 1}], [{bar: 0, slot: 0}], [{bar: 2, slot: 0}, {bar: 14, slot: -1}], [], [{bar: 0, slot: 0}, {bar: 8, slot: 1}], []],
  carrier: [], mel: {}, marks: [{id: 'm1', a: 0, len: 8, name: 'Strophe'}, {id: 'm2', a: 8, len: 8, name: 'Refrain'}]};
const SZ = {P1: [390, 844], P2: [375, 667], P3: [320, 568], L1: [844, 390], L2: [667, 375], W: [926, 428]};
const OUT = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/dirigent-test/n5-v-qa2-out/';
const geo = p => p.evaluate(() => {
  const out = {bad: [], rects: {}};
  const sh = document.getElementById('vvSheet'); const q0 = sh.getBoundingClientRect(); out.sheet = [q0.left, q0.top, q0.right, q0.bottom].map(Math.round);
  for (const e of sh.querySelectorAll('button')) {
    if (!e.getClientRects().length || getComputedStyle(e).visibility === 'hidden') continue;
    const q = e.getBoundingClientRect(), nm = (e.textContent || e.getAttribute('aria-label') || '').trim().slice(0, 18); out.rects[nm] = [q.left, q.top, q.width, q.height].map(v => +v.toFixed(1));
    if (q.width < 43.5 || q.height < 43.5) out.bad.push('small ' + nm + ' ' + q.width.toFixed(1) + 'x' + q.height.toFixed(1));
    if (q.left < -.5 || q.top < -.5 || q.right > innerWidth + .5 || q.bottom > innerHeight + .5) out.bad.push('out ' + nm);
    const rg = document.createRange(); rg.selectNodeContents(e); const tw = rg.getBoundingClientRect().width; if (tw > q.width - 2) out.bad.push('clip ' + nm + ' ' + tw.toFixed(1) + '/' + q.width.toFixed(1));
    const cx = q.left + q.width / 2, cy = q.top + q.height / 2;
    for (const [dx, dy] of [[0, 0], [-21, -21], [21, 21]]) { const h = document.elementFromPoint(cx + dx, cy + dy); if (!h || (h !== e && !e.contains(h))) out.bad.push('hit ' + nm + ' @' + dx + ',' + dy + ' → ' + (h ? h.tagName + '.' + h.className : 'null')); }
  }
  for (const e of sh.querySelectorAll('.lbl')) { const rg = document.createRange(); rg.selectNodeContents(e); if (rg.getBoundingClientRect().width > e.getBoundingClientRect().width + .5) out.bad.push('clip lbl ' + e.textContent); }
  const ctl = sh.querySelector('.vvctl'); out.ctlScroll = ctl.scrollHeight > ctl.clientHeight + 1 ? ctl.scrollHeight + '>' + ctl.clientHeight : null;
  out.docH = document.documentElement.scrollHeight;
  return out;
});
for (const n of Object.keys(SZ)) {
  const [w, h] = SZ[n];
  const {b, p, errs} = await open({w, h, touch: true, dpr: 3});
  await p.evaluate(s => { SYNQUENZER.setSong(s); SYNQUENZER.vvPrefs({fmt: '9:16', view: 'auto', cam: 'kamera'}); SYNQUENZER.vvOpen(); }, SONG16); await p.waitForTimeout(700);
  const g1 = await geo(p);
  // tap „Ganz mit Balken“, then 16:9 (the row greys), compare positions
  const tapTxt = async t => { const c = await p.evaluate(t => { const e = [...document.querySelectorAll('#vvSheet button')].find(x => x.textContent.trim() === t); if (!e) return null; const q = e.getBoundingClientRect(); return [q.left + q.width / 2, q.top + q.height / 2]; }, t); if (c) { await p.touchscreen.tap(c[0], c[1]); await p.waitForTimeout(400); } return !!c; };
  await tapTxt('Ganz mit Balken'); const camB = await p.evaluate(() => SYNQUENZER.vvPrefs().cam); const g2 = await geo(p);
  await tapTxt('16:9'); const g3 = await geo(p); const dis = await p.evaluate(() => [...document.querySelectorAll('#vvSheet button')].filter(e => /Kamera|Balken/.test(e.textContent)).map(e => e.disabled));
  await tapTxt('9:16'); await tapTxt('Kamera');
  const moved = []; for (const k of Object.keys(g1.rects)) { const a = g1.rects[k], c = g3.rects[k]; if (c && (Math.abs(a[0] - c[0]) > .5 || Math.abs(a[1] - c[1]) > .5 || Math.abs(a[3] - c[3]) > .5)) moved.push(k); }
  await p.screenshot({path: OUT + `sheet-${n}.png`});
  console.log(n, JSON.stringify({bad1: g1.bad, bad2: g2.bad, bad3: g3.bad.filter(x => !/^hit (Kamera|Ganz)/.test(x)), camB, segDisabledAt169: dis, moved, ctlScroll: [g1.ctlScroll, g3.ctlScroll], docH: [g1.docH, g3.docH], errs}));
  await b.close();
}
