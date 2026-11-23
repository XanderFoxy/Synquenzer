/* ZRL3-BEGIN Audio-Ebene: Phasen-Vocoder-Abschnitte mit genau gleichen Eingaben aus dem Zwischenspeicher (bitgleich zum Voll-Neurechnen) */
const zrl3={m:new Map(),b:0,max:32<<20,hit:0,neu:0};
function zrl3Key(x,rr,fvA,H,N,fmt,sr,s0,e0){
const n=x.length,a=s0-N,b=e0+N,lo=Math.max(0,a),hi=Math.min(n,b),U=new Uint32Array(x.buffer,x.byteOffset,n),R=new Float32Array(2),RU=new Uint32Array(R.buffer);
let h1=0x811c9dc5,h2=0x2545f491;
const mm=v=>{let k=Math.imul(v,0xcc9e2d51);k=(k<<15)|(k>>>17);h2^=Math.imul(k,0x1b873593);h2=(h2<<13)|(h2>>>19);h2=(Math.imul(h2,5)+0xe6546b64)|0;};
for(let i=lo;i<hi;i++){const v=U[i];h1=Math.imul(h1^v,16777619);mm(v);}
for(let p=s0-N;p<e0;p+=H){const ci=Math.min(rr.length-1,Math.max(0,Math.round((p+N/2)/H)));R[0]=rr[ci];R[1]=fvA?fvA[ci]:1;for(let j=0;j<2;j++){h1=Math.imul(h1^RU[j],16777619);mm(RU[j]);}}
return[sr,N,H,fmt?1:0,fvA?1:0,e0-s0,lo-a,b-hi,(h1>>>0).toString(36),(h2>>>0).toString(36)].join(':');
}
async function zrl3Pv(x,sr,rr,fvA,H,N,fmt,regs,prog){
if(!(x instanceof Float32Array)||!(rr instanceof Float32Array)||(fvA&&!(fvA instanceof Float32Array)))return pv(x,sr,rr,fvA,H,N,fmt,regs,prog);
const C=zrl3.m,ks=regs.map(([s0,e0])=>zrl3Key(x,rr,fvA,H,N,fmt,sr,s0,e0)),miss=regs.filter((r,i)=>!C.has(ks[i]));
const y=miss.length?await pv(x,sr,rr,fvA,H,N,fmt,miss,prog):Float32Array.from(x);
for(let i=0;i<regs.length;i++){
const k=ks[i],[s0,e0]=regs[i],v=C.get(k);
if(v){C.delete(k);C.set(k,v);y.set(v,s0);zrl3.hit++;}
else{const c=y.slice(s0,e0);C.set(k,c);zrl3.b+=c.byteLength;zrl3.neu++;}
}
while(zrl3.b>zrl3.max&&C.size>1){const k0=C.keys().next().value;zrl3.b-=C.get(k0).byteLength;C.delete(k0);}
return y;
}
/* ZRL3-END */
