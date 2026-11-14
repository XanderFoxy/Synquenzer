import sys
p='index.html'; s=open(p).read()
blk=open('spk1-block.js').read()
a=s.index('/* ===== SPK1-BEGIN'); b=s.index('/* SPK1-END */')+len('/* SPK1-END */')
s=s[:a]+blk.rstrip('\n')+s[b:]
def rep(x,y):
    global s
    if y in s: return
    assert s.count(x)==1,(x[:70],s.count(x))
    s=s.replace(x,y)
rep("  va1MenuRow(s1, row, btn);                                       // VA1: Menü → Export (WAV, Einzelspuren, MIDI, Video, Container)\n",
    "  va1MenuRow(s1, row, btn);                                       // VA1: Menü → Export (WAV, Einzelspuren, MIDI, Video, Container)\n  spk1MenuRow(s1, row, btn);                                      // SPK1: Analyse › [Spektral …]\n")
rep("""    (ok ? '<button class="mbtn rb tk-wp" data-a="wp">✎ Marken & Timing …</button>' : '') +\n""",
    """    (ok ? '<button class="mbtn rb tk-wp" data-a="wp">✎ Marken & Timing …</button>' : '') +\n    (ok ? spk1TkBtn() : '') +   // SPK1: Im Spektrum öffnen\n""")
rep("""      if (d.a === 'wp') { closePop(); wpOpen(rr); return; }      // VS5a: Marken-Editor\n""",
    """      if (d.a === 'wp') { closePop(); wpOpen(rr); return; }      // VS5a: Marken-Editor\n      if (d.a === 'spk1') { const x = tkRef(rr); closePop(); if (x) spk1Open({take: x.a.take, in: x.a.in, out: x.a.out, name: x.a.name, back: {tk: rr}}); return; }   // SPK1: Im Spektrum öffnen\n""")
rep("""  if (VV.open || UI.vvOff) { if (code === 'Escape') vvClose(); return; }   // VV1: the Video sheet blocks the shortcuts like the menu; Esc closes it (§10.5)\n""",
    """  if (VV.open || UI.vvOff) { if (code === 'Escape') vvClose(); return; }   // VV1: the Video sheet blocks the shortcuts like the menu; Esc closes it (§10.5)\n  if (SPK1.open) { if (code === 'Escape') spk1Close(); return; }   // SPK1: die Spektral-Seite sperrt die Kurztasten, Esc schließt\n""")
rep("""  kf2Guide(UI1.ents);    // KF2: Saite, Vokal-Filter, Oszilloskop\n""",
    """  kf2Guide(UI1.ents);    // KF2: Saite, Vokal-Filter, Oszilloskop\n  spk1Guide(UI1.ents);   // SPK1: Spektral-Seite\n""")
hook="    if (tr.stimme && clip.audio) spk1ClipBtn(g, B, t, s);   // SPK1: Im Spektrum öffnen\n"
if hook not in s:
    x="""    g.append(B(tr.stimme && clip.audio ? 'Marken & Timing …' : 'Quantisieren…',"""
    assert s.count(x)==1
    i=s.index(x); j=s.index('\n',i)+1
    s=s[:j]+hook+s[j:]
open(p,'w').write(s)
print('ok')
