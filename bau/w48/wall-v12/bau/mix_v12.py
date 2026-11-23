# The Wall v12 – Mix und Master
# Quellen: Lead v11 trocken (ende, 128k-MP3-Dekodierung), Xanders Gegengesang (v7-WAV, neu gestimmt), Doppel (v7-WAV, auf Lead gestimmt),
#          Ober-/Unterstimme aus dem Lead (akkordgerecht), Musik = v5-Instrumental-Master (MP3 320k, wie v11).
import numpy as np, soundfile as sf, subprocess, json, os, sys
import pyloudnorm as pyln
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from dsp import *

W = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/wall-v12/'
R = W + 'repo/the-wall/'; B = W + 'bau/'; ST = B + 'stimmen/'; P = B + 'plan/'
OUTD = R + 'projekt12/'; os.makedirs(OUTD, exist_ok=True)
STEMS = B + 'stems_v12/'; os.makedirs(STEMS, exist_ok=True)
N = 266 * SR
plan = json.load(open(P + 'plan.json'))
LOG = {}

REFRAINS = [(63.0, 96.5), (127.0, 176.0), (223.0, 256.5)]       # inkl. Tag
STROPHEN = [(31.4, 63.0), (95.4, 127.0)]
R123 = [(64.0, 96.0), (128.0, 160.0), (224.0, 256.0)]
SPRACHE = (219.6, 221.7)
OYE = tuple(plan['oye'])


def lade(name): return sf.read(ST + name + '.wav', dtype='float64')[0][:N]


def zeit_maske(ranges, fade=0.5): return maske(ranges, N, fade)


def pegel_rel(x, ref, act_from=None, ranges=R123):
    """RMS der Spur gegen den Lead über die Frames, in denen die Spur aktiv ist (innerhalb ranges)."""
    xm = x if x.ndim == 1 else x.mean(1) * np.sqrt(2) if False else x
    def fr(v):
        v2 = v ** 2 if v.ndim == 1 else (v ** 2).sum(1)
        h = SR // 20; n = len(v2) // h
        return v2[:n * h].reshape(n, h).mean(1)
    ex = fr(x); el = fr(ref)
    t = np.arange(len(ex)) * 0.05
    sel = np.zeros(len(ex), bool)
    for a, b in ranges: sel |= (t >= a) & (t < b)
    a_ = fr(act_from) if act_from is not None else ex
    act = sel & (10 * np.log10(a_ + 1e-12) > 10 * np.log10(a_[sel].max() + 1e-12) - 40)
    return 10 * np.log10(ex[act].mean() / el[act].mean())


# ===================== Quellen =====================
lead = np.load('/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/wall/roh/ende.npy').astype(np.float64)[:N]
b = subprocess.run(['ffmpeg', '-v', 'error', '-i', R + 'spuren/The-Wall_v5_Instrumental-Master.mp3', '-f', 'f32le', '-ac', '2', '-ar', str(SR), '-'], capture_output=True).stdout
musik = np.frombuffer(b, dtype=np.float32).reshape(-1, 2).astype(np.float64)[:N]
if len(musik) < N: musik = np.concatenate([musik, np.zeros((N - len(musik), 2))])

