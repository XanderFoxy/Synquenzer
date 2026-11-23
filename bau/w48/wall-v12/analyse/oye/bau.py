import sys; sys.path.insert(0,'.')
from lade import *; from f0w import f0seg
from scipy.signal import stft, istft
D=W+'/analyse/dyn/'; A=W+'/analyse/'; SR=48000; Nn=int(266*SR)
M11=np.fromfile(D+'m11.f32',np.float32).reshape(-1,2)[:Nn]; M10=np.fromfile(D+'m10.f32',np.float32).reshape(-1,2)[:Nn]
V11=np.load(D+'voc_m11.npy',mmap_mode='r'); V10=np.load(D+'voc_m10.npy',mmap_mode='r')
o=lade('orig_h').astype(np.float64); e=lade('ende').astype(np.float64)
T0,T1=219.80,221.45   # Sprechstelle (Ueberlappung)
# Referenz-Tonhoehe der 'eyes'-Kopie = Rohspur R1 (t-128 s), 10 ms
F,C,R=f0seg(o,T0-128,T1-128); tf=T0-128+np.arange(len(F))*0.01+0.025+128
ok=(F>150)&(F<260)&(C<0.3); fref=np.interp(tf,tf[ok],F[ok]); 
NF=4096; win=np.hanning(NF); fr=np.fft.rfftfreq(NF,1/SR)
def comb(x,mono=True):
    on=off=tot=0.0
    for i,t in enumerate(tf):
        a=int(t*SR)-NF//2
        s=np.asarray(x[a:a+NF],dtype=np.float64)
        if s.ndim==2: s=s.mean(1)
        P=np.abs(np.fft.rfft(s*win))**2; tot+=P[(fr>80)&(fr<8000)].sum()
        def cs(f0): 
            idx=np.round(np.arange(1,13)*f0/(SR/NF)).astype(int); return sum(P[j-1:j+2].sum() for j in idx)
        c=cs(fref[i]); d=0.5*(cs(fref[i]*2**(0.5/12))+cs(fref[i]*2**(-0.5/12)))
        on+=max(c-d,0)
    n=len(tf); return 10*np.log10(on/n/ (np.sum(win**2)*NF/2)+1e-20), 10*np.log10(tot/n/(np.sum(win**2)*NF/2)+1e-20)
# --- v12-Weg fuer die Rohspur: Betrags-Subtraktion der R1-Kopie (gleiche Doppel) ---
def subtrahiere(x, ref, t0, t1, beta=1.6, floor=0.08):
    a,b=int((t0-0.3)*SR),int((t1+0.3)*SR)
    f,t,X=stft(x[a:b],SR,nperseg=2048,noverlap=1536); _,_,Rr=stft(ref[a-128*SR:b-128*SR],SR,nperseg=2048,noverlap=1536)
    Rm=np.abs(Rr); 
    from scipy.ndimage import maximum_filter
    Rm=maximum_filter(Rm,size=(3,3))
    G=np.clip(1-beta*Rm/(np.abs(X)+1e-12),floor,1)
    _,y=istft(X*G,SR,nperseg=2048,noverlap=1536); y=y[:b-a]
    out=x.copy(); fade=int(0.03*SR); w=np.ones(b-a); w[:fade]=np.linspace(0,1,fade); w[-fade:]=np.linspace(1,0,fade)
    out[a:b]=w*y+(1-w)*x[a:b]; return out
oc=subtrahiere(o,o,T0,T1)
oc2=oc.copy(); oc2[int(217.9*SR):int(219.80*SR)]*=0.0   # 'open your' vor der Sprache: Rohspur dort stumm (wie v11)
# --- nachher fuer den v11-Mix: Gesangsbus in der Ueberlappung zusaetzlich kammgefiltert (eyes-Harmonische -20 dB) ---
def kamm(VV,t0,t1,att=0.1):
    a,b=int((t0-0.2)*SR),int((t1+0.2)*SR); out=np.array(VV[a:b],dtype=np.float64)
    for ch in range(out.shape[1]):
        f,t,X=stft(out[:,ch],SR,nperseg=4096,noverlap=3584); tt=t+(t0-0.2)
        f0=np.interp(tt,tf,fref,left=0,right=0); G=np.ones(X.shape)
        for j,ff in enumerate(f0):
            if ff<=0: continue
            for k in range(1,25):
                d=np.abs(f-k*ff); G[:,j]*=1-(1-att)*np.exp(-0.5*(d/max(8.0,0.004*k*ff))**2)
        _,y=istft(X*G,SR,nperseg=4096,noverlap=3584); out[:,ch]=y[:b-a]
    return a,b,out
a,b,vk=kamm(V11,T0,T1)
N11=np.array(M11,dtype=np.float64); fade=int(0.03*SR); w=np.ones(b-a); w[:fade]=np.linspace(0,1,fade); w[-fade:]=np.linspace(1,0,fade)
N11[a:b]+= (w[:,None]*(vk-np.asarray(V11[a:b],dtype=np.float64)))
# Messung
print('Tonhoehe Referenz eyes (Median MIDI): %.2f'%np.median(69+12*np.log2(fref/440)))
for nm,x in [('Rohspur Haupt (original)',o),('Rohspur nach Abzug R1-Kopie',oc),('Haupt v7 getunt',lade('haupt')),('v11 Haupt trocken (ende)',e),('v10 Gesangsbus',V10),('v11 Gesangsbus',V11),('v11 Master',M11),('nachher (v11+Kamm) Master',N11),('Gegengesang',lade('gegen')),('KI-Ober',lade('kio')),('Oberterz aus Haupt',lade('oter'))]:
    r,t=comb(x); print(f'{nm:30s} eyes-Rest {r:6.1f} dBFS   gesamt {t:6.1f} dBFS   Abstand {r-t:6.1f} dB')
# pre-speech 'open your' im v11-Bus
def lev(x,t0,t1):
    s=np.asarray(x[int(t0*SR):int(t1*SR)],dtype=np.float64); return 10*np.log10(np.mean(s**2)+1e-20)
print('open your (218,0-219,8): v10-Bus %.1f, v11-Bus %.1f, Rohspur %.1f dBFS; Wach auf v11-Bus %.1f'%(lev(V10,218,219.8),lev(V11,218,219.8),lev(o,218,219.8),lev(V11,215.5,216.5)))
import soundfile as sf
c0,c1=int(213.8*SR),int(225.8*SR)
def norm(x): return x
sf.write(A+'oye-vorher.wav',M11[c0:c1],SR,subtype='PCM_24')
sf.write(A+'oye-nachher.wav',np.clip(N11[c0:c1],-1,1),SR,subtype='PCM_24')
sf.write(A+'oye-v10.wav',M10[c0:c1],SR,subtype='PCM_24')
sf.write(A+'oye-roh-vorher.wav',o[c0:c1].astype(np.float32),SR,subtype='PCM_24')
sf.write(A+'oye-roh-nachher.wav',oc2[c0:c1].astype(np.float32),SR,subtype='PCM_24')
np.save(A+'oye/haupt_roh_bereinigt_217-222.npy',oc2[int(217*SR):int(222.5*SR)].astype(np.float32))
print('Diff nachher-vorher (Master, 219,8-221,45): %.1f dBFS'%lev(N11-M11,T0,T1), ' vorher %.1f'%lev(M11,T0,T1))
