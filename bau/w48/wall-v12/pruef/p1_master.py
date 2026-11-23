# Unabhängige Prüfung v12: Lautheit, True Peak, Länge, Versatz, Klicks, Lücken, Vergleichsdatei
import numpy as np, subprocess, json, soundfile as sf
import pyloudnorm as pyln
from scipy.signal import resample_poly, correlate
W = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/wall-v12/'
P = W + 'repo/the-wall/'
OUT = {}


def dec(f, sr=48000):
    b = subprocess.run(['ffmpeg', '-v', 'error', '-i', f, '-f', 'f32le', '-ac', '2', '-ar', str(sr), '-'], capture_output=True).stdout
    return np.frombuffer(b, dtype=np.float32).reshape(-1, 2).astype(np.float64)


def tp(x):
    return 20 * np.log10(max(np.abs(resample_poly(x[:, c], 4, 1)).max() for c in range(2)))


def blk_db(x, sr, ms):
    h = int(sr * ms / 1000); n = len(x) // h
    r = np.sqrt((x[:n * h] ** 2).mean(axis=1).reshape(n, h).mean(axis=1))
    return 20 * np.log10(r + 1e-12)


def ffm_ebur(f):
    r = subprocess.run(['ffmpeg', '-nostats', '-i', f, '-af', 'ebur128=peak=true', '-f', 'null', '-'], capture_output=True, text=True).stderr
    t = r[r.rfind('Summary'):]
    import re
    I = float(re.search(r'I:\s+(-?[\d.]+) LUFS', t).group(1)); TP = float(re.search(r'Peak:\s+(-?[\d.]+) dBFS', t).group(1))
    return I, TP


v11 = dec(P + 'projekt11/The-Wall_A_v11.mp3')
v12 = dec(P + 'projekt12/The-Wall_A_v12.mp3')
w12, sr44 = sf.read(P + 'projekt12/The-Wall_A_v12.wav', dtype='float64')
vg = dec(P + 'projekt12/VERGLEICH-v11-v12.mp3')
m = pyln.Meter(48000)
for name, x, sr in [('v11_mp3', v11, 48000), ('v12_mp3', v12, 48000), ('v12_wav', w12, sr44), ('vergleich', vg, 48000)]:
    OUT[name] = dict(lufs=round(pyln.Meter(sr).integrated_loudness(x), 2), tp=round(tp(x), 2), len_s=round(len(x) / sr, 4),
                     plr=round(tp(x) - pyln.Meter(sr).integrated_loudness(x), 1))
for name, f in [('v12_mp3', 'projekt12/The-Wall_A_v12.mp3'), ('v12_wav', 'projekt12/The-Wall_A_v12.wav'), ('v11_mp3', 'projekt11/The-Wall_A_v11.mp3')]:
    OUT[name]['ffmpeg_I_TP'] = ffm_ebur(P + f)
print(json.dumps(OUT, indent=1), flush=True)

# Versatz v11/v12 (Intro 2–30 s identische Musik) und WAV vs MP3
def lag(a, b, lo, hi, sr=48000, maxl=4800):
    A = a[int(lo * sr):int(hi * sr)].mean(1); B = b[int(lo * sr):int(hi * sr)].mean(1)
    c = correlate(A, B, mode='full', method='fft'); mid = len(B) - 1
    seg = c[mid - maxl:mid + maxl + 1]; k = int(np.argmax(seg)) - maxl
    return k, float(seg.max() / np.sqrt((A ** 2).sum() * (B ** 2).sum()))
OUT['versatz_v11_v12_intro'] = lag(v11, v12, 2, 30)
OUT['versatz_v11_v12_outro'] = lag(v11, v12, 257, 264)
w48 = resample_poly(w12, 160, 147, axis=0)
OUT['versatz_wav_mp3'] = lag(v12, w48, 60, 100)
d = blk_db(v12[:len(w48)], 48000, 400) - blk_db(w48[:len(v12)], 48000, 400)
OUT['wav_vs_mp3_pegel_db_median_max'] = (round(float(np.median(d)), 2), round(float(np.abs(d[d > -60]).max()), 2))

# Klicks: 2. Ableitung in 1-ms-Blöcken gegen Median der Umgebung (±25 ms), > 18 dB = Kandidat; Vergleich v11
def klicks(x, sr=48000):
    s = x.mean(1); d2 = np.diff(s, 2)
    h = int(sr / 1000); n = len(d2) // h
    e = 10 * np.log10((d2[:n * h] ** 2).reshape(n, h).mean(1) + 1e-20)
    from scipy.ndimage import median_filter
    med = median_filter(e, size=51, mode='nearest')
    lev = blk_db(x, sr, 1)[:n]
    k = np.where((e - med > 18) & (lev > -50))[0]
    # zu Ereignissen zusammenfassen
    ev = []
    for i in k:
        if not ev or i - ev[-1][1] > 20: ev.append([i, i])
        else: ev[-1][1] = i
    return [round(a / 1000, 3) for a, b in ev]
