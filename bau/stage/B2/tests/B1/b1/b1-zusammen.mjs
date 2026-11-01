// B1 Zusammenspiel T1 × SX11 × N8I134 (Playwright, Touch-Kontext aus sx11/lib.mjs)
//  A  SX11 leicht/voll in einem 3/4-Song (Clips umgerechnet): dünne Hi-Hat = Achtel der Taktart (6 je 3/4-Takt), Kick/Snare gleich,
//     eigener Clip trägt die Taktart, [Voll] = exakt vorher, Undo = Anfang
//  B  SX11 leicht in einem 7/8-Teil (4/4-Song): Hi-Hat auf dem Achtelraster ab Taktanfang, ≤ 7 je Takt
//  C  Konsolidieren eines leichten Teils im 3/4-Song: klingt gleich, neuer Teil hinten = leichter Refrain, Zurückholen exakt
//  D  N8: Morph „bar1“ folgt dem Takt (3 Schläge in 3/4), LFO „1 Takt“ bleibt 4 Schläge (Entscheidung), Worklet ohne Fehler
//  E  Speichern/Laden mit Taktart + Fassung + gemalter Form: Format 7, need ['lf'], alles deep-equal; ohne neue Felder Format 5, kein need
// node b1-zusammen.mjs [index.html]
import path from 'path';
if (process.argv[2]) process.env.SX_APP = path.resolve(process.argv[2]);
const L = await import('../sx11/lib.mjs');
const {open, buildSong, ok, summary, diff, state, notesOf, diffNotes} = L;
const {b, p, errs} = await open();

// ein Durchlauf des Songs nach der Taktkarte (lib.playLog rechnet das Ende in 4/4-Takten)
const playLog = (a = 0) => p.evaluate(async a => {
  clearLog(); SYNQUENZER.songSelect(null);
  const e = barBeat(S.song.bars);
  songPlayStart(a);
  await new Promise(res => { const iv = setInterval(() => { if (R.songPlay && songBeatOf(audBeat()) >= e - .02) songPlayEnd(true); if (!R.playing) { clearInterval(iv); res(); } }, 10); });
  await new Promise(r => setTimeout(r, 300));
  return noteLog(4096);
}, a);
const bars = () => p.evaluate(() => SYNQUENZER.taktInfo().bars);
const strip = st => { const o = JSON.parse(JSON.stringify(st)); for (const m of o.song.marks) delete m.vr; return o; };
const DR = await p.evaluate(() => DRUM_T);
// Hi-Hat/Kick/Snare eines Bereichs [b0, b1) Takte aus dem Log, Schlag relativ zum Taktanfang
function drumsIn(log, B, b0, b1) {
  const out = {hat: [], ks: [], bad: [], per: {}};
  for (const n of notesOf(log)) {
    if (n[0] !== DR) continue;
    const beat = n[3]; let k = B.findIndex(x => beat >= x.beat - 1e-6 && beat < x.beat + x.len - 1e-6); if (k < b0 || k >= b1) continue;
    const rel = +(beat - B[k].beat).toFixed(3);
    if (n[2] === 42 || n[2] === 70) { out.hat.push([k, rel]); out.per[k] = (out.per[k] || 0) + 1; if (Math.abs(rel * 2 - Math.round(rel * 2)) > .02) out.bad.push([k, rel]); }
    else if (n[2] === 36 || n[2] === 38) out.ks.push([k, n[2], rel]);
    else if (n[2] === 49 || n[2] === 46) out.bad.push([k, rel, n[2]]);
  }
  return out;
}

