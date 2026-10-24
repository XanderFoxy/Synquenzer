// T4: Ergebnis-Blatt per Tipp (Oktave ‹ ›, Einrasten, Raster frei/1/16/1/8, Bearbeiten, Verwerfen): jede Änderung sofort hörbar (noteLog
// out/Schlag), ein einziger Undo-Schritt; N7V-11 (20 ct über Gis → A / Gis) im App-Weg mit eigener Stimme.
import {open, sleep, voice, playAtBeat, waitBeat, result, calib} from './v3-qa-vs2acc-h.mjs';
let fail = 0; const ok = (c, m) => { console.log((c ? '✓ ' : '✗ ') + m); if (!c) fail++; };
const H = await open({vp: process.argv[2] || 'P1'}), p = H.p;
await p.evaluate(() => { window.__q.label = 'Headset Microphone'; });
await p.tap(await p.evaluate(() => getComputedStyle(document.getElementById('segMic')).display !== 'none') ? '#segMic' : '#bMicT');
await p.waitForFunction(() => SYNQUENZER.stimme().phase === 'live' && SYNQUENZER.vsClock().ring && SYNQUENZER.vsClock().ring.end > 0, null, {timeout: 8000});
await sleep(700); await calib(p);
await p.evaluate(() => SYNQUENZER.stimmeSheet(false)); await sleep(150);
await p.tap('#bPlay'); await sleep(50);
const SB = await p.evaluate(() => SYNQUENZER.vsClock().spb);
// Takte 2–3; Note 3 = Gis + 20 ct; Einsätze leicht neben dem Raster (+0,15 Schlag) bei Note 2 und 5
const MEL = [[4, 1, 57, 0], [5.15, 0.85, 60, 0], [6, 1.5, 68, 20], [8, 1, 64, 0], [9.15, 0.85, 62, 0], [10, 1.5, 57, 0]];
const LEAD = 0.05;
const x = voice(MEL.map(([b, d, m, ct]) => ({on: LEAD + (b - 4) * SB, dur: d * SB, m, ct})), {seed: 3, vib: 20});
await playAtBeat(p, x, 4, LEAD);
await waitBeat(p, 16.3);
await p.tap('#bFang');
let r = await result(p);
const u0 = await p.evaluate(() => SYNQUENZER.undoInfo().n);
console.log('  Clip', r && r.len, 'T', r && r.start + 1, JSON.stringify(r && r.notes.map(n => [n.t, n.o, n.n])));
const at = (rr, o) => rr.notes.find(n => Math.abs(rr.start * 4 + (n.o != null ? n.o : n.t) - 4 - o) < 0.2);
ok(r && at(r, 2) && at(r, 2).n === 69, 'N7V-11 Einrasten an: Gis+20 ct → ' + (r && at(r, 2) && at(r, 2).n) + ' (A = 69)');
const sheet = () => p.evaluate(() => { const e = document.querySelector('.pop.vsres'); return e ? e.innerText.replace(/\s+/g, ' ') : null; });
console.log('  Blatt:', await sheet());
// hörbar: Note bei Schlag ≡ o (Clip ab Takt start) – wartet, bis jede Clip-Note nach `from` einmal klang
async function heard(from, n) { await p.evaluate(() => SYNQUENZER.clearLog()); const b0 = from; await waitBeat(p, b0 + n); return p.evaluate(b0 => SYNQUENZER.noteLog(4096).filter(e => e.track === 5 && e.beat >= b0).map(e => [e.beat, e.out]), b0); }
const nowB = () => p.evaluate(() => { const c = SYNQUENZER.vsClock(); return (c.now - c.outLat - c.start) / c.spb; });
// Oktave ›
let b = await nowB(); await p.tap('.pop.vsres [data-a="op"]'); let tB = await nowB();
let lg = await heard(tB + 0.1, 16);
r = await p.evaluate(() => SYNQUENZER.vsResult());
ok(r.oct === 1 && lg.length && lg.every(([bb, out]) => [69, 72, 81, 76, 74].includes(out)), `Oktave ›: hörbar +12 ab dem Tipp (${JSON.stringify(lg.slice(0, 6))})`);
await p.tap('.pop.vsres [data-a="om"]'); await sleep(100);
// Einrasten aus
await p.tap('.pop.vsres [data-a="snap"]'); tB = await nowB();
r = await p.evaluate(() => SYNQUENZER.vsResult());
ok(!r.snap && at(r, 2) && at(r, 2).n === 68, 'N7V-11 Einrasten aus (Tipp): → ' + (at(r, 2) && at(r, 2).n) + ' (Gis = 68)');
lg = await heard(tB + 0.1, 16);
ok(lg.some(([bb, out]) => out === 68), 'Einrasten aus: Gis klingt (' + JSON.stringify(lg.slice(0, 6)) + ')');
await p.tap('.pop.vsres [data-a="snap"]'); await sleep(100);
// Raster frei → Einsatz +0,15 hörbar; 1/8 → auf 0,5
await p.tap('.pop.vsres [data-g="frei"]'); tB = await nowB();
r = await p.evaluate(() => SYNQUENZER.vsResult());
const late = at(r, 1.15);
ok(late && Math.abs(r.start * 4 + late.t - 5.15) < 0.08, 'Raster frei: Einsatz bleibt bei ' + (late && late.t));
lg = await heard(tB + 0.1, 16);
const frac = lg.map(([bb]) => +(((bb % 1) + 1) % 1).toFixed(2));
ok(frac.some(f => f > 0.05 && f < 0.25), 'Raster frei: hörbar neben dem Raster ' + JSON.stringify(lg.slice(0, 6)));
await p.tap('.pop.vsres [data-g="1/8"]'); tB = await nowB();
r = await p.evaluate(() => SYNQUENZER.vsResult());
ok(r.grid === '1/8' && r.notes.every(n => Math.abs(n.t * 2 - Math.round(n.t * 2)) < 1e-6), 'Raster 1/8: alle Einsätze auf 1/8 ' + JSON.stringify(r.notes.map(n => n.t)));
lg = await heard(tB + 0.1, 16);
ok(lg.length && lg.every(([bb]) => Math.abs(bb * 2 - Math.round(bb * 2)) < 0.02), 'Raster 1/8 hörbar ' + JSON.stringify(lg.slice(0, 6)));
await p.tap('.pop.vsres [data-g="1/16"]'); await sleep(100);
ok(await p.evaluate(() => SYNQUENZER.undoInfo().n) === u0 && await p.evaluate(() => SYNQUENZER.undoInfo().top.label) === 'Stimme', 'nach 7 Änderungen im Blatt: weiter ein Undo-Schritt');
// Bearbeiten öffnet die Rolle des Clips
const sc = r.scene;
await p.tap('.pop.vsres [data-a="edit"]'); await sleep(400);
const ed = await p.evaluate(() => { const v = SYNQUENZER.viewState ? SYNQUENZER.viewState() : null; return {pop: !!document.querySelector('.pop.vsres'), v: v && JSON.stringify(v).slice(0, 200)}; });
ok(!ed.pop, '✎ Bearbeiten schließt das Blatt, Rolle: ' + ed.v);
await p.screenshot({path: 'v3-qa-vs2acc-t4-roll.png'});
ok(!H.errs.length, 'keine Konsolenfehler ' + JSON.stringify(H.errs.slice(0, 3)));
await H.br.close();
console.log(fail ? 'FAIL ' + fail : 'ALLE OK');
