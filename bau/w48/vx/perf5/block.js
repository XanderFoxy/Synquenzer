// PERF5 – Vorlagen schlanker (Fortsetzung von PERF4): Worklet-Vorlagen (`…registerProcessor…`) in ALLEN Skripten und
// CSS-Vorlagen in den stillen Blöcken ohne Kommentare/Einrückung/Leerzeilen. Helfer (Zerlegen, Such-Texte, doBlock) aus PERF4.
// Aufruf (von apply.py): node block.js <ein.json> <aus.json>
//   ein.json = {scripts: [{id, block: bool, text}]}
//   aus.json = {texts: [neuer Text je Skript], bericht: {...}}  – Abbruch (Code 1) bei jeder Unstimmigkeit.
// Verfahren je Block: acorn zerlegt (Parser treibt den Tokenizer, Regex/Division sicher); jedes Token bleibt wörtlich
// (Zeichenketten, Vorlagen, Regex, Zahlen). Zwischen zwei Tokens: Zeilenumbruch(e)/mehrzeiliger Kommentar -> genau ein "\n"
// (Semikolon-Automatik unverändert), sonst "" oder " " (nur wo zwei Tokens sonst verschmelzen würden).
// Text-Zugriffe der App bleiben gültig: Such-Texte/Regex aus den Funktionen, die einen Block per Namen lesen, werden vorher und
// nachher auf dem Block gezählt; weicht etwas ab, bleiben die betroffenen Zeilen wörtlich (Wiederholung bis gleich).
// Prüfung: Token-Folge + Zeilenumbruch-Merkmal gleich, Syntaxbaum (ohne Positionen) gleich, sonst Abbruch.
'use strict';
const fs = require('fs'), path = require('path');
const acorn = require(path.join(__dirname, 'acorn.js'));
const [IN, OUT] = process.argv.slice(2);
const inp = JSON.parse(fs.readFileSync(IN, 'utf8'));
const LT = /[\n\r\u2028\u2029]/;
class Stop extends Error {}
const die = m => { throw new Stop(m); };
const stop = m => { console.error('PERF5 ABBRUCH: ' + m); process.exit(1); };

function parse(text, sourceType, extra) {
  const toks = [], coms = [];
  const ast = acorn.parse(text, Object.assign({ecmaVersion: 'latest', sourceType, allowHashBang: true, onToken: toks, onComment: coms}, extra || {}));
  return {ast, toks: toks.filter(t => t.type !== acorn.tokTypes.eof), coms};
}
function tryParse(text) {
  for (const st of ['script', 'module']) { try { return Object.assign(parse(text, st), {st}); } catch (e) { /* nächste Art */ } }
  return null;
}
function astKey(ast) {
  return JSON.stringify(ast, (k, v) => (k === 'start' || k === 'end' || k === 'loc' || k === 'range') ? undefined : v);
}

