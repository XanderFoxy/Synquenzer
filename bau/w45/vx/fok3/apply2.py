import sys
p = sys.argv[1]; s = open(p, encoding='utf-8').read()
a = s.index('/* FOKUS1-BEGIN'); z = s.index('/* FOKUS1-END */')
blk = s[a:z]
def rep(old, new, cnt=1):
    global blk
    c = blk.count(old)
    assert c == cnt, (c, old[:80])
    blk = blk.replace(old, new)

rep("""  if (S && S.doc === doc && S.N === N && S.mode === mode && F.sig === sig && S.chunks.filter(Boolean).length >= nC) {""",
    """  if (S && S.doc === doc && S.N === N && S.mode === mode && F.sig === sig && S.chunks.filter(Boolean).length >= nC && !S.chunks.some(c => c && c.ap)) {   /* FOK3: Näherung → nicht fertig */""")
rep("""  const o = {doc, N, mode, aus: F.aus, thr: U.opt && U.opt.n2thr != null ? U.opt.n2thr : 0.5};
  let got = 0, eO = 0, eR = 0, nAus = 0, stop = '', key = '', tP = 0;
  F.run = true; if (!F.st) fokus1Stat(U, 'Fokus · 0 %');
  try {
    for (const [from, to] of parts) {
      const r = await spk1Call('fokus', Object.assign({from, to}, o), null, {
        chunk: c => {
          if (seq !== F.seq || F.set !== S) return;
          const old = S.chunks[c.k], nc = {x0: c.x0, w: c.w, R: c.R, data: c.data, tex: null, old: null};""",
    """  const o = {doc, N, mode, aus: F.aus, thr: U.opt && U.opt.n2thr != null ? U.opt.n2thr : 0.5, vorab: mode === 'rest' ? 1 : 0};   /* FOK3: Kern entscheidet, ob erst die Näherung kommt */
  let got = 0, eO = 0, eR = 0, nAus = 0, stop = '', key = '', tP = 0;
  F.run = true; if (!F.st) fokus1Stat(U, 'Fokus · 0 %');
  const onChunk = c => {   /* FOK3: eine Funktion für beide Durchgänge */
          if (seq !== F.seq || F.set !== S) return;
          const old = S.chunks[c.k];
          if (c.ap && old && !old.ap && old.key === c.key) return;   /* FOK3: genaues Stück desselben Stands bleibt (keine Näherung darüber) */
          const nc = {x0: c.x0, w: c.w, R: c.R, data: c.data, tex: null, old: null, ap: !!c.ap, key: c.key, eO: c.eO, eR: c.eR};""")
rep("""          const t = performance.now(); if (got < nC && t - tP > 150) { tP = t; fokus1Stat(U, 'Fokus · ' + Math.round(100 * got / nC) + ' %'); }
        }
      });""", """          const t = performance.now(); if (!F.gn && got < nC && t - tP > 150) { tP = t; fokus1Stat(U, 'Fokus · ' + Math.round(100 * got / nC) + ' %'); }
  };
  try {
    for (const [from, to] of parts) {
      const r = await spk1Call('fokus', Object.assign({from, to}, o), null, {chunk: onChunk});""")
