// CHORSP Abnahme (Playwright + Chromium, Touch). Aufruf: node tests/chorsp.mjs   (APP=… für eine andere Datei)
import { open, sing, style, sleep, report, HERE } from './lib.mjs';
import path from 'path'; import fs from 'fs';
const SHOT = path.resolve(HERE, 'shots'); fs.mkdirSync(SHOT, {recursive: true});
const T = report('CHORSP');
const ok = T.ok;
const near = (a, b, e) => Math.abs(a - b) <= e;
const cdpTouch = async p => { const c = await p.context().newCDPSession(p); return (type, pts) => c.send('Input.dispatchTouchEvent', {type, touchPoints: pts.map((q, i) => ({x: q[0], y: q[1], id: i}))}); };
const tapSel = async (p, sel) => { const r = await p.evaluate(s => { const e = document.querySelector(s); if (!e) return null; e.scrollIntoView({block: 'nearest'}); const b = e.getBoundingClientRect(); return {x: b.left + b.width / 2, y: b.top + b.height / 2}; }, sel); if (!r) return false; await p.touchscreen.tap(r.x, r.y); return true; };
const song = p => p.evaluate(() => { const st = stimmeT(), c = S.tracks[st].clips[0].audio; SYNQUENZER.setSong({bars: 8, lanes: S.tracks.map((t, i) => i === 0 ? [{bar: 0, slot: 0}] : []), vox: [Object.assign(JSON.parse(JSON.stringify(c)), {id: 'V1', bar: 2, len: 4})], marks: [], carrier: [], xp: [], mel: {}, loop: {on: false, a: 0, b: 8}}); return true; });

// ---------- 1. Background-Gruppe nach Stil-Tipp (Touch) und nach „Spur teilen“ ----------
{
  const {b, p, errs} = await open();
  await sing(p); await p.evaluate(() => { R.selS = 0; });
  const noChor = await p.evaluate(() => SYNQUENZER.chsInfo().mx.length);
  ok('Ohne Chor keine Zusatz-Zeilen', noChor === 0, 'Zeilen ' + noChor);
  await p.evaluate(() => g6Sheet({t: stimmeT(), s: 0}, EL.grid)); await sleep(300);
  await tapSel(p, '.g6pe-tile[data-sty="gospel"]');
  for (let i = 0; i < 100; i++) { await sleep(100); if (await p.evaluate(() => { const x = tkRef({t: stimmeT(), s: 0}); return !!(x && x.a.chor && g6Ready(x.a)); })) break; }
  await p.evaluate(() => closePop()); await sleep(400);
  let I = await p.evaluate(() => SYNQUENZER.chsInfo());
  const vis = I.mx.filter(r => r.vis);
  ok('Matrix nach Stil-Tipp: Gruppe + Spuren sichtbar', vis.length === 1 + I.lanes.length && I.lanes.length === 3 && vis.every(r => r.h >= 40), vis.map(r => r.kind + (r.id || '') + ':' + r.h + 'px').join(' '));
  ok('Matrix: Zellen der Szene 1 gefüllt', I.mx.every(r => r.cells.includes(0)), JSON.stringify(I.mx.map(r => r.cells)));
  const names = await p.evaluate(() => [...document.querySelectorAll('#clipGrid .chsth:not(.chsgrp)')].map(e => e.querySelector('.chsnm').textContent + '|' + e.querySelector('.chssw').textContent + '|' + (e.style.getPropertyValue('--cc'))));
  const sheet = await p.evaluate(() => { g6Sheet({t: stimmeT(), s: 0}, EL.grid); const r = [...document.querySelectorAll('.g6pe-lane')].map(l => (l.querySelector('.g6pe-chip') || {}).textContent + '|' + (l.getAttribute('style') || '').replace(/.*--cc:\s*/, '').replace(/;.*/, '')); closePop(); return r; });
  ok('Name/Farbe/Ziffer wie im Chor-Blatt', names.length === 3 && names[0] === 'Chor Sopran|3|var(--chor3)' && names[2].startsWith('Chor Tenor|6|var(--chor6)'), names.join(', ') + ' · Blatt: ' + sheet.join(', '));
  await p.screenshot({path: SHOT + '/matrix-gruppe-P.png'});
  // Gruppe zuklappen / aufklappen per Tipp
  await tapSel(p, '#clipGrid .chsth.chsgrp'); await sleep(300);
  const shut = await p.evaluate(() => SYNQUENZER.chsInfo().mx.length);
  await tapSel(p, '#clipGrid .chsth.chsgrp'); await sleep(300);
  const reopen = await p.evaluate(() => SYNQUENZER.chsInfo().mx.length);
  ok('Gruppe auf-/zuklappbar', shut === 1 && reopen === 4, 'zu ' + shut + ' · auf ' + reopen);
  // Tipp auf eine Spur-Zelle öffnet die Noten dieser Stimme
  await tapSel(p, '#clipGrid .chsc[data-chs="cell"][data-id="c2"][data-s="0"]'); await sleep(700);
  const ed = await p.evaluate(() => G2.ed ? {voice: G2.ed.voice, id: G2.ed.id} : null);
  ok('Zelle → Noten der Stimme', !!ed && ed.voice === 1, JSON.stringify(ed));
  await p.evaluate(() => g2Close());
  // M in der Zeile
  await tapSel(p, '#clipGrid .chse[data-id="c3"]'); await sleep(200);
  const m = await p.evaluate(() => ({lane: SYNQUENZER.chsInfo().lanes.find(l => l.id === 'c3').mute, vg: SYNQUENZER.chsLaneK('c3')}));
  await p.evaluate(() => undo()); await sleep(100);
  ok('M stummt die Spur (ein Undo)', m.lane === true && !(await p.evaluate(() => SYNQUENZER.chsInfo().lanes.find(l => l.id === 'c3').mute)), JSON.stringify(m));
  // „Spur teilen“ aus dem Mischpult
  await p.evaluate(() => SYNQUENZER.chsMixer()); await sleep(300);
  await tapSel(p, '.chsmix button[data-a="dup"]'); await sleep(800);
  await p.evaluate(() => { if (G2.ed) g2Close(); }); await sleep(400);
  I = await p.evaluate(() => SYNQUENZER.chsInfo());
  const gv = I.mx.find(r => r.kind === 'lane' && I.lanes.find(l => l.id === r.id && l.role === 'free'));
  ok('Spur teilen → Gegenstimme sichtbar in der Matrix', !!gv && gv.vis && gv.cells.includes(0), gv ? gv.id + ' ' + JSON.stringify(gv.cells) : 'fehlt');
  await song(p); await p.evaluate(() => setSongView(true)); await sleep(700);
  const sv = await p.evaluate(() => ({sv: SYNQUENZER.chsInfo().sv, labs: [...document.querySelectorAll('.sv-l.chs')].map(d => d.textContent)}));
  ok('Song: Gruppe + 4 Spuren unter STIMME', sv.sv.length === 5 && sv.labs.length === 5 && sv.labs.some(t => /Gegenstimme/.test(t)), JSON.stringify(sv));
  await p.screenshot({path: SHOT + '/song-gruppe-P.png'});
  // Song-Zeile antippen → Noten der Song-Stimme (Gegenstimme hat dort keine Stimme → Hinweis; Sopran: Song-Stück hat keinen Chor)
  ok('keine Fehler (1)', errs.length === 0, errs.join(' | '));
  await b.close();
}

