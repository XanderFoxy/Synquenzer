// S0 Abnahme: S0-01 … S0-04 (Chromium, Touch)
import {launch, open, sleep, deq, tally, OUT} from './h.mjs';
import {songABA, tapMark, songBarsDb, soloT, roundTrip} from './lib.mjs';
const ok = tally();
const br = await launch();
// ---------- S0-01 a: one part, two marks; replace the 2nd only ----------
{
  const H = await open(br), p = H.p;
  await songABA(p);
  const b = await p.evaluate(() => ({song: SYNQUENZER.project().song, parts: SYNQUENZER.parts()}));
  await p.evaluate(() => { SYNQUENZER.launchScene(1); SYNQUENZER.play(); });
  await p.waitForFunction(() => audBeat() > 9, null, {timeout: 20000});
  await p.evaluate(() => { SYNQUENZER.launchScene(0); setTimeout(() => SYNQUENZER.stopTrackNow(4), 30); });   // Strophe without drums
  await p.waitForFunction(() => audBeat() > 18, null, {timeout: 20000});
  await p.evaluate(() => SYNQUENZER.fangTeil({})); await sleep(250);
  await p.tap('.fsheet button[data-n="Strophe"]'); await sleep(120);
  await p.tap('.fsheet button[data-dup="replace"]'); await sleep(120);
  const ch = await p.$$eval('.fsheet button[data-s0c]', bs => bs.map(b => ({t: b.textContent, w: b.getBoundingClientRect().width, h: b.getBoundingClientRect().height})));
  ok(ch.length === 3 && /Strophe 1 \(Takt 1\)/.test(ch[0].t) && /Strophe 2 \(Takt 5\)/.test(ch[1].t), 'S0-01 Blatt fragt „welche“: ' + ch.map(c => c.t).join(' · '));
  ok(ch.every(c => c.h >= 44 && c.w >= 44), 'S0-01 Auswahl-Knöpfe ≥ 44 px ' + JSON.stringify(ch.map(c => [Math.round(c.w), c.h])));
  // ALS TEIL ✓ without a choice asks again, changes nothing
  await p.tap('.fsheet button[data-a="ok"]'); await sleep(150);
  const still = await p.evaluate(() => ({open: !!document.querySelector('.fsheet'), song: SYNQUENZER.project().song}));
  ok(still.open && deq(still.song, b.song), 'S0-01 ohne Wahl: nichts ersetzt, Blatt bleibt offen');
  await p.tap('.fsheet button[data-s0c="1"]'); await sleep(150);
  const mk = await p.evaluate(() => SYNQUENZER.svLayoutInfo().mark);
  ok(mk === 'M3', 'S0-01 die gewählte Stelle ist im Song markiert (SV.mark ' + mk + ')');
  await p.screenshot({path: OUT + '/s0-01-welche-P1.png'});
  const u0 = await p.evaluate(() => SYNQUENZER.undoInfo ? SYNQUENZER.undoInfo() : null);
  await p.tap('.fsheet button[data-a="ok"]'); await sleep(200);
  const a = await p.evaluate(() => ({song: SYNQUENZER.project().song, parts: SYNQUENZER.parts(), marks: SYNQUENZER.songMarks()}));
  const cut = (s, x0, x1) => s.lanes.map(l => l.filter(e => e.bar >= x0 && e.bar < x1));
  ok(deq(cut(b.song, 0, 4), cut(a.song, 0, 4)) && deq(b.parts, a.parts), 'S0-01 erste Strophe (T1–2), Refrain und Vorlage deep-equal');
  ok(!deq(cut(b.song, 4, 6), cut(a.song, 4, 6)) && a.song.lanes[4].some(e => e.bar === 4 && e.slot === -1), 'S0-01 nur die zweite (T5–6) geändert: Drums dort aus ' + JSON.stringify(cut(a.song, 4, 6)));
  ok(a.marks.length === 3 && a.marks[2].name === 'Strophe' && a.marks[2].dev && !a.marks[0].dev, 'S0-01 Marke bleibt „Strophe“ (′ geändert), die erste unverändert');
  await p.evaluate(() => SYNQUENZER.undo()); await sleep(100);
  const un = await p.evaluate(() => ({song: SYNQUENZER.project().song, parts: SYNQUENZER.parts()}));
  ok(deq(un.song, b.song) && deq(un.parts, b.parts), 'S0-01 ein Undo stellt alles her');
  ok(!H.errs.length, 'keine Konsolenfehler ' + JSON.stringify(H.errs.slice(0, 2)));
  await H.ctx.close();
}
// ---------- S0-01 b: two parts „Strophe“ and „Strophe 2“: replace „Strophe 2“ ----------
{
  const H = await open(br), p = H.p;
  await songABA(p, {two: true});
  const b = await p.evaluate(() => ({song: SYNQUENZER.project().song, parts: SYNQUENZER.parts()}));
  await p.evaluate(() => { SYNQUENZER.launchScene(1); SYNQUENZER.play(); });
  await p.waitForFunction(() => audBeat() > 9, null, {timeout: 20000});
  await p.evaluate(() => { SYNQUENZER.launchScene(0); setTimeout(() => SYNQUENZER.stopTrackNow(4), 30); });
  await p.waitForFunction(() => audBeat() > 18, null, {timeout: 20000});
  await p.evaluate(() => SYNQUENZER.fangTeil({})); await sleep(250);
  await p.tap('.fsheet button[data-n="Strophe"]'); await sleep(100);
  await p.tap('.fsheet button[data-dup="replace"]'); await sleep(100);
  const ch = await p.$$eval('.fsheet button[data-s0c]', bs => bs.map(b => b.textContent));
  ok(ch.length === 3 && /⟳ Strophe \(Takt 1\)/.test(ch[0]) && /Strophe 2 \(Takt 5\)/.test(ch[1]), 'S0-01b Teile Strophe / Strophe 2: ' + ch.join(' · '));
  await p.tap('.fsheet button[data-s0c="1"]'); await sleep(100);
  await p.tap('.fsheet button[data-a="ok"]'); await sleep(200);
  const a = await p.evaluate(() => ({song: SYNQUENZER.project().song, parts: SYNQUENZER.parts()}));
  const cut = (s, x0, x1) => s.lanes.map(l => l.filter(e => e.bar >= x0 && e.bar < x1));
  ok(deq(a.parts[0], b.parts[0]) && deq(cut(b.song, 0, 4), cut(a.song, 0, 4)), 'S0-01b Teil „Strophe“ und seine Stelle deep-equal');
  ok(!deq(a.parts[2].lanes, b.parts[2].lanes) && a.parts[2].name === 'Strophe 2' && !deq(cut(b.song, 4, 6), cut(a.song, 4, 6)), 'S0-01b „Strophe 2“ (Vorlage + Stelle) ersetzt');
  ok(!H.errs.length, 'keine Konsolenfehler ' + JSON.stringify(H.errs.slice(0, 2)));
  await H.ctx.close();
}
// ---------- S0-02 / S0-03 / S0-04 via the song view (touch) ----------
const VPS = [['P1', 390, 844], ['P2', 375, 667], ['P3', 320, 568], ['L1', 844, 390], ['L2', 667, 375], ['W', 926, 428]];
{
  const H = await open(br), p = H.p;
  await songABA(p);
  await p.evaluate(() => SYNQUENZER.songView(true)); await sleep(300);
  const b = await p.evaluate(() => ({song: SYNQUENZER.project().song, parts: SYNQUENZER.parts()}));
  const a0 = await songBarsDb(p, 6); await soloT(p, 4); const d0 = await songBarsDb(p, 6); await soloT(p, null);
  await tapMark(p, 'M3');
  ok(await p.evaluate(() => UI.pop && UI.pop.name === 'mark'), 'Tipp auf die gelbe Kopfzeile → Marken-Blatt');
  await p.tap('.msheet button[data-s012="edit"]'); await sleep(150);
  const segs = await p.$$eval('.msheet .s0-c', bs => bs.map(b => b.textContent));
  ok(segs.length >= 3 && segs.every(s => /an$/.test(s)), 'S0 Bearbeiten listet die Clips der Stelle: ' + segs.join(' · '));
  await p.screenshot({path: OUT + '/s0-edit-P1.png'});
  // S0-03 drums off here (touch)
  await p.tap('.msheet .s0-c[data-t="4"]'); await sleep(150);
  const a = await p.evaluate(() => ({song: SYNQUENZER.project().song, segs: SYNQUENZER.markSegs('M3')}));
  ok(a.segs.find(s => s.t === 4 && !s.on), 'S0-03 DR aus (Liste zeigt „aus“)');
  const cut = (s, x0, x1) => s.lanes.map(l => l.filter(e => e.bar >= x0 && e.bar < x1));
  ok(deq(cut(b.song, 0, 4), cut(a.song, 0, 4)) && deq(b.song.lanes.filter((_, t) => t !== 4), a.song.lanes.filter((_, t) => t !== 4)), 'S0-03 sonst unverändert (andere Spuren und Takte deep-equal)');
  await p.evaluate(() => SYNQUENZER.undo()); await sleep(80);
  ok(deq(await p.evaluate(() => SYNQUENZER.project().song), b.song), 'S0-03 ein Undo von „aus“ → Anfang deep-equal');
  await p.evaluate(() => { if (UI.pop) closePop(); SYNQUENZER.markSeg('M3', 4, 0, false); });
  const a1 = await songBarsDb(p, 6); await soloT(p, 4); const d1 = await songBarsDb(p, 6); await soloT(p, null);
  ok(d1[4] < -60 && d1[5] < -80 && d0[4] > -40 && [0, 1, 2, 3].every(k => Math.abs(d1[k] - d0[k]) < 0.5), 'S0-03 hörbar (T5 nur Ausklang des letzten Refrain-Schlags): Drums solo je Takt vorher ' + d0 + ' dB / nachher ' + d1 + ' dB');
  ok([0, 1, 2, 3].every(k => Math.abs(a1[k] - a0[k]) < 0.5) && a1[4] < a0[4] - 0.5, 'S0-03 Mischung T1–4 gleich, T5–6 leiser: ' + a0 + ' / ' + a1);
  const rt = await roundTrip(p);
  ok(deq(rt.a, rt.b) && rt.b.marks.find(m => m.id === 'M3').off, 'S0-03 Speichern/Laden deep-equal (mark.off bleibt)');
  await p.evaluate(() => SYNQUENZER.undo());
  // wieder an → wie vorher
  await p.evaluate(() => SYNQUENZER.openMarkSheet('M3')); await p.evaluate(() => { const q = UI.pop.el; q._s0ed = 'M3'; q._paint(); popDock(q); }); await sleep(100);
  await p.tap('.msheet .s0-c.off[data-t="4"]'); await sleep(120);
  ok(deq(await p.evaluate(() => SYNQUENZER.project().song.lanes), b.song.lanes), 'S0-03 wieder an → Spuren deep-equal zum Anfang');
  await p.evaluate(() => SYNQUENZER.undo()); await sleep(80);
  ok(await p.evaluate(() => !!SYNQUENZER.project().song.marks.find(m => m.id === 'M3').off), 'S0-03 Undo von „an“ → wieder aus (ein Schritt)');
  // S0-02 rename via Bearbeiten → ✎ Name
  await p.evaluate(() => { if (UI.pop) closePop(); }); await sleep(80);
  await tapMark(p, 'M1'); await p.tap('.msheet button[data-s012="edit"]'); await sleep(120);
  await p.tap('.msheet button[data-s012="name"]'); await sleep(150);
  await p.fill('.mname .mn-in', 'Vers'); await p.tap('.mname button[data-a="ok"]'); await sleep(150);
  const r = await p.evaluate(() => ({parts: SYNQUENZER.parts(), marks: SYNQUENZER.songMarks()}));
  ok(r.parts[0].name === 'Vers' && r.marks[0].name === 'Vers' && r.marks[2].name === 'Vers', 'S0-02 Umbenennen → „Vers“ (Teil überall)');
  await p.evaluate(() => SYNQUENZER.undo()); await sleep(80);
  ok(await p.evaluate(() => SYNQUENZER.parts()[0].name === 'Strophe'), 'S0-02 Undo → „Strophe“');
  // S0-04 sheet in all formats
  for (const [nm, w, h] of VPS) {
    await p.evaluate(() => { if (UI.pop) closePop(); }); await p.setViewportSize({width: w, height: h}); await sleep(350);
    await p.evaluate(() => SYNQUENZER.markEdit('M3')); await sleep(200);
    const L = await p.evaluate(() => {
      const q = UI.pop && UI.pop.el, r = q.getBoundingClientRect(), bad = [], cut = [];
      for (const b of q.querySelectorAll('button')) { const k = b.getBoundingClientRect(); if (!k.width) continue; if (b.classList.contains('ms-x')) { if (k.width < 44 - .5 || k.height + 12 < 44 - .5) bad.push('x'); } else if (k.height < 44 - .5 || (k.width < 44 - .5)) bad.push((b.textContent || b.getAttribute('aria-label')).trim().slice(0, 14) + ' ' + Math.round(k.width) + '×' + Math.round(k.height)); if (b.scrollWidth > b.clientWidth + 1) cut.push(b.textContent.trim().slice(0, 14)); const lr = b.closest('.s0-list') ? b.closest('.s0-list').getBoundingClientRect() : null; if (lr && (k.bottom > lr.bottom + .5 || k.top < lr.top - .5)) continue; if (k.bottom > innerHeight + .5 || k.right > innerWidth + .5 || k.left < -.5) cut.push('out:' + b.textContent.trim().slice(0, 10)); }
      const xb = q.querySelector('.ms-x'), xr = xb.getBoundingClientRect();
      const li = q.querySelector('.s0-list'), scr = li ? getComputedStyle(li).overflowY : '';
      return {scr, rows: li ? li.querySelectorAll('.s0-tr').length : 0, vis: li ? Math.round(li.clientHeight) : 0, top: r.top, bottom: r.bottom, vh: innerHeight, bad, cut, sw: document.scrollingElement.scrollWidth <= innerWidth, x: [xr.width, xr.height + 12]};
    });
    await p.screenshot({path: OUT + `/s0-04-${nm}.png`});
    ok(!L.bad.length && !L.cut.length && L.sw && L.bottom <= L.vh + .5 && L.top >= 0, `S0-04 ${nm}: Bearbeiten-Blatt ≥ 44 px, nichts abgeschnitten, im Bild ` + JSON.stringify(L));
    // the Marken-Blatt itself with the new button
    await p.evaluate(() => { const q = UI.pop.el; q._s0ed = null; q._paint(); popDock(q); }); await sleep(120);
    const M = await p.evaluate(() => { const q = UI.pop.el, cut = []; for (const b of q.querySelectorAll('button')) { const k = b.getBoundingClientRect(); if (b.scrollWidth > b.clientWidth + 1 || k.right > innerWidth + .5) cut.push(b.textContent.trim().slice(0, 14) + ' ' + b.scrollWidth + '>' + b.clientWidth); } const e = q.querySelector('[data-s012="edit"]').getBoundingClientRect(); return {cut, e: [Math.round(e.width), Math.round(e.height)], bottom: q.getBoundingClientRect().bottom, vh: innerHeight}; });
    ok(!M.cut.length && M.e[0] >= 44 && M.e[1] >= 44 && M.bottom <= M.vh + .5, `S0-04 ${nm}: Marken-Blatt mit [Bearbeiten] ` + JSON.stringify(M));
  }
  ok(!H.errs.length && !H.reqs.length, 'keine Konsolenfehler, kein Netz ' + JSON.stringify(H.errs.slice(0, 2).concat(H.reqs.slice(0, 2))));
  await H.ctx.close();
}
await br.close();
process.exit(ok.done() ? 1 : 0);
