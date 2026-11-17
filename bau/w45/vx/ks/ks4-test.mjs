// KS4 (Klangschule, Engine-Wünsche E4–E7) – Abnahme in Chromium, hochkant (390×844) und quer (844×390)
// Aufruf: node ks4-test.mjs <index.html> <index.vor-ks4.html> [fotos-ordner]
// Prüft: Bedienung per Fingertipp (HÜLLK. › TAKT, LFO › Raster-Chip + Blatt, FILTER › FILTER 2 + Typ, OSZ › STIMME › Tonh.-Hk.),
// je ein ↶ und ↶ = bitgleich; bestehende Regler liegen genau wie in der Fassung davor (Rechtecke je data-key, beide Lagen);
// neue Teile im Bild, ohne Überlappung; FM ohne FILTER 2; Guide-Einträge springen zum Ziel; Regel 28 (neutral = Schlüssel fehlt,
// Werksklänge ohne KS4-Schlüssel); Speichern/Laden bitgleich; alte Projekte (Fassung davor) laden und speichern bitgleich; der
// laufende Klang (Worklet) bekommt beim ganzen Klang ohne KS4-Schlüssel die neutralen Werte; Engine-Sonden E4–E7 (Takt =
// Sekunden bitgleich, Tonh.-Hk. = Route, Stufen/Halbton/Quinte/Glätten, Kerbe/Parallel/BP/Hüllkurve); Lektionen L9 Bonus 2,
// L10 Bonus 2, L9 Laser mit Tonh.-Hk., W2 Schicht 4, R05, R09 (Rahmen, Start ✗ / Lösung ✓, ✕ bitgleich, Pegel und Anteile);
// CPU: Offline-Render vorher/nachher (ohne KS4-Schlüssel, mit Filter 2, mit allem); keine Fehler in der Konsole.
import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
import path from 'node:path';
const file = path.resolve(process.argv[2]), base = path.resolve(process.argv[3]), fotos = process.argv[4] ? path.resolve(process.argv[4]) : null;
const b = await chromium.launch({args: ['--autoplay-policy=no-user-gesture-required']});
let pass = 0, fail = 0;
const ok = (c, name, info) => { if (c) pass++; else fail++; console.log((c ? 'OK   ' : 'FEHL ') + name + (info != null ? '  ' + (typeof info === 'string' ? info : JSON.stringify(info)) : '')); };
const r1 = v => (v == null ? v : Math.round(v * 10) / 10);
const inter = (a, c) => a && c && a.x < c.x + c.w - 1 && a.x + a.w > c.x + 1 && a.y < c.y + c.h - 1 && a.y + a.h > c.y + 1;

async function page(f, w, h) {
  const p = await b.newPage({viewport: {width: w, height: h}, hasTouch: true, isMobile: true, deviceScaleFactor: 1});
  p._errs = []; p.on('pageerror', e => p._errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') p._errs.push(m.text()); });
  await p.goto('file://' + f); await p.waitForFunction(() => window.SYNQUENZER && BOOT.done, null, {timeout: 180000}); await p.waitForTimeout(700);
  return p;
}
const X = (p, f, a) => p.evaluate(f, a);
const wait = (p, ms) => p.waitForTimeout(ms);
async function tapVis(p, sel) {
  const hs = await p.$$(sel);
  for (const hd of hs) { const bb = await hd.boundingBox(); if (bb && bb.width > 2 && bb.height > 2) { await p.touchscreen.tap(bb.x + bb.width / 2, bb.y + bb.height / 2); return bb; } }
  return null;
}
const nVis = (p, sel) => X(p, sel => [...document.querySelectorAll(sel)].filter(e => { const r = e.getBoundingClientRect(); return r.width > 2 && r.height > 2 && getComputedStyle(e).visibility !== 'hidden'; }).length, sel);
const SER = p => X(p, () => { const o = JSON.parse(serialize()); delete o.project.ui; return JSON.stringify(o); });
const ksKeys = (p, t) => X(p, t => Object.fromEntries(Object.entries(S.tracks[t].sound.p).filter(([k]) => /^ks/.test(k))), t);
// eine Seite des Klang-Editors öffnen (VA-Spur) und die Rechtecke aller Regler mit data-key holen
async function openPg(p, t, tab, sub) {
  await X(p, ([t, tab, sub]) => { selectTrack(t); ED.tab = tab; ED.sub[tab] = sub; openEditor(); }, [t, tab, sub]); await wait(p, 450);
}
const rects = p => X(p, () => { const sh = EL.synthSheet, o = {}; for (const e of sh.querySelectorAll('.sh-body [data-key]')) { const r = e.getBoundingClientRect(); if (r.width < 2 || r.height < 2) continue;
  const k = e.dataset.key + (o[e.dataset.key] ? '#2' : ''); o[k] = {x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height)}; } return o; });
const pgBox = p => X(p, () => { const pg = EL.synthSheet.querySelector('.pg'), r = (pg || EL.synthSheet).getBoundingClientRect(), s = EL.synthSheet.getBoundingClientRect(); return {x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height), sx: Math.round(s.x), sw: Math.round(s.width), vw: innerWidth}; });

