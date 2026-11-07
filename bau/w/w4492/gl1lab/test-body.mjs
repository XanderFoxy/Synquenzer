// GL1-Test: Background-Zeilen ohne Überschneidung (Matrix + Song, hochkant + quer, mit Video-Spur, Teil-Marken, Block-Zeile,
// Fill-Chip, Schleife, weit draußen), allgemeine Glitch-Umfrage (19 Ansichten × 3 Bildgrößen, vorher/nachher), LAUF wie gespielt
// (Matrix-Vorschau, Song-Kachel, ROLLE, Richtungszeichen, auf-/abwärts nach Tonhöhe – gehört über noteLog), Speichern/Laden,
// ohne Chor/LAUF pixelgleich zur Basis. Aufruf: node gl1-test.mjs <index.html> <ausgabe-ordner>  (ABSOLUTE Pfade; die Basis wird als
// ../basis.html neben dem Paket gesucht – dann auch „vorher“-Zahlen und -Fotos)
import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
import fs from 'fs';
import path from 'path';
const [file, out] = process.argv.slice(2);
if (!file || !out) { console.log('FEHLER Aufruf: node gl1-test.mjs <index.html> <ausgabe-ordner>'); process.exit(2); }
fs.mkdirSync(out, {recursive: true});
const basis = path.resolve(path.dirname(file), '..', 'basis.html'), haveBasis = fs.existsSync(basis);
const res = []; const ok = (name, pass, info) => { res.push({name, pass: !!pass, info}); console.log((pass ? 'OK ' : 'FEHLER ') + name + (info !== undefined ? '  ' + JSON.stringify(info).slice(0, 900) : '')); };
const b = await chromium.launch({args: ['--autoplay-policy=no-user-gesture-required', '--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream']});
const allErrs = [];
async function openPage(f, w, h, dsf) {
  const ctx = await b.newContext({viewport: {width: w, height: h}, hasTouch: true, deviceScaleFactor: dsf || 1});
  const p = await ctx.newPage();
  p.on('pageerror', e => allErrs.push(path.basename(f) + ': ' + String(e))); p.on('console', m => { if (m.type() === 'error') allErrs.push(path.basename(f) + ': ' + m.text()); });
  await p.goto('file://' + path.resolve(f)); await p.waitForTimeout(1500);
  for (const c of [HELP_SETUP, HELP_SCAN, HELP_VIEWS]) await p.addScriptTag({content: c});
  p._ctx = ctx; return p;
}
const W = (p, ms) => p.waitForTimeout(ms);
const hideToast = p => p.evaluate(() => { if (EL.toast) EL.toast.style.visibility = 'hidden'; });
const shot = async (p, name) => { await W(p, 350); await hideToast(p); await p.screenshot({path: path.join(out, name)}); };
const CORNER = x => /corner/.test(x.a) && /mtrm/.test(x.b);   // bewusst: der Master-Pegel liegt als 14 px schmale Leiste links im [SONG ⇄]-Eck (VV4-F)
const bad = s => s ? s.textOverlap.length + s.cutV.length + s.cutH.length + s.btnOverlap.filter(x => !CORNER(x)).length + s.covered.length + s.outside.length : 99;

