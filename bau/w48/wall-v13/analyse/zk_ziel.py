# Zielkarte v13: Rasterplätze aus den Parallel-Stellen, Ziele je Silbe (Haupt + Doppel), Ausgabe JSON.
import json, numpy as np
from zk_gemein import *

F = json.load(open(CACHE + 'final_mess.json'))
SIL = {L['id']: L for L in F['silben']}
BIND = F['bindung']
TEIL = {}
for a in LIED['abschnitte']:
    for z in a['zeilen']: TEIL[z] = a['kurz']


def tz(takt): return (takt - 1) * TAKT


def rel(t, takt): return (t - tz(takt)) / S16


# ---------- Strophen: 4-Takt-Phrasen (Takt 1 der Phrase), Silben in Reihenfolge; 'b' = Bindungs-/Zusatz-Einsatz ----------
PHRASEN = {
    'S1P1': (17, ['000', '001', '002', '003', '004'], 'Welcome to the fake'),
    'S1P2': (21, ['005', '006', '007', '008', '009', '010', '011'], 'zombies living for Gods sake'),
    'S1P3': (25, ['012', '013', '014', '015', 'S1P3~', '016'], 'In a world of (~) Sheep'),
    'S1P4': (29, ['017', '018', '019', '020', 'S1P4~', '021', '022', '023'], 'Everything we (~) Do believe'),
    'S2P1': (49, ['050', '051', '052', '053', '054'], 'Why can’t we just feel'),
    'S2P2': (53, ['055', '056', '057', '058', '059', '060', '061'], 'there is so much more to see'),
    'S2P3': (57, ['062', '063', '064', '065', '065b', '066'], 'Are we hyp-no-ti-sed'),
    'S2P4': (61, ['067', '068', '069', '070', '071', '072', '073'], 'What does it need to realise'),
}
# Index im Phrasen-Muster (0..6 = Silbe 1..7; 'b' = Zwischen-Einsatz auf Platz ~26)
def muster_index(ph, k):
    ids = PHRASEN[ph][1]
    if ph in ('S1P3', 'S2P3'): return [0, 1, 2, 3, 'b', 4][k]
    if ph == 'S1P4': return [0, 1, 2, 3, 'b', 4, 5, 6][k]
    return k


def t_h(i):
    if i in BIND: return BIND[i]['spitze_t']
    return SIL[i]['H_roh']['spitze_t']


def t_d(i):
    if i in BIND: return None
    return SIL[i]['D_roh']['spitze_t'] if SIL[i]['D_bezug'] == 'spitze' else None


# Muster je Index: Mehrheit der gerundeten Plätze aller 8 Phrasen (Haupt), Strophe 1 bevorzugt
proben = {}
for ph, (tk, ids, _) in PHRASEN.items():
    for k, i in enumerate(ids):
        proben.setdefault(muster_index(ph, k), []).append((ph, i, rel(t_h(i), tk)))
MUSTER = {}
for idx, P in proben.items():
    rund = [int(round(p[2])) for p in P]
    werte, anz = np.unique(rund, return_counts=True)
    maj = int(werte[np.argmax(anz)])
    MUSTER[idx] = dict(platz=maj, proben=[(p[0], p[1], round(p[2], 2)) for p in P], median=round(float(np.median([p[2] for p in P])), 2))
# Zuordnungen Strophe 1 <-> Strophe 2
ZUORD_B = {'S2P1': 'S1P1', 'S2P2': 'S1P2', 'S2P3': 'S1P3', 'S2P4': 'S1P4'}          # nach Takt/Akkord (Bbm-Gb | Ab-Fm | Bbm-Gb | Ab-Bbsus4)
ZUORD_A = {'S2P2': 'S1P3', 'S2P3': 'S1P4'}                                          # Xanders Paare aus dem Kopf


def fit(zu):
    out = []
    for s2, s1 in zu.items():
        tk2, ids2, _ = PHRASEN[s2]; tk1, ids1, _ = PHRASEN[s1]
        n = min(len(ids2), len(ids1))
        # nach Silben-Nummer (Zusatz-Einsatz 'b' wird nur mit 'b' gepaart)
        i1 = [i for k, i in enumerate(ids1) if muster_index(s1, k) != 'b']
        i2 = [i for k, i in enumerate(ids2) if muster_index(s2, k) != 'b']
        for a, b in zip(i1, i2):
            d = rel(t_h(b), tk2) - rel(t_h(a), tk1)
            out.append(dict(s1=a, s1_text=SIL[a]['text'], s2=b, s2_text=SIL[b]['text'], s1_platz=round(rel(t_h(a), tk1), 2),
                            s2_platz=round(rel(t_h(b), tk2), 2), diff16=round(d, 2)))
        rest2 = i2[len(i1):]
        for b in rest2: out.append(dict(s1=None, s2=b, s2_text=SIL[b]['text'], s2_platz=round(rel(t_h(b), tk2), 2), diff16=None, notiz='überzählige Silbe'))
    return out


