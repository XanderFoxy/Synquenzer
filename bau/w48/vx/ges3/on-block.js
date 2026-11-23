/* GES3-BEGIN – Gesang→Noten: Einsatz lagefest auf die echte Onset-Probe statt im Analyse-Raster; Marken-Regel nur für neue Takes */
const GES3_AB=Date.UTC(2026,10,23,17,0,0);
function ges3Neu(id){const m=id!=null&&S.takes?S.takes[id]:null;return!!(m&&+m.created>=GES3_AB);}
function ges3Onset(notes,A){
const x=A&&A.x,fs=A&&A.fs;if(!x||!fs||!notes)return 0;
const ms=v=>Math.round(v*fs/1000),R=Math.max(1,ms(1)),n=x.length;let mv=0;
for(let q=0;q<notes.length;q++){
const nt=notes[q];if(nt.by!=='einsatz')continue;
const c=Math.round(nt.t0*fs),a=Math.max(R,c-ms(45)),b=Math.min(n-R-1,c+ms(40)),cm=Math.min(b,c+ms(8));
if(cm-a<ms(10))continue;
const L=b-a+1,cs=new Float64Array(L+2*R+1);for(let i=0;i<L+2*R;i++){const v=x[a-R+i]||0;cs[i+1]=cs[i]+v*v;}
const E=new Float64Array(L);for(let i=0;i<L;i++)E[i]=10*Math.log10((cs[i+2*R+1]-cs[i])/(2*R+1)+1e-14);
let jm=0;for(let i=1;i<=cm-a;i++)if(E[i]<E[jm])jm=i;
let jp=jm;for(let i=jm;i<L;i++)if(E[i]>E[jp])jp=i;
const rise=E[jp]-E[jm];if(rise<15)continue;
const th=Math.max(E[jm]+.5*rise,E[jp]-30);let ic=-1;for(let i=jm;i<=jp;i++)if(E[i]>=th){ic=i+a;break;}
if(ic<0)continue;
const amp=Math.sqrt(Math.pow(10,th/10));let s=ic;for(let i=Math.max(0,ic-R);i<=Math.min(n-1,ic+R);i++)if(Math.abs(x[i])>=amp){s=i;break;}
const t=s/fs,p=notes[q-1];
if(Math.abs(t-nt.t0)>.045||t>=nt.t1-.03||(p&&t<p.t1))continue;
nt.t0=t;mv++;
}
return mv;
}
/* GES3-END */
