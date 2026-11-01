// UE-A Kern: Daten, Haken, Abspielen (offline = Video-Weg), Undo, Speichern/Laden, KON, GarageBand-Instrumental
// Aufruf: node ue-kern.mjs   (APP=… für eine andere Datei)
import { open, SONG16, OUT } from './lib.mjs';
import fs from 'fs';
const R = []; const ok = (name, pass, info) => { R.push({name, pass: !!pass, info}); console.log((pass ? 'OK  ' : 'FEHL') + ' ' + name + (info !== undefined ? ' ' + JSON.stringify(info) : '')); };
const {b, p, errs} = await open({});
await p.evaluate(s => { SYNQUENZER.setSong(s); }, SONG16);
const spb = await p.evaluate(() => 60 / S.bpm);
// Drum-Log eines Offline-Renders (Video-Weg) in Song-Schlägen
const drumLog = async (range) => p.evaluate(async rg => {
  const r = await SYNQUENZER.vvRender({range: rg});
  return {log: r.log.filter(e => e.track === 4).map(e => ({src: e.src, n: e.out, v: +e.vel.toFixed(3), beat: e.beat})), peak: r.peak, rms: r.rms};
}, range);
// ---------- UE-01: Fill an Kante 8|9 (½ Takt, ersetzt) → in Schlägen 30–32 nur Fill-Treffer, außerhalb Unterschied 0
const L0 = await drumLog({a: 6, b: 10});
const id = await p.evaluate(() => SYNQUENZER.uePlace('p-tom-kurz', 'M3'));
const L1 = await drumLog({a: 6, b: 10});
// beat des Logs = Transport-Schlag; Song-Schlag = beat + 24 (Render ab Takt 7 = Schlag 24)
const sb = e => +(e.beat + 24).toFixed(3);
const inW = e => sb(e) >= 30 - 1e-3 && sb(e) < 32 - 1e-3;
const out0 = L0.log.filter(e => !inW(e)).map(e => [sb(e), e.n, e.v].join()), out1 = L1.log.filter(e => !inW(e)).map(e => [sb(e), e.n, e.v].join());
const win1 = L1.log.filter(inW);
ok('UE-01 außerhalb 30–32 gleich', JSON.stringify(out0) === JSON.stringify(out1), {n0: out0.length, n1: out1.length});
ok('UE-01 in 30–32 nur Fill-Treffer', win1.length === 8 && win1.every(e => e.src === 'ue'), {n: win1.length, src: [...new Set(win1.map(e => e.src))], noten: win1.map(e => e.n)});
ok('UE-01 Fill-Treffer auf den 16teln', win1.every((e, k) => Math.abs(sb(e) - (30 + k * .25)) < .001 / spb), win1.map(sb));
// ---------- UE-02: Kit-Wechsel → Klang neu, UE-Daten gleich
const h0 = await p.evaluate(() => JSON.stringify(SYNQUENZER.ueList()));
await p.evaluate(() => SYNQUENZER.loadKit('Gated 84'));
const L2 = await drumLog({a: 6, b: 10});
const h1 = await p.evaluate(() => JSON.stringify(SYNQUENZER.ueList()));
const kitInfo = await p.evaluate(() => ({kit: drumSnd().p.kit && drumSnd().p.kit.name || drumSnd().name, tomH: slotParams('tomH').frq}));
ok('UE-02 UE-Daten nach Kit-Wechsel gleich', h0 === h1);
ok('UE-02 Fill spielt mit dem neuen Kit (gleiche Treffer, anderer Klang)', L2.log.filter(inW).length === 8 && Math.abs(L2.rms - L1.rms) > 1e-4, {rms1: +L1.rms.toFixed(5), rms2: +L2.rms.toFixed(5), kitInfo});
await p.evaluate(() => SYNQUENZER.undo());   // Kit zurück
// ---------- UE-03: 2 Takte vor der Kante einfügen → Kante 8 → 10; Teil verschieben; Teil löschen + 1 Undo
const edgeOf = () => p.evaluate(i => { const e = SYNQUENZER.ueList().find(x => x.id === i); if (!e) return null; const m = S.song.marks.find(x => x.id === e.m); return m ? m.a : null; }, id);
const snapA = await p.evaluate(() => JSON.stringify(S.song));
await p.evaluate(() => SYNQUENZER.songRange('insertEmpty', 2, 3));
let e3 = await edgeOf();
if (e3 !== 10) { await p.evaluate(() => SYNQUENZER.undo()); await p.evaluate(() => { const s = S.song; songEdit('2 Takte leer eingefügt', song => opInsert(song, 2, {len: 2, lanes: song.lanes.map(() => [{bar: 0, slot: -1}]), carrier: [], xp: [], mel: {}, marks: []})); }); e3 = await edgeOf(); }
const hb3 = await p.evaluate(() => SYNQUENZER.ueHits().map(h => h.sb));
ok('UE-03 Einfügen davor: Kante 8 → 10, Übergang geht mit', e3 === 10 && hb3[0] === 38, {kante: e3, ersterTreffer: hb3[0]});
await p.evaluate(() => SYNQUENZER.undo());
ok('UE-03 Undo stellt bit-gleich her', snapA === await p.evaluate(() => JSON.stringify(S.song)));
// Teil (M3, Takt 8–12) ans Ende verschieben → der Übergang wandert mit
await p.evaluate(() => markAction('M3', 'move', 16));
const e3b = await edgeOf(), mv = await p.evaluate(() => S.song.marks.map(m => [m.id, m.a]));
ok('UE-03 Teil verschieben: Übergang wandert mit', e3b === 12 && mv.some(x => x[0] === 'M3' && x[1] === 12), {kante: e3b, marken: mv});
await p.evaluate(() => SYNQUENZER.undo());
await p.evaluate(() => markAction('M3', 'delete'));
const gone = await p.evaluate(() => SYNQUENZER.ueList().length);
await p.evaluate(() => SYNQUENZER.undo());
ok('UE-03 Teil löschen: Übergang weg; 1 Undo bit-gleich', gone === 0 && snapA === await p.evaluate(() => JSON.stringify(S.song)), {nachLoeschen: gone});
// ---------- UE-04: Undo/Redo, Speichern/Laden bit-gleich; ohne Übergänge byte-gleiche Datei
const u0 = await p.evaluate(() => SYNQUENZER.undoInfo().n);
await p.evaluate(() => SYNQUENZER.ueSetLen(SYNQUENZER.ueList()[0].id, 4));
const sL = await p.evaluate(() => JSON.stringify(S.song));
await p.evaluate(() => SYNQUENZER.undo()); const sU = await p.evaluate(() => JSON.stringify(S.song));
await p.evaluate(() => SYNQUENZER.redo()); const sR = await p.evaluate(() => JSON.stringify(S.song));
ok('UE-04 Länge ändern = 1 Undo; Undo/Redo bit-gleich', sU === snapA && sR === sL && (await p.evaluate(() => SYNQUENZER.undoInfo().n)) === u0 + 1);
const file = await p.evaluate(() => SYNQUENZER.serialize());
const back = await p.evaluate(async f => { await SYNQUENZER.importJSON(f); return JSON.stringify(S.song.ue); }, file);
ok('UE-04 Speichern → Laden: song.ue gleich', back === JSON.stringify(JSON.parse(sL).ue), {ue: JSON.parse(back || 'null') && JSON.parse(back).length});
fs.writeFileSync(OUT + '/ue-projekt.json', file);
// ---------- UE-10 belegte Kante = ersetzen, genau 1 Undo; UE-19 [Überall] n Kopien, verknüpft, Nur hier
await p.evaluate(s => SYNQUENZER.setSong(s), SONG16);
const n0 = await p.evaluate(() => SYNQUENZER.undoInfo().n);
const a1 = await p.evaluate(() => SYNQUENZER.uePlace('p-tom-kurz', 'M2'));
const a2 = await p.evaluate(() => SYNQUENZER.uePlace('p-snare-lauf', 'M2'));
const l10 = await p.evaluate(() => SYNQUENZER.ueList());
ok('UE-10 belegte Kante ersetzt (1 Eintrag, je 1 Undo)', l10.length === 1 && l10[0].src === 'p-snare-lauf' && (await p.evaluate(() => SYNQUENZER.undoInfo().n)) === n0 + 2);
const tw = await p.evaluate(i => SYNQUENZER.ueTwins(i), a2);
const nEv = await p.evaluate(i => SYNQUENZER.ueEverywhere(i), a2);
const l19 = await p.evaluate(() => SYNQUENZER.ueList());
ok('UE-19 Überall: Kopie an der gleichen Kante Strophe → Refrain, verknüpft', nEv === 1 && tw.join() === 'M4' && l19.length === 2 && l19[0].g && l19[0].g === l19[1].g, {tw, l19: l19.map(e => [e.id, e.m, e.g])});
await p.evaluate(i => SYNQUENZER.ueSetLen(i, 2), a2);
const l19b = await p.evaluate(() => SYNQUENZER.ueList());
ok('UE-19 Änderung gilt für alle Kopien', l19b.every(e => e.len === 2 && e.a === -2));
await p.evaluate(i => SYNQUENZER.ueUnlink(i), l19b[1].id);
await p.evaluate(i => SYNQUENZER.ueSetLen(i, 8), a2);
const l19c = await p.evaluate(() => SYNQUENZER.ueList());
ok('UE-19 Nur hier ändern löst eine Kopie', l19c.find(e => e.id === a2).len === 8 && l19c.find(e => e.id !== a2).len === 2 && !l19c.some(e => e.g));
// ---------- UE-11 Entfernen + Undo bit-gleich
const s11 = await p.evaluate(() => JSON.stringify(S.song));
await p.evaluate(i => SYNQUENZER.ueRemove(i), a2); await p.evaluate(() => SYNQUENZER.undo());
ok('UE-11 Entfernen, Rückgängig bit-gleich', s11 === await p.evaluate(() => JSON.stringify(S.song)));
// ---------- KON: Bereich mit Übergang konsolidieren → klingt gleich, Zurückholen hängt ihn wieder an
await p.evaluate(s => SYNQUENZER.setSong(s), SONG16);
await p.evaluate(() => SYNQUENZER.uePlace('p-tom-kurz', 'M2'));
const K0 = await drumLog({a: 0, b: 8});
const kon = await p.evaluate(() => SYNQUENZER.konsolidieren(0, 7, 'Block'));
const kl = await p.evaluate(() => SYNQUENZER.ueList());
const K1 = await drumLog({a: 0, b: 8});
const same = JSON.stringify(K0.log.map(e => [e.beat, e.n, e.v])) === JSON.stringify(K1.log.map(e => [e.beat, e.n, e.v]));
ok('KON: konsolidierter Bereich mit Übergang klingt gleich (Noten-Log)', !!kon && kl.length === 1 && same, {kon, ue: kl.map(e => ({m: e.m, at: e.at}))});
await p.evaluate(m => SYNQUENZER.zurueckholen(m), kon.mark);
const kr = await p.evaluate(() => SYNQUENZER.ueList());
ok('KON: Zurückholen hängt den Übergang wieder an die Kante', kr.length === 1 && kr[0].m === 'M2' && kr[0].at == null, kr.map(e => ({m: e.m, at: e.at})));
// ---------- GarageBand-Instrumental enthält den Übergang (gleicher Offline-Weg, Pegel im Fill-Fenster)
await p.evaluate(s => SYNQUENZER.setSong(s), SONG16);
const gb = async () => p.evaluate(async () => {
  const r = await ggbRender({range: {a: 2, b: 6}, pre: 0});
  const u8 = r.bytes instanceof Uint8Array ? r.bytes : new Uint8Array(r.bytes);
  // WAV 16/24 bit? -> Kopf lesen
  const dv = new DataView(u8.buffer, u8.byteOffset, u8.byteLength); let o = 12, fmt = null, data = null;
  while (o < u8.length - 8) { const id = String.fromCharCode(u8[o], u8[o + 1], u8[o + 2], u8[o + 3]), len = dv.getUint32(o + 4, true); if (id === 'fmt ') fmt = {ch: dv.getUint16(o + 10, true), sr: dv.getUint32(o + 12, true), bits: dv.getUint16(o + 22, true)}; if (id === 'data') { data = {o: o + 8, len}; break; } o += 8 + len + (len & 1); }
  const sp = 60 / S.bpm, bs = fmt.bits / 8, fr = fmt.ch * bs;
  const rms = (t0, t1) => { let s = 0, n = 0; for (let k = Math.round(t0 * fmt.sr); k < Math.round(t1 * fmt.sr); k++) { const q = data.o + k * fr; let v; if (bs === 2) v = dv.getInt16(q, true) / 32768; else if (bs === 3) { v = (u8[q] | (u8[q + 1] << 8) | (u8[q + 2] << 16)); if (v & 0x800000) v -= 0x1000000; v /= 8388608; } else v = dv.getFloat32(q, true); s += v * v; n++; } return Math.sqrt(s / Math.max(1, n)); };
  return {fmt, n: r.n, w: rms(6 * sp, 8 * sp), sig: r.sig};   // Takt 3–7: Fill-Fenster = Schlag 14–16 → im Export ab Takt 3: Schlag 6–8
});
const G0 = await gb();
await p.evaluate(() => SYNQUENZER.uePlace('p-becken-stopp', 'M2'));   // Becken + Kick auf der Eins von Takt 5, dann Stopp (ersetzt) – Fenster Schlag 16–18
const G1 = await p.evaluate(async () => {
  const r = await ggbRender({range: {a: 2, b: 6}, pre: 0}); const u8 = r.bytes instanceof Uint8Array ? r.bytes : new Uint8Array(r.bytes); return {n: r.n, len: u8.length};
});
await p.evaluate(() => SYNQUENZER.undo());
await p.evaluate(() => SYNQUENZER.uePlace('p-tom-kurz', 'M2'));
const G2 = await gb();
ok('GarageBand-Instrumental enthält den Übergang (anderer Pegel im Fill-Fenster)', Math.abs(G2.w - G0.w) > 1e-3 && G1.n > 0, {ohne: +G0.w.toFixed(4), mit: +G2.w.toFixed(4)});
// ---------- Song ohne Übergänge: kein song.ue, Datei ohne neue Felder
await p.evaluate(s => SYNQUENZER.setSong(s), SONG16);
const plain = await p.evaluate(() => SYNQUENZER.serialize());
ok('UE-04 Song ohne Übergänge: kein Feld ue in der Datei', !/"ue":/.test(plain));
fs.writeFileSync(OUT + '/plain-ueab.json', plain);
ok('keine Fehler in der Konsole', errs.length === 0, errs.slice(0, 5));
fs.writeFileSync(OUT + '/ue-kern.json', JSON.stringify(R, null, 1));
console.log('ERGEBNIS', R.filter(x => x.pass).length + '/' + R.length);
await b.close();
