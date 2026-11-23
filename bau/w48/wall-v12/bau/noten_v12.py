# The Wall v12 – Notenplan für die Begleitstimmen.
# Liest f0.npz (YIN, 10 ms) und legt fest:
#   Oberstimme  (aus Lead v11): je Lead-Ton Terz drüber, wenn sie zum Akkord passt, sonst nächster Akkordton drüber (Quarte/Quinte)
#   Unterstimme (aus Lead v11): Terz drunter, nur in den Ab/C-Takten
#   Gegengesang (Xander): jeder Ton auf seinen eigenen Halbton gestimmt; leiterfremde/„zwischen“-Töne auf den nächsten Akkordton
#   Doppel: auf die Lead-Töne gestimmt; Töne, die nicht zum Lead passen, stumm
# Ausgabe: plan/*.txt (rubberband-Pitchmaps, Sample-Frames bei 48 kHz) und plan/plan.json (Masken, Statistik)
import numpy as np, json, os
from scipy.ndimage import median_filter
W = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/wall-v12/'
OUT = W + 'bau/plan/'; os.makedirs(OUT, exist_ok=True)
SR = 48000
d = np.load(W + 'analyse/f0.npz')
NFR = len(d['haupt_f']); T = np.arange(NFR) * 0.01 + 0.025
SCALE = {0, 1, 3, 5, 6, 8, 10}          # es-dorisch / Db-Dur
CH = {'Ebm': [3, 6, 10], 'Gb': [6, 10, 1], 'Db': [1, 5, 8], 'Ab/C': [8, 0, 3], 'Bb': [10, 5]}
LOOP = ['Ebm', 'Gb', 'Db', 'Ab/C']
PROG = [(64.0, 96.0), (128.0, 176.0), (192.0, 224.0), (224.0, 256.0)]   # Refrain-Folge (R1, R2+Tag, ZT, R3)
NAMEPC = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B']


def chord_at(t):
    if 256.0 <= t < 266.5: return 'Bb'
    for a, b in PROG:
        if a - 1.2 <= t < b:
            return LOOP[int(np.floor(max(t - a, 0) / 4.0)) % 4]
    return None


def chord_note(a, b):
    """Akkord mit der größten Überlappung, Antizipation 0,15 s."""
    ts = np.arange(a + 0.15, b + 0.15, 0.01)
    if len(ts) == 0: ts = [a + 0.15]
    cnt = {}
    for t in ts:
        c = chord_at(t)
        if c: cnt[c] = cnt.get(c, 0) + 1
    return max(cnt, key=cnt.get) if cnt else None


def midi(f): return 69 + 12 * np.log2(np.maximum(f, 1) / 440)


def stimme(k, thr=-42):
    f = d[k + '_f']; c = d[k + '_c']; r = d[k + '_r']
    v = (c < 0.25) & (r > thr) & (f > 70) & (f < 1000)
    m = midi(f); m[~v] = np.nan
    return m


def segmente(m, tol=0.5, minfr=5):
    """Töne: Läufe, deren Tonhöhe innerhalb tol um den laufenden Median bleibt."""
    out = []; i = 0; n = len(m)
    while i < n:
        if np.isnan(m[i]): i += 1; continue
        j = i; seg = [m[i]]
        while j + 1 < n and not np.isnan(m[j + 1]) and abs(m[j + 1] - np.median(seg[-10:])) < tol:
            j += 1; seg.append(m[j])
        if j - i + 1 >= minfr:
            out.append(dict(a=float(T[i] - 0.005), b=float(T[j] + 0.005), i0=i, i1=j, m=float(np.median(seg))))
        i = j + 1
    return out


def reibt(q, tones):
    """Nicht-Akkordton, der einen Halbton neben einem Akkordton liegt."""
    return (q % 12 not in tones) and any(((q - c) % 12) in (1, 11) for c in tones)


def dia_terz(p, up=True):
    sc = sorted(SCALE)
    pc = p % 12
    if pc not in SCALE: return None
    i = sc.index(pc)
    q = sc[(i + 2) % 7] if up else sc[(i - 2) % 7]
    iv = (q - pc) % 12 if up else -((pc - q) % 12)
    return iv


def ober_intervall(p, chord):
    tones = CH[chord]
    iv = dia_terz(p, True)
    if iv is None: return None, 'leiterfremd'
    q = p + iv
    if not reibt(q, tones) and ((q - p) % 12) != 6:
        return iv, 'Terz'
    for k in range(3, 8):                      # nächster Akkordton darüber, mind. kleine Terz
        if (p + k) % 12 in tones: return k, {5: 'Quarte', 7: 'Quinte', 3: 'Terz', 4: 'Terz', 6: 'Tritonus'}.get(k, str(k))
    return None, 'keiner'


