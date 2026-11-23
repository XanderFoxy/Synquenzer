#!/usr/bin/env python3
# TON2 – erster Ton der Audio-Clips (Original-Spur) nach dem Laden: Stücke parallel lesen,
# Lautheits-Analyse mit dem Take merken statt neu rechnen.
# python3 apply.py <eingang> <ausgang>
import hashlib, os, sys

ERLAUBT = {'a7515b980ddc423e84f9d5cdf8f132a6'}
HIER = os.path.dirname(os.path.abspath(__file__))


def main():
    src, dst = sys.argv[1], sys.argv[2]
    raw = open(src, 'rb').read()
    md5 = hashlib.md5(raw).hexdigest()
    if md5 not in ERLAUBT:
        sys.exit('TON2: falscher Eingang md5 %s' % md5)
    s = raw.decode('utf-8')
    if 'TON2-BEGIN' in s:
        sys.exit('TON2: schon eingebaut')
    block = open(os.path.join(HIER, 'block.js'), encoding='utf-8').read().strip('\n')

    H = [
        # 1) tkPcm: Stücke vorab parallel anfordern (höchstens TON2_W gleichzeitig), weiter in Reihenfolge einsetzen
        ("const out=new Int16Array(m.len);let o=0;\nfor(const k of m.chunks){\nconst b=await kv.aget(k);if(!b)return null;",
         "const out=new Int16Array(m.len);let o=0;const ton2g=typeof ton2Pf==='function'?ton2Pf(m.chunks):k=>kv.aget(k);/*TON2*/\n"
         "for(const k of m.chunks){\nconst b=await ton2g(k);if(!b)return null;"),
        # 2) tkLoad: gemerkte Lautheits-Analyse gleichzeitig mit den Stücken lesen
        ("const p=tkPcm(id).then(pcm=>{",
         "const p=(typeof ton2Load==='function'?ton2Load(id):tkPcm(id))/*TON2*/.then(pcm=>{"),
        # 3) tkLoad: Puffer da -> gemerkte Analyse übernehmen (dann rechnet vpKick nichts mehr)
        ("const b=tkToBuffer(pcm,m.sr);if(b)TK.buf.set(id,vpKick(b));",
         "const b=tkToBuffer(pcm,m.sr);/*TON2*/if(b&&typeof ton2Use==='function')ton2Use(id,b);if(b)TK.buf.set(id,vpKick(b));"),
        # 4) Analyse fertig gerechnet -> mit dem Take merken (nur Roh-Puffer eines Takes)
        ("function vpFinish(J){VP.m.set(J.b,J.r);",
         "function vpFinish(J){VP.m.set(J.b,J.r);/*TON2*/if(J.st===3&&typeof ton2Done==='function')ton2Done(J.b,J.r);"),
        # 5) Block vor tkLoad
        ("\nfunction tkLoad(id){", "\n" + block + "\nfunction tkLoad(id){"),
    ]
    for a, b in H:
        n = s.count(a)
        if n != 1:
            sys.exit('TON2: Anker %d× statt 1×: %s' % (n, a[:70]))
        s = s.replace(a, b, 1)

    out = s.encode('utf-8')
    tmp = dst + '.tmp-ton2'
    with open(tmp, 'wb') as f:
        f.write(out)
    os.replace(tmp, dst)
    print('TON2 ok', hashlib.md5(out).hexdigest(), len(out))


if __name__ == '__main__':
    main()
