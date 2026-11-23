# Unabhängige Prüfung v12: Pegel der Stimmen im Refrain, Sprechstelle v10/v11/v12
import numpy as np, soundfile as sf, json, subprocess
import pyloudnorm as pyln
W = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/wall-v12/'
ST = W + 'bau/stems_v12/'; D = W + 'analyse/dyn/'; SR = 48000; N = 266 * SR
OUT = {}
st = {}
for k in ['lead', 'gegengesang', 'chor', 'doppel', 'hall', 'gesang_summe']:
    x, sr = sf.read(ST + k + '.wav', dtype='float64'); assert sr == SR
    if x.ndim == 1: x = np.stack([x, x], 1)
    st[k] = x[:N]
OUT['stem_len_s'] = {k: len(v) / SR for k, v in st.items()}
summe = st['lead'] + st['gegengesang'] + st['chor'] + st['doppel'] + st['hall']
OUT['summe_vs_gesang_summe_db'] = round(10 * np.log10(((summe - st['gesang_summe']) ** 2).sum() / (st['gesang_summe'] ** 2).sum()), 1)
m = pyln.Meter(SR)
R = [(64, 96), (128, 160), (224, 256)]
def cat(x, rs): return np.concatenate([x[int(a * SR):int(b * SR)] for a, b in rs])
lu = {k: m.integrated_loudness(cat(v, R)) for k, v in st.items()}
OUT['refrain_lufs'] = {k: round(v, 1) for k, v in lu.items()}
OUT['refrain_rel_lead_LU'] = {k: round(v - lu['lead'], 1) for k, v in lu.items()}
cg = cat(st['chor'] + st['gegengesang'], R); cgd = cat(st['chor'] + st['gegengesang'] + st['doppel'], R)
OUT['refrain_chor+gegen_rel_lead_LU'] = round(m.integrated_loudness(cg) - lu['lead'], 1)
OUT['refrain_chor+gegen+doppel_rel_lead_LU'] = round(m.integrated_loudness(cgd) - lu['lead'], 1)
# RMS nur dort, wo der Lead singt (50 ms, Lead > -35 dBFS)
def e50(x):
    h = SR // 20; n = len(x) // h
    return (x[:n * h] ** 2).mean(1).reshape(n, h).mean(1)
el = e50(st['lead']); t = np.arange(len(el)) * .05
selR = np.zeros(len(el), bool)
for a, b in R: selR |= (t >= a) & (t < b)
act = selR & (10 * np.log10(el + 1e-20) > -35)
OUT['refrain_rms_rel_lead_wenn_lead_singt_db'] = {k: round(10 * np.log10(e50(st[k])[act].mean() / el[act].mean()), 1) for k in ['gegengesang', 'chor', 'doppel', 'hall']}
OUT['refrain_rms_rel_lead_wenn_lead_singt_db']['chor+gegen'] = round(10 * np.log10(e50(st['chor'] + st['gegengesang'])[act].mean() / el[act].mean()), 1)
# Strophen: sind Chor/Doppel/Gegen dort still?
S = [(32, 63), (96, 127)]
OUT['strophe_rms_dbfs'] = {k: round(10 * np.log10((cat(v, S) ** 2).mean() + 1e-20), 1) for k, v in st.items()}
# Sprechstelle 217,8–221,6: Begleitstimmen
sp = slice(int(217.8 * SR), int(221.6 * SR))
OUT['sprechstelle_rms_dbfs'] = {k: round(10 * np.log10((v[sp] ** 2).mean() + 1e-20), 1) for k, v in st.items()}

# Gesangsbus aus Master schätzen (wie analyse/skripte/d1_trennen.py) für v12
def dec(f):
    b = subprocess.run(['ffmpeg', '-v', 'error', '-i', f, '-f', 'f32le', '-ac', '2', '-ar', '48000', '-'], capture_output=True).stdout
    return np.frombuffer(b, dtype=np.float32).reshape(-1, 2).astype(np.float64)[:N]
I = np.fromfile(D + 'inst.f32', np.float32).reshape(-1, 2)[:N].astype(np.float64)
M12 = dec(W + 'repo/the-wall/projekt12/The-Wall_A_v12.mp3')
H = int(.25 * SR); nb = N // H; g = np.zeros(nb)
for k in range(nb):
    s = slice(k * H, (k + 1) * H); a = I[s]; b = M12[s]; g[k] = (a * b).sum() / max((a * a).sum(), 1e-9)
gs = g.copy()
for k in range(1, nb - 1): gs[k] = np.median(g[k - 1:k + 2])
gi = np.interp(np.arange(N), (np.arange(nb) + .5) * H, gs)
V12 = M12 - gi[:, None] * I
np.save(W + 'pruef/voc_m12.npy', V12.astype(np.float32))
V11 = np.load(D + 'voc_m11.npy').astype(np.float64)[:N]; V10 = np.load(D + 'voc_m10.npy').astype(np.float64)[:N]
RO = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/wall/roh/'
H7 = np.load(RO + 'haupt-v7.npy').astype(np.float64)[:N]


def mono(x): return x.mean(1) if x.ndim == 2 else x


def kamm(x, a=219.80, b=221.45, mid=56.0):
    """Energie auf den Harmonischen 1–8 der 'eyes'-Tonhöhe (±20 Cent) relativ zur Gesamtenergie 100–2000 Hz; bestes MIDI in mid±0,5"""
    s = mono(x)[int(a * SR):int(b * SR)]
    nf = 8192; hop = 2048; win = np.hanning(nf)
    fr = [np.abs(np.fft.rfft(win * s[i:i + nf])) ** 2 for i in range(0, len(s) - nf, hop)]
    P = np.mean(fr, 0); f = np.fft.rfftfreq(nf, 1 / SR)
    tot = P[(f > 100) & (f < 2000)].sum()
    best = -99
    for mm in np.arange(mid - .5, mid + .51, .1):
        f0 = 440 * 2 ** ((mm - 69) / 12); msk = np.zeros_like(f, bool)
        for h in range(1, 9):
            fh = h * f0
            if fh > 2000: break
            msk |= (f > fh * 2 ** (-.2 / 12)) & (f < fh * 2 ** (.2 / 12))
        best = max(best, 10 * np.log10(P[msk].sum() / tot))
    return round(best, 1)


def rms(x, a, b): return round(10 * np.log10((mono(x)[int(a * SR):int(b * SR)] ** 2).mean() + 1e-20), 1)
OUT['sprechstelle'] = {}
for name, x in [('haupt_roh_v7', H7), ('v10_bus', V10), ('v11_bus', V11), ('v12_bus', V12), ('v12_lead_stem', st['lead']), ('v12_gesang_summe', st['gesang_summe'])]:
    OUT['sprechstelle'][name] = dict(open_your_217_9_219_2_dbfs=rms(x, 217.9, 219.2), sprache_219_8_221_3_dbfs=rms(x, 219.8, 221.3),
                                     wach_auf_215_4_216_dbfs=rms(x, 215.4, 216.0), kamm_eyes_db=kamm(x),
                                     kamm_eyes_vorher_db=kamm(x, 218.0, 219.2))
# Vergleichsprobe gleiche Methode mit Refrain-'eyes' (R1 89,8-91,45 = Original)
OUT['kamm_referenz_R1_eyes_v12_bus'] = kamm(V12, 91.80 - 2, 93.45 - 2)
json.dump(OUT, open(W + 'pruef/p2.json', 'w'), indent=1)
print(json.dumps(OUT, indent=1))
