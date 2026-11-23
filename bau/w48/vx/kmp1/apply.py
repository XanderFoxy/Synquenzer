#!/usr/bin/env python3
"""KMP1 – kompakte Platte fuer die Kompakt-Sammlung. Aufruf: apply.py <eingang> <ausgang>"""
import hashlib, os, sys, tempfile

OK_MD5 = {'4e0fa4271ebcf1a1c50b668b5cad5c31'}
HERE = os.path.dirname(os.path.abspath(__file__))


def main(src, dst):
    raw = open(src, 'rb').read()
    md5 = hashlib.md5(raw).hexdigest()
    if md5 not in OK_MD5:
        sys.exit('Abbruch: md5 des Eingangs unbekannt: ' + md5)
    s = raw.decode('utf-8')
    if 'KMP1-BEGIN' in s:
        sys.exit('Abbruch: KMP1 schon enthalten')
    block = open(os.path.join(HERE, 'block.js'), encoding='utf-8').read().strip('\n')
    a1 = 'function fillSynthTab(body,i){\n'
    a2 = "if(S.tracks[i].sound.engine==='mk'&&ED.tab!=='fx'){if(mkLoad())MKUI.build(pg,i);return;}"
    reps = [
        (a1, block + '\n' + a1, 1),
        (a2, "if(S.tracks[i].sound.engine==='mk'&&ED.tab!=='fx'){if(mkLoad()&&!(typeof kmp1Fill==='function'&&kmp1Fill(pg,i)))MKUI.build(pg,i);return;}", 1),
    ]
    for old, new, n in reps:
        c = s.count(old)
        if c != n:
            sys.exit('Abbruch: Anker %r gefunden %d mal (erwartet %d)' % (old[:60], c, n))
        s = s.replace(old, new)
    d = os.path.dirname(os.path.abspath(dst))
    fd, tmp = tempfile.mkstemp(dir=d, prefix='.kmp1-')
    with os.fdopen(fd, 'wb') as f:
        f.write(s.encode('utf-8'))
    os.replace(tmp, dst)
    print('ok', hashlib.md5(s.encode('utf-8')).hexdigest())


if __name__ == '__main__':
    if len(sys.argv) != 3:
        sys.exit('Aufruf: apply.py <eingang> <ausgang>')
    main(sys.argv[1], sys.argv[2])
