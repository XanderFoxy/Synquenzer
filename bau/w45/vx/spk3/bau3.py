# SPK3 Auftrag 2: index.html = index.a1.html (Stand Auftrag 1) + SPK3-Block neu aus spk3-block.js + Haken „SPK3“ in SPK2/SPK1
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
s = s.replace(old, old.replace("const w = Math.min(1, 1.6 * (1 - Math.abs(k - kc) / (hw + 0.5)));", "const w = Math.min(1, 1.6 * (1 - Math.abs(k - kc) / (hw + 0.5))) * (s.g > 0 && s.g < 1 ? +s.g : 1);   /* SPK3: Anteil g (Zuordnen in Bass) */"))
open(os.path.join(d, 'index.html'), 'w', encoding='utf-8').write(s)
print('ok', len(s))