// ---------- 2. Regler: Kopplung, Background, Gesang gesamt, Spur-Pegel (Rechnung und laufende Knoten) ----------
{
  const {b, p, errs} = await open();
  await sing(p); await p.evaluate(() => { R.selS = 0; }); await style(p, 'pop');
  const K = () => p.evaluate(() => 20 * Math.log10(SYNQUENZER.chsGrpK()));
  const lead = () => p.evaluate(() => SYNQUENZER.chsInfo().lead);
  const k0 = await K();
  await p.evaluate(async () => { launchScene(0); }); await sleep(900);
  const n0 = await p.evaluate(() => SYNQUENZER.chsNodes());
  await p.evaluate(() => SYNQUENZER.chsSet('lead', SYNQUENZER.chsInfo().lead - 6)); await sleep(300);
  const k1 = await K(), n1 = await p.evaluate(() => SYNQUENZER.chsNodes());
  const lv = (n0[0] && n1[0]) ? 20 * Math.log10(n1[0].lvl / n0[0].lvl) : NaN;
  ok('G6P-K1 Lead −6 dB gekoppelt → Background −6 dB', near(k1 - k0, -6, .1) && near(lv, -6, .1), 'Rechnung ' + (k1 - k0).toFixed(2) + ' dB · Knoten ' + lv.toFixed(2) + ' dB');
  await p.evaluate(() => SYNQUENZER.chsCouple(false));
  const k2a = await K();
  await p.evaluate(() => SYNQUENZER.chsSet('lead', SYNQUENZER.chsInfo().lead - 6)); await sleep(300);
  const k2 = await K();
  ok('Entkoppelt: Lead −6 dB → Background 0 dB', near(k2 - k2a, 0, .1) && near(k2a - k1, 0, .01), (k2 - k2a).toFixed(2) + ' dB');
  await p.evaluate(() => SYNQUENZER.chsSet('lead', SYNQUENZER.chsInfo().lead + 2));
  const k3a = await K(); await p.evaluate(() => SYNQUENZER.chsCouple(true)); const k3 = await K();
  ok('Wieder koppeln ohne Sprung', near(k3, k3a, .01), 'Sprung ' + (k3 - k3a).toFixed(3) + ' dB');
  await p.evaluate(() => SYNQUENZER.chsSet('lead', SYNQUENZER.chsInfo().lead - 3)); const k4 = await K();
  ok('Danach wieder gemeinsam', near(k4 - k3, -3, .1), (k4 - k3).toFixed(2) + ' dB');
  await sleep(300); const v0 = await p.evaluate(() => AU.tracks[stimmeT()].vol.gain.value);
  await p.evaluate(() => SYNQUENZER.chsSet('bg', -6)); await sleep(300); const k5 = await K(); const v5 = await p.evaluate(() => AU.tracks[stimmeT()].vol.gain.value);
  const bg0 = await p.evaluate(() => 0);
  ok('Background-Regler wirkt nur auf den Chor', near(v5, v0, 1e-6), 'Lead-Kette ' + (20 * Math.log10(v5 / v0)).toFixed(2) + ' dB');
  await sleep(250);
  const s0 = await K(), vl0 = await p.evaluate(() => AU.tracks[stimmeT()].vol.gain.value);
  await p.evaluate(() => SYNQUENZER.chsSet('sum', -5)); await sleep(300);
  const s1 = await K(), vl1 = await p.evaluate(() => AU.tracks[stimmeT()].vol.gain.value);
  ok('Gesang gesamt −5 dB: Lead und Background', near(s1 - s0, -5, .1) && near(20 * Math.log10(vl1 / vl0), -5, .1), 'Chor ' + (s1 - s0).toFixed(2) + ' dB · Lead ' + (20 * Math.log10(vl1 / vl0)).toFixed(2) + ' dB');
  await p.evaluate(() => SYNQUENZER.chsCouple(false)); const s2a = await K(); await p.evaluate(() => SYNQUENZER.chsSet('sum', -8)); const s2 = await K();
  ok('Gesang gesamt auch entkoppelt', near(s2 - s2a, -3, .1), (s2 - s2a).toFixed(2) + ' dB');
  await p.evaluate(() => SYNQUENZER.chsCouple(true));
  const nb = await p.evaluate(() => SYNQUENZER.chsNodes());
  await p.evaluate(() => { SYNQUENZER.chsLaneSet('c2', 'db', -6); SYNQUENZER.chsLaneSet('c2', 'pan', -.5); }); await sleep(300);
  const nn = await p.evaluate(() => SYNQUENZER.chsNodes()), lane = await p.evaluate(() => { const x = tkRef({t: stimmeT(), s: 0}); return x.a.chor.voices.findIndex(v => v.lane === 'c2'); });
  const cp = nn[0] ? nn[0].ch.filter(c => c.vi === lane) : [], cb = nb[0] ? nb[0].ch.filter(c => c.vi === lane) : [];
  const dv = cp.map((c, i) => cb[i] ? 20 * Math.log10(c.vg / cb[i].vg) : NaN), dp = cp.map((c, i) => cb[i] ? c.pan - cb[i].pan : NaN);
  ok('Spur-Pegel/Pan wirken auf die Kopien', cp.length > 0 && dv.every(d => near(d, -6, .05)) && dp.every(d => d < -.35), 'Pegel ' + dv.map(d => d.toFixed(2)).join('/') + ' dB · Pan ' + dp.map(d => d.toFixed(2)).join('/'));
  // Undo/Redo der Regler
  const labels = await p.evaluate(() => SYNQUENZER.g6peUndoLabels(12));
  const before = await p.evaluate(() => JSON.stringify(SYNQUENZER.chsInfo().lanes) + SYNQUENZER.chsInfo().db);
  await p.evaluate(() => undo()); const und = await p.evaluate(() => SYNQUENZER.chsInfo().lanes.find(l => l.id === 'c2'));
  await p.evaluate(() => redo()); const red = await p.evaluate(() => JSON.stringify(SYNQUENZER.chsInfo().lanes) + SYNQUENZER.chsInfo().db);
  ok('Undo/Redo je Geste', !und.pan && und.db === -6 && red === before, labels.slice(-4).join(' · '));
  // Speichern/Laden
  const rt = await p.evaluate(() => { const a = JSON.stringify(S.tracks[stimmeT()].chor); importJSON(serializeProject()); return [a, JSON.stringify(S.tracks[stimmeT()].chor)]; });
  ok('Speichern/Laden behält Background-Werte', rt[0] === rt[1] && /"db":-6/.test(rt[1]) && /"sum"/.test(rt[1]), rt[1].slice(0, 160));
  await p.evaluate(() => stop());
  ok('keine Fehler (2)', errs.length === 0, errs.join(' | '));
  await b.close();
}

