# G10g: baut bau/helfer/G10G/index.html aus bau/snapshots/R-4300.html (jede Ersetzung genau einmal, sonst Abbruch)
import sys, pathlib
ROOT = pathlib.Path(__file__).resolve().parents[4]
SRC = ROOT / 'bau/snapshots/R-4300.html'
OUT = ROOT / 'bau/helfer/G10G/index.html'
H = SRC.read_text(encoding='utf-8')
HERE = pathlib.Path(__file__).resolve().parent

def rep(old, new, cnt=1):
    global H
    n = H.count(old)
    if n != cnt:
        sys.exit('Treffer %d statt %d fuer: %s' % (n, cnt, old[:120]))
    H = H.replace(old, new)

# ---------- Kern (g2PitchMake, läuft auch im Worker): Oktav-Klammer + Einrast-Zeit nur mit plan.v = 2 ----------
rep("""  const n = an.n, H = an.hop, f0 = an.f0, c = new Float64Array(n), has = new Uint8Array(n), hard = plan.mode === 'hard';
  const fm = new Float64Array(n);""",
"""  const n = an.n, H = an.hop, f0 = an.f0, c = new Float64Array(n), has = new Uint8Array(n), hard = plan.mode === 'hard';
  const fm = new Float64Array(n), v2 = plan.v === 2;   // G10g: Oktav-Klammer und Einrast-Zeit nur mit v = 2 (sonst bitgleich)""")
rep("""      if (s && to === to) v += s * 100 * (to - (hard && fm[i] === fm[i] ? fm[i] : m));""",
"""      if (s && to === to) { let f = hard && fm[i] === fm[i] ? fm[i] : m; if (v2 && Math.abs(f - m) > 1.5) f = m; v += s * 100 * (to - f); }   // G10g: Oktav-Klammer (Ausreißer > 1,5 Halbtöne → Notenhöhe)""")
rep("""  const R = Math.max(1, Math.round((hard ? 0.015 : 0.04) / H / 2)), cs = new Float64Array(n);""",
"""  const R = v2 ? Math.max(0, Math.round((isFinite(plan.rt) ? Math.min(100, Math.max(0, plan.rt)) : hard ? 15 : 40) / 1000 / H / 2)) : Math.max(1, Math.round((hard ? 0.015 : 0.04) / H / 2)), cs = new Float64Array(n);   // G10g: Einrast-Zeit (ms, v = 2)""")
rep("""  let h = 0x811c9dc5; const s = (plan.mode === 'hard' ? 'h' : 'w') + JSON.stringify((plan.notes || []).map(k => [k.t0, k.t1, k.m, k.to, k.s, k.e]));""",
"""  let h = 0x811c9dc5; const s = (plan.mode === 'hard' ? 'h' : 'w') + JSON.stringify((plan.notes || []).map(k => [k.t0, k.t1, k.m, k.to, k.s, k.e])) + (plan.v === 2 ? '|v2|' + plan.rt : '');   // G10g""")

# ---------- Daten: eigene Leitern, key.src/via/alt, notes[k].nq, rt, v (additiv) ----------
rep("""const G2_MODES = ['soft', 'hard'];
function g2NormPitch(p, len) {""",
"""const G2_MODES = ['soft', 'hard'];
// G10g: zusätzliche Leitern NUR für die Tonhöhe des Gesangs (Spec-Name G2_SCALES). Harmony.SCALES bleibt unangetastet, damit
// G10g: Tonart-Erkennung und die Leiter anderer Spuren nicht anders werden. Gelesen wird zuerst diese Liste, dann Harmony.SCALES.
const G10G_SCALES = {pentMaj: [0, 2, 4, 7, 9], pentMin: [0, 3, 5, 7, 10], harmMin: [0, 2, 3, 5, 7, 8, 11], chrom: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]};   // G10g
const G2_SCALES = G10G_SCALES;   // G10g: Name aus der Spec (dieselbe Liste)
function g10gScale(s) { const o = Object.prototype.hasOwnProperty; return typeof s !== 'string' ? null : o.call(G10G_SCALES, s) ? G10G_SCALES[s] : o.call(Harmony.SCALES, s) ? Harmony.SCALES[s] : null; }   // G10g
function g2NormPitch(p, len) {""")
rep("""    if (isNum(n.sh) && Math.round(n.sh)) o.sh = clamp(Math.round(n.sh), -36, 36);
    notes.push(o);""",
"""    if (isNum(n.sh) && Math.round(n.sh)) o.sh = clamp(Math.round(n.sh), -36, 36);
    if (n.nq === true) o.nq = true;   // G10g: nicht rastern (Blue Note, Schleifer)
    notes.push(o);""")
