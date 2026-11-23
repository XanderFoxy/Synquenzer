// LT3-BEGIN – Spektral: das erste Bild mit Ebenen-Farben (z. B. gleich nach dem Zerlegen) wird wie bei LT2S stückweise vorgezeichnet und erst fertig
// gezeigt, wenn es noch kein gemessenes Farben-Bild gibt, das Gerät aber schon ohne Farben den Bildtakt verpasst (eines der letzten 4 Bilder ohne Farben
// > 20 ms Abstand; Farben kosten etwa das 3,5-Fache). Sonst wie bisher. Endbild gleich. LT3.on = false schaltet es ab.
const LT3={on:true,g:[],mq:0,k:3.5,lim:20,n:0};
function lt3Measure(t){const Q=LT3;if(Q.mq)return;Q.mq=1;requestAnimationFrame(()=>{Q.mq=0;Q.g.push(performance.now()-t);if(Q.g.length>4)Q.g.shift();});}
function lt3Slow(P){const Q=LT3;if(!Q.on||P.cost||!Q.g.length)return false;if(Math.max(...Q.g)>Q.lim){Q.n++;return true;}return false;}
function lt3Est(){return LT3.g.length?LT3.k*Math.max(...LT3.g):0;}
// LT3-END
