/* KSM2-BEGIN (bit-mask): Klangschule-Locks je Note - Tonh.-Hk.-Start (kx.pe, Halbtoene) und TAKT-Zeiten (kx.ta Amp-Hk., kx.tf Filter-Hk.; Sekunden A/D/R). Ohne Lock: kx leer, alter Weg. */
function ksm2X(T){return T>0?15*Math.log(T/.002)/Math.log(7500):0;}
function ksm2Kx(x){const pe=typeof x.pe==='number'&&x.pe===x.pe&&Math.abs(x.pe)<=48?x.pe:null,ta=Array.isArray(x.ta)&&x.ta.length===3?x.ta:null,tf=Array.isArray(x.tf)&&x.tf.length===3?x.tf:null;return pe===null&&!ta&&!tf?null:{pe,ta,tf};}
function ksm2E(v,P){
if(v.kE&&v.kEP===P)return v.kE;
const x=v.kx,f=(E,t)=>{if(!t)return E;const o=Object.assign({},E);if(t[0]>0)o.a=ksm2X(t[0]);if(t[1]>0)o.d=ksm2X(t[1]);if(t[2]>0)o.r=ksm2X(t[2]);return o;};
v.kE=[f(P.o1.e,x.ta),f(P.o2.e,x.ta),f(P.n.e,x.ta),f(P.f.e,x.tf)];v.kEP=P;return v.kE;
}
/* KSM2-END */