# ===================== Lead =====================
# v11-Silbenangleichung, Reinigung, „open your eyes“-Entfernung sind schon in ende enthalten.
L = hp(lead, 110.0, 2)
LEAD_EQ = json.load(open(P + 'lead_eq.json')) if os.path.exists(P + 'lead_eq.json') else []
L = eq(L, [('peak', 320.0, 1.0, -1.5), ('peak', 3400.0, 0.9, 1.0)] + [tuple(b_) for b_ in LEAD_EQ])
akt = rms_db(L, 50)
act = akt > np.percentile(akt, 99.5) - 30
lvl_rms = rms_db(L, 10); lvl_pk = peak_db(L, 1.0)
# Stufe 1 (FET-artig): nur Spitzen
thr1 = np.percentile(lvl_pk[act], 97)
L, gr1 = kompressor(L, thr1, 3.0, 5.0, 70.0, knee=2.0, det='peak', det_ms=1.0)
# Stufe 2 (Opto-artig): weich glätten, nur oberhalb des mittleren Pegels (Silbendynamik bleibt, Xander: „sehr komprimiert“)
thr2 = np.percentile(rms_db(L, 10)[act], 50) - 0.5
L, gr2 = kompressor(L, thr2, 2.0, 25.0, 200.0, knee=6.0, det='rms', det_ms=10.0)
# Entzischer 5,5–8 kHz
hi_lvl = rms_db(hp_zp(L, 5500.0, 4), 3.0)
thr_s = np.percentile(hi_lvl[act], 85)
L, grs = entzischer(L, 5500.0, thr_s, 4.0, 0.6)
# Spitzenbegrenzer nur für Plosive (wie „C“ bei 71,5 s): Crest höchstens 15 dB über dem aktiven Pegel
akt_rms = 10 * np.log10(np.mean(L[act] ** 2))
L2, grp = limiter(np.stack([L, L], 1), akt_rms + 15.0, 1.5, 100.0); L = L2[:, 0]
grL = gr1 + gr2
LOG['lead_spitzen_gr'] = dict(anteil_ueber_1dB=round(float(np.mean(grp[act] > 1) * 100), 2), max=round(float(grp.max()), 1))
LOG['lead_gr'] = dict(median_singen=round(float(np.median(grL[act])), 2), p95=round(float(np.percentile(grL[act], 95)), 2),
                      max=round(float(grL.max()), 1), stufe1_p95=round(float(np.percentile(gr1[act], 95)), 2),
                      stufe2_median=round(float(np.median(gr2[act])), 2), entzischer_p95=round(float(np.percentile(grs[act], 95)), 2))
# Refrain +0,5 dB (Lead führt)
L = L * undb(0.5 * zeit_maske(REFRAINS, 0.8))

# ===================== Gegengesang (Xander) =====================
fen_g = [(a, b_) for a, b_ in plan['gegen_fenster']]
mg = maske(fen_g, N, 0.06)
G = lade('gegen_t') * mg
G = hp(G, 120.0, 2)
G, _ = expander(G, -50.0, 12.0, 2.0)
G = eq(G, [('peak', 250.0, 1.0, -1.5), ('peak', 2800.0, 1.0, 1.0)])
actg = rms_db(G, 50) > np.percentile(rms_db(G, 50), 99.5) - 30
thrg = np.percentile(rms_db(G, 10)[actg], 50) - 5.0
G, grg = kompressor(G, thrg, 2.0, 20.0, 150.0, knee=4.0)
G, _ = entzischer(G, 5500.0, np.percentile(rms_db(hp_zp(G, 5500.0), 3.0)[actg], 85), 4.0, 0.6)
LOG['gegen_gr_median'] = round(float(np.median(grg[actg])), 2)
GA_L = verz(hp(lade('gegen_adtL') * mg, 150.0, 2), 15.0)
GA_R = verz(hp(lade('gegen_adtR') * mg, 150.0, 2), 22.0)
GA_L, _ = kompressor(GA_L, thrg, 2.0, 20.0, 150.0, knee=4.0); GA_R, _ = kompressor(GA_R, thrg, 2.0, 20.0, 150.0, knee=4.0)

# ===================== Doppel =====================
fen_c = [(a, b_) for a, b_ in plan['chor_fenster']]
md = maske(plan['doppel_gate'], N, 0.03) * maske(fen_c, N, 0.1)
D = lade('doppel_t') * md
D = hp(D, 140.0, 2); D, _ = expander(D, -50.0, 12.0)
D = eq(D, [('peak', 300.0, 1.0, -2.0), ('highshelf', 9000.0, 0.7, -1.5)])
actd = rms_db(D, 50) > np.percentile(rms_db(D, 50), 99.5) - 30
D, _ = kompressor(D, np.percentile(rms_db(D, 10)[actd], 50) - 2.0, 2.0, 15.0, 120.0, knee=4.0)
D, _ = entzischer(D, 5000.0, np.percentile(rms_db(hp_zp(D, 5000.0), 3.0)[actd], 75), 6.0, 0.8)


