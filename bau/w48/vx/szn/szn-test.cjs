// SZN Kern-Test: Szenen-Name im Matrix-Kopf. node szn-test.cjs <port> [basis-ordner] [neu-ordner]
// Server-Wurzel srv/ mit <basis>/ (4.88.0) und <neu>/, je index.html + version.json.
const {chromium}=require('playwright'),fs=require('fs');
const port=process.argv[2],BA=process.argv[3]||'basis',NE=process.argv[4]||'neu',here=__dirname;
let fail=0;const ok=(n,c,x)=>{console.log((c?'OK     ':'FEHLER ')+n+(x!==undefined?'  '+JSON.stringify(x):''));if(!c)fail++;};
const VPS={hoch:{width:428,height:926},quer:{width:926,height:428}};
async function seite(b,wer,vp){
  const ctx=await b.newContext({viewport:vp,hasTouch:true,isMobile:true,deviceScaleFactor:2});
  const p=await ctx.newPage(),errs=[];
  p.on('pageerror',e=>errs.push('pageerror '+e));
  p.on('console',m=>{if(m.type()==='error'&&!/abspann-logo/.test((m.location()||{}).url||'')&&!/Failed to load resource/.test(m.text()))errs.push(m.text());});
  p.on('response',r=>{if(r.status()>=400&&!/abspann-logo/.test(r.url()))errs.push('HTTP '+r.status()+' '+r.url());});
  await p.goto('http://127.0.0.1:'+port+'/'+wer+'/index.html');
  await p.waitForFunction(()=>window.SYNQUENZER,null,{timeout:90000});await p.waitForTimeout(1500);
  return {ctx,p,errs};
}
// Projekt mit gegebenen Szenen-Namen ueber den normalen Lade-Weg (serialisieren -> normalisieren -> anwenden)
const laden=(p,names)=>p.evaluate(async names=>{const W=ms=>new Promise(r=>setTimeout(r,ms));
  const o=JSON.parse(serializeProject());o.scenes.forEach((sc,i)=>{sc.name=names[i]!=null?names[i]:'Szene '+(i+1);});
  applyProject(normalizeProject(o));UI.dirty.grid=true;await W(400);return S.scenes.map(x=>x.name);},names);
const geo=p=>p.evaluate(()=>{const R=e=>{const r=e.getBoundingClientRect();return [r.x,r.y,r.width,r.height].map(v=>+v.toFixed(2));};
  return {scn:UI.scenes.map(R),slot:MX.rows.map(i=>MX.scenes.map(s=>R(UI.cells[i][s].el))),grid:R(EL.grid)};});
const kopf=p=>p.evaluate(()=>UI.scenes.filter(b=>b.getBoundingClientRect().width>0).map(b=>{const br=b.getBoundingClientRect(),sn=b.querySelector('.sn');
  if(!sn||!sn.textContent)return {s:+b.dataset.s,sn:null};const r=sn.getBoundingClientRect(),cs=getComputedStyle(sn);
  const kids=[...b.children].filter(k=>k.getBoundingClientRect().height>0).map(k=>k.getBoundingClientRect());
  return {s:+b.dataset.s,sn:sn.textContent,cut:sn.scrollWidth>sn.clientWidth,ell:cs.textOverflow,innen:r.left>=br.left-.01&&r.right<=br.right+.01&&r.top>=br.top&&r.bottom<=br.bottom,
    allesInnen:kids.every(k=>k.top>=br.top&&k.bottom<=br.bottom&&k.left>=br.left-.01&&k.right<=br.right+.01),under:r.top>=b.querySelector('.st').getBoundingClientRect().bottom-.01,
    sh:b.scrollHeight,ch:b.clientHeight,mitte:[r.x+r.width/2,r.y+r.height/2]};}));
const kopfBild=async(p,datei)=>{const g=await p.evaluate(()=>{const r=EL.grid.getBoundingClientRect(),h=UI.scenes[0].getBoundingClientRect();return {x:r.x,y:Math.max(0,h.y-6),w:r.width,h:h.height+12};});
  return p.screenshot({path:datei,clip:{x:g.x,y:g.y,width:g.w,height:g.h}});};
