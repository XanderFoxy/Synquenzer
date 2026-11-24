# The Wall v13 – Messung des neuen Timings (vorher v12 / nachher v13). Schreibt analyse/timing_mess.json.
#   Zwei unabhängige Messungen je Silbe:
#     det = Einsatz-Detektor der Zielkarte (zk_kern.nah / staerkster) – dieselbe Definition wie t_orig/t_v12 der Zielkarte
#     env = Hüllkurven-Ausrichtung gegen E5 trocken (Original-Lage): t = t_orig + Versatz der ganzen Silben-Einschwingphase
import json, numpy as np, sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from tgemein import *
from zk_kern import nah, staerkster
from t2_hilfe import ausrichten
from t_onset import onset_versatz
from t_warp import quelle_zu_ziel, rendern, SR as _SR
from zk_gemein import bp, env_db

L13 = lade_wav(ST13 + 'lead.wav'); D13 = lade_wav(ST13 + 'doppel.wav')
E = lade_npy('ende'); O = lade_npy('original'); D12 = lade_wav(QUELLE['D_t'])
PL = json.load(open(TC + 'bau_plan.json'))
kmH = np.load(TC + 'karte_H.npy'); kmD = np.load(TC + 'karte_D.npy')
ZKH = {s['id']: s for s in ZK['silben'] if s['stimme'] == 'haupt'}
H = {a['id']: a for a in PL['H']}
S16 = 0.125
M = dict()


def r16(t):
    tk = int(np.floor(t / 2.0 + 1e-9)) + 1
    return 'T%d+%.2f' % (tk, (t - (tk - 1) * 2.0) / S16)


def stat(v):
    v = np.abs(np.asarray([x for x in v if x is not None and not np.isnan(x)], float))
    return dict(n=int(len(v)), median_ms=round(float(np.median(v)), 1), p95_ms=round(float(np.percentile(v, 95)), 1), max_ms=round(float(v.max()), 1),
                ueber_30ms=int((v > 30).sum()), ueber_60ms=int((v > 60).sum()))


# ---------------- 1. Haupt je Silbe ----------------
rows = []
for k, a in H.items():
    z = ZKH[k]
    hint13 = quelle_zu_ziel(kmH, [int(round(a['src_peak'] * SR))])[0] / SR
    if a['akzent']:
        d13 = staerkster(L13, hint13 - 0.06, hint13 + 0.06) or nah(L13, hint13, half=0.05)
    else:
        d13 = nah(L13, hint13, half=0.05)
    w0 = z['konsonant_s'] - 0.03; w1 = z['t_orig'] + 0.08
    if w1 - w0 < 0.14: w0 = w1 - 0.14
    o13, c13, _, _ = ausrichten(O, L13, w0, w1, hint13 - z['t_orig'], 0.05)
    t12 = z['t_v12']
    if t12 is not None:
        o12, c12, _, _ = ausrichten(O, E, w0, w1, t12 - z['t_orig'], 0.05)
    else:
        o12, c12 = np.nan, np.nan
    r = dict(id=k, text=a['text'], teil=a['teil'], zeile=a['zeile'], t_orig=z['t_orig'], ziel_zk=z['ziel_t'], ziel_v13=a['tgt_peak'],
             v12_det=t12, v12_env=round(z['t_orig'] + o12, 4) if t12 is not None else None, v12_env_r=round(float(c12), 3) if t12 is not None else None,
             v13_plan=round(hint13, 4), v13_det=d13['spitze_t'], v13_env=round(z['t_orig'] + o13, 4), v13_env_r=round(float(c13), 3))
    for nm in ('v12_det', 'v12_env', 'v13_det', 'v13_env', 'v13_plan'):
        r['f_' + nm] = round((r[nm] - r['ziel_zk']) * 1000, 1) if r[nm] is not None else None
    for nm in ('v13_det', 'v13_env', 'v13_plan'):
        r['f13z_' + nm] = round((r[nm] - r['ziel_v13']) * 1000, 1)
    rows.append(r)
rows.sort(key=lambda r: r['t_orig'])
M['haupt_silben'] = rows
M['haupt_zusammenfassung'] = {
    'gegen_zielkarte': {nm: stat([r['f_' + nm] for r in rows]) for nm in ('v12_det', 'v12_env', 'v13_det', 'v13_env', 'v13_plan')},
    'gegen_v13_ziel': {nm: stat([r['f13z_' + nm] for r in rows]) for nm in ('v13_det', 'v13_env', 'v13_plan')},
    'hinweis': 'det = Detektor der Zielkarte (gleiche Definition wie t_v12), env = Hüllkurven-Ausrichtung gegen E5 trocken; '
               'v13_plan = Lage laut Bau (Zeitkarte, ohne Messung). v13_ziel = Zielkarte mit 3 begründeten Ausnahmen (ti 27, world 17, so 17).'}