rep("""  if (p.key && isNum(p.key.root) && Harmony.SCALES[p.key.scale]) out.key = {root: clamp(Math.round(p.key.root), 0, 11), scale: p.key.scale};
  return out.notes.length ? out : null;""",
"""  if (p.key && isNum(p.key.root) && g10gScale(p.key.scale)) { out.key = {root: clamp(Math.round(p.key.root), 0, 11), scale: p.key.scale}; g10gNormKey(p.key, out.key); }   // G10g: auch eigene Leitern; src/via/alt additiv
  g10gNormPitch(p, out);   // G10g: v, rt (additiv)
  return out.notes.length ? out : null;""")

# ---------- Ziel je Note: Tonart der Note (gemeinsame Quelle), nicht rastern ----------
rep("""  const SC = Harmony.SCALES[key && key.scale] || Harmony.SCALES.ionian, r = key ? key.root : 0, ins = q => SC.includes(((q - r) % 12 + 12) % 12);""",
"""  const SC = g10gScale(key && key.scale) || Harmony.SCALES.ionian, r = key ? key.root : 0, ins = q => SC.includes(((q - r) % 12 + 12) % 12);   // G10g: eigene Leitern zuerst""")
rep("""function g2Target(P, n) { const base = P.q ? n.m + P.str * (g2Snap(n.m, P.key) - n.m) : n.m; return base + (n.sh || 0); }""",
"""function g2Target(P, n, k) { const base = P.q && !n.nq ? n.m + P.str * (g2Snap(n.m, k || P.key) - n.m) : n.m; return base + (n.sh || 0); }   // G10g: k = Tonart der Note, nq = nicht rastern""")
rep("""  const plan = {mode: P.mode, notes: P.notes.map((n, k) => ({t0: n.t0, t1: n.t1, m: n.m, to: P.q ? g2Snap(n.m, P.key) : n.m, s: P.q ? P.str : 0, e: 100 * ((n.sh || 0) + (xs ? xs[k] || 0 : 0))}))};
  return G2P.active(plan) ? plan : null;""",
"""  const plan = g10gPlan(id, P, xs);   // G10g: Tonart je Note, nicht rastern, v/rt (alte Takes: derselbe Plan wie 4.30.0)
  return G2P.active(plan) ? plan : null;""")
# G5 (Melodie aus dem Gesang) hört dieselbe Fassung
rep("""  const plan = {mode: P.mode, notes: P.notes.map(n => ({t0: n.t0, t1: n.t1, m: n.m, to: P.q ? g2Snap(n.m, P.key) : n.m, s: P.q ? P.str : 0, e: 100 * (n.sh || 0)}))};
  if (!G2P.active(plan)) return b;""",
"""  const plan = g10gPlan(id, P, null);   // G10g: derselbe Plan wie G2 (alte Takes unverändert)
  if (!G2P.active(plan)) return b;""")

