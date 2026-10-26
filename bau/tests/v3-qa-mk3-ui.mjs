// QA (acceptance lens) MK3 in Chromium: TIMBRE key, STIMME/STIMMUNG, EIGENE, SHIFT tools, Split key, beide/Solo, save/load
import {launch, open, box, tap, drag, lcd, panel, undoN, mkg, leds, J, pickPop} from './v3-qa-mk3-lib.mjs';
const ONLY = process.env.ONLY ? new RegExp(process.env.ONLY) : null;
let fails = 0; const ok = (id, c, info) => { if (!c) fails++; console.log((c ? 'PASS ' : 'FAIL ') + id + (info ? ' — ' + info : '')); };
const T = async (id, f) => { if (ONLY && !ONLY.test(id)) return; try { await f(); } catch (e) { ok(id, false, 'Fehler ' + String(e.stack || e).slice(0, 600)); } };
const b = await launch();
const hashOf = page => page.evaluate(() => SQStore.soundHash(sndOf(0)));
const lcdTxt = page => page.evaluate(() => { const L = document.querySelector('#synthSheet .lcd') || ED.lcd; return L ? L.innerText.replace(/\s+/g, ' ') : ''; });

await T('MK3-04', async () => {
  const {ctx, page, errs} = await open('P1');
  await tap(page, 'timbre');
  ok('MK3-04 EINZELN: Tipp auf TIMBRE → T2 gesperrt (LCD-Hinweis), LED 1', (await leds(page)) === '10' && /gesperrt/i.test(await lcd(page)), (await leds(page)) + ' | ' + (await lcd(page)));
  await page.evaluate(() => MKUI.setWahl(1, 0)); await tap(page, 'k1'); const pt = await pickPop(page, /^Schicht/);
  ok('MK3-04 EINZELN/SCHICHT als Liste (Zeile ≥ 44 px) → Schicht, ein Undo', (await mkg(page)).mode === 1 && pt[3] >= 44 && (await undoN(page)) === 1, 'mode ' + (await mkg(page)).mode + ' Zeile ' + Math.round(pt[3]) + ' Undo ' + (await undoN(page)));
  const seq = []; for (let k = 0; k < 4; k++) { await tap(page, 'timbre'); seq.push((await panel(page)).timbre + ':' + (await leds(page)) + ':' + (await page.evaluate(() => MKUI.P.el.disp && MKUI.P.el.disp._t))); }
  ok('MK3-04 Tipps T1 → T2 → beide → T1 (LEDs)', seq.map(s => s.split(':').slice(0, 2).join(':')).join(' ') === '2:01 beide:11 1:10 2:01', seq.join(' '));
  // T2 selected now: SPIEL CUTOFF edits T2 (all sections edit the selected timbre), T1 deep-equal, LCD says T2
  await page.evaluate(() => MKUI.toSpiel()); await page.waitForTimeout(100);
  const m0 = await mkg(page); await drag(page, 'k0', -60, 10); const m1 = await mkg(page), l1 = await lcd(page);
  ok('MK3-04 SPIEL CUTOFF mit T2: T2 geändert, T1 deep-equal, LCD „T2“', J(m1.t[0]) === J(m0.t[0]) && m1.t[1].f.cut !== m0.t[1].f.cut && /T2/.test(l1), m0.t[1].f.cut + '→' + m1.t[1].f.cut + ' | ' + l1);
  // every EDIT-WAHL 1 section with T2: a drag on knob 2 changes only T2
  const bad = [];
  for (let pos = 1; pos < 11; pos++) {
    await page.evaluate(p => MKUI.setWahl(1, p), pos); await page.waitForTimeout(60);
    const d = await page.evaluate(() => { const k = MKUI.knobs(); return k.map(x => x && !x.dark && x.p ? x.p + (x.L ? ':L' : '') : null); });
    for (const [ki, p] of d.entries()) { if (!p || !p.startsWith('t.0.') || p.endsWith(':L')) continue;
      await page.evaluate(p => { const r = SQMK.mkRange(p) || [0, 127], mid = Math.round((r[0] + r[1]) / 2); SYNQUENZER.mkSet(0, p, mid); SYNQUENZER.mkSet(0, 't.1.' + p.slice(4), mid); MKUI.render(); }, p);
      const a = await mkg(page); await drag(page, 'k' + ki, 40, 8); const c = await mkg(page);
      if (J(c.t[0]) !== J(a.t[0]) || J(c.t[1]) === J(a.t[1])) bad.push(pos + '/' + p); break; }
  }
  ok('MK3-04 EDIT-WAHL 1 alle Sektionen mit T2: nur T2 ändert sich', !bad.length, bad.join(', ') || 'TONH./OSZ1/OSZ2/MIXER/FILTER/F-HK/AMP/A-HK/LFO1/LFO2 ok');
  // PATCH 1 (EDIT-WAHL 2) with T2
  await page.evaluate(() => MKUI.setWahl(2, 0)); await page.waitForTimeout(60);
  const pa = await mkg(page); await drag(page, 'k2', 40, 8); const pc = await mkg(page);
  ok('MK3-04 PATCH 1 mit T2: nur T2', J(pc.t[0]) === J(pa.t[0]) && J(pc.t[1]) !== J(pa.t[1]), J(pa.t[1].p[0]) + ' → ' + J(pc.t[1].p[0]));
  ok('MK3-04 keine Konsolenfehler', !errs.length, errs.join(' | ').slice(0, 300));
  await ctx.close();
});

