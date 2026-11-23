# Teil 2: JavaScript der Werkstatt 2
R = []

# --- Konstanten, Zustand
R.append(("const SCHICHTEN=[{id:'original',name:'Original',c:'--c-orig'},{id:'gereinigt',name:'gereinigt',c:'--c-rein'},{id:'timing',name:'Timing',c:'--c-tim'},{id:'ton',name:'Tonhöhe',c:'--c-ton'},{id:'ende',name:'Ende v11',c:'--c-ende'},{id:'neu',name:'Neu',c:'--c-neu'},{id:'aend',name:'Änderungen',c:'--c-spaet'}];\nconst HOEREN={original:'original',gereinigt:'gereinigt',v10:'ende',neu:'ende'};",
          "const SCHICHTEN=[{id:'original',name:'Original',c:'--c-orig',h:'original'},{id:'gereinigt',name:'gereinigt',c:'--c-rein',h:'gereinigt'},{id:'timing',name:'Timing',c:'--c-tim',h:'timing'},{id:'ton',name:'Tonhöhe',c:'--c-ton'},{id:'ende',name:'v11',c:'--c-ende',h:'v10'},{id:'neu',name:'Neu',c:'--c-neu',h:'neu'},{id:'aend',name:'Änderungen',c:'--c-spaet'}];\nconst HOEREN={original:'original',gereinigt:'gereinigt',timing:'gereinigt',v10:'ende',neu:'ende'};\nconst SCHWERE={3:'deutlich',2:'mittel',1:'leicht'};"))
R.append(("wahl:null,tab:'Z',\n", "wahl:null,tab:'Z',staffel:0,dehnen:true,vorspiel:true,aendFilter:'alle',\n"))
R.append(("  Z.bereich=a.bereich&&a.bereich.bis>a.bereich.von?a.bereich:(a.bereich===null?null:Z.bereich)}}catch(e){speicherOk=false}",
          "  Z.bereich=a.bereich&&a.bereich.bis>a.bereich.von?a.bereich:(a.bereich===null?null:Z.bereich);\n  if(isFinite(a.staffel))Z.staffel=clamp(+a.staffel,0,1);if(typeof a.dehnen==='boolean')Z.dehnen=a.dehnen;if(typeof a.vorspiel==='boolean')Z.vorspiel=a.vorspiel;if(['alle','v11','v10','v7'].includes(a.aendFilter))Z.aendFilter=a.aendFilter}}catch(e){speicherOk=false}"))
R.append(("tab:Z.tab,musik:Z.musik,klick:Z.klick,bereich:Z.bereich}};",
          "tab:Z.tab,musik:Z.musik,klick:Z.klick,bereich:Z.bereich,staffel:Z.staffel,dehnen:Z.dehnen,vorspiel:Z.vorspiel,aendFilter:Z.aendFilter}};"))

# --- Plan: Dehnen (Time-Stretching) oder Schneiden
R.append(("function plan(d){\n  const P=[];let cur=null;const n=ORD.length;",
          "function plan(d){return Z.dehnen?planDehnen(d):planSchnitt(d)}\nfunction planSchnitt(d){\n  const P=[];let cur=null;const n=ORD.length;"))
R.append(("let PLAN=plan(ZG.d),PLAN_TEMP=null;",
r"""// Lauf 6 (Xander: „wenn ich das Time-Stretching benutze, dass es hörbar ist“): Dehnen wie mit Warp-Markern.
// Anker = Anlauf-Beginn jeder Silbe. Das Stück zwischen zwei Ankern wird auf die neue Länge gedehnt/gestaucht
// (gleiche Tonhöhe, WSOLA im Browser). Gleich verschobene Nachbarn bleiben starr. Stücke über 3 s: nur die letzten 1,5 s.
// Quellzeit eines Plan-Stücks: starr t-off, gedehnt s0+(t-d0)*k
const qz=(p,t)=>p.k&&p.k!==1?p.s0+(t-p.d0)*p.k:t-p.off;
function planDehnen(d){
  const n=ORD.length,A=k=>SIL[ORD[k]].a,O=k=>offOf(d,ORD[k]),P=[];
  const anc=[{s:0,o:0,i:-1}];for(let k=0;k<n;k++)anc.push({s:A(k),o:O(k),i:ORD[k]});anc.push({s:DAUER,o:n?O(n-1):0,i:-1});
  const add=(s0,s1,o0,o1,sil)=>{const d0=s0+o0,d1=s1+o1;if(d1-d0<5e-4||s1-s0<5e-4)return;
    if(Math.abs(o1-o0)<5e-4){const q=P[P.length-1];
      if(q&&q.k===1&&Math.abs(q.off-o0)<1e-6&&Math.abs(q.d1-d0)<1e-6){q.d1=d1;if(sil>=0)q.sil.push(sil);return}
      P.push({d0,d1,off:o0,k:1,s0,stem:'ende',sil:sil>=0?[sil]:[],ende:'natur'});return}
    if(s1-s0>3){add(s0,s1-1.5,o0,o0,sil);add(s1-1.5,s1,o0,o1,-1);return}
    const k=(s1-s0)/(d1-d0);if(!(k>0&&k<20))return;
    P.push({d0,d1,off:d0-s0,k,s0,stem:'ende',sil:sil>=0?[sil]:[],ende:'natur',dehn:true})};
  for(let j=0;j+1<anc.length;j++)add(anc[j].s,anc[j+1].s,anc[j].o,anc[j+1].o,anc[j].i);
  for(let j=0;j<P.length;j++){const p=P[j],q=P[j-1],r=P[j+1];
    const ci=q&&Math.abs(q.d1-p.d0)<1e-6&&Math.abs(qz(q,q.d1)-qz(p,p.d0))<2e-4,co=r&&Math.abs(p.d1-r.d0)<1e-6&&Math.abs(qz(p,p.d1)-qz(r,r.d0))<2e-4;
    p.fi=!ci;p.fo=!co;p.xi=!!ci&&(p.k!==1||q.k!==1);p.xo=!!co&&(p.k!==1||r.k!==1)}
  return P;
}
// Schicht „Timing“ hörbar: gereinigt über die Zeitkarte auf Ende-Zeit gelegt (gleiche Stücke wie die Timing-Welle)
let TPLAN=null;
function timingPlan(){if(TPLAN)return TPLAN;const P=[];
  for(const [a0,a1,r0,r1] of LIED.karte){if(a1-a0<.006&&P.length){P[P.length-1].d1=a1;continue}
    const du=a1-a0,dr=r1-r0,k=dr/du;let p;
    if(Math.abs(du-dr)<.003||!(k>.2&&k<5)){const off=(a0+a1)/2-(r0+r1)/2;p={d0:a0,d1:a1,off,k:1,s0:a0-off}}
    else p={d0:a0,d1:a1,off:a0-r0,k,s0:r0};
    p.stem='gereinigt';p.sil=[];p.ende='natur';P.push(p)}
  for(let j=0;j<P.length;j++){const p=P[j];p.fi=j===0;p.fo=j===P.length-1;p.xi=j>0;p.xo=j<P.length-1}
  return TPLAN=P}
let PLAN=plan(ZG.d),PLAN_TEMP=null;"""))

# --- Welle: Spur (Zwiebel-Staffelung) + Quellzeit gedehnter Stücke
R.append(("function welle(c,lage,stil,farbe,alpha,plan){\n  const y0=L.yW,h=L.wav,yc=y0+h/2,amp=(h/2-4)/127;",
          "function welle(c,lage,stil,farbe,alpha,plan,ln){\n  const y0=L.yW,h=L.wav,yc=ln?ln.yc:y0+h/2,amp=(ln?ln.half:h/2-4)/127;"))
