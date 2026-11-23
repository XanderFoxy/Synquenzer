#!/usr/bin/env python3
# ARPG: Arp-Gate bis 200 % (Legato-Arp). Aufruf: apply.py <eingang> <ausgang>
import sys,hashlib,os
src,dst=sys.argv[1],sys.argv[2]
if os.path.abspath(dst)==os.path.abspath(src):sys.exit('Ausgang = Eingang')
raw=open(src,'rb').read()
if hashlib.md5(raw).hexdigest() not in ('695af0504463a6385e21dc94e55b00c9',):sys.exit('falscher Eingang (md5)')
s=raw.decode('utf-8')
blk=open(os.path.join(os.path.dirname(os.path.abspath(__file__)),'block.js'),encoding='utf-8').read().strip('\n')
def rep(a,b,n=1):
    global s
    c=s.count(a)
    if c!=n:sys.exit('Anker %d statt %d: %r'%(c,n,a[:80]))
    s=s.replace(a,b)
# 1) Kern (stiller Block sq-arp-src): Gate bis 200 nur beim Spur-Arp (m.gn); <=100 bitgleich (+0)
rep("g=clamp(A.gate|0,0,100)","g=clamp(A.gate|0,0,m.gn?200:100)")
rep("dur=g>=100||(r.late&&t+g/100*sec>tN)?Math.max(.003,tN-t):Math.max(.003,g/100*sec);",
    "dur=(g>=100||(r.late&&t+g/100*sec>tN)?Math.max(.003,tN-t):Math.max(.003,g/100*sec))+(g>100?(g-100)/100*sec:0);if(g>100&&typeof arpgCut==='function')arpgCut(s,t,notes);/*ARPG*/")
# 2) Daten: Grenze 5..200
rep("o:n(a.o,1,4,1),g:n(a.g,5,100,80)","o:n(a.o,1,4,1),g:n(a.g,5,200,80)/*ARPG*/")
# 3) reine Rechnung (MIDI-Export, Festschreiben, Bild)
rep("const tN=T(idx+1),dur=a.g>=100||(late&&t+a.g/100*sb>tN)?Math.max(.003/spbS,tN-t):Math.max(.003/spbS,a.g/100*sb);",
    "const tN=T(idx+1),dur=(a.g>=100||(late&&t+a.g/100*sb>tN)?Math.max(.003/spbS,tN-t):Math.max(.003/spbS,a.g/100*sb))+(a.g>100?(a.g-100)/100*sb:0);/*ARPG*/")
rep("for(const n of K.gnNotes(m,q,c,N,seed))out.push({t,d:dur,p:n.p,v:n.vel,x:n.x.x,o:n.o,c});",
    "for(const n of K.gnNotes(m,q,c,N,seed)){if(a.g>100)arpgTrim(out,t,n.p,Eb);out.push({t,d:dur,p:n.p,v:n.vel,x:n.x.x,o:n.o,c});}/*ARPG*/")
# 4) Blatt (stiller Block sq-arp1-src): Gate-Regler bis 200 %, Hinweis „Legato“
rep("c.g=Math.min(100,Math.max(5,c.g+(d.g==='+'?5:-5)));","c.g=Math.min(200,Math.max(5,c.g+(d.g==='+'?5:-5)));/*ARPG*/")
rep("<small>${c.g>=100?'gebunden':c.g<=30?'kurz':''}</small>","<small>${c.g>100?'Legato':c.g>=100?'gebunden':c.g<=30?'kurz':''}</small>")
# 5) Hilfsblock vor arp1Render (Haupt-Faden)
A5="function arp1Render(notes,cfg,o){"
rep(A5,blk+"\n"+A5)
for k in ('ARPG-BEGIN','ARPG-END'):
    if s.count(k)!=1:sys.exit('Marker '+k)
tmp=dst+'.tmp';open(tmp,'w',encoding='utf-8').write(s);os.replace(tmp,dst)
print('ok',hashlib.md5(s.encode()).hexdigest())
