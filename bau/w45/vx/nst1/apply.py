#!/usr/bin/env python3
# NST1: basis.html + Haken (je eine neue Zeile, Kennung NST1) + Block (nst1-block.js hinter /* LT2-END */) -> index.html
# Optional: worklet.js (markierter Worklet-Teil NST1W) an seinen Ankern.
import sys, os, re
D = os.path.dirname(os.path.abspath(__file__))
src = open(os.path.join(D, 'basis.html'), encoding='utf-8').read()
L = src.split('\n')

def after(pattern, line, count=1):
    """neue Zeile `line` hinter der (einzigen) Zeile, die `pattern` enthält"""
    hits = [i for i, x in enumerate(L) if pattern in x]
    if len(hits) != count:
        sys.exit('Anker %r: %d Treffer (erwartet %d)' % (pattern, len(hits), count))
    i = hits[0]
    ind = re.match(r'\s*', L[i + 1]).group(0) if i + 1 < len(L) else ''
    L.insert(i + 1, line if line.startswith(' ') else ind + line)

def before(pattern, line):
    hits = [i for i, x in enumerate(L) if pattern in x]
    if len(hits) != 1:
        sys.exit('Anker %r: %d Treffer' % (pattern, len(hits)))
    i = hits[0]
    ind = re.match(r'\s*', L[i]).group(0)
    L.insert(i, ind + line)

# 1 normalizeSound (SQStore): das additive Feld sound.nst
before("    return engine === 'fm2' ? migrateFm2(s) : s;\n".strip('\n'),
       "if (o.nst && typeof G.nst1Norm === 'function') G.nst1Norm(o, s);   /* NST1: Je-Note-Einstellung des Klangs (additiv) */")
# 2 spawnVoice: der Schritt dieser Note (vor allen Engine-Abzweigen)
after("const snd0 = o.sound || (R.v6aCur && R.v6aCur[i] && !AU.synth[i] ? v6aSnd(i) || tr.sound : tr.sound);",
      "  if (snd0 && snd0.nst && typeof nst1Voice === 'function') o = nst1Voice(i, out, t0, o, snd0);   /* NST1: je Note weiterschalten (Paare wie Noten-Locks) */")
# 3 cancelTrackFrom: Zähler zurücknehmen
after("function cancelTrackFrom(i, t) {",
      "  if (typeof nst1Cancel === 'function') nst1Cancel(i, t);        /* NST1: gestrichene Noten zählen nicht */")
# 4 pickerOpen: Chip „Je Note“ an passenden Reglern
after("function pickerOpen(anchor, opts) {",
      "  if (typeof nst1Pick === 'function') opts = nst1Pick(anchor, opts);   /* NST1: Regler lange drücken › Je Note */")
# 5 openEdMore: Eintrag im ⋯-Menü (+ Tipp)
after("      (!drum ? kf2MoreBtn() : '') +   // KF2: Oszilloskop an/aus",
      "      (!drum && typeof nst1MoreBtn === 'function' ? nst1MoreBtn(t) : '') +   // NST1: Je Note weiterschalten")
after("      else if (a === 'tcopy') MKUI.timCopyPop(anchor, t); else if (a === 'tswap') MKUI.timSwap(t); else if (a === 'tinit') MKUI.timInit(t); else if (a === 'sqtools') MKUI.seqToolsPop(anchor, t); }, 'button[data-a]');",
      "    if (typeof nst1MoreTap === 'function') nst1MoreTap(p, anchor, t);   /* NST1 */")
# 6 buildSynthEd: Strich am ⋯, solange Je Note an ist
after("const em1 = mkMore('edm1'), emL = mkMore('edmL'), em2 = mkMore('edm2'); sh.querySelector('.sh-bar').appendChild(emL);",
      "  if (typeof nst1EdMark === 'function') nst1EdMark([em1, emL, em2], i);   /* NST1 */")

# Worklet-Teil (falls vorhanden)
wpath = os.path.join(D, 'worklet.py')
if os.path.exists(wpath):
    exec(open(wpath, encoding='utf-8').read())

# Block hinter LT2-END
blk = open(os.path.join(D, 'nst1-block.js'), encoding='utf-8').read().rstrip('\n').split('\n')
hits = [i for i, x in enumerate(L) if x.strip() == '/* LT2-END */']
if len(hits) != 1: sys.exit('LT2-END: %d' % len(hits))
L[hits[0] + 1:hits[0] + 1] = blk

open(os.path.join(D, 'index.html'), 'w', encoding='utf-8').write('\n'.join(L))
print('ok', len(L))
