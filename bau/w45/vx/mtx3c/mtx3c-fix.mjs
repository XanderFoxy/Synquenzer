// MTX3C Nachbesserung (Prüf-Befunde 1 + 2): Zusammenlegen in der Melodie-Spur markiert das Projekt (markDirty), Band-Ende schneidet die Einzelspur
// wie DRUMS (run.cutE). Aufruf: node mtx3c-fix.mjs <index.html>
import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
const file = process.argv[2]; const b = await chromium.launch(); const res = [];
const ok = (n, c, i) => { res.push(!!c); console.log((c ? 'OK     ' : 'FEHLER ') + n + (i !== undefined ? ' · ' + JSON.stringify(i) : '')); };
const ctx = await b.newContext({viewport: {width: 428, height: 926}, hasTouch: true, isMobile: true, deviceScaleFactor: 2}); const p = await ctx.newPage(); const errs = [];
p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
await p.goto('file://' + file); await p.waitForTimeout(1600);
const r = await p.evaluate(() => {
  const o = {}; const split = SYNQUENZER.mtx3.split(), j = split.find(x => S.tracks[x].dvx.v === 'hatC'); o.j = j;
  SYNQUENZER.songFromChain([{scene: 0, bars: 2}]); setMelodyTrack(j);
  const md0 = markDirty; let n = 0; markDirty = function () { n++; return md0.apply(this, arguments); };
  try {
    const m = curMel(S.song); m.notes.push({t: 4, d: .1, n: 42, v: .5});
    const nt = {t: 4.02, d: .2, n: 42, v: .9}, r1 = mtx3cMelC({dr3: 1}, nt);
    o.mel = {ret: r1, v: m.notes.find(x => x.t === 4).v, n: m.notes.length, dirty: n};
    n = 0; const sr = {notes: [{b: 2, d: .1, n: 42, nc: 42, v: .4}]}, r2 = mtx3cMelC({dr3: 1, sr}, {t: 2.03, d: .2, n: 42, v: .7});
    o.take = {ret: r2, v: sr.notes[0].v, dirty: n};
    n = 0; const r3 = mtx3cMelC({dr3: 1}, {t: 6, d: .2, n: 42, v: .7}); o.neu = {ret: r3, dirty: n};   // kein Doppelgriff: melCommit legt ab (markDirty dort)
  } finally { markDirty = md0; }
  // Band-Ende: run mit t0 4 / tEnd 8 → bei from ≥ tEnd genau ein Schnitt am Band-Ende (wie DRUMS)
  const run = {t0: 4, tEnd: 8, cut: new Set([j]), cutE: new Set()}, bro = beg1RunOf, ct = cutTrackAt, cuts = [];
  beg1RunOf = () => run; cutTrackAt = (i, t) => cuts.push([i, +t.toFixed(4)]);
  try {
    const tg = {dr: DRUM_T}, w1 = mtx3cBegSched(j, 6, 7, tg), w2 = mtx3cBegSched(j, 8, 9, tg), w3 = mtx3cBegSched(j, 9, 10, tg), w0 = mtx3cBegSched(j, 2, 5, tg);
    o.cut = {w0, w1, w2, w3, cuts, want: [j, +b2t(8).toFixed(4)], other: mtx3cBegSched(DRUM_T === 0 ? 1 : 0, 8, 9, tg)};
  } finally { beg1RunOf = bro; cutTrackAt = ct; }
  return o;
});
console.log(JSON.stringify(r));
ok('Doppelgriff in der Melodie-Spur: ein Schlag, der lautere bleibt, Projekt geändert (markDirty 1×)', r.mel.ret === true && r.mel.v === .9 && r.mel.n === 1 && r.mel.dirty === 1, r.mel);
ok('Doppelgriff in den Take-Noten einer Song-Aufnahme: wie melCommit nur Anzeige (markDirty 0×)', r.take.ret === true && r.take.v === .7 && r.take.dirty === 0, r.take);
ok('einzelne Taste: melCommit legt ab (Haken gibt false)', r.neu.ret === false && r.neu.dirty === 0, r.neu);
ok('Band-Ende: Einzelspur wird bei tEnd einmal geschnitten (wie DRUMS), Fenster wie vorher', JSON.stringify(r.cut.cuts) === JSON.stringify([r.cut.want]) && r.cut.w1 === null && JSON.stringify(r.cut.w2) === '[8,9]' && JSON.stringify(r.cut.w3) === '[9,10]' && JSON.stringify(r.cut.w0) === '[2,4]', r.cut);
ok('keine Konsolenfehler', errs.length === 0, errs.slice(0, 3));
await b.close(); console.log(res.every(Boolean) ? 'ALLES OK ' + res.length : 'FEHLER ' + res.filter(x => !x).length + ' von ' + res.length);
