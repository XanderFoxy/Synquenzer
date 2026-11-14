# SPK3 Auftrag 2+3: index.html = index.a1.html (Stand Auftrag 1) + SPK3-Block neu aus spk3-block.js + Haken „SPK3“ in SPK2/SPK1
import sys, os
d = os.path.dirname(os.path.abspath(__file__))
s = open(os.path.join(d, 'index.a1.html'), encoding='utf-8').read()
blk = open(os.path.join(d, 'spk3-block.js'), encoding='utf-8').read().rstrip('\n')
a = s.index('/* ===== SPK3-BEGIN'); b = s.index('/* SPK3-END */') + len('/* SPK3-END */')
s = s[:a] + blk + s[b:]
old = "  return {lowSplit, projLk, bassTrack, kickModel, w2, I, opt, ops, noten, finden, zuordnen, klangFeat, klangSchaetz};"
assert s.count(old) == 1
s = s.replace(old, "  return {lowSplit, projLk, bassTrack, kickModel, w2, I, opt, ops, noten, finden, zuordnen, klangFeat, klangSchaetz,\n    h: {magsX, onsetsOf, viterbi, segNotes, gridOf, snapT, t2Of, nid, artOf, rangeOf, N2R, midiOf, trackF, noteSel, findN}};   // SPK3: Helfer für Auftrag 2/4 (Noten sicherer, mehrstimmig)")
old = "for (let k = Math.max(1, Math.floor(kc - hw)); k <= Math.min(NB - 1, Math.ceil(kc + hw)); k++) { const w = Math.min(1, 1.6 * (1 - Math.abs(k - kc) / (hw + 0.5))); put(pos, m, k, w); put(pos, m + 1, k, w * 0.999); }"
assert s.count(old) == 1
s = s.replace(old, old.replace("const w = Math.min(1, 1.6 * (1 - Math.abs(k - kc) / (hw + 0.5)));", "const w = Math.min(1, 1.6 * (1 - Math.abs(k - kc) / (hw + 0.5))) * (s.g != null ? Math.max(0, Math.min(1, +s.g || 0)) : 1);   /* SPK3: Anteil g (Zuordnen in Bass) */"))

# ---- Auftrag 3: Haken „SPK3“ in SPK2 (Klang nachbauen, Loop) und SPK1 (Wiedergabe, Ebenen-Liste, Knöpfe)
R = []
R.append(("  if (c.eng === 'va') return {cut: spk2Lg(u[0], 30, 18000),", "  if (c.eng === 'va') return (typeof spk3KlP === 'function' ? spk3KlP : (c, P) => P)(c, {cut: spk2Lg(u[0], 30, 18000),"))
R.append(("mix: u[8], noise: u[9] * 0.6, pw: 0.05 + 0.9 * u[10], o1: f.o1, o2: f.o2};", "mix: u[8], noise: u[9] * 0.6, pw: 0.05 + 0.9 * u[10], o1: f.o1, o2: f.o2});   // SPK3: + Verstimmung, Unison, LFO"))
R.append(("    return SQStore.normalizeSound({engine: 'analog', name: nm || 'Nachbau', cat: 'eigene', p, mods: [], fx});", "    const mods = []; if (typeof spk3KlSnd === 'function') spk3KlSnd(c, P, p, mods);   // SPK3: Osz 2 verstimmt, Unison, Vibrato/Wah\n    return SQStore.normalizeSound({engine: 'analog', name: nm || 'Nachbau', cat: 'eigene', p, mods, fx});"))
R.append(("    return {eng, fix: {o1, o2}, u};\n", "    return typeof spk3KlStart === 'function' ? spk3KlStart({eng, fix: {o1, o2}, u}, est, src, alt) : {eng, fix: {o1, o2}, u};   // SPK3: Bewegung aus der Analyse\n"))
R.append(("    L.forEach((c, i) => { c.F = r.fs[i]; c.dist = spk2KlDist(src.feat, c.F);", "    L.forEach((c, i) => { c.F = r.fs[i]; c.dist = (src.x3on && typeof spk3KlDist === 'function' ? spk3KlDist : spk2KlDist)(src.feat, c.F);   /* SPK3: + Bewegung (nicht bei reinem FM) */"))
R.append(("    await evalB(L); d0 = Math.min(...L.map(c => c.dist));", "    if (eng !== 'fm' && typeof spk3KlMore === 'function') { src.x3on = true; spk3KlMore(L, S, e, src); }   // SPK3: verstimmt / Unison als Start, Abstand mit Bewegung\n    await evalB(L); d0 = Math.min(...L.map(c => c.dist));"))
R.append(("const D = best.u.length, k = i === lam - 1 ? D : 1 + Math.floor(rnd() * 3), pick = new Set(); while (pick.size < k) pick.add(Math.floor(rnd() * D)); L.push({eng: best.eng, fix: best.fix, u: best.u.map(",
          "const D = best.u.length, fr = [...Array(D).keys()].filter(j => !(best.fz || []).includes(j)), k = i === lam - 1 ? fr.length : Math.min(fr.length, 1 + Math.floor(rnd() * 3)), pick = new Set(); while (pick.size < k) pick.add(fr[Math.floor(rnd() * fr.length)]); L.push({eng: best.eng, fix: best.fix, fz: best.fz /* SPK3: feste Werte */, u: best.u.map("))
