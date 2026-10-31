// BM8: die Kurven-Helfer gegen die Bedeutung (Gerade zwischen Punkten, Stücke halten ihren Wert bis zu ihrem Ende)
import fs from 'fs';
const src = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const a = src.indexOf('const CV_K = '), b = src.indexOf('/* BM8 Laufzeit');
const code = src.slice(a, b);
const f = new Function('clamp', 'isNum', 'SONG_MAX_BARS', code + '; return {cvAt, cvSlice, cvJoin, cvRepeat, cvCut, cvClearAbs, cvPutAbs, cvShiftAbs, cvNormCurve};');
const H = f((x, lo, hi) => x < lo ? lo : x > hi ? hi : x, v => typeof v === 'number' && isFinite(v), 999);
const at = (cv, t) => H.cvAt(cv.bd, t);
let bad = 0; const chk = (name, got, exp) => { const ok = Math.abs(got - exp) < 1 / 2048; if (!ok) bad++; console.log((ok ? 'OK  ' : 'FAIL') + ' ' + name + ' ' + got.toFixed(4) + ' (soll ' + exp.toFixed(4) + ')'); };
let r = H.cvRepeat({bd: [[0, 0], [1, 1]]}, 4, 2); chk('×2 bei 2,5', at(r, 2.5), 1); chk('×2 bei 4,5', at(r, 4.5), .5); chk('×2 bei 3,99', at(r, 3.99), 1);
r = H.cvClearAbs({bd: [[0, .5]]}, 4, 8); chk('leeren 3', at(r, 3), .5); chk('leeren 6', at(r, 6), 0); chk('leeren 9', at(r, 9), .5);
r = H.cvPutAbs({bd: [[0, 0]]}, {bd: [[0, 1]]}, 8, 4); chk('einsetzen 6', at(r, 6), 0); chk('einsetzen 10', at(r, 10), 1); chk('einsetzen 13', at(r, 13), 0);
r = H.cvSlice({bd: [[0, 0], [8, 1]]}, 0, 4); chk('Schnitt 3', at(r, 3), .375); chk('Schnitt 3,99', at(r, 3.999), .5);
r = H.cvSlice({bd: [[0, 0], [8, 1]]}, 2, 6); chk('Schnitt 2–6 bei 0', at(r, 0), .25); chk('Schnitt 2–6 bei 3', at(r, 3), .625);
r = H.cvCut({bd: [[0, 0], [8, 1]]}, 4); chk('kürzen 3', at(r, 3), .375); chk('kürzen 3,99', at(r, 3.999), .5);
r = H.cvShiftAbs({bd: [[0, 0], [8, 1], [12, 0]]}, 8, 4); chk('verschieben 7', at(r, 7), .875); chk('verschieben 9', at(r, 9), 0); chk('verschieben 12', at(r, 12), 1); chk('verschieben 14', at(r, 14), .5);
r = H.cvShiftAbs({bd: [[0, 0], [8, 1], [12, 0]]}, 8, -4); chk('löschen 3,99', at(r, 3.999), .5); chk('löschen 4', at(r, 4), 1); chk('löschen 6', at(r, 6), .5);
process.exit(bad ? 1 : 0);
