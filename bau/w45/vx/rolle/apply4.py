import sys
p = sys.argv[1]
s = open(p, encoding='utf-8').read()
R = [
 # CSS
 ("#rollSheet .pr.vx1r,.pr.vx1r{--pr-vh:0px}.pr.vx1r .pr-vlab,.pr.vx1r .pr-vel{display:none}.vx1rx{display:none!important}\n/* VX1R-CSS-END */",
  "#rollSheet .pr.vx1r,.pr.vx1r{--pr-vh:0px}.pr.vx1r .pr-vlab,.pr.vx1r .pr-vel{display:none}.vx1rx{display:none!important}\n.tksheet .tk-vx1r{width:100%;min-height:44px;margin:0 0 6px}   /* Takes-Blatt: [✎ Bearbeiten] wie [✎ Marken & Timing …] */\n/* VX1R-CSS-END */"),
 # openRoll: STIMME-Clip -> Gesang-Editor
 ("  if (tr.stimme) { selectSlot(t, s); tkSheet({t, s}); return; }        // VS3: die STIMME-Spur hat Takes statt Noten",
  "  if (tr.stimme) { selectSlot(t, s); if (vx1rCan({t, s}) && vx1rOpen({t, s})) return; tkSheet({t, s}); return; }        // VS3: die STIMME-Spur hat Takes statt Noten · VX1R: Gesang-Clip → derselbe Editor wie bei Instrumenten"),
 # svTap: Stelle merken
 ("if (isStimmeT(t) && tkVoxAt(bar)) { tkSheet({vox: tkVoxAt(bar).id}); return; }   // VS3: Song-Stimme → Takes-Blatt",
  "if (isStimmeT(t) && tkVoxAt(bar)) { vx1rAt(tkVoxAt(bar).id, bar); tkSheet({vox: tkVoxAt(bar).id}); return; }   // VS3: Song-Stimme → Takes-Blatt · VX1R: die getippte Stelle für [✎ Bearbeiten]"),
 # tkSheet handler
 ("      if (d.a === 'wp') { closePop(); wpOpen(rr); return; }      // VS5a: Marken-Editor",
  "      if (d.a === 'vx1r') { closePop(); vx1rOpen(rr); return; }   // VX1R: Gesang-Editor (Noten-Rolle)\n      if (d.a === 'wp') { closePop(); wpOpen(rr); return; }      // VS5a: Marken-Editor"),
 # tkSheetPaint button
 ("    (ok ? '<button class=\"mbtn rb tk-wp\" data-a=\"wp\">✎ Marken & Timing …</button>' : '') +",
  "    (ok ? vx1rTkBtn(x) : '') +   // VX1R: Gesang-Editor (Noten-Rolle) = Standard\n    (ok ? '<button class=\"mbtn rb tk-wp\" data-a=\"wp\">✎ Marken & Timing …</button>' : '') +"),
 # ORI order
 ("  const edit = [sec('edit', 'Bearbeiten', 3), q('.clbox'), q('.tk-wp'), ed && !ed.querySelector('.tkdup') ? ed : null, q('.tkg57')];",
  "  const edit = [sec('edit', 'Bearbeiten', 3), q('.tk-vx1r'), q('.clbox'), q('.tk-wp'), ed && !ed.querySelector('.tkdup') ? ed : null, q('.tkg57')];   // VX1R: [✎ Bearbeiten] zuerst"),
 # saveFile hint
 ("    if (autosave) await autosave.markSaved();               // history snapshot of every explicit save\n",
  "    if (autosave) await autosave.markSaved();               // history snapshot of every explicit save\n    vx1rJsonHint();                                          // VX1R: Gesang-Audio liegt nur im Container\n"),
]
for a, b in R:
    n = s.count(a)
    if n != 1: print('MISS', n, a[:80]); sys.exit(1)
    s = s.replace(a, b)
open(p, 'w', encoding='utf-8').write(s)
print('ok')
