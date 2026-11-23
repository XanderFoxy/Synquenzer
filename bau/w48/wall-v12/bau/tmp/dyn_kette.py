import numpy as np, json, sys
sys.path.insert(0,'/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/wall-v12/bau')
from dsp import *
exec(open('/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/wall-v12/bau/tmp/dyn_stufen.py').read().split("print('ende")[0])
x=hp(ende,110.0,2); print('HP          ', m(x))
x=eq(x,[('peak',320.0,1.0,-1.5),('peak',3400.0,0.9,1.0),('lowshelf',180.0,0.7,-1.5),('highshelf',1200.0,0.7,3.0),('peak',4500.0,1.0,1.0),('highshelf',9000.0,0.7,4.0)]); print('EQ          ', m(x))
akt=rms_db(x,50); act=akt>np.percentile(akt,99.5)-30
lvl_pk=peak_db(x,1.0); thr1=np.percentile(lvl_pk[act],97)
x1,g1=kompressor(x,thr1,3.0,5.0,70.0,knee=2.0,det='peak',det_ms=1.0); print('Stufe1      ', m(x1))
thr2=np.percentile(rms_db(x1,10)[act],50)-3.0
x2,g2=kompressor(x1,thr2,2.0,25.0,200.0,knee=6.0); print('Stufe2      ', m(x2), ' GRmed %.1f'%np.median(g2[act]))
x2b,_=kompressor(x1,thr2,2.0,25.0,200.0,knee=6.0); 
hi=rms_db(hp_zp(x2,5500.0,4),3.0); ths=np.percentile(hi[act],85)
x3,_=entzischer(x2,5500.0,ths,4.0,0.6); print('Entzischer  ', m(x3))
ar=10*np.log10(np.mean(x3[act]**2)); y,gp=limiter(np.stack([x3,x3],1),ar+11.0,1.5,60.0); print('Spitzenlim. ', m(y[:,0]), ' Anteil>1dB %.1f%%'%(100*np.mean(gp[act]>1)))
# Alternative: nur Stufe 1 + Spitzen
for thr_off,ratio in [(0,2.0),(3,1.5),(6,2.0)]:
    t2=np.percentile(rms_db(x1,10)[act],50)+thr_off
    z,g=kompressor(x1,t2,ratio,25.0,200.0,knee=6.0); print('Stufe2 thr=med%+d ratio %.1f'%(thr_off,ratio), m(z), ' GRmed %.1f p95 %.1f'%(np.median(g[act]),np.percentile(g[act],95)))
