// QA musiker VV1 (quer 844×390): after [Sichern] / [Abbrechen] the app toast lies over the Format buttons — does a tap on 16:9 land?
import { open, buildSong, OUTQ } from './n5-v-qm-lib.mjs';
const {b, p, errs} = await open({w: 844, h: 390, touch: true, dpr: 3});
await buildSong(p, {take: false, mk: false, bars: 2});
await p.waitForTimeout(6000);   // the setup toasts are gone
await p.evaluate(() => { SYNQUENZER.vvTest({opus: true}); SYNQUENZER.vvOpen(); }); await p.waitForTimeout(500);
const tapTxt = async t => { const e = await p.$(`#vvSheet button:text-is("${t}")`); const q = await e.boundingBox(); await p.touchscreen.tap(q.x + q.width / 2, q.y + q.height / 2); return q; };
await tapTxt('Video erstellen'); await p.waitForFunction(() => !SYNQUENZER.vvInfo().busy && SYNQUENZER.vvInfo().res, null, {timeout: 120000}); await p.waitForTimeout(300);
await tapTxt('Sichern'); await p.waitForTimeout(400);
const ov = await p.evaluate(() => { const t = EL.toast, tr = t.getBoundingClientRect(), bt = [...document.querySelectorAll('#vvSheet button')].find(x => x.textContent.trim() === '16:9'), br = bt.getBoundingClientRect(); const top = document.elementFromPoint(br.x + br.width / 2, br.y + br.height / 2);
  return {toast: t.textContent, toastRect: [tr.x, tr.y, tr.width, tr.height].map(Math.round), btn: [br.x, br.y, br.width, br.height].map(Math.round), hitIsButton: top === bt || bt.contains(top), hit: top && (top.id || top.className)}; });
await p.screenshot({path: OUTQ + 'toast-L1.png'});
const q = await tapTxt('16:9'); await p.waitForTimeout(300);
console.log(JSON.stringify(Object.assign(ov, {fmtAfterTap: await p.evaluate(() => SYNQUENZER.vvInfo().prefs.fmt)})));
console.log('errors', errs);
await b.close();
