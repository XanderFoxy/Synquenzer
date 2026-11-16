// IMPK-Prüfung: Frage-Zeile des Import-Blatts – impkAsk aus <index> gegen die Basis-Formel, je Zustand (Start, ½×, 2×, +, −, Tippen).
// Soll: Start/+/−/Tippen genau wie die Basis, sofern die Basis keine gleichen Knöpfe zeigt; nie zwei gleiche Knöpfe; nach ½×/2× ist das erkannte Tempo wählbar.
// Aufruf: node impk-frage-test.mjs <index.html>
import fs from 'node:fs';
const H = fs.readFileSync(process.argv[2], 'utf8'), i = H.indexOf('function impkAsk(c)'), j = H.indexOf('/* IMPK-END */', i);
const impkAsk = new Function(H.slice(i, j) + '\nreturn impkAsk;')();
const r2 = v => Math.round(v * 100) / 100, clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const mkR = b => ({bpm: b, alt: [].concat(b / 2 >= 40 ? [r2(b / 2)] : [], b * 2 <= 300 ? [r2(b * 2)] : []), frage: true, quelle: 'gesang'});
const knoepfe = (c, al) => [c.bpm].concat(al).map(Math.round), line = (c, al) => `${Math.round(c.bpm)}${al.length ? ' oder ' + al.map(Math.round).join(' / ') : ''}? [${[c.bpm].concat(al).map(v => Math.round(v) + (Math.abs(v - c.bpm) < .01 ? '*' : '')).join(' | ')}]`;
let ok = 0, bad = 0; const chk = (c, m) => { if (c) ok++; else { bad++; console.log('FEHLER ' + m); } };
for (const b of [120.6, 120.33, 84, 100, 150, 66, 45, 200]) {
  const r = mkR(b), st = [['Start', b], ['½×', b / 2], ['2×', b * 2], ['+', Math.round(b) + 1], ['−', Math.round(b) - 1], ['Tippen 118', 118], ['Tippen ½', b / 2 + .2]];
  for (const [n, v] of st) {
    if (v < 40 || v > 240) continue;
    const c = {r, bpm: clamp(+(+v).toFixed(2), 40, 240)}, base = (r.alt || []).filter(x => x >= 40 && x <= 240), neu = impkAsk(c), kb = knoepfe(c, base), kn = knoepfe(c, neu);
    const dupB = new Set(kb).size !== kb.length, dupN = new Set(kn).size !== kn.length;
    const lb = line(c, base), ln = line(c, neu); console.log(`${String(b).padEnd(6)} ${n.padEnd(10)} Basis ${lb.padEnd(30)} IMPK ${ln}${lb === ln ? '' : '   (geändert)'}`);
    chk(!dupN, `${b} ${n}: gleiche Knöpfe ${ln}`);
    if (!dupB) chk(lb === ln, `${b} ${n}: Basis ohne Doppel, IMPK anders: ${lb} → ${ln}`);
    else chk(kn.includes(Math.round(b)) || b > 240, `${b} ${n}: erkanntes Tempo nicht wählbar: ${ln}`);
    chk(kn.length <= kb.length, `${b} ${n}: mehr Knöpfe als die Basis: ${kb.length} → ${kn.length}`);
  }
}
console.log(bad ? `FEHLER ${bad}, OK ${ok}` : `ALLE OK (${ok})`); process.exit(bad ? 1 : 0);