# ---------------- 2. Die zwei Zeilen ----------------
def zeile(ids):
    out = []
    for r in rows:
        if r['id'] in ids:
            out.append(dict(silbe=r['text'], id=r['id'], original=r['t_orig'], original_raster=r16(r['t_orig']),
                            v12=r['v12_det'], v12_raster=r16(r['v12_det']), v12_env=r['v12_env'],
                            v13=r['v13_det'], v13_raster=r16(r['v13_det']), v13_env=r['v13_env'],
                            ziel=r['ziel_v13'], ziel_raster=r16(r['ziel_v13']), ziel_zielkarte=r['ziel_zk'],
                            v12_fehler_ms=r['f_v12_det'], v13_fehler_ms=r['f13z_v13_det'], v13_fehler_env_ms=r['f13z_v13_env']))
    return out
M['zeile_there_is_so_much_more_to_see'] = zeile(['H-055', 'H-056', 'H-057', 'H-058', 'H-059', 'H-060', 'H-061'])
M['zeile_are_we_hypnotised'] = zeile(['H-062', 'H-063', 'H-064', 'H-065', 'H-065b', 'H-066'])
M['zeile_in_a_world_of_sheep'] = zeile(['H-012', 'H-013', 'H-014', 'H-015', 'H-016'])
M['zeile_everything_we_do_believe'] = zeile(['H-017', 'H-018', 'H-019', 'H-020', 'H-021', 'H-022', 'H-023'])


# ---------------- 3. Länge des s in „see“ ----------------
def s_laenge(x, t0, t1):
    a = int(t0 * SR); b = int(t1 * SR); s = x[a:b]
    V = env_db(bp(s, 120, 1800), 10, 2.5); Hh = env_db(bp(s, 3000, 9000), 10, 2.5)
    t = t0 + (np.arange(len(V)) + 0.5) * 0.0025
    zisch = (Hh - V > -3) & (Hh > Hh.max() - 30)
    # längster Zischlaut-Lauf
    d = np.diff(np.concatenate([[0], zisch.astype(int), [0]])); st = np.where(d == 1)[0]; en = np.where(d == -1)[0]
    # kurze Lücken (<= 10 ms) schließen
    runs = []
    for s_, e_ in zip(st, en):
        if runs and s_ - runs[-1][1] <= 4: runs[-1][1] = e_
        else: runs.append([s_, e_])
    s_, e_ = max(runs, key=lambda r: r[1] - r[0])
    # Vokal-Einsatz: erster Rahmen nach dem s, in dem V 25 dB über dem s-Minimum liegt und weiter steigt
    vmax = V[e_:].max()
    kv = e_ + int(np.argmax(V[e_:] > vmax - 12))
    return dict(s_beginn=round(float(t[s_]), 3), s_ende=round(float(t[e_ - 1]), 3), s_dauer_ms=round(float((e_ - s_) * 2.5), 1),
                vokal_einsatz=round(float(t[kv]), 3))


M['see_s'] = dict(original_E5=s_laenge(O, 109.40, 110.25), v12=s_laenge(E, 109.40, 110.40), v13=s_laenge(L13, 109.40, 110.25),
                  hinweis='s = längster Bereich, in dem 3–9 kHz lauter ist als 120–1800 Hz (−3 dB), 10-ms-Hülle; Vokal = V erreicht max−12 dB')

# ---------------- 4. Dehnfaktoren und Spleiße ----------------
def verteilung(f):
    f = np.asarray(f); kanten = [0.8, 0.85, 0.9, 0.95, 0.99, 1.01, 1.05, 1.1, 1.15, 1.2, 1.25001]
    h, _ = np.histogram(f, kanten)
    return dict(n=int(len(f)), min=round(float(f.min()), 3), max=round(float(f.max()), 3), median=round(float(np.median(f)), 3),
                ausserhalb_0_8_1_25=int(((f < 0.7995) | (f > 1.2505)).sum()),
                histogramm={'%.2f–%.2f' % (kanten[i], min(kanten[i + 1], 1.25)): int(h[i]) for i in range(len(h))})


