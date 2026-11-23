import random, math
from farbwahl import *
random.seed(7)
def cand():
    while True:
        L=random.uniform(0.71,0.85); C=random.uniform(0.12,0.20); H=random.uniform(0,360)
        rgb=fromlab(L,C*math.cos(math.radians(H)),C*math.sin(math.radians(H)))
        if all(-0.001<=c<=1.001 for c in rgb):
            rgb=[delin(max(0,min(1,c))) for c in rgb]
            rgb=hx(tohex(rgb))
            if cr(rgb,hx(BG))>=7.2: return rgb
P=[cand() for _ in range(6000)]
O=[hx(h) for h in OLD]; U=[hx(UI['amber']),hx(UI['rec']),hx(UI['play'])]
def score(S):
    allc=O+S; m=min(dist(a,b) for i,a in enumerate(allc) for b in allc[i+1:])
    mu=min(dist(a,u) for a in S for u in U)
    return min(m, mu*1.6)
best=None;bs=-1
for rep in range(30):
    S=random.sample(P,8)
    for it in range(25):
        imp=False
        for k in range(8):
            cur=score(S)
            for c in random.sample(P,400):
                T=S[:k]+[c]+S[k+1:]; s=score(T)
                if s>cur: S=T;cur=s;imp=True
        if not imp: break
    s=score(S)
    if s>bs: bs=s;best=S;print(rep,round(s,4),[tohex(x) for x in S],flush=True)
print('BEST',[tohex(x) for x in best])
for x in sorted(best,key=lambda r:lch(r)[2]):
    L,C,H=lch(x); print(tohex(x),'L=%.3f C=%.3f H=%.0f cr=%.2f'%(L,C,H,cr(x,hx(BG))))
