import numpy as np, soundfile as sf, subprocess, pyloudnorm as pyln, sys
sys.path.insert(0,'/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/wall-v12/bau')
from dsp import *
N=266*SR; R='/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/wall-v12/repo/the-wall/'
b=subprocess.run(['ffmpeg','-v','error','-i',R+'spuren/The-Wall_v5_Instrumental-Master.mp3','-f','f32le','-ac','2','-ar','48000','-'],capture_output=True).stdout
I=np.frombuffer(b,dtype=np.float32).reshape(-1,2).astype(np.float64)[:N]
vox0,_=sf.read('/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/wall-v12/bau/stems_v12/gesang_summe.wav')
m=pyln.Meter(SR)
va=rms_db(vox0,50)>np.percentile(rms_db(vox0,50),99.5)-30
vr=10*np.log10(np.mean(vox0[va]**2)*2)
def rest(y,x,rng=[(64,96),(128,160),(224,256)]):
    e=[];
    for a,b_ in rng:
        s=slice(a*SR,b_*SR); g=(y[s]*x[s]).sum()/(x[s]**2).sum(); e.append(10*np.log10(np.sum((y[s]-g*x[s])**2)/np.sum(y[s]**2)))
    return np.mean(e)
for crest in (11.0, 9.0):
    vox,_=limiter(vox0, vr+crest, 1.5, 60.0)
    vs=rms_db(vox,50)
    for duck in (0.9, 1.3):
        md_=glaetten(np.clip((vs-(np.percentile(vs,90)-12))/12,0,1)*duck,50.0,400.0,duck)
        mix=I*undb(-md_)[:,None]+vox
        for name,stages in [('1x 60',[(-1.5,3.0,60.0)]),('fast+slow',[(-0.6,1.5,200.0),(-1.5,5.0,25.0)]),('fast150',[(-1.5,1.5,150.0)])]:
            g=0.0
            for it in range(3):
                y=mix*undb(g); grs=[]
                for c,l,r in stages: y,gr=limiter(y,c,l,r); grs.append(gr)
                g+=-10.0-m.integrated_loudness(y)
            y=mix*undb(g); grt=0
            for c,l,r in stages: y,gr=limiter(y,c,l,r); grt=grt+gr
            print('crest %4.1f duck %.1f %-10s gain %+.2f  GR p50 %.2f p95 %.2f p99 %.2f  >0.5dB %4.1f%%  Rest %.1f dB'%(crest,duck,name,g,np.median(grt),np.percentile(grt,95),np.percentile(grt,99),100*np.mean(grt>0.5),rest(y,mix)))
