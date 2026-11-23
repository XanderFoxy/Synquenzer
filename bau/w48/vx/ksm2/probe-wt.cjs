const {chromium}=require('playwright');const fs=require('fs');const path=require('path');const {spawn}=require('child_process');
const here=__dirname,f=path.resolve(process.argv[2]);const dir=fs.mkdtempSync(path.join(here,'srv-p-'));fs.copyFileSync(f,path.join(dir,'neu.html'));
fs.writeFileSync(path.join(dir,'version.json'),'{"version":"4.90.0"}');const port=9300+Math.floor(Math.random()*100);
const srv=spawn('python3',['-m','http.server',String(port),'--bind','127.0.0.1'],{cwd:dir,stdio:'ignore'});
(async()=>{for(let i=0;i<50;i++){try{const r=await fetch('http://127.0.0.1:'+port+'/version.json');if(r.ok)break;}catch(e){}await new Promise(r=>setTimeout(r,200));}
const b=await chromium.launch({args:['--autoplay-policy=no-user-gesture-required']});const p=await (await b.newContext({viewport:{width:428,height:926},hasTouch:true,isMobile:true})).newPage();
await p.goto('http://127.0.0.1:'+port+'/neu.html');await p.waitForFunction(()=>window.SYNQUENZER&&typeof S!=='undefined'&&S.tracks&&S.tracks.length,null,{timeout:90000});await p.waitForTimeout(1000);
await p.evaluate(()=>{try{ensureAudio();}catch(e){}});await p.waitForFunction(()=>AU.ctx&&AU.tracks&&AU.tracks[0],null,{timeout:20000}).catch(()=>{});await p.waitForTimeout(800);
console.log(JSON.stringify(await p.evaluate(async()=>{const sr=48000,tr=S.tracks[0];const snd=SQStore.normalizeSound(JSON.parse(JSON.stringify(factorySound(INIT_IDS.wt))));
const out=[];let ref=null;
for(let k=0;k<3;k++){const oc=new OfflineAudioContext(2,sr,sr),save=AU.ctx,sink=oc.createGain();sink.connect(oc.destination);const prev=tr.sound;tr.sound=snd;AU.ctx=oc;
const mr=Math.random;let z=1;Math.random=()=>{z=(Math.imul(z,1103515245)+12345)>>>0;return z/4294967296;};
AU.tracks[0].panIdx=0;const v=spawnVoice(0,48,.8,.02,{src:'preview',sound:snd,chain:{trackIn:sink},noGlide:true});v.release(.6);Math.random=mr;AU.ctx=save;tr.sound=prev;
const info={nodes:v.nodes.length,srcs:v.srcs.length,ctxOk:v.nodes.every(n=>n.context===oc)};
const bb=await oc.startRendering();try{cleanupVoice(v);}catch(e){}const l=bb.getChannelData(0);let rms=0,first=-1;for(let i=0;i<l.length;i++){rms+=l[i]*l[i];if(ref&&first<0&&l[i]!==ref[i])first=i;}
if(!ref)ref=l.slice();out.push(Object.assign(info,{rms:Math.sqrt(rms/l.length),first,eng:snd.engine,waves:!!AU.waves,lfo:!!(AU.tracks[0]&&AU.tracks[0].lfoPitch)}));}
return out;})));await b.close();srv.kill();fs.rmSync(dir,{recursive:true,force:true});})();