# ---------- Ändern: neue Takes v = 2 + Tonart 'auto'; Weich/Hart liest bei 'auto' neu ----------
rep("""    if (!mm.pitch) { if (!A || !A.notes.length) { toast('Keine Töne erkannt'); return false; } mm.pitch = {mode: 'soft', str: 1, q: false, key: g2KeyAt(r), notes: A.notes.map(n => ({t0: n.t0, t1: n.t1, m: n.m}))}; }""",
"""    if (!mm.pitch) { if (!A || !A.notes.length) { toast('Keine Töne erkannt'); return false; } mm.pitch = {mode: 'soft', str: 1, q: false, key: g10gNewKey(id, r), notes: A.notes.map(n => ({t0: n.t0, t1: n.t1, m: n.m})), v: 2}; }   // G10g: neue Tonhöhe = v 2, Tonart Auto""")
rep("""    if (!P || (!P.q && !P.notes.some(n => n.sh))) delete mm.pitch; else mm.pitch = P;""",
"""    if (!P || (!P.q && !P.notes.some(n => n.sh) && !(P.key && P.key.src === 'user'))) delete mm.pitch; else mm.pitch = P;   // G10g: gewählte Tonart bleibt auch ohne Quantisieren""")
rep("""    if (o.key) P.key = {root: o.key.root, scale: o.key.scale};
    if (!P.key) P.key = g2KeyAt(r);
  }, r);""",
"""    if (o.key) P.key = {root: o.key.root, scale: o.key.scale};
    if (!P.key) P.key = g2KeyAt(r);
    if (!o.key && P.key.src === 'auto') g10gReread(id, P, r);   // G10g: Auto liest die Tonart bei jedem Weich/Hart neu
  }, r);""")

# ---------- Editor ----------
rep("""  head.append(wv, ab, cl); if (vk != null) wv.disabled = true;""",
"""  head.append(wv, ab, cl); if (vk != null) wv.disabled = true;
  const kc = vk == null ? g10gHead(head, wv) : null;   // G10g: Tonart-Chip im Kopf""")
rep("""    if (v === 'soft' || v === 'hard') { g2Info('Töne werden gesucht …'); g2SetQ(E.id, {q: true, mode: v, str: P && P.q ? P.str : 1}, E.r).then(ok => { const Q = S.takes[E.id] && S.takes[E.id].pitch; if (ok && Q) toast(g2MovedN(Q) + ' Töne auf die Tonart ' + keyLabel(Q.key) + ' gezogen'); }); return; }""",
"""    if (v === 'soft' || v === 'hard') { g2Info('Töne werden gesucht …'); g2SetQ(E.id, {q: true, mode: v, str: P && P.q ? P.str : 1}, E.r).then(ok => { const Q = S.takes[E.id] && S.takes[E.id].pitch; if (ok && Q) toast(g10gMovedN(E.id, Q) + ' Töne auf die Tonart ' + g10gKeyLabel(g10gKeyNow(E.id, Q, E.r) || Q.key) + ' gezogen'); }); return; }   // G10g: Tonart der Quelle""")
rep("""    if (v === 'up' || v === 'dn') g2NoteShift(E.id, E.sel, v === 'up' ? 1 : -1);
    else if (v === 'split') g2Split(E.id, E.sel, E.tapT);""",
"""    if (v === 'up' || v === 'dn') g10gStep(E.id, E.sel, v === 'up' ? 1 : -1);   // G10g: mit Quantisieren stufenweise in der Tonart
    else if (v === 'split') g2Split(E.id, E.sel, E.tapT);""")
rep("""  const sl = el('div', 'wpsl'); sl.append(row);""",
"""  const sl = el('div', 'wpsl'); sl.append(row);
  const rtr = g10gRtRow(sl);   // G10g: Regler Einrast-Zeit""")
