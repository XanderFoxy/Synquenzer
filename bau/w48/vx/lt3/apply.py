#!/usr/bin/env python3
# LT3: Spektral – erstes Bild mit Ebenen-Farben stückweise (LT2S) auch ohne gemessenes Farben-Bild, wenn schon das Bild ohne Farben den Takt verpasst.
# Aufruf: apply.py <eingang> <ausgang.html>
import sys,hashlib,os
src,dst=sys.argv[1],sys.argv[2]
if os.path.abspath(dst)=='/dev/null' or not dst.endswith('.html'):sys.exit('Ausgang muss eine .html-Datei sein')
raw=open(src,'rb').read()
if hashlib.md5(raw).hexdigest() not in ('a23eefd7ac3f52251e5bc881f1de4628',):sys.exit('falscher Eingang (md5)')
s=raw.decode('utf-8')
blk=open(os.path.join(os.path.dirname(os.path.abspath(__file__)),'block.js'),encoding='utf-8').read().strip('\n')
def rep(a,b,n=1):
    global s
    c=s.count(a)
    if c!=n:sys.exit('Anker %d statt %d: %r'%(c,n,a[:80]))
    s=s.replace(a,b)
rep("// LT2-END\n","// LT2-END\n"+blk+"\n")
rep("}else if(P.on&&P.slow&&S.nl>0&&S.all&&S.key===P.lastKey&&S.sig!==P.lastSig&&(P.lastNl===0||t-P.lastT>=120)){",
    "}else if(P.on&&S.nl>0&&S.all&&S.key===P.lastKey&&S.sig!==P.lastSig&&(P.lastNl===0||t-P.lastT>=120)&&(P.slow||(typeof lt3Slow==='function'&&lt3Slow(P)))){/*LT3*/")
rep("P.n=Math.min(6,Math.max(2,Math.ceil(P.cost/20)));","P.n=Math.min(6,Math.max(2,Math.ceil((P.cost||(typeof lt3Est==='function'?lt3Est():0))/20)));/*LT3*/")
rep("if(S.nl>0)lt2sMeasure(t);}","if(S.nl>0)lt2sMeasure(t);else if(S.all&&typeof lt3Measure==='function')lt3Measure(t);}/*LT3*/")
for k in ('LT3-BEGIN','LT3-END'):
    if s.count(k)!=1:sys.exit('Marker '+k)
tmp=dst+'.tmp';open(tmp,'w',encoding='utf-8').write(s);os.replace(tmp,dst)
print('ok',hashlib.md5(s.encode()).hexdigest())
