import json, sys, numpy as np
from zk_gemein import *
from zk_onset2 import messe
spur = sys.argv[1]; key = 'a_roh' if spur.endswith('roh') else 'a'
zeilen = [int(z) for z in sys.argv[2].split(',')] if len(sys.argv) > 2 else None
S = LIED['silben']; out = {}
for i, s in enumerate(S):
    if s['art'] != 'gesungen': continue
    if zeilen and s['zeile'] not in zeilen: continue
    p = s[key]
    nxt = next((s2[key] for s2 in S[i + 1:] if s2['zeile'] == s['zeile']), None)
    prv = next((s2[key] for s2 in S[:i][::-1] if s2['zeile'] == s['zeile']), None)
    r = messe(lade(spur), p, nxt=nxt, prv=prv)
    out[i] = r
    print('%3d %-6s p %.3f | kons %.3f senke %.3f vok %.3f spitze %.3f %-9s tiefe %4.1f anst %4.1f r %.2f | %s' % (
        i, s['text'], p, r['konsonant_s'], r['senke_t'], r['vokal_t'], r['spitze_t'], r['anlaut'], r['tiefe_db'], r['anstieg_db'], r['r_vokal'], fmt16(r['spitze_t'])))
json.dump(out, open(CACHE + 'mess2_%s.json' % spur, 'w'))
