// PERF2 Teil D – Auslieferung ohne Kommentare (Werkstatt-Schritt; die Quelle bleibt wie sie ist).
// Aufruf: node ausliefern.mjs <quelle.html> <auslieferung.html> [<bericht.json>]
//
// Was passiert (deterministisch, gleiche Eingabe -> bytegleiche Ausgabe):
//  - HTML mit einem echten HTML-Parser (parse5) lesen; nur die Stellen der <script>- und <style>-Inhalte werden ersetzt,
//    alles andere bleibt Byte für Byte gleich.
//  - Ausführbare <script> (ohne type oder text/javascript): mit einem echten JS-Parser (acorn) in Tokens zerlegen;
//    jedes Token wird unverändert aus der Quelle übernommen (Zeichenketten, Vorlagen, Regex, Zahlen Zeichen für Zeichen).
//    Entfernt werden nur Kommentare und Leerraum ZWISCHEN den Tokens: ein Zwischenraum mit Zeilenumbrüchen wird zu genau so
//    vielen "\n" (keine Einrückung) – so bleiben ASI-Verhalten und ALLE Zeilennummern gleich (Fehlermeldungen vom Telefon
//    zeigen dieselbe Zeile wie in der Quelle); ohne Zeilenumbruch wird er zu "" oder, wo Tokens sonst verschmelzen, zu " ".
//  - type="text/plain" (Worklet-/Block-Quellen) und alle anderen Typen bleiben unberührt: der Code sucht darin per Text
//    (vv3Fmx: '// V0d (A.4b 3)', lkWkCheck: "const PVA = '…'", blockLoad, Worklet-Texte).
//  - <style>: nur Kommentare raus (postcss-Tokenizer); ein Kommentar mit Zeilenumbrüchen wird zu ebenso vielen "\n".
//  - Schutz-Zeilen (Pflicht-Marken und Werkzeuge, die die Datei per Text lesen) behalten Einrückung und Abstände:
//    "^  live: true," und "const VERSION = '<Fassung>';". Nur ihr Kommentar am Zeilenende fällt weg.
//  - Schutz-Funktionen bleiben samt Kommentaren wörtlich: vsCleanMake (clCoreVer() bildet aus vsCleanMake.toString()
//    den Schlüssel des Reinigungs-Zwischenspeichers im Audio-Store; geänderter Text = alle gereinigten Takes neu rechnen).
// Prüfungen (sonst Abbruch mit Code 1, keine Ausgabe): je Skript AST der Ausgabe == AST der Quelle (ohne Positionen, mit
// raw-Texten) und jede Knoten-Startzeile gleich; 0 Kommentare in der Ausgabe; CSS-Baum (postcss) ohne Kommentare gleich;
// Ausgabe erneut mit parse5 gelesen: gleiche Skript-/Stil-Elemente, text/plain-Inhalte bytegleich; gleiche Zeilenzahl;
// "MS 2000" gleich oft (Quelle 1×), "^  live: true," 1×, VERSION-Zeile 1×.
import fs from 'node:fs'; import path from 'node:path'; import crypto from 'node:crypto'; import { createRequire } from 'node:module';
const req = createRequire(new URL('./werkzeug/package.json', import.meta.url));
const acorn = req('acorn'), parse5 = req('parse5'), postcss = req('postcss'), cssTokenize = req('postcss/lib/tokenize');
const VERS = Object.fromEntries(['acorn', 'parse5', 'postcss'].map(m => [m, JSON.parse(fs.readFileSync(new URL('./werkzeug/node_modules/' + m + '/package.json', import.meta.url))).version]));

const [, , QUELLE, ZIEL, BERICHT] = process.argv;
if (!QUELLE || !ZIEL) { console.error('Aufruf: node ausliefern.mjs <quelle.html> <auslieferung.html> [<bericht.json>]'); process.exit(2); }
const fail = m => { console.error('ABBRUCH: ' + m); process.exit(1); };

const SCHUTZ_ZEILEN = [/^  live: true,/, /^const VERSION = '\d+\.\d+\.\d+';/];
const SCHUTZ_FUNKTIONEN = ['vsCleanMake'];
const JS_TYPES = new Set(['', 'text/javascript', 'application/javascript', 'application/x-javascript', 'text/ecmascript']);
const HTML_NS = 'http://www.w3.org/1999/xhtml';
const sha = b => crypto.createHash('sha256').update(b).digest('hex');
const NL = /\r\n|[\n\r\u2028\u2029]/g;
const nlCount = s => (s.match(NL) || []).length;