R.append(("        if(mm(lage,a-p.off,b-p.off,MM)){ok=true;", "        if(mm(lage,qz(p,a),qz(p,b),MM)){ok=true;"))
R.append(("Z.sch.ton,Z.sch.aend,bearb,", "Z.sch.ton,Z.sch.aend,Z.staffel,bearb,"))
R.append(("""  zeichneRaster(c);
  if(Z.sch.original&&SCH.original)welle(c,'original','fuellen',FB['c-orig'],.30,null);
  if(Z.sch.gereinigt&&SCH.gereinigt)welle(c,'gereinigt','linie',FB['c-rein'],.95,null);
  if(Z.sch.timing&&SCH.timing)welle(c,'timing','linie2',FB['c-tim'],.95,null);
  if(SCH.ende&&(Z.sch.ende||(!bearb&&Z.sch.neu)))welle(c,'ende',bearb&&Z.sch.neu?'linie':'fuellen',bearb&&Z.sch.neu?FB['c-ende']:FB.welle,bearb&&Z.sch.neu?.9:.78,null);
  // Lauf 5 (Prüfung: Original nur zu 9–10 % sichtbar): Umriss des Originals über der Ende-Füllung
  if(Z.sch.original&&SCH.original)welle(c,'original','linie',FB['c-orig'],.85,null);""",
"""  zeichneRaster(c);
  // Lauf 6 (Zwiebel): jede Schicht in ihrer Spur; Staffelung 0 = genau übereinander, 1 = getrennt untereinander
  const LN=lanes(),fa=.16*Math.min(1,Z.staffel*3);
  if(Z.sch.original&&SCH.original)welle(c,'original','fuellen',FB['c-orig'],.30,null,LN.original);
  if(Z.sch.gereinigt&&SCH.gereinigt){if(fa)welle(c,'gereinigt','fuellen',FB['c-rein'],fa,null,LN.gereinigt);welle(c,'gereinigt','linie',FB['c-rein'],.95,null,LN.gereinigt)}
  if(Z.sch.timing&&SCH.timing){if(fa)welle(c,'timing','fuellen',FB['c-tim'],fa,null,LN.timing);welle(c,'timing','linie2',FB['c-tim'],.95,null,LN.timing)}
  if(SCH.ende&&(Z.sch.ende||(!bearb&&Z.sch.neu)))welle(c,'ende',bearb&&Z.sch.neu?'linie':'fuellen',bearb&&Z.sch.neu?FB['c-ende']:FB.welle,bearb&&Z.sch.neu?.9:.78,null,LN.ende);
  // Lauf 5 (Prüfung: Original nur zu 9–10 % sichtbar): Umriss des Originals über der Ende-Füllung
  if(Z.sch.original&&SCH.original)welle(c,'original','linie',FB['c-orig'],.85,null,LN.original);
  zeichneZwiebel(c,LN);"""))
R.append(("  const mal=k=>{if(orig)welle(k,'original','linie',FB['c-orig'],.85,null);if(Z.sch.ton)zeichneTon(k)};",
          "  const mal=k=>{if(orig)welle(k,'original','linie',FB['c-orig'],.85,null,lanes().original);if(Z.sch.ton)zeichneTon(k)};"))
R.append(("""  if(Z.sch.neu&&SCH.ende&&bearb){welle(c,'neu','fuellen',FB.welle,.9,P);
    const bew=P.filter(p=>p.off!==0);if(bew.length){c.save();c.beginPath();for(const p of bew){const a=xz(p.d0),b=xz(p.d1);if(b<0||a>W)continue;c.rect(a,L.yW,b-a,L.wav)}c.clip();welle(c,'neu','fuellen',FB.gold,.95,P);c.restore()}
    zeichneVorne(c,direkt,key)}
  c.fillStyle=FB.lin2;c.fillRect(0,L.yW+L.wav/2,W,1/DPR);""",
"""  const LN=lanes();
  if(Z.sch.neu&&SCH.ende&&bearb){welle(c,'neu','fuellen',FB.welle,.9,P,LN.ende);
    const bew=P.filter(p=>p.off!==0||(p.k&&p.k!==1));if(bew.length){c.save();c.beginPath();for(const p of bew){const a=xz(p.d0),b=xz(p.d1);if(b<0||a>W)continue;c.rect(a,L.yW,b-a,L.wav)}c.clip();welle(c,'neu','fuellen',FB.gold,.95,P,LN.ende);c.restore()}
    zeichneVorne(c,direkt,key)}
  c.fillStyle=FB.lin2;{const ks=Object.keys(LN);if(Z.staffel>.05&&ks.length>1){for(const k of ks)c.fillRect(0,LN[k].yc,W,1/DPR)}else c.fillRect(0,L.yW+L.wav/2,W,1/DPR)}"""))
# Raster: Taktstriche kräftiger als Schläge
R.append(("""    c.fillStyle=FB.lin2;c.globalAlpha=imTakt?1:.55;c.fillRect(x-.5,imTakt?12:L.rul-7,1,H-(imTakt?12:L.rul-7));c.globalAlpha=1}""",
          """    if(imTakt){c.fillStyle=FB.mut;c.globalAlpha=.62;c.fillRect(x-.75,12,1.5,H-12)}else{c.fillStyle=FB.lin2;c.globalAlpha=.85;c.fillRect(x-.5,L.rul-7,1,H-(L.rul-7))}c.globalAlpha=1}"""))
# Prüfstellen-Marken: nur am Rand
R.append(("""    // Prüfstellen
    for(const p of LIED.pruefstellen){const xa=xz(p.von_s),xb=xz(p.bis_s);if(xb<-10||xa>W+10)continue;c.fillStyle=FB['c-pruef'];c.globalAlpha=.25;c.fillRect(xa,L.yW,Math.max(2,xb-xa),L.wav);c.globalAlpha=1;
      c.font='700 13px -apple-system,system-ui,sans-serif';c.fillText('?',(xa+xb)/2-3,y0+h-8);markBox.push({x:(xa+xb)/2,art:'pruef',d:p})}
  }""",
"""  }
  // Lauf 6: Prüfstellen als dezente Marken am oberen und unteren Rand der Welle (nie über die Mitte), ? im Streifen unten
  if(PRUEF)for(const p of PRUEF.stellen){const xa=xz(p.zeit_s),xb=xz(p.bis_s);if(xb<-10||xa>W+10)continue;const w=Math.max(4,xb-xa);
    c.fillStyle=FB['c-pruef'];c.globalAlpha=p.schwere>=3?.95:p.schwere>=2?.8:.6;c.fillRect(xa,L.yW+1,w,2);c.fillRect(xa,L.yM-3,w,2);
    c.beginPath();c.moveTo(xa,L.yW+1);c.lineTo(xa+9,L.yW+1);c.lineTo(xa,L.yW+9);c.closePath();c.moveTo(xa,L.yM-1);c.lineTo(xa+9,L.yM-1);c.lineTo(xa,L.yM-9);c.closePath();c.fill();c.globalAlpha=1;   // Fähnchen: anders als die Zwiebel-Striche
    c.font='700 13px -apple-system,system-ui,sans-serif';c.textBaseline='middle';c.fillText('?',(xa+xb)/2-3,y0+h-8);markBox.push({x:(xa+xb)/2,art:'pruef',d:p})}"""))
