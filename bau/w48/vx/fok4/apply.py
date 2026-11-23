#!/usr/bin/env python3
# FOK4: Spektral-Fokus – Stueck-Bilder ausserhalb des Bild-Takts hochladen (texSubImage2D nur geaenderte Spalten, Zaun). Aufruf: apply.py <eingang> <ausgang>
import sys,hashlib,os
src,dst=sys.argv[1],sys.argv[2]
if os.path.abspath(dst)=='/dev/null' or not dst.endswith('.html'):sys.exit('Ausgang muss eine .html-Datei sein')
raw=open(src,'rb').read()
if hashlib.md5(raw).hexdigest() not in ('695af0504463a6385e21dc94e55b00c9',):sys.exit('falscher Eingang (md5)')
s=raw.decode('utf-8')
blk=open(os.path.join(os.path.dirname(os.path.abspath(__file__)),'block.js'),encoding='utf-8').read().strip('\n')
def rep(a,b,n=1):
    global s
    c=s.count(a)
    if c!=n:sys.exit('Anker %d statt %d: %r'%(c,n,a[:80]))
    s=s.replace(a,b)
A1="function fokus1Post(U){\n"
rep(A1,blk+"\n"+A1)
A2="else if(up<upMax){f.tex=U.gl.tex(f.w,f.R,'r',f.data,true);up++;use=f;}"
rep(A2,"else if(up<upMax){if(typeof fok4Up==='function'&&fok4Up(U,f))use=f.old&&f.old.tex?f.old:o;else{f.tex=U.gl.tex(f.w,f.R,'r',f.data,true);up++;use=f;}}/*FOK4*/")
A3="if(F.mode==='rest'||F.run||more||up)U.tintOn=false;"
rep(A3,"if(F.mode==='rest'||F.run||more||up||(typeof fok4W==='function'&&fok4W(U)))U.tintOn=false;/*FOK4*/")
for k in ('FOK4-BEGIN','FOK4-END'):
    if s.count(k)!=1:sys.exit('Marker '+k)
tmp=dst+'.tmp';open(tmp,'w',encoding='utf-8').write(s);os.replace(tmp,dst)
print('ok',hashlib.md5(s.encode()).hexdigest())
