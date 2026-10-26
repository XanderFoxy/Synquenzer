// VS2 Abnahme im Browser (Mikro-Attrappe): N7V-13, N2-VS2-01, Noten-Treffer, Live-Taste, Ergebnis-Blatt (Oktave, Einrasten
// = N7V-11, Raster, Verwerfen, OK), ● REC → MELODIE, Quelle Instrument + Oktave sperren, Klick-Maske, Teilen/Verbinden, Undo.
// node v3-vs2-accept.mjs [teil…]   (A B C D E F G H)
import {open, micOn, b64, resample} from './v3-mk7-vsh.mjs';
import {renderVoice, renderSynth} from './v3-vs2-corpus.mjs';
const only = process.argv.slice(2);
let fail = 0; const ok = (c, m) => { console.log((c ? '✓ ' : '✗ ') + m); if (!c) fail++; };
const sleep = ms => new Promise(r => setTimeout(r, ms));
const BPM = 120, SB = 60 / BPM, LEAD = 0.04;
// Melodie in Schlägen → Signal (16 kHz, Korpus-Stimme) → Kontext-Rate
function sing(notes, o = {}) {
  const mel = notes.map(([b, d, m], k) => ({on: LEAD + b * SB, dur: d * SB, midi: m, legato: false, rest: k ? 0.1 : 0}));
  const sig = (o.inst ? renderSynth(mel, o) : renderVoice(mel, {voice: o.voice || 'male', seed: o.seed || 3, sigma: o.sigma != null ? o.sigma : 12, vib: [20, 40], bpm: BPM, ...o}));
  return {x: sig.x, lead: LEAD};
}
// spielt das Signal so, dass Schlag `beat` des Liedes auf Signal-Zeit LEAD liegt; start: im selben Zug ▶ (Vorlauf 60 ms)
async function playAt(p, x, beat, sr, start) { const y = resample(x, 16000, sr); return p.evaluate(([b, beat, st, lead]) => { if (st) SYNQUENZER.play(); const c = SYNQUENZER.vsClock(); const t = c.start + beat * c.spb - lead; window.__fake.play(b, t); return t - window.__ctx.currentTime; }, [b64(y), beat, !!start, LEAD]); }
async function waitBeat(p, b) { await p.waitForFunction(b => { const c = SYNQUENZER.vsClock(); return c.playing && (c.now - c.outLat - c.start) / c.spb >= b; }, b, {timeout: 60000, polling: 20}); }
async function result(p) { await p.waitForFunction(() => !SYNQUENZER.vsInfo().busy, null, {timeout: 20000}); await sleep(100); return p.evaluate(() => SYNQUENZER.vsResult()); }
// Akkorde als Träger (TRANSPONIEREN, ein Ton = Stufe, Wechsel am Takt): kurz vor jedem Taktstrich die Taste
async function chordsAt(p, list) {
  await p.evaluate(() => { SYNQUENZER.setKbMode('transpose'); SYNQUENZER.setHarmony({change: 'bar', latch: true}); });
  for (let k = 0; k < list.length; k++) {
    await waitBeat(p, k * 4 - 0.6); await p.evaluate(n => SYNQUENZER.keyOn(n, 0.8, 'ch'), list[k]); await sleep(80); await p.evaluate(() => SYNQUENZER.keyOff(0, 'ch'));
  }
}
const ROOT = {Am: 57, F: 53, C: 48, G: 55, Dm: 50, E: 52, Am7: 57};
const MEL4 = [[0, 1, 57], [1, 1, 60], [2, 2, 64], [4, 1, 65], [5, 1, 64], [6, 2, 62], [8, 1, 60], [9, 1, 64], [10, 2, 67], [12, 1, 59], [13, 1, 62], [14, 1.5, 67]];
const want = (cl, mel, from = 0) => { let hit = 0; for (const [b, , m] of mel) if (cl.notes.some(n => n.n === m && Math.abs((n.o != null ? n.o : n.t) - (b - from)) <= 0.1)) hit++; return hit; };
async function fresh(o) {
  const H = await open(o); const m = await micOn(H.p); H.sr = m.sr; H.D = m.D;
  await H.p.evaluate(bpm => { SYNQUENZER.setBpm(bpm); SYNQUENZER.setMetronome && SYNQUENZER.setMetronome(false); }, BPM);
  return H;
}

