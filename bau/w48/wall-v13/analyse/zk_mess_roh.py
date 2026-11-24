# Erste Messung aller gesungenen Silben auf der Rohaufnahme (Haupt), Fenster aus lied.json (a_roh) ± Rand.
import json, sys, numpy as np
from zk_gemein import *
from zk_onset import silbe
spur = sys.argv[1] if len(sys.argv) > 1 else 'H_roh'
key = 'a_roh' if spur.endswith('roh') else 'a'
S = LIED['silben']
out = []
for i, s in enumerate(S):
    if s['art'] != 'gesungen': continue
    t = s[key]
    nxt = None
    for s2 in S[i + 1:]:
        if s2['zeile'] == s['zeile']: nxt = s2[key]; break
    kern_hi = min(t + 0.6, (nxt - 0.03) if nxt else t + 0.6)
    prev_end = None
    r = silbe(lade(spur), t - 0.12, t + 0.15, kern_lo=t - 0.05, kern_hi=kern_hi, prev_end=prev_end)
    r.update(id=i, text=s['text'], ref=t, ref_b=s['b_roh' if key == 'a_roh' else 'b'])
    out.append(r)
    print('%3d %-6s ref %.3f/%.3f | kons %.3f vok %.3f spitze %.3f burst %.3f kern %.3f | anl %5.0f ms  steil %.2f  hf-v %5.1f st %.2f' % (
        i, s['text'], t, r['ref_b'], r['konsonant_s'], r['vokal_t'], r['spitze_t'], r['burst_t'], r['kern_t'], r['anlaut_ms'], r['steil_db_ms'], r['hf_minus_v_db'], r['stimmhaft']), flush=True)
json.dump(out, open(CACHE + 'mess1_%s.json' % spur, 'w'), indent=0)