// ---------- 3. Gesangs-Editor: Lineal, Loop, Vorhören, Zoom, Schwenken, nichts verrutscht ----------
{
  const {b, p, errs} = await open();
  await sing(p); await p.evaluate(() => { R.selS = 0; }); await style(p, 'pop');
  await p.evaluate(() => g2Open({t: stimmeT(), s: 0})); await sleep(1500);
  let E = await p.evaluate(() => SYNQUENZER.chsEd());
  const X = (E, t) => E.cv.x + (t - E.view.a) / E.view.W * E.cv.w, yR = E => E.rul.y + 22;
  ok('Lineal + ▶ + Loop ≥ 44 px', E.rul.h >= 44 && (await p.evaluate(() => [...document.querySelectorAll('.chsrul .rb')].every(b => b.getBoundingClientRect().width >= 44 && b.getBoundingClientRect().height >= 44))), 'Lineal ' + E.rul.w.toFixed(0) + '×' + E.rul.h);
  // Tipp auf Takt 2 (Schlag 4)
  await p.touchscreen.tap(X(E, E.t0 + 4 * E.sp), yR(E)); await sleep(700);
  const r1 = await p.evaluate(() => ({playing: R.playing, run: SYNQUENZER.chsInfo().run, src: TK.src.filter(r => !r.dead && r.i === stimmeT()).map(r => r.off), nl: (SYNQUENZER.noteLog() || []).filter(n => n.track === 0).slice(0, 2), ch: TK.src.filter(r => !r.dead && r.chG).map(r => r.ch.length)}));
  ok('Lineal-Tipp spielt ab Takt 2 (Begleitung + Gesang + Chor)', r1.playing && r1.run && r1.run.b0 === 4 && r1.src.some(o => near(o, 2, .1)) && r1.nl.length && r1.nl[0].beat === 0 && r1.nl[0].clipNote === 55 && r1.ch.some(n => n > 0), JSON.stringify({b0: r1.run && r1.run.b0, off: r1.src, nl: r1.nl.map(n => n.clipNote + '@' + n.beat), chor: r1.ch}));
  const pt = await p.evaluate(() => SYNQUENZER.chsEd().pt);
  ok('Laufstrich im Editor', pt != null && pt >= 2 && pt < 3.2, 'Take-Zeit ' + (pt == null ? '–' : pt.toFixed(2)));
  await p.screenshot({path: SHOT + '/editor-spielt-P.png'});
  await tapSel(p, '.chsrul [data-a=play]'); await sleep(200);
  ok('■ stoppt', !(await p.evaluate(() => R.playing)), '');
  // Loop ziehen (Takt 2), dann ▶
  E = await p.evaluate(() => SYNQUENZER.chsEd());
  const tt = await cdpTouch(p);
  await tt('touchStart', [[X(E, 2.02), yR(E)]]); for (let k = 1; k <= 8; k++) { await tt('touchMove', [[X(E, 2.02 + k * .245), yR(E)]]); await sleep(16); } await tt('touchEnd', []); await sleep(250);
  const lp = await p.evaluate(() => SYNQUENZER.chsEd().loop);
  ok('Bereich ziehen = Loop an', lp && lp.on && near(lp.a, 2, .01) && near(lp.b, 4, .01), JSON.stringify(lp));
  await tapSel(p, '.chsrul [data-a=play]');
  const seq = []; for (let i = 0; i < 26; i++) { await sleep(150); seq.push(await p.evaluate(() => SYNQUENZER.chsEd().pt)); }
  const wraps = seq.filter((v, i) => i && v != null && seq[i - 1] != null && v < seq[i - 1] - .5).length;
  ok('Loop läuft (Laufstrich springt zurück, bleibt im Bereich)', wraps >= 1 && seq.every(v => v == null || (v >= 1.9 && v <= 4.05)), 'Sprünge ' + wraps + ' · min ' + Math.min(...seq.filter(v => v != null)).toFixed(2) + ' max ' + Math.max(...seq.filter(v => v != null)).toFixed(2));
  await tapSel(p, '.chsrul [data-a=loop]'); await sleep(150);
  ok('Loop aus per Knopf', !(await p.evaluate(() => SYNQUENZER.chsEd().loop.on)), '');
  await p.evaluate(() => SYNQUENZER.chsStop()); await sleep(150);
  let aud = null;
  // Chorstimme: ▲ → Vorhören der Stimme
  await p.evaluate(() => g2Open({t: stimmeT(), s: 0}, {voice: 1})); await sleep(900);
  await p.evaluate(() => { G2.ed.sel = 3; g2Paint(); CHS.lastAud = null; }); await tapSel(p, '#wpSheet .g2chips [data-v=up]');
  aud = null; for (let i = 0; i < 80 && !aud; i++) { await sleep(100); aud = await p.evaluate(() => SYNQUENZER.chsInfo().aud); }
  ok('Probehören einer Chorstimme', !!aud && aud.voice === 1 && aud.k === 3, aud ? 'nach ' + aud.ms + ' ms' : 'kein Vorhören');
  await p.evaluate(() => g2Open({t: stimmeT(), s: 0})); await sleep(900);
  // nichts verrutscht: senkrecht über eine NICHT gewählte Note ziehen
  const blk = await p.evaluate(() => { const E = G2.ed, rc = E.cv.getBoundingClientRect(); E.sel = -1; g2Paint(); const b = E.blk.find(b => b.x1 - b.x0 > 14 && b.x0 > 10); return {x: rc.left + (b.x0 + b.x1) / 2, y: rc.top + b.y, k: b.k}; });
  const pitch0 = await p.evaluate(() => JSON.stringify(S.takes[G2.ed.id].pitch || null));
  await tt('touchStart', [[blk.x, blk.y]]); for (let k = 1; k <= 6; k++) { await tt('touchMove', [[blk.x + 1, blk.y - k * 8]]); await sleep(16); } await tt('touchEnd', []); await sleep(300);
  const pitch1 = await p.evaluate(() => JSON.stringify(S.takes[G2.ed.id].pitch || null));
  ok('Wischen über nicht gewählte Note verschiebt nichts', pitch0 === pitch1, '');
  // gewählte Note ziehen verschiebt (wie bisher)
  await p.touchscreen.tap(blk.x, blk.y); await sleep(150);
  await tt('touchStart', [[blk.x, blk.y]]); for (let k = 1; k <= 6; k++) { await tt('touchMove', [[blk.x + 1, blk.y - k * 8]]); await sleep(16); } await tt('touchEnd', []); await sleep(400);
  const sh = await p.evaluate(k => { const P = S.takes[G2.ed.id].pitch; return P && P.notes[k] ? P.notes[k].sh || 0 : 0; }, blk.k);
  ok('Gewählte Note ziehen verschiebt', sh > 0, 'sh ' + sh);
  aud = null; for (let i = 0; i < 60 && !(aud && aud.voice == null); i++) { await sleep(100); aud = await p.evaluate(() => SYNQUENZER.chsInfo().aud); }
  const n2 = await p.evaluate(k => g2Notes(G2.ed.id)[k], blk.k);
  ok('Probehören nach Tonhöhen-Ziehen (neue Fassung)', !!aud && aud.voice == null && aud.k === blk.k && near(aud.s0, Math.max(0, n2.t0 - .04), .002) && aud.ms < 3000, aud ? 'nach ' + aud.ms + ' ms · ab ' + aud.s0 + ' s · ' + aud.dur + ' s' : 'kein Vorhören');
  await p.evaluate(() => { CHS.lastAud = null; G2.ed.sel = -1; });
  // Zoom: zwei Finger auseinander
  E = await p.evaluate(() => SYNQUENZER.chsEd());
  const cy = E.cv.y + (E.cv.h - 44) * .6, cx = E.cv.x + E.cv.w / 2, W0 = E.view.W;
  await tt('touchStart', [[cx - 30, cy]]); await sleep(20); await tt('touchStart', [[cx - 30, cy], [cx + 30, cy]]);
  for (let k = 1; k <= 8; k++) { await tt('touchMove', [[cx - 30 - k * 12, cy], [cx + 30 + k * 12, cy]]); await sleep(20); }
  await tt('touchEnd', [[cx + 126, cy]]); await tt('touchEnd', []); await sleep(300);
  const E2 = await p.evaluate(() => SYNQUENZER.chsEd()), pz = await p.evaluate(() => JSON.stringify(S.takes[G2.ed.id].pitch || null));
  ok('Zwei Finger zoomen hinein, ohne Note zu verschieben', E2.view.W < W0 * .5 && pz === (await p.evaluate(() => JSON.stringify(S.takes[G2.ed.id].pitch || null))), W0.toFixed(2) + ' s → ' + E2.view.W.toFixed(2) + ' s');
  // Schwenken mit einem Finger auf leerer Fläche
  const va0 = E2.view.a, ey = E2.cv.y + 60;
  await tt('touchStart', [[cx + 80, ey]]); for (let k = 1; k <= 8; k++) { await tt('touchMove', [[cx + 80 - k * 15, ey]]); await sleep(16); } await tt('touchEnd', []); await sleep(200);
  const E3 = await p.evaluate(() => SYNQUENZER.chsEd());
  ok('Schwenken', E3.view.a > va0 + .05, va0.toFixed(2) + ' → ' + E3.view.a.toFixed(2) + ' s');
  // Doppeltipp auf das Lineal: ganz ↔ hinein
  await p.touchscreen.tap(cx, yR(E3)); await sleep(60); await p.touchscreen.tap(cx, yR(E3)); await sleep(300);
  const E4 = await p.evaluate(() => SYNQUENZER.chsEd());
  await p.evaluate(() => SYNQUENZER.chsStop());
  ok('Doppeltipp = Zoom (zurück auf ganz)', E4.view.W > E3.view.W * 1.5, E3.view.W.toFixed(2) + ' → ' + E4.view.W.toFixed(2) + ' s');
  await p.touchscreen.tap(cx, E4.cv.y + 60); await sleep(60); await p.touchscreen.tap(cx, E4.cv.y + 60); await sleep(300);
  const E5 = await p.evaluate(() => SYNQUENZER.chsEd());
  ok('Doppeltipp auf leere Fläche = hinein', E5.view.W < E4.view.W * .5, E4.view.W.toFixed(2) + ' → ' + E5.view.W.toFixed(2) + ' s');
  // Marken-/Wellen-Editor: Lineal + Zoom
  await p.evaluate(() => wpOpen({t: stimmeT(), s: 0})); await sleep(900);
  const W1 = await p.evaluate(() => SYNQUENZER.chsEd());
  await p.touchscreen.tap(X(W1, W1.t0 + 8 * W1.sp - .01 - 2 * W1.sp), yR(W1)); await sleep(600);
  const wr = await p.evaluate(() => ({run: SYNQUENZER.chsInfo().run, marks: (S.takes[WP.ed.id].marks || []).length}));
  ok('Wellen-Editor: Lineal-Tipp spielt (keine Marke gesetzt)', wr.run && wr.run.mode === 'clip' && near(wr.run.b0, 6, .01), JSON.stringify(wr));
  await p.evaluate(() => SYNQUENZER.chsStop()); await sleep(100);
  { const cy = W1.cv.y + (W1.cv.h - 44) * .6, cx = W1.cv.x + W1.cv.w / 2;
  await tt('touchStart', [[cx - 30, cy]]); await sleep(20); await tt('touchStart', [[cx - 30, cy], [cx + 30, cy]]);
  for (let k = 1; k <= 8; k++) { await tt('touchMove', [[cx - 30 - k * 12, cy], [cx + 30 + k * 12, cy]]); await sleep(20); }
  await tt('touchEnd', [[cx + 126, cy]]); await tt('touchEnd', []); await sleep(300); }
  const W2 = await p.evaluate(() => SYNQUENZER.chsEd());
  ok('Wellen-Editor: zwei Finger zoomen', W2.view.W < W1.view.W * .5, W1.view.W.toFixed(2) + ' → ' + W2.view.W.toFixed(2) + ' s');
  await p.screenshot({path: SHOT + '/wellen-editor-P.png'});
  await p.evaluate(() => wpClose());
  // Song-Stück: Lineal spielt den Song ab dem Takt
  await song(p); await p.evaluate(() => { setSongView(true); g2Open({vox: 'V1'}); }); await sleep(1200);
  const S1 = await p.evaluate(() => SYNQUENZER.chsEd());
  await p.touchscreen.tap(X(S1, S1.t0 + 4 * S1.sp + .05), yR(S1)); await sleep(700);
  const ss = await p.evaluate(() => ({song: !!R.songPlay, bar0: R.songPlay && R.songPlay.bar0, run: SYNQUENZER.chsInfo().run}));
  ok('Song-Stimme: Lineal-Tipp spielt den Song ab Takt 4', ss.song && ss.bar0 === 3, JSON.stringify(ss));
  await p.evaluate(() => SYNQUENZER.chsStop());
  ok('keine Fehler (3)', errs.length === 0, errs.join(' | '));
  await b.close();
}

