import sys; sys.path.insert(0,'.')
from lade import *
from scipy.signal import correlate
SR=48000
T={k:lade(k) for k in ['haupt','ende','oter','uter','gegen','kio','kiu','orig_h']}
def xc(a,b):
    c=correlate(a,b,mode='full',method='fft'); n=np.sqrt(np.sum(a*a)*np.sum(b*b))+1e-12
    i=np.argmax(np.abs(c)); return c[i]/n,(i-(len(b)-1))/SR
for k in ['haupt','orig_h','oter','kio','kiu','gegen']:
  for t0,t1,lab in [(217.9,219.85,'open your'),(219.85,221.4,'Sprechst.')]:
    a=T[k][int(t0*SR):int(t1*SR)]
    out=[]
    for src,off in [('R1',-128),('R2',-64),('R3',32)]:
        b=T[k][int((t0+off-0.3)*SR):int((t1+off+0.3)*SR)]
        c,l=xc(b,a); out.append(f'{src}: r={c:+.2f} @{l-0.3:+.3f}s')
    print(f'{k:7s} {lab:10s}',' | '.join(out))
# Speech: ende vs haupt
a=T['ende'][int(219.85*SR):int(221.4*SR)]; b=T['haupt'][int(219.55*SR):int(221.7*SR)]
c,l=xc(b,a); print('ende vs haupt v7 Sprechstelle: r=%.2f lag %.3f'%(c,l-0.3))
