// Baut bau/helfer/BMK/index.html = vs-base-B.html (App 4.23.0) + Block sq-bm-src (Prozessor 'synq-bm' + Test-Teil Zweig K).
// Aufruf: node bau/helfer/BMK/werkzeug/bau.mjs   (idempotent: immer aus der Basis)
import fs from 'fs';
const D = new URL('..', import.meta.url).pathname, ROOT = new URL('../../../..', import.meta.url).pathname;
const base = fs.readFileSync(ROOT + 'bau/werkzeug/vs-base-B.html', 'utf8');
const wk = fs.readFileSync(D + 'src/bm-wk.js', 'utf8'), host = fs.readFileSync(D + 'src/bm-host.js', 'utf8');
const bad = (s, n) => { if (/[^\x00-\x7f]/.test(s)) throw new Error(n + ': nicht ASCII'); if (/`|\$\{|<\/script/i.test(s)) throw new Error(n + ': Backtick/${/script'); };
bad(wk, 'bm-wk.js'); if (/<\/script/i.test(host)) throw new Error('bm-host.js: script-Ende');
const block = '<script type="text/plain" id="sq-bm-src">\n' +
  '/* ===== Bit Mask (Nachtrag 7 Rev. 2) block sq-bm-src, branch K (sound): the processor \'synq-bm\' (BM1-BM4) as the string BM_WK,\n' +
  '   then the branch-K test part (BMK-TEST). On merge with BM6 (branch U): the section BM-KLANG replaces BM6\'s BM-STUB section;\n' +
  '   the section BMK-TEST stays only where BM6 has no equivalent. ===== */\n' +
  '/* BM-KLANG (branch K) */\nconst BM_WK = `' + wk + '`;\n/* Ende BM-KLANG */\n' + host + '\n</script>\n';
const anchor = '<script type="text/plain" id="sq-worklet-src">';
if (base.split(anchor).length !== 2) throw new Error('Anker fehlt');
let out = base.replace(anchor, block + anchor);
fs.writeFileSync(D + 'index.html', out);
console.log('index.html', out.length, 'Bytes (+' + (out.length - base.length) + '), BM_WK', wk.length);