const zust=p=>p.evaluate(()=>({playing:!!R.playing,q:UI.scenes.map(b=>b.classList.contains('q')||b.classList.contains('full')),pend:[...R.pend].map(x=>x==null?null:typeof x==='object'?JSON.stringify(x):x),slot:[...R.slot],
  names:S.scenes.map(x=>x.name),clips:S.tracks.map(t=>t?t.clips.map(c=>c?(c.notes?c.notes.length:1):0).join(''):'')}));
const NAMEN=['Strophe','Refrain mit sehr langem Namen',null,'Szene 4','Bridge','',null,'Outro'];
(async()=>{
  const b=await chromium.launch();
  for(const [vn,vp] of Object.entries(VPS)){
    console.log('--- '+vn+' '+vp.width+'x'+vp.height);
    const A=await seite(b,BA,vp),N=await seite(b,NE,vp);
    // 1) Start-Zustand ohne Bedienung: Geometrie gleich
    const ga=await geo(A.p),gn=await geo(N.p);
    ok(vn+': Start – Kopf/Zellen-Geometrie gleich',JSON.stringify(ga)===JSON.stringify(gn));
    // 2) Ohne Namen: Kopfzeile pixel-gleich zu Basis
    await laden(A.p,[]);await laden(N.p,[]);
    const pa=await kopfBild(A.p,here+'/tests/ohne-'+vn+'-basis.png'),pn=await kopfBild(N.p,here+'/tests/ohne-'+vn+'-neu.png');
    ok(vn+': ohne Namen – Kopfzeile pixel-gleich ('+pa.length+' B)',pa.equals(pn));
    const ga2=await geo(A.p),gn2=await geo(N.p);ok(vn+': ohne Namen – Geometrie gleich',JSON.stringify(ga2)===JSON.stringify(gn2));
    ok(vn+': ohne Namen – kein Namens-Feld',(await kopf(N.p)).every(k=>k.sn===null));
    // 3) Mit Namen (auch langer Name, Standard-Name "Szene 4" und leer = kein Name)
    await laden(A.p,NAMEN);const nm=await laden(N.p,NAMEN);
    const K=await kopf(N.p),by=s=>K.find(k=>k.s===s)||{};
    ok(vn+': Name "Strophe" sichtbar unter der Nummer',by(0).sn==='Strophe'&&by(0).innen&&by(0).under&&!by(0).cut,by(0));
    ok(vn+': langer Name mit … gekürzt, bleibt in der Zelle',by(1).sn===nm[1].trim()&&nm[1].startsWith('Refrain mit sehr lang')&&by(1).cut&&by(1).ell==='ellipsis'&&by(1).innen,by(1));
    ok(vn+': ohne Namen / Standard-Name → kein Feld',by(2).sn===null&&by(3).sn===null);
    ok(vn+': nichts ragt aus dem Kopf (alle Zeilen)',K.every(k=>k.sn===null||(k.allesInnen&&k.sh<=k.ch)),K.map(k=>[k.s,k.sh,k.ch,k.allesInnen]));
    const ga3=await geo(A.p),gn3=await geo(N.p);ok(vn+': mit Namen – Kopf/Zellen-Geometrie gleich wie Basis',JSON.stringify(ga3)===JSON.stringify(gn3));
    // 4) Speichern + neu laden: Namen bleiben
    const nm2=await N.p.evaluate(async()=>{const W=ms=>new Promise(r=>setTimeout(r,ms));applyProject(normalizeProject(JSON.parse(serializeProject())));UI.dirty.grid=true;await W(400);return UI.scenes.map(b=>b.querySelector('.sn')?b.querySelector('.sn').textContent:'');});
    ok(vn+': nach Speichern/Laden gleich',nm2[0]==='Strophe'&&nm2[1]===nm[1].trim()&&!nm2[2]&&!nm2[3],nm2);
    // 5) Akkord-Zeile + Tonart + Name: passt noch in den Kopf
    const vollN=await N.p.evaluate(async()=>{const W=ms=>new Promise(r=>setTimeout(r,ms));S.scenes[0].chords={len:4,ch:[{b:0,tg:null},{b:2,tg:null}]};UI.dirty.grid=true;await W(300);
      const b=UI.scenes[0],br=b.getBoundingClientRect();const ks=[...b.children].filter(k=>k.getBoundingClientRect().height>0).map(k=>k.getBoundingClientRect());
      return {n:ks.length,innen:ks.every(k=>k.top>=br.top+1-.01&&k.bottom<=br.bottom-1+.01),sh:b.scrollHeight,ch:b.clientHeight,h:br.height};});
    ok(vn+': Name + Tonart + Akkord-Zeile innerhalb des Rahmens',vollN.n===4&&vollN.innen&&vollN.sh<=vollN.ch,vollN);
    await N.p.evaluate(async()=>{S.scenes[0].chords=null;UI.dirty.grid=true;await new Promise(r=>setTimeout(r,300));});
    // Fotos
    if(vn==='hoch'){await kopfBild(A.p,here+'/tests/kopf-hoch-basis.png');}
    await A.p.screenshot({path:here+'/foto-vorher'+(vn==='quer'?'-quer':'')+'.png',clip:{x:0,y:0,width:vp.width,height:Math.min(vp.height,vn==='quer'?428:420)}});
    await N.p.screenshot({path:here+'/foto-nachher'+(vn==='quer'?'-quer':'')+'.png',clip:{x:0,y:0,width:vp.width,height:Math.min(vp.height,vn==='quer'?428:420)}});
    // 6) Antippen auf den Namen startet die Szene wie bisher (gleiche Stelle in Basis)
    const pt=by(1).mitte;
    await A.p.touchscreen.tap(pt[0],pt[1]);await N.p.touchscreen.tap(pt[0],pt[1]);
    await A.p.waitForTimeout(500);await N.p.waitForTimeout(500);
    const za=await zust(A.p),zn=await zust(N.p);
    ok(vn+': Tipp auf Namen → Szene 2 startet wie Basis',zn.playing&&JSON.stringify({p:za.playing,q:za.q,s:za.pend})===JSON.stringify({p:zn.playing,q:zn.q,s:zn.pend}),{basis:za.q,neu:zn.q,playing:zn.playing});
    await A.p.evaluate(()=>{stop();});await N.p.evaluate(()=>{stop();});await A.p.waitForTimeout(300);await N.p.waitForTimeout(300);
    // 7) Ziehen: Kopf von Szene 1 (am Namen gepackt) auf Szene 3 – gleiche Wirkung wie Basis
    const p0=by(0).mitte,K3=await N.p.evaluate(()=>{const r=UI.scenes[2].getBoundingClientRect();return [r.x+r.width/2,r.y+r.height/2];});
    const vor=await zust(N.p);
    for(const P of [A.p,N.p]){const pfad=[[p0[0],p0[1]+60],[K3[0],p0[1]+60],[K3[0],K3[1]+60]];const cdp=await P.context().newCDPSession(P),T=(type,x,y)=>cdp.send('Input.dispatchTouchEvent',{type,touchPoints:type==='touchEnd'?[]:[{x,y,id:1}]});
      await T('touchStart',p0[0],p0[1]);let c=[p0[0],p0[1]];
      for(const z of pfad){for(let k=1;k<=8;k++){await T('touchMove',c[0]+(z[0]-c[0])*k/8,c[1]+(z[1]-c[1])*k/8);await P.waitForTimeout(30);}c=z;}await P.waitForTimeout(150);await T('touchEnd');await P.waitForTimeout(700);}
    const da=await zust(A.p),dn=await zust(N.p);
    ok(vn+': Ziehen des Kopfs wirkt wie Basis',JSON.stringify([da.names,da.clips])===JSON.stringify([dn.names,dn.clips]),{basis:da.names,neu:dn.names,geaendert:JSON.stringify([vor.names,vor.clips])!==JSON.stringify([dn.names,dn.clips])});
    const Kd=await kopf(N.p);ok(vn+': nach Ziehen zeigt der Kopf die Namen passend',Kd.every(k=>(k.sn||'')===((n=>n&&n!=='Szene '+(k.s+1)?n:'')((dn.names[k.s]||'').trim()))),Kd.map(k=>[k.s,k.sn]));
    ok(vn+': keine Seitenfehler',A.errs.length===0&&N.errs.length===0,{basis:A.errs,neu:N.errs});
    await A.ctx.close();await N.ctx.close();
  }
  await b.close();
  console.log(fail?'FEHLER: '+fail:'ALLE OK');process.exit(fail?1:0);
})().catch(e=>{console.error(e);process.exit(2);});
