// TRP1 – Abschnitt transponieren: „nur dieser Teil/Bereich“ ±12 (Knotenpaar in song.xp), in der Tonart (Stufen, nur Noten), Oktavbereich.
// Messungen (keine Bildvergleiche): MIDI-Export, noteLog der Song-Wiedergabe, Video-Partitur, ↶ bitgleich, Speichern/Laden, Maße, Touch per CDP.
// Aufruf: node trp1-test.mjs <index.html> [fotos-Ordner]
import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
import path from 'path';
import fs from 'fs';
const file = process.argv[2]; if (!file) { console.log('Aufruf: node trp1-test.mjs <index.html> [fotos]'); process.exit(2); }
const fotos = process.argv[3] || path.join(path.dirname(file), 'fotos'); fs.mkdirSync(fotos, {recursive: true});
let bad = 0, all = 0;
const ok = (c, m, d) => { all++; if (c) console.log('OK ' + m + (d !== undefined ? ' – ' + (typeof d === 'string' ? d : JSON.stringify(d)) : '')); else { bad++; console.log('FEHLER ' + m + (d !== undefined ? ' – ' + (typeof d === 'string' ? d : JSON.stringify(d)) : '')); } };
const b = await chromium.launch({args: ['--autoplay-policy=no-user-gesture-required']});
const errs = [];
async function page(w, h) {
  const p = await b.newPage({viewport: {width: w, height: h}, deviceScaleFactor: 2, hasTouch: true, isMobile: true});
  p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto('file://' + file); await p.waitForTimeout(1800);
  p.cdp = await p.context().newCDPSession(p);
  await p.evaluate(HELP);
  return p;
}
const tDown = (p, x, y) => p.cdp.send('Input.dispatchTouchEvent', {type: 'touchStart', touchPoints: [{x, y, id: 1, radiusX: 4, radiusY: 4, force: 1}]});
const tUp = p => p.cdp.send('Input.dispatchTouchEvent', {type: 'touchEnd', touchPoints: []});
const ctr = (p, sel) => p.evaluate(s => { const e = document.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect(); return {x: r.left + r.width / 2, y: r.top + r.height / 2}; }, sel);
async function tapXY(p, x, y) { await tDown(p, x, y); await p.waitForTimeout(60); await tUp(p); await p.waitForTimeout(350); }
async function tapSel(p, sel) { const c = await ctr(p, sel); if (!c) return false; await tapXY(p, c.x, c.y); return true; }
const run = (p, fn, arg) => p.evaluate(fn, arg).catch(e => ({err: String(e)}));
// im Browser: Song mit 5 Teilen (Szenen 0 1 0 1 0), MELODIE-Clips (⇅ fest), Song-Melodie; MIDI-Leser; Long-Task-Zähler
const HELP = () => {
  window.wait = ms => new Promise(r => setTimeout(r, ms));
  window.__lt = []; try { new PerformanceObserver(l => { for (const e of l.getEntries()) window.__lt.push(Math.round(e.duration)); }).observe({entryTypes: ['longtask']}); } catch (e) {}
  window.__song = () => {
    const ft = S.tracks.findIndex(t => t && t.mel), c0 = S.tracks[1].clips[0];
    for (const s of [0, 1]) { const c = JSON.parse(JSON.stringify(c0)); c.notes = [{t: 0, d: 1, n: 72, v: .8}, {t: 2, d: 1, n: 76, v: .8}]; delete c.st; S.tracks[ft].clips[s] = c; }
    songFromChain([{scene: 0, bars: 2}, {scene: 1, bars: 2}, {scene: 0, bars: 2}, {scene: 1, bars: 2}, {scene: 0, bars: 2}]);
    const mt = S.song.melodyTrack, m = S.song.mel[mt] || (S.song.mel[mt] = melEmpty());
    for (let bar = 0; bar < 10; bar++) m.notes.push({t: bar * 4, d: 1, n: 72 + (bar % 2) * 2, v: .8}, {t: bar * 4 + 2, d: 1, n: 76, v: .8});
    m.notes.sort((a, b) => a.t - b.t); songChanged();
    return {ft, fest: S.tracks[ft].follow === false, marks: S.song.marks.slice().sort((a, b) => a.a - b.a).map(x => ({id: x.id, a: x.a, len: x.len}))};
  };
  window.__midi = () => {
    const m = buildMidi({mode: 'song'}); if (!m) return null; const by = m.bytes; let o = 14; const div = (by[12] << 8) | by[13], notes = [];
    while (o < by.length) {
      const len = (by[o + 4] << 24) | (by[o + 5] << 16) | (by[o + 6] << 8) | by[o + 7]; let p = o + 8, end = p + len, tk = 0, rs = 0, c;
      while (p < end) {
        let d = 0; do { c = by[p++]; d = (d << 7) | (c & 127); } while (c & 128); tk += d;
        let st = by[p]; if (st & 128) p++; else st = rs;
        if (st === 0xFF) { p++; let l = 0; do { c = by[p++]; l = (l << 7) | (c & 127); } while (c & 128); p += l; continue; }
        if (st === 0xF0 || st === 0xF7) { let l = 0; do { c = by[p++]; l = (l << 7) | (c & 127); } while (c & 128); p += l; continue; }
        rs = st; const hi = st & 0xF0, ch = st & 15, a = by[p++], b2 = hi === 0xC0 || hi === 0xD0 ? 0 : by[p++];
        if (hi === 0x90 && b2 > 0) notes.push({ch, b: +(tk / div).toFixed(4), n: a});
      }
      o = end;
    }
    return notes;
  };
  window.__pick = (N, lo, hi) => N.filter(x => x.b >= lo - 1e-6 && x.b < hi - 1e-6).map(x => x.ch + '@' + (x.b - lo).toFixed(3) + ':' + x.n).sort();
  window.__st = () => JSON.stringify({xp: S.song.xp, marks: S.song.marks, mel: S.song.mel});
  window.__play = async (bars) => {
    SYNQUENZER.clearLog(); songPlayFrom(0); await wait(60); const off = R.songPlay ? R.songPlay.off : 0; await wait(bars * 1000 + 600); SYNQUENZER.stop(); await wait(200);
    return SYNQUENZER.noteLog(8192).filter(e => e.src !== 'click' && e.src !== 'audition' && e.beat != null).map(e => ({t: e.track, b: +(e.beat - off).toFixed(3), n: e.out, src: e.src, dr: S.tracks[e.track].kind === 'drum'}));
  };
};

