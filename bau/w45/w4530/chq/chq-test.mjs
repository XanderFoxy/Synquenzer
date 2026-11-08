// CHQ-Test: Background-Gruppe rollbar (viele Chor-Spuren). 2/4/8 Chor-Spuren × 428×926 / 926×428 / 926×370 in Matrix und Song:
// Zeilenhöhe ≥ 22 px, Treffer (ganze Zeilenhöhe, ≥ 44 px breit), keine Überlappung (GL1-Scanner __gl1Scan aus gl1-test.mjs), ohne
// Rollen (jede Zeile ≥ 22 px) pixelgleich zur Basis; Rollen per CDP-Touch bewegt nur die Gruppe (Matrix nativ, Song Fenster),
// Song-Wischen waagrecht unverändert, Richtung nach 8 px, Tipp auf eine gerollte Zeile öffnet die richtige Stimme, Halten = voller
// Name, kein ↶ / nichts im Projekt, Drehen hin und zurück. Pflichtwörter-Zählung gegen die Basis.
// CHQ-P (Prüfer-Befunde): 1) Namen folgen der Leinwand auch über mehrere Spuren (Finger liegt, Namen-Spalte, Nachlauf); 2) Finger
// hält still → kein Einrasten, folgt danach weiter; App im Hintergrund → rastet ein; 3) Trefferhöhe = ganze Zeile (oben/Mitte/unten,
// gemessen und genannt); 4) Pixelvergleich nach frischem Aufbau in BEIDEN (Größe kurz ändern und zurück) + Geometrie im Anfangszustand.
// Aufruf: node chq-test.mjs <index.html> <ausgabe-ordner>   (ABSOLUTE Pfade; Basis = ../basis.html neben dem Paket)
import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
import fs from 'fs';
import path from 'path';
const [file, out] = process.argv.slice(2);
if (!file || !out) { console.log('FEHLER Aufruf: node chq-test.mjs <index.html> <ausgabe-ordner>'); process.exit(2); }
fs.mkdirSync(out, {recursive: true});
const fotos = path.join(path.dirname(file), 'fotos'); fs.mkdirSync(fotos, {recursive: true});
const basis = path.resolve(path.dirname(file), '..', 'basis.html'), haveBasis = fs.existsSync(basis);
const GL1T = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/w4492/gl1/gl1-test.mjs';
const res = []; const ok = (name, pass, info) => { res.push({name, pass: !!pass, info}); console.log((pass ? 'OK ' : 'FEHLER ') + name + (info !== undefined ? '  ' + JSON.stringify(info).slice(0, 900) : '')); };

// ---- Hilfen im Browser: das gemeinsame GL1-Projekt (STIMME + Refrain groß + Song mit Gesang) und der GL1-Scanner, unverändert übernommen ----
const gsrc = fs.readFileSync(GL1T, 'utf8');
const grab = n => { const m = new RegExp('const ' + n + ' = (".*?");\\n').exec(gsrc); if (!m) throw new Error('GL1-Hilfe fehlt: ' + n); return JSON.parse(m[1]); };
const HELP_SETUP = grab('HELP_SETUP'), HELP_SCAN = grab('HELP_SCAN');
// n Chor-Spuren (c1 … cn); der Refrain-Clip (Szene 4) und der Song-Gesang singen die ersten 6 (G6P.MAXV)
const HELP_LANES = `window.__chqLanes = function (n) {
  const st = stimmeT(), T = S.tracks[st], roles = ['uni', 'oct-1', 'ch+1', 'ch+2', 'st+2', 'oct+1', 'st-2', 'ch+3'];
  const lanes = []; for (let k = 0; k < n; k++) { const id = 'c' + (k + 1), o = T.chor.lanes.find(l => l.id === id); lanes.push(o ? Object.assign({}, o) : {id, role: roles[k], name: ''}); }
  T.chor = g6pNormLanes(Object.assign({}, T.chor, {lanes}));
  const a = T.clips[3].audio, v0 = a.chor.voices[0];
  a.chor.voices = lanes.slice(0, 6).map(l => a.chor.voices.find(v => v.lane === l.id) || Object.assign(deep(v0), {lane: l.id}));
  if (S.song && S.song.vox && S.song.vox[0] && S.song.vox[0].chor) S.song.vox[0].chor.voices = deep(a.chor.voices);
  CHS.mxSig = ''; CHS.svKey = ''; MX.key = ''; chsMxSync(true); mxLayout(); mxApply(); if (UI.songView) svLayout(); UI.dirty.all = UI.dirty.grid = UI.dirty.song = true;
  return chsLanes().map(l => l.id);
};
window.__chqMx = function () { setSongView(false); const st = stimmeT(); const pg = MX.pages ? MX.pages.findIndex(q => q.includes(st)) : 0; setTrackBank(Math.max(0, pg)); };
window.__chqSv = function () { setSongView(true); svLayout(); const st = stimmeT(); const pg = SV.pages ? SV.pages.findIndex(q => q.includes(st)) : 0; setTrackBank(Math.max(0, pg)); svLayout(); SV.cellW = 36; SV.x = 8 * 36; FOL.page.song = null; UI.dirty.song = true; svDraw(true); };
// CHQ-P Befund 1: jeder sichtbare Name im Streifen steht in der Zeile, in der die Leinwand seine Spur zeichnet (k0 + Spur − off),
// und zeigt den Namen dieser Spur
window.__chqLabChk = function () {
  const q = SYNQUENZER.chqInfo().sv, wr = SV.labs.querySelector('.chqlw'), cv = SV.cv.getBoundingClientRect(), L = chsLanes();
  if (!wr) return {strip: false, off: +q.off.toFixed(3), drag: q.drag, anim: q.anim, n: 0, bad: -1, seen: []};
  const wb = wr.getBoundingClientRect(); let bad = 0, n = 0; const seen = [];
  for (const d of wr.querySelectorAll('.sv-l.trk')) {
    const t = +d.dataset.t, li = -101 - t; if (!(t <= -101)) continue;
    const r = d.getBoundingClientRect(); if (r.bottom <= wb.top + .5 || r.top >= wb.bottom - .5) continue;
    const row = (r.top - cv.top - SV.rulerH) / SV.rowH, want = q.k0 + li - q.off, nm = L[li] ? L[li].name.replace(/^Chor /, '') : '?';
    const good = Math.abs(row - want) < .06 && d.textContent.includes(nm); n++; if (!good) bad++;
    seen.push(t + '@' + row.toFixed(2) + (good ? '' : '≠' + want.toFixed(2) + ':' + d.textContent.trim().slice(0, 8)));
  }
  return {strip: true, off: +q.off.toFixed(3), drag: q.drag, anim: q.anim, w: q.w, n, bad, seen};
};
window.__chqBad = s => s.textOverlap.length + s.cutV.length + s.cutH.length + s.btnOverlap.filter(x => !(/corner/.test(x.a) && /mtrm/.test(x.b))).length + s.covered.length + s.outside.length;
window.__chqEx = s => [...s.textOverlap, ...s.cutV, ...s.cutH, ...s.btnOverlap.filter(x => !(/corner/.test(x.a) && /mtrm/.test(x.b))), ...s.covered, ...s.outside].slice(0, 4);
`;
const b = await chromium.launch({args: ['--autoplay-policy=no-user-gesture-required']});
const allErrs = [];
async function openPage(f, w, h, mob) {
  const ctx = await b.newContext({viewport: {width: w, height: h}, hasTouch: true, isMobile: !!mob, deviceScaleFactor: mob ? 2 : 1});
  const p = await ctx.newPage();
  p.on('pageerror', e => allErrs.push(path.basename(f) + ': ' + String(e))); p.on('console', m => { if (m.type() === 'error') allErrs.push(path.basename(f) + ': ' + m.text()); });
  await p.goto('file://' + path.resolve(f)); await p.waitForTimeout(1500);
  for (const c of [HELP_SETUP, HELP_SCAN, HELP_LANES]) await p.addScriptTag({content: c});
  p._ctx = ctx; p.cdp = await ctx.newCDPSession(p); return p;
}
const W = (p, ms) => p.waitForTimeout(ms);
const hideToast = p => p.evaluate(() => { if (EL.toast) EL.toast.style.visibility = 'hidden'; });
const shotB = async p => { await W(p, 350); await hideToast(p); return p.screenshot(); };
// für den Pixelvergleich: das Logo (fein gezeichnete SVG-Fläche) und der Spur-Punkt rastern im Kopflos-Browser nicht jedes Mal gleich
// (Basis gegen Basis: bis ~30 px Rauschen genau dort) → in BEIDEN Bildern ausgeblendet; alles andere wird verglichen
// CHQ-P Befund 4: Chromium rastert nach Umbauten (z. B. Kasten an → aus beim Spurenwechsel 4 → 3) einzelne Kanten-Pixel (Strich-Rand
// einer Zelle) anders als nach einem frischen Aufbau – unsichtbar, aber ≠ 0 px. Darum wird vor jedem Vergleichsbild in BEIDEN Fassungen
// die Größe kurz geändert und zurückgestellt (die App baut alles neu auf); die Anfangs-Geometrie wird zusätzlich exakt verglichen
async function fresh(p, v) { const vp = p.viewportSize(); await p.setViewportSize({width: vp.width + 40, height: vp.height + 30}); await W(p, 400); await p.setViewportSize(vp); await W(p, 400); await p.evaluate(v => (v === 'sv' ? __chqSv() : __chqMx()), v); await W(p, 500); }
// Geometrie im Anfangszustand (vor fresh): Raster-Zeilen/-Spalten + alle Kinder des Rasters bzw. Song-Zeilen + Namen-Spalte
const GEOSIG = v => (v === 'mx'
  ? (() => { const g = EL.grid, cs = getComputedStyle(g); return [cs.gridTemplateRows, cs.gridTemplateColumns, g.className].concat([...g.children].filter(e => e.getClientRects().length).map(e => { const q = e.getBoundingClientRect(); return String(e.className).split(' ')[0] + (e.dataset.t != null ? '#' + e.dataset.t : '') + (e.dataset.id ? '@' + e.dataset.id : '') + (e.dataset.s != null ? ':' + e.dataset.s : '') + ' ' + [q.left, q.top, q.width, q.height].map(x => x.toFixed(2)).join(','); })); })()
  : [SV.rows.join(','), SV.rowH.toFixed(3), SV.w + 'x' + SV.h].concat([...SV.labs.querySelectorAll('*')].filter(e => e.getClientRects().length).map(e => { const q = e.getBoundingClientRect(); return e.tagName + '.' + String(e.className).split(' ')[0] + (e.dataset.t != null ? '#' + e.dataset.t : '') + ' ' + [q.left, q.top, q.width, q.height].map(x => x.toFixed(2)).join(',') + ' ' + (e.children.length ? '' : e.textContent.trim()); })));
