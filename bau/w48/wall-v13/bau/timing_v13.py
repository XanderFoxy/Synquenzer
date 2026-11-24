# The Wall v13 – Haupt- und Doppelstimme neu timen (Agent „timing“, 24.11.2026). Nur lokal, nichts ins Netz.
#
# Quellen (Begründung in analyse/timing_mess.md):
#   Haupt  = repo/the-wall/projekt7/Haupt-3-trocken-v7.wav  (24 bit, trocken, mit der v6-Tonhöhenkorrektur = Tonhöhe von v12)
#            + v10-07 („Who“ R2 schneller auf dem Ton) aus v12 nachgebaut. NICHT ende.npy (v12-Lead, 128-kbit-MP3).
#   Doppel = wall-v12/bau/stimmen/doppel_t.wav  (v7-Doppel 24 bit, in v12 auf die Haupt gestimmt, rubberband R3, 32 bit float)
#   Zeitbezug: E5 trocken (wall/roh/original.npy, gleiche Lage wie die Rohaufnahme) nur zum Messen der Quell-Anker.
#
# Ablauf: Anker messen (t2_anker.py -> tcache/anker2.json) -> Ziele (Zielkarte + begründete Ausnahmen, t_plan.py)
#   -> Reinigung in Quellzeit (t_reinigung.py) -> Warp (t_warp.py: Perioden-Spleiße nur im Vokal, Pausen, Konsonanten bitgleich)
#   -> weiche Spitzenbegrenzung -> Terzen (Ober/Unter) neu aus der neuen Haupt -> Zeitkarten + Plan für den Mix.
import json, os, subprocess, sys, time
import numpy as np
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from tgemein import *
from t_plan import haupt_anker, anlaut, sprech_bloecke, starr_liste, doppel_anker_abstimmung, H_ZIEL
from t_lauf import plane
from t_warp import rendern, zeitkarte, quelle_zu_ziel, merkmale
import t_reinigung as RG
from t_doppel import doppel_messung, nachmessen
from t_warp import ziel_zu_quelle

LOG = dict(erstellt=time.strftime('%Y-%m-%d %H:%M'), agent='timing')
t_start = time.time()


def mk_laden(name, x):
    p = TC + 'mk_%s.npz' % name
    if os.path.exists(p): return dict(np.load(p))
    m = merkmale(x); m.pop('hop', None)
    from scipy.signal import butter, sosfiltfilt
    h = sosfiltfilt(butter(4, [3000, 9000], 'bandpass', fs=SR, output='sos'), x)
    m['hf'] = rms_frames(h, 120, 480)[:len(m['lvl'])]
    np.savez(p, **m); return m


# ===================== 1. Quellen =====================
H7 = lade_wav(QUELLE['H_v7']); DT = lade_wav(QUELLE['D_t'])
O = lade_npy('original'); E = lade_npy('ende')
mkH = mk_laden('H_v7', H7); mkD = mk_laden('D_t', DT)

# ===================== 2. Anker und Ziele (Haupt) =====================
H = haupt_anker()
for a in H: anlaut(mkH, a)
B = sprech_bloecke(H7, O)
for b in B:     # „siehst du mich nicht“: v12 beginnt erst mit dem s bei 219,8 (gehaltener Ton davor gehört zum entfernten Rest)
    if b['id'] == 'sprech-126': b['src_a'] = 219.79 + b['off']; b['tgt_a'] = 219.79
LOG['ziel_ausnahmen'] = {k: v for k, v in H_ZIEL.items()}
del O
LOG['sprechbloecke'] = [(b['id'], round(b['src_a'], 3), round(b['src_b'], 3), round(b['off'] * 1000, 1), b['corr']) for b in B]

# ===================== 3. Reinigung (Quellzeit v7) =====================
zb = RG.Zeitbezug(H)
ev = LIED['ereignisse']
x = H7.copy()
who = next(a for a in H if a['id'] == 'H-082')
x = RG.who_r2_tonhoehe(x, who, E, LOG, TC)
x = RG.entklicken(x, ev['klicks'], zb, LOG)
x = RG.plopps(x, ev['plopps'], zb, LOG)
x = RG.zischlaute(x, ev['deesser'], zb, LOG)
OYE_REST = [(217.88, 219.79)]       # Rest von „open your eyes“ + gehaltener Ton vor „siehst“ (in v12 entfernt)
g_p = RG.pausen_gain(x, mkH, H, B, E, zb, ev['atmer'], LOG, stumm_extra=OYE_REST)
g_s, silben_g = RG.silben_pegel(x, H, E, LOG)
x = x * g_p * g_s
del g_p, g_s
LOG['silben_gain_db'] = {k: round(v, 2) for k, v in silben_g.items()}

