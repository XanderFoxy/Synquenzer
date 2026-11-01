// Regel 28: ohne Übergänge ist alles wie in 4.30.0 – Offline-Render (Video-Weg) bit-gleich, GarageBand-Instrumental bit-gleich,
// KON / Teil verschieben / löschen / ersetzen ergeben denselben Song, Speichern gleich (ohne Zufalls-IDs)
import path from 'path'; import fs from 'fs'; import crypto from 'crypto'; import { fileURLToPath } from 'url';
import { SONG16, OUT } from './lib.mjs';
const here = path.dirname(fileURLToPath(import.meta.url));
const APPS = {basis: path.resolve(here, '../../../snapshots/R-4300.html'), neu: path.resolve(here, '../index.html')};
const R = []; const ok = (name, pass, info) => { R.push({name, pass: !!pass, info}); console.log((pass ? 'OK  ' : 'FEHL') + ' ' + name + (info !== undefined ? ' ' + JSON.stringify(info) : '')); };
const res = {};
for (const [k, app] of Object.entries(APPS)) {
  process.env.APP = app; const L = await import('./lib.mjs?' + k); const {b, p, errs} = await L.open({});
  await p.evaluate(s => SYNQUENZER.setSong(s), SONG16);
  const o = {};
  // die Basis rendert selbst nicht bit-gleich zwischen zwei Läufen (Zufalls-Phasen/Rauschen) – darum: Noten-Log exakt, Pegel ±0,1 dB
  o.render = await p.evaluate(async () => { const r = await SYNQUENZER.vvRender({range: {a: 0, b: 8}}); return {log: JSON.stringify(r.log.map(e => [e.track, e.src, e.out, +e.vel.toFixed(4), e.beat]).sort((x, y) => x[4] - y[4] || x[0] - y[0] || x[2] - y[2])), rms: r.rms, peak: r.peak}; });
  o.gb = await p.evaluate(async () => { const r = await ggbRender({range: {a: 2, b: 6}, pre: 1}); const u8 = r.bytes, dv = new DataView(u8.buffer, u8.byteOffset, u8.byteLength); let s = 0, n = 0; for (let i = 44; i + 1 < u8.length; i += 2) { const v = dv.getInt16(i, true) / 32768; s += v * v; n++; } return {len: u8.length, n: r.n, rms: Math.sqrt(s / n)}; });
  const songJ = () => p.evaluate(() => JSON.stringify(S.song));
  await p.evaluate(() => markAction('M2', 'move', 12)); o.move = await songJ(); await p.evaluate(() => SYNQUENZER.undo());
  await p.evaluate(() => markAction('M3', 'delete')); o.del = await songJ(); await p.evaluate(() => SYNQUENZER.undo());
  await p.evaluate(() => markAction('M2', 'copy', 16)); o.copy = await songJ(); await p.evaluate(() => SYNQUENZER.undo());
  await p.evaluate(() => SYNQUENZER.songRange('insertEmpty', 2, 3)); o.ins = await songJ(); await p.evaluate(() => SYNQUENZER.undo());
  await p.evaluate(() => SYNQUENZER.konsolidieren(4, 11, 'Block')); o.kon = await songJ();
  await p.evaluate(() => SYNQUENZER.zurueckholen(S.song.marks.find(m => m.a === 4).id)); o.konBack = await songJ();
  o.errs = errs.slice();
  res[k] = o; await b.close();
}
const h = s => crypto.createHash('sha256').update(s).digest('hex').slice(0, 16);
const dB = (x, y) => Math.abs(20 * Math.log10(x / y));
ok('Offline-Render (Video-Weg): Noten-Log gleich wie 4.30.0, Pegel ±0,1 dB', res.basis.render.log === res.neu.render.log && dB(res.basis.render.rms, res.neu.render.rms) < .1, {noten: JSON.parse(res.neu.render.log).length, dB: +dB(res.basis.render.rms, res.neu.render.rms).toFixed(4)});
ok('GarageBand-Instrumental: gleiche Länge, Pegel ±0,1 dB wie 4.30.0', res.basis.gb.len === res.neu.gb.len && dB(res.basis.gb.rms, res.neu.gb.rms) < .1, {len: [res.basis.gb.len, res.neu.gb.len], dB: +dB(res.basis.gb.rms, res.neu.gb.rms).toFixed(4)});
for (const k of ['move', 'del', 'copy', 'ins', 'kon', 'konBack']) ok('Song nach ' + k + ' gleich wie 4.30.0', res.basis[k] === res.neu[k]);
ok('keine Fehler in der Konsole (beide)', !res.basis.errs.length && !res.neu.errs.length, [res.basis.errs.slice(0, 3), res.neu.errs.slice(0, 3)]);
fs.writeFileSync(OUT + '/reg-log-basis.json', res.basis.render.log.replace(/\],\[/g, '],\n[')); fs.writeFileSync(OUT + '/reg-log-neu.json', res.neu.render.log.replace(/\],\[/g, '],\n['));
fs.writeFileSync(OUT + '/ue-regress.json', JSON.stringify(R, null, 1));
console.log('ERGEBNIS', R.filter(x => x.pass).length + '/' + R.length);
