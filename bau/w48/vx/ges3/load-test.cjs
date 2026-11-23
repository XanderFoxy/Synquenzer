const {chromium}=require('playwright');const P=process.argv[2];
(async()=>{const b=await chromium.launch();const errs=[];
for(const vp of [{width:428,height:926},{width:926,height:428}]){
const c=await b.newContext({viewport:vp,hasTouch:true,isMobile:true});const p=await c.newPage();
p.on('pageerror',e=>errs.push('pageerror '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push('console '+m.text());});
await p.goto('http://127.0.0.1:'+P+'/index.html',{waitUntil:'load'});await p.waitForTimeout(4000);
const r=await p.evaluate(async()=>{
const out={on:typeof ges3Onset,neu:typeof ges3Neu,ab:typeof GES3_AB};
// Worker-Quelle der Marken enthält den Block und der Op 'det' läuft im Worker mit g3
const x=new Float32Array(48000*2);for(let i=0;i<x.length;i++){const t=i/48000;x[i]=(t>.3&&t<1.7?0.2*Math.sin(2*Math.PI*294*t)*Math.pow(10,6*Math.sin(2*Math.PI*4*t)/20):0)+0.0003*(Math.random()*2-1);}
try{const a=await wpCall({op:'det',x,sr:48000}),b2=await wpCall({op:'det',x,sr:48000,g3:true});out.det=[a.length,b2.length];out.how=WP.how;}catch(e){out.err=String(e);}
// Gesang→Noten-Haken
const s=vsNotesOf.toString();out.haken=s.includes('ges3Onset(sg.notes,A)');
return out;});
console.log(JSON.stringify(vp),JSON.stringify(r));await c.close();}
const real=errs.filter(e=>!/abspann-logo/.test(e));console.log('Fehler:',real.length,JSON.stringify(real.slice(0,5)));await b.close();})();