const shotP = async p => { const h = await p.addStyleTag({content: '#topLogo svg,.clogo svg,#stDot{visibility:hidden!important}'}); await W(p, 120); const b = await p.screenshot(); await h.evaluate(e => e.remove()); await W(p, 60); return b; };
// Finger (CDP-Touch → Pointer-/Touch-Ereignisse wie am iPhone)
const tDown = (p, x, y) => p.cdp.send('Input.dispatchTouchEvent', {type: 'touchStart', touchPoints: [{x, y, id: 1, radiusX: 4, radiusY: 4, force: 1}]});
const tMove = (p, x, y) => p.cdp.send('Input.dispatchTouchEvent', {type: 'touchMove', touchPoints: [{x, y, id: 1, radiusX: 4, radiusY: 4, force: 1}]});
const tUp = p => p.cdp.send('Input.dispatchTouchEvent', {type: 'touchEnd', touchPoints: []});
async function drag(p, x0, y0, x1, y1, steps, msStep, hold) { await tDown(p, x0, y0); await W(p, 30); for (let k = 1; k <= steps; k++) { await tMove(p, x0 + (x1 - x0) * k / steps, y0 + (y1 - y0) * k / steps); await W(p, msStep || 16); } if (hold) await W(p, hold); await tUp(p); }
async function tap(p, x, y) { await tDown(p, x, y); await W(p, 60); await tUp(p); await W(p, 150); }
const SIZES = [[428, 926], [926, 428], [926, 370]], NS = [2, 4, 8];
// Song: zwei waagrechte Gesten in der Background-Gruppe (Zeitachse jeweils ab 0): b) 150 px nach links, c) 12 px links, dann senkrecht
async function hSwipes(p) {
  const q = () => p.evaluate(() => { const r = SV.cv.getBoundingClientRect(), gi = SV.rows.indexOf(-100), i = SYNQUENZER.chqInfo ? SYNQUENZER.chqInfo().sv : null; return {l: r.left, w: r.width, y: r.top + SV.rulerH + (gi + 2.5) * SV.rowH, x: +SV.x.toFixed(1), off: i ? i.off : null, rows: SV.rows.join(',')}; });
  const x0 = () => p.evaluate(() => { cancelAnimationFrame(SV.mom); SV.vx = 0; SV.x = 0; UI.dirty.song = true; svDraw(true); });
  await x0(); await W(p, 150);
  const a = await q(), xm = a.l + a.w * .55;
  await drag(p, xm, a.y, xm - 150, a.y + 6, 12, 16); await W(p, 900);
  const b = await q();
  await x0(); await W(p, 150);
  await tDown(p, xm, a.y); await W(p, 30); for (let k = 1; k <= 4; k++) { await tMove(p, xm - 3 * k, a.y); await W(p, 16); } for (let k = 1; k <= 10; k++) { await tMove(p, xm - 12 - k, a.y - 8 * k); await W(p, 16); } await tUp(p); await W(p, 900);
  const c = await q();
  return {a, b, c};
}
const diffPx = (p, a, c) => p.evaluate(async ([a, c]) => { const ld = s => new Promise(r => { const i = new Image(); i.onload = () => r(i); i.src = 'data:image/png;base64,' + s; }); const A = await ld(a), C = await ld(c); if (A.width !== C.width || A.height !== C.height) return -1; const cv = document.createElement('canvas'); cv.width = A.width; cv.height = A.height; const g = cv.getContext('2d'); g.drawImage(A, 0, 0); const da = g.getImageData(0, 0, A.width, A.height).data; g.clearRect(0, 0, A.width, A.height); g.drawImage(C, 0, 0); const dc = g.getImageData(0, 0, A.width, A.height).data; let n = 0; for (let i = 0; i < da.length; i += 4) if (Math.abs(da[i] - dc[i]) + Math.abs(da[i + 1] - dc[i + 1]) + Math.abs(da[i + 2] - dc[i + 2]) > 6) n++; return n; }, [a.toString('base64'), c.toString('base64')]);