R.append(("""    for(let q=j;q<P.length&&P[q].d0<tb;q++){const p=P[q],a=Math.max(ta,p.d0),b=Math.min(tb,p.d1);if(b<=a)continue;if(mm('neu',a-p.off,b-p.off,MM)){""",
          """    for(let q=j;q<P.length&&P[q].d0<tb;q++){const p=P[q],a=Math.max(ta,p.d0),b=Math.min(tb,p.d1);if(b<=a)continue;if(mm('neu',qz(p,a),qz(p,b),MM)){"""))

# --- Zwiebel-Spuren + Abweichungen (vor „Oberleiste“ einfügen)
R.append(("// Oberleiste: nur die Streifen löschen, die im letzten Bild bemalt wurden (spart Pixel beim Abspielen)",
r"""// ---------------- Zwiebel (Lauf 6): Spuren, Abweichung zur Schicht darüber
const ZW_ORD=['original','gereinigt','timing','ende'],ZW_FARBE={original:'c-orig',gereinigt:'c-rein',timing:'c-tim',ende:'welle'},ZW_NAME={original:'Original',gereinigt:'gereinigt',timing:'Timing',ende:'v11'};
function zwSichtbar(){return ZW_ORD.filter(k=>k==='ende'?(Z.sch.ende||Z.sch.neu)&&SCH.ende:Z.sch[k]&&SCH[k])}
function lanes(){const v=zwSichtbar(),n=v.length,s=Z.staffel,o={};if(!n)return o;const u=L.wav/n;
  v.forEach((k,i)=>{o[k]={yc:L.yW+L.wav/2+s*(i-(n-1)/2)*u,half:(L.wav/2-4)*(1-s)+(u/2-3)*s,i,n}});return o}
// Hülle je 10 ms in dB (aus den Spitzenwerten), ±20 ms Maximum
function envDb(k){const s=SCH[k];if(!s)return null;if(s.db)return s.db;const n=s.n,d=new Float32Array(n),m=new Float32Array(n);
  for(let i=0;i<n;i++){const a=Math.max(-s.w[2*i],s.w[2*i+1],1);d[i]=40*Math.log10(a/127)}
  for(let i=0;i<n;i++){let v=-200;for(let j=Math.max(0,i-2);j<=Math.min(n-1,i+2);j++)if(d[j]>v)v=d[j];m[i]=v}return s.db=m}
// Stärke der Abweichung 0..255: ab 5 dB Unterschied, voll ab 12 dB; Einzelrahmen (unter 30 ms) zählen nicht
const DIFF=new Map();
function diffI(a,b){const key=a+'|'+b;let r=DIFF.get(key);if(r)return r;const A=envDb(a),B=envDb(b);if(!A||!B)return null;const n=Math.min(A.length,B.length),raw=new Uint8Array(n);
  for(let i=0;i<n;i++){if(Math.max(A[i],B[i])<-36)continue;const d=Math.abs(A[i]-B[i]);if(d>5)raw[i]=Math.max(1,Math.min(255,Math.round((d-5)/7*255)))}
  r=new Uint8Array(n);for(let i=1;i<n-1;i++){const m=Math.min(raw[i-1],raw[i],raw[i+1]);if(m)for(let j=i-1;j<=i+1;j++)if(r[j]<m)r[j]=m}
  DIFF.set(key,r);return r}
function zeichneZwiebel(c,LN){const v=Object.keys(LN).sort((a,b)=>LN[a].i-LN[b].i);if(!v.length)return;
  const cols=Math.round(W*DPR),cw=W/cols,dtc=Z.dur/cols;
  for(let q=1;q<v.length;q++){const k=v[q],I=diffI(v[q-1],k);if(!I)continue;const ln=LN[k],rate=SCH[k].rate,amp=ln.half/127,farbe=FB[ZW_FARBE[k]],bk=[[],[],[]];
    for(let s=0;s<cols;s++){const ta=Z.t0+s*dtc,tb=ta+dtc;let i0=Math.floor(ta*rate),i1=Math.ceil(tb*rate);if(i1<=0||i0>=I.length)continue;i0=Math.max(0,i0);i1=Math.min(I.length,Math.max(i1,i0+1));
      let mx=0;for(let i=i0;i<i1;i++)if(I[i]>mx)mx=I[i];if(!mx||!mm(k,ta,tb,MM))continue;bk[mx>170?2:mx>85?1:0].push(s*cw,ln.yc-MM[1]*amp,Math.max(MM[1]-MM[0],1)*amp)}
    for(let st=0;st<3;st++){const a=bk[st];if(!a.length)continue;c.fillStyle=farbe;c.globalAlpha=[.35,.6,.85][st];c.beginPath();for(let j=0;j<a.length;j+=3)c.rect(a[j],a[j+1],cw,a[j+2]);c.fill();
      c.globalAlpha=[.5,.75,1][st];c.beginPath();for(let j=0;j<a.length;j+=3)c.rect(a[j],ln.yc-ln.half-3,cw,3);c.fill()}
    c.globalAlpha=1}
  if(Z.staffel>=.5&&v.length>1){c.font='600 10px -apple-system,system-ui,sans-serif';c.textBaseline='middle';
    for(const k of v){const ln=LN[k],t=ZW_NAME[k],w=breite(c,t)+6,y=ln.yc-ln.half+6;c.fillStyle=FB.bg;c.globalAlpha=.8;c.fillRect(2,y-6,w,12);c.globalAlpha=1;c.fillStyle=k==='ende'?FB.fg:FB[ZW_FARBE[k]];c.fillText(t,5,y)}}}
function laneBei(y){const LN=lanes();let best=null,bd=1e9;for(const k in LN){const l=LN[k],d=Math.abs(y-l.yc);if(d<bd){bd=d;best=k}}if(!best)return null;
  return best==='ende'?(Z.sch.neu&&Object.keys(ZG.d).length?'neu':'v10'):best}
// Oberleiste: nur die Streifen löschen, die im letzten Bild bemalt wurden (spart Pixel beim Abspielen)"""))

# --- Audio: Timing hörbar, gedehnte Stücke, Uhr
R.append(("function planFuer(h){if(h==='neu')return PLAN_TEMP||PLAN;return",
          "function planFuer(h){if(h==='neu')return PLAN_TEMP||PLAN;if(h==='timing')return timingPlan();return"))
