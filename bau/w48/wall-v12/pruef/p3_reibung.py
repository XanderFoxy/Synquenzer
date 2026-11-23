# Unabhängige Reibungs-Messung (Tonhöhen-Salienz, nicht YIN): Anteil der Energie auf reibenden Tönen
# reibend gegen Akkord = Nicht-Akkordton mit Halbton-Nachbar im Akkord; gegen Lead = Halbton/gr. Septime/Tritonus zum Lead-Ton
import numpy as np, soundfile as sf, json
W = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/wall-v12/'
SR = 48000; N = 266 * SR
CH = [[3, 6, 10], [6, 10, 1], [1, 5, 8], [8, 0, 3]]   # Ebm Gb Db Ab/C, je 4 s
R = [(64, 96, 64), (128, 160, 128), (224, 256, 224)]
nf = 8192; hop = 2400
f = np.fft.rfftfreq(nf, 1 / SR); win = np.hanning(nf)
MID = np.arange(40, 84)
# Salienz-Matrix: Harmonische 1..6, Gewicht 0.8^(h-1), ±25 Cent
Wm = np.zeros((len(MID), len(f)))
for i, mm in enumerate(MID):
    f0 = 440 * 2 ** ((mm - 69) / 12)
    for h in range(1, 7):
        fh = h * f0
        if fh > 5000: break
        Wm[i, (f > fh * 2 ** (-.25 / 12)) & (f < fh * 2 ** (.25 / 12))] = 0.8 ** (h - 1)


def mono(x): return x.mean(1) if x.ndim == 2 else x


def sal(x, a, b):
    s = mono(x)[int(a * SR):int(b * SR)]; out = []; tt = []
    for i in range(0, len(s) - nf, hop):
        P = np.abs(np.fft.rfft(win * s[i:i + nf]))
        out.append(Wm @ P); tt.append(a + (i + nf / 2) / SR)
    return np.array(out), np.array(tt)


def reib_pc(ch): return [p for p in range(12) if p not in ch and any((p - q) % 12 in (1, 11) for q in ch)]


def mess(x, lead=None):
    num = den = nl = dl = 0.0
    for a, b, st in R:
        S, tt = sal(x, a, b)
        if lead is not None: SL, _ = sal(lead, a, b)
        for k in range(len(tt)):
            ch = CH[int((tt[k] - st) // 4) % 4]
            pc = np.zeros(12)
            v = S[k] ** 2
            # nur Töne, die nennenswert da sind (> -25 dB unter dem stärksten im Frame)
            v = np.where(v > v.max() * 10 ** (-25 / 10), v, 0)
            for i, mm in enumerate(MID): pc[mm % 12] += v[i]
            if pc.sum() <= 0: continue
            num += pc[reib_pc(ch)].sum(); den += pc.sum()
            if lead is not None:
                vl = SL[k] ** 2
                if vl.max() < 1e-6: continue
                lp = MID[int(np.argmax(vl))] % 12
                bad = [(lp + d) % 12 for d in (1, 11, 6)]
                nl += pc[bad].sum(); dl += pc.sum()
    return round(100 * num / den, 1), (round(100 * nl / dl, 1) if dl else None)


ST = W + 'bau/stems_v12/'
ld = lambda p: sf.read(p, dtype='float64')[0][:N]
lead = ld(ST + 'lead.wav')
OUT = {}
OUT['v11_bus_master_minus_musik'] = mess(np.load(W + 'analyse/dyn/voc_m11.npy')[:N])
OUT['v10_bus_master_minus_musik'] = mess(np.load(W + 'analyse/dyn/voc_m10.npy')[:N])
OUT['v12_bus_master_minus_musik'] = mess(np.load(W + 'pruef/voc_m12.npy')[:N])
OUT['v12_lead_stem'] = mess(lead)
OUT['v12_chor_stem'] = mess(ld(ST + 'chor.wav'), lead)
OUT['v12_gegengesang_stem'] = mess(ld(ST + 'gegengesang.wav'), lead)
OUT['v12_doppel_stem'] = mess(ld(ST + 'doppel.wav'), lead)
P7 = W + 'repo/the-wall/projekt7/'
for k in ['Chor-Oberterz-aus-Haupt-v7', 'Chor-Unterterz-aus-Haupt-v7', 'Gegengesang-eigen-7', 'Doppel-4-trocken-v7', 'KI-Oberterz-8', 'KI-Unterterz-9']:
    try: OUT['v7_' + k] = mess(ld(P7 + k + '.wav'), lead)
    except Exception as e: OUT['v7_' + k] = str(e)
json.dump(OUT, open(W + 'pruef/p3.json', 'w'), indent=1)
print('(Reibung gegen Akkord %, gegen Lead %)')
print(json.dumps(OUT, indent=1))