rep("""  Object.assign(G2.ed, {cv, chips, rs: row, info, ab, cvw});""",
"""  Object.assign(G2.ed, {cv, chips, rs: row, info, ab, cvw, g10g: {kc, rtr, kp: kc ? g10gPanel(b) : null}});   // G10g""")
rep("""  G2.ed = null; clearTimeout(E.rt); g6pgClosed();""",
"""  G2.ed = null; clearTimeout(E.rt); g6pgClosed(); g10gHearStop();   // G10g: Vorhören aus""")
# Paint
rep("""  const tg = Vc ? ns.map(n => n.m + n.iv) : ns.map(n => g2Target(Pk, n));   // G6: Chor-Stimme = Lead-Note + Intervall""",
"""  const KS = Vc ? null : g10gKeys(id, Pk);   // G10g: Tonart je Note (Auto: Szene am Takt)
  const tg = Vc ? ns.map(n => n.m + n.iv) : ns.map((n, k) => g2Target(Pk, n, KS && KS[k]));   // G6: Chor-Stimme = Lead-Note + Intervall · G10g: Tonart je Note""")
rep("""  const key = P && P.key || g2KeyAt(E.r), SC = Harmony.SCALES[key.scale] || Harmony.SCALES.ionian;""",
"""  const key = (!Vc && g10gKeyNow(id, P, E.r)) || P && P.key || g2KeyAt(E.r), SC = g10gScale(key.scale) || Harmony.SCALES.ionian;   // G10g: angezeigte Tonart = Quelle""")
rep("""  // Tonhöhen-Spur (gemessen) dünn
  if (A) { g.strokeStyle = 'rgba(200,210,230,.55)';""",
"""  if (A) g10gHatch(g, E, id, A, X, Wp, Hp);   // G10g: stimmlose Teile als graue Schraffur unter den Noten
  // Tonhöhen-Spur (gemessen) dünn
  if (A) { g.strokeStyle = 'rgba(200,210,230,.55)';""")
rep("""    if (k === E.sel) { g.strokeStyle = '#ffffff'; g.lineWidth = 2; g.strokeRect(x0 + 1, y - h / 2 + 1, w - 2, h - 2); }
    if (w > 22 && h >= 9) {""",
"""    if (k === E.sel) { g.strokeStyle = '#ffffff'; g.lineWidth = 2; g.strokeRect(x0 + 1, y - h / 2 + 1, w - 2, h - 2); }
    if (!Vc && (n.nq || (E.p && E.p.held && E.p.k === k))) g10gNqMark(g, x0, y, w, h, !!n.nq);   // G10g: nicht rastern / Halten
    if (w > 22 && h >= 9) {""")
rep("""  const rd = Vc ? ns.length + ' Noten · ' + Vc.name + (g6Ready(x.a) ? '' : ' · rechnet …') : !A && !P ? 'Töne werden gesucht …' : ns.length + (ns.length === 1 ? ' Note' : ' Noten') + ' · Tonart ' + keyLabel(key) + ' · '""",
"""  const rd = Vc ? ns.length + ' Noten · ' + Vc.name + (g6Ready(x.a) ? '' : ' · rechnet …') : !A && !P ? 'Töne werden gesucht …' : ns.length + (ns.length === 1 ? ' Note' : ' Noten') + ' · Tonart ' + g10gKeyLabel(key) + ' · '""")
rep("""  g2Info(rd);
  g6pgLegSync(E);
}""",
"""  g2Info(rd);
  g6pgLegSync(E);
  g10gSync(E, key);   // G10g: Chip, Leiste, Einrast-Zeit
}""")
# Gesten: Halten = nicht rastern / frei in Halbtönen; Ziehen mit Quantisieren = stufenweise; Vorhören
rep("""    const [cx, cy] = pos(e); E.p = {id: e.pointerId, x0: e.clientX, y0: e.clientY, t0: performance.now(), k: g2Hit(E, cx, cy), mode: null, va: E.va};
  });""",
"""    const [cx, cy] = pos(e); E.p = {id: e.pointerId, x0: e.clientX, y0: e.clientY, t0: performance.now(), k: g2Hit(E, cx, cy), mode: null, va: E.va};
    g10gHoldArm(E);   // G10g: Halten erkennen
  });""")
