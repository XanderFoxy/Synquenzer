#!/usr/bin/env python3
# SPK6: baut index.html neu aus basis.html + spk6-block.js (nach „/* ===== NX1-END ===== */“) + Haken „SPK6“. Jede Ersetzung genau einmal.
import sys, pathlib
here = pathlib.Path(__file__).resolve().parent
src = (here / 'basis.html').read_text(encoding='utf-8')
blk = (here / 'spk6-block.js').read_text(encoding='utf-8')
out = sys.argv[1] if len(sys.argv) > 1 else str(here / 'index.html')
H = [
 # Kern: Werkstatt anhängen (Ops über Z2.ops)
 ("  return {on, stft, istft, specInfo, docs, lowSplit, Z2};",
  "  if (Z2 && typeof spk6DspMake === 'function') Z2.s6 = spk6DspMake({Z2, V, BT, BLK, win, lay, masksOf, stripe, stCopy, newLayer, verUp, uBegin, uTouch, uEnd, render, block, get, put, del, keys});   // SPK6: Ebenen-Werkstatt (Ops über Z2.ops)\n"
  "  return {on, stft, istft, specInfo, docs, lowSplit, Z2};"),
 # block: Audio-Ebenen und Effekte
 ("  function block(d, k, mx, sel, sv) {\n",
  "  function block(d, k, mx, sel, sv) {\n"
  "    if (typeof Z2 !== 'undefined' && Z2 && Z2.s6 && !mx.n6) { const r6 = Z2.s6.block(d, k, mx, sel, sv); if (r6) return r6; }   // SPK6: Audio-Ebenen und Effekte je Ebene\n"),
 # gainFn: Kopien/Chorstimmen ziehen nichts vom Rest ab
 ("    const NB = NBn(d), acc = new Uint16Array(NB), L = d.meta.layers;\n",
  "    const NB = NBn(d), acc = new Uint16Array(NB), L = d.meta.layers;\n"
  "    const K6 = typeof Z2 !== 'undefined' && Z2 && Z2.s6 ? Z2.s6.k6(d) : null;   // SPK6: Kopien/Chorstimmen ziehen nichts vom Rest ab\n"),
 ("      for (let k = 0; k < NB; k++) { const r = 255 - acc[k]; out[k]",
  "      if (K6) Z2.s6.acc(d, K6, s, c, acc, NB);   // SPK6\n"
  "      for (let k = 0; k < NB; k++) { const r = 255 - acc[k]; out[k]"),
 # Laden / Speichern / Export / Import: Audio der Ebenen
 ("    docs.set(id, d); return d;",
  "    if (typeof Z2 !== 'undefined' && Z2 && Z2.s6) await Z2.s6.open(d);   // SPK6: Audio der Ebenen\n"
  "    docs.set(id, d); return d;"),
 ("    if (d.metaDirty || ds.length) { d.metaDirty = false; await saveMeta(d); }",
  "    if (typeof Z2 !== 'undefined' && Z2 && Z2.s6) bytes += await Z2.s6.flush(d);   // SPK6: Audio der Ebenen\n"
  "    if (d.metaDirty || ds.length) { d.metaDirty = false; await saveMeta(d); }"),
 ("    return {meta: JSON.parse(JSON.stringify(d.meta)), pcm: d.pcm.map(x => x.slice()), masks};",
  "    const r6 = {meta: JSON.parse(JSON.stringify(d.meta)), pcm: d.pcm.map(x => x.slice()), masks}; if (typeof Z2 !== 'undefined' && Z2 && Z2.s6) Z2.s6.exp(d, r6); return r6;   // SPK6: Audio der Ebenen mit"),
 ("    const d = mkDoc(meta); d.pcm = o.pcm; d.mid = new Float32Array(1); await saveMeta(d);",
  "    if (typeof Z2 !== 'undefined' && Z2 && Z2.s6) await Z2.s6.imp(meta, o);   // SPK6: Audio der Ebenen\n"
  "    const d = mkDoc(meta); d.pcm = o.pcm; d.mid = new Float32Array(1); await saveMeta(d);"),
 # Worker-Text
 ("    const src = vsDspMake.toString() + ';' + spk1DspMake.toString()",
  "    const src = vsDspMake.toString() + ';' + (typeof spk6DspMake === 'function' ? spk6DspMake.toString() + ';' : '') /* SPK6 */ + spk1DspMake.toString()"),
 # ZIP
 ("    for (const m of x.masks) if (m.data.length) files.push({name: base + 'm' + m.lid + '.bin', data: m.data});",
  "    for (const m of x.masks) if (m.data.length) files.push({name: base + 'm' + m.lid + '.bin', data: m.data});\n"
  "    if (typeof spk6ZipAdd === 'function') spk6ZipAdd(files, base, x);   // SPK6: Audio der Ebenen"),
 ("      meta.id = id; await spk1Call('import', {meta, pcm, masks}); n++;",
  "      meta.id = id; await spk1Call('import', {meta, pcm, masks, a6: typeof spk6ZipRead === 'function' ? spk6ZipRead(fs, id) : null}); n++;   // SPK6: Audio der Ebenen"),
 # Seite: Ebenen-Menü und Noten-Klappfenster
 ("    const del = el('button', 'mbtn rb spk1-ck', 'Ebene löschen');",
  "    if (typeof spk6MoreDd === 'function') spk6MoreDd(U, dd, lid);   // SPK6: Werkstatt (Duplizieren, Transponieren, Chor, Effekte)\n"
  "    const del = el('button', 'mbtn rb spk1-ck', 'Ebene löschen');"),
 ("    dd.appendChild(el('p', '', 'Die Obertöne der Note wandern in die Ebene.'));",
  "    if (typeof spk6NoteDd === 'function') spk6NoteDd(U, dd, qs);   // SPK6: Noten umsetzen\n"
  "    dd.appendChild(el('p', '', 'Die Obertöne der Note wandern in die Ebene.'));"),

 # Teil 2: Modus „Noten bearbeiten“ (Werkzeug s6ed) – ziehen/tippen/Rahmen, Zeichnen, Kennung in der Ebenen-Zeile
 ("function spk1ToolDown(U, p) {\n",
  "function spk1ToolDown(U, p) {\n"
  "  if (U.tool === 's6ed' && typeof spk6EdDown === 'function') return spk6EdDown(U, p);   /* SPK6: Noten bearbeiten */\n"),
 ("function spk1ToolMove(U, G, p) {\n",
  "function spk1ToolMove(U, G, p) {\n"
  "  if (G.tool === 's6ed' && G.s6 && typeof spk6EdDrag === 'function') return spk6EdDrag(U, G, p);   /* SPK6: Note ziehen */\n"),
 ("function spk1ToolUp(U, G) {\n",
  "function spk1ToolUp(U, G) {\n"
  "  if (G.tool === 's6ed' && typeof spk6EdUp === 'function') return spk6EdUp(U, G);   /* SPK6: Noten bearbeiten */\n"),
 ("x.lineTo(px, H); x.stroke(); }\n}\n/* ---- Gesten:",
  "x.lineTo(px, H); x.stroke(); }\n"
  "  if (typeof spk6EdDraw === 'function') spk6EdDraw(U, x);   /* SPK6: Noten bearbeiten */\n}\n/* ---- Gesten:"),
 ("  }\n}\nasync function spk1Layer(U, was, lid, v) {",
  "  }\n  if (typeof spk6Rows === 'function') spk6Rows(U);   /* SPK6: Kennung Kopie/Chor/FX, Blinken */\n}\nasync function spk1Layer(U, was, lid, v) {"),
 # Block
 ("/* ===== NX1-END ===== */\n", "/* ===== NX1-END ===== */\n" + blk),
]
for a, b in H:
    n = src.count(a)
    if n != 1: sys.exit('Haken %d× gefunden: %r' % (n, a[:90]))
    src = src.replace(a, b)
pathlib.Path(out).write_text(src, encoding='utf-8')
print('ok', out, len(H), 'Ersetzungen')
