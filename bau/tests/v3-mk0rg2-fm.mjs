// QA regression MK0: FM editor walk (all visible tabs/sub-tabs on track 1 = FM), knob drag on an FM page; WT editor walk; base vs new
import { open, NEW, BASE, OUT } from './v3-mk0rg2-lib.mjs';
import fs from 'fs';
const [which, vp] = process.argv.slice(2);
const {p, errs, close} = await open(which === 'base' ? BASE : NEW, vp, false);
const r = {walk: {}};
const snap = () => p.evaluate(() => { const pg = document.querySelector('.pg'); return {cls: pg && pg.className, knobs: [...document.querySelectorAll('.pg .knob')].filter(x => x.offsetParent).map(x => x.dataset.key).join(','), canv: [...document.querySelectorAll('.pg canvas, .pg svg')].filter(x => x.offsetParent).length, btn: [...document.querySelectorAll('.pg button')].filter(x => x.offsetParent).length}; });
for (const [t, eng] of [[1, 'fm'], [2, 'wt']]) {
  await p.evaluate(([t, eng]) => { const Q = window.SYNQUENZER; Q.closeEditor && Q.closeEditor(); if (Q.getSound(t).engine !== (eng === 'fm' ? 'fm6' : eng)) Q.setEngine(t, eng); Q.selectSlot(t, 0); Q.openEditor(); }, [t, eng]);
  await p.waitForTimeout(500);
  const tabs = await p.evaluate(() => { const all = [...document.querySelectorAll('button')].filter(x => x.offsetParent && x.closest('.ed, #ed, .sheet, .edsheet, body') && /^(OSZ|OP|ALGO|FILTER|HÜLLK\.|LFO|MOD|FX|FELD|DX)$/.test(x.textContent.trim())); return all.map(x => x.textContent.trim()); });
  r.walk[eng + '-tabs'] = tabs;
  for (const tb of tabs) {
    await p.evaluate(tb => { const b = [...document.querySelectorAll('button')].find(x => x.offsetParent && x.textContent.trim() === tb); if (b) b.setAttribute('data-qa4', '1'); }, tb);
    await p.click('[data-qa4="1"]', {timeout: 3000}).catch(() => {}); await p.waitForTimeout(200);
    await p.evaluate(() => { const e = document.querySelector('[data-qa4]'); if (e) e.removeAttribute('data-qa4'); });
    r.walk[eng + '-' + tb] = await snap();
    // sub-tabs (second row): click each visible one with a short label in the sub row
    const subs = await p.evaluate(() => { const row = [...document.querySelectorAll('.subtabs, .sub, .edsub, .seg2')].find(x => x.offsetParent); return row ? [...row.querySelectorAll('button')].filter(x => x.offsetParent).map(x => x.textContent.trim()) : []; });
    for (const s of subs.slice(0, 8)) {
      await p.evaluate(s => { const row = [...document.querySelectorAll('.subtabs, .sub, .edsub, .seg2')].find(x => x.offsetParent); const b = row && [...row.querySelectorAll('button')].find(x => x.offsetParent && x.textContent.trim() === s); if (b) b.setAttribute('data-qa5', '1'); }, s);
      await p.click('[data-qa5="1"]', {timeout: 3000}).catch(() => {}); await p.waitForTimeout(150);
      await p.evaluate(() => { const e = document.querySelector('[data-qa5]'); if (e) e.removeAttribute('data-qa5'); });
      r.walk[eng + '-' + tb + '/' + s] = await snap();
    }
  }
  r[eng + 'fmUi'] = await p.evaluate(() => JSON.stringify(window.SYNQUENZER.fmUi()));
}
r.te = await p.evaluate(() => window.SYNQUENZER.tickErrors()); r.errs = errs.slice();
fs.writeFileSync(OUT + `fm-${which}-${vp}.json`, JSON.stringify(r, null, 1)); console.log(which, vp, 'done', Object.keys(r.walk).length); await close();
