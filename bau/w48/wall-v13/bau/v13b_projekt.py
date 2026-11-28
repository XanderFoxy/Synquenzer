# The Wall v13b – Cubasis-Projekt (v8-Struktur, Original-Effekte), modus 'ganz'.
# Haupt/Doppel = v13b. Chor 1/2 = v12-Terzen (folgen der v12-Haupt-Zeit, wie im Mix), Chor 3 = v12-Gegengesang (gestimmt,
# Fenster wie mix_v12) = derselbe Gegengesang wie im v13-Vorhör-Mix.
import sys, os, json, numpy as np, soundfile as sf
W = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/'
sys.path.insert(0, W + 'wall-v12/bau'); from dsp import SR, maske, verz
sys.path.insert(0, W + 'wall-v13/bau'); import cubasis_v13 as cv
N = 266 * SR; ST = W + 'wall-v12/bau/stimmen/'; P = W + 'wall-v12/bau/plan/'; SB = W + 'wall-v13/bau/stimmen_v13b/'
plan = json.load(open(P + 'plan.json')); fen_c = [(a, b) for a, b in plan['chor_fenster']]; OYE = tuple(plan['oye'])
def lade(n): return sf.read(ST + n + '.wav', dtype='float64')[0][:N]


def zusammensetzen(pm_file, versionen, gate, fade_ms=12.0):     # = mix_v12.py
    pts = [tuple(map(float, l.split())) for l in open(pm_file)]
    K = 1000; n1 = int(266 * K) + 2; sel = np.zeros(n1)
    for k, (fr_, v) in enumerate(pts):
        a = int(fr_ / SR * K); b_ = int(pts[k + 1][0] / SR * K) if k + 1 < len(pts) else n1
        sel[a:b_] = v
    out = np.zeros(N)
    w = max(int(fade_ms), 1); win = np.hanning(w + 2)[1:-1]; win /= win.sum()
    for v, x in versionen.items():
        m = np.convolve((sel == v).astype(float), win, 'same')
        out += x * np.interp(np.arange(N) / SR, np.arange(n1) / K, m)
    return out * gate


g_ober = maske(plan['ober_gate'], N, 0.025) * maske(fen_c, N, 0.1) * (1 - maske([OYE], N, 0.03))
g_unter = maske(plan['unter_gate'], N, 0.03) * maske(fen_c, N, 0.1) * (1 - maske([OYE], N, 0.03))
OB = zusammensetzen(P + 'ober.txt', {3.0: lade('lead_p3'), 4.0: lade('lead_p4'), 5.0: lade('lead_p5')}, g_ober)
UN = verz(zusammensetzen(P + 'unter.txt', {-3.0: lade('lead_m3'), -4.0: lade('lead_m4')}, g_unter), 9.0)
G = lade('gegen_t') * maske([(a, b) for a, b in plan['gegen_fenster']], N, 0.06)
X = {'VOX Haupt': cv.lade_mono(SB + 'haupt_v13b.wav'), 'VOX Doppel': cv.lade_mono(SB + 'doppel_v13b.wav'),
     'VOX Chor 1': OB, 'VOX Chor 2': UN, 'VOX Chor 3': G}
info = {}
for k, x in X.items():
    s = np.max(np.abs(x)); f = 0.99 / s if s > 0.99 else 1.0
    X[k] = x * f; info[k] = dict(spitze_dbfs=round(float(20 * np.log10(s + 1e-12)), 2), faktor_db=round(float(20 * np.log10(f)), 2))
ZIP = W + 'wall-v13/out/v13b/The-Wall-v13b-Projekt.zip'
txt = ('The Wall v13b – Cubasis-Projekt\n\n'
       '1. ZIP in der Dateien-App antippen (entpackt sich).\n'
       '2. In Cubasis: Projekte → Importieren → Ordner „The-Wall-v13b“ bzw. The-Wall-v13b.cbp wählen.\n\n'
       'Effekte, Fader, Pan, Sends und Master wie v8 (Original-Kette). Neu sind nur die Gesangs-Clips:\n'
       'Haupt/Doppel = v12, nur die see-Stelle (103,3–111,05 s) und die hypnotized-Stelle (111,9–117,4 s) aus v13,\n'
       'dort „no“ ~90 ms früher. Chor 1/2 = v12-Terzen, Chor 3 = Gegengesang wie im v13-Vorhör. Audio 16 bit / 48 kHz mono.\n')
b = cv.baue_projekt(X, ZIP, name='The-Wall-v13b', modus='ganz', bits=16, leere_spuren='behalten', liesmich=txt)
# Rückweg: Clips wieder auslesen und gegen die Quelle prüfen (16 bit -> Abweichung ≈ Quantisierung)
rw = {}
for k in X:
    y, _ = cv.spur_aus_projekt(ZIP, k)
    d = y[:N] - X[k]; rw[k] = round(float(20 * np.log10(np.abs(d).max() + 1e-30)), 1)
out = dict(zip=ZIP, zip_mb=round(os.path.getsize(ZIP) / 1e6, 1), clips={k: v['clips'] for k, v in b['spuren'].items()},
           pegel=info, rueckweg_max_abw_dbfs=rw)
json.dump(out, open(SB + 'projekt_log.json', 'w'), indent=1, ensure_ascii=False)
print(json.dumps(out, indent=1, ensure_ascii=False))
