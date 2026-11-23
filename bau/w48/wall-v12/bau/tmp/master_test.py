import numpy as np, pyloudnorm as pyln, sys
sys.path.insert(0,'/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/wall-v12/bau')
from dsp import *
mix=np.load('/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/wall-v12/bau/mix_vor_master.npy').astype(np.float64)
m=pyln.Meter(SR); N=len(mix)
def rest(y,x,rng=[(64,96),(128,160),(224,256)]):
    e=[]
    for a,b_ in rng:
        s=slice(a*SR,b_*SR); g=(y[s]*x[s]).sum()/(x[s]**2).sum(); e.append(10*np.log10(np.sum((y[s]-g*x[s])**2)/np.sum(y[s]**2)))
    return np.mean(e)
def A(x):
    y,c,mx=softclip(x,-3.0,-0.8); y,g1=limiter(y,-0.65,1.5,200.0); y,g2=limiter(y,-1.55,5.0,25.0); return y,g1+g2,mx,0
def Bv(x,pre=0.5):
    y,g0=limiter(x,pre,1.5,200.0); y,c,mx=softclip(y,-3.0,-0.8); y,g1=limiter(y,-0.65,1.5,200.0); y,g2=limiter(y,-1.55,5.0,25.0); return y,g1+g2,mx,g0
for name,f in [('A clip zuerst',A),('B Limiter +0.5 vor Clip',Bv),('C Limiter -0.5 vor Clip',lambda x: Bv(x,-0.5))]:
    g=0.0
    for it in range(3):
        y,gr,mx,g0=f(mix*undb(g)); g+=-10.0-m.integrated_loudness(y)
    y,gr,mx,g0=f(mix*undb(g))
    g0=np.asarray(g0)
    print('%-26s gain %+.2f | Clip max %.1f dB | Vorlimiter GR>1dB %.3f%% max %.1f | End-GR p95 %.2f max %.2f | Rest %.1f dB'%(name,g,mx,100*np.mean(g0>1) if g0.ndim else 0,g0.max() if g0.ndim else 0,np.percentile(gr,95),gr.max(),rest(y,mix)))