k11 = klicks(v11); k12 = klicks(v12)
OUT['klicks_v11_n'] = len(k11); OUT['klicks_v12_n'] = len(k12)
OUT['klicks_v12_nur_neu'] = [t for t in k12 if not any(abs(t - u) < 0.03 for u in k11)][:40]
OUT['klicks_v11_alle'] = k11[:40]

# Sprünge: Sample-Differenz > 0.5 (Diskontinuität)
def spruenge(x):
    dd = np.abs(np.diff(x, axis=0)).max(1)
    return [round(i / 48000, 3) for i in np.where(dd > 0.5)[0][:30]]
OUT['spruenge_v11'] = spruenge(v11); OUT['spruenge_v12'] = spruenge(v12); OUT['spruenge_wav'] = [round(i / sr44, 3) for i in np.where(np.abs(np.diff(w12, axis=0)).max(1) > 0.5)[0][:30]]

# Stille-Lücken: 10-ms-RMS < -60 dBFS zwischen 0,5 und 265 s
def luecken(x, sr=48000):
    e = blk_db(x, sr, 10); t = np.arange(len(e)) * 0.01
    sel = (e < -60) & (t > 0.5) & (t < 265)
    ev = []
    for i in np.where(sel)[0]:
        if not ev or i - ev[-1][1] > 1: ev.append([i, i])
        else: ev[-1][1] = i
    return [(round(a * .01, 2), round((b + 1) * .01, 2)) for a, b in ev]
OUT['luecken_v11'] = luecken(v11); OUT['luecken_v12'] = luecken(v12)

# Einbrüche: 50-ms-Pegel v12 mehr als 10 dB unter v11 (gleiche Musik), nur wo v11 > -40 dBFS
a = blk_db(v11, 48000, 50); b = blk_db(v12, 48000, 50); n = min(len(a), len(b))
dd = b[:n] - a[:n]; t = np.arange(n) * 0.05
idx = np.where((dd < -10) & (a[:n] > -40))[0]
OUT['einbrueche_v12_unter_v11_10dB'] = [(round(t[i], 2), round(dd[i], 1)) for i in idx[:30]]
idx = np.where((dd > 10) & (b[:n] > -40))[0]
OUT['spitzen_v12_ueber_v11_10dB'] = [(round(t[i], 2), round(dd[i], 1)) for i in idx[:30]]

# Vergleichsdatei: Blöcke à 16 s; Pieps zählen (1200 Hz in den ersten 0,3 s), Inhalt gegen 0,901·v11/v12
n0 = min(len(vg), len(v11), len(v12)); blk = 16 * 48000
VG = []
for k in range(n0 // blk + 1):
    a0 = k * blk; e0 = min(a0 + blk, n0)
    if e0 - a0 < 48000: break
    s = vg[a0:a0 + int(0.35 * 48000)].mean(1)
    # 1200-Hz-Hüllkurve
    from scipy.signal import butter, sosfiltfilt
    sos = butter(4, [1150, 1250], 'bandpass', fs=48000, output='sos')
    env = np.abs(sosfiltfilt(sos, s)); hb = 480
    en = env[:len(env) // hb * hb].reshape(-1, hb).max(1)
    thr = en.max() * 0.5; on = en > thr
    npi = int(np.sum(np.diff(on.astype(int)) == 1) + (1 if on[0] else 0))
    r = slice(a0 + int(0.4 * 48000), e0)
    def resid(ref):
        return 10 * np.log10(((vg[r] - 0.901 * ref[r]) ** 2).mean() / ((vg[r]) ** 2).mean())
    lu = pyln.Meter(48000).integrated_loudness(vg[a0 + int(.4 * 48000):e0]) if e0 - a0 > 5 * 48000 else None
    lu11 = pyln.Meter(48000).integrated_loudness(v11[a0 + int(.4 * 48000):e0]) if e0 - a0 > 5 * 48000 else None
    lu12 = pyln.Meter(48000).integrated_loudness(v12[a0 + int(.4 * 48000):e0]) if e0 - a0 > 5 * 48000 else None
    VG.append(dict(t=k * 16, pieps=npi, rest_v11_db=round(resid(v11), 1), rest_v12_db=round(resid(v12), 1),
                   lufs=None if lu is None else round(lu, 2), lufs_v11=None if lu11 is None else round(lu11, 2), lufs_v12=None if lu12 is None else round(lu12, 2)))
OUT['vergleich_bloecke'] = VG
json.dump(OUT, open(W + 'pruef/p1.json', 'w'), indent=1)
print(json.dumps({k: v for k, v in OUT.items() if k not in ('v11_mp3', 'v12_mp3', 'v12_wav', 'vergleich')}, indent=0))
