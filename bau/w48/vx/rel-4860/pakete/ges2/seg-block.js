/* GES2-SEG-BEGIN – Gleiten (auch mit Vibrato) vor dem Zusammenfassen glätten: eine Kette kurzer Noten mitten in einem Gleiten
   und ein Abfallen/Hochziehen am Phrasen-Ende werden keine eigenen Noten; Grenze = Mitte des Gleitens, Tonhöhe aus dem gehaltenen Teil. */
function ges2Glide(notes,m,unk,F){
const ok=k=>m[k]===m[k]&&!unk[k];
const s3=k=>{const v=[];for(let r=k-1;r<=k+1;r++)if(ok(r))v.push(m[r]);return v.length?median(v):NaN;};
const ctr=n=>{const v=[];for(let k=n.a;k<n.b;k++)if(ok(k))v.push(m[k]);return median(v);};
const flat=n=>{const v=[];for(let k=n.a;k<n.b;k++){const x=s3(k);if(x===x)v.push([k,x]);}let b=0;
for(let i=0;i<v.length;i++){let lo=v[i][1],hi=lo;for(let j=i;j<v.length;j++){lo=Math.min(lo,v[j][1]);hi=Math.max(hi,v[j][1]);if(hi-lo>.25)break;b=Math.max(b,v[j][0]-v[i][0]+1);}}return b;};
const mov=(n,s)=>{let mv=0,t=0;for(let k=n.a+1;k<n.b;k++){const a=s3(k-1),b=s3(k);if(a===a&&b===b){t++;if((b-a)*s>0)mv++;}}return t?mv/t:0;};
const gl=(n,s)=>n.b-n.a<=F(220)&&flat(n)<.7*(n.b-n.a)&&mov(n,s)>=.55;
let st=0;
for(let i=1;i<notes.length;i++){
const p=notes[i-1];if(p.b!==notes[i].a||!p.pe)continue;
const pm=ctr(p);let j=i,lc=pm,sg=0;
for(;j<notes.length&&j-i<6;j++){const n=notes[j],c=ctr(n),d=c-lc,s=Math.sign(d);
if(!(Math.abs(d)>=.3)||(sg&&s!==sg)||!gl(n,s))break;sg=s;lc=c;
if(!n.pe||j+1>=notes.length||notes[j+1].a!==n.b){j++;break;}}
if(j===i)continue;
const e=notes[j-1],q=notes[j];
if(q&&q.a===e.b&&e.pe&&j-i>=2){
const qm=ctr(q);if(!((qm-lc)*sg>=.3&&Math.abs(qm-pm)>=1.5))continue;
const mid=(pm+qm)/2;let x=e.b;for(let k=notes[i].a;k<e.b;k++){const v=s3(k);if(v===v&&(v-mid)*sg>=0){x=k;break;}}
if(p.ca==null){p.ca=p.a;p.cb=p.b;}if(q.ca==null){q.ca=q.a;q.cb=q.b;}
p.b=x;q.a=x;notes.splice(i,j-i);st++;continue;
}
if((!q||q.a!==e.b)&&!e.pe&&e.b-notes[i].a<=F(300)&&Math.abs(lc-pm)>=1){
if(p.ca==null){p.ca=p.a;p.cb=p.b;}p.b=e.b;p.pe=false;notes.splice(i,j-i);st++;
}
}
return st;
}
/* GES2-SEG-END */
