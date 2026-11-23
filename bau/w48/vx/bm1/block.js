/* BM1-BEGIN: Filter je Note (LAGE1, CC74 je Note) auch fuer die Bit-Mask-Engine.
   Der Wert der Note (fc, -64..63) wird als Halbton-Versatz (fc / LAGE1_FC) mit der Note-an-Nachricht an den Bit-Mask-Kern
   geschickt; dort traegt jede Stimme einen eigenen Cutoff-Faktor (2^(Halbtoene/12), wie bei VA). Ohne Wert bleibt die
   Nachricht und der Klang bitgleich. Transport: ein Merker-Paar im lk-Feld von lkNoteX (BM1_WI, Halbtoene). */
const BM1_WI=-7744;
function bm1Is(snd){return!!snd&&snd.engine==='bm'&&!!snd.p&&!!snd.p.bm;}
function bm1LkAdd(nt,out){
const fc=clamp(Math.round(+nt.fc)||0,-64,63);if(!fc||out.length>=32)return false;
out.push(BM1_WI,fc/LAGE1_FC);return false;
}
function bm1On(o,lk){
if(!lk||!lk.length)return;
for(let j=0;j+1<lk.length;j+=2)if(lk[j]===BM1_WI){const s=+lk[j+1];if(isFinite(s)&&s)o.fc=s;}
}
/* BM1-END */