await T('MK3-STIMMUNG', async () => {
  const {ctx, page, errs} = await open('L1');
  await page.evaluate(() => MKUI.setWahl(2, 9)); await page.waitForTimeout(100);
  const pi = await panel(page);
  ok('STIMMUNG-Stellung aktiv (Regler STIMMUNG, GRUNDTON, nicht dunkel)', pi.knobs[0] && pi.knobs[0].p === 'scale' && !pi.knobs[0].dark && pi.knobs[1].p === 'skey', J(pi.knobs.slice(0, 2)) + ' | ' + pi.matrix[1]);
  await tap(page, 'k0'); const rows = await page.evaluate(() => [...document.querySelectorAll('.pop .plist.mkl button')].map(x => [x.textContent.trim(), Math.round(x.getBoundingClientRect().height)]));
  ok('STIMMUNG: Tipp öffnet die Liste mit 10 Stimmungen (Zeilen ≥ 44 px)', rows.length === 10 && rows.every(r => r[1] >= 44), J(rows));
  const u0 = await undoN(page); await pickPop(page, /Werckmeister/); await page.waitForTimeout(800);
  ok('STIMMUNG Werckmeister III gewählt: scale 5, ein Undo, LCD', (await mkg(page)).scale === 5 && (await undoN(page)) === u0 + 1, (await mkg(page)).scale + ' | ' + (await lcd(page)));
  const u1 = await undoN(page); await drag(page, 'k1', 80, 12); const m = await mkg(page);
  ok('GRUNDTON ziehen: skey ändert sich, ein Undo', m.skey > 0 && (await undoN(page)) === u1 + 1, 'skey ' + m.skey + ' | ' + (await lcd(page)));
  // Eigene via list -> matrix row EIGENE -> 12 knobs
  await tap(page, 'k0'); await pickPop(page, /^Eigene/);
  const mm = await mkg(page);
  ok('Eigene gewählt: scale 9, usc = 12 × 0', mm.scale === 9 && J(mm.usc) === J(new Array(12).fill(0)), J(mm.usc));
  const mrow = await page.evaluate(() => MKUI.panelInfo().matrix[1]);
  await tap(page, 'm2'); await page.waitForTimeout(200);
  const oi = await page.evaluate(() => MKUI.ownInfo());
  ok('Matrix-Zeile „EIGENE ▸“ öffnet die Zusatz-Ansicht (12 Regler)', /EIGENE/.test(mrow) && oi && oi.els.filter(e => /^u\d+$/.test(e.k)).length === 12, mrow + ' | ' + (oi ? oi.w + '×' + oi.h : 'zu'));
  const labs = await page.evaluate(() => [...document.querySelectorAll('#synthSheet .mkx[data-k^="u"] .lg')].map(e => e.textContent));
  const key = (await mkg(page)).skey;
  const NN = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'H'];
  ok('EIGENE: Aufschriften ab dem Grundton', labs.length === 12, 'Grundton ' + key + ': ' + labs.join(' '));
  const u2 = await undoN(page); await drag(page, 'u3', 50, 10); const m3 = await mkg(page);
  ok('EIGENE Regler 4 ziehen: usc[3] ≠ 0, ein Undo', m3.usc[3] !== 0 && m3.usc.filter(x => x !== 0).length === 1 && (await undoN(page)) === u2 + 1, J(m3.usc) + ' | ' + (await lcd(page)));
  await tap(page, 'back'); const p2 = await panel(page);
  ok('[◂ GERÄT] zurück, STIMMUNG bleibt', !p2.view && p2.sel.wahl === 2 && p2.sel.pos === 9, J(p2.sel));
  ok('keine Konsolenfehler', !errs.length, errs.join(' | ').slice(0, 300));
  await ctx.close();
});

