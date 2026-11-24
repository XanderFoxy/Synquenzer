# Nachbau (trockene v7-Spur über Zeitkarte → echo_cubasis.kette) gegen die Original-Rohaufnahme mit alter Kette
import sys, json, numpy as np
sys.path.insert(0,'/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/wall-v13/bau')
import echo_cubasis as ec
from scipy.signal import butter, sosfiltfilt
SR=48000; fr=int(0.01*SR)
L=json.load(open('/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/wall/werkzeug/lied.json'))
def roh(t):
    d2=np.zeros_like(t)
    for a0,a1,r0,r1 in L['karte']:
        i0=int(round(a0*SR)); i1=int(round(a1*SR)); j0=int(round(r0*SR)); n=min(i1-i0,len(d2)-j0)
        if n>0: d2[j0:j0+n]=t[i0:i0+n]
    return d2
def acf_vals(x,band=(300,10000)):
    y=sosfiltfilt(butter(4,band,'bandpass',fs=SR,output='sos'),x)[int(30*SR):]
    n=len(y); N=1<<int(np.ceil(np.log2(2*n)))
    Y=np.fft.rfft(y,N); r=np.fft.irfft(np.abs(Y)**2,N)[:int(2.6*SR)]; r/=r[0]
    return np.array([r[int(Lg*SR)] for Lg in [0.5,1.0,1.5,2.0]])
def E10(x,band):
    y=sosfiltfilt(butter(4,band,'bandpass',fs=SR,output='sos'),x); nf=len(y)//fr; return (y[:nf*fr]**2).reshape(nf,fr).mean(1)
out={}
for nm,wet,dry,spur in [('haupt','orig.npy','troc.npy','haupt'),('doppel','origD.npy','trocD.npy','doppel')]:
    wet=np.load(wet).astype(np.float64); dry=roh(np.load(dry).astype(np.float64))
    R={}
    for g in ['gemessen','sinus','doppelt']:
        tr,e,h=ec.kette(dry,SR,spur,gesetz=g); m=(tr+e+h).mean(1)
        Ed=E10(dry,(300,8000)); dbd=10*np.log10(Ed+1e-14); thr=np.percentile(dbd[3000:],95)-30; act=dbd>thr
        ends1=[i for i in range(3200,len(act)-120) if act[i-1] and not act[i:i+52].any() and act[i-45:i].mean()>0.7]
        ends2=[i for i in ends1 if not act[i:i+100].any()]
        Eo=E10(wet,(300,8000)); Em=E10(m,(300,8000))
        z1=[10*np.log10(Eo[e_+3:e_+49].sum()/Eo[e_-49:e_-3].sum())-10*np.log10(Em[e_+3:e_+49].sum()/Em[e_-49:e_-3].sum()) for e_ in ends1]
        z2=[10*np.log10(Eo[e_+53:e_+97].sum()/Eo[e_-47:e_-3].sum())-10*np.log10(Em[e_+53:e_+97].sum()/Em[e_-47:e_-3].sum()) for e_ in ends2]
        R[g]=dict(acf_nachbau=np.round(acf_vals(m),4).tolist(), zone1_orig_minus_nachbau_db=round(float(np.median(z1)),2),
                  zone1_iqr=np.round(np.percentile(z1,[25,75]),2).tolist(), zone2_orig_minus_nachbau_db=round(float(np.median(z2)),2),
                  zone2_iqr=np.round(np.percentile(z2,[25,75]),2).tolist(), zonen=[len(z1),len(z2)])
        if g=='gemessen':
            st=tr+e+h; R[g]['stereo_korrelation']=round(float(np.corrcoef(st[:,0],st[:,1])[0,1]),3)
            R[g]['seite_zu_mitte_db']=round(float(10*np.log10(np.mean((st[:,0]-st[:,1])**2)/np.mean((st[:,0]+st[:,1])**2))),1)
        print(nm,g,R[g])
    out[nm]=dict(acf_original=np.round(acf_vals(wet),4).tolist(),gesetze=R)
    print(nm,'ACF original',out[nm]['acf_original'])
json.dump(out,open('validierung_final.json','w'),indent=1)