# ===================== 4. Warp Haupt =====================
stH = starr_liste(H, B)
PH, posH = plane(x, mkH, stH)
lead = rendern(x, PH.stuecke, N)
lead, LOG['lead_spitzen'] = RG.spitzen_weich(lead)
schreibe(ST13 + 'lead.wav', lead)
kmH = zeitkarte(PH.stuecke)
np.save(TC + 'karte_H.npy', kmH); np.save(TC + 'stuecke_H.npy', np.array(PH.stuecke, dtype=np.int64))

# ===================== 5. Doppel =====================
C = doppel_messung(H, H7, DT)
D, tabD = doppel_anker_abstimmung(H, C, mkD)
stD = starr_liste(D, [])
PD, posD = plane(DT, mkD, stD)
dop = rendern(DT, PD.stuecke, N)
# 2./3. Durchgang: freie (nicht verankerte) Doppel-Silben im Ergebnis gegen die neue Haupt nachmessen. Stimmen alle drei Messungen
# (±20 ms) überein – oder zwei bei mindestens 25 ms Abweichung –, wird die Silbe zusätzlich verankert (Ziel = Haupt + 10 ms) und das
# Doppel neu gerechnet. Akzent-Silben (see, sake, your, the) nur bei 3 von 3.
Hd = {h['id']: h for h in H}
LOG['doppel_2_durchgang'] = []
for runde in (1, 2):
    kmD1 = zeitkarte(PD.stuecke)
    frei = [k for k in C if k not in {a['id'] for a in D}]
    ev13 = [(k, float(quelle_zu_ziel(kmH, [int(round(Hd['H-' + k[2:]]['src_peak'] * SR))])[0]) / SR) for k in frei]
    nm2 = nachmessen(lead, dop, ev13)
    zus = []
    for r in nm2:
        if r['versatz'] is None: continue
        akz = Hd['H-' + r['id'][2:]]['akzent']
        stark = len(r['gruppe']) >= 3 or (not akz and len(r['gruppe']) == 2 and abs(r['versatz']) >= 0.025)
        if not stark: continue
        t_d13 = r['ev'] + r['versatz']
        src = float(ziel_zu_quelle(kmD1, [int(round(t_d13 * SR))])[0]) / SR
        h = Hd['H-' + r['id'][2:]]
        a = dict(id=r['id'], text=h['text'], teil=h['teil'], src_peak=src, src_vokal=src - (h['src_peak'] - h['src_vokal']),
                 src_kons_zk=src - (h['src_peak'] - h['src_kons_zk']), akzent=False, tgt_peak=r['ev'] + 0.010, art='silbe',
                 off_ms=round(r['versatz'] * 1000), stimmen=['Durchgang %d' % (runde + 1)] + r['gruppe'], haupt_ziel=r['ev'])
        anlaut(mkD, a)
        zus.append(a)
    LOG['doppel_2_durchgang'].append(dict(runde=runde + 1, gemessen=len(nm2), zusaetzlich_verankert=len(zus),
                                          silben=[(a['id'], a['text'], a['teil'], a['off_ms']) for a in zus]))
    if not zus: break
    D = sorted(D + zus, key=lambda a: a['src_peak'])
    stD = starr_liste(D, [])
    PD, posD = plane(DT, mkD, stD)
    dop = rendern(DT, PD.stuecke, N)
dop, LOG['doppel_spitzen'] = RG.spitzen_weich(dop)
schreibe(ST13 + 'doppel.wav', dop)
kmD = zeitkarte(PD.stuecke)
np.save(TC + 'karte_D.npy', kmD); np.save(TC + 'stuecke_D.npy', np.array(PD.stuecke, dtype=np.int64))

# ===================== 6. Plan-Daten für Mess-Skript und Mix =====================
def seg_info(P):
    seg = [l for l in P.log if 'name' in l]
    f = [x_ for l in seg for x_ in l.get('faktoren', [])]
    return seg, f


