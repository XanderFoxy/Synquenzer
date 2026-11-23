import sys; sys.path.insert(0,'.')
from lade import *
SR=48000
ks=['haupt','doppel','oter','uter','gegen','kio','kiu','orig_h','orig_d','ende','gereinigt','haupt-v10','master-v11']
t0,t1=212.0,226.0
print('t     '+' '.join(f'{k[:7]:>7}' for k in ks))
X={k:lade(k) for k in ks}
for k in ks: print(k, X[k].shape)
for i in range(int((t1-t0)/0.25)):
    a=int((t0+i*0.25)*SR); b=a+int(0.25*SR)
    row=[20*np.log10(np.sqrt(np.mean(X[k][a:b]**2))+1e-9) for k in ks]
    print(f'{t0+i*0.25:6.2f} '+' '.join(f'{v:7.1f}' for v in row))
