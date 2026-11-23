#!/usr/bin/env python3
# ENT1B: Bildwechsel-Takt (1/2/4/8 Takte / Musik folgt) gehoert zum Projekt.
import sys, hashlib, os, tempfile

OK_MD5 = {'9cfae59f07ef6b087ffe339b125878b3'}

BLOCK = r"""
/*ENT1B-BEGIN*/
const ENT1B_OK=v=>v==='m'||VID6.n.includes(v);
function ent1bProj(){const s=typeof S!=='undefined'&&S&&S.settings;return s&&ENT1B_OK(s.vid6n)?s.vid6n:null;}
function ent1bDev(){const p=uiPrefs().vv||{};return p.vid6n==='m'?'m':VID6.n.includes(p.vid6n)?p.vid6n:2;}
function ent1bFx(v){if(ENT1B_OK(v))vvPrefSet('vid6n',v);if(typeof VD3!=='undefined'&&VD3)VD3.chipC=null;UI.dirty.song=true;vr1Dirty();vid6WarmSoon();}
function ent1bSet(x){
if(!S||!S.settings||!ENT1B_OK(x))return;
const cur=ent1bProj(),was=cur!==null?cur:ent1bDev();
if(cur===x)return;
S.settings.vid6n=x;markDirty();
undoPush({kind:'set',key:'vid6n',before:JSON.stringify(was),label:'Bildwechsel'});
}
function ent1bNew(p){try{const v=(uiPrefs().vv||{}).vid6n;if(p&&p.settings)p.settings.vid6n=v==='m'||[1,2,4,8].includes(v)?v:2;}catch(e){}}
/*ENT1B-END*/
"""

EDITS = [
    # Projekt-Wert zuerst, sonst Geraet-Wert (alte Projekte wie bisher)
    ("function vid6N(){const p=uiPrefs().vv||{};",
     "function vid6N(){/*ENT1B*/const j=ent1bProj();if(j!==null)return j==='m'?0:j;const p=uiPrefs().vv||{};", 1),
    # Wahl landet im Projekt (mit Rueckgaengig); Geraet-Wert bleibt Vorschlag fuer neue Projekte
    ("vvPrefSet('vid6n',x);",
     "/*ENT1B*/ent1bSet(x);vvPrefSet('vid6n',x);", 1),
    ("function vid6Std(){if(vid6N()!==2)vid6Set(2);}",
     "function vid6Std(){if(vid6N()!==2)vid6Set(2);}\n" + BLOCK, 1),
    # Rueckgaengig: Video neu zeichnen
    ("function settingApply(key,v){\nS.settings[key]=v;markDirty();",
     "function settingApply(key,v){\nS.settings[key]=v;markDirty();/*ENT1B*/if(key==='vid6n')ent1bFx(v);", 1),
    # Laden: Wert aus der Datei uebernehmen
    ("d.metro=normBool(s.metro,d.metro);",
     "d.metro=normBool(s.metro,d.metro);/*ENT1B*/if(s.vid6n==='m'||[1,2,4,8].includes(s.vid6n))d.vid6n=s.vid6n;", 1),
    # Neues Projekt: Geraet-Wert als Vorschlag
    ("p.name=freshProjectName();if(HIST)HIST.mark.set(p,'new');return p;}",
     "p.name=freshProjectName();/*ENT1B*/ent1bNew(p);if(HIST)HIST.mark.set(p,'new');return p;}", 1),
    # Beschriftung
    ("(chip?' · für alle Songs':'')",
     "(chip?' · dieses Projekt':'')", 1),
]


def main():
    src, dst = sys.argv[1], sys.argv[2]
    raw = open(src, 'rb').read()
    md5 = hashlib.md5(raw).hexdigest()
    if md5 not in OK_MD5:
        sys.exit('ENT1B: md5 unbekannt: ' + md5)
    t = raw.decode('utf-8')
    if 'ENT1B' in t:
        sys.exit('ENT1B: schon drin')
    for old, new, n in EDITS:
        c = t.count(old)
        if c != n:
            sys.exit('ENT1B: Anker %r: %d statt %d' % (old[:60], c, n))
        t = t.replace(old, new)
    d = os.path.dirname(os.path.abspath(dst)) or '.'
    fd, tmp = tempfile.mkstemp(dir=d, prefix='.ent1b-')
    with os.fdopen(fd, 'wb') as f:
        f.write(t.encode('utf-8'))
    os.replace(tmp, dst)
    print('ENT1B ok', hashlib.md5(t.encode('utf-8')).hexdigest())


if __name__ == '__main__':
    main()
