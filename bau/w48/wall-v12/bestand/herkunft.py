import subprocess, numpy as np, sys
R=sys.argv[1]; SR=8000
def lade(p):
    b=subprocess.run(['ffmpeg','-v','error','-i',R+'/'+p,'-f','f32le','-ac','1','-ar','8000','-'],capture_output=True).stdout
    return np.frombuffer(b,dtype=np.float32).astype(np.float64)
def suche(x, a, b, ausschl=1.0):
    q=x[int(a*SR):int(b*SR)]
    n=1<<int(np.ceil(np.log2(len(x)+len(q))))
    c=np.fft.irfft(np.fft.rfft(x,n)*np.conj(np.fft.rfft(q,n)),n)[:len(x)-len(q)]
    cs=np.concatenate([[0],np.cumsum(x*x)]); e=np.sqrt((cs[len(q):]-cs[:-len(q)])[:len(c)]+1e-12)
    r=c/(e*np.sqrt((q*q).sum()))
    i0=int(a*SR); r[max(0,i0-int(ausschl*SR)):i0+int(ausschl*SR)]=-1
    top=[]
    for _ in range(3):
        k=int(np.argmax(r)); top.append((k/SR, r[k])); r[max(0,k-SR):k+SR]=-1
    return top
for p,a,b,lab in [('projekt7/Gegengesang-eigen-7.wav',219.58,221.39,'Gegengesang ZT-7'),
                  ('projekt7/Haupt-3-trocken-v7.wav',217.9,219.2,'Haupt gesungener Rest'),
                  ('original/Gesang-Platzhalter-3.wav',217.9,219.2,'Original gesungener Rest'),
                  ('projekt7/KI-Oberterz-8.wav',218.18,221.03,'KI-Ober ZT-4'),
                  ('projekt7/Gegengesang-eigen-7.wav',214.2,217.4,'Gegengesang ZT-6')]:
    x=lade(p)
    print(f'{lab:26s} {a}-{b}: beste Fundstellen ' + ', '.join(f'{t:.3f}s (r={v:.2f}, Abstand {t-a:+.3f}s)' for t,v in suche(x,a,b)))
