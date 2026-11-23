import subprocess, numpy as np, sys, os, json
R=sys.argv[1]
SR=48000
def lade(p, mono=True, sr=SR):
    cmd=['ffmpeg','-v','error','-i',p,'-f','f32le','-ac','1' if mono else '2','-ar',str(sr),'-']
    b=subprocess.run(cmd,capture_output=True).stdout
    x=np.frombuffer(b,dtype=np.float32)
    return x if mono else x.reshape(-1,2)
spuren={
 'Haupt-v7':'projekt7/Haupt-3-trocken-v7.wav','Doppel-v7':'projekt7/Doppel-4-trocken-v7.wav',
 'Chor-Oberterz-v7':'projekt7/Chor-Oberterz-aus-Haupt-v7.wav','Chor-Unterterz-v7':'projekt7/Chor-Unterterz-aus-Haupt-v7.wav',
 'Gegengesang-7':'projekt7/Gegengesang-eigen-7.wav','KI-Ober-8':'projekt7/KI-Oberterz-8.wav','KI-Unter-9':'projekt7/KI-Unterterz-9.wav',
 'Orig-Gesang-3':'original/Gesang-Platzhalter-3.wav','Orig-Doppel-4':'original/Doppel-Platzhalter-4.wav',
 'P6-Gesang-3':'projekt/Gesang-Platzhalter-3.wav','P6-Doppel-4':'projekt/Doppel-Platzhalter-4.wav',
 'P6-Chor1-alt36':'projekt/Chor1-Platzhalter-alt36.wav','P6-Chor2-alt38':'projekt/Chor2-Platzhalter-alt38.wav',
}
abschn=[('Intro',0,32),('S1',32,64),('R1',64,96),('S2',96,128),('R2',128,160),('Tag',160,176),('Ueb',176,192),('ZT',192,224),('R3',224,256),('Outro',256,266)]
H=int(0.05*SR)
out={}
for k,p in spuren.items():
    x=lade(os.path.join(R,p))
    n=len(x)//H
    rms=np.sqrt(np.mean(x[:n*H].reshape(n,H)**2,axis=1)+1e-12)
    db=20*np.log10(rms)
    pk=20*np.log10(np.max(np.abs(x))+1e-12)
    akt=db>-45
    row=[]
    for nm,a,b in abschn:
        s=akt[int(a/0.05):int(b/0.05)]
        row.append(f'{nm}:{100*s.mean():.0f}%')
    # stelle 212-224
    st=db[int(212/0.05):int(224/0.05)]
    out[k]=db.tolist()
    print(f'{k:18s} peak {pk:6.1f} dBFS | '+' '.join(row))
np.save(os.path.join(os.path.dirname(__file__),'rms50ms.npy'),{k:np.array(v,dtype=np.float32) for k,v in out.items()},allow_pickle=True)