/* ---------- 0) Pflicht: Wörter gegen die Basis, MS 2000, live: true, keine Emojis im Block ---------- */
{
  const src = fs.readFileSync(file, 'utf8'), bs = haveBasis ? fs.readFileSync(basis, 'utf8') : '';
  const words = ['Korg', 'microKORG', 'RADIAS', 'DWGS', 'Kodamo', 'Mask1', 'Nord', 'Clavia', 'Elektron', 'Octatrack'];
  const cnt = (s, w) => (s.match(new RegExp(w, 'g')) || []).length;
  const more = words.filter(w => cnt(src, w) > cnt(bs, w));
  ok('Pflicht: verbotene Wörter nicht häufiger als in der Basis', !more.length, {more, je: Object.fromEntries(words.map(w => [w, cnt(src, w) + '/' + cnt(bs, w)]))});
  ok('Pflicht: „MS 2000“ genau 1×, „  live: true,“ genau 1×', cnt(src, 'MS 2000') === 1 && src.split('  live: true,').length - 1 === 1, {ms: cnt(src, 'MS 2000'), live: src.split('  live: true,').length - 1});
  const blk = (src.match(/\/\* CHQ-BEGIN \*\/[\s\S]*?\/\* CHQ-END \*\//) || [''])[0] + (src.match(/\/\* CHQ-CSS-BEGIN[\s\S]*?\/\* CHQ-CSS-END \*\//) || [''])[0];
  const emo = blk.match(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu) || [];
  ok('Pflicht: CHQ-Block vorhanden, keine Emojis als Grafik darin', blk.length > 2000 && !emo.length, {len: blk.length, emo});
}

/* ---------- 1) Geometrie: 2/4/8 Spuren × 3 Bildgrößen × Matrix/Song; Fotos; Bilder für den Pixelvergleich ---------- */
const G = {}, IMG = {};
async function geo(f, tag) {
  for (const n of NS) for (const [w, h] of SIZES) {
    const p = await openPage(f, w, h), k = n + ' ' + w + 'x' + h;
    await p.evaluate(() => __gl1Setup()); await p.evaluate(() => SYNQUENZER.chsOpen(true));
    await p.evaluate(n => __chqLanes(n), n);
    await p.evaluate(() => __chqMx()); await W(p, 400);
    const m = await p.evaluate(() => {
      const s = __gl1Scan('#app'), q = typeof SYNQUENZER.chqInfo === 'function' ? SYNQUENZER.chqInfo() : null;
      const box = document.querySelector('#clipGrid .chqs'), br = box ? box.getBoundingClientRect() : null;
      const lanes = CHS.mx.rows.slice(1).map(r => { const a = r.h.getBoundingClientRect(), cs = r.cells.filter(c => !c.el.classList.contains('mxoff')).map(c => c.el.getBoundingClientRect()); const vis = !br || (a.bottom > br.top + 1 && a.top < br.bottom - 1); return {id: r.id, h: +a.height.toFixed(2), headW: +a.width.toFixed(1), cellW: cs.length ? +Math.min(...cs.map(c => c.width)).toFixed(1) : 0, eW: +r.e.getBoundingClientRect().width.toFixed(1), vis, full: !br || (a.top >= br.top - .5 && a.bottom <= br.bottom + .5)}; });
      // Treffer: oben (15 %), in der Mitte und unten (85 %) jeder ganz sichtbaren Zeile trifft der Finger genau diese Spur (Kopf und
      // jede Zelle) – die ganze Zeilenhöhe ist Treffer (CHQ-P Befund 3: die Höhe wird gemessen und genannt)
      let hitBad = 0, hitN = 0; for (const r of CHS.mx.rows.slice(1)) { const a = r.h.getBoundingClientRect(); if (br && (a.top < br.top - .5 || a.bottom > br.bottom + .5)) continue; for (const e of [r.h, ...r.cells.filter(c => !c.el.classList.contains('mxoff')).map(c => c.el)]) { const q = e.getBoundingClientRect(); for (const f of [.15, .5, .85]) { const x = q.left + q.width / 2, y = q.top + q.height * f, hit = document.elementFromPoint(x, y); hitN++; if (!hit || !(hit === e || e.contains(hit))) hitBad++; } } }
      const rows = (getComputedStyle(EL.grid).gridTemplateRows || '').split(' ').map(parseFloat);
      return {bad: __chqBad(s), ex: __chqEx(s), rowH: +rows[1].toFixed(2), lanes, hitBad, hitN, chq: q ? q.mx : null};
    });
    m.sig = await p.evaluate(GEOSIG, 'mx');
    G[tag + ' mx ' + k] = m;
    IMG[tag + ' mx ' + k] = await shotB(p); await fresh(p, 'mx'); IMG['P ' + tag + ' mx ' + k] = await shotP(p);
    await p.evaluate(() => __chqSv()); await W(p, 400);
    const s = await p.evaluate(() => {
      const s = __gl1Scan('#app'), q = typeof SYNQUENZER.chqInfo === 'function' ? SYNQUENZER.chqInfo() : null, need = SV.rulerH + (SV.rows.length + 2) * SV.rowH;
      const laneRows = SV.rows.filter(c => c <= -101).length;
      // Treffer im Song: oben (10 %), Mitte, unten (90 %) jeder Chor-Zeile → dieselbe Zeile (svRowAt, wie der Tipp)
      let hitBad = 0; SV.rows.forEach((c, r) => { if (c > -101) return; for (const f of [.1, .5, .9]) if (svRowAt(SV.rulerH + (r + f) * SV.rowH) !== r) hitBad++; });
      return {bad: __chqBad(s), ex: __chqEx(s), rowH: +SV.rowH.toFixed(2), fits: need <= SV.h + .5, laneRows, hitBad, chq: q ? q.sv : null, labW: SV.labs.getBoundingClientRect().width, cvW: SV.w};
    });
    s.sig = await p.evaluate(GEOSIG, 'sv');
    G[tag + ' sv ' + k] = s;
    IMG[tag + ' sv ' + k] = await shotB(p); await fresh(p, 'sv'); IMG['P ' + tag + ' sv ' + k] = await shotP(p);
    if (tag === 'neu' && n === 8) { fs.writeFileSync(path.join(fotos, `chq-matrix-8spuren-${w}x${h}.png`), IMG[tag + ' mx ' + k]); fs.writeFileSync(path.join(fotos, `chq-song-8spuren-${w}x${h}.png`), IMG[tag + ' sv ' + k]); }
    if (tag === 'neu' && n === 4 && h === 370) { fs.writeFileSync(path.join(fotos, `chq-matrix-4spuren-${w}x${h}.png`), IMG[tag + ' mx ' + k]); fs.writeFileSync(path.join(fotos, `chq-song-4spuren-${w}x${h}.png`), IMG[tag + ' sv ' + k]); }
    if (tag === 'basis' && n === 8) { fs.writeFileSync(path.join(out, `vorher-matrix-8spuren-${w}x${h}.png`), IMG[tag + ' mx ' + k]); fs.writeFileSync(path.join(out, `vorher-song-8spuren-${w}x${h}.png`), IMG[tag + ' sv ' + k]); }
    await p._ctx.close();
  }
}
await geo(file, 'neu');
if (haveBasis) await geo(basis, 'basis');
for (const n of NS) for (const [w, h] of SIZES) {
  const k = n + ' ' + w + 'x' + h, m = G['neu mx ' + k], s = G['neu sv ' + k], mb = G['basis mx ' + k], sb = G['basis sv ' + k];
  const on = m.chq && m.chq.on, laneMin = Math.min(...m.lanes.map(l => l.h)), wMin = Math.min(...m.lanes.map(l => Math.min(l.headW, l.cellW)));
  ok(`Matrix ${n} Spuren ${w}x${h}: Chor-Zeilen ≥ 22 px (${laneMin} px${on ? ', rollt: ' + m.lanes.filter(l => l.full).length + ' von ' + n + ' ganz zu sehen' : ''}; vorher ${mb ? mb.rowH + ' px' : '–'}), Treffer = ganze Zeile (Höhe ${laneMin} px, oben/Mitte/unten ${m.hitN - m.hitBad}/${m.hitN}) × ≥ 44 px Breite (${wMin} px), 0 Überlappung/abgeschnitten (vorher ${mb ? mb.bad : '–'})`,
    laneMin >= CHQ_MIN() - .05 && wMin >= 44 && m.hitBad === 0 && m.hitN > 0 && m.bad === 0 && (!mb || mb.rowH >= 22 ? !on : on), {rowH: m.rowH, laneMin, wMin, hitBad: m.hitBad, hitN: m.hitN, on, K: m.chq && m.chq.K, ex: m.ex, vorher: mb ? {rowH: mb.rowH, bad: mb.bad} : null});
  const son = s.chq && s.chq.w != null;
  ok(`Song ${n} Spuren ${w}x${h}: Zeilen ≥ 22 px (${s.rowH} px${son ? ', Fenster ' + s.chq.w + ' von ' + n : ''}; vorher ${sb ? sb.rowH + ' px' : '–'}), Treffer = ganze Zeile (Höhe ${s.rowH} px, oben/Mitte/unten), alle Zeilen im Bild, 0 Überlappung (vorher ${sb ? sb.bad : '–'})`,
    s.rowH >= CHQ_MIN() - .05 && s.fits && s.bad === 0 && s.hitBad === 0 && (!sb || sb.rowH >= 22 ? !son : son), {rowH: s.rowH, fits: s.fits, laneRows: s.laneRows, hitBad: s.hitBad, chq: s.chq, ex: s.ex, vorher: sb ? {rowH: sb.rowH, bad: sb.bad} : null});
}
function CHQ_MIN() { return 22; }

/* ---------- 2) Ohne Rollen (jede Zeile ≥ 22 px): pixelgleich zur Basis ---------- */
// ein frisches Bildpaar (Basis / neu) derselben Lage; Logo/Spur-Punkt ausgeblendet (shotP). Zeigt ein Vergleich Unterschiede, wird die Lage
// bis zu 2× frisch nachgeholt und der kleinste Wert gezählt: Pegel-/Lauflicht-Rauschen (Basis gegen Basis 0–5 px, mal hier, mal dort)
// verschwindet dabei, eine echte Änderung bleibt in jedem Paar stehen
async function shotCfg(f, n, w, h, v) {
  const p = await openPage(f, w, h);
  await p.evaluate(() => __gl1Setup()); await p.evaluate(() => SYNQUENZER.chsOpen(true)); await p.evaluate(n => __chqLanes(n), n);
  if (v === 'sv') { await p.evaluate(() => __chqMx()); await W(p, 400); }
  await p.evaluate(v => (v === 'sv' ? __chqSv() : __chqMx()), v); await W(p, 400); await W(p, 350); await hideToast(p);
  const on = await p.evaluate(v => { const q = typeof SYNQUENZER.chqInfo === 'function' ? SYNQUENZER.chqInfo() : null; return q ? (v === 'mx' ? q.mx.on : q.sv.w != null) : false; }, v);
  const sig = await p.evaluate(GEOSIG, v);
  await fresh(p, v); await hideToast(p);
  const img = await shotP(p); await p._ctx.close(); return {img, on, sig};
}
if (haveBasis) {
  const p = await openPage(file, 400, 300), diffs = {}, why = {}, tries = {};
  const geoD = {};   // Anfangs-Geometrie (vor dem frischen Aufbau) Basis gegen neu: Anzahl abweichender Einträge
  const sigD = (a, c) => { const sa = new Set(a), sc = new Set(c); return a.filter(x => !sc.has(x)).length + c.filter(x => !sa.has(x)).length; };
  const pair = async (n, w, h, v) => { const a = await shotCfg(basis, n, w, h, v), c = await shotCfg(file, n, w, h, v); return {d: await diffPx(p, a.img, c.img), on: c.on, g: sigD(a.sig, c.sig)}; };
  const settle = async (k, d, n, w, h, v) => { let t = 0; while (d > 0 && t < 2) { t++; d = Math.min(d, (await pair(n, w, h, v)).d); } if (t) tries[k] = t; return d; };
  for (const n of NS) for (const [w, h] of SIZES) for (const v of ['mx', 'sv']) {
    const k = n + ' ' + w + 'x' + h, nb = G['basis ' + v + ' ' + k], nn = G['neu ' + v + ' ' + k];
    const inactive = v === 'mx' ? !(nn.chq && nn.chq.on) : !(nn.chq && nn.chq.w != null);
    if (!inactive) continue;
    if (v === 'mx' && w < h && nb.rowH < 32) { why[v + ' ' + k] = 'gewollt: hochkant < 32 px – Spurköpfe STIMME/DRUMS enger, Name + Klang ganz zu sehen (vorher ' + nb.bad + ' abgeschnitten)'; continue; }
    diffs[v + ' ' + k] = await settle(v + ' ' + k, await diffPx(p, IMG['P basis ' + v + ' ' + k], IMG['P neu ' + v + ' ' + k]), n, w, h, v);
    geoD[v + ' ' + k] = sigD(nb.sig, nn.sig);
  }
  // 3 Chor-Spuren: eigene Bildpaare (Matrix und Song, alle drei Lagen)
  const on3 = {};
  for (const [w, h] of SIZES) for (const v of ['mx', 'sv']) { const k = v + ' 3 ' + w + 'x' + h, r = await pair(3, w, h, v); on3[k] = r.on; geoD[k] = r.g; diffs[k] = await settle(k, r.d, 3, w, h, v); }
  await p._ctx.close();
  const le3 = Object.entries(diffs).filter(([k]) => /^(mx|sv) [23] /.test(k));
  ok('≤ 3 Chor-Spuren (2 und 3) in Matrix und Song, hochkant und quer: nichts rollt, pixelgleich zur Basis', le3.length === 12 && le3.every(([, d]) => d === 0) && !Object.values(on3).some(Boolean), {diffs: Object.fromEntries(le3), rollt: on3, nachgeholt: tries});
  ok('Auch sonst, wo nichts rollt (4 Spuren hochkant/926×428, 8 Spuren im Song hochkant): pixelgleich zur Basis', Object.entries(diffs).every(([, d]) => d === 0), {diffs, gewollt: why, nachgeholt: tries});
  ok('Prüfung (Befund 4): wo nichts rollt, ist schon der Anfangszustand (vor dem frischen Aufbau) gleich wie die Basis – Raster-Zeilen/-Spalten, Lage jedes Raster-Kinds, Song-Zeilen und Namen (' + Object.keys(geoD).length + ' Lagen)', Object.keys(geoD).length >= 17 && Object.values(geoD).every(d => d === 0), geoD);
}

/* ---------- 3) Matrix 926×370, 8 Spuren: Rollen per Touch bewegt nur die Gruppe; Tipp auf eine gerollte Zeile öffnet die richtige Stimme ---------- */
{
  const p = await openPage(file, 926, 370, true);
  await p.evaluate(() => __gl1Setup()); await p.evaluate(() => SYNQUENZER.chsOpen(true)); await p.evaluate(() => __chqLanes(8)); await p.evaluate(() => __chqMx()); await W(p, 400);
  const snap = () => p.evaluate(() => {
    const R = e => { const r = e.getBoundingClientRect(); return [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)].join(','); };
    const st = stimmeT(), box = document.querySelector('#clipGrid .chqs');
    return {fixed: {stimme: R(UI.heads[st].el), grp: R(CHS.mx.rows[0].h), drums: R(UI.heads[DRUM_T].el), scn: R(UI.scenes[0]), app: R(EL.app), grid: R(EL.grid), box: R(box)},
      top: box.scrollTop, lane: CHS.mx.rows.slice(1).map(r => Math.round(r.h.getBoundingClientRect().top)), page: [window.scrollY, document.scrollingElement.scrollTop, EL.gridArea.scrollTop], info: SYNQUENZER.chqInfo().mx, undo: UNDO.length,
      proj: JSON.stringify(S.tracks[st].chor) + JSON.stringify(S.song)};
  });
  const a = await snap();
  fs.writeFileSync(path.join(fotos, 'chq-matrix-926x370-oben.png'), await shotB(p));
  const bx = await p.evaluate(() => { const r = document.querySelector('#clipGrid .chqs').getBoundingClientRect(); const c = CHS.mx.rows[1].cells[3].el.getBoundingClientRect(); return {x: c.left + c.width / 2, y0: r.top + r.height * .8, y1: r.top + r.height * .8 - 70}; });
  await drag(p, bx.x, bx.y0, bx.x, bx.y1, 10, 16); await W(p, 900);
  const bb = await snap();
  const same = Object.keys(a.fixed).every(k => a.fixed[k] === bb.fixed[k]);
  ok('Matrix 926×370: ein Finger senkrecht im Kasten rollt nur die Chor-Spuren (STIMME, BACKGROUND, DRUMS, Szenen, Raster und Seite stehen still)', bb.top > 20 && same && bb.page.every(v => v === 0) && bb.lane[0] < a.lane[0] - 20, {vorher: a.top, nachher: bb.top, fest: same ? 'gleich' : {a: a.fixed, b: bb.fixed}, page: bb.page, lane0: [a.lane[0], bb.lane[0]]});
  ok('Matrix: Rand-Hinweis „mehr ↓“ oben am Anfang, ↑ nach dem Rollen; kein ↶, Projekt unverändert', a.info.more && !a.info.less && bb.info.less && bb.undo === a.undo && bb.proj === a.proj, {a: a.info, b: bb.info, undo: [a.undo, bb.undo]});
  fs.writeFileSync(path.join(fotos, 'chq-matrix-926x370-gerollt.png'), await shotB(p));
  // weiter bis ganz unten: „mehr ↓“ verschwindet; Spur c6 (6. Stimme) ganz sichtbar → Tipp auf ihre Zelle in Szene 4
  await drag(p, bx.x, bx.y0, bx.x, bx.y1 - 120, 12, 16); await W(p, 900);
  const c = await p.evaluate(() => { const box = document.querySelector('#clipGrid .chqs').getBoundingClientRect(), r6 = CHS.mx.rows.find(r => r.id === 'c6'), q = r6.cells[3].el.getBoundingClientRect(); return {info: SYNQUENZER.chqInfo().mx, x: q.left + q.width / 2, y: q.top + q.height / 2, inBox: q.top >= box.top - .5 && q.bottom <= box.bottom + .5}; });
  ok('Matrix: ganz unten kein „mehr ↓“ mehr (nur ↑)', !c.info.more && c.info.less && c.info.top >= c.info.max - 1, c.info);
  await tap(p, c.x, c.y); await W(p, 600);
  const ed = await p.evaluate(() => { const e = (typeof G2 !== 'undefined' && G2.ed) || null; if (!e) return null; const a = S.tracks[stimmeT()].clips[3].audio; const o = {voice: e.voice, lane: e.voice != null && a.chor.voices[e.voice] ? a.chor.voices[e.voice].lane : null, r: e.r}; return o; });
  ok('Matrix: Tipp auf die gerollte Zeile „c6“ (Szene 4) öffnet genau diese Stimme', c.inBox && ed && ed.lane === 'c6', {inBox: c.inBox, ed});
  fs.writeFileSync(path.join(fotos, 'chq-matrix-926x370-tipp-stimme.png'), await shotB(p));
  await p.evaluate(() => { try { if (G2.ed) g2Close(); } catch (e) {} closePop(); }); await W(p, 300);
  // Seite umblättern und zurück: der Rollstand bleibt
  const t0 = await p.evaluate(() => document.querySelector('#clipGrid .chqs').scrollTop);
  await p.evaluate(() => { setTrackBank(0); }); await W(p, 200); await p.evaluate(() => __chqMx()); await W(p, 300);
  const t1 = await p.evaluate(() => ({top: document.querySelector('#clipGrid .chqs').scrollTop, vis: SYNQUENZER.chqInfo().mx.vis}));
  ok('Matrix: ▲▼ auf die andere Seite und zurück – der Kasten steht wieder an derselben Stelle', t1.vis && Math.abs(t1.top - t0) <= 1, {t0, t1});
  // Drehen: hochkant (alles passt) → keine Rolle; zurück quer → Kasten wieder da
  await p.setViewportSize({width: 428, height: 926}); await W(p, 700); await p.evaluate(() => __chqMx()); await W(p, 300);
  const port = await p.evaluate(() => ({on: SYNQUENZER.chqInfo().mx.on, box: !!document.querySelector('#clipGrid .chqw'), lanes: CHS.mx.rows.slice(1).map(r => Math.round(r.h.getBoundingClientRect().height)), bad: __chqBad(__gl1Scan('#app'))}));
  await p.setViewportSize({width: 926, height: 370}); await W(p, 700); await p.evaluate(() => __chqMx()); await W(p, 300);
  const land = await p.evaluate(() => ({on: SYNQUENZER.chqInfo().mx.on, box: !!document.querySelector('#clipGrid .chqw'), bad: __chqBad(__gl1Scan('#app'))}));
  ok('Matrix: drehen hochkant → alle 8 Spuren im Raster (kein Kasten), zurück quer → Kasten wieder da; jeweils 0 Befunde', !port.on && !port.box && port.lanes.every(x => x >= 22) && port.bad === 0 && land.on && land.box && land.bad === 0, {port, land});
  await p._ctx.close();
}

/* ---------- 4) Song 926×370, 8 Spuren: Fenster rollen, waagrecht wischen, Richtung nach 8 px, Tipp, Namen halten ---------- */
{
  const p = await openPage(file, 926, 370, true);
  await p.evaluate(() => __gl1Setup()); await p.evaluate(() => SYNQUENZER.chsOpen(true)); await p.evaluate(() => __chqLanes(8)); await p.evaluate(() => __chqSv()); await W(p, 400);
  const geo4 = () => p.evaluate(() => { const r = SV.cv.getBoundingClientRect(), q = SYNQUENZER.chqInfo().sv, k0 = q.k0; return {l: r.left, t: r.top, w: r.width, ru: SV.rulerH, rh: SV.rowH, k0, wN: q.w, off: q.off, x: SV.x, rows: SV.rows.join(','), lab: [...SV.labs.querySelectorAll('.chqli .sv-l.trk')].map(d => d.dataset.t).join(','), drumR: SV.rows.indexOf(DRUM_T), stR: SV.rows.indexOf(stimmeT()), undo: UNDO.length, proj: JSON.stringify(S.song) + JSON.stringify(S.tracks[stimmeT()].chor)}; });
  const g0 = await geo4();
  fs.writeFileSync(path.join(fotos, 'chq-song-926x370-oben.png'), await shotB(p));
  const yMid = g0.t + g0.ru + (g0.k0 + 1.5) * g0.rh, xMid = g0.l + g0.w * .55;
  // a) senkrecht in der Gruppe nach oben ziehen (3 Spuren) → Fenster rollt, rastet ein; Zeitachse bleibt
  await drag(p, xMid, yMid + 30, xMid, yMid + 30 - 3 * g0.rh - 8, 14, 18, 120); await W(p, 700);
  const g1 = await geo4();
  ok('Song 926×370: senkrecht ziehen in der Background-Gruppe rollt das Fenster (eingerastet auf eine ganze Spur); Lineal/Zeitachse/übrige Zeilen bleiben', g1.off >= 2 && Number.isInteger(g1.off) && g1.x === g0.x && g1.drumR === g0.drumR && g1.stR === g0.stR && g1.rows !== g0.rows, {vorher: {off: g0.off, rows: g0.rows}, nachher: {off: g1.off, rows: g1.rows, lab: g1.lab}, x: [g0.x, g1.x]});
  ok('Song: die Namen-Spalte zeigt die Spuren des Fensters (+ eine, die nachrückt); kein ↶, Projekt unverändert', g1.lab.split(',')[0] === String(-101 - g1.off) && g1.undo === g0.undo && g1.proj === g0.proj, {lab: g1.lab, undo: [g0.undo, g1.undo]});
  fs.writeFileSync(path.join(fotos, 'chq-song-926x370-gerollt.png'), await shotB(p));
  // b) + c) waagrecht wischen in der (gerollten) Gruppe – genau wie in der Basis (dieselbe Geste, Zeitachse ab Takt 1)
  const hn = await hSwipes(p);
  let hb = null; if (haveBasis) { const pb = await openPage(basis, 926, 370, true); await pb.evaluate(() => __gl1Setup()); await pb.evaluate(() => SYNQUENZER.chsOpen(true)); await pb.evaluate(() => __chqLanes(8)); await pb.evaluate(() => __chqSv()); await W(pb, 400); hb = await hSwipes(pb); await pb._ctx.close(); }
  const near = (x, y, f, m) => Math.abs(x - y) <= Math.max(m, f * Math.abs(y));
  ok('Song: waagrecht wischen (auch in der gerollten Gruppe) bewegt nur die Zeitachse – so weit wie in der Basis, das Fenster bleibt',
    hn.b.x > 60 && hn.b.off === hn.a.off && hn.b.rows === hn.a.rows && (!hb || near(hn.b.x, hb.b.x, .1, 6)), {neu: {x: hn.b.x, off: [hn.a.off, hn.b.off]}, basis: hb ? hb.b.x : null});
  ok('Song: Richtung steht nach den ersten 8 px fest – erst waagrecht, dann senkrecht = bleibt Zeitachse (Fenster unverändert, wie Basis)',
    hn.c.x > 5 && hn.c.off === hn.a.off && hn.c.rows === hn.a.rows && (!hb || near(hn.c.x, hb.c.x, .15, 4)), {neu: {x: hn.c.x, off: [hn.a.off, hn.c.off]}, basis: hb ? hb.c.x : null});
  const g3 = await geo4();
  // d) senkrecht außerhalb der Gruppe (DRUMS-Zeile) → nichts rollt
  const yDr = g0.t + g0.ru + (g0.drumR + .5) * g0.rh;
  await drag(p, xMid, yDr, xMid, yDr - 60, 10, 16); await W(p, 600);
  const g4 = await geo4();
  ok('Song: senkrecht ziehen außerhalb der Gruppe (DRUMS-Zeile) rollt nichts', g4.off === g3.off && g4.rows === g3.rows, {off: [g3.off, g4.off]});
  // e) Tipp auf eine gerollte Zeile: Fenster so, dass c6 zu sehen ist, Zeitachse auf Takt 15 (Song-Gesang) → öffnet Stimme c6
  await p.evaluate(() => { SV.x = 8 * 36; UI.dirty.song = true; svDraw(true); });
  const want = await p.evaluate(() => { const q = SYNQUENZER.chqInfo().sv; return Math.min(q.n - q.w, 5 - q.w + 1); });
  await p.evaluate(k => SYNQUENZER.chqSvTo(k), want); await W(p, 800);
  const tp = await p.evaluate(() => { const r = SV.cv.getBoundingClientRect(), q = SYNQUENZER.chqInfo().sv, row = SV.rows.indexOf(-106), bar = 14.5; return {row, x: r.left + bar * SV.cellW - SV.x, y: r.top + SV.rulerH + (row + .5) * SV.rowH, off: q.off}; });
  await tap(p, tp.x, tp.y); await W(p, 600);
  const ed = await p.evaluate(() => { const e = (typeof G2 !== 'undefined' && G2.ed) || null; if (!e) return null; const v = S.song.vox[0]; return {voice: e.voice, lane: e.voice != null && v.chor.voices[e.voice] ? v.chor.voices[e.voice].lane : null}; });
  ok('Song: Tipp auf die gerollte Zeile „c6“ im Song-Gesang (Takt 15) öffnet genau diese Stimme', tp.row >= 0 && ed && ed.lane === 'c6', {tp, ed});
  fs.writeFileSync(path.join(fotos, 'chq-song-926x370-tipp-stimme.png'), await shotB(p));
  await p.evaluate(() => { try { if (G2.ed) g2Close(); } catch (e) {} closePop(); }); await W(p, 400);
  // f) Tipp während des Nachlaufens hält nur an (öffnet nichts)
  await p.evaluate(() => SYNQUENZER.chqSvTo(0)); await W(p, 40);
  const g5 = await geo4(); await tap(p, xMid, g5.t + g5.ru + (g5.k0 + .5) * g5.rh); await W(p, 500);
  const st5 = await p.evaluate(() => ({ed: !!(typeof G2 !== 'undefined' && G2.ed), pop: UI.pop ? UI.pop.name : null, q: SYNQUENZER.chqInfo().sv}));
  ok('Song: ein Tipp während das Fenster nachläuft hält es nur an (rastet auf eine Spur, öffnet nichts)', !st5.ed && !st5.pop && Number.isInteger(st5.q.off) && !st5.q.anim, st5);
  await p.evaluate(() => { try { if (G2.ed) g2Close(); } catch (e) {} closePop(); }); await W(p, 300);
  // g) Namen-Spalte: senkrecht ziehen rollt ebenso; Halten zeigt den vollen Namen (kein Mischpult)
  await p.evaluate(() => SYNQUENZER.chqSvTo(0)); await W(p, 600);
  const lb = await p.evaluate(() => { const d = SV.labs.querySelector('.chqli .sv-l.trk'); const r = d.getBoundingClientRect(); return {x: r.left + r.width / 2, y: r.top + r.height / 2, h: r.height}; });
  await drag(p, lb.x, lb.y + lb.h, lb.x, lb.y + lb.h - 2 * lb.h - 6, 10, 18, 120); await W(p, 700);
  const g6 = await geo4();
  ok('Song: senkrecht ziehen in der Namen-Spalte rollt die Gruppe ebenso (kein Mischpult)', g6.off >= 1 && !(await p.evaluate(() => UI.pop && UI.pop.name)), {off: g6.off});
  await p.evaluate(() => SYNQUENZER.chqSvTo(0)); await W(p, 600);
  const l2 = await p.evaluate(() => { const d = [...SV.labs.querySelectorAll('.chqli .sv-l.trk')][2]; const r = d.getBoundingClientRect(); return {x: r.left + r.width / 2, y: r.top + r.height / 2, t: d.dataset.t, short: d.textContent.trim()}; });
  await tDown(p, l2.x, l2.y); await W(p, 700);
  const tip = await p.evaluate(() => { const t = document.querySelector('.chqtip'); const r = t ? t.getBoundingClientRect() : null; return {info: SYNQUENZER.chqInfo().tip, vis: !!(t && t.classList.contains('on')), r: r ? [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)] : null, inView: !!r && r.left >= 0 && r.right <= innerWidth && r.top >= 0 && r.bottom <= innerHeight}; });
  fs.writeFileSync(path.join(fotos, 'chq-song-926x370-name-halten.png'), await shotB(p));
  await tUp(p); await W(p, 500);
  const after = await p.evaluate(() => ({pop: UI.pop ? UI.pop.name : null}));
  ok('Song: Halten auf dem gekürzten Namen „' + l2.short + '“ zeigt den vollen Namen (Schild im Bild), Loslassen öffnet kein Mischpult', tip.vis && tip.inView && /Chor /.test(tip.info.txt) && !after.pop, {tip, after});
  // Mischpult per kurzem Tipp öffnet weiterhin (bisheriges Verhalten)
  await W(p, 600); await tap(p, l2.x, l2.y); await W(p, 500);
  const mix = await p.evaluate(() => UI.pop ? UI.pop.name : null);
  ok('Song: kurzer Tipp auf den Namen öffnet das Mischpult wie bisher', !!mix, {pop: mix});
  await p.evaluate(() => closePop());
  // h) Drehen: hochkant (alles passt, Fenster weg), zurück quer (Fenster wieder, Rollstand gemerkt)
  await p.evaluate(() => SYNQUENZER.chqSvTo(3)); await W(p, 600);
  await p.setViewportSize({width: 428, height: 926}); await W(p, 800); await p.evaluate(() => __chqSv()); await W(p, 300);
  const sp = await p.evaluate(() => ({q: SYNQUENZER.chqInfo().sv, lanes: SV.rows.filter(c => c <= -101).length, rowH: SV.rowH, bad: __chqBad(__gl1Scan('#app')), wrap: !!SV.labs.querySelector('.chqlw')}));
  await p.setViewportSize({width: 926, height: 370}); await W(p, 800); await p.evaluate(() => __chqSv()); await W(p, 300);
  const sl = await p.evaluate(() => ({q: SYNQUENZER.chqInfo().sv, bad: __chqBad(__gl1Scan('#app')), wrap: !!SV.labs.querySelector('.chqlw')}));
  ok('Song: drehen hochkant → alle 8 Spuren, kein Fenster; zurück quer → Fenster wieder an derselben Stelle; jeweils 0 Befunde', sp.q.w == null && sp.lanes === 8 && !sp.wrap && sp.bad === 0 && sl.q.w != null && sl.q.off === 3 && sl.wrap && sl.bad === 0, {sp, sl});
  await p._ctx.close();
}