segH, fH = seg_info(PH); segD, fD = seg_info(PD)
json.dump(dict(H=H, B=B, D=D, tabD=tabD, posH=posH, posD=posD, segH=segH, segD=segD, splH=PH.spleisse, splD=PD.spleisse,
               fH=fH, fD=fD, log=LOG), open(TC + 'bau_plan.json', 'w'), indent=0, default=float, ensure_ascii=False)
print('Haupt: Abschnitte %d, Spleiße %d, Faktoren %.3f…%.3f' % (len(segH), len(PH.spleisse), min(fH), max(fH)), flush=True)
print('Doppel: Anker %d/%d, Spleiße %d, Faktoren %.3f…%.3f' % (len(D), len(tabD), len(PD.spleisse), min(fD), max(fD)), flush=True)

# ===================== 7. Terzen (Ober/Unter) neu aus der neuen Haupt =====================
# Ober-/Unterstimme hängen von der Haupt ab (stimmen_v12.py: Versionen der Haupt um +3/+4/+5 bzw. -3/-4 Halbtöne,
# rubberband R2 + Formant, je Lead-Ton per Pitchmap gewählt). Gegengesang (Xanders eigene Spur) und Doppel-Stimmung hängen
# nicht von der Haupt-Zeit ab -> unverändert (wall-v12/bau/stimmen/gegen_t.wav, gegen_adtL/R.wav).
P12 = W12 + 'bau/plan/'
plan12 = json.load(open(P12 + 'plan.json'))
s7e = np.array(sorted([(a['src_peak'], a['t_v12']) for a in H if a['t_v12'] is not None]))
# v12-Lead-Zeit -> v7-Zeit (Umkehrung über die Anker; ZT-Sprechstellen haben gleiche Lage) -> v13-Zeit (Zeitkarte)
def v12_zu_v13(t):
    t = np.atleast_1d(np.asarray(t, float))
    t7 = t - np.interp(t, s7e[:, 1], s7e[:, 1] - s7e[:, 0])
    return quelle_zu_ziel(kmH, np.round(t7 * SR).astype(np.int64)) / SR
def d12_zu_d13(t):   # Doppel v12 = doppel_t-Zeit
    t = np.atleast_1d(np.asarray(t, float))
    return quelle_zu_ziel(kmD, np.round(t * SR).astype(np.int64)) / SR

os.makedirs(B13 + 'plan_v13', exist_ok=True)
for nm in ('ober', 'unter'):
    zeilen = [tuple(map(float, l.split())) for l in open(P12 + nm + '.txt')]
    fr = np.array([z[0] for z in zeilen]); val = [z[1] for z in zeilen]
    neu = np.round(v12_zu_v13(fr / SR) * SR).astype(np.int64)
    neu = np.maximum.accumulate(neu)
    with open(B13 + 'plan_v13/%s.txt' % nm, 'w') as f:
        for q, v in zip(neu, val): f.write('%d %.4f\n' % (q, v))
plan13 = dict(plan12)
for key in ('ober_gate', 'unter_gate'):
    plan13[key] = [[float(v12_zu_v13(a)[0]), float(v12_zu_v13(b)[0])] for a, b in plan12[key]]
plan13['doppel_gate'] = [[float(d12_zu_d13(a)[0]), float(d12_zu_d13(b)[0])] for a, b in plan12['doppel_gate']]
plan13['hinweis_v13'] = ('ober/unter_gate und ober/unter.txt: v12-Lead-Zeit über die Silben-Anker auf v13-Lead-Zeit abgebildet; '
                         'doppel_gate: doppel_t-Zeit über die Doppel-Zeitkarte auf v13-Doppel-Zeit. chor/gegen_fenster, oye unverändert.')
json.dump(plan13, open(B13 + 'plan_v13/plan.json', 'w'), indent=1, ensure_ascii=False)

