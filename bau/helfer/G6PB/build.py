# baut index.html = R-4252.html + G6+b-Block (g6pb-block.js) + kleine Einhängepunkte
import sys
base=open('../../snapshots/R-4252.html',encoding='utf-8').read(); blk=open('g6pb-block.js',encoding='utf-8').read(); s=base
def rep(old,new):
    global s; assert s.count(old)==1, old[:80]; s=s.replace(old,new,1)
rep("/* G7-END */\n","/* G7-END */\n"+blk)
rep("g2Run.toString() + '\\nconst V = vsDspMake(), P = g2PitchMake(), C = new Map();onmessage = e => { const m = e.data; try { const r = g2Run(V, P, C, m); postMessage({id: m.id, r}, r && r.y ? [r.y.buffer] : []); }",
    "g2Run.toString() + '\\n' + g6pDspMake.toString() + '\\n' + g6pRun.toString() + '\\nconst V = vsDspMake(), P = g2PitchMake(), C = new Map(), D = g6pDspMake();onmessage = e => { const m = e.data; try { const r = m.op === \\'chor\\' || m.op === \\'lu\\' ? g6pRun(V, P, C, D, m) : g2Run(V, P, C, m); postMessage({id: m.id, r}, r && r.y ? [r.y.buffer] : r && r.ys ? r.ys.map(y => y.buffer) : []); }")
rep("Object.assign(SYNQUENZER, G7_API);                // G7: Gesang folgt dem Transponieren\n","Object.assign(SYNQUENZER, G7_API);                // G7: Gesang folgt dem Transponieren\nObject.assign(SYNQUENZER, G6PB_API);              // G6+b: Chor-Rechenweg v2 (Test-API)\n")
rep("      while (G6.cache.size > 24) { let ok = null, ot = Infinity; for (const [kk, x] of G6.cache) if (x.t < ot) { ot = x.t; ok = kk; } G6.cache.delete(ok); }\n",
    "      while (G6.cache.size > 24) { let ok = null, ot = Infinity; for (const [kk, x] of G6.cache) if (x.t < ot) { ot = x.t; ok = kk; } G6.cache.delete(ok); }\n      if (typeof g6pTrim === 'function') g6pTrim();   // G6+b: Chor-Puffer v1 + v2 zusammen höchstens 48 MB (LRU)\n")
open('index.html','w',encoding='utf-8').write(s)
