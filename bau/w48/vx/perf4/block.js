// PERF4 – stille Blöcke (<script type="text/plain" id="sq-…-src">) schlanker: Kommentare, Einrückung, Leerzeilen raus.
// Aufruf (von apply.py): node block.js <ein.json> <aus.json>
//   ein.json = {blocks: {id: text}, main: [text der ausführbaren Skripte]}
//   aus.json = {blocks: {id: text}, bericht: {...}}  – Abbruch (Code 1) bei jeder Unstimmigkeit.
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
const LT = /[\n\r  ]/;
const die = m => { console.error('PERF4 ABBRUCH: ' + m); process.exit(1); };

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
function collectNeedles(sources) {
  const strs = new Set(), res = new Map();
  const isFn = n => n && (n.type === 'FunctionDeclaration' || n.type === 'FunctionExpression' || n.type === 'ArrowFunctionExpression');
  const scopes = new Set();
  function walk(n, fnStack, top) {
    if (!n || typeof n.type !== 'string') return;
    if (n.type === 'Literal' && typeof n.value === 'string' && ID_RE.test(n.value)) scopes.add(fnStack.length ? fnStack[fnStack.length - 1] : top);
    const push = isFn(n);
    if (push) fnStack.push(n);
    for (const k in n) {
      if (k === 'type' || k === 'start' || k === 'end') continue;
      const v = n[k];
      if (Array.isArray(v)) { for (const c of v) if (c && typeof c.type === 'string') walk(c, fnStack, top); }
      else if (v && typeof v.type === 'string') walk(v, fnStack, top);
    }
    if (push) fnStack.pop();
  }
  function lits(n) {
    if (!n || typeof n.type !== 'string') return;
    if (n.type === 'Literal') {
      if (n.regex) res.set('/' + n.regex.pattern + '/' + n.regex.flags, n.regex);
      else if (typeof n.value === 'string' && n.value.length >= 4 && !ID_RE.test(n.value) && /\S/.test(n.value)) strs.add(n.value);
    }
    if (n.type === 'TemplateLiteral' && n.expressions.length === 0) { const v = n.quasis[0].value.cooked; if (v && v.length >= 4 && /\S/.test(v)) strs.add(v); }
    for (const k in n) {
      if (k === 'type' || k === 'start' || k === 'end') continue;
      const v = n[k];
      if (Array.isArray(v)) { for (const c of v) if (c && typeof c.type === 'string') lits(c); }
      else if (v && typeof v.type === 'string') lits(v);
    }
  }
  let nScripts = 0, bad = 0;
  for (const src of sources) {
    const p = tryParse(src); if (!p) { bad++; continue; } nScripts++;
    for (const st of p.ast.body) walk(st, [], st);
  }
  for (const s of scopes) lits(s);
  const regs = [];
  for (const [key, r] of res) {
    let fl = r.flags.replace(/[gy]/g, '') + 'g';
    try { regs.push({key, re: new RegExp(r.pattern, fl)}); } catch (e) { /* Merkmal unbekannt: nicht nachrechenbar */ }
  }
  return {strs: [...strs], regs, nScripts, bad, scopes: scopes.size};
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
function lineStarts(text) { const a = [0]; for (let i = 0; i < text.length; i++) { const c = text[i]; if (c === '\n' || c === ' ' || c === ' ' || (c === '\r' && text[i + 1] !== '\n')) a.push(i + 1); } return a; }
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
    if (/\S/.test(g.replace(/[\s﻿   ]/g, ''))) die(id + ': Zwischenraum mit Inhalt bei ' + gs);
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

const N = collectNeedles(Object.values(inp.blocks).concat(inp.main));
const out = {blocks: {}, bericht: {skripte: N.nScripts, nichtZerlegbar: N.bad, zugriffsStellen: N.scopes, suchTexte: N.strs.length, suchRegex: N.regs.length, bloecke: []}};
for (const [id, text] of Object.entries(inp.blocks)) {
  const r = doBlock(id, text, N);
  out.blocks[id] = r.text; out.bericht.bloecke.push(r.info);
}
fs.writeFileSync(OUT, JSON.stringify(out));