/* ---------- 4b) CHQ-P Befund 1 + 2 (Song quer, 8 Spuren): Namen folgen der Leinwand über mehrere Spuren – Finger bleibt liegen,
   Ziehen in der Namen-Spalte, Nachlauf; stillgehaltener Finger rastet nicht ein; App im Hintergrund → rastet ein ---------- */
for (const [w, h] of [[926, 370], [926, 428]]) {
  const p = await openPage(file, w, h, true);
  await p.evaluate(() => __gl1Setup()); await p.evaluate(() => SYNQUENZER.chsOpen(true)); await p.evaluate(() => __chqLanes(8)); await p.evaluate(() => __chqSv()); await W(p, 400);
  const g = await p.evaluate(() => { const r = SV.cv.getBoundingClientRect(), q = SYNQUENZER.chqInfo().sv; return {l: r.left, t: r.top, w: r.width, ru: SV.rulerH, rh: SV.rowH, k0: q.k0, wN: q.w, n: q.n}; });
  const chk = () => p.evaluate(() => __chqLabChk());
  const allOk = arr => arr.length > 0 && arr.every(c => c.strip && c.bad === 0 && c.n >= c.w);
  const x = g.l + g.w * .55, y = g.t + g.ru + (g.k0 + g.wN - .5) * g.rh;
  // a) Leinwand: Finger zieht 66 px nach oben (fast 3 Spuren) und bleibt liegen; Proben bei ~0,2 / 1 / 1,8 / 2,6 Spuren
  const A = [];
  await tDown(p, x, y); await W(p, 40);
  for (let k = 1; k <= 30; k++) { await tMove(p, x, y - k * 2.2); await W(p, 20); if (k === 6 || k === 14 || k === 22 || k === 30) A.push(await chk()); }
  if (w === 926 && h === 370) fs.writeFileSync(path.join(fotos, 'chq-song-926x370-rollen-finger-liegt.png'), await shotB(p));
  await tUp(p); await W(p, 700); const a2 = await chk();
  ok(`Prüfung (Befund 1) Song ${w}×${h}: Finger rollt fast 3 Spuren und bleibt liegen – jeder Name steht neben seiner Zeile der Leinwand (Streifen bleibt, auch nach der 1. und 2. ganzen Spur); losgelassen ebenso`,
    allOk(A) && A[A.length - 1].off > 2 && a2.strip && a2.bad === 0 && Number.isInteger(a2.off), {proben: A.map(c => ({off: c.off, strip: c.strip, bad: c.bad, n: c.n, seen: c.seen})), los: a2});
  // b) Namen-Spalte: von dort senkrecht zurück ziehen (gut 2 Spuren), Finger liegt
  const lb = await p.evaluate(() => { const ds = [...SV.labs.querySelectorAll('.chqli .sv-l.trk')].filter(d => +d.dataset.t <= -101); const d = ds[ds.length - 2], r = d.getBoundingClientRect(); return {x: r.left + r.width / 2, y: r.top + r.height / 2}; });
  const B2 = [];
  await tDown(p, lb.x, lb.y); await W(p, 40);
  for (let k = 1; k <= 26; k++) { await tMove(p, lb.x, lb.y + k * 2.2); await W(p, 20); if (k === 8 || k === 16 || k === 24) B2.push(await chk()); }
  await tUp(p); await W(p, 700); const b2 = await chk(); const pop = await p.evaluate(() => (UI.pop ? UI.pop.name : null));
  ok(`Prüfung (Befund 1) Song ${w}×${h}: Ziehen in der Namen-Spalte über 2 Spuren – Namen folgen (Streifen bleibt), kein Mischpult`,
    allOk(B2) && Math.abs(B2[B2.length - 1].off - a2.off) > 1.5 && b2.bad === 0 && Number.isInteger(b2.off) && !pop, {proben: B2.map(c => ({off: c.off, bad: c.bad, n: c.n, seen: c.seen})), los: b2, pop});
  // c) Nachlauf (chqSvTo) über alle Spuren: in jedem Bild der Animation stehen die Namen richtig
  await p.evaluate(() => SYNQUENZER.chqSvTo(0)); await W(p, 600);
  const C = await p.evaluate(async () => { const out = []; const Q = SYNQUENZER.chqInfo().sv; SYNQUENZER.chqSvTo(Q.n - Q.w); await new Promise(res => { const f = () => { out.push(__chqLabChk()); if (!SYNQUENZER.chqInfo().sv.anim) return res(); requestAnimationFrame(f); }; requestAnimationFrame(f); }); return out; });
  const mid = C.filter(c => c.anim && !Number.isInteger(c.off));
  ok(`Prüfung (Befund 1) Song ${w}×${h}: Nachlauf 0 → ${g.n - g.wN} Spuren – in jedem Bild (${C.length}) stehen die Namen neben ihren Zeilen`,
    allOk(C) && mid.length >= 3 && C[C.length - 1].off === g.n - g.wN, {bilder: C.length, mitten: mid.length, schlecht: C.filter(c => c.bad).slice(0, 3)});
  await p._ctx.close();
}
// d) + e) Befund 2 (926×370): Finger hält 3 s still → kein Einrasten, folgt danach weiter; App im Hintergrund während des Rollens → rastet ein
{
  const p = await openPage(file, 926, 370, true);
  await p.evaluate(() => __gl1Setup()); await p.evaluate(() => SYNQUENZER.chsOpen(true)); await p.evaluate(() => __chqLanes(8)); await p.evaluate(() => __chqSv()); await W(p, 400);
  const g = await p.evaluate(() => { const r = SV.cv.getBoundingClientRect(), q = SYNQUENZER.chqInfo().sv; return {l: r.left, t: r.top, w: r.width, ru: SV.rulerH, rh: SV.rowH, k0: q.k0, wN: q.w}; });
  const q = () => p.evaluate(() => { const s = SYNQUENZER.chqInfo().sv; return {off: +s.off.toFixed(3), drag: s.drag, anim: s.anim, lab: __chqLabChk().bad}; });
  const x = g.l + g.w * .55, y = g.t + g.ru + (g.k0 + g.wN - .5) * g.rh;
  await tDown(p, x, y); await W(p, 40);
  let yy = y; for (let k = 1; k <= 12; k++) { yy = y - k * 3; await tMove(p, x, yy); await W(p, 20); }
  const d1 = await q(); await W(p, 3000); const d2 = await q();
  for (let k = 1; k <= 12; k++) { await tMove(p, x, yy - k * 3); await W(p, 20); }
  const d3 = await q(); await tUp(p); await W(p, 700); const d4 = await q();
  ok('Prüfung (Befund 2) Song 926×370: Finger hält beim Rollen 3 s still → die Gruppe bleibt am Finger (kein Einrasten), folgt danach weiter; losgelassen rastet sie ein',
    d1.drag && d2.drag && d2.off === d1.off && !Number.isInteger(d1.off) && d3.drag && d3.off > d2.off + 1 && d2.lab === 0 && !d4.drag && Number.isInteger(d4.off) && d4.off >= Math.round(d3.off) - 1, {d1, d2, d3, d4});
  // e) Hintergrund (wie abortAll: blur) während der Finger rollt → rastet sofort ein; weitere Bewegung desselben Fingers rollt nicht
  await p.evaluate(() => SYNQUENZER.chqSvTo(0)); await W(p, 600);
  await tDown(p, x, y); await W(p, 40);
  for (let k = 1; k <= 12; k++) { await tMove(p, x, y - k * 3); await W(p, 20); }
  const e1 = await q(); await p.evaluate(() => window.dispatchEvent(new Event('blur'))); await W(p, 600); const e2 = await q();
  for (let k = 1; k <= 8; k++) { await tMove(p, x, y - 36 - k * 4); await W(p, 20); }
  const e3 = await q(); await tUp(p); await W(p, 500); const e4 = await q();
  const st = await p.evaluate(() => ({pop: UI.pop ? UI.pop.name : null, ed: !!(typeof G2 !== 'undefined' && G2.ed)}));
  ok('Prüfung (Befund 2): App geht während des Rollens in den Hintergrund → die Gruppe rastet sofort auf eine ganze Spur ein (Ersatz für den Wachhund); danach rollt derselbe Finger nichts, nichts öffnet sich',
    e1.drag && !e2.drag && !e2.anim && Number.isInteger(e2.off) && e3.off === e2.off && e4.off === e2.off && !st.pop && !st.ed, {e1, e2, e3, e4, st});
  await p._ctx.close();
}