/* ---------- 1) Background-Gruppe: Matrix + Song, gemessen, vorher/nachher ---------- */
async function chorRun(f, tag) {
  const R = {};
  for (const [w, h] of [[428, 926], [926, 428], [926, 370]]) {
    const p = await openPage(f, w, h, tag === 'nachher' || tag === 'vorher' ? 2 : 1);
    await p.evaluate(() => __gl1Setup()); await p.evaluate(() => SYNQUENZER.chsOpen(true)); await W(p, 300);
    const k = w + 'x' + h;
    // Matrix: die Seite mit STIMME + Background
    await p.evaluate(() => { setSongView(false); const st = stimmeT(); const pg = MX.pages ? MX.pages.findIndex(q => q.includes(st)) : 0; setTrackBank(Math.max(0, pg)); }); await W(p, 400);
    R['mx ' + k] = await p.evaluate(() => { const s = __gl1Scan('#app'); const hs = CHS.mx ? CHS.mx.rows.map(r => { const q = r.h.getBoundingClientRect(); return Math.round(q.height); }) : []; return {s, heads: hs, row: (getComputedStyle(EL.grid).gridTemplateRows || '').split(' ').map(parseFloat)[1]}; });
    await shot(p, `chor-matrix-${tag}-${k}.png`);
    // Song: Teil-Marken, Block-Zeile, Fill-Chip, Schleife; ohne und mit Video-Spur
    for (const vid of [false, true]) {
      await p.evaluate(v => { setSongView(true); if (!S.song.blocks) SYNQUENZER.blockMake(0, 7); if (!(S.song.ue && S.song.ue.length)) { try { SYNQUENZER.fllPlace('gr2f-reggae', 36); } catch (e) {} } S.song.loop = {on: true, a: 8, b: 16}; songChanged(); SYNQUENZER.vd3.cut(v); const st = stimmeT(); svLayout(); const pg = SV.pages ? SV.pages.findIndex(q => q.includes(st)) : 0; setTrackBank(Math.max(0, pg)); svLayout(); SV.cellW = 36; SV.x = 8 * 36; FOL.page.song = null; UI.dirty.song = true; }, vid); await W(p, 500);
      R[`song${vid ? '+video' : ''} ${k}`] = await p.evaluate(() => { const L = svLayoutInfo(); const s = __gl1Scan('#app'); const need = SV.rulerH + (SV.rows.length + 2) * SV.rowH; return {s, rowH: +SV.rowH.toFixed(1), rows: SV.rows.length, fits: need <= SV.h + .5, need: +need.toFixed(1), h: SV.h, parts: (window.GL1 && GL1.svParts || []).length, lbl: (() => { const e = document.querySelector('.vd3-lbl'); return e && !e.hidden ? {fs: getComputedStyle(e).fontSize, pos: getComputedStyle(e).position} : null; })()}; });
      await shot(p, `chor-song${vid ? '-video' : ''}-${tag}-${k}.png`);
    }
    // weit draußen (Teile als Farbblöcke): Song-Gesang und Background nicht über den Blöcken
    await p.evaluate(() => { SYNQUENZER.vd3.cut(false); setTrackBank(0); svLayout(); SV.cellW = 8; SV.x = 0; UI.dirty.song = true; svDraw(true); }); await W(p, 400);
    R['far ' + k] = await p.evaluate(() => {
      svDraw(true); const st = stimmeT(), g = SV.g, d = SV.dpr, rows = []; for (let r = 0; r < SV.rows.length; r++) if (SV.rows[r] === st || (typeof chsSvCode === 'function' && chsSvCode(SV.rows[r]) != null)) rows.push(r);
      const v = S.song.vox && S.song.vox[0], m = S.song.marks.find(q => v && q.a <= v.bar && q.a + q.len > v.bar); if (!v || !m || !rows.length) return {n: 0, why: 'keine Stelle'};
      let n = 0, nonBlock = 0; const X = b => b * SV.cellW - SV.x;
      for (const r of rows) for (let k2 = 1; k2 < 4; k2++) { const x = X(v.bar) + (X(v.bar + v.len) - X(v.bar)) * k2 / 4, y = SV.rulerH + r * SV.rowH + SV.rowH / 2; const px = g.getImageData(Math.round(x * d), Math.round(y * d), 1, 1).data; n++; if (!(px[0] > 150 && px[1] > 100 && px[2] < 110)) nonBlock++; }
      return {n, nonBlock};
    });
    await shot(p, `chor-song-weit-${tag}-${k}.png`);
    await p._ctx.close();
  }
  return R;
}
const CN = await chorRun(file, 'nachher'), CV = haveBasis ? await chorRun(basis, 'vorher') : null;
const sumC = R => Object.fromEntries(Object.entries(R).map(([k, v]) => [k, v.s ? bad(v.s) : v.nonBlock]));
for (const k of Object.keys(CN)) {
  const v = CN[k], vor = CV ? CV[k] : null;
  if (k.startsWith('mx')) ok(`Background in der Matrix ${k}: 0 Überschneidungen/abgeschnittene Texte/verdeckte Tasten (vorher ${vor ? bad(vor.s) : '–'}), Spurköpfe ${v.heads.join('/')} px bei ${v.row ? v.row.toFixed(1) : '?'} px Zeilen`, bad(v.s) === 0, {nachher: summ(v.s), vorher: vor ? summ(vor.s) : null});
  else if (k.startsWith('song')) ok(`Background im Song ${k}: 0 Überschneidungen, alle Zeilen samt AKKORDE/MELODIE im Bild (${v.need} ≤ ${v.h} px, Zeilen ${v.rowH} px; vorher ${vor ? vor.rowH + ' px, ' + (vor.fits ? 'passt' : 'ragt ' + (vor.need - vor.h).toFixed(1) + ' px hinaus') + ', ' + bad(vor.s) + ' Befunde' : '–'})`, bad(v.s) === 0 && v.fits && (!k.includes('video') || (v.lbl && v.lbl.fs === '8px' && v.lbl.pos === 'absolute')), {nachher: summ(v.s), parts: v.parts, lbl: v.lbl, vorher: vor ? {s: summ(vor.s), fits: vor.fits, lbl: vor.lbl} : null});
  else ok(`Song weit draußen ${k}: im Teil-Block liegt nichts vom Gesang/Background darüber (vorher ${vor ? vor.nonBlock + ' von ' + vor.n : '–'} Messpunkte fremd)`, v.n > 0 && v.nonBlock === 0, {nachher: v, vorher: vor});
}
function summ(s) { return s ? {textOverlap: s.textOverlap.length, cutV: s.cutV.length, cutH: s.cutH.length, btnOverlap: s.btnOverlap.filter(x => !CORNER(x)).length, covered: s.covered.length, outside: s.outside.length, ex: [...s.textOverlap, ...s.cutV, ...s.cutH, ...s.btnOverlap.filter(x => !CORNER(x))].slice(0, 3)} : null; }

