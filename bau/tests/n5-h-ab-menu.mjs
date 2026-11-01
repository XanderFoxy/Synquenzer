// Typische Fehler 1/4/5 für die Verlauf-Zeilen im Menü: 6 Formate, Trefferfläche via elementFromPoint (≥ 44 x 44), nichts abgeschnitten,
// kein Layout-Sprung bei An/Aus, Löschen (scharf), Projektdatei-Wahl
import { launch, OUT } from './n5-h-ab-lib.mjs';
const VPS = [[390, 844], [375, 667], [320, 568], [844, 390], [667, 375], [926, 428]];
const all = [];
for (const [w, h] of VPS) {
  const {b, p, errs} = await launch({viewport: {width: w, height: h}, mobile: true});
  await p.evaluate(async () => { for (let i = 0; i < 5; i++) { const c = SYNQUENZER.getClip(1, 0); c.notes[0].v = .3 + i / 10; SYNQUENZER.setClip(1, 0, c); await new Promise(r => setTimeout(r, 30)); } });
  await p.waitForTimeout(2600);
  const docH0 = await p.evaluate(() => [document.documentElement.scrollHeight, document.documentElement.scrollWidth]);
  const xy = await p.evaluate(() => { const r = document.getElementById('bMenu').getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; });
  await p.touchscreen.tap(xy[0], xy[1]); await p.waitForTimeout(600);
  const measure = () => p.evaluate(() => {
    const rows = [...document.querySelectorAll('#menu .mrow')].filter(r => /Verlauf|Projektdatei/.test(r.textContent));
    rows[0].scrollIntoView({block: 'center'});
    const btns = rows.flatMap(r => [...r.querySelectorAll('button')]);
    const res = btns.map(bt => {
      const r = bt.getBoundingClientRect();
      // effective hit area: scan a 1-px grid over a 60x60 box around the center; count points whose elementFromPoint is (inside) the button
      let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9; const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
      for (let dx = -40; dx <= 40; dx++) for (let dy = -30; dy <= 30; dy++) { const e = document.elementFromPoint(cx + dx, cy + dy); if (e && (e === bt || bt.contains(e))) { x0 = Math.min(x0, dx); x1 = Math.max(x1, dx); y0 = Math.min(y0, dy); y1 = Math.max(y1, dy); } }
      const ce = document.elementFromPoint(cx, cy);
      return {t: bt.textContent.trim(), w: Math.round(r.width), h: Math.round(r.height), hitW: x1 - x0 + 1, hitH: y1 - y0 + 1, centerHits: !!ce && (ce === bt || bt.contains(ce)), clip: bt.scrollWidth > bt.clientWidth + 1 || bt.scrollHeight > bt.clientHeight + 1, inView: r.left >= 0 && r.right <= innerWidth};
    });
    const texts = rows.flatMap(r => [...r.querySelectorAll('.lbl, .mval, span, div')].filter(e => e.children.length === 0 && e.textContent.trim())).map(e => ({t: e.textContent.trim(), clip: e.scrollWidth > e.clientWidth + 1 && getComputedStyle(e).overflow !== 'visible', font: getComputedStyle(e).fontFamily.slice(0, 30)}));
    const m = document.getElementById('menu'); return {btns: res, texts, menuH: m.scrollHeight, rowH: rows.map(r => Math.round(r.getBoundingClientRect().height))};
  });
  const m0 = await measure();
  const tapT = async txt => { const l = p.locator('#menu button', {hasText: txt}).first(); const bb = await l.boundingBox(); await p.touchscreen.tap(bb.x + bb.width / 2, bb.y + bb.height / 2); await p.waitForTimeout(300); };
  await tapT('Aus'); const mAus = await measure();
  await tapT('An'); const mAn = await measure();
  await tapT('mit Verlauf'); const mMit = await measure();
  await tapT('ohne Verlauf');
  await tapT('Verlauf dieses Projekts löschen'); const mArm = await measure();
  await tapT('Wirklich löschen?'); await p.waitForTimeout(800); const mDel = await measure();
  const sizeTxt = await p.evaluate(() => [...document.querySelectorAll('#menu .mval')].map(x => x.textContent).find(x => /Größe/.test(x)));
  await p.screenshot({path: `${OUT}/n5-h-ab-menu-${w}x${h}.png`});
  await p.evaluate(() => closeMenu()); await p.waitForTimeout(400);
  const docH1 = await p.evaluate(() => [document.documentElement.scrollHeight, document.documentElement.scrollWidth]);
  const small = m0.btns.concat(mArm.btns).filter(x => x.hitW < 44 || x.hitH < 44 || !x.centerHits);
  const clipped = [m0, mAus, mAn, mMit, mArm, mDel].flatMap(m => m.btns.filter(x => x.clip || !x.inView).concat(m.texts.filter(x => x.clip)));
  const jump = [mAus, mAn, mMit, mArm, mDel].map(m => m.menuH - m0.menuH);
  const r = {vp: `${w}x${h}`, small, clipped, menuHdelta: jump, rowH: [m0.rowH, mArm.rowH], docSame: docH0[0] === docH1[0] && docH0[1] === docH1[1] && docH1[1] <= w, sizeTxt, errs: errs.slice(0, 2), btns: m0.btns.map(x => `${x.t} ${x.w}x${x.h} hit ${x.hitW}x${x.hitH}`)};
  all.push(r); console.log(JSON.stringify(r));
  await b.close();
}
console.log('ZUSAMMEN', all.every(r => !r.small.length && !r.clipped.length && r.menuHdelta.every(d => d === 0) && r.docSame && !r.errs.length) ? 'OK' : 'BEFUND');