const PAGES = [['env', 'amp'], ['env', 'mod'], ['lfo', 'l1'], ['lfo', 'l2'], ['filter', 'ctl'], ['osc', 'voice']];
for (const [w, h, tag] of [[390, 844, 'hochkant'], [844, 390, 'quer']]) {
  // ---- Fassung davor: Rechtecke der Regler auf denselben Seiten ----
  const pb = await page(base, w, h);
  const tb = await X(pb, () => ui1SynthT(false)), RB = {};
  for (const [tab, sub] of PAGES) { await openPg(pb, tb, tab, sub); RB[tab + '/' + sub] = await rects(pb); }
  await pb.close();
  const p = await page(file, w, h);
  const t = await X(p, () => ui1SynthT(false));
  ok(await X(p, t => S.tracks[t].sound.engine === 'analog' && !Object.keys(S.tracks[t].sound.p).some(k => /^ks/.test(k)), t), tag + ' VA-Spur ' + t + ': Klang ohne KS4-Schlüssel');
  // ---- bestehende Regler liegen wie vorher; neue Teile im Bild, ohne Überlappung ----
  const moved = {}, news = {};
  for (const [tab, sub] of PAGES) {
    await openPg(p, t, tab, sub); const RN = await rects(p), B = await pgBox(p), id = tab + '/' + sub, rb = RB[id];
    const mv = Object.keys(rb).filter(k => RN[k] && ['x', 'y', 'w', 'h'].some(q => Math.abs(RN[k][q] - rb[k][q]) > 1)), gone = Object.keys(rb).filter(k => !RN[k]);
    if (mv.length || gone.length) moved[id] = {mv: mv.map(k => k + ' ' + JSON.stringify(rb[k]) + '→' + JSON.stringify(RN[k])), gone};
    const nk = Object.keys(RN).filter(k => !rb[k]), bad = [];
    for (const k of nk) { const r = RN[k]; if (r.x < B.sx - 1 || r.x + r.w > B.sx + B.sw + 1 || r.x < -1 || r.x + r.w > B.vw + 1) bad.push(k + ' außerhalb');
      for (const q of Object.keys(RN)) if (q !== k && inter(r, RN[q]) && !(k.startsWith('ks4t') && q === 'aCurve')) bad.push(k + '∩' + q); }
    news[id] = {neu: nk, bad};
    if (fotos) await p.screenshot({path: fotos + '/ks4-' + tab + '-' + sub + '-' + tag + '.png'});
  }
  ok(!Object.keys(moved).length, tag + ' bestehende Regler auf HÜLLK. AMP/MOD, LFO 1/2, FILTER REGLER, OSZ STIMME genau wie vorher (±1 px)', Object.keys(moved).length ? moved : null);
  ok(Object.values(news).every(v => !v.bad.length) && news['env/amp'].neu.length && news['lfo/l1'].neu.length && news['osc/voice'].neu.length, tag + ' neue Teile im Bild, ohne Überlappung', Object.fromEntries(Object.entries(news).map(([k, v]) => [k, v.neu.join(',') + (v.bad.length ? ' ✗ ' + v.bad.join(';') : '')])));

  // ---- E4: HÜLLK. › MOD › TAKT per Fingertipp ----
  await openPg(p, t, 'env', 'mod');
  const s0 = await SER(p), u0 = await X(p, () => UNDO.length), sec0 = await X(p, t => { const q = S.tracks[t].sound.p; return [q.mA, q.mD, q.mR]; }, t);
  ok(await nVis(p, '.ks4tt') === 1, tag + ' genau ein TAKT-Schalter sichtbar (' + (tag === 'hochkant' ? 'in der Grafik oben rechts' : 'am Ende der Form-Zeile') + ')');
  await tapVis(p, '.ks4tt'); await wait(p, 500);
  const e4 = await X(p, t => { const q = S.tracks[t].sound.p; return {k: [q.ksMa, q.ksMd, q.ksMr], want: [q.mA, q.mD, q.mR].map(s => ks4Beats(s)), sec: [q.mA, q.mD, q.mR], u: UNDO.length, top: UNDO[UNDO.length - 1].label,
    lab: [...EL.synthSheet.querySelectorAll('.ks4tk')].map(k => k.textContent.replace(/\s+/g, ' ').trim()), on: [...document.querySelectorAll('.ks4tt')].every(x => x.classList.contains('on'))}; }, t);
  ok(e4.k.every((v, i) => v > 0 && v === e4.want[i]) && e4.on && e4.lab.length === 3, tag + ' TAKT an: A/D/R in Noten (' + e4.lab.join(' | ') + '), Schalter leuchtet', e4);
  ok(e4.u === u0 + 1 && /Hüllk\. 2 Zeit TAKT/.test(e4.top), tag + ' TAKT = ein ↶ „' + e4.top + '“');
  const d1 = await X(p, t => SYNQUENZER.k1Dump(t), t);
  ok(d1 && d1.P.ksMa === e4.k[0] && d1.P.ksMr === e4.k[2], tag + ' die laufende Engine hat die Noten-Zeiten', d1 && [d1.P.ksMa, d1.P.ksMd, d1.P.ksMr]);
  await X(p, () => undo()); await wait(p, 400);
  const d2 = await X(p, t => SYNQUENZER.k1Dump(t), t);
  ok(await SER(p) === s0 && d2 && d2.P.ksMa === 0 && d2.P.ksMd === 0, tag + ' ↶: Projekt bitgleich, Engine wieder in Sekunden');
  await tapVis(p, '.ks4tt'); await wait(p, 400);
  // Note im TAKT ändern (wie ein Dreh am Regler): Sekunden laufen gespiegelt mit; dann FREI: Sekunden = die Noten, Schlüssel weg
  await X(p, t => { const kn = EL.synthSheet.querySelector('.ks4tk[data-key="ksMa"]'); const before = soundSnapshot(t); setP(t, 'ksMa', 4); setP(t, 'mA', ks4Sec('mA', 4)); commitSound(t, before, 'A'); }, t); await wait(p, 200);
  await tapVis(p, '.ks4tt'); await wait(p, 500);
  const e4f = await X(p, t => { const q = S.tracks[t].sound.p; return {keys: Object.keys(q).filter(k => /^ks/.test(k)), mA: q.mA, want: 4 * 60 / S.bpm, lab: EL.synthSheet.querySelectorAll('.ks4tk').length}; }, t);
  ok(!e4f.keys.length && Math.abs(e4f.mA - Math.min(10, e4f.want)) < 1e-9 && !e4f.lab, tag + ' FREI: ATTACK = 1/1 als Sekunden (' + r1(e4f.mA * 100) / 100 + ' s), keine KS4-Schlüssel, Regler wieder in Sekunden', e4f);
  await X(p, () => { undo(); undo(); undo(); }); await wait(p, 400);
  ok(await SER(p) === s0, tag + ' drei ↶ zurück: Projekt bitgleich');

  // ---- E5: LFO 1 › Raster per Chip und Blatt ----
  await openPg(p, t, 'lfo', 'l1');
  const s1 = await SER(p);
  ok(await nVis(p, '.ks4rc') === 1, tag + ' genau ein Raster-Chip sichtbar (' + (tag === 'hochkant' ? 'flache Zeile unter S&H Tonart' : 'neben START') + ')');
  await tapVis(p, '.ks4rc'); await wait(p, 400);
  const pop = await X(p, () => { const q = document.querySelector('.pop'); return q ? {r: q.querySelectorAll('button[data-r]').length, g: q.querySelectorAll('button[data-g]').length, h: q.querySelector('h4') && q.querySelector('h4').textContent, st: (q.querySelector('.ks4rh') || {}).textContent} : null; });
  ok(pop && pop.r === 10 && pop.g === 4, tag + ' Blatt „Raster“: Aus, Halbton, Quinte + Oktave, 7 Stufen-Werte; Glätten 4 Werte; Zustand oben', pop);
  await tapVis(p, '.pop button[data-r="8"]'); await wait(p, 400);
  await tapVis(p, '.ks4rc'); await wait(p, 300); await tapVis(p, '.pop button[data-g="0.5"]'); await wait(p, 400);
  const e5 = await X(p, t => ({k: Object.fromEntries(Object.entries(S.tracks[t].sound.p).filter(([k]) => /^ks/.test(k))), chip: [...document.querySelectorAll('.ks4rc')].map(c => c.textContent), top: UNDO[UNDO.length - 1].label}), t);
  ok(e5.k.ksR1 === 8 && e5.k.ksG1 === .5 && Object.keys(e5.k).length === 2 && e5.chip.some(c => /8 STUFEN/.test(c)), tag + ' 8 Stufen und Glätten 50 % gesetzt, Chip zeigt es', e5);
  const d3 = await X(p, t => SYNQUENZER.k1Dump(t), t);
  ok(d3 && d3.P.ksR1 === 8 && d3.P.ksG1 === .5, tag + ' Engine: Raster 8, Glätten 50 %');
  await X(p, () => { undo(); undo(); }); await wait(p, 400);
  ok(await SER(p) === s1, tag + ' zwei ↶: Projekt bitgleich');

  // ---- E6: FILTER › FILTER 2 (Unter-Reiter, nur VA) ----
  await openPg(p, t, 'filter', 'ctl');
  const s2 = await SER(p);
  ok(await nVis(p, '#synthSheet .stab[data-sub="f2"]') === 1, tag + ' Unter-Reiter FILTER 2 sichtbar');
  await tapVis(p, '#synthSheet .stab[data-sub="f2"]'); await wait(p, 500);
  const f2a = await X(p, () => ({sub: ED.sub.filter, pg: !!EL.synthSheet.querySelector('.pg.ks4f2'), info: (EL.synthSheet.querySelector('.ks4f2i') || {}).textContent || '', inert: [...EL.synthSheet.querySelectorAll('.ks4f2 [data-key="ksF2c"]')].map(e => e.classList.contains('inert'))}));
  ok(f2a.sub === 'f2' && f2a.pg && /aus/.test(f2a.info), tag + ' FILTER 2: Seite offen, „ist aus“, Regler gesperrt', f2a);
  await X(p, () => { const b = [...EL.synthSheet.querySelectorAll('.ks4ft button')].find(x => x.textContent.trim() === 'KERBE'); b.dataset.ks4test = '1'; });
  await tapVis(p, '.ks4ft button[data-ks4test="1"]'); await wait(p, 500);
  const f2b = await X(p, t => ({k: Object.fromEntries(Object.entries(S.tracks[t].sound.p).filter(([k]) => /^ks/.test(k))), info: (EL.synthSheet.querySelector('.ks4f2i') || {}).textContent, u: UNDO[UNDO.length - 1].label}), t);
  ok(f2b.k.ksF2 === 4 && Object.keys(f2b.k).length === 7 && f2b.k.ksF2c === 1000 && /Reihe/.test(f2b.info), tag + ' KERBE: Filter 2 an mit 7 Werten (Grundwerte), Hinweis passt', f2b);
  if (fotos) await p.screenshot({path: fotos + '/ks4-filter-f2-' + tag + '.png'});
  const R2 = await rects(p), B2 = await pgBox(p), badF2 = Object.entries(R2).filter(([k, r]) => r.x < B2.sx - 1 || r.x + r.w > B2.sx + B2.sw + 1 || r.y + r.h > h + 1 || Object.entries(R2).some(([q, z]) => q !== k && inter(r, z))).map(([k]) => k);
  ok(!badF2.length && ['ksF2', 'ksF2w', 'ksF2q', 'ksF2c', 'ksF2r', 'ksF2e', 'ksF2m'].every(k => R2[k]), tag + ' FILTER 2: alle 7 Bedienteile im Bild, ohne Überlappung', badF2.length ? badF2 : null);
  await X(p, () => { const b = [...EL.synthSheet.querySelectorAll('.ks4ft button')].find(x => x.textContent.trim() === 'AUS'); b.dataset.ks4test = '2'; });
  await tapVis(p, '.ks4ft button[data-ks4test="2"]'); await wait(p, 400);
  ok(!Object.keys(await ksKeys(p, t)).length, tag + ' AUS: alle Filter-2-Schlüssel weg (Regel 28)');
  await X(p, () => { undo(); undo(); }); await wait(p, 300);
  ok(await SER(p) === s2, tag + ' zwei ↶: Projekt bitgleich');
  // FM: kein FILTER 2
  const fm = await X(p, async t => { const s = deep(factorySound(INIT_IDS.fm6)); applySound(t, s); await new Promise(r => setTimeout(r, 300)); ED.tab = 'filter'; ED.sub.filter = 'ctl'; openEditor(); await new Promise(r => setTimeout(r, 300));
    return {eng: S.tracks[t].sound.engine, f2: !!EL.synthSheet.querySelector('.stab[data-sub="f2"]'), tabs: [...EL.synthSheet.querySelectorAll('.stab')].map(x => x.dataset.sub)}; }, t);
  ok(fm.eng !== 'analog' && !fm.f2, tag + ' FM-Klang: kein Unter-Reiter FILTER 2', fm);
  await X(p, () => undo()); await wait(p, 400);

  // ---- E7: OSZ › STIMME › Tonh.-Hk. ----
  await openPg(p, t, 'osc', 'voice');
  const s3 = await SER(p);
  const e7 = await X(p, async t => { const kn = EL.synthSheet.querySelector('[data-key="ksPe"]'), fz = EL.synthSheet.querySelector('[data-key="ks4mD"]'); const before = soundSnapshot(t); ks4Set(t, 'ksPe', 24); commitSound(t, before, 'Tonh.-Hk.');
    await new Promise(r => setTimeout(r, 250)); const d = await SYNQUENZER.k1Dump(t); return {kn: !!kn, fz: !!fz, txt: kn && kn.textContent.replace(/\s+/g, ' '), p: S.tracks[t].sound.p.ksPe, eng: d && d.P.ksPe, fzTxt: fz && fz.textContent.replace(/\s+/g, ' ')}; }, t);
  ok(e7.kn && e7.fz && e7.p === 24 && e7.eng === 24 && /24/.test(e7.txt), tag + ' Tonh.-Hk. +24 HT (Regler zeigt „' + e7.txt.trim() + '“), Fallzeit daneben, Engine hat ihn', e7);
  await X(p, () => undo()); await wait(p, 300);
  ok(await SER(p) === s3, tag + ' ↶: Projekt bitgleich');

  // ---- Guide „Wo finde ich …?“ ----
  const gd = [];
  for (const id of ['ks4t', 'ks4r', 'ks4f2', 'ks4pe']) { await X(p, id => ui1Jump(id), id); await wait(p, 1300); const r = await X(p, () => UI1.lastJump); gd.push(id + ':' + (r && r.ok && r.target ? 'ok' : 'FEHLT')); await X(p, () => { try { ui1RingOff(); } catch (e) {} }); }
  ok(gd.every(x => /ok$/.test(x)), tag + ' Guide: 4 Einträge springen zum Ziel', gd.join(' '));
  const se = await X(p, () => Object.fromEntries([['Hüllkurve Takt', 'ks4t'], ['Treppe Stufen', 'ks4r'], ['Kerbfilter', 'ks4f2'], ['Tonhöhen-Hüllkurve', 'ks4pe']].map(([q, id]) => [q, ui1Search(q).slice(0, 4).map(e => e.id).includes(id)])));
  ok(Object.values(se).every(Boolean), tag + ' Suche findet die 4 Einträge', se);

  // ---- Lektionen: L9 Bonus 2, L10 Bonus 2, W2 Schicht 4, R05 (Rahmen auf sichtbaren Zielen, ✕ bitgleich) ----
  await X(p, () => closeEditor()); await wait(p, 300);
  const s4 = await SER(p), les = {};
  for (const [id, k] of [['L9', 2], ['L10', 2], ['W2', 3], ['R05', 0], ['R09', 0]]) {
    await X(p, ([id, k]) => SYNQUENZER.ks.x().start(id, k), [id, k]);
    try { await p.waitForFunction(() => { const s = SYNQUENZER.ks.x().state(); return s && s.rings.length >= 2 && s.rings.every(r => r.tgt); }, null, {timeout: 6000, polling: 100}); } catch (e) {}
    await wait(p, 300);
    const st = await X(p, () => { const s = SYNQUENZER.ks.x().state(); return {rings: s.rings.map(r => r.lb + (r.tgt ? '' : '✗')), tab: s.tab, sub: s.sub, msg: s.msg, keys: Object.keys(SYNQUENZER.ks.x().sound().p).filter(k => /^ks/.test(k))}; });
    les[id + '/' + (k + 1)] = st;
    if (fotos && tag === 'hochkant') await p.screenshot({path: fotos + '/ks4-les-' + id + '-' + (k + 1) + '-' + tag + '.png'});
    if (id === 'L9' || id === 'L10') { const r = await X(p, () => SYNQUENZER.ks.x().sol()); les[id + '/' + (k + 1)].sol = r && r.msg; }
    await X(p, () => SYNQUENZER.ks.x().close()); await wait(p, 350);
  }
  ok(Object.values(les).every(s => s.rings.length >= 2 && s.rings.every(r => !/✗$/.test(r))), tag + ' Lektionen L9/3, L10/3, W2/4, R05, R09: Rahmen auf sichtbaren Zielen', Object.fromEntries(Object.entries(les).map(([k, v]) => [k, v.tab + '/' + v.sub + ' ' + v.rings.join(',')])));
  ok(/^✓/.test(les['L9/3'].sol || '') && /^✓/.test(les['L10/3'].sol || ''), tag + ' L9 Bonus 2 und L10 Bonus 2: Lösung = ✓', [les['L9/3'].sol, les['L10/3'].sol]);
  ok(les['W2/4'].keys.includes('ksF2') && les['R05/1'].keys.includes('ksF2') && les['R05/1'].tab === 'filter' && les['R05/1'].sub === 'f2', tag + ' W2 Schicht 4 und R05 tragen FILTER 2, R05 zeigt FILTER 2', {w2: les['W2/4'].keys.length, r05: les['R05/1'].tab + '/' + les['R05/1'].sub});
  ok(await SER(p) === s4, tag + ' nach 5 Lektionen und ✕: Projekt bitgleich');
  ok(!p._errs.length, tag + ' keine Fehler in der Konsole', p._errs.slice(0, 4));
  await p.close();
}