R.append(("""  const p=P[j],src=sp.tl-p.off,q=stueckBereit(p.stem,src);
  if(!q)return 'warte';
  const sl=q.st,sEnd=sl.bis_s-.25+p.off;
  let e=Math.min(p.d1,grenze),grund=e===p.d1?'stueck':'grenze';
  if(sEnd<e){e=sEnd;grund='scheibe'}
  const dur=e-sp.tl;if(dur<=1e-5){sp.tl=e;return 'ok'}
  // Blenden: Anfang
  let fin=0;const l=sp.wrap?null:sp.letzt;
  if(!l)fin=(Math.abs(sp.tl-p.d0)<1e-6&&p.fi&&!sp.wrap)?FI:FL;
  else if(l.grund==='scheibe')fin=XO;
  else if(l.grund==='stueck')fin=p.fi?FI:0;
  else fin=FL;
  sp.wrap=false;
  // Ende
  let fout=0,ext=0;
  if(grund==='scheibe'){fout=XO;ext=XO}
  else if(grund==='grenze'){fout=lauf.bis!=null&&!lp?.02:FL}
  else if(p.fo){if(p.ende==='kurz'){fout=FO;ext=.008}else fout=FO}
  knoten(sp,q.e.buf,sp.ct,src-sl.von_s+q.e.vs,dur,fin,fout,ext);
  if(sp.art==='stimme'){sp.segs.push({ct0:sp.ct,tl0:sp.tl,dur});if(sp.segs.length>60)sp.segs.shift()}
  sp.ct+=dur;sp.tl=e;sp.letzt={grund};return 'ok';""",
"""  const p=P[j];let e=Math.min(p.d1,grenze),grund=e===p.d1?'stueck':'grenze',buf,boff;
  if(p.k&&p.k!==1){const r=dehnung(p);if(!r)return 'warte';buf=r.buf;boff=sp.tl-p.d0+r.vor}   // gedehntes Stück: fertig gerechnet
  else{const src=sp.tl-p.off,q=stueckBereit(p.stem,src);if(!q)return 'warte';const sl=q.st,sEnd=sl.bis_s-.25+p.off;if(sEnd<e){e=sEnd;grund='scheibe'}buf=q.e.buf;boff=src-sl.von_s+q.e.vs}
  const dur=e-sp.tl;if(dur<=1e-5){sp.tl=e;return 'ok'}
  // Blenden: Anfang
  let fin=0;const l=sp.wrap?null:sp.letzt;
  if(!l)fin=(Math.abs(sp.tl-p.d0)<1e-6&&p.fi&&!sp.wrap)?FI:FL;
  else if(l.grund==='scheibe'||l.x)fin=XO;
  else if(l.grund==='stueck')fin=p.fi?FI:p.xi?XO:0;
  else fin=FL;
  sp.wrap=false;
  // Ende
  let fout=0,ext=0,x=false;
  if(grund==='scheibe'){fout=XO;ext=XO}
  else if(grund==='grenze'){fout=lauf.bis!=null&&!lp?.02:FL}
  else if(p.fo){if(p.ende==='kurz'){fout=FO;ext=.008}else fout=FO}
  else if(p.xo){fout=XO;ext=XO;x=true}   // Übergang gedehnt <-> starr: 6-ms-Überblendung
  knoten(sp,buf,sp.ct,boff,dur,fin,fout,ext);
  if(sp.art==='stimme'){sp.segs.push({ct0:sp.ct,tl0:sp.tl,dur});if(sp.segs.length>60)sp.segs.shift()}
  sp.ct+=dur;sp.tl=e;sp.letzt={grund,x};return 'ok';"""))
R.append(("if(sp.art!=='klick'&&!sp.fertig){const P=sp.planFn(),j=stueckBei(P,sp.tl+6),p=j>=0?P[j]:null;if(p)stueckBereit(p.stem,clamp(sp.tl+6-p.off,0,DAUER-.1))}}",
          "if(sp.art!=='klick'&&!sp.fertig){const P=sp.planFn(),j=stueckBei(P,sp.tl+6),p=j>=0?P[j]:null;if(p)stueckBereit(p.stem,clamp(qz(p,sp.tl+6),0,DAUER-.1))}}"))
R.append(("function laufPos(lauf){if(!lauf||!AE.ctx)return null;const sp=lauf.spuren[0],now=AE.ctx.currentTime-(AE.ctx.outputLatency||0);",
r"""// Lauf 6: Uhr für den Cursor = Zeit, die gerade aus dem Lautsprecher kommt (Ausgabe-Zeitstempel des AudioContext),
// sonst currentTime minus Ausgabe- und Grund-Latenz. Gleiche Uhr wie das Audio, kein eigener Timer.
function hoerZeit(){const c=AE.ctx;if(!c)return 0;
  if(c.getOutputTimestamp){try{const ts=c.getOutputTimestamp();if(ts&&ts.contextTime>0&&ts.performanceTime>0){const t=ts.contextTime+(performance.now()-ts.performanceTime)/1000;if(t<=c.currentTime+.01&&t>c.currentTime-.6)return t}}catch(e){}}
  return c.currentTime-(c.outputLatency||0)-(c.baseLatency||0)}
// ---------------- Dehnen: WSOLA (Überlappen und Addieren mit Ähnlichkeits-Suche) – gleiche Tonhöhe, nur die Länge ändert sich
const HANN=new Map();
function hann(N){let w=HANN.get(N);if(!w){w=new Float32Array(N);for(let i=0;i<N;i++)w[i]=.5-.5*Math.cos(2*Math.PI*i/N);HANN.set(N,w)}return w}
function wsola(x,start,k,nOut,sr){
  let N=Math.round(.03*sr);N+=N&1;const H=N/2,tol=Math.round(.008*sr),win=hann(N),y=new Float32Array(nOut),X=x.length;let prev=null;
  const kor=(a,b)=>{let s=0;for(let j=0;j<H;j+=2)s+=x[a+j]*x[b+j];return s};
  for(let m=-1;m*H<nOut;m++){const to=m*H;let pos=Math.round(start+to*k);
    const tl=prev==null?0:Math.min(tol,Math.max(0,Math.floor((nOut-to-N)/2)));   // zum Ende hin genau auf der Karte landen
    if(tl>0){const nat=prev+H;if(nat>=0&&nat+H<X){let best=-Infinity,bd=0;
      for(let dl=-tl;dl<=tl;dl+=2){const a=pos+dl;if(a<0||a+H>=X)continue;const s=kor(a,nat);if(s>best){best=s;bd=dl}}
      for(const dl of [bd-1,bd+1]){const a=pos+dl;if(a<0||a+H>=X||Math.abs(dl)>tl)continue;const s=kor(a,nat);if(s>best){best=s;bd=dl}}pos+=bd}}
    for(let j=0;j<N;j++){const o=to+j;if(o<0)continue;if(o>=nOut)break;const si=pos+j;if(si>=0&&si<X)y[o]+=x[si]*win[j]}
    prev=pos}
  return y}
function dehnQuelle(p){const S=AE.stem[p.stem].stuecke,s1=p.s0+(p.d1-p.d0)*p.k,a=p.s0-.06*p.k-.03,b=s1+.06*p.k+.03;let best=-1;
  for(let i=0;i<S.length;i++)if(S[i].von_s<=Math.max(0,a)&&S[i].bis_s-.05>=Math.min(DAUER,b)){const e=AE.puf[p.stem][i];if(e&&e.status==='ok')return i;if(best<0)best=i}
  return best>=0?best:stueckIndex(p.stem,clamp((p.s0+s1)/2,0,DAUER-.1))}
const DEHN=new Map();
function dehnung(p){
  const key=p.stem+'|'+p.s0.toFixed(4)+'|'+p.k.toFixed(6)+'|'+p.d0.toFixed(4)+'|'+p.d1.toFixed(4);let r=DEHN.get(key);if(r)return r;
  const kk=dehnQuelle(p),e=AE.puf[p.stem][kk];if(!e||e.status!=='ok'){ladeStueck(p.stem,kk).catch(()=>{});return null}
  e.zuletzt=performance.now();const st=AE.stem[p.stem].stuecke[kk],x=e.buf.getChannelData(0),sr=e.buf.sampleRate,vor=.012,nach=.03;
  const nOut=Math.ceil((p.d1-p.d0+vor+nach)*sr),start=(p.s0-vor*p.k-st.von_s+e.vs)*sr,t0=performance.now();
  const y=wsola(x,start,p.k,nOut,sr),c=AE.ctx||ctx(),buf=c.createBuffer(1,nOut,sr);buf.getChannelData(0).set(y);
  r={buf,vor,ms:performance.now()-t0};DEHN.set(key,r);if(DEHN.size>60)DEHN.delete(DEHN.keys().next().value);
  (MESS.dehn||(MESS.dehn=[])).push(+r.ms.toFixed(1));if(MESS.dehn.length>200)MESS.dehn.shift();return r}
function laufPos(lauf){if(!lauf||!AE.ctx)return null;const sp=lauf.spuren[0],now=hoerZeit();"""))
R.append(("  if(p){const k=stueckIndex(p.stem,clamp(t-p.off,0,DAUER-.1));ps.push(ladeStueck(p.stem,k))}",
          "  if(p){const k=p.k&&p.k!==1?dehnQuelle(p):stueckIndex(p.stem,clamp(qz(p,t),0,DAUER-.1));ps.push(ladeStueck(p.stem,k))}"))
