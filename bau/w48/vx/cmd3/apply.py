#!/usr/bin/env python3
# CMD3: DAW-Projekt-Import – Echo/Delay je Spur statt eines gemeinsamen Echos; Import-Bericht nennt das eigene Echo der Spur.
# Aufruf: apply.py <eingang> <ausgang>
import sys, os, hashlib, tempfile
HERE = os.path.dirname(os.path.abspath(__file__))
OK_MD5 = {'695af0504463a6385e21dc94e55b00c9'}
if len(sys.argv) != 3: sys.exit('Aufruf: apply.py <eingang> <ausgang>')
src, dst = sys.argv[1], sys.argv[2]
if os.path.realpath(dst).startswith('/dev/'): sys.exit('CMD3: Ausgang muss eine Datei sein')
raw = open(src, 'rb').read()
md5 = hashlib.md5(raw).hexdigest()
if md5 not in OK_MD5: sys.exit('CMD3: Eingang md5 %s nicht erlaubt' % md5)
s = raw.decode('utf-8')
if 'CMD3-BEGIN' in s: sys.exit('CMD3: schon eingebaut')
blk = open(os.path.join(HERE, 'block.js'), encoding='utf-8').read()
if not blk.endswith('\n'): blk += '\n'
IMP4END = "/* IMP4-END */\n"
ECH = "const ech=!e?'':same?'Echo '+e.divL+' wie in der DAW':'eigenes Delay '+e.divL+' → Projekt-Echo '+(E?E.divL:'')+' (eins für alle Spuren)';"
EDITS = [
  # Projekt-Normalisierung: Feld „ech“ (eigenes Echo) einer Synth-Spur bleibt erhalten
  ("if(typeof mtx3bNormTr==='function')mtx3bNormTr(t,o,def,pk,cl);\n",
   "if(typeof mtx3bNormTr==='function')mtx3bNormTr(t,o,def,pk,cl);\nif(typeof cmd3NormTr==='function')cmd3NormTr(t,o,def);/* CMD3 */\n", 1),
  # Spur-Kette: Echo-Send auf das eigene Echo der Spur legen (oder zurück auf das Projekt-Echo)
  ("mixaTrackSync(i,immediate);\nkf1KornSync(i);\n}\n",
   "mixaTrackSync(i,immediate);\nkf1KornSync(i);\nif(typeof cmd3Sync==='function')cmd3Sync(i);/* CMD3 */\n}\n", 1),
  # Tempo: eigene Echos laufen mit
  ("function applyEcho(t){if(AU.echo)AU.echo.set(S.fxBus.echo,S.bpm,t);}\n",
   "function applyEcho(t){if(AU.echo)AU.echo.set(S.fxBus.echo,S.bpm,t);if(typeof cmd3Tempo==='function'&&!cmd3Kill.t)cmd3Tempo(t);/* CMD3 */}\n", 1),
  # Stopp: Echo-Fahnen der eigenen Echos wie beim Projekt-Echo abschneiden
  ("function echoKill(){\nconst E=AU.echo,c=AU.ctx;if(!E||!c)return;\n",
   "function echoKill(){\nif(typeof cmd3Kill==='function')cmd3Kill();/* CMD3 */\nconst E=AU.echo,c=AU.ctx;if(!E||!c)return;\n", 1),
  # Import: nach dem Projekt-Echo je Spur das eigene Echo setzen
  ("if(typeof mlg2Echo==='function')mlg2Echo(c,p);\n",
   "if(typeof mlg2Echo==='function')mlg2Echo(c,p);\nif(typeof cmd3Echo==='function')cmd3Echo(c,p);/* CMD3 */\n", 1),
  # Bericht je Spur: eigenes Echo statt „→ Projekt-Echo (eins für alle Spuren)“
  (ECH, "const ech=typeof cmd3Ech==='function'?cmd3Ech(e,E)/* CMD3 */:!e?'':same?'Echo '+e.divL+' wie in der DAW':'eigenes Delay '+e.divL+' → Projekt-Echo '+(E?E.divL:'')+' (eins für alle Spuren)';", 1),
  ("ok:v.rep.ok.slice(),appr:v.rep.appr.filter(",
   "ok:typeof cmd3Ok==='function'?cmd3Ok(v.rep.ok,e,E)/* CMD3 */:v.rep.ok.slice(),appr:v.rep.appr.filter(", 1),
  # Block nach IMP4
  (IMP4END, IMP4END + blk, 1),
]
for a, b, n in EDITS:
    c = s.count(a)
    if c != n: sys.exit('CMD3: Anker %r: %d Treffer statt %d' % (a[:60], c, n))
    s = s.replace(a, b)
for w, n in (('MS 2000', 1), ('CMD3-BEGIN', 1), ('CMD3-END', 1), ('/* CMD3 */', 7)):
    if s.count(w) != n: sys.exit('CMD3: %s %d statt %d' % (w, s.count(w), n))
if sum(1 for l in s.split('\n') if l.startswith('  live: true,')) != 1: sys.exit('CMD3: live')
for w in ('0.00537728', '0.19492', '413.56', '0.193046', 'xander-krypto'):
    if w in s: sys.exit('CMD3: verboten ' + w)
out = s.encode('utf-8')
d = os.path.dirname(os.path.abspath(dst)) or '.'
fd, tmp = tempfile.mkstemp(dir=d, prefix='.cmd3-')
with os.fdopen(fd, 'wb') as f: f.write(out)
os.replace(tmp, dst)
print('CMD3 ok', hashlib.md5(out).hexdigest(), len(out))
