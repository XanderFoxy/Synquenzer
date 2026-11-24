# Schritt 2: Quell-Anker über Hüllkurven-Ausrichtung (statt Einzel-Detektor).
#   Haupt: Referenz = E5 trocken (wall/roh/original.npy, gleiche Zeitlage wie die Rohaufnahme, gemessen ±1 ms)
#          gegen v7 (24 bit). Versatz je Silbe -> Quell-Spitze = t_orig + Versatz, Quell-Anlaut = konsonant_s + Versatz.
#   Doppel: (a) Doppel-Rohaufnahme (nass) gegen doppel_t, (b) Gegenprobe v7-Haupt gegen doppel_t.
import json, numpy as np
from tgemein import *
from zk_gemein import bp, env_db

H7 = lade_wav(QUELLE['H_v7']); DT = lade_wav(QUELLE['D_t']); O = lade_npy('original')
DR = lade_wav(R + 'original/Doppel-Platzhalter-4.wav')
d_h7 = dtw('H_roh', 'H_v7'); d_d12 = dtw('D_roh', 'D_v12')


def hull(x, t0, t1):
    a = int((t0 - .01) * SR); b = int((t1 + .01) * SR)
    s = np.asarray(x[max(0, a):b])
    e1 = np.maximum(env_db(bp(s, 120, 1800), 6, 1), -75); e2 = np.maximum(env_db(bp(s, 3000, 9000), 6, 1), -85)
    return e1, e2, max(0, a) / SR


def ausrichten(xa, xb, w0, w1, mitte, such):
    """bester Versatz L (s) so dass xb(t+L) ~ xa(t) im Fenster [w0,w1]; L in [mitte-such, mitte+such]."""
    A1, A2, oa = hull(xa, w0, w1)
    i0 = int(round((w0 - oa) * 1000)); n = int(round((w1 - w0) * 1000))
    a1, a2 = A1[i0:i0 + n], A2[i0:i0 + n]
    B1, B2, ob = hull(xb, w0 + mitte - such, w1 + mitte + such)
    res = []
    for L in range(int((mitte - such) * 1000), int((mitte + such) * 1000) + 1):
        j0 = int(round((w0 + L / 1000 - ob) * 1000))
        if j0 < 0 or j0 + n > len(B1): continue
        b1, b2 = B1[j0:j0 + n], B2[j0:j0 + n]
        c1 = np.corrcoef(a1, b1)[0, 1]; c2 = np.corrcoef(a2, b2)[0, 1]
        res.append((np.nan_to_num(c1) + 0.6 * np.nan_to_num(c2), L))
    res.sort(reverse=True)
    c, L = res[0]
    # Eindeutigkeit: bester Wert mit > 25 ms Abstand
    zweit = next((r for r in res if abs(r[1] - L) > 25), (np.nan, 0))
    return L / 1000, c / 1.6, zweit[0] / 1.6, zweit[1] / 1000


H = {s['id']: s for s in ZK['silben'] if s['stimme'] == 'haupt'}
out = {}
for s in ZK['silben']:
    if s['stimme'] == 'haupt':
        w0 = s['konsonant_s'] - 0.03; w1 = s['t_orig'] + 0.08
        if w1 - w0 < 0.14: w0 = w1 - 0.14
        k7 = s['herkunft']['kette_ms'].get('v7', 0) / 1000
        dt_ = float(d_h7(s['t_orig'])) - s['t_orig']
        # grob: ±200 ms um 0 mit längerem Fenster, fein: ±40 ms
        Lg, cg, _, _ = ausrichten(O, H7, w0 - 0.15, w1 + 0.15, 0.0, 0.22)
        L, c, c2, L2 = ausrichten(O, H7, w0, w1, Lg, 0.04)
        e = dict(id=s['id'], stimme='haupt', text=s['text'], t_orig=s['t_orig'], kons_orig=s['konsonant_s'], ziel_t=s['ziel_t'],
                 off=round(L, 4), corr=round(c, 3), off_grob=round(Lg, 4), corr_grob=round(cg, 3), zweit=(round(c2, 3), round(L2, 4)),
                 kette_v7=k7, dtw_v7=round(dt_, 4))
        e['q_spitze'] = round(s['t_orig'] + L, 4); e['q_kons'] = round(s['konsonant_s'] + L, 4)
    else:
        hid = 'H-' + s['id'][2:]; h = H[hid]
        w0 = s['konsonant_s'] - 0.03; w1 = s['t_orig'] + 0.08
        if w1 - w0 < 0.14: w0 = w1 - 0.14
        dt_ = float(d_d12(s['t_orig'])) - s['t_orig']
        Lg, cg, _, _ = ausrichten(DR, DT, w0 - 0.15, w1 + 0.15, 0.0, 0.22)
        L, c, c2, L2 = ausrichten(DR, DT, w0, w1, Lg, 0.04)
        e = dict(id=s['id'], stimme='doppel', text=s['text'], t_orig=s['t_orig'], kons_orig=s['konsonant_s'], ziel_t=s['ziel_t'],
                 off=round(L, 4), corr=round(c, 3), off_grob=round(Lg, 4), corr_grob=round(cg, 3), zweit=(round(c2, 3), round(L2, 4)),
                 dtw_v12=round(dt_, 4))
        e['q_spitze'] = round(s['t_orig'] + L, 4); e['q_kons'] = round(s['konsonant_s'] + L, 4)
    out[s['id']] = e
# Gegenprobe Doppel gegen Haupt (beide trocken, Quellzeiten)
for s in ZK['silben']:
    if s['stimme'] != 'doppel': continue
    e = out[s['id']]; h = out['H-' + s['id'][2:]]
    w0 = h['q_kons'] - 0.03; w1 = h['q_spitze'] + 0.08
    if w1 - w0 < 0.14: w0 = w1 - 0.14
    mitte = (e['q_spitze'] - h['q_spitze'])
    L, c, _, _ = ausrichten(H7, DT, w0, w1, mitte, 0.06)
    e['gg_haupt_off'] = round(L, 4); e['gg_haupt_corr'] = round(c, 3)
    e['d_minus_h_q'] = round(mitte, 4)
json.dump(out, open(TC + 'anker2.json', 'w'), indent=0, ensure_ascii=False)
for k, e in out.items():
    print('%-7s %-6s off %+.3f c %.2f | grob %+.3f c %.2f | zweit %s | %s' % (k, e['text'], e['off'], e['corr'], e['off_grob'], e['corr_grob'], e['zweit'],
          ('k7 %+.3f dtw %+.3f' % (e['kette_v7'], e['dtw_v7'])) if e['stimme'] == 'haupt' else ('dtw %+.3f  D-H(q) %+.3f gg %+.3f c %.2f' % (e['dtw_v12'], e['d_minus_h_q'], e['gg_haupt_off'], e['gg_haupt_corr']))))
