import sys
d='/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/vx/voxr1/'
h=open(d+'index.html').read(); s=open(d+'src-voxr1.js').read().rstrip('\n')
a=h.index('/* VOXR1-BEGIN */'); b=h.index('/* VOXR1-END */')+len('/* VOXR1-END */')
assert s.startswith('/* VOXR1-BEGIN */') and s.endswith('/* VOXR1-END */')
h=h[:a]+s+h[b:]
open(d+'index.html','w').write(h); print('ok', len(h))