# ===================== Ober-/Unterstimme =====================
def zusammensetzen(pm_file, versionen, gate, fade_ms=12.0):
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
OB_L = zusammensetzen(P + 'ober.txt', {3.0: lade('lead_p3'), 4.0: lade('lead_p4'), 5.0: lade('lead_p5')}, g_ober)
OB_R = verz(zusammensetzen(P + 'ober.txt', {3.0: lade('lead_p3_adt'), 4.0: lade('lead_p4_adt'), 5.0: lade('lead_p5_adt')}, g_ober), 18.0)
UN = zusammensetzen(P + 'unter.txt', {-3.0: lade('lead_m3'), -4.0: lade('lead_m4')}, g_unter)
UN = verz(UN, 9.0)

# ===================== Pegel (gegen Lead, aktive Frames, R1–R3) =====================
ZIEL = dict(G=-5.5, GA_L=-15.0, GA_R=-15.0, D=-11.0, OB_L=-15.5, OB_R=-15.5, UN=-18.0)   # Chor ohne Doppel zusammen ≈ −4 dB
SP = dict(G=G, GA_L=GA_L, GA_R=GA_R, D=D, OB_L=OB_L, OB_R=OB_R, UN=UN)
FADER = {}
for k, x in SP.items():
    ist = pegel_rel(x, L)
    FADER[k] = ZIEL[k] - ist
    SP[k] = x * undb(FADER[k])
LOG['fader_db'] = {k: round(v, 1) for k, v in FADER.items()}
LOG['pegel_rel_lead_nachher'] = {k: round(pegel_rel(SP[k], L), 1) for k in SP}

# ===================== Chor-Bus (Ober + Unter) =====================
chor = pan(SP['OB_L'], -0.6) + pan(SP['OB_R'], 0.6) + pan(SP['UN'], 0.0)
chor = hp(chor, 190.0, 2)
chor = eq(chor, [('peak', 3000.0, 1.0, -2.5), ('highshelf', 10000.0, 0.7, -1.0)])
chor, _ = entzischer(chor, 5000.0, np.percentile(rms_db(hp_zp(chor, 5000.0), 3.0)[rms_db(chor, 50) > -60], 70), 7.0, 0.8)
actc = rms_db(chor, 50) > np.percentile(rms_db(chor, 50), 99.5) - 25
thrc = np.percentile(rms_db(chor, 10)[actc], 50) - 6.0
chor, grc = kompressor(chor, thrc, 3.5, 15.0, 150.0, knee=4.0)
LOG['chorbus_gr_median'] = round(float(np.median(grc[actc])), 2)
chor = chor * undb(np.median(grc[actc]) * 0.7)          # Make-up (teilweise)
# dynamischer EQ vom Lead: 1–4 kHz im Chor bis −2 dB, wenn der Lead singt
lead_env = rms_db(L, 30)
duck = np.clip((lead_env - (np.percentile(lead_env[act], 50) - 12)) / 12, 0, 1) * 2.0
duck = glaetten(duck, 10.0, 150.0, 2.0)
mitte = bp_zp(chor, 1000.0, 4000.0, 2)
chor = chor - mitte * (1 - undb(-duck))[:, None]

# Gegengesang-Gruppe (Mitte + ADT L70/R70)
gegen = pan(SP['G'], 0.0) + pan(SP['GA_L'], -0.7) + pan(SP['GA_R'], 0.7)
doppel = pan(SP['D'], 0.0)
lead_st = pan(L, 0.0)

# ===================== Hall / Delay =====================
ir_lead = plate_ir(1.7, 62.5, seed=11)
ir_chor = plate_ir(2.2, 35.0, seed=23)
# Lead-Send: entzischt + dunkler, Refrain −11 dB / Strophe −14 dB Hall/Direkt, Sprechstelle −6 dB weniger
send_auto = undb(-3.0 * (1 - zeit_maske(REFRAINS, 1.0)) - 6.0 * maske([SPRACHE], N, 0.2))
lead_send = lp(entzischer(L, 4500.0, thr_s - 6, 8.0, 0.8)[0], 9000.0, 2) * send_auto
h_lead = hall(lead_send, ir_lead, 350.0, 7000.0)
h_dop = hall(lp(SP['D'], 9000.0, 2), ir_lead, 350.0, 7000.0)
# Rücklauf ducken: 2,5 dB, wenn der Lead singt
dk = glaetten(np.clip((lead_env - (np.percentile(lead_env[act], 50) - 10)) / 10, 0, 1) * 2.5, 20.0, 300.0, 2.5)
h_lead *= undb(-dk)[:, None]; h_dop *= undb(-dk)[:, None]


