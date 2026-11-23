import numpy as np, soundfile as sf, sys
sys.path.insert(0,'/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/wall-v12/bau')
import dsp
from dsp import *
exec(open('/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/wall-v12/bau/tmp/dyn_stufen.py').read().split("print('ende")[0])
vox=sf.read('/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/wall-v12/bau/stems_v12/gesang_summe.wav')[0]
mix=np.load('/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/wall-v12/bau/mix_vor_master.npy').astype(np.float64)
mus=mix-vox
va=rms_db(vox,50)>np.percentile(rms_db(vox,50),99.5)-30
ar=10*np.log10(np.mean(vox[va]**2)*2)
print('Gesang aktiv RMS %.1f dBFS, TP %.1f'%(ar,true_peak(vox)))
print('ohne      ', m(vox.mean(1)))
for crest,rel in [(12,150.0),(10,150.0),(10,300.0)]:
    v,gr=limiter(vox,ar+crest,1.5,rel)
    s=dsp._tp_hull(mus+v); d=db(s)
    print('crest %d rel %d: '%(crest,rel), m(v.mean(1)), ' GR>1dB %.2f%% p99.9 %.1f | Summe >-3: %.2f%% >0: %.3f%% max %.1f'%(100*np.mean(gr[va]>1),np.percentile(gr[va],99.9),100*np.mean(d>-3),100*np.mean(d>0),d.max()))
