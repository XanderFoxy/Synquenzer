#!/usr/bin/env python3
# KKS: Klangkorn-Seite im Klang-Editor + Knopf "Als Klangkorn" im Aktionsfeld (SPK7_ROW an). Aufruf: apply.py <eingang> <ausgang>
import sys,hashlib,os
src,dst=sys.argv[1],sys.argv[2]
if os.path.abspath(dst)==os.path.abspath(src) or dst=='/dev/null':sys.exit('Ausgang ungueltig')
raw=open(src,'rb').read()
if hashlib.md5(raw).hexdigest() not in ('695af0504463a6385e21dc94e55b00c9',):sys.exit('falscher Eingang (md5)')
s=raw.decode('utf-8')
blk=open(os.path.join(os.path.dirname(os.path.abspath(__file__)),'block.js'),encoding='utf-8').read().strip('\n')
def rep(a,b,n=1):
    global s
    c=s.count(a)
    if c!=n:sys.exit('Anker %d statt %d: %r'%(c,n,a[:80]))
    s=s.replace(a,b)
# 1) Block vor spk7NormWt (Klangkorn-Kern, gleicher Skript-Block)
A1="function spk7NormWt(w,base){"
rep(A1,blk+"\n"+A1)
# 2) WT-Seite: Klangkorn-Klang zeigt die Klangkorn-Seite
A2="function pageWt(pg,i){\n"
rep(A2,A2+"if(typeof kksPage==='function'&&kksPage(pg,i))return;/*KKS*/\n")
# 3) Unter-Reiter heisst bei Klangkorn KORN statt WT
A3=":[['eng',eng==='wt'?'WT':'FM'],['voice','STIMME']];"
rep(A3,":[['eng',eng==='wt'?(typeof kksIs==='function'&&kksIs(R.selT)?'KORN':'WT'):'FM'],['voice','STIMME']];/*KKS*/")
# 4) Knopf "Als Klangkorn" als 3. Zeile im Aktionsfeld
A4="const SPK7_ROW=false;"
rep(A4,"const SPK7_ROW=true;/*KKS*/")
for k in ('KKS-BEGIN','KKS-END'):
    if s.count(k)!=1:sys.exit('Marker '+k)
tmp=dst+'.tmp';open(tmp,'w',encoding='utf-8').write(s);os.replace(tmp,dst)
print('ok',hashlib.md5(s.encode()).hexdigest())
