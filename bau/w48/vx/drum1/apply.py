#!/usr/bin/env python3
# DRUM1 – Drum-Kit-Erkennung: Kick/Snare-Vorlagen aus dem Lied lernen. Aufruf: apply.py <eingang> <ausgang>
import sys, os, hashlib, tempfile
ERLAUBT = ['a7515b980ddc423e84f9d5cdf8f132a6']
src, dst = sys.argv[1], sys.argv[2]
raw = open(src, 'rb').read()
if hashlib.md5(raw).hexdigest() not in ERLAUBT: sys.exit('DRUM1: md5 des Eingangs unbekannt: ' + hashlib.md5(raw).hexdigest())
s = raw.decode('utf-8')
if 'DRUM1-BEGIN' in s: sys.exit('DRUM1: schon eingebaut')
block = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'block.js'), encoding='utf-8').read().strip('\n')
anker = "try{window.__spk11b={last:()=>SPK11B.last,hits:(x,sr,st,n,fr,bass,spb)=>spk11bHits(x,sr,st,n,fr,{bass,spb}),spec:(x,sr)=>spk11bSpec(x,sr)};}catch(e){}\n"
if s.count(anker) != 1: sys.exit('DRUM1: Anker %d× statt 1×' % s.count(anker))
s = s.replace(anker, anker + block + '\n', 1)
fd, tmp = tempfile.mkstemp(dir=os.path.dirname(os.path.abspath(dst)) or '.')
with os.fdopen(fd, 'wb') as f: f.write(s.encode('utf-8'))
os.replace(tmp, dst)
print('DRUM1 eingebaut →', dst)
