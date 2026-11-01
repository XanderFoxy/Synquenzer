// Format 5 bleibt, nur additiv: alte Projekte laden/speichern Zeichen für Zeichen gleich; song.fade übersteht Speichern/Laden;
// die Master-Kette (mit dem neuen Knoten auf 1) rechnet bitgleich zu R-4300; jede Geste = 1 Undo
import { chromium } from 'playwright';
import { open, SONG8, OUT, APP, BASE } from './sx-lib.mjs';
import fs from 'fs';
const res = {}; let ok = true;
const b = await chromium.launch({args: ['--autoplay-policy=no-user-gesture-required']});
const RICH = Object.assign({}, SONG8, {marks: [{id: 'M1', a: 0, len: 4, name: 'Strophe'}, {id: 'M2', a: 4, len: 4, part: 'S2'}], xp: [{beat: 16, semi: 2}], loop: {on: false, a: 0, b: 8}});
const MASTER = async p => p.evaluate(async () => {
  const sr = 48000, n = sr * 2, oc = new OfflineAudioContext(2, n, sr), buf = oc.createBuffer(2, n, sr); let s = 7;
  for (let c = 0; c < 2; c++) { const d = buf.getChannelData(c); for (let k = 0; k < n; k++) { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; d[k] = ((s / 4294967296) * 2 - 1) * (k < n / 2 ? .3 : 1.6) * Math.sin(k / 900); } }
  const M = FX.Master(oc); M.set(S.fxBus.master, 0); const src = oc.createBufferSource(); src.buffer = buf; src.connect(M.input); src.start(0);
  const y = await oc.startRendering(); let h = 2166136261 >>> 0; const f = new Float32Array(1), u = new Uint32Array(f.buffer);
  for (let c = 0; c < 2; c++) { const d = y.getChannelData(c); for (let k = 0; k < n; k++) { f[0] = d[k]; h = Math.imul(h ^ u[0], 16777619) >>> 0; } }
  return h.toString(16);
});
// 1) ein Projekt aus R-4300
const A = await open({browser: b, app: BASE});
await A.p.evaluate(s => SYNQUENZER.setSong(s), RICH);
const fileA = await A.p.evaluate(() => SYNQUENZER.serialize());
const baseRound = await A.p.evaluate(f => { SYNQUENZER.importJSON(f); return SYNQUENZER.serialize(); }, fileA);
const hBase = await MASTER(A.p);
// 2) dasselbe in SX126 laden und speichern
const B = await open({browser: b, app: APP});
const mineRound = await B.p.evaluate(f => { SYNQUENZER.importJSON(f); return SYNQUENZER.serialize(); }, fileA);
const hMine = await MASTER(B.p);
res.altesProjekt = {laenge: fileA.length, basisGleich: baseRound === fileA, sx126Gleich: mineRound === fileA, ohneFade: !/"fade"/.test(mineRound), format: JSON.parse(fileA).format, formatNeu: JSON.parse(mineRound).format};
res.altesProjekt.ok = res.altesProjekt.sx126Gleich && res.altesProjekt.ohneFade && res.altesProjekt.format === res.altesProjekt.formatNeu; ok = ok && res.altesProjekt.ok;
res.master = {basis: hBase, sx126: hMine, ok: hBase === hMine}; ok = ok && res.master.ok;
// 3) song.fade: 1 Undo je Geste, Speichern/Laden, alte App liest die Datei ohne Fehler
{
  const r = await B.p.evaluate(() => {
    const u0 = UNDO.length; SYNQUENZER.sx1Fade(4); const u1 = UNDO.length, out1 = SYNQUENZER.sx1Info().out;
    SYNQUENZER.sx1Fade(4); const u2 = UNDO.length;                       // gleicher Wert: keine Änderung, kein Undo
    const file = SYNQUENZER.serialize(); SYNQUENZER.undo(); const outU = SYNQUENZER.sx1Info().out; SYNQUENZER.redo(); const outR = SYNQUENZER.sx1Info().out;
    return {undoSchritte: u1 - u0, gleicherWertUndo: u2 - u1, out1, outU, outR, file, hatFade: /"fade":\{"out":16\}/.test(file)};
  });
  const C = await open({browser: b, app: APP});
  const back = await C.p.evaluate(f => { SYNQUENZER.importJSON(f); return {info: SYNQUENZER.sx1Info(), again: SYNQUENZER.serialize() === f}; }, r.file);
  const D = await open({browser: b, app: BASE});
  const old = await D.p.evaluate(f => ({ok: SYNQUENZER.importJSON(f), bars: S.song && S.song.bars}), r.file);
  res.fade = {undoSchritte: r.undoSchritte, gleicherWertUndo: r.gleicherWertUndo, out: r.out1, nachUndo: r.outU, nachRedo: r.outR, inDatei: r.hatFade, geladen: back.info.out, wiederGleich: back.again, alteApp: old, fehlerC: C.errs, fehlerD: D.errs};
  res.fade.ok = r.undoSchritte === 1 && r.gleicherWertUndo === 0 && r.out1 === 16 && r.outU === 0 && r.outR === 16 && r.hatFade && back.info.out === 16 && back.again && old.ok && old.bars === 8 && !C.errs.length && !D.errs.length;
  ok = ok && res.fade.ok;
}
// 4) ganzer Song ohne Ausblenden: R-4300 und SX126 spielen dieselben Noten (Noten-Log), gleiche Länge, gleicher Pegel je Schlag
{
  const R1 = async p => { await p.evaluate(s => SYNQUENZER.setSong(s), SONG8); return p.evaluate(async () => { const x = await SYNQUENZER.vvRender(); const r = VV.last, bs = spb(), n = Math.round(bs * r.sr), w = [];
    for (let k = 0; k + n <= r.n; k += n) { let ss = 0; for (let j = k; j < k + n; j++) ss += r.ch[0][j] * r.ch[0][j] + r.ch[1][j] * r.ch[1][j]; w.push(10 * Math.log10(ss / (2 * n) + 1e-20)); }
    return {dur: x.dur, tail: x.tail, log: JSON.stringify((r.log || []).map(e => [e.track, e.src, e.clipNote, e.out, e.beat, e.dur, e.vel])), w}; }); };
  const x = await R1(A.p), y = await R1(B.p); let md = 0; for (let k = 0; k < Math.min(x.w.length, y.w.length); k++) if (x.w[k] > -80) md = Math.max(md, Math.abs(x.w[k] - y.w[k]));
  res.render = {durBasis: x.dur, durSx126: y.dur, tailGleich: Math.abs(x.tail - y.tail) < .02, notenGleich: x.log === y.log, noten: JSON.parse(x.log).length, maxPegelDiffDb: +md.toFixed(2)};
  res.render.ok = x.dur === y.dur && res.render.notenGleich && md < .5; ok = ok && res.render.ok;
}
res.errors = A.errs.concat(B.errs); ok = ok && !res.errors.length;
console.log(JSON.stringify(res, null, 1)); console.log(ok ? 'OK' : 'FEHLER');
fs.mkdirSync(OUT, {recursive: true}); fs.writeFileSync(OUT + '/t4-format.json', JSON.stringify(res, null, 1));
await b.close(); process.exit(ok ? 0 : 1);