R.append(("  if (c.eng === 'va') return ['VA · ' + SPK2_WV[P.o1]", "  if (c.eng === 'va') return (typeof spk3KlTxt === 'function' ? spk3KlTxt : (c, L) => L)(c, ['VA · ' + SPK2_WV[P.o1]"))
R.append(("' / ' + ms(P.fD), adsr];", "' / ' + ms(P.fD), adsr]);   // SPK3: Verstimmung, Unison, Vibrato/Wah"))
# Loop
R.append(("    '<span class=\"spk2-lpt\">Loop ' + esc(spk2LpTxt(L)) + '</span><button class=\"rb spk2-mx\"", "    '<span class=\"spk2-lpt\">Loop ' + esc(spk2LpTxt(L)) + '</span>' + (typeof spk3LpBtnH === 'function' ? spk3LpBtnH() : '') /* SPK3: ▶ Loop im Kreis */ + '<button class=\"rb spk2-mx\""))
R.append(("  if (a === 'mxweg') { U.loop = null; spk1Dd(U, null); spk1Layers(U); spk1Dirty(U, 'r'); spk1Dirty(U, 'ov'); spk1Stat(U, 'Loop entfernt'); return; }",
          "  if (a === 'lpplay') { if (typeof spk3LpTap === 'function') spk3LpTap(U); return; }   // SPK3: ▶ Loop im Kreis\n  if (a === 'mxweg') { U.loop = null; spk1Dd(U, null); spk1Layers(U); spk1Dirty(U, 'r'); spk1Dirty(U, 'ov'); spk1Stat(U, 'Loop entfernt'); if (typeof spk3LpSave === 'function') spk3LpSave(U); /* SPK3: im Dokument */ return; }"))
R.append(("  spk1Layers(U); spk1Stat(U, 'Loop ' + spk2LpTxt(U.loop) + ' · „In die Matrix ▾“ in der Ebenen-Liste'); return true;",
          "  spk1Layers(U); spk1Stat(U, 'Loop ' + spk2LpTxt(U.loop) + ' · „In die Matrix ▾“ in der Ebenen-Liste'); if (typeof spk3LpSave === 'function') spk3LpSave(U); /* SPK3: im Dokument */ return true;"))
R.append(("spk2LpSet(U, a, a + 4); spk1Layers(U); spk1Stat(U, 'Loop ' + spk2LpTxt(U.loop) + ' · Klammern im Lineal ziehen');", "spk2LpSet(U, a, a + 4); spk1Layers(U); spk1Stat(U, 'Loop ' + spk2LpTxt(U.loop) + ' · Klammern im Lineal ziehen'); if (typeof spk3LpSave === 'function') spk3LpSave(U); /* SPK3 */"))
R.append(("    case 'mxdd': case 'mxweg': spk2Tap(U, b, a); return;   // SPK2: Loop → Matrix", "    case 'mxdd': case 'mxweg': case 'lpplay' /* SPK3 */: spk2Tap(U, b, a); return;   // SPK2: Loop → Matrix"))
R.append(("function spk1PlayPos() { const P = SPK1.pl, c = AU.ctx; return P && c ? P.from + Math.max(0, c.currentTime - P.t0) : null; }",
          "function spk1PlayPos() { const P = SPK1.pl, c = AU.ctx; return P && c ? (P.pos ? P.pos(c.currentTime) /* SPK3: Loop im Kreis */ : P.from + Math.max(0, c.currentTime - P.t0)) : null; }"))
R.append(("function spk1PlayFrom(U, t) {\n", "function spk1PlayFrom(U, t) {\n  if (SPK1.pl && SPK1.pl.lp && typeof spk3LpPlay === 'function' && spk2Lp(U) && spk3LpPlay(U, t)) return;   // SPK3: Loop läuft → im Loop weiter\n"))
R.append(("  const L = U.meta.layers, R = U.meta.rest || {}, row = (id, name, col, o) => {", "  if (typeof spk3LpFromMeta === 'function') spk3LpFromMeta(U);   // SPK3: Loop aus dem Dokument\n  const L = U.meta.layers, R = U.meta.rest || {}, row = (id, name, col, o) => {"))
R.append(("  U.bMin.classList.toggle('on', !!U.opt.minus); U.bMin.setAttribute('aria-pressed', String(!!U.opt.minus));\n}", "  U.bMin.classList.toggle('on', !!U.opt.minus); U.bMin.setAttribute('aria-pressed', String(!!U.opt.minus));\n  if (typeof spk3LpBtn === 'function') spk3LpBtn(U);   // SPK3: ▶/■ in der Loop-Zeile\n}"))
for a, b in R:
    assert s.count(a) == 1, a[:80]
    s = s.replace(a, b)
open(os.path.join(d, 'index.html'), 'w', encoding='utf-8').write(s)
print('ok', len(s))
