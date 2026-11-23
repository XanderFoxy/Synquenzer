// GES2 Kern-Test: synthetische Gesangs-Phrasen -> VSD.pyin -> VSD.segment (G2-Weg und Gesang->Noten-Weg)
const fs=require('fs');
const html=fs.readFileSync(process.argv[2],'utf8');
function grab(name){const i=html.indexOf('function '+name+'(');if(i<0)throw name;let d=0,j=html.indexOf('{',i);for(;j<html.length;j++){const c=html[j];if(c==='{')d++;else if(c==='}'){d--;if(!d)break;}}return html.slice(i,j+1);}
// Achtung: Klammerzaehlung ignoriert Strings/Regex - pruefen per eval
let src=grab('vsDspMake');
if(process.env.GES2){const blk=fs.readFileSync(__dirname+'/seg-block.js','utf8');
 src=src.replace('function segment(tr,o){',blk+'\nfunction segment(tr,o){').replace('const minF=F(o.minMs||60);','if(o.ges2!==false)ges2Glide(notes,m,unk,F);\nconst minF=F(o.minMs||60);');}
const V=(new Function(src+';return vsDspMake();'))();
const SR=16000;
function rnd(seed){let s=seed>>>0;return()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296;};}
// Phrase: Liste von Segmenten {typ:'ton',dur,m0,m1(glide end),glide(s),vib(ct),vr(Hz)} | {typ:'kons',dur} | {typ:'pause',dur}
function synth(ph,seed){
  const r=rnd(seed||1);let N=0;for(const s of ph)N+=Math.round(s.dur*SR);
  const x=new Float32Array(N+SR/5);let i=0,phase=0,vphase=r()*6.28;
  for(let si=0;si<ph.length;si++){const s=ph[si],nx=ph[si+1],n=Math.round(s.dur*SR);
    for(let k=0;k<n;k++,i++){const t=k/SR;
      if(s.typ==='ton'){
        const g=s.glide||0;let m=s.m0;if(g>0)m=t<g?s.m0+(s.m1-s.m0)*(0.5-0.5*Math.cos(Math.PI*t/g)):s.m1;
        if(s.vib){const vd=Math.min(1,t/0.25);vphase+=2*Math.PI*(s.vr||5.5)/SR;m+=vd*s.vib/100*Math.sin(vphase);}
        const f=440*Math.pow(2,(m-69)/12);phase+=2*Math.PI*f/SR;
        let v=0;for(let h=1;h<=12;h++){if(h*f>7000)break;v+=Math.sin(h*phase)/h*(h<=3?1:0.6);}
        const a=Math.min(1,s.cont?1:t/0.02,nx&&nx.cont?1:(s.dur-t)/0.03);x[i]=0.25*v*a;
      }else if(s.typ==='kons'){const a=Math.min(1,t/0.005,(s.dur-t)/0.005);x[i]=0.08*(r()*2-1)*a;}
      else x[i]=0;
    }}
  return x;
}
function midiSoll(ph){const out=[];let t=0;for(const s of ph){if(s.typ==='ton'&&!s.cont)out.push({t,m:s.m1!=null?s.m1:s.m0});t+=s.dur;}return out;}
const P=[
 {name:'Vibrato ±50ct gehalten (3 Noten)',ph:[{typ:'ton',dur:1.2,m0:60,vib:50},{typ:'pause',dur:.15},{typ:'ton',dur:1.2,m0:64,vib:50},{typ:'pause',dur:.15},{typ:'ton',dur:1.2,m0:67,vib:50}]},
 {name:'Gleiten 60->65 mit Vibrato (2 Noten)',ph:[{typ:'ton',dur:.6,m0:60,vib:50},{typ:'ton',dur:1.2,m0:60,m1:65,glide:.35,vib:50,cont:1}],soll:[{m:60},{m:65}]},
 {name:'Gleiten 62->57 langsam mit Vibrato (2)',ph:[{typ:'ton',dur:.7,m0:62,vib:50,vr:6},{typ:'ton',dur:1.3,m0:62,m1:57,glide:.5,vib:50,vr:6,cont:1}],soll:[{m:62},{m:57}]},
 {name:'Legato-Tonwechsel ohne Vibrato (3)',ph:[{typ:'ton',dur:.5,m0:60},{typ:'ton',dur:.5,m0:62,m1:62,glide:.04,cont:1},{typ:'ton',dur:.6,m0:62,m1:64,glide:.04,cont:1}],soll:[{m:60},{m:62},{m:64}]},
 {name:'Konsonant vor Vokal (4 Silben)',ph:[{typ:'kons',dur:.07},{typ:'ton',dur:.45,m0:57,vib:30},{typ:'kons',dur:.06},{typ:'ton',dur:.45,m0:59,vib:30},{typ:'kons',dur:.08},{typ:'ton',dur:.45,m0:60,vib:30},{typ:'kons',dur:.06},{typ:'ton',dur:.7,m0:62,vib:50}]},
 {name:'Vibrato ±50ct langsam 4.5Hz (1)',ph:[{typ:'ton',dur:2.0,m0:65,vib:50,vr:4.5}]},
 {name:'Kontrolle: Gleiten 60->65 ohne Vibrato (2)',ph:[{typ:'ton',dur:.6,m0:60},{typ:'ton',dur:1.2,m0:60,m1:65,glide:.35,cont:1}],soll:[{m:60},{m:65}]},
 {name:'Legato mit Vibrato 60-62-64 (3)',ph:[{typ:'ton',dur:.6,m0:60,vib:50},{typ:'ton',dur:.6,m0:60,m1:62,glide:.05,vib:50,cont:1},{typ:'ton',dur:.8,m0:62,m1:64,glide:.05,vib:50,cont:1}],soll:[{m:60},{m:62},{m:64}]},
 {name:'Kurze Durchgangsnote 160ms mit Vibrato (3)',ph:[{typ:'ton',dur:.7,m0:60,vib:50},{typ:'ton',dur:.16,m0:60,m1:62,glide:.03,vib:50,cont:1},{typ:'ton',dur:.8,m0:62,m1:64,glide:.03,vib:50,cont:1}],soll:[{m:60},{m:62},{m:64}]},
 {name:'Schnelle Achtel ohne Vibrato 200ms (5)',ph:[{typ:'ton',dur:.2,m0:60},{typ:'ton',dur:.2,m0:60,m1:62,glide:.03,cont:1},{typ:'ton',dur:.2,m0:62,m1:64,glide:.03,cont:1},{typ:'ton',dur:.2,m0:64,m1:62,glide:.03,cont:1},{typ:'ton',dur:.4,m0:62,m1:60,glide:.03,cont:1}],soll:[{m:60},{m:62},{m:64},{m:62},{m:60}]},
 {name:'Langsames Gleiten 700ms 57->64 mit Vibrato 6.5Hz (2)',ph:[{typ:'ton',dur:.6,m0:57,vib:50,vr:6.5},{typ:'ton',dur:1.5,m0:57,m1:64,glide:.7,vib:50,vr:6.5,cont:1}],soll:[{m:57},{m:64}]},
 {name:'Anschleifen von unten (-2 st, 150ms) nach Konsonant (3)',ph:[{typ:'kons',dur:.06},{typ:'ton',dur:.7,m0:58,m1:60,glide:.15,vib:40},{typ:'kons',dur:.06},{typ:'ton',dur:.7,m0:62,m1:64,glide:.15,vib:40},{typ:'kons',dur:.06},{typ:'ton',dur:.9,m0:65,m1:67,glide:.15,vib:50}],soll:[{m:60},{m:64},{m:67}]},
 {name:'Abfallen am Ende (-3 st, 200ms) (2)',ph:[{typ:'ton',dur:.8,m0:64,vib:40},{typ:'ton',dur:.25,m0:64,m1:61,glide:.26,cont:1},{typ:'pause',dur:.2},{typ:'ton',dur:.8,m0:62,vib:40}],soll:[{m:64},{m:62}]},
 {name:'Gleiten mit Vibrato 3 Noten 60->64->60 (3)',ph:[{typ:'ton',dur:.6,m0:60,vib:50},{typ:'ton',dur:.8,m0:60,m1:64,glide:.3,vib:50,cont:1},{typ:'ton',dur:.9,m0:64,m1:60,glide:.3,vib:50,cont:1}],soll:[{m:60},{m:64},{m:60}]},
 {name:'Schnelle Tonleiter 150ms ohne Vibrato (5)',ph:[{typ:'ton',dur:.15,m0:57},{typ:'ton',dur:.15,m0:57,m1:59,glide:.03,cont:1},{typ:'ton',dur:.15,m0:59,m1:60,glide:.03,cont:1},{typ:'ton',dur:.15,m0:60,m1:62,glide:.03,cont:1},{typ:'ton',dur:.5,m0:62,m1:64,glide:.03,cont:1}],soll:[{m:57},{m:59},{m:60},{m:62},{m:64}]},
 {name:'Tonleiter 200ms mit leichtem Vibrato ±20ct (5)',ph:[{typ:'ton',dur:.2,m0:57,vib:20},{typ:'ton',dur:.2,m0:57,m1:59,glide:.03,vib:20,cont:1},{typ:'ton',dur:.2,m0:59,m1:60,glide:.03,vib:20,cont:1},{typ:'ton',dur:.2,m0:60,m1:62,glide:.03,vib:20,cont:1},{typ:'ton',dur:.5,m0:62,m1:64,glide:.03,vib:20,cont:1}],soll:[{m:57},{m:59},{m:60},{m:62},{m:64}]},
 {name:'Kurze Schlussnote 150ms gerade (3)',ph:[{typ:'ton',dur:.8,m0:64,vib:40},{typ:'ton',dur:.15,m0:64,m1:61,glide:.03,cont:1},{typ:'pause',dur:.2},{typ:'ton',dur:.8,m0:62,vib:40}],soll:[{m:64},{m:61},{m:62}]},
 {name:'Tiefe Stimme Gleiten+Vibrato 48->53 (2)',ph:[{typ:'ton',dur:.6,m0:48,vib:50},{typ:'ton',dur:1.2,m0:48,m1:53,glide:.4,vib:50,cont:1}],soll:[{m:48},{m:53}]},
];
let tot={n:0,soll:0,ok:0,lage:0,lagen:0};
for(const p of P){
  const x=synth(p.ph,7);
  const tr=V.pyin(x,{fs:SR,hop:160,fmin:55,fmax:1050});
  const soll=p.soll||midiSoll(p.ph);
  for(const mode of ['g2','gn']){
    const sg=mode==='g2'?V.segment(tr,{snap:false,tuning:0,ges4:+(process.env.G4||0)}):V.segment(tr,{snap:false,tuning:0,attack:false});
    if(mode==='gn')continue;
    const ns=sg.notes.filter(n=>n.t1-n.t0>=.04);
    // Lage: je Soll-Note die laengste getroffene Note
    let lg=0,lgn=0;const ms=[];
    for(const n of ns)ms.push(n.m.toFixed(2)+'@'+n.t0.toFixed(2));
    for(const s of soll){let best=null;for(const n of ns)if(!best||Math.abs(n.m-s.m)<Math.abs(best.m-s.m))best=n;if(best){lg+=Math.abs(best.m-s.m)*100;lgn++;}}
    const ok=ns.length===soll.length;
    tot.n+=ns.length;tot.soll+=soll.length;tot.ok+=ok?1:0;tot.lage+=lg;tot.lagen+=lgn;
    console.log((ok?'OK    ':'FEHLER')+' '+p.name+': Noten '+ns.length+'/'+soll.length+' Lage '+(lg/Math.max(1,lgn)).toFixed(0)+' ct  ['+ms.join(' ')+']');
  }
}
console.log('GESAMT: Phrasen richtig '+tot.ok+'/'+P.length+', Noten '+tot.n+' (Soll '+tot.soll+'), mittl. Lage-Fehler '+(tot.lage/tot.lagen).toFixed(1)+' ct');
