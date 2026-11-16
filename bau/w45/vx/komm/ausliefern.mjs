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
//    Ausnahme (PERF2 F): Blöcke in TEXT_PLAIN_ALS_SKRIPT (heute nur sq-spk-src = Spektral-Code aus PERF2 E) werden wie ein
//    Skript behandelt (gleiches Verfahren, gleiche AST-Prüfung). Erlaubt nur, weil blockLoad den Text unverändert als
//    klassisches Skript ausführt und sonst kein Code darin per Text sucht; das prüft das Werkzeug selbst: in der Ausgabe darf
//    der Name nur noch zweimal vorkommen (id-Attribut + der eine blockLoad-Aufruf), sonst Abbruch.
//  - <style>: nur Kommentare raus (postcss-Tokenizer); ein Kommentar mit Zeilenumbrüchen wird zu ebenso vielen "\n".
//  - Schutz-Zeilen (Pflicht-Marken und Werkzeuge, die die Datei per Text lesen) behalten Einrückung und Abstände:
//    "^  live: true," und "const VERSION = '<Fassung>';". Nur ihr Kommentar am Zeilenende fällt weg.
//  - Schutz-Funktionen bleiben samt Kommentaren wörtlich: vsCleanMake (clCoreVer() bildet aus vsCleanMake.toString()
//    den Schlüssel des Reinigungs-Zwischenspeichers im Audio-Store; geänderter Text = alle gereinigten Takes neu rechnen).
// Prüfungen (sonst Abbruch mit Code 1, keine Ausgabe): je Skript AST der Ausgabe == AST der Quelle (ohne Positionen, mit
// raw-Texten) und jede Knoten-Startzeile gleich; 0 Kommentare in der Ausgabe; CSS-Baum (postcss) ohne Kommentare gleich;
// Ausgabe erneut mit parse5 gelesen: gleiche Skript-/Stil-Elemente, übrige text/plain-Inhalte bytegleich; gleiche Zeilenzahl;
// "MS 2000" gleich oft (Quelle 1×), "^  live: true," 1×, VERSION-Zeile 1×.
import fs from 'node:fs'; import path from 'node:path'; import crypto from 'node:crypto'; import { createRequire } from 'node:module';
const WZ = fs.existsSync(new URL('./werkzeug/package.json', import.meta.url)) ? new URL('./werkzeug/', import.meta.url) : new URL('file:///tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/vx/perf2/werkzeug/');   // KOMM
const req = createRequire(new URL('package.json', WZ));   // KOMM
const acorn = req('acorn'), parse5 = req('parse5'), postcss = req('postcss'), cssTokenize = req('postcss/lib/tokenize');
const VERS = Object.fromEntries(['acorn', 'parse5', 'postcss'].map(m => [m, JSON.parse(fs.readFileSync(new URL('node_modules/' + m + '/package.json', WZ))).version]));

const KOMM_AN = !process.argv.includes('--ohne-komm');   // KOMM: --ohne-komm = Verhalten wie PERF2 (Vergleich)
const [, , QUELLE, ZIEL, BERICHT] = process.argv.filter(a => a !== '--ohne-komm');   // KOMM
if (!QUELLE || !ZIEL) { console.error('Aufruf: node ausliefern.mjs <quelle.html> <auslieferung.html> [<bericht.json>]'); process.exit(2); }
const fail = m => { console.error('ABBRUCH: ' + m); process.exit(1); };

