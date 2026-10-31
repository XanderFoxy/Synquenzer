// BM8-03/04/06/08/10: alle Kopierwege einzeln, Zeit- und Tonhöhen-Aktionen, Kurven löschen, Normalisierer, Speichern/Laden, andere Engines
import { open, ok, summary } from './lib.mjs';
const {b, p, errs} = await open();
const J = x => JSON.stringify(x);
// a 2-bar clip with all three curves on track 0 (Bit-Mask stand-in), slot s0; melody + song on track 0
await p.evaluate(() => {
  ensureAudio(); SYNQUENZER.bmcFake(0, true);
  const tr = S.tracks[0], s0 = tr.clips.findIndex(c => !c); window.__s0 = s0;
  const cv = {bd: [[0, 0], [1, .5], [2.5, -.25], [6, 0]], mw: [[0, .2], [3, .8], [7.5, .4]], at: [[0, 0], [4, 1], [5, 0]]};
  SYNQUENZER.setClip(0, s0, {len: 2, key: {root: 0, scale: 'ionian'}, notes: [{t: 0, d: 1, n: 60, v: .8}, {t: 4, d: 1, n: 64, v: .8}], cv});
  window.__cv = JSON.parse(JSON.stringify(S.tracks[0].clips[s0].cv));
  window.__old = []; S.tracks.forEach((t, i) => t.clips.forEach((c, s) => { if (c && !(i === 0 && s === s0)) window.__old.push([i, s]); }));
});
const CV = await p.evaluate(() => window.__cv);
ok('Ausgang: Clip trägt cv', CV && CV.bd && CV.mw && CV.at, CV);
// ---------- BM8-03 Mitwandern ----------
const r3 = await p.evaluate(() => {
  const A = SYNQUENZER, tr = S.tracks[0], s0 = window.__s0, cv = window.__cv, J = x => JSON.stringify(x), out = {};
  const free = () => tr.clips.findIndex(c => !c);
  // Clip kopieren / einfügen
  A.copyClip(0, s0); let k = free(); A.pasteClip(0, k); out.paste = J(tr.clips[k].cv) === J(cv); A.clearClip(0, k);
  // Clip kopieren → andere Spur (Synth 2)
  k = S.tracks[1].clips.findIndex(c => !c); A.pasteClip(1, k); out.pasteOther = J(S.tracks[1].clips[k].cv) === J(cv); A.clearClip(1, k);
  // Duplizieren → frei
  k = A.duplicateClip(0, s0); out.dup = k >= 0 && J(tr.clips[k].cv) === J(cv); if (k >= 0) A.clearClip(0, k);
  // getClip / setClip (API)
  out.getClip = J(A.getClip(0, s0).cv) === J(cv);
  // Undo-Schnappschuss
  const n0 = UNDO.length; pushUndo(0, s0, tr.clips[s0], 'x'); out.undoSnap = J(UNDO[UNDO.length - 1].before.cv) === J(cv); UNDO.length = n0;
  return out;
});
for (const [k, v] of Object.entries(r3)) ok('BM8-03 ' + {paste: 'Clip kopieren/einfügen', pasteOther: 'Einfügen in andere Spur', dup: 'Duplizieren → frei', getClip: 'getClip (API)', undoSnap: 'Undo-Schnappschuss'}[k], v);
// Song: track 0 plays s0 from bar 0 for 8 bars; melody on track 1 with curves
const r3s = await p.evaluate(() => {
  const A = SYNQUENZER, s0 = window.__s0, cv = window.__cv, J = x => JSON.stringify(x), out = {};
  const lanes = S.tracks.map((_, i) => i === 0 ? [{bar: 0, slot: s0}] : []);
  A.setSong({bars: 8, loop: {on: false, a: 0, b: 8}, melodyTrack: 1, lanes, carrier: [], mel: {1: {len: 8, key: {root: 0, scale: 'ionian'}, notes: [{t: 0, d: 1, n: 72, v: .8}, {t: 9, d: 1, n: 74, v: .8}],
    cv: {bd: [[0, 0], [8, .5], [12, -.5], [20, 0]]}}}});
  out.melSet = J(S.song.mel[1].cv) === J({bd: [[0, 0], [8, .5], [12, -.5], [20, 0]]});
  // makeOwn (eigener Clip, ein Durchlauf) bei Takt 2 (Durchlauf Takte 2–3 = Clip-Zeit 0…8)
  A.makeOwn(0, 2); const oid = Object.keys(S.song.own || {})[0]; out.ownOne = !!oid && J(S.song.own[oid].cv) === J(cv); A.undo();
  // Ganzer Block: 8 Takte = 4 Durchläufe hintereinander
  A.makeOwn(0, 0, true); const ids = Object.keys(S.song.own || {});
  const exp = cvJoin([[cv, 0, 8], [cv, 8, 8], [cv, 16, 8], [cv, 24, 8]], 32);
  // the same curve (sampled every 1/64 beat; bar pieces add points on the line)
  const same = (x, y, L) => { for (const k of CV_K) { if (!!x[k] !== !!y[k]) return false; if (x[k]) for (let t = 0; t < L; t += 1 / 64) if (Math.abs(cvAt(x[k], t) - cvAt(y[k], t)) > 1 / 4096 + 1e-9) return false; } return true; };
  out.ownWhole = ids.length === 1 && same(S.song.own[ids[0]].cv, exp, 32); out.ownWholeN = ids.length + ' Clip, ' + S.song.own[ids[0]].cv.bd.length + ' Bend-Punkte'; A.undo();
  // Song-Bereich kopieren: Takte 1–2 (Index 0–1, Schläge 0–8) nach Takt 4 → Kurve [0,8) eingefügt bei 16, alles ab 16 um 8 weiter
  const before = S.song.mel[1].cv.bd.map(x => x.slice());
  A.songRange('copy', 0, 1, 4);
  const now = S.song.mel[1].cv.bd, ref = cvPutAbs(cvShiftAbs({bd: before}, 16, 8), cvSlice({bd: before}, 0, 8), 16, 8);
  out.rangeCopy = J(now) === J(cvCut(ref, S.song.mel[1].len * 4).bd); out.rangeCopyV = J(now);
  A.undo(); out.rangeUndo = J(S.song.mel[1].cv.bd) === J(before);
  // Bereich löschen: Takte 1–2 weg → Kurve ab 8 rückt um 8 nach vorn
  A.songRange('delete', 0, 1); out.rangeDel = J(S.song.mel[1].cv.bd) === J(cvCut(cvShiftAbs(cvClearAbs({bd: before}, 0, 8), 8, -8), S.song.mel[1].len * 4).bd); out.rangeDelV = J(S.song.mel[1].cv.bd); A.undo();
  // Melodie → Clip: Takte 3–4 (Schläge 8–16) als Clip
  A.openMelody(); ED.roll.setLoop(2, 3); const ok2 = A.melodyToClip(); const k = S.tracks[1].clips.reduce((m, c, i) => c ? i : m, -1);
  out.melToClip = ok2 && J(S.tracks[1].clips[k].cv) === J(cvSlice({bd: before}, 8, 16)); out.melToClipV = J(S.tracks[1].clips[k] && S.tracks[1].clips[k].cv);
  closeSheets && closeSheets();
  return out;
});
const lab3 = {melSet: 'Song-Melodie trägt cv', ownOne: 'makeOwn (eigener Clip)', ownWhole: 'Ganzer Block (4 Durchläufe abgerollt)', rangeCopy: 'Song-Bereich kopieren (Kurven verschoben)', rangeUndo: 'Song-Bereich Undo', rangeDel: 'Song-Bereich löschen (Kurven rücken nach)', melToClip: 'Melodie → Clip'};
for (const k of Object.keys(lab3)) ok('BM8-03 ' + lab3[k], r3s[k], k === 'rangeCopy' ? r3s.rangeCopyV : k === 'rangeDel' ? r3s.rangeDelV : k === 'melToClip' ? r3s.melToClipV : k === 'ownWhole' ? r3s.ownWholeN : undefined);
// Markierung kopieren (Teil-Kopie im Song)
const r3m = await p.evaluate(() => {
  const A = SYNQUENZER, J = x => JSON.stringify(x); S.song.marks = [{id: 'M1', a: 2, len: 2, part: null}];
  const before = S.song.mel[1].cv.bd.map(x => x.slice()); A.markAction('M1', 'copy', 6);
  const ref = cvPutAbs(cvShiftAbs({bd: before}, 24, 8), cvSlice({bd: before}, 8, 16), 24, 8);
  const r = J(S.song.mel[1].cv.bd) === J(cvCut(ref, S.song.mel[1].len * 4).bd); A.undo(); return r;
});
ok('BM8-03 Markierung kopieren (Kurven mit)', r3m);
// Projekt-Kopie, Datei-Rundweg, Server (Fake)
const r3p = await p.evaluate(async () => {
  const out = {}, J = x => JSON.stringify(x), want = serialize();
  // Datei: wie [Speichern] → Datei öffnen
  const text = JSON.stringify(projectFileObj(S, false, true)); const pr = projFromFile(JSON.parse(text)); const n = normalizeProject(pr);
  out.file = J(n.tracks[0].clips[window.__s0].cv) === J(window.__cv) && J(n.song.mel[1].cv) === J(S.song.mel[1].cv);
  const a1 = SQStore.buildProjectFile(n, null, VERSION).project, a2 = SQStore.buildProjectFile(S, null, VERSION).project;
  out.fileAll = J(a1) === J(a2);
  const diff = []; const walk = (x, y, path) => { if (J(x) === J(y)) return; if (x && y && typeof x === 'object' && typeof y === 'object') { if (J(Object.keys(x)) !== J(Object.keys(y))) diff.push(path + ' Reihenfolge ' + J(Object.keys(x)) + ' ≠ ' + J(Object.keys(y))); for (const k of new Set([...Object.keys(x), ...Object.keys(y)])) walk(x[k], y[k], path + '.' + k); } else diff.push(path + ': ' + J(x).slice(0, 90) + ' ≠ ' + J(y).slice(0, 90)); };
  walk(a1, a2, ''); out.diff = diff.slice(0, 6);
  // Server (Fake): derselbe Körper über projFromFile → cloudApply (der Weg von cloudPull)
  const id0 = S.id; await cloudApply(projFromFile(JSON.parse(text))); out.server = serialize() === want && S.id === id0;
  // Projekt-Kopie
  const before = (PROJ.index || []).map(e => e.id); await SYNQUENZER.duplicateProject(S.id);
  const nid = (PROJ.index || []).map(e => e.id).find(x => !before.includes(x));
  const fo = nid ? await kv.get('proj:' + nid) : null, cp = fo ? normalizeProject(projFromFile(fo)) : null;
  out.copy = !!cp && J(cp.tracks[0].clips[window.__s0].cv) === J(window.__cv) && J(cp.song.mel[1].cv) === J(S.song.mel[1].cv); out.copyId = nid;
  return out;
});
ok('BM8-03 Datei-Rundweg (cv deep-equal)', r3p.file); ok('BM8-08 Speichern → Laden deep-equal (ganzes Projekt)', r3p.fileAll, r3p.diff);
ok('BM8-03 Server (Fake: Körper → cloudApply)', r3p.server); ok('BM8-03 Projekt-Kopie', r3p.copy, r3p.copyId);
// ---------- BM8-04 Zeit- und Tonhöhen-Aktionen ----------
const r4 = await p.evaluate(() => {
  const A = SYNQUENZER, s0 = window.__s0, cv = window.__cv, tr = S.tracks[0], J = x => JSON.stringify(x), out = {}, c = () => tr.clips[s0];
  clipLength(0, s0, 2); out.x2 = J(c().cv) === J(cvRepeat(cv, 8, 2)) && c().len === 4; out.x2v = J(c().cv.mw); A.undo();
  clipLength(0, s0, .5); out.half = J(c().cv) === J(cvCut(cv, 4)) && c().cv.at.length === 1 && c().cv.mw.length === 2; out.halfV = J(c().cv); A.undo();
  clipLength(0, s0, -1); out.minus = J(c().cv) === J(cvCut(cv, 4)); A.undo();
  clipLength(0, s0, 1); out.plus = J(c().cv) === J(cv) && c().len === 3; A.undo();
  out.undoBack = J(c().cv) === J(cv) && c().len === 2;
  // Roll: ×2 (Dupl. ohne Auswahl), Takte −, Zuschneiden, Tonhöhe ±12
  A.openRoll(0, s0); const R_ = ED.roll, btn = t => [...R_.el.acts.querySelectorAll('button')].find(b => b.textContent.trim() === t);
  btn('Dupl.').click(); out.rollX2 = J(c().cv) === J(cvRepeat(cv, 8, 2)); A.undo(); R_.refresh();
  R_.setLen(1); out.rollLen = J(c().cv) === J(cvCut(cv, 4)); A.undo(); R_.refresh();
  R_.setLoop(1, 1); R_.cropToLoop(); out.rollCrop = J(c().cv) === J(cvSlice(cv, 4, 8)); out.rollCropV = J(c().cv); A.undo(); R_.refresh();
  R_.select(c().notes.slice()); const up = [...R_.el.acts.querySelectorAll('button')].find(b => /^\+12|^▲ ?Okt|Okt/.test(b.textContent.trim()) || b.title === 'Eine Oktave höher');
  out.upLabel = up ? up.textContent.trim() + ' / ' + up.title : null;
  const n0 = c().notes.map(n => n.n); if (up) up.click(); out.pitch = !!up && J(c().cv) === J(cv) && c().notes.some((n, i) => n.n !== n0[i]); A.undo(); R_.refresh();
  setClipKey(0, s0, {root: 5}); out.key = J(c().cv) === J(cv); A.undo();
  closeSheets();
  return out;
});
const lab4 = {x2: 'Länge ×2 (Kurven verdoppelt)', half: 'Länge ½ (Punkte hinter dem Ende fallen weg)', minus: 'Länge −1', plus: 'Länge +1 (Kurve unverändert)', undoBack: 'Undo stellt Länge und Kurven her', rollX2: 'Editor Dupl. (×2)', rollLen: 'Editor Takte −', rollCrop: 'Editor Zuschneiden (Bereich ab 0)', pitch: 'Tonhöhe ±12: cv unverändert', key: 'Tonart ändern: cv unverändert'};
for (const k of Object.keys(lab4)) ok('BM8-04 ' + lab4[k], r4[k], k === 'half' ? r4.halfV : k === 'rollCrop' ? r4.rollCropV : k === 'pitch' ? r4.upLabel : k === 'x2' ? r4.x2v : undefined);
// ---------- BM8-06 Kurven löschen ----------
const r6 = await p.evaluate(() => {
  const A = SYNQUENZER, s0 = window.__s0, J = x => JSON.stringify(x), out = {};
  out.withCv = A.clipMenuItems(0, s0).some(t => /^Kurven löschen/.test(t));
  const k = S.tracks[0].clips.findIndex(c => !c); A.setClip(0, k, {len: 1, key: {root: 0, scale: 'ionian'}, notes: [{t: 0, d: 1, n: 60, v: .8}]});
  out.without = !A.clipMenuItems(0, k).some(t => /^Kurven/.test(t)); A.clearClip(0, k); closeClipSheet();
  openClipSheet(0, s0); const btn = [...EL.clipSheet.querySelectorAll('button')].find(b => /^Kurven löschen/.test(b.textContent.trim()));
  const r = btn.getBoundingClientRect(); out.size = [Math.round(r.width), Math.round(r.height)]; out.label = btn.getAttribute('aria-label');
  const u0 = UNDO.length; btn.click(); out.gone = !S.tracks[0].clips[s0].cv && UNDO.length === u0 + 1 && UNDO[UNDO.length - 1].label === 'Kurven löschen';
  out.after = !A.clipMenuItems(0, s0).some(t => /^Kurven/.test(t));
  A.undo(); out.undo = J(S.tracks[0].clips[s0].cv) === J(window.__cv); A.redo(); out.redo = !S.tracks[0].clips[s0].cv; A.undo(); closeClipSheet();
  return out;
});
ok('BM8-06 Menüpunkt nur bei Clips mit Kurven', r6.withCv && r6.without && r6.after, r6);
ok('BM8-06 löscht alle drei, ein Undo', r6.gone); ok('BM8-06 Undo / Redo', r6.undo && r6.redo);
ok('Taste „Kurven löschen“ ≥ 44 px hoch', r6.size[1] >= 44, r6.size);
// ---------- BM8-08 Normalisierer ----------
const r8 = await p.evaluate(() => {
  const A = SYNQUENZER, J = x => JSON.stringify(x), out = {}, k = S.tracks[0].clips.findIndex(c => !c);
  const many = []; for (let i = 0; i < 6000; i++) many.push([i * 16 / 6000, (i % 7) / 7]);
  A.setClip(0, k, {len: 4, key: {root: 0, scale: 'ionian'}, notes: [], cv: {bd: [[3, .5], [1, -2], [NaN, 0], [2, 0.123456789], [20, 1], [-1, 0], [1, .25]], mw: many, at: [[2, 'x'], [5, 9]], xx: [[0, 1]]}});
  const c = S.tracks[0].clips[k].cv; out.cv = {bd: c.bd, at: c.at, mwN: c.mw.length, keys: Object.keys(c)};
  out.sorted = c.bd.every((p, j) => !j || p[0] > c.bd[j - 1][0]); out.start = c.bd[0][0] === 0 && c.at[0][0] === 0 && c.mw[0][0] === 0;
  out.clamp = c.bd.every(p => p[1] >= -1 && p[1] <= 1) && c.at.every(p => p[1] >= 0 && p[1] <= 1);
  out.max = c.mw.length <= 4096; out.q = c.bd.every(p => Number.isInteger(p[1] * 4096)) && c.mw.every(p => Number.isInteger(p[1] * 1024));
  // Speichern → Laden → noch einmal: gleich
  const n1 = normalizeProject(projFromFile(JSON.parse(JSON.stringify(projectFileObj(S, false, true)))));
  out.round = J(n1.tracks[0].clips[k]) === J(cleanClip(S.tracks[0].clips[k])); A.clearClip(0, k);
  // ein altes Projekt ohne cv: kein cv-Feld entsteht
  out.noCv = window.__old.length > 0 && window.__old.every(([i, s]) => !S.tracks[i].clips[s] || !('cv' in S.tracks[i].clips[s]));
  return out;
});
ok('BM8-08 repariert: sortiert, Startpunkt, Grenzen, NaN/fremde Werte weg, Rundung', r8.sorted && r8.start && r8.clamp && r8.q && J(r8.cv.keys) === '["bd","mw","at"]', r8.cv);
ok('BM8-08 höchstens 4096 Punkte', r8.max, r8.cv.mwN); ok('BM8-08 Rundweg nach Reparatur deep-equal', r8.round); ok('Regel 28: die Demo-Clips (ohne Kurven) bekommen kein cv-Feld', r8.noCv);
// ---------- BM8-10 andere Engines: Kurven-Clip auf VA-Spur ----------
const r10 = await p.evaluate(async () => {
  const A = SYNQUENZER, J = x => JSON.stringify(x), out = {}, t = 2; A.bmcFake(0, false);
  const k = S.tracks[t].clips.findIndex(c => !c), notes = [{t: 0, d: .5, n: 60, v: .8}, {t: 1, d: .5, n: 64, v: .8}, {t: 2, d: .5, n: 67, v: .8}, {t: 3, d: .5, n: 72, v: .8}];
  out.engine = S.tracks[t].sound.engine;
  const run = async (cv) => { A.setClip(t, k, Object.assign({len: 1, key: {root: 0, scale: 'ionian'}, notes}, cv ? {cv} : {})); A.clearLog(); A.bmcLog(true); A.launchClip(t, k); A.play();
    await new Promise(r => setTimeout(r, 1300)); A.stop(); const log = A.noteLog().filter(e => e.track === t).map(e => [e.out, e.vel, +(e.time - R.startTime).toFixed(4)]); return {log, ctl: A.bmcLog().filter(e => e.i === t).length}; };
  const a = await run(null), b = await run(window.__cv && cvCut(window.__cv, 4));
  out.same = J(a.log) === J(b.log) && a.log.length > 0; out.n = a.log.length; out.ctl = b.ctl;
  out.kept = !!S.tracks[t].clips[k].cv; A.clearClip(t, k); A.bmcFake(0, true);
  return out;
});
ok('BM8-10 VA-Spur mit Kurven-Clip: gleiche Noten, keine Kurven-Ereignisse, cv bleibt', r10.same && r10.ctl === 0 && r10.kept, r10);
ok('Konsole ohne Fehler, kein Supabase-Aufruf', !errs.length, errs);
await b.close(); process.exit(summary());
