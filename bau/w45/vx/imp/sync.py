d='/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/vx/imp/'
core=open(d+'core.js').read().replace('// IMP1: Erkennungs-Kern ohne DOM (läuft im Worker; im Test auch direkt in Node). Gibt {analyse(x, sr, o, prog)} zurück.\n','')
block=open(d+'block-head.js').read()+core+open(d+'block-tail.js').read()
p=d+'index.html'; s=open(p).read()
a=s.index('/* ===== IMP1-BEGIN'); e='/* ===== IMP1-END ===== */\n'; b=s.index(e)+len(e)
s=s[:a]+block+s[b:]
open(p,'w').write(s); print('ok', len(block))