def abschnitte(seg):
    arten = dict(schieben=0, pause=0, vokal=0, atem=0, verschluss=0)
    for l in seg:
        if l.get('art') == 'schieben': arten['schieben'] += 1
        for o in l.get('ops', []): arten[o[0]] = arten.get(o[0], 0) + 1
    rest = np.array([l['rest_ms'] for l in seg])
    ung = [dict(abschnitt=l['name'], fehlend_ms=l['ungedeckt_ms'], delta_ms=round(l['delta_ms'], 1)) for l in seg if abs(l['ungedeckt_ms']) > 5]
    return dict(abschnitte=len(seg), operationen=arten, rest_ms_median=round(float(np.median(np.abs(rest))), 2),
                rest_ms_p95=round(float(np.percentile(np.abs(rest), 95)), 2), nicht_erreichbar=ung)


def spl_stat(spl):
    k = np.array([s['korr'] for s in spl]); lg = np.array([s['lag_ms'] for s in spl]); X = np.array([s['blende_ms'] for s in spl])
    return dict(anzahl=len(spl), wiederholt=sum(s['richtung'] == 'wiederholt' for s in spl), ausgelassen=sum(s['richtung'] == 'ausgelassen' for s in spl),
                sprung_ms=dict(median=round(float(np.median(lg)), 2), max=round(float(lg.max()), 2)),
                korrelation=dict(median=round(float(np.median(k)), 3), p5=round(float(np.percentile(k, 5)), 3), min=round(float(k.min()), 3), unter_0_8=int((k < 0.8).sum())),
                blende_ms=dict(min=round(float(X.min()), 1), max=round(float(X.max()), 1)))


M['dehnung'] = dict(haupt=verteilung(PL['fH']), doppel=verteilung(PL['fD']), haupt_abschnitte=abschnitte(PL['segH']), doppel_abschnitte=abschnitte(PL['segD']),
                    haupt_spleisse=spl_stat(PL['splH']), doppel_spleisse=spl_stat(PL['splD']))


# ---------------- 5. Klick-Probe an den Spleißen ----------------
def klick_probe(x, km, spl):
    from scipy.signal import butter, sosfiltfilt
    h = sosfiltfilt(butter(4, 6000, 'highpass', fs=SR, output='sos'), x)
    def q(c):
        a = h[c - 72:c + 72]; u = np.concatenate([h[c - 960:c - 240], h[c + 240:c + 960]])
        return 10 * np.log10((np.mean(a * a) + 1e-14) / (np.median(u * u) + 1e-14))
    wert = []
    for s in spl:
        c = int(quelle_zu_ziel(km, [int(s['t'] * SR)])[0])
        if 960 < c < len(x) - 960: wert.append(q(c))
    rng = np.random.default_rng(1)
    akt = np.where(rms_frames(x, 480, 480) > -35)[0] * 480
    ref = [q(int(c)) for c in rng.choice(akt, 400) if 960 < c < len(x) - 960]
    w = np.array(wert); r = np.array(ref)
    return dict(spleisse=dict(median_db=round(float(np.median(w)), 2), p95_db=round(float(np.percentile(w, 95)), 2), max_db=round(float(w.max()), 2)),
                zufall_stimmhaft=dict(median_db=round(float(np.median(r)), 2), p95_db=round(float(np.percentile(r, 95)), 2), max_db=round(float(r.max()), 2)),
                hinweis='HF-Energie (>6 kHz) in ±1,5 ms um die Spleiß-Stelle gegen den Median der Umgebung (±5–20 ms); Vergleich mit zufälligen lauten Stellen')


M['klick_probe'] = dict(haupt=klick_probe(L13, kmH, PL['splH']), doppel=klick_probe(D13, kmD, PL['splD']))

# ---------------- 6. Bitgleichheit der starren Bereiche (Warp allein, ohne Reinigung/Begrenzer) ----------------
H7 = lade_wav(QUELLE['H_v7'])
stueH = np.load(TC + 'stuecke_H.npy')
w7 = rendern(H7, [tuple(s) for s in stueH], N)
gleich = 0; ges = 0
for a in PL['H']:
    s0 = int(round(a['src_kons'] * SR)); s1 = int(round((a['src_peak'] + 0.025) * SR))
    t0 = int(quelle_zu_ziel(kmH, [s0])[0]); L = s1 - s0
    eq = (w7[t0:t0 + L] == H7[s0:s0 + L])
    gleich += int(eq.sum()); ges += L
M['bitgleich_anlaut'] = dict(anteil=round(gleich / ges, 5), samples=ges,
                            hinweis='Anlaut (Konsonant bis Spitze + 25 ms) im reinen Warp (v7 -> Zielzeit) Sample für Sample gleich der Quelle')
del w7, H7

