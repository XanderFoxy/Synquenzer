# Energie in den Echo-Zonen nach Phrasenenden: Original-Rohaufnahme vs. Nachbau(trocken) für beide Mischgesetze
import sys, numpy as np
sys.path.insert(0,'/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/wall-v13/bau')
import echo_cubasis as ec
from scipy.signal import butter, sosfiltfilt
SR=48000
o=np.load('orig.npy').astype(np.float64); d=np.load('troc_roh.npy').astype(np.float64)
sos=butter(4,(300,8000),'bandpass',fs=SR,output='sos')
fr=int(0.01*SR)
def E10(x):
    y=sosfiltfilt(sos,x); nf=len(y)//fr; return (y[:nf*fr]**2).reshape(nf,fr).mean(1)
Ed=E10(d); dbd=10*np.log10(Ed+1e-14)
thr=np.percentile(dbd[3000:],95)-35
act=dbd>thr
# Enden: aktiv -> danach >= 110 Frames inaktiv, davor >= 40 Frames überwiegend aktiv
ends=[]
for i in range(3200,len(act)-150):
    if act[i-1] and not act[i:i+110].any() and act[i-40:i].mean()>0.6: ends.append(i)
print('Zonen:',len(ends),[round(e/100,2) for e in ends])
def ratios(E):
    r1=[];r2=[]
    for e in ends:
        den=E[e-47:e-3].sum()
        r1.append(E[e+3:e+47].sum()/den); r2.append(E[e+53:e+97].sum()/den)
    return 10*np.log10(np.array(r1)),10*np.log10(np.array(r2))
res={'orig':ratios(E10(o))}
for g in ['sinus','doppelt']:
    tr,ech,ha=ec.kette(d,SR,'haupt',gesetz=g,mit_chorus=False)
    m=(tr+ech+ha).mean(1)
    res[g]=ratios(E10(m))
    # Anteile einzeln
    res[g+'_ohneHall']=ratios(E10((tr+ech).mean(1)))
for k,(a,b) in res.items():
    print('%-16s Zone1 median %6.1f dB (IQR %5.1f..%5.1f)  Zone2 median %6.1f dB'%(k,np.median(a),*np.percentile(a,[25,75]),np.median(b)))
for k in ['sinus','doppelt']:
    print(k,'Differenz orig−modell Zone1 je Zone: median %.2f dB, Zone2 %.2f dB'%(np.median(res['orig'][0]-res[k][0]),np.median(res['orig'][1]-res[k][1])))