R.append(("async function spielen(){\n  if(Z.spielt){pause();return}\n",
          "async function spielen(){\n  if(Z.spielt){pause();return}\n  masterPause();\n"))
R.append(("async function vorhoeren(von,bis,dT){", "async function vorhoeren(von,bis,dT,opt){"))
R.append(("  if(Z.spielt)pause();\n  laufStop(VOR,.010);VOR=null;\n  const fehlt=()=>{for(const t of [von,(von+bis)/2,bis-.01]){const j=stueckBei(P,t),p=j>=0?P[j]:null;if(p&&!stueckBereit(p.stem,clamp(t-p.off,0,DAUER-.1)))return true}return false};",
          "  if(Z.spielt)pause();\n  masterPause();\n  laufStop(VOR,.010);VOR=null;\n  const fehlt=()=>{for(const t of [von,(von+bis)/2,bis-.01]){const j=stueckBei(P,t),p=j>=0?P[j]:null;if(p&&!(p.k&&p.k!==1?dehnung(p):stueckBereit(p.stem,clamp(qz(p,t),0,DAUER-.1))))return true}return false};\n  // Lauf 6: Züge hört man immer mit der Musik (Taktgefühl); beim ersten Mal kurz auf das Musikstück warten\n  const mitMusik=Z.musik||!!(opt&&opt.musik);\n  if(mitMusik&&!stueckBereit('mix',von)){try{await ladeStueck('mix',stueckIndex('mix',clamp(von,0,DAUER-.1)))}catch(e){}if(nr!==VORNR)return}"))
R.append(("  VOR=laufStart({von,bis,hoeren:hoe,plan:P,musik:Z.musik&&!!stueckBereit('mix',von),klick:Z.klick,vorlauf:.02});",
          "  VOR=laufStart({von,bis,hoeren:hoe,plan:P,musik:mitMusik&&!!stueckBereit('mix',von),klick:Z.klick,vorlauf:.02});"))

# --- Züge: Vorhören mit Musik, A/B vorher, Vorspielen abschaltbar
R.append(("function aendern(fn,meldung){", "let LETZT=null;   // letzter Zug: Zustand vorher/nachher für A/B\nfunction aendern(fn,meldung){"))
R.append(("""  aendern(()=>{ZG.d=d;ZG.q=q},n?n+(n===1?' Silbe':' Silben')+' auf '+Z.raster+' eingerastet.':'Liegt schon auf dem Raster.');
  const a=SIL[ziel[0]].a+offOf(ZG.d,ziel[0]),e=bNeu(ziel[ziel.length-1]);vorhoeren(a-.35,Math.max(e+.9,a+1.2),ZG.d);""",
"""  const vorD=JSON.parse(JSON.stringify(ZG.d));
  aendern(()=>{ZG.d=d;ZG.q=q},n?n+(n===1?' Silbe':' Silben')+' auf '+Z.raster+' eingerastet.':'Liegt schon auf dem Raster.');
  const a=SIL[ziel[0]].a+offOf(ZG.d,ziel[0]),e=bNeu(ziel[ziel.length-1]);
  if(n){LETZT={vor:vorD,nach:JSON.parse(JSON.stringify(ZG.d)),von:a-.8,bis:Math.max(e+1.1,a+1.6),zeig:'nach'};infoVorher()}
  if(Z.vorspiel)vorhoeren(a-.6,Math.max(e+.9,a+1.2),ZG.d,{musik:true});"""))
R.append(("  Z.wahl=i;infoZeigen();PLAN_TEMP=plan(d0);basisNeu();\n}",
          "  Z.wahl=i;infoZeigen();PLAN_TEMP=plan(d0);basisNeu();stueckBereit('mix',clamp(SIL[i].a,0,DAUER-.1));\n}"))
R.append(("const s=SIL[G.i];vorhoeren(s.a+offOf(t,G.i)-.12,ziel+.45,t)}",
          "const s=SIL[G.i];vorhoeren(s.a+offOf(t,G.i)-.35,ziel+.5,t,{musik:true})}"))
R.append(("""  aendern(()=>{ZG.d=t;for(const j of g.gr)ZG.q[j]=g.snap?rs:'frei'},silbeName(i)+' → '+rasterName(g.ziel)+' ('+msT(g.delta*1000)+')');
  const s=SIL[i];vorhoeren(s.a+offOf(ZG.d,i)-.6,g.ziel+1.0,ZG.d);""",
"""  aendern(()=>{ZG.d=t;for(const j of g.gr)ZG.q[j]=g.snap?rs:'frei'},silbeName(i)+' → '+rasterName(g.ziel)+' ('+msT(g.delta*1000)+')');
  const s=SIL[i];LETZT={vor:g.d0,nach:JSON.parse(JSON.stringify(ZG.d)),von:s.a+offOf(ZG.d,i)-1.0,bis:g.ziel+1.2,zeig:'nach'};infoVorher();
  if(Z.vorspiel)vorhoeren(s.a+offOf(ZG.d,i)-.8,g.ziel+1.0,ZG.d,{musik:true});"""))
# Antippen in getrennten Spuren = diese Schicht hören
R.append(("""  if(h&&h.art==='rand')return;
  if(Z.wahl!=null){Z.wahl=null;infoZeigen();basisNeu()}
  springe(tz(g.x0));""",
"""  if(h&&h.art==='rand')return;
  if(Z.wahl!=null){Z.wahl=null;infoZeigen();basisNeu()}
  if(Z.staffel>=.5&&g.y0>=L.yW&&g.y0<L.yM){const sh=laneBei(g.y0),t=tz(g.x0);if(sh){if(sh!==Z.hoeren)hoerenSetzen(sh);springe(t);if(!Z.spielt)vorhoeren(t-.15,t+2.2);return}}
  springe(tz(g.x0));"""))
R.append(("""  else if(m.art==='pruef')t='<b>? Prüfstelle '+esc(sek(d.von_s))+'–'+esc(sek(d.bis_s))+'</b> · Ende ist hier '+Math.abs(d.db)+' dB '+(d.art==='Loch'?'leiser':'lauter')+' als die verschobene Aufnahme <small>(Vermutung: hier hat eine Korrektur etwas verändert – bitte anhören)</small>';""",
          """  else if(m.art==='pruef')t='<b>? '+esc(d.titel)+'</b> · '+esc(mmss(d.zeit_s))+' · '+esc(SCHWERE[d.schwere]||'')+'<br><small>'+esc(d.was)+'</small>';"""))
R.append(("""$('infoText').innerHTML=t;$('bSilbeHoer').hidden=false;$('bSilbeWeg').hidden=true;INFO_HOER=[(d.t!=null?d.t:d.von_s)-.6,(d.t!=null?d.t:d.bis_s)+.8];""",
          """$('infoText').innerHTML=t;$('bSilbeHoer').hidden=false;$('bSilbeWeg').hidden=true;const a0=d.t!=null?d.t:d.von_s!=null?d.von_s:d.zeit_s,b0=d.t!=null?d.t:d.bis_s;INFO_HOER=[a0-.6,b0+.8];"""))
