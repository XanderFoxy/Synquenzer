# FARB: schnelle Suche 8 neuer Spurfarben (OKLab-Abstand maximieren, Helligkeit/Saettigung wie 1-8)
import random, math, numpy as np
from farbwahl import *
random.seed(11)
P=[];seen=set()
while len(P)<4000:
    L=random.uniform(0.71,0.88); C=random.uniform(0.11,0.21); H=random.uniform(0,360)
    rgb=fromlab(L,C*math.cos(math.radians(H)),C*math.sin(math.radians(H)))
    if not all(-0.001<=c<=1.001 for c in rgb): continue
    h=tohex([delin(max(0,min(1,c))) for c in rgb])
    if h in seen: continue
    if cr(hx(h),hx(BG))<7.2: continue
    r_,g_,b_=hx(h); V=max(r_,g_,b_); Sa=(V-min(r_,g_,b_))/V if V else 0
    if V<0.86 or Sa<0.40: continue
    seen.add(h);P.append(h)
lab=np.array([oklab(hx(h)) for h in P])
O=np.array([oklab(hx(h)) for h in OLD]); U=np.array([oklab(hx(UI[k])) for k in ('amber','rec','play')])
D=np.sqrt(((lab[:,None,:]-lab[None,:,:])**2).sum(-1))
dO=np.sqrt(((lab[:,None,:]-O[None])**2).sum(-1)).min(1)
dU=np.sqrt(((lab[:,None,:]-U[None])**2).sum(-1)).min(1)
base=np.minimum(dO,1.5*dU)
def score(S):
    s=base[S].min()
    for i in range(len(S)):
        for j in range(i+1,len(S)): s=min(s,D[S[i],S[j]])
    return s
best=None;bs=-1
for rep in range(80):
    S=random.sample(range(len(P)),8)
    for it in range(30):
        imp=False
        for k in range(8):
            rest=S[:k]+S[k+1:]
            rs=score(rest)
            v=np.minimum(base,D[:,rest].min(1)); v=np.minimum(v,rs)
            c=int(v.argmax())
            if v[c]>score(S)+1e-9: S[k]=c;imp=True
        if not imp: break
    s=score(S)
    if s>bs: bs=s;best=list(S);print(rep,round(s,4),[P[x] for x in S],flush=True)
print('BEST',round(bs,4))
for x in sorted(best,key=lambda r:lch(hx(P[r]))[2]):
    L,C,H=lch(hx(P[x])); print(P[x],'L=%.3f C=%.3f H=%.0f cr=%.2f dOld=%.3f dUI=%.3f'%(L,C,H,cr(hx(P[x]),hx(BG)),dO[x],dU[x]))