/* ---------- 1b) Background-Zeilen zeigen den Chor des STIMME-Clips im Teil; Tipp öffnet die Stimme ---------- */
{
  const p = await openPage(file, 428, 926);
  await p.evaluate(() => __gl1Setup()); await p.evaluate(() => { SYNQUENZER.chsOpen(true); setSongView(true); svLayout(); SV.cellW = 36; SV.x = 8 * 36; UI.dirty.song = true; svDraw(true); }); await W(p, 400);
  const T = await p.evaluate(async () => {
    svDraw(true); const parts = GL1.svParts.slice(), m = S.song.marks.find(q => q.part === 'S4'), lanes = chsLanes(), code = CHS_SV0 - 1;
    SYNQUENZER.gl1SvTap(code, m.a); await new Promise(r => setTimeout(r, 500));
    const ed = (typeof G2 !== 'undefined' && G2.ed) || (typeof WP !== 'undefined' && WP.ed) || null, o = {parts, bar: m.a, lane: lanes[0].name, ed: !!ed, edKind: ed ? (ed.voice != null ? 'Stimme ' + ed.voice : 'Take') : null, ref: ed && ed.r ? ed.r : null};
    try { if (typeof g2Close === 'function') g2Close(); else if (typeof wpClose === 'function') wpClose(); } catch (e) {}
    return o;
  });
  ok('Song: die Background-Zeilen zeigen den Chor des STIMME-Clips im Teil „Szene 4“ (Takt 9–10 und 15–16 sind zuvor leer gewesen); Tipp in die Zeile „' + T.lane + '“ öffnet diese Stimme des Szenen-Clips', T.parts.some(x => Math.abs(x.a - 32) < 1e-6) && T.ed && T.ref && T.ref.s === 3, T);
  await p._ctx.close();
}