R.append(("""  const i=Z.wahl;if(i==null){$('infoText').innerHTML='Silbe antippen zum Hören, ziehen zum Verschieben.';$('bSilbeHoer').hidden=true;$('bSilbeWeg').hidden=true;INFO_HOER=null;return}""",
          """  infoVorher();
  const i=Z.wahl;if(i==null){$('infoText').innerHTML='Silbe antippen zum Hören, ziehen zum Verschieben.';$('bSilbeHoer').hidden=true;$('bSilbeWeg').hidden=true;INFO_HOER=null;return}"""))
R.append(("$('bSilbeHoer').onclick=()=>{if(INFO_HOER)vorhoeren(INFO_HOER[0],INFO_HOER[1])};",
r"""$('bSilbeHoer').onclick=()=>{if(INFO_HOER)vorhoeren(INFO_HOER[0],INFO_HOER[1])};
// A/B vorher/nachher für den letzten Zug (mit Musik)
function infoVorher(){const b=$('bVorher');b.hidden=!LETZT;if(LETZT)b.textContent=LETZT.zeig==='vor'?'A/B nachher':'A/B vorher'}
$('bVorher').onclick=()=>{if(!LETZT)return;LETZT.zeig=LETZT.zeig==='vor'?'nach':'vor';const vor=LETZT.zeig==='vor';
  vorhoeren(LETZT.von,LETZT.bis,vor?LETZT.vor:LETZT.nach,{musik:true});infoVorher();status(vor?'Vorher: ohne den letzten Zug.':'Nachher: mit dem letzten Zug.')};"""))

# --- Bedienung: Legende (zeigen/hören), Zwiebel-Regler, Dehnen, Vorspielen
R.append(("""  $('schichtLeiste').innerHTML=SCHICHTEN.map(s=>'<button class="schicht" data-s="'+s.id+'" style="--c:var('+s.c+')" aria-pressed="'+!!Z.sch[s.id]+'"><i></i>'+esc(s.name)+'</button>').join('');
  $('bMusik').setAttribute('aria-pressed',Z.musik);$('bKlick').setAttribute('aria-pressed',Z.klick);$('bSchleife').setAttribute('aria-pressed',Z.schleife);""",
"""  $('schichtLeiste').innerHTML=SCHICHTEN.map(s=>s.h?'<span class="zw'+(Z.sch[s.id]?' an':'')+'" style="--c:var('+s.c+')"><button class="zAug" data-s="'+s.id+'" aria-pressed="'+!!Z.sch[s.id]+'" aria-label="'+esc(s.name)+' zeigen"><i></i></button><button class="zHoer" data-h="'+s.h+'" aria-pressed="'+(Z.hoeren===s.h)+'" aria-label="'+esc(s.name)+' hören"><svg viewBox="0 0 24 24"><path d="M7 4.5v15l12.5-7.5z"/></svg>'+esc(s.name)+'</button></span>'
    :'<button class="schicht" data-s="'+s.id+'" style="--c:var('+s.c+')" aria-pressed="'+!!Z.sch[s.id]+'"><i></i>'+esc(s.name)+'</button>').join('');
  $('bMusik').setAttribute('aria-pressed',Z.musik);$('bKlick').setAttribute('aria-pressed',Z.klick);$('bSchleife').setAttribute('aria-pressed',Z.schleife);
  $('bDehnen').setAttribute('aria-pressed',Z.dehnen);$('bVorspiel').setAttribute('aria-pressed',Z.vorspiel);"""))
R.append(("""function hoerenSetzen(h){if(h===Z.hoeren)return;Z.ab=Z.hoeren;Z.hoeren=h;segZeigen();sichernSpaeter();vorladen();if(Z.spielt)stimmeNeu();status('Hören: '+({original:'Original (Aufnahme)',gereinigt:'gereinigt',v10:'v11',neu:'Neu (v11 + deine Züge)'})[h]+'.')}""",
          """function hoerenSetzen(h){if(h===Z.hoeren)return;Z.ab=Z.hoeren;Z.hoeren=h;segZeigen();sichernSpaeter();vorladen();if(Z.spielt)stimmeNeu();status('Hören: '+({original:'Original (Aufnahme)',gereinigt:'gereinigt',timing:'Timing (gereinigt, verschoben wie v11)',v10:'v11',neu:'Neu (v11 + deine Züge)'})[h]+'.')}
// Legende: Namen antippen = genau diese Schicht hören (an der Silbe oder am Cursor)
function schichtHoeren(h){const sk={original:'original',gereinigt:'gereinigt',timing:'timing',v10:'ende',neu:'neu'}[h];if(sk&&!Z.sch[sk]){Z.sch[sk]=true;basisNeu();sichernSpaeter()}
  if(h!==Z.hoeren)hoerenSetzen(h);else segZeigen();
  if(!Z.spielt){const a=Z.wahl!=null?SIL[Z.wahl].a+offOf(ZG.d,Z.wahl)-.3:Z.pos;vorhoeren(a,a+2.5)}}
function staffelSetzen(v,still){Z.staffel=clamp(+v||0,0,1);const r=$('staffel');if(+r.value!==Z.staffel)r.value=Z.staffel;$('staffelWert').textContent=Z.staffel<.05?'übereinander':Z.staffel>.95?'getrennt':'gestaffelt';
  const quer=matchMedia('(orientation:landscape) and (max-height:560px)').matches;buehne.style.setProperty('--zusatz',quer?'0px':Math.round(Z.staffel*Math.min(200,innerHeight*.22))+'px');basisNeu();if(!still)sichernSpaeter()}
$('staffel').addEventListener('input',e=>staffelSetzen(e.target.value));
$('bDehnen').onclick=()=>{Z.dehnen=!Z.dehnen;segZeigen();PLAN=plan(ZG.d);basisNeu();sichernSpaeter();sendeZustand();if(Z.spielt&&Z.hoeren==='neu')stimmeNeu();
  status(Z.dehnen?'Dehnen an: das Stück davor und danach wird gedehnt, gleiche Tonhöhe.':'Dehnen aus: Lücke bleibt still, die Silbe davor wird gekürzt.')};
$('bVorspiel').onclick=()=>{Z.vorspiel=!Z.vorspiel;segZeigen();sichernSpaeter();status(Z.vorspiel?'Nach dem Loslassen wird die Stelle vorgespielt.':'Nach dem Loslassen bleibt es still – „A/B vorher“ oder ▶ zum Hören.')};"""))
R.append(("""$('schichtLeiste').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;const k=b.dataset.s;Z.sch[k]=!Z.sch[k];b.setAttribute('aria-pressed',Z.sch[k]);if(k==='original'||k==='gereinigt')vorladen();basisNeu();sichernSpaeter()});""",
          """$('schichtLeiste').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;if(b.dataset.h){schichtHoeren(b.dataset.h);return}
  const k=b.dataset.s;Z.sch[k]=!Z.sch[k];b.setAttribute('aria-pressed',Z.sch[k]);const z=b.closest('.zw');if(z)z.classList.toggle('an',Z.sch[k]);if(k==='original'||k==='gereinigt')vorladen();basisNeu();sichernSpaeter()});"""))

