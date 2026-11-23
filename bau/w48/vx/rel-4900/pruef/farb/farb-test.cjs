// FARB Kern-Test: Projekt auf 16 Spuren bringen (15. per Programm, 16. per Tipp auf "＋ Spur" im Szenen-Blatt),
// Farben der Spuren 1-16 an Matrix (Kopf-Balken, Feld --tc/--ta), Song (SV.cols, Spur-Leiste) und Video (vvCols) messen.
// Prueft: 9-16 eindeutig (untereinander und gegen 1-8), Kontrast, 1-8 bitgleich zur Vergleichsfassung, 8er-Projekt unveraendert.
// Aufruf: node farb-test.cjs <port> [fassung=neu] [vergleich=alt]   (Ordner unter srv/, z. B. alt = 4.88.0)
const {chromium}=require('playwright'),fs=require('fs'),path=require('path');
const port=process.argv[2]||fs.readFileSync(path.join(__dirname,'port.txt'),'utf8').trim(),NEU=process.argv[3]||'neu',ALT=process.argv[4]||'alt',here=__dirname;
let fail=0;const ok=(n,c,x)=>{console.log((c?'OK     ':'FEHLER ')+n+(x!==undefined?'  '+JSON.stringify(x):''));if(!c)fail++;};
const lin=c=>{c/=255;return c<=0.04045?c/12.92:Math.pow((c+0.055)/1.055,2.4);};
const lum=([r,g,b])=>0.2126*lin(r)+0.7152*lin(g)+0.0722*lin(b);
const cr=(a,b)=>{const x=lum(a),y=lum(b);return(Math.max(x,y)+.05)/(Math.min(x,y)+.05);};
const oklab=([r,g,b])=>{r=lin(r);g=lin(g);b=lin(b);let l=.4122214708*r+.5363325363*g+.0514459929*b,m=.2119034982*r+.6806995451*g+.1073969566*b,s=.0883024619*r+.2817188376*g+.6299787005*b;l=Math.cbrt(l);m=Math.cbrt(m);s=Math.cbrt(s);return[.2104542553*l+.793617785*m-.0040720468*s,1.9779984951*l-2.428592205*m+.4505937099*s,.0259040371*l+.7827717662*m-.808675766*s];};
const dE=(a,b)=>{const A=oklab(a),B=oklab(b);return Math.hypot(A[0]-B[0],A[1]-B[1],A[2]-B[2]);};
const rgb=s=>{const m=String(s).match(/rgba?\(([^)]*)\)/);return m?m[1].split(',').slice(0,3).map(Number):null;};

async function seite(b,wer,vp){
  const ctx=await b.newContext({viewport:vp||{width:428,height:926},hasTouch:true,isMobile:true,deviceScaleFactor:2});
  const p=await ctx.newPage(),errs=[];
  p.on('pageerror',e=>errs.push('pageerror '+e));
  p.on('console',m=>{if(m.type()==='error'&&!/abspann-logo/.test((m.location()||{}).url||'')&&!/Failed to load resource/.test(m.text()))errs.push(m.text());});
  p.on('response',r=>{if(r.status()>=400&&!/abspann-logo/.test(r.url()))errs.push('HTTP '+r.status()+' '+r.url());});
  await p.goto('http://127.0.0.1:'+port+'/'+wer+'/index.html');await p.waitForFunction(()=>window.SYNQUENZER,null,{timeout:90000});await p.waitForTimeout(1200);
  return{ctx,p,errs};
}
// alle Farben als rgb(...) messen (ueber ein Probe-Element aufgeloest)
const MISS=()=>{const pr=document.createElement('i');document.body.appendChild(pr);const res=v=>{pr.style.color='';pr.style.color=v;return getComputedStyle(pr).color;};
  const cs=getComputedStyle(document.documentElement),n=NT(),o={nt:n,vars:[],varsA:[],head:[],cell:[],cellA:[],sv:null,svl:[],vid:null,bg:res(cs.getPropertyValue('--bg')),ch:res(cs.getPropertyValue('--chassis'))};
  for(let k=1;k<=16;k++){o.vars.push(res(cs.getPropertyValue('--t'+k).trim()));o.varsA.push(cs.getPropertyValue('--t'+k+'a').trim()?res(cs.getPropertyValue('--t'+k+'a').trim()):'');}
  for(let i=0;i<n;i++){const h=UI.heads[i];const br=h&&h.el.querySelector('.bar');o.head.push(br?getComputedStyle(br).backgroundColor:(h?'el:'+res(getComputedStyle(h.el).getPropertyValue('--tc').trim()):null));
    let c=UI.cells[i]&&UI.cells[i][0];if(c&&!(c instanceof Element))c=c.el||document.querySelector('.slot[data-t="'+i+'"]');if(!(c instanceof Element))c=null;o.cell.push(c?res(getComputedStyle(c).getPropertyValue('--tc').trim()):null);o.cellA.push(c?res(getComputedStyle(c).getPropertyValue('--ta').trim()):null);}
  try{VV.col=null;o.vid=vvCols().t.slice(0,16).map(res);}catch(e){o.vid='x '+e;}
  pr.remove();return o;};