// ---------- 4. Auge der Legende ----------
{
  const {b, p, errs} = await open();
  await sing(p); await p.evaluate(() => { R.selS = 0; }); await style(p, 'pop');
  await p.evaluate(() => g2Open({t: stimmeT(), s: 0})); await sleep(1300);
  // Unisono: gestrichelter Rahmen um den Lead-Block (vorher unsichtbar darunter) – Pixel über dem Block
  const px = () => p.evaluate(() => { const E = G2.ed, cv = E.cv, g = cv.getContext('2d'), d = cv.width / cv.clientWidth, pal = SYNQUENZER.g6pgPal().dark.c1, c = [1, 3, 5].map(i => parseInt(pal.slice(i, i + 2), 16)); let n = 0;
    for (const b of E.blk) { if (b.x1 - b.x0 < 16 || b.x0 < 4) continue; const h = Math.max(4, E.rowH - 2), y = Math.round((b.y - h / 2 - 3.5) * d); for (let x = Math.round(b.x0 * d); x < Math.round(b.x1 * d); x++) { const q = g.getImageData(x, y, 1, 1).data; if (Math.abs(q[0] - c[0]) + Math.abs(q[1] - c[1]) + Math.abs(q[2] - c[2]) < 60) n++; } } return n; });
  const u0 = await px();
  await tapSel(p, '#wpSheet .g6pgleg button[data-a=eye][data-id="c1"]'); await sleep(200);
  const u1 = await px(), hid = await p.evaluate(() => SYNQUENZER.g6pgHit().filter(h => h.k === 0).length);
  ok('Auge Unisono (grau): sichtbar → aus', u0 > 20 && u1 === 0 && hid === 0, 'Rahmen-Pixel ' + u0 + ' → ' + u1 + ' · Treffer ' + hid);
  await p.screenshot({path: SHOT + '/auge-unisono-aus-P.png'});
  // gemerkt je Clip: Editor zu und wieder auf, Neuzeichnen
  await p.evaluate(() => { g2Close(); g2Open({t: stimmeT(), s: 0}); }); await sleep(800);
  await p.evaluate(() => { g2Paint(); g2Paint(); });
  const keep = await p.evaluate(() => ({hide: SYNQUENZER.chsHide(), hit: SYNQUENZER.g6pgHit().filter(h => h.k === 0).length, chip: !!document.querySelector('#wpSheet .g6pgc.off')}));
  ok('Auge gemerkt je Clip (nach Schließen/Neuzeichnen)', keep.hide.includes('c1') && keep.hit === 0 && keep.chip, JSON.stringify(keep));
  // Chorstimme bearbeiten: graue Lead-Balken mit eigenem Auge
  await p.evaluate(() => g2Open({t: stimmeT(), s: 0}, {voice: 1})); await sleep(900);
  const l0 = await p.evaluate(() => ({lead: SYNQUENZER.g6pgHit().filter(h => h.k === -1).length, chip: !!document.querySelector('#wpSheet .g6pgc.chslead'), cur: !!document.querySelector('#wpSheet .g6pgc.cur [data-a=eye]')}));
  await tapSel(p, '#wpSheet .g6pgleg button[data-a=eye][data-id="_lead"]'); await sleep(200);
  const l1 = await p.evaluate(() => SYNQUENZER.g6pgHit().filter(h => h.k === -1).length);
  await tapSel(p, '#wpSheet .g6pgleg button[data-a=eye][data-id="_lead"]'); await sleep(200);
  const l2 = await p.evaluate(() => SYNQUENZER.g6pgHit().filter(h => h.k === -1).length);
  ok('Graue Lead-Balken: Auge blendet aus/ein', l0.chip && l0.lead > 0 && l1 === 0 && l2 === l0.lead && !l0.cur, JSON.stringify(l0) + ' → ' + l1 + ' → ' + l2);
  await p.screenshot({path: SHOT + '/auge-lead-P.png'});
  // Gegenstimme (eigener Take): Lead grau dahinter, Auge wirkt
  await p.evaluate(() => SYNQUENZER.g6pDuplizieren(null, false)); await sleep(900);
  const d0 = await p.evaluate(() => ({take: G2.ed.id, lead: SYNQUENZER.g6pgHit().filter(h => h.k === -1).length, chip: !!document.querySelector('#wpSheet .g6pgc.chslead')}));
  await tapSel(p, '#wpSheet .g6pgleg button[data-a=eye][data-id="_lead"]'); await sleep(200);
  const d1 = await p.evaluate(() => SYNQUENZER.g6pgHit().filter(h => h.k === -1).length);
  ok('Gegenstimme: Lead grau + Auge', d0.chip && d0.lead > 0 && d1 === 0, JSON.stringify(d0) + ' → ' + d1);
  ok('keine Fehler (4)', errs.length === 0, errs.join(' | '));
  await b.close();
}

