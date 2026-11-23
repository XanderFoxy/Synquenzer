# Messwerte v12 gegen v11 (gleiche Verfahren wie analyse/DYNAMIK.md und CHOR.md)
import numpy as np, soundfile as sf, subprocess, json, sys
from scipy.signal import butter, sosfiltfilt
from scipy.ndimage import median_filter
sys.path.insert(0, '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/wall-v12/bau')
from dsp import rms_db, true_peak
import pyloudnorm as pyln
S = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/'
W = S + 'wall-v12/'; B = W + 'bau/'; R = W + 'repo/the-wall/'
SR = 48000; N = 266 * SR
OUT = {}


def dec(p):
    b = subprocess.run(['ffmpeg', '-v', 'error', '-i', p, '-f', 'f32le', '-ac', '2', '-ar', '48000', '-'], capture_output=True).stdout
    x = np.frombuffer(b, dtype=np.float32).reshape(-1, 2).astype(np.float64)[:N]
    return np.concatenate([x, np.zeros((N - len(x), 2))]) if len(x) < N else x


I = dec(R + 'spuren/The-Wall_v5_Instrumental-Master.mp3')
M11 = dec(R + 'projekt11/The-Wall_A_v11.mp3'); M12 = dec(R + 'projekt12/The-Wall_A_v12.mp3')


def bus(M):
    """wie d1_trennen.py: Master − g(t)·Instrumental, g je 0,25 s."""
    H = int(.25 * SR); nb = N // H; g = np.zeros(nb)
    for k in range(nb):
        s = slice(k * H, (k + 1) * H); a = I[s]; b_ = M[s]; g[k] = (a * b_).sum() / max((a * a).sum(), 1e-9)
    gs = g.copy()
    for k in range(1, nb - 1): gs[k] = np.median(g[k - 1:k + 2])
    gi = np.interp(np.arange(N), (np.arange(nb) + .5) * H, gs)
    return M - gi[:, None] * I, gs


V11, g11 = bus(M11); V12, g12 = bus(M12)
secs = [('S1', 32, 63), ('R1', 64, 96), ('S2', 96, 127), ('R2', 128, 160), ('ZT', 192, 224), ('R3', 224, 256)]
gd = lambda g, a, b_: float(np.median(20 * np.log10(np.abs(g[int(a * 4):int(b_ * 4)]) + 1e-9)))
OUT['musik_faktor_db'] = {v: {n: round(gd(g, a, b_), 2) for n, a, b_ in secs} for v, g in (('v11', g11), ('v12', g12))}

# --- Dynamik (d2-Verfahren) ---
L = json.load(open(S + 'wall/werkzeug/lied.json'))
sil = [(s['a'], s['b']) for s in L['silben']]
ende = np.load(S + 'wall/roh/ende.npy').astype(np.float64)[:N]
def bp(x, lo, hi): return sosfiltfilt(butter(4, [lo, hi], 'band', fs=SR, output='sos'), x)
def rms50(x, hop=.05, win=.05):
    h = int(hop * SR); w = int(win * SR); n = len(x) // h
    c = np.concatenate([[0], np.cumsum(x * x)]); i = np.arange(n) * h
    b_ = np.minimum(i + w, len(x)); return 10 * np.log10((c[b_] - c[i]) / w + 1e-12)
ref = rms50(bp(ende, 200, 6000))
dyn = {}
for nm, V in (('v11', V11), ('v12', V12)):
    xb = bp(V.mean(1), 200, 6000); r = rms50(xb); row = {}
    for k, a, b_ in secs:
        sl = slice(int(a * 20), int(b_ * 20)); act = ref[sl] > np.percentile(ref[sl], 95) - 25
        rr = r[sl][act]; spread = np.percentile(rr, 95) - np.percentile(rr, 10)
        sy = np.array([r[int(s0 * 20):int(s1 * 20) + 1].max() for s0, s1 in sil if a <= s0 < b_ and s1 - s0 > .08])
        row[k] = dict(spreizung50=round(float(spread), 1), silben_p90_p10=round(float(np.percentile(sy, 90) - np.percentile(sy, 10)), 1))
    dyn[nm] = row
OUT['dynamik_gesangsbus'] = dyn
for nm in dyn:
    OUT['dynamik_gesangsbus'][nm]['mittel'] = dict(spreizung50=round(float(np.mean([v['spreizung50'] for k, v in dyn[nm].items() if k != 'mittel'])), 1),
                                                silben_p90_p10=round(float(np.mean([v['silben_p90_p10'] for k, v in dyn[nm].items() if k != 'mittel'])), 1))