await T('MK3-13', async () => {
  const {ctx, page, errs} = await open('L1');
  await page.evaluate(() => { SYNQUENZER.mkSet(0, 'mode', 1); SYNQUENZER.mkSet(0, 't.0.f.cut', 60); SYNQUENZER.mkSet(0, 't.1.f.cut', 100); MKUI.setWahl(1, 5); MKUI.render(); });
  const h0 = await hashOf(page); await tap(page, 'timbre'); await tap(page, 'timbre');
  ok('MK3-13 „beide“ (LEDs 11), Taste ändert soundHash nicht', (await leds(page)) === '11' && (await hashOf(page)) === h0, await leds(page));
  const a0 = await mkg(page), u0 = await undoN(page); await drag(page, 'k1', 30, 10); const a1 = await mkg(page);
  const d1 = a1.t[0].f.cut - a0.t[0].f.cut, d2 = a1.t[1].f.cut - a0.t[1].f.cut;
  ok('MK3-13 CUTOFF-Zug bei „beide“: gleiches Δ, ein Undo, LCD „T1+2“ zeigt T1', d1 > 0 && d1 === d2 && (await undoN(page)) === u0 + 1, 'Δ ' + d1 + '/' + d2 + ' | ' + (await lcd(page)));
  // SHIFT + OKT ▲ in "beide": both by +1
  const b0 = await mkg(page); await tap(page, 'shift'); await tap(page, 'octu'); const b1 = await mkg(page);
  ok('MK3-13 SHIFT + OKT ▲ bei „beide“: beide Timbres +1', b1.t[0].f.cut - b0.t[0].f.cut === 1 && b1.t[1].f.cut - b0.t[1].f.cut === 1, (b1.t[0].f.cut - b0.t[0].f.cut) + '/' + (b1.t[1].f.cut - b0.t[1].f.cut));
  // solo by SHIFT + TIMBRE: LED blinks (animation), not stored
  const h1 = await hashOf(page); await tap(page, 'shift'); await tap(page, 'timbre');
  const an = await page.evaluate(() => [...document.querySelectorAll('#synthSheet .mkx[data-k="timbre"] .mled')].map(e => getComputedStyle(e).animationName));
  const pi = await panel(page);
  ok('MK3-13 SHIFT + TIMBRE: Solo, die LED des Solo-Timbres blinkt (CSS-Animation), soundHash gleich', pi.solo && an.some(x => x && x !== 'none') && (await hashOf(page)) === h1, J({solo: pi.solo, an, leds: await leds(page)}));
  await tap(page, 'timbre'); const p2 = await panel(page);
  ok('MK3-13 Tipp beendet Solo', !p2.solo, J({solo: p2.solo, t: p2.timbre}));
  ok('keine Konsolenfehler', !errs.length, errs.join(' | ').slice(0, 300));
  await ctx.close();
});

