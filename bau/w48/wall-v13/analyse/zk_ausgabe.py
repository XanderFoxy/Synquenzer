# Schreibt analyse/zielkarte.json (+ Rohdaten für die .md). Alle Zeiten in Sekunden auf der Song-Zeitachse (Takt 1 = 0 s).
import json, numpy as np
from zk_gemein import *
from zk_kern import nah
AKZ = ('011', '061', '048', '098', '154', '148')


def ende_von_roh(r):
    best = None
    for a0, a1, r0, r1 in LIED['karte']:
        if r1 > r0 and r0 <= r < r1:
            a = a0 + (r - r0) * (a1 - a0) / (r1 - r0)
            if best is None or abs(a - r) < abs(best - r): best = a
    return best if best is not None else r

F = json.load(open(CACHE + 'final_mess.json'))
Z = json.load(open(CACHE + 'ziele.json'))
SIL = {L['id']: L for L in F['silben']}
ZIEL = Z['ZIEL']
TEIL = {}
for a in LIED['abschnitte']:
    for z in a['zeilen']: TEIL[z] = a['kurz']
ZTEXT = {i: z['text'] for i, z in enumerate(LIED['zeilen'])}


def tz(takt): return (takt - 1) * TAKT


def r3(x): return None if x is None else round(float(x), 3)


def rstr(t):
    tk, p = raster16(t)
    return 'T%d+%.2f' % (tk, p)


# Nummer der Silbe in ihrer Zeile (1-basiert, „ti“ eingeschoben)
nr = {}
for L in F['silben']:
    z = L['zeile']; nr.setdefault(z, 0); nr[z] += 1; L['nr'] = nr[z]

# Direkte Nachmessung in v6/v7/v10 (Haupt) für die Herkunft der v12-Fehler
for L in F['silben']:
    h = L['H_roh']; L['stufen'] = {}
    if L['id'] in AKZ:   # Akzent-Silben: Herkunft am ersten Vokal-Einsatz messen (der wurde verschoben/ersetzt)
        L['erst_roh'] = nah(lade('H_roh'), h['erst_t'], half=0.02)
        L['erst_v12'] = nah(lade('H_v12'), ende_von_roh(h['erst_t']), half=0.05)
        for nm, key in (('H_v6', 'v6'), ('H_v7', 'v7'), ('H_v10', 'v10')):
            L['stufen'][key] = nah(lade(nm), h['erst_t'], half=0.2, strafe=1.0)['spitze_t']
        continue
    for nm, key in (('H_v6', 'v6'), ('H_v7', 'v7'), ('H_v10', 'v10')):
        r = nah(lade(nm), h['spitze_t'] + L['hist'][key] / 1000.0, half=0.05)
        L['stufen'][key] = r['spitze_t']


def herkunft(L):
    h = L['H_roh']['spitze_t']; st = L['stufen']; v12 = L['H_v12']['spitze_t']
    if L['id'] in AKZ: h = L['erst_roh']['spitze_t']; v12 = L['erst_v12']['spitze_t']
    kette = [('Original', h), ('v6', st['v6']), ('v7', st['v7']), ('v10', st['v10']), ('v12', v12)]
    schritte = [(kette[k + 1][0], (kette[k + 1][1] - kette[k][1]) * 1000) for k in range(4)]
    gross = [(n, round(d)) for n, d in schritte if abs(d) >= 35]
    return dict(kette_ms={n: round((t - h) * 1000) for n, t in kette[1:]}, sprung=gross)


