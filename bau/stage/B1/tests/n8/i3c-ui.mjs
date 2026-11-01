// I3c / I3d in Chromium with touch: LFO page ✎ (first tap: shape 5, TAKT 1/1, start triangle, one undo, the sheet opens), drawing
// a stroke (one undo, the form follows, glide), pointercancel (form unchanged), a tap changes nothing, library pick (copy, one undo),
// layout 428x926 / 926x428 / 428x650 (keys >= 44 px, nothing cut, field >= 120 px, page and editor height +-0 px), block loaded on
// demand only. node i3c-ui.mjs [index.html]
import {chromium} from 'playwright';
import path from 'path'; import {fileURLToPath} from 'url';
const HERE = path.dirname(fileURLToPath(import.meta.url));
const FILE = path.resolve(process.argv[2] || path.join(HERE, '../../index.html'));
const SHOT = process.env.SHOTS || '';
let fails = 0; const ok = (id, c, info) => { if (!c) fails++; console.log((c ? 'PASS ' : 'FAIL ') + id + (info ? ' — ' + info : '')); };
const b = await chromium.launch({args: ['--autoplay-policy=no-user-gesture-required']});
for (const [W, H] of [[428, 926], [926, 428], [428, 650]]) {
  const ctx = await b.newContext({viewport: {width: W, height: H}, hasTouch: true, isMobile: true, deviceScaleFactor: 2});
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto('file://' + FILE); await p.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.storage().booted, null, {timeout: 30000});
  const tag = W + '×' + H;
  const blk0 = await p.evaluate(() => ({form: typeof FORMCLEAN, ui: typeof FUI, sr: typeof NEIGEN}));
  if (W === 428 && H === 926) ok('A.13 sq-form-src / sq-sr-src nicht beim Start ausgewertet', blk0.form === 'undefined' && blk0.ui === 'undefined' && blk0.sr === 'undefined');
  // open the synth editor of track 0 on LFO 1
  await p.evaluate(async () => { ensureAudio(); await new Promise(r => setTimeout(r, 300)); R.selT = 0; ED.tab = 'lfo'; ED.sub.lfo = 'l1'; openEditor(); await new Promise(r => setTimeout(r, 300)); });
  const h0 = await p.evaluate(() => ({app: document.documentElement.scrollHeight, ed: EL.synthSheet.getBoundingClientRect().height, kb: (document.getElementById('kbArea') || {getBoundingClientRect: () => ({height: 0})}).getBoundingClientRect().height}));
  const seg = await p.evaluate(() => { const s = document.querySelector('[data-key="l1shape"]'); if (!s) return null; const bt = [...s.querySelectorAll('button')]; const last = bt[bt.length - 1]; const r = last.getBoundingClientRect(), r0 = bt[1].getBoundingClientRect(); return {n: bt.length, w: r.width, h: r.height, w0: r0.width, h0: r0.height, x: r.left + r.width / 2, y: r.top + r.height / 2, t: last.textContent}; });
  ok(tag + ' I3-23 ✎ in der Form-Leiste, so groß wie die vorhandenen Felder', seg && seg.n === 6 && seg.t.includes('✎') && seg.w >= seg.w0 - .5 && seg.h >= seg.h0 - .5, seg ? seg.n + ' Felder, ✎ ' + Math.round(seg.w) + '×' + Math.round(seg.h) + ' (Nachbar ' + Math.round(seg.w0) + '×' + Math.round(seg.h0) + ', Befund: Leiste schon in 4.30.0 < 44 px)' : 'fehlt');
  if (!seg) { await ctx.close(); continue; }
  const u0 = await p.evaluate(() => UNDO.length);
  await p.touchscreen.tap(seg.x, seg.y); await p.waitForTimeout(400);
  const st1 = await p.evaluate(u0 => { const P = S.tracks[0].sound.p; const s = SYNQUENZER.form.state(); return {shape: P.l1shape, sync: P.l1sync, f: P.l1f, undo: UNDO.length - u0, open: s.open, info: s.info}; }, u0);
  ok(tag + ' I3-23 erster Tipp: Form 5, TAKT 1/1, Start-Dreieck, ein Undo', st1.shape === 5 && st1.sync === 4 && st1.f && st1.f.k.length === 3 && st1.undo === 1, 'Undo ' + st1.undo);
  ok(tag + ' I3-17 Form-Blatt öffnet aus ✎', st1.open, st1.info);
  const L = await p.evaluate(() => SYNQUENZER.form.state());
  if (L.open) {
    const cut = L.buttons.filter(x => x.sw > x.cw + 1 || x.w < 44 - .5 || x.h < 44 - .5);
    ok(tag + ' I3-21 alle Tasten ≥ 44 × 44, nichts abgeschnitten', !cut.length, cut.map(x => x.t + ' ' + Math.round(x.w) + '×' + Math.round(x.h)).join(', '));
    ok(tag + ' I3-21 Malfeld ≥ 120 px hoch', L.field.h >= 120, Math.round(L.field.w) + '×' + Math.round(L.field.h));
    const hsw = await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth);
    ok(tag + ' I3-21 keine waagrechte Seiten-Scrollleiste', hsw);
    if (SHOT) await p.screenshot({path: path.join(SHOT, 'form-' + W + 'x' + H + '.png')});
    // a stroke over the field (600 ms): one undo, the form follows, glide; then pointercancel; then a tap
    const F = L.field, u1 = await p.evaluate(() => UNDO.length), f0 = await p.evaluate(() => JSON.stringify(S.tracks[0].sound.p.l1f));
    const cdp = await ctx.newCDPSession(p);
    const pts = []; for (let i = 0; i <= 36; i++) { const x = F.x + 4 + (F.w - 8) * i / 36, y = F.y + F.h * (i < 18 ? .2 : .8); pts.push([x, y]); }
    await cdp.send('Input.dispatchTouchEvent', {type: 'touchStart', touchPoints: [{x: pts[0][0], y: pts[0][1]}]});
    for (const [x, y] of pts.slice(1)) { await cdp.send('Input.dispatchTouchEvent', {type: 'touchMove', touchPoints: [{x, y}]}); await p.waitForTimeout(16); }
    await cdp.send('Input.dispatchTouchEvent', {type: 'touchEnd', touchPoints: []}); await p.waitForTimeout(60);
    const s2 = await p.evaluate(u1 => { const s = SYNQUENZER.form.state(); return {undo: UNDO.length - u1, k: S.tracks[0].sound.p.l1f.k, anim: s.anim, info: s.info}; }, u1);
    ok(tag + ' I3-18 Strich = ein Undo, Form folgt (Rechteck-Strich → Halten)', s2.undo === 1 && s2.k.some(q => q[2] === 0 && q[1] > 300) && s2.k.some(q => q[1] < -300), JSON.stringify(s2.k).slice(0, 80));
    ok(tag + ' I3-40 Gleiten 150 ms nach dem Abheben + Infozeile', s2.anim && /Aufgeräumt/.test(s2.info), s2.info);
    const f1 = await p.evaluate(() => JSON.stringify(S.tracks[0].sound.p.l1f)), u2 = await p.evaluate(() => UNDO.length);
    await cdp.send('Input.dispatchTouchEvent', {type: 'touchStart', touchPoints: [{x: F.x + F.w * .3, y: F.y + F.h * .5}]});
    for (let i = 1; i < 10; i++) await cdp.send('Input.dispatchTouchEvent', {type: 'touchMove', touchPoints: [{x: F.x + F.w * (.3 + i * .03), y: F.y + F.h * .1}]});
    await cdp.send('Input.dispatchTouchEvent', {type: 'touchCancel', touchPoints: []}); await p.waitForTimeout(60);
    const s3 = await p.evaluate(u2 => ({same: JSON.stringify(S.tracks[0].sound.p.l1f), undo: UNDO.length - u2}), u2);
    ok(tag + ' I3-18 pointercancel → Form deep-equal, kein Undo', s3.same === f1 && s3.undo === 0);
    await p.touchscreen.tap(F.x + F.w * .5, F.y + F.h * .5); await p.waitForTimeout(60);
    ok(tag + ' I3-18 Tipp ändert nichts', await p.evaluate(f1 => JSON.stringify(S.tracks[0].sound.p.l1f) === f1, f1));
    // library: Pumpen = a copy, one undo; undo brings the stroke back
    const lb = await p.evaluate(() => { const x = document.querySelector('#formSheet [data-lib="Pumpen"]'); const r = x.getBoundingClientRect(); return {x: r.left + r.width / 2, y: r.top + r.height / 2}; });
    await p.touchscreen.tap(lb.x, lb.y); await p.waitForTimeout(100);
    const s4 = await p.evaluate(() => ({f: S.tracks[0].sound.p.l1f, lib: FORM.lib().Pumpen}));
    ok(tag + ' I3-24 Bibliothek Pumpen: Knoten genau, Name übernommen', JSON.stringify(s4.f.k) === JSON.stringify(s4.lib.k) && s4.f.n === 'Pumpen');
    await p.evaluate(() => undo()); await p.waitForTimeout(50);
    ok(tag + ' I3-24 ↶ bringt den Strich zurück', await p.evaluate(f1 => JSON.stringify(S.tracks[0].sound.p.l1f) === f1, f1));
    void f0;
    // close: page and editor height +-0
    await p.evaluate(() => SYNQUENZER.form.abort()); await p.waitForTimeout(100);
    const h1 = await p.evaluate(() => ({app: document.documentElement.scrollHeight, ed: EL.synthSheet.getBoundingClientRect().height, kb: (document.getElementById('kbArea') || {getBoundingClientRect: () => ({height: 0})}).getBoundingClientRect().height, open: SYNQUENZER.form.state().open}));
    ok(tag + ' I3-21 Höhe von Seite, Editor und Tastatur ± 0 px', !h1.open && Math.abs(h1.app - h0.app) < .5 && Math.abs(h1.ed - h0.ed) < .5 && Math.abs(h1.kb - h0.kb) < .5, JSON.stringify(h0) + ' → ' + JSON.stringify(h1));
  }
  ok(tag + ' Konsole ohne Fehler', !errs.length, errs.slice(0, 2).join(' | '));
  await ctx.close();
}
await b.close();
console.log(fails ? 'FEHLER: ' + fails : 'ALLES GRÜN');
process.exit(fails ? 1 : 0);
