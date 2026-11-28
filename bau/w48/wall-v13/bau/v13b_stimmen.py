# The Wall v13b – Haupt/Doppel: v12 bitgleich, NUR zwei Stellen aus der v13-Haupt (see-Zeile, hypnotized-Zeile).
# hypnotized: "no" ~90 ms früher (Vokal von "hyp" um ganze Grundperioden gekürzt, Vokal von "no" um dieselbe Länge verlängert,
# Konsonanten bitgleich verschoben), ti/sed bleiben an ihrer v13-Lage.
import sys, json, numpy as np, soundfile as sf
from scipy.signal import butter, sosfiltfilt
W = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/'
sys.path.insert(0, W + 'wall-v12/bau'); from dsp import SR, maske
N = 266 * SR; B = W + 'wall-v13/bau/'; OUT = B + 'stimmen_v13b/'
import os; os.makedirs(OUT, exist_ok=True)
LOG = {}

# ---------- Quellen (genau wie mix_v12.py) ----------
H12 = np.load(W + 'wall/roh/ende.npy').astype(np.float64)[:N]
plan = json.load(open(W + 'wall-v12/bau/plan/plan.json'))
fen_c = [(a, b) for a, b in plan['chor_fenster']]
md = maske(plan['doppel_gate'], N, 0.03) * maske(fen_c, N, 0.1)
D12 = sf.read(W + 'wall-v12/bau/stimmen/doppel_t.wav', dtype='float64')[0][:N] * md
L13 = sf.read(B + 'stimmen/lead.wav', dtype='float64')[0][:N]
D13 = sf.read(B + 'stimmen/doppel.wav', dtype='float64')[0][:N]


# ---------- hypnotized: "no" früher ----------
def best_jump(x, lo, hi, dmin, dmax, w):
    """für jede Stelle p in [lo,hi): Ähnlichkeit x[p:p+w] ~ x[p+d:p+d+w], d in [dmin,dmax]; -> Matrix (p, d)"""
    ps = np.arange(lo, hi, 24); out = np.zeros((len(ps), dmax - dmin + 1))
    for i, p in enumerate(ps):
        a = x[p:p + w]; seg = x[p + dmin:p + dmax + w]
        c = np.correlate(seg, a, 'valid')
        e = np.convolve(seg ** 2, np.ones(w), 'valid')
        out[i] = c / np.sqrt((a ** 2).sum() * e + 1e-20)
    return ps, out


x = L13.copy(); s = lambda t: int(round(t * SR))
W_ = s(0.012)
# hyp-Vokal (stabil 114,20–114,60, ~207 Hz), no-Vokal (stabil 114,77–115,20, ~204 Hz)
ps1, c1 = best_jump(x, s(114.20), s(114.62) - s(0.096) - W_, s(0.084), s(0.096), W_)
# Insertion: Sprung zurück um d an p2 -> Ähnlichkeit x[p2-d : ] ~ x[p2 : ] <=> best_jump bei p=p2-d
ps2, c2 = best_jump(x, s(114.78), s(115.18) - s(0.096) - W_, s(0.084), s(0.096), W_)
best = (-1, None)
for j in range(c1.shape[1]):
    i1 = np.argmax(c1[:, j]); i2 = np.argmax(c2[:, j]); sc = min(c1[i1, j], c2[i2, j])
    if sc > best[0]: best = (sc, (j, i1, i2))
sc, (j, i1, i2) = best
d = s(0.084) + j; p1 = ps1[i1]; q2 = ps2[i2]; p2 = q2 + d          # q2 = p2 - d
F = s(0.010); ramp = 0.5 - 0.5 * np.cos(np.linspace(0, np.pi, F))
# y = x[:p1] ++ x[p1+d : p2] ++ x[p2-d : ...]  (gleiche Länge, alles danach bitgleich an alter Stelle)
y = x.copy()
seg = np.concatenate([x[p1 + d:p2], x[p2 - d:p2 + s(0.5)]])      # Quelle ab Ausgabe-Index p1
seg[:F] = x[p1:p1 + F] * (1 - ramp) + x[p1 + d:p1 + d + F] * ramp
k = p2 - d - p1                                                   # Ausgabe-Index der 2. Fuge relativ zu p1
seg[k:k + F] = x[p2:p2 + F] * (1 - ramp) + x[p2 - d:p2 - d + F] * ramp
y[p1:p1 + len(seg)] = seg
# nach p2 + 0.5 - d ... ist y wieder x (gleiche Quelle, gleicher Index)
assert np.allclose(y[p1 + len(seg):p1 + len(seg) + 100], x[p1 + len(seg):p1 + len(seg) + 100])
LOG['hyp_no'] = dict(kuerzung_ms=round(d / SR * 1000, 2), schnitt_hyp_s=round(p1 / SR, 4), verlaengerung_no_s=round(p2 / SR, 4),
                     korrelation=round(float(sc), 3), blende_ms=10)
L13b = y


def einsatz(v, t0, t1, schwelle=-30.0):
    h = s(0.005); a = s(t0); r = v[a:s(t1)]; n = len(r) // h
    e = 20 * np.log10(np.sqrt((r[:n * h].reshape(n, h) ** 2).mean(1)) + 1e-9)
    return round(t0 + np.argmax(e > schwelle) * 0.005, 3)


LOG['no_einsatz_s'] = dict(v12=einsatz(H12, 114.66, 114.9), v13=einsatz(L13, 114.66, 114.9), v13b=einsatz(L13b, 114.56, 114.9))
LOG['ti_einsatz_s'] = dict(v13=einsatz(L13, 115.3, 115.45), v13b=einsatz(L13b, 115.3, 115.45))

