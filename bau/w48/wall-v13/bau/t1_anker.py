# Schritt 1: Anker in den Quellen messen (gleiche Messdefinition wie die Zielkarte, zk_kern).
#   Haupt: Quelle v7 (24 bit trocken gestimmt). Hinweis = DTW Original->v7, dann ±50 ms nachmessen.
#   Doppel: Quelle doppel_t (v12-Doppel, v7-Zeit). Hinweis = DTW Doppel-Original->v12-Doppel.
#   Gegenprobe: Versatz der Silbe per Hüllkurven-Korrelation (Original gegen Quelle, ±80 ms).
import json, numpy as np
from tgemein import *
from zk_kern import nah, staerkster, M
from zk_gemein import bp, env_db

H7 = lade_wav(QUELLE['H_v7']); DT = lade_wav(QUELLE['D_t'])
HR = lade_wav(QUELLE['H_roh']); DR = lade_wav(R + 'original/Doppel-Platzhalter-4.wav')
d_h7 = dtw('H_roh', 'H_v7'); d_d12 = dtw('D_roh', 'D_v12')


def env_off(xa, xb, ta, tb_hint, w0, w1, maxlag=0.08):
    """Versatz (s) von xb gegen xa: Fenster [ta+w0, ta+w1] in xa, gesucht um tb_hint in xb (Hülle 120–1800 Hz + 3–9 kHz, 1 ms)."""
    def hull(x, t0, t1):
        a = int((t0 - .05) * SR); b = int((t1 + .05) * SR)
        s = np.asarray(x[a:b]); e1 = env_db(bp(s, 120, 1800), 5, 1); e2 = env_db(bp(s, 3000, 9000), 5, 1)
        return np.maximum(e1, -80), np.maximum(e2, -80), a / SR
    A1, A2, oa = hull(xa, ta + w0, ta + w1)
    i0 = int(round((ta + w0 - oa) * 1000)); i1 = int(round((ta + w1 - oa) * 1000))
    a1, a2 = A1[i0:i1], A2[i0:i1]
    B1, B2, ob = hull(xb, tb_hint + w0 - maxlag, tb_hint + w1 + maxlag)
    best = None
    for L in range(-int(maxlag * 1000), int(maxlag * 1000) + 1):
        j0 = int(round((tb_hint + w0 - ob) * 1000)) + L
        if j0 < 0 or j0 + len(a1) > len(B1): continue
        b1, b2 = B1[j0:j0 + len(a1)], B2[j0:j0 + len(a1)]
        c = np.corrcoef(a1, b1)[0, 1] + 0.5 * np.corrcoef(a2, b2)[0, 1]
        if best is None or c > best[0]: best = (c, L)
    return (tb_hint - ta) + best[1] / 1000, best[0] / 1.5


out = []
for s in ZK['silben']:
    src = H7 if s['stimme'] == 'haupt' else DT
    roh = HR if s['stimme'] == 'haupt' else DR
    hint = float(d_h7(s['t_orig'])) if s['stimme'] == 'haupt' else float(d_d12(s['t_orig']))
    akz = s.get('erster_einsatz_t') is not None and s['stimme'] == 'haupt'
    if akz:
        r = staerkster(src, hint - 0.07, hint + 0.07) or nah(src, hint, half=0.05)
    else:
        r = nah(src, hint, half=0.05)
    # Hüllkurven-Gegenprobe: Fenster Anlaut-Beginn .. Spitze+80 ms
    w0 = min(-0.04, s['konsonant_s'] - s['t_orig'] - 0.02); w1 = 0.08
    off, c = env_off(roh, src, s['t_orig'], hint, w0, w1)
    e = dict(id=s['id'], stimme=s['stimme'], text=s['text'], t_orig=s['t_orig'], kons_orig=s['konsonant_s'], ziel_t=s['ziel_t'],
             hint=round(hint, 4), q_spitze=r['spitze_t'], q_kons=r['konsonant_s'], q_vokal=r['vokal_t'], q_sicher=r['sicher'],
             env_spitze=round(s['t_orig'] + off, 4), env_corr=round(float(c), 3),
             vorlauf_orig_ms=round((s['t_orig'] - s['konsonant_s']) * 1000), vorlauf_q_ms=round((r['spitze_t'] - r['konsonant_s']) * 1000))
    if akz:
        e['erst_orig'] = s['erster_einsatz_t']
    e['diff_ms'] = round((e['q_spitze'] - e['env_spitze']) * 1000)
    out.append(e)
    print('%-6s %-7s orig %.3f hint %.3f q %.3f env %.3f (c %.2f) diff %+4d  vorlauf orig %4d q %4d' % (
        e['id'], e['text'], e['t_orig'], hint, e['q_spitze'], e['env_spitze'], c, e['diff_ms'], e['vorlauf_orig_ms'], e['vorlauf_q_ms']), flush=True)
json.dump(out, open(TC + 'anker_roh.json', 'w'), indent=0, ensure_ascii=False)
