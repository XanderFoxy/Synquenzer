// LT2-BEGIN – Spektral: Vollbild mit Tönung nach einem Wechsel bei stehender Ansicht (Fokus Alles / Nur Gefundenes, Ebenen-Farben an) stückweise
// in ein eigenes Bild vorzeichnen (je Bild ein Streifen, Leinwand zeigt solange das alte Bild) und erst fertig auf einmal zeigen – Endbild gleich,
// keine lange Aufgabe. Nur wenn ein Vollbild mit Tönung auf diesem Gerät zuletzt langsam war (Bildabstand > 34 ms); beim Bewegen wie bisher sofort.
const LT2S={on:true,run:false,inner:false,hold:false,i:0,n:0,G:null,fb:null,tx:null,fG:null,fw:0,fh:0,sig:'',lastKey:'',lastSig:'',lastNl:0,lastT:0,tStep:0,w:0,fs:null,slow:false,cost:0,mq:0,nSeq:0,nStep:0,nAbort:0,nPres:0,nFull:0,err:'',ids:new WeakMap(),c:0};
function lt2sId(o){if(!o)return 0;let n=LT2S.ids.get(o);if(!n){n=++LT2S.c;LT2S.ids.set(o,n);}return n;}
function lt2sSig(U,G){
const v=U.v,T=U.tintOn?U.tint:null,nl=T?Math.min(8,T.ids.length):0;
const key=[lt2sId(G),U.cw,U.ch,U.dpr,v.t0,v.pps,v.mTop,v.rowH,U.lo,U.hi].join(',');
let s=nl+'|'+(nl?lt2sId(T)+':'+T.ids.slice(0,8).map(id=>{const l=U.meta.layers.find(x=>x.id===id);return l?l.col:'-';}).join(','):''),all=true;
if(U.spec&&U.spec.hop&&U.meta){const hs=U.spec.hop/U.meta.sr,d=U.dpr,W=U.cw;s+='|'+U.spec.hop;
for(const c of U.spec.chunks){if(!c)continue;const xa=((c.x0-0.5)*hs-v.t0)*v.pps*d,xb=((c.x0+c.w-0.5)*hs-v.t0)*v.pps*d;if(xb<0||xa>W)continue;if(!c.tex)all=false;s+=','+lt2sId(c.tex);}}
else all=false;
return{key,sig:key+'#'+s,nl,all};
}
function lt2sFree(){
const P=LT2S;try{if(P.fs&&P.fG)P.fG.gl.deleteSync(P.fs);}catch(e){}P.fs=null;try{if(P.fb&&P.fG&&!P.fG.gl.isContextLost()){P.fG.gl.deleteFramebuffer(P.fb);P.fG.gl.deleteTexture(P.tx);}}catch(e){}
P.fb=P.tx=P.fG=null;P.fw=P.fh=0;
}
function lt2sStop(){LT2S.run=false;lt2sFree();}
function lt2sMeasure(t){
const P=LT2S;if(P.mq)return;P.mq=1;
requestAnimationFrame(()=>{P.mq=0;const g=performance.now()-t;P.cost=g;P.slow=g>34;});
}
const LT2S_FS='#version 300 es\nprecision highp float;uniform highp sampler2D s;out vec4 o;void main(){o=texelFetch(s,ivec2(gl_FragCoord.xy),0);}';
const LT2S_VS='#version 300 es\nvoid main(){vec2 p=vec2(float((gl_VertexID<<1)&2),float(gl_VertexID&2));gl_Position=vec4(p*2.0-1.0,0.0,1.0);}';
const LT2S_P=new WeakMap();
function lt2sProg(G){
const gl=G.gl;let p=LT2S_P.get(G);
if(!p){const mk=(t,src)=>{const o=gl.createShader(t);gl.shaderSource(o,src);gl.compileShader(o);if(!gl.getShaderParameter(o,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(o)||'shader');return o;};
p=gl.createProgram();gl.attachShader(p,mk(gl.VERTEX_SHADER,LT2S_VS));gl.attachShader(p,mk(gl.FRAGMENT_SHADER,LT2S_FS));gl.linkProgram(p);
if(!gl.getProgramParameter(p,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(p)||'link');p.u=gl.getUniformLocation(p,'s');LT2S_P.set(G,p);}
return p;
}
function lt2sCopy(G,W,H){
const gl=G.gl,p=lt2sProg(G);
gl.viewport(0,0,W,H);gl.useProgram(p);gl.bindVertexArray(null);gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,LT2S.tx);gl.uniform1i(p.u,0);
gl.drawArrays(gl.TRIANGLES,0,3);gl.bindTexture(gl.TEXTURE_2D,null);gl.bindVertexArray(G.vao);
}
function lt2sStep(U,G,S,t){
const P=LT2S,gl=G.gl,W=U.cw,H=U.ch;
if(!P.fb||P.fG!==G||P.fw!==W||P.fh!==H){
lt2sFree();const tx=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,tx);
gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA8,W,H,0,gl.RGBA,gl.UNSIGNED_BYTE,null);
gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.NEAREST);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.NEAREST);gl.bindTexture(gl.TEXTURE_2D,null);
const fb=gl.createFramebuffer();gl.bindFramebuffer(gl.FRAMEBUFFER,fb);gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,tx,0);
const ok=gl.checkFramebufferStatus(gl.FRAMEBUFFER)===gl.FRAMEBUFFER_COMPLETE;gl.bindFramebuffer(gl.FRAMEBUFFER,null);
P.fb=fb;P.tx=tx;P.fG=G;P.fw=W;P.fh=H;if(!ok)throw new Error('fb');
}
if(P.i>=P.n){
const st=P.fs?gl.getSyncParameter(P.fs,gl.SYNC_STATUS):gl.SIGNALED;P.w++;
if(st!==gl.SIGNALED&&P.w<8){if(!P.hold)queueMicrotask(()=>spk1Dirty(U,'g'));P.tStep=t;return;}
lt2sCopy(G,W,H);
P.run=false;P.lastKey=S.key;P.lastSig=S.sig;P.lastNl=S.nl;P.lastT=t;P.nPres++;lt2sFree();
if(typeof P.onPres==='function')P.onPres(U);
return;
}
if(!P.i){lt2sProg(G);P.w=0;}
const y0=Math.floor(H*P.i/P.n),y1=Math.floor(H*(P.i+1)/P.n);
P.inner=true;
try{gl.bindFramebuffer(gl.FRAMEBUFFER,P.fb);gl.enable(gl.SCISSOR_TEST);gl.scissor(0,y0,W,y1-y0);spk1GlDraw(U);}
finally{gl.disable(gl.SCISSOR_TEST);gl.bindFramebuffer(gl.FRAMEBUFFER,null);P.inner=false;}
P.i++;P.tStep=t;P.nStep++;
if(P.i>=P.n)P.fs=gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE,0);
gl.flush();if(!P.hold)queueMicrotask(()=>spk1Dirty(U,'g'));
}
function lt2sDraw(U){
const P=LT2S,G=U.gl;if(P.inner||!G)return false;
const t=performance.now();let S=null;
try{
S=lt2sSig(U,G);
if(P.run){
if(P.on&&S.sig===P.sig&&G===P.G&&t-P.tStep<400){lt2sStep(U,G,S,t);return true;}
lt2sStop();P.nAbort++;
}else if(P.on&&P.slow&&S.nl>0&&S.all&&S.key===P.lastKey&&S.sig!==P.lastSig&&(P.lastNl===0||t-P.lastT>=120)){
P.run=true;P.G=G;P.sig=S.sig;P.i=0;P.n=Math.min(6,Math.max(2,Math.ceil(P.cost/20)));P.nSeq++;
lt2sStep(U,G,S,t);return true;
}
}catch(e){P.err=String((e&&e.message)||e).slice(0,200);P.on=false;try{lt2sStop();}catch(e2){}P.inner=false;S=null;}
if(S){P.lastKey=S.key;P.lastSig=S.sig;P.lastNl=S.nl;if(S.nl>0)lt2sMeasure(t);}else{P.lastKey=P.lastSig='';P.lastNl=0;}
P.lastT=t;P.nFull++;
return false;
}
// LT2-END
