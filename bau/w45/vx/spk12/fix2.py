import sys
D = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/vx/spk12/'
P = D + 'spk12-block.js'
s = open(P, encoding='utf-8').read()
def rep(a, b, n=1):
    global s
    c = s.count(a)
    if c != n: sys.exit('Anzahl %d statt %d: %r' % (c, n, a[:100]))
    s = s.replace(a, b)
# 2) ↶-Reihenfolge: Kern-Stand ohne Redo-Tiefe (nach einem Kern-↶ wächst nr, der Auswahl-Schritt bleibt trotzdem oben)
rep("const spk12Ku = () => { const r = SPK1.last; return r ? r.nu + '|' + r.nr + '|' + (r.undo || '') : '0'; };",
    "const spk12Ku = () => { const r = SPK1.last; return r ? r.nu + '|' + (r.undo || '') : '0'; };   // Prüfung: nur Undo-Tiefe + Name (nr ändert sich bei jedem Kern-↶)")
# 5) Leiste: Neu │ + │ − │ ∩ · Auswahl ▾ hinter die vorhandenen Regler (nicht mehr vorn) – vorhandene Regler stehen wie in der Basis
rep("pC.classList.add('spk12-c'); U.op.insertBefore(pC, U.op.firstChild);", "pC.classList.add('spk12-c');   // Prüfung: hinter den vorhandenen Reglern (waagrecht wischen), nicht mehr vorn")
# 3) Ähnliche: Auswahl ▾ (Merken, Abtasten, Umkehren) auch dort
rep("x.setAttribute('aria-label', lab); pA.appendChild(x); }\n", "x.setAttribute('aria-label', lab); pA.appendChild(x); }\n  { const x = el('button', 'n1b spk12-hd', 'Auswahl ▾'); x.dataset.a = 's12dd'; x.dataset.s12w = 'aehn'; x.setAttribute('aria-label', 'Auswahl merken, umkehren, Alle Ebenen abtasten'); pA.appendChild(x); U.b12a = x; }   /* Prüfung: Auswahl ▾ auch bei Ähnliche */\n")
rep("if (was == null && U.dd && U.ddA === U.b12) spk12Dd(U, U.b12);", "if (was == null && U.dd && U.ddA && U.ddA.dataset.a === 's12dd') spk12Dd(U, U.ddA);")
# b) Merkmal-Häkchen: neue Suche = ein ↶ (Auswahl + Treffer zurück)
rep("on(x, 'click', () => { S.mk[k] = !S.mk[k];", "on(x, 'click', () => { if (U.ex) spk12Push(U, 'Merkmal ' + t, spk12Clone(U.sel), {ah: {ex: U.ex, hits: U.hits, i: S.ai}});   /* Prüfung: ein ↶ */\n        S.mk[k] = !S.mk[k];")
# 4) Fortschritt beim Abtasten der Ebene (Status-Zeile)
rep("function spk12CallSrc(op, a) {", "function spk12CallSrc(op, a, cb) {")
rep("  if (L && SPK12_SRCOPS.includes(o2)) { if (o2 === 'harm') o2 = 'spk12harm'; else if (o2 === 'aehnlich') o2 = 'spk12aehnB'; a2 = Object.assign({}, a2, {s12src: L}); }\n  return o2 === op && a2 === a ? null : [o2, a2];",
    "  let cb2 = null;\n  if (L && SPK12_SRCOPS.includes(o2)) {\n    if (o2 === 'harm') o2 = 'spk12harm'; else if (o2 === 'aehnlich') o2 = 'spk12aehnB'; a2 = Object.assign({}, a2, {s12src: L});\n    const p0 = cb && cb.prog, nm = spk12LName(U); cb2 = Object.assign({}, cb || {}, {prog: (p, st) => { if (p0) p0(p, st); if (st === 'Ebene abtasten') spk1Stat(U, 'Ebene „' + nm + '“ abtasten … ' + Math.round(100 * p) + ' %'); }});   /* Prüfung: Fortschritt */\n  }\n  return o2 === op && a2 === a ? null : [o2, a2, cb2];")
# Guide
rep("Leiste unter den Werkzeugen: Neu │ + │ − │ ∩ · Auswahl ▾ (Merken, Alle Ebenen abtasten)", "Leiste unter den Werkzeugen, hinter den Reglern (hochkant waagrecht wischen): Neu │ + │ − │ ∩ · Auswahl ▾ (Merken, Alle Ebenen abtasten; bei Ähnliche hinter ‹ › Alle)")
open(P, 'w', encoding='utf-8').write(s)
B = D + 'bau.py'
b = open(B, encoding='utf-8').read()
a1 = "spk12DspMake(Z2, {selFn, specInfo, specChunk, get, put, soon, mixOf, block, BLK, tick, harmTrack, similar});"
if b.count(a1) != 1: sys.exit('bau Haken 2')
b = b.replace(a1, "spk12DspMake(Z2, {selFn, specInfo, specChunk, get, put, soon, mixOf, gainFn, block, BLK, tick, harmTrack, similar});")
a2 = "{ const r12 = spk12CallSrc(op, a); if (r12) { op = r12[0]; a = r12[1]; } }"
if b.count(a2) != 1: sys.exit('bau Haken 17')
b = b.replace(a2, "{ const r12 = spk12CallSrc(op, a, cb); if (r12) { op = r12[0]; a = r12[1]; if (r12[2]) cb = r12[2]; } }")
open(B, 'w', encoding='utf-8').write(b)
print('ok')
