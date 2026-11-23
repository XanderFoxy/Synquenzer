const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const errs=[];
for(const vp of [{width:428,height:926},{width:926,height:428}]){
const c=await b.newContext({viewport:vp,hasTouch:true,isMobile:true});const p=await c.newPage();
p.on('pageerror',e=>errs.push('pageerror '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push('console '+m.text());});
await p.goto('http://127.0.0.1:8761/index.html',{waitUntil:'load'});await p.waitForTimeout(4000);
const r=await p.evaluate(()=>{const V=new Function(vsDspMake.toString()+';return vsDspMake();')();
const s=vsDspMake.toString();return{hat:s.includes('ges2Glide(notes,m,unk,F)'),seg:typeof V.segment,vsd:typeof VSD.segment};});
console.log(JSON.stringify(vp),JSON.stringify(r));await c.close();}
console.log('Fehler:',errs.filter(e=>!/abspann-logo/.test(e)).length,JSON.stringify(errs.slice(0,5)));await b.close();})();
