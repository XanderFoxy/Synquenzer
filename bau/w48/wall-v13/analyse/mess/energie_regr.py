# Energie-Regression: E_orig(t) = sum_j g_j * E_trocken(t - j*dt)  (NNLS), trocken über die Zeitkarte auf Aufnahme-Zeit gelegt
import json, sys, numpy as np
from scipy.signal import butter, sosfiltfilt
from scipy.optimize import nnls
SR=48000
S='/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad'
L=json.load(open(S+'/wall/werkzeug/lied.json'))
wet=np.load(sys.argv[1]).astype(np.float64); dry=np.load(sys.argv[2]).astype(np.float64)
karte = len(sys.argv)>3 and sys.argv[3]=='karte'
if karte:
    d2=np.zeros_like(dry)
    for a0,a1,r0,r1 in L['karte']:
        i0=int(round(a0*SR)); i1=int(round(a1*SR)); j0=int(round(r0*SR)); n=min(i1-i0, len(d2)-j0)
        if n>0: d2[j0:j0+n]=dry[i0:i0+n]
    dry=d2
band=(300,6000)
sos=butter(4,band,'bandpass',fs=SR,output='sos')
w=sosfiltfilt(sos,wet); d=sosfiltfilt(sos,dry)
fr=int(0.01*SR); nf=len(w)//fr
Ew=(w[:nf*fr]**2).reshape(nf,fr).mean(1); Ed=(d[:nf*fr]**2).reshape(nf,fr).mean(1)
# Envelope correlation
print('Hüllkurven-Korrelation (10 ms, log):', np.corrcoef(np.log(Ew+1e-10),np.log(Ed+1e-10))[0,1])
J=261
# only use frames from 30 s on (vocals)
rows=np.arange(int(30/0.01),nf)
A=np.stack([Ed[rows-j] for j in range(J)],1)
b=Ew[rows]
sc=A.max()
g,_=nnls(A/sc,b/sc,maxiter=5000)
np.save('g_'+sys.argv[1].replace('.npy','')+('_k' if karte else '')+'.npy',g)
g0=g[0:3].sum()
print('g0(0-20ms)=%.4g'%g0)
for j in range(0,J,5):
    print('%4.2fs %7.1f dB'%(j*0.01, 10*np.log10(max(g[j:j+5].sum(),1e-12)/g0)), end='   ')
    if j%25==20: print()
print()
for c in [50,100,150,200]:
    loc=g[c-2:c+3].sum(); flo=np.median(np.r_[g[c-12:c-4],g[c+4:c+12]])*5
    print('Spitze %.1fs: gesamt %.1f dB, über Boden %.1f dB (Boden %.1f dB)'%(c/100,10*np.log10(loc/g0),10*np.log10(max(loc-flo,1e-12)/g0),10*np.log10(flo/g0)))
