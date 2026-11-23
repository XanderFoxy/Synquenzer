// Prüfhilfe 4.91: WT ohne Lock – Render 4.91 gegen 4.90 als dB-Abstand (der Hash im KSM2-Test ist bei WT nicht stabil).
// Aufruf: node wt-quer.cjs <neu.html> <basis.html>   (eigener Temp-Server 9300–9399)
const {chromium}=require('playwright');const fs=require('fs');const path=require('path');const {spawn}=require('child_process');
const files=process.argv.slice(2,4).map(f=>path.resolve(f)),names=['neu','basis'];
const dir=fs.mkdtempSync(path.join(__dirname,'srv-q-'));files.forEach((f,i)=>fs.copyFileSync(f,path.join(dir,names[i]+'.html')));
fs.writeFileSync(path.join(dir,'version.json'),'{"version":"4.90.0"}');
const port=9300+Math.floor(Math.random()*100);
const srv=spawn('python3',['-m','http.server',String(port),'--bind','127.0.0.1'],{cwd:dir,stdio:'ignore'});
const ENG=async()=>{
  const sr=48000,sec=1.4,tr=S.tracks[0];const clone=o=>JSON.parse(JSON.stringify(o));
  const s=clone(factorySound(INIT_IDS.wt));Object.assign(s.p,{aA:.003,aD:.3,aS:.6,aR:.2,fA:.003,fD:.3,fS:.2,fR:.3,fenv:.6,cutoff:600,mA:.001,mD:.3,mS:0,mR:.2});const snd=SQStore.normalizeSound(s);
  const out=[];
  for(let k=0;k<3;k++){const oc=new OfflineAudioContext(2,Math.round(sec*sr),sr),save=AU.ctx,sink=oc.createGain();sink.connect(oc.destination);
    const prev=tr.sound;tr.sound=snd;AU.ctx=oc;let v=null;const mr=Math.random;let z=12345;Math.random=()=>{z=(Math.imul(z,1103515245)+12345)>>>0;return z/4294967296;};
    try{for(const x of VOICES.slice())if(x.track===0)try{cleanupVoice(x);}catch(e){}AU.tracks[0].panIdx=0;v=spawnVoice(0,48,.8,.02,{src:'preview',sound:snd,chain:{trackIn:sink},noGlide:true});if(v)v.release(.9);}catch(e){}
    Math.random=mr;AU.ctx=save;tr.sound=prev;const b=await oc.startRendering();try{if(v)cleanupVoice(v);}catch(e){}
    out.push(Array.from(b.getChannelData(0)));}
  return out;
};
(async()=>{
  for(let i=0;i<50;i++){try{const r=await fetch('http://127.0.0.1:'+port+'/version.json');if(r.ok)break;}catch(e){}await new Promise(r=>setTimeout(r,200));}
  const b=await chromium.launch({args:['--autoplay-policy=no-user-gesture-required']});const res={},errs={};
  for(const nm of names){
    const ctx=await b.newContext({viewport:{width:428,height:926},hasTouch:true,isMobile:true,deviceScaleFactor:2});const p=await ctx.newPage();errs[nm]=[];
    p.on('pageerror',e=>errs[nm].push(String(e)));
    await p.goto('http://127.0.0.1:'+port+'/'+nm+'.html');await p.waitForFunction(()=>window.SYNQUENZER&&typeof S!=='undefined'&&S.tracks&&S.tracks.length,null,{timeout:90000});await p.waitForTimeout(1200);
    await p.tap('body').catch(()=>{});await p.evaluate(()=>{try{ensureAudio();}catch(e){}});
    await p.waitForFunction(()=>AU.ctx&&AU.tracks&&AU.tracks[0],null,{timeout:20000}).catch(()=>{});await p.waitForTimeout(800);
    res[nm]=await p.evaluate(ENG);await ctx.close();
  }
  await b.close();srv.kill();fs.rmSync(dir,{recursive:true,force:true});
  const diff=(a,b)=>{let e=0,p=0;for(let i=0;i<a.length;i++){p+=a[i]*a[i];e+=(a[i]-b[i])**2;}return p>0?+(10*Math.log10(e/p+1e-30)).toFixed(1):null;};
  const o={neuNeu:[diff(res.neu[0],res.neu[1]),diff(res.neu[0],res.neu[2])],basisBasis:[diff(res.basis[0],res.basis[1]),diff(res.basis[0],res.basis[2])],
    neuBasis:[0,1,2].map(i=>diff(res.basis[i],res.neu[i])),errs};
  console.log(JSON.stringify(o));
})().catch(e=>{console.log('ABBRUCH',e);srv.kill();process.exit(1);});
