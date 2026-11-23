#!/usr/bin/env python3
"""Paket VL3: Auftakt erkennen + falten, Fähnchen im Gesang-Editor.
Aufruf: apply.py <eingang> <ausgang>"""
import hashlib, os, sys

ALLOWED = {"4e0fa4271ebcf1a1c50b668b5cad5c31"}
HERE = os.path.dirname(os.path.abspath(__file__))


def main():
    src, dst = sys.argv[1], sys.argv[2]
    raw = open(src, "rb").read()
    md5 = hashlib.md5(raw).hexdigest()
    if md5 not in ALLOWED:
        sys.exit("Eingang md5 %s nicht erlaubt" % md5)
    s = raw.decode("utf-8")
    if "VL3-BEGIN" in s:
        sys.exit("VL3 schon drin")
    block = open(os.path.join(HERE, "vl3-block.js"), encoding="utf-8").read()

    R = [
        # 1. Faltung mit festem Startpunkt
        ("if(pickN>2*F){",
         "if(o.fix&&pickN>2*F&&pickN<n-2*F)fs=n-pickN;\nelse if(pickN>2*F){", 1),
        ("const sp=spb(),L=clipB(clip),pre=g3PreOf(a);if(!(pre>.003)||a.at>1e-6||!buf)return null;",
         "const sp=spb(),L=clipB(clip),v3=vl3Sec(clip,a),pre=v3||g3PreOf(a);if(!(pre>.003)||a.at>1e-6||!buf)return null;", 1),
        ("+':'+tkPkId(buf)+':'+pre;", "+':'+tkPkId(buf)+':'+pre+(v3?'f':'');", 1),
        ("pickN:Math.round(pre*sr),tailS:0,tailN:0,sr});", "pickN:Math.round(pre*sr),tailS:0,tailN:0,sr,fix:!!v3});", 1),
        # 2. Clip-WAV "Loop rund" (nachgeladener VL2X-Block)
        ("pickN: Math.round(pre * sr), tailS: iOut, tailN: Math.round(post * sr), sr, g})",
         "pickN: Math.round((vl3Sec(c, a) || pre) * sr), tailS: iOut, tailN: Math.round(post * sr), sr, g, fix: vl3Sec(c, a) > 0})", 1),
        # 3. Auto-Faltung nach Aufnahme/Import
        ("if(vl2TakePre(id,m,pcm,ia,sr)){G3.noPre.delete(id);return;}",
         "if(vl2TakePre(id,m,pcm,ia,sr)){G3.noPre.delete(id);vl3Auto(id,pcm,ia,sr);return;}", 1),
        ("m.pre=v;const cur=S.takes&&S.takes[id];if(cur&&cur!==m)cur.pre=Object.assign({},v);",
         "m.pre=v;const cur=S.takes&&S.takes[id];if(cur&&cur!==m)cur.pre=Object.assign({},v);vl3Auto(id,pcm,ia,sr);", 1),
        # 4. Speichern/Laden + Rückgängig
        ("if(out.audio&&(c.vorlaufModus==='gefaltet'||c.vorlaufModus==='aus'))out.vorlaufModus=c.vorlaufModus;",
         "if(out.audio&&(c.vorlaufModus==='gefaltet'||c.vorlaufModus==='aus'))out.vorlaufModus=c.vorlaufModus;\n"
         "if(out.audio&&isNum(c.vl3s)&&c.vl3s>0)out.vl3s=+Math.min(c.vl3s,30).toFixed(4);", 1),
        ("tktClipClean(c,o);",
         "tktClipClean(c,o);\nif(c.vorlaufModus)o.vorlaufModus=c.vorlaufModus;if(isNum(c.vl3s))o.vl3s=c.vl3s;", 1),
        # 5. Editor: Fläche vor der 1 erreichbar, Fähnchen einhängen
        ("V.x0=clamp(V.x0,-.25,Math.max(0,span-V.W/V.ppb,V.pg||0));",
         "V.x0=clamp(V.x0,-.25-(opts.preB?Math.max(0,+opts.preB()||0):0),Math.max(0,span-V.W/V.ppb,V.pg||0));", 1),
        ("center:60,noteDeco:vx1rDeco,", "center:60,noteDeco:vx1rDeco,preB:vl3PreB,", 1),
        ("vx1rAnalyse(id).then(()=>{if(vx1rOpenNow())vx1rSync();}).catch(logErr);",
         "vx1rAnalyse(id).then(()=>{if(vx1rOpenNow())vx1rSync();}).catch(logErr);\nvl3Mount();", 1),
        # 6. Block
        ("const VL2L={loaded:false,ms:0,err:null};", block + "\nconst VL2L={loaded:false,ms:0,err:null};", 1),
    ]
    for old, new, n in R:
        c = s.count(old)
        if c != n:
            sys.exit("Anker %d statt %d: %r" % (c, n, old[:70]))
        s = s.replace(old, new)

    tmp = dst + ".tmp"
    with open(tmp, "w", encoding="utf-8") as f:
        f.write(s)
    os.replace(tmp, dst)
    print("ok", hashlib.md5(s.encode("utf-8")).hexdigest())


if __name__ == "__main__":
    main()
