#!/usr/bin/env python3
# SPKV2 (4.88): Spektral "Verfeinern" Bass/Drums verbessert (ersetzt den SPKV-Block): Bass-Anschlaege seltener als Kick,
#  Sinus-Bass ohne Obertoene als Ton, "Verfeinern Drums" nach "Verfeinern Bass" teilt das Tiefband gleich.
#  Nur der Verfeinern-Weg (Ziel bass/drums); Zerlegen und andere Ziele bitgleich.
# Aufruf: apply.py <eingang> <ausgang>
import hashlib, os, sys

ERLAUBT = {'695af0504463a6385e21dc94e55b00c9', 'ad45a857fe14b7157456d86da9ee2b17'}
HERE = os.path.dirname(os.path.abspath(__file__))


def main():
    src, dst = sys.argv[1], sys.argv[2]
    if os.path.realpath(dst) == os.path.realpath(src):
        sys.exit('Ausgang = Eingang')
    raw = open(src, 'rb').read()
    md5 = hashlib.md5(raw).hexdigest()
    if md5 not in ERLAUBT:
        sys.exit('md5 nicht erlaubt: ' + md5)
    s = raw.decode('utf-8')
    if 'SPKV2-BEGIN' in s:
        sys.exit('schon angewendet')
    alt = open(os.path.join(HERE, 'alt.js'), encoding='utf-8').read().strip('\n')
    blk = open(os.path.join(HERE, 'block.js'), encoding='utf-8').read().strip('\n')
    if os.environ.get('SPKV2_DEV'):
        blk = blk.replace('dbg:null}', "dbg:(typeof __spkvDbg==='function'?__spkvDbg:null)}", 1)
    subs = [
        # alter SPKV-Block (spkvFix in spk1DspMake, laeuft im Worker) -> SPKV2-Block, gleicher Name, kein neuer Top-Level-Name
        (alt, blk, 1),
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
