#!/usr/bin/env python3
"""Paket VTRIM: Gesang zerstörungsfrei beschneiden (Ende-/Anfang-Fähnchen im Gesang-Editor).
Aufruf: apply.py <eingang> <ausgang>"""
import hashlib, os, sys

ALLOWED = {"44fa0f187f10e18dfc5944fcfe1b5bdb"}
HERE = os.path.dirname(os.path.abspath(__file__))


def main():
    if len(sys.argv) != 3:
        sys.exit("Aufruf: apply.py <eingang> <ausgang>")
    src, dst = sys.argv[1], sys.argv[2]
    if os.path.abspath(dst) == "/dev/null" or os.path.abspath(src) == os.path.abspath(dst):
        sys.exit("Ausgang ungültig")
    raw = open(src, "rb").read()
    md5 = hashlib.md5(raw).hexdigest()
    if md5 not in ALLOWED:
        sys.exit("Eingang md5 %s nicht erlaubt" % md5)
    s = raw.decode("utf-8")
    if "VTRIM-BEGIN" in s:
        sys.exit("VTRIM schon drin")
    block = open(os.path.join(HERE, "vtrim-block.js"), encoding="utf-8").read().rstrip("\n")
    if not block.startswith("/* VTRIM-BEGIN") or not block.endswith("/* VTRIM-END */"):
        sys.exit("Block ohne VTRIM-BEGIN/-END")

    R = [
        # 1. Wiedergabe-Kern (Matrix, Loop, Song, Mixdown): nur mit Beschnitt eigener Weg
        ("if(off>=a.out-1e-4)continue;\ntkStartSrc({i,buf:o.buf,when:t0,off,end:Math.min(t1,t0+(a.out-off))",
         "if(off>=a.out-1e-4)continue;\nif(a.vt){vtrStart(i,o.buf,a,t0,t1,off,joined,xs,X,pb<o.B-1e-6,key,vox);continue;}\n"
         "tkStartSrc({i,buf:o.buf,when:t0,off,end:Math.min(t1,t0+(a.out-off))"),
        # 2. Nachlauf hinter dem Loop-Ende endet am Ende-Fähnchen
        ("Math.max(0,Math.min(p.sec,m.len/m.sr-a.out)):0;}",
         "Math.max(0,Math.min(p.sec,m.len/m.sr-a.out,a.vt?vtrPostCap(a):Infinity)):0;}"),
        # 3. Faltpunkt (↻ gefaltet) mit beschnittenen Daten
        ("F=vl2FoldMake([buf.getChannelData(0)],{i1:Math.round(a.in*sr),n,segN:Math.round((a.out-a.in)*sr),pickN:Math.round(pre*sr),tailS:0,tailN:0,sr,fix:!!v3});",
         "F=vl2FoldMake([a.vt?vtrData(buf,a):buf.getChannelData(0)],{i1:Math.round(a.in*sr),n,segN:Math.round((a.out-a.in)*sr),pickN:Math.round(pre*sr),tailS:0,tailN:0,sr,fix:!!v3});"),
        ("+':'+tkPkId(buf)+':'+pre+(v3?'f':'');",
         "+':'+tkPkId(buf)+':'+pre+(v3?'f':'')+(a.vt?':vt'+JSON.stringify(a.vt):'');"),
        # 4. Clip-WAV (nachgeladene Vorlage): mit Vorlauf und Loop rund
        ("d=buf.getChannelData(0),L=clipB(c),bpb=L/c.len",
         "d=a.vt&&typeof vtrData==='function'?vtrData(buf,a):buf.getChannelData(0),L=clipB(c),bpb=L/c.len"),
        # 5. ▶ im Gesang-Editor
        ("const T0=Math.max(0,vx1rHeard(a,b0)),T1=Math.min(buf.duration,isNum(a.out)?",
         "const vtw=a.vt?vtrW(a):null,T0=Math.max(0,vtw&&vtw.a!=null?vtw.a:0,vx1rHeard(a,b0)),T1=Math.min(buf.duration,vtw&&vtw.e!=null?vtw.e:Infinity,isNum(a.out)?"),
        # 6. Wellenbild (Matrix-Zelle, Song): Weggeschnittenes leer
        ("const key=id+':'+tkPkId(b)+':'+(a?a.in+':'+a.out:'')+':'+n,c=TK.peaks.get(key);",
         "const key=id+':'+tkPkId(b)+':'+(a?a.in+':'+a.out+(a.vt?':vt'+JSON.stringify(a.vt):''):'')+':'+n,c=TK.peaks.get(key);"),
        ("for(let k=0;k<n;k++)out[k]=Math.sqrt(out[k]/mx);\nif(TK.peaks.size>200)TK.peaks.clear();",
         "for(let k=0;k<n;k++)out[k]=Math.sqrt(out[k]/mx);\nif(a&&a.vt)vtrPk(out,a,i0,step,sr);\nif(TK.peaks.size>200)TK.peaks.clear();"),
        ("+vl2Sig(clip);}",
         "+vl2Sig(clip)+(a.vt?':vt'+JSON.stringify(a.vt):'');}"),
        # 7. Vorlauf-Fähnchen gilt nach dem Ziehen auch in „▸ einmal“ (Marker v3e, alte Projekte unverändert)
        ("const vl2PreOf=(c,a)=>(vl2ModeOf(c)==='aus'?0:g3PreOf(a));",
         "const vl2PreOf=(c,a)=>(vl2ModeOf(c)==='aus'?0:(a&&a.v3e&&vl3Sec(c,a))||g3PreOf(a));"),
        ("function vl3Pos(x,lim){const q=spb()*.25;return clamp(x.c.vl3s>0?x.c.vl3s:(g3PreOf(x.a)||spb()),q,lim);}",
         "function vl3Pos(x,lim){const q=spb()*.25;return clamp(x.c.vl3s>0&&(x.a.v3e||vl2ModeOf(x.c)!=='einmal')?x.c.vl3s:(g3PreOf(x.a)||spb()),q,lim);}"),
        ("sec=+sec.toFixed(4);if(c.vl3s===sec)return true;\nconst before=cleanClip(c);c.vl3s=sec;",
         "sec=+sec.toFixed(4);if(c.vl3s===sec&&c.audio.v3e)return true;\nconst before=cleanClip(c);c.vl3s=sec;c.audio.v3e=1;"),
        # 8. Fähnchen hängen an der Bildschleife des Vorlauf-Fähnchens
        ("function vl3Drop(){vl3MenuClose();", "function vl3Drop(){vtrDrop();vl3MenuClose();"),
        ("function vl3Mount(){", "function vl3Mount(){vtrDrop();VTR.dead=false;"),
        ("try{vl3Paint();}catch(e){logErr(e);vl3Drop();return;}",
         "try{vl3Paint();}catch(e){logErr(e);vl3Drop();return;}\ntry{vtrPaint();}catch(e){VTR.dead=true;logErr(e);vtrDrop();}"),
        # 9. Gesang→Noten: verknüpfte Noten im weggeschnittenen Teil schweigen
        ("const cs=R.cstart[i],LF=lf1Win(clip,cs,from,to),L=LF?1e9:clipB(clip),sp=spb(),now=AU.ctx.currentTime,ev=new Map();\nfor(const nt of LF||clip.notes){\nif(nt.t>=L-1e-9)continue;",
         "const cs=R.cstart[i],LF=lf1Win(clip,cs,from,to),L=LF?1e9:clipB(clip),sp=spb(),now=AU.ctx.currentTime,ev=new Map(),vtw=clip.take&&!LF?vtrMel(i,clip):null;\nfor(const nt of LF||clip.notes){\nif(nt.t>=L-1e-9)continue;\nif(vtw&&(nt.t>=vtw.e-1e-9||nt.t<vtw.a-1e-9))continue;"),
        # 10. Block hinter VL3
        ("/* VL3-END */", "/* VL3-END */\n" + block),
    ]
    if len(R) != 17:
        sys.exit("Ankerzahl %d statt 17" % len(R))
    for old, new in R:
        c = s.count(old)
        if c != 1:
            sys.exit("Anker %d statt 1: %r" % (c, old[:70]))
    for old, new in R:
        s = s.replace(old, new, 1)

    tmp = dst + ".tmp"
    with open(tmp, "w", encoding="utf-8") as f:
        f.write(s)
    os.replace(tmp, dst)
    print("ok", hashlib.md5(s.encode("utf-8")).hexdigest())


if __name__ == "__main__":
    main()