/* ---------- 5) hochkant (kein Fenster): Halten auf einem Chor-Namen zeigt den vollen Namen ---------- */
{
  const p = await openPage(file, 428, 926, true);
  await p.evaluate(() => __gl1Setup()); await p.evaluate(() => SYNQUENZER.chsOpen(true)); await p.evaluate(() => __chqSv()); await W(p, 400);
  const l = await p.evaluate(() => { const d = [...SV.labs.querySelectorAll('.sv-l.trk')].find(e => +e.dataset.t === -103); const r = d.getBoundingClientRect(); const sp = d.querySelector('span'); return {x: r.left + r.width / 2, y: r.top + r.height / 2, short: d.textContent.trim(), cut: sp.scrollWidth > sp.clientWidth + .5}; });
  await tDown(p, l.x, l.y); await W(p, 700);
  const tip = await p.evaluate(() => SYNQUENZER.chqInfo().tip);
  fs.writeFileSync(path.join(fotos, 'chq-song-428x926-name-halten.png'), await shotB(p));
  await tUp(p); await W(p, 400);
  const pop = await p.evaluate(() => UI.pop ? UI.pop.name : null);
  ok('Song hochkant: Halten auf „' + l.short + '“ (gekürzt: ' + l.cut + ') zeigt „' + tip.txt + '“, kein Mischpult', tip.on && tip.txt === 'Chor Akkordton oben' && !pop, {l, tip, pop});
  await p._ctx.close();
}

