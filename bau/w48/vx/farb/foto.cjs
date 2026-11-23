// FARB Fotos: Matrix mit 16 Spuren (Clips in Szene 1+2), alt (4.88) und neu, hochkant + quer. node foto.cjs <port>
const {chromium}=require('playwright'),fs=require('fs'),path=require('path');
const port=process.argv[2]||fs.readFileSync(path.join(__dirname,'port.txt'),'utf8').trim();
(async()=>{const b=await chromium.launch();
for(const [wer,name] of [['alt','foto-vorher'],['neu','foto-nachher']])for(const [vp,suf] of [[{width:428,height:926},''],[{width:926,height:428},'-quer']]){
  const ctx=await b.newContext({viewport:vp,hasTouch:true,isMobile:true,deviceScaleFactor:2});const p=await ctx.newPage();
  await p.goto('http://127.0.0.1:'+port+'/'+wer+'/index.html');await p.waitForFunction(()=>window.SYNQUENZER,null,{timeout:90000});await p.waitForTimeout(1200);
  await p.evaluate(()=>{while(NT()<16)addTrack();const src=S.tracks[1];for(let i=6;i<NT();i++){const t=S.tracks[i];if(!t||t.kind!=='synth')continue;for(let s=0;s<3;s++)if(src.clips[s]&&(s+i)%3)t.clips[s]=JSON.parse(JSON.stringify(src.clips[s]));}
    UI.dirty.all=UI.dirty.grid=true;if(EL.grid)buildGrid();markDirty();selectTrack(13);
    if(MX.pages){const pg=MX.pages.findIndex(q=>q.includes(13));if(pg>=0&&pg!==trackBankOf())setTrackBank(pg);}});
  await p.waitForTimeout(1500);await p.evaluate(()=>{if(EL.toast)EL.toast.style.visibility='hidden';});await p.waitForTimeout(300);// Hinweis-Meldung nur fuers Foto ausblenden
  await p.screenshot({path:path.join(__dirname,name+suf+'.png')});await ctx.close();}
await b.close();console.log('ok');})();