console.log('A  leicht/voll im 3/4-Song');
await buildSong(p, {cats: true});
await p.evaluate(() => { S.bpm = 240; setSongView(true); });
const conv = await p.evaluate(() => { SYNQUENZER.setSongTs('3/4', {quiet: true}); const n = SYNQUENZER.setSongTs('3/4', {clips: true, from: null}); UNDO.length = 0; REDO.length = 0; return {n, ts: S.ts, dr: S.tracks[DRUM_T].clips[0].ts, bars: S.song.bars}; });
ok(conv.ts === '3/4' && conv.dr === '3/4' && conv.n >= 1, 'Song 3/4, Clips umgerechnet (Drum-Clip 3/4)', conv);
const B3 = await bars();
const s0 = await state(p);
const full = await playLog();
const dFull = drumsIn(full, B3, 6, 10);
await p.evaluate(() => SYNQUENZER.markFassungSet('M3', 'l'));
const own = await p.evaluate(() => { const ids = Object.keys(S.song.own || {}); return ids.map(id => ({id, ts: S.song.own[id].ts || null, n: S.song.own[id].notes.filter(x => x.n === 42).length, len: S.song.own[id].len, cyc: S.song.own[id].notes.filter(x => x.n === 42).map(x => x.t)})); });
ok(own.length >= 1 && own.every(o => o.ts === '3/4'), 'der dünne Drum-Clip trägt die Taktart 3/4', own);
ok(own.length >= 1 && own.every(o => o.cyc.every(t => Math.abs(t * 2 - Math.round(t * 2)) < .02)), 'dünne Hi-Hat im Clip: nur Achtel', own.map(o => o.cyc));
const light = await playLog();
const dL = drumsIn(light, B3, 6, 10);
ok(!dL.bad.length, 'Refrain leicht (3/4): Hi-Hat nur auf Achteln ab Taktanfang, kein Becken / keine offene Hi-Hat', dL.bad.slice(0, 6));
ok([6, 7, 8, 9].every(k => dL.per[k] === 6), 'Refrain leicht (3/4): genau 6 Hi-Hats je Takt (Achtel der Taktart)', dL.per);
ok(JSON.stringify(dL.ks) === JSON.stringify(dFull.ks), 'Kick/Snare im leichten Refrain wie im vollen', {l: dL.ks.slice(0, 6), v: dFull.ks.slice(0, 6)});
{ const outside = l => notesOf(l).filter(n => n[3] < B3[6].beat - 1e-6 || n[3] >= B3[10].beat - 1e-6);
  const d = diffNotes(outside(full), outside(light)); ok(!d.onlyA.length && !d.onlyB.length, 'außerhalb des Refrains klingt alles gleich', d); }
await p.evaluate(() => SYNQUENZER.markFassungSet('M3', 'v'));
ok(diff(strip(s0), strip(await state(p))).length === 0, '[Voll] = exakt der Stand vorher (3/4)', diff(strip(s0), strip(await state(p))).slice(0, 4));
await p.evaluate(() => { while (UNDO.length) undo(); });
ok(diff(s0, await state(p)).length === 0, 'alles rückgängig = Anfang (3/4)');

console.log('C  Konsolidieren eines leichten Teils im 3/4-Song');
await p.evaluate(() => SYNQUENZER.markFassungSet('M3', 'l'));
const sL = await state(p), logL = notesOf(await playLog());
const r = await p.evaluate(() => SYNQUENZER.konsolidierenMark('M3', 'Refrain L'));
ok(r && r.part >= 0 && r.mark, 'konsolidiert: neuer Teil „Refrain L“', r);
{ const st = await state(p), P = st.parts[r.part];
  ok(P && P.len === 4, 'der Teil ist 4 Takte lang', P && P.len);
  ok(P && P.own && Object.values(P.own).every(c => !c.notes.some(n => n.n === 49 || n.n === 46)) && Object.values(P.own).some(c => c.ts === '3/4'), 'der Teil enthält die dünnen 3/4-Drums', P && Object.values(P.own || {}).map(c => c.ts)); }
{ const d = diffNotes(logL, notesOf(await playLog())); ok(!d.onlyA.length && !d.onlyB.length, 'Song klingt nach dem Konsolidieren gleich (leicht, 3/4)', {a: d.onlyA.slice(0, 3), b: d.onlyB.slice(0, 3)}); }
await p.evaluate(k => SYNQUENZER.placePart('P' + (k + 1), 12, 'insert'), r.part);
{ const B = await bars(), lg = notesOf(await playLog());
  const a = lg.filter(n => n[3] >= B[6].beat - 1e-6 && n[3] < B[10].beat - 1e-6).map(n => [n[0], n[2], +(n[3] - B[6].beat).toFixed(3)]);
  const c = lg.filter(n => n[3] >= B[12].beat - 1e-6 && n[3] < B[16].beat - 1e-6).map(n => [n[0], n[2], +(n[3] - B[12].beat).toFixed(3)]);
  const d = diffNotes(a, c); ok(a.length > 20 && !d.onlyA.length && !d.onlyB.length, 'der neue Teil hinten eingesetzt klingt wie der leichte Refrain (Taktkarte 3/4)', {n: a.length, a: d.onlyA.slice(0, 3), b: d.onlyB.slice(0, 3)}); }