/* ---------- 1 Kern: Teil 3 von 5 „nur dieser Teil +3“ (MIDI, Wiedergabe, Video, Rückung dahinter, ↶ bitgleich, Speichern/Laden) ---------- */
{
  const P = await page(428, 926);
  const A = await run(P, async () => {
    SYNQUENZER.setBpm(240); const K = __song(), ms = K.marks, o = {K};
    SYNQUENZER.jam2.rkSet(ms[4].id, 2);                                  // eine spätere Rückung hinter Teil 3
    const N0 = __midi(), st0 = __st(), sg0 = JSON.stringify(S.song), u0 = UNDO.length; o.xp0 = JSON.stringify(S.song.xp);
    __lt.length = 0; const t0 = performance.now();
    o.ok = SYNQUENZER.trp1.set({a: 4, b: 6, r: 3}); o.ms = +(performance.now() - t0).toFixed(1); o.lt = __lt.slice();
    o.xp = S.song.xp.map(x => [x.beat, x.semi]); o.undoN = UNDO.length - u0; o.rk5 = SYNQUENZER.jam2.rk(ms[4].id).r; o.rk3 = SYNQUENZER.jam2.rk(ms[2].id).r;
    const N1 = __midi(), drum = s => s.filter(x => x.startsWith('9@')), syn = s => s.filter(x => !x.startsWith('9@'));
    const sh = (s, d) => s.map(x => { const [k, n] = x.split(':'); return k + ':' + (+n + d); }).sort();
    const pa = (N, k) => __pick(N, k * 8, k * 8 + 8);
    o.p3 = JSON.stringify(sh(syn(pa(N0, 2)), 3)) === JSON.stringify(syn(pa(N1, 2))); o.n3 = syn(pa(N1, 2)).length;
    o.d3 = JSON.stringify(drum(pa(N0, 2))) === JSON.stringify(drum(pa(N1, 2))); o.nd3 = drum(pa(N1, 2)).length;
    o.same = [0, 1, 3, 4].map(k => JSON.stringify(pa(N0, k)) === JSON.stringify(pa(N1, k)));
    o.fest = syn(pa(N1, 2)).filter(x => x.startsWith(midiCh(K.ft) + '@')).length; o.festFlag = K.fest;
    o.mel = S.song.mel[S.song.melodyTrack].notes.filter(x => x.t >= 16 && x.t < 24).map(x => x.n);
    // Video-Tastatur (vvkScore) = MIDI
    const vs = vvkScore(0, S.song.bars); o.vk = vs ? (() => { let k = 0, okk = 0; for (let i = 0; i < vs.tr.length; i++) for (const x of vs.tr[i] || []) if (x.s >= 16 - 1e-6 && x.s < 24 - 1e-6) { k++; if (N1.some(q => Math.abs(q.b - x.s) < 1e-3 && q.n === x.n)) okk++; } return [okk, k]; })() : null;
    // ↶ bitgleich, ↷, Speichern/Laden
    undo(); await wait(80); o.undoSt = __st() === st0; o.undoSong = JSON.stringify(S.song) === sg0;
    redo(); await wait(80); o.redoXp = JSON.stringify(S.song.xp.map(x => [x.beat, x.semi])) === JSON.stringify(o.xp);
    const j = serializeProject(); applyProject(normalizeProject(JSON.parse(j)), {ui: true}); await wait(300); o.load = serializeProject() === j;
    return o;
  });
  ok(A.ok === true && A.undoN === 1, '„nur dieser Teil +3“ auf Teil 3 von 5: ausgeführt, genau ein ↶-Schritt', A);
  ok(JSON.stringify(A.xp) === JSON.stringify([[16, 3], [24, 0], [32, 2]]), 'Knotenpaar in song.xp: Takt 5 → +3, Takt 7 → wieder 0, Rückung Teil 5 (+2) bleibt', JSON.stringify(A.xp));
  ok(A.p3 && A.n3 > 5, 'MIDI-Export: alle Ton-Noten in Teil 3 um +3', A.n3 + ' Noten');
  ok(A.d3 && A.nd3 > 5, 'MIDI-Export: Drums in Teil 3 unverändert', A.nd3 + ' Schläge');
  ok(A.same.every(Boolean), 'MIDI-Export: Teile 1, 2, 4, 5 bit-gleich wie vorher (auch die Rückung von Teil 5)', A.same);
  ok(A.festFlag && A.fest > 0, 'Spur mit ⇅ fest (MELODIE-Clips) rückt in Teil 3 mit (wie die Rückung)', A.fest + ' Noten');
  ok(A.rk5 === 2 + 0 && A.rk3 === 3, 'Rückungs-Anzeige: Teil 3 +3, Teil 5 behält +2', {rk3: A.rk3, rk5: A.rk5});
  ok(JSON.stringify(A.mel) === JSON.stringify([75, 79, 77, 79]), 'Song-Melodie in Teil 3 +3 (Daten), davor/dahinter gleich', A.mel);
  ok(A.vk && A.vk[1] > 5 && A.vk[0] === A.vk[1], 'Video-Tastatur (Partitur) = MIDI in Teil 3', A.vk);
  ok(A.undoSt && A.undoSong, '↶ stellt song.xp, mark.rk/rkx und song.mel bit-gleich wieder her (ganzer Song-JSON gleich)', {st: A.undoSt, song: A.undoSong});
  ok(A.redoXp && A.load, '↷ wieder da; Speichern/Laden bit-gleich', {redo: A.redoXp, load: A.load});
  ok(!A.lt.length && A.ms < 50, 'kein Long Task > 50 ms beim Transponieren', A.ms + ' ms, Long Tasks ' + JSON.stringify(A.lt));
  // Wiedergabe (noteLog): Teil 3 (Szene 0) = Teil 1 (Szene 0) + 3, Drums gleich, Song-Melodie +3
  const PL = await run(P, async () => {
    const L = await __play(10), A = L.filter(e => e.b >= 0 && e.b < 8), B = L.filter(e => e.b >= 16 && e.b < 24);
    const key = e => e.t + '@' + (e.b % 8).toFixed(3) + ':' + e.src, by = new Map(); for (const e of A) { const k = key(e); (by.get(k) || by.set(k, []).get(k)).push(e.n); }
    let syn = 0, synOk = 0, dr = 0, drOk = 0, mel = 0, melOk = 0;
    for (const e of B) { const a = by.get(key(e)); if (!a) continue; if (e.dr) { dr++; if (a.includes(e.n)) drOk++; } else if (e.src === 'melody') { mel++; if (a.includes(e.n - 3)) melOk++; } else { syn++; if (a.includes(e.n - 3)) synOk++; } }
    return {syn, synOk, dr, drOk, mel, melOk, nA: A.length, nB: B.length};
  });
  ok(PL.syn > 5 && PL.synOk === PL.syn, 'Song-Wiedergabe: Teil 3 klingt +3 gegen Teil 1 (gleiche Szene) – wie MIDI', PL.synOk + '/' + PL.syn);
  ok(PL.dr > 5 && PL.drOk === PL.dr, 'Song-Wiedergabe: Drums gleich', PL.drOk + '/' + PL.dr);
  ok(PL.mel >= 2 && PL.melOk === PL.mel, 'Song-Wiedergabe: Song-Melodie in Teil 3 +3', PL.melOk + '/' + PL.mel);
  // Oktavbereich, Grenze ±12, Bereich (A–B) statt Teil
  const O = await run(P, async () => {
    const o = {}; const K = __song(); SYNQUENZER.jam2.rkSet(K.marks[4].id, 2); await wait(50);
    o.oct = [7, -7, 6, 12, 4].map(r => SYNQUENZER.trp1.oct(r)); o.octD = [4, -4, 3].map(r => SYNQUENZER.trp1.oct(r, true));
    o.s1 = SYNQUENZER.trp1.set({a: 4, b: 6, r: 7, oct: true}); o.xp1 = S.song.xp.map(x => [x.beat, x.semi]); o.last = SYNQUENZER.trp1.state().last; undo(); await wait(50);
    o.s2 = SYNQUENZER.trp1.set({a: 4, b: 6, r: 12}); o.s3 = SYNQUENZER.trp1.set({a: 5, b: 6, r: 1}); o.xp3 = S.song.xp.map(x => [x.beat, x.semi]); o.max = Math.max(...S.song.xp.map(x => Math.abs(x.semi)));
    undo(); await wait(50); const N0 = __midi();
    o.s4 = SYNQUENZER.trp1.set({a: 3, b: 5, r: -2}); o.xp4 = S.song.xp.map(x => [x.beat, x.semi]); const N1 = __midi();
    const syn = s => s.filter(x => !x.startsWith('9@')), sh = (s, d) => s.map(x => { const [k, n] = x.split(':'); return k + ':' + (+n + d); }).sort();
    o.rg = JSON.stringify(sh(syn(__pick(N0, 12, 20)), -2)) === JSON.stringify(syn(__pick(N1, 12, 20))) && JSON.stringify(__pick(N0, 20, 40)) === JSON.stringify(__pick(N1, 20, 40)) && JSON.stringify(__pick(N0, 0, 12)) === JSON.stringify(__pick(N1, 0, 12));
    o.rk = S.song.marks.slice().sort((a, b) => a.a - b.a).map(m => [m.rk || 0, m.rkx || null]);
    undo(); return o;
  });
  ok(JSON.stringify(O.oct) === '[-5,5,6,0,4]' && JSON.stringify(O.octD) === '[-3,3,3]', 'Oktavbereich halten: +7 → −5, −7 → +5, +6 bleibt, +12 → 0; Stufen +4 → −3', {ht: O.oct, st: O.octD});
  ok(O.s1 === true && JSON.stringify(O.xp1) === JSON.stringify([[16, -5], [24, 0], [32, 2]]) && O.last.r0 === 7 && O.last.r === -5 && (7 - O.last.r) % 12 === 0, 'Teil 3 „+7, Oktavbereich halten“ → −5, dieselbe Tonklasse', JSON.stringify(O.xp1));
  ok(O.s2 === true && O.s3 === false && O.max <= 12, 'Summe der Knoten bleibt ≤ ±12 (zweites +1 auf +12 abgelehnt)', {xp: O.xp3});
  ok(O.s4 === true && JSON.stringify(O.xp4) === JSON.stringify([[12, -2], [20, 0], [32, 2]]) && O.rg, 'Bereich Takt 4–5 −2 (über die Teil-Grenze): nur diese Takte im MIDI, Rest gleich', JSON.stringify(O.xp4));
  ok(O.rk[1][1] && O.rk[1][1][0][0] === 1 && O.rk[2][0] === -2 && O.rk[2][1] && O.rk[2][1][0][0] === 1 && O.rk[2][1][0][1] === 0, 'feste Spuren: Stand nur in den Takten des Bereichs versetzt (rkx im Teil)', JSON.stringify(O.rk));
  await P.close();
}