const SCHUTZ_ZEILEN = [/^  live: true,/, /^const VERSION = '\d+\.\d+\.\d+';/];
const SCHUTZ_FUNKTIONEN = ['vsCleanMake'];
const TEXT_PLAIN_ALS_SKRIPT = ['sq-spk-src'];   // PERF2 F: nur Blöcke, die allein blockLoad liest (siehe Kopf)
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
function jsOhneKommentare(src, info, opt) {   // KOMM: opt = Block-Regeln aus KOMM_BLOECKE
  opt = opt || {}; const ST = opt.sourceType || 'script';   // KOMM
  const toks = [], coms = [];
  let ast;
  try { ast = acorn.parse(src, {ecmaVersion: 'latest', sourceType: ST, locations: true, onToken: toks, onComment: coms}); }   // KOMM
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
  lines.forEach((l, i) => { if (SCHUTZ_ZEILEN.concat(opt.zeilen || []).some(r => r.test(l))) zeilen.add(i + 1); });   // KOMM
  const inSchutz = (s, e) => schutz.some(([a, b]) => s >= a && e <= b);
  const kG = (a, b) => kommGap(src, coms, opt.kommentare, a, b);   // KOMM
  const lineStart = [0]; { src.replace(NL, (m, off) => { lineStart.push(off + m.length); return m; }); }
  const parts = []; let prev = null;
  for (const t of T) {
    const gap = src.slice(prev ? prev.end : 0, t.start), tt = src.slice(t.start, t.end);
    const kg = kG(prev ? prev.end : 0, t.start);   // KOMM
    if (kg !== null) parts.push(kg);   // KOMM: Lücke mit Schutz-Kommentar
    else if (!prev) parts.push('\n'.repeat(nlCount(gap)));
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
  const kgE = kG(prev ? prev.end : 0, src.length);   // KOMM
  parts.push(kgE !== null ? kgE : '\n'.repeat(nlCount(src.slice(prev ? prev.end : 0))));
  const out = parts.join('');
  // Prüfung: gleicher AST, gleiche Startzeilen, keine Kommentare
  const coms2 = []; let ast2;
  try { ast2 = acorn.parse(out, {ecmaVersion: 'latest', sourceType: ST, locations: true, onComment: coms2}); }   // KOMM
  catch (e) { fail('Ausgabe nicht lesbar (' + info + '): ' + e.message); }
  const schutzKom = coms.filter(c => inSchutz(c.start, c.end) || kommIstSchutz(src, c, opt.kommentare)).length;   // KOMM
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

/* KOMM-BEGIN – OFFEN-1611 A8: die übrigen text/plain-Blöcke (Worker-/Worklet-/Lade-Quelltexte) ohne Kommentare und Einrückung.
   Gleiches Token-Verfahren wie bei den Skripten (acorn; Zeichenketten, Vorlagen, Regex unverändert; Zeilen gleich; AST-Prüfung).
   Je Block steht hier, WIE die App ihn liest (Zugriffs-Stellen im Code, geprüft auf 4.76.1):
     script = per <script>-Element ausgewertet (g9Load, arpSrcLoad, blockLoad, ndpLoad, mkLoad, bmLoad) – nur ausführen, kein Textsuchen;
     module = als AudioWorklet-Modul geladen (addModule Blob/data:) – strenger Modus, deshalb mit sourceType 'module' geprüft.
   sq-worklet-src wird zusätzlich per Text gelesen; diese Zugriffe bleiben erhalten und werden nach dem Kürzen nachgerechnet:
     mkwEval: die zwei Anker-Kommentare MKW{ und }MKW (bleiben wörtlich, Code dazwischen per new Function) · vv3Fmx: 'const LEVEL_LUT' …
     erster Kommentar '// V0d (A.4b 3)' (bleibt wörtlich) · lkWkCheck: /const PVA = '…'/ und /const PVM = '…'/ (Zeilen behalten Abstände).
   stellen = erwartete Zahl der Stellen in der AUSGABE, an denen der Name als eigene Zeichenkette ('id', "id", `id`) oder #id steht
   (inkl. id-Attribut). Weicht sie ab (neuer Zugriff per Text?), bricht das Werkzeug ab – dann Zugriff prüfen und Zahl anpassen
   oder den Block hier herausnehmen (er bleibt dann bytegleich). */
const KOMM_BLOECKE = {
  'sq-g9-src': {sourceType: 'script', stellen: 2},
  'sq-arp-src': {sourceType: 'script', stellen: 2},
  'sq-form-src': {sourceType: 'script', stellen: 2},
  'sq-sr-src': {sourceType: 'script', stellen: 2},
  'sq-ndp-src': {sourceType: 'script', stellen: 2},
  'sq-mk-src': {sourceType: 'script', stellen: 2},
  'sq-bm-src': {sourceType: 'script', stellen: 2},
  'sq-md-src': {sourceType: 'module', stellen: 2},
  'sq-worklet-src': {sourceType: 'module', stellen: 8,
    kommentare: ['/*MKW{*/', '/*}MKW*/', '// V0d (A.4b 3)'],
    zeilen: [/const PVA = '/, /const PVM = '/, /const LEVEL_LUT/],
    zugriffe: [{art: 'regex', re: /const PVA = '([^']*)'/}, {art: 'regex', re: /const PVM = '([^']*)'/},
      {art: 'stueck', von: '/*MKW{*/', bis: '/*}MKW*/', ab: 8}, {art: 'stueck', von: 'const LEVEL_LUT', bis: '// V0d (A.4b 3)', ab: 0}]},
};
function kommIstSchutz(src, c, liste) { if (!liste || !liste.length) return false; const t = src.slice(c.start, c.end); return liste.some(p => t.startsWith(p)); }
// Lücke [a, b) zwischen zwei Tokens mit mindestens einem Schutz-Kommentar: Kommentar wörtlich, davor/danach nur so viele "\n" wie vorher
// (sonst ein Leerzeichen, damit nichts verschmilzt); andere Kommentare der Lücke fallen weg. null = kein Schutz-Kommentar in der Lücke.
function kommGap(src, coms, liste, a, b) {
  if (!liste || !liste.length) return null;
  const k = coms.filter(c => c.start >= a && c.end <= b && kommIstSchutz(src, c, liste)); if (!k.length) return null;
  let out = '', pos = a; const zw = x => { const n = nlCount(x); return n ? '\n'.repeat(n) : ' '; };
  for (const c of k) { out += zw(src.slice(pos, c.start)) + src.slice(c.start, c.end); pos = c.end; }
  return out + zw(src.slice(pos, b));
}
// Text-Zugriffe der App auf den gekürzten Block nachrechnen (gleiche Treffer, gleicher Baum der ausgeschnittenen Stücke)
function kommZugriffe(id, alt, neu, regeln) {
  for (const z of regeln.zugriffe || []) {
    if (z.art === 'regex') { const x = z.re.exec(alt), y = z.re.exec(neu); if (!x || !y || x[1] !== y[1]) fail(id + ': Text-Zugriff ' + z.re + ' liefert nicht dasselbe'); continue; }
    const st = s => { const a = s.indexOf(z.von), b = s.indexOf(z.bis); if (a < 0 || b <= a) fail(id + ': Anker ' + z.von + ' … ' + z.bis + ' fehlt'); return s.slice(a + z.ab, b); };
    const p = s => acorn.parse(s, {ecmaVersion: 'latest', sourceType: 'script', allowReturnOutsideFunction: true, locations: true});
    let A, B; try { A = p(st(alt)); B = p(st(neu)); } catch (e) { fail(id + ': Stück ' + z.von + ' nicht lesbar: ' + e.message); }
    const d = astDiff(A, B, 'Stück'); if (d) fail(id + ': Stück ' + z.von + ' … ' + z.bis + ' verschieden: ' + d);
  }
  for (const k of regeln.kommentare || []) if (alt.split(k).length !== neu.split(k).length) fail(id + ': Schutz-Kommentar ' + k + ' nicht gleich oft');
}
function kommStellen(o, id) { const e = id.replace(/[-]/g, '\\-'); return (o.match(new RegExp("['\"`]" + e + "['\"`]|#" + e + '(?![\\w-])', 'g')) || []).length; }
/* KOMM-END */

// ---------- Ablauf ----------
const t0 = Date.now();
const quelleBuf = fs.readFileSync(QUELLE), html = quelleBuf.toString('utf8');
if (Buffer.from(html, 'utf8').compare(quelleBuf) !== 0) fail('Quelle ist kein sauberes UTF-8');
const B = blocks(html), bericht = {werkzeug: KOMM_AN ? 'ausliefern.mjs (PERF2 D + F + KOMM)' : 'ausliefern.mjs (PERF2 D + F, --ohne-komm)', versionen: VERS, quelle: path.resolve(QUELLE), quelleSha256: sha(quelleBuf), bloecke: []};
let o = '', pos = 0; const soll = [];
for (const b of B) {
  const inhalt = html.slice(b.a, b.b); let neu = inhalt, art;
  const alsSkript = b.tag === 'script' && b.type === 'text/plain' && (TEXT_PLAIN_ALS_SKRIPT.includes(b.id) || KOMM_AN && b.id in KOMM_BLOECKE) && !('src' in b.attrs);   // KOMM
  if ((b.tag === 'script' && JS_TYPES.has(b.type) && !('src' in b.attrs)) || alsSkript) {
    const r = jsOhneKommentare(inhalt, (alsSkript ? 'Block ' + b.id : 'Skript') + ' bei Zeile ' + (nlCount(html.slice(0, b.a)) + 1), alsSkript ? KOMM_BLOECKE[b.id] : null); neu = r.out; art = alsSkript ? 'js-block' : 'js';   // KOMM
    if (alsSkript && KOMM_BLOECKE[b.id]) kommZugriffe(b.id, inhalt, neu, KOMM_BLOECKE[b.id]);   // KOMM
    bericht.bloecke.push({art, id: b.id || undefined, quellart: alsSkript && KOMM_BLOECKE[b.id] ? KOMM_BLOECKE[b.id].sourceType : undefined, zeile: nlCount(html.slice(0, b.a)) + 1, vorher: inhalt.length, nachher: neu.length, kommentare: r.kommentare, tokens: r.tokens, schutz: r.schutz, schutzZeilen: r.schutzZeilen, kommentareGeschuetzt: r.kommentareGeschuetzt});   // KOMM (quellart)
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
// PERF2 F: als Skript behandelte text/plain-Blöcke – kein anderer Code darf sie per Text lesen (nur id + blockLoad-Aufruf)
for (const id of TEXT_PLAIN_ALS_SKRIPT) {
  if (!B.some(b => b.id === id && b.type === 'text/plain')) continue;
  const n = zaehlId(o, id);
  if (n !== 2 || !o.includes("blockLoad('" + id + "'")) fail(id + ': ' + n + ' Erwähnungen statt 2 (id + blockLoad) – neuer Text-Zugriff? Block dann aus TEXT_PLAIN_ALS_SKRIPT nehmen oder Zugriff prüfen');
}
if (KOMM_AN) for (const id in KOMM_BLOECKE) { if (!B.some(b => b.id === id && b.type === 'text/plain')) continue; const n = kommStellen(o, id); if (n !== KOMM_BLOECKE[id].stellen) fail(id + ': ' + n + ' Text-Stellen statt ' + KOMM_BLOECKE[id].stellen + ' – neuer Zugriff per Text? prüfen, dann KOMM_BLOECKE anpassen'); }   // KOMM
const zaehl = (s, re) => (s.match(re) || []).length;
function zaehlId(s, id) { let n = 0, i = -1; while ((i = s.indexOf(id, i + 1)) >= 0) n++; return n; }
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
  bericht.bloecke.filter(x => x.art === 'js').length + ' Skripte, ' + bericht.bloecke.filter(x => x.art === 'js-block').length + ' Block als Skript, ' + bericht.bloecke.filter(x => x.art === 'css').length + ' Stil, ' +
  bericht.bloecke.filter(x => x.art === 'unberuehrt').length + ' unberührt; MS 2000 ' + marken.ms2000[1] + '×, live ' + marken.live[1] + '×, VERSION ' + marken.versionText + '; sha256 ' + bericht.zielSha256.slice(0, 16) + ' (' + bericht.sekunden + ' s)');
