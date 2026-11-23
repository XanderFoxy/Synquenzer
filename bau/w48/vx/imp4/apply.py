#!/usr/bin/env python3
# IMP4: DAW-Import Kleinigkeiten – gleichzeitige Schläge auf demselben Pad lauter (wie in der DAW), Import-Bericht beschreibt den
# übernommenen Klang. Aufruf: apply.py <eingang> <ausgang>
import sys, os, hashlib, tempfile
HERE = os.path.dirname(os.path.abspath(__file__))
OK_MD5 = {'a7515b980ddc423e84f9d5cdf8f132a6'}
src, dst = sys.argv[1], sys.argv[2]
raw = open(src, 'rb').read()
md5 = hashlib.md5(raw).hexdigest()
if md5 not in OK_MD5: sys.exit('IMP4: Eingang md5 %s nicht erlaubt' % md5)
s = raw.decode('utf-8')
if 'IMP4-BEGIN' in s or 'IMP4-XLA-BEGIN' in s: sys.exit('IMP4: schon eingebaut')
rd = lambda n: (lambda b: b if b.endswith('\n') else b + '\n')(open(os.path.join(HERE, n), encoding='utf-8').read())
xblk, mblk = rd('xla-block.js'), rd('block.js')
TP = '  /* ---------------- toProject: Szenen + Song (exakter Ablauf) ---------------- */\n'
MRG = '      const merged = []; for (const s of ss) for (const n of s.notes) merged.push(n); merged.sort((a, b) => a.tick - b.tick);\n'
REP = 'res.report.tracks.map(r=>`<div><b>${esc(r.name)}</b>'
MLG = "window.MLG2={core:mlg2Core,state:MLG2,desc:mlg2Desc,eqApply:mlg2EqApply,cur:()=>(XLA.cur?XLA.cur.mlg2:null)};\n"
EDITS = [
  # XLA-Kern (Text-Block sq-xla-src): Block vor toProject
  (TP, xblk + TP, 1),
  # notesIn: Drum-Noten gleichzeitig auf demselben Pad → ein lauterer Schlag
  ("    o.sort((a, b) => a.t - b.t || a.n - b.n);\n    return o;\n  }\n  const sameNotes",
   "    o.sort((a, b) => a.t - b.t || a.n - b.n);\n    return drum ? imp4Stack(o) : o;   /* IMP4 */\n  }\n  const sameNotes", 1),
  # toProject: Zeile im Bericht (Zusammengelegt)
  (MRG, MRG + "      if (drum) { const k4 = imp4Count(merged); if (k4) al.merged.push('DRUMS: ' + k4 + (k4 === 1 ? ' Schlag' : ' Schläge') + ' gleichzeitig auf demselben Pad → je ein lauterer Schlag'); }   /* IMP4 */\n", 1),
  # Import-Blatt: Bericht je Spur beschreibt den übernommenen Klang
  (REP, "res.report.tracks.map(r=>typeof imp4Rep==='function'?imp4Rep(c,res,r):r/* IMP4 */).map(r=>`<div><b>${esc(r.name)}</b>", 1),
  # Hauptskript: Block nach MLG2
  (MLG, MLG + mblk, 1),
]
for a, b, n in EDITS:
    c = s.count(a)
    if c != n: sys.exit('IMP4: Anker %r: %d Treffer statt %d' % (a[:60], c, n))
    s = s.replace(a, b)
for w, n in (('MS 2000', 1), ('IMP4-BEGIN', 1), ('IMP4-XLA-BEGIN', 1), ('/* IMP4 */', 3)):
    if s.count(w) != n: sys.exit('IMP4: %s %d' % (w, s.count(w)))
if sum(1 for l in s.split('\n') if l.startswith('  live: true,')) != 1: sys.exit('IMP4: live')
fd, tmp = tempfile.mkstemp(dir=os.path.dirname(os.path.abspath(dst)) or '.')
with os.fdopen(fd, 'wb') as f: f.write(s.encode('utf-8'))
os.replace(tmp, dst)
print('IMP4 ok', hashlib.md5(s.encode('utf-8')).hexdigest())
