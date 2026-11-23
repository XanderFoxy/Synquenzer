def lum(h):
    h=h.lstrip('#');r,g,b=[int(h[i:i+2],16)/255 for i in (0,2,4)]
    f=lambda c:c/12.92 if c<=0.03928 else ((c+0.055)/1.055)**2.4
    return 0.2126*f(r)+0.7152*f(g)+0.0722*f(b)
def k(a,b):
    la,lb=sorted([lum(a),lum(b)],reverse=True);return (la+0.05)/(lb+0.05)
grund='#04050a';fl='#0e1019';fl2='#181a28';dunkel='#07070d'
farben={'orange':'#ff9f45','flieder':'#c3a2f2','hellblau':'#8ec5ff','pfirsich':'#ffbf9b','sand':'#ecd28c','mint':'#76e2b3','rosa':'#f59cc2',
 'aktiv':'#62d8ff','gewaehlt':'#ffd65e','laeuft':'#6be3a4','fehler':'#ff6e5f','warn':'#ffb04a'}
for n,c in farben.items():
    print(f"{n:9s} dunkel-auf-farbe {k(dunkel,c):5.2f}  farbe-auf-grund {k(c,grund):5.2f}  auf-flaeche2 {k(c,fl2):5.2f}")
for n,c in {'text':'#f2eee6','leise':'#a9a5c0','aus-text':'#8c89a3'}.items():
    print(f"{n:9s} auf grund {k(c,grund):5.2f} flaeche {k(c,fl):5.2f} flaeche2 {k(c,fl2):5.2f} auf-aus(#2a2c3c) {k(c,'#2a2c3c'):5.2f}")