rep("""    if (p.mode === 'move') { E.ghost = {k: p.k, d: Math.round(-dy / Math.max(6, E.rowH))}; E.sel = p.k; g2Paint(); }""",
"""    if (p.mode === 'move') { E.ghost = {k: p.k, d: g10gDragD(E, p, Math.round(-dy / Math.max(6, E.rowH)))}; E.sel = p.k; g2Paint(); }   // G10g: stufenweise bzw. frei (Halten) + Vorhören""")
rep("""    E.p = null; const gh = E.ghost; E.ghost = null;
    if (cancel) { g2Paint(); return; }""",
"""    E.p = null; const gh = E.ghost; E.ghost = null; clearTimeout(p.ht);   // G10g
    if (cancel) { g2Paint(); return; }""")
rep("""    if (p.mode) return;
    const [cx, cy] = pos(e); UI.ghost = {t: performance.now(), x: e.clientX, y: e.clientY};
    if (p.k < 0 && g6pgTap(E, cx, cy)) return;   // G6+g: Tipp auf einen Schatten öffnet die Stimme""",
"""    if (p.mode) return;
    const [cx, cy] = pos(e); UI.ghost = {t: performance.now(), x: e.clientX, y: e.clientY};
    if (p.held && p.k >= 0 && E.voice == null) { E.sel = p.k; g10gNq(E.id, p.k); return; }   // G10g: Halten auf einer Note = nicht rastern (an/aus)
    if (p.k < 0 && g6pgTap(E, cx, cy)) return;   // G6+g: Tipp auf einen Schatten öffnet die Stimme""")

# ---------- G7: dieselbe Tonart-Quelle wie G2 (nur neue Takes) ----------
rep("""  const out = P.notes.map(n => { const p = Math.round(g2Target(P, n)); let o = p; try { o = e ? mapOut(st, key, p, t, e) : outPitch(st, key, p, t); } catch (er) { logErr(er); } if (o !== p) any = true; return o - p; });""",
"""  const ks = g10gKeys(id, P), nw = g10gNew(P);   // G10g: neue Takes rechnen mit der Tonart der G2-Quelle (je Note), alte weiter mit g7Key
  const out = P.notes.map((n, j) => { const kk = ks ? ks[j] : nw && P.key ? P.key : key, p = Math.round(g2Target(P, n, ks && ks[j])); let o = p; try { o = e ? mapOut(st, kk, p, t, e) : outPitch(st, kk, p, t); } catch (er) { logErr(er); } if (o !== p) any = true; return o - p; });   // G10g""")
rep("""  const plan = {mode: P.mode, notes: P.notes.map((n, k) => ({t0: n.t0, t1: n.t1, m: n.m, to: P.q ? g2Snap(n.m, P.key) : n.m, s: P.q ? P.str : 0, e: 100 * ((n.sh || 0) + (xs ? xs[k] : 0))}))};
  if (!G2P.active(plan)) return;""",
"""  const plan = g10gPlan(id, P, xs);   // G10g: derselbe Plan wie G2
  if (!G2P.active(plan)) return;""")

# ---------- G10g-Block nach G7 ----------
JS = (HERE / 'g10g.js').read_text(encoding='utf-8')
rep("""/* G7-END */""", """/* G7-END */
""" + JS)
rep("""Object.assign(SYNQUENZER, G7_API);""", """Object.assign(SYNQUENZER, G7_API, G10G_API);   // G10g: Test-API Tonart/Leiter""")

# ---------- CSS ----------
CSS = (HERE / 'g10g.css').read_text(encoding='utf-8')
rep("""/* G6PE-CSS-END */""", """/* G6PE-CSS-END */
/* G10G-CSS-BEGIN */
""" + CSS + """/* G10G-CSS-END */""")

# G10g: Marke ans Ende der Info-Zeile (die Zeile ist lang, ersetzt wurde nur ihr Anfang)
i = H.index("' · Tonart ' + g10gKeyLabel(key) + ' · '"); j = H.index('\n', i); H = H[:j] + '   // G10g: Name auch für eigene Leitern' + H[j:]
OUT.write_text(H, encoding='utf-8')
print('ok', len(H))
