// V2d acceptance (FANG TEIL, memory, part playback, part tap in the song): N7S-11 … N7S-18, N7S-25, N7S-25b, V2d-01/05b/08/13
import { open } from './v3-v2d-pw.mjs';
import { eq, mkCheck } from './v3-v2d-lib.mjs';
const {check, done} = mkCheck();
const {b, p, errs} = await open();
const E = (f, a) => p.evaluate(f, a);
const waitBeat = (x, ms = 40000) => p.waitForFunction(x => window.SYNQUENZER.runtime().beat > x, x, {timeout: ms, polling: 30});
const proj = () => E(() => { const pr = window.SYNQUENZER.project(); const P = pr.project || pr; return JSON.stringify({song: P.song, parts: P.parts, clips: P.tracks.map(t => t.clips), sc: P.scenes}); });
const fresh = () => E(() => { const Q = window.SYNQUENZER; Q.stop(); Q.newProject({init: true}); Q.setBpm(240); return 1; });
// a song made only of Träger entries (one chord name per bar; '' = no change), played from bar 1
const chordSong = (names, bars) => E(([names, bars]) => { const Q = window.SYNQUENZER; const car = []; names.forEach((n, k) => { if (n) car.push({beat: k * 4, target: Q.parseChord(n)}); });
  Q.setSong({bars: bars || names.length + 2, lanes: [[], [], [], [], [], []], carrier: car}); Q.songPlay(0); return 1; }, [names, bars]);
// ---- N7S-14: the cases 1–9 of song-delta 4.2 (fangClose) ----
const cases = [
  {id: '1', seq: 'Am F C G Am', t: 16 + 1.2, bar: 4, rule: 'struktur', ch: 'Am F C G'},
  {id: '2', seq: 'Am F C G Am', t: 16 + 3.2, bar: 4, rule: 'struktur', ch: 'Am F C G'},
  {id: '3', seq: 'Am F C G Am', t: 12 + 3.4, bar: 4, rule: 'struktur', ch: 'Am F C G'},
  {id: '3b', seq: 'Am F C G Am', t: 12 + .4, bar: 4, rule: 'struktur', ch: 'Am F C G'},
  {id: '4', seq: 'Am F C G Am F C G Am', t: 32 + 1.2, bar: 8, rule: 'struktur', ch: 'Am F C G', len: 4},
  {id: '5', seq: 'Am', t: 24 + 1.6, bar: 6, rule: 'zeit', ch: 'Am', len: 1, extra: 6},
  {id: '5b', seq: 'Am', t: 24 + 2.4, bar: 7, rule: 'zeit', ch: 'Am', len: 1, extra: 6},
  {id: '6', seq: 'Am F Dm G E Am7 C', t: 24 + 1.6, bar: 6, rule: 'zeit', ch: 'Am F Dm G E Am7', len: 6},
  {id: '6b', seq: 'Am F Dm G E Am7 C', t: 24 + 2.4, bar: 7, rule: 'zeit', ch: 'Am F Dm G E Am7 C', len: 7},
  {id: '7', seq: 'Am F C G Am F C G F G C C F G C C F', t: 64 + .8, bar: 16, rule: 'struktur', ch: 'F G C C', len: 4},
  {id: '9', seq: 'Am F C Am F C Am', t: 24 + 1.2, bar: 6, rule: 'struktur', ch: 'Am F C', len: 3},
];
const groups = {};
for (const c of cases) (groups[c.seq] = groups[c.seq] || []).push(c);
for (const seq of Object.keys(groups)) {
  await fresh();
  const names = seq.split(' '); const cs = groups[seq];
  await chordSong(names, names.length + 1 + (cs[0].extra || 0));
  await waitBeat(Math.max(...cs.map(c => c.t)) + .3);
  for (const c of cs) {
    const r = await E(t => window.SYNQUENZER.fangClose({beat: t}), c.t);
    const ok = r.bar === c.bar && r.rule === c.rule && r.chords.join(' ') === c.ch && (c.len == null || r.len === c.len);
    check('N7S-14 Fall ' + c.id, ok, {bar: r.bar, rule: r.rule, len: r.len, period: r.period, chords: r.chords.join(' ')});
  }
}
// ---- N7S-12 Xander's case (4.2 Nr. 8) + N7S-11 memory + N7S-25 part with lanes in a circle ----
await fresh();
await E(() => { const Q = window.SYNQUENZER, N = (t, n, d) => ({t, d: d || .5, n, v: .8}), K = {root: 9, scale: 'aeolian'};
  Q.setClip(0, 3, {len: 1, key: K, notes: [N(0, 45), N(2, 52)]});      // BASS Sz4
  Q.setClip(1, 1, {len: 2, key: K, notes: [N(0, 60, 2)]});              // FL Sz2
  Q.setClip(2, 2, {len: 1, key: K, notes: [N(0, 72, .25), N(2, 76, .25)]});   // SEQ Sz3
  Q.setClip(4, 0, {len: 1, key: K, notes: [{t: 0, d: .1, n: 36, v: .9}]});   // DR Sz1
  const C = n => Q.parseChord(n), ch = ['Am', 'F', 'C', 'G', 'Am', 'F', 'C', 'G', 'Am', 'Am', 'Am', 'Am'];
  Q.setSong({bars: 12, lanes: [[{bar: 0, slot: 3}, {bar: 4, slot: -1}, {bar: 6, slot: 3}], [{bar: 0, slot: 1}], [{bar: 2, slot: 2}], [], [{bar: 0, slot: 0}], []],
    carrier: ch.map((n, k) => ({beat: k * 4, target: C(n)}))});
  Q.songPlay(0); return 1; });
