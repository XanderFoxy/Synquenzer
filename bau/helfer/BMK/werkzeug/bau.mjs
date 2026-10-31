// Baut bau/helfer/BMK/index.html = vs-base-B.html (App 4.23.0) + Block sq-bm-src (Prozessor 'synq-bm' + Test-Teil Zweig K).
// Aufruf: node bau/helfer/BMK/werkzeug/bau.mjs   (idempotent: immer aus der Basis)
import fs from 'fs';
const D = new URL('..', import.meta.url).pathname, ROOT = new URL('../../../..', import.meta.url).pathname;
const base = fs.readFileSync(ROOT + 'bau/werkzeug/vs-base-B.html', 'utf8');
const fx = fs.readFileSync(D + 'src/bm-fx.js', 'utf8'), wk = fs.readFileSync(D + 'src/bm-wk.js', 'utf8').replace('/* @FX */\n', fx), host = fs.readFileSync(D + 'src/bm-host.js', 'utf8');
const bad = (s, n) => { if (/[^\x00-\x7f]/.test(s)) throw new Error(n + ': nicht ASCII'); if (/`|\$\{|<\/script/i.test(s)) throw new Error(n + ': Backtick/${/script'); };
bad(wk, 'bm-wk.js'); if (/<\/script/i.test(fs.readFileSync(D + 'src/bm-arp.js', 'utf8'))) throw new Error('bm-arp.js'); if (/<\/script/i.test(host)) throw new Error('bm-host.js: script-Ende');
const block = '<script type="text/plain" id="sq-bm-src">\n' +
  '/* ===== Bit Mask (Nachtrag 7 Rev. 2) block sq-bm-src, branch K (sound): the processor \'synq-bm\' (BM1-BM4) as the string BM_WK,\n' +
  '   then the branch-K test part (BMK-TEST). On merge with BM6 (branch U): the section BM-KLANG replaces BM6\'s BM-STUB section;\n' +
  '   the section BMK-TEST stays only where BM6 has no equivalent. ===== */\n' +
  '/* BM-KLANG (branch K) */\nconst BM_WK = `' + wk + '`;\n/* Ende BM-KLANG */\n' + host + '\n</script>\n';
const anchor = '<script type="text/plain" id="sq-worklet-src">';
if (base.split(anchor).length !== 2) throw new Error('Anker fehlt');
let out = base.replace(anchor, block + anchor);
// BM4 (section 5.2): ARPC word for word from the block sq-mk-src into the shared block sq-arp-src (+ BMARP); mkLoad evaluates it first
const EDITS = [];
{
  const a0 = out.indexOf('/* ---- MK5 (Nachtrag 3 MK5, EN3-11): the step arpeggiator.'), a1 = out.indexOf('\n})();\n', out.indexOf('const ARPC = (function () {')) + 6;
  if (a0 < 0 || a1 < 6 || out.slice(a0, a1).split('const ARPC').length !== 2) throw new Error('ARPC nicht gefunden');
  const arpc = out.slice(a0, a1), mark = '/* ARPC: moved word for word to the block sq-arp-src (Nachtrag 7 BM4, section 5.2) */';
  out = out.slice(0, a0) + mark + out.slice(a1); EDITS.push({old: arpc, new: mark});
  const arp = fs.readFileSync(D + 'src/bm-arp.js', 'utf8');
  const blk = '<script type="text/plain" id="sq-arp-src">\n/* ===== shared arpeggiator block (Nachtrag 7 section 5.2): ARPC of MK5 (engine mk, unchanged) and BMARP (Bit Mask); evaluated\n   once before the block sq-mk-src (mkLoad) and by the Bit Mask host (arpSrcLoad) ===== */\n' + arpc + '\n' + arp + '</script>\n';
  const mk = '<script type="text/plain" id="sq-mk-src">'; if (out.split(mk).length !== 2) throw new Error('sq-mk-src');
  out = out.replace(mk, blk + mk);
  const o1 = "  const t0 = performance.now(), el = document.getElementById('sq-mk-src');\n  try {\n    if (!el) throw new Error('sq-mk-src fehlt');";
  const n1 = "  const t0 = performance.now(), el = document.getElementById('sq-mk-src');\n  arpSrcLoad();   // BM4: ARPC lives in the shared block sq-arp-src\n  try {\n    if (!el) throw new Error('sq-mk-src fehlt');";
  if (out.split(o1).length !== 2) throw new Error('mkLoad'); out = out.replace(o1, n1); EDITS.push({old: o1, new: n1});
  const o2 = 'function mkLoad() {\n';
  const n2 = "// BM4: the shared arpeggiator block (ARPC for the engine mk, BMARP for Bit Mask), evaluated once\nfunction arpSrcLoad() {\n  if (typeof ARPC !== 'undefined') return true;\n  const el = document.getElementById('sq-arp-src'); if (!el) return false;\n  try { const sc = document.createElement('script'); sc.textContent = el.textContent; document.head.appendChild(sc); sc.remove(); } catch (e) { logErr(e); }\n  return typeof ARPC !== 'undefined';\n}\nfunction mkLoad() {\n";
  if (out.split(o2).length !== 2) throw new Error('mkLoad2'); out = out.replace(o2, n2); EDITS.push({old: o2, new: n2});
}
fs.writeFileSync(D + 'werkzeug/edits.json', JSON.stringify(EDITS));
fs.writeFileSync(D + 'index.html', out);
console.log('index.html', out.length, 'Bytes (+' + (out.length - base.length) + '), BM_WK', wk.length);
