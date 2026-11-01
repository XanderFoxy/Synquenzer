// Regel 28 / Smoke: Chor aus 4.25 (v1) – Daten und alle Stimmen-Puffer bitgleich zwischen 4.25.2 (R-4252) und G6+b; Projekt ohne Chor gleich;
// kein Chor-Auftrag beim Start (nichts lädt beim App-Start), keine Seitenfehler
import {open, sing, melody, inject, report} from './h.mjs';
import path from 'path';
const BASE = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../../../snapshots/R-4252.html');
const rows = [], y = sing(melody(16), {beats: 16}), out = {};
for (const [name, file] of [['alt', BASE], ['neu', undefined]]) {
  const {br, p, errs} = await open({file});
  const boot = await p.evaluate(() => ({w2: SYNQUENZER.g6pbInfo ? SYNQUENZER.g6pbInfo().w2 : 'nie', jobs: SYNQUENZER.g6pbInfo ? SYNQUENZER.g6pbInfo().renders : 0}));
  const tk = await inject(p, y, {bars: 4}), r = {t: tk.track, s: 0};
  const pj0 = (await p.evaluate(() => { const j = SYNQUENZER.project(); delete j.takes; return JSON.stringify(j.tracks); })).split(tk.id).join("ID").replace(/"uid":"[a-z0-9]+"/g, "\"uid\":\"U\"");   // Take-Kennung und Spur-uid sind zufällig
  const res = {};
  for (const [rec, dir, mix] of [['terz', 'up', '80'], ['barber', 'up', 'pop'], ['falsett', 'up', '80']]) {
    await p.evaluate(([r, a, b, c]) => SYNQUENZER.g6Make(r, a, b, c), [r, rec, dir, mix]); await p.evaluate(r => SYNQUENZER.g6Wait(r), r);
    const I = await p.evaluate(r => SYNQUENZER.g6Info(r), r), H = [];
    for (let k = 0; k < I.chor.voices.length; k++) for (let c = 0; c < 2; c++) { const b = await p.evaluate(([r, k, c]) => { const x = SYNQUENZER.g6Buf(r, k, c); if (!x) return null; let h = 0x811c9dc5; const f = new Uint32Array(Float32Array.from(x.data).buffer); for (const v of f) { h ^= v; h = Math.imul(h, 0x01000193) >>> 0; } return h; }, [r, k, c]); H.push(b); }
    res[rec] = {chor: JSON.stringify(I.chor), h: H.join(',')};
  }
  out[name] = {pj0, res, boot, errs};
  await br.close();
}
rows.push({id: 'R28 ohne Chor', ok: out.alt.pj0 === out.neu.pj0, msg: 'Spuren-JSON ohne Chor zeichengleich: ' + (out.alt.pj0 === out.neu.pj0)});
for (const k of Object.keys(out.alt.res)) rows.push({id: 'R28 v1 ' + k, ok: out.alt.res[k].chor === out.neu.res[k].chor && out.alt.res[k].h === out.neu.res[k].h && !out.neu.res[k].h.includes('null'), msg: `Chor-Daten gleich: ${out.alt.res[k].chor === out.neu.res[k].chor}, Puffer-Prüfsummen gleich: ${out.alt.res[k].h === out.neu.res[k].h} (${out.neu.res[k].h.split(',').length} Puffer)`});
rows.push({id: 'Start', ok: out.neu.boot.w2 === 'nie' && out.neu.boot.jobs === 0, msg: `beim Start: zweiter Worker ${out.neu.boot.w2}, Chor-Rechnungen ${out.neu.boot.jobs}`});
rows.push({id: 'Fehler', ok: !out.neu.errs.length, msg: out.neu.errs.slice(0, 3).join(' | ') || 'keine Seitenfehler'});
report('Regel 28 / Smoke', rows);