# --- Listen: Züge (Dehnung), Was geändert wurde (Filter, v11, Master-Vergleich), Prüfstellen
R.append(("""      vorsilbe_gekuerzt_ms:Math.max(0,Math.round((op-o)*1000)),luecke_davor_ms:Math.max(0,Math.round((o-op)*1000)),luecke_danach_ms:nx!=null?Math.max(0,Math.round((on-o)*1000)):0})}
  return out}""",
"""      vorsilbe_gekuerzt_ms:Math.max(0,Math.round((op-o)*1000)),luecke_davor_ms:Math.max(0,Math.round((o-op)*1000)),luecke_danach_ms:nx!=null?Math.max(0,Math.round((on-o)*1000)):0,
      ...(Z.dehnen?dehnProzent(kk,op,o,on):{})})}
  return out}
// gedehnt/gestaucht in Prozent: Stück vor der Silbe (vom vorigen Silbenanfang bis hier) und Stück ab der Silbe (bis zur nächsten)
function dehnProzent(kk,op,o,on){const A=k=>k<0?0:k>=ORD.length?DAUER:SIL[ORD[k]].a,pz=(len,dl)=>{const L2=len>3?1.5:len;return Math.round(((L2+dl)/L2-1)*100)};
  return {dehnung_davor_pct:pz(A(kk)-A(kk-1),o-op),dehnung_ab_silbe_pct:pz(A(kk+1)-A(kk),(kk+1<ORD.length?on:o)-o)}}"""))
R.append(("""function zugText(z){return z.teil+', „'+z.zeile+'“: '+'„'+z.text+'“'+(z.wort!==z.text?' ('+z.wort+')':'')+' '+msT(z.versatz_ms)+' → '+z.takt_neu+(z.raster!=='frei'?' ('+z.raster+')':' (frei)')+
  (z.vorsilbe_gekuerzt_ms?' · Vorsilbe '+z.vorsilbe_gekuerzt_ms+' ms gekürzt':'')+(z.luecke_davor_ms?' · Lücke davor '+z.luecke_davor_ms+' ms':'')}""",
"""function zugText(z){const pc=v=>(v>0?'gedehnt +':'gestaucht −')+Math.abs(v)+' %';return z.teil+', „'+z.zeile+'“: '+'„'+z.text+'“'+(z.wort!==z.text?' ('+z.wort+')':'')+' '+msT(z.versatz_ms)+' → '+z.takt_neu+(z.raster!=='frei'?' ('+z.raster+')':' (frei)')+
  (z.dehnung_davor_pct!=null?(z.dehnung_davor_pct?' · davor '+pc(z.dehnung_davor_pct):'')+(z.dehnung_ab_silbe_pct?' · ab hier '+pc(z.dehnung_ab_silbe_pct):'')
   :(z.vorsilbe_gekuerzt_ms?' · Vorsilbe '+z.vorsilbe_gekuerzt_ms+' ms gekürzt':'')+(z.luecke_davor_ms?' · Lücke davor '+z.luecke_davor_ms+' ms':''))}"""))
R.append(("let AEND=null;", "let AEND=null,PRUEF=null,PRUEF_AKT=null;"))
R.append(("$('listeA').addEventListener('click',e=>{const b=e.target.closest('button');if(!b||b.dataset.hin==null)return;",
          "$('listeA').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;\n  if(b.dataset.f){Z.aendFilter=b.dataset.f;listen();sichernSpaeter();return}\n  if(b.dataset.master!=null){MW.wahl='v11';masterKnopf();masterSpielen(Math.max(0,+b.dataset.master-.5));return}\n  if(b.dataset.hin==null)return;"))
R.append(("function zeigeTab(t){Z.tab=t;for(const [k,id] of [['Z','tabZ'],['A','tabA'],['H','tabH']]){",
          "function zeigeTab(t){if(!['Z','A','P','H'].includes(t))t='Z';Z.tab=t;for(const [k,id] of [['Z','tabZ'],['A','tabA'],['P','tabP'],['H','tabH']]){"))
R.append(("$('tabZ').onclick=()=>zeigeTab('Z');$('tabA').onclick=()=>zeigeTab('A');$('tabH').onclick=()=>zeigeTab('H');",
r"""$('tabZ').onclick=()=>zeigeTab('Z');$('tabA').onclick=()=>zeigeTab('A');$('tabP').onclick=()=>zeigeTab('P');$('tabH').onclick=()=>zeigeTab('H');
// Prüfstellen: Hin = Stelle in v11 im Kreis spielen (A/B gegen Original), Als Notiz = in die Notiz an Claude
function pruefHin(p,orig){PRUEF_AKT=p.id;const von=Math.max(0,p.zeit_s-.6),bis=Math.min(DAUER,Math.max(p.bis_s+.6,von+1.6)),span=bis-von;
  Z.bereich={von,bis};Z.schleife=true;bereichsleiste(true);Z.dur=clamp(Math.max(3,span*1.6),DMIN,DMAX);Z.t0=von-(Z.dur-span)/2;clampView();
  if(p.silbe!=null)Z.wahl=p.silbe;infoZeigen();
  Z.hoeren=orig?'original':'v10';Z.ab=orig?'v10':'original';segZeigen();
  if(Z.spielt){laufStop(HAUPT,.01);HAUPT=null;Z.spielt=false;spielKnopf()}
  Z.pos=von;folgen=true;basisNeu();vorladen();sichernSpaeter();spielen();
  status('Prüfstelle '+mmss(p.zeit_s)+': '+(orig?'deine Aufnahme':'v11')+' im Kreis – „A/B“ wechselt.');buehne.scrollIntoView({behavior:'smooth',block:'center'})}
function pruefNotiz(p){NOTIZ=(NOTIZ.trim()?NOTIZ.replace(/\s+$/,'')+'\n':'')+'Prüfstelle '+mmss(p.zeit_s)+' ('+p.titel+'): ';sichern();zeigeTab('Z');listen();sendeZustand();
  const n=$('notiz');if(n){n.focus();try{n.setSelectionRange(n.value.length,n.value.length)}catch(e){}n.scrollIntoView({block:'center'})}status('In deine Notiz geschrieben – ergänze, was du hörst, dann Senden.')}
$('listeP').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;const r=b.closest('.zeile');const p=r&&PRUEF&&PRUEF.stellen.find(x=>x.id===r.dataset.p);if(!p)return;
  if(b.dataset.tu==='hin')pruefHin(p,false);
  else if(b.dataset.tu==='ab'){if(Z.spielt&&PRUEF_AKT===p.id)hoerenSetzen(Z.hoeren==='original'?'v10':'original');else pruefHin(p,true)}
  else if(b.dataset.tu==='notiz')pruefNotiz(p)});"""))
R.append(("""    regeln:{luecke:'still (Vorschau); beim Neurechnen wie v10 füllen',ueberlappung:'Vorsilbe mit 10-ms-Blende gekürzt',raster_ziel:'Rasterlinie nächst dem Wortbeginn; Melodie-Note, wenn sie auf dem Raster liegt'},""",
          """    vorschau:Z.dehnen?'gedehnt (Time-Stretching, gleiche Tonhöhe)':'geschnitten (Lücke still, Vorsilbe gekürzt)',
    regeln:{luecke:Z.dehnen?'kein Loch: Stück davor gedehnt':'still (Vorschau); beim Neurechnen wie v10 füllen',ueberlappung:Z.dehnen?'Stück davor gestaucht':'Vorsilbe mit 10-ms-Blende gekürzt',dehnen:'Stück zwischen zwei Silbenanfängen auf die neue Länge gedehnt/gestaucht (WSOLA, gleiche Tonhöhe); Stücke über 3 s nur in den letzten 1,5 s',raster_ziel:'Rasterlinie nächst dem Wortbeginn; Melodie-Note, wenn sie auf dem Raster liegt'},"""))