await p.evaluate(() => SYNQUENZER.undo());
ok(await p.evaluate(id => SYNQUENZER.zurueckholen(id), r.mark), 'zurückgeholt');
ok(diff(sL, await state(p)).length === 0, 'Zurückholen = exakt der leichte Stand (mit Fassung, 3/4)', diff(sL, await state(p)).slice(0, 4));
await p.evaluate(() => { while (UNDO.length) undo(); });
ok(diff(s0, await state(p)).length === 0, 'alles rückgängig = Anfang');

console.log('B  leicht in einem 7/8-Teil (4/4-Song, Clip bleibt 4/4)');
await buildSong(p, {cats: true});
await p.evaluate(() => { S.bpm = 240; SYNQUENZER.setSongTs(null, {quiet: true}); SYNQUENZER.setMarkTs('M3', '7/8'); UNDO.length = 0; REDO.length = 0; });
const B7 = await bars();
ok(B7[6].len === 3.5 && B7[9].len === 3.5 && B7[10].len === 4, 'Taktkarte: Refrain 4 × 3,5 Schläge', B7.slice(5, 11).map(x => x.len));
const s7 = await state(p), full7 = drumsIn(await playLog(), B7, 6, 10);
await p.evaluate(() => SYNQUENZER.markFassungSet('M3', 'l'));
const d7 = drumsIn(await playLog(), B7, 6, 10);
ok(!d7.bad.length, '7/8 leicht: Hi-Hat nur auf Achteln ab Taktanfang, kein Becken / keine offene Hi-Hat', d7.bad.slice(0, 6));
ok([6, 7, 8, 9].every(k => d7.per[k] >= 1 && d7.per[k] <= 7), '7/8 leicht: höchstens 7 Hi-Hats je Takt (Achtel der Taktart)', d7.per);
ok(JSON.stringify(d7.ks) === JSON.stringify(full7.ks), '7/8: Kick/Snare leicht wie voll', {l: d7.ks.slice(0, 6), v: full7.ks.slice(0, 6)});
await p.evaluate(() => SYNQUENZER.markFassungSet('M3', 'v'));
ok(diff(strip(s7), strip(await state(p))).length === 0, '7/8: [Voll] = exakt vorher');