FIT_A, FIT_B = fit(ZUORD_A), fit(ZUORD_B)

# ---------- Refrain-Zeilen: Bezugs-Takt = Takt der 2. Silbe (Zeilen-Schwerpunkt) ----------
REF = {
    'Z1': dict(text='We claim we know it all', reihen={'R1': (33, ['024', '025', '026', '027', '028', '029']), 'R2': (65, ['074', '075', '076', '077', '078', '079']),
                                                       'R3': (113, ['130', '131', '132', '133', '134', '135']), 'ZT': (97, ['104', '105'])}),
    'Z2': dict(text='Can’t see who is behind this wall', reihen={'R1': (37, ['030', '031', '032', '033', '034', '035', '036', '037']),
                                                                 'R2': (69, ['080', '081', '082', '083', '084', '085', '086', '087']),
                                                                 'R3': (117, ['136', '137', '138', '139', '140', '141', '142', '143']), 'ZT': (101, ['110', '111'])}),
    'Z3': dict(text='Don’t wait, follow the light', reihen={'R1': (41, ['038', '039', '040', '041', '042', '043']), 'R2': (73, ['088', '089', '090', '091', '092', '093']),
                                                            'R3': (121, ['144', '145', '146', '147', '148', '149']), 'ZT': (105, ['118', '119'])}),
    'Z4': dict(text='wake up open your eyes', reihen={'R1': (45, ['044', '045', '046', '047', '048', '049']), 'R2': (77, ['094', '095', '096', '097', '098', '099']),
                                                      'R3': (125, ['150', '151', '152', '153', '154', '155'])}),
}
REF_MUSTER = {}
for z, R in REF.items():
    n = len(R['reihen']['R1'][1])
    for k in range(n):
        vals = {r: rel(t_h(R['reihen'][r][1][k]), R['reihen'][r][0]) for r in ('R1', 'R2', 'R3')}
        rund = {r: int(round(v)) for r, v in vals.items()}
        werte, anz = np.unique(list(rund.values()), return_counts=True)
        if anz.max() >= 2: platz = int(werte[np.argmax(anz)]); grund = 'Mehrheit'
        else: platz = rund['R3']; grund = 'kein Gleichstand möglich -> R3'
        # Doppel als Zusatz-Info
        dv = {r: (rel(t_d(R['reihen'][r][1][k]), R['reihen'][r][0]) if t_d(R['reihen'][r][1][k]) else None) for r in ('R1', 'R2', 'R3')}
        REF_MUSTER[(z, k)] = dict(platz=platz, grund=grund, haupt={r: round(v, 2) for r, v in vals.items()},
                                  doppel={r: (round(v, 2) if v is not None else None) for r, v in dv.items()}, gerundet=rund)
# Zweiter Taktschlag (know/is/low) liegt in allen drei Refrains zwischen Schlag 2 (4) und 2e (5): R3 (saubersten) -> 4.
for key in (('Z1', 3), ('Z2', 3), ('Z3', 3)):
    m = REF_MUSTER[key]
    if m['platz'] == 21 and m['gerundet']['R3'] == 20:
        m['platz'] = 20; m['unsicher'] = True
        m['grund'] = 'Mehrheit R1/R2 wäre 21 (2e), Mittel %.2f; R3 (sauberster) und „know“ in Zeile 1 liegen auf Schlag 2 -> 20 (glaubhafter Taktstrich)' % np.mean(list(m['haupt'].values()))
    elif m['platz'] == 20: m['grund'] += ' (Schlag 2)'
# „eyes“ (Z4 Silbe 6): Mittel genau zwischen 31 und 32; Outro und Tag singen „eyes“ auf dem Taktstrich -> 32
m = REF_MUSTER[('Z4', 5)]
if m['platz'] == 31:
    m['platz'] = 32; m['unsicher'] = True
    m['grund'] = 'gerundet 31/32/31, Mittel %.2f (genau zwischen 31 und 32); Outro/Tag „eyes“ auf dem Taktstrich -> 32 (Taktstrich)' % np.mean(list(m['haupt'].values()))

