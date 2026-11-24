# The Wall v13 – Haupt- und Doppelstimme neu getimt (Bau-Skript).
# Quellen: Haupt = projekt7/Haupt-3-trocken-v7.wav (24 bit, trocken, v6-gestimmt), Doppel = wall-v12/bau/stimmen/doppel_t.wav
#          (v7-Doppel 24 bit, in v12 auf die Haupt gestimmt). Keine 128-kbit-MP3.
# Anker: t2_anker.py (Hüllkurven-Ausrichtung E5-trocken -> v7), Ziele: analyse/zielkarte.json (+ Änderungen in t_plan.py H_ZIEL).
# Warp: t_warp.py (nur Original-Abtastwerte; Dehnen/Stauchen nur durch Perioden-Wiederholung/-Auslassung in Vokalen, in Pausen und
#       Atem; Anlaut + 25 ms Anschlag starr/bitgleich verschoben; Blenden 5–16 ms an steigenden Nulldurchgängen).
import sys, os, json, subprocess
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from tgemein import *
from t_plan import *
from t_lauf import plane
from t_warp import rendern, zeitkarte, quelle_zu_ziel
from zk_kern import nah, staerkster

LOG = {}
H7 = lade_wav(QUELLE['H_v7']); DT = lade_wav(QUELLE['D_t']); O = lade_npy('original')
mkH = dict(np.load(TC + 'mk_H_v7.npz')); mkD = dict(np.load(TC + 'mk_D_t.npz'))

# ---------------- Haupt ----------------
H = haupt_anker()
for a in H: anlaut(mkH, a)
B = sprech_bloecke(H7, O)
PH, posH = plane(H7, mkH, starr_liste(H, B))
lead = rendern(H7, PH.stuecke, N)

# ---------------- Doppel ----------------
C = json.load(open(TC + 'doppel_C.json'))
D, tabD = doppel_anker_abstimmung(H, C, mkD)
PD, posD = plane(DT, mkD, starr_liste(D, []))
doppel = rendern(DT, PD.stuecke, N)


# ---------------- Nachbearbeitung Haupt (wie v10/v11) ----------------
def glatt_db(g_db, ms):
    k = max(1, int(ms * SR / 1000)); w = np.ones(k) / k
    return np.convolve(g_db, w, 'same')


def kurve(punkte, n):
    """stückweise konstante dB-Kurve aus [(t0, t1, db)]."""
    g = np.zeros(n)
    for t0, t1, d in punkte: g[int(t0 * SR):int(t1 * SR)] = d
    return g


# 1) „Open your eyes“-Rest im Zwischenteil stumm (wie v11/ende: 217,90–219,78 still)
m = np.ones(N); a, b = int(217.90 * SR), int(219.78 * SR); f = int(0.012 * SR)
m[a:b] = 0; m[a - f:a] = np.linspace(1, 0, f); m[b:b + f] = np.linspace(0, 1, f)
lead *= m

# 2) Silben-Pegel angleichen (±6 dB, halbe Abweichung zum Median des Teils), Silbe = Anlaut bis nächster Anlaut
from zk_gemein import bp
band = bp(lead, 120, 4000)
seg = []
Hs = sorted(H, key=lambda a: a['tgt_peak'])
for i, a in enumerate(Hs):
    t0 = a['tgt_peak'] - (a['src_peak'] - a['src_kons'])
    t1 = min(a['tgt_peak'] + 0.6, (Hs[i + 1]['tgt_peak'] - (Hs[i + 1]['src_peak'] - Hs[i + 1]['src_kons'])) if i + 1 < len(Hs) else a['tgt_peak'] + 0.6)
    s = band[int(a['tgt_peak'] * SR):int(min(t1, a['tgt_peak'] + 0.25) * SR)]
    seg.append([t0, t1, 10 * np.log10(np.mean(s * s) + 1e-14), a['teil']])
med = {}
for t in set(s[3] for s in seg): med[t] = np.median([s[2] for s in seg if s[3] == t])
pk = [(s[0], s[1], float(np.clip(-0.5 * (s[2] - med[s[3]]), -6, 6))) for s in seg]
g_sil = glatt_db(kurve(pk, N), 30)
lead *= undb(g_sil)
LOG['silben_pegel'] = dict(korrektur_db_p5_p95=[round(float(np.percentile([p[2] for p in pk], q)), 2) for q in (5, 95)],
                           max_abs=round(float(max(abs(p[2]) for p in pk)), 2))

