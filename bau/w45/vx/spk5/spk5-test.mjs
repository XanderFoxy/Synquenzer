// SPK5 Auftrag 1/3 – Test (OK/FEHL): Zerlegen nur in der Auswahl / alles (Knopf sagt es vorher), Fortschritt über dem Bereich,
// neue Ebenen hervorgehoben + Tönung an + Meldung mit ↶, ehrliche Meldung bei „nichts gefunden“, Solo = sofort hören,
// Farbstufen (Ansicht ▾ → Farben, nur Farbtabelle, im Gerät gemerkt), hochkant + quer (926×428, 926×370), Touch, keine Fehler.
// Aufruf: node spk5-test.mjs <abs index.html>
import path from 'node:path';
import fs from 'node:fs';
import {start, page, box, btn, info, mixWav, openSpk} from './lib.mjs';
const file = path.resolve(process.argv[2]), fotos = path.join(path.dirname(file), 'fotos'); fs.mkdirSync(fotos, {recursive: true});
const E = await start(file), errs = [], res = {}, T0 = Date.now();
const ok = (k, v, c) => { res[k] = {v, ok: !!c}; console.log((c ? 'OK  ' : 'FEHL') + ' ' + k + ' ' + JSON.stringify(v)); };
const wav = mixWav(E.dir);
const lab = p => p.evaluate(() => { const b = __spk.page.ui().b_zerl; return {aria: b.getAttribute('aria-label'), txt: b.innerText.replace(/\s+/g, ' ').trim()}; });
const msg = p => p.evaluate(() => SYNQUENZER.spk5.msg());
const waitIdle = p => p.waitForFunction(() => { const i = __spk.page.info(); return i && !i.busy; }, null, {timeout: 240000});
const layout = p => p.evaluate(() => {
  const parts = ['.spk1-hd', '.spk1-tl', '.spk1-co', '.spk1-ru', '.spk1-ky', '.spk1-mn', '.spk1-op', '.spk1-st', '.spk1-ac', '.spk1-ly'].map(s => { const r = document.querySelector('#spk1Sheet ' + s).getBoundingClientRect(); return {s, l: r.left, t: r.top, r: r.right, b: r.bottom}; });
  const over = []; for (let i = 0; i < parts.length; i++) for (let j = i + 1; j < parts.length; j++) { const a = parts[i], c = parts[j]; if (Math.min(a.r, c.r) - Math.max(a.l, c.l) > 0.5 && Math.min(a.b, c.b) - Math.max(a.t, c.t) > 0.5) over.push(a.s + '×' + c.s); }
  const W = innerWidth, H = innerHeight, out = parts.filter(a => a.l < -0.5 || a.t < -0.5 || a.r > W + 0.5 || a.b > H + 0.5).map(a => a.s);
  const x = document.querySelector('#spk1Sheet .sh-x').getBoundingClientRect();
  const small = [...document.querySelectorAll('#spk1Sheet button')].filter(e => e.offsetParent && !e.closest('.spk1-tl,.spk1-op')).map(e => [e.textContent.trim().slice(0, 14), e.getBoundingClientRect()]).filter(([, r]) => r.height < 43.5 || r.width < 35.5).map(q => q[0]);
  const m = document.querySelector('#spk1Sheet .spk5-msg'), mr = m && m.classList.contains('on') ? m.getBoundingClientRect() : null, mn = document.querySelector('#spk1Sheet .spk1-mn').getBoundingClientRect();
  const zl = document.querySelector('#spk1Sheet .spk1-ac [data-a=zerl]'), zr = zl.getBoundingClientRect(), zclip = zl.scrollWidth > zl.clientWidth + 1 || zl.scrollHeight > zl.clientHeight + 1;
  return {over, out, x: {w: x.width, h: x.height, vis: x.left >= 0 && x.right <= W && x.top >= 0 && x.bottom <= H}, small, msg: mr ? {inMn: mr.left >= mn.left - 0.5 && mr.right <= mn.right + 0.5 && mr.top >= mn.top - 0.5 && mr.bottom <= mn.bottom + 0.5, h: Math.round(mr.height)} : null, zerl: {w: Math.round(zr.width), h: Math.round(zr.height), abgeschnitten: zclip}};
});
// Masken außerhalb/innerhalb eines Bereichs (Rahmen m, Bins k) für eine Ebene: Summe der Werte über ein Raster
const maskGrid = (p, lid, m0, m1, k0, k1) => p.evaluate(async ([lid, m0, m1, k0, k1]) => { let s = 0, n = 0, mx = 0; for (let m = m0; m <= m1; m += Math.max(1, (m1 - m0) >> 3)) for (let k = k0; k <= k1; k += Math.max(1, (k1 - k0) >> 4)) { const v = await __spk.maskAt(lid, m, k); s += v; n++; if (v > mx) mx = v; } return {mittel: +(s / n).toFixed(1), max: mx}; }, [lid, m0, m1, k0, k1]);

