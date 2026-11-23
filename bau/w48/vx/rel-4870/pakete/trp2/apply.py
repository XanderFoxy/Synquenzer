#!/usr/bin/env python3
# TRP2: Stufen-Teil (trs) – Song-Aufnahme rechnet Stufen zurück, gehaltene Noten an der Teil-Grenze neu stimmen.
# Aufruf: apply.py <eingang> <ausgang>
import sys, os, hashlib, tempfile
HERE = os.path.dirname(os.path.abspath(__file__))
OK_MD5 = {'a7515b980ddc423e84f9d5cdf8f132a6', '7ca09efba33c227407e9fe806481c812'}
src, dst = sys.argv[1], sys.argv[2]
raw = open(src, 'rb').read()
md5 = hashlib.md5(raw).hexdigest()
if md5 not in OK_MD5: sys.exit('TRP2: Eingang md5 %s nicht erlaubt' % md5)
s = raw.decode('utf-8')
if 'TRP2-BEGIN' in s or 'trp2Tick' in s: sys.exit('TRP2: schon eingebaut')
block = open(os.path.join(HERE, 'block.js'), encoding='utf-8').read()
if not block.endswith('\n'): block += '\n'
EDITS = [
  # Haken 1: Song-Aufnahme – clipNoteFor rechnet in einem Stufen-Teil über outPitch zurück
  ("function clipNoteFor(track,clipKey,played,time,entry){\n",
   "function clipNoteFor(track,clipKey,played,time,entry){\n"
   "if(typeof trp2NoteFor==='function'){const r2=trp2NoteFor(track,clipKey,played,time,entry);if(r2!=null)return r2;}/*TRP2*/\n", 1),
  # Haken 2: Takt-Planung – nach dem Einplanen der Noten gehaltene Noten an Stufen-Grenzen neu stimmen
  ("try{kf1Plan(b0,b1);}catch(e){tickErr(e);}\n",
   "if(R.songPlay&&typeof trp2Tick==='function'){try{trp2Tick(b0,b1);}catch(e){tickErr(e);}}/*TRP2*/\n"
   "try{kf1Plan(b0,b1);}catch(e){tickErr(e);}\n", 1),
  # Haken 3: Teil-Änderung auf alle Stellen im Song (markReplaceAll, auch nach Konsolidieren) – Stufen der Marke bleiben
  ("const nm=song.marks.find(x=>x.a===a&&x.part===p.id);if(nm&&!song.marks.some(x=>x.id===id))nm.id=id;\n",
   "const nm=song.marks.find(x=>x.a===a&&x.part===p.id);if(nm&&!song.marks.some(x=>x.id===id))nm.id=id;\n"
   "if(typeof trp2Re==='function')trp2Re(song,m,a,ch.len);/*TRP2*/\n", 1),
  # Block vor trp1Live
  ("\nfunction trp1Live(){try{", "\n" + block + "function trp1Live(){try{", 1),
]
for a, b, n in EDITS:
    c = s.count(a)
    if c != n: sys.exit('TRP2: Anker %r: %d Treffer statt %d' % (a[:60], c, n))
    s = s.replace(a, b)
for w, n in (('MS 2000', 1),):
    if s.count(w) != n: sys.exit('TRP2: %s %d' % (w, s.count(w)))
if sum(1 for l in s.split('\n') if l.startswith('  live: true,')) != 1: sys.exit('TRP2: live')
fd, tmp = tempfile.mkstemp(dir=os.path.dirname(os.path.abspath(dst)) or '.')
with os.fdopen(fd, 'wb') as f: f.write(s.encode('utf-8'))
os.replace(tmp, dst)
print('TRP2 ok', hashlib.md5(s.encode('utf-8')).hexdigest())
