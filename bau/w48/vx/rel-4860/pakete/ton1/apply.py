#!/usr/bin/env python3
# TON1 – erster Klangkorn-Ton nach dem Laden nie mehr still.
# python3 apply.py <eingang> <ausgang>
import hashlib, os, sys

ERLAUBT = {'9c7f63cf9e6a36aef575d37c064e4022'}
HIER = os.path.dirname(os.path.abspath(__file__))


def main():
    src, dst = sys.argv[1], sys.argv[2]
    raw = open(src, 'rb').read()
    md5 = hashlib.md5(raw).hexdigest()
    if md5 not in ERLAUBT:
        sys.exit('TON1: falscher Eingang md5 %s' % md5)
    s = raw.decode('utf-8')
    if 'TON1-BEGIN' in s:
        sys.exit('TON1: schon eingebaut')
    block = open(os.path.join(HIER, 'block.js'), encoding='utf-8').read().strip('\n')

    H = [
        # Worklet-Kern (spk7CoreMake, wird als Text ins Worklet gegeben)
        # 1) neue Stimme: Wartezeit 0, Einblende voll
        ("v.prime=1;v.fpI=0;", "v.prime=1;v.fpI=0;v.wt=0;v.ld=1;/*TON1*/"),
        # 2) Quelle schon da (vorab ohne Spektren) und jetzt komplett: Stimmen mit der Vorab-Quelle übernehmen sie
        ("CS=X&&X.length?{X,XL:X.length,XR:(e.sr||SR)/SR,F0:e.f0>20?e.f0:261.63,FZ,FL,FK:e.fk>0?+e.fk:1,NF:FZ&&FL?Math.floor(FZ.length/FL):0}:null;return;",
         "const o0=CS;/*TON1*/CS=X&&X.length?{X,XL:X.length,XR:(e.sr||SR)/SR,F0:e.f0>20?e.f0:261.63,FZ,FL,FK:e.fk>0?+e.fk:1,NF:FZ&&FL?Math.floor(FZ.length/FL):0,PRE:e.pre?1:0}:null;"
         "if(CS&&o0&&o0.PRE&&!CS.PRE&&o0.XL===CS.XL&&o0.F0===CS.F0&&o0.XR===CS.XR)for(const v of V)if(v.S===o0)v.S=CS;return;"),
        # 3) Stimme ohne Quelle: Hüllkurve läuft weiter (auch Ausklang), Wartezeit zählt
        ("if(!S){if(v.st===4)fin(v);continue;}",
         "if(!S){/*TON1*/let env=v.env,st=v.st;const rate=v.rate;"
         "for(let j=0;j<n&&st;j++){if(st===1){env+=rate;if(env>=1){env=1;st=2;}}else if(st===2){env-=dRate;if(env<=susE){env=susE;st=3;}}else if(st===4){env-=rate;if(env<=0){env=0;st=0;}}else break;}"
         "v.env=env;v.wt=(v.wt||0)+n;if(!st)fin(v);else v.st=st;continue;}"),
        # 4) Quelle kommt an: an der richtigen Stelle einsteigen (Position/Bewegung, Zeit), kurze Einblende
        ("v.art=P.art==='frz'&&CS.NF>0?'frz':'korn';}",
         "v.art=P.art==='frz'&&CS.NF>0?'frz':'korn';/*TON1*/if(v.wt){const w=v.wt;v.pos=(v.pos+P.bew*w*CS.XR)%CS.XL;if(v.pos<0)v.pos+=CS.XL;v.t=w/SR;v.drift=P.bew*0.25*w/SR;v.fpI=1;v.ld=0;}v.wt=0;}"),
        # 5) Einblende 5 ms (nur nach dem Warten; sonst Faktor 1 = bitgleich)
        ("let gn=v.gn,env=v.env,st=v.st,rate=v.rate,a1=v.a1,b1=v.b1,a2=v.a2,b2=v.b2,wet=v.wet,xg=v.xg;",
         "let gn=v.gn,env=v.env,st=v.st,rate=v.rate,a1=v.a1,b1=v.b1,a2=v.a2,b2=v.b2,wet=v.wet,xg=v.xg,tnL=v.ld==null?1:v.ld;const tnS=1/(0.005*SR);/*TON1*/"),
        ("gn+=(gT-gn)*gk;const e=env*env*gn*xg;",
         "gn+=(gT-gn)*gk;if(tnL<1)tnL=Math.min(1,tnL+tnS);const e=env*env*gn*xg*tnL;/*TON1*/"),
        ("v.env=env;v.gn=gn;v.rate=rate;", "v.env=env;v.gn=gn;v.rate=rate;v.ld=tnL;/*TON1*/"),
        # Hauptfaden
        # 6) Audio aus dem Gerätespeicher gelesen: sofort (ohne Spektren) an wartende Klangkorn-Spuren
        ("const x=new Float32Array(pcm.length);for(let i=0;i<pcm.length;i++)x[i]=pcm[i]/32767;",
         "const x=new Float32Array(pcm.length);for(let i=0;i<pcm.length;i++)x[i]=pcm[i]/32767;/*TON1*/if(typeof ton1Got==='function')ton1Got(take,x,m.sr,f0);"),
        # 7) Spur-Engine wartet auf die Quelle: liegt das Audio schon vor, gleich vorab füttern
        ("else{if(c0)SPK7.pcm.delete(h.take);spk7Src(h.take,h.f0)",
         "else{if(c0)SPK7.pcm.delete(h.take);/*TON1*/if(typeof ton1Pre==='function')ton1Pre(E,h);spk7Src(h.take,h.f0)"),
        # 8) Block vor spk7TrE
        ("function spk7TrE(dest,h,snd){", block + "\nfunction spk7TrE(dest,h,snd){"),
    ]
    for a, b in H:
        n = s.count(a)
        if n != 1:
            sys.exit('TON1: Anker %d× statt 1×: %s' % (n, a[:70]))
        s = s.replace(a, b, 1)

    out = s.encode('utf-8')
    tmp = dst + '.tmp-ton1'
    with open(tmp, 'wb') as f:
        f.write(out)
    os.replace(tmp, dst)
    print('TON1 ok', hashlib.md5(out).hexdigest(), len(out))


if __name__ == '__main__':
    main()
