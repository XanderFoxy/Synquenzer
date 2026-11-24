import json, sys
from zk_gemein import *
spur = sys.argv[1]; zeilen = [int(z) for z in sys.argv[2].split(',')]; out = sys.argv[3]
m2 = json.load(open(CACHE + 'mess2_%s.json' % spur))
key = 'a_roh' if spur.endswith('roh') else 'a'; keyb = 'b_roh' if spur.endswith('roh') else 'b'
mk = {spur: []}
for i, s in enumerate(LIED['silben']):
    if s['zeile'] in zeilen:
        mk[spur].append((s[key], s['text'], 'lime'))
        if str(i) in m2:
            mk[spur].append((m2[str(i)]['vokal_t'], 'v', 'red'))
            mk[spur].append((m2[str(i)]['konsonant_s'], 'k', 'cyan'))
json.dump(mk, open(out, 'w'))
