// KSM Kern-Test. Aufruf: node kern-ksm.cjs <neu.html> [basis.html]  (Server im eigenen Temp-Ordner, Port 9000-9099 zufaellig)
// 1) Engine: je Ziel Lock (ueber lkNoteX, echter Weg Haupt -> Worklet) und Mod-Route -> Offline-Render misst Unterschied;
//    ohne Lock/Route Hash neu == basis (bitgleich). 2) Bedienung per Tipp: MOD > + Modulation > LFO 1 > Filter 2 Cutoff.
// 3) LFO-Vorschau: Raster-Linien (Zahl) + Fotos. Ausgabe JSON + Zeile ALLE OK / FEHLER.
const {chromium}=require('playwright');const fs=require('fs');const path=require('path');const {spawn}=require('child_process');
const here=__dirname,files=process.argv.slice(2).map(f=>path.resolve(f));const names=['neu','basis'].slice(0,files.length);
const dir=fs.mkdtempSync(path.join(here,'srv-k-'));files.forEach((f,i)=>fs.copyFileSync(f,path.join(dir,names[i]+'.html')));
fs.writeFileSync(path.join(dir,'version.json'),'{"version":"4.88.0"}');
const port=9000+Math.floor(Math.random()*100);
const srv=spawn('python3',['-m','http.server',String(port),'--bind','127.0.0.1'],{cwd:dir,stdio:'ignore'});
const ENG=async()=>{
  const fnv=a=>{const u=new Uint8Array(a.buffer,a.byteOffset,a.byteLength);let h=2166136261>>>0;for(let i=0;i<u.length;i++){h^=u[i];h=Math.imul(h,16777619)>>>0;}return h.toString(16);};
  const src=document.getElementById('sq-worklet-src').textContent;
  const R=async(sound,lk)=>{const snd=SQStore.normalizeSound(JSON.parse(JSON.stringify(sound)));const sr=48000,sec=1.2;
    const oc=new OfflineAudioContext(2,Math.round(sec*sr),sr);await oc.audioWorklet.addModule('data:application/javascript;base64,'+btoa(src));
    const E=SynthHost.track(oc,oc.destination,wkFlat(snd),wkMods(snd),null,null);E.node.port.postMessage({mkSeed:1});E.tempo(120,null);
    E.on(1,48,.8,.02,null,0,lk||null);E.off(1,.9);E.flush();await new Promise(r=>setTimeout(r,20));const b=await oc.startRendering();
    const l=b.getChannelData(0),r=b.getChannelData(1);return{h:fnv(l)+fnv(r),l};};
  const diff=(a,b)=>{let e=0,p=0;for(let i=0;i<a.length;i++){p+=a[i]*a[i];e+=(a[i]-b[i])**2;}return p>0?+(10*Math.log10(e/p+1e-30)).toFixed(1):null;};
  const tr=S.tracks[0],base=JSON.parse(JSON.stringify(tr.sound));base.engine='analog';base.mods=[];
  const out={eng0:tr.sound.engine};
  const plain=await R(base);out.plain=plain.h;
  const ks=JSON.parse(JSON.stringify(base));Object.assign(ks.p,{ksF2:1,ksF2w:0,ksF2c:2500,ksF2r:.3,ksF2m:1,ksF2q:0,ksF2e:.3,ksR1:4,ksG1:0,ksPe:0,mA:.001,mD:.4,mS:0,mR:.2,aA:.005,aS:1,aR:.3});
  ks.mods=[{src:'lfo1',dst:'cutoff',amt:.4}];ks.p.l1rate=3;ks.p.l1shape=2;
  const r0=await R(ks);out.ks=r0.h;
  if(typeof KSMK==='undefined')return out;
  const prev=tr.sound;tr.sound=SQStore.normalizeSound(JSON.parse(JSON.stringify(ks)));
  const L={ksF2c:300,ksF2r:.95,ksF2e:-.8,ksF2m:.15,ksPe:12,ksR1:16,ksG1:1,ksAa:1,ksAr:2,ksFa:.5,ksMd:2,ksR2:8,ksG2:.5};
  out.lock={};
  const TW={ksMd:s=>{s.p.ksPe=12;},ksR2:s=>{s.p.l2rate=2;s.mods.push({src:'lfo2',dst:'res',amt:.6});},ksG2:s=>{s.p.ksR2=4;s.p.l2rate=2;s.mods.push({src:'lfo2',dst:'res',amt:.6});}};
  for(const k in L){const e=LKT[k];let s2=ks,b0=r0;if(TW[k]){s2=JSON.parse(JSON.stringify(ks));TW[k](s2);tr.sound=SQStore.normalizeSound(JSON.parse(JSON.stringify(s2)));b0=await R(s2);}
    const lx=lkNoteX(0,null,{lk:{v:{[k]:lkToN(e,L[k])}}});const r=await R(s2,lx&&lx.lk);out.lock[k]={pair:lx&&lx.lk,dB:diff(b0.l,r.l),gleich:r.h===b0.h};}
  tr.sound=prev;
  out.mod={};
  const M={pe:['menv',.5],f2cut:['lfo1',.6],f2res:['lfo1',.8],f2amt:['vel',-.8],f2mix:['lfo1',.8],ras1:['vel',.8],ras2:['vel',.8],takt:['vel',.5]};
  for(const d in M){const s2=JSON.parse(JSON.stringify(ks));if(d==='ras2'){s2.p.ksR2=4;s2.p.l2rate=2;s2.mods.push({src:'lfo2',dst:'res',amt:.6});}
    if(d==='takt'){s2.p.ksAa=.25;s2.p.ksAd=.5;s2.p.aS=.3;}
    const b0=await R(s2);s2.mods.push({src:M[d][0],dst:d,amt:M[d][1]});const n=SQStore.normalizeSound(JSON.parse(JSON.stringify(s2)));
    const r=await R(s2);out.mod[d]={kept:n.mods.some(m=>m.dst===d),dB:diff(b0.l,r.l),gleich:r.h===b0.h};}
  return out;
};
(async()=>{
  for(let i=0;i<50;i++){try{const r=await fetch('http://127.0.0.1:'+port+'/version.json');if(r.ok)break;}catch(e){}await new Promise(r=>setTimeout(r,200));}
  const b=await chromium.launch();const res={};let ok=true;const fail=m=>{ok=false;console.log('FEHLER',m);};
  for(const nm of names){
    res[nm]={};
    for(const [lage,vp] of [['hoch',{width:428,height:926}],['quer',{width:926,height:428}]]){
      const ctx=await b.newContext({viewport:vp,hasTouch:true,isMobile:true,deviceScaleFactor:2});const p=await ctx.newPage();const errs=[];
      p.on('pageerror',e=>errs.push(String(e)));p.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource/.test(m.text()))errs.push(m.text());});
      await p.goto('http://127.0.0.1:'+port+'/'+nm+'.html');await p.waitForFunction(()=>window.SYNQUENZER&&typeof S!=='undefined'&&S.tracks&&S.tracks.length,null,{timeout:90000});await p.waitForTimeout(1200);
      const R={};
      if(lage==='hoch')R.eng=await p.evaluate(ENG);
      // Bedienung: Synth 1 VA, Klang-Editor, LFO 1 im TAKT + Raster 8 Stufen (Vorschau), MOD > + Modulation > LFO 1 > Ziel
      await p.evaluate(()=>{const i=0;const s=S.tracks[i].sound;if(s.engine!=='analog'&&typeof setEngine==='function')setEngine(i,'analog');selectSlot(i,0);openEditor();});
      await p.waitForTimeout(400);
      R.ui=await p.evaluate(async()=>{const o={};const i=0;
        ED.tab='lfo';ED.sub.lfo='l1';try{safeRebuild(buildSynthEd);}catch(e){o.e1=String(e);}
        await new Promise(r=>setTimeout(r,300));
        const pv=document.querySelector('.lfopv');o.pv=!!pv;o.linien0=pv&&pv.querySelector('.ksmg')?pv.querySelectorAll('.ksmg line').length:null;
        return o;});
      // Tab LFO per Tipp oeffnen, falls noetig
      const tabs=await p.$$eval('button',bs=>bs.filter(b=>/^LFO\s*1?$/.test(b.textContent.trim())&&b.offsetParent).map(b=>b.textContent.trim()));R.ui.tabs=tabs;
      await p.evaluate(()=>{const i=0;setP(i,'l1sync',1);ks4Set(i,'ksR1',8);edRefresh&&edRefresh();});await p.waitForTimeout(400);
      R.ui.linien=await p.evaluate(()=>{const pv=document.querySelector('.lfopv');return pv&&pv.querySelector('.ksmg')?pv.querySelectorAll('.ksmg line').length:null;});
      const pvBox=await p.evaluate(()=>{const pv=document.querySelector('.lfopv');if(!pv)return null;pv.scrollIntoView({block:'center'});const r=pv.getBoundingClientRect();return{x:r.x,y:r.y,w:r.width,h:r.height};});
      R.ui.pvBox=pvBox;
      if(lage==='hoch'||lage==='quer'){const pg=await p.evaluate(()=>{const e=document.querySelector('.lfopv');const c=e&&e.closest('.page,.pg,.edpage')||e&&e.parentElement.parentElement;const r=c.getBoundingClientRect();return{x:Math.max(0,r.x-4),y:Math.max(0,r.y-60),width:Math.min(innerWidth,r.width+8),height:Math.min(innerHeight-Math.max(0,r.y-60),r.height+120)};});
        await p.screenshot({path:path.join(here,(nm==='neu'?'foto-nachher':'foto-vorher')+(lage==='quer'?'-quer':'')+'.png'),clip:pg});}
      // MOD-Seite, + Modulation per Tipp
      await p.evaluate(()=>{ED.tab='mod';safeRebuild(buildSynthEd);});await p.waitForTimeout(300);
      const add=await p.$('button.madd');
      if(add){await add.scrollIntoViewIfNeeded();await add.tap();await p.waitForTimeout(250);
        const q=await p.$('.msrc button[data-s="lfo1"]');if(q){await q.tap();await p.waitForTimeout(250);}
        R.ui.ziele=await p.$$eval('.mdst button[data-d]',bs=>bs.map(b=>b.dataset.d));
        const ov=await p.evaluate(()=>{const bs=[...document.querySelectorAll('.mdst button[data-d]')];const rs=bs.map(b=>b.getBoundingClientRect());let o=0,small=0,out=0;
          for(let a=0;a<rs.length;a++){if(rs[a].height<32)small++;if(rs[a].right>innerWidth+1||rs[a].left<-1)out++;for(let c=a+1;c<rs.length;c++){const A=rs[a],B=rs[c];if(A.left<B.right-1&&B.left<A.right-1&&A.top<B.bottom-1&&B.top<A.bottom-1)o++;}}
          const cut=bs.filter(b=>b.scrollWidth>b.clientWidth+1).length;return{ueberlapp:o,klein:small,raus:out,abgeschnitten:cut};});
        R.ui.popup=ov;
        if(nm==='neu')await p.screenshot({path:path.join(here,'foto-ziele'+(lage==='quer'?'-quer':'')+'.png')});
        const z=await p.$('.mdst button[data-d="f2cut"]');
        if(z){const box=await z.boundingBox();if(box&&box.y+box.height>vp.height){await z.scrollIntoViewIfNeeded();}await z.tap();await p.waitForTimeout(300);}
        R.ui.mods=await p.evaluate(()=>S.tracks[0].sound.mods.map(m=>m.src+'>'+m.dst));
      }
      R.errs=errs;res[nm][lage]=R;await ctx.close();
    }
  }
  await b.close();srv.kill();fs.rmSync(dir,{recursive:true,force:true});
  const N=res.neu;
  if(N){const E=N.hoch.eng;
    for(const k in E.lock){const x=E.lock[k];if(x.gleich||!x.pair||!x.pair.length)fail('Lock '+k+' ohne Wirkung');}
    for(const d in E.mod){const x=E.mod[d];if(x.gleich||!x.kept)fail('Mod '+d+' ohne Wirkung');}
    for(const l of['hoch','quer']){const U=N[l].ui;if(!(U.linien>0))fail('keine Raster-Linien '+l);if(!U.ziele||!U.ziele.includes('f2cut')||!U.ziele.includes('takt'))fail('Ziele fehlen '+l);
      if(!U.mods||!U.mods.includes('lfo1>f2cut'))fail('Tipp-Route fehlt '+l);if(U.popup&&(U.popup.ueberlapp||U.popup.raus||U.popup.abgeschnitten))fail('Popup-Layout '+l+JSON.stringify(U.popup));
      if(N[l].errs.length)fail('Fehler '+l+' '+N[l].errs.join(' | '));}
    if(res.basis){const B=res.basis.hoch.eng;if(B.plain!==E.plain)fail('plain nicht bitgleich');if(B.ks!==E.ks)fail('KS4-Klang nicht bitgleich');
      if(res.basis.hoch.ui.linien0!=null)fail('basis hat Linien?');}
  }
  console.log(JSON.stringify(res,null,1));console.log(ok?'ALLE OK':'FEHLER');
})();