/* ---------- 2 In der Tonart (Stufen): Kern C-Dur, Teil 3 +1 Stufe in MIDI/Wiedergabe/Video, Gesang-Meldung, Speichern/Laden ---------- */
{
  const P = await page(428, 926);
  const D = await run(P, async () => {
    const T = SYNQUENZER.trp1, o = {};
    o.cd = [60, 64, 71, 65, 61].map(n => T.deg(n, 1, 0, 'ionian')); o.ht = 64 + 1; o.am = [69, 71].map(n => T.deg(n, 2, 9, 'aeolian')); o.dn = [60, 62].map(n => T.deg(n, -1, 0, 'ionian'));
    SYNQUENZER.setBpm(240); const K = __song(), ms = K.marks; const N0 = __midi(), st0 = __st(), u0 = UNDO.length;
    o.s = T.set({a: 4, b: 6, r: 1, deg: true}); o.trs = S.song.marks.find(m => m.id === ms[2].id).trs; o.undoN = UNDO.length - u0; o.xp = JSON.stringify(S.song.xp || []);
    const k = {root: o.trs[1], scale: o.trs[2]}, N1 = __midi();
    const ex = s => s.map(x => { const [kk, n] = x.split(':'); return kk.startsWith('9@') ? x : kk + ':' + T.deg(+n, 1, k.root, k.scale); }).sort();
    o.p3 = JSON.stringify(ex(__pick(N0, 16, 24))) === JSON.stringify(__pick(N1, 16, 24)); o.n3 = __pick(N1, 16, 24).filter(x => !x.startsWith('9@')).length;
    o.moved = __pick(N0, 16, 24).filter((x, i) => x !== __pick(N1, 16, 24)[i]).length;
    o.rest = JSON.stringify(__pick(N0, 0, 16)) === JSON.stringify(__pick(N1, 0, 16)) && JSON.stringify(__pick(N0, 24, 40)) === JSON.stringify(__pick(N1, 24, 40));
    o.mel = S.song.mel[S.song.melodyTrack].notes.filter(x => x.t >= 16 && x.t < 24).map(x => x.n); o.melX = [72, 76, 74, 76].map(n => T.deg(n, 1, k.root, k.scale));
    const vs = vvkScore(0, S.song.bars); let vk = 0, vOk = 0; for (let i = 0; i < vs.tr.length; i++) for (const x of vs.tr[i] || []) if (x.s >= 16 - 1e-6 && x.s < 24 - 1e-6) { vk++; if (N1.some(q => Math.abs(q.b - x.s) < 1e-3 && q.n === x.n)) vOk++; } o.vk = [vOk, vk];
    undo(); await wait(80); o.undo = __st() === st0; redo(); await wait(80);
    const j = serializeProject(); applyProject(normalizeProject(JSON.parse(j)), {ui: true}); await wait(300); o.load = serializeProject() === j && JSON.stringify(S.song.marks.find(m => m.id === ms[2].id).trs) === JSON.stringify(o.trs);
    __song();
    // Gesang/Audio im Teil: bei „Stufe“ bleibt er (nur Halbtöne) – Meldung; die STIMME-Spur verschiebt der Stufen-Kern nie
    const st = window.stimmeT; window.stimmeT = () => 2; o.sv = T.set({a: 4, b: 6, r: 2, deg: true}); o.vox = T.state().last.vox; o.msg = trp1Msg('Nur Teil 3'); window.stimmeT = st;
    const tr = S.tracks[2], had = tr.stimme; tr.stimme = true; o.vocP = trp1P(S.song, 2, 17, 64, 64, S.key, null); tr.stimme = had; o.drP = trp1P(S.song, DRUM_T, 17, 36, 36, S.key, null);
    o.vt = T.set({a: 3, b: 5, r: 1, deg: true});                        // halber Teil: nur ganze Teile
    return o;
  });
  ok(JSON.stringify(D.cd.slice(0, 3)) === '[62,65,72]' && D.ht === 65, 'Kern C-Dur +1 Stufe: C→D, E→F, H→C; Halbton +1: E→F', D.cd);
  ok(D.cd[3] === 67 && D.cd[4] === 63 && JSON.stringify(D.am) === '[72,74]' && JSON.stringify(D.dn) === '[59,60]', 'Stufen: F→G, C♯→D♯ (leiterfremd behält Abstand), a-Moll A+2→C, −1: C→H, D→C', {cd: D.cd, am: D.am, dn: D.dn});
  ok(D.s === true && D.trs && D.trs[0] === 1 && D.undoN === 1 && D.xp === '[]', 'Teil 3 „+1 Stufe“: an der Marke gemerkt (Stufe, Tonart), song.xp unberührt, ein ↶', {trs: D.trs, xp: D.xp});
  ok(D.p3 && D.n3 > 5 && D.moved > 3, 'MIDI-Export: jede Ton-Note in Teil 3 eine Stufe höher in der Tonart des Teils, Drums gleich', D.n3 + ' Noten, ' + D.moved + ' geändert');
  ok(D.rest, 'MIDI-Export: alle anderen Teile unverändert');
  ok(JSON.stringify(D.mel) === JSON.stringify(D.melX), 'Song-Melodie in Teil 3 eine Stufe höher (Daten)', D.mel);
  ok(D.vk[1] > 5 && D.vk[0] === D.vk[1], 'Video-Tastatur (Partitur) = MIDI in Teil 3 (Stufen)', D.vk);
  ok(D.load && D.undo, 'Speichern/Laden behält die Stufe; ↶ bit-gleich', {load: D.load, undo: D.undo});
  ok(D.sv === true && D.vox && /Gesang bleibt \(geht nur in Halbtönen\)/.test(D.msg), 'Gesangs-Take im Teil + „Stufe“: ehrliche Meldung', D.msg);
  ok(D.vocP === 64 && D.drP === 36, 'STIMME-Spur und Drums: der Stufen-Kern lässt sie aus (Gesang nur in Halbtönen)', {voc: D.vocP, dr: D.drP});
  ok(D.vt === false, 'In der Tonart: nur ganze Teile (halber Bereich abgelehnt mit Meldung)');
  const PL = await run(P, async () => {
    __song(); await wait(50);
    const T = SYNQUENZER.trp1; T.set({a: 4, b: 6, r: 1, deg: true}); const m = S.song.marks.find(x => x.a === 4), k = {root: m.trs[1], scale: m.trs[2]};
    const L = await __play(10), A = L.filter(e => e.b >= 0 && e.b < 8), B = L.filter(e => e.b >= 16 && e.b < 24);
    const key = e => e.t + '@' + (e.b % 8).toFixed(3) + ':' + e.src, by = new Map(); for (const e of A) { const kk = key(e); (by.get(kk) || by.set(kk, []).get(kk)).push(e.n); }
    let syn = 0, synOk = 0, dr = 0, drOk = 0;
    for (const e of B) { const a = by.get(key(e)); if (!a) continue; if (e.dr) { dr++; if (a.includes(e.n)) drOk++; } else if (e.src !== 'melody') { syn++; if (a.some(n => T.deg(n, 1, k.root, k.scale) === e.n)) synOk++; } }
    return {syn, synOk, dr, drOk, lt: __lt.filter(x => x > 50)};
  });
  ok(PL.syn > 5 && PL.synOk === PL.syn, 'Song-Wiedergabe: Teil 3 klingt eine Stufe höher als Teil 1 (gleiche Szene) – wie MIDI', PL.synOk + '/' + PL.syn);
  ok(PL.dr > 5 && PL.drOk === PL.dr, 'Song-Wiedergabe (Stufe): Drums gleich', PL.drOk + '/' + PL.dr);
  await P.close();
}

