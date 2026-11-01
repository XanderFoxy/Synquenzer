// HARM: Regressions-Vergleich über die Snapshots bau/snapshots/R-4*.html (+ optional weitere Dateien als Argumente)
// Prüf-Song (pruefsong.mjs) je Fall × Einstellung live abspielen, Noten-Log lesen, dazu kurz der Offline-Render (vvRender, ab 4.26)
// Ausgabe: regression.json + Tabelle (Markdown) auf stdout. Aufruf: node regression.mjs [--quick] [datei.html …]
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { open, ROOT, HERE, APP } from './lib.mjs';
import { SONG_JS, FAELLE } from './pruefsong.mjs';
import { LIVE_JS, KEYS } from './live.mjs';
const args = process.argv.slice(2), quick = args.includes('--quick');
let files = args.filter(a => !a.startsWith('--'));
if (!files.length) {
  const dir = path.join(ROOT, 'bau/snapshots');
  files = fs.readdirSync(dir).filter(f => /^R-4\d+\.html$/.test(f)).sort().map(f => path.join(dir, f));
  if (fs.existsSync(APP)) files.push(APP);
}
const CONF = {alt: {oneScale: false, change: 'now'}, os: {oneScale: true, osAmt: 1, osPass: false, change: 'now'}};
const sha = o => crypto.createHash('sha1').update(JSON.stringify(o)).digest('hex').slice(0, 8);
async function runFile(file) {
  const {b, p, errs} = await open(file);
  await p.evaluate(SONG_JS);
  const out = {file: path.relative(ROOT, file), version: await p.evaluate(() => window.SYNQUENZER.version), runs: {}};
  const fall = quick ? Object.entries(FAELLE).slice(0, 1) : Object.entries(FAELLE);
  for (const [fn, F] of fall) for (const [cn, hc] of Object.entries(CONF)) {
    const src = await p.evaluate(([k, c, h]) => __harmSong(k, c, {harmony: h}), [F.key, F.chords, hc]);
    const keys = await p.evaluate(() => __harmSettle());   // nach der Tonart-Analyse (wie in der App)
    const Z = await p.evaluate(([k, c]) => c.map(x => Harmony.oneScale(window.SYNQUENZER.parseChord(x), k, 'chord', hopts())), [F.key, F.chords]);
    const shifts = await p.evaluate(([k, c]) => c.map(x => Harmony.nearestShift(window.SYNQUENZER.parseChord(x).root, k.root, 0)), [F.key, F.chords]);
    await p.evaluate(() => { const Q = window.SYNQUENZER; Q.clearLog(); Q.songPlay(0); });
    await p.waitForTimeout(F.chords.length * 1000 + 600);
    const log = (await p.evaluate(() => { const Q = window.SYNQUENZER; const l = Q.noteLog(4096); Q.stop(); return l; }))
      .filter(e => e.src === 'clip' && e.beat != null && e.beat < F.chords.length * 4 - 1e-6).map(e => ({tr: e.track, b: +e.beat.toFixed(3), n: e.clipNote, o: e.out}));
    log.sort((x, y) => x.tr - y.tr || x.b - y.b);
    const syn = log.filter(e => e.tr !== 4), dr = log.filter(e => e.tr === 4);
    const bar = e => Math.floor(e.b / 4 + 1e-6);
    const fremd = syn.filter(e => !Z[bar(e)].includes(((e.o % 12) + 12) % 12));
    const okt = syn.filter(e => Math.abs(e.o - e.n - shifts[bar(e)]) > 3);
    let kontur = 0; for (let k = 1; k < syn.length; k++) { const a = syn[k - 1], c = syn[k]; if (a.tr !== c.tr || bar(a) !== bar(c)) continue; if (Math.sign(c.o - a.o) !== Math.sign(c.n - a.n) || Math.abs((c.o - a.o) - (c.n - a.n)) > 3) kontur++; }
    out.runs[fn + ' | ' + cn] = {n: syn.length, drums: dr.length, drumsXp: dr.filter(e => e.o !== e.n).length, fremd: fremd.length, fremdBsp: fremd.slice(0, 4), okt: okt.length, kontur, hash: sha(syn.map(e => [e.tr, e.b, e.o])), keys: keys.join('/'), log: syn};
  }
  // kurz der Offline-Render (4.26+): erster Fall, „Eine Skala“ an — Pegel + Noten-Log des Offline-Durchlaufs gegen das Live-Log
  const has = await p.evaluate(() => !!(window.SYNQUENZER.vvRender));
  if (has) {
    const [fn, F] = Object.entries(FAELLE)[0];
    await p.evaluate(([k, c, h]) => __harmSong(k, c, {harmony: h}), [F.key, F.chords, CONF.os]);
    await p.evaluate(() => __harmSettle());
    try {
      const r = await p.evaluate(async () => { const r = await window.SYNQUENZER.vvRender({}); return {peak: r.peak, rms: r.rms, songSec: r.songSec, log: (r.log || []).filter(e => e.src === 'clip' && e.track !== 4 && e.beat != null).map(e => ({tr: e.track, b: +e.beat.toFixed(3), o: e.out}))}; });
      r.log.sort((x, y) => x.tr - y.tr || x.b - y.b); const live = out.runs[fn + ' | os'].log;
      const lk = new Set(live.map(e => e.tr + '@' + e.b + '=' + e.o)), diff = r.log.filter(e => !lk.has(e.tr + '@' + e.b + '=' + e.o)).length;
      out.offline = {peak: +r.peak.toFixed(3), rms: +r.rms.toFixed(4), n: r.log.length, liveN: live.length, abweichend: diff, hash: sha(r.log.map(e => [e.tr, e.b, e.o]))};
    } catch (e) { out.offline = {err: String(e)}; }
  }
  // Live: ein ALTES gespeichertes Projekt (Wechsel „Sofort“ gespeichert, ohne oneScale/harmStd) wird geladen, dann Akkorde
  // mitten im Takt über der laufenden Szene (Tastatur + MIDI). Gemessen: Wechsel mitten im Takt, fremde Töne, doppelte Noten
  {
    await p.evaluate(LIVE_JS);
    const F = FAELLE['A-Moll i–VI–III–VII / i–VI–iv–V'];
    const hs = await p.evaluate(async ([k, c]) => { __harmSong(k, c, {}); await __harmSettle(); const Q = window.SYNQUENZER; Q.setSong(null);
      const pj = Q.project(), h = pj.settings.harmony; h.change = 'now'; delete h.oneScale; delete h.osAmt; delete h.osPass; delete h.harmStd;
      Q.importJSON(JSON.stringify(pj)); Q.setBpm(240); await __harmSettle(); return Object.assign({}, Q.project().settings.harmony); }, [F.key, F.chords]);
    const pr = [{beat: 1.4, chord: 'F'}, {beat: 6.2, chord: 'C'}, {beat: 9.8, chord: 'E', midi: true}, {beat: 13.5, chord: 'Dm'}, {beat: 17.1, chord: 'G', midi: true}, {beat: 22.6, chord: 'Am'}].map(x => ({...x, keys: KEYS[x.chord]}));
    const r = await p.evaluate(([pr]) => __harmLive(pr, {until: 30}), [pr]);
    const Z = await p.evaluate(([k, ns]) => ns.map(x => Harmony.oneScale(window.SYNQUENZER.parseChord(x), k, 'chord', hopts())), [F.key, r.presses.map(x => x.chord)]);
    const ent = r.presses.map((x, k) => ({beat: x.entry ? x.entry.beat : null, Z: Z[k]}));
    const at = bt => { let e = null; for (const x of ent) if (x.beat != null && x.beat <= bt + 1e-6) e = x; return e; };
    const syn = r.log.filter(e => e.src === 'clip' && e.track !== 4 && e.beat != null);
    const PC = n => ((n % 12) + 12) % 12, seen = new Map(); let dup = 0;
    for (const e of syn) { const k = e.track + '@' + e.beat.toFixed(3); if (seen.has(k)) dup++; seen.set(k, e.out); }
    out.live = {change: hs.change, oneScale: hs.oneScale, wechsel: ent.map(x => x.beat == null ? null : +x.beat.toFixed(2)),
      mitten: ent.filter(x => x.beat != null && Math.abs(x.beat / 4 - Math.round(x.beat / 4)) > 1e-3).length,
      fremd: syn.filter(e => { const x = at(e.beat); return x && !x.Z.includes(PC(e.out)); }).length, n: syn.length, doppelt: dup, stimmen: r.voices,
      drumsXp: r.log.filter(e => e.track === 4 && e.src === 'clip' && e.out !== e.clipNote).length};
  }
  out.errs = errs.slice(0, 5);
  await b.close();
  return out;
}
const res = []; const PAR = 3;
for (let i = 0; i < files.length; i += PAR) res.push(...await Promise.all(files.slice(i, i + PAR).map(runFile)));
fs.writeFileSync(path.join(HERE, 'regression.json'), JSON.stringify(res.map(r => ({...r, runs: Object.fromEntries(Object.entries(r.runs).map(([k, v]) => [k, {...v, log: undefined}]))})), null, 1));
// Tabelle
const keys = Object.keys(res[0].runs);
console.log('| Fassung | ' + keys.map(k => k.replace(' | ', ' · ')).join(' | ') + ' | Offline |');
console.log('|---|' + keys.map(() => '---|').join('') + '---|');
for (const r of res) console.log('| ' + r.version + (r.file.includes('helfer') ? ' (HARM)' : '') + ' | ' + keys.map(k => { const v = r.runs[k]; return v ? `${v.hash} · fremd ${v.fremd}/${v.n} · Bezug L3 ${v.keys.split('/')[3]} · okt ${v.okt} · kontur ${v.kontur} · dr ${v.drumsXp}` : '–'; }).join(' | ') + ' | ' + (r.offline ? (r.offline.err ? r.offline.err.slice(0, 40) : `${r.offline.hash} Δ${r.offline.abweichend} pk ${r.offline.peak}`) : '–') + ' |');
console.log('\n| Fassung | altes Projekt geladen: Wechsel / Eine Skala | Wechsel-Beats (Druck mitten im Takt) | mitten im Takt | fremde Töne | doppelte Noten | Stimmen nach Stopp | Drums transp. |');
console.log('|---|---|---|---|---|---|---|---|');
for (const r of res) { const L = r.live; if (L) console.log(`| ${r.version}${r.file.includes('helfer') ? ' (HARM)' : ''} | ${L.change} / ${L.oneScale ? 'an' : 'aus'} | ${L.wechsel.join(' · ')} | ${L.mitten}/6 | ${L.fremd}/${L.n} | ${L.doppelt} | ${L.stimmen} | ${L.drumsXp} |`); }
for (const r of res) if (r.errs.length) console.log('Fehler', r.version, r.errs);
