// SX714 Abnahme SX14: ↶ halten → Verlauf-Liste (Namen, Uhrzeit), Tipp springt, ↷ holt zurück; ＋ Schnappschuss, zurückholen = 1 Undo-Schritt
import { open, buildSong, tapEl, hold, OUT } from './lib.mjs';
const res = {};
for (const [w, h, N] of [[428, 926, 'P'], [926, 428, 'L']]) {
  const {b, p, errs} = await open(w, h); await buildSong(p);
  await p.evaluate(() => { try { closeEditor(); } catch (e) {} setSongView(true); }); await p.waitForTimeout(400);
  const st = () => p.evaluate(() => sx14State());
  const r = {};
  // vier echte Schritte mit Namen
  await p.evaluate(() => { UNDO.length = 0; REDO.length = 0; });
  const s0 = await st();
  await p.evaluate(() => SYNQUENZER.songSetChord(2, 'Dm')); const s1 = await st();
  await p.evaluate(() => SYNQUENZER.songSetChord(4, 'G')); const s2 = await st();
  await p.evaluate(() => songSetLoop(true)); const s3 = await st();
  await p.evaluate(() => SYNQUENZER.songSetChord(8, 'C')); const s4 = await st();
  r.labels = await p.evaluate(() => UNDO.map(e => e.label));
  const ub = async () => { const q = await (await p.$('#bUndo')).boundingBox(); return [q.x + q.width / 2, q.y + q.height / 2, q]; };
  let [ux, uy, uq] = await ub(); r.undoBtn = [uq.width, uq.height];
  await hold(p, ux, uy, 700);
  r.list = await p.evaluate(() => ({pop: UI.pop && UI.pop.name, rows: [...document.querySelectorAll('.sx14 .sx14-r')].map(b => { const q = b.getBoundingClientRect(); return [b.innerText.replace(/\n/g, ' | '), Math.round(q.height), b.classList.contains('cur')]; }), undo: UNDO.length}));
  await p.screenshot({path: OUT + 'sx14-liste-' + N + '.png'});
  // Tipp auf den zweiten Stand von oben unter „jetzt“ = 2 Schritte zurück
  await tapEl(p, '.sx14 .sx14-r[data-k="2"]', 400);
  r.jump = {undo: await p.evaluate(() => UNDO.length), redo: await p.evaluate(() => REDO.length), gleich: (await st()) === s2};
  // ↷-Schritt ganz oben wieder holen
  [ux, uy] = await ub(); await hold(p, ux, uy, 700);
  r.redoRows = await p.evaluate(() => document.querySelectorAll('.sx14 .sx14-r.red').length);
  await tapEl(p, '.sx14 .sx14-r.red', 400);
  r.vor = {undo: await p.evaluate(() => UNDO.length), redo: await p.evaluate(() => REDO.length), gleich: (await st()) === s4};
  // ＋ Schnappschuss „vor dem Umbau“
  [ux, uy] = await ub(); await hold(p, ux, uy, 700);
  await tapEl(p, '.sx14 [data-a="add"]', 300);
  await p.fill('.mname .mn-in', 'vor dem Umbau'); await tapEl(p, '.mname .mn-ok', 400);
  r.snap = await p.evaluate(() => ({n: S.sx14 && S.sx14.snaps.length, name: S.sx14 && S.sx14.snaps[0].name, size: JSON.stringify(S.sx14).length, proj: serialize().length, pop: UI.pop && UI.pop.name}));
  // zweiter Schnappschuss nach einer Änderung: geteilte Teile liegen nur einmal da
  await p.evaluate(() => SYNQUENZER.songSetChord(10, 'Am')); const s5 = await st();
  await p.evaluate(() => sx14Add('nach Am'));
  r.snap2 = await p.evaluate(() => ({n: S.sx14.snaps.length, size: JSON.stringify(S.sx14).length, pool: Object.keys(S.sx14.pool).length, teile: S.sx14.snaps[1].m.length}));
  await p.evaluate(() => closePop());
  // Umbau, dann zurückholen
  await p.evaluate(() => { SYNQUENZER.songSetChord(1, 'E'); setBpm(90); }); const s6 = await st();
  [ux, uy] = await ub(); await hold(p, ux, uy, 700);
  await p.screenshot({path: OUT + 'sx14-schnapp-' + N + '.png'});
  const sid = await p.evaluate(() => S.sx14.snaps[0].id);
  await p.evaluate(id => document.querySelector(`.sx14 [data-a="r"][data-id="${id}"]`).scrollIntoView({block: 'center'}), sid); await p.waitForTimeout(150);
  await tapEl(p, `.sx14 [data-a="r"][data-id="${sid}"]`, 600);
  r.zurueck = {gleich: (await st()) === s4, top: await p.evaluate(() => UNDO[UNDO.length - 1].kind + ' ' + UNDO[UNDO.length - 1].label), undo: await p.evaluate(() => UNDO.length), snaps: await p.evaluate(() => S.sx14.snaps.length), song: await p.evaluate(() => UI.songView)};
  await p.evaluate(() => undo()); await p.waitForTimeout(300);
  r.undoDavon = (await st()) === s6;
  await p.evaluate(() => redo()); await p.waitForTimeout(300);
  r.redoDavon = (await st()) === s4;
  // Speichern-Rundweg: das Feld bleibt, Projekt ohne Feld bleibt Zeichen für Zeichen gleich
  r.rund = await p.evaluate(() => {
    const a = serialize(), q = parseProjectFile(JSON.parse(a)).project, keep = S; S = normalizeProject(q); const b2 = serialize(); S = keep;
    const fo = JSON.parse(a); delete fo.project.sx14; fo.sum = SQStore.fnv(JSON.stringify(fo.project)); const a0 = JSON.stringify(fo);
    const q0 = parseProjectFile(JSON.parse(a0)).project; S = normalizeProject(q0); const c = serialize(); S = keep;
    return {mitFeld: a === b2, ohneFeld: a0 === c, ohneHatKein: !/"sx14"/.test(c)};
  });
  r.errs = errs; res[N] = r; await b.close();
}
console.log(JSON.stringify(res, null, 1));