// ---------- HTML: Skript-/Stil-Stellen finden ----------
function blocks(html) {
  const doc = parse5.parse(html, {sourceCodeLocationInfo: true}); const out = [];
  const walk = n => {
    if ((n.nodeName === 'script' || n.nodeName === 'style') && n.namespaceURI === HTML_NS && n.sourceCodeLocation && n.sourceCodeLocation.endTag) {
      const L = n.sourceCodeLocation, a = L.startTag.endOffset, b = L.endTag.startOffset;
      const attrs = Object.fromEntries((n.attrs || []).map(x => [x.name, x.value]));
      const text = (n.childNodes || []).map(c => c.value || '').join('');
      if (html.slice(a, b) !== text) fail('Block-Inhalt passt nicht zum Parser-Text bei ' + a);
      out.push({tag: n.nodeName, a, b, attrs, type: (attrs.type || '').trim().toLowerCase(), id: attrs.id || ''});
    }
    if (n.content) walk(n.content);
    for (const c of n.childNodes || []) walk(c);
  };
  walk(doc); return out.sort((x, y) => x.a - y.a);
}

// ---------- JS ohne Kommentare ----------
const WORD = /[A-Za-z0-9_$#\\\u0080-￿]/;
const PUNCT = new Set(['{', '(', ')', '[', ']', '.', '...', ';', ',', '<', '>', '<=', '>=', '==', '!=', '===', '!==', '+', '-', '*', '%', '**', '++', '--',
  '<<', '>>', '>>>', '&', '|', '^', '!', '~', '&&', '||', '??', '?', '?.', ':', '=', '+=', '-=', '*=', '%=', '**=', '<<=', '>>=', '>>>=', '&=', '|=', '^=',
  '&&=', '||=', '??=', '=>', '/', '/=', '}', '..']);
function needSpace(p, n, pt, nt) {
  const a = pt[pt.length - 1], b = nt[0];
  if (WORD.test(a) && WORD.test(b)) return true;                                   // Wort/Zahl an Wort/Zahl
  if (p.type.label === 'num' && b === '.') return true;                            // 1 .x
  if (p.type.label === 'regexp' && WORD.test(b)) return true;                      // /x/ in -> keine Flags schlucken
  if (a === '/' && (b === '/' || b === '*')) return true;                          // kein Kommentar-Anfang
  if (a === '<' && (b === '!' || b === '/')) return true;                          // kein <!-- und kein </script
  if (a === '-' && (b === '>' || b === '-')) return true;                          // kein -->
  if (a === '+' && b === '+') return true;
  for (let k = 1; k <= 4 && k <= nt.length; k++) if (PUNCT.has(pt + nt.slice(0, k))) return true;   // längerer Operator
  return false;
}
function jsOhneKommentare(src, info) {
  const toks = [], coms = [];
  let ast;
  try { ast = acorn.parse(src, {ecmaVersion: 'latest', sourceType: 'script', locations: true, onToken: toks, onComment: coms}); }
  catch (e) { fail('Quelle nicht lesbar: ' + e.message); }
  const T = toks.filter(t => t.type.label !== 'eof');
  // Schutz-Funktionen: Bereiche [start, end]
  const schutz = [];
  const findFns = n => { if (!n || typeof n.type !== 'string') return;
    if (n.type === 'FunctionDeclaration' && n.id && SCHUTZ_FUNKTIONEN.includes(n.id.name)) { schutz.push([n.start, n.end, n.id.name]); return; }
    for (const k in n) { const v = n[k]; if (k === 'loc') continue; if (Array.isArray(v)) v.forEach(findFns); else if (v && typeof v.type === 'string') findFns(v); } };
  findFns(ast);
  // Schutz-Zeilen (Zeilennummer im Skript)
  const lines = src.split(/\r\n|[\n\r\u2028\u2029]/), zeilen = new Set();
  lines.forEach((l, i) => { if (SCHUTZ_ZEILEN.some(r => r.test(l))) zeilen.add(i + 1); });
  const inSchutz = (s, e) => schutz.some(([a, b]) => s >= a && e <= b);
  const lineStart = [0]; { src.replace(NL, (m, off) => { lineStart.push(off + m.length); return m; }); }
  const parts = []; let prev = null;
  for (const t of T) {
    const gap = src.slice(prev ? prev.end : 0, t.start), tt = src.slice(t.start, t.end);
    if (!prev) parts.push('\n'.repeat(nlCount(gap)));
    else if (gap === '') { /* waren schon aneinander */ }
    else if (inSchutz(prev.start, t.end)) parts.push(gap);
    else if (zeilen.has(t.loc.start.line) && prev.loc.end.line === t.loc.start.line && /^\s*$/.test(gap)) parts.push(gap);
    else {
      const n = nlCount(gap);
      if (n) {
        let ind = '';
        if (zeilen.has(t.loc.start.line)) { const lead = src.slice(lineStart[t.loc.start.line - 1], t.start); if (/^[ \t]*$/.test(lead)) ind = lead; }
        parts.push('\n'.repeat(n) + ind);
      } else parts.push(needSpace(prev, t, src.slice(prev.start, prev.end), tt) ? ' ' : '');
    }
    parts.push(tt); prev = t;
  }
  parts.push('\n'.repeat(nlCount(src.slice(prev ? prev.end : 0))));
  const out = parts.join('');
  // Prüfung: gleicher AST, gleiche Startzeilen, keine Kommentare
  const coms2 = []; let ast2;
  try { ast2 = acorn.parse(out, {ecmaVersion: 'latest', sourceType: 'script', locations: true, onComment: coms2}); }
  catch (e) { fail('Ausgabe nicht lesbar (' + info + '): ' + e.message); }
  const schutzKom = coms.filter(c => inSchutz(c.start, c.end)).length;
  if (coms2.length !== schutzKom) fail('Kommentare in der Ausgabe (' + info + '): ' + coms2.length + ' statt ' + schutzKom);
  const diff = astDiff(ast, ast2, 'Program');
  if (diff) fail('AST verschieden (' + info + '): ' + diff);
  if (nlCount(src) !== nlCount(out)) fail('Zeilenzahl verschieden (' + info + ')');
  return {out, kommentare: coms.length, kommentareGeschuetzt: schutzKom, tokens: T.length, schutz: schutz.map(x => x[2]), schutzZeilen: [...zeilen]};
}
function astDiff(a, b, p) {
  const st = [[a, b, p]];
  while (st.length) {
    const [x, y, q] = st.pop();
    if (x === y) continue;
    if (x === null || y === null || typeof x !== 'object' || typeof y !== 'object') { if (typeof x === 'bigint' && x === y) continue; return q + ': ' + String(x) + ' != ' + String(y); }
    if (Array.isArray(x) !== Array.isArray(y)) return q + ': Liste';
    if (Array.isArray(x)) { if (x.length !== y.length) return q + ': Länge ' + x.length + ' != ' + y.length; for (let i = 0; i < x.length; i++) st.push([x[i], y[i], q + '[' + i + ']']); continue; }
    if (x instanceof RegExp || y instanceof RegExp) { if (String(x) !== String(y)) return q + ': RegExp'; continue; }
    if (typeof x.type === 'string' && x.loc && y.loc && x.loc.start.line !== y.loc.start.line) return q + ' (' + x.type + '): Zeile ' + x.loc.start.line + ' != ' + y.loc.start.line;
    const kx = Object.keys(x).filter(k => k !== 'start' && k !== 'end' && k !== 'loc' && k !== 'range'), ky = Object.keys(y).filter(k => k !== 'start' && k !== 'end' && k !== 'loc' && k !== 'range');
    if (kx.length !== ky.length || kx.some(k => !(k in y))) return q + ': Schlüssel ' + kx.join(',') + ' / ' + ky.join(',');
    for (const k of kx) st.push([x[k], y[k], q + '.' + k + (x.type ? '<' + x.type + '>' : '')]);
  }
  return null;
}

// ---------- CSS ohne Kommentare ----------
function cssOhneKommentare(css) {
  const t = cssTokenize(new postcss.Input(css)), toks = [];
  while (!t.endOfFile()) toks.push(t.nextToken());
  if (toks.map(x => x[1]).join('') !== css) fail('CSS-Tokens decken den Text nicht ab');
  const sep = x => !x || x[0] === 'space' || ['{', '}', ';', ':', ',', '(', ')', '[', ']'].includes(x[0]);
  let n = 0; const out = toks.map((x, i) => {
    if (x[0] !== 'comment') return x[1];
    n++; const k = nlCount(x[1]); if (k) return '\n'.repeat(k);
    return sep(toks[i - 1]) || sep(toks[i + 1]) ? '' : ' ';
  }).join('');
  // Prüfung: postcss-Baum ohne Kommentare gleich (Leerraum normalisiert)
  const norm = s => String(s == null ? '' : s).replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/\s+/g, ' ').trim();
  const flat = root => { const r = []; root.walk(nd => { if (nd.type === 'comment') return; r.push([nd.type, norm(nd.selector), norm(nd.prop), norm(nd.raws && nd.raws.value ? nd.raws.value.raw : nd.value), norm(nd.name), norm(nd.raws && nd.raws.params ? nd.raws.params.raw : nd.params), !!nd.important].join('\u0001')); }); return r; };
  const A = flat(postcss.parse(css)), B = flat(postcss.parse(out)), C = [];
  postcss.parse(out).walkComments(c => C.push(c));
  if (C.length) fail('CSS-Kommentare übrig: ' + C.length);
  if (A.length !== B.length || A.some((v, i) => v !== B[i])) fail('CSS-Baum verschieden');
  if (nlCount(css) !== nlCount(out)) fail('CSS-Zeilenzahl verschieden');
  return {out, kommentare: n};
}