// ---- Such-Texte der App sammeln: Funktionen (oder oberste Anweisung), die einen Block-Namen als Zeichenkette nennen ----
const ID_RE = /^sq-[\w-]+-src$/;
const PARSED = new Map();
function parsedOf(src) { if (!PARSED.has(src)) PARSED.set(src, tryParse(src)); return PARSED.get(src); }
function collectNeedles(sources, names) {
  const isFn = n => n && (n.type === 'FunctionDeclaration' || n.type === 'FunctionExpression' || n.type === 'ArrowFunctionExpression');
  const scopes = new Map();
  function walk(n, fnStack, top, pk) {
    if (!n || typeof n.type !== 'string') return;
    const hit = names ? (n.type === 'Identifier' && names.has(n.name) && pk !== 'id' ? n.name : null) : (n.type === 'Literal' && typeof n.value === 'string' && ID_RE.test(n.value) ? n.value : null);
    if (hit) { const sc = fnStack.length ? fnStack[fnStack.length - 1] : top; if (!scopes.has(sc)) scopes.set(sc, new Set()); scopes.get(sc).add(hit); }
    const push = isFn(n);
    if (push) fnStack.push(n);
    for (const k in n) {
      if (k === 'type' || k === 'start' || k === 'end') continue;
      const v = n[k];
      if (Array.isArray(v)) { for (const c of v) if (c && typeof c.type === 'string') walk(c, fnStack, top, k); }
      else if (v && typeof v.type === 'string') walk(v, fnStack, top, k);
    }
    if (push) fnStack.pop();
  }
  function lits(n, strs, res) {
    if (!n || typeof n.type !== 'string') return;
    if (n.type === 'Literal') {
      if (n.regex) res.set('/' + n.regex.pattern + '/' + n.regex.flags, n.regex);
      else if (typeof n.value === 'string' && n.value.length >= 4 && n.value.length <= 400 && !ID_RE.test(n.value) && /\S/.test(n.value)) strs.add(n.value);
    }
    if (n.type === 'TemplateLiteral' && n.expressions.length === 0) { const v = n.quasis[0].value.cooked; if (v && v.length >= 4 && v.length <= 400 && /\S/.test(v)) strs.add(v); }
    for (const k in n) {
      if (k === 'type' || k === 'start' || k === 'end') continue;
      const v = n[k];
      if (Array.isArray(v)) { for (const c of v) if (c && typeof c.type === 'string') lits(c, strs, res); }
      else if (v && typeof v.type === 'string') lits(v, strs, res);
    }
  }
  let nScripts = 0, bad = 0;
  for (const src of sources) {
    const p = parsedOf(src); if (!p) { bad++; continue; } nScripts++;
    for (const st of p.ast.body) walk(st, [], st);
  }
  // je Ziel (Block-ID bzw. Vorlagen-Name) nur die Such-Texte der Stellen, die dieses Ziel nennen
  const per = new Map();
  for (const [sc, ids] of scopes) {
    const st = new Set(), rs = new Map(); lits(sc, st, rs);
    for (const id of ids) {
      if (!per.has(id)) per.set(id, {strs: new Set(), res: new Map()});
      const P = per.get(id); for (const x of st) P.strs.add(x); for (const [k, r] of rs) P.res.set(k, r);
    }
  }
  const by = {};
  for (const [id, P] of per) {
    const regs = [];
    for (const [key, r] of P.res) {
      const fl = r.flags.replace(/[gy]/g, '') + 'g';
      try { regs.push({key, re: new RegExp(r.pattern, fl)}); } catch (e) { /* Merkmal unbekannt: nicht nachrechenbar */ }
    }
    by[id] = {strs: [...P.strs], regs};
  }
  const of = id => by[id] || {strs: [], regs: []};
  return {of, nScripts, bad, scopes: scopes.size, ziele: Object.keys(by).length};
}

// ---- ein Block ----
const isW = c => /[\w$\\]/.test(c) || c.charCodeAt(0) > 0x7f;
function needSpace(a, b, aTok) {
  const x = a[a.length - 1], y = b[0];
  if (isW(x) && isW(y)) return true;
  if (aTok.type === acorn.tokTypes.regexp && isW(y)) return true;
  if (aTok.type === acorn.tokTypes.num && y === '.') return true;
  if ((x === '+' && y === '+') || (x === '-' && y === '-')) return true;
  if (x === '/' && (y === '/' || y === '*')) return true;
  if (x === '<' && (y === '!' || y === '/')) return true;
  if (x === '-' && y === '>') return true;
  if (x === '?' && y === '.') return true;
  return false;
}
function lineStarts(text) { const a = [0]; for (let i = 0; i < text.length; i++) { const c = text[i]; if (c === '\n' || c === '\u2028' || c === '\u2029' || (c === '\r' && text[i + 1] !== '\n')) a.push(i + 1); } return a; }
function lineOf(ls, pos) { let lo = 0, hi = ls.length - 1; while (lo < hi) { const m = (lo + hi + 1) >> 1; if (ls[m] <= pos) lo = m; else hi = m - 1; } return lo; }