def rb(x_, out_name, args):
    fi = TC + 'rb_in.wav'; fo = TC + 'rb_out.wav'
    sf.write(fi, x_.astype(np.float32), SR, subtype='FLOAT')
    subprocess.run(['nice', 'rubberband'] + args + [fi, fo], check=True, capture_output=True)
    y, _ = sf.read(fo, dtype='float64')
    # Latenz ausgleichen (Hüllkurven-Korrelation wie stimmen_v12.ausrichten)
    from scipy.signal import correlate, butter as bu, sosfiltfilt as sff
    def env(v):
        sos = bu(2, [300, 3000], 'bandpass', fs=SR, output='sos'); w_ = sff(sos, v)
        e_ = np.sqrt(np.convolve(w_ ** 2, np.ones(96) / 96, 'same')); return e_ - e_.mean()
    m = min(len(x_), len(y)); a_ = env(x_[:m])[::4]; b_ = env(y[:m])[::4]
    c = correlate(b_, a_, mode='full', method='fft'); mid = len(a_) - 1; w = 2000
    lag = (np.argmax(c[mid - w:mid + w + 1]) - w) * 4
    z = np.zeros(N)
    if lag >= 0: seg = y[lag:lag + N]; z[:len(seg)] = seg
    else: seg = y[:N + lag]; z[-lag:-lag + len(seg)] = seg
    schreibe(ST13 + out_name + '.wav', z)
    os.remove(fi); os.remove(fo)
    return z, lag

if not os.environ.get('OHNE_TERZEN'):
    vers = {}
    for iv in (3, 4, 5):
        vers['p%d' % iv], l1 = rb(lead, 'lead_p%d' % iv, ['-2', '-F', '-p', str(iv)])
        vers['p%d_adt' % iv], l2 = rb(lead, 'lead_p%d_adt' % iv, ['-2', '-F', '-p', '%.2f' % (iv + 0.08)])
        print('Terz-Version +%d fertig (Latenz %d/%d)' % (iv, l1, l2), flush=True)
    for iv in (3, 4):
        vers['m%d' % iv], l1 = rb(lead, 'lead_m%d' % iv, ['-2', '-F', '-p', str(-iv)])
        print('Terz-Version -%d fertig (Latenz %d)' % (iv, l1), flush=True)
    # zusammengesetzt wie mix_v12.zusammensetzen (Gate: ober/unter_gate * chor_fenster * (1 - OYE))
    sys.path.insert(0, W12 + 'bau')
    from dsp import maske
    def zusammensetzen(pm_file, versionen, gate, fade_ms=12.0):
        pts = [tuple(map(float, l.split())) for l in open(pm_file)]
        K = 1000; n1 = int(266 * K) + 2; sel = np.zeros(n1)
        for k, (fr_, v) in enumerate(pts):
            a = int(fr_ / SR * K); b_ = int(pts[k + 1][0] / SR * K) if k + 1 < len(pts) else n1
            sel[a:b_] = v
        out = np.zeros(N)
        w = max(int(fade_ms), 1); win = np.hanning(w + 2)[1:-1]; win /= win.sum()
        for v, x_ in versionen.items():
            m = np.convolve((sel == v).astype(float), win, 'same')
            out += x_ * np.interp(np.arange(N) / SR, np.arange(n1) / K, m)
        return out * gate
    fen_c = plan13['chor_fenster']; OYE = tuple(plan13['oye'])
    g_ober = maske(plan13['ober_gate'], N, 0.025) * maske(fen_c, N, 0.1) * (1 - maske([OYE], N, 0.03))
    g_unter = maske(plan13['unter_gate'], N, 0.03) * maske(fen_c, N, 0.1) * (1 - maske([OYE], N, 0.03))
    pmo = B13 + 'plan_v13/ober.txt'; pmu = B13 + 'plan_v13/unter.txt'
    schreibe(ST13 + 'ober.wav', zusammensetzen(pmo, {3.0: vers['p3'], 4.0: vers['p4'], 5.0: vers['p5']}, g_ober))
    schreibe(ST13 + 'ober_adt.wav', zusammensetzen(pmo, {3.0: vers['p3_adt'], 4.0: vers['p4_adt'], 5.0: vers['p5_adt']}, g_ober))
    schreibe(ST13 + 'unter.wav', zusammensetzen(pmu, {-3.0: vers['m3'], -4.0: vers['m4']}, g_unter))
    LOG['terzen'] = 'neu aus v13-Lead: lead_p3/p4/p5(+_adt), lead_m3/m4; ober.wav, ober_adt.wav, unter.wav (Gate wie mix_v12, ohne Verzögerung/Pegel)'

LOG['laufzeit_s'] = round(time.time() - t_start, 1)
json.dump(LOG, open(TC + 'bau_log.json', 'w'), indent=1, ensure_ascii=False, default=float)
print(json.dumps(LOG, indent=1, ensure_ascii=False, default=float)[:3000])
