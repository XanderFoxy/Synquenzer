import sys
d = sys.argv[1]
s = open(d + '/index.html', encoding='utf-8').read()
blk = open(d + '/block.js', encoding='utf-8').read().rstrip('\n')
a = s.index('/* MTX4-BEGIN'); b = s.index('/* MTX4-END */') + len('/* MTX4-END */')
s = s[:a] + blk + s[b:]
def ins_before(anchor, line):
    global s
    if line.strip() in s: return
    n = s.count(anchor); assert n == 1, (n, anchor[:60])
    s = s.replace(anchor, line + '\n' + anchor)
def ins_after(anchor, line):
    global s
    if line.strip() in s: return
    n = s.count(anchor); assert n == 1, (n, anchor[:60])
    s = s.replace(anchor, anchor + '\n' + line)
ins_before("      if (sig !== C.sig) { C.sig = sig; C.mini.innerHTML = clip ? (clip.audio ? tkMiniSvg(clip.audio) : miniSvg(clip, tr.kind === 'drum', g1p)) : ''; }",
           "      if (sig !== C.sig && typeof mtx4Thumb === 'function' && mtx4Thumb()) continue;   /* MTX4: Vorschaubilder nach einer Sammel-Aktion gestaffelt (höchstens ≈ 5 ms je Bild) */")
ins_after("  sx11HoldFor(UNDO[UNDO.length - 1]);   // SX11",
          "  if (typeof mtx4HoldFor === 'function') mtx4HoldFor(UNDO[UNDO.length - 1]);   /* MTX4: ↶ eines MTX4-Schritts im Lauf am nächsten Taktstrich */")
ins_after("  sx11HoldFor(REDO[REDO.length - 1]);   // SX11",
          "  if (typeof mtx4HoldFor === 'function') mtx4HoldFor(REDO[REDO.length - 1]);   /* MTX4: ↷ eines MTX4-Schritts im Lauf am nächsten Taktstrich */")
open(d + '/index.html', 'w', encoding='utf-8').write(s)
print('gebaut')
