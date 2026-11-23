# Gesangsbus aus Master schaetzen: Master - g(t)*Instrumental(v5), g je 0,25 s (L+R gemeinsam), Stereo.
import numpy as np, json, sys
D = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/wall-v12/analyse/dyn/'
SR = 48000; N = int(266 * SR)
def lad(n): return np.fromfile(D + n + '.f32', np.float32).reshape(-1, 2)[:N].astype(np.float64)
I = lad('inst')
for m in ['m11', 'm10']:
    M = lad(m); H = int(.25 * SR); nb = N // H
    g = np.zeros(nb)
    for k in range(nb):
        s = slice(k * H, (k + 1) * H); a = I[s]; b = M[s]
        g[k] = (a * b).sum() / max((a * a).sum(), 1e-9)
    # glaetten (Median 3) und interpolieren
    gs = np.copy(g)
    for k in range(1, nb - 1): gs[k] = np.median(g[k - 1:k + 2])
    t = (np.arange(nb) + .5) * H
    gi = np.interp(np.arange(N), t, gs)
    V = M - gi[:, None] * I
    np.save(D + 'voc_' + m + '.npy', V.astype(np.float32)); np.save(D + 'g_' + m + '.npy', gs)
    gd = 20 * np.log10(np.abs(gs) + 1e-9)
    secs = [('In', 2, 31), ('S1', 32, 63), ('R1', 64, 96), ('S2', 96, 127), ('R2', 128, 160), ('Tag', 160, 176), ('Ub', 176, 192), ('ZT', 192, 224), ('R3', 224, 256), ('Out', 256, 265)]
    print(m, 'Musik-Faktor (dB, Median je Teil):', ' '.join('%s %+.2f' % (n, np.median(gd[int(a * 4):int(b * 4)])) for n, a, b in secs))