// ===== A) hochkant 428 × 926 =====
{
  const P = await page(E, 428, 926, errs), {p, drag, tap, cdp} = P;
  const st0 = await p.evaluate(() => ({css: !!document.getElementById('spk5Css'), sheet: !!document.getElementById('spk1Sheet'), wk: __wk.length}));
  ok('start-laedt-nichts', st0, !st0.css && !st0.sheet && st0.wk === 0);
  await openSpk(P, wav);
  const f0 = await p.evaluate(() => SYNQUENZER.spk5.farbe());
  const l0 = await lab(p);
  await p.screenshot({path: path.join(fotos, 'spk5-00-glut-hochkant.png')});
  ok('standard-farbe-glut-knopf-alles', {farbe: f0, knopf: l0}, f0 === 'glut' && l0.aria === 'Zerlegen: alles' && /Zerlegen alles/i.test(l0.txt));
  // Auswahl ziehen (Rechteck über Takt ~2–3, Tiefen bis Mitten)
  const mn = await box(p, '#spk1Sheet .spk1-mn');
  await drag([mn.x + mn.w * 0.3, mn.y + mn.h * 0.45], [mn.x + mn.w * 0.6, mn.y + mn.h * 0.97]);
  const l1 = await lab(p), sel = await p.evaluate(() => { const U = __spk.page.ui(); return {n: U.sel.length, s: U.sel[0], area: SYNQUENZER.spk5.area()}; });
  ok('knopf-sagt-auswahl', {knopf: l1, sel: sel.s && {t0: +sel.s.t0.toFixed(2), t1: +sel.s.t1.toFixed(2), f0: Math.round(sel.s.f0), f1: Math.round(sel.s.f1)}}, l1.aria === 'Zerlegen: Auswahl' && /Zerlegen auswahl/i.test(l1.txt));
  // Zerlegen mit Auswahl, langsamer Prozessor → Fortschritt über dem Bereich fotografieren
  await cdp.send('Emulation.setCPUThrottlingRate', {rate: 10});
  await tap(await btn(p, 'Zerlegen'));
  let pr = null;
  for (let i = 0; i < 400; i++) { pr = await p.evaluate(() => { const U = __spk.page.ui(); return U.s5 ? {p: U.s5.p, lab: U.s5.lab, area: !!U.s5.area, knopf: U.b_zerl.textContent} : null; }); if (pr && pr.p > 0.35) break; await p.waitForTimeout(50); }
  await p.screenshot({path: path.join(fotos, 'spk5-01-fortschritt-auswahl-hochkant.png')});
  // Doppeltipp-Schutz: zweiter Tipp sofort auf „■ Abbrechen“ bricht nicht ab
  await cdp.send('Emulation.setCPUThrottlingRate', {rate: 1});
  ok('fortschritt-ueber-bereich', pr, pr && pr.area && pr.p > 0 && /Zerlegen · Auswahl/.test(pr.lab) && /Abbrechen/.test(pr.knopf));
  await waitIdle(p); await p.waitForTimeout(500);
  const r1 = await p.evaluate(() => { const U = __spk.page.ui(), i = __spk.page.info(); return {layers: i.layers, tint: i.tint, tintOn: U.tintOn, stat: i.stat, neu: [...U.ly.querySelectorAll('.spk5-neu')].map(x => x.dataset.l), last: SYNQUENZER.spk5.last(), undo: SPK1.last.undo, sel: U.sel.length}; });
  const m1 = await msg(p);
  await p.screenshot({path: path.join(fotos, 'spk5-02-zerlegt-auswahl-hochkant.png')});
  ok('ebenen-angelegt-sichtbar', {layers: r1.layers, neu: r1.neu, tint: r1.tint, tintOn: r1.tintOn, undo: r1.undo}, r1.layers.length >= 2 && r1.neu.length >= 2 && r1.tint >= 2 && r1.tintOn && r1.undo === 'Zerlegen (Auswahl)');
  ok('meldung-mit-undo', {meldung: m1, stat: r1.stat}, /^Zerlegt: .*Rest \(Auswahl\)/.test(m1 || '') && /↶/.test(r1.stat));
  // Nur in der Auswahl: außerhalb (Takt 1 / Ende, gleiche Bins) 0, innerhalb > 0
  const geo = await p.evaluate(() => { const U = __spk.page.ui(), s = U.sel[0], sr = U.meta.sr, hop = U.meta.base.hop, N = U.meta.base.N; return {ma: Math.floor(s.t0 * sr / hop) + 3, mb: Math.floor(s.t1 * sr / hop) - 3, ka: Math.ceil(s.f0 * N / sr) + 1, kb: Math.floor(s.f1 * N / sr) - 1, F: Math.floor(U.dur * sr / hop), lids: U.meta.layers.map(l => l.id)}; });
  const inn = [], aus = [];
  for (const lid of geo.lids) { inn.push(await maskGrid(p, lid, geo.ma, geo.mb, geo.ka, geo.kb)); aus.push(await maskGrid(p, lid, 2, Math.max(3, geo.ma - 20), 2, 900)); aus.push(await maskGrid(p, lid, Math.min(geo.F - 4, geo.mb + 20), geo.F - 2, 2, 900)); aus.push(await maskGrid(p, lid, geo.ma, geo.mb, geo.kb + 40, 1800)); }
  const sum = await p.evaluate(() => __spk.sum());
  ok('nur-in-der-auswahl', {innen: inn, aussen_max: Math.max(...aus.map(a => a.max)), summe_ueber: sum.over}, inn.some(a => a.max > 0) && aus.every(a => a.max === 0) && sum.over === 0);
  // Solo-Taste einer neuen Ebene → sofort hören (Auswahl-Bereich)
  const sb = await p.evaluate(() => { const r = document.querySelector('#spk1Sheet .spk1-lr.spk5-neu .spk1-s'); if (!r) return null; r.scrollIntoView({block: 'nearest'}); const q = r.getBoundingClientRect(); return [q.left + q.width / 2, q.top + q.height / 2]; });
  if (sb) await tap(sb); await p.waitForTimeout(500);
  const so = await p.evaluate(() => ({playing: !!SPK1.pl, playSel: __spk.page.ui().playSel, solo: __spk.page.ui().meta.layers.filter(l => l.solo).map(l => l.name)}));
  ok('solo-sofort-hoeren', so, so.playing && so.solo.length === 1);
  await p.evaluate(() => { __spk.stop(); }); if (sb) await tap(sb);
  // ↶ in der Meldung → alles zurück (ein Schritt)
  await p.evaluate(() => SYNQUENZER.spk5.run('zerlegen')); await waitIdle(p); await p.waitForTimeout(300);
  const ub = await p.evaluate(() => { const b = document.querySelector('#spk1Sheet .spk5-msg.on .spk5-mu'); if (!b) return null; const q = b.getBoundingClientRect(); return [q.left + q.width / 2, q.top + q.height / 2, q.width, q.height]; });
  const vorU = (await info(p)).layers.length;
  if (ub) await tap(ub.slice(0, 2)); await p.waitForTimeout(600);
  const nachU = await p.evaluate(() => ({layers: __spk.page.info().layers, redo: SPK1.last.redo}));
  ok('undo-aus-meldung', {taste: ub && ub.slice(2), vor: vorU, nach: nachU}, ub && ub[2] >= 44 && ub[3] >= 44 && /Zerlegen \(Auswahl\)/.test(nachU.redo || ''));
  // Ehrlich: alles zurück (keine Ebene), dann nur Höhen (9–15 kHz) → kein Bass, keine leere Bass-Ebene
  await p.evaluate(async () => { for (let i = 0; i < 6 && SPK1.last.meta.layers.length; i++) await __spk.undo(); spk1Got(__spk.page.ui(), SPK1.last); });
  await p.evaluate(() => { const U = __spk.page.ui(); U.sel = [{art: 'rect', t0: 4.4, t1: 6.6, f0: 9000, f1: 15000, kt: 0, kf: 0}]; U.selVer++; spk1BtnState(U); });
  await p.evaluate(() => SYNQUENZER.spk5.run('zerlegen')); await waitIdle(p); await p.waitForTimeout(300);
  const m2 = await msg(p), l2 = await p.evaluate(() => __spk.page.info().layers);
  await p.screenshot({path: path.join(fotos, 'spk5-03-ehrlich-kein-bass.png')});
  ok('ehrlich-nichts-gefunden', {meldung: m2, ebenen: l2}, /kein Bass/.test(m2 || '') && !l2.includes('Bass'));
  await p.evaluate(async () => { await __spk.undo(); const r = await __spk.layers(); __spk.page.ui().meta = SPK1.last.meta; });
  // Teil-Tönung für die Farb-Fotos: erste Auswahl wieder zerlegen
  await p.evaluate(async sel0 => { for (let i = 0; i < 6 && SPK1.last.meta.layers.length; i++) await __spk.undo(); const U = __spk.page.ui(); spk1Got(U, SPK1.last); U.sel = [sel0]; U.selVer++; spk1BtnState(U); }, sel.s);
  await p.evaluate(() => SYNQUENZER.spk5.run('zerlegen')); await waitIdle(p); await p.waitForTimeout(400); await p.evaluate(() => spk5Msg(__spk.page.ui(), null));
  await p.screenshot({path: path.join(fotos, 'spk5-10-farbe-glut.png')});
  // Farbstufen: Ansicht ▾ → Farben, jede Stufe ein Foto (mit Ebenen-Tönung); nur Farbtabelle (kein neues Spektrum)
  const seq0 = await p.evaluate(() => __spk.page.ui().specSeq);
  const farben = {};
  for (const k of ['magma', 'gruenblau', 'grau', 'blau', 'glut']) {
    await tap(await btn(p, 'Ansicht')); await p.waitForTimeout(250);
    const fb = await p.evaluate(k => { const b = document.querySelector('#spk1Sheet .spk1-dd [data-f="' + k + '"]'); if (!b) return null; b.scrollIntoView({block: 'nearest'}); const q = b.getBoundingClientRect(); return [q.left + q.width / 2, q.top + q.height / 2, q.height]; }, k);
    if (fb) await tap(fb.slice(0, 2)); await p.waitForTimeout(250);
    await p.evaluate(() => { const U = __spk.page.ui(); if (U.dd) spk1Dd(U, null); }); await p.waitForTimeout(120);
    if (k !== 'glut') await p.screenshot({path: path.join(fotos, 'spk5-1' + (Object.keys(farben).length + 1) + '-farbe-' + k + '.png')});
    const L = await p.evaluate(() => { const t = SYNQUENZER.spk5.lut(); return [[t[0], t[1], t[2]], [t[512], t[513], t[514]], [t[1020], t[1021], t[1022]]]; });
    farben[k] = {taste: fb && fb[2], lut: L, gemerkt: await p.evaluate(() => { try { return localStorage.getItem('synq-spk5-farbe'); } catch (e) { return 'x'; } })};
  }
  const seq1 = await p.evaluate(() => __spk.page.ui().specSeq);
  ok('farbstufen', {farben, neuRechnen: seq1 !== seq0}, Object.values(farben).every(f => f.taste >= 44) && farben.glut.lut[2][0] > 240 && farben.glut.lut[1][0] > farben.glut.lut[1][2] && farben.grau.lut[1][0] === farben.grau.lut[1][1] && farben.glut.gemerkt === 'glut' && seq1 === seq0);
  // Ganzes Stück: Auswahl verwerfen → „alles“
  await tap(await btn(p, 'Verwerfen'));
  const l3 = await lab(p);
  await tap(await btn(p, 'Zerlegen')); await p.waitForTimeout(100); await waitIdle(p); await p.waitForTimeout(400);
  const m3 = await msg(p), r3 = await p.evaluate(() => ({layers: __spk.page.info().layers, undo: SPK1.last.undo, last: SYNQUENZER.spk5.last()}));
  await p.screenshot({path: path.join(fotos, 'spk5-04-zerlegt-alles-hochkant.png')});
  ok('zerlegen-alles', {knopf: l3, meldung: m3, ebenen: r3.layers, undo: r3.undo}, l3.aria === 'Zerlegen: alles' && /^Zerlegt: Drums · Bass/.test(m3 || '') && !/Auswahl/.test(m3 || '') && r3.layers.length >= 2 && r3.undo === 'Zerlegen');
  const lay1 = await layout(p);
  ok('layout-hochkant', lay1, !lay1.over.length && !lay1.out.length && lay1.x.vis && lay1.x.w >= 44 && !lay1.small.length && lay1.msg && lay1.msg.inMn && !lay1.zerl.abgeschnitten);
  // gemerkt nach Neuladen
  await p.evaluate(() => SYNQUENZER.spk5.farbe('magma'));
  await p.reload(); await p.waitForFunction(() => window.SYNQUENZER && window.SYNQUENZER.spk5, null, {timeout: 60000});
  const fm = await p.evaluate(() => SYNQUENZER.spk5.farbe());
  ok('farbe-gemerkt', fm, fm === 'magma');
  await p.evaluate(() => SYNQUENZER.spk5.farbe('glut'));
  await P.ctx.close();
}
// ===== B) quer 926 × 428 und 926 × 370 =====
for (const [w, h] of [[926, 428], [926, 370]]) {
  const P = await page(E, w, h, errs), {p, drag, tap} = P;
  await openSpk(P, wav);
  const mn = await box(p, '#spk1Sheet .spk1-mn');
  await drag([mn.x + mn.w * 0.35, mn.y + mn.h * 0.4], [mn.x + mn.w * 0.65, mn.y + mn.h * 0.95]);
  const l = await lab(p);
  await tap(await btn(p, 'Zerlegen')); await p.waitForTimeout(400);
  const hd = await p.evaluate(() => { const d = document.querySelector('#spk1Sheet .spk1-dd h5'); return d ? d.textContent : null; });
  await p.screenshot({path: path.join(fotos, 'spk5-05-quer-' + h + '-klappfenster.png')});
  const zb = await btn(p, 'Zerlegen (schnell'); if (zb) await tap(zb);
  await p.waitForTimeout(100); await waitIdle(p); await p.waitForTimeout(500);
  const m = await msg(p), L = await p.evaluate(() => ({layers: __spk.page.info().layers, neu: [...document.querySelectorAll('#spk1Sheet .spk5-neu')].length}));
  await p.screenshot({path: path.join(fotos, 'spk5-06-quer-' + h + '-zerlegt.png')});
  const lay = await layout(p);
  ok('quer-' + w + 'x' + h, {knopf: l, klappfenster: hd, meldung: m, ebenen: L, layout: lay}, l.aria === 'Zerlegen: Auswahl' && hd === 'Nur die Auswahl trennen' && /\(Auswahl\)/.test(m || '') && L.layers.length >= 2 && L.neu >= 2 && !lay.over.length && !lay.out.length && lay.x.vis && !lay.small.length && lay.msg && lay.msg.inMn && !lay.zerl.abgeschnitten);
  await P.ctx.close();
}
ok('keine-fehler', errs, !errs.length);
const n = Object.values(res).filter(x => !x.ok).length;
console.log((n ? n + ' FEHLER' : 'ALLES OK') + ' · ' + Object.keys(res).length + ' Prüfungen · ' + Math.round((Date.now() - T0) / 1000) + ' s');
fs.writeFileSync(path.join(path.dirname(file), 'spk5-test.json'), JSON.stringify(res, null, 1));
await E.b.close(); E.srv.close();