def unter_intervall(p, chord):
    tones = CH[chord]
    iv = dia_terz(p, False)
    if iv is None: return None, 'leiterfremd'
    q = p + iv
    if not reibt(q, tones): return iv, 'Terz'
    for k in range(3, 8):
        if (p - k) % 12 in tones: return -k, 'Akkordton'
    return None, 'keiner'


# ---------- Fenster ----------
CHOR_FENSTER = [(62.9, 96.6), (126.9, 176.0), (222.9, 266.0)]          # Ober/Unter/Doppel: Refrains, Tag, Outro
GEGEN_FENSTER = [(62.5, 176.5), (191.0, 217.5), (221.8, 266.0)]        # Gegengesang: überall wo er singt, außer unter der Sprechstelle
OYE = (217.8, 221.6)


def im(t, fen): return any(a <= t < b for a, b in fen)


# ---------- Lead-Töne ----------
L = stimme('haupt')
lead_noten = []
for n in segmente(L, tol=0.5, minfr=4):
    m = n['m']; p = int(np.round(m))
    if p % 12 not in SCALE:
        c = [q for q in (p - 1, p + 1) if q % 12 in SCALE and abs(q - m) < 0.75]
        p = min(c, key=lambda q: abs(q - m)) if c else None
    lead_noten.append(dict(a=n['a'], b=n['b'], p=p, m=m, n=n['i1'] - n['i0'] + 1))

def zeitlinie(noten, key, default=0.0):
    """Pitchmap-Stützpunkte: Wechsel in der Mitte der Lücke (Lücke > 40 ms), sonst 10 ms vor dem nächsten Ton."""
    pts = [(0.0, default)]
    last = default; prev_end = 0.0
    for n in noten:
        v = n[key]
        if v is None: continue
        if v != last:
            gap = n['a'] - prev_end
            t = (prev_end + n['a']) / 2 if gap > 0.04 else n['a'] - 0.01
            pts.append((max(t, pts[-1][0] + 0.005), v)); last = v
        prev_end = n['b']
    return pts


def maske(noten, key, hand=0.08):
    """Gate-Bereiche: Töne mit gültigem Wert (inkl. Konsonanten-Rand)."""
    rng = []
    for n in noten:
        if n.get(key) is None: continue
        a, b = n['a'] - hand, n['b'] + hand
        if rng and a <= rng[-1][1] + 0.05: rng[-1][1] = max(rng[-1][1], b)
        else: rng.append([a, b])
    return rng


stat = {'ober': {}, 'unter': {}}
for n in lead_noten:
    mid = (n['a'] + n['b']) / 2
    n['akk'] = chord_note(n['a'], n['b'])
    n['ober'] = None; n['unter'] = None
    if not im(mid, CHOR_FENSTER) or n['akk'] is None or im(mid, [OYE]): continue
    if n['n'] < 6 or n['p'] is None:          # Gleitton/leiterfremd: kein eigener Wechsel
        n['ober'] = 'halten'; n['unter'] = 'halten' if n['akk'] == 'Ab/C' else None; continue
    iv, why = ober_intervall(n['p'], n['akk'])
    n['ober'] = iv; n['ober_why'] = why
    stat['ober'][why] = stat['ober'].get(why, 0) + 1
    if n['akk'] == 'Ab/C':
        iv2, why2 = unter_intervall(n['p'], n['akk'])
        n['unter'] = iv2; stat['unter'][why2] = stat['unter'].get(why2, 0) + 1
# „halten“ = Wert des Vorgängers
for key in ('ober', 'unter'):
    last = None
    for n in lead_noten:
        if n[key] == 'halten': n[key] = last
        elif n[key] is not None: last = n[key]
        else: last = None if key == 'unter' else last
    if key == 'ober':      # Rest ohne Vorgänger: Nachfolger
        nxt = None
        for n in reversed(lead_noten):
            if n[key] == 'halten' or (n[key] is None and nxt is not None and im((n['a']+n['b'])/2, CHOR_FENSTER) and not im((n['a']+n['b'])/2, [OYE]) and n.get('akk')):
                n[key] = nxt
            elif n[key] is not None: nxt = n[key]

ober_pm = zeitlinie(lead_noten, 'ober', 4)
unter_pm = zeitlinie(lead_noten, 'unter', -4)
ober_gate = maske([n for n in lead_noten if n['ober'] is not None], 'ober')
unter_gate = maske([n for n in lead_noten if n['unter'] is not None], 'unter', hand=0.06)

