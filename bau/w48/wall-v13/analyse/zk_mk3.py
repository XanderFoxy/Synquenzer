import json, sys
from zk_gemein import *
# Marken: lied a_roh (grün), v3 spitze (rot) für Spuren mit mess3-Datei
zeilen = [int(z) for z in sys.argv[1].split(',')]; spuren = sys.argv[2].split(','); out = sys.argv[3]
mk = {}
for sp in spuren:
    mk[sp] = []
    try: m3 = json.load(open(CACHE + 'mess3_%s.json' % sp))
    except Exception: m3 = {}
    for i, s in enumerate(LIED['silben']):
        if s['zeile'] not in zeilen: continue
        if sp == 'H_roh': mk[sp].append((s['a_roh'], '', 'lime'))
        if str(i) in m3:
            mk[sp].append((m3[str(i)]['spitze_t'], s['text'], 'red'))
            mk[sp].append((m3[str(i)]['konsonant_s'], '', 'm'))
json.dump(mk, open(out, 'w'))