async function auf16(p,tipp){
  await p.evaluate(()=>{while(NT()<15)addTrack();});
  let getippt=false;
  if(tipp){ // 16. Spur per Tipp: Szenen-Blatt oeffnen, "＋ Spur" antippen
    await p.evaluate(()=>SYNQUENZER.xl.sheet());await p.waitForTimeout(400);
    const btn=p.locator('button[data-xa="t"]').first();
    if(await btn.count()){await btn.tap();getippt=true;await p.waitForTimeout(500);}
  }
  if(!getippt)await p.evaluate(()=>{while(NT()<16)addTrack();});
  // Clips in die neuen Spuren (Kopie aus Synth 2), damit Felder Farbe zeigen
  await p.evaluate(()=>{const src=S.tracks[1];for(let i=6;i<NT();i++){const t=S.tracks[i];if(!t||t.kind!=='synth')continue;for(let s=0;s<2;s++)if(src.clips[s])t.clips[s]=JSON.parse(JSON.stringify(src.clips[s]));}
    UI.dirty.all=UI.dirty.grid=true;if(EL.grid)buildGrid();markDirty();});
  await p.waitForTimeout(600);
  return getippt;
}
(async()=>{
  const b=await chromium.launch();const R={};
  for(const wer of [ALT,NEU]){
    const {ctx,p,errs}=await seite(b,wer);
    const vor=await p.evaluate(MISS);             // 8er-Ausgangsprojekt (6 Spuren) ohne Bedienung
    const tipp=await auf16(p,true);
    const m=await p.evaluate(MISS);
    // Tipp auf den Kopf von Spur 14 -> Auswahl-Farbe (Punkt/App --tc) = Farbe 14
    const th=p.locator('.th[data-t="13"]').first();let sel=null;
    if(await th.count()){await th.scrollIntoViewIfNeeded().catch(()=>{});await p.evaluate(()=>{if(MX.pages){const pg=MX.pages.findIndex(q=>q.includes(13));if(pg>=0&&pg!==trackBankOf())setTrackBank(pg);}});await p.waitForTimeout(300);
      await th.tap();await p.waitForTimeout(400);
      sel=await p.evaluate(()=>{const pr=document.createElement('i');document.body.appendChild(pr);pr.style.color=getComputedStyle(EL.app).getPropertyValue('--tc').trim();const c=getComputedStyle(pr).color;pr.remove();const d=document.getElementById('stDot');return{t:typeof UI.sel==='number'?UI.sel:(S.ui&&S.ui.sel),app:c,dot:d?getComputedStyle(d).backgroundColor:null};});}
    m.sel=sel;
    // Song-Ansicht: Farben der Spur-Leiste und SV.cols
    await p.evaluate(()=>{setSongView(true);});await p.waitForTimeout(700);
    m.sv=await p.evaluate(()=>{const pr=document.createElement('i');document.body.appendChild(pr);const res=v=>{pr.style.color='';pr.style.color=v;return getComputedStyle(pr).color;};
      const a=(SV.cols||[]).slice(0,16).map(res),l=[...document.querySelectorAll('.sv-l.trk')].filter(d=>+d.dataset.t>=0&&d.querySelector(':scope>i')).map(d=>[+d.dataset.t,getComputedStyle(d.querySelector(':scope>i')).backgroundColor]);pr.remove();return{cols:a,lab:l};});
    await p.evaluate(()=>{setSongView(false);});await p.waitForTimeout(300);
    R[wer]={vor,m,tipp,errs:errs.slice()};
    await ctx.close();
  }
  const A=R[ALT],N=R[NEU];
  ok('16. Spur per Tipp auf "＋ Spur" angelegt (beide Fassungen)',A.tipp&&N.tipp&&A.m.nt===16&&N.m.nt===16,{alt:A.m.nt,neu:N.m.nt});
  ok('Vergleichsfassung zeigt das alte Verhalten (9-16 = 1-8)',A.m.vars.slice(8).every((c,k)=>c===A.m.vars[k]),A.m.vars.slice(8));
  ok('Spuren 1-8: Farben bitgleich zur Vergleichsfassung',N.m.vars.slice(0,8).join()===A.m.vars.slice(0,8).join()&&N.m.varsA.slice(0,8).join()===A.m.varsA.slice(0,8).join());
  ok('Ausgangsprojekt ohne Bedienung unveraendert (Kopf/Feld/Video 1-6)',JSON.stringify([N.vor.head,N.vor.cell,N.vor.cellA])===JSON.stringify([A.vor.head,A.vor.cell,A.vor.cellA])&&N.vor.nt===A.vor.nt,{nt:N.vor.nt});
  const C=N.m.vars.map(rgb);
  ok('16 Farben paarweise verschieden',new Set(N.m.vars).size===16,N.m.vars);
  let mn=9,mp='',mo=9;for(let i=0;i<16;i++)for(let j=i+1;j<16;j++){const d=dE(C[i],C[j]);if(j>=8&&d<mn){mn=d;mp=(i+1)+'-'+(j+1);}if(j<8&&d<mo)mo=d;}
  ok('Abstand (OKLab) jeder neuen Farbe >= 0,07 zu allen anderen (1-8 untereinander: '+mo.toFixed(3)+')',mn>=0.07,{min:+mn.toFixed(3),paar:mp});
  const bg=rgb(N.m.bg),ch=rgb(N.m.ch),ink=[14,16,20];
  const kb=C.slice(8).map(c=>+cr(c,bg).toFixed(2)),kc=C.slice(8).map(c=>+cr(c,ch).toFixed(2)),ki=C.slice(8).map(c=>+cr(c,ink).toFixed(2));
  const ob=Math.min(...C.slice(0,8).map(c=>cr(c,bg)));
  ok('Kontrast 9-16 auf Hintergrund >= 6,5:1 (1-8 min '+ob.toFixed(2)+')',Math.min(...kb)>=6.5,kb);
  ok('Kontrast 9-16 auf Gehaeuse >= 6:1',Math.min(...kc)>=6,kc);
  ok('Dunkle Schrift auf Farbflaeche 9-16 >= 6:1',Math.min(...ki)>=6,ki);
  ok('Matrix: Kopf-Balken 1-16 = Spurfarbe',N.m.head.every((h,i)=>h===N.m.vars[i]));
  ok('Matrix: Felder --tc/--ta 1-16 = Spurfarbe',N.m.cell.every((h,i)=>h===N.m.vars[i])&&N.m.cellA.every((h,i)=>h===N.m.varsA[i]));
  ok('Video-Farben 1-16 = Spurfarbe',Array.isArray(N.m.vid)&&N.m.vid.every((h,i)=>h===N.m.vars[i]),N.m.vid);
  ok('Song: SV.cols 1-16 = Spurfarbe',N.m.sv.cols.length>=16&&N.m.sv.cols.every((h,i)=>h===N.m.vars[i]));
  ok('Song: sichtbare Spur-Leiste = Spurfarbe',N.m.sv.lab.length>=1&&N.m.sv.lab.every(([t,c])=>c===N.m.vars[t]),N.m.sv.lab.length);
  ok('Tipp auf Spur 14: Auswahl zeigt Farbe 14 (neu) bzw. Farbe 6 (alt)',N.m.sel&&N.m.sel.app===N.m.vars[13]&&(!N.m.sel.dot||N.m.sel.dot===N.m.vars[13])&&A.m.sel&&A.m.sel.app===A.m.vars[5],{neu:N.m.sel,alt:A.m.sel});
  ok('Keine Seitenfehler / console.error',!A.errs.length&&!N.errs.length,{alt:A.errs,neu:N.errs});
  fs.writeFileSync(path.join(here,'farb-test.json'),JSON.stringify({neu:N.m.vars,alt:A.m.vars,kontrastBg:kb,kontrastGeh:kc,kontrastSchrift:ki,minAbstand:mn,paar:mp},null,1));
  await b.close();console.log(fail?'FEHLER: '+fail:'ALLE OK');process.exit(fail?1:0);
})().catch(e=>{console.error(e);process.exit(2);});