// A — N7V-13 (neu, C.4): Stimme-FANG 1/8 Takt nach dem Taktstrich, 4-Takt-Phrase in der Lage von Fall 3b → Ende nach fangClose,
//     MELODIE-Clip, ein Undo entfernt ihn; N2-VS2-01: dieselben Enden wie FANG TEIL (fangClose) bei 3 weiteren Lagen
if (!only.length || only.includes('A')) {
  const H = await fresh(), p = H.p;
  const {x} = sing(MEL4);
  { const dt = await playAt(p, x, 0, H.sr, true); ok(dt > -0.003, 'Stimme rechtzeitig geplant (' + (dt * 1000).toFixed(1) + ' ms vor jetzt)'); }
  await chordsAt(p, ['Am', 'F', 'C', 'G', 'Am'].map(c => ROOT[c]));
  await waitBeat(p, 13); const lit = await p.evaluate(() => SYNQUENZER.vsInfo());
  ok(lit.fangMode === 'teil' || lit.fangMode === 'stimme', `FANG-Modus beim Singen in TRANSPONIEREN: ${lit.fangMode} (TRANSPONIEREN = FANG TEIL, Spec 4.7)`);
  await p.evaluate(() => SYNQUENZER.setKbMode('play'));
  await waitBeat(p, 16.5);
  const fc = await p.evaluate(() => SYNQUENZER.fangClose({beat: 16.5}));
  ok(await p.evaluate(() => SYNQUENZER.vsInfo().fangMode) === 'stimme', 'nach dem Singen in SPIELEN: FANG-Taste = FANG 🎤 (' + await p.evaluate(() => document.getElementById('bFang').textContent) + ')');
  const u0 = await p.evaluate(() => SYNQUENZER.undoInfo().n);
  ok(await p.evaluate(() => SYNQUENZER.vsFang({beat: 16.5})), 'vsFang angenommen');
  const r = await result(p), lf = await p.evaluate(() => SYNQUENZER.vsInfo().lastFang);
  ok(fc.bar === 4 && fc.rule === 'struktur', `fangClose: Taktstrich ${fc.bar + 1}, Regel ${fc.rule}, Akkorde ${fc.chords.join(' ')}`);
  ok(lf && lf.Eb === fc.bar && lf.rule === fc.rule, `N2-VS2-01 Stimme-FANG endet wie FANG TEIL: Eb ${lf && lf.Eb} = ${fc.bar}, Regel ${lf && lf.rule}`);
  ok(r && r.track === 5 && r.len === 4 && r.start === 0, `N7V-13 MELODIE-Clip: Spur ${r && r.track}, ${r && r.len} Takte ab Takt ${r && r.start + 1}`);
  const hit = r ? want(r, MEL4) : 0; if (process.env.V) console.log(JSON.stringify(r.notes.map(n => [n.o, n.n])));
  ok(hit >= 11, `Noten: ${hit}/${MEL4.length} richtig (Ton exakt, Einsatz ±0,1 Schlag = ±50 ms), erkannt ${r && r.notes.length}`);
  const ui = await p.evaluate(() => SYNQUENZER.undoInfo());
  ok(ui.n === u0 + 1 && ui.top.label === 'Stimme', `ein Undo-Schritt „${ui.top && ui.top.label}“`);
  const runT = await p.evaluate(() => SYNQUENZER.runtime().slots || null);
  ok(await p.evaluate(() => !!document.querySelector('.pop.vsres')), 'Ergebnis-Blatt offen');
  await p.evaluate(() => SYNQUENZER.vsResultOk());
  await p.evaluate(() => SYNQUENZER.undo());
  ok(await p.evaluate(s => SYNQUENZER.getClip(5, s) === null, r.scene), 'ein Undo entfernt den MELODIE-Clip');
  await p.evaluate(() => SYNQUENZER.redo());
  ok(await p.evaluate(s => !!SYNQUENZER.getClip(5, s), r.scene), 'Redo stellt ihn wieder her');
  void runT;
  ok(!H.errs.length, 'keine Konsolenfehler ' + JSON.stringify(H.errs.slice(0, 3)));
  await H.br.close();
}

