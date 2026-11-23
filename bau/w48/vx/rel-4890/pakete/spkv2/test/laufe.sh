#!/bin/bash
# laufe.sh <html> <tag>: RASTER=1 / ohne / SINUS=1 parallel, Kurzausgabe
H=$1; T=$2; cd "$(dirname "$0")"
(RASTER=1 timeout 300 node kern-spkv2.mjs $H > $T-raster.out 2>&1) & (timeout 300 node kern-spkv2.mjs $H > $T-ohne.out 2>&1) & (SINUS=1 RASTER=1 timeout 300 node kern-spkv2.mjs $H > $T-sinus.out 2>&1) & wait
for f in raster ohne sinus; do python3 -c "
import json,sys
t=open('$T-$f.out').read().strip(); j=json.loads(t[2:])
k=lambda x:' '.join('%s=%s'%(a,x[a]) for a in ('kickTreffer','kickImBass','bassAlsKick','bassTreffer','grundton','sdrDrums','sdrBass'))
print('$f', 'errs',j['errs'],'ms',j['ms']); print('  verfBass ',k(j['verfBass'])); print('  verfDrums',k(j['verfDrums']))
"; done
