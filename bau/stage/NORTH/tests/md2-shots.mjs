// ND2: Bilder für Xander + Platz-Messung (M-PLATZ) in allen 6 Formaten.  node md2-shots.mjs <index.html> <outdir> [quick]
import {createRequire} from 'module'; const {chromium} = createRequire(import.meta.url)('playwright');
import fs from 'fs';
const [file, out, quick] = process.argv.slice(2); fs.mkdirSync(out, {recursive: true});
const FORMATS = quick ? [[390, 844]] : [[390, 844], [375, 667], [320, 568], [844, 390], [667, 375], [926, 428]];
const b = await chromium.launch({args: ['--autoplay-policy=no-user-gesture-required']});
const res = [];
for (const [w, h] of FORMATS) {
  const ctx = await b.newContext({viewport: {width: w, height: h}, hasTouch: true, isMobile: true, deviceScaleFactor: 2});
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(String(e)));
  await p.goto('file://' + file); await p.waitForFunction(() => window.SYNQUENZER && window.SYNQUENZER.version, null, {timeout: 30000}); await p.waitForTimeout(600);
  await p.evaluate(async () => { ensureAudio(); for (const id of ['kick', 'snare', 'hatC', 'hatO']) SYNQUENZER.setPadSource(id, 'md'); R.selT = DRUM_T; openEditor(); ED.dVoice = 0; ED.dTab = 'sound'; MDE.sub = 'tone'; buildDrumEd(); await new Promise(r => setTimeout(r, 300)); });
  const views = [['tone', 'sound'], ['noise', 'sound'], ['click', 'sound'], ['mix', 'sound'], ['fx', 'sound'], [null, 'tief'], ['kit', 'kit'], ['md', 'kit']];
  for (const [sub, tab] of views) {
    const m = await p.evaluate(async ([sub, tab]) => {
      ED.dTab = tab; if (sub && tab === 'sound') MDE.sub = sub; if (tab === 'kit') MDE.kitSub = sub; buildDrumEd(); await new Promise(r => setTimeout(r, 250));
      const sh = EL.drumSheet, body = sh.querySelector('.sh-body'), r = sh.getBoundingClientRect();
      const bad = [], small = [];
      for (const e of sh.querySelectorAll('.pg-md *, .pg-mdk *, .mdkit *')) {
        if (!e.offsetParent && e.tagName !== 'svg') continue;
        const q = e.getBoundingClientRect(); if (!q.width) continue; if (e.closest('.mdov') && !e.matches('.mdov')) continue;
        if ((e.matches('button,.knob,[role=switch]')) && (q.width < 44 || q.height < 44)) small.push(e.className + ' ' + Math.round(q.width) + 'x' + Math.round(q.height));
        if (e.scrollWidth > e.clientWidth + 1 && getComputedStyle(e).overflowX !== 'auto' && !e.matches('.vchips,.mdcats,.mdov,.mdwl')) bad.push((e.className || e.tagName) + ':' + (e.textContent || '').slice(0, 20));
        if (q.right > innerWidth + .5 || q.bottom > r.bottom + .5) bad.push('out:' + (e.className || e.tagName) + ' ' + Math.round(q.right) + '/' + Math.round(q.bottom));
      }
      return {sheetH: Math.round(r.height), bodyH: body.clientHeight, bodyOver: body.scrollHeight - body.clientHeight, fit: body.className, hscroll: document.documentElement.scrollWidth > innerWidth, bad: [...new Set(bad)].slice(0, 8), small: [...new Set(small)].slice(0, 8)};
    }, [sub, tab]);
    res.push({fmt: w + 'x' + h, view: tab + ':' + sub, ...m});
    await p.screenshot({path: `${out}/md2-${w}x${h}-${tab}-${sub}.png`});
  }
  if (errs.length) res.push({fmt: w + 'x' + h, errs});
  await ctx.close();
}
for (const r of res) console.log(JSON.stringify(r));
await b.close();