silben = []
for L in F['silben']:
    i = L['id']; zl = ZIEL[i]
    h = L['H_roh']; h12 = L['H_v12']; d = L['D_roh']; d12 = L['D_v12']
    ziel_h = tz(zl['takt']) + zl['platz'] * S16
    versch = ziel_h - h['spitze_t']
    akz = i in ('011', '061', '048', '098', '154', '148')
    teil = TEIL[L['zeile']]
    eintrag = dict(id='H-' + i, stimme='haupt', teil=teil, zeile=L['zeile'], zeile_text=ZTEXT[L['zeile']], nr=L['nr'], text=L['text'],
                   t_orig=r3(h['spitze_t']), t_v12=r3(h12['spitze_t']), ziel_t=r3(ziel_h),
                   raster16=dict(takt=int(raster16(ziel_h)[0]), sechzehntel=int(round(raster16(ziel_h)[1])) % 16,
                                 bezug='T%d' % zl['takt'], platz_im_bezug=zl['platz'], text=rstr(ziel_h)),
                   raster16_orig=rstr(h['spitze_t']), raster16_v12=rstr(h12['spitze_t']),
                   abw_v12_ms=round((h12['spitze_t'] - h['spitze_t']) * 1000), abw_v12_ziel_ms=round((h12['spitze_t'] - ziel_h) * 1000),
                   verschiebung_ms=round(versch * 1000), quelle_regel=zl['regel'],
                   konsonant_s=r3(h['konsonant_s']), vokal_t=r3(h['vokal_t']), vorlauf_ms=round((h['spitze_t'] - h['konsonant_s']) * 1000),
                   ziel_konsonant_s=r3(h['konsonant_s'] + versch), ziel_vokal_t=r3(h['vokal_t'] + versch),
                   v12_konsonant_s=r3(h12['konsonant_s']), v12_vorlauf_ms=round((h12['spitze_t'] - h12['konsonant_s']) * 1000),
                   messung=h['quelle'], sicher=h.get('sicher'), notiz=zl['notiz'], herkunft=herkunft(L))
    if akz:
        er, e12 = L['erst_roh'], L['erst_v12']
        eintrag.update(erster_einsatz_t=r3(er['spitze_t']), konsonant_s=r3(er['konsonant_s']), vokal_t=r3(er['vokal_t']),
                       vorlauf_ms=round((h['spitze_t'] - er['konsonant_s']) * 1000), ziel_konsonant_s=r3(er['konsonant_s'] + versch),
                       ziel_vokal_t=r3(er['vokal_t'] + versch), ziel_erster_einsatz_t=r3(er['spitze_t'] + versch),
                       v12_erster_einsatz_t=r3(e12['spitze_t']), v12_konsonant_s=r3(e12['konsonant_s']),
                       v12_vorlauf_ms=round((h12['spitze_t'] - e12['konsonant_s']) * 1000),
                       herkunft_bezug='erster Vokal-Einsatz')
        eintrag['notiz'] += ' | Transienten-Spitze = Akzent (zweiter, stärkerer Einsatz); erster Vokal-Einsatz %.3f (%s) gehört zum Vorlauf und bleibt in Originallänge davor' % (h['erst_t'], rstr(h['erst_t']))
    silben.append(eintrag)
    # Doppel: gleiches Ereignis wie die Haupt-Messung (bei Akzent-Silben: erster Vokal-Einsatz) -> Ziel = Haupt-Ziel dieses Ereignisses
    ref_h = h['erst_t'] if L['D_bezug'] == 'erst' else h['spitze_t']
    ziel_d = ref_h + versch
    eintrag_d = dict(id='D-' + i, stimme='doppel', teil=teil, zeile=L['zeile'], zeile_text=ZTEXT[L['zeile']], nr=L['nr'], text=L['text'],
                     t_orig=r3(d['spitze_t']), t_v12=r3(d12['spitze_t']) if d12 else None, ziel_t=r3(ziel_d),
                     raster16=dict(takt=int(raster16(ziel_d)[0]), sechzehntel=round(raster16(ziel_d)[1], 2) % 16, text=rstr(ziel_d)),
                     raster16_orig=rstr(d['spitze_t']), abw_zur_haupt_ms=round((d['spitze_t'] - ref_h) * 1000),
                     abw_v12_ms=round((d12['spitze_t'] - d['spitze_t']) * 1000) if d12 else None,
                     abw_v12_ziel_ms=round((d12['spitze_t'] - ziel_d) * 1000) if d12 else None,
                     verschiebung_ms=round((ziel_d - d['spitze_t']) * 1000), quelle_regel=zl['regel'],
                     konsonant_s=r3(d['konsonant_s']), vokal_t=r3(d['vokal_t']), vorlauf_ms=round((d['spitze_t'] - d['konsonant_s']) * 1000),
                     ziel_konsonant_s=r3(d['konsonant_s'] + (ziel_d - d['spitze_t'])), bezug_haupt=('erster Vokal-Einsatz' if L['D_bezug'] == 'erst' else 'Transienten-Spitze'),
                     sicher=d.get('sicher'), notiz=('in v12 stumm (Doppel nur in Refrain/Tag/Outro)' if d12 is None else ''))
    if abs(eintrag_d['abw_zur_haupt_ms']) > 70: eintrag_d['notiz'] = (eintrag_d['notiz'] + ' | Doppel weicht > 70 ms von der Haupt ab – Messung prüfen').strip(' |')
    silben.append(eintrag_d)
json.dump(silben, open(CACHE + 'silben_out.json', 'w'), ensure_ascii=False, indent=0)
print(len(silben))
