/* SZN-BEGIN: Szenen-Name klein unter der Szenen-Nummer im Matrix-Kopf (ohne Namen bleibt der Kopf wie bisher) */
function sznName(s){const sc=S.scenes&&S.scenes[s],n=sc&&typeof sc.name==='string'?sc.name.trim():'';return n&&n!=='Szene '+(s+1)?n:'';}
function sznHead(b,s){
const n=sznName(s);
if(b._snT===n)return;
b._snT=n;
if(!b._sn){if(!n)return;b._sn=el('span','sn');b.insertBefore(b._sn,b._sk);}
b._sn.textContent=n;b.title=n?'Szene '+(s+1)+' · '+n:'';
}
/* SZN-END */
