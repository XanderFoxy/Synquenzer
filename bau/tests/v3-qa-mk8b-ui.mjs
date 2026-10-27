// QA MK8b UI flows by touch: Kompakt chip, genre tabs, load (1 undo), reopen opens genre, edited dot + A/B, ⋯ actions close,
// place pop closes by outside tap without side effects, default place, write by touch + plate follows, undo/redo
import {launch, open, tapSel, tapXY, swipe, mkOk, sleep, DIR} from './v3-qa-mk8b-h.mjs';
const FMTS = (process.env.FMTS || 'P1,L1').split(',');
const {ok, fails} = mkOk();
const br = await launch(false);
for (const fmt of FMTS) {
  const {ctx, page, errs} = await open(br, {fmt});
  await page.evaluate(async () => { await SYNQUENZER.libraryReady(); SYNQUENZER.setEngine(0, 'mk'); SYNQUENZER.selectTrack(0); mkLoad(); await MKK.decodeAll(); mkProg.select(2, 3); });
  await page.evaluate(() => SYNQUENZER.openBrowser(0)); await sleep(400);
  const st = () => page.evaluate(() => ({kp: BR.kp, more: BR.more, rows: [...document.querySelectorAll('#sndSheet .brow')].map(r => r.dataset.id), origin: S.tracks[0].sound.origin, undo: UNDO.length,
    pop: !!document.querySelector('.pop'), edited: soundEdited(S.tracks[0].sound), lib: JSON.stringify(SYNQUENZER.library()), pv: PV.on,
    tabs: [...document.querySelectorAll('#sndSheet .brcats .chip')].map(c => (c.classList.contains('on') ? '*' : '') + c.textContent.trim().slice(0, 14))}));
  let s0 = await st();
  ok(fmt + ' library opens on bank B (program loaded)', !s0.kp, JSON.stringify(s0.tabs));
  await tapSel(page, '#sndSheet .brkp');
  let s1 = await st();
  ok(fmt + ' tap Kompakt → genre tab 1, 16 rows', s1.kp === 1 && s1.rows.length === 16 && s1.rows[0] === 'f-mk-k101', JSON.stringify(s1.tabs));
  await tapSel(page, '#sndSheet .brkg[data-g="4"]');
  let s2 = await st();
  ok(fmt + ' tap tab D&B → 16 rows of genre 4', s2.kp === 4 && s2.rows.length === 16 && s2.rows[0] === 'f-mk-k401');
  // tap the name of row 3
  await tapSel(page, '#sndSheet .brow[data-id="f-mk-k403"] [data-act="load"], #sndSheet .brow[data-id="f-mk-k403"] .bmain');
  await sleep(300);
  let s3 = await st();
  ok(fmt + ' tap name loads (1 undo, not edited, list stays)', s3.origin === 'f-mk-k403' && s3.undo === s2.undo + 1 && !s3.edited && s3.kp === 4 && !s3.pv, JSON.stringify({o: s3.origin, u: s3.undo - s2.undo, e: s3.edited, kp: s3.kp}));
  const head = await page.evaluate(() => ({cur: (BR.els.cur || {}).textContent, title: document.querySelector('#sndSheet .sh-title') && document.querySelector('#sndSheet .sh-title').textContent}));
  console.log('   head', JSON.stringify(head));
  // close and reopen → genre tab 4
  await page.evaluate(() => closeBrowser(false)); await sleep(200);
  await page.evaluate(() => SYNQUENZER.openBrowser(0)); await sleep(400);
  let s4 = await st();
  ok(fmt + ' reopen → its genre tab', s4.kp === 4 && s4.rows.includes('f-mk-k403'), JSON.stringify(s4.tabs));
  const cur = await page.evaluate(() => { const r = document.querySelector('#sndSheet .brow[data-id="f-mk-k403"]'); return r && r.className; });
  ok(fmt + ' loaded row is marked', /cur|on|sel/.test(cur || ''), cur);
  // edit a param → edited; A/B
  await page.evaluate(() => { SYNQUENZER.mkSet(0, 't.0.f.cut', 20); }); await sleep(300);
  const e1 = await page.evaluate(() => ({ed: soundEdited(S.tracks[0].sound), dot: [...document.querySelectorAll('#sndSheet .dot, #sndSheet .edot, #sndSheet [class*=edited]')].map(x => x.className + ':' + getComputedStyle(x).display).join(',')}));
  await page.evaluate(() => brRefresh()); 
  ok(fmt + ' knob change → geändert', e1.ed, JSON.stringify(e1));
  await tapSel(page, '#sndSheet .abb'); await sleep(200);
  const ab1 = await page.evaluate(() => ({cut: S.tracks[0].sound.p.mk.t[0].f.cut, eq: JSON.stringify(S.tracks[0].sound.p.mk) === JSON.stringify(factorySound('f-mk-k403').p.mk)}));
  await tapSel(page, '#sndSheet .abb'); await sleep(200);
  const ab2 = await page.evaluate(() => ({cut: S.tracks[0].sound.p.mk.t[0].f.cut}));
  ok(fmt + ' A/B toggles original/edit', ab1.eq && ab2.cut === 20, JSON.stringify([ab1, ab2]));
  // ⋯ actions close on another tap (chip)
  await tapSel(page, '#sndSheet .brow[data-id="f-mk-k405"] .bmore');
  let s5 = await st();
  const acts = await page.evaluate(() => [...document.querySelectorAll('#sndSheet .bacts button')].map(b => b.textContent));
  ok(fmt + ' ⋯ opens [Laden] [Auf Platz schreiben]', s5.more === 'f-mk-k405' && acts.join('|') === 'Laden|Auf Platz schreiben', JSON.stringify(acts));
  await tapSel(page, '#sndSheet .brkg[data-g="5"]');
  let s6 = await st();
  ok(fmt + ' tab tap closes ⋯ actions', !s6.more && !(await page.$('#sndSheet .bacts')), 'more=' + s6.more);
  await tapSel(page, '#sndSheet .brkg[data-g="4"]');
  await tapSel(page, '#sndSheet .brow[data-id="f-mk-k405"] .bmore');
  // ⋯ → Laden
  const u0 = await page.evaluate(() => UNDO.length);
  await tapSel(page, '#sndSheet .bacts [data-act="load"]'); await sleep(300);
  const s7 = await st();
  ok(fmt + ' ⋯ → Laden loads (1 undo), actions close', s7.origin === 'f-mk-k405' && s7.undo === u0 + 1 && !s7.more, JSON.stringify({o: s7.origin, du: s7.undo - u0, more: s7.more}));
  // place pop: default = last loaded place (B03), outside tap closes without writing / loading
  await tapSel(page, '#sndSheet .brow[data-id="f-mk-k406"] .bmore');
  await tapSel(page, '#sndSheet .bacts [data-act="kpw"]'); await sleep(250);
  const pp = await page.evaluate(() => { const p = document.querySelector('.pop.mk8w'); return p && {b: (p.querySelector('.mk8bk .on') || {}).textContent, s: (p.querySelector('.mk8sl .on') || {}).textContent, go: p.querySelector('[data-a="go"]').textContent, inf: p.querySelector('.mk8i').textContent, name: p.querySelector('input').value}; });
  ok(fmt + ' place pop: default = last loaded place B03', pp && pp.b === 'B' && pp.s === '3' && pp.go === 'Auf B03 schreiben', JSON.stringify(pp));
  const lib0 = (await st()).lib, o0 = (await st()).origin;
  // tap outside the pop on a row name (should only close)
  const rr = await page.evaluate(() => { const p = document.querySelector('.pop.mk8w').getBoundingClientRect(); const rows = [...document.querySelectorAll('#sndSheet .brow .bmain')]; for (const r of rows) { const q = r.getBoundingClientRect(); const cx = q.left + 20, cy = q.top + q.height / 2; if (cy > 0 && cy < innerHeight && (cx < p.left || cx > p.right || cy < p.top || cy > p.bottom)) { const e = document.elementFromPoint(cx, cy); return {x: cx, y: cy, id: r.closest('.brow').dataset.id, hit: e && e.className}; } } return null; });
  if (rr) { await tapXY(page, rr.x, rr.y, 400); const s8 = await st();
    ok(fmt + ' outside tap closes place pop, nothing written', !s8.pop && s8.lib === lib0, JSON.stringify({pop: s8.pop, libSame: s8.lib === lib0, origin: s8.origin, tapped: rr.id}));
    console.log('   outside tap on ' + rr.id + ' → origin ' + s8.origin + (s8.origin !== o0 ? ' (LOADED by the closing tap)' : ' (no load)'));
  } else console.log('   no outside row found');
  await page.evaluate(() => closePop());
  // write by touch to C10
  await tapSel(page, '#sndSheet .brow[data-id="f-mk-k406"] .bmore');
  await tapSel(page, '#sndSheet .bacts [data-act="kpw"]'); await sleep(250);
  await tapSel(page, '.pop.mk8w .mk8bk button[data-b="3"]'); await tapSel(page, '.pop.mk8w .mk8sl button[data-s="10"]');
  const before = await page.evaluate(() => ({lib: JSON.stringify(SYNQUENZER.library()), u: UNDO.length, places: Array.from({length: 128}, (_, k) => MKF.progRec(Math.floor(k / 16) + 1, k % 16 + 1).id).join()}));
  await tapSel(page, '.pop.mk8w [data-a="go"]'); await sleep(600);
  const w = await page.evaluate(() => { const own = MKF.ownAt(3, 10); return {own: own && {name: own.name, b: own.bank, s: own.slot, eq: JSON.stringify(own.p.mk) === JSON.stringify(factorySound('f-mk-k406').p.mk)}, u: UNDO.length, places: Array.from({length: 128}, (_, k) => MKF.progRec(Math.floor(k / 16) + 1, k % 16 + 1).id), toast: (document.querySelector('.toast') || {}).textContent, origin: S.tracks[0].sound.origin}; });
  const pb = before.places.split(','); let others = 0; for (let k = 0; k < 128; k++) if (k !== 2 * 16 + 9 && w.places[k] !== pb[k]) others++;
  ok(fmt + ' write to C10 by touch (1 undo, others unchanged)', w.own && w.own.b === 3 && w.own.s === 10 && w.own.eq && w.u === before.u + 1 && others === 0, JSON.stringify({own: w.own, du: w.u - before.u, others, toast: w.toast}));
  // plate select C10 loads the written program
  const sel = await page.evaluate(() => { mkProg.select(3, 10); const c = mkProg.current(); return {c, eq: JSON.stringify(S.tracks[0].sound.p.mk) === JSON.stringify(factorySound('f-mk-k406').p.mk)}; });
  ok(fmt + ' C10 loads the written sound', sel.c && sel.c.label === 'C10' && sel.c.own && sel.eq, JSON.stringify(sel.c));
  // undo select, undo write
  const uw = await page.evaluate(b => { undo(); undo(); const r = {lib: JSON.stringify(SYNQUENZER.library()) === b.lib, own: !!MKF.ownAt(3, 10)}; redo(); r.redo = !!MKF.ownAt(3, 10); return r; }, before);
  ok(fmt + ' undo write deep-equal, redo', uw.lib && !uw.own && uw.redo, JSON.stringify(uw));
  ok(fmt + ' console', errs.length === 0, errs.slice(0, 3).join(' | '));
  await page.screenshot({path: DIR + '/ui-' + fmt + '.png'});
  await ctx.close();
}
await br.close();
console.log(fails() ? 'FAIL ' + fails() : 'ALL PASS');
