const {synth,PA}=require('./faelle.cjs');const p=PA[1];const fs=16000;
const {x,on}=synth(p.ph,fs,7,0.1);console.log(on.map(o=>o.toFixed(4)).join(' '));
const R=16;for(const o of on.slice(0,2)){let s='';const c=Math.round(o*fs);for(let i=c-160;i<c+400;i+=16){let e=0;for(let q=i-R;q<=i+R;q++)e+=x[q]*x[q];s+=((i-c)/16).toFixed(0)+':'+(10*Math.log10(e/(2*R+1)+1e-14)).toFixed(0)+' ';}console.log(s);}