/* ---------- 2) Allgemeine Glitch-Umfrage: 19 Ansichten × 3 Bildgrößen ---------- */
async function survey(f) {
  const out2 = [];
  for (const [w, h] of [[428, 926], [926, 428], [926, 370]]) {
    const p = await openPage(f, w, h);
    await p.evaluate(() => __gl1Setup());
    await p.evaluate(() => { SYNQUENZER.chsOpen(true); S.tracks[0].clips[7] = {len: 1, key: {root: 0, scale: 'ionian', src: 'user'}, notes: [0, 2, 4, 5, 7, 9, 11, 12].map((d, k) => ({t: k * .5, d: .4, n: 48 + d, v: .8})), lf: {dir: 'rev'}}; clipChanged(0, 7); SYNQUENZER.blockMake(0, 7); SYNQUENZER.vd3.cut(true); S.song.loop = {on: true, a: 8, b: 16}; songChanged(); });
    const n = await p.evaluate(() => __gl1Views.length);
    for (let i = 0; i < n; i++) {
      const nm = await p.evaluate(i => __gl1Views[i].name, i);
      await p.evaluate(() => { closePop(); closeSheets(); closeMenu(); try { vvClose(); } catch (e) {} setSongView(false); }); await W(p, 250);
      const a1 = await p.evaluate(() => __gl1Anchors());
      try { await p.evaluate(i => __gl1Views[i].open(), i); } catch (e) { out2.push({vp: w + 'x' + h, view: nm, err: String(e).slice(0, 160)}); continue; }
      await W(p, 700);
      const s = await p.evaluate(i => { const r = __gl1Views[i].root(); const e = typeof r === 'string' ? document.querySelector(r) : r; return e ? __gl1Scan(e, {}) : null; }, i);
      if (f === file && (w === 926 || nm === 'LAUF-Richtung')) await p.screenshot({path: path.join(out, `glitch-${nm}-${w}x${h}.png`)});
      await p.evaluate(i => { const v = __gl1Views[i]; if (v.close) v.close(); }, i); await W(p, 400);
      await p.evaluate(() => { closePop(); closeSheets(); closeMenu(); try { vvClose(); } catch (e) {} setSongView(false); }); await W(p, 250);
      const a3 = await p.evaluate(() => __gl1Anchors());
      out2.push({vp: w + 'x' + h, view: nm, s, jump: Object.keys(a1).filter(k => a3[k] !== a1[k]).map(k => k + ' ' + a1[k] + '→' + a3[k])});
    }
    await p._ctx.close();
  }
  return out2;
}
const SN = await survey(file), SV0 = haveBasis ? await survey(basis) : null;
fs.writeFileSync(path.join(out, 'glitch-nachher.json'), JSON.stringify(SN, null, 1)); if (SV0) fs.writeFileSync(path.join(out, 'glitch-vorher.json'), JSON.stringify(SV0, null, 1));
const line = r => r.s ? `${r.vp} ${r.view}: Text über Text ${r.s.textOverlap.length}, senkrecht abgeschnitten ${r.s.cutV.length}, waagrecht abgeschnitten ${r.s.cutH.length}, Tasten übereinander ${r.s.btnOverlap.filter(x => !CORNER(x)).length}, verdeckt ${r.s.covered.length}, unerreichbar ${r.s.outside.length}, ✕ ${r.s.x.length ? (r.s.x.every(x => x.full) ? 'ganz' : 'TEIL') : '–'}${r.jump.length ? ', springt: ' + r.jump.join(' ') : ''}` : `${r.vp} ${r.view}: ${r.err || 'keine Wurzel'}`;
const tab = [];
for (const r of SN) { const v = SV0 ? SV0.find(x => x.vp === r.vp && x.view === r.view) : null; const nb = bad(r.s) + (r.s && r.s.x.some(x => !x.full) ? 1 : 0) + r.jump.length, vb = v ? bad(v.s) + (v.s && v.s.x.some(x => !x.full) ? 1 : 0) + (v.jump || []).length : null; tab.push({vp: r.vp, view: r.view, vorher: vb, nachher: nb, info: line(r)}); }
fs.writeFileSync(path.join(out, 'glitch-liste.txt'), tab.map(t => `${t.vp.padEnd(8)} ${t.view.padEnd(18)} vorher ${t.vorher == null ? '–' : t.vorher}  nachher ${t.nachher}`).join('\n') + '\n\nnachher im Einzelnen:\n' + SN.map(line).join('\n') + (SV0 ? '\n\nvorher im Einzelnen:\n' + SV0.map(line).join('\n') : '') + '\n');
const sumV = tab.reduce((a, t) => a + (t.vorher || 0), 0), sumN = tab.reduce((a, t) => a + t.nachher, 0);
ok(`Glitch-Umfrage (Matrix, Song, Clip-Blatt, ROLLE, LAUF, Richtung, Drum-SCHRITTE, Klang-Editor, Mix & Master, Remix, Video, Menü, Guide, Takes, Chor, Mischpult, Mikro; 428×926, 926×428, 926×370): Befunde vorher ${SV0 ? sumV : '–'} → nachher ${sumN}`, sumN === 0 && SN.every(r => r.s), tab.filter(t => t.nachher || t.vorher).map(t => `${t.vp} ${t.view} ${t.vorher}→${t.nachher}`));
ok('✕ in jedem Blatt ganz zu sehen (wo das Blatt eins hat), nichts springt nach dem Schließen', SN.every(r => !r.s || r.s.x.every(x => x.full)) && SN.every(r => !r.jump.length), SN.filter(r => (r.s && r.s.x.some(x => !x.full)) || r.jump.length).map(line));

/* ---------- 3) LAUF wie gespielt ---------- */
const LSET = `stop(); SYNQUENZER.loadDemo(); ensureAudio();
  for (let t = 0; t < NT(); t++) if (S.tracks[t]) for (let s = 0; s < NS(); s++) S.tracks[t].clips[s] = null;
  S.tracks[0].clips[0] = {len: 1, key: {root: 0, scale: 'ionian', src: 'user'}, notes: [7, 0, 12, 4, 9, 2, 11, 5].map((d, k) => ({t: k * .5, d: .4, n: 48 + d, v: .8}))};
  for (let t = 0; t < NT(); t++) clipChanged(t, 0); R.selS = 0; UNDO.length = 0; REDO.length = 0;`;
// the mini picture's played rectangles (no class) against lf1Pass: x = t/L·100, y = (1 − (n − lo)/span)·86
const MINI_CMP = `(() => { const c = S.tracks[0].clips[0], L = clipB(c), pl = lf1Pass(c, 0), svg = SYNQUENZER.gl1Mini(0, 0);
  const re = /<rect x="([-\\d.]+)" y="([-\\d.]+)"/g, got = []; let m; while ((m = re.exec(svg))) got.push([+m[1], +m[2]]);
  let lo = 127, hi = 0; for (const n of c.notes.concat(pl)) { lo = Math.min(lo, n.n); hi = Math.max(hi, n.n); } const span = Math.max(hi - lo, 6);
  const want = pl.map(n => [+(n.t / L * 100).toFixed(2), +((1 - (n.n - lo) / span) * 86).toFixed(1)]);
  const ghosts = (svg.match(/class="g1g"/g) || []).length;
  return {same: got.length === want.length && got.every((g, i) => Math.abs(g[0] - want[i][0]) < .02 && Math.abs(g[1] - want[i][1]) < .06), got: got.length, ghosts, order: pl.map(n => n.n)}; })()`;
