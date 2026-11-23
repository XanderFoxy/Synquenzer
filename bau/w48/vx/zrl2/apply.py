#!/usr/bin/env python3
# ZRL2 (4.85): Zerlegen bitgleich schneller.
#  A) Tiefband (magsLo): Rand-Rahmen des vorigen Streifens weiterreichen (gleiche FFT-Paare -> gleiche Bits)
#  B) zPrep: Quantisierung ohne log10 (Schwellen-Tabelle, genaue Rechnung nahe der Schwellen)
# Aufruf: apply.py <eingang> <ausgang>
import hashlib, os, sys

ERLAUBT = {'9c7f63cf9e6a36aef575d37c064e4022'}
HERE = os.path.dirname(os.path.abspath(__file__))


def main():
    src, dst = sys.argv[1], sys.argv[2]
    raw = open(src, 'rb').read()
    md5 = hashlib.md5(raw).hexdigest()
    if md5 not in ERLAUBT:
        sys.exit('md5 nicht erlaubt: ' + md5)
    s = raw.decode('utf-8')
    if 'ZRL2-BEGIN' in s:
        sys.exit('schon angewendet')
    blkA = open(os.path.join(HERE, 'block-lo.js'), encoding='utf-8').read().strip('\n')
    blkB = open(os.path.join(HERE, 'block-q.js'), encoding='utf-8').read().strip('\n')
    subs = [
        # B: Block vor zPrep (spk1DspMake-Ebene, liegt damit auch im Worker-Text)
        ('async function zPrep(d,emit,qid){',
         blkB + '\nasync function zPrep(d,emit,qid){', 1),
        ('for(let i=0;i<n*KV;i++){const v=X[i]>0?Math.round((20*Math.log10(X[i])+90)*1.6):0;Q[m0*KV+i]=v<1?(X[i]>0?1:0):v>255?255:v;}',
         'zrl2Q(X,n*KV,Q,m0*KV);/*ZRL2*/', 1),
        # A: Block vor magsLo (spk3DspMake-Ebene)
        ('function magsLo(d,N,cen,K,fmax){',
         blkA + '\nfunction magsLo(d,N,cen,K,fmax){', 1),
        ('ny=y.length;\nfor(let i=0;i<n;i+=2){\nconst sA=Math.round((cen[i]-N/2)/R)',
         'ny=y.length;\nconst zL=zrl2LoGet(d,N,cen,out,K,R,y,w);/*ZRL2*/\nfor(let i=zL;i<n;i+=2){\nconst sA=Math.round((cen[i]-N/2)/R)', 1),
        ('return out;\n}\nfunction kickTpl(d,N,K){',
         'zrl2LoPut(d,N,cen,out,K,R,y,w);/*ZRL2*/\nreturn out;\n}\nfunction kickTpl(d,N,K){', 1),
        ('Z2.magsLo=magsLo;',
         'Z2.magsLo=magsLo;Z2.zrl2LoW=zrl2LoW;/*ZRL2*/', 1),
        # Zwischenspeicher am Ende von zerlegen freigeben (auch nach Abbruch)
        ('finally{d.busy=null;d.zStop=false;zrl2W.delete(d);}',
         'finally{d.busy=null;d.zStop=false;zrl2W.delete(d);if(Z2&&Z2.zrl2LoW)Z2.zrl2LoW.delete(d);/*ZRL2*/}', 1),
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