# 3) Rauschen in Pausen leiser (Expander: unter −55 dBFS bis −10 dB)
lv = rms_frames(lead, 480, 480)
gexp = -np.clip(-55.0 - lv, 0, 10)
g_e = glatt_db(np.repeat(gexp, 480)[:N] if len(gexp) * 480 >= N else np.concatenate([np.repeat(gexp, 480), np.zeros(N - len(gexp) * 480)]), 20)
lead *= undb(g_e)

# 4) Spitzen weich begrenzen vor dem Kompressor (Spitze > aktiver Pegel + 14 dB), Attack 1 ms, Release 60 ms
akt = rms_frames(lead, 480, 480) > -40
akt_rms = 10 * np.log10(np.mean(np.repeat(rms_frames(lead, 480, 480)[akt], 1) * 0 + 1e-30) + 1e-30)
rms_akt = 10 * np.log10(np.mean([10 ** (v / 10) for v in rms_frames(lead, 480, 480)[akt]]))
thr = rms_akt + 14.0
pk1 = np.abs(lead[:len(lead) // 48 * 48]).reshape(-1, 48).max(1)
over = np.maximum(0, 20 * np.log10(pk1 + 1e-12) - thr)
from scipy.ndimage import maximum_filter1d
over = maximum_filter1d(over, 3)
from scipy.signal import lfilter
rel = np.exp(-1 / 60.0)
gr = over.copy()
for i in range(1, len(gr)): gr[i] = max(over[i], gr[i - 1] * rel)
grs = np.repeat(gr, 48); grs = np.concatenate([grs, np.zeros(N - len(grs))])
lead *= undb(-grs)
LOG['spitzen'] = dict(schwelle_dbfs=round(float(thr), 1), anteil_gr_ueber_1db=round(float(np.mean(gr[akt.repeat(10)[:len(gr)]] > 1) * 100), 2) if True else None,
                      max_gr_db=round(float(gr.max()), 1))

schreibe(ST13 + 'lead.wav', lead)
schreibe(ST13 + 'doppel.wav', doppel)

# ---------------- Messung ----------------
kmH = zeitkarte(PH.stuecke); kmD = zeitkarte(PD.stuecke)
ZKH = {s['id']: s for s in ZK['silben'] if s['stimme'] == 'haupt'}
rows = []
for a in H:
    z = ZKH[a['id']]
    t_karte = quelle_zu_ziel(kmH, [int(round(a['src_peak'] * SR))])[0] / SR
    if a['akzent']:
        r = staerkster(lead, a['tgt_peak'] - 0.06, a['tgt_peak'] + 0.06) or nah(lead, a['tgt_peak'], half=0.06)
    else:
        r = nah(lead, a['tgt_peak'], half=0.06)
    rows.append(dict(id=a['id'], text=a['text'], teil=a['teil'], ziel_zk=z['ziel_t'], ziel=a['tgt_peak'], v12=z['t_v12'], orig=z['t_orig'],
                     v13_karte=round(float(t_karte), 4), v13_mess=r['spitze_t'],
                     abw_v12_ms=round((z['t_v12'] - z['ziel_t']) * 1000) if z['t_v12'] is not None else None,
                     abw_v13_karte_ms=round((t_karte - z['ziel_t']) * 1000, 1), abw_v13_mess_ms=round((r['spitze_t'] - z['ziel_t']) * 1000, 1),
                     anlaut=a['anlaut_art']))


def stat(v):
    v = np.abs(np.array([x for x in v if x is not None], float))
    return dict(n=len(v), median=round(float(np.median(v)), 1), p95=round(float(np.percentile(v, 95)), 1), max=round(float(v.max()), 1))


LOG['haupt_abw_zielkarte'] = dict(v12=stat([r['abw_v12_ms'] for r in rows]), v13_karte=stat([r['abw_v13_karte_ms'] for r in rows]),
                                  v13_mess=stat([r['abw_v13_mess_ms'] for r in rows]))
fakH = [f for l in PH.log if 'name' in l for f in l.get('faktoren', [])]
fakD = [f for l in PD.log if 'name' in l for f in l.get('faktoren', [])]
LOG['dehnfaktoren'] = {nm: dict(n=len(f), min=round(min(f), 3), max=round(max(f), 3), p5=round(float(np.percentile(f, 5)), 3), median=round(float(np.median(f)), 3),
                               p95=round(float(np.percentile(f, 95)), 3), hist=np.histogram(f, bins=[0.75, 0.8, 0.85, 0.9, 0.95, 1.0, 1.05, 1.1, 1.15, 1.2, 1.25, 1.3])[0].tolist())
                       for nm, f in (('haupt', fakH), ('doppel', fakD))}
LOG['spleisse'] = {nm: dict(n=len(P.spleisse), korr_median=round(float(np.median([s['korr'] for s in P.spleisse])), 3),
                            korr_min=round(float(min(s['korr'] for s in P.spleisse)), 3)) for nm, P in (('haupt', PH), ('doppel', PD))}
LOG['ungedeckt'] = {nm: [dict(name=l['name'], soll_ms=round(l['delta_ms'], 1), rest_ms=round(l['rest_ms'], 1)) for l in P.log if 'name' in l and abs(l['rest_ms']) > 5]
                    for nm, P in (('haupt', PH), ('doppel', PD))}
# Doppel gegen Haupt (nur angekerte Silben): Ziel = Haupt-Ziel + 10 ms
dd = []
for a in D:
    t = quelle_zu_ziel(kmD, [int(round(a['src_peak'] * SR))])[0] / SR
    dd.append(dict(id=a['id'], text=a['text'], teil=a['teil'], doppel_minus_haupt_ms=round((t - a['haupt_ziel']) * 1000, 1), stimmen=a['stimmen']))
LOG['doppel'] = dict(angekert=len(D), gesamt=len(tabD), d_minus_h=dict(min=min(x['doppel_minus_haupt_ms'] for x in dd), max=max(x['doppel_minus_haupt_ms'] for x in dd),
                     median=float(np.median([x['doppel_minus_haupt_ms'] for x in dd]))), silben=dd, nicht_angekert=[t['id'] + ' ' + t['text'] for t in tabD if not t['gewaehlt']])
# „see“: Länge des s
h61 = next(a for a in H if a['id'] == 'H-061'); z61 = ZKH['H-061']
s_len_v13 = (z61['erster_einsatz_t'] - z61['konsonant_s'])     # Vorlauf starr -> gleiche Länge wie Quelle
LOG['see_s'] = dict(original_s=round(z61['erster_einsatz_t'] - z61['konsonant_s'], 3), v12_s=round(z61['v12_erster_einsatz_t'] - z61['v12_konsonant_s'], 3),
                    v13_s_aus_quelle=round(h61['src_peak'] - h61['src_kons'] - (z61['t_orig'] - z61['erster_einsatz_t']), 3),
                    v13_s_beginn=round(h61['tgt_peak'] - (h61['src_peak'] - h61['src_kons']), 3), v13_akzent_ziel=h61['tgt_peak'])
LOG['zeilen'] = {nm: [r for r in rows if r['id'] in ids] for nm, ids in (('there is so much more to see', ['H-0%d' % i for i in range(55, 62)]),
                                                                         ('are we hypnotized', ['H-062', 'H-063', 'H-064', 'H-065', 'H-065b', 'H-066']))}
LOG['silben'] = rows
json.dump(LOG, open(A13 + 'timing_mess.json', 'w'), indent=1, ensure_ascii=False, default=float)

# ---------------- Hörproben (lokal) ----------------
E = lade_npy('ende')
def musik(t0, d=6.0):
    b_ = subprocess.run(['ffmpeg', '-v', 'error', '-ss', str(t0), '-t', str(d), '-i', R + 'spuren/The-Wall_v5_Instrumental-Master.mp3', '-f', 'f32le', '-ac', '2', '-ar', str(SR), '-'], capture_output=True).stdout
    x = np.frombuffer(b_, np.float32).reshape(-1, 2).astype(np.float64); y = np.zeros((int(d * SR), 2)); y[:len(x)] = x[:len(y)]; return y
for nm, t0 in (('see', 105.0), ('hypnotized', 111.0)):
    mu = musik(t0)
    for ver, v in (('v12', E), ('v13', lead)):
        s = v[int(t0 * SR):int((t0 + 6) * SR)]
        s = s / (np.sqrt(np.mean(s ** 2)) + 1e-9) * 0.08
        mix = mu * 0.5 + s[:, None]
        mix /= max(1.0, np.abs(mix).max() / 0.95)
        sf.write(OUT13 + 'probe_%s_%s.wav' % (nm, ver), mix.astype(np.float32), SR, subtype='PCM_24')
print(json.dumps({k: LOG[k] for k in ('haupt_abw_zielkarte', 'dehnfaktoren', 'spleisse', 'see_s', 'silben_pegel', 'spitzen')}, indent=1, default=float))
print('ungedeckt', LOG['ungedeckt'])
print('doppel', {k: v for k, v in LOG['doppel'].items() if k != 'silben'})
