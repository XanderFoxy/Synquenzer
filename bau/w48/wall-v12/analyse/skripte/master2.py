import numpy as np, subprocess, json, soundfile as sf
from scipy.signal import resample_poly
W='/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/wall-v12'; R=W+'/repo/the-wall/'
SR=16000
d=np.load(W+'/analyse/f0.npz'); T=np.arange(len(d['haupt_f']))*0.01+0.025
exec(open(W+'/analyse/skripte/noten_lib.py').read())
LN=[n for n in noten('haupt') if (64<=n[0]<96 or 128<=n[0]<160 or 224<=n[0]<256) and n[1]-n[0]>=0.3]
NF=4096; win=np.hanning(NF); fr=np.fft.rfftfreq(NF,1/SR)
def spec(x,a,b):
    i0=int(a*SR); i1=int(b*SR); return np.mean([np.abs(np.fft.rfft(x[s:s+NF]*win))**2 for s in range(i0,max(i0+1,i1-NF),NF//4)],0)
def band(S,f): m=(fr>=f*2**(-0.3/12))&(fr<=f*2**(0.3/12)); return S[m].sum()
def prof(sig):
    P=np.zeros(37)
    for (a,b,p,_) in LN:
        f0=440*2**((round(p)-69)/12); S=spec(sig,a+0.05,b); e=np.array([band(S,f0*2**(k/12)) for k in range(-12,25)]); P+=e/(e.sum()+1e-20)*(b-a)
    return P/P.sum()
def wav(p):
    x,_=sf.read(R+p,dtype='float32'); return resample_poly(x,1,3).astype(np.float64)
H=wav('projekt7/Haupt-3-trocken-v7.wav'); base=prof(H)
mp=json.load(open(W+'/analyse/master_profil.json'))
src={k:prof(wav(p)) for k,p in [('Gegengesang','projekt7/Gegengesang-eigen-7.wav'),('Oberterz','projekt7/Chor-Oberterz-aus-Haupt-v7.wav'),('Unterterz','projekt7/Chor-Unterterz-aus-Haupt-v7.wav')]}
print('Basis Haupt trocken:',[(k-12,round(100*base[k],1)) for k in np.argsort(-base)[:6]])
for k,v in src.items(): print(k,[(i-12,round(100*v[i],1)) for i in np.argsort(-v)[:6]])
for v in mp:
    m=np.array(mp[v]['mid'])/100; ex=m-base
    print(v,'Mid-Ueberschuss ggü. Lead allein:',[(k-12,round(100*ex[k],1)) for k in np.argsort(-ex)[:7]])
