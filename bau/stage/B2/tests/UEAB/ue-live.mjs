// UE-05 Noten im Video (offline) = Noten live (Anzahl gleich, ±1 ms) · UE-06 Scheduler-Zeit ohne/mit 8 Übergängen ·
// UE-04 Projekt ohne Übergänge byte-gleich zur Basis 4.30.0 · North-Pads spielen den Übergang
import { open, SONG16, OUT } from './lib.mjs';
import path from 'path'; import fs from 'fs'; import { fileURLToPath } from 'url';
const here = path.dirname(fileURLToPath(import.meta.url));
const BASE = process.env.BASE || path.resolve(here, '../../../../snapshots/R-4300.html');
const R = []; const ok = (name, pass, info) => { R.push({name, pass: !!pass, info}); console.log((pass ? 'OK  ' : 'FEHL') + ' ' + name + (info !== undefined ? ' ' + JSON.stringify(info) : '')); };
const {b, p, errs} = await open({});
await p.evaluate(s => SYNQUENZER.setSong(s), SONG16);
const mine = await p.evaluate(() => SYNQUENZER.serialize());   // UE-04 (unten): frischer Zustand
await p.evaluate(() => { SYNQUENZER.uePlace('p-tom-kurz', 'M2'); SYNQUENZER.uePlace('p-snare-lauf', 'M3'); SYNQUENZER.uePlace('p-becken-stopp', 'M4'); });
const spb = await p.evaluate(() => 60 / S.bpm);
// ---------- UE-05: offline (Video-Weg) Takte 3–14
const off = await p.evaluate(async () => { const r = await SYNQUENZER.vvRender({range: {a: 2, b: 14}}); return r.log.filter(e => e.track === 4).map(e => ({src: e.src, n: e.out, v: e.vel, sb: +(e.beat + 8).toFixed(6)})); });
// live: dieselben Takte über den echten Kontext
await p.evaluate(() => { clearLog(); SYNQUENZER.songPlay(2); window.__off = R.songPlay.off; });
await p.waitForFunction(() => R.songPlay && songBeatOf(t2b(AU.ctx.currentTime)) > 14 * 4 + 1, null, {timeout: 60000, polling: 200});
const live = await p.evaluate(() => { const o = window.__off; const l = noteLog(4096).filter(e => e.track === 4).map(e => ({src: e.src, n: e.out, v: e.vel, sb: +(e.beat - o).toFixed(6)})); SYNQUENZER.songPlay(false); return l; });
const inR = e => e.sb >= 8 - 1e-6 && e.sb < 56 - 1e-6;
const U0 = off.filter(e => e.src === 'ue' && inR(e)), U1 = live.filter(e => e.src === 'ue' && inR(e));
let dmax = 0; for (let k = 0; k < Math.min(U0.length, U1.length); k++) dmax = Math.max(dmax, Math.abs(U0[k].sb - U1[k].sb) * spb * 1000);
ok('UE-05 Übergangs-Noten offline = live (Anzahl, ±1 ms)', U0.length === U1.length && U0.length > 0 && dmax <= 1 && U0.every((e, k) => e.n === U1[k].n), {offline: U0.length, live: U1.length, maxMs: +dmax.toFixed(3)});
const A0 = off.filter(inR), A1 = live.filter(inR);
ok('UE-05 alle Drum-Noten offline = live (Anzahl)', A0.length === A1.length, {offline: A0.length, live: A1.length});
// ---------- UE-06: Scheduler-Zeit (perfProbe-artig): scheduleTrack aller Spuren (+ Übergänge vormerken/einmischen) über 64 Takte in
// 0,25-Schlag-Fenstern, Klangerzeugung ausgeschaltet (drumHit/spawnClipVoice = leer) – Basis 4.30.0 gegen neu (ohne / mit 8 Übergängen)
const SONG18 = {bars: 18, lanes: [[{bar: 0, slot: 0}], [{bar: 0, slot: 0}], [], [], [{bar: 0, slot: 0}], []], carrier: [], mel: {},
  marks: Array.from({length: 9}, (_, k) => ({id: 'M' + (k + 1), a: k * 2, len: 2, name: k % 2 ? 'Refrain' : 'Strophe'}))};