function build(text, P, prot, ls) {
  // Stücke: [ausStart, origStart, länge, wörtlich?]
  const out = [], map = [];
  let o = 0;
  const put = (s, orig, verb) => { map.push([o, orig, verb]); out.push(s); o += s.length; };
  const T = P.toks;
  for (let i = 0; i <= T.length; i++) {
    const gs = i ? T[i - 1].end : 0, ge = i < T.length ? T[i].start : text.length;
    const gap = text.slice(gs, ge);
    if (gap.length) {
      const l0 = lineOf(ls, gs), l1 = lineOf(ls, Math.max(gs, ge - 1));
      let keep = false; for (let l = l0; l <= l1 && !keep; l++) if (prot.has(l)) keep = true;
      if (keep) put(gap, gs, true);
      else if (LT.test(gap)) put('\n', gs, false);
      else if (!i || i === T.length) put(' ', gs, false);   // PERF5: Rand einer Vorlage (wird verkettet) – nie verschmelzen
      else if (i && i < T.length && needSpace(text.slice(T[i - 1].start, T[i - 1].end), text.slice(T[i].start, T[i].end), T[i - 1])) put(' ', gs, false);
    }
    if (i < T.length) put(text.slice(T[i].start, T[i].end), T[i].start, true);
  }
  return {s: out.join(''), map};
}
function origPos(map, p) { let lo = 0, hi = map.length - 1; while (lo < hi) { const m = (lo + hi + 1) >> 1; if (map[m][0] <= p) lo = m; else hi = m - 1; } const [os, og, verb] = map[lo]; return verb ? og + (p - os) : og; }
function count(s, n) { let c = 0, i = 0; while ((i = s.indexOf(n, i)) >= 0) { c++; i += n.length; } return c; }
function occ(s, n) { const r = []; let i = 0; while ((i = s.indexOf(n, i)) >= 0) { r.push([i, i + n.length]); i += n.length; } return r; }
function rmatch(s, re) { re.lastIndex = 0; const r = []; let m, k = 0; while ((m = re.exec(s)) && k++ < 100000) { if (m[0].length) r.push({a: m.index, b: m.index + m[0].length, v: JSON.stringify([...m])}); else re.lastIndex++; } return r; }

function doBlock(id, text, N) {
  const P = tryParse(text);
  if (!P) return {text, info: {id, unberuehrt: 'kein JS (Zerlegen scheitert)'}};
  // Gaps dürfen nur Leerraum/Kommentare enthalten
  const T = P.toks, coms = P.coms;
  let ci = 0;
  for (let i = 0; i <= T.length; i++) {
    const gs = i ? T[i - 1].end : 0, ge = i < T.length ? T[i].start : text.length;
    let g = '', p = gs;
    while (ci < coms.length && coms[ci].start < ge) { const c = coms[ci]; if (c.start < gs) die(id + ': Kommentar überlappt Token'); g += text.slice(p, c.start); p = c.end; ci++; }
    g += text.slice(p, ge);
    if (/\S/.test(g.replace(/[\s\uFEFF\u00A0\u2028\u2029]/g, ''))) die(id + ': Zwischenraum mit Inhalt bei ' + gs);
  }
  const ls = lineStarts(text), prot = new Set();
  // vorher: Such-Texte / Regex auf dem Original
  const sN = N.strs.filter(n => text.includes(n)), sR = N.regs.map(r => ({r, m: rmatch(text, r.re)})).filter(x => x.m.length);
  let B, rounds = 0;
  for (;;) {
    rounds++; B = build(text, P, prot, ls);
    let bad = 0;
    for (const n of sN) {
      const c0 = count(text, n), c1 = count(B.s, n);
      if (c0 !== c1) { bad++; for (const [a, b] of occ(text, n)) for (let l = lineOf(ls, a); l <= lineOf(ls, b - 1); l++) prot.add(l);
        for (const [a, b] of occ(B.s, n)) { const x = origPos(B.map, a), y = origPos(B.map, b - 1); for (let l = lineOf(ls, x); l <= lineOf(ls, y); l++) prot.add(l); } }
    }
    for (const {r, m} of sR) {
      const m1 = rmatch(B.s, r.re);
      if (m1.length !== m.length || m1.some((q, k) => q.v !== m[k].v)) { bad++;
        for (const q of m) for (let l = lineOf(ls, q.a); l <= lineOf(ls, q.b - 1); l++) prot.add(l);
        for (const q of m1) { const x = origPos(B.map, q.a), y = origPos(B.map, q.b - 1); for (let l = lineOf(ls, x); l <= lineOf(ls, y); l++) prot.add(l); } }
    }
    if (process.env.PERF4_DEBUG && bad) console.error(id, "Runde", rounds, [...prot].slice(0, 20), sN.filter(n => count(text, n) !== count(B.s, n)).map(n => n.slice(0, 60)), sR.filter(x => rmatch(B.s, x.r.re).length !== x.m.length).map(x => x.r.key));
    if (!bad) break;
    if (rounds > 12) die(id + ': Such-Texte nach 12 Runden nicht gleich');
  }
  // Prüfung
  let Q; try { Q = parse(B.s, P.st); } catch (e) { die(id + ': Ausgabe nicht zerlegbar: ' + e.message); }
  if (Q.toks.length !== T.length) die(id + ': Token-Zahl ' + Q.toks.length + ' statt ' + T.length);
  for (let i = 0; i < T.length; i++) {
    const a = T[i], b = Q.toks[i];
    if (a.type !== b.type || text.slice(a.start, a.end) !== B.s.slice(b.start, b.end)) die(id + ': Token ' + i + ' verschieden');
    const nlA = i ? LT.test(text.slice(T[i - 1].end, a.start)) || false : false, nlB = i ? LT.test(B.s.slice(Q.toks[i - 1].end, b.start)) : false;
    // mehrzeiliger Kommentar zählt als Umbruch – im Original steckt er im Zwischenraum, also schon in nlA
    if (nlA !== nlB) die(id + ': Zeilenumbruch-Merkmal vor Token ' + i + ' verschieden');
  }
  if (astKey(P.ast) !== astKey(Q.ast)) die(id + ': Syntaxbaum verschieden');
  for (const n of sN) if (count(text, n) !== count(B.s, n)) die(id + ': Such-Text verschieden');
  return {text: B.s, info: {id, art: P.st, vorher: text.length, nachher: B.s.length, kommentare: coms.length, kommentareBehalten: Q.coms.length,
    zeilen: [ls.length, lineStarts(B.s).length], geschuetzteZeilen: prot.size, suchTexte: sN.length, suchRegex: sR.length, runden: rounds}};
}