// B — N2-VS2-01: weitere Lagen aus song-delta 4.2 (Fall 1 zu spät 30 %, Fall 4 Periode, Fall 6 Zeit): gleiche Enden
if (!only.length || only.includes('B')) {
  const cases = [
    {n: '1', ch: ['Am', 'F', 'C', 'G', 'Am'], tap: 16 + 4 * 0.3},
    {n: '2', ch: ['Am', 'F', 'C', 'G', 'Am'], tap: 16 + 4 * 0.8},
    {n: '3', ch: ['Am', 'F', 'C', 'G'], tap: 12 + 4 * 0.85},
    {n: '3b', ch: ['Am', 'F', 'C', 'G'], tap: 12 + 4 * 0.1},
    {n: '5', ch: ['Am', 'Am', 'Am', 'Am', 'Am', 'Am', 'Am'], tap: 24 + 4 * 0.4},
    {n: '5b', ch: ['Am', 'Am', 'Am', 'Am', 'Am', 'Am', 'Am'], tap: 24 + 4 * 0.6},
    {n: '7', ch: ['Am', 'F', 'C', 'G', 'Am', 'F', 'C', 'G', 'F', 'G', 'C', 'C', 'F', 'G', 'C', 'C', 'F'], tap: 64 + 4 * 0.2},
    {n: '4', ch: ['Am', 'F', 'C', 'G', 'Am', 'F', 'C', 'G', 'Am'], tap: 32 + 4 * 0.3},
    {n: '6', ch: ['Am', 'F', 'Dm', 'G', 'E', 'Am7', 'C'], tap: 24 + 4 * 0.4},
    {n: '6b', ch: ['Am', 'F', 'Dm', 'G', 'E', 'Am7', 'C'], tap: 24 + 4 * 0.6},
    {n: '9', ch: ['Am', 'F', 'C', 'Am', 'F', 'C', 'Am'], tap: 24 + 4 * 0.3},
  ];
  for (const cs of cases) {
    const H = await fresh(), p = H.p, bars = Math.ceil(cs.tap / 4);
    const mel = []; for (let b = 0; b < bars * 4 - 1; b += 2) mel.push([b, 1.5, [57, 60, 64, 62, 65, 64][(b / 2) % 6]]);
    await playAt(p, sing(mel).x, 0, H.sr, true);
    await chordsAt(p, cs.ch.map(c => ROOT[c].valueOf()));
    await p.evaluate(() => SYNQUENZER.setKbMode('play'));
    await waitBeat(p, cs.tap);
    const fc = await p.evaluate(b => SYNQUENZER.fangClose({beat: b}), cs.tap);
    await p.evaluate(b => SYNQUENZER.vsFang({beat: b}), cs.tap);
    await result(p); const lf = await p.evaluate(() => SYNQUENZER.vsInfo().lastFang);
    ok(lf && lf.Eb === fc.bar && lf.rule === fc.rule, `N2-VS2-01 Fall ${cs.n}: FANG TEIL Taktstrich ${fc.bar + 1} (${fc.rule}), Stimme-FANG ${lf ? lf.Eb + 1 + ' (' + lf.rule + ')' : '–'}, Clip ${lf && lf.len} Takte`);
    await H.br.close();
  }
}

// C — Live: gesungener Ton → Taste leuchtet (Klasse .vs), 🎤 aus → aus; Netz bleibt (kein Halt beim Hören)
if (!only.length || only.includes('C')) {
  const H = await fresh(), p = H.p;
  const n = H.sr * 1.2, y = new Float32Array(n); for (let i = 0; i < n; i++) { const t = i / H.sr; let v = 0; for (let k = 1; k <= 8; k++) v += 0.08 / k * Math.sin(2 * Math.PI * k * 220 * t); y[i] = v * Math.min(1, t / 0.01) * Math.min(1, (1.2 - t) / 0.02); }
  await p.evaluate(b => { window.__fake.play(b, window.__ctx.currentTime + 0.1); }, b64(y));
  await p.waitForFunction(() => SYNQUENZER.vsInfo().lit >= 0, null, {timeout: 3000}).catch(() => {});
  const vi = await p.evaluate(() => SYNQUENZER.vsInfo()), cls = await p.evaluate(() => [...document.querySelectorAll('#kb .key.vs')].length);
  ok(vi.lit === 57 && vi.litKey >= 0 && cls === 1, `Live: 220 Hz → Taste ${vi.lit} (A3) leuchtet (sichtbar ${vi.litKey}, ${cls} Taste)`);
  await sleep(1400);
  ok(await p.evaluate(() => SYNQUENZER.vsInfo().lit) === -1 && await p.evaluate(() => document.querySelectorAll('#kb .key.vs').length) === 0, 'nach dem Ton: Taste aus');
  ok(await p.evaluate(() => SYNQUENZER.stimme().quiet) === 0, 'beim Hören kein Netz-Halt (C.2 Punkt 5)');
  await p.evaluate(() => SYNQUENZER.stimmeStop());
  ok(await p.evaluate(() => SYNQUENZER.vsInfo().fangMode) !== 'stimme', 'nach 🎤 aus: FANG ist wieder FANG/FANG TEIL');
  await H.br.close();
}

