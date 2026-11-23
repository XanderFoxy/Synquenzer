import sys; sys.path.insert(0,'.')
from lade import *; from f0w import f0seg
D=W+'/analyse/dyn/'
V=np.load(D+'voc_m11.npy',mmap_mode='r'); V10=np.load(D+'voc_m10.npy',mmap_mode='r')
print(V.shape)
SR=48000
I=np.fromfile(D+'inst.f32',np.float32).reshape(-1,2)
g,h,e,k1=lade('gegen'),lade('haupt'),lade('ende'),lade('kio')
def db(x): return 20*np.log10(np.sqrt(np.mean(np.square(x,dtype=np.float64)))+1e-9)
print('t      voc11  voc10  inst | env-corr gegen~haupt (200ms)')
for t in np.arange(214.0,223.0,0.25):
    a=int(t*SR); b=a+int(.25*SR)
    print(f'{t:6.2f} {db(V[a:b]):6.1f} {db(V10[a:b]):6.1f} {db(I[a:b]):6.1f}')
# Gegengesang vs Sprache: Huellkurven-Korrelation mit Versatz
def env(x,t0,t1):
    s=x[int(t0*SR):int(t1*SR)]; n=len(s)//480
    return np.sqrt((s[:n*480].reshape(n,480)**2).mean(1))
a=env(g,219.7,221.5)
for lag in range(-30,31,5):
    b=env(h,219.7+lag*0.01,221.5+lag*0.01)
    print('lag',lag*10,'ms corr gegen/haupt %.2f'%np.corrcoef(a,b)[0,1], ' gegen/ende %.2f'%np.corrcoef(a,env(e,219.7+lag*0.01,221.5+lag*0.01))[0,1])
# Gegengesang ZT-Rest vs R1/R3 gleiche Stelle
for name,off in [('R1',-128),('R3',32),('R2',-64)]:
    print(name,'gegen corr %.2f'%np.corrcoef(a,env(g,219.7+off,221.5+off))[0,1],'level %.1f'%db(g[int((219.7+off)*SR):int((221.5+off)*SR)]))