for (const [w, h, tag] of [[428, 926, 'hochkant'], [926, 428, 'quer']]) {
  const p = await openPage(file, w, h, 2);
  await p.evaluate(s => (new Function(s))(), LSET); await W(p, 300);
  const D = {};
  for (const dir of ['rev', 'pend', 'rnd', 'up', 'down']) {
    await p.evaluate(d => SYNQUENZER.lf1Dir(0, 0, {dir: d, g: '1/8'}), dir);
    D[dir] = await p.evaluate(`(${MINI_CMP.replace(/^\(/, '').replace(/\)$/, '')})`);
    D[dir].tag = await p.evaluate(() => SYNQUENZER.gl1Tag(0, 0)); D[dir].cell = await p.evaluate(() => UI.cells[0][0].ln.textContent);
  }
  await p.evaluate(() => SYNQUENZER.lf1Dir(0, 0, {dir: null, st: 3, g: '1/8'})); await W(p, 250);
  D.st = await p.evaluate(() => ({tag: SYNQUENZER.gl1Tag(0, 0), cell: UI.cells[0][0].ln.textContent}));
  ok(`LAUF ${tag}: Matrix-Vorschau zeigt die gespielte Reihenfolge (Rechtecke = lf1Pass, dieselbe Rechnung wie die Wiedergabe) für rückwärts/hin und her/Zufall/auf-/abwärts, die notierten blass dahinter`, Object.values(D).filter(x => x.same != null).every(x => x.same && x.ghosts === 8), Object.fromEntries(Object.entries(D).map(([k, v]) => [k, v.same != null ? {same: v.same, ghosts: v.ghosts, order: v.order.join(' ')} : v])));
  ok(`LAUF ${tag}: Richtungszeichen am Clip (◀ ⇄ ? ↑ ↓, eigener Start →4)`, D.rev.cell.endsWith('◀︎') && D.pend.cell.endsWith('⇄') && D.rnd.cell.endsWith('?') && D.up.cell.endsWith('↑') && D.down.cell.endsWith('↓') && D.st.cell.endsWith('→4'), {rev: D.rev.cell, pend: D.pend.cell, rnd: D.rnd.cell, up: D.up.cell, down: D.down.cell, st: D.st.cell});
  ok(`LAUF ${tag}: auf-/abwärts (Tonhöhe) – der Rhythmus bleibt, die Töne steigen bzw. fallen`, D.up.order.join() === [48, 50, 52, 53, 55, 57, 59, 60].join() && D.down.order.join() === [60, 59, 57, 55, 53, 52, 50, 48].join(), {up: D.up.order, down: D.down.order});
  await p.evaluate(() => SYNQUENZER.lf1Dir(0, 0, {dir: 'rev', st: null, g: '1/8'})); await W(p, 400);
  await shot(p, `lauf-matrix-rueckwaerts-${tag}.png`);
  // ROLLE: wie gespielt (Standard) – gezeichnete Rechtecke = lf1Pass; [wie notiert] ohne; Umschalter nur mit LAUF, gleich hinter [LAUF]
  await p.evaluate(() => { SYNQUENZER.gl1RollMode('played'); ROLLP.view = 'roll'; openRoll(0, 0); }); await W(p, 700);
  const RO = await p.evaluate(() => { const I = SYNQUENZER.gl1Info(), pl = lf1Pass(S.tracks[0].clips[0], 0), b = ED.roll.el.bar.querySelector('.gl1pv'), r = b.getBoundingClientRect(), x = r.left + r.width / 2;
    let hitH = 0; for (let y = Math.floor(r.top) - 10; y <= r.bottom + 10; y++) { const e = document.elementFromPoint(x, y); if (e && (e === b || b.contains(e))) hitH++; }
    const prev = b.previousElementSibling;
    return {mode: I.mode, n: I.roll ? I.roll.rects.length : 0, same: !!I.roll && I.roll.rects.length === pl.length && I.roll.rects.every((q, i) => Math.abs(q.t - pl[i].t) < 1e-4 && q.n === pl[i].n), shown: !b.hidden, label: b.textContent, afterLauf: !!(prev && prev.textContent === 'LAUF'), w: Math.round(r.width), h: Math.round(r.height), hitH, rect: [Math.round(r.left), Math.round(r.top), Math.round(r.right), Math.round(r.bottom)], vw: innerWidth}; });
  await shot(p, `lauf-rolle-wie-gespielt-${tag}.png`);
  const RN = await p.evaluate(() => { SYNQUENZER.gl1RollMode('notated'); return new Promise(r => requestAnimationFrame(() => requestAnimationFrame(() => r({roll: SYNQUENZER.gl1Info().roll, label: ED.roll.el.bar.querySelector('.gl1pv').textContent})))); });
  await shot(p, `lauf-rolle-wie-notiert-${tag}.png`);
  ok(`ROLLE ${tag}: Standard „wie gespielt“ – die gezeichneten hellen Noten liegen an der gespielten Stelle (= lf1Pass, rückwärts), die notierten blass; [wie notiert] schaltet um; Umschalter gleich hinter [LAUF], im Bild, Treffer ≥ 44 px hoch`, RO.mode === 'played' && RO.same && RO.n === 8 && RO.shown && RO.label === 'wie gespielt' && RO.afterLauf && RN.roll === null && RN.label === 'wie notiert' && RO.rect[2] <= RO.vw && RO.hitH >= 44, {RO, RN: RN.label});
  await p.evaluate(() => { SYNQUENZER.gl1RollMode('played'); closeRoll(); }); await W(p, 300);
  // ohne LAUF: kein Umschalter, nichts anders
  const NL = await p.evaluate(() => { const c = S.tracks[0].clips[0]; delete c.lf; clipChanged(0, 0); ROLLP.view = 'roll'; openRoll(0, 0); return new Promise(r => setTimeout(() => { const b = ED.roll.el.bar.querySelector('.gl1pv'); r({hidden: !b || b.hidden, roll: SYNQUENZER.gl1Info().roll, tag: SYNQUENZER.gl1Tag(0, 0)}); closeRoll(); }, 500)); });
  ok(`ROLLE ${tag}: ohne LAUF-Richtung/Effekte kein Umschalter, kein Zeichen, Noten wie bisher`, NL.hidden && NL.roll === null && NL.tag === '', NL);
  // LAUF-Ansicht: Richtungs-Menü mit den neuen Richtungen
  await p.evaluate(() => { SYNQUENZER.lf1Dir(0, 0, {dir: 'up', g: '1/8'}); ROLLP.view = 'lauf'; openRoll(0, 0); }); await W(p, 600);
  const DM = await p.evaluate(() => { SYNQUENZER.lf1DirMenu(); const P = UI.pop && UI.pop.el; if (!P) return null; const bs = [...P.querySelectorAll('.lf1dirs button')], R = e => e.getBoundingClientRect(); return {labels: bs.map(b => b.textContent.trim()), on: (bs.find(b => b.classList.contains('on')) || {}).textContent, inView: bs.every(b => { const r = R(b); return r.top >= 0 && r.bottom <= innerHeight && r.left >= 0 && r.right <= innerWidth && r.height >= 44; })}; });
  await shot(p, `lauf-richtung-${tag}.png`);
  ok(`LAUF ${tag}: Richtungs-Menü bietet „aufwärts (Tonhöhe)“ und „abwärts (Tonhöhe)“ (gewählt markiert, im Bild, ≥ 44 px)`, DM && DM.labels.includes('aufwärts (Tonhöhe)') && DM.labels.includes('abwärts (Tonhöhe)') && DM.on === 'aufwärts (Tonhöhe)' && DM.inView, DM);
  await p.evaluate(() => { closePop(); ROLLP.view = 'roll'; closeRoll(); });
  await p._ctx.close();
}
// gehört: die Wiedergabe spielt genau die gezeigte Folge (noteLog der Spur, eine Runde)
{
  const p = await openPage(file, 428, 926);
  await p.evaluate(s => (new Function(s))(), LSET);
  const H = await p.evaluate(async () => {
    const wait = ms => new Promise(r => setTimeout(r, ms)), o = {};
    for (const dir of ['rev', 'up', 'down', 'pend']) {
      SYNQUENZER.lf1Dir(0, 0, {dir, g: '1/8'}); const want = lf1Pass(S.tracks[0].clips[0], 0).map(n => n.n);
      SYNQUENZER.clearLog(); play(); launchScene(0); await wait(2600); stop(); await wait(250);
      const log = SYNQUENZER.noteLog(300).filter(e => e.track === 0).sort((a, b) => a.beat - b.beat), b0 = log.length ? log[0].beat : 0;
      o[dir] = {want, heard: log.filter(e => e.beat < b0 + 4 - 1e-6).map(e => e.out)};
    }
    return o;
  });
  ok('Gehört: die Wiedergabe spielt genau die gezeigte Reihenfolge (noteLog = Vorschau) – rückwärts, aufwärts, abwärts, hin und her', Object.values(H).every(x => x.heard.join() === x.want.join() && x.want.length === 8), H);
  // Song-Kachel (◧): die Noten wie gespielt aus a2Sound
  const G = await p.evaluate(() => { SYNQUENZER.lf1Dir(0, 0, {dir: 'down', g: '1/8'}); SYNQUENZER.songFromChain([{scene: 0, bars: 2}]); setSongView(true); UI.svGlass = true; svLayout(); SV.cellW = 60; SV.x = 0; svDraw(true);
    const t = SV.tileGeo && SV.tileGeo.find(x => x.t === 0); const run = {o: {slot: 0, own: null, cs: 0}, d0: 0, d1: 2, ds: 0, L: 4};
    const r = svTileNotes(S.song, 0, run), snd = a2Sound(S.song, 0, 0, 2, 0); const pitchesTile = []; for (let k = 0; k < r.p.length; k += 3) pitchesTile.push(+r.p[k].toFixed(3));
    UI.svGlass = false; setSongView(false); return {gl1: !!r.gl1, n: r.n, times: pitchesTile.slice(0, 8), want: snd.ns.slice(0, 8).map(n => +n.t.toFixed(3)), ys: [r.p[2], r.p[5], r.p[8]].map(v => +v.toFixed(3))}; });
  ok('Song-Kachel (◧): bei LAUF die Noten wie gespielt (a2Sound, dieselbe Rechnung wie die Wiedergabe) – abwärts: die Höhe fällt Schritt für Schritt', G.gl1 && G.n === 16 && G.times.join() === G.want.join() && G.ys[0] < G.ys[1] && G.ys[1] < G.ys[2], G);
  // Speichern/Laden: die neuen Richtungen bleiben; ein Clip ohne LAUF bleibt bitgleich
  const SL = await p.evaluate(async () => { SYNQUENZER.lf1Dir(0, 0, {dir: 'up', g: '1/8'}); const j = serialize(); importJSON(j); await new Promise(r => setTimeout(r, 500)); const c = S.tracks[0].clips[0]; const a = c.lf ? c.lf.dir : null;
    SYNQUENZER.lf1Dir(0, 0, {dir: 'down'}); const j2 = serialize(); importJSON(j2); await new Promise(r => setTimeout(r, 500)); return {up: a, down: S.tracks[0].clips[0].lf && S.tracks[0].clips[0].lf.dir, norm: [lf1NormLf({dir: 'up'}), lf1NormLf({dir: 'quer'}), lf1NormLf({dir: 'down', st: 2})]}; });
  ok('Speichern/Laden: „aufwärts/abwärts (Tonhöhe)“ bleiben erhalten; Unbekanntes fällt weg wie bisher', SL.up === 'up' && SL.down === 'down' && SL.norm[0].dir === 'up' && SL.norm[1] === null && SL.norm[2].st === 2, SL);
  await p._ctx.close();
}
if (haveBasis) {   // alte Projekte / Clips ohne LAUF: Vorschau und Signatur wie in der Basis
  const A = [], CLIPS = `[{len: 1, notes: [{t: 0, d: .5, n: 48, v: .8}, {t: 1, d: .25, n: 55, v: .7}, {t: 2.5, d: 1, n: 60, v: .9}]}, {len: 2, notes: [0, 1, 2, 3, 4, 5, 6, 7].map(k => ({t: k, d: .9, n: 40 + k * 2, v: .8}))}]`;
  for (const f of [basis, file]) { const p = await openPage(f, 428, 926); A.push(await p.evaluate(`(${CLIPS}).map(c => ({sig: clipSig(c), mini: miniSvg(c, false), dr: miniSvg(c, true)}))`)); await p._ctx.close(); }
  ok('Clips ohne LAUF (alte Projekte): Matrix-Vorschau und Signatur zeichengleich zur Basis', JSON.stringify(A[0]) === JSON.stringify(A[1]), {gleich: JSON.stringify(A[0]) === JSON.stringify(A[1])});
}

