import numpy as np, soundfile as sf, subprocess, pyloudnorm as pyln, sys
sys.path.insert(0,'/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/wall-v12/bau')
from dsp import *
N=266*SR; R='/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/wall-v12/repo/the-wall/'
b=subprocess.run(['ffmpeg','-v','error','-i',R+'spuren/The-Wall_v5_Instrumental-Master.mp3','-f','f32le','-ac','2','-ar','48000','-'],capture_output=True).stdout
I=np.frombuffer(b,dtype=np.float32).reshape(-1,2).astype(np.float64)[:N]
vox,_=sf.read('/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/wall-v12/bau/stems_v12/gesang_summe.wav')
vs=rms_db(vox,50); md_=glaetten(np.clip((vs-(np.percentile(vs,90)-12))/12,0,1)*0.9,50.0,400.0,0.9)
mix=I*undb(-md_)[:,None]+vox
m=pyln.Meter(SR)
print('Summe ohne Limiter: LUFS %.2f TP %.2f'%(m.integrated_loudness(mix),true_peak(mix)))
print('nur Musik geduckt: LUFS %.2f TP %.2f'%(m.integrated_loudness(I*undb(-md_)[:,None]),true_peak(I*undb(-md_)[:,None])))
for rel in (20.0, 60.0, 150.0):
    for look in (1.5, 4.0):
        g=0.0
        for it in range(3):
            y,gr=limiter(mix*undb(g),-1.5,look,rel); lu=m.integrated_loudness(y); g+=-10.0-lu
        y,gr=limiter(mix*undb(g),-1.5,look,rel)
        print('rel %5.0f dB/s look %.1f ms: gain %+.2f LUFS %.2f  GR p50 %.2f p99 %.2f max %.2f  >0.5dB %.1f%%'%(rel,look,g,m.integrated_loudness(y),np.median(gr),np.percentile(gr,99),gr.max(),100*np.mean(gr>0.5)))
