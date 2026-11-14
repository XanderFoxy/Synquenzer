# SPK4: index.html = basis5.html + spk4-block.js (direkt nach „/* SPK3-END */“) + Haken „SPK4“
import sys
B='/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/vx/'
s=open(B+'basis5.html').read(); blk=open(B+'spk4/spk4-block.js').read().rstrip('\n')
def rep(old,new):
    global s
    assert s.count(old)==1, old[:80]; s=s.replace(old,new)
rep("/* SPK3-END */\n", "/* SPK3-END */\n"+blk+"\n")
rep("  if (Z2 && typeof spk3DspMake === 'function') spk3DspMake(Z2);   // SPK3: Tiefband mit Kick-Vorlage (ersetzt Z2.lowSplit, schaltet es ein)\n",
    "  if (Z2 && typeof spk3DspMake === 'function') spk3DspMake(Z2);   // SPK3: Tiefband mit Kick-Vorlage (ersetzt Z2.lowSplit, schaltet es ein)\n  if (Z2 && typeof spk4DspMake === 'function') spk4DspMake(Z2);   // SPK4: mehrstimmige Noten (Pads, Rest, Original)\n")
rep("(typeof spk3DspMake === 'function' ? spk3DspMake.toString() + ';' : '') /* SPK3 */ + ",
    "(typeof spk3DspMake === 'function' ? spk3DspMake.toString() + ';' : '') /* SPK3 */ + (typeof spk4DspMake === 'function' ? spk4DspMake.toString() + ';' : '') /* SPK4 */ + ")
rep("  if (typeof spk3LpFromMeta === 'function') spk3LpFromMeta(U);   // SPK3: Loop aus dem Dokument\n",
    "  if (typeof spk3LpFromMeta === 'function') spk3LpFromMeta(U);   // SPK3: Loop aus dem Dokument\n  if (typeof spk4Lab === 'function') spk4Lab(U);   // SPK4: Hinweis einstimmig/mehrstimmig der gewählten Ebene\n")
rep("""  return spk2Run(U, 'noten', {lid, sel}, 'Noten · ' + spk2LName(U, lid), r => r.drums ? 'Drums haben keine Tonhöhe' : r.neu + ' Noten in ' + spk2LName(U, lid) + ' · einstimmig · Note antippen = zuordnen');""",
    """  return spk2Run(U, 'noten', {lid, sel, poly: spk4Arg(U, lid) /* SPK4 */}, 'Noten · ' + spk2LName(U, lid), r => r.drums ? 'Drums haben keine Tonhöhe' : r.neu + ' Noten in ' + spk2LName(U, lid) + (r.mehrstimmig ? ' · mehrstimmig' : ' · einstimmig') /* SPK4 */ + ' · Note antippen = zuordnen');""")
rep("""    dd.appendChild(g);
    dd.appendChild(el('p', '', (l ? zu + ' bestätigt · ' : '') + 'Einstimmig: je Ebene ein Ton zur Zeit, Akkorde werden nicht getrennt. Quelle = gewählte Ebene in der Liste.'));""",
    """    const p4 = el('p', '', ''); spk4Btn(U, g, lid, p4, l ? zu + ' bestätigt · ' : '');   // SPK4: Schalter Mehrstimmig + Text
    dd.appendChild(g);
    dd.appendChild(p4);""")
rep("""  noten: (lid, sel) => spk1Call('noten', {doc: SPK1.doc, lid, sel}).then(r => { SPK1.last = r; return r; }),""",
    """  noten: (lid, sel, poly) => spk1Call('noten', {doc: SPK1.doc, lid, sel, poly}).then(r => { SPK1.last = r; return r; }),   // SPK4: poly (true/false, sonst nach Ebene)""")
rep("Z2.lowSplit = lowSplit; Z2.o3 = o3; Z2.kickTpl = kickTpl; Z2.kickAt = kickAt; opt.an = true;",
    "Z2.lowSplit = lowSplit; Z2.o3 = o3; Z2.kickTpl = kickTpl; Z2.kickAt = kickAt; Z2.magsLo = magsLo; /* SPK4 */ opt.an = true;")
