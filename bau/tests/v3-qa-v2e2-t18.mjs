// QA V2e′ t18: releasing the dragged part over a control must not activate it (▶ SONG, ● SONG, labels, keyboard, ▦│◧, ⟲)
import { openVp, T, SETUP55, sleep, mkCheck } from './v3-qa-v2e2-lib.mjs';
const VP = process.argv[2] || 'P1';
const {check, done} = mkCheck();
const {b, p, errs, cdp} = await openVp(VP);
const t = T(p, cdp), E = t.E;
await E(SETUP55(false)); await E(() => window.SYNQUENZER.songView(false)); await sleep(300);
const P0 = await t.full();
const state = () => E(() => { const r = window.SYNQUENZER.runtime(); return JSON.stringify({playing: r.playing, songPlay: r.song && r.song.playing, rec: r.songRec || (r.song && r.song.rec) || null, selT: r.selT, glass: window.SYNQUENZER.svLayoutInfo().view, loop: window.SYNQUENZER.song().loop, pop: document.querySelector('#popLayer .pop') ? document.querySelector('#popLayer .pop').className : null, n: window.SYNQUENZER.noteLog(50).length}); });
const s0 = await state(); console.log('s0', s0);
const k0 = await t.key(0);
for (const q of ['.sv-play', '.sv-rec', '.sv-gl', '.sv-home', '.sv-loop', '.sv-sw', '.sv-labs .sv-l.trk', '#kbArea', '#modebar', '.sv-labs .sv-l:last-child']) {
  await E(() => window.SYNQUENZER.clearLog());
  await t.down(k0.x, k0.y); await sleep(1120);
  if (!(await t.songOn())) { console.log('not open'); await t.up(); continue; }
  const r = await t.rect(q);
  if (!r) { console.log('no', q); await t.up(); await sleep(300); continue; }
  const inf = await t.info();
  await t.glide(k0.x, k0.y, inf.canvas.x + 60, inf.canvas.y + 60, 5, 16);
  await t.glide(inf.canvas.x + 60, inf.canvas.y + 60, r.cx, r.cy, 6, 16);
  await t.up(); await sleep(500);
  const s1 = await state();
  const ok = s1 === s0 && (await t.full()) === P0 && !(await t.songOn());
  check(`${VP} release over ${q} → abort, control not activated, clip view`, ok, ok ? '' : s1);
  if (!ok) { await E(() => { const Q = window.SYNQUENZER; Q.songPlay(false); Q.stop && Q.stop(); }); await E(() => window.SYNQUENZER.songView(false)); const pc = await t.rect('#popLayer .pop .ms-x, #popLayer .pop .ps-x'); if (pc) await t.tap(pc.cx, pc.cy); await sleep(300); }
}
check('0 console errors', errs.length === 0, errs);
await b.close();
process.exit(done());
