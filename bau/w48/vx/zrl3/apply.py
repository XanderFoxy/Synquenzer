#!/usr/bin/env python3
# ZRL3 (4.86): Audio-Ebene nach Noten-Aenderung nur die geaenderten Phasen-Vocoder-Abschnitte neu rechnen
#  (Zwischenspeicher je Abschnitt, Schluessel = genaue Eingaben -> bitgleich zum Voll-Neurechnen).
# Aufruf: apply.py <eingang> <ausgang>
import hashlib, os, sys

ERLAUBT = {'a7515b980ddc423e84f9d5cdf8f132a6'}
HERE = os.path.dirname(os.path.abspath(__file__))


def main():
    src, dst = sys.argv[1], sys.argv[2]
    raw = open(src, 'rb').read()
    md5 = hashlib.md5(raw).hexdigest()
    if md5 not in ERLAUBT:
        sys.exit('md5 nicht erlaubt: ' + md5)
    s = raw.decode('utf-8')
    if 'ZRL3-BEGIN' in s:
        sys.exit('schon angewendet')
    blk = open(os.path.join(HERE, 'block.js'), encoding='utf-8').read().strip('\n')
    subs = [
        # Block innerhalb spk6DspMake (direkt vor synth) -> kein neuer Top-Level-Name, liegt mit im Worker
        ('\nasync function synth(sr,art,a,Ns,x,o0,prog){\n',
         '\n' + blk + '\nasync function synth(sr,art,a,Ns,x,o0,prog){\n', 1),
        ("const y=regs.length?await pv(x,sr,rr,fvA,H,N,art==='gesang'||!!a.fmt,regs,prog):Float32Array.from(x);",
         "const y=regs.length?await zrl3Pv(x,sr,rr,fvA,H,N,art==='gesang'||!!a.fmt,regs,prog):Float32Array.from(x);/*ZRL3*/", 1),
    ]
    for a, b, n in subs:
        c = s.count(a)
        if c != n:
            sys.exit('Anker %r: %d Treffer statt %d' % (a[:60], c, n))
        s = s.replace(a, b)
    tmp = dst + '.tmp'
    with open(tmp, 'w', encoding='utf-8') as f:
        f.write(s)
    os.replace(tmp, dst)
    print('ok', hashlib.md5(s.encode('utf-8')).hexdigest())


if __name__ == '__main__':
    main()
