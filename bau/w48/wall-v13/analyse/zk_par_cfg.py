# Baut die Konfiguration für ein Parallel-Bild aus mess_H.json (+ mess_D.json falls vorhanden)
import json, sys
from zk_gemein import *
def cfg(gruppen, dauer, datei, spuren=('H_roh',)):
    MH = {m['id']: m for m in json.load(open(CACHE + 'mess_H.json'))}
    try: MD = {m['id']: m for m in json.load(open(CACHE + 'mess_D.json'))}
    except Exception: MD = {}
    reihen = []; marken = {}
    for zeile, t0, lab in gruppen:
        for sp in spuren:
            reihen.append((sp, t0, '%s %s' % (lab, sp.replace('_roh', 'r'))))
            key = '%s@%.3f' % (sp, t0); marken[key] = []
            src = MD if sp.startswith('D') else MH
            for m in src.values():
                if m['zeile'] != zeile or sp not in m: continue
                marken[key].append((m[sp]['spitze_t'], m['text'], 'r'))
                marken[key].append((m[sp]['konsonant_s'], '', 'm'))
    json.dump(dict(reihen=reihen, dauer=dauer, datei=datei, marken=marken), open(CACHE + 'par.json', 'w'))
if __name__ == '__main__':
    g = json.loads(sys.argv[1]); cfg([tuple(x) for x in g], float(sys.argv[2]), sys.argv[3], tuple(sys.argv[4].split(',')) if len(sys.argv) > 4 else ('H_roh',))