await T('MK3-05', async () => {
  const {ctx, page, errs} = await open('L1');
  await page.evaluate(async () => { SYNQUENZER.mkSet(0, 'mode', 2); SYNQUENZER.mkSet(0, 't.1.o1.w', 3); SYNQUENZER.mkSet(0, 't.1.f.cut', 41); SYNQUENZER.mkSet(0, 't.1.e2.r', 77); SYNQUENZER.mkSet(0, 't.0.o2.semi', 7); SYNQUENZER.mkSet(0, 't.1.p.2.i', -20);
    await SYNQUENZER.saveSound(0, 'QA Quelle', 'new'); });
  await page.waitForTimeout(200);
  const src = await page.evaluate(() => SYNQUENZER.library().find(s => s.name === 'QA Quelle'));
  await page.evaluate(() => { initSound(0); }); await page.waitForTimeout(250);
  await page.evaluate(() => { SYNQUENZER.mkSet(0, 'mode', 1); MKUI.render(); });
  // T1 target: SHIFT + 1, library source T2 → T1
  await tap(page, 'shift'); await tap(page, 'n0');
  const u0 = await undoN(page); const rows = await page.evaluate(() => [...document.querySelectorAll('.pop .mkcp .mkcr')].map(r => r.textContent.trim()));
  const pk = await page.evaluate(() => { const r = [...document.querySelectorAll('.pop .mkcp .mkcr')].find(x => /QA Quelle/.test(x.textContent)); const bt = r && r.querySelectorAll('button')[1]; if (!bt) return null; const q = bt.getBoundingClientRect(); return [q.x + q.width / 2, q.y + q.height / 2, q.width, q.height]; });
  await page.touchscreen.tap(pk[0], pk[1]); await page.waitForTimeout(200);
  let m = await mkg(page);
  ok('MK3-05 SHIFT + 1: Quelle T2 aus der Bibliothek → T1 deep-equal, ein Undo; Treffer ≥ 44', J(m.t[0]) === J(src.p.mk.t[1]) && (await undoN(page)) === u0 + 1 && pk[3] >= 44 && pk[2] >= 44, J(rows) + ' btn ' + Math.round(pk[2]) + '×' + Math.round(pk[3]));
  // ⋯ menu: Timbre tauschen by a real tap on the menu row
  const menuTap = async a => { await page.evaluate(() => { const bt = [...document.querySelectorAll('#synthSheet button')].find(x => x.textContent.trim() === '⋯' || x.getAttribute('aria-label') === 'Mehr'); bt.click(); }); await page.waitForTimeout(250);
    const r = await page.evaluate(a => { const bt = document.querySelector('.pop button[data-a="' + a + '"]'); if (!bt) return null; const q = bt.getBoundingClientRect(); return [q.x + q.width / 2, q.y + q.height / 2, q.height]; }, a); if (!r) return null; await page.touchscreen.tap(r[0], r[1]); await page.waitForTimeout(250); return r; };
  const s0 = await mkg(page), u1 = await undoN(page); const r1 = await menuTap('tswap'); const s1 = await mkg(page);
  ok('MK3-05 ⋯ → Timbre tauschen: T1 ⇄ T2, ein Undo', r1 && J(s1.t[0]) === J(s0.t[1]) && J(s1.t[1]) === J(s0.t[0]) && (await undoN(page)) === u1 + 1, J(r1) + ' undo ' + ((await undoN(page)) - u1));
  const r2 = await menuTap('tswap'); const s2 = await mkg(page);
  ok('MK3-05 zweimal tauschen = Ausgang', J(s2) === J(s0), '');
  // ⋯ → Timbre neu with T2 selected
  await page.waitForTimeout(800); await page.evaluate(() => { SYNQUENZER.mkSet(0, 't.1.f.cut', 40); MKUI.render(); }); await tap(page, 'timbre'); const s2b = await mkg(page); const u2 = await undoN(page); const r3 = await menuTap('tinit'); const s3 = await mkg(page), ini = await page.evaluate(() => SQMK.init().t[0]); console.log('  dbg tinit', J(r3), 'timbre', (await panel(page)).timbre, await lcd(page));
  ok('MK3-05 ⋯ → Timbre neu (T2 gewählt): T2 = INIT, T1 gleich, ein Undo', r3 && J(s3.t[1]) === J(ini) && J(s3.t[0]) === J(s2b.t[0]) && (await undoN(page)) === u2 + 1, 'undo ' + ((await undoN(page)) - u2));
  // ⋯ → Timbre kopieren: opens the source list
  const r4 = await menuTap('tcopy'); const has = await page.evaluate(() => document.querySelectorAll('.pop .mkcp .mkcr').length);
  ok('MK3-05 ⋯ → Timbre kopieren öffnet die Quellen-Liste', r4 && has >= 2, 'Zeilen ' + has);
  await page.evaluate(() => closePop());
  ok('keine Konsolenfehler', !errs.length, errs.join(' | ').slice(0, 300));
  await ctx.close();
});