// D — Ergebnis-Blatt: Oktave, Einrasten (N7V-11 im App-Weg), Raster, Verwerfen
if (!only.length || only.includes('D')) {
  const H = await fresh(), p = H.p;
  // Note 20 ct über Gis (68.2) in a-Moll, umgeben von Skalentönen (die Stimmung bleibt bei 0)
  const mel = [[0, 1, 57], [1, 1, 60], [2, 1.5, 68.2], [4, 1, 64], [5, 1, 62], [6, 1.5, 57]];
  const {x} = sing(mel, {sigma: 0, detune: 0});
  { const dt = await playAt(p, x, 0, H.sr, true); ok(dt > -0.003, 'Stimme rechtzeitig geplant (' + (dt * 1000).toFixed(1) + ' ms vor jetzt)'); }
  await waitBeat(p, 8.2);
  await p.evaluate(() => SYNQUENZER.vsFang({beat: 8.2}));
  let r = await result(p);
  const key = r && r.key, g = n => r.notes.find(q => Math.abs((q.o != null ? q.o : q.t) - 2) < 0.15);
  ok(r && key && ((key.root === 9 && key.scale === 'aeolian') || (key.root === 0 && key.scale === 'ionian')), `Tonart beim Einrasten: ${key && JSON.stringify(key)} (Tonleiter wie a-Moll)`);
  ok(r && g() && g().n === 69, `N7V-11 Einrasten an: 20 ct über Gis → ${r && g() && g().n} (A = 69)`);
  r = await p.evaluate(() => (SYNQUENZER.vsResultSet({snap: false}), SYNQUENZER.vsResult()));
  ok(g() && g().n === 68, `N7V-11 Einrasten aus: → ${g() && g().n} (Gis = 68)`);
  const n0 = r.notes.map(q => q.n);
  r = await p.evaluate(() => (SYNQUENZER.vsResultSet({oct: 1}), SYNQUENZER.vsResult()));
  ok(r.notes.every((q, i) => q.n === n0[i] + 12), 'Oktave ›: alle Noten +12');
  r = await p.evaluate(() => (SYNQUENZER.vsResultSet({oct: 0, grid: 'frei'}), SYNQUENZER.vsResult()));
  const fr = r.notes.map(q => q.t); r = await p.evaluate(() => (SYNQUENZER.vsResultSet({grid: '1/8'}), SYNQUENZER.vsResult()));
  if (process.env.V) console.log(JSON.stringify(fr), JSON.stringify(r.notes.map(q => [q.t, q.o])));
  ok(r.notes.every(q => Math.abs(q.t / 0.5 - Math.round(q.t / 0.5)) < 1e-6) && fr.some((t, i) => Math.abs(t - r.notes[i].t) > 1e-4) && r.notes.every((q, i) => Math.abs(q.o - fr[i]) < 1e-6), 'Raster 1/8: t auf 1/8, roher Einsatz o bleibt');
  ok(await p.evaluate(() => SYNQUENZER.undoInfo().top.label) === 'Stimme' && await p.evaluate(() => SYNQUENZER.undoInfo().n) >= 1, 'Änderungen im Blatt: weiter ein einziger Undo-Schritt');
  // Blatt per Tipp: OK schließt, Verwerfen entfernt
  await p.evaluate(() => SYNQUENZER.vsResultSet({snap: true, grid: '1/16'}));
  const sc = r.scene;
  await p.click('.pop.vsres [data-a="drop"]');
  await sleep(200);
  ok(await p.evaluate(s => SYNQUENZER.getClip(5, s), sc) === null && !(await p.evaluate(() => !!document.querySelector('.pop.vsres'))), 'Tipp [Verwerfen]: Clip weg, Blatt zu');
  await H.br.close();
}