rep("""    logErr(e); fokus1Stat(U, 'Fokus: Fehler'); return;
  }
  F.run = false; if (seq !== F.seq) return;""", """    logErr(e); fokus1Stat(U, 'Fokus: Fehler'); return;
  }
  /* FOK3: genau nachreichen – je Aufruf ein Stück, das nächste wird jedes Mal neu gewählt (sichtbare zuerst, dann nach Abstand zum Bild), so wirkt
     Rollen/Zoomen sofort (fokus1Pre löst ein unsichtbares laufendes Stück ab). Austausch wie bisher: die alte Textur bleibt, bis die neue oben ist. */
  if (!stop && seq === F.seq && S.chunks.some(c => c && c.ap)) {
    const vis = () => { const v = U.v, hs = S.hop / U.meta.sr, cl = x => Math.max(0, Math.min(nC - 1, x)), a = cl(Math.floor(Math.max(0, v.t0) / hs / 1024)); return [a, Math.max(a, cl(Math.floor(Math.max(0, v.t0 + U.W / v.pps) / hs / 1024)))]; };
    const next = () => { const [a, b] = vis(); let k0 = -1, dk = 1e9; for (let k = 0; k < nC; k++) { const c = S.chunks[k]; if (!c || !c.ap) continue; const dd = k < a ? a - k + 0.5 : k > b ? k - b : 0; if (dd < dk) { dk = dd; k0 = k; } } return k0; };
    const ex = () => S.chunks.filter(c => c && !c.ap).length;
    F.gn = true; fokus1Stat(U, 'Fokus · genauer · ' + Math.round(100 * ex() / nC) + ' %');
    try {
      for (let guard = 0; guard < 4 * nC + 40; guard++) {
        const k = next(); if (k < 0) break; F.gk = k; F.rp = false;
        const r = await spk1Call('fokus', Object.assign({from: k, to: k + 1}, o, {vorab: 0}), null, {chunk: onChunk});
        if (seq !== F.seq) return;
        nAus = r.nAus; key = r.key; stop = r.stop || '';
        if (stop === 'abgeloest' && F.rp) { stop = ''; continue; }   // Rollen/Zoomen: neu planen (Rest-Audio bleibt im Kern-Speicher)
        if (stop) break;
        fokus1Stat(U, 'Fokus · genauer · ' + Math.round(100 * ex() / nC) + ' %');
      }
    } catch (e) {
      if (seq !== F.seq) return; F.run = false; F.gn = false; logErr(e); fokus1Stat(U, 'Fokus: Fehler'); return;
    } finally { if (seq === F.seq) { F.gn = false; F.gk = -1; F.rp = false; } }
    if (!stop) { eO = 0; eR = 0; for (const c of S.chunks) if (c) { eO += c.eO || 0; eR += c.eR || 0; } }
  }
  F.run = false; if (seq !== F.seq) return;""")
# fokus1Pre: Rollen/Zoomen während des Nachreichens → laufendes unsichtbares Stück ablösen
rep("""    if (F.glRef !== U.gl) { for (const c of S.chunks) if (c) { c.tex = null; c.old = null; } F.glRef = U.gl; }   // Kontext verloren → Texturen sind weg
    const v = U.v, hs = O.hop / U.meta.sr, n = O.chunks.length,""", """    if (F.glRef !== U.gl) { for (const c of S.chunks) if (c) { c.tex = null; c.old = null; } F.glRef = U.gl; }   // Kontext verloren → Texturen sind weg
    if (F.gn && F.gk >= 0 && !F.rp) {   /* FOK3: Rollen/Zoomen beim Nachreichen – läuft ein unsichtbares Stück, während sichtbare noch genähert sind → ablösen, neu planen */
      const hs0 = S.hop / U.meta.sr, nn = S.chunks.length, cl = x => Math.max(0, Math.min(nn - 1, x)), a = cl(Math.floor(Math.max(0, U.v.t0) / hs0 / 1024)), b = Math.max(a, cl(Math.floor(Math.max(0, U.v.t0 + U.W / U.v.pps) / hs0 / 1024)));
      if (F.gk < a || F.gk > b) for (let k = a; k <= b; k++) if (S.chunks[k] && S.chunks[k].ap) { F.rp = true; spk1Call('fokusStop', {doc: SPK1.doc}).catch(() => {}); break; }
    }
    const v = U.v, hs = O.hop / U.meta.sr, n = O.chunks.length,""")
# Test-Zugang
rep("""key: S ? S.key : '', err: F.err}; },""", """key: S ? S.key : '', err: F.err, ap: S ? S.chunks.filter(c => c && c.ap).length : 0, gn: !!F.gn, gk: F.gk == null ? -1 : F.gk}; },   /* FOK3: ap, gn, gk */""")
rep("""  chunks: () => { const S = SPK1.ui && SPK1.ui.f1 && SPK1.ui.f1.set; return S ? S.chunks.map((c, k) => c && {k, x0: c.x0, w: c.w, R: c.R, hop: S.hop, data: c.data}).filter(Boolean) : []; },""",
    """  chunks: () => { const S = SPK1.ui && SPK1.ui.f1 && SPK1.ui.f1.set; return S ? S.chunks.map((c, k) => c && {k, x0: c.x0, w: c.w, R: c.R, hop: S.hop, data: c.data, ap: !!c.ap}).filter(Boolean) : []; },   /* FOK3: ap */""")
open(p, 'w', encoding='utf-8').write(s[:a] + blk + s[z:])
print('ok ui')