# ---------- Ziele je Silbe ----------
ZIEL = {}     # id -> dict(takt, platz, regel, notiz)
for ph, (tk, ids, _) in PHRASEN.items():
    for k, i in enumerate(ids):
        if i in BIND: continue
        idx = muster_index(ph, k)
        if idx == 'b':
            platz = 26; regel = 'strophe1'; notiz = 'Zwischen-Einsatz „ti“: Strophe 1 hat an dieser Stelle neue Töne ohne neue Silbe (Platz %.2f bzw. %.2f) -> 26' % (
                rel(BIND['S1P3~']['spitze_t'], 25), rel(BIND['S1P4~']['spitze_t'], 29))
        else:
            platz = MUSTER[idx]['platz']
            eigen = rel(t_h(i), tk)
            if ph.startswith('S1'):
                regel = 'eigen'
                notiz = 'Strophe 1 = Vorbild'
                if int(round(eigen)) != platz:
                    notiz = 'Strophe 1 weicht hier selbst vom Muster aller 8 Phrasen ab (eigen %.2f) -> Mehrheit %d' % (eigen, platz)
            else:
                regel = 'strophe1'
                notiz = 'folgt Strophe 1 (%s)' % ZUORD_B[ph]
        ZIEL[i] = dict(takt=tk, platz=platz, regel=regel, notiz=notiz)
for z, R in REF.items():
    for r, (tk, ids) in R['reihen'].items():
        for k, i in enumerate(ids):
            m = REF_MUSTER[(z, k)]
            ZIEL[i] = dict(takt=tk, platz=m['platz'], regel=('refrain-mehrheit'), notiz='%s Silbe %d: %s; Haupt R1/R2/R3 = %s' % (z, k + 1, m['grund'], m['haupt']))
# Outro „open your eyes“ = Refrain-Muster Z4 Silben 3–6 (relativ zum Takt von „o“: 0, 6, 12, 16)
for k, i in enumerate(['156', '157', '158', '159']):
    m = REF_MUSTER[('Z4', k + 2)]
    ZIEL[i] = dict(takt=128, platz=m['platz'] - 16, regel='refrain-mehrheit', notiz='Outro wie Refrain-Zeile 4 („open your eyes“)')
# Tag nach Refrain 2: eigener Rhythmus (o 0, pen ~3, your 6, eyes 16) – nur auf das nächste 16tel
for i in ['100', '101', '102', '103']:
    p = rel(t_h(i), 80)
    ZIEL[i] = dict(takt=80, platz=int(round(p)), regel='eigen', notiz='Tag: eigener Rhythmus (pen/your 3 bzw. 6 statt 6/12 wie im Refrain) – nur aufs nächste 16tel; offen: Xander fragen')
# Zwischenteil „Wach auf“: deutsch, beide Stimmen singen „auf“ auf 4-und (−2) -> eigen
for i, tk in (('124', 109), ('125', 109)):
    p = rel(t_h(i), tk)
    ZIEL[i] = dict(takt=tk, platz=int(round(p)), regel='eigen', notiz='„Wach auf“: Haupt und Doppel singen „auf“ beide auf 4-und vor dem Takt (−2) – bleibt (nächstes 16tel)')

# Sonderfall S1 „world“: Strophe 1 selbst 1,5 16tel nach dem Muster -> Mehrheit 16, aber als unsicher markiert
json.dump(dict(ZIEL=ZIEL, MUSTER={str(k): v for k, v in MUSTER.items()}, REF_MUSTER={'%s/%d' % k: v for k, v in REF_MUSTER.items()},
               FIT_A=FIT_A, FIT_B=FIT_B), open(CACHE + 'ziele.json', 'w'), indent=0, ensure_ascii=False)
print('Strophen-Muster:', {k: (v['platz'], v['median']) for k, v in MUSTER.items()})
for k, v in REF_MUSTER.items(): print(k, v['platz'], v['grund'], v['haupt'], 'D', v['doppel'])
print('Fit A (Xander):', np.mean([abs(f['diff16']) for f in FIT_A if f['diff16'] is not None]).round(2), 'Fit B (Takt/Akkord):', np.mean([abs(f['diff16']) for f in FIT_B if f['diff16'] is not None]).round(2))
for f in FIT_A: print('A', f)
for f in FIT_B: print('B', f)