// ---------- Ablauf ----------
const t0 = Date.now();
const quelleBuf = fs.readFileSync(QUELLE), html = quelleBuf.toString('utf8');
if (Buffer.from(html, 'utf8').compare(quelleBuf) !== 0) fail('Quelle ist kein sauberes UTF-8');
const B = blocks(html), bericht = {werkzeug: 'ausliefern.mjs (PERF2 D)', versionen: VERS, quelle: path.resolve(QUELLE), quelleSha256: sha(quelleBuf), bloecke: []};
let o = '', pos = 0; const soll = [];
for (const b of B) {
  const inhalt = html.slice(b.a, b.b); let neu = inhalt, art;
  if (b.tag === 'script' && JS_TYPES.has(b.type) && !('src' in b.attrs)) {
    const r = jsOhneKommentare(inhalt, 'Skript bei Zeile ' + (nlCount(html.slice(0, b.a)) + 1)); neu = r.out; art = 'js';
    bericht.bloecke.push({art, zeile: nlCount(html.slice(0, b.a)) + 1, vorher: inhalt.length, nachher: neu.length, kommentare: r.kommentare, tokens: r.tokens, schutz: r.schutz, schutzZeilen: r.schutzZeilen, kommentareGeschuetzt: r.kommentareGeschuetzt});
  } else if (b.tag === 'style' && (!b.attrs.type || b.type === 'text/css')) {
    const r = cssOhneKommentare(inhalt); neu = r.out; art = 'css';
    bericht.bloecke.push({art, zeile: nlCount(html.slice(0, b.a)) + 1, vorher: inhalt.length, nachher: neu.length, kommentare: r.kommentare});
  } else { art = 'unberuehrt'; bericht.bloecke.push({art, tag: b.tag, type: b.type, id: b.id, zeile: nlCount(html.slice(0, b.a)) + 1, zeichen: inhalt.length}); }
  o += html.slice(pos, b.a) + neu; pos = b.b; soll.push({tag: b.tag, type: b.type, id: b.id, text: neu});
}
o += html.slice(pos);
// Nachprüfung am fertigen Text
const B2 = blocks(o);
if (B2.length !== soll.length) fail('Anzahl Skript/Stil-Elemente: ' + B2.length + ' statt ' + soll.length);
B2.forEach((b, i) => { const s = soll[i]; if (b.tag !== s.tag || b.type !== s.type || b.id !== s.id || o.slice(b.a, b.b) !== s.text) fail('Element ' + i + ' nach dem Neu-Lesen verschieden'); });
if (nlCount(html) !== nlCount(o)) fail('Zeilenzahl der Datei verschieden');
const zaehl = (s, re) => (s.match(re) || []).length;
const marken = {
  ms2000: [zaehl(html, /MS 2000/g), zaehl(o, /MS 2000/g)],
  live: [zaehl(html, /^  live: true,/gm), zaehl(o, /^  live: true,/gm)],
  version: [zaehl(html, /^const VERSION = '\d+\.\d+\.\d+';/gm), zaehl(o, /^const VERSION = '\d+\.\d+\.\d+';/gm)],
  versionText: (o.match(/^const VERSION = '(\d+\.\d+\.\d+)';/m) || [])[1] || null,
};
if (marken.ms2000[1] !== marken.ms2000[0] || marken.ms2000[1] !== 1) fail('MS 2000: ' + marken.ms2000);
if (marken.live[1] !== 1) fail('live: true, ' + marken.live);
if (marken.version[1] !== 1 || marken.version[0] !== 1) fail('VERSION-Zeile ' + marken.version);
const outBuf = Buffer.from(o, 'utf8');
fs.writeFileSync(ZIEL, outBuf);
Object.assign(bericht, {ziel: path.resolve(ZIEL), zielSha256: sha(outBuf), bytesVorher: quelleBuf.length, bytesNachher: outBuf.length, zeilen: nlCount(html) + 1, marken, sekunden: +((Date.now() - t0) / 1000).toFixed(1)});
if (BERICHT) fs.writeFileSync(BERICHT, JSON.stringify(bericht, null, 1));
console.log('OK ' + quelleBuf.length + ' -> ' + outBuf.length + ' Bytes (' + (100 * (1 - outBuf.length / quelleBuf.length)).toFixed(1) + ' % weniger), ' +
  bericht.bloecke.filter(x => x.art === 'js').length + ' Skripte, ' + bericht.bloecke.filter(x => x.art === 'css').length + ' Stil, ' +
  bericht.bloecke.filter(x => x.art === 'unberuehrt').length + ' unberührt; MS 2000 ' + marken.ms2000[1] + '×, live ' + marken.live[1] + '×, VERSION ' + marken.versionText + '; sha256 ' + bericht.zielSha256.slice(0, 16) + ' (' + bericht.sekunden + ' s)');