// ======================= PERF5 =======================
// ---- CSS: Kommentare raus, Leerraum neben { } ; , weg, sonst genau ein Leerzeichen; Zeichenketten/url() wörtlich ----
const CSS_DEL = new Set(['{', '}', ';', ',']);
function cssTok(s) {
  const r = []; let i = 0;
  while (i < s.length) {
    const c = s[i];
    if (c === '/' && s[i + 1] === '*') { const e = s.indexOf('*/', i + 2); if (e < 0) die('CSS: Kommentar offen'); r.push({t: 'com', v: s.slice(i, e + 2)}); i = e + 2; continue; }
    if (/[ \t\n\r\f]/.test(c)) { let j = i; while (j < s.length && /[ \t\n\r\f]/.test(s[j])) j++; r.push({t: 'ws', v: s.slice(i, j)}); i = j; continue; }
    if (c === '"' || c === "'") { const e = s.indexOf(c, i + 1); if (e < 0 || /[\n\r\f]/.test(s.slice(i, e))) die('CSS: Zeichenkette offen'); r.push({t: 'str', v: s.slice(i, e + 1)}); i = e + 1; continue; }
    const m = /^url\(\s*(?=[^\s"'])/i.exec(s.slice(i, i + 8));
    if (m && !(i && /[\w-]/.test(s[i - 1]))) { const e = s.indexOf(')', i); if (e < 0) die('CSS: url( offen'); r.push({t: 'url', v: s.slice(i, e + 1)}); i = e + 1; continue; }
    if (/[\w-]/.test(c) || c.charCodeAt(0) > 0x7f) { let j = i; while (j < s.length && (/[\w-]/.test(s[j]) || s.charCodeAt(j) > 0x7f)) j++; r.push({t: 'w', v: s.slice(i, j)}); i = j; continue; }
    r.push({t: 'ch', v: c}); i++;
  }
  return r;
}
// Gerüst: Liste der Inhalts-Token + je Lücke (davor) {ws, com, roh}
function cssFrame(s) {
  const T = cssTok(s), items = [], gaps = [];
  let g = {ws: false, com: false, raw: ''};
  for (const t of T) {
    if (t.t === 'ws' || t.t === 'com') { if (t.t === 'ws') g.ws = true; else g.com = true; g.raw += t.v; continue; }
    gaps.push(g); items.push(t); g = {ws: false, com: false, raw: ''};
  }
  gaps.push(g);
  return {items, gaps};
}
const isDel = t => t && t.t === 'ch' && CSS_DEL.has(t.v);
function cssMin(s) {
  const {items, gaps} = cssFrame(s);
  let o = '';
  for (let k = 0; k < gaps.length; k++) {
    const g = gaps[k], a = items[k - 1], b = items[k], rand = !a || !b;
    if (g.raw) {
      if (rand) o += g.ws ? '\n' : g.raw;                     // Rand (Vorlage wird ggf. verkettet): höchstens ein Umbruch
      else if (isDel(a) || isDel(b)) o += '';
      else if (g.ws) o += ' ';
      else o += g.raw;                                        // nur Kommentar ohne Leerraum (a/**/b): wörtlich
    }
    if (b) o += b.v;
  }
  return o;
}
function cssCheck(a, b) {
  const A = cssFrame(a), B = cssFrame(b);
  if (A.items.length !== B.items.length) die('CSS: Token-Zahl verschieden');
  for (let k = 0; k < A.items.length; k++) if (A.items[k].t !== B.items[k].t || A.items[k].v !== B.items[k].v) die('CSS: Token ' + k + ' verschieden');
  for (let k = 0; k < A.gaps.length; k++) {
    const x = A.gaps[k], y = B.gaps[k], p = A.items[k - 1], q = A.items[k];
    if (!p || !q) { if (!!x.raw !== !!y.raw) die('CSS: Rand verschieden'); continue; }
    if (isDel(p) || isDel(q)) continue;
    if (x.ws !== y.ws) die('CSS: Leerraum-Merkmal vor Token ' + k + ' verschieden');
    if (!x.ws && x.raw !== y.raw) die('CSS: Kommentar-Lücke verschieden');
  }
  // Klammer-Gleichgewicht als zusätzliche Probe
  const bal = s => cssFrame(s).items.reduce((d, t) => d + (t.v === '{' ? 1 : t.v === '}' ? -1 : 0), 0);
  if (bal(a) !== 0 || bal(b) !== 0) die('CSS: Klammern unausgeglichen');
}
function looksCss(raw) {
  try { const {items} = cssFrame(raw); let d = 0, rules = 0, colon = 0;
    for (const t of items) { if (t.v === '{') { d++; rules++; } else if (t.v === '}') { d--; if (d < 0) return false; } else if (t.v === ':' && d) colon++; else if (t.t === 'ch' && /[<`]/.test(t.v)) return false; }
    return d === 0 && rules >= 3 && colon >= rules; } catch (e) { return false; }
}

// ---- Vorlagen finden: ` … ` ohne ${, ohne \, ohne ` (Inhalt = roh = gekocht) ----
function enclosingFnName(ast, pos) {
  let best = null;
  (function walk(n) {
    if (!n || typeof n.type !== 'string' || pos < n.start || pos >= n.end) return;
    if ((n.type === 'FunctionDeclaration' || n.type === 'FunctionExpression') && n.id) best = n.id.name;
    for (const k in n) { if (k === 'type') continue; const v = n[k];
      if (Array.isArray(v)) { for (const c of v) if (c && typeof c.type === 'string') walk(c); } else if (v && typeof v.type === 'string') walk(v); }
  })(ast);
  return best;
}
function templates(text, isBlock) {
  const P = parsedOf(text); if (!P) return [];
  const T = P.toks, r = [], tt = acorn.tokTypes;
  for (let i = 1; i + 1 < T.length; i++) {
    const k = T[i];
    if (k.type !== tt.template || T[i - 1].type !== tt.backQuote || T[i + 1].type !== tt.backQuote) continue;
    const raw = text.slice(k.start, k.end);
    if (raw.length < 1000 || raw.includes('\\') || raw.includes('${') || raw.includes('`')) continue;
    let art = null;
    if (raw.includes('registerProcessor') && raw.includes('AudioWorkletProcessor')) art = 'wk';
    else if (isBlock && looksCss(raw)) art = 'css';
    if (!art) continue;
    let name = null;
    if (i >= 4 && T[i - 2].type === tt.eq && T[i - 3].type === tt.name && T[i - 4].type === tt.dot) name = null;   // x.textContent = `…`: nur hier benutzt
    else if (i >= 3 && T[i - 2].type === tt.eq && T[i - 3].type === tt.name) name = T[i - 3].value;
    else name = enclosingFnName(P.ast, k.start);   // z. B. function mx2ModSrc(){return`…`}
    r.push({art, name, start: k.start, end: k.end, raw});
  }
  return r;
}

// ---- Hauptlauf ----
const S = inp.scripts, sources = S.map(x => x.text);
const N = collectNeedles(sources);
const TP = S.map(x => templates(x.text, x.block));
const names = new Set(); for (const L of TP) for (const t of L) if (t.name) names.add(t.name);
const NW = names.size ? collectNeedles(sources, names) : {of: () => ({strs: [], regs: []}), scopes: 0};
const same = (Nd, a, b) => Nd.strs.every(n => count(a, n) === count(b, n)) && Nd.regs.every(r => { const x = rmatch(a, r.re), y = rmatch(b, r.re); return x.length === y.length && x.every((q, k) => q.v === y[k].v); });
const out = {texts: [], bericht: {skripte: N.nScripts, nichtZerlegbar: N.bad, namen: [...names], vorlagenZugriffe: NW.scopes || 0, vorlagen: [], skripteGeaendert: []}};
// Syntaxbaum-Vergleich ohne Positionen; TemplateElement-Werte ausgenommen (die Token-Prüfung deckt sie ab)
function astSame(x, y) {
  if (x === y) return true;
  if (typeof x !== 'object' || typeof y !== 'object' || !x || !y) return Number.isNaN(x) && Number.isNaN(y);
  if (Array.isArray(x) !== Array.isArray(y)) return false;
  if (x.type === 'TemplateElement' && y.type === 'TemplateElement') return x.tail === y.tail;
  if (x instanceof RegExp || y instanceof RegExp) return String(x) === String(y);
  const kx = Object.keys(x).filter(k => k !== 'start' && k !== 'end' && k !== 'loc' && k !== 'range'), ky = Object.keys(y).filter(k => k !== 'start' && k !== 'end' && k !== 'loc' && k !== 'range');
  if (kx.length !== ky.length) return false;
  for (const k of kx) { if (!(k in y)) return false; if (!astSame(x[k], y[k])) return false; }
  return true;
}
for (let si = 0; si < S.length; si++) {
  const {id, block, text} = S[si], L = TP[si];
  if (!L.length) { out.texts.push(text); continue; }
  let t = '', p = 0; const rep = new Map();
  for (const w of L) {
    const Nd = w.name ? NW.of(w.name) : {strs: [], regs: []};
    let neu = w.raw, info = {id: id + ':' + (w.name || '?') + '@' + w.start, art: w.art, vorher: w.raw.length};
    try {
      if (w.art === 'wk') { const r = doBlock(info.id, w.raw, Nd); neu = r.text; Object.assign(info, {suchTexte: r.info.suchTexte, geschuetzteZeilen: r.info.geschuetzteZeilen}); }
      else { neu = cssMin(w.raw); cssCheck(w.raw, neu); if (!same(Nd, w.raw, neu)) { info.unberuehrt = 'Such-Texte der App verschieden'; info.texte = Nd.strs.filter(n => count(w.raw, n) !== count(neu, n)).slice(0, 6); info.regex = Nd.regs.filter(r => rmatch(w.raw, r.re).length !== rmatch(neu, r.re).length).map(r => r.key).slice(0, 6); neu = w.raw; } }
    } catch (e) { if (!(e instanceof Stop)) throw e; stop(info.id + ': ' + e.message); }
    if (neu.includes('\\') || neu.includes('`') || neu.includes('${')) stop(info.id + ': Zeichen für Vorlage ungeeignet');
    info.nachher = neu.length; out.bericht.vorlagen.push(info);
    t += text.slice(p, w.start) + neu; p = w.end; rep.set(w.start, neu);
  }
  t += text.slice(p);
  if (t === text) { out.texts.push(text); continue; }
  // äußere Prüfung: gleiche Token (nur die Vorlagen-Inhalte anders), Syntaxbaum gleich (Vorlagen-Werte ausgenommen), Such-Texte gleich
  const A = parsedOf(text); let Bp;
  try { Bp = parse(t, A.st); } catch (e) { stop(id + ': Ergebnis nicht zerlegbar: ' + e.message); }
  if (Bp.toks.length !== A.toks.length) stop(id + ': Token-Zahl verschieden');
  for (let i = 0; i < A.toks.length; i++) { const a = A.toks[i], b = Bp.toks[i]; const want = rep.has(a.start) ? rep.get(a.start) : text.slice(a.start, a.end);
    if (a.type !== b.type || t.slice(b.start, b.end) !== want) stop(id + ': Token ' + i + ' verschieden'); }
  if (!astSame(A.ast, Bp.ast)) stop(id + ': Syntaxbaum verschieden');
  if (block && !same(N.of(id), text, t)) stop(id + ': Such-Texte (Block) verschieden');
  out.bericht.skripteGeaendert.push({id, vorher: text.length, nachher: t.length});
  out.texts.push(t);
}
fs.writeFileSync(OUT, JSON.stringify(out));
