// Pflicht-Regeln am Text der Datei: 1× "  live: true,", verbotene Wörter 0, "MS 2000" 1×, VERSION 4.30.0, Format 5 unverändert,
// kein Netz/Datenbank im SX126-Code, jede geänderte Altstelle mit „// SX126“, CSS-Block da, kein ✂-Zeichen als Grafik
import fs from 'fs'; import { APP, BASE, OUT } from './sx-lib.mjs';
const s = fs.readFileSync(APP, 'utf8'), base = fs.readFileSync(BASE, 'utf8'), res = {}; let ok = true;
const cnt = (t, w, f) => (t.match(new RegExp(w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), f || 'g')) || []).length;
res.live = cnt(s, '  live: true,'); ok = ok && res.live === 1;
res.verboten = Object.fromEntries(['Korg', 'microKORG', 'RADIAS', 'DWGS', 'Kodamo', 'Mask1', 'Nord', 'Kompakt'].map(w => [w, cnt(s, w, 'gi')]));
ok = ok && Object.values(res.verboten).every(n => n === 0);
res.ms2000 = cnt(s, 'MS 2000'); ok = ok && res.ms2000 === 1;
res.version = /const VERSION = '4\.30\.0';/.test(s); ok = ok && res.version;
const blk = s.slice(s.indexOf('/* SX126-BEGIN'), s.indexOf('/* SX126-END */'));
res.blockLaenge = blk.length;
res.netz = ['fetch(', 'indexedDB', 'XMLHttpRequest', 'WebSocket', 'localStorage', 'sendBeacon', 'supabase'].filter(w => blk.includes(w)); ok = ok && !res.netz.length;
res.scherenZeichen = cnt(s, '✂') - cnt(base, '✂'); ok = ok && res.scherenZeichen <= 0;
res.css = s.includes('/* SX126-CSS-BEGIN') && s.includes('/* SX126-CSS-END */'); ok = ok && res.css;
// jede Zeile außerhalb der beiden SX126-Blöcke, die neu ist, trägt „SX126“
const strip = t => t.replace(/\/\* SX126-BEGIN[\s\S]*?\/\* SX126-END \*\/\n/, '').replace(/\/\* SX126-CSS-BEGIN[\s\S]*?\/\* SX126-CSS-END \*\/\n/, '');
const bl = new Set(base.split('\n')), neu = strip(s).split('\n').filter(l => !bl.has(l));
res.neueZeilen = neu.length; res.ohneMarke = neu.filter(l => !l.includes('SX126')); ok = ok && !res.ohneMarke.length;
const sl = new Set(s.split('\n')), gone = base.split('\n').filter(l => !sl.has(l)); res.geaenderteAltzeilen = gone.length;
// „Schläge je Takt“ nur über sx1Bpb (im SX126-Code kein „* 4“ / „/ 4“ für Schläge)
res.vierDirekt = (blk.match(/[*\/]\s*4\b/g) || []).length; ok = ok && res.vierDirekt === 0;
console.log(JSON.stringify(res, null, 1)); console.log(ok ? 'OK' : 'FEHLER');
fs.mkdirSync(OUT, {recursive: true}); fs.writeFileSync(OUT + '/t0-regeln.json', JSON.stringify(res, null, 1));
process.exit(ok ? 0 : 1);
