import sys; sys.path.insert(0,'.')
from lade import *; from f0w import f0seg
SR=48000
g=lade('gegen'); h=lade('haupt')
def show(x,t0,t1,lab):
    F,C,R=f0seg(x,t0,t1); out=[]
    for i in range(0,len(F),5):
        r=20*np.log10(R[i]); 
        out.append('.' if r<-40 else (f'{69+12*np.log2(F[i]/440):.0f}' if F[i]>0 and C[i]<0.25 else '~'))
    print(lab, ' '.join(out))
show(g,219.4,221.6,'gegen ZT 219.4-221.6 ')
show(g,91.4,93.6, 'gegen R1  91.4- 93.6 ')
show(g,155.4,157.6,'gegen R2 155.4-157.6 ')
show(g,251.4,253.6,'gegen R3 251.4-253.6 ')
show(g,215.3,217.3,'gegen ZT Wach auf    ')
show(g,87.3,89.3,'gegen R1 wake up     ')
# Huellkurven-Kreuzkorrelation gegen ZT 219.8-221.3 mit R1 88-95
def env(x,t0,t1):
    s=x[int(t0*SR):int(t1*SR)]; n=len(s)//480
    return np.log(np.sqrt((s[:n*480].reshape(n,480)**2).mean(1))+1e-4)
a=env(g,219.8,221.3); best=[]
for t in np.arange(86.0,95.0,0.01):
    best.append((np.corrcoef(a,env(g,t,t+1.5))[0,1],t))
best.sort(reverse=True); print('beste R1-Stelle fuer gegen ZT 219.8:',[(round(c,2),round(t,2)) for c,t in best[:3]])
a=env(h,219.85,221.35); best=[]
for t in np.arange(86.0,95.0,0.01): best.append((np.corrcoef(a,env(h,t,t+1.5))[0,1],t))
best.sort(reverse=True); print('beste R1-Stelle fuer haupt ZT 219.85:',[(round(c,2),round(t,2)) for c,t in best[:3]])