// E — ● REC mit 🎤 → MELODIE-Clip (leerer Platz: neu; Spur MELODIE gewählt: in den aufgenommenen Clip)
if (!only.length || only.includes('E')) {
  const H = await fresh(), p = H.p;
  const mel = [[0, 1, 62], [1, 1, 64], [2, 2, 65], [4, 1, 64], [5, 1, 62], [6, 2, 60]];
  await p.evaluate(() => { SYNQUENZER.setRecOptions && SYNQUENZER.setRecOptions({countIn: 0, length: 2}); SYNQUENZER.selectSlot(0, 2); SYNQUENZER.play(); }); await sleep(150);
  const rec0 = await p.evaluate(() => SYNQUENZER.runtime().beat);
  // ● REC auf Synth 1 Szene 3 (fester Länge 2 Takte), dazu wird gesungen
  await waitBeat(p, 3.4); await p.evaluate(() => SYNQUENZER.rec());
  await playAt(p, sing(mel).x, 4, H.sr);
  await waitBeat(p, 12.6);
  const r = await result(p);
  ok(r && r.kind === 'rec' && r.track === 5 && r.scene === 2, `● REC mit 🎤: Ergebnis ${r && r.kind}, MELODIE Szene ${r && r.scene + 1}`);
  const hit = r ? want(r, mel) : 0;
  ok(hit >= 5, `● REC: ${hit}/${mel.length} Noten richtig (t relativ zum Aufnahme-Start), Länge ${r && r.len} Takte`);
  ok(await p.evaluate(() => SYNQUENZER.undoInfo().top.label) === 'Stimme', 'ein Undo-Schritt „Stimme“');
  void rec0;
  ok(!H.errs.length, 'keine Konsolenfehler ' + JSON.stringify(H.errs.slice(0, 3)));
  await H.br.close();
}

// F — Quelle Instrument + Oktave sperren (K2-33): Säge mit Sub-Oszillator −1 Okt. → gespielte Oktave
if (!only.length || only.includes('F')) {
  const H = await fresh(), p = H.p;
  const mel = [[0, 1, 57], [1, 1, 60], [2, 1, 64], [3, 1, 62], [4, 2, 57], [6, 1, 55], [7, 1, 57]];
  const melS = mel.map(([b, d, m]) => ({on: LEAD + b * SB, dur: d * SB, midi: m}));
  const x = renderSynth(melS, {sub: 'square', subAmp: 0.6}).x;
  for (const lock of [false, true]) {
    await p.evaluate(l => SYNQUENZER.vsSet({src: 'inst', lock: l}), lock);
    await p.evaluate(() => SYNQUENZER.stop()); await sleep(100);
    await playAt(p, x, 0, H.sr, true);
    await waitBeat(p, 8.3); await p.evaluate(() => SYNQUENZER.vsFang({beat: 8.3}));
    const r = await result(p), hit = r ? want(r, mel) : 0, low = r ? want({notes: r.notes.map(n => ({...n, n: n.n + 12}))}, mel) : 0;
    if (lock) ok(hit >= 7, `Instrument, Oktave sperren an: ${hit}/${mel.length} in der gespielten Oktave`);
    else ok(low >= 6 && hit <= 1, `Instrument ohne Sperre: Unteroktave erkannt (${low}/${mel.length} eine Oktave tiefer) – genau das behebt der Schalter`);
    await p.evaluate(() => SYNQUENZER.vsResultDrop());
  }
  await H.br.close();
}

