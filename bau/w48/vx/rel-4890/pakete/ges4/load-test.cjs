// GES4 Browser-Test: Seite lädt hoch/quer ohne Fehler; Gesang→Noten-Haken + Vibrato-Ton im echten VSD (eine Note statt mehrerer)
const {chromium}=require('playwright');const P=process.argv[2];
(async()=>{const b=await chromium.launch();const errs=[];
for(const vp of [{width:428,height:926},{width:926,height:428}]){
const c=await b.newContext({viewport:vp,hasTouch:true,isMobile:true});const p=await c.newPage();
p.on('pageerror',e=>errs.push('pageerror '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push('console '+m.text());});
await p.goto('http://127.0.0.1:'+P+'/index.html',{waitUntil:'load'});await p.waitForTimeout(4000);
const r=await p.evaluate(()=>{
const out={kons:typeof ges4Kons,on:typeof ges3Onset,haken:vsNotesOf.toString().includes('ges4:1')};
const fs=16000,x=new Float32Array(fs*2.2);let ph=0,vp=0;
for(let i=0;i<x.length;i++){const t=i/fs;if(t<.1||t>2)continue;const tt=t-.1;vp+=2*Math.PI*5.5/fs;const m=69+(tt<1?0:Math.min(2,(tt-1)/.08*2))+Math.min(1,tt/.25)*.5*Math.sin(vp);const f=440*Math.pow(2,(m-69)/12);ph+=2*Math.PI*f/fs;let v=0;for(let h=1;h<=15;h++){const hf=h*f;v+=(0.15/h+Math.exp(-(((hf-800)/90)**2))+.6*Math.exp(-(((hf-1200)/110)**2)))*Math.sin(h*ph);}x[i]=.12*v*Math.min(1,tt/.02);}
const tr=VSD.pyin(x,{fs,hop:80,fmin:55,fmax:1050});
out.alt=VSD.segment(tr,{snap:false,tuning:0,attack:false}).notes.length;out.neu=VSD.segment(tr,{snap:false,tuning:0,attack:false,ges4:1}).notes.length;
return out;});
console.log(JSON.stringify(vp),JSON.stringify(r));await c.close();}
const real=errs.filter(e=>!/abspann-logo/.test(e));console.log('Fehler:',real.length,JSON.stringify(real.slice(0,5)));await b.close();})();
