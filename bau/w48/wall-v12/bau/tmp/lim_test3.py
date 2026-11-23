import numpy as np, soundfile as sf, subprocess, pyloudnorm as pyln, sys
sys.path.insert(0,'/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/wall-v12/bau')
from dsp import *
N=266*SR; R='/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/wall-v12/repo/the-wall/'
b=subprocess.run(['ffmpeg','-v','error','-i',R+'spuren/The-Wall_v5_Instrumental-Master.mp3','-f','f32le','-ac','2','-ar','48000','-'],capture_output=True).stdout
I=np.frombuffer(b,dtype=np.float32).reshape(-1,2).astype(np.float64)[:N]
vox,_=sf.read('/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/wall-v12/bau/stems_v12/gesang_summe.wav')
vox*=undb(-0.4)
vs=rms_db(vox,50); md_=glaetten(np.clip((vs-(np.percentile(vs,90)-12))/12,0,1)*1.3,50.0,400.0,1.3)
mu,_=limiter(I*undb(-md_)[:,None],-1.5,3.0,40.0)
mix=mu+vox; m=pyln.Meter(SR)
def softclip(x,thr_db=-3.0,ceil_db=-1.0):
    up=resample_poly(x,4,1,axis=0); t=undb(thr_db); c=undb(ceil_db)
    a=np.abs(up); over=a>t
    y=up.copy(); y[over]=np.sign(up[over])*(t+(c-t)*np.tanh((a[over]-t)/(c-t)))
    return resample_poly(y,1,4,axis=0)[:len(x)]
def rest(y,x,rng=[(64,96),(128,160),(224,256)]):
    e=[]
    for a,b_ in rng:
        s=slice(a*SR,b_*SR); g=(y[s]*x[s]).sum()/(x[s]**2).sum(); e.append(10*np.log10(np.sum((y[s]-g*x[s])**2)/np.sum(y[s]**2)))
    return np.mean(e)
def zwei(x):
    y,g1=limiter(x,-0.6,1.5,200.0); y,g2=limiter(y,-1.5,5.0,25.0); return y,g1+g2
for name,f in [('2-stufig',lambda x: zwei(x)),('Clip -3/-0.8 + 2-stufig',lambda x: zwei(softclip(x,-3.0,-0.8))),('Clip -2/-0.5 + 2-stufig',lambda x: zwei(softclip(x,-2.0,-0.5)))]:
    g=0.0
    for it in range(3):
        y,gr=f(mix*undb(g)); g+=-10.0-m.integrated_loudness(y)
    y,gr=f(mix*undb(g))
    sel=np.zeros(N,bool)
    for a,b_ in [(64,96),(128,160),(224,256)]: sel[a*SR:b_*SR]=True
    print('%-26s gain %+.2f LUFS %.2f TP %.2f | GR gesamt p95 %.2f p99 %.2f >0.5dB %.1f%% | Refrain p50 %.2f p95 %.2f | Rest %.1f dB'%(name,g,m.integrated_loudness(y),true_peak(y),np.percentile(gr,95),np.percentile(gr,99),100*np.mean(gr>0.5),np.median(gr[sel]),np.percentile(gr[sel],95),rest(y,mix)))