# ---------- zwei Stellen einsetzen ----------
def env(v, t0, t1, h=0.005):
    hh = s(h); r = v[s(t0):s(t1)]; n = len(r) // hh
    return 20 * np.log10(np.sqrt((r[:n * hh].reshape(n, hh) ** 2).mean(1)) + 1e-12)


# Stelle 2 beginnt in der leisesten gemeinsamen Atem-Stelle vor "Are"
e = np.maximum(env(H12, 111.78, 111.91), env(L13b, 111.78, 111.91)); t2a = 111.78 + np.argmin(e) * 0.005 + 0.0025
STELLEN = [('see', 103.30, 111.05), ('hypnotized', round(t2a, 4), 117.40)]
sos = butter(4, 19000.0, 'lowpass', fs=SR, output='sos')          # Bandbreite wie v12-Quelle (MP3, ab ~19 kHz leer)
H = H12.copy(); FB = s(0.030)
LOG['stellen'] = []
for nm, a, b in STELLEN:
    ia, ib = s(a), s(b)
    # Nulldurchgang von H12 nahe a/b (in Stille ohnehin 0)
    def nd(i):
        z = np.where(np.diff(np.signbit(H12[i - 240:i + 240])))[0]
        return i if len(z) == 0 else i - 240 + z[np.argmin(np.abs(z - 240))] + 1
    ia, ib = nd(ia), nd(ib)
    act = slice(ia, ib)
    ref = H12[act]; neu = L13b[act]
    m = (np.abs(ref) > 10 ** (-50 / 20)) | (np.abs(neu) > 10 ** (-50 / 20))
    g = np.sqrt(np.mean(ref ** 2) / np.mean(neu ** 2))
    piece = sosfiltfilt(sos, L13b[ia - 2 * FB:ib + 2 * FB])[2 * FB:-2 * FB] * g
    w = np.ones(ib - ia); r = 0.5 - 0.5 * np.cos(np.linspace(0, np.pi, FB)); w[:FB] = r; w[-FB:] = r[::-1]
    H[ia:ib] = H12[ia:ib] * (1 - w) + piece * w
    LOG['stellen'].append(dict(name=nm, von_s=round(ia / SR, 4), bis_s=round(ib / SR, 4), pegel_db=round(20 * np.log10(g), 2),
                               blende_ms=30, rand_pegel_v12_dbfs=[round(float(20 * np.log10(np.abs(H12[ia - FB:ia + FB]).max() + 1e-12)), 1),
                                                                round(float(20 * np.log10(np.abs(H12[ib - FB:ib + FB]).max() + 1e-12)), 1)]))

# ---------- Doppel ----------
# v12-Doppel ist in Strophe 2 (Maske chor_fenster 62,9–96,6 / 126,9–176 / 222,9–266) stumm. Die v13-Stücke bekommen dieselbe
# v12-Bearbeitung (Maske md) -> an beiden Stellen 0 -> Doppel v13b = v12 bitgleich.
D = D12.copy()
for nm, a, b in STELLEN:
    ia, ib = s(a), s(b); D[ia:ib] = D13[ia:ib] * md[ia:ib]
LOG['doppel_v12_an_stellen_max_dbfs'] = [round(float(20 * np.log10(np.abs(D12[s(a):s(b)]).max() + 1e-30)), 1) for _, a, b in STELLEN]
LOG['doppel_v13_roh_an_stellen_rms_dbfs'] = [round(float(20 * np.log10(np.sqrt(np.mean(D13[s(a):s(b)] ** 2)) + 1e-30)), 1) for _, a, b in STELLEN]


# ---------- Differenz-Beleg ----------
def dbmax(v): return round(float(20 * np.log10(np.abs(v).max() + 1e-30)), 1) if len(v) else None


aus = np.ones(N, bool)
for _, a, b in STELLEN: aus[max(s(a - 0.3), 0):s(b + 0.3)] = False
LOG['beleg'] = dict(
    haupt_ausserhalb_max_dbfs=dbmax((H - H12)[aus]), haupt_ausserhalb_bitgleich=bool(np.array_equal(H[aus], H12[aus])),
    doppel_max_dbfs=dbmax(D - D12), doppel_bitgleich=bool(np.array_equal(D, D12)),
    zwischenteil_192_224_haupt_bitgleich=bool(np.array_equal(H[s(192):s(224)], H12[s(192):s(224)])),
    zwischenteil_192_224_doppel_bitgleich=bool(np.array_equal(D[s(192):s(224)], D12[s(192):s(224)])),
    strophe1_30_64_haupt_bitgleich=bool(np.array_equal(H[s(30):s(64)], H12[s(30):s(64)])),
    refrains_haupt_bitgleich=bool(all(np.array_equal(H[s(a):s(b)], H12[s(a):s(b)]) for a, b in [(62, 97), (126, 177), (222, 266)])),
    geaendert_haupt_s=round(float((~np.isclose(H, H12, atol=0, rtol=0)).sum() / SR), 3),
    vgl_v13_vorhoer_haupt_ausserhalb_max_dbfs=dbmax((L13 - H12)[aus]))
sf.write(OUT + 'haupt_v13b.wav', H.astype(np.float32), SR, subtype='FLOAT')
sf.write(OUT + 'doppel_v13b.wav', D.astype(np.float32), SR, subtype='FLOAT')
# float32-Rundweg prüfen (die Dateien sind die Quelle für Mix und Projekt)
Hf = sf.read(OUT + 'haupt_v13b.wav', dtype='float64')[0]
LOG['beleg']['haupt_datei_ausserhalb_max_dbfs_gegen_v12_float32'] = dbmax((Hf - H12.astype(np.float32).astype(np.float64))[aus])
json.dump(LOG, open(OUT + 'stimmen_log.json', 'w'), indent=1, ensure_ascii=False)
print(json.dumps(LOG, indent=1, ensure_ascii=False))