def hall_ziel(dry_st, wet_st, ziel_db, ranges=R123):
    """Hall/Direkt-Verhältnis (Energie, beide Stereo) über die Refrains auf ziel_db setzen."""
    e_d = np.mean([np.mean(dry_st[int(a * SR):int(b_ * SR)] ** 2) for a, b_ in ranges])
    e_h = np.mean([np.mean(wet_st[int(a * SR):int(b_ * SR)] ** 2) for a, b_ in ranges])
    return undb(ziel_db - 10 * np.log10(e_h / e_d))


g_hl = hall_ziel(lead_st, h_lead, -11.0)
h_lead *= g_hl; h_dop *= g_hl
# Chor/Gegengesang-Hall (gemeinsam): Chor −7 dB, Gegengesang −8 dB
h_ch = hall(chor.mean(1), ir_chor, 400.0, 6000.0)
h_ge = hall(entzischer(gegen.mean(1), 5000.0, -45, 6.0)[0], ir_chor, 400.0, 6000.0)
h_ch *= hall_ziel(chor, h_ch, -7.0)
h_ge *= hall_ziel(gegen, h_ge, -8.0)
# Delay Lead: Viertel 500 ms, ducked (Echos v. a. an Zeilenenden), Sprechstelle ohne Delay
dl_send = L * (1 - maske([(SPRACHE[0] - 0.1, SPRACHE[1])], N, 0.1))
dly = echo(dl_send, 0.5, 0.18, 6, 300.0, 5000.0)
dd = glaetten(np.clip((lead_env - (np.percentile(lead_env[act], 50) - 15)) / 10, 0, 1) * 10.0, 10.0, 250.0, 10.0)
dly *= undb(-dd)[:, None]
dly *= hall_ziel(lead_st, dly, -24.0)

# Stelle „Siehst du mich nicht“: alle Begleitstimmen sind dort stumm (Masken); Hall-Fahnen von davor ausblenden
fahne_weg = 1 - maske([(SPRACHE[0] - 0.15, SPRACHE[1] + 0.2)], N, 0.3)
h_ch *= fahne_weg[:, None]; h_ge *= fahne_weg[:, None]

vox = lead_st + doppel + gegen + chor + h_lead + h_dop + h_ch + h_ge + dly
# Stems für die Werkstatt (privat, nur Scratchpad)
for nm, x in dict(lead=lead_st, gegengesang=gegen, chor=chor, doppel=doppel, hall=h_lead + h_dop + h_ch + h_ge + dly).items():
    sf.write(STEMS + nm + '.wav', x.astype(np.float32), SR, subtype='FLOAT')

# ===================== Pegel Gesang gegen Musik (wie v11) =====================
# Bezug: Gesangsbus v11 (Master − Instrumental) in den Strophen, Band 200 Hz–6 kHz
v11bus = np.load(W + 'analyse/dyn/voc_m11.npy').astype(np.float64)[:N]


def band_e(x, rng):
    y = bp_zp(x.mean(1) if x.ndim > 1 else x, 200.0, 6000.0, 2)
    return np.mean([np.mean(y[int(a * SR):int(b_ * SR)] ** 2) for a, b_ in rng])


