// UI1 – ein gezieltes Playwright-Skript: Guide (Suche, Sprung, Anleitungen), Klangerzeugung hochkant nebeneinander (vorher/nachher),
// ◆ ÜBERGÄNGE vollständig (Kacheln, Platzieren, Treffer), Bit-Mask-Werksklänge (Blatt, Tipp lädt, Render nicht stumm, Pegel),
// Spuren-Gruppe (zwei Finger per CDP-Touch, Wisch-Lautstärke aller, Stumm, Solo, ✕; alte Gesten bleiben), Leucht-Look (an/aus,
// Box-Vergleich), alte Projekte gleich. node ui1-test.mjs <index.html> <basis.html>
import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
import fs from 'fs';
const file = process.argv[2], basis = process.argv[3];
const OUT = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/w4480/ui1/';
const b = await chromium.launch({args: ['--autoplay-policy=no-user-gesture-required']});
const results = []; const ok = (name, pass, info) => { results.push({name, pass: !!pass, info}); console.log((pass ? 'OK   ' : 'FAIL ') + name + (info !== undefined ? '  ' + JSON.stringify(info).slice(0, 700) : '')); };
const wait = ms => new Promise(r => setTimeout(r, ms));
async function page(f, w, h, dpr) {
  const p = await b.newPage({viewport: {width: w, height: h}, hasTouch: true, isMobile: true, deviceScaleFactor: dpr || 2});
  p.errs = []; p.on('pageerror', e => p.errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') p.errs.push(m.text()); });
  await p.goto('file://' + f); await p.waitForFunction(() => window.SYNQUENZER && window.SQMK, null, {timeout: 60000});
  await p.waitForTimeout(700);
  p.cdp = await p.context().newCDPSession(p);
  return p;
}
const center = async (p, sel) => p.evaluate(s => { const e = typeof s === 'string' ? document.querySelector(s) : null; if (!e) return null; const r = e.getBoundingClientRect(); return {x: r.left + r.width / 2, y: r.top + r.height / 2, w: r.width, h: r.height}; }, sel);
const tapAt = async (p, pt) => { await p.touchscreen.tap(Math.round(pt.x), Math.round(pt.y)); await p.waitForTimeout(220); };
const tapSel = async (p, sel) => { const c = await center(p, sel); if (!c) throw new Error('nicht da: ' + sel); await tapAt(p, c); return c; };
// Touch per CDP (mehrere Finger): pts = [{id, x, y}] alle Finger, die gerade liegen
const touch = (p, type, pts) => p.cdp.send('Input.dispatchTouchEvent', {type, touchPoints: pts.map(q => ({x: Math.round(q.x), y: Math.round(q.y), id: q.id, radiusX: 4, radiusY: 4, force: 1}))});
const headC = (p, t) => p.evaluate(t => { const h = document.querySelector('.th[data-t="' + t + '"]'); if (!h) return null; const r = h.getBoundingClientRect(); return {x: r.left + r.width / 2, y: r.top + r.height / 2, l: r.left, w: r.width, h: r.height}; }, t);

/* ===================== 1 Guide ===================== */
const P = await page(file, 428, 926);
{
  const n = await P.evaluate(() => SYNQUENZER.ui1.entries().length);
  ok('Guide: Liste aller Funktionen (≥ 60 Einträge, je Name · wo · Satz)', n >= 60, {n});
  const Q = [['Lautstärke', 'vol'], ['Swing', 'swing'], ['Fill', 'ue'], ['Video', 'video'], ['mastern', 'master'], ['Hall', 'hall'], ['Filter', 'filter'], ['Bit Mask', 'bmk'], ['Solo', 'solo'], ['Remix', 'remix'], ['Werkzeugkasten', 'wkz'], ['Hüllkurve', 'env']];
  const hits = [];
  for (const [q, want] of Q) {
    const L = await P.evaluate(q => SYNQUENZER.ui1.search(q), q);
    const top = L[0] && L[0].id;
    await P.evaluate(id => SYNQUENZER.ui1.jump(id), top);
    await P.waitForTimeout(950);
    const r = await P.evaluate(() => ({j: SYNQUENZER.ui1.lastJump(), ring: SYNQUENZER.ui1.ring(), vw: innerWidth, vh: innerHeight}));
    const inView = r.ring && r.ring.shown && r.ring.x < r.vw && r.ring.y < r.vh && r.ring.x + r.ring.w > 0 && r.ring.y + r.ring.h > 0;
    hits.push({q, top, want, ok: top === want && r.j.ok && r.j.target && inView, at: r.j.txt});
  }
  const good = hits.filter(h => h.ok).length;
  ok('Guide-Suche: ' + Q.length + ' Begriffe finden die richtige Funktion und springen hin (Rahmen im Bild)', good >= 10 && good === Q.length, hits.filter(h => !h.ok).length ? hits.filter(h => !h.ok) : hits.map(h => h.q + '→' + h.at));
  // alle Einträge: Sprung öffnet die Stelle, der Rahmen sitzt auf einem sichtbaren Element
  const ids = await P.evaluate(() => SYNQUENZER.ui1.entries().map(e => e.id)), bad = [];
  for (const id of ids) { await P.evaluate(id => SYNQUENZER.ui1.jump(id), id); await P.waitForTimeout(600); const j = await P.evaluate(() => SYNQUENZER.ui1.lastJump()); if (!j.ok || !j.target) bad.push(id); }
  ok('Guide: jeder Eintrag springt hin (hochkant)', bad.length === 0, {n: ids.length, bad});
  // Bedienung wie Xander: ≡ → Suchfeld tippen → Ergebnis antippen
  await P.evaluate(() => SYNQUENZER.ui1.home());
  await tapSel(P, '#bMenu'); await P.waitForTimeout(300);
  const qc = await center(P, '#menu .ui1q');
  await tapAt(P, qc); await P.keyboard.type('swing'); await P.waitForTimeout(250);
  const res = await P.evaluate(() => [...document.querySelectorAll('#menu .ui1res .ui1it')].map(b => b.querySelector('b').textContent));
  await P.screenshot({path: OUT + 'ui1-p-guide.png'});
  const first = await center(P, '#menu .ui1res .ui1it');
  await tapAt(P, first); await P.waitForTimeout(900);
  const after = await P.evaluate(() => ({menu: EL.menu.classList.contains('open'), j: SYNQUENZER.ui1.lastJump(), ring: SYNQUENZER.ui1.ring()}));
  ok('Menü ≡ → „Wo finde ich …?“: tippen „swing“ → Liste → Tipp springt ins Menü zu Swing (Rahmen)', res[0] === 'Swing' && after.j.id === 'swing' && after.j.target && after.ring && after.ring.shown, {res, j: after.j});
  // Kurz-Anleitungen: 5 Stück, je 4–8 Schritte, jeder Schritt findet seine Stelle
  const tours = await P.evaluate(() => SYNQUENZER.ui1.tours());
  const tbad = [];
  for (const T of tours) for (let k = 0; k < T.steps; k++) { await P.evaluate(([id, k]) => SYNQUENZER.ui1.tour(id, k), [T.id, k]); await P.waitForTimeout(560); const i = await P.evaluate(() => SYNQUENZER.ui1.tourInfo()); if (!i || !i.card || !i.ring) tbad.push(T.id + ':' + k); }
  await P.evaluate(() => { SYNQUENZER.ui1.tourEnd(); SYNQUENZER.ui1.home(); });
  ok('Kurz-Anleitungen: Klang formen, Groove, Song, Mischen & Mastern, Video – jeder Schritt zeigt seine Stelle', tours.length === 5 && tours.every(T => T.steps >= 4 && T.steps <= 8) && tbad.length === 0, {tours: tours.map(T => T.n + ' ' + T.steps), tbad});
  // „Zeig es mir“ per Touch: Menü → Klang formen → Weiter … Fertig; ✕ immer im Bild
  await tapSel(P, '#bMenu'); await P.waitForTimeout(400);
  const tb = await P.evaluate(() => { const b = document.querySelector('#menu .ui1tours [data-tour="klang"]'); b.scrollIntoView({block: 'center'}); const r = b.getBoundingClientRect(); return {x: r.left + r.width / 2, y: r.top + r.height / 2, h: r.height}; });
  await P.waitForTimeout(200); await tapAt(P, tb); await P.waitForTimeout(700);
  let xs = true, steps = 0;
  for (let k = 0; k < 10; k++) {
    const st = await P.evaluate(() => { const c = document.querySelector('.ui1tour'); if (!c) return null; const x = c.querySelector('.x').getBoundingClientRect(); const n = c.querySelector('[data-a="next"]').getBoundingClientRect(); return {n: c.querySelector('.n').textContent, x: x.top >= 0 && x.bottom <= innerHeight && x.width >= 44 && x.height >= 44, nx: n.left + n.width / 2, ny: n.top + n.height / 2, nh: n.height, ring: !!SYNQUENZER.ui1.ring()}; });
    if (!st) break; steps++; xs = xs && st.x && st.nh >= 44 && st.ring;
    await tapAt(P, {x: st.nx, y: st.ny}); await P.waitForTimeout(650);
  }
  const gone = await P.evaluate(() => !document.querySelector('.ui1tour'));
  ok('„Zeig es mir“ per Touch: 8 Schritte mit Weiter, ✕ und Tasten ≥ 44 px, Rahmen je Schritt, „Fertig“ schließt', steps === 8 && xs && gone, {steps, xs, gone});
}
/* ===================== 2 Klangerzeugung hochkant (vorher/nachher) ===================== */
const B = await page(basis, 428, 926);
const openEd = async (p, eng) => { await p.evaluate(eng => { SYNQUENZER.ui1 && SYNQUENZER.ui1.home(); closeEditor(); selectTrack(0); if (eng) setEngine(0, eng); ED.tab = 'osc'; openEditor(); }, eng); await p.waitForTimeout(500); };
{
  await B.evaluate(() => { selectTrack(0); openEditor(); }); await B.waitForTimeout(500);
  const before = await B.evaluate(() => { const s = EL.synthSheet.querySelector('.sh-head .r1 .seg.eng'); return {cls: s.className, keys: [...s.children].map(x => x.textContent.trim())}; });
  const shotB = await B.screenshot({clip: {x: 0, y: 0, width: 428, height: 150}});
  await openEd(P, 'analog');
  const after = await P.evaluate(() => { const s = EL.synthSheet.querySelector('.sh-head .r1 .seg.eng'), k = [...s.children].map(x => { const r = x.getBoundingClientRect(); return {t: x.textContent.trim(), l: r.left, top: r.top, w: r.width, h: r.height}; }), t = EL.synthSheet.querySelector('.sh-title .stt b'); return {cls: s.className, k, title: [t.scrollWidth, t.clientWidth, t.textContent]}; });
  const shotA = await P.screenshot({clip: {x: 0, y: 0, width: 428, height: 150}});
  const va = after.k.find(x => x.t === 'VA'), fm = after.k.find(x => x.t === 'FM');
  ok('vorher (4.47): hochkant 428 × 926 nur ein Chip „VA ▾“', /engchip/.test(before.cls) && before.keys.length === 1, before);
  ok('nachher: VA │ FM nebeneinander (gleiche Zeile, FM rechts von VA, je ≥ 32 px breit), dazu ▾; Spurname ungekürzt', /ui1eng/.test(after.cls) && va && fm && Math.abs(va.top - fm.top) < 1 && fm.l > va.l && va.w >= 32 && fm.w >= 32 && after.title[0] <= after.title[1], after);
  // Foto vorher/nachher (ein Bild): oben 4.47, unten UI1
  const comp = await b.newPage({viewport: {width: 428, height: 330}, deviceScaleFactor: 2});
  await comp.setContent(`<body style="margin:0;background:#000;color:#ffb22e;font:700 13px sans-serif"><div style="padding:4px 8px">VORHER 4.47 (hochkant: ein Chip)</div><img src="data:image/png;base64,${shotB.toString('base64')}" style="width:428px;display:block"><div style="padding:4px 8px">NACHHER UI1: VA │ FM │ ▾ nebeneinander</div><img src="data:image/png;base64,${shotA.toString('base64')}" style="width:428px;display:block"></body>`);
  await comp.screenshot({path: OUT + 'ui1-p-kopf-vorher-nachher.png'}); await comp.close();
  // FM antippen (Touch) = FM, ein Undo; ↶ = wieder VA
  const u0 = await P.evaluate(() => UNDO.length);
  await tapAt(P, {x: fm.l + fm.w / 2, y: fm.top + fm.h / 2}); await P.waitForTimeout(400);
  const e1 = await P.evaluate(() => ({e: S.tracks[0].sound.engine, du: UNDO.length, lab: UNDO[UNDO.length - 1] && UNDO[UNDO.length - 1].label, info: SYNQUENZER.ui1.engInfo()}));
  await P.evaluate(() => undo()); await P.waitForTimeout(300);
  const e2 = await P.evaluate(() => S.tracks[0].sound.engine);
  ok('FM-Taste (Touch) schaltet auf FM (ein ↶ „Klangerzeugung“), ↶ zurück auf VA', e1.e === 'fm6' && e1.du - u0 === 1 && e1.lab === 'Klangerzeugung' && e1.info.on === 'FM' && e2 === 'analog', {e1, e2});
  // ▾: die Liste mit WT, Platte, Bit Mask, North; WT antippen
  await openEd(P, null);
  const more = await P.evaluate(() => { const b = EL.synthSheet.querySelector('.ui1eng .ui1more'); const r = b.getBoundingClientRect(); return {x: r.left + r.width / 2, y: r.top + r.height / 2}; });
  await tapAt(P, more); await P.waitForTimeout(350);
  const list = await P.evaluate(() => ({pop: UI.pop && UI.pop.name, items: UI.pop ? [...UI.pop.el.querySelectorAll('button[data-e]')].map(x => x.textContent.trim()) : []}));
  const wt = await P.evaluate(() => { const b = UI.pop && UI.pop.el.querySelector('button[data-e="wt"]'); if (!b) return null; const r = b.getBoundingClientRect(); return {x: r.left + r.width / 2, y: r.top + r.height / 2}; });
  if (wt) await tapAt(P, wt); await P.waitForTimeout(400);
  const e3 = await P.evaluate(() => ({e: S.tracks[0].sound.engine, info: SYNQUENZER.ui1.engInfo()}));
  ok('▾ öffnet die Liste (VA, FM, WT, Platte, Bit Mask, North); WT gewählt → „WT ▾“ leuchtet', list.pop === 'engchip' && list.items.length === 6 && e3.e === 'wt' && /WT/.test(e3.info.on), {list, e3});
  // jede Klangerzeugung: Taste sichtbar, Spurname nicht gekürzt
  const engs = [];
  for (const e of ['analog', 'fm6', 'wt', 'mk', 'bm']) { await openEd(P, e); engs.push(await P.evaluate(e => { const i = SYNQUENZER.ui1.engInfo(), t = EL.synthSheet.querySelector('.sh-title .stt b'); return {e, keys: i && i.keys, on: i && i.on, cut: t ? t.scrollWidth > t.clientWidth : null}; }, e)); }
  ok('hochkant für VA / FM / WT / Platte / Bit Mask: VA und FM stehen nebeneinander, die aktive Taste leuchtet, Spurname ganz', engs.every(x => x.keys && x.keys[0] === 'VA' && x.keys[1] === 'FM' && x.on && x.cut === false), engs);
  await P.evaluate(() => { setEngine(0, 'analog'); closeEditor(); });
}
const PL = await page(file, 926, 428);
const BL = await page(basis, 926, 428);
{
  const q = p => p.evaluate(() => { selectTrack(0); openEditor(); const s = EL.synthSheet.querySelector('.sh-head .r1 .seg.eng'); return s ? {cls: s.className, keys: [...s.children].map(x => x.textContent.trim())} : null; });
  const a = await q(BL); await PL.waitForTimeout(100); const c = await q(PL);
  ok('quer 926 × 428 unverändert: alle fünf Tasten wie in 4.47', JSON.stringify(a) === JSON.stringify(c) && c.keys.length === 5, {basis: a, ui1: c});
  await PL.evaluate(() => closeEditor());
  // Guide quer: 5 Sprünge
  const L = ['vol', 'eqk', 'grund', 'video', 'glow'], bad = [];
  for (const id of L) { await PL.evaluate(id => SYNQUENZER.ui1.jump(id), id); await PL.waitForTimeout(900); const j = await PL.evaluate(() => SYNQUENZER.ui1.lastJump()); if (!j.ok || !j.target) bad.push(id); }
  ok('Guide quer: Sprünge finden ihre Stelle', !bad.length, {bad});
  await PL.evaluate(() => SYNQUENZER.ui1.home());
}
/* ===================== 3 ◆ ÜBERGÄNGE vollständig ===================== */
{
  const r = await P.evaluate(() => {
    SYNQUENZER.ui1.home(); songFromChain([{scene: 0, bars: 4}, {scene: 1, bars: 4}, {scene: 0, bars: 4}]); setSongView(true); ueBar(true);
    const tabs = UE_TABS.map(([k, l]) => { UE.tab = k; uePaintBar(); return {k, l, tiles: UE.bar.querySelectorAll('.ue-tile').length, lib: UE_LIB.filter(x => x.tab === k).length}; });
    UE.tab = 'ue'; uePaintBar();
    const ids = SYNQUENZER.ui1.ueIds(), have = ids.filter(id => !!ueLib(id));
    const bb1 = ['p-snare-lauf', 'p-tom-kurz', 'ui1-clap-aufbau', 'ui1-openhat', 'ui1-ghost', 'ui1-fill-becken'].every(id => !!ueLib(id));
    const fx1 = ['fx-tom-fill', 'fx-snare-wirbel', 'fx-crash', 'fx-drop', 'fx-stille'].every(id => !!ueLib(id));
    return {tabs, n: ids.length, have: have.length, bb1, fx1, all: UE_LIB.length};
  });
  ok('◆ ÜBERGÄNGE: jede Bibliotheks-Vorlage ist eine Kachel; Übergänge, Breaks, Einwürfe, Verknüpfer nicht mehr leer', r.tabs.every(t => t.tiles === t.lib) && r.tabs.filter(t => t.k !== 'eigen').every(t => t.tiles >= 4), r.tabs);
  ok('Vorlagen aus FX1 + Drums-Füller des Werkzeugkastens (BB1) + 29 neue (ui1-…) alle da', r.fx1 && r.bb1 && r.n === 29 && r.have === 29, {n: r.n, have: r.have, all: r.all});
  // jede Vorlage frei in den Song setzen: Eintrag da, Treffer gebaut (Breaks: Drum-Spur pausiert), ein Undo, ↶ entfernt
  const pl = await P.evaluate(() => {
    const out = [];
    for (const L of UE_LIB) {
      const u0 = UNDO.length, beat = L.k === 'adlib' ? 13 : 16 + (L.a || 0);
      const id = fllPlace(L.id, Math.max(0, beat));
      const e = id && S.song.ue && S.song.ue.find(x => x.id === id);
      ueBuild();
      const hits = UE.hits.filter(h => h.id === id).length, stop = !!(e && e.stop && e.stop.length);
      const one = UNDO.length - u0 === 1;
      undo();
      const gone = !(S.song.ue || []).some(x => x.id === id);
      out.push({id: L.id, tab: L.tab, ok: !!e && one && gone && (L.notes && L.notes.length ? hits > 0 : stop), hits, stop});
    }
    return out;
  });
  const badP = pl.filter(x => !x.ok);
  ok('jede Vorlage (' + pl.length + ') lässt sich in den Song setzen: Schläge bzw. Pause, ein ↶, ↶ nimmt sie heraus', !badP.length, badP.length ? badP : {n: pl.length});
  // per Touch: Reiter „Einwürfe“ → Kachel antippen (gewählt) → in den Song tippen
  await P.evaluate(() => { UE.tab = 'adlib'; uePaintBar(); });
  await P.waitForTimeout(200);
  const tile = await P.evaluate(() => { const t = UE.bar.querySelector('.ue-tile[data-id="ui1-ad-clap3"]'); t.scrollIntoView({inline: 'center'}); const r = t.getBoundingClientRect(); return {x: r.left + r.width / 2, y: r.top + r.height / 2}; });
  await P.waitForTimeout(250);
  await tapAt(P, tile); await P.waitForTimeout(400);
  const armed = await P.evaluate(() => SYNQUENZER.fllArmed && SYNQUENZER.fllArmed());
  const tgt = await P.evaluate(() => { const r = SV.wrap.getBoundingClientRect(); return {x: r.left + SV.cellW * 6.5 - SV.x, y: r.top + 40}; });
  await tapAt(P, tgt); await P.waitForTimeout(500);
  const placed = await P.evaluate(() => (S.song.ue || []).filter(e => e.src === 'ui1-ad-clap3').map(e => ({at: e.at, k: e.k, n: e.notes.length})));
  await P.screenshot({path: OUT + 'ui1-p-uebergaenge.png'});
  ok('Touch: Einwurf „Clap ×3“ antippen und in den Song tippen = gesetzt', placed.length === 1 && placed[0].n === 3, {armed, placed});
  await P.evaluate(() => { while ((S.song.ue || []).length && UNDO.length) undo(); ueBar(false); setSongView(false); });
}
/* ===================== 4 Bit Mask: Werksklänge + Anleitung ===================== */
{
  await P.evaluate(() => { SYNQUENZER.ui1.home(); selectTrack(0); setEngine(0, 'bm'); openEditor(); });
  await P.waitForTimeout(600);
  const bt = await P.evaluate(() => [...EL.synthSheet.querySelectorAll('.sh-tabs .ui1bt')].map(b => { const r = b.getBoundingClientRect(), cs = getComputedStyle(b, '::before'); return {t: b.textContent, x: r.left + r.width / 2, y: r.top + r.height / 2, w: r.width, h: r.height, hit: r.height + (parseFloat(cs.bottom) < 0 ? -parseFloat(cs.bottom) : 0) + (parseFloat(cs.top) < 0 ? -parseFloat(cs.top) : 0)}; }));
  ok('im Gerät (Reiter-Zeile): [KLÄNGE] und [?], Trefferfläche ≥ 44 px', bt.length === 2 && bt[0].t === 'KLÄNGE' && bt[1].t === '?' && bt.every(x => x.w >= 44 && x.hit >= 44), bt);
  await tapAt(P, bt[0]); await P.waitForTimeout(500);
  const s1 = await P.evaluate(() => ({pop: UI.pop && UI.pop.name, tiles: document.querySelectorAll('.ui1bm .ui1p').length, cats: [...document.querySelectorAll('.ui1bm .ui1cats button[data-u^="cat"]')].map(b => b.textContent), x: (() => { const x = document.querySelector('.ui1bm .psh-x'); if (!x) return null; const r = x.getBoundingClientRect(); return r.top >= 0 && r.width >= 40; })()}));
  ok('KLÄNGE: Blatt mit allen Werksklängen (≥ 40) und Kategorien (Bass, Lead, Pad, Keys …), ✕ sichtbar', s1.pop === 'ui1bm' && s1.tiles >= 40 && s1.cats.length >= 8 && s1.x, s1);
  const cat = await P.evaluate(() => { const b = document.querySelector('.ui1bm [data-u="cat|bass"]'); const r = b.getBoundingClientRect(); return {x: r.left + r.width / 2, y: r.top + r.height / 2}; });
  await tapAt(P, cat); await P.waitForTimeout(300);
  const u0 = await P.evaluate(() => UNDO.length), o0 = await P.evaluate(() => S.tracks[0].sound.origin);
  const tile = await P.evaluate(() => { const b = document.querySelector('.ui1bm [data-u="p|f-bm-p02"]'); const r = b.getBoundingClientRect(); return {x: r.left + r.width / 2, y: r.top + r.height / 2, n: document.querySelectorAll('.ui1bm .ui1p').length}; });
  await tapAt(P, tile); await P.waitForTimeout(400);
  const s2 = await P.evaluate(u0 => ({o: S.tracks[0].sound.origin, e: S.tracks[0].sound.engine, labs: UNDO.slice(u0).map(u => u.kind + ':' + u.label), pv: !!(PV.on || PV.voices.length), on: (document.querySelector('.ui1bm .ui1p.on b') || {}).textContent, still: UI.pop && UI.pop.name}), u0);
  const s2u = await P.evaluate(() => { undo(); const o = S.tracks[0].sound.origin; redo(); return o; });
  ok('Kategorie Bass (6 Klänge) → „Puls-Bass“ antippen: geladen, ein ↶-Schritt, klingt sofort (Vorhören läuft), Blatt bleibt offen', tile.n === 6 && s2.o === 'f-bm-p02' && s2.e === 'bm' && s2.labs.filter(x => /Puls-Bass/.test(x)).length === 1 && s2u === o0 && s2.pv && s2.on === 'Puls-Bass' && s2.still === 'ui1bm', Object.assign(s2, {undoTo: s2u, o0, n: tile.n}));
  await P.screenshot({path: OUT + 'ui1-p-bitmask.png'});
  await P.evaluate(() => closePop()); await P.waitForTimeout(200);
  const hq = await center(P, '#synthSheet .sh-tabs .ui1bt:last-child');
  await tapAt(P, hq); await P.waitForTimeout(400);
  const h = await P.evaluate(() => ({pop: UI.pop && UI.pop.name, n: document.querySelectorAll('.ui1bm .ui1help p').length, t: (document.querySelector('.ui1bm .ui1help') || {}).textContent || ''}));
  ok('[?]: kurze Anleitung (Klang wählen, Bereich-Tasten, Value, Masken, Hüllkurven, Init/Compare/Write, Layer/Split, Octave/Vol)', h.pop === 'ui1bm' && h.n >= 8 && /Value/.test(h.t) && /MASK/.test(h.t) && /Seq\/Env/.test(h.t), {n: h.n});
  await P.evaluate(() => { closePop(); closeEditor(); });
  // jeder Werksklang klingt (Render nicht stumm) und liegt im Pegel
  const lv = await P.evaluate(async () => {
    const out = [];
    for (const f of SYNQUENZER.ui1.bmList()) {
      const ev = [[0, 'on', 60, .8], [0, 'on', 64, .8], [0, 'on', 67, .8], [1.2, 'off', 60], [1.2, 'off', 64], [1.2, 'off', 67]];
      const r = await SYNQUENZER.bmRender(factorySound(f.id), ev, {sec: 1.6}), n = r.l.length, W = 14400;
      let pk = 0, best = 0; for (let k = 0; k < n; k++) pk = Math.max(pk, Math.abs(r.l[k]), Math.abs(r.r[k]));
      for (let a = 0; a + W <= n; a += 2400) { let s = 0; for (let k = a; k < a + W; k++) s += r.l[k] * r.l[k] + r.r[k] * r.r[k]; best = Math.max(best, s / (2 * W)); }
      out.push({n: f.name, db: +(10 * Math.log10(best + 1e-20)).toFixed(1), pk: +(20 * Math.log10(pk + 1e-20)).toFixed(1)});
    }
    return out;
  });
  const dbs = lv.map(x => x.db).sort((a, c) => a - c), med = dbs[dbs.length >> 1];
  ok('Bit Mask: alle ' + lv.length + ' Werksklänge klingen (Render nicht stumm), Spitze ≤ −0,5 dBFS', lv.every(x => x.pk > -30 && x.pk <= -.5), {silent: lv.filter(x => x.pk <= -30), hot: lv.filter(x => x.pk > -.5)});
  ok('Pegel: lautestes 300-ms-Fenster −30 … −15 dB, Median ≈ −19 dB (die zwei leisen Bässe angehoben)', lv.every(x => x.db >= -30 && x.db <= -15) && med <= -17 && med >= -21, {med, min: dbs[0], max: dbs[dbs.length - 1], quiet: lv.filter(x => x.db < -23).map(x => x.n + ' ' + x.db + '/' + x.pk)});
  // von einer VA-Spur aus: Werksklang lädt die Spur als Bit Mask
  const va = await P.evaluate(() => { const e0 = S.tracks[1].sound.engine; SYNQUENZER.ui1.bmSheet(1, 'klang'); SYNQUENZER.ui1.bmLoad(1, 'f-bm-p11'); const r = {e0, e1: S.tracks[1].sound.engine, o: S.tracks[1].sound.origin}; undo(); r.back = S.tracks[1].sound.engine; closePop(); return r; });
  ok('auch von einer VA-/FM-Spur: Werksklang macht die Spur zu Bit Mask, ↶ zurück', va.e1 === 'bm' && va.o === 'f-bm-p11' && va.back === va.e0, va);
  await P.evaluate(() => { undo(); setEngine(0, 'analog'); });
}
/* ===================== 5 Spuren-Gruppe ===================== */
{
  await P.evaluate(() => { SYNQUENZER.ui1.home(); setSongView(false); sx4SoloClear(); SYNQUENZER.ui1.selClear(); });
  await P.waitForTimeout(300);
  const A = await headC(P, 0), C3 = await headC(P, 2), C2 = await headC(P, 1), D = await headC(P, 4);
  // Finger 1 hält SYNTH 1 (> 450 ms: Solo schaltet), Finger 2 tippt SYNTH 3 → Gruppe, das Solo von Finger 1 ist wieder weg
  await touch(P, 'touchStart', [{id: 1, ...A}]); await wait(620);
  const solo1 = await P.evaluate(() => SX4.solo.size);
  await touch(P, 'touchStart', [{id: 1, ...A}, {id: 2, ...C3}]); await wait(60);
  await touch(P, 'touchEnd', [{id: 1, ...A}]); await wait(120);
  await touch(P, 'touchEnd', []); await wait(300);
  const g1 = await P.evaluate(() => ({sel: SYNQUENZER.ui1.sel(), solo: SX4.solo.size, cls: [...document.querySelectorAll('.th.ui1sel')].map(h => +h.dataset.t), bar: SYNQUENZER.ui1.bar()}));
  ok('SYNTH 1 halten + SYNTH 3 antippen = Gruppe (beide markiert), Leiste erscheint; das Halte-Solo von eben ist zurück', solo1 === 1 && JSON.stringify(g1.sel) === '[0,2]' && JSON.stringify(g1.cls) === '[0,2]' && g1.solo === 0 && !!g1.bar, {solo1, g1});
  await tapAt(P, D); await P.waitForTimeout(250);
  const g2 = await P.evaluate(() => SYNQUENZER.ui1.sel());
  ok('bei aktiver Gruppe: Tipp auf DRUMS = dazu', JSON.stringify(g2) === '[0,2,4]', g2);
  const barK = await P.evaluate(() => [...UI1.bar.querySelectorAll('button')].map(b => { const r = b.getBoundingClientRect(); return {t: b.textContent, w: Math.round(r.width), h: Math.round(r.height)}; }));
  ok('Leiste: Stumm · Solo · ✕, Tasten ≥ 44 px', barK.length === 3 && barK.every(x => x.w >= 44 && x.h >= 44), barK);
  // Wischen auf SYNTH 1 = Lautstärke aller drei (gleicher Schritt), ein ↶
  const v0 = await P.evaluate(() => [0, 2, 4, 1].map(t => sx4Vol(t))), u0 = await P.evaluate(() => UNDO.length);
  await touch(P, 'touchStart', [{id: 3, x: A.x - 40, y: A.y}]);
  for (let k = 1; k <= 8; k++) { await touch(P, 'touchMove', [{id: 3, x: A.x - 40 - k * 6, y: A.y}]); await wait(16); }
  await touch(P, 'touchEnd', []); await wait(250);
  const v1 = await P.evaluate(() => [0, 2, 4, 1].map(t => sx4Vol(t))), u1 = await P.evaluate(() => ({n: UNDO.length, lab: UNDO[UNDO.length - 1].label}));
  const d = v1.map((v, k) => +(v - v0[k]).toFixed(3));
  ok('Wischen auf einer gewählten Spur: alle drei leiser um denselben Schritt, SYNTH 2 bleibt, ein ↶ „Lautstärke 3 Spuren“', d[0] < -.1 && d[0] === d[1] && d[1] === d[2] && d[3] === 0 && u1.n - u0 === 1 && u1.lab === 'Lautstärke 3 Spuren', {v0, v1, d, u1});
  await P.screenshot({path: OUT + 'ui1-p-gruppe.png'});
  await P.evaluate(() => undo()); const v2 = await P.evaluate(() => [0, 2, 4].map(t => sx4Vol(t)));
  ok('↶ stellt alle drei zurück', JSON.stringify(v2) === JSON.stringify(v0.slice(0, 3)), {v2});
  // Stumm / Laut für die Gruppe (ein ↶), Solo, ✕
  const mb = await P.evaluate(() => { const b = UI1.bar.querySelector('[data-g="m"]'); const r = b.getBoundingClientRect(); return {x: r.left + r.width / 2, y: r.top + r.height / 2}; });
  const m0 = await P.evaluate(() => UNDO.length);
  await tapAt(P, mb); const m1 = await P.evaluate(() => ({m: [0, 2, 4, 1].map(t => !!S.tracks[t].mute), du: UNDO.length, lab: UNDO[UNDO.length - 1].label, btn: UI1.bar.querySelector('[data-g="m"]').textContent}));
  await P.evaluate(() => undo()); const m2 = await P.evaluate(() => [0, 2, 4].map(t => !!S.tracks[t].mute));
  ok('Stumm: alle drei stumm (SYNTH 2 nicht), ein ↶; Taste heißt dann „Laut“; ↶ = alle wieder an', JSON.stringify(m1.m) === '[true,true,true,false]' && m1.du - m0 === 1 && m1.btn === 'Laut' && m2.every(x => !x), {m1, m2});
  const sb = await P.evaluate(() => { const b = UI1.bar.querySelector('[data-g="s"]'); const r = b.getBoundingClientRect(); return {x: r.left + r.width / 2, y: r.top + r.height / 2}; });
  await tapAt(P, sb); const so1 = await P.evaluate(() => [0, 1, 2, 4].map(t => sx4IsSolo(t)));
  await tapAt(P, sb); const so2 = await P.evaluate(() => SX4.solo.size);
  ok('Solo der Gruppe: an (nur die drei), noch einmal = aus', JSON.stringify(so1) === '[true,false,true,true]' && so2 === 0, {so1, so2});
  const xb = await P.evaluate(() => { const b = UI1.bar.querySelector('[data-g="x"]'); const r = b.getBoundingClientRect(); return {x: r.left + r.width / 2, y: r.top + r.height / 2}; });
  await tapAt(P, xb); await P.waitForTimeout(300);
  const g3 = await P.evaluate(() => ({sel: SYNQUENZER.ui1.sel(), bar: SYNQUENZER.ui1.bar(), cls: document.querySelectorAll('.ui1sel').length}));
  ok('✕ löst die Gruppe auf (Markierung und Leiste weg)', g3.sel.length === 0 && !g3.bar && g3.cls === 0, g3);
  // die alten Gesten: Wischen ohne Gruppe = nur diese Spur, Halten = Solo, nacheinander halten = Mehrfach-Solo, Rand-Ziehen
  const w0 = await P.evaluate(() => [0, 1, 2].map(t => sx4Vol(t)));
  await touch(P, 'touchStart', [{id: 5, x: C2.x - 10, y: C2.y}]); for (let k = 1; k <= 6; k++) { await touch(P, 'touchMove', [{id: 5, x: C2.x - 10 + k * 7, y: C2.y}]); await wait(16); } await touch(P, 'touchEnd', []); await wait(250);
  const w1 = await P.evaluate(() => [0, 1, 2].map(t => sx4Vol(t)));
  await P.evaluate(() => undo());
  await touch(P, 'touchStart', [{id: 6, ...C2}]); await wait(620); await touch(P, 'touchEnd', []); await wait(200);
  await touch(P, 'touchStart', [{id: 7, ...C3}]); await wait(620); await touch(P, 'touchEnd', []); await wait(200);
  const so3 = await P.evaluate(() => [0, 1, 2].map(t => sx4IsSolo(t)));
  await P.evaluate(() => sx4SoloClear());
  const o0 = await P.evaluate(() => SYNQUENZER.ux2Order());
  await touch(P, 'touchStart', [{id: 8, x: A.l + 4, y: A.y}]); await wait(30);
  for (let k = 1; k <= 5; k++) { await touch(P, 'touchMove', [{id: 8, x: A.l + 4 + k * 8, y: A.y}]); await wait(20); }
  for (let k = 1; k <= 8; k++) { await touch(P, 'touchMove', [{id: 8, x: A.l + 44, y: A.y + k * (C3.y - A.y) / 8}]); await wait(30); }
  await touch(P, 'touchEnd', []); await wait(400);
  const o1 = await P.evaluate(() => SYNQUENZER.ux2Order());
  ok('alte Gesten bleiben: Wischen ohne Gruppe = nur SYNTH 2, Halten = Solo, zwei nacheinander = Mehrfach-Solo, Rand-Ziehen verschiebt die Spur', w1[0] === w0[0] && w1[2] === w0[2] && w1[1] !== w0[1] && JSON.stringify(so3) === '[false,true,true]' && JSON.stringify(o1) !== JSON.stringify(o0) && (await P.evaluate(() => SYNQUENZER.ui1.sel().length)) === 0, {w0, w1, so3, o0, o1});
  await P.evaluate(() => undo());
}
/* ===================== 6 Leucht-Look ===================== */
{
  const boxes = p => p.evaluate(async () => { await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))); return [...document.querySelectorAll('body *')].filter(e => !e.closest('.ui1ring,.ui1tour,.toast')).map(e => { const r = e.getBoundingClientRect(); return [r.left, r.top, r.width, r.height].map(v => Math.round(v * 10) / 10).join(','); }); });
  const def = await PL.evaluate(() => document.body.classList.contains('ui1glow'));
  ok('Leucht-Look ist ab Werk AUS', def === false);
  const views = [['Matrix', () => { SYNQUENZER.ui1.home(); setSongView(false); }], ['Klang-Editor', () => { SYNQUENZER.ui1.home(); selectTrack(0); ED.tab = 'osc'; openEditor(); }], ['Song', () => { SYNQUENZER.ui1.home(); setSongView(true); }], ['Menü', () => { SYNQUENZER.ui1.home(); setSongView(false); openMenu(); }]];
  const diffs = [];
  for (const pg of [P, PL]) for (const [n, fn] of views) {
    await pg.evaluate(`(${fn.toString()})()`); await pg.evaluate(() => SYNQUENZER.ui1.glow(false)); await pg.waitForTimeout(900);
    const a = await boxes(pg); await pg.evaluate(() => SYNQUENZER.ui1.glow(true)); const c = await boxes(pg);
    let d = a.length === c.length ? 0 : 999; if (!d) for (let k = 0; k < a.length; k++) if (a[k] !== c[k]) d++;
    diffs.push((pg === P ? 'P ' : 'L ') + n + ' ' + a.length + ':' + d);
  }
  ok('Leucht-Look an/aus: kein Element verschiebt sich (Box-Vergleich Matrix, Editor, Song, Menü; hochkant + quer)', diffs.every(x => / 0$|:0$/.test(x)), diffs);
  // per Touch im Menü › Bedienung einschalten; bleibt nach dem Neuladen an
  await PL.evaluate(() => { SYNQUENZER.ui1.glow(false); SYNQUENZER.ui1.home(); openMenu(); });
  const an = await PL.evaluate(() => { const r = [...document.querySelectorAll('#menu .ui1glw button')].find(b => b.textContent === 'An'); r.scrollIntoView({block: 'center'}); const q = r.getBoundingClientRect(); return {x: q.left + q.width / 2, y: q.top + q.height / 2, h: q.height}; });
  await PL.waitForTimeout(250); await tapAt(PL, an);
  const on1 = await PL.evaluate(() => ({c: document.body.classList.contains('ui1glow'), pref: uiPrefs().ui1glow}));
  await PL.reload(); await PL.waitForFunction(() => window.SYNQUENZER, null, {timeout: 60000}); await PL.waitForTimeout(600);
  const on2 = await PL.evaluate(() => document.body.classList.contains('ui1glow'));
  ok('Menü › Bedienung › Leucht-Look „An“ (Touch, Taste ≥ 44 px): an, gemerkt auf dem Gerät, nach Neuladen weiter an', on1.c && on1.pref === true && on2 && an.h >= 44, {on1, on2, h: an.h});
  // Foto quer: Leucht-Look an, Szene läuft
  await PL.evaluate(() => { ensureAudio(); SYNQUENZER.ui1.home(); setSongView(false); launchScene(0); });
  await PL.waitForTimeout(1500);
  await PL.screenshot({path: OUT + 'ui1-l-leuchtlook.png'});
  await PL.evaluate(() => { try { stopAll && stopAll(); } catch (e) {} try { if (R.playing) togglePlay(); } catch (e) {} SYNQUENZER.ui1.glow(false); });
}
/* ===================== 7 alte Projekte gleich ===================== */
{
  const s0 = await B.evaluate(() => SYNQUENZER.serialize());
  const s1 = await P.evaluate(s => { SYNQUENZER.importJSON(s); return SYNQUENZER.serialize(); }, s0);
  ok('altes Projekt (aus 4.47) lädt und speichert Zeichen für Zeichen gleich', s0 === s1, {len: s0.length});
}
const errs = [...P.errs, ...PL.errs, ...B.errs, ...BL.errs];
ok('keine Fehler in der Konsole', errs.length === 0, errs.slice(0, 5));
const nOk = results.filter(r => r.pass).length;
console.log(`\n${nOk}/${results.length} OK`);
fs.writeFileSync(OUT + 'ui1-test.json', JSON.stringify(results, null, 1));
await b.close();
