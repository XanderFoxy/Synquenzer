import sys
p = sys.argv[1]; s = open(p, encoding='utf-8').read()
def rep(old, new):
    global s
    c = s.count(old)
    if c != 1: sys.exit('Treffer %d für: %s' % (c, old[:90]))
    s = s.replace(old, new)
rep("  ops.spk12trans = (d, m) => {   // Transienten:", "  ops.spk12trans = (d, m, emit) => {   /* ZRL2: emit für den Fortschritt */   // Transienten:")
rep("      const g = spk12Mag(x, a0 + n * H, N, re, im), y = new Float32Array(NB); for (let k = 0; k < NB; k++) y[k] = 20 * Math.log10(1 + gam * g[k]);\n",
    "      if (emit && nF > 4096 && (n & 1023) === 1023) emit({qid: m.qid, prog: n / nF, stufe: 'Schläge suchen'});   /* ZRL2: Fortschritt bei langem Transient (je 1024 Rahmen ≈ 6 s Audio) */\n      const g = spk12Mag(x, a0 + n * H, N, re, im), y = new Float32Array(NB); for (let k = 0; k < NB; k++) y[k] = 20 * Math.log10(1 + gam * g[k]);\n")
rep("    const r = await spk1Call('spk12trans', {doc: SPK1.doc, t0: q.tap ? q.a - 0.2 : q.a, t1: q.tap ? q.a + 0.2 : q.b, hg, del: spk12Del(U), tap: q.tap ? q.a : null});\n",
    "    const r = await spk1Call('spk12trans', {doc: SPK1.doc, t0: q.tap ? q.a - 0.2 : q.a, t1: q.tap ? q.a + 0.2 : q.b, hg, del: spk12Del(U), tap: q.tap ? q.a : null}, undefined, !keep && typeof zrl2TrCb === 'function' ? zrl2TrCb(U) : undefined);   /* ZRL2: Fortschritt */\n")
rep("/* SPK12-END */\n", """/* SPK12-END */
/* ZRL2-BEGIN ===== Fortschritt beim langen Transient (OFFEN-1611 A4): der Spektral-Kern meldet „Schläge suchen“ je 1024 Rahmen (erst ab 4096
   Rahmen ≈ 24 s Auswahl), die vorhandene Statuszeile zeigt dann „Suche Schläge … NN %“ – wie „Ebene „…“ abtasten … NN %“ (SPK12). Kurze Auswahl
   und Nachrechnen beim Regler (keep) bleiben wie bisher. Der Zerlegen-Teil von ZRL2 steht im Spektral-Kern (spk1DspMake, Block ZRL2). ===== */
function zrl2TrCb(U) { return {prog: (p, st) => { if (st === 'Schläge suchen' && spk12S(U).tBusy) spk1Stat(U, 'Suche Schläge … ' + Math.round(100 * p) + ' %'); }}; }
/* ZRL2-END */
""")
open(p, 'w', encoding='utf-8').write(s)
print('ok')