await waitBeat(32.35);
const before12 = await proj();
const mem = await E(() => window.SYNQUENZER.memory());
const b5 = mem.bars.find(x => x.bar === 4), b2 = mem.bars.find(x => x.bar === 2);
check('N7S-11 memory(): je Takt slots, cs, own, Träger', b5 && eq(b5.slots.slice(0, 5), [-1, 1, 2, -1, 0]) && b2.slots[2] === 2 && b2.cs[2] === 8 && Array.isArray(b5.own) && b5.carrier && b5.carrier.name === 'Am', {b2, b5});
await E(() => window.SYNQUENZER.fangTeil({beat: 32.28}));
const fp = await E(() => window.SYNQUENZER.fangPart());
check('N7S-12 Lanes DR/FL/SEQ/BASS', fp && eq(fp.lanes[4], [{bar: 0, slot: 0}]) && eq(fp.lanes[1], [{bar: 0, slot: 1}]) && eq(fp.lanes[2], [{bar: 0, slot: -1}, {bar: 2, slot: 2}]) && eq(fp.lanes[0], [{bar: 0, slot: 3}, {bar: 4, slot: -1}, {bar: 6, slot: 3}]), fp && fp.lanes);
check('N7S-12 Akkorde Am F C G Am F C G, len 8, Ende {bar 8, struktur}', fp && fp.chords.ch.map(c => c.tg ? c.tg.name : 'O').join(' ') === 'Am F C G Am F C G' && fp.len === 8 && fp.end.bar === 8 && fp.end.rule === 'struktur', fp && {ch: fp.chords.ch.map(c => c.b + (c.tg ? c.tg.name : 'O')), len: fp.len, end: fp.end});
check('Blatt „Teil gefangen“ offen, Zeile Ende + Clips', await E(() => { const s = document.querySelector('.pop.fsheet'); return !!s && /Ende Taktstrich 9 · 7 % in Takt 9/.test(s.textContent) && /SEQ|S3 Sz3 ab T3/.test(s.textContent); }), await E(() => { const s = document.querySelector('.pop.fsheet'); return s ? s.querySelector('.fs-end').textContent + ' | ' + s.querySelector('.fs-cl').textContent : null; }));
check('N7S-12 Daten unverändert, solange nur gefangen', (await proj()) === before12);
const u0 = await E(() => window.SYNQUENZER.undoInfo().n);
await E(() => window.SYNQUENZER.fangAccept('part'));
const ui = await E(() => window.SYNQUENZER.undoInfo());
const parts = await E(() => window.SYNQUENZER.parts());
check('[ALS TEIL ✓] = ein Undo part, Teil STROPHE', ui.n === u0 + 1 && ui.top.kind === 'part' && parts[0] && parts[0].name === 'Strophe' && parts[0].len === 8 && eq(parts[0].lanes[0], fp.lanes[0]), {top: ui.top, name: parts[0] && parts[0].name});
await waitBeat(36.3);
check('Kreis läuft als Teil weiter (STROPHE, Phase von E)', (await E(() => { const r = window.SYNQUENZER.runtime().part; return r && r.i === 0 && r.startBeat === 32; })), await E(() => window.SYNQUENZER.runtime().part));
// N7S-25: tap the part key (song stops first), the bass is silent in part bars 5–6 of every pass, restarts in 7
await E(() => { const Q = window.SYNQUENZER; Q.stop(); Q.clearLog(); Q.launchPart(0); return 1; });
await waitBeat(64.3, 60000);
const bass = await E(() => window.SYNQUENZER.noteLog(1000).filter(n => n.track === 0 && n.beat != null).map(n => n.beat));
const inRest = bass.filter(x => { const pb = ((x % 32) + 32) % 32; return pb >= 16 - 1e-6 && pb < 24 - 1e-6; });
check('N7S-25 Bass stumm in Teil-Takt 5–6 jedes Durchlaufs, Neustart in 7', inRest.length === 0 && [0, 24, 32, 56].every(x => bass.some(y => Math.abs(y - x) < .002)), bass);
await E(() => window.SYNQUENZER.stop());
// ---- N7S-13 phase ----
await fresh();
await E(() => { const Q = window.SYNQUENZER, K = {root: 9, scale: 'aeolian'};
  Q.setClip(4, 1, {len: 2, key: K, notes: [{t: 0, d: .1, n: 36, v: .9}, {t: 4.5, d: .1, n: 38, v: .9}, {t: 6, d: .1, n: 42, v: .9}]});
  const C = n => Q.parseChord(n);
  Q.setSong({bars: 12, lanes: [[], [], [], [], [{bar: 0, slot: 1}], []], carrier: [{beat: 12, target: C('Am')}, {beat: 16, target: C('F')}, {beat: 20, target: C('C')}, {beat: 24, target: C('G')}]});
  Q.clearLog(); Q.songPlay(0); return 1; });
