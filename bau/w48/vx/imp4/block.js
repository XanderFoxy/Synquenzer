/* IMP4-BEGIN – Import-Bericht je Spur: beschreibt bei „Klänge aus der DAW übernehmen“ den übernommenen Klang (Synth, EQ, Echo) */
function imp4Va(c,x){
const C=c.imp4||(c.imp4=new Map());if(C.has(x.id))return C.get(x.id);
let v=null;try{v=mlToVa(x.patch,x.preset&&!/^init/i.test(x.preset)?x.preset:x.name);}catch(e){v=null;}
if(v&&!(v.rep&&Array.isArray(v.rep.ok)))v=null;
C.set(x.id,v);return v;
}
function imp4Rep(c,res,r){
const m=c&&c.mlg2;if(!m||!m.on||!m.by||!r||!res||!Array.isArray(res.src)||!Array.isArray(res.tracks))return r;
const xOf=i=>{const t=res.tracks[i],ids=res.src[i]||[];return t&&t.kind!=='drum'&&ids.length?m.by.get(ids[0])||null:null;};
const x=xOf(r.spur),v=x&&imp4Va(c,x);if(!v)return r;
let E=null;for(let i=0;i<res.tracks.length&&!E;i++){const y=xOf(i),w=y&&imp4Va(c,y);if(w&&w.echo)E=w.echo;}
let eq='';try{const q=mlg2Core().curve(x.fx);eq=q.amp?'Amp-Simulation (kein EQ)':q.used&&q.used.length?'EQ wie in der DAW':'';}catch(e){eq='';}
const e=v.echo,same=e&&E&&e.divL===E.divL&&e.divR===E.divR&&e.fb===E.fb;
const ech=!e?'':same?'Echo '+e.divL+' wie in der DAW':'eigenes Delay '+e.divL+' → Projekt-Echo '+(E?E.divL:'')+' (eins für alle Spuren)';
const st=['Klang aus der DAW'];if(eq)st.push(eq);if(ech)st.push(ech);
return Object.assign({},r,{status:st.join(' · '),ok:v.rep.ok.slice(),appr:v.rep.appr.filter(s=>!/^Ein Echo für alle Spuren/.test(s)),miss:v.rep.miss.slice()});
}
/* IMP4-END */