/* ---------- 4) einzelne Glitches: Schleife hochkant, Mikro-Blatt quer, ✕ über der obersten Taste, Video quer ---------- */
{
  const p = await openPage(file, 428, 926);
  await p.evaluate(() => __gl1Setup());
  const LP = await p.evaluate(() => { setSongView(true); S.song.loop = {on: true, a: 8, b: 16}; songChanged(); return new Promise(r => setTimeout(() => { const b = SV.btn.bLoop, v = b.lastChild; r({txt: v.textContent, w: v.offsetWidth, room: b.clientWidth - 4, fit: v.classList.contains('gl1fit')}); }, 400)); });
  ok('Song hochkant [SCHLEIFE ⟲ T9–16 ▾]: der Wert passt in den Knopf (vorher links/rechts abgeschnitten)', LP.w <= LP.room, LP);
  const PX = await p.evaluate(() => { setSongView(false); S.tracks[0].clips[7] = {len: 1, key: {root: 0, scale: 'ionian', src: 'user'}, notes: [0, 2, 4, 5].map((d, k) => ({t: k, d: .9, n: 48 + d, v: .8}))}; clipChanged(0, 7); ROLLP.view = 'lauf'; openRoll(0, 7); SYNQUENZER.lf1DirMenu(); const P = UI.pop.el, x = P.querySelector('.ux1-px'), r1 = x.getBoundingClientRect(), f = P.querySelector('.lf1dirs button').getBoundingClientRect();
    const xs = [r1.right - 4, r1.left + 4], ys = [f.top + 1, f.top + 3, f.top + 6]; let hitsX = 0; for (const xx of xs) for (const yy of ys) { const e = document.elementFromPoint(xx, yy); if (e && (e === x || x.contains(e))) hitsX++; } closePop(); ROLLP.view = 'roll'; closeRoll(); return {xBottom: Math.round(r1.bottom), firstTop: Math.round(f.top), hitsX}; });
  ok('Blätter mit Titel (hochkant): das ✕ und sein Trefferrand liegen nicht mehr auf der obersten Taste (Tipp oben rechts auf „rückwärts“ schloss das Richtungs-Menü)', PX.hitsX === 0 && PX.xBottom <= PX.firstTop, PX);
  await p._ctx.close();
}
for (const [w, h] of [[926, 370], [926, 428]]) {
  const p = await openPage(file, w, h);
  await p.evaluate(() => SYNQUENZER.loadDemo());
  const MK = await p.evaluate(() => new Promise(r => { stSheet(EL.top); setTimeout(() => { const P = UI.pop && UI.pop.el, q = P && P.getBoundingClientRect(); r(q ? {top: Math.round(q.top), bottom: Math.round(q.bottom), vh: innerHeight} : null); closePop(); }, 1200); }));
  ok(`Mikro-Blatt ${w}×${h}: bleibt ganz im Bild, auch wenn sein Inhalt nach dem Öffnen kommt (vorher ragte es quer bis 22 px unten hinaus)`, MK && MK.bottom <= MK.vh && MK.top >= 0, MK);
  const VS = await p.evaluate(() => { vvOpen(); return new Promise(r => setTimeout(() => { const c = VV.el.querySelector('.vvctl').getBoundingClientRect(); const bs = [...VV.el.querySelectorAll('.vvctl .vvseg button')].filter(b => b.offsetParent).map(b => { const q = b.getBoundingClientRect(); return {t: b.textContent.trim(), r: Math.round(q.right), w: Math.round(q.width), h: Math.round(q.height)}; }); r({right: Math.round(c.right), bs}); vvClose(); }, 600)); });
  ok(`Video-Blatt ${w}×${h}: [Kamera] [Ganz mit Balken] [Ganze App] ganz im Bild (vorher war „Ganze App“ abgeschnitten), Tasten ≥ 44 px`, VS.bs.every(b => b.r <= VS.right + .5 && b.h >= 44 && b.w >= 44), VS.bs.filter(b => /Kamera|Balken|App/.test(b.t)));
  await p._ctx.close();
}