await waitBeat(28.3);
await E(() => window.SYNQUENZER.fangTeil({beat: 28.2}));
let f13 = await E(() => window.SYNQUENZER.fangPart());
check('N7S-13 lanes[DR][0].ph === 4', f13 && f13.lanes[4][0].ph === 4 && f13.start === 3, f13 && {l: f13.lanes[4], st: f13.start});
const capt = await E(() => window.SYNQUENZER.noteLog(400).filter(n => n.track === 4 && n.beat >= 12 - 1e-6 && n.beat < 28).map(n => +(n.beat - 12).toFixed(3)));
await E(() => window.SYNQUENZER.fangAccept('part'));
await E(() => { const Q = window.SYNQUENZER; Q.stop(); Q.clearLog(); Q.launchPart(0); });
await waitBeat(16.3);
const loop = await E(() => window.SYNQUENZER.noteLog(400).filter(n => n.track === 4 && n.beat >= -1e-6 && n.beat < 16).map(n => +n.beat.toFixed(3)));
check('N7S-13 Teil-Taste: Drum-Noten an denselben Stellen relativ zum Teil-Anfang (±0,002)', capt.length > 0 && capt.length === loop.length && capt.every((x, k) => Math.abs(x - loop[k]) <= .002), {capt, loop});
await E(() => window.SYNQUENZER.stop());
// ---- N7S-15 Übernahme phasengleich (Fall 1) + N7S-16 frozen at E1 (Fall 3) ----
await fresh();
await chordSong(['Am', 'F', 'C', 'G', 'Am', 'Am', 'Am', 'Am', 'Am', 'Am'], 12);
await waitBeat(17.25);
await E(() => window.SYNQUENZER.fangTeil({beat: 17.2}));
await waitBeat(28.4);
const capc = await E(() => window.SYNQUENZER.memory().capc.filter(c => c.beat >= 16 - 1e-6 && c.beat < 28.5).map(c => c.beat + ':' + (c.target ? c.target.name : 'O')));
check('N7S-15 ab Schlag 20 F (Teil-Takt 2), kein zweites Am', capc.includes('20:F') && capc.includes('24:C') && capc.includes('28:G') && !capc.includes('20:Am'), capc);
await E(() => window.SYNQUENZER.fangDiscard());
await fresh();
await E(() => { const Q = window.SYNQUENZER, K = {root: 9, scale: 'aeolian'}; Q.setClip(0, 0, {len: 1, key: K, notes: [{t: 0, d: .5, n: 45, v: .8}]}); return 1; });
await chordSong(['Am', 'F', 'C', 'G', 'Am'], 8);
await waitBeat(15.42);
await E(() => { const Q = window.SYNQUENZER; Q.fangTeil({beat: 15.4}); Q.launchClip(0, 0); return 1; });
const f16 = await E(() => window.SYNQUENZER.fangPart());
check('N7S-16 Ende E1 (Taktstrich 5), Clip-Start nach dem Tipp nicht in den Lanes', f16 && f16.end.bar === 4 && f16.end.rule === 'struktur' && eq(f16.lanes[0], [{bar: 0, slot: -1}]), f16 && {end: f16.end, l0: f16.lanes[0]});
check('N7S-16 Zeile Ende sagt „zu früh, zählt“', await E(() => /85 % in Takt 4 gedrückt \(zu früh, zählt\)/.test(document.querySelector('.pop.fsheet .fs-end').textContent)));
// ---- V2d-08 Verwerfen ----
const pv = await proj();
await E(() => window.SYNQUENZER.fangDiscard());
const nb = await E(() => Math.floor(window.SYNQUENZER.runtime().beat / 4) * 4 + 4);
await waitBeat(nb + .4);
const rt8 = await E(() => window.SYNQUENZER.runtime());
check('V2d-08 [Verwerfen]: Kreis endet am nächsten Takt, Daten unverändert', !rt8.part && (!rt8.row || rt8.row.src !== 'PF') && (await proj()) === pv, {part: rt8.part, row: rt8.row});
await E(() => window.SYNQUENZER.stop());
// ---- N7S-17 names ----
await fresh();
await chordSong(['Am', 'F', 'C', 'G', 'Am', 'F', 'C', 'G', 'Am'], 16);
await waitBeat(16.4);
await E(() => window.SYNQUENZER.fangTeil({beat: 16.3}));
let nm1 = (await E(() => window.SYNQUENZER.fangPart())).suggest.name;
await E(() => window.SYNQUENZER.fangAccept('part'));
await E(() => window.SYNQUENZER.fangTeil({beat: 16.3}));
let nm2 = (await E(() => window.SYNQUENZER.fangPart())).suggest.name;
check('N7S-17 erster Fang „Strophe“, zweiter „Refrain“', nm1 === 'Strophe' && nm2 === 'Refrain', [nm1, nm2]);
await p.click('.pop.fsheet button[data-n="Strophe"]');
const dupBtns = await E(() => [...document.querySelectorAll('.pop.fsheet button[data-dup]')].map(x => x.textContent));
check('N7S-17 zweiter Strophen-Fang: [＋ Strophe 2] (Standard) und [⟳ Strophe ersetzen]', eq(dupBtns, ['＋ Strophe 2', '⟳ Strophe ersetzen']) && (await E(() => window.SYNQUENZER.fangPart().suggest.name)) === 'Strophe 2', dupBtns);
const t13 = await E(() => window.SYNQUENZER.fangName('Abcdefghijklm'));
const t0 = await E(() => window.SYNQUENZER.fangName(''));
check('N7S-17 Freitext 13 → 12 Zeichen, leer → Vorschlag', t13 === 'Abcdefghijkl' && t0 === 'Refrain', [t13, t0]);
await E(() => { const Q = window.SYNQUENZER; Q.fangName('Refrain'); Q.fangAccept('part'); Q.fangTeil({beat: 16.3}); Q.fangName('Refrain', 'new'); Q.fangAccept('part'); return 1; });
await p.waitForTimeout(300);
const keys = await E(() => [...document.querySelectorAll('#partBar .pk .pn')].map(x => x.textContent));
check('N7S-17 Teil-Taste ≤ 8 Zeichen, sonst Kurzform („REFRAIN 2“ → „REF2“)', keys.includes('REF2') && keys.includes('STROPHE') && keys.includes('REFRAIN'), keys);
// ⟳ ersetzen + [＋ Ans Song-Ende] (group [part, song])
await E(() => window.SYNQUENZER.fangTeil({beat: 16.3}));
const pr0 = await proj(), uA = await E(() => window.SYNQUENZER.undoInfo().n);
await E(() => window.SYNQUENZER.fangAccept('end'));
const uB = await E(() => window.SYNQUENZER.undoInfo());
const sg = await E(() => window.SYNQUENZER.song());
check('[＋ Ans Song-Ende] = ein Undo group [part, song], Marke am Ende', uB.n === uA + 1 && uB.top.kind === 'group' && eq(uB.top.items, ['part', 'song']) && sg.marks.length >= 1 && sg.marks[sg.marks.length - 1].a + sg.marks[sg.marks.length - 1].len === sg.bars, {top: uB.top, marks: sg.marks, bars: sg.bars});
await E(() => window.SYNQUENZER.undo());
check('[＋ Ans Song-Ende] Undo deep-equal', (await proj()) === pr0);
await E(() => window.SYNQUENZER.stop());
// ---- N7S-18 EN7-09 ----
await fresh();
await E(() => { const Q = window.SYNQUENZER, K = {root: 9, scale: 'aeolian'}; Q.setClip(0, 0, {len: 1, key: K, notes: [{t: 0, d: .5, n: 45, v: .8}]}); Q.setClip(0, 1, {len: 1, key: K, notes: [{t: 0, d: .5, n: 47, v: .8}]}); Q.setKbMode('play'); Q.launchClip(0, 0); return 1; });
await waitBeat(2);
await E(() => window.SYNQUENZER.launchClip(0, 1));
await waitBeat(6.5);
const m18a = await E(() => [window.SYNQUENZER.runtime().fangMode, document.getElementById('bFang').textContent]);
await E(() => window.SYNQUENZER.tap(60, 120));
await p.waitForTimeout(200);
const m18b = await E(() => [window.SYNQUENZER.runtime().fangMode, document.getElementById('bFang').textContent]);
check('N7S-18 nur Clip-Wechsel, keine Note seit 8 s → „FANG TEIL“; nach einer Note „FANG“', m18a[0] === 'teil' && /TEIL/.test(m18a[1]) && m18b[0] === 'fang' && !/TEIL/.test(m18b[1]), [m18a, m18b]);
// ---- V2d-01 label in TRANSPONIEREN, lit after chord changes ----
await E(() => window.SYNQUENZER.setKbMode('transpose'));
await p.waitForTimeout(150);
const lab = await E(() => [document.getElementById('bFang').textContent, window.SYNQUENZER.runtime().fangTeil]);
check('V2d-01 TRANSPONIEREN: „FANG TEIL“, leuchtet nach Wechseln', /FANG\s*TEIL/.test(lab[0]) && lab[1] === true, lab);
// ---- V2d-05b hand latched → FANG TEIL ends the hand, ♪ SPIELEN blinks ----
await E(() => { const Q = window.SYNQUENZER; Q.setLatch(true); Q.keyOn(57); Q.keyOn(60); Q.keyOn(64); return 1; });
await p.waitForTimeout(150); await E(() => { const Q = window.SYNQUENZER; Q.keyOff(57); Q.keyOff(60); Q.keyOff(64); });
await E(() => window.SYNQUENZER.fangTeil());
const b05 = await E(() => [document.getElementById('segPlay').classList.contains('blink2'), window.SYNQUENZER.runtime().kbMode, document.getElementById('toast').textContent]);
const nb5 = await E(() => Math.floor(window.SYNQUENZER.runtime().beat / 4) * 4 + 4);
await waitBeat(nb5 + .3);
const r05 = await E(() => window.SYNQUENZER.runtime().row);
check('V2d-05b Hand endet (Kreis führt den Träger), Modus bleibt, ♪ SPIELEN blinkt, Hinweis', b05[0] && b05[1] === 'transpose' && /Drüberspielen/.test(b05[2]) && r05 && r05.src === 'PF' && !r05.hand, {b05, r05});
await E(() => window.SYNQUENZER.fangDiscard());
// ---- V2d-13 CAPC older than 10 s ----
await waitBeat(44);
const capc13 = await E(() => window.SYNQUENZER.memory().capc);
check('V2d-13 CAPC hält Träger-Wechsel älter als 10 s', capc13.length && capc13[0].beat === 0 && (await E(() => window.SYNQUENZER.runtime().beat)) > 40, capc13.length);
await E(() => window.SYNQUENZER.stop());
// ---- N7S-25b part tap while the song plays ----
await fresh();
await E(() => { const Q = window.SYNQUENZER, K = {root: 9, scale: 'aeolian'}; Q.setClip(0, 0, {len: 1, key: K, notes: [{t: 0, d: .5, n: 45, v: .8}]});
  Q.setPart(0, {name: 'Strophe', slots: [{s: 0}, -1, -1, -1, -1, -1]}); Q.setPart(1, {name: 'Refrain', slots: [-1, -1, -1, -1, -1, -1]});
  Q.setSong({bars: 14, lanes: [[{bar: 0, slot: 0}], [], [], [], [], []], carrier: [], marks: [{a: 2, len: 4, part: 'P1'}, {a: 8, len: 4, part: 'P1'}]}); Q.songPlay(0); return 1; });
const p25 = await proj();
await waitBeat(4.5);
await E(() => window.SYNQUENZER.partTap(0));
await waitBeat(8.3);
const o1 = await E(() => window.SYNQUENZER.runtime().song);
await waitBeat(24.5);
await E(() => window.SYNQUENZER.partTap(0));
await waitBeat(28.3);
const o2 = await E(() => window.SYNQUENZER.runtime().song);
check('N7S-25b in T2 → ab T3 die Marke; in T7 → ab T9', o1.off === 0 && o2.off === -4 && Math.floor(o2.beat / 4) === 8, {o1: [o1.off, o1.beat], o2: [o2.off, o2.beat]});
await E(() => window.SYNQUENZER.partTap(1));
await p.waitForTimeout(300);
const o3 = await E(() => window.SYNQUENZER.runtime().song);
check('N7S-25b Teil ohne Marke → Hand-Übernahme ([↩ SONG])', o3.override.some(Boolean) || o3.carrierLive, o3.override);
check('N7S-25b project() deep-equal', (await proj()) === p25);
await E(() => window.SYNQUENZER.stop());
check('0 Konsolenfehler', errs.length === 0, errs);
await b.close();
process.exit(done() ? 1 : 0);