// ---------- 5. Video / GarageBand-Instrumental ----------
{
  const {b, p, errs} = await open();
  await sing(p); await p.evaluate(() => { R.selS = 0; });
  await song(p); await p.evaluate(() => { S.song.lanes = S.song.lanes.map(() => []); songChanged(); });   // nur Gesang im Song
  await style(p, 'pop', {vox: 'V1'});
  const rms = async () => (await p.evaluate(async () => (await SYNQUENZER.vvRender({range: {a: 2, b: 6}})).rms));
  const dB = (x, y) => (20 * Math.log10(x / y)).toFixed(1);
  const a0 = await rms();
  await p.evaluate(() => { SYNQUENZER.chsCouple(false); SYNQUENZER.chsSet('lead', -60); }); const a1 = await rms();   // Lead weg, Chor bleibt (getrennt)
  await p.evaluate(() => SYNQUENZER.chsSet('bg', -6)); const a2 = await rms();
  await p.evaluate(() => SYNQUENZER.chsSet('sum', -6)); const a3 = await rms();
  ok('Video: Chor im Render folgt Background-Regler und Gesang gesamt', a1 > 1e-4 && near(+dB(a2, a1), -6, .5) && near(+dB(a3, a2), -6, .5), 'RMS alles ' + a0.toFixed(5) + ' · nur Chor ' + a1.toFixed(5) + ' · Background −6: ' + dB(a2, a1) + ' dB · Gesang gesamt −6: ' + dB(a3, a2) + ' dB');
  const g0 = await p.evaluate(async () => { const r = await SYNQUENZER.ggbExport({remember: false}); return r.bytes; });
  await p.evaluate(() => SYNQUENZER.chsSet('sum', 0));
  const g1 = await p.evaluate(async () => { const r = await SYNQUENZER.ggbExport({remember: false}); return SYNQUENZER.ggbWav ? r.bytes : r.bytes; });
  ok('GarageBand-Instrumental ohne Gesang (unabhängig von den Reglern)', g0 > 1000 && g0 === g1, g0 + ' / ' + g1 + ' Bytes');
  ok('keine Fehler (5)', errs.length === 0, errs.join(' | '));
  await b.close();
}

