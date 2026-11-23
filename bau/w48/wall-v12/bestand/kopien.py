import subprocess, numpy as np, sys
R=sys.argv[1]; SR=48000
def lade(p):
    b=subprocess.run(['ffmpeg','-v','error','-i',R+'/'+p,'-f','f32le','-ac','1','-ar',str(SR),'-'],capture_output=True).stdout
    return np.frombuffer(b,dtype=np.float32)
def best(a,b,maxl=2400):
    a=a.astype(np.float64); b=b.astype(np.float64)
    n=1<<int(np.ceil(np.log2(len(a)+len(b))))
    c=np.fft.irfft(np.fft.rfft(a,n)*np.conj(np.fft.rfft(b,n)),n)
    c=np.concatenate([c[-maxl:],c[:maxl+1]]); k=int(np.argmax(np.abs(c)))
    return k-maxl, c[k]/np.sqrt((a*a).sum()*(b*b).sum())
for nm in ['projekt7/Gegengesang-eigen-7.wav','projekt7/Haupt-3-trocken-v7.wav','projekt7/Doppel-4-trocken-v7.wav','projekt7/KI-Oberterz-8.wav','projekt7/KI-Unterterz-9.wav','projekt/Chor1-Platzhalter-alt36.wav','projekt/Chor2-Platzhalter-alt38.wav']:
    x=lade(nm)
    r1=x[63*SR:96*SR]
    out=[]
    for lab,off in [('R2',64),('R3',160),('ZT',128)]:
        y=x[(63+off)*SR:(96+off)*SR]
        k,c=best(r1,y)
        out.append(f'{lab}=R1+{off}s: Korr {c:+.2f} Versatz {1000*k/SR:+.1f} ms')
    print(f'{nm:40s} '+' | '.join(out))
# Terzen aus Haupt vs Haupt (Huellkurve)
h=lade('projekt7/Haupt-3-trocken-v7.wav')
for nm in ['projekt7/Chor-Oberterz-aus-Haupt-v7.wav','projekt7/Chor-Unterterz-aus-Haupt-v7.wav','projekt7/Doppel-4-trocken-v7.wav','projekt7/Gegengesang-eigen-7.wav','projekt7/KI-Oberterz-8.wav','projekt7/KI-Unterterz-9.wav']:
    y=lade(nm)
    H=480
    e1=np.sqrt((h[:len(h)//H*H].reshape(-1,H)**2).mean(1)); e2=np.sqrt((y[:len(y)//H*H].reshape(-1,H)**2).mean(1))
    m=(e1>1e-3)|(e2>1e-3)
    print(f'{nm:40s} Huellkurven-Korr zu Haupt-v7 {np.corrcoef(e1[m],e2[m])[0,1]:.2f}')