// ================= kleinere Schirme: Dichte-Stufe der Seiten wie vorher, Raster-Chip sichtbar =================
{
  const fitOf = async (f, w, h) => { const q = await page(f, w, h), o = {};
    for (const [tab, sub] of [['lfo', 'l1'], ['env', 'mod'], ['osc', 'voice'], ['filter', 'ctl']]) { await openPg(q, await X(q, () => ui1SynthT(false)), tab, sub);
      o[tab] = await X(q, () => { const bd = EL.synthSheet.querySelector('.sh-body'), c = [...EL.synthSheet.querySelectorAll('.ks4rc, .ks4tt')].filter(e => { const r = e.getBoundingClientRect(); return r.width > 2 && r.height > 2; }).map(e => e.dataset.key);
        return [...bd.classList].filter(c => /^fit|qf1s/.test(c)).join(' ') + (c.length ? ' [' + c.join(',') + ']' : ''); }); }
    await q.close(); return o; };
  const res = {}, bad = [];
  for (const [w, h] of [[375, 667], [360, 740], [414, 896], [320, 568]]) { const a = await fitOf(base, w, h), n = await fitOf(file, w, h); res[w + 'x' + h] = n;
    for (const k in a) if (n[k].replace(/ \[.*$/, '') !== a[k]) bad.push(w + 'x' + h + ' ' + k + ': ' + a[k] + ' → ' + n[k]);
    if (!/ksR1/.test(n.lfo)) bad.push(w + 'x' + h + ' kein Raster-Chip'); }
  ok(!bad.length, 'kleinere Schirme (375×667, 360×740, 414×896, 320×568): Dichte-Stufe je Seite wie vorher, Raster-Chip und TAKT sichtbar', bad.length ? bad : res);
}

// ================= Daten, Engine, Lektionen, CPU (hochkant) =================
const p = await page(file, 390, 844);
// Regel 28 und Speichern/Laden
const d = await X(p, async () => {
  const out = {}, KS = Object.keys(KS4N);
  out.fac = FACTORY.filter(f => f.engine === 'analog' || f.engine === 'fm6' || f.engine === 'fm2').filter(f => KS.some(k => k in (SQStore.normalizeSound(deep(f)).p || {}))).map(f => f.id);
  out.nFac = FACTORY.length;
  const N = SQStore.normalizeSound({engine: 'analog', name: 'n', p: Object.assign({}, factorySound(INIT_IDS.analog).p, KS4N), mods: [], fx: {}}).p;
  out.neutral = Object.keys(N).filter(k => /^ks/.test(k));
  const off = SQStore.normalizeSound({engine: 'analog', name: 'n', p: Object.assign({}, factorySound(INIT_IDS.analog).p, {ksF2: 0, ksF2w: 1, ksF2c: 300, ksF2m: .5}), mods: [], fx: {}}).p;
  out.f2off = Object.keys(off).filter(k => /^ks/.test(k));
  const cl = SQStore.normalizeSound({engine: 'analog', name: 'n', p: Object.assign({}, factorySound(INIT_IDS.analog).p, {ksMa: 999, ksR1: 40, ksG1: 7, ksF2: 9, ksF2c: 5, ksF2e: -3, ksPe: 99, ksAd: -2, ksR2: 'x'}), mods: [], fx: {}}).p;
  out.clamp = Object.fromEntries(Object.entries(cl).filter(([k]) => /^ks/.test(k)));
  // Speichern/Laden: alle Gruppen auf einer Spur
  const t = ui1SynthT(false), V = {ksAa: 1, ksAr: 2, ksFd: .5, ksMa: 32, ksR1: 8, ksG1: .5, ksR2: 2, ksF2: 2, ksF2w: 1, ksF2c: 2500, ksF2r: .1, ksF2m: .45, ksF2q: 1, ksF2e: -.5, ksPe: -12};
  const before = soundSnapshot(t); for (const k in V) setP(t, k, V[k]); commitSound(t, before, 'test'); await new Promise(r => setTimeout(r, 300));
  const s1 = serialize(); applyProject(normalizeProject(projFromFile(JSON.parse(s1))), {}); await new Promise(r => setTimeout(r, 1200));
  const s2 = serialize(), got = Object.fromEntries(Object.entries(S.tracks[t].sound.p).filter(([k]) => /^ks/.test(k)));
  out.rt = {same: s1 === s2, keys: JSON.stringify(got) === JSON.stringify(Object.fromEntries(KS4_ORD.filter(k => k in V).map(k => [k, V[k]]))), got};
  ensureAudio(); selectTrack(t); openEditor();   // Audio an (wie nach dem ersten Fingertipp), dann entsteht die Engine der Spur
  for (let k = 0; k < 40 && !AU.synth[t]; k++) { syncEngine(t, true); await new Promise(r => setTimeout(r, 150)); }
  await new Promise(r => setTimeout(r, 400));
  const dmp = await SYNQUENZER.k1Dump(t); out.live1 = dmp ? KS.filter(k => dmp.P[k] !== (k in V ? V[k] : KS4N[k])) : 'keine Engine';
  // ganzer Klang ohne KS4-Schlüssel → die laufende Engine bekommt die neutralen Werte
  applySound(t, deep(factorySound(INIT_IDS.analog))); await new Promise(r => setTimeout(r, 500));
  const dm2 = await SYNQUENZER.k1Dump(t); out.live2 = dm2 ? KS.filter(k => dm2.P[k] !== KS4N[k]) : 'keine Engine'; closeEditor();
  out.t = t; return out;
});
ok(!d.fac.length, 'Regel 28: kein Werksklang (VA/FM, ' + d.nFac + ' Klänge) trägt KS4-Schlüssel', d.fac.slice(0, 5));
ok(!d.neutral.length && !d.f2off.length, 'Regel 28: neutrale Werte und Filter 2 AUS werden nicht gespeichert', {n: d.neutral, off: d.f2off});
ok(d.clamp.ksMa === 64 && d.clamp.ksR1 === 16 && d.clamp.ksG1 === 1 && d.clamp.ksF2 === 4 && d.clamp.ksF2c === 20 && d.clamp.ksF2e === -1 && d.clamp.ksPe === 48 && !('ksAd' in d.clamp) && !('ksR2' in d.clamp), 'Laden: ungültige Werte begrenzt oder verworfen', d.clamp);
ok(d.rt.same && d.rt.keys, 'Speichern/Laden: 15 KS4-Werte bitgleich, Projekt bitgleich', d.rt.got);
ok(Array.isArray(d.live1) && !d.live1.length, 'nach dem Laden spielt die Engine genau diese Werte', d.live1);
ok(Array.isArray(d.live2) && !d.live2.length, 'ganzer Klang ohne KS4-Schlüssel: die laufende Engine geht auf neutral (Regel 28)', d.live2);
// alte Projekte: in der Fassung davor gespeichert, hier geladen und gespeichert = bitgleich
{
  const pb = await page(base, 390, 844);
  const old = await X(pb, async () => { const t = ui1SynthT(false); const s = deep(factorySound(FACTORY.find(f => f.engine === 'analog' && /pad|Pad/.test(f.name)).id)); applySound(t, s); await new Promise(r => setTimeout(r, 300)); return serialize(); });
  await pb.close();
  const nw = await X(p, async s => { applyProject(normalizeProject(projFromFile(JSON.parse(s))), {}); await new Promise(r => setTimeout(r, 1200)); return serialize(); }, old);
  ok(nw === old, 'altes Projekt (Fassung davor): laden und speichern bitgleich', nw === old ? null : {a: old.length, b: nw.length});
}
// Engine-Sonden E4–E7 (Offline, dasselbe Worklet)
const e = await X(p, async () => {
  { const el = document.getElementById('sq-worklet-src'); if (!el.dataset.ks4seed) { el.dataset.ks4seed = 1; el.textContent = 'Math.random = (() => { let s = 12345; return () => { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 4294967296; }; })();\n' + el.textContent; } }
  const base = o => { const b = factorySound(INIT_IDS.analog); return SQStore.normalizeSound({engine: 'analog', name: 'P', cat: 'eigene', p: Object.assign({}, b.p, {analog: 0, o2lvl: 0, o3lvl: 0, noise: 0, subLvl: 0, drive: 0, spread: 0, ftype: 0, cutoff: 20000, res: 0, fenv: 0, kt: 0}, o.p), mods: o.mods || [], fx: Object.assign({}, b.fx, {rev: 0, dly: 0, drive: 0})}); };
  const R = async (s, ev, o) => (await SYNQUENZER.mkRender(s, ev, Object.assign({sec: 2, seed: 1}, o || {}))).l;
  const dB = (x, y) => { let s = 0, r = 0; for (let i = 0; i < x.length; i++) { const d = x[i] - y[i]; s += d * d; r += y[i] * y[i]; } return r > 0 ? +(10 * Math.log10(Math.max(1e-30, s) / r)).toFixed(1) : null; };
  const out = {}, ev1 = [[0, 'on', 60, .8], [1.5, 'off', 60]], pit = [{src: 'menv', dst: 'pitch', amt: .5}];
  out.e4a = dB(await R(base({p: {mA: 1, mD: .5, mS: 1, aA: .5}, mods: pit}), ev1), await R(base({p: {mA: 1, mD: .5, mS: 1, aA: .5, ksMa: 2, ksAa: 1}, mods: pit}), ev1));
  out.e4b = dB(await R(base({p: {mA: 1, mD: .5, mS: 1, aR: .5}, mods: pit}), ev1, {bpm: 60}), await R(base({p: {mA: .3, mD: .5, mS: 1, aR: .3, ksMa: 1, ksAr: .5}, mods: pit}), ev1, {bpm: 60}));
  out.e4f = dB(await R(base({p: {ftype: 0, cutoff: 200, fenv: .6, fA: .75, fD: .5, fS: .5}}), ev1, {bpm: 160}), await R(base({p: {ftype: 0, cutoff: 200, fenv: .6, fA: .1, fD: .5, fS: .5, ksFa: 2}}), ev1, {bpm: 160}));
  out.e7 = dB(await R(base({p: {mA: .001, mD: .18, mS: 0, mCurve: .5}, mods: [{src: 'menv', dst: 'pitch', amt: 1}]}), ev1), await R(base({p: {mA: .001, mD: .18, mS: 0, mCurve: .5, ksPe: 24}}), ev1));
  out.e7b = dB(await R(base({p: {mA: .001, mD: .18, mS: 0, mCurve: .5}, mods: [{src: 'menv', dst: 'pitch', amt: 1}, {src: 'menv', dst: 'pitch', amt: 1}]}), ev1), await R(base({p: {mA: .001, mD: .18, mS: 0, mCurve: .5, ksPe: 48}}), ev1));
  const f0 = (x, t0, t1, sr = 48000) => { let n = 0, a = -1, z = -1; for (let i = Math.round(t0 * sr) + 1; i < Math.round(t1 * sr); i++) if (x[i - 1] <= 0 && x[i] > 0) { const f = i - 1 + x[i - 1] / (x[i - 1] - x[i]); if (a < 0) a = f; z = f; n++; } return n > 1 ? (n - 1) * sr / (z - a) : 0; };
  const ht = (x, t0, t1) => +(12 * Math.log2(f0(x, t0, t1) / 261.6256)).toFixed(2);
  const lfo = (o, mods) => base({p: Object.assign({o1w: 3, l1shape: 2, l1rate: 1, l1sync: 0, l1retrig: 1, aA: .001, aS: 1, aR: .01}, o), mods: mods || [{src: 'lfo1', dst: 'pitch', amt: .5}]});
  const ev2 = [[0, 'on', 60, .8], [1.9, 'off', 60]];
  const st = await R(lfo({ksR1: 4}), ev2); out.stufen = [.1, .35, .6, .85].map(t => ht(st, t, t + .08));
  const HT = [-10, -7, -4, -1, 3, 7, 10], tc = v => (v + 12.25) / 24;   // Säge −12 … +12 HT in 1 s: Stufe v liegt bei (v + 12 ± ½) / 24 s
  const hb = await R(lfo({ksR1: 1}), ev2); out.halb = HT.map(v => ht(hb, tc(v) - .006, tc(v) + .006));
  const q5 = await R(lfo({ksR1: 2}), ev2); out.quinte = [.05, .2, .33, .47, .61, .77, .93].map(t => ht(q5, t, t + .02));
  const fr = await R(lfo({}), ev2); out.frei = HT.map(v => ht(fr, tc(v) - .006, tc(v) + .006)); out.HT = HT;
  const jump = x => { let m = 0, prev = null; for (let t = .05; t < 1.8; t += .01) { const v = ht(x, t, t + .012); if (prev != null && isFinite(v) && isFinite(prev)) m = Math.max(m, Math.abs(v - prev)); prev = v; } return +m.toFixed(2); };
  out.sh = jump(await R(lfo({l1shape: 4, l1rate: 4}), ev2)); out.shG = jump(await R(lfo({l1shape: 4, l1rate: 4, ksG1: 1}), ev2));
  // S&H in der Tonart hat Vorrang vor dem Raster (gleicher Klang wie ohne Raster)
  out.kfShPrio = dB(await R(lfo({l1shape: 4, l1rate: 4, kfSh1: 1, ksR1: 1}), ev2), await R(lfo({l1shape: 4, l1rate: 4, kfSh1: 1}), ev2));
  const band = (x, lo, hi, sr = 48000) => { const N = 8192; let acc = 0, cnt = 0; for (let o = 4800; o + N < x.length - 4800; o += N / 2) { const re = new Float64Array(N); for (let i = 0; i < N; i++) re[i] = x[o + i] * (.5 - .5 * Math.cos(2 * Math.PI * i / N));
      for (let k = Math.floor(lo * N / sr); k <= Math.ceil(hi * N / sr); k++) { let s1 = 0, s2 = 0; const c = 2 * Math.cos(2 * Math.PI * k / N); for (let i = 0; i < N; i++) { const s0 = re[i] + c * s1 - s2; s2 = s1; s1 = s0; } acc += s1 * s1 + s2 * s2 - c * s1 * s2; cnt++; } }
    return +(10 * Math.log10(acc / Math.max(1, cnt) + 1e-30)).toFixed(1); };
  const nz = o => base({p: Object.assign({o1lvl: 0, noise: 1, aA: .001, aS: 1, aR: .01, poly: 1}, o)});
  const ev3 = [[0, 'on', 60, .8], [1.9, 'off', 60]], F2 = (t, o) => Object.assign({ksF2: t, ksF2w: 0, ksF2c: 1000, ksF2r: .2, ksF2m: 1, ksF2q: 0, ksF2e: 0}, o);
  const off = await R(nz({}), ev3), notch = await R(nz(F2(4)), ev3);
  out.notch = {aus: [band(off, 450, 550), band(off, 950, 1050), band(off, 1900, 2100)], kerbe: [band(notch, 450, 550), band(notch, 950, 1050), band(notch, 1900, 2100)]};
  const lp2 = await R(nz(Object.assign({ftype: 4, cutoff: 3000}, F2(1, {ksF2w: 1, ksF2c: 300}))), ev3), hp = await R(nz({ftype: 4, cutoff: 3000}), ev3);
  out.par = {hp: [band(hp, 150, 250), band(hp, 5000, 6000)], hpLp2: [band(lp2, 150, 250), band(lp2, 5000, 6000)]};
  const bp = await R(nz(F2(3, {ksF2r: .8})), ev3); out.bp = [band(bp, 250, 350), band(bp, 950, 1050), band(bp, 3000, 3300)];
  const ser = await R(nz(F2(1, {ksF2c: 500, ksF2m: .5})), ev3); out.wet = [band(off, 5000, 6000), band(ser, 5000, 6000)];
  const env = await R(nz({fA: .001, fD: .6, fS: 0, fCurve: .5, ksF2: 1, ksF2w: 0, ksF2c: 200, ksF2r: .2, ksF2m: 1, ksF2q: 0, ksF2e: .7}), [[0, 'on', 60, .8], [2.9, 'off', 60]], {sec: 3});
  const seg = (x, t0, t1) => x.slice(Math.round(t0 * 48000), Math.round(t1 * 48000)), rms = x => { let s = 0; for (const v of x) s += v * v; return +(10 * Math.log10(s / x.length + 1e-30)).toFixed(1); };
  const hpf = x => { const y = new Float32Array(x.length); let a = 0, pv = 0; const c = Math.exp(-2 * Math.PI * 2000 / 48000); for (let i = 0; i < x.length; i++) { a = c * (a + x[i] - pv); pv = x[i]; y[i] = a; } return y; };
  out.env = {frueh: rms(hpf(seg(env, .01, .06))), spaet: rms(hpf(seg(env, 1.5, 2.5)))};
  // FM: E7 und E4 wirken auch dort (gleiche Hüllkurven-Bausteine)
  const fmB = o => { const b = factorySound(INIT_IDS.fm6); return SQStore.normalizeSound({engine: b.engine, name: 'F', cat: 'eigene', p: Object.assign({}, b.p, o.p), mods: o.mods || [], fx: Object.assign({}, b.fx, {rev: 0, dly: 0, drive: 0})}); };
  out.fm7 = dB(await R(fmB({p: {mA: .001, mD: .18, mS: 0, mCurve: .5}}), ev1), await R(fmB({p: {mA: .001, mD: .18, mS: 0, mCurve: .5, ksPe: 24}}), ev1));
  out.fm7r = dB(await R(fmB({p: {mA: .001, mD: .18, mS: 0, mCurve: .5}, mods: [{src: 'menv', dst: 'pitch', amt: 1}]}), ev1), await R(fmB({p: {mA: .001, mD: .18, mS: 0, mCurve: .5, ksPe: 24}}), ev1));
  return out;
});
ok(e.e4a <= -90 && e.e4b <= -90 && e.e4f <= -90, 'E4: Zeiten in Noten = dieselben Sekunden (120 BPM: 2 Schläge = 1 s; 60 BPM; Filter-Hk. bei 160 BPM) bitgleich', {amp: e.e4a, bpm60: e.e4b, flt: e.e4f});
ok(e.e7 <= -90 && e.e7b <= -90, 'E7: Tonh.-Hk. +24 HT = Route Hüllk. 2 → Tonhöhe 100 %, +48 HT = zwei Routen (bitgleich)', {e24: e.e7, e48: e.e7b});
const lv = e.stufen.map(v => Math.round(v)), dist = new Set(lv).size;
ok(dist === 4 && e.stufen.every((v, i) => i === 0 || v > e.stufen[i - 1] + 4), 'E5: 4 Stufen aus der Säge (4 Tonhöhen, steigend)', e.stufen);
ok(e.halb.every((v, k) => Math.abs(v - e.HT[k]) <= .08) && e.frei.every((v, k) => Math.abs(v - e.HT[k] - .25) <= .08), 'E5: HALBTON rastet auf ganze Halbtöne (frei: ¼ HT daneben)', {halb: e.halb, frei: e.frei});
ok(e.quinte.every(v => [-12, -5, 0, 7, 12].some(q => Math.abs(v - q) <= .15)), 'E5: QUINTE + OKTAVE: nur −12, −5, 0, +7, +12 HT', e.quinte);
ok(e.shG < e.sh / 3, 'E5: Glätten 100 %: größter Sprung der S&H-Tonhöhe ' + e.sh + ' → ' + e.shG + ' HT', null);
ok(e.kfShPrio <= -90, 'E5: „S&H in der Tonart“ hat Vorrang vor dem Raster (bitgleich)', e.kfShPrio);
ok(e.notch.kerbe[1] < e.notch.aus[1] - 15 && Math.abs(e.notch.kerbe[0] - e.notch.aus[0]) < 4 && Math.abs(e.notch.kerbe[2] - e.notch.aus[2]) < 4, 'E6: KERBE 1 kHz: −' + r1(e.notch.aus[1] - e.notch.kerbe[1]) + ' dB in der Kerbe, Nachbarn ±4 dB', e.notch);
ok(e.par.hpLp2[0] > e.par.hp[0] + 20 && Math.abs(e.par.hpLp2[1] - e.par.hp[1]) < 3, 'E6: PARALLEL: HP 3 kHz + LP 300 Hz bringt die Tiefen zurück (+' + r1(e.par.hpLp2[0] - e.par.hp[0]) + ' dB), Höhen bleiben', e.par);
ok(e.bp[1] > e.bp[0] + 8 && e.bp[1] > e.bp[2] + 8, 'E6: BP 1 kHz: Spitze über den Nachbarn', e.bp);
ok(e.wet[1] < e.wet[0] - 4 && e.wet[1] > e.wet[0] - 8, 'E6: REIHE Anteil 50 %: Höhen halb trocken (−6 dB)', e.wet);
ok(e.env.frueh > e.env.spaet + 15, 'E6: Menge von Filt.-Hk.: Filter 2 offen am Anfang, zu am Ende (Höhen ' + e.env.frueh + ' → ' + e.env.spaet + ' dB)', null);
ok(e.fm7 > -20 && e.fm7r <= -60, 'E7 auf FM: Tonh.-Hk. wirkt, wie die Route', {aus: e.fm7, route: e.fm7r});

// Lektionen: Prüfungen, Pegel und Anteile
const L = await X(p, async () => {
  const A = SYNQUENZER.ks.x(), out = {};
  out.chk = {L9: A.check('L9').map(r => [r.start, r.sol]), L10: A.check('L10').map(r => [r.start, r.sol])};
  // L9 Laser auch mit Tonh.-Hk. statt der Route
  A.start('L9', 0); await new Promise(r => setTimeout(r, 400)); A.set('menv:pitch', 0); A.set('mD', .18); const r = A.set('ksPe', 24); out.laser = r && r.msg; A.close(); await new Promise(r => setTimeout(r, 300));
  // L9 Bonus 2: ATTACK in Sekunden reicht nicht
  A.start('L9', 2); await new Promise(r => setTimeout(r, 400)); const q = A.set('mA', 10); out.r8sec = q && q.msg; const q2 = A.set('ksMa', 32); out.r8takt = q2 && q2.msg; A.close(); await new Promise(r => setTimeout(r, 300));
  out.lvl = {};
  for (const [id, k, w] of [['W2', 3], ['R05', 0], ['R05', 0, 0], ['R05', 0, 'alt'], ['R09', 0], ['R09', 0, 'alt']]) out.lvl[id + '/' + (k + 1) + (w != null ? ' ' + w : '')] = +(await A.lvl(id, k, w)).toFixed(1);
  // Anteil der Filter-2-Schicht: (voll − ohne Filter 2) gegen den Rest, gleicher Zufall, ohne FX
  const F2 = ['ksF2', 'ksF2w', 'ksF2c', 'ksF2r', 'ksF2m', 'ksF2q', 'ksF2e'];
  const grab = async (id, k, alt) => { A.start(id, k); await new Promise(r => setTimeout(r, 300)); if (alt) { A.alt(); await new Promise(r => setTimeout(r, 300)); } const s = A.sound(); A.close(); await new Promise(r => setTimeout(r, 300)); return s; };
  const dry = s => { s = JSON.parse(JSON.stringify(s)); s.fx = Object.assign({}, s.fx, {rev: 0, dly: 0, drive: 0, chorus: Object.assign({}, (s.fx || {}).chorus, {mode: 'off'})}); return s; };
  const noF2 = s => { s = JSON.parse(JSON.stringify(s)); for (const k of F2) delete s.p[k]; return s; };
  const cmp = async (s, ev, sec) => { const a = (await SYNQUENZER.mkRender(dry(s), ev, {sec, seed: 1})).l, o = (await SYNQUENZER.mkRender(dry(noF2(s)), ev, {sec, seed: 1})).l, d = new Float32Array(a.length); for (let i = 0; i < a.length; i++) d[i] = a[i] - o[i]; return +(A.loud(d, 48000) - A.loud(o, 48000)).toFixed(1); };
  out.koerper = await cmp(await grab('W2', 3), [[0, 'on', 51, .8], [2.1, 'off', 51]], 4.2);
  out.gischt = await cmp(await grab('R05', 0), [[0, 'on', 48, .9], [3.2, 'off', 48], [3.6, 'on', 48, .7], [6.2, 'off', 48]], 6.6);
  out.knall = await cmp(await grab('R09', 0, true), [[0, 'on', 40, 1], [.5, 'off', 40]], 1.6);
  return out;
});
ok(L.chk.L9.length === 3 && L.chk.L10.length === 3 && L.chk.L9.every(([a, b]) => !a && b) && L.chk.L10.every(([a, b]) => !a && b), 'L9 und L10 je 3 Aufgaben: Start ✗, Lösung ✓', L.chk);
ok(/^✓/.test(L.laser || '') && /Tonh\.-Hk\./.test(L.laser), 'L9 Laser geht auch mit Tonh.-Hk. +24 HT statt der Route', L.laser);
ok(/^✗/.test(L.r8sec || '') && /TAKT/.test(L.r8sec) && /^✓/.test(L.r8takt || ''), 'L9 Bonus 2: 10 s in Sekunden = ✗ mit Hinweis TAKT, 8/1 im TAKT = ✓', [L.r8sec, L.r8takt]);
const want = {'W2/4': -24, 'R05/1': -24, 'R05/1 0': -24.8, 'R05/1 alt': -31, 'R09/1': -24, 'R09/1 alt': -25.8}, lb = Object.entries(want).filter(([k, v]) => !(Math.abs(L.lvl[k] - v) <= 1));
ok(!lb.length, 'Pegel: W2 Schicht 4 und R05 mit FILTER 2 bei −24 LUFS, „Nur Körper“ −24,8, Gischt-Spur −31, R09 Sub −24, Impact-Körper mit Knall −25,8 (je ±1 dB)', L.lvl);
ok(Math.abs(L.koerper + 10) <= 1.5 && Math.abs(L.gischt + 7) <= 1.5 && Math.abs(L.knall + 3.3) <= 1.5, 'Anteile FILTER 2: Körper ' + L.koerper + ' dB unter dem Vokal (Ziel −10), Gischt ' + L.gischt + ' unter dem Körper (−7), Knall ' + L.knall + ' unter dem trockenen Körper (−3,3 = −8 unter dem Sub)', null);
ok(!p._errs.length, 'Daten/Engine/Lektionen: keine Fehler in der Konsole', p._errs.slice(0, 4));
await p.close();

// ================= Golden-Render (Art K1/NS1): alle VA/FM-Werksklänge vorher/nachher bitgleich =================
// je Fassung eine frische Seite; Zufall im Offline-Worklet fest (geseedete Math.random-Zeile vor sq-worklet-src, wie n5-k-golden / golden.mjs);
// gerendert über das App-Worklet (mkRender, 2 s, Akkord + Einzelton), verglichen: FNV-1a über die Float32-Bytes je Kanal
const GOLD = async f => {
  const q = await page(f, 390, 844);
  const r = await X(q, async () => {
    const el = document.getElementById('sq-worklet-src'); el.textContent = 'Math.random = (() => { let s = 12345; return () => { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 4294967296; }; })();\n' + el.textContent;
    const fnv = a => { const u = new Uint8Array(a.buffer, a.byteOffset, a.byteLength); let h = 0x811c9dc5; for (let i = 0; i < u.length; i++) { h ^= u[i]; h = Math.imul(h, 0x01000193) >>> 0; } return h.toString(16); };
    const ev = [[0, 'on', 48, .9], [0, 'on', 55, .8], [0, 'on', 64, .7], [1.0, 'off', 48], [1.0, 'off', 55], [1.0, 'off', 64], [1.1, 'on', 67, .8], [1.6, 'off', 67]], out = {};
    for (const fa of FACTORY) if (fa.engine === 'analog' || fa.engine === 'fm6' || fa.engine === 'fm2') {
      try { const x = await SYNQUENZER.mkRender(factorySound(fa.id), ev, {sec: 2, seed: 1}); let m = 0; for (const v of x.l) m = Math.max(m, Math.abs(v)); out[fa.id] = fnv(x.l) + '/' + fnv(x.r || x.l) + (m < 1e-4 ? ' still' : ''); }
      catch (e) { out[fa.id] = 'ERR ' + String(e).slice(0, 60); }
    }
    return out;
  });
  await q.close(); return r;
};
{
  const gb = await GOLD(base), gn = await GOLD(file), gn2 = await GOLD(file);
  const ids = Object.keys(gb), diff = ids.filter(id => gb[id] !== gn[id]), ctl = ids.filter(id => gn[id] !== gn2[id]), bad = ids.filter(id => / still|ERR/.test(gb[id]));
  ok(ids.length > 50 && !ctl.length, 'Golden: Kontrolle neu == neu (zwei Seiten, ' + ids.length + ' Klänge)', ctl.slice(0, 5));
  ok(!bad.length, 'Golden: kein Render still oder mit Fehler', bad.slice(0, 5).map(id => id + ' ' + gb[id]));
  ok(ids.length > 50 && !diff.length, 'Golden: ' + ids.length + ' VA/FM-Werksklänge vorher/nachher bitgleich (mkRender, 2 Kanäle)', diff.slice(0, 5).map(id => id + ' ' + gb[id] + ' → ' + gn[id]));
}

// ================= CPU: Offline-Render vorher / nachher =================
const CPU = async f => {
  const q = await page(f, 390, 844);
  const r = await X(q, async () => {
    const b = factorySound(INIT_IDS.analog), mk = o => SQStore.normalizeSound({engine: 'analog', name: 'C', cat: 'eigene', p: Object.assign({}, b.p, {o2lvl: .8, o2fine: 7, noise: .2, ftype: 0, cutoff: 1200, res: .3, fenv: .4, poly: 8, aA: .01, aR: .4}, o), mods: [{src: 'lfo1', dst: 'pitch', amt: .1}], fx: Object.assign({}, b.fx, {rev: 0, dly: 0})});
    const ev = []; for (const [k, n] of [48, 52, 55, 59, 62, 64].entries()) { ev.push([k * .05, 'on', n, .8]); ev.push([7.5, 'off', n]); }
    const has = typeof KS4N !== 'undefined';
    const S0 = mk({}), S1 = has ? mk({ksF2: 1, ksF2w: 1, ksF2c: 300, ksF2r: .3, ksF2m: .5, ksF2q: 0, ksF2e: .3}) : null, S2 = has ? mk({ksF2: 4, ksF2w: 0, ksF2c: 800, ksF2r: .5, ksF2m: 1, ksF2q: 2, ksF2e: .2, ksAa: .5, ksMa: 4, ksR1: 8, ksG1: .5, ksPe: 12}) : null;
    const tm = async s => { const t0 = performance.now(); await SYNQUENZER.mkRender(s, ev, {sec: 8, seed: 1}); return performance.now() - t0; };
    await tm(S0); const o = {s0: [], s1: [], s2: []};
    for (let i = 0; i < 5; i++) { o.s0.push(await tm(S0)); if (S1) o.s1.push(await tm(S1)); if (S2) o.s2.push(await tm(S2)); }
    const md = a => { const x = a.slice().sort((p, q) => p - q); return x.length ? +x[Math.floor(x.length / 2)].toFixed(1) : null; }, mn = a => (a.length ? +Math.min(...a).toFixed(1) : null);
    return {s0: md(o.s0), s1: md(o.s1), s2: md(o.s2), s0min: mn(o.s0), s1min: mn(o.s1), s2min: mn(o.s2), all: o};
  });
  await q.close(); return r;
};
// abwechselnd vorher / nachher, je 3 Seiten à 5 Renders (der Rechner ist stark ausgelastet: Bestwert und Median beide)
const RB = [], RN = []; for (let k = 0; k < 3; k++) { RB.push(await CPU(base)); RN.push(await CPU(file)); }
const cat = (L, q) => [].concat(...L.map(r => r.all[q])), mdn = a => { const x = a.slice().sort((p, q) => p - q); return +x[Math.floor(x.length / 2)].toFixed(1); }, mnn = a => +Math.min(...a).toFixed(1);
const b0 = mnn(cat(RB, 's0')), n0 = mnn(cat(RN, 's0')), n1 = mnn(cat(RN, 's1')), n2 = mnn(cat(RN, 's2'));
const mb0 = mdn(cat(RB, 's0')), mn0 = mdn(cat(RN, 's0')), mn1 = mdn(cat(RN, 's1')), mn2 = mdn(cat(RN, 's2'));
console.log('CPU (ms je 8 s Render, 6 Stimmen; Bestwert / Median aus je 15)', JSON.stringify({vorher: [b0, mb0], nachher_ohneKS4: [n0, mn0], filter2: [n1, mn1], alles: [n2, mn2]}));
ok(n0 <= b0 * 1.08 || mn0 <= mb0 * 1.08, 'CPU: Klang ohne KS4-Schlüssel kostet wie vorher (Bestwert ' + Math.round(100 * n0 / b0) + ' %, Median ' + Math.round(100 * mn0 / mb0) + ' %)');
ok((n1 <= n0 * 1.35 && n2 <= n0 * 1.5) || (mn1 <= mn0 * 1.35 && mn2 <= mn0 * 1.5), 'CPU: mit FILTER 2 ' + Math.round(100 * n1 / n0) + ' % / ' + Math.round(100 * mn1 / mn0) + ' %, mit allem (TAKT, Raster, Glätten, Kerbe, Tonh.-Hk.) ' + Math.round(100 * n2 / n0) + ' % / ' + Math.round(100 * mn2 / mn0) + ' % des Klangs ohne (Bestwert / Median)', null);

console.log('\nKS4-Test: ' + pass + ' OK, ' + fail + ' FEHL');
await b.close();
process.exit(fail ? 1 : 0);