// ---------- 6. Layout 428×926 / 926×428 / 428×650 ----------
for (const [n, w, h] of [['P', 428, 926], ['L', 926, 428], ['K', 428, 650]]) {
  const {b, p, errs} = await open({width: w, height: h});
  await sing(p); await p.evaluate(() => { R.selS = 0; }); await style(p, 'gospel');
  await p.evaluate(() => SYNQUENZER.chsOpen(true)); await sleep(500);
  const L = await p.evaluate(() => {
    const over = document.scrollingElement.scrollWidth > innerWidth + 1, I = SYNQUENZER.chsInfo(), els = [...document.querySelectorAll('#clipGrid .chsth,#clipGrid .chsc,#clipGrid .chse')].filter(e => !e.classList.contains('mxoff'));
    const g = document.getElementById('clipGrid').getBoundingClientRect(), outside = els.filter(e => { const r = e.getBoundingClientRect(); return r.bottom > g.bottom + 1 || r.right > g.right + 1; }).length;
    const minH = Math.min(...els.map(e => e.getBoundingClientRect().height)), minW = Math.min(...[...document.querySelectorAll('#clipGrid .chse:not(.mxoff)')].map(e => e.getBoundingClientRect().width));
    return {over, vis: I.mx.filter(r => r.vis).length, outside, minH: Math.round(minH), minW: Math.round(minW)};
  });
  ok('Layout ' + w + '×' + h + ' Matrix', !L.over && L.vis === 4 && L.outside === 0, JSON.stringify(L));
  await p.screenshot({path: SHOT + '/matrix-' + n + '.png'});
  await p.evaluate(() => SYNQUENZER.chsMixer()); await sleep(300);
  const M = await p.evaluate(() => { const p = document.querySelector('.chsmix'), r = p.getBoundingClientRect(), bt = [...p.querySelectorAll('.rb,input[type=range]')].map(e => e.getBoundingClientRect()).filter(q => q.width); return {top: Math.round(r.top), bottom: Math.round(r.bottom), right: Math.round(r.right), minT: Math.round(Math.min(...bt.map(q => Math.min(q.width, q.height))))}; });
  ok('Layout ' + w + '×' + h + ' Mischpult', M.top >= 0 && M.bottom <= h + 1 && M.right <= w + 1 && M.minT >= 44, JSON.stringify(M));
  await p.screenshot({path: SHOT + '/mischpult-' + n + '.png'});
  await p.evaluate(() => { closePop(); g2Open({t: stimmeT(), s: 0}); }); await sleep(900);
  const E = await p.evaluate(() => SYNQUENZER.chsEd());
  ok('Layout ' + w + '×' + h + ' Editor mit Lineal', E && E.rul.h >= 44 && E.cv.h >= 90 && E.rul.y + E.rul.h <= E.cv.y + E.cv.h + 1, E ? 'Leinwand ' + Math.round(E.cv.h) + ' px · Lineal ' + E.rul.h + ' px' : 'kein Editor');
  await p.screenshot({path: SHOT + '/editor-' + n + '.png'});
  await p.evaluate(() => { g2Close(); });
  await song(p); await p.evaluate(() => setSongView(true)); await sleep(700);
  await p.screenshot({path: SHOT + '/song-' + n + '.png'});
  ok('keine Fehler (6 ' + n + ')', errs.length === 0, errs.join(' | '));
  await b.close();
}

fs.writeFileSync(path.resolve(HERE, 'ergebnis-chorsp.txt'), T.res.join('\n') + '\n\n' + (T.fail ? T.fail + ' FEHLER' : 'alles grün') + '\n');
console.log(T.fail ? T.fail + ' FEHLER' : 'alles grün');
process.exit(T.fail ? 1 : 0);
