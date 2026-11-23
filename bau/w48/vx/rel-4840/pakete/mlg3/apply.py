#!/usr/bin/env python3
"""MLG3 – Retro-Ansicht im Klang-Editor. Aufruf: apply.py <eingang> <ausgang>"""
import hashlib, os, sys, tempfile

OK_MD5 = {'9bb6ee8104dbd029b77c5d5e7a7c80ed', '4e0fa4271ebcf1a1c50b668b5cad5c31'}
HERE = os.path.dirname(os.path.abspath(__file__))


def main(src, dst):
    raw = open(src, 'rb').read()
    md5 = hashlib.md5(raw).hexdigest()
    if md5 not in OK_MD5:
        sys.exit('Abbruch: md5 des Eingangs unbekannt: ' + md5)
    s = raw.decode('utf-8')
    if 'MLG3-BEGIN' in s:
        sys.exit('Abbruch: MLG3 schon enthalten')
    block = open(os.path.join(HERE, 'block.js'), encoding='utf-8').read().strip('\n')
    a1 = 'window.MLG1={core:mlgCore,toVa:mlToVa,werk:mlgWerk,open:mlgOpen,apply:mlgApply,state:MLG};\n'
    reps = [
        (a1, a1 + block + '\n', 1),
        ('\nfillSynthTab(F.body,i);\n',
         "\nif(!(typeof mlg3Fill==='function'&&mlg3Fill(F,i)))fillSynthTab(F.body,i);\n", 1),
        ('`<span class="beng">${nv?',
         "(typeof mlg3Chip==='function'?mlg3Chip(f):'')+`<span class=\"beng\">${nv?", 1),
    ]
    for old, new, n in reps:
        c = s.count(old)
        if c != n:
            sys.exit('Abbruch: Anker %r gefunden %d mal (erwartet %d)' % (old[:60], c, n))
        s = s.replace(old, new)
    d = os.path.dirname(os.path.abspath(dst))
    fd, tmp = tempfile.mkstemp(dir=d, prefix='.mlg3-')
    with os.fdopen(fd, 'wb') as f:
        f.write(s.encode('utf-8'))
    os.replace(tmp, dst)
    print('ok', hashlib.md5(s.encode('utf-8')).hexdigest())


if __name__ == '__main__':
    if len(sys.argv) != 3:
        sys.exit('Aufruf: apply.py <eingang> <ausgang>')
    main(sys.argv[1], sys.argv[2])
