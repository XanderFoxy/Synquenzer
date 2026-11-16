# CHORB-Bau: basis.html (4.76.1) + Block chorb-block.js nach /* VA1-END */ + einzeilige Haken (Kennung CHORB) -> index.html
import sys, os
D = os.path.dirname(os.path.abspath(__file__))
src = open(os.path.join(D, 'basis.html'), encoding='utf-8').read().split('\n')
blk = open(os.path.join(D, 'chorb-block.js'), encoding='utf-8').read().rstrip('\n').split('\n')
# (Anker-Teiltext, einzufügende Zeile danach)
HOOKS = [
    ("  if (s != null) { VA1.soloSet = s; G6.solo = s; }", "  if (o.lane) { VA1.soloSet = o.lane; G6.solo = o.lane; }   /* CHORB: nur eine Chor-Spur (Chor als Einzelstücke) */"),
    ("async function va1Run(kind) {", "  if (kind === 'chorblk') return chbRun();   /* CHORB: Chor als Einzelstücke */"),
    ("B('chor', 'Nur Chor', 'Chöre · WAV', song && hasC && !busy) + '</div>';", "  h += chbVa1Html(song, hasC, busy);   /* CHORB: Zeile „Chor als Einzelstücke“ */"),
    ("  if (wegeVa1Tap(b)) return;   // WEGE (D7)", "  if (chbVa1Tap(b)) return;   /* CHORB: je Stimme | alle zusammen, Hilfe */"),
    ('<div class="small g6pe-st">${g6peStTxt(c, rd)}</div>`;', "  h += chbChorBtn();   /* CHORB: [Als Einzelstücke speichern] */"),
    ("  if (b.dataset.ch1) return ch1Tap(b);", "  if (b.dataset.chb) return chbTap(b);   /* CHORB */"),
    ("  kf2Guide(UI1.ents);", "  chbGuide(UI1.ents);    /* CHORB: Chor als Einzelstücke, Gesang aus Cubasis holen */"),
    ("(c && c.x && c.st !== 'analyse' ? B('again', 'Erkennen') : '') + '</div>';", "  h += chbImpHtml();   /* CHORB: Hilfe „Gesang aus Cubasis holen“ */"),
    ("  const a = b.dataset.i, c = IMP1.cur;", "  if (a === 'chbhelp') { closePop(); chbHelp(); return; }   /* CHORB */"),
    ("Object.assign(SYNQUENZER, va1Api());", "Object.assign(SYNQUENZER, CHB_API);                         /* CHORB: Chor als Einzelstücke (Test-API) */"),
]
out = []
hit = {k: 0 for k, _ in HOOKS}
nblk = 0
for line in src:
    out.append(line)
    for k, ins in HOOKS:
        if k in line:
            hit[k] += 1
            out.append(ins)
    if line.strip() == '/* VA1-END */':
        out.extend(blk); nblk += 1
bad = [k for k, n in hit.items() if n != 1]
if bad or nblk != 1:
    print('FEHLER Anker', bad, nblk); sys.exit(1)
open(os.path.join(D, 'index.html'), 'w', encoding='utf-8').write('\n'.join(out))
print('ok: Block', len(blk), 'Zeilen, Haken', len(HOOKS))
