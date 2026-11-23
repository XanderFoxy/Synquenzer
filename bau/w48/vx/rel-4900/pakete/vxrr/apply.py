#!/usr/bin/env python3
# VXRR: Gesang reinigen – Regler Gesamt + Stärke je Schritt. Aufruf: apply.py <eingang> <ausgang>
import sys,hashlib,os
src,dst=sys.argv[1],sys.argv[2]
if os.path.realpath(dst)==os.path.realpath(src) or dst=='/dev/null':sys.exit('Ausgang ungültig')
raw=open(src,'rb').read()
if hashlib.md5(raw).hexdigest() not in ('695af0504463a6385e21dc94e55b00c9', '9844f801a2b742a3a5156a57f7756a8b',):sys.exit('falscher Eingang (md5)')
s=raw.decode('utf-8')
blk=open(os.path.join(os.path.dirname(os.path.abspath(__file__)),'block.js'),encoding='utf-8').read().strip('\n')
def rep(a,b,n=1):
    global s
    c=s.count(a)
    if c!=n:sys.exit('Anker %d statt %d: %r'%(c,n,a[:80]))
    s=s.replace(a,b)
# 1) Kern (läuft auch im Worker): Stärke je Schritt = Mischung vorher/nachher, nur wenn < 100 %
rep("if(wg&&k!=='room')acc(1);",
    "const vxrrA=st[k]&&st[k].vxa!=null&&st[k].vxa<1?Math.max(0,+st[k].vxa||0):1,vxrrP=vxrrA<1?Float32Array.from(y):null;if(wg&&k!=='room')acc(1);")
rep("if(wg&&k!=='room')acc(-1);",
    "if(vxrrP){for(let i=0;i<y.length;i++)y[i]=vxrrP[i]+vxrrA*(y[i]-vxrrP[i]);}if(wg&&k!=='room')acc(-1);")
# 2) Plan: Regler-Werte in die Schritte
rep("return{lv:A.lv,steps:st,found:A.found};",
    "return(typeof vxrrMix==='function'?vxrrMix:(i,P)=>P)(id,{lv:A.lv,steps:st,found:A.found});")
# 3) Anwenden: Regler merken; selbst zugeschaltetes Säubern folgt Gesamt
rep("if(typeof ch5Vr1Cl==='function')ch5Vr1Cl(m,P.lv);",
    "if(typeof vxrrStore==='function')vxrrStore(id,m);if(typeof ch5Vr1Cl==='function'&&!(typeof vxrrNoCl==='function'&&vxrrNoCl(id,m,P.lv)))ch5Vr1Cl(m,P.lv);")
# 4) 10 s Vorhören: dasselbe für das Säubern der Vorschau
rep("const cl=(m.cl|0)||(typeof ch5Vr1Pv==='function'?ch5Vr1Pv(s.lv):0);",
    "const cl=(m.cl|0)||(typeof ch5Vr1Pv==='function'?(typeof vxrrPvCl==='function'?vxrrPvCl(id,ch5Vr1Pv(s.lv)):ch5Vr1Pv(s.lv)):0);")
# 5) Blatt: Regler-Zeilen einsetzen
rep("const st=box.querySelector('.clst');box.insertBefore(d,st||null);",
    "if(typeof vxrrBuild==='function')vxrrBuild(d,id,ok);const st=box.querySelector('.clst');box.insertBefore(d,st||null);")
# 6) Zustand: „Anwenden“ statt „✓ angewandt“, wenn die Regler anders stehen; Regler nachziehen
rep("m&&m.vr1&&(!s.lv||s.lv===m.vr1.lv)?'✓ angewandt':'Anwenden'",
    "m&&m.vr1&&(!s.lv||s.lv===m.vr1.lv)&&(typeof vxrrSame!=='function'||vxrrSame(id,m))?'✓ angewandt':'Anwenden'")
rep("const e=d.querySelector('.vr1st');if(e&&e.textContent!==t)e.textContent=t;",
    "const e=d.querySelector('.vr1st');if(e&&e.textContent!==t)e.textContent=t;if(typeof vxrrPaint==='function')vxrrPaint(d,id,s,m,P);")
# 7) Block
A="function vr1BreathTap(E){"
rep(A,blk+"\n"+A)
for k in ('VXRR-BEGIN','VXRR-END'):
    if s.count(k)!=1:sys.exit('Marker '+k)
tmp=dst+'.tmp';open(tmp,'w',encoding='utf-8').write(s);os.replace(tmp,dst)
print('ok',hashlib.md5(s.encode()).hexdigest())
