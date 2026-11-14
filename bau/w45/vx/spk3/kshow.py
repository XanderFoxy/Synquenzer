import sys,json
for l in sys.stdin:
  if l.startswith('Fehler'): print(l.strip()); continue
  k,j=l.split(' ',1); d=json.loads(j); print(k, 'alt',d['abstandAlt'],'ms',d['vorher']['ms'],'->',d['nachher']['ms'], round(d['nachher']['ms']/d['vorher']['ms'],2), d['nachher']['tm'], d['nachher'].get('k'), '|', d['nachher']['txt'][:60])
