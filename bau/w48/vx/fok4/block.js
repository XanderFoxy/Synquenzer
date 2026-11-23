// FOK4-BEGIN – Spektral-Fokus: neue Stück-Bilder nicht mehr im Bild-Takt hochladen. Sobald ein Stück vom Kern kommt (und sichtbar ist), lädt eine
// eigene Aufgabe es hoch – bei gleicher Stück-Größe nur die geänderten Spalten per texSubImage2D in die vorhandene Textur, sonst neue Textur –
// mit Zaun (fenceSync), eins nach dem anderen; das Bild nimmt nur fertige Texturen. So wartet kein Bild auf Hochladen + Mipmaps. Endbild gleich.
const FOK4={on:true,f:null,U:null,G:null,T:null,fs:null,sub:false,w:0,hit:false,tm:0,cont:new WeakMap(),nNew:0,nSub:0,nSame:0,nCol:0,nWait:0,nDrop:0,err:''};
function fok4Up(U,f){
const P=FOK4;if(!P.on||!U.gl||!U.f1||!f||!f.data)return false;
P.hit=true;
if(!P.f)fok4Start(U,f);
return true;
}
function fok4Start(U,f){const P=FOK4;P.f=f;P.U=U;P.G=U.gl;clearTimeout(P.tm);P.tm=setTimeout(fok4Go,0);}
function fok4Next(U){
const P=FOK4;if(!P.on||P.f||!U||!U.gl||!SPK1.open||!U.meta)return;
const F=U.f1,S=F&&F.set,O=U.spec;if(!S||!O||!O.hop||F.mode==='alles'||S.doc!==SPK1.doc||S.N!==O.N||S.mode!==F.mode||F.glRef!==U.gl)return;
const v=U.v,hs=O.hop/U.meta.sr;
for(let k=0;k<S.chunks.length;k++){
const f=S.chunks[k],o=O.chunks[k];if(!f||f.tex||!f.data||(o&&o.w!==f.w))continue;
const xa=((f.x0-0.5)*hs-v.t0)*v.pps,xb=((f.x0+f.w-0.5)*hs-v.t0)*v.pps;if(xb<0||xa>U.W)continue;
fok4Start(U,f);return;
}
}
function fok4W(U){const h=FOK4.hit;FOK4.hit=false;return h&&!!FOK4.f;}
function fok4Live(P){const U=P.U,F=U&&U.f1,S=F&&F.set;return!!(SPK1.open&&U.gl&&U.gl===P.G&&F.glRef===U.gl&&S&&S.chunks.includes(P.f));}
function fok4Diff(A,B,w,R){
let a=w,b=0;
if(!((A.byteOffset|B.byteOffset)&3)&&!(w&3)){
const q=w>>2,A4=new Uint32Array(A.buffer,A.byteOffset,q*R),B4=new Uint32Array(B.buffer,B.byteOffset,q*R);
for(let y=0,o=0;y<R;y++,o+=q){
for(let i=0;i*4<a;i++)if(A4[o+i]!==B4[o+i]){a=i*4;break;}
for(let i=q-1;i*4+4>b;i--)if(A4[o+i]!==B4[o+i]){b=i*4+4;break;}
}
}else{
for(let y=0,o=0;y<R;y++,o+=w){
for(let i=0;i<a;i++)if(A[o+i]!==B[o+i]){a=i;break;}
for(let i=w-1;i>=b;i--)if(A[o+i]!==B[o+i]){b=i+1;break;}
}
}
return[a,Math.min(w,b)];
}
function fok4Go(){
const P=FOK4,f=P.f;P.tm=0;
try{
if(!f||f.tex||!fok4Live(P)){fok4Fin();return;}
const G=P.G,gl=G.gl,o=f.old,w=f.w,R=f.R,n=w*R;
const od=o&&o.tex?(P.cont.get(o.tex)||o.data):null;
if(od&&o.w===w&&o.R===R&&od.length===n&&f.data.length===n){
const[a,b]=fok4Diff(od,f.data,w,R);P.T=o.tex;P.sub=true;
if(b>a){
gl.bindTexture(gl.TEXTURE_2D,P.T);gl.pixelStorei(gl.UNPACK_ALIGNMENT,1);gl.pixelStorei(gl.UNPACK_ROW_LENGTH,w);gl.pixelStorei(gl.UNPACK_SKIP_PIXELS,a);
try{gl.texSubImage2D(gl.TEXTURE_2D,0,a,0,b-a,R,gl.RED,gl.UNSIGNED_BYTE,f.data);}finally{gl.pixelStorei(gl.UNPACK_ROW_LENGTH,0);gl.pixelStorei(gl.UNPACK_SKIP_PIXELS,0);}
gl.generateMipmap(gl.TEXTURE_2D);P.nSub++;P.nCol+=b-a;
}else P.nSame++;
}else{P.T=G.tex(w,R,'r',f.data,true);P.sub=false;P.nNew++;}
P.cont.set(P.T,f.data);
P.fs=gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE,0);gl.flush();P.w=0;
P.tm=setTimeout(fok4Poll,2);
}catch(e){P.err=String((e&&e.message)||e).slice(0,200);P.on=false;fok4Fin();}
}
function fok4Poll(){
const P=FOK4;P.tm=0;if(!P.f)return;
try{
const gl=P.G.gl;let ok=true;
if(P.fs&&!gl.isContextLost())ok=gl.getSyncParameter(P.fs,gl.SYNC_STATUS)===gl.SIGNALED;
if(!ok&&++P.w<16){P.tm=setTimeout(fok4Poll,P.w<6?2:5);return;}
if(!ok)P.nWait++;
}catch(e){P.err=String((e&&e.message)||e).slice(0,200);}
fok4Fin();
}
function fok4Fin(){
const P=FOK4,f=P.f,U=P.U,T=P.T;
try{if(P.fs)P.G.gl.deleteSync(P.fs);}catch(e){}P.fs=null;
try{
if(T){
if(fok4Live(P)&&!f.tex){f.tex=T;if(P.sub&&f.old&&f.old.tex===T)f.old.tex=null;}
else if(!P.sub){try{P.G.gl.deleteTexture(T);}catch(e){}P.nDrop++;}
}
}catch(e){P.err=String((e&&e.message)||e).slice(0,200);}
P.f=P.U=P.G=P.T=null;P.sub=false;
if(U&&SPK1.open){try{fok4Next(U);}catch(e){P.err=String((e&&e.message)||e).slice(0,200);}if(!P.f&&!(U.f1&&U.f1.dt))spk1Dirty(U,'g');}
}
// FOK4-END
