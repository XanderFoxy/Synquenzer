# Welche Stimmen sind in v11 wo zu hoeren? (Gesangsbus v11 = Master - Instrumental)
import numpy as np, soundfile as sf
W='/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/wall-v12/'
SR=48000
V=np.load(W+'analyse/dyn/voc_m11.npy').astype(np.float64)
mid=V.mean(1)
d=np.load(W+'analyse/f0.npz'); T=np.arange(len(d['haupt_f']))*0.01+0.025
def f0(k):
    f=d[k+'_f'].copy(); c=d[k+'_c']; r=d[k+'_r']; v=(c<0.25)&(r>-42)&(f>70)&(f<1000); f[~v]=np.nan; return f
L=f0('haupt'); D=f0('doppel'); G=f0('gegen')
NF=4096; win=np.hanning(NF); fr=np.fft.rfftfreq(NF,1/SR)
def harm(seg,f,cents=25):
    X=np.abs(np.fft.rfft(seg*win))**2
    on=0; off=0
    for h in range(1,7):
        fh=f*h
        m_on=(fr>fh*2**(-cents/1200))&(fr<fh*2**(cents/1200))
        m_off=((fr>fh*2**(-110/1200))&(fr<fh*2**(-60/1200)))|((fr>fh*2**(60/1200))&(fr<fh*2**(110/1200)))
        if m_on.any() and m_off.any(): on+=X[m_on].mean(); off+=X[m_off].mean()
    return 10*np.log10(on/off)
secs=[('S1',32,64),('R1',64,96),('S2',96,128),('R2',128,160),('Tag',160,176),('Ub',176,192),('ZT',192,224),('R3',224,256),('Out',256,266)]
def test(F,name,excl):
    print(name)
    for nm,a,b in secs:
        vals=[];ctrl=[]
        for i in np.where((T>=a)&(T<b))[0][::5]:
            f=F[i]
            if np.isnan(f): continue
            ok=True
            for E in excl:
                e=E[i]
                if not np.isnan(e):
                    dd=abs(12*np.log2(f/e))%12
                    if min(dd,12-dd)<1.5 or abs(12*np.log2(f/e))<1.5: ok=False
            if not ok: continue
            s=int(T[i]*SR)-NF//2
            if s<0 or s+NF>len(mid): continue
            seg=mid[s:s+NF]
            vals.append(harm(seg,f)); ctrl.append(harm(seg,f*2**(0.5/12)))
        if len(vals)>5: print('  %s n=%d  Ton %.1f dB  Kontrolle %.1f dB'%(nm,len(vals),np.median(vals),np.median(ctrl)))
test(G,'Gegengesang (Lead-Tonhoehe ausgeschlossen)',[L])
# Doppel: nur Stellen, wo Doppel != Lead (>0.7 HT) oder Lead stumm
def testD():
    print('Doppel (wo Lead stumm oder >0.7 HT anders)')
    for nm,a,b in secs:
        vals=[];ctrl=[]
        for i in np.where((T>=a)&(T<b))[0][::3]:
            f=D[i]
            if np.isnan(f): continue
            l=L[i]
            if not np.isnan(l) and abs(12*np.log2(f/l))<0.7: continue
            g=G[i]
            if not np.isnan(g) and abs(12*np.log2(f/g))%12<1: continue
            s=int(T[i]*SR)-NF//2
            seg=mid[s:s+NF]
            vals.append(harm(seg,f)); ctrl.append(harm(seg,f*2**(0.5/12)))
        if len(vals)>5: print('  %s n=%d  Ton %.1f dB  Kontrolle %.1f dB'%(nm,len(vals),np.median(vals),np.median(ctrl)))
testD()
# Pegel des Busses je Teil
for nm,a,b in secs:
    s=slice(a*SR,b*SR); print(nm,'Bus rms %.1f dBFS, side/mid %.1f'%(10*np.log10(np.mean(mid[s]**2)), 10*np.log10(np.mean(((V[s,0]-V[s,1])/2)**2)/np.mean(mid[s]**2))))
