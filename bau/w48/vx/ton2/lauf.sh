#!/bin/bash
# lauf.sh <port> <label> [args...] -> kurze Zeile
P=$1; L=$2; shift 2
timeout 150 node $(dirname $0)/sonde.js $P orig "$@" 2>&1 | python3 -c "
import json,sys
for l in sys.stdin:
  try: d=json.loads(l)
  except: print('RAW',l.strip()[:300]); continue
  print('$L', 'args', '$*', 'erst', d['erst']['first'], 'ank', d['ank']['ms'], 'r300', d['erst300'], 'ref300', d['ref300'], 'jump', d['erst']['jump'], 'refjump', d['ref']['jump'], 'bins', d['erst']['bins'][:8], 'ton2', d.get('ton2'), 'errs', d['errs'])"
