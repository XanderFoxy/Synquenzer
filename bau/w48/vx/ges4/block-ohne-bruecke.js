/* GES4-BEGIN – Gesang→Noten: Vibrato-Pegelwellen sind keine neuen Einsätze (nur mit o.ges4, d. h. nur Gesang→Noten) */
const g4Vib=(k,i,j,dip)=>{
if(!o.ges4||dip>=12)return false;
const W=F(150),a=Math.max(i,k-W),b=Math.min(j,k+W+1);if(b-a<F(200))return false;
const v=[];let nv=0;for(let q=a;q<b;q++){const y=m[q];if(isNaN(y)||unk[q])nv++;else v.push(y);}
if(nv>F(15)||v.length<F(150))return false;
const s=v.map((y,q)=>{const w=[v[Math.max(0,q-1)],y,v[Math.min(v.length-1,q+1)]].sort((p,r)=>p-r);return w[1];});
let lo=Infinity,hi=-Infinity;for(const y of s){if(y<lo)lo=y;if(y>hi)hi=y;}
if(hi-lo<0.2||hi-lo>2.5)return false;
let ex=0,dir=0,hv=s[0],lv=s[0];
for(const y of s){if(y>hv)hv=y;if(y<lv)lv=y;
if(dir!==-1&&hv-y>0.1){if(dir===1)ex++;dir=-1;lv=y;}
else if(dir!==1&&y-lv>0.1){if(dir===-1)ex++;dir=1;hv=y;}}
if(ex<2)return false;
const t=Math.floor(s.length/2);return Math.abs(median(s.slice(0,t))-median(s.slice(t)))<0.8;
};
/* GES4-END */