const PROBE = async pg => pg.evaluate(async () => {
  SYNQUENZER.songPlay(0); await new Promise(r => setTimeout(r, 300));
  const dh = window.drumHit, sv = window.spawnClipVoice; let nh = 0; window.drumHit = () => { nh++; return null; }; window.spawnClipVoice = () => { nh++; return null; };
  const has = typeof ueTick === 'function', b0 = R.schedBeat + 1, runs = [];
  try {
    for (let rep = 0; rep < 7; rep++) {
      const t0 = performance.now();
      for (let w = 0; w < 18 * 4 * 4 * 24 * 6; w++) {   // ≈ 60 ms je Lauf (Zeitgeber-Raster 0,1 ms fällt weg)
        const a = b0 + (w % (18 * 16)) * .25, e = a + .25;
        if (has && S.song.ue) ueTick(a, e);
        for (let i = 0; i < NT(); i++) scheduleTrack(i, a, e);
        if (has && UE.pend.length) ueFlush();
      }
      runs.push(performance.now() - t0);
    }
  } finally { window.drumHit = dh; window.spawnClipVoice = sv; SYNQUENZER.songPlay(false); }
  runs.sort((x, y) => x - y); return {ms: +runs[1].toFixed(3), hits: nh / 7 / 6};   // zweitbester von 7 Läufen (ms; Störungen durch GC/Zeitgeber fallen weg)
});
const ob = await open({app: BASE, browser: b});   // dieselbe Browser-Instanz (sonst misst man die Instanz mit)
const o8 = await open({browser: b});                 // eigene Seite mit 8 Übergängen (kein Umschalten während der Messung)
await ob.p.evaluate(s => SYNQUENZER.setSong(s), SONG18);
await p.evaluate(s => SYNQUENZER.setSong(s), SONG18);
await o8.p.evaluate(s => SYNQUENZER.setSong(s), SONG18);
await o8.p.evaluate(() => { for (const m of S.song.marks.slice(1)) SYNQUENZER.uePlace(['p-tom-kurz', 'p-snare-lauf'][+m.id.slice(1) % 2], m.id); });
const n8 = await o8.p.evaluate(() => SYNQUENZER.ueList().length);
// reihum messen (Basis, neu ohne, neu mit 8), je der beste Wert
const MB = [], M0 = [], M8 = [];
for (let r = 0; r < 5; r++) { MB.push(await PROBE(ob.p)); M0.push(await PROBE(p)); M8.push(await PROBE(o8.p)); }
const best = L => L.reduce((x, y) => (y.ms < x.ms ? y : x));
const B_ = best(MB), O_ = best(M0), E_ = best(M8), mb = B_.ms, m0 = O_.ms, m8 = E_.ms;
const per0 = m0 / O_.hits, per8 = m8 / E_.hits;   // ms je geplanter Note
await o8.p.context().close();
await ob.p.evaluate(s => SYNQUENZER.setSong(s), SONG16);
const theirs = await ob.p.evaluate(() => SYNQUENZER.serialize());
ok('UE-06 ohne Übergänge gleich zur Basis (±5 %)', Math.abs(m0 - mb) <= mb * .05 && B_.hits === O_.hits, {basis_ms: mb, neu_ms: m0, noten: [B_.hits, O_.hits]});
ok('UE-06 mit 8 Übergängen höchstens +10 % (Stoppuhr, bester von 5 Läufen)', n8 === 8 && m8 <= m0 * 1.10, {ohne_ms: m0, mit_ms: m8, plus: +((m8 / m0 - 1) * 100).toFixed(1) + ' %', noten: [O_.hits, E_.hits], je_note_us: [+(per0 * 1000).toFixed(3), +(per8 * 1000).toFixed(3)]});
// ---------- North: ein Modell-Pad (Quelle MD) spielt den Übergang
await p.evaluate(s => SYNQUENZER.setSong(s), SONG16);
await p.evaluate(() => SYNQUENZER.uePlace('p-tom-kurz', 'M2'));
const nr = await p.evaluate(async () => { SYNQUENZER.setPadSource('tomH', 'md'); await new Promise(r => setTimeout(r, 1500)); const r = await SYNQUENZER.vvRender({range: {a: 2, b: 6}}); SYNQUENZER.setPadSource('tomH', 'drum'); return {ue: r.log.filter(e => e.src === 'ue').map(e => e.out), info: SYNQUENZER.padSource('tomH')}; });
ok('North: Übergang spielt auch mit einem North-Pad (gleiches Noten-Log)', nr.ue.length === 8 && nr.ue.filter(n => n === 50).length === 3, nr);
// ---------- UE-04: Projekt ohne Übergänge byte-gleich zur Basis 4.30.0 (bis auf die Zufalls-IDs, die auch zwischen zwei Läufen der Basis wechseln)
const strip = s => { const o = JSON.parse(s); delete o.sum; return JSON.stringify(o).replace(/"(id|uid)":"[^"]*"/g, '"$1":""'); };
ok('UE-04 Projekt ohne Übergänge: Datei byte-gleich zu 4.30.0 (ohne Zufalls-IDs)', strip(mine) === strip(theirs), {len: [mine.length, theirs.length]});
ok('keine Fehler in der Konsole', errs.length === 0, errs.slice(0, 5));
fs.writeFileSync(OUT + '/ue-live.json', JSON.stringify(R, null, 1));
console.log('ERGEBNIS', R.filter(x => x.pass).length + '/' + R.length);
await b.close();