rep("              const vd = Math.round(free * sm(ED, i, k)), vb = Math.min(free - vd, Math.round(free * sm(EB, i, k))), vv = Math.min(free - vd - vb, Math.round(free * sm(EV, i, k)));",
    "              const lo4 = k < KL && Z2 && Z2.o6 && Z2.o6.nosm;   // SPK4: Tiefband ungeglättet (Kick ↔ Bass: Glätten kostete 0,6 dB Bass)\n              const vd = Math.round(free * (lo4 ? ED[i * NB + k] : sm(ED, i, k))), vb = Math.min(free - vd, Math.round(free * (lo4 ? EB[i * NB + k] : sm(EB, i, k)))), vv = Math.min(free - vd - vb, Math.round(free * sm(EV, i, k)));")
# Auftrag 3/4: Rest aufteilen (Kern-Innereien für spk4DspMake), Ebenen-Menü der Rest-Ebene, Unison im Nachbau
rep("magPair, render, mixOf, transfer, uBegin, uEnd, lay, tick}) : null;   // SPK2 (Auftrag 2: Noten brauchen render/transfer/Undo)",
    "magPair, render, mixOf, transfer, uBegin, uEnd, lay, tick, x4: {refineEst, stripe, tileArr, tidy, verUp, uTouch, newLayer, uAbort, TRn, BT, Fn} /* SPK4: Rest aufteilen */}) : null;   // SPK2 (Auftrag 2: Noten brauchen render/transfer/Undo)")
rep("  if (L.length) h += row('rest', 'Rest', 'var(--text-dim)', {solo: R.solo, mute: R.mute, vol: R.vol});",
    "  if (L.length) h += row('rest', 'Rest', 'var(--text-dim)', {solo: R.solo, mute: R.mute, vol: R.vol, more: typeof spk4RestDd === 'function' /* SPK4: ⋯ Rest aufteilen */});")
rep("function spk1MoreDd(U, b, lid) {\n  const l = U.meta.layers.find(x => x.id === lid); if (!l) return;",
    "function spk1MoreDd(U, b, lid) {\n  if (lid === 'rest' && typeof spk4RestDd === 'function') return spk4RestDd(U, b);   // SPK4: Ebenen-Menü der Rest-Ebene\n  const l = U.meta.layers.find(x => x.id === lid); if (!l) return;")
rep("  c.fix = Object.assign({}, c.fix, {uni: alt === 'uni' ? 5 : 1});\n  if (alt === 'det') { c.fix.o2 = c.fix.o1; u[8] = 0.9; }",
    "  const u4 = alt === 'uni' || alt === 'uni0', U4 = u4 && typeof spk4KlUni === 'function' ? spk4KlUni(x) : null;   // SPK4: Unison erkannt → Verstimmung aus der Schwebung\n  c.fix = Object.assign({}, c.fix, {uni: u4 ? 5 : 1});\n  if (alt === 'det') { c.fix.o2 = c.fix.o1; u[8] = 0.9; }\n  if (alt === 'uni0') u[8] = 0;   // SPK4: eine Welle mit Unison\n  if (U4) spk4KlAdsr(u);   // SPK4: Hüllkurve ohne die Schwebung")
rep("alt === 'uni' ? Math.min(1, 0.15 + cvm) : 0, spk2Ul(",
    "u4 ? (U4 ? U4.udet : Math.min(1, 0.15 + cvm)) /* SPK4 */ : 0, spk2Ul(")
rep("if (++rd > SPK3_KL.ab && !A.aus && !B.aus) { if (B.best.dA <= A.best.dA * (1 + SPK3_KL.ra)) A.aus = 1; else B.aus = 1; }",
    "if (++rd > SPK3_KL.ab && !A.aus && !B.aus) { if (B.best.dA <= A.best.dA * (1 + (typeof spk4KlUni === 'function' && spk4KlUni(x) ? SPK4_UNI.ra : SPK3_KL.ra) /* SPK4: Unison erkannt → mehr Spielraum für B */)) A.aus = 1; else B.aus = 1; }")
rep("  if (cvm > 0.06 || x.det > 0.5) { L.push(S('va', 'det')); L.push(S('va', 'uni')); }\n",
    "  if (cvm > 0.06 || x.det > 0.5) { L.push(S('va', 'det')); L.push(S('va', 'uni')); }\n  if (typeof spk4KlUni === 'function' && spk4KlUni(x)) L.push(S('va', 'uni0'));   // SPK4: Unison erkannt → auch eine Welle allein\n")
open(B+'spk4/index.html','w').write(s)
print('ok', len(s))
