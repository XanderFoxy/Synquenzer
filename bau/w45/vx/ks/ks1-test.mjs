// KS1 (Klangschule, Paket KS1) – Abnahme in Chromium, hochkant (390×844) und quer (844×390)
// Aufruf: node ks1-test.mjs <index.html> [fotos-ordner]
// Prüft: stiller Block beim Start nicht ausgewertet; Zugänge (≡ › Wo finde ich …?, Klang-Editor › ⋯, Suche); jede Lektion lädt,
// Rahmen sitzen auf sichtbaren Reglern (bzw. dem Reiter der Seite), die Karte verdeckt keinen Rahmen; Startklang ✗, Lösungswerte ✓;
// Tipps nach 2/4 Fehlversuchen; „Zeig es mir“; ↶-Grenze; ◆ ruht; ✕ lässt das Projekt bitgleich (auch Speichern/Laden); Autosave während
// der Lektion schreibt das Original; Übernehmen = genau ein ↶ (diese und andere Spur); Projektwechsel; Fortschritt nur in den
// Geräte-Einstellungen; A/B am Master pegelgleich (±1 dB); keine Fehler in der Konsole.
import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
import path from 'node:path';
const file = path.resolve(process.argv[2]), fotos = process.argv[3] ? path.resolve(process.argv[3]) : null;
const b = await chromium.launch({args: ['--autoplay-policy=no-user-gesture-required']});
let pass = 0, fail = 0; const out = [];
const ok = (c, name, info) => { if (c) pass++; else fail++; out.push((c ? 'OK   ' : 'FEHL ') + name + (info != null ? '  ' + (typeof info === 'string' ? info : JSON.stringify(info)) : '')); console.log(out[out.length - 1]); };
const inter = (a, c) => a && c && a.x < c.x + c.w && a.x + a.w > c.x && a.y < c.y + c.h && a.y + a.h > c.y;

