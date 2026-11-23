#!/usr/bin/env python3
# SPKV (4.87): Spektral "Verfeinern" Bass/Drums - Kick ueber Anschlaege im Takt-Raster, Bass-Anschlaege mit Tonverlauf
#  nicht als Kick, Bass-Grundton-Lage. Nur der Verfeinern-Weg (Ziel bass/drums); ohne Verfeinern bitgleich.
# Aufruf: apply.py <eingang> <ausgang>
import hashlib, os, sys

ERLAUBT = {'280c5b0b6a9ed1f8ac77868fb8d5d38f'}
HERE = os.path.dirname(os.path.abspath(__file__))


def main():
    src, dst = sys.argv[1], sys.argv[2]
    raw = open(src, 'rb').read()
    md5 = hashlib.md5(raw).hexdigest()
    if md5 not in ERLAUBT:
        sys.exit('md5 nicht erlaubt: ' + md5)
    s = raw.decode('utf-8')
    if 'SPKV-BEGIN' in s:
        sys.exit('schon angewendet')
    blk = open(os.path.join(HERE, 'block.js'), encoding='utf-8').read().strip('\n')
    subs = [
        # Block innerhalb spk1DspMake (direkt vor verfeinern) -> kein neuer Top-Level-Name, liegt mit im Worker
        ('\nasync function verfeinern(d,o,emit,qid){\n',
         '\n' + blk + '\nasync function verfeinern(d,o,emit,qid){\n', 1),
        ('const{E,Nf}=refineEst(d,ziel,box.m0,box.m1,box.k1);',
         'const{E,Nf}=refineEst(d,ziel,box.m0,box.m1,box.k1);try{spkvFix(d,ziel,box,E);}catch(e){}/*SPKV*/', 1),
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
