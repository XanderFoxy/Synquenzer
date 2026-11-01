#!/usr/bin/env python3
# Pegeltabelle (Markdown) aus out/ue12.json und Testzahlen aus out/*.json
import json, os, collections
D = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'out')
rows = json.load(open(os.path.join(D, 'ue12.json')))
kits = list(dict.fromkeys(r['kit'] for r in rows)); werke = list(dict.fromkeys(r['name'] for r in rows))
print('### Pegeltabelle UE-12 (Lautheit LU zum Groove davor / Spitze dBFS), Dichte mittel, Richtung Auto\n')
print('| Übergang | ' + ' | '.join(kits) + ' |'); print('|---|' + '---|' * len(kits))
for w in werke:
    c = []
    for k in kits:
        r = next(x for x in rows if x['kit'] == k and x['name'] == w and x['dens'] == 1 and x['dir'] == 'auto')
        c.append(('%+.1f / %.1f' % (r['lu'], r['pk'])) + ('' if r['ok'] else ' ✗'))
    print('| %s | %s |' % (w, ' | '.join(c)))
print('\n### Alle Messungen je Kit (3 Dichten × Auto, mittel × auf/ab = 5 × 12 = 60 je Kit)\n')
print('| Kit | Messungen | grün | Lautheit min…max (LU) | Spitze max (dBFS) | Spitze über Groove max (dB) | Treffer außerhalb |'); print('|---|---|---|---|---|---|---|')
for k in kits:
    R = [x for x in rows if x['kit'] == k]
    print('| %s | %d | %d | %+.1f … %+.1f | %.1f | %+.1f | %d |' % (k, len(R), sum(x['ok'] for x in R), min(x['lu'] for x in R), max(x['lu'] for x in R), max(x['pk'] for x in R), max(x['pk'] - x['pkG'] for x in R), sum(x['out'] for x in R)))
print('\nGesamt: %d Messungen, %d grün.' % (len(rows), sum(x['ok'] for x in rows)))
print('\n### Testzahlen\n')
for f in ['ue-abnahme.json', 'ue15-break.json', 'ue-bedienung.json', 'ue-r28-perf.json']:
    p = os.path.join(D, f)
    if os.path.exists(p): R = json.load(open(p)); print('- %s: %d/%d grün' % (f.replace('.json', '.mjs'), sum(x['ok'] for x in R), len(R)))