# ---------------- 7. Doppel gegen Haupt ----------------
def doppel_gegen_haupt(LH, LD, ereignisse):
    out = []
    for k, ev in ereignisse:
        c = nah(LD, ev, half=0.10, strafe=2.0)
        Lo, cE, cE2 = onset_versatz(LH, LD, ev)
        oA, cA, _, _ = ausrichten(LH, LD, ev - 0.10, ev + 0.08, 0.0, 0.12)
        kand = {}
        if cA >= 0.75: kand['A'] = oA
        if c['sicher'] >= 0.8 and c['anstieg_db'] >= 6: kand['C'] = c['spitze_t'] - ev
        if cE >= 0.65 and (np.isnan(cE2) or cE - cE2 >= 0.05): kand['E'] = Lo
        best = []
        for nm, v in kand.items():
            grp = [n2 for n2, v2 in kand.items() if abs(v2 - v) <= 0.020]
            if len(grp) > len(best): best = grp
        off = float(np.median([kand[n] for n in best])) * 1000 if len(best) >= 2 else None
        out.append(dict(id=k, versatz_ms=None if off is None else round(off, 1), messungen={n: round(v * 1000) for n, v in kand.items()}))
    return out


refr = [r for r in rows if r['teil'] in ('R1', 'R2', 'R3', 'Tag', 'Out')]
dd13 = doppel_gegen_haupt(L13, D13, [('D-' + r['id'][2:], r['v13_plan']) for r in refr])
dd12 = doppel_gegen_haupt(E, D12, [('D-' + r['id'][2:], r['v12_det']) for r in refr if r['v12_det'] is not None])


def dstat(dd):
    v = np.array([d['versatz_ms'] for d in dd if d['versatz_ms'] is not None])
    return dict(gemessen=int(len(v)), von=len(dd), median_ms=round(float(np.median(v)), 1), mittel_abs_ms=round(float(np.mean(np.abs(v))), 1),
                frueher_als_haupt=int((v < 0).sum()), frueher_als_minus10=int((v < -10).sum()), im_fenster_0_20=int(((v >= 0) & (v <= 20)).sum()),
                im_fenster_5_15=int(((v >= 5) & (v <= 15)).sum()), ueber_30=int((np.abs(v) > 30).sum()))


anker_ids = {a['id'] for a in PL['D']}
M['doppel_gegen_haupt'] = dict(v12=dstat(dd12), v13=dstat(dd13),
                               v13_verankert=dstat([d for d in dd13 if d['id'] in anker_ids]),
                               v13_frei=dstat([d for d in dd13 if d['id'] not in anker_ids]),
                               einzeln_v13=dd13, einzeln_v12=dd12,
                               hinweis='Refrain/Tag/Outro; Versatz = Doppel minus Haupt (positiv = Doppel später). Wert nur, wenn 2 von 3 Messungen '
                                       '(Hüllkurve, Einsatz-Detektor, Onset-Stärke) auf ±20 ms übereinstimmen. Messgenauigkeit ±10 ms.')

# ---------------- 8. Raster allgemein (ohne Ziel): Abstand zum nächsten 16tel ----------------
def raster_abstand(ts):
    v = np.array([t for t in ts if t is not None]); d = (v / S16 - np.round(v / S16)) * S16 * 1000
    return dict(median_abs_ms=round(float(np.median(np.abs(d))), 1), p95_abs_ms=round(float(np.percentile(np.abs(d), 95)), 1))


M['raster_abstand'] = dict(original=raster_abstand([r['t_orig'] for r in rows]), v12=raster_abstand([r['v12_det'] for r in rows]),
                           v13=raster_abstand([r['v13_det'] for r in rows]))
M['bau'] = PL['log']
json.dump(M, open(A13 + 'timing_mess.json', 'w'), indent=1, ensure_ascii=False, default=float)
print(json.dumps({k: v for k, v in M.items() if k in ('haupt_zusammenfassung', 'see_s', 'bitgleich_anlaut', 'raster_abstand')}, indent=1, ensure_ascii=False))
print(json.dumps(M['dehnung'], indent=1, ensure_ascii=False)[:2500])
print(json.dumps(M['klick_probe'], indent=1))
print(json.dumps({k: v for k, v in M['doppel_gegen_haupt'].items() if not k.startswith('einzeln')}, indent=1, ensure_ascii=False))
for nm in ('zeile_there_is_so_much_more_to_see', 'zeile_are_we_hypnotised'):
    print(nm)
    for z in M[nm]: print('  %-6s orig %s  v12 %s (%+.0f)  v13 %s (%+.0f / env %+.0f)  Ziel %s' % (z['silbe'], z['original_raster'], z['v12_raster'], z['v12_fehler_ms'], z['v13_raster'], z['v13_fehler_ms'], z['v13_fehler_env_ms'], z['ziel_raster']))
