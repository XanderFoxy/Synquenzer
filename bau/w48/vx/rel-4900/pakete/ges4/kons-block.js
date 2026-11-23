/* GES4-K-BEGIN – Gesang→Noten: Konsonant direkt vor dem Vokal – schmales tiefes Pegel-Tal = Vokalbeginn */
function ges4Kons(E,jm,jp,ms){
if(E[jp]-E[jm]<25)return-1;
const t=E[jm]+10;let l=jm,r=jm;while(l>0&&E[l-1]<=t)l--;while(r<jp&&E[r+1]<=t)r++;
if(l===0||r-l>ms(6))return-1;
const i0=jm-ms(15),i1=jm-ms(3);if(i0<0||i1-i0<ms(5))return-1;
const v=Array.from(E.subarray(i0,i1)).sort((p,q)=>p-q);
return v[v.length>>1]>=t?jm:-1;
}
/* GES4-K-END */
