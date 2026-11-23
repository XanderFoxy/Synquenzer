import sys; sys.path.insert(0,'.')
from lade import *; from f0w import f0seg
ks=['haupt','ende','doppel','oter','uter','gegen','kio','kiu']
t0,t1=214.9,222.6
res={k:f0seg(lade(k),t0,t1) for k in ks}
print('t     '+' '.join(f'{k[:8]:>10}' for k in ks))
for i in range(0,len(res['haupt'][0]),10):
    t=t0+i*0.01+0.025; row=[]
    for k in ks:
        F,C,R=res[k]; f,c,r=F[i],C[i],20*np.log10(R[i])
        if r<-45: row.append('.')
        elif f>0 and c<0.25: row.append(f'{69+12*np.log2(f/440):5.1f}/{r:3.0f}')
        else: row.append(f'~/{r:3.0f}')
    print(f'{t:6.2f} '+' '.join(f'{s:>10}' for s in row))