# --- Breite (Side/Mid des Gesangsbusses) ---
def sm(V, rng):
    s = np.concatenate([V[int(a * SR):int(b_ * SR)] for a, b_ in rng]); m = (s[:, 0] + s[:, 1]) / 2; d = (s[:, 0] - s[:, 1]) / 2
    m = bp(m, 200, 8000); d = bp(d, 200, 8000)
    return round(float(10 * np.log10(np.mean(d ** 2) / np.mean(m ** 2))), 1)
RF = [(64, 96), (128, 160), (224, 256)]; ST_ = [(32, 63), (96, 127)]
OUT['side_mid_db'] = {v: dict(refrain=sm(V, RF), strophe=sm(V, ST_)) for v, V in (('v11', V11), ('v12', V12))}

# --- Stems v12: Pegel der Gruppen gegen den Lead, Refrains ---
stem = {k: sf.read(B + 'stems_v12/%s.wav' % k)[0] for k in ('lead', 'gegengesang', 'chor', 'doppel', 'hall')}
def e(x, rng): return np.mean([np.mean(x[int(a * SR):int(b_ * SR)] ** 2) for a, b_ in rng])
el = e(stem['lead'], RF)
OUT['gruppen_gegen_lead_db_refrain'] = {k: round(float(10 * np.log10(e(stem[k], RF) / el)), 1) for k in ('gegengesang', 'chor', 'doppel', 'hall')}
OUT['gruppen_gegen_lead_db_refrain']['begleitung_ohne_doppel'] = round(float(10 * np.log10((e(stem['gegengesang'], RF) + e(stem['chor'], RF)) / el)), 1)

# --- Sprechstelle 219,85–221,4: was liegt außer der Sprache noch da? ---
a, b_ = int(219.85 * SR), int(221.4 * SR)
def lv(x): return round(float(10 * np.log10(np.mean(x[a:b_] ** 2) + 1e-20)), 1)
OUT['sprechstelle_dbfs'] = {k: lv(stem[k]) for k in stem}
# Kammfilter auf „eyes“ (As, MIDI 56) im v12-Gesangsbus, wie OYE.md
def kamm(x, f0=207.65):
    seg = x[a:b_]; n = len(seg); F = np.abs(np.fft.rfft(seg * np.hanning(n))) ** 2; f = np.fft.rfftfreq(n, 1 / SR)
    on = sum(F[(f > f0 * h * 2 ** (-.3 / 12)) & (f < f0 * h * 2 ** (.3 / 12))].sum() for h in range(1, 8))
    return round(float(10 * np.log10(on / F.sum())), 1)
OUT['sprechstelle_eyes_kamm_db_rel'] = dict(v11=kamm(V11.mean(1)), v12=kamm(V12.mean(1)), v12_lead_stem=kamm(stem['lead'].mean(1)))
# Zwischen „Wach auf“ und Sprache (217,9–219,7): Rest
a2, b2 = int(217.9 * SR), int(219.7 * SR)
OUT['luecke_217_9_219_7_dbfs'] = {k: round(float(10 * np.log10(np.mean(stem[k][a2:b2] ** 2) + 1e-20)), 1) for k in stem}

# --- Knackser: HF-Spitzen > 20 dB über dem lokalen Median (1-ms-Raster), Stems vs. Quellen ---
def klicks(x):
    x = x.mean(1) if x.ndim > 1 else x
    h = sosfiltfilt(butter(4, 6000, 'highpass', fs=SR, output='sos'), x)
    r = rms50(h, .001, .001); med = median_filter(r, 41)
    idx = np.where((r - med > 20) & (r > -55))[0]
    t = [];
    for i in idx:
        if not t or i * .001 - t[-1] > .05: t.append(i * .001)
    return t
src_g = sf.read(R + 'projekt7/Gegengesang-eigen-7.wav')[0][:N]
OUT['knackser'] = {k: len(klicks(v)) for k, v in dict(gegengesang_quelle=src_g, lead_quelle=ende, gegengesang_v12=stem['gegengesang'], chor_v12=stem['chor'], doppel_v12=stem['doppel']).items()}
OUT['knackser_zeiten_chor_gegen'] = dict(chor=[round(t, 2) for t in klicks(stem['chor'])][:20], gegen=[round(t, 2) for t in klicks(stem['gegengesang'])][:20])

# --- Lautheit ---
m = pyln.Meter(SR)
OUT['master'] = {v: dict(lufs=round(m.integrated_loudness(x), 2), tp=round(true_peak(x), 2)) for v, x in (('v11', M11), ('v12', M12))}
for v in OUT['master']: OUT['master'][v]['plr'] = round(OUT['master'][v]['tp'] - OUT['master'][v]['lufs'], 1)
json.dump(OUT, open(B + 'messung_v12.json', 'w'), indent=1, ensure_ascii=False)
print(json.dumps(OUT, indent=1, ensure_ascii=False))
