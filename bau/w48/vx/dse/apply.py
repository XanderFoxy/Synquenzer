#!/usr/bin/env python3
# DSE (4.88): Drum-Schritt-Editor der Einzelspur - FOLGEN-Chip, Locks je Schritt (lange druecken, wie DRUMS),
#  eigene Laenge/Richtung je Spur (D1, polymetrisch). Ohne Bedienung: Projekt-Daten und Wiedergabe unveraendert.
# Aufruf: apply.py <eingang> <ausgang>
import hashlib, os, sys

ERLAUBT = {'695af0504463a6385e21dc94e55b00c9'}
HERE = os.path.dirname(os.path.abspath(__file__))


def main():
    if len(sys.argv) != 3:
        sys.exit('Aufruf: apply.py <eingang> <ausgang>')
    src, dst = sys.argv[1], sys.argv[2]
    if os.path.abspath(dst) == '/dev/null':
        sys.exit('Ausgang /dev/null nicht erlaubt')
    raw = open(src, 'rb').read()
    md5 = hashlib.md5(raw).hexdigest()
    if md5 not in ERLAUBT:
        sys.exit('md5 nicht erlaubt: ' + md5)
    s = raw.decode('utf-8')
    if 'DSE-BEGIN' in s:
        sys.exit('schon angewendet')
    blk = open(os.path.join(HERE, 'block.js'), encoding='utf-8').read().strip('\n')
    subs = [
        # Block direkt hinter der MTX3B-API (gleiches Skript, Top-Level)
        ('Object.assign(SYNQUENZER,{mtx3b:MTX3B_API});',
         'Object.assign(SYNQUENZER,{mtx3b:MTX3B_API});\n' + blk, 1),
        # mtx3bDrumView: FOLGEN-Chip vor dem Schliessen-Knopf
        ("const N=dStepsOf(c),se=el('div','se lse');",
         "if(typeof dseFol==='function')x.before(dseFol());/*DSE*/const N=dStepsOf(c),se=el('div','se lse');", 1),
        # mtx3bDrumView: Finger-Halt fuer FOLGEN
        ('cols:null,qAt:N===16?null:dStepQ(c),',
         "cols:null,qAt:N===16?null:dStepQ(c),reg:typeof folReg==='function'?folReg('steps'):undefined,/*DSE*/", 1),
        # mtx3bDrumView: Lock-Punkt / Bedingung an der Zelle (wie DRUMS)
        ("cell.classList.toggle('d1o',!!l&&si>=l.Ls);cell.classList.toggle('d1e',!!l&&si===l.Ls-1);",
         "cell.classList.toggle('d1o',!!l&&si>=l.Ls);cell.classList.toggle('d1e',!!l&&si===l.Ls-1);if(typeof pl1Deco==='function')pl1Deco(cell,n);/*DSE*/", 1),
        # mtx3bDrumView: Laenge-Knopf, Lock-Halten, Blaettern = von Hand
        ('V.E=E;V.se=se;ED.mtx3b=V;MTX3B.ed=V;',
         "V.E=E;V.se=se;ED.mtx3b=V;MTX3B.ed=V;if(typeof dseView==='function')dseView(V,goPg,pager,acts,E);/*DSE*/", 1),
        # mtx3bFrame: FOLGEN + Lauflicht auf der eigenen Laenge
        ("if(typeof pl1Ll==='function'&&!pl1Ll())st=-1;",
         "if(typeof dseFrame==='function')st=dseFrame(V,c,vs,bAud,st);/*DSE*/if(typeof pl1Ll==='function'&&!pl1Ll())st=-1;", 1),
        # PL1: Ziel einer Einzelspur (tg.dse) = Drum-Locks des Pads
        ('pl1Eng(tg.t)', "(tg.dse?'drum':pl1Eng(tg.t))", 2),
        ("(S.tracks[tg.t].kind==='drum'&&k!=='tune'", "((tg.dse||S.tracks[tg.t].kind==='drum')&&k!=='tune'", 1),
        ("if(tr.kind==='drum'){const q=p.split('.')", "if(tr.kind==='drum'||tg.dse){const q=p.split('.')", 1),
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
