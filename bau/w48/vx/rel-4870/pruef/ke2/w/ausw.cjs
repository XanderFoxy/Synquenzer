// Auswertung: node ausw.cjs <präfix>  (liest <präfix>-0..3.json)
const fs = require('fs'), pre = process.argv[2]; let r = [];
for (let i = 0; i < 4; i++) { const f = pre + '-' + i + '.json'; if (fs.existsSync(f)) r = r.concat(JSON.parse(fs.readFileSync(f))); }
r.sort((a, b) => a.id - b.id);
const pct = (a, f) => a.filter(f).length + '/' + a.length;
const S = r.filter(q => !q.mic), M = r.filter(q => q.mic);
console.log('Fälle', r.length, '(sauber', S.length, 'Mikro', M.length + ')');
console.log('Welle Endergebnis: alle', pct(r, q => q.welle), 'sauber', pct(S, q => q.welle), 'Mikro', pct(M, q => q.welle), '| Stufe 1:', pct(r, q => q.s1ok));
const P = []; for (const q of r) for (const k of ['src', 'flt', 'amp', 'noi', 'mov']) if (q.cal && q.cal[k] != null) P.push({k, p: q.cal[k], y: q.ok[k] ? 1 : 0});
const ece = (P, nb) => { let e = 0; for (let b = 0; b < nb; b++) { const a = P.filter(x => Math.min(nb - 1, Math.floor(x.p * nb)) === b); if (!a.length) continue; const acc = a.reduce((s, x) => s + x.y, 0) / a.length, cf = a.reduce((s, x) => s + x.p, 0) / a.length; e += Math.abs(acc - cf) * a.length / P.length; } return e; };
const brier = P => P.reduce((s, x) => s + (x.p - x.y) ** 2, 0) / P.length;
console.log('Eich-Fehler ECE (10 Fächer) alle Zeilen', ece(P, 10).toFixed(3), 'Brier', brier(P).toFixed(3), 'n', P.length);
for (const k of ['src', 'flt', 'amp', 'noi', 'mov']) { const a = P.filter(x => x.k === k); console.log('  ', k, 'ECE', ece(a, 5).toFixed(3), 'mittl. p', (a.reduce((s, x) => s + x.p, 0) / a.length).toFixed(2), 'richtig', (a.reduce((s, x) => s + x.y, 0) / a.length).toFixed(2)); }
const wd = p => (p >= .8 ? 'sicher' : p >= .5 ? 'ungefaehr' : 'geraten');
for (const w of ['sicher', 'ungefaehr', 'geraten']) { const a = P.filter(x => wd(x.p) === w); if (a.length) console.log('  Wort', w, 'Zeilen', a.length, 'davon richtig', (a.reduce((s, x) => s + x.y, 0) / a.length).toFixed(2)); }
