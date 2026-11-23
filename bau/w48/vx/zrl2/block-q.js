/* ZRL2-BEGIN Vorbereitung: Quantisierung ohne log10 (Schwellen-Tabelle, nahe der Schwellen genau gerechnet) */
let zrl2QT=null;
function zrl2Qx(x){const v=x>0?Math.round((20*Math.log10(x)+90)*1.6):0;return v<1?(x>0?1:0):v>255?255:v;}
function zrl2QTab(){
const NC=0x3FC0,lo=new Uint8Array(NC),th=new Float64Array(NC),f=new Float32Array(1),u=new Uint32Array(f.buffer);
for(let c=0;c<NC;c++){
const b0=c<<17,b1=b0|0x1FFFF;u[0]=b0;const qa=zrl2Qx(f[0]);u[0]=b1;const qb=zrl2Qx(f[0]);lo[c]=qa;
if(qa===qb){th[c]=Infinity;continue;}
if(qb!==qa+1){th[c]=NaN;continue;}
let A=b0,B=b1;while(B-A>1){const m=A+((B-A)>>>1);u[0]=m;if(zrl2Qx(f[0])===qa)A=m;else B=m;}
u[0]=B;th[c]=f[0];
}
return{lo,th};
}
function zrl2Q(X,n,Q,o){
if(!(X instanceof Float32Array)||(X.byteOffset&3)){for(let i=0;i<n;i++)Q[o+i]=zrl2Qx(X[i]);return;}
const T=zrl2QT||(zrl2QT=zrl2QTab()),lo=T.lo,th=T.th,U=new Uint32Array(X.buffer,X.byteOffset,n);
for(let i=0;i<n;i++){
const c=U[i]>>>17;
if(c>=0x3FC0){Q[o+i]=zrl2Qx(X[i]);continue;}
const t=th[c];
if(t===Infinity){Q[o+i]=lo[c];continue;}
const x=X[i];
if(t!==t||Math.abs(x-t)<=t*2.5e-4)Q[o+i]=zrl2Qx(x);
else Q[o+i]=x>=t?lo[c]+1:lo[c];
}
}
/* ZRL2-END */
