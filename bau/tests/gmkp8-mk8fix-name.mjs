// G-MKP8 copy of v3-mk8fix-name.mjs: quer (L1, L2) the panel's 44-px header has no „Sichern“ (H-17), WRITE on the plate opens the pop.
// MK8-fix repro/verify: MS 2000 Sichern popup (.pop.mk8w) – a tap on the name field focuses it, typed name is written,
// place keys still act by touch, no tap-through after "Auf .. schreiben", finger scroll inside the pop. Usage: node v3-mk8fix-name.mjs [file]
import {launch, open} from './v3-qa8-lib.mjs';
const file = process.argv[2];
const sleep = ms => new Promise(r => setTimeout(r, ms));
const b = await launch(); let bad = 0;
for (const f of ['P1', 'P3', 'L1', 'L2']) {
  for (const mode of ['tap', 'cdp']) {
    const {ctx, page: p, errs} = await open(b, f, file);
    const cdp = await ctx.newCDPSession(p);
    const tch = async sel => { const r = await p.evaluate(s => { const e = document.querySelector(s); if (!e) return null; e.scrollIntoView({block: 'nearest'}); const q = e.getBoundingClientRect(); return {x: q.x + Math.min(20, q.width / 2), y: q.y + q.height / 2}; }, sel); if (!r) throw new Error('missing ' + sel);
      if (mode === 'tap') await p.touchscreen.tap(r.x, r.y);
      else { await cdp.send('Input.dispatchTouchEvent', {type: 'touchStart', touchPoints: [{x: r.x, y: r.y, id: 1}]}); await sleep(50); await cdp.send('Input.dispatchTouchEvent', {type: 'touchEnd', touchPoints: []}); } };
    await p.evaluate(async () => { await document.fonts.ready; await SYNQUENZER.libraryReady(); SYNQUENZER.setEngine(0, 'mk'); SYNQUENZER.selectTrack(0); SYNQUENZER.openEditor(); });
    await sleep(400);
    // load A05 with ‹ › (step from A04)
    await p.evaluate(() => { mkProg.select(1, 4); mkProg.step(1); });
    await sleep(300);
    const c0 = await p.evaluate(() => mkProg.current() && mkProg.current().text);
    await p.evaluate(() => SYNQUENZER.mkSet(0, 't.0.f.cut', 60)); await sleep(200);
    if (f[0] === 'L') { await p.waitForFunction(() => window.MKUI && MKUI.PL.ready); await p.evaluate(() => { MKUI.P.mode = 'spiel'; MKUI.view({ansicht: 'ganz'}); }); await sleep(300);
      const r = await p.evaluate(() => { const e = SYNQUENZER.mkPanel().elements.find(x => x.id === 'write'); return {x: e.px.x + e.px.w / 2, y: e.px.y + e.px.h / 2}; });
      if (mode === 'tap') await p.touchscreen.tap(r.x, r.y); else { await cdp.send('Input.dispatchTouchEvent', {type: 'touchStart', touchPoints: [{x: r.x, y: r.y, id: 1}]}); await sleep(50); await cdp.send('Input.dispatchTouchEvent', {type: 'touchEnd', touchPoints: []}); }
      await sleep(400); }
    else { await tch('#synthSheet .sh-head .hb.sv'); await sleep(400); }
    // tap slot 6 then slot 5 by touch (place keys still act)
    await tch('.pop.mk8w .mk8sl button[data-s="6"]'); await sleep(150);
    const s6 = await p.evaluate(() => document.querySelector('.pop.mk8w [data-a="go"]').textContent);
    await tch('.pop.mk8w .mk8sl button[data-s="5"]'); await sleep(150);
    await tch('.pop.mk8w input.tin'); await sleep(300);
    const st = await p.evaluate(() => { const i = document.querySelector('.pop.mk8w input.tin'); const cs = getComputedStyle(i); return {foc: document.activeElement === i, fs: parseFloat(cs.fontSize), ff: cs.fontFamily.slice(0, 40), selAll: i.selectionStart === 0 && i.selectionEnd === i.value.length}; });
    await p.keyboard.type('Mein Lead'); await sleep(100);
    const val = await p.evaluate(() => document.querySelector('.pop.mk8w input.tin').value);
    // count clicks reaching anything outside the pop within 700 ms of the write tap (tap-through)
    await p.evaluate(() => { window.__tt = []; window.addEventListener('click', e => { if (!(e.target.closest && e.target.closest('.pop'))) window.__tt.push(e.target.tagName + '.' + e.target.className); }, false); });
    await tch('.pop.mk8w [data-a="go"]'); await sleep(800);
    const r = await p.evaluate(() => ({name: mkProg.current() && mkProg.current().text, pop: !!document.querySelector('.pop.mk8w'), tt: window.__tt.slice()}));
    const ok = c0 === 'A05:' + c0.slice(4) && s6.includes('A06') && st.foc && val === 'Mein Lead' && r.name === 'A05:Mein Lead' && !r.pop && st.fs >= 16 && r.tt.length === 0 && errs.length === 0;
    if (!ok) bad++;
    console.log(f.padEnd(3), mode.padEnd(4), ok ? 'OK ' : 'BAD', '| loaded', c0, '| slot6', JSON.stringify(s6), '| focus', st.foc, 'font', st.fs + 'px', st.ff, 'selAll', st.selAll, '| value', JSON.stringify(val), '| written', r.name, '| popClosed', !r.pop, '| tapThrough', JSON.stringify(r.tt), '| errs', errs.length, errs.slice(0, 2).join(' ; '));
    await ctx.close();
  }
}
await b.close();
console.log(bad ? 'FAIL ' + bad : 'ALL OK');
process.exit(bad ? 1 : 0);
