// node pngdiff.cjs a.png b.png -> Anzahl abweichender Pixel + Rahmen (im Browser gerechnet)
const {chromium}=require('playwright'),fs=require('fs');
module.exports=async function diff(br,a,b){const p=await br.newPage();const r=await p.evaluate(async([a,b])=>{
 const ld=s=>new Promise(r=>{const i=new Image();i.onload=()=>r(i);i.src='data:image/png;base64,'+s;});const A=await ld(a),B=await ld(b);
 if(A.width!==B.width||A.height!==B.height)return {n:-1,size:[A.width,A.height,B.width,B.height]};
 const g=i=>{const c=document.createElement('canvas');c.width=i.width;c.height=i.height;const x=c.getContext('2d');x.drawImage(i,0,0);return x.getImageData(0,0,i.width,i.height).data;};
 const da=g(A),db=g(B);let n=0,x0=1e9,y0=1e9,x1=-1,y1=-1;for(let i=0;i<da.length;i+=4){if(da[i]!==db[i]||da[i+1]!==db[i+1]||da[i+2]!==db[i+2]){n++;const p=i/4,x=p%A.width,y=(p/A.width)|0;x0=Math.min(x0,x);y0=Math.min(y0,y);x1=Math.max(x1,x);y1=Math.max(y1,y);}}
 return {n,box:n?[x0,y0,x1,y1]:null,w:A.width,h:A.height};},[a.toString('base64'),b.toString('base64')]);await p.close();return r;};
if(require.main===module)(async()=>{const br=await chromium.launch();console.log(await module.exports(br,fs.readFileSync(process.argv[2]),fs.readFileSync(process.argv[3])));await br.close();})();
