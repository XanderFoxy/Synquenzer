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
// Werte mit var(…) und eigene Eigenschaften (--x) hält der Browser als Original-Text (CSSOM zeigt jeden Leerraum):
// dort bleibt der Leerraum innerhalb des Werts wörtlich.
function cssVerbatimGaps(items) {
  const keep = new Set();
  for (let k = 2; k < items.length; k++) {
    if (items[k].v !== ':' || items[k - 1].t !== 'w' || !(items[k - 2].v === '{' || items[k - 2].v === ';')) continue;
    let d = 0, e = k + 1, sub = items[k - 1].v.startsWith('--');
    for (; e < items.length; e++) { const v = items[e].v;
      if (v === '(') d++; else if (v === ')') d--; else if (d <= 0 && (v === ';' || v === '}' || v === '{')) break;
      if (items[e].t === 'w' && /^var$/i.test(v) && items[e + 1] && items[e + 1].v === '(') sub = true; }
    if (e >= items.length || items[e].v === '{' || !sub) continue;
    for (let g = k + 1; g < e; g++) keep.add(g);   // Lücke g = vor items[g]: nach ':' bis vor dem letzten Wert-Token
  }
  return keep;
}
function cssMin(s) {
  const {items, gaps} = cssFrame(s), keep = cssVerbatimGaps(items);
  let o = '';
  for (let k = 0; k < gaps.length; k++) {
    const g = gaps[k], a = items[k - 1], b = items[k], rand = !a || !b;
    if (g.raw) {
      if (keep.has(k)) o += g.raw;
      else if (rand) o += g.ws ? '\n' : g.raw;                     // Rand (Vorlage wird ggf. verkettet): höchstens ein Umbruch
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
const names = new Set(); for (let si = 0; si < S.length; si++) for (const t of TP[si]) if (t.name && !(t.art === 'css' && S[si].block)) names.add(t.name);
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
    // Worklet-Namen (eindeutig, z. B. ST_WK): Zugriffe aus allen Skripten; CSS-Namen in Blöcken (oft nur „css“, der Name kommt
    // in vielen fremden Funktionen vor): Zugriffe nur aus demselben Block – dort ist die Vorlage deklariert und wird benutzt.
    const Nd = !w.name ? {strs: [], regs: []} : w.art === 'css' && block ? collectNeedles([text], new Set([w.name])).of(w.name) : NW.of(w.name);
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