meter = pyln.Meter(SR)
def lufs_teile(x, rng): return meter.integrated_loudness(np.concatenate([x[int(a * SR):int(b_ * SR)] for a, b_ in rng], 0))
g_vox = lufs_teile(v11bus, STROPHEN) - lufs_teile(vox, STROPHEN)
LOG['gesang_angleich_db'] = round(g_vox, 2)
vox *= undb(g_vox)
# Spitzen der Gesangssumme nur grob fangen (Crest ≤ 13 dB über aktivem Pegel), Silben bleiben unangetastet
va = rms_db(vox, 50) > np.percentile(rms_db(vox, 50), 99.5) - 30
vox, grv = limiter(vox, 10 * np.log10(np.mean(vox[va] ** 2) * 2) + 13.0, 1.5, 100.0)
LOG['gesang_bus_spitzen_gr_p99'] = round(float(np.percentile(grv[va], 99)), 2)
LOG['gesang_lufs'] = {nm: round(lufs_teile(vox, [r]), 1) for nm, r in dict(S1=(32, 64), R1=(64, 96), S2=(96, 128), R2=(128, 160), ZT=(192, 224), R3=(224, 256)).items()}
LOG['v11bus_lufs'] = {nm: round(lufs_teile(v11bus, [r]), 1) for nm, r in dict(S1=(32, 64), R1=(64, 96), S2=(96, 128), R2=(128, 160), ZT=(192, 224), R3=(224, 256)).items()}
sf.write(STEMS + 'gesang_summe.wav', vox.astype(np.float32), SR, subtype='FLOAT')

# Musik: im Refrain sanft bis −1,3 dB unter den Gesang (v11: −0,8…−1,1 dB)
vs = rms_db(vox, 50)
md_ = glaetten(np.clip((vs - (np.percentile(vs, 90) - 12)) / 12, 0, 1) * 1.3, 50.0, 400.0, 1.3)
musik_d = musik * undb(-md_)[:, None]
# „Master nur auf der Musik“ (wie v11): Spitzen der fertigen v5-Musik (−0,4 dBTP) sanft auf −1,5 dBTP, schafft Platz für den Gesang
musik_d, grm = limiter(musik_d, -1.5, 3.0, 40.0)
LOG['musik_limiter_gr'] = dict(p95=round(float(np.percentile(grm, 95)), 2), p99=round(float(np.percentile(grm, 99)), 2), max=round(float(grm.max()), 2))

mix = musik_d + vox
ziel = -10.0; g = 0.0
def master(x):
    """Zwei Stufen: schnell (Transienten, bis −0,6 dBTP), dann ruhig (−1,5 dBTP)."""
    y, g1 = limiter(x, -0.6, 1.5, 200.0)
    y, g2 = limiter(y, -1.5, 5.0, 25.0)
    return y, g1 + g2
for it in range(4):
    y, grl = master(mix * undb(g))
    lu = meter.integrated_loudness(y)
    g += ziel - lu
y, grl = master(mix * undb(g))
lu = meter.integrated_loudness(y)
LOG['musik_duck_db'] = dict(median_refrain=round(float(np.median(np.concatenate([md_[int(a * SR):int(b_ * SR)] for a, b_ in R123]))), 2), max=round(float(md_.max()), 2))
LOG['master'] = dict(gain_db=round(g, 2), lufs=round(lu, 2), tp_48k=round(true_peak(y), 2),
                     limiter_gr_p95=round(float(np.percentile(grl, 95)), 2), limiter_gr_p99=round(float(np.percentile(grl, 99)), 2), limiter_gr_max=round(float(grl.max()), 2),
                     limiter_gr_anteil_ueber_0_5dB=round(float(np.mean(grl > 0.5) * 100), 2))
np.save(B + 'master_v12_48k.npy', y.astype(np.float32))

# ===================== Ausgabe =====================
wav48 = B + 'tmp/The-Wall_A_v12_48k.wav'
sf.write(wav48, y.astype(np.float32), SR, subtype='FLOAT')
y44 = resample_poly(y, 147, 160, axis=0)
tp44 = true_peak(y44)
if tp44 > -1.2: y44 *= undb(-1.2 - tp44)
sf.write(OUTD + 'The-Wall_A_v12.wav', y44, 44100, subtype='PCM_24')
subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', wav48, '-c:a', 'libmp3lame', '-b:a', '320k', '-ar', '48000', OUTD + 'The-Wall_A_v12.mp3'], check=True)
json.dump(LOG, open(B + 'mix_log.json', 'w'), indent=1)
print(json.dumps(LOG, indent=1))
