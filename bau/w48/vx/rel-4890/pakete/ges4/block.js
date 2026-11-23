/* GES4-BEGIN – Gesang→Noten: Vibrato-Pegelwellen sind keine neuen Einsätze; kurze Tonhöhen-Lücke mitten im Gleiten wird überbrückt (nur mit o.ges4, d. h. nur Gesang→Noten) */
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
if(o.ges4){const G=F(45),D=F(20);
for(let i=1;i<nF;i++){if(voiced[i]||!voiced[i-1])continue;let j=i;while(j<nF&&!voiced[j])j++;
if(j<nF&&j-i<=G){let a0=i-1;while(a0>0&&voiced[a0-1])a0--;let b0=j;while(b0+1<nF&&voiced[b0+1])b0++;
const L=m[i-1],Rm=m[j],Lp=m[i-1-D],sl=L-Lp;let lo=Infinity;for(let q=i;q<j;q++)lo=Math.min(lo,e[q]);
if(i-a0>=F(40)&&b0-j>=F(40)&&!isNaN(L)&&!isNaN(Rm)&&!isNaN(Lp)&&Math.abs(sl)>=0.25&&Math.sign(sl)===Math.sign(Rm-L)&&Math.abs(Rm-L)<=3.5&&Math.abs(L+sl*(j-i+1)/D-Rm)<=1&&lo>=Math.min(e[i-1],e[j])-3)
for(let q=i;q<j;q++){m[q]=L+(Rm-L)*(q-i+1)/(j-i+1);voiced[q]=1;}}
i=j;}}
/* GES4-END */
