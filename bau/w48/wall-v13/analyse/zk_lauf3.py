import json, sys, numpy as np
from zk_gemein import *
from zk_onset3 import messe
spur = sys.argv[1]
prior = sys.argv[2] if len(sys.argv) > 2 else 'a_roh'     # 'a_roh' | 'a' | Pfad zu json {id: {konsonant_s..}}
S = LIED['silben']; out = {}
P = None
if prior.endswith('.json'): P = {int(k): v for k, v in json.load(open(prior)).items()}
def pr(i):
    if P is not None: return P[i]['konsonant_s'] if i in P else None
    return S[i][prior]
for i, s in enumerate(S):
    if s['art'] != 'gesungen': continue
    p = pr(i)
    if p is None: continue
    nxt = next((pr(j) for j in range(i + 1, len(S)) if S[j]['zeile'] == s['zeile'] and S[j]['art'] == 'gesungen' and pr(j) is not None), None)
    prv = next((pr(j) for j in range(i - 1, -1, -1) if S[j]['zeile'] == s['zeile'] and S[j]['art'] == 'gesungen' and pr(j) is not None), None)
    r = messe(lade(spur), s['text'], p, nxt=nxt, prv=prv)
    out[i] = r
    print('%3d %-6s %-3s p %.3f b %.3f | kons %.3f senke %.3f vok %.3f spitze %.3f  anl %4.0f r %.2f | %s' % (
        i, s['text'], r['klasse'], p, s['b_roh'], r['konsonant_s'], r['senke_t'], r['vokal_t'], r['spitze_t'], r['anlaut_ms'], r['r_vokal'], fmt16(r['spitze_t'])))
json.dump(out, open(CACHE + 'mess3_%s.json' % spur, 'w'))
