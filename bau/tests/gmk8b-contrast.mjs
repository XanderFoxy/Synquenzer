// QA FP-TOUCH: WCAG contrast of the new texts (vocoder hint, genre tabs on/off, Micro chip, row sub-label), ⓘ of a Micro row
import {launch, open, mkOk, sleep, DIR, tapSel} from './gmk8b-h.mjs';
const {ok, fails} = mkOk();
const br = await launch(false);
for (const scheme of ['dark', 'light']) {
  const ctx = await br.newContext({viewport: {width: 390, height: 844}, hasTouch: true, isMobile: true, colorScheme: scheme});
  const {page, errs} = await open(br, {ctx});
  await page.evaluate(async () => { await SYNQUENZER.libraryReady(); SYNQUENZER.setEngine(0, 'mk'); SYNQUENZER.selectTrack(0); mkLoad(); await MKK.decodeAll(); SYNQUENZER.openBrowser(0); });
  await sleep(300); await tapSel(page, '#sndSheet .brkp'); await tapSel(page, '#sndSheet .brkg[data-g="8"]');
  const r = await page.evaluate(() => {
    const parse = c => { const m = c.match(/rgba?\(([^)]+)\)/); if (!m) return null; const v = m[1].split(',').map(Number); return {r: v[0], g: v[1], b: v[2], a: v.length > 3 ? v[3] : 1}; };
    const bgOf = e => { const layers = []; for (let x = e; x; x = x.parentElement) { const c = parse(getComputedStyle(x).backgroundColor); if (c && c.a > 0) { layers.push(c); if (c.a >= 1) break; } } let base = {r: 0, g: 0, b: 0}; if (!layers.length || layers[layers.length - 1].a < 1) base = parse(getComputedStyle(document.body).backgroundColor) || {r: 0, g: 0, b: 0}; for (let i = layers.length - 1; i >= 0; i--) { const c = layers[i]; base = {r: c.r * c.a + base.r * (1 - c.a), g: c.g * c.a + base.g * (1 - c.a), b: c.b * c.a + base.b * (1 - c.a)}; } return base; };
    const lum = c => { const f = v => { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); }; return .2126 * f(c.r) + .7152 * f(c.g) + .0722 * f(c.b); };
    const cr = e => { const fg = parse(getComputedStyle(e).color), bg = bgOf(e); const fgm = {r: fg.r * fg.a + bg.r * (1 - fg.a), g: fg.g * fg.a + bg.g * (1 - fg.a), b: fg.b * fg.a + bg.b * (1 - fg.a)}; const a = lum(fgm), b = lum(bg); return +((Math.max(a, b) + .05) / (Math.min(a, b) + .05)).toFixed(2); };
    const o = {};
    const v = document.querySelector('#sndSheet .mkkvoc'); if (v) o.hint = [cr(v), getComputedStyle(v).fontSize];
    for (const c of document.querySelectorAll('#sndSheet .brkg, #sndSheet .brkp')) { const s = [...c.querySelectorAll('span')].find(x => getComputedStyle(x).display !== 'none') || c; o['chip ' + c.textContent.trim().slice(0, 8) + (c.classList.contains('on') ? ' on' : '')] = [cr(s), getComputedStyle(s).fontSize]; }
    const row = document.querySelector('#sndSheet .brow .bmain'); if (row) for (const t of row.querySelectorAll('b, span, small')) o['row ' + t.textContent.trim().slice(0, 14)] = [cr(t), getComputedStyle(t).fontSize];
    return o;
  });
  for (const [k, [c, fs]] of Object.entries(r)) { const need = parseFloat(fs) >= 18.66 ? 3 : 4.5; ok(scheme + ' ' + k + ' contrast ' + c + ' (' + fs + ')', c >= need, 'need ' + need); }
  // ⓘ of a Micro row
  await tapSel(page, '#sndSheet .brow[data-id="f-mk-k801"] .binfo', 300);
  const inf = await page.evaluate(() => { const p = document.querySelector('.pop, .tip, .binfotxt, #sndSheet .btip'); return p && p.textContent.slice(0, 160); });
  ok(scheme + ' ⓘ shows the info text', inf && /Mikrofon/.test(inf), inf);
  ok(scheme + ' console', errs.length === 0, errs.slice(0, 2).join(' | '));
  await ctx.close();
}
await br.close();
console.log(fails() ? 'FAIL ' + fails() : 'ALL PASS');
