import sys
p = 'index.html'
L = open(p, encoding='utf-8').read().split('\n')
i = 102377 - 1
old = "    finally { d.busy = null; d.zStop = false; }"
assert L[i] == old, L[i]
assert 'zerlegen.k = s + 1' in '\n'.join(L[i-20:i]) and "d.meta.jobs.zerlegen = {fertig: true" in '\n'.join(L[i-6:i])
L[i] = "    finally { d.busy = null; d.zStop = false; zrl2W.delete(d); }   /* ZRL2: Rand-Rahmen-Zwischenspeicher (≈ 1,2 MB) nach dem Lauf freigeben */"
open(p, 'w', encoding='utf-8').write('\n'.join(L))
print('ok')