# ---------- Gegengesang ----------
G = stimme('gegen', -45)
g_noten = segmente(G, tol=0.5, minfr=6)
gstat = dict(toene=0, gestimmt=0, akkordton_statt=0, cents_vorher=[], cents_nachher=[], geaendert=[])
for n in g_noten:
    mid = (n['a'] + n['b']) / 2
    n['shift'] = None
    if not im(mid, GEGEN_FENSTER): continue
    akk = chord_note(n['a'], n['b'])
    m = n['m']; tgt = int(np.round(m))
    dev = m - tgt
    tones = CH[akk] if akk else None
    lang = (n['b'] - n['a']) >= 0.2
    grund = 'eigener Ton'
    if tgt % 12 not in SCALE:
        # leiterfremd (D, E, G, A, B): nächster Akkordton, sonst nächster Leiterton
        cands = [p for p in range(tgt - 2, tgt + 3) if tones and p % 12 in tones] or [p for p in range(tgt - 2, tgt + 3) if p % 12 in SCALE]
        tgt = min(cands, key=lambda p: abs(p - m)); grund = 'leiterfremd -> ' + NAMEPC[tgt % 12]
    elif tones and lang and abs(dev) > 0.35 and reibt(tgt, tones):
        cands = [p for p in range(tgt - 2, tgt + 3) if p % 12 in tones and abs(p - m) < 1.0]
        if cands:
            tgt = min(cands, key=lambda p: abs(p - m)); grund = 'zwischen -> Akkordton ' + NAMEPC[tgt % 12]
    sh = tgt - m
    n['tgt'] = tgt; n['akk'] = akk
    n['shift'] = round(float(sh), 3) if abs(sh) > 0.08 else 0.0
    gstat['toene'] += 1
    if abs(sh) > 0.08: gstat['gestimmt'] += 1
    if grund != 'eigener Ton':
        gstat['akkordton_statt'] += 1
        gstat['geaendert'].append(dict(t=round(n['a'], 2), von=round(m, 2), nach=NAMEPC[tgt % 12], akk=akk, grund=grund))
    gstat['cents_vorher'].append(abs(dev) * 100)
# Kurze Bruchstücke zwischen Tönen: Wert des Nachbarn
for k, n in enumerate(g_noten):
    if n['shift'] is None and im((n['a'] + n['b']) / 2, GEGEN_FENSTER):
        nb = g_noten[k - 1] if k > 0 else None
        n['shift'] = nb['shift'] if nb and nb.get('shift') is not None else 0.0
# Gleit-Bruchstücke (< 100 ms) bekommen die Verschiebung des anliegenden langen Tons (kein Sprung im Gleiten)
for k, n in enumerate(g_noten):
    if n['shift'] is None or (n['b'] - n['a']) >= 0.1: continue
    prv = next((g_noten[j] for j in range(k - 1, -1, -1) if (g_noten[j]['b'] - g_noten[j]['a']) >= 0.1), None)
    nxt = next((g_noten[j] for j in range(k + 1, len(g_noten)) if (g_noten[j]['b'] - g_noten[j]['a']) >= 0.1), None)
    cand = [x for x in (prv, nxt) if x is not None and x.get('shift') is not None and min(abs(x['a'] - n['b']), abs(n['a'] - x['b'])) < 0.06]
    if cand: n['shift'] = cand[0]['shift']
# Statistik wie CHOR.md: Töne >= 120 ms in R1
r1 = [n for n in g_noten if 63 <= n['a'] < 96 and n['b'] - n['a'] >= 0.12 and n.get('tgt') is not None]
gstat['R1_toene_120ms'] = len(r1)
gstat['R1_anders_als_eigener_halbton'] = sum(1 for n in r1 if n['tgt'] != int(np.round(n['m'])))
gstat['R1_zwischen_vorher'] = sum(1 for n in r1 if abs(n['m'] - np.round(n['m'])) > 0.35)
gegen_pm = zeitlinie(g_noten, 'shift', 0.0)
gstat['cents_vorher_median'] = float(np.median(gstat['cents_vorher'])); gstat['ueber35c_vorher'] = float(np.mean(np.array(gstat['cents_vorher']) > 35) * 100)
del gstat['cents_vorher'], gstat['cents_nachher']