# --- Master-Zeile + Start
R.append(("// ---------------- Start\naddEventListener('pagehide',sichern);",
r"""// ---------------- Master v10/v11 (ganze Fassung über <audio>; Umschalten geht an derselben Stelle weiter)
const MA={v10:$('aV10'),v11:$('aV11')},MW={wahl:'v11',spielt:false};
function mZeit(t){t=Math.max(0,t||0);const m=Math.floor(t/60),s=Math.floor(t-m*60);return m+':'+(s<10?'0':'')+s}
function masterKnopf(){$('iMaster').setAttribute('d',MW.spielt?'M7 5h3.5v14H7zM13.5 5H17v14h-3.5z':'M7 4.5v15l12.5-7.5z');$('bMaster').setAttribute('aria-label',MW.spielt?'Master anhalten':'Master '+MW.wahl+' abspielen');
  for(const b of $('segMaster').children)b.setAttribute('aria-pressed',b.dataset.m===MW.wahl)}
function setzeZeit(a,t){try{if(a.readyState>=1)a.currentTime=t;else{a.preload='auto';a.addEventListener('loadedmetadata',()=>{try{a.currentTime=t}catch(e){}},{once:true});a.currentTime=t}}catch(e){}}
function masterSpielen(t){if(Z.spielt)pause();laufStop(VOR);VOR=null;const a=MA[MW.wahl];for(const k in MA)if(MA[k]!==a)MA[k].pause();
  if(t!=null)setzeZeit(a,t);MW.spielt=true;masterKnopf();const pr=a.play();if(pr&&pr.catch)pr.catch(()=>{MW.spielt=false;masterKnopf();status('Master lädt nicht – Netz prüfen.','fehler')});
  status('Master '+MW.wahl+' ab '+mZeit(t!=null?t:a.currentTime)+' – v10/v11 umschalten geht an derselben Stelle weiter.')}
function masterPause(){for(const k in MA){try{MA[k].pause()}catch(e){}}if(MW.spielt){MW.spielt=false;masterKnopf()}}
$('bMaster').onclick=()=>{if(MW.spielt){masterPause();return}const a=MA[MW.wahl];masterSpielen(a.currentTime>0&&!a.ended?null:Z.pos)};
$('segMaster').addEventListener('click',e=>{const b=e.target.closest('button');if(!b||b.dataset.m===MW.wahl)return;const alt=MA[MW.wahl],t=alt.currentTime||0,lief=MW.spielt;MW.wahl=b.dataset.m;masterKnopf();
  if(lief){alt.pause();masterSpielen(t)}else setzeZeit(MA[MW.wahl],t)});
for(const k in MA){const a=MA[k];a.addEventListener('timeupdate',()=>{if(k===MW.wahl)$('masterZeit').textContent=mZeit(a.currentTime)});a.addEventListener('ended',()=>{if(k===MW.wahl){MW.spielt=false;masterKnopf()}})}
// quer: Master-Zeile in die rechte Spalte (oben), hochkant: unter die Überschrift
function fassungPlatz(){const f=$('fassung'),quer=matchMedia('(orientation:landscape) and (max-height:560px)').matches;
  if(quer){if(f.parentNode!==$('steuer'))$('steuer').prepend(f)}else if(f.previousElementSibling!==$('kopf'))$('kopf').after(f)}
// ---------------- Start
addEventListener('pagehide',sichern);"""))
R.append(("chipsZeigen();segZeigen();spielKnopf();bereichsleiste(false);undoKnoepfe();farben();groesse();listen();sendeZustand();zeigeTab(Z.tab);infoZeigen();\nnew ResizeObserver(()=>groesse()).observe(buehne);addEventListener('resize',()=>groesse());",
          "fassungPlatz();chipsZeigen();segZeigen();spielKnopf();masterKnopf();bereichsleiste(false);undoKnoepfe();farben();staffelSetzen(Z.staffel,true);groesse();listen();sendeZustand();zeigeTab(Z.tab);infoZeigen();\nnew ResizeObserver(()=>groesse()).observe(buehne);addEventListener('resize',()=>{fassungPlatz();staffelSetzen(Z.staffel,true);groesse()});"))
R.append(("fetch('daten/aenderungen.json?cabbccfe').then(r=>r.ok?r.json():[]).then(a=>{AEND=Array.isArray(a)?a:[];listen()}).catch(()=>{AEND=[];listen()});",
          "fetch('daten/aenderungen.json?@AEND@').then(r=>r.ok?r.json():[]).then(a=>{AEND=Array.isArray(a)?a:[];listen()}).catch(()=>{AEND=[];listen()});\nfetch('daten/pruefstellen.json?@PRUEF@').then(r=>r.ok?r.json():null).then(j=>{PRUEF=j&&Array.isArray(j.stellen)?j:{stellen:[]};THEMAVER++;listen();basisNeu()}).catch(()=>{PRUEF={stellen:[]};listen()});"))
# Test-Haken
R.append(("  for(const t of [von,(von+bis)/2,bis-.02]){const j=stueckBei(P,t),p=j>=0?P[j]:P[Math.min(P.length-1,-1-j)];await ladeStueck(p.stem,stueckIndex(p.stem,clamp(t-p.off,0,DAUER-.1)))}",
          "  for(const t of [von,(von+bis)/2,bis-.02]){const j=stueckBei(P,t),p=j>=0?P[j]:P[Math.min(P.length-1,-1-j)];await ladeStueck(p.stem,p.k&&p.k!==1?dehnQuelle(p):stueckIndex(p.stem,clamp(qz(p,t),0,DAUER-.1)))}\n  for(const p of P)if(p.k&&p.k!==1&&p.d1>von&&p.d0<bis)await ladeStueck(p.stem,dehnQuelle(p));"))
R.append(("async function renderOffline(von,bis,dT,ohneBlenden){\n  const sr=48000,n=Math.ceil((bis-von)*sr),P=plan(dT||{});",
          "async function renderOffline(von,bis,dT,ohneBlenden,planX){\n  const sr=48000,n=Math.ceil((bis-von)*sr),P=planX||plan(dT||{});"))
R.append(("function ansicht(t0,dur){Z.t0=t0;Z.dur=dur;clampView();basisNeu()}",
r"""// Prüf-Haken (Lauf 6): Musik und Klick genau wie beim Abspielen offline rendern – für die Messung „Klick gegen Kick/Snare“
async function renderOfflineMusik(von,bis,mitKlick){
  const sr=48000,n=Math.ceil((bis-von)*sr);ctx();await ladeStueck('mix',stueckIndex('mix',von));await ladeStueck('mix',stueckIndex('mix',Math.min(bis,DAUER-.1)));
  const off=new OfflineAudioContext(1,n,sr),bus=off.createGain();bus.connect(off.destination);const mc=AE.ctx,mb=AE.bus;AE.ctx=off;AE.bus={musik:bus,klick:bus,stimme:bus};
  try{const lauf={an:true,von,bis,schleife:false,bereich:null,hoeren:'neu',plan:null,spuren:[],ct0:0,tl0:von};const sp=spurNeu(lauf,mitKlick?'klick':'musik',von,0);sp.wrap=true;lauf.spuren.push(sp);
    let g=0;while(!sp.fertig&&g++<4000){if(spurSchritt(sp)==='warte')throw new Error('Stück fehlt')}}
  finally{AE.ctx=mc;AE.bus=mb}
  const buf=await off.startRendering();return Array.from(buf.getChannelData(0))}
function ansicht(t0,dur){Z.t0=t0;Z.dur=dur;clampView();basisNeu()}"""))
R.append(("  einrastZiel,get HAUPT(){return HAUPT},get VOR(){return VOR},grenzen};",
          "  einrastZiel,get HAUPT(){return HAUPT},get VOR(){return VOR},grenzen,renderOfflineMusik,hoerZeit,dehnung,wsola,timingPlan,lanes,diffI,get PRUEF(){return PRUEF},get AEND(){return AEND},MA,MW,get LETZT(){return LETZT},staffelSetzen,qz};"))