/* ---------- 5) ohne Background und ohne LAUF: Matrix und Song pixelgleich zur Basis ---------- */
if (haveBasis) {
  const diffs = {};
  for (const [w, h] of [[428, 926], [926, 428], [926, 370]]) for (const view of ['mx', 'song']) {
    const imgs = [];
    for (const f of [basis, file]) {
      const p = await openPage(f, w, h);
      await p.evaluate(v => { SYNQUENZER.loadDemo(); SYNQUENZER.songFromChain([{scene: 0, bars: 4}, {scene: 1, bars: 4}]); setSongView(v === 'song'); UI.dirty.all = true; }, view); await W(p, 900);
      await hideToast(p); imgs.push((await p.screenshot()).toString('base64')); await p._ctx.close();
    }
    const p = await openPage(file, w, h);
    diffs[view + ' ' + w + 'x' + h] = await p.evaluate(async ([a, c]) => { const ld = s => new Promise(r => { const i = new Image(); i.onload = () => r(i); i.src = 'data:image/png;base64,' + s; }); const A = await ld(a), C = await ld(c); const cv = document.createElement('canvas'); cv.width = A.width; cv.height = A.height; const g = cv.getContext('2d'); g.drawImage(A, 0, 0); const da = g.getImageData(0, 0, A.width, A.height).data; g.clearRect(0, 0, A.width, A.height); g.drawImage(C, 0, 0); const dc = g.getImageData(0, 0, A.width, A.height).data; let n = 0; for (let i = 0; i < da.length; i += 4) if (Math.abs(da[i] - dc[i]) + Math.abs(da[i + 1] - dc[i + 1]) + Math.abs(da[i + 2] - dc[i + 2]) > 6) n++; return n; }, imgs);
    await p._ctx.close();
  }
  ok('Ohne Background-Spuren und ohne LAUF: Matrix und Song pixelgleich zur Basis (hochkant + quer)', Object.values(diffs).every(n => n === 0), diffs);
}

ok('Keine Fehler in der Konsole / auf der Seite', allErrs.length === 0, allErrs.slice(0, 5));
fs.writeFileSync(path.join(out, 'gl1-ergebnis.json'), JSON.stringify(res, null, 1));
const nf = res.filter(r => !r.pass).length; console.log((nf ? 'FEHLER ' : 'OK ') + `GL1: ${res.length - nf}/${res.length} bestanden`);
await b.close();
process.exit(nf ? 1 : 0);
