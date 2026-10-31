// QA musiker VV2: Refrain → [Matrix] in the Marken-Blatt (toast „Video Takt 7–10: Matrix [Rückgängig]“), ✕, Menü → Video, tap [16:9]
// (and the other sheet buttons under the toast): does the tap reach the sheet? argv P | L, APP env (pre-VV2 build for comparison)
import { open, buildSong } from './n5-v-q2-qmlib.mjs';
const L = process.argv[2] === 'L', [W, H] = L ? [844, 390] : [390, 844];
const {b, p, errs} = await open({w: W, h: H, touch: true, dpr: 3});
await buildSong(p); await p.waitForTimeout(6000);   // the chord toast of the setup is gone
const tapSel = async (s, w = 400) => { const e = await p.$(s); const q = await e.boundingBox(); await p.touchscreen.tap(q.x + q.width / 2, q.y + q.height / 2); await p.waitForTimeout(w); };
const hasVV = await p.evaluate(() => typeof vvDirSet === 'function');
await p.evaluate(() => setSongView(true)); await p.waitForTimeout(500);
if (hasVV) { await p.evaluate(() => openMarkSheet(S.song.marks.find(m => m.name === 'Refrain').id)); await p.waitForTimeout(400); await tapSel('.pop .vvdr button[data-a="vv-matrix"]'); await tapSel('.pop .ms-x'); }
else { await p.evaluate(() => SYNQUENZER.markAction(S.song.marks.find(m => m.name === 'Refrain').id, 'rep', 2) && toast('Refrain ×2', songUndoAct())); await p.waitForTimeout(400); }
const t0 = Date.now();
await tapSel('#bMenu'); await tapSel('#menu button[aria-label="Video des Songs erstellen"]', 500);
const geo = await p.evaluate(() => { const t = document.querySelector('#toast'); const q = t && t.getBoundingClientRect(); const vis = t && getComputedStyle(t).visibility !== 'hidden' && getComputedStyle(t).opacity !== '0' && q.height > 0;
  const under = []; for (const e of document.querySelectorAll('#vvSheet button')) { const r = e.getBoundingClientRect(); const h = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); if (h && h !== e && !e.contains(h)) under.push(e.textContent.trim() + ' → ' + (h.closest('#toast') ? 'TOAST ' + h.textContent.trim().slice(0, 30) : h.tagName)); }
  return {toast: vis ? {txt: t.innerText.replace(/\n/g, ' | '), box: [q.left, q.top, q.right, q.bottom].map(Math.round)} : null, under, fmt: vvPrefs().fmt}; });
await p.screenshot({path: '/home/user/Synquenzer/bau/helfer/VIDSTAGE/tests/out/n5-v-q2-out/toast-' + (L ? 'L' : 'P') + '.png'});
const e = await p.$('#vvSheet button:text-is("16:9")'); if (!e) { console.log('kein 16:9', JSON.stringify(geo), await p.evaluate(() => ({open: VV.open, pop: UI.pop && UI.pop.name, menu: !document.getElementById('menu').hidden}))); await b.close(); process.exit(0); } const q = await e.boundingBox();
await p.touchscreen.tap(q.x + q.width / 2, q.y + q.height / 2); await p.waitForTimeout(500);
const after = await p.evaluate(() => ({fmt: vvPrefs().fmt, video: S.song.video || null}));
console.log(JSON.stringify({L, hasVV, msSinceToast: Date.now() - t0, geo, tap16x9: q && [Math.round(q.x), Math.round(q.y)], after, errs}));
await b.close();