# ---------- Doppel ----------
D = stimme('doppel')
d_noten = segmente(D, tol=0.5, minfr=5)
dstat = dict(toene=0, halbton_korrigiert=0, cents_korrigiert=0, stumm=0)
Lraw = L
for n in d_noten:
    mid = (n['a'] + n['b']) / 2
    n['shift'] = None; n['ok'] = False
    if not im(mid, CHOR_FENSTER) or im(mid, [OYE]): continue
    dstat['toene'] += 1
    lv = Lraw[n['i0']:n['i1'] + 1]; lv = lv[~np.isnan(lv)]
    dur = n['b'] - n['a']
    if len(lv) < 0.4 * (n['i1'] - n['i0'] + 1):
        # Lead singt hier kaum: kurze Überhänge behalten, längere Alleingänge stumm
        if dur < 0.25: n['shift'] = 0.0; n['ok'] = True
        else: dstat['stumm'] += 1
        continue
    lm = float(np.median(lv)); diff = lm - n['m']; lstd = float(np.std(lv))
    if dur < 0.12:
        n['shift'] = 0.0; n['ok'] = True; continue          # kurze Übergänge: natürlich lassen
    if abs(diff) > 2.5 or (abs(diff) > 0.5 and lstd > 0.6):
        dstat['stumm'] += 1; continue                          # anderer Ton / Lead wechselt: stumm
    if abs(diff) > 0.5: dstat['halbton_korrigiert'] += 1
    elif abs(diff) > 0.15: dstat['cents_korrigiert'] += 1
    n['shift'] = round(diff, 3) if abs(diff) > 0.15 else 0.0
    n['ok'] = True
doppel_pm = zeitlinie([n for n in d_noten if n['ok']], 'shift', 0.0)
doppel_gate = maske([n for n in d_noten if n['ok']], 'shift', hand=0.07)

# ---------- schreiben ----------
VORLAUF = 0.081   # rubberband R3 setzt Pitchmap-Wechsel 81 ms zu früh um (gemessen, konstant) -> ausgleichen


def pm_schreiben(name, pts, vorlauf=VORLAUF):
    with open(OUT + name, 'w') as f:
        for k, (t, v) in enumerate(pts): f.write('%d %.4f\n' % (0 if k == 0 else int(round((t + vorlauf) * SR)), v))

pm_schreiben('ober.txt', ober_pm, 0.0); pm_schreiben('unter.txt', unter_pm, 0.0)   # Zeitlinien (Versionen + Masken)
pm_schreiben('gegen.txt', gegen_pm); pm_schreiben('doppel.txt', doppel_pm)
ivz = {}
for n in lead_noten:
    if isinstance(n['ober'], int) and n['n'] >= 4: ivz[n['ober']] = ivz.get(n['ober'], 0) + n['n']
plan = dict(ober_gate=ober_gate, unter_gate=unter_gate, doppel_gate=doppel_gate,
            chor_fenster=CHOR_FENSTER, gegen_fenster=GEGEN_FENSTER, oye=OYE,
            stat_ober=stat['ober'], stat_unter=stat['unter'], ober_intervalle_frames=ivz,
            gegen=gstat, doppel=dstat, n_lead_noten=len(lead_noten))
json.dump(plan, open(OUT + 'plan.json', 'w'), indent=1)
print(json.dumps({k: v for k, v in plan.items() if k not in ('ober_gate', 'unter_gate', 'doppel_gate','gegen')}))
print({k:v for k,v in gstat.items() if k!='geaendert'})
import collections; print(collections.Counter((g['akk'],g['nach']) for g in gstat['geaendert']))
print('Pitchmap-Punkte: ober', len(ober_pm), 'unter', len(unter_pm), 'gegen', len(gegen_pm), 'doppel', len(doppel_pm))

# --- Diagnose Doppel ---
if __name__ == '__main__' and os.environ.get('DIAG'):
    rows = []
    for n in d_noten:
        mid = (n['a'] + n['b']) / 2
        if not im(mid, CHOR_FENSTER) or im(mid, [OYE]): continue
        lv = L[n['i0']:n['i1'] + 1]; ok = ~np.isnan(lv)
        if ok.mean() < 0.4: continue
        lvv = lv[ok]
        rows.append((n['b'] - n['a'], np.median(lvv) - n['m'], np.std(lvv), (lvv - n['m']).min(), (lvv - n['m']).max(), n['a']))
    rows = np.array(rows)
    for lo, hi in [(-3, -1.5), (-1.5, -0.5), (-0.5, -0.15), (-0.15, 0.15), (0.15, 0.5), (0.5, 1.5), (1.5, 3)]:
        m = (rows[:, 1] >= lo) & (rows[:, 1] < hi)
        print('diff %5.2f..%5.2f: Töne %3d  Dauer %.1f s  std-Lead %.2f' % (lo, hi, m.sum(), rows[m, 0].sum(), np.median(rows[m, 2]) if m.any() else 0))
    m = (np.abs(rows[:, 1]) > 0.5)
    for r in rows[m][:25]: print('  t=%.2f dur=%.2f diff=%.2f leadstd=%.2f min=%.2f max=%.2f' % (r[5], r[0], r[1], r[2], r[3], r[4]))