console.log('D  N8 bei Taktart ≠ 4/4');
const nd = await p.evaluate(async () => {
  SYNQUENZER.setSongTs('3/4', {quiet: true});
  const sp = spb(), g = grid().beatsPerBar;
  // B2: ein Mechanismus – der Szenen-Morph ist V6A (v6aTimes statt N8 stTimes); Erwartung unverändert 3/6 Schläge
  const T1_ = v6aTimes({x: 'bar1'}, 0, 0), T2_ = v6aTimes({x: 'bar2'}, 0, 0), b1 = [T1_.t0, T1_.t1], b2 = [T2_.t0, T2_.t1];
  // LFO „1 Takt“ (Takt-Sync 1/1) = 4 Schläge, unabhängig von der Taktart (Entscheidung B1, T1-Frage 3)
  const snd = S.tracks[0].sound; snd.p.l1sync = 4; syncEngine(0, true);
  const f = SYNQUENZER.form.set(0, 1, FORM.lib().Pumpen); snd.p.l1shape = 5; syncEngine(0, true);
  await new Promise(r => setTimeout(r, 250)); const q = await SYNQUENZER.sr.eng(0);
  return {g, bar1: +((b1[1] - b1[0]) / sp).toFixed(3), bar2: +((b2[1] - b2[0]) / sp).toFixed(3), l1sync: S.tracks[0].sound.p.l1sync, lf: q && q.lf, miss: q && q.lfMiss, f: !!f};
});
ok(nd.g === 3 && nd.bar1 === 3 && nd.bar2 === 6, 'Szenen-Morph „1 Takt“/„2 Takte“ = 3/6 Schläge im 3/4-Takt', nd);
ok(nd.l1sync === 4 && nd.lf && nd.lf[0] === true && !nd.miss, 'LFO 1 Takt-Sync 1/1 bleibt 4 Schläge, gemalte Form im Worklet', nd);

console.log('E  Speichern/Laden mit allen neuen Feldern');
const sv = await p.evaluate(() => {
  SYNQUENZER.markFassungSet('M3', 'l');
  const o = projectFileObj(S, true), j = SYNQUENZER.serialize();
  return {fmt: o.format, need: o.project ? o.project.need : o.need, ts: S.ts, vr: !!S.song.marks.find(m => m.id === 'M3').vr, j, openNeed: 'need' in S};
});
ok(sv.fmt === 7, 'Datei mit Taktart = Format 7', sv.fmt);
ok(JSON.stringify(sv.need) === '["lf"]' && !sv.openNeed, 'need = ["lf"] nur in der Datei, offenes Projekt ohne need', {need: sv.need, open: sv.openNeed});
const s1 = await state(p), snd1 = await p.evaluate(() => JSON.stringify(S.tracks[0].sound.p.l1f));
ok(await p.evaluate(j => SYNQUENZER.importJSON(j), sv.j), 'geladen');
await p.waitForTimeout(400);
{ const s2 = await state(p), j2 = await p.evaluate(() => SYNQUENZER.serialize()), snd2 = await p.evaluate(() => JSON.stringify(S.tracks[0].sound.p.l1f));
  ok(diff(s1, s2).length === 0 && snd1 === snd2 && await p.evaluate(() => S.ts) === '3/4', 'Song, Teile, Fassung, Taktart, Form deep-equal nach dem Laden', diff(s1, s2).slice(0, 4));
  const ns = x => x.replace(/"sum":"[0-9a-f]+",/, ''), A1 = ns(sv.j), A2 = ns(j2); let k = 0; while (k < A2.length && A2[k] === A1[k]) k++;
  ok(A2 === A1, 'erneut gespeichert: Zeichen für Zeichen gleich (ohne Prüfsumme/Zeit)', j2 === sv.j ? '' : 'ab Zeichen ' + k + ': ' + A1.slice(Math.max(0, k - 120), k + 120) + ' ⇢ ' + A2.slice(Math.max(0, k - 120), k + 120)); }
const plain = await p.evaluate(async () => { await SYNQUENZER.newProject?.(); const o = projectFileObj(S, true); return {fmt: o.format, need: 'need' in (o.project || o)}; }).catch(e => ({err: String(e)}));
ok(plain.fmt === 5 && !plain.need, 'neues Projekt ohne neue Felder: Format 5, kein need', plain);

ok(!errs.length, 'keine Seiten-/Konsolenfehler', errs.slice(0, 3));
await b.close();
process.exit(summary('B1-Zusammenspiel') ? 1 : 0);
