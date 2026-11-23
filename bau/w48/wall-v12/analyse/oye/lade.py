import numpy as np, soundfile as sf
W='/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/wall-v12'
R='/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/wall/roh'
SP={'haupt':'projekt7/Haupt-3-trocken-v7.wav','doppel':'projekt7/Doppel-4-trocken-v7.wav','oter':'projekt7/Chor-Oberterz-aus-Haupt-v7.wav','uter':'projekt7/Chor-Unterterz-aus-Haupt-v7.wav','gegen':'projekt7/Gegengesang-eigen-7.wav','kio':'projekt7/KI-Oberterz-8.wav','kiu':'projekt7/KI-Unterterz-9.wav','orig_h':'original/Gesang-Platzhalter-3.wav','orig_d':'original/Doppel-Platzhalter-4.wav'}
def lade(k):
    if k in SP:
        x,sr=sf.read(W+'/repo/the-wall/'+SP[k],dtype='float32'); assert sr==48000
        return x if x.ndim==1 else x.mean(1)
    return np.load(R+'/'+k+'.npy').astype(np.float32)
