// ein Projekt ohne Takes bleibt Zeichen für Zeichen gleich (Demo + alte Projekt-Datei laden/speichern), gegen den Stand vor VS3
import {open} from './v3-vs3-h.mjs';
const A = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/vs3work/index-vor-VS3.html';
const get = async f => { const H = await open({file: f}); const r = await H.p.evaluate(() => { const s = JSON.parse(SYNQUENZER.serialize()); delete s.appVersion; delete s.sum; const pj = s.project; delete pj.id; return JSON.stringify(s).replace(/"uid":"[0-9a-v]{10}"/g, "\"uid\":0"); }); const e = H.errs; await H.br.close(); return [r, e]; };
const [a] = await get(A), [b, e] = await get();
console.log(a === b ? '✓ Demo-Projekt gleich zu vor-VS3 (' + a.length + ' Zeichen)' : '✗ Demo-Projekt verschieden'); console.log(e.length ? '✗ ' + e : '✓ keine Konsolenfehler');
if (a !== b) { let i = 0; while (a[i] === b[i]) i++; console.log('ab', i, a.slice(i - 80, i + 80), '\n--\n', b.slice(i - 80, i + 80)); }
