// G10g Pflicht-Regeln am Text der Datei: Version, genau 1× „  live: true,“, verbotene Wörter = 0, „MS 2000“ genau 1×, CSS-Block,
// jede geänderte Zeile außerhalb der G10g-Blöcke trägt „G10g“, kein Emoji als Grafik, keine Datenbank/Netz im neuen Code,
// „Schläge je Takt“ nur über die Hilfsfunktion (keine feste 4 im G10g-Block).
import fs from 'fs'; import {APP, BASE, ok, done} from './lib.mjs';
const H = fs.readFileSync(APP, 'utf8'), B = fs.readFileSync(BASE, 'utf8');
const cnt = (s, w) => s.split(w).length - 1;
ok(/const VERSION = '4\.30\.0';/.test(H), "VERSION bleibt '4.30.0'");
ok(cnt(H, '  live: true,') === 1, 'genau 1× „  live: true,“');
for (const w of ['Korg', 'microKORG', 'RADIAS', 'DWGS', 'Kodamo', 'Mask1', 'Nord', 'Kompakt']) ok(cnt(H, w) === 0, `verbotenes Wort „${w}“: ${cnt(H, w)}×`);
ok(cnt(H, 'MS 2000') === 1, '„MS 2000“ genau 1×');
const css = H.slice(H.indexOf('/* G10G-CSS-BEGIN */'), H.indexOf('/* G10G-CSS-END */'));
ok(cnt(H, '/* G10G-CSS-BEGIN */') === 1 && cnt(H, '/* G10G-CSS-END */') === 1 && css.length > 100 && /g10g-/.test(css), 'CSS zwischen G10G-CSS-BEGIN und G10G-CSS-END');
const js = H.slice(H.indexOf('/* G10G-BEGIN */'), H.indexOf('/* G10G-END */'));
ok(js.length > 1000, 'JS-Block G10G-BEGIN … G10G-END');
// geänderte Zeilen außerhalb der Blöcke (Zeilen-Diff über eine LCS der Basis)
const a = B.split('\n'), b = H.replace(js, '').replace(css, '').split('\n'), setA = new Map();
for (const l of a) setA.set(l, (setA.get(l) || 0) + 1);
const added = b.filter(l => { const n = setA.get(l) || 0; if (n) { setA.set(l, n - 1); return false; } return true; }).filter(l => l.trim() && !/G10G-(CSS-)?(BEGIN|END)/.test(l));
const unmarked = added.filter(l => !/G10g/.test(l) && !/^\s*[)}\];,]*\s*$/.test(l));
ok(unmarked.length === 0, `${added.length} geänderte Zeilen außerhalb der Blöcke, alle mit „// G10g“ markiert` + (unmarked.length ? ' – ohne: ' + JSON.stringify(unmarked.map(l => l.slice(0, 90))) : ''));
ok(added.length <= 60, `bestehende Funktionen nur minimal geändert (${added.length} Zeilen)`);
const neu = js + css + added.join('\n');
ok(!/\p{Extended_Pictographic}/u.test(neu.replace(/[▾▲▼✕♪♯♭·…→↔↶↷≈≥≤−–]/g, '')), 'kein Emoji im neuen Code (Zeichen ▾ ▲ ▼ ♯ ♭ sind Schrift, keine Grafik)');
ok(!/indexedDB|localStorage|fetch\(|XMLHttpRequest|WebSocket|navigator\.sendBeacon|kv\.set|SQStore/.test(neu), 'keine Datenbank- oder Netz-Zugriffe im neuen Code');
ok(!/beatsPerBar\s*\|\|\s*4|[*\/]\s*4\b|\b4\s*[*\/]/.test(js), 'Schläge je Takt nur über g10gBpb() (keine feste 4 im G10g-Block)');
ok(/function g10gBpb\(\) \{ return grid\(\)\.beatsPerBar; \}/.test(js), 'Hilfsfunktion g10gBpb() liest grid().beatsPerBar');
const names = [...js.matchAll(/^(?:function|const|let)\s+([A-Za-z_$][\w$]*)/gm)].map(m => m[1]);
ok(names.length && names.every(n => /^(g10g|G10G)/.test(n)), `alle neuen Namen mit Präfix g10g/G10G (${names.length}: ${names.slice(0, 6).join(', ')} …)`);
done();