/* ---------- 3 Bedienung per Touch: hochkant 428×926, quer 926×428 und 926×370 (Maße, im Bild, 3 Tipps, Bereich-Leiste, Guide) ---------- */
for (const [w, h, n] of [[428, 926, 'hochkant'], [926, 428, 'quer'], [926, 370, 'quer-370']]) {
  const P = await page(w, h);
  const K = await run(P, async () => { SYNQUENZER.setBpm(240); const K = __song(); setSongView(true); await wait(400); return K; });
  const lay = await run(P, () => svLayoutInfo());
  const mk = lay.marks.find(x => x.id === K.marks[2].id);
  await tapXY(P, lay.canvas.x + (mk.x0 + mk.x1) / 2, lay.canvas.y + lay.rulerH / 2); let taps = 1;
  const tab = await run(P, () => (UI.pop && UI.pop.name === 'mark' ? UI.pop.el.dataset.wgt : null));
  if (tab !== 'a') { await tapSel(P, '.wg-tabs [data-t="a"]'); taps++; }
  const M = await run(P, () => {
    const p = UI.pop && UI.pop.el, vw = innerWidth, vh = innerHeight; if (!p) return null; const pr = p.getBoundingClientRect();
    const bs = [...p.querySelectorAll('[data-trm]')].map(x => { const r = x.getBoundingClientRect(); return {t: x.textContent, w: Math.round(r.width), h: Math.round(r.height), in: r.left >= -.5 && r.right <= vw + .5 && r.top >= -.5 && r.bottom <= vh + .5, vis: r.width > 0 && getComputedStyle(x).visibility !== 'hidden'}; });
    return {bs, pop: {t: Math.round(pr.top), b: Math.round(pr.bottom), l: Math.round(pr.left), r: Math.round(pr.right)}, vw, vh, inline: !!p.querySelector('.trp1-in'), sw: p.scrollWidth <= p.clientWidth + 1};
  });
  ok(M && M.bs.length === 3 && M.bs.every(x => x.w >= 44 && x.h >= 44 && x.in && x.vis), 'Marken-Blatt › Ablauf: „ab hier │ nur dieser Teil │ Mehr ▾“ ≥ 44 px, im Bild (' + n + ')', M ? M.bs.map(x => x.t + ' ' + x.w + '×' + x.h).join(', ') + (M.inline ? ' · in der Rückungs-Zeile' : ' · eigene Zeile') : 'fehlt');
  ok(M && M.pop.t >= 0 && M.pop.b <= M.vh && M.sw, 'Marken-Blatt bleibt oben/unten im Bild, kein waagrechtes Rollen (' + n + '; Rahmen links/rechts wie 4.68.0)', M && M.pop);
  if (n !== 'hochkant') ok(M && M.inline, 'quer: die neuen Tasten sitzen in der Rückungs-Zeile – das Blatt wird nicht höher (' + n + ')', M && M.pop);
  await P.screenshot({path: path.join(fotos, 'trp1-markenblatt-' + n + '.png')});
  await tapSel(P, '.msheet .trp1-more'); taps++;
  const S1 = await run(P, () => {
    const p = UI.pop && UI.pop.name === 'trp1' ? UI.pop.el : null, vw = innerWidth, vh = innerHeight; if (!p) return null; const pr = p.getBoundingClientRect();
    const bs = [...p.querySelectorAll('button')].filter(x => x.getBoundingClientRect().width > 0).map(x => { const r = x.getBoundingClientRect(); return [x.textContent, Math.round(r.width), Math.round(r.height), r.left >= -.5 && r.right <= vw + .5 && r.top >= -.5 && r.bottom <= vh + .5]; });
    const t0 = performance.now(); p._paint(); const pm = +(performance.now() - t0).toFixed(2);
    return {n: bs.length, small: bs.filter(x => (x[1] < 44 || x[2] < 44) && x[0] !== '✕'), out: bs.filter(x => !x[3]), pop: [Math.round(pr.top), Math.round(pr.bottom), Math.round(pr.left), Math.round(pr.right)], vh, vw, pm, h4: p.querySelector('h4').textContent};
  });
  ok(S1 && S1.n >= 29 && !S1.small.length && !S1.out.length && S1.pop[0] >= 0 && S1.pop[1] <= S1.vh, 'Blatt „Transponieren“: −12 … +12, Halbtöne │ in der Tonart, Oktavbereich – alle ≥ 44 px, nichts ragt aus dem Bild (' + n + ')', S1 && {n: S1.n, klein: S1.small, raus: S1.out, pop: S1.pop, h4: S1.h4});
  ok(S1 && S1.pm < 16, 'Blatt neu zeichnen < 16 ms (' + n + ')', S1 && S1.pm + ' ms');
  await P.screenshot({path: path.join(fotos, 'trp1-blatt-' + n + '.png')});
  await tapSel(P, '.pop.trp1p [data-tv="3"]'); taps++;
  const R1 = await run(P, () => ({xp: (S.song.xp || []).map(x => [x.beat, x.semi]), pop: UI.pop ? UI.pop.name : null, toast: [...document.querySelectorAll('.toast,#toast')].map(x => x.textContent).join(' | ')}));
  ok(taps <= 3 && JSON.stringify(R1.xp) === JSON.stringify([[16, 3], [24, 0]]), 'Höchstens 3 Tipps vom Teil bis zum Ergebnis: Marke › Mehr ▾ › +3 = nur Teil 3 +3 (' + n + ')', taps + ' Tipps, ' + JSON.stringify(R1.xp));
  ok(/Nur .* \+3 Halbt\S*ne – danach wie vorher/.test(R1.toast), 'Meldung nach dem Transponieren (' + n + ')', R1.toast.slice(0, 140));
  // „nur dieser Teil“ in der Zeile: Marke › nur dieser Teil › −2
  await run(P, async () => { undo(); closePop(); await wait(100); });
  const lay2 = await run(P, () => svLayoutInfo()); const mk2 = lay2.marks.find(x => x.id === K.marks[1].id);
  await tapXY(P, lay2.canvas.x + (mk2.x0 + mk2.x1) / 2, lay2.canvas.y + lay2.rulerH / 2); let t2 = 1;
  if (await run(P, () => (UI.pop && UI.pop.el.dataset.wgt)) !== 'a') { await tapSel(P, '.wg-tabs [data-t="a"]'); t2++; }
  await tapSel(P, '.msheet [data-trm="nur"]'); t2++;
  await tapSel(P, '.msheet .j2rk [data-trv="-2"]'); t2++;
  const R2 = await run(P, () => ({xp: (S.song.xp || []).map(x => [x.beat, x.semi]), only: SYNQUENZER.trp1.state().only, lab: (document.querySelector('.msheet .j2rk .j2rk-l small') || {}).textContent}));
  ok(t2 <= 3 && JSON.stringify(R2.xp) === JSON.stringify([[8, -2], [16, 0]]) && R2.only && R2.lab === 'nur Teil', 'Zeile „nur dieser Teil“ + −2 in 3 Tipps: nur Teil 2 −2, danach wieder 0 (' + n + ')', t2 + ' Tipps, ' + JSON.stringify(R2.xp));
  await run(P, async () => { undo(); SYNQUENZER.trp1.opts({only: false}); closePop(); await wait(100); });
  // Bereich-Leiste › ⋯ › Transponieren …
  await run(P, async () => { SV.sel = {a: 4, b: 5}; rangeBarSync(); UI.dirty.song = true; await wait(250); });
  await tapSel(P, '#rangeBar [data-a="more"]');
  const RB = await run(P, () => { const x = document.querySelector('.pop [data-a="trp1"]'); if (!x) return null; const r = x.getBoundingClientRect(), pr = x.closest('.pop').getBoundingClientRect(); return {t: x.textContent, w: Math.round(r.width), h: Math.round(r.height), in: r.top >= 0 && r.bottom <= innerHeight && r.left >= 0 && r.right <= innerWidth, pop: [Math.round(pr.top), Math.round(pr.bottom)], vh: innerHeight}; });
  ok(RB && RB.w >= 44 && RB.h >= 44 && RB.in && RB.pop[1] <= RB.vh, 'Bereich-Leiste › ⋯: „⇅ Transponieren …“ ≥ 44 px, im Bild (' + n + ')', RB);
  await P.screenshot({path: path.join(fotos, 'trp1-bereich-' + n + '.png')});
  await tapSel(P, '.pop [data-a="trp1"]');
  const RS = await run(P, () => ({name: UI.pop ? UI.pop.name : null, h4: UI.pop ? (UI.pop.el.querySelector('h4') || {}).textContent : null}));
  await tapSel(P, '.pop.trp1p [data-tv="-1"]');
  const RX = await run(P, () => (S.song.xp || []).map(x => [x.beat, x.semi]));
  ok(RS.name === 'trp1' && /Takt 5–6/.test(RS.h4 || '') && JSON.stringify(RX) === JSON.stringify([[16, -1], [24, 0]]), 'Bereich-Leiste öffnet dasselbe Blatt für A–B; −1 nur auf Takt 5–6 (' + n + ')', {h4: RS.h4, xp: RX});
  if (n === 'hochkant') {
    await run(P, async () => { undo(); closePop(); SV.sel = null; rangeBarSync(); await wait(100); });
    const G = await run(P, async () => { const E = ui1Entries().find(x => x.id === 'trp1'); if (!E) return null; E.go(); await wait(400); return {n: E.n, w: E.w, more: !!document.querySelector(E.q), only: SYNQUENZER.trp1.state().only, words: /Marke|Mehr|Bereich|Tonart/.test(E.w + E.d), marken: /\b(Cubase|Logic|Ableton|Live|Bitwig|Studio One|FL)\b/.test(E.n + E.w + E.d)}; });
    ok(G && G.more && G.only && G.words && !G.marken, 'Guide „Wo finde ich …?“: Eintrag „' + (G && G.n) + '“ öffnet das Marken-Blatt mit der Stelle', G && G.w);
  }
  await P.close();
}
ok(!errs.length, 'keine Seitenfehler', errs.slice(0, 4));
console.log('ERGEBNIS ' + (all - bad) + '/' + all + (bad ? ' – ' + bad + ' FEHLER' : ''));
await b.close();
process.exit(bad ? 1 : 0);
