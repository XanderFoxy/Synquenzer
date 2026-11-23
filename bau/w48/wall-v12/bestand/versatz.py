import subprocess, numpy as np, sys, os
R=sys.argv[1]; SR=48000
def lade(p, t=40):
    b=subprocess.run(['ffmpeg','-v','error','-i',p,'-t',str(t),'-f','f32le','-ac','1','-ar',str(SR),'-'],capture_output=True).stdout
    return np.frombuffer(b,dtype=np.float32)
ref=lade(R+'/spuren/The-Wall_v5_Instrumental-Master.mp3')
def lag(a,b,maxl=4800):
    # sample-genaue Kreuzkorrelation im Intro 2..30 s (FFT)
    a=a[2*SR:30*SR].astype(np.float64); b=b[2*SR:30*SR].astype(np.float64)
    n=1<<int(np.ceil(np.log2(len(a)+len(b))))
    c=np.fft.irfft(np.fft.rfft(a,n)*np.conj(np.fft.rfft(b,n)),n)
    c=np.concatenate([c[-maxl:],c[:maxl+1]])
    k=int(np.argmax(c))-maxl
    return k, c.max()/np.sqrt((a*a).sum()*(b*b).sum())
for p in ['projekt7/The-Wall_A_v7_Club.mp3','projekt9/The-Wall_v9_Dicht-klar.mp3','projekt10/The-Wall_A_v10_Club.mp3','projekt11/The-Wall_A_v11.mp3','master/The-Wall_A_v5_Club.mp3','spuren/The-Wall_v5_Chor.mp3']:
    x=lade(R+'/'+p)
    k,c=lag(ref,x)
    print(f'{p:45s} Versatz zu v5-Instrumental {k:+5d} Samples ({1000*k/SR:+.2f} ms), Korr {c:.2f}')