async function page(w, h) {
  const p = await b.newPage({viewport: {width: w, height: h}, hasTouch: true, isMobile: true, deviceScaleFactor: 1});
  p._errs = []; p.on('pageerror', e => p._errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') p._errs.push(m.text()); });
  await p.goto('file://' + file); await p.waitForFunction(() => window.SYNQUENZER && BOOT.done, null, {timeout: 120000}); await p.waitForTimeout(600);
  return p;
}
const X = (p, f, a) => p.evaluate(f, a);
async function tapVis(p, sel) {
  const hs = await p.$$(sel);
  for (const h of hs) { const bb = await h.boundingBox(); if (bb && bb.width > 2 && bb.height > 2) { await p.touchscreen.tap(bb.x + bb.width / 2, bb.y + bb.height / 2); return true; } }
  return false;
}
// Speichern/Laden-Vergleich: Projektdatei ohne Zeitstempel und ohne die Ansicht (ui)
const SER = p => p.evaluate(() => { const o = JSON.parse(serialize()); delete o.project.ui; return JSON.stringify(o); });
const FULL = p => p.evaluate(() => serialize());

for (const [w, h, tag] of [[390, 844, 'hochkant'], [844, 390, 'quer']]) {
  console.log('==== ' + tag + ' ' + w + '×' + h);
  const p = await page(w, h);
  // 1 Startzeit-Bedingung: der stille Block ist beim Start nicht ausgewertet
  const st0 = await X(p, () => ({ksx: typeof KSX !== 'undefined', css: !!document.getElementById('ks-css'), block: !!document.getElementById('sq-ks-src'), ld: SYNQUENZER.ks.loaded()}));
  ok(!st0.ksx && !st0.css && st0.block && !st0.ld.ok, tag + ' stiller Block beim Start nicht ausgewertet', st0);
  // die Lektionsspur vorher wählen (so wählt die Lektion dieselbe Spur; die Ansicht bleibt gleich)
  const t = await X(p, () => { const t = ui1SynthT(false); selectTrack(t); return t; });
  // 2 Zugang ≡ › Wo finde ich …? › Klangschule
  await X(p, () => openMenu('guide')); await p.waitForTimeout(500);
  const hasRow = await X(p, () => !!document.querySelector('#menu .ksrow button'));
  ok(hasRow, tag + ' Menü: Zeile „Klangschule – Sounddesign mit echtem Klang“');
  await X(p, () => { const r = document.querySelector('#menu .ksrow'); if (r) r.scrollIntoView({block: 'center'}); }); await p.waitForTimeout(250);
  await tapVis(p, '#menu .ksrow button'); await p.waitForTimeout(700);
  const sh1 = await X(p, () => SYNQUENZER.ks.x().sheetInfo());
  ok(sh1 && sh1.rows.filter(r => /^L\d$/.test(r.k)).length >= 4 && sh1.rect.x >= 0 && sh1.rect.x + sh1.rect.w <= w, tag + ' Klangschule-Blatt öffnet (4 Lektionen + Weiter)', sh1 && sh1.rows.map(r => r.k + (r.foc ? '*' : '')).join(' '));
  if (fotos) await p.screenshot({path: fotos + '/ks1-blatt-' + tag + '.png'});
  await X(p, () => closePop()); await p.waitForTimeout(200);
  // 3 Zugang Klang-Editor › ⋯ › „Klangschule zu dieser Seite“ (HÜLLK. → Kapitel 1)
  await X(p, t => { selectTrack(t); ED.tab = 'env'; ED.sub.env = 'amp'; openEditor(); }, t); await p.waitForTimeout(500);
  await tapVis(p, '#synthSheet button.edm'); await p.waitForTimeout(400);
  const more = await X(p, () => !!(UI.pop && UI.pop.el.querySelector('button[data-a="ks"]')));
  ok(more, tag + ' ⋯-Blatt: Zeile „Klangschule zu dieser Seite“');
  await tapVis(p, '.pop button[data-a="ks"]'); await p.waitForTimeout(700);
  const sh2 = await X(p, () => SYNQUENZER.ks.x().sheetInfo());
  ok(sh2 && sh2.rows.some(r => r.k === 'L1' && r.foc) && !sh2.rows.some(r => r.k === 'L3' && r.foc), tag + ' ⋯ auf HÜLLK. zeigt Kapitel 1 „zu dieser Seite“', sh2 && sh2.rows.map(r => r.k + (r.foc ? '*' : '')).join(' '));
  await tapVis(p, '.pop.ksb button[data-k="L1"]'); await p.waitForTimeout(800);
  ok(await X(p, () => !!(KS_L && KS_L.les.id === 'L1')), tag + ' Tipp im Blatt startet Lektion 1');
  await X(p, () => SYNQUENZER.ks.x().close()); await p.waitForTimeout(300);
  // 4 Suche
  const se = await X(p, () => ({pol: ui1Search('Polarität').slice(0, 3).map(e => e.id), tut: ui1Search('Tutorial').slice(0, 2).map(e => e.id), sd: ui1Search('Sounddesign').slice(0, 2).map(e => e.id)}));
  ok(se.pol.includes('ks-l3') && se.tut.includes('ks') && se.sd.includes('ks'), tag + ' Suche findet Klangschule (Polarität, Tutorial, Sounddesign)', se);
  await X(p, () => ui1Jump('ks-l3')); await p.waitForTimeout(900);
  ok(await X(p, () => !!(KS_L && KS_L.les.id === 'L3')), tag + ' Sprung aus der Suche öffnet Lektion 3');
  await X(p, () => SYNQUENZER.ks.x().close()); await p.waitForTimeout(300);

  // 5 jede Lektion: lädt, Rahmen sitzen auf sichtbaren Reglern/Reitern, Karte verdeckt keinen Rahmen, Start ✗, Lösung ✓
  const pre = await SER(p), preF = await FULL(p);
  for (const id of ['L1', 'L2', 'L3', 'L4']) {
    await X(p, id => SYNQUENZER.ks.x().start(id), id); await p.waitForTimeout(700);
    const s = await X(p, () => SYNQUENZER.ks.x().state());
    const vis = s.rings.every(r => r.tgt && r.tgt.w > 4 && r.tgt.x >= 0 && r.tgt.y >= 0 && r.tgt.x + r.tgt.w <= w + 1 && r.tgt.y + r.tgt.h <= h + 1 && Math.abs(r.rect.x - (r.tgt.x - 3)) <= 2 && Math.abs(r.rect.w - (r.tgt.w + 6)) <= 2);
    ok(s.id === id && /^Schule: /.test(s.sound) && s.rings.length >= 2 && vis, tag + ' ' + id + ' lädt, ' + s.rings.length + ' Rahmen auf sichtbaren Zielen', s.rings.map(r => r.lb));
    const cov = s.rings.filter(r => inter(r.rect, s.card));
    ok(!cov.length && s.card.y >= 0 && s.card.y + s.card.h <= h + 1, tag + ' ' + id + ' Karte verdeckt keinen Rahmen', {card: s.card, cov: cov.map(r => r.lb)});
    ok(!s.ok, tag + ' ' + id + ' Startklang ✗', s.msg);
    if (fotos) await p.screenshot({path: fotos + '/ks1-' + id + '-' + tag + '.png'});
    const s2 = await X(p, () => SYNQUENZER.ks.x().sol());
    ok(s2.ok && /^✓/.test(s2.msg), tag + ' ' + id + ' Lösungswerte ✓', s2.msg);
    if (id === 'L2') {
      await X(p, () => SYNQUENZER.ks.x().bonus()); await p.waitForTimeout(500);
      const b1 = await X(p, () => SYNQUENZER.ks.x().state());
      const b2 = await X(p, () => SYNQUENZER.ks.x().sol());
      ok(b1.bonus && !b1.ok && b2.ok, tag + ' L2 Bonus (Sinus-Sub): Start ✗, Lösung ✓', [b1.msg, b2.msg]);
    }
  }
  await X(p, () => SYNQUENZER.ks.x().close()); await p.waitForTimeout(300);
  const post = await SER(p), postF = await FULL(p);
  ok(pre === post, tag + ' nach 4 Lektionen (+ Bonus) und ✕: Projekt bitgleich', pre === post ? null : 'Länge ' + pre.length + ' / ' + post.length);
  ok(preF === postF, tag + ' … auch mit Ansicht (ui)', preF === postF ? null : 'ui anders');

  if (tag === 'hochkant') {
    // 6 Tipps nach 2/4 Fehlversuchen
    await X(p, () => SYNQUENZER.ks.x().start('L1')); await p.waitForTimeout(400);
    const tips = [];
    for (const v of [.35, .4, .45, .5]) { const s = await X(p, v => SYNQUENZER.ks.x().set('aD', v), v); tips.push(s.fails + '/' + s.tipN); }
    ok(tips.join(' ') === '1/0 2/1 3/1 4/2', 'Tipp 1 nach 2, Tipp 2 nach 4 Fehlversuchen', tips);
    const tipTxt = await X(p, () => SYNQUENZER.ks.x().state().tip);
    ok(/Tipp 2/.test(tipTxt), 'Tipp-Text in der Karte', tipTxt);
    // 7 ↶ in der Lektion: normale Schritte; ↶ endet am Anfang der Lektion
    const u = await X(p, () => { const a = UNDO.length; undo(); undo(); undo(); undo(); const b = UNDO.length; const r = undo(); return {a, b, r, u0: KS_L.u0.length, aD: S.tracks[KS_L.t].sound.p.aD}; });
    ok(u.b === u.u0 && u.r === false && Math.abs(u.aD - .3) < 1e-9, '↶ geht in der Lektion, endet am Anfang der Lektion', u);
    // 8 Zeig es mir: dreht auf die Lösung, ein ↶
    const z0 = await X(p, () => UNDO.length);
    await X(p, () => SYNQUENZER.ks.x().show()); await p.waitForTimeout(300);
    const z = await X(p, () => SYNQUENZER.ks.x().state());
    ok(z.ok && z.undo === z0 + 1 && /Zeig es mir/.test(z.top), '„Zeig es mir“ → ✓ und genau ein ↶', {ok: z.ok, undo: z.undo, z0, top: z.top});
    const pr = await X(p, () => ({ks: uiPrefs().ks, inProj: /"ks"|Klangschule/.test(serialize())}));
    ok(pr.ks && pr.ks.d && pr.ks.d.L1 && !pr.inProj, 'Fortschritt in den Geräte-Einstellungen, nicht im Projekt', pr.ks);
    // 9 Autosave/Speichern während der Lektion schreibt das Original
    const orig = await X(p, () => JSON.stringify(KS_L.orig));
    await X(p, () => SYNQUENZER.ks.x().set('cutoff', 5000));
    const sv = await p.evaluate(async () => { await saveNow(); const pj = await autosave.load(); const t = KS_L.t;
      return {auto: JSON.stringify(pj.tracks[t].sound), ser: JSON.stringify(JSON.parse(serialize()).project.tracks[t].sound), sp: JSON.stringify(JSON.parse(serializeProject()).tracks[t].sound), live: S.tracks[t].sound.name}; });
    const norm = s => JSON.stringify(JSON.parse(s));
    ok(sv.live.startsWith('Schule') && norm(sv.auto) === norm(orig) && norm(sv.sp) === norm(orig), 'Autosave/serializeProject während der Lektion = Original', {live: sv.live, auto: norm(sv.auto) === norm(orig), sp: norm(sv.sp) === norm(orig)});
    ok(JSON.parse(sv.ser).name === JSON.parse(orig).name, 'Projektdatei (serialize) während der Lektion trägt das Original', JSON.parse(sv.ser).name);
    // 10 ✕ bitgleich (auch nach Speichern/Laden)
    const pre2 = await X(p, () => { const o = JSON.parse(serialize()); delete o.project.ui; return JSON.stringify(o); });
    void pre2;
    await X(p, () => SYNQUENZER.ks.x().close());
    const x1 = await p.evaluate(async () => { const o = JSON.parse(serialize()); delete o.project.ui; await saveNow(); const pj = await autosave.load(); return {ser: JSON.stringify(o), auto: JSON.stringify(pj.tracks[R.selT].sound), u: UNDO.length, r: REDO.length}; });
    ok(x1.ser === pre && norm(x1.auto) === norm(orig), '✕: Projekt bitgleich, auch gespeichert/geladen', {eq: x1.ser === pre, auto: norm(x1.auto) === norm(orig)});
    // 11 Übernehmen = genau ein ↶ (diese Spur), ↶ = Original
    const u0 = await X(p, () => UNDO.length);
    await X(p, () => { SYNQUENZER.ks.x().start('L3'); SYNQUENZER.ks.x().set('fenv', -.3); SYNQUENZER.ks.x().set('cutoff', 2000); SYNQUENZER.ks.x().set('fenv', -.5); });
    const tk = await X(p, t => { SYNQUENZER.ks.x().take(t); return {u: UNDO.length, top: UNDO[UNDO.length - 1].label, name: S.tracks[t].sound.name, open: !!KS_L}; }, t);
    ok(tk.u === u0 + 1 && /^Klangschule/.test(tk.top) && tk.name === 'Schule: Plus und Minus' && !tk.open, 'Übernehmen (diese Spur) = genau ein ↶', tk);
    const ud = await X(p, () => { undo(); const o = JSON.parse(serialize()); delete o.project.ui; return JSON.stringify(o); });
    ok(ud === pre, '↶ nach Übernehmen = Projekt wie vorher (bitgleich)');
    // 12 Übernehmen auf eine andere Spur: Lektionsspur bleibt wie vorher
    const other = await X(p, t => trackOrder().find(i => i !== t && S.tracks[i].kind === 'synth' && !S.tracks[i].stimme && !percIs(S.tracks[i])), t);
    if (other != null) {
      const o0 = await X(p, ([t, o]) => ({u: UNDO.length, t: JSON.stringify(S.tracks[t].sound)}), [t, other]);
      await X(p, () => { SYNQUENZER.ks.x().start('L4'); SYNQUENZER.ks.x().sol(); });
      const o1 = await X(p, ([t, o]) => { SYNQUENZER.ks.x().take(o); return {u: UNDO.length, t: JSON.stringify(S.tracks[t].sound), o: S.tracks[o].sound.name, fe: S.tracks[o].sound.p.fenv}; }, [t, other]);
      ok(o1.u === o0.u + 1 && o1.t === o0.t && o1.o === 'Schule: Hochpass mit Minus' && o1.fe === -.75, 'Übernehmen auf andere Spur: ein ↶, Lektionsspur unverändert', {u: [o0.u, o1.u], o: o1.o});
      await X(p, () => undo());
    }
    // 13 ◆ ruht: Regler in der Lektion gehen in den Grundklang, kein Clip-Zustand entsteht
    const ak = await X(p, () => { SYNQUENZER.ks.x().start('L1'); const t = KS_L.t, sts = JSON.stringify(S.tracks[t].clips.map(c => (c ? c.st || null : null))); SYNQUENZER.ks.x().set('aS', .5);
      const r = {ed: !!V6A.ed, same: JSON.stringify(S.tracks[t].clips.map(c => (c ? c.st || null : null))) === sts, aS: S.tracks[t].sound.p.aS}; SYNQUENZER.ks.x().close(); return r; });
    ok(!ak.ed && ak.same && ak.aS === .5, '◆ ruht: Regler ändern den Grundklang der Lektion, kein Clip-Zustand', ak);
    // 14 Projektwechsel beendet die Lektion, das Original bleibt
    const pw = await X(p, () => { SYNQUENZER.ks.x().start('L2'); SYNQUENZER.ks.x().set('aA', 1); const txt = serializeProject(); applyProject(normalizeProject(JSON.parse(txt))); return {open: !!KS_L, card: !!document.querySelector('.kscard')}; });
    const pw2 = await X(p, () => { const o = JSON.parse(serialize()); delete o.project.ui; return JSON.stringify(o); });
    ok(!pw.open && !pw.card && pw2 === pre, 'Projektwechsel beendet die Lektion, Projekt = Original', {open: pw.open, card: pw.card, same: pw2 === pre});
    // 15 einklappen
    await X(p, () => { SYNQUENZER.ks.x().start('L1'); SYNQUENZER.ks.x().act('fold'); }); await p.waitForTimeout(300);
    const fo = await X(p, () => SYNQUENZER.ks.x().state());
    ok(fo.fold && fo.card.h <= 60, 'Karte einklappbar auf eine Zeile', fo.card);
    await X(p, () => SYNQUENZER.ks.x().act('fold'));
    // 16 A/B pegelgleich am Master (±1 dB), echte Engine: L1 und L3
    await p.waitForFunction(() => { ensureAudio(); return typeof SynthHost !== 'undefined' && SynthHost.state === 'ready'; }, null, {timeout: 60000});
    for (const id of ['L1', 'L3']) {
      await X(p, id => SYNQUENZER.ks.x().start(id), id);
      const G = await p.evaluate(async () => await SYNQUENZER.ks.x().gains());
      const m = {};
      for (const wch of ['a', 'b']) {
        const r = await p.evaluate(async wch => { const X = SYNQUENZER.ks.x(); await X.gains(); const cap = X.capture(4.2); await X.hear(wch); return await cap; }, wch);
        m[wch] = r && r.lu; await p.waitForTimeout(400);
      }
      const d = Math.abs(m.a - m.b);
      ok(isFinite(d) && d <= 1, id + ' A/B am Master pegelgleich (±1 dB)', {a: +m.a.toFixed(2), b: +m.b.toFixed(2), diff: +d.toFixed(2), offline: G && {a: +G.a.toFixed(2), b: +G.b.toFixed(2)}});
      const ht = await X(p, () => SYNQUENZER.ks.x().state().hearTxt);
      void ht;
    }
    const hearTxt = await p.evaluate(async () => { const X = SYNQUENZER.ks.x(); await X.hear('b'); return X.state().hearTxt; });
    ok(/du hörst: .*pegelgleich/.test(hearTxt), 'Vorhör-Zeile sagt, was klingt', hearTxt);
    const dot = await p.evaluate(async () => { const X = SYNQUENZER.ks.x(); X.start('L3'); await new Promise(r => setTimeout(r, 300)); const v = auditionStart(KS_L.t, 48, .8); await new Promise(r => setTimeout(r, 600)); const s = X.state(); try { v.release(nowT()); } catch (e) {} return s.dot; });
    ok(dot && dot.x > 0 && dot.hz > 20, 'Mitlaufen: Punkt auf der Kurve, solange ein Ton klingt (Scope der Stimme)', dot);
    await X(p, () => SYNQUENZER.ks.x().close());
    const tmLoad = await X(p, () => SYNQUENZER.ks.loaded());
    ok(tmLoad.ok && tmLoad.ms < 400, 'Block beim ersten Öffnen ausgewertet', tmLoad);
  }
  ok(!p._errs.length, tag + ' keine Fehler in der Konsole', p._errs.slice(0, 5));
  await p.close();
}
await b.close();
console.log('ERGEBNIS ' + pass + '/' + (pass + fail) + (fail ? ' – ' + fail + ' FEHLER' : ''));
process.exit(fail ? 1 : 0);