// G — Klick-Maske über den Lautsprecher (Fassung 2): Metronom an, Klicks +6 dB im Mikro (Übersprechen) → Noten bleiben richtig
if (!only.length || only.includes('G')) {
  const res = {};
  for (const route of ['wired', 'speaker']) {
    const H = await open(); const m = await micOn(H.p, route); const p = H.p;
    await p.evaluate(bpm => { SYNQUENZER.setBpm(bpm); SYNQUENZER.setMetronome(true); }, BPM);
    const mel = [[0, 1.5, 60], [2, 1, 64], [3, 1, 64], [4, 1.5, 62], [6, 2, 57]];
    const mel2 = mel.map(([b, d, mm], k) => ({on: LEAD + b * SB, dur: d * SB, midi: mm, legato: false, rest: k ? 0.1 : 0}));
    const sig = renderVoice(mel2, {voice: 'female', seed: 4, sigma: 10, vib: [20, 40], click: 6, clickOff: LEAD, bpm: BPM});
    await playAt(p, sig.x, 0, m.sr, true);
    await waitBeat(p, 8.3); await p.evaluate(() => SYNQUENZER.vsFang({beat: 8.3}));
    const r = await result(p), vi = await p.evaluate(() => SYNQUENZER.vsInfo());
    res[route] = {hit: r ? want(r, mel) : 0, n: r ? r.notes.length : 0, masks: vi.masks};
    if (process.env.V) console.log(route, JSON.stringify(r && r.notes.map(q => [q.o, q.n])));
    await H.br.close();
  }
  ok(res.speaker.masks > 0 && res.wired.masks === 0, `Maske nur über den Lautsprecher: ${res.speaker.masks} Klicks maskiert (Kabel: ${res.wired.masks})`);
  ok(res.speaker.hit >= 5 && res.speaker.n <= 5 && res.speaker.n <= res.wired.n, `mit Maske: ${res.speaker.hit}/5 richtig, ${res.speaker.n} Noten; ohne Maske (Kabel-Weg mit Klick im Mikro): ${res.wired.hit}/5, ${res.wired.n} Noten`);
}

// H — Rolle: Teilen / Verbinden (je ein Undo), MELODIE-Clip
if (!only.length || only.includes('H')) {
  const H = await open(), p = H.p;
  await p.evaluate(() => { SYNQUENZER.setClip(5, 0, {len: 1, key: {root: 9, scale: 'aeolian'}, notes: [{t: 0, d: 2, n: 57, v: 0.8}, {t: 2, d: 1, n: 60, v: 0.7}, {t: 3, d: 1, n: 62, v: 0.9}]}); SYNQUENZER.openRoll(5, 0); });
  await sleep(300);
  await p.evaluate(() => SYNQUENZER.rollApi().selectIdx([0]));
  const u0 = await p.evaluate(() => SYNQUENZER.undoInfo().n);
  await p.evaluate(() => { const b = [...document.querySelectorAll('button')].find(x => x.textContent === 'Teilen'); b.click(); });
  let c = await p.evaluate(() => SYNQUENZER.getClip(5, 0));
  ok(c.notes.length === 4 && c.notes[0].d === 1 && c.notes[1].t === 1 && c.notes[1].n === 57, 'Teilen: 2-Schlag-Note → zwei Noten à 1 Schlag, gleiche Höhe');
  await p.evaluate(() => SYNQUENZER.rollApi().selectIdx([2, 3]));
  await p.evaluate(() => { const b = [...document.querySelectorAll('button')].find(x => x.textContent === 'Verbinden'); b.click(); });
  c = await p.evaluate(() => SYNQUENZER.getClip(5, 0));
  ok(c.notes.length === 3 && c.notes[2].t === 2 && c.notes[2].d === 2 && c.notes[2].v === 0.9, `Verbinden: zwei Noten → eine (t 2, d 2, lauteste Anschlag) – ${JSON.stringify(c.notes[2])}`);
  ok(await p.evaluate(() => SYNQUENZER.undoInfo().n) === u0 + 2, 'je ein Undo-Schritt');
  await p.evaluate(() => SYNQUENZER.undo());
  ok((await p.evaluate(() => SYNQUENZER.getClip(5, 0))).notes.length === 4, 'Undo nimmt Verbinden zurück');
  ok(!H.errs.length, 'keine Konsolenfehler ' + JSON.stringify(H.errs.slice(0, 3)));
  await H.br.close();
}
console.log(fail ? 'FAIL ' + fail : 'ALLE OK');
process.exit(fail ? 1 : 0);