/* ---------- 6) Laden/Speichern unverändert; alte Projekte: das Rollen ist reine Ansicht ---------- */
{
  const p = await openPage(file, 926, 370);
  await p.evaluate(() => __gl1Setup()); await p.evaluate(() => SYNQUENZER.chsOpen(true)); await p.evaluate(() => __chqLanes(8)); await p.evaluate(() => __chqMx()); await W(p, 300);
  const r = await p.evaluate(async () => {
    const st = stimmeT(), j0 = JSON.stringify({t: S.tracks[st], song: S.song});
    const box = document.querySelector('#clipGrid .chqs'); box.scrollTop = 60; await new Promise(r => setTimeout(r, 200));
    __chqSv(); SYNQUENZER.chqSvTo(3); await new Promise(r => setTimeout(r, 700));
    const j1 = JSON.stringify({t: S.tracks[st], song: S.song});
    return {same: j0 === j1, keys: Object.keys(S.tracks[st]).concat(Object.keys(S.song)).filter(k => /chq/i.test(k))};
  });
  ok('Rollen in Matrix und Song ändert nichts am Projekt (Spur, Chor, Song gleich; keine chq-Felder)', r.same && !r.keys.length, r);
  await p._ctx.close();
}

await b.close();
const errs = allErrs.filter(e => !/favicon|ERR_FILE_NOT_FOUND|net::/.test(e));
ok('Konsole ohne Fehler', errs.length === 0, errs.slice(0, 5));
fs.writeFileSync(path.join(out, 'chq-ergebnis.json'), JSON.stringify({res, G}, null, 1));
const nOk = res.filter(r => r.pass).length;
console.log((nOk === res.length ? 'OK' : 'FEHLER') + ' CHQ: ' + nOk + '/' + res.length + ' bestanden');
