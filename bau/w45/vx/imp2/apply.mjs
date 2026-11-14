// IMP2: basis.html + block.js → index.html (Block nach down(), Haken als erste Zeile in down())
import fs from 'node:fs';
const dir = new URL('.', import.meta.url).pathname;
let H = fs.readFileSync(dir + 'basis.html', 'utf8');
const B = fs.readFileSync(dir + 'block.js', 'utf8');
const a = "  function down(x, sr) {\n", hook = "    if (typeof imp2Down === 'function') return imp2Down(x, sr);   /* IMP2: immer 11 025 Hz mit sauberem Tiefpass */\n";
const i = H.indexOf('function imp1Core() {'), d = H.indexOf(a, i); if (d < 0 || H.indexOf(a, d + 1) >= 0 && H.indexOf(a, d + 1) < H.indexOf('const IMP1 = {', i)) throw 'down?';
H = H.slice(0, d + a.length) + hook + H.slice(d + a.length);
const m = "  const med = a => { const b = Array.from(a)", k = H.indexOf(m, d); if (k < 0 || k > H.indexOf('const IMP1 = {', i)) throw 'med?';
H = H.slice(0, k) + B + H.slice(k);
fs.writeFileSync(dir + 'index.html', H);
console.log('ok', H.length);
