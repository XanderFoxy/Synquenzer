#!/usr/bin/env python3
# ARP2 – Arp- und Lauf-Feinheiten. Aufruf: apply.py <eingang> <ausgang>
import sys, os, hashlib, tempfile
HERE = os.path.dirname(os.path.abspath(__file__))
OK_MD5 = {'9c7f63cf9e6a36aef575d37c064e4022'}
src, dst = sys.argv[1], sys.argv[2]
raw = open(src, 'rb').read()
md5 = hashlib.md5(raw).hexdigest()
if md5 not in OK_MD5:
    sys.exit('ARP2: Eingang md5 %s nicht erlaubt' % md5)
s = raw.decode('utf-8')
if 'ARP2-BEGIN' in s:
    sys.exit('ARP2: schon eingebaut')
block = open(os.path.join(HERE, 'block.js'), encoding='utf-8').read().strip('\n') + '\n'

R = [
 # (a) Key Sync aus: Taktanfang im Taktmass des Songs (heute fest 4 Schlaege) – Echtzeit-Arp
 ("r.gb=s.gb;if(s.grid.k==='song'&&(ng||s.gb==null))s.gb=Math.floor(idx*s.sb/4+1e-6)*4;",
  "r.gb=s.gb;if(s.grid.k==='song'&&(ng||s.gb==null))s.gb=typeof tBarFloor==='function'?tBarFloor(idx*s.sb,1e-6):Math.floor(idx*s.sb/4+1e-6)*4;/*ARP2a*/", 1),
 # (a) dieselbe Rechnung fuer In-den-Clip-schreiben und MIDI-Export
 ("if(ng||gb==null)gb=Math.floor(idx*sb/4+1e-6)*4;",
  "if(ng||gb==null)gb=o.bf?o.bf(idx*sb):Math.floor(idx*sb/4+1e-6)*4;/*ARP2a*/", 1),
 ("{a:0,b:L,brk:[],spb:spb(),seed:arp1K().seedOf(t)}",
  "{a:0,b:L,brk:[],spb:spb(),seed:arp1K().seedOf(t),bf:arp2Bf(c)/*ARP2a*/}", 1),
 ("{a:a0,b:0,brk:[],spb:spb(),seed:arp1K().seedOf(t)}",
  "{a:a0,b:0,brk:[],spb:spb(),seed:arp1K().seedOf(t),bf:arp2Bf(c)/*ARP2a*/}", 1),
 ("{a:a0,b:end,brk,spb:60/S.bpm,seed:arp1K().seedOf(i)}",
  "{a:a0,b:end,brk,spb:60/S.bpm,seed:arp1K().seedOf(i),bf:arp2Bf(null)/*ARP2a*/}", 1),
 # (b) Arp aus: gehaltene Toene sofort direkt
 ("if(s.kOn)keys(i,s,10,now);\nST.delete(i);",
  "if(s.kOn)keys(i,s,10,now);\nif(!on(i)&&typeof arp2Resume==='function')try{arp2Resume(i,s.iv,now,keepLive===true,p=>{try{return route(i,p).hold==null;}catch(e){return true;}});}catch(e){logErr(e);}/*ARP2b*/\nST.delete(i);", 1),
 # (e) Clip-Noten eines Planungsfensters in Zeitfolge (Schleifengrenze)
 ("for(const e of ev.values()){\nif(e.t<R.j1F)continue;",
  "for(const e of arp2Ord(ev)){/*ARP2e*/\nif(e.t<R.j1F)continue;", 1),
 # Block
 ("const arpK=()=>(typeof ARPC!=='undefined'?ARPC:null);",
  block + "const arpK=()=>(typeof ARPC!=='undefined'?ARPC:null);", 1),
]
EXTRA = os.environ.get('ARP2_D', '1') == '1'
if EXTRA:
    # (d) Band-Drumziel im Lauf: Einzelspuren von DRUMS (z. B. HH ZU) mit DRUMS neu planen – keine doppelte Hi-Hat im Vorlauf
    R.append(("if(BEG1.soloRun===R.runId&&typeof mtx3cBegHush==='function')mtx3cBegHush(old,BEG1.tgc);\nconst at=AU.ctx.currentTime+.006;",
              "if(BEG1.soloRun===R.runId&&typeof mtx3cBegHush==='function')mtx3cBegHush(old,BEG1.tgc);\nif(typeof mtx3cBegKeep==='function'){mtx3cBegKeep(ch,BEG1.tgc);mtx3cBegKeep(ch,old);}/*ARP2d*/\nconst at=AU.ctx.currentTime+.006;", 1))
for a, b, n in R:
    c = s.count(a)
    if c != n:
        sys.exit('ARP2: Anker %d-mal statt %d: %r' % (c, n, a[:70]))
    s = s.replace(a, b)
d = os.path.dirname(os.path.abspath(dst))
fd, tmp = tempfile.mkstemp(dir=d, prefix='.arp2-')
with os.fdopen(fd, 'wb') as f:
    f.write(s.encode('utf-8'))
os.replace(tmp, dst)
print('ARP2 ok', hashlib.md5(s.encode('utf-8')).hexdigest(), dst)