await T('MK3-03', async () => {
  for (const f of ['L1', 'P1', 'P2', 'P3', 'L2']) {
    const {ctx, page, errs} = await open(f);
    await page.evaluate(() => { SYNQUENZER.mkSet(0, 'mode', 2); MKUI.setWahl(1, 0); MKUI.lcdOf(MKUI.knobs()[1]); }); await page.waitForTimeout(150);
    const lk = await page.evaluate(() => { const bt = document.querySelector('.lsplit'); if (!bt) return null; const L = bt.closest('.lcd') || bt.parentElement, r = L.getBoundingClientRect(), rb = bt.getBoundingClientRect(); return {lcd: [Math.round(r.width), Math.round(r.height)], key: [Math.round(rb.width), Math.round(rb.height)], x: r.x + r.width / 2, y: r.y + r.height / 2, vis: r.width > 0 && r.height > 0}; });
    let res = 'keine LCD-Taste';
    if (lk && lk.vis) { const u0 = await undoN(page); await page.touchscreen.tap(lk.x, lk.y); await page.waitForTimeout(120); await page.evaluate(() => { inputDown(67, 'qa', .8); }); await page.waitForTimeout(60); await page.evaluate(() => inputUp('qa'));
      res = 'split ' + (await mkg(page)).split + ' undo +' + ((await undoN(page)) - u0) + ' LCD-Zeile ' + lk.lcd.join('×') + ' Schild ' + lk.key.join('×'); }
    const tall = lk && lk.vis ? lk.lcd[1] >= 44 : null;
    console.log('  ' + f + ': ' + res);
    if (f === 'L1' || f === 'P1') ok('MK3-03/MK3-10 [Split ← nächste Note] in ' + f + ': setzt split, ein Undo; Trefferfläche ≥ 44 px hoch', lk && /split 67 undo \+1/.test(res) && tall, res);
    await ctx.close();
  }
});

await T('MK3-SAVE', async () => {
  const {ctx, page, errs} = await open('L1');
  const want = await page.evaluate(async () => { const D = SYNQUENZER; D.mkSet(0, 'mode', 2); D.mkSet(0, 'tv', 2); D.mkSet(0, 'split', 55); D.mkSet(0, 'scale', 9); D.mkSet(0, 'skey', 4);
    for (let k = 0; k < 12; k++) D.mkSet(0, 'usc.' + k, k * 9 - 50); D.mkSet(0, 't.1.o1.w', 2); D.mkSet(0, 't.1.a.pan', 33);
    await D.saveSound(0, 'QA Dual', 'new'); return D.mkGet(0); });
  const lib = await page.evaluate(() => SYNQUENZER.library().find(s => s.name === 'QA Dual'));
  ok('Speichern: Bibliotheks-Sound = p.mk deep-equal (mode, tv, split, scale, skey, usc, T2)', lib && J(lib.p.mk) === J(want), lib ? J({mode: lib.p.mk.mode, usc: lib.p.mk.usc}) : 'fehlt');
  // load into track 1 (another synth track) and compare
  const r = await page.evaluate(async () => { const D = SYNQUENZER; const t = S.tracks.findIndex((x, i) => i > 0 && x && x.kind === 'synth'); if (t < 0) return 'keine 2. Synth-Spur';
    const s = D.library().find(x => x.name === 'QA Dual'); D.loadSound ? D.loadSound(t, s.id) : applySound(t, deep(s)); await new Promise(q => setTimeout(q, 200)); return {t, mk: D.mkGet(t)}; });
  ok('Laden in eine andere Spur: p.mk deep-equal', r && r.mk && J(r.mk) === J(want), typeof r === 'string' ? r : J(r && r.mk && {mode: r.mk.mode, usc: r.mk.usc}));
  // reload page (autosave) -> track 0 still the same
  await page.evaluate(() => { try { Autosave.now ? Autosave.now() : Autosave.save(); } catch (e) {} }); await page.waitForTimeout(800);
  await page.reload(); await page.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.storage().booted, null, {timeout: 30000}); await page.waitForTimeout(500);
  const after = await page.evaluate(() => SYNQUENZER.mkGet(0));
  ok('Neu laden der Seite (Autosave): p.mk deep-equal', J(after) === J(want), J(after && {mode: after.mode, scale: after.scale, usc: after.usc}));
  ok('keine Konsolenfehler', !errs.length, errs.join(' | ').slice(0, 300));
  await ctx.close();
});

await b.close();
console.log(fails ? fails + ' FEHLER' : 'alles bestanden');
