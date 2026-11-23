#!/usr/bin/env python3
# BM1 - Filter je Note (CC74 je Note) auch fuer die Bit-Mask-Engine: Cutoff-Faktor je Stimme im Bit-Mask-Kern.
# python3 apply.py <eingang> <ausgang>
import hashlib, os, sys

ERLAUBT = ['a7515b980ddc423e84f9d5cdf8f132a6']
HIER = os.path.dirname(os.path.abspath(__file__))


def main():
    src, dst = sys.argv[1], sys.argv[2]
    raw = open(src, 'rb').read()
    md5 = hashlib.md5(raw).hexdigest()
    if md5 not in ERLAUBT:
        sys.exit('BM1: falscher Eingang md5 %s' % md5)
    s = raw.decode('utf-8')
    if 'BM1-BEGIN' in s:
        sys.exit('BM1: schon eingebaut')
    block = open(os.path.join(HIER, 'block.js'), encoding='utf-8').read().strip('\n')

    H = [
        # ---- Bit-Mask-Kern (Worklet-Text BM_WK; nur ASCII, kein Backtick) ----
        # 1) Note-an: Halbton-Versatz fc -> Faktor fq (fehlt = 1)
        ("this.q.push({k: 1, at, n: num(x.n, 60), v: num(x.v, .8), d: x.d | 0, id: x.id == null ? -1 : x.id});",
         "this.q.push({k: 1, at, n: num(x.n, 60), v: num(x.v, .8), d: x.d | 0, id: x.id == null ? -1 : x.id, "
         "fq: typeof x.fc === 'number' && Math.abs(x.fc) <= 96 ? Math.pow(2, x.fc / 12) : 1});   /*BM1*/"),
        # 2) Stimme: eigener Cutoff-Faktor
        ("this.key = -1; this.susHeld = false;",
         "this.key = -1; this.susHeld = false; this.fq = 1;   /*BM1*/"),
        # 3) neue Stimme: Faktor der Note
        ("v.on = true; v.ghost = false; v.gate = true; v.id = e.id; v.key = e.n; v.n = n; v.vel = e.v; v.pg = pg; v.ord = ++this.ord; v.kill = 0;",
         "v.on = true; v.ghost = false; v.gate = true; v.id = e.id; v.key = e.n; v.n = n; v.vel = e.v; v.pg = pg; v.ord = ++this.ord; v.kill = 0; v.fq = e.fq || 1;   /*BM1*/"),
        # 4) Stimme uebernimmt eine Taste (MONO legato, SLUR): Faktor der neuen Note
        ("takeKey(v, e) { v.id = e.id; v.key = e.n;",
         "takeKey(v, e) { v.fq = e.fq || 1; /*BM1*/ v.id = e.id; v.key = e.n;"),
        # 5) gehaltene Taste merkt ihren Faktor ...
        ("S.keys.push({id: e.id, n: e.n, v: e.v, ord: ++this.ord, ended: false});",
         "S.keys.push({id: e.id, n: e.n, v: e.v, ord: ++this.ord, ended: false, fq: e.fq || 1});   /*BM1*/"),
        # 6) ... und MONO zurueck zur gehaltenen Taste nimmt ihn wieder
        ("v.id = k2.id; v.key = k2.n; v.n = k2.n; this.glideFrom(v, from);",
         "v.id = k2.id; v.key = k2.n; v.n = k2.n; v.fq = k2.fq || 1; /*BM1*/ this.glideFrom(v, from);"),
        # 7) Geist-Stimme (Ausblenden beim Stehlen) klingt mit demselben Filter aus
        ("g.on = true; g.n = v.n; g.pg = v.pg;",
         "g.on = true; g.fq = v.fq; /*BM1*/ g.n = v.n; g.pg = v.pg;"),
        # 8) Filter: Cutoff x Faktor der Stimme (Faktor 1 = unveraendert)
        ("fc = clamp(fc, 10, .45 * sr);",
         "if (v.fq !== 1) fc *= v.fq;   /*BM1*/\n      fc = clamp(fc, 10, .45 * sr);"),
        # ---- Hauptfaden ----
        # 9) Bit-Mask-Spur: Note-an traegt den Versatz (nur wenn die Note einen Wert hat)
        ("E.on=(id,n,v,at,from,d)=>{E.notes.set(id,n);E.at0.set(id,at);E.ons.push({n,v,at,d:d||0,id});q();};",
         "E.on=(id,n,v,at,from,d,lk)=>{E.notes.set(id,n);E.at0.set(id,at);const o={n,v,at,d:d||0,id};if(lk)bm1On(o,lk);/*BM1*/E.ons.push(o);q();};"),
        # 10) lkNoteX -> lage1LkAdd: fuer Bit Mask das Merker-Paar
        ("function lage1LkAdd(i,snd,wk,nt,out,nat,clip){\n",
         "function lage1LkAdd(i,snd,wk,nt,out,nat,clip){\nif(bm1Is(snd))return bm1LkAdd(nt,out);/*BM1*/\n"),
        # 11) LAGE-Blatt, Reiter Filter: Bit Mask kann es jetzt
        ("const on=!!lage1Pref().flt,eng=lage1FcEng(tr.sound),",
         "const on=!!lage1Pref().flt,eng=lage1FcEng(tr.sound)||bm1Is(tr.sound)/*BM1*/,"),
        ("'Dieser Klang hat keinen Filter je Note (geht bei VA, FM, WT und '+esc(MK_LABEL)+').'",
         "'Dieser Klang hat keinen Filter je Note (geht bei VA, FM, WT, '+esc(MK_LABEL)+' und '+esc(BM_NAME)+').'/*BM1*/"),
        # 12) Block im Hauptskript vor lkNoteX (der Bit-Mask-Teil sq-bm-src wird erst bei Bedarf geladen)
        ("function lkNoteX(i,clip,nt,rb){", block + "\nfunction lkNoteX(i,clip,nt,rb){"),
    ]
    for a, b in H:
        n = s.count(a)
        if n != 1:
            sys.exit('BM1: Anker %d x statt 1 x: %s' % (n, a[:70]))
        s = s.replace(a, b, 1)

    out = s.encode('utf-8')
    tmp = dst + '.tmp-bm1'
    with open(tmp, 'wb') as f:
        f.write(out)
    os.replace(tmp, dst)
    print('BM1: ok %s md5 %s' % (dst, hashlib.md5(out).hexdigest()))


if __name__ == '__main__':
    main()
