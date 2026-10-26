import {launch, openApp} from './v3-qa-mk2-lib.mjs';
const b = await launch(); const {page, errs} = await openApp(b, new URL('../mk-wt/index.html', import.meta.url).pathname);
const r = await page.evaluate(async () => {
  SYNQUENZER.setEngine(0, 'mk'); SYNQUENZER.selectTrack(0); SYNQUENZER.openEditor(); await new Promise(r => setTimeout(r, 500));
  MKUI.setWahl(1, 2); const out = [];
  for (let w = 0; w <= 7; w++) { SYNQUENZER.mkSet(0, 't.0.o1.w', w); MKUI.render && MKUI.render(); const K = MKUI.knobs(); const t = [];
    for (const i of [0, 1, 2]) { if (!K[i]) { t.push(null); continue; } MKUI.lcdOf(K[i]); t.push(ED.lcd.innerText.replace(/\s+/g, ' ')); } out.push([w, t]); }
  return out;
});
for (const [w, t] of r) console.log('wave', w, '|', t.join(' || '));
console.log('errors', errs.length);
await b.close();
