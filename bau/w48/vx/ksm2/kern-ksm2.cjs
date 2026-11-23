// KSM2 Kern-Test. Aufruf: node kern-ksm2.cjs <neu.html> [basis.html]  (eigener Temp-Server, Port 9300-9399 zufaellig, version.json 4.90.0)
// Je Engine (WT nativ, MS-Platte, Bit Mask) je Ziel: Lock ueber den echten Weg lkNoteX -> Kern, Offline-Render -> Unterschied in dB;
// WT (nativer Kern): Hash ueber auf 1e-5 gerundete Werte (nativer Release-Schluss schwankt im Offline-Render um <1e-9), Stimmen-Pan-Zaehler je Render auf 0.
// ohne Lock Render-Hash neu == basis. Routen: ehrlich ausgelassen (Kern hat dafuer keinen Weg) - Test prueft, dass sie nichts aendern.
const {chromium}=require('playwright');const fs=require('fs');const path=require('path');const {spawn}=require('child_process');
const here=__dirname,files=process.argv.slice(2).map(f=>path.resolve(f));const names=['neu','basis'].slice(0,files.length);
const dir=fs.mkdtempSync(path.join(here,'srv-k-'));files.forEach((f,i)=>fs.copyFileSync(f,path.join(dir,names[i]+'.html')));
fs.writeFileSync(path.join(dir,'version.json'),'{"version":"4.90.0"}');
const port=9300+Math.floor(Math.random()*100);
const srv=spawn('python3',['-m','http.server',String(port),'--bind','127.0.0.1'],{cwd:dir,stdio:'ignore'});
const ENG=async()=>{
  const fnv=a=>{const u=new Uint8Array(a.buffer,a.byteOffset,a.byteLength);let h=2166136261>>>0;for(let i=0;i<u.length;i++){h^=u[i];h=Math.imul(h,16777619)>>>0;}return h.toString(16);};
  const diff=(a,b)=>{let e=0,p=0;for(let i=0;i<a.length;i++){p+=a[i]*a[i];e+=(a[i]-b[i])**2;}return p>0?+(10*Math.log10(e/p+1e-30)).toFixed(1):null;};
  const sr=48000,sec=1.4,tr=S.tracks[0];
  const wsrc=document.getElementById('sq-worklet-src').textContent;
  const clone=o=>JSON.parse(JSON.stringify(o));
  if(typeof bmLoad==='function'){bmLoad();for(let k=0;k<100&&typeof bmTrack!=='function';k++)await new Promise(r=>setTimeout(r,50));}
  if(typeof mkLoad==='function'){try{mkLoad();}catch(e){}}
  const R={
    wt:async(snd,lx)=>{const oc=new OfflineAudioContext(2,Math.round(sec*sr),sr),save=AU.ctx,sink=oc.createGain();sink.connect(oc.destination);
      const prev=tr.sound;tr.sound=snd;AU.ctx=oc;let v=null,err=null;const mr=Math.random;let z=12345;Math.random=()=>{z=(Math.imul(z,1103515245)+12345)>>>0;return z/4294967296;};
      try{for(const x of VOICES.slice())if(x.track===0)try{cleanupVoice(x);}catch(e){}AU.tracks[0].panIdx=0;v=spawnVoice(0,48,.8,.02,{src:'preview',sound:snd,chain:{trackIn:sink},noGlide:true,lkP:lx&&lx.lkP||undefined});if(v)v.release(.9);}catch(e){err=String(e);}
      Math.random=mr;AU.ctx=save;tr.sound=prev;const b=await oc.startRendering();try{if(v)cleanupVoice(v);}catch(e){}const l=b.getChannelData(0),r=b.getChannelData(1);const q=x=>{const o=new Int32Array(x.length);for(let i=0;i<x.length;i++)o[i]=Math.round(x[i]*1e5);return o;};return{h:fnv(q(l))+fnv(q(r)),l,err};},
    mk:async(snd,lx)=>{const oc=new OfflineAudioContext(2,Math.round(sec*sr),sr);await oc.audioWorklet.addModule('data:application/javascript;base64,'+btoa(wsrc));
      const E=SynthHost.track(oc,oc.destination,wkFlat(snd),wkMods(snd),null,snd.p.mk);E.node.port.postMessage({mkSeed:1});E.mkWheel({mw0:+snd.p.mw||0,reset:true});try{mkwFeed(E,snd);}catch(e){}
      E.tempo(120,null);E.on(1,48,.8,.02,null,0,lx&&lx.lk||null);E.off(1,.9);E.flush();await new Promise(r=>setTimeout(r,30));const b=await oc.startRendering();
      const l=b.getChannelData(0),r=b.getChannelData(1);return{h:fnv(l)+fnv(r),l};},
    bm:async(snd,lx)=>{const oc=new OfflineAudioContext(2,Math.round(sec*sr),sr);await oc.audioWorklet.addModule('data:application/javascript;base64,'+btoa(BM_WK));
      const E=bmTrack(oc,oc.destination,snd);E.reset();E.tempo(120,null,0);E.on(1,48,.8,.02,-1,0,lx&&lx.lk||null);E.off(1,.9);E.flush();await new Promise(r=>setTimeout(r,30));
      const b=await oc.startRendering();const l=b.getChannelData(0),r=b.getChannelData(1);return{h:fnv(l)+fnv(r),l};}
  };
  const SND={wt:()=>{const s=clone(factorySound(INIT_IDS.wt));Object.assign(s.p,{aA:.003,aD:.3,aS:.6,aR:.2,fA:.003,fD:.3,fS:.2,fR:.3,fenv:.6,cutoff:600,mA:.001,mD:.3,mS:0,mR:.2});return SQStore.normalizeSound(s);},
    mk:()=>{const s=clone(factorySound(INIT_IDS.mk));const T=s.p.mk.t[0];Object.assign(T.e1,{a:0,d:60,s:30,r:40});Object.assign(T.e2,{a:0,d:70,s:90,r:50});if(T.f){T.f.cut=40;T.f.eg=50;}return SQStore.normalizeSound(s);},
    bm:()=>{const s=clone(factorySound(INIT_IDS.bm));const A=s.p.bm.a||s.p.bm;Object.assign(A.o1.e,{a:0,d:6,s:8,r:4});Object.assign(A.f,{cu:30,re:30});Object.assign(A.f.e,{l:90,a:0,d:6,s:4,r:4});return SQStore.normalizeSound(s);}};
  const L={ksAa:1,ksAd:.25,ksAr:2,ksFa:1,ksFd:.25,ksFr:2,ksMa:1,ksMd:2,ksMr:2,ksPe:12,ksR1:8,ksG1:1,ksR2:8,ksG2:1,ksF2c:300,ksF2r:.9,ksF2e:-.8,ksF2m:.2};
  const out={};
  for(const g of['wt','mk','bm']){
    const o=out[g]={lock:{},route:{}};let snd;try{snd=SND[g]();}catch(e){o.err=String(e);continue;}
    const prev=tr.sound;tr.sound=snd;
    const b0=await R[g](snd,null),b1=await R[g](snd,null);o.ohne=b0.h;o.stabil=b0.h===b1.h;if(b0.err)o.err=b0.err;
    for(const k in L){const e=LKT[k];if(!e){o.lock[k]='kein LKT';continue;}
      const v={[k]:lkToN(e,L[k])};let ref=b0;
      if(k==='ksMa'||k==='ksMd'||k==='ksMr'){v.ksPe=lkToN(LKT.ksPe,12);const lp=lkNoteX(0,null,{lk:{v:{ksPe:v.ksPe}}});ref=await R[g](snd,lp);}
      const lx=lkNoteX(0,null,{lk:{v}});const r=await R[g](snd,lx);
      o.lock[k]={lk:lx&&lx.lk,lkP:lx&&lx.lkP,dB:diff(ref.l,r.l),gleich:r.h===ref.h};}
    const M={pe:['vel',.5],f2cut:['vel',.6],ras1:['vel',.8],takt:['vel',.5]};
    for(const d in M){const s2=clone(snd);s2.mods=(s2.mods||[]).concat([{src:M[d][0],dst:d,amt:M[d][1]}]);const n=SQStore.normalizeSound(clone(s2));
      const r=await R[g](n,null);o.route[d]={gleich:r.h===b0.h};}
    tr.sound=prev;
  }
  return out;
};
(async()=>{
  for(let i=0;i<50;i++){try{const r=await fetch('http://127.0.0.1:'+port+'/version.json');if(r.ok)break;}catch(e){}await new Promise(r=>setTimeout(r,200));}
  const b=await chromium.launch({args:['--autoplay-policy=no-user-gesture-required']});const res={};
  for(const nm of names){
    const ctx=await b.newContext({viewport:{width:428,height:926},hasTouch:true,isMobile:true,deviceScaleFactor:2});const p=await ctx.newPage();const errs=[];
    p.on('pageerror',e=>errs.push(String(e)));p.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource/.test(m.text()))errs.push(m.text());});
    await p.goto('http://127.0.0.1:'+port+'/'+nm+'.html');await p.waitForFunction(()=>window.SYNQUENZER&&typeof S!=='undefined'&&S.tracks&&S.tracks.length,null,{timeout:90000});await p.waitForTimeout(1200);
    await p.tap('body').catch(()=>{});
    await p.evaluate(()=>{try{ensureAudio();}catch(e){}});
    await p.waitForFunction(()=>AU.ctx&&AU.tracks&&AU.tracks[0],null,{timeout:20000}).catch(()=>{});await p.waitForTimeout(800);
    res[nm]={eng:await p.evaluate(ENG),errs};await ctx.close();
  }
  await b.close();srv.kill();fs.rmSync(dir,{recursive:true,force:true});
  console.log(JSON.stringify(res,null,1));
})().catch(e=>{console.log('ABBRUCH',e);srv.kill();process.exit(1);});
