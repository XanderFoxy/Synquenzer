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
for k, (o, n) in enumerate(HOOKS if 'HOOKS' in dir() else []): pass
open(os.path.join(d, 'index.html'), 'w', encoding='utf-8').write(s)
print('ok', len(s))
